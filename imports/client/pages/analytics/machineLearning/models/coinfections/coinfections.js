import { Template } from 'meteor/templating';
import './coinfections.html';

import * as mlSubTabsUtil from '../modelUtils.js';


let coinfectionData = [];
Pinscriptive.coInfection = {};
Template.CoinfectionsTab.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    let params = getCurrentPopulationFilters();
    params['fdaCompliant'] = "all";

    executeCoinfectionRender(params, self);
});

Template.CoinfectionsTab.rendered = function() {
    //let baseData = coinfectionData;
    //renderCoinfectionCharts(baseData);
    $('.headerbuttonFilesection').hide();
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
}

Template.CoinfectionsTab.helpers({
    'isLoading': () => {
        return Template.instance().loading.get();
    },
});

Template.CoinfectionsTab.events({
    'click .globalshowPatientco-infections': function(event, template) {
        $('.coinfectionsPlist-listMask').hide();
        $('.coinfectionsPlist').show();
    },
    'click .globalexportPatientco-infections': function(event) {
        let patientsData = _.clone(filteredData);
        /**
         * @author: Pramveer
         * @date: 16th Feb 17
         * @desc: We are no longer using date filters, So else condition is not required.
         */
        //let comboFilterData = mlSubTabsUtil.getFilteredDataOnDateCombos(patientsData, filtered);
        let comboFilterData = patientsData;
        mlSubTabsUtil.exportPatientsData(event.currentTarget, 'coinfectionsExportPatient', comboFilterData);
    },
    'click .close.mlTabs_closebtn': function(e) {
        $('.analyticsPatientsPopup').hide();
    },

    /**
     * @author: Pramveer
     * @date: 16th Feb 17
     * @desc: We are no longer using date filters, So else condition is not required.
     */
    'click .js-analytics-applyDateFilters': (event, template, data) => {
        if (data && data == 'refresh') {
            template.loading.set(true);
            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "all";
            executeCoinfectionRender(params, template);
        }
        // else{
        //     filtered = 'true';
        //     filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(coinfectionData,filtered);
        //     invokeChartsPreparation(filteredData);
        // }
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];
        let baseRealData = Pinscriptive.coInfection.realData;
        let baseCompData = Pinscriptive.coInfection.compData;

        if (value == 'coinfectpatient') {
            primaryData = baseRealData;
            secondaryData = baseCompData;
        } else if (value == 'curehepc') {
            primaryData = getDataForChart(baseRealData.hepCData, 'HepC');
            secondaryData = getDataForChart(baseCompData.hepCData, 'HepC');
        } else if (value == 'curehepb') {
            primaryData = getDataForChart(baseRealData.hepBData, 'HepB');
            secondaryData = getDataForChart(baseCompData.hepBData, 'HepB');
        } else if (value == 'cureratehiv') {
            primaryData = getDataForChart(baseRealData.hivData, 'HIV');
            secondaryData = getDataForChart(baseCompData.hivData, 'HIV');
        } else if (value == 'cureratehivhepb') {
            primaryData = getDataForChart(baseRealData.combinedInfectionsData, 'Combined_Infections');
            secondaryData = getDataForChart(baseCompData.combinedInfectionsData, 'Combined_Infections');
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

let invokeChartsPreparation = (baseData) => {
    let baseChartData = prepareBaseDataForCharts(baseData);
    renderCoinfectionCharts(baseChartData);

    $('#PatientsDistribution').text(commaSeperatedNumber(baseChartData.hepCData.total));
    renderPatientsDistributionChart('coinfection-patientsDistributionContainer', baseChartData);
}

//function to render the coinfections charts
let renderCoinfectionCharts = (data) => {
    //console.log(data);
    // $('#Hep-C-N').text(commaSeperatedNumber(data.hepCData.cured[0].total + data.hepCData.uncured[0].total));
    // $('#Hep-B-N').text(commaSeperatedNumber(data.hepBData.cured[0].total + data.hepBData.uncured[0].total));
    // $('#hiv-N').text(commaSeperatedNumber(data.hivData.cured[0].total + data.hivData.uncured[0].total));
    // $('#Hepb-hiv-N').text(commaSeperatedNumber(data.combinedInfectionsData.cured[0].total + data.combinedInfectionsData.uncured[0].total));

    $('#Hep-C-N').text(commaSeperatedNumber(getHTMLTextN(data.hepCData.cured[0].total + data.hepCData.uncured[0].total, data.hepCData.Mtotal)));
    $('#Hep-B-N').text(commaSeperatedNumber(getHTMLTextN(data.hepBData.cured[0].total + data.hepBData.uncured[0].total, data.hepBData.Mtotal)));
    $('#hiv-N').text(commaSeperatedNumber(getHTMLTextN(data.hivData.cured[0].total + data.hivData.uncured[0].total, data.hivData.Mtotal)));
    $('#Hepb-hiv-N').text(commaSeperatedNumber(getHTMLTextN(data.combinedInfectionsData.cured[0].total + data.combinedInfectionsData.uncured[0].total, data.combinedInfectionsData.Mtotal)));

    let chartData = getDataForChart(data.hivData, 'HIV');
    renderHIVChart('coinfection-HIVContainer', chartData);

    // chartData = getDataForChart(data.liverbiopsyData, 'LiverBiopsy');
    // renderLiverBiopsyChart(chartData);

    chartData = getDataForChart(data.hepBData, 'HepB');
    renderHepBChart("coinfection-HEPBContainer", chartData);

    chartData = getDataForChart(data.hepCData, 'HepC');
    renderHepCChart('coinfection-HEPCContainer', chartData);

    chartData = getDataForChart(data.combinedInfectionsData, 'Combined_Infections');
    renderCombinedInfectionsChart('coinfection-CombinedContainer', chartData);
}

let renderHIVChart = (container, chartData, isCompared) => {
    let totalCount = _.pluck(chartData.mainData, 'y').sum();

    if (totalCount < 1 || isCompared) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#' + container).html(noDataHtml);
        return;
    }

    let defaultSubTitle = 'Click the slices to view Genotype Distribution',
        drillDownSubTitle = 'Click back to view the cure status';

    let chart = new Highcharts.chart(container, {
        chart: {
            type: 'pie',
            height: 320,
            width: 450,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            events: {
                drilldown: (e) => {
                    chart.setSubtitle({ text: drillDownSubTitle });
                },
                drillup: (e) => {
                    chart.setSubtitle({ text: defaultSubTitle });
                }
            }
        },
        colors: customColorsArray(),
        title: {
            text: null
        },
        subtitle: {
            text: defaultSubTitle
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.2f}%',
                    distance: -35,
                    style: {
                        color: 'white'
                    }
                },
                showInLegend: true
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
        },
        series: [{
            name: 'SVR Status',
            colorByPoint: true,
            data: chartData.mainData
                /*data: [{
                    name: 'Cured',
                    y: 80,
                    per: 30,
                    drilldown: 'hiv_cured'
                }, {
                    name: 'UnCured',
                    y: 90,
                    per: 70,
                    drilldown: 'hiv_uncured'
                }]*/
        }],
        drilldown: {
            series: chartData.drillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 20,
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

            }
        }
    });



}

let renderLiverBiopsyChart = (chartData) => {
    let totalCount = _.pluck(chartData.mainData, 'y').sum();

    if (totalCount < 1) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#coinfection-LiverBiopsyContainer').html(noDataHtml);
        return;
    }

    let defaultSubTitle = 'Click the slices to view Genotype Distribution',
        drillDownSubTitle = 'Click back to view the cure status';


    let chart = new Highcharts.chart('coinfection-LiverBiopsyContainer', {
        chart: {
            type: 'pie',
            height: 320,
            width: 450,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            events: {
                drilldown: (e) => {
                    chart.setSubtitle({ text: drillDownSubTitle });
                },
                drillup: (e) => {
                    chart.setSubtitle({ text: defaultSubTitle });
                }
            }
        },
        colors: customColorsArray(),
        title: {
            text: null
        },
        subtitle: {
            text: defaultSubTitle
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.2f}%',
                    distance: -35,
                    style: {
                        color: 'white'
                    }
                },
                showInLegend: true
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
        },
        series: [{
            name: 'SVR Status',
            colorByPoint: true,
            data: chartData.mainData
                /*data: [{
                    name: 'Cured',
                    y: 80,
                    per: 30,
                    drilldown: 'hiv_cured'
                }, {
                    name: 'UnCured',
                    y: 90,
                    per: 70,
                    drilldown: 'hiv_uncured'
                }]*/
        }],
        drilldown: {
            series: chartData.drillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 20,
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

            }
        }
    });
}

let renderHepBChart = (container, chartData, isCompared) => {
    let totalCount = _.pluck(chartData.mainData, 'y').sum();

    if (totalCount < 1 || isCompared) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#' + container).html(noDataHtml);
        return;
    }

    let defaultSubTitle = 'Click the slices to view Genotype Distribution',
        drillDownSubTitle = 'Click back to view the cure status';

    let chart = new Highcharts.chart(container, {
        chart: {
            type: 'pie',
            height: 320,
            width: 450,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            events: {
                drilldown: (e) => {
                    chart.setSubtitle({ text: drillDownSubTitle });
                },
                drillup: (e) => {
                    chart.setSubtitle({ text: defaultSubTitle });
                }
            }
        },
        colors: customColorsArray(),
        title: {
            text: null
        },
        subtitle: {
            text: defaultSubTitle
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.2f}%',
                    distance: -35,
                    style: {
                        color: 'white'
                    }
                },
                showInLegend: true
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
        },
        series: [{
            name: 'SVR Status',
            colorByPoint: true,
            data: chartData.mainData
                /*data: [{
                    name: 'Cured',
                    y: 80,
                    per: 30,
                    drilldown: 'hiv_cured'
                }, {
                    name: 'UnCured',
                    y: 90,
                    per: 70,
                    drilldown: 'hiv_uncured'
                }]*/
        }],
        drilldown: {
            series: chartData.drillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 20,
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

            }
        }
    });
}

let renderHepCChart = (container, chartData, isCompared) => {
    let totalCount = _.pluck(chartData.mainData, 'y').sum();

    if (totalCount < 1 || isCompared) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#coinfection-LiverBiopsyContainer').html(noDataHtml);
        return;
    }

    let defaultSubTitle = 'Click the slices to view Genotype Distribution',
        drillDownSubTitle = 'Click back to view the cure status';

    let chart = new Highcharts.chart(container, {
        chart: {
            type: 'pie',
            height: 320,
            width: 450,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            events: {
                drilldown: (e) => {
                    chart.setSubtitle({ text: drillDownSubTitle });
                },
                drillup: (e) => {
                    chart.setSubtitle({ text: defaultSubTitle });
                }
            }
        },
        colors: customColorsArray(),
        title: {
            text: null
        },
        subtitle: {
            text: defaultSubTitle
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.2f}%',
                    distance: -35,
                    style: {
                        color: 'white'
                    }
                },
                showInLegend: true
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
        },
        series: [{
            name: 'SVR Status',
            colorByPoint: true,
            data: chartData.mainData
                /*data: [{
                    name: 'Cured',
                    y: 80,
                    per: 30,
                    drilldown: 'hiv_cured'
                }, {
                    name: 'UnCured',
                    y: 90,
                    per: 70,
                    drilldown: 'hiv_uncured'
                }]*/
        }],
        drilldown: {
            series: chartData.drillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 20,
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

            }
        }
    });
}

let renderCombinedInfectionsChart = (container, chartData, isCompared) => {
    let totalCount = _.pluck(chartData.mainData, 'y').sum();

    if (totalCount < 1 || isCompared) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#' + container).html(noDataHtml);
        return;
    }

    let defaultSubTitle = 'Click the slices to view Genotype Distribution',
        drillDownSubTitle = 'Click back to view the cure status';

    let chart = new Highcharts.chart(container, {
        chart: {
            type: 'pie',
            height: 320,
            width: 450,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            events: {
                drilldown: (e) => {
                    chart.setSubtitle({ text: drillDownSubTitle });
                },
                drillup: (e) => {
                    chart.setSubtitle({ text: defaultSubTitle });
                }
            }
        },
        title: {
            text: null
        },
        subtitle: {
            text: defaultSubTitle
        },
        colors: customColorsArray(),
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.2f}%',
                    distance: -35,
                    style: {
                        color: 'white'
                    }
                },
                showInLegend: true
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
        },
        series: [{
            name: 'SVR Status',
            colorByPoint: true,
            data: chartData.mainData
                /*data: [{
                    name: 'Cured',
                    y: 80,
                    per: 30,
                    drilldown: 'hiv_cured'
                }, {
                    name: 'UnCured',
                    y: 90,
                    per: 70,
                    drilldown: 'hiv_uncured'
                }]*/
        }],
        drilldown: {
            series: chartData.drillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 20,
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

            }
        }
    });
}

let renderPatientsDistributionChart = (container, chartData, isCompared) => {

    let totalCount = chartData.hepCData.total + chartData.hepBData.total + chartData.hivData.total + chartData.combinedInfectionsData.total;
    if (totalCount < 1 || isCompared) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#' + container).html(noDataHtml);
        return;
    }
    let chart = new Highcharts.chart(container, {
        chart: {
            type: 'column',
            zoomType: 'y'
        },
        title: {
            text: null
        },
        yAxis: {
            title: {
                text: 'Patient Count',
            }
        },
        colors: customColorsArray(),
        xAxis: {
            categories: ['Hepatitis C', 'Hepatitis B', 'HIV', 'HEP B and HIV']
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    format: `{point.y:,0.0f}`
                }
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: 'Patient Count: {point.y:,0.0f}'
        },
        series: [{
            data: [{
                    y: chartData.hepCData.total,
                    color: "#abd6ba"
                },
                {
                    y: chartData.hepBData.total,
                    color: "#f1cb6a"
                },
                {
                    y: chartData.hivData.total,
                    color: "#69bae7"

                }, {
                    y: chartData.combinedInfectionsData.total,
                    color: "#2e7e97"
                }
            ]
        }]
    });
}



//function to get data & drill down data for chart
let getDataForChart = (dataArray, condName) => {
    let mainData = [],
        drillDown = [],
        totalPats = dataArray.total;

    //prepare for cured data
    let curedObj = {
        name: 'Undetectable SVR Patients',
        y: dataArray.cured[0].total,
        percent: (dataArray.cured[0].total / totalPats).toFixed(2),
        drilldown: condName + 'curedPatients'
    };
    //push into main array
    mainData.push(curedObj);

    drillDown.push({
        name: condName + ' Undetectable  SVR Patients',
        id: condName + 'curedPatients',
        percent: 10,
        data: getDrillDownData(dataArray.cured)
    });

    //prepare for uncured data
    let unCuredObj = {
        name: 'Detectable SVR Patients',
        y: dataArray.uncured[0].total,
        percent: (dataArray.uncured[0].total / totalPats).toFixed(2),
        drilldown: condName + 'uncuredPatients'
    };
    //push into main array
    mainData.push(unCuredObj);

    drillDown.push({
        name: condName + ' Detectable SVR Patients',
        id: condName + 'uncuredPatients',
        percent: 10,
        data: getDrillDownData(dataArray.uncured)
    });


    //return final object
    return {
        mainData: mainData,
        drillDown: drillDown,
    };

    function getDrillDownData(categoryArray) {
        let drillDownArr = [];
        for (let i = 0; i < categoryArray.length; i++) {
            let innerJson = {};
            innerJson['name'] = categoryArray[i].genotype;
            innerJson['y'] = categoryArray[i].count;
            innerJson['color'] = genotypeFixedColors(categoryArray[i].genotype);
            drillDownArr.push(innerJson);
        }
        return drillDownArr;
    }
}

function getArrFromFormattedStr(str) {
    return str ? str.replace(/['"]+/g, '').split(',') : [];
}

//data function for conifections tabs
// let prepareBaseDataForCharts = (baseData) => {
//     let coinfectionObject = {},
//         allPatientsArray = [];

//     coinfectionObject['hivData'] = {};
//     coinfectionObject['liverbiopsyData'] = {};

//     //filter data for HIV "Yes" values only
//     let filterData = _.filter(baseData,(rec) => {
//         return rec.svr12 != null && rec.hiv == "Yes"
//     });

//     allPatientsArray.push(filterData);
//     coinfectionObject['hivData']['total'] = filterData.length ? filterData.length : 0;
//     coinfectionObject['hivData']['cured'] = getDataByGenotype(_.where(filterData,{svr12: "0"}));
//     coinfectionObject['hivData']['uncured'] = getDataByGenotype(_.where(filterData,{svr12: "1"}));

//     //filter data for LiverBiopsy "Yes" values only
//     filterData = _.filter(baseData,(rec) => {
//         return rec.svr12 != null && rec.liverBiopsy == "Yes"
//     });

//     allPatientsArray.push(filterData);
//     coinfectionObject['liverbiopsyData']['total'] = filterData.length ? filterData.length : 0;
//     coinfectionObject['liverbiopsyData']['cured'] = getDataByGenotype(_.where(filterData,{svr12: "0"}));
//     coinfectionObject['liverbiopsyData']['uncured'] = getDataByGenotype(_.where(filterData,{svr12: "1"}));


//     allPatientsArray = _.flatten(allPatientsArray);
//     $('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(allPatientsArray.length));
//     mlSubTabsUtil.renderPatientsList(allPatientsArray, "coinfectionsPlist");

//     return coinfectionObject;
// }



let prepareBaseDataForCharts = (baseData) => {
    let coinfectionObject = {},
        allPatientsArray = [];

    coinfectionObject['hepCData'] = {};
    coinfectionObject['hivData'] = {};
    // coinfectionObject['liverbiopsyData'] = {};
    coinfectionObject['hepBData'] = {};
    coinfectionObject['combinedInfectionsData'] = {};

    //let countPatientWithMedication = filterPreactingAntivirals(baseData);
    let countPatientWithMedication = _.filter(baseData , (rec) =>  rec.IS_PREACTING_ANTIVIRAL == 'NO');
    countPatientWithMedication = getUniqueCountMedication(countPatientWithMedication, 'patientId', 'medication');
    
    // allPatientsArray.push(baseData);
    // all patients are HEP C patients, so No filtering is required
    coinfectionObject['hepCData']['total'] = getUniqueCount(baseData, 'patientId');
    coinfectionObject['hepCData']['Mtotal'] = countPatientWithMedication;
    coinfectionObject['hepCData']['cured'] = getDataByGenotype(_.where(baseData, { svr12: "1" }));
    coinfectionObject['hepCData']['uncured'] = getDataByGenotype(_.where(baseData, { svr12: "0" }));

    //filter data for HIV "Yes" values only
    let filterData = _.filter(baseData, (rec) => rec.hiv == "Yes");

    // allPatientsArray.push(filterData);
    coinfectionObject['hivData']['total'] = getUniqueCount(filterData, 'patientId');
    coinfectionObject['hivData']['Mtotal'] = countPatientWithMedication;
    coinfectionObject['hivData']['cured'] = getDataByGenotype(_.where(filterData, { svr12: "1" }));
    coinfectionObject['hivData']['uncured'] = getDataByGenotype(_.where(filterData, { svr12: "0" }));


    //filter data for Hep B and HIV "Yes" values only
    filterData = _.filter(baseData, (rec) => rec.IS_HEP_B == "Yes");

    // allPatientsArray.push(filterData);
    coinfectionObject['hepBData']['total'] = getUniqueCount(filterData, 'patientId');
    coinfectionObject['hepBData']['Mtotal'] = countPatientWithMedication;
    coinfectionObject['hepBData']['cured'] = getDataByGenotype(_.where(filterData, { svr12: "1" }));
    coinfectionObject['hepBData']['uncured'] = getDataByGenotype(_.where(filterData, { svr12: "0" }));

    //filter data for Hep B "Yes" and HIV is "Yes" values only
    filterData = _.filter(baseData, (rec) => rec.IS_HEP_B == "Yes" && rec.hiv == "Yes");

    // allPatientsArray.push(filterData);
    coinfectionObject['combinedInfectionsData']['total'] = getUniqueCount(filterData, 'patientId');
    coinfectionObject['combinedInfectionsData']['Mtotal'] = countPatientWithMedication
    coinfectionObject['combinedInfectionsData']['cured'] = getDataByGenotype(_.where(filterData, { svr12: "1" }));
    coinfectionObject['combinedInfectionsData']['uncured'] = getDataByGenotype(_.where(filterData, { svr12: "0" }));


    // allPatientsArray = _.flatten(allPatientsArray);
    return coinfectionObject;
}


//function to get genotype wise count for patients
let getDataByGenotype = (data) => {
    // console.log(data.length);

    //check for blank data array
    if (data.length < 1) {
        return [{
            genotype: null,
            count: 0,
            total: 0
        }];
    }

    let genotypeData = [],
        genotypeGrp = _.groupBy(data, 'genotype'),
        totalCount = 0;

    for (let keys in genotypeGrp) {
        let genData = genotypeGrp[keys];
        genotypeData.push({
            genotype: keys,
            count: getUniqueCount(genData, 'patientId'),
            total: getUniqueCount(data, 'patientId'),
            color: genotypeFixedColors(keys)
        });
    }

    return genotypeData;
}


let executeCoinfectionRender = (params, templateObj) => {
    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }
    Meteor.call('getCoinfectionTabData', params, (error, result) => {
        if (error) {
            templateObj.loading.set(false);
            Pinscriptive.coInfection.realData = null;
        } else {
            templateObj.loading.set(false);
            result = JSON.parse(result);
            //set the coinfection data
            coinfectionData = result;
            Pinscriptive.coInfection.realData = prepareBaseDataForCharts(coinfectionData);
            setTimeout(() => {
                invokeChartsPreparation(coinfectionData);
                //Praveen 05/19/2017 commmon cohort
                setCohortPatientCount({ patientCount: getUniqueCount(coinfectionData,'patientId') });
                //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(baseData.length));
                mlSubTabsUtil.renderPatientsList(coinfectionData, "coinfectionsPlist");
            }, 100);
            fetchSecondaryDataset(params);
        }
    });
}

//fetch data secondary datset for comparison
let fetchSecondaryDataset = (params) => {
    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }
    params.database = getReverseSelectedDatabase(); //get database
    Meteor.call('getCoinfectionTabData', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            Pinscriptive.coInfection.compData = null;
        } else {
            let fetcheddata = JSON.parse(result);
            setTimeout(() => {
                Pinscriptive.coInfection.compData = prepareBaseDataForCharts(fetcheddata);
                $('.togglechart').show();
            }, 100);
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

        case 'coinfectpatient':
            chartTypeLabel = 'Co-Infected Patient Distribution';
            renderPatientsDistributionChart(primaryContainer, primaryData, false);
            renderPatientsDistributionChart(secondaryContainer, secondaryData, false);
            break;
        case 'curehepc':
            chartTypeLabel = 'Cure Rate For Hepatitis C Patients';
            renderHepCChart(primaryContainer, primaryData, false);
            renderHepCChart(secondaryContainer, secondaryData, false);
            break;
        case 'curehepb':
            chartTypeLabel = 'Cure Rate For Hepatitis B Patients';
            renderHepBChart(primaryContainer, primaryData, false);
            renderHepBChart(secondaryContainer, secondaryData, false);
            break;
        case 'cureratehiv':
            chartTypeLabel = 'Cure Rate For HIV Patients';
            renderHIVChart(primaryContainer, primaryData, false);
            renderHIVChart(secondaryContainer, secondaryData, false);
            break;
        case 'cureratehivhepb':
            chartTypeLabel = 'Cure Rate For HEP B and HIV Patients';
            renderCombinedInfectionsChart(primaryContainer, primaryData, false);
            renderCombinedInfectionsChart(secondaryContainer, secondaryData, false);
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}