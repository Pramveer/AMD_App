import {
    Template
} from 'meteor/templating';
import './adherence.html';
import * as analyticsLib from '../analyticsLib.js';

//Set Drug Display Limit for selection
var DRUG_LIMIT = 10;
//Perform operation when template rendered
let primaryData = {}, secondaryData ={};
let uniquepatients=0;
let totalpatients=0;

Template.Adherence.onCreated(function() {
    var self = this;
    this.loading = new ReactiveVar(false);
    this.noData = new ReactiveVar(false);

    let params = getCurrentPopulationFilters();
    params['fdaCompliant'] = "yes";
    self.loading.set(true);
    executeAdherenceRender(params, self);


});


Template.Adherence.rendered = function() {

    //show export button
    $('.headerbuttonFilesection').show();
    //remove loading wheel
    document.getElementById("anim_loading_theme").style.visibility = "hidden";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("anim_loading_theme").style.top = "40%";
    //Display Graph for Drugs selection not more that 4 Drugs
    //Display Default 4 drugs data if no drugs is selected
    //GenerateAdherenceDetailFromBubbles();
    //drawAdherenceChart();
    // GenerateUtilizationBarBubbleMixedChart();
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

}
Template.Adherence.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    },
    'getPateintInfo': function() {
        var data = Template.Provider.__helpers.get('getPopulationData').call();
        // console.log(data);
        return data;
    },

    'uniquepatients':function(){
        return commaSeperatedNumber(uniquepatients);
    },
    'totalpatients':function(){
        return commaSeperatedNumber(totalpatients);
    },
    'percentage': function() {
        return parseInt((uniquepatients / totalpatients) * 100) + '%';
    }

});

Template.Adherence.events({

    'click .globalshowPatientadherence': function(event, template) {
        $('.diseasePredictionPList-listMask').hide();
        analyticsLib.prepareDomForShowPatients('adherence');
        //$('.analyticsPatientsPopup').show();
    },
    'click .globalexportPatientadherence': function(event) {
        var data =  analyticsLib.getDataForMedicationsExtension({
            subTab: 'adherence',
            returnAll : true,
            patientsData:primaryData.adherenceData.patientData,
            medication:medicationInfo.Medication});
        //var data = analyticsLib.getDataForMedications('', 'adherence', true);
        analyticsLib.exportPatientsData(event.currentTarget, 'adherence', data);
    },
    'click .adherence li': function(e, template, data) {
        let tabData = $(e.currentTarget).children('a').attr('data');

        if (data && data == 'refresh') {
            tabData = $('.adherence li.active a').attr('data');
        }

        $(e.currentTarget).addClass('active').siblings().removeClass('active');

        e.preventDefault();

        if (tabData == "withFDACompliant") {
            //console.log("Render FDA Comliant Data.");

            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "yes";

            template.loading.set(true);

            executeAdherenceRender(params, template);

        } else if (tabData == "withoutFDACompliant") {
            //console.log("Render Without FDA Comliant Data.");
            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "no";

            template.loading.set(true);

            executeAdherenceRender(params, template);

        } else if (tabData == "allMedsData") {
            //console.log("Render All Drugs Data.");

            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "all";
            template.loading.set(true);
            executeAdherenceRender(params, template);
        }
    },
     'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        if(isCustomerDataset()){
            plotComparisionDataCharts({plottingData:value,primaryData:primaryData,secondaryData:secondaryData,desc:desc});
        }
        else{
            plotComparisionDataCharts({plottingData:value,primaryData:secondaryData,secondaryData:primaryData,desc:desc});
        }
    }

});






function GenerateAdherenceBarChart(container, chartDataObj, totalPatients,chartSize) {
    chartDataObj = JSON.parse(chartDataObj);
    columnsData = chartDataObj.chartData;
    FinalDrugsArray = chartDataObj.finalDrugsArray;

    columnsData.sort(function(a, b) {
        return parseFloat(b["Population Health"]) - parseFloat(a["Population Health"]);
    });

    //append total patients count
    //Praveen 02/20/2017 commmon cohort
    setCohortPatientCount({ patientCount: totalPatients });
    //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(totalPatients));

    d3.select('.dimpleMapsContainer').selectAll("*").remove();
    let svgOptions = {
        svgWidth1: chartSize.svgWidth1,
        svgWidth2: chartSize.svgWidth2,
        generalHeight: chartSize.generalHeight,
        generalMargin: chartSize.generalMargin
    }
    let {
        svgWidth1,
        svgWidth2,
        generalHeight,
        generalMargin
    } = svgOptions;

    var svgHieght = columnsData.length * generalHeight;

    //allDrugData
    var svg1 = d3.select("#" + container).append("svg").attr("height", svgHieght).attr("width", svgWidth1).style("background", "");

    // var barColor = ['#102430', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97'];
    // var barInnerCircleColor = ['#102430', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97'];
    var barColor = ['#5fa276', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97'];
    var barInnerCircleColor = ['#5fa276', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97'];

    var firstGroup = svg1.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")");


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
                        .attr('dy', 14)
                        .text(arr1[j]);
                    HeaderHieght = HeaderHieght + 7;
                } else {
                    popupHeader.append('tspan')
                        .attr('x', 0)
                        .attr('dy', 21)
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
            .attr("x", 120)
            .attr("y", ((rectHeight + generalMargin) * i) + 10)
            .attr("width", 730)
            .attr("height", rectHeight - 20)
            //updated local event adherence popup event
            .attr("class", "js-adherence-rect")
            //.attr("onclick", "appendAdherenceCharts(event)")
            .attr("drug", columnsData[i].label)
            .style("fill", "#E4E0DC")
            .style("cursor", "pointer");

        var widthBar = ((parseFloat(columnsData[i].weightedAvg) * 730) / 100);

        // ADD FIRST CIRCLE AT END
        firstGroup.append('rect')
            .attr("x", 120)
            .attr("y", ((rectHeight + generalMargin) * i) + 10)
            .attr("width", widthBar)
            .attr("height", rectHeight - 20)
            //updated local event adherence popup event
            .attr("class", "js-adherence-rect")
            //.attr("onclick", "appendAdherenceCharts(event)")
            .attr("drug", columnsData[i].label)
            .style("fill", barColor[0])
            .style("opacity", opacity)
            .style("cursor", "pointer");

        // ADD CIRCLE AT END
        firstGroup.append('circle')
            //.attr("cx", 110 + widthBar)
            //Added 2 because if we have lower value of utilization chart display in consistent, Need other solution for this issue
            .attr("cx", 120 + 2 + widthBar)
            .attr("cy", ((rectHeight + generalMargin) * i) + 37.5)
            .attr("r", 27.5)
            //updated local event adherence popup event
            .attr("class", "js-adherence-rect")
            //.attr("onclick", "appendAdherenceCharts(event)")
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
                .attr("x", 120 - 27.5)
                .attr("y", ((rectHeight + generalMargin) * i) + 10)
                .attr("width", 27.5)
                .attr("height", rectHeight - 20)
                .style("fill", '#ffffff')
                .style("stroke-width", 1)
                .style("opacity", opacity);
        }

        //FIRST ROW INDICATOR VALUE TEXT
        var val = columnsData[i].weightedAvg;
        // val = val.toFixed(0);

        var drugName = columnsData[i].label;
        let obj = {
            value: val,
            drugName: drugName,
            DrugN: columnsData[i].TotalDrugN
        };

        // tooltip on text of adherence chart
        var tooltip = d3.select("#" + container)
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("font-size", "13px")
            .style("font-family", "Open Sans,sans-serif")
            .style("width", "200px")
            .style("padding", "10px 10px")
            .style("background-color", "white")
            .style("box-sizing", "border-box")
            .style("box-shadow", "0px 0px 30px 3px rgba(56, 56, 56, 0.5)")

        firstGroup.append("text")
            .attr("class", "drugNameDisplayText")
            .attr("x", 920)
            .attr("y", ((rectHeight + generalMargin) * i) + 40)
            .style("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .style("font-family", "Open Sans, sans-serif")
            .style("fill", "rgb(105, 104, 104)")
            .style("opacity", 1)
            .attr('data', JSON.stringify(obj))
            .style("cursor", "pointer")
            .text(fixForInteger(val) + '%')
            /**
             * Yuvraj 14th feb 17
             * Tooltip information on te percentage text that will descibe what that percentage means.
             */
            // mouse over event for tooltip of adherence chart.
            .on("mouseover", function(e) {
                let dataObj = JSON.parse($(this).attr('data'));
                tooltip.html('Adherence of <b>' + dataObj.DrugN + '</b>  presciption for <b>' + dataObj.drugName + '</b> is <b>' + dataObj.value + '%</b>')
                tooltip.style("visibility", "visible")
                return true;
            })
            // mouse move event for tooltip of adherence chart.
            .on("mousemove", function(e) {
                let dataObj = JSON.parse($(this).attr('data'));
                tooltip.html('Adherence of <b>' + dataObj.DrugN + '</b>  presciption for <b>' + dataObj.drugName + '</b> is <b>' + dataObj.value + '%</b>')
                tooltip.style("top", (event.pageY - 300) + "px").style("left", (event.pageX - 120) + "px")
                return true;
            })
            // hide tooltip on mouseout.
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden")
                return true;

            });


    }
    assignClickEventToEffBubbles();
};





function appendAdherenceCharts(event) {
    let medicationInfo = {};
    let drugName = $(event.target).attr('drug'),
        valueData = '';

    medicationInfo['Medication'] = drugName;
    medicationInfo['Medication'] = medicationInfo['Medication'].replace(/\s*\(.*?\)\s*/g, '');
    drugName = drugName.split(' ');
    drugName = drugName[drugName.length - 1];
    drugName = drugName.replace('(', '');
    drugName = drugName.replace('W)', '');
    // Update to convert as int treatment period field to solve grouping.
    medicationInfo['treatmentPeriod'] = parseInt(drugName);
    medicationInfo['uniquePatients'] = uniquepatients;
    medicationInfo['totatPatients'] = totalpatients;
    // Updated By Jayesh 25th May 2017 for Removed server side variable dependancies
    // as we are fetching different dataset IMS & PHS.
    // data = analyticsLib.getDataForMedications(medicationInfo, 'adherence');medication, subTab, returnAll,patientsData
    data = analyticsLib.getDataForMedicationsExtension({
        subTab: 'adherence',
        returnAll : false,
        patientsData:primaryData.adherenceData.patientData,
        medication:medicationInfo.Medication});

    analyticsLib.prepareAdherencePopup(data, {
        medicationInfo: medicationInfo,
        value: valueData,
        subTab: 'adherence'
    });

}

function assignClickEventToEffBubbles() {
    $('.js-adherence-rect').click(function(event) {
        appendAdherenceCharts(event);
    });
}



/* Remove Old efficacy bubble in adherence tab.

/// START OF EFFICACY CODE

function drawAdherenceChart() {
    let allDrugsData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];
    let efficacyContainer = [];

    if (allDrugsData.length > 0) {
        $('#adherence-container').html('');
        //Sort Chart by Descending order first
        allDrugsData.sort(function(a, b) {
            return parseFloat(b.Adherence.Adherence) - parseFloat(a.Adherence.Adherence);
        });
        allDrugsData.forEach((drug) => {
            let drugName = drug.DrugName.replace(/ \+ /g, ' ');
            let bubbleHtml = `<div class="widthof190">
            <div class="ecf-title">${drugName}</div>
            <div style="text-align:center;">
                <span class="ecf-patient-countIcon"></span>
                <span class="ecf-patient-count">${drug.DrugN}</span>
            </div>
            <div class="ecf-cricle js-ecf-circle" drug="${drug.DrugName}">
                <div class="efficacyBubble" data-text="${drug.Adherence.Adherence}" data-dimension="150"></div>
            </div>
            </div>`;
            $('#adherence-container').append(bubbleHtml);

        });
        //append total patients count
        $('.efd-totalPatients').html(commaSeperatedNumber(allDrugsData[0]['TotalN']));
    }

    $('.efficacyBubble').each(function(index, bubble) {


        var efficacyScore = $(bubble).data('text');
        // var fillColor = $(bubble).data('fill-color') || '#102330';
        var fillColor = $(bubble).data('fill-color') || '#2e7e97';
        var textColor = $(bubble).data('text-color') || '#FFFFFF';
        var strokeColor = $(bubble).data('stroke-color') || '#DEE0DF';

        let svgOptions = {
            dimension: 200,
            svgWidth1: 600,
            svgWidth2: 270,
            generalHeight: 80,
            generalMargin: 5
        };

        var svgDimension = $(bubble).data('dimension') || 200;
        var transX = svgDimension / 2;
        var transY = svgDimension / 2;
        let {
            svgWidth1,
            svgWidth2,
            generalHeight,
            generalMargin
        } = svgOptions;
        let rectHeight = generalHeight - generalMargin;

        //var radius = (svgDimension / 2) - strokeWidth;
        //Dynamic score fill and stroke width calculation
        //Previous we have use r=100 but know we are using r=75 so circle radius calculated dynamically
               // let radius = Number(efficacyScore) * rectHeight / 100;
        let radius = rectHeight - 20;
         //    let percentOpacity=Number(efficacyScore)/100;
        let percentOpacity = 1.0;
        let strokeWidth = (rectHeight - radius);
        var svg = d3.select(bubble).append("svg").attr("height", svgDimension).attr("width", svgDimension).style("background", "");
        var group = svg.append('g').attr("transform", "translate(" + transX + "," + transY + ")");

        group.append('circle')
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius)
            .style("fill", fillColor)
            .style("stroke", strokeColor)
            .style("stroke-width", strokeWidth)
            .style("opacity", percentOpacity);

        group.append("text")
            .attr("class", "chartBubble")
            .attr("x", 0)
            .attr("y", 0)
        .style("text-anchor", "middle")
            .style("font-size", "17px")
            .style("font-weight", "bold")
            .style("font-family", "Open Sans, sans-serif")
            .style("fill", "#fff")
            // .style("opacity", 0.4)
            .text(fixForInteger(efficacyScore));

        group.append("line")
            .style("stroke", "#000")
            .attr("x1", 0)
            .attr("y1", -strokeWidth)
            .attr("x2", 0)
            .attr("y2", -(radius + strokeWidth));
    });

    assignClickEventToEffBubbles();
};



*/



function fixForInteger(val) {
    if (val == 0) {
        return 0 + '%';
    } else if (val == 'NA') {
        return 'Not Available';
    }

    var convertToInt = parseInt(val);
    var remainder = val % convertToInt;
    if (remainder == 0) {
        return convertToInt;
    }

    return parseFloat(val).toFixed(2);
}


/// END OF EFFICACY CODE
function getPadded(number) {
    var digit = getlength(number);
    var str = number.toString();
    if (digit == 1) {
        var str = pad(number, 2);
    }
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

function GenerateAdherenceDetailFromBubbles() {

    var minValue = 94;
    var maxValue = 99;
    var jsonData = [];
    var sampleJson = {
        "Real World Evidence": 95.3
    };
    var pieChartContainer = '<div class="col-xs-12 col-md-16" style="height:350px;"></div>';
    $('#pie-chart-container').html(pieChartContainer);
    // Math.floor(Math.random() * ((y-x)+1) + x);
    var selectedDrug = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];

    if (selectedDrug.length > 0) {

        for (var i = 0; i <= selectedDrug.length - 1; i++) {
            var drugData = {};

            var splittedDrug = selectedDrug[i].DrugName.split('+');
            if (splittedDrug.length > 1) {
                //split second index drug with '(' symbol
                var furtherSplittedDrug = splittedDrug[1].split('(');
                if (furtherSplittedDrug.length > 1) {
                    //To Do display  both array as zero index drug from it is and also set title for it
                    drugData["Medication"] = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');
                } else {
                    //To Do display  both array as zero index drug from it is and also set title for it
                    if (splittedDrug.length > 2) {
                        drugData["Medication"] = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');

                    } else {
                        drugData["Medication"] = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);

                    }
                }
            } else {
                //To Do display drug as it is and also set title for it
                drugData["Medication"] = selectedDrug[i].DrugName;

            }
            drugData["DragName"] = selectedDrug[i].DrugName;

            drugData["Real World Evidence"] = selectedDrug[i]["Adherence"]["Adherence"];
            var nonCompliance = {};
            var pieData = [];

            if (selectedDrug[i].HCVPatientData && selectedDrug[i].HCVPatientData.Adherence_non_compliance) {
                var nonCompliance = selectedDrug[i].HCVPatientData;

            } else {

                //Prepare logic for pie chart data to randomly distribute value
                var random1 = Math.floor(Math.random() * 10) - i;
                var random2 = Math.floor(Math.random() * 8) + i;
                var random3 = Math.floor(Math.random() * 6);


                nonCompliance.Adherence_PtFeelsNotNeeded = 10 - random1;
                nonCompliance.Adherence_SideEffects = 11 - random3;
                nonCompliance.Adherence_Affordability = 8 - random2;
                nonCompliance.Adherence_Forgetfullness = 6 - random3;
                nonCompliance.Adherence_LowRxSatisfaction = 3 + random1;
                nonCompliance.Adherence_PoorPhysicianRelationship = 6 + random2;
                nonCompliance.Adherence_PoorSocialSupport = Math.floor(Math.random() * i);

            }

            if (nonCompliance.Adherence_PtFeelsNotNeeded && nonCompliance.Adherence_PtFeelsNotNeeded > 0) {
                pieData.push(['Pt Feels Not Needed', nonCompliance.Adherence_PtFeelsNotNeeded]);
            }

            if (nonCompliance.Adherence_SideEffects && nonCompliance.Adherence_SideEffects > 0) {
                pieData.push(['Side Effects', nonCompliance.Adherence_SideEffects]);
            }

            if (nonCompliance.Adherence_Affordability && nonCompliance.Adherence_Affordability > 0) {
                pieData.push(['Affordability', nonCompliance.Adherence_Affordability]);
            }

            if (nonCompliance.Adherence_Forgetfullness && nonCompliance.Adherence_Forgetfullness > 0) {
                pieData.push(['Forgetfullness', nonCompliance.Adherence_Forgetfullness]);
            }

            if (nonCompliance.Adherence_LowRxSatisfaction && nonCompliance.Adherence_LowRxSatisfaction > 0) {
                pieData.push(['Low Rx Satisfaction', nonCompliance.Adherence_LowRxSatisfaction]);
            }

            if (nonCompliance.Adherence_PoorPhysicianRelationship && nonCompliance.Adherence_PoorPhysicianRelationship > 0) {
                pieData.push(['Poor Physician Relationship', nonCompliance.Adherence_PoorPhysicianRelationship]);
            }

            if (nonCompliance.Adherence_PoorSocialSupport && nonCompliance.Adherence_PoorSocialSupport > 0) {
                pieData.push(['Poor Social Support', nonCompliance.Adherence_PoorSocialSupport]);
            }
            //console.log(pieData);
            drugData.pieData = pieData;
            //drugData["pieData"] = filterDrugs[i].HCVPatientData
            jsonData.push(drugData);



        }
        //console.log(jsonData);
    }
    var widthSvg = 1200,
        heightSvg = 500,
        overRadius = 0,
        nTop = 0;
    var twoPi = 2 * Math.PI,
        progress = 0,
        total = 100, // must be hard-coded if server doesn't report Content-Length
        formatPercent = d3.format(".0%");
    var svgContainer = d3.select('#adherence-chart').style('height', heightSvg + 'px');
    document.getElementById('adherence-chart').innerHTML = '';
    var svg = d3.select('#adherence-chart')
        .append('svg')
        .attr('class', 'mainBubbleSVG')
        .attr('width', widthSvg)
        .attr('height', heightSvg)
        .on('mouseleave', function() {
            return resetBubbles();
        });
    var bubbleObj = svg.selectAll('.topBubble')
        .data(jsonData)
        .enter().append('g')
        .style('opacity', 9)
        .attr('id', function(d, i) {
            return 'topBubbleAndText_' + i;
        })

    //updated local event adherence popup event
    .attr("class", "js-adherence-rect");

    // .on('click', function(d, i) {
    //     appendAdherenceCharts(d);
    // });
    nTop = jsonData.length;
    overRadius = widthSvg / (1 + 3 * nTop) > 70 ? 70 : widthSvg / (1 + 3 * nTop);
    //overRadius = w/(1+3*nTop);
    heightSvg = Math.ceil(widthSvg / nTop * 2);
    svgContainer.style('height', heightSvg + 'px');
    var colVals = d3.scale.category10();
    var colVals1 = ['#ef4722', '#DF4D66', '#3cbca9', '#815493', '#724651', '#656967', '#19c97d', '#1379B7'];
    var colText = ['#ef4722', '#815493', '#724651', '#656967', '#19c97d', '#1379B7', '#DF4D66', '#3cbca9'];
    bubbleObj.append('circle')
        .attr('class', 'topBubble')
        .style('opacity', 9)
        .attr('id', function(d, i) {
            return 'topBubble' + i;
        })
        .attr('r', function(d) {
            return overRadius;
        })
        .attr('cx', function(d, i) {
            return overRadius * (3 * (1 + i) - 1);
        })
        .attr('cy', (heightSvg + overRadius) / 3)
        .style('fill', function(d, i) {
            return '#133248';
        }).style('opacity', 1)
        .on('mouseover', function(d, i) {
            return activateBubble(d, i);
        }); //.
    // on('click',function(d,i){
    //     appendPatientsDetails(d);
    // });

    bubbleObj.append('text')
        .attr('class', 'topBubbleText')
        .attr('x', function(d, i) {
            return overRadius * (3 * (1 + i) - 1);
        })
        .attr('y', (heightSvg + overRadius) / 3)
        .style('fill', '#fff') //
        .style('opacity', 1)
        .style('cursor', 'pointer')
        .attr('font-size', 18)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(function(d) {
            return d['Real World Evidence'] + '%';
        })
        .on('mouseover', function(d, i) {
            return activateBubble(d, i);
        });

    bubbleObj.append('text')
        .attr('class', 'topBubbleTextHeader')
        .attr('x', function(d, i) {
            return overRadius * (3 * (1 + i) - 1);
        })
        .attr('y', (heightSvg + (overRadius * 4)) / 2)
        .style('fill', function(d, i) {
            return colText[i];
        }) // #1f77b4
        .attr("font-weight", "bold")
        .attr("font-family", "arial")
        .attr('font-size', 12)
        .style('cursor', 'pointer')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(function(d) {
            return d['DragName'];
        })
        .on('mouseover', function(d, i) {
            return activateBubble(d, i);
        });

    // for (var iB = 0; iB < nTop; iB++) {
    //     var childBubbles = svg.selectAll('.childBubble' + iB)
    //         .data(jsonData[iB].pieData)
    //         .enter().append('g');
    //     childBubbles.append('circle')
    //         .attr('class', 'childBubble' + iB)
    //         .attr('id', function(d, i) {
    //             return 'childBubble_' + iB + 'sub_' + i;
    //         })
    //         .attr('r', function(d) {
    //             return overRadius / 3.0;
    //         })
    //         .attr('cx', function(d, i) {
    //             return (overRadius * (3 * (iB + 1) - 1) + overRadius * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
    //         })
    //         .attr('cy', function(d, i) {
    //             return ((heightSvg + overRadius) / 3 + overRadius * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926));
    //         })
    //         .attr('cursor', 'pointer')
    //         .style('opacity', 0)
    //         .style('fill', function(d, i) {
    //             return colVals1[i];
    //         });
    //     childBubbles.on('click', function(d, i) {
    //         //window.open(d['0']);
    //     });
    //     childBubbles.on('mouseover', function(d, i) {
    //             //window.alert('say something');
    //             var noteText = '';
    //             //if (d['1'] == null || d['1'] == '') {
    //             //Change condition for non empty using falsy/truthy check
    //             if (!d['1']) {
    //                 noteText = d['0'] + '%';
    //             } else {
    //                 noteText = d['1'] + '%';
    //             }
    //             d3.select('#bubbleItemNote').text(noteText);
    //         })
    //         .append('svg:title')
    //         .text(function(d) {
    //             return d['1'] + '%';
    //         });

    //     childBubbles.append('text').attr('class', 'childBubbleText' + iB).attr('x', function(d, i) {
    //             return (overRadius * (3 * (iB + 1) - 1) + overRadius * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
    //         }).attr('y', function(d, i) {
    //             return ((heightSvg + overRadius) / 3 + overRadius * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926));
    //         }).style('opacity', 0).attr('text-anchor', 'middle')
    //         .style('fill', function(d, i) {
    //             return '#fff';
    //         }) // #1f77b4
    //         .attr('font-size', 6).attr('cursor', 'pointer').attr('dominant-baseline', 'middle')
    //         .attr('alignment-baseline', 'middle').text(function(d) {
    //             return d['1'] + '%';
    //         });
    //     childBubbles.on('click', function(d, i) {
    //         //window.open(d['0']);
    //     });
    //     childBubbles.append('text').attr('class', 'childBubbleTextLabel' + iB).attr('x', function(d, i) {
    //             return (overRadius * (3 * (iB + 1) - 1) + overRadius * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926)) + 10;
    //         }).attr('y', function(d, i) {
    //             return ((heightSvg + overRadius) / 3 + overRadius * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926));
    //         }).attr("font-weight", "bold").attr("font-family", "arial")
    //         .style('opacity', 0).attr('text-anchor', 'middle')
    //         .style('fill', function(d, i) {
    //             return '#C91966';
    //         }) // #1f77b4
    //         .attr('font-size', 14).attr('cursor', 'pointer').attr('dominant-baseline', 'middle')
    //         .attr('alignment-baseline', 'middle').text(function(d) {
    //             return d['0'];
    //         });
    // }

    function resetBubbles() {
        nTop = jsonData.length, widthSvg = 1200, heightSvg = 500, overRadius = widthSvg / (1 + 3 * nTop) > 70 ? 70 : widthSvg / (1 + 3 * nTop);
        svgContainer.style('height', heightSvg + 'px');
        svg.attr('width', widthSvg);
        svg.attr('height', heightSvg);
        var tip = svg.transition().duration(650);
        tip.selectAll('.topBubble')
            .attr('r', function(data) {
                return overRadius;
            })
            .attr('cy', (heightSvg + overRadius) / 3)
            .attr('cx', function(data, i) {
                return overRadius * (3 * (1 + i) - 1)
            });
        tip.selectAll('.topBubbleText').attr('font-size', 18).attr('x', function(data, i) {
            return overRadius * (3 * (1 + i) - 1)
        }).attr('y', (heightSvg + overRadius) / 3);
        tip.selectAll('.topBubbleTextHeader').attr('font-size', 12).attr('x', function(data, i) {
            return overRadius * (3 * (1 + i) - 1)
        }).attr('y', (heightSvg + (overRadius * 4)) / 2);
        for (var k = 0; k < nTop; k++) {
            tip.selectAll('.childBubbleText' + k).attr('x', function(data, i) {
                    return (overRadius * (3 * (k + 1) - 1) + overRadius * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926))
                }).attr('y', function(data, i) {
                    return ((heightSvg + overRadius) / 3 + overRadius * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926))
                })
                .attr('font-size', 6).style('opacity', 0.5);
            tip.selectAll('.childBubbleTextLabel' + k).attr('x', function(data, i) {
                    return (overRadius * (3 * (k + 1) - 1) + overRadius * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926)) + 10
                }).attr('y', function(data, i) {
                    return ((heightSvg + overRadius) / 3 + overRadius * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926))
                })
                .attr('font-size', 14).style('opacity', 0);
            tip.selectAll('.childBubble' + k).attr('r', function(data) {
                    return overRadius / 3.0
                })
                .style('opacity', 0).attr('cx', function(data, i) {
                    return (overRadius * (3 * (k + 1) - 1) + overRadius * 1.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926))
                }).attr('cy', function(data, i) {
                    return ((heightSvg + overRadius) / 3 + overRadius * 1.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926))
                });
        }
    }

    function activateBubble(data, i) {
        // increase this bubble and decrease others
        var tip = svg.transition().duration(d3.event.altKey ? 7500 : 350);
        tip.selectAll('.topBubble').attr('cx', function(data, ii) {
            if (i === ii) {
                // Nothing to change
                return overRadius * (3 * (1 + ii) - 1) - 0.6 * overRadius * (ii - 1);
            } else {
                // Push away a little bit
                if (ii < i) { // left side
                    return overRadius * 0.6 * (3 * (1 + ii) - 1);
                } else { // right side
                    return overRadius * (nTop * 3 + 1) - overRadius * 0.6 * (3 * (nTop - ii) - 1);
                }
            }
        }).attr('r', function(data, ii) {
            if (i === ii)
                return overRadius * 1.8;
            else
                return overRadius * 0.8;
        });
        tip.selectAll('.topBubbleText').attr('x', function(data, ii) {
            if (i === ii) {
                // Nothing to change
                return overRadius * (3 * (1 + ii) - 1) - 0.6 * overRadius * (ii - 1);
            } else {
                // Push away a little bit
                if (ii < i) { // left side
                    return overRadius * 0.6 * (3 * (1 + ii) - 1);
                } else { // right side
                    return overRadius * (nTop * 3 + 1) - overRadius * 0.6 * (3 * (nTop - ii) - 1);
                }
            }
        }).attr('font-size', function(data, ii) {
            if (i === ii)
                return 20 * 1.5;
            else
                return 20 * 0.6;
        });
        tip.selectAll('.topBubbleTextHeader').attr('x', function(data, ii) {
                var overRadius1 = overRadius;
                if (i === ii) {
                    // Nothing to change
                    return overRadius1 * (3 * (1 + ii) - 1) - 0.6 * overRadius1 * (ii - 1);
                } else {
                    // Push away a little bit
                    if (ii < i) { // left side
                        return overRadius1 * 0.6 * (3 * (1 + ii) - 1);
                    } else { // right side
                        return overRadius1 * (nTop * 3 + 1) - overRadius1 * 0.6 * (3 * (nTop - ii) - 1);
                    }
                }
            }).attr('y', function(data, ii) {
                var overRadius1 = overRadius * 4;
                if (i === ii) {
                    // Nothing to change
                    return ((heightSvg + (overRadius * 4)) / 2) + 30;
                } else {
                    return (heightSvg + (overRadius * 4)) / 2
                }
            })
            .attr('font-size', function(data, ii) {
                if (i === ii)
                    return 20 * 1.5;
                else
                    return 20 * 0.6;
            });
        var signSide = -1;
        for (var k = 0; k < nTop; k++) {
            signSide = 1;
            if (k < nTop / 2) signSide = 1;
            tip.selectAll('.childBubbleText' + k).attr('x', function(data, i) {
                return (overRadius * (3 * (k + 1) - 1) - 0.6 * overRadius * (k - 1) + signSide * overRadius * 2.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
            }).attr('y', function(data, i) {
                return ((heightSvg + overRadius) / 3 + signSide * overRadius * 2.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926));
            }).attr('font-size', function() {
                return (k === i) ? 12 : 6;
            }).style('opacity', function() {
                return (k === i) ? 0 : 0;
            });
            tip.selectAll('.childBubbleTextLabel' + k).attr('x', function(data, i) {
                return (overRadius * (3 * (k + 1) - 1) - 0.6 * overRadius * (k - 1) + signSide * overRadius * 2.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
            }).attr('y', function(data, i) {
                return ((heightSvg + overRadius) / 3 + signSide * overRadius * 2.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926)) + (overRadius * 0.66);
            }).attr('font-size', function() {
                return (k === i) ? 12 : 6;
            }).style('opacity', function() {
                return (k === i) ? 0 : 0;
            });
            tip.selectAll('.childBubble' + k).attr('cx', function(data, i) {
                return (overRadius * (3 * (k + 1) - 1) - 0.6 * overRadius * (k - 1) + signSide * overRadius * 2.5 * Math.cos((i - 1) * 45 / 180 * 3.1415926));
            }).attr('cy', function(data, i) {
                return ((heightSvg + overRadius) / 3 + signSide * overRadius * 2.5 * Math.sin((i - 1) * 45 / 180 * 3.1415926));
            }).attr('r', function() {
                return (k === i) ? (overRadius * 0.55) : (overRadius / 3.0);
            }).style('opacity', function() {
                return (k === i) ? 0 : 0;
            });
        }
    }
    resetBubbles();

}


let executeAdherenceRender = (params, tempateObj) => {
    Meteor.call('getAdherenceTabData', params, function(error, result) {
        if (error) {
            tempateObj.loading.set(false);
            tempateObj.noData.set(true);
        } else {
            let decompressed_object = LZString.decompress(result);
            result = JSON.parse(decompressed_object);
          //  let drugsData = result.drugsData;
            tempateObj.loading.set(false);
            primaryData.adherenceData = result;
            // console.log('getAdherenceTabData');
            // console.log(result.chartsData);
            let chartSize = {};

            chartSize.svgWidth1= 950;
            chartSize.svgWidth2= 270;
            chartSize.generalHeight= 80;
            chartSize.generalMargin= 5;
            uniquepatients = result.totalPatients;
            totalpatients = result.OldtotalPatients;

            setTimeout(function() {
                GenerateAdherenceBarChart("adherence-container", result.chartsData, result.totalPatients,chartSize);
            }, 500);

            // Updated By Jayesh 25th May 2017 for Removed server side variable dependancies
            // as we are fetching different dataset IMS & PHS.

            // analyticsLib.getPatientsDataForAnalytics((res) => {
            //     if (!res) {
            //         tempateObj.loading.set(false);
            //         tempateObj.noData.set(true);
            //     }
            // });

            executeComparativeAdherenceRender(params);
            // executeCompartiveDrilldown({dataFlag: "Primary"});
        }

    });
}

// Added By Jayesh 18th May 2017 for fetching data of second dataset to compare data.
let executeComparativeAdherenceRender = (params) => {
        params.database = getReverseSelectedDatabase();

        Meteor.call('getAdherenceTabData', params, function(error1, results) {
            if (error1) {
                console.log(error1);
                secondaryData.adherenceData = [];
            } else {
                let decompressed_object = LZString.decompress(results);
                secondaryData.adherenceData = JSON.parse(decompressed_object);
                // executeCompartiveDrilldown({dataFlag: "Secondary"});
                $('.togglechart').show();
            }
        });
}

//function to plot comparision charts
let plotComparisionDataCharts = ({ plottingData, primaryData, secondaryData, desc}) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let chartContainer = {};
    chartContainer.primaryDivID = 'primaryDataViewSection',
    chartContainer.secondaryDivID  = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    chartContainer.height = 800;
    chartContainer.width = 510;

    //empty the containers
    $('#'+chartContainer.primaryDivID).empty();
    $('#'+chartContainer.secondaryDivID).empty();

    switch (plottingData) {
        case 'adherence':
            chartTypeLabel = 'Adherence Rate - Medication Possession Ratio';
            renderCompartiveHighBarCharts(chartContainer.primaryDivID, primaryData.adherenceData.chartsData, chartContainer);
            renderCompartiveHighBarCharts(chartContainer.secondaryDivID, secondaryData.adherenceData.chartsData, chartContainer);
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}


function renderCompartiveHighBarCharts(container, data, chartContainer) {
   let currentDataObj = JSON.parse(data);
   let columnsData = currentDataObj.highchartData;

  columnsData = _.sortBy(columnsData, (rec) => { return rec.name.toString();});
  $('#'+ container).html('');
  Highcharts.chart(container, {
        chart: {
            type: 'bar',
            height: chartContainer.height,
            width: chartContainer.width,
        },
        title: {
            text: null
        },
        subtitle: {
            text: 'Click the bar to view medication insights.'
        },
        xAxis: {
            type: 'category',
            labels: {
                formatter: function () {
                    let xlabel = this.value.toString().split('+');
                    let html = '<span>';
                    _.each(xlabel,(rec)=>{
                        html += rec + '<br />';
                    });
                    html +='</span>';
                    return html;
                }
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            gridLineWidth: 0,
            title: {
                text: null
            },
            labels:{
                enabled : false
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            reversed: false,
            enabled: false
        },
        plotOptions: {
            series: {
                stacking: 'normal',
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            chartContainer.chartMedicationName = this.name;
                            renderDrilldownChart(chartContainer);
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
        tooltip: {
             formatter: function () {
                         return 'Adherence of <b>' + this.point.TotalDrugN + '</b>  patients who have been<br /> prescribed <b>' + this.point.name + '</b> is <b>' + this.y + '%.</b>' ;
            }
        },
        series: [{
            name: 'Adherence Rate - Medication Possession Ratio',
            data: columnsData
        }]
    });
}

function renderDrilldownChart(chartContainer){
    // prepare primary div for rendering location map, age distribution, therapy distribution.
     let primaryHtml = `<div class="col-lg-12">
                        <div><b>${chartContainer.chartMedicationName}</b></div>
                    </div>
                     <div class="col-lg-12"  style='min-height:478px;'>
                            <div class="" ><b>Age Distribution</b></div>
                            <div class="" id="${chartContainer.primaryDivID}comparativeAdherenceAgeDistribution"></div>
                    </div>
                    <div class="col-lg-12"  style='min-height: 416px;'>
                        <div class="" ><b>Therapy Distribution</b></div>
                        <div class="" id="${chartContainer.primaryDivID}comparativeTherapyDistribution"></div>
                    </div>
                    <div class="col-lg-12">
                        <div class="" ><b>Location Map</b></div>
                        <div class="" style="height: 450px;" id="${chartContainer.primaryDivID}comparativeAdherenceLocationMap"></div>
                    </div> `;

    $('#'+ chartContainer.primaryDivID).html(primaryHtml);

    // prepare secondary div for rendering location map, age distribution, therapy distribution.
    let secondaryHtml = `<div class="col-lg-12">
                        <div><b>${chartContainer.chartMedicationName}</b></div>
                        <div style="cursor:pointer;position: relative!important;top:-60px" class="adherenceBack customChartBackButton backButtonCss">Back</div>
                    </div>
                     <div class="col-lg-12" style='margin-top: -46px;min-height: 478px;'>
                            <div class="" ><b>Age Distribution</b></div>
                            <div class="" id="${chartContainer.secondaryDivID}comparativeAdherenceAgeDistribution"></div>
                    </div>
                    <div class="col-lg-12" style='min-height: 416px;' >
                        <div class="" ><b>Therapy Distribution</b></div>
                        <div class="" id="${chartContainer.secondaryDivID}comparativeTherapyDistribution"></div>
                    </div>
                    <div class="col-lg-12" >
                        <div class="" ><b>Location Map</b></div>
                        <div class="" style="height: 450px;" id="${chartContainer.secondaryDivID}comparativeAdherenceLocationMap"></div>
                    </div> `;
    $('#'+ chartContainer.secondaryDivID).html(secondaryHtml);
    // bind back button event for drill up main chart in comparative.
    $('.adherenceBack').on('click',function(){
        // filping dataset
        if(isCustomerDataset()){
            renderCompartiveHighBarCharts(chartContainer.primaryDivID, primaryData.adherenceData.chartsData, chartContainer);
            renderCompartiveHighBarCharts(chartContainer.secondaryDivID, secondaryData.adherenceData.chartsData, chartContainer);
        }
        else{
            renderCompartiveHighBarCharts(chartContainer.primaryDivID, secondaryData.adherenceData.chartsData, chartContainer);
            renderCompartiveHighBarCharts(chartContainer.secondaryDivID, primaryData.adherenceData.chartsData, chartContainer);
        }
    });
    let primaryfilterData = [], secondaryfilterData = [];
    // filping dataset
    if(isCustomerDataset()){
        primaryfilterData =  analyticsLib.getDataForMedicationsExtension({
            subTab: 'adherence',
            returnAll : false,
            patientsData:primaryData.adherenceData.patientData,
            medication:chartContainer.chartMedicationName});

        secondaryfilterData =  analyticsLib.getDataForMedicationsExtension({
            subTab: 'adherence',
            returnAll : false,
            patientsData:secondaryData.adherenceData.patientData,
            medication:chartContainer.chartMedicationName});

    }
    else{
        primaryfilterData = analyticsLib.getDataForMedicationsExtension({
            subTab: 'adherence',
            returnAll : false,
            patientsData:secondaryData.adherenceData.patientData,
            medication:chartContainer.chartMedicationName});

        secondaryfilterData = analyticsLib.getDataForMedicationsExtension({
            subTab: 'adherence',
            returnAll : false,
            patientsData:primaryData.adherenceData.patientData,
            medication:chartContainer.chartMedicationName});
    }
    analyticsLib.renderAdherenceTherapyDisributionChart(chartContainer.primaryDivID+'comparativeTherapyDistribution', primaryfilterData, chartContainer.chartMedicationName)
    analyticsLib.renderAdherenceTherapyDisributionChart(chartContainer.secondaryDivID+'comparativeTherapyDistribution', secondaryfilterData, chartContainer.chartMedicationName);

    analyticsLib.renderLocationMapChartForAdherence(chartContainer.primaryDivID+'comparativeAdherenceLocationMap', groupingZipcodeData(primaryfilterData), null);
    analyticsLib.renderLocationMapChartForAdherence(chartContainer.secondaryDivID+'comparativeAdherenceLocationMap', groupingZipcodeData(secondaryfilterData), null);

    analyticsLib.renderAgeDistributionChart(chartContainer.primaryDivID+'comparativeAdherenceAgeDistribution', primaryfilterData, null);
    analyticsLib.renderAgeDistributionChart(chartContainer.secondaryDivID+'comparativeAdherenceAgeDistribution', secondaryfilterData, null);

}



function groupingZipcodeData(data){
     // Update Calculation for adherence for each patient and grouping by zipcode
    let patientDataGroupByZipCode = _.groupBy(data, (rec) => { return rec.zipcode; });
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
    return finalData;
}
