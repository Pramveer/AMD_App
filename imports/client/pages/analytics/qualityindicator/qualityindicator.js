import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './qualityindicator.html';
import * as analyticsLib from '../analyticsLib.js';


AmdApp.qualityIndicattor = {};
Template.QualityIndicator.onCreated(function() {
    var self = this;
    this.loading = new ReactiveVar(false);
    this.noData = new ReactiveVar(false);

    let params = getCurrentPopulationFilters();
    currentDataset = params.database;
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });

    self.loading.set(true);
    executeQualityIndicatorRender(params, self);
});

let reTreatedPatientData = [];
let ComparisonPatientData = [];
let respondersOrNot = '';
let hepatitsPatients = '';
let hepatitsPatientsData = [];
Template.QualityIndicator.rendered = function() {
    document.getElementById("anim_loading_theme").style.visibility = "hidden";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("anim_loading_theme").style.top = "40%";

    //hide export button
    $('.headerbuttonFilesection').hide();

}

Template.QualityIndicator.destroyed = function() {
    //localStorage.removeItem("efficacyChartData");
}

Template.QualityIndicator.events({

    'click .qualityindicator li': (event, template, data) => {
        if (data && data == 'refresh') {
            let params = getCurrentPopulationFilters();
            template.loading.set(true);
            executeQualityIndicatorRender(params, template);
        }
    },

    'change #optionSelectionQuality .radioduration': function(e) {
        let chartData = reTreatedPatientData.data;
        // console.log(chartData)
        if (e.target.value == "genotype") {
            //render genotype  chart
            renderRelapsedPatientChartskey('retreatedPatientQualityIndicator', chartData.genotype, 'Genotype');
        } else if (e.target.value == "race") {
            //render race chart
            renderRelapsedPatientChartskey('retreatedPatientQualityIndicator', chartData.race, 'Race');
        } else if (e.target.value == "cirrhosis") {
            renderRelapsedPatientChartskey('retreatedPatientQualityIndicator', chartData.cirrhosis, 'Cirrhosis');
        } else if (e.target.value == "gender") {
            renderRelapsedPatientChartskey('retreatedPatientQualityIndicator', chartData.gender, 'Gender');
        } else if (e.target.value == "medication") {
            renderRelapsedPatientChartskey('retreatedPatientQualityIndicator', chartData.medication, 'Medication', 'stack');
        }
    },
    'change #optionSelectionQualitysvr12 .radioduration': function(e) {
        let chartData = reTreatedPatientData.data.dataSVR12;
        // console.log(chartData)
        if (e.target.value == "genotype") {
            //render genotype  chart
            renderRelapsedPatientChartskey('svr12PatientQualityIndicator', chartData.genotype, 'Genotype');
        } else if (e.target.value == "race") {
            //render race chart
            renderRelapsedPatientChartskey('svr12PatientQualityIndicator', chartData.race, 'Race');
        } else if (e.target.value == "cirrhosis") {
            renderRelapsedPatientChartskey('svr12PatientQualityIndicator', chartData.cirrhosis, 'Cirrhosis');
        } else if (e.target.value == "gender") {
            renderRelapsedPatientChartskey('svr12PatientQualityIndicator', chartData.gender, 'Gender');
        } else if (e.target.value == "medication") {
            renderRelapsedPatientChartskey('svr12PatientQualityIndicator', chartData.medication, 'Medication', 'stack');
        }
    },
    'change #optionSelectionQualityComparisn .radioduration': function(e) {
        let chartData = ComparisonPatientData.comparisonChart;
        // console.log(chartData);
        //check for responders or not;
        let key = respondersOrNot;
        if (e.target.value == "genotype") {
            //render genotype  chart
            renderComparisonPatientChartskey('ComparisnPatientQualityIndicator', chartData.genotype[key].data, chartData.genotype[key].keys, 'Genotype');
        } else if (e.target.value == "race") {
            //render race chart
            renderComparisonPatientChartskey('ComparisnPatientQualityIndicator', chartData.race[key].data, chartData.race[key].keys, 'Race');
        } else if (e.target.value == "cirrhosis") {
            renderComparisonPatientChartskey('ComparisnPatientQualityIndicator', chartData.cirrhosis[key].data, chartData.cirrhosis[key].keys, 'Cirrhosis');
        } else if (e.target.value == "gender") {
            renderComparisonPatientChartskey('ComparisnPatientQualityIndicator', chartData.gender[key].data, chartData.gender[key].keys, 'Gender');
        } else if (e.target.value == "medication") {
            renderComparisonPatientChartskey('ComparisnPatientQualityIndicator', chartData.medication[key].data, chartData.medication[key].keys, 'Medication', 'stack');
        }
    },
    //Praveen 02/15/2017 change event for hepatitis patients
    'change #optionSelectionQualityOverFlow .radioduration': function(e) {
        let chartData = hepatitsPatientsData;

        if (e.target.value == "genotype") {
            //render genotype  chart
            renderBarChartCommon('hepBPatientQualityIndicatorOverFlow', chartData.genotype, 'Genotype');
        } else if (e.target.value == "race") {
            //render race chart
            renderBarChartCommon('hepBPatientQualityIndicatorOverFlow', chartData.race, 'Race');
        } else if (e.target.value == "cirrhosis") {
            renderBarChartCommon('hepBPatientQualityIndicatorOverFlow', chartData.cirrhosis, 'Cirrhosis');
        } else if (e.target.value == "gender") {
            renderBarChartCommon('hepBPatientQualityIndicatorOverFlow', chartData.gender, 'Gender');
        } else if (e.target.value == "medication") {
            renderBarChartCommon('hepBPatientQualityIndicatorOverFlow', chartData.medication, 'Medication');
        }
    },
    'click .backBtnResponders': function(event, template) {
        $('#optionSelectionQualityComparisn').hide();
        let chartData = ComparisonPatientData.comparisonChart;
        $('.backBtnResponders').hide();
        renderBarChart('ComparisnPatientQualityIndicator', chartData.responders);
    },
    'click .backBtnOverFlow': function(event, template) {
        $('.backBtnOverFlow').hide();
        $('.hepPatientQualityIndicatorOverFlowDisplay').hide();
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];
        let baseOrigData = AmdApp.qualityIndicattor.origData;
        let baseCompData = AmdApp.qualityIndicattor.compData;
        let baseOrigDataQA = AmdApp.qualityIndicattor.origDataQA;
        let baseCompDataQA = AmdApp.qualityIndicattor.compDataQA;
        if(value == 'svr23Cured'){
            primaryData = baseOrigData.chartsData;
            secondaryData = baseCompData.chartsData;
        }
        else if(value == 'rnatestingtreatment'){
            primaryData = baseOrigData.data.viralLoadBeforeTreatmentGenotype;
            secondaryData = baseCompData.data.viralLoadBeforeTreatmentGenotype;
        }
        else if(value == 'hepBPatient'){
            primaryData = baseOrigData.hep.hepB;
            secondaryData = baseCompData.hep.hepB;
        }
        else if(value == 'hepandc'){
            primaryData = baseOrigData.hep.hepac;
            secondaryData = baseCompData.hep.hepac;
        }
        else if(value == 'improperregimen'){
            primaryData = baseOrigDataQA.regiments;
            secondaryData = baseCompDataQA.regiments;
        }
        else if(value == 'fdanoncompalint'){
            primaryData = baseOrigDataQA.nonFdaData;
            secondaryData = baseCompDataQA.nonFdaData;
        }
        else if(value == '1treatmenttfailure'){
            let radioValue = $('#optionSelectionQuality .radioduration:checked').val() || 'genotype';
            primaryData = baseOrigData.data[radioValue];
            secondaryData = baseCompData.data[radioValue];
            desc = analyticsLib.toTitleCase(radioValue);
        }
        else if(value == 'inittreatmentt12'){
            let radioValue = $('#optionSelectionQualitysvr12 .radioduration:checked').val() || 'genotype';
            primaryData = baseOrigData.data.dataSVR12[radioValue];
            secondaryData = baseCompData.data.dataSVR12[radioValue];
            desc = analyticsLib.toTitleCase(radioValue);
        }
        else if(value == 'respondersandnon'){
            let radioValue = $('#optionSelectionQualityComparisn .radioduration:checked').val() || 'genotype';
            primaryData = baseOrigData.comparisonChart.responders;
            secondaryData = baseCompData.comparisonChart.responders;
            desc = analyticsLib.toTitleCase(radioValue);
        }
        else if(value == 'nonfdatherapyduration'){
            primaryData = baseOrigDataQA.therapyDurationData;
            secondaryData = baseCompDataQA.therapyDurationData;
        }
        //basedon current database
        //if current data is customer specific no need tto swtich variable else we need tto switch variable primaryData,secondaryData
        //by default customer data is selected then method value is true
        if(isCustomerDataset()){
            plotComparisionDataCharts(value,primaryData,secondaryData,desc);
        }
        else{
            plotComparisionDataCharts(value,secondaryData,primaryData,desc);
        }
    }
});

//Create helper method for QualityIndicator page
Template.QualityIndicator.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    }
});


let GenerateQualityIndictorChart = (container, chartData,isCompared) => {

    if (chartData.DataArray.length < 1) {
        appendNoDataFoundSection(container);
    } 
    
    let totalCured = _.pluck(chartData.DataArray,'totalpatients').sum();
    if(!isCompared){
        $('#SVR12-Cured-N').html(getHTMLTextN(totalCured,AmdApp.qualityIndicattor.origData.totalUniquePatientsMedications));
    }
    Highcharts.chart(container, {
        chart: {
            type: 'column'
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
        legend: false,
        xAxis: {
            categories: chartData.CategoryArray,
            crosshair: true,
            title: {
                text: 'Years'
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Success Rate (%)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><br/>',

            pointFormat: 'Total Patients: {point.totalpatients:,.0f} <br/> Cured Patients: {point.curedpatients:,.0f}',
            footerFormat: '',
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        if (this.y != 0) {
                            return commaSeperatedNumber(this.y.toFixed(2)) + '%';
                        }
                    }
                }
            },
        },
        series: [{
            name: ' ',
            data: chartData.DataArray
        }]
    });
}

let executeQualityIndicatorRender = (params, tempateObj) => {

    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }

    Meteor.call('getQualityIndicatorTabData', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            tempateObj.loading.set(false);
            tempateObj.noData.set(true);
            AmdApp.qualityIndicattor.origData = null;
        } else {
            // Meteor.call('getQualityViralScoreAnalysisData', params, function(errors, results) {
            //     if (errors) {
            //         tempateObj.loading.set(false);
            //         tempateObj.noData.set(true);
            //     } else {
            result = LZString.decompress(result);
            // Decompression from get Quality Viral Score Analysis Data
            //results = LZString.decompress(results);
            // Decompression from get Quality Indicators Hepatits Data
            //resultb = LZString.decompress(resultb);

            result = JSON.parse(result);
            //results = JSON.parse(results);
            //  resultb = JSON.parse(resultb);


            //console.log(results);
            let hepData = result.hep; //JSON.parse(resultb);
            hepatitsPatientsData = hepData;
            //Praveen 02/20/2017 commmon cohort
            setCohortPatientCount({ patientCount: result.totalUniquePatients });
            //$('.searchPatientCountHeader').html(commaSeperatedNumber(result.totalPatients));
            //console.log(hepData);
            //implemented encoding
            reTreatedPatientData = result; //JSON.parse(LZString.decompress(result));
            ComparisonPatientData = result; //JSON.parse(LZString.decompress(results));
            //let chartData =  JSON.parse(LZString.decompress(results));
            //console.log('reTreadtedPatients ',reTreatedPatientData);
            AmdApp.qualityIndicattor.origData = result;
            params.showPreactingAntivirals = false;
            Meteor.call('getQATabData', params, function(error1, result1) {
                //console.log('First call fethed');
                if (error1) {
                    tempateObj.loading.set(false);
                    tempateObj.noData.set(true);
                    AmdApp.qualityIndicattor.origDataQA = null;
                } else {

                    tempateObj.loading.set(false);
                    tempateObj.noData.set(false);

                    result1 = LZString.decompress(result1);
                    result1 = JSON.parse(result1);
                    AmdApp.qualityIndicattor.origDataQA = result1;
                    // console.log(result1);
                   Meteor.defer(function(){
                        GenerateQualityIndictorChart("yearlyQualityIndicator", reTreatedPatientData.chartsData);
                        renderRelapsedPatientChartskey('retreatedPatientQualityIndicator', reTreatedPatientData.data.genotype, 'Genotype');
                        renderRelapsedPatientChartskey('ViralLoadBeforePatientTreatment', reTreatedPatientData.data.viralLoadBeforeTreatmentGenotype, 'Genotype');
                        renderRelapsedPatientChartskey('svr12PatientQualityIndicator', reTreatedPatientData.data.dataSVR12.genotype, 'Genotype');
                        //renderComparisonPatientChartskey('ComparisnPatientQualityIndicator', ComparisonPatientData.comparisonChart.genotype.data, ComparisonPatientData.comparisonChart.genotype.keys, 'Genotype');
                        renderBarChart('ComparisnPatientQualityIndicator', reTreatedPatientData.comparisonChart.responders);
                        
                        renderPieChart('hepBPatientQualityIndicator', hepData.hepB, 'hepB');
                        renderPieChart('hepACPatientQualityIndicator', hepData.hepac, 'hepac');

                        // added by Yuvraj April, 25th 2017
                        renderRegimentsCharts('inappropriateRegimentsDistribution',result1.regiments);
                        renderNonFDACharts("qi-nonFdaCombosDistribution",result1.nonFdaData);
                        renderNonFDATherapyDuration("qi-therapyNonFdaGenotypes",result1.therapyDurationData);
                        appendPatientCount(result1.categories_data);
                        
                        // added by Yuvraj May, 1st 2017
                        //renderMultipleTherapyChart(result.mutipleMedicationChartData);
                    });
                    
                }
            });
             fetchSecondaryDataset(params);//fetch compariosn data

            // console.log(result);

            //    }
            // });
        }
    });
}

//Praveen 02/14/2017 function to plot bar chart for responders and nonresponders
let renderBarChart = (container, data) => {
    //console.log('data in responder chart ',data);

    $('#'+container+'-N').html((data.total));

    // Create the chart
    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: 'Click the columns to view distribution'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'No of Patients(%)'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                cursor: "pointer",
                dataLabels: {
                    enabled: true,
                    format: '{point.y:,.2f}%'
                },
                events: {
                    click: function(event) {
                        //console.log(event);
                        $('#optionSelectionQualityComparisn').show();
                        $('.backBtnResponders').show();
                        //console.log(event);
                        if (event.point.name.toLowerCase() == 'responders') {
                            respondersOrNot = 'responders';
                        } else {
                            respondersOrNot = 'nonresponders';
                        }
                        //respondersOrNot = event.point.name;
                        // $('#optionSelectionQualityComparisn .radioduration').prop('checked','genotype');
                        $('.backBtnResponders').html('Back to ' + event.point.name);
                        let chartData = ComparisonPatientData.comparisonChart;
                        renderComparisonPatientChartskey('ComparisnPatientQualityIndicator', chartData.genotype[respondersOrNot].data, chartData.genotype[respondersOrNot].keys, 'Genotype');
                    }
                }
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '<span>{point.name}</span><br><span>Patient Count</span>: <b>{point.count:,.0f}</b><br/><span>Total Patients</span>: <b>{point.total:,.0f}</b>'
        },

        series: [{
            name: '',
            colorByPoint: true,
            data: data.chartData
        }]
    });
}

let renderPieChart = (container, chartData, keyword,isCompared) => {

    if (chartData.total < 1) {
        appendNoDataFoundSection(container);
    } 
    if(!isCompared)
        $('#'+container+'-N').html(getHTMLCustomTextN(chartData.actual,chartData.total,'Patients'));

    Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: 'Patient Count: <b>{point.y:,.0f}</b><br/>Total Patient:<b>{point.total:,.0f}</b>'
        },
        colors: customColorsArray(),
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
                events: {
                    click: function(event) {
                        //  if(event.point.name.toLowerCase() == 'hepatitis b'){
                        //    hepatitsPatients = keyword+';'+event.point.name;
                        //  }
                        $('.hepPatientQualityIndicatorOverFlowDisplay').show();
                        hepatitsPatients = keyword + ';' + event.point.name;
                        hepatitsPatientsData = event.point.dataPlot;
                        let dataplot = event.point.dataPlot.genotype;
                        $('.backBtnOverFlow').show();
                        renderBarChartCommon('hepBPatientQualityIndicatorOverFlow', dataplot, 'Genotype');
                        //alert(event.point.name);
                    }
                }
            }
        },
        series: [{
            name: '',
            colorByPoint: true,
            data: chartData.data
        }]
    });
}
let renderBarChartCommon = (container, data, keyword) => {
    // Create the chart
    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: keyword
            }
        },
        yAxis: {
            title: {
                text: 'No of Patients'
            }

        },
        legend: {
            enabled: false
        },
        colors: customColorsArray(),
        plotOptions: {
            series: {
                borderWidth: 0,
                cursor: "pointer",
                dataLabels: {
                    enabled: true,
                    format: '{point.y:,.0f}'
                }
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '<span>{point.name}</span><br><span>Patient Count</span>: <b>{point.y:,.0f}</b><br/><span>Total Patients</span>: <b>{point.total:,.0f}</b>'
        },

        series: [{
            name: '',
            colorByPoint: true,
            data: data
        }]
    });
}
let renderComparisonPatientChartskey = (container, chartData, category, key) => {

    Highcharts.chart(container, {
        chart: {
            type: 'column',
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        xAxis: {
            categories: category,
            title: {
                text: key
            }
            // crosshair: true
        },
        colors: customColorsArray(),
        plotOptions: {
            column: {
                dataLabels: {
                    align: 'center',
                    enabled: true,

                    //format: '' + '{point.y:,.0f}',
                    formatter: function() {
                        if (this.y != 0) {
                            return commaSeperatedNumber(this.y);
                        }
                    },
                    style: {
                        fontWeight: 'bold',
                        fontSize: '10px',
                    }
                }
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            symbolRadius: 0,
            x: 0,
            y: 50
        },
        yAxis: {
            min: 0,
            title: {
                text: 'No of Patients'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                //console.log(this);
                return key + ' :' + this.key + '<br/> Patient Count: ' + commaSeperatedNumber(this.point.count); // + '<br/> Total Patients: ' + commaSeperatedNumber(this.total);
            }
        },

        series: chartData
    });

}
let renderRelapsedPatientChartskey = (container, chartData, key,isCompared) => {

    if (chartData.total < 1) {
        appendNoDataFoundSection(container);
    } 
    if(!isCompared)
        $('#'+container+'-N').html(getHTMLCustomTextN(chartData.actual,chartData.total,'Patient with Medications'));

    Highcharts.chart(container, {
        chart: {
            type: 'column',
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        xAxis: {
            categories: chartData.keys,
            title: {
                text: key
            }
            // crosshair: true
        },
        colors: customColorsArray(),
        plotOptions: {
            column: {
                dataLabels: {
                    align: 'center',
                    enabled: true,

                    format: '' + '{point.y:,.0f}',
                    style: {
                        fontWeight: 'bold',
                        fontSize: '10px',
                    }
                }
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            symbolRadius: 0,
            x: 0,
            y: 50
        },
        yAxis: {
            min: 0,
            title: {
                text: 'No of Patients'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                //console.log(this);
                return key + ' :' + this.key + '<br/> Patient Count: ' + commaSeperatedNumber(this.y);
            }
        },

        series: chartData.data
    });

}





/**
 * @author : Yuvraj April, 25th 2017
 *  Added new charts from URAC sheet.
 */

let renderRegimentsCharts = (container,data) => {
    //Therapy Distribution
    //waste-RegimentsDrugDistribution
    //console.log(wasteChartData);
    let dataObj = {};
    // dataObj.data = [
    //     { name: 'Sovaldi', y: 14, drilldown: 'Sovaldi_DrillDown' },
    //     { name: 'Ribavirin', y: 20, drilldown: 'Ribavirin_DrillDown' },
    //     { name: 'Daklinza', y: 50, drilldown: null },
    //     { name: 'Viekira Pak', y: 60, drilldown: null },
    // ];

    // dataObj.drilldown = [
    //     {
    //         name: 'Sovaldi',
    //         id: 'Sovaldi_DrillDown',
    //         data: [
    //             {name: '2', y: 70},
    //             {name: '14', y: 60},
    //             {name: '5', y: 24}
    //         ]
    //     },
    //     {
    //         name: 'Ribavirin',
    //         id: 'Ribavirin_DrillDown',
    //         data: [
    //             {name: '21', y: 70},
    //             {name: '4', y: 60},
    //             {name: '50', y: 24}
    //         ]
    //     }
    // ];

    // dataObj = wasteChartData.regimentsdrilldown;

    dataObj = data.regimentsdrilldown;

    if (dataObj.data.length < 1) {
        appendNoDataFoundSection(container);
    } else {
        let regimentsCharts = new Highcharts.chart(container, {
            chart: {
                type: 'pie',
                width: 450,
                height: 400,
                // events: {
                //     drilldown: function(e) {
                //         regimentsCharts.subtitle.update({ text: 'Click back button to view Therapy distribution' });
                //         regimentsCharts.legend.update({ enabled: false });
                //         //regimentsCharts.update({chart:{type:'column'}});
                //     },
                //     drillup: function(e) {
                //         regimentsCharts.subtitle.update({ text: 'Click the slices to view genotype distribution' });
                //         regimentsCharts.legend.update({ enabled: true });
                //         //regimentsCharts.update({chart:{type:'pie'}});
                //     }
                // }
            },
            title: {
                text: ''
            },
            // subtitle: {
            //     text: 'Click the slices to view genotype Distribution'
            // },
            color: customColorsArray(),
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        //format: '{point.y:,0.2f}%',
                        distance: -30,
                        rotate: 0,
                        formatter: function() {
                            //console.log(this);
                            if (this.point.isDrilldown) {
                                return this.point.name + ':' + Highcharts.numberFormat(this.y, 2) + '%';
                            } else {
                                if (this.y > 4)
                                    return Highcharts.numberFormat(this.y, 2) + '%';
                            }

                        },
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top',
                x: 40,
                y: 50,
                itemStyle: {
                    fontSize: '11px',
                    fontWeight: '300',
                    color: '#666666'
                },
                labelFormatter: function() {
                    if (this.name.length < 4) {
                        return this.name;
                    }
                    return getDrugAbbr(this.name);
                }
            },
            series: [{
                name: 'Drug',
                colorByPoint: true,
                data: dataObj.data
            }],
            tooltip: {
                useHTML: true,
                followPointer: false,
                formatter: function() {
                    if (this.point.isDrilldown) {
                        // return `<span>${this.series.name}</span>: <b>${this.point.name}</b><br/>
                        //     Medication:${this.point.medname}<br/>
                        //     Patient Count:${commaSeperatedNumber(this.point.count)}<br/>
                        //     Expected Dosage:${this.point.actualDosage}
                        //     <br/>Given Dosage:${this.point.givenDosage}<br/>
                        //     Dosage Quantity:${this.point.countDosage}<br/>
                        //     Cost:${this.point.cost}<br/>`;
                        return `<span>${this.series.name}</span>: <b>${this.point.name}</b><br/>
                            Medication:${this.point.medname}<br/>
                            Patient Count:${commaSeperatedNumber(this.point.count)}<br/>
                            Expected Dosage:${this.point.actualDosage}
                            <br/>Given Dosage:${this.point.givenDosage}<br/>
                            Dosage Quantity:${this.point.countDosage}<br/>`;
                    } else {
                        // return `<span>${this.series.name}</span>: <b>${this.point.name}</b><br/>
                        //     Patient Count:${commaSeperatedNumber(this.point.count)}<br/>Cost:${this.point.cost}<br/>`;
                        return `<span>${this.series.name}</span>: <b>${this.point.name}</b><br/>
                            Patient Count:${commaSeperatedNumber(this.point.count)}<br/>`;
                    }
                },
                // headerFormat: `<div>`,
                // pointFormat: `<div>Drug: {point.name}</div>
                //             <div>Patient Count: {point.count:,0.0f}</div>
                //             <div>Cost: $ {point.cost:,0.0f}</div>`,
                // footerFormat: `</div>`,
                hideDelay: 30
            },
            // drilldown: {
            //     series: dataObj.drilldown,
            //     drillUpButton: getStyleForHighchartBackBtn()
            // }
        });
    }
}

function renderNonFDACharts(container,baseChartData) {

    if (baseChartData && baseChartData.therapyDistribution.length < 1) {
        appendNoDataFoundSection(container);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Medications'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        colors: customColorsArray(),
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Medication: {point.fullName}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseChartData.therapyDistribution
        }],
    });
}

let renderNonFDATherapyDuration = (container,data) => {
    //NON FDA Genotype Distribution 
    let dataObj = data;

    if (dataObj.data.length < 1) {
        appendNoDataFoundSection(container);
        return;
    }
    // dataObj.data = [
    //     {name: '1a', y: 14 , drilldown: '1a_DrillDown'},
    //     {name: '1b', y: 20 , drilldown: '1b_DrillDown'},
    //     {name: '2', y: 50 , drilldown: '2_DrillDown'},
    //     {name: '3', y: 60 , drilldown: null},
    //     {name: '4', y: 80 , drilldown: null}
    // ];

    // dataObj.drilldown = [
    //     {
    //         name: '1a',
    //         id: '1a_DrillDown',
    //         data: [
    //             {name: '4', y: 70},
    //             {name: '10', y: 60},
    //             {name: '11', y: 24}
    //         ]
    //     },
    //     {
    //         name: '1b',
    //         id: '1b_DrillDown',
    //         data: [
    //             {name: '4', y: 80},
    //             {name: '18', y: 90},
    //             {name: '40', y: 54}
    //         ]
    //     },
    //     {
    //         name: '2',
    //         id: '2_DrillDown',
    //         data: [
    //             {name: '4', y: 45},
    //             {name: '18', y: 60},
    //             {name: '50', y: 15}
    //         ]
    //     }
    // ];

    let therapyDrillChart = new Highcharts.chart(container, {
        chart: {
            type: 'column',
            events: {
                drilldown: function(e) {
                    therapyDrillChart.subtitle.update({ text: 'Click back button to view genotype distrbution' });
                    therapyDrillChart.xAxis[0].axisTitle.attr({
                        text: 'Treatment Period (in weeks)'
                    });
                },
                drillup: function(e) {
                    therapyDrillChart.subtitle.update({ text: 'Click the bars to view the Non FDA weeks Distribution' });
                    therapyDrillChart.xAxis[0].axisTitle.attr({
                        text: 'Genotypes'
                    });
                }
            }
        },
        title: {
            text: ''
        },
        subtitle: {
            text: 'Click the bars to view the Non FDA weeks Distribution'
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Genotypes'
            }
        },
        yAxis: {
            title: {
                text: 'No of Patients'
            }

        },
        colors: customColorsArray(),
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>{series.name}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: dataObj.data
        }],
        drilldown: {
            series: dataObj.drilldown,
            drillUpButton: getStyleForHighchartBackBtn()
        }
    });
}


function renderMultipleTherapyChart(dataObj) {

    // let filtereData = getDataMultitpleMedicationInSamePeriod(data);

    // let dataObj = prepareMultipleMedicationChartData(filtereData);
    let chartData = dataObj.chartData;
    $('#qi-multipleTherapyAtSameTime_N').html(dataObj.totalPatients);

    // let dataObj = {};
    // dataObj.data = [
    //     { name: '1a', y: 14 },
    //     { name: '1b', y: 20 },
    //     { name: '2', y: 50 },
    //     { name: '3', y: 60 },
    //     { name: '4', y: 80 }
    // ];


    let multipleTherapyChart = new Highcharts.chart('qi-multipleTherapyAtSameTime', {
        chart: {
            type: 'column',
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Genotypes'
            }
        },
        yAxis: {
            title: {
                text: 'No of Patients'
            }

        },
        colors: customColorsArray(),
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>{series.name}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            // data: dataObj.data
            data: chartData

        }]
    });
}





let appendPatientCount = (data) => {
    let count = ~~AmdApp.qualityIndicattor.origData.totalUniquePatientsMedications;
    $('#qi-nonFdaCombosDistribution_N').html(getHTMLTextN(data.nonfdaApprovedCombos.patientCount,count));
    $('#inappropriateRegimentsDistribution-N').html(getHTMLTextN(data.regimenData.patientCount,count));
    $('#qi-therapyNonFdaGenotypes_N').html(getHTMLTextN(data.therapyDuration.patientCount,count));
}

//function to append no data found section for charts
let appendNoDataFoundSection = (container) => {
    let errMsg = `<div class="waste-noDataFoundSection">
                    <div class="waste-noDataFoundMsg">No data available for this section.</div>
                </div>`;

    $('#' + container).html(errMsg);
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

// Added By Yuvraj (May 1st, 2017)
function getDataMultitpleMedicationInSamePeriod(data) {
    let filteredPatients = [];
    let groupedData = _.groupBy(data, 'patientId');
    for (let key in groupedData) {
        let singlePatietnData = groupedData[key];

        singlePatietnData = singlePatietnData.sort(function(a, b) {
            return a.START_DATE1 > b.START_DATE1;
        });

        let flag = false;
        for (let j = 0; j < singlePatietnData.length; j++) {
            if (singlePatietnData.length > 1) {
                if (singlePatietnData[j + 1] && (new Date(singlePatietnData[j].END_DATE1) >= new Date(singlePatietnData[j + 1].STRT_DATE1))) {
                    flag = true;
                }
            }
        }

        if (flag) {
            let patient = {};
            patient['genotype'] = singlePatietnData[0].genotype;
            patient['patientId'] = singlePatietnData[0].patientId;
            filteredPatients.push(patient);
        }
    }

    return filteredPatients;
}

function prepareMultipleMedicationChartData(data) {
    data = _.groupBy(data, 'genotype');
    let totalPatients = 0;
    let chartData = [];
    for (key in data) {
        let obj = {};
        obj['name'] = key;
        obj['y'] = data[key].length;
        chartData.push(obj);
        totalPatients = totalPatients + data[key].length;
    }
    return { chartData: chartData, totalPatients: totalPatients };
}


//function to plot comparision charts
let plotComparisionDataCharts = (plottingData,primaryData,secondaryData,diffplottingData) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection',
        secondaryContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    //empty the containers
    $('#'+primaryContainer).empty();
    $('#'+secondaryContainer).empty();

    switch (plottingData) {

        case 'svr23Cured':
            chartTypeLabel = 'Sustained Virological Response (SVR12) - % Cured';
            GenerateQualityIndictorChart(primaryContainer, primaryData,true);
            GenerateQualityIndictorChart(secondaryContainer, secondaryData,true);
            break;
        case 'rnatestingtreatment':
            chartTypeLabel = 'RNA Testing Before Initiating Treatment';
            renderRelapsedPatientChartskey(primaryContainer, primaryData,'Genotype',true);
            renderRelapsedPatientChartskey(secondaryContainer, secondaryData,'Genotype',true);
            break;
        case 'hepBPatient':
            chartTypeLabel = 'Hepatitis B Patient';
            renderPieChart(primaryContainer, primaryData, 'hepB');
            renderPieChart(secondaryContainer, secondaryData, 'hepB');
            break;
        case 'hepandc':
            chartTypeLabel = 'Hepatitis A & C Patient';
            renderPieChart(primaryContainer, primaryData, 'hepac');
            renderPieChart(secondaryContainer, secondaryData, 'hepac');
            break;
        case 'improperregimen':
            chartTypeLabel = 'Drugs with Inappropriate Regiments Prescription';
            renderRegimentsCharts(primaryContainer,primaryData);
            renderRegimentsCharts(secondaryContainer,secondaryData);
            break;
        case 'fdanoncompalint':
            chartTypeLabel = 'Non FDA Compliant Medications';
            renderNonFDACharts(primaryContainer,primaryData);
            renderNonFDACharts(secondaryContainer,secondaryData);
            break;
        case '1treatmenttfailure':
            chartTypeLabel = 'Patients Treated After 1st Treatment Failure';
            renderRelapsedPatientChartskey(primaryContainer, primaryData, diffplottingData,true);
            renderRelapsedPatientChartskey(secondaryContainer, secondaryData, diffplottingData,true);
            break;
        case 'inittreatmentt12':
            chartTypeLabel = 'RNA Testing Between 4-12 Weeks After Initiation of Treatment';
            renderRelapsedPatientChartskey(primaryContainer, primaryData, diffplottingData,true);
            renderRelapsedPatientChartskey(secondaryContainer, secondaryData, diffplottingData,true);
            break;
        case 'respondersandnon':
            chartTypeLabel = 'Responders and Non Responders';
            renderBarChart(primaryContainer, primaryData);
            renderBarChart(secondaryContainer, secondaryData);
            break;
        case 'nonfdatherapyduration':
            chartTypeLabel = 'Patients with Non FDA Compliant Therapy Duration';
            renderNonFDATherapyDuration(primaryContainer, primaryData);
            renderNonFDATherapyDuration(secondaryContainer, secondaryData);
            break;
  
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}


let fetchSecondaryDataset = (params) => {

    params.database = getReverseSelectedDatabase();//get database
    params.showPreactingAntivirals = true;
    Meteor.call('getQualityIndicatorTabData', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            AmdApp.qualityIndicattor.compData = null;            
        } else {
            result = LZString.decompress(result);
            result = JSON.parse(result);
            AmdApp.qualityIndicattor.compData = result;
            params.showPreactingAntivirals = false;
            Meteor.call('getQATabData', params, function(error1, result1) {
                if (error1) {
                    AmdApp.qualityIndicattor.compDataQA = null;
                } else {
                    result1 = LZString.decompress(result1);
                    result1 = JSON.parse(result1);
                    AmdApp.qualityIndicattor.compDataQA = result1;
                    $('.togglechart').show();
                }
            });
        }
    });
}

let addPatientCount = () =>{
    let count = AmdApp.qualityIndicattor.origData.totalUniquePatients;
    let countM = AmdApp.qualityIndicattor.origData.totalUniquePatientsMedications;
    $('#RNA-Initiating-N').html(commaSeperatedNumber(count));
    $('#qi-hepb').html(commaSeperatedNumber(count));
    $('#qi-hepac').html(commaSeperatedNumber(count));
    $('#Treated-After1-N').html(getHTMLTextN(countM,count));
}