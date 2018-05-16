import {
    Template
} from 'meteor/templating';
import './treatmentPriority.html';
import * as mlSubTabsUtil from '../modelUtils.js';
import * as logitModel from '../../../../../lib/mlAlgos/logitModel.js';

let filterObjectsArray = [];
let filteredData = [];
let filtered = '';
let treatmentProirityData = [];
let suspectedCirrhosisData = [];
//variable used to display whole unque patient count before discarding unused data
let actualPatientCount=0;
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 26-May-2017
 * @desc: Used new method "getUniqueCount"(common.js) to get unique patient count 
 */

Template.TreatmentPriority.onCreated(function () {
    let self = this;
    this.loading = new ReactiveVar(true);

    //call the mysql publish for the cirrhosis cost model data
    //logitModel.callPublishForCostModel();

    this.autorun(function () {
        let params = getCurrentPopulationFilters();
        params['fdaCompliant'] = "all";
        executeTreatmentPriorityRender(params, self);
    });
});

Template.TreatmentPriority.rendered = function () {

    filterObjectsArray = [];
    treatmentProirityData = [];
    $('.headerbuttonFilesection').hide();
    selectizeProbabilityCombos();

    //Pram(03 Apr 17) : Added event for slider tweaks to show value
    $(document).on('input', '.WeightSliderDiv input[type="range"]', function (e) {
        let silderId = $(e.currentTarget).attr('id');
        let outputHtml = e.currentTarget.value;

        if (silderId == 'cirrhoticProb-Slider') {
            outputHtml += '%';
        } else {
            outputHtml += ' Months';
        }

        let output = $(e.currentTarget).next().next();
        output.html(outputHtml);
    });
}


Template.TreatmentPriority.helpers({
    'isLoading': function () {
        return Template.instance().loading.get();
    },
    'getGenotypeList': () => PatientsGenotypeList
});

Template.TreatmentPriority.events({
    'click .globalshowPatientpriorityoftreatment': function (event, template) {
        $('.treatPriorityPList-listMask').hide();
        $('.treatPriorityPList').show();
    },
    /**
     * Modified By : Yuvraj
     * date : 13th Feb 17
     * desc : We are no longer using date filters, So Filtering is not required.
     */
    'click .globalexportPatientpriorityoftreatment': function (event) {
        let baseData = _.clone(filteredData);
        // let treatmentData = mlSubTabsUtil.getFilteredDataOnDateCombos(baseData,filtered);
        mlSubTabsUtil.exportPatientsData(event.currentTarget, 'treatmentProirity', baseData);
    },
    /**
     * Modified By : Yuvraj
     * date : 13th Feb 17
     * desc : We are no longer using date filters, So else condition is not required.
     */
    'click .js-analytics-applyDateFilters': function (event, template, data) {
        if (data && data == 'refresh') {
            template.loading.set(true);
            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "all";
            executeTreatmentPriorityRender(params, template);
        }
        // else{
        //     filtered = 'true';
        //     filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(treatmentProirityData,filtered);
        //     mlSubTabsUtil.renderPatientsList(filteredData, "treatPriorityPList");
        //     renderFibrosisChart(filteredData);
        //    // suspectedCirrhosisData = mlSubTabsUtil.getFilteredDataOnDateCombos(suspectedCirrhosisData,filtered);
        //     invokesuspectedCirrhosisChartsPreparation(filteredData);
        //   }
        // // renderFibrosisChart(mlSubTabsUtil.getMLTabsData());
    },
    'click .close.mlTabs_closebtn': function (e) {
        $('.analyticsPatientsPopup').hide();
        $('.cirrhosisDecisionTree').hide();
        logitModel.setCustomPatientsData(null);
    },
    'click .commonPopupShowPatientIcon': function (event) {
        $('.cirrhosisDistributionPList').show();
    },

    'click .commonPopupSwitchPoplationIcon': function (event) {
        //  $('#Genotype').selectize()
        // show decisiontree popup
        $('#cirrhosisPredictionResultBox').hide();
        $('.cirrhosisDecisionTree').show();
        mlSubTabsUtil.renderDecisionTreeLabels(filteredData.length);
    },
    'click #btnCirrhosisPrediction': function (event) {
        $('#cirrhosisPredictionResultBox').hide();
        /*let featuredData =[];
        let sampleData={};
        let decisionTreeData = filteredData;
        sampleData.sample = {};
        let age = parseInt($('#rfage').val());
        if(age && typeof age === 'number')
        {
            // sampleData.sample.age = age;
            // featuredData.push("age");
            if (age >= 0 && age<= 17)
            {
                sampleData.sample.age = age;
                featuredData.push("age (0-17)");
                _.map(decisionTreeData, function(rec) {
                     rec["age (0-17)"] = (rec.age >= 0 && rec.age <= 17) ? true : false;
                     return rec;
                });
            }
            else if (age >= 18 && age <= 34)
            {
                sampleData.sample.age = age;
                featuredData.push("age (18-34)");
                _.map(decisionTreeData, function(rec) {
                     rec["age (18-34)"] = (rec.age >= 18 && rec.age <= 34) ? true : false;
                     return rec;
                });
            }
            else if (age >= 35 && age <= 50)
            {
                sampleData.sample.age = age;
                featuredData.push("age (35-50)");
                _.map(decisionTreeData, function(rec) {
                     rec["age (35-50)"] = (rec.age >= 35 && rec.age <= 50) ? true : false;
                     return rec;
                });
            }
            else if (age >= 51 && age <= 69)
            {
                sampleData.sample.age = age;
                featuredData.push("age (51-69)");
                _.map(decisionTreeData, function(rec) {
                     rec["age (51-69)"] = (rec.age >= 51 && rec.age <= 69) ? true : false;
                     return rec;
                });
            }
            else if (age >= 70)
            {
                sampleData.sample.age = age;
                featuredData.push("age (70+)");
                _.map(decisionTreeData, function(rec) {
                     rec["age (70+)"] = (rec.age >= 70) ? true : false;
                     return rec;
                });
            }
        }
         if($('input[name="rdAlcohol"]:checked').length > 0)
        {
            sampleData.sample.ALCOHOL = parseInt($('input[name="rdAlcohol"]').val());
            featuredData.push("ALCOHOL");
        }
         if($('input[name="rdRenal"]:checked').length > 0)
        {
            sampleData.sample.renalFailure = parseInt($('input[name="rdRenal"]').val());
            featuredData.push("renalFailure");
        }
        if($('input[name="rdMental"]:checked').length > 0)
        {
            sampleData.sample.mentalHealth = parseInt($('input[name="rdMental"]').val());
            featuredData.push("mentalHealth");
        }
        if($('input[name="rdHIV"]:checked').length > 0)
        {
            sampleData.sample.HIV = $('input[name="rdHIV"]').val();
            featuredData.push("HIV");
        }
        if(featuredData.length > 0)
        {
            sampleData.featured = featuredData;
            mlSubTabsUtil.renderDecisionTreePopup(decisionTreeData, sampleData,"cirrhosisPredictionResultMessage");
        } */


        /*
            Author: Pramveer
            Changed the decision tree algorithm to logistics regression model
        */

        predictForCustomPatient();

    },
    'click #commonPopupSwitchDecisionTree': function (event) {
        //console.log("POPUP DECIION")
        let baseData = _.filter(treatmentProirityData, (rec) => {
            return (rec.labs_apri != null && rec.AssessmentLiverDisease != null && rec.meldScore != null)
        });

        logitModel.plotProbabilityChart('decisionTreeChartContent', baseData);

        $('#decisionTreeContent').show();
        $('#commonPopupSwitchBack').show();
        $('.analyticsCommonPopupPatientContent').hide();
    },
    'click #interventionBack': function (event) {
        $('#interventionBack').hide();
        $('#interventionChartContent').hide();
        $('#tippingPointChartContent').show();

    },
    'click #commonPopupSwitchBack': function (event) {
        $('#decisionTreeContent').hide();
        $('#commonPopupSwitchBack').hide();
        $('.analyticsCommonPopupPatientContent').show();
    },
    'change .hltrec_radio': (event, template) => {
        //predict & plot probability for custom patient
        //predictForCustomPatient();
    },
    'change .probFeaturesDropDown select': (event, template) => {
        //predict & plot probability for custom patient
        //predictForCustomPatient();
    },
    'input .hltrec_txtfld': (event, template) => {

        //Pram (12th May 17) : Removed the reactivity feature for custom patient prediction
        return false;

        //predict & plot probability for custom patient
        //let id = event.currentTarget.id;

        /**
         * @author: Pramveer
         * @date: 16th Feb 17
         * @desc: check if values in age,apri and meld score fields are valid.
         */
        /*switch (id) {
            case 'rfage':
                let age = parseInt($('#rfage').val());
                if (age > 0 && age < 100) {
                    predictForCustomPatient();
                } else {
                    return false;
                }
                break;

            case 'rdINR':
                let inr = parseFloat($('#rdINR').val());
                if (inr > 0 && inr <= 29) {
                    predictForCustomPatient();
                } else {
                    return false;
                }
                break;

            case 'rdplatelet':
                let platelet_count = parseFloat($('#rdplatelet').val());
                if (platelet_count > -9 && platelet_count <= 93) {
                    predictForCustomPatient();
                } else {
                    return false;
                }
                break;

            case 'rdbilirubin':
                let bilirubin = parseFloat($('#rdbilirubin').val());
                if (bilirubin > -9 && bilirubin <= 93) {
                    predictForCustomPatient();
                } else {
                    return false;
                }
                break;


            case 'rdCreatinine':
                let rdCreatinine = parseFloat($('#rdCreatinine').val());
                if (rdCreatinine > -9 && rdCreatinine <= 93) {
                    predictForCustomPatient();
                } else {
                    return false;
                }
                break;

            default:
                predictForCustomPatient();
                break;

        } */
    },
    'change #cirrhoticProb-Slider': (event, template) => {
        let sliderVal = $(event.currentTarget).val();
        sliderVal = parseFloat(sliderVal);

        //show the % value on the slider output
        let output = $(event.currentTarget).next().next();
        output.html(sliderVal + "%");

        logitModel.setProbRangeSliderValue(sliderVal);

        invokeCirrhoticProbabilityChart();
    },


    /**
     * @author: Pramveer
     * @date: 23rd Feb 17
     * @desc: commented change event of time slider for now.
     */
    'change #cirrhoticTime-Slider': (event, template) => {
        let sliderVal = $(event.currentTarget).val();
        sliderVal = parseFloat(sliderVal);

        //show the % value on the slider output
        let output = $(event.currentTarget).next().next();
        output.html(sliderVal + " Months");

        logitModel.setTimeRangeSliderValue(sliderVal);

        invokeCirrhoticProbabilityChart();
    },

    /**
     * @author: Pramveer
     * @date: 3rd Mar 17
     * @desc: Click event for the add patient button
     */
    'click .js-addCustomPatientBtn': (event, template) => {
        //hide the default patient section
        $('.defaultPredictionSection').hide();

        //show the custom patient section
        $('.customPatientPredictionSection').show();
    },

    /**
     * @author: Pramveer
     * @date: 6th Mar 17
     * @desc: click event to hide the custom patient section
     */
    'click .js-hideCustomPatientSectionBtn': (event, template) => {
        //hide the custom patient section
        $('.customPatientPredictionSection').hide();

        //show the default patient section
        $('.defaultPredictionSection').show();
    },

    /**
     * @author: Pramveer
     * @date: 11th May 17
     * @desc: click event to remove the custom patient section
     */
    'click .js-removeCustomPatients': (event, template) => {
        $('.js-hideCustomPatientSectionBtn').trigger('click');
        logitModel.removeCustomPatients();
        //plot the chart & make the time slider value to initial
        invokeCirrhoticProbabilityChart(null, true);
        $('.removeCustomPatientsWrapper').hide();
        $('#cirrhosisPredictionResultMessage').hide();
    },
    /**
     * @author: Pramveer
     * @date: 11th May 17
     * @desc: click event to remove the custom patient section
     */
    'click .js-predictCustomPatientBtn': (event, template) => {
        //predict & plot probability for custom patient
        predictForCustomPatient();
    },
    /**
     * @author: Pramveer
     * @date: 15th May 17
     * @desc: Click event to close the overlap patients popup
     */
    'click #cirrhosis-probabilityPopupChartWrapper .popup-close': () => {
        $('#cirrhosis-probabilityPopupChartWrapper').hide();
    }

});

/*
 * @Author : Pram (13th Feb 17)
 * @Desc : Init the selectize combos
 */
//function to invoke selectize
let selectizeProbabilityCombos = () => {
    // Race combo
    //removed this feature Praveen 03/16/2017
    //$('.rdRaceCombo').selectize();

    // Gender Combo
    $('.rdGenderCombo').selectize();

    // fib stage combo
    // Praveen 03/16/2017 Commented not used
    //$('.rdFibStageCombo').selectize();

    //alcohol combo
    // Praveen 03/16/2017 Commented not used
    //$('.alcoholCombo').selectize();

    //renal combo
    //$('.renalCombo').selectize();

    //mental combo
    //$('.mentalCombo').selectize();

    //hiv combo
    //$('.hivCombo').selectize();

    //liver assessment combo
    //$('.liverAssessmentCombo').selectize();

    //cost combo
    //$('.rdCostCombo').selectize();

    //age combo
    $('.rfage').selectize();

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
    patientDataObj.AGE = parseInt($('#rfage').val());
    //patientDataObj.RACE_DESC = parseInt($('.rdRaceCombo').val());
    //patientDataObj.FibrosureStage = parseInt($('.rdFibStageCombo').val());
    //Praveen 03/16/2017 Added new feature platelet bilirubin,cretinine
    patientDataObj.INR_VALUE = parseFloat($('#rdINR').val());
    patientDataObj.PLATELET_COUNT = parseFloat($('#rdplatelet').val());
    patientDataObj.BILIRUBIN = parseFloat($('#rdbilirubin').val());
    patientDataObj.CREATININE = parseFloat($('#rdCreatinine').val());
    //patientDataObj.HIV = parseInt($('.hivCombo').val());
    //patientDataObj.MENTAL_HEALTH = parseInt($('.mentalCombo').val());
    //patientDataObj.RENAL_FAILURE = parseInt($('.renalCombo').val());
    //patientDataObj.LIVER_ASSESMENT = parseInt($('.liverAssessmentCombo').val());
    patientDataObj.AST = parseFloat($('#rfast').val());
    patientDataObj.ALT = parseFloat($('#rfalt').val());
    patientDataObj.COST_NOW = parseFloat($('.rdCostCombo').val());


    //console.log(logitModel.getFeaturesWeight());
    let prob = logitModel.predictCirrhoticProbability(patientDataObj);
    if (Math.round((prob * 100).toFixed(2)) > 0) {

        logitModel.setCustomPatientsData(patientDataObj);
        //plot the patient on the chart
        invokeCirrhoticProbabilityChart();

        $('.removeCustomPatientsWrapper').show();

    }

    $('#cirrhosisPredictionResultMessage').html(`Selected custom patient has ${(prob*100).toFixed(2)}% risk of cirrhosis from above criteria`);
    $('#cirrhosisPredictionResultMessage').show();


}


let executeTreatmentPriorityRender = (params, tempateObj) => {
    logitModel.setCustomPatientsData(null);
    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }
    //params.medicationArray = null;
    Meteor.call('getTreatmentPriorityTabsData', params, (error, result) => {
        if (error) {
            console.log(error);
            tempateObj.loading.set(false);
        } else {
            tempateObj.loading.set(false);
            mlSubTabsUtil.showChartLoading();
            setTimeout(function () {
                // suspectedCirrhosisData = result;                              

                treatmentProirityData = result;
               // console.log(treatmentProirityData);
                actualPatientCount=getUniqueCount(treatmentProirityData,"patientId");
                // invokesuspectedCirrhosisChartsPreparation(suspectedCirrhosisData);
                //filter irrelevant data
                treatmentProirityData = treatmentProirityData.filter((d) => !isNaN(parseFloat(d.fibro_Value)));

                // Modified By Yuvraj (13th Feb 17) -  We are no longer using date filters.
                // filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(treatmentProirityData,filtered);
                filteredData = treatmentProirityData;
                mlSubTabsUtil.renderPatientsList(filteredData, "treatPriorityPList");
                renderFibrosisChart(filteredData);

                logitModel.setProbRangeSliderValue(null);
                logitModel.setTimeRangeSliderValue(null);

                //Pram(10th Feb 17) Commented to hide the suspected cirrhois chart
                //invokesuspectedCirrhosisChartsPreparation(filteredData);
                invokeCirrhoticProbabilityChart(filteredData, true);

                //Pram (15th Feb 17) render the APRI chart as it now merged in this tab
                renderDiseaseProgressionCharts(filteredData);

                //initialize the selectize count
                selectizeProbabilityCombos();

                mlSubTabsUtil.hideChartLoading();

                logitModel.appendAccuracyScore('cirrhosisModel-ModelStatsValue');


            }, 300);
        }
    });
}

//function to invoke the cirrhotic model chart
let invokeCirrhoticProbabilityChart = (dataArray, isInitialLoad) => {
    let baseData = [];

    if (!dataArray) {
        baseData = filteredData;
    } else {
        baseData = dataArray;
    }

    /**
     * @author: Pramveer
     * @date: 16-May-2017
     * @desc: Since single patient is having multiple medications they row for the patients are more 
     * and hence the data like patientID, age & labs data are being repeated resulting in overlap. 
     * Fixed that issue by grouping patients data by patient and took first record only
     */
    let grpData = _.groupBy(baseData, 'patientId');
    let newData = [];

    for (let pid in grpData) {
        let pdata = grpData[pid];

        newData.push(pdata[0]);
    }

    baseData = newData;

    /**
     * @author: Arvind
     * @reviewer:
     * @date: 15-March-2017
     * @desc: Added more filter condition for new test labs 'labs_total_bilirubin,labs_creatinine,labs_platelet_count,labs_inr'
     *  and also added filter for 'cirrhosis'
     */
    //console.log("Before filter base records");
    //console.log(baseData.length);
    baseData = _.filter(baseData, (rec) => {
        return (
            // Commented by Arvind
            rec.cirrhosis.toLowerCase() === 'no' &&
            rec.labs_apri != null &&
            //rec.AssessmentLiverDisease != null && // Commented by Arvind

            rec.meldScore != null &&
            rec.labs_alt != null &&
            rec.labs_ast.trim() != '' &&
            rec.labs_ast != null &&
            rec.labs_alt.trim() != '' &&
            rec.labs_total_bilirubin != null && rec.labs_total_bilirubin.trim() != '' &&
            rec.labs_creatinine != null && rec.labs_creatinine.trim() != '' &&
            rec.labs_platelet_count != null &&
            rec.labs_inr != null
            // && rec.cirrhosis.trim() != 'Yes'
        )
    });
    
$("#tippingPointChartContent-N").html(getHTMLCustomTextN(getUniqueCount(baseData, "patientId"),actualPatientCount, "Patient With ALT, AST, CREATININE ,PLATELET, BILIRUBIN, INR lab data"));

$("#decisionTreeChartContent-N").html(getHTMLCustomTextN(getUniqueCount(baseData, "patientId"),actualPatientCount,"Patient With ALT, AST, CREATININE ,PLATELET, BILIRUBIN, INR lab data"));


    //// For PHS Specific is isNaN(age) is true then need to calculate age from age range and need to update for all records
    let isValidAge = baseData && baseData.length > 0 && !isNaN(baseData[0].age);
    let ageRange = '';

    if (!isValidAge) {
        baseData = _.map(baseData, (rec) => {
            //calculate average/medican cost from age range and convert it into integer
            rec.age = parseInt(rec.age.split(" - ").reduce(function (a, b) {
                return parseInt(a) + parseInt(b);
            }) / 2);

            return rec;
        });
    }
    //console.log("after filter base records");
    //console.log(baseData.length);
    // logitModel.plotProbabilityChart('decisionTreeChartContent', baseData, isInitialLoad);
    /**
     * @author: Arvind
     * @reviewer: 
     * @date: 12-Apr-2017
     * @desc: used same method for rendering tipping point chart
     */
    $('#interventionBack').hide();
    $('#interventionChartContent').hide();
    $('#tippingPointChartContent').show();
    //console.log(baseData);
    logitModel.plotProbabilityChartExtension({
        container: 'decisionTreeChartContent',
        baseData: baseData,
        isInitialLoad: isInitialLoad,
        modelName: ""
    });
    logitModel.plotProbabilityChartExtension({
        container: 'tippingPointChartContent',
        baseData: baseData,
        isInitialLoad: isInitialLoad,
        modelName: "tipping-point"
    });
}

function renderFibrosisChart(patientsData, flag) {

    //Praveen 02/20/2017 commmon cohort
    setCohortPatientCount({
        patientCount: actualPatientCount
    });
    //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(patientsData.length));

    let cirrhoticData = _.where(patientsData, {
        cirrhosis: "Yes"
    });
    let nonCirrhoticData = _.where(patientsData, {
        cirrhosis: "No"
    });

$("#analyticsChartDiseaseProgression-N").html(getHTMLCustomTextN(getUniqueCount(patientsData, "patientId"),actualPatientCount, "Patient With Fibrosure lab"));

$("#analyticsChartDiseaseProgressionpie-N").html(getHTMLCustomTextN(getUniqueCount(patientsData, "patientId"),actualPatientCount, "Patient With Fibrosure lab"));

$("#treatPriority-fibroChart-N").html(getHTMLCustomTextN(getUniqueCount(patientsData, "patientId"),actualPatientCount, "Patient With Fibrosure lab"));


    let cirrhoticChartData = prepareFibrosisData(cirrhoticData, flag),
        container = '#treatPriority-fibroChart';

    //data modification for high charts
    cirrhoticChartData = _.sortBy(cirrhoticChartData, 'stage');
    cirrhoticSeriesData = _.pluck(cirrhoticChartData, 'patientCount'),
        cirrhoticColorArray = _.pluck(cirrhoticChartData, 'color');



    let nonCirrhoticChartData = prepareFibrosisData(nonCirrhoticData, flag);

    //data modification for high charts
    nonCirrhoticChartData = _.sortBy(nonCirrhoticChartData, 'stage');
    nonCirrhoticSeriesData = _.pluck(nonCirrhoticChartData, 'patientCount'),
        nonCirrhoticColorArray = _.pluck(nonCirrhoticChartData, 'color');

    let stages = [0, 1, 2, 3, 4];
    if (flag) {
        stages = [];
        stages.push(_.pluck(nonCirrhoticChartData, 'stage'));
        stages.push(_.pluck(cirrhoticChartData, 'stage'));
        stages = _.uniq(_.flatten(stages));
    }



    let seriesData = [{
            name: 'Cirrhosis',
            data: cirrhoticSeriesData,
            stack: 'Cirrosis',
            dataLabels: {
                enabled: true,
                rotation: 0,
                x: 0,
                y: 0
            },
            colors: cirrhoticColorArray
        },
        {
            name: 'Non Cirrhosis',
            data: nonCirrhoticSeriesData,
            stack: 'Non Cirrosis',
            dataLabels: {
                enabled: true,
                rotation: 0,
                x: 0,
                y: 0
            },
            colors: ["#2e7e97"]
        }
    ];

    Highcharts.chart('treatPriority-fibroChart', {
        chart: {
            type: 'column',
            height: 400,
            width: 800,
            zoomType: 'y'
            //margin: [ 50, 50, 100, 80]
        },
        plotOptions: {
            column: {
                colorByPoint: true
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            /**
                             * @author: Arvind
                             * @reviewer: 
                             * @date: 26-May-2017
                             * @desc: Commented drill down because it doesn't make sense for this charts
                            */
                            // // let filterData = chartData[this.x];
                            // // let dataObj = {};
                            // // dataObj['id'] = filterData.range;
                            // // filterChartByData(dataObj, 'fibroValue');
                           
                            
                            // let isCirrhotic = this.series.name == 'Cirrhosis';
                            // let dataObj = {};
                            // if (isCirrhotic) {
                            //      console.log(cirrhoticChartData);
                            //     let filterData = cirrhoticChartData[this.x];
                            //     dataObj['id'] = filterData.range;
                            //     filterChartByData(dataObj, 'fibroValue');
                            // } else {
                            //     console.log(nonCirrhoticChartData);
                            //     let filterData = nonCirrhoticChartData[this.x];
                            //     dataObj['id'] = filterData.range;
                            //     filterChartByData(dataObj, 'fibroValue');
                            // }



                        }
                    }
                },
                colorByPoint: true
            }
        },
        credits: {
            enabled: false
        },
        // colors: cirrhoticColorArray,
        title: {
            text: ''
        },
        subtitle: {
            text: 'Click and drag to zoom in.'
        },
        xAxis: {
            categories: stages,
            title: {
                text: '<b>Est Fib-4</b>'
            },
            labels: {
                rotation: 0,
                formatter: function () {
                    return `Stage ${this.value}`;
                },
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: '<b>Patient Count</b>'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function () {

                return `<div style="text-align:center; width: 100px;">${this.series.name}</div><br/>
                        <div>Stage: ${this.x}</div><br/>
                        <div>Patient Count: ${this.y}</div>`;
            }
        },
        series: seriesData
    });
}

function prepareFibrosisData(patientsData, flag) {
    let chartData = [];


    let groupedData = _.groupBy(patientsData, function (rec) {
        let fibroValue = parseFloat(rec.fibro_Value).toFixed(2);

        if (fibroValue >= 0 && fibroValue <= 0.21)
            return "0";
        if (fibroValue >= 0.22 && fibroValue <= 0.31)
            return "1";
        if (fibroValue >= 0.32 && fibroValue <= 0.58)
            return "2";
        if (fibroValue >= 0.59 && fibroValue <= 0.73)
            return "3";
        if (fibroValue >= 0.74)
            return "4";
    });


    //prepare chart data
    // for (let keys in groupedData) {
    if (flag) {
        for (let keys in groupedData) {
            // for (let keys = 0; keys < 5; keys++) {
            let json = {},
                pData = groupedData[keys],
                fibroValues = [];

            if (pData) {
                for (let j = 0; j < pData.length; j++) {
                    if (pData[j]['fibro_Value'] == null)
                        fibroValues.push(0);
                    else
                        fibroValues.push(pData[j]['fibro_Value']);
                }
            } else {
                fibroValues.push(0);
                pData = [];
            }

            // if(!parseFloat(keys))
            //     continue;

            json['stage'] = parseFloat(keys);
            json['range'] = getRangeForStage(parseFloat(keys));
            json['avgFibrosis'] = parseFloat(fibroValues.average()).toFixed(2);
            //json['patientCount'] = pData.length;
            //json['total'] = patientsData.length;
            json['patientCount'] = getUniqueCount(pData, "patientId");
            json['total'] = getUniqueCount(patientsData, "patientId");
            json['color'] = getStageColor(parseFloat(keys));
            chartData.push(json);
        }
    } else {
        for (let keys = 0; keys < 5; keys++) {
            let json = {},
                pData = groupedData[keys],
                fibroValues = [];

            if (pData) {
                for (let j = 0; j < pData.length; j++) {
                    if (pData[j]['fibro_Value'] == null)
                        fibroValues.push(0);
                    else
                        fibroValues.push(pData[j]['fibro_Value']);
                }
            } else {
                fibroValues.push(0);
                pData = [];
            }

            // if(!parseFloat(keys))
            //     continue;

            json['stage'] = parseFloat(keys);
            json['range'] = getRangeForStage(parseFloat(keys));
            json['avgFibrosis'] = parseFloat(fibroValues.average()).toFixed(2);
            // json['patientCount'] = pData.length;
            // json['total'] = patientsData.length;
            json['patientCount'] = getUniqueCount(pData, "patientId");
            json['total'] = getUniqueCount(patientsData, "patientId");
            json['color'] = getStageColor(parseFloat(keys));
            chartData.push(json);
        }
    }


    function getRangeForStage(stage) {
        let stageStore = [{
                stage: 0,
                range: '0-0.21'
            },
            {
                stage: 1,
                range: '0.22-0.31'
            },
            {
                stage: 2,
                range: '0.32-0.58'
            },
            {
                stage: 3,
                range: '0.59-0.73'
            },
            {
                stage: 4,
                range: '0.74+'
            },
        ];

        let filterStage = _.where(stageStore, {
            stage: stage
        })[0];
        return filterStage ? filterStage.range : '';
    }

    function getStageColor(stage) {
        let colorArray = ['#abd6ba', '#abd6ba', '#abd6ba', '#e95a52', '#e95a52'];
        return colorArray[stage];
    }

    // console.log('************Chart Data************');
    // console.log(chartData);
    return chartData;
}

function filterChartByData(dataKey, filterKey) {
    let isAlreadyFiltered = mlSubTabsUtil.checkFilterExists(filterKey, filterObjectsArray);

    if (isAlreadyFiltered)
        return;

    $('.customC3ToolTip').hide();
    filterObjectsArray = mlSubTabsUtil.getClickFilterObj(dataKey, filterKey, filterObjectsArray);
    renderChartsWithFilteredData(true);
}

function addBreadsCrums(breadCrumsData) {
    let parentWrapper = 'treatPriority-Crums';
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

    setTimeout(function () {
        $('.js-dashboard-clearFilter').on('click', function () {
            deleteBreadCrum($(this));
        });

        $('.js-dashboard-clearAll').on('click', function () {
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
        $('.treatPriority-Crums').empty();
    }
    renderChartsWithFilteredData();
}

function renderChartsWithFilteredData(flag) {
    let modifiedData = _.clone(filteredData);

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

    // Modified By Yuvraj (13th Feb 17) -  We are no longer using date filters.
    // modifiedData = mlSubTabsUtil.getFilteredDataOnDateCombos(modifiedData,filtered);
    $('.treatmentProirity-totalPatients').html(commaSeperatedNumber(modifiedData.length));
    renderFibrosisChart(modifiedData, flag);

    //Pram(10th Feb 17) Commented to hide the suspected cirrhois chart
    //invokesuspectedCirrhosisChartsPreparation(modifiedData);
    invokeCirrhoticProbabilityChart(modifiedData);

    mlSubTabsUtil.renderPatientsList(modifiedData, 'treatPriorityPList', true);
    mlSubTabsUtil.hideChartLoading();
}



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
                    drilldown: function (e) {
                        this.setTitle({
                            text: e.point.name
                        }, {
                            text: ''
                        });
                        if (e.point.name != '') {
                            // Modified By Yuvraj (13th Feb 17) -  We are no longer using date filters.
                            // let filterdDataDrilldown = mlSubTabsUtil.getFilteredDataOnDateCombos(treatmentProirityData,filtered);
                            let filterdDataDrilldown = treatmentProirityData;
                            let fibrostages = _.groupBy(filterdDataDrilldown, 'FibrosureStage');
                            mlSubTabsUtil.renderPatientsList(fibrostages[parseInt(e.point.name.replace('F', ''))], 'cirrhosisDistributionPList');
                            $(".commonPopupShowPatientIcon").show();
                        }
                    },
                    drillup: function (e) {
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
            tooltip: {
                valueSuffix: ' '
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {

                            if (this.point.patientPercentage) {
                                return this.point.patientPercentage + ' %';
                            }

                        },
                    }
                }
                // column: {
                //     stacking: 'normal',
                // dataLabels: {
                //     enabled: true,
                //     formatter: function() {
                //
                //         if (this.point.patientPercentage) {
                //             return this.point.patientPercentage + ' %';
                //         }
                //
                // },
                // borderWidth: 0,
                // allowOverlap: true,
                // style: {
                //     fontWeight: '300',
                //     fontSize: '11px',
                //     shadow: false,
                //     textShadow: false
                //
                // }
                //}
                //}

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

                formatter: function () {
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


/**
 * @author: Pramveer (15th Feb 17)
 * @desc: functions for the disease prediction (APRI) tab as it is now merged in this tab
 */
//render disease progression charts
let renderDiseaseProgressionCharts = (mainData) => {

    //filter for null APRI
    let baseData = _.filter(treatmentProirityData, (rec) => {
        return (rec.labs_apri != null && rec.AssessmentLiverDisease != null && rec.meldScore != null)
    });

    //group data basedon disease progression
    let diseaseProgressionGroupedData = _.groupBy(mainData, 'disease_progression');
    let chartData = [];
    let pieChartData = [];
    let colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'];
    if (mainData.length > 0) {
        let datakeys = Object.keys(mainData[0]).filter((d1) => d1.indexOf('labs') > -1);
        let keys = datakeys.map((key) => key.replace('labs_', '').split('_').join(' ').toUpperCase());
        let colorindex = 0;
        // //set totalpatient count
        // $('.apriGreaterPatients').html(commaSeperatedNumber(diseaseProgressionGroupedData['Y'].length));
        // $('.apriLessPatients').html(commaSeperatedNumber(diseaseProgressionGroupedData['N'].length));//set totalpatient count
        let YProgressionData = diseaseProgressionGroupedData['Y'] == undefined ? 0 : getUniqueCount(diseaseProgressionGroupedData['Y'],"patientId");
        $('.apriGreaterPatients').html(commaSeperatedNumber(YProgressionData));
        let NProgressionData = diseaseProgressionGroupedData['N'] == undefined ? 0 : getUniqueCount(diseaseProgressionGroupedData['N'],"patientId");
        $('.apriLessPatients').html(commaSeperatedNumber(NProgressionData));

        //Praveen 02/20/2017 commmon cohort
        // setCohortPatientCount({
        //     patientCount: mainData.length
        // });
        // setCohortPatientCount({
        //     patientCount: getUniqueCount(mainData, "patientId")
        // });
        //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(mainData.length))
        //prepare data for charts
        for (let key in diseaseProgressionGroupedData) {
            let jsonpi = {}; //for pi  chart
            let json = {}; //for bar chart
            json['type'] = 'column';
            json['name'] = key == 'Y' ? 'APRI > 1' : 'APRI < 1';
            jsonpi['name'] = key == 'Y' ? 'APRI > 1' : 'APRI < 1';
            let tempdata = diseaseProgressionGroupedData[key];
          //  jsonpi['y'] = tempdata.length;
            jsonpi['y'] =getUniqueCount(tempdata,"patientId");
            jsonpi['color'] = key == 'Y' ? '#e95a52' : '#2e7e97'; //colors[colorindex];
            json['color'] = key == 'Y' ? '#e95a52' : '#2e7e97';
            json['data'] = [];
            let labDataIndi = [];
            colorindex += 1;
            for (let i = 0; i < datakeys.length; i++) {
                let tmpkey = datakeys[i];
                let sum = [];
                let total_patients = 0;
                for (let j = 0; j < tempdata.length; j++) {
                    if (tempdata[j] != void 0 && tempdata[j][tmpkey] != '' && tempdata[j][tmpkey] != null) {
                        sum.push(parseFloat(tempdata[j][tmpkey]));
                        total_patients += 1;
                    }
                }
                //get medican of data
                let medicantmpkey = calculate_median(sum);
                labDataIndi.push({
                    y: isNaN(medicantmpkey) ? 0 : Math.round(medicantmpkey, 3),
                    total: total_patients
                });
            }
            json['data'] = labDataIndi;
            chartData.push(json);
            pieChartData.push(jsonpi);
        }

        //render pie chartData
        renderDiseaseprogressionpiechart(pieChartData);

        //render chart
        Highcharts.chart('analyticsChartDiseaseProgression', {
            chart: {
                height: 450
            },
            title: {
                text: ''
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{y}',
                        style: {
                            fontWeight: '300',
                            fontSize: '10px',
                        }
                    }
                }
            },
            xAxis: {
                categories: keys
            },
            credits: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: 'Median Value Score'
                }
            },
            colors: colors,
            tooltip: {
                useHTML: true,
                headerFormat: '<div class="">',
                pointFormat: `<div class="">
                            <div>{point.name}</div>
                            </div><div class="">
                            <div> {point.series.name}:{point.y}</div>
                            </div>`,
                footerFormat: '</div>',
                followPointer: false,
                hideDelay: 30
            },
            series: chartData
        });
        mlSubTabsUtil.hideChartLoading();

    }

}

let renderDiseaseprogressionpiechart = (chartData) => {

    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
    Highcharts.chart('analyticsChartDiseaseProgressionpie', {
        chart: {
            height: 445,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<div class="">',
            pointFormat: `<div class="">
                                <div>{point.name}</div>
                                </div><div class="">
                                <div>Patient Count:{point.y:,.0f}</div>
                                </div>`,
            footerFormat: '</div>',
            followPointer: false,
            hideDelay: 30
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
                    format: '{point.name} <br /> {point.percentage:.1f} %',
                },
                point: {
                    events: {
                        click: function () {
                            let filterData = chartData[this.colorIndex];
                            let dataObj = {};
                            //filter by gender
                            //dataObj['id'] = this.category;
                            //filterChartByData(dataObj, 'APRI');
                        }
                    }
                }
            }
        },
        series: [{
            data: chartData,
            items: null
        }]
    });

    mlSubTabsUtil.hideChartLoading();
}

//function to calculate median value
let calculate_median = (array_name) => {
    array_name.sort();
    let len = array_name.length;
    //check if length of array is 1
    if (len == 1) {
        return array_name[0];
    }
    if (len == 0) {
        return 0;
    }
    if (len == 2) {
        return (array_name[0] + array_name[1]) / 2;
    }
    if (len % 2 === 0) {
        return (array_name[len / 2] + array_name[(len / 2) + 1]) / 2;
    } else {
        return (array_name[(len + 1) / 2]);
    }
}

/**
 * Functions for APRI Tab ends
 */