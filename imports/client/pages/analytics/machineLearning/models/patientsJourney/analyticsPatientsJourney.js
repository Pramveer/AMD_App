import {
    Template
} from 'meteor/templating';
import './analyticsPatientsJourney.html';
import * as mlSubTabsUtil from '../modelUtils.js';
import {
    Tracker
} from 'meteor/tracker';
// Add analytics reference for comparative chart
import * as analyticsLib from '../../../analyticsLib.js';

let analyticsPJData = {};
let viralLoadData = {};
let retreatedPatientData = {};
//Add new property to existing global variable
AmdApp.patientsJourney = {};
Template.AnalyticsPatientsJourney.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let params = getCurrentPopulationFilters();
        params.medications = null;

        executePatientJourneyRender(params, self);
    });
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
});

Template.AnalyticsPatientsJourney.rendered = function() {
    analyticsPJData = null;
    $('.headerbuttonFilesection').hide();
}

Template.AnalyticsPatientsJourney.helpers({
    isLoading() {
        return Template.instance().loading.get();
    }
});

Template.AnalyticsPatientsJourney.events({
    // 'click .js-analyticsPJ-drugComboGoBtn': (event) => {
    //     handleMedComboChange();
    // },
    'click .js-analyticsPJ-patientIdsComboGoBtn': (event) => {
        handleViralLoadGoButton();
    },
    'click .js-analyticsPJ-applySideFilters': (event, template, data) => {
        if (data && data == 'refresh') {
            template.loading.set(true);
            let params = getCurrentPopulationFilters();
            params.medications = null;
            params.fdaCompliant = "all";
            executePatientJourneyRender(params, template);
        } else {

        }
    },
    'change #divWeekResponse .radioduration': function(e) {
        handleViralLoadGoButton();
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];
        let baseOrigData = AmdApp.patientsJourney.origData;
        let baseCompData = AmdApp.patientsJourney.compData;

        if (value === 'undetectedSVRDuringTreatment') {
            primaryData = baseOrigData.patientsJourney;
            secondaryData = baseCompData.patientsJourney;
        } else if (value === 'undetectedSVRAfterTreatment') {
            primaryData = baseOrigData.patientsJourney;
            secondaryData = baseCompData.patientsJourney;
        } else if (value === 'analyticPatientsJourney-PJData') {
            primaryData = baseOrigData.patientsJourney;
            secondaryData = baseCompData.patientsJourney;
        }
        //basedon current database
        //if current data is customer specific no need tto swtich variable else we need tto switch variable primaryData,secondaryData
        //by default customer data is selected then method value is true
        if (isCustomerDataset()) {
            plotComparisionDataCharts(value, primaryData, secondaryData, desc);
        } else {
            plotComparisionDataCharts(value, secondaryData, primaryData, desc);
        }
    },
    'change #patientJourneyGenotypeCombo': (event, template) => {
        let currentValue = $(event.currentTarget).val();

        renderThePopupCharts(analyticsPJData.patientDistributionData, currentValue);
    }

});

//function to render the Patients Journey Charts.
let renderPJCharts = (baseData, selectedMedsArray) => {
    let uniquePats = [];

    let countObj = {
        duringTreatmentCount: 0,
        afterTreatmentCount: 0
    };

    if (selectedMedsArray) {
        let filteredData = _.filter(baseData.patientsJourney, (rec) => {
            return selectedMedsArray.indexOf(rec.MEDICATION) > -1;
        });
        //console.log(filteredData);
        countObj.duringTreatmentCount = renderDuringTreatmentChart(filteredData);
        countObj.afterTreatmentCount = renderAfterTreatmentChart(filteredData);
        renderThePopupCharts(baseData.patientDistributionData);

        // Yuvraj 20th Feb 2017 : Switched to PATIENT_ID_SYNTH
        // uniquePats = _.pluck(filteredData, 'IDW_PATIENT_ID_SYNTH');
        uniquePats = _.pluck(filteredData, 'PATIENT_ID_SYNTH');
    } else {
        countObj.duringTreatmentCount = renderDuringTreatmentChart(baseData.patientsJourney);
        countObj.afterTreatmentCount = renderAfterTreatmentChart(baseData.patientsJourney);
        renderThePopupCharts(baseData.patientDistributionData);

        // Yuvraj 20th Feb 2017 : Switched to PATIENT_ID_SYNTH
        // uniquePats = _.pluck(baseData.patientsJourney, 'IDW_PATIENT_ID_SYNTH');
        uniquePats = _.pluck(baseData.patientsJourney, 'PATIENT_ID_SYNTH');
    }

    // Find Unique patients and Update the patient count in the header.
    //Praveen 02/20/2017 commmon cohort
    setCohortPatientCount({
        //patientCount: _.uniq(_.pluck(baseData.patientsJourney, 'PATIENT_ID_SYNTH')).length
        patientCount: getUniqueArrayCount(baseData.patientsJourney, 'PATIENT_ID_SYNTH')
    });

    appendpatientCountForTooltip(baseData, countObj);
    //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(_.uniq(uniquePats).length));

}

//
let renderDuringTreatmentChart = (baseData) => {
    let chartData = [];
    let chartObj = {};
    let data = filterDataUndetectedDuringTreatment(baseData);
    //console.log('----',data)
    let grpByMedication = _.groupBy(data, 'MEDICATION');
    let categories = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24', '24-28', '28+']; //Object.keys(prepareweeksGroupDuringTreatment(data));
    //console.log(categories);
    for (let key in grpByMedication) {
        let json = {};
        json['name'] = key;

        let weekData = [];
        let keyData = grpByMedication[key];

        json['data'] = getWeeksDataForDuringTreatment(keyData);
        chartData.push(json);
    }

    //console.log(chartData);
    // OOLD CODE COMMENTED
    //renderUndetectedSVRChart('undetectedSVRDuringTreatment', chartData, categories);
    chartObj.chartData = chartData;
    chartObj.categories = categories;
    chartObj.container = 'undetectedSVRDuringTreatment';
    // console.log(chartData,data);
    renderUndetectedSVRChart({
        chartObj: chartObj
    });

    //Pram (29th May 17) : Added return for the patient count
    //return _.uniq(_.pluck(data, 'PATIENT_ID_SYNTH')).length;
    return getUniqueArrayCount(data, 'PATIENT_ID_SYNTH');
};

let renderDuringTreatmentChartExtension = ({
    baseData,
    chartContainer,
    isComparable
}) => {
    let chartData = [];
    let chartObj = {};
    let data = filterDataUndetectedDuringTreatment(baseData);
    //console.log('----',data)
    let grpByMedication = _.groupBy(data, 'MEDICATION');
    let categories = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24', '24-28', '28+']; //Object.keys(prepareweeksGroupDuringTreatment(data));
    //console.log(categories);
    for (let key in grpByMedication) {
        let json = {};
        json['name'] = key;

        let weekData = [];
        let keyData = grpByMedication[key];

        json['data'] = getWeeksDataForDuringTreatment(keyData);
        chartData.push(json);
    }

    //Set dynamic height based on how chart whould be displayed
    if (isComparable) {
        chartObj.height = 250;

    }
    chartObj.chartData = chartData;
    chartObj.categories = categories;
    chartObj.container = chartContainer;
    // console.log(chartData,data);
    renderUndetectedSVRChart({
        chartObj: chartObj
    });
};

//
let renderAfterTreatmentChart = (baseData) => {
    let chartData = [];
    let chartObj = {};
    let data = filterDataUndetectedAfterTreatment(baseData);
    // console.log('----',data)
    let grpByMedication = _.groupBy(data, 'MEDICATION');
    let categories = ['0-4', '8-12', '16-20', '24-28', '32-36', '40-44', '48-52']; //'48-52','56-60','64-68'];//Object.keys(prepareweeksGroupDuringTreatment(data));
    //console.log(categories);
    for (let key in grpByMedication) {
        let json = {};
        json['name'] = key;
        let keyData = grpByMedication[key];
        json['data'] = getWeeksDataForAfterTreatment(keyData);
        chartData.push(json);
    }

    // // console.log(chartData,data);
    // OOLD code commented
    // renderUndetectedSVRChart('undetectedSVRAfterTreatment', chartData, categories);

    chartObj.chartData = chartData;
    chartObj.categories = categories;
    chartObj.container = 'undetectedSVRAfterTreatment';
    // console.log(chartData,data);
    renderUndetectedSVRChart({
        chartObj: chartObj
    });

    //Pram (29th May 17) : Added return for the patient count
    //return _.uniq(_.pluck(data, 'PATIENT_ID_SYNTH')).length;
    return getUniqueArrayCount(data, 'PATIENT_ID_SYNTH');
}

let renderAfterTreatmentChartExtension = ({
    baseData,
    chartContainer,
    isComparable
}) => {
    let chartData = [];
    let chartObj = {};


    let data = filterDataUndetectedAfterTreatment(baseData);
    // console.log('----',data)
    let grpByMedication = _.groupBy(data, 'MEDICATION');
    let categories = ['0-4', '8-12', '16-20', '24-28', '32-36', '40-44', '48-52']; //'48-52','56-60','64-68'];//Object.keys(prepareweeksGroupDuringTreatment(data));
    //console.log(categories);
    for (let key in grpByMedication) {
        let json = {};
        json['name'] = key;
        let keyData = grpByMedication[key];
        json['data'] = getWeeksDataForAfterTreatment(keyData);
        chartData.push(json);
    }
    //Set dynamic height based on how chart whould be displayed
    if (isComparable) {
        chartObj.height = 250;
        console.log(isComparable);
    }
    chartObj.chartData = chartData;
    chartObj.categories = categories;
    chartObj.container = chartContainer;
    // console.log(chartData,data);
    renderUndetectedSVRChart({
        chartObj: chartObj
    });
};
//render the chart for undetected SVR
let renderUndetectedSVRChart = ({
    chartObj
}) => {
    // console.log(container);
    // console.log(chartData);


    if (chartObj.chartData.length < 1) {
        $('#' + chartObj.container).prev().show();
        $('#' + chartObj.container).hide();
        return;
    }

    Highcharts.chart(chartObj.container, {
        chart: {
            type: 'column',
            height: chartObj.height ? chartObj.height : 400
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        xAxis: {
            categories: chartObj.categories,
            crosshair: true,
            title: {
                text: 'Treatment Weeks'
            }
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        yAxis: {
            // min: 0,
            // title: {
            //     text: 'Patient Count'
            // }
            // Nisha 02/24/2017 Modified to make it same as pharma
            min: 0,
            max: 100,
            title: {
                text: 'Patient Count (%)'
            }
        },
        tooltip: {
            //headerFormat: `<span style="font-size:10px">{point.key}</span><table>`,
            // headerFormat: ``,
            // pointFormat: `<span>Medication : {series.name}</span><br/>
            //                 <span style="padding:0">Patient Count: {point.y:,.0f}</span>`,
            // footerFormat: ``,
            // shared: false,
            // useHTML: true
            headerFormat: '<span style="font-size:10px">{point.key}</span><br/>',

            pointFormat: '{series.name}: {point.count:,.0f} ({point.y:,.2f} %)',
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
                            return commaSeperatedNumber(this.y.toFixed(2)) + '%'; //commaSeperatedNumber(this.y);
                        }
                    },
                }
            }
        },
        series: chartObj.chartData
    });
};

//execute render function
let executePatientJourneyRender = (params, tempateObj) => {
    //the api call used is same as in the analytics/TreatmentEfficacy
    params.showIndividualPJ = true;
    tempateObj.loading.set(false);
    mlSubTabsUtil.showChartLoading();
    Meteor.call('getTreatmentEfficacyDataAnalytics', params, (error, response) => {
        if (error) {
            console.log(error);
            mlSubTabsUtil.hideChartLoading();
            AmdApp.patientsJourney.origData = null;
        } else {

            response = JSON.parse(response);
            analyticsPJData = response;
            // set original data (default switch data) to global AmdApp variable
            AmdApp.patientsJourney.origData = analyticsPJData;
            //console.log(response);

            //set patient count on header
            setPatientCount();
            //render the charts
            renderPJCharts(analyticsPJData);

            mlSubTabsUtil.hideChartLoading();

            // Commented the code to remove the Retreatment Distribution charts
            // $('#retreatmentchartLoading').show();
            // $('#retreatmentcharthide').hide();
            // Meteor.call('getRetreatmentPatientData', params, (errors, costResults) => {
            //     if (errors || (costResults.length < 0)) {
            //         console.log('No data fetched for the sub population');
            //         console.log(errors);
            //         $('#retreatmentchartLoading').hide();
            //         return;
            //     }
            //     else {
            //         costResults = JSON.parse(costResults);

            //         $('#retreatmentchartLoading').hide();
            //         $('#retreatmentcharthide').show();
            //         //render retreatment chart
            //         renderRetreatedByGenotype(costResults.RetreatedDistribution.retreatedByGenotype);
            //         retreatedPatientData = costResults.RetreatedDistribution;
            //     }
            //  });
        }
    });
    //Commented fetching secondary dataset as it is not required for comparision
    // Once all default data loaded request for comparative dataset
    //fetchSecondaryDataset(params);
};

//set patient count on header
let setPatientCount = () => {
    // Yuvraj 20th Feb 2017 : Switched to PATIENT_ID_SYNTH
    // let uniquepatients = _.pluck(analyticsPJData.patientsJourney, 'IDW_PATIENT_ID_SYNTH');
    let uniquepatients = _.pluck(analyticsPJData.patientsJourney, 'PATIENT_ID_SYNTH');
    $('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
}


//prepare data for Undetected SVR during treatment
let filterDataUndetectedDuringTreatment = (baseData) => {
    let patientGrpData = _.groupBy(baseData, 'PATIENT_ID_SYNTH'); //group data based on patient id
    let relapsedData = [];

    for (let patientid in patientGrpData) {
        let paData = patientGrpData[patientid];
        let flag = false;
        let startDate = paData[0]['STRT_DATE'];
        let endDate = paData[paData.length - 1]['END_DATE'];

        for (let index = 1; index < paData.length; index++) {
            //console.log(paData[index].Perfed_Dt,startDate,endDate);
            if (paData[index].END_DATE > startDate) {
                let viraload = parseInt(paData[index]['ViralLoad']);
                //console.log(viraload,startDate,endDate);
                if (viraload == 0 && (paData[index].STRT_DATE <= endDate)) {
                    relapsedData.push(paData[index]);
                    //break;
                }
            }
        }
    }
    return relapsedData;
}

//prepare data for Undetected SVR After treatment
let filterDataUndetectedAfterTreatment = (baseData) => {
    //console.log(baseData);
    let patientGrpData = _.groupBy(baseData, 'PATIENT_ID_SYNTH'); //group data based on patient id
    let relapsedData = [];

    for (let patientid in patientGrpData) {
        let paData = patientGrpData[patientid];
        let flag = false;
        let endDateAfter = paData[0]['END_DATE'];
        let startDateAfter = paData[paData.length - 1]['STRT_DATE'];
        for (let index = 1; index < paData.length; index++) {
            //console.log(paData[index].Perfed_Dt,startDate,endDate);
            if (paData[index].STRT_DATE > paData[index - 1].END_DATE) {
                let viraload = parseInt(paData[index]['ViralLoad']);
                //console.log(viraload,startDate,endDate);
                if (viraload == 0 && (paData[index - 1].END_DATE <= paData[index].STRT_DATE)) {
                    relapsedData.push(paData[index]);
                    //break;
                }
            }
        }
    }

    return relapsedData;
}

let getWeeksDataForDuringTreatment = (baseData) => {

    let data = [0, 0, 0, 0, 0, 0, 0, 0];
    data[0] = baseData.filter((rec) => (rec.TREATMENT_PERIOD >= 0 && rec.TREATMENT_PERIOD <= 4)).length;
    data[1] = baseData.filter((rec) => (rec.TREATMENT_PERIOD >= 4 && rec.TREATMENT_PERIOD <= 8)).length;
    data[2] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 8 && rec.TREATMENT_PERIOD <= 12).length;
    data[3] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 12 && rec.TREATMENT_PERIOD <= 16).length;
    data[4] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 16 && rec.TREATMENT_PERIOD <= 20).length;
    data[5] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 20 && rec.TREATMENT_PERIOD <= 24).length;
    data[6] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 24 && rec.TREATMENT_PERIOD <= 28).length;
    data[7] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 28).length;
    // return data;
    // Nisha 02/24/2017 for making it similar to pharma
    let actualArray = [];
    let total = data.sum();
    for (let i = 0; i < data.length && total > 0; i++) {
        let json = {};
        json['y'] = (data[i] / total) * 100;
        json['count'] = data[i];
        actualArray.push(json);
    }
    return actualArray;
}

let getWeeksDataForAfterTreatment = (baseData) => {

    let data = [0, 0, 0, 0, 0, 0, 0];
    data[0] = baseData.filter((rec) => (rec.TREATMENT_PERIOD >= 0 && rec.TREATMENT_PERIOD <= 4)).length;
    data[1] = baseData.filter((rec) => (rec.TREATMENT_PERIOD >= 8 && rec.TREATMENT_PERIOD <= 12)).length;
    data[2] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 16 && rec.TREATMENT_PERIOD <= 20).length;
    data[3] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 24 && rec.TREATMENT_PERIOD <= 28).length;
    data[4] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 32 && rec.TREATMENT_PERIOD <= 36).length;
    data[5] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 40 && rec.TREATMENT_PERIOD <= 44).length;
    data[6] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 48 && rec.TREATMENT_PERIOD <= 52).length;
    // // data[7] = baseData.filter((rec)=>rec.TREATMENT_PERIOD >= 56 && rec.TREATMENT_PERIOD <= 60).length;
    // // data[8] = baseData.filter((rec)=>rec.TREATMENT_PERIOD >= 64 && rec.TREATMENT_PERIOD <= 68).length;
    // // data[7] = baseData.filter((rec)=>rec.TREATMENT_PERIOD >= 72).length;
    // return data;
    // Nisha 02/24/2017 for making it similar to pharma
    let actualArray = [];
    let total = data.sum();
    for (let i = 0; i < data.length && total > 0; i++) {
        let json = {};
        json['y'] = (data[i] / total) * 100;
        json['count'] = data[i];
        actualArray.push(json);
    }
    return actualArray;

}


//render genotype distribution click
//Pram (30th May 17) : Call this function from the selection change by passing a flag
let renderThePopupCharts = (dataObj, isFromCombo) => {
        // let currentGenotype = Object.keys(dataObj.viralLoadChartData)[0];

        // let viralLoadChartData = dataObj.viralLoadChartData[currentGenotype];
        // let viralLoadPatientIds = _.pluck(viralLoadChartData.seriesData, 'name');

        // appendPatientsDropdown(viralLoadPatientIds);
        // initilizePatientsDropdown();

        // appendGenotypeDropDown(dataObj.genotypeChartData, currentGenotype);

        // viralLoadData = viralLoadChartData;
        // renderPatientViralLoadChart(viralLoadChartData, true);
        //$('.pj-selectedGenotype').html('( Genotype: ' + Object.keys(dataObj.viralLoadChartData)[0] + ' )');


        //Pram (30th May 17) : Changes to the function according to the flag
        let currentGenotype = null;

        if (isFromCombo) {
            currentGenotype = isFromCombo;
        } else {
            currentGenotype = Object.keys(dataObj.viralLoadChartData)[0];
            appendGenotypeDropDown(dataObj.genotypeChartData, currentGenotype);
        }

        let viralLoadChartData = dataObj.viralLoadChartData[currentGenotype];
        let viralLoadPatientIds = _.pluck(viralLoadChartData.seriesData, 'name');

        appendPatientsDropdown(viralLoadPatientIds);
        initilizePatientsDropdown();

        viralLoadData = viralLoadChartData;
        renderPatientViralLoadChart(viralLoadChartData, true);

    }
    // Extenion method for viral distribution data
    // Need to update sub sequent method used internally
let renderThePopupChartsExtension = ({
    dataObj
}) => {
    let viralLoadChartData = dataObj.viralLoadChartData[Object.keys(dataObj.viralLoadChartData)[0]];
    let viralLoadPatientIds = _.pluck(viralLoadChartData.seriesData, 'name');

    appendPatientsDropdown(viralLoadPatientIds);
    initilizePatientsDropdown();
    // console.log('---render charts poup');
    // console.log(viralLoadChartData);
    viralLoadData = viralLoadChartData;
    renderPatientViralLoadChart(viralLoadChartData, true);
    $('.pj-selectedGenotype').html('( Genotype: ' + Object.keys(dataObj.viralLoadChartData)[0] + ' )');

}

let renderPatientViralLoadChart = (dataObj, flag) => {
    let chartData = [];

    if (flag) {
        chartData = _.first(dataObj.seriesData, 10);
    } else {
        chartData = dataObj.seriesData;
    }

    //console.log('inside funtion');
    //console.log(dataObj);
    //Praveen 02/27/2017 added colors
    Highcharts.chart('analyticPatientsJourney-PJData', {
        chart: {
            type: 'line',
            width: 1100,
            zoomType: 'xy'
        },
        title: {
            text: '',
        },
        subtitle: {
            text: '',
            x: -20
        },
        xAxis: {
            categories: dataObj.xCategories,
            title: {
                text: 'Weeks'
            },
            plotBands: dataObj.plotBands ? dataObj.plotBands : [],
        },
        yAxis: {
            title: {
                text: 'Viral Load in log'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        tooltip: {
            formatter: function() {
                let value = this.y.toFixed(2);
                let html = `<div>
                                <div>Patient Id: <span style="color:${this.color}">${this.series.name}</span></div> <br/>
                                <div>Weeks: ${this.x}</div><br/>
                                <div>Viral Load: ${value}</div><br/>
                            </div>`;
                return html;
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        plotOptions: {
            line: {
                events: {
                    legendItemClick: function() {
                        if (!this.visible)
                            return false;

                        let seriesIndex = this.index;
                        let series = this.chart.series;

                        for (let i = 0; i < series.length; i++) {
                            if (series[i].index != seriesIndex) {
                                series[i].visible ? series[i].hide() : series[i].show();
                            }
                        }
                        return false;
                    }
                }
            }
        },
        series: chartData
            /*series: [
                {
                    name: 'Patient 1',
                    data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                },
                {
                    name: 'Patient 2',
                    data: [7.0, 25.2, 26.5, 23.3, 18.3, 13.9,6.9, 9.5, 14.5, 18.2, 21.5, 9.6]
                }
            ]*/
    });
}

let handleViralLoadGoButton = () => {
    let data = viralLoadData.seriesData;
    let weeks = viralLoadData.xCategories;

    let patients = $("#patientIdsDropdown").multiselect("getChecked").map(function() {
        return this.value;
    }).get();

    let weeksRange = $('#divWeekResponse input[name=duration]:checked').val();

    let baseData = [];

    // Yuvraj 20th Feb 2017 : Switched to PATIENT_ID_SYNTH
    // let groupbyPatientId = _.groupBy(analyticsPJData.patientsJourney, 'IDW_PATIENT_ID_SYNTH');
    let groupbyPatientId = _.groupBy(analyticsPJData.patientsJourney, 'PATIENT_ID_SYNTH');
    for (let key in groupbyPatientId) {
        let keyData = groupbyPatientId[key];
        if (keyData.length >= 2) {
            for (let i = 0; i < keyData.length; i++) {
                baseData.push(keyData[i]);
            }
        }
    }
    //console.log(baseData.length,analyticsPJData.patientsJourney.length);
    let maxWeeks = _.max(baseData, function(dataPJT) {
        return parseInt(dataPJT.Weeks);
    }).Weeks;
    let minWeeks = _.min(baseData, function(dataPJT) {
        return parseInt(dataPJT.Weeks);
    }).Weeks;
    let uniqueWeeks = []; //_.uniq(_.pluck(baseData,'Weeks'));

    for (let week = parseInt(minWeeks); week <= parseInt(maxWeeks); week++) {
        uniqueWeeks.push(week);
    }
    let filteredData = [];

    for (let i = 0; i < patients.length; i++) {
        for (let j = 0; j < baseData.length; j++) {

            // Yuvraj 20th Feb 2017 : Switched to PATIENT_ID_SYNTH
            // if (patients[i] == baseData[j].IDW_PATIENT_ID_SYNTH) {
            if (patients[i] == baseData[j].PATIENT_ID_SYNTH) {
                filteredData.push(baseData[j]);
            }
        }
    }


    // if(weeksRange != 'all') {
    //     let minWeek = weeksRange.split('-')[0],
    //         maxWeek = weeksRange.split('-')[1];

    //     filteredData = filteredData.filter((rec) => {
    //         return rec.Weeks >= minWeek && rec.Weeks <= maxWeek;
    //     });
    // }

    let plotBandData = getPlotBandRangesForViralLoadChartNew(filteredData, maxWeeks);

    // console.log('plot band');
    // console.log(plotBandData);

    let chartData = prepareViralLoadData(_.flatten(plotBandData.data));
    chartData.plotBands = plotBandData.plotBands;
    chartData.xCategories = uniqueWeeks;

    //console.log(chartData);

    if (chartData.seriesData.length) {
        renderPatientViralLoadChart(chartData);
    } else {
        $('#analyticPatientsJourney-PJData').html('<div class="providerNoDataFound" style="margin-left:250px;">No data found for this selection.</div>');
    }


    // if(patients.length){
    //     let filteredData = [];
    //     for(let j=0; j<data.length; j++){
    //         for(let i = 0; i<patients.length; i++){
    //         if(patients[i] == data[j].name){
    //             filteredData.push(data[j])
    //         }
    //         }
    //     }
    //     // let uniqueWeeks = _.uniq(_.pluck(filteredData,'Weeks'));

    //     let finalData = {
    //         xCategories: weeks,
    //         seriesData:  filteredData
    //     }
    //     renderPatientViralLoadChart(finalData);
    // }else{
    //     $('#analyticPatientsJourney-PJData').html('<div class="providerNoDataFound">Please Select Patients</div>');
    // }


}

let appendPatientsDropdown = (patients) => {
    let options = '';
    for (let i = 0; i < patients.length; i++) {
        let patientId = patients[i];
        if (i < 10) {
            options = options + `<option value="${patientId}" selected>${patientId}</option>`;
        } else {
            options = options + `<option value="${patientId}">${patientId}</option>`;
        }
    }

    $('#patientIdsDropdown').html(options);
}

let appendGenotypeDropDown = (genotypeData, value) => {
    let genotypeOptions = ``;

    genotypeData.sort(function(a, b) {
        return a[0] > b[0] ? 1 : -1;
    });

    for (let i = 0; i < genotypeData.length; i++) {
        if (value == genotypeData[i][0]) {
            genotypeOptions += `<option value="${genotypeData[i][0]}" selected>${genotypeData[i][0]}</option>`;
        } else {
            genotypeOptions += `<option value="${genotypeData[i][0]}">${genotypeData[i][0]}</option>`;
        }
    }

    $('#patientJourneyGenotypeCombo').html(genotypeOptions);

    $('.patientJourneyGenotypeCombo-Wrap').show();
    if (genotypeData.length == 1) {
        $('.patientJourneyGenotypeCombo-Wrap').hide();
    }
}

// http://www.erichynds.com/blog/jquery-ui-multiselect-widget
let initilizePatientsDropdown = () => {
    $("#patientIdsDropdown").multiselect({
        selectedText: "# of # selected",
        checkAllText: "Select All",
        multiple: true,
        uncheckAllText: "Unselect All",
        classes: "te_selectMedication",
        minWidth: 250,
        noneSelectedText: "Select...",
    });
}


let prepareViralLoadData = (basePjData) => {
    let viralSeriesData = [];
    let patientData = _.sortBy(basePjData, 'Weeks');

    let maxWeeks = _.max(patientData, function(dataPJT) {
        return parseInt(dataPJT.Weeks);
    }).Weeks;
    let minWeeks = _.min(patientData, function(dataPJT) {
        return parseInt(dataPJT.Weeks);
    }).Weeks;
    let uniqueWeeks = []; //_.uniq(_.pluck(baseData,'Weeks'));

    for (let week = parseInt(minWeeks); week <= parseInt(maxWeeks); week++) {
        uniqueWeeks.push(week);
    }
    //let uniqueWeeks = _.uniq(_.pluck(patientData,'Weeks'));

    // Yuvraj 20th Feb 2017 : Switched to PATIENT_ID_SYNTH
    // let pDataGrp = _.groupBy(patientData, 'IDW_PATIENT_ID_SYNTH');
    let pDataGrp = _.groupBy(patientData, 'PATIENT_ID_SYNTH');

    for (let patient in pDataGrp) {
        let obj = {},
            pData = pDataGrp[patient],
            weeksData = [];
        let flag = false;
        for (let i = 0; i < uniqueWeeks.length; i++) {
            let currWeek = _.where(pData, {
                Weeks: uniqueWeeks[i]
            });
            let viraload = currWeek.length ? parseFloat(currWeek[0].ViralLoad) : 0;

            if ((currWeek.length) && (parseInt(viraload) > 0)) {
                let viralLoadInLog = Math.log(viraload);
                weeksData.push(isNaN(parseFloat(viralLoadInLog)) ? 0 : viralLoadInLog);
                if (viralLoadInLog > 0) {
                    flag = true;
                }
            } else {
                weeksData.push(0);
            }
        }
        if (weeksData.length > 0 && flag) {
            obj.name = patient;
            obj.data = weeksData;
            viralSeriesData.push(obj); //[{name: '123', data:[2.01,5.2]}]
        }
        // obj.name = patient;
        // obj.data = weeksData;
        // viralSeriesData.push(obj); //[{name: '123', data:[2.01,5.2]}]
    }

    return {
        xCategories: uniqueWeeks,
        seriesData: viralSeriesData
    }
}



//function to plot comparision charts
let plotComparisionDataCharts = (plottingData, primaryData, secondaryData, diffplottingData) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection',
        secondaryContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    //empty the containers
    $('#' + primaryContainer).empty();
    $('#' + secondaryContainer).empty();

    switch (plottingData) {

        case 'undetectedSVRDuringTreatment':
            chartTypeLabel = 'First Point of Undetected Viral Load During The Treatment';
            renderDuringTreatmentChartExtension({
                baseData: primaryData,
                chartContainer: primaryContainer,
                isComparable: false
            });
            renderDuringTreatmentChartExtension({
                baseData: secondaryData,
                chartContainer: secondaryContainer,
                isComparable: false
            });
            break;
        case 'undetectedSVRAfterTreatment':

            chartTypeLabel = 'First Point of Undetected Viral Load After Ending Treatment';
            renderAfterTreatmentChartExtension({
                baseData: primaryData,
                chartContainer: primaryContainer,
                isComparable: true
            });
            renderAfterTreatmentChartExtension({
                baseData: secondaryData,
                chartContainer: secondaryContainer,
                isComparable: true
            });

            break;
            // case 'analyticPatientsJourney-PJData':
            //     chartTypeLabel = 'Hepatitis B Patient';
            //     renderPieChart(primaryContainer, primaryData, 'hepB');
            //     renderPieChart(secondaryContainer, secondaryData, 'hepB');
            //     break;

    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
};
let fetchSecondaryDataset = (params) => {
    console.log("**patientJourney Secondary method called **");
    params.database = getReverseSelectedDatabase(); //get database
    Meteor.call('getTreatmentEfficacyDataAnalytics', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            AmdApp.patientsJourney.compData = null;
        } else {
            result = JSON.parse(result);
            AmdApp.patientsJourney.compData = result;
            $('.togglechart').show();
            console.log("**patientJourney Secondary method received with data **");
        }
    });
};


let appendpatientCountForTooltip = (dataObj, treatmentCountObj) => {
    let baseData = dataObj.patientsJourney,
        patientData = dataObj.patientDistributionData;

    //let totalPatients = _.uniq(_.pluck(baseData, 'PATIENT_ID_SYNTH')).length;
    let totalPatients = getUniqueArrayCount(baseData, 'PATIENT_ID_SYNTH');

    let duringTreatmentN = treatmentCountObj.duringTreatmentCount,
        afterTreatmentN = treatmentCountObj.afterTreatmentCount,
        patientWithJourney = 0;

    //patientWithJourney = patientData.uniqueTotal;

    $('.patientJourney-overallN').html(commaSeperatedNumber(totalPatients));
    $('.patientJourney-duringTreatmentN').html(commaSeperatedNumber(duringTreatmentN));
    $('.patientJourney-afterTreatmentN').html(commaSeperatedNumber(afterTreatmentN));
    $('.patientJourney-patientsWithViralJourney').html(commaSeperatedNumber(patientWithJourney));

    $('.patientJourney-duringTreatmentN-PerN').html(getPercentForValue(duringTreatmentN, totalPatients));
    $('.patientJourney-afterTreatmentN-PerN').html(getPercentForValue(afterTreatmentN, totalPatients));

    for (let keys in patientData.viralLoadChartData) {
        let seriesData = patientData.viralLoadChartData[keys].seriesData;
        //patientWithJourney += _.uniq(_.pluck(seriesData, 'name')).length;
        patientWithJourney += getUniqueArrayCount(seriesData, 'name');
        
    }


    let genotypeData = patientData.genotypeChartData;
    $('.patientJourney-ViralStats').html('');
    if (genotypeData.length > 1) {

        let genotypeWiseCount = ``;

        for (let i = 0; i < genotypeData.length; i++) {
            let pCount = patientData.viralLoadChartData[genotypeData[i][0]].seriesData;
            //pCount = _.uniq(_.pluck(pCount, 'name')).length;
            pCount = getUniqueArrayCount(pCount, 'name');

            genotypeWiseCount += `<span class="boldfnt"> Genotype ${genotypeData[i][0]}: </span>
                                    <span>${pCount}</span> 
                                    (<span>${getPercentForValue(pCount, patientWithJourney)}</span>) 
                                    Over ${patientWithJourney} Patients <br/>`;
        }

        $('.patientJourney-ViralStats').html(genotypeWiseCount);
    }


    $('.patientJourney-patientsWithViralJourney').html(patientWithJourney);
    $('.patientJourney-patientsWithViralJourney-PerN').html(getPercentForValue(patientWithJourney, totalPatients));
}

let getPercentForValue = (numerator, demoninator) => {
    let percent = 0;

    if (numerator == 0 || demoninator == 0) {
        percent = 0;
    } else {
        percent = (parseFloat((numerator / demoninator) * 100)).toFixed(1);
    }

    return percent + '%';
}