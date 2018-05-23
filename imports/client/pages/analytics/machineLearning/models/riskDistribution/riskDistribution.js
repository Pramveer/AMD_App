import {
    Template
} from 'meteor/templating';
import './riskDistribution.html';
import * as mlSubTabsUtil from '../modelUtils.js';
import * as logitModel from '../../../../../lib/mlAlgos/logicModelSelected.js';


let filterObjectsArray = [];

let filteredData = [];
let filtered = '';
let suspectedCirrhosisData = [];
let marketViewData = [];
AmdApp.RiskDistribution = {}; //set data for comparison and other values
Template.RiskDistribution.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    let params = getCurrentPopulationFilters();
    //Praveen 02/27/2017
    params['fdaCompliant'] = "all";
    executeRiskDistributionRender(params, self);
});

Template.RiskDistribution.rendered = function() {
    filterObjectsArray = [];
    $('.headerbuttonFilesection').hide();
    //set comma separated format in highcharts
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
    //Praveen 02/27/2017 Added selectize for combos
    selectizeProbabilityCombos();
}

Template.RiskDistribution.helpers({
    isLoading() {
        return Template.instance().loading.get();
    },
    'getMedicationMarketShare': () => {
        if (marketViewData) {
            return marketViewData.MarketShareOverMonthsChartData.singleMedicationList;
        }
    },
});
//Praveen 03/30/2017 Added events on template section 
Template.RiskDistribution.events({
    'click .togglechartrxCost': function() {
        let value = $('.togglechartrxCost').attr('data');
        if (~~value == 0) {
            $('.togglechartrxCost').attr('data', 1);
            renderCostRxBubbleChart('prescriptionCount-rxCost', result_PrescriptionData.costPrescription.all);
        } else {
            $('.togglechartrxCost').attr('data', 0);
            renderCostRxBubbleChart('prescriptionCount-rxCost', result_PrescriptionData.costPrescription.single);
        }
    },
    'click .toggleIngredientchart': function() {
        let value = $('.toggleIngredientchart').attr('data');
        if (~~value == 0) {
            $('.toggleIngredientchart').attr('data', 1);
            renderIngredientCostChart('IngredientCost-Container', result_PrescriptionData.prescriptionCount.AllIngredient);
        } else {
            $('.toggleIngredientchart').attr('data', 0);
            renderIngredientCostChart('IngredientCost-Container', result_PrescriptionData.prescriptionCount.SingleIngredientCost);
        }
    },
    'click .togglechart': function() {
        let value = $('.togglechart').attr('data');
        if (~~value == 0) {
            $('.togglechart').attr('data', 1);
            renderPredictionCountChartL('prescriptionCount-Container', result_PrescriptionData.prescriptionCount.AllPrescriptions);
        } else {
            $('.togglechart').attr('data', 0);
            renderPredictionCountChartL('prescriptionCount-Container', result_PrescriptionData.prescriptionCount.SinglePrescriptions);
        }
    },
    'change .genotypeDistSelect': (event) => {
        let value = $(event.currentTarget).val();
        if (value == 'select') {
            renderCostRxBubbleChart('prescriptionCount-rxCost', result_PrescriptionData.costPrescription.all);
        } else {
            let dataFilter = result_PrescriptionData.costPrescription.all.filter((rec) => rec.fullName.indexOf(value) == 0);
            $('.togglechartrxCost').attr('data', 0);
            renderCostRxBubbleChart('prescriptionCount-rxCost', dataFilter);
        }

    },
    'change #ddlMedicationMarketShare': (event) => {
        let value = $(event.currentTarget).val();
        renderMarketShareOverMonthsChart('markerShareOverMonthsChart', AmdApp.RiskDistribution.realData.MarketShareOverMonthsChartData, value);
    },
    'click .globalshowPatientriskdistribution': function(event, template) {
        $('.riskdistributionPList-listMask').hide();
        $('.riskdistributionPList').show();
    },
    /**
     * Modified By : Yuvraj
     * date : 14th Feb 17
     * desc : We are no longer using date filters, So Filtering is not required.
     */
    'click .globalexportPatientriskdistribution': function(event) {
        let baseData = riskDistributionData;
        // Modified By Yuvraj (14th Feb 17) -  We are no longer using date filters.
        // let filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(baseData, filtered);
        let filteredData = baseData;
        mlSubTabsUtil.exportPatientsData(event.currentTarget, 'riskDistribution', filteredData);
    },
    'click .commonPopupShowPatientIcon': function(event) {
        $('.cirrhosisDistributionPList').show();
    },
    /**
     * Modified By : Yuvraj
     * date : 14th Feb 17
     * desc : We are no longer using date filters, So else condition is not required.
     */
    'click .js-analytics-applyDateFilters': function(event, template, data) {
        if (data && data == 'refresh') {
            template.loading.set(true);
            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "all";
            executeRiskDistributionRender(params, template);
        }
        // else {
        //     filtered = 'true';
        //     // Modified By Yuvraj (14th Feb 17) -  We are no longer using date filters. So, use riskDistributionData insted of filteredData;
        //     // filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(riskDistributionData, filtered);
        //     filteredData  = riskDistributionData;
        //     invokeChartsPreparation(filteredData);
        // }
    },
    'click .close.mlTabs_closebtn': function(e) {
        $('.analyticsPatientsPopup').hide();
    },
    'change .probFeaturesDropDown select': (event, template) => {
        //predict & plot probability for custom patient
        predictForCustomPatient();
    },
    'click #commonPopupSwitchDecisionTree': function(event) {
        let baseData = riskDistributionData;

        logitModel.plotProbabilityChart('decisionTreeChartContent', baseData);

        $('#decisionTreeContent').show();
        $('#commonPopupSwitchBack').show();
        $('.analyticsCommonPopupPatientContent').hide();
    },
    'click #commonPopupSwitchBack': function(event) {
        $('#decisionTreeContent').hide();
        $('#commonPopupSwitchBack').hide();
        $('.analyticsCommonPopupPatientContent').show();
    },
    'click #btnCirrhosisPrediction': function(event) {
        $('#cirrhosisPredictionResultBox').hide();
        predictForCustomPatient();
    },
    'click .commonPopupSwitchPoplationIcon': function(event) {
        //  $('#Genotype').selectize()
        // show decisiontree popup
        $('#cirrhosisPredictionResultBox').hide();
        $('.cirrhosisDecisionTree').show();
        mlSubTabsUtil.renderDecisionTreeLabels(riskDistributionData.length);
    },
    'click .togglechartComparison': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];
        let baseRealData = AmdApp.RiskDistribution.realData;
        let baseCompData = AmdApp.RiskDistribution.compData;
        let baseRealDataQA = AmdApp.RiskDistribution.realDataQA;
        let baseCompDataQA = AmdApp.RiskDistribution.compDataQA;

        if (value == 'MarketShareOverMonthsChartData') {
            primaryData = baseRealData.MarketShareOverMonthsChartData;
            secondaryData = baseCompData.MarketShareOverMonthsChartData;
        } else if (value == 'costperrx') {
            let value = $('.togglechartrxCost').attr('data');
            if (~~value == 0) {
                primaryData = baseRealDataQA.costPrescription.single;
                secondaryData = baseCompDataQA.costPrescription.single;
            } else {
                primaryData = baseRealDataQA.costPrescription.all;
                secondaryData = baseCompDataQA.costPrescription.all;
            }
        } else if (value == 'ingredicostpres') {
            primaryData = baseRealDataQA.costPrescription.allTable;
            secondaryData = baseCompDataQA.costPrescription.allTable;
        } else if (value == 'prescriptioCount') {
            let value = $('.togglechart').attr('data');
            if (~~value == 0) {
                primaryData = baseRealDataQA.prescriptionCount.SinglePrescriptions;
                secondaryData = baseCompDataQA.prescriptionCount.SinglePrescriptions;
            } else {
                primaryData = baseRealDataQA.prescriptionCount.AllPrescriptions;
                secondaryData = baseCompDataQA.prescriptionCount.AllPrescriptions;
            }

        } else if (value == 'ingredcost') {
            let value = $('.toggleIngredientchart').attr('data');
            if (~~value == 0) {
                primaryData = baseRealDataQA.prescriptionCount.SingleIngredientCost;
                secondaryData = baseCompDataQA.prescriptionCount.SingleIngredientCost;
            } else {
                primaryData = baseRealDataQA.prescriptionCount.AllIngredient;
                secondaryData = baseCompDataQA.prescriptionCount.AllIngredient;
            }
        }

        //basedon current database
        //if current data is customer specific no need tto swtich variable else we need tto switch variable primaryData,secondaryData
        //by default customer data is selected then method value is true
        if (isCustomerDataset()) {
            plotComparisionDataCharts(value, primaryData, secondaryData, desc);
        } else {
            plotComparisionDataCharts(value, secondaryData, primaryData, desc);
        }
    }
});

Template.RiskDistribution.toggle = function(clickedEle, tabNum, subsection) {
    tabNum = tabNum == undefined ? tab : tabNum;
    clickedEle = clickedEle != undefined ? clickedEle : '';
    var mixedID, id, drugname;

    //if section is clicked from the drug on safety page.
    if (!clickedEle.id) {
        drugname = drugsInfo[tabNum]['name'].toUpperCase();
        drugname = drugname.replace(/ /g, "_");
        mixedID = drugname + "_" + clickedEle;
        id = clickedEle;
    }
    //if section is to expanded via navigating from Drug page.
    else {
        mixedID = clickedEle.id;
        id = mixedID.substr(mixedID.lastIndexOf('_') + 1);
        //drugname = drugsInfo[tabNum]['name'].toUpperCase();
        drugname = mixedID.split('_')[0];
        drugname = drugname.replace(/ /g, "_");
    }
    var pele = document.getElementById(mixedID);
    var ele = document.getElementById(drugname + '_collapsableElement_' + id);
    var previewTextDiv = document.getElementById(drugname + '_previewText_' + id);
    if (ele.className == 'collapseElement') {
        ele.className = 'expandElement'
        pele.className = 'drug-label-open';
        previewTextDiv.style.display = 'none';
    } else {
        ele.className = 'collapseElement';
        pele.className = 'drug-label-close';
        previewTextDiv.style.display = 'blocsk';
    }
    if (subsection != '' && subsection != null) {
        scrollToId(subsection);
    } else if (!clickedEle.id) {
        scrollToId(mixedID);
    }
};


let invokesuspectedCirrhosisChartsPreparation = (baseData) => {
    // console.log('invokesuspectedCirrhosisChartsPreparation');
    // console.log(baseData);
    let fibrostages = _.groupBy(baseData, 'FibrosureStage');
    //console.log(fibrostages);
    suspectedCirrhosisData = [];
    let filteredCount = [];
    // let totalCount = [];
    //  let fibrostage = [];
    let ChartData = [],
        drilldownData = [];
    let jsonObj = {};

    for (let key in fibrostages) {
        if (key != 4) {
            //prepared Tending to Cirrhosis
            suspectedCirrhosisData = fibrostages[key].filter(a =>
                parseFloat(a.Count_PLATELET) < 120 && parseFloat(a.Count_AST) > 18 && parseFloat(a.Count_APRI) > 1
            );
            filteredCount.push({
                name: 'F' + key.toString(),
                y: suspectedCirrhosisData.length,
                patientPercentage: parseFloat((suspectedCirrhosisData.length / fibrostages[key].length) * 100).toFixed(2),
                totalPCount: fibrostages[key].length,
                drilldown: 'F' + key.toString()
            });
            // totalCount.push(fibrostages[key].length);
            // fibrostage.push('F' + key.toString());

            //prepared Drildown Data
            drilldownData.push(prepareDrillDownPatientData(
                fibrostages[key], 'F' + key.toString()
            ));
        }
    }

    jsonObj['name'] = "Tending to Cirrhosis";
    jsonObj['data'] = filteredCount;
    ChartData.push(jsonObj);

    rendersuspectedCirrhosisCharts({
        chartData: ChartData,
        drillDownData: drilldownData
    });

}

/*
 * @Author : Pram (13th Feb 17)
 *@Modified : Praveen (27th Feb 2017)
 * @Desc : Init the selectize combos
 */
//function to invoke selectize
let selectizeProbabilityCombos = () => {
    // Race combo
    $('.rdRaceCombo').selectize();

    // Gender Combo
    $('.rdGenderCombo').selectize();

    // fib stage combo
    $('.rdFibStageCombo').selectize();

    //cirrhosis combo
    $('.cirrhosisCombo').selectize();

    //treatment combo
    $('.treatmentCombo').selectize();

    //genotype combo
    $('.genotypeCombo').selectize();

    // Initializing Range Sliders.
    $('input[type=range]').rangeslider({
        polyfill: false
    });

}

/*
 * @Author : Pram (14th Feb 17)
 * @Desc : Predict the probability for custom patient & plot on chart
 */
//function to predict probability for custom patient
let predictForCustomPatient = () => {
    let patientDataObj = {};
    patientDataObj.patientId = parseFloat(Math.random() * 1000 * 12);
    patientDataObj.GENDER_CD = parseInt($('.rdGenderCombo').val());
    patientDataObj.CIRRHOSIS = parseInt($('.cirrhosisCombo').val());
    patientDataObj.RACE_DESC = parseInt($('.rdRaceCombo').val());
    patientDataObj.FibrosureStage = parseInt($('.rdFibStageCombo').val());
    patientDataObj.TREATMENT = parseInt($('.treatmentCombo').val());
    patientDataObj.GENOTYPE = parseInt($('.genotypeCombo').val());
    patientDataObj.costNow = parseFloat($('.rdCostCombo').val());
    //console.log(logitModel.getFeaturesWeight());
    let prob = logitModel.predictCirrhoticProbability(patientDataObj);
    //  console.log('probability value');
    //  console.log(prob);

    logitModel.setCustomPatientsData(patientDataObj);
    $('#cirrhosisPredictionResultMessage').html(`Patient has ${prob.toFixed(2)}% risk of Liver Disease from above criteria`);
    $('#cirrhosisPredictionResultBox').show();

    //plot the patient on the chart
    invokeCirrhoticProbabilityChart();
}

//Praveen 02/16/2017 2:55PM to prepare data and plot chart based on HIV and Renal Failure on Liver Disease
let renderRiskDistributionchartLiverDisease = (baseData) => {

    //prepare data for HIV patients;
    let patientsHavingHIV = _.where(baseData, {
        HIV: 'Yes'
    });
    //prepare data for hiv patients data
    let patientsHIVChartData = prepareDataLiverDisease(patientsHavingHIV);
    //Praveen 02/21/2017 drilldown functionality for charts.
    //let patientsHIVNoChartData = prepareDataNoLiverDisease(_.where(baseData, { HIV: 'No' }));
    //prepare data for renal Failure patients
    let patientsHavingrenalFailure = _.where(baseData, {
        renalFailure: 1
    });

    //prepare data for renail failure patients
    let patientsRenalChartData = prepareDataLiverDisease(patientsHavingrenalFailure);
    //console.log(patientsRenalChartData);
    //pateints having liver disease in total distribution of patients

    let patientsTotalChartData = prepareDataLiverDisease(baseData);

    //render liver disease by hiv chart
    renderPieChart('riskByHIVByLiver-Container', patientsHIVChartData, 'HIV');
    //render renail failure chart
    renderPieChart('riskByRenailFailureLiver-Container', patientsRenalChartData, 'Renal Failure');
    //render total patients chart
    renderPieChart('riskByLiverTotal-Container', patientsTotalChartData, '');
}

//prepare data for liver disease pie chart
let prepareDataLiverDisease = (baseData) => {

    let chartData = [];
    //length of patients
    let totalPatients = baseData.length;
    //filter data for liver disease patients
    let liveriseasePatientsData = baseData.filter((rec) => rec.liverBiopsy == 'Yes' || rec.cirrhosis == 'Yes' || rec.liverFailure == '1');

    //length of patients having liver disease
    let countLiverDisease = liveriseasePatientsData.length;

    //check for patients having liver disease
    if (countLiverDisease) {
        let json = {};
        json['name'] = 'Has Disease';
        json['y'] = countLiverDisease;
        json['total'] = totalPatients;
        chartData.push(json);
    }

    //check for null patients
    //Modifed By Praveen 02/22/2017 now it is based on probability measure.
    // if(totalPatients){
    //   let json = {};
    //   json['name'] = 'No';
    //   json['y'] = totalPatients - countLiverDisease;
    //   json['total'] = totalPatients;
    //   chartData.push(json);
    // }

    //Praveen 02/22/2017 Patients having No liver disease
    //filter data for liver disease patients
    let NoliveriseasePatientsData = baseData.filter((rec) => rec.liverBiopsy != 'Yes' && rec.cirrhosis != 'Yes' && rec.liverFailure != '1');
    let features = ['FibrosureStage', 'CIRRHOSIS', 'GENDER_CD', 'RACE_DESC', 'GENOTYPE', 'TREATMENT'];
    let jsonDataPredict = [];
    let rangeDatapredict = {};
    //lopp through all the patient for getting probability value;
    for (let index = 0; index < NoliveriseasePatientsData.length; index++) {
        //get data for current index
        let currentData = NoliveriseasePatientsData[index];
        //get fibrosis data
        let fibroN = parseInt(currentData.FibrosureStage) * (-0.01970562);
        //get cirrhosis data
        let cirrN = parseInt(getPredictionValue('cirrhosis', currentData.cirrhosis)) * 3.82081724;
        //get gender data
        let genderN = parseInt(getPredictionValue('gender_cd', currentData.gender)) * (-0.55814593);
        //get race value
        let raceN = parseInt(getPredictionValue('race', currentData.race)) * (-0.03071107);
        //get genotype predict value
        let gentoypeN = parseInt(getPredictionValue('genotype', currentData.genotype)) * (-0.09617669);
        //get treatment value
        let treatN = parseInt(getPredictionValue('treatment', currentData.treatment)) * (1.03436836);
        let intercept = -0.46389211;
        //let coef =  [-0.01970562  ,3.82081724 ,-0.55814593 ,-0.03071107 ,-0.09617669  ,1.03436836];
        //sum of these prediction value
        let predictionExpValue = intercept + fibroN + cirrN + genderN + raceN + gentoypeN + treatN;
        //get probability value
        let predictionPValue = Math.exp(predictionExpValue) / (1 + Math.exp(predictionExpValue)); //1/(1+Math.exp(-predictionExpValue));
        let rangeofValue = generateDataRange(predictionPValue * 100);

        //check for undefined
        if (rangeDatapredict[rangeofValue] === undefined) {
            rangeDatapredict[rangeofValue] = 1;
        } else {
            rangeDatapredict[rangeofValue] += 1;
        }
        //push the data
        jsonDataPredict.push(predictionExpValue);
    }




    //put the prediction valuein pie chart
    for (let key in rangeDatapredict) {
        let json = {};
        json['name'] = key;
        json['y'] = rangeDatapredict[key];
        json['total'] = totalPatients;
        chartData.push(json);
    }
    //console.log(jsonDataPredict,rangeDatapredict);

    return chartData;
}

//genderate range value from given value
function generateDataRange(weeknumber) {
    let range = null;
    if (weeknumber >= 70 && weeknumber < 80) {
        range = '70-80%';
    } else if (weeknumber >= 60 && weeknumber < 70) {
        range = '60-70%';
    } else if (weeknumber >= 50 && weeknumber < 60) {
        range = '50-60%';
    } else if (weeknumber >= 40 && weeknumber < 50) {
        range = '40-50%';
    } else if (weeknumber >= 30 && weeknumber < 40) {
        range = '30-40%';
    } else if (weeknumber >= 20 && weeknumber < 30) {
        range = '20-30%';
    } else if (weeknumber >= 10 && weeknumber < 20) {
        range = '10-20%';
    } else if (weeknumber >= 0 && weeknumber < 10) {
        range = '0-10%';
    } else {
        //console.log('no data');
    }
    return range;
}
//Praveen 02/22/2017 get the prediction value based on the score
let getPredictionValue = (category, value) => {
        //predefined values
        let predictionDict = {
            'genotype': {
                '1a': 3,
                '1b': 2,
                '2': 1,
                '3': 0,
                '4': 4
            },
            'gender_cd': {
                'f': 1,
                'm': 2
            },
            'treatment': {
                'naive': 0,
                'experienced': 1
            },
            'race': {
                'african american': 1,
                'causian': 0,
                'hispanic': 3,
                'other': 4,
                'unknown': 2
            },
            'cirrhosis': {
                'yes': 1,
                'no': 0
            }
        }
        return predictionDict[category.toLowerCase()][value.toLowerCase()] || 0;
    }
    //render pie chart
let renderPieChart = (container, chartData, keyword) => {

    //sort chart data
    chartData = _.sortBy(chartData, 'name')

    Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: keyword
        },
        tooltip: {
            pointFormat: 'Patient Count: <b>{point.y:,.0f}</b><br/>Total Patient:<b>{point.total:,.0f}</b>'
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    },
                    distance: -20
                },
                showInLegend: true
            }
        },
        series: [{
            name: '',
            colorByPoint: true,
            data: chartData
        }]
    });
}

let prepareDrillDownPatientData = (baseData, key) => {
    let jsonObj = {};
    jsonObj.id = key;
    jsonObj.name = 'Patient Count';
    let drilldata = []
    let patientCount = baseData.length
    let PLATELETdata = baseData.filter(a =>
        parseFloat(a.Count_PLATELET) < 120);
    drilldata.push({
        name: 'Platelet < 120',
        y: PLATELETdata.length,
        patientPercentage: parseFloat((PLATELETdata.length / patientCount) * 100).toFixed(2),
        totalPCount: patientCount
    });


    let APRIdata = baseData.filter(a =>
        parseFloat(a.Count_APRI) > 1);
    drilldata.push({
        name: 'APRI > 1',
        y: APRIdata.length,
        patientPercentage: parseFloat((APRIdata.length / patientCount) * 100).toFixed(2),
        totalPCount: patientCount
    });

    let ASTdata = baseData.filter(a =>
        parseFloat(a.Count_AST) < 18);
    drilldata.push({
        name: 'AST > 18',
        y: ASTdata.length,
        patientPercentage: parseFloat((ASTdata.length / patientCount) * 100).toFixed(2),
        totalPCount: patientCount
    });
    jsonObj.data = drilldata;
    return jsonObj;
}
let rendersuspectedCirrhosisCharts = (data) => {
    if (data.chartData.length > 0) {
        $(".commonPopupShowPatientIcon").hide();
        Highcharts.chart('riskBySuspectedCirrhosis-Container', {
            chart: {
                type: 'column',
                height: 380,
                width: 1000,
                events: {
                    drilldown: function(e) {
                        this.setTitle({
                            text: e.point.name
                        }, {
                            text: ''
                        });
                        if (e.point.name != '') {
                            let fibrostages = _.groupBy(riskDistributionData, 'FibrosureStage');
                            mlSubTabsUtil.renderPatientsList(fibrostages[parseInt(e.point.name.replace('F', ''))], 'cirrhosisDistributionPList');
                            $(".commonPopupShowPatientIcon").show();
                        }
                    },
                    drillup: function(e) {
                        this.setTitle({
                            text: ''
                        }, {
                            text: ''
                        });
                        $(".commonPopupShowPatientIcon").hide();

                    }
                }
                //  zoomType: 'xy'
            },
            title: {
                text: ' '
            },
            subtitle: {
                text: ' '
            },
            // colors: ['#111'],
            xAxis: {
                //  categories: fibrostage,
                type: 'category',
                title: {
                    text: '<div class="riskDistribution-XAxisText">Fib-4<div>'
                },
                labels: {
                    style: {
                        fontSize: '11px',
                        fontFamily: 'Open Sans,sans-serif',
                        color: 'gray',
                        "text-decoration": "none"
                    }
                }
            },
            yAxis: {
                //   min: 0,
                //lineWidth: 1,
                title: {
                    text: '<div class="riskDistribution-YAxisText">Patient Count</div>'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        x: 0,
                        y: 10
                    }
                },

                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        formatter: function() {

                            if (this.point.patientPercentage) {
                                return this.point.patientPercentage + ' %';
                            }

                        },
                        borderWidth: 0,
                        allowOverlap: true,
                        style: {
                            fontWeight: '300',
                            fontSize: '11px',
                            shadow: false,
                            textShadow: false

                        }


                    }
                }

            },
            legend: {
                enabled: false
            },
            // legend: {
            //     layout: 'vertical',
            //     align: 'right',
            //     verticalAlign: 'top',
            //     x: -40,
            //     y: 80,
            //     floating: true,
            //     borderWidth: 1,
            //     backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            //     shadow: true
            // },
            credits: {
                enabled: false
            },
            series: data.chartData,
            drilldown: {
                drillUpButton: {
                    relativeTo: 'spacingBox',
                    position: {
                        y: 0,
                        x: 0
                    }
                },
                series: data.drillDownData
            },
            tooltip: {

                formatter: function() {
                    let html = '<div class="customC3ToolTip">';

                    if (this.series.name == 'Tending to Cirrhosis') {

                        html += '<div class="customC3ToolTip-Header">' +
                            '<div><b>' + this.key + '</b></div>' +
                            '</div><br>' +
                            '<div class="customC3ToolTip-Body">';
                        html += '<div style="text-align:left"><b>Total Patient</b> - ' + commaSeperatedNumber(this.point.totalPCount) + '</div><br>';
                        html += '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + this.point.color + '"></div><b>Tending to Cirrhosis Patient:</b> ' + commaSeperatedNumber(this.y) + '</div>' +
                            '</div>' +
                            '</div>';
                    } else {
                        html +=
                            '<div class="customC3ToolTip-Body">';
                        html += '<div style="text-align:left"><b>Total Patient</b> - ' + commaSeperatedNumber(this.point.totalPCount) + '</div><br>';
                        html += '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + this.point.color + '"></div><b>' + this.key + '</b><b> Patient Count:</b> ' + commaSeperatedNumber(this.y) + '</div>' +
                            '</div>' +
                            '</div>';
                    }
                    return html;
                }

            }
            // drilldown : data.drillDownData
            /* [{
                       name: 'suspected',
                       data: [107, 31, 635, 203, 2]
                   }, {
                       name: 'total',
                       data: [133, 156, 947, 408, 6]
                   }]*/
        });
    } else {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#riskBySuspectedCirrhosis-Container').html(noDataHtml);
        return;
    }

}



//scroll to a particular element/section
function scrollToId(id) {
    let ele = $('html,body');
    let targetElmOffset = $("#" + id).offset().top;
    if (window.location.pathname.toLowerCase() == "/payer") {
        ele = $('.popup-body');
        targetElmOffset -= 130;
    }
    $(ele).animate({
        scrollTop: targetElmOffset
    }, 'slow');
}

function filterChartByData(dataKey, filterKey) {
    let isAlreadyFiltered = mlSubTabsUtil.checkFilterExists(filterKey, filterObjectsArray);

    if (isAlreadyFiltered)
        return;

    $('.customC3ToolTip').hide();
    filterObjectsArray = mlSubTabsUtil.getClickFilterObj(dataKey, filterKey, filterObjectsArray);
    renderChartsWithFilteredData();
}

function addBreadsCrums(breadCrumsData) {
    let parentWrapper = 'riskDistribution-Crums';
    let breadCrums = ``;

    $('.' + parentWrapper).hide();

    for (let i = 0; i < breadCrumsData.length; i++) {
        let fiterData = breadCrumsData[i];
        let label = fiterData.key ? fiterData.key.split('_').join(' ') : '';

        breadCrums += `<div class="dashBoard-breadCrum">
                            <div class="dashBoard-filterkey">${label} : </div>
                            <div class="dashBoard-filterValue">${fiterData.value}</div>
                            <div class="dashboard-clearFilter js-dashboard-clearFilter fa fa-trash" key="${fiterData.identifier}"></div>
                        </div>`;
    }

    if (breadCrumsData.length) {
        breadCrums += `<div class="dashBoard-breadCrum">
                        <div class="dashboard-clearAll js-dashboard-clearAll" title="Clear All Filters">Clear All</div>
                    </div>`;
    }


    $('.' + parentWrapper).empty();
    $('.' + parentWrapper).html(breadCrums);

    setTimeout(function() {
        $('.js-dashboard-clearFilter').on('click', function() {
            deleteBreadCrum($(this));
        });

        $('.js-dashboard-clearAll').on('click', function() {
            deleteBreadCrum($(this), true);
        });

        if (breadCrumsData.length) {
            $('.' + parentWrapper).show();
        }

    }, 100);
}

function deleteBreadCrum(obj, removeAll) {

    let filterkey = $(obj).attr('key');

    //remove the object from filterdataKey
    filterObjectsArray = _.without(filterObjectsArray, _.findWhere(filterObjectsArray, {
        identifier: $(obj).attr('key')
    }));

    if (removeAll) {
        filterObjectsArray = [];
        $('.riskDistribution-Crums').empty();
    }

    renderChartsWithFilteredData();
}

function renderChartsWithFilteredData() {
    let modifiedData = _.clone(riskDistributionData);

    let rangeObjectsArray = [];

    if (filterObjectsArray.length > 0) {
        rangeObjectsArray = _.where(filterObjectsArray, {
            type: 'range'
        });

        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.removeObjectsFromArray(filterObjectsArray, rangeObjectsArray, 'type');
        }

        for (let i = 0; i < filterObjectsArray.length; i++) {
            let filterObj = {};
            filterObj[filterObjectsArray[i].key] = filterObjectsArray[i].value;
            modifiedData = _.where(modifiedData, filterObj);
        }

        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.addObjectsToArray(filterObjectsArray, rangeObjectsArray);

            //filter the data on range objects
            modifiedData = mlSubTabsUtil.filterForRangeObjects(modifiedData, rangeObjectsArray);
        }
    }

    addBreadsCrums(filterObjectsArray);

    // Modified By Yuvraj (14th Feb 17) -  We are no longer using date filters.
    // modifiedData = mlSubTabsUtil.getFilteredDataOnDateCombos(modifiedData, filtered);

    $('.riskDistribution-totalPatients').html(commaSeperatedNumber(modifiedData.length));
    invokeChartsPreparation(modifiedData);
    mlSubTabsUtil.renderPatientsList(modifiedData, 'treatRiskPriorityPList');
    mlSubTabsUtil.hideChartLoading();
}


// Nisha 03/30/2017 for generating the Prescription Count and ingredient Cost Charts 
let renderPredictionCountChart = (baseData) => {
    $("#prescriptionCount-Container").hide();
    $("#IngredientCost-Container").hide();

    if (baseData.SingleIngredientCost.length == 0) {
        $("#IngredientCost-Container").show();
        $("#IngredientCostSingle-Container").hide();
        $(".toggleIngredientchart").hide();
    }

    // console.log('baseData.SinglePrescriptions.length');
    // console.log(baseData.SinglePrescriptions.length);
    if (baseData.SinglePrescriptions.length == 0) {
        $("#prescriptionCount-Container").show();
        $("#prescriptionCountSingle-Container").hide();
        $(".togglechart").hide();
    }

    Highcharts.chart('prescriptionCount-Container', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: 320,
            width: 550,
        },
        title: {
            text: ''
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>{point.name} Count: <b>{point.PrescriptionCount:,0.0f}</b><br>Total Count: <b>{point.TotalPrescription:,0.0f}</b>'
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    rotate: 0,
                    formatter: function() {
                        if (this.y > 4)
                            return Highcharts.numberFormat(this.y, 1) + '%';

                    },
                    style: {
                        fontWeight: '600',
                        fontSize: '11px',
                    }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'top',
            x: 10,
            y: 50,
            itemStyle: {
                fontSize: '11px',
                fontWeight: '300',
                color: '#666666'
            }
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseData.AllPrescriptions
        }]
    });

    // if (isChartDataEmpty(baseData.SinglePrescriptions)) {
    //     let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
    //     $('#prescriptionCountSingle-Container').html(noDataHtml);
    //     return;
    // }

    Highcharts.chart('prescriptionCountSingle-Container', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: 320,
            width: 550,
        },
        title: {
            text: ''
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>{point.name} Count: <b>{point.PrescriptionCount:,0.0f}</b><br>Total Count: <b>{point.TotalPrescription:,0.0f}</b>'
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    rotate: 0,
                    formatter: function() {
                        if (this.y > 4)
                            return Highcharts.numberFormat(this.y, 1) + '%';

                    },
                    style: {
                        fontWeight: '600',
                        fontSize: '11px',
                    }
                },
                showInLegend: true,
                point: {
                    events: {
                        click: function() {
                            console.log(this.name);
                        }
                    }
                }
            }
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'top',
            x: 10,
            y: 50,
            itemStyle: {
                fontSize: '11px',
                fontWeight: '300',
                color: '#666666'
            }
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseData.SinglePrescriptions
        }]
    });

    Highcharts.chart('IngredientCost-Container', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: 320,
            width: 550,
        },
        title: {
            text: ''
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>{point.name} Cost: <b>${point.PCharge:,.2f}</b><br>Total Cost: <b>${point.TotalPrescription:,.0f}</b>'
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    rotate: 0,
                    formatter: function() {
                        if (this.y > 4)
                            return Highcharts.numberFormat(this.y, 1) + '%';

                    },
                    style: {
                        fontWeight: '600',
                        fontSize: '11px',
                    }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'top',
            x: 10,
            y: 50,
            itemStyle: {
                fontSize: '11px',
                fontWeight: '300',
                color: '#666666'
            }
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseData.AllIngredient
        }]
    });

    Highcharts.chart('IngredientCostSingle-Container', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: 320,
            width: 550,
        },
        title: {
            text: ''
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>{point.name} Cost: <b>${point.PCharge:,.2f}</b><br>Total Cost: <b>${point.TotalPrescription:,.0f}</b>'
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    rotate: 0,
                    formatter: function() {
                        if (this.y > 4)
                            return Highcharts.numberFormat(this.y, 1) + '%';

                    },
                    style: {
                        fontWeight: '600',
                        fontSize: '11px',
                    }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'top',
            x: 10,
            y: 50,
            itemStyle: {
                fontSize: '11px',
                fontWeight: '300',
                color: '#666666'
            }
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseData.SingleIngredientCost
        }]
    });
}



let executeRiskDistributionRender = (params, templateObj) => {
    Meteor.call('getMarketViewChartData', params, (error, result) => {
        if (error) {
            templateObj.loading.set(false);
            AmdApp.RiskDistribution.realData = null;
        } else {
            // Nisha 03/30/2017 for generating the getPrescriptionCountData method for the  Prescription Count and ingredient Cost Charts and other new charts 
            Meteor.call('getPrescriptionCountData', params, (err, PrescriptionData) => {
                if (!err) {
                    // console.log(PrescriptionData);

                    let decompressed_objectPrescriptionData = LZString.decompress(PrescriptionData);
                    result_PrescriptionData = JSON.parse(decompressed_objectPrescriptionData);

                    templateObj.loading.set(false);
                    // // Decompression from get market view Tab Data
                    let decompressed_object = LZString.decompress(result);
                    marketViewData = JSON.parse(decompressed_object);

                    AmdApp.RiskDistribution.realDataQA = result_PrescriptionData;
                    AmdApp.RiskDistribution.realData = marketViewData;
                    // console.log('result_PrescriptionData');
                    // console.log(result_PrescriptionData);
                    // //set the coinfection data
                    // riskDistributionData = result;
                    // filteredData = result;
                    setTimeout(() => {
                        var count = 0;
                        if (result_PrescriptionData.prepareCounts.totalPrescriptionsCount > marketViewData.MarketShareOverMonthsChartData.totalPatient)
                            count = result_PrescriptionData.prepareCounts.totalPrescriptionsCount;
                        else
                            count = marketViewData.MarketShareOverMonthsChartData.totalPatient;
                        setCohortPatientCount({ patientCount: commaSeperatedNumber(count) });
                        var PerN = 0;
                        $("#market-share-specific-N").text(commaSeperatedNumber(marketViewData.MarketShareOverMonthsChartData.UniquetotalPatient));
                        $("#market-share-N").text(commaSeperatedNumber(result_PrescriptionData.prepareCounts.totalPrescriptionsCount));
                        PerN = (marketViewData.MarketShareOverMonthsChartData.UniquetotalPatient / marketViewData.MarketShareOverMonthsChartData.totalPatient) * 100;
                        $("#market-share-specific-PerN").text(parseInt(PerN) + '%');

                        $(".CPR-prescription-countsingle-N").text(commaSeperatedNumber(result_PrescriptionData.prepareCounts.uniquePrescriptionsCount));
                        $(".CPR-prescription-countsingle-TotalN").text(commaSeperatedNumber(result_PrescriptionData.prepareCounts.totalPrescriptionsCount));
                        PerN = (result_PrescriptionData.prepareCounts.uniquePrescriptionsCount / result_PrescriptionData.prepareCounts.totalPrescriptionsCount) * 100;
                        $(".CPR-prescription-countsingle-PerN").text(parseInt(PerN) + '%');

                        renderMarketShareOverMonthsChart('markerShareOverMonthsChart', marketViewData.MarketShareOverMonthsChartData, 'ALL');
                        //renderPredictionCountChart(result_PrescriptionData.prescriptionCount);
                        renderPredictionCountChartL('prescriptionCount-Container', result_PrescriptionData.prescriptionCount.SinglePrescriptions);
                        renderIngredientCostChart('IngredientCost-Container', result_PrescriptionData.prescriptionCount.SingleIngredientCost);
                        //Praveen 03/30/2017 Added bubble chart for prrescription
                        renderCostRxBubbleChart('prescriptionCount-rxCost', result_PrescriptionData.costPrescription.single);

                        //append table information 
                        addPrescriptionInformation(result_PrescriptionData.costPrescription.allTable.data);
                        //add selectize option value
                        addSelectElementData(result_PrescriptionData.costPrescription.single);
                        //render bar chart for ingredient cost and cost per prescription 
                        renderHighBarChart('prescriptionCount-IngredientCost', result_PrescriptionData.costPrescription.allTable);
                        logitModel.setProbRangeSliderValue(null);
                        logitModel.setTimeRangeSliderValue(null);

                        //Pram(10th Feb 17) Added here by Praveen Commented to hide the suspected cirrhois chart
                        //invokesuspectedCirrhosisChartsPreparation(filteredData);
                        //invokeCirrhoticProbabilityChart(riskDistributionData, true);
                    }, 100);
                    fetchSecondaryDataset(params); //fetch data for comparison
                }
            });
        }
    });
}


//function to invoke the cirrhotic model chart
let invokeCirrhoticProbabilityChart = (dataArray, isInitialLoad) => {
    let baseData = [];

    if (!dataArray) {
        //baseData = riskDistributionData;
        baseData = riskDistributionData.filter((rec) => rec.liverBiopsy != 'Yes' && rec.cirrhosis != 'Yes' && rec.liverFailure != '1');
        //baseData = filteredData;
    } else {
        baseData = dataArray.filter((rec) => rec.liverBiopsy != 'Yes' && rec.cirrhosis != 'Yes' && rec.liverFailure != '1');
    }

    // logitModel.plotProbabilityChart('decisionTreeChartContent',baseData,isInitialLoad);
}

//Praveen 03/30/2017 add element for select option
let addSelectElementData = (data) => {

    let html = ``;
    for (let i = 0; i < data.length; i++) {
        html += `<option name="medication" value = "${data[i].fullName}">${data[i].fullName}</option>`;
    }
    $('.genotypeDistSelect').append(html);
    //$selectizeCombo = $('.genotypeDistSelect').selectize();
}


let renderCostRxBubbleChart = (container, data, key) => {

    if (data.length == 0) {
        fnNoDataFound('#' + container);
        return;
    }
    Highcharts.chart(container, {

        chart: {
            type: 'bubble',
            // plotBorderWidth: 1,
            zoomType: 'xy'
        },

        legend: {
            enabled: false
        },

        title: {
            text: ''
        },

        subtitle: {
            text: ''
        },

        xAxis: {
            gridLineWidth: 1,
            title: {
                text: 'Prescription Count'
            },
            labels: {
                format: '{value}'
            },
            // plotLines: [{
            //     color: 'black',
            //     dashStyle: 'dot',
            //     width: 2,
            //     value: 65,
            //     label: {
            //         rotation: 0,
            //         y: 15,
            //         style: {
            //             fontStyle: 'italic'
            //         },
            //         text: ''
            //     },
            //     zIndex: 3
            // }]
        },
        colors: customColorsArray(),
        yAxis: {
            startOnTick: false,
            endOnTick: false,
            title: {
                text: 'Cost per Prescription'
            },
            labels: {
                // format: '{value}',
                formatter: function() {
                    return '$' + Math.round(this.value / 1000) + 'k';
                }
            },
            credits: {
                enabled: false
            },
            maxPadding: 0.2,
            // plotLines: [{
            //     color: 'black',
            //     dashStyle: 'dot',
            //     width: 2,
            //     value: 50,
            //     label: {
            //         align: 'right',
            //         style: {
            //             fontStyle: 'italic'
            //         },
            //         text: '',
            //         x: -10
            //     },
            //     zIndex: 3
            // }]
        },
        tooltip: {
            useHTML: true,
            formatter: function() {
                return `<span>Medication</span>: <b>${this.point.fullName}</b><br/>
                    Patient Count:${commaSeperatedNumber(this.x)}<br/>Avg Cost:$${Math.round(this.y / 1000)}k<br/>`
            },
            followPointer: true
        },

        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                },
                showInLegend: true
            }
        },

        series: [{
            data: data
        }]

    });
}

//Praveen 03/30/2017 Added function to append html
let fnNoDataFound = (container) => $(container).html('<div class="nodataFound">No Data Available</div>');

//Praveen 03/31/2017 Add Prescription count table data
let addPrescriptionInformation = (baseData) => {

    let tableHeader = ``;
    tableHeader = `<div class="common-efd-row MainTitle">
                        <div class="common-efd-cell1">Medication</div>
                        <div class="common-efd-cell1">Prescription Count</div>
                        <div class="common-efd-cell1">Ingredient Cost</div>
                        <div class="common-efd-cell1">Cost Per Rx</div>
                  </div>`;
    let htmlRow = ``;
    //sort data by ingredient cost 
    baseData.sort((a, b) => b.ingredcost - a.ingredcost);
    for (let i = 0; i < baseData.length; i++) {
        let data = baseData[i];
        htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1">${data.fullName}</div>
                        <div class="common-efd-cell1">${commaSeperatedNumber(data.count)}</div>
                        <div class="common-efd-cell1" title="$${commaSeperatedNumber(data.y.toFixed(2))}">$${autoFormatCostValue(data.y)}</div>
                        <div class="common-efd-cell1">$${commaSeperatedNumber(data.costperrx.toFixed(0))}</div>
                    </div>`;
    }

    $('.prescriptionCount-rxCostTable').html(tableHeader + htmlRow);
}

//Praveen 3 April 2017 Added bar chart for ingredient cost and prescription 
let renderHighBarChart = (container, data) => {

    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: '' //label
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Medication'
            }
        },
        credits: {
            enabled: false
        },
        colors: customColorsArray(),
        legend: {
            enabled: false
        },
        yAxis: {
            title: {
                text: 'Ingredient Cost($)'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    // format: '{point.y:.0f}%',
                    formatter: function() {
                        return '$' + autoFormatCostValue(this.y); //Math.round(this.y)+"%";
                    }
                },
            }
        },

        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Medication</span>:{point.fullName}<br/> <span>Cost</span>:$ {point.y:,.2f}<br/>
                          Patient Count:{point.count:,0.0f}<br/>Total Patients:${commaSeperatedNumber(data.total)}`
        },

        series: [{
            name: '',
            colorByPoint: true,
            data: data.data
        }]
    });
}



//Jayesh 3 April 2017 Added market share over month chart
let renderMarketShareOverMonthsChart = (container, data, filterParam, isCompared = true) => {
    let marketShareOverMonthsChartData = [];
    // let colors = ['#17becf', '#2ca02c', '#d62728', '#ff7f0e', '#DDDF00', '#9467bd', '#1f77b4', '#e95a52', '#8c564b',
    //                 '#f1cb6a', '#e377c2', '#17becf','#000022']
    if (filterParam == 'ALL') {
        marketShareOverMonthsChartData = _.filter(data.marketShareOverMonthsChartData, (rec) => {
            return (rec.name.split('+').length == 1) || rec.name == 'Total Prescription';
        });
    } else {
        marketShareOverMonthsChartData = _.filter(data.marketShareOverMonthsChartData, (rec) => {
            return rec.name.includes(filterParam) || rec.name == 'Total Prescription';
        });
    }
    let i = 0,
        medicationPatientCount = 0,
        CombinedMedicationPatientCount = 0,
        totalPatientCount = 0;
    marketShareOverMonthsChartData = _.map(marketShareOverMonthsChartData, (rec) => {
        if (rec.name == filterParam) {
            medicationPatientCount += rec.totalPatientCount;
        } else if (rec.name.split('+').length != 1) {
            CombinedMedicationPatientCount += rec.totalPatientCount;
        } else {
            totalPatientCount += rec.totalPatientCount;
        }
        rec.color = mlSubTabsUtil.settingMedicationColor(rec.name); // colors[i];
        i = i == 12 ? 0 : i + 1;
        return rec;
    });

    if (data.totalPatient == 0) {
        fnNoDataFound(container);
        return;
    }

    if (isCompared) {
        if (filterParam != 'ALL') {
            let medicationPatientPercentage = parseFloat((medicationPatientCount / totalPatientCount) * 100).toFixed(2);
            let CombinedMedicationPatientPercentage = parseFloat((CombinedMedicationPatientCount / totalPatientCount) * 100).toFixed(2);
            $('#marketShareMedication').show();
            $('#marketShareMedication').html(`${filterParam} (N): ${commaSeperatedNumber(medicationPatientCount)} (${medicationPatientPercentage}%) and ${filterParam} VARIATION (N): ${commaSeperatedNumber(CombinedMedicationPatientCount)} (${CombinedMedicationPatientPercentage}%)`);
        } else {
            $('#marketShareMedication').hide();
        }
        //set patient count  
        $('#market-share-N').html(commaSeperatedNumber(data.totalPatient));
        $('#markerShareOverMonthsChart').html('');
    }
    // console.log(marketShareOverMonthsChartData, data)
    Highcharts.chart(container, {
        chart: {
            zoomType: 'x',
            height: isCompared == false ? 400 : 400
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        credits: {
            enabled: false
        },
        xAxis: [{
            categories: data.seriesCategoryArray,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value} %',
                // style: {
                //     //color: Highcharts.getOptions().colors[1]
                // }
            },
            title: {
                text: '% of Prescription',
                // style: {
                //     color: Highcharts.getOptions().colors[1]
                // }
            }
        }, { // Secondary yAxis
            title: {
                text: 'Count of Prescription',
                // style: {
                //     color: Highcharts.getOptions().colors[0]
                // }
            },
            labels: {
                format: '{value}',
                // style: {
                //     color: Highcharts.getOptions().colors[0]
                // }
            },
            opposite: true
        }],
        tooltip: {
            shared: true,
            useHTML: true,
            formatter: function() {
                let html = '<div class="customC3ToolTip">';
                html += '<div class="customC3ToolTip-Header">' +
                    '<div><span style="text-align:center;"><b>' + this.x + '</b></span></center></div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">';
                for (let i = 0; i < this.points.length; i++) {
                    if (this.points[i].series.name == 'Total Prescription') {
                        html += '<div style="text-align:left"><span style="color: ' + this.points[i].point.color + '">\u25CF</span> ' + this.points[i].series.name + ': ' + commaSeperatedNumber(this.points[i].point.y) + '</div>';
                        html += '<div style="text-align:left"><span style="color: ' + this.points[i].point.color + '">\u25CF</span> Patient Count: ' + commaSeperatedNumber(this.points[i].point.distinctPatientCount) + '</div><br>';
                    } else {
                        html += '<div style="text-align:left"><span style="color: ' + this.points[i].point.color + '">\u25CF</span> ' + this.points[i].series.name + ': ' + commaSeperatedNumber(this.points[i].point.patientCount) + ' (' + this.points[i].point.y + '%) </div>';
                    }
                }
                html += '</div>' +
                    '</div>';
                return html;
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            x: 0,
            verticalAlign: 'top',
            y: 0,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: marketShareOverMonthsChartData
    });
}



//function to fetch data fro secodary for comparison
let fetchSecondaryDataset = (params) => {

    params.database = getReverseSelectedDatabase(); //get database
    Meteor.call('getMarketViewChartData', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            AmdApp.RiskDistribution.compData = null;
        } else {
            let decompressed_object = LZString.decompress(result);
            marketViewData = JSON.parse(decompressed_object);
            AmdApp.RiskDistribution.compData = marketViewData;
            Meteor.call('getPrescriptionCountData', params, function(error1, result1) {
                if (error1) {
                    AmdApp.RiskDistribution.compDataQA = null;
                } else {
                    let decompressed_objectPrescriptionData = LZString.decompress(result1);
                    result1 = JSON.parse(decompressed_objectPrescriptionData);
                    AmdApp.RiskDistribution.compDataQA = result1;
                    $('.togglechartComparison').show();
                }
            });
        }
    });
}

let plotComparisionDataCharts = (plottingData, primaryData, secondaryData, diffplottingData) => {

    mlSubTabsUtil.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection',
        secondaryContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    //empty the containers
    $('#' + primaryContainer).empty();
    $('#' + secondaryContainer).empty();

    switch (plottingData) {

        case 'MarketShareOverMonthsChartData':
            chartTypeLabel = 'Market Share Over Months';
            let medication = $('#ddlMedicationMarketShare').val() || 'ALL';
            renderMarketShareOverMonthsChart(primaryContainer, primaryData, medication, false);
            renderMarketShareOverMonthsChart(secondaryContainer, secondaryData, medication, false);
            break;
        case 'costperrx':
            chartTypeLabel = 'Cost per Rx';
            renderCostRxBubbleChart(primaryContainer, primaryData, false);
            renderCostRxBubbleChart(secondaryContainer, secondaryData, false);
            break;
        case 'ingredicostpres':
            chartTypeLabel = 'Ingredient Cost by Prescription';
            renderHighBarChart(primaryContainer, primaryData, false);
            renderHighBarChart(secondaryContainer, secondaryData, false);
            break;
        case 'prescriptioCount':
            chartTypeLabel = 'Prescription Count';
            renderPredictionCountChartL(primaryContainer, primaryData, true);
            renderPredictionCountChartL(secondaryContainer, secondaryData, true);
            break;
        case 'ingredcost':
            chartTypeLabel = 'Ingredient Cost';
            renderIngredientCostChart(primaryContainer, primaryData, true);
            renderIngredientCostChart(secondaryContainer, secondaryData, true);
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}


let renderPredictionCountChartL = (container, baseData, isCompared) => {

    if (baseData.length <= 0 && isCompared) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#' + container).html(noDataHtml);
        return;
    }
    Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: 320,
            width: 550,
        },
        title: {
            text: ''
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>{point.name} Prescription Count: <b>{point.PrescriptionCount:,0.0f}</b><br>Total Prescription Count: <b>{point.TotalPrescription:,0.0f}</b>'
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    rotate: 0,
                    formatter: function() {
                        if (this.y > 4)
                            return Highcharts.numberFormat(this.y, 1) + '%';

                    },
                    style: {
                        fontWeight: '600',
                        fontSize: '11px',
                    }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'top',
            x: 10,
            y: 50,
            itemStyle: {
                fontSize: '11px',
                fontWeight: '300',
                color: '#666666'
            }
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseData
        }]
    });
}


let renderIngredientCostChart = (container, baseData, isCompared) => {
    if (baseData.length <= 0 && isCompared) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#' + container).html(noDataHtml);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: 320,
            width: 550,
        },
        title: {
            text: ''
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>Single {point.name} Prescription Cost: <b>${point.PCharge:,.2f}</b>'
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    rotate: 0,
                    formatter: function() {
                        if (this.y > 4)
                            return Highcharts.numberFormat(this.y, 1) + '%';

                    },
                    style: {
                        fontWeight: '600',
                        fontSize: '11px',
                    }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'top',
            x: 10,
            y: 50,
            itemStyle: {
                fontSize: '11px',
                fontWeight: '300',
                color: '#666666'
            }
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseData
        }]
    });
}