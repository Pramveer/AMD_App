/*
 * utilities functions used in analytics tab
 */
import {
    Meteor
} from 'meteor/meteor';
import * as efficacy from './efficacy/efficacy.js';


/*
// Nisha
// 02/15/2017
// Modified for comparing geoLocation distribution of drugs
*/

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 25-May-2017
 * @desc: For Efficacy tab removed dependency of variable `analyticsPatientsData['patientsData']`
 * and added patientData object in pramater Some code may be repetitive
 */
/**
 * @author: Pramveer
 * @date: 24th Feb 17
 * @desc: Reverted the code geolocation comaparision done by Nisha that were overriden by my changes
 */

let analyticsPatientsData = {};
let averageSVR = [];
let analyticsParams = {};
analyticsPatientsData['patientsData'] = null;
analyticsPatientsData['treatingPatients'] = null;
//utilization patient list
analyticsPatientsData['utilizaitonPatientsData'] = null;
analyticsPatientsData['mynetworkutilization'] = null;
analyticsPatientsData['DrugGenotypeData'] = null;
analyticsPatientsData['DrugGenotypePreparedData'] = null;
analyticsPatientsData['CompareGeoLocation'] = null;
analyticsDrugsData = JSON.parse(localStorage.getItem('AllDrugsData'));

//function to get the patients data for sub tab based on category id of sub population
// export function getPatientsDataForAnalytics(category_id) {
//     let params = {};
//     params['category_id'] = category_id;
//     Meteor.call('getPatientsDataForAnalytics', params, (error, results) => {
//         if (error || (results.length < 0)) {
//             alert('No data fetched for the sub population');
//             return;
//         } else {
//             analyticsDrugsData = JSON.parse(localStorage.getItem('AllDrugsData'));
//             analyticsPatientsData['efficacy'] = results.treatedPatients;
//             analyticsPatientsData['utilization'] = results.treatedPatients;
//             analyticsPatientsData['adherence'] = results.treatedPatients;
//             analyticsPatientsData['treatingPatients'] = results.treatingPatients;
//             analyticsPatientsData['mynetworkutilization'] = results.MyNetworkPatients;
//             randomizeAdditionalDrugs();
//             //console.log(analyticsPatientsData);
//         }
//     });
// }


export function getPatientsDataForAnalytics(params, callback) {
    /*Meteor.call('getPatientsDataForAnalytics', params, (error, results) => {
        if (error || (results.length < 0)) {
            alert('No data fetched for the sub population');
            return;
        } else {
            analyticsDrugsData = JSON.parse(localStorage.getItem('AllDrugsData'));
            analyticsPatientsData['efficacy'] = results.treatedPatients;
            analyticsPatientsData['utilization'] = results.treatedPatients;
            analyticsPatientsData['adherence'] = results.treatedPatients;
            analyticsPatientsData['treatingPatients'] = results.treatingPatients;
            analyticsPatientsData['mynetworkutilization'] = results.MyNetworkPatients;
            randomizeAdditionalDrugs();
            //console.log(analyticsPatientsData);
            if (callback) {
                callback(true);
            }
        }
    });*/
    Meteor.call('getAnalyticsTabData', (error, results) => {
        if (error || (results.length < 0)) {
            alert('No data fetched for the sub population');
            return;
        } else {
            analyticsPatientsData['patientsData'] = JSON.parse(results);
            //analyticsPatientsData['utilization'] = results.treatedPatients;
            //analyticsPatientsData['adherence'] = results.treatedPatients;
            //analyticsPatientsData['treatingPatients'] = results.treatingPatients;
            //analyticsPatientsData['mynetworkutilization'] = results.MyNetworkPatients;
            if (callback) {
                callback(true);
            }
        }
    });
}

//function for set utilization patient data
export function analyticsUtilizationPatientsData(results) {
    if (!results || (results.length < 0)) {
        console.log('No data fetched for the sub population');
        return;
    } else {
        analyticsPatientsData['utilizaitonPatientsData'] = results;
    }
}

export function getDataForMedicationsForUtilization(medication, subTab, returnAll) {
    let baseData = analyticsPatientsData['utilizaitonPatientsData'].filter(function (rec) {
        let drugName = rec.Medication;
        if (drugName == medication['Medication']) {
            return true;
        } else {
            return false;
        }
    });

    if (returnAll)
        return analyticsPatientsData['utilizaitonPatientsData'];

    return baseData;
}

export function getDrugByGenotype(params, callback) {
    //console.log('calling')
    Meteor.call('getDrugByGenotype', params, (error, result) => {
        if (error || (result.length < 0)) {
            console.log('No data fetched for the sub population by genotype');
            return;
        } else {
            analyticsPatientsData['DrugGenotypeData'] = result;
            if (AmdApp['DrugByGenotype'] == null)
                AmdApp['DrugByGenotype'] = result;
            if (callback) {
                callback(true);
            }
        }
    });
}


//function to append values on bubble click
export function appendPatientsDetails(obj) {
    let medicationInfo = {};
    let drugName = $(obj).attr('drug'),
        valueData = $(obj).find('.efficacyBubble').attr('data-text');

    medicationInfo['Medication'] = drugName;
    medicationInfo['Medication'] = medicationInfo['Medication'].replace(/\s*\(.*?\)\s*/g, '');
    drugName = drugName.split(' ');
    drugName = drugName[drugName.length - 1];
    drugName = drugName.replace('(', '');
    drugName = drugName.replace('W)', '');
    medicationInfo['treatmentPeriod'] = parseInt(drugName);

    let dummyCheck = $(obj).attr('drug').indexOf("THEN") > 1 ? true : false;

    let data = [];

    data = getDataForMedications(medicationInfo, 'patientsD', dummyCheck);
    // prepareDomForPatients(data, { medicationInfo: medicationInfo, value: valueData, subTab: 'efficacy' });
    prepareNewDomInThePopup(data, {
        medicationInfo: medicationInfo,
        value: valueData,
        subTab: 'efficacy'
    });
}

//function to prepare patients data based on medication
// export function getDataForMedications(medication, subTab, returnAll) {
//     let baseData = _.where(analyticsPatientsData[subTab], medication);
//     if (returnAll)
//         return analyticsPatientsData[subTab];

//     return baseData;
// }
export function getDataForMedications(medication, subTab, returnAll) {
    let baseData = analyticsPatientsData['patientsData'].filter(function (rec) {
        let drugName = rec.Medication;
        if (drugName == medication['Medication']) {
            return true;
        } else {
            return false;
        }
    });
    if (returnAll)
        return analyticsPatientsData['patientsData'];

    return baseData;
}
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 25-May-2017
 * @desc: In older method we are using global variable to store all patient data server side to display popup data for Efficacy,Adherence and Utilization
 * As we work with multiple dataset for comparision we are having issue to display right data so I have created extension method
*/
export function getDataForMedicationsExtension({medication, subTab, returnAll,patientsData}) {
 //`returnAll` dummy check to fetch all medication data
     if (returnAll)
        return patientsData;

    let baseData = patientsData.filter(function (rec) {
        let drugName = rec.Medication;
        if (drugName === medication) {
            return true;
        } else {
            return false;
        }
    });
    // for Efiicacy tab we need to filter datapoint for SVR12 
    if (subTab === 'efficacy') {
        baseData = _.filter(baseData, (d) => {
            return d.SVR12 !== null;
        });
    }
   
    return baseData;
}

// Render Therapy distribution chart
function renderEfficacyChart(container, chartData, medication) {
    // console.log('analyticsPatientsData');
    // console.log(analyticsPatientsData['efficacy']);

    var chart = Highcharts.chart(container, {
        chart: {
            type: 'column',
            zoomType: 'y',
            events: {
                drilldown: function (e) {
                    chart.xAxis[0].setTitle({
                        text: "Genotype"
                    });
                    chart.subtitle.update({
                        text: 'Click back button to view therapy distribution'
                    });
                },
                drillup: function (e) {
                    chart.xAxis[0].setTitle({
                        text: "Therapy Period (in weeks)"
                    });
                    chart.subtitle.update({
                        text: 'Click back button to view genotype distribution'
                    });
                }
            }

        },
        colors: ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba'],
        title: {
            text: null
        },
        subtitle: {
            text: 'Click bars to see genotype distribution'
        },
        xAxis: {
            type: 'category',
            crosshair: true,
            title: {
                text: 'Therapy Period (in weeks)'
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Efficacy %'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.key}</b></td></tr><br>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">Efficacy: </td>' +
                '<td style="padding:0"><b>{point.y} %</b></td></tr><br>' +
                '<tr><td style="color:{series.color};padding:0">Patient Count: </td>' +
                '<td style="padding:0"><b>{point.patientCount}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y.toFixed(2) + ' %';
                    }
                },
            }
        },
        series: [{
            name: 'Therapy Period',
            data: chartData.mainData,
            colorByPoint: true

        }],
        drilldown: {
            series: chartData.drillDown,
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

            }
        }
    });

}



/**
 * @author: Arvind
 * @reviewer: 
 * @date: 24-May-2017
 * @desc: Created separate method to prepare therapy distribution  chart for effficacy for comparative 
 * purpose, So it look like repetetive
 */
//function to get data & drill down data for chart
export function prepareDataForEfficacyTherapyDistributionChart({
    treatedPatients,
    medication
}) {
    ////For Efficacy we filtering records with valid SVR12
    treatedPatients = treatedPatients.filter(function (a) {
        return a.SVR12 != null && a.Medication == medication;
    });

    let groupedDatatreatmentPeriod = _.groupBy(treatedPatients, 'treatmentPeriod');

    let mainData = [],
        drillDown = [],
        totalPats = treatedPatients.total;


    for (let key in groupedDatatreatmentPeriod) {

        let filteredData = groupedDatatreatmentPeriod[key];

        //prepare Age Group Object
        let weekObj = {
            name: key,
            y: getEfficacy(filteredData),
            patientCount: filteredData.length,
            drilldown: key
        };
        //push into main array
        mainData.push(weekObj);

        drillDown.push({
            name: key,
            id: key,
            data: getDrillDownData(filteredData)
        });
    }



    //return final object
    return {
        mainData: mainData,
        drillDown: drillDown,
    };

    function getDrillDownData(categoryArray) {
        if (!categoryArray.length) {
            return [];
        }
        let drillDownArr = [];
        categoryArray = getDataByGenotype(categoryArray);

        for (let i = 0; i < categoryArray.length; i++) {
            let innerArr = [];
            let drilldownObj = {}
            drilldownObj = {
                name: categoryArray[i].genotype,
                y: categoryArray[i].efficacy,
                patientCount: categoryArray[i].count
            }
            drillDownArr.push(drilldownObj);
        }
        return drillDownArr;
    }



    //function to get genotype wise count for patients
    function getDataByGenotype(data) {
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
                count: genData.length,
                efficacy: getEfficacy(genData),
                total: data.length
            });
        }

        return genotypeData;
    }



    function getEfficacy(dataArray) {
        // console.log(dataArray);

        let total_count = 0,
            med_count = 0,
            totalCuredPatients = 0;

        if (!dataArray.length) {
            return 0;
        }

        for (let j = 0; j < dataArray.length; j++) {
            if (dataArray[j].SVR12 != null) {
                med_count = parseInt(dataArray[j]['total']);
                total_count += med_count;
                if (parseInt(dataArray[j].SVR12) == 1) {
                    totalCuredPatients += 1;
                }
            }

        }
        let efficacy = 0;
        if (parseFloat(totalCuredPatients) > 0 && parseFloat(total_count) > 0) {
            efficacy = (parseFloat(totalCuredPatients) * 100) / parseFloat(total_count);
        }

        return parseFloat(efficacy.toFixed(2));

    }

}
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 24-May-2017
 * @desc: Created separate method to render therapy distribution  chart for effficacy for comparative 
 * purpose, So it look like repetetive
 */
export function renderEfficayTherapyDisributionForComparative({
    container,
    chartData,
    medication
}) {
    // console.log('analyticsPatientsData');
    // console.log(analyticsPatientsData['efficacy']);

    var chart = Highcharts.chart(container, {
        chart: {
            type: 'column',
            zoomType: 'y',
            events: {
                drilldown: function (e) {
                    chart.xAxis[0].setTitle({
                        text: "Genotype"
                    });
                    chart.subtitle.update({
                        text: 'Click back button to view therapy distribution'
                    });
                },
                drillup: function (e) {
                    chart.xAxis[0].setTitle({
                        text: "Therapy Period (in weeks)"
                    });
                    chart.subtitle.update({
                        text: 'Click back button to view genotype distribution'
                    });
                }
            }

        },
        colors: ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba'],
        title: {
            text: null
        },
        subtitle: {
            text: 'Click bars to see genotype distribution'
        },
        xAxis: {
            type: 'category',
            crosshair: true,
            title: {
                text: 'Therapy Period (in weeks)'
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Efficacy %'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.key}</b></td></tr><br>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">Efficacy: </td>' +
                '<td style="padding:0"><b>{point.y} %</b></td></tr><br>' +
                '<tr><td style="color:{series.color};padding:0">Patient Count: </td>' +
                '<td style="padding:0"><b>{point.patientCount}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y.toFixed(2) + ' %';
                    }
                },
            }
        },
        series: [{
            name: 'Therapy Period',
            data: chartData.mainData,
            colorByPoint: true

        }],
        drilldown: {
            series: chartData.drillDown,
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

            }
        }
    });

}
export function renderAdherenceTherapyDisributionChart(container, patientDataefficacy, medication) {
    // console.log('analyticsPatientsData');
    //let patientDataefficacy = analyticsPatientsData['patientsData'];
    //"8,12,16,24,48"
    if (patientDataefficacy && patientDataefficacy.length <= 0) {
        fnNoDataFound('#' + container);
        return;
    }
    let chartData = getDataForTherapyChart(patientDataefficacy);
    //console.log(chartData);


    /*
    let groupedDatatreatmentPeriod = _.groupBy(patientDataefficacy, 'treatmentPeriod');
    let groupedDataGenotype = _.groupBy(patientDataefficacy, 'genotype');

    // console.log('groupedDatatreatmentPeriod');
    // console.log(groupedDatatreatmentPeriod);
    let xvalues = [];
    let dataplot = [];

    for (let item in groupedDataGenotype) {
        let jsonObj = {};
        let itemdata = [];
        jsonObj['name'] = item;
        let groupedDatatreatmentPeriod = _.groupBy(groupedDataGenotype[item], 'treatmentPeriod');
        for (let keys in groupedDatatreatmentPeriod) {
            var eff = 0;

            // if (parseFloat(groupedDatatreatmentPeriod[keys].length) > 0 && parseFloat(groupedDataGenotype[item].length) > 0) {
            //     sum = (parseFloat(groupedDatatreatmentPeriod[keys].length) * 100) / parseFloat(groupedDataGenotype[item].length);
            // }

            var totalData = groupedDatatreatmentPeriod[keys].filter(function (a) {
                return (a.Medication == medication && a.SVR12 != null);
            });
            //console.log(totalData);

            var curedData = groupedDatatreatmentPeriod[keys].filter(function (a) {
                return (a.Medication == medication && a.SVR12 == "1");
            });


            if (parseFloat(curedData.length) > 0 && parseFloat(totalData.length) > 0) {
                eff = (parseFloat(curedData.length) * 100) / parseFloat(totalData.length);
            }
            itemdata.push(eff);
        }
        jsonObj['data'] = itemdata;
        dataplot.push(jsonObj);
        // sum = 0;
        // if (parseFloat(groupedDataGenotype[item].length) > 0 && parseFloat(totalData.length) > 0) {
        //     sum = (parseFloat(groupedDataGenotype[item].length) * 100) / parseFloat(totalData.length);
        // }
        // itemdata.push(sum);
    }
    for (let keys in groupedDatatreatmentPeriod) {
        xvalues.push(parseInt(keys));
    }
    //console.log('xvalues');
    //console.log(xvalues);
    // Highcharts.chart(container, {
    //     chart: {
    //         type: 'column'
    //     },
    //     credits: {
    //         enabled: false
    //     },
    //     title: {
    //         text: ' '
    //     },
    //     xAxis: {
    //         categories: xvalues
    //     },
    //     yAxis: {
    //         min: 0,
    //         title: {
    //             text: 'Efficacy %'
    //         },
    //         stackLabels: {
    //             enabled: true,
    //             formatter: function () {
    //                 return parseFloat(this.total).toFixed(2) + " %";
    //             },
    //             style: {
    //                 fontWeight: 'bold',
    //                 color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
    //             }
    //         }
    //     },
    //     legend: {
    //         // align: 'right',
    //         // x: -30,
    //         // verticalAlign: 'top',
    //         // y: 25,
    //         // floating: true,
    //         // backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
    //         // borderColor: '#CCC',
    //         // borderWidth: 1,
    //         // shadow: false
    //         symbolRadius: 0,
    //         show: false
    //     },
    //     tooltip: {
    //         formatter: function () {
    //             var s = '<b> Week : ' + this.x + '</b>';

    //             $.each(this.points, function (i, point) {
    //                 s += '<br/><b>  ' + point.series.name + ': </b>' + parseFloat(point.y).toFixed(2) + " %";
    //             });

    //             return s;
    //         },
    //         shared: true
    //     },
    //     plotOptions: {
    //         column: {
    //             //  stacking: 'normal'
    //             dataLabels: {
    //                 enabled: true, formatter: function () {
    //                     return this.y.toFixed(2) + ' %';
    //                 }
    //             }
    //         }
    //     },
    //     series: dataplot
    // });

    */


    Highcharts.chart(container, {
        chart: {
            type: 'column',
            zoomType: 'y',
            events: {
                drilldown: function (e) {
                    this.subtitle.update({
                        text: 'Click back button to view treatment distribution'
                    });
                },
                drillup: function (e) {
                    this.subtitle.update({
                        text: 'Click bars to view genotype distribution'
                    });
                }
            }
        },
        colors: ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba'],
        title: {
            text: null
        },
        subtitle: {
            text: 'Click bars to view genotype distribution'
        },
        xAxis: {
            type: 'category',
            crosshair: true
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Adherence %'
            }
        },
        tooltip: {
            headerFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.key}</b></td></tr><br>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">Adherence: </td>' +
                '<td style="padding:0"><b>{point.y} %</b></td></tr><br>' +
                '<tr><td style="color:{series.color};padding:0">Presciption Count: </td>' +
                '<td style="padding:0"><b>{point.patientCount}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                //Pram (03 Apr 17) : Tooltip issue fix 
                // http://api.highcharts.com/highcharts/plotOptions.series.stickyTracking
                stickyTracking: true,
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y.toFixed(2) + ' %';
                    }
                },
            }
        },
        series: [{
            name: 'Therapy Period',
            data: chartData.mainData,
            colorByPoint: true

        }],
        drilldown: {
            series: chartData.drillDown,
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

            }
        }
    });




    //function to get data & drill down data for chart
    function getDataForTherapyChart(treatedPatients) {


        let groupedDatatreatmentPeriod = _.groupBy(treatedPatients, 'treatmentPeriod');

        let mainData = [],
            drillDown = [],
            totalPats = treatedPatients.total;


        for (let key in groupedDatatreatmentPeriod) {

            let filteredData = groupedDatatreatmentPeriod[key];

            //prepare Age Group Object
            let weekObj = {
                name: key,
                y: getAdherence(filteredData),
                patientCount: filteredData.length,
                drilldown: key
            };
            //push into main array
            mainData.push(weekObj);

            drillDown.push({
                name: key,
                id: key,
                data: getDrillDownData(filteredData)
            });
        }



        //return final object
        return {
            mainData: mainData,
            drillDown: drillDown,
        };

        function getDrillDownData(categoryArray) {
            if (!categoryArray.length) {
                return [];
            }
            let drillDownArr = [];
            categoryArray = getDataByGenotype(categoryArray);

            for (let i = 0; i < categoryArray.length; i++) {
                let innerArr = [];
                let drilldownObj = {}
                drilldownObj = {
                    name: categoryArray[i].genotype,
                    y: categoryArray[i].adherence,
                    patientCount: categoryArray[i].count
                }
                drillDownArr.push(drilldownObj);
            }
            return drillDownArr;
        }



        //function to get genotype wise count for patients
        function getDataByGenotype(data) {
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
                    count: genData.length,
                    adherence: getAdherence(genData),
                    total: data.length
                });
            }

            return genotypeData;
        }



        function getAdherence(dataArray) {

            let total_count = 0,
                med_count = 0,
                sum_days_medication = 0;

            let sum_treatmentDays = 0;

            if (!dataArray.length) {
                return 0;
            }

            for (let j = 0; j < dataArray.length; j++) {
                med_count = parseInt(dataArray[j]['total']);
                total_count += med_count;
                sum_days_medication += parseFloat(dataArray[j]['days_med']);
                sum_treatmentDays += (parseInt(dataArray[j]['treatmentPeriod']) * 7)
            }

            let adherence = (sum_days_medication / sum_treatmentDays) * 100;

            return parseFloat(adherence.toFixed(2));

        }

    }
}

// Render Overall SVR Trend chart
function renderMedcationSVRTrendChart(container, medication, genoTypes) {
    // console.log('Medication SVR');
    // console.log(AmdApp['MedicationSVR']);
    $(container).empty();
    let filteredSRVData = AmdApp['MedicationSVR'];

    filteredSRVData = filteredSRVData.filter(function (a) {
        return a.MEDICATION == medication;
    });
    // console.log('filteredSRVData');
    // console.log(filteredSRVData);

    let maxweek = _.max(filteredSRVData, function (filteredSRVDataT) {
        return filteredSRVDataT.Weeks;
    });

    let maxWeeks = [];
    let minWeeks = [];

    maxWeeks = _.max(filteredSRVData, function (filteredSRVDataT) {
        return parseInt(filteredSRVDataT.Weeks);
    });
    minWeeks = _.min(filteredSRVData, function (filteredSRVDataT) {
        return parseInt(filteredSRVDataT.Weeks);
    });

    var maxvalue = maxWeeks.Weeks;

    let plotBands = [];

    let range = 0;
    let correction = 8;
    // if (analyticsParams.fdaCompliant == "yes") {
    plotBands.push({
        from: range,
        to: correction,
        color: '#EFFFFF',
        label: {
            text: 'Baseline',
            style: {
                color: '#999999'
            },
            y: 20
        }
    });

    // }

    range = $("#divWeekResponse input[type=radio]:checked").val() == undefined ? 0 : $("#divWeekResponse input[type=radio]:checked").val();
    // console.log(range);
    if (range != 0 && range != 999) {
        var rangefrom = range.split('-')[0];
        var rangeto = range.split('-')[1];
        var from = 0,
            to = 0;
        if (analyticsParams.fdaCompliant == "yes") {
            filteredSRVData = filteredSRVData.filter(function (a) {
                return (parseInt(a.TREATMENT_PERIOD) == parseInt(rangeto));
            });
        } else {
            filteredSRVData = filteredSRVData.filter(function (a) {
                return (parseInt(a.TREATMENT_PERIOD) >= parseInt(rangefrom) && parseInt(a.TREATMENT_PERIOD) <= parseInt(rangeto));
            });

            // plotBands = [];
            // correction = 0;
        }
        //  console.log(dataPJ);
        from = correction;
        to = parseInt(rangeto) + correction;
        plotBands.push({
            from: from,
            to: to,
            color: '#FFFFEF',
            label: {
                text: 'Treatment Period',
                style: {
                    color: '#999999'
                },
                y: 20
            }
        });

        from = parseInt(rangeto) + correction;
        to = parseInt(maxvalue) + correction;

        plotBands.push({
            from: from,
            to: to,
            color: '#FFEFFF',
            label: {
                text: 'Follow-Up',
                style: {
                    color: '#999999'
                },
                y: 20
            }
        });

    } else {
        plotBands = [];
        // from = correction;
        // to = from + correction;

        // plotBands.push({
        //     from: from,
        //     to: to,
        //     color: '#FFFFEF',
        //     label: {
        //         text: 'Treatment Period',
        //         style: {
        //             color: '#999999'
        //         },
        //         y: 30
        //     }
        // });

        // from = to;
        // to = parseInt(maxvalue) + correction;

        // plotBands.push({
        //     from: from,
        //     to: to,
        //     color: '#FFEFFF',
        //     label: {
        //         text: 'Follow-Up',
        //         style: {
        //             color: '#999999'
        //         },
        //         y: 50
        //     }
        // });
    }

    // console.log('renderMedcationSVRTrendChart plotBands');
    // console.log(plotBands);

    let rangeTo = 0;
    if (range != 0) {
        rangeTo = range.split('-')[1];
    }

    // modified By Yuvraj (14th Feb 17) : This check needs to be done after filtering the data based on Selected treatment week.
    if (!checkIfEnoughDataExist(filteredSRVData, rangeTo)) {
        $('#' + container).html('<div class="providerNoDataFound">Not Enough Data Available</div>');
        $('.followPatientsDiv').hide();
        return;
    }

    let followSamePatientData = getSamePatientsData(filteredSRVData, rangeTo);

    // console.log(followSamePatientData);

    let improved_followSamePatientData = removeUnnecessaryResults(followSamePatientData);
    // console.log(improved_followSamePatientData);

    let pCount = _.flatten(improved_followSamePatientData);
    pCount = _.uniq(_.pluck(pCount, 'PATIENT_ID_SYNTH'));

    let tooltipContent = `<div>Follow ${pCount.length} Patients </div>`;

    $('#followSamePatients').tooltip({
        contents: '<div></div>'
    });
    $('#followSamePatients').tooltip('option', 'content', tooltipContent);
    $('.followPatientsDiv').show();

    let categoriesx = [];

    for (week = parseInt(minWeeks.Weeks); week <= parseInt(maxWeeks.Weeks); week++) {
        categoriesx.push(week);
    }

    if (categoriesx.length > 1) {
        let seriesy = [];
        let maxvalue = 0;
        let ymaxvalue = 0;
        let jsonObj = {},
            filteredcount = [],
            dataweekcount = [];
        for (week = parseInt(minWeeks.Weeks); week <= parseInt(maxWeeks.Weeks); week++) {
            let total = 0;
            filteredcount = filteredSRVData.filter(function (a) {
                return (a.Weeks == week);
            });

            // let patientcount = _.pluck(filteredcount, 'PATIENT_ID_SYNTH');
            let patientcount = _.pluck(filteredcount, 'PATIENT_ID_SYNTH');
            patientcount = _.uniq(patientcount).length;

            // console.log('patientcount');
            // console.log(patientcount);
            for (j = 0; j < filteredcount.length; j++) {
                total = total + parseFloat(filteredcount[j].ViralLoad);
            }

            let valt = 0.0;

            if (filteredcount.length > 0 && total > 0)
                valt = Math.log(parseFloat(total / filteredcount.length));

            if (valt < 0)
                valt = 0.0;

            if (ymaxvalue < valt)
                ymaxvalue = valt;
            //valt = parseFloat(valt).toFixed(2);
            dataweekcount.push({
                y: valt,
                patientcount: patientcount
            }); //, patientcount: 10

            // dataweekcount.push(valt);

        }
        jsonObj['name'] = medication;
        jsonObj['data'] = dataweekcount;
        seriesy.push(jsonObj);
        // console.log('seriesy');
        // console.log(seriesy);

        Highcharts.chart(container, {
            chart: {
                zoomType: 'xy',
                width: 1135
            },
            title: {
                text: ' '

            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: categoriesx,
                title: {
                    text: 'Weeks'
                },
                plotBands: plotBands
            },
            plotOptions: {
                series: {
                    events: {
                        legendItemClick: function () {
                            var visibility = this.visible ? 'visible' : 'hidden';
                        }
                    }
                },
                line: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return Highcharts.numberFormat(this.y, 2) > 0 ? Highcharts.numberFormat(this.y, 2) : '';
                        }
                    }
                }
            },
            yAxis: {
                min: 0,
                max: (ymaxvalue + 5),
                lineWidth: 1,
                // tickInterval: 1000,
                title: {
                    text: 'Viral Load (in log)'
                },
                // labels: {
                //     enabled: false,
                //     format: yAxisData == '{value}'
                // },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }],
                gridLineWidth: 0
            },
            // tooltip: {
            //     valueSuffix: '°C'
            // },
            // legend: {
            //     layout: 'vertical',
            //     align: 'right',
            //     verticalAlign: 'top',
            //     borderWidth: 0
            // },
            legend: false,
            series: seriesy,
            tooltip: {
                formatter: function () {
                    var s = '';

                    $.each(this.points, function () {
                        s += '<br/><b>Drug Name: </b>' +
                            this.series.name;
                        s += '<br /><b>Week: </b>' + this.x;
                        s += '<br/><b>Viral Load: </b>' +
                            this.y.toFixed(2);
                        s += '<br/><b>Patient Count: </b>' +
                            this.point.patientcount;

                    });

                    return s;
                },
                shared: true
            }
        });
        $('#divWeekResponse').show();
    } else {
        $('#ap_AggregateSVRChart').html('<div style="text-align: center;margin-top: 18%; min-height: 300px;">No Data Found</div>');
        $('#divWeekResponse').hide();
    }



    // function checkIfEnoughDataExist(medicationData){
    //     let flag = false;
    //     for(let i = 0; i<medicationData.length; i++){
    //         if(parseFloat(medicationData[i].ViralLoad) != 0){
    //             flag = true;
    //         }
    //     }
    //     return flag;
    // }

    /**
     * @author : Yuvraj 15th Feb 17
     * @desc : Added Check that data should be greater than zero in baseline as well as Followup period.
     */
    function checkIfEnoughDataExist(medicationData, rangeto) {
        let flag = false;
        let baselineFlag = false;
        let followupFlag = false;
        for (let i = 0; i < medicationData.length; i++) {
            if (parseFloat(medicationData[i].ViralLoad) != 0) {

                if (medicationData[i].Weeks < 0) {
                    baselineFlag = true;
                }
                if (medicationData[i].Weeks > parseInt(rangeto)) {
                    followupFlag = true;
                }
            }
        }

        if (baselineFlag && followupFlag) {
            flag = true;
        }
        return flag;
    }

}
/**
 * @author : Yuvraj 15th Feb 17
 * @desc : Added Check that data should be greater than zero in baseline as well as Followup period.
 */
function renderSVRTrendChartForPatientsWithCompleteData(container, medication) {

    $(container).empty();
    let filteredSRVData = AmdApp['MedicationSVR'];

    filteredSRVData = filteredSRVData.filter(function (a) {
        return a.MEDICATION == medication;
    });

    let range = $("#divWeekResponse input[type=radio]:checked").val() == undefined ? 0 : $("#divWeekResponse input[type=radio]:checked").val();
    let rangefrom = range.split('-')[0];
    let rangeTo = range.split('-')[1];

    if (analyticsParams.fdaCompliant == "yes") {
        filteredSRVData = filteredSRVData.filter(function (a) {
            return (parseInt(a.TREATMENT_PERIOD) == parseInt(rangeTo));
        });
    } else {
        filteredSRVData = filteredSRVData.filter(function (a) {
            return (parseInt(a.TREATMENT_PERIOD) >= parseInt(rangefrom) && parseInt(a.TREATMENT_PERIOD) <= parseInt(rangeTo));
        });

    }

    let followSamePatientData = getSamePatientsData(filteredSRVData, rangeTo);

    // console.log(followSamePatientData);

    let improved_followSamePatientData = removeUnnecessaryResults(followSamePatientData);

    //console.log(improved_followSamePatientData);
    let chartData = prepareChartDataForPatientSVR(improved_followSamePatientData, rangeTo);
    console.log(chartData);

    let followingPatients = _.uniq(_.pluck(_.flatten(improved_followSamePatientData), 'PATIENT_ID_SYNTH')).length;

    renderChart(container, chartData);

    //show the back button/ hide patient section
    $('.followPatientsDiv').hide();
    $('.backToSvrTrend').show();

    function renderChart(container, data) {
        let isDrillDownActive = false;

        let chart = new Highcharts.chart(container, {
            chart: {
                type: 'column',
                events: {
                    drilldown: (e) => {
                        isDrillDownActive = true;
                    },
                    drillup: (e) => {
                        isDrillDownActive = false;
                    }
                }
            },
            title: {
                text: null
            },
            subtitle: {
                text: `Following ${followingPatients} patients`
            },
            xAxis: {
                // categories: [
                //     'Baseline',
                //     'During Treatment',
                //     'Follow Up',
                // ],
                type: 'category',
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Viral Load (in log)'
                }
            },
            tooltip: {
                /*headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} Log</b></td></tr>',
                footerFormat: '</table>', */
                formatter: function () {
                    let html = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip"> <div class="relativeValueChartTooltip-Body">`;
                    let pointObj = this.points[0].point,
                        avgViralLoad = parseFloat(pointObj.y).toFixed(2);

                    //if chart is not in drill down state
                    if (!isDrillDownActive) {
                        html += `<div class="tooltip-DrugName">${pointObj.name}</div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel" style="width:50%">Avg Viral Load: </div>
                                    <div class="col-md-6 tooltip-SectionValue" style="width:50%">${avgViralLoad} Log</div>
                                </div>`;
                    } else {
                        let weeksData = pointObj.options.weeksData;
                        let weekHtml = ``;

                        for (let i = 0; i < weeksData.length; i++) {
                            weekHtml += `<div class="tooltip-Section">
                                            <div class="bulletPointWrap">
                                                <div class="bulletPoint"></div>
                                            </div>
                                            <div class="tooltip-SectionLabel">Week ${weeksData[i].week} : </div>
                                            <div class="tooltip-SectionValue">${parseFloat(weeksData[i].viralLoad).toFixed(2)} Log</div>
                                        </div>`;
                        }

                        html += `<div class="tooltip-DrugName">Patient: ${pointObj.name}</div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel" style="width:50%">Avg Viral Load: </div>
                                    <div class="col-md-6 tooltip-SectionValue" style="width:50%">${avgViralLoad} Log</div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="tooltip-DrugName">Week Distribution</div>
                                    ${weekHtml}
                                </div>`;
                    }

                    html += `</div> </div>`;

                    return html;
                },

                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                },
                /**
                 * @author: Pramveer
                 * @date: 17th Feb 17
                 * @desc: Commented the click event on the single patient
                 */
                column: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                //check if the user is on level two or not
                                let isLevelTwo = this.options ? true : false;
                                if (isLevelTwo) {
                                    let patientId = parseInt(this.name);
                                    plotSinglePatientJourney(patientId);
                                }
                            }
                        }
                    }
                }

            },
            series: [{
                name: 'Avg Viral Load',
                data: data.viralData
            }],
            drilldown: {
                series: data.drillDown,
                drillUpButton: {
                    relativeTo: 'spacingBox',
                    position: {
                        y: 24,
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
            }
        });
    }
}


/**
 * @author: Pramveer
 * @date: 16th Feb 17
 * @desc: function to prepare data for patient Svr Chart
 */
let prepareChartDataForPatientSVR = (followSamePatientData, treatmentPeriod) => {
    let viralLoadData = [], //main  data array 
        drillDownData = []; //drilldown data array

    let baseLineData = [],
        baseLineViralLoad = [],
        duringtreatmentData = [],
        duringtreatmentViralLoad = [],
        followUpData = [],
        followUpViralLoad = [];

    //loop for all patients
    for (let i = 0; i < followSamePatientData.length; i++) {
        //get single patient data
        let patientData = followSamePatientData[i];

        //loop for the all results of the patient
        for (let j = 0; j < patientData.length; j++) {
            let patientObj = patientData[j],
                logViralLoad = parseInt(patientObj.ViralLoad) == 0 ? 0 : Math.log(parseFloat(patientObj.ViralLoad));

            //baseline data
            if (patientObj.Weeks <= 0) {
                baseLineViralLoad.push(logViralLoad);
                baseLineData.push(patientObj);
            }

            //Treatment period data 
            if (patientObj.Weeks > 0 && patientObj.Weeks <= treatmentPeriod) {
                duringtreatmentViralLoad.push(logViralLoad);
                duringtreatmentData.push(patientObj);
            }

            //followup data
            if (patientObj.Weeks > treatmentPeriod) {
                followUpViralLoad.push(logViralLoad);
                followUpData.push(patientObj);
            }

        }

    }

    //prepare main data array
    //push the baseline data
    viralLoadData.push({
        name: 'Baseline',
        y: baseLineViralLoad.average(),
        drilldown: 'baseLineDrilldown'
    });

    //push the during treatment data
    viralLoadData.push({
        name: 'During Treatment',
        y: duringtreatmentViralLoad.average(),
        drilldown: 'duringTreatmentDrilldown'
    });

    //push the followup data
    viralLoadData.push({
        name: 'Follow Up',
        y: followUpViralLoad.average(),
        drilldown: 'followupDrilldown'
    });

    //prepare the drilldown data obj
    //drilldown for baseline data
    drillDownData.push({
        name: 'BaseLine',
        id: 'baseLineDrilldown',
        data: prepareDrilldownForPatientSVR(baseLineData)
    });

    //drilldown for during treatment data
    drillDownData.push({
        name: 'During Treatment',
        id: 'duringTreatmentDrilldown',
        data: prepareDrilldownForPatientSVR(duringtreatmentData)
    });

    //drilldown for follow up data
    drillDownData.push({
        name: 'Follow Up',
        id: 'followupDrilldown',
        data: prepareDrilldownForPatientSVR(followUpData)
    });

    return {
        viralData: viralLoadData,
        drillDown: drillDownData
    };
}

/**
 * @author: Pramveer
 * @date: 16th Feb 17
 * @desc: function to prepare drill down data for patients Viral load 
 */
let prepareDrilldownForPatientSVR = (viraLoadDataArray) => {
    let finalData = [];

    //group by PATIENT_ID_SYNTH 
    let patientsGrp = _.groupBy(viraLoadDataArray, 'PATIENT_ID_SYNTH');

    //loop for each patient
    for (let patients in patientsGrp) {
        let patientData = patientsGrp[patients];
        let json = {},
            viralLoadArr = [], //array for viral load
            weeksData = []; //array for viral load corresponding to each week

        //loop for the patient records
        for (let i = 0; i < patientData.length; i++) {
            let obj = {},
                logViralLoad = parseInt(patientData[i].ViralLoad) == 0 ? 0 : Math.log(parseFloat(patientData[i].ViralLoad));

            obj.week = patientData[i].Weeks;
            obj.viralLoad = logViralLoad;

            weeksData.push(obj);

            viralLoadArr.push(logViralLoad);
        }

        json.name = patients; //patientid as name
        json.y = viralLoadArr.average(); //plotting value on the chart
        json.weeksData = weeksData; //weeks data to show on tooltip

        finalData.push(json);
    }

    return finalData;
}


/**
 * @author: Pramveer
 * @date: 17th Feb 2017
 * @desc: function to plot the single patient data for his journey
 */
let plotSinglePatientJourney = (patientID) => {
    let baseData = AmdApp['MedicationSVR'];

    let singlePatientData = _.where(baseData, {
        PATIENT_ID_SYNTH: patientID
    });

    //remove duplicate records from the patients data 
    //pass array in this function as it takes array for multiple patients & returns array for multiple patients 
    //but we have only single patient & want single patient so pass as array & get 0 index
    singlePatientData = removeUnnecessaryResults([singlePatientData])[0];

    //sort data for patients in asc order
    singlePatientData = _.sortBy(singlePatientData, 'Weeks');

    $('.effSvrChartWrap').hide();
    $('.effSinglePatientWrap').show();

    let xCategories = _.pluck(singlePatientData, 'Weeks');

    let chart = Highcharts.chart('eff_SinglePatientJourney', {
        chart: {
            type: 'line'
        },
        title: {
            text: null,
        },
        subtitle: {
            text: `Patient Jourey for <b>${patientID}</b>`
        },
        xAxis: {
            categories: xCategories,
            title: {
                text: 'Weeks'
            }
        },
        legend: {
            enabled: false
        },
        yAxis: {
            title: {
                text: 'Viral Load (in log)'
            }
        },
        tooltip: {
            shared: false,
            useHTML: true,
            formatter: function () {
                let html = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip"> 
                                <div class="relativeValueChartTooltip-Body">
                                    <div class="tooltip-DrugName">Patient: ${this.key}</div>
                                    <div class="tooltip-Section">
                                        <div class="col-md-6 tooltip-SectionLabel" style="width:50%">Week: </div>
                                        <div class="col-md-6 tooltip-SectionValue" style="width:50%">${this.x}</div>
                                    </div>
                                    <div class="tooltip-Section">
                                        <div class="col-md-6 tooltip-SectionLabel" style="width:50%">Viral Load: </div>
                                        <div class="col-md-6 tooltip-SectionValue" style="width:50%">${parseFloat(this.y).toFixed(2)} Log</div>
                                    </div>
                                </div>
                            </div>`;
                return html;
            }
        },
        series: [{
            name: 'Single Patient Journey',
            data: prepareSinglePatData(singlePatientData, patientID)
        }]
    });



    /**
     * @author: Pramveer
     * @date: 20th Feb 17
     * @desc: internal function to  prepare data for single patient journey chart
     */

    function prepareSinglePatData(dataArray, pid) {
        let chartData = [];

        for (let i = 0; i < dataArray.length; i++) {
            let json = {};
            json.name = pid;
            json.week = dataArray[i].Weeks;
            if (parseInt(dataArray[i].ViralLoad) == 0) {
                json.y = 0.0;
            } else {
                json.y = Math.log(parseFloat(dataArray[i].ViralLoad));
            }

            chartData.push(json);
        }

        return chartData;
    }

}

/**
 * @author : Yuvraj 15th Feb 17
 * @desc : Prepare data for follow same patients functionality..
 */
function getSamePatientsData(medicationData, rangeto) {

    let patientsWithCompleteViralLoadData = [];

    let viralLoadByPatients = _.groupBy(medicationData, 'PATIENT_ID_SYNTH');

    for (let patient in viralLoadByPatients) {
        let singlePatientData = viralLoadByPatients[patient];

        let baselineFlag = false;
        let duringTreatmentFlag = false;
        let followupFlag = false;

        for (let i = 0; i < singlePatientData.length; i++) {
            if (parseFloat(singlePatientData[i].ViralLoad) != 0) {

                if (singlePatientData[i].Weeks < 0) {
                    baselineFlag = true;
                }

                if (singlePatientData[i].Weeks >= 0 && singlePatientData[i].Weeks <= parseInt(rangeto)) {
                    duringTreatmentFlag = true;
                }
            }

            if (singlePatientData[i].Weeks > parseInt(rangeto)) {
                followupFlag = true;
            }
        }

        if (baselineFlag && duringTreatmentFlag && followupFlag) {
            patientsWithCompleteViralLoadData.push(singlePatientData)
        }

    }

    return patientsWithCompleteViralLoadData;
}

function removeUnnecessaryResults(followSamePatientData) {
    let updatedSamePatientData = [];
    for (let i = 0; i < followSamePatientData.length; i++) {
        let singlePatientData = [];
        var patientDataByWeek = _.groupBy(followSamePatientData[i], 'Weeks');

        for (let week in patientDataByWeek) {
            let dataPerWeek = _.max(patientDataByWeek[week], function (d) {
                return parseFloat(d.ViralLoad);
            });
            singlePatientData.push(dataPerWeek);
        }

        updatedSamePatientData.push(singlePatientData)
    }

    return updatedSamePatientData;
}



////// <<<<<<---- Functions to generate the box data ----->>>>/////
//wrap the percentile calls in one method
// function getBoxValues(data) {
//     // console.log('getBoxValues');
//     // console.log(data);
//     var boxValues = {};
//     // if (data.length > 0) {
//     //     boxValues.low = Math.min.apply(Math, data);
//     //     boxValues.q1 = getPercentile(data, 25);
//     //     boxValues.median = getPercentile(data, 50);
//     //     boxValues.q3 = getPercentile(data, 75);
//     //     boxValues.high = Math.max.apply(Math, data);
//     // }
//     var low = 0, high = 0;

//     if (data.length > 0) {
//         low = Math.min.apply(Math, data);
//         high = Math.max.apply(Math, data);
//         boxValues.low = low;// parseFloat(low).toFixed(2);
//         boxValues.high = high;// parseFloat(high).toFixed(2);
//         boxValues.median = meanplotvalues(boxValues.low, boxValues.high);
//         boxValues.q1 = meanplotvalues(boxValues.low, boxValues.median);
//         boxValues.q3 = meanplotvalues(boxValues.high, boxValues.median);
//     }
//     else {
//         boxValues.low = 0;
//         boxValues.q1 = 0;
//         boxValues.median = 0;
//         boxValues.q3 = 0;
//         boxValues.high = 0;
//     }
//     return boxValues;
// }
// //get any percentile from an array
// function meanplotvalues(dataone, datatwo) {
//     var sum = parseFloat(dataone) + parseFloat(datatwo);
//     return parseFloat(sum / 2).toFixed(2);
// }
// function getPercentile(data, percentile) {
//     data.sort(numSort);
//     var index = (percentile / 100) * data.length;
//     var result;
//     if (Math.floor(index) == index) {
//         result = (data[(index - 1)] + data[index]) / 2;
//     }
//     else {
//         result = data[Math.floor(index)];
//     }
//     return result;
// }
// //get the mean of an array of numbers
// function mean(data) {
//     var len = data.length;
//     var sum = 0;
//     for (var i = 0; i < len; i++) {
//         sum += parseFloat(data[i]);
//     }
//     return (sum / len);
// }
// //because .sort() doesn't sort numbers correctly
// function numSort(a, b) {
//     return a - b;
// }
////// <<<<<<---- Functions to generate the box data ----->>>>/////
// Render the SVR Box Chart
// function renderMedcationSVRBoxChart(container, medication, genoTypes) {
//     //   console.log('Medication SVR');
//     //  console.log(AmdApp['MedicationSVR']);
//     $(container).empty();
//     let filteredSRVData = AmdApp['MedicationSVR'];
//     filteredSRVData = filteredSRVData.filter(function (a) {
//         return a.MEDICATION == medication;
//     });

//     if (analyticsParams.cirrhosis != null) {
//         filteredSRVData = filteredSRVData.filter(function (a) {
//             return a.CIRRHOSIS.toLowerCase() == analyticsParams.cirrhosis.replace(/\'/g, "");
//         });
//     }

//     if (analyticsParams.treatment != null) {
//         filteredSRVData = filteredSRVData.filter(function (a) {
//             return a.TREATMENT.toLowerCase() == analyticsParams.treatment.replace(/\'/g, "");
//         });
//     }

//     // console.log(genoTypes);
//     if (genoTypes != null) {
//         filteredSRVData = _.filter(filteredSRVData, function (e) { for (var i = 0; i < genoTypes.length; i++) { if (e.GENOTYPE == genoTypes[i]) { return e; } } })
//     }

//     // console.log('renderMedcationSVRBoxChart');
//     // console.log(filteredSRVData);

//     var resultProductData1 = filteredSRVData;
//     var resultProductData = _.sortBy(resultProductData1, function (Data) {
//         return parseInt(Data.TREATMENT_PERIOD);
//     });

//     let treatmentPeriods = [];// [8, 12, 16, 24, 48];

//     let groupedData = _.groupBy(resultProductData, 'TREATMENT_PERIOD');
//     let XnameArray = [];

//     for (let keys in groupedData) {
//         treatmentPeriods.push(keys);
//     }

//     console.log(treatmentPeriods);
//     if (treatmentPeriods.length > 0) {
//         let seriesy = [];
//         var boxData = [];
//         let jsonObj = {}, filteredcount = [], dataweekcount = [];
//         for (let i = 0; i < treatmentPeriods.length; i++) {
//             let total = 0;
//             filteredcount = resultProductData.filter(function (a) {
//                 return (parseInt(a.TREATMENT_PERIOD) == parseInt(treatmentPeriods[i]));
//             });

//             let data = [];

//             for (let j = 0; j < filteredcount.length; j++) {
//                 let valt = 0.0;
//                 valt = Math.log(parseFloat(filteredcount[j].ViralLoad));
//                 if (valt < 0)
//                     valt = 0.0;
//                 data.push(valt);
//             }
//             var boxValues = getBoxValues(data);
//             boxData.push(boxValues);
//         }
//         console.log(boxData);

//         Highcharts.chart(container, {

//             chart: {
//                 type: 'boxplot'
//             },
//             // Add formatter
//             tooltip: {
//                 pointFormat:
//                 'High: <b>{point.high:.2f}</b><br/>' +
//                 'Q3: <b>{point.q3}</b><br/>' +
//                 'Mean: <b>{point.median}</b><br/>' +
//                 'Q1: <b>{point.q1}</b><br/>' +
//                 'Low: <b>{point.low:.2f}</b><br/>'
//             },
//             // End formatter

//             title: {
//                 text: ' '
//             },
//             credits: {
//                 enabled: false
//             },
//             legend: {
//                 enabled: false
//             },

//             xAxis: {
//                 categories: treatmentPeriods,
//                 title: {
//                     text: 'Weeks'
//                 },
//                 plotBands: [{
//                     from: 0,
//                     to: 8,
//                     color: '#EFFFFF',
//                     label: {
//                         text: 'Treatment Period',
//                         style: {
//                             color: '#999999'
//                         },
//                         y: 30
//                     }
//                 }],
//             },

//             yAxis: {
//                 title: {
//                     text: 'Viral Load (in log)'
//                 }
//                 // plotLines: [{
//                 //     value: 932,
//                 //     color: 'red',
//                 //     width: 1,
//                 //     label: {
//                 //         text: 'Theoretical mean: 932',
//                 //         align: 'center',
//                 //         style: {
//                 //             color: 'gray'
//                 //         }
//                 //     }
//                 // }]
//             },

//             series: [{
//                 data: boxData,
//                 color: 'darkblue',
//                 tooltip: {
//                     headerFormat: '<em><b>Week {point.key}</b></em><br/>'
//                 }
//             }]

//         });
//     }
//     else {
//         $('#ap_ViralLoadBoxChart').html('<div style="text-align: center;margin-top: 18%;">No Data Found</div>');
//     }
// }




export function prepareEfficacyPopup(data, dataObj) {
    // console.log(dataObj);

    let params = AmdApp['Filters'];
    let fda = efficacy.fdaCompliant;

    let geno = params.genotypes ? params.genotypes.replace(/\'/g, "") : 'All';
    let treat = params.treatment ? (params.treatment.replace(/\'/g, "") != 'naive,experienced' ? upperCaseFirst(params.treatment.replace(/\'/g, "")) : 'All') : 'All';
    let cirr = params.cirrhosis ? (params.cirrhosis.replace(/\'/g, "") != 'Yes,No' ? params.cirrhosis.replace(/\'/g, "") : 'All') : 'All';
    let uniquePatientPerCategory = _.uniq(_.pluck(data,'patientId')).length;


    $('.analyticsPatientsPopup').empty();
    let MainHtml = `<div class="popup-inner" style='width: 1280px!important; height: 648px; padding: 20px;overflow: auto'>
	<button type="button" class="close analytics_closebtn" style="margin-top:5px; margin-right:10px"><span aria-hidden="true">×</span></button>
                <div class="analyticsPatientsPopup-header"></div>
      			<div class="analyticsPatientsPopup-container_eff"></div>
    </div>`;
    $('.analyticsPatientsPopup').html(MainHtml);
    $('.analyticsPatientsPopup-container_eff').empty();
    $('.analyticsPatientsPopup-container_eff').empty();

    if (analyticsPatientsData['DrugGenotypeData'] == null)
        analyticsPatientsData['DrugGenotypeData'] = AmdApp['DrugByGenotype'];

    analyticsPatientsData['DrugGenotypePreparedData'] = prepareDrugGenotype(_.groupBy(analyticsPatientsData['DrugGenotypeData'], 'genotype'), dataObj.medicationInfo.Medication);

    let header = `<div class="analyticsCommonPopupHeader">
    <div class="analyticsCommonPopupHeaderInner">
		<div class="analyticsCommonPopupDrugName">
				 ${dataObj.medicationInfo.Medication}
		</div>
        <div class="analyticsCommonPopupFilterDesc">
				 <div class="analyticsCommonPopupFilterDescTitle">Genotype:</div>
                 <div class="analyticsCommonPopupFilterDescValue">${geno}</div>
		</div>
        <div class="analyticsCommonPopupFilterDesc">
				 <div class="analyticsCommonPopupFilterDescTitle">Treatment:</div>
                 <div class="analyticsCommonPopupFilterDescValue">${treat}</div>
		</div>
        <div class="analyticsCommonPopupFilterDesc">
				 <div class="analyticsCommonPopupFilterDescTitle">Cirrhosis:</div>
                 <div class="analyticsCommonPopupFilterDescValue">${cirr}</div>
		</div>


		<div class="analyticsCommonPopupOptions">
               <div class="analyticsCommonPopupOptionsButton commonPopupPatientCount" title="Patient Count"><span style="cursor: default;"><i class="fa fa-users" aria-hidden="true"></i></span><p> ` + uniquePatientPerCategory + `</p></div>
               <div title="Show Patients" class="analyticsCommonPopupOptionsButton commonPopupShowPatientIcon" ><span><i class="fa fa-toggle-off" aria-hidden="true"></i></span></div>
               <div title="Export Patients" class="analyticsCommonPopupOptionsButton commonPopupExportPatientIcon"><span><i class="fa fa-share-square-o" aria-hidden="true"></i></span></div>
        </div>
	</div>`;

    let contentBox = `<div class="apContentBox">
                        <div class="">
                            <div class="col-md-12">
                                <div class="col-md-12">`;

    let filteredSRVData = AmdApp['MedicationSVR'];

    filteredSRVData = filteredSRVData.filter(function (a) {
        return a.MEDICATION == dataObj.medicationInfo.Medication;
    });

    var TreatmentWeeks = [];


    let strradiobutton = '';
    // strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="999" checked> All Weeks ';

    if (fda == "yes") {
        TreatmentWeeks = _.groupBy(filteredSRVData, 'TREATMENT_PERIOD');
        // console.log('TreatmentWeeks');
        // console.log(TreatmentWeeks);
        // $('#divWeekResponse').empty();
        for (let weekkeys in TreatmentWeeks) {
            if (parseInt(weekkeys) == 8) {
                strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-' + weekkeys + '" checked> ' + weekkeys + ' Weeks ';
            } else {
                strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-' + weekkeys + '"> ' + weekkeys + ' Weeks ';

            }
        }
        // $('#divWeekResponse').append(strradiobutton);
        // console.log(strradiobutton);
        contentBox = contentBox + `<div class="col-md-12" style="margin-top:30px;border:1px solid #ddd"  >
        <h3>Viral Load Over Time
          <!--  <div class="insight-icon">
                <i class="fa fa-lightbulb-o" aria-hidden="true" id="insight" style="font-size:24px;right: 850px;"></i>
                <div class="arrow-insight" style="right: 864px;top: 34px;"></div>
                <div class="insight-content-box" style="left: 50px;>
                     <div class="insight-header">
                                    Insight - Sustained Virologic Response (SVR)
                    </div>
                    <div class="col-md-12">
                         <div class="col-md-3 insight-image">
                            <img src="/insight-image.png" align="top" />
                        </div>
                    <div class="col-md-9 insight-body" style="padding: 20px 10px;">
                    </div>
                    </div>
                </div>
            </div>  -->
        </h3>
            <div class="effSvrChartWrap">
                <div id='divWeekResponse' >
                <label style = "font-weight : normal;float: left;">Therapy Period :</label>
                        &nbsp; &nbsp;${strradiobutton}
                </div>
                <div class="followPatientsDiv" id="followSamePatients" title="" style="float:right;"></div>
            <div class="backToSvrTrend" style="float:right;">
                <div class="backButtonCss js-backtoSvrTrend">Back to Svr Trend</div>
            </div>
            <div  id="ap_AggregateSVRChart"> test </div>
        </div>
        <div class="effSinglePatientWrap" style="display:none;" >
             <div class="backToSvrTrend" style="float:right;">
                <div class="backButtonCss js-backtoPatients">Back</div>
            </div>
            <div  id="eff_SinglePatientJourney"> test </div>
        </div>
        </div>`;

    } else if (fda == "no") {

        var maxweekspp = _.max(_.pluck(filteredSRVData, 'TREATMENT_PERIOD'));
        // console.log('maxweekspp');
        // console.log(maxweekspp);

        if (parseInt(maxweekspp) >= 0 && parseInt(maxweekspp) <= 8) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-' + maxweekspp + '" checked> 0 - ' + maxweekspp + ' Weeks ';
        } else if (parseInt(maxweekspp) > 8) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-8" checked> 0 - 8 Weeks ';
        }
        if (parseInt(maxweekspp) >= 9 && parseInt(maxweekspp) <= 12) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="9-' + maxweekspp + '"> 9 - ' + maxweekspp + ' Weeks ';
        } else if (parseInt(maxweekspp) > 12) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="9-12"> 9 - 12 Weeks ';
        }
        if (parseInt(maxweekspp) >= 13 && parseInt(maxweekspp) <= 24) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="13-' + maxweekspp + '"> 13 - ' + maxweekspp + ' Weeks ';
        } else if (parseInt(maxweekspp) > 24) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="13-24"> 13 - 24 Weeks ';
        }
        if (parseInt(maxweekspp) >= 25 && parseInt(maxweekspp) <= 48) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="25-' + maxweekspp + '"> 25 - ' + maxweekspp + ' Weeks ';
        } else if (parseInt(maxweekspp) > 48) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="25-48"> 25 - 48 Weeks ';
        }

        contentBox = contentBox + `<div class="col-md-12" style="margin-top:30px;border:1px solid #ddd" >
            <h3>Viral Load Over Time
           <!-- <div class="insight-icon">
                <i class="fa fa-lightbulb-o" aria-hidden="true" id="insight" style="font-size:24px;right: 850px;"></i>
                <div class="arrow-insight" style="right: 864px;top: 34px;"></div>
                <div class="insight-content-box" style="left: 50px;>
                    <div class="insight-header">
                                    Insight - Sustained Virologic Response (SVR)
                    </div>
                    <div class="col-md-12">
                         <div class="col-md-3 insight-image">
                            <img src="/insight-image.png" align="top" />
                        </div>
                    <div class="col-md-9 insight-body" style="padding: 20px 10px;">
                    </div>
                    </div>
                </div>
            </div> -->
        </h3>
        <div class="effSvrChartWrap">
            <div id='divWeekResponse'>
            <label style = "font-weight : normal;float: left;">Therapy Period : </label>
                        &nbsp; &nbsp; ${strradiobutton}
                    </div>
                <div class="followPatientsDiv" id="followSamePatients" title="" style="float:right;"></div>
                <div class="backToSvrTrend" style="float:right;">
                    <div class="backButtonCss js-backtoSvrTrend">Back to Svr Trend</div>
                </div>
            <div  id="ap_AggregateSVRChart"> test </div></div>
        </div>
        <div class="effSinglePatientWrap" style="display:none;" >
             <div class="backToSvrTrend" style="float:right;">
                <div class="backButtonCss js-backtoPatients">Back</div>
            </div>
            <div  id="eff_SinglePatientJourney"> test </div>
        </div>`;
    } else {

        var maxweekspp = _.max(_.pluck(filteredSRVData, 'TREATMENT_PERIOD'));
        // console.log('maxweekspp');
        // console.log(maxweekspp);

        if (parseInt(maxweekspp) >= 0 && parseInt(maxweekspp) <= 8) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-' + maxweekspp + '" checked> 0 - ' + maxweekspp + ' Weeks ';
        } else {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-8" checked> 0 - 8 Weeks ';
        }
        if (parseInt(maxweekspp) >= 9 && parseInt(maxweekspp) <= 12) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="9-' + maxweekspp + '"> 9 - ' + maxweekspp + ' Weeks ';
        } else {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="9-12"> 9 - 12 Weeks ';
        }
        if (parseInt(maxweekspp) >= 13 && parseInt(maxweekspp) <= 24) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="13-' + maxweekspp + '"> 13 - ' + maxweekspp + ' Weeks ';
        } else {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="13-24"> 13 - 24 Weeks ';
        }
        if (parseInt(maxweekspp) >= 25 && parseInt(maxweekspp) <= 48) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="25-' + maxweekspp + '"> 25 - ' + maxweekspp + ' Weeks ';
        } else {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="25-48"> 25 - 48 Weeks ';
        }

        contentBox = contentBox + `<div class="col-md-12" style="margin-top:30px;border:1px solid #ddd" >
        <h3>Viral Load Over Time
        <!-- <div class="insight-icon">
            <i class="fa fa-lightbulb-o" aria-hidden="true" id="insight" style="font-size:24px;right: 850px;"></i>
            <div class="arrow-insight" style="right: 864px;top: 34px;"></div>
            <div class="insight-content-box" style="left: 50px;">
                <div class="insight-header">
                                Insight - Sustained Virologic Response (SVR)
                </div>
                <div class="col-md-12">
                  <div class="col-md-3 insight-image">
                            <img src="/insight-image.png" align="top" />
                    </div>
                    <div class="col-md-9 insight-body" style="padding: 20px 10px;">
                    </div>
                </div>
            </div>
        </div> -->
    </h3>
     <div class="effSvrChartWrap">
        <div id='divWeekResponse'>
            <div class="" style="float: left;">
                <label style = "font-weight : normal;float: left;">Therapy Period : </label>
                        &nbsp; &nbsp; ${strradiobutton}
            </div>
            <div class="followPatientsDiv" id="followSamePatients" title="" style="float:right;"></div>
            <div class="backToSvrTrend" style="float:right;">
                <div class="backButtonCss js-backtoSvrTrend">Back to Svr Trend</div>
            </div>
        </div>
        <div  id="ap_AggregateSVRChart"> test </div></div>
    </div>
    <div class="effSinglePatientWrap" style="display:none;" >
            <div class="backToSvrTrend" style="float:right;">
            <div class="backButtonCss js-backtoPatients">Back</div>
        </div>
        <div  id="eff_SinglePatientJourney"> test </div>
    </div>`;
    }

    contentBox = contentBox + `<div class="col-md-12"  style="margin-top:30px;border:1px solid #ddd">
         <h3>Therapy Distribution    <span class="macLearningsubTabs-infoIcon mlInfoTip">
                    <div class="analytics-tooltip mlInfoTip_tooltip">

                        <div class="analytics-tooltipBody" style="font-size: 13px;">
                                 Therapy Distribution for Undetectable SVR
                                 Patients distributtion is done on therapy period and then on drilldown we distribute it based on genotype on given therapy period
                        </div>
                    </div>
                </span>
           <!-- <div class="insight-icon">
                <i class="fa fa-lightbulb-o" aria-hidden="true" id="insight" style="font-size:24px;cursor: pointer;right: 800px;"></i>
                <div class="arrow-insight" style="right: 815px;top: 34px;"></div>
                <div class="insight-content-box" style="left: 100px;">
                    <div class="insight-header">
                                    Insight - Sustained Virologic Response (SVR)
                                    Patients distributtion is done on therapy period and then on drilldown we distribute it based on genotype on given therapy period
                    </div>
                     <div class="col-md-12">
                        <div class="col-md-3 insight-image">
                            <img src="/insight-image.png" align="top" />
                        </div>
                        <div class="col-md-9 insight-body" id="analytics_efficacyTherapyDistribution" style="padding: 20px 10px;">
                        </div>
                    </div>
                </div>
            </div> -->
        </h3>
         <div   id="ap_EfficacyChart" style="width:1145px;height:400px;"> test  </div>
       </div>
        </div>
      </div>  </div> </div>`;

    //container for patient data
    let patientContentHtml = `<div class="analyticsCommonPopupPatientContent">`;
    patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRow">PatientID</div>
                                    <div class="showInRowMin">Age</div>
                                    <div class="showInRowMin">Gender</div>
                                    <div class="showInRowMin">Genotype</div>
                                    <div class="showInRow">Treatment</div>
                                    <div class="showInRowMin">Cirrhosis</div>
                                    <div class="showInRow">Viral Load</div>
                                    <div class="showInRow">Liver Disease</div>
                                    <div class="showInRowMax">Race</div>
                                    <div class="showInRow">Ethnicity</div>
                                </div>`;

    patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

    for (let i = 0; i < data.length; i++) {
        patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                                    <div class="showInRow">${data[i].patientId}</div>
                                    <div class="showInRowMin">${data[i].age}</div>
                                    <div class="showInRowMin">${getGenderType(data[i].gender)}</div>
                                    <div class="showInRowMin">${data[i].genotype}</div>
                                    <div class="showInRow" >${data[i].treatment}</div>
                                    <div class="showInRowMin">${data[i].cirrhosis}</div>
                                    <div class="showInRow">${formatViralLoadValue(data[i].viralLoad)}</div>
                                    <div class="showInRow" >${getLiverAssessmentType(data[i].AssessmentLiverDisease)}</div>
                                    <div class="showInRowMax" >${data[i].race}</div>
                                    <div class="showInRow" >${data[i].ethnicity}</div>
                                    </div>`;

    }
    patientContentHtml += '</div>';
    let html = header + contentBox + patientContentHtml;
    $('.analyticsPatientsPopup-container_eff').html(html);

    setTimeout(function () {
        $('.analyticsCommonPopupPatientContent').hide();
        $('.analyticsPatientsPopup').show();

          /**
         * @author: Arvind
         * @reviewer: 
         * @date: 26-May-2017
         * @desc: For Efficacy tab removed dependency of variable `analyticsPatientsData['patientsData']`
         * and added patientData object in pramater 
         */
        //// Old code for getting pateintdata variable
        //let parientData = analyticsPatientsData.patientsData;

        //let patientData = dataObj.patientsData;
        renderEfficacyChartsFOrPopup(dataObj.patientsData, dataObj.medicationInfo.Medication);

        $('.radioduration').on('change', function () {
            analyticsParams = AmdApp['Filters'];
            // console.log(analyticsParams.genotypes);

            var pramgeno = [];
            if (analyticsParams.genotypes != null) {
                var genotypes = analyticsParams.genotypes;

                var geno = genotypes.replace(/\'/g, "");
                var t = [];
                t = geno.split(",");

                // console.log(t);
                for (i = 0; i < t.length; i++) {
                    // console.log(t[i]);
                    pramgeno.push(t[i]);
                }

            } else
                pramgeno = null;

            // Render Overall SVR Trend chart
            container = 'ap_AggregateSVRChart';
            renderMedcationSVRTrendChart(container, dataObj.medicationInfo.Medication, pramgeno);

            $('.backToSvrTrend').hide();
            //$('.followPatientsDiv').show();

        });

        // bind show patient button click event
        $('.commonPopupShowPatientIcon').on('click', function () {
            $('.apContentBox').toggle();
            $('.analyticsCommonPopupPatientContent').toggle();
            // toggle show patiet button
            $(this).find('i').toggleClass('fa-toggle-on fa-toggle-off');
            let title = '';
            if ($(this).find('i').hasClass('fa-toggle-on')) {
                title = 'Hide Patients';
            } else {
                title = 'Show Patients';
            }
            $(this).attr('title', title);
        });
        //bind export patient button  click event
        $('.commonPopupExportPatientIcon').click(function () {
            exportPatientsData($(this), 'Adharence_' + dataObj.medicationInfo.Medication + '_Patients', data);
        });

        //bind follow same patient button  click event
        $('#followSamePatients').click(function () {
            console.log("Follow Same Patients");
            let container = 'ap_AggregateSVRChart';
            renderSVRTrendChartForPatientsWithCompleteData(container, dataObj.medicationInfo.Medication);
        });

        /**
         * @author: Pramveer
         * @date: 20th Feb 17
         * @desc: click event for the svr trend back btn
         */
        //bind click event for back button
        $('.backToSvrTrend .js-backtoSvrTrend').on('click', () => {
            $('.radioduration').trigger('change');
            $('.backToSvrTrend').hide();
            $('.followPatientsDiv').show();
        });


        /**
         * @author: Pramveer
         * @date: 20th feb 17
         * @desc: click event for the single patient journey back button
         */
        $('.backToSvrTrend .js-backtoPatients').on('click', () => {
            $('.effSvrChartWrap').show();
            $('.effSinglePatientWrap').hide();
        });

    }, 50);

}


// function renderSVRCharts(medication, rangeval) {
//     container = 'ap_AggregateSVRChart';
//     $(container).empty();
//     let filteredSRVData = AmdApp['MedicationSVR'];

//     var pramgeno = [];
//     if (analyticsParams.genotypes != null) {
//         var genotypes = analyticsParams.genotypes;

//         var geno = genotypes.replace(/\'/g, "");
//         var t = [];
//         t = geno.split(",");

//         console.log(t);
//         for (i = 0; i < t.length; i++) {
//             console.log(t[i]);
//             pramgeno.push(t[i]);
//         }

//     }
//     else
//         pramgeno = null;

//     filteredSRVData = filteredSRVData.filter(function (a) {
//         return a.MEDICATION == medication;
//     });

//     console.log(analyticsParams.cirrhosis);
//     if (analyticsParams.cirrhosis != null) {
//         filteredSRVData = filteredSRVData.filter(function (a) {
//             return a.CIRRHOSIS.toLowerCase() == analyticsParams.cirrhosis.replace(/\'/g, "");
//         });
//     }
//     console.log(analyticsParams.treatment);
//     if (analyticsParams.treatment != null) {
//         filteredSRVData = filteredSRVData.filter(function (a) {
//             return a.TREATMENT.toLowerCase() == analyticsParams.treatment.replace(/\'/g, "");
//         });
//     }
//     let genoTypes = pramgeno;
//     console.log(genoTypes);
//     if (genoTypes != null) {

//         filteredSRVData = _.filter(filteredSRVData, function (e) { for (var i = 0; i < genoTypes.length; i++) { if (e.GENOTYPE == genoTypes[i]) { return e; } } })
//     }

//     let maxweek = _.max(filteredSRVData, function (filteredSRVDataT) { return filteredSRVDataT.Weeks; });

//     let categoriesx = [];
//     let seriesy = [];
//     let maxvalue = 0;
//     let minweekval = 0;
//     let maxweekval = 0;
//     minweekval = rangeval.split('-')[0];
//     maxweekval = rangeval.split('-')[1];

//     let jsonObj = {}, filteredcount = [], dataweekcount = [];
//     for (let week = parseInt(minweekval); week <= parseInt(maxweekval); week++) {
//         let total = 0;
//         filteredcount = filteredSRVData.filter(function (a) {
//             return (a.Weeks == week);
//         });

//         for (j = 0; j < filteredcount.length; j++) {
//             total = total + parseFloat(filteredcount[j].ViralLoad);
//         }

//         let valt = 0.0;

//         if (filteredcount.length > 0 && total > 0)
//             valt = Math.log(parseFloat(total / filteredcount.length));

//         if (valt < 0)
//             valt = 0.0;

//         // valt = parseFloat(valt).toFixed(2);
//         dataweekcount.push(valt);

//         if (maxvalue < valt)
//             maxvalue = valt;

//     }
//     jsonObj['name'] = medication;
//     jsonObj['data'] = dataweekcount;
//     seriesy.push(jsonObj);
//     // console.log(seriesy);
//     for (let week = parseInt(minweekval); week <= parseInt(maxweekval); week++) {
//         categoriesx.push(week);
//     }

//     Highcharts.chart(container, {
//         chart: {
//             zoomType: 'xy'
//         },
//         title: {
//             text: ' '

//         },
//         credits: {
//             enabled: false
//         },
//         xAxis: {
//             categories: categoriesx,
//             title: {
//                 text: 'Weeks'
//             },
//         },
//         plotOptions: {
//             series: {
//                 events: {
//                     legendItemClick: function () {
//                         var visibility = this.visible ? 'visible' : 'hidden';
//                     }
//                 }
//             },
//             line: {
//                 dataLabels: {
//                     enabled: true,
//                     formatter: function () {
//                         return Highcharts.numberFormat(this.y, 2);
//                     }
//                 }
//             }
//         },
//         yAxis: {
//             // min: 0,
//             // max: maxvalue,
//             // tickInterval: 1000,
//             title: {
//                 text: 'Viral Load (in log)'
//             },
//             // labels: {
//             //     enabled: false,
//             //     format: yAxisData == '{value}'
//             // },
//             plotLines: [{
//                 value: 0,
//                 width: 1,
//                 color: '#808080'
//             }],
//             gridLineWidth: 0
//         },
//         // tooltip: {
//         //     valueSuffix: '°C'
//         // },
//         // legend: {
//         //     layout: 'vertical',
//         //     align: 'right',
//         //     verticalAlign: 'top',
//         //     borderWidth: 0
//         // },
//         legend: false,
//         series: seriesy,
//         tooltip: {
//             formatter: function () {
//                 var s = '<b> Week: </b>' + this.x;

//                 $.each(this.points, function () {
//                     s += '<br/><b>' + this.series.name + ': </b>' +
//                         this.y.toFixed(2);
//                 });

//                 return s;
//             },
//             shared: true
//         }
//     });


// }




function upperCaseFirst(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

function renderEfficacyChartsFOrPopup(patientsData, medication) {
    // console.log(patientsData);
    let container = '';
    let modifiedData = [];

    analyticsParams = AmdApp['Filters'];
    // console.log(analyticsParams.genotypes);

    var pramgeno = [];
    if (analyticsParams.genotypes != null) {
        var genotypes = analyticsParams.genotypes;

        var geno = genotypes.replace(/\'/g, "");
        var t = [];
        t = geno.split(",");

        // console.log(t);
        for (i = 0; i < t.length; i++) {
            // console.log(t[i]);
            pramgeno.push(t[i]);
        }

    } else
        pramgeno = null;

    // Render Overall SVR Trend chart
    container = 'ap_AggregateSVRChart';
    renderMedcationSVRTrendChart(container, medication, pramgeno);

    // Render Therapy distribution chart
    container = 'ap_EfficacyChart';
      /**
         * @author: Arvind
         * @reviewer: 
         * @date: 26-May-2017
         * @desc: For Efficacy tab removed dependency of variable `analyticsPatientsData['patientsData']`
         * and added patientData object in pramater 
         */
        //// Old code for getting pateintdata variable
      
    // let patientDataefficacy = analyticsPatientsData['patientsData'];
 let patientDataefficacy = patientsData;
    let chartData = getDataForTherapyChart(patientDataefficacy, medication);
    //console.log(chartData);

    renderEfficacyChart(container, chartData, medication);

    // On Hold until we comup with correct on line statement that describe the insight.  -- Commented by Yuvraj 10 Feb 17
    // let insight = new InsightInfo({
    //     tabName: 'analytics_efficacy',
    //     chartName: 'therapyDistribution',
    //     id: 'analytics_efficacyTherapyDistribution',
    //     chartData: {chartData:chartData , medication: medication}
    // });

    // insight.renderContent();

    //function to get data & drill down data for chart
    function getDataForTherapyChart(treatedPatients, medication) {



        treatedPatients = treatedPatients.filter(function (a) {
            return a.SVR12 != null && a.Medication == medication;
        });

        let groupedDatatreatmentPeriod = _.groupBy(treatedPatients, 'treatmentPeriod');

        let mainData = [],
            drillDown = [],
            totalPats = treatedPatients.total;


        for (let key in groupedDatatreatmentPeriod) {

            let filteredData = groupedDatatreatmentPeriod[key];

            //prepare Age Group Object
            let weekObj = {
                name: key,
                y: getEfficacy(filteredData),
                patientCount: filteredData.length,
                drilldown: key
            };
            //push into main array
            mainData.push(weekObj);

            drillDown.push({
                name: key,
                id: key,
                data: getDrillDownData(filteredData)
            });
        }



        //return final object
        return {
            mainData: mainData,
            drillDown: drillDown,
        };

        function getDrillDownData(categoryArray) {
            if (!categoryArray.length) {
                return [];
            }
            let drillDownArr = [];
            categoryArray = getDataByGenotype(categoryArray);

            for (let i = 0; i < categoryArray.length; i++) {
                let innerArr = [];
                let drilldownObj = {}
                drilldownObj = {
                    name: categoryArray[i].genotype,
                    y: categoryArray[i].efficacy,
                    patientCount: categoryArray[i].count
                }
                drillDownArr.push(drilldownObj);
            }
            return drillDownArr;
        }



        //function to get genotype wise count for patients
        function getDataByGenotype(data) {
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
                    count: genData.length,
                    efficacy: getEfficacy(genData),
                    total: data.length
                });
            }

            return genotypeData;
        }



        function getEfficacy(dataArray) {
            // console.log(dataArray);

            let total_count = 0,
                med_count = 0,
                totalCuredPatients = 0;

            if (!dataArray.length) {
                return 0;
            }

            for (let j = 0; j < dataArray.length; j++) {
                if (dataArray[j].SVR12 != null) {
                    med_count = parseInt(dataArray[j]['total']);
                    total_count += med_count;
                    if (parseInt(dataArray[j].SVR12) == 1) {
                        totalCuredPatients += 1;
                    }
                }

            }
            let efficacy = 0;
            if (parseFloat(totalCuredPatients) > 0 && parseFloat(total_count) > 0) {
                efficacy = (parseFloat(totalCuredPatients) * 100) / parseFloat(total_count);
            }

            return parseFloat(efficacy.toFixed(2));

        }

    }

}



//function to prepare dom for patients data
export function prepareDomForPatients(data, dataObj) {

    $('.analyticsPatientsPopup').empty();
    let MainHtml = `<div class="popup-inner" style='width: 1280px!important; height: 648px; padding: 20px;'>
	<button type="button" class="close analytics_closebtn" style="margin-top:5px; margin-right:10px"><span aria-hidden="true">×</span></button>
                <div class="analyticsPatientsPopup-header"></div>
      			<div class="analyticsPatientsPopup-container"></div>
    </div>`;
    $('.analyticsPatientsPopup').html(MainHtml);
    $('.analyticsPatientsPopup-container').empty();
    if (analyticsPatientsData['DrugGenotypeData'] == null)
        analyticsPatientsData['DrugGenotypeData'] = AmdApp['DrugByGenotype'];
    analyticsPatientsData['DrugGenotypePreparedData'] = prepareDrugGenotype(_.groupBy(analyticsPatientsData['DrugGenotypeData'], 'genotype'), dataObj.medicationInfo.Medication);
    let headerHtml = '<div class="ecf-labelText">Drug Name: </div>' +
        '<div class="ecf-valueText">' + dataObj.medicationInfo.Medication + ' (' + dataObj.medicationInfo.treatmentPeriod + 'W)</div>';
    // console.log(AmdApp['DrugByGenotype']);
    let patientsHtml = `<div style="width: 100%;float: left;position: relative;">`;
    if (dataObj.subTab == 'efficacy') {
        patientsHtml += `<div class="subpopDetail costBurdenSection col-md-12" style="float: left; margin-bottom: 10px;border: 1px solid #efefef;padding: 10px;"></div>`;
    }
    let innerHtml = '<div class="ecf-patientContainer mlPatientsDetailWrapper">';
    let container;
    var allDrugData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];

    // updated Patient selected object as par search result
    /*
    var patientData = PatientDataList.filter(function (i) {
        return i.PatientID == Router.PatientId
    });
    */
    var patientData = AmdApp['SelectedPatient'];
    if (dataObj.subTab == 'utilization') {
        innerHtml = '<div class="ecf-utilizationContainer mlPatientsDetailWrapper">';
        $('.analyticsPatientsPopup-container').addClass('groupUtilizationPopup');
        $('.analyticsPatientsPopup-container').attr('style', 'padding: 10px 3px;width: calc(100% - 10px);float: left;overflow: auto;height: 520px;');
        $('.analyticsPatientsPopup-footer').attr('style', 'height: 40px;text-align: center;width: 100%;float: left;');
        $('.popup-inner').attr('style', 'width: 80%;height: auto;');
        var filterdata = dataObj.filterdata;
        
        if (filterdata == "geoLocation") {
            patientsHtml = '<div class="subpopDetail costBurdenSection col-md-12" style="float: left; margin-bottom: 10px;border: 1px solid #efefef;padding: 10px;"><div class="col-md-3" style="float:right;">' +
                '<div class="ecf-switchview"><a href="#" class="js-showMediPateintsChart">Switch to Population health View</a></div>' +
                '</div></div><div class="populationHealthView col-sm-12" style="display:none;">' +
                '<div class="col-sm-1">' +
                '<div class="cpbackbtn populationHealthViewBack" style="margin-left: -15px;margin-top: 0px;">' +
                '<a href="#" class=""><span class="" style="margin-right:10px"><i class="fa fa-chevron-left" aria-hidden="true"></i></span>back</a></div></div>' +
                '<div class="col-sm-10"><div class="chartHeading" style="text-align: center;">Population Health View</div></div>' +
                '<div class="genotypeChart boxContainerDashboard col-sm-6">' +
                '<div class="chartHeading" style="text-align: center;">Genotype Distribution</div><div id="genotypeChart" style="height: 380px;"></div></div>' +
                '<div class="geoPopulationSection boxContainerDashboard col-sm-6">' +
                '<div class="chartHeading" style="text-align: center;">Geo Location</div><div id="geoPopulationSection" style="height: 360px;margin-bottom: 20px;"></div></div></div>' +
                '<div class="geoSection boxContainerDashboard col-sm-12">' +
                '<div class="chartHeading" style="text-align: center;">Geo Location</div>' +
                '<div id="geoUtilization" style="height: 380px;"></div>' +
                '</div>';
            container = "geoUtilization";
            $('.analyticsPatientsPopup-container').html(patientsHtml);
            $('.analyticsPatientsPopup-header').html(headerHtml);
            $('.subpopDetail').prepend($('.efd-table-data').html());
            $('.subpopDetail > .col-md-2').slice(-2).remove();
            $('.analyticsPatientsPopup').show();
            renderLocationMapChart(container, data, null);
            setTimeout(function () {
                $('.js-showMediPateintsChart').click(function () {
                    $('.geoSection').hide();
                    $('.subpopDetail').hide();
                    $('.populationHealthView').show();
                    // Update for medication field name to solve groupby.
                    
                    var tempdata = _.groupBy(analyticsPatientsData['DrugGenotypeData'], 'MEDICATION');
                    genotypeVsUtilizationChart('#genotypeChart', analyticsPatientsData['DrugGenotypePreparedData'], dataObj.medicationInfo.Medication, null);
                    renderLocationMapChart('geoPopulationSection', tempdata[dataObj.medicationInfo.Medication], null);
                });
                $('.populationHealthViewBack').click(function () {
                    $('.geoSection').show();
                    $('.subpopDetail').show();
                    $('.populationHealthView').hide();
                    $('#geomapUtilizationReset').remove();
                });
            }, 50);
            return;
        } else if (filterdata == "me") {
            // data = _.where(data, {
            //     providerId: 182
            // });

            patientsHtml += '<div class="meChartSection boxContainerDashboard col-sm-12">' +
                '<div class="chartHeading" style="text-align: center;">Provider Utilization</div>' +
                '<div class="meUtilization" ></div>' +
                '</div>';
            container = "meUtilization";
        } else if (filterdata == "mynetwork") {
            data = analyticsPatientsData['mynetworkutilization'];
            data = _.where(data, {
                Medication: dataObj.medicationInfo.Medication
            });
            patientsHtml += '<div class="myNetworkChartSection boxContainerDashboard col-sm-12">' +
                '<div class="chartHeading" style="font-size: 14px !important;text-align: center;">My Network Utilization</div>' +
                '<div class="myNetworkUtilization" ></div>' +
                '</div>';
            container = "myNetworkUtilization";
        } else {
            patientsHtml += '<div class="populationChartSection boxContainerDashboard col-sm-12">' +
                '<div class="chartHeading" style="font-size: 14px !important;text-align: center;">Poupulation Health Utilization</div>' +
                '<div class="populationUtilization" ></div>' +
                '</div>';
            container = "populationUtilization";
        }
    } else if (dataObj.subTab == 'efficacy') {
        innerHtml = '<div class="ecf-utilizationContainer mlPatientsDetailWrapper" style="display:none;">';
        $('.analyticsPatientsPopup-container').addClass('groupUtilizationPopup');
        $('.analyticsPatientsPopup-container').attr('style', 'padding: 10px 3px;width: calc(100% - 10px);float: left;overflow: auto;height: 520px;');
        $('.analyticsPatientsPopup-footer').attr('style', 'height: 40px;text-align: center;width: 100%;float: left;');
        $('.popup-inner').attr('style', 'width: 80%;height: auto;');
        patientsHtml += '<div class="efficacySVRData boxContainerDashboard col-sm-12">' +
            '<div class="chartHeading" style="text-align: center;">Aggregate SVR Data</div>' +
            '<div id="svrData" ></div>' +
            '</div>';
        container = "svrData";
    }
    patientsHtml += `<div class="ecf-patientsHeader" style="width: 100%;float: left;position: relative;">
                            <div class="showInRow">PatientID</div>
                            <div class="showInRow">Age</div>
                            <div class="showInRow">Gender</div>
                            <div class="showInRow">Genotype</div>
                            <div class="showInRow">Treatment</div>
                            <div class="showInRow">Cirrhosis</div>
                            <div class="showInRow">Viral Load</div>
                            <div class="showInRow">Liver Disease</div>
                        </div>`;
    for (let i = 0; i < data.length; i++) {
        innerHtml += '<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="' + data[i].patientId + '" id="' + data[i].patientId + '_PRow">' +
            '<div class="showInRow">' + data[i].patientId + '</div>' +
            '<div class="showInRow">' + data[i].age + '</div>' +
            '<div class="showInRow">' + getGenderType(data[i].gender) + '</div>' +
            '<div class="showInRow">' + data[i].genotype + '</div>' +
            '<div class="showInRow">' + data[i].treatment + '</div>' +
            '<div class="showInRow">' + data[i].cirrhosis + '</div>' +
            '<div class="showInRow">' + formatViralLoadValue(data[i].viralLoad) + '</div>' +
            '<div class="showInRow">' + getLiverAssessmentType(data[i].AssessmentLiverDisease) + '</div>' +
            '<div class="showInRow optimizeIcon"></div>' +
            '</div>';

        //innersection div to be displayed on click
        //for efficacy tab
        if (dataObj.subTab == 'efficacy') {
            innerHtml += `<div class="ecf-patientDetailSection" id="+${data[i].patientId}_detailSection">
                            <div class="patientChartSection col-sm-6 ecf-svrFactors efc-cureStatusStyle">
                                 <div class="chartHeading">Treatment Result: ${getCureStatus(data[i].isCured)}</div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">Age: </div>
                                    <div class="efd-cell2">${data[i].age}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">Weight: </div>
                                    <div class="efd-cell2">${data[i].weight} (lbs)</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">Race: </div>
                                    <div class="efd-cell2">${data[i].race}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">Apri: </div>
                                    <div class="efd-cell2">${data[i].labs_apri}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">AST: </div>
                                    <div class="efd-cell2">${data[i].labs_ast} (IU/L)</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">INR: </div>
                                    <div class="efd-cell2">${data[i].labs_inr}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">Meld Score: </div>
                                    <div class="efd-cell2">${data[i].labs_meld}</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">Platelets: </div>
                                    <div class="efd-cell2">${data[i].labs_platelets} (10^9/L)</div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="efd-cell1">Bilirubin: </div>
                                    <div class="efd-cell2">${data[i].labs_total_bilirubin} (mg/dL)</div>
                                </div>
                            </div>
                            <div class="patientChartSection col-sm-6">
                                <div class="chartHeading">SVR Data</div>
                                <div class="ecfPatient-svrData" id="ecfPatient${data[i].patientId}_svrData"></div>
                            </div>
                            <div class="patientChartSection col-sm-6">
                                <div class="chartHeading">Cure Rate by Gender</div>
                                <div class="ecfPatient-genderCure" id="ecfPatient${data[i].patientId}_genderCure"></div>
                            </div>
                            <div class="patientChartSection col-sm-6">
                                <div class="chartHeading">Cure Rate by Age Group</div>
                                <div class="ecfPatient-ageCure" id="ecfPatient${data[i].patientId}_AgeCure"></div>
                            </div>
                            <div class="patientChartSection col-sm-6">
                                <div class="chartHeading">Cure Rate by Race</div>
                                <div class="ecfPatient-raceRate" id="ecfPatient${data[i].patientId}_RaceCure"></div>
                            </div>
                            <div class="patientChartSection col-sm-6">
                                <div class="chartHeading">Potential For Cure</div>
                                <div class="ecfPatient-cureRate" id="ecfPatient${data[i].patientId}_CureRate"></div>
                            </div>
                        </div>`;

            for (let i = 0; i < (dataObj.medicationInfo.treatmentPeriod / 4); i++) {
                if (averageSVR[i] == null || isNaN(averageSVR[i])) {
                    averageSVR[i] = parseFloat((Math.random() * (2.58 - 0.24) + 0.24).toFixed(2));
                } else {
                    averageSVR[i] += parseFloat((Math.random() * (2.58 - 0.24) + 0.24).toFixed(2));
                }
            }

        } else if (dataObj.subTab == 'utilization') {
            innerHtml += '<div class="ecf-patientDetailSection" id="' + data[i].patientId + '_detailSection">' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">GenoType</div>' +
                '<div class="efd-cell2">' + data[i].genotype + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Viral Load</div>' +
                '<div class="efd-cell2">' + data[i].viralLoad + 'M</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Age</div>' +
                '<div class="efd-cell2">' + data[i].age + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Weight</div>' +
                '<div class="efd-cell2">' + data[i].weight + ' (Kg)</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Ethnicity</div>' +
                '<div class="efd-cell2">' + data[i].ethnicity + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Race</div>' +
                '<div class="efd-cell2">' + data[i].race + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Alcohol</div>' +
                '<div class="efd-cell2">' + data[i].alcohol + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Renal Failure</div>' +
                '<div class="efd-cell2">' + (data[i].renalFailure == 0 ? 'No' : 'Yes') + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Mental Health</div>' +
                '<div class="efd-cell2">' + (data[i].mentalHealth == 0 ? 'No' : 'Yes') + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">HIV</div>' +
                '<div class="efd-cell2">' + (data[i].HIV == 0 ? 'No' : 'Yes') + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Treatment</div>' +
                '<div class="efd-cell2">' + data[i].treatment + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Cirrhosis</div>' +
                '<div class="efd-cell2">' + data[i].cirrhosis + '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                '<div class="efd-cell1">Assessment Liver Disease</div>' +
                '<div class="efd-cell2">' + data[i].AssessmentLiverDisease + '</div>' +
                '</div>' +
                '</div>';
        }
        //for adherence tab
        else {
            innerHtml += '<div class="ecf-patientDetailSection" id="' + data[i].patientId + '_detailSection">' +
                '<div class="patientChartSection col-sm-6">' +
                '<div class="chartHeading">Additional Drugs</div>' +
                '<div class="ecfPatient-drugX" id="ecfPatient' + data[i].patientId + '_DrugX"></div>' +
                '</div>' +
                /*  remove adherence treated/treating & average chart
                 '<div class="patientChartSection col-sm-6">' +
                 '<div class="chartHeading">Treated v/s Treating Patients</div>' +
                 '<div class="ecfPatient-treatedvsTreating" id="ecfPatient' + data[i].patientId + '_TreatedTreating"></div>' +
                 '</div>' +
                 '<div class="patientChartSection col-sm-6">' +
                 '<div class="chartHeading">Average Adherence</div>' +
                 '<div class="ecfPatient-avgAdherence" id="ecfPatient' + data[i].patientId + '_AvgAdherence"></div>' +
                 '</div>' +
                 */
                '<div class="patientChartSection col-sm-6">' +
                '<div class="chartHeading">Age Distribution</div>' +
                '<div class="ecfPatient-ageDistribution" id="ecfPatient' + data[i].patientId + '_AgeDistribution"></div>' +
                '</div>' +
                '<div class="patientChartSection col-sm-6">' +
                '<div class="chartHeading">Gender Distribution</div>' +
                '<div class="ecfPatient-genderDistribution" id="ecfPatient' + data[i].patientId + '_GenderDistribution"></div>' +
                '</div>' +
                '<div class="patientChartSection col-sm-6" style="height:250px;">' +
                '<div class="chartHeading">Location Map</div>' +
                '<div class="ecfPatient-locationMap" id="ecfPatient' + data[i].patientId + '_LocationMap" style="height:80%;"></div>' +
                '</div>' +
                '</div>';
        }
    }
    innerHtml += '</div>';

    patientsHtml += innerHtml + '</div>';

    $('.analyticsPatientsPopup-container').html(patientsHtml);

    if (dataObj.subTab == 'utilization') {
        // var enddate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        // var tempdate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        // var startdate = new Date(tempdate.setFullYear(tempdate.getFullYear() - 1));
        // var tempdata = data.filter(function(el) {
        //     return el.admissionDate <= enddate && el.admissionDate > startdate
        // });

        var finalchartdata = [];
        data.forEach(function (o) {
            var cdata = {};
            cdata["year"] = o.Year;
            cdata["count"] = 1;
            var temp = _.where(finalchartdata, {
                year: o.Year
            });
            if (temp.length > 0) {
                $.each(finalchartdata, function () {
                    if (this.year == temp[0].year) {
                        this.count += 1;
                    }
                });
            } else
                finalchartdata.push(cdata);
        });
        var subPopulationData = {};
        subPopulationData[patientData[0].Genotype] = finalchartdata;
        PopulationUtilizationChart("." + container, subPopulationData, null, filterdata);
    } else if (dataObj.subTab == 'efficacy') {
        $('.subpopDetail').prepend($('.efd-table-data').html());
        $('.subpopDetail > .col-md-2').slice(-2).remove();
        $('.subpopDetail').append(`<div class="col-md-2" style="float:right;">
                        <div class="efd-cell1 efd-exportPatiens" style="width:25px;"></div>
                        <div class="efd-cell2_subpopulaiton ecf-exportPatient efficacyMediExportPatient"><a href="#">Export Patients</a></div>
                    </div><div class="col-md-2" style="float:right;">
                        <div class="efd-cell1 efd-showPatiens js-showMediPateintsList" style="width:40px;"></div>
                        <div class="efd-cell2_subpopulaiton ecf-showPatient"><a href="#" class="js-showMediPateintsList">Show Patients</a></div>
                    </div>`);
        $('.ecf-patientsHeader').hide();
        for (let i = 0; i < 10; i++) {
            averageSVR[i] = averageSVR[i] / data.length;
        }
        renderSVRDataChart(container, averageSVR);
    }
    $('.analyticsPatientsPopup-header').html(headerHtml);
    if (data.length <= 0) {
        $('.groupUtilizationPopup').html('<div style="text-align: center;margin-top: 18%;">No Data Found</div>');
    }
    setTimeout(function () {
        $('.js-ecf-patientRow').click(function () {
            handleRowClick($(this), dataObj.subTab, dataObj.medicationInfo);
        });
        $('.js-showMediPateintsList').click(function () {
            $('.ecf-patientsHeader').show();
            $('.ecf-utilizationContainer').show();
        });
        $('.efficacyMediExportPatient').click(function () {
            exportPatientsData($(this), 'Efficacy_' + dataObj.medicationInfo.Medication + '_Patients', data);
        });
        $('.analyticsPatientsPopup').show();
    }, 50);
}
export function prepareAdherencePopup(data, dataObj) {
    let params = AmdApp['Filters'];

    let geno = params.genotypes ? params.genotypes.replace(/\'/g, "") : 'All';
    let treat = params.treatment ? (params.treatment.replace(/\'/g, "") != 'naive,experienced' ? upperCaseFirst(params.treatment.replace(/\'/g, "")) : 'All') : 'All';
    let cirr = params.cirrhosis ? (params.cirrhosis.replace(/\'/g, "") != 'Yes,No' ? params.cirrhosis.replace(/\'/g, "") : 'All') : 'All';
    let uniquePatientPerCategory = _.uniq(_.pluck(data,'patientId')).length;
    $('.analyticsPatientsPopup').empty();
    let MainHtml = `<div class="popup-inner" style='width: 1280px!important; height: 648px; padding: 20px;overflow-y:auto;'>
	<button type="button" class="close analytics_closebtn" style="margin-top:5px; margin-right:10px"><span aria-hidden="true">×</span></button>
    <div class="analyticsPatientsPopup-header"></div>
      			<div class="analyticsPatientsPopup-container"></div>`;
    // header section
    let headerHtml = `
	<div class="analyticsCommonPopupHeader">
    <div class="analyticsCommonPopupHeaderInner">
		<div class="analyticsCommonPopupDrugName">
				 ` + dataObj.medicationInfo.Medication + `
		</div>
        <div class="analyticsCommonPopupFilterDesc">
				 <div class="analyticsCommonPopupFilterDescTitle">Genotype:</div>
                 <div class="analyticsCommonPopupFilterDescValue">` + geno + `</div>
		</div>
        <div class="analyticsCommonPopupFilterDesc">
				 <div class="analyticsCommonPopupFilterDescTitle">Treatment:</div>
                 <div class="analyticsCommonPopupFilterDescValue">` + treat + `</div>
		</div>
        <div class="analyticsCommonPopupFilterDesc">
				 <div class="analyticsCommonPopupFilterDescTitle">Cirrhosis:</div>
                 <div class="analyticsCommonPopupFilterDescValue">` + cirr + `</div>
		</div>
		<div class="analyticsCommonPopupOptions">
               <div class="analyticsCommonPopupOptionsButton commonPopupPatientCount"  title="Patient Count"><span style="cursor: default;"><i class="fa fa-users" aria-hidden="true"></i></span><p> ` + uniquePatientPerCategory+ `</p></div>
               <div title="Show Patients" class="analyticsCommonPopupOptionsButton commonPopupShowPatientIcon" ><span><i class="fa fa-toggle-off" aria-hidden="true"></i></span></div>
               <div title="Export Patients" class="analyticsCommonPopupOptionsButton commonPopupExportPatientIcon"><span><i class="fa fa-share-square-o" aria-hidden="true"></i></span></div>
        </div>
        </div>
	</div>`;
    // chart section
    let chartContentHtml = `
        <div class="analyticsAdherencePopupChartContent">
                    <div class="analyticsAdherencePopupMainChart">
                        <div class="">
                            <div class="AdherenceHeaderChart" >Location Map
                            <span class="macLearningsubTabs-infoIcon mlInfoTip">
                                        <div class="analytics-tooltip mlInfoTip_tooltip">
                                        <div class="analytics-tooltipBody" style="font-size: 13px;">
                                         <span class='boldfnt'>N:</span> `+uniquePatientPerCategory+` ( `+(((uniquePatientPerCategory/dataObj.medicationInfo.uniquePatients)*100).toFixed(2))+` %) is out of Total Patients - ` +dataObj.medicationInfo.uniquePatients+ `<br>
                                        </div>
                                         </div>
                                </span>
                            </div>
                            <div class="analyticsAdherencePopupLocationMap" id="ecfPatient_adherence_LocationMap"></div>
                        </div>
                    </div>
                    <div class="analyticsAdherencePopupMainChart">
                            <div class="analyticsAdherencePopupChartBox">
                                <div class="AdherenceChartContent">
                                    <div class="">
                                      Age Distribution 
                                      <span class="macLearningsubTabs-infoIcon mlInfoTip">
                                        <div class="analytics-tooltip mlInfoTip_tooltip">
                                        <div class="analytics-tooltipBody" style="font-size: 13px;">
                                         <span class='boldfnt'>N:</span> `+uniquePatientPerCategory+` ( `+(((uniquePatientPerCategory/dataObj.medicationInfo.uniquePatients)*100).toFixed(2))+` %) is out of Total Patients - ` +dataObj.medicationInfo.uniquePatients+ `<br>
                                         <span class='boldfnt'>Defination :</span> This chart represent the Age distribution of the patients as per Adherence. 
                                        </div>
                                         </div>
                                         </span>
                                      </div>
                                    <div  id="ecfPatient_adherence_AgeDistribution" class="analyticsAdherencePopupAgeDistribution"></div>
                                </div>
                            </div>
                    <!-- <div class="analyticsAdherencePopupChartBox">
                        <div class="AdherenceChartContent">
                            <div class="">Gender Distribution</div>
                            <div id="ecfPatient_adherence_GenderDistribution" ></div>
                        </div>
                    </div>-->
                </div>
            <div class="analyticsAdherencePopupMainChart" style="width:100%;">
                <div class="" style="width:100%;border:1px solid #ddd;margin-top:30px;">
                     <h3 style="text-align: left;margin-left: 10px;">Therapy Distribution
                     <span class="macLearningsubTabs-infoIcon mlInfoTip">
                    <div class="analytics-tooltip mlInfoTip_tooltip">

                        <div class="analytics-tooltipBody" style="font-size: 13px;">
                         <span class='boldfnt'>N:</span> `+uniquePatientPerCategory+` ( `+(((uniquePatientPerCategory/dataObj.medicationInfo.uniquePatients)*100).toFixed(2))+` %) is out of Total Patients - ` +dataObj.medicationInfo.uniquePatients+ `<br>
                         <span class='boldfnt'>Medication Records:</span> `+uniquePatientPerCategory+` (`+(((uniquePatientPerCategory/dataObj.medicationInfo.totatPatients)*100).toFixed(2))+` %) is out of Total Medication Patients - `+dataObj.medicationInfo.totatPatients+`
                         <br>Therapy Distribution for Undetectable SVR. <br>
                        </div>
                    </div>
                </span></h3>
                    <div class="analyticsAdherenceTherapyDistributionChart" id="ecfPatient_adherence_TherapyDistribution"></div>
                </div>
            </div>
        </div>`;

    //container for patient data
    let patientContentHtml = `<div class="analyticsCommonPopupPatientContent">`;
    patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRow">PatientID</div>
                                    <div class="showInRowMin">Age</div>
                                    <div class="showInRowMin">Gender</div>
                                    <div class="showInRowMin">Genotype</div>
                                    <div class="showInRow">Treatment</div>
                                    <div class="showInRowMin">Cirrhosis</div>
                                    <div class="showInRow">Viral Load</div>
                                    <div class="showInRow">Liver Disease</div>
                                    <div class="showInRowMax">Race</div>
                                    <div class="showInRow">Ethnicity</div>
                                </div>`;

    patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

    for (let i = 0; i < data.length; i++) {
        patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                                    <div class="showInRow">${data[i].patientId}</div>
                                    <div class="showInRowMin">${data[i].age}</div>
                                    <div class="showInRowMin">${getGenderType(data[i].gender)}</div>
                                    <div class="showInRowMin">${data[i].genotype}</div>
                                    <div class="showInRow" >${data[i].treatment}</div>
                                    <div class="showInRowMin">${data[i].cirrhosis}</div>
                                    <div class="showInRow">${formatViralLoadValue(data[i].viralLoad)}</div>
                                    <div class="showInRow" >${getLiverAssessmentType(data[i].AssessmentLiverDisease)}</div>
                                    <div class="showInRowMax" >${data[i].race}</div>
                                    <div class="showInRow" >${data[i].ethnicity}</div>
                                    </div>`;
    }
    patientContentHtml += '</div>';
    MainHtml += headerHtml;
    MainHtml += chartContentHtml;
    MainHtml += patientContentHtml;
    MainHtml += `</div>`;


    $('.analyticsPatientsPopup').html(MainHtml);
    $('.analyticsPatientsPopup').show();
    $('.analyticsCommonPopupPatientContent').hide();

    // bind show patient button click event
    $('.commonPopupShowPatientIcon').on('click', function () {
        $('.analyticsAdherencePopupChartContent').toggle();
        $('.analyticsCommonPopupPatientContent').toggle();
        // toggle show patiet button
        $(this).find('i').toggleClass('fa-toggle-on fa-toggle-off');
        let title = '';
        if ($(this).find('i').hasClass('fa-toggle-on')) {
            title = 'Hide Patients';
        } else {
            title = 'Show Patients';
        }
        $(this).attr('title', title);
    });
    //bind export patient button  click event
    $('.commonPopupExportPatientIcon').click(function () {
        exportPatientsData($(this), 'Adharence_' + dataObj.medicationInfo.Medication + '_Patients', data);
    });


    let treatedPatients = data;

    renderAgeDistributionChart('ecfPatient_adherence_AgeDistribution', treatedPatients);

    // renderGenderDistributionChart('ecfPatient_adherence_GenderDistribution', treatedPatients);

    // Update Calculation for adherence for each patient and grouping by zipcode
    let patientDataGroupByZipCode = _.groupBy(treatedPatients, (rec) => {
        return rec.zipcode;
    });
    let finalData = [];
    for (let key in patientDataGroupByZipCode) {
        let patientJsonObj = {},
            MRP = 0;
        patientJsonObj.zipcode = parseInt(key);
        patientJsonObj.patientCount = patientDataGroupByZipCode[key].length;
        //Calculating avg adherence for each zipcode
        _.map(patientDataGroupByZipCode[key], (rec) => {
            MRP += parseFloat((parseFloat(rec.days_med) / (parseFloat(rec.treatmentPeriod) * 7)) * 100);
        });
        patientJsonObj.MRP = parseFloat(parseFloat(MRP) / patientJsonObj.patientCount).toFixed(2);
        if (patientJsonObj.MRP) {
            finalData.push(patientJsonObj);
        }
    }

    renderLocationMapChartForAdherence('ecfPatient_adherence_LocationMap', finalData, null);

    renderAdherenceTherapyDisributionChart('ecfPatient_adherence_TherapyDistribution', treatedPatients, dataObj.medicationInfo.Medication);

}
//function to render Location Map
export function renderLocationMapChartForAdherence(container, treatedPatients, patientId) {
    if (treatedPatients && treatedPatients.length <= 0) {
        fnNoDataFound('#' + container);
        return;
    }
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(41.013843, -105.115165);
    let chartZoom = 3;

    let myOptions = {
        zoom: chartZoom,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    let map = new google.maps.Map(document.getElementById(container), myOptions);

    let count = treatedPatients.length;
    _.each(treatedPatients, function (data) {
        let content = "<b>Patient Count:</b> " + data.patientCount + '<br />' + "<b>Avg Adherence:</b> " + data.MRP + "%";
        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + data.zipcode + '&sensor=false&components=country:US', null, (response, status) => {
            //console.log(response);
            //null check for location info
            if (response.status == google.maps.GeocoderStatus.OK) {
                let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;
                map.setCenter(location);
                let marker = new google.maps.Marker({
                    map: map,
                    position: location
                });

                // Updated Info window

                let infowindow = new google.maps.InfoWindow();

                google.maps.event.addListener(marker, 'mouseover', (function (marker, content, infowindow) {
                    return function () {
                        infowindow.setContent(content);
                        infowindow.open(map, marker);
                    };
                })(marker, content, infowindow));

                // assuming you also want to hide the infowindow when user mouses-out
                marker.addListener('mouseout', function () {
                    infowindow.close();
                });

                map.setCenter(latlng);
                // let marker = new google.maps.Marker({
                //         map: map,
                //         position: latlng
                // });
                //google.maps.event.trigger(map, 'resize');

            }
        });
    });
}


function DrawGeoLocationByGenotype(drugName, zipCode) {
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(41.013843, -105.115165);
    let myOptions = {
        zoom: 3,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    $('#geomapUtilizationReset').remove();
    $('#genotypeGeoLocationMap').prev().append('<div id="geomapUtilizationReset" title="Reset" class="utilizationReset" drugName="' + drugName + '" style="visibility: visible;left: 2%; top: 8px;" ></div>');
    $('#geomapUtilizationReset').click(function () {
        var drugName = $(this).attr('drugName');
        //prepare filters for medicaiton and treatmentPeriod
        //   let genotypeFilter = {};
        //     genotypeFilter.MEDICATION = dataObj.Medication;
        //   genotypeFilter.treatmentPeriod = dataObj.medicationInfo.treatmentPeriod;
        // added treatment period filtering.
        //  let genotypeFilterData = _.where( AmdApp['DrugByGenotype'],genotypeFilter);
        //var tempdata = _.groupBy(genotypeFilterData, 'MEDICATION');
        var data = AmdApp['TempDrugByGenotypeFilterData'];
        var zipCode = _.uniq(_.pluck(data, 'zipcode'));
        $('#geomapUtilizationReset').remove();
        DrawGeoLocationByGenotype(drugName, zipCode);
    });
    let map = new google.maps.Map(document.getElementById('genotypeGeoLocationMap'), myOptions);
    _.each(zipCode, function (value) {
        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + value + '&sensor=false&components=country:US', null, (response) => {
            //console.log(response);
            //null check for location info
            let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;

            map.setCenter(location);
            let marker = new google.maps.Marker({
                map: map,
                position: location
            });
            google.maps.event.trigger(map, 'resize');
        });
    });


}

function genotypeUtilizationChart(containerName, data, drugName, sizeParams) {

    var chartData = [];
    var groups = [drugName];
    var title = [];
    var yColumnData = 'savings';
    var YAxisLabelText = 'Patient Count';
    totalDisplayPatients = [];
    chartData = data["data"];
    // console.log(chartData);
    d3.select(containerName).selectAll("*").remove();
    var chart = c3.generate({
        bindto: containerName,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'genotype',
                value: groups
            },
            groups: [groups],
            order: 'null',
            labels: {
                format: function (v, id, i, j) {
                    if (containerName == "#subpopulationChartsPopup-container") {
                        if (i != undefined) {
                            return commaSeperatedNumber(chartData[i].total);
                        } else {
                            //return i+'/'+j +'/'+v;
                        }
                    }
                },
            },
            onclick: function (options) {
                // console.log(chartData[options.x].genotype);
                DrawGeoLocationByGenotype(chartData[options.x].Drug, chartData[options.x].zipcode);
            },
        },
        size: {
            height: sizeParams ? sizeParams.height : 380,
            width: sizeParams ? sizeParams.width : 420
        },
        color: {
            //pattern: ['#abd6ba', '#2e7e97']
            //update color pattern.
            pattern: ['#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
        },
        padding: {
            top: 5,
            right: 0,
            bottom: 10,
            left: 60,
        },
        axis: {
            x: {
                type: 'category',
                label: {
                    text: 'GenoTypes',
                    position: 'outer-center',
                },
            },
            y: {
                label: {
                    text: YAxisLabelText,
                    position: 'outer-middle'
                }
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
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                var dataObj = d[0];
                var countValue = 0,
                    id = dataObj.id;
                // var filterData = chartData.filter(function(rec) {
                //     return rec[id] == dataObj.value;
                // });
                var filterData = chartData[dataObj.index];
                var $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                countValue = filterData[drugName];
                // if (id == 'Cirrhosis')
                //     countValue = filterData[0]['cirrhosis_count'];
                // else
                //     countValue = filterData[0]['nonCirrhosis_count'];

                var html = '',
                    valueLabel = 'Patient Count';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Genotype: ' + filterData.genotype + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    // '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + countValue + '</div>' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div> ' + valueLabel + ': ' + commaSeperatedNumber(dataObj.value) + '</div>' +
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
// This Function Creates Utilization Chart with respective to gorups in the popup.
// This chart has been created by taking reference through cure rate chart.
function PopulationUtilizationChart(containerName, chartData, sizeParams, filterdata) {
    var data = [];

    if (!chartData) {
        $(containerName).append('<div style="text-align: center;margin-top: 18%;">No Data Found</div>');
        return;
    } else {

        // Variables used for C3js Data.
        var groups = _.uniq(_.keys(_.groupBy(chartData, 'genotype')));
        var patientCountKey;
        var totalpatients = 0;
        var barcolor = "#e95a52";
        var flag = false;
        var LabelText;
        // Preparing Objects as per the data requirement according to C3.js Stacked Chart.
        //grouping by year to calculating count by genotype
        let genotypeGroup = _.groupBy(chartData, 'Year');
        // calculating patient count by year
        _.each(genotypeGroup, function (value, key) {
            // count by genotype
            let dataCount = _.countBy(value, 'genotype');
            for (let i = 0; i < groups.length; i++) {
                if (!dataCount[groups[i]]) {
                    dataCount[groups[i]] = 0;
                }
                
                let genotype = groups[i];
                let currGenoData = _.where(value, {
                    genotype: genotype
                });
               
                let providerCount = getUniqueArray(_.pluck(currGenoData, 'providerId')).length;
              
                //swap the patient count with provider count
                dataCount[genotype + '_Patients'] = dataCount[genotype];
                dataCount[genotype + '_Providers'] = providerCount;
                if (filterdata == "me") {
                    dataCount[genotype] = providerCount;
                    flag = true;
                } else {
                    dataCount[genotype] = dataCount[genotype];
                }
                if(flag){
                    LabelText = "Provider Count";
                }else
                    LabelText = "Patient Count";
            }
            // prepare data for chart
            dataCount.utilization = key;
            data.push(dataCount);

        });

        if (containerName == "#myNetworkUtilization")
            barcolor = "#69bae7";
        else if (containerName == "#populationUtilization")
            barcolor = "#2e7e97";
    }
    // console.log("************Utilization CHART DATA***************");
    // console.log(data);
    let colors = customColorsArray();
    d3.select(containerName).selectAll("*").remove();
    if (data.length <= 0) {
        $(containerName).parent().remove();
        return;
    }
    var chart = c3.generate({
        bindto: containerName,
        padding: {
            top: 15,
            right: 60
            // left: 250,
        },
        data: {
            type: 'bar',
            json: data,
            keys: {
                x: 'utilization',
                value: groups
            },
            //groups: [groups],
            order: 'null',
            labels: {
                format: function (v, id, i, j) {
                    if (sizeParams) {
                        return commaSeperatedNumber(v);
                    } else {
                        // Dont Show The tick above each bar.
                    }
                },
            },
        },
        size: {
            height: sizeParams ? sizeParams.height : 220,
            width: sizeParams ? sizeParams.width : 980
        },
        color: {
            pattern: [barcolor, '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
            //pattern: [ '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#D1BCF7', '#809FBC', '#5A6D8D']
        },
        axis: {
            x: {
                type: 'category',
                // label: {
                //    text: 'Year',
                //    position: 'outer-middle'
                // }

            },
            y: {
                min: 0,
                padding: {
                    bottom: 0
                },
                label: {
                    text: LabelText,
                    position: 'outer-middle'
                }
            }
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
        legend: {
            show: true,
            position: 'inset',
            inset: {
                anchor: 'top-right',
                x: -55,
                y: 10,
                step: 10

            }

        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    filterData = data[dataObj.index],
                    patientCount = filterData[id + '_Patients'];
                providerCount = filterData[id + '_Providers'];


                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                // var groupCirrhosis = _.groupBy(data[id],'cirrhosis');
                let html = '';
                html = `<div class="customC3ToolTip">
                            <div class="customC3ToolTip-Header">
                                <div>${filterData.utilization}</div>
                            </div>
                            <div class="customC3ToolTip-Body">
                                <div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div> Genotype: ${id}</div>
                                <div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div> Providers Count: ${commaSeperatedNumber(providerCount)}</div>
                                <div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:${bgcolor}"></div> Patients Count: ${commaSeperatedNumber(patientCount)}</div>
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

export function prepareUtilizationPopup(data, dataObj) {

    let params = AmdApp['Filters'];

    let geno = params.genotypes ? params.genotypes.replace(/\'/g, "") : 'All';
    let treat = params.treatment ? (params.treatment.replace(/\'/g, "") != 'naive,experienced' ? upperCaseFirst(params.treatment.replace(/\'/g, "")) : 'All') : 'All';
    let cirr = params.cirrhosis ? (params.cirrhosis.replace(/\'/g, "") != 'Yes,No' ? params.cirrhosis.replace(/\'/g, "") : 'All') : 'All';


    data = data.filter(function (rec) {
        let TreatmentPeriod = rec.treatmentPeriod;
        if (TreatmentPeriod == dataObj.medicationInfo.treatmentPeriod) {
            return true;
        } else {
            return false;
        }
    });
    let uniquePatientPerCategory = getuniqValue(data);
    let totalprovider = getprovidercount(data);
 
    var filterdata = dataObj.filterdata;

    $('.analyticsPatientsPopup').empty();

    let MainHtml = `<div class="popup-inner" style='overflow:auto !important;width: 1280px!important; height: 648px; padding: 10px 20px;'>
	                <button type="button" class="close analytics_closebtn" ><span aria-hidden="true">×</span></button>
                    <div class="analyticsPatientsPopup-header"></div>
                    <div class="analyticsPatientsPopup-container"></div>`;



    // header section
    let headerHtml = ``;


    // chart section
    let chartContentHtml = ``;

    if (filterdata == "geoLocation") {
        headerHtml += `<div class="analyticsCommonPopupHeader" style="margin-top: -5px;">
                        <div class="analyticsCommonPopupHeaderInner">
                            <div class="analyticsCommonPopupDrugName">${dataObj.medicationInfo.Medication} (${dataObj.medicationInfo.treatmentPeriod}W) </div>
                            <div class="analyticsCommonPopupFilterDesc">
                                <div class="analyticsCommonPopupFilterDescTitle">Genotype:</div>
                                <div class="analyticsCommonPopupFilterDescValue">${geno}</div>
                            </div>
                            <div class="analyticsCommonPopupFilterDesc">
                                <div class="analyticsCommonPopupFilterDescTitle">Treatment:</div>
                                <div class="analyticsCommonPopupFilterDescValue">${treat}</div>
                            </div>
                            <div class="analyticsCommonPopupFilterDesc">
                                    <div class="analyticsCommonPopupFilterDescTitle">Cirrhosis:</div>
                                    <div class="analyticsCommonPopupFilterDescValue">${cirr}</div>
                            </div>
                            <div class="analyticsCommonPopupOptions">
                                <div title="Switch to Population Health View" class="analyticsCommonPopupOptionsButton commonPopupSwitchPoplationIcon"><span><i class="fa fa-bar-chart" aria-hidden="true"></i></span></div>
                                <div class="analyticsCommonPopupOptionsButton commonPopupPatientCount"  title="Patient Count"><span style="cursor: default;"><i class="fa fa-users" aria-hidden="true"></i></span><p>${uniquePatientPerCategory}</p></div>
                                <div title="Show Patients" class="analyticsCommonPopupOptionsButton commonPopupShowPatientIcon" ><span><i class="fa fa-toggle-off" aria-hidden="true"></i></span></div>
                                <div title="Export Patients" class="analyticsCommonPopupOptionsButton commonPopupExportPatientIcon"><span><i class="fa fa-share-square-o" aria-hidden="true"></i></span></div>
                            </div>
                        </div>
	                </div>`;
        // Nisha 02/14/2017 Modified the portion for Patient Provider table
        chartContentHtml += `<div class="analyticsUtilizationPopupChartContent">
                            <div id="geoUtilizationView">
                                <div class="utilizationHeaderChart" style="margin-top: 3px" >Geo Location<span class="macLearningsubTabs-infoIcon mlInfoTip">
                        <div class="analytics-tooltip mlInfoTip_tooltip">
                            <div class="analytics-tooltipHead">
                                 Patient Targeting </div>
                                 &nbsp;&nbsp;<span class='boldfnt'>N:</span> `+uniquePatientPerCategory+` ( `+(((uniquePatientPerCategory/dataObj.medicationInfo.uniquePatients)*100).toFixed(2))+` %) is out of Total Patients - ` +dataObj.medicationInfo.uniquePatients+ `<br>
                                 &nbsp;&nbsp;<span class='boldfnt'>Medication Records:</span> `+uniquePatientPerCategory+` (`+(((uniquePatientPerCategory/dataObj.medicationInfo.totalPatients)*100).toFixed(2))+` %) is out of Total Medication Patients - `+dataObj.medicationInfo.totalPatients+`
                            <div class="analytics-tooltipBody" style="font-size: 13px;">
                                   <div style="padding:2px"><span><img src="/yellow-dot.png"/></span>0-25</div>
                                   <div style="padding:2px"><span><img src="/blue-dot.png"/></span>26-50</div>
                                   <div style="padding:2px"><span><img src="/purple-dot.png"/></span>51-75</div>
                                   <div style="padding:2px"><span><img src="/green-dot.png"/></span>76-100</div>
                                   <div style="padding:2px"><span><img src="/red-dot.png"/></span>>100</div>
                             </div>
                            </div>
                            </span>
                            </div>
                               <div class="col-lg-6">
                               <div class="analyticsCommonPopupDrugName" style="padding-top:0px;padding-bottom: 10px !important; line-height: 18px !important;">${dataObj.medicationInfo.Medication} (${dataObj.medicationInfo.treatmentPeriod}W) </div>
                                 <div class="analyticsUtilizationPopupLocationMap" id="geoUtilization" style="height:465px;margin: 3px auto;"></div>
                              </div>
                                <div class="col-lg-6">
                                <div>
                                  <select id="drugDataCompare">
                                  </select> <input type="button" value ="Compare" class="comparegeolocation"/>
                                  </div>
                                <div class="analyticsUtilizationPopupLocationMap" id="geoUtilizationCompare" style="height:465px;margin: 3px auto;"></div>
                                </div>
                                 <div class="col-lg-12" style="border-top: solid 1px #e9e9e9; padding:10px">
                                   <div class="" style="margin-top: 3px;padding-bottom:5px;text-align:center;" >Physician & Patient Targeting
                                   <span class="macLearningsubTabs-infoIcon mlInfoTip">
                        <div class="analytics-tooltip mlInfoTip_tooltip">
                            <div class="analytics-tooltipHead">
                                Physician & Patient Targeting
                            </div>
                            <div class="analytics-tooltipBody" style="font-size: 13px;">
                                    <span>
                                   <span class='boldfnt'>N:</span> `+uniquePatientPerCategory+` ( `+(((uniquePatientPerCategory/dataObj.medicationInfo.uniquePatients)*100).toFixed(2))+` %) is out of Total Patients - ` +dataObj.medicationInfo.uniquePatients+ `<br>
                                   <span class='boldfnt'>Medication Records:</span>`+uniquePatientPerCategory+` (`+(((uniquePatientPerCategory/dataObj.medicationInfo.totalPatients)*100).toFixed(2))+`%) is out of Total Medication Patients - `+dataObj.medicationInfo.totalPatients+`<br><br>
                                        <span class='boldfnt'>Definition</span> - Physician & Patient Targeting represents the patient distribution per State.
									    <br> Not all Patients and Providers have state codes.
                                    </span> </div>
                            </div>
                            </span>
                                   </div>
						           	<div class="col-lg-6">
							    	  <div id="PhysicianData"> Physician Data </div>
							       </div>
							      <div class="col-lg-6">
								     <div id="PatientData">Patient Data</div>
						        	</div>
						        </div>
                            </div>
                            <div id="populationHealthView">
                                <div class="utilizationHeaderChart" >Population Health View</div>
                                <div class="analyticsUtilizationPopupMainChart">
                                    <div class="utilizationChartContent">
                                        <div class="utilizationHeaderChart" >Genotype Distribution</div>
                                        <div class="analyticsUtilizationPopupLocationMap" id="genotypeUtilization"></div>
                                    </div>
                                </div>
                                <div class="analyticsUtilizationPopupMainChart">
                                    <div class="utilizationChartContent">
                                        <div class="">Geo Location</div>
                                        <div class="analyticsUtilizationPopupLocationMap" id="genotypeGeoLocationMap" style="height:393px!important;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>`;

        //container for patient data
        let patientContentHtml = `<div class="analyticsCommonPopupPatientContent">`;

        patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRow">PatientID</div>
                                    <div class="showInRowMin">Age</div>
                                    <div class="showInRowMin">Gender</div>
                                    <div class="showInRowMin">Genotype</div>
                                    <div class="showInRow">Treatment</div>
                                    <div class="showInRowMin">Cirrhosis</div>
                                    <div class="showInRow">Viral Load</div>
                                    <div class="showInRow">Liver Disease</div>
                                    <div class="showInRowMax">Race</div>
                                    <div class="showInRow">Ethnicity</div>
                                </div>`;

        patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

        for (let i = 0; i < data.length; i++) {
            patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                                    <div class="showInRow">${data[i].patientId}</div>
                                    <div class="showInRowMin">${data[i].age}</div>
                                    <div class="showInRowMin">${getGenderType(data[i].gender)}</div>
                                    <div class="showInRowMin">${data[i].genotype}</div>
                                    <div class="showInRow" >${data[i].treatment}</div>
                                    <div class="showInRowMin">${data[i].cirrhosis}</div>
                                    <div class="showInRow">${formatViralLoadValue(data[i].viralLoad)}</div>
                                    <div class="showInRow" >${getLiverAssessmentType(data[i].AssessmentLiverDisease)}</div>
                                    <div class="showInRowMax" >${data[i].race}</div>
                                    <div class="showInRow" >${data[i].ethnicity}</div>
                                    </div>`;
        }

        patientContentHtml += `</div>`;


        MainHtml += headerHtml;
        MainHtml += chartContentHtml;
        MainHtml += patientContentHtml;
        MainHtml += `</div>`;


        $('.analyticsPatientsPopup').html(MainHtml);
        $('.analyticsPatientsPopup').show();

        $('.analyticsCommonPopupPatientContent').hide();



        //bind switch population health view
        $('#populationHealthView').hide();

        let treatedPatients = data;
        // Update for medication field name to solve groupby.
        // renderLocationMapChart('geoUtilization', treatedPatients, null);
        renderLocationMapChartUtlization('geoUtilization', treatedPatients, null);

        analyticsPatientsData['CompareGeoLocation'] = dataObj.UtlizationDrugsData;
        renderDrugData('drugDataCompare', dataObj.UtlizationDrugsData);
        // Nisha 02/14/2017 Modified the portion for Patient Provider table

        renderPatientLocation('#PatientData', treatedPatients);
        renderProviderLocation('#PhysicianData', treatedPatients);

        $('.commonPopupSwitchPoplationIcon').on('click', function () {
            $('#populationHealthView').toggle();
            $('#geoUtilizationView').toggle();
            // toggle show patiet button
            $(this).find('i').toggleClass('fa-bar-chart fa-arrow-circle-o-left');
            let title = '';
            if ($(this).find('i').hasClass('fa-bar-chart')) {
                title = 'Switch to Population Health View';
                $('#genotypeUtilization').empty();
                $('#genotypeGeoLocationMap').empty();
            } else {
                title = 'Back';

                //Bind Data for genotype distribution for population health view.
                //Get All data related to medication with all genotype.
                analyticsPatientsData['DrugGenotypeData'] = AmdApp['DrugByGenotype'];
                //prepare filters for medicaiton and treatmentPeriod
                let genotypeFilter = {};
                genotypeFilter.MEDICATION = dataObj.medicationInfo.Medication;
                genotypeFilter.treatmentPeriod = dataObj.medicationInfo.treatmentPeriod;
                // added treatment period filtering.
                let genotypeFilterData = _.where(analyticsPatientsData['DrugGenotypeData'], genotypeFilter);
                analyticsPatientsData['DrugGenotypePreparedData'] = prepareDrugGenotype(_.groupBy(genotypeFilterData, 'genotype'), dataObj.medicationInfo.Medication);

                // Update for medication field name to solve groupby.
                let tempdata = _.groupBy(genotypeFilterData, 'MEDICATION');
                genotypeUtilizationChart('#genotypeUtilization', analyticsPatientsData['DrugGenotypePreparedData'], dataObj.medicationInfo.Medication, null);
                renderLocationMapChart('genotypeGeoLocationMap', tempdata[dataObj.medicationInfo.Medication], null);
                //Update data for refresh funcatinality
                AmdApp['TempDrugByGenotypeFilterData'] = tempdata[dataObj.medicationInfo.Medication];
            }
            $(this).attr('title', title);
        });

        // bind show patient button click event
        $('.commonPopupShowPatientIcon').on('click', function () {
            $('.analyticsUtilizationPopupChartContent').toggle();

            //toggle switch population health view
            $('.commonPopupSwitchPoplationIcon').toggle();

            $('.analyticsCommonPopupPatientContent').toggle();
            // toggle show patiet button
            $(this).find('i').toggleClass('fa-toggle-on fa-toggle-off');
            let title = '';
            if ($(this).find('i').hasClass('fa-toggle-on')) {
                title = 'Hide Patients';
            } else {
                title = 'Show Patients';
            }
            $(this).attr('title', title);
        });
        //bind export patient button  click event
        $('.commonPopupExportPatientIcon').click(function () {
            exportPatientsData($(this), 'Utilization_' + dataObj.medicationInfo.Medication + '_Patients', data);
        });
    } else {
        let container = '';
        if (filterdata == "me") {
            // data = _.where(data, {
            //   providerId: "1928583"
            //});
            chartContentHtml += `<div class="analyticsUtilizationPopupChartContent">
                                    <div id="meUtilizationView" style="text-align: center;padding: 10px;">
                                        <div class="utilizationHeaderChart" >Provider Utilization
                                            <span class="macLearningsubTabs-infoIcon mlInfoTip">
                                            <div class="analytics-tooltip mlInfoTip_tooltip">
                                                <div class="analytics-tooltipHead">
                                                   Provider Utilization
                                                </div>
                                                <div class="analytics-tooltipBody" style="font-size: 13px;">
                                                        <span class='boldfnt'>Total Provider:</span> `+totalprovider+`<br>
                                                        <span class='boldfnt'>N:</span> `+uniquePatientPerCategory+` (`+(((uniquePatientPerCategory/dataObj.medicationInfo.uniquePatients)*100).toFixed(2))+`%) is out of Total Patients - ` +dataObj.medicationInfo.uniquePatients+ `<br>
                                                        <span class='boldfnt'>Medication Records:</span>`+uniquePatientPerCategory+` (`+(((uniquePatientPerCategory/dataObj.medicationInfo.totalPatients)*100).toFixed(2))+`%) is out of Total Medication Patients - `+dataObj.medicationInfo.totalPatients+`<br>
                                                        <br><span class='boldfnt'>Definition</span> - Following Chart describe year wise genotype distribution of all the provider who have prescribed ${dataObj.medicationInfo.Medication} (${dataObj.medicationInfo.treatmentPeriod}W).
                                                </div>
                                            </div>
                                        </span>
                                        </div>
                                        <div class="analyticsUtilizationPopupLocationMap" id="meUtilization" style="text-align:center"></div>
                                    </div>
                                </div>`;

            container = `meUtilization`;
        } else if (filterdata == "mynetwork") {
            data = analyticsPatientsData['mynetworkutilization'];
            data = _.where(data, {
                Medication: dataObj.medicationInfo.Medication
            });
            let uniquePatientPerCategory = getuniqValue(data);
            chartContentHtml += `<div class="analyticsUtilizationPopupChartContent">
                                    <div id="meUtilizationView">
                                        <div class="utilizationHeaderChart" >My Network Utilization</div>
                                        <div class="analyticsUtilizationPopupLocationMap" id="myNetworkUtilization" style="text-align:center"></div>
                                    </div>
                                </div>`;

            container = `myNetworkUtilization`;

        } else {
            chartContentHtml += `<div class="analyticsUtilizationPopupChartContent">
                                    <div id="meUtilizationView" style="text-align: center;padding: 10px;"> Population Health Utilization
                                        <span class="macLearningsubTabs-infoIcon mlInfoTip">
                                            <div class="analytics-tooltip mlInfoTip_tooltip">
                                                <div class="analytics-tooltipHead">
                                                    Population Health Utilization
                                                </div>
                                                <div class="analytics-tooltipBody" style="font-size: 13px;">
                                                        <span class='boldfnt'>N:</span> `+uniquePatientPerCategory+` (`+(((uniquePatientPerCategory/dataObj.medicationInfo.uniquePatients)*100).toFixed(2))+`%) is out of Total Patients - ` +dataObj.medicationInfo.uniquePatients+ `<br>
                                                         <span class='boldfnt'>Medication Records:</span>`+uniquePatientPerCategory+` (`+(((uniquePatientPerCategory/dataObj.medicationInfo.totalPatients)*100).toFixed(2))+`%) is out of Total Medication Patients - `+dataObj.medicationInfo.totalPatients+`<br>
                                                        <span class='boldfnt'>Definition</span> - Following Chart describe year wise genotype distribiion of all the patients who have been prescribed ${dataObj.medicationInfo.Medication} (${dataObj.medicationInfo.treatmentPeriod}W.
                                                </div>
                                            </div>
                                        </span>
                                        <div class="analyticsUtilizationPopupLocationMap" id="populationUtilization" style="text-align:center"></div>
                                    </div>
                                </div>`;

            container = `populationUtilization`;
        }
        //container for patient data
        let patientContentHtml = `<div class="analyticsCommonPopupPatientContent">`;
        patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRow">PatientID</div>
                                    <div class="showInRowMin">Age</div>
                                    <div class="showInRowMin">Gender</div>
                                    <div class="showInRowMin">Genotype</div>
                                    <div class="showInRow">Treatment</div>
                                    <div class="showInRowMin">Cirrhosis</div>
                                    <div class="showInRow">Viral Load</div>
                                    <div class="showInRow">Liver Disease</div>
                                    <div class="showInRowMax">Race</div>
                                    <div class="showInRow">Ethnicity</div>
                                </div>`;

        patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

        for (let i = 0; i < data.length; i++) {
            patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                                    <div class="showInRow">${data[i].patientId}</div>
                                    <div class="showInRowMin">${data[i].age}</div>
                                    <div class="showInRowMin">${getGenderType(data[i].gender)}</div>
                                    <div class="showInRowMin">${data[i].genotype}</div>
                                    <div class="showInRow" >${data[i].treatment}</div>
                                    <div class="showInRowMin">${data[i].cirrhosis}</div>
                                    <div class="showInRow">${formatViralLoadValue(data[i].viralLoad)}</div>
                                    <div class="showInRow" >${getLiverAssessmentType(data[i].AssessmentLiverDisease)}</div>
                                    <div class="showInRowMax" >${data[i].race}</div>
                                    <div class="showInRow" >${data[i].ethnicity}</div>
                                    </div>`;

            /*
            patientContentHtml += `<div class="ecf-patientDetailSection" id="${data[i].patientId}_detailSection">
                                        <div class="col-md-3">
                                            <div class="efd-cell1">GenoType</div>
                                            <div class="efd-cell2">${data[i].genotype}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Viral Load</div>
                                            <div class="efd-cell2">${formatViralLoadValue(data[i].viralLoad)}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Age</div>
                                            <div class="efd-cell2">${data[i].age}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Weight</div>
                                            <div class="efd-cell2">${data[i].weight} (Kg)</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Ethnicity</div>
                                            <div class="efd-cell2">${data[i].ethnicity}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Race</div>
                                            <div class="efd-cell2">${data[i].race}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Alcohol</div>
                                            <div class="efd-cell2">${data[i].alcohol}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Renal Failure</div>
                                            <div class="efd-cell2">${(data[i].renalFailure == 0 ? 'No' : 'Yes')}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Mental Health</div>
                                            <div class="efd-cell2">${(data[i].mentalHealth == 0 ? 'No' : 'Yes')}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">HIV</div>
                                            <div class="efd-cell2">${(data[i].HIV == 0 ? 'No' : 'Yes')}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Treatment</div>
                                            <div class="efd-cell2">${data[i].treatment}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Cirrhosis</div>
                                            <div class="efd-cell2">${data[i].cirrhosis}</div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="efd-cell1">Assessment Liver Disease</div>
                                            <div class="efd-cell2">${getLiverAssessmentType(data[i].AssessmentLiverDisease)}</div>
                                        </div>
                                    </div>`;
        */
        }
        patientContentHtml += '</div>';

        headerHtml += `<div class="analyticsCommonPopupHeader">
                        <div class="analyticsCommonPopupHeaderInner">
                            <div class="analyticsCommonPopupDrugName">${dataObj.medicationInfo.Medication} (${dataObj.medicationInfo.treatmentPeriod }W)
                        </div>
                        <div class="analyticsCommonPopupFilterDesc">
                            <div class="analyticsCommonPopupFilterDescTitle">Genotype:</div>
                            <div class="analyticsCommonPopupFilterDescValue">${geno}</div>
                        </div>
                        <div class="analyticsCommonPopupFilterDesc">
                            <div class="analyticsCommonPopupFilterDescTitle">Treatment:</div>
                            <div class="analyticsCommonPopupFilterDescValue">${treat}</div>
                        </div>
                        <div class="analyticsCommonPopupFilterDesc">
                            <div class="analyticsCommonPopupFilterDescTitle">Cirrhosis:</div>
                            <div class="analyticsCommonPopupFilterDescValue">${cirr}</div>
                        </div>
                        <div class="analyticsCommonPopupOptions">
                            <div title="Switch to Population Health View" class="analyticsCommonPopupOptionsButton commonPopupSwitchPoplationIcon"><span><i class="fa fa-bar-chart" aria-hidden="true"></i></span></div>
                            <div class="analyticsCommonPopupOptionsButton commonPopupPatientCount"  title="Patient Count"><span style="cursor: default;"><i class="fa fa-users" aria-hidden="true"></i></span><p>${uniquePatientPerCategory}</p></div>
                            <div title="Show Patients" class="analyticsCommonPopupOptionsButton commonPopupShowPatientIcon" ><span><i class="fa fa-toggle-off" aria-hidden="true"></i></span></div>
                            <div title="Export Patients" class="analyticsCommonPopupOptionsButton commonPopupExportPatientIcon"><span><i class="fa fa-share-square-o" aria-hidden="true"></i></span></div>
                        </div>
                    </div>
                </div>`;

        MainHtml += headerHtml;
        MainHtml += chartContentHtml;
        MainHtml += patientContentHtml;
        MainHtml += `</div>`;


        $('.analyticsPatientsPopup').html(MainHtml);
        $('.analyticsPatientsPopup').show();

        //toggle switch population health view hide from anothre popup in utilization.
        $('.commonPopupSwitchPoplationIcon').hide();
        $('.analyticsCommonPopupPatientContent').hide();
        // bind show patient button click event
        $('.commonPopupShowPatientIcon').on('click', function () {
            $('.analyticsUtilizationPopupChartContent').toggle();

            $('.analyticsCommonPopupPatientContent').toggle();
            // toggle show patiet button
            $(this).find('i').toggleClass('fa-toggle-on fa-toggle-off');
            let title = '';
            if ($(this).find('i').hasClass('fa-toggle-on')) {
                title = 'Hide Patients';
            } else {
                title = 'Show Patients';
            }
            $(this).attr('title', title);
        });
        //bind export patient button  click event
        $('.commonPopupExportPatientIcon').click(function () {
            exportPatientsData($(this), 'Utilization_' + dataObj.medicationInfo.Medication + '_Patients', data);
        });
        // $('.js-ecf-patientRow').click(function () {
        //     let childState = $(this).attr('child'),
        //         childEle = $(this).next('.ecf-patientDetailSection'),
        //         patientId = parseInt($(this).attr('patient'));

        //     $(childEle).find('svg').remove();

        //     $('.ecf-patientDetailSection').hide();
        //     $('.ecf-patientRow').removeClass('active');
        //     if (childState == 'visible') {
        //         $(this).attr('child', 'hidden');
        //         $(childEle).hide(500);
        //         return;
        //     } else {
        //         $(this).attr('child', 'visible');
        //         $(this).addClass('active');
        //         $(childEle).show(500);
        //     }

        // });

        let sizeParams = {};
        sizeParams.width = 1100;
        sizeParams.height = 450;
        PopulationUtilizationChart("#" + container, data, sizeParams, filterdata);

    }


}

function handleRowClick(obj, subTab, medicationInfo) {
    let childState = $(obj).attr('child'),
        childEle = $(obj).next('.ecf-patientDetailSection'),
        patientId = parseInt($(obj).attr('patient'));

    $(childEle).find('svg').remove();

    $('.ecf-patientDetailSection').hide();
    $('.ecf-patientRow').removeClass('active');
    if (childState == 'visible') {
        $(obj).attr('child', 'hidden');
        $(childEle).hide(500);
        return;
    } else {
        $(obj).attr('child', 'visible');
        $(obj).addClass('active');
        $(childEle).show(500);
    }

    let container = '',
        treatedPatients = _.where(analyticsPatientsData.patientsData, medicationInfo);

    let dummyCheck = medicationInfo.Medication.indexOf("THEN") > 1 ? true : false;

    if (dummyCheck)
        treatedPatients = analyticsPatientsData.patientsData;

    //for efficacy tab
    if (subTab == 'efficacy') {
        // container = $(childEle).find('.ecfPatient-relative').attr('id');
        // renderRelativePosChart(container);

        renderEfficacyCharts(childEle, treatedPatients, patientId);
    }
    // for adherence tab
    else {

        let treatingPatients = _.where(analyticsPatientsData.treatingPatients, medicationInfo);

        container = $(childEle).find('.ecfPatient-drugX').attr('id');
        renderDrugXChart(container, treatedPatients, patientId);
        /*  remove adherence treated/treating & average chart
        container = $(childEle).find('.ecfPatient-treatedvsTreating').attr('id');
        renderTreatedvsTreatingChart(container, treatedPatients, treatingPatients);

        container = $(childEle).find('.ecfPatient-avgAdherence').attr('id');
        renderAvgAdherenceChart(container, treatedPatients, patientId);
    */
        container = $(childEle).find('.ecfPatient-ageDistribution').attr('id');
        renderAgeDistributionChart(container, treatedPatients);

        container = $(childEle).find('.ecfPatient-genderDistribution').attr('id');
        renderGenderDistributionChart(container, treatedPatients);

        container = $(childEle).find('.ecfPatient-locationMap').attr('id');
        renderLocationMapChart(container, treatedPatients, patientId);
    }

    scrollPatientDetails($(childEle).attr('id'));
    scrollPatientDetails($(obj).attr('id'));
}

function renderRelativePosChart(container) {
    container = '#' + container;
    let drugsData = JSON.parse(localStorage.getItem('AllDrugsData'));
    renderSvgChartForSissionDataPayer('adherence', 'Cost', 'Efficacy', container, drugsData);
}

function renderCureRateChart(container) {
    container = '#' + container;
    let chartData = [],
        mainObject = {},
        drugsData = [];
    let drugsAnalticsData = JSON.parse(localStorage.getItem('AllDrugsData'));

    for (let i = 0; i < drugsAnalticsData.length; i++) {
        let drugObj = drugsAnalticsData[i],
            jsonObj = {};

        jsonObj['adherence'] = parseFloat(drugObj['Adherence']['Adherence']);
        jsonObj['comp_value'] = 0;
        jsonObj['compli_cost'] = 0;
        jsonObj['cost'] = drugObj['Cost']['TotalCost'];
        jsonObj['count'] = drugObj['DrugN'];
        jsonObj['drugid'] = drugObj['DrugId'];
        jsonObj['efficacy'] = parseFloat(drugObj['Efficacy']['Efficacy']);
        jsonObj['medication'] = drugObj['DrugName'].replace(/\s*\(.*?\)\s*/g, '');
        jsonObj['period'] = drugObj['Treatment_Period'].replace(' Weeks', '');
        jsonObj['safety'] = parseFloat(drugObj['Safety']);
        jsonObj['utilization'] = parseFloat(drugObj['Utilization']['Utilization']);
        jsonObj['value'] = drugObj['TotalValue'];

        drugsData.push(jsonObj);
    }

    mainObject['best_value_cost'] = 0;
    mainObject['best_value_cost_display'] = '0';
    mainObject['category_id'] = Session.get('category_id');;
    mainObject['category_name'] = getCategoryName();
    mainObject['count'] = drugsAnalticsData[0]['TotalN'];
    mainObject['data'] = drugsData;
    mainObject['optimizedValue'] = 0;
    mainObject['optimizedValue_display'] = '0';
    mainObject['savings'] = 0;
    mainObject['savings_display'] = '0';
    mainObject['total_cost'] = 0;
    mainObject['total_cost_display'] = '0';

    chartData.push(mainObject);
    createCureRateChart(container, chartData, {
        height: 230,
        width: 400
    })
}

//function to get category name for efficacy tab
function getCategoryName() {
    let categoryName = '';
    categoryName = $('.ecf-Genotype').html();
    categoryName += ' ' + $('.ecf-Treatment').html();
    if ($('.ecf-Cirrhosis').html() == 'Yes') {
        categoryName += ' Cirrhosis';
    }
    return categoryName;
}

//function to render Treated v/s Treating patient count
function renderTreatedvsTreatingChart(container, treatedPatients, treatingPatients) {
    container = '#' + container;

    let keys = ['Treating', 'Treated'],
        chartData = {},
        filteredData = [];

    //filter treated patients for last 1 year
    filteredData = treatedPatients.filter(function (rec) {
        return filterPatientByYear(1, rec.dischargeDate);
    });

    chartData['Treating'] = treatingPatients.length;
    chartData['Treated'] = filteredData.length;

    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'pie',
            json: [chartData],
            keys: {
                value: keys
            },
        },
        size: {
            height: 200,
            width: 400
        },
        legend: {
            show: true,
            //position:'right',
        },
        color: {
            pattern: ['#809FBC', '#5A6D8D', '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = chartData[id];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>' + id + ' Patients: ' + filterData + ' - ' + ratio + '%</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}

//function to render Average Adhrence
function renderAvgAdherenceChart(container, treatedPatients, patientId) {
    container = '#' + container;
    let currentpatAdh = _.where(treatedPatients, {
        patientId: patientId
    });
    currentpatAdh = currentpatAdh[0].medDays;

    let allPatsAdh = [],
        keys = ['Patient Adherence', 'Average Adherence'];

    treatedPatients.forEach(function (rec) {
        allPatsAdh.push(parseInt(rec.medDays));
    });

    let chartData = [{
        'name': 'Patient Adherence',
        'Adherence': currentpatAdh
    }, {
        'name': 'Average Adherence',
        'Adherence': allPatsAdh.average().toFixed(2)
    }];

    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'name',
                value: ['Adherence']
            },
        },
        size: {
            height: 200,
            width: 400
        },
        legend: {
            show: false,
        },
        tooltip: {
            show: true,
            grouped: false
        },
        axis: {
            x: {
                type: 'category',
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                }
            }
        },
        color: {
            pattern: ['#809FBC', '#5A6D8D']
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
    });
}

//function to render Age Distribution

/*

export function renderAgeDistributionChart(container, treatedPatients) {
    container = '#' + container;

    let keys = ['0-17', '18-34', '35-50', '51-69', '70+'],
        chartData = {},
        filteredData = [];

    filteredData = treatedPatients.filter(function (rec) {
        return rec.age >= 0 && rec.age <= 17;
    });
    chartData['0-17'] = filteredData.length;

    filteredData = treatedPatients.filter(function (rec) {
        return rec.age >= 18 && rec.age <= 34;
    });
    chartData['18-34'] = filteredData.length;

    filteredData = treatedPatients.filter(function (rec) {
        return rec.age >= 35 && rec.age <= 50;
    });
    chartData['35-50'] = filteredData.length;

    filteredData = treatedPatients.filter(function (rec) {
        return rec.age >= 51 && rec.age <= 69;
    });
    chartData['51-69'] = filteredData.length;

    filteredData = treatedPatients.filter(function (rec) {
        return rec.age >= 70;
    });
    chartData['70+'] = filteredData.length;

    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: [chartData],
            keys: {
                value: keys
            },
        },
        donut: {
            width: 50
        },
        size: {
            height: 200,
            width: 400
        },
        legend: {
            show: true,
            position: 'right',
        },
        color: {
            //pattern: ['#809FBC', '#5A6D8D', '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
            pattern: ["#414A50", "#1F6F78", "#118A7E", "#3BAEA0", '#93E4C1']
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = chartData[id];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Age Group ' + id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Total Patients: ' + filterData + ' - ' + ratio + '%</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}

*/


export function renderAgeDistributionChart(container, treatedPatients) {
    let params = AmdApp['Filters'];
    let chartData = [];
    if (treatedPatients && treatedPatients.length <= 0) {
        fnNoDataFound('#' + container);
        return;
    }
    chartData = getDataForChart(treatedPatients);

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            zoomType: 'y',
            height: 460
        },
        colors: customColorsArray(), // ["#FBDE97", "#97E0E3", "#676767", "#929FA8", '#17becf'],
        title: {
            text: null
        },
        subtitle: {
            text: 'Click bars to see genotype distribution'
        },
        xAxis: {
            type: 'category',
            crosshair: true
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Adherence %'
            }
        },
        tooltip: {
            headerFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.key}</b></td></tr><br>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">Adherence: </td>' +
                '<td style="padding:0"><b>{point.y} %</b></td></tr><br>' +
                '<tr><td style="color:{series.color};padding:0">Patient Count: </td>' +
                '<td style="padding:0"><b>{point.patientCount}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y.toFixed(2) + ' %';
                    }
                }
            }
        },
        // series: [{
        //     name: 'Age Groups',
        //     colorByPoint: true,
        //         data: [{
        //             name: '0-17',
        //             y: 5,
        //             drilldown: '0-17'
        //         }, {
        //             name: '18-34',
        //             y: 2,
        //             drilldown: '18-34'
        //         }, {
        //             name: '35-50',
        //             y: 4,
        //             drilldown: '35-50'
        //         },{
        //             name: '51-69',
        //             y: 2,
        //             drilldown: '51-69'
        //         }, {
        //             name: '70+',
        //             y: 4,
        //             drilldown: '70+'
        //         }]

        // }],
        series: [{
            name: 'Age Groups',
            colorByPoint: true,
            data: chartData.mainData,

        }],
        drilldown: {
            // series: [{
            //     id: '0-17',
            //     data: [
            //         ['1a', 4],
            //         ['1b', 2],
            //         ['2', 1],
            //         ['3', 2],
            //         ['4', 1]
            //     ]
            // }, {
            //     id: '18-34',
            //     data: [
            //         ['1a', 4],
            //         ['1b', 2]
            //     ]
            // }, {
            //     id: '35-50',
            //     data: [
            //         ['1a', 4],
            //         ['1b', 2],
            //         ['2', 2]
            //     ]
            // },{
            //     id: '51-69',
            //     data: [
            //         ['1a', 4],
            //         ['1b', 2],
            //         ['2', 2]
            //     ]
            // },{
            //     id: '70+',
            //     data: [
            //         ['1a', 4],
            //         ['1b', 2],
            //         ['2', 2]
            //     ]
            // }]
            series: chartData.drillDown,
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

            }
        }
    });


    //function to get data & drill down data for chart
    function getDataForChart(treatedPatients) {

        let mainData = [],
            drillDown = [],
            totalPats = treatedPatients.total;

        let ageGroupData = createAgeRangeIfNot(treatedPatients);
        for (let ageKey in ageGroupData) {
            let keyData = ageGroupData[ageKey];
            let ageObj = {
                name: ageKey,
                y: getAdherence(keyData),
                patientCount : getuniqValue(keyData),
                // patientCount: keyData.length,
                drilldown: ageKey
            };
            //push into main array
            mainData.push(ageObj);
            drillDown.push({
                name: ageKey,
                id: ageKey,
                data: getDrillDownData(keyData)
            });
        }
        //return final object
        return {
            mainData: mainData,
            drillDown: drillDown,
        };

        function getDrillDownData(categoryArray) {
            if (!categoryArray.length) {
                return [];
            }
            let drillDownArr = [];
            categoryArray = getDataByGenotype(categoryArray);

            for (let i = 0; i < categoryArray.length; i++) {
                let innerArr = [];
                let drilldownObj = {}
                drilldownObj = {
                    name: categoryArray[i].genotype,
                    y: categoryArray[i].adherence,
                    patientCount: categoryArray[i].count
                }
                // innerArr.push(categoryArray[i].genotype);
                // innerArr.push(categoryArray[i].adherence);
                // drillDownArr.push(innerArr);
                drillDownArr.push(drilldownObj);
            }
            return drillDownArr;
        }

        //function to get genotype wise count for patients
        function getDataByGenotype(data) {
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
                    count: genData.length,
                    adherence: getAdherence(genData),
                    color: genotypeFixedColors(keys),
                    total: data.length
                });
            }

            return genotypeData;
        }



        function getAdherence(dataArray) {
            // console.log(dataArray);

            let total_count = 0,
                med_count = 0,
                sum_days_medication = 0;

            let sum_treatmentDays = 0;

            if (!dataArray.length) {
                return 0;
            }

            for (let j = 0; j < dataArray.length; j++) {
                med_count = parseInt(dataArray[j]['total']);
                total_count += med_count;
                sum_days_medication += parseFloat(dataArray[j]['days_med']);
                sum_treatmentDays += (parseInt(dataArray[j]['treatmentPeriod']) * 7)
            }

            let adherence = (sum_days_medication / sum_treatmentDays) * 100;

            return parseFloat(adherence.toFixed(2));

        }

    }



    //function to get data & drill down data for chart
    function getDataForChartOld(treatedPatients) {

        let mainData = [],
            drillDown = [],
            totalPats = treatedPatients.total;


        filteredData = treatedPatients.filter(function (rec) {
            return rec.age >= 0 && rec.age <= 17;
        });

        //prepare Age Group Object
        let ageObj = {
            name: '0-17',
            y: getAdherence(filteredData),
            patientCount: filteredData.length,
            drilldown: '0-17'
        };
        //push into main array
        mainData.push(ageObj);

        drillDown.push({
            name: '0-17',
            id: '0-17',
            data: getDrillDownData(filteredData)
        });


        filteredData = treatedPatients.filter(function (rec) {
            return rec.age >= 18 && rec.age <= 34;
        });
        //prepare Age Group Object
        ageObj = {
            name: '18-34',
            y: getAdherence(filteredData),
            patientCount: filteredData.length,
            drilldown: '18-34'
        };
        //push into main array
        mainData.push(ageObj);

        drillDown.push({
            name: '18-34',
            id: '18-34',
            data: getDrillDownData(filteredData)
        });


        filteredData = treatedPatients.filter(function (rec) {
            return rec.age >= 35 && rec.age <= 50;
        });
        //prepare Age Group Object
        ageObj = {
            name: '35-50',
            y: getAdherence(filteredData),
            patientCount: filteredData.length,
            drilldown: '35-50'
        };
        //push into main array
        mainData.push(ageObj);

        drillDown.push({
            name: '35-50',
            id: '35-50',
            data: getDrillDownData(filteredData)
        });


        filteredData = treatedPatients.filter(function (rec) {
            return rec.age >= 51 && rec.age <= 69;
        });
        //prepare Age Group Object
        ageObj = {
            name: '51-69',
            y: getAdherence(filteredData),
            patientCount: filteredData.length,
            drilldown: '51-69'
        };
        //push into main array
        mainData.push(ageObj);

        drillDown.push({
            name: '51-69',
            id: '51-69',
            data: getDrillDownData(filteredData)
        });


        filteredData = treatedPatients.filter(function (rec) {
            return rec.age >= 70;
        });
        //prepare Age Group Object
        ageObj = {
            name: '70+',
            y: getAdherence(filteredData),
            patientCount: filteredData.length,
            drilldown: '70+'
        };
        //push into main array
        mainData.push(ageObj);

        drillDown.push({
            name: '70+',
            id: '70+',
            data: getDrillDownData(filteredData)
        });


        //return final object
        return {
            mainData: mainData,
            drillDown: drillDown,
        };

        function getDrillDownData(categoryArray) {
            if (!categoryArray.length) {
                return [];
            }
            let drillDownArr = [];
            categoryArray = getDataByGenotype(categoryArray);

            for (let i = 0; i < categoryArray.length; i++) {
                let innerArr = [];
                let drilldownObj = {}
                drilldownObj = {
                    name: categoryArray[i].genotype,
                    y: categoryArray[i].adherence,
                    patientCount: categoryArray[i].count
                }
                // innerArr.push(categoryArray[i].genotype);
                // innerArr.push(categoryArray[i].adherence);
                // drillDownArr.push(innerArr);
                drillDownArr.push(drilldownObj);
            }
            return drillDownArr;
        }



        //function to get genotype wise count for patients
        function getDataByGenotype(data) {
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
                    count: genData.length,
                    adherence: getAdherence(genData),
                    total: data.length
                });
            }

            return genotypeData;
        }



        function getAdherence(dataArray) {
            // console.log(dataArray);

            let total_count = 0,
                med_count = 0,
                sum_days_medication = 0;

            let sum_treatmentDays = 0;

            if (!dataArray.length) {
                return 0;
            }

            for (let j = 0; j < dataArray.length; j++) {
                med_count = parseInt(dataArray[j]['total']);
                total_count += med_count;
                sum_days_medication += parseFloat(dataArray[j]['days_med']);
                sum_treatmentDays += (parseInt(dataArray[j]['treatmentPeriod']) * 7)
            }

            let adherence = (sum_days_medication / sum_treatmentDays) * 100;

            return parseFloat(adherence.toFixed(2));

        }

    }



}

//function to render Gender Distribution
export function renderGenderDistributionChart(container, treatedPatients) {
    container = '#' + container;
    let keys = ['Male', 'Female'];

    let chartData = [{
        'gender': 'Male',
        'Patient Count': treatedPatients.filter(function (rec) {
            return rec.gender == 'M';
        }).length
    }, {
        'gender': 'Female',
        'Patient Count': treatedPatients.filter(function (rec) {
            return rec.gender == 'F';
        }).length
    }];


    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'gender',
                value: ['Patient Count']
            },
            labels: {
                format: function (v, id, i, j) {
                    //console.log(v + ' ' +id + i +' '+j);
                    return commaSeperatedNumber(v);
                },
            },
        },
        size: {
            height: 200,
            width: 400
        },
        legend: {
            show: false,
            //position:'right',
        },
        tooltip: {
            show: true,
            grouped: false
        },
        axis: {
            x: {
                type: 'category',
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                }
            }
        },
        color: {
            pattern: ['#5A6D8D']
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
    });
}

// Nisha 02/15/2017 populate the dropdown
function renderDrugData(container, utilData) {
    // console.log('utilData');
    select = document.getElementById(container);
    $('#drugDataCompare').children().remove();
    // console.log(utilData);
    utilData = _.sortBy(utilData, "DrugName");

    option = document.createElement('option');
    option.value = option.text = "Select";
    select.add(option);
    for (i = 0; i < utilData.length; i++) {
        option = document.createElement('option');
        option.value = option.text = utilData[i]['DrugName'];
        select.add(option);
    }
}

// Nisha 02/14/2017 Modified the portion for Patient Provider table

//function to render Patient Location Table
function renderPatientLocation(container, treatedPatients) {
    for (i = 0; i < treatedPatients.length; i++) {
        if (treatedPatients[i].ST_CD == null || treatedPatients[i].ST_CD == "") {
            treatedPatients[i].ST_CD = "Undertermined";
        }

    }
    var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
    let getPatientLocations = _.countBy(treatedPatients, 'ST_CD');
    var sorted = _.chain(getPatientLocations).
    map(function (cnt, brand) {
            return {
                brand: brand,
                count: cnt,
                Statename: null
            }
        }).sortBy('count').reverse()
        .value();

    $(container).empty();
    // console.log(treatedPatients);
    // console.log(sorted);
    // console.log(getPatientLocations);
    let patientContentHtml = ``;

    patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;text-align:center;">
                                    <div class="showInRowP" > State (Patient) </div>
                                    <div class="showInRowP" >Patient Count</div>
                           </div>`;

    patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

    for (i = 0; i < sorted.length; i++) {

        for (var j = 0; j < store.length; j++) {
            if (store[j]['Abbreviation'] == sorted[i].brand) {
                sorted[i].Statename = store[j]['State'];
            }
            if (sorted[i].brand == "Undertermined")
                sorted[i].Statename = "Undertermined";
        }


        if (sorted[i].Statename != "Undertermined") {
            patientContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP"  style="padding-left:40px;text-align:left">${sorted[i].Statename}</div>
                                    <div class="showInRowP"  style="text-align:center;">${sorted[i].count}</div>
                               </div>`;
        }

    }

    var sorted = sorted.filter(function (a) {
        return (a.Statename == "Undertermined");
    });


    for (i = 0; i < sorted.length; i++) {
        patientContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP" style="padding-left:40px;text-align:left">${sorted[i].Statename}</div>
                                    <div class="showInRowP"  style="text-align:center;">${sorted[i].count}</div>
                               </div>`;


    }

    patientContentHtml += `</div>`;
    // console.log(patientContentHtml);
    $(container).html(patientContentHtml);
}

// Nisha 02/14/2017 Modified the portion for Patient Provider table

//function to render Provider Location Table
function renderProviderLocation(container, treatedPatients) {
    for (i = 0; i < treatedPatients.length; i++) {
        if (treatedPatients[i].PROVIDER_ST_CD == null || treatedPatients[i].PROVIDER_ST_CD == "") {
            treatedPatients[i].PROVIDER_ST_CD = "Undertermined";
        }

    }
    var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
    let getPatientLocations = _.countBy(treatedPatients, 'PROVIDER_ST_CD');
    var sorted = _.chain(getPatientLocations).
    map(function (cnt, brand) {
            return {
                brand: brand,
                count: cnt,
                Statename: null
            }
        }).sortBy('count').reverse()
        .value();

    $(container).empty();
    // console.log(getPatientLocations);
    let patientContentHtml = ``;

    patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;text-align:center;">
                                    <div class="showInRowP" > State (Provider) </div>
                                    <div class="showInRowP" >Patient Count</div>
                           </div>`;

    patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

    for (i = 0; i < sorted.length; i++) {

        for (var j = 0; j < store.length; j++) {
            if (store[j]['Abbreviation'] == sorted[i].brand) {
                sorted[i].Statename = store[j]['State'];
            }
            if (sorted[i].brand == "Undertermined")
                sorted[i].Statename = "Undertermined";
        }
        if (sorted[i].Statename != "Undertermined") {
            patientContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP" style="padding-left:40px;text-align:left">${sorted[i].Statename}</div>
                                    <div class="showInRowP"  style="text-align:center;">${sorted[i].count}</div>
                               </div>`;
        }

    }

    var sorted = sorted.filter(function (a) {
        return (a.Statename == "Undertermined");
    });

    for (i = 0; i < sorted.length; i++) {
        patientContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                <div class="showInRowP" style="padding-left:40px;text-align:left">${sorted[i].Statename}</div>
                                <div class="showInRowP"  style="text-align:center;">${sorted[i].count}</div>
                           </div>`;


    }

    patientContentHtml += `</div>`;
    // console.log(patientContentHtml);
    $(container).html(patientContentHtml);
}

// Nisha 02/15/2017 added char to compare geo locations
//function to render Location Map
export function renderCompareLocationMapChartUtlization() {
    $("#geoUtilizationCompare").empty();
    let utilData = analyticsPatientsData['CompareGeoLocation'];
    var zipCodes = null;
    for (i = 0; i < utilData.length; i++) {
        if (utilData[i]['DrugName'] == $('#drugDataCompare').val())
            var zipCodes = utilData[i]["State_Code"];
    }
    // console.log(zipCodes);
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(41.013843, -105.115165);
    let chartZoom = 3;

    let myOptions = {
        zoom: chartZoom,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    let map = new google.maps.Map(document.getElementById('geoUtilizationCompare'), myOptions);
    // $.ajaxSetup({
    //     async: false
    // });

    for (var key in zipCodes) {
        //    console.log(key);
        //    console.log(zipCodes[key].length);
        if (key != "") {
            let icona = '';
            // let marker = '';
            if (parseInt(zipCodes[key]) > 0 && parseInt(zipCodes[key]) <= 25) {
                icona = '/yellow-dot.png';
            } else if (parseInt(zipCodes[key]) > 25 && parseInt(zipCodes[key]) <= 50) {
                icona = '/blue-dot.png';

            } else if (parseInt(zipCodes[key]) > 50 && parseInt(zipCodes[key]) <= 75) {
                icona = '/purple-dot.png';
            } else if (parseInt(zipCodes[key]) > 75 && parseInt(zipCodes[key]) <= 100) {
                icona = '/green-dot.png';
            } else if (parseInt(zipCodes[key].length) > 100) {
                icona = '/red-dot.png';
            }
            //    console.log(icona);

            $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + key + '&sensor=false&components=country:US', null, (response, status) => {
                //console.log(response);
                //null check for location info
                if (response.status == google.maps.GeocoderStatus.OK) {
                    let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;

                    map.setCenter(location);
                    let marker = new google.maps.Marker({
                        map: map,
                        position: location,
                        icon: "http://maps.google.com/mapfiles/ms/icons" + icona
                    });

                }
            });
        }
    }

}


//function to render Location Map
function renderLocationMapChart(container, treatedPatients, patientId) {
    //container = '#' +container;
    // $("[id$='_LocationMap']").html('');
    console.log(treatedPatients);
    let currentPat, zipCode;
    if (patientId == null) {
        zipCode = _.uniq(_.pluck(treatedPatients, 'zipcode'))
    } else {
        currentPat = _.where(treatedPatients, {
                patientId: patientId
            }),
            zipCode = currentPat[0].zipcode;
    }
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(41.013843, -105.115165);
    let chartZoom = 3;
    // if(container == 'geoUtilization')
    // {
    //     chartZoom = 4;
    // }
    let myOptions = {
        zoom: chartZoom,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    let map = new google.maps.Map(document.getElementById(container), myOptions);
    // $.ajaxSetup({
    //     async: false
    // });
    // Call this wherever needed to actually handle the display
    let count = zipCode.length;
    _.each(zipCode, function (value) {
        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + value + '&sensor=false&components=country:US', null, (response, status) => {
            //console.log(response);
            //null check for location info
            if (response.status == google.maps.GeocoderStatus.OK) {
                let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;
                map.setCenter(location);
                let marker = new google.maps.Marker({
                    map: map,
                    position: location
                });
                if (zipCode[count] == value) {
                    map.setCenter(latlng);
                    let marker = new google.maps.Marker({
                        map: map,
                        position: latlng
                    });
                    google.maps.event.trigger(map, 'resize');
                }
            }
        });
    });
}

// Nisha 02/14/2017 modified the chart marker for state and counts This chart now represents the states and not the Zip
//function to render Location Map
function renderLocationMapChartUtlization(container, treatedPatients, patientId) {
    //container = '#' +container;
    // $("[id$='_LocationMap']").html('');
    console.log('renderLocationMapChartUtlization');
    //console.log(treatedPatients);
    let currentPat, zipCode;
    if (patientId == null) {
        zipCode = _.uniq(_.pluck(treatedPatients, 'zipcode'))
    } else {
        currentPat = _.where(treatedPatients, {
                patientId: patientId
            }),
            zipCode = currentPat[0].zipcode;
    }
    // var zipCodes =  _.groupBy(treatedPatients,"zipcode");
    var zipCodes = _.groupBy(treatedPatients, "ST_CD");
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(41.013843, -105.115165);
    let chartZoom = 3;
    // if(container == 'geoUtilization')
    // {
    //     chartZoom = 4;
    // }
    let myOptions = {
        zoom: chartZoom,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    let map = new google.maps.Map(document.getElementById(container), myOptions);
    // $.ajaxSetup({
    //     async: false
    // });
    // Call this wherever needed to actually handle the display
    // let count = zipCode.length;
    // let count = zipCodes.length;
    // _.each(zipCode, function (value) {
    for (var key in zipCodes) {
        //    console.log(key);
        //    console.log(zipCodes[key].length);
        let icona = '';
        // let marker = '';
        if (parseInt(zipCodes[key].length) > 0 && parseInt(zipCodes[key].length) <= 25) {
            icona = '/yellow-dot.png';
        } else if (parseInt(zipCodes[key].length) > 25 && parseInt(zipCodes[key].length) <= 50) {
            icona = '/blue-dot.png';

        } else if (parseInt(zipCodes[key].length) > 50 && parseInt(zipCodes[key].length) <= 75) {
            icona = '/purple-dot.png';
        } else if (parseInt(zipCodes[key].length) > 75 && parseInt(zipCodes[key].length) <= 100) {
            icona = '/green-dot.png';
        } else if (parseInt(zipCodes[key].length) > 100) {
            icona = '/red-dot.png';
        }
        //    console.log(icona);

        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + key + '&sensor=false&components=country:US', null, (response, status) => {
            //console.log(response);
            //null check for location info
            if (response.status == google.maps.GeocoderStatus.OK) {
                let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;

                map.setCenter(location);
                let marker = new google.maps.Marker({
                    map: map,
                    position: location,
                    icon: "http://maps.google.com/mapfiles/ms/icons" + icona
                });
                //   marker.setIcon("http://maps.google.com/mapfiles/ms/icons" + icona);
                // if (zipCodes[count] == key) {
                //     map.setCenter(latlng);
                //     let marker = new google.maps.Marker({
                //         map: map,
                //         position: latlng
                //     });
                //     google.maps.event.trigger(map, 'resize');
                // }
            }
        });
    }

    // }
}

//function to render Drug X chart
function renderDrugXChart(container, treatedPatients, patientId) {
    container = '#' + container;
    let html = '',
        additionalDrugs = getAdditionalDrugsForPatient(treatedPatients, patientId);

    let haveAdditionalDrugs = Object.getOwnPropertyNames(additionalDrugs).length > 0;

    if (haveAdditionalDrugs) {
        for (let keys in additionalDrugs) {
            let drugs = additionalDrugs[keys];

            html += '<div class="additionalDrugSection">';
            html += '<div class="additionalReason">' + keys.split('_').join(' ') + '</div><ul class="additionalDruglist">';
            for (let j = 0; j < drugs.length; j++) {
                html += '<li><div class="additionalDrugsName">' + drugs[j] + '</div></li>';
            }
            html += '</ul></div>';
        }
    } else {
        html += '<div class="noAdditionalDrugs">No Additional Drugs Found For This Patient.</div>'
    }

    $(container).html(html);
}

export function renderRaceDistributionChart(container, treatedPatients) {
    container = '#' + container;

    let keys = ['American Indian', 'Alaskan Native', 'Asian', 'African American', 'White'],
        chartData = {},
        filteredData = [];

    filteredData = treatedPatients.filter(function (rec) {
        return rec.race == 'American Indian';
    });
    chartData['American Indian'] = filteredData.length;

    filteredData = treatedPatients.filter(function (rec) {
        return rec.race == 'Alaskan Native';
    });
    chartData['Alaskan Native'] = filteredData.length;

    filteredData = treatedPatients.filter(function (rec) {
        return rec.race == 'Asian';
    });
    chartData['Asian'] = filteredData.length;

    filteredData = treatedPatients.filter(function (rec) {
        return rec.race == 'African American';
    });
    chartData['African American'] = filteredData.length;

    filteredData = treatedPatients.filter(function (rec) {
        return rec.race == 'White';
    });
    chartData['White'] = filteredData.length;

    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: [chartData],
            keys: {
                value: keys
            },
        },
        donut: {
            width: 50
        },
        size: {
            height: 200,
            width: 400
        },
        legend: {
            show: true,
            //position:'right',
        },
        color: {
            // pattern: ['#809fbc', '#5a6d8d', '#84bfa4', '#133248', '#b4d9c4']
            pattern: ['#6F848F', '#ABBFCC', '#93A6AB', '#7E8887', '#C9C8C0']
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = chartData[id];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Race ' + id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Total Patients: ' + filterData + ' - ' + ratio + '%</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}

//function to clear the patients data of subtab based on subtab name
export function clearPatientData(subTab) {
    analyticsPatientsData['patientsData'] = null;
}

export function getLiverAssessmentType(value) {
    /**
     * @author: Pramveer
     * @date: 4 Apr 17
     * @desc: Changed the logic for LiverAssessment Type
     */

    // if (value < 2)
    //     return 'No';
    // else
    //     return 'Yes';

    if (value == null) {
        return 'NA';
    }
    if (value == 0) {
        return 'No';
    }
    if (value == 1) {
        return 'Yes';
    }
}

export function getGenderType(value) {
    if (value == 'M')
        return 'Male';
    else
        return 'Female';
}

//function distribute additional drugs to patients
//for now treated patients only
function randomizeAdditionalDrugs() {
    for (let i = 0; i < analyticsPatientsData.patientsData.length; i++) {
        analyticsPatientsData.patientsData[i]['additionalDrugs'] = getRandomDrugForPatient(analyticsPatientsData.patientsData[i]);
    }
}

function getRandomDrugForPatient(patientObj) {
    let drugsData = {};
    let addtionalDrugs = {
        'Schistosomiasis_coinfection': ['Praziquantel', 'oxamniquine'],
        'Muscular_dystrophy': ['Prednisone', 'Deflazacort'],
        'Anemia': ['Feridex', 'Dexferrum', 'Velphoro'],
        'HIV': ['Zidovudine', 'Enfuvirtide'],
        'Cardiovascular': ['Nitroglycerin', 'Isosorbide'],
        'RenalFailure': ['Sensipar', 'Erythropoietin', 'Darbepoetin alfa', 'Furosemide', 'Bumetanide'],
        'MentalHealth': ['Prozac', 'Zoloft', 'Paxil', 'Celexa', 'Lexapro', 'Luvox', 'Viibryd'],
        'Alcohol': ['Chlordiazepoxide', 'Disulfiram', 'Acamprosate']
    };


    if (patientObj['Muscular_dystrophy'] == 1) {
        drugsData['Muscular_dystrophy'] = addtionalDrugs['Muscular_dystrophy'];
    }

    if (patientObj['Schistosomiasis_coinfection'] == 1) {
        drugsData['Schistosomiasis_coinfection'] = addtionalDrugs['Schistosomiasis_coinfection'];
    }

    if (patientObj['anemia'] == 1) {
        drugsData['Anemia'] = addtionalDrugs['Anemia'];
    }

    if (patientObj['HIV'] == 1) {
        drugsData['HIV'] = addtionalDrugs['HIV'];
    }

    if (patientObj['Cardiovascular'] == 1) {
        drugsData['Cardiovascular'] = addtionalDrugs['Cardiovascular'];
    }

    if (patientObj['renalFailure'] == 1) {
        drugsData['RenalFailure'] = addtionalDrugs['RenalFailure'];
    }

    if (patientObj['mentalHealth'] == 1) {
        drugsData['MentalHealth'] = addtionalDrugs['MentalHealth'];
    }

    if (patientObj['alcohol'] == 1) {
        drugsData['Alcohol'] = addtionalDrugs['Alcohol'];
    }


    return drugsData;
}

//function to fetch additional drugs by patient id
function getAdditionalDrugsForPatient(baseData, patientID) {
    let addtionalDrugs = _.where(baseData, {
        patientId: patientID
    });

    return addtionalDrugs[0].additionalDrugs;
}

//funxction to filter patient by year
function filterPatientByYear(yearValue, patientDate) {
    patientDate = new Date(patientDate);
    let today = new Date();

    patientDate = patientDate.getFullYear();
    today = today.getFullYear();

    let yearDiff = today - patientDate;

    //return yearDiff <= yearValue ? true: false;
    return true;
}


//function to draw axis for drugx chart
function drawAxisForChart(svg, height, width, xOffset, yOffset) {
    var x = d3.scale.linear()
        .range([0, width - 1.5 * xOffset]);
    var y = d3.scale.linear()
        .range([height - yOffset, 0]);
    var xAxis = d3.svg.axis()
        .ticks(0)
        .scale(x).orient("bottom");
    var yAxis = d3.svg.axis()
        .ticks(0)
        .scale(y).orient("left");
    var xAxisd = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 0 + "," + (height - 5) + ")")
        .call(xAxis);
    var yAxisd = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (0) + "," + (20) + ")")
        .call(yAxis);
}

//function scroll patients list
export function scrollPatientDetails(elem) {
    setTimeout(function () {
        document.getElementById(elem).scrollIntoView({
            block: "end",
            behavior: "smooth"
        });
    }, 800);

    // $('.analyticsPatientsPopup-container').animate({
    //     scrollTop: $("#"+elem).offset().top
    // }, 1000);

}

function getCureStatus(isCured) {
    if (isCured == 1)
        return '<span style="color:green;">Cured</span>';
    else
        return '<span style="color:red;">Not Cured</span>';
}

function getPatientAgeGroup(age) {
    if (age >= 0 && age < 17)
        return '0-17';
    else if (age >= 18 && age <= 34)
        return '18-34';
    else if (age >= 35 && age <= 50)
        return '35-50';
    else if (age >= 51 && age <= 69)
        return '51-69';
    else if (age >= 70)
        return '70+';
}

function renderEfficacyCharts(childObj, patientsData, patientId) {
    let container = '',
        modifiedData = [],
        currentPatient = getPatientInfo(patientId);


    container = $(childObj).find('.ecfPatient-svrData').attr('id');
    renderSVRDataChart(container, null);

    container = $(childObj).find('.ecfPatient-cureRate').attr('id');
    renderCureRateChart(container);

    //efficacy by gender
    container = $(childObj).find('.ecfPatient-genderCure').attr('id');
    modifiedData = patientsData.filter(function (rec) {
        return rec.gender == currentPatient.gender;
    });
    plotCureDistributionChart(container, modifiedData, 'gender');

    //efficacy by age group
    container = $(childObj).find('.ecfPatient-ageCure').attr('id');
    let ageRange = getPatientAgeGroup(currentPatient.age).split('-'),
        minAge, maxAge = 0;
    minAge = ageRange[0].replace('+', '')
    maxAge = ageRange.length > 1 ? ageRange[1].replace('+', '') : 150;

    modifiedData = patientsData.filter(function (rec) {

        return rec.age >= parseInt(minAge) && rec.age <= parseInt(maxAge)
    });
    plotCureDistributionChart(container, modifiedData, 'age');

    //efficacy by race
    container = $(childObj).find('.ecfPatient-raceRate').attr('id');
    modifiedData = patientsData.filter(function (rec) {
        return rec.race == currentPatient.race;
    });
    plotCureDistributionChart(container, modifiedData, 'race');
}

function plotCureDistributionChart(container, data, chartName) {
    container = '#' + container;
    let colors = '#17becf';

    if (chartName == 'race')
        colors = '#fbde97';
    else if (chartName == 'gender')
        colors = '#b1e8ea';
    else if (chartName == 'age')
        colors = '#1f77b4';


    let chartData = [{
        'Status': 'Cured',
        'Patient Count': data.filter(function (rec) {
            return rec.isCured == 1;
        }).length
    }, {
        'Status': 'Not Cured',
        'Patient Count': data.filter(function (rec) {
            return rec.isCured == 0;
        }).length
    }];


    let chart = c3.generate({
        bindto: container,
        padding: {
            top: 8,
            right: 60,
        },
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'Status',
                value: ['Patient Count']
            },
            labels: {
                format: function (v, id, i, j) {
                    //console.log(v + ' ' +id + i +' '+j);
                    return commaSeperatedNumber(v);
                },
            },
        },
        size: {
            height: 230,
            width: 400
        },
        legend: {
            show: false,
            //position:'right',
        },
        tooltip: {
            show: true,
            grouped: false
        },
        axis: {
            x: {
                type: 'category',
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                }
            }
        },
        color: {
            pattern: [colors]
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
    });
    if (chartName == 'race') {
        $('[id*="_RaceCure"]').css('max-height', '');
        $('[id*="_RaceCure"]').find('svg').attr('height', '225');
    }
}


function renderSVRDataChart(container, averageSVR) {
    container = '#' + container;

    let chartData = getSvrDataForPatient();

    if (averageSVR != null) {
        chartData = [];
        for (let i = 0; i < averageSVR.length; i++) {
            if (averageSVR[i] != null && !isNaN(averageSVR[i])) {
                let json = {};
                json['week'] = (i + 1) * 4;
                json['svr'] = averageSVR[i];
                chartData.push(json);
            }
        }
    }
    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'spline',
            json: chartData,
            keys: {
                x: 'week',
                value: ['svr']
            },
            onclick: function (d, element) {
                //c3js library have issue sometimes it not handle proper click event for stacked chart
                //if value is not undefined then call method and display data accordingly otherwise not
                if (d.value) {

                } else {
                    console.log("improper click and data");
                }
            }
        },
        padding: {
            top: 5,
            right: 0,
            bottom: 10,
            left: 60,
        },
        axis: {
            x: {
                type: 'category',
                label: {
                    text: 'Weeks',
                    position: 'outer-center',
                },
            },
            y: {
                label: {
                    text: 'SVR Value',
                    position: 'middle'
                },
                tick: {
                    format: function (d) {
                        return d.toFixed(2);
                    }
                }
            }
        },
        size: {
            height: averageSVR != null ? 350 : 185,
            width: averageSVR != null ? 980 : 400
        },
        legend: {
            show: false,
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    filterData = chartData[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Week ' + filterData.week + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>SVR Count: ' + dataObj.value.toFixed(2) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });

    function getSvrDataForPatient() {
        let data = [];
        for (let i = 0; i < 10; i++) {
            let json = {};
            json['week'] = i * 4;
            json['svr'] = parseFloat((Math.random() * (2.58 - 0.24) + 0.24).toFixed(2));
            data.push(json);
        }
        return data;
    }
}

function getPatientInfo(patientId) {
    return _.where(analyticsPatientsData.patientsData, {
        patientId: patientId
    })[0];
}

//function to export patients data
export function exportPatientsData(obj, fileName, data) {

    var patientsData = [];
    patientsData = jQuery.extend(true, [], data);

    //Generate a file name
    var showLabel = true;

    fileName = fileName || 'default_patient';
    //remove category_id from patients
    for (var i = 0; i < patientsData.length; i++) {
        delete patientsData[i]['category_id'];
    }


    //reference http://jsfiddle.net/hybrid13i/JXrwM/

    //If patientsData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof patientsData != 'object' ? JSON.parse(patientsData) : patientsData;

    var CSV = '';

    //This condition will generate the Label/Header
    if (showLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index.toUpperCase() + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName = fileName.replace(/ /g, "_");

    //Initialize file format you want csv or xls
    var uri = 'data:text/xls;charset=utf-8,' + escape(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".xls";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}

//function to prepare dom for show patients data
export function prepareDomForShowPatients(subTab) {
    let params = AmdApp['Filters'];

    let geno = params.genotypes ? params.genotypes.replace(/\'/g, "") : 'All';
    let treat = params.treatment ? (params.treatment.replace(/\'/g, "") != 'naive,experienced' ? upperCaseFirst(params.treatment.replace(/\'/g, "")) : 'All') : 'All';
    let cirr = params.cirrhosis ? (params.cirrhosis.replace(/\'/g, "") != 'Yes,No' ? params.cirrhosis.replace(/\'/g, "") : 'All') : 'All';

    $('.analyticsPatientsPopup').empty();

    let MainHtml = `<div class="popup-inner" style='width: 1280px!important; height: 648px; padding: 10px 20px;'>
	                <button type="button" class="close analytics_closebtn" ><span aria-hidden="true">×</span></button>
                    <div class="analyticsPatientsPopup-header"></div>
                    <div class="analyticsPatientsPopup-container"></div>`;

    let data = getDataForMedications('', subTab, true) || [];

    // header section
    let headerHtml = ``;


    headerHtml += `<div class="analyticsCommonPopupHeader" style="margin-top: -5px;">
                        <div class="analyticsCommonPopupHeaderInner">
                            <div class="analyticsCommonPopupFilterDesc">
                                <div class="analyticsCommonPopupFilterDescTitle">Genotype:</div>
                                <div class="analyticsCommonPopupFilterDescValue">${geno}</div>
                            </div>
                            <div class="analyticsCommonPopupFilterDesc">
                                <div class="analyticsCommonPopupFilterDescTitle">Treatment:</div>
                                <div class="analyticsCommonPopupFilterDescValue">${treat}</div>
                            </div>
                            <div class="analyticsCommonPopupFilterDesc">
                                    <div class="analyticsCommonPopupFilterDescTitle">Cirrhosis:</div>
                                    <div class="analyticsCommonPopupFilterDescValue">${cirr}</div>
                            </div>
                            <div class="analyticsCommonPopupOptions">
                                <div class="analyticsCommonPopupOptionsButton commonPopupPatientCount"  title="Patient Count"><span style="cursor: default;"><i class="fa fa-users" aria-hidden="true"></i></span><p>${data.length}</p></div>
                                <div title="Export Patients" class="analyticsCommonPopupOptionsButton commonPopupExportPatientIcon"><span><i class="fa fa-share-square-o" aria-hidden="true"></i></span></div>
                            </div>
                        </div>
	                </div>`;

    //container for patient data
    let patientContentHtml = `<div class="analyticsCommonPopupPatientContent">`;
    patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRow">PatientID</div>
                                    <div class="showInRowMin">Age</div>
                                    <div class="showInRowMin">Gender</div>
                                    <div class="showInRowMin">Genotype</div>
                                    <div class="showInRow">Treatment</div>
                                    <div class="showInRowMin">Cirrhosis</div>
                                    <div class="showInRow">Viral Load</div>
                                    <div class="showInRow">Liver Disease</div>
                                    <div class="showInRowMax">Race</div>
                                    <div class="showInRow">Ethnicity</div>
                                </div>`;

    patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

    for (let i = 0; i < data.length; i++) {
        patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                                    <div class="showInRow">${data[i].patientId}</div>
                                    <div class="showInRowMin">${data[i].age}</div>
                                    <div class="showInRowMin">${getGenderType(data[i].gender)}</div>
                                    <div class="showInRowMin">${data[i].genotype}</div>
                                    <div class="showInRow" >${data[i].treatment}</div>
                                    <div class="showInRowMin">${data[i].cirrhosis}</div>
                                    <div class="showInRow">${formatViralLoadValue(data[i].viralLoad)}</div>
                                    <div class="showInRow" >${getLiverAssessmentType(data[i].AssessmentLiverDisease)}</div>
                                    <div class="showInRowMax" >${data[i].race}</div>
                                    <div class="showInRow" >${data[i].ethnicity}</div>
                                    </div>`;
    }
    patientContentHtml += '</div>';
    MainHtml += headerHtml;
    MainHtml += patientContentHtml;
    MainHtml += `</div>`;


    $('.analyticsPatientsPopup').html(MainHtml);
    $('.analyticsPatientsPopup').show();
    //bind export patient button  click event
    $('.commonPopupExportPatientIcon').click(function () {
        exportPatientsData($(this), 'Adharence_' + dataObj.medicationInfo.Medication + '_Patients', data);
    });



}



function handleRowClickPatients(obj, subTab) {
    let childState = $(obj).attr('child'),
        childEle = $(obj).next('.ecf-patientDetailSection'),
        patientId = parseInt($(obj).attr('patient'));

    $(childEle).find('svg').remove();

    $('.ecf-patientDetailSection').hide();
    $('.ecf-patientRow').removeClass('active');
    if (childState == 'visible') {
        $(obj).attr('child', 'hidden');
        $(childEle).hide(500);
        return;
    } else {
        $(obj).attr('child', 'visible');
        $(obj).addClass('active');
        $(childEle).show(500);
    }

    let container = '',
        treatedPatients = analyticsPatientsData.patientsData; //_.where(analyticsPatientsData.efficacy, medicationInfo);


    //for efficacy tab
    if (subTab == 'efficacy') {
        // container = $(childEle).find('.ecfPatient-relative').attr('id');
        // renderRelativePosChart(container);

        renderEfficacyCharts(childEle, treatedPatients, patientId);
    }
    // for adherence tab
    else {

        let treatingPatients = analyticsPatientsData.treatingPatients; //_.where(analyticsPatientsData.treatingPatients, medicationInfo);

        container = $(childEle).find('.ecfPatient-drugX').attr('id');
        renderDrugXChart(container, treatedPatients, patientId);
        /*  remove adherence treated/treating & average chart
                container = $(childEle).find('.ecfPatient-treatedvsTreating').attr('id');
                renderTreatedvsTreatingChart(container, treatedPatients, treatingPatients);

                container = $(childEle).find('.ecfPatient-avgAdherence').attr('id');
                renderAvgAdherenceChart(container, treatedPatients, patientId);
        */
        container = $(childEle).find('.ecfPatient-ageDistribution').attr('id');
        renderAgeDistributionChart(container, treatedPatients);

        container = $(childEle).find('.ecfPatient-genderDistribution').attr('id');
        // renderGenderDistributionChart(container, treatedPatients);

        container = $(childEle).find('.ecfPatient-locationMap').attr('id');
        renderLocationMapChart(container, treatedPatients, patientId);
    }

    scrollPatientDetails($(childEle).attr('id'));
    scrollPatientDetails($(obj).attr('id'));
}

function prepareDrugGenotype(genotypeGroups, selectedDrug) {

    let preparedData = [];

    for (let genotype in genotypeGroups) {
        let jsonObj = {},
            // Update for medication field name to solve groupby.
            drugsGroup = _.groupBy(genotypeGroups[genotype], 'MEDICATION'),
            drug = _.find(genotypeGroups[genotype], function (item) {
                return item.medication == selectedDrug;
            }),
            total = 0;
        if (drugsGroup[selectedDrug] != undefined) {
            for (let drug in drugsGroup) {
                total += drugsGroup[drug].length;
                if (drug == selectedDrug)
                    jsonObj[drug] = drugsGroup[drug].length;
                jsonObj["zipcode"] = _.uniq(_.pluck(drugsGroup[drug], 'zipcode'))
            }
        } else
            jsonObj[selectedDrug] = 0;
        jsonObj['genotype'] = genotype;
        jsonObj["Drug"] = selectedDrug;
        jsonObj['totalPatients'] = total;

        preparedData.push(jsonObj);
    }

    return {
        data: preparedData,
    };
}


function formatViralLoadValue(viralLoad) {
    if (viralLoad == null || viralLoad == undefined) {
        return "Not Available"
    } else if (viralLoad == "DETECTED" || viralLoad == "NOT DETECTED") {
        return viralLoad;
    } else {
        return viralLoad + ' M';
    }
}



export let prepareDomForComparisionCharts = (plottingData) => {
    $('#datasetComparsionPopupContent').empty();

    let chartContainerCls = 'col-lg-6';
    if ((plottingData == 'survivalRate') || (plottingData == 'drugGenotypeDistribution' || (plottingData == 'MarketShareOverMonthsChartData') || (plottingData == 'ingredicostpres'))) {
        chartContainerCls = 'col-lg-12';
    }

    let inlineStyle = ``;
    if (plottingData == 'drugGenotypeDistribution') {
        inlineStyle = `style="float:left;"`;
    }
    if (plottingData == 'compareutilization') {
        inlineStyle = `height:100%"`;
    }
    let extraContainer = ``;
    if (plottingData == 'retreatbyGenotype') {
        extraContainer = `<div id="analyticsRetreatmentByGenotypeSubChartsCompare"></div>`;
    } else if (plottingData == 'survivalRate-analytics') {
        extraContainer = `<div id="analyticsRiskFactorsCompare">
        <div class="datasetComparsionPopup-header">Data Comparison View ( <span class="chartInnerTypeLabel">Risk Distribution by Race</span> )</div>              
        <div class="col-lg-6"><div id="riskByRace-ContainerComparePrimary" class="boxshadow_borderline"></div></div>
        <div class="col-lg-6"><div id="riskByRace-ContainerCompareSecondary" class="boxshadow_borderline"></div></div>
        <div class="datasetComparsionPopup-header">Data Comparison View ( <span class="chartInnerTypeLabel">Risk Distribution by Gender</span> )</div>  
        <div class="col-lg-6"><div id="riskByGender-ContainerComparePrimary" class="boxshadow_borderline"></div></div>
        <div class="col-lg-6"><div id="riskByGender-ContainerCompareSecondary" class="boxshadow_borderline"></div></div>
        </div>`;
    } else if (plottingData == 'costBurden-analytics') {
        extraContainer = `<div id="analyticsCostBurdenCompare">
        <div class="datasetComparsionPopup-header">Data Comparison View ( <span class="chartInnerTypeLabel">Physician Service</span> )</div>              
        <div class="col-lg-6"><div id="costBurden-physicianServicePrimary" class="boxshadow_borderline"></div></div>
        <div class="col-lg-6"><div id="costBurden-physicianServiceSecondary" class="boxshadow_borderline"></div></div>
        <div class="datasetComparsionPopup-header">Data Comparison View ( <span class="chartInnerTypeLabel">Hospitalization</span> )</div>  
        <div class="col-lg-6"><div id="costBurden-hospitalizationPrimary" class="boxshadow_borderline"></div></div>
        <div class="col-lg-6"><div id="costBurden-hospitalizationSecondary" class="boxshadow_borderline"></div></div>
		<div class="datasetComparsionPopup-header">Data Comparison View ( <span class="chartInnerTypeLabel">Treatment of Liver Disease</span> )</div>  
        <div class="col-lg-6"><div id="costBurden-liverDiseasePrimary" class="boxshadow_borderline"></div></div>
        <div class="col-lg-6"><div id="costBurden-liverDiseaseSecondary" class="boxshadow_borderline"></div></div>
        <div class="datasetComparsionPopup-header">Data Comparison View ( <span class="chartInnerTypeLabel">Antiviral Therapy</span> )</div>  
        <div class="col-lg-6"><div id="costBurden-antiTherapyPrimary" class="boxshadow_borderline"></div></div>
        <div class="col-lg-6"><div id="costBurden-antiTherapySecondary" class="boxshadow_borderline"></div></div>
        </div>`;
    } else if (plottingData == 'compareutilization') {
        extraContainer = `<div id="analyticsCostBurdenCompareUtilization" style="display:none;">
            <div class="backBtnResponders">Back</div>
            <div class="datasetComparsionPopup-header">Data Comparison View ( <span class="chartInnerTypeLabel" id="medicationName">Genotype Distribution</span> )</div>              
            <div class="col-lg-6"><div id="prim_genotypeDistribution" class="boxshadow_borderline" style="margin-top:28px;"></div></div>
            <div class="col-lg-6"><div id="secon_genotypeDistribution" class="boxshadow_borderline"></div></div>
            <div class="col-lg-12"><div id="prim_utiDistribution" class="boxshadow_borderline" style="width:1100px"></div></div>
            <div class="col-lg-12"><div id="secon_utiDistribution" class="boxshadow_borderline" style="width:1100px"></div></div>
            </div>`
    }

    let html = `<div class="${chartContainerCls} chartContainer">
                    <div class="boxContainerDashboard">
                        <div class="panel-heading">
                            <h3 class="panel-title containertitle"> Client</h3>
                        </div>
                        <div class="panel-body">
                            <div id="primaryDataViewSection" ${inlineStyle}></div>
                        </div>
                    </div>
				</div>
                <div class="${chartContainerCls}  chartContainer">
                    <div class="boxContainerDashboard">
                        <div class="panel-heading">
                            <h3 class="panel-title containertitle"> Benchmark</h3>
                        </div>
                        <div class="panel-body">
                            <div id="secondaryDataViewSection" ${inlineStyle}></div>
                        </div>
                    </div>
                </div>` + extraContainer;

    if (plottingData == 'costBurden-analytics') {
        html = `<div class="${chartContainerCls} chartContainer">
                    <div class="boxContainerDashboard">
                        <div class="panel-heading">
                            <h3 class="panel-title containertitle"> Client</h3>
                        </div>
                        <div class="panel-body">
                            <div id="primaryDataViewSection-costBurden" ${inlineStyle}></div>
                        </div>
                    </div>
				</div>
                <div class="${chartContainerCls}  chartContainer">
                    <div class="boxContainerDashboard">
                        <div class="panel-heading">
                            <h3 class="panel-title containertitle"> Benchmark</h3>
                        </div>
                        <div class="panel-body">
                            <div id="secondaryDataViewSection-costBurden" ${inlineStyle}></div>
                        </div>
                    </div>
                </div>` + extraContainer;

    }

    $('#datasetComparsionPopupContent').html(html);

    $('.backBtnResponders').on('click',function(){
        $('#analyticsCostBurdenCompareUtilization').hide();
        $('#primaryDataViewSection').show();
        $('#secondaryDataViewSection').show();
    })
}

//function to convert into upper case first letter
export let toTitleCase = (str) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());


//Praveen 03/22/2017 Added function to append html
let fnNoDataFound = (container) => $(container).html('<div class="nodataFound">No Data Available</div>');


/**
 * @author: Arvind
 * @reviewer: 
 * @date: 24-May-2017
 * @desc: Created separate method to prepare therapy distribution  chart for effficacy for comparative 
 * purpose, So it look like repetetive
 */
//function to get data & drill down data for chart
export function prepareDataForEfficacyTherapyDistributionChart({
    treatedPatients,
    medication
}) {
    treatedPatients = treatedPatients.filter(function (a) {
        return a.SVR12 != null && a.Medication == medication;
    });

    let groupedDatatreatmentPeriod = _.groupBy(treatedPatients, 'treatmentPeriod');

    let mainData = [],
        drillDown = [],
        totalPats = treatedPatients.total;


    for (let key in groupedDatatreatmentPeriod) {

        let filteredData = groupedDatatreatmentPeriod[key];

        //prepare Age Group Object
        let weekObj = {
            name: key,
            y: getEfficacy(filteredData),
            patientCount: filteredData.length,
            drilldown: key
        };
        //push into main array
        mainData.push(weekObj);

        drillDown.push({
            name: key,
            id: key,
            data: getDrillDownData(filteredData)
        });
    }



    //return final object
    return {
        mainData: mainData,
        drillDown: drillDown,
    };

    function getDrillDownData(categoryArray) {
        if (!categoryArray.length) {
            return [];
        }
        let drillDownArr = [];
        categoryArray = getDataByGenotype(categoryArray);

        for (let i = 0; i < categoryArray.length; i++) {
            let innerArr = [];
            let drilldownObj = {}
            drilldownObj = {
                name: categoryArray[i].genotype,
                y: categoryArray[i].efficacy,
                patientCount: categoryArray[i].count
            }
            drillDownArr.push(drilldownObj);
        }
        return drillDownArr;
    }



    //function to get genotype wise count for patients
    function getDataByGenotype(data) {
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
                count: genData.length,
                efficacy: getEfficacy(genData),
                total: data.length
            });
        }

        return genotypeData;
    }



    function getEfficacy(dataArray) {
        // console.log(dataArray);

        let total_count = 0,
            med_count = 0,
            totalCuredPatients = 0;

        if (!dataArray.length) {
            return 0;
        }

        for (let j = 0; j < dataArray.length; j++) {
            if (dataArray[j].SVR12 != null) {
                med_count = parseInt(dataArray[j]['total']);
                total_count += med_count;
                if (parseInt(dataArray[j].SVR12) == 1) {
                    totalCuredPatients += 1;
                }
            }

        }
        let efficacy = 0;
        if (parseFloat(totalCuredPatients) > 0 && parseFloat(total_count) > 0) {
            efficacy = (parseFloat(totalCuredPatients) * 100) / parseFloat(total_count);
        }

        return parseFloat(efficacy.toFixed(2));

    }

}
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 24-May-2017
 * @desc: Created separate method to render therapy distribution  chart for effficacy for comparative 
 * purpose, So it look like repetetive
 */
export function renderEfficayTherapyDisributionForComparative({
    container,
    chartData,
    medication
}) {
    // console.log('analyticsPatientsData');
    // console.log(analyticsPatientsData['efficacy']);
    if (chartData && chartData.mainData && chartData.mainData.length <= 0) {
        fnNoDataFound('#' + container);
        return;
    }
    var chart = Highcharts.chart(container, {
        chart: {
            type: 'column',
            zoomType: 'y',
            events: {
                drilldown: function (e) {
                    chart.xAxis[0].setTitle({
                        text: "Genotype"
                    });
                    chart.subtitle.update({
                        text: 'Click back button to view therapy distribution'
                    });
                },
                drillup: function (e) {
                    chart.xAxis[0].setTitle({
                        text: "Therapy Period (in weeks)"
                    });
                    chart.subtitle.update({
                        text: 'Click back button to view genotype distribution'
                    });
                }
            }

        },
        colors: ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba'],
        title: {
            text: null
        },
        subtitle: {
            text: 'Click bars to see genotype distribution'
        },
        xAxis: {
            type: 'category',
            crosshair: true,
            title: {
                text: 'Therapy Period (in weeks)'
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Efficacy %'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.key}</b></td></tr><br>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">Efficacy: </td>' +
                '<td style="padding:0"><b>{point.y} %</b></td></tr><br>' +
                '<tr><td style="color:{series.color};padding:0">Patient Count: </td>' +
                '<td style="padding:0"><b>{point.patientCount}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y.toFixed(2) + ' %';
                    }
                },
            }
        },
        series: [{
            name: 'Therapy Period',
            data: chartData.mainData,
            colorByPoint: true

        }],
        drilldown: {
            series: chartData.drillDown,
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

            }
        }
    });

}

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 24-May-2017
 * @desc: Created separate method to render Viral over time distribution  chart for effficacy comparative 
 * purpose, So it look like repetetive
 */
export function renderEfficacyMedcationSVRTrendChartForComparative({
    container,
    medication,
    genoTypes,
    svrData
}) {
    // console.log('Medication SVR');
    // console.log(AmdApp['MedicationSVR']);
    $(container).empty();
    let filteredSRVData = svrData;

    filteredSRVData = filteredSRVData.filter(function (a) {
        return a.MEDICATION == medication;
    });
    // console.log('filteredSRVData');
    // console.log(filteredSRVData);

    let maxweek = _.max(filteredSRVData, function (filteredSRVDataT) {
        return filteredSRVDataT.Weeks;
    });

    let maxWeeks = [];
    let minWeeks = [];

    maxWeeks = _.max(filteredSRVData, function (filteredSRVDataT) {
        return parseInt(filteredSRVDataT.Weeks);
    });
    minWeeks = _.min(filteredSRVData, function (filteredSRVDataT) {
        return parseInt(filteredSRVDataT.Weeks);
    });

    var maxvalue = maxWeeks.Weeks;

    let plotBands = [];

    let range = 0;
    let correction = 8;
    // if (analyticsParams.fdaCompliant == "yes") {
    plotBands.push({
        from: range,
        to: correction,
        color: '#EFFFFF',
        label: {
            text: 'Baseline',
            style: {
                color: '#999999'
            },
            y: 20
        }
    });

    // }

    range = $("#divWeekResponse input[type=radio]:checked").val() == undefined ? 0 : $("#divWeekResponse input[type=radio]:checked").val();
    // console.log(range);
    if (range != 0 && range != 999) {
        var rangefrom = range.split('-')[0];
        var rangeto = range.split('-')[1];
        var from = 0,
            to = 0;
        if (analyticsParams.fdaCompliant == "yes") {
            filteredSRVData = filteredSRVData.filter(function (a) {
                return (parseInt(a.TREATMENT_PERIOD) == parseInt(rangeto));
            });
        } else {
            filteredSRVData = filteredSRVData.filter(function (a) {
                return (parseInt(a.TREATMENT_PERIOD) >= parseInt(rangefrom) && parseInt(a.TREATMENT_PERIOD) <= parseInt(rangeto));
            });

            // plotBands = [];
            // correction = 0;
        }
        //  console.log(dataPJ);
        from = correction;
        to = parseInt(rangeto) + correction;
        plotBands.push({
            from: from,
            to: to,
            color: '#FFFFEF',
            label: {
                text: 'Treatment Period',
                style: {
                    color: '#999999'
                },
                y: 20
            }
        });

        from = parseInt(rangeto) + correction;
        to = parseInt(maxvalue) + correction;

        plotBands.push({
            from: from,
            to: to,
            color: '#FFEFFF',
            label: {
                text: 'Follow-Up',
                style: {
                    color: '#999999'
                },
                y: 20
            }
        });

    } else {
        plotBands = [];
        // from = correction;
        // to = from + correction;

        // plotBands.push({
        //     from: from,
        //     to: to,
        //     color: '#FFFFEF',
        //     label: {
        //         text: 'Treatment Period',
        //         style: {
        //             color: '#999999'
        //         },
        //         y: 30
        //     }
        // });

        // from = to;
        // to = parseInt(maxvalue) + correction;

        // plotBands.push({
        //     from: from,
        //     to: to,
        //     color: '#FFEFFF',
        //     label: {
        //         text: 'Follow-Up',
        //         style: {
        //             color: '#999999'
        //         },
        //         y: 50
        //     }
        // });
    }

    // console.log('renderMedcationSVRTrendChart plotBands');
    // console.log(plotBands);

    let rangeTo = 0;
    if (range != 0) {
        rangeTo = range.split('-')[1];
    }

    // modified By Yuvraj (14th Feb 17) : This check needs to be done after filtering the data based on Selected treatment week.
    if (!checkIfEnoughDataExist(filteredSRVData, rangeTo)) {
        $('#' + container).html('<div class="providerNoDataFound">Not Enough Data Available</div>');
        $('.followPatientsDiv').hide();
        return;
    }

    let followSamePatientData = getSamePatientsData(filteredSRVData, rangeTo);

    // console.log(followSamePatientData);

    let improved_followSamePatientData = removeUnnecessaryResults(followSamePatientData);
    // console.log(improved_followSamePatientData);

    let pCount = _.flatten(improved_followSamePatientData);
    pCount = _.uniq(_.pluck(pCount, 'PATIENT_ID_SYNTH'));

    let tooltipContent = `<div>Follow ${pCount.length} Patients </div>`;

    $('#followSamePatients').tooltip({
        contents: '<div></div>'
    });
    $('#followSamePatients').tooltip('option', 'content', tooltipContent);
    $('.followPatientsDiv').show();

    let categoriesx = [];

    for (week = parseInt(minWeeks.Weeks); week <= parseInt(maxWeeks.Weeks); week++) {
        categoriesx.push(week);
    }

    if (categoriesx.length > 1) {
        let seriesy = [];
        let maxvalue = 0;
        let ymaxvalue = 0;
        let jsonObj = {},
            filteredcount = [],
            dataweekcount = [];
        for (week = parseInt(minWeeks.Weeks); week <= parseInt(maxWeeks.Weeks); week++) {
            let total = 0;
            filteredcount = filteredSRVData.filter(function (a) {
                return (a.Weeks == week);
            });

            // let patientcount = _.pluck(filteredcount, 'PATIENT_ID_SYNTH');
            let patientcount = _.pluck(filteredcount, 'PATIENT_ID_SYNTH');
            patientcount = _.uniq(patientcount).length;

            // console.log('patientcount');
            // console.log(patientcount);
            for (j = 0; j < filteredcount.length; j++) {
                total = total + parseFloat(filteredcount[j].ViralLoad);
            }

            let valt = 0.0;

            if (filteredcount.length > 0 && total > 0)
                valt = Math.log(parseFloat(total / filteredcount.length));

            if (valt < 0)
                valt = 0.0;

            if (ymaxvalue < valt)
                ymaxvalue = valt;
            //valt = parseFloat(valt).toFixed(2);
            dataweekcount.push({
                y: valt,
                patientcount: patientcount
            }); //, patientcount: 10

            // dataweekcount.push(valt);

        }
        jsonObj['name'] = medication;
        jsonObj['data'] = dataweekcount;
        seriesy.push(jsonObj);
        // console.log('seriesy');
        // console.log(seriesy);

        Highcharts.chart(container, {
            chart: {
                zoomType: 'xy',
                // width: 1135
            },
            title: {
                text: ' '

            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: categoriesx,
                title: {
                    text: 'Weeks'
                },
                plotBands: plotBands
            },
            plotOptions: {
                series: {
                    events: {
                        legendItemClick: function () {
                            var visibility = this.visible ? 'visible' : 'hidden';
                        }
                    }
                },
                line: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return Highcharts.numberFormat(this.y, 2) > 0 ? Highcharts.numberFormat(this.y, 2) : '';
                        }
                    }
                }
            },
            yAxis: {
                min: 0,
                max: (ymaxvalue + 5),
                lineWidth: 1,
                // tickInterval: 1000,
                title: {
                    text: 'Viral Load (in log)'
                },
                // labels: {
                //     enabled: false,
                //     format: yAxisData == '{value}'
                // },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }],
                gridLineWidth: 0
            },
            // tooltip: {
            //     valueSuffix: '°C'
            // },
            // legend: {
            //     layout: 'vertical',
            //     align: 'right',
            //     verticalAlign: 'top',
            //     borderWidth: 0
            // },
            legend: false,
            series: seriesy,
            tooltip: {
                formatter: function () {
                    var s = '';

                    $.each(this.points, function () {
                        s += '<br/><b>Drug Name: </b>' +
                            this.series.name;
                        s += '<br /><b>Week: </b>' + this.x;
                        s += '<br/><b>Viral Load: </b>' +
                            this.y.toFixed(2);
                        s += '<br/><b>Patient Count: </b>' +
                            this.point.patientcount;

                    });

                    return s;
                },
                shared: true
            }
        });
        $('#divWeekResponse').show();
    } else {
        $('#ap_AggregateSVRChart').html('<div style="text-align: center;margin-top: 18%; min-height: 300px;">No Data Found</div>');
        $('#divWeekResponse').hide();
    }



    // function checkIfEnoughDataExist(medicationData){
    //     let flag = false;
    //     for(let i = 0; i<medicationData.length; i++){
    //         if(parseFloat(medicationData[i].ViralLoad) != 0){
    //             flag = true;
    //         }
    //     }
    //     return flag;
    // }

    /**
     * @author : Yuvraj 15th Feb 17
     * @desc : Added Check that data should be greater than zero in baseline as well as Followup period.
     */
    function checkIfEnoughDataExist(medicationData, rangeto) {
        let flag = false;
        let baselineFlag = false;
        let followupFlag = false;
        for (let i = 0; i < medicationData.length; i++) {
            if (parseFloat(medicationData[i].ViralLoad) != 0) {

                if (medicationData[i].Weeks < 0) {
                    baselineFlag = true;
                }
                if (medicationData[i].Weeks > parseInt(rangeto)) {
                    followupFlag = true;
                }
            }
        }

        if (baselineFlag && followupFlag) {
            flag = true;
        }
        return flag;
    }

}

function getprovidercount(data){
         // Variables used for C3js Data.
        var groups = _.uniq(_.keys(_.groupBy(data, 'genotype')));
 
        let genotypeGroup = _.groupBy(data, 'Year');
       let tot=0;
        _.each(genotypeGroup, function (value, key) {
      
            let dataCount = _.countBy(value, 'genotype');
            for (let i = 0; i < groups.length; i++) {
                if (!dataCount[groups[i]]) {
                    dataCount[groups[i]] = 0;
                }
                
                let genotype = groups[i];
                let currGenoData = _.where(value, {
                    genotype: genotype
                });
               tot += getUniqueArray(_.pluck(currGenoData, 'providerId')).length
               
                }
        });
      return tot;
}
function getuniqValue(data){
    return _.uniq(_.pluck(data,'patientId')).length;
}
