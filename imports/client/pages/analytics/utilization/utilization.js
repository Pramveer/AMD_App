import {
    Template
} from 'meteor/templating';
import _ from 'lodash'
import './utilization.html';
import * as analyticsLib from '../analyticsLib.js';
//import '../../../lib/custom/payer/Charts/PopulationUtilizationChart.js';
//import '../../../lib/custom/payer/Charts/genotypeVsUtilizationChart.js';
/*
// Nisha
// 02/15/2017
// Modified for comparing geoLocation distribution of drugs
*/
let uniqPatients = 0;
let totPatients = 0;

let UtlizationDrugsData = null;
Pinscriptive.Utilization = {};
var DRUG_LIMIT = 10;
/*var pieColors = [{
    strokeColor: '#7B7A6D',
    textColor: '#7B7A6D'
}, {
    strokeColor: '#DF4D66',
    textColor: '#DF4D66'
}, {
    strokeColor: '#724651',
    textColor: '#724651'
}];*/
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


Template.Utilization.onCreated(function() {
    var self = this;
    this.loading = new ReactiveVar(false);
    this.noData = new ReactiveVar(false);

    let params = getCurrentPopulationFilters();
    params['fdaCompliant'] = "yes";

    self.loading.set(true);
    executeUtilizationRender(params, self);
});


//Perform operation when template rendered
Template.Utilization.rendered = function() {

    //Display Graph for Drugs selection not more that 4 Drugs
    //Display Default 4 drugs data if no drugs is selected

    //show export button
    $('.headerbuttonFilesection').show();
    //remove loading wheel
    document.getElementById("anim_loading_theme").style.visibility = "hidden";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("anim_loading_theme").style.top = "40%";
    // removed modify drug so now showing all drugs on charts
    //  var allDrugsData = JSON.parse(localStorage.AllDrugsData);
    // var uti = roundToExact100(allDrugsData, 100, 'Utilization', 'Utilization');
    // var net = roundToExact100(allDrugsData, 100, 'Utilization', 'NetworkLength');
    // var provi = roundToExact100(allDrugsData, 100, 'Utilization', 'ProviderLength');

    // for (var k = 0; k < allDrugsData.length; k++) {
    //     allDrugsData[k]['Utilization'].Utilization = uti[k];
    //     allDrugsData[k]['Utilization'].NetworkLength = net[k];
    //     allDrugsData[k]['Utilization'].ProviderLength = provi[k];
    // }

    //  localStorage.setItem('AllDrugsData', JSON.stringify(allDrugsData));

    //Generate Pie chart for all drugs name
    // GenerateUtilizationBarBubbleMixedChart();

    //  $('.machineLearn-totalPatients').html(commaSeperatedNumber(allDrugsData[0].TotalN || 0));

    // initialize tooltip
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
};



//Create helper method for Utilization page
Template.Utilization.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    },
    'uniqPatients':function(){
        return commaSeperatedNumber(uniqPatients);
    },
    'totPatients':function(){
        return commaSeperatedNumber(totPatients);
    },
    'percentage': function() {
        return parseInt((uniqPatients / totPatients) * 100) + '%';
    }
});

Template.Utilization.events({
    'click .globalshowPatientutilization': function(event, template) {
        $('.diseasePredictionPList-listMask').hide();
        analyticsLib.prepareDomForShowPatients('utilization');
        //$('.analyticsPatientsPopup').show();
    },
    'click .globalexportPatientutilization': function(event) {
        let data = analyticsLib.getDataForMedicationsForUtilization('', 'utilization', true);
        analyticsLib.exportPatientsData(event.currentTarget, 'Utilization', data);
    },
    'click .comparegeolocation': function(event) {
        // console.log('comparegeolocation');
        analyticsLib.renderCompareLocationMapChartUtlization();
    },
    'click .utilization li': function(e, template, data) {
        let tabData = $(e.currentTarget).children('a').attr('data');
        if (data && data == 'refresh') {
            tabData = $('.utilization li.active a').attr('data');
        }

        $(e.currentTarget).addClass('active').siblings().removeClass('active');

        e.preventDefault();

        if (tabData == "withFDACompliant") {
            //console.log("Render FDA Comliant Data.");

            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "yes";

            template.loading.set(true);
            executeUtilizationRender(params, template);

        } else if (tabData == "withoutFDACompliant") {
            //console.log("Render Without FDA Comliant Data.");
            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "no";

            template.loading.set(true);
            executeUtilizationRender(params, template);

        } else if (tabData == "allMedsData") {
            //console.log("Render All Drugs Data.");

            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "all";

            template.loading.set(true);
            executeUtilizationRender(params, template);
        }
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];
        let baseOrigData = Pinscriptive.Utilization.realData;
        let baseCompData = Pinscriptive.Utilization.compData;
         if(value == 'compareutilization'){
            primaryData = prepareDataforChart(baseOrigData.drugsData);
            secondaryData = prepareDataforChart(baseCompData.drugsData);
        }
        //basedon current database
        //if current data is customer specific no need tto swtich variable else we need tto switch variable primaryData,secondaryData
        //by default customer data is selected then method value is true
        //sort data based on Utilization
        if(isCustomerDataset()){
            plotComparisionDataCharts(value,primaryData,secondaryData,desc);
        }
        else{
            plotComparisionDataCharts(value,secondaryData,primaryData,desc);
        }
    },
    'click .backBtnResponders':function(){
        $('#analyticsCostBurdenCompareUtilization').hide();
        $('#primaryDataViewSection').show();
        $('#secondaryDataViewSection').show();
    }

});

function GenerateUtilizationBarBubbleMixedChart(allDrugData, patient_count) {
    // console.log('GenerateUtilizationBarBubbleMixedChart');
    // console.log(allDrugData);

    UtlizationDrugsData = allDrugData;
    //var DrugData = localStorage.AllDrugsData && JSON.parse(localStorage.AllDrugsData) ? JSON.parse(localStorage.AllDrugsData) : [];
    // remove extra parsing process for faster performance
    // var allDrugData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];
    // $('.machineLearn-totalPatients').html(commaSeperatedNumber(allDrugData[0].TotalN || 0));
    //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(patient_count));

    //Praveen 02/20/2017 commmon cohort
    setCohortPatientCount({
        patientCount: patient_count
});


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
            .attr("onclick", "geoSubpopulationUtilizationChart(event)")
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
            .attr("onclick", "geoSubpopulationUtilizationChart(event)")
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
            .attr("onclick", "geoSubpopulationUtilizationChart(event)")
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
        firstGroup.append("text")
            .attr("class", "drugNameDisplayText")
            .attr("x", 570)
            .attr("y", ((rectHeight + generalMargin) * i) + 40)
            //.style("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .style("font-family", "Open Sans, sans-serif")
            .style("fill", "rgb(105, 104, 104)")
            .style("opacity", 1)
            .text(getPadded(val) + '%');
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
            .attr("onclick", "appendPatientsDetails(event)")
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
            .attr("onclick", "appendPatientsDetails(event)")
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
        //     .attr("onclick", "appendPatientsDetails(event)")
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


//function to get range of values to exact target value
function roundToExact100(l, target, identifier, key) {
    var off = target - _.reduce(l, function(acc, x) {
        return acc + Math.round(x[identifier][key])
    }, 0);
    return _.chain(l).
        //sortBy(function(x) { return Math.round(x.a) - x.a }).
    map(function(x, i) {
        return Math.round(x[identifier][key]) + (off > i) - (i >= (l.length + off))
    }).
    value();
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

function drawLegend() {

    var legends = $('.legend-item');

    legends.each(function(index, legend) {
        var icon = $(legend).find('.utilization-legend-icon')[0];

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

geoSubpopulationUtilizationChart = function(event) {
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
    medicationInfo['uniquePatients'] = uniqPatients;
    medicationInfo['totalPatients'] = totPatients;
    data = analyticsLib.getDataForMedicationsForUtilization(medicationInfo, 'utilization');

    analyticsLib.prepareUtilizationPopup(data, {
        medicationInfo: medicationInfo,
        subTab: 'utilization',
        filterdata: filterdata,
        UtlizationDrugsData: UtlizationDrugsData
    });
}

appendPatientsDetails = function(event) {
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
    medicationInfo['uniquePatients'] = uniqPatients;
    medicationInfo['totalPatients'] = totPatients;
    data = analyticsLib.getDataForMedicationsForUtilization(medicationInfo, 'utilization');
    analyticsLib.prepareUtilizationPopup(data, {
        medicationInfo: medicationInfo,
        value: valueData,
        subTab: 'utilization',
        filterdata: filterdata
    });

}

//get utilization data render
let executeUtilizationRender = (params, tempateObj) => {
    Meteor.call('getUtilizationTabData', params, function(error, result) {
        if (error) {
            tempateObj.loading.set(false);
            tempateObj.noData.set(true);
            Pinscriptive.Utilization.realData = null;
        } else {
            //allDrugsData = result.drugsData;
            let decompressed_object = LZString.decompress(result);
            result = JSON.parse(decompressed_object);
            Pinscriptive['DrugByGenotype'] = result.getDrugByGenotype;
            Pinscriptive.Utilization.realData = result;
            tempateObj.loading.set(false);
            tempateObj.noData.set(false);
            // self.loading.set(false);
            uniqPatients = result.totalPatients;
            totPatients = result.allpatients;

            analyticsLib.analyticsUtilizationPatientsData(result.patientDataUtilization);
            setTimeout(function() {
                GenerateUtilizationBarBubbleMixedChart(result.drugsData, result.totalPatients);

            }, 50);
            fetchSecondaryDataset(params);
        }
    });
}

//fetch secondary dataset for comparison
let fetchSecondaryDataset = (params) => {

    params.database = getReverseSelectedDatabase();//get database
    Meteor.call('getUtilizationTabData', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            Pinscriptive.Utilization.compData = null;
        } else {
            result = LZString.decompress(result);
            result = JSON.parse(result);
            Pinscriptive.Utilization.compData = result;
            $('.togglechart').show();
        }
    });
}


//function to plot comparision charts
let plotComparisionDataCharts = (plottingData,primaryData,secondaryData,diffplottingData) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = 'primaryDataViewSection',
        secondaryContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    //empty the containers
    $('#'+primaryContainer).empty();
    $('#'+secondaryContainer).empty();

    let chartSize = {};
    chartSize.height = 2400;
    chartSize.width = 500;

    switch (plottingData) {
        case 'compareutilization':
            chartTypeLabel = 'Utilization';
            generateUtilizationHighBarChart(primaryContainer,primaryData, primaryData.totalPatients, chartSize);
            generateUtilizationHighBarChart(secondaryContainer,secondaryData, secondaryData.totalPatients, chartSize);
            break;
    }
    $('.chartTypeLabel').html(chartTypeLabel);
    $('#medicationName').html('');
    //show the popup
    $('#datasetComparsionPopup').show();
}


let generateUtilizationHighBarChart = (container, chartDataObj, totalPatients,chartSize) =>{
    //chartDataObj = JSON.parse(chartDataObj);
    columnsData = chartDataObj.data;
    //FinalDrugsArray = chartDataObj.finalDrugsArray;

    // columnsData.sort(function(a) {
    //     return a.name;
    // });
    //check for no data
    if (chartDataObj.totalPatients == 0) {
        fnNoDataFound("#" + container);
        return;
    }
  Highcharts.chart(container, {
        chart: {
            type: 'bar',
            height:chartSize.height||2200,
            width:510
        },
        title: {
            text: null
        },
        subtitle:{
            text:'click on bar for distribution of data'
        },
        xAxis: {
            categories: chartDataObj.keys,
            labels: {
                align: 'right',
                style: {
                    width: '280px',
                    'min-width': '230px'
                },
                useHTML : true
            }

            // labels: {
            //     align: 'right',
            //     formatter: function () {
            //         // let xlabel = this.value.toString().split('+');
            //         // let html = '<span>';
            //         // _.each(xlabel,(rec)=>{
            //         //     html += rec + '<br />';
            //         // });
            //         // html +='</span>';
            //         return this.value;
            //     }
            // }
        },
        yAxis: {
            min:0,
            title: {
                text: ''
            },
            labels:{
                enabled : false
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                stacking: 'normal',
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let dataObj = _.clone(this);
                            dataObj['id'] = this.name;
                            renderComparisonGenotypeChart(this.name);
                            $('.backBtnResponders').show();
                            $('#analyticsCostBurdenCompareUtilization').show();
                            $('#primaryDataViewSection').hide();
                            $('#secondaryDataViewSection').hide();
                        }
                    }
                }
            },
            bar: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                         return this.y + '%';
                    }
                },
            }
        },
        series: [{
            name: 'Utilization',
            data: columnsData
        }]
    });
}


let prepareDataforChart = (baseData) =>{

    let keys = [];
    let chartData = [];
    let totalN = 0;
    //baseData.sort((a,b) => parseFloat(a.Utilization.Utilization) - parseFloat(b.Utilization.Utilization));

    for(let i=0;i<baseData.length;i++){
        let med = baseData[i].DrugName;
        //keys.push(med);
        let mjson = {};
        mjson['y'] = parseFloat(baseData[i]['Utilization']['Utilization']);
        mjson['name'] = med;
        mjson['color'] = getColorByValue(baseData[i]['DrugId']);
        totalN = baseData[i]['TotalN'];
        chartData.push(mjson);
    }
    chartData.sort((a,b)=>~~b.y - ~~a.y);
    for(let i=0;i<chartData.length;i++)
    keys.push(chartData[i].name);
    return {data:chartData,keys:keys,totalPatients:totalN};
}


let renderComparisonGenotypeChart = (medicationName) =>{
    let primaryData = [];
    let secondaryData = [];
    let baseOrigData = Pinscriptive.Utilization.realData;
    let baseCompData = Pinscriptive.Utilization.compData;
    primaryData = prepareDatabyGenotype(filterDataBasedOnMedication(baseOrigData.patientDataUtilization,medicationName));
    secondaryData = prepareDatabyGenotype(filterDataBasedOnMedication(baseCompData.patientDataUtilization,medicationName));
    let primaryContainer = 'prim_genotypeDistribution';
    let secondaryContainer = 'secon_genotypeDistribution';
    let primaryDatagroup = prepareDataGenotypeGroupUtilization(filterDataBasedOnMedication(baseOrigData.patientDataUtilization,medicationName));
    let secondaryDatagroup = prepareDataGenotypeGroupUtilization(filterDataBasedOnMedication(baseCompData.patientDataUtilization,medicationName));
    let primaryContainerUti = 'prim_utiDistribution';
    let secondaryContainerUti = 'secon_utiDistribution';
    if(isCustomerDataset()){
        renderhighbarchart(primaryContainer,primaryData);
        renderhighbarchart(secondaryContainer,secondaryData);
        renderhighbarchartGroup(primaryContainerUti,primaryDatagroup);
        renderhighbarchartGroup(secondaryContainerUti,secondaryDatagroup);
    }
    else{
        renderhighbarchart(secondaryContainer,secondaryData);
        renderhighbarchart(primaryContainer,primaryData);
        renderhighbarchartGroup(primaryContainerUti,secondaryDatagroup);
        renderhighbarchartGroup(secondaryContainerUti,primaryDatagroup);
    }
    $('#medicationName').html(medicationName);
}

let prepareDatabyGenotype = (baseData) =>{
    let genoGrpData = _.groupBy(baseData,'genotype');
    let keys = [];
    let chartData = [];
    for(let key in genoGrpData){
        let json = {};
        let keyData = genoGrpData[key];
        json['name'] = key;
        json['y'] = keyData.length;
        json['color'] = genotypeFixedColors(key);
        chartData.push(json);
        keys.push(key);
    }
    return {data:chartData,keys:keys,total:baseData.length};
}


let renderhighbarchart = (container,data) =>{
    //check for no data
    if (data.totalPatients == 0) {
        fnNoDataFound("#" + container);
        return;
    }
    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Population Health Genotype Distribution'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: data.keys,
            title: {
                text: 'Genotype'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count',
                align: 'middle'
            },
            labels: {
                overflow: 'justify'
            }
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Genotype</span>:<span>{point.name}</span><br/>
                          Patient Count:{point.y:,0.0f}<br/>`
        },
        legend: {
            enabled:false,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 80,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [{
            name:'Utilization',
            data:data.data
        }]
    });
}

let renderhighbarchartGroup = (container,data) =>{

    //check for no data
    if (data.totalPatients == 0) {
        fnNoDataFound("#" + container);
        return;
    }
    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Provider Health Utilization Distribution'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: data.keys,
            title: {
                text: 'Year'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count',
                align: 'middle'
            },
            labels: {
                overflow: 'justify'
            }
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Genotype</span>:<span>{point.name}</span><br/>
                          Patient Count:{point.y:,0.0f}<br/>`
        },
        legend: {
            enabled:false,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 80,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: data.data
    });
}


let prepareDataGenotypeGroupUtilization = (baseData) =>{
     let yearGroupData = _.groupBy(baseData, 'Year');
     let keys = Object.keys(yearGroupData);
     let chartData = [];

    let genoGroData = _.groupBy(baseData,'genotype');
    let flag = Object.keys(genoGroData).length<2?true:false;
    for(let geno in genoGroData){
             let simjson = {};
             simjson['name'] = geno;
             let genoData = genoGroData[geno];
             simjson['y'] = genoData.length;
             simjson['color'] = genotypeFixedColors(geno);
             let dgeno = [];
             let yearGroupDataGeno = _.groupBy(genoData, 'Year');
             for(let yr of keys){
                let yjson = {};
                yjson['name'] = geno;
                yjson['y'] = yearGroupDataGeno[yr] != undefined?yearGroupDataGeno[yr].length:0;
               // yjson['provider'] = _.unique(_.pluck(yearGroupDataGeno[yr], 'providerId')).length;
                if(flag){
                    yjson['color'] = getColorCodeByYear(yr);
                }
                dgeno.push(yjson);
             }
             simjson['data'] = dgeno;
             chartData.push(simjson);
    }
     return {data:chartData,keys:keys,totalPatients:baseData.length}
}


let filterDataBasedOnMedication = (baseData,medicationName) =>{
    let medSplit = medicationName.split('(');
    let medName  = '';
    let treatmentPeriod = 0;
    if(medSplit.length>1){
        medName = medSplit[0].trim();
        treatmentPeriod = ~~medSplit[1].replace(/\D+/g,'').trim();
    }

    let filteredData = baseData.filter((rec) => rec.Medication == medName && rec.treatmentPeriod == treatmentPeriod);
    return filteredData;
}
