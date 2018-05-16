/**
 * @author: Yuvraj
 * @date: 25th April 2017
 * @desc: 
 */

import * as serverUtils from '../../common/serverUtils.js';

//array for non fda complaint medication combinations
let nonFdaApprovedCombos = ['DAKLINZA', 'OLYSIO', 'PEGASYS', 'PEGASYS + SOVALDI', 'RIBAVIRIN', 'RIBAVIRIN + TECHNIVIE', 'SOVALDI', 'TECHNIVIE'];


Meteor.syncMethods({
    'getDataForInappropirateRegiemnts': (params, callBackFn) => {
        //params.duration = null;

        let whereClause = serverUtils.getQueryForAdvFilters(params),
            fdaCompliantQuery = serverUtils.getFdaCompliantQuery(params.fdaCompliant),
            preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;
        //PHS_DATASET.PHS_HCV_PATIENTS , PHS_DATASET.PHS_PATIENT_MEDICATIONS 

        if (params.showPreactingAntivirals) {
            preactiveAntivalsQuery = ``;
        }

        let dbConfig = serverUtils.getCurrentDatabaseConfiguration(dataObj.params);
        let query = ``;
        query = `Select medication.PATIENT_ID_SYNTH,medication.MEDICATION,medication.TREATMENT_PERIOD,med.CHARGE,medication.IS_INAPPROPRIATE_REGIMEN,EXPECTED_DOSAGE,MEDS_IMPROPER,GIVEN_DOSAGE,COUNT_DOSAGE,patients.GENOTYPE from ${dbConfig.tblRegimen} as medication 
                        JOIN ${dbConfig.pdatabase} as patients
                        ON medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                        JOIN ${dbConfig.mdatabase} med on med.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                        where 
                        medication.IS_INAPPROPRIATE_REGIMEN ='Yes'
                        ${whereClause}
                        ${fdaCompliantQuery}`;

        liveDb.db.query(query, function(error, result) {
            if (error) {
                callBackFn(error, "Failure");
            } else {
                if (result.length < 1) {
                    callBackFn("error", false);
                    return;
                }
                let dataObj = {};
                dataObj['regiments'] = getInAppropriateRegimentsData(result);

                let stringified = JSON.stringify(dataObj);
                let compressed_object = LZString.compress(stringified);
                //console.log("Processed & Prepared the Waste Data");
                callBackFn(undefined, compressed_object);
            }
        });
    },


    // added by Yuvraj 25th April, This fucntion is the copy of what we are using in the waste opportunity section.
    'getQATabData': (params, callBackFn) => {
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
                    patients.PATIENT_ID_SYNTH,
                    patients.NO_PRESCRIPTION,
                    patients.RACE_DESC as race,
                    patients.GENOTYPE,patients.CIRRHOSIS,
                    patients.TREATMENT,medication.MEDICATION, medication.TREATMENT_PERIOD,
                    medication.PROVIDER_ID_SYNTH,medication.PROVIDER_ST_CD, medication.IS_PREACTING_ANTIVIRAL,
                    medication.SVR12, medication.VIRAL_LOAD,
                    medication.IS_COMPLETED, medication.IS_RELAPSED, patients.IS_RETREATED,medication.IS_INAPPROPRIATE_REGIMEN,
                    (medication.PAID - (medication.PAID * ${rebateDiscount}) ) as CHARGE,
                    medication.IS_RELAPSED_CHANGE_TREATMENT as CHANGED_TREATMENT,
                    patients.IS_HAVE_HCV_RNA_PRIOR_TREATMENT,
                    medication.PRESCRIBED_TREATMENT_PERIOD 
                    FROM ${dbConfig.pdatabase} as patients 
                    LEFT JOIN 
                     ${dbConfig.mdatabase} as medication 
                    ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE patients.PATIENT_ID_SYNTH <> 0  
                    ${whereClause}
                    ${fdaCompliantQuery}
                    ${preactiveAntivalsQuery}`;

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

                let groupedData = _.groupBy(result, 'subpopulation');

                let categoriesData = {};

                //loop for all categories/ sub population
                // for (let keys in groupedData) {
                //     categoriesData[keys] = prepareCategoriesData(groupedData[keys]);
                // }

                categoriesData = prepareCategoriesData(result);

                dataObj['categories_data'] = categoriesData;
                dataObj['nonFdaData'] = getNonFdaCombosData(result);
                dataObj['therapyDurationData'] = getDataForTherapyDuration(result);

                fetchDataForInappropirateRegiemnts(dataObj, callBackFn);
                //callBackFn(undefined, compressed_object);
            }
        });
    }

});





/**
 * @author: Yuvraj
 * @date: 27th April 17
 * @desc: This function is been taken from waste opportunity section. this will provider us patient count for each chart.
 */
let prepareCategoriesData = (dataArray) => {
    let finalObj = {};

    let totalPatientsStatus = getPatientProviderCount(dataArray);

    //total patients filters
    finalObj.patientCount = totalPatientsStatus.patientCount;
    finalObj.providerCount = totalPatientsStatus.providerCount;

    finalObj.nonfdaApprovedCombos = getDataForNonFdaApprovedCombos(dataArray);

    finalObj.therapyDuration = getTherapyDurationData(dataArray);

    finalObj.regimenData = getInappropriateRegimenData(dataArray);

    return finalObj;
}


let fetchDataForInappropirateRegiemnts = (dataObj, callBackFn) => {

    let query = ``;
    let patienids = _.pluck(dataObj.data, 'PATIENT_ID_SYNTH').join(",");
    let dbConfig = serverUtils.getCurrentDatabaseConfiguration(dataObj.params);
    query = `Select medication.PATIENT_ID_SYNTH,medication.MEDICATION,medication.TREATMENT_PERIOD,med.CHARGE,
            medication.IS_INAPPROPRIATE_REGIMEN,EXPECTED_DOSAGE,MEDS_IMPROPER,
            GIVEN_DOSAGE,COUNT_DOSAGE,patients.GENOTYPE from ${dbConfig.tblRegimen} as medication 
                    LEFT JOIN ${dbConfig.pdatabase} as patients
                    ON medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH 
                    LEFT  JOIN (SELECT PATIENT_ID_SYNTH,IS_INAPPROPRIATE_REGIMEN,TREATMENT_PERIOD,MEDICATION,CHARGE from ${dbConfig.mdatabase}) as 
                     med on med.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                    where medication.PATIENT_ID_SYNTH IN (${patienids}) AND 
                    medication.IS_INAPPROPRIATE_REGIMEN ='Yes'`;
                // console.log('-------------------improper regiments query');
                // console.log(query);
    liveDb.db.query(query, function(error, result) {
        if (error) {
            callBackFn(error, "Failure");
        } else {
            if (result.length < 1) {
                callBackFn("error", false);
                return;
            }

            dataObj['regiments'] = getInAppropriateRegimentsData(result);

            let stringified = JSON.stringify(dataObj);
            let compressed_object = LZString.compress(stringified);
            //console.log("Processed & Prepared the Waste Data");
            callBackFn(undefined, compressed_object);
        }
    });
}



//Praveen 04/07/2017 prepare data forin appropriate regiments
let getInAppropriateRegimentsData = (baseData) => {

    let filterData = baseData;
    let chartData = {};
    chartData['regimentsdrilldown'] = null;
    chartData['regimentsCost'] = null;
    //check for in appropriate regiemnts data
    baseData = _.filter(baseData, (rec) => {
        return rec.TREATMENT_PERIOD < 84;
    });

    filterData = baseData.filter((rec) => rec['IS_INAPPROPRIATE_REGIMEN'] == 'Yes');

    let medicationgrpData = _.groupBy(filterData, 'MEDICATION');
    let regiemntsdata = [];
    let regiemntsDrilldowndata = [];
    let regiemntsCostData = [];
    let totalP = serverUtils.getUniqueCount(filterData,'PATIENT_ID_SYNTH');//filterData.length;
    for (let medication in medicationgrpData) {
        let json = {};
        let rjson = {};
        let cost = 0;
        rjson['fullName'] = medication;
        rjson['name'] = getDrugAbbr(medication);
        rjson['color'] = serverUtils.settingMedicationColor(medication);
        json['name'] = medication;
        let mData = medicationgrpData[medication];
        let lenM = serverUtils.getUniqueCount(mData,'PATIENT_ID_SYNTH');//mData.length;
        json['y'] = (lenM / totalP) * 100;
        rjson['count'] = lenM;
        json['count'] = lenM;
        json['color'] = serverUtils.settingMedicationColor(medication);
        for (let i = 0; i < lenM; i++) {
            cost += mData[i]['CHARGE'];
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
    return chartData;

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


let getFormattedCost = (dataArray) => {
    let cost = 0;

    cost = _.pluck(dataArray, 'CHARGE').sum();

    cost = serverUtils.autoFormatCostValue(cost);

    return '$' + cost;
}


let prepareRegimentsDrilldownData = (baseData, medication) => {

    let chartData = {};
    chartData['name'] = 'Treatment Period';
    chartData['id'] = medication + '_Drilldown';
    chartData['data'] = getPatientCountByRegimentDosage(baseData);
    return chartData;
}


let getPatientCountByRegimentDosage = (dataArray) => {
    let data = [];

    let groupedData = _.groupBy(dataArray, 'TREATMENT_PERIOD');
    let totalP = serverUtils.getUniqueCount(dataArray,'PATIENT_ID_SYNTH');
    for (let keys in groupedData) {
        let obj = {};
        let kdata = groupedData[keys];
        obj.name = keys;
        obj.medname = kdata[0]['MEDS_IMPROPER'];
        // modified By Yurvaj Set False;
        obj.isDrilldown = false;
        obj.actualDosage = kdata[0]['EXPECTED_DOSAGE'];
        obj.givenDosage = kdata[0]['GIVEN_DOSAGE'];
        obj.countDosage = getAvgCountdosage(kdata); //[0]['GIVEN_DOSAGE'];
        let len = serverUtils.getUniqueCount(kdata,'PATIENT_ID_SYNTH');//kdata.length;
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
        sum += baseData[i]['COUNT_DOSAGE'];
    }
    if (baseData.length) {
        return Math.round(sum / baseData.length);
    } else {
        return 0;
    }
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

        json.name = getDrugAbbr(keys);
        json.fullName = keys;
        json.y = serverUtils.getUniqueCount(groupedData[keys],'PATIENT_ID_SYNTH');//groupedData[keys].length;
        json.cost = getFormattedCost(groupedData[keys]);
        json.color = serverUtils.settingMedicationColor(keys);
        chartData.push(json);
    }

    finalData.therapyDistribution = chartData;
    finalData.genotypeDistribution = getPatientCountByGenotype(filteredData);
    //console.log('finalData.therapyDistribution ',finalData.therapyDistribution);
    return finalData;

}

let getPatientCountByGenotype = (dataArray) => {
    let data = [];

    let groupedData = _.groupBy(dataArray, 'GENOTYPE');

    for (let keys in groupedData) {
        let obj = {};

        obj.name = keys;
        obj.y = serverUtils.getUniqueCount(groupedData[keys],'PATIENT_ID_SYNTH');//groupedData[keys].length;
        obj.count = obj.y;
        obj.cost = getFormattedCost(groupedData[keys]);

        data.push(obj);
    }

    //sort data on genotype name (1a, 1b, 2, 3, 4)

    data.sort((a, b) => a.name.replace(/\D+/g, '') - b.name.replace(/\D+/g, ''));

    return data;
}



let getDataForTherapyDuration = (dataArray) => {
    let fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();

    //convert the string into Array
    fdaCompliantPeriods = fdaCompliantPeriods.split(',');

    //filter all non fda complaint records
    let filteredData = _.filter(dataArray, (rec) => {
        return rec.TREATMENT_PERIOD && fdaCompliantPeriods.indexOf(rec.TREATMENT_PERIOD.toString()) == -1;
    });

    let chartData = [],
        drilldownData = [];

    let groupedData = _.groupBy(filteredData, 'GENOTYPE');

    for (let keys in groupedData) {
        let data = groupedData[keys];
        let json = {};

        json.name = keys;
        json.y = serverUtils.getUniqueCount(data,'PATIENT_ID_SYNTH');//data.length;
        json.cost = getFormattedCost(data);
        json.drilldown = keys + '_DrillDown';

        chartData.push(json);
        drilldownData.push(prepareTherapyDrillDownData(keys, data));

    }

    return {
        data: chartData,
        drilldown: drilldownData
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

let getPatientCountByTherapyWeeks = (dataArray) => {
    let data = [];

    let groupedData = _.groupBy(dataArray, 'TREATMENT_PERIOD');

    for (let keys in groupedData) {
        let obj = {};

        obj.name = keys;
        obj.y = serverUtils.getUniqueCount(groupedData[keys],'PATIENT_ID_SYNTH');//groupedData[keys].length;
        obj.cost = getFormattedCost(groupedData[keys]);

        data.push(obj);
    }

    return data;
}




let getPatientProviderCount = (dataArray) => {

    return {
        patientCount: serverUtils.getUniqueCount(dataArray,'PATIENT_ID_SYNTH'),
        providerCount: serverUtils.getUniqueCount(dataArray,'PROVIDER_ID_SYNTH')
    };
}


let getDataForNonFdaApprovedCombos = (dataArray) => {
    //let nonFdaApprovedCombos = ['DAKLINZA', 'EPCLUSA', 'EPCLUSA + RIBAVIRIN', 'OLYSIO', 'PEGASYS', 'PEGASYS + SOVALDI', 'RIBAVIRIN', 'RIBAVIRIN + ZEPATIER', 'SOVALDI', 'TECHNIVIE', 'ZEPATIER'];

    let filteredData = _.filter(dataArray, (rec) => {
        return nonFdaApprovedCombos.indexOf(rec.MEDICATION) > -1;
    });

    let nonfdaCombos = {};

    nonfdaCombos = getPatientProviderCount(filteredData);
    // nonfdaCombos.totalCost = getCostForPatients(filteredData);

    return nonfdaCombos;
}

//function to prepare data for the therapy duration
let getTherapyDurationData = (dataArray) => {
    let durationObj = {},
        fdaCompliantPeriods = serverUtils.getFDACompliantTreatmentPeriod();

    //convert the string into Array
    fdaCompliantPeriods = fdaCompliantPeriods.split(',');

    //filter all non fda complaint records
    let filteredData = _.filter(dataArray, (rec) => {
        return rec.TREATMENT_PERIOD && fdaCompliantPeriods.indexOf(rec.TREATMENT_PERIOD.toString()) == -1;
    });

    durationObj = getPatientProviderCount(filteredData);
    // durationObj.totalCost = getCostForPatients(filteredData);
    // durationObj.innerData = getSVRStatusDataForPatients(filteredData);


    return durationObj;
}


//function to prepare data for inappropriate regimens
let getInappropriateRegimenData = (dataArray) => {
    let regimenObj = {};

    let filteredData = _.filter(dataArray, (rec) => {
        return rec.IS_INAPPROPRIATE_REGIMEN != null;
    });

    filteredData = _.filter(filteredData, (rec) => {
        return rec.IS_INAPPROPRIATE_REGIMEN.toUpperCase() == 'YES';
    });

    regimenObj = getPatientProviderCount(filteredData);
    // regimenObj.totalCost = getCostForPatients(filteredData);
    // regimenObj.innerData = getSVRStatusDataForPatients(filteredData);

    return regimenObj;
}