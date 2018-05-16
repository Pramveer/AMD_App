/*
    Backend api for comorbidity tab.
*/
import * as serverUtils from '../../../common/serverUtils.js';


Meteor.syncMethods({
  // query for comorbity tab.
    'getComorbidity': function(params, callback) {
        try {
            // Early exit condition
            // console.log('--  start getComorbidity');
            if (!isValidUser({
                    userId: this.userId
                })) {
                //console.log('User not logged in');
                return undefined;
            }
            if (!isValidParams({
                    params: params,
                    cb: callback
                })) {
                //console.log('Invalid Parameters');
                return undefined;
            }

            // @Yuvraj 13th Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "analytics_comorbidity_data"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callback(undefined, data);
                }, 50);
                return false;
            }

            let whereClause = serverUtils.getQueryForAdvFilters(params);
            let preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            // console.log('preactiveAntivalsQuery');
            // console.log(preactiveAntivalsQuery);
            let query = ``,
                dataObj = {};

            // dataObj['pharmaComorbidity'] = null;

            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */


            //     query = `select c.BILLG_ICD9_CD,patients.PATIENT_ID_SYNTH,c.Comorbidity,c.ICD9_Codes,medication.MEDICATION ,patients.GENOTYPE ,patients.CIRRHOSIS ,
            //         patients.TREATMENT ,medication.SVR_BEFORE ,medication.SVR_AFTER ,  case when (IFNULL(medication.SVR_BEFORE, 0) <> 0 and IFNULL(medication.SVR_AFTER, 0) > 0)
            //         then 'Detectable SVR' else 'Undetectable SVR'
            //     end as SVR_Result,DIAGNOSIS_DESC  from  IMS_HCV_MEDICATIONS_COMORBIDITY c
            //     join IMS_HCV_PATIENTS patients on c.IDW_PATIENT_ID_SYNTH=patients.IDW_PATIENT_ID_SYNTH
            //     join PATIENT_MEDICATIONS medication on medication.IDW_PATIENT_ID_SYNTH=patients.IDW_PATIENT_ID_SYNTH
            //     Where medication.MEDICATION IS NOT NULL AND patients.IDW_PATIENT_ID_SYNTH <> 0 and SVR_CURE_RATE_FLAG=1
            // ${whereClause} ${preactiveAntivalsQuery};`;
            /**
             * @author: Nisha
             * @date: 17th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

            query = `SELECT ${dbConfig.ICD9_CD} as BILLG_ICD9_CD,
                        patients.PATIENT_ID_SYNTH,
                        c.Comorbidity,
                        c.ICD9_Codes,
                        medication.MEDICATION,
                        medication.IS_PREACTING_ANTIVIRAL,
                        medication.SVR12,
                        patients.GENOTYPE,
                        patients.CIRRHOSIS,
                        patients.TREATMENT,
                        case when (IFNULL(medication.SVR12, 0) <> 0) then 'SVR12 Achieved' else 'SVR12 Not Achieved' end as SVR_Result,
                        DIAGNOSIS_DESC
                    from ${dbConfig.tblHcvPatient} patients
                    left join ${dbConfig.tblComorbidity} c
                        on patients.PATIENT_ID_SYNTH = c.PATIENT_ID_SYNTH
                    left join ${dbConfig.tblPatientMedication} medication
                        on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    Where medication.MEDICATION IS NOT NULL
                ${whereClause} ${preactiveAntivalsQuery};`;
            // removed by jayesh 26th May 2017 for get actually count with medication, svr, comorbidty.
            //   AND medication.SVR_CURE_RATE_FLAG=1 AND c.Comorbidity IS NOT NULL

            // console.log("****Comorbidity Query");
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    // dataObj['pharmaComorbidity'] = result;
                    //result = serverUtils.filterPreactingAntivirals(result, params.showPreactingAntivirals);
                    let stringified = JSON.stringify(prepareComorbiditiesWithICDChartsData({
                        data: result
                    }));
                    //  console.log('Source:'+stringified.length);
                    let compressed_object = LZString.compress(stringified);

                    // @author: Yuvraj 13th Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "analytics_comorbidity_data",
                        data: compressed_object
                    });
                    caching.updateData();

                    callback(undefined, compressed_object);
                    // callback(undefined, dataObj);
                }
            });
        } catch (ex) {
            //console.log(JSON.stringify(ex));
        }
    },

    /**
     * Yuvraj (13th Feb 17) this function was written in the methods file of pharma tab.
     * I have just copied it here and changed it name to avoid conflict with pharma tab.
     */
    //get the extrahepatic data
    'getAnalyticsExtraHepaticData': function(params, callbackFn) {
        try {
            // Early exit condition
            if (!isValidUser({
                    userId: this.userId
                })) {
                //console.log('User not logged in');
                return undefined;
            }
            if (!isValidParams({
                    params: params,
                    cb: callbackFn
                })) {
                //console.log('Invalid Parameters');
                return undefined;
            }

            // @Yuvraj 13th Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "analytics_extra_hepatic_data"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callbackFn(undefined, data);
                }, 50);
                return false;
            }


            let query = ``;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // query = `SELECT distinct patients.IDW_PATIENT_ID_SYNTH,patients.GENOTYPE,patients.CIRRHOSIS,patients.TREATMENT,patients.FibrosureValue as fibro_Value,
            //     symptoms.ARTHRALGIA,symptoms.ARTHRITIS,symptoms.CEREBRAL,symptoms.CRYOGLOBULINEMIA,symptoms.FATIGUE,symptoms.FIBROMYALGIA,symptoms.CARDIOMYOPATHY,
            //     symptoms.IDIOPATHIC_THROMBOCYTOPENIC_PURPURA,symptoms.INSULIN_RESISTANCE,symptoms.LICHEN_MYXOEDEMATOUS,symptoms.MULTIPLE_MYELOMA,symptoms.NEUTROPENIA,
            //     symptoms.PARESTHESIA,
            //     symptoms.ARTHRALGIA_COST,symptoms.ARTHRITIS_COST,symptoms.CEREBRAL_COST,symptoms.CRYOGLOBULINEMIA_COST,symptoms.FATIGUE_COST,symptoms.FIBROMYALGIA_COST,
            //     symptoms.CARDIOMYOPATHY_COST,symptoms.IDIOPATHIC_THROMBOCYTOPENIC_PURPURA_COST,symptoms.INSULIN_RESISTANCE_COST,symptoms.LICHEN_MYXOEDEMATOUS_COST,
            //     symptoms.MULTIPLE_MYELOMA_COST,symptoms.NEUTROPENIA_COST,symptoms.PARESTHESIA_COST
            //     FROM IMS_HCV_PATIENTS as patients JOIN IMS_PATIENT_SYMPTOMS as symptoms
            //     ON patients.IDW_PATIENT_ID_SYNTH = symptoms.IDW_PATIENT_ID_SYNTH
            //     join PATIENT_MEDICATIONS as medication on
            //     medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
            //     WHERE patients.IDW_PATIENT_ID_SYNTH <> 0
            //     ${whereClause}
            //     ${preactiveAntivalsQuery}`;

            /**
             * @author: Nisha
             * @date: 17th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */

            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

            query = `SELECT
                        distinct patients.PATIENT_ID_SYNTH,
                        patients.GENOTYPE,
                        patients.CIRRHOSIS,
                        patients.TREATMENT,
                        patients.FibrosureValue as fibro_Value,
                        symptoms.ARTHRALGIA,
                        symptoms.ARTHRITIS,
                        symptoms.CEREBRAL,
                        symptoms.CRYOGLOBULINEMIA,
                        symptoms.FATIGUE,
                        symptoms.FIBROMYALGIA,
                        symptoms.CARDIOMYOPATHY,
                        symptoms.IDIOPATHIC_THROMBOCYTOPENIC_PURPURA,
                        symptoms.INSULIN_RESISTANCE,
                        symptoms.LICHEN_MYXOEDEMATOUS,
                        symptoms.MULTIPLE_MYELOMA,
                        symptoms.NEUTROPENIA,
                        symptoms.PARESTHESIA,
                        symptoms.CANCER,
                        symptoms.ARTHRALGIA_COST,
                        symptoms.ARTHRITIS_COST,
                        symptoms.CEREBRAL_COST,
                        symptoms.CRYOGLOBULINEMIA_COST,
                        symptoms.FATIGUE_COST,
                        symptoms.FIBROMYALGIA_COST,
                        symptoms.CARDIOMYOPATHY_COST,
                        symptoms.IDIOPATHIC_THROMBOCYTOPENIC_PURPURA_COST,
                        symptoms.INSULIN_RESISTANCE_COST,
                        symptoms.LICHEN_MYXOEDEMATOUS_COST,
                        symptoms.MULTIPLE_MYELOMA_COST,
                        symptoms.NEUTROPENIA_COST,
                        symptoms.PARESTHESIA_COST,
                        symptoms.CANCER_COST 
                    FROM ${dbConfig.tblHcvPatient} as patients
                    LEFT JOIN ${dbConfig.tblPatientSymptoms} as symptoms
                        ON patients.PATIENT_ID_SYNTH = symptoms.PATIENT_ID_SYNTH
                    LEFT JOIN ${dbConfig.tblPatientMedication} as medication
                        ON medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                    WHERE 1
                    ${whereClause} ${preactiveAntivalsQuery};`;

            // console.log('*****************Extra Hepatic Query ********************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //result = serverUtils.filterPreactingAntivirals(result, params.showPreactingAntivirals);
                    let chartData = prepareDataForExtraHepaticChart(result);
                    //console.log("getExtraHepaticData");
                    let stringyfyResult = JSON.stringify(chartData);
                    //console.log("Before Compressed:"+stringyfyResult.length);
                    let compressedResult = LZString.compress(stringyfyResult);
                    //console.log("After Compressed:"+compressedResult.length);

                    // @author: Yuvraj 13th Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "analytics_extra_hepatic_data",
                        data: compressedResult
                    });
                    caching.updateData();

                    callbackFn(undefined, compressedResult);
                }
            });
        } catch (ex) {
            //console.log(JSON.stringify(ex));
        }
    },
});



/**
 * Description : Prepare required charts data for Comorbidity
 */
let prepareComorbiditiesWithICDChartsData = ({ data }) => {
    let finalData = {};

    // Added by jayesh 26th May 2017 for prepared count for
    //medication.SVR_CURE_RATE_FLAG=1 AND c.Comorbidity IS NOT NULL 
    // unique patient with medication,
    finalData.uniquePatientWithMedicationCount = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
    // unique patient with medication & BEFORE/AFTER SVR,
    data = _.filter(data, (rec) => { return rec.SVR12; });
    finalData.uniquePatientWithSVR12Count = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
    finalData.uniquePatientWithSVR12CountPer = parseFloat((finalData.uniquePatientWithSVR12Count * 100)/finalData.uniquePatientWithMedicationCount).toFixed(2); 
    // unique patient with medication & BEFORE/AFTER SVR, Comorbidity.
    data = _.filter(data, (rec) => { return rec.Comorbidity; });
    finalData.uniquePatientWithComorbidityCount = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
   finalData.uniquePatientWithComorbidityCountPer = parseFloat((finalData.uniquePatientWithComorbidityCount * 100)/finalData.uniquePatientWithSVR12Count).toFixed(2); 

    //remove extra text from Comorbidity
    data = _.map(data, (item) => { item.Comorbidity = item.Comorbidity.split(',')[0]; return item; });
    let groupedSVRData = _.groupBy(data, 'SVR_Result');
    let genotypePatientCount = {}, genotypeGroupedData = _.groupBy(data, 'GENOTYPE');
    
    for(let key in genotypeGroupedData){
        genotypePatientCount[key] = serverUtils.getUniqueCount(genotypeGroupedData[key], 'PATIENT_ID_SYNTH');
    }

    let preparedData = [];

    let categories = _.pluck(_.uniq(data, (item) => { return item.Comorbidity; }), 'Comorbidity');
    let drilldown = 0;

    let DataICD = [];

    for (let keys in groupedSVRData) {
        drilldown++;
        let jsonObj = {},
            groupedComorbidity = _.groupBy(groupedSVRData[keys], 'Comorbidity');

        let DataSVR = [];

        for (let j = 0; j < categories.length; j++) {

            let itemSVR = {};

            itemSVR.name = categories[j];
            if (groupedComorbidity[categories[j]]) {
                let itemICD = {};
                //Updated By jayesh 26th May 2017 for prepared unique patient count 
               // itemSVR.y = groupedComorbidity[categories[j]].length;
                itemSVR.y = serverUtils.getUniqueCount(groupedComorbidity[categories[j]], 'PATIENT_ID_SYNTH');

                itemICD.id = categories[j] + drilldown;

                itemICD.name = keys;
                itemICD.type = 'column';
                itemICD.title = categories[j];
                //    itemICD.definition = DIAGNOSIS_DESC
                let tempData = [];
                groupedComorbidity[categories[j]] = _.sortBy(groupedComorbidity[categories[j]], (rec) => { return rec.BILLG_ICD9_CD; });
                let tempGroupClinicalCode = _.groupBy(groupedComorbidity[categories[j]], 'BILLG_ICD9_CD');
                for (let tempKey in tempGroupClinicalCode) {
                    if (tempGroupClinicalCode[tempKey].length > 0) {
                        tempData.push({ 
                            name: tempKey, 
                            //Updated By jayesh 26th May 2017 for prepared unique patient count 
                            //  y: tempGroupClinicalCode[tempKey].length, 
                            y:  itemSVR.y = serverUtils.getUniqueCount(tempGroupClinicalCode[tempKey], 'PATIENT_ID_SYNTH'),
                            'CodeDesc': tempGroupClinicalCode[tempKey][0].DIAGNOSIS_DESC });
                    }
                }
                itemICD.data = tempData;
                DataICD.push(itemICD);
            } else {
                itemSVR.y = 0;
            }

            itemSVR.drilldown = categories[j] + drilldown;
            DataSVR.push(itemSVR);
        }

        jsonObj['name'] = keys;
        jsonObj['data'] = DataSVR;
        jsonObj['type'] = 'column',

            preparedData.push(jsonObj);
    }

    finalData.patientData = data;
    finalData.comorbidityDrillDownData = DataICD;
    finalData.comorbidityChartData = preparedData.reverse();

    finalData.comorbidityCategories = categories;
    //Data for preparing patients distribution by genotype on comorbidity page
    finalData.genotypeTableData = genotypePatientCount;
    finalData.TotalN = finalData.uniquePatientWithComorbidityCount;
    return finalData;
};


/**
 * @author Yuvraj Pal 13th Feb 17
 * The following function were written in Utilities file for pharma but they were also being used in the analytics tab.
 * I have moved them here So that it will clear that they may be used at multiple places.
 */
/**
 * @author: Jayesh
 * @reviewer: 
 * @date: 31th May 2017 
 * @desc: separated this method from pharma for unique patient count changes and comparative funcationality changes.
*/
//function to prepare extra hepatic charts
let prepareDataForExtraHepaticChart = (baseData) => {
    let allSymptoms = ['ARTHRALGIA', 'ARTHRITIS', 'CEREBRAL', 'CRYOGLOBULINEMIA',
        'FATIGUE', 'FIBROMYALGIA', 'CARDIOMYOPATHY', 'IDIOPATHIC_THROMBOCYTOPENIC_PURPURA',
        'INSULIN_RESISTANCE', 'LICHEN_MYXOEDEMATOUS', 'MULTIPLE_MYELOMA', 'NEUTROPENIA', 'PARESTHESIA', 'CANCER'
    ];
    let symptomsCount = {},
        symptomsCost = {};

    let tempSymptomsCount = [],
        symptomsGenotypeData = [],
        symptomsCirrhosisData = [],
        symptomsTreatmentData = [],
        symptomsFibStageData = [],
        tempSymptomsCost = [];

    for (let i = 0; i < allSymptoms.length; i++) {
        let currentSymptom = allSymptoms[i],
            filterSympObj = {};

        filterSympObj[currentSymptom] = 1;
        // console.log(filterSympObj);
        let symptomsData = _.where(baseData, filterSympObj);

        //object data for particular symptom
        // tempSymptomsCount.push({name:currentSymptom,y:symptomsData.length,patientPercentage:Math.round(symptomsData.length*100/baseData.length)/100});
        // tempSymptomsCount.push({
        //     name: currentSymptom,
        //     y: symptomsData.length,
        //     patientPercentage: (parseFloat(symptomsData.length / baseData.length) * 100).toFixed(2)
        // });
        let uniquePatientCount = serverUtils.getUniqueCount(symptomsData, 'PATIENT_ID_SYNTH');
        tempSymptomsCount.push({
            name: currentSymptom,
            y: uniquePatientCount,
            patientPercentage: (parseFloat(uniquePatientCount / serverUtils.getUniqueCount(baseData, 'PATIENT_ID_SYNTH')) * 100).toFixed(2)
        });

        //object data for symptom cost distribution
        let cost = [];
        if (symptomsData.length > 0) {
            for (let j = 0; j < symptomsData.length; j++) {
                //prepare cost data for particular symptom
                let tempCost = parseInt(symptomsData[j][currentSymptom + '_COST']);
                if (tempCost > 0) {
                    cost.push(tempCost);
                }
            }
        }
        if (cost.length > 0) {
            let costSum = _.reduce(cost, function(a, b) {
                return a + b;
            }, 0);
            tempSymptomsCost.push({
                name: currentSymptom,
                y: costSum,
                patientCount: cost.length
            });
        }
    }

    symptomsCount.name = 'Patient Count';
    symptomsCount.data = tempSymptomsCount;
    symptomsCost.name = 'Avg Cost';
    symptomsCost.data = tempSymptomsCost;


    baseData = _.sortBy(baseData, (rec) => {
        return rec.GENOTYPE;
    });
    //object data for symptom genotype distribution
    symptomsGenotypeData = getSymptomCountByGroups(_.groupBy(baseData, 'GENOTYPE'), allSymptoms);

    //object data for symptom cirrhosis distribution
    symptomsCirrhosisData = getSymptomCountByGroups(_.groupBy(baseData, 'CIRRHOSIS'), allSymptoms);

    //object data for symptom treatment distribution
    symptomsTreatmentData = getSymptomCountByGroups(_.groupBy(baseData, 'TREATMENT'), allSymptoms);

    //object data for symptom fib stage distribution
    symptomsFibStageData = getSymptomCountByFibStage(baseData, allSymptoms);


    let finalDataObj = {
        // symptomsPatientData:baseData ,
        symptomsUniquePatientCount: serverUtils.getUniqueCount(baseData, 'PATIENT_ID_SYNTH'),
        symptomsCount: [symptomsCount],
        symptomsCost: [symptomsCost],
        symptomsGenotypeCount: symptomsGenotypeData,
        symptomsCirrhosisCount: symptomsCirrhosisData,
        symptomsTreatmentCount: symptomsTreatmentData,
        symptomsFibStageCount: symptomsFibStageData
    };

    return finalDataObj;
}



//function to get group wise count for symptom
let getSymptomCountByGroups = (groupedData, allSymptoms) => {
    let prepareFinalData = [];

    for (let keys in groupedData) {
        let tempData = [];
        for (let i = 0; i < allSymptoms.length; i++) {
            let currentSymptom = allSymptoms[i],
                filterSympObj = {};

            filterSympObj[currentSymptom] = 1;

            let symptomsData = _.where(groupedData[keys], filterSympObj);

            tempData.push({
                name: currentSymptom,
                y: serverUtils.getUniqueCount(symptomsData, 'PATIENT_ID_SYNTH')
            });
        }
        prepareFinalData.push({
            name: keys,
            data: tempData
        });
    }
    return prepareFinalData;
}

//function to get fib stage wise count for symptom
let getSymptomCountByFibStage = (symptomDataArray, allSymptoms) => {
    //filter irrelevant data
    symptomDataArray = symptomDataArray.filter((d) => !isNaN(parseFloat(d.fibro_Value)));

    let groupedData = _.groupBy(symptomDataArray, (rec) => {
        let fibroValue = parseFloat(rec.fibro_Value).toFixed(2);

        if (fibroValue >= 0 && fibroValue <= 0.21)
            return "F0";
        if (fibroValue >= 0.22 && fibroValue <= 0.31)
            return "F1";
        if (fibroValue >= 0.32 && fibroValue <= 0.58)
            return "F2";
        if (fibroValue >= 0.59 && fibroValue <= 0.73)
            return "F3";
        //if (fibroValue >= 0.74 && fibroValue <= 1.00)
        if (fibroValue >= 0.74)
            return "F4";
    });

    return getSymptomCountByGroups(groupedData, allSymptoms);
}
