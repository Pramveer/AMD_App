import {
    Template
} from 'meteor/templating';
import './dashboard.html';

import * as dashUtils from './dashboardUtils';

let treatedPatientsData = '';
let filtersArray = [];
let $selectizeCombo = '';
let medicationList = new ReactiveVar([]);

Template.Dashboard.onCreated(function() {

    let self = this;
    this.loading = new ReactiveVar(true);
    let category_id = Session.get('category_id');
    // Get Preserved Data.
    treatedPatientsData = Pinscriptive['dashboard']['treatedPatients'];

    if (!treatedPatientsData) {
        this.autorun(() => {

            Meteor.call('getTreatedPatientsDataForDashboards', null, (error, results) => {
                if (error || (results.length < 0)) {
                    alert('No data fetched for the sub population');
                    return;
                } else {
                    let decompressed_object = LZString.decompress(results);

                    let resulting_object = JSON.parse(decompressed_object);
                    //console.log(resulting_object);
                    treatedPatientsData = resulting_object;
                    // added by jayesh 2th may 2017 for medicaiton dropdown 
                    medicationList.set(treatedPatientsData.MarketShareOverMonthsChartData.singleMedicationList);
                    Pinscriptive['DrugByGenotype'] = []; //results['DrugByGenotype'];
                    // Preserved Data.
                    Pinscriptive['dashboard']['treatedPatients'] = treatedPatientsData;
                    //fetchPrescriptionData(self);
                    self.loading.set(false);
                    //comparison button is removed
                    fetchSecondaryDataset();
                }
            });


        });
    } else {
        self.loading.set(false);
    }
});



Template.Dashboard.rendered = () => {
    //console.log("Page is rendered.");
    filtersArray = [];
    Session.set('Mprob', '');
    $(".head-emr-details").hide();

    if (Pinscriptive.dashboard.phsData) {
        //SHOW COMPARE ICON ON SECTIONS
        $('.togglechart').show();
    }
}



//Create helper method for Dashboard page
Template.Dashboard.helpers({
    'isLoading': () => Template.instance().loading.get(),

    'getTotalPatients': () => {
        if (treatedPatientsData) {
            return commaSeperatedNumber(treatedPatientsData.totalpatients);
        }
    },
    'getMedicationMarketShare': () => {
        return medicationList.get();
    },
    'renderCharts': () => {
        setTimeout(() => {
            try{
                $selectizeCombo = $('.genotypeDistSelect').selectize();
                $selectizeCombo[0].selectize.setValue("select");
                let timeselect = $('.timeFilterDistSelect').selectize();
                setDataFieldsValue('year', true);
            }catch(ex){
                console.log('error in initializing selectize');
            }
           
            renderChartsInUI(treatedPatientsData);

            //Praveen 02/22/2017 changed '01/07/2010' to new Date('01/07/2010')
            //modified Praveen 03/24/2017 date changed to 01/01/2013to current date
            let start = new Date('01/01/2013');
            let end = new Date();

            $('#timeFilterDistSelect').daterangepicker({
                startDate: start,
                endDate: end,
                parentEl: '#dv-dash-time-filter',
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);

            cb(start, end);
        }, 200);
    },

    'getPatientCountByGender': (gender) => {
        let gend = treatedPatientsData['gender'][gender] || {};
        let count = ~~gend['count'];
        return count > 0 ? commaSeperatedNumber(count) : 0;
    },
    'getCompareDataItems': () => {
        let dataItems = [
            { name: 'age', label: 'Age Distribution' },
            { name: 'race', label: 'Race Distribution' },
            { name: 'svr', label: 'Viral Load Distribution' },
            { name: 'cirrhosistypeDistribution', label: 'Treatment Distribution' },
            { name: 'insurance', label: 'Insurance Plan Distribution' },
            { name: 'treatmentStatusDistribution', label: 'Adherence Rates'},
            { name: 'genotype', label: 'Genotype Distribution' },
            { name: 'diseasePrediction', label: 'Disease Prediction' },
            { name: 'treatmentPriority', label: 'Treatment Priority' },
            { name: 'mortalityRate', label: 'Mortality Rate' },
            { name: 'riskDistribution', label: 'Risk Distribution' },
            { name: 'survivalRate', label: 'Survival Rate' },
            { name: 'drugGenotypeDistribution', label: 'Drug Distribution by Genotype' },
            { name: 'RetreatedChartData', label: 'Retreatment Distribution' }
        ];

        return dataItems;
    }
});

Template.Dashboard.destroyed = () => {
    $(".head-emr-details").show();
}

Template.Dashboard.events({
    'change .genotypeDistSelect': (event) => {
        let value = $(event.currentTarget).val();
        handleGenotypeSelect(value);
    },
    'change #ddlMedicationMarketShare': (event) => {
        let value = $(event.currentTarget).val();
        renderMarketShareOverMonthsChart('markerShareOverMonthsChart', treatedPatientsData.MarketShareOverMonthsChartData, value);
    },
    'show.bs.collapse': () => {
        smooth_scroll_to($('.scrollTillHere'));
    },
    'click .js-dashboard-clearFilter': (event, template) => {
        handleBreadCrumClick(event.currentTarget);
    },
    'click .js-dashboard-clearAll': (event, template) => {
        handleBreadCrumClick(event.currentTarget, true);
    },

    'click .js-dashboard-applyDateFilters': (event, template) => {
        let data = $('#timeFilterDistSelect').data('daterangepicker');
        let startd = moment(new Date(data.startDate._d));
        //let startDate = new Date(data.startDate._d).toISOString().split('T')[0];
        let startDate = moment(data.startDate.format('YYYY/MM/DD')).format("YYYY-MM-DD"); //startd.year()+'-'+(startd.month()+1)+'-'+startd.date();
        let endd = moment(new Date(data.endDate._d));
        //let endDate = new Date(data.endDate._d).toISOString().split('T')[0];
        let endDate = moment(data.endDate.format('YYYY/MM/DD')).format("YYYY-MM-DD"); //endd.year()+'-'+(endd.month()+1)+'-'+endd.date();

        let dataObj = startDate + '~~' + endDate;
        filtersArray = _.without(filtersArray, _.findWhere(filtersArray, { identifier: 'date' }));
        filterPatientsByChart(dataObj, [], 'date');
    },
    'change .timeFilterDistSelect': (event) => {
        let val = $(event.currentTarget).val();

        if (val == 'year') {
            setDataFieldsValue(val);
        } else if (val == 'quarter') {
            setDataFieldsValue(val);
        } else {
            setDataFieldsValue('year');
        }
    },
    'click .js-closeDatasetComparsionPopup': (event, template) => {
        $('#datasetComparsionPopup').hide();
    },
    'click .js-compareDataMenuButton': (event, template) => {
        let isHidden = $(event.currentTarget).attr('data');

        if (isHidden == 'hidden') {
            $('.compareDataMenuItems').slideDown('slow');
            $(event.currentTarget).attr('data', 'shown');
        } else {
            $('.compareDataMenuItems').slideUp('slow');
            $(event.currentTarget).attr('data', 'hidden');
        }
    },
    'change #showSelectedPopulation': () => {
        if ($("#showSelectedPopulation").prop('checked')) {
            $('.newPopulationCharts').hide();
            $('.subpopulationcharts').show();
        } else {
            $('.newPopulationCharts').show();
            $('.subpopulationcharts').hide();
        }
    },
    //Praveen 03/29/2017 Added condition for radio buttons selection 
    'change #treamentAvgCostSelection .radioduration': function(e) {

        //hide loading wheel 
        hideChartLoading();
        let data = treatedPatientsData.patientPrescription.care;
        let container = 'divRateFailure';
        if (e.target.value == "SVRNotAchieved") {
            renderHighBarChart(container, data.svr, 'Race', 'SVR12', 0);
        } else if (e.target.value == "Discontinued") {
            renderHighBarChart(container, data.discontinued, 'Race', 'IS_COMPLETED', 'No');
        } else if (e.target.value == "Followup") {
            renderHighBarChart(container, data.follow, 'Race', 'SVR12', null);
        } else if (e.target.value == "Notprescribed") {
            renderHighBarChart(container, data.noPrescription, 'Race', 'NO_PRESCRIPTION', 'Yes');
        } else {
            renderHighBarChart(container, data.svr, 'Race', 'SVR12', 0);
        }
    },
    'click .backBtnResponders': function() {
        $('.backBtnResponders').hide();
        renderhighmapcharts('tPrescrobedTherapyMap', treatedPatientsData.patientPrescription.mapchart, 'Map');
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        plotComparisionDataCharts(value, desc);
    },
    'change #hcvPrevelenceCombo': (event, template) => {
        let value = $(event.currentTarget).val();
        renderHCVPrevelenceChart('hcvPrevelenceChart',treatedPatientsData.hcvPrevelenceData, value);
    }
});


let cb = (start, end) => {
    //$('#timeFilterDistSelect span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
}

//function to load PHS data
let fetchSecondaryDataset = () => {
    Meteor.call('getPatientsDataForCustomer', null, (error, results) => {
        if (error || (results.length < 0)) {
            console.log('No data fetched for the sub population');
            Pinscriptive.dashboard.phsData = null;
            return;
        } else {
            let decompressed_object = LZString.decompress(results);
            decompressed_object = JSON.parse(decompressed_object);
            Pinscriptive.dashboard.phsData = decompressed_object;
            //TODO SHOW COMPARE ICON ON SECTIONS
            $('.togglechart').show();
        }
    });
};


//Added by Praveen on 4 April 2017
//function to plot prescription related charts 
let renderChartsPrescription = (baseData) => {

    //console.log(baseData);

    //Praveen 03/30/2017 Added bubble chart for prrescription
    renderCostRxBubbleChart('prescriptionCount-rxCost', baseData.costPrescription.all);

    //append table information 
    addPrescriptionInformation(baseData.costPrescription.allTable);

    //render bar chart for ingredient cost and cost per prescription 
    renderHighBarChartPrescription('prescriptionCount-IngredientCost', baseData.costPrescription.allTable);
    //render cure and rate failure
    renderHighBarChart('divRateFailure', baseData.patientPrescription.care.svr, 'Race', 'SVR12', 0);
    renderPredictionCountChart('prescriptionCount-ContainerDashboard', baseData.prescriptionCount);
    renderIngredientCostChart('IngredientCost-ContainerDashboard', baseData.prescriptionCount);
}

//function to plot comparision charts
let plotComparisionDataCharts = (plottingData, diffplottingData) => {

    prepareDomForComparisionCharts(plottingData);

    let baseIMSData = Pinscriptive.dashboard.treatedPatients;
    let basePHSData = Pinscriptive.dashboard.phsData;

    let imsContainer = '#imsDataViewSection',
        phsContainer = '#phsDataViewSection';

    let imsData = baseIMSData[plottingData],
        phsData = basePHSData[plottingData];

    let chartTypeLabel = '';

    let chartObj = {};
    chartObj.height = 450;
    chartObj.width = 400;

    //empty the containers
    $(imsContainer).empty();
    $(phsContainer).empty();

    if (plottingData == 'patientPrescription' || plottingData == 'costPrescription' || plottingData == 'prescriptionCount') {
        plottingData = diffplottingData;
        imsContainer = 'imsDataViewSection';
        phsContainer = 'phsDataViewSection';
    }

    if (plottingData == 'MarketShareOverMonthsChartData' || plottingData == 'treatmentCirrhosis' || plottingData == 'drugGenotypeDistribution1' || plottingData == 'drugFibrosisDistribution' || plottingData=='treatmentM') {
        imsContainer = 'imsDataViewSection';
        phsContainer = 'phsDataViewSection';
    }
    if (plottingData == 'costBurden') {
        plottingData = diffplottingData;
    }
    switch (plottingData) {
        case 'summary':
            chartTypeLabel = 'Summary';
            renderDataComparisionSummary(baseIMSData, basePHSData);
            break;

        case 'race':
            chartTypeLabel = 'Race Distribution';
            chartObj.chartContainer = imsContainer;
            chartObj.width = 500;
            chartObj.colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
            renderEthenicityChart(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderEthenicityChart(phsData, chartObj, 'compare');
            break;

        case 'age':
            chartTypeLabel = 'Age Distribution';
            chartObj.chartContainer = imsContainer;
            chartObj.width = 510;
            chartObj.colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
            renderAgeDistributionChart(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderAgeDistributionChart(phsData, chartObj, 'compare');
            break;

        case 'svr':
            chartTypeLabel = 'Viral Load Distribution';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
            renderViralScoreCharts(imsData, chartObj, 'compare');
            chartObj.chartContainer = phsContainer;
            renderViralScoreCharts(phsData, chartObj, 'compare');
            break;

        case 'cirrhosistypeDistribution':
            chartTypeLabel = 'Treatment Distribution';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ['#ff9896', '#f1cb6a'];
            renderTreatmentDistribution(imsData.data, imsData.group, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderTreatmentDistribution(phsData.data, phsData.group, chartObj, 'compare');
            break;
        case 'treatmentStatusDistribution':
            chartTypeLabel = 'Adherence Rates';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ['#ff9896', '#f1cb6a'];
            renderTreatmentStatusDistribution(imsData.data, imsData.group, chartObj, 'compare');
            chartObj.colors = ['#f1cb6a', '#ff9896'];
            chartObj.chartContainer = phsContainer;
            renderTreatmentStatusDistribution(phsData.data, phsData.group, chartObj, 'compare');
            break;
        case 'treatmentCirrhosis':
            chartTypeLabel = 'Cirrhosis Distribution';
            plotCirrhosistypeDistribution(phsContainer, phsData, 'compare');
            plotCirrhosistypeDistribution(imsContainer, imsData, 'compare');
            break;

        case 'insurance':
            chartTypeLabel = 'Insurance Plan Distribution';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
            renderInsuranceDistributionChart(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderInsuranceDistributionChart(phsData, chartObj, 'compare');
            break;

        case 'genotype':
            chartTypeLabel = 'Genotype Distribution';
            chartObj.chartContainer = imsContainer;
            renderGenotypeDistributionChart(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderGenotypeDistributionChart(phsData, chartObj, 'compare');
            break;

        case 'diseasePrediction':
            chartTypeLabel = 'Disease Prediction';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ['#f1cb6a', '#e95a52'];
            renderDeseasePrediction(imsData.data, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderDeseasePrediction(phsData.data, chartObj, 'compare');
            break;

        case 'treatmentPriority':
            chartTypeLabel = 'Treatment Priority';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", '#f1cb6a'];
            renderTreatmentPriority(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderTreatmentPriority(phsData, chartObj, 'compare');
            break;

        case 'riskDistribution':
            chartTypeLabel = 'Risk Distribution';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", '#f1cb6a'];
            renderRiskDistributionDonutChart(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderRiskDistributionDonutChart(phsData, chartObj, 'compare');
            break;

        case 'mortalityRate':
            chartTypeLabel = 'Mortality Rate';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", '#f1cb6a'];
            renderMortalityRateChart(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderMortalityRateChart(phsData, chartObj, 'compare');
            break;

        case 'survivalRate':
            chartTypeLabel = 'Survival Rate';
            chartObj.height = 200;
            chartObj.width = 900;
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", "#f1cb6a"];
            renderSurvivalRate(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderSurvivalRate(phsData, chartObj, 'compare');
            break;

        case 'drugFibrosisDistribution':
            chartTypeLabel = 'Drug Distribution by Fibrosis';
            renderStackedColumnChartMedication(imsContainer, imsData,'Fibrosis',true);
            renderStackedColumnChartMedication(phsContainer, phsData,'Fibrosis',true);
            break;
        case 'drugGenotypeDistribution1':
            chartTypeLabel = 'Drug Distribution by Genotype';
            renderStackedColumnChartMedication(imsContainer, imsData,'Genotype',true);
            renderStackedColumnChartMedication(phsContainer, phsData,'Genotype',true);
            break;

        case 'RetreatedChartData':
            chartTypeLabel = 'Retreatment Genotype';
            chartObj.chartContainer = imsContainer;
            chartObj.colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
            renderChartsRetreatmentGenotype(imsData, chartObj, 'compare');

            chartObj.chartContainer = phsContainer;
            renderChartsRetreatmentGenotype(phsData, chartObj, 'compare');
            break;

        case 'statechart':
            chartTypeLabel = 'Patients Distribution by State';
            renderhighmapcharts(imsContainer, imsData.mapchart, 'Map', 'compare');
            renderhighmapcharts(phsContainer, phsData.mapchart, 'Map', 'compare');
            break;

        case 'payermix':
            chartTypeLabel = 'Observed Distribution by Payer Mix';
            renderPayerMixobservedChart(imsContainer, imsData.observedPayerMix, 'Observed Payer Mix', 'compare');
            renderPayerMixobservedChart(phsContainer, phsData.observedPayerMix, 'Observed Payer Mix', 'compare');
            break;

        case 'treatment':
            chartTypeLabel = 'Patients Distribution by Treatment';
            renderTreatmentPieCharts(imsContainer, imsData, 'treatment', 'Treatment', 'compare');
            renderTreatmentPieCharts(phsContainer, phsData, 'treatment', 'Treatment', 'compare');
            break;
        case 'treatmentM':
            chartTypeLabel = 'Patients prescribed anti-HCV therapy by Treatment';
            renderTreatmentPieCharts(imsContainer, imsData, 'treatment', 'Treatment', 'compare');
            renderTreatmentPieCharts(phsContainer, phsData, 'treatment', 'Treatment', 'compare');
            break;

        case 'Prescribefibrosis':
            chartTypeLabel = 'Patients Distribution by Fibrosis';
            renderPrescriptionPieCharts(imsContainer, imsData.fibrosis, 'Fibrosis', 'compare');
            renderPrescriptionPieCharts(phsContainer, phsData.fibrosis, 'Fibrosis', 'compare');
            break;

        case 'Prescribegenotype':
            chartTypeLabel = 'Patients prescribed anti-HCV therapy by Genotype';
            renderHighBarChart(imsContainer, imsData.genotype, 'Genotype', 'medication', null, 'compare');
            renderHighBarChart(phsContainer, phsData.genotype, 'Genotype', 'medication', null, 'compare');
            break;

        case 'Prescribepayer':
            chartTypeLabel = 'Patients prescribed anti-HCV therapy by Payer';
            renderHighBarChart(imsContainer, imsData.insurance, 'Insurance', 'medication', null, 'compare');
            renderHighBarChart(phsContainer, phsData.insurance, 'Insurance', 'medication', null, 'compare');
            break;

        case 'MarketShareOverMonthsChartData':
            chartTypeLabel = 'Market Share Over Months';
            let medication = $('#ddlMedicationMarketShare').val() || 'ALL';
            renderMarketShareOverMonthsChart(imsContainer, imsData, medication, 'compare');
            renderMarketShareOverMonthsChart(phsContainer, phsData, medication, 'compare');
            break;

        case 'svrcare':
            chartTypeLabel = 'Types and Rates of Care Failure';
            let imssvr = imsData.care;
            let phssvr = phsData.care;
            let value = $('#treamentAvgCostSelection .radioduration:checked').val();
            if (value == "SVRNotAchieved") {
                chartTypeLabel = 'SVR12 Not Achieved';
                renderHighBarChart(imsContainer, imssvr.svr, 'Race', 'SVR12', 0, 'compare');
                renderHighBarChart(phsContainer, phssvr.svr, 'Race', 'SVR12', 0, 'compare');
            } else if (value == "Discontinued") {
                chartTypeLabel = 'Discontinued Treatment';
                renderHighBarChart(imsContainer, imssvr.discontinued, 'Race', 'IS_COMPLETED', 'No', 'compare');
                renderHighBarChart(phsContainer, phssvr.discontinued, 'Race', 'IS_COMPLETED', 'No', 'compare');
            } else if (value == "Followup") {
                chartTypeLabel = 'Follow Up';
                renderHighBarChart(imsContainer, imssvr.follow, 'Race', 'SVR12', null, 'compare');
                renderHighBarChart(phsContainer, phssvr.follow, 'Race', 'SVR12', null, 'compare');
            } else if (value == "Notprescribed") {
                chartTypeLabel = 'Not Prescribed';
                renderHighBarChart(imsContainer, imssvr.noPrescription, 'Race', 'NO_PRESCRIPTION', 'Yes', 'compare');
                renderHighBarChart(phsContainer, phssvr.noPrescription, 'Race', 'NO_PRESCRIPTION', 'Yes', 'compare');
            } else {
                chartTypeLabel = 'SVR12 Not Achieved';
                renderHighBarChart(imsContainer, imssvr.svr, 'Race', 'SVR12', 0, 'compare');
                renderHighBarChart(phsContainer, phssvr.svr, 'Race', 'SVR12', 0, 'compare');
            }
            break;
        case 'tPCostBurden':
            chartTypeLabel = 'Antiviral Therapy';
            renderCostBurdenChartCommon(imsContainer, imsData, "Antiviral Therapy", 'Antiviral Therapy_count', 'compare');
            renderCostBurdenChartCommon(phsContainer, phsData, "Antiviral Therapy", 'Antiviral Therapy_count', 'compare');
            break;
        case 'tPLiverCostChart':
            chartTypeLabel = 'Liver Cost';
            renderCostBurdenChartCommon(imsContainer, imsData, "Liver Disease", 'Liver Disease_count', 'compare');
            renderCostBurdenChartCommon(phsContainer, phsData, "Liver Disease", 'Liver Disease_count', 'compare');
            break;
        
        case 'tPPhysicianCostChart':
            chartTypeLabel = 'Physician Service';
            renderCostBurdenChartCommon(imsContainer, imsData, "Physician Service", 'Physician Service_count', 'compare');
            renderCostBurdenChartCommon(phsContainer, phsData, "Physician Service", 'Physician Service_count', 'compare');
            break;
        case 'tPHospitalizationCostChart':
            chartTypeLabel = 'Hospitalization';
            renderCostBurdenChartCommon(imsContainer, imsData, 'Hospitalization', 'Hospitalization_count', 'compare');
            renderCostBurdenChartCommon(phsContainer, phsData, 'Hospitalization', 'Hospitalization_count', 'compare');
            break;
        case 'costperrx':
            chartTypeLabel = 'Cost per RX';
            renderCostRxBubbleChart(imsContainer, imsData.all, true);
            renderCostRxBubbleChart(phsContainer, phsData.all, true);
            break;

        case 'ingredientcostpres':
            chartTypeLabel = 'Ingredient Cost by Prescription';
            renderHighBarChartPrescription(imsContainer, imsData.allTable, true);
            renderHighBarChartPrescription(phsContainer, phsData.allTable, true);
            break;
        case 'prescriptionCount':
            chartTypeLabel = 'Prescription Count';
            renderPredictionCountChart(imsContainer, imsData, true);
            renderPredictionCountChart(phsContainer, phsData, true);
            break;
        case 'prescriptionCountIng':
            chartTypeLabel = 'Ingredient Cost';
            renderIngredientCostChart(imsContainer, imsData, true);
            renderIngredientCostChart(phsContainer, phsData, true);
            break;

        case 'hcvIncidentData':
            chartTypeLabel = 'Hepatitis C Incidence in US';
            renderHCVIncidenceChart(imsContainer, imsData, true);
            renderHCVIncidenceChart(phsContainer, phsData, true);
            break;

        case 'hcvEstimationData':
            chartTypeLabel = 'Estimated Person Infected with HCV';
            renderHCVEstimationChart(imsContainer, imsData, true);
            renderHCVEstimationChart(phsContainer, phsData, true);
            break;

        case 'hcvPrevelenceData': 
            chartTypeLabel = 'Prevelence of HCV Antibody';
            let currSelection = $('#hcvPrevelenceCombo').val();
            renderHCVPrevelenceChart(imsContainer, imsData, currSelection, true);
            renderHCVPrevelenceChart(phsContainer, phsData, currSelection, true);
            break;

    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show thw popup
    $('#datasetComparsionPopup').show();

}

let prepareDomForComparisionCharts = (plottingData) => {
    $('#datasetComparsionPopupContent').empty();

    let chartContainerCls = 'col-lg-6';
    if (plottingData == 'survivalRate'  || plottingData == 'MarketShareOverMonthsChartData' || plottingData == 'costBurden') {
        chartContainerCls = 'col-lg-12';
    }

    let inlineStyle = ``;
    let html = `<div class="${chartContainerCls} chartContainer">
                    <div class="boxContainerDashboard">
                        <div class="panel-heading">
                            <h3 class="panel-title containertitle">Benchmark </h3>
                        </div>
                        <div class="panel-body">
                            <div id="imsDataViewSection" ${inlineStyle}></div>
                        </div>
                    </div>
				</div>
                <div class="${chartContainerCls}  chartContainer">
                    <div class="boxContainerDashboard">
                        <div class="panel-heading">
                            <h3 class="panel-title containertitle">Client</h3>
                        </div>
                        <div class="panel-body">
                            <div id="phsDataViewSection" ${inlineStyle}></div>
                        </div>
                    </div>
                </div>`;

    $('#datasetComparsionPopupContent').html(html);
}

let setDataFieldsValue = (valType, isRender) => {

    let today = new Date('2016-12-31');
    let from_date = new Date('2011-01-31');

    if (isRender) {
        from_date = new Date('2012-01-31');
    }

    let toDate_Year = fromDate_Year = '',
        toDate_Month = fromDate_Month = '';

    toDate_Year = today.getFullYear();
    toDate_Month = today.getMonth();


    if (!valType) {
        toDate_Year = fromDate_Year = toDate_Month = fromDate_Month = '';
    } else if (valType.toLowerCase() == 'year') {
        from_date.setFullYear(from_date.getFullYear() - 1);
    } else if (valType.toLowerCase() == 'quarter') {
        from_date.setMonth(from_date.getMonth() - 3);
    }

    fromDate_Year = from_date.getFullYear();
    fromDate_Month = from_date.getMonth();

    toDate_Month++;
    fromDate_Month++;

    toDate_Month = toDate_Month < 10 ? '0' + toDate_Month : toDate_Month;
    fromDate_Month = fromDate_Month < 10 ? '0' + fromDate_Month : fromDate_Month;

    $('.dashboard-toDate').val(toDate_Year + '-' + toDate_Month);
    $('.dashboard-fromDate').val(fromDate_Year + '-' + fromDate_Month);

}

let renderChartsInUI = (data) => {
    // console.log("*** renderChartsInUI****");
    // console.log(data);

    //// Reference link : http://stackoverflow.com/questions/3762589/fastest-javascript-summation
    //// First Set N for each chart in tooltip

    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });

    $('#race-distribution-N').text(commaSeperatedNumber(data.totalpatients)+' Patients');
    $('#age-distribution-N').text(commaSeperatedNumber(data.totalpatients)+' Patients');
    $('#genotype-distribution-N').text(commaSeperatedNumber(data.totalpatients)+' Patients');
    $('#treatment-distribution-N').text(commaSeperatedNumber(data.totalpatients)+' Patients');

    $('#survival-rate-N').text(commaSeperatedNumber(data['survivalRate']['totalCount'])+' Patients');
    $('#mortality-rate-N').text(commaSeperatedNumber(~~data['mortalityRate'].totalPatients)+' Patients');
    $('#risk-distribution-N').text(commaSeperatedNumber(~~data['riskDistribution'].total)+' Patients');
    $('#disease-prediction-N').text(commaSeperatedNumber(~~data['diseasePrediction'].total)+' Patients');
    $('#cost-burden-N').text();
    $('#treatment-priority-N').text(commaSeperatedNumber(~~data['treatmentPriority'].totalPatients)+' Patients');
    
    $('#treament-status-distribution-N').text(commaSeperatedNumber(data['treatmentStatusDistribution']['patientWithCompletedCount'])
                                         +' (' + data['treatmentStatusDistribution']['patientWithCompletedCountPerc']  + '%) Over '
                                         + commaSeperatedNumber(data['treatmentStatusDistribution']['patientWithMedicationCount']) 
                                         + ' Patient with Medications');
    let EthnicityGroupData = data['race'],
        AgeGroupData = data['age'],
        GenotypeGroupData = data['genotype'];


    $('.timeFilterDistSelect').find('input:first').attr("style", "display: none !important");
    renderEthenicityChart(EthnicityGroupData);
    renderAgeDistributionChart(AgeGroupData);

    //console.log(GenotypeGroupData);
    renderGenotypeDistributionChart(GenotypeGroupData);

    //now cirrhosis distribution
    renderTreatmentDistribution(data['cirrhosistypeDistribution']['data'], data['cirrhosistypeDistribution']['group']);
    renderTreatmentStatusDistribution(data['treatmentStatusDistribution']['data'], data['treatmentStatusDistribution']['group']);
    plotCirrhosistypeDistribution('tPCirrhosisDistribution', data['treatmentCirrhosis']);

    renderDeseasePrediction(data['diseasePrediction']["data"]);

    renderSurvivalRate(data['survivalRate']);

    renderTreatmentPriority(data['treatmentPriority']);
    renderRiskDistributionDonutChart(data['riskDistribution']);
    renderMortalityRateChart(data['mortalityRate']);

    renderStackedColumnChartMedication('tPDrugGenotyeDistribution', data['drugGenotypeDistribution1'],'Genotype',false,true);
    //render fibrosis stage vs medication chart
    renderStackedColumnChartMedication('tPFibrosisMediDistribution',data['drugFibrosisDistribution'],'Fibrosis',false);
    renderCostBurden(data['costBurden']);

    renderInsuranceDistributionChart(data['insurance']);

    renderViralScoreCharts(data['svr']);

    renderChartsRetreatmentGenotype(data.RetreatedChartData);

    //new charts Praveen 03/27/2017
    renderTreatmentPieCharts('tPatientsBytreatment', data['treatmentM'], 'treatment', 'Treatment');
    renderHighBarChart('tPatientbygenotype', data.patientPrescription.genotype, 'Genotype', 'medication');
    renderHighBarChart('tPatientsByPayer', data.patientPrescription.insurance, 'Insurance', 'medication');
    renderPrescriptionPieCharts('tPatientsbyFibrosis', data.patientPrescription.fibrosis, 'Fibrosis');
    renderhighmapcharts('tPrescrobedTherapyMap', data.patientPrescription.mapchart, 'Map');
    renderPayerMixobservedChart('newChartPayerMix', data.patientPrescription.observedPayerMix, 'Observed Payer Mix');
    //render button radio button chart 
    renderMarketShareOverMonthsChart('markerShareOverMonthsChart', data.MarketShareOverMonthsChartData, 'ALL');
    //render chart prescription
    renderChartsPrescription(data);

    //Pram(27th June 2017): add fucntion for new charts
    renderHCVIncidenceChart('hepCIncidenceChart', data.hcvIncidentData);
    renderHCVEstimationChart('estimatedHepCInfectionChart', data.hcvEstimationData);
    renderHCVPrevelenceChart('hcvPrevelenceChart', data.hcvPrevelenceData);
}


let renderChartsRetreatmentGenotype = (chartData, chartObj, compareData) => {

    let container = chartObj ? chartObj.chartContainer : "#retreatedDistributionChart";
    let color = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
    let colors = chartObj ? chartObj.colors : color;
    d3.select(container).selectAll("*").remove();

    let svgHieght = chartObj ? chartObj.height : 200;
    let svgWidth = chartObj ? chartObj.width : 300;

    if (compareData != 'compare'){

        $('#retreated-distribution-N').html(getHTMLCustomTextN(chartData.patientLength,Pinscriptive.dashboard.treatedPatients.totalpatientsMedication,'Patients with Medication are retreated'))
    }
    let data = chartData.data;

    if (data.length > 0) {
        let chart = c3.generate({
            bindto: container,
            data: {
                type: 'donut',
                json: data,
                keys: {
                    value: chartData.keys
                },
                //Praveen:03/22/2017 Added check for no data found
                empty: {
                    label: {
                        text: "No Data Available"
                    }
                },
                onclick: function(d) {
                    if (!chartObj && compareData != 'compare') {
                        if (d.value) {
                            //filter for retreatment
                            filterPatientsByChart(d, data.data, 'retreated');
                            //filter for genotype
                            filterPatientsByChart(d, data, 'genotype');
                        } else {
                            console.log("improper click and data");
                        }
                    }
                },
            },
            size: {
                height: svgHieght,
                width: svgWidth
            },
            donut: {
                width: chartObj ? 100 : 55
            },
            color: {
                pattern: colors
            },
            tooltip: {
                grouped: false,
                contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                    var colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
                    let dataObj = d[0];
                    let ratio = (dataObj.ratio * 100).toFixed(2);

                    let html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div> Genotype:' + dataObj.id + ' (' + commaSeperatedNumber(ratio) + '%)</div>' +
                        '</div>' +
                        '<div class="customC3ToolTip-Body">' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patients Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                        '</div>' +
                        '</div>';
                    return html;

                }
            }
        });
    } else {
        $(container).html(`<div style="text-align: center;padding-top: 5%;color: red;">No patient took retreatment for selected criteria</div>`);
    }

}



let renderEthenicityChart = (chartData, chartObj, compareData) => {
    let container = chartObj ? chartObj.chartContainer : "#tPEthnicityDistribution";

    d3.select(container).selectAll("*").remove();

    let svgHieght = chartObj ? chartObj.height : 140;
    let svgWidth = chartObj ? chartObj.width : 340;
    // let svgWidth = 385;

    let data = [];
    let colors = [];
    for (let key in chartData) {
        var json = {};
        json['ethnicity'] = dashUtils.toTitleCase(key);
        json[key] = chartData[key].count;
        json['patients'] = chartData[key].count;
        json['color'] = chartData[key].color;
        data.push(json);
    }
    if (data && data.length == 0) {
        fnNoDataFound(container);
        return;
    }
    data.sort((a, b) => b['patients'] - a['patients']);
    colors = _.pluck(data, 'color');

    let chart = c3.generate({
        bindto: container,
        data: {
            json: data,
            keys: {
                x: 'ethnicity', // specify that the "name" key is the x value
                value: ["patients"] // specify that the "age" key is the y value
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: (d) => {
                if (!chartObj && compareData != 'compare') {
                    if (d.value) {
                        let filterData = data[d.index];
                        let dataObj = _.clone(d);
                        dataObj['id'] = toTitleCase(filterData.ethnicity);
                        filterPatientsByChart(dataObj, data, 'race');
                    } else {
                        console.log('wrong value or event');
                    }
                }
            },
            type: 'bar', // specfify type of plot
            color: (color, d) => colors[d.index],
            order: null,
            labels: {
                format: (v, id, i, j) => {
                    if (compareData == 'compare')
                        return ~~v ? commaSeperatedNumber(~~v) : '';
                }
            }
        },
        legend: {
            show: false
        },
        size: {
            height: svgHieght,
            width: svgWidth
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = data[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                let html = '';
                html = `<div class="customC3ToolTip">
                            <div class="customC3ToolTip-Header">
                            <div>${filterData.ethnicity}</div>
                            </div>
                            <div class="customC3ToolTip-Body">
                            <div><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div> Patients Count: ${commaSeperatedNumber(value)}</div>
                            </div>
                        </div>`;
                return html;
            }
        },
        axis: {
            rotated: true, // horizontal bar chart
            x: {
                show: true,
                type: 'category', // this needed to load string x value
                tick: {
                    //rotate: 75,
                    multiline: false

                }
            },
            y: {
                show: false,
            }
        }
    });

}

let renderAgeDistributionChart = (chartData, chartObj, compareData) => {

    // let colors = ['#AABADB', '#90B1DA', '#679DCB', '#3990C3', '#1C76BA'];
    let color = customColorsArray(); //['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'];
    let colors = chartObj ? chartObj.colors : color;

    let container = chartObj ? chartObj.chartContainer : "#tPAgeDistribution";
    d3.select(container).selectAll("*").remove();

    let svgHieght = chartObj ? chartObj.height : 138,
        svgWidth = chartObj ? chartObj.width : 280,
        data = [];

    for (let ageGroup in chartData) {
        let json = chartData[ageGroup];
        json['patients'] = json['count'];
        data.push(json);
    }

    //sort chart data
    data.sort((a, b) => {
        let age1 = a.age.split('-')[0],
            age2 = b.age.split('-')[0];

        age1 = age1.replace('+', '');
        age2 = age2.replace('+', '');

        return age1 - age2;
    });
    //colors = _.pluck(data,'color');
    let chart = c3.generate({
        bindto: container,
        data: {
            json: data, // specify that our above json is the data
            keys: {
                x: 'age', // specify that the "name" key is the x value
                value: ["patients"] // specify that the "age" key is the y value
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: d => {
                if (!chartObj && compareData != 'compare') {
                    if (d.value) {
                        let filterData = data[d.index];
                        let dataObj = _.clone(d);
                        dataObj['id'] = filterData.age;

                        filterPatientsByChart(dataObj, data, 'age');
                    } else {
                        console.log('wrong value or event');
                    }
                }
            },
            type: 'bar', // specfify type of plot
            color: (color, d) => colors[d.index],
            order: null,
            labels: {
                format: (v, id, i, j) => {
                    if (compareData == 'compare')
                        return ~~v ? commaSeperatedNumber(~~v) : '';
                }
            }
        },
        legend: {
            show: false
        },
        size: {
            height: svgHieght,
            width: svgWidth
        },
        bar: {
            width: {
                ratio: 0.85
            }
        },
        color: {
            pattern: colors
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = data[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                let html = '';
                html = `<div class="customC3ToolTip">
                            <div class="customC3ToolTip-Header">
                            <div>${filterData.age}</div>
                            </div>
                            <div class="customC3ToolTip-Body">
                            <div><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div> Patients Count: ${commaSeperatedNumber(value)}</div>
                            </div>
                        </div>`;
                return html;
            }
        },
        axis: {
            rotated: true, // horizontal bar chart
            x: {
                show: true,
                type: 'category' // this needed to load string x value
            },
            y: {
                show: false
            }
        }
    });
}

let renderGenotypeDistributionChart = (chartData, chartObj, compareData) => {

    let container = chartObj ? chartObj.chartContainer : "#tPGenotypeDistribution";
    d3.select(container).selectAll("*").remove();

    // let data = [
    //     {
    //         "genotype": "1a",
    //         "patients" : 1000,
    //     },
    //     {
    //         "genotype": "1b",
    //         "patients" : 1200,
    //     }];

    let data = [];
    for (let key in chartData) {
        let json = chartData[key];
        data.push(json);
    }
    if (data.length == 0) {
        fnNoDataFound(container);
        return;
    }
    data.sort((a, b) => a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, ''));

    let colors = _.pluck(data, 'color'); //color by json data itself
    let chart = c3.generate({
        bindto: container,
        data: {
            json: data, // specify that our above json is the data
            labels: {
                format: (v, id, i, j) => commaSeperatedNumber(v),
            },
            keys: {
                x: 'genotype', // specify that the "name" key is the x value
                value: ["count"] // specify that the "age" key is the y value
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: d => {
                if (!chartObj && compareData != 'compare') {
                    if (d.value) {
                        let filterData = data[d.index];
                        let dataObj = _.clone(d);
                        dataObj['id'] = filterData.genotype;
                        filterPatientsByChart(dataObj, data, 'genotype');
                    } else {
                        console.log('wrong value or event');
                    }
                }

            },
            type: 'bar', // specfify type of plot
            color: (color, d) => colors[d.index],
        },
        legend: {
            show: false
        },
        size: {
            height: chartObj ? chartObj.height : 190,
            width: chartObj ? chartObj.width : 380
        },
        bar: {
            width: {
                ratio: 0.85
            }

        },
        color: {
            pattern: colors
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = data[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                let html = '';
                html = `<div class="customC3ToolTip">
                            <div class="customC3ToolTip-Header">
                            <div>Genotype: ${filterData.genotype}</div>
                            </div>
                            <div class="customC3ToolTip-Body">
                            <div><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div> Patients Count: ${commaSeperatedNumber(value)}</div>
                            </div>
                        </div>`;
                return html;
            }
        },
        axis: {
            rotated: false, // horizontal bar chart
            x: {
                show: true,
                type: 'category', // this needed to load string x value
                label: {
                    text: 'Genotype',
                    position: 'center'
                }
            },
            y: {
                show: false
            }
        }
    });
}

let randerDistributionChartStacked = (data, groupLabel, container, chartType) => {

    data.sort((a, b) => a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, ''));

    let groups = groupLabel;
    chartData = data; 
    let datalabel = [];
    for (let i = 0; i < chartData.length; i++) {
        let json = {};
        json['len'] = 0;
        for (let key in chartData[i]) {
            json['len'] += 1;
        }
        json['len'] -= 2;
        json['total'] = chartData[i]['patients'];
        datalabel.push(json);
    }

    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'genotype',
                value: groups
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            groups: [groups],
            onclick: d => {
                if (d.value) {
                    //filter for genotype
                    filterPatientsByChart(d, chartData, chartType);
                    filterData = chartData[d.index];
                    let dataObj = { 'id': filterData.genotype };
                    //filter for value
                    filterPatientsByChart(dataObj, chartData, 'genotype');
                } else {
                    console.log("improper click and data");
                }
            },
            order: null,
            labels: {
                format: (v, id, i, j) => {
                    if (i != undefined && j == groups.length - 1) {
                        let count = datalabel[i].total;
                        return commaSeperatedNumber(~~count);
                    } else {
                        //return i+'/'+j;
                    }

                }
            }

        },
        size: {
            height: 190,
            width: 380
        },
        color: {
            pattern: customColorsArray()
        },
        axis: {
            rotated: false, // Switch x and y axis position.
            x: {
                show: true,
                type: 'category',
                label: {
                    text: 'Genotype',
                    position: 'center'
                }
            },
            y: {
                show: false,
                tick: null,
                label: null
            }
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
        legend: {
            show: true,
            position: 'center',
            // inset: {
            //     anchor: 'top-right',
            //     x: -120,
            //     y: 10,
            //     step: 10

            // },
            format: (d) => dashUtils.toTitleCase(d),
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    filterData = chartData[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                let html = '';
                html = `<div class="customC3ToolTip">
                            <div class="customC3ToolTip-Header">
                            <div>Genotype: ${filterData.genotype}</div>
                            </div>
                            <div class="customC3ToolTip-Body">
                            <div><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div>${chartType} : ${id} </div>
                            <div><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div>Patient Count: ${commaSeperatedNumber(filterData[id])}</div>
                            <div><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div>Total Count: ${commaSeperatedNumber(filterData.patients)}</div>
                            </div>
                        </div>`;
                return html;
            }
        },
        grid: {
            y: {
                lines: [{
                    value: 0
                }]
            }
        }
    });

}

let renderTreatmentDistribution = (data, keys, chartObj, compareData) => {
    try {
        let container = chartObj ? chartObj.chartContainer : "#tPTreatmenteDistribution";

        //let keys = []; //['Naive','Experienced'],
        let chartData = {};

        //Praveen 03/22/2017 Added check for no data found and refractoring code
        if (data && data.length == 0) {
            fnNoDataFound(container);
            return;
        }
        // for (let key in keysdata) {
        //     keys.push(key);
        // }

        chartData = data;
        let chart = c3.generate({
            bindto: container,
            data: {
                type: 'donut',
                json: chartData,
                keys: {
                    value: keys
                },
                //Praveen:03/22/2017 Added check for no data found
                empty: {
                    label: {
                        text: "No Data Available"
                    }
                },
                onclick: d => {
                    if (!chartObj && compareData != 'compare') {
                        if (d.value) {
                            filterPatientsByChart(d, chartData, 'Treatment');
                        } else {
                            console.log("improper click and data");
                        }
                    }
                }
            },
            size: {
                height: chartObj ? chartObj.height : 200,
                width: chartObj ? chartObj.width : 300
            },
            donut: {
                width: chartObj ? 100 : 45
            },
            legend: {
                show: true,
                //position:'right',
            },
            color: {
                // pattern: ['#809FBC', '#5A6D8D', '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
                pattern: chartObj ? chartObj.colors : ['#2e7e97', '#abd6ba']
            },
            tooltip: {
                grouped: false,
                // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
                contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
                    let dataObj = d[0],
                        id = dataObj.index,
                        value = dataObj.value,
                        ratio = (dataObj.ratio * 100).toFixed(2),
                        filterData = chartData[id];

                    let $$ = this,
                        config = $$.config,
                        bgcolor
                    bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                    //var groupCirrhosis = _.groupBy(data[id], 'cirrhosis');
                    let html = '';
                    html = `<div class="customC3ToolTip">
                            <div class="customC3ToolTip-Header">
                                <div>${dataObj.id}</div>
                            </div>
                            <div class="customC3ToolTip-Body">
                                <div>
                                    <div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div> Patient Count : ${commaSeperatedNumber(value)}
                                </div>
                            </div>
                        </div>`;
                    return html;
                }
            }
        });
    } catch (ex) {
        console.log(ex);

    }
}

let renderTreatmentStatusDistribution = (data, keys, chartObj, compareData) => {
    try {
        let container = chartObj ? chartObj.chartContainer : "#treatmnetStatusDistributionChart";

        //let keys = []; //['Naive','Experienced'],
        let chartData = {};

        //Praveen 03/22/2017 Added check for no data found and refractoring code
        if (data && data.length == 0) {
            fnNoDataFound(container);
            return;
        }

        chartData = data;
        let chart = c3.generate({
            bindto: container,
            data: {
                type: 'donut',
                json: chartData,
                keys: {
                    value: keys
                },
                //Praveen:03/22/2017 Added check for no data found
                empty: {
                    label: {
                        text: "No Data Available"
                    }
                },
                onclick: d => {
                    if (!chartObj && compareData != 'compare') {
                        if (d.value) {
                            let key = {};
                            key.id = 'IS_COMPLETED';
                            key.value = d.value == 'Treatment Completion' ? 'Yes' : 'No';
                            filterPatientsByChart(key, chartData, 'is_completed');
                        } else {
                            console.log("improper click and data");
                        }
                    }
                }
            },
            size: {
                height: chartObj ? chartObj.height : 200,
                width: chartObj ? chartObj.width : 300
            },
            donut: {
                width: chartObj ? 100 : 45
            },
            legend: {
                show: true,
                //position:'right',
            },
            color: {
                // pattern: ['#809FBC', '#5A6D8D', '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
                pattern: chartObj ? chartObj.colors : [ '#e95a52', '#2e7e97']
            },
            tooltip: {
                grouped: false,
                // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
                contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
                    let dataObj = d[0],
                        id = dataObj.index,
                        value = dataObj.value,
                        ratio = (dataObj.ratio * 100).toFixed(2),
                        filterData = chartData[id];

                    let $$ = this,
                        config = $$.config,
                        bgcolor
                    bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                    //var groupCirrhosis = _.groupBy(data[id], 'cirrhosis');
                    let html = '';
                    html = `<div class="customC3ToolTip">
                            <div class="customC3ToolTip-Header">
                                <div>${dataObj.id}</div>
                            </div>
                            <div class="customC3ToolTip-Body">
                                <div>
                                    <div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div> Patient Count : ${commaSeperatedNumber(value)}
                                </div>
                            </div>
                        </div>`;
                    return html;
                }
            }
        });
    } catch (ex) {
        console.log(ex);

    }
}


let cirrhosisPlotChart = (container, data, keys) => {

    d3.select(container).selectAll("*").remove();
    if (data[0] == undefined) {
        return;
    }

    //console.log(data)
    let chart = c3.generate({
        bindto: container,
        padding: {
            top: 5,
            right: 0,
            bottom: 10,
            left: 15
        },
        data: {
            type: 'bar',
            json: data, // At Zero Index we have Decompansated Cirrhosis data
            keys: {
                x: 'cirrhosis',
                value: keys
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            //groups: [groups],
            onclick: d => {
                if (d.value) {
                    filterPatientsByChart(d, data, 'Treatment');
                } else {
                    console.log("improper click and data");
                }
            },
            order: 'null',
            labels: {
                format: v => commaSeperatedNumber(v),
            }

        },
        size: {
            height: 200,
            width: 170
        },
        color: {
            pattern: ["#abd6ba", "#f1cb6a", "#69bae7", "#e95a52", '#2e7e97']
        },
        axis: {
            x: {
                type: 'category',
                label: null
            },
            y: {
                show: false
            }
        },
        bar: {
            width: {
                ratio: 0.9
            }
        },
        legend: {
            show: false,
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = data[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                let html = '';
                html = `<div class="customC3ToolTip">
                            <div class="customC3ToolTip-Header">
                                <div>${id}</div>
                            </div>
                            <div class="customC3ToolTip-Body">
                                <div>
                                    <div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div>Patients Count: ${commaSeperatedNumber(value)}
                                </div>
                            </div>
                        </div>`;
                return html;
            }
        },
        grid: {
            y: {
                lines: [{
                    value: 0
                }]
            }
        }
    });
}

function renderDeseasePrediction(data, chartObj, compareData) {
    // $('#tPDiseasePrediction').html("Disease Progression Chart.");
    let container = chartObj ? chartObj.chartContainer : "#tPDiseasePrediction";

    let keys = ['APRI > 1', 'APRI < 1'],
        chartData = {};

    chartData['APRI > 1'] = data['Y'] ? data['Y'].count : 0;

    chartData['APRI < 1'] = data['N'] ? data['N'].count : 0;
    //Praveen 03/22/2017 Added check for no data found and refractoring code
    let totalPatients = chartData['APRI < 1'] + chartData['APRI > 1'];
    if (totalPatients == 0) {
        fnNoDataFound(container);
        return;
    }

    let color = ['#f1cb6a', '#e95a52'];
    let colors = chartObj ? chartObj.colors : color;
    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: [chartData],
            keys: {
                value: keys
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: function(d) {
                if (!chartObj && compareData != 'compare') {
                    if (d.value) {
                        filterPatientsByChart(d, [chartData], 'APRI');
                    } else {
                        console.log("improper click and data");
                    }
                }

            },
        },
        size: {
            height: chartObj ? chartObj.height : 220,
            width: chartObj ? chartObj.width : 370
        },
        donut: {
            width: chartObj ? 100 : 50
        },
        legend: {
            show: true,
            position: 'right',
        },
        color: {
            pattern: colors
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2);
                // filterData = chartData[id];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + id + '<span style="font-weight:500;"> (' + commaSeperatedNumber(ratio) + '%)</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div> Patients Count: ' + commaSeperatedNumber(value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}

let renderViralScoreCharts = (chartData, chartObj, compareData) => {
    // console.log(reporttype);

    let container = chartObj ? chartObj.chartContainer : '#tPSVR';
    let groupedData = [];
    let labelb = '';
    let labela = '';
    let tooltiplabel = '';
    let html = '';
    let data = [];
    // console.log();
    let totalPatient = 0;
    for (let ageGroup in chartData) {
        let json = chartData[ageGroup];
        json['patients'] = json['count'];
        json['color'] = json['color'];
        data.push(json);
        totalPatient += json['count'];

    }
    if (compareData != 'compare') {
        html += `<span class="boldfnt"> N: </span> <span>${commaSeperatedNumber(totalPatient)} Patients</span>`;
        $('.viralSVRNData').html(html);
    }

    //Praveen 03/22/2017 Added check for no data found and refractoring code
    if (totalPatient == 0) {
        $(container).html('<div class="nodataFound">No Data Available</div>');
        return;
    }

    labelb = 'Viral Load Score';
    labela = 'Number of Patients';
    tooltiplabel = 'Patients Count';
    color = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
    let colors = chartObj ? chartObj.colors : color;

    d3.select(container).selectAll("*").remove();
    var chart = c3.generate({
        bindto: container,
        padding: {
            top: 2
        },
        bar: {
            width: {
                ratio: 0.75
            }
        },
        size: {
            height: chartObj ? chartObj.height : 230,
            width: chartObj ? chartObj.width : 480
        },
        color: {
            pattern: colors
        },
        data: {
            json: data, // specify that our above json is the data
            keys: {
                x: 'SVR', // specify that the "name" key is the x value
                value: ["patients"] // specify that the "age" key is the y value
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: function(d) {
                if (!chartObj && compareData != 'compare') {
                    if (d.value) {
                        let filterData = data[d.index];
                        let dataObj = {
                            id: filterData['SVR']
                        }
                        filterPatientsByChart(dataObj, data, 'SVR');
                    } else {
                        console.log("improper click and data");
                    }
                }
            },
            type: 'bar',
            color: function(inColor, data) {

                //var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                if (data.index !== undefined) {
                    return colors[data.index];
                }
                return inColor;
            },
            labels: {
                format: function(v, id, i, j) {
                    var labelv = '';
                    //console.log(v,id);
                    if (i != undefined) {
                        return commaSeperatedNumber(v);
                    }
                }
            }
        },
        axis: {
            x: {
                type: 'category',
                label: {
                    text: labelb,
                    position: 'center'
                }
            },
            y: {
                label: {
                    text: labela,
                    position: 'middle'
                },
                tick: {
                    count: 6,
                    format: (d) => commaSeperatedNumber(Math.round(d))
                }
            }
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                let dataObj = d[0];
                let htmlconditional = '';
                let filterData = data[dataObj.index];
                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + filterData['SVR'] + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> ' + tooltiplabel + ': ' + commaSeperatedNumber(dataObj.value) + '</div>' + htmlconditional +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        legend: {
            show: false
        }
    });
}

//insurance plan distribution
function renderInsuranceDistributionChart(data, chartObj, compareData) {
    // $('#tPDiseasePrediction').html("Disease Progression Chart.");
    let container = chartObj ? chartObj.chartContainer : "#tPInsurancePlan";
    if (compareData != 'compare')
        $('#insuranceDistriChart').html(getHTMLCustomTextN(data.total, Pinscriptive.dashboard.treatedPatients.totalpatients, 'Patients'));
    //Praveen 03/22/2017 Added check for no data found and refractoring code
    if(data && data.total == 0){
      $(container).html('<div class="nodataFound">No Data Found</div>');
      return;
    }

    let color = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
    let colors = chartObj ? chartObj.colors : color;

    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: data.data,
            keys: {
                value: data.key
            },
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: function(d) {
                if (!chartObj && compareData != 'compare') {
                    if (d.value) {
                        if (data.filter) {

                            filterPatientsByChart(d, data.data, 'insurancetype');
                        } else {
                            filterPatientsByChart(d, data.data, 'insurance');
                        }

                    } else {
                        console.log("improper click and data");
                    }
                }
            },
        },
        size: {
            height: chartObj ? chartObj.height : 200,
            width: chartObj ? chartObj.width : 300
        },
        donut: {
            width: chartObj ? 100 : 55
        },
        legend: {
            show: true,
            //position: 'right',
        },
        color: {
            pattern: colors
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2);
                // filterData = chartData[id];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                //var groupid = dataObj.index == 0?'Yes':'No';
                // var groupTreatment = _.groupBy(data[groupid],'treatment');
                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + id + '<span style="font-weight:500;"> (' + commaSeperatedNumber(ratio) + '%)</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div> Patients Count: ' + commaSeperatedNumber(value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}

function renderTreatmentPriority(chartData, chartObj, compareData) {
    container = chartObj ? chartObj.chartContainer : '#tPTreatmentPriority';

    let isFiltered = _.findWhere(filtersArray, {
        identifier: 'fibrovalue'
    }) ? true : false;

    let pieData = {},
        stages = [];
    //Praveen 03/22/2017 Added check for no data
    if (chartData && chartData.totalPatients == 0) {
        fnNoDataFound(container);
        return;
    }
    //changed data
    chartData = chartData["data"];
    //data preparation for pie chart
    chartData.forEach(function(e) {
        stages.push('Stage ' + e.stage);
        pieData['Stage ' + e.stage] = e.patientCount;
    });

    let color = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", '#f1cb6a'];
    let colors = chartObj ? chartObj.colors : color;
    let chart = c3.generate({
        bindto: container,
        data: {
            json: [pieData],
            keys: {
                //x: 'stage',
                //value: ['avgFibrosis']
                value: stages,
            },
            type: 'donut',
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: function(d, element) {
                    if (!chartObj && compareData != 'compare') {
                        if (d.value) {
                            let filterData = chartData[d.index];
                            let dataObj = _.clone(d);
                            dataObj.id = filterData.range;
                            filterPatientsByChart(dataObj, chartData, 'fibroValue');
                        } else {
                            console.log("improper click and data");
                        }
                    }
                }
                //c3js library have issue sometimes it not handle proper click event for stacked chart
                //if value is not undefined then call method and display data accordingly otherwise not

        },
        color: {
            //pattern: ["#f1cb6a"]
            pattern: colors
        },
        donut: {
            width: chartObj ? 100 : 50
        },
        size: {
            height: chartObj ? chartObj.height : 220,
            width: chartObj ? chartObj.width : 370
        },
        legend: {
            show: true,
            position: 'right',
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    filterData = chartData[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip" style="min-width:250px">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Fibrosis ' + dataObj.name + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Average Fibrosis Value : ' + filterData.avgFibrosis + '</div>' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + commaSeperatedNumber(filterData.patientCount) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}


function renderRiskDistributionDonutChart(chartData, chartObj, compareData) {
    let container = chartObj ? chartObj.chartContainer : "#tPRiskDistributionDonut";

    let keys = ['HIV', 'Mental Health', 'Alcohol', 'Renal Failure', 'Pregnancy'];

    //Praveen 03/22/2017 Added check for no data found and refractoring code

    if (chartData.total == 0) {
        fnNoDataFound(container);
        return;
    }

    let color = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", '#f1cb6a'];
    let colors = chartObj ? chartObj.colors : color;
    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: [chartData.data],
            keys: {
                value: keys
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: function(d) {
                if (!chartObj && compareData != 'compare') {
                    if (d.value) {
                        filterPatientsByChart(d, [chartData.data], 'risk');
                    } else {
                        console.log("improper click and data");
                    }
                }

            },
        },
        size: {
            height: chartObj ? chartObj.height : 220,
            width: chartObj ? chartObj.width : 370
        },
        donut: {
            width: chartObj ? 100 : 50
        },
        legend: {
            show: true,
            position: 'right',
        },
        color: {
            pattern: colors
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2);
                // filterData = chartData[id];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                //var groupid = dataObj.index == 0?'Yes':'No';
                // var groupTreatment = _.groupBy(data[groupid],'treatment');
                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + id + '<span style="font-weight:500;"> (' + commaSeperatedNumber(ratio) + '%)</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div> Patients Count: ' + commaSeperatedNumber(value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });

}



function renderSurvivalRate(baseData, chartObj, compareData) {
    let container = chartObj ? chartObj.chartContainer : '#tPSurvivalRate';

    d3.select(container).selectAll("*").remove();

    /* console.log(p713);
     console.log(p526);
     console.log(p196);
     console.log(p60);
     console.log(p19);*/
    //Praveen 03/22/2017 added check for no data found
    if (baseData && baseData.totalCount == 0) {
        fnNoDataFound(container);
        return;
    }
    let color = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", "#f1cb6a"];
    let colors = chartObj ? chartObj.colors : color;
    var chart = c3.generate({
        bindto: container,
        padding: {
            top: 5,
            right: 140,
            bottom: 45, // Nisha 2/24/2017 Modiified the value for padding bottom; Previous value : 10
            left: 65,
        },
        color: {
            pattern: colors
        },
        data: {
            columns: baseData.dataColumns,
            type: 'bar',

            // colors: {
            //     "71.3% Mortality": "#2e7e97",
            //     "52.6% Mortality": "#abd6ba",
            //     "19.6% Mortality": "#e95a52",
            //     "6.0% Mortality": "#69bae7",
            //     "1.9% Mortality": '#f1cb6a'
            // },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: function(e) {
                if (!chartObj && compareData != 'compare') {
                    let range = '';
                    let probm = '';
                    // alert(e.id);
                    switch (e.id) {
                        case "71.3% Mortality":
                            range = '>40';
                            probm = '71.3';
                            break;
                        case "52.6% Mortality":
                            range = "30-39";
                            probm = '52.6';
                            break;
                        case "19.6% Mortality":
                            range = "20-29";
                            probm = '19.6';

                            break;
                        case "6.0% Mortality":
                            probm = '6.0';
                            range = "10-19";
                            break;
                        case "1.9% Mortality":
                            probm = '1.9';
                            range = "0-9";
                            break;
                    }
                    //  console.log(e);
                    dataObj = _.clone(e);
                    //filter by meld score
                    dataObj.id = range;
                    dataObj.name = "avgMeldScore";
                    // console.log(dataObj);
                    Session.set('Mprob', probm);
                    filterPatientsByChart(dataObj, [], 'meldScore');
                    // filterChartByData(dataObj, 'meldScore');
                }
            },
            groups: [
                baseData.probgroup
            ],
            order: null,
            labels: {
                format: function(v, id, i, j) {
                    var labelv = '';
                    //  console.log(probgroup.length);
                    if (i != undefined && j == baseData.probgroup.length - 1) {
                        labelv = commaSeperatedNumber(baseData.ptotals[i]);
                        return labelv;
                    } else {}
                }
            }
        },
        axis: {
            x: {
                type: 'category',
                categories: baseData.XnameArray,
                tick: {
                    rotate: -45, // Nisha 2/24/2017 Modiified the value for rotating right; Previous value : 75
                    multiline: false
                }
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                },
                tick: {
                    count: 6,
                    format: (d) => Math.round(d),
                }
            }
        },
        size: {
            height: chartObj ? chartObj.height : 220,
            width: chartObj ? chartObj.width : 800
        }
        /*,
                tooltip: {
                    contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                        var sum = 0;
                        d.forEach(function(e) {
                            sum += e.value
                        })
                        defaultTitleFormat = function() {
                            return sum
                        };
                        return c3.chart.internal.fn.getTooltipContent.apply(this, arguments);
                    }
                }*/
        ,
        legend: {
            show: true,
            position: 'right'
                //             position:'inset',
                //             inset: {
                //     anchor: 'top-right'

            //   }
        }
    });


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


//render donut for mortality rate
function renderMortalityRateChart(chartData, chartObj, compareData) {
    let container = chartObj ? chartObj.chartContainer : "#tPSurvivalRateLegends";
    let keys = ['71.3% Mortality', '52.6% Mortality', '19.6% Mortality', '6.0% Mortality', '1.9% Mortality'];

    let color = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", '#f1cb6a'];
    let colors = chartObj ? chartObj.colors : color;
    if (chartData && chartData.totalPatients == 0) {
        fnNoDataFound(container);
        return;
    }
    chartData = chartData["data"];

    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: chartData,
            keys: {
                value: keys
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            onclick: function(d) {
                if (!chartObj && compareData != 'compare') {
                    if (d.value) {
                        let filterData = _.where(chartData, {
                            identifier: d.id.replace(' Mortality', '')
                        })[0];
                        let dataObj = _.clone(d);
                        dataObj['id'] = filterData.range;
                        filterPatientsByChart(dataObj, chartData, 'meldScore');
                    } else {
                        console.log('Wrong click or events');
                    }
                }
            },


        },
        size: {
            height: chartObj ? chartObj.height : 220,
            width: chartObj ? chartObj.width : 370
        },
        donut: {
            width: chartObj ? 100 : 50
        },
        legend: {
            show: true,
            position: 'right',
        },
        color: {
            pattern: colors
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2);

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div> Mortality Rate: ' + id.replace('Mortality', '') + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div> Patients Count: ' + commaSeperatedNumber(value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}

function renderCostBurden(finalData) {
    let antiviralTherapyPatientCount = _.pluck(finalData, 'Antiviral Therapy_count').reduce((a, b) => a + b, 0);
    let liverDiseasePatientCount = _.pluck(finalData, 'Liver Disease_count').reduce((a, b) => a + b, 0);
    let physicianServicePatientCount = _.pluck(finalData, 'Physician Service_count').reduce((a, b) => a + b, 0);
    let hospitalizationPatientCount = _.pluck(finalData, 'Hospitalization_count').reduce((a, b) => a + b, 0);

    $('#cost-burden-at-N').html(commaSeperatedNumber(antiviralTherapyPatientCount)+' Patients');
    $('#cost-burden-ld-N').html(commaSeperatedNumber(liverDiseasePatientCount)+' Patients');
    $('#cost-burden-ps-N').html(commaSeperatedNumber(physicianServicePatientCount)+' Patients');
    $('#cost-burden-h-N').html(commaSeperatedNumber(hospitalizationPatientCount)+' Patients');

    let groups = ["Antiviral Therapy", "Liver Disease", "Physician Service", "Hospitalization"]; //["Physician Service", "Hospitalization", "Diagnostic Testing", "Liver Disease", "Antiviral Therapy"];
    finalData.sort(function(a, b) {
        return a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, '');
    });

    let colors = _.pluck(finalData, 'color'); //getcolors from data itself
    // console.log("** renderCostBurden***");
    // console.log(finalData);
    let container = '#tPCostBurden';
    if (antiviralTherapyPatientCount == 0) {
        fnNoDataFound('#tPCostBurden');
    } else {
        renderCostburdenChart('#tPCostBurden', finalData);
    }


    //// New Chart to separate Cost burden chart
    //// Physican Service cost chart
    if (physicianServicePatientCount == 0) {
        fnNoDataFound('#tPPhysicianCostChart');
    } else {
        c3.generate({
            bindto: "#tPPhysicianCostChart",
            padding: {
                top: 5,
                right: 140,
                bottom: 10,
                left: 80
            },
            data: {
                type: 'bar',
                json: finalData,
                keys: {
                    x: 'genotype',
                    value: ["Physician Service"]
                },
                //Praveen:03/22/2017 Added check for no data found
                empty: {
                    label: {
                        text: "No Data Available"
                    }
                },
                //groups: [groups],
                onclick: function(d) {
                    if (d.value) {
                        filterPatientsByChart(d, finalData, 'costBurden');
                    } else {
                        console.log("improper click and data");
                    }
                },
                order: 'null',
                labels: {
                    format: function(v, id, i, j) {
                        if (i != undefined) {
                            let val = id + '_count';
                            return commaSeperatedNumber(finalData[i][val]);
                        }
                    }
                },
                color: (color, d) => colors[d.index],
            },
            size: {
                height: 210,
                width: 600
            },
            zoom: {
                enabled: false
            },
            color: {
                //Added color for chart
                pattern: _.pluck(finalData, 'color') //["#f1cb6a", "#69bae7", "#e95a52", '#2e7e97', "#abd6ba"]
            },
            axis: {
                x: {
                    type: 'category',
                    label: {
                        text: 'Genotype',
                        position: 'outer-center'
                    }
                },
                y: {
                    tick: {
                        count: 5,
                        format: function(d) {
                            // OLD
                            //console.log(d);
                            return '$' + autoFormatCostValue(d); //'$' + Math.round(d / 1000) + 'k';
                            //  return '$' + commaSeperatedNumber(d);
                        },
                    },
                    label: {
                        text: 'Cost',
                        position: 'outer-middle'
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            // legend: {
            //     show: true,
            //     position: 'right'
            // },
            legend: {
                show: true,
                position: 'inset',
                inset: {
                    anchor: 'top-right',
                    x: -125,
                    y: 10,
                    step: 10

                }

            },
            tooltip: {
                grouped: false,
                // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
                contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                    let dataObj = d[0],
                        id = dataObj.id,
                        value = dataObj.value,
                        ratio = (dataObj.ratio * 100).toFixed(2),
                        filterData = finalData[dataObj.index];

                    let $$ = this,
                        config = $$.config,
                        bgcolor
                    bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                    // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                    let html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div>' + id + '</div>' +
                        '</div>' +
                        '<div class="customC3ToolTip-Body">' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patients Count: ' + commaSeperatedNumber(filterData[id + "_count"]) + '</div>' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Cost: $' + commaSeperatedNumber(Math.round(value, 2)) + '</div>' +
                        '</div>' +
                        '</div>';
                    return html;
                }
            },
            grid: {
                y: {
                    lines: [{
                        value: 0
                    }]
                }
            }
        });
    }
    //// New Chart to separate Cost burden chart
    //// Hospitalization cost chart
    if (hospitalizationPatientCount == 0) {
        fnNoDataFound('#tPHospitalizationCostChart');
    } else {
        c3.generate({
            bindto: "#tPHospitalizationCostChart",
            padding: {
                top: 5,
                right: 140,
                bottom: 10,
                left: 80
            },
            data: {
                type: 'bar',
                json: finalData,
                keys: {
                    x: 'genotype',
                    value: ["Hospitalization"]
                },
                //Praveen:03/22/2017 Added check for no data found
                empty: {
                    label: {
                        text: "No Data Available"
                    }
                },
                //groups: [groups],
                onclick: function(d) {
                    if (d.value) {
                        filterPatientsByChart(d, finalData, 'costBurden');
                    } else {
                        console.log("improper click and data");
                    }
                },
                order: 'null',
                labels: {
                    format: function(v, id, i, j) {
                        if (i != undefined) {
                            let val = id + '_count';
                            return commaSeperatedNumber(finalData[i][val]);
                        }
                    }
                },
                color: (color, d) => colors[d.index],

            },
            size: {
                height: 210,
                width: 600
            },
            zoom: {
                enabled: false
            },
            color: {
                pattern: colors
            },
            axis: {
                x: {
                    type: 'category',
                    label: {
                        text: 'Genotype',
                        position: 'outer-center'
                    }
                },
                y: {
                    tick: {
                        count: 5,
                        format: function(d) {
                            //console.log(d);
                            return '$' + autoFormatCostValue(d);; //'$' + Math.round(d / 1000) + 'k';
                        },
                    },
                    label: {
                        text: 'Cost',
                        position: 'outer-middle'
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            // legend: {
            //     show: true,
            //     position: 'right'
            // },
            legend: {
                show: true,
                position: 'inset',
                inset: {
                    anchor: 'top-right',
                    x: -125,
                    y: 10,
                    step: 10

                }

            },
            tooltip: {
                grouped: false,
                // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
                contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                    let dataObj = d[0],
                        id = dataObj.id,
                        value = dataObj.value,
                        ratio = (dataObj.ratio * 100).toFixed(2),
                        filterData = finalData[dataObj.index];

                    let $$ = this,
                        config = $$.config,
                        bgcolor
                    bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                    // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                    let html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div>' + id + '</div>' +
                        '</div>' +
                        '<div class="customC3ToolTip-Body">' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patients Count: ' + commaSeperatedNumber(filterData[id + "_count"]) + '</div>' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Cost: $' + commaSeperatedNumber(Math.round(value, 2)) + '</div>' +
                        '</div>' +
                        '</div>';
                    return html;
                }
            },
            grid: {
                y: {
                    lines: [{
                        value: 0
                    }]
                }
            }
        });
    }

    //// New Chart to separate Cost burden chart
    //// Liver cost chart
    if (liverDiseasePatientCount == 0) {
        fnNoDataFound('#tPLiverCostChart');
    } else {
        c3.generate({
            bindto: "#tPLiverCostChart",
            padding: {
                top: 5,
                right: 140,
                bottom: 10,
                left: 80
            },
            data: {
                type: 'bar',
                json: finalData,
                keys: {
                    x: 'genotype',
                    value: ["Liver Disease"]
                },
                //Praveen:03/22/2017 Added check for no data found
                empty: {
                    label: {
                        text: "No Data Available"
                    }
                },
                //groups: [groups],
                onclick: function(d) {
                    if (d.value) {
                        filterPatientsByChart(d, finalData, 'costBurden');
                    } else {
                        console.log("improper click and data");
                    }
                },
                order: 'null',
                labels: {
                    format: function(v, id, i, j) {
                        if (i != undefined) {
                            let val = id + '_count';
                            return commaSeperatedNumber(finalData[i][val]);
                        }
                    }
                },
                color: (color, d) => colors[d.index],

            },
            size: {
                height: 210,
                width: 600
            },
            zoom: {
                enabled: false
            },
            color: {
                pattern: _.pluck(finalData, 'color') //["#e95a52", "#abd6ba", "#f1cb6a", "#69bae7", '#2e7e97']
            },
            axis: {
                x: {
                    type: 'category',
                    label: {
                        text: 'Genotype',
                        position: 'outer-center'
                    }
                },
                y: {
                    tick: {
                        count: 5,
                        format: function(d) {
                            // OLD
                            return '$' + autoFormatCostValue(d); //'$' + Math.round(d / 1000) + 'k';
                            //return '$' + commaSeperatedNumber(d);
                        },
                    },
                    label: {
                        text: 'Cost',
                        position: 'outer-middle'
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            // legend: {
            //     show: true,
            //     position: 'right'
            // },
            legend: {
                show: true,
                position: 'inset',
                inset: {
                    anchor: 'top-right',
                    x: -125,
                    y: 10,
                    step: 10

                }

            },
            tooltip: {
                grouped: false,
                // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
                contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                    let dataObj = d[0],
                        id = dataObj.id,
                        value = dataObj.value,
                        ratio = (dataObj.ratio * 100).toFixed(2),
                        filterData = finalData[dataObj.index];

                    let $$ = this,
                        config = $$.config,
                        bgcolor
                    bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                    // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                    let html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div>' + id + '</div>' +
                        '</div>' +
                        '<div class="customC3ToolTip-Body">' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patients Count: ' + commaSeperatedNumber(filterData[id + "_count"]) + '</div>' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Cost: $' + commaSeperatedNumber(Math.round(value, 2)) + '</div>' +
                        '</div>' +
                        '</div>';
                    return html;
                }
            },
            grid: {
                y: {
                    lines: [{
                        value: 0
                    }]
                }
            }
        });
    }
}
//function to plot cost burden antiviral therapy chart
let renderCostburdenChart = (container, finalData) => {
    let colors = _.pluck(finalData, 'color');

    var chart = c3.generate({
        bindto: container,
        padding: {
            top: 5,
            right: 140,
            bottom: 10,
            left: 80
        },
        data: {
            type: 'bar',
            json: finalData,
            keys: {
                x: 'genotype',
                //value: groups
                value: ["Antiviral Therapy"]
            },
            //Praveen:03/22/2017 Added check for no data found
            empty: {
                label: {
                    text: "No Data Available"
                }
            },
            //groups: [groups],
            onclick: function(d) {
                if (d.value) {
                    filterPatientsByChart(d, finalData, 'costBurden');
                } else {
                    console.log("improper click and data");
                }
            },
            order: 'null',
            labels: {
                format: function(v, id, i, j) {
                    if (i != undefined) {
                        let val = id + '_count';
                        return commaSeperatedNumber(finalData[i][val]);
                    }
                }
            },
            color: (color, d) => colors[d.index],

        },
        size: {
            height: 210,
            width: 600
        },
        zoom: {
            enabled: false
        },
        color: {
            pattern: colors //["#abd6ba", "#f1cb6a", "#69bae7", "#e95a52", '#2e7e97']
        },
        axis: {
            x: {
                type: 'category',
                label: {
                    text: 'Genotype',
                    position: 'outer-center'
                }
            },
            y: {
                tick: {
                    count: 5,
                    format: function(d) {
                        return '$' + autoFormatCostValue(d); //'$' + Math.round(d / 1000) + 'k';
                    },
                },
                label: {
                    text: 'Cost',
                    position: 'outer-middle'
                }
            }
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
        // legend: {
        //     show: true,
        //     position: 'right'
        // },
        legend: {
            show: true,
            position: 'inset',
            inset: {
                anchor: 'top-right',
                x: -125,
                y: 10,
                step: 10

            }

        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = finalData[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patients Count: ' + commaSeperatedNumber(filterData[id + "_count"]) + '</div>' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Cost: $' + commaSeperatedNumber(Math.round(value, 2)) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        grid: {
            y: {
                lines: [{
                    value: 0
                }]
            }
        }
    });
}

function handleGenotypeSelect(value) {
    let data = [],
        chartData = [],
        groupLabel = [],
        isDataFiltered = filtersArray.length > 0 ? true : false;

    chartData = treatedPatientsData;

    if (value == 'gender') {
        for (let key in chartData.gender) {
            let genLabel = (key == 'M' ? 'Male' : (key == 'F' ? 'Female' : 'Unknown'));
            groupLabel.push(genLabel);
        }
        randerDistributionChartStacked(chartData.genderGenotype, groupLabel, "#tPGenotypeDistribution", 'Gender');
    } else if (value == 'cirrhosis') {

        for (let key in chartData.cirrhosis) {
            let lbl = key == 'Yes' ? 'Cirrhosis' : 'Non Cirrhosis';
            groupLabel.push(lbl);
        }

        randerDistributionChartStacked(chartData.cirrhosisGenotype, groupLabel, "#tPGenotypeDistribution", 'Cirrhosis');
    } else if (value == 'treatment') {

        for (let key in chartData.treatment) {
            groupLabel.push(key);
        }
        randerDistributionChartStacked(chartData.treatmentGenotype, groupLabel, "#tPGenotypeDistribution", 'Treatment');
    } else if (value == 'race') {
        var groups = [];
        for (let key in chartData.race) {
            groups.push(dashUtils.toTitleCase(key));
        }
        randerDistributionChartStacked(chartData.raceGenotype, groups, "#tPGenotypeDistribution", 'Race');

    } else if (value == 'age') {
        let groups = [];

        for (let key in chartData.age) {
            groups.push(key);
        }
        //sort chart data
        groups.sort((a, b) => {
            let age1 = a.split('-')[0],
                age2 = b.split('-')[0];

            age1 = age1.replace('+', '');
            age2 = age2.replace('+', '');

            return age1 - age2;
        });
        randerDistributionChartStacked(chartData.ageGenotype, groups, "#tPGenotypeDistribution", 'Age');
    } else {
        renderGenotypeDistributionChart(chartData.genotype);
    }
}


// Use a modified SI formatter that uses "B" for Billion.
var siFormat = d3.format("s");

function filterPatientsByChart(dataKey, data, filterKey) {
    let isAlreadyFiltered = dashUtils.checkFilterExists(filterKey, filtersArray);

    if (isAlreadyFiltered)
        return;

    dashUtils.showChartMask();

    filtersArray = dashUtils.filterPatientsByChart(dataKey, filterKey, filtersArray);

    getFiltersData(filtersArray);
    
    dashUtils.addFilterBreadCrums(filtersArray, 'dashBoard-breadCrumSections');
}

//function to handle the clicks on bread drums
function handleBreadCrumClick(obj, removeAll) {
    dashUtils.showChartMask();

    filtersArray = dashUtils.deleteBreadCrum(obj, filtersArray, removeAll);

    getFiltersData(filtersArray);
    dashUtils.addFilterBreadCrums(filtersArray, 'dashBoard-breadCrumSections');

}

//function to get filtered data from the backend
function getFiltersData(filtersArray) {
    // console.log("*** filtersArray ****");
    Meteor.call('filterDataForDashBoard', filtersArray, (error, response) => {
        //console.log('********Filter Response***********');
        //console.log(response);

        let decompressed_object = LZString.decompress(response);

        let resulting_object = JSON.parse(decompressed_object);
        Pinscriptive.dashboard.treatedPatients = resulting_object;
        treatedPatientsData = resulting_object;
        // added by jayesh 2th may 2017 for medicaiton dropdown 
        medicationList.set(treatedPatientsData.MarketShareOverMonthsChartData.singleMedicationList);
        renderChartsInUI(resulting_object);
        getFiltersDataClient(filtersArray);
        dashUtils.finalizeFilterProcess(resulting_object, $selectizeCombo[0]);
        // dashUtils.hideChartMask();
    });
}


//function to render the data comparsion summary
let renderDataComparisionSummary = (imsDataObj, phsDataObj) => {

    let imsSummaryHtml = `<div class="compareSummaryContainer">
                            <div><i class="fa fa-users compareSummaryLabelIcon" aria-hidden="true" title="Total Patients"></i> <span class="compareSummaryValue">${commaSeperatedNumber(imsDataObj.totalpatients)}</span></div>
                            <div><i class="fa fa-male compareSummaryLabelIcon" aria-hidden="true" title="Male Patients"></i> <span class="compareSummaryValue">${commaSeperatedNumber(imsDataObj.gender.M == undefined?0:imsDataObj.gender.M.count)}</span></div>
                            <div><i class="fa fa-female compareSummaryLabelIcon" aria-hidden="true" title="Female Patients"></i><span class="compareSummaryValue">${commaSeperatedNumber(imsDataObj.gender.F== undefined?0:imsDataObj.gender.F.count)}</span></div>
                            <div><i class="fa fa-transgender compareSummaryLabelIcon" aria-hidden="true" title="Unknown Patients"></i><span class="compareSummaryValue">${commaSeperatedNumber(imsDataObj.gender.U == undefined?0:imsDataObj.gender.U.count)}</span></div>
                        </div>`;

    let phsSummaryHtml = `<div class="compareSummaryContainer">
                            <div><i class="fa fa-users compareSummaryLabelIcon" aria-hidden="true" title="Total Patients"></i> <span class="compareSummaryValue">${commaSeperatedNumber(phsDataObj.totalpatients)}</span></div>
                            <div><i class="fa fa-male compareSummaryLabelIcon" aria-hidden="true" title="Male Patients"></i> <span class="compareSummaryValue">${commaSeperatedNumber(phsDataObj.gender.M == undefined?0:phsDataObj.gender.M.count)}</span></div>
                            <div><i class="fa fa-female compareSummaryLabelIcon" aria-hidden="true" title="Female Patients"></i><span class="compareSummaryValue">${commaSeperatedNumber(phsDataObj.gender.F == undefined?0:phsDataObj.gender.F.count)}</span></div>
                            <div><i class="fa fa-transgender compareSummaryLabelIcon" aria-hidden="true" title="Unknown Patients"></i><span class="compareSummaryValue">${commaSeperatedNumber(phsDataObj.gender.U == undefined?0:phsDataObj.gender.U.count)}</span></div>
                        </div>`;

    $('#imsDataViewSection').html(imsSummaryHtml);
    $('#phsDataViewSection').html(phsSummaryHtml);

}

/**
 * Description: Method to summation of array value
 * Reference: http://stackoverflow.com/questions/3762589/fastest-javascript-summation
 */
let arraySum = (pArray) => {
    return pArray.reduce((pv, cv) => pv + cv, 0);
};

/**
 * Summation of single object values
 * Reference : http://stackoverflow.com/questions/16449295/how-to-sum-the-values-of-a-javascript-object
 */
// let objectValueSum = (pObj) = {
//     return Object.values(obj).reduce((a, b) => a + b);
// };

//Praveen 03/22/2017 Added function to append html
let fnNoDataFound = (container) => $(container).html('<div class="nodataFound">No Data Available</div>');

//Praveen 03/27/2017 Added high charts bar
let renderHighBarChart = (container, data, key, label, lvalue, compareData) => {

    if (compareData != 'compare') {
        if (label == 'SVR12' || label == 'IS_COMPLETED' || label == 'medication') {
            $('#threapy-' + key.toLowerCase() + '-N').html(getHTMLTextN(data.total, Pinscriptive.dashboard.treatedPatients.totalpatientsMedication));
        } else if (key == 'Insurance') {
            $('#threapy-' + key.toLowerCase() + '-N').html(getHTMLCustomTextN(data.total, Pinscriptive.dashboard.treatedPatients.totalpatients, " Patients"));
        } else
            $('#threapy-' + key.toLowerCase() + '-N').html(commaSeperatedNumber(data.total)+' Patients');
        //$('#threapy-' + key.toLowerCase() + '-N').html(commaSeperatedNumber(data.total));
    }

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
                text: key
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
            min: 0,
            max: 100,
            title: {
                text: 'No of Patients(%)'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj['id'] = this.name;
                            if (compareData != 'compare' && label != 'compare')
                                filterPatientsByChart(dataObj, [], key.toLowerCase());
                            if (label && compareData != 'compare' && label != 'compare' && label != 'medication') {
                                dataObj['id'] = label;
                                dataObj['value'] = lvalue;
                                if (lvalue != 0 && compareData != 'compare')
                                    filterPatientsByChart(dataObj, [], label.toLowerCase());
                            }
                        }
                    }
                }
            }
        },

        tooltip: {
            headerFormat: '',
            pointFormat: `<span>{point.name}</span>: <b>{point.y:.2f}%</b><br/>
                          Patient Count:{point.total:,0.0f}<br/>Total Patients:${commaSeperatedNumber(data.total)}`
        },

        series: [{
            name: key,
            colorByPoint: true,
            data: data.data
        }]
    });
}

let renderTreatmentPieCharts = (container, data, key,labelValue,compareData) => {

    let chartData = [];
    let total = 0;
    for (let key in data) {
        let json = {};
        json['name'] = key;
        json['y'] = data[key].count;
        total += json['y'];
        chartData.push(json);
    }
    if (compareData != 'compare')
        $('#threapy-treatment-N').html(commaSeperatedNumber(total)+' Patients With Medication');
    if (total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: "" //'Treatment Distribution'
        },
        credits: {
            enabled: false
        },
        colors: ["#f1cb6a", "#69bae7", "#e95a52", '#2e7e97', "#abd6ba"],
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            x: 10,
            y: 100,
            labelFormatter: function() {
                return this.name;
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    distance: -30,
                    rotate: 0,
                    format: '{point.percentage:.2f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
                showInLegend: true
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj.id = this.name;
                            if (compareData != 'compare')
                                filterPatientsByChart(dataObj, [], 'treatment');
                            //alert('Category: ' + this.category + ', value: ' + this.y);
                        }
                    }
                }
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Treatment</span>: <b>{point.name}</b><br/>
                          Patient Count:{point.y:,0.0f}<br/>`
        },
        series: [{
            name: 'Treatment',
            colorByPoint: true,
            data: chartData
        }]
    });
}

let renderPrescriptionPieCharts = (container, data, key, compareData) => {

    if (compareData != 'compare')
        $('#'+container+'-N').html(commaSeperatedNumber(data.total)+' Patients');

    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            type: 'pie'
        },
        title: {
            text: '' //'Patients by Fibrosis'
        },
        credits: {
            enabled: false
        },
        colors: customColorsArray(), //["#f1cb6a", "#69bae7", "#e95a52", '#2e7e97', "#abd6ba"],
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            x: 10,
            y: 50,
            labelFormatter: function() {
                if (isNaN(this.name)) {
                    return this.name;
                } else {
                    return 'F' + this.name
                }
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    enabled: true,
                    format: '{point.percentage:.2f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
                showInLegend: true
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            if (isNaN(this.name)) {
                                dataObj.id = null;
                                if (compareData != 'compare')
                                    filterPatientsByChart(dataObj, [], 'fibrostage');
                            } else {
                                dataObj.id = this.range;
                                if (compareData != 'compare')
                                    filterPatientsByChart(dataObj, [], 'fibrovalue');
                            }
                            //alert('Category: ' + this.category + ', value: ' + this.y);
                        }
                    }
                }
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Fibrosis Stage</span>: <b>{point.name}</b><br/>
                          Patient Count:{point.y:,0.0f}<br/>Total Patients:{point.total:,0.0f} <br/>`
        },
        series: [{
            name: 'Fibrosis',
            colorByPoint: true,
            data: data.data
        }]
    });
}

let renderhighmapcharts = (container, data, key, compareData) => {
    // Instanciate the map
    if (compareData != 'compare')
        $('#threapy-region-N').html(commaSeperatedNumber(data.total)+' Patients');

    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.mapChart(container, {

        chart: {
            borderWidth: 0
        },

        title: {
            text: "" //'Patient Distribution by Demographics'
        },

        // legend: {
        //     layout: 'horizontal',
        //     borderWidth: 0,
        //     floating: true,
        //     verticalAlign: 'top',
        //     y: 0
        // },
        colors: customColorsArray(),
        mapNavigation: {
            enabled: true
        },

        colorAxis: {
            min: 1,
            type: 'logarithmic',
            minColor: '#EEEEFF',
            maxColor: '#000022',
            stops: [
                [0, '#EFEFFF'],
                [0.67, '#4444FF'],
                [1, '#000022']
            ]
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj['id'] = this.code;

                            if (this.code == 'NM' && compareData != 'compare') {
                                let dt = this.zipData;
                                $('.backBtnResponders').show();
                                renderMapChartDataDrillDown(container, dt, this.value);
                            } else if (compareData == 'compare') {
                                return;
                            } else
                                filterPatientsByChart(dataObj, [], 'map');
                        }
                    }
                }
            }
        },
        series: [{
            animation: {
                duration: 1000
            },
            data: data.data,
            mapData: Highcharts.maps['countries/us/us-all'],
            joinBy: ['postal-code', 'code'],
            dataLabels: {
                enabled: true,
                color: '#FFFFFF',
                format: '{point.value}'
            },
            name: 'Population density',
            tooltip: {
                pointFormat: 'Patient Count({point.code}): {point.value:,0.0f}<br/>'
            }
        }]
    });
}

let renderPayerMixobservedChart = (container, data, key, compareData) => {

    //check for no data 
    //set patient count  
    if (compareData != 'compare') {
        getHTMLCustomTextN
        $('#payer-mix-N').html(getHTMLCustomTextN(data.total, Pinscriptive.dashboard.treatedPatients.totalpatients, 'Patients'));
        //$('#payer-mix-N').html(commaSeperatedNumber(data.total));
    }

    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }
    let byName = data.data.slice(0);
    byName.sort((a, b) => {
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });
    Highcharts.chart(container, {

        chart: {
            type: 'column'
        },

        title: {
            text: '' //'Observed and Estimated Starts  Distribution by Payer Mix'
        },

        xAxis: {
            categories: data.category
        },
        colors: customColorsArray(),
        yAxis: {
            allowDecimals: false,
            min: 0,
            max: 100,
            title: {
                text: 'No  of Patients(%)'
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Insurance</span>: <b>{point.series.name}</b><br/>
                                Patient Count:{point.count:,0.0f}<br/>Total Patients:{point.ytotal:,0.0f} <br/>`
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return Math.round(this.y) + "%"
                    }
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj['id'] = this.series.name;
                            if (compareData != 'compare')
                                filterPatientsByChart(dataObj, [], 'insurance');
                        }
                    }
                }
            }
        },
        series: byName
    });
}

let renderCareFailureChart = (container, careFailurechartData, key, label) => {

    $('#rate-failure-N').html(commaSeperatedNumber(careFailurechartData.total)+' Patients');
    if (careFailurechartData.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }
    Highcharts.chart(container, {

        chart: {
            type: 'column'
        },

        title: {
            text: ''
        },
        xAxis: {
            categories: careFailurechartData.Categories
        },
        colors: customColorsArray(),
        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: 'No of Patients'
            }
        },

        tooltip: {
            formatter: function() {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + commaSeperatedNumber(this.y) + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return commaSeperatedNumber(this.y)
                    }
                }
            }
        },
        series: careFailurechartData.CareFailureData
    });
}


let renderMarketShareOverMonthsChart = (container, data, filterParam, compareData) => {
    let marketShareOverMonthsChartData = [];
    let colors = ['#17becf', '#2ca02c', '#d62728', '#ff7f0e', '#DDDF00', '#9467bd', '#1f77b4', '#e95a52', '#8c564b',
        '#f1cb6a', '#e377c2', '#17becf', '#000022'
    ]
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
        rec.color = colors[i];
        i = i == 12 ? 0 : i + 1;
        return rec;
    });
    if (compareData != 'compare') {
        if (filterParam != 'ALL') {
            let medicationPatientPercentage = parseFloat((medicationPatientCount / totalPatientCount) * 100).toFixed(2);
            let CombinedMedicationPatientPercentage = parseFloat((CombinedMedicationPatientCount / totalPatientCount) * 100).toFixed(2);
            $('#marketShareMedication').show();
            $('#marketShareMedication').html(`${filterParam} (N): ${commaSeperatedNumber(medicationPatientCount)} (${medicationPatientPercentage}%) and ${filterParam} VARIATION (N): ${commaSeperatedNumber(CombinedMedicationPatientCount)} (${CombinedMedicationPatientPercentage}%)`);
        } else {
            $('#marketShareMedication').hide();
        }
        //set patient count  
        $('#market-share-N').html(commaSeperatedNumber(data.totalPatient) + ' Patients with Medication');
        $('#markerShareOverMonthsChart').html('');
    }


    if (data.singleMedicationList.length == 0) {
        fnNoDataFound('#' + container);
        $('#marketshareMsg').hide();
        return;
    }

    Highcharts.chart(container, {
        chart: {
            zoomType: 'x',
            height: compareData ? 200 : 400
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        plotOptions: {
            column: {
                // stacking: 'normal',
                // dataLabels:{
                //         enabled:true,
                //         formatter:function(){
                //             return Math.round(this.y)+"%"
                //     }
                // },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            // let dataObj = _.clone(this);
                            // dataObj['id'] = this.series.name;
                            // filterPatientsByChart(dataObj, [], 'insurance');
                        }
                    }
                }
            }
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


function showChartLoading() {
    $('.mlSubTabsChartSectionMask').show();
    $('.mlSubTabsChartSectionWrap').hide();
}

function hideChartLoading() {
    setTimeout(function() {
        $('.mlSubTabsChartSectionMask').hide();
        $('.mlSubTabsChartSectionWrap').show();
    }, 100);
}

// Nisha 03/30/2017 for generating the Prescription Count and ingredient Cost Charts 
//Moved to Dashboard by Praveen on 4 April 2017
let renderPredictionCountChart = (container, baseData, isCompared) => {

    let prescriptionCountData = baseData.AllPrescriptions;
    let totalCount = 0;
    let patientCount = Pinscriptive.dashboard.treatedPatients.totalpatientsMedication;
    if (prescriptionCountData.length > 0) {
        totalCount = prescriptionCountData[0].TotalPrescription;
    }
    if (!isCompared)
        $('#prescription-count-N').html(getHTMLCustomTextN(patientCount,totalCount,' of Total Prescriptions',' of Patient'));

    if (totalCount == 0) {
        fnNoDataFound('#' + container);
    } else {
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
                headerFormat: '',
                pointFormat: 'Medication: {point.name}<br>Prescription Count:{point.PrescriptionCount:,0.0f}<br>Patient Count:{point.patients:,0.0f}'
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
                },
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                let dataObj = _.clone(this);
                                dataObj.id = this.name;
                                filterPatientsByChart(dataObj, [], 'medication');
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
                data: baseData.AllPrescriptions
            }]
        });
    }



}

let renderIngredientCostChart = (container, baseData, isCompared) => {
    let prescriptionCountDataIng = baseData.AllIngredient;
    let totalCountIng = 0;
    let patientCount  = Pinscriptive.dashboard.treatedPatients.totalpatientsMedication;
    for (let i = 0; i < prescriptionCountDataIng.length; i++) {
        totalCountIng += prescriptionCountDataIng[i].PrescriptionCount;
    }
    if (!isCompared)
        $('#ingredient-cost-N').html(getHTMLCustomTextN(patientCount,totalCountIng,' of Total Prescriptions',' of Patient'));

    if (totalCountIng == 0) {
        fnNoDataFound('#' + container);
    }
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
            headerFormat: '',
            pointFormat: 'Medication:{point.name}<br>Avg cost of single Prescription:${point.AvgPCharge:,.2f}<br>Total cost of prescriptions:${point.PCharge:,.0f}<br>Prescription Count:{point.PrescriptionCount:,0.0f}'
                //pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>{point.name} Cost: <b>${point.PCharge:,.2f}</b><br>Total Cost: <b>${point.TotalPrescription:,.0f}</b>'
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
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj.id = this.name;
                            filterPatientsByChart(dataObj, [], 'medication');
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
            data: baseData.AllIngredient
        }]
    });
}
let renderCostRxBubbleChart = (container, data, isCompared) => {

    let totalCount = 0;
    let patientCount = Pinscriptive.dashboard.treatedPatients.totalpatientsMedication;
    for (let i = 0; i < data.length; i++) {
        totalCount += data[i]['x'];
    }
    if (!isCompared){
        $('#cost-perrx-N').html(getHTMLCustomTextN(patientCount,totalCount,' of Total Prescriptions',' of Patient'));
    }

    if (totalCount == 0) {
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
                    return '$' + autoFormatCostValue(this.value); //Math.round(this.value / 1000) + 'k';
                }
            },
            credits: {
                enabled: false
            },
            maxPadding: 0.2,
        },
        tooltip: {
            useHTML: true,
            formatter: function() {
                return `<span>Medication</span>: ${this.point.fullName}<br/>
                    Prescription Count:${commaSeperatedNumber(this.x)}<br/>Patient Count:${commaSeperatedNumber(this.point.patients)}<br/>Avg Cost:$${commaSeperatedNumber(Math.round(this.y / 1000))}k<br/>`
            },
            followPointer: true
        },

        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                },
                showInLegend: true,
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj.id = this.fullName;
                            filterPatientsByChart(dataObj, [], 'medication');
                        }
                    }
                }
            }
        },

        series: [{
            data: data
        }]

    });
}

//Praveen 03/31/2017 Add Prescription count table data
let addPrescriptionInformation = (baseData) => {

    if (baseData.total == 0) {
        fnNoDataFound('.prescriptionCount-rxCostTable');
        return;
    }
    let tableData = baseData.data;
    let tableHeader = ``;
    tableHeader = `<div class="common-efd-row MainTitle">
                        <div class="common-efd-cell1">Medication</div>
                        <div class="common-efd-cell1">Prescription Count</div>
                        <div class="common-efd-cell1">Ingredient Cost</div>
                        <div class="common-efd-cell1">Cost Per Rx</div>
                  </div>`;
    let htmlRow = ``;
    //sort data by ingredient cost 
    tableData.sort((a, b) => b.y - a.y);
    for (let i = 0; i < tableData.length; i++) {
        let data = tableData[i];
        htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1">${data.name}</div>
                        <div class="common-efd-cell1">${commaSeperatedNumber(data.count)}</div>
                        <div class="common-efd-cell1" title="$${commaSeperatedNumber(data.y.toFixed(2))}">$${autoFormatCostValue(data.y)}</div>
                        <div class="common-efd-cell1">$${commaSeperatedNumber(data.costperrx.toFixed(0))}</div>
                    </div>`;
    }

    $('.prescriptionCount-rxCostTable').html(tableHeader + htmlRow);
}

//Praveen 3 April 2017 Added bar chart for ingredient cost and prescription 
//Movedto Dashboard on 4th April
let renderHighBarChartPrescription = (container, data, isCompared) => {

    //set value of N
    if (!isCompared)
        $('#ingr-costprescription-N').html(getHTMLCustomTextN(Pinscriptive.dashboard.treatedPatients.totalpatientsMedication,data.total,' of Total Prescriptions',' of Patient'));

    //check for no data
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
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj.id = this.name;
                            filterPatientsByChart(dataObj, [], 'medication');
                        }
                    }
                }
            }
        },

        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Medication</span>:{point.name}<br/> <span>Total cost of prescription</span>:$ {point.y:,.2f}<br/>
                          Prescription Count:{point.count:,0.0f}`
        },

        series: [{
            name: '',
            colorByPoint: true,
            data: data.data
        }]
    });
}


//Praveen 12th May 2017 Added code to plot chart based on state code
let renderMapChartDataDrillDown = (container, data, total) => {

    if (total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.mapChart(container, {
        chart: {
            map: 'countries/us/us-nm-all'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        mapNavigation: {
            enabled: true
        },

        colorAxis: {
            min: 0
        },
        credits: {
            enabled: false
        },
        series: [{
            data: data,
            name: 'New Mexico City',
            states: {
                hover: {
                    color: '#BADA55'
                }
            },
            dataLabels: {
                enabled: true,
                format: '{point.value}'
            },
            tooltip: {
                pointFormat: '{point.name}<br>Patient Count: {point.value:,0.0f}<br/>'
            }
        }]
    });
}


//Praveen 15 May 2017 Added function to plot cost burden chart
let renderCostBurdenChartCommon = (container, finalData, typeValue, typeCount, compareData) => {

    let patientCount = _.pluck(finalData, typeCount).reduce((a, b) => a + b, 0);
    finalData.sort(function(a, b) {
        return a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, '');

    });
    let colors = _.pluck(finalData, 'color'); //Added color for chart
    if (patientCount == 0) {
        fnNoDataFound(container);
    } else {
        c3.generate({
            bindto: container,
            padding: {
                top: 5,
                right: 140,
                bottom: 10,
                left: 110
            },
            data: {
                type: 'bar',
                json: finalData,
                keys: {
                    x: 'genotype',
                    value: [typeValue]
                },
                //Praveen:03/22/2017 Added check for no data found
                empty: {
                    label: {
                        text: "No Data Available"
                    }
                },
                //groups: [groups],
                onclick: function(d) {
                    if (d.value && compareData != 'compare') {
                        filterPatientsByChart(d, finalData, 'costBurden');
                    } else {
                        console.log("improper click and data");
                    }
                },
                order: 'null',
                labels: {
                    format: function(v, id, i, j) {
                        if (i != undefined) {
                            let val = id + '_count';
                            return commaSeperatedNumber(finalData[i][val]);
                        }
                    }
                },
                color: (color, d) => colors[d.index],

            },
            size: {
                height: 210,
                width: 600
            },
            zoom: {
                enabled: false
            },
            color: {
                pattern: colors
            },
            axis: {
                x: {
                    type: 'category',
                    label: {
                        text: 'Genotype',
                        position: 'outer-center'
                    }
                },
                y: {
                    tick: {
                        count: 5,
                        format: function(d) {
                            // OLD
                            //console.log(d);
                            return '$' + autoFormatCostValue(d); //'$' + Math.round(d / 1000) + 'k';
                            //  return '$' + commaSeperatedNumber(d);
                        },
                    },
                    label: {
                        text: 'Cost',
                        position: 'outer-middle'
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            // legend: {
            //     show: true,
            //     position: 'right'
            // },
            legend: {
                show: true,
                position: 'inset',
                inset: {
                    anchor: 'top-right',
                    x: -125,
                    y: 10,
                    step: 10
                }
            },
            tooltip: {
                grouped: false,
                // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
                contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                    let dataObj = d[0],
                        id = dataObj.id,
                        value = dataObj.value,
                        ratio = (dataObj.ratio * 100).toFixed(2),
                        filterData = finalData[dataObj.index];

                    let $$ = this,
                        config = $$.config,
                        bgcolor
                    bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                    // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                    let html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div>' + id + '</div>' +
                        '</div>' +
                        '<div class="customC3ToolTip-Body">' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patients Count: ' + commaSeperatedNumber(filterData[id + "_count"]) + '</div>' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Cost: $' + commaSeperatedNumber(Math.round(value, 2)) + '</div>' +
                        '</div>' +
                        '</div>';
                    return html;
                }
            },
            grid: {
                y: {
                    lines: [{
                        value: 0
                    }]
                }
            }
        });
    }
}


let plotCirrhosistypeDistribution = (container, data, compareData) => {

    //set patient count  
    if (compareData != 'compare')
        $('#cirrhosis-distribution-N').html(commaSeperatedNumber(data.total)+' Patients');
    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

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
            categories: data.keys,
            title: {
                text: 'Type of Cirrhosis Patients'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count',
                align: 'middle'
            },
            labels: {
                overflow: 'justify'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    // format: '{point.y:.0f}%',
                    formatter: function() {
                        return commaSeperatedNumber(this.y); //Math.round(this.y)+"%";
                    }
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj.id = this.name;
                            filterPatientsByChart(dataObj, [], 'Treatment');
                        }
                    }
                }
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Treatment</span>:<span>{point.name}</span><br/>
                            Patient Count:{point.y:,0.0f}<br/>`
        },
        legend: {
            layout: 'horizontal',
            horizontalAlign: 'bottom',
            floating: false,
        },
        credits: {
            enabled: false
        },
        series: data.data
    });
}


let renderStackedColumnChartMedication = (container, data,lkey,isCompared,isRotated) => {

    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }
    if(!isCompared)
        $('#'+container+'-N').html(commaSeperatedNumber(data.total)+' Patient with Medications');

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            inverted:isRotated?true:false
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: data.groups,
            title: {
                text: lkey
            },
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        legend: {
            align: 'right',
            x: 10,
            verticalAlign: 'top',
            layout: 'vertical',
            y: 25,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            shadow: false
        },
        tooltip: {
            headerFormat: lkey+':{point.x}<br/>',
            pointFormat: 'Medication:{series.name}<br/>Patient Count:{point.y:,0.0f}<br/>'
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: false,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj.id = this.name;
                            filterPatientsByChart(dataObj, [], 'medication');
                        }
                    }
                }
            },
        },
        series: data.data
    });
}

//function to get filtered data from the backend
function getFiltersDataClient(filtersArray) {
    // console.log("*** filtersArray ****");
    Meteor.call('filterDataForDashBoardClient', filtersArray, (error, response) => {
        //console.log('********Filter Response***********');
        //console.log(response);
        if(error){
            dashUtils.hideChartMask();
            console.log(error);
        }
        else{
            let decompressed_object = LZString.decompress(response);
            let resulting_object = JSON.parse(decompressed_object);
            Pinscriptive.dashboard.phsData = resulting_object;
            dashUtils.hideChartMask();
        }
    });
}

/**
 * @author: Pramveer
 * @date: 27th Jun 17
 * @desc: 
*/
let renderHCVIncidenceChart = (container, chartData, isCompareView) => {
    container = container.replace('#', '');
    if(!isCompareView) {
        $('#hepCIncidenceChart-N').html(commaSeperatedNumber(Pinscriptive.dashboard.treatedPatients.totalpatients) +' Patients' );
    }

    Highcharts.chart(container, {
        chart: {
            type: 'line'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            title: {
                text: 'Year'
            }
        },
        yAxis: {
            title: {
                text: 'Number of Cases'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj.id = this.category;
                            if (!isCompareView)
                                filterPatientsByChart(dataObj, [], 'Year');
                            //alert('Category: ' + this.category + ', value: ' + this.y);
                        }
                    }
                }
            }
        },
        legend: {
            enabled: false
        },
        series: [ {
            name: 'Hep C',
            data: chartData
        }]
    });
}

/**
 * @author: Pramveer
 * @date: 27th Jun 17
 * @desc: 
*/
let renderHCVEstimationChart = (container, chartDataObj, isCompareView) => {
    container = container.replace('#', '');

    let categories = chartDataObj.categories,
        chartData = chartDataObj.series,
        stats = chartDataObj.stats;

    if(!isCompareView) {
        let totalPatients = Pinscriptive.dashboard.treatedPatients.totalpatients;
        let hcvRnaPats =  stats ? stats.hcvRnaPats : 0,
            hcvMedsPats = stats ? stats.antiHcvMeds : 0;

        let html = '<b>Anti-HCV Therapy N </b>' + getHTMLCustomTextN(hcvMedsPats, totalPatients, 'Patients');

        html += '<br/>';
        html += '<b>HCV-RNA N </b>' + getHTMLCustomTextN(hcvRnaPats, totalPatients, 'Patients');;

        $('#estimatedHepCInfectionChart-N').html(html);
    }

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
            categories: categories,
            title: {
                text: 'Year'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Estimated Persons Infected with HCV'
            }
        },

        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj.id = this.category;
                            if (!isCompareView)
                                filterPatientsByChart(dataObj, [], 'Year');
                        }
                    }
                }
            }
        },
        series: chartData
    });
}

/**
 * @author: Pramveer
 * @date: 27th Jun 17
 * @desc: 
*/
let renderHCVPrevelenceChart = (container, dataObj, label, isCompareView ) => {
    container = container.replace('#', '');

    if(!isCompareView) {
        $('#hcvPrevelenceChart-N').html(commaSeperatedNumber(Pinscriptive.dashboard.treatedPatients.totalpatients) +' Patients' );
    }

    let xAxisLabel = label ? label : 'Age';

    // dataObj = getHCVPrevelenceData(dataObj);
    // console.log(dataObj);

    let chartData = dataObj[xAxisLabel];
    // console.log(chartData);

    // chartData = getHCVPrevelenceDataNew(dataObj, xAxisLabel);
    // console.log(chartData);

    let cats = _.pluck(chartData, 'x');

    Highcharts.chart(container, {
        chart: {
            type: 'line'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: chartData.categories,
            title: {
                text: xAxisLabel
            }
        },
        yAxis: {
            title: {
                text: 'Hep C Prevelence'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            if(!isCompareView){
                                let dataObj = _.clone(this);
                                dataObj.id = this.category;
                                filterPatientsByChart(dataObj, [], 'age');
                                // filterPatientsByChart(dataObj, [], 'year');
                            }  
                        }
                    }
                }
            }
        },
        series: chartData.series
    });

}



// let getHCVPrevelenceData = (baseData) => {
//     // console.log(baseData);

//     let dataObj = {};
//     dataObj.Age = {'categories' : getDistribution('age').categories, 'series' : getDistribution('age').series};
//     dataObj.Race = {'categories' : getDistribution('race').categories, 'series' : getDistribution('race').series};
//     dataObj.Gender ={'categories' : getDistribution('gender').categories, 'series' : getDistribution('gender').series};


//     // function getDummyData() {
//     //      var chartData1 = [
//     //         {x:2013 ,y:334 },
//     //         {x:2014 ,y:380 },
//     //         {x:2015 ,y:722 },
//     //         {x:2016 ,y:918 },
//     //         {x:2017 ,y:851 }
//     //     ];

//     //     var chartData2= [
//     //         {x:2013 ,y:10 },
//     //         {x:2014 ,y:20 },
//     //         {x:2015 ,y:40 },
//     //         {x:2016 ,y:50 },
//     //         {x:2017 ,y:5 }
//     //     ];

//     //     return {
//     //         line1: chartData1,
//     //         line2: chartData2
//     //     }
//     // }


//     function getDistribution(groupKey){
//         let series = []
        
//         let yearWiseData = _.groupBy(baseData, 'yearAdmission');
//         let categories = []
//         for(let key in yearWiseData){
//             let obj = {};
//             obj.name = key;
//             obj.data = getCountByKey(yearWiseData[key], groupKey);
//             series.push(obj);  

//             categories.push(_.pluck(obj.data, 'cat'));
//         }
//         console.log(categories);
//         categories = _.flatten(categories);
//         categories = _.uniq(categories);
//         console.log(categories);
//         return {'series' : series, 'categories' : categories};

//     }


//     function getCountByKey(data, groupKey){
//         let ageGroups = _.groupBy(data, groupKey);
//         let dataArray = [];
//         let categories = [];
//         for(let key in ageGroups){
//             dataArray.push({
//                 cat : key,
//                 y : ageGroups[key].length
//             });
//             categories.push(key)
//             // dataArray.push(ageGroups[key].length);
//         }
//         // return {'categories': categories, 'dataArray' : dataArray};
//         return dataArray;
//     }


//     return dataObj;
// }





let getHCVPrevelenceDataNew = (baseData, groupKey) => {
    // console.log(baseData);

    let categories = _.pluck(baseData, groupKey);
    categories = _.uniq(categories);

    let yearWiseData = _.groupBy(baseData, 'yearAdmission');
    let series = [];
    for(let key in yearWiseData){
        let obj = {};
        obj.name = key;
        obj.data = getCountByKey(yearWiseData[key], groupKey, categories);
        series.push(obj);  
    }

    // let dataObj = {};
    // dataObj.Age = {'categories' : getDistribution('age').categories, 'series' : getDistribution('age').series};
    // dataObj.Race = {'categories' : getDistribution('race').categories, 'series' : getDistribution('race').series};
    // dataObj.Gender ={'categories' : getDistribution('gender').categories, 'series' : getDistribution('gender').series};

    let dataObj = {'categories' : categories, 'series' : series};


    function getCountByKey(data, groupKey, categories){
        let ageGroups = _.groupBy(data, groupKey);
        let dataArray = [];
        for(let i = 0; i<categories.length; i++){
            let category = categories[i];
            let count = _.where(data, {groupKey:category}).length;
            dataArray.push({
                cat : category,
                y : count
            });
        }
        return dataArray;
    }


    return dataObj;
}