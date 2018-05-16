import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './AdvanceAnalytics.html';
import * as pharmaLib from '../pharmaLib.js';
// Nisha 02/20/2017 Change in functions for common cohor
//  Nisha 02/28/2017 modified the page commented out "analytics-tooltipHead" to remove the heading 
let pharmaViralScoreAnalysisData = [];
let pharmaData = [];
let pharmaGenotypeData = [];
let dummyMedication = [];
let nodata = '';
let nodatafound = '';
let chartduration = '';
Template.AdvanceAnalytics.onCreated(function() {
    //let self = this;
    pharmaLib.showChartLoading();
    //let params={};
    //get filter from Advance Filter when user comes from patient or other tabs to Pharma Tab
    //set pharma header
    // pharmaLib.setPharmaHeader();

    //render data fetched from backend
    Template.AdvanceAnalytics.fetchAndRenderData();
});

Template.AdvanceAnalytics.rendered = function() {
    //hide the show patients list icon
    $('.globalshowPatientPharma').hide();
    highLightTab('Pharma');
    // pharmaLib.setAdvancedSearchFilters();

    // //set header data
    // pharmaLib.setPharmaHeader();
}

function DrawViralScoreCharts(AdvanceAnalyticsData) {
    nodata = '';
    nodatafound = '';
    var item = 0;
    medicine = '';
    var topitemcount = '';
    var bottomitemcount = '';
    $("#pharmanotes").empty();
    $('#pharma-medicationAA').selectize();
    // var medicine =  $("#pharma-medicationAA").val();
    if (Pinscriptive.Filters) {
        medicine = Pinscriptive.Filters.medication ? Pinscriptive.Filters.medication.replace(/'/g, '').toString() : 'ALL';
    } else {
        medicine = '';
    }


    $("#genotypegraphcontainers").empty();

    //set header data
    pharmaLib.setPharmaHeaderTabData();


    if (AdvanceAnalyticsData.BeforeStart != null) {

        $("#genotypegraphcontainers").append(`<div class="col-lg-12" style="margin-bottom:30px;"><h3 class="containertitle " style="display:inline-block;font-size: 20px ! important;">Viral Load Distribution </h3>
         <span class="macLearningsubTabs-infoIcon mlInfoTip" >
           <div class="analytics-tooltip mlInfoTip_tooltip" >
            <!--div class="analytics-tooltipHead">
            Viral Load Distribution
            </div-->
            <div class="analytics-tooltipBody" style="font-size: 13px;">
             <span class="boldfnt">Definition</span> - This charts represent viral load distribution for all the test results in 2 stages. <br><br>
              1) Distribution of results for the tests done before starting the treatment.<br><br>
              2) Distribution of results for the tests done after the treatment ends.<br><br>
            </div>
           </div>
          </span></div>`);

        item = item + 1;
        topitemcount = '';
        bottomitemcount = '';
        if (item % 2 != 0) {
            topitemcount = ''; //<div class="">';
            bottomitemcount = ''; //</div>';
        }
        //removed mlSubTabsChartSectionWrap to col-lg-3
        $("#genotypegraphcontainers").append(topitemcount + '<div class="col-lg-6 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
            '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Viral Load <i style="color:#F04823">before</i> starting ' + (medicine == 'ALL' ? medicine : 'Medications') + ' Treatment </h3> ' +
            '<div id="pharma_VLbeforestart"></div>')
        $("#genotypegraphcontainers").append('</div>' + bottomitemcount);
    } else
        nodatafound = nodatafound + "** No data found for Viral Load before starting " + medicine + " treatment<br/>";

    renderViralScoreCharts('BeforeStart', "#pharma_VLbeforestart", 1, AdvanceAnalyticsData.BeforeStart);

    // Nisha 02/14/2017 Commented to remove the During Medication 
    // if (AdvanceAnalyticsData.DuringMedication != null) {
    //     item = item + 1;
    //     topitemcount = '';
    //     bottomitemcount = '';
    //     if (item % 2 != 0) {
    //         topitemcount = ''; //<div class="">';
    //         bottomitemcount = ''; //</div>';
    //     }
    //     //removed mlSubTabsChartSectionWrap to col-lg-3
    //     $("#genotypegraphcontainers").append(topitemcount + '<div class="col-lg-4 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +

    //         '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Viral Load <i style="color:#F04823">during</i> ' + (medicine == 'ALL' ? medicine : 'Medications') + ' Consumption</h3> ' +

    //         '<div id="pharma_VLduringmedication"></div>')
    //     $("#genotypegraphcontainers").append('</div>' + bottomitemcount);
    // } else
    //     nodatafound = nodatafound + "** No data found for Viral Load during " + medicine + " treatment<br/>";


    // renderViralScoreCharts('DuringMedication', "#pharma_VLduringmedication", 1, AdvanceAnalyticsData.DuringMedication);


    if (AdvanceAnalyticsData.AfterStart != null) {
        item = item + 1;
        topitemcount = '';
        bottomitemcount = '';
        if (item % 2 != 0) {
            topitemcount = ''; //<div class="">';
            bottomitemcount = ''; //</div>';
        }

        $("#genotypegraphcontainers").append(topitemcount + '<div class="col-lg-6 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
            '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Viral Load <i style="color:#F04823">after</i> ending ' + (medicine == 'ALL' ? medicine : 'Medications') + ' Treatment</h3> ' +
            '<div id="pharma_VLafterend"></div>')
        $("#genotypegraphcontainers").append('</div>' + bottomitemcount);
    } else
        nodatafound = nodatafound + '** No data found for Viral Load after ending ' + medicine + ' treatment<br/>';

    renderViralScoreCharts('AfterEnd', "#pharma_VLafterend", 1, AdvanceAnalyticsData.AfterStart);

    $("#genotypegraphcontainers").append(`<div class="col-lg-12" style="margin-top:30px;margin-bottom:30px;"><h3 class="containertitle" style="display:inline-block;font-size: 20px ! important;">Prescription Duration Distribution</h3>
     <span class="macLearningsubTabs-infoIcon mlInfoTip" >
           <div class="analytics-tooltip mlInfoTip_tooltip" >
            <!--div class="analytics-tooltipHead">
            Prescription Duration Distribution
            </div-->
            <div class="analytics-tooltipBody" style="font-size: 13px;">
             <span class="boldfnt">Definition</span> - This charts represent treatment period distribution for all the patients,
             and subsequent charts represent the same information broken by each Genotype. <br><br>
            </div>
           </div>
          </span></div>`);

    if (pharmaGenotypeData.Genotypeall != null) {
        item = item + 1;
        topitemcount = '';
        bottomitemcount = '';
        if (item % 2 != 0) {
            topitemcount = ''; // '<div class="">';
            bottomitemcount = ''; //'</div>';
        }


        $("#genotypegraphcontainers").append(topitemcount + '<div class="col-lg-4 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
            '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Distribution of ALL ' + (medicine == 'ALL' ? '' : 'Medications') + ' Prescription Duration<div id="PDBack" class="customChartBackButton backButtonCss" style="position:inherit !important;display:none;">Back to <span id="selectedduration"></span></div></h3> ' +
            '<div id="pharma_VLweekdistribution"></div>' +
            '<div id="pharma_VLweek"  style="display:none"> ' +
            '<div id="pharma_VLweekdistributiondrilldown"> </div></div>');
        $("#genotypegraphcontainers").append('</div>' + bottomitemcount);
    } else
        nodatafound = nodatafound + '** No data found for Distribution of ' + medicine + ' Prescription Duration<br/>';

    renderWeeklyCharts('prescriptionduration', "#pharma_VLweekdistribution", 0, pharmaGenotypeData.Genotypeall);

    let genotypes = []; // ["1a", "1b", "2", "3", "4"];
    let itemcount = 0;
    let additionalheadertop = '';
    let additionalheaderbottom = '';

    if (pharmaGenotypeData.Genotype1a.dataflag == "true")
        genotypes.push('1a');

    if (pharmaGenotypeData.Genotype1b.dataflag == "true")
        genotypes.push('1b');

    if (pharmaGenotypeData.Genotype2.dataflag == "true")
        genotypes.push('2');

    if (pharmaGenotypeData.Genotype3.dataflag == "true")
        genotypes.push('3');

    if (pharmaGenotypeData.Genotype4.dataflag == "true")
        genotypes.push('4');

    for (i = 0; i < genotypes.length; i++) {
        if (true) {
            // for (var key in pharmaGenotypeData) {
            // console.log(pharmaGenotypeData[key]);
            // var genotype = '';
            // if (pharmaGenotypeData[key]) { // ( && pharmaGenotypeData[key].length > 0) {
            // switch (key) {
            //     case 'Genotype1a':
            //         genotype = "1a";
            //         break;
            //     case 'Genotype1b':
            //         genotype = "1b";
            //         break;
            //     case 'Genotype2':
            //         genotype = "2";
            //         break;
            //     case 'Genotype3':
            //         genotype = "3";
            //         break;
            //     case 'Genotype4':
            //         genotype = "4";
            // }

            itemcount = itemcount + 1;
            additionalheadertop = '';
            additionalheaderbottom = '';
            if (itemcount % 2 != 0) {
                additionalheadertop = ''; // '<div class="">';
                additionalheaderbottom = ''; // '</div>';
            }

            $("#genotypegraphcontainers").append(additionalheadertop + '<div class="col-lg-4 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
                '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Distribution of ' + (medicine == 'ALL' ? medicine : 'Medications') + ' Prescription Duration by Genotype "<i style="color:#F04823">' + genotypes[i] + '</i>"<div id="PDBack' + genotypes[i] + '" class="customChartBackButton backButtonCss" style="position:inherit !important;display:none;">Back to <span id="selectedduration' + genotypes[i] + '"></span></div></h3> ' +
                '<div id="pharma_VLweekdistribution' + genotypes[i] + '">' + genotypes[i] + '</div>' +
                '<div id="pharma_VLweek' + genotypes[i] + '"  style="display:none"> ' +
                '<div id="pharma_VLweekdistribution' + genotypes[i] + 'drilldown">' + genotypes[i] + '</div></div>');
            $("#genotypegraphcontainers").append('</div>' + additionalheaderbottom);

        } else
            nodata = nodata + genotypes[i] + ',';
    }


    renderWeeklyCharts('1a', "#pharma_VLweekdistribution1a", 0, pharmaGenotypeData.Genotype1a);
    renderWeeklyCharts('1b', "#pharma_VLweekdistribution1b", 0, pharmaGenotypeData.Genotype1b);
    renderWeeklyCharts('2', "#pharma_VLweekdistribution2", 0, pharmaGenotypeData.Genotype2);
    renderWeeklyCharts('3', "#pharma_VLweekdistribution3", 0, pharmaGenotypeData.Genotype3);
    renderWeeklyCharts('4', "#pharma_VLweekdistribution4", 0, pharmaGenotypeData.Genotype4);

}


let renderViralScoreCharts = (reporttype, container, color1, ChartData) => {
    // console.log(reporttype);

    let groupedData = [];
    let labelb = '';
    let labela = '';
    let tooltiplabel = '';

    labelb = 'Viral Load Score';
    labela = 'Total Number of Patients';
    tooltiplabel = 'Viral Load Test Count';
    // Nisha 02/14/2017 Commented and changed the X axis to add the Undetectable  
    // let xaxisvalues = ['x', "<0.2M", "0.2M-1M", "1M-5M", "5M-25M", "25M+"];
    let xaxisvalues = ['x', "Undetectable", "<0.2M", "0.2M-1M", "1M-5M", "5M-25M", "25M+"];
    let yaxisvalues = ChartData.yaxisvalues;

    let patientuniquecount = ChartData.patientuniquecount;

    let colors = [];
    // if (color1 == 1) {
    colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
    // } else {
    // colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
    // }
    if ($(container).length != 0) {
        d3.select(container).selectAll("*").remove();
        if (false) { //pharmaDataViralScores.length <= 0) {
            $(container).html('<div style="text-align: center;padding-top: 5%;height:300;width:350;">No Data Found</div>');
        } else {
            var chart = c3.generate({
                bindto: container,
                padding: {
                    top: 20
                },
                bar: {
                    width: {
                        ratio: 0.85
                    }
                },
                size: {
                    height: 300,
                    width: 600
                },
                color: {
                    pattern: colors
                },
                data: {
                    x: 'x',
                    columns: [
                        xaxisvalues,
                        yaxisvalues
                    ],
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
                            //  console.log(probgroup.length);
                            if (i != undefined) {
                                labelv = commaSeperatedNumber(yaxisvalues[i + 1]);
                                return labelv;
                            } else {}
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
                        // var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                        let dataObj = d[0];
                        let htmlconditional = '';
                        if (!(reporttype == 'prescriptionduration' || reporttype == 'genotype')) {
                            htmlconditional = '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patient Counts: ' + commaSeperatedNumber(patientuniquecount[dataObj.index + 1]) + '</div>';
                        }
                        let html = '';
                        html = '<div class="customC3ToolTip">' +
                            '<div class="customC3ToolTip-Header">' +
                            '<div>' + xaxisvalues[dataObj.index + 1] + '</div>' +
                            '</div>' +
                            '<div class="customC3ToolTip-Body">' +
                            '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> ' + tooltiplabel + ': ' + commaSeperatedNumber(patientuniquecount[dataObj.index + 1]) + '</div>' +
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
    }
}



let renderWeeklyCharts = (reporttype, container, color1, ChartData) => {
        //console.log(ChartData);

        let groupedData = [];
        let labelb = '';
        let labela = '';
        let tooltiplabel = '';

        labelb = 'Treatment Period (Week)';
        labela = 'Total Number of Patients'; //'No. of Patients';
        tooltiplabel = 'Patient Count';
        let xaxisvalues = ChartData.xaxisvalue;

        let yaxisvalues = ChartData.yaxisvalues;

        let patientuniquecount = ChartData.patientuniquecount;

        let colors = [];
        if (color1 == 1) {
            colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
        } else {
            colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
        }
        if ($(container).length != 0) {
            d3.select(container).selectAll("*").remove();
            if (false) { //pharmaDataViralScores.length <= 0) {
                $(container).html('<div style="text-align: center;padding-top: 5%;height:300;width:350;">No Data Found</div>');
            } else {
                var chart = c3.generate({
                    bindto: container,
                    padding: {
                        top: 20,
                        bottom: 20 // Nisha 02/13/2017 added the padding as text was cutting off 
                    },
                    bar: {
                        width: {
                            ratio: 0.85
                        }
                    },
                    size: {
                        height: 300,
                        width: 360
                    },
                    color: {
                        pattern: colors
                    },
                    data: {
                        x: 'x',
                        columns: [
                            xaxisvalues,
                            yaxisvalues
                        ],
                        type: 'bar',
                        onclick: function(d, i) {
                            // console.log("onclick", d, i);
                            // console.log(xaxisvalues[d.index + 1]);
                            // console.log(reporttype);
                            //Nisha 02/27/2017 Modified for Prescription Duration
                            renderPrescriptionDuration(reporttype, xaxisvalues[d.index + 1], container + 'drilldown', container, container.replace("distribution", ""));
                        },
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
                                //  console.log(probgroup.length);
                                if (i != undefined) {
                                    labelv = commaSeperatedNumber(yaxisvalues[i + 1]);
                                    return labelv;
                                } else {}
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

                            let html = '';
                            html = '<div class="customC3ToolTip">' +
                                '<div class="customC3ToolTip-Header">' +
                                '<div>' + xaxisvalues[dataObj.index + 1] + '</div>' +
                                '</div>' +
                                '<div class="customC3ToolTip-Body">' +
                                '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> ' + tooltiplabel + ': ' + commaSeperatedNumber(yaxisvalues[dataObj.index + 1]) + '</div>' + htmlconditional +
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
        }
    }
    /*
    Created : Nisha 
    Date :  02/27/2017
    Description : to implement Prescription Duration drilldown by medicines Method Call
    */
let renderPrescriptionDuration = (reporttype, duration, container, parentcontainer, parentdiv) => {
    let params = {};
    if (Pinscriptive.Filters) {
        params = getCurrentPopulationFilters(); //pharmaLib.getCurrentPopulationFilters();
    }

    params.PDGenoType = reporttype == "prescriptionduration" ? "" : reporttype;
    $("#selectedduration" + params.PDGenoType).html(duration);
    chartduration = duration;
    params.PDTreatmentFrom = duration.split("-")[0];
    params.PDTreatmentTo = duration.split("-")[1];
    Meteor.call('getPrescriptionDurationData', params, function(error1, results) {
        if (error1) {
            console.log("error");
        } else {
            // console.log("method called");
            // console.log(results);
            var decompressed_object_result_PD = LZString.decompress(results);
            var resulting_object_result_PD = JSON.parse(decompressed_object_result_PD);
            setTimeout(function() {
                renderPrescriptionDurationChart(resulting_object_result_PD, container, parentcontainer, parentdiv, params.PDGenoType);

            }, 1000);
        }
    });
}

/*
Created : Nisha 
Date :  02/27/2017
Description : to implement Prescription Duration drilldown by medicines
*/
let renderPrescriptionDurationChart = (data, container, parentcontainer, parentdiv, reporttype) => {
    // console.log("method called");
    // console.log(data);
    $(parentcontainer).hide();
    $(parentdiv).show();

    $("#PDBack" + reporttype).show();
    // console.log(parentcontainer);
    // console.log(parentdiv);

    var chart = c3.generate({
        bindto: container,
        size: {
            height: 300,
            width: 360
        },
        data: {
            columns: data,
            type: 'donut'
        },
        legend: {
            show: false
        },
        tooltip: {
            format: {
                title: function(d) { return chartduration },
                value: function(value, ratio, id) {
                    return value + " Patients";
                }
            }
        }
    });
}

/*
Created : Nisha 
Date :  02/27/2017
Description : Modified to implement Prescription Duration drilldown Back buttons
*/

Template.AdvanceAnalytics.events({
    'click .js-comparativeEngine': function(e) {
        renderComaparativeOptionsView();
    },
    'click .customChartBackButton': function(e) {
        // console.log($('.customChartBackButton').attr('id'));
        // console.log(e.currentTarget);
        if (e.currentTarget.id.replace("PDBack", "") != "") {
            let geno = e.currentTarget.id.replace("PDBack", "");
            $("#pharma_VLweekdistribution" + geno).show();
            $("#pharma_VLweek" + geno).hide();
            $("#PDBack" + geno).hide();
            // console.log("#pharma_VLweekdistribution" + geno);
            // console.log("#pharma_VLweek" + geno);
        } else {
            $("#pharma_VLweekdistribution").show();
            $("#pharma_VLweek").hide();
            $("#PDBack").hide();
        }
    }
});

function formatNote(notemsg) {
    notemsg = notemsg.substring(0, notemsg.length - 1);
    var replacement = ' and ';
    notemsg = notemsg.replace(/,([^,]*)$/, replacement + '$1');
    return notemsg;
}

Template.AdvanceAnalytics.helpers({
    // 'getGenotypeList': function () {
    //     //list genotype
    //     return PatientsGenotypeList;
    // },
    // 'getMedication': function () {
    //               let dummyMedication = [];
    //               let drugArray = ["PegIntron","Pegasys","Victrelis"]
    //               for(let i = 0;i<AllDrugs.length;i++){
    //                   let drugName = AllDrugs[i].name;
    //                   if(drugArray.indexOf(drugName) == -1 )
    //                     dummyMedication.push(AllDrugs[i].name);
    //               }
    //         return dummyMedication;
    // }
});

// function DrawViralScoreCharts(medicine) {
//     nodata = '';
//     nodatafound = '';
//     var item = 0;
//     medicine = '';
//     var topitemcount = '';
//     var bottomitemcount = '';
//     $("#pharmanotes").empty();
//     $('#pharma-medicationAA').selectize();
//     // var medicine =  $("#pharma-medicationAA").val();
//     if (Pinscriptive.Filters) {
//         medicine = Pinscriptive.Filters.medication ? Pinscriptive.Filters.medication.replace(/'/g, '').toString() : 'ALL';
//     } else {
//         medicine = '';
//     }


//     $("#genotypegraphcontainers").empty();

//     //set header data
//     pharmaLib.setPharmaHeaderTabData();
//     // $("#medname1").html(medicine);
//     // $("#medname2").html(medicine);
//     // $("#medname3").html(medicine);
//     // $("#medname4").html(medicine);

//     let pharmaDataViralScoresData = [];
//     pharmaDataViralScoresData = getDrugFilteredData(medicine, 'BeforeStart', '');
//     //console.log(pharmaDataViralScoresData);
//     if (pharmaDataViralScoresData.length > 0) {
//         $("#genotypegraphcontainers").append('<div class="col-lg-12" style="margin-bottom:30px;"><h3>Viral Load Distribution</h3></div>');
//         item = item + 1;
//         topitemcount = '';
//         bottomitemcount = '';
//         if (item % 2 != 0) {
//             topitemcount = ''; //<div class="">';
//             bottomitemcount = ''; //</div>';
//         }
//         //removed mlSubTabsChartSectionWrap to col-lg-3
//         $("#genotypegraphcontainers").append(topitemcount + '<div class="col-lg-4 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
//             '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Viral Load <i style="color:red">before</i> starting ' + medicine + ' treatment </h3> ' +
//             '<div id="pharma_VLbeforestart"></div>')
//         $("#genotypegraphcontainers").append('</div>' + bottomitemcount);
//     } else
//         nodatafound = nodatafound + "** No data found for Viral Load before starting " + medicine + " treatment<br/>";

//     renderViralScoreCount(medicine, 'BeforeStart', "#pharma_VLbeforestart", '', '', 1);

//     pharmaDataViralScoresData = [];
//     pharmaDataViralScoresData = getDrugFilteredData(medicine, 'DuringMedication', '');

//     if (pharmaDataViralScoresData.length > 0) {
//         item = item + 1;
//         topitemcount = '';
//         bottomitemcount = '';
//         if (item % 2 != 0) {
//             topitemcount = ''; //<div class="">';
//             bottomitemcount = ''; //</div>';
//         }

//         $("#genotypegraphcontainers").append(topitemcount + '<div class="col-lg-4 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
//             '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Viral Load <i style="color:red">during</i> ' + medicine + ' consumption</h3> ' +
//             '<div id="pharma_VLduringmedication"></div>')
//         $("#genotypegraphcontainers").append('</div>' + bottomitemcount);
//     } else
//         nodatafound = nodatafound + '** No data found for Viral Load during ' + medicine + ' consumption<br/>';

//     renderViralScoreCount(medicine, 'DuringMedication', "#pharma_VLduringmedication", '', '', 1);

//     pharmaDataViralScoresData = [];
//     pharmaDataViralScoresData = getDrugFilteredData(medicine, 'AfterEnd', '');

//     if (pharmaDataViralScoresData.length > 0) {
//         item = item + 1;
//         topitemcount = '';
//         bottomitemcount = '';
//         if (item % 2 != 0) {
//             topitemcount = ''; //<div class="">';
//             bottomitemcount = ''; //</div>';
//         }

//         $("#genotypegraphcontainers").append(topitemcount + '<div class="col-lg-4 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
//             '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Viral Load <i style="color:red">after</i> ending ' + medicine + ' treatment</h3> ' +
//             '<div id="pharma_VLafterend"></div>')
//         $("#genotypegraphcontainers").append('</div>' + bottomitemcount);
//     } else
//         nodatafound = nodatafound + '** No data found for Viral Load after ending ' + medicine + ' treatment<br/>';

//     renderViralScoreCount(medicine, 'AfterEnd', "#pharma_VLafterend", '', '', 1);

//     pharmaDataViralScoresData = [];
//     pharmaDataViralScoresData = getDrugFilteredData(medicine, 'prescriptionduration', '');

//     $("#genotypegraphcontainers").append('<div class="col-lg-12" style="margin-top:30px;margin-bottom:30px;"><h3>Prescription Duration Distribution</h3></div>');

//     if (pharmaDataViralScoresData.length > 0) {
//         item = item + 1;
//         topitemcount = '';
//         bottomitemcount = '';
//         if (item % 2 != 0) {
//             topitemcount = ''; // '<div class="">';
//             bottomitemcount = ''; //'</div>';
//         }


//         $("#genotypegraphcontainers").append(topitemcount + '<div class="col-lg-4 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
//             '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Distribution of ALL ' + (medicine == 'ALL' ? '' : medicine) + ' Prescription Duration</h3> ' +
//             '<div id="pharma_VLweekdistribution"></div>')
//         $("#genotypegraphcontainers").append('</div>' + bottomitemcount);
//     } else
//         nodatafound = nodatafound + '** No data found for Distribution of ' + medicine + ' Prescription Duration<br/>';



//     renderViralScoreCount(medicine, 'prescriptionduration', "#pharma_VLweekdistribution", '', '');

//     let genotypes = ["1a", "1b", "2", "3", "4"];
//     let itemcount = 0;
//     let additionalheadertop = '';
//     let additionalheaderbottom = '';
//     let pharmaDataViralScoresGeno = [];
//     for (i = 0; i < genotypes.length; i++) {
//         let jsonObj = {};
//         pharmaDataViralScoresGeno = [];
//         pharmaDataViralScoresGeno = getDrugFilteredData(medicine, 'genotype', genotypes[i].toString());
//         //console.log(genotypes[i] + pharmaDataViralScoresGeno.length);
//         if (pharmaDataViralScoresGeno.length > 0) {
//             itemcount = itemcount + 1;
//             additionalheadertop = '';
//             additionalheaderbottom = '';
//             if (itemcount % 2 != 0) {
//                 additionalheadertop = ''; // '<div class="">';
//                 additionalheaderbottom = ''; // '</div>';
//             }

//             $("#genotypegraphcontainers").append(additionalheadertop + '<div class="col-lg-4 boxshadow_borderline" id="OMedicineCount" style="padding-top:30px; padding-bottom: 28px;"> ' +
//                 '<h3 class="panel-title containertitle" style="padding-left:15px;padding-bottom:10px">Distribution of ' + medicine + ' Prescription Duration by Genotype "<i style="color:red">' + genotypes[i] + '</i>"</h3> ' +
//                 '<div id="pharma_VLweekdistribution' + genotypes[i] + '">' + genotypes[i] + '</div>')
//             $("#genotypegraphcontainers").append('</div>' + additionalheaderbottom);

//         } else
//             nodata = nodata + genotypes[i] + ',';
//     }

//     renderViralScoreCount(medicine, 'genotype', "#pharma_VLweekdistribution1a", '1a');
//     renderViralScoreCount(medicine, 'genotype', "#pharma_VLweekdistribution1b", '1b');
//     renderViralScoreCount(medicine, 'genotype', "#pharma_VLweekdistribution2", '2');
//     renderViralScoreCount(medicine, 'genotype', "#pharma_VLweekdistribution3", '3');
//     renderViralScoreCount(medicine, 'genotype', "#pharma_VLweekdistribution4", '4');
// }


function generateWeeklyData(pharma) {
    let pData = [];
    let chartData = [];
    for (let keys in pharma) {
        let json = {},
            pData = pharma[keys];
        pData['weekrange'] = generateWeeklyRange(pData.TREATMENT_PERIOD);
        if (pData.PATIENT_ID_SYNTH != undefined)
            chartData.push(pData);
    }
    return chartData;
}

function generateWeeklyRange(weeknumber) {
    let range = null;
    if (weeknumber > 51) {
        range = '>51';
    } else if (weeknumber >= 41 && weeknumber <= 50) {
        range = '41-50';
    } else if (weeknumber >= 31 && weeknumber <= 40) {
        range = '31-40';
    } else if (weeknumber >= 21 && weeknumber <= 30) {
        range = '21-30';
    } else if (weeknumber >= 11 && weeknumber <= 20) {
        range = '11-20';
    } else if (weeknumber >= 1 && weeknumber <= 10) {
        range = '1-10';
    } else {
        //console.log('no data');
    }
    return range;
}

//
// let setGenotypeComboForCurrentPatient = () =>{
//     //selecting genotype of current patient
//     let genotypes = Session.get('pharmaGenotype');
//     if (genotypes && genotypes.length>0) {
//         setTimeout(function () {
//
//           if ($('.isCheckedallAA').prop('checked')) {
//               $('#treatedselectGenotypeAA .mutliSelect li input[value = "all"]').trigger('click');
//           }
//           $('.multiSel').empty();
//           $('.isChecked').prop('checked', false);
//           $('.isChecked').each(function(d) {
//               if (genotypes.indexOf($(this).val()) > -1) {
//                   $(this).trigger('click');
//               }
//           });
//         }, 200);
//     }
//     else{
//       if(!$('.isCheckedallAA').prop('checked'))
//         $('#treatedselectGenotypeAA .mutliSelect li input[value = "all"]').trigger('click');
//
//     }
// }

let generateViralScoreRange = (viralload) => {
    let range = void 0;
    if (viralload >= 25000000) {
        range = '25M+';
    } else if (viralload >= 5000000 && viralload < 25000000) {
        range = '5M-25M';
    } else if (viralload >= 1000000 && viralload < 5000000) {
        range = '1M-5M';
    } else if (viralload >= 200000 && viralload < 1000000) {
        range = '0.2M-1M';
    } else if (viralload < 200000) {
        range = '<0.2M';
    } else {
        //console.log('no data');
    }
    return range;
}


let renderRelapsedPatientCharts = (chartData, chartDataRemitted) => {

    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });

    renderRelapsedPatientChartskey('pharmaTreatmentRelapsedGeno', chartData.genotype.data, chartData.genotype.keys, 'Genotype');
    renderRelapsedPatientChartskey('pharmaTreatmentRelapsedRace', chartData.race.data, chartData.race.keys, 'Race');
    renderRelapsedPatientChartskey('pharmaTreatmentRelapsedCirrhosis', chartData.cirrhosis.data, chartData.cirrhosis.keys, 'Cirrhosis');
    renderRelapsedPatientChartskey('pharmaTreatmentRelapsedGender', chartData.gender.data, chartData.gender.keys, 'Gender');
    renderRelapsedPatientChartskey('pharmaTreatmentRelapsedAge', chartData.age.data, chartData.age.keys, 'Age');
    renderRelapsedPatientChartskey('pharmaTreatmentRelapsedFibrosis', chartData.fibrosis.data, chartData.fibrosis.keys, 'Fibrosis');
    renderStackedChartRemmission('pharmaTreatmentRemmittedGenotype', chartDataRemitted.genotype.data, chartDataRemitted.genotype.keys, 'Genotype');
    //DRAW REMISSION CHART
    renderStackedChartRemmission('pharmaTreatmentRemmittedMedication', chartDataRemitted.medication.data, chartDataRemitted.medication.keys, 'Medication');
    renderStackedChartRemmission('pharmaTreatmentRemmittedTreatmentPeriod', chartDataRemitted.treatment_period.data, chartDataRemitted.treatment_period.keys, 'Treatment Period');
}

let renderStackedChartRemmission = (container, chartData, category, key) => {
    Highcharts.chart(container, {
        chart: {
            type: 'column'
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
        colors: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', "#929FA8", "#97E0E3", "#676767", "#FBDE97", '#17becf'],
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                //console.log(this);
                return key + ' :' + this.key + '<br/> Patient Count: ' + commaSeperatedNumber(this.y);
            }
        },
        plotOptions: {
            column: {
                stacking: 'percent',
                dataLabels: {
                    align: 'left',
                    enabled: true,
                    formatter: function() {
                        if (this.y != 0) {
                            return commaSeperatedNumber(this.y);
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

function generateViralScoreData(pharma) {
    let pData = [];
    let chartData = [];
    for (let keys in pharma) {
        let json = {},
            pData = pharma[keys];
        pData['viralscorerange'] = generateViralScoreRange(pData.ViralLoad);
        if (pData.PATIENT_ID_SYNTH != undefined)
            chartData.push(pData);
    }
    return chartData;
}

let renderViralScoreCount = (medicine, reporttype, container, genotypevar, GenotypeData, color1) => {
    // console.log(medicine);
    let pharmaDataViralScores = [];
    let groupedData = [];
    let labelb = '';
    let labela = '';
    let tooltiplabel = '';


    // if (genotypevar != "")
    //     pharmaDataViralScores = GenotypeData;
    // else
    pharmaDataViralScores = getDrugFilteredData(medicine, reporttype, genotypevar);
    //  console.log(pharmaDataViralScores);
    if (reporttype == 'prescriptionduration' || reporttype == 'genotype') {
        pharmaDataViralScores = generateWeeklyData(pharmaDataViralScores);

        groupedData = _.groupBy(pharmaDataViralScores, 'weekrange');
        labelb = 'Treatment Period (Week)';
        labela = 'Total Number of Patients'; //'No. of Patients';
        tooltiplabel = 'Patient Count';
        // console.log(groupedData);
        xaxisvalues = ['x', "1-10", "11-20", "21-30", "31-40", "41-50", ">51"];
    } else {
        pharmaDataViralScores = generateViralScoreData(pharmaDataViralScores);
        groupedData = _.groupBy(pharmaDataViralScores, 'viralscorerange');
        labelb = 'Viral Load Score';
        labela = 'Total Number of SVR Tests';
        tooltiplabel = 'SVR Test Count';
        xaxisvalues = ['x', "<0.2M", "0.2M-1M", "1M-5M", "5M-25M", "25M+"];
        // console.log('Nisha - Grouped data');
        // console.log(groupedData);
    }


    let XnameArray = [];

    for (let keys in groupedData) {
        let countvalues = {};
        let datavalues = {};
        let uniquecounts = 0;
        countvalues["axis"] = keys;
        countvalues["axisvalues"] = groupedData[keys].length;
        countvalues["uniquecounts"] = 0;
        if (!(reporttype == 'prescriptionduration' || reporttype == 'genotype')) {
            uniquecounts = _.uniq(groupedData[keys], function(person) {
                return person.PATIENT_ID_SYNTH;
            });
            countvalues["uniquecounts"] = uniquecounts.length;
        }
        XnameArray.push(countvalues);
    }

    let yaxisvalues = [];
    yaxisvalues.push("value");

    let patientuniquecount = [];
    patientuniquecount.push("uniquecount");

    for (i = 1; i <= xaxisvalues.length - 1; i++) {
        let yval = 0;
        let ucount = 0;
        for (j = 0; j <= XnameArray.length - 1; j++) {
            if (xaxisvalues[i] == XnameArray[j].axis) {
                yval = XnameArray[j].axisvalues;
                ucount = XnameArray[j].uniquecounts;
            }
        }
        yaxisvalues.push(yval);
        patientuniquecount.push(ucount);
    }

    let colors = [];
    if (color1 == 1) {
        colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];
    } else {
        colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
    }
    if ($(container).length != 0) {
        d3.select(container).selectAll("*").remove();
        if (pharmaDataViralScores.length <= 0) {
            $(container).html('<div style="text-align: center;padding-top: 5%;height:300;width:350;">No Data Found</div>');
        } else {
            var chart = c3.generate({
                bindto: container,
                padding: {
                    top: 20
                },
                bar: {
                    width: {
                        ratio: 0.85
                    }
                },
                size: {
                    height: 300,
                    width: 360
                },
                color: {
                    pattern: colors
                },
                data: {
                    x: 'x',
                    columns: [
                        xaxisvalues,
                        yaxisvalues
                    ],
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
                            //  console.log(probgroup.length);
                            if (i != undefined) {
                                labelv = commaSeperatedNumber(yaxisvalues[i + 1]);
                                return labelv;
                            } else {}
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
                        if (!(reporttype == 'prescriptionduration' || reporttype == 'genotype')) {
                            htmlconditional = '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patient Counts: ' + commaSeperatedNumber(patientuniquecount[dataObj.index + 1]) + '</div>';
                        }
                        let html = '';
                        html = '<div class="customC3ToolTip">' +
                            '<div class="customC3ToolTip-Header">' +
                            '<div>' + xaxisvalues[dataObj.index + 1] + '</div>' +
                            '</div>' +
                            '<div class="customC3ToolTip-Body">' +
                            '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> ' + tooltiplabel + ': ' + commaSeperatedNumber(yaxisvalues[dataObj.index + 1]) + '</div>' + htmlconditional +
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
    }
}

let getDrugFilteredData = (medicine, reporttype, genotypevar) => {
    /*console.log(pharmaData);
     console.log(typeof(pharmaData));*/
    //let genoTypes = Session.get('pharmaGenotype');

    let filteredpharmaData = pharmaViralScoreAnalysisData;
    //$('.searchPatientCountHeaderPharma').html(pharmaViralScoreAnalysisData.length);
    if (reporttype.toLowerCase() == 'prescriptionduration' || reporttype.toLowerCase() == 'genotype')
        filteredpharmaData = pharmaData;

    if (reporttype.toLowerCase() == 'beforestart') {
        filteredpharmaData = filteredpharmaData.filter(function(a) {
            return new Date(a.Perfed_Dt) < new Date(a.STRT_DATE);
        });

    } else if (reporttype.toLowerCase() == 'duringmedication') {
        filteredpharmaData = filteredpharmaData.filter(function(a) {
            return (new Date(a.Perfed_Dt) >= new Date(a.STRT_DATE) && new Date(a.Perfed_Dt) <= new Date(a.END_DATE));
        });
    } else if (reporttype.toLowerCase() == 'afterend') {
        filteredpharmaData = filteredpharmaData.filter(function(a) {
            return (new Date(a.Perfed_Dt) > new Date(a.END_DATE));
        });
    }

    //removed filter from medicine and genotype
    if (genotypevar != '') {
        filteredpharmaData = filteredpharmaData.filter((a) => a.GENOTYPE == genotypevar);
    }
    return filteredpharmaData;
}



function handleMultiGenoCombo(ele) {
    var className = $(ele).closest('.genotypeSelect').parent().parent().attr('id'); // Selecting the id of the container.

    var title = title_html = $(ele).val(); //$(ele).closest('.mutliSelect').find('input[type="checkbox"]').val();

    var selectedLength = $('#' + className + ' .multiSel').children().length;

    title_html = $(ele).val() + ',';

    //chekc if selected value is all
    if (title.toLowerCase() === 'all') {
        //loop for all the genotypes
        $('#' + className + ' .mutliSelect').find('input').each(function(index) {
            if ($(ele).is(':checked')) {
                //if all is selected disable all other values except ALL
                if (index) {
                    $(this).attr('disabled', true);
                    $(this).prop('checked', false);
                }
            } else {
                //Enable all values when all is diselected
                $(this).attr('disabled', false);
                $(this).prop('checked', false);
            }
        });

        //append all in value area if is selected
        if ($(ele).is(':checked')) {
            var html = '<span title="All">All</span>';
            $('#' + className + ' .multiSel').empty();
            $('#' + className + ' .multiSel').append(html);
            // $('#'+className +' .multiSel').show();
            // $('#'+className + ' .hida').hide();
        }
        //remove all from value area if is unselected
        else {
            $('#' + className + ' span[title="All"]').remove();
            // $('#'+className + ' .hida').show();
            // $('#'+className +' .multiSel').hide();
        }
        return;
    }

    //append the value in value area if is selected
    if ($(ele).is(':checked')) {
        var html = '<span title="' + title + '">' + title_html + '</span>';
        $('#' + className + ' .multiSel').append(html);
        // $('#'+className + ' .hida').hide();
        // $('#'+className +' .multiSel').show();
    }
    //remove the value from value area if is unselected
    else {
        $('#' + className + ' span[title="' + title + '"]').remove();
        var ret = $('.' + className + ' .hida');
        $('#' + className + ' .dropdown dt a').append(ret);
        if (selectedLength == 1) {
            // $('#'+className + ' .hida').show();
            // $('#'+className +' .multiSel').hide();
        }
    }
}

function loadingDropdown() {

    // $('#pharma-medicationDO').selectize();

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

    $('.mutliSelect input[type="checkbox"]').on('click', function(e) {
        handleMultiGenoCombo(e.target);
    });

}


// moved to pharmalib
// function getGenotypeFromFiltters() {
//     let genotypes = '';
//
//     //get text data from mutlisselect combo
//     $('#treatedselectGenotypeAA .multiSel').children().each(function (index) {
//         genotypes += $(this).html().trim();
//     });
//     if(genotypes == 'All'){
//       return [];
//     }
//     //remove last comma and change the genotype to array
//     genotypes = genotypes[0] == ',' ? genotypes.substring(1, genotypes.length) : genotypes;
//     genotypes = genotypes.split(',');
//     return genotypes;
// }

//fetch data from server and render charts
Template.AdvanceAnalytics.fetchAndRenderData = () => {

    let params = {};
    if (Pinscriptive.Filters) {
        params = getCurrentPopulationFilters(); //pharmaLib.getCurrentPopulationFilters();
    }
    pharmaLib.showChartLoading();
    params['tabname'] = 'advanceanalytics';

    Meteor.call('getPatientPharmaData', params, function(error, results) {
        if (error) {
            pharmaLib.hideChartLoading();
        } else {
            pharmaLib.setAdvancedSearchFilters();
            pharmaLib.setPharmaHeader();

            var decompressed_object = LZString.decompress(results);
            var resulting_object = JSON.parse(decompressed_object);
            // console.log(resulting_object);
            pharmaGenotypeData = resulting_object.pharmaGenotypeData;

            // OLD CODE
            //$('.searchPatientCountHeaderPharma').html(resulting_object.pharmaPatientLength);
            //Added :14-FEB-2017 Arvind,sigle method to set patient count on cohort menu
            setCohortPatientCount({ patientCount: resulting_object.pharmaPatientLength });
            //Pinscriptive['pharma']['drugfulldata'] = pharmaData;//set data into pinscriptive folder

            //meteor call to fetch viral score data from server
            Meteor.call('getPharmaViralScoreAnalysisData', params, function(error1, result) {
                if (error1) {
                    pharmaLib.hideChartLoading();
                } else {
                    // DEcompression form Viral Score Analysis Data
                    var decompressed_object_result = LZString.decompress(result);
                    var resulting_object_result = JSON.parse(decompressed_object_result);

                    pharmaViralScoreAnalysisData = resulting_object_result.pharmaAnalysisData;
                    //console.log(result);
                    pharmaLib.hideChartLoading();
                    //// Once data is fetched render charts
                    DrawViralScoreCharts(resulting_object_result.pharmaAnalysisData);
                    //console.log(result,result.Relapsed)
                    // renderRelapsedPatientCharts(result.pharmaAnalysisData.Relapsed,result.pharmaAnalysisData.Remitted);
                }
            });
        }
    });
    // });
}


let renderRelapsedPatientChartskey = (container, chartData, category, key) => {

    Highcharts.chart(container, {
        chart: {
            type: 'column'
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
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'],
        plotOptions: {
            column: {
                dataLabels: {
                    align: 'left',
                    enabled: true,

                    format: '' + '{point.y:,.0f}',
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
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                //console.log(this);
                return key + ' :' + this.key + '<br/> Patient Count: ' + commaSeperatedNumber(this.y);
            }
        },

        series: chartData
    });

}



// Render for comparativeengine
let renderComaparativeOptionsView = () => {
    var comparativeEngine = new ComparativeEngine({
        tabName: "AdvanceAnalyticsTab-Pharma"
    });

    comparativeEngine.renderCompareOptiosView();
}