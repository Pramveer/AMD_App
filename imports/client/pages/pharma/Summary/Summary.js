import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import {
    HTTP
} from 'meteor/http';
import './Summary.html';

import * as pharmaLib from '../pharmaLib.js';
// Nisha 02/20/2017 Change in functions for common cohor in fetch and Render
let pharmaData = [];
let dummyMedication = [];
let pharmaDataTotalCount = [];
// let treatedTreatmentSelect = null;
// let treatedCirrhosisSelect = null;
// let treatedmedication = null;
Template.Summary.onCreated(function() {
    //var self = this;
    pharmaLib.showChartLoading();
    //set pharma header
    //pharmaLib.setPharmaHeader();
    // pharmaLib.setPharmaHeaderTabData();
    Template.Summary.fetchAndRenderData();
});

Template.Summary.rendered = () => {
    //show the show patients list icon
    //$('.globalshowPatientPharma').show();
    // Nisha 02/14/2017 Show the menu after navigation from payer tab
    // pharmaLib.setAdvancedSearchFilters();
    // //render header for pharma tab
    // //set header of pharma
    highLightTab('Pharma');
    pharmaLib.setPharmaHeader();
    //$('.searchPatientCountHeaderPharma').html(0);

}


Template.Summary.events({
    'click .js-showPateintsList': function(event, template) {
        let medicine = '';
        if (Pinscriptive.Filters) {
            medicine = Pinscriptive.Filters.medication ? Pinscriptive.Filters.medication.replace(/'/g, '').toString() : 'ALL';
        }
        pharmaLib.prepareDomForPharmaPatients(pharmaDataTotalCount, medicine);
        $('.pharmaPatientsPopup').show();
    },
    'click .pharma_closebtn': function(event, template) {
        $('.pharmaPatientsPopup').hide();
    },
    'click .js-comparativeEngine': function(e) {
        renderComaparativeOptionsView();
    },
    'change #showSelectedPopulationPharma': () => {
        Router.current().render(Template.MarketOverview);
    }
});

//array in form "'a','1','1a'"
let stringFormattedArray = (data) => {
    s = [];
    for (let i = 0; i < a.length; i++) {
        s.push("'" + a[i] + "'")
    };

    return s.join(',');
}
Template.Summary.helpers({});

let setPatientCountData = (data) => {

    $('#malePatientsC').html(data['M'] == undefined ? 0 : commaSeperatedNumber(data['M']));
    $('#femalePatientsC').html(data['F'] == undefined ? 0 : commaSeperatedNumber(data['F']));
    $('#unknownPatientsC').html(data['U'] == undefined ? 0 : commaSeperatedNumber(data['U']));
}
let DrawChart = (chartData) => {
    //var medicine = $("#pharma-medication").val();
    //console.log(' pharma selected value = '+ $("#pharma-medication").val());
    BindTopData();
    pharmaDataTotalCount = pharmaData; //pharmaLib.getDrugFilteredData(pharmaData);

    BindTotalValues(pharmaDataTotalCount, '');
    renderPharmaChartsAge(chartData.age);
    renderPharmaChartsRace(chartData.race);
    renderPharmaChartsNonCirrhosis(chartData.treatment);
    renderPharmaMortalitychart(chartData.mortality);
    renderPharmaChartsCirrhosis(chartData.cirrhosis);
    renderPharmaChartsGenotype(chartData.genotype);
    pharmaLib.setPharmaHeaderTabData();
}

function BindTotalValues(pharmaDataTotalCount) {
    if (pharmaData) {

        $('#race-distribution-N').html(commaSeperatedNumber(pharmaDataTotalCount));
        $('#age-distribution-N').html(commaSeperatedNumber(pharmaDataTotalCount));
        $('#treatment-distribution-N').html(commaSeperatedNumber(pharmaDataTotalCount));
        $('#mortality-distribution-N').html(commaSeperatedNumber(pharmaDataTotalCount));
        $('#cirrhosis-distribution-N').html(commaSeperatedNumber(pharmaDataTotalCount));
        $('#genotype-distribution-N').html(commaSeperatedNumber(pharmaDataTotalCount));

        $('#medication-N').html(commaSeperatedNumber(pharmaDataTotalCount));
        //Session.set('pharmapatienttotal', pharmaDataTotalCount.length);

        // OLD CODE
        // $('.searchPatientCountHeaderPharma').html(pharmaDataTotalCount);
        //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
        setCohortPatientCount({ patientCount: pharmaDataTotalCount });
        //$('#totalPatients').html(commaSeperatedNumber(pharmaDataTotalCount.length));
        if (Pinscriptive.Filters) {
            let medicine = Pinscriptive.Filters.medication ? Pinscriptive.Filters.medication.replace(/'/g, '').toString() : 'ALL';
            // $('#medicinalPatientsCount').html(convertFirstLetterCaps(medicine) + " Medications");
            // $('#medication-info-name').html(convertFirstLetterCaps(medicine) + " Medications");
            $('#medicinalPatientsCount').html(convertFirstLetterCaps("Medications"));
            $('#medication-info-name').html(convertFirstLetterCaps("Medications"));
        } else {
            $('#medicinalPatientsCount').html(convertFirstLetterCaps("ALL Patients"));
            $('#medication-info-name').html(convertFirstLetterCaps("ALL Medications"));
        }
    }
}


function BindTopData() {
    //  var uniquepatients = _.pluck(pharmaData, 'PATIENT_ID_SYNTH');
    //$('#uniquePatients').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
    $('#uniquePatients').html(commaSeperatedNumber(pharmaData));
}

function renderPharmaMortalitychart(pharmaDataMR) {
    let container = "#pharma_MortalityRate";
    d3.select(container).selectAll("*").remove();
    let data = [];

    $('#mortality-distribution-N').html(commaSeperatedNumber(pharmaDataMR.total));

    data = pharmaDataMR.data;

    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: data,
            keys: {
                value: pharmaDataMR.keys
            },
        },
        size: {
            height: 200,
            width: 300
        },
        donut: {
            width: 55
        }
        /*,
                legend: {
                    show: true,
                    position: 'right',
                }*/
        ,
        color: {
            pattern: ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", '#f1cb6a']
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ["#2e7e97", "#abd6ba", "#e95a52", "#69bae7", '#f1cb6a'];
                let dataObj = d[0];

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + dataObj.id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patients Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });


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

function getApriRange(apri) {
    let range = 0;

    if (apri >= 1) {
        range = '>1';
    } else if (apri < 1) {
        range = '<1';
    } else {
        console.log('no data');
    }
    return { range: range }
}

let renderPharmaChartsGenotype = (pharmaDataNC) => {
    let container = "#pharma_GenotypeDistribution";
    d3.select(container).selectAll("*").remove();
    $('#genotype-distribution-N').html(commaSeperatedNumber(pharmaDataNC.total));

    let data = pharmaDataNC.data;
    // data.sort((a, b) => a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, ''));
    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: data,
            keys: {
                value: pharmaDataNC.keys
            }
        },
        size: {
            height: 200,
            width: 300
        },
        donut: {
            width: 55
        },
        color: {
            pattern: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900']
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                let dataObj = d[0];

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div> Genotype:' + dataObj.id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patients Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;

            }
        }
    });


}


let renderPharmaChartsRetreatmentGenotype = (pharmaDataNC) => {
    let container = "#pharma_RetreatedDistribution";
    d3.select(container).selectAll("*").remove();

    $('#retreated-distribution-N').html(commaSeperatedNumber(pharmaDataNC.patientLength));
    let data = pharmaDataNC.data;
    // data.sort((a, b) => a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, ''));
    if (data.length > 0) {
        let chart = c3.generate({
            bindto: container,
            data: {
                type: 'donut',
                json: data,
                keys: {
                    value: pharmaDataNC.keys
                }
            },
            size: {
                height: 200,
                width: 300
            },
            donut: {
                width: 55
            },
            color: {
                pattern: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900']
            },
            tooltip: {
                grouped: false,
                contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                    var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                    let dataObj = d[0];

                    let html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div> Genotype:' + dataObj.id + '</div>' +
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
        $(container).html(`<div style="text-align: center;padding-top: 5%;color: red;">No patient took retreatment for selected cohort criteria</div>`);
    }

}



function renderPharmaChartsCirrhosis(pharmaDataNC) {
    let container = "#pharma_Cirrhosis";
    d3.select(container).selectAll("*").remove();
    $('#cirrhosis-distribution-N').html(commaSeperatedNumber(pharmaDataNC.total));
    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: pharmaDataNC.data,
            keys: {
                value: pharmaDataNC.keys
            }
        },
        size: {
            height: 200,
            width: 300
        },
        donut: {
            width: 55
        },
        color: {
            pattern: ['#2e7e97', '#abd6ba']
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#2e7e97', '#abd6ba'];
                let dataObj = d[0];

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + dataObj.id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patients Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;

            }
        }
    });

}


function renderPharmaChartsNonCirrhosis(pharmaDataNC) {
    let container = "#pharma_noncirrhosis";
    d3.select(container).selectAll("*").remove();
    $('#treatment-distribution-N').html(commaSeperatedNumber(pharmaDataNC.total));
    //prepare chart
    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: pharmaDataNC.data,
            keys: {
                value: pharmaDataNC.keys
            }
        },
        size: {
            height: 200,
            width: 300
        },
        donut: {
            width: 55
        },
        color: {
            pattern: ['#2e7e97', '#abd6ba']
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#2e7e97', '#abd6ba'];
                let dataObj = d[0];
                // console.log(dataObj);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + dataObj.id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patients Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });

}

function getAgeRange(age) {
    let agerange = 0;
    if (age >= 70) {
        agerange = '70+';
    } else if (age >= 0 && age <= 17) {
        agerange = '0-17';
    } else if (age >= 18 && age <= 34) {
        agerange = '18-34';
    } else if (age >= 35 && age <= 50) {
        agerange = '35-50';
    } else if (age >= 51 && age <= 69) {
        agerange = '51-69';
    } else {
        console.log('no data');
    }
    return { agerange: agerange }
}

function renderPharmaChartsRace(pharmaDataRace, total_patients) {

    let data = [];
    //let total_patients = 0;
    for (let raceGroup in pharmaDataRace) {
        let json = pharmaDataRace[raceGroup];
        json['patients'] = json['count'];
        //total_patients += json['count'];
        data.push(json);
    }
    $('#race-distribution-N').html(commaSeperatedNumber(total_patients));
    data.sort((a, b) => b['patients'] - a['patients']);

    let containerrace = "#pharma_racechart";
    d3.select(containerrace).selectAll("*").remove();

    var chart = c3.generate({
        bindto: containerrace,
        size: {
            height: 140,
            width: 280
        },
        bar: {
            width: {
                ratio: 0.85
            }
        },
        color: {
            pattern: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900']
        },
        data: {
            json: data, // specify that our above json is the data
            keys: {
                x: 'race', // specify that the "name" key is the x value
                value: ["patients"] // specify that the "age" key is the y value
            },
            type: 'bar',
            color: function(inColor, data) {
                var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                if (data.index !== undefined) {
                    return colors[data.index];
                }

                return inColor;
            }
        },
        axis: {
            rotated: true,
            x: {
                type: 'category',
                tick: {
                    multiline: false
                }
            },
            y: {
                show: false
            }
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                let dataObj = d[0];
                let filteredData = data[dataObj.index];
                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + filteredData.race + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patient Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
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

function renderPharmaChartsAge(pharmaDataAge, total_patients) {

    let data = [];
    //let total_patients = 0;
    for (let ageGroup in pharmaDataAge) {
        let json = pharmaDataAge[ageGroup];
        json['patients'] = json['count'];
        //total_patients += json['count'];
        data.push(json);
    }
    $('#age-distribution-N').html(commaSeperatedNumber(total_patients));
    //sort chart data
    // data.sort((a, b) => {
    //     let age1 = a.age.split('-')[0],
    //         age2 = b.age.split('-')[0];
    //
    //     age1 = age1.replace('+', '');
    //     age2 = age2.replace('+', '');
    //
    //     return age1 - age2;
    // });

    let container = "#pharma_chart";
    d3.select(container).selectAll("*").remove();

    var chart = c3.generate({
        bindto: container,

        size: {
            height: 140,
            width: 280
        },
        bar: {
            width: {
                ratio: 0.85
            }
        },
        color: {
            pattern: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7']
        },
        data: {
            json: data, // specify that our above json is the data
            keys: {
                x: 'age', // specify that the "name" key is the x value
                value: ["patients"] // specify that the "age" key is the y value
            },
            type: 'bar',
            color: function(inColor, data) {
                var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'];
                if (data.index !== undefined) {
                    return colors[data.index];
                }
                return inColor;
            }
        },
        axis: {
            rotated: true,
            x: {
                type: 'category'
            },
            y: {
                show: false
            }
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'];
                let dataObj = d[0];
                let filteredData = data[dataObj.index];
                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + filteredData.age + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patients Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        legend: {
            show: false
        }
    });

    //  console.log('render Age chart');
}


// let fetchAndRenderData = (dbparams, templateObj) => {
//     // console.log("*** Pharma Sumaary ***")
//     // console.log(dbparams);
//     //check for tabs
//     dbparams['tabname'] = 'summary';
//     //get data for summary tabs
//     templateObj.autorun(function() {
//         Meteor.call('getPatientPharmaData', dbparams, function(error, result) {
//             if (error) {
//                 pharmaLib.hideChartLoading();
//             } else {
//                 pharmaData = result.pharmaData;
//                 // Pinscriptive['pharma']['drugfulldata'] = pharmaData;
//                 //console.log(result);
//                 //Session.set('pharmapatienttotal',result.totalPatients);
//                 $('#totalPatients').html(commaSeperatedNumber(result.totalPatients));
//                 $('.searchPatientCountHeaderPharma').html(result.totalPatients);
//                 setPatientCountData(result.chartData.gender);
//                 pharmaLib.hideChartLoading();
//                 //render charts
//                 DrawChart(result.chartData);
//             }
//         });
//     });
// }

Template.Summary.fetchAndRenderData = () => {
    let params = {};

    if (Pinscriptive.Filters) {
        params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
    }
    pharmaLib.showChartLoading();
    params['tabname'] = 'summary';
    //get data for summary tabs
    // templateObj.autorun(function() {
    // Meteor.call('getPatientTraits',params,function(result){
    //   console.log('patient traits api');
    //   console.log(result);
    // })
    //     var saveData = $.ajax({
    //       type: 'POST',
    //       url: "http://localhost:8080/getData",
    //       data: params,
    //       contentType: "application/json",
    //       success: function(resultData) { console.log(resultData) }
    // });

    // var apiUrl = 'http://localhost:8080/medication';
    // $.ajax({
    //   url: "http://localhost:8080/medication",
    //   beforeSend: function( xhr ) {
    //     xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
    //   }
    // })
    //   .done(function( data ) {
    //       pharmaLib.hideChartLoading();
    //       //console.log(data);
    //       let realData = JSON.parse(data);
    //
    //       //set unique patients
    //       $('#uniquePatients').html(commaSeperatedNumber(realData.patients));
    //       $('.searchPatientCountHeaderPharma').html(realData.patients);
    //       //race chart
    //       let race_data = JSON.parse(realData.race);
    //       let race_desc = race_data['RACE_DESC'];
    //       let chartData = [];
    //       let count_race = 0;
    //       for(let key in race_desc){
    //         let json = {};
    //         json['count'] = race_desc[key];
    //         json['race'] = key;
    //         count_race += race_desc[key];
    //         chartData.push(json);
    //       }
    //       //plot race chart
    //       renderPharmaChartsRace(chartData,count_race);
    //
    //       //prepare cirrhosis data
    //       let cirrh_data = JSON.parse(realData.cirr);
    //       let cirrh_desc = cirrh_data['CIRRHOSIS'];
    //       chartData = [];
    //       let keys = [];
    //       let cirr_count = 0;
    //       for(let key in cirrh_desc){
    //         let json = {};
    //         json[key] = cirrh_desc[key];
    //         cirr_count += cirrh_desc[key];
    //         keys.push(key);
    //         chartData.push(json);
    //       }
    //       renderPharmaChartsCirrhosis({data:chartData,keys:keys,total:cirr_count});
    //
    //
    //       //treatment distribution chart
    //       let treat_data = JSON.parse(realData.treatment);
    //       let treat_desc = treat_data['TREATMENT'];
    //       chartData = [];
    //       keys = [];
    //       let treatment_count = 0;
    //       for(let key in treat_desc){
    //         let json = {};
    //         json[key] = treat_desc[key];
    //         treatment_count += treat_desc[key];
    //         keys.push(key);
    //         chartData.push(json);
    //       }
    //       renderPharmaChartsNonCirrhosis({data:chartData,keys:keys,total:treatment_count});
    //
    //       //genotype distribution data
    //       let geno_data = JSON.parse(realData.genotype);
    //       let geno_desc = geno_data['GENOTYPE'];
    //       chartData = [];
    //       keys = [];
    //       let geno_count = 0;
    //       for(let key in geno_desc){
    //         let json = {};
    //         json[key] = geno_desc[key];
    //         geno_count += geno_desc[key];
    //         keys.push(key);
    //         chartData.push(json);
    //       }
    //       renderPharmaChartsGenotype({data:chartData,keys:keys,total:geno_count});
    //
    //       //retreatment chart data
    //       let regeno_data = JSON.parse(realData.retreatment);
    //       let regeno_desc = regeno_data['GENOTYPE'];
    //       chartData = [];
    //       keys = [];
    //       let patient_retreatment = 0
    //       for(let key in regeno_desc){
    //         let json = {};
    //         json[key] = regeno_desc[key];
    //         patient_retreatment += regeno_desc[key];
    //         keys.push(key);
    //         chartData.push(json);
    //       }
    //       renderPharmaChartsRetreatmentGenotype({data:chartData,keys:keys,patientLength:patient_retreatment});
    //
    //       //age distribution chart
    //       let age_data = JSON.parse(realData.age);
    //       let age_desc = age_data['AGE'];
    //       chartData = [];
    //       let age_count = 0;
    //       for(let key in age_desc){
    //         let json = {};
    //         json['count'] = age_desc[key];
    //         age_count += age_desc[key];
    //         json['age'] = key;
    //         chartData.push(json);
    //       }
    //       console.log(chartData);
    //       //plot race chart
    //       renderPharmaChartsAge(chartData,age_count);
    //
    //       //mortality rate chart
    //       let mortality_data = JSON.parse(realData.mortality);
    //       let mortality_desc = mortality_data['DEAD_IND'];
    //       chartData = [];
    //       keys = [];
    //       let mortality_count = 0;
    //       for(let key in mortality_desc){
    //         let json = {};
    //         json[key] = mortality_desc[key];
    //         mortality_count += mortality_desc[key];
    //         keys.push(key);
    //         chartData.push(json);
    //       }
    //       renderPharmaMortalitychart({data:chartData,keys:keys,total:mortality_count});
    //
    //       //pateint count gender
    //       let gender = JSON.parse(realData.gender);
    //       let gendercd = gender['GENDER_CD'];
    //       let total_patients_gen = 0;
    //       for(let key in gendercd){
    //         total_patients_gen += gendercd[key];
    //       }
    //       $('#totalPatients').html(commaSeperatedNumber(total_patients_gen));
    //       $('#medication-N').html(commaSeperatedNumber(total_patients_gen));
    //       setPatientCountData(gendercd);
    //
    //
    //   });
    Meteor.call('getPatientPharmaData', params, function(error, result) {
        if (error) {
            pharmaLib.hideChartLoading();
        } else {
            var decompressed_object = LZString.decompress(result);
            var resulting_object = JSON.parse(decompressed_object);
            pharmaData = resulting_object.totalPatients;
            // console.log(resulting_object);
            $('#totalPatients').html(commaSeperatedNumber(resulting_object.totalPatients));
            // OLD CODE
            //$('.searchPatientCountHeaderPharma').html(resulting_object.totalPatients);
            //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
            pharmaLib.setAdvancedSearchFilters();
            pharmaLib.setPharmaHeader();

            setCohortPatientCount({ patientCount: resulting_object.totalPatients });
            // console.log(resulting_object);
            setPatientCountData(resulting_object.chartData.gender);
            pharmaLib.hideChartLoading();
            renderPharmaChartsRetreatmentGenotype(resulting_object.RetreatedPatientChartData);
            //render charts
            DrawChart(resulting_object.chartData);
        }
    });
    // });
}



let renderComaparativeOptionsView = () => {
    var comparativeEngine = new ComparativeEngine();
    comparativeEngine.renderCompareOptiosView();
}