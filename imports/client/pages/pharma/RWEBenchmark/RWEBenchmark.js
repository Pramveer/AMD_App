import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import * as pharmaLib from '../pharmaLib.js';
import './RWEBenchmark.html';


var drugsToTab = [];
var ShowAPRIWarrning = false;
var drugScoreValue = [];
var placedPosition = [];
var placedDistance = [];
var placedBubbleSize = [];
var placedDrugs = [];
var myThis;
var drugsData = null,
    drugRiskData = null;
let showPages = 10;

let relativeValueChartData = [],
    relativeChartContainer = null;

Template.RWEBenchmark.onCreated(function() {
    var self = this;
    this.loading = new ReactiveVar(true);
    this.noData = new ReactiveVar(false);
    var category_id = 1; //Session.get('category_id');
    var currPatient = Session.get('selectedPatientData');
    Session.set('selectedPage', 'pharma');
    if (Pinscriptive.Filters) {
        //Praveen 02/20/12017 changed pharmaLib.getCurrentPopulationFilters() to getCurrentPopulationFilters() from common.js
        Patientdata = getCurrentPopulationFilters();
        Session.set('selectedfilters', Patientdata); // Nisha 02/10/2017 for relative value cohort selection
    }

    // var Patientdata = Pinscriptive['Filters'];

    let params = {};
    if (Pinscriptive.Filters) {
        //Praveen 02/20/12017 changed pharmaLib.getCurrentPopulationFilters() to getCurrentPopulationFilters() from common.js
        params = getCurrentPopulationFilters();
    }

    this.autorun(function() {
        //Modified for IMS DB Intefration
        // We are not using category id anymore so we are passing Genotype, treatment and Cirrhosis individually.
        //  We need to improve the logic for Treatment and Cirrhisis subconditions.

        // let subtab = Session.get('rwebenchmark_subtab');
        let params = {};
        if (Pinscriptive.Filters) {
            //Praveen 02/20/12017 changed pharmaLib.getCurrentPopulationFilters() to getCurrentPopulationFilters() from common.js
            params = getCurrentPopulationFilters();
        }
        let subtab = Session.get('rwebenchmark_subtab');

        if(localStorage.getItem('provider_relative_weights')){
            let relativeWeights = JSON.parse(localStorage.getItem('provider_relative_weights'));
            params['efficacyWeight'] = relativeWeights['efficacy'];
            params['adherenceWeight'] = relativeWeights['adherence'];
            params['costWeight'] = relativeWeights['cost'];
        } else {
            params['efficacyWeight'] = 100;
            params['adherenceWeight'] = 100;
            params['costWeight'] = 100;
        }if(localStorage.getItem('provider_relative_weights')){
            let relativeWeights = JSON.parse(localStorage.getItem('provider_relative_weights'));
            params['efficacyWeight'] = relativeWeights['efficacy'];
            params['adherenceWeight'] = relativeWeights['adherence'];
            params['costWeight'] = relativeWeights['cost'];
        } else {
            params['efficacyWeight'] = 100;
            params['adherenceWeight'] = 100;
            params['costWeight'] = 100;
        }

        if (subtab) {
            if (subtab == 'withFDACompliant')
                params['fdaCompliant'] = "yes";
            else if (subtab == 'withoutFDACompliant')
                params['fdaCompliant'] = "no";
            else
                params['fdaCompliant'] = "all";
        } else {
            params['fdaCompliant'] = "yes";
        }

        Meteor.call('getRWEBenchmarkPageData', params, function(error, result) {
            if (error) {
                self.loading.set(false);
                self.noData.set(true);
            } else {
                //console.log(result);
                self.loading.set(false);
                let decompressed_object = LZString.decompress(result);
                let resulting_object = JSON.parse(decompressed_object);

                //console.log(resulting_object);
                self.loading.set(false);
                drugsData = resulting_object.drugsData;
                drugRiskData = resulting_object.riskData;
                // console.log(drugsData);
                // pharmaLib.setAdvancedSearchFilters();
                // pharmaLib.setPharmaHeader();

                //pharmaLib.setPharmaHeaderTabData();

                // OLD CODE
                // $('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(drugsData[0]['TotalN']));
                //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
                setCohortPatientCount({ patientCount: drugsData[0].TotalN });
            }

        });

    });
});

Template.RWEBenchmark.rendered = function() {
    highLightTab('Pharma');
    myThis = this;
    //executeAtRender(this);
    $('.pdlf-compare-div').hide();
    //set header for pharma
    pharmaLib.setAdvancedSearchFilters();
    pharmaLib.setPharmaHeader();

    renderAfterSorting();

    // initilize Relative weights Dropdown.
    initWeightsAccordian();
};


// Template.RWEBenchmark.destroyed = function () {
//    Session.set('rwebenchmark_subtab','withFDACompliant');
// };

//Praveen 02/20/2017 common function for fetching data
let fetchAndRenderData = (params) =>{
  Meteor.call('getRWEBenchmarkPageData', params, function(error, result) {
      if (error) {
          self.loading.set(false);
          self.noData.set(true);
      } else {
          //console.log(result);
          self.loading.set(false);
          let decompressed_object = LZString.decompress(result);
          let resulting_object = JSON.parse(decompressed_object);

          //console.log(resulting_object);
          self.loading.set(false);
          drugsData = resulting_object.drugsData;
          drugRiskData = resulting_object.riskData;
          // console.log(drugsData);
          // pharmaLib.setAdvancedSearchFilters();
          // pharmaLib.setPharmaHeader();

          //pharmaLib.setPharmaHeaderTabData();

          // OLD CODE
          // $('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(drugsData[0]['TotalN']));
          //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
          setCohortPatientCount({ patientCount: drugsData[0].TotalN });
      }

  });
}
//function to plot svg bubbles on the chart
Template.RWEBenchmark.renderSvgChartForSissionData = function(xAxis, yAxis, svgHeight, svgWidth, flag) {
    var data = JSON.parse(Session.get('svgData'));
    d3.select('.dimpleMapsContainer').selectAll("*").remove();
    var xOffset = 55,
        yOffset = 10;
    var svg = d3.select(".dimpleMapsContainer").append("svg").attr("height", svgHeight).attr("width", svgWidth).style("background", "");
    var svgData = getRangeForChart(xAxis, yAxis, xOffset, 60, svgHeight - 20, svgWidth, data);
    DrawSvgForValueChart(svg, svgHeight, svgWidth, xOffset, yOffset, xAxis, yAxis, svgData, flag);
    sortArrOfObjectsByParam(svgData, 'Utilization');
    var avg = (parseFloat(svgData[0]['DrugInfo']['Utilization']) + parseFloat(svgData[svgData.length - 1]['DrugInfo']['Utilization'])) / 3;
    var firstDivision = avg,
        secondDivision = avg * 2,
        thridDivision = avg * 3
        //Testing how function are working to render value chart data
    displayColorAndSizeAccordingToLength(svgData, firstDivision, secondDivision, thridDivision, flag);
    sortArrOfObjectsByParam(svgData, xAxis, false);
    /*var arr = [];
    Session.set('renderSvgPosition',arr);*/
    //hide sub population info

    // if(flag)
    //     {
    //         $('.valueChartPopulation').css('display','none');
    //     }

    //calculate distnace between each drug bubble relative to origin of graph using min and max value of X-Axis and Y-Axis
    ////Calculate distance of each point from origing of chart
    svgData = svgData.map(function(val, index) {
        // Total X-Axis width=665 and Y-Axis height=375. Find value range for X-Axis and Y-Axis for mapping like 1% =10px
        // Calculate xDistance and yDistance

        var xDistance = 665 / Math.abs(Number(val.xMax) - Number(val.xMin));
        var yDistance = 375 / Math.abs(Number(val.yMax) - Number(val.yMin));


        var x = Number(val.DrugInfo[xAxis]) - Number((xAxis === 'Cost' ? Number(val.xMax) : Number(val.xMin))),
            y = Number(val.DrugInfo[yAxis]) - Number((yAxis === 'Cost' ? Number(val.yMax) : Number(val.yMin)));
        val.distance = Math.sqrt(x * x + y * y);
        val.xDistance = xDistance;
        val.yDistance = yDistance;

        //  console.log('x'+Number((xAxis == 'Cost' ? Number(val.xMax) : Number(val.xMin))));
        //console.log('y'+ Number((yAxis == 'Cost' ? Number(val.yMax) : Number(val.yMin))));

        return val;
    });


    //Sort data by calculated distance in descending order
    svgData.sort(function(a, b) {
        return parseFloat(a.distance) > parseFloat(b.distance);
    });

    //Find origin of 2-D Chart
    var xOrigin = Number((xAxis === 'Cost' ? Number(svgData[0].xMax) : Number(svgData[0].xMin))),
        yOrigin = Number((yAxis === 'Cost' ? Number(svgData[0].yMax) : Number(svgData[0].yMin)));

    if (svgData.length > 0) {
        //console.log("Chart origin(X,Y): (" + xOrigin + "," + yOrigin + ")");
        //console.log(svgData);
    }
    //draw circles for all drug bubbles
    for (var i = 0; i < svgData.length; i++) {
        drawCircleSvg(svgData[i].x, svgData[i].y, svgData[i].DrugInfo.Size, svgData[i].DrugInfo, svg, xOffset, svgHeight - xOffset, xAxis, yAxis, svgData[i], flag, i, svgData, svgData[i].distance);
    }
    //var ids = svgData[svgData.length - 1].DrugInfo['Madication'].split(' + ').join('').split(' ').join('').split('(').join('').split(')').join('');
    //For remove non alpha numeric character from string
    var ids = svgData[svgData.length - 1].DrugInfo['Madication'].replace(/\W/g, '');
    // check if this function is not called from payer tool. if flag has some data then this is function is called from payer tool.
    if (!flag) {
        // svg.append("use")
        //     .attr("id", "useClick")
        //     .style("opacity", 0.1)
        //     .attr("xlink:href", "#" + ids + "_group");
    }
};

//function to get x,y coordinates including the min.max & median for each buble.
function getRangeForChart(xData, yData, xChartOffset, yChartOffset, canvasHeight, canvasWidth, allDrugs) {
    var chartHeight = canvasHeight - (xChartOffset + yChartOffset);
    var chartWidth = canvasWidth - (xChartOffset + yChartOffset);
    var xBoundaryValOffset = 5;
    var yBoundaryValOffset = 5;

    // arrays for the data of x-axis and y-axis
    var xDataValues = [];
    var yDataValues = [];

    // replica of the above two arrays just to find min,max & median for (x,y)
    var tempArrayX = [];
    var tempArrayY = [];

    //var allDrugs = JSON.parse(localStorage.AllDrugsData);

    for (var i = 0; i < allDrugs.length; i++) {
        // Handle NA or NaN value for Efficacy
        if (xData == 'Efficacy' && isNaN(allDrugs[i][xData])) {
            xDataValues.push(0);
            tempArrayX.push(0);
        } else {
            xDataValues.push(parseFloat(allDrugs[i][xData]));
            tempArrayX.push(parseFloat(allDrugs[i][xData]));
        }

        if (yData == 'Efficacy' && isNaN(allDrugs[i][yData])) {
            yDataValues.push(0);
            tempArrayY.push(0);
        } else {


            yDataValues.push(parseFloat(allDrugs[i][yData]));
            tempArrayY.push(parseFloat(allDrugs[i][yData]));
        }

    }

    // get median value for the data array
    var medianX = calculateMedian(tempArrayX);
    var medianY = calculateMedian(tempArrayY);

    /* var xMax = xData == 'Cost' ? tempArrayX[tempArrayX.length-1] : 100;
     var xMin = tempArrayX[0];
     var yMax = yData == 'Cost' ? tempArrayY[tempArrayY.length-1] : 100;
     var yMin = tempArrayY[0];*/
    var xMax = tempArrayX[tempArrayX.length - 1];
    var xMin = tempArrayX[0];
    var yMax = tempArrayY[tempArrayY.length - 1];
    var yMin = tempArrayY[0];

    //check for the difference of median from max & min values
    /*if ((medianX - xMin) > (xMax-medianX))
     xMax = xMax + (medianX-xMin) - (xMax-medianX);
    else
     xMin = xMin - (xMax-medianX) + (medianX-xMin);

    if ((medianY - yMin) > (yMax-medianY))
     yMax = yMax + (medianY-yMin) - (yMax-medianY);
    else
     yMin = yMin - (yMax-medianY) + (medianY-yMin);*/


    // adjust the max & min values for offset for x-axis
    if (xData === 'Cost') {
        xMax = xMax + xBoundaryValOffset;
    } else {
        xMin = xMin - xBoundaryValOffset;
        if (xMin < 0)
            xMin = 0;
        /*if(xMax >100)
                xMax =100;*/
    }

    // adjust the max & min values for offset for y-axis
    if (yData === 'Cost') {
        yMax = yMax + yBoundaryValOffset;
    } else {
        yMin = yMin - yBoundaryValOffset;
        if (yMin < 0)
            yMin = 0;
        /*if(yMax >100)
            yMax =100;*/
    }



    // compute the pixels for the chart
    var xStepPixel = (chartWidth) / (xMax - xMin);
    var yStepPixel = (chartHeight) / (yMax - yMin);

    var chartJson = [];

    // compute the (x,y) coordinates for each chart
    for (var i = 0; i < allDrugs.length; i++) {
        var data = {};
        var xPosition = 0;
        var yPosition = 0;

        // check if X axis represent cost
        if (xData === 'Cost') {
            xPosition = xStepPixel * (xMax - xDataValues[i]);
        } else {
            xPosition = xStepPixel * (xDataValues[i] - xMin);
        }

        // check if Y axis represent cost
        if (yData === 'Cost') {
            yPosition = yStepPixel * (yMax - yDataValues[i]);
        } else {
            yPosition = yStepPixel * (yDataValues[i] - yMin);
        }

        xPosition = xPosition + xChartOffset;
        yPosition = canvasHeight - (yPosition + xChartOffset);

        data['DrugInfo'] = allDrugs[i];
        data['DrugInfo']['abbr'] = getDrugAbbr(allDrugs[i]['Madication']);
        data['x'] = xPosition;
        data['y'] = yPosition;
        data['xMax'] = xMax;
        data['xMin'] = xMin;
        data['yMax'] = yMax;
        data['yMin'] = yMin;
        chartJson.push(data);
    }
    return chartJson;

}

//function to draw svg bubbles for each drug
function drawCircleSvg(bubbleLeft, bubbleTop, bubbleSize, bubbleData, svg, svgXaxis, svgYaxis, xAxis, yAxis, bubbleColor, flag, index, allData, dist) {
    var placedDrugPoint = {};
    //var ids = bubbleData['Madication'].split(' + ').join('').split(' ').join('').split('(').join('').split(')').join('');
    //For remove non alpha numeric character from string
    var ids = bubbleData['Madication'].replace(/\W/g, '');
    bubbleData['svgXaxis'] = svgXaxis;
    bubbleData['svgYaxis'] = svgYaxis;
    bubbleSize = 40;
    // Total X-Axis width=665 and Y-Axis height=375. Find value range for X-Axis and Y-Axis for mapping like 1% =10px
    // Calculate xDistance and yDistance
    var group = svg.append("g")
        .attr("id", ids + '_group')
        .attr("transform", "translate(" + parseFloat(bubbleLeft) + "," + parseFloat(bubbleTop) + ")");
    var drugGroupCircle = group.append("circle")
        .attr("class", "valueChartBubble valueChartSetUse")
        .attr("id", ids)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("fill", bubbleColor['bubbleColor'])
        .attr("r", bubbleColor['bubbleSize'])
        .style("opacity", bubbleColor['bubbleOpacity'])
        .attr("index", bubbleData.drugNameDisplayCount)
        .attr("data", JSON.stringify(bubbleData));
    //console.log('count--'+count);
    //  console.log('colorCount--'+colorCount);
    if (bubbleData.SelectedMadication === 'true') {
        drugGroupCircle.attr("stroke", "#FFE400").attr("stroke-width", "7px");
    }
    /*var arr = Session.get('renderSvgPosition'),len = arr.length;
    arr.push({'x':bubbleLeft - bubbleColor['bubbleSize'],'y':bubbleTop - bubbleColor['bubbleSize'],'w':bubbleColor['bubbleSize']*2,'h':bubbleColor['bubbleSize']*3});
    Session.set('renderSvgPosition',arr);
    console.log(arr);*/
    //  console.log("distance:" + dist);
    var xDrugLabelAxis, yDrugLabelAxis;
    //console.log("bubbleData[xAxis]:" + bubbleData[xAxis]);
    //console.log("bubbleData[yAxis]:" + bubbleData[yAxis]);
    var distanceBetweenCircle = 0;

    var arr1 = bubbleData['Madication'].split('+');
    var x, y;
    if (index === 0) {
        ////    console.log("First drugs");
        placedPosition = [];
        placedDistance = [];
        placedBubbleSize = [];
        placedDrugs = [];
        drugScoreValue = [];
        //  console.log("First Point/Circle so display Bottom");
        // placedPosition.push('top');
        // placedDistance.push(dist);
        // placedBubbleSize.push(bubbleColor['bubbleSize']);

        drugScoreValue.push(bubbleData['Madication']);
        placedPosition.push('bottom');
        placedDistance.push(dist);
        //FIXED ***
        //BOTTOM LEFT first point based on size of bubble size
        placedBubbleSize.push(bubbleColor['bubbleSize']);

        if (bubbleColor['bubbleSize'] > 20) {

            //Display Bottom when bubble size is high
            xDrugLabelAxis = 0;
            yDrugLabelAxis = (bubbleColor['bubbleSize']);
            placedDrugPoint.x = Number(bubbleData[xAxis]);
            placedDrugPoint.y = Number(bubbleData[yAxis]);
            placedDrugPoint.r = Number(bubbleColor['bubbleSize']);

            placedDrugPoint.IsIntersect = false;;
            placedDrugs.push(placedDrugPoint);
        } else {
            //Display Bottom left when bubble size is low
            xDrugLabelAxis = -(bubbleColor['bubbleSize']);
            yDrugLabelAxis = (bubbleColor['bubbleSize']) - 10;
            placedDrugPoint.x = Number(bubbleData[xAxis]);
            placedDrugPoint.y = Number(bubbleData[yAxis]);
            placedDrugPoint.r = Number(bubbleColor['bubbleSize']);
            placedDrugPoint.IsIntersect = false;;
            placedDrugs.push(placedDrugPoint);
        }
    } else {
        drugScoreValue.push(bubbleData['Madication']);

        var isCircleIntersect = false;
        //console.log("allData");
        //  console.log(allData);
        x = (Number(bubbleData[xAxis]) - placedDrugs[placedDrugs.length - 1].x);
        y = (Number(bubbleData[yAxis]) - placedDrugs[placedDrugs.length - 1].y);
        var Rmin = Math.sqrt(placedDrugs[placedDrugs.length - 1].r - bubbleColor['bubbleSize']);
        var Rmax = Math.sqrt(placedDrugs[placedDrugs.length - 1].r + bubbleColor['bubbleSize']);
        distanceBetweenCircle = Math.sqrt(x * x * bubbleColor.xDistance + y * y * bubbleColor.yDistance);
        //distanceBetweenCircle = Math.abs(placedDistance[placedDistance.length - 1] - dist);
        //console.log("Radius:" + placedDrugPoint.r);
        //  console.log("***IsIntersect:" + (distanceBetweenCircle >= Rmin && distanceBetweenCircle <= Rmax ? true : false));
        if (distanceBetweenCircle <= Rmax) {
            isCircleIntersect = true;
        }
        //console.log(index);
        //  console.log("Is Interscect:" + isCircleIntersect)
        //        console.log("Distance From last ploted point:" + (distanceBetweenCircle - Rmax));

        var diff = distanceBetweenCircle - Rmax;
        var compareScale = bubbleColor['bubbleSize'] / 5;
        //    console.log(diff);

        //If circle intersect then check circle position relative to last ploted point and also store placed point with radius
        var x1, y1, x2, y2;
        x1 = placedDrugs[placedDrugs.length - 1].x;
        y1 = placedDrugs[placedDrugs.length - 1].y;
        x2 = Number(bubbleData[xAxis]);
        y2 = Number(bubbleData[yAxis]);
        var positionX = '';
        var positionY = '';
        placedDrugPoint.x = Number(bubbleData[xAxis]);
        placedDrugPoint.y = Number(bubbleData[yAxis]);
        placedDrugPoint.r = Number(bubbleColor['bubbleSize']);
        placedDrugPoint.IsIntersect = isCircleIntersect;
        placedDrugs.push(placedDrugPoint);

        //Check the position of current point respect to previous plotted point
        if (xAxis === 'Cost' && yAxis === 'Cost') {
            //direction for postion is altered for cost
            positionX = x2 >= x1 ? "left" : "right";
            positionY = y2 >= y1 ? "bottom" : "top";
        } else if (xAxis === 'Cost') {
            //direction for postion is altered for cost X-axis
            positionX = x2 >= x1 ? "left" : "right";
            positionY = y2 >= y1 ? "top" : "bottom";
        } else if (yAxis === 'Cost') {
            //direction for postion is altered for cost X-axis
            positionX = x2 >= x1 ? "right" : "left";
            positionY = y2 >= y1 ? "bottom" : "top";
        } else {
            positionX = x2 >= x1 ? "right" : "left";
            positionY = y2 >= y1 ? "top" : "bottom";
        }


        //console.log("DIFF:" + diff);
        //  console.log(positionY + ',' + positionX);
        if (index === allData.length - 1) {
            if (isCircleIntersect && placedPosition[placedPosition.length - 1] === 'bottom') {
                //For Last drug if bubble overlaps and previous position is bottom then set position left side for last drugs
                //  console.log("last drugs but overlapped");
                placedPosition.push('left');
                placedDistance.push(dist);
                placedBubbleSize.push(bubbleColor['bubbleSize']);
                xDrugLabelAxis = -(1.5 * bubbleColor['bubbleSize']);
                yDrugLabelAxis = 0;
            } else {
                //  console.log("last drugs");
                //Always display botttom for last record
                placedPosition.push('bottom');
                placedDistance.push(dist);
                placedBubbleSize.push(bubbleColor['bubbleSize']);
                xDrugLabelAxis = 0;
                yDrugLabelAxis = (bubbleColor['bubbleSize']);
            }
        } else if (!isCircleIntersect) {
            //// console.log("Rule2: Circle not intersect so display Bottom");

            if (index > 2 && placedPosition[index - 2] === 'bottom' && diff > 0) {
                // TO improve functioanlity check distance between second last plotted circle with current circle
                // to reduce overlap for some worst case or improper order
                var hackPoint = placedDrugs[index - 2];
                var xDiff = hackPoint.x - Number(bubbleData[xAxis]);
                var yDiff = hackPoint.y - Number(bubbleData[yAxis]);

                if (xDiff <= 0 && bubbleColor['bubbleSize'] === 20) {
                    //    console.log("Patch**");
                    placedPosition.push('right');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = (2 * bubbleColor['bubbleSize']);
                    yDrugLabelAxis = 0;
                } else {
                    //IF no overlap for second last bubble then display bottom
                    placedPosition.push('bottom');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = 0;
                    yDrugLabelAxis = (bubbleColor['bubbleSize']);
                }
            } else {
                //IF no overlap for second last bubble then display bottom
                placedPosition.push('bottom');
                placedDistance.push(dist);
                placedBubbleSize.push(bubbleColor['bubbleSize']);
                xDrugLabelAxis = 0;
                yDrugLabelAxis = (bubbleColor['bubbleSize']);
            }

        } else if (isCircleIntersect) {

            if (positionY === 'top' && positionX === "right") {

                //TOP RIGHT
                //// console.log("Rule2.2: Circle intersect so display at left Position ");
                if (placedPosition[placedPosition.length - 1] === 'bottom') {
                    if (bubbleColor['bubbleSize'] > 20) {
                        placedPosition.push('left');
                        placedDistance.push(dist);
                        placedBubbleSize.push(bubbleColor['bubbleSize']);
                        xDrugLabelAxis = -(1.5 * bubbleColor['bubbleSize']);
                        yDrugLabelAxis = 0;
                    } else {
                        placedPosition.push('top');
                        placedDistance.push(dist);
                        placedBubbleSize.push(bubbleColor['bubbleSize']);
                        xDrugLabelAxis = 0;
                        //remove extra top padding for only single drugs
                        yDrugLabelAxis = -(2 * bubbleColor['bubbleSize'] + (arr1.length === 1 ? arr1.length : arr1.length * 2));
                    }

                } else if (placedPosition[placedPosition.length - 1] === 'right') {
                    //IF right side is placed then placed top of bubble
                    //NEED to improve
                    placedPosition.push('top');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = 0;
                    //remove extra top padding for only single drugs
                    yDrugLabelAxis = -(2 * bubbleColor['bubbleSize'] + (arr1.length === 1 ? arr1.length : arr1.length * 2));

                } else if (placedPosition[placedPosition.length - 1] === 'top') {
                    // //NEED to improve

                    //    console.log("##### BUBBLE SIZEL" + bubbleColor['bubbleSize']);
                    if (bubbleColor['bubbleSize'] > 20) {
                        placedPosition.push('left');
                        placedDistance.push(dist);
                        placedBubbleSize.push(bubbleColor['bubbleSize']);
                        xDrugLabelAxis = -(1.5 * bubbleColor['bubbleSize']);
                        yDrugLabelAxis = 0;
                    } else {
                        placedPosition.push('left');
                        placedDistance.push(dist);
                        placedBubbleSize.push(bubbleColor['bubbleSize']);
                        xDrugLabelAxis = -(3 * bubbleColor['bubbleSize']);
                        yDrugLabelAxis = 0;
                    }

                } else if (placedPosition[placedPosition.length - 1] === 'left') {
                    placedPosition.push('right');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = (2 * bubbleColor['bubbleSize']);
                    yDrugLabelAxis = 0;

                } else {

                    //NEED to improve
                    //// //else condition
                    ////    console.log("Rule2.3: Circle intersect so display at top Position after");

                    placedPosition.push('right');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = (2 * bubbleColor['bubbleSize']);
                    yDrugLabelAxis = 0;

                }

            } else if (positionY === 'top' && positionX === "left") {

                // TOP LEFT
                placedPosition.push('top');
                placedDistance.push(dist);
                placedBubbleSize.push(bubbleColor['bubbleSize']);
                xDrugLabelAxis = 0;
                //remove extra top padding for only single drugs
                yDrugLabelAxis = -(2 * bubbleColor['bubbleSize'] + (arr1.length === 1 ? arr1.length : arr1.length * 2));


            } else if (positionY === 'bottom' && positionX === "right") {
                //FIXED ***
                // If bubble intersect  and is right side then place label right side
                if (placedPosition[placedPosition.length - 1] === 'bottom') {
                    placedPosition.push('right');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = (2 * bubbleColor['bubbleSize']);
                    yDrugLabelAxis = 0;
                } else {

                    placedPosition.push('bottom');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = 0;
                    yDrugLabelAxis = (bubbleColor['bubbleSize']);
                }

            } else if (positionY === 'bottom' && positionX === "left") {

                //Need to improve ******
                ////   console.log("Rule2.1: Circle intersect so display at left Position after bottom");
                if (placedPosition[placedPosition.length - 1] !== 'left') {

                    placedPosition.push('left');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = -(2 * bubbleColor['bubbleSize']);
                    yDrugLabelAxis = 0;
                } else {
                    //// //else condition
                    ////  console.log("Rule2.3: Circle intersect so display at top Position");

                    placedPosition.push('top');
                    placedDistance.push(dist);
                    placedBubbleSize.push(bubbleColor['bubbleSize']);
                    xDrugLabelAxis = 0;
                    yDrugLabelAxis = -(2 * bubbleColor['bubbleSize'] + (arr1.length === 1 ? arr1.length : arr1.length * 2));
                }
            }
        }
    }

    if (arr1.length > 0) {
        var drugGroupLable = group.append("text")
            .attr("class", "drugLable drugNameDisplay" + bubbleData['drugNameDisplayCount'])
            .attr("x", xDrugLabelAxis)
            .attr("y", yDrugLabelAxis)
            .attr("height", bubbleData['Size'] * 3)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .style("opacity", 1.0);
        for (var i = 0; i < arr1.length; i++) {
            if (i === 0) {
                drugGroupLable.append('tspan')
                    .attr('x', xDrugLabelAxis)
                    .attr('dy', 8)
                    .text(arr1[i]);
            } else {
                //For array length >2 add extra x-axis padding for last drug
                drugGroupLable.append('tspan')
                    .attr('x', xDrugLabelAxis + (arr1.length > 2 && i === arr1.length - 1 ? 15 : 0))
                    .attr('dy', 10)
                    .text(arr1[i]);
            }

        }
    } else {
        group.append("text")
            .attr("x", -(bubbleColor['bubbleSize'] * 2))
            .attr("y", -bubbleColor['bubbleSize'])
            .attr("height", bubbleColor['bubbleSize'] * 3)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .style("opacity", 0.7)
            .text(bubbleData['Madication']);
    }
    // //popup is not defined reference error while score chart display from Payer Tab
    var popup = null,
        svgXaxisLine = null,
        svgYaxisLine = null,
        svgXaxisLineText = null,
        svgYaxisLineText = null;

    // ************ need to comment the code TO BE DONE ***************
    //console.log("****** temp1 ******");
    d3.selectAll("circle.valueChartBubble").on("mouseover", function(e) {
        var temp1 = $('#' + $(this).attr('id') + '_group').attr('transform').split('translate(').join('').split(')').join('');
        // let isIE = /*@cc_on!@*/false || !!document.documentMode;
        // let temp = isIE?temp1.split(' '):temp1.split(',');
        // Relative Value chart browser compatibility solution
      //  console.log(temp1);
        let isIE = detectIE();
        let temp = isIE === false ? temp1.split(',') : temp1.split(' ');
        var tempData = JSON.parse($(this).attr('data'));

        mouseOverHandler(temp, tempData, e);
    });
    d3.selectAll("text.drugLable").on("mouseover", function(e) {
        var self = $(this).siblings('circle.valueChartBubble');
        var temp1 = $('#' + $(self).attr('id') + '_group').attr('transform').split('translate(').join('').split(')').join('');
        // let isIE = /*@cc_on!@*/false || !!document.documentMode;
        // let temp = isIE?temp1.split(' '):temp1.split(',');
        // Relative Value chart browser compatibility solution
        let isIE = detectIE();
        let temp = isIE === false ? temp1.split(',') : temp1.split(' ');

        var tempData = JSON.parse($(self).attr('data'));
        mouseOverHandler(temp, tempData, e);
    });
    if (!flag) {
        // d3.selectAll("circle.valueChartSetUse").on("click", function(e) {
        //     d3.selectAll(".popupOnValueChartParentWindow").remove();
        //     clickHandlerOut(this);
        //     clickHandlerOver(this);
        // });
    }
    //d3.selectAll("circle.valueChartSetUse").on("mouseout", function(e) {
    //
    //});
    d3.selectAll("circle.valueChartBubble").on("mouseout", function(e) {
        //d3.selectAll(".popupOnValueChartParentWindow").remove();
        if (popup !== null) {
            popup.remove();
        }
        if (svgXaxisLine !== null) {
            svgXaxisLine.remove();
        }
        if (svgYaxisLine !== null) {
            svgYaxisLine.remove();
        }
        if (svgXaxisLineText !== null) {
            svgXaxisLineText.remove();
        }
        if (svgYaxisLineText !== null) {
            svgYaxisLineText.remove();
        }
        //Change position of method execution
        d3.selectAll(".popupOnValueChartParentWindow").remove();
    });
    d3.selectAll("text.drugLable").on("mouseout", function(e) {
        //d3.selectAll(".popupOnValueChartParentWindow").remove();
        if (popup !== null) {
            popup.remove();
        }
        if (svgXaxisLine !== null) {
            svgXaxisLine.remove();
        }
        if (svgYaxisLine !== null) {
            svgYaxisLine.remove();
        }
        if (svgXaxisLineText !== null) {
            svgXaxisLineText.remove();
        }
        if (svgYaxisLineText !== null) {
            svgYaxisLineText.remove();
        }
        //Change position of method execution
        d3.selectAll(".popupOnValueChartParentWindow").remove();
    });

    function clickHandlerOver(evt) {
        var newtarget = evt;
        var topmost = document.getElementById("useClick");
        var allDrugs = d3.selectAll('.valueChartSetUse')[0];
        for (var i = 0; i < allDrugs.length; i++) {
            var drug = $(allDrugs[i]);
            if (drug.attr('id') === newtarget.id) {
                drug.attr('stroke', '#FFE400');
                drug.attr('stroke-width', '7px');
            } else {
                drug.attr('stroke', 'none');
                drug.attr('stroke-width', '0px');
            }

        }
        topmost.setAttributeNS("http://www.w3.org/1999/xlink",
            "xlink:href",
            "#" + newtarget.id + "_group");
    };

    function clickHandlerOut(evt) {
        var newtarget = evt;
        var topmost = document.getElementById("useClick");
        topmost.setAttributeNS("http://www.w3.org/1999/xlink",
            "xlink:href",
            "");
    };

    function mouseOverHandler(temp, tempData, e) {
        //console.log(tempData);
        var HeaderHieght = 15;
        var arr1 = tempData.Madication.split('+');
        var cx = parseFloat(temp[0]),
            cy = parseFloat(temp[1]),
            width = 160,
            height = 193 + (HeaderHieght + ((arr1.length - 1) * 15)),
            r = 7,
            x = (cx + r + width + 10 < svg.attr("width") ?
                cx + r + 20 :
                cx - r - width - 40),
            y = (cy - height / 2 < 0 ?
                10 :
                cy - height / 2);
        let position_tooltip = y < (height / 2) ? 5 : 30;
        popup = svg.append("g").attr("class", "popupOnValueChartParentWindow");
        popup.append("rect")
            .attr("x", x + 5)
            .attr("y", y - position_tooltip)
            .attr("width", width)
            .attr("height", height)
            .style("fill", "#000000")
            .style("stroke", "#cccccc")
            .style("stroke-width", 1)
            .style("opacity", 0.8)
            .style("z-index", 9999999)
            .attr("rx", 8)
            .attr("ry", 8);
        // Add % & K for axis label on hover
        var hoverXLabel = xAxis == 'Cost' ? Math.round(tempData[xAxis]) + "K" : Math.round(tempData[xAxis]) + "%";
        var hoverYLabel = yAxis == 'Cost' ? Math.round(tempData[yAxis]) + "K" : Math.round(tempData[yAxis]) + "%";
        // Add Drug name
        if (arr1.length > 0) {
            var popupHeader = popup.append("text")
                .attr("class", "drugNameDisplay" + bubbleData['drugNameDisplayCount'])
                .attr("x", x + 30)
                .attr("y", y - position_tooltip + 15)
                //    .attr("height", bubbleData['Size'] * 3)
                .style("text-anchor", "middle")
                .style("font-size", "13px")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .style("fill", "#4BB4F5")
                .style("opacity", 1.0);
            for (var i = 0; i < arr1.length; i++) {
                if (i === 0) {
                    popupHeader.append('tspan')
                        .attr('x', x + 80)
                        .attr('dy', 3)
                        .text(arr1[i]);
                    HeaderHieght = HeaderHieght + 7;
                } else {
                    popupHeader.append('tspan')
                        .attr('x', x + 80)
                        .attr('dy', 14)
                        .text(arr1[i]);
                    HeaderHieght = HeaderHieght + 15;
                }

            }
        } else {
            var popupHeader = popup.append("text")
                .attr("x", x + 30)
                .attr("y", y + 6 - position_tooltip % 4 + 5)
                //    .attr("height", bubbleData['Size'] * 3)
                .style("text-anchor", "middle")
                .style("font-size", "13px")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .style("fill", "#4BB4F5")
                .style("opacity", 0.7)
                .text(tempData.Madication);
            HeaderHieght = HeaderHieght + 7;
        }


        var underLine = popup.append("line")
            .attr("x1", x + 7)
            .attr("x2", x + 3 + width)
            .attr("y1", y + HeaderHieght - position_tooltip + 10)
            .attr('y2', y + HeaderHieght - position_tooltip + 10)
            .attr('stroke', '#999999')
            .attr('stroke-width', '1');

        // Add the series value text
        var x1 = x + 20,
            y1 = y + HeaderHieght + 15;
        drawArcForPopup(popup, 15, x1 + 20, y1 - position_tooltip + 13, Math.round(tempData.Adherence), 'Adherence')
        popup.append('text')
            .attr('x', x1 + +50)
            .attr('y', y1 - position_tooltip + 13)
            .style("font-weight", "500")
            .style("fill", "#F1AC0A")
            .text(" Adherence");
        y1 = y1 + 35;
        drawArcForPopup(popup, 15, x1 + 20, y1 - position_tooltip + 13, Math.round(tempData.Efficacy), 'Efficacy');
        popup.append('text')
            .attr('x', x1 + 50)
            .attr('y', y1 - position_tooltip + 13)
            .style("font-weight", "500")
            .style("fill", "#F1AC0A")
            .text(" Efficacy");
        y1 = y1 + 35;
        drawArcForPopup(popup, 15, x1 + 20, y1 - position_tooltip + 13, Math.round(tempData.Utilization), 'Utilization')
        popup.append('text')
            .attr('x', x1 + 50)
            .attr('y', y1 - position_tooltip + 13)
            .style("font-weight", "500")
            .style("fill", "#F1AC0A")
            .text(" Utilization");
        y1 = y1 + 35;
        popup.append("line")
            .attr("x1", x1 - 5)
            .attr("x2", (x1 - 25) + width)
            .attr("y1", y1 - position_tooltip + 5)
            .attr('y2', y1 - position_tooltip + 5)
            .attr('stroke', '#999999')
            .attr('stroke-width', '1');
        y1 = y1 + 50;
        popup.append('text')
            .attr('x', x1 + 30)
            .attr('y', y1 - 27 - position_tooltip + 5)
            .style("text-anchor", "middle")
            .style("font-weight", "500")
            .style("fill", "#F1AC0A")
            .text("N");
        popup.append('text')
            .attr('x', x1 + 100)
            .attr('y', y1 - 27 - position_tooltip + 5)
            .style("text-anchor", "middle")
            .style("font-weight", "500")
            .style("fill", "#F1AC0A")
            .text("Cost");
        // popup.append('path')
        //     .attr('id', 'arc1')
        //     .attr('fill', 'none')
        //     .attr('stroke', '#608033')
        //     .attr('stroke-width', '34');
        // popup.append('path')
        //     .attr('id', 'arc2')
        //     .attr('fill', 'none')
        //     .attr('stroke', '#0076A3')
        //     .attr('stroke-width', '34');
        //.text(" N");*/
        // document.getElementById("arc1").setAttribute("d", describeArc(x1 + 30, y1 + 10, 17, 0, 180));
        // document.getElementById("arc2").setAttribute("d", describeArc(x1 + 100, y1 + 10, 17, 0, 180));
        popup.append('text')
            .attr('x', x1 + 30)
            .attr('y', y1 - 2 - position_tooltip + 10)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            //.style("font-weight", "300")
            .style("fill", "#fff")
            .text(parseInt(tempData.Size) + " / " + tempData.TotalN);
        popup.append('text')
            .attr('x', x1 + 100)
            .attr('y', y1 - 2 - position_tooltip + 10)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            //.style("font-weight", "300")
            .style("fill", "#fff")
            .text('$' + Math.round(tempData.Cost) + 'K');

        svgXaxisLine = svg.append("line")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x1", cx)
            .attr("x2", tempData['svgXaxis'])
            .attr("y1", cy)
            .attr('y2', cy)
            .attr('stroke', 'gray')
            .attr('stroke-width', '2')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '1, 5');
        svgYaxisLine = svg.append("line")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x1", cx)
            .attr("x2", cx)
            .attr("y1", cy)
            .attr('y2', tempData['svgYaxis'])
            .attr('stroke', 'gray')
            .attr('stroke-width', '2')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '1, 5');
        svgXaxisLineText = svg.append("text")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x", tempData['svgXaxis'] + 10)
            .attr("y", cy + 15)
            .text(hoverYLabel)
            .style("font-family", "sans-serif")
            .style("font-size", 12)
            .style("font-weight", "bold")
            .attr("fill", "#800000");
        svgYaxisLineText = svg.append("text")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x", cx + 5)
            .attr("y", tempData['svgYaxis'] - 10)
            .text(hoverXLabel)
            .style("font-family", "sans-serif")
            .style("font-size", 12)
            .style("font-weight", "bold")
            .attr("fill", "#800000");

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;

            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        }

        function describeArc(x, y, radius, startAngle, endAngle) {

            var start = polarToCartesian(x, y, radius, endAngle);
            var end = polarToCartesian(x, y, radius, startAngle);

            var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

            var d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, arcSweep, 0, end.x, end.y
            ].join(" ");

            return d;
        }

        function drawArcForPopup(popup, radiusArc, x2, y2, value, classCss) {
            var twoPi = 2 * Math.PI,
                progress = 0,
                total = 100, // must be hard-coded if server doesn't report Content-Length
                formatPercent = d3.format(".0%");
            var adherenceMeter = popup.append("g")
                .attr("class", "popupInnerArc")
                .attr("transform", "translate(" + x2 + "," + y2 + ")");
            var adherenceArc = d3.svg.arc()
                .startAngle(0)
                .innerRadius(radiusArc - 2)
                .outerRadius(radiusArc);
            adherenceMeter.append("path")
                .attr("class", "background")
                .attr("d", adherenceArc.endAngle(twoPi));
            var adherenceValue = twoPi / (100 / value);
            var adherence = adherenceMeter.append("path")
                .attr("class", classCss)
                .style("opacity", 1)
                //.attr("transform", "rotate(135)")
                .attr("d", adherenceArc.endAngle(adherenceValue));
            adherenceMeter.append('text')
                .attr('x', 0)
                .attr('y', 5)
                .style("text-anchor", "middle")
                .style("font-size", "10px")
                .style("font-family", "sans-serif")
                //.style("font-weight", "300")
                .style("fill", "#fff")
                .text(value + "%");
        }
    }

    function mouseOutHandler() {

    }
}



function DrawSvgForValueChart(svg, height, width, xOffset, yOffset, xAxisLable, yAxisLable, svgData, flag) {
    var yTopLableHL = '',
        yBottomLableHL = '',
        xTopLableHL = '',
        xBottomLableHL = '',
        xAxisDisplayText = '',
        yAxisDisplayText = '';
    var xplotting = 10,
        yplotting = 10;
    if (xAxisLable === 'Cost') {
        xTopLableHL = Math.round(svgData[0]['xMax']) + 'K';
        xBottomLableHL = Math.round(svgData[0]['xMin']) + 'K';
        xplotting = 6;
        xAxisDisplayText = flag ? '' : ' (For Patients Like ' + Router['PatientId'] + ')';
    } else {
        xTopLableHL = Math.round(svgData[0]['xMin']) + '%';
        xBottomLableHL = Math.round(svgData[0]['xMax']) + '%';
        if ((Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin'])) <= 10) {
            xplotting = (Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin']));
        } else if ((Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin'])) >= 11 && (Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin'])) <= 20) {
            xplotting = Math.round((Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin'])) / 2);
        }
        if (flag) {
            xAxisDisplayText = '';
        } else {
            xAxisDisplayText = ' (For Patients Like ' + Router['PatientId'] + ')';
        }
    }
    if (yAxisLable === 'Cost') {
        yTopLableHL = Math.round(svgData[0]['yMin']) + 'K';
        yBottomLableHL = Math.round(svgData[0]['yMax']) + 'K';
        yplotting = 6;
        yAxisDisplayText = flag ? '' : ' (For Patients Like ' + Router['PatientId'] + ')';
    } else {
        yTopLableHL = Math.round(svgData[0]['yMax']) + '%';
        yBottomLableHL = Math.round(svgData[0]['yMin']) + '%';
        if ((Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin'])) <= 10) {
            yplotting = (Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin']));
        } else if ((Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin'])) >= 11 && (Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin'])) <= 20) {
            yplotting = Math.round((Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin'])) / 2);
        }
        if (flag) {
            yAxisDisplayText = '';
        } else {
            yAxisDisplayText = ' (For Patients Like ' + Router['PatientId'] + ')';
        }
    }
    var yTopLable = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "65px")
        .attr("dx", "25px")
        .text(yTopLableHL);
    var yBottomLable = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 55) + "px")
        .attr("dx", "25px")
        .text(yBottomLableHL);
    var xTopLable = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 30) + "px")
        .attr("dx", "60px")
        .text(xTopLableHL);
    var xBottomLable = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 30) + "px")
        .attr("dx", (width - 65) + "px")
        .text(xBottomLableHL);
    var yAxis = svg.append("line")
        .attr("x1", xOffset)
        .attr("x2", xOffset)
        .attr("y1", yOffset)
        .attr('y2', height - xOffset)
        .attr('stroke', 'black')
        .attr('stroke-width', '2');
    var xAxis = svg.append("line")
        .attr("x1", xOffset)
        .attr("x2", width - yOffset)
        .attr("y1", height - xOffset)
        .attr('y2', height - xOffset)
        .attr('stroke', 'black')
        .attr('stroke-width', '2');
    var xslab = width / 4,
        yslab = height / 4;

    var xAxisLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 30) + "px")
        .attr("dx", (xslab * 2) + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .attr("fill", "#000000")
        .text('Rx ' + xAxisLable + xAxisDisplayText);
    var yAxisLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "30px")
        .attr("dx", "-" + ((height - 60) / 2) + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px")
        .attr("font-weight", "bold")
        .attr("fill", "#000000")
        .attr("transform", "rotate(-90)")
        .text('Rx ' + yAxisLable + yAxisDisplayText);
    var plotMargin = 60;
    svg.append("line")
        .attr("x1", width - plotMargin)
        .attr("x2", width - plotMargin)
        .attr("y1", height - xOffset)
        .attr('y2', (height - xOffset) + 10)
        .attr('stroke', 'black')
        .attr('stroke-width', '2');
    svg.append("line")
        .attr("x1", xOffset)
        .attr("x2", xOffset - 10)
        .attr("y1", plotMargin)
        .attr('y2', plotMargin)
        .attr('stroke', 'black')
        .attr('stroke-width', '2');

    var plotxslab = (((width - xOffset) - yOffset) - plotMargin) / xplotting,
        plotyslab = (((height - xOffset) - yOffset) - plotMargin) / yplotting;
    for (var i = 1; i < xplotting; i++) {
        svg.append("line")
            .attr("x1", width - (plotxslab * i) - plotMargin)
            .attr("x2", width - (plotxslab * i) - plotMargin)
            .attr("y1", height - xOffset)
            .attr('y2', (height - xOffset) + 10)
            .attr('stroke', 'black')
            .attr('stroke-width', '2');
    }
    for (var i = 1; i < yplotting; i++) {
        svg.append("line")
            .attr("x1", xOffset)
            .attr("x2", xOffset - 10)
            .attr("y1", height - (plotyslab * i) - plotMargin)
            .attr('y2', height - (plotyslab * i) - plotMargin)
            .attr('stroke', 'black')
            .attr('stroke-width', '2');
    }
}



// Helper methods for Drugs template
Template.RWEBenchmark.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    },
    'pureCSSRingCircle': function(pScore) {

        return `p${parseInt(pScore)}`;
    },

    //new Dynamic json structure for drugs

    'DrugInfoUpdated': function() {
        try {
            var DrugsData = drugsData;

            // Calculating Max Cost
            DrugsData.sort(function(a, b) {
                return parseFloat(b.Cost.TotalCost) - parseFloat(a.Cost.TotalCost);
            });


            // var PreferredDrugs = DrugsData.filter(function(drug) {
            //     if (drug.IsInsured.toLowerCase() === 'yes') {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // });

            // var NotPreferredDrugs = DrugsData.filter(function(drug) {
            //     if (drug.IsInsured.toLowerCase() === 'no') {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // });

            //            console.log(DrugsData);

            // PreferredDrugs will be drugs where All the values like Efficacy, Cost are available
            var PreferredDrugs = DrugsData.filter(function(drug) {
                if (parseInt(drug.paid_median_cost) != 0 && drug.Efficacy.Efficacy != 'NA' && parseInt(drug.Efficacy.Efficacy) != 0) {
                    return true;
                } else {
                    return false;
                }
            });

            // NotPreferredDrugs will be drugs where any of the values like Efficacy, Cost is missing.
            var NotPreferredDrugs = DrugsData.filter(function(drug) {
                if (parseInt(drug.paid_median_cost) == 0 || drug.Efficacy.Efficacy == 'NA' || parseInt(drug.Efficacy.Efficacy) == 0) {
                    return true;
                } else {
                    return false;
                }
            });

            var SortingColumn = localStorage.getItem('SortDrugsBy');
            var SortingType = localStorage.getItem('SortingType');

            // Sort high to low
            //Change condition for non empty using falsy/truthy check
            // if (SortingColumn != '') {
            if (SortingColumn) {
                if (SortingColumn === "efficacy") {
                    PreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.Efficacy.Efficacy) - parseFloat(a.Efficacy.Efficacy);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.Efficacy.Efficacy) - parseFloat(b.Efficacy.Efficacy);
                        }
                    });


                    // There will be No NonPreferred Drugs as we have commented that part
                    NotPreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.Efficacy.Efficacy) - parseFloat(a.Efficacy.Efficacy);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.Efficacy.Efficacy) - parseFloat(b.Efficacy.Efficacy);
                        }
                    });
                } else if (SortingColumn === "adherence") {
                    PreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.Adherence.Adherence) - parseFloat(a.Adherence.Adherence);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.Adherence.Adherence) - parseFloat(b.Adherence.Adherence);
                        }
                    });
                    NotPreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.Adherence.Adherence) - parseFloat(a.Adherence.Adherence);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.Adherence.Adherence) - parseFloat(b.Adherence.Adherence);
                        }
                    });
                } else if (SortingColumn === "utilization") {
                    PreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.Utilization.Utilization) - parseFloat(a.Utilization.Utilization);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.Utilization.Utilization) - parseFloat(b.Utilization.Utilization);
                        }
                    });
                    NotPreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.Utilization.Utilization) - parseFloat(a.Utilization.Utilization);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.Utilization.Utilization) - parseFloat(b.Utilization.Utilization);
                        }
                    });
                } else if (SortingColumn === "confidenceindex") {
                    PreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.ConfidenceIndex) - parseFloat(a.ConfidenceIndex);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.ConfidenceIndex) - parseFloat(b.ConfidenceIndex);
                        }
                    });
                    NotPreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.ConfidenceIndex) - parseFloat(a.ConfidenceIndex);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.ConfidenceIndex) - parseFloat(b.ConfidenceIndex);
                        }
                    });
                } else if (SortingColumn === "cost") {
                    PreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.Cost.TotalCost) - parseFloat(a.Cost.TotalCost);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.Cost.TotalCost) - parseFloat(b.Cost.TotalCost);
                        }
                    });
                    NotPreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.Cost.TotalCost) - parseFloat(a.Cost.TotalCost);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.Cost.TotalCost) - parseFloat(b.Cost.TotalCost);
                        }
                    });
                } else if (SortingColumn === "value") {
                    PreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.relativeValueScore) - parseFloat(a.relativeValueScore);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.relativeValueScore) - parseFloat(b.relativeValueScore);
                        }
                    });
                    NotPreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.relativeValueScore) - parseFloat(a.relativeValueScore);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.relativeValueScore) - parseFloat(b.relativeValueScore);
                        }
                    });
                        } else if (SortingColumn === "drugScore") {
                    PreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.drugScore) - parseFloat(a.drugScore);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.drugScore) - parseFloat(b.drugScore);
                        }
                    });
                    NotPreferredDrugs.sort(function(a, b) {
                        if (SortingType === 'desc') {
                            return parseFloat(b.drugScore) - parseFloat(a.drugScore);
                        } else if (SortingType === 'asce') {
                            return parseFloat(a.drugScore) - parseFloat(b.drugScore);
                        }
                    });
                }
            } else {

                // Sorting by Relative Value in descending order
                PreferredDrugs.sort(function(a, b) {
                    return parseFloat(b.relativeValueScore) - parseFloat(a.relativeValueScore);
                });
                NotPreferredDrugs.sort(function(a, b) {
                    return parseFloat(b.relativeValueScore) - parseFloat(a.relativeValueScore);
                });
                localStorage.setItem('SortDrugsBy', 'drugScore');
                localStorage.setItem('SortingType', 'desc');
            }

            // Meargin Both Prefered and NotPrefered
            DrugsData = PreferredDrugs.concat(NotPreferredDrugs);
            //AllDrugsName = [];
            if (DrugsData.length > 0) {
                for (var i = 0; i < DrugsData.length; i++) {
                    //  DrugsData[i]['DrugsData'] = JSON.stringify(DrugsData);
                    //provide a sequence to drug for display order
                    DrugsData[i]['DrugSequence'] = (i + 1);
                    // AllDrugsName.push(DrugsData[i]['DrugName']);
                }
            }

            // Store all drugs data after sorting as well as Drugs Name in local

            //Router.AllDrugsData = JSON.stringify(DrugsData);
            var patientCounts = DrugsData.length > 0 ? DrugsData[0].TotalN : 0;
            //console.log(patientCounts);
            localStorage.totalSubPopulation = patientCounts;
            // 						$('#patientCount').text(patientCounts);
            // console.log($('#patientCount').text());
            localStorage.AllDrugsData = JSON.stringify(DrugsData);
            //localStorage.AllDrugsName = JSON.stringify(AllDrugsName);
            //// Create new localStoarge object or variable for geo data
            ////Commented geo data code as currently functionality not used in application
            ////localStorage.AllGeoData = JSON.stringify(geoContainer);

            var me = this;
            setTimeout(function() {
                executeAtRender(myThis);
                $('.machineLearn-totalPatients').html(commaSeperatedNumber(drugsData[0].TotalN || 0));
            }, 100);

            return DrugsData;
        } catch (e) {
            //console.log(e);
        }

    },
    'isProgressive': function() {
        var me = this.Patientdata;
        if (me == undefined) {
            var PatientID = Router['PatientId'];
            me = PatientDataList.filter(function(Patient) {
                return Patient.PatientID == PatientID;
            });
        }

        var dbApri = me[0].APRI;
        var apri = ((parseInt(me[0].labs_ast) / 40) / parseInt(me[0].labs_platelets)) * 100;
        if (dbApri != null && dbApri != '') {
            if (dbApri > 1) {
                ShowAPRIWarrning = true;
                return true;
            }
        } else if (apri > 1) {
            ShowAPRIWarrning = true;
            return true;
        } else {
            return false;
        }


    },
    'isDrugInfoUpdatedEmpty': function() {
        $('.machineLearn-totalPatients').html(commaSeperatedNumber(drugsData[0].TotalN || 0));
        if (drugsData.length > 0)
            return true;
        else
            return false;

    },
    // method to display color for drugs accordingly
    'isDrugInsured': function(pValue) {

        if (pValue && pValue.toLowerCase() === 'yes')
            return ' ';
        else
            return 'uninsured-drugs';
    },

    // method to display color for drugs accordingly
    'isDrugPreferredIcon': function(pValue) {
        if (pValue && pValue.toLowerCase() === 'yes')
            return 'p.png';
        else
            return 'np.png';
    },

    'GenerateCostImage': function(pCost) {
        var cost = !isNaN(parseInt(pCost)) && $.isNumeric(pCost) ? parseInt(pCost) : 0;
        var costImage = '';
        if (cost <= 57000) {
            costImage = '$.png';
        } else if (cost > 57000 && cost <= 90000) {
            costImage = '$$.png';
        } else if (cost > 90000 && cost <= 150000) {
            costImage = '$$$.png';
        } else {
            costImage = '$$$.png';
        }
        return costImage;
    },



    'isDrugPreferred': function(pValue) {
        if (pValue && pValue.toLowerCase() === 'yes')
            return 'Preferred';
        else
            return 'Not Preferred';
    },
    'Paging': function(pValue) {
        let pValueTotal = JSON.parse(localStorage.AllDrugsData).length;
        let page_number = pValue / showPages;
        if (pValue % showPages == 0) {
            page_number = pValue / showPages;
        } else {
            page_number = pValue / showPages;
            page_number = parseInt(page_number) + 1;
        }

        if (pValue && parseInt(pValue) <= pValueTotal) {
            return 'page' + page_number;
        } else {
            //return 'page1';
        }
    },

    'isHavePaging': function(pValue) {
        if (pValue && parseInt(pValue) > showPages) {
            return true;
        } else {
            return false;
        }
    },
    'isPageFirst': function(pValue) {
        if (pValue == 1) {
            return true;
        } else {
            return false;
        }

    },
    'PaginationPages': function() {
        let pValue = JSON.parse(localStorage.AllDrugsData).length;
        let pages = [];
        let page_numbers = pValue / showPages;
        if (pValue % showPages == 0) {
            page_numbers = pValue / showPages;
        } else {
            page_numbers = pValue / showPages;
            page_numbers = parseInt(page_numbers) + 1;
        }

        for (let i = 1; i <= parseInt(page_numbers); i++) {
            pages.push({
                'pageno': i
            });
        }
        return pages;
    },

    'generateDrugSafetyUrl': function(pValue) {
        if (pValue && parseInt(pValue) === 1) {
            return '/Safety';
        } else if (pValue && parseInt(pValue) === 2) {
            return '/SafetySovaldi';
        } else {
            return '#';
        }
    },

    'isMedicationInfoAvailable': function(pValue) {
        if (pValue == "" || pValue == null) {
            return false;
        } else {
            return true;
        }
    },

    'shouldShowFlag': function(pValue) {
        if (pValue == true) {
            return true;
        } else {
            return false;
        }
    },
    // method to render the HR/LR count on the risk capsules.
    'renderRiskData': function(drugName, safetyPercent) {
        var DrugRiskData = drugRiskData;
        return Blaze._globalHelpers.renderDrugsRiskData(drugName, safetyPercent, DrugRiskData);
    },

    'getGaugeValue': function(tValue) {
        var deg = 0;
        var value = tValue;
        deg = (value * 177.5) / 100;
        return deg;
    },

    'whichQuadrant': function(Efficacy, Cost) {
        var cost = Cost / 1000;
        var quadrand = getQuadrantForDrug(Efficacy, cost);
        switch (quadrand) {
            case "A":
                //return "quadrantA.png"
                return "OptimalPos_1.png";
                break;
            case "B":
                //return "quadrantB.png"
                return "OptimalPos_2.png";
                break;
            case "C":
                //return "quadrantC.png";
                return "OptimalPos_3.png";
                break;
            case "D":
                //return "quadrantD.png"
                return "OptimalPos_4.png";
                break;
            default:
                //  console.log("No condition matched for quadrant");

        }
    },
    isFemale: function() {
        let gender = $("#Gender").val();
        if (gender && gender.toLowerCase() === 'female')
            return 'block';
        else return 'none'
    },
    'isPregnancyPresent': function(pValue) {
        if (pValue == "Pregnancy") {
            return true;
        } else {
            return false;
        }
    },

    'isRenalFailurePresent': function(pValue) {
        if (pValue == "Renal Failure") {
            return true;
        } else {
            return false;
        }
    },

    'isMentalHealthPresent': function(pValue) {
        if (pValue == "Mental Health") {
            return true;
        } else {
            return false;
        }
    },

    'isHIVPresent': function(pValue) {
        if (pValue == "HIV") {
            return true;
        } else {
            return false;
        }
    },

    'isAlcoholPresent': function(pValue) {
        if (pValue == "Alcohol") {
            return true;
        } else {
            return false;
        }
    },
    'getPopulationData': function() {
        var PopulationData = {};
        // var Patientdata = PatientDataList.filter(function(Patient) {
        //     return Patient.PATIENT_ID_SYNTH == Router['PatientId'];
        // });
        // PopulationData['PopulationData_Genotype'] = Patientdata[0]['GENOTYPE'];
        // PopulationData['PopulationData_ViralLoad'] = Patientdata[0]['ViralLoad'];
        // PopulationData['PopulationData_Treatment'] = Patientdata[0]['Treatment'] === 'Yes' ? 'Naive ' : 'Experienced';
        // PopulationData['PopulationData_Gender'] = Patientdata[0]['Gender'];
        // PopulationData['PopulationData_LiverBiopsy'] = Patientdata[0]['LiverBiopsy'];
        // PopulationData['PopulationData_RenalFailure'] = Patientdata[0]['RenalFailure'];
        // PopulationData['PopulationData_Cirrhosis'] = Patientdata[0]['CIRRHOSIS'];
        // PopulationData['PopulationData_Ethnicity'] = Patientdata[0]['Ethnicity'];

        // Modified By Yuvraj;

        // var Patientdata = Session.get("selectedPatientData");
        // PopulationData['PopulationData_Genotype'] = Patientdata[0]['GENOTYPE'];
        // PopulationData['PopulationData_ViralLoad'] = Patientdata[0]['VIRAL_LOAD'];
        // PopulationData['PopulationData_Treatment'] = Patientdata[0]['TREATMENT'];
        // PopulationData['PopulationData_Gender'] = Patientdata[0]['GENDER_CD'] ==='F' ? 'Female' : 'Male';
        // PopulationData['PopulationData_LiverBiopsy'] = Patientdata[0]['LIVER_BIOPSY'];
        // PopulationData['PopulationData_RenalFailure'] = Patientdata[0]['RenalFailure'];
        // PopulationData['PopulationData_Cirrhosis'] = Patientdata[0]['CIRRHOSIS'];
        // PopulationData['PopulationData_Ethnicity'] = Patientdata[0]['ETHNITY_1_DESC'];

        // var Patientdata = Pinscriptive['Filters'];
        // PopulationData['PopulationData_Genotype'] = Patientdata['genotypes'] === null ? '' : Patientdata['genotypes'].replace(/'/g, '');
        // PopulationData['PopulationData_ViralLoad'] = Patientdata['viralLoad'] === null ? '' : Patientdata['viralLoad'];
        // PopulationData['PopulationData_Treatment'] = Patientdata['treatment'] === null ? 'ALL' : Patientdata['treatment'].replace(/'/g, '');
        // // PopulationData['PopulationData_Gender'] = Patientdata['GENDER_CD'] ==='F' ? 'Female' : 'Male';
        // PopulationData['PopulationData_LiverBiopsy'] = Patientdata['liverBiopsy'] === null ? '' : Patientdata['liverBiopsy'].replace(/'/g, '');
        // PopulationData['PopulationData_RenalFailure'] = Patientdata['renal_failure'] === null ? '' : Patientdata['renal_failure'].replace(/'/g, '');
        // PopulationData['PopulationData_Cirrhosis'] = Patientdata['cirrhosis'] === null ? 'ALL' : Patientdata['cirrhosis'].replace(/'/g, '');
        // PopulationData['PopulationData_Ethnicity'] = Patientdata['ethnicity'] === null ? '' : Patientdata['ethnicity'].replace(/'/g, '');


        // PopulationData['PopulationData_age'] = Patientdata['age'] === null ? '' : Patientdata['age'].replace(/'/g, '');
        // PopulationData['PopulationData_alcohol'] = Patientdata['alcohol'] === null ? '' : Patientdata['alcohol'].replace(/'/g, '');
        // PopulationData['PopulationData_apri'] = Patientdata['apri'] === null ? '' : Patientdata['apri'];
        // PopulationData['PopulationData_chemistry'] = Patientdata['chemistry'] === null ? '' : Patientdata['chemistry'];
        // PopulationData['PopulationData_etoh'] = Patientdata['etoh'] === null ? '' : Patientdata['etoh'].replace(/'/g, '');
        // PopulationData['PopulationData_fibroscan'] = Patientdata['fibroscan'] === null ? '' : Patientdata['fibroscan'];
        // PopulationData['PopulationData_fibrosure'] = Patientdata['fibrosure'] === null ? '' : Patientdata['fibrosure'];
        // PopulationData['PopulationData_hcc'] = Patientdata['hcc'] === null ? '' : Patientdata['hcc'];
        // PopulationData['PopulationData_hiv'] = Patientdata['hiv'] === null ? '' : Patientdata['hiv'];
        // PopulationData['PopulationData_liverBiopsy'] = Patientdata['liverBiopsy'] === null ? '' : Patientdata['liverBiopsy'];
        // PopulationData['PopulationData_liver_assesment'] = Patientdata['liver_assesment'] === null ? '' : Patientdata['liver_assesment'];
        // PopulationData['PopulationData_meld'] = Patientdata['meld'] === null ? '' : Patientdata['meld'];
        // PopulationData['PopulationData_mental_health'] = Patientdata['mental_health'] === null ? '' : Patientdata['mental_health'];

        // PopulationData['PopulationData_patientCount'] = Patientdata['patientCount'] === null ? '' : Patientdata['patientCount'];
        // PopulationData['PopulationData_renal_failure'] = Patientdata['renal_failure'] === null ? '' : Patientdata['renal_failure'];
        // PopulationData['PopulationData_rowNo'] = Patientdata['rowNo'] === null ? '' : Patientdata['rowNo'];
        // PopulationData['PopulationData_treatment'] = Patientdata['treatment'] === null ? '' : Patientdata['treatment'];
        // PopulationData['PopulationData_viralLoad'] = Patientdata['viralLoad'] === null ? '' : Patientdata['viralLoad'];
        // PopulationData['PopulationData_weight'] = Patientdata['weight'] === null ? '' : Patientdata['weight'];


        return PopulationData;
    },
    'displaySortingImg': function(column) {

        if (localStorage.getItem('SortDrugsBy') == column) {
            return 'block';
        } else if (localStorage.getItem('SortDrugsBy') == '' || localStorage.getItem('SortDrugsBy') == null) {
            //    localStorage.setItem('SortDrugsBy', 'efficacy');
            localStorage.setItem('SortDrugsBy', 'drugScore');
            localStorage.setItem('SortingType', 'desc');
            $('#efficacySortingImg').css('display', 'block');
        } else {
            return 'none';
        }
    },

    'isSortedBy': function(column) {

        if (localStorage.getItem('SortDrugsBy') == column) {
            return 'select';
        }
    },

    'WhichSorting': function(column, type) {

        if (localStorage.getItem('SortDrugsBy') === column) {
            if (localStorage.getItem('SortingType') === 'asce') {
                return 'upArrow.png';
            } else if (localStorage.getItem('SortingType') === 'desc') {
                return 'downArrow.png';
            }
        } else if (localStorage.getItem('SortDrugsBy') == '' || localStorage.getItem('SortDrugsBy') == null) {
            //    localStorage.setItem('SortDrugsBy', 'efficacy');
            localStorage.setItem('SortDrugsBy', 'drugScore');
            localStorage.setItem('SortingType', 'desc');
            return 'downArrow.png';
        } else {
            return '';
        }
    },
     // added by yuvraj - Assigning class to best drug.
    'isBestDrugScore': function (score, bestDrugScore) {
        if(score == bestDrugScore){
            return 'bestDrugScore';
        }else{
            return 'drugScore'
        }
    }
});

//Events for Drugs page
Template.RWEBenchmark.events({

    'click .rweb-list li': function(e, template, data) {
        // let tabData = $('.utilizationSubtabs-links li.active a').attr('data');

        let tabData = $(e.currentTarget).children('a').attr('data');

        // let tabData = $(e.currentTarget).children('a').attr('data');
        if (data && data == 'refresh') {
            tabData = $('.rweb-list li.active a').attr('data');
        }
        $(e.currentTarget).addClass('active').siblings().removeClass('active');

        e.preventDefault();

        
        // Added By Yuvraj 6th March 17

      let params = {};
            if (Pinscriptive.Filters) {
                params = getCurrentPopulationFilters();
            }

        let relativeWeights = {};
        relativeWeights['efficacy'] = parseFloat($('#txtEffWeight_Provider').val());
        relativeWeights['adherence'] = parseFloat($('#txtAdhWeight_Provider').val());
        relativeWeights['cost'] = parseFloat($('#txtCostWeight_Provider').val());

        params['efficacyWeight'] = relativeWeights['efficacy'];
        params['adherenceWeight'] = relativeWeights['adherence'];
        params['costWeight'] = relativeWeights['cost'];

        localStorage.setItem('provider_relative_weights', JSON.stringify(relativeWeights));

        if (tabData == "withFDACompliant") {
            console.log("Render FDA Comliant Data.");

            // let params = {};
            // if (Pinscriptive.Filters) {
            //     //Praveen 02/20/12017 changed pharmaLib.getCurrentPopulationFilters() to getCurrentPopulationFilters() from common.js
            //     params = getCurrentPopulationFilters();
            // }
            params['fdaCompliant'] = "yes";

            template.loading.set(true);


            Meteor.call('getRWEBenchmarkPageData', params, function(error, result) {
                if (error) {
                    template.loading.set(false);
                    template.noData.set(true);
                } else {
                    //console.log(result);
                    template.loading.set(false);
                    let decompressed_object = LZString.decompress(result);
                    let resulting_object = JSON.parse(decompressed_object);

                    drugsData = resulting_object.drugsData;
                    drugRiskData = resulting_object.riskData;
                    Session.set('rwebenchmark_subtab', 'withFDACompliant');

                    // pharmaLib.setAdvancedSearchFilters();
                    // pharmaLib.setPharmaHeader();

                    // OLD CODE
                    // $('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(drugsData[0]['TotalN']));
                    //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
                    setCohortPatientCount({ patientCount: drugsData[0].TotalN });
                    //Session.set('total_subpopulation_patients',drugsData[0].TotalN || 0);

                }

            });


        } else if (tabData == "withoutFDACompliant") {
            console.log("Render Without FDA Comliant Data.");
             // yuvraj 6th March (Defined it above the if statement)
            // let params = {};
            // if (Pinscriptive.Filters) {
            //     //Praveen 02/20/12017 changed pharmaLib.getCurrentPopulationFilters() to getCurrentPopulationFilters() from common.js
            //     params = getCurrentPopulationFilters();
            // }
            params['fdaCompliant'] = "no";

            template.loading.set(true);
            Meteor.call('getRWEBenchmarkPageData', params, function(error, result) {
                if (error) {
                    template.loading.set(false);
                    template.noData.set(true);
                } else {
                    //console.log(result);
                    template.loading.set(false);
                    let decompressed_object = LZString.decompress(result);
                    let resulting_object = JSON.parse(decompressed_object);

                    drugsData = resulting_object.drugsData;
                    drugRiskData = resulting_object.riskData;
                    Session.set('rwebenchmark_subtab', 'withoutFDACompliant');

                    // pharmaLib.setAdvancedSearchFilters();
                    // pharmaLib.setPharmaHeader();
                    // pharmaLib.setPharmaHeader();
                    // OLD CODE
                    // $('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(drugsData[0]['TotalN']));
                    //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
                    setCohortPatientCount({ patientCount: drugsData[0].TotalN });

                }

            });

        } else if (tabData == "allMedsData") {
            console.log("Render All Drugs Data.");
             // yuvraj 6th March (Defined it above the if statement)
            // let params = {};
            // if (Pinscriptive.Filters) {
            //     //Praveen 02/20/12017 changed pharmaLib.getCurrentPopulationFilters() to getCurrentPopulationFilters() from common.js
            //     params = getCurrentPopulationFilters();
            // }
            params['fdaCompliant'] = "all";

            template.loading.set(true);
            Meteor.call('getRWEBenchmarkPageData', params, function(error, result) {
                if (error) {
                    template.loading.set(false);
                    template.noData.set(true);
                } else {
                    //console.log(result);
                    template.loading.set(false);
                    let decompressed_object = LZString.decompress(result);
                    let resulting_object = JSON.parse(decompressed_object);

                    drugsData = resulting_object.drugsData;
                    drugRiskData = resulting_object.riskData;
                    Session.set('rwebenchmark_subtab', 'allMedsData');

                    pharmaLib.setAdvancedSearchFilters();
                    pharmaLib.setPharmaHeader();
                    // pharmaLib.setPharmaHeader();
                    // OLD CODE
                    // $('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(drugsData[0]['TotalN']));
                    //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
                    setCohortPatientCount({ patientCount: drugsData[0].TotalN });

                }

            });
        }

        // //show load mask
        // $("#anim_loading_theme").css("visibility","visible");
        // $("#anim_loading_theme").css("top","90%");
        // $("#overlay").show();
    },
    'click .pathForAnalyticsbyDrug': function(e) {
        if (Pinscriptive.Filters) {
            var param = $(e.currentTarget).attr('param');
            localStorage.setItem('AnalyticsParam', param.toLowerCase());
            window.location = 'javascript:Router.go("Analytics/Efficacy");';
        } else {
            sAlert.error('Please specify the Cohort Criteria.', {
                timeout: 1500,
                onClose: function() {
                    console.log('Error - closing alert in 1000ms...');
                },
                effect: 'bouncyflip',
                html: true,
                position: 'top-left',
                width: '400px'
            });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
        }
    },

    // Added By Yuvraj 20th Feb 2017
    'click .pathForEfficacybyDrug': function(e) {
        if (Pinscriptive.Filters) {
            var param = $(e.currentTarget).attr('param');
            localStorage.setItem('AnalyticsParam', param.toLowerCase());
            window.location = 'javascript:Router.go("Analytics/Efficacy");';
        } else {
            sAlert.error('Please specify the Cohort Criteria.', {
                timeout: 1500,
                onClose: function() {
                    console.log('Error - closing alert in 1000ms...');
                },
                effect: 'bouncyflip',
                html: true,
                position: 'top-left',
                width: '400px'
            });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
        };
    },
    'click .pathForAdherencebyDrug': function(e) {
        if (Pinscriptive.Filters) {
            var param = $(e.currentTarget).attr('param');
            localStorage.setItem('AnalyticsParam', param.toLowerCase());
            window.location = 'javascript:Router.go("Analytics/Adherence");';
        } else {
            sAlert.error('Please specify the Cohort Criteria.', {
                timeout: 1500,
                onClose: function() {
                    console.log('Error - closing alert in 1000ms...');
                },
                effect: 'bouncyflip',
                html: true,
                position: 'top-left',
                width: '400px'
            });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
        }
    },
    'click .pathForUtilizationbyDrug': function(e) {
        if (Pinscriptive.Filters) {
            var param = $(e.currentTarget).attr('param');
            localStorage.setItem('AnalyticsParam', param.toLowerCase());
            window.location = 'javascript:Router.go("Analytics/Utilization");';
        } else {
            sAlert.error('Please specify the Cohort Criteria.', {
                timeout: 1500,
                onClose: function() {
                    console.log('Error - closing alert in 1000ms...');
                },
                effect: 'bouncyflip',
                html: true,
                position: 'top-left',
                width: '400px'
            });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
        };
    },
    'click #APRIMessage': function(e) {
        e.preventDefault();
        hideAPRINotification();
    },
    'hover .APRI-icon': function() {
        //console.log("hover over APRI");
    },

    // Method for Sorting Drug Page
    'click .SortDrugPageBy': function(e) {

        // Displaying the Loading Wheel
        // document.getElementById("anim_loading_theme").style.visibility = "visible";
        // document.getElementById("overlay").style.display = "block";
        // document.getElementById("anim_loading_theme").style.top = "70%";

        var DrugsData;
        var ele = e.currentTarget;
        //    var value = ele.innerText.toLowerCase().trim();
        var value = $(ele).attr('sortby');
        $(ele).addClass('select');
        if (localStorage.getItem('SortDrugsBy') === value) {
            if (localStorage.getItem('SortingType') === 'asce') {
                localStorage.setItem('SortingType', 'desc');
            } else if (localStorage.getItem('SortingType') === 'desc') {
                localStorage.setItem('SortingType', 'asce');
            }
        } else {
            localStorage.setItem('SortingType', 'desc');
        }
        localStorage.setItem('SortDrugsBy', value);
        Router.current().render(Template.Patient);
        Router.current().render(Template.RWEBenchmark);
    },

    'click svg.FuelGuageDrugInfo': function(e) {
        //scroll event for the bubble on the drug page
        var eleID = $(e.currentTarget).parent().parent().next().attr('id');
        fitToViewPort(eleID, e.currentTarget);
    },
    'click img.drugPageImgPopup': function(e) {
        //scroll event for the Preferred/Not Preferred image on the drug page
        var eleID = $(e.currentTarget).parent().parent().next().attr('id');
        fitToViewPort(eleID, e.currentTarget);
    },
    'click .safetybtn': function(e) {
        //scroll event for the risk capsules on the drug page
        var eleID = $(e.currentTarget).next().attr('id');
        fitToViewPort(eleID, e.currentTarget);
    },
    'click .gaugeMeter': function(e) {
        //  //scroll event for the value chart on the drug page
        var eleID = $(e.currentTarget).parent().next().attr('id');
        fitToViewPort(eleID, undefined);
    },
    'mouseenter .valueInfoIcon': function(e) {
        //scroll event for the value info icon on the drug page

        var eleID = $(e.currentTarget).children().next().children().attr('id');
        fitToViewPort(eleID, e.currentTarget);
    },
    'click .moreChartPopulationLink': function(e) {
        // todo for the click of moreChartPopulationLink
        // console.log(e.currentTarget);
        if (e.currentTarget.innerHTML === 'more') {
            $('.valueChartPopulation_Prev').css('display', 'none');
            $('.valueChartPopulation_All').css('display', 'block');
        } else {
            $('.valueChartPopulation_All').css('display', 'none');
            $('.valueChartPopulation_Prev').css('display', 'block');
        }
    },
    //click event to redirect to PA Request when button is clicked
    'click .btn-pa-request': function() {
        //Set selected drugname for PA Request
        localStorage.setItem('paDrugName', this.DrugName);
        Router.go('/PARequests');
        //location.href = "/PARequests";
    },
    'click div.drugpagination ul > li.numpg': function(event, template) {
        let page_number = parseInt($(event.currentTarget).html());
        let pValue = JSON.parse(localStorage.AllDrugsData).length;
        let page_numbers = pValue / showPages;
        if (pValue % showPages == 0) {
            page_numbers = pValue / showPages;
        } else {
            page_numbers = pValue / showPages;
            page_numbers = parseInt(page_numbers) + 1;
        }
        if (page_number == 1) {
            $('li.pg-prev').addClass('disable');
            $('li.pg-next').removeClass('disable');
        }

        if (page_number == page_numbers) {
            $('li.pg-prev').removeClass('disable');
            $('li.pg-next').addClass('disable');
        }

        if (page_number != page_numbers && page_number != 1) {
            $('li.pg-prev').removeClass('disable');
            $('li.pg-next').removeClass('disable');
        }
        $('div.drugpagination ul > li').each(function(d) {
            if (!isNaN(parseInt($(this).html()))) {
                if (parseInt($(this).html()) == page_number) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }
            }
        });

        $('.paginationDrugs .pdl-list').each(function(d) {
            if ($(this).hasClass('page' + page_number) == true) {
                $(this).show();
            } else {
                $(this).hide();
            }
            //console.log($(this).html());
        });

    },
    // 'click div.drugpagination ul > li.pg1': function(event, template) {

    //     $('.page2').hide();
    //     $('.page1').show();
    //     $('li.pg2').removeClass('active');
    //     $('li.pg1').addClass('active');
    //     $('li.pg-prev').addClass('disable');
    //     $('li.pg-next').removeClass('disable');
    // },
    // 'click div.drugpagination ul > li.pg2': function(event, template) {
    //     $('.page1').hide();
    //     $('.page2').show();
    //     $('li.pg1').removeClass('active');
    //     $('li.pg2').addClass('active');
    //     $('li.pg-prev').removeClass('disable');
    //     $('li.pg-next').addClass('disable');
    // },
    'click div.drugpagination ul > li.pg-next ': function(event, template) {
        // $('.page1').hide();
        // $('.page2').show();
        // $('li.pg1').removeClass('active');
        // $('li.pg2').addClass('active');
        // $('li.pg-prev').removeClass('disable');
        // $('li.pg-next').addClass('disable');

        let pValue = JSON.parse(localStorage.AllDrugsData).length;
        let page_numbers = pValue / showPages;
        if (pValue % showPages == 0) {
            page_numbers = pValue / showPages;
        } else {
            page_numbers = pValue / showPages;
            page_numbers = parseInt(page_numbers) + 1;
        }
        let page_number = 0;
        $('div.drugpagination ul > li.numpg').each(function(d) {
            if ($(this).hasClass('active') == true) {
                page_number = parseInt($(this).html());
                if (page_number != page_numbers)
                    $(this).removeClass('active');
            }
        });
        if ($('li.pg-next').hasClass('disable') == false) {
            $('.pg' + (page_number + 1)).addClass('active');
            $('.page' + (page_number + 1)).show();
            $('.page' + (page_number)).hide();
        }



        if (page_number + 1 == page_numbers) {
            $('li.pg-prev').removeClass('disable');
            $('li.pg-next').addClass('disable');
            $('.pg' + (page_number + 1)).addClass('active');

        }

        if (page_number != page_numbers) {
            $('li.pg-prev').removeClass('disable');
            $('paginationDrugs .pdl-list').each(function(d) {
                if ($(this).hasClass('page' + (page_number + 1)) == true) {
                    $(this).show();
                } else {

                    $(this).hide();
                }
                //console.log($(this).html());
            });
        }







        /*
              if(page_number>0){
                 $('li.pg-prev').removeClass('disable');

              }

              if(page_number == page_numbers){
                 $('li.pg-next').addClass('disable');

              }

                                                                    */





    },
    'click div.drugpagination ul > li.pg-prev ': function(event, template) {

        // $('.page2').hide();
        // $('.page1').show();
        // $('li.pg2').removeClass('active');
        // $('li.pg1').addClass('active');
        // $('li.pg-prev').addClass('disable');
        // $('li.pg-next').removeClass('disable');
        let pValue = JSON.parse(localStorage.AllDrugsData).length;
        let page_numbers = pValue / showPages;
        if (pValue % showPages == 0) {
            page_numbers = pValue / showPages;
        } else {
            page_numbers = pValue / showPages;
            page_numbers = parseInt(page_numbers) + 1;
        }
        let page_number = 0;
        $('div.drugpagination ul > li.numpg').each(function(d) {
            if ($(this).hasClass('active') == true) {
                page_number = parseInt($(this).html());
                if (page_number != 1)
                    $(this).removeClass('active');
            }
        });
        if ($('li.pg-prev').hasClass('disable') == false)
            $('.pg' + (page_number - 1)).addClass('active');



        if (page_number - 1 == 1) {
            $('li.pg-prev').addClass('disable');
            $('li.pg-next').removeClass('disable');
            $('.pg' + (page_number - 1)).addClass('active');
        } else if (page_number != 1) {
            $('li.pg-next').removeClass('disable');
            $('.paginationDrugs .pdl-list').each(function(d) {
                if ($(this).hasClass('page' + (page_number - 1)) == true) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
                //console.log($(this).html());
            });
        }


    },
    'click a.navigateUrl': function(event, template) {
        var DrugName = this.DrugName;
        var eleArr = event.currentTarget.id.split('_');
        var drugsToTabStr = '';
        for (i = 0; i < drugsToTab.length; i++) {
            Pinscriptive.drugsToTab += drugsToTab[i] + '+';
        }
        localStorage.setItem('drugsToTab', drugsToTabStr);
        var temp = DrugName.split(' (');
        if (localStorage.getItem('DrugName')) {
            localStorage.setItem('DrugName', temp[0].trim());

        } else {
            localStorage.setItem('DrugName', temp[0].trim());
        }
        if (eleArr[0] === 'TSE') {
            localStorage.setItem('SafetySection', '#34084-4');
        } else if (eleArr[0] === 'CONT') {
            localStorage.setItem('SafetySection', '#34070-3');
        } else if (eleArr[0] === 'DINT') {
            localStorage.setItem('SafetySection', '#34073-7');
        } else {
            localStorage.setItem('SafetySection', '');
        }
        window.location = 'javascript:Router.go("Safety");';
    },
    'click .apiLinksSpan': function(event, template) {
        var drugName = "Harvoni";
        switch (event.currentTarget.id) {
            case "clinicalTrials_Api":
                window.location = 'javascript:Router.go("ClinicalTrialsAPI");';
                break;
            case "evidenceBased_Api":
                window.location = 'javascript:Router.go("EvidenceAPI");';
                break;
            case "Pharmacological_Api":
                window.location = 'javascript:Router.go("Pharmacological");';
                break;
            default:
                break;
        }
    },
    //Captures Inspected drug response for future use
    'click #btnCaptureResponse': function() {
        //console.log("Drug captured");
        //If Drug Inspection popup displayed once then it will never display popup again, but capture information
        localStorage.IsDrugCaptured = true;

        //hide poupup if yes clicked
        $('.drug-inspection').slideUp();

    },
    // Capture Drug selection response based on drug checkbox
    'change .drugtitle  input:checkbox': function(e) {
        //console.log("TemplateEvent changed checkbox");
        //If Drug popup displayed once in current session then it will never show again but capture information
        if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
            $('.drug-inspection').slideUp();
        } else {
            //    $('.drug-inspection').slideDown();
            //	showDrugToastMessage();
        }

        var selectedDrugs = $('.drugtitle input:checked');
        if (e.target && e.target.checked) {

            //Prepare business logic to capture selected drug which information will use on different tabs like efficacy.safety etc.
            if (localStorage.selectedDrugs && JSON.parse(localStorage.selectedDrugs)) {
                var temp = JSON.parse(localStorage.selectedDrugs);
                if (temp.indexOf(this.DrugName) === -1) {
                    temp.push(this.DrugName);
                    localStorage.selectedDrugs = JSON.stringify(temp);
                }
            } else {
                var drugData = [];
                drugData.push(this.DrugName);
                localStorage.selectedDrugs = JSON.stringify(drugData);
            }

            //Store and Display Clinician response based on selection of drugs
            //Restrict popup disply if more than one drug is selected
            if (selectedDrugs.length > 1) {
                //17-Dec-2015 change display popup if multiple checkbox are checked
                //$('.drug-inspection').hide();

            } else {
                //Set Drug for inspection if only one drug is selected
                localStorage.setItem('lastSelectedDrug', this.DrugName);
                localStorage.DrugId = this.DrugId;
                localStorage.IsLastSelectedCaptured = true;
                //Dynamically wrap drug name based on length of name
                WrapDrugName(this.DrugName);
                //Show Drug Notification on Checkbox click
                //showDrugToastMessage(this.DrugName);

                if (selectedDrugs.length === 1) {
                    $('.ps-drug-popup').css('top', ($(e.target).closest('.pdl-content').offset().top + $(e.target).closest('.pdl-content').outerHeight() - 50 - $('.ps-header').outerHeight()));
                    //$('.ps-drug-popup').css('left', ($(e.target).closest('.pdl-content').offset().left));
                    $('.drug-inspection').slideDown();
                } else {
                    $('.drug-inspection').slideUp();
                }
                //Display Popup if drug is not prescribed from database check
                //For checkbox pass empty string
                capturedBubbleName('');
                isDrugPrescribed();
            }

        } else {
            // 17-Dec-2015 do not hide if checkbox is unchecked
            //hide popup if checkbox is unchecked
            //$('.drug-inspection').hide();
            //If multiple drugs selected and then count is only one then display popup with last selected
            if (selectedDrugs.length === 1) {
                //Display Popup if drug is not prescribed from database check
                // console.log($('.drugtitle input:checked').val());


                if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
                    $('.drug-inspection').slideUp();
                } else {
                    //    $('.drug-inspection').slideDown();
                    //	showDrugToastMessage();
                    WrapDrugName($('.drugtitle input:checked').val());

                    $('.ps-drug-popup').css('top', ($('.drugtitle input:checked').closest('.pdl-content').offset().top + $('.drugtitle input:checked').closest('.pdl-content').outerHeight() - 50));
                    $('.ps-drug-popup').css('left', ($('.drugtitle input:checked').closest('.pdl-content').offset().left));
                    $('.drug-inspection').slideDown();
                }
            } else {
                $('.drug-inspection').slideUp();
            }

            //Removed unchecked drugs from selectedDrugs
            if (localStorage.selectedDrugs && JSON.parse(localStorage.selectedDrugs)) {
                var temp = JSON.parse(localStorage.selectedDrugs);

                if (temp.indexOf(this.DrugName) >= 0) {
                    temp.splice(temp.indexOf(this.DrugName), 1);
                }
                localStorage.selectedDrugs = JSON.stringify(temp);
            }

        }
    },
    //Capture Drug selection response based on bubble gauge click
    'mouseenter .pdl-content .safetybtn': function(e) {
        // $('.pop').mouseenter(function(e){ console.log(e)});
        //If Drug popup displayed once in current session then it will never show again but capture information

        if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
            $('.drug-inspection').slideUp();
        } else {
            //    $('.drug-inspection').slideDown();
        }

        //Store and Display Clinician response based on selection bubble click for each drug regardless of checkbox value
        //Set Drug for inspection if only one grug is selected

        //Complex Logic for safety tab logging
        var classList = e.currentTarget.classList

        var isSafetyClicked = '';
        if (_.indexOf(classList, 'safetybtn') > -1) {
            isSafetyClicked = 'pdl-safety';
            localStorage.setItem('lastSelectedDrug', this.drugFullName);
            localStorage.DrugId = 8;
            //WrapDrugName(this.drugFullName);
        } else {
            localStorage.setItem('lastSelectedDrug', this.DrugName);
            localStorage.DrugId = this.DrugId;
            //WrapDrugName(this.DrugName);
        }

        localStorage.IsLastSelectedCaptured = false;

        //Captue which bubble is clicked for drug

        localStorage.capturedBubble = e.currentTarget.classList && e.currentTarget.classList.length > 1 ? capturedBubbleName(e.currentTarget.classList[1]) : capturedBubbleName(isSafetyClicked);
        //Display Popup if drug is not prescribed from database check
        isDrugPrescribed();
        //To Do call method to capture response in database
    },
    //event handler for onclick more info of safety percentage.

    //Capture Drug selection response based on bubble gauge click
    'click [data-toggle=popover]': function(e) {
        // $('.pop').mouseenter(function(e){ console.log(e)});
        //If Drug popup displayed once in current session then it will never show again but capture information

        if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
            $('.drug-inspection').slideUp();
        } else {
            //    $('.drug-inspection').slideDown();
        }

        //Store and Display Clinician response based on selection bubble click for each drug regardless of checkbox value
        //Set Drug for inspection if only one grug is selected

        //Complex Logic for safety tab logging
        var classList = e.currentTarget.classList

        var isSafetyClicked = '';
        if (_.indexOf(classList, 'safetybtn') > -1) {
            isSafetyClicked = 'pdl-safety';
            localStorage.setItem('lastSelectedDrug', this.drugFullName);
            localStorage.DrugId = 8;
            //WrapDrugName(this.drugFullName);
        } else {
            localStorage.setItem('lastSelectedDrug', this.DrugName);
            localStorage.DrugId = this.DrugId;
            WrapDrugName(this.DrugName);
        }

        localStorage.IsLastSelectedCaptured = false;

        //Captue which bubble is clicked for drug
        localStorage.capturedBubble = e.currentTarget.classList && e.currentTarget.classList.length > 1 ? capturedBubbleName(e.currentTarget.classList[1]) : capturedBubbleName(isSafetyClicked);
        //Display Popup if drug is not prescribed from database check
        isDrugPrescribed();
        //To Do call method to capture response in database
    },
    //event handler for onclick more info of safety percentage.
    'click .safety-moreInfo': function(event, template) {
        var drug = $(event.currentTarget).attr('drug');
        localStorage.setItem('DrugName', drug);
        //made this function public in client/lib/payerToolUtilities.js
        displaySafetygetPopulationDataOnHeader();
        setTimeout(function() {
            //console.log("Timeoutcalled");
            window.location = 'javascript:Router.go("Safety");';
        }, 1000);

    },
    //event handler for onclick more info of LR/HR capsules.
    'click .lr-hr-moreInfo': function(event, template) {
        var drug = $(event.currentTarget).attr('drug');
        var section = $(event.currentTarget).attr('section');
        localStorage.setItem('DrugName', drug);
        localStorage.setItem('SafetySection', section);
        //made this function public in client/lib/payerToolUtilities.js
        displaySafetyOnHeader();
        //  console.log(drug);
        setTimeout(function() {
            //console.log("Timeoutcalled");
            window.location = 'javascript:Router.go("Safety");';
        }, 1000);
    },
    //event handler for onclick risk alert info.
    'click .safetyFlagTitleLink': function(event, template) {
        var drug = $(event.currentTarget).attr('drug');
        var drugWithoutSpace = drug.replace(/ /g, "_");
        var keyword = $(event.currentTarget).attr('keyword');
        var subsection = $(event.currentTarget).attr('subsection');
        var completeSubsectionId = drugWithoutSpace.toUpperCase() + "_collapsableElement_" + subsection;
        var section = $(event.currentTarget).attr('section');
        localStorage.setItem('DrugName', drug);
        localStorage.setItem('SafetySubSectionId', completeSubsectionId);
        localStorage.setItem('SafetySection', section);
        localStorage.setItem('DrugToHighlight', keyword);
        //made this function public in client/lib/payerToolUtilities.js
        displaySafetyOnHeader();
        window.location = 'javascript:Router.go("Safety");';

    },
    //event handler for onclick DI Capsule info.
    /*'click .DICapsule': function(event, template) {
        var drug = $(event.currentTarget).attr('drug');
        var setID = AllDrugs.filter(function(record) {
            return record.name === drug;
        });

        setID = setID[0].setId;
        var sectionName = "DI";

        //made this function public in client/lib/payerToolUtilities.js
        getSafetyRiskInfo(setID, sectionName);

    },
    //event handler for onclick CI Capsle info.
    'click .CICapsule': function(event, template) {
        var drug = $(event.currentTarget).attr('drug');
        var sectionName = "CI";
        var setID = AllDrugs.filter(function(record) {
            return record.name === drug;

        });

        setID = setID[0].setId;
        var sectionName = "CI";

        //made this function public in client/lib/payerToolUtilities.js
        getSafetyRiskInfo(setID, sectionName);

    },*/
    'change .changeYAxis': function() {
        //console.log($('.changeYAxis').val());
        // console.log($('.changeXAxis').val());
        //Commented on 08-DEC-2016 for increasing width of relative chart
        // Template.RWEBenchmark.renderSvgChartForSissionData($('.changeXAxis').val(), $('.changeYAxis').val(), 500, 790);
        //Template.RWEBenchmark.renderSvgChartForSissionData($('.changeXAxis').val(), $('.changeYAxis').val(), 500, 950);
        renderNewRelativeValueChart('valueChart_1', $('.changeXAxis').val(), $('.changeYAxis').val(), 500, 950);
    },
    'change .changeXAxis': function() {
        //console.log($('.changeYAxis').val());
        //console.log($('.changeXAxis').val());
        //Commented on 08-DEC-2016 for increasing width of relative chart
        //Template.RWEBenchmark.renderSvgChartForSissionData($('.changeXAxis').val(), $('.changeYAxis').val(), 500, 790);
        //Template.RWEBenchmark.renderSvgChartForSissionData($('.changeXAxis').val(), $('.changeYAxis').val(), 500, 950);
        renderNewRelativeValueChart('valueChart_1', $('.changeXAxis').val(), $('.changeYAxis').val(), 500, 950);
    },
    'click .gotoanalytic': function() {
        localStorage.setItem('AnalyticsParam', 'machine learning');
        Router.go('/Analytics');
    },

    'click .js-currentPatient': function() {
        window.location = 'javascript:Router.go("Patient");';

    },

    // Added By Yuvraj 6th March 17 
    'click .js_applyWeights': function() {
        console.log("GO Button is clicked");

        // call the backend call to get the data.
        $('.rweb-list li.active').trigger('click');
    }
});

//Check from database weather selected drug is prescribed or not
let isDrugPrescribed = () => {
    let isPrescribed = false;
    let pData = {};
    if (localStorage.ProviderID && localStorage.PatientID && localStorage.lastSelectedDrug) {

        pData.ProviderId = localStorage.ProviderID;
        pData.PatientId = localStorage.PatientID;
        pData.isPrescribed = true;
        pData.DrugName = localStorage.lastSelectedDrug;
        pData.DrugId = localStorage.DrugId;
        pData.EfficacyCount = localStorage.EfficacyCount;
        pData.AdherenceCount = localStorage.AdherenceCount;
        pData.SafetyCount = localStorage.SafetyCount;
        pData.UtilizationCount = localStorage.UtilizationCount;
        pData.CostCount = localStorage.CostCount;
        pData.TotalValueCount = localStorage.TotalValueCount;
        pData.CheckBoxCount = localStorage.CheckBoxCount;

        Meteor.call('AddDrugPrescription', pData, function(err, response) {

            if (err) {
                //console.log(' to do handle error');

            } else if (response && response.statuscode === 0) {
                //console.log("Response Captured");

            } else if (response && response.statuscode === -1) {
                // console.log(' to do handle error');
            } else {
                //console.log("Response Not Captured");
            }

        });

        //If Response successfully captured then increament count based on popup click reason
        var clinicalData = {};
        clinicalData.ProviderId = localStorage.ProviderID;
        clinicalData.PatientId = localStorage.PatientID;
        clinicalData.LastSelectedDrug = localStorage.lastSelectedDrug;
        clinicalData.IsDrugLastCaptured = localStorage.IsLastSelectedCaptured === 'true' ? true : false;
        clinicalData.LastDrugCaptureCount = localStorage.IsLastSelectedCaptured === 'true' ? 1 : 0;

        clinicalData.LastDrugCaptureDate = localStorage.IsLastSelectedCaptured === 'true' ? moment().format("YYYY-MM-DD HH:mm:ss") : null;
        clinicalData.DrugSelectionCaptureCount = localStorage.IsLastSelectedCaptured === 'true' ? 0 : 1;;
        clinicalData.DrugSelectionCaptureDate = localStorage.IsLastSelectedCaptured === 'true' ? null : moment().format("YYYY-MM-DD HH:mm:ss");

        clinicalData.EfficacyCount = localStorage.EfficacyCount;
        clinicalData.AdherenceCount = localStorage.AdherenceCount;
        clinicalData.SafetyCount = localStorage.SafetyCount;
        clinicalData.UtilizationCount = localStorage.UtilizationCount;
        clinicalData.CostCount = localStorage.CostCount;
        clinicalData.TotalValueCount = localStorage.TotalValueCount;

        Meteor.call('AddClinicalSelection', clinicalData, function(err, response) {
            //To Do if response captured
        });
    } else {
        //Show error message if RWEBenchmark/Patient/Drug is missing
    }



}

//Fetch clicked bubble name by passing classname
function capturedBubbleName(clsName) {
    //console.log(clsName);
    var capturedItem = '';
    switch (clsName) {
        case 'pdl-efficacy':
            capturedItem = "Efficacy";
            localStorage.EfficacyCount = 1;
            localStorage.AdherenceCount = 0;
            localStorage.SafetyCount = 0;
            localStorage.UtilizationCount = 0;
            localStorage.CostCount = 0;
            localStorage.TotalValueCount = 0;
            localStorage.CheckBoxCount = 0;
            break;
        case 'pdl-safety':
            capturedItem = "Safety";
            localStorage.EfficacyCount = 0;
            localStorage.AdherenceCount = 0;
            localStorage.SafetyCount = 1;
            localStorage.UtilizationCount = 0;
            localStorage.CostCount = 0;
            localStorage.TotalValueCount = 0;
            localStorage.CheckBoxCount = 0;
            break;
        case 'pdl-adherence':
            capturedItem = "Adherence";
            localStorage.EfficacyCount = 0;
            localStorage.AdherenceCount = 1;
            localStorage.SafetyCount = 0;
            localStorage.UtilizationCount = 0;
            localStorage.CostCount = 0;
            localStorage.TotalValueCount = 0;
            localStorage.CheckBoxCount = 0;
            break;
        case 'pdl-utilization':
            capturedItem = "Utilization";
            localStorage.EfficacyCount = 0;
            localStorage.AdherenceCount = 0;
            localStorage.SafetyCount = 0;
            localStorage.UtilizationCount = 1;
            localStorage.CostCount = 0;
            localStorage.TotalValueCount = 0;
            localStorage.CheckBoxCount = 0;
            break;
        case 'pdl-cost':
            capturedItem = "Cost";
            localStorage.EfficacyCount = 0;
            localStorage.AdherenceCount = 0;
            localStorage.SafetyCount = 0;
            localStorage.UtilizationCount = 0;
            localStorage.CostCount = 1;
            localStorage.TotalValueCount = 0;
            localStorage.CheckBoxCount = 0;
            break;
        case 'pdl-totalvalue':
            capturedItem = "TotalValue";
            localStorage.EfficacyCount = 0;
            localStorage.AdherenceCount = 0;
            localStorage.SafetyCount = 0;
            localStorage.UtilizationCount = 0;
            localStorage.CostCount = 0;
            localStorage.TotalValueCount = 1;
            localStorage.CheckBoxCount = 0;
            break;
        default:
            localStorage.EfficacyCount = 0;
            localStorage.AdherenceCount = 0;
            localStorage.SafetyCount = 0;
            localStorage.UtilizationCount = 0;
            localStorage.CostCount = 0;
            localStorage.TotalValueCount = 0;
            localStorage.CheckBoxCount = 1;
            break;
    }
    return capturedItem;
}

function WrapDrugName(drug) {
    $('#inspected-drug').text(drug).attr('title', drug);

}
//function to set height/width of LR/HR popups.
Template.RWEBenchmark.popupLoaded = function(obj) {
        obj.height = ((obj.contentWindow.document.body.scrollHeight) + 10) + 'px';
        obj.width = ((obj.contentWindow.document.body.scrollWidth) + 10) + 'px';
    }
    //function to add comma to thousand place on a number ,sourced from http://wwww.stackoverflow.com
function commaSeperatedNumber(val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
}

function calculateSize(minimum, maximum, populationSize, totalCount, previousAllocatedSize) {


    var diffrenceInSize = 12 / (totalCount - 2);

    //    Pinscriptive.PrevioulyAllocatedSize = previousAllocatedSize + diffrenceInSize;
    return previousAllocatedSize + diffrenceInSize;


}

function getQuadrantForDrug(Efficacy, Cost) {
    var efficacy = parseInt(Efficacy);
    var cost = parseInt(Cost);

    var xDataValues = [];
    var yDataValues = [];
    var allDrugs = JSON.parse(localStorage.AllDrugsData);

    for (var i = 0; i < allDrugs.length; i++) {
        yDataValues.push(parseInt(allDrugs[i].Efficacy.Efficacy));
        var temp = allDrugs[i].Cost.TotalCost;
        temp = temp / 1000;
        xDataValues.push(parseInt(temp));
    }

    // xDataValues.sort();
    // yDataValues.sort();

    var xMedian = calculateMedian(xDataValues);
    var yMedian = calculateMedian(yDataValues);

    var temp1 = xDataValues;
    temp1.sort(sortNumber);
    var xMax = temp1[temp1.length - 1];
    var xMin = temp1[0];

    var temp2 = yDataValues;
    temp2.sort(sortNumber);
    var yMax = temp2[temp2.length - 1];
    var yMin = temp2[0];

    var quadrant;

    if (cost >= xMin && cost <= xMedian) {
        if (efficacy <= yMax && efficacy >= yMedian) {
            quadrant = "A";
        } else if (efficacy <= yMedian && efficacy >= yMin) {
            quadrant = "C";
        }
    } else if (cost >= xMedian && cost <= xMax) {
        if (efficacy <= yMax && efficacy >= yMedian) {
            quadrant = "B";
        } else if (efficacy <= yMedian && efficacy >= yMin) {
            quadrant = "D";
        }
    }
    return quadrant;
}

function calculateMedian(dataArray) {
    //    dataArray.sort();
    dataArray.sort(sortNumber);
    var nthValue = Math.floor(dataArray.length / 2);

    if (dataArray.length % 2 === 0) {
        return (dataArray[nthValue - 1] + dataArray[nthValue]) / 2;
    } else {
        return dataArray[nthValue];
    }
}

function sortNumber(a, b) {
    return a - b;
}



function fitToViewPort(eleID, parentID) {

    // if (eleID != '' || eleID != null) {
    //     setTimeout(function() {
    //         document.getElementById(eleID).scrollIntoView({
    //             block: "end",
    //             behavior: "smooth"
    //         });
    //     }, 200);
    // }
    //
    // if (parentID) {
    //     $('html,body').animate({
    //         scrollTop: $(parentID).offset().top - 100
    //     }, 'slow');
    // }
}



Template.RWEBenchmark.helpers({


    'fixForInteger': function(val) {
        if (val == 0) {
            return 0 + '%';
        } else if (val == 'NA') {
            return '<span style="font-weight:normal; color: red;">Not Available (This Medication will not be shown in the relative value bubble chart)</span>';
        }

        var convertToInt = parseInt(val);
        var remainder = val % convertToInt;
        if (remainder == 0) {
            return convertToInt + '%';
        }

        return parseFloat(val).toFixed(2) + '%';
    },

    'totalPatients': function() {
        return AdvPayerPatientsCount[0].treated;
    },

    'calcPercentage': function(totalCount, rweCount) {
        var percentage = (rweCount * 100) / totalCount;
        if (isFloat(percentage)) {
            return percentage.toFixed(2);
        } else {
            return percentage;
        }
    },

    'CreateSVGForValueZone': function(DrugsData, DrugName, DrugSequence) {
        setTimeout(function() {
            //    var selectedMadication = $('.gaugeMeter').attr('madication');
            var selectedMadication = DrugName;
            var data = [];
            //    var tempData = jQuery.parseJSON($('.gaugeMeter').attr('drugData'));
            //var tempData = jQuery.parseJSON(DrugsData);
            var tempData = jQuery.parseJSON(localStorage.AllDrugsData);
            //console.log(DrugsData);

            // Sort by Value low to high
            tempData.sort(function(a, b) {
                return parseFloat(a.DrugPopulationSize) - parseFloat(b.DrugPopulationSize);
            });
            var minimumSize = tempData[0].DrugPopulationSize;
            var totalCount = tempData.length;
            var maximumSize = tempData[totalCount - 1].DrugPopulationSize;
            var previousSize = 28;
            //console.log("minimum " + minimumSize);
            //console.log("maximum " + maximumSize);
            var efficacyData = [];
            if (tempData.length > 0) {
                for (var i = 0; i < tempData.length; i++) {
                    var json = {};
                    if (tempData[i].Adherence.Adherence == 'NaN') {
                        json['Adherence'] = 55;
                    } else {
                        json['Adherence'] = parseFloat(tempData[i].Adherence.Adherence);
                    }
                    json['Cost'] = parseInt(tempData[i].Cost.TotalCost / 1000);
                    if (tempData[i].Efficacy.Efficacy == 'NaN') {
                        json['Efficacy'] = 0;
                    } else {
                        json['Efficacy'] = parseFloat(tempData[i].Efficacy.Efficacy);
                    }
                    if (tempData[i].Efficacy.Efficacy <= 50) {
                        json['EfficacyPlot'] = 60;
                        efficacyData.push(60);
                    } else if (tempData[i].Efficacy.Efficacy >= 100) {
                        json['EfficacyPlot'] = 100;
                        efficacyData.push(100);
                    } else {
                        json['EfficacyPlot'] = parseFloat(tempData[i].Efficacy.Efficacy);
                        efficacyData.push(parseFloat(tempData[i].Efficacy.Efficacy));
                    }
                    json['Madication'] = tempData[i].DrugName;
                    json['DrugN'] = parseInt(tempData[i].DrugN);
                    json['Utilization'] = tempData[i].Utilization.Utilization;
                    json['TotalN'] = tempData[i].TotalN;
                    json['Safety'] = parseFloat(tempData[i].Safety);
                    // if (tempData[i].DrugPopulationSize >= 0 && tempData[i].DrugPopulationSize <= 100) {
                    //     json['Size'] = 18;
                    // } else if (tempData[i].DrugPopulationSize >= 101 && tempData[i].DrugPopulationSize <= 1000) {
                    //     json['Size'] = 25;
                    // } else {
                    //     json['Size'] = 30;
                    // }

                    if (tempData[i].DrugPopulationSize == minimumSize) {
                        json['Size'] = 40;
                    } else if (tempData[i].DrugPopulationSize == maximumSize) {
                        json['Size'] = 55;
                    } else {
                        var size = calculateSize(minimumSize, maximumSize, tempData[i].DrugPopulationSize, totalCount, previousSize);
                        previousSize = size;
                        json['Size'] = size;
                    }


                    if (selectedMadication == tempData[i].DrugName) {
                        json['SelectedMadication'] = 'true';
                    } else {
                        json['SelectedMadication'] = 'false';
                    }
                    json['SelectSvg'] = 'SelectedMadication';
                    json['drugNameDisplayCount'] = i;
                    data.push(json);
                }
            }
            efficacyData.sort(function(a, b) {
                return parseFloat(a) - parseFloat(b);
            });
            data.sort(function(a, b) {
                return parseFloat(a.Cost) - parseFloat(b.Cost);
            });
            renderSvgForValueZone('Cost', 'Efficacy', data, DrugSequence);

            // $('[data-toggle="popover"]').each(function () {
            //        var $elem = $(this);
            //        $elem.popover({
            //            placement: 'auto',
            //            trigger: 'hover',
            //            html: true,
            //            container: $elem,
            //            animation: true,
            //
            //        });
            //    });

            // 		$('.pdl-relative-value-graph').each(function () {
            //
            // var $elem = $(this);
            //
            // $elem.popover({
            //
            //     placement: 'auto',
            //
            //     trigger: 'click',
            //
            //     html: true,
            //
            //     container: $elem,
            //
            //     animation: true,
            //
            //       // content: 'This is the popover content. You should be able to mouse over HERE.'
            //
            // });

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
            //commented old Canvas Circle
            //drawCircle();
            $(".svgd").each(function(i) {
                //restriction for non empty id element
                if (this.id && this.id.length > 0) {
                    fillDrugFuelGuage(Number($(this).attr('data-value')), String(this.id), $(this).attr('data-class'));
                }
            });
            //New way to draw chart in RWEBenchmark
            //commented old Canvas Circle
            //  drawCircle();
            //hide the load mask
            document.getElementById("anim_loading_theme").style.visibility = "hidden";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("anim_loading_theme").style.top = "40%";
        }, 500);
    },
    'formatDosageConditions': function(text, flag, weight) {
        let drug_condition_html = '';
        var CurrentPatientData = Session.get("selectedPatientData");
        weight = CurrentPatientData[0].BodyWeight;
        if (text && flag) {
            var drug_condition = text.split(';');
            let html = '';
            if (weight < 75) {
                html += '' + drug_condition[0].split('then')[1] + '';
            } else {
                html += '' + drug_condition[1].split('then')[1] + '';
            }
            // for (let i = 0; i < drug_condition.length; i++) {
            //     let condition = drug_condition[i].split('then');
            //     if(weight<75){
            //         html += ''+condition[1]+'< br />';
            //     }
            //     else{
            //         html += ''+condition[1]+'< br />';
            //     }
            //     html += '' + condition[0] + '<br /> then ' + condition[1] + ' <br />';
            // }
            drug_condition_html = html;
        } else {
            drug_condition_html = 'NA';
        }
        return drug_condition_html;
    }

});




function renderSvgForValueZone(xAxis, yAxis, data, DrugSequence) {

    var testData = data[0];
    //check if the data does not have values return
    if ((testData['DrugN'] < 1) || (testData['Adherence'] < 1) || (isNaN(testData['Safety'])))
        return;

    d3.select("#SvgForValueZone" + DrugSequence).selectAll("*").remove();
    var svgHeight = 90,
        svgWidth = 85,
        xOffset = 15,
        yOffset = 15;
    var svg = d3.select("#SvgForValueZone" + DrugSequence).append("svg").attr("height", svgHeight).attr("width", svgWidth).style("background", "");
    var svgData = getRangeForChart(xAxis, yAxis, xOffset, yOffset, svgHeight, svgWidth, data);
    // Draw X-Axis and Y-Axis in RWEBenchmark Page
    DrawSvgForValueZone(svg, svgHeight, svgWidth, xOffset, yOffset, xAxis, yAxis, svgData);
    //console.log("***Render SVG for value Zone***");
    //console.log(svgData);
    for (var i = 0; i < svgData.length; i++) {
        // Draw circle with placement of selected drugs on  RWEBenchmark tab's value chart
        drawRadialSvgForValueZone(svgData[i].x, svgData[i].y, svgData[i].DrugInfo.Size, svgData[i].DrugInfo, svg, xOffset, svgHeight - xOffset);
    }
    return svg;
}


function DrawSvgForValueZone(svg, height, width, xOffset, yOffset, xAxisLable, yAxisLable, svgData) {
    var yTopLableHL = '',
        yBottomLableHL = '',
        xTopLableHL = '',
        xBottomLableHL = '';
    if (xAxisLable == 'Cost') {
        xTopLableHL = Math.round(svgData[0]['xMax']) + 'K';
        xBottomLableHL = Math.round(svgData[0]['xMin']) + 'K';
    } else {
        xTopLableHL = Math.round(svgData[0]['xMin']) + '%';
        xBottomLableHL = Math.round(svgData[0]['xMax']) + '%';
    }
    if (yAxisLable === 'Cost') {
        yTopLableHL = Math.round(svgData[0]['yMin']) + 'K';
        yBottomLableHL = Math.round(svgData[0]['yMax']) + 'K';
    } else {
        yTopLableHL = Math.round(svgData[0]['yMax']) + '%';
        yBottomLableHL = Math.round(svgData[0]['yMin']) + '%';
    }
    var arrowHeight = 6;
    var arrowWidth = 6;
    //.attr("points", ""+(xOffset + 0.5)+",0  "+(xOffset + 3)+",6 "+(xOffset - 2.5)+",6")
    ///Commented polygon code for value chart
    // var yAxisArrow = svg.append("polygon")
    //     //    .attr("points", "15.5,0  18,6 12.5,6")
    //     .attr("points", "" + (xOffset + 0.5) + ",0  " + (xOffset + arrowWidth / 2) + "," + arrowHeight + " " + (xOffset + 0.5 - arrowWidth / 2) + "," + arrowHeight + "")
    //     .attr('stroke', '#111111')
    //     .attr('stroke-width', '1');
    // var xAxisArrow = svg.append("polygon")
    //     //    .attr("points", "70,54.5  64,58 64,52")
    //     .attr("points", "" + (height) + "," + (height - yOffset - 0.5) + "  " + (width - arrowHeight) + "," + (width - xOffset + arrowWidth / 2) + " " + (width - arrowHeight) + "," + (width - xOffset - arrowWidth / 2) + "")
    //     .attr('stroke', '#111111')
    //     .attr('stroke-width', '1');
    var yAxis = svg.append("line")
        .attr("x1", xOffset)
        .attr("x2", xOffset)
        .attr("y1", 6)
        .attr('y2', height - xOffset)
        .attr('stroke', '#111111')
        .attr('stroke-width', '1');
    var xAxis = svg.append("line")
        .attr("x1", xOffset)
        .attr("x2", width - 6)
        .attr("y1", height - xOffset)
        .attr('y2', height - xOffset)
        .attr('stroke', '#111111')
        .attr('stroke-width', '1');
    var xslab = width / 4,
        yslab = height / 4;

    var xAxisLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 3) + "px")
        .attr("dx", (width - width / 3) + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("font-weight", "800")
        .attr("fill", "#026886")
        .text('C');
    var yAxisLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height / 3) + "px")
        .attr("dx", "5px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("font-weight", "800")
        .attr("fill", "#026886")
        .text('E');
}


function drawRadialSvgForValueZone(bubbleLeft, bubbleTop, bubbleSize, bubbleData, svg, svgXaxis, svgYaxis) {
    bubbleData['svgXaxis'] = svgXaxis;
    bubbleData['svgYaxis'] = svgYaxis;
    if (bubbleData.SelectedMadication === 'true') {
        svg.append("circle")
            .attr("cx", bubbleLeft)
            .attr("cy", bubbleTop)
            .attr("r", 4)
            .attr("fill", "#ef4823");
        svgXaxisLine = svg.append("line")
            .attr("x1", svgXaxis)
            .attr("x2", bubbleLeft)
            .attr("y1", bubbleTop)
            .attr('y2', bubbleTop)
            .attr('stroke', 'gray')
            .attr('stroke-width', '1')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '3, 3');
        svgYaxisLine = svg.append("line")
            .attr("x1", bubbleLeft)
            .attr("x2", bubbleLeft)
            .attr("y1", bubbleTop)
            .attr('y2', svgYaxis)
            .attr('stroke', 'gray')
            .attr('stroke-width', '1')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '3, 3');
    }
}

function hideAPRINotification() {
    //    $("#warningdivcritical").slideDown();
    $("#warningdivcritical").slideDown().delay(5000).slideUp();
}

function sortArrOfObjectsByParam(arrToSort, strObjParamToSortBy, sortAscending) {
    if (sortAscending == undefined) sortAscending = true; // default to true

    if (sortAscending) {
        arrToSort.sort(function(a, b) {
            return parseFloat(a.DrugInfo[strObjParamToSortBy]) > parseFloat(b.DrugInfo[strObjParamToSortBy]);
        });
    } else {
        arrToSort.sort(function(a, b) {
            return parseFloat(a.DrugInfo[strObjParamToSortBy]) < parseFloat(b.DrugInfo[strObjParamToSortBy]);
        });
    }
}

function displayColorAndSizeAccordingToLength(data, first, second, third, flag) {
    var len = data.length,
        firstCount = 0,
        secondCount = 0,
        thirdCount = 0,
        opacity = ['0.7', '0.5', '0.3', '0.3', '0.3', '0.3'];
    for (var i = 0; i < len; i++) {
        if (parseFloat(data[i]['DrugInfo']['Utilization']) <= first) {
            data[i]['bubbleColor'] = flag ? '#1379B7' : '#009eff';
            data[i]['bubbleSize'] = 20;
            data[i]['bubbleOpacity'] = opacity[firstCount]
            firstCount++;
        } else if (parseFloat(data[i]['DrugInfo']['Utilization']) > first && parseFloat(data[i]['DrugInfo']['Utilization']) <= second) {
            data[i]['bubbleColor'] = flag ? '#3cbca9' : '#e18602';
            data[i]['bubbleSize'] = 30;
            data[i]['bubbleOpacity'] = opacity[secondCount]
            secondCount++;
        } else if (parseFloat(data[i]['DrugInfo']['Utilization']) > second && parseFloat(data[i]['DrugInfo']['Utilization']) <= third) {
            data[i]['bubbleColor'] = flag ? '#815493' : '#1b1464';
            data[i]['bubbleSize'] = 40;
            data[i]['bubbleOpacity'] = opacity[thirdCount]
            thirdCount++;
        }
    }
}

/**
 *  Generate Cost symbol based on cost value
 *  @param String pCost
 *  pCost is cost value of treatment for Payer and Patient
 *  @return costSymbol
    string Symbol relevant to cost value
*/
function GenerateCostSymbol(pCost) {
    //Payer bubble to show $$$ not actual cost scale: 0-50K $ 50-100 $$ 150-200K $$$ 200-300 $$$$
    //pCost = pCost && pCost.toString().trim().length > 0 ? pCost.toString().trim() : '0K';
    //var splittedCost = pCost.split('K');
    //Convert money value to number
    //splittedCost[0] = Number(splittedCost[0].replace(/[^0-9\.]+/g, ""));
    //var cost = !isNaN(parseInt(splittedCost[0])) && $.isNumeric(splittedCost[0]) ? parseInt(splittedCost[0]) : 0;
    var cost = !isNaN(parseInt(pCost)) && $.isNumeric(pCost) ? parseInt(pCost) : 0
    var costSymbol = '';
    if (cost <= 57000) {
        costSymbol = '<span title="$0-57K">$</span>';
    } else if (cost > 57000 && cost <= 90000) {
        costSymbol = '<span title="$57-90K">$$</span>';
    } else if (cost > 90000 && cost <= 150000) {
        costSymbol = '<span title="$90-150K">$$$</span>';
    } else {
        costSymbol = '<span>$$$$</span>';
    }
    return costSymbol;
};


function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}


//function to fill color in the gauge icons
function fillDrugFuelGuage(ElementVlaue, ElementId, clsInsured) {

    var startColor = {
        r: 22,
        g: 70,
        b: 100
    };
    var endColor = {
        r: 22,
        g: 70,
        b: 100
    };

    //Set start and end color pass percentage value
    var gaugeColor = makeGradientColor(startColor, endColor, ElementVlaue);

    var config1 = liquidFillGaugeDefaultSettings();
    if (clsInsured && clsInsured === 'uninsured-drugs') {
        config1.circleColor = gaugeColor.cssColor; //Set Dynamic color based on % value
        config1.textColor = "#000000";
        config1.waveTextColor = "#FFFFFF";
        config1.waveColor = gaugeColor.cssColor; //Set Dynamic color based on % value

    } else {
        config1.circleColor = gaugeColor.cssColor; //Set Dynamic color based on % value
        config1.textColor = "#000000";
        config1.waveTextColor = "#FFFFFF";
        config1.waveColor = gaugeColor.cssColor; //Set Dynamic color based on % value
    }

    config1.waveAnimateTime = 1000;
    //$('.test').css('background', '-webkit-gradient(linear, left top, right top, color-stop(0%,#18344a), color-stop(100%,#ef4921)');
    loadLiquidFillGauge(ElementId, ElementVlaue, config1);
}

//Function to calculate gradioent color based on percent value
function makeGradientColor(color1, color2, percent) {
    var newColor = {};

    function makeChannel(a, b) {
        return (a + Math.round((b - a) * (percent / 100)));
    }

    function makeColorPiece(num) {
        num = Math.min(num, 255); // not more than 255
        num = Math.max(num, 0); // not less than 0
        var str = num.toString(16);
        if (str.length < 2) {
            str = "0" + str;
        }
        return (str);
    }

    newColor.r = makeChannel(color1.r, color2.r);
    newColor.g = makeChannel(color1.g, color2.g);
    newColor.b = makeChannel(color1.b, color2.b);
    newColor.cssColor = "#" +
        makeColorPiece(newColor.r) +
        makeColorPiece(newColor.g) +
        makeColorPiece(newColor.b);
    return (newColor);
}


/// Fludarabine Phosphate


function NewValue() {
    if (Math.random() > 0.5) {
        return Math.round(Math.random() * 100);
    } else {
        return (Math.random() * 100).toFixed(1);
    }
}

/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 *
 * Liquid Fill Gauge v1.1
 */
// Default Configuration
function liquidFillGaugeDefaultSettings() {
    return {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#178BCA", // The color of the outer circle.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: 0.5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        displayPercent: true, // If true, a % symbol is displayed after the value.
        textColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
    };
}

// set configuration of Fuel guage according to parameter "config"
function loadLiquidFillGauge(elementId, value, config) {


    if (config === null) config = liquidFillGaugeDefaultSettings();

    //var gauge =
    // d3.select("." + elementId).remove('svg');
    d3.select("#" + elementId).selectAll("*").remove();
    var gauge = d3.select("." + elementId).append('svg')
        .attr("style", "display:inline;width:50px;height:50px;")
        .attr('id', elementId);
    var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height"))) / 2;
    var locationX = parseInt(gauge.style("width")) / 2 - radius;
    var locationY = parseInt(gauge.style("height")) / 2 - radius;
    var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;

    var waveHeightScale;
    if (config.waveHeightScaling) {
        waveHeightScale = d3.scale.linear()
            .range([0, config.waveHeight, 0])
            .domain([0, 50, 100]);
    } else {
        waveHeightScale = d3.scale.linear()
            .range([config.waveHeight, config.waveHeight])
            .domain([0, 100]);
    }

    var textPixels = (config.textSize * radius / 2);
    var textFinalValue = parseFloat(value).toFixed(2);
    var textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
    var percentText = config.displayPercent ? "%" : "";
    var circleThickness = config.circleThickness * radius;
    var circleFillGap = config.circleFillGap * radius;
    var fillCircleMargin = circleThickness + circleFillGap;
    var fillCircleRadius = radius - fillCircleMargin;
    var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

    var waveLength = fillCircleRadius * 2 / config.waveCount;
    var waveClipCount = 1 + config.waveCount;
    var waveClipWidth = waveLength * waveClipCount;

    // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
    var textRounder = function(value) {
        return Math.round(value);
    };
    if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
        textRounder = function(value) {
            return parseFloat(value).toFixed(1);
        };
    }
    if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
        textRounder = function(value) {
            return parseFloat(value).toFixed(2);
        };
    }

    // Data for building the clip wave area.
    var data = [];
    for (var i = 0; i <= 40 * waveClipCount; i++) {
        data.push({
            x: i / (40 * waveClipCount),
            y: (i / (40))
        });
    }

    // Scales for drawing the outer circle.
    var gaugeCircleX = d3.scale.linear().range([0, 2 * Math.PI]).domain([0, 1]);
    var gaugeCircleY = d3.scale.linear().range([0, radius]).domain([0, radius]);

    // Scales for controlling the size of the clipping path.
    var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
    var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);

    // Scales for controlling the position of the clipping path.
    var waveRiseScale = d3.scale.linear()
        // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
        // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
        // circle at 100%.
        .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
        .domain([0, 1]);
    var waveAnimateScale = d3.scale.linear()
        .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
        .domain([0, 1]);

    // Scale for controlling the position of the text within the gauge.
    var textRiseScaleY = d3.scale.linear()
        .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
        .domain([0, 1]);

    // Center the gauge within the parent SVG.
    var gaugeGroup = gauge.append("g")
        .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

    // Draw the outer circle.
    var gaugeCircleArc = d3.svg.arc()
        .startAngle(gaugeCircleX(0))
        .endAngle(gaugeCircleX(1))
        .outerRadius(gaugeCircleY(radius))
        .innerRadius(gaugeCircleY(radius - circleThickness));
    gaugeGroup.append("path")
        .attr("d", gaugeCircleArc)
        .style("fill", config.circleColor)
        .attr('transform', 'translate(' + radius + ',' + radius + ')');

    // Text where the wave does not overlap.
    var text1 = gaugeGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", textPixels + "px")
        .style("fill", config.textColor)
        .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

    // The clipping wave area.
    var clipArea = d3.svg.area()
        .x(function(d) {
            return waveScaleX(d.x);
        })
        .y0(function(d) {
            return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
        })
        .y1(function(d) {
            return (fillCircleRadius * 2 + waveHeight);
        });
    var waveGroup = gaugeGroup.append("defs")
        .append("clipPath")
        .attr("id", "clipWave" + elementId);
    var wave = waveGroup.append("path")
        .datum(data)
        .attr("d", clipArea)
        .attr("T", 0);

    // The inner circle with the clipping wave attached.
    var fillCircleGroup = gaugeGroup.append("g")
        .attr("clip-path", "url(#clipWave" + elementId + ")");
    fillCircleGroup.append("circle")
        .attr("cx", radius)
        .attr("cy", radius)
        .attr("r", fillCircleRadius)
        .style("fill", config.waveColor);

    // Text where the wave does overlap.
    var text2 = fillCircleGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", textPixels + "px")
        .style("fill", config.waveTextColor)
        .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');

    // Make the value count up.
    if (config.valueCountUp) {
        var textTween = function() {
            var i = d3.interpolate(this.textContent, textFinalValue);
            return function(t) {
                this.textContent = textRounder(i(t)) + percentText;
            };
        };
        text1.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
        text2.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
    }

    // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
    var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
    if (config.waveRise) {
        waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
            .transition()
            .duration(config.waveRiseTime)
            .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
            .each("start", function() {
                wave.attr('transform', 'translate(1,0)');
            }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
    } else {
        waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
    }

    if (config.waveAnimate) animateWave();

    function animateWave() {
        wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
        wave.transition()
            .duration(config.waveAnimateTime * (1 - wave.attr('T')))
            .ease('linear')
            .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
            .attr('T', 1)
            .each('end', function() {
                wave.attr('T', 0);
                animateWave(config.waveAnimateTime);
            });
    }

    function GaugeUpdater() {
        this.update = function(value) {
            var newFinalValue = parseFloat(value).toFixed(2);
            var textRounderUpdater = function(value) {
                return Math.round(value);
            };
            if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
                textRounderUpdater = function(value) {
                    return parseFloat(value).toFixed(1);
                };
            }
            if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
                textRounderUpdater = function(value) {
                    return parseFloat(value).toFixed(2);
                };
            }

            var textTween = function() {
                var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
                return function(t) {
                    this.textContent = textRounderUpdater(i(t)) + percentText;
                };
            };

            text1.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);
            text2.transition()
                .duration(config.waveRiseTime)
                .tween("text", textTween);

            var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;
            var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
            var waveRiseScale = d3.scale.linear()
                // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                // circle at 100%.
                .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
                .domain([0, 1]);
            var newHeight = waveRiseScale(fillPercent);
            var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
            var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);
            var newClipArea;
            if (config.waveHeightScaling) {
                newClipArea = d3.svg.area()
                    .x(function(d) {
                        return waveScaleX(d.x);
                    })
                    .y0(function(d) {
                        return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
                    })
                    .y1(function(d) {
                        return (fillCircleRadius * 2 + waveHeight);
                    });
            } else {
                newClipArea = clipArea;
            }

            var newWavePosition = config.waveAnimate ? waveAnimateScale(1) : 0;
            wave.transition()
                .duration(0)
                .transition()
                .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - wave.attr('T'))) : (config.waveRiseTime))
                .ease('linear')
                .attr('d', newClipArea)
                .attr('transform', 'translate(' + newWavePosition + ',0)')
                .attr('T', '1')
                .each("end", function() {
                    if (config.waveAnimate) {
                        wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
                        animateWave(config.waveAnimateTime);
                    }
                });
            waveGroup.transition()
                .duration(config.waveRiseTime)
                .attr('transform', 'translate(' + waveGroupXPosition + ',' + newHeight + ')');
        };
    }

    return new GaugeUpdater();
}


function popoverRender() {

    // Enabling Popover Example 1 - HTML (content and title from html tags of element)
    $("[data-toggle=popover]").popover();

    $('[data-toggle=popover]').on('click', function(e) {
        $('[data-toggle=popover]').not(this).popover('hide');
        //code to open popup for the drug capsules

        //check if the clicked popup is for geo icon
        if (_.indexOf(e.currentTarget.classList, 'dcol02Geo') > -1) {
            var mapOptions = {
                center: new google.maps.LatLng(39, -95),
                zoom: 3,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            var map = new google.maps.Map($(".googleMapsContainer")[0], mapOptions);
            var beaches = [
                ['Hep C Patient', 40, -94, 4],
                ['Hep C Patient', 38, -90, 5],
                ['Hep C Patient', 36, -88, 3],
                ['Hep C Patient', 30, -100, 2],
                ['Hep C Patient', 28, -96, 1]
            ];
            var image = {
                url: 'marker-bpas1.png',
                // This marker is 20 pixels wide by 32 pixels high.
                size: new google.maps.Size(20, 32),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(0, 32)
            };
            var shape = {
                coords: [1, 1, 1, 20, 18, 20, 18, 1],
                type: 'poly'
            };
            for (var i = 0; i < beaches.length; i++) {
                var beach = beaches[i];
                var marker = new google.maps.Marker({
                    position: {
                        lat: beach[1],
                        lng: beach[2]
                    },
                    icon: image,
                    shape: shape,
                    title: beach[0],
                    zIndex: beach[3]
                });

                // To add the marker to the map, call setMap();
                marker.setMap(map);
            }
        }
        //check for relative value chart icon popup
        else if (_.indexOf(e.currentTarget.classList, 'pdl-totalvalue') > -1) {
            setTimeout(function() {
                ///// *** COMMENTED AND CREATED SEPARATE FUNCTION FOR PREPARE RELATIVE VALUE CHART ISSUE

                // var selectedMadication = e.currentTarget.attributes.madication.nodeValue;
                // var data = [];
                // //Commented dependable drugData value fro value score chart which is repeatitive and lengthy
                // // var tempData = jQuery.parseJSON(e.currentTarget.attributes.drugData.nodeValue);
                // tempData = JSON.parse(localStorage.AllDrugsData);
                // // Sort by Value low to high
                // tempData.sort(function(a, b) {
                //     return parseFloat(a.DrugPopulationSize) - parseFloat(b.DrugPopulationSize);
                // });

                // //set min & max size for bubbles as per their data size. but now this dynamic sizing appraoch is not used.
                // var minimumSize = tempData[0].DrugPopulationSize;
                // var totalCount = tempData.length;
                // var maximumSize = tempData[totalCount - 1].DrugPopulationSize;
                // var previousSize = 28;

                // var efficacyData = [];
                // //if the tempData array has some value
                // if (tempData.length > 0) {
                //     for (var i = 0; i < tempData.length; i++) {
                //         var json = {};
                //         //check for NaN case for Adherence
                //         if (tempData[i].Adherence.Adherence == 'NaN') {
                //             json['Adherence'] = 55;
                //         } else {
                //             json['Adherence'] = parseFloat(tempData[i].Adherence.Adherence);
                //         }
                //         json['Cost'] = parseInt(tempData[i].Cost.TotalCost / 1000);

                //         //check for NaN case for Efficacy
                //         if (tempData[i].Efficacy.Efficacy == 'NaN') {
                //             json['Efficacy'] = 0;
                //         } else {
                //             json['Efficacy'] = parseFloat(tempData[i].Efficacy.Efficacy);
                //         }

                //         //if Efficacy is less or equal to 50 then slightly shift its plotting position on the chart
                //         if (tempData[i].Efficacy.Efficacy <= 50) {
                //             json['EfficacyPlot'] = 60;
                //             efficacyData.push(60);
                //         }
                //         //if Efficacy is greater or equal 100 then restrict its plotting to max 100 only
                //         else if (tempData[i].Efficacy.Efficacy >= 100) {
                //             json['EfficacyPlot'] = 100;
                //             efficacyData.push(100);
                //         } else {
                //             json['EfficacyPlot'] = parseFloat(tempData[i].Efficacy.Efficacy);
                //             efficacyData.push(parseFloat(tempData[i].Efficacy.Efficacy));
                //         }
                //         json['Madication'] = tempData[i].DrugName;
                //         json['Utilization'] = tempData[i].Utilization.Utilization;
                //         json['TotalN'] = tempData[i].TotalN;
                //         json['DrugN'] = tempData[i].DrugN;
                //         json['Safety'] = parseFloat(tempData[i].Safety);

                //         if (tempData[i].DrugPopulationSize == minimumSize) {
                //             json['Size'] = 40;
                //         } else if (tempData[i].DrugPopulationSize == maximumSize) {
                //             json['Size'] = 55;
                //         } else {
                //             var size = calculateSize(minimumSize, maximumSize, tempData[i].DrugPopulationSize, totalCount, previousSize);
                //             previousSize = size;
                //             json['Size'] = size;
                //         }


                //         if (selectedMadication === tempData[i].DrugName) {
                //             json['SelectedMadication'] = 'true';
                //         } else {
                //             json['SelectedMadication'] = 'false';
                //         }
                //         json['SelectSvg'] = 'SelectedMadication';
                //         json['drugNameDisplayCount'] = i;
                //         data.push(json);
                //     }
                // }

                // //sort the efficacy data in descending order
                // efficacyData.sort(function(a, b) {
                //     return parseFloat(a) - parseFloat(b);
                // });

                // // sort the chart data in descending order based on the drug cost of each drug
                // data.sort(function(a, b) {
                //     return parseFloat(a.Cost) - parseFloat(b.Cost);
                // });


                //ar data= prepareDataForNewRelativeChart(selectedMedication,rawData );
                var data = prepareDataForNewRelativeChart(e.currentTarget.attributes.madication.nodeValue, JSON.parse(localStorage.AllDrugsData));
                //set the population size to the legends
                if (document.getElementById('TotalNContainer')) {
                    document.getElementById('TotalNContainer').innerHTML = data[0].TotalN;
                }
                if (document.getElementById('TotalNContainerAll')) {
                    document.getElementById('TotalNContainerAll').innerHTML = data[0].TotalN;
                }


                let container = e.currentTarget.attributes.drugsequence.nodeValue;
                container = 'valueChart_' + container;

                //set the chart data in the session variable
                Session.set('svgData', JSON.stringify(data));
                //Commented on 08-DEC-2016 for increasing width of relative chart
                // Template.RWEBenchmark.renderSvgChartForSissionData('Cost', 'Efficacy', 500, 790);
                //Template.RWEBenchmark.renderSvgChartForSissionData('Cost', 'Efficacy', 500, 950);

                relativeValueChartData = data;
                relativeChartContainer = container;
                renderNewRelativeValueChart(container, 'Cost', 'Efficacy', 500, 950);

            }, 200);
        }
    });
}


function executeAtRender(me) {
    $('#js-nav-provider a').addClass('active');
    $('#js-nav-patient a').removeClass('active');

    $('#js-nav-payer a').removeClass('active');
    $('#js-nav-analytics a').removeClass('active');

    $('[data-toggle="popover"]').popover();
    //set the current patient data in the session variable
    Session.set("selectedPatientData", me.data.Patientdata);
    //console.log("TotalN:"+localStorage.totalSubPopulation);
    $('#patientCount').text(localStorage.totalSubPopulation);
    Pinscriptive.drugsToTab = '';
    Pinscriptive.PrevioulyAllocatedSize = 0;
    // Hide the Compare button on load
    $(".js-compare-btn").hide();

    /**
     * @author: Pramveer
     * @date: 28th Feb 17
     * @desc: Commented the function as it's definition was previously commented so this calling was throwing an error.
    */
    //setFilterHeader();


    // Get count how many drugs are selected
    $('.provider-checkbox input[type="checkbox"]').click(function() {
        //console.log("CheckBox Checked");
        if ($(".provider-checkbox [type='checkbox']:checked").length > 1) {
            // It will shows "Compare Button" after 2 or more drugs are to be selected

            $('.drug-inspection').slideUp();
            $('.js-compare-btn').show();
            $(".js-compare-btn [href]").html("Compare " + $(".provider-checkbox [type='checkbox']:checked").length + " Drugs");
            if ($(".provider-checkbox [type='checkbox']:checked").length === 2) {
                //Scroll only once when two drug selected
                $('html,body').animate({
                    scrollTop: $(".js-compare-btn").offset().top - ($(window).height() / 2)
                }, 'slow');
            };
        } else {
            // Hide the Button , if Drugs selected less then 2
            $('.js-compare-btn').hide();
            //Show popup when only one drug is selected.
            //      $('.drug-inspection').slideDown();
        }
    });
    // shoud w show APRI warrnign message if yes then hide it after 5 seconds
    if (ShowAPRIWarrning) {
        //hideAPRINotification();
    }

    //hover event for APRI icon to show/hide tooltip window for it.
    $(".APRI-icon").hover(
        function() {
            $(".apri_tooltip").css("display", "block");
        },
        function() {
            $(".apri_tooltip").css("display", "none");
        }
    );
    //load mask
    // document.getElementById("anim_loading_theme").style.top = "90%";
    // document.getElementById("anim_loading_theme").style.visibility = "visible";
    // document.getElementById("overlay").style.display = "block";
    //Adding Selected attribute in Sorting Combo
    var SortingColumn = localStorage.getItem('SortDrugsBy');

    // Sort high to low
    // console.log("***SortingColumn");
    //console.log(SortingColumn);
    //Reduced 10 line of code to one line by improving logic
    if (SortingColumn != '') {
        $('.SortDrugPageBy').val(SortingColumn).attr("selected");
    }


    //Auto checked selected drugs in drug page
    var selcDrugs = localStorage.selectedDrugs && JSON.parse(localStorage.selectedDrugs) ? JSON.parse(localStorage.selectedDrugs) : [];
    for (var l = 0; l < selcDrugs.length; l++) {
        //Need to improve logic for auto checked checkbox from last selected drugs
        $(".provider-checkbox input:checkbox[value='" + selcDrugs[l] + "']").attr("checked", true);
    }
    // Shows "Compare Button" after 2 or more drugs are to be selected
    if ($(".provider-checkbox [type='checkbox']:checked").length > 1) {

        $('.js-compare-btn').show();
        $(".js-compare-btn [href]").html("Compare " + $(".provider-checkbox [type='checkbox']:checked").length + " Drugs");
        //No Need to scroo at compare drugs when page first render
        // 		$('html,body').animate({
        //     scrollTop: $(".js-compare-btn").offset().top - ($(window).height() / 2)
        // }, 'slow');
    }

    me.Patientdata = me.data.Patientdata;


    // Activate the mobile version menu
    // it includes left menu , right menu
    // var menuLeft = document.getElementById('cbp-spmenu-s1'),
    //     menuRight = document.getElementById('cbp-spmenu-s2'),
    //     showLeftPush = document.getElementById('showLeftPush'),
    //     showRightPush = document.getElementById('showRightPush'),
    //     body = document.body;
    //
    // showLeftPush.onclick = function() {
    //     classie.toggle(this, 'active');
    //     classie.toggle(body, 'cbp-spmenu-push-toright');
    //     classie.toggle(menuLeft, 'cbp-spmenu-open');
    //     disableOther('showLeftPush');
    // };
    // showRightPush.onclick = function() {
    //     classie.toggle(this, 'active');
    //     classie.toggle(body, 'cbp-spmenu-push-toleft');
    //     classie.toggle(menuRight, 'cbp-spmenu-open');
    //     disableOther('showRightPush');
    // };
    //
    // function disableOther(button) {
    //     if (button !== 'showLeftPush') {
    //         classie.toggle(showLeftPush, 'disabled');
    //     }
    //     if (button !== 'showRightPush') {
    //         classie.toggle(showRightPush, 'disabled');
    //     }
    // }

    // // Toggle the Search textbox on mobile verion
    // $("#searchtoggle").click(function() {
    //     $("#searchform").slideToggle("slow");
    // });
    //
    // //iCheck for checkbox and radio inputs
    // $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
    //     checkboxClass: 'icheckbox_minimal-blue',
    //     radioClass: 'iradio_minimal-blue'
    // });
    // //Red color scheme for iCheck
    // $('input[type="checkbox"].minimal-red, input[type="radio"].minimal-red').iCheck({
    //     checkboxClass: 'icheckbox_minimal-red',
    //     radioClass: 'iradio_minimal-red'
    // });
    // //Flat red color scheme for iCheck
    // $('input[type="checkbox"].flat-red, input[type="radio"].flat-red').iCheck({
    //     checkboxClass: 'icheckbox_flat-green',
    //     radioClass: 'iradio_flat-green'
    // });

    popoverRender();

    //Display Clinician response based on selection of drugs
    // Do not clear selected drugs when user comews from efficacy and other related tab
    //Clear selectedDrugs when drug page rendered
    //localStorage.selectedDrugs = JSON.stringify([]);
    // Visible the "PA Request" Button on not preffered drug selection and it only visible when only one drug is checked.
    $("input:checkbox").on("change", function() {
        //  console.log("CheckBox Changed");
        $(".count").text($("[type='checkbox']:checked").length);
        if ($(this).closest("h2").attr("class") === "uninsured-drugs" && this.checked && $("[type='checkbox']:checked").length === 1) {
            $(this).closest(".row").next(".row:first").children(":first").html("<input type='button' style='margin-top: 16px;margin-left: -11px;' class='btn btn-default graybtn btn-pa-request'  value='PA Request' />");

            var a = (($('#navbar-collapse').width()) / (($(".nav.navbar-nav").children().length)));
            $('.nav.navbar-nav li').css('width', String(a));
            $("#disnone").show();
            $('#pa-link-mob').show();
        } else {
            $(this).closest(".row").next(".row:first").children(":first").html("");
            //Remove PA Request button if more than one drug is selected
            $('.btn-pa-request').remove();
            $("#disnone").hide();
            $('#pa-link-mob').hide();
            var b = (($('#navbar-collapse').width()) / (($(".nav.navbar-nav").children().length - 1)));
            $('.nav.navbar-nav li').css('width', String(b));

            //$( "input[value='Hot Fuzz']" )
        }
        if ($(this).is(':checked')) {
            drugsToTab.push($(this).val());
        } else {
            drugsToTab.pop($(this).val());
        }
    });

    ///// Dynamic fuel gauge binding

    // For drugs paging
    //$('.page2').hide();
    $('.paginationDrugs .pdl-list').each(function(d) {
        if ($(this).hasClass('page1') == true) {
            $(this).show();
        } else {
            $(this).hide();
        }
        //console.log($(this).html());
    });

     // initilize Relative weights Dropdown.
    initWeightsAccordian();

    // Initializing Range Sliders.
    $('input[type=range]').rangeslider({
        polyfill: false
    });
    // Assign cahnfe event on the weight sliders to update the selected value.
    $(document).on('input', '.WeightSliderDiv input[type="range"]', function(e) {
        var output = $(e.currentTarget).next().next();
        output.html(e.currentTarget.value + "%");
    });

    if(localStorage.getItem('provider_relative_weights')){
        let relativeWeights = JSON.parse(localStorage.getItem('provider_relative_weights'));
        updateRelativeWeightsSliders(relativeWeights);
    }
}

//Draw RWEBenchmark Tab score chart
function drawCircle() {
    $('.pdl-chart .bubble').html('');
    var allCharts = $('.pdl-chart .bubble');
    //console.log(allCharts.length);
    //var el = document.getElementById(allCharts)[0];
    var el = allCharts[0];

    for (var i = 0; i < allCharts.length; i++) {
        var el = allCharts[i];

        var options = {
            percent: el.getAttribute('data-percent') || 25,
            size: el.getAttribute('data-size') || 220,
            lineWidth: el.getAttribute('data-line') || 20,
            rotate: el.getAttribute('data-rotate') || 0
        }


        var canvas = document.createElement('canvas');
        var span = document.createElement('span');
        span.textContent = parseFloat(options.percent).toFixed(0) + '%';

        if (typeof(G_vmlCanvasManager) !== 'undefined') {
            G_vmlCanvasManager.initElement(canvas);
        }

        var ctx = canvas.getContext('2d');
        canvas.width = canvas.height = options.size;

        el.appendChild(span);
        el.appendChild(canvas);

        ctx.translate(options.size / 2, options.size / 2); // change center
        ctx.rotate((-1 / 2 + options.rotate / 180) * Math.PI); // rotate -90 deg

        //imd = ctx.getImageData(0, 0, 240, 240);
        var radius = (options.size - options.lineWidth) / 2;

        var drawCircle = function(color, lineWidth, percent) {
            percent = Math.min(Math.max(0, percent || 1), 1);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false);
            ctx.strokeStyle = color;
            ctx.lineCap = 'round'; // butt, round or square
            ctx.lineWidth = lineWidth
            ctx.stroke();
        };

        drawCircle('#efefef', options.lineWidth, 100 / 100);
        drawCircle('#555555', options.lineWidth, options.percent / 100);

    }
}

Template.RWEBenchmark.getDataForRiskSections = function(obj) {
    var drug = $(obj).attr('drug');
    var sectionName = $(obj).attr('section');

    var setID = AllDrugs.filter(function(record) {
        return record.name.toLowerCase() === drug.toLowerCase();

    });

    var iframeStyle = 'div { font-size: 14px;color: #444;} .lr-hr-moreInfo {background-color: #fff;border: 1px solid #ef4722;border-radius: 2px;color: #ef4722;text-transform: uppercase;width: 150px;padding: 3px;display:block;text-align: center;margin-top: 5px;font-weight:600;text-decoration:none;}';
    var clickEvent = '';
    setID = setID[0].setId;
    $(obj).contents().find('head')
        .append($('<style type="text/css">' + iframeStyle + '</style>'));

    getSafetyRiskInfo(setID, {
        sectionName: sectionName,
        frameObj: obj
    });

}

showDrugToastMessage = function(drugName) {
    //text: `Will <strong>${drugName}</strong> be prescribed for this Patient? <a href="#" class="pro-que-btn" id="btnCaptureResponse">yes</a> `,
    $.toast({
        heading: 'Drug Prescription',
        text: `Will <strong>${drugName}</strong> be prescribed for this Patient? <a href="#" class="pro-que-btn" id="btnCaptureResponse1">yes</a> `,
        icon: 'info',
        loader: false,
        preventDuplicates: true,
        allowToastClose: true, // Show the close button or not
        hideAfter: false,
        //	 positionClass: "toast-top-right",
        position: {
            right: 120,
            top: 400
        },
        loaderBg: '#9EC600'
    });
};


/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 * reference :https://codepen.io/gapcode/pen/vEJNZN
 */
function detectIE() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function renderNewRelativeValueChart(container, xData, yData, height, width) {
    let dataObj = {
        data: relativeValueChartData,
        axis: {
            x: xData,
            y: yData
        },
        sizeParams: {
            svgHeight: height,
            svgWidth: width
        }
    };

    container = relativeChartContainer ? relativeChartContainer : container;

    $('#' + container).empty();
    //render the template in the UI from /imports/client/components/graph/relativeValue/relativeValue.html
    UI.renderWithData(Template.RelativeValueChart, dataObj, $('#' + container)[0]);
}

Template.RWEBenchmark.renderNewRelativeValueChart = function(xData, yData, height, width) {


    let dataObj = {
        data: prepareDataForNewRelativeChart('', JSON.parse(Session.get('svgData'))),
        isSmallChart: true,
        axis: {
            x: xData,
            y: yData
        },
        sizeParams: {
            svgHeight: height,
            svgWidth: width
        }
    };

    //  container = relativeChartContainer ? relativeChartContainer : container;


    var container = 'dimpleMapsContainer';

    $('.' + container).empty();
    //render the template in the UI from /imports/client/components/graph/relativeValue/relativeValue.html
    UI.renderWithData(Template.PayerRelativeValueChart, dataObj, $('.' + container)[0]);
}

//function to get Abbr from Full Name
function getDrugAbbr(drugName) {
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







// function setFilterHeader() {
//
//     var params = Pinscriptive['Filters'];
//     if (params != null) {
//         $('#desc_cirrhosis').show();
//         $('#desc_cirrhosis').find('.efd-cell2_subpopulaiton').html(params['cirrhosis'] != null ? params['cirrhosis'].replace(/'/g, '').toString() : 'ALL');
//         $('#desc_treatment').show();
//         $('#desc_treatment').find('.efd-cell2_subpopulaiton').html(params['treatment'] != null ? params['treatment'].replace(/'/g, '').toString() : 'ALL');
//         $('#desc_genotype').show();
//         $('#desc_genotype').find('.efd-cell2_subpopulaiton').html(params['genotypes'] != null ? params['genotypes'].replace(/'/g, '').toString() : 'ALL');
//         $('#patient-pager').show();
//         $("#desc_patient_count").show();
//         $("#filter_desc").show();
//
//         if (params['hiv'] != null) {
//             $('#desc_hiv').show();
//             $('#desc_hiv').find('.efd-cell2_subpopulaiton').html(params['hiv'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_hiv').hide();
//             $('#desc_hiv').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['mental_health'] != null) {
//             $('#desc_mentalhealth').show();
//             $('#desc_mentalhealth').find('.efd-cell2_subpopulaiton').html(params['mental_health'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_mentalhealth').hide();
//             $('#desc_mentalhealth').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['renal_failure'] != null) {
//             $('#desc_renalfailure').show();
//             $('#desc_renalfailure').find('.efd-cell2_subpopulaiton').html(params['renal_failure'].replace(/'/g, ''));
//         } else {
//             $('#desc_renalfailure').hide();
//             $('#desc_renalfailure').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['liver_assesment'] != null) {
//             $('#desc_liverassessment').show();
//             $('#desc_liverassessment').find('.efd-cell2_subpopulaiton').html(params['liver_assesment'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_liverassessment').hide();
//             $('#desc_liverassessment').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['fibrosure'] != null) {
//             $('#desc_fibrosure').show();
//             $('#desc_fibrosure').find('.efd-cell2_subpopulaiton').html(params['fibrosure'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_fibrosure').hide();
//             $('#desc_fibrosure').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['liverBiopsy'] != null) {
//             $('#desc_liverbiopsy').show();
//             $('#desc_liverbiopsy').find('.efd-cell2_subpopulaiton').html(params['liverBiopsy'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_liverbiopsy').hide();
//             $('#desc_liverbiopsy').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['fibroscan'] != null) {
//             $('#desc_fibroscan').show();
//             $('#desc_fibroscan').find('.efd-cell2_subpopulaiton').html(params['fibroscan'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_fibroscan').hide();
//             $('#desc_fibroscan').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['hcc'] != null) {
//             $('#desc_hcc').show();
//             $('#desc_hcc').find('.efd-cell2_subpopulaiton').html(params['hcc'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_hcc').hide();
//             $('#desc_hcc').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['chemistry'] != null) {
//             $('#desc_chemistry').show();
//             $('#desc_chemistry').find('.efd-cell2_subpopulaiton').html(params['chemistry'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_chemistry').hide();
//             $('#desc_chemistry').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['alcohol'] != null) {
//             $('#desc_alcohol').show();
//             $('#desc_alcohol').find('.efd-cell2_subpopulaiton').html(params['alcohol'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_alcohol').hide();
//             $('#desc_alcohol').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['age'] != null) {
//             $('#desc_age').show();
//             $('#desc_age').find('.efd-cell2_subpopulaiton').html(params['age'].toString());
//         } else {
//             $('#desc_age').hide();
//             $('#desc_age').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['ethnicity'] != null) {
//             $('#desc_ethnicity').show();
//             $('#desc_ethnicity').find('.efd-cell2_subpopulaiton').html(params['ethnicity'].replace(/'/g, '').toString());
//         } else {
//             $('#desc_ethnicity').hide();
//             $('#desc_ethnicity').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['meld'] != null) {
//             $('#desc_meldscore').show();
//             $('#desc_meldscore').find('.efd-cell2_subpopulaiton').html(params['meld'].toString());
//         } else {
//             $('#desc_meldscore').hide();
//             $('#desc_meldscore').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['etoh'] != null) {
//             $('#desc_etoh').show();
//             $('#desc_etoh').find('.efd-cell2_subpopulaiton').html(params['etoh'].toString());
//         } else {
//             $('#desc_etoh').hide();
//             $('#desc_etoh').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['weight'] != null) {
//             $('#desc_weight').show();
//             $('#desc_weight').find('.efd-cell2_subpopulaiton').html(params['weight'].toString());
//         } else {
//             $('#desc_weight').hide();
//             $('#desc_weight').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['viralLoad'] != null) {
//             $('#desc_virallaod').show();
//             $('#desc_virallaod').find('.efd-cell2_subpopulaiton').html(params['viralLoad'].toString());
//         } else {
//             $('#desc_virallaod').hide();
//             $('#desc_virallaod').find('.efd-cell2_subpopulaiton').html('');
//         }
//         if (params['apri'] != null) {
//             $('#desc_apri').show();
//             $('#desc_apri').find('.efd-cell2_subpopulaiton').html(params['apri'].toString());
//         } else {
//             $('#desc_apri').hide();
//             $('#desc_apri').find('.efd-cell2_subpopulaiton').html('');
//         }
//
//     }
//
// }

//Single Method for preparing Relative value chart json data
function prepareDataForNewRelativeChart(selectedMadication, rawData) {
    // var selectedMadication = e.currentTarget.attributes.madication.nodeValue;
    var data = [];
    //Commented dependable drugData value fro value score chart which is repeatitive and lengthy
    // var tempData = jQuery.parseJSON(e.currentTarget.attributes.drugData.nodeValue);
    var tempData = rawData;
    // Sort by Value low to high
    tempData.sort(function(a, b) {
        return parseFloat(a.DrugPopulationSize) - parseFloat(b.DrugPopulationSize);
    });

    //set min & max size for bubbles as per their data size. but now this dynamic sizing appraoch is not used.
    var minimumSize = tempData[0].DrugPopulationSize;
    var totalCount = tempData.length;
    var maximumSize = tempData[totalCount - 1].DrugPopulationSize;
    var previousSize = 28;

    var efficacyData = [];
    //if the tempData array has some value
    if (tempData.length > 0) {
        for (var i = 0; i < tempData.length; i++) {
            var json = {};
            //check for NaN case for Adherence
            if (tempData[i].Adherence.Adherence == 'NaN') {
                json['Adherence'] = 55;
            } else {
                json['Adherence'] = parseFloat(tempData[i].Adherence.Adherence);
            }
            json['Cost'] = parseInt(tempData[i].Cost.TotalCost / 1000);
            /**
             *  Modified: Arvind 10-Feb-2017
             * Issue :relative value chart is breaking when we click small chart
             *  Solution :Internal reference from provider.js file line no : 4358,
             *  Due to this line of code relative value chart is breaking in Pharma tab.
             */

            //check for relative value chart when cost is < 1000 (in order to show it in K)
            json['Cost1'] = tempData[i].Cost.TotalCost;
            //// Modified end
            //check for NaN case for Efficacy
            if (tempData[i].Efficacy.Efficacy == 'NaN') {
                json['Efficacy'] = 0;
            } else {
                json['Efficacy'] = parseFloat(tempData[i].Efficacy.Efficacy);
            }

            //if Efficacy is less or equal to 50 then slightly shift its plotting position on the chart
            if (tempData[i].Efficacy.Efficacy <= 50) {
                json['EfficacyPlot'] = 60;
                efficacyData.push(60);
            }
            //if Efficacy is greater or equal 100 then restrict its plotting to max 100 only
            else if (tempData[i].Efficacy.Efficacy >= 100) {
                json['EfficacyPlot'] = 100;
                efficacyData.push(100);
            } else {
                json['EfficacyPlot'] = parseFloat(tempData[i].Efficacy.Efficacy);
                efficacyData.push(parseFloat(tempData[i].Efficacy.Efficacy));
            }
            json['Madication'] = tempData[i].DrugName;
            json['Utilization'] = tempData[i].Utilization.Utilization;
            json['TotalN'] = tempData[i].TotalN;
            json['DrugN'] = tempData[i].DrugN;
            json['Safety'] = parseFloat(tempData[i].Safety);

            if (tempData[i].DrugPopulationSize == minimumSize) {
                json['Size'] = 40;
            } else if (tempData[i].DrugPopulationSize == maximumSize) {
                json['Size'] = 55;
            } else {
                var size = calculateSize(minimumSize, maximumSize, tempData[i].DrugPopulationSize, totalCount, previousSize);
                previousSize = size;
                json['Size'] = size;
            }


            if (selectedMadication === tempData[i].DrugName) {
                json['SelectedMadication'] = 'true';
            } else {
                json['SelectedMadication'] = 'false';
            }
            json['SelectSvg'] = 'SelectedMadication';
            json['drugNameDisplayCount'] = i;
            data.push(json);
        }
    }

    //sort the efficacy data in descending order
    efficacyData.sort(function(a, b) {
        return parseFloat(a) - parseFloat(b);
    });

    // sort the chart data in descending order based on the drug cost of each drug
    data.sort(function(a, b) {
        return parseFloat(a.Cost) - parseFloat(b.Cost);
    });
    return data;

}


function renderAfterSorting() {
    let subtab = Session.get('rwebenchmark_subtab');
    if (subtab) {
        if (subtab == "withFDACompliant") {
            $('.withFDACompliant').addClass('active').siblings().removeClass('active');
        } else if (subtab == "withoutFDACompliant") {
            $('.withoutFDACompliant').addClass('active').siblings().removeClass('active');
        } else {
            $('.allMedsData').addClass('active').siblings().removeClass('active');
        }
    } else {
        $('.withFDACompliant').addClass('active').siblings().removeClass('active');
    }
}


// Drug Scores

// Weights Acoordian
function initWeightsAccordian(){
    let acc = document.getElementsByClassName("weightsAccordion");
    let i;

    for (i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight){
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + 50 + "px";
            } 
        }
    }
}


function updateRelativeWeightsSliders(weights) {

    $('#txtEffWeight_Provider').val(weights.efficacy);
    $('#txtAdhWeight_Provider').val(weights.adherence);
    $('#txtCostWeight_Provider').val(weights.cost);

    $('#txtEffWeight_Provider').rangeslider('update', true);
    $('#txtAdhWeight_Provider').rangeslider('update', true);
    $('#txtCostWeight_Provider').rangeslider('update', true);


    var output = $('#txtEffWeight_Provider').next().next();
    output.html(weights.efficacy + "%");
    var output = $('#txtAdhWeight_Provider').next().next();
    output.html(weights.adherence + "%");
    var output = $('#txtCostWeight_Provider').next().next();
    output.html(weights.cost + "%");
}