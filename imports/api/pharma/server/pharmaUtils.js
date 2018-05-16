/**
 * Description : Prepare required charts data for Comorbidity
 */
import * as serverUtils from '../../common/serverUtils.js';

export let prepareComorbiditiesWithICDChartsData = ({ data }) => {
    let finalData = {};
    //remove extra text from Comorbidity
    data = _.map(data, (item) => { item.Comorbidity = item.Comorbidity.split(',')[0]; return item; });
    let groupedSVRData = _.groupBy(data, 'SVR_Result');
    let genotypeGroupedData = _.countBy(data, 'GENOTYPE');

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
                itemSVR.y = groupedComorbidity[categories[j]].length;

                itemICD.id = categories[j] + drilldown;

                itemICD.name = keys;
                itemICD.type = 'column';
                itemICD.title = categories[j];
                //    itemICD.definition = DIAGNOSIS_DESC
                let tempData = [];
                let tempGroupClinicalCode = _.groupBy(groupedComorbidity[categories[j]], 'BILLG_ICD9_CD');
                for (let tempKey in tempGroupClinicalCode) {
                    if (tempGroupClinicalCode[tempKey].length > 0) {
                        tempData.push({ name: tempKey, y: tempGroupClinicalCode[tempKey].length, 'CodeDesc': tempGroupClinicalCode[tempKey][0].DIAGNOSIS_DESC });
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

    //finalData.patientData = data;
    finalData.comorbidityDrillDownData = DataICD;
    finalData.comorbidityChartData = preparedData.reverse();

    finalData.comorbidityCategories = categories;
    //Data for preparing patients distribution by genotype on comorbidity page
    finalData.genotypeTableData = genotypeGroupedData;
    finalData.TotalN = data.length;
    return finalData;
};

/**
 * Description : Prepare required charts data for retreatment chart on dashbaord
 */
export let prepareRetreatedPatientChartData = (data) => {
    let max_treatment_num = getMaxTreatmentNumber(_.groupBy(data, 'PATIENT_ID_SYNTH'));

    let finalData = {};

    let genGrpData = _.groupBy(data, 'GENOTYPE');
    //prepare keys of genotype
    let keys = _.keys(genGrpData);
    let patientLength = 0;
    let ChartData = [];


    for (let geno in genGrpData) {
        let patientCount = 0;
        // grouping by patient id
        let patientGrpData = _.groupBy(genGrpData[geno], 'PATIENT_ID_SYNTH');
        for (let tnum = max_treatment_num - 1; tnum >= 1; tnum--) {

            for (let patientid in patientGrpData) {
                // prepare cost data for extra treatment
                if (patientGrpData[patientid][tnum]) {
                    patientCount++;
                }
            }
        }
        if (patientCount != 0) {
            let tempJsonObj = {};
            tempJsonObj[geno] = patientCount;
            patientLength += patientCount;
            ChartData.push(tempJsonObj);
        }

    }

    finalData.keys = keys;
    finalData.data = ChartData;
    finalData.patientLength = patientLength;

    return finalData;
}

/**
 * Description : Prepare required charts data for retreatment chart on dashbaord
 */
export let prepareRetreatedPatientChartDataBasedOnFlag = (data) => {

        let finalData = {};

        let genGrpData = _.groupBy(data, 'GENOTYPE');
        //prepare keys of genotype
        let keys = _.keys(genGrpData);
        let patientLength = 0;
        let ChartData = [];

        for (let geno in genGrpData) {

            let tempJsonObj = {};
            tempJsonObj[geno] = genGrpData[geno].length;
            patientLength += genGrpData[geno].length;
            ChartData.push(tempJsonObj);
        }

        finalData.keys = keys;
        finalData.data = ChartData;
        finalData.patientLength = patientLength;

        return finalData;
    }
    /**
     * Description : Prepare required charts data for Therapy Co Occurance
     */
export let prepareTherapyCoOccuranceChartsData = ({ data }) => {
    let finalData = {};
    let chartData = [];
    //Currently this is static but I will put dynamic based on data for Drug selection 'All'
    let medicinelist1 = ["Harvoni", "Olysio", "Sovaldi", "Viekira Pak", "Ribavirin", "Daklinza", "Technivie", "Epclusa", "Zepatier"];

    // let drugListAll = _.groupBy(data, 'MEDICATION');
    //Use count by where ever required
    //// Prepare Data for single Medicine Occurance
    let drugListAll = _.countBy(data, 'MEDICATION');
    let totalSingle = 0;
    for (let key in drugListAll) {
        totalSingle += drugListAll[key];
    }

    for (let key in drugListAll) {
        let json = {};
        json['count'] = drugListAll[key];
        json['drugName'] = key;
        json['percentage'] = parseFloat((json['count'] / totalSingle) * 100).toFixed(2);
        chartData.push(json);
    }

    let chartDataAll = [];

    let groupLabel = Object.keys(drugListAll);

    let grandTotal = 0;
    for (let key in drugListAll) {
        grandTotal += drugListAll[key];
    }

    //// Prepare Data for All Medicine Occurance
    for (let i = 0; i < medicinelist1.length; i++) {
        let json = {};
        json['drugName'] = medicinelist1[i];
        json['total'] = 0;
        for (let key in drugListAll) {
            if (key.toLowerCase().indexOf(medicinelist1[i].toLowerCase()) > -1) {
                json[key] = drugListAll[key];
                json['total'] += drugListAll[key];
                json['percentage'] = parseFloat((json['total'] / grandTotal) * 100).toFixed(2);
            }
        }

        //Praveen 02/20/2017 added check for medication having 0 value
        if (json['total'] != 0) {
            chartDataAll.push(json);
        }

    }
    // Single and Combined drug
    let finalDataSingleCombined = {};
    let singlecombinedgroup = _.countBy(data, 'othermedicine');

    let chartDatasinglecombined = [],
        jsonsinglecombinedgroup = {},
        totalSingleCombined = 0;

    jsonsinglecombinedgroup["Single Drug"] = singlecombinedgroup[0];
    jsonsinglecombinedgroup = ({ name: "Single Drug", y: singlecombinedgroup[0], drilldown: 'Single Drug' });
    chartDatasinglecombined.push(jsonsinglecombinedgroup);
    for (let keys in singlecombinedgroup) {
        if (keys != "0")
            totalSingleCombined = totalSingleCombined + singlecombinedgroup[keys];
    }
    jsonsinglecombinedgroup = ({ name: "Combined Drug", y: totalSingleCombined, drilldown: 'Combined Drug' });

    chartDatasinglecombined.push(jsonsinglecombinedgroup);
    let chartDatasinglecombinedKeys = ["Single Drug", "Combined Drug"];

    // Single Combined Drill Down

    let filterSingleDrug = data.filter(function(obj) {
        return (obj.othermedicine == 0);
    });

    let filterCombinedDrug = data.filter(function(obj) {
        return (obj.othermedicine != 0);
    });

    let jsonsinglecombinedgroupDrilDown = [],
        chartDatasinglecombineddd = [];
    let singlemedicationgroup = _.countBy(filterSingleDrug, 'MEDICATION');
    let jsonsinglecombinedgroupdd = {};

    let js = [];
    for (let keys in singlemedicationgroup) {
        js = [];
        js.push(keys);
        js.push(singlemedicationgroup[keys]);
        chartDatasinglecombineddd.push(js);
    }
    jsonsinglecombinedgroupdd = ({ name: "Single Drug", id: "Single Drug", data: chartDatasinglecombineddd });
    jsonsinglecombinedgroupDrilDown.push(jsonsinglecombinedgroupdd);


    let combinedmedicationgroup = _.countBy(filterCombinedDrug, 'MEDICATION');
    chartDatasinglecombineddd = [];
    for (let keys in combinedmedicationgroup) {
        js = [];
        js.push(keys);
        js.push(combinedmedicationgroup[keys]);
        chartDatasinglecombineddd.push(js);
    }
    jsonsinglecombinedgroupdd = ({ name: "Combined Drug", id: "Combined Drug", data: chartDatasinglecombineddd });
    jsonsinglecombinedgroupDrilDown.push(jsonsinglecombinedgroupdd);

    // Single Combined Drill Down

    // Single and Combined drug

    var chartDataGenotypeWise = _.groupBy(data, 'GENOTYPE');
    var chartDataMedicationWise = _.groupBy(data, 'MEDICATION');
    let FinalchartDataGenotypeWiseData = [];
    let FinalchartDataGenotypeWiseDataTotal = [];
    let Xdata = [];
    let GroupGenotype = [];
    Xdata.push('x');
    for (let keys in chartDataGenotypeWise) {
        Xdata.push(keys);
    }
    FinalchartDataGenotypeWiseData.push(Xdata);
    let jsonGNtotal = {};
    let keysGWt = '';


    for (let keys in chartDataMedicationWise) {
        Xdata = [];
        Xdata.push(keys);
        GroupGenotype.push(keys);

        for (let keysGW in chartDataGenotypeWise) {
            let filtereddata = data.filter(function(obj) {
                return (obj.GENOTYPE == keysGW && obj.MEDICATION == keys);
            });
            Xdata.push(filtereddata.length);
        }

        FinalchartDataGenotypeWiseData.push(Xdata);
    }

    var keysGWtotalt = 0;
    for (let i = 1; i < FinalchartDataGenotypeWiseData[0].length; i++) {
        keysGWtotalt = 0;
        for (let k = 1; k < FinalchartDataGenotypeWiseData.length; k++) {
            keysGWtotalt += parseInt(FinalchartDataGenotypeWiseData[k][i]);
        }
        jsonGNtotal[i] = keysGWtotalt;
    }
    FinalchartDataGenotypeWiseDataTotal.push(jsonGNtotal);
    //Genotype Wise Medication

    var chartDataMedicineStatus = _.groupBy(data, 'MedicineStatus');

    // Cirrhosis Wise Medication

    var jsonSCCirrho = [],
        jsonCirrSCDrilDown = [];
    for (let keys in chartDataMedicineStatus) {
        var chartDatasinglecombineCirrho = {},
            jsCirrhodata = {},
            jsonSCWiseCirrho = [],
            chartDataSCCirr = [],
            jsonSCCirr = {};
        var chartDataCirrhosisWise = _.groupBy(chartDataMedicineStatus[keys], 'CIRRHOSIS');

        for (let keysSCCirr in chartDataCirrhosisWise) {
            js = [];
            js.push(keysSCCirr);
            js.push(chartDataCirrhosisWise[keysSCCirr]);

            chartDatasinglecombineCirrho = ({ name: keysSCCirr, y: chartDataCirrhosisWise[keysSCCirr].length, drilldown: keys + "_" + keysSCCirr });
            jsonSCWiseCirrho.push(chartDatasinglecombineCirrho);

            let CirrhoSCData = _.countBy(chartDataCirrhosisWise[keysSCCirr], 'MEDICATION');
            chartDataSCCirr = []
            for (let keysSCCirrM in CirrhoSCData) {
                js = [];
                js.push(keysSCCirrM);
                js.push(CirrhoSCData[keysSCCirrM]);
                chartDataSCCirr.push(js);
            }

            jsonSCCirr = ({ name: keysSCCirr, id: keys + "_" + keysSCCirr, data: chartDataSCCirr });
            jsonCirrSCDrilDown.push(jsonSCCirr);

        }

        jsCirrhodata = ({ name: keys, data: jsonSCWiseCirrho });
        jsonSCCirrho.push(jsCirrhodata);
    }

    // Cirrhosis Wise Medication

    // Fibrostage Wise Medication

    var jsonSCFibro = [],
        jsonFibroSCDrilDown = [];
    for (let keys in chartDataMedicineStatus) {
        var chartDatasinglecombineFibro = {},
            jsFibrodata = {},
            jsonSCWiseFibro = [],
            chartDataSCCirr = [],
            jsonSCCirr = {}
        var chartDataFirborsureWiseSC = _.groupBy(chartDataMedicineStatus[keys], 'FibrosureStage');

        for (let keysSCFibro in chartDataFirborsureWiseSC) {
            js = [];
            let label_name = keysSCFibro == "null"?'Not Staged':("F" + keysSCFibro);
            js.push(label_name);
            js.push(chartDataFirborsureWiseSC[keysSCFibro]);
            chartDatasinglecombineFibro = ({ name: label_name, y: chartDataFirborsureWiseSC[keysSCFibro].length, drilldown: keys + "_" + label_name });
            jsonSCWiseFibro.push(chartDatasinglecombineFibro);

            let FibroSCData = _.countBy(chartDataFirborsureWiseSC[keysSCFibro], 'MEDICATION');
            chartDataSCCirr = [];
            for (let keysSCFibroM in FibroSCData) {
                js = [];
                js.push(keysSCFibroM);
                js.push(FibroSCData[keysSCFibroM]);
                chartDataSCCirr.push(js);
            }

            jsonSCCirr = ({ name: label_name, id: keys + "_" + label_name, data: chartDataSCCirr });
            jsonFibroSCDrilDown.push(jsonSCCirr);

        }

        jsFibrodata = ({ name: keys, data: jsonSCWiseFibro });
        jsonSCFibro.push(jsFibrodata);
    }

    // Fibrostage Wise Medication

    // Treatment Period Wise Medication
    var jsonSCTreatmentPho = [],
        jsonTreatmentPSCDrilDown = [],
        w = 0;
    for (let keys in chartDataMedicineStatus) {

        var chartDatasinglecombineTreatmentPho = {},
            jsTreatmentPhodata = {},
            jsonSCWiseTreatmentPho = [],
            chartDataSCTreatmentP = [],
            jsonSCTreatmentP = {};
        var chartDataTreatmentPhosisWise = _.groupBy(chartDataMedicineStatus[keys], 'TWEEK');

        for (let keysSCTreatmentP in chartDataTreatmentPhosisWise) {
            w = w + 1;
            js = [];
            js.push(keysSCTreatmentP);
            js.push(chartDataTreatmentPhosisWise[keysSCTreatmentP]);

            chartDatasinglecombineTreatmentPho = ({ name: keysSCTreatmentP, y: chartDataTreatmentPhosisWise[keysSCTreatmentP].length, drilldown: keys + "_" + w });
            jsonSCWiseTreatmentPho.push(chartDatasinglecombineTreatmentPho);

            let TreatmentPhoSCData = _.countBy(chartDataTreatmentPhosisWise[keysSCTreatmentP], 'MEDICATION');
            chartDataSCTreatmentP = []
            for (let keysSCTreatmentPM in TreatmentPhoSCData) {
                js = [];
                js.push(keysSCTreatmentPM);
                js.push(TreatmentPhoSCData[keysSCTreatmentPM]);
                chartDataSCTreatmentP.push(js);
            }

            jsonSCTreatmentP = ({ name: keysSCTreatmentP, id: keys + "_" + w, data: chartDataSCTreatmentP });
            jsonTreatmentPSCDrilDown.push(jsonSCTreatmentP);
        }
        jsTreatmentPhodata = ({ name: keys, data: jsonSCWiseTreatmentPho });
        jsonSCTreatmentPho.push(jsTreatmentPhodata);
    }
    //  Treatment Period Wise Medication

    //  Medication Wise Distribution
    var medicationdata = data.filter(function(obj) {
        return (obj.isCured == 0);
    });

    chartDataMedicineStatus = _.groupBy(medicationdata, 'MedicineStatus');
    medicationdata = medicationdata.filter(function(obj) {
        return (obj.othermedicine == 0);
    });

    drugListAll = _.countBy(medicationdata, 'MEDICATION');

    medicinelist1 = [];
    for (var k in drugListAll) {
        medicinelist1.push(k);
    }

    var jsonSCMedicationPho = [],
        jsonMedicationPSCDrilDown = [];
    for (let keys in chartDataMedicineStatus) {
        var chartDatasinglecombineMedicationPho = {},
            jsMedicationPhodata = {},
            jsonSCWiseMedicationPho = [],
            chartDataSCMedicationP = [],
            jsonSCMedicationP = {};

        for (let i = 0; i < medicinelist1.length; i++) {

            var filtereddata = chartDataMedicineStatus[keys].filter(function(obj) {
                return (obj.MEDICATION.toLowerCase().indexOf(medicinelist1[i].toLowerCase()) > -1 || obj.MEDICATION.toLowerCase() == medicinelist1[i].toLowerCase());
            });

            js = [];
            js.push(medicinelist1[i]);
            js.push(filtereddata.length);

            chartDatasinglecombineMedicationPho = ({ name: medicinelist1[i], y: filtereddata.length, drilldown: keys + "_" + medicinelist1[i] });
            jsonSCWiseMedicationPho.push(chartDatasinglecombineMedicationPho);

            let MedicationPhoSCData = _.countBy(filtereddata, 'MEDICATION');
            chartDataSCMedicationP = []
            for (let keysSCMedicationPM in MedicationPhoSCData) {
                js = [];
                js.push(keysSCMedicationPM);
                js.push(MedicationPhoSCData[keysSCMedicationPM]);
                chartDataSCMedicationP.push(js);
            }

            jsonSCMedicationP = ({ name: medicinelist1[i], id: keys + "_" + medicinelist1[i], data: chartDataSCMedicationP });
            jsonMedicationPSCDrilDown.push(jsonSCMedicationP);

        }

        jsMedicationPhodata = ({ name: keys, data: jsonSCWiseMedicationPho });
        jsonSCMedicationPho.push(jsMedicationPhodata);
    }
    //  Medication Wise Distribution

    finalData.singleMedicineOccuranceData = chartData;
    finalData.AllMedicineOccuranceData = chartDataAll;
    finalData.TotalN = data.length;
    finalData.groupLabel = groupLabel;
    finalData.SingleCombineDrug = chartDatasinglecombined;
    finalData.GenotypeWiseSingleCombined = FinalchartDataGenotypeWiseData;

    // Cirrhosis Wise Medication
    finalData.CirrhosisWiseSingleCombined = jsonSCCirrho;
    finalData.CirrhosisWiseSingleCombinedDrillDown = jsonCirrSCDrilDown;

    // Fibrostage Wise Medication
    finalData.FibrostageWiseSingleCombined = jsonSCFibro;
    finalData.FibrostageWiseSingleCombinedDrillDown = jsonFibroSCDrilDown;

    //  Treatment Period Wise Medication
    finalData.TreatmentWiseSingleCombined = jsonSCTreatmentPho;
    finalData.TreatmentWiseSingleCombinedDrillDown = jsonTreatmentPSCDrilDown;

    //  Medication Wise Distribution
    finalData.MedicationWiseSingleCombined = jsonSCMedicationPho;
    finalData.MedicationWiseSingleCombinedDrillDown = jsonMedicationPSCDrilDown;

    finalData.GenotypeWiseSingleCombinedTotal = FinalchartDataGenotypeWiseDataTotal;
    finalData.jsonsinglecombinedgroupDrilDown = jsonsinglecombinedgroupDrilDown;
    finalData.GroupGenotypeData = GroupGenotype;
    return finalData;
};


export let prepareCompetitorAnalysisYearlyChartData = ({ data, filteredMedicine }) => {
    let finalData = {};
    let yearlyCompetiterData = {};
    let filtereddata = data;
    //console.log(filteredMedicine);

    let total = data.length;

    if (filteredMedicine && filteredMedicine.length > 0) {
        filtereddata = _.filter(filtereddata, function(e) {
            for (var i = 0; i < filteredMedicine.length; i++) {
                if (e.MEDS_NM.toLowerCase() == filteredMedicine[i].toLowerCase()) { return e; }
            }
        })
    }

    let groupedDatayear = _.groupBy(filtereddata, 'FILL_YEAR');
    let groupedDataAllyear = _.groupBy(data, 'FILL_YEAR');
    let xvalues = [];
    let preparedData = [],
        groups = [];


    for (let keys in groupedDatayear) {
        let jsonObj = {},
            drugsGroup = _.groupBy(groupedDatayear[keys], 'MEDS_NM'),
            totalt = 0;
        //get the total for year
        for (let keysAll in groupedDataAllyear) {
            total = groupedDataAllyear[keys].length;
        }

        for (let drug in drugsGroup) {
            totalt += drugsGroup[drug].length;
            jsonObj[drug] = parseFloat((drugsGroup[drug].length / total) * 100).toFixed(2);
            jsonObj[drug + '-' + keys] = drugsGroup[drug].length;

            groups.push(drug);
        }

        jsonObj['year'] = keys;
        jsonObj['totalPatients'] = totalt;

        preparedData.push(jsonObj);
    }

    finalData.TotalN = data.length;
    finalData.yearlyCompetiterData = preparedData;
    //// rawData Currently it is grouped by BRAND_NAME but it can be by Risk or by age or by Other factor for comparision
    //  finalData.rawData=_.groupBy(data,'MEDS_NM');

    //finalData.yearlyCompare=_.groupBy(data,'BRAND_NAME');
    // Prepare drugs group for stacked grouped chart
    finalData.groupLabel = groups;
    //console.log(groups);
    return finalData;
};



let prepareAvgMedianMinMaxStandardDeviationCost = (costData) => {
    let calculatedCostData = {}
    calculatedCostData.len = 0,
        calculatedCostData.costSumValue = 0,
        calculatedCostData.meanCostValue = 0,
        calculatedCostData.medianCostValue = 0,
        calculatedCostData.minCostValue = 0,
        calculatedCostData.maxCostValue = 0,
        calculatedCostData.stdDevValue = 0;
    if (costData.length > 0) {
        //count of patient
        calculatedCostData.len = costData.length;
        costData = _.sortBy(costData, (item) => { return item });
        calculatedCostData.costSumValue = _.reduce(costData, function(a, b) { return a + b; }, 0);
        // calculating average cost
        calculatedCostData.meanCostValue = calculatedCostData.costSumValue / calculatedCostData.len;
        // removing zero cost
        let costDataWithoutZero = _.reject(costData, function(item) { return item == 0; })
        if (costDataWithoutZero.length > 0) {
            //calculating min cost
            calculatedCostData.minCostValue = _.min(costDataWithoutZero);
            //calculating standard deviation cost
            let baseCorelationData = 0;
            _.map(costDataWithoutZero, (item) => { baseCorelationData += Math.pow((item - calculatedCostData.meanCostValue), 2) })
            calculatedCostData.stdDevValue = Math.sqrt(baseCorelationData / calculatedCostData.len);
        }
        //calculating max cost
        calculatedCostData.maxCostValue = _.max(costData);
        //calculating median cost
        if (calculatedCostData.len % 2 == 0) {
            let index = (calculatedCostData.len) / 2;
            calculatedCostData.medianCostValue = (costData[index - 1] + costData[index]) / 2;
        } else {
            let index = (calculatedCostData.len + 1) / 2;
            calculatedCostData.medianCostValue = costData[index - 1];
        }
    }
    return calculatedCostData;
}

export let prepareMedicationCostCalculatedChartsData = (pharmadata1) => {
        let medicationCostChartsData = {}


        let max_treatment_num = getMaxTreatmentNumber(_.groupBy(pharmadata1, 'PATIENT_ID_SYNTH'));
        //  let avgCostDataGeno = _.groupBy(pharmadata1, 'GENOTYPE');

        //Treatment period charts data
        let treatment_categories = [];
        for (let tnum = 0; tnum < max_treatment_num; tnum++) {
            treatment_categories.push(tnum + 1);
        }

        //Avg cost treatment chart data
        let genGrpData = _.groupBy(pharmadata1, 'GENOTYPE');
        let avgCostChartData = [],
            medianCostChartData = [],
            minCostChartData = [],
            maxCostChartData = [],
            stdDevCostChartData = [];
        //prepare data by each genotype
        for (let geno in genGrpData) {
            let avgjson = {},
                medianjson = {},
                minjson = {},
                maxjson = {},
                stdDevjson = {};
            let genotypelabel = 'Genotype:' + geno;
            avgjson.name = genotypelabel;
            medianjson.name = genotypelabel;
            minjson.name = genotypelabel;
            maxjson.name = genotypelabel;
            stdDevjson.name = genotypelabel;

            let avgtretArrayData = [],
                mediantretArrayData = [],
                mintretArrayData = [],
                maxtretArrayData = [],
                stdDevtretArrayData = [];
            // grouping by patient id
            let patientGrpData = _.groupBy(genGrpData[geno], 'PATIENT_ID_SYNTH');
            //prepare data by each treatment
            for (let tnum = max_treatment_num - 1; tnum >= 0; tnum--) {

                let costData = [];
                for (let patientid in patientGrpData) {

                    if (patientGrpData[patientid][tnum] != void 0) {
                        // prepare cost data for single treatment
                        costData.push(parseFloat(patientGrpData[patientid][tnum]['PAID']));
                    }
                }
                let preparedCostData = prepareAvgMedianMinMaxStandardDeviationCost(costData);
                avgtretArrayData.push({ y: Math.round(preparedCostData.meanCostValue), patientCount: preparedCostData.len });
                mediantretArrayData.push({ y: Math.round(preparedCostData.medianCostValue), patientCount: preparedCostData.len });
                mintretArrayData.push({ y: Math.round(preparedCostData.minCostValue), patientCount: preparedCostData.len });
                maxtretArrayData.push({ y: Math.round(preparedCostData.maxCostValue), patientCount: preparedCostData.len });
                stdDevtretArrayData.push({ y: Math.round(preparedCostData.stdDevValue), patientCount: preparedCostData.len });
            }

            avgjson.data = avgtretArrayData;
            medianjson.data = mediantretArrayData;
            minjson.data = mintretArrayData;
            maxjson.data = maxtretArrayData;
            stdDevjson.data = stdDevtretArrayData;

            avgCostChartData.push(avgjson);
            medianCostChartData.push(medianjson);
            minCostChartData.push(minjson);
            maxCostChartData.push(maxjson);
            stdDevCostChartData.push(stdDevjson);
        }
        //medicationCostChartsData.pharmadata1=pharmadata1;
        medicationCostChartsData.avgCostChartData = avgCostChartData;
        medicationCostChartsData.medianCostChartData = medianCostChartData;
        medicationCostChartsData.minCostChartData = minCostChartData;
        medicationCostChartsData.maxCostChartData = maxCostChartData;
        medicationCostChartsData.stdDevCostChartData = stdDevCostChartData;
        medicationCostChartsData.treatment_categories = treatment_categories.sort((a, b) => b - a);

        // console.log(stdDevCostChartData);

        //calculate data for cumulative cost chart
        let AvgCumulativeData = [],
            MedianCumulativeData = [],
            MinCumulativeData = [],
            MaxCumulativeData = [],
            StdDevCumulativeData = [];
        let patientGrpData = _.groupBy(pharmadata1, 'PATIENT_ID_SYNTH');
        for (let i = 0; i < max_treatment_num; i++) {
            let Avgjson = {},
                Medianjson = {},
                Minjson = {},
                Maxjson = {},
                StdDevjson = {};

            Avgjson.treatment = i + 1;
            Medianjson.treatment = i + 1;
            Minjson.treatment = i + 1;
            Maxjson.treatment = i + 1;
            StdDevjson.treatment = i + 1;

            let costData = [];

            for (let patientid in patientGrpData) {
                for (let j = 0; j <= i && j < patientGrpData[patientid].length; j++) {
                    if (patientGrpData[patientid][j] != void 0) {
                        costData.push(parseFloat(patientGrpData[patientid][j]['PAID'] != '' ? patientGrpData[patientid][j]['PAID'] : 0));
                    }
                }
            }

            let preparedCostData = prepareAvgMedianMinMaxStandardDeviationCost(costData);

            Avgjson.AVG_CUM_COST = preparedCostData.meanCostValue;
            Medianjson.AVG_CUM_COST = preparedCostData.medianCostValue;
            Minjson.AVG_CUM_COST = preparedCostData.minCostValue;
            Maxjson.AVG_CUM_COST = preparedCostData.maxCostValue;
            StdDevjson.AVG_CUM_COST = preparedCostData.stdDevValue;

            Avgjson.total = preparedCostData.len;
            Medianjson.total = preparedCostData.len;
            Minjson.total = preparedCostData.len;
            Maxjson.total = preparedCostData.len;
            StdDevjson.total = preparedCostData.len;

            AvgCumulativeData.push(Avgjson);
            MedianCumulativeData.push(Medianjson);
            MinCumulativeData.push(Minjson);
            MaxCumulativeData.push(Maxjson);
            StdDevCumulativeData.push(StdDevjson);

        }

        medicationCostChartsData.AvgCumulativeChartData = AvgCumulativeData;
        medicationCostChartsData.MedianCumulativeChartData = MedianCumulativeData;
        medicationCostChartsData.MinCumulativeChartData = MinCumulativeData;
        medicationCostChartsData.MaxCumulativeChartData = MaxCumulativeData;
        medicationCostChartsData.StdDevCumulativeChartData = StdDevCumulativeData;

        return medicationCostChartsData;

    }
    /**
     * Nisha
     * 02/14/2017
     * Description : Prepare required charts data for Liver Transplant average cost before and after treatment.
     * 02/16/17 : modified the logid for Drill down.
     */
export let prepareLiverTransplantData = (data, genotypes) => {

    /**
     * @author: Pramveer
     * @date: 1st Mar 17
     * @desc: Implemented the average cost on the data & Implemented json structure for drilldwon dataset.
     */

    let finalObj = {};
    // Grouped by "Before" / "After"
    var chartDataMedicineStatus = _.groupBy(data, 'Occurance');

    var jsonSCTreatmentPho = [],
        jsonTreatmentPSCDrilDown = [];
    let js = [];
    for (let keys in chartDataMedicineStatus) {

        var chartDatasinglecombineTreatmentPho = {},
            jsTreatmentPhodata = {},
            jsonSCWiseTreatmentPho = [],
            chartDataSCTreatmentP = [],
            jsonSCTreatmentP = {};
        // Grouped by Genotype
        var chartDataTreatmentPhosisWise = _.groupBy(chartDataMedicineStatus[keys], 'GENOTYPE');
        var sumavgpatientcharges = 0;
        var sumavgpatientchargescost_cd = 0;
        for (let keysSCTreatmentP in chartDataTreatmentPhosisWise) {

            for (i = 0; i < chartDataTreatmentPhosisWise[keysSCTreatmentP].length; i++) {
                // Sum for Genotypes
                sumavgpatientcharges = sumavgpatientcharges + chartDataTreatmentPhosisWise[keysSCTreatmentP][i].CHARGE;
            }
            // Average cost
            // sumavgpatientcharges = sumavgpatientcharges / _.uniq(_.pluck(chartDataTreatmentPhosisWise[keysSCTreatmentP], 'PATIENT_ID_SYNTH')).length;
            let categoryPatients = _.uniq(_.pluck(chartDataTreatmentPhosisWise[keysSCTreatmentP], 'PATIENT_ID_SYNTH'));
            let avgCostForCategory = sumavgpatientcharges / categoryPatients.length;
            chartDatasinglecombineTreatmentPho = ({ name: keysSCTreatmentP, y: sumavgpatientcharges, drilldown: keys + "_" + keysSCTreatmentP, avgCost: avgCostForCategory, total: categoryPatients.length });
            jsonSCWiseTreatmentPho.push(chartDatasinglecombineTreatmentPho);
            // Grouped by Cost Codes
            let TreatmentPhoSCData = _.groupBy(chartDataTreatmentPhosisWise[keysSCTreatmentP], 'COST_CD');

            chartDataSCTreatmentP = [];
            for (let keysSCTreatmentPM in TreatmentPhoSCData) {
                sumavgpatientchargescost_cd = 0
                js = [];
                let json = {};

                for (i = 0; i < TreatmentPhoSCData[keysSCTreatmentPM].length; i++) {
                    // Sum for Cost codes
                    sumavgpatientchargescost_cd = sumavgpatientchargescost_cd + TreatmentPhoSCData[keysSCTreatmentPM][i].CHARGE;
                }
                // Average cost
                // sumavgpatientchargescost_cd = sumavgpatientchargescost_cd / _.uniq(_.pluck(TreatmentPhoSCData[keysSCTreatmentPM], 'PATIENT_ID_SYNTH')).length;

                let codepatients = _.uniq(_.pluck(TreatmentPhoSCData[keysSCTreatmentPM], 'PATIENT_ID_SYNTH'));
                let avgCostForCodes = sumavgpatientchargescost_cd / codepatients.length;

                // js.push(keysSCTreatmentPM);
                // js.push(sumavgpatientchargescost_cd);
                // js.push(avgCostForCodes);
                //chartDataSCTreatmentP.push(js);

                json.name = keysSCTreatmentPM;
                json.y = sumavgpatientchargescost_cd;
                json.avgCost = avgCostForCodes;
                json.total = codepatients.length;

                chartDataSCTreatmentP.push(json);
            }

            jsonSCTreatmentP = ({ name: keysSCTreatmentP, id: keys + "_" + keysSCTreatmentP, data: chartDataSCTreatmentP });
            jsonTreatmentPSCDrilDown.push(jsonSCTreatmentP);
        }
        //console.log(sumavgpatientcharges);
        jsTreatmentPhodata = ({ name: keys, data: jsonSCWiseTreatmentPho });
        jsonSCTreatmentPho.push(jsTreatmentPhodata);
    }


    finalObj.jsonTreatmentPSCDrilDownt = jsonTreatmentPSCDrilDown;
    finalObj.jsonSCTreatmentPhot = jsonSCTreatmentPho;
    // finalObj.fullData = data;
    return finalObj;
}

/**
 * Nisha
 * 02/27/2017
 * Description : Applied logic for Drill down for prescription duration.
 */
export let preparePrescriptionDurationData = (data) => {
        let cntByMedication = _.countBy(data, 'MEDICATION');
        var Data = [];
        for (var keys in cntByMedication) {
            let jsonpi = [];
            jsonpi.push(keys);
            jsonpi.push(cntByMedication[keys]);
            Data.push(jsonpi);
        }
        return Data;
    }
    /**
     * Description : Prepare required charts data for retreatment chart with drilldown no of treatment, medicaiton, treatment period
     */
export let prepareRetreatmentDistributionWithMedication = (data) => {

    let max_treatment_num = getMaxTreatmentNumber(_.groupBy(data, 'PATIENT_ID_SYNTH'));

    let finalData = [];
    let finalTreatmentChartData = [];
    let finalObj = {};
    let genGrpData = _.groupBy(data, 'GENOTYPE');

    let finalMedicationChartData = [];
    let finalTreatment_periodChartData = [];
    let ChartData = [];

    for (let geno in genGrpData) {
        let patientCount = 0;
        let treatmentChartData = [];
        let medicationChartData = [];
        let treatment_periodChartData = [];
        let preparePatientData = [];
        // grouping by patient id
        let patientGrpData = _.groupBy(genGrpData[geno], 'PATIENT_ID_SYNTH');
        for (let tnum = max_treatment_num - 1; tnum >= 1; tnum--) {
            let retreatedPatientCount = 0;
            for (let patientid in patientGrpData) {
                // prepare cost data for extra treatment
                if (patientGrpData[patientid][tnum]) {
                    retreatedPatientCount++;
                    patientCount++;
                    preparePatientData.push(patientGrpData[patientid][tnum])
                }
            }
            if (retreatedPatientCount > 0) {
                //prepare data for no of treatment
                treatmentChartData.push({ name: tnum + 1, y: retreatedPatientCount });
            }
        }
        //prepare data for no of treatment by genotyoe
        finalTreatmentChartData.push({ name: geno, data: treatmentChartData, startAngle: 90 });
        if (patientCount != 0) {
            ChartData.push({ name: geno, y: patientCount });
        }
        //prepare data for medication distribution of retreatment patient.
        let medicationGrouped = _.groupBy(preparePatientData, 'MEDICATION');
        for (let medication in medicationGrouped) {
            if (medicationGrouped[medication].length > 0) {
                medicationChartData.push({ name: medication, y: medicationGrouped[medication].length });
            }
        }
        finalMedicationChartData.push({ name: geno, data: medicationChartData, startAngle: 90 });
        //prepare data for treatment period distribution of retreatment patient.
        let treatment_periodGrouped = _.groupBy(preparePatientData, 'TREATMENT_PERIOD');
        for (let period in treatment_periodGrouped) {
            if (treatment_periodGrouped[period].length > 0) {
                treatment_periodChartData.push({ name: period, y: treatment_periodGrouped[period].length });
            }
        }
        finalTreatment_periodChartData.push({ name: geno, data: treatment_periodChartData, startAngle: 90 });
    }
    finalData.push({ name: 'Patient Count', data: ChartData })
    finalObj.retreatedByGenotype = finalData;
    finalObj.noOfTreatmentByGenotypeChartData = finalTreatmentChartData;
    finalObj.medicationByGenotypeChartData = finalMedicationChartData;
    finalObj.treatmentPeriodChartData = finalTreatment_periodChartData;
    // finalObj.preparePatientData =preparePatientData;

    return finalObj;

}

//get maximum treatment number for medication cost
let getMaxTreatmentNumber = (patientGrpData) => {
    let maximum_treatment_num = 0;
    for (let patientid in patientGrpData) {
        if (patientGrpData[patientid].length > maximum_treatment_num) {
            maximum_treatment_num = patientGrpData[patientid].length;
        }
    }
    return maximum_treatment_num;
}


export let preparePatientPrescriptionData = (baseData) => {
    //let fixedDatestart = new Date("2013-09-01");//october 2016
    //let fixedDateend = new Date("2016-08-01");//september 2016
    //baseData = baseData.filter((rec)=>rec.start_date>=fixedDatestart && rec.start_date<=fixedDateend);

    let chartData = {};
    chartData['genotype'] = null;
    chartData['insurance'] = null;
    chartData['fibrosis'] = null;
    chartData['mapchart'] = null;
    chartData['observedPayerMix'] = null;
    chartData['careFailure'] = null;
    //genotype data 
    let grpGeno = _.groupBy(baseData, 'genotype');
    let total = baseData.length;
    let genoData = [];
    for (let key in grpGeno) {
        let json = {};
        json['name'] = key;
        let len = grpGeno[key].length;
        json['y'] = (len / total) * 100;
        json['total'] = len;
        genoData.push(json);
    }
    genoData.sort((a, b) => a.name.replace(/\D+/g, '') - b.name.replace(/\D+/g, ''));
    chartData['genotype'] = { data: genoData, total: total, key: 'genotype' };

    //insurance plan data 

    let insurancefilteredData = baseData.filter((rec) => rec.InsuranceGrp != 'NA' && rec.InsuranceGrp != 'No Enrollment');
    let grpInsurance = _.groupBy(insurancefilteredData, 'InsuranceGrp');
    //get oberved and estimmated payermix data 
    chartData['observedPayerMix'] = prepareinsuranceObservdMix(insurancefilteredData, grpInsurance);

    let totalinsu = insurancefilteredData.length;
    let insurData = [];
    for (let key in grpInsurance) {
        let json = {};
        json['name'] = key;
        let len = grpInsurance[key].length;
        json['y'] = (len / totalinsu) * 100;
        json['total'] = len;
        insurData.push(json);
    }
    chartData['insurance'] = { data: insurData, total: totalinsu, key: "insurance" };

    //return data fibrosis 
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
        json['y'] = fibrostage[key].length;
        json['total'] = json['y'];
        totalP += json['y'];
        fibodata.push(json);
    }
    chartData['fibrosis'] = { data: fibodata, total: totalP, key: 'Fibrosis' };

    //map chart 
    let zipgrp = _.groupBy(baseData, 'state_code');
    let mapdata = [];
    let countt = 0;
    for (let key in zipgrp) {
        let json = {};
        json['code'] = key;
        let len = zipgrp[key].length;
        json['value'] = len;
        json['total'] = len;
        countt += len;
        mapdata.push(json);
    }
    chartData['mapchart'] = { data: mapdata, total: countt, key: 'map' };
    //data for cure failure rate chart 
    chartData['care'] = prepareCareFailureChartDataChart(baseData);
    return chartData;
}


//get key value for grouped data
export let getKeyValueForData = (groupedData, keyword) => {
    let finalData = {};

    for (let keys in groupedData) {
        if (keys && keys != '' && keys != undefined) {
            let keyData = groupedData[keys],
                jsonData = {};
            let lbl = keyword == 'SVR' ? keys : toTitleCase(keys);
            jsonData['count'] = keyData.length;
            jsonData[keyword] = lbl;

            finalData[lbl] = jsonData;
        }

    }

    return finalData;
}

//function to convert into upper case first letter
let toTitleCase = (str) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())

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
        // for (let ykey in ygrpdata) {
        //     let count = serverUtils.getUniqueCount(ygrpdata[ykey], 'patientId'); //ygrpdata[ykey].length;
        //     let ytotal = serverUtils.getUniqueCount(ygrpYear[ykey], 'patientId'); //ygrpYear[ykey].length || 0;
        //     let per = ytotal != 0 ? (count / ytotal) * 100 : 0;
        //     total += count;
        //     ydata.push({ "y": per, "count": count, "ytotal": ytotal });
        // }
        json['data'] = ydata;
        json['stack'] = "Observed";
        chartdata.push(json);
    }

    return { "category": category, "data": chartdata, "total": total };
}



let prepareCareFailureChartDataChart = (baseData) => {

    let chartdata = {};
    chartdata['svr'] = null;
    chartdata['discontinued'] = null;
    chartdata['follow'] = null;
    //prepare svr12 chart data 
    chartdata['svr'] = preparesvr12cureFailurechart(baseData, 'SVR12', 0);
    chartdata['discontinued'] = preparesvr12cureFailurechart(baseData, 'IS_COMPLETED', 'No');
    chartdata['follow'] = preparesvr12cureFailurechart(baseData, 'SVR12', null);
    chartdata['noPrescription'] = preparesvr12cureFailurechart(baseData, 'medication', null);
    return chartdata;
}


let preparesvr12cureFailurechart = (baseData, keyl, param) => {
    let filteredData = baseData.filter((rec) => rec[keyl] == param);
    let grpRace = _.groupBy(filteredData, 'race');

    let totalinsu = filteredData.length;
    let chartdata = [];
    for (let key in grpRace) {
        let json = {};
        json['name'] = key;
        let len = grpRace[key].length;
        json['y'] = (len / totalinsu) * 100;
        json['total'] = len;
        chartdata.push(json);
    }
    return { data: chartdata, total: totalinsu, key: keyl };
}

export let prepareMarketShareOverMonthsChartData = (data) => {

    let chartData = {};

    // filter Data of After FDA Approval Dec 2013.
    let filterData = _.filter(data, (rec) => {
        let startDate = moment(new Date(rec.start_date));
        return startDate.isAfter(new Date('12-01-2013')) && rec.medication && rec.IS_PREACTING_ANTIVIRAL == 'NO';
    });
    filterData = _.sortBy(filterData, (rec) => {
        let dt = new Date(rec.start_date);
        return dt;
    });
    chartData.totalPatient = filterData.length;
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
    patienCountJsonObj.totalPatientCount = filterData.length;
    patienCountJsonObj.yAxis = 1;

    let patienCountDataArray = [];
    for (let key in groupedData) {
        let tempJsonObj = {};
        tempJsonObj.name = key;
        tempJsonObj.y = groupedData[key].length;
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
        seriesDataArrayObj.push(getSeriesFitData(tempGroupedData, { name: key, totalCount: medicationGroupedData[key].length }, 'line', patienCountDataArray));
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
                patientCount = groupedData[key].length;
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


export let prepareDataForPrescriptionChart = (data) => {
    var totalPrescriptions = 0;
    var seriesdata = [];
    var chartData = {};
    var dataObj = {};
    for (i = 0; i < data.length; i++) {
        // console.log(temp1[i].PrescriptionCount);
        totalPrescriptions = totalPrescriptions + data[i].PrescriptionCount;
    }
    // console.log(totalPrescriptions);
    for (i = 0; i < data.length; i++) {
        data[i].PrescriptionCountPercent = (data[i].PrescriptionCount / totalPrescriptions) * 100;
    }

    for (i = 0; i < data.length; i++) {

        chartData = ({ name: data[i].MEDICATION, y: data[i].PrescriptionCountPercent, PrescriptionCount: data[i].PrescriptionCount, TotalPrescription: totalPrescriptions, PCharge: data[i].CHARGE });
        seriesdata.push(chartData);
    }

    // All Prescription Count 
    dataObj.AllPrescriptions = seriesdata;

    var filterdata = data.filter(function(d) {
        return (d.MEDICATION.indexOf("+") == -1)
    });

    totalPrescriptions = 0;
    seriesfilterdata = [];
    chartfilterdata = {};

    for (i = 0; i < filterdata.length; i++) {
        // console.log(temp1[i].PrescriptionCount);
        totalPrescriptions = totalPrescriptions + filterdata[i].PrescriptionCount;
    }
    // console.log(totalPrescriptions);
    for (i = 0; i < filterdata.length; i++) {
        filterdata[i].PrescriptionCountPercent = (filterdata[i].PrescriptionCount / totalPrescriptions) * 100;
    }

    for (i = 0; i < filterdata.length; i++) {

        chartfilterdata = ({ name: filterdata[i].MEDICATION, y: filterdata[i].PrescriptionCountPercent, PrescriptionCount: filterdata[i].PrescriptionCount, TotalPrescription: totalPrescriptions, PCharge: filterdata[i].CHARGE });
        seriesfilterdata.push(chartfilterdata);
    }
    // Single Prescription Count 
    dataObj.SinglePrescriptions = seriesfilterdata;

    var totalIngredientCost = 0;
    var seriesIngredientCostData = [];
    var chartIngredientCostData = {};

    for (i = 0; i < data.length; i++) {
        data[i].IngredientCost = (data[i].PrescriptionCount * data[i].CHARGE);
    }

    for (i = 0; i < data.length; i++) {
        totalIngredientCost = totalIngredientCost + data[i].IngredientCost;
    }
    // console.log(totalIngredientCost);
    for (i = 0; i < data.length; i++) {
        data[i].IngredientCostPercent = (data[i].IngredientCost / totalIngredientCost) * 100;
    }

    for (i = 0; i < data.length; i++) {

        chartIngredientCostData = ({ name: data[i].MEDICATION, y: data[i].IngredientCostPercent, PrescriptionCount: data[i].PrescriptionCount, TotalPrescription: totalIngredientCost, PCharge: data[i].CHARGE });
        seriesIngredientCostData.push(chartIngredientCostData);
    }

    // All IngredientCost  
    dataObj.AllIngredient = seriesIngredientCostData;


    totalIngredientCost = 0;
    seriesIngredientCostData = [];
    chartIngredientCostData = {};

    for (i = 0; i < filterdata.length; i++) {
        filterdata[i].IngredientCost = (filterdata[i].PrescriptionCount * filterdata[i].CHARGE);
    }

    for (i = 0; i < filterdata.length; i++) {
        totalIngredientCost = totalIngredientCost + filterdata[i].IngredientCost;
    }
    // console.log(totalIngredientCost);
    for (i = 0; i < filterdata.length; i++) {
        filterdata[i].IngredientCostPercent = (filterdata[i].IngredientCost / totalIngredientCost) * 100;
    }

    for (i = 0; i < filterdata.length; i++) {

        chartIngredientCostData = ({ name: filterdata[i].MEDICATION, y: filterdata[i].IngredientCostPercent, PrescriptionCount: filterdata[i].PrescriptionCount, TotalPrescription: totalIngredientCost, PCharge: filterdata[i].CHARGE });
        seriesIngredientCostData.push(chartIngredientCostData);
    }

    dataObj.SingleIngredientCost = seriesIngredientCostData;


    return dataObj;

}

//Nisha 04/05/2017 To prepare data for cost per rx chart in risk distribution 
export let prepareDataforRxCostPrescription = (baseData) => {

        let chartData = {};
        chartData['all'] = null;
        chartData['single'] = null;
        chartData['allTable'] = null;
        chartData['singleTable'] = null;
        //prepare data for all medication 
        chartData['all'] = prepareDataBubblePrescition(baseData);
        //prepare data for all table 
        chartData['allTable'] = prepareDataForTable(baseData);
        //filter data for single medication 
        let filterdata = baseData.filter((d) => d.MEDICATION.indexOf("+") == -1);

        chartData['single'] = prepareDataBubblePrescition(filterdata);
        chartData['singleTable'] = prepareDataForTable(filterdata);
        return chartData;
    }
    //prepare data forbubble chart 
let prepareDataBubblePrescition = (baseData) => {
        let chartData = [];
        //group data by medication 
        let medicationgrpData = _.groupBy(baseData, 'MEDICATION');
        let colors = customColorsArray();
        let couln = 0;
        for (let key in medicationgrpData) {
            let json = {};
            //get abbr value for drug name 
            json['name'] = getDrugAbbr(key);
            json['fullName'] = key;
            let datak = medicationgrpData[key];
            let lengthofp = 0;
            let cost = 0;
            for (let i = 0; i < datak.length; i++) {
                cost += datak[i].PrescriptionCount * datak[i].CHARGE;
                lengthofp += datak[i].PrescriptionCount;
            }
            json['x'] = lengthofp;
            json['z'] = cost;
            json['y'] = lengthofp != 0 ? (cost / datak.length) : 0;
            json['color'] = colors[couln];
            couln += 1;
            if (lengthofp) {
                chartData.push(json);
            }
        }
        //reutrn the result 
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
//cost per rx,average cost,prescription count for all medications 
let prepareDataForTable = (baseData) => {
    //group data by medication 
    let medicationgrpData = _.groupBy(baseData, 'MEDICATION');
    //loop through all  medication 
    let chartdata = [];
    let total = 0;
    for (let medication in medicationgrpData) {
        let json = {};
        json['name'] = medication;
        let datak = medicationgrpData[medication];
        let lengthofp = 0;
        let cost = 0;
        for (let i = 0; i < datak.length; i++) {
            cost += datak[i].CHARGE || 0;
            lengthofp += datak[i].PrescriptionCount;
        }
        json['count'] = lengthofp;
        total += lengthofp;
        json['y'] = cost * lengthofp;
        json['costperrx'] = lengthofp != 0 ? (cost / datak.length) : 0;
        chartdata.push(json);

    }

    return { data: chartdata, total: total };
}


export let prepareCompetitorAnalysisChartData = ({ data, filteredMedicine }) => {
    let finalData = {};
    let prepareGenotypeChartData = [],
        prepareGenotypeChartDatastack = [],
        prepareTreatmentChartData = [],
        prepareCirrhosisChartData = [];



    //Grouped data by Genotype and prepare data for all genotype
    let grpData = _.groupBy(data, 'SVR_Result');
    let GenoGrp = _.groupBy(data, 'GENOTYPE');
    let Genokeys = [];
    for (let key in GenoGrp) {
        Genokeys.push(key);
    }
    Genokeys.sort((a, b) => a.replace(/\D+/g, '') - b.replace(/\D+/g, ''));

    for (let key in grpData) {
        let json = {};
        json['name'] = key;
        let keyData = grpData[key];
        let c_keyData = _.countBy(keyData, 'GENOTYPE');
        let cdata = [];
        let count = keyData.length;
        for (let i = 0; i < Genokeys.length; i++) {
            let json1 = {};
            json1['name'] = Genokeys[i];
            json1['y'] = c_keyData[Genokeys[i]] ? c_keyData[Genokeys[i]] : 0;
            json1['total'] = count;
            let genCount = GenoGrp[Genokeys[i]].length;
            json1['per'] = json1['y']?(json1['y']/genCount)*100:0;
            cdata.push(json1);
        }
        json['data'] = cdata;
        prepareGenotypeChartDatastack.push(json);
    }

    //Grouped data by Genotype and prepare data for all genotype
    grpData = _.groupBy(data, 'GENOTYPE');
    for (let key in grpData) {
        prepareGenotypeChartData.push({ key: key, count: grpData[key].length, graphData: _.countBy(grpData[key], 'SVR_Result') });
    }
    //Grouped data by CIRRHOSIS and prepare data for CIRRHOSIS Condition
    grpData = _.groupBy(data, 'CIRRHOSIS');
    for (let key in grpData) {
        prepareCirrhosisChartData.push({ key: key, count: grpData[key].length, graphData: _.countBy(grpData[key], 'SVR_Result') });
    }
    //Grouped data by TREATMENT and prepare data for TREATMENT Condition
    grpData = _.groupBy(data, 'TREATMENT');

    for (let key in grpData) {
        prepareTreatmentChartData.push({ key: key, count: grpData[key].length, graphData: _.countBy(grpData[key], 'SVR_Result') });
    }

    // Success Rate Chart Data
    var filteredMedicationName = data.filter(function(obj) {
        return (obj.MEDICATION.indexOf('+') == -1);
    });

    filteredMedicationName = _.countBy(filteredMedicationName, 'MEDICATION');

    var medications = [];

    var MedicationPercent = [];
    var SuccessChartData = {};
    let successtotal = 0;
    let grpMedication = _.groupBy(data, 'MEDICATION');
    //console.log(grpMedication);
    for (var key in grpMedication) {
        var total = data.filter(function(obj) {
            return (obj.MEDICATION.indexOf(key) != -1);
        }).length;

        var undetected = data.filter(function(obj) {
            return (obj.MEDICATION.indexOf(key) != -1 && obj.SVR_Result == "Undetectable SVR");
        }).length;

        successtotal += undetected;
        // console.log(undetected.length);

        medications.push(key);
        //Praveen 03/06/2017
        let valueSuccessPer = (undetected / total) * 100;
        MedicationPercent.push({ y: valueSuccessPer, undetectedCount: undetected, totalCount: total });
    }
    //console.log("--------");
    //console.log(medications);
    SuccessChartData = ({ medicines: medications, MedicationPercent: MedicationPercent, total: successtotal });
    // console.log(SuccessChartData);
    //success rate chart data basedon cirrhosis;
    let Cirrkeys = [];
    let chartDataSuccess = [];
    let cirrhGrp = _.groupBy(data, 'CIRRHOSIS');
    for (let key in cirrhGrp) {
        Cirrkeys.push(key);
    }
    let cirrhosistotal = 0;
    for (var key in grpMedication) {
        let json = {};
        json['name'] = key;
        let datacirr = [];
        for (let key1 in cirrhGrp) {
            let keyData = cirrhGrp[key1];
            var total = keyData.filter(function(obj) {
                return (obj.MEDICATION.indexOf(key) != -1);
            }).length;
            // console.log(total.length);

            var undetected = keyData.filter(function(obj) {
                return (obj.MEDICATION.indexOf(key) != -1 && obj.SVR_Result == "Undetectable SVR");
            }).length;

            cirrhosistotal += undetected;
            let valueSuccPer = (undetected / total) * 100;
            datacirr.push({ y: valueSuccPer, undetectedCount: undetected, totalCount: total });
        }
        json['data'] = datacirr;
        chartDataSuccess.push(json);
    }


    //success rate chart data basedon cirrhosis;

    let chartDataSuccessGeno = [];

    let genototal = 0;
    // for (var key in filteredMedicationName) {
    for (var key in grpMedication) {
        let json = {};
        json['name'] = key;
        let datacirr = [];
        for (let key1 in GenoGrp) {
            let keyData = GenoGrp[key1];
            var total = keyData.filter(function(obj) {
                return (obj.MEDICATION.indexOf(key) != -1);
            }).length;
            // console.log(total.length);
            //Praveen 03/06/2017
            var undetected = keyData.filter(function(obj) {
                return (obj.MEDICATION.indexOf(key) != -1 && obj.SVR_Result == "Undetectable SVR");
            }).length;

            genototal += undetected;
            let valueSuccessPer = (undetected / total) * 100;
            datacirr.push({ y: valueSuccessPer, undetectedCount: undetected, totalCount: total });
        }
        json['data'] = datacirr;
        chartDataSuccessGeno.push(json);
    }
    // Success Rate Chart Data

    finalData.allDistributionData = _.countBy(data, 'SVR_Result');
    finalData.DrugSuccessRate = SuccessChartData;
    finalData.genotypeChartData = prepareGenotypeChartData;
    finalData.treatmentChartData = prepareTreatmentChartData;
    finalData.prepareGenotypeChartDatastack = { data: prepareGenotypeChartDatastack, key: Genokeys, total: genototal };
    finalData.cirrhosisChartData = prepareCirrhosisChartData;

    finalData.cirrhosisChartDataSuccess = { data: chartDataSuccess, key: Cirrkeys, total: cirrhosistotal };
    finalData.GenotypeChartDataSuccess = { data: chartDataSuccessGeno, key: Genokeys, total: genototal };

    //// rawData Currently it is grouped by MEDICATION but it can be by Risk or by age or by Other factor for comparision

    //finalData.rawData=_.groupBy(data,'MEDICATION');

    //finalData.compareData=_.countBy(finalData.rawData,'fillyear');

    finalData.TotalN = data.length;


    return finalData;

}


// //function to prepare extra hepatic charts
// export let prepareDataForExtraHepaticChart = (baseData) => {
//     let allSymptoms = ['ARTHRALGIA','ARTHRITIS','CEREBRAL','CRYOGLOBULINEMIA',
//     'FATIGUE','FIBROMYALGIA','CARDIOMYOPATHY','IDIOPATHIC_THROMBOCYTOPENIC_PURPURA',
//     'INSULIN_RESISTANCE','LICHEN_MYXOEDEMATOUS','MULTIPLE_MYELOMA','NEUTROPENIA','PARESTHESIA'];
//     let symptomsCount = {},
//     symptomsCost={};

//     let tempSymptomsCount =[], symptomsGenotypeData = [], symptomsCirrhosisData=[],
//     symptomsTreatmentData = [], symptomsFibStageData=[], tempSymptomsCost=[];

//     for(let i=0; i<allSymptoms.length; i++) {
//         let currentSymptom = allSymptoms[i],
//             filterSympObj = {};

//         filterSympObj[currentSymptom] = 1;
//         // console.log(filterSympObj);
//         let symptomsData = _.where(baseData,filterSympObj);

//         //object data for particular symptom
//        // tempSymptomsCount.push({name:currentSymptom,y:symptomsData.length,patientPercentage:Math.round(symptomsData.length*100/baseData.length)/100});
//         tempSymptomsCount.push({name:currentSymptom,y:symptomsData.length,patientPercentage:(parseFloat(symptomsData.length/baseData.length)*100).toFixed(2)});

//         //object data for symptom cost distribution
//         let cost =[];
//         if(symptomsData.length>0)
//         {
//             for (let j=0;j<symptomsData.length;j++)
//             {
//                 //prepare cost data for particular symptom
//                 let tempCost =parseInt(symptomsData[j][currentSymptom+'_COST']);
//                 if(tempCost> 0)
//                 {
//                     cost.push(tempCost);
//                 }
//             }
//         }
//         if(cost.length > 0)
//         {
//             let costSum = _.reduce(cost, function(a, b) { return a + b; }, 0);
//             tempSymptomsCost.push({name:currentSymptom,y:costSum,patientCount:cost.length});
//         }
//     }

//     symptomsCount.name= 'Patient Count';
//     symptomsCount.data= tempSymptomsCount;
//     symptomsCost.name = 'Avg Cost';
//     symptomsCost.data=tempSymptomsCost;



//     //object data for symptom genotype distribution
//     symptomsGenotypeData = getSymptomCountByGroups(_.groupBy(baseData, 'GENOTYPE'),allSymptoms);

//     //object data for symptom cirrhosis distribution
//     symptomsCirrhosisData = getSymptomCountByGroups(_.groupBy(baseData, 'CIRRHOSIS'),allSymptoms);

//     //object data for symptom treatment distribution
//     symptomsTreatmentData = getSymptomCountByGroups(_.groupBy(baseData, 'TREATMENT'),allSymptoms);

//     //object data for symptom fib stage distribution
//     symptomsFibStageData =getSymptomCountByFibStage(baseData, allSymptoms);


//     let finalDataObj = {
//        // symptomsPatientData:baseData ,
//         symptomsCount: [symptomsCount],
//         symptomsCost: [symptomsCost],
//         symptomsGenotypeCount: symptomsGenotypeData,
//         symptomsCirrhosisCount: symptomsCirrhosisData,
//         symptomsTreatmentCount: symptomsTreatmentData,
//         symptomsFibStageCount:  symptomsFibStageData
//     };

//     return finalDataObj;
// }

// //function to get group wise count for symptom
// let getSymptomCountByGroups = (groupedData, allSymptoms) => {
//     let prepareFinalData =[];

//     for(let keys in groupedData) {
//         let tempData = [];
//         for(let i=0; i<allSymptoms.length; i++) {
//             let currentSymptom = allSymptoms[i],
//             filterSympObj = {};

//             filterSympObj[currentSymptom] = 1;

//             let symptomsData = _.where(groupedData[keys],filterSympObj);

//             tempData.push({name:currentSymptom,y:symptomsData.length});
//         }
//         prepareFinalData.push({name:keys,data:tempData});
//     }
//     return prepareFinalData;
// }

// //function to get fib stage wise count for symptom
// let getSymptomCountByFibStage = (symptomDataArray, allSymptoms) => {
//     //filter irrelevant data
//     symptomDataArray = symptomDataArray.filter((d) => !isNaN(parseFloat(d.fibro_Value)));

//     let groupedData = _.groupBy(symptomDataArray, (rec) => {
//         let fibroValue = parseFloat(rec.fibro_Value).toFixed(2);

//         if (fibroValue >= 0 && fibroValue <= 0.21)
//             return "F0";
//         if (fibroValue >= 0.22 && fibroValue <= 0.31)
//             return "F1";
//         if (fibroValue >= 0.32 && fibroValue <= 0.58)
//             return "F2";
//         if (fibroValue >= 0.59 && fibroValue <= 0.73)
//             return "F3";
//         //if (fibroValue >= 0.74 && fibroValue <= 1.00)
//         if (fibroValue >= 0.74)
//             return "F4";
//     });

//     return getSymptomCountByGroups(groupedData, allSymptoms);
// }