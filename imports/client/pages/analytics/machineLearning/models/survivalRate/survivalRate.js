import { Template } from 'meteor/templating';
import './survivalRate.html';
import * as mlSubTabsUtil from '../modelUtils.js';
import { Session } from 'meteor/session';
import * as analyticsLib from '../../../analyticsLib.js';

let filterObjectsArray = [];
let meldscorechartData = [];
let filteredData = [];
let riskDistributionData = [];
let safetyAjaxs = [];
let SurvivalRateObj = {};
SurvivalRateObj.Primary = {}, SurvivalRateObj.Secondary = {};
let filtered = '';
var riskResulttotal = 0;

Template.SurvivalRate.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let params = getCurrentPopulationFilters();
        params['fdaCompliant'] = "all";
        executeSurvivalRateRender(params, self);
    });
});

Template.SurvivalRate.rendered = function() {
    Session.set('Mprob', '');
    filterObjectsArray = [];
    $('.headerbuttonFilesection').hide();
}

Template.SurvivalRate.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    }

});

Template.SurvivalRate.events({
    'click .globalshowPatientsurvivalrate': function(event, template) {
        $('.survivalRatePList-listMask').hide();
        $('.survivalRatePList').show();
    },
    'click .globalexportPatientsurvivalrate': function(event) {
        let baseData = _.clone(filteredData);
        filteredData = GetMainData(baseData);
        mlSubTabsUtil.exportPatientsData(event.currentTarget, 'survivalRate', filteredData);
    },
    'click .safetydrugTabsRisk .safetydrugTabRisk-links a': function(e) {
        var ele = e.currentTarget;
        var currentAttrValue = $(ele).attr('href');
        // Show/Hide Tabs
        $('.safetydrugTabRisk' + currentAttrValue).show().siblings().hide();
        // Change/remove current tab to active
        $(ele).parent('li').addClass('active').siblings().removeClass('active');
        var selectedTab = currentAttrValue.substr(currentAttrValue.lastIndexOf('_') + 1);
        e.preventDefault();
    },
    /**
     * Modified By : Yuvraj
     * date : 13th Feb 17
     * desc : We are no longer using date filters, So else condition is not required.
     */
    'click .js-analytics-applyDateFilters': function(event, template, data) {
        // console.log('click event called');
        //check for advanceSearchClickable
        if (data && data == 'refresh') {
            template.loading.set(true);
            let params = getCurrentPopulationFilters();
            // console.log(params);
            params['fdaCompliant'] = "all";
            executeSurvivalRateRender(params, template);
        }
        // else {
        //     filtered = 'true';
        //     renderChartsWithFilteredData();
        // }
    },
    'click .close.mlTabs_closebtn': function(e) {
        $('.analyticsPatientsPopup').hide();
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];
        let baseOrigSurvivalRateTabsData = SurvivalRateObj.Primary;
        let baseCompSurvivalRateTabsData = SurvivalRateObj.Secondary;

        if (value == 'survivalRate-analytics') {
            primaryData = baseOrigSurvivalRateTabsData;
            secondaryData = baseCompSurvivalRateTabsData;
        }

        // else if(value == 'nonfdatherapyduration'){
        //     primaryData = baseOrigDataQA.therapyDurationData;
        //     secondaryData = baseCompDataQA.therapyDurationData;
        // }
        //basedon current database
        //if current data is customer specific no need tto swtich variable else we need tto switch variable primaryData,secondaryData
        //by default customer data is selected then method value is true
        if (isCustomerDataset()) {
            plotComparisionDataCharts(value, primaryData, secondaryData, desc);
        } else {
            plotComparisionDataCharts(value, secondaryData, primaryData, desc);
        }
        // plotComparisionDataCharts(value, primaryData, secondaryData, desc);
    }
});


//function to plot comparision charts
let plotComparisionDataCharts = (plottingData, PData, SData, diffplottingData) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection',
        secondaryContainer = 'secondaryDataViewSection',
        riskRacePrimaryContainer = 'riskByRace-ContainerComparePrimary',
        riskRaceSecondaryContainer = 'riskByRace-ContainerCompareSecondary',
        riskGenderPrimaryContainer = 'riskByGender-ContainerComparePrimary',
        riskGenderSecondaryContainer = 'riskByGender-ContainerCompareSecondary';

    let chartTypeLabel = '';

    //empty the containers
    $('#' + primaryContainer).empty();
    $('#' + secondaryContainer).empty();
    // console.log('plotComparisionDataCharts');
    switch (plottingData) {
        case 'survivalRate-analytics':
            chartTypeLabel = 'Survival Rate';
            renderMeldScoreChart(PData.SurvivalRateTabsData, primaryContainer);
            renderMeldScoreChart(SData.SurvivalRateTabsData, secondaryContainer);
            invokeChartsPreparation(PData.RiskDistributionTabData, riskRacePrimaryContainer, riskGenderPrimaryContainer);
            invokeChartsPreparation(SData.RiskDistributionTabData, riskRaceSecondaryContainer, riskGenderSecondaryContainer);
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}


let executeSurvivalRateRender = (params, templateObj) => {
    //params.medicationArray = null;

    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }
    var PerN = 0;
    Meteor.call('getSurvivalRateTabsData', params, (error, result) => {
        //console.log(result);
        if (error) {
            console.log(error);
            console.log('No Data Fetched');
            templateObj.loading.set(false);
            SurvivalRateObj.Primary.SurvivalRateTabsData = null;
        } else {
            //Jayesh 3th april 2017 added methods for risk distribution
            Meteor.call('getRiskDistributionTabData', params, (error, riskResult) => {
                if (error) {
                    templateObj.loading.set(false);
                    console.log(error);
                    console.log('No Data Fetched');
                    SurvivalRateObj.Primary.RiskDistributionTabData = null;
                } else {
                    templateObj.loading.set(false);
                    // Decompression from Get Survival Rate Tabs Data
                    let decompressed_object = LZString.decompress(result);
                    result = JSON.parse(decompressed_object);
                    var resulttotal = getUniqueCount(result, 'patientId');
                    // Decompression from get Risk Distribution Tab Data
                    riskResult = JSON.parse(LZString.decompress(riskResult));
                    //set the coinfection data

                    riskResulttotal = getUniqueCount(riskResult, 'patientId'); // .length;
                    riskResult = riskResult.filter(function(d) {
                        return d.Medication !== null;
                    });
                    var riskResulttotalfiltered = getUniqueCount(riskResult, 'patientId'); //  riskResult.length;

                    riskDistributionData = riskResult;
                    SurvivalRateObj.Primary.RiskDistributionTabData = riskResult;

                    setTimeout(function() {
                        mlSubTabsUtil.showChartLoading();
                        // $(".unique-RD-TotalN").text(commaSeperatedNumber(resulttotal));
                        // result = result.filter(function(d) {
                        //     return d.meldScore !== null && d.dischargeDate !== null;
                        // });
                        // var filteredtotal = getUniqueCount(result, 'patientId'); // result.length;
                        // PerN = (filteredtotal / resulttotal) * 100;
                        // $(".unique-RD-N").text(commaSeperatedNumber(filteredtotal));
                        // $(".unique-RD-PerN").text(parseInt(PerN) + '%');

                        // $("#unique-VL-TotalN").text(commaSeperatedNumber(riskResulttotal));
                        // PerN = (riskResulttotalfiltered / riskResulttotal) * 100;
                        // $("#unique-VL-N").text(commaSeperatedNumber(riskResulttotalfiltered));
                        // $("#unique-VL-PerN").text(parseInt(PerN) + '%');

                        $("#unique-VL-TotalN").text(commaSeperatedNumber(resulttotal));
                        result = result.filter(function(d) {
                            return d.meldScore !== null && d.dischargeDate !== null;
                        });
                        var filteredtotal = getUniqueCount(result, 'patientId'); // result.length;
                        PerN = (filteredtotal / resulttotal) * 100;
                        $("#unique-VL-N").text(commaSeperatedNumber(filteredtotal));
                        $("#unique-VL-PerN").text(parseInt(PerN) + '%');



                        let baseData = result;
                        // console.log(getUniqueCount(baseData, 'patientId'));

                        // baseData = baseData.filter((rec) => rec.labs_meld != null);
                        invokeChartsPreparation(riskDistributionData, 'riskByRace-Container', 'riskByGender-Container');
                        // invokesuspectedCirrhosisChartsPreparation(riskDistributionData);

                        filteredData = GetMainData(baseData);
                        SurvivalRateObj.Primary.SurvivalRateTabsData = filteredData;
                        // $('.survivalRate-totalPatients').html(commaSeperatedNumber(filteredData.length));
                        //Praveen 02/20/2017 commmon cohort
                        setCohortPatientCount({ patientCount: resulttotal });
                        //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(filteredData.length));

                        renderMeldScoreChart(filteredData, 'survivalRate-meldScoreChart');
                        mlSubTabsUtil.renderPatientsList(filteredData, 'survivalRatePList', true);
                        mlSubTabsUtil.hideChartLoading();
                    }, 300)

                }
            });
            fetchSecondaryDataset(params); //fetch compariosn data
        }
    });
}


let fetchSecondaryDataset = (params) => {
    params.database = getReverseSelectedDatabase(); //get database
    // console.log(params.database);
    Meteor.call('getSurvivalRateTabsData', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            SurvivalRateObj.Secondary.SurvivalRateTabsData = null;
        } else {
            result = LZString.decompress(result);
            result = JSON.parse(result);
            let filteredDataSec = GetMainData(result);
            SurvivalRateObj.Secondary.SurvivalRateTabsData = filteredDataSec;
            Meteor.call('getRiskDistributionTabData', params, function(error1, result1) {
                if (error1) {
                    SurvivalRateObj.Secondary.RiskDistributionTabData = null;
                } else {
                    result1 = LZString.decompress(result1);
                    result1 = JSON.parse(result1);
                    SurvivalRateObj.Secondary.RiskDistributionTabData = result1;
                    $('.togglechart').show();
                }
            });
        }
    });
}


// Additional Functions
function GetMainData(mainData) {

    /**
     * Modified By : Yuvraj
     * date : 13th Feb 17
     * desc : We are no longer using date filters. No need to filter the data.
     */

    // let fromDate = $('#selectfromdate').val(),
    //     toDate = $('#selecttodate').val();

    // let startDate = new Date(fromDate + '-01-01');
    // let endDate = new Date(toDate + '-12-31');

    // if (filtered == '') {
    //     mainData = mainData.filter(
    //         function (a) {
    //             return (new Date(a.dischargeDate) >= startDate && new Date(a.dischargeDate) <= endDate);
    //         });
    //     return mainData;
    // }
    // else if (filtered == 'true') {
    //     let mdata = [];
    //     mainData = mainData.filter(
    //         function (a) {
    //             return (new Date(a.dischargeDate) >= startDate && new Date(a.dischargeDate) <= endDate);
    //         });
    // }

    let mainFilteredData = [];
    for (let keys in mainData) {
        let pData1 = mainData[keys];
        pData1.rangen = getMeldScoreRange(pData1.meldScore).range;
        pData1.probabilityn = getMeldScoreRange(pData1.meldScore).probability;
        if (pData1.dischargeDate != null)
            mainFilteredData.push(pData1);
    }

    var mprob = Session.get('Mprob');
    if (mprob != '') {
        mainFilteredData = mainFilteredData.filter(function(el) {
            /* console.log(el.probabilityn.toString());
             console.log(mprob.toString());*/
            return parseFloat(el.probabilityn) == parseFloat(mprob)
        });
    }

    return mainFilteredData;
}

function quarter_of_the_year(date) {
    var month = date.getMonth() + 1;
    return (Math.ceil(month / 3));
}

function renderMeldScoreChart(baseData, container) {
    // let container = 'survivalRate-meldScoreChart';
    let width = 550;
    let legend = {
        align: 'center',
        verticalAlign: 'bottom',
        x: 0,
        y: 0
    };
    let pointertype = undefined;
    //Praveen 02/20/2017 commmon cohort
    if (container == 'survivalRate-meldScoreChart') {
        // setCohortPatientCount({ patientCount: baseData.length });
        width = 850;
        legend = {
            show: true,
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'middle'
        };
        pointertype = 'pointer';
    }
    //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(baseData.length));

    // d3.select(container).selectAll("*").remove();

    var resultProductData1 = baseData;
    var resultProductData = _.sortBy(resultProductData1, function(Data) {
        return Data.dischargeDate;
    });

    // console.log('meld data');
    let meldscorechartData = [];
    for (let keys in resultProductData) {
        let json = {},
            pData = resultProductData[keys],
            meldScores = [];

        let ddate = new Date(pData.dischargeDate);
        // json['total'] = totalCount;
        json['datevalue'] = ddate.getFullYear() + '-Q' + quarter_of_the_year(ddate);
        //  console.log(pData.meldScore);
        json['range'] = getMeldScoreRange(pData.meldScore).range;
        json['probability'] = getMeldScoreRange(pData.meldScore).probability;
        // json['PatientId'] = pData.patientId;

        //  console.log(getMeldScoreRange(pData.meldScore).probability);
        if (json['datevalue'] != "NaN-QNaN")
            meldscorechartData.push(json);
    }
    // console.log(meldscorechartData);
    $("#total-baseData").text(commaSeperatedNumber(meldscorechartData.length));
    let groupedData = _.groupBy(meldscorechartData, 'datevalue');
    let XnameArray = [];
    // console.log(groupedData);
    for (let keys in groupedData) {
        XnameArray.push(keys);
        //  console.log(keys);
    }

    let probgroup = ['71.3%', '52.6%', '19.6%', '6.0%', '1.9%'];
    let prob = ["71.3", "52.6", "19.6", "6.0", "1.9"];
    let p713 = [];
    let p526 = [];
    let p196 = [];
    let p60 = []
    let p19 = [];
    let ptotals = [];

    // p713.push("71.3%");
    // p526.push("52.6%");
    // p196.push("19.6%");
    // p60.push("6.0%");
    // p19.push("1.9%");
    if (container == 'survivalRate-meldScoreChart') {
        var mprob = Session.get('Mprob');
        if (mprob != '') {
            prob = prob.filter(function(el) {
                return el.toString() == mprob.toString()
            });
        }
    }
    var sum = 0;
    var counts = 0;
    for (var i = 0; i <= XnameArray.length; i++) {
        //  console.log(XnameArray[i]);
        if (XnameArray[i] != undefined) {
            sum = 0;
            for (var j = 0; j <= prob.length; j++) {
                //  console.log('session mprob' + Session.get('Mprob'));
                if (prob[j] == "71.3") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });

                    counts = probcount.length;
                    p713.push(counts);
                    sum += counts;
                }
                if (prob[j] == "52.6") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });
                    counts = probcount.length;
                    p526.push(counts);
                    sum += counts;
                }
                if (prob[j] == "19.6") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });
                    counts = probcount.length;
                    p196.push(counts);
                    sum += counts;
                }
                if (prob[j] == "6.0") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });
                    counts = probcount.length;
                    p60.push(counts);
                    sum += counts;
                }

                if (prob[j] == "1.9") {
                    probcount = meldscorechartData.filter(
                        function(a) {
                            return (a.datevalue == XnameArray[i] && a.probability == prob[j]);
                        });
                    counts = probcount.length;
                    p19.push(counts);
                    sum += counts;
                }
            }
            ptotals.push(sum);
        }
    }

    /* console.log(p713);
     console.log(p526);
     console.log(p196);
     console.log(p60);
     console.log(p19);*/
    let seriesChartData = [{
            name: "71.3%",
            color: '#2e7e97',
            data: p713
        },
        {
            name: "52.6%",
            color: '#abd6ba',
            data: p526
        },
        {
            name: "19.6%",
            color: '#e95a52',
            data: p196
        },
        {
            name: "6.0%",
            color: '#69bae7',
            data: p60
        },
        {
            name: "1.9%",
            color: '#f1cb6a',
            data: p19
        }
    ];

    let charts = new Highcharts.chart(container, {

        chart: {
            type: 'column',
            height: 400,
            width: width
        },
        title: {
            text: ""
        },
        plotOptions: {
            column: {
                stacking: 'normal',
            },
            series: {
                cursor: pointertype //,
                    // point: {
                    //     events: {
                    //         click: function() {
                    //                 if (container == 'survivalRate-meldScoreChart') {
                    //                     let range = '';
                    //                     let probm = '';
                    //                     let currentData = _.where(seriesChartData, { color: this.color });
                    //                     currentData = currentData[0];
                    //                     // alert(e.id);
                    //                     switch (currentData.name) {
                    //                         case "71.3%":
                    //                             range = '>40';
                    //                             probm = '71.3';
                    //                             break;
                    //                         case "52.6%":
                    //                             range = "30-39";
                    //                             probm = '52.6';
                    //                             break;
                    //                         case "19.6%":
                    //                             range = "20-29";
                    //                             probm = '19.6';
                    //                             break;
                    //                         case "6.0%":
                    //                             probm = '6.0';
                    //                             range = "10-19";
                    //                             break;
                    //                         case "1.9%":
                    //                             probm = '1.9';
                    //                             range = "0-9";
                    //                             break;
                    //                     }
                    //                     //  console.log(e);
                    //                     dataObj = _.clone(currentData);
                    //                     //filter by meld score
                    //                     dataObj.id = range;
                    //                     dataObj.name = "avgMeldScore";
                    //                     // console.log(dataObj);
                    //                     Session.set('Mprob', probm);
                    //                     filterChartByData(dataObj, 'meldScore');
                    //                 }
                    //             } //
                    //     }
                    // }
            }
        },

        groups: [
            probgroup
        ],
        xAxis: {
            type: 'category',
            categories: XnameArray,
            tick: {
                rotate: 75,
                //multiline: false
            },
            title: {
                text: 'Year-Quarter'
            }
        },
        yAxis: {
            min: 0,
            lineWidth: 1,
            title: {
                text: 'Patient Count',
                position: 'middle'
            },
            reversedStacks: false,
            stackLabels: {
                enabled: true
            }
        },

        tooltip: {
            formatter: function() {
                var s = '<b> Quarter : ' + this.x + '</b>';

                $.each(this.points, function(i, point) {
                    let count = point.y;
                    let unit = 'Patient';
                    if (count > 1) {
                        unit = 'Patients';
                    }
                    s += '<br/><b>  ' + point.series.name + ': </b>' + parseInt(point.y) + " " + unit;
                });

                return s;
            },
            shared: true
        },
        legend: legend
            /* {
                        show: true,
                        align: 'right',
                        layout: 'vertical',
                        verticalAlign: 'middle'
                }*/
            ,

        series: seriesChartData
    });
    return;
}

function getDataForMeldChart(baseData) {
    let totalCount = baseData.length;
    let groupedData = _.groupBy(baseData, function(rec) {
        var disDate = new Date(rec.dischargeDate);
        return disDate.getFullYear() + '-' + (disDate.getMonth() + 1);
    });
    let chartData = [];
    for (let keys in groupedData) {
        let json = {},
            pData = groupedData[keys],
            meldScores = [];

        for (let j = 0; j < pData.length; j++) {
            meldScores.push(pData[j]['labs_meld']);
        }

        json['date'] = keys + '-01';
        json['avgMeldScore'] = meldScores.average().toFixed(2);
        json['patientCount'] = pData.length;
        json['total'] = totalCount;
        json['range'] = getMeldScoreRange(meldScores.average().toFixed(2)).range;
        json['probability'] = getMeldScoreRange(meldScores.average().toFixed(2)).probability;
        chartData.push(json);
    }
    return chartData;
}

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

function filterPatientsByChart(dataObj, chartData) {
    let currDate = new Date(dataObj.x),
        filterDate = null;
    filterData = null;

    currDate = currDate.getFullYear() + '-' + (currDate.getMonth() + 1);
    filterDate = currDate + '-01';

    filterData = _.where(chartData, { date: filterDate })[0];

    mlSubTabsUtil.renderPatientsList(filterData.patientsData, 'survivalRatePList', true);
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
    let parentWrapper = 'survivalRate-Crums';
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
        $('.survivalRate-Crums').empty();
    }
    Session.set('Mprob', '');
    renderChartsWithFilteredData();
}

function renderChartsWithFilteredData() {
    let modifiedData = _.clone(filteredData);
    //Jayesh 3th april 2017 added filter for risk distribution
    let modifiedData1 = _.clone(riskDistributionData);
    let rangeObjectsArray = [];
    if (filterObjectsArray.length > 0) {
        rangeObjectsArray = _.where(filterObjectsArray, { type: 'range' });
        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.removeObjectsFromArray(filterObjectsArray, rangeObjectsArray, 'type');
        }
        for (let i = 0; i < filterObjectsArray.length; i++) {
            let filterObj = {};
            filterObj[filterObjectsArray[i].key] = filterObjectsArray[i].value;
            modifiedData = _.where(modifiedData, filterObj);
            modifiedData1 = _.where(modifiedData1, filterObj);
        }
        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.addObjectsToArray(filterObjectsArray, rangeObjectsArray);

            //filter the data on range objects
            modifiedData = mlSubTabsUtil.filterForRangeObjects(modifiedData, rangeObjectsArray);
            modifiedData1 = mlSubTabsUtil.filterForRangeObjects(modifiedData1, rangeObjectsArray);
        }
    }
    //filtered for risk distribution data
    invokeChartsPreparation(modifiedData1, 'riskByRace-Container', 'riskByGender-Container');
    addBreadsCrums(filterObjectsArray);
    modifiedData = GetMainData(modifiedData);
    renderMeldScoreChart(modifiedData, 'survivalRate-meldScoreChart');
    $('.survivalRate-totalPatients').html(commaSeperatedNumber(modifiedData.length));
    mlSubTabsUtil.renderPatientsList(modifiedData, 'survivalRatePList', true);
    mlSubTabsUtil.hideChartLoading();
}



let renderRiskDistributionChart = (baseData, containerRace, containerGender) => {
    var sumt = 0;
    let allRisk = ['HIV', 'renalFailure'];
    let races = getUniqueArray(_.pluck(baseData, 'race')),
        gender = getUniqueArray(_.pluck(baseData, 'gender')),
        ethinicity = getUniqueArray(_.pluck(baseData, 'ethnicity'));

    let preparedChartData = prepareDataForRisk(baseData, allRisk, 'race');
    // console.log(preparedChartData);
    for (i = 0; i <= preparedChartData.length; i++) {
        if (preparedChartData[i] !== undefined)
            sumt = sumt + preparedChartData[i].data.sum();
    }
    renderRiskWithRaceChart(preparedChartData, races, containerRace);

    preparedChartData = prepareDataForRisk(baseData, allRisk, 'gender');
    renderRiskWithGenderChart(preparedChartData, gender, containerGender);
    // $(".total-riskbaseData").text(commaSeperatedNumber(sumt));
    $(".unique-RD-TotalN").text(commaSeperatedNumber(riskResulttotal));
    PerN = (sumt / riskResulttotal) * 100;
    $(".unique-RD-N").text(commaSeperatedNumber(sumt));
    $(".unique-RD-PerN").text(parseInt(PerN) + '%');

    // console.log(preparedChartData);
    // preparedChartData = prepareDataForRisk(baseData, allRisk, 'ethnicity');
    // renderRiskWithEthinicityChart(preparedChartData, ethinicity);

    let allPatientsData = _.where(baseData, {
        HIV: 'Yes'
    });
    allPatientsData.push(_.where(baseData, {
        renalFailure: 1
    }));

    allPatientsData = _.uniq(_.flatten(allPatientsData));
    if (containerRace == 'riskByRace-Container' || containerGender == 'riskByGender-Container') {
        //Praveen 02/20/2017 commmon cohort
        // setCohortPatientCount({
        //     patientCount: allPatientsData.length
        // });
        //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(allPatientsData.length));
        mlSubTabsUtil.renderPatientsList(allPatientsData, "riskdistributionPList");
    }
}

let renderRiskWithRaceChart = (chartData, races, container) => {
    if (isChartDataEmpty(chartData)) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#' + container).html(noDataHtml);
        return;
    }
    let pointertype = undefined;
    let width = 550;
    if (container == 'riskByRace-Container') {
        pointertype = 'pointer';
        width = 450;
    }

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: 320,
            width: width,
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: races,
            title: {
                text: '<div class="riskDistribution-XAxisText">Race<div>'
            }
        },
        yAxis: {
            min: 0,
            lineWidth: 1,
            title: {
                text: '<div class="riskDistribution-YAxisText">Patient Count</div>'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ''
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    x: 0,
                    y: 0
                },
                cursor: pointertype //,
                    // point: {
                    //     events: {
                    //         click: function() {
                    //             if (container == 'riskByRace-Container') {
                    //                 let filterData = chartData[this.colorIndex];
                    //                 let dataObj = {};
                    //                 //filter by gender
                    //                 dataObj['id'] = this.category;
                    //                 filterChartByData(dataObj, 'race');

                //                 //filter by risk
                //                 dataObj['id'] = filterData.name == 'Renal Failure' ? 'renalFailure' : filterData.name;
                //                 dataObj['value'] = filterData.name == "HIV" ? "Yes" : 1;
                //                 filterChartByData(dataObj, 'risk');
                //             }
                //         }
                //     }
                // }
            }
        },
        // legend: {
        //     align: 'right',
        //     verticalAlign: 'top',
        //     layout: 'horizontal',
        //     floating: true,
        //     x: -10,
        //     y: 10
        // },
        credits: {
            enabled: false
        },
        series: chartData
    });
}


let renderRiskWithGenderChart = (chartData, gender, container) => {
    if (isChartDataEmpty(chartData)) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#' + container).html(noDataHtml);
        return;
    }
    let width = 550;
    let pointertype = undefined;
    if (container == 'riskByGender-Container') {
        pointertype = 'pointer';
        width = 450;
    }

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: 320,
            width: width,
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: gender,
            title: {
                text: '<div class="riskDistribution-XAxisText">Gender</div>'
            }
        },
        yAxis: {
            min: 0,
            lineWidth: 1,
            title: {
                text: '<div class="riskDistribution-YAxisText">Patient Count</div>'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ''
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    x: 0,
                    y: 0
                },
                cursor: pointertype //,
                    // point: {
                    //     events: {
                    //         click: function() {
                    //             if (container == 'riskByGender-Container') {
                    //                 let filterData = chartData[this.colorIndex];
                    //                 let dataObj = {};
                    //                 //filter by gender
                    //                 dataObj['id'] = this.category == "M" ? "Male" : "Female";
                    //                 filterChartByData(dataObj, 'gender');

                //                 //filter by risk
                //                 dataObj['id'] = filterData.name == 'Renal Failure' ? 'renalFailure' : filterData.name;
                //                 dataObj['value'] = filterData.name == "HIV" ? "Yes" : 1;
                //                 filterChartByData(dataObj, 'risk');
                //             }
                //         }
                //     }
                // }
            }
        },
        // legend: {
        //     align: 'right',
        //     verticalAlign: 'top',
        //     layout: 'verticle',
        //     floating: false
        // },
        credits: {
            enabled: false
        },
        series: chartData
    });
}

let renderRiskWithEthinicityChart = (chartData, ethinicity) => {
    if (isChartDataEmpty(chartData)) {
        let noDataHtml = `<div class="noRiskDataFoundAlert">No Risk Data Found</div>`;
        $('#riskByEthinicity-Container').html(noDataHtml);
        return;
    }

    Highcharts.chart('riskByEthinicity-Container', {
        chart: {
            type: 'column',
            height: 320,
            width: 450,
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: ethinicity,
            title: {
                text: '<div class="riskDistribution-XAxisText">Ethinicity</div>'
            }
        },
        yAxis: {
            min: 0,
            lineWidth: 1,
            title: {
                text: '<div class="riskDistribution-YAxisText">Patient Count</div>',
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ''
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    x: 0,
                    y: 0
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let filterData = chartData[this.colorIndex];
                            let dataObj = {};
                            //filter by gender
                            dataObj['id'] = this.category;
                            filterChartByData(dataObj, 'ethnicity');

                            //filter by risk
                            dataObj['id'] = filterData.name == 'Renal Failure' ? 'renalFailure' : filterData.name;
                            dataObj['value'] = filterData.name == "HIV" ? "Yes" : 1;
                            filterChartByData(dataObj, 'risk');
                        }
                    }
                }
            }
        },
        // legend: {
        //     align: 'right',
        //     verticalAlign: 'top',
        //     layout: 'horizontal',
        //     floating: true,
        //     x: -10,
        //     y: 10
        // },
        credits: {
            enabled: false
        },
        series: chartData
    });
}

let prepareDataForRisk = (baseData, riskCategories, groupKey) => {
    // console.log(baseData);
    let data = [];

    for (let i = 0; i < riskCategories.length; i++) {
        let jsonObj = {},
            innerData = [],
            risk = riskCategories[i];

        let riskGroup = _.groupBy(baseData, (rec) => {
            if (rec[risk] == 'Yes') {
                return risk;
            } else if (parseInt(rec[risk]) == 1) {
                return risk;
            }
        });

        let innerGroups = _.groupBy(riskGroup[risk], groupKey);

        for (let keys in innerGroups) {
            innerData.push(getUniqueCount(innerGroups[keys], 'patientId')); //innerGroups[keys].length
        }
        if (risk == 'renalFailure') {
            risk = 'Renal Failure';
        }
        jsonObj['name'] = risk;
        jsonObj['data'] = innerData;
        data.push(jsonObj);
    }
    //console.log(data);
    return data;
}

//function to check empty chart data
let isChartDataEmpty = (chartData) => {
    let dataArray = _.pluck(chartData, 'data'),
        isEmpty = true;

    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i].length > 0) {
            isEmpty = false;
            break;
        }
    }

    return isEmpty;
}


let invokeChartsPreparation = (baseData, containerRace, containerGender) => {
    //console.log(baseData);
    // console.log(baseData);
    renderRiskDistributionChart(baseData, containerRace, containerGender);
    if (containerRace == 'riskByRace-Container' || containerGender == 'riskByGender-Container')
        generateDrugTabs(baseData);
    // invokesuspectedCirrhosisChartsPreparation(baseData);
    //mlSubTabsUtil.renderPatientsList(filteredData, 'treatRiskPriorityPList');
    //generateDrugTabs(baseData);
    //renderRiskDistributionchartLiverDisease(baseData);
    // mlSubTabsUtil.hideChartLoading();
}


/* function to calculate the drugs selected in the drugs page and generate the respective tabs for them */
function generateDrugTabs(baseData) {

    let allDrugsData = getUniqueArray(_.pluck(baseData, 'Medication')),
        drugsToDisplay = [];

    for (let i = 0; i < allDrugsData.length; i++) {
        let drugCombo = allDrugsData[i].split(' + ');
        for (let j = 0; j < drugCombo.length; j++) {
            drugsToDisplay.push({
                name: drugCombo[j].trim(),
                setId: drugCombo[j].trim(),
            });
        }
    }

    let drugsInfo = drugsToDisplay = getUniqueArray(drugsToDisplay);

    document.getElementById("drugsTabsRisk").innerHTML = '';

    let drugTabs = '',
        drugTabsContent = '';

    // generating the drug tabs
    if (drugsToDisplay.length) {
        drugTabs = '<ul class="safetydrugTabRisk-links">';
        drugTabsContent = '<div class="safetydrugTabRisk-content">';
        for (let i = 0; i < drugsToDisplay.length; i++) {
            let nodeEle = 'drugTabRisk_' + (i + 1);
            drugTabs += '<li><a id=tabLinkRisk_' + (i + 1) + ' href=#' + nodeEle + '>' +
                drugsToDisplay[i].name + ''
            '</a></li>';
            drugTabsContent += '<div id=' + nodeEle + ' class="safetydrugTabRisk"></div>';
        }
        drugTabs += '</ul>';
        drugTabsContent += '</div>';
        document.getElementById("drugsTabsRisk").innerHTML = drugTabs;
        $(drugTabsContent).appendTo('#drugsTabsRisk');
        $('#tabLinkRisk_1').parent('li').addClass('active').siblings().removeClass('active');

        $('#drugTabRisk_1').addClass('active').siblings().removeClass('active');
        let tabs = 0;
        while (tabs < drugsToDisplay.length) {
            var nodeEle = 'drugTabRisk_' + (tabs + 1);
            displayResult(convertFirstLetterCaps(drugsToDisplay[tabs].setId), nodeEle);
            tabs++;
        }
    }
}


function displayResult(setId, nodeEle) {
    var xml, xsl;
    //$('#defaultMsg').css('display', 'none');
    document.getElementById("anim_loading_theme").style.top = "130%";
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
    safetyAjaxs.push(
        $.ajax({
            url: `/data/${setId}.html`,
            //  url: 'data/Harvoni.html',
            //url: 'http://dailymed.nlm.nih.gov/dailymed/services/v2/spls/' + setId + '.xml',
            dataType: 'text',
            timeout: 120000,
            success: function(result) {
                //console.log(result);
                document.getElementById(nodeEle).innerHTML = '';
                //document.getElementById(nodeEle).appendChild(result);
                document.getElementById(nodeEle).innerHTML = result;
                document.getElementById(nodeEle).value = setId;

                //For first time set empty string value if safety section is undefined
                // Fixed -Toggle box generating an error
                var sectionId = localStorage.getItem('SafetySectionRisk') ? localStorage.getItem('SafetySectionRisk') : "";
                localStorage.setItem('SafetySectionRisk', '');

                if (sectionId != '') {
                    setTimeout(function() {
                        location.href = sectionId;
                        setTimeout(function() {
                            var subsection = localStorage.getItem('SafetySubSectionIdRisk');
                            Template.RiskDistribution.toggle(sectionId.split('#')[1], 0, subsection);
                            var keyword = localStorage.getItem('DrugToHighlight');
                            if (!keyword == '') {
                                var myHilitor = new Hilitor("body");
                                myHilitor.apply(keyword);
                            }
                        }, 300);
                    }, 800);

                }
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("anim_loading_theme").style.top = "40%";



            },
            error: function(xhr, textStatus, errorThrown) {
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("anim_loading_theme").style.top = "40%";
            }
        })
    );
}
