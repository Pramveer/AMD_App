import {
    Template
} from 'meteor/templating';
import './costBurden.html';
import * as mlSubTabsUtil from '../modelUtils.js';
import * as analyticsLib from '../../../analyticsLib.js';

let filterObjectsArray = [];
let filteredData = [];
let filtered = '';
let relapsedPatientData = {};
//  Nisha 02/23/2017 for liver transplant rendring 
let CostType = null;
let GenoType = null;
let CostDrillDown = null;
let CostBurdenObj = {};
CostBurdenObj.Primary = {}, CostBurdenObj.Secondary = {};


// Added By Yuvraj  (28 FEB 17)
let icerMedsComboData = new ReactiveVar([]);
let ICERData = [];
let LiverTransplantCostData_render = [];

Template.CostBurden.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let params = getCurrentPopulationFilters();
        params['fdaCompliant'] = "all";
        executeCostBurdenRender(params, self);
    });
});

Template.CostBurden.rendered = function() {
    filterObjectsArray = [];
    $('.headerbuttonFilesection').hide();
    $("livertransplantback_main").hide();
}

Template.CostBurden.helpers({
    'getICERMedication': () => {
        // let dummyICERMedication = [];
        // for (let i = 0; i < AllICERDrugs.length; i++) {
        //     dummyICERMedication.push(AllICERDrugs[i].MEDICATION);
        // }
        // return dummyICERMedication;
        let allMeds = icerMedsComboData.get();
        // Added By Jayesh 28th March 2017 Check for variable is array or not to solved 'cannot read property 'length' of undefined' issue
        if (_.isArray(allMeds) && allMeds.length) {
            // if (allMeds.length) {
            return allMeds;
        }
    }
});

Template.CostBurden.events({
    // Nisha 02/23/2017 Modified for Back button event
    'click #livertransplantback': function(e) {
        $('#divCostTable').hide();
        renderLiverTransplantCost('analyticsLiverTransplantByGenotype', LiverTransplantCostData_render);
        $('#analyticsLiverTransplantByGenotype').show();
    },
    'click .globalshowPatientcostburden': function(event, template) {
        $('.costBurdenPList-listMask').hide();
        $('.costBurdenPList').show();
    },

    /**
     * Modified By : Yuvraj
     * date : 13th Feb 17
     * desc : We are no longer using date filters, So Filtering is not required.
     */
    'click .globalexportPatientcostburden': function(event) {
        let patientsData = _.clone(filteredData);
        // let comboFilterData = mlSubTabsUtil.getFilteredDataOnDateCombos(patientsData, filtered);
        mlSubTabsUtil.exportPatientsData(event.currentTarget, 'costburdenExportPatient', patientsData);
    },

    /**
     * Modified By : Yuvraj
     * date : 13th Feb 17
     * desc : We are no longer using date filters, So else condition is not required.
     */
    'click .js-analytics-applyDateFilters': function(event, template, data) {
        if (data && data == 'refresh') {
            template.loading.set(true);
            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "all";
            executeCostBurdenRender(params, template);
        }
        // else{
        //     filtered = 'true';
        //     filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(filteredData,filtered);
        //     mlSubTabsUtil.renderPatientsList(filteredData, "costBurdenPList");
        //     renderCategoriesChart(filteredData);
        //   }
    },
    'click .close.mlTabs_closebtn': function(e) {
        $('.analyticsPatientsPopup').hide();
    },
    'change #treamentRelapsedPatientSelection .radiorelapsed': function(e) {
        // pharmaLib.showChartLoading();
        let chartData = relapsedPatientData.relapsed;
        // console.log(chartData)
        if (e.target.value == "genotype") {
            //render genotype  chart
            renderRelapsedPatientChartskey('pharmaTreatmentRelapsed', chartData.genotype.data, chartData.genotype.keys, 'Genotype');
        } else if (e.target.value == "race") {
            //render race chart
            renderRelapsedPatientChartskey('pharmaTreatmentRelapsed', chartData.race.data, chartData.race.keys, 'Race');
        } else if (e.target.value == "cirrhosis") {
            renderRelapsedPatientChartskey('pharmaTreatmentRelapsed', chartData.cirrhosis.data, chartData.cirrhosis.keys, 'Cirrhosis');
        } else if (e.target.value == "gender") {
            renderRelapsedPatientChartskey('pharmaTreatmentRelapsed', chartData.gender.data, chartData.gender.keys, 'Gender');
        } else if (e.target.value == "age") {
            renderRelapsedPatientChartskey('pharmaTreatmentRelapsed', chartData.age.data, chartData.age.keys, 'Age');
        } else if (e.target.value == "fibrosis") {
            renderRelapsedPatientChartskey('pharmaTreatmentRelapsed', chartData.fibrosis.data, chartData.fibrosis.keys, 'Fibrosis');
        } else if (e.target.value == "medication") {
            renderRelapsedPatientChartskey('pharmaTreatmentRelapsed', chartData.medication.data, chartData.medication.keys, 'Medication', 'stack');
        }
        // pharmaLib.hideChartLoading();
    },

    'change #treamentRemittedPatientSelection .radioremitted': function(e) {
        // pharmaLib.showChartLoading();
        let chartDataRemitted = relapsedPatientData.remitted;
        // console.log(chartData)
        if (e.target.value == "genotype") {
            //render genotype  chart
            renderStackedChartRemmission('pharmaTreatmentRemmitted', chartDataRemitted.genotype.data, chartDataRemitted.genotype.keys, 'Genotype');
        } else if (e.target.value == "medication") {
            //render race chart
            renderStackedChartRemmission('pharmaTreatmentRemmitted', chartDataRemitted.medication.data, chartDataRemitted.medication.keys, 'Medication');
        } else if (e.target.value == "treatment") {
            renderStackedChartRemmission('pharmaTreatmentRemmitted', chartDataRemitted.treatment_period.data, chartDataRemitted.treatment_period.keys, 'Treatment Period');
        }

    },
    'click .pharma_closebtn': function(event, template) {
        $('.pharmaPatientsPopup').hide();
    },
    /**
     * @author: Yuvraj Pal (28 FEB 17)
     * @desc: this event handles the Go button of the ICER chart.
     */
    'click .treatedPharmaICER': (e, template) => {
        $('.pharmaCost-ICERChartSection').css('float', 'none');
        $('.pharmaCost-ICERChartSection').show();
        $('.pharmaCost-ICERNoData').hide();
        renderICERChart(ICERData);
        closeNav();
        $('.pharmaCost-ICERChartSection').css('float', 'left');
    },
    'click .viral_load_over_time_title': (e) => {
        if ($('.viral_load_over_time_opition').width() == 0)
            openNav();
        else {
            closeNav();
        }
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];
        let baseOrig = CostBurdenObj.Primary;
        let baseComp = CostBurdenObj.Secondary;

        if (value == 'costBurden-analytics') {
            primaryData = baseOrig;
            secondaryData = baseComp;
        }
        if (isCustomerDataset()) {
            plotComparisionDataCharts(value, primaryData, secondaryData, desc);
        } else {
            plotComparisionDataCharts(value, secondaryData, primaryData, desc);
        }
    },
    'click .togglechart-livertransplant': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];

        let baseOrig = CostBurdenObj.Primary;
        let baseComp = CostBurdenObj.Secondary;

        if (value == 'costBurden-analytics-livertransplant') {
            primaryData = baseOrig;
            secondaryData = baseComp;
        }
        if (isCustomerDataset()) {
            plotComparisionDataChartslivertransplant(value, primaryData, secondaryData, desc);
        } else {
            plotComparisionDataChartslivertransplant(value, secondaryData, primaryData, desc);
        }
    },
    // Added compare toggle functionality
    'click .togglechart-compare': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];

        let baseOrigData = CostBurdenObj.Primary;
        let baseCompData = CostBurdenObj.Secondary;

        if (value === 'pharmaTreatmentRemmitted') {
            primaryData = baseOrigData.ViralScoreAnalysisData.Remitted;
            secondaryData = baseCompData.ViralScoreAnalysisData.Remitted;
        } else if (value === 'pharmaTreatmentRelapsed') {
            primaryData = baseOrigData.ViralScoreAnalysisData.Relapsed;
            secondaryData = baseCompData.ViralScoreAnalysisData.Relapsed;
        } else if (value === 'analyticPatientsJourney-PJData') {
            primaryData = baseOrigData.patientsJourney;
            secondaryData = baseCompData.patientsJourney;
        }
        //basedon current database
        //if current data is customer specific no need tto swtich variable else we need tto switch variable primaryData,secondaryData
        //by default customer data is selected then method value is true
        if (isCustomerDataset()) {
            plotComparisionDataChartsExtension(value, primaryData, secondaryData, desc);
        } else {
            plotComparisionDataChartsExtension(value, secondaryData, primaryData, desc);
        }
    }
});


//function to plot comparision charts
let plotComparisionDataChartslivertransplant = (plottingData, PData, SData, diffplottingData) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection',
        secondaryContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    //empty the containers
    $('#' + primaryContainer).empty();
    $('#' + secondaryContainer).empty();

    switch (plottingData) {
        case 'costBurden-analytics-livertransplant':
            chartTypeLabel = 'Liver Transplant';
            renderLiverTransplantCost(primaryContainer, PData.LiverTransplantCostData);
            renderLiverTransplantCost(secondaryContainer, SData.LiverTransplantCostData);
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}


//function to plot comparision charts
let plotComparisionDataCharts = (plottingData, PData, SData, diffplottingData) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection-costBurden',
        secondaryContainer = 'secondaryDataViewSection-costBurden';

    let chartTypeLabel = '';

    //empty the containers
    $('#' + primaryContainer).empty();
    $('#' + secondaryContainer).empty();

    switch (plottingData) {
        case 'costBurden-analytics':
            chartTypeLabel = 'Average Cost -All Categories';
            renderCategoriesChart(PData.CostBurdenTabsData, 'primary');
            renderCategoriesChart(SData.CostBurdenTabsData, 'secondary');
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
};

//function to plot comparision charts
let plotComparisionDataChartsExtension = (plottingData, primaryData, secondaryData, diffplottingData) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection',
        secondaryContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    //empty the containers
    $('#' + primaryContainer).empty();
    $('#' + secondaryContainer).empty();

    switch (plottingData) {

        case 'pharmaTreatmentRemmitted':
            let selectedRemmitedKey = $("#treamentRemittedPatientSelection .radioremitted:checked").val() || 'genotype';
            chartTypeLabel = 'Cost of Remitted Patients';
            renderRelapsedPatientChartsExtension({

                isRemmitted: true,
                remmittedContainer: primaryContainer,
                RemmittedData: primaryData,
                remmitedKey: selectedRemmitedKey === 'treatment' ? "treatment_period" : selectedRemmitedKey
            });
            renderRelapsedPatientChartsExtension({

                isRemmitted: true,
                remmittedContainer: secondaryContainer,
                RemmittedData: secondaryData,
                remmitedKey: selectedRemmitedKey === 'treatment' ? "treatment_period" : selectedRemmitedKey
            });
            break;
        case 'pharmaTreatmentRelapsed':
            let selectedRelapsedKey = $("#treamentRelapsedPatientSelection .radiorelapsed:checked").val() || 'genotype';
            chartTypeLabel = 'Cost of Relapsed Patients';
            renderRelapsedPatientChartsExtension({

                isRelapsed: true,
                relapsedContainer: primaryContainer,
                RelapsedData: primaryData,
                relapsedKey: selectedRelapsedKey
            });
            renderRelapsedPatientChartsExtension({

                isRelapsed: true,
                relapsedContainer: secondaryContainer,
                RelapsedData: secondaryData,
                relapsedKey: selectedRelapsedKey
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


let executeCostBurdenRender = (params, tempateObj) => {

    //Praveen 02/21/2017 added loading wheel
    mlSubTabsUtil.showChartLoading();
    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }

    Meteor.call('getCostBurdenTabsData', params, (error, result1) => {
        if (error) {
            // console.log(error);
            tempateObj.loading.set(false);
            CostBurdenObj.Primary.CostBurdenTabsData = null;
        } else {
            // let decompressedData = LZString.decompress(result1);
            // decompressedData = JSON.parse(decompressedData);
            // console.log('****** cost burden data *******');
            // console.log(decompressedData);

            Meteor.call('getICERData_Analytics', params, function(errors, ecrResult) {
                if (errors) {
                    alert('No data fetched for the sub population');
                    mlSubTabsUtil.hideChartLoading();
                } else {
                    // let decompressedData = LZString.decompress(ecrResult);
                    // decompressedData = JSON.parse(decompressedData);
                    // console.log('****** ICER data *******');
                    // console.log(decompressedData);

                    ecrResult = JSON.parse(ecrResult);
                    icerMedsComboData.set(ecrResult.medication);
                    // console.log(ecrResult);
                    //update the drug combo
                    updateDrugCombo(ecrResult.medication);

                    ICERData = ecrResult.data;
                    // console.log(ecrResult);
                    //meteor call to fetch viral score data from server

                    Meteor.call('getViralScoreAnalysisData', params, function(error1, result) {
                        if (error1) {
                            mlSubTabsUtil.hideChartLoading();
                        } else {
                            // let decompressedData = LZString.decompress(result);
                            // decompressedData = JSON.parse(decompressedData);
                            // console.log('****** Viral load data *******');
                            // console.log(decompressedData);
                            // This method is directly taken from Pharma server method
                            Meteor.call('getLiverTransplantCostData', params, (err, sympResults) => {
                                if (!err) {
                                    // let decompressedData = LZString.decompress(sympResults);
                                    // decompressedData = JSON.parse(decompressedData);
                                    // console.log('****** liver transplant *******');
                                    // console.log(decompressedData);

                                    var decompressed_object_result_LT = LZString.decompress(sympResults);
                                    var resulting_object_result_LT = JSON.parse(decompressed_object_result_LT);
                                    LiverTransplantCostData_render = resulting_object_result_LT;
                                    CostBurdenObj.Primary.LiverTransplantCostData = resulting_object_result_LT;
                                    renderLiverTransplantCost('analyticsLiverTransplantByGenotype', resulting_object_result_LT);
                                    setTimeout(function() {
                                        $('.symptomsChartsLoading').hide();
                                        $('.symptomsChartWrapper').show();
                                    }, 1000);
                                    tempateObj.loading.set(false);
                                    //mlSubTabsUtil.showChartLoading();

                                    // Decompression form cost Burden Tabs Data
                                    let decompressed_object = LZString.decompress(result1);
                                    result1 = JSON.parse(decompressed_object);

                                    setTimeout(function() {
                                            let AnalyticsTabData = result1;
                                            // Modified By Yuvraj (13th Feb 17) : Date filtering is no longer being used.
                                            // filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(AnalyticsTabData,filtered);
                                            filteredData = AnalyticsTabData
                                            mlSubTabsUtil.renderPatientsList(filteredData, "costBurdenPList");
                                            CostBurdenObj.Primary.CostBurdenTabsData = filteredData;
                                            renderCategoriesChart(filteredData, 'original');
                                            mlSubTabsUtil.hideChartLoading();
                                        }, 300)
                                        // DEcompression form Viral Score Analysis Data
                                    var decompressed_object_result = LZString.decompress(result);
                                    var resulting_object_result = JSON.parse(decompressed_object_result);
                                    // Store primary dataset value for Relapsed and Remiited chart
                                    CostBurdenObj.Primary.ViralScoreAnalysisData = resulting_object_result.pharmaAnalysisData;
                                    relapsedPatientData['relapsed'] = resulting_object_result.pharmaAnalysisData.Relapsed;
                                    relapsedPatientData['remitted'] = resulting_object_result.pharmaAnalysisData.Remitted;

                                    //Pram (29th May 17) : Added the key for raw data to populate the count
                                    relapsedPatientData['rawData'] = resulting_object_result.pharmaAnalysisData.ALLDATA;

                                    //render Relapsed and Remmission charts
                                    renderRelapsedPatientCharts(resulting_object_result.pharmaAnalysisData.Relapsed, resulting_object_result.pharmaAnalysisData.Remitted);
                                    fetchSecondaryDataset(params); //fetch compariosn data
                                }
                            });
                        }
                        //              console.log("Before ---- fetchSecondaryDataset**");
                        //    console.log(   params.database);
                        fetchSecondaryDataset(params); //fetch compariosn data
                    });
                } // else condition for getICERData
            }); // close getICERData;
        }
    });
}

let fetchSecondaryDataset = (params) => {
    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }
    params.database = getReverseSelectedDatabase(); //get database
    Meteor.call('getCostBurdenTabsData', params, (error, result1) => {
        if (error) {
            // console.log(error);
            CostBurdenObj.Secondary.CostBurdenTabsData = null;
        } else {
            Meteor.call('getViralScoreAnalysisData', params, function(error1, result) {
                if (error1) {
                    mlSubTabsUtil.hideChartLoading();
                } else {
                    // This method is directly taken from Pharma server method
                    Meteor.call('getLiverTransplantCostData', params, (err, sympResults) => {
                        if (!err) {
                            var decompressed_object_result_LT = LZString.decompress(sympResults);
                            var resulting_object_result_LT = JSON.parse(decompressed_object_result_LT);
                            CostBurdenObj.Secondary.LiverTransplantCostData = resulting_object_result_LT;
                            //mlSubTabsUtil.showChartLoading();
                            // Decompression form cost Burden Tabs Data
                            let decompressed_object = LZString.decompress(result1);
                            result1 = JSON.parse(decompressed_object);
                            setTimeout(function() {
                                    CostBurdenObj.Secondary.CostBurdenTabsData = result1;
                                }, 300)
                                // DEcompression form Viral Score Analysis Data
                            var decompressed_object_result = LZString.decompress(result);
                            var resulting_object_result = JSON.parse(decompressed_object_result);
                            // Pinscriptive.viralScoreAnalysis.compData =resulting_object_result.pharmaAnalysisData;
                            // Store secondary dataset value for Relapsed and Remiited chart
                            CostBurdenObj.Secondary.ViralScoreAnalysisData = resulting_object_result.pharmaAnalysisData;
                            $('.togglechart').show();
                            $('.togglechart-livertransplant').show();
                        }
                    });
                }
            });
        }
    });
};

// Nisha 02/03/2017 updated for AVG Cost labels
// Nisha 02/22/2017 Modified to caputer the drilldown events in chart and Showing the Cost Table
let renderLiverTransplantCost = (container, chartData) => {
    //console.log(chartData);
    let legend = {
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 0
    };

    if (container == 'analyticsLiverTransplantByGenotype') {
        legend = {
            enabled: true,
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            symbolRadius: 0,
            x: 0,
            y: 50
        };
    }
    /**
     * @author: Pramveer
     * @date: 1st Mar 17
     * @desc: Changed the toolip layout for the chart & implemented the average cost
     */

    let UNDEFINED;
    // filteredData = chartData.fullData;
    let tooltipHeadTitle = 'Genotype';

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            zoomType: 'y',
            events: {
                drillup: function(e) {
                    // this.xAxis[0].setTitle({ text: 'Genotypes' });

                    // tooltipHeadTitle = 'Genotype';
                    renderLiverTransplantCost(container, chartData);
                },
                drilldown: function(e) {
                    // i = i + 1;
                    // console.log(e.point.series.name);
                    Session.set('CostType', e.point.series.name);
                    // console.log(e.point.name);
                    Session.set('GenoType', e.point.name);
                    this.xAxis[0].setTitle({
                        text: ''
                    });
                    // console.log(i);

                    tooltipHeadTitle = 'Problem Type';
                }
            }
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Genotypes'
            }
        },
        subtitle: {
            text: 'Click the bar to view details. '
        },
        legend: legend,
        yAxis: {
            title: {
                text: 'Total Cost'
            },
            labels: {
                formatter: function() {
                    // console.log(this.value);
                    if (this.value >= 1E6) {
                        return '$' + this.value / 1000000 + 'M';
                    } else if (this.value >= 0) {
                        return '$' + this.value / 1000 + 'k';
                    }
                }
            }
        },
        // tooltip: {
        //     headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        //     pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:,.0f}</b><br/>'
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            hideDelay: 30,
            formatter: function() {
                let html = ``;

                html = `<div class="relativeValueChartTooltip">
                            <div class="relativeValueChartTooltip-Body" style="width:230px;">
                                <div class="tooltip-DrugName">${this.series.name}</div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">${tooltipHeadTitle}: </div>
                                    <div class="col-md-6 tooltip-SectionValue">${this.point.name}</div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Total Cost: </div>
                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(parseInt(this.point.y))}</div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Average Cost: </div>
                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(parseInt(this.point.avgCost))}</div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Patient Count: </div>
                                    <div class="col-md-6 tooltip-SectionValue">${this.point.total}</div>
                                </div>
                            </div>
                        </div>`;

                return html;
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        // console.log(this.y);
                        if (this.y >= 1000000)
                            return '$' + Highcharts.numberFormat(this.y / 1000000, 0) + 'M';
                        else if (this.y >= 1000 && this.y < 1000000)
                            return '$' + Highcharts.numberFormat(this.y / 1000, 0) + 'k';
                        else if (this.y > 0 && this.y < 1000)
                            return '$' + Highcharts.numberFormat(this.y, 0);
                    }
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function(e) {
                            if (container == 'analyticsLiverTransplantByGenotype') {
                                $("livertransplantback_main").show();
                                if (this.x != UNDEFINED) {
                                    Session.set('CostDrillDown', e.point.name);
                                    CreateCostTable();
                                }
                            }
                        }
                    }
                }
            }
        },
        series: chartData.jsonSCTreatmentPhot,
        drilldown: {
            series: chartData.jsonTreatmentPSCDrilDownt,
            //Praveen 02/21/2017 added drill down button styling
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0, // nisha 02/22/2017 for  drill down button alignment
                    x: 0
                },
                theme: {
                    fill: '#ee4118',
                    'stroke-width': 0,
                    stroke: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    r: 2,
                    states: {
                        hover: {
                            fill: '#ee4118'
                        },
                        select: {
                            stroke: '#039',
                            fill: '#ee4118'
                        }
                    },
                    plotShadow: false,
                    boxShadow: {
                        color: 'grey',
                        width: 10,
                        offsetX: 1,
                        offsetY: 1
                    }
                }

            }
        }
    });

}


/**
 * Created: Nisha 22-Feb-2017
 * Description : for Calclulating the Cost of each icd cpt Codes and rendering it in table format
 * Modified : Nisha 27-Feb-2017 ; For implementing sorting in the 3rd level drill down. 
 */
let renderCostTable = (data) => {
    // console.log(data);
    // $('#divCostTable').empty();
    let chartContentHtml = ``,
        sumavgpatientcharges = 0,
        stringformatedcost = ``,
        patientuniquecount = 0;
    // let filteredCostData = filteredData.filter((a) => a.GENOTYPE == GenoType && a.Occurance.replace(" ", "_") == CostType.replace(" ", "_") && a.COST_CD == CostDrillDown);
    var groupedCode = _.groupBy(data, 'Code');
    // console.log(groupedCode);
    chartContentHtml = `<div class="col-lg-12">
							    	  <div  class="analyticsCommonPopupHeader" > ` + CostDrillDown + ` <div id="livertransplantback" class="customChartBackButton backButtonCss">Back</div></div><br/><br/>`;
    chartContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">`
    if (CostDrillDown != "MEDICATION")
        chartContentHtml += ` <div class="showInRowP" style="width:5% !important"><b>Code</b></div>`

    chartContentHtml += `<div class="showInRowP" style="padding-left:40px;text-align:left"><b>Problem / Medication Name</b></div>
                                    <div class="showInRowP" style="width:20% !important"><b>Patient Counts</b></div>
                                    <div class="showInRowP" style="width:25% !important"><b>Total Cost</b></div>
                               </div>`;
    chartContentHtml += `<div id="innerHTMLtable">`;
    let CodeData = [];
    for (let keys in groupedCode) {
        sumavgpatientcharges = 0;
        let TableData = {};
        for (i = 0; i < groupedCode[keys].length; i++) {
            // Sum for Genotypes
            sumavgpatientcharges = sumavgpatientcharges + groupedCode[keys][i].CHARGE;
        }
        TableData.sumavgpatientcharges = sumavgpatientcharges;
        //TableData.patientuniquecount = _.uniq(_.pluck(groupedCode[keys], 'PATIENT_ID_SYNTH')).length;
        TableData.patientuniquecount = getUniqueCount(groupedCode[keys], 'PATIENT_ID_SYNTH');

        TableData.groupedCode = groupedCode[keys][0].Code;
        TableData.groupedCodeName = groupedCode[keys][0].Prob_NM;

        // stringformatedcost = "$" + commaSeperatedNumber(parseFloat(sumavgpatientcharges).toFixed(2));
        // patientuniquecount = _.uniq(_.pluck(groupedCode[keys], 'PATIENT_ID_SYNTH'))
        // chartContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">`
        // if (CostDrillDown != "MEDICATION")
        //     chartContentHtml += ` <div class="showInRowP" style="width:5% !important">${groupedCode[keys][0].Code}</div>`

        // chartContentHtml += `<div class="showInRowP" style="padding-left:40px;text-align:left">${groupedCode[keys][0].Prob_NM == null ? keys : groupedCode[keys][0].Prob_NM }</div>
        //                         <div class="showInRowP" style="width:20% !important">${patientuniquecount.length}</div>
        //                         <div class="showInRowP" style="width:25% !important">${stringformatedcost}</div>
        //                    </div>`;
        CodeData.push(TableData);
    }

    CodeData.sort(function(a, b) {
        return parseFloat(b["sumavgpatientcharges"]) - parseFloat(a["sumavgpatientcharges"]);
    });
    // console.log('CodeData');
    // console.log(CodeData);

    for (var i = 0; i < CodeData.length; i++) {
        let stringformatedcost = "$" + commaSeperatedNumber(parseFloat(CodeData[i].sumavgpatientcharges).toFixed(2));
        chartContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">`
        if (CostDrillDown != "MEDICATION")
            chartContentHtml += ` <div class="showInRowP" style="width:5% !important">${CodeData[i].groupedCode}</div>`

        chartContentHtml += `<div class="showInRowP" style="padding-left:40px;text-align:left">${CodeData[i].groupedCodeName}</div>
                                    <div class="showInRowP" style="width:20% !important">${CodeData[i].patientuniquecount}</div>
                                    <div class="showInRowP" style="width:25% !important">${stringformatedcost}</div>
                               </div>`;
    }

    chartContentHtml += ` </div></div>`;
    $('#divCostTable').html(chartContentHtml);
    $('#divCostTable').show();
    $('#analyticsLiverTransplantByGenotype').hide();

    // setTimeout(function() {
    //     $('.costChartsLoading').hide();
    //     $('.costChartWrapper').show();
    // }, 1000);
    // $('.pharmaPatientsPopup').show();
}


/**
 *  Created: Nisha 22-Feb-2017
 * Description : Made a meteor call for getting the filtered data for Calclulating the Cost of each icd cpt Codes
 */
let CreateCostTable = () => {
    // console.log(Session.get('GenoType'));
    // console.log(Session.get('CostType'));
    // console.log(Session.get('CostDrillDown'));
    params = {};
    if (Pinscriptive.Filters) {
        params = getCurrentPopulationFilters();
    }
    GenoType = Session.get('GenoType');
    CostType = Session.get('CostType');
    CostDrillDown = Session.get('CostDrillDown');
    params.LTGenoType = GenoType;
    params.LTCostType = CostType;
    params.LTCostDrillDown = CostDrillDown.replace(" ", "_");
    // Clear the popup data
    // $('.costChartWrapper').hide();
    $('#divCostTable').empty();
    // $('.pharmaPatientsPopup').show();
    // setTimeout(function() {
    //     $('.costChartsLoading').show();
    //     $('.costChartWrapper').hide();
    // }, 1000);
    console.log('CreateCostTable');
    Meteor.call('getLiverTransplantCostDataDrillDown', params, function(error1, results) {
        if (error1) {
            console.log("error");
        } else {
            console.log("method called");
            var decompressed_object_result_LT = LZString.decompress(results);
            var resulting_object_result_LT = JSON.parse(decompressed_object_result_LT);
            setTimeout(function() {
                console.log('renderCostTable');
                renderCostTable(resulting_object_result_LT);

            }, 50);
        }
    });
    /* working code commented
    $('.pharmaPatientsPopup').show();
    // console.log(filteredData);
    $('#divCostTable').empty();
    let chartContentHtml = ``,
        sumavgpatientcharges = 0,
        stringformatedcost = ``,
        patientuniquecount = 0;
    let filteredCostData = filteredData.filter((a) => a.GENOTYPE == GenoType && a.Occurance.replace(" ", "_") == CostType.replace(" ", "_") && a.COST_CD == CostDrillDown);
    var groupedCode = _.groupBy(filteredCostData, 'Code');
    // console.log(groupedCode);
    chartContentHtml = `<div class="col-lg-12">
							    	  <div  class="analyticsCommonPopupHeader" > ` + CostDrillDown + ` </div>`;
    chartContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP" style="padding-left:40px;text-align:left"><b>Problem / Medication Name</b></div>
                                    <div class="showInRowP" style="width:25% !important"><b>Count</b></div>
                                    <div class="showInRowP" style="width:25% !important"><b>Cost</b></div>
                               </div>`;

    for (let keys in groupedCode) {
        sumavgpatientcharges = 0;
        for (i = 0; i < groupedCode[keys].length; i++) {
            // Sum for Genotypes
            sumavgpatientcharges = sumavgpatientcharges + groupedCode[keys][i].CHARGE;
        }
        stringformatedcost = "$" + commaSeperatedNumber(parseFloat(sumavgpatientcharges).toFixed(2));
        patientuniquecount = _.uniq(_.pluck(groupedCode[keys], 'PATIENT_ID_SYNTH'))
        chartContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP" style="padding-left:40px;text-align:left">${groupedCode[keys][0].Prob_NM == null ? keys : groupedCode[keys][0].Prob_NM }</div>
                                    <div class="showInRowP" style="width:25% !important">${patientuniquecount.length}</div>
                                    <div class="showInRowP" style="width:25% !important">${stringformatedcost}</div>
                               </div>`;

    }
    chartContentHtml += ` </div>`;
    $('#divCostTable').html(chartContentHtml); */
}

function renderCategoriesChart(baseData, reporttype) {
    let container = '';
    //Praveen 02/20/2017 commmon cohort
    if (reporttype == 'original') {
        setCohortPatientCount({
            //patientCount: baseData.length
            //patientCount: _.uniq(_.pluck(baseData, 'patientId')).length
            patientCount: getUniqueCount(baseData, 'patientId')
        });

        container = 'costBurden-allCatsChart';
        renderAllCategoriesChart(baseData, container);

        //dummy data
        container = 'costBurden-physicianService';
        renderSingleCategoryChart(baseData, container, 'physician_service');

        container = 'costBurden-hospitalization';
        renderSingleCategoryChart(baseData, container, 'hospitalization');


        container = 'costBurden-liverDisease';
        renderSingleCategoryChart(baseData, container, 'liver_disease');

        container = 'costBurden-antiTherapy';
        renderAntiTherapyChart(baseData, container);
        appendCountInfoOnTooltips(baseData);
    } else if (reporttype == 'primary') {
        container = 'primaryDataViewSection-costBurden';
        renderAllCategoriesChart(baseData, container);

        //dummy data
        container = 'costBurden-physicianServicePrimary';
        renderSingleCategoryChart(baseData, container, 'physician_service');

        container = 'costBurden-hospitalizationPrimary';
        renderSingleCategoryChart(baseData, container, 'hospitalization');


        container = 'costBurden-liverDiseasePrimary';
        renderSingleCategoryChart(baseData, container, 'liver_disease');

        container = 'costBurden-antiTherapyPrimary';
        renderAntiTherapyChart(baseData, container);

    } else if (reporttype == 'secondary') {
        container = 'secondaryDataViewSection-costBurden';
        renderAllCategoriesChart(baseData, container);

        //dummy data
        container = 'costBurden-physicianServiceSecondary';
        renderSingleCategoryChart(baseData, container, 'physician_service');

        container = 'costBurden-hospitalizationSecondary';
        renderSingleCategoryChart(baseData, container, 'hospitalization');

        container = 'costBurden-liverDiseaseSecondary';
        renderSingleCategoryChart(baseData, container, 'liver_disease');

        container = 'costBurden-antiTherapySecondary';
        renderAntiTherapyChart(baseData, container);
    }
}


let renderRelapsedPatientCharts = (chartData, chartDataRemitted) => {

    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
    //draw relapsed chart
    renderRelapsedPatientChartskey('pharmaTreatmentRelapsed', chartData.genotype.data, chartData.genotype.keys, 'Genotype');
    //DRAW REMISSION CHART
    renderStackedChartRemmission('pharmaTreatmentRemmitted', chartDataRemitted.genotype.data, chartDataRemitted.genotype.keys, 'Genotype');


};
//Extension method for compartive chart 
let renderRelapsedPatientChartsExtension = ({ relapsedContainer, remmittedContainer, isRelapsed, isRemmitted, RemmittedData, RelapsedData, relapsedKey, remmitedKey }) => {

    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
    if (isRelapsed) {
        console.log("draw relapsed chart");
        //draw relapsed chart
        renderRelapsedPatientChartskey(relapsedContainer, RelapsedData[relapsedKey].data, RelapsedData[relapsedKey].keys, relapsedKey);
    }
    if (isRemmitted) {
        //DRAW REMISSION CHART
        console.log("DRAW REMISSION CHART");
        renderStackedChartRemmission(remmittedContainer, RemmittedData[remmitedKey].data, RemmittedData[remmitedKey].keys, remmitedKey);
    }

};


let renderRelapsedPatientChartskey = (container, chartData, category, key) => {

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            zoomType : 'xy'
        },
        title: {
            text: null
        },
        subtitle: {
            text: 'Click and drag to zoom in. Hold down shift key to span.'
        },
        xAxis: {
            categories: category,
            title: {
                text: key
            }
            // crosshair: true
        },
        colors: customColorsArray(), //['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'],
        plotOptions: {
            column: {
                dataLabels: {
                    align: 'center',
                    enabled: true,
                    formatter: function() {
                        //  console.log(this);
                        if (this.y != 0) {
                            return ' $ ' + autoFormatCostValue(this.point.cost); // commaSeperatedNumber(this.y); // Nisha 02/24/2017 modified to get the cost as labels
                        }
                    },
                    // format: '$' + '{point.cost:,.0f}', // Nisha 02/24/2017 modified to get the cost as labels
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
                //  text: 'Avg Cost'
                text: 'Patient Count'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                return key + ' :' + this.key + '<br/> Patient Count: ' + commaSeperatedNumber(this.y) + '<br/> Avg Cost: $ ' + commaSeperatedNumber(this.point.cost.toFixed());
            }
        },

        series: chartData
    });

}

let renderStackedChartRemmission = (container, chartData, category, key) => {
    Highcharts.chart(container, {
        chart: {
            type: 'column',
        },
        title: {
            text: null
        },
        xAxis: {
            categories: category,
            title: {
                text: key
            }
        },
        colors: customColorsArray(), //['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', "#929FA8", "#97E0E3", "#676767", "#FBDE97", '#17becf'],
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count (%)'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                return key + ' :' + this.key + '<br/> Patient Count: ' + commaSeperatedNumber(this.y) + '<br/> Avg Cost: $ ' + commaSeperatedNumber(this.point.cost.toFixed());
            }
        },
        plotOptions: {
            column: {
                stacking: 'percent',
                dataLabels: {
                    align: 'center',
                    enabled: true,
                    formatter: function() {
                        //  console.log(this);
                        if (this.y != 0) {
                            return ' $ ' + autoFormatCostValue(this.point.cost); // commaSeperatedNumber(this.y); // Nisha 02/24/2017 modified to get the cost as labels
                        }
                    },
                    // format: '' + '{point.y:,.0f}',
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
            y: 100
        },
        series: chartData
    });
}

function getGroupsForData(data, key) {
    let groupedData = [],
        pCount = 0;

    groupedData = _.filter(data, function(rec) {
        if (rec[key] == 1)
            return true;
    });

    //pCount = _.uniq(_.pluck(groupedData, 'patientId')).length;
    pCount = getUniqueCount(groupedData, 'patientId');

    // if (groupedData.length)
    //     return groupedData;
    // else
    //     return 0;

    return {
        data: groupedData,
        count: pCount
    }


}

function getCostForGroup(data, key) {
    if (data.length < 1)
        return 0;

    let filterData = [];

    for (let i = 0; i < data.length; i++) {
        filterData.push(data[i][key]);
    }

    return filterData.average().toFixed();
}

function renderAllCategoriesChart(patientsData, container) {

    container = '#' + container;

    // let keys = ['Physician Service', 'Hospitalization', 'Diagnostic Testing', 'Liver Disease', 'Antiviral Therapy'];
    let keys = ['Physician Service', 'Hospitalization', 'Liver Disease', 'Antiviral Therapy'];

    // let chartData = [{
    //         'category': 'Physician Service',
    //         'Count': getGroupsForData(patientsData, 'physician_service').length,
    //         'Cost': getCostForGroup(getGroupsForData(patientsData, 'physician_service'), 'physician_cost'),
    //         'patientsData': getGroupsForData(patientsData, 'physician_service')

    //     }, {
    //         'category': 'Hospitalization',
    //         'Count': getGroupsForData(patientsData, 'hospitalization').length,
    //         'Cost': getCostForGroup(getGroupsForData(patientsData, 'hospitalization'), 'hospitalization_cost'),
    //         'patientsData': getGroupsForData(patientsData, 'hospitalization')
    //     },
    //     {
    //         'category': 'Liver Disease',
    //         'Count': getGroupsForData(patientsData, 'liver_disease').length,
    //         'Cost': getCostForGroup(getGroupsForData(patientsData, 'liver_disease'), 'liver_disease_cost'),
    //         'patientsData': getGroupsForData(patientsData, 'liver_disease')
    //     }, {
    //         'category': 'Antiviral Therapy',
    //         'Count': patientsData.length,
    //         'Cost': getCostForMedicationGroup(patientsData),
    //         'patientsData': patientsData
    //     }
    // ];

    //Pram: (26th May 17): changed the data preparation logic
    let chartData = [];

    //for Physician Service
    let categoryData = getGroupsForData(patientsData, 'physician_service');

    chartData.push({
        'category': 'Physician Service',
        'Count': categoryData.count,
        'Cost': getCostForGroup(categoryData.data, 'physician_cost'),
        'patientsData': categoryData.data
    });

    //for Hospitalization
    categoryData = getGroupsForData(patientsData, 'hospitalization');

    chartData.push({
        'category': 'Hospitalization',
        'Count': categoryData.count,
        'Cost': getCostForGroup(categoryData.data, 'hospitalization_cost'),
        'patientsData': categoryData.data
    });

    //for Liver Disease
    categoryData = getGroupsForData(patientsData, 'liver_disease');

    chartData.push({
        'category': 'Liver Disease',
        'Count': categoryData.count,
        'Cost': getCostForGroup(categoryData.data, 'liver_disease_cost'),
        'patientsData': categoryData.data
    });

    //for Antiviral Therapy
    categoryData = _.filter(patientsData, (rec) => {
        return rec.medication != null;
    });

    chartData.push({
        'category': 'Antiviral Therapy',
        //'Count': _.uniq(_.pluck(categoryData, 'patientId')).length,
        'Count': getUniqueCount(categoryData, 'patientId'),
        'Cost': getCostForMedicationGroup(categoryData),
        'patientsData': categoryData
    });



    // console.log("** ALL CATEGORY DATAa**");
    // console.log(chartData);
    // let colors = ['#A3D4DF', '#ABE9E3', '#A5D2C1', '#ABE9C0', '#A3DFA7'];
    //  let colors = ['#A3D4DF', '#ABE9E3', '#A5D2C1', '#A3DFA7'];

    //Praveen 02/22/2017 Added filter for zero patients
    chartData = chartData.filter((rec) => rec.Count && rec.Count != 0);

    let colors = ["#abd6ba", "#f1cb6a", "#69bae7", "#2e7e97"];

    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'category',
                value: ['Cost']
            },
            // onclick: function(d, element) {
            //     container = container.replace("#", "");
            //     if (container == "costBurden-allCatsChart") {
            //         //c3js library have issue sometimes it not handle proper click event for stacked chart
            //         //if value is not undefined then call method and display data accordingly otherwise not
            //         if (d.value) {
            //             let filterData = chartData[d.index];
            //             let dataObj = _.clone(d);
            //             dataObj['id'] = filterData.category;
            //             filterChartByData(dataObj, 'costburden');
            //         } else {
            //             // console.log("improper click and data");
            //         }
            //     }
            // },
            labels: {
                format: function(v, id, i, j) {
                    if (i != undefined) {
                        let val = '';
                        if (!(chartData[i]['Count'] == undefined || chartData[i]['Count'] == null))
                            val = commaSeperatedNumber(chartData[i]['Count']);
                        return isNaN(parseInt(v)) ? '' : val;
                    }
                }
            },
            color: function(color, d) {
                return colors[d.index];
            }
        },
        /**
         * @author: pramveer
         * @date: 23rd feb 2017
         * @desc: changed height to adjust containers
         */
        size: {
            height: 249,
            width: 550
        },
        padding: {
            top: 5,
            right: 10,
            bottom: 30,
            left: 66,
        },
        legend: {
            show: false,
            //position:'right',
        },
        tooltip: {
            show: true,
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    filterData = chartData[dataObj.x];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + filterData.category + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Cost: $ ' + commaSeperatedNumber(filterData.Cost) + '</div>' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + commaSeperatedNumber(filterData.Count || 0) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        axis: {
            x: {
                type: 'category',
                tick: {
                    fit: true,
                    multiline: true,
                    width: 250
                },
            },
            y: {
                label: {
                    text: 'Average Cost',
                    position: 'middle'
                },
                tick: {
                    format: function(d) {
                        return '$' + Math.round(d / 1000) + 'k';
                    }
                }
            }
        },
        color: function(d) {
            // d will be 'id' when called for legends
            //console.log(d);'#780e0f', '#bf872b', '#ffc91d', '#c3625e', '#629263',
            if (typeof d === 'object') {
                if (chartData[d.index].name == 'physician_service') {
                    color = ["#780e0f"];
                } else if (chartData[d.index].name == 'hospitalization') {
                    color = ["#bf872b"];
                } else if (chartData[d.index].name == 'liver_disease') {
                    color = ["#c3625e"];
                } else if (chartData[d.index].name == 'diagnostic_testing') {
                    color = ["#ffc91d"];
                } else {
                    color = ["#629263"];
                }
            }
            //return d.id && d.id === 'data3' ? d3.rgb(color).darker(d.value / 150) : color;
        },
        bar: {
            width: {
                ratio: 0.8
            }
        }
    });

}

function renderSingleCategoryChart(patientsData, container, key) {
    let cursortype = false;
    if (container == 'costBurden-physicianService' || container == 'costBurden-hospitalization' || container == 'costBurden-liverDisease')
        cursortype = true;
    container = '#' + container;
    color = '';
    height = '';
    width = '';
    if (key == 'physician_service') {
        //   color = ["#A3D4DF"];
        color = ["#abd6ba"];
        height = 250;
        width = 550;
    } else if (key == 'hospitalization') {
        // color = ["#ABE9E3"];
        color = ["#f1cb6a"];
        height = 250;
        width = 550;
    } else if (key == 'liver_disease') {
        // color = ["#ABE9C0"];
        color = ["#e95a52"];
        height = 250;
        // width = 350;
        width = 550;
    } else if (key == 'diagnostic_testing') {
        // color = ["#A5D2C1"];
        color = ["#69bae7"];
        height = 250;
        width = 550;
    } else if (key == 'diagnostic_testing') {
        //  color = ["#A3DFA7"];
        color = ["#69bae7"];
        height = 250;
        width = 1200;
    }

    let groupedBaseData = getGroupsForData(patientsData, key);

    let groupedData = groupedBaseData.data,
        keys = ['Inpatient', 'Outpatient'];

    //console.log(groupedData);
    if (key == 'hospitalization') {
        groupedData = patientsData;
    }

    // let chartData = [
    //     {
    //         gender: 'Inpatient',
    //         percentage: 0,
    //         Count: _.filter(groupedData, function(rec) {
    //             return rec["hospitalization"] == 1;
    //         }).length,
    //         Cost: getCostByHospitalization(groupedData, 1, key),
    //         patientsData: _.filter(groupedData, function(rec) {
    //             return rec.hospitalization == 1;
    //         })
    //     }
    // ];

    //Pram (26th May 17) : fixed the count on the charts

    let chartData = [];
    chartData.push(getUniqueDataForCategory('Inpatient', groupedData, 1, key));

    //// Add Outpatient only if key is not hospitalization
    if (key != 'hospitalization') {
        // chartData.push({
        //     gender: 'Outpatient',
        //     percentage: 0,
        //     Count: _.filter(groupedData, function(rec) {
        //         return rec.hospitalization == 0;
        //     }).length,
        //     Cost: getCostByHospitalization(groupedData, 0, key),
        //     patientsData: _.filter(groupedData, function(rec) {
        //         return rec.hospitalization == 0;
        //     })
        // });

        chartData.push(getUniqueDataForCategory('Outpatient', groupedData, 0, key));

    }
    //Praveen 02/22/2017 Added filter for zero patients ===
    chartData = chartData.filter((rec) => rec.Count !== 0);
    if (chartData.length === 0) {
        $(container).html('<div style="text-align:center;color:red;padding:60px;">No Data Found</div>');
        return;
    }
    //==========
    for (let i = 0; i < chartData.length; i++) {
        chartData[i]['percentage'] = (chartData[i]['Count'] / groupedData.length) * 100;
    }
    // console.log("**** SINGLE COST CATEGORY CHART****");
    // console.log("KEY ::::" + key);
    // console.log(chartData);
    let colors = customColorsArray();
    let chart = c3.generate({
        bindto: container,
        data: {
            // selection: {
            //     enabled: cursortype
            // },
            type: 'bar',
            json: chartData,
            keys: {
                x: 'gender',
                value: ['Count']
                    // value: ['percentage']
            },
            // onclick: function(d, element) {
            //     console.log(container);
            //     container = container.replace('#', '');
            //     if (container == 'costBurden-physicianService' || container == 'costBurden-hospitalization' || container == 'costBurden-liverDisease') {
            //         //c3js library have issue sometimes it not handle proper click event for stacked chart
            //         //if value is not undefined then call method and display data accordingly otherwise not
            //         if (d.value) {
            //             let filterData = chartData[d.index];
            //             let dataObj = _.clone(d);
            //             dataObj['id'] = filterData.gender;
            //             filterChartByData(dataObj, 'gender');

            //             dataObj['id'] = key;
            //             filterChartByData(dataObj, 'costburden');

            //         } else {
            //             // console.log("improper click and data");
            //         }
            //     }
            // },
            labels: {
                format: function(v, id, i, j) {
                    if (i != undefined) {
                        let val = '';
                        if (!(chartData[i]['Count'] == undefined || chartData[i]['Count'] == null))
                            val = commaSeperatedNumber(chartData[i]['Count']);
                        return isNaN(parseInt(v)) ? '' : val;
                    }

                }
            },
            color: (color, d) => colors[d.index],
        },

        size: {
            height: height,
            width: width
        },
        padding: {
            top: 5,
            right: 10,
            bottom: 30,
            left: 66,
        },
        legend: {
            show: false,
            //position:'right',
        },
        tooltip: {
            show: true,
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    filterData = chartData[dataObj.x];
                // console.log(filterData);
                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + filterData.gender + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Cost: $ ' + commaSeperatedNumber(filterData.Cost) + '</div>' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + commaSeperatedNumber(filterData.Count) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        axis: {
            x: {
                type: 'category',
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                },
                tick: {
                    format: function(d) {
                        return commaSeperatedNumber(d); //return '$' + Math.round(d / 1000) + 'k';
                    }
                }
            }
        },
        color: {
            pattern: color
        },
        bar: {
            width: {
                ratio: 0.8
            }
        }
    });


    //Pram(26th May 17) : added function to get the unique data for single category
    function getUniqueDataForCategory(type, dataArray, hospValue, key) {

        let filterData = _.filter(dataArray, (rec) => {
            return rec.hospitalization == hospValue;
        });

        let dataObj = {
            gender: type,
            percentage: 0,
            //Count: _.uniq(_.pluck(filterData, 'patientId')).length,
            Count: getUniqueCount(filterData, 'patientId'),
            Cost: getCostByHospitalization(filterData, 1, key),
            patientsData: filterData
        }

        return dataObj;
    }

}

function renderAntiTherapyChart(baseData, container) {
    var height = 500;
    var width = 1100;
    if (container != 'costBurden-antiTherapy')
        width = 550
    container = '#' + container;

    let groupedData = _.groupBy(baseData, 'medication');

    let chartData = [];
    let atcolors = customColorsArray();
    for (let keys in groupedData) {
        let json = {},
            pData = groupedData[keys];
        // console.log(keys);
        // console.log(pData.length);
        // console.log(getCostForMedicationGroup(pData));
        if (parseFloat(getCostForMedicationGroup(pData)) > 0) {
            json['Medication'] = keys; //.replace(" + ", " +"); // .split('+').join(' +'); //remove + sign from the medication name
            json['Antiviral Therapy'] = getCostForMedicationGroup(pData);
            json['Count'] = pData.length;
            json['patientsData'] = pData;
            chartData.push(json);
        }
    }

    // chartData = [{
    //         "Antiviral Therapy": 17500,
    //         "Medication": "Harvoni",
    //         "Count": 12,
    //     }];

    // let groups = ['Physician Service','Hospitalization','Diagnostic Testing','Liver Disease','Antiviral Therapy'];
    // console.log("** renderAntiTherapyChart***");
    // console.log(chartData);


    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'Medication',
                value: ['Antiviral Therapy']
            },
            //groups: [groups],
            order: 'null',
            // onclick: function(d, element) {
            //     container = container.replace("#", "");
            //     if (container == 'costBurden-antiTherapy') {
            //         //c3js library have issue sometimes it not handle proper click event for stacked chart
            //         //if value is not undefined then call method and display data accordingly otherwise not
            //         if (d.value) {
            //             let filterData = chartData[d.index];
            //             let dataObj = _.clone(d);
            //             dataObj['id'] = filterData.Medication; //.replace(" +", " + ");
            //             filterChartByData(dataObj, 'medication');
            //         } else {
            //             // console.log("improper click and data");
            //         }
            //     }
            // },
            labels: {
                format: function(v, id, i, j) {
                    if (i != undefined) {
                        let val = '';
                        if (!(chartData[i]['Count'] == undefined || chartData[i]['Count'] == null))
                            val = commaSeperatedNumber(chartData[i]['Count']);
                        return isNaN(parseInt(v)) ? '' : val;
                    }
                }
            },
            color: (color, d) => atcolors[d.index]
        },
        size: {
            height: height,
            width: width
        },
        padding: {
            top: 5,
            right: 10,
            bottom: 30,
            left: 200,
        },
        legend: {
            show: false,
            //position:'right',
        },
        tooltip: {
            show: true,
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    filterData = chartData[dataObj.x];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + filterData.Medication + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Therapy Cost: $' + commaSeperatedNumber(filterData['Antiviral Therapy']) + '</div>' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + filterData.Count + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        axis: {
            //// As DrugName is larger and have more data I have reverse axis representation
            rotated: true,
            x: {
                type: 'category',
                font: '',
                // width: 350,
                tick: {
                    fit: true,
                    multiline: false
                },
            },
            y: {
                label: {
                    text: 'Cost in $',
                    //   position: 'middle'
                    position: 'center'
                },
                tick: {
                    format: function(d) {
                        return '$' + Math.round(d / 1000) + 'k';
                    }
                }
            }
        },
        bar: {
            width: {
                ratio: 0.8
            }
        }
    });

    var svg = document.querySelector(container);
    // get our tspans element
    var rect = svg.querySelectorAll('.c3-event-rect');
    // console.log(rect.length);
    if (rect.length == 1)
        chart.resize({
            height: 250,
            width: 1100
        });

    /*//550 transform it to an array so the clones don't add to the list
    var ts = Array.prototype.slice.call(tspans);
    console.log(ts);
    for (var i = 0; i < ts.length; i++) {
        // get the content
        var cont = ts[i].textContent.split(' ');
        // that wasn't the good one...
        if (cont.length < 2) continue;
        // create a clone
        var clone = ts[i].cloneNode(1);
        // set the text to the new line
        clone.textContent = cont[1];
        // space it a litlle bit more
        //clone.setAttribute('dy', '0.9em')
        // set the good text to the upperline
        ts[i].textContent = cont[0];
        // append our clone
        ts[i].parentNode.insertBefore(clone, ts[i].nextSibling);}*/

}

//function getCostByGender(data, gender, key) {
function getCostByHospitalization(data, gender, key) {
    if (data.length < 1)
        return 0;

    let grpData = _.groupBy(data, 'hospitalization');
    grpData = grpData[gender];

    // console.log(grpData);

    if (_.isEmpty(grpData))
        return 0;

    if (key == 'physician_service')
        key = 'physician_cost';
    else
        key = key + '_cost';

    // console.log('hospitalization key');
    // console.log(key);

    let filterData = [];

    for (let i = 0; i < grpData.length; i++) {
        filterData.push(grpData[i][key]);
    }

    // console.log('hospitalization');
    // console.log(filterData.average().toFixed());
    return filterData.average().toFixed();
}

function getCostForMedicationGroup(data) {
    let cost = [];

    for (let i = 0; i < data.length; i++) {
        cost.push(data[i]['claims_cost']);
    }

    return cost.average().toFixed();
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
    let parentWrapper = 'costBurden-Crums';
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
        $('.costBurden-Crums').empty();
    }

    renderChartsWithFilteredData();
}

function renderChartsWithFilteredData() {
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
            let isAltkey = filterObjectsArray[i].altkey ? true : false;
            let isAntiviralTherapy = filterObjectsArray[i].key == "Antiviral Therapy" ? true : false;

            if (isAltkey)
                filterObj[filterObjectsArray[i].altkey] = filterObjectsArray[i].value;
            else
                filterObj[filterObjectsArray[i].key] = filterObjectsArray[i].value;

            if (isAntiviralTherapy)
                modifiedData = modifiedData;
            else
                modifiedData = _.where(modifiedData, filterObj);
        }

        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.addObjectsToArray(filterObjectsArray, rangeObjectsArray);

            //filter the data on range objects
            modifiedData = mlSubTabsUtil.filterForRangeObjects(modifiedData, rangeObjectsArray);
        }
    }

    addBreadsCrums(filterObjectsArray);
    // Modified By Yuvraj (13th Feb 17) : Date filtering is no longer being used.
    // modifiedData = mlSubTabsUtil.getFilteredDataOnDateCombos(modifiedData, filtered);
    $('.costBurden-totalPatients').html(commaSeperatedNumber(modifiedData.length));
    renderCategoriesChart(modifiedData, 'original');
    mlSubTabsUtil.renderPatientsList(modifiedData, 'costBurdenPList');
    mlSubTabsUtil.hideChartLoading();
}


let renderICERChart = (chartData) => {
    let preparedChartData = getCostSectionChartsData(chartData);

    //render the charts
    renderIcerChart(preparedChartData.xAxisLabels, preparedChartData.icerChart);
    renderQalyChart(preparedChartData.xAxisLabels, preparedChartData.qalyChart);
    renderIcerVsQalyChart(preparedChartData.icerVsQalyChart);
}


//function to render qaly chart
let renderQalyChart = (xCategories, qalyChartData) => {
    Highcharts.chart('pharmaQALY', {
        chart: {
            type: 'column',
            zoomType: 'xy'
        },
        title: {
            text: 'QALY'
        },
        subtitle: {
            text: ' '
        },
        xAxis: {
            categories: xCategories,
            gridLineWidth: 0,
        },
        legend: false,
        yAxis: {
            lineWidth: 1,
            title: {
                text: 'QALY per Drug'
            },
            plotLines: [{
                value: 0,
                color: 'red',
                width: 2
            }]
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    format: '{y:.2f}'
                }
            }
        },
        tooltip: {
            headerFormat: `<span style="font-size:10px">{point.key}</span><table>`,
            pointFormat: `<tr><td>{series.name}: </td>
                            <td style="padding:0"><b>{point.y:.2f}</b></td></tr>`,
            footerFormat: `</table>`,
            shared: true,
            useHTML: true
        },

        series: qalyChartData
    });
}

//function to render ICER chart
let renderIcerChart = (xCategories, icerChartData) => {
    Highcharts.chart('pharmaICER', {
        chart: {
            type: 'column',
            zoomType: 'xy'
        },
        title: {
            text: 'ICER'
        },
        subtitle: {
            text: ' '
        },
        xAxis: {
            categories: xCategories,
            gridLineWidth: 0,
        },
        yAxis: {
            lineWidth: 1,
            title: {
                text: 'Additional Cost per ICER'
            },
            labels: {
                format: '${value}'
            },
            plotLines: [{
                value: 0,
                color: 'red',
                width: 2
            }]
        },
        legend: false,
        tooltip: {
            headerFormat: `<span style="font-size:10px">{point.key}</span><table>`,
            pointFormat: `<tr><td>{point.TextCount}: </td>
                    <td style="padding:0"><b>\${point.patientcount:,.2f} </b></td></tr>
                    <tr><td>Cost Per Qaly: </td>
                    <td style="padding:0"><b>\${point.y:,.2f}</b></td></tr>`,
            footerFormat: `</table>`,
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    format: '{y:,.2f}'
                }
            }
        },
        series: icerChartData
    });
}

//function to render ICER v/s Qaly Chart
let renderIcerVsQalyChart = (baseChartObj) => {
    let chartDataObj = getIcerVsQalyData(baseChartObj);

    Highcharts.chart('pharmaQALYICERxy', {
            chart: {
                type: 'bubble',
                plotBorderWidth: 1,
                height: baseChartObj.chartHeight,
                zoomType: 'xy'
            },
            legend: {
                enabled: false
            },

            title: {
                text: ' ICER vs QALY '
            },

            subtitle: {
                text: ' '
            },

            xAxis: {
                // min: minQALY,
                // max: maxQALY,
                //reversed: true,
                min: -10,
                max: 10,
                gridLineWidth: 1,
                title: {
                    text: 'QALY gain/loss (Year)'
                },
                labels: {
                    format: '{value}'
                },
                plotBands: chartDataObj.xPlotBands,
                plotLines: chartDataObj.xPlotLines
            },

            yAxis: {
                min: chartDataObj.yMin,
                max: chartDataObj.yMax,
                reversed: true,
                startOnTick: false,
                endOnTick: false,
                title: {
                    text: 'ICER per Week'
                },
                labels: {
                    format: '${value}'
                },
                maxPadding: 0.2,
                plotBands: chartDataObj.yPlotBands,
                plotLines: chartDataObj.yPlotLines
            },

            tooltip: {
                useHTML: true,
                headerFormat: '<div class="icerVsQalyTooltip">',
                pointFormat: `<div class="icerVsQalyTooltip-Body">
                            <div class="tooltip-DrugName">{point.name}</div>
                             <div class="tooltip-Section">
                                <div class="col-md-6 tooltip-SectionLabel">QALY: </div>
                                <div class="col-md-6 tooltip-SectionValue">{point.x:,.2f} Years</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="col-md-6 tooltip-SectionLabel">ICER: </div>
                                <div class="col-md-6 tooltip-SectionValue">\${point.y:,.2f}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="col-md-6 tooltip-SectionLabel">Patients: </div>
                                <div class="col-md-6 tooltip-SectionValue">{point.count}</div>
                            </div>
                        </div>`,
                footerFormat: '</div>',
                followPointer: false,
                hideDelay: 30
            },

            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.abbr}'
                    }
                }
            },

            series: chartDataObj.chartData
                /* [{
                           data: [
                               { x: 95, y: 95, name: 'BE' },
                               { x: 86.5, y: 102.9, name: 'DE' }
                           ]
                       }]*/

        },
        function(chart) {
            plotTheOuterRing(chart);
        });

    //function to draw ring on selected drug
    function plotTheOuterRing(chartObj) {
        $.each(chartObj.series, function(i, serie) {

            $.each(serie.data, function(j, point) {
                point.update({
                    marker: {
                        lineColor: point.options.isSelected ? '#fff200' : '',
                        lineWidth: point.options.isSelected ? 4 : 0,
                        fillColor: point.options.color,
                        states: {
                            hover: {
                                lineWidth: point.options.isSelected ? 5 : 0,
                                lineColor: point.options.isSelected ? '#fff200' : ''
                            }
                        }
                    }
                }, false);
            });
            chartObj.redraw();
        });
    }
}


//function to prepare chart data for icervsqaly chart
let getIcerVsQalyData = (chartDataObj) => {
    let finalObj = chartDataObj;
    finalObj.chartHeight = 500;

    finalObj.xPlotBands = [

    ];

    finalObj.yPlotBands = [

    ];

    finalObj.xPlotLines = [{
        color: 'red',
        width: 2,
        value: 0
    }, {
        color: 'transaprent',
        dashStyle: 'dot',
        width: 2,
        value: -10,
        label: {
            rotation: 0,
            x: 0,
            y: 10,
            style: {
                fontStyle: 'italic',
                fontWeight: 'bold'
            },
            text: 'Low Cost/Low Qaly'
        },
        zIndex: 3
    }, {
        color: 'transaprent',
        dashStyle: 'dot',
        width: 2,
        value: -10,
        label: {
            rotation: 0,
            x: 0,
            y: 500 - 120, //chartheight - 120
            style: {
                fontStyle: 'italic',
                fontWeight: 'bold'
            },
            text: 'High Cost/Low Qaly'
        },
        zIndex: 3
    }];

    finalObj.yPlotLines = [{
        color: 'red',
        width: 2,
        value: 0
    }, {
        color: 'tranparent',
        dashStyle: 'dot',
        width: 2,
        value: finalObj.yMax, //yMax instead of yMin because we've inverted the Y axis for Optimal Point
        label: {
            align: 'right',
            style: {
                fontStyle: 'italic',
                fontWeight: 'bold'
            },
            text: 'High Cost/High Qaly',
            x: -10,
            y: -5
        },
        zIndex: 3
    }, {
        color: 'tranparent',
        dashStyle: 'dot',
        width: 2,
        value: finalObj.yMin, //yMin instead of yMax because we've inverted the Y axis for Optimal Point
        label: {
            align: 'right',
            style: {
                fontStyle: 'italic',
                fontWeight: 'bold'
            },
            text: 'Low Cost/High Qaly',
            x: -10,
            y: 10
        },
        zIndex: 3
    }];
    return finalObj;
}

//function to prepare data for COSt section charts
let getCostSectionChartsData = (baseData) => {
    // ICER = (Cn - Co)/(QALYn - QALYo)
    //  QALY = Q*(1-e(-0.03*Remaining Years))/0.03

    let icerDataArray = [],
        icerChartData = [];
    let qalyDataArray = [],
        qalyChartData = [];
    let icerVsQalyDataArray = [],
        icerVsQalyChartData = [];

    let drugsToCompare = [];
    let xAxisLabels = [];
    let selectedDrug = $("#pharma-medicationICER").val().toUpperCase(),
        selectedDrugData = {};

    let cost0 = 0, //cost for a selected drug
        costN = 0,
        qaly0 = 0,
        qalyN = 0;

    let finalICER = 0,
        finalQALY = 0;

    //colors array for charts
    let colorsArray = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#9ec8f2', '#2aaaf7', '#4ea6ca', '#c0983b',
        '#cc9529', '#e08a08', '#dc7d02', '#bf6807', '#4b2c48', '#301f58', '#251a5e'
    ];

    //filter the current selected drug data
    selectedDrugData = _.where(baseData, {
        MEDICATION: selectedDrug
    })[0];

    //calculate the cost for the selected drug
    cost0 = selectedDrugData.AverageCost;

    //calculate the qaly for the selected drug
    qaly0 = (selectedDrugData.SuccessProbability / 100) * (1 - Math.exp(-0.03 * 20)) / 0.03;

    //push all the checked drugs into compare array
    $("#divMedicineList").find("input:checked").each(function(i, ob) {
        drugsToCompare.push($(ob).val());
    });

    /**
     * @author: Pramveer
     * @date: 27th Feb 17
     * @desc: push the selected drug in the array if not selected from the compare selection
     */
    if (drugsToCompare.indexOf(selectedDrug) < 0) {
        drugsToCompare.push(selectedDrug);
    }


    //loop for all the selected drugs data
    for (let i = 0; i < drugsToCompare.length; i++) {
        let currentDrug = drugsToCompare[i].toUpperCase(),
            filterDrug = {};
        let costCount = 0,
            qalyCount = 0,
            patientCount = 0,
            textName = '';

        costN = 0;
        qalyN = 0;

        filterDrug = _.where(baseData, {
            MEDICATION: currentDrug
        })[0];
        costN = filterDrug.AverageCost;
        qalyN = (filterDrug.SuccessProbability / 100) * (1 - Math.exp(-0.03 * 20)) / 0.03;
        patientCount = filterDrug.count;

        //check if the current drug is the selected drug
        if (currentDrug === selectedDrug) {
            costCount = cost0;
            qalyCount = qaly0;
        } else {
            costCount = (costN - cost0);
            qalyCount = (qalyN - qaly0) == 0 ? 0 : (qalyN - qaly0);
        }

        finalICER = qalyCount == 0 ? 0 : costCount / qalyCount;

        if (costCount < 0) {
            //textName = 'Saving';
            textName = 'Total Cost';
            costCount = costCount * (-1);
        } else {
            textName = 'Total Cost';
            costCount = costCount;
        }

        //push the drugs name into array for x labels
        xAxisLabels.push(currentDrug);

        if (isNaN(finalICER)) {
            finalICER = 0;
        }

        //push data for ICER Chart
        icerDataArray.push({
            y: finalICER,
            color: colorsArray[i],
            patientcount: costCount,
            TextCount: textName
        });

        //push data for QALY Chart
        qalyDataArray.push({
            y: qalyCount,
            color: colorsArray[i]
        });

        //push data for ICER V/S QALY Chart
        icerVsQalyDataArray.push({
            abbr: getDrugAbbr(currentDrug),
            name: currentDrug,
            x: qalyCount,
            y: finalICER,
            color: colorsArray[i],
            count: patientCount,
            isSelected: currentDrug == selectedDrug
        });

    }

    //chart data for ICER Chart
    icerChartData.push({
        name: 'ICER',
        data: icerDataArray
    });

    //chart data for QALY Chart
    qalyChartData.push({
        name: 'QALY',
        data: qalyDataArray
    });

    //chart data for ICER V/S QALY Chart
    icerVsQalyChartData.push({
        data: icerVsQalyDataArray
    });

    //get min/max values for Yaxis
    let minICER = _.min(_.pluck(icerVsQalyDataArray, 'y'));
    let maxICER = _.max(_.pluck(icerVsQalyDataArray, 'y'));

    //get min/max values for Xaxis
    let minQALY = _.min(_.pluck(icerVsQalyDataArray, 'x'));
    let maxQALY = _.max(_.pluck(icerVsQalyDataArray, 'x'));

    // Y axis min/max adjustment to divide the chart into 4 equal quadrants
    let whichisMax = Math.abs(maxICER) > Math.abs(minICER) ? 'max' : 'min';
    if (whichisMax == 'min') {
        maxICER = 0 - minICER;
    } else {
        minICER = 0 - maxICER;
    }

    //upper/bottom adjustment value for the Y axis so that
    //the bubble is plotted within the chart canvas and doesn't overlap the quadrant labels.
    let stepPixel = parseInt(maxICER * 0.3);
    maxICER = maxICER > 0 ? maxICER + stepPixel : maxICER - stepPixel;
    minICER = minICER > 0 ? minICER + stepPixel : minICER - stepPixel;

    // console.log('stepPixel',stepPixel);
    // console.log('min',minICER);
    // console.log('max',maxICER);

    let finalObj = {
        icerChart: icerChartData,
        qalyChart: qalyChartData,
        icerVsQalyChart: {
            chartData: icerVsQalyChartData,
            yMin: minICER,
            yMax: maxICER
        },
        xAxisLabels: xAxisLabels
    }

    return finalObj;
}

//function to get Abbr from Full Name
let getDrugAbbr = (drugName) => {
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

//navigation search and close
let openNav = () => {
    document.getElementById("viral_load_over_time_opition").style.width = "620px";
    //document.getElementById("viral_load_over_time_opition").style.top = "100px";
}

let closeNav = () => {
    document.getElementById("viral_load_over_time_opition").style.width = "0";
}


let updateDrugCombo = (drugsArray) => {
    $('.pharmaCost-ICERChartSection').hide();
    $('.pharmaCost-ICERNoData').show();

    let optionsHtml = `<option value="null" selected disabled>Select ...</option>`;
    // Added By Jayesh 28th March 2017 Check for variable is array or not to solved 'cannot read property 'length' of undefined' issue
    if (_.isArray(drugsArray)) {
        for (let i = 0; i < drugsArray.length; i++) {
            optionsHtml += `<option value="${drugsArray[i]}">${drugsArray[i]}</option>`;
        }
    }

    $('#pharma-medicationICER').selectize()[0].selectize.destroy();
    $('#pharma-medicationICER').empty();
    $('#pharma-medicationICER').html(optionsHtml);

    $('#pharma-medicationICER').selectize();
}



let appendCountInfoOnTooltips = (baseData) => {
    //console.log(baseData);
    let filterData = _.filter(baseData, (rec) => {
        return rec.medication != null;
    });

    let totalPatients = getPatientCount(baseData),
        patientsWithMed = getPatientCount(filterData);

    let physicanServicePatients = 0,
        icerPatients = 0,
        liverDiseasePatients = 0,
        hospitalizedpatients = 0;

    let relapsedPatients = 0,
        remittedPatients = 0
    patientsWithRelaspedandRemitted = 0;

    let liverTransPlantN = 0,
        overAllLiverTransPlantN = 0;

    filterData = _.filter(baseData, (rec) => {
        return rec.hospitalization == '1';
    });
    hospitalizedpatients = getPatientCount(filterData);

    filterData = _.filter(baseData, (rec) => {
        return rec.physician_service == 1;
    });
    physicanServicePatients = getPatientCount(filterData);

    filterData = _.filter(baseData, (rec) => {
        return rec.liver_disease == '1';
    });
    liverDiseasePatients = getPatientCount(filterData);

    //get count for icer chart
    for (let i = 0; i < ICERData.length; i++) {
        icerPatients += ICERData[i].count;
    }

    //get count for relapsed&RemiitedPatientData
    //patientsWithRelaspedandRemitted += _.uniq(_.pluck(relapsedPatientData.rawData, 'PATIENT_ID_SYNTH')).length;
    patientsWithRelaspedandRemitted = getUniqueCount(relapsedPatientData.rawData, 'PATIENT_ID_SYNTH');

    //get count for relasped only
    relapsedPatients = getViralLoadDataCountByName(relapsedPatientData.relapsed, 'Relapsed');

    //get count for remitted only
    remittedPatients = getViralLoadDataCountByName(relapsedPatientData.remitted, 'Remission');

    //count for liver transplant
    overAllLiverTransPlantN = patientsWithMed;
    liverTransPlantN = CostBurdenObj.Primary.LiverTransplantCostData.uniqueTotal;

    $('.costBurden-AntiviralN').html(commaSeperatedNumber(patientsWithMed));
    $('.costBurden-liverDiseaseN').html(commaSeperatedNumber(liverDiseasePatients));
    $('.costBurden-HopitalizedN').html(commaSeperatedNumber(hospitalizedpatients));
    $('.costBurden-physcianServiceN').html(commaSeperatedNumber(physicanServicePatients));
    $('.costBurden-overAllTotalPatients').html(commaSeperatedNumber(totalPatients));
    $('.costBurden-IcerN').html(commaSeperatedNumber(icerPatients));

    $('.costBurden-relaspedN').html(commaSeperatedNumber(relapsedPatients));
    $('.costBurden-remittedN').html(commaSeperatedNumber(remittedPatients));
    $('.costBurden-overallrelapedAndRemittedN').html(commaSeperatedNumber(patientsWithRelaspedandRemitted));

    $('.costBurden-LivertransPlantN').html(commaSeperatedNumber(liverTransPlantN));
    $('.costBurden-overAllLiverTranplantN').html(commaSeperatedNumber(overAllLiverTransPlantN));


    $('.costBurden-AntiviralN-PerN').html(getPercentForValue(patientsWithMed, totalPatients));
    $('.costBurden-liverDiseaseN-PerN').html(getPercentForValue(liverDiseasePatients, totalPatients));
    $('.costBurden-HopitalizedN-PerN').html(getPercentForValue(hospitalizedpatients, totalPatients));
    $('.costBurden-physcianServiceN-PerN').html(getPercentForValue(physicanServicePatients, totalPatients));
    $('.costBurden-IcerN-PerN').html(getPercentForValue(icerPatients, patientsWithMed));

    $('.costBurden-relaspedN-PerN').html(getPercentForValue(relapsedPatients, patientsWithRelaspedandRemitted));
    $('.costBurden-remittedN-PerN').html(getPercentForValue(remittedPatients, patientsWithRelaspedandRemitted));

    $('.costBurden-LivertransPlantN-PerN').html(getPercentForValue(liverTransPlantN, overAllLiverTransPlantN));


}

let getPatientCount = (pData) => {
    //return _.uniq(_.pluck(pData, 'patientId')).length;
    return getUniqueCount(pData, 'patientId');
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

let getViralLoadDataCountByName = (dataArray, Key) => {
    let count = 0,
        filterData = [];

    try {

        filterData = _.where(dataArray.genotype.data, { name: Key });
        filterData = filterData[0].data;

        for (let i = 0; i < filterData.length; i++) {
            count += filterData[i].y;
        }
    } catch (ex) {
        count = 0;
    }

    return count;
}