import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './retreatmentdistribution.html';
import * as analyticsLib from '../../../analyticsLib.js';

import * as mlSubTabsUtil from '../modelUtils.js';


let RetreatmentPatientData = {};
let primaryData = [];
let secondaryData = [];

Template.RetreatmentDistribution.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.noData = new ReactiveVar(false);
    this.autorun(function() {
        let params = getCurrentPopulationFilters();
        params.medications = null;

        executeRetreatedDistributionRender(params, self);
    });
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
});

Template.RetreatmentDistribution.destroyed = function() {

}
Template.RetreatmentDistribution.rendered = function() {
    $('.headerbuttonFilesection').hide();
}

Template.RetreatmentDistribution.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    },

});

Template.RetreatmentDistribution.events({
    'click .retreatmentdistribution li': function(e, template, data) {
        if (data && data == 'refresh') {
            template.loading.set(true);
            template.noData.set(false);
            let params = getCurrentPopulationFilters();
            executeRetreatedDistributionRender(params, template, true);
        }
    },
    'click .analytics_closebtn': function(e, template, data) {
        $('.analyticsPatientsPopup').hide();
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');

        if (value == 'retreatbyGenotype') {
            primaryData = RetreatmentPatientData.originData;
            secondaryData = RetreatmentPatientData.compareData;
        }
        if (isCustomerDataset()) {
            plotComparisionDataCharts(value, primaryData, secondaryData, desc);
        } else {
            plotComparisionDataCharts(value, secondaryData, primaryData, desc);
        }

    }
});


//function to plot comparision charts
let plotComparisionDataCharts = (plottingData, imsData, phsData, diffplottingData) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection',
        secondaryContainer = 'secondaryDataViewSection';


    let chartTypeLabel = '';

    //empty the containers
    $('#' + primaryContainer).empty();
    $('#' + secondaryContainer).empty();
    console.log('plotComparisionDataCharts');
    switch (plottingData) {
        case 'retreatbyGenotype':
            chartTypeLabel = 'Retreatment Distribution';
            renderRetreatedByGenotype(imsData.RetreatedDistribution.retreatedByGenotype, primaryContainer, 'compare');
            renderRetreatedByGenotype(phsData.RetreatedDistribution.retreatedByGenotype, secondaryContainer, 'compare');
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}

//execute render function
let executeRetreatedDistributionRender = (params, tempateObj) => {
    //the api call used is same as in the analytics/TreatmentEfficacy
    params.showIndividualPJ = true;
    tempateObj.loading.set(false);
    mlSubTabsUtil.showChartLoading();
    $('#analyticsRetreatmentByGenotypeSubCharts').empty();
    Meteor.call('getRetreatmentPatientData', params, (errors, costResults) => {
        if (errors || (costResults.length < 0)) {
            console.log('No data fetched for the sub population');
            // console.log(errors);
            mlSubTabsUtil.hideChartLoading();
            RetreatmentPatientData.originData = null;
            RetreatmentPatientData.compareData = null;
            return;
        } else {
            costResults = JSON.parse(costResults);
            mlSubTabsUtil.hideChartLoading();
            //Praveen 02/20/2017 commmon cohort
            setCohortPatientCount({
                patientCount: costResults.RetreatedDistribution.TotalRecordsN
            });
            // console.log(costResults.RetreatedDistribution.AllDATA);
            $("#retreatment-distribution-N").text(commaSeperatedNumber(costResults.RetreatedDistribution.TotalN));
            $("#retreatment-distribution-TotalN").text(commaSeperatedNumber(costResults.RetreatedDistribution.TotalRecordsN));
            var PerN = (costResults.RetreatedDistribution.TotalN / costResults.RetreatedDistribution.TotalRecordsN) * 100;
            $("#retreatment-distribution-PerN").text(parseInt(PerN) + '%');
            //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(costResults.RetreatedDistribution.TotalN));
            //render retreatment chart
            renderRetreatedByGenotype(costResults.RetreatedDistribution.retreatedByGenotype, 'analyticsRetreatmentByGenotype', 'original');
            retreatedPatientData = costResults.RetreatedDistribution;
            RetreatmentPatientData.originData = costResults;
            // console.log(costResults.RetreatedDistribution.retreatedByGenotype);
            setTimeout(function() {
                fetchSecondaryDataset(params);
            }, 500);
        }
    });

}

/**
 * @author:Nisha Regil (19 May 2017)
 * @desc:  Implementation for comparision view
 */
let fetchSecondaryDataset = (params) => {
    console.log('fetchSecondaryDataset');
    params.database = getReverseSelectedDatabase(); //get database
    Meteor.call('getRetreatmentPatientData', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            RetreatmentPatientData.compareData = null;
        } else {
            result = JSON.parse(result);
            console.log(params.database);
            RetreatmentPatientData.compareData = result;
            // console.log(RetreatmentPatientData.compareData.RetreatedDistribution.retreatedByGenotype);
            $('.togglechart').show();
        }
    });
}

// render retreatment chart by genotype
let renderRetreatedByGenotype = (data, container, reporttype) => {
    analyticsRetreatmentByGenotype = container;
    console.log('renderRetreatedByGenotype');
    console.log(data);
    var height, width, cursor;
    //Added by Praveen 04/03/2017 
    if (data.length == 0) {
        fnNoDataFoundChart('#' + analyticsRetreatmentByGenotype);
        return;
    }

    if (data.length > 0) {
        if (reporttype == 'compare') {
            height = 400;
            width = 550;
            cursor = 'pointer';
        } else {
            height = 470;
            width = 1200;
            cursor = 'pointer';
        }
        Highcharts.chart(analyticsRetreatmentByGenotype, {
            chart: {
                type: 'column',
                height: height,
                width: width
            },
            title: {
                text: null
            },
            subtitle: {
                text: 'Click the bars for more details.'
            },
            tooltip: {
                formatter: function() {
                    let html = '<div class="customC3ToolTip">';

                    html += '<div class="customC3ToolTip-Header">' +
                        '<div><b>Genotype: </b>' + this.key + '</div>' +
                        '</div><br>' +
                        '<div class="customC3ToolTip-Body">';
                    html += '<div style="text-align:left"><b>Patient Count: </b>' + commaSeperatedNumber(this.y) + '</div><br>';
                    '</div>' +
                    '</div>';

                    return html;
                }
            },
            credits: {
                enabled: false
            },
            //Added colors by Praveen on 3 April 2017
            // colors: customColorsArray(),
            xAxis: {
                type: 'category',
                title: {
                    text: 'Genotype'
                },
                labels: {
                    //rotation: -25,
                    style: {
                        fontSize: '11px',
                        fontFamily: 'Open Sans,sans-serif'
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'No of Patients'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: 'gray'
                    },
                    formatter: function() {
                        return commaSeperatedNumber(parseInt(this.total));
                    }
                }
            },
            legend: false
                /* {
                               layout: 'vertical',
                               align: 'right',
                               verticalAlign: 'top',
                               x: 0,
                               y: 0,
                               floating: true,
                               borderWidth: 1,
                               backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                               shadow: true,
                               symbolRadius: 0
                       }*/
                ,
            series: data,
            plotOptions: {
                series: {
                    cursor: cursor,
                    point: {
                        events: {
                            click: function() {
                                    if (reporttype !== 'compare') {
                                        let name = this.name;
                                        if (name) {
                                            $('#analyticsRetreatmentByGenotypeSubCharts').empty();
                                            $('#analyticsRetreatmentByGenotypeSubCharts').append(`<div class="col-lg-12" style='float: left;position: relative;text-align: center;'><h3 >Genotype : ${name}</h3></div>`); //<div id="retreatedback" class="customChartBackButton">Back</div>
                                            $('#analyticsRetreatmentByGenotypeSubCharts').append(`<div class="col-lg-4"><div id="NoOfRetreatedChart" class="boxshadow_borderline"></div></div>`);
                                            $('#analyticsRetreatmentByGenotypeSubCharts').append(`<div class="col-lg-4"><div id="retreatedMedicationChart" class="boxshadow_borderline"></div></div>`);
                                            $('#analyticsRetreatmentByGenotypeSubCharts').append(`<div class="col-lg-4"><div id="retreatedPeriodChart" class="boxshadow_borderline"></div></div>`);
                                            let noOfRetreatmentdata = _.filter(retreatedPatientData.noOfTreatmentByGenotypeChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            renderRetreatedDrillDownChart(noOfRetreatmentdata, 'NoOfRetreatedChart');
                                            let medicationdata = _.filter(retreatedPatientData.medicationByGenotypeChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            renderRetreatedDrillDownChart(medicationdata, 'retreatedMedicationChart');
                                            let perioddata = _.filter(retreatedPatientData.treatmentPeriodChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            renderRetreatedDrillDownChart(perioddata, 'retreatedPeriodChart');
                                        }
                                    } else {
                                        let name = this.name;
                                        if (name) {
                                            $('#analyticsRetreatmentByGenotypeSubChartsCompare').empty();
                                            $('#analyticsRetreatmentByGenotypeSubChartsCompare').append(`<div class="col-lg-12" style='float: left;position: relative;text-align: center;'><h3 >Genotype : ${name}</h3></div>`);
                                            $('#analyticsRetreatmentByGenotypeSubChartsCompare').append(`<div class="col-lg-6"><div id="NoOfRetreatedChartComparePrimary" class="boxshadow_borderline"></div></div>`);
                                            $('#analyticsRetreatmentByGenotypeSubChartsCompare').append(`<div class="col-lg-6"><div id="NoOfRetreatedChartCompareSecondary" class="boxshadow_borderline"></div></div>`);
                                            let noOfRetreatmentdataPrimary = _.filter(primaryData.RetreatedDistribution.noOfTreatmentByGenotypeChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            let noOfRetreatmentdataSecondary = _.filter(secondaryData.RetreatedDistribution.noOfTreatmentByGenotypeChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            if (isCustomerDataset()) {
                                                renderRetreatedDrillDownChart(noOfRetreatmentdataPrimary, 'NoOfRetreatedChartComparePrimary');
                                                renderRetreatedDrillDownChart(noOfRetreatmentdataSecondary, 'NoOfRetreatedChartCompareSecondary');
                                            } else {
                                                renderRetreatedDrillDownChart(noOfRetreatmentdataSecondary, 'NoOfRetreatedChartComparePrimary');
                                                renderRetreatedDrillDownChart(noOfRetreatmentdataPrimary, 'NoOfRetreatedChartCompareSecondary');
                                            }
                                            // renderRetreatedDrillDownChart(noOfRetreatmentdataPrimary, 'NoOfRetreatedChartComparePrimary');
                                            // renderRetreatedDrillDownChart(noOfRetreatmentdataSecondary, 'NoOfRetreatedChartCompareSecondary');
                                            $('#analyticsRetreatmentByGenotypeSubChartsCompare').append(`<div class="col-lg-6"><div id="retreatedMedicationChartComparePrimary" class="boxshadow_borderline"></div></div>`);
                                            $('#analyticsRetreatmentByGenotypeSubChartsCompare').append(`<div class="col-lg-6"><div id="retreatedMedicationChartCompareSecondary" class="boxshadow_borderline"></div></div>`);

                                            let medicationdataPrimary = _.filter(primaryData.RetreatedDistribution.medicationByGenotypeChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            let medicationdataSecondary = _.filter(secondaryData.RetreatedDistribution.medicationByGenotypeChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            if (isCustomerDataset()) {
                                                renderRetreatedDrillDownChart(medicationdataPrimary, 'retreatedMedicationChartComparePrimary');
                                                renderRetreatedDrillDownChart(medicationdataSecondary, 'retreatedMedicationChartCompareSecondary');
                                            } else {
                                                renderRetreatedDrillDownChart(medicationdataSecondary, 'retreatedMedicationChartComparePrimary');
                                                renderRetreatedDrillDownChart(medicationdataPrimary, 'retreatedMedicationChartCompareSecondary');
                                            }

                                            $('#analyticsRetreatmentByGenotypeSubChartsCompare').append(`<div class="col-lg-6"><div id="retreatedPeriodChartComparePrimary" class="boxshadow_borderline"></div></div>`);
                                            $('#analyticsRetreatmentByGenotypeSubChartsCompare').append(`<div class="col-lg-6"><div id="retreatedPeriodChartCompareSecondary" class="boxshadow_borderline"></div></div>`);

                                            let perioddataPrimary = _.filter(primaryData.RetreatedDistribution.treatmentPeriodChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            let perioddataSecondary = _.filter(secondaryData.RetreatedDistribution.treatmentPeriodChartData, (item) => {
                                                if (item.name == name) {
                                                    return item;
                                                }
                                            });
                                            if (isCustomerDataset()) {
                                                renderRetreatedDrillDownChart(perioddataPrimary, 'retreatedPeriodChartComparePrimary');
                                                renderRetreatedDrillDownChart(perioddataSecondary, 'retreatedPeriodChartCompareSecondary');
                                            } else {
                                                renderRetreatedDrillDownChart(perioddataSecondary, 'retreatedPeriodChartComparePrimary');
                                                renderRetreatedDrillDownChart(perioddataPrimary, 'retreatedPeriodChartCompareSecondary');
                                            }
                                        }
                                    }
                                } // function end 
                        } // event end 
                    }
                },
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false,
                        formatter: function() {
                            if (this.y != 0 && this.y != '') {
                                return commaSeperatedNumber(parseInt(this.y));
                            }
                        },
                        allowOverlap: true,
                        style: {
                            fontWeight: '300',
                            fontSize: '11px',
                        }


                    }
                }
            },

        });

    } else {
        $('#analyticsRetreatmentByGenotype').html(`<div style="text-align: center;padding-top: 5%;color: red;">No patient took retreatment for selected cohort criteria</div>`);
    }

}

// render retreatment drilldonw chart
let renderRetreatedDrillDownChart = (data, container) => {
    let title = '',
        extraTooltipText = '';
    if (container == 'NoOfRetreatedChart' || container == 'NoOfRetreatedChartComparePrimary' || container == 'NoOfRetreatedChartCompareSecondary') {
        //Praveen 03/15/2015 changed label from Of to of
        title = 'No of Retreatment';
    } else if (container == 'retreatedMedicationChart' || container == 'retreatedMedicationChartComparePrimary' || container == 'retreatedMedicationChartCompareSecondary') {
        title = 'Medication';
    } else if (container == 'retreatedPeriodChart' || container == 'retreatedPeriodChartComparePrimary' || container == 'retreatedPeriodChartCompareSecondary') {
        title = 'Treatment Period';
        extraTooltipText = ' Weeks';
    }
    Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: title + ' Distribution'
        },
        tooltip: {
            formatter: function() {
                let html = '<div class="customC3ToolTip">';

                html += '<div class="customC3ToolTip-Header">' +
                    '<div><b>' + title + ': </b>' + this.key + '' + extraTooltipText + '</div>' +
                    '</div><br>' +
                    '<div class="customC3ToolTip-Body">';
                html += '<div style="text-align:left"><b>Patient Count: </b>' + commaSeperatedNumber(this.y) + '</div><br>';
                '</div>' +
                '</div>';

                return html;
            }
        },
        //Added colors by Praveen on 3 April 2017
        colors: customColorsArray(),
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    // rotation : 15,
                    formatter: function() {
                        let name = this.point.name;
                        if (name) {
                            return name.toString().replace(/\+/g, '<br />');
                        }
                    }
                },
            }
        },
        series: data
    });
}