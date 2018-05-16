import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './comorbidityanalyticsml.html';
import * as modelUtils from '../modelUtils.js';

let primaryData = {},
    secondaryData = {};

Template.comorbidityanalyticsml.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.noData = new ReactiveVar(true);
    // console.log("commo");
    $(".globalexportPatient1").hide();
    $(".globalshowPatient1").hide();

    //Praveen 02/20/2017 commmon cohort
    setCohortPatientCount({ patientCount: 0 });

    executeComorbidityRender(self);

});

Template.comorbidityanalyticsml.destroyed = function() {
    $(".globalexportPatient1").show();
    $(".globalshowPatient1").show();
}

Template.comorbidityanalyticsml.rendered = function() {

};

Template.comorbidityanalyticsml.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    }
});

Template.comorbidityanalyticsml.events({
    'click .treatedApplyUniFiltersComo': function(e, template, data) {
        if (data && data == 'refresh') {
            template.loading.set(true);
            //Praveen 02/20/2017 commmon cohort
            setCohortPatientCount({ patientCount: 0 });
            //$('.searchPatientCountHeaderAnalytics').html(0);
            executeComorbidityRender(template);
        }
        //else {
        //drawComorbidityChart();
        //  }
    },
    'click .close.mlTabs_closebtn': function(e) {
        $('.analyticsPatientsPopup').hide();
    },
    'change #symptomsSelection .radioduration': function(e) {
        let chartSize = {};
        chartSize.height = 700;
        chartSize.width = 1000;
        chartSize.rotation = -25;

        if (e.target.value == "All") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart({ container: 'symptomsOverAllDistributionAnalytics', data: primaryData.symptomsData.symptomsCount, labeltext: 'Patient', chartSize: chartSize });
        } else if (e.target.value == "Genotype") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart({ container: 'symptomsOverAllDistributionAnalytics', data: primaryData.symptomsData.symptomsGenotypeCount, labeltext: 'Genotype', chartSize: chartSize });
        } else if (e.target.value == "Cirrhosis") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart({ container: 'symptomsOverAllDistributionAnalytics', data: primaryData.symptomsData.symptomsCirrhosisCount, labeltext: 'Cirrhosis', chartSize: chartSize });
        } else if (e.target.value == "Treatment") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart({ container: 'symptomsOverAllDistributionAnalytics', data: primaryData.symptomsData.symptomsTreatmentCount, labeltext: 'Treatment', chartSize: chartSize });
        } else if (e.target.value == "FibStages") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart({ container: 'symptomsOverAllDistributionAnalytics', data: primaryData.symptomsData.symptomsFibStageCount, labeltext: 'Fib-Stages', chartSize: chartSize });
        } else if (e.target.value == "Cost") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart({ container: 'symptomsOverAllDistributionAnalytics', data: primaryData.symptomsData.symptomsCost, labeltext: 'Cost', chartSize: chartSize });
        }
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        if (isCustomerDataset()) {
            plotComparisionDataCharts({ plottingData: value, primaryData: primaryData, secondaryData: secondaryData, desc: desc });
        } else {
            plotComparisionDataCharts({ plottingData: value, primaryData: secondaryData, secondaryData: primaryData, desc: desc });
        }
    }
});

let DrawSymptomsOverAllDistributionChart = ({ container, data, labeltext, chartSize }) => {
    let legend = {
        verticalAlign: 'top'
    };


    let stackLabelFlag = true,
        dataLabelFlag = false,
        yaxisTitleText = 'Patient Count';
    if (labeltext == 'Cost') {
        yaxisTitleText = 'Avg Cost';
        stackLabelFlag = false;
        dataLabelFlag = true;
    } else if (labeltext == 'Patient') {
        yaxisTitleText = 'Patient Count';
        stackLabelFlag = false;
        dataLabelFlag = true;
    }
    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: chartSize.height,
            width: chartSize.width,
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        lang: {
            thousandsSep: ','
        },

        tooltip: {

            formatter: function() {
                let html = '<div class="customC3ToolTip">';
                if (labeltext == 'Cost') {
                    html += '<div class="customC3ToolTip-Header">' +
                        '<div><b>Symptoms</b> - ' + this.key + '</div>' +
                        '</div><br>' +
                        '<div class="customC3ToolTip-Body">';
                    html += '<div style="text-align:left"><b>Avg Cost</b> - $ ' + commaSeperatedNumber(this.y) + '</div><br>';
                    html += '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + this.point.color + '"></div><b>Patient Count:</b> ' + commaSeperatedNumber(this.point.patientCount) + '</div>' +
                        '</div>' +
                        '</div>';
                } else if (labeltext == 'Patient') {

                    html += '<div class="customC3ToolTip-Header">' +
                        '<div><b>Symptoms</b> - ' + this.key + '</div>' +
                        '</div><br>' +
                        '<div class="customC3ToolTip-Body">';
                    html += '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + this.point.color + '"></div><b>Patient Count:</b> ' + commaSeperatedNumber(this.y) + '</div>' +
                        '</div>' +
                        '</div>';
                } else {
                    html += '<div class="customC3ToolTip-Header">' +
                        '<div><b>Symptoms</b> - ' + this.key + '</div>' +
                        '</div><br>' +
                        '<div class="customC3ToolTip-Body">';
                    html += '<div style="text-align:left"><b>' + labeltext + '</b> - ' + this.series.name + '</div><br>';
                    html += '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + this.point.color + '"></div><b>Patient Count:</b> ' + commaSeperatedNumber(this.y) + '</div>' +
                        '</div>' +
                        '</div>';
                }

                return html;
            }

        },
        // colors: ['#fc4f30','#30a2da'],
        credits: {
            enabled: false
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Symptoms'
            },
            labels: {
                rotation: chartSize.rotation,
                style: {
                    fontSize: '11px',
                    fontFamily: 'Open Sans,sans-serif'
                }
            }
        },
        yAxis: {
            title: {
                text: yaxisTitleText
            },
            stackLabels: {
                enabled: stackLabelFlag,
                style: {
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'gray'
                },
                formatter: function() {
                    return commaSeperatedNumber(parseInt(this.total));
                }
            }
        },
        legend: legend,
        series: data,
        plotOptions: {

            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: dataLabelFlag,
                    formatter: function() {
                        if (labeltext == 'Cost') {
                            if (this.y != 0 && this.y != '') {
                                return '$ ' + commaSeperatedNumber(parseInt(this.y));
                            }
                        } else if (labeltext == 'Patient') {
                            if (this.point.patientPercentage) {
                                return this.point.patientPercentage + ' %';
                                //commaSeperatedNumber(parseInt(this.point.patientPercentage));
                            }
                        } else {
                            return '';
                        }
                    },
                    verticalAlign: 'top',
                    shadow: false,
                    style: {
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: 'gray'
                    }


                }
            }
        },

    });
}

let DrawComorbidityChart = ({
    container,
    data,
    chartSize
}) => {
    // console.log("** PHARMA COMORBIDITIES CHART Server Data**");

    // console.log(data);
    // console.log("** PHARMA COMORBIDITIES CHART**");
    // console.log(primaryData.comorbidityData);

    let filtereddrug = [];
    let medicine = '';
    if (Pinscriptive.Filters) {
        medicine = Pinscriptive.Filters.medication ? Pinscriptive.Filters.medication.replace(/'/g, '').toString() : 'ALL';
    }


    //$('.searchPatientCountHeaderAnalytics').html(data.TotalN);

    let totalMax = _.max(data.comorbidityChartData, function(item) {
        return item.totalPatients;
    }).totalPatients;
    totalMax = totalMax + 10;

    if (data.comorbidityChartData.length > 0) {
        chart = Highcharts.chart(container, {
            chart: {
                type: 'bar',
                height: chartSize.height,
                width: chartSize.width,
                events: {
                    drilldown: function(e) {
                        this.setTitle({
                            text: e.point.name
                        }, {
                            text: ''
                        });
                        this.xAxis[0].setTitle({
                            text: "ICD9 Codes"
                        });
                    },
                    drillup: function(e) {
                        DrawComorbidityChart({
                            container,
                            data,
                            chartSize
                        });
                        // this.setTitle({
                        //     text: ''
                        // }, {
                        //     text: ''
                        // });
                        // this.xAxis[0].setTitle({
                        //     text: "Comorbidity"
                        // });
                    }
                }
            },
            // Nisha 02/24/2017 Comment this out to get the < arrow similar to other charts
            // lang: {
            //     drillUpText: 'Back to Comorbidity'
            // },
            title: {
                text: null
            },
            subtitle: {
                text: 'Click the bar to view ICD9 codes distribution.'
            },
            colors: ['#fc4f30', '#30a2da'],
            credits: {
                enabled: false
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Comorbidity'
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
                title: {
                    text: 'Patients counts'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: 'gray'
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -10,
                y: 40,
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                //borderColor: '#CCC',
                //borderWidth: 1,
                shadow: false,

                "word-break": "break-all"
            },
            series: data.comorbidityChartData,
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false
                    }
                    // dataLabels: {
                    //     enabled: true,
                    //     color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                    // }
                }
            },
            drilldown: {
                drillUpButton: {
                    relativeTo: 'spacingBox',
                    position: {
                        y: 0,
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
                        plotShadow: true,
                        boxShadow: {
                            color: 'grey',
                            width: 10,
                            offsetX: 1,
                            offsetY: 1
                        }
                    }

                },
                series: data.comorbidityDrillDownData
            },
            tooltip: {

                formatter: function() {
                    let html = '<div class="customC3ToolTip">';
                    if (this.point.CodeDesc) {
                        html += '<div class="customC3ToolTip-Header">' +
                            '<div><b>ICD9 Codes</b> - ' + this.key + '</div>' +
                            '</div><br>' +
                            '<div class="customC3ToolTip-Body">';
                        html += '<div style="text-align:left"><b>Definition</b> - ' + this.point.CodeDesc + '</div><br>';
                    } else {

                        html += '<div class="customC3ToolTip-Header">' +
                            '<div><b>Comorbidity</b> - ' + this.key + '</div>' +
                            '</div><br>' +
                            '<div class="customC3ToolTip-Body">';
                    }

                    html += '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + this.point.color + '"></div>Patient Count: ' + commaSeperatedNumber(this.y) + '</div>' +
                        '</div>' +
                        '</div>';
                    return html;
                }

            }
        }, function(chart) { sortData(chart); });
        // chart.tooltip.label.attr({zIndex: 9999});
    } else {
        $(container).html('<div style="text-align: center;padding-top: 5%;height:300;width:600;">No Data Found</div>');
    }
}
let sortData = (chartSource) => {
    let series = chartSource.series;
    let axis = chartSource.xAxis[0];
    let categories = [];

    if ($.isArray(series)) {
        let ser = $.grep(series, function(ser, seriesIndex) {
            return ser.visible;
        })[0];
        $.each(ser.data, function(dataIndex, datum) {
            //   console.log(datum.name + ": " + datum.stackTotal);
            let obj = {
                //   category: datum.category,
                name: datum.name,
                index: dataIndex,
                stackTotal: datum.stackTotal,
                // drilldown:datum.drilldown
            }
            categories.push(obj);
        });
    }

    categories.sort(function(a, b) {
        let aName = a.name.toString().toLowerCase();
        let bName = b.name.toString().toLowerCase();
        let aTotal = a.stackTotal;
        let bTotal = b.stackTotal;
        if (aTotal === bTotal) {
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        } else {
            return ((aTotal > bTotal) ? -1 : ((aTotal < bTotal) ? 1 : 0));
        }
    });

    // let mappedIndex = $.map(categories, function(category, index) {
    //     return category.name;
    // });

    // categories = $.map(categories, function(category, index) {
    //     return category.name;
    // });

    // console.log(categories);
    // console.log(mappedIndex);
    // axis.setCategories(categories);

    $.each(series, function(seriesIndex, ser) {
        let data = $.map(categories, function(rec, origIndex) {
            let json = {};
            json.y = ser.data[rec.index].y;
            json.name = rec.name;
            json.drilldown = ser.data[rec.index].drilldown;
            return json;
        });
        ser.setData(data);
    });
}



let executeComorbidityRender = (templateObj) => {

        let params = getCurrentPopulationFilters();
        if(!params.showPreactingAntivirals) {
            params.showPreactingAntivirals = true;
        }
        let comorparams = params;
        params.medications = null;
        Meteor.call('getComorbidity', params, function(error1, results) {
            if (error1) {
                templateObj.loading.set(false);
                templateObj.noData.set(true);
            } else {
                //params.medication = null;

                Meteor.call('getAnalyticsExtraHepaticData', comorparams, (err, sympResults) => {
                    if (!err) {
                        primaryData.symptomsData = JSON.parse(LZString.decompress(sympResults));
                        //console.log(primaryData.symptomsData);
                        primaryData.comorbidityData = JSON.parse(LZString.decompress(results));
                        let chartSize = {};
                        chartSize.height = 700;
                        chartSize.width = 1000;
                        setTimeout(function() {
                            $('#pharma-medicationComo').selectize();
                            DrawComorbidityChart({ container: 'divComorbidityChart', data: primaryData.comorbidityData, chartSize: chartSize });
                            DrawSymptomsOverAllDistributionChart({ container: 'symptomsOverAllDistributionAnalytics', data: primaryData.symptomsData.symptomsGenotypeCount, labeltext: 'Genotype', chartSize: chartSize });

                        }, 200);
                        templateObj.loading.set(false);
                        templateObj.noData.set(false);
                        //Praveen 02/20/2017 commmon cohort
                        setCohortPatientCount({ patientCount: primaryData.symptomsData.symptomsUniquePatientCount });
                        // Jayesh 26th May 2017 for comorbidity chart with unique patients
                        setTimeout(function() {
                            $('#comorbidity-distribution-SVR-N1').text(commaSeperatedNumber(primaryData.comorbidityData.uniquePatientWithSVR12Count));
                            $('#comorbidity-distribution-SVR-N2').text(commaSeperatedNumber(primaryData.comorbidityData.uniquePatientWithSVR12Count));
                            $('#comorbidity-distribution-SVR-PerN').text(primaryData.comorbidityData.uniquePatientWithSVR12CountPer + '%');
                            $('#comorbidity-distribution-Medication-N').text(commaSeperatedNumber(primaryData.comorbidityData.uniquePatientWithMedicationCount));
                            $('#comorbidity-distribution-N').text(commaSeperatedNumber(primaryData.comorbidityData.uniquePatientWithComorbidityCount));
                            $('#comorbidity-distribution-PerN').text(primaryData.comorbidityData.uniquePatientWithComorbidityCountPer + '%');
                            $('#Symptoms-distribution-N').text(commaSeperatedNumber(primaryData.symptomsData.symptomsUniquePatientCount));
                        }, 200);
                        executeComparativeComorbidityRender(comorparams);
                    }
                });

            }
        });
    }
    // Added By Jayesh 18th May 2017 for fetching data of second dataset to compare data.
let executeComparativeComorbidityRender = (params) => {
    params.database = getReverseSelectedDatabase();
    let comorparams = params;
    params.medications = null;
    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }
    Meteor.call('getComorbidity', params, function(error1, results) {
        if (error1) {
            console.log(error1);
            secondaryData.comorbidityData = [];
            secondaryData.symptomsData = [];
        } else {
            Meteor.call('getAnalyticsExtraHepaticData', comorparams, (err, sympResults) => {
                if (err) {
                    console.log(err);
                    secondaryData.comorbidityData = [];
                    secondaryData.symptomsData = [];
                } else {
                    secondaryData.comorbidityData = JSON.parse(LZString.decompress(results));
                    secondaryData.symptomsData = JSON.parse(LZString.decompress(sympResults));
                    $('.togglechart').show();
                }
            });

        }
    });
}

//function to plot comparision charts
let plotComparisionDataCharts = ({ plottingData, primaryData, secondaryData, desc }) => {

    modelUtils.prepareDomForComparisionCharts(plottingData);

    let phsContainer = 'primaryDataViewSection',
        imsContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    let chartSize = {};
    chartSize.height = 500;
    chartSize.width = 530;
    chartSize.rotation = -90;

    //empty the containers
    $('#' + imsContainer).empty();
    $('#' + phsContainer).empty();
    console.log(primaryData.symptomsData);
    switch (plottingData) {

        case 'comorbidityDistribution':
            chartTypeLabel = 'Comorbidity Distribution';
            DrawComorbidityChart({ container: phsContainer, data: primaryData.comorbidityData, chartSize: chartSize });
            DrawComorbidityChart({ container: imsContainer, data: secondaryData.comorbidityData, chartSize: chartSize });
            break;
        case 'symptomsDistribution':
            chartTypeLabel = 'Symptoms Distribution for ExtraHepatic Hepatitis C';
            DrawSymptomsOverAllDistributionChart({ container: phsContainer, data: primaryData.symptomsData.symptomsGenotypeCount, labeltext: 'Genotype', chartSize: chartSize });
            DrawSymptomsOverAllDistributionChart({ container: imsContainer, data: secondaryData.symptomsData.symptomsGenotypeCount, labeltext: 'Genotype', chartSize: chartSize });

            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}