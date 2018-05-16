//file to get addtional query for basic & default filters
let _ids = [];
//function to remove duplicate entries from an array
export function getUniqueArray(baseData) {
    // var cleaned = [];
    // List.forEach(function(itm) {
    //     var unique = true;
    //     cleaned.forEach(function(itm2) {
    //         if (_.isEqual(itm, itm2)) unique = false;
    //     });
    //     if (unique) cleaned.push(itm);
    // });
    if (baseData) {
        return baseData.length > 0 ? Array.from(new Set(baseData)) : [];
    } else {
        return [];
    }

}

//function to remove duplicate entries from an array
/**
 *  Function takes array argument and return count for unique array value
 * @export 
 * @param {any} baseData  required
 * @returns unique array element count
 */
export function getUniqueArrayCount(baseData) {
    // var cleaned = [];
    // List.forEach(function(itm) {
    //     var unique = true;
    //     cleaned.forEach(function(itm2) {
    //         if (_.isEqual(itm, itm2)) unique = false;
    //     });
    //     if (unique) cleaned.push(itm);
    // });
    if (baseData) {
        return baseData.length > 0 ? new Set(baseData).size : 0;
    } else {
        return 0;
    }

}

//function to get commaseperated string
export function getStrFromArray(dataArray) {
    let commaStrData = '';
    for (var i = 0; i < dataArray.length; i++) {
        if (i < dataArray.length - 1)
            commaStrData += '"' + dataArray[i] + '",';
        else
            commaStrData += '"' + dataArray[i] + '"';
    }
    return commaStrData;
}

//function to get commaSeperated Number
export function commaSeperatedNumber(val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
}
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 15-May-2017
 * @desc: Created function for preparing single configuration file for current database
 */
// function to get current database name from query parameter
export function getCurrentDatabaseConfiguration(params) {
    //Prepare config parameter dynamically based on current db
    // This should contain fully qualified table name along with db
    let currentConfig = {};
    //console.log(params.database);
    if (params.database) {
        if (params.database === 'PHS_HCV') {
            currentConfig.DB_NM = params.database;
            currentConfig.pdatabase = `${params.database}.PHS_HCV_PATIENTS`;
            currentConfig.mdatabase = `${params.database}.PHS_PATIENT_MEDICATIONS`;
            currentConfig.tblViralload = `${params.database}.ALL_VIRAL_LOAD_RESULTS`;
            currentConfig.tblLiverTransplantCharge = `${params.database}.PHS_HCV_LIVERTRANSPLANT_CHARGE`;
            currentConfig.tblPatientSymptoms = `${params.database}.PHS_PATIENT_SYMPTOMS`;
            currentConfig.tblComorbidity = `${params.database}.PHS_PATIENT_COMORBIDITY`;
            currentConfig.ICD9_CD = 'ICD9_CD';
            currentConfig.tblHcvPatient = currentConfig.pdatabase;
            currentConfig.tblPatientMedication = currentConfig.mdatabase;
            currentConfig.tblRawMedications = `${params.database}.deid_prescriptions_ambulatory`;
            currentConfig.tblRawProblem = `${params.database}.deid_problem`;
            currentConfig.MED_STRT_DT = 'STRT_DATE';
            currentConfig.MED_END_DT = 'END_DATE';
            currentConfig.MED_ORDER_DT = 'ORDERING_DT';
            currentConfig.PROB_ONSAT_DT = 'ONSET_DT';
            currentConfig.PROB_NM = 'DX_NAME';
            currentConfig.PATIENT_ID_SYNTH = "Pat_ID";
            currentConfig.ethnicity = 'ETHNICITY';
            currentConfig.age = 'AGE_RANGE';
            currentConfig.showPreactingAntivirals = true;
            currentConfig.Perfed_Dt = `STR_TO_DATE(Perfed_Dt,'%m/%d/%Y')`;
            currentConfig.tblRegimen = `${params.database}.IMPROPER_REGIMEN`;
            currentConfig.tblLabs = `${params.database}.labs`;
            currentConfig.tblLabAnalysis = `${params.database}.LAB_ANALYSIS`;
        } else if (params.database === 'IMS_LRX_AmbEMR_Dataset') {
            currentConfig.DB_NM = params.database;
            currentConfig.pdatabase = `${params.database}.IMS_HCV_PATIENTS`;
            currentConfig.mdatabase = `${params.database}.PATIENT_MEDICATIONS`;
            currentConfig.tblViralload = `${params.database}.ALL_VIRAL_LOAD_RESULTS`;
            currentConfig.tblLiverTransplantCharge = `${params.database}.IMS_HCV_LIVERTRANSPLANT_CHARGE`;
            currentConfig.tblPatientSymptoms = `${params.database}.IMS_PATIENT_SYMPTOMS`;
            currentConfig.tblComorbidity = `${params.database}.IMS_HCV_MEDICATIONS_COMORBIDITY`;
            currentConfig.ICD9_CD = 'BILLG_ICD9_CD';
            currentConfig.tblHcvPatient = currentConfig.pdatabase;
            currentConfig.tblPatientMedication = currentConfig.mdatabase;
            currentConfig.tblRawMedications = `${params.database}.MEDICATIONS`;
            currentConfig.tblRawProblem = `${params.database}.PROBLEM`;
            currentConfig.MED_STRT_DT = 'STRT_DT';
            currentConfig.MED_END_DT = 'END_DT';
            currentConfig.MED_ORDER_DT = 'RECED_DT';
            currentConfig.PROB_ONSAT_DT = 'RECED_DT';
            currentConfig.PROB_NM = 'PROB_NM';
            currentConfig.PATIENT_ID_SYNTH = "PATIENT_ID_SYNTH";
            currentConfig.ethnicity = 'ETHNITY_1_DESC';
            currentConfig.tblRegimen = `${params.database}.IMPROPER_REGIMEN_SAHIL`;
            currentConfig.age = 'AGE';
            currentConfig.showPreactingAntivirals = true;
            currentConfig.Perfed_Dt = 'Perfed_Dt';
            currentConfig.tblLabs = `${params.database}.labs`;
            currentConfig.tblLabAnalysis = `${params.database}.LAB_ANALYSIS`;
        }
    } else {
        currentConfig.DB_NM = 'IMS_LRX_AmbEMR_Dataset';
        currentConfig.pdatabase = `IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS`;
        currentConfig.mdatabase = `IMS_LRX_AmbEMR_Dataset.PATIENT_MEDICATIONS`;
        currentConfig.tblViralload = `IMS_LRX_AmbEMR_Dataset.ALL_VIRAL_LOAD_RESULTS`;
        currentConfig.tblLiverTransplantCharge = `IMS_LRX_AmbEMR_Dataset.IMS_HCV_LIVERTRANSPLANT_CHARGE`;
        currentConfig.tblPatientSymptoms = `IMS_LRX_AmbEMR_Dataset.IMS_PATIENT_SYMPTOMS`;
        currentConfig.tblComorbidity = `IMS_LRX_AmbEMR_Dataset.IMS_HCV_MEDICATIONS_COMORBIDITY`;
        currentConfig.tblHcvPatient = currentConfig.pdatabase;
        currentConfig.ICD9_CD = 'BILLG_ICD9_CD';
        currentConfig.tblPatientMedication = currentConfig.mdatabase;
        currentConfig.tblRawMedications = `IMS_LRX_AmbEMR_Dataset.MEDICATIONS`;
        currentConfig.tblRawProblem = `IMS_LRX_AmbEMR_Dataset.PROBLEM`;
        currentConfig.ethnicity = 'ETHNITY_1_DESC';
        currentConfig.MED_STRT_DT = 'STRT_DT';
        currentConfig.MED_END_DT = 'END_DT';
        currentConfig.MED_ORDER_DT = 'RECED_DT';
        currentConfig.PROB_ONSAT_DT = 'RECED_DT';
        currentConfig.PROB_NM = 'PROB_NM';
        currentConfig.PATIENT_ID_SYNTH = "PATIENT_ID_SYNTH";
        currentConfig.showPreactingAntivirals = true;
        currentConfig.tblRegimen = `${params.database}.IMPROPER_REGIMEN_SAHIL`;
        currentConfig.age = 'AGE';
        currentConfig.Perfed_Dt = 'Perfed_Dt';
        currentConfig.tblLabs = `IMS_LRX_AmbEMR_Dataset.labs`;
        currentConfig.tblLabAnalysis = `${params.database}.LAB_ANALYSIS`;
    }
    return currentConfig;
}

// **************************************************** IMPORTANT *******************************************
// TO DO : if we have not provided where clause from the query then we have to append the 'WHERE' and 'AND' keyword conditionaly.
// otherwise the logic here will not work.
//function to prepare query for advaneced filters
export function getQueryForAdvFilters(queryObject) {
    let whereQuery = ``;

    //query for genotype
    if (queryObject.genotypes && queryObject.genotypes.length) {
        whereQuery += ` AND patients.GENOTYPE IN (${getStrFromArray(queryObject.genotypes)})`;
    }

    //query for treatment
    if (queryObject.treatment && queryObject.treatment.length) {
        whereQuery += ` AND patients.TREATMENT IN (${getStrFromArray(queryObject.treatment)})`;
    }

    //query for cirrhosis
    if (queryObject.cirrhosis && queryObject.cirrhosis.length) {
        whereQuery += ` AND patients.CIRRHOSIS IN (${getStrFromArray(queryObject.cirrhosis)})`;
    }

    //query for plans
    if (queryObject.plans && queryObject.plans != 'all') {
        whereQuery += ` AND patients.CLAIMS_INSURANCEPLAN IN ("${queryObject.plans}")`;
    }

    //query for medication filters
    if (queryObject.medicationArray && queryObject.medicationArray.length) {
        whereQuery += ` AND medication.MEDICATION IN (${getStrFromArray(queryObject.medicationArray)})`;
    }

    // //query for Medication (Pharma Tab)
    // if (queryObject.medication && queryObject.medication != 'all') {
    //     whereQuery += ` AND medication.MEDICATION  Like "%${queryObject.medication}%"`;
    // }

    //query for tenure value
    if (queryObject.tenure) {
        whereQuery += ` AND patients.FIRST_ENCOUNTER >= DATE_SUB(NOW(),INTERVAL ${parseInt(queryObject.tenure)} YEAR) `;
    }

    //query for other filters
    if (queryObject.othersFilters) {
        let othersFilters = queryObject.othersFilters;

        //for simple string Yes/No or values IN

        // alcohol query
        if (othersFilters.alcohol.length) {
            whereQuery += ` AND patients.ALCOHOL IN (${getStrFromArray(othersFilters.alcohol)})`;
        }

        // chemistry query
        if (othersFilters.chemistry.length) {
            whereQuery += ` AND patients.IS_ChemistryLab IN (${getStrFromArray(othersFilters.alcohol)})`;
        }

        // ethinicity query
        if (othersFilters.ethinicity.length) {
            whereQuery += ` AND patients.ETHNITY_1_DESC IN (${getStrFromArray(othersFilters.ethinicity)})`;
        }

        // fibroscan query
        if (othersFilters.fibroscan.length) {
            whereQuery += ` AND patients.IS_FibroscanLab IN (${getStrFromArray(othersFilters.fibroscan)})`;
        }

        // fibrosure query
        if (othersFilters.fibrosure.length) {
            whereQuery += ` AND patients.IS_FibrosureLab IN (${getStrFromArray(othersFilters.fibrosure)})`;
        }

        // hcc query
        if (othersFilters.hcc.length) {
            whereQuery += ` AND patients.IS_HCCLab IN (${getStrFromArray(othersFilters.hcc)})`;
        }

        // hiv query
        if (othersFilters.hiv.length) {
            whereQuery += ` AND patients.HIV IN (${getStrFromArray(othersFilters.hiv)})`;
        }

        // liverBiopsy query
        if (othersFilters.liverBiopsy.length) {
            whereQuery += ` AND patients.IS_LiverBiopsyLab IN (${getStrFromArray(othersFilters.liverBiopsy)})`;
        }

        // liverAssesment query
        if (othersFilters.liverAssesment.length) {
            whereQuery += ` AND patients.LIVER_ASSESMENT IN (${getStrFromArray(othersFilters.liverAssesment)})`;
        }

        // mentalHealth query
        if (othersFilters.mentalHealth.length) {
            whereQuery += ` AND patients.MENTAL_HEALTH IN (${getStrFromArray(othersFilters.mentalHealth)})`;
        }

        // renalFailure query
        if (othersFilters.renalFailure.length) {
            whereQuery += ` AND patients.RENAL_FAILURE IN (${getStrFromArray(othersFilters.renalFailure)})`;
        }


        //for range values

        // viralLoad query
        if (othersFilters.viralLoad.length) {
            whereQuery += ` AND ${getRangeQuery(othersFilters.viralLoad, 'patients.VIRAL_LOAD')}`;
        }

        // weight query
        if (othersFilters.weight.length) {
            whereQuery += ` AND ${getRangeQuery(othersFilters.weight, 'patients.BODY_WEIGHT')}`;
        }

        // meld query
        if (othersFilters.meld.length) {
            whereQuery += ` AND  ${getRangeQuery(othersFilters.meld ,'patients.MELD_SCORE')}`;
        }

        // etoh query
        if (othersFilters.etoh.length) {
            whereQuery += ` AND ${getRangeQuery(othersFilters.etoh ,'patients.ETOH')}`;
        }

        // age query
        if (othersFilters.age.length) {
            whereQuery += ` AND ${getRangeQuery(othersFilters.age, 'patients.Age')}`;
        }

        // apri query
        if (othersFilters.apri.length) {
            whereQuery += ` AND  ${getRangeQuery(othersFilters.apri, 'patients.APRI')}`;
        }

    }
    //query for time frame
    if (queryObject && queryObject.duration) {
        whereQuery += ` AND patients.FIRST_ENCOUNTER ${queryObject.duration} `;
    }
    // else{
    //     whereQuery += ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';
    // }
    return whereQuery;
}

//function to get query for range data
export let getRangeQuery = (rangeData, fieldName) => {
    let query = ``;
    // console.log('*********Range Data***********');
    // console.log(rangeData);
    // console.log(rangeData.length);
    for (let i = 0; i < rangeData.length; i++) {
        let rangeVal = rangeData[i].split('-'),
            min = parseInt(rangeVal[0].replace(/[^a-zA-Z0-9]/g, '')),
            max = 0;

        if (rangeVal[1]) {
            max = parseInt(rangeVal[1].replace(/[^a-zA-Z0-9]/g, ''));
        }

        // console.log('*******Range Val*********');
        // console.log(rangeVal);

        if (rangeVal.length > 1) {
            query += `${fieldName} BETWEEN ${rangeVal[0]} AND ${rangeVal[1] } `;
        } else {
            if ((rangeVal[0].indexOf('+') > -1) || (rangeVal[0].indexOf('>') > -1))
                query += `${fieldName} > ${min}`;
            else {
                query += `${fieldName} < ${min}`;
            }
        }

        if (i == rangeData.length - 1) {

        } else {
            query = `${query} OR `;
        }

        //console.log(i,query);

    }

    query = `(${query})`;

    return query;
}

export function getFDACompliantTreatmentPeriod() {
    // console.log(treatmentPeriod);
    return "8,12,16,24,36,48";
}



export let PharmaAdvanceAnalyticsGenotypeData = (baseData) => {
    let chartData = {};
    chartData['Genotypeall'] = null;
    chartData['Genotypeall'] = PreprareAdvanceAnalyticsGenotype(baseData, '');
    chartData['Genotype1a'] = null;
    chartData['Genotype1a'] = PreprareAdvanceAnalyticsGenotype(baseData, '1a');
    chartData['Genotype1b'] = null;
    chartData['Genotype1b'] = PreprareAdvanceAnalyticsGenotype(baseData, '1b');
    chartData['Genotype2'] = null;
    chartData['Genotype2'] = PreprareAdvanceAnalyticsGenotype(baseData, '2');
    chartData['Genotype3'] = null;
    chartData['Genotype3'] = PreprareAdvanceAnalyticsGenotype(baseData, '3');
    chartData['Genotype4'] = null;
    chartData['Genotype4'] = PreprareAdvanceAnalyticsGenotype(baseData, '4');
    // chartData['DuringMedication'] = PreprareAdvanceAnalytics(filteredpharmaDuringMedicationData);
    // chartData['AfterStart'] = PreprareAdvanceAnalytics(filteredpharmaAfterStartData);
    return chartData;
}



function generateWeeklyData(pharma) {
    let pData = [];
    let chartData = [];
    for (let keys in pharma) {
        let json = {},
            pData = pharma[keys];
        pData['weekrange'] = generateWeeklyRange(pData.TREATMENT_PERIOD);
        if (pData.PATIENT_ID_SYNTH != undefined)
            chartData.push(pData);
    }
    return chartData;
}

function generateWeeklyRange(weeknumber) {
    let range = null;
    if (weeknumber > 51) {
        range = '>51';
    } else if (weeknumber >= 41 && weeknumber <= 50) {
        range = '41-50';
    } else if (weeknumber >= 31 && weeknumber <= 40) {
        range = '31-40';
    } else if (weeknumber >= 21 && weeknumber <= 30) {
        range = '21-30';
    } else if (weeknumber >= 11 && weeknumber <= 20) {
        range = '11-20';
    } else if (weeknumber >= 1 && weeknumber <= 10) {
        range = '1-10';
    } else {
        //console.log('no data');
    }
    return range;
}


function PreprareAdvanceAnalyticsGenotype(filteredData, genotypev) {
    let jsonData = {};
    if (genotypev != '')
        filteredData = filteredData.filter((a) => a.GENOTYPE == genotypev);
    let pharmaDataViralScores = generateWeeklyData(filteredData);
    let groupedData = _.groupBy(pharmaDataViralScores, 'weekrange');
    let xaxisvalues = ['x', "1-10", "11-20", "21-30", "31-40", "41-50", ">51"];

    let XnameArray = [];

    for (let keys in groupedData) {
        let countvalues = {};
        let datavalues = {};
        let uniquecounts = 0;
        countvalues["axis"] = keys;
        countvalues["axisvalues"] = groupedData[keys].length;
        // countvalues["uniquecounts"] = 0;

        XnameArray.push(countvalues);
    }
    // console.log(XnameArray);
    let yaxisvalues = [];
    yaxisvalues.push("value");

    let patientuniquecount = [];
    patientuniquecount.push("uniquecount");
    // console.log('3');
    for (i = 1; i <= xaxisvalues.length - 1; i++) {
        let yval = 0;
        let ucount = 0;
        for (j = 0; j <= XnameArray.length - 1; j++) {
            if (xaxisvalues[i] == XnameArray[j].axis) {
                yval = XnameArray[j].axisvalues;
                ucount = XnameArray[j].uniquecounts;
            }
        }
        yaxisvalues.push(yval);
        patientuniquecount.push(ucount);
    }

    jsonData["xaxisvalue"] = xaxisvalues;
    jsonData["yaxisvalues"] = yaxisvalues;
    jsonData["dataflag"] = "false";
    for (i = 1; i < yaxisvalues.length; i++) {
        if (yaxisvalues[i] > 0)
            jsonData["dataflag"] = "true";
    }
    return jsonData;
}


export let PharmaAdvanceAnalyticsChartsData = (baseData) => {
    let chartData = {};

    chartData['BeforeStart'] = null;
    chartData['BeforeStartCount'] = null;
    chartData['AfterStart'] = null;
    chartData['AfterStartCount'] = null;
    chartData['DuringMedication'] = null;
    chartData['Remitted'] = null;
    chartData['Relapsed'] = null;
    chartData['BaseDataCount'] = null;
    chartData['ALLDATA'] = baseData;
    let CountData = 0;
    //   chartData['treatment'] = null;
    //   chartData['cirrhosis'] = null;
    //   chartData['mortality'] = null;
    //   chartData['gender'] = null;
    //prepare chart data  
    chartData['AllBaseDataCount'] = baseData.length;

    // CountData = _.uniq(baseData, function(person) {
    //     return person.PATIENT_ID_SYNTH;
    // });
    //chartData['BaseDataCount'] = CountData.length;

    CountData = getUniqueCount(baseData, 'PATIENT_ID_SYNTH');
    chartData['BaseDataCount'] = CountData;

    let filteredpharmaBeforeStartData = baseData.filter(function(a) {
        return new Date(a.Perfed_Dt) < new Date(a.STRT_DATE);
    });

    // CountData = _.uniq(filteredpharmaBeforeStartData, function(person) {
    //     return person.PATIENT_ID_SYNTH;
    // });
    // chartData['BeforeStartCount'] = CountData.length;

    CountData = getUniqueCount(filteredpharmaBeforeStartData, 'PATIENT_ID_SYNTH');
    chartData['BeforeStartCount'] = CountData;

    chartData['AllBeforeStartCount'] = filteredpharmaBeforeStartData.length;
    let filteredpharmaDuringMedicationData = baseData.filter(function(a) {
        return (new Date(a.Perfed_Dt) >= new Date(a.STRT_DATE) && new Date(a.Perfed_Dt) <= new Date(a.END_DATE));
    });

    let filteredpharmaAfterStartData = baseData.filter(function(a) {
        return (new Date(a.Perfed_Dt) > new Date(a.END_DATE));
    });

    // CountData = _.uniq(filteredpharmaAfterStartData, function(person) {
    //     return person.PATIENT_ID_SYNTH;
    // });
    // chartData['AfterStartCount'] = CountData.length;

    CountData = getUniqueCount(filteredpharmaAfterStartData, 'PATIENT_ID_SYNTH');
    chartData['AfterStartCount'] = CountData;

    chartData['AllAfterStartCount'] = filteredpharmaAfterStartData.length;

    chartData['Relapsed'] = prepareRelapsedPatientData(baseData);
    chartData['BeforeStart'] = PreprareAdvanceAnalytics(filteredpharmaBeforeStartData);
    chartData['DuringMedication'] = PreprareAdvanceAnalytics(filteredpharmaDuringMedicationData);
    chartData['AfterStart'] = PreprareAdvanceAnalytics(filteredpharmaAfterStartData);
    chartData['Remitted'] = prepareRemittedPatientsData(baseData);
    return chartData;
}

let prepareRemittedPatientsData = (baseData) => {
    let chartData = {};
    chartData['genotype'] = null;
    chartData['treatment'] = null;
    chartData['medication'] = null;
    chartData['treatment_period'] = null;
    //prepare data based on genotype
    chartData['genotype'] = prepareRemittedPatients(baseData, 'GENOTYPE');
    chartData['medication'] = prepareRemittedPatients(baseData, 'MEDICATION');
    chartData['treatment_period'] = prepareRemittedPatients(baseData, 'TREATMENT_PERIOD');
    return chartData;
}

//function tocalculate remiited patients distributed by genotype
let prepareRemittedPatients = (baseData, key) => {
    let grpGenodata = _.groupBy(baseData, key);
    let categories = [];
    let chartData = [];
    let arrayData = [];
    let arrayDataTotal = [];
    let jsontotal = {};
    let json = {};
    json['name'] = 'Remission';
    jsontotal['name'] = 'Total';

    for (let key in grpGenodata) {
        let keyData = grpGenodata[key];
        // let len = Object.keys(_.countBy(keyData, 'PATIENT_ID_SYNTH')).length;

        //Pram (29th May 17) : Unique count
        //let len = _.uniq(_.pluck(keyData, 'PATIENT_ID_SYNTH')).length;
        let len = getUniqueCount(keyData, 'PATIENT_ID_SYNTH');
        //console.log(len);
        //console.log(keyData.length);
        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 29-March-2017
         * @desc: Updated logic for find remitted patient and calculate cost for remitted patient
         */
        let totalTherapyCost = 0;
        for (let index = 0; index < keyData.length; index++) {
            totalTherapyCost += keyData[index].cost == undefined ? 0 : parseFloat(keyData[index].cost);
        }
        let remmitedPatient = getRemmittedPatientData(keyData);
        //// OLD CODE COMMENTED
        //console.log(remmitedPatient);
        // if (remmitedPatient[0].y != 0 && remmitedPatient[1].y != 0) {
        //     categories.push(key);
        //     arrayData.push(remmitedPatient[1]);
        //     arrayDataTotal.push(remmitedPatient[0]);
        // }

        //// OLD CODE COMMENTED END
        categories.push(key);
        arrayData.push({
            y: len,
            cost: parseFloat(parseFloat(totalTherapyCost / keyData.length).toFixed(0))

        });

        //     arrayData.push(remmitedPatient[1]);
        arrayDataTotal.push(remmitedPatient);



    }
    json['data'] = arrayDataTotal;
    jsontotal['data'] = arrayData;
    chartData.push(jsontotal);
    chartData.push(json);
    return {
        keys: categories,
        data: chartData
    };
}

let prepareRelapsedPatientData = (baseData) => {
    //let patientGrpData = _.groupBy(baseData,'PATIENT_ID_SYNTH');
    //let totalPatients = 0;
    //let RelapsedData = [];
    let chartData = {};
    chartData['genotype'] = null;
    chartData['race'] = null;
    chartData['cirrhosis'] = null;
    chartData['gender'] = null;
    chartData['age'] = null;
    chartData['fibrosis'] = null;
    chartData['medication'] = null;
    //get data based on genotype
    chartData['genotype'] = prepareRelapsedGenotype(baseData, 'GENOTYPE');
    //get data based on cirrhosis
    chartData['cirrhosis'] = prepareRelapsedGenotype(baseData, 'CIRRHOSIS');
    //filter data basedon gender
    chartData['gender'] = prepareRelapsedGender(baseData, 'GENDER_CD');
    //filter daat absedon race distribution
    chartData['race'] = prepareRelapsedGenotype(baseData, 'RACE_DESC');

    //filter data based on medication
    chartData['medication'] = prepareRelapsedGenotype(baseData, 'MEDICATION');
    //console.log(chartData);
    //filter distribution by age
    chartData['age'] = prepareRelapsedAge(baseData);

    //fibrosis data distribution
    chartData['fibrosis'] = prepareRelapsedFibrosis(baseData);

    return chartData;
}

let prepareRelapsedFibrosis = (baseData) => {
    let grpGenodata = prepareFibrosisData(baseData);
    //console.log(grpGenodata);
    let categories = [];
    let chartData = [];
    let arrayData = [];
    let arrayDataTotal = [];
    let jsontotal = {};
    let json = {};
    json['name'] = 'Relapsed';
    jsontotal['name'] = 'Total';

    for (let key in grpGenodata) {
        let keyData = grpGenodata[key];
        //let keyData = _.groupBy(grpGenodata[key], 'PATIENT_ID_SYNTH');
        // modified By Yuvraj to switch to PATIENT_ID_SYNTH
        let len = Object.keys(_.countBy(keyData, 'PATIENT_ID_SYNTH')).length;
        let avg_cost = 0;
        for (let index = 0; index < keyData.length; index++) {
            avg_cost += keyData[index].cost == undefined ? 0 : parseFloat(keyData[index].cost);
        }
        arrayData.push({
            y: len,
            cost: parseFloat(parseFloat(avg_cost / keyData.length).toFixed(0))
        });
        let relapsedPatient = getRelapsedPatientData(keyData);
        categories.push('F' + key);
        arrayDataTotal.push(relapsedPatient);
    }
    json['data'] = arrayDataTotal;
    jsontotal['data'] = arrayData;
    chartData.push(jsontotal);
    chartData.push(json);

    return {
        keys: categories,
        data: chartData
    };
}

let getRelapsedPatientData = (baseData) => {
    //console.log("***getRelapsedPatientData***");
    let patientGrpData = _.groupBy(baseData, 'PATIENT_ID_SYNTH');
    let RelapsedData = [];
    let total_cost = 0;
    //// Commented OLD Code for calculating relapsed patient
    // for (let patientid in patientGrpData) {
    //     let paData = patientGrpData[patientid];
    //     let flag = false;
    //     let startDate = paData[0]['STRT_DATE'];
    //     let endDate = paData[paData.length - 1]['END_DATE'];

    //     for (let index = 0; index < paData.length; index++) {
    //         //console.log(paData[index].Perfed_Dt,startDate,endDate);
    //         if (paData[index].Perfed_Dt > startDate) {
    //             let viraload = parseInt(paData[index]['ViralLoad']);
    //             //console.log(viraload,startDate,endDate);
    //             if (viraload != 0 && (paData[index].Perfed_Dt <= endDate)) {
    //                 total_cost += paData[index].cost == undefined ? 0 : parseFloat(paData[index].cost);
    //                 RelapsedData.push(paData[index]);
    //             }
    //         }
    //     }
    // }
    //// OLD code end

    //// Need to filter records with IS_RELAPSED
    /**
     * @author: Arvind
     * @reviewer: 
     * @date: 29-March-2017
     * @desc: Updated logic for find relapsed patient and calculate cost for relapsed patient
     */
    // Filter Relapsed patient using flag
    RelapsedData = _.filter(baseData, (patient) => {
        return patient.IS_RELAPSED && patient.IS_RELAPSED.toLowerCase() === "yes";
    });
    //Calculate Total cost for relapsed patient by summing up cost
    total_cost = _.reduce(RelapsedData, function(accumulator, patient) {

        return accumulator + (patient.cost === undefined ? 0 : parseFloat(patient.cost));
    }, 0);
    // modified By Yuvraj to switch to PATIENT_ID_SYNTH
    let count = Object.keys(_.countBy(RelapsedData, 'PATIENT_ID_SYNTH')).length;
    let avg_cost = 0;
    //console.log(count);
    //console.log(RelapsedData.length);
    if (RelapsedData.length != 0) {
        avg_cost = total_cost / RelapsedData.length;
    }
    return {
        y: count,
        cost: parseFloat(parseFloat(avg_cost).toFixed(0))
    };
}

let getRemmittedPatientData = (baseData) => {
        //console.log("** getRemmittedPatientData**")
        let patientGrpData = _.groupBy(baseData, 'PATIENT_ID_SYNTH');
        let remittedData = [];
        let totalPatients = 0;
        let remittedCost = 0;
        let total_patients_cost = 0;
        //// OLD CODE For Calculating Remitted patient and their cost
        // for (let patientid in patientGrpData) {
        //     let paData = patientGrpData[patientid];
        //     let flag = false;
        //     let startDate = paData[0]['STRT_DATE'];
        //     let endDate = paData[paData.length - 1]['END_DATE'];
        //     let temp_count = 0;
        //     let costv = 0;
        //     for (let index = 1; index < paData.length; index++) {

        //         if (paData[index].Perfed_Dt > startDate && (paData[index].Perfed_Dt <= endDate)) {
        //             costv = paData[index].cost == undefined ? 0 : parseFloat(paData[index].cost);
        //             temp_count += 1;
        //         }
        //     }
        //     if (temp_count > 1) {
        //         totalPatients += 1;
        //         total_patients_cost += costv;
        //     }
        //     for (let index = 1; index < paData.length; index++) {
        //         //console.log(paData[index].Perfed_Dt,startDate,endDate);
        //         if (paData[index].Perfed_Dt > startDate && parseInt(paData[0]['ViralLoad']) > 0) {

        //             let viraload = parseInt(paData[index]['ViralLoad']);
        //             //console.log(viraload,startDate,endDate);
        //             if (viraload == 0 && (paData[index].Perfed_Dt <= endDate)) {
        //                 total_cost += paData[index].cost == undefined ? 0 : parseFloat(paData[index].cost);
        //                 RelapsedData.push(paData[index]);
        //                 break;
        //             }
        //         }
        //     }
        // }
        //// OLD CODE END

        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 29-March-2017
         * @desc: Updated logic for find remmited patient and calculate cost for remmited patient
         */
        // Filter Relapsed patient using flag
        remittedData = _.filter(baseData, (patient) => {
            return patient.IS_REMITTED && patient.IS_REMITTED.toLowerCase() === "yes";
        });
        //Calculate Total cost for remitted patient by summing up cost
        remittedCost = _.reduce(remittedData, function(accumulator, patient) {

            return accumulator + (patient.cost === undefined ? 0 : parseFloat(patient.cost));
        }, 0);





        let avg_cost = 0;
        if (remittedData.length != 0) {
            avg_cost = remittedCost / remittedData.length;
        }
        let avg_total_patients_cost = 0;
        if (totalPatients != 0) {
            avg_total_patients_cost = total_patients_cost / totalPatients;
        }
        // modified By Yuvraj to switch to PATIENT_ID_SYNTH

        let count = Object.keys(_.countBy(remittedData, 'PATIENT_ID_SYNTH')).length;

        return {
            y: count,
            cost: parseFloat(parseFloat(avg_cost).toFixed(0))
        };
        // return [{
        //     y: count,
        //     cost: parseFloat(parseFloat(avg_cost).toFixed(0))
        // }, {
        //     y: totalPatients,
        //     cost: parseFloat(parseFloat(avg_total_patients_cost).toFixed(0))
        // }];
    }
    //prepare relapsed genotype data
let prepareRelapsedGenotype = (baseData, key) => {
    //console.log("**prepareRelapsedGenotype***");

    let grpGenodata = _.groupBy(baseData, key);
    let categories = [];
    let chartData = [];
    let totalTherapyCostChartData = [];
    let relapsedTherapyCostChartData = [];
    let finalTotalTherapyChart = {};
    let finalRelapsedCostChart = {};
    finalRelapsedCostChart['name'] = 'Relapsed';
    finalTotalTherapyChart['name'] = 'Total';

    for (let key in grpGenodata) {
        let keyData = grpGenodata[key];
        // modified By Yuvraj to switch to PATIENT_ID_SYNTH

        //let len = Object.keys(_.countBy(keyData, 'PATIENT_ID_SYNTH')).length;

        //Pram (29th May 17) : Unique count
        //let len = _.uniq(_.pluck(keyData, 'PATIENT_ID_SYNTH')).length;
        let len = getUniqueCount(keyData, 'PATIENT_ID_SYNTH');
        let totalTherapyCost = 0;
        for (let index = 0; index < keyData.length; index++) {
            totalTherapyCost += keyData[index].cost == undefined ? 0 : parseFloat(keyData[index].cost);
        }
        let relapsedPatientChartData = getRelapsedPatientData(keyData);
        categories.push(key);
        //console.log("len:"+len);

        //console.log("keyData.length:"+keyData.length);
        totalTherapyCostChartData.push({
            y: len,
            cost: parseFloat(parseFloat(totalTherapyCost / keyData.length).toFixed(0))
        });
        relapsedTherapyCostChartData.push(relapsedPatientChartData);
    }
    finalRelapsedCostChart['data'] = relapsedTherapyCostChartData;
    finalTotalTherapyChart['data'] = totalTherapyCostChartData;
    chartData.push(finalTotalTherapyChart);
    chartData.push(finalRelapsedCostChart);
    return {
        keys: categories,
        data: chartData
    };
}

//prepare relapsedPatient data by gender
let prepareRelapsedGender = (baseData, key) => {
    let grpGenodata = _.groupBy(baseData, key);
    let categories = [];
    let chartData = [];
    let arrayData = [];
    let arrayDataTotal = [];
    let jsontotal = {};
    let json = {};
    json['name'] = 'Relapsed';
    jsontotal['name'] = 'Total';

    for (let key in grpGenodata) {
        let keyData = grpGenodata[key];
        // modified By Yuvraj to switch to PATIENT_ID_SYNTH
        let len = Object.keys(_.countBy(keyData, 'PATIENT_ID_SYNTH')).length;
        let avg_cost = 0;
        for (let index = 0; index < keyData.length; index++) {
            avg_cost += keyData[index].cost == undefined ? 0 : parseFloat(keyData[index].cost);
        }
        let relapsedPatient = getRelapsedPatientData(keyData);
        let lbl = key == 'M' ? 'Male' : (key == 'F' ? 'Female' : 'Unknown');
        categories.push(lbl);
        arrayData.push({
            y: len,
            cost: parseFloat(parseFloat(avg_cost / keyData.length).toFixed(0))
        });
        arrayDataTotal.push(relapsedPatient);
    }
    json['data'] = arrayDataTotal;
    jsontotal['data'] = arrayData;
    chartData.push(jsontotal);
    chartData.push(json);

    return {
        keys: categories,
        data: chartData
    };
}

//prepare relpased patient data by age
let prepareRelapsedAge = (baseData, key1) => {
    let grpGenodata = ageCategories(baseData);
    //console.log(grpGenodata);
    let categories = [];
    let chartData = [];
    let arrayData = [];
    let arrayDataTotal = [];
    let jsontotal = {};
    let json = {};
    json['name'] = 'Relapsed';
    jsontotal['name'] = 'Total';

    for (let key in grpGenodata) {
        let keyData = grpGenodata[key];
        // modified By Yuvraj to switch to PATIENT_ID_SYNTH
        let len = Object.keys(_.countBy(keyData, 'PATIENT_ID_SYNTH')).length;
        let avg_cost = 0;
        for (let index = 0; index < keyData.length; index++) {
            avg_cost += keyData[index].cost == undefined ? 0 : parseFloat(keyData[index].cost);
        }
        let relapsedPatient = getRelapsedPatientData(keyData);
        categories.push(key);
        arrayData.push({
            y: len,
            cost: parseFloat(parseFloat(avg_cost / keyData.length).toFixed(0))
        });
        arrayDataTotal.push(relapsedPatient);
    }
    json['data'] = arrayDataTotal;
    jsontotal['data'] = arrayData;
    chartData.push(jsontotal);
    chartData.push(json);

    return {
        keys: categories,
        data: chartData
    };
}


let prepareFibrosisData = (baseData) => {

    //filter irrelevant data
    patientsData = baseData.filter((d) => !isNaN(parseFloat(d.fibro_Value)));

    let groupedData = _.groupBy(patientsData, (rec) => {
        let fibroValue = parseFloat(rec.fibro_Value).toFixed(2);

        if (fibroValue >= 0 && fibroValue <= 0.21)
            return "0";
        if (fibroValue >= 0.22 && fibroValue <= 0.31)
            return "1";
        if (fibroValue >= 0.32 && fibroValue <= 0.58)
            return "2";
        if (fibroValue >= 0.59 && fibroValue <= 0.73)
            return "3";
        //if (fibroValue >= 0.74 && fibroValue <= 1.00)
        if (fibroValue >= 0.74)
            return "4";
    });

    return groupedData;
}

function PreprareAdvanceAnalytics(filteredData) {
    let jsonData = {};
    let pharmaDataViralScores = generateViralScoreData(filteredData);
    let groupedData = _.groupBy(filteredData, 'viralscorerange');
    // Nisha 02/14/2017 Commented and changed the X axis to add the Undetectable  

    let xaxisvalues = ['x', "Undetectable", "<0.2M", "0.2M-1M", "1M-5M", "5M-25M", "25M+"];
    // xaxisvalues = ['x', "<0.2M", "0.2M-1M", "1M-5M", "5M-25M", "25M+"];

    // console.log('2');
    let XnameArray = [];

    for (let keys in groupedData) {
        let countvalues = {};
        let datavalues = {};
        let uniquecounts = 0;
        countvalues["axis"] = keys;
        // uniquecounts = _.uniq(groupedData[keys], function (person) {
        //     return person.PATIENT_ID_SYNTH;
        // });

        //countvalues["axisvalues"] = uniquecounts.length; // groupedData[keys].length;

        uniquecounts = getUniqueCount(groupedData[keys], 'PATIENT_ID_SYNTH');
        countvalues["axisvalues"] = uniquecounts;

        // countvalues["uniquecounts"] = 0;

        countvalues["uniquecounts"] = groupedData[keys].length; //uniquecounts.length;

        XnameArray.push(countvalues);
    }

    let yaxisvalues = [];
    yaxisvalues.push("value");

    let patientuniquecount = [];
    patientuniquecount.push("uniquecount");
    // console.log('3');
    for (i = 1; i <= xaxisvalues.length - 1; i++) {
        let yval = 0;
        let ucount = 0;
        for (j = 0; j <= XnameArray.length - 1; j++) {
            if (xaxisvalues[i] == XnameArray[j].axis) {
                yval = XnameArray[j].axisvalues;
                ucount = XnameArray[j].uniquecounts;
            }
        }
        yaxisvalues.push(yval);
        patientuniquecount.push(ucount);
    }

    jsonData["xaxisvalue"] = XnameArray;
    jsonData["yaxisvalues"] = yaxisvalues;
    jsonData["patientuniquecount"] = patientuniquecount;

    return jsonData;

}

let generateViralScoreRange = (viralload) => {
    let range = void 0;
    if (viralload >= 25000000) {
        range = '25M+';
    } else if (viralload >= 5000000 && viralload < 25000000) {
        range = '5M-25M';
    } else if (viralload >= 1000000 && viralload < 5000000) {
        range = '1M-5M';
    } else if (viralload >= 200000 && viralload < 1000000) {
        range = '0.2M-1M';
    } else if (viralload >= 1 && viralload < 200000) {
        range = '<0.2M';
    } else if (viralload <= 0) {
        range = 'Undetectable';
    } else {
        //console.log('no data');
    }
    return range;
}

function generateViralScoreData(pharma) {
    let pData = [];
    let chartData = [];
    for (let keys in pharma) {
        let json = {},
            pData = pharma[keys];
        pData['viralscorerange'] = generateViralScoreRange(pData.ViralLoad);
        if (pData.PATIENT_ID_SYNTH != undefined)
            chartData.push(pData);
    }
    return chartData;
}

export let PharmaSummaryChartsData = (baseData) => {
    let chartData = {};
    chartData['age'] = null;
    chartData['race'] = null;
    chartData['genotype'] = null;
    chartData['treatment'] = null;
    chartData['cirrhosis'] = null;
    chartData['mortality'] = null;
    chartData['gender'] = null;
    //prepare chart data
    let ageGroups = _.groupBy(baseData, function(rec) {
        if (rec.Age >= 0 && rec.Age <= 17)
            return '0-17';
        else if (rec.Age >= 18 && rec.Age <= 34)
            return '18-34';
        else if (rec.Age >= 35 && rec.Age <= 50)
            return '35-50';
        else if (rec.Age >= 51 && rec.Age <= 69)
            return '51-69';
        else if (rec.Age >= 70)
            return '70+';
    });
    //age data
    chartData['age'] = getKeyValueForData(ageGroups, 'age');
    //race data
    chartData['race'] = getKeyValueForData(_.groupBy(baseData, 'RACE_DESC'), 'race');

    //genotype Data
    chartData['genotype'] = getchartTypedonutData(_.groupBy(baseData, 'GENOTYPE'), 'genotype');

    //treatment data
    chartData['treatment'] = getchartTypedonutData(_.groupBy(baseData, 'TREATMENT'), 'treatment');
    //cirrhosis data
    chartData['cirrhosis'] = getchartTypedonutData(_.groupBy(baseData, 'CIRRHOSIS'), 'cirrhosis');

    //dead ind data
    chartData['mortality'] = getdonutchartDataMortality(_.groupBy(baseData, 'DEAD_IND'), 'mortality');

    //based on gender
    chartData['gender'] = getdonutchartDataGender(_.groupBy(baseData, 'GENDER_CD'), 'gender');

    return chartData;
}

//get cout by gender
let getdonutchartDataGender = (data) => {
    let json = {};
    for (let key in data) {
        json[key] = data[key].length;
    }
    return json;
}

let ageCategories = (baseData) => {
    let ageGroups = _.groupBy(baseData, function(rec) {
        if (rec.Age >= 0 && rec.Age <= 17)
            return '0-17';
        else if (rec.Age >= 18 && rec.Age <= 34)
            return '18-34';
        else if (rec.Age >= 35 && rec.Age <= 50)
            return '35-50';
        else if (rec.Age >= 51 && rec.Age <= 69)
            return '51-69';
        else if (rec.Age >= 70)
            return '70+';
    });
    return ageGroups;
}
let getchartTypedonutData = (data) => {
    let chartData = [];
    let keys = [];
    for (let key in data) {
        let json = {};
        json[key] = data[key].length;
        keys.push(key);
        chartData.push(json);
    }
    return {
        'data': chartData,
        'keys': keys
    };
}

let getdonutchartDataMortality = (data) => {
        let chartData = [];
        let keys = [];
        let lbl = '';
        for (let key in data) {
            let json = {};
            lbl = key == 'Y' ? 'Dead' : (key == 'N' ? 'Not Dead' : 'No Indications');
            json[lbl] = data[key].length;
            keys.push(lbl);
            chartData.push(json);
        }
        return {
            'data': chartData,
            'keys': keys
        };
    }
    //get key value for grouped data
let getKeyValueForData = (groupedData, keyword) => {
    let finalData = {};
    for (let keys in groupedData) {
        if (keys && keys != '') {
            let keyData = groupedData[keys],
                jsonData = {};
            let lbl = toTitleCase(keys);
            jsonData['count'] = keyData.length;
            jsonData[keyword] = lbl;
            if (keyData.length != 0)
                finalData[lbl] = jsonData;
        }
    }
    return finalData;
}

//function to convert into upper case first letter
export let toTitleCase = (str) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())




/**
 * @author Yuvraj Pal 13th Feb 17
 * The following function were written in Utilities file for pharma but they were also being used in the analytics tab.
 * I have moved them here So that it will clear that they may be used at multiple places.
 */

//function to prepare extra hepatic charts
export let prepareDataForExtraHepaticChart = (baseData) => {
    let allSymptoms = ['ARTHRALGIA', 'ARTHRITIS', 'CEREBRAL', 'CRYOGLOBULINEMIA',
        'FATIGUE', 'FIBROMYALGIA', 'CARDIOMYOPATHY', 'IDIOPATHIC_THROMBOCYTOPENIC_PURPURA',
        'INSULIN_RESISTANCE', 'LICHEN_MYXOEDEMATOUS', 'MULTIPLE_MYELOMA', 'NEUTROPENIA', 'PARESTHESIA'
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
        tempSymptomsCount.push({
            name: currentSymptom,
            y: symptomsData.length,
            patientPercentage: (parseFloat(symptomsData.length / baseData.length) * 100).toFixed(2)
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
                y: symptomsData.length
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

export let getFdaCompliantQuery = (fdaCheck) => {
    //Pram(30th Mar 17): Added null check  for fda
    let fdaString = fdaCheck ? fdaCheck : '';

    if (fdaString.toLowerCase() === 'yes') {
        return `AND medication.TREATMENT_PERIOD IN (${getFDACompliantTreatmentPeriod()}) `;
    } else if (fdaString.toLowerCase() === 'no') {
        return `AND medication.TREATMENT_PERIOD NOT IN (${getFDACompliantTreatmentPeriod()}) `;
    } else {
        return ``;
    }
}

//Pram(06 Apr 17) : Function to autoformat cost value 
export let autoFormatCostValue = (number, digits) => {
    let toFixedDigit = digits ? digits : 1;

    let costStore = [
            { value: 1E18, symbol: "QT" },
            { value: 1E15, symbol: "QD" },
            { value: 1E12, symbol: "T" },
            { value: 1E9, symbol: "B" },
            { value: 1E6, symbol: "M" },
            { value: 1E3, symbol: "K" }
        ],
        rx = /\.0+$|(\.[0-9]*[1-9])0+$/,
        i;

    for (let i = 0; i < costStore.length; i++) {
        if (number >= costStore[i].value) {
            return (number / costStore[i].value).toFixed(toFixedDigit).replace(rx, "$1") + ' ' + costStore[i].symbol;
        }
    }
    return number.toFixed(toFixedDigit).replace(rx, "$1");
}


export function getQueryForAdvFiltersWithoutMedication(queryObject) {
    let whereQuery = ``;

    //query for genotype
    if (queryObject.genotypes && queryObject.genotypes.length) {
        whereQuery += ` AND patients.GENOTYPE IN (${getStrFromArray(queryObject.genotypes)})`;
    }

    //query for treatment
    if (queryObject.treatment && queryObject.treatment.length) {
        whereQuery += ` AND patients.TREATMENT IN (${getStrFromArray(queryObject.treatment)})`;
    }

    //query for cirrhosis
    if (queryObject.cirrhosis && queryObject.cirrhosis.length) {
        whereQuery += ` AND patients.CIRRHOSIS IN (${getStrFromArray(queryObject.cirrhosis)})`;
    }

    //query for plans
    if (queryObject.plans && queryObject.plans != 'all') {
        whereQuery += ` AND patients.CLAIMS_INSURANCEPLAN IN ("${queryObject.plans}")`;
    }

    // //query for medication filters
    // if (queryObject.medicationArray && queryObject.medicationArray.length) {
    //     whereQuery += ` AND medication.MEDICATION IN (${getStrFromArray(queryObject.medicationArray)})`;
    // }

    // //query for Medication (Pharma Tab)
    // if (queryObject.medication && queryObject.medication != 'all') {
    //     whereQuery += ` AND medication.MEDICATION  Like "%${queryObject.medication}%"`;
    // }

    //query for tenure value
    if (queryObject.tenure) {
        whereQuery += ` AND patients.FIRST_ENCOUNTER >= DATE_SUB(NOW(),INTERVAL ${parseInt(queryObject.tenure)} YEAR) `;
    }

    //query for other filters
    if (queryObject.othersFilters) {
        let othersFilters = queryObject.othersFilters;

        //for simple string Yes/No or values IN

        // alcohol query
        if (othersFilters.alcohol.length) {
            whereQuery += ` AND patients.ALCOHOL IN (${getStrFromArray(othersFilters.alcohol)})`;
        }

        // chemistry query
        if (othersFilters.chemistry.length) {
            whereQuery += ` AND patients.IS_ChemistryLab IN (${getStrFromArray(othersFilters.alcohol)})`;
        }

        // ethinicity query
        if (othersFilters.ethinicity.length) {
            whereQuery += ` AND patients.ETHNITY_1_DESC IN (${getStrFromArray(othersFilters.ethinicity)})`;
        }

        // fibroscan query
        if (othersFilters.fibroscan.length) {
            whereQuery += ` AND patients.IS_FibroscanLab IN (${getStrFromArray(othersFilters.fibroscan)})`;
        }

        // fibrosure query
        if (othersFilters.fibrosure.length) {
            whereQuery += ` AND patients.IS_FibrosureLab IN (${getStrFromArray(othersFilters.fibrosure)})`;
        }

        // hcc query
        if (othersFilters.hcc.length) {
            whereQuery += ` AND patients.IS_HCCLab IN (${getStrFromArray(othersFilters.hcc)})`;
        }

        // hiv query
        if (othersFilters.hiv.length) {
            whereQuery += ` AND patients.HIV IN (${getStrFromArray(othersFilters.hiv)})`;
        }

        // liverBiopsy query
        if (othersFilters.liverBiopsy.length) {
            whereQuery += ` AND patients.IS_LiverBiopsyLab IN (${getStrFromArray(othersFilters.liverBiopsy)})`;
        }

        // liverAssesment query
        if (othersFilters.liverAssesment.length) {
            whereQuery += ` AND patients.LIVER_ASSESMENT IN (${getStrFromArray(othersFilters.liverAssesment)})`;
        }

        // mentalHealth query
        if (othersFilters.mentalHealth.length) {
            whereQuery += ` AND patients.MENTAL_HEALTH IN (${getStrFromArray(othersFilters.mentalHealth)})`;
        }

        // renalFailure query
        if (othersFilters.renalFailure.length) {
            whereQuery += ` AND patients.RENAL_FAILURE IN (${getStrFromArray(othersFilters.renalFailure)})`;
        }


        //for range values

        // viralLoad query
        if (othersFilters.viralLoad.length) {
            whereQuery += ` AND ${getRangeQuery(othersFilters.viralLoad, 'patients.VIRAL_LOAD')}`;
        }

        // weight query
        if (othersFilters.weight.length) {
            whereQuery += ` AND ${getRangeQuery(othersFilters.weight, 'patients.BODY_WEIGHT')}`;
        }

        // meld query
        if (othersFilters.meld.length) {
            whereQuery += ` AND  ${getRangeQuery(othersFilters.meld ,'patients.MELD_SCORE')}`;
        }

        // etoh query
        if (othersFilters.etoh.length) {
            whereQuery += ` AND ${getRangeQuery(othersFilters.etoh ,'patients.ETOH')}`;
        }

        // age query
        if (othersFilters.age.length) {
            whereQuery += ` AND ${getRangeQuery(othersFilters.age, 'patients.Age')}`;
        }

        // apri query
        if (othersFilters.apri.length) {
            whereQuery += ` AND  ${getRangeQuery(othersFilters.apri, 'patients.APRI')}`;
        }

    }
    //query for time frame
    if (queryObject && queryObject.duration) {
        whereQuery += ` AND patients.FIRST_ENCOUNTER ${queryObject.duration} `;
    }
    // else{
    //     whereQuery += ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';
    // }
    return whereQuery;
}

/**
 * @author: Pramveer
 * @date: 18-May-2017
 * @desc: function to get category id for a subpopulation so that it is common for different dataset
 */
export let getCategoryIdForSubpopulation = (subpopulationName) => {
    let availableSubpopulations = ['1_Experienced', '1_Experienced_Cirrhosis', '1_Naive', '1_Naive_Cirrhosis',
        '1a_Experienced', '1a_Experienced_Cirrhosis', '1a_Naive', '1a_Naive_Cirrhosis',
        '1b_Experienced', '1b_Experienced_Cirrhosis', '1b_Naive', '1b_Naive_Cirrhosis',
        '2_Experienced', '2_Experienced_Cirrhosis', '2_Naive', '2_Naive_Cirrhosis',
        '3_Experienced', '3_Experienced_Cirrhosis', '3_Naive', '3_Naive_Cirrhosis',
        '4_Experienced', '4_Experienced_Cirrhosis', '4_Naive', '4_Naive_Cirrhosis',
        '5_Experienced', '5_Experienced_Cirrhosis', '5_Naive', '5_Naive_Cirrhosis',
        '6_Experienced', '6_Experienced_Cirrhosis', '6_Naive', '6_Naive_Cirrhosis'
    ];

    let categoryId = availableSubpopulations.indexOf(subpopulationName);

    return categoryId < 0 ? 0 : categoryId + 1;
}



//function to refine color code by year
export let getColorCodeByTreatment = (val, isByCode) => {
    let raceStore = [{
            index: 8,
            name: 'naive',
            color: "#0091EA"
        },
        {
            index: 1,
            name: 'experienced',
            color: "#f1cb6a"
        },
        {
            index: 2,
            name: '',
            color: "#E57373"
        }
    ];

    let value = '';
    //check if is Name is to be returned instead of code
    try {
        if (isByCode) {
            value = _.where(raceStore, {
                index: val.toLowerCase()
            })[0].color;
        } else {
            value = _.where(raceStore, {
                name: val.toLowerCase()
            })[0].color;
        }
    } catch (e) {}
    return value;
}

//get colors for genotype comparisn
export let genotypeFixedColors = (val, isByCode) => {

    val = val ? val.toString() : 'null'; //check for undefined or null

    let genStore = [{
            index: 0,
            name: '1a',
            color: "#abd6ba"
        },
        {
            index: 1,
            name: '1b',
            color: "#f1cb6a"
        },
        {
            index: 2,
            name: '3',
            color: "#69bae7"
        },
        {
            index: 3,
            name: '4',
            color: "#2e7e97"
        },
        {
            index: 4,
            name: '5',
            color: "#FFCDD2"
        },
        {
            index: 5,
            name: '6',
            color: "#E57373"
        },
        {
            index: 6,
            name: 'null',
            color: "#673AB7"
        },
        {
            index: 7,
            name: '1',
            color: "#EDE7F6"
        },
        {
            index: 8,
            name: '2',
            color: "#B388FF"
        },
    ];

    let value = '#0091EA';

    //check if is Name is to be returned instead of code
    try {
        if (isByCode) {
            value = _.where(genStore, {
                index: val
            })[0].color;
        } else {
            value = _.where(genStore, {
                name: val
            })[0].color;
        }
    } catch (e) {

    }
    return value;
}



//function to refine race by name/code
export let getRaceCode = (val, isByCode) => {
    let raceStore = [{
            index: 0,
            name: 'AFRICAN AMERICAN',
            color: "#abd6ba"
        },
        {
            index: 1,
            name: 'CAUCASIAN',
            color: "#f1cb6a"
        },
        {
            index: 2,
            name: 'UNKNOWN',
            color: "#69bae7"
        },
        {
            index: 3,
            name: 'ASIAN',
            color: "#2e7e97"
        },
        {
            index: 4,
            name: 'OTHER',
            color: "#FFCDD2"
        },
        {
            index: 5,
            name: 'HISPANIC',
            color: "#E57373"
        },
        {
            index: 6,
            name: 'WHITE',
            color: "#673AB7"
        },
        {
            index: 7,
            name: 'BLACK',
            color: "#EDE7F6"
        },
    ];

    let value = '';

    //check if is Name is to be returned instead of code
    try {
        if (isByCode) {
            value = _.where(raceStore, {
                index: val
            })[0].color;
        } else {
            value = _.where(raceStore, {
                name: val
            })[0].color;
        }
    } catch (e) {

    }

    return value;
}


//function to refine color code by year
export let getColorCodeByYear = (val, isByCode) => {
    let raceStore = [{
            index: 0,
            name: '2011',
            color: "#abd6ba"
        },
        {
            index: 1,
            name: '2012',
            color: "#f1cb6a"
        },
        {
            index: 2,
            name: '2013',
            color: "#69bae7"
        },
        {
            index: 3,
            name: '2014',
            color: "#2e7e97"
        },
        {
            index: 4,
            name: '2015',
            color: "#FFCDD2"
        },
        {
            index: 5,
            name: '2016',
            color: "#E57373"
        },
        {
            index: 6,
            name: '2017',
            color: "#673AB7"
        },
        {
            index: 7,
            name: '2018',
            color: "#EDE7F6"
        },
    ];

    let value = '';
    //check if is Name is to be returned instead of code
    try {
        if (isByCode) {
            value = _.where(raceStore, {
                index: val
            })[0].color;
        } else {
            value = _.where(raceStore, {
                name: val
            })[0].color;
        }
    } catch (e) {}
    return value;
}

// //coors forall
// export let getColorByValue = (value) =>{
//     //let colors = d3.scale.category20c();
//     return "#"+((1<<24)*Math.random()|0).toString(value);
// }

//Praveen 22/05/2017 added custom colors array 
//list of 120 colors
export let getColorByValue = (index) => {
        let colors = ["#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
            "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
            "#ce6dbd", "#de9ed6", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
            "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
            "#ce6dbd", "#de9ed6", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
            "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
            "#ce6dbd", "#de9ed6", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
            "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
            "#ce6dbd", "#de9ed6", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
            "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
            "#ce6dbd", "#de9ed6", "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
            "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194",
            "#ce6dbd", "#de9ed6"
        ];
        let value = ~~index.toString().replace(/\D+/g, '');
        return value < colors.length ? colors[value] : colors[0];
    }
    ///////////////////////////////////////////////////////////////
export let settingMedicationColor = (medication) => {
    let color;
    switch (medication) {
        case "HARVONI":
        case "H":
            color = "#f0d817";
            break;
        case "PEGASYS":
        case "P":
            color = "#be29ec";
            break;
        case "SOVALDI":
        case "S":
            color = "#5d8f92";
            break;
        case "OLYSIO":
        case "O":
            color = "#3a329b";
            break;
        case "TECHNIVIE":
        case "T":
            color = "#afeeee";
            break;
        case "RIBAVIRIN":
        case "R":
            color = "#ffc8dc";
            break;
        case "DAKLINZA":
        case "D":
            color = "#56e4d6";
            break;
        case "VIEKIRA PAK":
        case "VIEKIRAPAK":
        case "V":
            color = "#f27d0c";
            break;
        case "RIBAVIRIN + SOVALDI":
        case "RIBAVIRIN+SOVALDI":
        case "R+S":
            color = "#e45664";
            break;
        case "OLYSIO + SOVALDI":
        case "OLYSIO+SOVALDI":
        case "O + S":
            color = "#4b86b4";
            break;
        case "DAKLINZA + SOVALDI":
        case "DAKLINZA+SOVALDI":
        case "D + S":
            color = "#87a188";
            break;
        case "PEGASYS + RIBAVIRIN + SOVALDI":
        case "PEGASYS+RIBAVIRIN+SOVALDI":
        case "P + R + S":
            color = "#b81f3b";
            break;
        case "HARVONI + RIBAVIRIN":
        case "HARVONI+RIBAVIRIN":
        case "H + R":
            color = "#ffb457";
            break;
        case "PEGASYS + SOVALDI":
        case "PEGASYS+SOVALDI":
        case "P + S":
            color = "#aaaaaa";
            break;
        case "RIBAVIRIN + VIEKIRA PAK":
        case "RIBAVIRIN+VIEKIRAPAK":
        case "R + V":
            color = "#e8dea4";
            break;
        case "DAKLINZA + RIBAVIRIN + SOVALDI":
        case "DAKLINZA+RIBAVIRIN+SOVALDI":
        case "D + R +S":
            color = "#0095a5";
            break;
        case "OLYSIO + RIBAVIRIN + SOVALDI":
        case "OLYSIO+RIBAVIRIN+SOVALDI":
        case "O + R + S":
            color = "#68359c";
            break;
        case "PEGASYS + RIBAVIRIN":
        case "PEGASYS+RIBAVIRIN":
        case "P + R":
            color = "#ffc0aa";
            break;
        case "RIBAVIRIN + TECHNIVIE":
        case "RIBAVIRIN+TECHNIVIE":
        case "R + T":
            color = "#529850";
            break;
        case "PEGASYS + RIBAVIRIN + VICTRELIS":
        case "PEGASYS+RIBAVIRIN+VICTRELIS":
        case "P + R + V":
            color = "#ff623b";
            break;
    }
    return color;
}

//get color code by year range
export let getColorCodeByAgeRange = (val, isByCode) => {
    let raceStore = [{
            index: 0,
            name: "0-22",
            color: "#abd6ba"
        },
        {
            index: 1,
            name: "23-32",
            color: "#f1cb6a"
        },
        {
            index: 2,
            name: "33-42",
            color: "#69bae7"
        },
        {
            index: 3,
            name: "43-52",
            color: "#2e7e97"
        },
        {
            index: 4,
            name: "53-62",
            color: "#FFCDD2"
        },
        {
            index: 5,
            name: "63-72",
            color: "#E57373"
        },
        {
            index: 6,
            name: "83+",
            color: "#673AB7"
        },
        {
            index: 7,
            name: "73-82",
            color: "#EDE7F6"
        },
    ];

    let value = '';
    //check if is Name is to be returned instead of code
    try {
        if (isByCode) {
            value = _.where(raceStore, {
                index: val
            })[0].color;
        } else {
            value = _.where(raceStore, {
                name: val
            })[0].color;
        }
    } catch (e) {}
    return value;
}


//function to refine color code by year
export let getColorCodeByInsurance = (val, isByCode) => {
    let raceStore = [{
            index: 8,
            name: 'medicaid',
            color: "#0091EA"
        },
        {
            index: 1,
            name: 'medicare',
            color: "#f1cb6a"
        },
        {
            index: 2,
            name: 'commercial',
            color: "#E57373"
        }
    ];

    let value = '';
    //check if is Name is to be returned instead of code
    try {
        if (isByCode) {
            value = _.where(raceStore, {
                index: val.toLowerCase()
            })[0].color;
        } else {
            value = _.where(raceStore, {
                name: val.toLowerCase()
            })[0].color;
        }
    } catch (e) {}
    return value;
}


//get color code by year range
export let getColorCodeByViralLoad = (val, isByCode) => {
    let raceStore = [{
            index: 0,
            name: "25M+",
            color: "#abd6ba"
        },
        {
            index: 1,
            name: "5M-25M",
            color: "#f1cb6a"
        },
        {
            index: 2,
            name: "1M-5M",
            color: "#69bae7"
        },
        {
            index: 3,
            name: "0.2M-1M",
            color: "#2e7e97"
        },
        {
            index: 4,
            name: "<0.2M",
            color: "#FFCDD2"
        },
        {
            index: 5,
            name: "Undetected",
            color: "#E57373"
        },
        {
            index: 6,
            name: "undefined",
            color: "#673AB7"
        },
    ];

    let value = '';
    //check if is Name is to be returned instead of code
    try {
        if (isByCode) {
            value = _.where(raceStore, {
                index: val
            })[0].color;
        } else {
            value = _.where(raceStore, {
                name: val
            })[0].color;
        }
    } catch (e) {}
    return value;
}




/**
 * @author: Arvind
 * @reviewer: 
 * @date: 30-May-2017
 * @desc: We have used `map` and `Set` to calculate unique patient count
 * Reference link :  https://www.reindex.io/blog/you-might-not-need-underscore/
 * Original Author : Ville Immonen
 * https://codereview.stackexchange.com/questions/60128/removing-duplicates-from-an-array-quickly
 * 
 */
//get unique patient count
export let getUniqueCount = (baseData, key) => {
    //PAT_CNT++;
    //return baseData ?baseData.length:0;
    if (baseData) {
        //      _ids = [];

        // for (obj in baseData) {
        //   _ids.push(obj[key]);
        // }
        //return new Set(baseData.map(value => value[key])).size;
        return new Set(_.pluck(baseData, key)).size;
    } else {
        return 0;
    }
}

/**
 * get count filter by medication
 * @param {*} baseData Array Of object
 * @param {*} key      Filter primary key(here PATIENT_ID_SYNTH) to find unique records
 * @param {*} mkey     Filter secondary key(For Medication) tofiind unique records 
 * @returns unique array count value
 */
export let getUniqueCountMedication = (baseData, key, mkey, params) => {
    // MED_CNT++;
    //return baseData ?baseData.length:0;
    if (baseData) {
        let filteredData = [];
        if (params) {
            filteredData = baseData.filter((rec) => rec[mkey] != undefined && rec[mkey] != null && rec[mkey] != '');
            filteredData = filteredData.filter((rec) => rec.IS_PREACTING_ANTIVIRAL == 'NO' || rec.IS_PREACTING_ANTIVIRAL == null);
        } else
            filteredData = baseData.filter((rec) => rec[mkey] != undefined && rec[mkey] != null && rec[mkey] != '');
        //return filteredData.length > 0 ? new Set(baseData.map(value => value[key])).size : 0;
        return filteredData.length > 0 ? new Set(_.pluck(baseData, key)).size : 0;

    } else {
        return 0;
    }
}


//function to get filtered data by key
export let getFilteredData = (baseData, mkey) => {
    if (baseData) {
        return baseData.filter((rec) => rec[mkey] != undefined && rec[mkey] != null && rec[mkey] != '');
    } else {
        return baseData;
    }
}


//file to get addtional query for basic & default filters

//function to remove duplicate entries from an array
export function getUniqueArray(baseData) {
    // var cleaned = [];
    // List.forEach(function(itm) {
    //     var unique = true;
    //     cleaned.forEach(function(itm2) {
    //         if (_.isEqual(itm, itm2)) unique = false;
    //     });
    //     if (unique) cleaned.push(itm);
    // });
    if (baseData) {
        return baseData.length > 0 ? Array.from(new Set(baseData)) : [];
    } else {
        return [];
    }

}

//function to remove duplicate entries from an array
/**
 *  Function takes array argument and return count for unique array value
 * @export 
 * @param {any} baseData  required
 * @returns unique array element count
 */
export function getUniqueArrayCount(baseData) {
    // var cleaned = [];
    // List.forEach(function(itm) {
    //     var unique = true;
    //     cleaned.forEach(function(itm2) {
    //         if (_.isEqual(itm, itm2)) unique = false;
    //     });
    //     if (unique) cleaned.push(itm);
    // });
    if (baseData) {
        return baseData.length > 0 ? new Set(baseData).size : 0;
    } else {
        return 0;
    }

}


/**
 * @author: Pramveer
 * @date: 31st May 17
 * @desc: function to get data based on the preacting med filter
 */

export let filterPreactingAntivirals = (dataArray, preactingFlag) => {
    let filteredData = [];

    //if the flag is true for preacting antivirals then return the data as it is
    if (preactingFlag) {
        filteredData = dataArray;
    }
    //else need to use only those records with preacting as 'NO' and null (due to left join)
    else {
        //filteredData = _.where(dataArray, {IS_PREACTING_ANTIVIRAL: 'NO'})
        filteredData = _.filter(dataArray, (rec) => {
            return rec.IS_PREACTING_ANTIVIRAL == 'NO' || rec.IS_PREACTING_ANTIVIRAL == null;
        });
    }
    return filteredData;
}


//function to group by fibrosis
//Praveen 5 June 2017
export let groupDataByFibrosis = (baseData) =>{
    let FibroStageGroup = _.groupBy(baseData, function(rec) {
                if (rec.FibrosureStage == 0)
                    return '0';
                if (rec.FibrosureStage == 1)
                    return '1';
                else if (rec.FibrosureStage == 3)
                    return '3';
                else if (rec.FibrosureStage == 2)
                    return '2';
                else if (rec.FibrosureStage == 4)
                    return '4';
                else
                    return 'Not Staged';
            });
        return FibroStageGroup;
}

//get abbreviation fo text string passed
export let  getDrugAbbr = (text) =>{
    let abbr = '',
        plusSeparated = text.split('+');

    for (let i = 0; i < plusSeparated.length; i++) {
        abbr += plusSeparated[i].trim().charAt(0);

        if (i != plusSeparated.length - 1) {
            abbr += ' + ';
        }
    }

    return abbr;
}