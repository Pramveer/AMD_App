import * as serverUtils from '../../common/serverUtils.js';
import * as pharmaUtils from './pharmaUtils.js';

let getFdaCompliantQuery = (fdaCheck) => {
    if (fdaCheck.toLowerCase() === 'yes') {
        return `AND meds.TREATMENT_PERIOD IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else if (fdaCheck.toLowerCase() === 'no') {
        return `AND meds.TREATMENT_PERIOD NOT IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else {
        return ``;
    }
}
Meteor.syncMethods({
    'getRWEBenchmarkPageData': function(params, callback) {
        // Early exit condition
        if (!isValidUser({ userId: this.userId })) {
            console.log('User not logged in');
            return undefined;
        }
        if (!isValidParams({ params: params, cb: callback })) {
            console.log('Invalid Parameters');
            return undefined;
        }

        var category_id = params.id;


        var query = '',
            dataObj = {};

        dataObj['medicationData'] = null;
        let whereClause = ``;
        let fdaCompliantQuery = getFdaCompliantQuery(params.fdaCompliant),
            preactiveAntivalsQuery = ` AND meds.IS_PREACTING_ANTIVIRAL = 'NO' `;

        // Dynamic condition for PREACTING_ANTIVIRAL
        if (params.showPreactingAntivirals) {
            preactiveAntivalsQuery = ``;
        }
        //query for genotype
        if (params.genotypes && params.genotypes.length) {
            whereClause += ` AND  patients.GENOTYPE IN (${serverUtils.getStrFromArray(params.genotypes)})`;
        }

        //query for treatment
        if (params.treatment && params.treatment.length) {
            whereClause += ` AND patients.TREATMENT IN (${serverUtils.getStrFromArray(params.treatment)})`;
        }

        //query for cirrhosis
        if (params.cirrhosis && params.cirrhosis.length) {
            whereClause += ` AND patients.CIRRHOSIS IN (${serverUtils.getStrFromArray(params.cirrhosis)})`;
        }

        // console.log(params.medication);
        //query for Medication (Pharma Tab)
        if (params.medication && params.medication.length) {
            // whereClause += ` AND meds.MEDICATION  Like "%${params.medication}%"`;
            whereClause += ` AND meds.MEDICATION IN (${serverUtils.getStrFromArray(params.medication)})`;
        }
        //Praveen 03/24/2017 added date condition by default;
        //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';

        query = `select
           count(meds.PATIENT_ID_SYNTH) as total,
           count(DISTINCT meds.PROVIDER_ID_SYNTH) as uniqueProviders,treatment_Period,
            CAST(MAX(meds.PAID) AS DECIMAL(10,3)) as max_cost,
           meds.MEDICATION
           from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS as patients
           join PATIENT_MEDICATIONS as meds
           on meds.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
           where meds.MEDICATION <> ''
           ${whereClause}
           ${fdaCompliantQuery}
           ${preactiveAntivalsQuery}`;


        query += ` group by
                        meds.MEDICATION,
                        meds.treatment_Period ORDER by meds.MEDICATION ;`


        // console.log("***************  RWE BenchMark Query 1 ******************************");
        // console.log(query);

        liveDb.db.query(query, function(error, result) {
            if (error || result.length < 1) {
                callback(true, null);
                // console.log(error);
            } else {
                //var groupedData =  _.groupBy(result,'category_id');
                // console.log('got data');
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
                    total += result[i].total
                    totalProvider += result[i].uniqueProviders
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
                // console.log(finalData['max_cost']);

                // console.log("Before*****************");
                // console.log(result[0].max_cost);
                finalData['provider'] = 0; //result[0].provider;
                finalData['network'] = 0; //result[0].network;

                dataObj['medicationData'] = finalData;
                dataObj['params'] = params;
                // callback(undefined, dataObj);
                // console.log(dataObj);
                getPatientsData(dataObj, callback);
            }
        });
    }
});


function getPatientsData(data, callback) {

    var dataObj = data,
        medicationData = dataObj.medicationData,
        category_id = 0; //medicationData.category_id,
    medications = medicationData.medications,
        treatmentPeriods = medicationData.treatmentPeriods.join(',');

    var allMeds = '';
    //prepare commaseperated medications
    for (var i = 0; i < medications.length; i++) {
        if (i < medications.length - 1)
            allMeds += '"' + medications[i] + '",';
        else
            allMeds += '"' + medications[i] + '"';
    }

    dataObj['patientsData'] = null;

    var query = '';
    let params = dataObj.params;
    let whereClause = ``,
        preactiveAntivalsQuery = ` AND meds.IS_PREACTING_ANTIVIRAL = 'NO' `;

    // Dynamic condition for PREACTING_ANTIVIRAL
    if (params.showPreactingAntivirals) {
        preactiveAntivalsQuery = ``;
    }
    let fdaCompliantQuery = ``; //getFdaCompliantQuery(params.fdaCompliant);


    if (params.genotypes && params.genotypes.length) {
        whereClause += ` AND  patients.GENOTYPE IN (${serverUtils.getStrFromArray(params.genotypes)})`;
    }

    //query for treatment
    if (params.treatment && params.treatment.length) {
        whereClause += ` AND patients.TREATMENT IN (${serverUtils.getStrFromArray(params.treatment)})`;
    }

    //query for cirrhosis
    if (params.cirrhosis && params.cirrhosis.length) {
        whereClause += ` AND patients.CIRRHOSIS IN (${serverUtils.getStrFromArray(params.cirrhosis)})`;
    }

    //query for Medication (Pharma Tab)
    // if (params.medication && params.medication != 'all') {
    //     whereClause += ` AND meds.MEDICATION  Like "%${params.medication}%"`;
    // }
    //Praveen 03/24/2017 added date condition by default;
    //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';
    query = `select
                    count(meds.PATIENT_ID_SYNTH) as total,
                    IS_HOSPITALIZED,
                    IS_LIVER_FAILURE,
                    IS_DRUG_INTERACTION,
                    IS_ANIMIA,
                    PROVIDER_ID_SYNTH as provider_id,
                    CAST(MAX(meds.PAID) AS DECIMAL(10,3)) as claims_cost,
                    CAST(MAX(meds.PAID_MODE) AS DECIMAL(10,3)) as claims_mode_cost,
                    CAST(MAX(meds.COPAY_MODE) AS DECIMAL(10,3)) as copay_mode_cost,
                    SVR12,
                    avg(meds.DAYS_MEDICATION) as days_med,
                    meds.TREATMENT_PERIOD as treatment_Period,
                    meds.MEDICATION as medication
                from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS as patients
                join PATIENT_MEDICATIONS as meds on meds.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                 Where   MEDICATION in (${allMeds}) AND MEDICATION <> ''
                AND meds.TREATMENT_PERIOD in (${treatmentPeriods})
              ${whereClause}
              ${fdaCompliantQuery}
              ${preactiveAntivalsQuery}`;

    query += `  group by
                    meds.MEDICATION,
                    SVR12,
                    meds.Treatment_PERIOD,
                    IS_HOSPITALIZED,
                    IS_LIVER_FAILURE,
                    IS_DRUG_INTERACTION,
                    IS_ANIMIA,
                    PROVIDER_ID_SYNTH
                order by meds.MEDICATION`;


    // console.log("*************** RWE BenchMark  Query 2 ******************************");
    // console.log(query);


    liveDb.db.query(query, function(error, result) {
        if (error) {
            console.log('error');
            console.log(error);
            return;
        } else {
            // console.log('got data');
            dataObj['patientsData'] = result;
             console.log('patientsData');
            getDrugsRiskData(dataObj, callback);
        }
    });
}

function getDrugsRiskData(data, callback) {
    var dataObj = data;

    dataObj['drugsRiskData'] = null;

    var query = '';
    query = 'select risk.*,drugs.setId,dosage.standard_dosage,dosage.conditions from drugs_risk_data as risk ' +
        'JOIN drugs on risk.DrugName = drugs.name ' +
        'LEFT JOIN drugs_dosage as dosage on dosage.drug_name = risk.DrugName ' +
        'AND risk.Treatment_Period = dosage.treatment_period;';

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
    drugsData = _.sortBy(drugsData, 'TotalValue')

    var bestCost = drugsData[drugsData.length - 1] == undefined ? 0 : drugsData[drugsData.length - 1].Cost.TotalCost,
        bestValue = drugsData[drugsData.length - 1] == undefined ? 0 : drugsData[drugsData.length - 1].TotalValue;

    let drugScores = _.pluck(drugsData, "drugScore");

    // conver all element to be float not String.
    drugScores = drugScores.map(function (x) {
         return parseFloat(x).toFixed(2);
    });


    let bestDrugScore = _.max(drugScores);

    for (var i = 0; i < drugsData.length; i++) {
        drugsData[i]['Best_cost'] = bestCost;
        drugsData[i]['Best_value'] = bestValue;
        drugsData[i]['Best_Drug_Score'] = bestDrugScore;
        drugsData[i]['TotalN'] = totalPopulationCount;
    }

    var max = 0;
    var val = 0;

    for (i = 0; i < drugsData.length; i++) {
        if (drugsData[i].Utilization.Utilization != null && drugsData[i].Utilization.Utilization != "") {
            val = drugsData[i].Utilization.Utilization;
            if (parseFloat(max) <= parseFloat(val))
                max = val;
        }
    }

    for (i = 0; i < drugsData.length; i++) {
        if (drugsData[i].Utilization.Utilization != null && drugsData[i].Utilization.Utilization != "") {
            val = drugsData[i].Utilization.Utilization;
            if (parseFloat(max) <= parseFloat(val))
                max = val;
        }
    }

    for (i = 0; i < drugsData.length; i++) {
        if (drugsData[i].Utilization.Utilization != null && drugsData[i].Utilization.Utilization != "") {
            val = drugsData[i].Utilization.Utilization;
            var t = (val * 100 / max);
            drugsData[i]["ConfidenceIndex"] = parseFloat(t).toFixed(2);
        }
    }

    finalObj['drugsData'] = drugsData;
    finalObj['riskData'] = drugsRiskData;

    let stringified = JSON.stringify(finalObj);
    console.log(stringified.length);
    let compressed_object = LZString.compress(stringified);
    console.log(compressed_object.length);

    callback(undefined, compressed_object);
}

//function to compute drug calculations for a drug
function computeDataPerMedication(dataArray, dataObj, drugId, params) {
    var drugObj = {};

    // console.log("**************  Data Array *******************");
    // console.log(dataArray);

    // console.log("**************  Data Object *******************");
    // console.log(dataObj);

    var total_count = 0,
        total_cost_med = 0,
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

    for (var j = 0; j < dataArray.length; j++) {

        med_count = parseInt(dataArray[j]['total']);
        total_count += med_count;
        total_cost_med += parseFloat(dataArray[j]['claims_cost']);
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
    // drugObj['TotalN'] = dataObj.totalCategoryPatients;
    var cost = total_cost_med / j;
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

    // value Score calculation
    // we are not using efficacy in value score calcultion of it is not available for a perticular drug.
    let value = 0;
    if (efficacy == 'NA') {
        value = (adherence + cost_factor) / 20;
    } else {
        value = (adherence + efficacy + cost_factor) / 30;
    }

    // Added by Yuvraj 6th March 17 (Calculated Drug Score based on the Weights selected in the Rage sliders);
    let drugScore = 0;
    let efficacyWeight = params['efficacyWeight'];
    let adherenceWeight = params['adherenceWeight'];
    let costWeight = params['costWeight'];

    if (efficacy == 'NA') {
        drugScore = (adherenceWeight * adherence + costWeight * cost_factor) / ((adherenceWeight + costWeight) * 10) ;
    } else {
        drugScore = (adherenceWeight * adherence + efficacyWeight * efficacy + costWeight * cost_factor) /((adherenceWeight + efficacyWeight + costWeight) * 10);
    }

    drugObj['drugScore'] = parseFloat(drugScore).toFixed(2);
    drugObj['TotalDisplayValue'] = value.toFixed(2);
    drugObj['TotalValue'] = value.toFixed(2);
    drugObj['IsInsured'] = 'Yes';
    drugObj['relativeValueScore'] = (efficacy + cost_factor) / 2;

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

function commaSeperatedNumber(val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
}


function getNonFDACompliantTreatmentPeriod(treatmentPeriod) {
    //console.log(treatmentPeriod);

    let originalTreatmentPeriod = treatmentPeriod.split(',');
    let filteredTreatmentPeriod = [];
    for (var i = 0; i < originalTreatmentPeriod.length; i++) {

        if (!(originalTreatmentPeriod[i] == 8 || originalTreatmentPeriod[i] == 12 || originalTreatmentPeriod[i] == 16 || originalTreatmentPeriod[i] == 24 || originalTreatmentPeriod[i] == 48)) {
            filteredTreatmentPeriod.push(originalTreatmentPeriod[i]);
        }
    }
    filteredTreatmentPeriod = filteredTreatmentPeriod.join(",");
    // console.log(filteredTreatmentPeriod);
    return filteredTreatmentPeriod;
}


function getFDACompliantTreatmentPeriod(treatmentPeriod) {
    // console.log(treatmentPeriod);
    return "8,12,16,24,48";
}
