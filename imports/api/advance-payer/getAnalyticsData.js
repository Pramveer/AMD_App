import * as serverUtils from '../common/serverUtils.js';

/**
 * @author: Yuvraj Pal 9th March 17
 * @desc: Separated few functions in order to better understanding of code.
 */

let nonFdaApprovedCombos = ['DAKLINZA', 'OLYSIO', 'PEGASYS', 'PEGASYS + SOVALDI', 'RIBAVIRIN', 'RIBAVIRIN + TECHNIVIE', 'SOVALDI', 'TECHNIVIE'];

Meteor.syncMethods({
    /**
     * @author: Pramveer
     * @date: 10 Mar 17
     * @desc: changed the caller function
     */
    'getAnalyticsDataForPatients_Old_NOT_IN_USE': function(data, callback) {
        try {
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!_.isFunction(callback)) {
                return;
            }

            if (!(data instanceof Object))
                return;

            let filterMedsName = data.filteredMedications,
                filterMedsQuery = ``,
                fdaCompliantQuery = getFdaCompliantQuery(data.fdaCompliant);

            if (filterMedsName.length) {
                filterMedsQuery = `AND medication.MEDICATION IN(${serverUtils.getStrFromArray(filterMedsName)})`;
            }

            let whereClause = serverUtils.getQueryForAdvFilters(data),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (data.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            /**
             * Yuvraj Pal (16th Feb 2017)
             * commented because we are switching to PATIENT_ID_SYNTH.
             */

            // let query = `SELECT 
            // -- patients.GENOTYPE as genotype,
            // -- patients.CIRRHOSIS as cirrhosis,
            // -- patients.TREATMENT as treatment,
            // CONCAT(patients.GENOTYPE,'_',patients.TREATMENT,
            // (case WHEN patients.CIRRHOSIS =  'Yes' THEN '_Cirrhosis' ELSE "" END) ) as subpopulation,
            // medication.MEDICATION as medication,
            // medication.TREATMENT_PERIOD as treatment_Period,
            // avg(medication.DAYS_MEDICATION) as days_med,
            // medication.SVR12 as hcv_svr12,
            // count(medication.PATIENT_ID_SYNTH) as total, 
            // count(DISTINCT medication.PATIENT_ID_SYNTH) as uniqueTotal,
            // avg(medication.CHARGE) as claims_cost,

            // SUM(IS_HOSPITALIZED) as safety_admission_hospital, SUM(IS_DRUG_INTERACTION) as safety_drug_interactions, 
            // SUM(IS_LIVER_FAILURE ) as  safety_liver_failure, 
            // SUM(IS_ANIMIA) as safety_anemia, 
            // SUM(Symptomatic_Bradycardia) as Symptomatic_Bradycardia, SUM(High_ALT_Elevations) as High_ALT_Elevations,
            // SUM(Pulmonary_Disorders) as Pulmonary_Disorders, SUM(Pancreatitis) as Pancreatitis, 
            // SUM(Ophthalmologic_Disorders) as Ophthalmologic_Disorders,SUM(Hepatic_Failure) as Hepatic_Failure,
            // SUM(Bone_Marrow_Toxicity) as Bone_Marrow_Toxicity, SUM(Neuropsychiatric_Events) as Neuropsychiatric_Events,

            // SUM(Symptomatic_Bradycardia_COST) as Symptomatic_Bradycardia_COST,
            // SUM(Ophthalmologic_Disorders_COST) as Ophthalmologic_Disorders_COST,
            // SUM(Pulmonary_Disorders_COST) as Pulmonary_Disorders_COST,
            // SUM(High_ALT_Elevations_COST) as High_ALT_Elevations_COST,
            // SUM(Pancreatitis_COST) as Pancreatitis_COST,
            // SUM(Hepatic_Failure_COST) as Hepatic_Failure_COST,
            // SUM(Bone_Marrow_Toxicity_COST) as Bone_Marrow_Toxicity_COST,
            // SUM(Neuropsychiatric_Events_COST) as Neuropsychiatric_Events_COST

            // FROM 
            // IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS as patients
            // JOIN IMS_LRX_AmbEMR_Dataset.PATIENT_MEDICATIONS as medication
            // ON patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH

            // WHERE 
            // -- medication.VIRAL_LOAD IS NOT NULL AND 
            // -- medication.CHARGE > 0 AND
            // medication.CHARGE is NOT NULL AND 
            // medication.MEDICATION IS NOT NULL
            // AND patients.IDW_PATIENT_ID_SYNTH <> 0

            // ${whereClause}
            // ${filterMedsQuery}
            // ${fdaCompliantQuery}
            // ${preactiveAntivalsQuery}

            // GROUP BY subpopulation,medication.MEDICATION,medication.TREATMENT_PERIOD,medication.SVR12;`;


            /**
             * Yuvraj Pal (16th Feb 2017)
             * Added because we are switching to PATIENT_ID_SYNTH.
             */

            let query = `SELECT 
            -- patients.GENOTYPE as genotype,
            -- patients.CIRRHOSIS as cirrhosis,
            -- patients.TREATMENT as treatment,
            CONCAT(patients.GENOTYPE,'_',patients.TREATMENT,
            (case WHEN patients.CIRRHOSIS =  'Yes' THEN '_Cirrhosis' ELSE "" END) ) as subpopulation,
            medication.MEDICATION as medication,
            medication.TREATMENT_PERIOD as treatment_Period,
            avg(medication.DAYS_MEDICATION) as days_med,
            medication.SVR12 as hcv_svr12,
            count(medication.PATIENT_ID_SYNTH) as total, 
            count(DISTINCT medication.PATIENT_ID_SYNTH) as uniqueTotal,
            avg(medication.CHARGE) as claims_cost,

            SUM(IS_HOSPITALIZED) as safety_admission_hospital, SUM(IS_DRUG_INTERACTION) as safety_drug_interactions, 
            SUM(IS_LIVER_FAILURE ) as  safety_liver_failure, 
            SUM(IS_ANIMIA) as safety_anemia, 
            SUM(Symptomatic_Bradycardia) as Symptomatic_Bradycardia, SUM(High_ALT_Elevations) as High_ALT_Elevations,
            SUM(Pulmonary_Disorders) as Pulmonary_Disorders, SUM(Pancreatitis) as Pancreatitis, 
            SUM(Ophthalmologic_Disorders) as Ophthalmologic_Disorders,SUM(Hepatic_Failure) as Hepatic_Failure,
            SUM(Bone_Marrow_Toxicity) as Bone_Marrow_Toxicity, SUM(Neuropsychiatric_Events) as Neuropsychiatric_Events,

            SUM(Symptomatic_Bradycardia_COST) as Symptomatic_Bradycardia_COST,
            SUM(Ophthalmologic_Disorders_COST) as Ophthalmologic_Disorders_COST,
            SUM(Pulmonary_Disorders_COST) as Pulmonary_Disorders_COST,
            SUM(High_ALT_Elevations_COST) as High_ALT_Elevations_COST,
            SUM(Pancreatitis_COST) as Pancreatitis_COST,
            SUM(Hepatic_Failure_COST) as Hepatic_Failure_COST,
            SUM(Bone_Marrow_Toxicity_COST) as Bone_Marrow_Toxicity_COST,
            SUM(Neuropsychiatric_Events_COST) as Neuropsychiatric_Events_COST

            FROM 
            IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS as patients
            JOIN IMS_LRX_AmbEMR_Dataset.PATIENT_MEDICATIONS as medication
            ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH

            WHERE 
            -- medication.VIRAL_LOAD IS NOT NULL AND 
            -- medication.CHARGE > 0 AND
            medication.CHARGE is NOT NULL AND 
            medication.MEDICATION IS NOT NULL

            ${whereClause}
            ${filterMedsQuery}
            ${fdaCompliantQuery}
            ${preactiveAntivalsQuery}

            GROUP BY subpopulation,medication.MEDICATION,medication.TREATMENT_PERIOD,medication.SVR12;`;



            // console.log('****************Payer Tab Query******************');
            // console.log(query);

            let finalData = {};
            finalData['initialParams'] = data; //assign initial client params to the object
            finalData['medicationData'] = null;
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callback(error, "Failure");
                    return;
                } else {
                    if (result.length < 1) {
                        callback("error", false);
                        return;
                    }
                    finalData['patientsData'] = result; //assign the query result to the object
                    getNewMedicationsData(finalData, callback);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    'getAnalyticsDataForPatients': (data, callbackFn) => {
        let finalData = {};
        finalData.phsData = null;
        finalData.imsData = null;

        //Pram(28th Mar 17): Changes for rebate on selected dataset
        let originalRebate = data.rebateDiscount,
            rebateDataset = data.rebateDb;

        //rebate changes
        let clientRebate = 0,
            rweRebate = 0;

        if(rebateDataset == 'rwe') {
            clientRebate = 0;
            rweRebate = originalRebate;
        }
        else if(rebateDataset == 'customer') {
            clientRebate = originalRebate;
            rweRebate = 0;
        }
        //else for both dataset use same rebate 
        else if(rebateDataset == 'both'){
            clientRebate = rweRebate = originalRebate;
        }
        else {
             clientRebate = rweRebate = 0;
        }

        data.isPhsDataset = true;
        data.rebateDiscount = clientRebate; //make the rebate price for cleint dataset to 0
        //get data for default selection i.e. PHS 
        invokeAnalyticsDataForPatients(data, (defErr, defResult) => {
            //set default data 
            if (!defErr) {
                // console.log('******** PHS Default Data Fetched & Processed ********');
                finalData.phsData = defResult;

                //call again the above function to get IMS Data
                //override the data for filters
                data.plans = null;
                data.isPhsDataset = false;
                data.rebateDiscount = rweRebate; //asign the rebate value to the RWE
                invokeAnalyticsDataForPatients(data, (rweErr, rweResult) => {
                    if (!rweErr) {
                        // console.log('******** IMS RWE Data Fetched & Processed ********');
                        finalData.imsData = rweResult;

                        //compress & return the final Data
                        let stringified = JSON.stringify(mergeRWEDatasetWithClientDataset(defResult, rweResult));
                        let compressed_object = LZString.compress(stringified);

                        callbackFn(undefined, compressed_object);
                    }
                });
            }
             
            else {
                let stringified = JSON.stringify(null);
                let compressed_object = LZString.compress(stringified);
                callbackFn(true, {});
             }
        });
    }

});

/**
 * @author: Pramveer
 * @date: 
 * @desc: 
 */

let mergeRWEDatasetWithClientDataset = (clientDataset, rweDataset) => {
    let finalMergedData = clientDataset;

    let lastClientDrug = _.flatten(clientDataset).length;

    for (let keys in rweDataset) {
        lastClientDrug++;
        let currentObj = _.clone(rweDataset[keys]);

        //     currentObj.utilization = 0;
        //    // currentObj.total = phsDrugs[0].total;
        //     currentObj.count = 0;
        //     currentObj.unique_total = 0;

        finalMergedData[lastClientDrug] = currentObj;
    }


    return calculateValueScoreForMergedDataset(finalMergedData);
}

let calculateValueScoreForMergedDataset = (mergedDataset) => {
        let finalData = {};
        let groupedDataSet = _.groupBy(mergedDataset, 'category_id');
        let drugCount = 0;

        for (let keys in groupedDataSet) {
            let drugData = groupedDataSet[keys];
            let maxCost = _.max(_.pluck(drugData, 'standard_cost'));
            for (let i = 0; i < drugData.length; i++) {
                let drugObj = _.clone(drugData[i]);
                let cost_factor = ((maxCost - drugObj.standard_cost) / maxCost) * 100;
                let value = (drugObj.efficacy + drugObj.adherence + cost_factor) / 30;
                // console.log(drugObj.medication, '  ', drugObj.treatment_period, '   ', value);
                drugObj.value = value;
                drugObj.max_cost = maxCost;

                //Pram(18th May 17) : Added check if the drug has value score than only consider it in the object
                if(drugObj.value) {
                    finalData[drugCount] = drugObj;
                    drugCount++;
                }
            }
        }

        return finalData;
    }
    /**
     * @author: Pramveer
     * @date: 10 Mar 17
     * @desc: Made the intial call to wrap inside a function so that we can call it twice for two dataset
     */

let invokeAnalyticsDataForPatients = (data, callbackFn) => {
    try {
        if (!isValidUser({
                userId: this.userId
            })) {
            console.log('User not logged in');
            return undefined;
        }
        if (!_.isFunction(callbackFn)) {
            return;
        }

        if (!(data instanceof Object))
            return;

        let filterMedsName = data.filteredMedications,
            filterMedsQuery = ``,
            fdaCompliantQuery = getFdaCompliantQuery(data.fdaCompliant),
            rebateDiscount = data.rebateDiscount ? data.rebateDiscount : 0;
            rebateDiscount = rebateDiscount / 100;

        if (filterMedsName.length) {
            filterMedsQuery = `AND medication.MEDICATION IN(${serverUtils.getStrFromArray(filterMedsName)})`;
        }

        let whereClause = serverUtils.getQueryForAdvFilters(data),
            preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

        if (data.showPreactingAntivirals) {
            preactiveAntivalsQuery = ``;
        }

        /**
         * @author: Pramveer
         * @date: 10 Mar 17
         * @desc: Check for phs/ims dataset
         */

        let patientTable = '',
            medicationTable = '',
            isImsDrug = false;

        let nonFdaApprovedCombosQuery = '';
        

        //if query is to be for phs dataset
        if (data.isPhsDataset) {
            patientTable = 'PHS_HCV.PHS_HCV_PATIENTS';
            medicationTable = 'PHS_HCV.PHS_PATIENT_MEDICATIONS';
        } else {
            patientTable = 'IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS';
            medicationTable = 'IMS_LRX_AmbEMR_Dataset.PATIENT_MEDICATIONS';
            isImsDrug = true;
            nonFdaApprovedCombosQuery = ` AND medication.MEDICATION NOT IN (${serverUtils.getStrFromArray(nonFdaApprovedCombos)})`;
        }

        /**
         * Yuvraj Pal (16th Feb 2017)
         * Added because we are switching to PATIENT_ID_SYNTH.
         */

        let query = `SELECT 
        -- patients.GENOTYPE as genotype,
        -- patients.CIRRHOSIS as cirrhosis,
        -- patients.TREATMENT as treatment,
        GROUP_CONCAT(DISTINCT medication.PATIENT_ID_SYNTH) as patientIds,
        CONCAT(patients.GENOTYPE,'_',patients.TREATMENT,
        (case WHEN patients.CIRRHOSIS =  'Yes' THEN '_Cirrhosis' ELSE "" END) ) as subpopulation,
        medication.MEDICATION as medication,
        medication.TREATMENT_PERIOD as treatment_Period,
        avg(medication.DAYS_MEDICATION) as days_med,
        medication.SVR12 as hcv_svr12,
        count(medication.PATIENT_ID_SYNTH) as total, 
        count(DISTINCT medication.PATIENT_ID_SYNTH) as uniqueTotal,
        -- Pram(24th Mar 17): used rebate price on the medication charge 
        -- avg(medication.PAID) as claims_cost
        avg( medication.PAID -  (medication.PAID * ${rebateDiscount}) ) as claims_cost,

        SUM(IS_HOSPITALIZED) as safety_admission_hospital, SUM(IS_DRUG_INTERACTION) as safety_drug_interactions, 
        SUM(IS_LIVER_FAILURE ) as  safety_liver_failure, 
        SUM(IS_ANIMIA) as safety_anemia, 
        SUM(Symptomatic_Bradycardia) as Symptomatic_Bradycardia, SUM(High_ALT_Elevations) as High_ALT_Elevations,
        SUM(Pulmonary_Disorders) as Pulmonary_Disorders, SUM(Pancreatitis) as Pancreatitis, 
        SUM(Ophthalmologic_Disorders) as Ophthalmologic_Disorders,SUM(Hepatic_Failure) as Hepatic_Failure,
        SUM(Bone_Marrow_Toxicity) as Bone_Marrow_Toxicity, SUM(Neuropsychiatric_Events) as Neuropsychiatric_Events,

        SUM(Symptomatic_Bradycardia_COST) as Symptomatic_Bradycardia_COST,
        SUM(Ophthalmologic_Disorders_COST) as Ophthalmologic_Disorders_COST,
        SUM(Pulmonary_Disorders_COST) as Pulmonary_Disorders_COST,
        SUM(High_ALT_Elevations_COST) as High_ALT_Elevations_COST,
        SUM(Pancreatitis_COST) as Pancreatitis_COST,
        SUM(Hepatic_Failure_COST) as Hepatic_Failure_COST,
        SUM(Bone_Marrow_Toxicity_COST) as Bone_Marrow_Toxicity_COST,
        SUM(Neuropsychiatric_Events_COST) as Neuropsychiatric_Events_COST,
        ${isImsDrug} as isImsDrug

        FROM 
        ${patientTable} as patients
        JOIN ${medicationTable} as medication
        ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH

        WHERE 
        -- medication.VIRAL_LOAD IS NOT NULL AND 
        -- medication.PAID > 0 AND
        medication.PAID is NOT NULL AND 
        medication.MEDICATION IS NOT NULL AND
        patients.GENOTYPE IS NOT NULL AND
        patients.GENOTYPE <> '' 
        AND medication.DAYS_MEDICATION IS NOT NULL

        ${whereClause}
        ${filterMedsQuery}
        ${fdaCompliantQuery}
        ${preactiveAntivalsQuery}
        ${nonFdaApprovedCombosQuery}

        GROUP BY subpopulation,medication.MEDICATION,medication.TREATMENT_PERIOD,medication.SVR12;`;



        // console.log('****************Payer Tab Query******************');
        // console.log(query);

        let finalData = {};
        finalData['initialParams'] = data; //assign initial client params to the object
        finalData['medicationData'] = null;
        liveDb.db.query(query, function(error, result) {
            if (error) {
                callbackFn(error, "Failure");
                return;
            } else {
                if (result.length < 1) {
                    callbackFn(undefined, result);
                    return;
                }

                finalData['patientsData'] = result; //assign the query result to the object
                getNewMedicationsData(finalData, callbackFn);
            }
        });
    } catch (ex) {
        console.log(JSON.stringify(ex));
    }
}

//function to get new Medication data
function getNewMedicationsData(data, callback) {
    let params = data.initialParams;

    let genotypes = params.genotypes.length == 0 ? null : `genotype IN (${serverUtils.getStrFromArray(params.genotypes)})`,
        treatment = params.treatment.length == 0 ? null : `treatment IN (${serverUtils.getStrFromArray(params.treatment)})`,
        cirrhosis = params.cirrhosis.length == 0 ? null : `cirrhosis IN (${serverUtils.getStrFromArray(params.cirrhosis)})`,
        whereClause = ``,
        rebateDiscount = params.rebateDiscount ? params.rebateDiscount : 0,
        filterMedsQuery = ``;

    if (genotypes) {
        whereClause += ` AND ${genotypes}`;
    }
    if (treatment) {
        whereClause += ` AND ${treatment}`;
    }
    if (cirrhosis) {
        whereClause += ` AND ${cirrhosis}`;
    }

    //Pram (18th May 17) : Added meds query check for the user defined prescription also
    if(params.filteredMedications.length) {
        filterMedsQuery = `AND medication IN(${serverUtils.getStrFromArray(params.filteredMedications)})`;
    }


    let isImsDrug = true;
    // let query = `SELECT 
    //                 category_id,
    //                 CONCAT(genotype,'_',treatment,
    //                 (case WHEN cirrhosis =  'Yes' THEN '_Cirrhosis' ELSE "" END) ) as subpopulation,
    //                 treatmentPeriod, medication, cost, safety, adherence, efficacy
    //                 FROM IMS_LRX_AmbEMR_Dataset.new_prescription_list
    //                 WHERE medication IS NOT NULL ${whereClause}`;


    let query = `SELECT 
                    CATEGORY_ID as category_id,
                    CONCAT(GENOTYPE,'_',TREATMENT,
                    (case WHEN CIRRHOSIS =  'Yes' THEN '_Cirrhosis' ELSE "" END) ) as subpopulation,
                    ${isImsDrug} as isImsDrug,
                    TREATMENT_PERIOD as treatmentPeriod, MEDICATION as medication, COST as cost, 
                    SAFETY as safety, ADHERENCE as adherence , EFFICACY as efficacy
                    FROM NEW_PRESCRIPTION_LIST
                    WHERE medication IS NOT NULL 
                    ${whereClause}
                    ${filterMedsQuery}`;

    // console.log('********NEW MEDS FETCH QUERY*********');
    // console.log(query);

    let finalData = {};

    finalData['initialParams'] = params; //assign the initial params in the Object
    finalData['patientsData'] = data.patientsData; //assign the patients data in the Object
    finalData['newMedicationData'] = null;

    if (params.isPhsDataset) {
        liveDb.db.query(query, function(error, result) {
            if (error) {
                return;
            } else {
                //assign the patients data in the Object grouped on category id
                finalData['newMedicationData'] = _.groupBy(result, 'subpopulation');
                //call the function to perform all the calculations
                getPatientsDataForDrugs(finalData, callback);
            }
        });
    } else {
        finalData['newMedicationData'] = [];
        getPatientsDataForDrugs(finalData, callback);
    }


}

//function to fetch the patients data from the HCV_patients table
function getPatientsDataForDrugs(data, callback) {
    if (data.length < 1)
        callback(undefined, null);

    let params = data.initialParams;
    let newMedicationData = params.newMedicationData, // new medication data
        medications = [], // array for all medication names
        treatmentPeriods = []; // array for all treatment periods

    let finalData = {};

    finalData['initialParams'] = params; //assign the initial params in the Object
    finalData['patientsData'] = _.groupBy(data.patientsData, 'subpopulation'); //assign the patients data in the Object
    finalData['newMedicationData'] = data.newMedicationData; //assign new medication data in the Object
    //finalData['patientsData'] = null;

    preparePatientsData(finalData, callback);

}

//function to make calculations based on patients data & medication data
function preparePatientsData(data, callback) {
    let preparedData = {};
    let initialParams = data.initialParams, //get initial parameters
        patientsData = data.patientsData, //get patients data
        newMedicationData = data.newMedicationData, //get new medication data
        drugCount = 0, //counter for number of drugs
        allTotalDataRecords = 0,
        allUniquePatientsArray = [], //Array to store unique patient ids in each group
        subpopulationCount = 1; //counter for number of sub population
    //console.log(newMedicationData);


    // if(1){
    //     callback(undefined,data);
    //     return;
    // }

    //loop for all categories in the patient data
    for (var keys in patientsData) {
        var drugsData = patientsData[keys];

        allTotalDataRecords += _.pluck(drugsData,'total').sum();
        allUniquePatientsArray.push(_.pluck(drugsData, 'patientIds')); //push the unique ids in the array

        let max_cost = _.max(_.pluck(drugsData, 'claims_cost'));

        let totalCategoryPatients = 0, //total patients in category
            allTotalCategoryPatients = 0, //actual total patients
            uniqueTotalCategoryPatients = 0; //distinct patients in the category

        //group all the drugs on medication name & treatment period
        drugsData = _.groupBy(drugsData, function(rec) {
            return rec.medication + rec.treatment_Period
        });

        //
        for (let drugsGrp in drugsData) {
            let drugsGrpData = drugsData[drugsGrp];

            if(isConsiderableDrugs(drugsGrpData)){
                allTotalCategoryPatients += _.pluck(drugsGrpData,'total').sum();
                uniqueTotalCategoryPatients += _.pluck(drugsGrpData,'uniqueTotal').sum();
                totalCategoryPatients += _.pluck(drugsGrpData,'total').sum();
            }

            // for (let index = 0; index < drugsGrpData.length; index++) {
            //     let isSVRNull = drugsGrpData[index].hcv_svr12 == null ? true : false,
            //         isSingleGrp = drugsGrpData.length > 1 ? false : true,
            //         isZeroCost = drugsGrpData[index].claims_cost > 0 ? false : true;

            //     allTotalCategoryPatients += parseInt(drugsGrpData[index]['total']);
            //     uniqueTotalCategoryPatients += parseInt(drugsGrpData[index]['uniqueTotal']);

            //     if ((isSVRNull && isSingleGrp) || isZeroCost) {
            //         continue;
            //     }
            //     else {
            //         //set total category patients
            //         totalCategoryPatients += parseInt(drugsGrpData[index]['total']);
            //     }

            // }


        }

        //   console.log('**************drugsData***************');
        //   console.log(drugsData);

        //loop for drugs on medication name & treatment period
        for (var key in drugsData) {
            let drugs = drugsData[key];
            let dataObj = {};

            let total_cost_med = 0, //total cost for medication
                efficacy_len = 0, //efficacy length
                efficacy_patients_count = 0, //patient count for efficacy present data
                safety_count = 1, //counter for drug safety
                med_count = 0, //counter for days of medication
                currentDrugPatients = 0, //total patients in a particular medication
                sum_days_medication = 0, //total medication days
                //adverse reactions
                Symptomatic_Bradycardia = Ophthalmologic_Disorders = Pulmonary_Disorders = HighALT_Elevations = 0,
                Pancreatitis = Hepatic_Failure = Bone_Marrow_Toxicity = Neuropsychiatric_Events = 0,
                is_anemia = is_drug_interactions = liver_failure = 0;

            //adverse reactions cost
            Symptomatic_Bradycardia_Cost = Ophthalmologic_Disorders_Cost = Pulmonary_Disorders_Cost = HighALT_Elevations_Cost = 0,
                Pancreatitis_Cost = Hepatic_Failure_Cost = Bone_Marrow_Toxicity_Cost = Neuropsychiatric_Events_Cost = 0;



            //calculations for single drug in the category
            for (var j = 0; j < drugs.length; j++) {

                //exclude calculations for cases where svr is null or cost is zero
                //console.log('SVR Data ==> '+drugs[j].hcv_svr12);
                // if ((!(drugs[j].hcv_svr12) && (drugs.length == 1)) || (parseInt(drugs[j].claims_cost) == 0)) {
                //     //skip the therapy if single therapy is found for single length
                //     continue;
                // }
                if(!isConsiderableDrugs(drugs)) {
                    continue;
                }

                med_count = parseInt(drugs[j]['total']);
                currentDrugPatients += parseInt(drugs[j]['total']);
                total_cost_med += parseFloat(drugs[j]['claims_cost']);
                sum_days_medication += parseFloat(drugs[j]['days_med']);

                //sum the patients total if efficacy data is present for the drug
                if (drugs[j]['hcv_svr12']) {
                    efficacy_patients_count += parseInt(drugs[j]['total']);
                }

                if (drugs[j]['hcv_svr12'] == '1') {
                    efficacy_len += med_count;
                }

                /*if (drugs[j]['safety_admission_hospital'] != 0) {
                    safety_count += med_count;
                } else */
                if (parseInt(drugs[j]['safety_drug_interactions']) > 0) {
                    safety_count += med_count;
                    is_drug_interactions += parseInt(drugs[j]['safety_drug_interactions']);
                } else if (parseInt(drugs[j]['safety_liver_failure']) > 0) {
                    safety_count += med_count;
                    liver_failure += parseInt(drugs[j]['safety_liver_failure']);
                } else if (parseInt(drugs[j]['safety_anemia']) > 0) {
                    safety_count += med_count;
                    is_anemia += parseInt(drugs[j]['safety_anemia']);
                }

                //calculation of safety adverse reactions
                Symptomatic_Bradycardia += drugs[j]['Symptomatic_Bradycardia'];
                Ophthalmologic_Disorders += drugs[j]['Ophthalmologic_Disorders'];
                Pulmonary_Disorders += drugs[j]['Pulmonary_Disorders'];
                HighALT_Elevations += drugs[j]['High_ALT_Elevations'];
                Pancreatitis += drugs[j]['Pancreatitis'];
                Hepatic_Failure += drugs[j]['Hepatic_Failure'];
                Bone_Marrow_Toxicity += drugs[j]['Bone_Marrow_Toxicity'];
                Neuropsychiatric_Events += drugs[j]['Neuropsychiatric_Events'];


                //calculation of safety adverse reactions cost
                Symptomatic_Bradycardia_Cost += drugs[j]['Symptomatic_Bradycardia_COST'];
                Ophthalmologic_Disorders_Cost += drugs[j]['Ophthalmologic_Disorders_COST'];
                Pulmonary_Disorders_Cost += drugs[j]['Pulmonary_Disorders_COST'];
                HighALT_Elevations_Cost += drugs[j]['High_ALT_Elevations_COST'];
                Pancreatitis_Cost += drugs[j]['Pancreatitis_COST'];
                Hepatic_Failure_Cost += drugs[j]['Hepatic_Failure_COST'];
                Bone_Marrow_Toxicity_Cost += drugs[j]['Bone_Marrow_Toxicity_COST'];
                Neuropsychiatric_Events_Cost += drugs[j]['Neuropsychiatric_Events_COST'];

            }

            // console.log('Drug Group ==> ',key);
            // console.log('Drug Length ==> ',drugs.length);
            // console.log('Count Array ==> ',_.pluck(drugs,'total'));
            // console.log('SVR Array ==> ',_.pluck(drugs,'hcv_svr12'));
            // console.log('Drug Count ==> ', currentDrugPatients);
            // console.log('Category Count ==> ', totalCategoryPatients);
            // console.log();

            let total_reaction_count = (Symptomatic_Bradycardia + Ophthalmologic_Disorders + Pulmonary_Disorders + HighALT_Elevations +
                Pancreatitis + Hepatic_Failure + Bone_Marrow_Toxicity + Neuropsychiatric_Events);

            let patientDays = totalCategoryPatients * 7 * drugs[0]['treatment_Period'];
            let drugSafetyData = {
                anemia_count: is_anemia,
                liver_failure_count: liver_failure,
                drug_interaction_count: is_drug_interactions
            };

            sum_days_medication = sum_days_medication / j;
            dataObj['adherence'] = (sum_days_medication / (parseInt(drugs[0]['treatment_Period']) * 7)) * 100;

            dataObj['safety'] = 100 - ((safety_count / totalCategoryPatients) * 100);
            dataObj['medication'] = drugs[0]['medication'];
            dataObj['count'] = currentDrugPatients;
            dataObj['total'] = totalCategoryPatients;
            dataObj['actual_total'] = allTotalCategoryPatients;
            dataObj['unique_total'] = uniqueTotalCategoryPatients;
            dataObj['cost'] = Math.round(total_cost_med / j);
            let treatmentParam = drugs[0]['treatment_Period'] / 8;
            dataObj['standard_cost'] = dataObj['cost'] / treatmentParam;
            dataObj['max_cost'] = max_cost;
            dataObj['safe_check'] = '';
            //Pram(18th May 17): Changed the sub population id logic to be same for all dataset
            //dataObj['category_id'] = subpopulationCount; //parseInt(drugs[0]['category_id']);
            dataObj['category_id'] = serverUtils.getCategoryIdForSubpopulation(drugs[0]['subpopulation']);
            dataObj['category_name'] = drugs[0]['subpopulation'].split('_').join(' ');
            dataObj['drugid'] = drugCount + 1;
            dataObj['treatment_period'] = drugs[0]['treatment_Period'];
            //console.log("****OLD UTI with rounding off*****:");
            //console.log((dataObj['count'] / totalCategoryPatients) * 100);
            /**
             * @author: Arvind
             * @reviewer: 
             * @date: 06-Apr-2017
             * @desc: Created new method `toFixedWithoutRound` which fixed two decimal place without rounding off.
             * Previously we have issue with utilization goes >100 % due to rounding off.
             * `toFixedWithoutRound` method  path `../../startup/server/commonUtility`
             * * How to use
             * toFixedWithoutRound(anyNumber,decimalPrecision)
             * toFixedWithoutRound(23.3455,2) which return  23.34
            */


            dataObj['utilization'] = parseFloat(toFixedWithoutRound((dataObj['count'] / totalCategoryPatients) * 100,3));
             //console.log("****NEw UTI without rounding off*****:");
             //console.log(  dataObj['utilization']);
            dataObj['total_reaction_count'] = total_reaction_count;
            dataObj['efficacy'] = (efficacy_len / efficacy_patients_count) * 100;
            dataObj['efficacy_patients'] = efficacy_patients_count;
            dataObj['isImsDrug'] = drugs[0]['isImsDrug'];

            dataObj['drugSafetyData'] = JSON.stringify(drugSafetyData);

            /*console.log('*************************************');
            console.log(dataObj['medication']);
            console.log(efficacy_len,efficacy_patients_count);
            console.log(isNaN(dataObj['efficacy']));
            console.log('*************************************');
            console.log();
            console.log();*/

            //prepare object for adverse reactions for the drug
            dataObj['adverse'] = JSON.stringify({
                "Symptomatic_Bradycardia": { "count": Symptomatic_Bradycardia, "cost": Symptomatic_Bradycardia_Cost },
                "Ophthalmologic_Disorders": { "count": Ophthalmologic_Disorders, "cost": Ophthalmologic_Disorders_Cost },
                "Pulmonary_Disorders": { "count": Pulmonary_Disorders, "cost": Pulmonary_Disorders_Cost },
                "High_ALT_Elevations": { "count": HighALT_Elevations, "cost": HighALT_Elevations_Cost },
                "Pancreatitis": { "count": Pancreatitis, "cost": Pancreatitis_Cost },
                "Hepatic_Failure": { "count": Hepatic_Failure, "cost": Hepatic_Failure_Cost },
                "Bone_Marrow_Toxicity": { "count": Bone_Marrow_Toxicity, "cost": Bone_Marrow_Toxicity_Cost },
                "Neuropsychiatric_Events": { "count": Neuropsychiatric_Events, "cost": Neuropsychiatric_Events_Cost }
            });

            dataObj['comp_value'] = (total_reaction_count / patientDays) * 1000; //set complication rate for the drug
            dataObj['compli_cost'] = getComplicationsCost(dataObj['adverse']); //set complication cost for the drug

            var cost_factor = ((max_cost - dataObj['cost']) / max_cost) * 100;

            var value = (dataObj['adherence'] + dataObj['efficacy'] + cost_factor) / 30;

            //check for the efficacy value
            if (isNaN(dataObj['efficacy'])) {
                //value = (dataObj['adherence'] +  cost_factor) / 20;
                value = 0;
                dataObj['efficacy'] = 'NA';
            }

            dataObj['value'] = value;

            //set best value & best cost to 0 as it is calculated further
            dataObj['best_value'] = 0;
            dataObj['best_cost'] = 0;

            preparedData[drugCount] = dataObj; //asisign the drug calculation to the object
            drugCount++;
        }
        //console.log(newMedicationData[keys]);
        if (newMedicationData[keys]) {
            let newMedication = newMedicationData[keys],
                totalObj = {
                    total: totalCategoryPatients,
                    actual: allTotalCategoryPatients,
                    unique: uniqueTotalCategoryPatients,
                };
            //if(newMedication.length > 1) {
            for (let i = 0; i < newMedication.length; i++) {
                preparedData[drugCount] = prepareDataForNewMeds(newMedication[i], totalObj);
                drugCount++;
            }

            //} 
        }
        subpopulationCount++;
    }

    //pass the data to the function to compute the best value & best cost
    returnFinalData(preparedData, allTotalDataRecords , allUniquePatientsArray , callback);
}

//function to get complication cost based on the adverse reaction object of a drug
function getComplicationsCost(reactions) {
    reactions = JSON.parse(reactions); //parse the reactions object
    var totalComp_cost = 0; //complication cost

    //loop for all reactions in the object
    for (var keys in reactions) {
        var reactionData = reactions[keys];
        //set the complication cost
        totalComp_cost += Math.round(reactionData.count * reactionData.cost);
    }
    return totalComp_cost; //return the total complication cost for the drug
}

//function to prepare data for new medication
function prepareDataForNewMeds(data, totalObj) {
    var dataObj = {};

    dataObj['adherence'] = data.adherence;
    dataObj['safety'] = data.safety;
    dataObj['efficacy'] = data.efficacy;
    dataObj['efficacy_patients'] = 0;
    dataObj['cost'] = Math.round(data.cost);
    let treatmentParam = data.treatmentPeriod / 8;
    dataObj['standard_cost'] = Math.round(data.cost) / treatmentParam;
    //Pram(18th May 17): Changed the sub population id logic to be same for all dataset
    //dataObj['category_id'] = categoryId;
    dataObj['category_id'] = serverUtils.getCategoryIdForSubpopulation(data.subpopulation);
    dataObj['category_name'] = data.subpopulation.split('_').join(' ');
    dataObj['drugid'] = 0;
    dataObj['medication'] = data.medication;
    dataObj['treatment_period'] = data.treatmentPeriod;
    dataObj['count'] = 0;
    dataObj['total'] = totalObj.total;
    dataObj['actual_total'] = totalObj.actual;
    dataObj['unique_total'] = totalObj.unique;
    dataObj['isImsDrug'] = 0;
    dataObj['max_cost'] = 0;
    dataObj['safe_check'] = '';
    dataObj['utilization'] = 0;
    dataObj['total_reaction_count'] = 0;
    dataObj['adverse'] = JSON.stringify({
        "Symptomatic_Bradycardia": { "count": 0, "cost": 0 },
        "Ophthalmologic_Disorders": { "count": 0, "cost": 0 },
        "Pulmonary_Disorders": { "count": 0, "cost": 0 },
        "High_ALT_Elevations": { "count": 0, "cost": 0 },
        "Pancreatitis": { "count": 0, "cost": 0 },
        "Hepatic_Failure": { "count": 0, "cost": 0 },
        "Bone_Marrow_Toxicity": { "count": 0, "cost": 0 },
        "Neuropsychiatric_Events": { "count": 0, "cost": 0 }
    });

    dataObj['comp_value'] = 0; //set complication rate for the drug
    dataObj['compli_cost'] = 0; //set complication cost for the drug

    dataObj['value'] = 0;
    //set best value & best cost to 0 as it is calculated further
    dataObj['best_value'] = 0;
    dataObj['best_cost'] = 0;
    //Pram (22 Mar 17) : Make drug safety data 0 on user medications
    let drugSafetyData = {
        anemia_count: 0,
        liver_failure_count: 0,
        drug_interaction_count: 0
    };
    dataObj['drugSafetyData'] = JSON.stringify(drugSafetyData);

    return dataObj;
}

//function to calculate best value , best cost & return final data
function returnFinalData(dataObj, allTotalDataRecords, allUniquePatientsArray, callback) {
    var drugsCount = 0; // counter fot number of drugs
    var preparedData = {};
    var groupedCats = _.groupBy(dataObj, 'category_id'); //group the data on category id

    //Flatten the array for ids into single one
    allUniquePatientsArray = _.flatten(allUniquePatientsArray);

    let refinedPatientsArray = [];

    //loop for all ids and push them into single array
    for(let i=0;i<allUniquePatientsArray.length;i++) {
        refinedPatientsArray.push(allUniquePatientsArray[i].split(','));
    }

    //flatted the final array & calculated the unique once for each dataset as it was causing problem
    refinedPatientsArray = _.flatten(refinedPatientsArray);
    let uniquePatientIds = _.uniq(refinedPatientsArray).length;

    //loop for all categories
    for (var keys in groupedCats) {
        var drugs = groupedCats[keys];

        //sort all the drugs in a category on value score in descending order
        drugs.sort(function(a, b) {
            return b.value - a.value;
        });

        var bestValue = drugs[0]['value'], //best value for drugs in the category
            bestCost = drugs[0]['cost']; //best cost for drugs in the category
        max_cost = _.max(_.pluck(drugs, 'cost')); //max cost for drugs in the category

        //loop for all drugs and set best value & cost
        for (var i = 0; i < drugs.length; i++) {
            var drugObj = _(drugs[i]).clone();
            //   if(drugObj['count']) {
            if (drugObj['count'] || drugObj['drugid'] == 0) {
                drugObj['best_cost'] = bestCost; //set best cost
                drugObj['best_value'] = bestValue; //set best value
                drugObj['max_cost'] = max_cost; //set maximum cost
                drugObj['allTotalDataRecords'] = allTotalDataRecords; //set the all records 
                drugObj['uniquePatientIds'] = uniquePatientIds //_.uniq(refinedPatientsArray).length; //set all the unique records
                preparedData[drugsCount] = drugObj; //assign the drug in the object
                drugsCount++;
            }
        }

    }
    /**
     * @author: Pramveer
     * @date: 10 Mar 17
     * @desc: Don't compress the data object here as now we need to compress the whole object on the final return data
     *         for both IMS & PHS. 
     */

    // let stringified = JSON.stringify(preparedData);
    // let compressed_object = LZString.compress(stringified);

    // //return the final data
    // callback(undefined, compressed_object);

    callback(undefined, preparedData);
}

let getFdaCompliantQuery = (fdaCheck) => {
    if (fdaCheck.toLowerCase() === 'yes') {
        return `AND medication.TREATMENT_PERIOD IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else if (fdaCheck.toLowerCase() === 'no') {
        return `AND medication.TREATMENT_PERIOD NOT IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else {
        return ``;
    }
}

let isConsiderableDrugs = (drugsDataArray) => {
    let isConsiderable = false;
    
    for(let i = 0; i<drugsDataArray.length; i++) {
        if(drugsDataArray[i].hcv_svr12 != null) {
            isConsiderable = true;
        }
    }

    return isConsiderable;
}