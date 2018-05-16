import * as serverUtils from '../../common/serverUtils.js';

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 26-May-2017
 * @desc: Commented  total_count calculation (DrugN), as it is record count not unique patient count
 * Adapting unique patient count calculation for provide tab
 * Added distinct in aggregate to get unique patient count COUNT(distinct medication.PATIENT_ID_SYNTH) as total
 * total working fine with each drug but total unique patients count is wrong due to retreated therapy\
 * uniqueTotalPatientCount
 * 
How can we calculate unique patient for medication data as query is using grouping 
  -> We can use distinct in query to check how many user take this therapy,
  But patient who taken multiple therapy are counted twice so for unique patient need to thoough about differently.
 */
Meteor.syncMethods({

    'getProviderPageData': function(params, callback) {
        try {
            // console.log("getProviderPageData call 1");
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!isValidParams({
                    params: params,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            // console.log("getProviderPageData call 2");
            let dataObj = {},
                treatmentQuery = ``;

            dataObj['medicationData'] = null;

            let fdaCompliant = params.fdaCompliant;
            // console.log("getProviderPageData call 3");
            treatmentQuery = getFdaCompliantQuery(fdaCompliant);
            // console.log("getProviderPageData call 4");
            //changes by Pram for preacting antivirals integration
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;
            // console.log(whereClause);
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }


            // console.log("getProviderPageData call 5");
            /**
             * @author: Yuvraj Pal (16th Feb 2017)
             * @desc: Modified queries to use Patietnt_Id_Synth insted of IDW_PATIENT_ID_SYNTH
             */

            // let newQuery = `SELECT count(medication.IDW_PATIENT_ID_SYNTH) as total,
            //             count(DISTINCT medication.PROVIDER_ID_SYNTH) as uniqueProviders,treatment_Period,
            //             max(medication.PAID) as max_cost,MEDICATION
            //             from IMS_HCV_PATIENTS as patients join PATIENT_MEDICATIONS as medication
            //             on patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH
            //             WHERE medication.MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            //             ${whereClause} ${preactiveAntivalsQuery} ${treatmentQuery}
            //             group by
            //             medication.MEDICATION,
            //             medication.treatment_Period ORDER by medication.MEDICATION ;`;

            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

            let newQuery = `SELECT
                                COUNT(medication.PATIENT_ID_SYNTH) as total,
                                COUNT(DISTINCT medication.PROVIDER_ID_SYNTH) as uniqueProviders,
                                treatment_Period,
                                CAST(MAX(CASE WHEN medication.PAID IS NULL THEN 0 ELSE medication.PAID END) AS DECIMAL(10,3)) as max_cost,
                                MEDICATION
                            FROM ${dbConfig.tblHcvPatient} as patients
                            JOIN ${dbConfig.tblPatientMedication} as medication
                                ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                            WHERE medication.MEDICATION IS NOT NULL
                            ${whereClause} ${preactiveAntivalsQuery} ${treatmentQuery}
                            GROUP BY
                                medication.MEDICATION,
                                medication.treatment_Period
                            ORDER BY medication.MEDICATION ;`;

            // console.log("***************  NEw  Query 1 ******************************");
            // console.log(newQuery);

            liveDb.db.query(newQuery, function(error, result) {
                if (error || result.length < 1) {
                    console.log(error);
                    callback(true, null);

                } else {
                    //var groupedData =  _.groupBy(result,'category_id');
                    var finalData = {},
                        drugIds = [],
                        medications = [],
                        treatmentPeriods = [];
                    let total = 0,
                        totalProvider = 0;
                    for (let i = 0; i < result.length; i++) {
                        drugIds.push(i + 1);
                        medications.push(result[i]['MEDICATION']);
                        treatmentPeriods.push(result[i]['treatment_Period']);
                        total += result[i].total;
                        totalProvider += result[i].uniqueProviders;
                    }

                    finalData['drugIds'] = getUniqueArray(drugIds);
                    finalData['medications'] = getUniqueArray(medications);
                    finalData['treatmentPeriods'] = getUniqueArray(treatmentPeriods);
                    // finalData['medications'] = medications;
                    // finalData['treatmentPeriods'] = treatmentPeriods;
                    finalData['totalPatients'] = total;
                    finalData['totalProvider'] = totalProvider;
                    finalData['category_id'] = 1; //result[0].category_id;

                    // finalData['max_cost'] = 0;//result[0].max_cost;
                    // Modified By Yuvraj -- 10 Dec 2016
                    finalData['max_cost'] = _.max(_.pluck(result, "max_cost"));
                    // console.log(_.pluck(result, "max_cost"));
                    // console.log(finalData['max_cost']);

                    finalData['provider'] = 0; //result[0].provider;
                    finalData['network'] = 0; //result[0].network;

                    dataObj['medicationData'] = finalData;
                    dataObj['params'] = params;
                    //console.log(finalData);
                    getPatientsData(dataObj, callback);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }

});



// Supporting functions

function getPatientsData(data, callback) {
    let dataObj = data,
        medicationData = dataObj.medicationData,
        category_id = 0, //medicationData.category_id,
        medications = medicationData.medications,
        treatmentPeriods = medicationData.treatmentPeriods.join(',');

    let allMeds = '';
    //prepare commaseperated medications
    // for (let i = 0; i < medications.length; i++) {
    //     if (i < medications.length - 1)
    //         allMeds += '"' + medications[i] + '",';
    //     else
    //         allMeds += '"' + medications[i] + '"';
    // }

    dataObj['patientsData'] = null;

    let fdaCompliant = dataObj.params.fdaCompliant,
        treatmentQuery = getFdaCompliantQuery(fdaCompliant);

    //changes by Pram for preacting antivirals integration
    let whereClause = serverUtils.getQueryForAdvFilters(dataObj.params),
        preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

    if (dataObj.params.showPreactingAntivirals) {
        preactiveAntivalsQuery = ``;
    }

    /**
     * @author: Yuvraj Pal (16th Feb 2017)
     * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
     */

    // let newQuery = `select
    //                 count(medication.IDW_PATIENT_ID_SYNTH) as total,
    //                 IS_HOSPITALIZED,
    //                 IS_LIVER_FAILURE,
    //                 IS_DRUG_INTERACTION,
    //                 IS_ANIMIA,
    //                 PROVIDER_ID_SYNTH as provider_id,
    //                 medication.PAID as claims_cost,
    //                 medication.PAID_MODE as claims_mode_cost,
    //                 medication.COPAY_MODE as copay_mode_cost,
    //                 SVR12,
    //                 avg(medication.DAYS_MEDICATION) as days_med,
    //                 medication.TREATMENT_PERIOD as treatment_Period,
    //                 medication.MEDICATION as medication
    //                 from IMS_HCV_PATIENTS as patients
    //                 join PATIENT_MEDICATIONS as medication on patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH
    //                 WHERE medication.MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
    //                 ${whereClause} ${preactiveAntivalsQuery} ${treatmentQuery}
    //                 GROUP BY
    //                 medication.MEDICATION,
    //                 SVR12,
    //                 medication.Treatment_PERIOD,
    //                 IS_HOSPITALIZED,
    //                 IS_LIVER_FAILURE,
    //                 IS_DRUG_INTERACTION,
    //                 IS_ANIMIA,
    //                 PROVIDER_ID_SYNTH
    //                 order by  medication.MEDICATION`;

    let dbConfig = serverUtils.getCurrentDatabaseConfiguration(dataObj.params);

    /**
     * @author: Arvind
     * @reviewer: 
     * @date: 29-May-2017
     * @desc: Added distinct in aggregate to get unique patient count COUNT(distinct medication.PATIENT_ID_SYNTH) as total
     * Added `GROUP_CONCAT(distinct medication.PATIENT_ID_SYNTH) as patient_ids` column to check unique total patient count
     */
    let newQuery = `SELECT
                        COUNT(distinct medication.PATIENT_ID_SYNTH) as total,
                        GROUP_CONCAT(distinct medication.PATIENT_ID_SYNTH) as patient_ids,              
                        IS_HOSPITALIZED,
                        IS_LIVER_FAILURE,
                        IS_DRUG_INTERACTION,
                        IS_ANIMIA,
                        PROVIDER_ID_SYNTH as provider_id,
                        CAST(MAX(CASE WHEN medication.PAID IS NULL THEN 0 ELSE medication.PAID END) AS DECIMAL(10,3)) as claims_cost,
                        CAST(MAX(CASE WHEN medication.COPAY IS NULL THEN 0 ELSE medication.COPAY END) AS DECIMAL(10,3)) as claims_copay_cost,
                        CAST(MAX(CASE WHEN medication.PAID_MODE IS NULL THEN 0 ELSE medication.PAID_MODE END) AS DECIMAL(10,3)) as claims_mode_cost,
                        CAST(MAX(CASE WHEN medication.COPAY_MODE IS NULL THEN 0 ELSE medication.COPAY_MODE END) AS DECIMAL(10,3)) as copay_mode_cost,
                        SVR12,
                        AVG(CASE WHEN medication.DAYS_MEDICATION IS NULL THEN 0 ELSE medication.DAYS_MEDICATION END) as days_med,
                        medication.TREATMENT_PERIOD as treatment_Period,
                        medication.MEDICATION as medication
                    FROM ${dbConfig.tblHcvPatient} as patients
                    JOIN ${dbConfig.tblPatientMedication} as medication ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE medication.MEDICATION IS NOT NULL
                    ${whereClause} ${preactiveAntivalsQuery} ${treatmentQuery}
                    GROUP BY
                        medication.MEDICATION,
                        SVR12,
                        medication.Treatment_PERIOD,
                        IS_HOSPITALIZED,
                        IS_LIVER_FAILURE,
                        IS_DRUG_INTERACTION,
                        IS_ANIMIA,
                        PROVIDER_ID_SYNTH
                    ORDER BY medication.MEDICATION`;


    // console.log('******************NEW QUERY 2********************************');
    // console.log(newQuery);

    liveDb.db.query(newQuery, function(error, result) {
        if (error) {
            return;
        } else {
            // console.log(result.length);
            dataObj['patientsData'] = result;
            getDrugsRiskData(dataObj, callback);
        }
    });
}


function getDrugsRiskData(data, callback) {
    var dataObj = data;

    dataObj['drugsRiskData'] = null;

    var query = '';

    /**
     * @author: Yuvraj Pal (16th Feb 2017)
     * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
     */

    // query = 'select risk.*,drugs.setId,dosage.standard_dosage,dosage.conditions from drugs_risk_data as risk ' +
    //     'JOIN drugs on risk.DrugName = drugs.name ' +
    //     'LEFT JOIN drugs_dosage as dosage on dosage.drug_name = risk.DrugName ' +
    //     'AND risk.Treatment_Period = dosage.treatment_period;';

    query = `SELECT risk.*,
                drugs.setId,dosage.standard_dosage,
                dosage.conditions
            FROM drugs_risk_data as risk
            JOIN drugs ON risk.DrugName = drugs.name
            LEFT JOIN drugs_dosage as dosage
                ON dosage.drug_name = risk.DrugName
                AND risk.Treatment_Period = dosage.treatment_period;`;


    // console.log('**************Risk Data Query****************');
    // console.log(query);

    liveDb.db.query(query, function(error, result) {
        if (error) {
            return;
        } else {
            dataObj['drugsRiskData'] = result;
            prepareProviderPageData(dataObj, callback);
        }
    });
}


function prepareProviderPageData(data, callback) {
    var dataObj = {};
    var patientsData = data.patientsData, //patients & medication data array
        drugsRiskData = data.drugsRiskData, //risk data array
        medicationData = data.medicationData, //medication data
        medicationsArray = medicationData.medications, // medication names array
        treatmentPeriodsArray = medicationData.treatmentPeriods, //treatment periods array
        drugIdsArray = medicationData.drugIds; // drug ids array
    dataObj['categoryMaxCost'] = medicationData.max_cost, // max cost for a drug in current category
        dataObj['totalCategoryPatients'] = medicationData.totalPatients, //total patients in current category
        dataObj['totalProviders'] = medicationData.totalProvider, // total unique provider
        dataObj['categoryNetwork'] = medicationData.network, // network count for current category
        dataObj['categoryProvider'] = medicationData.provider; // provider count for current category

    var drugsData = [],
        finalObj = {},
        totalPopulationCount = 0;
    let allPatientIds = [];
    for (var i = 0; i < medicationsArray.length; i++) {
        var filterObj = {};
        for (var j = 0; j < treatmentPeriodsArray.length; j++) {
            filterObj = {
                medication: medicationsArray[i], //.replace(',',' + '),
                treatment_Period: treatmentPeriodsArray[j]
            };

            var filterPatientsData = _.where(patientsData, filterObj);

            if (filterPatientsData.length < 1)
                continue;
            var drugObj = computeDataPerMedication(filterPatientsData, dataObj, drugIdsArray[i], data.params);
            totalPopulationCount += drugObj['DrugN'];
            allPatientIds.push(drugObj['allPatientIds']);

            //console.log(drugObj);
            drugsData.push(drugObj);
        }
        // //console.log(filterObj);
        // var filterPatientsData = _.where(patientsData,filterObj);
        // //console.log(filterPatientsData,filterObj,patientsData);
        // //console.log(filterObj);
        // if(filterPatientsData.length < 1)
        //     continue;
        // var drugObj = computeDataPerMedication(filterPatientsData,dataObj,drugIdsArray[i]);
        // //console.log(drugObj);
        // drugsData.push(drugObj);
    }
    //console.log(drugsData);
    // added by Jayesh 27th March 2017
    // calculate Efficacy and Cost_Facter mean value for drug score.
    let filterDataForEfficacyAndCost = _.filter(drugsData, (rec) => {
        return rec.Efficacy.Efficacy.trim() == "NA" || rec.Cost.TotalCost == 0 ? false : true;
    });

    drugsData = setDrugScoreOfEachMedication(filterDataForEfficacyAndCost, data.params);
    drugsData = _.sortBy(drugsData, 'TotalValue');

    var bestCost = drugsData[drugsData.length - 1] == undefined ? 0 : drugsData[drugsData.length - 1].Cost.TotalCost,
        bestValue = drugsData[drugsData.length - 1] == undefined ? 0 : drugsData[drugsData.length - 1].TotalValue;

    let drugScores = _.pluck(drugsData, "drugScore");
    // convert all element to be float not String.
    drugScores = drugScores.map(function(x) {
        /**
         * @author: Arvind
         * @reviewer:
         * @date: 09-March-2017
         * @desc: Converted output string value to float as `toFixed()` method return always string
         */
        return parseFloat(parseFloat(x).toFixed(2));
    });
    /**
     * @author: Arvind
     * @reviewer:
     * @date:  09-March-2017
     * @desc: Be Careful _.max/_.min function may return incorrect result for other than 'int,float,DECIMAL' value type
     * @Reference : https://github.com/jashkenas/underscore/issues/1814
     */
    let bestDrugScore = _.max(drugScores);
    //console.log(bestDrugScore);
    /**
     * @author: Arvind
     * @reviewer:
     * @date:  09-March-2017
     * @desc: use _.extend() method to add new field or properties to existing Array of Object collection
     * @Reference from : http://stackoverflow.com/questions/19967761/lodash-how-to-add-new-field-to-all-values-in-collection
     * Code Attribution: http://stackoverflow.com/users/7469/mathletics
    How to use it:
    var arr = [{name: 'a', age: 23}, {name: 'b', age: 24}];
     var newArr = _.map(arr, function(element) {
     return _.extend({}, element, {married: false});
     });
    */


    let uniqueTotalPatientCount = 0;
    uniqueTotalPatientCount = _.unique(allPatientIds.join(",").split(",")).length;

    drugsData = _.map(drugsData, function(drug) {
        return _.extend({}, drug, {
            Best_cost: bestCost,
            Best_value: bestValue,
            Best_Drug_Score: bestDrugScore,
            TotalN: uniqueTotalPatientCount,
            oldTotalN: totalPopulationCount,
            ToalUniqueN: uniqueTotalPatientCount
        });
    });

    //// OLD Code start
    // for (var i = 0; i < drugsData.length; i++) {
    //     drugsData[i]['Best_cost'] = bestCost;
    //     drugsData[i]['Best_value'] = bestValue;
    //     drugsData[i]['Best_Drug_Score'] = bestDrugScore;
    //     drugsData[i]['TotalN'] = totalPopulationCount;
    // }

    //Praveen 03/15/2017 modifed code to get top N Drugs based on score
    // Modified by:Praveen 03/16/2017 check for topScore if present or not
    if (data.params.topScore != undefined) {
        //get the topScore value from params passed
        let topScoreDrugs = data.params.topScore || drugsData.length;
        //filter the data based on if Efficacy is not null or 0
        drugsData = drugsData.filter(rec => rec.Efficacy.Efficacy && rec.Efficacy.Efficacy != "NA" && rec.Efficacy.Efficacy != 0);
        //sort the data based on Drug score
        drugsData.sort((a, b) => parseFloat(a["Best_Drug_Score"]) < parseFloat(b["Best_Drug_Score"]));
        //sort the data based on efficacy
        drugsData.sort((a, b) => parseFloat(a["Efficacy"]["Efficacy"]) < parseFloat(b["Efficacy"]["Efficacy"]));
        //get top N drugs from drugsData based on TopScore
        drugsData = drugsData.splice(0, parseInt(topScoreDrugs));
    }

    finalObj['drugsData'] = drugsData;
    finalObj['riskData'] = drugsRiskData;
    finalObj.patientData = patientsData;

    // Added Jayesh 17th MAY 2017 check after filtering Efficacy is NA and cost is zero.
    if (drugsData.length < 1) {
        callback(true, null);
    } else {
        let stringified = JSON.stringify(finalObj);
        let compressed_object = LZString.compress(stringified);

        //console.log(data.params.fdaCompliant);
        callback(undefined, compressed_object);
    }
}




//function to compute drug calculations for a drug
function computeDataPerMedication(dataArray, dataObj, drugId, params) {
    var drugObj = {};
    // console.log(params);
    // console.log("**************  Data Array *******************");
    // console.log(dataArray);

    // console.log("**************  Data Object *******************");
    // console.log(dataObj);

    var total_count = 0,
        total_cost_med = 0,
        total_copay_cost = 0,
        total_mode_cost = 0,
        total_copay_mode_cost = 0,
        efficacy_len = 0,
        safety_count = 0,
        med_count = 0,
        sum_days_medication = 0,
        anemia = fatigue = insomnia = arthralgia = myalgia = 0,
        safety_admission_hospital = 0,
        safety_drug_interactions = 0,
        safety_liver_failure = 0,
        safety_anemia = 0,
        providerLength = 0,
        networkLength = 0,
        max_cost = parseFloat(dataObj.categoryMaxCost);

    let svr_patients = 0;

    var drugName = dataArray[0].medication,
        treatmentPeriod = dataArray[0].treatment_Period;

    //Store all patient_ids as comma separated string value to array
    let allPatientIds = [];

    for (var j = 0; j < dataArray.length; j++) {
        //Store all patient_ids as comma separated string value to array
        allPatientIds.push(dataArray[j]['patient_ids']);
        med_count = parseInt(dataArray[j]['total']);

        total_count += med_count;
        total_cost_med += parseFloat(dataArray[j]['claims_cost']);
        // added by jayesh 16th May for copay amount in PHS
        total_copay_cost += parseFloat(dataArray[j]['claims_copay_cost']);
        total_mode_cost += parseFloat(dataArray[j]['claims_mode_cost']);

        total_copay_mode_cost += parseFloat(dataArray[j]['copay_mode_cost']);

        sum_days_medication += parseFloat(dataArray[j]['days_med']);

        //  Modified for IMS DB Intefration
        // Consider only those patients for SVR calculation who have SVR data.
        if (dataArray[j]['SVR12'] != null) {
            svr_patients += med_count;
            if (dataArray[j]['SVR12'] == 1) {
                efficacy_len += med_count;
            }
        }

        // if(dataArray[j]['IS_HOSPITALIZED']!='0'){
        //     safety_admission_hospital +=  med_count;
        // }
        // else if(dataArray[j]['IS_DRUG_INTERACTION']!='0'){
        //     safety_drug_interactions +=  med_count;
        // }
        // else if(dataArray[j]['IS_LIVER_FAILURE']!='0'){
        //     safety_liver_failure +=  med_count;
        // }
        // else if(dataArray[j]['IS_ANIMIA']!='0'){
        //     safety_anemia +=  med_count;
        // }

        if (dataArray[j]['IS_HOSPITALIZED'] != '0') {
            safety_admission_hospital += med_count;
        }
        if (dataArray[j]['IS_DRUG_INTERACTION'] != '0') {
            safety_drug_interactions += med_count;
        }
        if (dataArray[j]['IS_LIVER_FAILURE'] != '0') {
            safety_liver_failure += med_count;
        }
        if (dataArray[j]['IS_ANIMIA'] != '0') {
            safety_anemia += med_count;
        }

        //  Modified for IMS DB Intefration  -- Commented old code.
        //Updated for me utilization chart data for analytics tab
        // console.log(dataArray[j].provider_id);
        // if (dataArray[j].provider_id){
        providerLength += med_count;
        // }
        // if (dataArray[j].network_id >= 1 && dataArray[j].network_id <= 8) {
        //     networkLength += med_count;
        // }

        //calculation of safety adverse reactions
        if (dataArray[j]['IS_ANIMIA'] != '0') {
            anemia += med_count;
        }

        //  Modified for IMS DB Intefration  -- Commented old code.

        // else if(dataArray[j]['insomnia'] == 1){
        //     insomnia +=  med_count;
        // }
        // else if(dataArray[j]['fatigue'] == 1){
        //     fatigue +=  med_count;
        // }
        // else if(dataArray[j]['myalgia'] == 1){
        //     myalgia +=  med_count;
        // }
        // else if(dataArray[j]['arthralgia'] == 1){
        //     arthralgia +=  med_count;
        // }

    }

    safety_count = safety_admission_hospital + safety_drug_interactions + safety_liver_failure + safety_anemia;
    sum_days_medication = sum_days_medication / j;

    //  Modified for IMS DB Intefration  -- Added random data for adherence.
    //var adherence = getRandomInt(80,95);//(sum_days_medication/(parseInt(treatmentPeriod)*7))*100;
    var adherence = (sum_days_medication / (parseInt(treatmentPeriod) * 7)) * 100;
    //  Modified for IMS DB Intefration  -- Commented old code.

    //dummy fix for adherence
    // if(parseInt(adherence) > 100) {
    //     var minValue = 87,maxValue = 99;
    //     adherence = parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(2));
    // }

    drugObj['Adherence'] = {
        'Adherence': adherence,
        'MPR': '(N=' + total_count + ')'
    };

    drugObj['Safety'] = (100 - ((safety_count / total_count) * 100)).toFixed(2);
    // drugObj['DrugName'] = drugName.replace(',',' + ') +' ('+treatmentPeriod+"W)";
    drugObj['DrugName'] = drugName + ' (' + treatmentPeriod + "W)";
    drugObj['DrugPopulationSize'] = total_count;
    drugObj['DrugN'] = total_count;
    /**
     * @author: Arvind
     * @reviewer: 
     * @date: 
     * @desc: Added to store all patientIds for each drug and then find unique patient ids
     */
    drugObj['allPatientIds'] = allPatientIds;
    // drugObj['TotalN'] = dataObj.totalCategoryPatients;
    var cost = total_cost_med / j;
    var copay_cost = total_copay_cost / j;
    var mode_cost = total_mode_cost / j;
    var copay_mode_cost = total_copay_mode_cost / j;

    drugObj['Cost'] = {
        'CostEstimate': cost,
        'TotalCost': cost,
        'CostEstimateSymbol': getCostSymbol(cost),
        'TotalCostDisplay': commaSeperatedNumber(cost),

        'costMedianMode': {
            paid_median_cost: commaSeperatedNumber(parseInt(cost)),
            paid_mode_cost: commaSeperatedNumber(parseInt(mode_cost)),
            copay_cost: commaSeperatedNumber(parseInt(copay_cost)),
            copay_mode_cost: commaSeperatedNumber(parseInt(copay_mode_cost))
        },
        'costTooltip': gettooltip(parseFloat(cost).toFixed(2), parseFloat(mode_cost).toFixed(2), getCostSymbol(cost))


    };
    drugObj['DrugId'] = drugId;
    drugObj['DrugSequence'] = drugId;

    drugObj['Max_cost'] = max_cost;
    drugObj['per_adverse'] = getRandomInt(0, 10); //((anemia + insomnia + fatigue + myalgia + arthralgia)/total_count)*100;
    drugObj['safe_check'] = '';
    drugObj['Best_value'] = 0;
    drugObj['Best_cost'] = 0;
    drugObj['SafetyCondition'] = {
        'Admission': safety_admission_hospital,
        'Anemia': safety_anemia,
        'Interaction': safety_drug_interactions,
        'LiverFailure': safety_liver_failure
    };

    drugObj['category_id'] = dataArray.id;
    drugObj['Treatment_Period'] = treatmentPeriod + " Weeks";
    drugObj['Utilization'] = {
        'Utilization': dataObj.totalCategoryPatients == 0 ? 0 : ((total_count / dataObj.totalCategoryPatients) * 100).toFixed(2),
        'Rx': '(N=' + total_count + ')',
        'NetworkLength': dataObj.categoryNetwork == 0 ? 0 : (networkLength / dataObj.categoryNetwork) * 100,
        'net': networkLength,
        'ProviderLength': dataObj.totalProviders == 0 ? 0 : ((providerLength / dataObj.totalProviders) * 100).toFixed(2)
    };

    // var efficacy = ((efficacy_len/parseInt(total_count))*100);
    // Consider only patietnts with svr for efficacy calculations.
    var efficacy = svr_patients == 0 ? 'NA' : ((efficacy_len / parseInt(svr_patients)) * 100);

    // drugObj['Efficacy'] = {
    //                         'Efficacy':efficacy.toFixed(2),
    //                         'PWeek12':0,
    //                         'ResponseRate':('N='+total_count)
    //                     };

    drugObj['Efficacy'] = {
        'Efficacy': efficacy == 'NA' ? 'NA' : efficacy.toFixed(2),
        'PWeek12': 0,
        'ResponseRate': ('N=' + svr_patients)
    };

    drugObj['Adverse'] = {
        "anemia": {
            "count": anemia,
            "cost": 0.70 * cost
        },
        "fatigue": {
            "count": fatigue,
            "cost": 0.30 * cost
        },
        "insmonia": {
            "count": insomnia,
            "cost": 0.60 * cost
        },
        "myalgia": {
            "count": myalgia,
            "cost": 0.40 * cost
        },
        "arthralgia": {
            "count": arthralgia,
            "cost": 0.55 * cost
        }
    };
    // Modified By Yuvraj -  Right now we dont have cost data, so we are providing random data for calculatons.
    // var cost_factor = max_cost == 0?getRandomInt(200,1000):((max_cost - cost)/max_cost)*100;

    // Modified By Yuvraj -  10 Dec 2016 (We have Cost Data now.)
    var cost_factor = ((max_cost - cost) / max_cost) * 100;

    let relativeValueScore = (efficacy + cost_factor) / 2;

    drugObj['cost_factor'] = cost_factor;
    drugObj['relativeValueScore'] = relativeValueScore;

    return drugObj;
}


//  Modified for IMS DB Intefration
// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


//function to get cost tooltip
function gettooltip(median, mode, cost_symbol) {
    let html = `<div class='cust-popup-box' style='width:200px !important;'>
                            <div class='cust-popup-title'> <span>Cost</span></div>
                            <div class='cust-popup-content'>
                              <div>
                          <div class='drugs-bubble'>
                                 <div> <span class='boldfnt'>Paid: ${cost_symbol}</span></div><vr>
                    </div>
                      <hr>
                      <span class='mgl10'><span class='cost-scale-symbol'>Median:</span>${median}</span><br/>
                       <span class='mgl10'><span class='cost-scale-symbol'>Mode:</span>${mode}</span><br/>

                      <br/>
                    </div></div></div>`;
    return html;

}



//function to get cost symbol
function getCostSymbol(pCost) {
    //Payer bubble to show $$$ not actual cost scale: 0-50K $ 50-100 $$ 150-200K $$$ 200-300 $$$$
    //Convert money value to number
    var cost = !isNaN(parseInt(pCost)) ? parseInt(pCost) : 0
    var costSymbol = '';
    if (cost <= 57000) {
        costSymbol = '<span>$</span>';
    } else if (cost > 57000 && cost <= 90000) {
        costSymbol = '<span >$$</span>';
    } else if (cost > 90000 && cost <= 150000) {
        costSymbol = '<span>$$$</span>';
    } else {
        costSymbol = '<span>$$$$</span>';
    }
    return costSymbol;
};


//function to get treatment periods based on fdaCompliant check
let getFdaCompliantQuery = (fdaCheck) => {
    if (fdaCheck.toLowerCase() === 'yes') {
        return `AND medication.TREATMENT_PERIOD IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else if (fdaCheck.toLowerCase() === 'no') {
        return `AND medication.TREATMENT_PERIOD NOT IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else {
        return ``;
    }
}

//function to remove duplicate entries from an array
function getUniqueArray(List) {
    var cleaned = [];
    List.forEach(function(itm) {
        var unique = true;
        cleaned.forEach(function(itm2) {
            if (_.isEqual(itm, itm2)) unique = false;
        });
        if (unique) cleaned.push(itm);
    });
    return cleaned;
}


function commaSeperatedNumber(val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
}
// Addev By Jayesh 27th March 2017
// function for calculated drug score value
// function setDrugScoreOfEachMedication(drugsData, efficacyMean, costMean, params){
function setDrugScoreOfEachMedication(drugsData, params) {
    let UpdatedDrugsData = _.map(drugsData, (rec) => {
        let efficacy = rec.Efficacy.Efficacy;
        let adherence = rec.Adherence.Adherence;
        let cost_factor = rec.cost_factor;
        let drug_count = rec.DrugName.toString().split('+').length;
        drug_count = drug_count && drug_count != 0 ? drug_count - 1 : 0;
        // value Score calculation
        // we are not using efficacy in value score calcultion of it is not available for a perticular drug.

        let value = 0;

        value = (adherence + efficacy + cost_factor) / 30;

        // Added by Yuvraj 6th March 17 (Calculated Drug Score based on the Weights selected in the Rage sliders);
        let drugScore = 0;
        let efficacyWeight = params['efficacyWeight'];
        let adherenceWeight = params['adherenceWeight'];
        let costWeight = params['costWeight'];

        // if (efficacy == 'NA' && cost_factor == 100) {
        //     drugScore = (adherenceWeight * adherence) / ((adherenceWeight) * 10);
        // } else if (efficacy == 'NA') {
        //     drugScore = (adherenceWeight * adherence + costWeight * cost_factor) / ((adherenceWeight + costWeight) * 10);
        // } else if (cost_factor == 100) {
        //     drugScore = (adherenceWeight * adherence + efficacyWeight * efficacy) / ((adherenceWeight + efficacyWeight) * 10);
        // } else {
        //     drugScore = (adherenceWeight * adherence + efficacyWeight * efficacy + costWeight * cost_factor) / ((adherenceWeight + efficacyWeight + costWeight) * 10);
        // }
        drugScore = (adherenceWeight * adherence + efficacyWeight * efficacy + costWeight * cost_factor) / ((adherenceWeight + efficacyWeight + costWeight) * 10);
        // Added by Arvind 10th March 17 .If all weight parameter is zero  then `drugScore` value will be Infinity which produce NaN.
        drugScore = isNaN(drugScore) ? 0 : (drugScore - (drug_count * 0.01));

        rec['drugScore'] = parseFloat(drugScore.toFixed(2));
        rec['TotalDisplayValue'] = parseFloat(value.toFixed(2));
        rec['TotalValue'] = parseFloat(value.toFixed(2));
        rec['IsInsured'] = 'Yes';

        return rec;
    });
    return UpdatedDrugsData;
}
let getUniquePatientCount = () => {}