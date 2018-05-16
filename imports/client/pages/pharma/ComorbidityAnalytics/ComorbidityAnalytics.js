import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './ComorbidityAnalytics.html';
import * as pharmaLib from '../pharmaLib.js';

let pharmaComorbidityChart = [];
let pharmaData = [];
let dummyMedication = [];
let symptomsData = {};
// Nisha 02/20/2017 Change in functions for common cohor
Template.ComorbidityAnalytics.onCreated(function() {

    //let self = this;
    pharmaLib.showChartLoading();
    // let params = {};
    // // First Check weather session filter are set or not then apply filter accordingly
    // if (pharmaLib.isSessionFilterSet()) {
    //     params = pharmaLib.getFormattedParamsSession();
    // } else if (Pinscriptive.Filters) {
    //     params = pharmaLib.getCurrentPopulationFilters();
    // } else {
    //     params = pharmaLib.getFormattedParamsSession();
    // }

    //set pharma header
    // pharmaLib.setPharmaHeader();
    //fetch data from server
    Template.ComorbidityAnalytics.fetchAndRenderData();
});

Template.ComorbidityAnalytics.rendered = function() {
    //hide the show patients list icon
    $('.globalshowPatientPharma').hide();
    highLightTab('Pharma');
    //set search filters
    // pharmaLib.setAdvancedSearchFilters();
    // //set pharma header
    // pharmaLib.setPharmaHeader();
}

Template.ComorbidityAnalytics.events({
    'change #symptomsSelection .radioduration': function(e) {

        if (e.target.value == "All") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart(symptomsData.symptomsCount, 'Patient');
        } else if (e.target.value == "Genotype") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart(symptomsData.symptomsGenotypeCount, 'Genotype');
        } else if (e.target.value == "Cirrhosis") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart(symptomsData.symptomsCirrhosisCount, 'Cirrhosis');
        } else if (e.target.value == "Treatment") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart(symptomsData.symptomsTreatmentCount, 'Treatment');
        } else if (e.target.value == "FibStages") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart(symptomsData.symptomsFibStageCount, 'Fib-Stages');
        } else if (e.target.value == "Cost") {
            //render symptoms chart
            DrawSymptomsOverAllDistributionChart(symptomsData.symptomsCost, 'Cost');
        }
    },

    'click .js-comparativeEngine': function(e) {
        renderComaparativeOptionsView();
    }

});

let DrawComorbidityChart = ({ data }) => {
    // console.log("** PHARMA COMORBIDITIES CHART Server Data**");

    // console.log(data);
    // console.log("** PHARMA COMORBIDITIES CHART**");
    // console.log(pharmaComorbidityChart);

    let filtereddrug = [];
    let medicine = '';
    if (Pinscriptive.Filters) {
        medicine = Pinscriptive.Filters.medication ? Pinscriptive.Filters.medication.replace(/'/g, '').toString() : 'ALL';
    }


    // OLD CODE
    // $('.searchPatientCountHeaderPharma').html(data.TotalN);
    //Added :14-FEB-2017 Arvind,sigle method to set patient count on cohort menu
    setCohortPatientCount({ patientCount: data.TotalN });

    //// Used Count By Instead of Group by on server side
    renderTableGenotypeCount({ genotypeTableData: data.genotypeTableData });
    // console.log(pharmaDataOtherMedicines);

    //set header data
    pharmaLib.setPharmaHeaderTabData();

    // //  console.log(preparedData);
    let totalMax = _.max(data.comorbidityChartData, function(item) { return item.totalPatients; }).totalPatients;
    totalMax = totalMax + 10;
    //let container = "#pharma_comorbiditychart";
    //d3.select(container).selectAll("*").remove();
    // console.log();
    //  console.log(preparedData);
    if (data.comorbidityChartData.length > 0) {
        chart = Highcharts.chart(pharma_comorbiditychart, {
            chart: {
                type: 'bar',
                height: 600,
                width: 1000,
                events: {
                    drilldown: function(e) {
                        chart.setTitle({ text: e.point.name }, { text: '' });
                        chart.xAxis[0].setTitle({ text: "ICD9 Codes" });
                    },
                    drillup: function(e) {
                        chart.setTitle({ text: '' }, { text: '' });
                        chart.xAxis[0].setTitle({ text: "Comorbidity" });
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
                text: null
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
                    style: { fontSize: '11px', fontFamily: 'Open Sans,sans-serif', color: 'gray', "text-decoration": "none" }
                }
            },
            yAxis: {
                title: {
                    text: 'Patient count'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: 'gray'
                    },
                    formatter: function() {
                        return commaSeperatedNumber(this.total);
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


let DrawSymptomsOverAllDistributionChart = (data, labeltext) => {
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
    Highcharts.chart(symptomsOverAllDistribution, {
        chart: {
            type: 'column',
            height: 700,
            width: 1200,
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
                rotation: -25,
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
        legend: {
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
        },
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

let renderTableGenotypeCount = ({ genotypeTableData }) => {

    $('.comordityDataGenotypeCount').html('');
    let html = '';
    if (genotypeTableData) {
        // let grnoGrpData = _.groupBy(data, 'GENOTYPE');
        // console.log(grnoGrpData);
        html = `<div class="common-efd-row MainTitle">
                                <div class="common-efd-cell1">Genotype</div>
                                <div class="common-efd-cell1">Patients Count</div>
                            </div>`;
        for (let key in genotypeTableData) {
            let label = key == void 0 ? 'Not Specified' : key;
            let count = genotypeTableData[key];
            html += `<div class="common-efd-row">
                                <div class="common-efd-cell1">${label}</div>
                                <div class="common-efd-cell1">${count}</div>
                            </div>`;
        }
    } else {
        html = 'No Data Available';
    }


    $('.comordityDataGenotypeCount').html(html);
}

//template function to get data
Template.ComorbidityAnalytics.fetchAndRenderData = () => {
    let params = {};
    //check for advanced filters cohort criteria
    if (Pinscriptive.Filters) {
        //Praveen 02/20/2017 changed function to reference from common.js pharmaLib.getCurrentPopulationFilters()
        params = getCurrentPopulationFilters();
    }

    pharmaLib.showChartLoading();

    Meteor.call('getPharmaComorbidity', params, function(error2, results) {
        if (error2) {
            pharmaLib.hideChartLoading();
        } else {
            //pharmaComorbidityChart = results.pharmaComorbidity;
            pharmaLib.setAdvancedSearchFilters();
            pharmaLib.setPharmaHeader();
            pharmaLib.hideChartLoading();
            //console.log("getPharmaComorbidity");
            let stringifyResult = LZString.decompress(results);
            let finalUnCompressedResult = JSON.parse(stringifyResult);
            //console.log("result:"+results.length);
            //console.log("Compressed stringifyResult:"+stringifyResult.length);
            //console.log(results);
            //render chart
            DrawComorbidityChart({ data: finalUnCompressedResult });
        }
        setTimeout(function() {
            $('.symptomsChartsLoading').show();
            $('.symptomsChartWrapper').hide();
        }, 1000);

        params.medication = null;
        Meteor.call('getExtraHepaticData', params, (err, sympResults) => {
            if (!err) {
                //console.log("getExtraHepaticData");
                let stringifyResult = LZString.decompress(sympResults)
                    // console.log("result:"+sympResults.length);
                    //console.log("Compressed stringifyResult:"+stringifyResult.length);
                symptomsData = JSON.parse(stringifyResult);
                //console.log(symptomsData);

                DrawSymptomsOverAllDistributionChart(symptomsData.symptomsGenotypeCount, 'Genotype');

                setTimeout(function() {
                    $('.symptomsChartsLoading').hide();
                    $('.symptomsChartWrapper').show();
                }, 1000);
            }
        });

    });

}

// Render for comparativeengine
let renderComaparativeOptionsView = () => {
    var comparativeEngine = new ComparativeEngine({
        tabName: "ComporbidityAnalyticsTab-Pharma"
    });

    comparativeEngine.renderCompareOptiosView();
}