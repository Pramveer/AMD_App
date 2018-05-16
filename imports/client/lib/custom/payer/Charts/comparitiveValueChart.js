import * as payerUtils from '../payerToolUtilities.js';

renderComparitiveValueChart = function(data, xAxisPlot, yAxisPlot, container, tabName, sizeParams) {

    if (!data) {
        //check for no data found
        $('#'+container).html('<div class="providerNoDataFound">No Data Found</div>');
        return;
     }
    var groupByDrugs = _.groupBy(data, 'DrugName');
    var finalData = [];
    var totalPatients = $('#' + tabName + 'CurrentCount').html();
    totalPatients = totalPatients.replace(/\,/g, '');
    totalPatients = parseInt(totalPatients);

    for (var key in groupByDrugs) {
        var json = {};
        json['Madication'] = key;
        var allDrugs = groupByDrugs[key];
        var drugsLength = allDrugs.length;
        var efficacy = 0,
            adherence = 0,
            patientCount = 0;
        for (var i = 0; i < drugsLength; i++) {
            efficacy += allDrugs[i]['Efficacy']['Efficacy'];
            adherence += allDrugs[i]['Adherence']['Adherence'];
            patientCount += allDrugs[i]['DrugN'];
        }
        json['Efficacy'] = efficacy / drugsLength;
        json['Adherence'] = efficacy / drugsLength;
        json['Expenses'] = allDrugs[0]['Cost']['TotalCost'] * patientCount;
        json['PatientCount'] = patientCount;
        json['Utilization'] = (patientCount / totalPatients) * 100;
        json['Cost'] = allDrugs[0]['Cost']['TotalCost'];
        finalData.push(json);
    }

    finalData.sort(function(a, b) {
        return b.PatientCount - a.PatientCount;
    });

    finalData.splice(10);

    // console.log('**********My Compartive value Chart Data*********');
    // console.log(finalData);

    d3.select('#' + container).selectAll("*").remove();
    $(".payerTabBChartContainer").css("display", "block");
    // var svgHeight = 270,
    //     svgWidth = 320,
    //     xOffset = 20,
    //     yOffset = 15;
    var svgHeight = sizeParams ? sizeParams.height : 260,
        svgWidth = sizeParams ? sizeParams.width : 320,
        xOffset = 25,
        yOffset = 17.5;

    //change tooltip class when rendered in popup
    var chartLegendClass = tabName + '_conparativeDrugValueChart_legends',
        chartLegendWidth = '116px';
    if (sizeParams) {
        chartLegendClass = tabName + 'valueChartPopupLegend';
        chartLegendWidth = '200px';
    }

    var svg = d3.select('#' + container).append("svg").attr("height", svgHeight).attr("width", svgWidth).style("background", "").style("margin-top", "-15px");

    var svgData = getRangeForChartPayer(xAxisPlot, yAxisPlot, xOffset + 10, 30, svgHeight - 5, svgWidth - 30, finalData);

    svgData = addMinMaxUtilization(svgData);

    var xAxisPlotLabel = xAxisPlot == 'Utilization' ? 'Patient Count' : xAxisPlot,
        yAxisPlotLabel = yAxisPlot == 'Utilization' ? 'Patient Count' : yAxisPlot;
    DrawSvgForValueChartPayer(svg, svgHeight, svgWidth - 10, xOffset + 10, yOffset, xAxisPlotLabel, yAxisPlotLabel, svgData);
    //Template.AdvancePayer.sortArrOfObjectsByParam(svgData, 'DrugPopulationUtilization');
    var thBGColor = ['#1379B7', '#3cbca9', '#815493', '#e05454', '#9CD088', '#ef4722', '#38b19d', '#925ca5', '#aaaeaf', '#d65151']; //['#1FA05C', '#8347aa', '#ab8a19', '#4a545f', '#00a9a3', '#6e852e', '#aa4747', '#4c6f85', '#9fca53', '#1972ab']
    var lagendUl = '<div class="comparativeDrugValueChart_legends" ><table style="z-index:1;" class="' + chartLegendClass + '" style="width:' + chartLegendWidth + '">';

    //bubble size
    // var UtiArray = [];
    // for (var index= 0;index<svgData.length;index++) {
    //     UtiArray.push(svgData[index].DrugInfo);
    // }
    // var maxUti = Math.round(_.max(_.pluck(UtiArray, 'Utilization'))),
    //     minUti =  Math.round(_.min(_.pluck(UtiArray, 'Utilization'))),
    //     avgBubbleSize = (maxUti + minUti ) / svgData.length;

    for (var i = 0; i < svgData.length; i++) {
        if (i < 5) {
            lagendUl = lagendUl + '<tr class="' + tabName + 'compareDrugsLegend" style="width:110px;list-style: none;line-height: 10px;display:block">' +
                '<td style="line-height: 10px;"> <div class="comparativeDrugValueChart_legendsBubbles" style="background:' + thBGColor[i] + ';">&nbsp;&nbsp;&nbsp;</div></td>' +
                '<td style="line-height: 10px;"> <div>' + svgData[i].DrugInfo['Madication'] + '</div></td>' +
                '</tr>';
        } else {
            lagendUl = lagendUl + '<tr class="' + tabName + 'compareDrugsLegend" style="width:110px;list-style: none;line-height: 10px;display:none">' +
                '<td style="line-height: 10px;"> <div class="comparativeDrugValueChart_legendsBubbles" style="background:' + thBGColor[i] + ';">&nbsp;&nbsp;&nbsp;</div></td>' +
                '<td style="line-height: 10px;"> <div>' + svgData[i].DrugInfo['Madication'] + '</div></td>' +
                '</tr>';
        }
        drawCircleSvgPayer(tabName, svgData[i].x + 10, svgData[i].y, svgData[i].DrugInfo.PatientCount, svgData[i].DrugInfo, svg, xOffset, svgHeight - xOffset, xAxisPlot, yAxisPlot, thBGColor[i], svgData[i], sizeParams);
        //drawCircleSvgPayer(tabName,svgData[i].x+10, svgData[i].y, avgBubbleSize , svgData[i].DrugInfo, svg, xOffset, svgHeight - xOffset, xAxisPlot, yAxisPlot, thBGColor[i], svgData[i],sizeParams);
    }
    lagendUl = lagendUl + '</table><span style="z-index:9;cursor:pointer;display:block;" class="' + tabName + 'showmoreDrugs showmoreDrugs">more</span><span style="z-index:9;cursor:pointer;display:none" class="' + tabName + 'showmoreDrugsless showlessDrugs">less</span>';
    // lagendUl = lagendUl + '</table>';
    lagendUl = lagendUl + '</div>';

    $("." + container + "_legends").remove();
    $('.' + tabName + 'showmoreDrugs').remove();
    $('.' + tabName + 'showmoreDrugsless').remove();
    $('#' + container).parent().append(lagendUl);
    setTimeout(function() {
        $('.' + tabName + 'showmoreDrugs').on('click', function() {
            $('.' + tabName + 'compareDrugsLegend').each(function() {
                $(this).css('display', 'block');
            });
            $('.' + tabName + 'showmoreDrugs').css('display', 'none');
            //$('.showmoreDrugs').addClass('showmoreDrugsless');
            $('.' + tabName + 'showmoreDrugsless').css('display', 'block');

        });
        $('.' + tabName + 'showmoreDrugsless').on('click', function() {
            $('.' + tabName + 'compareDrugsLegend').each(function(d, i) {
                if (d > 4) {
                    $(this).css('display', 'none');
                }
            });
            //$('.showmoreDrugsless').html('more');
            $('.' + tabName + 'showmoreDrugs').css('display', 'block');
            $('.' + tabName + 'showmoreDrugsless').css('display', 'none');

        });
    }, 100);
    // //popup is not defined reference error while score chart display from Payer Tab
    var popup = null,
        svgXaxisLine = null,
        svgYaxisLine = null,
        svgXaxisLineText = null,
        svgYaxisLineText = null;

    //click popup for value chart
    assignClicktoValueChart(svg, tabName, finalData);

    // ************ need to comment the code TO BE DONE ***************

    d3.selectAll("#" + container + " circle.advPayervalueChartBubble").on("mouseover", function(e) {
        var temp1 = $('#' + $(this).attr('id') + '_groupPayer').attr('transform').toLowerCase().replace(/[a-z]+/g, '').replace(/\(/g, '').replace(/\)/g, ''); //.split(/\,/);//split('translate(').join('').split(')').join('').split(',');
        let isIE = /*@cc_on!@*/ false || !!document.documentMode;
        let temp = isIE ? temp1.split(' ') : temp1.split(',');
        var tempData = JSON.parse($(this).attr('data'));
        // console.log('===================');
        // console.log(tempData);
        // console.log('===================');
        // console.log(temp);
        var HeaderHieght = 15;
        var arr1 = tempData.Madication.split('+');
        var cx = parseFloat(temp[0]),
            cy = parseFloat(temp[1]),
            width = sizeParams ? 200 : 135,
            height = 120 + (HeaderHieght + ((arr1.length - 1) * 15)),
            r = 7,
            x = (cx + r + width + 20 < svg.attr("width") ?
                cx + r - 10 :
                cx - r - width - 30),
            y = (cy - height / 2 < 0 ?
                15 :
                cy - height / 2);
        popup = svg.append("g").attr("class", "popupOnValueChartParentWindow");
        popup.append("rect")
            .attr("x", x + 5)
            .attr("y", y - 5)
            .attr("width", width)
            .attr("height", height)
            .style("fill", "#aaa")
            .style("stroke", "#cccccc")
            .style("stroke-width", 1)
            .style("opacity", 0.9);
        //.attr("rx", 8)
        // .attr("ry", 8);

        //.attr("rx", 8)
        //.attr("ry", 8);
        // Add % & K for axis label on hover
        var hoverXLabel = xAxisPlot == 'Cost' ? Math.round(tempData[xAxisPlot]) : Math.round(tempData[xAxisPlot]) + "%";
        var hoverYLabel = yAxisPlot == 'Cost' ? Math.round(tempData[yAxisPlot]) : Math.round(tempData[yAxisPlot]) + "%";

        // Add Drug name
        if (arr1.length > 0) {
            var popupHeader = popup.append("text")
                .attr("class", "drugNameDisplay" + tempData['drugNameDisplayCount'])
                .attr("x", x + 60)
                .attr("y", y + 6)
                //    .attr("height", bubbleData['Size'] * 3)
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .style("fill", "#fff")
                .style("opacity", 0.7);
            for (var i = 0; i < arr1.length; i++) {
                if (i === 0) {
                    popupHeader.append('tspan')
                        .attr('x', x + 80)
                        .attr('dy', 7)
                        .text(arr1[i]);
                    HeaderHieght = HeaderHieght + 7;
                } else {
                    popupHeader.append('tspan')
                        .attr('x', x + 80)
                        .attr('dy', 15)
                        .text(arr1[i]);
                    HeaderHieght = HeaderHieght + 15;
                }

            }
        } else {
            var popupHeader = popup.append("text")
                .attr("x", width / 4)
                .attr("y", y + 6)
                //    .attr("height", bubbleData['Size'] * 3)
                // .style("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .style("fill", "#fff")
                .style("opacity", 1.0)
                .text(tempData.Madication);
            HeaderHieght = HeaderHieght + 7;
        }


        /* var underLine = popup.append("line")
             .attr("x1", x + 7)
             .attr("x2", x + 3 + width)
             .attr("y1", y + HeaderHieght)
             .attr('y2', y + HeaderHieght)
             .attr('stroke', '#999999')
             .attr('stroke-width', '1');*/

        // Add the series value text
        var x1 = x + 18,
            y1 = y + HeaderHieght + 12;
        var textFont = sizeParams ? '13px' : '11px', //adjustment for the font size on popup
            rightTextDist = sizeParams ? 70 : 55; //adjustment for the right side text on popup

        popup.append("rect")
            .attr("x", x + 5)
            .attr("y", y1 - 10)
            .attr("width", width)
            .attr("height", height - HeaderHieght - 9)
            .style("fill", "#fff")
            .style("stroke", "#cccccc")
            .style("stroke-width", 1)
            .style("opacity", 0.9)
            //drawArcForPopup(popup, 15, x1 + 20, y1 + 10, Math.round(tempData.Adherence), 'Adherence')

        popup.append('text')
            .attr('x', x1)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("fill", "#777")
            .style("font-size", textFont)
            .text("Utilization");
        popup.append('text')
            .attr('x', x1 + rightTextDist)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text(Math.round(tempData.Utilization) + '%');
        y1 = y1 + 25;

        popup.append('text')
            .attr('x', x1)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("fill", "#777")
            .style("font-size", textFont)
            .text("Expenses");
        popup.append('text')
            .attr('x', x1 + rightTextDist)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text('$' + commaSeperatedNumber(Math.round(tempData.Expenses)));
        y1 = y1 + 25;

        //drawArcForPopup(popup, 15, x1 + 20, y1 + 10, Math.round(tempData.Efficacy), 'Efficacy');
        popup.append('text')
            .attr('x', x1)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("fill", "#777")
            .style("font-size", textFont)
            .text("Efficacy");
        popup.append('text')
            .attr('x', x1 + rightTextDist)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text(Math.round(tempData.Efficacy) + '%');
        y1 = y1 + 25;

        //drawArcForPopup(popup, 15, x1 + 20, y1 + 10, Math.round(tempData.Utilization), 'Utilization')
        popup.append('text')
            .attr('x', x1)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text("Cost");
        popup.append('text')
            .attr('x', x1 + rightTextDist)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text('$' + commaSeperatedNumber(Math.round(tempData.Cost)));
        y1 = y1 + 25;

        /* popup.append("line")
             .attr("x1", x1 - 5)
             .attr("x2", (x1 - 25) + width)
             .attr("y1", y1)
             .attr('y2', y1)
             .attr('stroke', '#999999')
             .attr('stroke-width', '1');*/
        y1 = y1 + 50;


        svgXaxisLine = svg.append("line")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x1", cx)
            .attr("x2", tempData['svgXaxis'] + 9)
            .attr("y1", cy)
            .attr('y2', cy)
            .attr('stroke', 'gray')
            .attr('stroke-width', '1')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '1, 5');
        svgYaxisLine = svg.append("line")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x1", cx)
            .attr("x2", cx)
            .attr("y1", cy)
            .attr('y2', tempData['svgYaxis'] - 10)
            .attr('stroke', 'gray')
            .attr('stroke-width', '1')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '1, 5');
        svgXaxisLineText = svg.append("text")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x", tempData['svgXaxis'] - 16)
            .attr("y", cy)
            .text(hoverYLabel)
            .style("font-family", "sans-serif")
            .style("font-size", 11)
            .style('fill', '#777')
            .style("font-weight", 500)
            .attr("fill", "#333");
        svgYaxisLineText = svg.append("text")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x", cx - 15)
            .attr("y", tempData['svgYaxis'] + 5)
            .text('$' + commaSeperatedNumber(hoverXLabel))
            .style("font-family", "sans-serif")
            .style("font-size", 11)
            .style('fill', '#777')
            .style("font-weight", 500)
            .attr("fill", "#333");

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
    });
    d3.selectAll("circle.advPayervalueChartBubble").on("mouseout", function(e) {
        d3.selectAll(".popupOnValueChartParentWindow").remove();
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
        //  //Change position of method execution
        d3.selectAll(".popupOnValueChartParentWindow").remove();
    });


}

//calculate Range For  value chart
getRangeForChartPayer = function(xData, yData, xChartOffset, yChartOffset, canvasHeight, canvasWidth, allDrugs) {

        var chartHeight = canvasHeight - (xChartOffset + yChartOffset);
        var chartWidth = canvasWidth - (xChartOffset + yChartOffset);
        var xBoundaryValOffset = 5;
        var yBoundaryValOffset = 5;
        var xDataValues = [];
        var yDataValues = [];

        var tempArrayX = [];
        var tempArrayY = [];

        for (var i = 0; i < allDrugs.length; i++) {
            xDataValues.push(parseFloat(allDrugs[i][xData]));
            yDataValues.push(parseFloat(allDrugs[i][yData]));
            tempArrayX.push(parseFloat(allDrugs[i][xData]));
            tempArrayY.push(parseFloat(allDrugs[i][yData]));
        }

        var medianX = Template.TreatedPatients.calculateMedianPayer(tempArrayX);
        var medianY = Template.TreatedPatients.calculateMedianPayer(tempArrayY);

        var xMax = tempArrayX[tempArrayX.length - 1];
        var xMin = tempArrayX[0];
        var yMax = tempArrayY[tempArrayY.length - 1];
        var yMin = tempArrayY[0];

        if (xData === 'Cost') {
            xMax = xMax + xBoundaryValOffset;
        } else {
            xMin = xMin - xBoundaryValOffset;
            if (xMin < 0)
                xMin = 0;
        }

        // adjust the max & min values for offset for y-axis
        if (yData === 'Cost') {
            yMax = yMax + yBoundaryValOffset;
        } else {
            yMin = yMin - yBoundaryValOffset;
            if (yMin < 0)
                yMin = 0;
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
    ///dummy
function DrawSvgForValueChart(svg, height, width, xOffset, yOffset, xAxisLable, yAxisLable, svgData) {
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
        xAxisDisplayText = ''; //' (For ' + Router['PatientId'] + ')';
    } else {
        xTopLableHL = Math.round(svgData[0]['xMin']) + '%';
        xBottomLableHL = Math.round(svgData[0]['xMax']) + '%';
        if ((Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin'])) <= 10) {
            xplotting = (Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin']));
        } else if ((Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin'])) >= 11 && (Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin'])) <= 20) {
            xplotting = Math.round((Math.round(svgData[0]['xMax']) - Math.round(svgData[0]['xMin'])) / 2);
        }
        xAxisDisplayText = ''; //' (For Patients Like ' + Router['PatientId'] + ')';
    }
    if (yAxisLable === 'Cost') {
        yTopLableHL = Math.round(svgData[0]['yMin']) + 'K';
        yBottomLableHL = Math.round(svgData[0]['yMax']) + 'K';
        yplotting = 6;
        yAxisDisplayText = ' (For ' + Router['PatientId'] + ')';
    } else {
        yTopLableHL = Math.round(svgData[0]['yMax']) + '%';
        yBottomLableHL = Math.round(svgData[0]['yMin']) + '%';
        if ((Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin'])) <= 10) {
            yplotting = (Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin']));
        } else if ((Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin'])) >= 11 && (Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin'])) <= 20) {
            yplotting = Math.round((Math.round(svgData[0]['yMax']) - Math.round(svgData[0]['yMin'])) / 2);
        }
        yAxisDisplayText = ' '; //(For Patients Like ' + Router['PatientId'] + ')';
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
DrawSvgForValueChartPayer_subpopulation = function(svg, height, width, xOffset, yOffset, xAxisLable, yAxisLable, svgData) {

    var x = d3.scale.linear()
        .range([0, width - 1.5 * xOffset]);
    var y = d3.scale.linear()
        //.domain([0,height-2*yOffset ])
        .range([height - 3 * yOffset, 0]);
    var xAxis = d3.svg.axis()
        .ticks(0)
        .scale(x).orient("bottom");
    var yAxis = d3.svg.axis()
        .ticks(0)
        .scale(y).orient("left");
    var xAxisd = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + xOffset + "," + (height - xOffset) + ")")
        .call(xAxis);
    var yAxisd = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (xOffset) + "," + (yOffset) + ")")
        .call(yAxis);
    var xAxisLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 7) + "px")
        .attr("dx", (width / 2) + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "300")
        .attr("fill", "#999")
        .text('Cost');

    //append image relative to cost label
    var xAxisImage = svg.append('g')
        .attr('transform', "translate(" + (xOffset - 4) + "," + (height - 23) + ")")
        .append("image")
        .attr('xlink:href', '/optimalPointForValueZoneDot.png')
        .attr('class', 'optimalPointForPayerTabBChart')
        .attr('height', '20')
        //.attr('tranform',"translate("+(xOffset)+"," + (height - 4) + ")")
        .attr('width', '18')
        .attr('background', 'none');
    var xAxisImageLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 7) + "px")
        .attr("dx", ((width - 10) / 3.6) + 3 + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "300")
        .attr("fill", "#999")
        .text('Relative Position');

    var yAxisLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "18px")
        .attr("dx", "-" + ((height - 20) / 2) + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "300")
        .attr("fill", "#999")
        .attr("transform", "rotate(-90)")
        .text('Efficacy');
}

//draw svg For  value chart
DrawSvgForValueChartPayer = function(svg, height, width, xOffset, yOffset, xAxisLable, yAxisLable, svgData) {

    var x = d3.scale.linear()
        .range([0, width - 1.5 * xOffset]);
    var y = d3.scale.linear()
        //.domain([0,height-2*yOffset ])
        .range([height - 3 * yOffset, 10]);
    var xAxis = d3.svg.axis()
        .ticks(0)
        .scale(x).orient("bottom");
    var yAxis = d3.svg.axis()
        .ticks(0)
        .scale(y).orient("left");
    var xAxisd = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + xOffset + "," + (height - xOffset) + ")")
        .call(xAxis);
    var yAxisd = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (xOffset) + "," + yOffset + ")")
        .call(yAxis);
    var xAxisLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 4) + "px")
        .attr("dx", ((width - 10) / 1.7) + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "300")
        .attr("fill", "#999")
        .text('Cost');

    //append image relative to cost label
    var xAxisImage = svg.append('g')
        .attr('transform', "translate(" + (xOffset - 4) + "," + (height - 19) + ")")
        .append("image")
        .attr('xlink:href', '/optimalPointForValueZoneDot.png')
        .attr('class', 'optimalPointForPayerTabBChart')
        .attr('height', '20')
        //.attr('tranform',"translate("+(xOffset)+"," + (height - 4) + ")")
        .attr('width', '18')
        .attr('background', 'none');
    var xAxisImageLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (height - 4) + 1 + "px")
        .attr("dx", ((width - 10) / 3) + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "300")
        .attr("fill", "#999")
        .text('Relative Position');
    var yAxisLableText = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "18px")
        .attr("dx", "-" + ((height - 20) / 2) + "px")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight", "300")
        .attr("fill", "#999")
        .attr("transform", "rotate(-90)")
        .text('Efficacy');
}

//draw bobble For  value chart
function drawCircleSvgPayer(tabName, bubbleLeft, bubbleTop, bubbleSize, bubbleData, svg, svgXaxis, svgYaxis, xAxis, yAxis, bubbleColor, svgData, sizeParams) {
    //var ids = bubbleData['Madication'].split(' + ').join('').split(' ').join('').split('(').join('').split(')').join('');
    //For remove non alpha numeric character from string
    var ids = tabName + bubbleData['Madication'].replace(/\W/g, '');
    //append id if it is opened in popup
    ids += sizeParams ? 'chartPopup' : '';
    bubbleData['svgXaxis'] = svgXaxis;
    bubbleData['svgYaxis'] = svgYaxis;
    // if (svgData.DrugInfo.Utilization >= 50) {
    //     bubbleSize = 28;
    // } else if (svgData.DrugInfo.Utilization >= 25 && svgData.DrugInfo.Utilization < 50) {
    //     bubbleSize = 18;
    // } else if (svgData.DrugInfo.Utilization >= 0 && svgData.DrugInfo.Utilization < 25) {
    //     bubbleSize = 8;
    // }


    let minBubbleSize = 8;
    let maxBubbleSize = 28;
    let overallBubbleSizeDiffrence = maxBubbleSize = minBubbleSize;

    let utilizationGap = svgData.DrugInfo.maxUtilization - svgData.DrugInfo.minUtilization;

    let currentDrugUtilizationGap = svgData.DrugInfo.Utilization - svgData.DrugInfo.minUtilization

    let currentDrugBubbleSizeDiffrence = (overallBubbleSizeDiffrence / utilizationGap) * currentDrugUtilizationGap;

    bubbleSize = minBubbleSize + currentDrugBubbleSizeDiffrence;

    //check for negative bubble size
    if (bubbleSize <= 0) {
        bubbleSize = 8;
    }

    //check for single drug or utilizationGap is 0
    if (utilizationGap <= 0) {
        bubbleSize = 20;
    }

    //increase bubble radius if opened in popup
    bubbleSize = sizeParams ? bubbleSize * 1.8 : bubbleSize;

    var group = svg.append("g")
        .attr("id", ids + '_groupPayer')
        .attr("transform", "translate(" + parseFloat(bubbleLeft) + "," + parseFloat(bubbleTop) + ")");
    var drugGroupCircle = group.append("circle")
        .attr("class", "advPayervalueChartBubble valueChartSetUse")
        .attr("id", ids)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("fill", bubbleColor)
        .attr("r", bubbleSize)
        .style("opacity", 0.7)
        .attr("index", bubbleData.drugNameDisplayCount)
        .attr("data", JSON.stringify(bubbleData));
    if (bubbleData.SelectedMadication === 'true') {
        drugGroupCircle.attr("stroke", "#FFE400").attr("stroke-width", "7px");
    }
}

//Render Svg Chart For Sission Data
renderSvgChartForSissionDataPayer = function(tabName, xAxis, yAxis, container, chartData) {
    var data = [];
    //if data is passed in the function
    console.log("*** renderSvgChartForSissionDataPayer ***")
    console.log(chartData);
    if (chartData) {
        data = prepareDataForBubbleChart(chartData);
    } else {
        data = prepareDataForBubbleChart(JSON.parse(localStorage.getItem(tabName + 'SvgData')));
    }

    for (var i = 0; i < data.length; i++) {
        if (data[i]['Cost'] > 1000) {
            data[i]['Cost'] = Math.round(data[i]['Cost'] / 1000);
        }
    }
    d3.select(container).selectAll("*").remove();
    $(".payerTabBChartContainer").css("display", "block");
    var svgHeight = 220,
        svgWidth = 400,
        xOffset = 20,
        yOffset = 15;
    var marginLeft = 15;
    if (chartData) {
        svgWidth = 345;
        marginLeft = 0;
    }

    // **** NEW RELATIVE VALUE CHART CODE START
    let dataObj = {
        data: data,
        isSmallChart: svgHeight <= 220 ? true : false,
        axis: { x: xAxis, y: yAxis },
        sizeParams: { svgHeight: svgHeight, svgWidth: svgWidth }
    };
    console.log(data);
    console.log(container);
    $(container).empty();
    //render the template in the UI from /imports/client/components/graph/payerRelativeValue/relativeValue.html
    UI.renderWithData(Template.PayerRelativeValueChart, dataObj, $(container)[0]);

    //New Click event handler for subpopulation chart 
    // if (container != '#' + tabName + '_conparativeDrugValueChart') {
    //     $(container).click(function(e) {
    //         console.log(e);
    //         // **** NEW RELATIVE VALUE CHART CODE START
    //         dataObj = {
    //             data: data,
    //             isSmallChart: true,
    //             axis: { x: xAxis, y: yAxis },
    //             sizeParams: { svgHeight: 500, svgWidth: 750 }
    //         };
    //         console.log(data);

    //         $('#treated_conparativeDrugValueChart').empty();
    //         //render the template in the UI from /imports/client/components/graph/payerRelativeValue/relativeValue.html
    //         UI.renderWithData(Template.PayerRelativeValueChart, dataObj, $('#treated_conparativeDrugValueChart')[0]);
    //         setTimeout(function() {
    //             $('.subpopulationChartsPopup-header').html();
    //             $('.subpopulationChartsPopup-title').html();
    //             $('.subpopulationChartsPopup-footer').html();
    //             $('#subpopulationChartsPopup').show();
    //         }, 50);
    //     });
    // }


    // **** NEW RELATIVE VALUE CHART CODE END

    //******* Relative value chart render code
    //var svg;
    //svg = d3.select(container).append("svg").attr("height", svgHeight).attr("width", svgWidth).style("background", "").style("margin-left", marginLeft + "px");

    if (container != '#' + tabName + '_conparativeDrugValueChart') {
        $(container).click(function(e) {
            var valueChartData = data;
            //Template.TreatedPatients.prepareDataForBubbleChart(JSON.parse(localStorage.getItem('treatedSvgData')));
            for (var i = 0; i < valueChartData.length; i++) {
                if (valueChartData[i]['Cost'] > 1000) {
                    valueChartData[i]['Cost'] = Math.round(valueChartData[i]['Cost'] / 1000);
                }
            }
            Session.set('svgData', JSON.stringify(valueChartData));
            //$('body').scrollTop(300);
            setTimeout(function() {
                Session.set('svgData', JSON.stringify(valueChartData));
                var valueChartDialogBoxDialog = $("#valueChartDialogBox").dialog({
                    modal: true,
                    draggable: true,
                    resizable: false,
                    //position: ['center', 'bottom'],
                    show: 'blind',
                    hide: 'blind',
                    width: 1000,
                    height: 590,
                    top: $('body').scrollTop(),
                    dialogClass: 'ui-dialog-osx spRelativeValuePopup',
                    // buttons: {
                    //     "Close": function() {
                    //         $(this).dialog("close");
                    //     }
                    // }
                });
                //Session.set('svgData', localStorage.getItem('svgData'));
                //Commented below line for testing purpose
                setTimeout(function() {
                    Template.Provider.renderNewRelativeValueChart('Cost', 'Efficacy', 500, 750, true);
                    //set total N count
                    if (tabName.match("^[a-zA-Z]+$") != null) {
                        $('#TotalNContainer').html($('.' + tabName + 'TotalFilteredPatients').html());
                        //$('.ui-dialog-title').html('Relative Value Positioning (N = '+($('.'+tabName+'TotalFilteredPatients').html())+')');
                        $('.ui-dialog-title').html('Relative Value Positioning');
                    } else {
                        $('#TotalNContainer').html($('.' + tabName + 'ThisCategoryPatients').html());
                        var tempd = $('.' + tabName + 'detailViewLink').attr('data');
                        tempd = tempd.split(' ');
                        $('.GenotypeCik').html(tempd[0]);
                        $('.CirrhosisCik').html(tempd[2] == undefined ? 'No' : 'Yes');
                        $('.TreatmentCik').html(tempd[1]);
                        // $('.ui-dialog-title').html('Relative Value Positioning (N = '+($('.'+tabName+'ThisCategoryPatients').html())+')');
                        $('.ui-dialog-title').html('Relative Value Positioning');

                    }

                }, 200);
                $('.valueChartLegend').show();
                $('.valueChartChangeAxisCombo ').show();
                setTimeout(function() {
                    console.log('register change event');
                    $('.changeXAxis').on('change', function() {
                        console.log(' changeXAxis registered change event');
                        Template.Provider.renderNewRelativeValueChart($('.changeXAxis').val(), $('.changeYAxis').val(), 500, 790);
                    });
                    $('.changeYAxis').on('change', function() {
                        Template.Provider.renderNewRelativeValueChart($('.changeXAxis').val(), $('.changeYAxis').val(), 500, 790);
                    });
                }, 100);
                $('.changeXAxis').val('Cost');
                $('.changeYAxis').val('Efficacy');
                var relativeValue = '';
                if (tabName.match("^[a-zA-Z]+$") != null) {
                    relativeValue = $('.' + tabName + 'SubPopulationCategoriesItem.active').html();
                } else {
                    relativeValue = $('.' + tabName + 'detailViewLink').attr('data');

                }
                // var dataHtml = 'Relative Value for ('+  relativeValue;
                // //if (chickletsData.length > 1) {
                // //    for (var i = 0; i < chickletsData.length; i++) {
                // //        data += '<span class="titleHeader"><span>' + chickletsData[i]['name'] + ': </span><span> ' + chickletsData[i]['value'] + '</span></span>';
                // //    }
                // //}
                // dataHtml = dataHtml + ' )';
                // $('.ui-dialog-title').html(dataHtml);
            }, 500);
        });
    }

    // var svgData = getRangeForChartPayer(xAxis, yAxis, xOffset, 30, svgHeight, svgWidth, data);

    // svgData = addMinMaxUtilization(svgData);

    // DrawSvgForValueChartPayer_subpopulation(svg, svgHeight, svgWidth, xOffset+10, yOffset, xAxis, yAxis, svgData);
    // sortArrOfObjectsByParam(svgData, 'DrugPopulationUtilization');
    // var thBGColor = ['#1379B7','#3cbca9','#815493','#e05454','#9CD088','#ef4722','#38b19d','#925ca5','#aaaeaf','#d65151'];//['#1FA05C', '#8347aa', '#ab8a19', '#4a545f', '#00a9a3', '#6e852e', '#aa4747', '#4c6f85', '#9fca53', '#1972ab']
    // for (var i = 0; i < svgData.length; i++) {
    //     drawCircleSvgPayer(tabName,svgData[i].x, svgData[i].y, svgData[i].DrugInfo.Size, svgData[i].DrugInfo, svg, xOffset, svgHeight - 2*xOffset, xAxis, yAxis, thBGColor[i], svgData[i]);
    // }

    // if(chartData) {
    //      addLegendsInEfficacyComparitiveChart(container,chartData);
    //      addToolTipforChart(container,svg);
    // }

    //******* Relative value chart render code END

}

//Prepare Data For Bubble Chart
function prepareDataForBubbleChart(selDrugsWithData) {
    var data = [];
    var tempData = selDrugsWithData;
    // console.log("**** Selected drugs with data  **** ");
    // console.log(selDrugsWithData);

    var previousSize = 28;

    var efficacyData = [];
    if (tempData.length > 0) {
        // Sort by Value low to high
        tempData.sort(function(a, b) {
            return parseFloat(a.DrugPopulationSize) - parseFloat(b.DrugPopulationSize);
        });

        //save data after null or array length check
        var minimumSize = tempData[0].DrugPopulationSize;
        var totalCount = tempData.length;
        var maximumSize = tempData[totalCount - 1].DrugPopulationSize;
        for (var i = 0; i < tempData.length; i++) {
            var json = {};
            if (tempData[i].Adherence.Adherence == 'NaN') {
                json['Adherence'] = 55;
            } else {
                json['Adherence'] = parseFloat(tempData[i].Adherence.Adherence);
            }
            json['Cost'] = Math.round(tempData[i].Cost.TotalCost / 1000);
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
            json['Utilization'] = tempData[i].Utilization.Utilization;
            json['TotalN'] = tempData[i].TotalN;
            json['Safety'] = parseFloat(tempData[i].Safety);
            if (tempData[i].DrugPopulationSize == minimumSize) {
                json['Size'] = 40;
            } else if (tempData[i].DrugPopulationSize == maximumSize) {
                json['Size'] = 55;
            } else {
                var size = Template.TreatedPatients.calculateSizePayer(minimumSize, maximumSize, tempData[i].DrugPopulationSize, totalCount, previousSize);
                previousSize = size;
                json['Size'] = size;
            }
            json['DrugPopulationUtilization'] = tempData[i].Utilization.Utilization;
            json['SelectedMadication'] = 'false';
            json['SelectSvg'] = 'SelectedMadication';
            json['drugNameDisplayCount'] = i;
            data.push(json);
        }
    }
    efficacyData.sort(function(a, b) {
        return parseFloat(a) - parseFloat(b);
    });
    //data.sort(function(a, b) {
    //    return parseFloat(a.Cost) - parseFloat(b.Cost);
    //});
    localStorage.setItem('svgData', JSON.stringify(data));
    return data;
}

//function to zoom chart
function assignClicktoValueChart(svg, tabName) {
    tabName = tabName.replace(/[0-9]/g, '');
    svg.on("click", function(e) {
        var svgData = JSON.parse(localStorage.getItem(tabName + 'SvgData'));
        if (svgData.length == 0) {
            svgData = JSON.parse(localStorage.getItem(tabName + 'SvgDataFinal'));
        }

        //remove duplicate drug values
        svgData = _.unique(svgData, function(item, key, DrugName) {
            return item.DrugName;
        });

        //sort on Utilization max to min
        svgData.sort(function(a, b) {
            return b.DrugN - a.DrugN;
        });

        //get only top 10 drugs
        svgData.splice(10);

        var valueChartData = prepareDataForBubbleChart(svgData);

        for (var i = 0; i < valueChartData.length; i++) {
            if (valueChartData[i]['Cost'] > 1000) {
                valueChartData[i]['Cost'] = Math.round(valueChartData[i]['Cost'] / 1000);
            }
        }
        Session.set('svgData', JSON.stringify(valueChartData));
        //$('body').scrollTop(300);
        setTimeout(function() {
            Session.set('svgData', JSON.stringify(valueChartData));
            var valueChartDialogBoxDialog = $("#valueChartDialogBox").dialog({
                modal: true,
                draggable: true,
                resizable: false,
                //position: ['center', 'bottom'],
                show: 'blind',
                hide: 'blind',
                width: 1000,
                height: 590,
                top: $('body').scrollTop(),
                dialogClass: 'ui-dialog-osx payerRelativeValueChart',
                // buttons: {
                //     "Close": function() {
                //         $(this).dialog("close");
                //     }
                // }
            });
            //Session.set('svgData', localStorage.getItem('svgData'));
            //Commented below line for testing purpose
            setTimeout(function() {
                Template.Provider.renderSvgChartForSissionData('Cost', 'Efficacy', 500, 750, true);
                //set total N count
                if (tabName.match("^[a-zA-Z]+$") != null) {
                    //$('#TotalNContainer').html($('.'+tabName+'TotalFilteredPatients').html());
                    let temp = payerUtils.getFiltersData();

                    let genotype = temp[tabName].genotypes;
                    let cirrhosis = temp[tabName].cirrhosis;
                    let treatment = temp[tabName].treatment;

                    if (genotype instanceof Array) {
                        genotype = genotype.join(',');
                    }


                    if (cirrhosis instanceof Array) {
                        cirrhosis = 'ALL';
                    }

                    if (treatment instanceof Array) {
                        treatment = 'ALL';
                    }

                    $('.GenotypeCik').html(genotype);
                    $('.CirrhosisCik').html(cirrhosis);
                    $('.TreatmentCik').html(treatment);
                    $('#TotalNContainer').html($('#' + tabName + 'CurrentCount').html());

                } else {
                    //$('#TotalNContainer').html($('.'+tabName+'ThisCategoryPatients').html());
                    var tempd = $('.' + tabName + 'detailViewLink').attr('data');
                    tempd = tempd.split(' ');
                    $('.GenotypeCik').html(tempd[0]);
                    $('.CirrhosisCik').html(tempd[2] == undefined ? 'No' : 'Yes');
                    $('.TreatmentCik').html(tempd[1]);

                    //set values
                    $('#TotalNContainer').html($('#' + tabName + 'CurrentCount').html());

                }

            }, 200);
            $('.valueChartLegend').show();
            $('.valueChartChangeAxisCombo ').show();
            setTimeout(function() {
                $('.changeXAxis').on('change', function() {
                    Template.Provider.renderSvgChartForSissionData($('.changeXAxis').val(), $('.changeYAxis').val(), 500, 790, true);
                });
                $('.changeYAxis').on('change', function() {
                    Template.Provider.renderSvgChartForSissionData($('.changeXAxis').val(), $('.changeYAxis').val(), 500, 790, true);
                });
            }, 100);

            $('.changeXAxis').val('Cost');
            $('.changeYAxis').val('Efficacy');
            var dataHtml = 'Comparative Drug Value';
            $('.ui-dialog-title').html(dataHtml);
        }, 500);
    });
}


function addMinMaxUtilization(data) {

    let minUtilization = 0;
    let maxUtilization = 0;
    let drugsData = [];

    for (let i = 0; i < data.length; i++) {
        drugsData.push(data[i].DrugInfo);
    }

    minUtilization = _.min(_.pluck(drugsData, 'Utilization'));
    maxUtilization = _.max(_.pluck(drugsData, 'Utilization'));

    for (let i = 0; i < data.length; i++) {
        data[i].DrugInfo['minUtilization'] = minUtilization;
        data[i].DrugInfo['maxUtilization'] = maxUtilization;
    }

    return data;
}

//add legends
function addLegendsInEfficacyComparitiveChart(container, svgData) {
    var chartLegendClass = container + '_conparativeDrugValueChart_legends',
        chartLegendWidth = '116px';
    var tabName = container.replace(/\#/g, '');
    var thBGColor = ['#1379B7', '#3cbca9', '#815493', '#e05454', '#9CD088', '#ef4722', '#38b19d', '#925ca5', '#aaaeaf', '#d65151']; //['#1FA05C', '#8347aa', '#ab8a19', '#4a545f', '#00a9a3', '#6e852e', '#aa4747', '#4c6f85', '#9fca53', '#1972ab']
    var lagendUl = '<div class="comparativeDrugValueChart_legends" ><table style="z-index:1;" class="' + chartLegendClass + '" style="width:' + chartLegendWidth + '">';
    for (var i = 0; i < svgData.length; i++) {
        if (i < 5) {
            lagendUl = lagendUl + '<tr class="' + tabName + 'compareDrugsLegend" style="width:110px;list-style: none;line-height: 10px;display:block">' +
                '<td style="line-height: 10px;"> <div class="comparativeDrugValueChart_legendsBubbles" style="background:' + thBGColor[i] + ';">&nbsp;&nbsp;&nbsp;</div></td>' +
                '<td style="line-height: 10px;"> <div>' + svgData[i].DrugName + '</div></td>' +
                '</tr>';
        } else {
            lagendUl = lagendUl + '<tr class="' + tabName + 'compareDrugsLegend" style="width:110px;list-style: none;line-height: 10px;display:none">' +
                '<td style="line-height: 10px;"> <div class="comparativeDrugValueChart_legendsBubbles" style="background:' + thBGColor[i] + ';">&nbsp;&nbsp;&nbsp;</div></td>' +
                '<td style="line-height: 10px;"> <div>' + svgData[i].DrugName + '</div></td>' +
                '</tr>';
        }
    }
    lagendUl = lagendUl + '</table><span style="z-index:9;cursor:pointer;display:block;" class="' + tabName + 'showmoreDrugs showmoreDrugs">more</span><span style="z-index:9;cursor:pointer;display:none" class="' + tabName + 'showmoreDrugsless showlessDrugs">less</span>';
    lagendUl = lagendUl + '</div>';
    $('.' + tabName + 'showmoreDrugs').remove();
    $('.' + tabName + 'showmoreDrugsless').remove();
    $(container + "_legends").remove();
    $(container).append(lagendUl);
    setTimeout(function() {
        $('.' + tabName + 'showmoreDrugs').on('click', function() {
            $('.' + tabName + 'compareDrugsLegend').each(function() {
                $(this).css('display', 'block');
            });
            $('.' + tabName + 'showmoreDrugs').css('display', 'none');
            //$('.showmoreDrugs').addClass('showmoreDrugsless');
            $('.' + tabName + 'showmoreDrugsless').css('display', 'block');

        });
        $('.' + tabName + 'showmoreDrugsless').on('click', function() {
            $('.' + tabName + 'compareDrugsLegend').each(function(d, i) {
                if (d > 4) {
                    $(this).css('display', 'none');
                }
            });
            $('.' + tabName + 'showmoreDrugs').css('display', 'block');
            $('.' + tabName + 'showmoreDrugsless').css('display', 'none');

        });
    }, 100);
}

function addToolTipforChart(container, svg) {
    let popup = null;
    d3.selectAll(container + " circle.advPayervalueChartBubble").on("mouseover", function(e) {
        let sizeParams = null;
        var temp1 = $('#' + $(this).attr('id') + '_groupPayer').attr('transform').toLowerCase().replace(/[a-z]+/g, '').replace(/\(/g, '').replace(/\)/g, ''); //.split(/\,/);//split('translate(').join('').split(')').join('').split(',');
        let isIE = /*@cc_on!@*/ false || !!document.documentMode;
        let temp = isIE ? temp1.split(' ') : temp1.split(',');
        var tempData = JSON.parse($(this).attr('data'));
        var HeaderHieght = 15;
        var arr1 = tempData.Madication.split('+');
        var cx = parseFloat(temp[0]),
            cy = parseFloat(temp[1]),
            width = sizeParams ? 200 : 135,
            height = 120 + (HeaderHieght + ((arr1.length - 1) * 15)),
            r = 7,
            x = (cx + r + width + 20 < svg.attr("width") ?
                cx + r - 10 :
                cx - r - width - 30),
            y = (cy - height / 2 < 0 ?
                15 :
                cy - height / 2);
        popup = svg.append("g").attr("class", "popupOnValueChartParentWindow");
        popup.append("rect")
            .attr("x", x + 5)
            .attr("y", y - 5)
            .attr("width", width)
            .attr("height", height)
            .style("fill", "#aaa")
            .style("stroke", "#cccccc")
            .style("stroke-width", 1)
            .style("opacity", 0.9);
        // Add % & K for axis label on hover
        let xAxisPlot = 'Cost',
            yAxisPlot = 'Efficacy';
        var hoverXLabel = xAxisPlot == 'Cost' ? Math.round(tempData[xAxisPlot]) : Math.round(tempData[xAxisPlot]) + "%";
        var hoverYLabel = yAxisPlot == 'Cost' ? Math.round(tempData[yAxisPlot]) : Math.round(tempData[yAxisPlot]) + "%";

        // Add Drug name
        if (arr1.length > 0) {
            var popupHeader = popup.append("text")
                .attr("class", "drugNameDisplay" + tempData['drugNameDisplayCount'])
                .attr("x", x + 60)
                .attr("y", y + 6)
                //    .attr("height", bubbleData['Size'] * 3)
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .style("fill", "#fff")
                .style("opacity", 0.7);
            for (var i = 0; i < arr1.length; i++) {
                if (i === 0) {
                    popupHeader.append('tspan')
                        .attr('x', x + 80)
                        .attr('dy', 7)
                        .text(arr1[i]);
                    HeaderHieght = HeaderHieght + 7;
                } else {
                    popupHeader.append('tspan')
                        .attr('x', x + 80)
                        .attr('dy', 15)
                        .text(arr1[i]);
                    HeaderHieght = HeaderHieght + 15;
                }

            }
        } else {
            var popupHeader = popup.append("text")
                .attr("x", width / 4)
                .attr("y", y + 6)
                //    .attr("height", bubbleData['Size'] * 3)
                // .style("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .style("fill", "#fff")
                .style("opacity", 1.0)
                .text(tempData.Madication);
            HeaderHieght = HeaderHieght + 7;
        }

        // Add the series value text
        var x1 = x + 18,
            y1 = y + HeaderHieght + 12;
        var textFont = sizeParams ? '13px' : '11px', //adjustment for the font size on popup
            rightTextDist = sizeParams ? 70 : 55; //adjustment for the right side text on popup

        popup.append("rect")
            .attr("x", x + 5)
            .attr("y", y1 - 10)
            .attr("width", width)
            .attr("height", height - HeaderHieght - 9)
            .style("fill", "#fff")
            .style("stroke", "#cccccc")
            .style("stroke-width", 1)
            .style("opacity", 0.9)
            //drawArcForPopup(popup, 15, x1 + 20, y1 + 10, Math.round(tempData.Adherence), 'Adherence')

        popup.append('text')
            .attr('x', x1)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("fill", "#777")
            .style("font-size", textFont)
            .text("Utilization");
        popup.append('text')
            .attr('x', x1 + rightTextDist)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text(Math.round(tempData.Utilization) + '%');
        y1 = y1 + 25;


        //drawArcForPopup(popup, 15, x1 + 20, y1 + 10, Math.round(tempData.Efficacy), 'Efficacy');
        popup.append('text')
            .attr('x', x1)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("fill", "#777")
            .style("font-size", textFont)
            .text("Efficacy");
        popup.append('text')
            .attr('x', x1 + rightTextDist)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text(Math.round(tempData.Efficacy) + '%');
        y1 = y1 + 25;

        //drawArcForPopup(popup, 15, x1 + 20, y1 + 10, Math.round(tempData.Utilization), 'Utilization')
        popup.append('text')
            .attr('x', x1)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text("Cost");
        popup.append('text')
            .attr('x', x1 + rightTextDist)
            .attr('y', y1 + 5)
            .style("font-weight", "500")
            .style("font-size", textFont)
            .style("fill", "#777")
            .text('$' + commaSeperatedNumber(Math.round(tempData.Cost)));
        y1 = y1 + 25;

        /* popup.append("line")
                .attr("x1", x1 - 5)
                .attr("x2", (x1 - 25) + width)
                .attr("y1", y1)
                .attr('y2', y1)
                .attr('stroke', '#999999')
                .attr('stroke-width', '1');*/
        y1 = y1 + 50;


        svgXaxisLine = svg.append("line")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x1", cx)
            .attr("x2", tempData['svgXaxis'] + 9)
            .attr("y1", cy)
            .attr('y2', cy)
            .attr('stroke', 'gray')
            .attr('stroke-width', '1')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '1, 5');
        svgYaxisLine = svg.append("line")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x1", cx)
            .attr("x2", cx)
            .attr("y1", cy)
            .attr('y2', tempData['svgYaxis'] - 10)
            .attr('stroke', 'gray')
            .attr('stroke-width', '1')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '1, 5');
        svgXaxisLineText = svg.append("text")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x", tempData['svgXaxis'] - 16)
            .attr("y", cy)
            .text(hoverYLabel)
            .style("font-family", "sans-serif")
            .style("font-size", 11)
            .style('fill', '#777')
            .style("font-weight", 500)
            .attr("fill", "#333");
        svgYaxisLineText = svg.append("text")
            .attr("class", "popupOnValueChartParentWindow")
            .attr("x", cx - 15)
            .attr("y", tempData['svgYaxis'] + 5)
            .text('$' + commaSeperatedNumber(hoverXLabel))
            .style("font-family", "sans-serif")
            .style("font-size", 11)
            .style('fill', '#777')
            .style("font-weight", 500)
            .attr("fill", "#333");

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
    });

    d3.selectAll("circle.advPayervalueChartBubble").on("mouseout", function(e) {
        d3.selectAll(".popupOnValueChartParentWindow").remove();
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
        //  //Change position of method execution
        d3.selectAll(".popupOnValueChartParentWindow").remove();
    });
}