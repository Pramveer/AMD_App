/**
 * @author: Pramveer
 * @date: 22nd Mar 17
 * @desc: This is file contains api to get & process waste data for patients
 */

import * as serverUtils from '../common/serverUtils.js';

//array for non fda complaint medication combinations
let nonFdaApprovedCombos = ['DAKLINZA', 'OLYSIO', 'PEGASYS', 'PEGASYS + SOVALDI', 'RIBAVIRIN', 'RIBAVIRIN + TECHNIVIE', 'SOVALDI', 'TECHNIVIE'];

let incompleteAndTreatmentChange = '',
    completeTreatment = '',
    inappropriateRegiments = '',
    inAppropriateMedsCombination = '',
    nonFdaTherapyDuration = '',
    relapsedPatients = '',
    retreatedPatients = '',
    missingHCVRNA = '',
    missingPrescriptions = '',
    noRefill = '',
    missingSVR12Patients = '',
    hepATotalPatients = '',
    hepAVaccinePatients = '',
    hepBTotalPatients = '',
    hepBVaccinePatients = '';


Meteor.syncMethods({
    'getWasteDataForPatients': (params, callBackFn) => {
        //params.duration = null;

        let whereClause = serverUtils.getQueryForAdvFilters(params),
            fdaCompliantQuery = serverUtils.getFdaCompliantQuery(params.fdaCompliant),
            rebateDiscount = params.rebateDiscount ? params.rebateDiscount : 0;
        rebateDiscount = rebateDiscount / 100,
            preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;
        //PHS_DATASET.PHS_HCV_PATIENTS , PHS_DATASET.PHS_PATIENT_MEDICATIONS 

        if (params.showPreactingAntivirals) {
            preactiveAntivalsQuery = ``;
        }

        let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
        let query = `SELECT 
                    CONCAT(patients.GENOTYPE,'_',patients.TREATMENT,
                    (case WHEN patients.CIRRHOSIS =  'Yes' THEN '_Cirrhosis' ELSE "" END) ) as subpopulation,
                    (CASE
                        WHEN patients.VIRAL_LOAD = 'NOT DETECTED' THEN null
                        else patients.VIRAL_LOAD
                    END) as VIRAL_LOAD,
                    patients.PATIENT_ID_SYNTH,
                    patients.NO_PRESCRIPTION,
                    -- patients.VIRAL_LOAD,
                    patients.RACE_DESC as race,
                    patients.GENDER_CD as GENDER,
                    patients.GENOTYPE,
                    patients.CIRRHOSIS,patients.LABS_COST,
                    patients.TREATMENT,medication.MEDICATION, medication.TREATMENT_PERIOD,
                    medication.PROVIDER_ID_SYNTH,medication.PROVIDER_ST_CD, medication.IS_PREACTING_ANTIVIRAL,
                    medication.SVR12, medication.VIRAL_LOAD,
                    medication.IS_COMPLETED, medication.IS_RELAPSED, 
                    -- patients.IS_RETREATED,
                    medication.RETREATMENT_CONSIDER as IS_RETREATED,
                    medication.IS_INAPPROPRIATE_REGIMEN,
                    (medication.PAID - (medication.PAID * ${rebateDiscount}) ) as CHARGE,
                    medication.IS_RELAPSED_CHANGE_TREATMENT as CHANGED_TREATMENT,
                    patients.IS_HAVE_HCV_RNA_PRIOR_TREATMENT,
                    medication.PRESCRIBED_TREATMENT_PERIOD,
                    patients.IS_HEP_A,
                    patients.IS_HEP_A_VACCINE,
                    patients.IS_HEP_B,
                    patients.IS_HEP_B_VACCINE
                    FROM ${dbConfig.pdatabase} as patients 
                    LEFT JOIN ${dbConfig.mdatabase} as medication
                    ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE patients.PATIENT_ID_SYNTH <> 0 AND GENOTYPE is not null AND GENOTYPE <> '1'
                    ${whereClause}`;

        // console.log('*******************WASTE QUERY********************');
        // console.log(query);

        liveDb.db.query(query, function(error, result) {
            if (error) {
                callBackFn(error, "Failure");
            } else {
                if (result.length < 1) {
                    callBackFn("error", false);
                    return;
                }
                let dataObj = {};
                dataObj['data'] = result;
                dataObj['params'] = params;
                //let stringified = JSON.stringify(prepareWasteForCategories(result));
                //let compressed_object = LZString.compress(stringified);
                //console.log("Processed & Prepared the Waste Data");

                // fetchDataForNoPrescription(dataObj, callBackFn);
                dataObj['NoPrescriptionData'] = dataObj.data;
                fetchLabAnalysisData(dataObj, callBackFn);
                //callBackFn(undefined, compressed_object);

            }
        });
    },
    /**
     * @author: Pramveer
     * @date: 23rd May 17
     * @desc: function to get the data quality data
     */
    'getDataQualityData': (params, callBackFn) => {
        try {
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            let dataObj = {};

            dataObj.countData = null;

            let query = `SELECT COUNT(1) as totalPatients, 
                        (SELECT COUNT(1) FROM ${dbConfig.pdatabase} WHERE GENOTYPE IS NULL) as nullGenotypes
                        FROM ${dbConfig.pdatabase} as patients`;

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callBackFn(error, "Failure");
                } else {
                    if (result.length < 1) {
                        callBackFn("error", false);
                        return;
                    }

                    dataObj.countData = result;

                    fetchDataForNonStdCPTCodes(dataObj, callBackFn);

                    // let stringified = JSON.stringify(result);
                    // let compressed_object = LZString.compress(stringified);
                    // callBackFn(undefined, compressed_object);
                }
            });

        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPatientsDetails': (params, callBackFn) => {
        try {
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            let dataObj = {};

            if (params) {
                patientsId = params.patientIds.join(",");
            }
            let query = `SELECT 
                            PATIENT_ID_SYNTH as patientId,
                            GENDER_CD as gender,
                            ${dbConfig.ethnicity} AS ethnicity,
                            RACE_DESC AS race,
                            GENOTYPE AS genotype,
                            TREATMENT as treatment
                            FROM
                            ${dbConfig.pdatabase}
                            WHERE
                            PATIENT_ID_SYNTH IN (${patientsId})`;

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callBackFn(error, "Failure");
                } else {
                    if (result.length < 1) {
                        callBackFn("error", false);
                        return;
                    }
                    let stringified = JSON.stringify(result);
                    let compressed_object = LZString.compress(stringified);
                    callBackFn(undefined, compressed_object);
                }
            });

        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
});


let fetchDataForNonStdCPTCodes = (dataObj, callBackFn) => {
    let query = `SELECT * FROM PHS_HCV.NON_STANDARD_CPT_CODES WHERE PHS_CPT_CODE IS NOT NULL;`;
    liveDb.db.query(query, function(error, result) {
        if (error) {
            callBackFn(error, "Failure");
        } else {
            if (result.length < 1) {
                callBackFn("error", false);
                return;
            }

            dataObj.codesData = result;

            let stringified = JSON.stringify(dataObj);
            let compressed_object = LZString.compress(stringified);
            callBackFn(undefined, compressed_object);
        }
    });

}

/*

    `//Jayesh 11 April 2017 query to fetch data for patients with no prescription.
    // let fetchDataForNoPrescription = (dataObj,callBackFn) =>{

    //     let query = ``;
    //     let whereClause = serverUtils.getQueryForAdvFiltersWithoutMedication(dataObj.params);
    //             fdaCompliantQuery = serverUtils.getFdaCompliantQuery(dataObj.params.fdaCompliant),
    //             preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

    //     if (dataObj.params.showPreactingAntivirals) {
    //         preactiveAntivalsQuery = ``;
    //     }  
    //     let dbConfig = serverUtils.getCurrentDatabaseConfiguration(dataObj.params);
    //     query = `SELECT 
    //                     CONCAT(patients.GENOTYPE,'_',patients.TREATMENT,
    //                     (case WHEN patients.CIRRHOSIS =  'Yes' THEN '_Cirrhosis' ELSE "" END) ) as subpopulation,
    //                     patients.PATIENT_ID_SYNTH,
    //                     patients.NO_PRESCRIPTION,
    //                     (CASE
    //                         WHEN patients.VIRAL_LOAD = 'NOT DETECTED' THEN null
    //                         else patients.VIRAL_LOAD
    //                     END) as VIRAL_LOAD,
    //                     patients.RACE_DESC as race,
    //                     patients.GENOTYPE,patients.CIRRHOSIS,
    //                     patients.TREATMENT,
    //                     patients.IS_HAVE_HCV_RNA_PRIOR_TREATMENT,
    //                     patients.LABS_COST,
    //                     medication.MEDICATION,
    //                     medication.PROVIDER_ID_SYNTH,medication.PROVIDER_ST_CD,
    //                     medication.TREATMENT_PERIOD,
    //                     medication.DAYS_MEDICATION,
    //                     patients.IS_HEP_A,
    //                     patients.IS_HEP_A_VACCINE,
    //                     patients.IS_HEP_B,
    //                     patients.IS_HEP_B_VACCINE
    //                     FROM ${dbConfig.pdatabase} as patients 
    //                     LEFT JOIN ${dbConfig.mdatabase} as medication
    //                     ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
    //                     WHERE patients.PATIENT_ID_SYNTH <> 0  AND GENOTYPE is not null AND GENOTYPE <> '1'
    //                     ${whereClause}`;

    //         // console.log('------------- NO Prescription -----------------');
    //         // console.log(query);

    //         liveDb.db.query(query, function(error, result) {
    //             if (error) {
    //                 callBackFn(error, "Failure");
    //             } else {
    //                 if (result.length < 1) {
    //                     callBackFn("error", false);
    //                     return;
    //                 }
    //                 dataObj['NoPrescriptionData'] = result;
    //                 //fetchDataForInappropirateRegiemnts(dataObj,callBackFn);
    //                 fetchLabAnalysisData(dataObj,callBackFn);
    //             }
    //         });
    // }
*/

//Pram (1st Jun 17) : query to get labs cost
let fetchLabAnalysisData = (dataObj, callBackFn) => {
    let params = dataObj.params,
        whereClause = serverUtils.getQueryForAdvFiltersWithoutMedication(params),
        dbConfig = serverUtils.getCurrentDatabaseConfiguration(dataObj.params);

    let query = `SELECT 
                patients.PATIENT_ID_SYNTH, lab.LAB_NM, lab.LAB_COUNT, 
                -- ELT(0.5 + RAND() * 5, 105.4, 896.0, 584.7, 357.9, 491.5) as CHARGE
                LAB_COST as CHARGE
                FROM ${dbConfig.pdatabase} as patients 
                LEFT JOIN ${dbConfig.tblLabAnalysis} as lab
                on patients.PATIENT_ID_SYNTH = lab.PATIENT_ID_SYNTH
                WHERE patients.GENOTYPE IS NOT NULL AND patients.GENOTYPE <> '1'
                ${whereClause} 
                AND patients.PATIENT_ID_SYNTH NOT IN (
                    SELECT DISTINCT PATIENT_ID_SYNTH FROM ${dbConfig.mdatabase} as medication
                );`;

    // console.log('************ LAB ANALYSIS QUERY **************');
    // console.log(query);

    liveDb.db.query(query, function(error, result) {
        if (error) {
            callBackFn(error, "Failure");
        } else {
            if (result.length < 1) {
                callBackFn("error", false);
                return;
            }
            // dataObj['labAnalysisData'] = prepareLabDataAnalysis(result);
            
            dataObj['labAnalysisData'] = result;
            fetchDataForInappropirateRegiemnts(dataObj, callBackFn);
        }
    });
}

let prepareLabDataAnalysis = (baseData) => {

    let chartdata = [];
    baseData = baseData.filter((rec) => rec.LAB_COUNT != null);
    let totalPatient = ~~serverUtils.getUniqueCount(baseData, 'PATIENT_ID_SYNTH');
    for (let lab of baseData) {
        let labs_json = {};
        labs_json['testName'] = lab.LAB_NM;
        labs_json['patientCount'] = lab.LAB_COUNT;
        labs_json['percent'] = ((~~lab.LAB_COUNT / totalPatient) * 100).toFixed(2);
        chartdata.push(labs_json);
    }
    return chartdata;
}

//Praveen  4 April 2017 query to fetch inappropriate regiments data
let fetchDataForInappropirateRegiemnts = (dataObj, callBackFn) => {

    let query = ``;
    let dbConfig = serverUtils.getCurrentDatabaseConfiguration(dataObj.params);
    let patienids = _.pluck(dataObj.data, 'PATIENT_ID_SYNTH').join(",");
    query = `Select medication.PATIENT_ID_SYNTH,medication.MEDICATION,medication.TREATMENT_PERIOD,med.PAID as CHARGE,medication.IS_INAPPROPRIATE_REGIMEN,EXPECTED_DOSAGE,MEDS_IMPROPER,GIVEN_DOSAGE,COUNT_DOSAGE,
    patients.GENOTYPE from ${dbConfig.tblRegimen} as medication 
                    JOIN ${dbConfig.pdatabase} as patients
                    ON medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                    JOIN ${dbConfig.mdatabase} med on med.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                    where medication.PATIENT_ID_SYNTH IN (${patienids})  AND GENOTYPE is not null AND GENOTYPE <> '1' AND 
                    medication.IS_INAPPROPRIATE_REGIMEN ='Yes'`;

    liveDb.db.query(query, function(error, result) {
        if (error) {
            callBackFn(error, "Failure");
        } else {
            if (result.length < 1) {
                callBackFn("error", false);
                return;
            }
            // console.log('query of 1',query);
            // Prepare ActualWasteData
            //dataObj['actualWaste'] = prepareActualWasteData(dataObj['data'], dataObj['NoPrescriptionData']);

            let filteredData = getFilteredDataByCategory(dataObj['data'], dataObj['labAnalysisData']);
            dataObj['actualWaste'] = prepareActualWasteData(filteredData, dataObj['labAnalysisData']);
            //dataObj['actualWaste'] = prepareActualWasteData(dataObj['data'], dataObj['labAnalysisData']);
            // dataObj['costOpportunity'] = uniquePatientsWithWaste(dataObj['data']);
            dataObj['costOpportunity'] = uniquePatientsWithWaste(filteredData);
            dataObj['regiments'] = getInAppropriateRegimentsData(result);
            dataObj['data'] = prepareWasteForCategories(dataObj['data'], dataObj['NoPrescriptionData']);

            //Pram (1st Jun 17): made the unused data objects to null before sending it to client
            dataObj.NoPrescriptionData = null;
            dataObj.labAnalysisData = null;

            let stringified = JSON.stringify(dataObj);
            let compressed_object = LZString.compress(stringified);
            //console.log("Processed & Prepared the Waste Data");
            callBackFn(undefined, compressed_object);
        }
    });
}

let prepareDataforCurePatients = (patientsData) => {
    // let arr = [1000382400,1000752231,1001419651,1002332430,1002481200,1003674550,1004342738,1004528340,1005301546,1006056518];
    // let filteredData = _.where(patientsData,{ PATIENT_ID_SYNTH : arr});
    return patientsData;
}
let prepareWasteForCategories = (patientsData, noPrescriptionData) => {
    let finalData = {};

    // patientsData = _.filter(patientsData , (rec) => {
    //     return rec.TREATMENT_PERIOD < 84;
    // });

    // let subpopulation = _.groupBy(noPrescriptionData, 'subpopulation');
    // subpopulation = Object.keys(subpopulation)

    let patientithoutMeds = _.filter(noPrescriptionData, (rec) => {
        return rec.MEDICATION == null;
    });

    finalData.withoutMedication = getPatientProviderCount(patientithoutMeds);


    patientsData = _.filter(patientsData, (rec) => {
        return rec.MEDICATION != null;
    });

    // let filteredData = _.filter(noPrescriptionData, (rec) => {
    //     return rec.NO_PRESCRIPTION != null;
    // });

    // filteredData = _.filter(filteredData, (rec) => {
    //     return rec.NO_PRESCRIPTION.toUpperCase() == 'YES';
    // });

    // finalData.noPrescription = getPatientProviderCount(filteredData);

    finalData.withMedication = getPatientProviderCount(patientsData);

    let groupedData = _.groupBy(patientsData, 'subpopulation');
    let noPrescriptionGroupedData = _.groupBy(noPrescriptionData, 'subpopulation');

    let wasteCategoriesData = {};


    // for (let key in subpopulation) {
    //     let keys = subpopulation[key];
    //     //check for no prescription does not have subpopulation category
    //     if (!noPrescriptionGroupedData[keys]) {
    //         noPrescriptionGroupedData[keys] = [];
    //     }

    //     if (!groupedData[keys]) {
    //         groupedData[keys] = [];
    //     }

    //     wasteCategoriesData[keys] = prepareWasteData(groupedData[keys], noPrescriptionGroupedData[keys]);
    // }


    finalData.wasteCategoriesData = wasteCategoriesData;
    finalData.wasteChartsData = getChartDataForWaste(patientsData, noPrescriptionData);
    finalData.providers = getDataForProviders(patientsData);
    finalData.categoriesData = prepareWasteData(patientsData, noPrescriptionData);;
    //data for cure failure rate chart 
    finalData.care = prepareCareFailureChartDataChart(patientsData, noPrescriptionData);
        return finalData;
}


let getDataForProviders = (dataArray) => {
    let dataObj = {};

    dataObj = getPatientProviderCount(dataArray);

    let filterData = _.filter(dataArray, (rec) => {
        return rec.SVR12 == null;
    });

    let innerData = getPatientProviderCount(filterData);
    innerData.totalCost = getCostForPatients(filterData);

    dataObj.noSvrData = innerData;
    return dataObj;
}

/**
 * @author: Pramveer
 * @date: 22nd Mar 17
 * @desc: function to prepare final object for waste
 */
// let prepareWasteData = (dataArray, noPrescriptionData) => {
//     let finalObj = {};
//     let filterData = dataArray;

//     let totalPatientsStatus = getPatientProviderCount(dataArray);

//     //total patients filters
//     finalObj.patientCount = totalPatientsStatus.patientCount;
//     finalObj.providerCount = totalPatientsStatus.providerCount;
//     finalObj.overAllCost = getCostForPatients(dataArray);

//     finalObj.estimatedWasteCost = getEstimatedWasteCost(dataArray);

//     //filter patients with completed status
//     filterData = _.filter(dataArray, (rec) => {
//         return rec.IS_COMPLETED == 'Yes';
//     });
//     //data for patients with completed status
//     finalObj.completed = {
//         patientCount: totalPatientsStatus.patientCount,
//         providerCount: totalPatientsStatus.providerCount,
//         innerData: getSVRStatusDataForPatients(filterData)
//     };

//     //filter patients with discontinued status
//     filterData = _.filter(dataArray, (rec) => {
//         return rec.IS_COMPLETED == 'No';
//     });

//     //data for patients with discontinued status
//     // finalObj.discontinued = getPatientProviderCount(filterData);
//     // finalObj.discontinued.totalCost = getCostForPatients(filterData),
//     // finalObj.discontinued.innerData =  getSVRStatusDataForPatients(filterData);

//     // Split patients in Treatment Change and Incomplete Treatment.
//     let filteredPatients = getTreatmentIncompleteAndTreatmentChangePatients(filterData);
//     // discontinued Patients
//     finalObj.discontinued = getPatientProviderCount(filteredPatients.incompleteTreatment);
//     finalObj.discontinued.totalCost = getCostForPatients(filteredPatients.incompleteTreatment),
//         finalObj.discontinued.innerData = getSVRStatusDataForPatients(filteredPatients.incompleteTreatment);

//     // Patients with Treatmet Change
//     finalObj.treatmentChange = getPatientProviderCount(filteredPatients.treatmentChange);
//     finalObj.treatmentChange.totalCost = getCostForPatients(filteredPatients.treatmentChange),
//         finalObj.treatmentChange.innerData = getSVRStatusDataForPatients(filteredPatients.treatmentChange);



//     finalObj.nonfdaApprovedCombos = getDataForNonFdaApprovedCombos(dataArray);

//     finalObj.relapsedData = getRelapsedPatientsData(dataArray);

//     finalObj.svrData = getSVRStatusDataForPatients(dataArray);

//     finalObj.therapyDuration = getTherapyDurationData(dataArray);

//     finalObj.regimenData = getInappropriateRegimenData(dataArray);

//     finalObj.retreatmentData = getRetreatmentData(dataArray);

//     finalObj.hcvRNA = getHCVRNAData(dataArray);
//     finalObj.hcvRNARelapsed = getHCRNARelapsed(dataArray);
//     finalObj.hcvRNARetreated = getHCRNARetreated(dataArray);
//     finalObj.hcvNotFillingNextPrescription = getNotFillingNextPrescriptionData(dataArray);
//     // set no prescription data
//     finalObj.hcvNoPrescription = getNoPrescriptionData(noPrescriptionData);

//     // No Prescriptio should be "Null"- patients with no Medication and No viral load
//     finalObj.noMedicationNoViralLoad = prepareDataForNewSection(noPrescriptionData);

//     // viral load should be null and medication null -- patients with no Medication and No viral load  or ( No Medication No SVR 12 )
//     finalObj.noMedicationNosvr12 = prepareDataForNewSection(noPrescriptionData, 'medicationOnly');

//     // viral load should be null and medication null --   or (NO HCV RNA - No Medication )
//     finalObj.nohcvRnaNoMedication = prepareDataForNewSection(noPrescriptionData, 'viralLoad');

//     finalObj.hepAB = prepareHepABPatientsData(noPrescriptionData);

//     return finalObj;
// }

let prepareHepABPatientsData = (dataArray) => {
   
    let hepATotal = [];
    let hepAVaccine = [];
    let hepBTotal = [];
    let hepBVaccine = [];

    let filteredData = [];
    if(dataArray){
        hepATotal = _.filter(dataArray, (rec) => {
            return rec.IS_HEP_A == 'Yes';
        });

        hepAVaccine = _.filter(hepATotal, (rec) => {
            return rec.IS_HEP_A_VACCINE == 'Yes';
        });

        hepBTotal = _.filter(dataArray, (rec) => {
            return rec.IS_HEP_B == 'Yes';
        });

        hepBVaccine = _.filter(hepBTotal, (rec) => {
            return rec.IS_HEP_B_VACCINE == 'Yes';
        });

    } else {
        // Added By Yuvraj (Taking value from global variable.)
        hepATotal = hepATotalPatients;
        hepAVaccine = hepAVaccinePatients;
        hepBTotal = hepBTotalPatients;
        hepBVaccine = hepBVaccinePatients;;
    }

   

    return {
        // HEP_A_TOTAL_PATIENT : _.uniq(_.pluck(hepATotal, 'PATIENT_ID_SYNTH')).length,
        // HEP_B_TOTAL_PATIENT : _.uniq(_.pluck(hepBTotal, 'PATIENT_ID_SYNTH')).length,
        // HEP_A_VACCINE : _.uniq(_.pluck(hepAVaccine, 'PATIENT_ID_SYNTH')).length,
        // HEP_B_VACCINE : _.uniq(_.pluck(hepBVaccine, 'PATIENT_ID_SYNTH')).length

        HEP_A_TOTAL_PATIENT: serverUtils.getUniqueCount(hepATotal, 'PATIENT_ID_SYNTH'),
        HEP_B_TOTAL_PATIENT: serverUtils.getUniqueCount(hepBTotal, 'PATIENT_ID_SYNTH'),
        HEP_A_VACCINE: serverUtils.getUniqueCount(hepAVaccine, 'PATIENT_ID_SYNTH'),
        HEP_B_VACCINE: serverUtils.getUniqueCount(hepBVaccine, 'PATIENT_ID_SYNTH')
    }
}

let prepareDataForNewSection = (dataArray, filterFlag) => {
    let dataObj = {},
        filterRecord = 'NO_PRESCRIPTION',
        filterValue = null;

    if (filterFlag == 'viralload') {
        filterRecord = 'VIRAL_LOAD';
        filterValue = null;
    } else if (filterFlag == 'medicationOnly') {
        filterRecord = 'MEDICATION';
        filterValue = null;
    }

    let filterData = _.filter(dataArray, (rec) => {
        return rec.MEDICATION == null;
    });

    filterData = _.filter(filterData, (rec) => {
        return rec[filterRecord] == filterValue;
    });

    dataObj = getPatientProviderCount(filterData);
    // dataObj.totalCost = getCostForPatients(filterData, true);

    return dataObj;
}


let getSVRStatusDataForPatients = (dataArray) => {
    let innerObj = {},
        patientsWithSVR = {},
        patientsWithoutSVR = {};

    let filterData = [];
    if(dataArray) {
        //*********** Prepare data for patients with SVR Data ******************
        // filterData = _.filter(dataArray, (rec) => {
        //     return rec.SVR12 != null;
        // });

        //append patient/provider count for patients with SVR12
        // patientsWithSVR = getPatientProviderCount(filterData);
        // patientsWithSVR.cureStatus = getCuredUncuredPatientsCount(filterData);
         patientsWithSVR = getPatientProviderCount(missingSVR12Patients);
        patientsWithSVR.cureStatus = getCuredUncuredPatientsCount(missingSVR12Patients);
        // patientsWithSVR.totalCost = getCostForPatients(filterData);

        //*********** Prepare data for patients without SVR Data ******************

        filterData = _.filter(dataArray, (rec) => {
            return rec.SVR12 == null;
        });
    } else {
        filterData = missingSVR12Patients;
    }
    

    //append patient/provider count for patients without SVR12
    patientsWithoutSVR = getPatientProviderCount(filterData);
    patientsWithoutSVR.totalCost = getCostForPatients(filterData);
    patientsWithoutSVR.cureStatus = null;

    return innerObj = {
        patientsWithSVR: patientsWithSVR,
        patientsWithoutSVR: patientsWithoutSVR
    }
}


let getRelapsedPatientsData = (dataArray, isMain) => {
    let relapsedData = {};
    let filteredData = [];
    if(dataArray){
        filterData = _.filter(dataArray, (rec) => {
            return rec.IS_RELAPSED == 'Yes';
        });
    } else {
        // Added By Yuvraj (Taking value from global variable.)
       filterData = relapsedPatients;
    }
    
    //TODO process data for relapsed patient
    relapsedData = getPatientProviderCount(filterData);
    // relapsedData.totalCost = getCostForPatients(filterData);
    relapsedData.innerData = getInnerDataForRelapsedPatient(filterData);

    return relapsedData;
}

let getCuredUncuredPatientsCount = (dataArray) => {
    let dataObj = {};
    let filterData = dataArray;

    //filter for cured patients
    filterData = _.filter(dataArray, (rec) => {
        return rec.SVR12 == 1;
    });
    dataObj.cured = getPatientProviderCount(filterData);
    dataObj.cured.totalCost = getCostForPatients(filterData);


    filterData = _.filter(dataArray, (rec) => {
        return rec.SVR12 == 0;
    });
    dataObj.unCured = getPatientProviderCount(filterData);
    dataObj.unCured.totalCost = getCostForPatients(filterData);

    return dataObj;
}

let getCostForPatients = (dataArray, isLabsCost) => {

    let costKey = isLabsCost ? 'LABS_COST' : 'CHARGE';

    let filterData = _.filter(dataArray, (rec) => {
        return rec[costKey] != null;
    });

    // Not Considering the cured Patietns.
    filterData = _.filter(filterData, (rec) => {
        return rec.SVR12 == null || rec.SVR12 == 0;
    });

    return _.pluck(filterData, costKey).sum();
}
let getCostForPatientsWithNoPrescription = (dataArray) => {
    let filterData = _.filter(dataArray, (rec) => {
        return rec.LABS_COST != null;
    });

    return _.pluck(filterData, 'LABS_COST').sum();
}

let getInnerDataForRelapsedPatient = (dataArray) => {
    //TODO:  Process & calculation for relapsed patient for change in treatment & completed treatment
    let relapsedInnerData = {};
    let filterData = dataArray;


    filterData = _.filter(dataArray, (rec) => {
        return rec.IS_COMPLETED == 'Yes';
    });
    relapsedInnerData.completedTreatment = getPatientProviderCount(filterData);
    relapsedInnerData.completedTreatment.totalCost = getCostForPatients(filterData);

    filterData = _.filter(dataArray, (rec) => {
        return rec.CHANGED_TREATMENT == 'Yes';
    });
    relapsedInnerData.changedTreatment = getPatientProviderCount(filterData);
    relapsedInnerData.changedTreatment.totalCost = getCostForPatients(filterData);

    filterData = _.filter(dataArray, (rec) => {
        return rec.SVR12 != null;
    });
    relapsedInnerData.patientsWithSVR = getPatientProviderCount(filterData);
    relapsedInnerData.patientsWithSVR.totalCost = getCostForPatients(filterData);

    filterData = _.filter(dataArray, (rec) => {
        return rec.SVR12 == null;
    });
    relapsedInnerData.patientsWithoutSVR = getPatientProviderCount(filterData);
    relapsedInnerData.patientsWithoutSVR.totalCost = getCostForPatients(filterData);


    return relapsedInnerData;
}

//function to prepare data for the therapy duration
let getTherapyDurationData = (dataArray) => {
    let durationObj = {};
    let filteredData = [];
    if(dataArray){
        // let fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();

        // //convert the string into Array
        // fdaCompliantPeriods = fdaCompliantPeriods.split(',');

        // //filter all non fda complaint records
        // filteredData = _.filter(dataArray, (rec) => {
        //     return fdaCompliantPeriods.indexOf(rec.TREATMENT_PERIOD.toString()) == -1;
        // });
        filteredData = nonFdaTherapyDuration;
    } else {
        // Added By Yuvraj (Taking value from global variable.)
       filteredData = nonFdaTherapyDuration;
    }


    durationObj = getPatientProviderCount(filteredData);
    durationObj.totalCost = getCostForPatients(filteredData);
    //durationObj.innerData = getSVRStatusDataForPatients(filteredData);


    return durationObj;
}

//function to prepare data for retreatment 
let getRetreatmentData = (dataArray) => {
    let retreatObj = {};

    let filteredData = [];
    if(dataArray){
        filteredData = _.filter(dataArray, (rec) => {
            return rec.IS_RETREATED == 'YES';
        });

    } else {
        // Added By Yuvraj (Taking value from global variable.)
       filteredData = retreatedPatients;
    }

    let refinedData = [];

    // Why we are doing it??  
    let groupedData = _.groupBy(filteredData, 'PATIENT_ID_SYNTH');

    for (let keys in groupedData) {
        let pdata = groupedData[keys];

        for (let j = 0; j < pdata.length; j++) {
            refinedData.push(pdata[j]);
        }
    }

    retreatObj = getPatientProviderCount(refinedData);
    retreatObj.totalCost = getCostForPatients(refinedData);
    // retreatObj.innerData = getSVRStatusDataForPatients(refinedData);

    return retreatObj;
}

//function to prepare data for inappropriate regimens
let getInappropriateRegimenData = (dataArray) => {
    let regimenObj = {};
    let filteredData = [];
    if(dataArray){
        filteredData = _.filter(dataArray, (rec) => {
            return rec.IS_INAPPROPRIATE_REGIMEN != null;
        });

        filteredData = _.filter(filteredData, (rec) => {
            return rec.IS_INAPPROPRIATE_REGIMEN.toUpperCase() == 'YES';
        });

    } else {
        // Added By Yuvraj (Taking value from global variable.)
       filteredData = inappropriateRegiments;
    }

    regimenObj = getPatientProviderCount(filteredData);
    regimenObj.totalCost = getCostForPatients(filteredData);
    // regimenObj.innerData = getSVRStatusDataForPatients(filteredData);

    return regimenObj;
}

//function to get hcv rna data for prior treatment
let getHCVRNAData = (dataArray) => {
    let hcvrnaObj = {};

    let filteredData = [];
    if(dataArray){
        filteredData = _.filter(dataArray, (rec) => {
            return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT != null;
        });

        filteredData = _.filter(filteredData, (rec) => {
            return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT.toUpperCase() == 'NO';
        });

    } else {
        // Added By Yuvraj (Taking value from global variable.)
       filteredData = missingHCVRNA;
    }

    hcvrnaObj = getPatientProviderCount(filteredData);
    // hcvrnaObj.totalCost = getCostForPatients(filteredData);

    return hcvrnaObj;
}

//function to get hcv rna Relapsed data for prior treatment
let getHCRNARelapsed = (dataArray) => {
    let hcvrnaObj = {};

    let filteredData = _.filter(dataArray, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT != null && rec.IS_RELAPSED != null;
    });

    filteredData = _.filter(filteredData, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT.toUpperCase() == 'NO' && rec.IS_RELAPSED.toString().toUpperCase() == 'YES';
    });

    hcvrnaObj = getPatientProviderCount(filteredData);
    hcvrnaObj.totalCost = getCostForPatients(filteredData);

    return hcvrnaObj;
}

//function to get hcv rna Retreated data for prior treatment
let getHCRNARetreated = (dataArray) => {
    let hcvrnaObj = {};

    let filteredData = _.filter(dataArray, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT != null && rec.IS_RETREATED != null;
    });

    filteredData = _.filter(filteredData, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT.toUpperCase() == 'NO' && rec.IS_RETREATED.toString().toUpperCase() == 'YES';
    });

    hcvrnaObj = getPatientProviderCount(filteredData);
    hcvrnaObj.totalCost = getCostForPatients(filteredData);

    return hcvrnaObj;
}
let getEstimatedWasteCost = (dataArray) => {
    let wasteCost = 0;

    let retreatedPatients = _.where(dataArray, { IS_RETREATED: 'YES' }),
        otherPatients = _.where(dataArray, { IS_RETREATED: 'NO' });

    //loop for all patients 
    for (let i = 0; i < otherPatients.length; i++) {
        if (isPatientConsideredForWaste(otherPatients[i])) {
            wasteCost += otherPatients[i].CHARGE;
        }
    }

    let groupedData = _.groupBy(retreatedPatients, 'PATIENT_ID_SYNTH');

    let retreatedCost = 0;

    for (let keys in groupedData) {
        let pData = groupedData[keys];

        for (let j = 1; j < pData.length; j++) {
            retreatedCost += pData[j].CHARGE
        }

    }

    return wasteCost + retreatedCost;
}

//function to determine whether a patient should be considered for cost or not 
let isPatientConsideredForWaste = (patientObj) => {

    if (patientObj.IS_COMPLETED == 'No') {
        return true;
    }
    if (patientObj.IS_RELAPSED == 'YES') {
        return true;
    }
    if (patientObj.IS_INAPPROPRIATE_REGIMEN == 'Yes') {
        return true;
    }
    if (patientObj.IS_HAVE_HCV_RNA_PRIOR_TREATMENT == 'NO') {
        return true;
    }
    if (!patientObj.SVR12) {
        return true;
    }
    if (patientObj.IS_RETREATED == 'YES') {
        return true;
    }

    return false;
}

//function to prepare chart data for waste
let getChartDataForWaste = (dataArray, noPrescriptionData) => {
    let chartObj = {};
    let filterData = dataArray;

    //CHARTS FOR NULL SVR12 PATIENTS
    // filterData = _.filter(dataArray, (rec) => {
    //     //return rec.SVR12 == null && rec.IS_COMPLETED == 'Yes';
    //     return rec.SVR12 == null;
    // });

    chartObj.notFillingNextPrescriptionData = null;
    //chartObj.providersByStateForNullSVR12 = null;
    chartObj.providerCharts = null;

    //chartObj.providersByStateForNullSVR12 = getProvidersByStateDistribution(filterData);

    // chartObj.providerCharts = prepareChartsForProviders(filterData);
     chartObj.providerCharts = prepareChartsForProviders(missingSVR12Patients);


    chartObj.genotypeDistributionForNullSVR12 = getPatientCountByGenotype(missingSVR12Patients);
    chartObj.patientsSVRNull = { "patientIds": serverUtils.getUniqueArray(_.pluck(missingSVR12Patients, 'PATIENT_ID_SYNTH')) };
    chartObj.therapyDistributionForNullSVR12 = getPatientCountByTherapyWeeks(missingSVR12Patients);

    //data for in appropriate regiemnts section data
    chartObj.regimentsSectionData = getInAppropriateRegimentsData(dataArray);

    //CHARTS FOR RELAPSED PATIENTS
    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_RELAPSED == 'Yes';
    // });

    chartObj.therapyDistributionForRelapsed = getPatientCountByTherapyWeeks(relapsedPatients);
    chartObj.treatmentDistributionForRelapsed = getTreatmentDistributionData(relapsedPatients);
    chartObj.patientsRelapsed = { "patientIds": serverUtils.getUniqueArray(_.pluck(relapsedPatients, 'PATIENT_ID_SYNTH')) };

    chartObj.therapyDurationData = getDataForTherapyDuration(dataArray);

    chartObj.discontinuedData = getDiscontinuedChartData(dataArray);

    chartObj.treatmentChangeData = getTreatmentChangeChartData(dataArray);

    chartObj.retreatedChartsData = getRetreatedChartsData(dataArray);

    chartObj.medicationSwitch = getMedicationSwitchData(dataArray);

    chartObj.nonfdaCombosData = getNonFdaCombosData(dataArray);
    //no prescription chart data
    chartObj.noPrescritionData = getNoPrescritionChartData(noPrescriptionData);

    chartObj.nonHcvRnaData = getNonHcvRnaChartData(dataArray);

    chartObj.notFillingNextPrescriptionData = prepareFillingNextPrescriptionChartData(dataArray);


    let hepATotal = _.filter(noPrescriptionData, (rec) => {
        return rec.IS_HEP_A == 'Yes';
    });

    let hepBTotal = _.filter(noPrescriptionData, (rec) => {
        return rec.IS_HEP_B == 'Yes';
    });

    chartObj.hepAGenotypeChart = getHepABDistributionChart(hepATotal, 'GENOTYPE');
    chartObj.hepAPatientIds = { "patientIds": serverUtils.getUniqueArray(_.pluck(hepATotal, 'PATIENT_ID_SYNTH')) };

    chartObj.hepBGenotypeChart = getHepABDistributionChart(hepBTotal, 'GENOTYPE');
    chartObj.hepBPatientIds = { "patientIds": serverUtils.getUniqueArray(_.pluck(hepBTotal, 'PATIENT_ID_SYNTH')) };


    return chartObj;
}

/**
 * @author: Pramveer
 * @date: 22nd May 17
 * @desc: function to prepare charts for provider section
 */
let prepareChartsForProviders = (dataArray) => {
    let chartObj = {},
        filterData = [];

    filterData = _.filter(dataArray, (rec) => {
        return rec.PROVIDER_ST_CD != null && rec.PROVIDER_ST_CD != '';
    });
    chartObj.providersByStateForNullSVR12 = getProvidersByStateDistribution(filterData);
    chartObj.psvr12null = serverUtils.getUniqueArray(_.pluck(filterData, 'PATIENT_ID_SYNTH'));
    //filterData = dataArray;
    chartObj.drugDistribution = getProviderDrugDistributionData(filterData);
    chartObj.pdrugdistr = serverUtils.getUniqueArray(_.pluck(filterData, 'PATIENT_ID_SYNTH'));

    filterData = _.filter(dataArray, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT == 'No';
    });
    chartObj.nonhcvPriorTreatment = getProviderNonHcvTreatmentData(filterData);
    chartObj.nonhcvpropatient = serverUtils.getUniqueArray(_.pluck(filterData, 'PATIENT_ID_SYNTH'));
    //filterData = dataArray;
    chartObj.nonFdaCompliantPrescriptions = getProviderNonFdaPrescriptions(filterData);
    chartObj.nonfdaCompatient = serverUtils.getUniqueArray(_.pluck(filterData, 'PATIENT_ID_SYNTH'));

    return chartObj;
}

let getProvidersByStateDistribution = (dataArray) => {

    let filteredData = _.groupBy(dataArray, 'PROVIDER_ST_CD');

    let chartData = [];

    for (let states in filteredData) {
        let obj = {};

        obj.code = states.toUpperCase();
        //obj.value = filteredData[states].length;
        // obj.value = _.uniq(_.pluck(filteredData[states], 'PROVIDER_ID_SYNTH')).length;
        obj.value = serverUtils.getUniqueCount(filteredData[states], 'PROVIDER_ID_SYNTH');

        chartData.push(obj);
    }

    return chartData;

}

/**
 * @author: Pramveer
 * @date: 22nd May 17
 * @desc: function to get provider by drug distribution
 */
let getProviderDrugDistributionData = (dataArray) => {
    let chartData = [];

    let groupedData = _.groupBy(dataArray, 'MEDICATION');

    for (let keys in groupedData) {
        let json = {},
            pData = groupedData[keys];

        json.name = getDrugAbbr(keys);
        json.fullName = keys;
        // json.y = _.uniq(_.pluck(pData, 'PROVIDER_ID_SYNTH')).length;
        json.y = serverUtils.getUniqueCount(pData, 'PROVIDER_ID_SYNTH');
        json.patients = pData.length;
        json.cost = getFormattedCost(pData);

        chartData.push(json);
    }

    return chartData;
}

/**
 * @author: Pramveer
 * @date: 22nd May 17
 * @desc: function to
 */
let getProviderNonHcvTreatmentData = (dataArray) => {
    let chartData = [];

    let groupedData = _.groupBy(dataArray, 'TREATMENT_PERIOD');

    for (let keys in groupedData) {
        let json = {};

        json.name = keys;
        // json.y = _.uniq(_.pluck(groupedData[keys], 'PROVIDER_ID_SYNTH')).length;
        json.y = serverUtils.getUniqueCount(groupedData[keys], 'PROVIDER_ID_SYNTH');
        json.patients = groupedData[keys].length;
        json.cost = getFormattedCost(groupedData[keys]);

        chartData.push(json);
    }

    return chartData;
}

/**
 * @author: Pramveer
 * @date: 22nd May 17
 * @desc: function to get data by non fda medications wise for providers
 */
let getProviderNonFdaPrescriptions = (dataArray) => {
    let chartData = [];

    let filteredData = _.filter(dataArray, (rec) => {
        return nonFdaApprovedCombos.indexOf(rec.MEDICATION) > -1;
    });

    let groupedData = _.groupBy(filteredData, 'MEDICATION');

    for (let keys in groupedData) {
        let json = {};

        json.name = getDrugAbbr(keys);
        json.fullName = keys;
        // json.y = _.uniq(_.pluck(groupedData[keys], 'PROVIDER_ID_SYNTH')).length;
        json.y = serverUtils.getUniqueCount(groupedData[keys], 'PROVIDER_ID_SYNTH');
        json.patients = groupedData[keys].length;
        json.cost = getFormattedCost(groupedData[keys]);

        chartData.push(json);
    }

    return chartData;
}

let getPatientCountByGenotype = (dataArray, isLabsCost) => {
    let data = [];

    let groupedData = _.groupBy(dataArray, 'GENOTYPE');

    for (let keys in groupedData) {
        let obj = {};

        obj.name = keys;
        //obj.y = groupedData[keys].length;
        // obj.y = _.uniq(_.pluck(groupedData[keys], 'PATIENT_ID_SYNTH')).length;
        obj.y = serverUtils.getUniqueCount(groupedData[keys], 'PATIENT_ID_SYNTH');
        obj.count = obj.y;
        obj.cost = getFormattedCost(groupedData[keys], isLabsCost);
        obj.color = serverUtils.genotypeFixedColors(keys);
        data.push(obj);
    }

    //sort data on genotype name (1a, 1b, 2, 3, 4)

    data.sort((a, b) => a.name.replace(/\D+/g, '') - b.name.replace(/\D+/g, ''));

    return data;
}

let getPatientCountByTreatmentPeriod = (dataArray) => {
    let data = [];
    let groupedData = _.groupBy(dataArray, 'TREATMENT_PERIOD');
    for (let keys in groupedData) {
        let obj = {};

        obj.name = keys;
        //obj.y = groupedData[keys].length;
        // obj.y = _.uniq(_.pluck(groupedData[keys], 'PATIENT_ID_SYNTH')).length;
        obj.y = serverUtils.getUniqueCount(groupedData[keys], 'PATIENT_ID_SYNTH');
        obj.cost = getFormattedCost(groupedData[keys]);
        obj.color = serverUtils.getColorByValue(keys);
        data.push(obj);
    }

    return data;
}

let getPatientCountByTherapyWeeks = (dataArray) => {
    let data = [];

    let groupedData = _.groupBy(dataArray, 'TREATMENT_PERIOD');

    for (let keys in groupedData) {
        let obj = {};

        obj.name = keys;
        //obj.y = groupedData[keys].length;
        // obj.y = _.uniq(_.pluck(groupedData[keys], 'PATIENT_ID_SYNTH')).length;
        obj.y = serverUtils.getUniqueCount(groupedData[keys], 'PATIENT_ID_SYNTH');
        obj.cost = getFormattedCost(groupedData[keys]);
        obj.color = serverUtils.getColorByValue(keys);
        data.push(obj);
    }

    return data;
}

let getTreatmentDistributionData = (dataArray) => {
    let chartData = [],
        drilldownData = [];

    let groupedData = _.groupBy(dataArray, 'TREATMENT');

    for (let keys in groupedData) {
        let data = groupedData[keys];
        let json = {};

        json.name = keys;
        //json.y = data.length;
        // json.y = _.uniq(_.pluck(data, 'PATIENT_ID_SYNTH')).length;
        json.y = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
        json.cost = getFormattedCost(data);
        json.drilldown = keys + '_DrillDown';

        chartData.push(json);
        drilldownData.push(prepareDrillDownData(keys, data));

    }

    return {
        data: chartData,
        drilldown: drilldownData
    };

    //function to prepare drilldown data
    function prepareDrillDownData(drillKey, baseData) {
        let obj = {};
        obj.name = 'Genotype';
        obj.id = drillKey + '_DrillDown';
        obj.data = getPatientCountByGenotype(baseData);

        return obj;
    }
}


let getPatientProviderCount = (dataArray) => {

    return {
        //patientCount: dataArray.length,
        // patientCount: _.uniq(_.pluck(dataArray,'PATIENT_ID_SYNTH')).length,
        patientCount: serverUtils.getUniqueCount(dataArray, 'PATIENT_ID_SYNTH'),
        // providerCount: _.uniq(_.pluck(dataArray,'PROVIDER_ID_SYNTH')).length
        providerCount: serverUtils.getUniqueCount(dataArray, 'PROVIDER_ID_SYNTH'),
        patientIds: serverUtils.getUniqueArray(_.pluck(dataArray, 'PATIENT_ID_SYNTH')),
    };
}

let getDataForTherapyDuration = (dataArray) => {
    // let fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();

    // //convert the string into Array
    // fdaCompliantPeriods = fdaCompliantPeriods.split(',');

    // //filter all non fda complaint records
    // let filteredData = _.filter(dataArray, (rec) => {
    //     return fdaCompliantPeriods.indexOf(rec.TREATMENT_PERIOD.toString()) == -1;
    // });

    let chartData = [],
        drilldownData = [];

    let groupedData = _.groupBy(nonFdaTherapyDuration, 'GENOTYPE');

    for (let keys in groupedData) {
        let data = groupedData[keys];
        let json = {};

        json.name = keys;
        //json.y = data.length;
        // json.y =  _.uniq(_.pluck(data,'PATIENT_ID_SYNTH')).length;
        json.y = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
        json.cost = getFormattedCost(data);
        json.drilldown = keys + '_DrillDown';

        chartData.push(json);
        drilldownData.push(prepareTherapyDrillDownData(keys, data));

    }

    return {
        data: chartData,
        drilldown: drilldownData,
        patientIds: serverUtils.getUniqueArray(_.pluck(nonFdaTherapyDuration, 'PATIENT_ID_SYNTH'))
    };

    //function to prepare drilldown data
    function prepareTherapyDrillDownData(drillKey, baseData) {
        let obj = {};
        obj.name = 'Treatment Period';
        obj.id = drillKey + '_DrillDown';
        obj.data = getPatientCountByTherapyWeeks(baseData);

        return obj;
    }

}

let getDiscontinuedChartData = (dataArray) => {
    let chartObj = {};

    let filterData = _.filter(dataArray, (rec) => {
        return rec.IS_COMPLETED == 'No';
    });


    let filteredPatients = getTreatmentIncompleteAndTreatmentChangePatients(filterData);
    // discontinued Patients
    filterData = filteredPatients.incompleteTreatment;

    chartObj.genotypeDistribution = getPatientCountByGenotype(filterData);
    chartObj.treatmentPeriodDistribution = getPatientCountByTreatmentPeriod(filterData);
    chartObj.patientIds = serverUtils.getUniqueArray(_.pluck(filterData, 'PATIENT_ID_SYNTH'))
    return chartObj;
}

let getTreatmentChangeChartData = (dataArray) => {
    let chartObj = {};

    let filterData = _.filter(dataArray, (rec) => {
        return rec.IS_COMPLETED == 'No';
    });


    let filteredPatients = getTreatmentIncompleteAndTreatmentChangePatients(filterData);
    // treatment Change Patients
    filterData = filteredPatients.treatmentChange;

    chartObj.genotypeDistribution = getPatientCountByGenotype(filterData);
    chartObj.treatmentPeriodDistribution = getPatientCountByTreatmentPeriod(filterData);
    chartObj.patientIds = serverUtils.getUniqueArray(_.pluck(filterData, 'PATIENT_ID_SYNTH'));

    return chartObj;
}



let getRetreatedChartsData = (dataArray) => {
    let chartObj = {};

    // let filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_RETREATED == 'YES';
    // });

    chartObj.genotypeDistribution = getPatientCountByGenotype(retreatedPatients);
    chartObj.treatmentPeriodDistribution = getPatientCountByTreatmentPeriod(retreatedPatients);
    chartObj.patientIds = serverUtils.getUniqueArray(_.pluck(retreatedPatients, 'PATIENT_ID_SYNTH'));

    return chartObj;
}

let getMedicationSwitchData = (dataArray) => {

    let patientsSwitchData = [];

    let patientsGrp = _.groupBy(dataArray, 'PATIENT_ID_SYNTH');

    //iterate for each patient and consider only patients with medication data more than 1
    for (let keys in patientsGrp) {
        let json = {};

        let pdata = patientsGrp[keys];

        if (pdata.length > 1) {
            json.switchCount = pdata.length;
            json.patientsData = pdata;
            patientsSwitchData.push(json);
        }

        //data will be like below

        // [{  
        //     switchCount: 2
        //     patientsData: Array of patients Data
        // }]

    }
    let switchGrps = {};
    let genoDataLength = _.pluck(dataArray, 'GENOTYPE').length;
    //group the above prepared data on the basis of switch count
    switchGrps = _.groupBy(patientsSwitchData, 'switchCount');

    //data will be like { 2: Array of above grouped data, 3: Array of above grouped data}


    let chartData = [],
        drillDownData = [];

    let totalP = patientsSwitchData.length;
    //loop for each switch count 
    for (let key in switchGrps) {
        let jsonObj = {};
        let refinedData = getCompleteDataForSwitch(switchGrps[key]);
        //console.log(key);
        jsonObj.name = key;
        let len = switchGrps[key].length
        jsonObj.y = (len / totalP) * 100;
        jsonObj.count = len;
        jsonObj.cost = getFormattedCost(refinedData);
        jsonObj.drilldown = key + '_DrillDown';
        chartData.push(jsonObj);
        drillDownData.push(prepareTherapyDrillDownData(key, refinedData, true));
    }


    function getCompleteDataForSwitch(data) {
        return _.flatten(_.pluck(data, 'patientsData'));
    }

    //function to prepare drilldown data
    function prepareTherapyDrillDownData(drillKey, baseData, genoDataLength) {
        let obj = {};
        obj.name = 'Genotype';
        obj.id = drillKey + '_DrillDown';
        if (genoDataLength) {
            obj.data = getPatientCountByGenotypeRegimentMedication(baseData);
            obj.name = 'Medication';
        } else {
            obj.data = getPatientCountByGenotypeRegiment(baseData);
        }

        return obj;
    }

    return {
        data: chartData,
        drilldown: drillDownData
    };
}

let getNonFdaCombosData = (dataArray) => {
    let finalData = {};
    let chartData = [];

    //let nonFdaApprovedCombos = ['DAKLINZA', 'EPCLUSA', 'EPCLUSA + RIBAVIRIN', 'OLYSIO', 'PEGASYS', 'PEGASYS + SOVALDI', 'RIBAVIRIN', 'RIBAVIRIN + ZEPATIER', 'SOVALDI', 'TECHNIVIE', 'ZEPATIER'];

    let filteredData = _.filter(dataArray, (rec) => {
        return nonFdaApprovedCombos.indexOf(rec.MEDICATION) > -1;
    });

    let groupedData = _.groupBy(filteredData, 'MEDICATION');

    for (let keys in groupedData) {
        let json = {};

        json.name = keys;
        json.y = groupedData[keys].length;
        json.cost = getFormattedCost(groupedData[keys]);

        chartData.push(json);
    }

    finalData.therapyDistribution = chartData;
    finalData.genotypeDistribution = getPatientCountByGenotype(filteredData);
    finalData.patientIds = serverUtils.getUniqueArray(_.pluck(filteredData, 'PATIENT_ID_SYNTH'));

    return finalData;

}

let getNonHcvRnaChartData = (dataArray) => {
    let chartObj = {};

    let hcvRnaData = _.filter(dataArray, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT != null;
    });

    hcvRnaData = _.filter(hcvRnaData, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT.toUpperCase() == 'NO';
    });

    //get genotype distriution data for patients with non hcv rna prior treatment
    chartObj.genotypeDistribution = getPatientCountByGenotype(hcvRnaData);
    chartObj.gpatientIds = serverUtils.getUniqueArray(_.pluck(hcvRnaData, 'PATIENT_ID_SYNTH'));

    //get genotype distriution data for relapsed patients with non hcv rna prior treatment
    let filteredData = _.filter(hcvRnaData, (rec) => {
        return rec.IS_RELAPSED == 'Yes';
    });

    chartObj.relaspedDistribution = getPatientCountByGenotype(filteredData);
    chartObj.rpatientIds = serverUtils.getUniqueArray(_.pluck(filteredData, 'PATIENT_ID_SYNTH'));

    //get genotype distriution data for retreated patients with non hcv rna prior treatment
    filteredData = _.filter(hcvRnaData, (rec) => {
        return rec.IS_RETREATED == 'YES';
    });

    chartObj.retreatedDistribution = getPatientCountByGenotype(filteredData);
    chartObj.repatientIds = serverUtils.getUniqueArray(_.pluck(filteredData, 'PATIENT_ID_SYNTH'));

    return chartObj;
}

let getDataForNonFdaApprovedCombos = (dataArray) => {
    //let nonFdaApprovedCombos = ['DAKLINZA', 'EPCLUSA', 'EPCLUSA + RIBAVIRIN', 'OLYSIO', 'PEGASYS', 'PEGASYS + SOVALDI', 'RIBAVIRIN', 'RIBAVIRIN + ZEPATIER', 'SOVALDI', 'TECHNIVIE', 'ZEPATIER'];
    let filteredData = [];
    if(dataArray){
       filteredData = _.filter(dataArray, (rec) => {
            return nonFdaApprovedCombos.indexOf(rec.MEDICATION) > -1;
        });
    } else {
        // Added By Yuvraj (Taking value from global variable.)
        filteredData = inAppropriateMedsCombination;
    }


    let nonfdaCombos = {};

    nonfdaCombos = getPatientProviderCount(filteredData);
    // nonfdaCombos.totalCost = getCostForPatients(filteredData);

    return nonfdaCombos;
}

let getFormattedCost = (dataArray, isLabsCost) => {
    let cost = 0;

    //cost = _.pluck(dataArray, 'CHARGE').sum();

    let costKey = isLabsCost ? 'LABS_COST' : 'CHARGE';

    dataArray = _.filter(dataArray, (rec) => {
        return rec[costKey] != null;
    });

    cost = _.pluck(dataArray, costKey).sum();

    cost = serverUtils.autoFormatCostValue(cost);

    return '$' + cost;
}

Array.prototype.sum = function() {
    var sum = 0;
    var j = 0;
    for (var i = 0; i < this.length; i++) {
        if (isFinite(this[i])) {
            sum = sum + parseFloat(this[i]);
            j++;
        }
    }
    if (j === 0) {
        return 0;
    } else {
        return sum;
    }
}


// Jayesh 5th april 2017 added care failure chart logic

let prepareCareFailureChartDataChart = (baseData, noPrescriptionData) => {

    let chartdata = {};
    chartdata['svr'] = null;
    chartdata['discontinued'] = null;
    chartdata['follow'] = null;
    chartdata['Notprescribed'] = null;
    chartdata['Regiments'] = null;
    chartdata['HCVRNA'] = null;
    chartdata['TherapyDuration'] = null;

    //prepare svr12 chart data 
    chartdata['svr'] = preparesvr12cureFailurechart(baseData, 'SVR12', 0);
    chartdata['discontinued'] = preparesvr12cureFailurechart(baseData, 'IS_COMPLETED', 'No');
    chartdata['follow'] = preparesvr12cureFailurechart(baseData, 'SVR12', null);
    chartdata['Notprescribed'] = prepareNoPrescriptionCureFailurechart(noPrescriptionData, 'NO_PRESCRIPTION', 'YES');
    chartdata['Regiments'] = prepareExtraCategoryCureFailurechart(baseData, 'IS_INAPPROPRIATE_REGIMEN', 'YES');
    chartdata['HCVRNA'] = prepareExtraCategoryCureFailurechart(baseData, 'IS_HAVE_HCV_RNA_PRIOR_TREATMENT', 'NO');
    chartdata['TherapyDuration'] = prepareTherapyDurationCureFailureChartData(baseData, 'TREATMENT_PERIOD', null);
    return chartdata;
}

let preparesvr12cureFailurechart = (baseData, keyl, param) => {
    let filteredData = baseData.filter((rec) => rec[keyl] == param);
    let grpRace = _.groupBy(filteredData, 'race');

    //let totalinsu = filteredData.length;
    // let totalinsu = _.uniq(_.pluck(filteredData,'PATIENT_ID_SYNTH')).length;
    let totalinsu = serverUtils.getUniqueCount(filteredData, 'PATIENT_ID_SYNTH');
    let totalCost = getCostForPatients(filteredData);
    let chartdata = [];
    for (let key in grpRace) {
        let json = {};
        json['name'] = key;
        //let len = grpRace[key].length;
        // let len = _.uniq(_.pluck(grpRace[key],'PATIENT_ID_SYNTH')).length;
        let len = serverUtils.getUniqueCount(grpRace[key], 'PATIENT_ID_SYNTH');
        json['y'] = (len / totalinsu) * 100;
        json['patientCost'] = getCostForPatients(grpRace[key]);
        json['totalCost'] = totalCost;
        json['total'] = len;
        chartdata.push(json);
    }
    return { data: chartdata, total: totalinsu, key: keyl };
}

let prepareExtraCategoryCureFailurechart = (baseData, keyl, param) => {
    // baseData = baseData.filter((rec) => rec[keyl] != null);
    baseData = baseData.filter((rec) => rec[keyl] && rec[keyl].toString().toUpperCase() == param);
    // let grpRace = _.groupBy(filteredData, 'race');
    let grpRace = _.groupBy(baseData, 'race');

    //let totalinsu = filteredData.length;
    // let totalinsu = _.uniq(_.pluck(filteredData,'PATIENT_ID_SYNTH')).length;
    // let totalinsu = serverUtils.getUniqueCount(filteredData, 'PATIENT_ID_SYNTH');
    // let totalCost = getCostForPatients(filteredData);

    let totalinsu = serverUtils.getUniqueCount(baseData, 'PATIENT_ID_SYNTH');
    let totalCost = getCostForPatients(baseData);
    let chartdata = [];
    for (let key in grpRace) {
        let json = {};
        json['name'] = key;
        let len = serverUtils.getUniqueCount(grpRace[key], 'PATIENT_ID_SYNTH');
        json['y'] = (len / totalinsu) * 100;
        json['patientCost'] = getCostForPatients(grpRace[key]);
        json['totalCost'] = totalCost;
        json['total'] = len;
        chartdata.push(json);
    }
    return { data: chartdata, total: totalinsu, key: keyl };
}

let prepareNoPrescriptionCureFailurechart = (baseData, keyl, param) => {
    baseData = baseData.filter((rec) => rec[keyl] != null);
    let filteredData = baseData.filter((rec) => rec[keyl].toString().toUpperCase() == param);
    let grpRace = _.groupBy(filteredData, 'race');

    //let totalinsu = filteredData.length;
    // let totalinsu = _.uniq(_.pluck(filteredData,'PATIENT_ID_SYNTH')).length;
    let totalinsu = serverUtils.getUniqueCount(filteredData, 'PATIENT_ID_SYNTH');
    let totalCost = getCostForPatientsWithNoPrescription(filteredData);
    let chartdata = [];
    for (let key in grpRace) {
        let json = {};
        json['name'] = key;
        //let len = grpRace[key].length;
        // let len = _.uniq(_.pluck(grpRace[key],'PATIENT_ID_SYNTH')).length;
        let len = serverUtils.getUniqueCount(grpRace[key], 'PATIENT_ID_SYNTH');
        json['y'] = (len / totalinsu) * 100;
        json['patientCost'] = getCostForPatientsWithNoPrescription(grpRace[key]);
        json['totalCost'] = totalCost;
        json['total'] = len;
        chartdata.push(json);
    }
    return { data: chartdata, total: totalinsu, key: keyl };
}

//function to prepare data for the therapy duration
let prepareTherapyDurationCureFailureChartData = (dataArray, keyl, param) => {
    let durationObj = {};
    //     fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();

    // //convert the string into Array
    // fdaCompliantPeriods = fdaCompliantPeriods.split(',');

    // //filter all non fda complaint records
    // let filteredData = _.filter(dataArray, (rec) => {
    //     return fdaCompliantPeriods.indexOf(rec.TREATMENT_PERIOD.toString()) == -1;
    // });
    // let grpRace = _.groupBy(filteredData, 'race');
     let grpRace = _.groupBy(nonFdaTherapyDuration, 'race');

    //let totalinsu = filteredData.length;
    // let totalinsu = _.uniq(_.pluck(filteredData,'PATIENT_ID_SYNTH')).length;
    // let totalinsu = serverUtils.getUniqueCount(filteredData, 'PATIENT_ID_SYNTH');
    // let totalCost = getCostForPatients(filteredData);
     let totalinsu = serverUtils.getUniqueCount(nonFdaTherapyDuration, 'PATIENT_ID_SYNTH');
    let totalCost = getCostForPatients(nonFdaTherapyDuration);
    let chartdata = [];
    for (let key in grpRace) {
        let json = {};
        json['name'] = key;
        //let len = grpRace[key].length;
        // let len = _.uniq(_.pluck(grpRace[key],'PATIENT_ID_SYNTH')).length;
        let len = serverUtils.getUniqueCount(grpRace[key], 'PATIENT_ID_SYNTH');
        json['y'] = (len / totalinsu) * 100;
        json['patientCost'] = getCostForPatients(grpRace[key]);
        json['totalCost'] = totalCost;
        json['total'] = len;
        chartdata.push(json);
    }
    return { data: chartdata, total: totalinsu, key: keyl };
}

//function to get Not Filling Next Prescription data for prior treatment
let getNotFillingNextPrescriptionData = (dataArray) => {
    let notFillingNextPrescriptionObj = {};
    

    let filteredData = [];
    if(dataArray){
        let fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();
        filteredData = _.filter(dataArray, (rec) => {
            return rec.PRESCRIBED_TREATMENT_PERIOD != null;
        });
        //convert the string into Array
        fdaCompliantPeriods = fdaCompliantPeriods.split(',');

        //filter all fda complaint records
        filteredData = _.filter(filteredData, (rec) => {
            return fdaCompliantPeriods.indexOf(rec.PRESCRIBED_TREATMENT_PERIOD.toString()) != -1 && rec.PRESCRIBED_TREATMENT_PERIOD > rec.TREATMENT_PERIOD;
        });

    } else {
        // Added By Yuvraj (Taking value from global variable.)
       filteredData = noRefill;
    }


    notFillingNextPrescriptionObj = getPatientProviderCount(filteredData);
    // notFillingNextPrescriptionObj.totalCost = getCostForPatients(filteredData);

    return notFillingNextPrescriptionObj;
}

let prepareFillingNextPrescriptionChartData = (dataArray) => {
    let notFillingNextPrescriptionObj = {};
    let fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();
    let filteredData = _.filter(dataArray, (rec) => {
        return rec.PRESCRIBED_TREATMENT_PERIOD != null;
    });
    //convert the string into Array
    fdaCompliantPeriods = fdaCompliantPeriods.split(',');

    //filter all fda complaint records
    filteredData = _.filter(filteredData, (rec) => {
        return fdaCompliantPeriods.indexOf(rec.PRESCRIBED_TREATMENT_PERIOD.toString()) != -1
    });

    filteredData = _.map(filteredData, (rec) => {

        if (rec.PRESCRIBED_TREATMENT_PERIOD > rec.TREATMENT_PERIOD) {
            rec.fillingPrescription = 'No';
        } else {
            rec.fillingPrescription = 'Yes';

        }
        return rec;
    });


    //Pram(05th June 2017): use only  notFillingNextPrescriptionData = No
    filteredData = _.filter(filteredData, (rec) => {
        return rec.fillingPrescription == 'No';
    });

    let chartData = [],

        drilldownData = [];

    // let groupedData = _.groupBy(filteredData, 'fillingPrescription');

    // for(let keys in groupedData) {
    //     let data = groupedData[keys];
    //     let json = {};

    //     json.name = keys;
    //     json.y = data.length;
    //     json.cost = getFormattedCost(data);
    //     json.drilldown = keys+'_DrillDown';

    //     chartData.push(json);
    //     drilldownData.push(prepareDrillDownData(keys,data));


    // }

    // return {
    //     data: chartData,
    //     drilldown: drilldownData
    // };

    return {
        data: getDataDistributionForCostOpportunity(filteredData, 'GENOTYPE'),
        drilldown: drilldownData,
        patientIds: serverUtils.getUniqueArray(_.pluck(filteredData, 'PATIENT_ID_SYNTH'))
    };

    //function to prepare drilldown data
    function prepareDrillDownData(drillKey, baseData) {
        let obj = {};
        obj.name = 'Treatment Period';
        obj.id = drillKey + '_DrillDown';
        obj.data = getPatientCountByTreatmentPeriod(baseData);

        return obj;
    }


}

let getNoPrescriptionData = (dataArray) => {
    // console.log(dataArray.length);
    let noPrescriptionObj = {};

    let filteredData = _.filter(dataArray, (rec) => {
        return rec.NO_PRESCRIPTION != null;
    });

    filteredData = _.filter(filteredData, (rec) => {
        return rec.NO_PRESCRIPTION.toUpperCase() == 'YES';
    });
    // console.log(filteredData.length);

    noPrescriptionObj = getPatientProviderCount(filteredData);
    // noPrescriptionObj.totalCost = getCostForPatientsWithNoPrescription(filteredData);

    noPrescriptionObj.totalPatientCount = dataArray.length;

    return noPrescriptionObj;
}

//Praveen 04/07/2017 prepare data forin appropriate regiments
let getInAppropriateRegimentsData = (baseData) => {

    let filterData = baseData;
    let chartData = {};
    chartData['regimentsdrilldown'] = null;
    chartData['regimentsCost'] = null;
    chartData['patientIds'] = null;
    //check for in appropriate regiemnts data
    baseData = _.filter(baseData, (rec) => {
        return rec.TREATMENT_PERIOD < 84;
    });

    filterData = baseData.filter((rec) => rec['IS_INAPPROPRIATE_REGIMEN'] == 'Yes');

    // console.log('regimen filter data');
    // console.log(filterData.length);

    // let medicationgrpData = _.groupBy(filterData, 'MEDICATION');
     let medicationgrpData = _.groupBy(inappropriateRegiments, 'MEDICATION');
    let regiemntsdata = [];
    let regiemntsDrilldowndata = [];
    let regiemntsCostData = [];
    // let totalP = filterData.length;
     let totalP = serverUtils.getUniqueCount(filterData, 'PATIENT_ID_SYNTH');
    
    for (let medication in medicationgrpData) {
        let json = {};
        let rjson = {};
        let cost = 0;
        rjson['fullName'] = medication;
        rjson['name'] = getDrugAbbr(medication);
        json['name'] = medication;
        let mData = medicationgrpData[medication];
        //let lenM = mData.length;
        let lenM = serverUtils.getUniqueCount(mData, 'PATIENT_ID_SYNTH');
        json['y'] = (lenM / totalP) * 100;
        rjson['count'] = lenM;
        json['count'] = lenM;

        for (let i = 0; i < lenM; i++) {
            cost += parseInt(mData[i]['CHARGE']);
        }
        rjson['y'] = cost;
        json['cost'] = getFormattedCost(mData);

        if (lenM) {
            json['drilldown'] = medication + '_Drilldown';
        }
        regiemntsdata.push(json);
        regiemntsCostData.push(rjson);
        let drilldownData = prepareRegimentsDrilldownData(mData, medication);
        regiemntsDrilldowndata.push(drilldownData);
    }
    chartData['regimentsdrilldown'] = { data: regiemntsdata, drilldown: regiemntsDrilldowndata };
    chartData['regimentsCost'] = regiemntsCostData;
    chartData['patientIds'] = serverUtils.getUniqueArray(_.pluck(filterData, 'PATIENT_ID_SYNTH'));

    return chartData;

}

let prepareRegimentsDrilldownData = (baseData, medication) => {

    let chartData = {};
    chartData['name'] = 'Treatment Period';
    chartData['medname'] = medication;
    chartData['id'] = medication + '_Drilldown';
    chartData['data'] = getPatientCountByRegimentDosage(baseData,medication);
    return chartData;
}

let getPatientCountByRegimentDosage = (dataArray,medication) => {
    let data = [];

    let groupedData = _.groupBy(dataArray, 'TREATMENT_PERIOD');
    let totalP = serverUtils.getUniqueCount(dataArray, 'PATIENT_ID_SYNTH');

    for (let keys in groupedData) {
        let obj = {};
        let kdata = groupedData[keys];
        obj.name = keys;
        obj.medname = medication;//getFirstValueNotNull(kdata,'MEDS_IMPROPER');//kdata[0]['MEDS_IMPROPER'];
        obj.isDrilldown = true;
        obj.actualDosage = getFirstValueNotNull(kdata,'EXPECTED_DOSAGE');//kdata[0]['EXPECTED_DOSAGE'] || 'Not Specified';
        obj.givenDosage = getFirstValueNotNull(kdata,'GIVEN_DOSAGE');//kdata[0]['GIVEN_DOSAGE'] || 'Not Specified';
        obj.countDosage = getAvgCountdosage(kdata); //[0]['GIVEN_DOSAGE'];
        //let len = kdata.length;
        let len = serverUtils.getUniqueCount(kdata, 'PATIENT_ID_SYNTH');
        //obj.y = (len / dataArray.length) * 100;
        obj.y = (len / totalP) * 100;
        obj.count = len;
        obj.cost = getFormattedCost(kdata);
        //obj.cost = 'Expacted Dosage : '+obj.actualDosage+';Given :'+obj.givenDosage;
        data.push(obj);
    }

    return data;
}

let getAvgCountdosage = (baseData) => {

    let sum = 0;
    for (let i = 0; i < baseData.length; i++) {
        sum += ~~baseData[i]['COUNT_DOSAGE'];
    }
    if (baseData.length) {
        return Math.round(sum / baseData.length);
    } else {
        return 0;
    }
}
let getFirstValueNotNull = (baseData,key) =>{
    if(baseData.length){
        let filterData = baseData.filter((rec)=>rec[key] && 1);
        if(filterData && filterData.length>0)
            return filterData[0][key];
        else{
            return  'Not Specified';
        }
    }
    else{
        return 'Not Specified';
    }
}

let getPatientCountByGenotypeRegiment = (dataArray) => {
    let data = [];

    let groupedData = _.groupBy(dataArray, 'GENOTYPE');
    let totalP = serverUtils.getUniqueCount(dataArray, 'PATIENT_ID_SYNTH');

    for (let keys in groupedData) {
        let obj = {};

        obj.name = keys;
        //let len = groupedData[keys].length;
        let len = serverUtils.getUniqueCount(groupedData[keys], 'PATIENT_ID_SYNTH');
        //obj.y = (len / dataArray.length) * 100;
        obj.y = (len / totalP) * 100;
        obj.count = len;
        obj.cost = getFormattedCost(groupedData[keys]);
        data.push(obj);
    }

    return data;
}

let getPatientCountByGenotypeRegimentMedication = (dataArray) => {
    let data = [];

    let groupedData = _.groupBy(dataArray, 'MEDICATION');
    let totalP = serverUtils.getUniqueCount(dataArray, 'PATIENT_ID_SYNTH');

    for (let keys in groupedData) {
        let obj = {};

        obj.name = keys;
        //let len = groupedData[keys].length;
        let len = serverUtils.getUniqueCount(groupedData[keys], 'PATIENT_ID_SYNTH');
        //obj.y = (len / dataArray.length) * 100;
        obj.y = (len / totalP) * 100;
        obj.count = len;
        obj.cost = getFormattedCost(groupedData[keys]);
        data.push(obj);
    }

    return data;
}

//function to get Abbr from Full Name
function getDrugAbbr(drugName) {
    let abbr = '',
        plusSeparated = drugName.split('+');

    for (let i = 0; i < plusSeparated.length; i++) {
        abbr += plusSeparated[i].trim().charAt(0);

        if (i != plusSeparated.length - 1) {
            abbr += ' + ';
        }
    }

    return abbr;
}


function getNoPrescritionChartData(data) {
    let noPrescriptionObj = {};

    let filteredData = _.filter(data, (rec) => {
        return rec.NO_PRESCRIPTION != null;
    });

    filteredData = _.filter(filteredData, (rec) => {
        return rec.NO_PRESCRIPTION.toUpperCase() == 'YES';
    });

    let grpGenotype = _.groupBy(filteredData, 'GENOTYPE');

    let totalinsu = filteredData.length;
    let totalCost = getCostForPatientsWithNoPrescription(filteredData);
    let chartdata = [];
    for (let key in grpGenotype) {
        let json = {};
        json['name'] = key;
        let len = grpGenotype[key].length;
        json['y'] = len;
        json['patientCost'] = getCostForPatientsWithNoPrescription(grpGenotype[key]);
        json['totalCost'] = totalCost;
        json['total'] = (len / totalinsu) * 100;
        chartdata.push(json);
    }
    return {
        data: chartdata,
        total: totalinsu,
        key: 'Genotypes',
        patientIds: serverUtils.getUniqueArray(_.pluck(filteredData, 'PATIENT_ID_SYNTH'))
    };

}






/**
 * @author: Yuvraj Pal
 * @desc: This function will findout unique patients taht fall inot the waste categories.
 * @date: 23rd May, 2017
 */

let uniquePatientsWithWaste = (dataArray) => {

    let finalPatientsArray = [];
    // let filterData = dataArray;

    let originalDataArray = dataArray.data;

    // dataArray = _.filter(dataArray, (rec) => {
    //     return rec.MEDICATION != null;
    // });



    let filterData = dataArray.filterData;
    //filter patients with discontinued status
    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_COMPLETED == 'No';
    // });

    //filter patients with completed status
    filterData = _.filter(dataArray, (rec) => {
        return rec.IS_COMPLETED == 'Yes';
    });

    finalPatientsArray.push(filterData);

    // filterData = _.filter(dataArray, (rec) => {
    //     return nonFdaApprovedCombos.indexOf(rec.MEDICATION) > -1;
    // });
    // finalPatientsArray.push(filterData);
    // finalPatientsArray.push(dataArray.inAppropriateMedicationCombination);
        finalPatientsArray.push(inAppropriateMedsCombination);
    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_RELAPSED == 'Yes';
    // });

    // finalPatientsArray.push(filterData);
    // finalPatientsArray.push(dataArray.relapsed);
    finalPatientsArray.push(relapsedPatients);

    filterData = _.filter(dataArray, (rec) => {
        return rec.SVR12 == null;
    });

    finalPatientsArray.push(filterData);



    // let fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();

    // //convert the string into Array
    // fdaCompliantPeriods = fdaCompliantPeriods.split(',');

    // //filter all non fda complaint records
    // filterData = _.filter(dataArray, (rec) => {
    //     return fdaCompliantPeriods.indexOf(rec.TREATMENT_PERIOD.toString()) == -1;
    // });
    // finalPatientsArray.push(filterData);
    // finalPatientsArray.push(dataArray.nonFDA);
     finalPatientsArray.push(nonFdaTherapyDuration);



    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_INAPPROPRIATE_REGIMEN != null;
    // });

    // filterData = _.filter(filterData, (rec) => {
    //     return rec.IS_INAPPROPRIATE_REGIMEN.toUpperCase() == 'YES';
    // });
    // finalPatientsArray.push(filterData);
    // finalPatientsArray.push(dataArray.inappropriateregiments);
    finalPatientsArray.push(inappropriateRegiments);


    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_RETREATED == 'YES';
    // });

    // finalPatientsArray.push(filterData);
    // finalPatientsArray.push(dataArray.retreated);
     finalPatientsArray.push(retreatedPatients);

    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT != null;
    // });

    // filterData = _.filter(filterData, (rec) => {
    //     return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT.toUpperCase() == 'NO';
    // });

    // finalPatientsArray.push(filterData);
    // finalPatientsArray.push(dataArray.missingHCVRNA);
     finalPatientsArray.push(missingHCVRNA);


    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.PRESCRIBED_TREATMENT_PERIOD != null;
    // });

    // //filter all fda complaint records
    // filterData = _.filter(filterData, (rec) => {
    //     return fdaCompliantPeriods.indexOf(rec.PRESCRIBED_TREATMENT_PERIOD.toString()) != -1 && rec.PRESCRIBED_TREATMENT_PERIOD > rec.TREATMENT_PERIOD;
    // });

    // finalPatientsArray.push(filterData);
    finalPatientsArray.push(noRefill);


    // filterData = _.filter(originalDataArray, (rec) => {
    //     return rec.NO_PRESCRIPTION != null;
    // });

    // filterData = _.filter(filterData, (rec) => {
    //     return rec.NO_PRESCRIPTION.toUpperCase() == 'YES';
    // });

    filterData = _.filter(originalDataArray, (rec) => {
        return rec.MEDICATION == null;
    });

    // set no prescription data
    finalPatientsArray.push(filterData);


    return getDataForOverAllCost(_.flatten(finalPatientsArray));

}


let getDataForOverAllCost = (dataArray) => {
    let dataWithMedication = _.filter(dataArray, (rec) => {
        return rec.MEDICATION != null;
    });

    // Not Considering the cured Patietns.
    dataWithMedication = _.filter(dataWithMedication, (rec) => {
        return rec.SVR12 == null || rec.SVR12 == 0;
    });

    let dataWithoutMedication = _.filter(dataArray, (rec) => {
        return rec.MEDICATION == null;
    });


    let uniuqeDataWithMedication = [];

    //loop for all patients with medication records
    for (let i = 0; i < dataWithMedication.length; i++) {
        let pObj = {
            PATIENT_ID_SYNTH: dataWithMedication[i].PATIENT_ID_SYNTH,
            MEDICATION: dataWithMedication[i].MEDICATION,
            TREATMENT_PERIOD: dataWithMedication[i].TREATMENT_PERIOD
        };


        // let pData = _.where(uniuqeDataWithMedication, pObj);
        exist = isUniquePatientExist(uniuqeDataWithMedication,pObj);

        // let pData = _.filter(uniuqeDataWithMedication, (rec) => {
        //     return (rec.PATIENT_ID_SYNTH == pObj.PATIENT_ID_SYNTH && rec.MEDICATION == pObj.MEDICATION && rec.TREATMENT_PERIOD == pObj.TREATMENT_PERIOD );
        // });
        
        // if (pData.length < 1) {
        //     uniuqeDataWithMedication.push(dataWithMedication[i]);
        // }

        if (!exist) {
            uniuqeDataWithMedication.push(dataWithMedication[i]);
        }
    }


    let medRecObj = {},
        nonMedRecObj = {};

    

    //data for the patients with medication records
    medRecObj = getPatientProviderCount(uniuqeDataWithMedication);
    medRecObj.totalCost = getCostForPatients(uniuqeDataWithMedication);

    let uniquePatients_charge = uniuqeDataWithMedication;
    
    uniquePatients_charge = _.filter(uniquePatients_charge, (rec) => {
        return rec['CHARGE'] != null;
    });

    medRecObj.charts = {
        genotypeDistribution: getDataDistributionForCostOpportunity(uniquePatients_charge, 'GENOTYPE'),
        treatmentDistribution: getDataDistributionForCostOpportunity(uniquePatients_charge, 'TREATMENT'),
        cirrhosisDistribution: getDataDistributionForCostOpportunity(uniquePatients_charge, 'CIRRHOSIS'),
        genderDistribution: getDataDistributionForCostOpportunity(uniquePatients_charge, 'GENDER'),
    };

    //data for the patients with non-medication records
    nonMedRecObj = getPatientProviderCount(dataWithoutMedication);
    nonMedRecObj.totalCost = getCostForPatients(dataWithoutMedication, true);
    let dataWithoutMedication_labs = dataWithoutMedication;

    dataWithoutMedication_labs = _.filter(dataWithoutMedication_labs, (rec) => {
        return rec['LABS_COST'] != null;
    });
    nonMedRecObj.charts = {
        genotypeDistribution: getDataDistributionForCostOpportunity(dataWithoutMedication_labs, 'GENOTYPE', true),
        treatmentDistribution: getDataDistributionForCostOpportunity(dataWithoutMedication_labs, 'TREATMENT', true),
        cirrhosisDistribution: getDataDistributionForCostOpportunity(dataWithoutMedication_labs, 'CIRRHOSIS', true),
        genderDistribution: getDataDistributionForCostOpportunity(dataWithoutMedication_labs, 'GENDER', true),
    };

    return {
        medRecObj: medRecObj,
        nonMedRecObj: nonMedRecObj
    };

}

let getDataDistributionForCostOpportunity = (dataArray, distributionKey, isLabsCost) => {
    let chartData = [],
        drilldownData = [];

    let groupedData = _.groupBy(dataArray, distributionKey);

    for (let keys in groupedData) {
        let data = groupedData[keys];
        let json = {};

        let label = (keys == 'M' ? 'Male' : (keys == 'F' ? 'Female' : keys));
        json.name = label;

        // json.y = _.uniq(_.pluck(data, 'PATIENT_ID_SYNTH')).length;
        json.y = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
        // json.cost = getFormattedCost(data, isLabsCost);
        json.cost = getFormattedCost(data, isLabsCost);
        if(keys && keys !="undefined")
            chartData.push(json);
    }

    chartData.sort((a, b) => a.name.replace(/\D+/g, '') - b.name.replace(/\D+/g, ''));

    return chartData;
}




let getHepABDistributionChart = (dataArray, distributionKey) => {
    let chartData = [],
        drilldownData = [];

    let groupedData = _.groupBy(dataArray, distributionKey);

    for (let keys in groupedData) {
        let data = groupedData[keys];
        let json = {};

        json.name = keys;
        // json.y = _.uniq(_.pluck(data, 'PATIENT_ID_SYNTH')).length;
        json.y = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
        chartData.push(json);
    }
    chartData.sort((a, b) => a.name.replace(/\D+/g, '') - b.name.replace(/\D+/g, ''));

    return chartData;
}

function getTreatmentIncompleteAndTreatmentChangePatients(data) {
    let treatmentChange = [];
    let incompleteTreatment = [];
    for (let i = 0; i < data.length; i++) {
        if (7 * data[i].TREATMENT_PERIOD == data[i].DAYS_MEDICATION) {
            treatmentChange.push(data[i]);
        } else {
            incompleteTreatment.push(data[i]);
        }
    }

    return { 'treatmentChange': treatmentChange, 'incompleteTreatment': incompleteTreatment };
}




//  Prepare Actual Waste Data

let prepareActualWasteData = (dataArray, labsAnalysisData) => {


    let finalObj = {};
    // let filterData = dataArray;

    let totalPatientsStatus = getPatientProviderCount(dataArray.data);

    //total patients
    finalObj.patientCount = totalPatientsStatus.patientCount;
    finalObj.providerCount = totalPatientsStatus.providerCount;

    // // Filter by Medications
    // dataArray = _.filter(dataArray, (rec) => {
    //     return rec.MEDICATION != null;
    // });


    // ==========================================================================
    // START ::::::::::::   Patients with Incomplete and Treatment Change   
    // ==========================================================================

    // //filter patients with discontinued status
    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_COMPLETED == 'No';
    // });

    // Split patients in Treatment Change and Incomplete Treatment.
    // let filteredPatients = getTreatmentIncompleteAndTreatmentChangePatients(filterData);
    let filteredPatients = getTreatmentIncompleteAndTreatmentChangePatients(dataArray.filterData);

    // let noRefillPatients = dataArray.noRefill;

    // filteredPatients = 

    // discontinued Patients (In Complete Treatment)
    finalObj.discontinued = getPatientProviderCount(filteredPatients.incompleteTreatment);
    finalObj.discontinued.totalCost = getCostForPatients(filteredPatients.incompleteTreatment);
    finalObj.discontinued.svrStatus = getSVRStatusForPatients(filteredPatients.incompleteTreatment);
    finalObj.discontinued.categoryName = 'Discontinued';
    finalObj.discontinued.redirect = 'js-wasteIncompleteTreatment';
    // Patients with Treatmet Change
    finalObj.treatmentChange = getPatientProviderCount(filteredPatients.treatmentChange);
    finalObj.treatmentChange.totalCost = getCostForPatients(filteredPatients.treatmentChange);
    finalObj.treatmentChange.svrStatus = getSVRStatusForPatients(filteredPatients.treatmentChange);
    finalObj.treatmentChange.categoryName = 'Incomplete Treatment';
    finalObj.treatmentChange.redirect = 'js-wasteIncompleteTreatment';
    // ==========================================================================
    // END ::::::::::::   Patients with Incomplete and Treatment Change   
    // ==========================================================================



    // ==========================================================================
    // START ::::::::::::   Patients with InAppropriate Regiment   
    // ==========================================================================

    // finalObj.inappropriateRegiment = getPatientProviderCount(dataArray.inappropriateregiments);
    // finalObj.inappropriateRegiment.totalCost = getCostForPatients(dataArray.inappropriateregiments);
    // finalObj.inappropriateRegiment.svrStatus = getSVRStatusForPatients(dataArray.inappropriateregiments);

    finalObj.inappropriateRegiment = getPatientProviderCount(inappropriateRegiments);
    finalObj.inappropriateRegiment.totalCost = getCostForPatients(inappropriateRegiments);
    finalObj.inappropriateRegiment.svrStatus = getSVRStatusForPatients(inappropriateRegiments);

    finalObj.inappropriateRegiment.categoryName = 'InAppropriate Regiment';
    finalObj.inappropriateRegiment.redirect = 'js-wasteRegiment';
    // ==========================================================================
    // END ::::::::::::   Patients with InAppropriate Regiment
    // ==========================================================================


    // ==========================================================================
    // START ::::::::::::   Patients with InAppropriate Medication Combination   
    // ==========================================================================

    // finalObj.inappropriateMedication = getPatientProviderCount(dataArray.inAppropriateMedicationCombination);
    // finalObj.inappropriateMedication.totalCost = getCostForPatients(dataArray.inAppropriateMedicationCombination);
    // finalObj.inappropriateMedication.svrStatus = getSVRStatusForPatients(dataArray.inAppropriateMedicationCombination);

    finalObj.inappropriateMedication = getPatientProviderCount(inAppropriateMedsCombination);
    finalObj.inappropriateMedication.totalCost = getCostForPatients(inAppropriateMedsCombination);
    finalObj.inappropriateMedication.svrStatus = getSVRStatusForPatients(inAppropriateMedsCombination);
    finalObj.inappropriateMedication.categoryName = 'Medication Combination';
    finalObj.inappropriateMedication.redirect = 'js-wasteNonFDACombinations';
    // ==========================================================================
    // END ::::::::::::   Patients with InAppropriate Medication Combination   
    // ==========================================================================

    // ==========================================================================
    // START ::::::::::::   Patients with Non FDA Therapy Durations 
    // ==========================================================================


    // finalObj.nonFdaTherapyDuration = getPatientProviderCount(filteredPatients);
    // finalObj.nonFdaTherapyDuration.totalCost = getCostForPatients(filteredPatients);
    // finalObj.nonFdaTherapyDuration.svrStatus = getSVRStatusForPatients(filteredPatients);
    // finalObj.nonFdaTherapyDuration.categoryName = 'Non FDA Therapy Duration';
    // finalObj.nonFdaTherapyDuration = getPatientProviderCount(dataArray.nonFDA);
    // finalObj.nonFdaTherapyDuration.totalCost = getCostForPatients(dataArray.nonFDA);
    // finalObj.nonFdaTherapyDuration.svrStatus = getSVRStatusForPatients(dataArray.nonFDA);

    finalObj.nonFdaTherapyDuration = getPatientProviderCount(nonFdaTherapyDuration);
    finalObj.nonFdaTherapyDuration.totalCost = getCostForPatients(nonFdaTherapyDuration);
    finalObj.nonFdaTherapyDuration.svrStatus = getSVRStatusForPatients(nonFdaTherapyDuration);
    finalObj.nonFdaTherapyDuration.categoryName = 'Non FDA Therapy Duration';
    finalObj.nonFdaTherapyDuration.redirect = 'js-wasteTherapyDuration';
    // ==========================================================================
    // END ::::::::::::   Patients with Non FDA Therapy Durations 
    // ==========================================================================

    // ==========================================================================
    // START ::::::::::::   Relapsed Patients
    // ==========================================================================


    // finalObj.relapsed = getPatientProviderCount(dataArray.relapsed);
    // finalObj.relapsed.totalCost = getCostForPatients(dataArray.relapsed);
    // finalObj.relapsed.svrStatus = getSVRStatusForPatients(dataArray.relapsed);

    finalObj.relapsed = getPatientProviderCount(relapsedPatients);
    finalObj.relapsed.totalCost = getCostForPatients(relapsedPatients);
    finalObj.relapsed.svrStatus = getSVRStatusForPatients(relapsedPatients);
    finalObj.relapsed.categoryName = 'Relapsed';
    finalObj.relapsed.redirect = 'js-wasteReplaced';
    // ==========================================================================
    // END ::::::::::::   Relapsed Patients
    // ==========================================================================

    // ==========================================================================
    // START ::::::::::::   Retreated Patients
    // ==========================================================================

    // finalObj.retreated = getPatientProviderCount(dataArray.retreated);
    // finalObj.retreated.totalCost = getCostForPatients(dataArray.retreated);
    // finalObj.retreated.svrStatus = getSVRStatusForPatients(dataArray.retreated);
    finalObj.retreated = getPatientProviderCount(retreatedPatients);
    finalObj.retreated.totalCost = getCostForPatients(retreatedPatients);
    finalObj.retreated.svrStatus = getSVRStatusForPatients(retreatedPatients);
    finalObj.retreated.categoryName = 'Retreated';
    finalObj.retreated.redirect = 'js-wasteRetreated';
    // ==========================================================================
    // END ::::::::::::   Retreated Patients
    // ==========================================================================


    // ==========================================================================
    // START ::::::::::::   Missing HCV RNA
    // ==========================================================================



    // finalObj.missingHCVRNA = getPatientProviderCount(dataArray.missingHCVRNA);
    // finalObj.missingHCVRNA.totalCost = getCostForPatients(dataArray.missingHCVRNA);
    // finalObj.missingHCVRNA.svrStatus = getSVRStatusForPatients(dataArray.missingHCVRNA);

    finalObj.missingHCVRNA = getPatientProviderCount(missingHCVRNA);
    finalObj.missingHCVRNA.totalCost = getCostForPatients(missingHCVRNA);
    finalObj.missingHCVRNA.svrStatus = getSVRStatusForPatients(missingHCVRNA);
    finalObj.missingHCVRNA.categoryName = 'Missing SVR RNA';
    finalObj.missingHCVRNA.redirect = 'js-wasteHcvRna';
    // ==========================================================================
    // END ::::::::::::   Missing HCV RNA
    // ==========================================================================


    // ==========================================================================
    // START ::::::::::::   Missing PRESCRIPTION REFILL
    // ==========================================================================

    // finalObj.missingPrescriptionRefill = getPatientProviderCount(dataArray.noRefill);
    // finalObj.missingPrescriptionRefill.totalCost = getCostForPatients(dataArray.noRefill);
    // finalObj.missingPrescriptionRefill.svrStatus = getSVRStatusForPatients(dataArray.noRefill);
      finalObj.missingPrescriptionRefill = getPatientProviderCount(noRefill);
    finalObj.missingPrescriptionRefill.totalCost = getCostForPatients(noRefill);
    finalObj.missingPrescriptionRefill.svrStatus = getSVRStatusForPatients(noRefill);
    finalObj.missingPrescriptionRefill.categoryName = 'Missing Prescription Refill';
    finalObj.missingPrescriptionRefill.redirect = 'js-wasteIncompleteTreatment';
    // ==========================================================================
    // END ::::::::::::   Missing HCV RNA
    // ==========================================================================



    // finalObj.hcvRNA = getHCVRNAData(dataArray);

    // finalObj.hcvRNARelapsed = getHCRNARelapsed(dataArray);

    // finalObj.hcvRNARetreated =  getHCRNARetreated(dataArray);

    // finalObj.hcvNotFillingNextPrescription = getNotFillingNextPrescriptionData(dataArray);

    // // set no prescription data
    // finalObj.hcvNoPrescription = getNoPrescriptionData(noPrescriptionData);

    // // No Prescriptio should be "Null"- patients with no Medication and No viral load
    // finalObj.noMedicationNoViralLoad = prepareDataForNewSection(noPrescriptionData);

    // // viral load should be null and medication null -- patients with no Medication and No viral load  or ( No Medication No SVR 12 )
    // finalObj.noMedicationNosvr12 = prepareDataForNewSection(noPrescriptionData, 'medicationOnly');

    // // viral load should be null and medication null --   or (NO HCV RNA - No Medication )
    // finalObj.nohcvRnaNoMedication = prepareDataForNewSection(noPrescriptionData,'viralLoad');

    // finalObj.hepAB = prepareHepABPatientsData(noPrescriptionData);


    // ==========================================================================
    // START ::::::::::::   No Prescription Patients
    // ==========================================================================

    let noPrescriptionObj = {};
    noPrescriptionObj = getPatientProviderCount(labsAnalysisData);

    filteredPatients = _.filter(labsAnalysisData, (rec) => {
        return rec.LAB_NM != null;
    });

    // noPrescriptionObj.chartData = getDataDistributionForLabAnalysis(filteredPatients);
    // noPrescriptionObj.chartData = getDataDistributionForLabAnalysis(dataArray.nolabs);
    noPrescriptionObj.chartData = getDataDistributionForLabAnalysis(missingPrescriptions);


    // ==========================================================================
    // END ::::::::::::   No Prescription Patients
    // ==========================================================================

    finalObj.noPrescriptionObj = noPrescriptionObj;

    finalObj.overlappingWasteCost = getOverlapperWasteCost(finalObj).totalCost;
    finalObj.missingSVR12Cost = getOverlapperWasteCost(finalObj).missingSVR12Cost;
    finalObj.uncuredCost = getOverlapperWasteCost(finalObj).uncuredCost;

    return finalObj;

}

/**
 * @Author : Yuvraj
 * comment : this functon will return the break down of SVR12 status for patients and corresponding cost.
 * date: 1st June 2017
 */

function getSVRStatusForPatients(dataArray) {
    let obj = {};

    //filter by svr12 as null
    let missingSVR12 = _.filter(dataArray, (rec) => {
        return rec.SVR12 == null;
    });

    // get Cost for Patietns with Missing SVR12

    //filter by svr12 as 1 (cured)
    let cured = _.filter(dataArray, (rec) => {
        return rec.SVR12 == 1;
    });

    // get Cost for cured patients

    //filter by svr12 as 0 (uncured)
    let uncured = _.filter(dataArray, (rec) => {
        return rec.SVR12 == 0;
    });

    // return final object
    return {
        missingSVR12: getSVR12StatusData(missingSVR12),
        cured: getSVR12StatusData(cured),
        uncured: getSVR12StatusData(uncured)
    }

}
/**
 * @author : Yuvraj 
 * date: 1st June 2017
 */
// this function will return the inner object for svr12 status wit patient id and cost value.
function getSVR12StatusData(dataArray) {

    return {
        patientCount: serverUtils.getUniqueCount(dataArray, 'PATIENT_ID_SYNTH'),
        cost: getCostData(dataArray),
        patientIds: serverUtils.getUniqueArray(_.pluck(dataArray, 'PATIENT_ID_SYNTH')),
    };
}

/**
 * @author : Yuvraj 
 * date: 1st June 2017
 */
let getCostData = (dataArray) => {

    // let costKey = isLabsCost ? 'LABS_COST' : 'CHARGE';
    let costKey = 'CHARGE';

    let filterData = _.filter(dataArray, (rec) => {
        return rec[costKey] != null;
    });

    return _.pluck(filterData, costKey).sum();
}


/**
 * @author: Pramveer
 * @date: 1st Jun 17
 * @desc: 
 */

let getDataDistributionForLabAnalysis = (dataArray) => {
    let chartData = [];
    let dataArray_labs = dataArray;

    dataArray_labs = _.filter(dataArray_labs, (rec) => {
        return rec.CHARGE != null;
    });

    let labsGrpData = _.groupBy(dataArray, 'LAB_NM');
    dataArray_labs = _.groupBy(dataArray, 'LAB_NM');
    for (let keys in labsGrpData) {
        let obj = {},
            labData = labsGrpData[keys],
            labCostData = dataArray_labs[keys] == undefined ? [] : dataArray_labs[keys];

        obj.name = keys;
        // obj.y = serverUtils.getUniqueCount(labData , 'PATIENT_ID_SYNTH');
        // obj.cost = getFormattedCost(labData);
        // obj.y = getCostForLabAnalysis(labData);
        obj.y = getCostForLabAnalysis(labCostData);
        obj.formatCost = serverUtils.autoFormatCostValue(obj.y);
        obj.count = serverUtils.getUniqueCount(labData, 'PATIENT_ID_SYNTH');

        chartData.push(obj);
    }

    return chartData;

    function getCostForLabAnalysis(labDataArray) {
        let cost = 0;
        // let filterData = _.filter(labDataArray, (rec) => {
        //     return rec.CHARGE != null;
        // });

       // cost = _.pluck(filterData, 'CHARGE').sum();

        cost = _.pluck(labDataArray, 'CHARGE').sum();

        return cost;
    }
}



/**
 * @author : Yurvaj
 * date : 1st June 2017
 */

let getOverlapperWasteCost = (dataObj) => {
    // let dataObj = jQuery.extend(true, {} , wasteObj)
    let missingSVR12Cost = 0
    let uncuredCost = 0;

    missingSVR12Cost += dataObj.discontinued.svrStatus.missingSVR12.cost;

    missingSVR12Cost += dataObj.inappropriateMedication.svrStatus.missingSVR12.cost;

    missingSVR12Cost += dataObj.inappropriateRegiment.svrStatus.missingSVR12.cost;

    missingSVR12Cost += dataObj.missingHCVRNA.svrStatus.missingSVR12.cost;

    missingSVR12Cost += dataObj.nonFdaTherapyDuration.svrStatus.missingSVR12.cost;

    missingSVR12Cost += dataObj.retreated.svrStatus.missingSVR12.cost;

    missingSVR12Cost += dataObj.relapsed.svrStatus.missingSVR12.cost;

    missingSVR12Cost += dataObj.missingPrescriptionRefill.svrStatus.missingSVR12.cost;



    uncuredCost += dataObj.discontinued.svrStatus.uncured.cost;

    uncuredCost += dataObj.inappropriateMedication.svrStatus.uncured.cost;

    uncuredCost += dataObj.inappropriateRegiment.svrStatus.uncured.cost;

    uncuredCost += dataObj.missingHCVRNA.svrStatus.uncured.cost;

    uncuredCost += dataObj.nonFdaTherapyDuration.svrStatus.uncured.cost;

    uncuredCost += dataObj.retreated.svrStatus.uncured.cost;

    uncuredCost += dataObj.relapsed.svrStatus.uncured.cost;

    uncuredCost += dataObj.missingPrescriptionRefill.svrStatus.uncured.cost;

    return {
        missingSVR12Cost: missingSVR12Cost,
        uncuredCost: uncuredCost,
        totalCost: missingSVR12Cost + uncuredCost
    };
}

let getFilteredDataByCategory = (dataArray, labsAnalysisData) => {
    let data = {};
    data.data = dataArray;

    let filterData = dataArray;
    // Filter by Medications
    dataArray = _.filter(dataArray, (rec) => {
        return rec.MEDICATION != null;
    });

    // ==========================================================================
    // START ::::::::::::   Patients with Incomplete and Treatment Change   
    // ==========================================================================

    filterData = _.filter(dataArray, (rec) => {
        return rec.IS_COMPLETED == 'No';
    });
    
    data.filterData = filterData;
    data.isComplete = filterData;

    // Global Variable
    incompleteAndTreatmentChange = filterData;

    // ==========================================================================
    // END ::::::::::::   Patients with Incomplete and Treatment Change   
    // ==========================================================================


    // ==========================================================================
    // START ::::::::::::   Patients with Incomplete and Treatment Change   
    // ==========================================================================

    filterData = _.filter(dataArray, (rec) => {
        return rec.IS_COMPLETED == 'No';
    });

    data.completeTreatment = filterData;

    // Global Variable
    completeTreatment = filterData;

    // ==========================================================================
    // END ::::::::::::   Patients with Incomplete and Treatment Change   
    // ==========================================================================


    // ==========================================================================
    // START ::::::::::::   Patients with inappropriate regiments   
    // ==========================================================================

    // Filter patients by inappropriate regiments
    let filteredPatients = _.filter(dataArray, (rec) => {
        return rec.IS_INAPPROPRIATE_REGIMEN != null;
    });

    filteredPatients = _.filter(filteredPatients, (rec) => {
        return rec.IS_INAPPROPRIATE_REGIMEN.toUpperCase() == 'YES';
    });
    data.inappropriateregiments = filteredPatients;

    // Global Variable
    inappropriateRegiments = filteredPatients;

    // ==========================================================================
    // END ::::::::::::   Patients with inappropriate regiments   
    // ==========================================================================

    // ==========================================================================
    // START ::::::::::::   Patients with inAppropriate Medication Combination  
    // ==========================================================================

    // filtered by inAppropriateMedicationCombination
    filteredPatients = _.filter(dataArray, (rec) => {
        return nonFdaApprovedCombos.indexOf(rec.MEDICATION) > -1;
    });
    data.inAppropriateMedicationCombination = filteredPatients;

    // Global Variable
    inAppropriateMedsCombination = filteredPatients;

    // ==========================================================================
    // END ::::::::::::   Patients with inAppropriate Medication Combination  
    // ==========================================================================


    // ==========================================================================
    // START ::::::::::::   Patients with Non FDA THerapy Duration  
    // ==========================================================================

    let fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();
    //convert the string into Array
    fdaCompliantPeriods = fdaCompliantPeriods.split(',');

    //filter all non fda complaint records
    filteredPatients = _.filter(dataArray, (rec) => {
        return fdaCompliantPeriods.indexOf(rec.TREATMENT_PERIOD.toString()) == -1;
    });
    data.nonFDA = filteredPatients;

    // Global Variable
    nonFdaTherapyDuration = filteredPatients;

    // ==========================================================================
    // END ::::::::::::   Patients with Non FDA THerapy Duration  
    // ==========================================================================


    // ==========================================================================
    // START ::::::::::::   Relapsed Patients
    // ==========================================================================

    filteredPatients = _.filter(dataArray, (rec) => {
        return rec.IS_RELAPSED == 'Yes';
    });

    data.relapsed = filteredPatients;
    // Global Variable
    relapsedPatients = filteredPatients;
    // ==========================================================================
    // END ::::::::::::   Relapsed Patients
    // ==========================================================================

    // ==========================================================================
    // START ::::::::::::   Retreated Patients
    // ==========================================================================
    filteredPatients = _.filter(dataArray, (rec) => {
        return rec.IS_RETREATED == 'YES';
    });
    data.retreated = filteredPatients;
    // Global Variable
    retreatedPatients = filteredPatients;
    // ==========================================================================
    // END ::::::::::::   Retreated Patients
    // ==========================================================================

    // ==========================================================================
    // START ::::::::::::   Missing HCVRNA Patients
    // ==========================================================================

    filteredPatients = _.filter(dataArray, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT != null;
    });

    filteredPatients = _.filter(filteredPatients, (rec) => {
        return rec.IS_HAVE_HCV_RNA_PRIOR_TREATMENT.toUpperCase() == 'NO';
    });
    data.missingHCVRNA = filteredPatients;
    // Global Variable
    missingHCVRNA = filteredPatients;

    // ==========================================================================
    // END ::::::::::::   Missing HCVRNA Patients
    // ==========================================================================

    // ==========================================================================
    // START ::::::::::::   LAB Analysis
    // ==========================================================================

    filteredPatients = _.filter(labsAnalysisData, (rec) => {
        return rec.LAB_NM != null;
    });

    data.nolabs = filteredPatients;
    // Global Variable
    missingPrescriptions = filteredPatients;
    // ==========================================================================
    // END ::::::::::::   LAB Analysis
    // ==========================================================================

    // ==========================================================================
    // START ::::::::::::   No Refill
    // ==========================================================================

    filteredPatients = _.filter(dataArray, (rec) => {
        return rec.PRESCRIBED_TREATMENT_PERIOD != null;
    });

    //filter all fda complaint records
    filteredPatients = _.filter(filteredPatients, (rec) => {
        return fdaCompliantPeriods.indexOf(rec.PRESCRIBED_TREATMENT_PERIOD.toString()) != -1 && rec.PRESCRIBED_TREATMENT_PERIOD > rec.TREATMENT_PERIOD;
    });

    data.noRefill = filteredPatients;
    // Global Variable
    noRefill = filteredPatients;

    // ==========================================================================
    // END ::::::::::::   No Refill
    // ==========================================================================


    // ==========================================================================
    // START ::::::::::::   Missing SVR12
    // ==========================================================================

    filteredPatients = _.filter(dataArray, (rec) => {
        return rec.SVR12 == null;
    });
    // Global variable
    missingSVR12Patients = filteredPatients

    // ==========================================================================
    // END ::::::::::::   Missing SVR12
    // ==========================================================================



    let hepATotal = _.filter(dataArray, (rec) => {
        return rec.IS_HEP_A == 'Yes';
    });

    hepATotalPatients = hepATotal;

    let hepAVaccine = _.filter(hepATotal, (rec) => {
        return rec.IS_HEP_A_VACCINE == 'Yes';
    });

    hepAVaccinePatients = hepAVaccine;

    let hepBTotal = _.filter(dataArray, (rec) => {
        return rec.IS_HEP_B == 'Yes';
    });

    hepBTotalPatients = hepBTotal;

    let hepBVaccine = _.filter(hepBTotal, (rec) => {
        return rec.IS_HEP_B_VACCINE == 'Yes';
    });

    hepBVaccinePatients = hepBVaccine;

    return data;
}

let prepareWasteData = (dataArray, noPrescriptionData) => {
    let finalObj = {};
    let filterData = dataArray;

    let totalPatientsStatus = getPatientProviderCount(dataArray);

    //total patients filters
    finalObj.patientCount = totalPatientsStatus.patientCount;
    finalObj.providerCount = totalPatientsStatus.providerCount;
    // finalObj.overAllCost = getCostForPatients(dataArray);

    // finalObj.estimatedWasteCost = getEstimatedWasteCost(dataArray);

    //filter patients with completed status
    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_COMPLETED == 'Yes';
    // });

    filterData = completeTreatment;

    //data for patients with completed status
    // finalObj.completed = {
    //     patientCount: totalPatientsStatus.patientCount,
    //     providerCount: totalPatientsStatus.providerCount,
    //     innerData: getSVRStatusDataForPatients(filterData)
    // };
     finalObj.completed = {
        patientCount: totalPatientsStatus.patientCount,
        providerCount: totalPatientsStatus.providerCount
       // innerData: getSVRStatusDataForPatients(filterData)
    };

    //filter patients with discontinued status
    // filterData = _.filter(dataArray, (rec) => {
    //     return rec.IS_COMPLETED == 'No';
    // });

    // Added By Yuvraj  -- 14th June  (taking value from global variable.)
    filterData = incompleteAndTreatmentChange;

    // Split patients in Treatment Change and Incomplete Treatment.
    let filteredPatients = getTreatmentIncompleteAndTreatmentChangePatients(filterData);
        // discontinued Patients
    finalObj.discontinued = getPatientProviderCount(filteredPatients.incompleteTreatment);
   // finalObj.discontinued.totalCost = getCostForPatients(filteredPatients.incompleteTreatment);
   // finalObj.discontinued.innerData = getSVRStatusDataForPatients(filteredPatients.incompleteTreatment);

    // Patients with Treatmet Change
    finalObj.treatmentChange = getPatientProviderCount(filteredPatients.treatmentChange);
    // finalObj.treatmentChange.totalCost = getCostForPatients(filteredPatients.treatmentChange),
    //finalObj.treatmentChange.innerData = getSVRStatusDataForPatients(filteredPatients.treatmentChange);



    finalObj.nonfdaApprovedCombos = getDataForNonFdaApprovedCombos();

    finalObj.relapsedData = getRelapsedPatientsData();

    finalObj.svrData = getSVRStatusDataForPatients();

    finalObj.therapyDuration = getTherapyDurationData();

    finalObj.regimenData = getInappropriateRegimenData();

    finalObj.retreatmentData = getRetreatmentData();

    finalObj.hcvRNA = getHCVRNAData();

    // Not In USE
    finalObj.hcvRNARelapsed = getHCRNARelapsed();
    // Not In USE
    finalObj.hcvRNARetreated = getHCRNARetreated();


    finalObj.hcvNotFillingNextPrescription = getNotFillingNextPrescriptionData();
    // set no prescription data
    finalObj.hcvNoPrescription = getNoPrescriptionData(noPrescriptionData);

    // No Prescriptio should be "Null"- patients with no Medication and No viral load
    finalObj.noMedicationNoViralLoad = prepareDataForNewSection(noPrescriptionData);

    // viral load should be null and medication null -- patients with no Medication and No viral load  or ( No Medication No SVR 12 )
    finalObj.noMedicationNosvr12 = prepareDataForNewSection(noPrescriptionData, 'medicationOnly');

    // viral load should be null and medication null --   or (NO HCV RNA - No Medication )
    finalObj.nohcvRnaNoMedication = prepareDataForNewSection(noPrescriptionData, 'viralLoad');

    finalObj.hepAB = prepareHepABPatientsData(noPrescriptionData);

    return finalObj;
}

let isUniquePatientExist = (array , obj)=>{
    for( let i=0; i<array.length; i++) {
        
        if(array[i].PATIENT_ID_SYNTH == obj.PATIENT_ID_SYNTH
            && array[i].MEDICATION == obj.MEDICATION
            && array[i].TREATMENT_PERIOD == obj.TREATMENT_PERIOD) {
                return true;
            }
    }

    return false;

}