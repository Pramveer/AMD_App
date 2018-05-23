import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import * as pharmaLib from '../pharmaLib.js';
import * as pharmaanalyticsLib from '../pharmaanalyticsLib.js';
import './PhysicianPatientTarget.html';
/*
// Nisha 
// 02/17/2017 
// Modified for comparing geoLocation distribution of drugs
*/
// Nisha 02/20/2017 Change in functions for common cohor
var UtlizationDrugsData = null;
var pieColors = [{
    strokeColor: '#e95a52',
    textColor: '#e95a52'
}, {
    strokeColor: '#2e7e97',
    textColor: '#2e7e97'
}, {
    strokeColor: '#69bae7',
    textColor: '#69bae7'
}];


Template.PhysicianPatientTarget.onCreated(function() {
    let params = {};
    if (AmdApp.Filters) {
        params = getCurrentPopulationFilters(); //pharmaLib.getCurrentPopulationFilters();
    }
    params['fdaCompliant'] = "yes";

    // pharmaLib.showChartLoading();

    // //set header of pharma
    // pharmaLib.setPharmaHeader();

    executeUtilizationRender(params);

    // Template.PhysicianPatientTarget.fetchAndRenderData();
});


Template.PhysicianPatientTarget.rendered = function() {
    // pharmaLib.setAdvancedSearchFilters();

    // //set header of pharma
    // pharmaLib.setPharmaHeader();
    highLightTab('Pharma');

}

Template.PhysicianPatientTarget.helpers({


});

Template.PhysicianPatientTarget.events({
    'click .rweb-list li': function(e, template, data) {
        let tabData = $(e.currentTarget).children('a').attr('data');
        if (data && data == 'refresh') {
            tabData = $('.rweb-list li.active a').attr('data');
        }
        console.log(tabData);

        $(e.currentTarget).addClass('active').siblings().removeClass('active');

        e.preventDefault();

        GetTabWiseData(tabData);
        /*
               if (tabData == "withFDACompliant") {
                   let params = {};
                   if (AmdApp.Filters) {
                       params = pharmaLib.getCurrentPopulationFilters();
                   }
                   params['fdaCompliant'] = "yes";

                   pharmaLib.showChartLoading();
                   executeUtilizationRender(params);

               } else if (tabData == "withoutFDACompliant") {
                   let params = {};
                   if (AmdApp.Filters) {
                       params = pharmaLib.getCurrentPopulationFilters();
                   }
                   params['fdaCompliant'] = "no";

                   pharmaLib.showChartLoading();
                   executeUtilizationRender(params);

               } else if (tabData == "allMedsData") {
                   //console.log("Render All Drugs Data.");

                   let params = {};
                   if (AmdApp.Filters) {
                       params = pharmaLib.getCurrentPopulationFilters();
                   }
                   params['fdaCompliant'] = "all";
                   pharmaLib.showChartLoading();
                   executeUtilizationRender(params);
               }*/
    },
    'click .pharma_closebtn': function(event, template) {
        $('.pharmaPatientsPopup').hide();
    },
    'click .comparegeolocation': function(event) {
        // console.log('comparegeolocation');
        pharmaanalyticsLib.renderCompareLocationMapChartUtlization();
    }
});

function GetTabWiseData(tabData) {
    if (tabData == "withFDACompliant") {
        let params = {};
        if (AmdApp.Filters) {
            params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
        }
        params['fdaCompliant'] = "yes";

        pharmaLib.showChartLoading();
        executeUtilizationRender(params);

    } else if (tabData == "withoutFDACompliant") {
        let params = {};
        if (AmdApp.Filters) {
            params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
        }
        params['fdaCompliant'] = "no";

        pharmaLib.showChartLoading();
        executeUtilizationRender(params);

    } else if (tabData == "allMedsData") {
        //console.log("Render All Drugs Data.");

        let params = {};
        if (AmdApp.Filters) {
            params = getCurrentPopulationFilters(); //pharmaLib.getCurrentPopulationFilters();
        }
        params['fdaCompliant'] = "all";
        pharmaLib.showChartLoading();
        executeUtilizationRender(params);
    }

}

function GenerateUtilizationBarBubbleMixedChart(allDrugData, patient_count) {
    UtlizationDrugsData = allDrugData;
    //var DrugData = localStorage.AllDrugsData && JSON.parse(localStorage.AllDrugsData) ? JSON.parse(localStorage.AllDrugsData) : [];
    // remove extra parsing process for faster performance
    // var allDrugData = localStorage. analyticsLib.prepareUtilizationPopup(dataAllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];
    // $('.machineLearn-totalPatients').html(commaSeperatedNumber(allDrugData[0].TotalN || 0));

    // OLD CODE
    //$('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(patient_count));
    //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
    setCohortPatientCount({ patientCount: patient_count });

    var columnsData = [];
    var OtherValue = 0;
    var OtherValueMe = 0,
        OtherValueMyNetwork = 0,
        OtherValuePopulationHealth = 0;
    var totalUtiScore = 0;



    for (var i = 0; i < allDrugData.length; i++) {

        var utiScore = allDrugData[i] && allDrugData[i]["Utilization"]["Utilization"] ? allDrugData[i]["Utilization"]["Utilization"] : 0;
        totalUtiScore = Number(totalUtiScore) + Number(utiScore);

        var wrapDrug = '';
        column = [];

        var splittedDrug = allDrugData[i]["DrugName"].split('+');
        if (splittedDrug.length > 1) {
            //split second index drug with '(' symbol
            var furtherSplittedDrug = splittedDrug[1].split('(');
            if (furtherSplittedDrug.length > 1) {
                //To Do display  both array as zero index drug from it is and also set title for it
                wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');
            } else {
                //To Do display  both array as zero index drug from it is and also set title for it
                if (splittedDrug.length > 2) {
                    wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');

                } else {
                    wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);

                }
            }
        } else {
            //To Do display drug as it is and also set title for it
            wrapDrug = allDrugData[i]["DrugName"];

        }

        var Me, MyNetwork, PopulationHealth;
        PopulationHealth = allDrugData[i] && allDrugData[i]["Utilization"]["Utilization"] ? roundPercent(allDrugData[i]["Utilization"]["Utilization"]) : 0;
        Me = allDrugData[i] && allDrugData[i]["Utilization"]["ProviderLength"] ? roundPercent(allDrugData[i]["Utilization"]["ProviderLength"]) : 0;
        MyNetwork = allDrugData[i] && allDrugData[i]["Utilization"]["NetworkLength"] ? roundPercent(allDrugData[i]["Utilization"]["NetworkLength"]) : 0;

        //Check weather same truncated drug name exist or not
        var calculatedDrugs = columnsData.filter(function(d) {
            if (d[0] == wrapDrug) {
                return true;
            } else {
                return false;
            }
        });

        if (calculatedDrugs.length > 0) {
            wrapDrug = wrapDrug + ' ';
        }
        var row = {};
        if (columnsData.length > allDrugData.length) {
            //Set remaining value to others if more than 4 drug is selected
            OtherValue = parseFloat(OtherValue) + parseFloat(utiScore);
            OtherValueMe = parseFloat(OtherValueMe) + parseFloat(Me);
            OtherValueMyNetwork = parseFloat(OtherValueMyNetwork) + parseFloat(MyNetwork);
            OtherValuePopulationHealth = parseFloat(OtherValuePopulationHealth) + parseFloat(PopulationHealth);
            if (i === (allDrugData.length - 1)) {
                // column.push("Other");
                // column.push(OtherValue);
                row.label = "Other";
                row.value = OtherValue;
                row.extra = "Other";
                row["Me"] = roundPercent(OtherValueMe);
                row["My Network"] = roundPercent(OtherValueMyNetwork);
                row["SVR"] = 87 + i / 2;
                row["Population Health"] = roundPercent(OtherValuePopulationHealth);
                columnsData.push(row);
            }
        } else {
            row.label = allDrugData[i]["DrugName"];
            row.value = parseFloat(utiScore);
            row.extra = allDrugData[i]["DrugName"];
            row["Me"] = parseFloat(Me);
            row["My Network"] = parseFloat(MyNetwork);
            row["SVR"] = 87 - i / 2;

            row["Population Health"] = parseFloat(PopulationHealth);
            // column.push(wrapDrug);
            // column.push(Number(utiScore));

            columnsData.push(row);
        }
    }
    //Underscore and lodash sorting not working properlly
    //_.sortBy(columnsData, 'Population Health');

    columnsData.sort(function(a, b) {
        return parseFloat(b["Population Health"]) - parseFloat(a["Population Health"]);
    });

    drawLegend();
    //Generate pie chart with d3pie library
    $("#utilization-pie-chart").empty();
    //var pie = new d3pie("utilization-pie-chart");
    d3.select('.dimpleMapsContainer').selectAll("*").remove();
    let svgOptions = {
        svgWidth1: 650,
        svgWidth2: 270,
        generalHeight: 80,
        generalMargin: 5
    }
    let {
        svgWidth1,
        svgWidth2,
        generalHeight,
        generalMargin
    } = svgOptions;

    var svgHieght = columnsData.length * generalHeight;

    $("#utilization-pie-chart-part1").empty();
    $("#utilization-pie-chart-part2").empty();
    // $(".utilization-legend-icon").empty();
    //allDrugData
    var svg1 = d3.select("#utilization-pie-chart-part1").append("svg").attr("height", svgHieght).attr("width", svgWidth1).style("background", "");
    var svg2 = d3.select("#utilization-pie-chart-part2").append("svg").attr("height", svgHieght).attr("width", svgWidth2).style("background", "");
    //var chartLegendSvg = d3.select("#chart-legend").append("svg").attr("height", svgHieght).style("background", "");

    // var barColor = ['#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430'];
    //var barInnerCircleColor = ['#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430'];

    var barColor = ['#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97'];
    var barInnerCircleColor = ['#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97'];

    var firstGroup = svg1.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")");
    var secondGroup = svg2.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")");
    //var legendGroup = chartLegendSvg.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")");
    let previousScore = 0;
    let opacity = 1.0;
    for (var i = 0; i < columnsData.length; i++) {

        var x = 0,
            y = 0,
            rectHeight = generalHeight - generalMargin;
        var HeaderHieght = 20;
        var arr1 = columnsData[i].label.split('+');

        if (arr1.length > 0) {
            var popupHeader = firstGroup.append("text")
                .attr("class", "drugNameDisplay")
                .attr("x", 0)
                .attr("y", (rectHeight + generalMargin) * i + 15)
                //    .attr("height", bubbleData['Size'] * 3)
                .style("text-anchor", "start")
                .style("font-size", "11.8px")
                .style("font-weight", "bold")
                .style("fill", "#696868")
                .style("opacity", 1.0);
            for (var j = 0; j < arr1.length; j++) {
                if (j === 0) {
                    popupHeader.append('tspan')
                        .attr('x', 0)
                        .attr('dy', 7)
                        .text(arr1[j]);
                    HeaderHieght = HeaderHieght + 7;
                } else {
                    popupHeader.append('tspan')
                        .attr('x', 0)
                        .attr('dy', 15)
                        .text(arr1[j]);
                    HeaderHieght = HeaderHieght + 15;
                }

            }
        } else {
            var popupHeader = firstGroup.append("text")
                .attr("class", "drugNameDisplay")
                .attr("x", 0)
                .attr("y", (rectHeight + generalMargin) * i + 30)
                //    .attr("height", bubbleData['Size'] * 3)
                .style("text-anchor", "start")
                .style("font-size", "13px")
                .style("font-weight", "bold")
                .style("font-family", "Open Sans, sans-serif")
                .style("fill", "#696868")
                .style("opacity", 0.7)
                .text(columnsData[i].label);
            HeaderHieght = HeaderHieght + 7;
        }

        //ADD BACKGROUND COLUMN
        firstGroup.append('rect')
            .attr("rx", 27.5)
            .attr("ry", 27.5)
            .attr("x", 110)
            .attr("y", ((rectHeight + generalMargin) * i) + 10)
            .attr("width", 430)
            .attr("height", rectHeight - 20)
            .attr("onclick", "geoSubpopulationChart(event)")
            .attr("drug", columnsData[i].label)
            .style("fill", "#E4E0DC")
            .style("cursor", "pointer");
        //.style("stroke", "#C7E7FC")
        // //    .style("stroke-width", 1)
        // //    .style("opacity", 0.71)
        // //    .attr("rx", 8)
        // //    .attr("ry", 8);

        var widthBar = ((parseFloat(columnsData[i].value) * 430) / 100);
        // if (previousScore !== columnsData[i].value) {
        //     opacity = opacity - 0.1;
        // }
        // ADD FIRST CIRCLE AT END
        firstGroup.append('rect')
            .attr("x", 110)
            .attr("y", ((rectHeight + generalMargin) * i) + 10)
            .attr("width", widthBar)
            .attr("height", rectHeight - 20)
            .attr("onclick", "geoSubpopulationChart(event)")
            .attr("drug", columnsData[i].label)
            .style("fill", barColor[0])
            .style("opacity", opacity)
            .style("cursor", "pointer");

        // ADD CIRCLE AT END
        firstGroup.append('circle')
            //.attr("cx", 110 + widthBar)
            //Added 2 because if we have lower value of utilization chart display in consistent, Need other solution for this issue
            .attr("cx", 110 + 2 + widthBar)
            .attr("cy", ((rectHeight + generalMargin) * i) + 37.5)
            .attr("r", 27.5)
            .attr("onclick", "geoSubpopulationChart(event)")
            .attr("drug", columnsData[i].label)
            .style("fill", barInnerCircleColor[0])
            //.style("stroke", "#ffffff")
            .style("stroke-width", 1)
            .style("opacity", opacity)
            .style("cursor", "pointer");

        //Add White rectangle to hide circle for smaller value or utilization
        //Need to calculate x and Width value dynamically based on `widthBar` value
        if (widthBar <= 27.5) {
            //Render Small rectangle only for lower vale for bar
            //console.log(widthBar);
            firstGroup.append('rect')
                .attr("x", 110 - 27.5)
                .attr("y", ((rectHeight + generalMargin) * i) + 10)
                .attr("width", 27.5)
                .attr("height", rectHeight - 20)
                .style("fill", '#ffffff')
                .style("stroke-width", 1)
                .style("opacity", opacity);
        }

        //FIRST ROW INDICATOR VALUE TEXT
        var val = columnsData[i].value;
        // val = val.toFixed(0);
        //// Nisha 02/13/2017 for removing the label percent
        // firstGroup.append("text")
        //     .attr("class", "drugNameDisplayText")
        //     .attr("x", 570)
        //     .attr("y", ((rectHeight + generalMargin) * i) + 40)
        //     //.style("text-anchor", "middle")
        //     .style("font-size", "18px")
        //     .style("font-weight", "bold")
        //     .style("font-family", "Open Sans, sans-serif")
        //     .style("fill", "rgb(105, 104, 104)")
        //     .style("opacity", 1)
        //     .text(getPadded(val) + '%');
        previousScore = columnsData[i].value;
    }

    for (var i = 0; i < columnsData.length; i++) {

        var x = 0,
            y = 0,
            rectHeight = generalHeight - generalMargin;
        var me = columnsData[i]['Me'];
        var myNetwork = columnsData[i]['My Network'];
        var PopulationHealth = columnsData[i]["Population Health"];
        var secondGroup = svg2.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("onclick", "appendPatientsProPhyDetails(event)")
            .style("cursor", "pointer");

        // FIRST CIRCLE IN ROW
        secondGroup.append('circle')
            .attr("cx", 140)
            .attr("cy", ((rectHeight + generalMargin) * i) + 37.5)
            //    .attr("r", calculateBubbleSize(columnsData, me, 'Me'))
            .attr("r", 27.5)
            .attr("drug", columnsData[i].label)
            .attr("class", "me")
            .style("fill", "none")
            .style("stroke", pieColors[0].strokeColor)
            .style("stroke-width", 5)
            .style("opacity", 1);

        // FIRST CIRCLE TEXT
        secondGroup.append("text")
            .attr("class", "drugNameDisplayText")
            .attr("x", 140)
            .attr("data-text", getPadded(me) + '%')
            .attr("y", ((rectHeight + generalMargin) * i) + 40)
            .style("text-anchor", "middle")
            .style("font-size", "13px")
            .style("font-weight", "bold")
            .style("font-family", "Open Sans, sans-serif")
            .style("fill", pieColors[0].textColor)
            .style("opacity", 0.8)
            .text(getPadded(me) + '%');
        secondGroup = svg2.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")")
            .attr("onclick", "appendPatientsProPhyDetails(event)")
            .style("cursor", "pointer");


        // // SECOND CIRCLE 140
        // secondGroup.append('circle')
        //     .attr("cx", 140)
        //     .attr("cy", ((rectHeight + generalMargin) * i) + 37.5)
        //     //.attr("r", calculateBubbleSize(columnsData, myNetwork, 'My Network'))
        //     .attr("r", 27.5)
        //     .attr("class", "mynetwork")
        //     .attr("drug", columnsData[i].label)
        //     .style("fill", "none")
        //     .style("stroke", pieColors[1].strokeColor)
        //     .style("stroke-width", 5)
        //     .style("opacity", 1);

        // // SECOND CIRCLE TEXT 140
        // secondGroup.append("text")
        //     .attr("class", "drugNameDisplayText")
        //     .attr("x", 140)
        //     .attr("data-text", getPadded(myNetwork) + '%')
        //     .attr("y", ((rectHeight + generalMargin) * i) + 40)
        //     .style("text-anchor", "middle")
        //     .style("font-size", "13px")
        //     .style("font-weight", "bold")
        //     .style("font-family", "Open Sans, sans-serif")
        //     .style("fill", pieColors[1].textColor)
        //     .style("opacity", 1)
        //     .text(getPadded(myNetwork) + '%');

        // secondGroup = svg2.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")")
        //     .attr("onclick", "appendPatientsProPhyDetails(event)")
        //     .style("cursor", "pointer");
        // // THIRD CIRCLE 230
        // secondGroup.append('circle')
        //     .attr("cx", 230)
        //     .attr("drug", columnsData[i].label)
        //     .attr("cy", ((rectHeight + generalMargin) * i) + 37.5)
        //     .attr("r", 27.5)
        //     .attr("class", "population")
        //     .style("fill", "none")
        //     .style("stroke", pieColors[2].strokeColor)
        //     .style("stroke-width", 5)
        //     .style("opacity", 1);

        // // THIRD CIRCLE TEXT 230
        // secondGroup.append("text")
        //     .attr("class", "drugNameDisplayText")
        //     .attr("x", 230)
        //     .attr("data-text", getPadded(PopulationHealth) + '%')
        //     .attr("y", ((rectHeight + generalMargin) * i) + 40)
        //     .style("text-anchor", "middle")
        //     .style("font-size", "13px")
        //     .style("font-weight", "bold")
        //     .style("font-family", "Open Sans, sans-serif")
        //     .style("fill", pieColors[2].textColor)
        //     .style("opacity", 1)
        //     .text(getPadded(PopulationHealth) + '%');


        // THIRD CIRCLE
        secondGroup.append('circle')
            .attr("cx", 240)
            .attr("drug", columnsData[i].label)
            .attr("cy", ((rectHeight + generalMargin) * i) + 37.5)
            .attr("r", 27.5)
            .attr("class", "population")
            .style("fill", "none")
            .style("stroke", pieColors[1].strokeColor)
            .style("stroke-width", 5)
            .style("opacity", 1);

        // THIRD CIRCLE TEXT
        secondGroup.append("text")
            .attr("class", "drugNameDisplayText")
            .attr("x", 240)
            .attr("data-text", getPadded(PopulationHealth) + '%')
            .attr("y", ((rectHeight + generalMargin) * i) + 40)
            .style("text-anchor", "middle")
            .style("font-size", "13px")
            .style("font-weight", "bold")
            .style("font-family", "Open Sans, sans-serif")
            .style("fill", pieColors[1].textColor)
            .style("opacity", 1)
            .text(getPadded(PopulationHealth) + '%');
    }
    //    calculateBubbleSize(columnsData, me, 'Population Health');
};

geoSubpopulationChart = function(event) {
    let medicationInfo = {};
    let drugName, filterdata, valueData;
    drugName = $(event.target).attr('drug');
    filterdata = 'geoLocation';

    medicationInfo['Medication'] = drugName;
    medicationInfo['Medication'] = medicationInfo['Medication'].replace(/\s*\(.*?\)\s*/g, '');
    drugName = drugName.split(' ');
    drugName = drugName[drugName.length - 1];
    drugName = drugName.replace('(', '');
    drugName = drugName.replace('W)', '');
    // Update to convert as int treatment period field to solve grouping.
    medicationInfo['treatmentPeriod'] = parseInt(drugName);

    data = pharmaanalyticsLib.getDataForMedicationsForUtilization(medicationInfo, 'utilization');

    pharmaanalyticsLib.prepareUtilizationPopup(data, {
        medicationInfo: medicationInfo,
        subTab: 'utilization',
        filterdata: filterdata,
        UtlizationDrugsData: UtlizationDrugsData
    });
}


appendPatientsProPhyDetails = function(event) {
    let medicationInfo = {};
    let drugName, filterdata, valueData;
    if ($(event.target).attr('class') == "drugNameDisplayText") {
        drugName = $(event.target).prev().attr('drug');
        filterdata = $(event.target).prev().attr('class');
        valueData = $(event.target).attr('data-text');
    } else {
        drugName = $(event.target).attr('drug');
        filterdata = $(event.target).attr('class');
        valueData = $(event.target).next().attr('data-text');
    }

    medicationInfo['Medication'] = drugName;
    medicationInfo['Medication'] = medicationInfo['Medication'].replace(/\s*\(.*?\)\s*/g, '');
    drugName = drugName.split(' ');
    drugName = drugName[drugName.length - 1];
    drugName = drugName.replace('(', '');
    drugName = drugName.replace('W)', '');
    // Update to convert as int treatment period field to solve grouping.
    medicationInfo['treatmentPeriod'] = parseInt(drugName);

    data = pharmaanalyticsLib.getDataForMedicationsForUtilization(medicationInfo, 'utilization');
    pharmaanalyticsLib.prepareUtilizationPopup(data, {
        medicationInfo: medicationInfo,
        value: valueData,
        subTab: 'utilization',
        filterdata: filterdata
    });

}

function getPadded(number) {
    var digit = getlength(number);
    var str = number.toString();
    // if (digit == 1) {
    //     var str = pad(number, 2);
    // }
    return str;
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function getlength(number) {
    return number.toString().length;
}


Template.PhysicianPatientTarget.fetchAndRenderData = () => {
    let params = {};
    if (AmdApp.Filters) {
        params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
    }
    params['tabname'] = 'physicianpatientarget';
    pharmaLib.showChartLoading();
    let tabData = $('.utilizationSubtabs-links li.active a').attr('data');
    GetTabWiseData(tabData);
}


//get utilization data render 
let executeUtilizationRender = (params) => {

    // if (AmdApp.Filters) {
    //     params = pharmaLib.getCurrentPopulationFilters();
    // }
    // params['fdaCompliant'] = "yes";
    // pharmaLib.showChartLoading();
    params['tabname'] = 'physicianpatientarget';

    Meteor.call('getPhysicanPatientTargetTabData', params, function(error, result) {
        if (error) {
            alert('No data fetched for the sub population');
            pharmaLib.hideChartLoading();
            return;
        } else {
            pharmaLib.setAdvancedSearchFilters();
            pharmaLib.setPharmaHeader();

            let decompressed_object = LZString.decompress(result);
            let resulting_object = JSON.parse(decompressed_object);

            AmdApp['DrugByGenotype'] = resulting_object.getDrugByGenotype;
            pharmaanalyticsLib.analyticsUtilizationPatientsData(resulting_object.patientDataUtilization);
            setTimeout(function() {
                GenerateUtilizationBarBubbleMixedChart(resulting_object.drugsData, resulting_object.totalPatients);
                pharmaLib.hideChartLoading();
                //Added :13-Feb-2017,Arvind
                // initialize  popover tooltip for FDA/NON-FDA flag
                $('.pop').each(function() {
                    var $elem = $(this);
                    $elem.popover({
                        placement: 'auto',
                        trigger: 'hover',
                        html: true,
                        container: $elem,
                        animation: true,
                        // content: 'This is the popover content. You should be able to mouse over HERE.'
                    });
                });
            }, 50);

        }
    });


}


function drawLegend() {

    var legends = $('.legend-item');

    legends.each(function(index, legend) {

        var icon = $(legend).find('.utilization-legend-icon')[0];
        $(icon).empty();
        var svgDimension = 30;
        var trans = svgDimension / 2;

        var svg = d3.select(icon).append("svg").attr("height", svgDimension).attr("width", svgDimension).style("background", "");
        var group = svg.append('g').attr("transform", "translate(" + trans + "," + trans + ")");
        group.append('circle')
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 13)
            .style("fill", "none")
            .style("stroke", pieColors[index].strokeColor)
            .style("stroke-width", 3)
            .style("opacity", 1);

    });


}