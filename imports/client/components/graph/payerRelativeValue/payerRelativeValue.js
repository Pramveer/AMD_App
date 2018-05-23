import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import './payerRelativeValue.html';

let colorArray = ['#9ec8f2', '#2aaaf7', '#4ea6ca', '#c0983b', '#cc9529', '#e08a08', '#dc7d02', '#bf6807', '#4b2c48', '#301f58', '#251a5e'];
let generatedDynamicId, isSmallChart, relativeData, isFilteredChart;
Template.PayerRelativeValueChart.onCreated(function() {
    // set unique number which will be used for entire template to identify control
    generatedDynamicId = new Date().getTime()
});

Template.PayerRelativeValueChart.helpers({
    'generateDynamicId': function() {
        return generatedDynamicId;
    }
});

Template.PayerRelativeValueChart.rendered = function() {
    let dataObj = this.data;
    // Here we have store data result to local variable relativeData,
    // this will use to refresh chart based on X-Axis, Y-Axis dropdown 
    relativeData = dataObj;
    renderRelativeValueChart(dataObj);
}

Template.PayerRelativeValueChart.events({
    'change .changeYAxis': function(e) {
        // Refresh or re-render chart based on Y-Axis new value
        relativeData.axis.y = e.target.value;
        renderRelativeValueChart(relativeData);
    },
    'change .changeXAxis': function(e) {
        // Refresh or re-render chart based on X-Axis new value

        relativeData.axis.x = e.target.value;
        renderRelativeValueChart(relativeData);
    }
})

function renderRelativeValueChart(dataObj) {
    console.log("*** renderRelativeValueChart ****");

    //** NEED TO CONSIDER THIS PROPERTY for Small relative or large relative chart;
    isSmallChart = dataObj.isSmallChart;
    // ** NEED TO CONSIDER THIS PROPERTY for small comparative chart to display only top 10 drugs
    isFilteredChart = dataObj.isFilteredChart;


    let xOffset = 55,
        xChartOffset = 55,
        yChartOffset = 60,
        canvasHeight = dataObj.sizeParams.svgHeight ? dataObj.sizeParams.svgHeight : 500,
        canvasWidth = dataObj.sizeParams.svgWidth ? dataObj.sizeParams.svgWidth : 900,
        xAxisData = dataObj.axis.x ? dataObj.axis.x : 'Cost',
        yAxisData = dataObj.axis.y ? dataObj.axis.y : 'Efficacy',
        dataArray = insertColorByUtilization({ dataArray: dataObj.data, isFilteredChart: isFilteredChart });

    let chartData = getRangeForChart(xAxisData, yAxisData, xChartOffset, yChartOffset, canvasHeight, canvasWidth, dataArray);

    // Display top 10 records based on utilization in small relative chart for filteredFlag
    //if (isSmallChart) {
    if (isFilteredChart) {
        chartData.sort(function(a, b) {
            return parseFloat(a.DrugInfo.Utilization) - parseFloat(b.DrugInfo.Utilization);
        });
        //chartData = _.first(chartData, 10);
    }

    let xMaxVal = chartData[0]['xMax'],
        xMinVal = chartData[0]['xMin'],
        yMaxVal = chartData[0]['yMax'],
        yMinVal = chartData[0]['yMin'],
        currPatientId = Router.PatientId;

    let isXReversed, isYReversed;
    isXReversed = xAxisData == 'Cost' ? true : false;
    isYReversed = yAxisData == 'Cost' ? true : false;

    let x = 0,
        y = 0;
    if (isSmallChart) {
        x = -20;
        y = 0;
    } else {
        x = -180;
        y = 0;
    }

    // For Initialize highchart
    //Highcharts.chart('ID Selector',{});
    Highcharts.chart('relativeValue-chartSection-' + generatedDynamicId, {
            // options - see http://api.highcharts.com/highcharts

            chart: {
                type: 'bubble',
                height: isSmallChart ? canvasHeight : (canvasHeight - 50),
                width: canvasWidth,
                plotBorderWidth: 0,
                zoomType: 'xy',
                resetZoomButton: {
                    position: {
                        align: 'right',
                        verticalAlign: 'top',
                        x: x,
                        y: y
                    },
                    relativeTo: 'chart'
                },
                panning: isSmallChart ? false : true,
                panKey: 'shift'
            },

            credits: {
                enabled: false
            },

            exporting: {
                enabled: false
            },

            legend: {
                enabled: false
            },

            title: {
                text: ''
            },

            subtitle: {
                text: isSmallChart ? '' : 'Click and drag to zoom in. Hold down shift key to pan'
            },

            xAxis: {

                // gridLineWidth: 1,
                //tickPositions: [xMinVal,xMaxVal],
                reversed: isXReversed,
                title: {
                    text: isSmallChart ? `${xAxisData}` : `<div class="relativeValue-ChartLabels">Rx ${xAxisData}</div>`
                },
                labels: {
                    enabled: false,
                    /*format: xAxisData == 'Cost' ? '{value} K' : '{value} %' ,
                    formatter: function () {
                        var label = this.axis.defaultLabelFormatter.call(this);
                        console.log(this);
                        console.log(label);
                    }*/
                },
                tickLength: 0,
                gridLineWidth: 0,
                crosshair: {
                    //dashStyle: 'solid',
                    width: 2,
                    // color: '#ef4823',
                    dashStyle: 'ShortDot'
                }
            },

            yAxis: {
                // startOnTick: false,
                // endOnTick: true,
                //tickPositions: [yMinVal,yMaxVal],
                reversed: isYReversed,
                title: {
                    text: isSmallChart ? `${yAxisData}` : `<div class="relativeValue-ChartLabels">Rx ${yAxisData}</div>`
                },
                labels: {
                    enabled: false,
                    // format: yAxisData == 'Cost' ? '{value} K' : '{value} %'
                },
                lineWidth: 1,
                // minorGridLineWidth: 0,
                // lineColor: 'transparent',
                // minorTickLength: 0,
                // tickLength: 0,
                //gridLineColor: 'transparent'
                //updated for y axis upper distance issue.
                // maxPadding: 0.2,
                gridLineWidth: 0,
                crosshair: {
                    //dashStyle: 'solid',
                    width: 2,
                    //     color: '#ef4823',
                    dashStyle: 'ShortDot'
                }
            },

            tooltip: {

                useHTML: true,
                headerFormat: '<div class="relativeValueChartTooltip">',
                pointFormat: `<div class="relativeValueChartTooltip-Body">
                            <div class="tooltip-DrugName">{point.DrugInfo.Madication}</div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Adherence: </div>
                                    <div class="col-md-6 tooltip-SectionValue">{point.DrugInfo.Adherence}%</div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Efficacy: </div>
                                    <div class="col-md-6 tooltip-SectionValue">{point.DrugInfo.Efficacy}%</div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Utilization: </div>
                                    <div class="col-md-6 tooltip-SectionValue">{point.DrugInfo.Utilization}% </div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">N</div>
                                    <div class="col-md-6 tooltip-SectionValue">
                                        {point.DrugInfo.DrugN}
                                        <span style="color:#666666;font-size:15px;font-weight:bold;">/</span>
                                        {point.DrugInfo.TotalN}
                                    </div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Cost</div>
                                    <div class="col-md-6 tooltip-SectionValue">$ {point.DrugInfo.Cost}K</div>
                                </div>
                            <div>`,
                footerFormat: '</div>',
                followPointer: false,
                hideDelay: 30
            },

            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.DrugInfo.abbr}'
                    }
                },
                bubble: {
                    minSize: isSmallChart ? 20 : 40,
                    maxSize: isSmallChart ? 40 : 100,
                    /*marker: {
                    	lineWidth:2,
                        lineColor:  '#fff200',
                    }*/
                }
            },
            series: [{
                data: chartData
            }]
        },
        function(chart) {
            plotTheOuterRing(chart);
        });


    //append the Axis values
    let axisObj = {
        xMin: xMinVal,
        xMax: xMaxVal,
        yMin: yMinVal,
        yMax: yMaxVal,
        xAxis: xAxisData,
        yAxis: yAxisData
    };
    //Show Axis Label if Relative chart is Big
    if (!isSmallChart) {
        $('#payer-relative-right-section-' + generatedDynamicId).show();
        appendAxisValues(axisObj);
        if (document.getElementById('TotalNContainer-' + generatedDynamicId)) {
            document.getElementById('TotalNContainer-' + generatedDynamicId).innerHTML = chartData[0].DrugInfo.TotalN;
        }
        // if (document.getElementById('TotalNContainerAll-' + generatedDynamicId)) {
        //     document.getElementById('TotalNContainerAll-' + generatedDynamicId).innerHTML = chartData[0].DrugInfo.TotalN;
        // }
        //set rightside sub population info as per selection
        // console.log(dataObj);

        setSubPopulationInfo(dataObj.subPopulationInfo);

        if (dataObj.subPopulationInfo && dataObj.subPopulationInfo.TotalN) {
            if (document.getElementById('TotalNContainer-' + generatedDynamicId)) {
                document.getElementById('TotalNContainer-' + generatedDynamicId).innerHTML = dataObj.subPopulationInfo.TotalN;
            }
        }
    }



    function plotTheOuterRing(chartObj) {
        $.each(chartObj.series, function(i, serie) {

            $.each(serie.data, function(j, point) {
                point.update({
                    marker: {
                        lineColor: point.options.DrugInfo.SelectedMadication == 'true' ? '#fff200' : '',
                        lineWidth: point.options.DrugInfo.SelectedMadication == 'true' ? 4 : 0,
                        fillColor: point.options.DrugInfo.bubbleColor,
                        states: {
                            hover: {
                                lineWidth: point.options.DrugInfo.SelectedMadication == 'true' ? 5 : 0,
                                lineColor: point.options.DrugInfo.SelectedMadication == 'true' ? '#fff200' : ''
                            }
                        }
                    }
                }, false);
            });
            chartObj.redraw();
        });
    }

}

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
    //console.log(medianX);
    var medianY = calculateMedian(tempArrayY);
    // console.log(medianY);
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


    // // adjust the max & min values for offset for x-axis
    // if (xData === 'Cost') {
    //     xMax = xMax + xBoundaryValOffset;
    // } else {
    //     xMin = xMin - xBoundaryValOffset;
    //     if (xMin < 0)
    //         xMin = 0;
    //     /*if(xMax >100)
    //             xMax =100;*/
    // }

    // // adjust the max & min values for offset for y-axis
    // if (yData === 'Cost') {
    //     yMax = yMax + yBoundaryValOffset;
    // } else {
    //     yMin = yMin - yBoundaryValOffset;
    //     if (yMin < 0)
    //         yMin = 0;
    //     /*if(yMax >100)
    //         yMax =100;*/
    // }
    //commented for resolve reverse issue.
    xMin = xMin - xBoundaryValOffset;
    if (xMin < 0)
        xMin = 0;

    yMin = yMin - yBoundaryValOffset;
    if (yMin < 0)
        yMin = 0;


    // compute the pixels for the chart
    var xStepPixel = (chartWidth) / (xMax - xMin);
    var yStepPixel = (chartHeight) / (yMax - yMin);

    var chartJson = [];

    // bubble sizing implementation
    let drugsArray = jQuery.extend(true, [], allDrugs);
    drugsArray = drugsArray.sort((a, b) => {
        return parseFloat(a.Utilization) - parseFloat(b.Utilization)
    });

    let drugCount = drugsArray.length,
        maxUti = parseFloat(drugsArray[drugCount - 1]['Utilization']),
        minUti = parseFloat(drugsArray[0]['Utilization']);

    let minBubSize = 11,
        stepPixel = Math.abs((minUti + maxUti) / 10);

    // compute the (x,y) coordinates for each chart
    for (var i = 0; i < allDrugs.length; i++) {
        var data = {};
        var xPosition = 0;
        var yPosition = 0;

        // // check if X axis represent cost
        // if (xData === 'Cost') {
        //     xPosition = xStepPixel * (xMax - xDataValues[i]);
        // } else {
        //     xPosition = xStepPixel * (xDataValues[i] - xMin);
        // }

        // // check if Y axis represent cost
        // if (yData === 'Cost') {
        //     yPosition = yStepPixel * (yMax - yDataValues[i]);
        // } else {
        //     yPosition = yStepPixel * (yDataValues[i] - yMin);
        // }

        // xPosition = xStepPixel * (xDataValues[i] - xMin);
        // yPosition = yStepPixel * (yDataValues[i] - yMin);
        xPosition = xDataValues[i];
        yPosition = yDataValues[i];
        // xPosition = xPosition + xChartOffset;
        // yPosition = yPosition + yChartOffset;
        // commented for resolve reverse issue
        // xPosition = xPosition + xChartOffset;
        // yPosition = cnvasHeight - (yPosition + xChartOffset);

        data['DrugInfo'] = allDrugs[i];
        // commented Abbr in Small chart
        //data['DrugInfo']['abbr'] = getDrugAbbr(allDrugs[i]['Madication']);

        //// Display Abbr in Large chart and hide in small chart
        data['DrugInfo']['abbr'] = isSmallChart ? '' : getDrugAbbr(allDrugs[i]['Madication']);
        data['x'] = xPosition;
        data['y'] = yPosition;
        data['z'] = minBubSize + (parseFloat(allDrugs[i]['Utilization']) * stepPixel); //size of bubble in highcharts
        data['xMax'] = xMax;
        data['xMin'] = xMin;
        data['yMax'] = yMax;
        data['yMin'] = yMin;
        chartJson.push(data);
    }
    return chartJson;

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

//function to calculate the median
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

/**
 * Description: Function to calculate bubble color dynamically based on utilization value
 */
function insertColorByUtilization({ dataArray, isFilteredChart }) {
    dataArray = dataArray.sort((a, b) => {
        return parseFloat(a.Utilization) - parseFloat(b.Utilization)
    });
    // commented as this logic not working as expected for top 10 drug utilization
    //Generate color for only Top 10 Drugs by utilization based on @isFilteredChart param value
    if (isFilteredChart) {
        dataArray = dataArray.reverse();
        //dataArray = _.first(dataArray, 10);
        //console.log("*** PAYER BUBBLE COUNT :dataArray" + dataArray.length);
        //console.log(dataArray);
    }
    let utilizationArray = _.map(dataArray, function(s) { return parseFloat(s.Utilization); });
    let minUtilization = utilizationArray[0],
        maxUtilization = utilizationArray[utilizationArray.length - 1],
        medianUtilization = MeanValue(utilizationArray);

    // console.log("Min:" + minUtilization);
    // console.log("Mean:" + medianUtilization);
    // console.log("Max:" + maxUtilization);
    // console.log("**insertColorByUtilization ***");

    // let MinColor = '#30A9EF',
    //     MediumColor = '#E18703',
    //     MaxColor = '#342156';

    //// RGB object for starting and ending value for gradient color , Here we have three range
    let MinColor = { r: 48, g: 169, b: 239 },
        MediumColor = { r: 225, g: 135, b: 3 },
        MaxColor = { r: 52, g: 33, b: 86 };
    // console.log(dataArray);

    let finalData = [],
        drugCount = dataArray.length,
        colorAssign = colorArray.length / drugCount;

    colorAssign = colorArray.length <= drugCount ? 1 : colorAssign;
    let bubbleColor = '#7cb5ec';
    //console.log("=====utilizationArray=====");
    //console.log(utilizationArray);
    for (let i = 0; i < dataArray.length; i++) {
        let json = _.clone(dataArray[i]),
            colorIndex = parseInt(colorAssign * i);
        // console.log(colorArray[colorIndex]);
        //backup for dynamic color
        //  json['bubbleColor'] = colorArray[colorIndex] ? colorArray[colorIndex] : '#7cb5ec';

        //// Condition for select color start and end color for gradient based on utilization value compare with median Utilization
        if (utilizationArray[i] < medianUtilization) {
            // console.log("Min and Median");
            bubbleColor = makeGradientColor(MinColor, MediumColor, utilizationArray[i]);
        } else {
            //  console.log("MAX and Median");
            bubbleColor = makeGradientColor(MediumColor, MaxColor, utilizationArray[i]);
        }
        //// Then set color which is generated based on above caclulation
        // console.log(bubbleColor.cssColor);
        json['bubbleColor'] = bubbleColor.cssColor;
        json['Adherence'] = parseFloat(json['Adherence']).toFixed(0);
        finalData.push(json);
    }

    return finalData;
}


function appendAxisValues(axisObj) {

    //  $('.x-AxisValuesWrap').css('width', $('#relativeValue-chartSection-' + generatedDynamicId).width());

    if (axisObj.xAxis == 'Cost') {
        $('#x-AxisMinVal-' + generatedDynamicId).html(axisObj.xMax + 'K');
        $('#x-AxisMaxVal-' + generatedDynamicId).html(axisObj.xMin + 'K');
    } else {
        $('#x-AxisMinVal-' + generatedDynamicId).html(axisObj.xMin + '%');
        $('#x-AxisMaxVal-' + generatedDynamicId).html(axisObj.xMax + '%');
    }

    if (axisObj.yAxis == 'Cost') {
        $('#y-AxisMinVal-' + generatedDynamicId).html(axisObj.yMax + 'K');
        $('#y-AxisMaxVal-' + generatedDynamicId).html(axisObj.yMin + 'K');
    } else {
        $('#y-AxisMinVal-' + generatedDynamicId).html(axisObj.yMin + '%');
        $('#y-AxisMaxVal-' + generatedDynamicId).html(axisObj.yMax + '%');
    }
}

function setSubPopulationInfo(subPopulationInfo) {
    var params = subPopulationInfo ? subPopulationInfo : AmdApp['Filters'];
    $('.relativeValueChart_Genotype').html(params['genotypes'] != null ? params['genotypes'].replace(/'/g, '').toString() : 'ALL');
    $('.relativeValueChart_Treatment').html(params['treatment'] != null ? params['treatment'].replace(/'/g, '').toString() : 'ALL');
    $('.relativeValueChart_Cirrhosis').html(params['cirrhosis'] != null ? params['cirrhosis'].replace(/'/g, '').toString() : 'ALL');
}

/***
 * Reference : https://gist.github.com/AndreasBriese/1670507#file-underscoreaddon-js
 * Description: Mean function for array of object
 */
function MeanValue(obj, iterator, context) {
    if (_.isEmpty(obj)) return Infinity;
    var tmpObj = [];
    if (!iterator && _.isArray(obj)) {
        tmpObj = _.clone(obj);
        tmpObj.sort(function(f, s) { return f - s; });
    } else {
        _.isArray(obj) && each(obj, function(value, index, list) {
            tmpObj.push(iterator ? iterator.call(context, value, index, list) : value);
            tmpObj.sort();
        });
    };
    return tmpObj.length % 2 ? tmpObj[Math.floor(tmpObj.length / 2)] : (_.isNumber(tmpObj[tmpObj.length / 2 - 1]) && _.isNumber(tmpObj[tmpObj.length / 2])) ? (tmpObj[tmpObj.length / 2 - 1] + tmpObj[tmpObj.length / 2]) / 2 : tmpObj[tmpObj.length / 2 - 1];
}



/**
 * Reference http://stackoverflow.com/questions/8732401/how-to-figure-out-all-colors-in-a-gradient
 * Description: Function to calculate gradioent color based on percent value
 */
function makeGradientColor(color1, color2, percent) {
    var newColor = {};

    function makeChannel(a, b) {
        //// Commented as we have very lower percent value for utilization 
        //  return (a + Math.round((b - a) * (percent / 100)));
        return (a + Math.round((b - a) * (percent)));
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