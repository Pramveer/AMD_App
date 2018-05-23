import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './MedicationCost.html';
import * as pharmaLib from '../pharmaLib.js';

//initialize variables for data
let pharmaData = [];
let dummyMedication = [];
let ICERData = [];
let medicationCostData = {};
let relapsedPatientData = {};
//  Nisha 02/23/2017 for liver transplant rendring
let CostType = null;
let GenoType = null;
let CostDrillDown = null;
// let filteredData = null;

let icerMedsComboData = new ReactiveVar([]);
// Nisha 02/20/2017 Change in functions for common cohor
Template.MedicationCost.onCreated(function() {
    //let self = this;
    pharmaLib.showChartLoading();
    // let params = {};
    // // First Check weather session filter are set or not then apply filter accordingly
    // if (pharmaLib.isSessionFilterSet()) {
    //     params = pharmaLib.getFormattedParamsSession();
    // } else if (AmdApp.Filters) {
    //     params = pharmaLib.getCurrentPopulationFilters();
    // } else {
    //     params = pharmaLib.getFormattedParamsSession();
    // }
    //fetch data from server
    Template.MedicationCost.fetchAndRenderData();
});

Template.MedicationCost.rendered = () => {
    //hide the show patients list icon
    $('.globalshowPatientPharma').hide();
    highLightTab('Pharma');
    // pharmaLib.setAdvancedSearchFilters();
    // //initliza selectize
    // //$('#pharma-medicationICER').selectize();
    // //set pharma header
    // pharmaLib.setPharmaHeader();
}

Template.MedicationCost.events({
    'click #treatedselectGenotypeCost .mutliSelect input[type="checkbox"]': (e, template) => {
        pharmaLib.handleMultiGenoCombo(e.target);
    },
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
    'change #treamentAvgCostSelection .radioduration': function(e) {
        // pharmaLib.showChartLoading();
        if (e.target.value == "Average") {
            //render cost chart
            rendercostchart(medicationCostData.avgCostChartData, medicationCostData.treatment_categories, 'Average Cost');
        } else if (e.target.value == "Median") {
            //render cost chart
            rendercostchart(medicationCostData.medianCostChartData, medicationCostData.treatment_categories, 'Median Cost');
        } else if (e.target.value == "Min") {
            //render cost chart
            rendercostchart(medicationCostData.minCostChartData, medicationCostData.treatment_categories, 'Minimum Cost');
        } else if (e.target.value == "Max") {
            //render cost chart
            rendercostchart(medicationCostData.maxCostChartData, medicationCostData.treatment_categories, 'Maximum Cost');
        } else if (e.target.value == "StdDev") {
            //render cost chart
            //Praveen 03/01/2017 Fixed issue for sorting treatment numbers
            rendercostchart(medicationCostData.stdDevCostChartData, medicationCostData.treatment_categories, 'Standard Deviation Cost');
        }
        // pharmaLib.hideChartLoading();
    },
    'change #treamentCumulativeCostSelection .radioduration': function(e) {
        // pharmaLib.showChartLoading();
        if (e.target.value == "Average") {
            //render cumulative cost treatment chart
            renderCumulativeCostTreatmentChartHigh(medicationCostData.AvgCumulativeChartData, 'Average Cumulative Cost');
        } else if (e.target.value == "Median") {
            //render cumulative cost treatment chart
            renderCumulativeCostTreatmentChartHigh(medicationCostData.MedianCumulativeChartData, 'Median Cumulative Cost');
        } else if (e.target.value == "Min") {
            //render cumulative cost treatment chart
            renderCumulativeCostTreatmentChartHigh(medicationCostData.MinCumulativeChartData, 'Minimum Cumulative Cost');
        } else if (e.target.value == "Max") {
            //render cumulative cost treatment chart
            renderCumulativeCostTreatmentChartHigh(medicationCostData.MaxCumulativeChartData, 'Maximum Cumulative Cost');
        } else if (e.target.value == "StdDev") {
            //render cumulative cost treatment chart
            renderCumulativeCostTreatmentChartHigh(medicationCostData.StdDevCumulativeChartData, 'Standard Deviation Cumulative Cost');
        }
        // pharmaLib.hideChartLoading();
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
            renderStackedChartRemmission('pharmaTreatmentRemmitted', chartDataRemitted.treatment_period.data, chartDataRemitted.treatment_period.keys, 'Treatment Period (in weeks)');
        }

    },
    'click #livertransplantback': function(e) {
        $('#divCostTable').hide();
        $('#pharmaLiverTransplantByGenotype').show();
    },
    'click .js-comparativeEngine': function(e) {
        renderComaparativeOptionsView();
    },
    'click .pharma_closebtn': function(event, template) {
        $('.pharmaPatientsPopup').hide();
    },
});

Template.MedicationCost.icerDrugComboChange = () => {
    $('.pharmaCost-CompareDrugButton').show();
}

//navigation search and close
let openNav = () => {
    document.getElementById("viral_load_over_time_opition").style.width = "620px";
    //document.getElementById("viral_load_over_time_opition").style.top = "100px";
}

let closeNav = () => {
    document.getElementById("viral_load_over_time_opition").style.width = "0";
}


let renderICERChart = (chartData) => {
    // ICER = (Cn - Co)/(QALYn - QALYo)
    //  QALY = Q*(1-e(-0.03*Remaining Years))/0.03
    // let chartMedication = [];
    // $("#divMedicineList").find("input:checked").each(function(i, ob) {
    //     chartMedication.push($(ob).val());
    // });
    // let Co = 0;
    // let Cn = 0;
    // let QALYn = 0;
    // let QALYo = 0;
    // let finalICER = 0;
    // let finalQALY = 0;
    // let jsonObj = {},
    //     filteredcount = [],
    //     dataweekcount = [];
    // let xaxis = [];
    // let QALY = [];
    // let ICER = [];
    // let patientCount = 0;
    // // xaxis.push('x');
    // // ICER.push('ICER');
    // // QALY.push('QALY');
    // filteredcount = chartData.filter(function(a) {
    //     return (a.MEDICATION.toLowerCase() == $("#pharma-medicationICER").val().toLowerCase());
    // });

    // Co = filteredcount[0].AverageCost;
    // QALYo = (filteredcount[0].SuccessProbability / 100) * (1 - Math.exp(-0.03 * 20)) / 0.03;

    // // console.log(filteredcount);
    // // console.log(QALYo);
    // let jsonObjICER = {};

    // let jsonObjQALY = {};
    // let jsonObjQALYxy = {};
    // let seriesy = [];
    // let seriesyQALY = [];
    // let finalTableData = [];
    // let seriesxy = [];
    // //let colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'];
    // let colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7','#9ec8f2', '#2aaaf7', '#4ea6ca', '#c0983b', '#cc9529', '#e08a08', '#dc7d02', '#bf6807', '#4b2c48', '#301f58', '#251a5e'];
    // if (chartMedication.length > 0) {
    //     for (i = 0; i < chartMedication.length; i++) {
    //         Cn = 0;
    //         QALYn = 0;
    //         Cncount = 0;
    //         QALYncount = 0;
    //         finalICER = 0;
    //         textn = '';
    //         filteredcount = chartData.filter(function(a) {
    //             return (a.MEDICATION.toLowerCase() == chartMedication[i].toLowerCase());
    //         });

    //         Cn = filteredcount[0].AverageCost;
    //         QALYn = (filteredcount[0].SuccessProbability / 100) * (1 - Math.exp(-0.03 * 20)) / 0.03;
    //         patientCount = filteredcount[0].count;

    //         Cncount = (Cn - Co);
    //         QALYncount = (QALYn - QALYo) == 0 ? 0 : (QALYn - QALYo);
    //         finalICER = QALYncount == 0 ? 0 : (Cn - Co) / QALYncount ;
    //         if (Cncount < 0) {
    //             textn = 'Saving';
    //             Cncount = Cncount * (-1);
    //         } else {
    //             textn = 'Expense';
    //             Cncount = Cncount;
    //         }

    //         xaxis.push(chartMedication[i]);
    //         if (isNaN(finalICER))
    //             finalICER = 0;
    //         ICER.push({ y: finalICER, color: colors[i], patientcount: Cncount, TextCount: textn });
    //         QALY.push({ y: QALYncount, color: colors[i] });

    //         finalTableData.push({
    //             abbr: getDrugAbbr(chartMedication[i]),
    //             name: chartMedication[i],
    //             y: finalICER,
    //             x: QALYncount,
    //             color: colors[i],
    //             count: patientCount
    //         });
    //     }
    // }

    // jsonObjICER.name = "ICER";
    // jsonObjICER.data = ICER;
    // seriesy.push(jsonObjICER);

    // jsonObjQALY.name = "QALY";
    // jsonObjQALY.data = QALY;
    // seriesyQALY.push(jsonObjQALY);

    // jsonObjQALYxy.data = finalTableData;
    // seriesxy.push(jsonObjQALYxy);
    // var minICER = 0,
    //     maxICER = 0,
    //     minQALY = 0,
    //     maxQALY = 0;
    // console.log(finalTableData);
    // minICER = _.min(_.pluck(finalTableData, 'y')) - 100;
    // maxICER = _.max(_.pluck(finalTableData, 'y')) + 100;

    // minQALY = _.min(_.pluck(finalTableData, 'x')) - 100;
    // maxQALY = _.max(_.pluck(finalTableData, 'x')) + 100;

    // // console.log(minICER);
    // // console.log(maxICER);

    // // Y axis min/max adjustment
    // let whichisMax = Math.abs(maxICER) > Math.abs(minICER) ? 'max' : 'min';
    // if(whichisMax == 'min') {
    //     maxICER = 0 - minICER;
    // }
    // else {
    //     minICER = 0 - maxICER;
    // }

    // let stepPixel = 250;
    // maxICER = maxICER > 0 ? maxICER + stepPixel : maxICER - stepPixel;
    // minICER = minICER > 0 ? minICER + stepPixel : minICER - stepPixel;

    // // console.log('********After Step Pixel*******');
    // // console.log(minICER);
    // // console.log(maxICER);


    // console.log('************Qaly V/S ICER Chart Data*************');
    // console.log(seriesxy);

    // //render the charts
    // renderIcerChart(xaxis, seriesy);
    // renderQalyChart(xaxis, seriesyQALY);
    // renderIcerVsQalyChart({
    //     chartData: seriesxy,
    //     yMin: minICER,
    //     yMax: maxICER
    // });

    let preparedChartData = getCostSectionChartsData(chartData);
    // console.log('**********Prepared Data**************');
    // console.log(preparedChartData);
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

Template.MedicationCost.helpers({

    'getGenotypeList': () => PatientsGenotypeList,

    'getMedication': () => {
        let dummyMedication = [];

        let drugArray = ["PegIntron", "Pegasys", "Victrelis"]
        for (let i = 0; i < AllDrugs.length; i++) {
            let drugName = AllDrugs[i].name;
            if (drugArray.indexOf(drugName) == -1)
                dummyMedication.push(AllDrugs[i].name);
        }
        return dummyMedication;
    },
    'getICERMedication': () => {
        // let dummyICERMedication = [];
        // for (let i = 0; i < AllICERDrugs.length; i++) {
        //     dummyICERMedication.push(AllICERDrugs[i].MEDICATION);
        // }
        // return dummyICERMedication;
        let allMeds = icerMedsComboData.get();
        if (allMeds.length) {
            return allMeds;
        }
    }

});

// let getDrugFilteredData = (medicine) => {
//     let genoTypes = _.compact(pharmaLib.getGenotypeFromFiltters('treatedselectGenotypeCost'));
//     let filteredpharmaData = pharmaData;
//
//     if (medicine != 'all' && medicine != null && medicine != void 0 && medicine != "") {
//         filteredpharmaData = filteredpharmaData.filter(a => a.MEDICATION.toLowerCase().indexOf(medicine.toLowerCase()) > -1);
//     }
//
//     if ($('.treatedTreatmentCost').val() != 'all') {
//         filteredpharmaData = filteredpharmaData.filter(function(a) {
//             return a.TREATMENT == $('.treatedTreatmentCost').val();
//         });
//     }
//     if ($('.treatedCirrhosisCost').val() != 'all') {
//         filteredpharmaData = filteredpharmaData.filter(function(a) {
//             return a.CIRRHOSIS == $('.treatedCirrhosisCost').val();
//         });
//     }
//     // console.log(genoTypes);
//     if (genoTypes.length && genoTypes[0].toLowerCase() != 'all') {
//         filteredpharmaData = _.filter(filteredpharmaData, function(e) { for (var i = 0; i < genoTypes.length; i++) { if (e.GENOTYPE == genoTypes[i]) { return e; } } })
//     }
//
//     return filteredpharmaData;
// }


let rendercostchart = (data, categories, costtext) => {
    //Praveen 03/01/2017 removed console
    //console.log(data);
    (function(H) {
        var each = H.each;
        H.wrap(H.seriesTypes.column.prototype, 'drawPoints', function(proceed) {
            var series = this;
            if (series.data.length > 0) {
                var width = series.barW > series.options.maxPointWidth ? series.options.maxPointWidth : series.barW;
                each(this.data, function(point) {
                    point.shapeArgs.x += (point.shapeArgs.width - width) / 2;
                    point.shapeArgs.width = width;
                });
            }
            proceed.call(this);
        })


    })(Highcharts);

    //console.log(data,categories);

    Highcharts.chart('pharmaTreatmentAvgCost', {
        chart: {
            type: 'bar',
            height: 600,
            width: 1200
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        colors: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', "#929FA8", "#97E0E3", "#676767", "#FBDE97", '#17becf'],
        xAxis: {
            categories: categories,
            title: {
                text: null
            },
            labels: {
                overflow: 'justify',
                formatter: function() {
                    let label = this.axis.defaultLabelFormatter.call(this);
                    if (label == 1)
                        return label + ' Treatment';
                    else {
                        return label + ' Treatments';
                    }
                },
                style: {
                    fontWeight: '300',
                    fontSize: '11px',
                }
            }
        },
        credits: {
            enabled: false
        },
        yAxis: {
            min: 0,
            title: {
                text: costtext,
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<div class="">',
            pointFormat: `<div class="">
                                <div>{point.series.name}</div>
                                </div>
                                <div class="">
                                <div>` + costtext + `: $ {point.y:,.0f}</div>
                                </div>
                                <div class="">
                                <div>Patient Count: {point.patientCount:,.0f}</div>
                                </div>`,
            footerFormat: '</div>',
            followPointer: false,
            hideDelay: 30
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        //console.log(this.y,this.x);
                        if (this.y != 0 && this.y != '') {
                            return '$ ' + commaSeperatedNumber(parseInt(this.y)); //return '$ {point.y:,.0f}';
                        }
                    },
                    // format: '$ {point.y:,.0f}',
                    allowOverlap: true,
                    style: {
                        fontWeight: '300',
                        fontSize: '11px',
                    }
                }
            },
            column: {
                dataLabels: {
                    enabled: true
                }
            },
            series: {
                pointWidth: 13,
                groupPadding: 0.1,
                maxPointWidth: 40
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -20,
            y: 0,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true,
            fontWeight: '300',
            symbolRadius: 0
        },
        series: data
    });
}

let loadingDropdown = () => {
    //events for multiselect combo
    $(".dropdown dt a").on('click', function() {
        $(".dropdown dd ul").slideToggle('fast');
    });

    $(".dropdown dd ul li a").on('click', function() {
        $(".dropdown dd ul").hide();
    });

    $(document).bind('click', function(e) {
        var $clicked = $(e.target);
        if (!$clicked.parents().hasClass("dropdown"))
            $(".dropdown dd ul").hide();
    });

}

let setGenotypeComboForCurrentPatient = () => {
    //selecting genotype of current patient
    let genotypes = Session.get('pharmaGenotype');
    if (genotypes && genotypes.length > 0) {
        setTimeout(() => {

            if ($('.isCheckedallCost').prop('checked')) {
                $('#treatedselectGenotypeCost .mutliSelect li input[value = "all"]').trigger('click');
            }
            $('.multiSel').empty();
            $('.isCheckedCost').prop('checked', false);
            $('.isCheckedCost').each(function(d) {
                if (genotypes.indexOf($(this).val()) > -1) {
                    $(this).trigger('click');
                }
            });
        }, 200);
    } else {

        if (!$('.isCheckedallCost').prop('checked'))
            $('#treatedselectGenotypeCost .mutliSelect li input[value = "all"]').trigger('click');

    }
}

let renderCumulativeCostTreatmentChartHigh = (data, costtext) => {
        // console.log(data);
        let chartdata = [];
        let sum = 0;

        for (let i = 0; i < data.length; i++) {
            let d = {};
            let patientCount = data[i]['total']
            sum += parseFloat(data[i]['AVG_CUM_COST']);
            d = {
                'x': i + 1,
                'y': Math.round(sum, 2),
                'patientCount': patientCount
            };
            chartdata.push(d);
        }

        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });
        // console.log(chartdata);
        Highcharts.chart('pharmaTreatmentCumulativeCost', {
            chart: {
                height: 400,
                width: 1200
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },
            xAxis: {
                type: '',
                title: {
                    text: 'Number Of Treatments'
                },
                tickInterval: 1
            },
            yAxis: {
                title: {
                    text: costtext
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                formatter: function() {
                        return `<div class="">
                                <div class=""><div>Treatment Number: ` + this.x + `</div> </div><br>
                                <div class=""><div>` + costtext + `: $ ` + commaSeperatedNumber(this.y) + ` </div></div><br>
                                <div class=""><div>Patient Count: ` + commaSeperatedNumber(this.point.patientCount) + `</div></div><br>
                            </div>`;
                    }
                    // useHTML: true,
                    // headerFormat: '<div class="">',
                    // pointFormat: `<div class="">
                    //                   <div>Treatment Number: {this.point.x}</div>
                    //                   </div>
                    //                   <div class="">
                    //                   <div> Cumulative Cost: $ {this.point.y}</div>
                    //                   </div>
                    //                   <div class="">
                    //                   <div> Patient Count: {this.point.patientCount}</div>
                    //                   </div>`,
                    // footerFormat: '</div>',
                    // followPointer: false,
                    // hideDelay: 30
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                },
                series: {
                    dataLabels: {
                        align: 'left',
                        enabled: true,
                        format: '$ ' + '{point.y:,.0f}',

                    }
                }
            },
            colors: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'],
            series: [{
                type: 'area',
                name: 'Cumulative Cost',
                data: chartdata
            }]
        });
    }
    //average function
const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
//render highcharts avg weeks treatment


let renderAvgCostTreatmentHigh = (data, piData, container, max_treatment_num, groupLabel) => {

    d3.select(container).selectAll("*").remove(); //remove the selective svg if any
    let chartdata = [];
    let avgsplidata = []; //calculate data for spline curves

    let colors1 = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', "#929FA8", "#97E0E3", "#676767", "#FBDE97", '#17becf'];
    let treatment_categories = [];
    for (let i = 0; i < max_treatment_num && i < data.length; i++) {
        treatment_categories.push(i + 1);
        let avg_cost = data[i]['total'] != 0 ? (data[i]['totalCost'] / data[i]['total']) : 0;
        avgsplidata.push(Math.round(avg_cost, 2));
    }

    let genotypes_grp = groupLabel;

    let pidata = [];
    for (let gen = 0; gen < genotypes_grp.length; gen++) {
        let json = {};
        let geno = genotypes_grp[gen];
        json['type'] = 'column';
        json['name'] = genotypes_grp[gen];
        let key = genotypes_grp[gen];
        let d1 = [];
        let sum = 0;
        for (let j = 0; j < data.length; j++) {
            d1.push(data[j][key] != undefined ? Math.round(data[j][key], 2) : 0);
        }
        json['data'] = d1;
        chartdata.push(json);
    }

    chartdata.push({
        type: 'spline',
        name: 'Average',
        data: avgsplidata,
        marker: {
            lineWidth: 2,
            lineColor: colors1[3],
            fillColor: 'white'
        },
        dataLabels: {
            enabled: false
        },
    });

    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
    chartdata.push({
        type: 'pie',
        name: 'Avg Weeks',
        data: piData,
        center: ['70%', '40px'],
        size: 165,
        showInLegend: false,
        dataLabels: {
            distance: -30,
            rotate: 0,
            format: '{point.percentage:0.2f} %',
            style: {
                fontWeight: '300',
                fontSize: '11px',
            }
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<div class="">',
            pointFormat: `<div class="">
                                          <div>Treatment Number: {point.name}</div>
                                          </div>
                                          <div class="">
                                          <div> Avg Weeks: {point.y}</div>
                                          </div><div class="">
                                          <div> Patient Count: {point.patientCount:,.0f}</div>
                                          </div>`,
            footerFormat: '</div>',
            followPointer: false,
            hideDelay: 30
        },
    });

    Highcharts.chart('pharmaTreatmentAvgCost', {
        chart: {
            height: 470,
        },
        title: {
            text: null
        },
        xAxis: {
            categories: treatment_categories
        },
        plotOptions: {

            series: {
                dataLabels: {
                    align: 'left',
                    enabled: true,
                    rotation: -90,
                    format: '$ ' + '{point.y:,.0f}',
                    style: {
                        fontWeight: 'bold',
                        fontSize: '10px',
                    }
                }
            }
        },
        colors: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'],
        labels: {
            items: [{
                html: 'Avg Weeks For Each Treatment',
                style: {
                    left: '430px',
                    top: '10px',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                }
            }]
        },
        credits: {
            enabled: false
        },
        xAxis: {
            type: '',
            title: {
                text: 'Genotypes'
            },
            labels: {
                formatter: function() {
                    return '#treatments';
                }
            }
        },
        yAxis: {
            title: {
                text: 'Avg Cost Per Patient'
            },
            maxPadding: 1
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<div class="">',
            pointFormat: `<div class="">
                                    <div>Genotype: {point.series.name}</div>
                                    </div>
                                    <div class="">
                                    <div> Avg Cost: $ {point.y:,.2f}</div>
                                    </div>`,
            footerFormat: '</div>',
            followPointer: false,
            hideDelay: 30
        },
        series: chartdata,
    });
}



let renderTreatmentPeriodChart = (data, categories) => {
    Highcharts.chart('pharmaTreatmentAvgCostWeek', {
        chart: {
            type: 'line'
        },
        //   title: {
        //       text: 'Treatment Period Distribution'
        //   },
        xAxis: {
            categories: categories
        },
        legend: {
            enabled: false
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
            enabled: true,
            align: 'right',
            x: -30,
            verticalAlign: 'right',
            y: 25,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            headerFormat: '<b>#treatment:{point.x}</b><br/>',
            pointFormat: 'Avg :{series.name} <br/> Patient Count: {point.y:,.0f}'
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                }
            }
        },
        series: data
    });
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


}

// Nisha 02/03/2017 updated for AVG Cost labels
// Nisha 02/22/2017 Modified to caputer the drilldown events in chart and Showing the Cost Table
let renderLiverTransplantCost = (container, chartData) => {
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
                        this.xAxis[0].setTitle({ text: 'Genotypes' });

                        tooltipHeadTitle = 'Genotype';
                    },
                    drilldown: function(e) {
                        // i = i + 1;
                        // console.log(e.point.series.name);
                        Session.set('CostType', e.point.series.name);
                        // console.log(e.point.name);
                        Session.set('GenoType', e.point.name);
                        this.xAxis[0].setTitle({ text: '' });
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
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                symbolRadius: 0,
                x: 0,
                y: 50
            },
            yAxis: {
                title: {
                    text: 'Total Cost'
                },
                labels: {
                    formatter: function() {
                        if(this.value){
                            return '$'+autoFormatCostValue(this.value);
                        }
                        // if (this.value >= 1E6) {
                        //     return '$' + this.value / 1000000 + 'M';
                        // }
                        // return '$' + this.value / 1000 + 'k';
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
                                        <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(~~this.y)}</div>
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
                            if(this.y){
                                return autoFormatCostValue(this.y);
                            }
                            // if (this.y >= 1000000)
                            //     return '$' + Highcharts.numberFormat(this.y / 1000000, 0) + 'M';
                            // else if (this.y >= 1000 && this.y < 1000000)
                            //     return '$' + Highcharts.numberFormat(this.y / 1000, 0) + 'k';
                            // else if (this.y > 0 && this.y < 1000)
                            //     return '$' + Highcharts.numberFormat(this.y, 0);
                        }
                    },
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function(e) {
                                if (this.x) {
                                    Session.set('CostDrillDown', e.point.name);
                                    CreateCostTable();
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
     *  Created: Nisha 22-Feb-2017
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
            TableData.patientuniquecount = _.uniq(_.pluck(groupedCode[keys], 'PATIENT_ID_SYNTH')).length;
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
        $('#pharmaLiverTransplantByGenotype').hide();

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
    if (AmdApp.Filters) {
        params = getCurrentPopulationFilters();
    }
    GenoType = Session.get('GenoType');
    CostType = Session.get('CostType');
    CostDrillDown = Session.get('CostDrillDown');
    params.LTGenoType = GenoType;
    params.LTCostType = CostType;
    params.LTCostDrillDown = CostDrillDown;
    // Clear the popup data
    // $('.costChartWrapper').hide();
    $('#divCostTable').empty();
    // $('.pharmaPatientsPopup').show();
    // setTimeout(function() {
    //     $('.costChartsLoading').show();
    //     $('.costChartWrapper').hide();
    // }, 1000);
    Meteor.call('getLiverTransplantCostDataDrillDown', params, function(error1, results) {
        if (error1) {
            console.log("error");
        } else {
            console.log("method called");
            var decompressed_object_result_LT = LZString.decompress(results);
            var resulting_object_result_LT = JSON.parse(decompressed_object_result_LT);
            setTimeout(function() {
                renderCostTable(resulting_object_result_LT);

            }, 1000);
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


// Nisha 02/03/2017 updated for AVG Cost labels
let renderStackedChartRemmission = (container, chartData, category, key) => {
    //Praveen 02/21/2017 removed this console
    //console.log(chartData);
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
        colors: customColorsArray(),
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Patient Count (%)'
            }
            /*,
                        stackLabels: {
                            enabled: true,
                            verticalAlign: 'top',
                            formatter: function() {
                                // console.log(this);
                                return ""; //commaSeperatedNumber(this.points.cost.toFixed(2));
                            }

                        }*/
        },
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                //console.log(this);
                return key + ' :' + this.key + '<br/> Patient Count: ' + commaSeperatedNumber(this.y) + '<br/> Avg Cost: $ ' + commaSeperatedNumber(this.point.cost.toFixed(2));
            }
        },
        plotOptions: {
            column: {
                stacking: 'percent',
                dataLabels: {
                    align: 'center',
                    enabled: true,
                    formatter: function() {
                        if (this.y != 0) {
                            return ' $ ' + autoFormatCostValue(this.point.cost); // commaSeperatedNumber(this.point.y);
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

let renderRelapsedPatientChartskey = (container, chartData, category, key) => {

    Highcharts.chart('pharmaTreatmentRelapsed', {
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
                    formatter: function() {
                        if (this.y != 0) {
                            return ' $ ' + autoFormatCostValue(this.point.cost); // commaSeperatedNumber(this.point.y);
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
                //text: 'Avg Cost'
                text: 'Patient Count'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                //console.log(this);
                return key + ' :' + this.key + '<br/> Patient Count: ' + commaSeperatedNumber(this.y) + '<br/> Avg Cost: $ ' + commaSeperatedNumber(this.point.cost.toFixed(2));
            }
        },

        series: chartData
    });

}


let renderRetreatedByGenotype = (data) => {
    if (data.length > 0) {
        Highcharts.chart(pharmaRetreatmentByGenotype, {
            chart: {
                type: 'column',
                height: 470,
                width: 1200
            },
            title: {
                text: null
            },
            subtitle: {
                text: 'Click the bar to view details.'
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
                    text: 'Patient Count'
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
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                let name = this.name;
                                if (name) {
                                    $('#pharmaRetreatmentByGenotype').empty();
                                    $('#pharmaRetreatmentByGenotype').append(`<div class="col-lg-12" style='float: left;position: relative;text-align: center;'><h3 >Genotype : ${name}</h3><div id="retreatedback" class="customChartBackButton backButtonCss">Back</div></div>`);
                                    $('#pharmaRetreatmentByGenotype').append(`<div class="col-lg-4"><div id="NoOfRetreatedChart" class="boxshadow_borderline"></div></div>`);
                                    $('#pharmaRetreatmentByGenotype').append(`<div class="col-lg-4"><div id="retreatedMedicationChart" class="boxshadow_borderline"></div></div>`);
                                    $('#pharmaRetreatmentByGenotype').append(`<div class="col-lg-4"><div id="retreatedPeriodChart" class="boxshadow_borderline"></div></div>`);
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
                                    $('#retreatedback').on('click', function() {
                                        $('#pharmaRetreatmentByGenotype').empty();
                                        renderRetreatedByGenotype(retreatedPatientData.retreatedByGenotype);
                                    });
                                }
                            }
                        }
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
        $('#pharmaRetreatmentByGenotype').html(`<div style="text-align: center;padding-top: 5%;color: red;">No patient took retreatment for selected cohort criteria</div>`);
    }

}

let renderRetreatedDrillDownChart = (data, container) => {
    let title = '',
        extraTooltipText = '';
    if (container == 'NoOfRetreatedChart') {
        title = 'No of Retreatment';
    } else if (container == 'retreatedMedicationChart') {
        title = 'Medication';
    } else if (container == 'retreatedPeriodChart') {
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

Template.MedicationCost.fetchAndRenderData = () => {
    // console.log("*** Pharma Sumaary ***")
    // console.log(dbparams);
    let params = {};
    if (AmdApp.Filters) {
        params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
    }
    pharmaLib.showChartLoading();
    params['tabname'] = 'medicationcost';


    Meteor.call('getPatientsCost', params, (error, costResults) => {
        if (error || (costResults.length < 0)) {
            alert('No data fetched for the sub population');
            pharmaLib.hideChartLoading();
            return;
        } else {
            pharmaLib.setAdvancedSearchFilters();
            pharmaLib.setPharmaHeader();
            let stringifyResult = LZString.decompress(costResults);

            costResults = JSON.parse(stringifyResult);
            //console.log(costResults);
            medicationCostData = costResults.MedicationCostData;

            // OLD CODE
            // $('.searchPatientCountHeaderPharma').html(costResults.CostPatientLength);
            // $('.searchPatientCountHeaderPharma').html(costResults.MedicationCostData.CostPatientLength);
            //Added :14-FEB-2017 Arvind,sigle method to set patient count on cohort menu
            setCohortPatientCount({
                patientCount: costResults.CostPatientLength
            });
            params.medication = 'all';
            Meteor.call('getICERData', params, function(errors, ecrResult) {
                if (errors) {
                    alert('No data fetched for the sub population');
                    pharmaLib.hideChartLoading();
                } else {
                    ecrResult = JSON.parse(ecrResult);
                    // console.log(ecrResult);

                    //update the selectisize combo values
                    //$('#pharma-medicationICER').selectize()[0].selectize.destroy();

                    //set medications in icer combo

                    //meteor call to fetch viral score data from server
                    Meteor.call('getPharmaViralScoreAnalysisData', params, function(error1, result) {
                        if (error1) {
                            pharmaLib.hideChartLoading();
                        } else {

                            icerMedsComboData.set(ecrResult.medication);

                            //update the drug combo
                            updateDrugCombo(ecrResult.medication);

                            ICERData = ecrResult.data;
                            //console.log(ICERData);

                            // Nisha 02/27/2017 Commented to Call the getRetreatmentPatientData directly from Analysis to make Retreatment Charts identical
                            //render retreatment chart
                            // renderRetreatedByGenotype(costResults.RetreatedDistribution.retreatedByGenotype);
                            // retreatedPatientData = costResults.RetreatedDistribution;

                            //render cost chart
                            rendercostchart(costResults.MedicationCostData.avgCostChartData, costResults.MedicationCostData.treatment_categories, 'Average Cost');

                            //render cumulative cost treatment chart
                            renderCumulativeCostTreatmentChartHigh(costResults.MedicationCostData.AvgCumulativeChartData, 'Average Cumulative Cost');
                            // DEcompression form Viral Score Analysis Data
                            // Nisha 02/27/2017 Added the  Call to getRetreatmentPatientData directly from Analysis to make Retreatment Charts identical
                            Meteor.call('getRetreatmentPatientData', params, (errors, costRetratmentResult) => {
                                if (errors || (costRetratmentResult.length < 0)) {
                                    console.log('No data fetched for the sub population');
                                    // console.log(errors);
                                    pharmaLib.hideChartLoading();
                                    return;
                                } else {
                                    costRetratmentResults = JSON.parse(costRetratmentResult);
                                    pharmaLib.hideChartLoading();

                                    renderRetreatedByGenotype(costRetratmentResults.RetreatedDistribution.retreatedByGenotype);
                                    retreatedPatientData = costRetratmentResults.RetreatedDistribution;
                                }
                            });


                            var decompressed_object_result = LZString.decompress(result);
                            var resulting_object_result = JSON.parse(decompressed_object_result);
                            relapsedPatientData['relapsed'] = resulting_object_result.pharmaAnalysisData.Relapsed;
                            relapsedPatientData['remitted'] = resulting_object_result.pharmaAnalysisData.Remitted;
                            //render Relapsed and Remmission charts
                            renderRelapsedPatientCharts(resulting_object_result.pharmaAnalysisData.Relapsed, resulting_object_result.pharmaAnalysisData.Remitted);
                            //hide loading chart
                            pharmaLib.hideChartLoading();
                        }
                        setTimeout(function() {
                            $('.symptomsChartsLoading').show();
                            $('.symptomsChartWrapper').hide();
                        }, 1000);
                        Meteor.call('getLiverTransplantCostData', params, (err, sympResults) => {
                            if (!err) {
                                //console.log(sympResults);
                                var decompressed_object_result_LT = LZString.decompress(sympResults);
                                var resulting_object_result_LT = JSON.parse(decompressed_object_result_LT);
                                console.log(resulting_object_result_LT);
                                renderLiverTransplantCost('pharmaLiverTransplantByGenotype', resulting_object_result_LT);

                                setTimeout(function() {
                                    $('.symptomsChartsLoading').hide();
                                    $('.symptomsChartWrapper').show();
                                }, 1000);
                            }
                        });

                    });
                }
            });
        }
    });

    // });
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


let updateDrugCombo = (drugsArray) => {
    $('.pharmaCost-ICERChartSection').hide();
    $('.pharmaCost-ICERNoData').show();

    let optionsHtml = `<option value="null" selected disabled>Select ...</option>`;

    for (let i = 0; i < drugsArray.length; i++) {
        optionsHtml += `<option value="${drugsArray[i]}">${drugsArray[i]}</option>`;
    }

    $('#pharma-medicationICER').selectize()[0].selectize.destroy();
    $('#pharma-medicationICER').empty();
    $('#pharma-medicationICER').html(optionsHtml);

    $('#pharma-medicationICER').selectize();
}



// Render for comparativeengine
let renderComaparativeOptionsView = () => {
    var comparativeEngine = new ComparativeEngine({
        tabName: "MedicationCostTab-Pharma"
    });

    comparativeEngine.renderCompareOptiosView();
}