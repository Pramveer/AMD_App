import * as serverUtils from '../../common/serverUtils.js';
let treatedPatientsData = [];
let treatedPatientsDataClient = [];


export function setPatientsData(data) {
    // console.log(data);
    treatedPatientsData = data;
}

export function getPatientsData() {
    return treatedPatientsData;
}

export function setPatientsDataClient(data) {
    // console.log(data);
    treatedPatientsDataClient = data;
}

export function getPatientsDataClient() {
    return treatedPatientsDataClient;
}


//filter for data
export function filterChartData(baseData, filtersArray, isClient) {
    let modifiedData = [];
    return getModifiedData(filtersArray, baseData, isClient) || [];
}

//chart data preperation
export function prepareChartsData(baseData,filtersArrayFlag) {
    let chartData = {};
    let filteredMedicationData = [];
    //filter data for medication
    filteredMedicationData = serverUtils.getFilteredData(baseData, 'medication');
    //filter data formedication in case of preacting antiviral
    filteredMedicationData = filteredMedicationData.filter((rec)=>rec.IS_PREACTING_ANTIVIRAL == 'NO' || rec.IS_PREACTING_ANTIVIRAL == null);
    chartData['genotype'] = null;
    chartData['gender'] = null;
    chartData['genderGenotype'] = null;
    chartData['race'] = null;
    chartData['raceGenotype'] = null;
    chartData['age'] = null;
    chartData['ageGenotype'] = null;
    chartData['treatment'] = null;
    chartData['treatmentGenotype'] = null;
    chartData['cirrhosis'] = null;
    chartData['cirrhosisGenotype'] = null;
    chartData['diseasePrediction'] = null;
    chartData['treatmentPriority'] = null;
    chartData['riskDistribution'] = null;
    chartData['survivalRate'] = null;
    chartData['mortalityRate'] = null;
    chartData['costBurden'] = null;
    chartData['totalpatients'] = serverUtils.getUniqueCount(baseData, 'patientId');
    chartData['totalpatientsMedication'] = serverUtils.getUniqueCount(filteredMedicationData, 'patientId');//serverUtils.getUniqueCountMedication(baseData, 'patientId', 'medication');;
    chartData['treatmentCirrhosis'] = null;
    chartData['Cirrhosistreatment'] = null;
    chartData['cirrhosistype'] = null;
    chartData['cirrhosistypeDistribution'] = null;
    chartData['treatmentStatusDistribution'] = null;
    chartData['insurance'] = null;
    chartData['svr'] = null;
    chartData['RetreatedChartData'] = null;
    chartData['patientPrescription'] = null;
    chartData['MarketShareOverMonthsChartData'] = null;
    chartData['costPrescription'] = null;
    chartData['prescriptionCount'] = null;
    chartData['drugGenotypeDistribution1'] = null;
    chartData['treatmentM'] = null;
    chartData['drugFibrosisDistribution'] = null;

    /**
     * @author: Pramveer
     * @date: 27th June 17
     * @desc: prepared data for new charts
    */
    chartData['hcvIncidentData'] = null;
    chartData['hcvEstimationData'] = null;
    chartData['hcvPrevelenceData'] = null;

    //commented for performance issue, carrying heavy load of data.
    //chartData['originalData'] = baseData;

    //genotype Data
    chartData['genotype'] = getKeyValueForData(createGroupbyGenotype(baseData), 'genotype');

    //cirrhosis data
    chartData['cirrhosis'] = getKeyValueForData(_.groupBy(baseData, 'cirrhosis'), 'cirrhosis');

    //treatment data
    chartData['treatment'] = getKeyValueForData(_.groupBy(baseData, 'treatment'), 'treatment');
    //treatment treatment by medication
    chartData['treatmentM'] = getKeyValueForData(_.groupBy(filteredMedicationData, 'treatment'), 'treatment');
    //gender data
    chartData['gender'] = getKeyValueForData(_.groupBy(baseData, 'gender'), 'gender');

    //race data
    chartData['race'] = getKeyValueForData(_.groupBy(baseData, 'race'), 'race');

    //insurance plan
    chartData['insurance'] = getInsuranceChartData(baseData, 'Insurance', filtersArrayFlag);

    let ageGroups = createAgeRangeIfNot(baseData);

    chartData['age'] = getKeyValueForData(ageGroups, 'age');


    //disease prediction data
    chartData['diseasePrediction'] = getDiseasePredictionData(baseData, 'diseasePrediction');

    //treatment priority data
    chartData['treatmentPriority'] = prepareFibrosisData(baseData);

    //risk didtribution data
    chartData['riskDistribution'] = prepareRiskData(baseData);
    //survival rate data
    chartData['survivalRate'] = prepareSurvivalRateData(baseData); //prepareMeldData(baseData);

    //mortality rate data
    chartData['mortalityRate'] = prepareDataForMeldDonut(baseData);

    //cost burden data
    chartData['costBurden'] = prepareCostBurdenData(createGroupbyGenotype(baseData));

    //gender distribution with genotype
    chartData['genderGenotype'] = prepareGenderGenoData(createGroupbyGenotype(baseData));

    //cirrhois distribution with genotype
    chartData['cirrhosisGenotype'] = prepareCirrhosisGenoData(createGroupbyGenotype(baseData));

    //treatment distribution with genotype
    chartData['treatmentGenotype'] = prepareTreatmentGenoData(createGroupbyGenotype(baseData));

    //Retreatment Distribution with genotyp
    chartData['RetreatedChartData'] = prepareRetreatedPatientChartData(filteredMedicationData);//_.filter(baseData, (item) => { if (item.IS_RETREATED.toLowerCase() == 'yes') { return item; } }));


    //race distribution with genotype
    chartData['raceGenotype'] = prepareraceGenoData(createGroupbyGenotype(baseData));

    //age distribution with genotype
    chartData['ageGenotype'] = prepareAgeGenoData(createGroupbyGenotype(baseData));
    /*
        //cirrhosis yes distribution
        */
    chartData['cirrhosistypeDistribution'] = prepareCirrhosisDistribution(_.groupBy(baseData, 'treatment'));

    chartData['treatmentStatusDistribution'] = prepareTreatmentStatusDistribution(baseData);

    chartData['treatmentCirrhosis'] = prepareCirrosisTreatmentData(baseData);

    
    //drug distribution with genotype
    chartData['drugGenotypeDistribution1'] = prepareDrugGenotypechart(filteredMedicationData); //prepareDrugGenotypechart(medData);
        //svr chart data
    chartData['svr'] = preprareSVRGroupData(baseData, 'SVR'); //preprareSVRChartsData(baseData,'SVR');

    //prepare data for new charts 
    chartData['patientPrescription'] = preparePatientPrescriptionData(baseData, filteredMedicationData);

    //prepare data for new charts Market share Over Months Chart Data
    chartData['MarketShareOverMonthsChartData'] = prepareMarketShareOverMonthsChartData(filteredMedicationData);

    //prepare data for cost prescription chart 
    chartData['costPrescription'] = prepareDataforRxCostPrescription(filteredMedicationData);
    //prepare data for cost prescription
    chartData['prescriptionCount'] = prepareDataForPrescriptionChart(filteredMedicationData);
    chartData['drugFibrosisDistribution']  = prepareDrugFibrosischart(filteredMedicationData);

    chartData['hcvIncidentData'] = getHcvIncidentData(baseData);
    chartData['hcvEstimationData'] = getHcvEstimationData(baseData);
    chartData['hcvPrevelenceData'] = getHCVPrevelenceData(baseData);

    return chartData;

}


//get key value for grouped data
let getKeyValueForData = (groupedData, keyword) => {
    let finalData = {};

    for (let keys in groupedData) {
        if (keys && keys != '' && keys != undefined && keys != 'undefined') {
            let keyData = groupedData[keys],
                jsonData = {};
            let lbl = keyword == 'SVR' ? keys : toTitleCase(keys);
            jsonData['count'] = serverUtils.getUniqueCount(keyData, 'patientId'); // keyData.length;
            jsonData[keyword] = lbl;
            if (keyword == 'race') {
                jsonData['color'] = serverUtils.getRaceCode(lbl.toUpperCase());
            } else if (keyword == 'genotype') {
                jsonData['color'] = serverUtils.genotypeFixedColors(lbl.toLowerCase());
            } else if (keyword == 'SVR') {
                jsonData['color'] = serverUtils.getColorCodeByViralLoad(lbl);
            }
            if (keyData.length != 0) {
                finalData[lbl] = jsonData;
            }
        }
    }

    return finalData;
}

//get insurnace data
let getInsuranceChartData = (baseData, keyword, filterFlag) => {
    let finalData = [];
    let keys = [];
    let noerrollment = baseData.filter((d) => d['CLAIMS_INSURANCEPLAN'] && d['CLAIMS_INSURANCEPLAN'].toLowerCase().indexOf('enrollment') > -1).length;
    //filter data based on apri is not null or undefined
    baseData = baseData.filter((d) => d['CLAIMS_INSURANCEPLAN'] != null && d['CLAIMS_INSURANCEPLAN'] != '' && d['CLAIMS_INSURANCEPLAN'].toLowerCase().indexOf('enrollment') == -1);
    baseData.sort(function(a, b) {
        var x = a['CLAIMS_INSURANCEPLAN'].toLowerCase();
        var y = b['CLAIMS_INSURANCEPLAN'].toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    let total = 0;
    if (!filterFlag) {
        let insurancegrpData = _.groupBy(baseData, 'InsuranceGrp');
        for (let key in insurancegrpData) {
            let json = {};
            let label = key;
            if (key.toLowerCase().indexOf('schip') > -1) {
                let tempTxt = key.split('/');
                if (tempTxt.length > 2) {
                    label = tempTxt[0] + ' ' + tempTxt[1] + ' SCHIP';
                } else {
                    label = tempTxt[0] + ' SCHIP';
                }
            }
            let count = serverUtils.getUniqueCount(insurancegrpData[key], 'patientId');
            json[label] = count;
            finalData.push(json);
            keys.push(label);
            total += count;
        }
    } else {
        let insurancegrpData = _.groupBy(baseData, 'CLAIMS_INSURANCEPLAN');
        for (let key in insurancegrpData) {
            let json = {};
            let label = key;
            if (key.toLowerCase().indexOf('schip') > -1) {
                let tempTxt = key.split('/');
                if (tempTxt.length > 2) {
                    label = tempTxt[0] + '/' + tempTxt[1] + '/SCHIP';
                } else {
                    label = tempTxt[0] + '/SCHIP';
                }
            }
            let count = serverUtils.getUniqueCount(insurancegrpData[key], 'patientId');
            json[label] = count;
            finalData.push(json);
            keys.push(label);
            total += count;
        }
    }

    return { data: finalData, key: keys, total: total, filter: filterFlag };
}


let preprareSVRChartsData = (baseData) => {
    let jsonData = {};
    let pharmaDataViralScores = generateViralScoreData(baseData);
    let groupedData = _.groupBy(baseData, 'viralscorerange');
    let xaxisvalues = ['x', "<0.2M", "0.2M-1M", "1M-5M", "5M-25M", "25M+"];
    // console.log('2');
    let XnameArray = [];

    for (let keys in groupedData) {
        let countvalues = {};
        let datavalues = {};
        let uniquecounts = 0;
        countvalues["axis"] = keys;
        countvalues["axisvalues"] = groupedData[keys].length;
        countvalues["uniquecounts"] = 0;

        uniquecounts = _.uniq(groupedData[keys], (person)=> person.PATIENT_ID_SYNTH);
        countvalues["uniquecounts"] = uniquecounts.length;

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
    } else if (viralload < 200000 && viralload > 0) {
        range = '<0.2M';
    } else if (viralload == 0 || viralLoad.toString().toLowerCase().indexOf('detected') != -1) {
        range = 'Undetected';
    } else {
        //console.log('no data');
    }
    return range;
}

let preprareSVRGroupData = (baseData) => {
    //let viralload = void 0;
    let filterData = baseData.filter((d) => d.viralLoad != null && d.viralLoad != undefined);
    let SVRGroups = _.groupBy(filterData, function(rec) {
        // let viralload = rec.viralLoad;
        if (rec.viralLoad == 0 || rec.viralLoad == 'NOT DETECTED')
            return 'Undetected';
        else if (rec.viralLoad < 200000 && rec.viralLoad > 0)
            return '<0.2M';
        else if (rec.viralLoad >= 200000 && rec.viralLoad < 1000000)
            return '0.2M-1M';
        else if (rec.viralLoad >= 1000000 && rec.viralLoad < 5000000)
            return '1M-5M';
        else if (rec.viralLoad >= 5000000 && rec.viralLoad < 25000000)
            return '5M-25M';
        else if (rec.viralLoad >= 25000000)
            return '25M+';
    });

    let data = getKeyValueForData(SVRGroups, 'SVR');
    return data;
}

function generateViralScoreData(pharma) {
    let pData = [];
    let chartData = [];
    for (let keys in pharma) {
        let json = {},
            pData = pharma[keys];
        pData['viralscorerange'] = generateViralScoreRange(pData.viralLoad);
        if (pData.PATIENT_ID_SYNTH != undefined)
            chartData.push(pData);
    }
    return chartData;
}

//get key value for grouped data
let getDiseasePredictionData = (baseData, keyword) => {
    let finalData = {};
    //filter data based on apri is not null or undefined
    baseData = baseData.filter((d) => d['APRI'] != null);
    let totalPatients = 0;
    //group data based on apri value less than 1 or greater than 1
    groupedData = _.groupBy(baseData, (rec) => parseFloat(rec.APRI) < 1 ? 'N' : 'Y');

    for (let keys in groupedData) {
        if (keys && keys != '') {
            let keyData = groupedData[keys],
                jsonData = {};
            let lbl = toTitleCase(keys);
            jsonData['count'] = serverUtils.getUniqueCount(keyData, 'patientId'); //keyData.length;
            totalPatients += ~~jsonData['count'];
            jsonData[keyword] = lbl;
            finalData[lbl] = jsonData;
        }

    }

    return ({
        data:finalData,
        total:totalPatients
    });
}

//function for fibrosis data
let prepareFibrosisData = (patientsData) => {
    let chartData = [];

    //filter irrelevant data
    patientsData = patientsData.filter((d) => !isNaN(parseFloat(d.fibro_Value)));

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

    function getRangeForStage(stage) {
        let stageStore = [{
            stage: 0,
            range: '0-0.21'
        }, {
            stage: 1,
            range: '0.22-0.31'
        }, {
            stage: 2,
            range: '0.32-0.58'
        }, {
            stage: 3,
            range: '0.59-0.73'
        }, {
            stage: 4,
            range: '0.74+'
        }, ];

        let filterStage = _.where(stageStore, {
            stage: stage
        })[0];
        return filterStage ? filterStage.range : '';
    }

    let totalPatients = 0;
    totalPatients = serverUtils.getUniqueCount(patientsData, 'patientId');
    //prepare chart data
    for (let keys in groupedData) {
        let json = {},
            pData = groupedData[keys],
            fibroValues = [];

        for (let j = 0; j < pData.length; j++) {
            fibroValues.push(pData[j]['fibro_Value']);
        }

        json['stage'] = parseFloat(keys);
        json['range'] = getRangeForStage(parseFloat(keys));
        json['avgFibrosis'] = parseFloat(fibroValues.average()).toFixed(2);
        json['patientCount'] = serverUtils.getUniqueCount(pData, 'patientId'); //pData.length;
        json['total'] = totalPatients; //patientsData.length;
        chartData.push(json);
    }

    // console.log('************Chart Data************');
    // console.log(chartData);
    return ({
        data:chartData,
        totalPatients:totalPatients
    });
}

//function to prepare risk distribution data
let prepareRiskData = (baseData) => {
    let keys = ['HIV', 'Mental Health', 'Alcohol', 'Renal Failure', 'Pregnancy'],
        data = {};
    let totalPatients = 0;
    for (let k = 0; k < keys.length; k++) {
        let grpkeys = _.groupBy(baseData, keys[k]);
        data[keys[k]] = serverUtils.getUniqueCount(grpkeys[1], 'patientId'); //(grpkeys[1] == undefined ? 0 : grpkeys[1].length);
    }
    totalPatients = serverUtils.getUniqueCount(baseData, 'patientId');
    return ({
        data:data,
        total:totalPatients
    });
}

//function to prepare meldScore data
let prepareMeldData = (baseData) => {
    let totalCount = serverUtils.getUniqueCount(baseData, 'patientId'); //baseData.length;

    let groupedData = _.groupBy(baseData, (rec) => {
        let disDate = new Date(rec.admissionDate);
        return disDate.getFullYear() + '-' + (disDate.getMonth() + 1);
    });

    let chartData = [];

    for (let keys in groupedData) {
        let json = {},
            pData = groupedData[keys],
            meldScores = [];

        for (let j = 0; j < pData.length; j++) {
            let meldVaLue = pData[j]['MeldScore'] < 1 ? 1 : pData[j]['MeldScore'];
            meldScores.push(meldVaLue);
        }

        let avgMeldScore = meldScores.average().toFixed(2);

        json['date'] = keys + '-01';
        json['avgMeldScore'] = avgMeldScore;
        json['patientCount'] = serverUtils.getUniqueCount(pData, 'patientId'); //pData.length;
        json['total'] = totalCount;
        json['range'] = getMeldScoreRange(avgMeldScore).range;
        chartData.push(json);
    }

    return chartData;
}

//function to prepare data for meld donut
function prepareDataForMeldDonut(baseData) {

    //filter for zero values
    baseData = baseData.filter((d) => d['meldScore'] != null);

    let totalCount = serverUtils.getUniqueCount(baseData,'patientId');

    let groupedData = _.groupBy(baseData, (rec) => {
        let meldValue = parseFloat(rec.meldScore);
        return getMeldScoreRange(meldValue).mortality + ' Mortality';
    });

    let chartData = [];

    for (let keys in groupedData) {
        let json = {},
            pData = groupedData[keys],
            meldScores = [];

        for (let j = 0; j < pData.length; j++) {
            let meldVaLue = pData[j]['meldScore'] < 1 ? 1 : pData[j]['meldScore'];
            meldScores.push(meldVaLue);
        }

        let avgMeldScore = meldScores.average().toFixed(2);

        json['avgMeldScore'] = avgMeldScore;
        json[keys] = pData.length;
        json['total'] = totalCount;
        json['range'] = getMeldScoreRange(avgMeldScore).range;
        json['identifier'] = getMeldScoreRange(avgMeldScore).mortality;
        chartData.push(json);
    }

    return ({
        data:chartData,
        totalPatients:totalCount
    });
}

function getMeldScoreRange(meldScore) {
    let range, mortality;

    if (meldScore >= 40) {
        range = '>40';
        mortality = '71.3%';
    } else if (meldScore >= 30 && meldScore <= 39) {
        range = '30-39';
        mortality = '52.6%';
    } else if (meldScore >= 20 && meldScore <= 29) {
        range = '20-29';
        mortality = '19.6%';
    } else if (meldScore >= 10 && meldScore <= 19) {
        range = '10-19';
        mortality = '6.0%';
    } else if (meldScore >= 0 && meldScore <= 9) {
        range = '0-9';
        mortality = '1.9%';
    }

    return {
        range: range,
        mortality: mortality
    }
}

//function to prepare cost burden data
function prepareCostBurdenData(patientsData) {
    let groups = ["Antiviral Therapy", "Liver Disease", "Physician Service", "Hospitalization"]; //["Physician Service", "Hospitalization", "Diagnostic Testing", "Liver Disease", "Antiviral Therapy"];
    let finalData = [];
    for (let key in patientsData) {
        let json = {};
        json['genotype'] = key;
        for (let i = 0; i < groups.length; i++) {
            json[groups[i]] = 0;
            var costgrp = _.groupBy(patientsData[key], groups[i]);
            var data1 = costgrp[1] == undefined ? [] : costgrp[1];
            var grpLabel = groups[i];
            json[grpLabel] = 0;

            for (let k = 0; k < data1.length; k++) {
                var lbl = grpLabel + '_Cost';
                if (data1[k][lbl] != '')
                    json[grpLabel] += parseFloat(data1[k][lbl] || 0);
            }
            json[grpLabel] = (json[grpLabel] / data1.length);
            json[grpLabel + '_count'] = serverUtils.getUniqueCount(data1, 'patientId'); //data1.length;
        }
        json['color'] = serverUtils.genotypeFixedColors(key.toLocaleLowerCase());

        finalData.push(json);
    }
    return finalData;
}

Array.prototype.average = function() {
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
        return sum / j;
    }
}


//gender data genotype wise
let prepareGenderGenoData = function(chartData) {
    let data = [];
    for (let key in chartData) {
        let json = {};
        json['genotype'] = key;
        json['patients'] = serverUtils.getUniqueCount(chartData[key], 'patientId'); //chartData[key].length;
        var grpGender = _.groupBy(chartData[key], 'gender');
        for (let gen in grpGender) {
            let genLabel = (gen == 'M' ? 'Male' : (gen == 'F' ? 'Female' : 'Unknown'));
            json[genLabel] = serverUtils.getUniqueCount(grpGender[gen], 'patientId'); //grpGender[gen].length;
        }
        data.push(json);
    }
    return data;
}

let prepareCirrhosisGenoData = function(chartData) {
    let data = [];
    for (let key in chartData) {
        let json = {};
        json['genotype'] = key;
        json['patients'] = serverUtils.getUniqueCount(chartData[key], 'patientId'); //chartData[key].length;
        var grp = _.groupBy(chartData[key], 'cirrhosis');
        for (let cirr in grp) {
            let lbl = cirr == 'Yes' ? 'Cirrhosis' : 'Non Cirrhosis';
            json[lbl] = serverUtils.getUniqueCount(grp[cirr], 'patientId'); //grp[cirr] == undefined ? 0 : grp[cirr].length;
        }
        data.push(json);
    }

    return data;
}

let prepareTreatmentGenoData = function(chartData) {
    let data = [];
    for (let key in chartData) {
        let json = {};
        json['genotype'] = key;
        json['patients'] = serverUtils.getUniqueCount(chartData[key], 'patientId'); //chartData[key].length;
        var grp = _.groupBy(chartData[key], 'treatment');
        for (let treat in grp) {
            json[treat] = serverUtils.getUniqueCount(grp[treat], 'patientId'); //grp[treat] == undefined ? 0 : grp[treat].length;
        }
        data.push(json);
    }
    return data;
}

let prepareraceGenoData = function(chartData) {
    let data = [];
    for (let key in chartData) {
        let json = {};
        json['genotype'] = key;
        json['patients'] = serverUtils.getUniqueCount(chartData[key], 'patientId') //chartData[key].length;
        var grp = _.groupBy(chartData[key], 'race');
        for (let key in grp) {
            let lbl = toTitleCase(key);
            json[lbl] = serverUtils.getUniqueCount(grp[key], 'patientId'); //grp[key].length;
        }
        data.push(json);
    }
    return data;
}


let prepareAgeGenoData = function(GenotypeGroupData) {
    let data = [];
    for (let genotype in GenotypeGroupData) {
        let temp = {};
        temp['genotype'] = genotype;
        temp['patients'] = serverUtils.getUniqueCount(GenotypeGroupData[genotype], 'patientId') //GenotypeGroupData[genotype].length;

        //added function to return data based on value or range
        let grpRange = createAgeRangeIfNot(GenotypeGroupData[genotype]);
        if (grpRange) {
            for (let agekey in grpRange) {
                let len = serverUtils.getUniqueCount(grpRange[agekey], 'patientId'); //grpRange[agekey].length;
                if (len != 0) {
                    temp[agekey] = len;
                }

            }
            data.push(temp);
        }
    }
    return data;
}


//prepare group chart data cirrhosis treatment
let prepareCirrosisTreatmentData = function(baseData) {

    baseData = baseData.filter((rec) => rec.cirrhosistype != null && rec.cirrhosistype != '' && rec.cirrhosis != 'No');
    let yearGroupData = _.groupBy(baseData, 'cirrhosistype');
    let keys = Object.keys(yearGroupData);
    let chartData = [];

    let genoGroData = _.groupBy(baseData, 'treatment');
    let flag = Object.keys(genoGroData).length < 2 ? true : false;
    for (let geno in genoGroData) {
        let simjson = {};
        simjson['name'] = geno;
        let genoData = genoGroData[geno];
        simjson['y'] = serverUtils.getUniqueCount(genoData, 'patientId'); //genoData.length;
        simjson['color'] = serverUtils.getColorCodeByTreatment(geno);
        let dgeno = [];
        let yearGroupDataGeno = _.groupBy(genoData, 'cirrhosistype');
        for (let yr of keys) {
            let yjson = {};
            yjson['name'] = geno;
            yjson['y'] = serverUtils.getUniqueCount(yearGroupDataGeno[yr], 'patientId'); //yearGroupDataGeno[yr] != undefined?yearGroupDataGeno[yr].length:0;  
            dgeno.push(yjson);
        }
        simjson['data'] = dgeno;
        chartData.push(simjson);
    }
    return { data: chartData, keys: keys, total: serverUtils.getUniqueCount(baseData, 'patientId') }
}


//prapre data for cirrhosis
let prepareCirrhosisDistribution = function(chartData) {
    let data = [];
    let group = [];

    //now group by treatment is done
    for (let type in chartData) {
        group.push(type); //get groupkey value
        let json = {};
        json[type] = serverUtils.getUniqueCount(chartData[type],'patientId');
        data.push(json);
    }
    return { "data": data, "group": group };
}
// Added by jayesh 29th May 2017 for treatment completd and discontinued chart
let prepareTreatmentStatusDistribution = function(chartData) {
    let data = [];
    let group = [];
    //filter patient with medication data 
    chartData = _.filter(chartData, (rec) => {
         return rec.medication != null;
    });

    let patientWithMedicationCount = serverUtils.getUniqueCount(chartData, 'patientId');

    //filter patient treatment completed data 
    chartData = _.filter(chartData, (rec) => {
        return rec.IS_COMPLETED;
    });
    let patientWithCompletedCount = serverUtils.getUniqueCount(chartData, 'patientId');
    let patientWithCompletedCountPerc = parseFloat((patientWithCompletedCount * 100)/ patientWithMedicationCount).toFixed(2);

    let groupedChartData = _.groupBy(chartData, 'IS_COMPLETED');
    //now group by treatment completed and discontinuted  
    for (let type in groupedChartData) {
        let label = type == 'Yes'? 'Treatment Completion':'Treatment Discontinuation';
        group.push(label); //get groupkey value
        let json = {};
        json[label] = serverUtils.getUniqueCount(groupedChartData[type], 'patientId'); //set count
        data.push(json);
    }
    //console.log(data);
    return { 
            "data": data, 
            "group": group , 
            'patientWithMedicationCount': patientWithMedicationCount, 
            'patientWithCompletedCount': patientWithCompletedCount,
            "patientWithCompletedCountPerc": patientWithCompletedCountPerc
        };
}


let prepareDrugGenotype = (medData) => {

    let preparedData = [],
        groups = [];
    // Yuvraj 20th Feb : Added Check to filter by PREACTING_ANTIVIRAL.

    let total = serverUtils.getUniqueCount(medData, 'patientId');
    let genotypeGroups = createGroupbyGenotype(medData);
    for (let genotype in genotypeGroups) {
        let jsonObj = {},
            drugsGroup = _.groupBy(genotypeGroups[genotype], 'medication');
        //total = 0;
        let patientCount = 0;
        for (let drug in drugsGroup) {
            let dcount = serverUtils.getUniqueCount(drugsGroup[drug], 'patientId');
            patientCount += dcount; 
            jsonObj[drug] = dcount;
            groups.push(drug);
        }

        jsonObj['genotype'] = genotype;
        jsonObj['totalPatients'] = patientCount;

        preparedData.push(jsonObj);
    }

    return {
        data: preparedData,
        groups: groups,
        total: total
    };
}

let prepareDrugGenotypechart = (baseData) => {
    let preparedData = [],
        groups = [];
    // Yuvraj 20th Feb : Added Check to filter by PREACTING_ANTIVIRAL.
    let genotypeGroups = createGroupbyGenotype(baseData);
    groups = Object.keys(genotypeGroups);
    let medicationGroupData = _.groupBy(baseData, 'medication');
    for (let med in medicationGroupData) {
        let mjson = {};
        mjson['name'] = med;
        mjson['color'] = serverUtils.settingMedicationColor(med);
        let keyData = medicationGroupData[med];
        let genoGroup = createGroupbyGenotype(keyData);
        let genoData = [];
        for (let genotype of groups) {
            let gjson = {};
            gjson['name'] = med;
            gjson['y'] = serverUtils.getUniqueCount(genoGroup[genotype], 'patientId'); //genoGroup[genotype] == undefined ? 0 : genoGroup[genotype].length;
            genoData.push(gjson);
        }
        //genoData.sort((a, b) => a.name.replace(/\D+/g, '') - b.name.replace(/\D+/g, ''));
        mjson['data'] = genoData;
        preparedData.push(mjson);
    }
    return {
        data: preparedData,
        groups: groups,
        total: serverUtils.getUniqueCount(baseData, 'patientId')
    };
}
let prepareDrugFibrosischart = (baseData) => {
    let preparedData = [],
        groups = [];
    // Yuvraj 20th Feb : Added Check to filter by PREACTING_ANTIVIRAL.
    let fibroGroups = serverUtils.groupDataByFibrosis(baseData);//group data by fibrosure stage

    groups = Object.keys(fibroGroups);
    let medicationGroupData = _.groupBy(baseData, 'medication');
    let chkMedicationFlg = Object.keys(medicationGroupData).length<=1?true:false;
    for (let med in medicationGroupData) {
        let mjson = {};
        mjson['name'] = med;
        mjson['color'] = serverUtils.settingMedicationColor(med);
        let keyData = medicationGroupData[med];
        let stageGroup = serverUtils.groupDataByFibrosis(keyData);
        let genoData = [];
        for (let fiboStage of groups) {
            let gjson = {};
            gjson['name'] = med;
            gjson['y'] = serverUtils.getUniqueCount(stageGroup[fiboStage], 'patientId'); //genoGroup[genotype] == undefined ? 0 : genoGroup[genotype].length;
            if(chkMedicationFlg){
                gjson['color'] = serverUtils.genotypeFixedColors(fiboStage);
            }
            genoData.push(gjson);
        }
        mjson['data'] = genoData;
        preparedData.push(mjson);
    }
    return {
        data: preparedData,
        groups: groups,
        total: serverUtils.getUniqueCount(baseData, 'patientId')
    };
}

function getModifiedData(filtersArray, modifiedData,isClient) {

    let rangeObjectsArray = []; //array for range type filters

    // if filters exists
    if (filtersArray.length > 0) {

        //filter by date if not present
        let chkDate = _.where(filtersArray, { key: 'date' });
        if(chkDate.length<=0){
            let filteredDate = new Date("2013-01-01").getTime();
            modifiedData = modifiedData.filter((rec)=>new Date(rec.admissionDate).getTime() >= filteredDate);
        }
        //push all range type filters in the array
        rangeObjectsArray = _.where(filtersArray, { type: 'range' });

        //push all custom type filters in the array
        customObjectsArray = _.where(filtersArray, { type: 'custom' });
        customObjectsArraySub = _.where(filtersArray, { type: 'customsub' });
        customAgeFilter =_.where(filtersArray, { key: 'age' });
        //if rangeObjectsArray is not empty
        if (rangeObjectsArray.length > 0) {
            //remove the range type filters from the array
            filtersArray = removeObjectsFromArray(filtersArray, rangeObjectsArray, 'type');
        }

        if (customObjectsArray.length > 0) {
            //remove the range type filters from the array
            filtersArray = removeObjectsFromArray(filtersArray, customObjectsArray, 'type');

            modifiedData = filterForCustomObjects(modifiedData, customObjectsArray);
        }

        if (customAgeFilter.length > 0) {
            //remove the range type filters from the array
            filtersArray = removeObjectsFromArray(filtersArray, customAgeFilter, 'key');

            modifiedData = filterForCustomObjectsAge(modifiedData, customAgeFilter,isClient);
        }

        if (customObjectsArraySub.length > 0) {
            //remove the range type filters from the array
            filtersArray = removeObjectsFromArray(filtersArray, customObjectsArraySub, 'type');

            modifiedData = filterForCustomObjectsSub(modifiedData, customObjectsArraySub);
        }
        //filter the base data for the filters
        for (let filter of filtersArray) {
            let filterObj = {};
            filterObj[filter.key] = filter.value;
            modifiedData = _.where(modifiedData, filterObj);
        }

        if (rangeObjectsArray.length > 0) {
            //re-add all the removed range type filters in the array
            filtersArray = addObjectsToArray(filtersArray, rangeObjectsArray);
            //filter the data on range objects
            modifiedData = filterForRangeObjects(modifiedData, rangeObjectsArray);
        }
        
    }

    return modifiedData;

}

let filterForCustomObjectsAge = (dataArray,rangeObjectsArray,isClient) =>{
    let ageObj = _.findWhere(rangeObjectsArray, { identifier: 'age' });

    //filter for the age object
    if (ageObj) {
        if(isClient){
            let ageRange = ageObj.value.split('-'),
            minAge, maxAge = 0;
            minAge = ageRange[0].replace('+', '')
            maxAge = ageRange.length > 1 ? ageRange[1].replace('+', '') : 150;
            dataArray = _.filter(dataArray,(rec)=> rec.age >= ~~minAge && rec.age <= ~~maxAge);
        }
        else{
            dataArray = _.filter(dataArray,(rec)=> rec.age.toString().replace(/\s/g,'') ==  ageObj.value.toString().replace(/\s/g,''));
        }
        
    }
    return dataArray;
}

/*
    function to remove objects from array based on the key
    PARAMETERS
    initialArray: base array from the objects are to be removed
    removeArray: array of objects that are to be removed
    removekey: key name on which the array are to be matched & spliced
*/
function removeObjectsFromArray(initialArray, removeArray, removekey) {
    let defaultArray = _.clone(initialArray);
    for (var i = defaultArray.length - 1; i >= 0; i--) {
        for (var j = 0; j < removeArray.length; j++) {
            if (defaultArray[i] && (defaultArray[i][removekey] === removeArray[j][removekey])) {
                defaultArray.splice(i, 1);
            }
        }
    }
    return defaultArray;
}


/*
    function to add objects to an array
    PARAMETERS
    initialArray: base array from the objects are to be added
    addArray: array of objects that are to be added in the initial array
*/
function addObjectsToArray(initialArray, addArray) {
    let defaultArray = _.clone(initialArray);
    for (let i = 0; i < addArray.length; i++) {
        defaultArray.push(addArray[i]);
    }
    return defaultArray;
}


//filter data based on insurance
let filterForCustomObjects = (dataArray, rangeObjectsArray) => {
    //get the age  filter object
    let insuObj = _.findWhere(rangeObjectsArray, { identifier: 'insurance' });
    if (insuObj) {
        let value = insuObj.value;
        dataArray = _.filter(dataArray, function(rec) {
            return (rec.CLAIMS_INSURANCEPLAN && rec.CLAIMS_INSURANCEPLAN.split('/')[0].toLowerCase().indexOf(value.toLowerCase()) > -1);
        });
    }
    return dataArray;
}

let filterForCustomObjectsSub = (dataArray, rangeObjectsArray) => {
        //get the age  filter object
        let insuObj = _.findWhere(rangeObjectsArray, { identifier: 'insurancetype' });
        if (insuObj) {
            let value = insuObj.value;
            if (value.toLowerCase().indexOf('schip') > -1) {
                dataArray = _.filter(dataArray, function(rec) {
                    return (rec.CLAIMS_INSURANCEPLAN && rec.CLAIMS_INSURANCEPLAN.toLowerCase().indexOf('schip') > -1);
                });
            } else {
                dataArray = _.filter(dataArray, function(rec) {
                    return (rec.CLAIMS_INSURANCEPLAN && rec.CLAIMS_INSURANCEPLAN.toLowerCase() == value.toLowerCase());
                });
            }

        }
        return dataArray;
    }
    /*
        function filter data on the range objects
        PARAMETERS
        dataArray: data array which is to be filtered
        rangeObjectsArray: array of filters objects
    */

function filterForRangeObjects(dataArray, rangeObjectsArray) {

    //get the date filter object
    let dateObj = _.findWhere(rangeObjectsArray, { identifier: 'date' });

    //filter for the fibroValue object
    if (dateObj) {
        let startDate = new Date(dateObj.value.split('~~')[0]),
            endDate = new Date(dateObj.value.split('~~')[1]);

        dataArray = _.filter(dataArray, function(rec) {
            let admitDate = new Date(rec.admissionDate);
            return admitDate >= startDate && admitDate <= endDate;
        });
    }

    //get the age  filter object
    let ageObj = _.findWhere(rangeObjectsArray, { identifier: 'age' });

    //filter for the age object
    if (ageObj) {
        let ageRange = ageObj.value.split('-'),
            minAge, maxAge = 0;
        minAge = ageRange[0].replace('+', '')
        maxAge = ageRange.length > 1 ? ageRange[1].replace('+', '') : 150;

        dataArray = _.filter(dataArray,(rec)=> rec.age >= ~~minAge && rec.age <= ~~maxAge);
    }

    //get the meldscore filter object
    let meldObj = _.findWhere(rangeObjectsArray, { identifier: 'meldscore' });

    //filter for the age object
    if (meldObj) {
        let valueRange = meldObj.value.split('-'),
            minValue, maxValue = 0;
        minValue = valueRange[0].replace('>', '')
        maxValue = valueRange.length > 1 ? valueRange[1].replace('>', '') : 150;

        //console.log(minValue,maxValue);

        dataArray = _.filter(dataArray, function(rec) {
            return rec.labs_meld >= parseFloat(minValue) && rec.labs_meld <= parseFloat(maxValue)
        });
    }

    //get the age fibroValue filter object
    let fibroObj = _.findWhere(rangeObjectsArray, { identifier: 'fibrovalue' });

    //filter for the fibroValue object
    if (fibroObj) {
        let valueRange = fibroObj.value.split('-'),
            minValue, maxValue = 0;
        minValue = valueRange[0].replace('+', '')
        maxValue = valueRange.length > 1 ? valueRange[1].replace('+', '') : 150;

        dataArray = _.filter(dataArray, function(rec) {
            return rec.fibro_Value >= parseFloat(minValue) && rec.fibro_Value <= parseFloat(maxValue)
        });
    }

    

    //get the apri filter object
    let apriObj = _.findWhere(rangeObjectsArray, { identifier: 'apri' });
    if (apriObj) {
        let isGreater = apriObj.value.indexOf('>') > -1 ? true : false;
        dataArray = dataArray.filter((d) => d['APRI'] != null);

        dataArray = _.filter(dataArray, function(rec) {
            let apri = new Date(rec.APRI);
            if (isGreater) {
                return apri >= 1;
            } else {
                return apri < 1;
            }
        });
    }


    //filter based on svr
    //get the meldscore filter object

    let svrObj = _.findWhere(rangeObjectsArray, { identifier: 'svr' });

    //filter for the age object
    if (svrObj) {
        let valueRange = svrObj.value.split('-'),
            minValue, maxValue = 0;
        minValue = parseFloat(valueRange[0].replace('<', '').replace('M', '').replace('+', '')) * 1000000;
        maxValue = parseFloat(valueRange.length > 1 ? valueRange[1].replace('<', '').replace('M', '').replace('+', '') : 150) * 1000000;

        if (valueRange.length == 1) {
            if (minValue <= 200000) {
                dataArray = _.filter(dataArray,(rec)=> rec.viralLoad <= ~~minValue)
            } else {
                dataArray = _.filter(dataArray,(rec)=> rec.viralLoad >= ~~minValue);
            }
        } else {
            dataArray = _.filter(dataArray,(rec)=> rec.viralLoad >= ~~minValue && rec.viralLoad < ~~maxValue);
        }
    }

    return dataArray;
}


let prepareSurvivalRateData = (baseData) => {

    //filter by apri is not null
    let chartData = baseData.filter((d) => d['APRI'] != null);
    //sorting data by dischargeDate
    let resultProductData = _.sortBy(chartData, function(data) {
        return data.dischargeDate;
    });

    // // console.log('meld data');
    let meldscorechartData = [];
    for (let keys in resultProductData) {
        let json = {},
            pData = resultProductData[keys],
            meldScores = [];

        let ddate = new Date(pData.dischargeDate);

        // json['total'] = totalCount;
        json['datevalue'] = ddate.getFullYear() + '-Q' + quarter_of_the_year(ddate);
        // console.log(pData.meldScore);
        json['range'] = getMeldScoreRange(pData.meldScore).range;
        json['probability'] = getMeldScoreRange(pData.meldScore).probability;
        //  console.log(getMeldScoreRange(pData.meldScore).probability);
        if (json['datevalue'] != "NaN-QNaN")
            meldscorechartData.push(json);
    }

    //console.log(meldscorechartData,resultProductData);
    let groupedData = _.groupBy(meldscorechartData, 'datevalue');
    let XnameArray = [];

    for (let keys in groupedData) {
        XnameArray.push(keys);
        //  console.log(keys);
    }
    // console.log(XnameArray);
    let probgroup = ['71.3% Mortality', '52.6% Mortality', '19.6% Mortality', '6.0% Mortality', '1.9% Mortality'];
    let prob = ["71.3", "52.6", "19.6", "6.0", "1.9"];
    let p713 = [];
    let p526 = [];
    let p196 = [];
    let p60 = []
    let p19 = [];
    let ptotals = [];

    p713.push("71.3% Mortality");
    p526.push("52.6% Mortality");
    p196.push("19.6% Mortality");
    p60.push("6.0% Mortality");
    p19.push("1.9% Mortality");

    var sum = 0;
    for (var i = 0; i <= XnameArray.length; i++) {
        //  console.log(XnameArray[i]);
        if (XnameArray[i] != undefined) {
            sum = 0;
            for (var j = 0; j <= prob.length; j++) {
                //  console.log('session mprob' + Session.get('Mprob'));
                if (prob[j] == "71.3") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });
                    p713.push(probcount.length);
                    sum += probcount.length;
                }
                if (prob[j] == "52.6") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });

                    p526.push(probcount.length);
                    sum += probcount.length;
                }
                if (prob[j] == "19.6") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });

                    p196.push(probcount.length);
                    sum += probcount.length;
                }
                if (prob[j] == "6.0") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });

                    p60.push(probcount.length);
                    sum += probcount.length;
                }

                if (prob[j] == "1.9") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });

                    p19.push(probcount.length);
                    sum += probcount.length;
                }
            }
            ptotals.push(sum);
        }
    }

    return {
        dataColumns: [p713, p526, p196, p60, p19],
        probgroup: probgroup,
        XnameArray: XnameArray,
        totalCount: chartData.length,
        ptotals: ptotals

    };

    function getMeldScoreRange(meldScore) {
        let range = 0,
            probability = 0;

        if (meldScore >= 40) {
            range = '>40';
            probability = 71.3;
        } else if (meldScore >= 30 && meldScore <= 39) {
            range = '30-39';
            probability = 52.6;
        } else if (meldScore >= 20 && meldScore <= 29) {
            range = '20-29';
            probability = 19.6;
        } else if (meldScore >= 10 && meldScore <= 19) {
            range = '10-19';
            probability = 6.0;
        } else if (meldScore >= 0 && meldScore <= 9) {
            range = '0-9';
            probability = 1.9;
        } else {
            //console.log('no data');
        }
        return { range: range, probability: probability }
    }

    function quarter_of_the_year(date) {
        var month = date.getMonth() + 1;
        return (Math.ceil(month / 3));
    }

    function getMoratlityRate(mRate) {
        mRate = parseFloat(mRate);
        let value = 71.3;

        if (mRate <= 9)
            value = 1.9;
        if (mRate >= 10 && mRate <= 19)
            value = 6.0;
        if (mRate >= 20 && mRate <= 29)
            value = 19.6;
        if (mRate >= 30 && mRate <= 39)
            value = 52.6;

        return value;
    }
}

//function to convert into upper case first letter
export let toTitleCase = (str) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())




let quarter_of_the_year = (date) => {
    var month = date.getMonth() + 1;
    return (Math.ceil(month / 3));
}


/**
 * Description : Prepare required charts data for retreatment chart on dashbaord
 */
export let prepareRetreatedPatientChartData = (baseData) => {

    let finalData = {};
    baseData = baseData.filter((rec)=>rec.RETREATMENT_CONSIDER && rec.RETREATMENT_CONSIDER.toLowerCase() == 'yes');
    let genGrpData = createGroupbyGenotype(baseData);
    //prepare keys of genotype 
    let keys = _.keys(genGrpData);
    let patientLength = 0;
    let ChartData = [];

    for (let geno in genGrpData) {

        let tempJsonObj = {};
        let count = serverUtils.getUniqueCount(genGrpData[geno], 'patientId');
        tempJsonObj[geno] = count;
        patientLength += count;
        ChartData.push(tempJsonObj);
    }

    let totalPatients = serverUtils.getUniqueCount(baseData, 'patientId');
    finalData.keys = keys;
    finalData.data = ChartData;
    finalData.patientLength = totalPatients;
    finalData.total = totalPatients;
    return finalData;
}


let preparePatientPrescriptionData = (baseData, medBaseData) => {

    //filter data for medication
    let fbaseData = baseData;
    //baseData = serverUtils.getFilteredData(baseData,'medication');
    let chartData = {};
    chartData['genotype'] = null;
    chartData['insurance'] = null;
    chartData['fibrosis'] = null;
    chartData['mapchart'] = null;
    chartData['observedPayerMix'] = null;
    chartData['careFailure'] = null;
    //genotype data 
    let grpGeno = createGroupbyGenotype(medBaseData);
    let total = serverUtils.getUniqueCount(medBaseData, 'patientId');
    let genoData = [];
    //loop through group of genotypes
    for (let key in grpGeno) {
        let json = {};
        json['name'] = key;
        let len = serverUtils.getUniqueCount(grpGeno[key], 'patientId'); //grpGeno[key].length;
        json['y'] = (len / total) * 100;
        json['total'] = len;
        json['color'] = serverUtils.genotypeFixedColors(key);
        if (key && len)
            genoData.push(json);
    }
    genoData.sort((a, b) => a.name.replace(/\D+/g, '') - b.name.replace(/\D+/g, ''));
    chartData['genotype'] = { data: genoData, total: total, key: 'genotype' };

    //insurance plan data 

    let insurancefilteredData = baseData.filter((rec) => rec.InsuranceGrp != 'NA' && rec.InsuranceGrp != 'No Enrollment');
    let grpInsurance = _.groupBy(insurancefilteredData, 'InsuranceGrp');
    //get oberved and estimmated payermix data 
    chartData['observedPayerMix'] = prepareinsuranceObservdMix(insurancefilteredData, grpInsurance);

    let insuranceMedicationFiltered = serverUtils.getFilteredData(insurancefilteredData,'medication');
    grpInsurance = _.groupBy(insuranceMedicationFiltered, 'InsuranceGrp');
    let totalinsu = serverUtils.getUniqueCount(insuranceMedicationFiltered, 'patientId'); //insurancefilteredData.length;
    let insurData = [];
    for (let key in grpInsurance) {
        let json = {};
        json['name'] = key;
        let len = serverUtils.getUniqueCount(grpInsurance[key], 'patientId'); //grpInsurance[key].length;
        json['y'] = (len / totalinsu) * 100;
        json['total'] = len;
        json['color'] = serverUtils.getColorCodeByInsurance(key);
        insurData.push(json);
    }
    insurData.sort(function(a, b) {
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    chartData['insurance'] = { data: insurData, total: totalinsu, key: "insurance" };

    //return data fibrosis
    chartData['fibrosis'] = prepareFibrosureStageData(baseData);
    chartData['fibrosisM'] = prepareFibrosureStageData(medBaseData);
    //map chart 
    let zipgrp = _.groupBy(baseData, 'state_code');
    let mapdata = [];
    let countt = 0;
    for (let key in zipgrp) {
        let json = {};
        json['code'] = key;
        let len = serverUtils.getUniqueCount(zipgrp[key], 'patientId');
        json['value'] = len;
        json['total'] = len;
        //preprare datafor zip code
        json['zipData'] = prepareDataByZipCode(zipgrp[key]);
        countt += len;
        mapdata.push(json);
    }
    chartData['mapchart'] = { data: mapdata, total: countt, key: 'map' };
    //data for cure failure rate chart 

    chartData['care'] = prepareCareFailureChartDataChart(baseData, medBaseData);
    return chartData;
}

let prepareFibrosureStageData  = (baseData) =>{

    let fibrostage = _.groupBy(baseData, function(rec) {
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
    //let fibrostage = _.groupBy(baseData,'FibrosureStage');
    let fibodata = [];
    let totalP = 0;
    for (let key in fibrostage) {
        let json = {};
        json['name'] = key;
        json['y'] = serverUtils.getUniqueCount(fibrostage[key], 'patientId'); //fibrostage[key].length;
        json['total'] = json['y'];
        json['range'] = getRangeForStage(~~key);
        totalP += json['y'];
        fibodata.push(json);
    }
    return  { data: fibodata, total: totalP, key: 'Fibrosis' };
}
let prepareinsuranceObservdMix = (data, grpData) => {
    //data = data.filter((rec)=>rec.InsuranceGrp !='NA');
    //let grpData = _.groupBy(data,'InsuranceGrp');
    let chartdata = [];
    let ygrpYear = _.groupBy(data, 'yearAdmission');
    let yearList = Object.keys(ygrpYear);
    let category = [];
    for (let year in ygrpYear) {
        category.push(year);
    }
    let total = 0;
    for (let key in grpData) {
        let json = {};
        json['name'] = key;
        json['color'] = serverUtils.getColorCodeByInsurance(key.toLocaleLowerCase());
        let ydata = [];
        let keyData = grpData[key];
        let ygrpdata = _.groupBy(keyData, 'yearAdmission');
        for(let yrkey = 0;yrkey<yearList.length;yrkey++){
            let keyy = yearList[yrkey];
            let count = serverUtils.getUniqueCount(ygrpdata[keyy], 'patientId'); //ygrpdata[ykey].length;
            let ytotal = serverUtils.getUniqueCount(ygrpYear[keyy], 'patientId'); //ygrpYear[ykey].length || 0;
            let per = ytotal != 0 ? (count / ytotal) * 100 : 0;
            total += count;
            ydata.push({ "y": per, "count": count, "ytotal": ytotal });
        }
        json['data'] = ydata;
        json['stack'] = "Observed";
        chartdata.push(json);
    }

    return { "category": category, "data": chartdata, "total": total };
}


let prepareCareFailureChartDataChart = (baseData, mbaseData) => {

    let chartdata = {};
    chartdata['svr'] = null;
    chartdata['discontinued'] = null;
    chartdata['follow'] = null;
    //prepare svr12 chart data 
    // let filteredData = baseData.filter((rec) => rec.medication != null);
    chartdata['svr'] = preparesvr12cureFailurechart(mbaseData, 'SVR12', 0);
    chartdata['discontinued'] = preparesvr12cureFailurechart(mbaseData, 'IS_COMPLETED', 'No');
    chartdata['follow'] = preparesvr12cureFailurechart(mbaseData, 'SVR12', null);
    //chartdata['noPrescription'] = preparesvr12cureFailurechart(baseData, 'medication', null);
    chartdata['noPrescription'] = preparesvr12cureFailurechart(baseData, 'NO_PRESCRIPTION', 'Yes');
    return chartdata;
}

let preparesvr12cureFailurechart = (baseData, keyl, param) => {

    let filteredData = baseData.filter((rec) => rec[keyl] == param);
    let grpRace = _.groupBy(filteredData, 'race');

    let totalinsu = serverUtils.getUniqueCount(filteredData, 'patientId'); //_.uniq(_.pluck(filteredData,'patientId')).length;
    let chartdata = [];
    for (let key in grpRace) {
        let json = {};
        json['name'] = key;
        let len = _.uniq(_.pluck(grpRace[key], 'patientId')).length;
        json['y'] = (len / totalinsu) * 100;
        json['total'] = len;
        json['color'] = serverUtils.getRaceCode(key.toUpperCase());
        chartdata.push(json);
    }
    chartdata.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} );
    return { data: chartdata, total: totalinsu, key: keyl };
}



/**
 * @author: Jayesh Agrawal (29th March 2017)
 * @desc: Added code for Medication Market After FDA Approval Dec 2013
 */
let prepareMarketShareOverMonthsChartData = (data) => {
    // Expected Format for chart

    //filter data by medication
    let filterData = serverUtils.getFilteredData(data, 'medication');
    let chartData = {};

    // filter Data of After FDA Approval Dec 2013.

    filterData = _.sortBy(filterData, (rec) => {
        let dt = new Date(rec.start_date);
        return dt;
    });
    chartData.totalPatient = serverUtils.getUniqueCount(filterData, 'patientId'); //filterData.length;
    // format start date into DEC-2013 (MMM-YYYY).
    filterData = _.map(filterData, (rec) => {
        rec.STRT_DATE_FORMATED = moment(new Date(rec.start_date)).format("MMM-YYYY");
        return rec;
    });

    // grouping Data By Start startDate
    let groupedData = _.groupBy(filterData, (rec) => {
        return rec.STRT_DATE_FORMATED;
    });

    let seriesDataArrayObj = [];
    // prepare patient count series
    let patienCountJsonObj = {};
    patienCountJsonObj.name = 'Total Prescription'; // 'Patient Count'
    patienCountJsonObj.type = 'column'; //'column'
    patienCountJsonObj.totalPatientCount = serverUtils.getUniqueCount(filterData, 'patientId'); //filterData.length;
    patienCountJsonObj.yAxis = 1;

    let patienCountDataArray = [];
    for (let key in groupedData) {
        let tempJsonObj = {};
        tempJsonObj.name = key;
        tempJsonObj.y = groupedData[key].length; //serverUtils.getUniqueCount(groupedData[key],'patientId')//groupedData[key].length;
        //tempJsonObj.color = '#e1e5e6';
        let distinctPatientList = _.uniq(groupedData[key], function(rec) { return rec.patientId; });
        tempJsonObj.distinctPatientCount = distinctPatientList.length;
        patienCountDataArray.push(tempJsonObj);
    }
    patienCountJsonObj.data = patienCountDataArray;

    seriesDataArrayObj.push(patienCountJsonObj);

    let seriesCategoryArray = [];
    for (let key in groupedData) {
        seriesCategoryArray.push(key);
    }

    // grouping Data By medication
    let singleMedicationList = [];
    let medicationGroupedData = _.groupBy(filterData, (rec) => {
        return rec.medication;
    });
    for (let key in medicationGroupedData) {
        let tempGroupedData = _.groupBy(medicationGroupedData[key], (rec) => {
            return rec.STRT_DATE_FORMATED;
        });
        seriesDataArrayObj.push(getSeriesFitData(tempGroupedData, { name: key, totalCount: serverUtils.getUniqueCount(medicationGroupedData[key], 'patientId') }, 'line', patienCountDataArray));
        if (key.split('+').length == 1) {
            singleMedicationList.push(key);
        }
    }
    chartData.marketShareOverMonthsChartData = seriesDataArrayObj;
    chartData.seriesCategoryArray = seriesCategoryArray;
    chartData.singleMedicationList = singleMedicationList;
    //chartData.filterData= filterData;
    return chartData;
}

let getSeriesFitData = (groupedData, medication, type, allPatientGroupByMonthData) => {
    let mainJsonObj = {};
    mainJsonObj.name = medication.name; // 'Patient Count'
    mainJsonObj.totalPatientCount = medication.totalCount;
    mainJsonObj.type = type; //'column'
    let tempDataArray = [];

    let patientCount = 0;
    let percentage = 0;
    _.each(allPatientGroupByMonthData, (rec) => {
        patientCount = 0;
        for (let key in groupedData) {
            if (key === rec.name) {
                patientCount = serverUtils.getUniqueCount(groupedData[key], 'patientId') //groupedData[key].length;
            }
        }
        percentage = patientCount == 0 ? 0 : parseFloat(parseFloat((patientCount * 100) / rec.y).toFixed(2));
        let tempJsonObj = {};
        tempJsonObj.name = rec.name;
        tempJsonObj.y = isNaN(percentage) ? 0 : percentage;
        tempJsonObj.patientCount = patientCount;
        tempDataArray.push(tempJsonObj);
    });

    mainJsonObj.data = tempDataArray;
    return mainJsonObj;

}

//Praveen 03/30/2017 To prepare data for cost per rx chart in risk distribution 
let prepareDataforRxCostPrescription = (baseData) => {

        let chartData = {};
        chartData['all'] = null;
        chartData['allTable'] = null;
        chartData['all'] = prepareDataBubblePrescition(baseData);
        //prepare data for all table 
        chartData['allTable'] = prepareDataForTable(baseData);
        //filter data for single medication 

        return chartData;
    }
    //prepare data forbubble chart 
let prepareDataBubblePrescition = (baseData) => {
    let chartData = [];
    //group data by medication 
    let medicationgrpData = _.groupBy(baseData, 'medication');
    let colors = customColorsArray();
    let couln = 0;
    for (let key in medicationgrpData) {
        let json = {};
        //get abbr value for drug name 
        json['name'] = serverUtils.getDrugAbbr(key);
        json['fullName'] = key;
        let datak = medicationgrpData[key];
        let lengthofp = datak.length;
        let cost = 0;
        let total_cost = 0;
        //let take sum of cst using reduce function
        cost = datak.reduce((sum,cost)=>sum+cost["claims_cost"],0);
        json['x'] = lengthofp;
        json['z'] = cost;
        json['patients'] = serverUtils.getUniqueCount(datak,'patientId');
        json['y'] = lengthofp != 0 ? (cost / datak.length) : 0;
        json['color'] = colors[couln];
        couln += 1;
        if (json['y'] && lengthofp) {
            chartData.push(json);
        }
    }
    //reutrn the result 
    return chartData;
}

//Praveen 03/31/2017 prepare data for table in risk distribution section 
//cost per rx,average cost,prescription count for all medications 
let prepareDataForTable = (baseData) => {
    //group data by medication 
    let medicationgrpData = _.groupBy(baseData, 'medication');
    let actual = 0;
    actual = serverUtils.getUniqueCount(baseData,'patientid');
    //loop through all  medication 
    let chartdata = [];
    let total = 0;
    for (let medication in medicationgrpData) {
        let json = {};
        json['name'] = medication;
        let datak = medicationgrpData[medication];
        let lengthofp = datak.length;
        let cost = 0;
        //let take sum of cst using reduce function
        cost = datak.reduce((sum,cost)=>sum+cost["claims_cost"],0);
        json['count'] = lengthofp;
        total += lengthofp;
        json.y = cost;
        json['costperrx'] = lengthofp != 0 ? (cost / datak.length) : 0;
        json['patients'] = serverUtils.getUniqueCount(datak,'patientId');

        if (json['y'] != 0)
            chartdata.push(json);
    }

    return { data: chartdata, total: total,actual:actual };
}

let prepareDataForPrescriptionChart = (baseData) => {

    if(baseData.length<=0){
        return {};
    }
    let totalPrescriptions = 0;
    let dataObj = {};
    dataObj['AllPrescriptions'] = null;
    dataObj['AllIngredient'] = null;

    totalPrescriptions = baseData.length;

    let medicationgrpData = _.groupBy(baseData, 'medication');
    let pchartData = [];
    let pchartDataCost = [];
    let total_cost = 0;
    //let take sum of cst using reduce function
    total_cost = baseData.reduce((sum,cost)=>sum+cost["claims_cost"],0);

    for (let key in medicationgrpData) {
        let json = {};
        let json1 = {};
        json['name'] = key;
        json1['name'] = key;
        let keyData = medicationgrpData[key];
        let len = keyData.length;
        json['y'] = (len / totalPrescriptions) * 100;
        json['PrescriptionCount'] = len;
        json['TotalPrescription'] = totalPrescriptions;
        json['patients'] = serverUtils.getUniqueCount(keyData,'patientId');
        //cost
        let cost = 0;
        cost = keyData.reduce((sum,cost)=>sum+cost["claims_cost"],0);
        json1['y'] = (cost / total_cost) * 100;
        json1['PrescriptionCount'] = len;
        json1['TotalPrescription'] = totalPrescriptions;
        json1['patients'] = serverUtils.getUniqueCount(keyData,'patientId');
        json['PCharge'] = cost;
        json1['PCharge'] = cost;
        json1['AvgPCharge'] = (cost / len);
        if (cost != 0) {
            pchartData.push(json);
            pchartDataCost.push(json1);
        }
    }

    dataObj['AllPrescriptions'] = pchartData;
    dataObj['AllIngredient'] = pchartDataCost;

    return dataObj;

}

//age function for range
let createAgeRangeIfNot = (baseData) => {
    let ageGroups = null;
    if (baseData.length > 0) {
        let age0 = baseData[0].age.toString();
        if (age0.indexOf('-') != -1 || age0.indexOf('+') != -1) {
            ageGroups = _.groupBy(baseData, 'age');
        } else {
            ageGroups = _.groupBy(baseData, function(rec) {
                if (rec.age >= 0 && rec.age <= 22)
                    return '0-22';
                else if (rec.age >= 23 && rec.age <= 32)
                    return '23-32';
                else if (rec.age >= 33 && rec.age <= 42)
                    return '33-42';
                else if (rec.age >= 43 && rec.age <= 52)
                    return '43-52';
                else if (rec.age >= 53 && rec.age <= 62)
                    return '53-62';
                else if (rec.age >= 63 && rec.age <= 72)
                    return '63-72';
                else if (rec.age >= 73 && rec.age <= 82)
                    return '73-82';
                else if (rec.age >= 83)
                    return '83+';
            });
        }
    }
    return sortObject(ageGroups||{});
}


//prepare data by zipcode
let prepareDataByZipCode = (data) => {
    let mapCode = {
        '878': { zipCode: 878, name: 'Socorro', fips: 35053, 'hc-key': 'us-nm-053' },
        '871': { zipCode: 871, name: 'Bernalillo', fips: 35001, 'hc-key': 'us-nm-001' },
        '875': { zipCode: 875, name: 'Santa Fe', fips: 35049, 'hc-key': 'us-nm-049' },
        '870': { zipCode: 870, name: 'Sandoval', fips: 35043, 'hc-key': 'us-nm-043' },
        '883': { zipCode: 883, name: 'Otero', fips: 35035, 'hc-key': 'us-nm-035' },
        '878': { zipCode: 878, name: 'Catron', fips: 35003, 'hc-key': 'us-nm-003' },
        '874': { zipCode: 874, name: 'San Juan', fips: 35045, 'hc-key': 'us-nm-045' },
        '884': { zipCode: 884, name: 'Union', fips: 35059, 'hc-key': 'us-nm-059' },
        '877': { zipCode: 877, name: 'Mora', fips: 35033, 'hc-key': 'us-nm-033' },
        '876': { zipCode: 876, name: 'San Miguel', fips: 35033, 'hc-key': 'us-nm-047' },
        '880': { zipCode: 880, name: 'Luna', fips: 35029, 'hc-key': 'us-nm-029' },
        '881': { zipCode: 881, name: 'Roosevelt', fips: 35041, 'hc-key': 'us-nm-041' },
        '882': { zipCode: 882, name: 'Lea', fips: 35025, 'hc-key': 'us-nm-025' },
        '873': { zipCode: 873, name: 'Mckinley', fips: 35031, 'hc-key': 'us-nm-031' },
        '879': { zipCode: 879, name: 'Sierra', fips: 35051, 'hc-key': 'us-nm-051' },
    };
    if (data) {
        let pat_zipgrp = _.groupBy(data, 'zipcode');
        let chartdata = [];
        for (let zip in pat_zipgrp) {
            //let json = {};
            let cdata = [];
            let code = mapCode['' + zip] != undefined ? mapCode['' + zip]['hc-key'] : "";
            //json['zipcode'] = zip;
            let count = serverUtils.getUniqueCount(pat_zipgrp[zip], 'patientId');; //pat_zipgrp[zip].length;
            cdata = [code, count];
            chartdata.push(cdata);
        }
        return chartdata;
    }
    return null;
}


let getRangeForStage = (stage) =>{
        let stageStore = [{
            stage: 0,
            range: '0-0.21'
        }, {
            stage: 1,
            range: '0.22-0.31'
        }, {
            stage: 2,
            range: '0.32-0.58'
        }, {
            stage: 3,
            range: '0.59-0.73'
        }, {
            stage: 4,
            range: '0.74+'
        }, ];

        let filterStage = _.where(stageStore, {
            stage: stage
        })[0];
        return filterStage ? filterStage.range : '';
}


//Praveen 06/26/2017 
//genotype group by functionalty
let createGroupbyGenotype = (baseData) =>{
    if(baseData.length<=0){
        return {};
    }
    let genotypeGroups = null;
    genotypeGroups = _.groupBy(baseData,(rec)=>{
        let genotypeValue = rec.genotype;
        return genotypeValue || 'Undetected';
    });
    return sortObject(genotypeGroups);
}

let sortObject = (o) =>{
    return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
}


let getHcvIncidentData = (baseData) => {
    if(baseData.length<=0){
        return [];
    }
    let chartData = [];
    let groupedData = _.groupBy(baseData, 'yearAdmission');

    for(let keys in groupedData) {
        let obj = {};

        obj.x = ~~(keys);
        obj.y = serverUtils.getUniqueCount(groupedData[keys], 'patientId');

        chartData.push(obj);
    }
    
    return chartData;

    /*return  chartData = [
        {x:2013 ,y:334 },
        {x:2014 ,y:380 },
        {x:2015 ,y:722 },
        {x:2016 ,y:918 },
        {x:2017 ,y:851 }
    ];*/
}

let getHcvEstimationData = (baseData) => {

    if(baseData.length<=0){
        return {};
    }
    let groupedData = _.groupBy(baseData, 'yearAdmission');
    let categories = [],
        antiHcvData = [], 
        hcvRnaData = [];

    let chartData = {};

    for(let keys in groupedData) {
        let pData = groupedData[keys];

        //filter for medication
        let filteredData = _.filter(pData, (rec) => {
            return rec.medication != null;
        });
        antiHcvData.push({
            y: serverUtils.getUniqueCount(filteredData, 'patientId')
        });

        filteredData = _.filter(pData, (rec) => {
            return rec.viralLoad != null && rec.viralLoad != 'NOT DETECTED';
        });
        hcvRnaData.push({
            y: serverUtils.getUniqueCount(filteredData, 'patientId')
        });

        categories.push(keys);
    }

    //year wise 2013 - 2017
    chartData.series = [{
        name: 'Anti-HCV Therapy',
        data: antiHcvData

    }, {
        name: 'HCV-RNA',
        data: hcvRnaData
    }];

    chartData.categories = categories;
    chartData.stats = {
        hcvRnaPats: _.pluck(hcvRnaData, 'y').sum(),
        antiHcvMeds: _.pluck(antiHcvData, 'y').sum()
    }

    return chartData;
}

let getHCVPrevelenceData = (baseData) => {
    // console.log(baseData);
    if(baseData.length<=0){
        return {};
    }
    let dataObj = {};
    dataObj.Age = {'categories' : getDistribution('age').categories, 'series' : getDistribution('age').series};
    dataObj.Race = {'categories' : getDistribution('race').categories, 'series' : getDistribution('race').series};
    dataObj.Gender ={'categories' : getDistribution('gender').categories, 'series' : getDistribution('gender').series};


    // function getDummyData() {
    //      var chartData1 = [
    //         {x:2013 ,y:334 },
    //         {x:2014 ,y:380 },
    //         {x:2015 ,y:722 },
    //         {x:2016 ,y:918 },
    //         {x:2017 ,y:851 }
    //     ];

    //     var chartData2= [
    //         {x:2013 ,y:10 },
    //         {x:2014 ,y:20 },
    //         {x:2015 ,y:40 },
    //         {x:2016 ,y:50 },
    //         {x:2017 ,y:5 }
    //     ];

    //     return {
    //         line1: chartData1,
    //         line2: chartData2
    //     }
    // }


    function getDistribution(groupKey){
        let series = []
        
        let yearWiseData = _.groupBy(baseData, 'yearAdmission');
        let categories = []
        for(let key in yearWiseData){
            let obj = {};
            obj.name = key;
            obj.data = getCountByKey(yearWiseData[key], groupKey);
            series.push(obj);  

            categories.push(_.pluck(obj.data, 'cat'));
        }
        // console.log(categories);
        categories = _.flatten(categories);
        categories = _.uniq(categories);
        // console.log(categories);
        return {'series' : series, 'categories' : categories};

    }


    function getCountByKey(data, groupKey){
        let ageGroups = groupKey=='age'?createAgeRangeIfNot(data):_.groupBy(data, groupKey);
        let dataArray = [];
        let categories = [];
        for(let key in ageGroups){
            dataArray.push({
                cat : key,
                y : ageGroups[key].length
            });
            categories.push(key)
            // dataArray.push(ageGroups[key].length);
        }
        // return {'categories': categories, 'dataArray' : dataArray};
        return dataArray;
    }


    return dataObj;
}
