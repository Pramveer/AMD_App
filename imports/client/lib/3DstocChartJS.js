//$.fn.stocCharts = function (data, xFieldName, yFieldName,styleConfg) {
		$.fn.stocCharts = function (styleConfg) {
        var WM = {
            attachWaterMark: function (id) {
                selectorElement.parent().css('background-image', 'url()');/*http://www.stocinn.com/stoccharts/img/stoc-chart-logo.png*/
                selectorElement.parent().css('background-repeat', ' no-repeat');
                selectorElement.parent().css('background-position', 'bottom right');
            }
        }
        var selectorElement = $(this);
		var selectedElementId=$(selectorElement).attr("id");

        WM.attachWaterMark(selectorElement);
        var svgElement;
        var width;
        var height;
		var textStyleConfg;
		var margin = {
            "left": 10,
                "right": 35,
                'top': 5,
                "bottom": 35,
                "scale": 5
        };
		
        var yAxis;
        var xAxis;
        var yScale;
        var xScale;
        var parseDate = d3.time.format("%Y-%m-%d");
        var formatDate = d3.time.format("%b ");
        var minYScale;
        var maxYScale;
        var chartData;
        var marginSvg = 50;
		var margin={"left":10,"right":35,'top':10,"bottom":35,"scale":50,'areaLeft':60};
		var cfgArea;
		var xFieldName;
		var yFieldName;

        var agnitioChart = {
            drawYAxis: function () {
                var svg = d3.select(".yaxis")
                    .append('svg')
                    .attr('width', 40)
                    .attr('height', $(selectorElement).height());

                svg.append("g")
                    .attr("class", "y axis agnitio")
                    .attr("transform", "translate(" + (8) + "," + margin.top + ")")
                    .attr("stroke", 'black')
                    .attr("fill", 'none')
                    .call(yAxis)
            },
            drawMulitpleLineChartWithSquare: function (options) {
                var options = $.extend({
                    'lineArray': [],
                    'squareArray': []
                }, options);

                var lineArrayData = options.lineArray;
                var squareArryData = options.squareArray;

                var minValue, maxValue;
                for (var i = 0; i < lineArrayData.length; i++) {
                    var lineObj = lineArrayData[i];
                    var yField = lineObj.yFieldName;

                    var array = d3.extent(lineObj.data, function (d, i) {
                        return d[yField];
                    });
                    if (i == 0) {
                        minValue = array[0];
                        maxValue = array[1];
                    } else {
                        if (minValue > array[0]) {
                            minValue = array[0];
                        }
                        if (maxValue < array[1]) {
                            maxValue = array[1];
                        }
                    }
                }

                yScale.domain([minValue, (maxValue + 3)]);

                for (var i = 0; i < lineArrayData.length; i++) {
                    var lineObj = lineArrayData[i];
                    var keyValueArray = {};
                    for (key in lineObj) {
                        keyValueArray[key] = lineObj[key];
                    }
                    lineChart.drawLine(keyValueArray);
                }


                for (var i = 0; i < squareArryData.length; i++) {
                    var squareObj = squareArryData[i];

                    var squareKeyValueOptions = {};
                    for (key in squareObj) {
                        squareKeyValueOptions[key] = squareObj[key];
                    }
                    drawSquare.squareChart(squareKeyValueOptions);
                }
            }

        }
        
		var DataConverter={
		 getValueToPercentageArray:function(valueArray){
				var perArray=[];
				var sumEle=0;
				for(var d=0;d<valueArray.length;d++){			
					   sumEle+=valueArray[d];				
				}				
				for(var d=0;d<valueArray.length;d++){	
					   perArray.push((valueArray[d]/sumEle)*100);	
				}
				return perArray;
			 
		 }
			
		};
		
		var legendController={
     getLegendPositionArray:function(legendArray,width,height){
   
    var pixcelPerChar=6,widthLimit=width*0.7,textSeparator=10,nextLineSeparator=(height*0.05),endPos=0,legendPositionArray=[],legendWidth=10,nextLineCounter=0,yPos=0;
    for(var i=0;i<legendArray.length;i++){
     var legendObj=legendArray[i].toString();
     var obj={"x":0,"y":0,"endPos":0};
     
     var xPos=0;//(width*0.05);
     var initPos=(width*0.08);
     var legendSeparator=(width*0.05);
     if(initPos<30){
    initPos=30;
     }
     
     if(legendSeparator<20){
    legendSeparator=20;
     }
     
     if(i == 0){
      xPos=initPos;
     }
     else{
      xPos=legendPositionArray[i-1].endPos;
     }
     //yPos=0;
     var xEndPos=xPos+legendWidth+(legendObj.length*pixcelPerChar)+textSeparator+legendSeparator;
     if(xEndPos>widthLimit){
      //means shift the legend to new line
      nextLineCounter++;
      xPos=initPos;
      xEndPos=xPos+legendWidth+(legendObj.length*pixcelPerChar)+textSeparator+legendSeparator;
      yPos=nextLineCounter*nextLineSeparator;
     }
     
     obj.x=xPos;
     obj.y=yPos;
     obj.endPos=xEndPos;
     obj.textPos=xPos+legendWidth+textSeparator;
     
     legendPositionArray.push(obj);
    }
    return legendPositionArray;
     },

	showHorizontalLegend:function(scaleWidth,yPositionOfLegend,legendArray,legendSize)
	{			
			var largestStringLngth=0;
					for(var counter =0 ;counter<legendArray.length;counter++)
					{
						if(largestStringLngth<(legendArray[counter].toString()).length)
						{
							largestStringLngth = (legendArray[counter].toString()).length;
						}
					}		
			largestStringLngth = largestStringLngth * 6.5;
			var legendPositionArray = [];
			var obj={"x":0,"y":0,"textXPos":0};
			var seprator = 5;	
			var xPositionOfLegend = scaleWidth*.1;
			var temp,flag = scaleWidth*.1;
			var legendRow = Math.round((scaleWidth*.75)/(seprator+legendSize+largestStringLngth));
			
			for(var counter = 0 ; counter<legendArray.length ; counter++)
			{
				var obj={};
				if(counter%legendRow == 0)
				{
					xPositionOfLegend = scaleWidth*.1;
				}
				else
				{
					xPositionOfLegend = xPositionOfLegend+seprator+legendSize+largestStringLngth;
				}
				obj.x = xPositionOfLegend;
				
				if(counter%legendRow == 0  && counter!=0)
				{
					yPositionOfLegend = (yPositionOfLegend)+(2*legendSize);
				}
				obj.y = yPositionOfLegend;
				
				obj.textXPos = xPositionOfLegend+seprator + legendSize;
				
				legendPositionArray.push(obj);
					
			}	
			return legendPositionArray;
	} 
  };
  var axisLabelController={
	   //appendLabel:function(labelName,labelPos,svgElement,width,height){
	   appendLabel:function(labelName,labelXPos,labelYPos,rotateDeg,targetElem,labelColorArg,fontWeightArg){
		/*
		var leftPos=0;
		var topPos=0;
		var rotateDeg=-90;
		var pixcelPerChar=6;
		var totalPixels=0;
		
		labelName=labelName.toString();
		totalPixels=labelName.length*pixcelPerChar;
		
		var pixcelMid=totalPixels/2;
		
		if(labelPos == "left"){
		 leftPos=width*0.05;
		 rotateDeg=-90;
		 topPos=height/2+pixcelMid;
		}
		if(labelPos == "right"){
		 leftPos=width*0.97;
		 rotateDeg=90;
		 topPos=height/2+pixcelMid;
		}
		if(labelPos == "bottom"){
		 topPos=height*0.97;
		 rotateDeg=0;
		 leftPos=width/2+pixcelMid;
		}
		*/
		
		var labelColor="black",fontWeight=300;
		
		if(!isNaN(labelColorArg) || !(labelColorArg === undefined)){
			labelColor=labelColorArg;
		}
		
		if(!isNaN(fontWeightArg) || !(fontWeightArg === undefined)){
			fontWeight=fontWeightArg;
		}
		
		
		var textElem=targetElem
					.append("text");
		
		textElem.text(labelName)
		.attr("transform","translate("+labelXPos+","+labelYPos+") rotate("+rotateDeg+")")
		.style("font-family","italic","important")
		.style("fill",labelColor,"important")
		.style("font-weight",500,"important")
		.style("font-size",14,"important");
		
		
	   }
  }
		var tickController = {
            getTickArray: function (minVal, maxVal, noOfTicksRequired) {
                var tickArray = [];
                var factor = Math.round((maxVal - minVal) / (noOfTicksRequired - 1));
                var curval = minVal;
                tickArray.push(curval);
                noOfTicksRequired--;
                for (var i = 1; i < noOfTicksRequired; i++) {
                    curval += factor;
                    tickArray.push(curval);
                    if (i == noOfTicksRequired - 1) tickArray.push(maxVal);
                }
                return tickArray;
            },
            getXTickArray: function (minVal, maxVal, maxCharacterLength, svgWidth) {
                var tickArray = [];
                var maxTickWidth = 2 * 6.5 * maxCharacterLength;
                var totalTicks = Math.round(svgWidth / maxTickWidth);

                var curval = minVal;
                tickArray.push(curval);
                var factor = (maxVal - minVal) / totalTicks;
				
                while (curval < maxVal) {
					//alert(curval+"::"+maxVal+"::"+factor);
                    curval = Math.floor(curval + factor);
                    if (tickArray.indexOf(curval) == -1 && curval <= maxVal) 
					tickArray.push(curval);
					else
					curval++;
					
                }
				
                return tickArray;
            }
    };
	var textWrapper = {
					
					wrapText: function (text, width) 
					{
					
					text.each(function() {
					
					var text = d3.select(this);
					
					var words = text.text().split(/\s+/).reverse();
					
					var	word,
						line = [],
						lineNumber = 0,
						lineHeight = 1.1, // ems
						y = text.attr("y"),
						dy = parseFloat(text.attr("dy")),
						tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
					while (word = words.pop()) {
					  line.push(word);
					  tspan.text(line.join(" "));
					  if (tspan.node().getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
					  }
					}
				  });
					/*
					  text.each(function() 
					  {
						var text = d3.select(this),
							words = text.text().split(/\s+/).reverse(),
							word,
							line = [],
							lineNumber = 0,
							lineHeight = 1.1, // ems
							y = text.attr("y"),
							dy = parseFloat(text.attr("dy")),
							tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
						while (word = words.pop()) 
						{
						  line.push(word);
						  tspan.text(line.join(" "));
						  console.log((tspan.node().getComputedTextLength() > width));
						  if (tspan.node().getComputedTextLength() > width) 
						  {
							line.pop();
							tspan.text(line.join(" "));
							line = [word];
							tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
						  }
						}
						
					  });
					  */
					}

				/*	function type(d) {
					  d.value = +d.value;
					  return d;
					}  */
			};
        var toolTipManager = {
			
			
			appendToolTip:function(){
				var tootTipTemplate ='<div id="tooltipChart" style="z-index:999999;float:none;display:none; margin:0px; padding:0px; position:absolute; width:150px;">'+
						'<div id="textContainer" style="width:150px; background-color:#eeeeee; border:solid 1px #666666; box-shadow:5px 5px 5px #5d5d5d; border-radius:7px; font-family:calibri; float:left; font-size:11px; padding:10px;">'+
						'	<div class="xVal" style="text-align:center; font-size:13px; background-color:#6699cc; border-top-left-radius:7px; margin-top:-10px; margin-left:-10px;  margin-right:-10px;border-top-right-radius:7px; padding:5px 10px;">14 jan</div>'+
							'<div id="y-label" class="y-label label1" style="width:60%;display:none; float:left; text-align:left; padding:3px 0;">Auto Loans</div>'+
							'<div  class="yVal label1" style="width:40%; float:right;display:none; text-align:right;  padding:3px 0;">$ 400</div>'+
					'		<div class="y-label label2" style="width:60%; float:left;display:none; text-align:left; padding:3px 0;">Auto Loans</div>'+
					'		<div class="yVal label2" style="width:40%;display:none; float:right; text-align:right;  padding:3px 0;">$ 400</div>'+
					'		<div class="y-label label3" style="width:60%; float:left; text-align:left; padding:3px 0;">Auto Loans</div>'+
					
					'		<div class="yVal label3" style="width:40%; float:right; text-align:right;  padding:3px 0;">$ 400</div>'+
					'	</div>'+
					'	<div id="handIcon" style="position: relative; bottom:1px; height:40px; width:36px; '+
					'	 background:url(http://www.stocinn.com/stoccharts/img/toolTips-arrow.png) no-repeat; clear:both; float:right; margin-bottom:-2px; right:-2px;">'+
					'	 </div>'+
					'</div>';
					
				$('body').append(tootTipTemplate);
				
			},
            appendToolTipOld: function () {
                var tootTipTemplate = "<div id='tooltipChart' style='display:none;position:absolute;background:rgba(0, 0, 0, 0.8); width:120px;  min-height: 40px; z-index:99999999 !important;box-shadow: inset 0 0 40px #222221;float:left; border-radius:5px; font-family: Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif;  color:white; text-shadow: 1px 0 1px #000;    '>" +
                    "<div class='arrow' style='position: absolute;margin-left: -8px;font-size: 24px;color:#272726; text-shadow:none; top: 7px;'><i class='fa fa-caret-left'></i></div>" +

                    "<div id='textContainer'>" +
                    "<div   style='clear:both;width:100%;padding:2px 5px '><div style='width:50%;float:left;' class='xVal'></div></div>" +
                    "<div  class='yContainer1 yDiv' style='clear:both;width:100%;padding:5px'><label id='y-label'  style='width:50%;float:left;'>Value</label><div class='yVal' id='yVal' style='width:45%;margin-left:5%;float:left;'></div></div>" +

                    "</div>" +
                    "</div>" +
                    "</div>";
                $('body').append(tootTipTemplate);

            },
            showToolTip: function (e, yValArg, xValArg, hideXVal, yHeadingMap,pageY) {
				
				//$('#tooltipChart').show();
				
				var x = e.pageX;
				
                var y; 
				
				if(isNaN(pageY)){
					y=e.pageY;
				}else{
					console.log("given pageY");
					y=pageY;
				}


                var yVal;
                yVal = yValArg;


                var timeVal;

                timeVal = xValArg;
                $('#tooltipChart').find('.xVal').html("");
				/*
                if (hideXVal) {
                    $('#tooltipChart').find('.xVal').html("");
                } else {
                   
                }
					*/
				 $('#tooltipChart').find('.xVal').html(timeVal);
				 
				//blank yLabel	
				$('#tooltipChart').find('.y-label').html("");
				
				//blank yVal
				$('#tooltipChart').find('.yVal').html("");
				
				//hide all  yLabel and yVal
				$('#tooltipChart').find('.yVal').hide();
				$('#tooltipChart').find('.y-label').hide();
				
				var toolTipRef=$('#tooltipChart');
				//get YHeadingNames width Values and iterate to update yLabel and YVal 
				for(var i=0;i<yHeadingMap.length;i++){
					var headingObj=yHeadingMap[i];
					var counter=i+1;
					var yLabelClass=".y-label.label"+counter;
					var yValClass=".yVal.label"+counter;
					$(toolTipRef).find(yLabelClass).html(headingObj.headingName);
					$(toolTipRef).find(yValClass).html(headingObj.headingVal);
					
					$(toolTipRef).find(yValClass).show();
					$(toolTipRef).find(yLabelClass).show();
				}
				
				/*
                $('#tooltipChart').find('.yVal').html(yVal);

                $('#tooltipChart').find('#y-label').html("");
                if (yHeadingName === undefined) {

                } else {
                    $('#tooltipChart').find('#y-label').html(yHeadingName);
                }
				*/
				
                var marginLeft = x;
                if ($(".ps-scrollbar-x-rail")) {
                    try {
                        marginLeft += parseInt($(".ps-scrollbar-x-rail").css('left').replace("px", ''));
                    } catch (err) {

                    }
                }

                var tooTipElem = $('body').find("#tooltipChart");
                var toolTipTextContainer = $(tooTipElem).find("#textContainer");
				
				
				/*
                if (($(window).width() - marginLeft) < $('body').find("#tooltipChart").width()) {
                    marginLeft = marginLeft - $(tooTipElem).width();

                    $(tooTipElem).css('-ms-transform', 'rotate(-180deg)');
                    $(tooTipElem).css('-webkit-transform', 'rotate(-180deg)');
                    $(tooTipElem).css('transform', 'rotate(-180deg)');


                    $(toolTipTextContainer).css('-ms-transform', ' translateY(10px) rotate(180deg)');
                    $(toolTipTextContainer).css('-webkit-transform', 'translateY(10px)  rotate(180deg)');
                    $(toolTipTextContainer).css('transform', 'translateY(10px) rotate(180deg)');

                } else {

                    $(tooTipElem).css('-ms-transform', '');
                    $(tooTipElem).css('-webkit-transform', '');
                    $(tooTipElem).css('transform', '');


                    $(toolTipTextContainer).css('-ms-transform', '');
                    $(toolTipTextContainer).css('-webkit-transform', '');
                    $(toolTipTextContainer).css('transform', '');

                }
				*/
				
				//alert(marginLeft +" : "+ $("body").find("#tooltipChart").width());
				
                var marginTop = y - ($("body").find("#tooltipChart").height()*0.98);
			//	marginLeft=marginLeft-($("body").find("#tooltipChart").width()*0.95);
				
			/*	if((marginLeft-$(tooTipElem).width())<170){
					marginLeft=marginLeft*0.8+$(tooTipElem).width();
					$(tooTipElem).find("#handIcon").css("right","94px");
				}else{
					$(tooTipElem).find("#handIcon").css("right","-14px");
				}*/
				
				marginLeft=marginLeft-($("body").find("#tooltipChart").width()*0.98);
				
                $('body').find("#tooltipChart").css("left", marginLeft);
                $('body').find("#tooltipChart").css("top", marginTop);
				//console.log("sss");
                $('body').find("#tooltipChart").show();

            },
            hideTooTip: function () {
                $('#tooltipChart').find('.yVal').html("");
                d3.select("#tooltipChart").style('display', 'none');
            },
            showToolTipForBarWithMultipleLine: function (e, yHeadingAndValueJson, xValArg, hideXVal, cx, isDraggerRequired) {

                var x = e.pageX;
                var y = e.pageY - $(selectorElement).find('svg').offset().top - 10;


                var timeVal;

                timeVal = xValArg;

                if (hideXVal) {
                    $('#draggLineToolTip').find('.xVal').html("");
                } else {
                    $('#draggLineToolTip').find('.xVal').html(timeVal);
                }
                if (isDraggerRequired) $('#draggLineToolTip').find('#tooltip-dragger').show();
                else $('#draggLineToolTip').find('#tooltip-dragger').hide();
                d3.select("#draggLineToolTip").selectAll(".yDiv").style("display", "none");

                var j = 1;
                for (key in yHeadingAndValueJson) {
                    var element = $(".yContainer" + (j)).show();
                    d3.select("#y-label" + (j)).html(key + " ");
                    d3.select("#yVal" + (j)).html(" " + yHeadingAndValueJson[key]);
                    j++;
                }





                var marginLeft = x + margin.left;
                if ($(".ps-scrollbar-x-rail")) {
                    try {
                        marginLeft += parseInt($(".ps-scrollbar-x-rail").css('left').replace("px", ''));
                    } catch (err) {

                    }
                }

                var tooTipElem = $('body').find("#draggLineToolTip");
                var toolTipTextContainer = $(tooTipElem).find("#textContainer");

                if (($(window).width() - marginLeft) < $('body').find("#draggLineToolTip").width()) {
                    marginLeft = marginLeft - $(tooTipElem).width();

                    $(tooTipElem).css('-ms-transform', 'rotate(-180deg) translate(15px)');
                    $(tooTipElem).css('-webkit-transform', 'rotate(-180deg) translate(15px)');
                    $(tooTipElem).css('transform', 'rotate(-180deg) translate(15px)');


                    $(toolTipTextContainer).css('-ms-transform', ' translateY(10px) rotate(180deg)');
                    $(toolTipTextContainer).css('-webkit-transform', 'translateY(10px)  rotate(180deg)');
                    $(toolTipTextContainer).css('transform', 'translateY(10px) rotate(180deg)');

                } else {

                    $(tooTipElem).css('-ms-transform', '');
                    $(tooTipElem).css('-webkit-transform', '');
                    $(tooTipElem).css('transform', '');


                    $(toolTipTextContainer).css('-ms-transform', '');
                    $(toolTipTextContainer).css('-webkit-transform', '');
                    $(toolTipTextContainer).css('transform', '');

                }

                var marginTop = e.pageY - ($(selectorElement).find("#draggLineToolTip").height() / 2);
                if (cx != null) {
                    //$('body').find("#draggLineToolTip").css("left", parseFloat(cx) + 100);
					$('body').find("#draggLineToolTip").css("left", marginLeft);
                } else {
                    $('body').find("#draggLineToolTip").css("left", marginLeft - 5);
                }

                $('body').find("#draggLineToolTip").css("top", marginTop - 20);
                $('body').find("#draggLineToolTip").show();

            },
            hideMulitpleLineBarToolTip: function () {
                d3.select('#draggLineToolTip').style('display', 'none');
            },
            appendToolTipForBarWithMultipleLine: function () {
                var tootTipTemplate = "<div id='draggLineToolTip' style='display:none;position:absolute;background:rgba(0, 0, 0, 0.8); width:120px;  min-height: 40px; z-index:99999999 !important;box-shadow: inset 0 0 40px #222221;float:left; border-radius:5px; font-family: Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif;  color:white; text-shadow: 1px 0 1px #000;    '>" +
                    "<div  id='tooltip-dragger' style='position: absolute;margin-left: -8px; border-left:solid 1px #000; min-height:250px; top:-100px;'></div>" +

                    "<div class='arrow' style='position: absolute;margin-left: -8px;font-size: 24px;color:#272726; text-shadow:none; top: 7px;'><i class='fa fa-caret-left'></i></div>" +


                    "<div id='textContainer'>" +
                    "<div   style='clear:both;width:100%;padding:2px 5px '><div style='width:50%;float:left;' class='xVal'></div></div>" +
                    "<div  class='yContainer1 yDiv' style='clear:both;width:100%;padding:5px'><label id='y-label1'  style='width:50%;float:left;'>Value</label><div class='yVal' id='yVal1' style='width:42%;float:left;margin-left:8%;'></div></div>" +
                    "<div  class='yContainer2 yDiv' style='clear:both;width:100%;padding:5px'><label id='y-label2' style='width:50%;float:left;'>Value</label><div class='yVal' id='yVal2' style='width:42%;float:left;margin-left:8%;'></div></div>" +
                    "<div  class='yContainer3 yDiv' style='clear:both;width:100%;padding:5px'><label id='y-label3' style='width:50%;float:left;'>Value</label><div class='yVal' id='yVal3' style='width:42%;float:left;margin-left:8%;'></div></div>" +
                    "<div  class='yContainer4 yDiv' style='clear:both;width:100%;padding:5px'><label id='y-label4' style='width:50%;float:left;'>Value</label><div class='yVal' id='yVal4' style='width:42%;float:left;margin-left:8%;'></div></div>" +
                    "<div  class='yContainer5 yDiv' style='clear:both;width:100%;padding:5px'><label id='y-label5' style='width:50%;float:left;'>Value</label><div class='yVal' id='yVal5' style='width:42%;float:left;margin-left:8%;'></div></div>" +
                    "</div>" +
                    "</div>" +
                    "</div>";
                $('body').append(tootTipTemplate);
            }
        }


        var initSvg = function () {
            var marginSvg = 50;
            width = $(selectorElement).width() - marginSvg;
            height = $(selectorElement).height() - marginSvg;

            var selectorId = $(selectorElement).attr("id");

            var svgClassName = selectorId + "_svg";

            var tootTipTemplate = "<div id='tooltipChart' style='display:none;position:absolute;background:white;width:150px;z-index:99999999 !important;box-shadow:0 0 10px #c6c6c6;float:left;'>" +
                "<div class='arrow' style='position: absolute;margin-left: -8px;font-size: 24px;color: white;top: 24px;'><i class='fa fa-caret-left'></i></div>" +
                "<div class='toolTipHeading' style='padding:5px;background:#c6c6c6;border-bottom:solid 1px eae6e3;'>Chart tool Tip</div>" +
                "<div  style='clear:both;width:100%;padding:5px'><label style='width:50%;float:left;'>Time</label><div style='width:50%;float:left;' class='xVal'></div></div>" +
                "<div  style='clear:both;width:100%;padding:5px'><label style='width:50%;float:left;'>Value</label><div class='yVal' style='width:50%;float:left;'></div></div>" +
                "</div>";
            //$(selectorElement).append(tootTipTemplate);


            svgElement = d3.select("#" + selectorId)
                .append("svg")
                .attr("width", $(selectorElement).width())
                .attr("height", $(selectorElement).height()).attr('class',selectorId+"_svg");

            xScale = d3.time.scale().range([0, (width - margin.scale)]);
            yScale = d3.scale.linear().range([(height - margin.scale), 0]);

            minYScale = d3.min(data, function (d) {
                return d[yFieldName];
            });
            maxYScale = d3.max(data, function (d) {
                return d[yFieldName];
            });


			maxYScale=maxYScale*1.5;
            xScale.domain(d3.extent(data, function (d, i) {
                return parseDate.parse(d[xFieldName]);
            }));

            yScale.domain([minYScale,maxYScale]);

            xAxis = d3.svg.axis().scale(xScale)
                .orient("bottom").ticks(4).tickSize(5, 0).tickFormat(formatDate);

            yAxis = d3.svg.axis().scale(yScale)
                .orient("right").ticks(4).tickSize(5, 0);

            svgElement = svgElement.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        };

        var lineChart = {
            drawLine: function (options) {
                var options = $.extend({
                    'color': 'red',
                        'axisColor': 'blue',
                        'data': [],
                        'xFieldName': '',
                        'yFieldName': '',
                        'showAllTicks': false,
                        'formatDate': '%b %d'
                }, options);

			
				
                var data;
                if (options.data.length == 0) {
                    data = chartData;
                } else {
                    data = options.data;
                }


                var xFieldNameLine;
                var yFieldNameLine;
                if (options.xFieldName == "") {
                    xFieldNameLine = xFieldName;
                } else {
                    xFieldNameLine = options.xFieldName;
                }

                if (options.yFieldName == "") {
                    yFieldNameLine = yFieldName;
                } else {
                    yFieldNameLine = options.yFieldName;
                }

                if ($(selectorElement).find(".axis").length == 0) {
                    var formatXAxis = d3.time.format(options.formatDate);

                    if (options.showAllTicks) {
                        xAxis.ticks(d3.time.days, 1).tickFormat(formatXAxis).tickSize(0).tickPadding(8);
                    }
                    xAxis.tickFormat(formatXAxis).tickSize(0).tickPadding(8);


                    svgElement.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (height - margin.scale + 10) + ")")
                        .attr("stroke", options.axisColor)
                        .attr("fill", 'none')
                        .call(xAxis).selectAll(".tick")
                        .each(function (data) {
                        var date = new Date(data);
                        date = convertDateIntoYYMMDD(date);
                        svgElement.append("line")
                            .attr('class', 'horizontalGridLine')
                            .attr('x1', function () {

                            return xScale(parseDate.parse(date));
                        })
                            .attr('x2', function () {
                            return xScale(parseDate.parse(date));
                        })
                            .attr('y1', 0)
                            .attr('y2', (height - margin.scale + 10)).attr('stroke', '#F2F3F3');
                    });

                    svgElement.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + (width - margin.scale + 10) + "," + 3 + ")")

                        .attr("fill", options.axisColor)
                        .call(yAxis);
                }

                var line = d3.svg.line()
                    .interpolate("linear")
                    .x(function (d, i) {
                    return (xScale(parseDate.parse(d[xFieldNameLine])) + 5);
                })
                    .y(function (d, i) {
                    return (yScale(d[yFieldNameLine]) - 10);
                })

                var className = $(selectorElement).attr("id") + "_line" + yFieldName;
                var path = svgElement.append("path")
                    .attr("d", line(data))
                    .attr("stroke", options.color)
                    .attr("class", className)
                    .attr("stroke-width", "2")
                    .attr("fill", "none")
                    .on("mouseover", function () {
                    attachToolTip.showToolTip(d3.event);
                })
                    .on("mouseleave", function () {
                    attachToolTip.hideToolTip(d3.event);
                });



            },
            drawBarWithMultipleLineAndCircle: function (options) {
                var options = $.extend({
                    'data': [],
                        'xAxis': [],
                        'marginLeft': 40,
                        'marginRight': 40,
                        'marginTop': 60
                }, options);

				var xAxisTick = options.xAxis.ticks;
                toolTipManager.appendToolTipForBarWithMultipleLine();
                var isRedrawChart = false;


                var rawData = options.data;


                var yFieldList = [];

                yFieldList = d3.keys(options.data);




                var color = d3.scale.ordinal();

                var colorList = [];
                var modifiedData = [];
                for (key in rawData) {
                    var obj = rawData[key];
                    colorList.push(obj.color);
                    modifiedData.push(obj.data);
                }

                color.domain(yFieldList);
                color.range(colorList);
				var counter=0;
                var multipleLineChartData = color.domain().map(function (keyName) {
                    return {
                        "name": keyName,
                            "values": rawData[keyName].data.map(function (d, i) {

                            return {
                                "x": i,
                                    "y": d,
                                    "timeIndex": options.xAxis.ticks[i],
                                    'name': keyName,
                                    'indicationLabel': rawData[keyName].indicationLabel
									
                            };
                        }),
                            'chartType': rawData[keyName].chartType,
                            'lineType': rawData[keyName].lineType
                    }
					counter++;
                });
				
				var legendMap={};
				for(var i=0;i<multipleLineChartData.length;i++){
					legendMap[multipleLineChartData[i].name]="legend-"+i;
					//alert(multipleLineChartData[i].name);
				}
				
				console.log("hi");
                var arrayListForHover = [];
                for (var j = 0; j < multipleLineChartData[0].values.length; j++) {
                    var obj = {};
                    for (var k = 0; k < yFieldList.length; k++) {
                        obj[yFieldList[k]] = multipleLineChartData[k].values[j].y + ":" + multipleLineChartData[k].values[j].indicationLabel;
                    }
                    obj["x"] = j;
                    obj["timeIndex"] = options.xAxis.ticks[j];

                    arrayListForHover.push(obj);
                }

                maxYScale = maxYScale * 1.4;

                height = height - options.marginTop * 1.5;

				var toggle = false;
                var left = 0;
                var right = 0;
                var headingGap = 40;
                var labelGap = 40;
                var yScaleJson = {};

                for (var i = 0; i < yFieldList.length; i++) {

                    toggle = !toggle;
                    if (toggle) {
                        right = right + options.marginRight + headingGap;
                    } else {
                        left = left + options.marginLeft + headingGap;
                    }

                    minYScale = d3.min(rawData[yFieldList[i]].data, function (d) {
                        return d;
                    });

                    maxYScale = d3.max(rawData[yFieldList[i]].data, function (d) {
                        return d;
                    });

                    maxYScale = maxYScale * 1.5;
                    yScale = d3.scale.linear()
                        .domain([minYScale, maxYScale])
                        .range([height, 0]);

                    yScaleJson[yFieldList[i]] = yScale;

                    var ticksArray = tickController.getTickArray(minYScale, maxYScale, 5);


                    var yAxisElem = svgElement.append('g')
                        .attr('class', 'y axis')

                        .attr("transform", function () {

                        if (toggle) {
                            yAxis = d3.svg.axis().scale(yScale).orient("right")
                                .tickValues(ticksArray).tickSize(5, 0);

                            return "translate(" + (width - right) + "," + options.marginTop + ")"
                        } else {
                            yAxis = d3.svg.axis().scale(yScale).orient("left")
                                .tickValues(ticksArray).tickSize(5, 0);
                            return "translate(" + (left) + "," + options.marginTop + ")"
                        }
                    })
                        .attr("stroke", options.axisColor)
                        .attr("fill", 'none')
                        .call(yAxis);

                    yAxisElem.selectAll('text')
                        .text(function (textValue) {
							return textValue + " " + rawData[yFieldList[i]].unit;
						})
                        .style('fill', rawData[yFieldList[i]].color);

                    if (toggle) {
                        var textYPos = height / 2 + rawData[yFieldList[i]].indicationLabel.length * 2;
                        yAxisElem.append("text")
                            .text(function () {
								return rawData[yFieldList[i]].indicationLabel;
							})
                            .attr('transform', "translate(" + (headingGap + labelGap) + "," + (textYPos) + ") rotate(-90)")
                            .style('fill', rawData[yFieldList[i]].color);
                    } else {
                        var textYPos = height / 2 + rawData[yFieldList[i]].indicationLabel.length * 2;
                        yAxisElem.append("text")
                            .text(function () {
                            return rawData[yFieldList[i]].indicationLabel;
                        })
                            .attr('transform', "translate(" + (-headingGap - labelGap/2) + "," + (textYPos) + ") rotate(-90)")
                            .style('fill', rawData[yFieldList[i]].color);
                    }


                    if (i == 0) {

                        yAxisElem.selectAll(".tick")
                            .each(function (tickValue) {
                            svgElement.append("line")
                                .attr('class', 'horizontalGridLine')
                                .attr('x1', left)
                                .attr('x2', (width - right))
                                .attr('y1', function () {

                                return yScale(tickValue);
                            })
                                .attr('y2', function () {
                                return yScale(tickValue);
                            }).attr('stroke', '#F2F3F3');
                        })
                            .style("display", function () {
                            if (options.hideAxis) {
                                return "none";
                            } else {
                                return "block";
                            }
                        });
                    }

                }


                width = width - left;


                var svgElement1 = svgElement.append("g")
                    .attr("transform", "translate(" + (left - 40) + "," + options.marginTop + ")")
                    .attr("class", 'grouping');


                xScale = d3.scale.linear()
                    .range([left, width - right]);

                var minXScale = d3.min(multipleLineChartData, function (d) {
                    return d3.min(d.values, function (data) {

                        return data["x"];
                    });
                });
                var maxXScale = d3.max(multipleLineChartData, function (d) {
                    return d3.max(d.values, function (data) {

                        return data["x"];
                    });
                });

                xScale.domain([minXScale, maxXScale]);
				
				var largestStringLngth=0;
					for(var counter =0 ;counter<xAxisTick.length;counter++)
					{
						if(largestStringLngth<(xAxisTick[counter].toString()).length)
						{
							largestStringLngth = (xAxisTick[counter].toString()).length;
						}
					}
					
                xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.tickValues(tickController.getXTickArray(0,(xAxisTick.length-1),largestStringLngth, (width - right - left)));
							
			//	alert(xAxisTick);			
			//	alert(tickController.getXTickArray(0,(xAxisTick.length),largestStringLngth, (width - right)));
				
                var xAxisElem = svgElement.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + (left-40) + "," + (height + options.marginTop) + ")")
                    .attr("stroke", options.axisColor)
                    .attr("fill", 'none')
                    .call(xAxis);
					
				xAxisElem.selectAll('text')
						 .text(function(d){return xAxisTick[d];})
						 .attr('fill','black');	
	
				/*	
                var ticks = xAxisElem.selectAll(".tick");
                for (var j = 0; j < ticks[0].length; j++) {
                    var c = ticks[0][j],
                        n = ticks[0][j + 1];
                    if (!c || !n || !c.getBoundingClientRect || !n.getBoundingClientRect) continue;
                    while (c.getBoundingClientRect().right > n.getBoundingClientRect().left) {
                        d3.select(n).remove();
                        j++;
                        n = ticks[0][j + 1];
                        if (!n) break;
                    }
                }

                xAxisElem.selectAll("text")
                    .text(function (d) {
                    var textValue = d;

                    var xObj;
                    for (var i = 0; i < multipleLineChartData[0].values.length; i++) {
                        var currentObj = multipleLineChartData[0].values[i];

                        if (parseInt(textValue) == currentObj.x) {
                            xObj = currentObj;
                        }
                    }

                    return " " + xObj["timeIndex"];

                });
				*/

                var barChartData = multipleLineChartData.filter(function (obj) {
                    return (obj.chartType == "bar");
                });
				
				var barWidth = (width / barChartData[0].values.length);
                barWidth = barWidth / 2;
                var bars = svgElement1.selectAll(".bar")
                    .data(barChartData[0].values)
                    .enter()
                    .append("rect")
                    .attr("class", function (d) {
                    return "multichart bar " + legendMap[d.name] + " " + "pos_" + Math.floor(xScale(d.x));
                })
                    .attr("width", barWidth)
                    .attr("height", function (d) {
                    return 0;
                })
                    .attr("x", function (d) {

                    return 0;
                })
                    .attr("y", function (d) {
                    var scale = yScaleJson[d.name];
                    return scale(d.y);
                });


                bars.transition().duration(1000).attr('x', function (d) {
                    return (xScale(d.x) - (barWidth / 2));
                })
                    .attr('height', function (d) {
                    var scale = yScaleJson[d.name];
                    return (height - scale(d.y));
                })
                    .attr("fill", function (d) {
			
				    return color(d.name);
                });



                var lineGroup = svgElement1.selectAll("g.multipleLineGrouping")
                    .data(multipleLineChartData.filter(function (objData) {
                    return (objData.chartType != 'bar');
                }))
                    .enter()
                    .append('g')
                    .attr('class', 'multipleLineGrouping');


                var line;

                function linePath(lineType, lineData) {

                    line = d3.svg.line()
                        .interpolate(lineType)
                        .x(function (d, i) {
                        return xScale(d.x);
                    })
                        .y(function (d, i) {
                        var scale = yScaleJson[d.name];
                        return (scale(d.y));
                    });

                    return line(lineData);
                }



                var path = lineGroup.append("path")
                    .attr("d", function (d) {
                    return linePath(d.lineType, d.values);
                })
                    .attr("class", function (d) {

                    return "multipleLine " + legendMap[d.name] + " " + "pos_" + Math.floor(xScale(d.x));
                })
                    .attr("stroke", function (d) {
                    return color(d.name);
                })
                    .attr("fill", "none");





                var totalLength = path.node().getTotalLength();

                path.attr("stroke-dasharray", function (d) {


                    var dashLen = 3;
                    var ddLen = dashLen * 2;
                    var darray = dashLen;
                    while (ddLen < totalLength) {
                        darray += "," + dashLen + "," + dashLen;
                        ddLen += dashLen * 2;
                    }

                    if (rawData[d.name].isDottedLine) {
                        dottedLineParam = darray + "," + totalLength;
                    } else {
                        dottedLineParam = totalLength + "," + totalLength;
                    }
                    return dottedLineParam;
                })
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0)



                lineGroup.selectAll("circle.multipleLineCircle")
                    .data(function (d) {
                    return d.values;
                })
                    .enter()
                    .append("circle")
                    .attr("class", function (d) {
                    return "multichart  multipleLineCircle " + legendMap[d.name] + " " + "pos_" + Math.floor(xScale(d.x));
                })
                    .attr('cx', function (d) {
                    return xScale(d.x);
                })
                    .attr("cy", function (d) {
                    var scale = yScaleJson[d.name];
                    return scale(d.y);
                })
                    .attr("r", "3")
                    .attr("fill", function (d) {
                    return color(d.name);
                });

				
				var widthEachLegend=(width-right)/color.domain().slice().length;
				widthEachLegend=left+widthEachLegend;
				
                var mulitpleLineChartLegend = svgElement1.selectAll(".legend")
                    .data(color.domain().slice().reverse())
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) {
                    //return "translate(" + (left + i * 100) + "," + 0 + ")";
					//widthEachLegend
					return "translate(" + (widthEachLegend*(i+1))/2 + "," + 0 + ")";
                });

                var rectWidth = 18;
                var textGap = 10;
                var xRectLegend = 0;
                var xTextLegend = xRectLegend + rectWidth + textGap;

                var hideLegendList = {};
                mulitpleLineChartLegend.append("rect")
                    .attr("x", xRectLegend)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", color)
                    .attr("class", function (d) {
                    return "legend-rect " + legendMap[d];
                })
                    .on('click', function (d) {


                    if ((d3.select(this).attr("class")).indexOf("disable") != -1) {

                        var className = "legend-rect";
                        d3.select(this).attr('class', className);

                        d3.select(this).style("fill", color);
                        d3.select(".legend-text." + legendMap[d]).style("text-decoration","line-through");

                        $(selectorElement).find(".multipleLineCircle." + legendMap[d]).show();

                        var selectedPath = svgElement.selectAll(".multipleLine." + legendMap[d]);
                        selectedPath.transition()
                            .duration(1000)
                            .ease("linear")
                            .attr("stroke-dashoffset", 0);
						
                        svgElement.selectAll(".bar." + legendMap[d])
                            .transition()
                            .duration(1000)
                            .attr("y", function (d) {
                            return yScale(d.y);
                        })
                            .attr('height', function (d) {
                            return (height - yScale(d.y));
                        });

                    } else {
                        $(this).addClass("disable");
                        var className = $(this).attr("class")
                        className = className + "  disable";

                        d3.select(this).attr('class', className);

                        d3.select(this).style("fill", "grey");
                        d3.select(".legend-text." + legendMap[d]).style("text-decoration","none");

                        $(selectorElement).find(".multipleLineCircle." + legendMap[d]).hide();

                        var selectedPath = svgElement.selectAll(".multipleLine." + legendMap[d]);

                        selectedPath.transition()
                            .duration(1000)
                            .ease("linear")
                            .attr("stroke-dashoffset", totalLength);

                        svgElement.selectAll(".bar." + legendMap[d])
                            .transition()
                            .duration(1000)
                            .attr("y", yScale(minYScale))
                            .attr('height', 0);

                    }
                });

                mulitpleLineChartLegend.append("text")
                    .attr("x", xTextLegend)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .attr('class', function (d) {
                    return "legend-text  " + legendMap[d];
                })
                    .text(function (d) {
                    return d;
                });


                d3.selectAll(".multichart").on('mouseover', function () {

                    var x = 0;
                    var classArray = $(this).attr('class').split(' ');

                    var xPos = classArray[classArray.length - 1];
                    d3.selectAll("." + xPos).attr("stroke", "blue");

                    var cxPos = d3.selectAll("circle." + xPos).attr("cx");


                    var xVal = Math.floor(Math.floor(xScale.invert(cxPos)));

                    var selectedObj;
                    for (var j = 0; j < arrayListForHover.length; j++) {

                        if (arrayListForHover[j].x == xVal) {

                            selectedObj = arrayListForHover[j];
                        }
                    }

                    if (!(selectedObj === undefined)) {


                        var toolTipVal = "";
                        var yKeyMapJsonArray = {};

                        for (var j = 0; j < yFieldList.length; j++) {
                            var fieldName = yFieldList[j];
                            var keyValue = selectedObj[fieldName].split(":")[0];
                            var keyLabel = selectedObj[fieldName].split(":")[1];
                            toolTipVal += fieldName + " : " + keyValue + " : " + keyLabel + " ";
                            yKeyMapJsonArray[keyLabel] = keyValue;
                        }

                        toolTipManager.showToolTipForBarWithMultipleLine(d3.event, yKeyMapJsonArray, selectedObj.timeIndex, false, cxPos, true)

                    } else {
                        toolTipManager.hideMulitpleLineBarToolTip();
                    }


                })
                    .on('mouseout', function () {
                    d3.selectAll(".multichart").attr("stroke", "");
                    toolTipManager.hideMulitpleLineBarToolTip();
                });

				//set font here
				
				//setTextStyleAndSvgBackGround(svgElement);
				
            }

        };

		
		var brushingChart={
			drawBrushing:function(callback){
				
				var data1=data;
				var selectedArea=d3.select("."+$(selectorElement).attr("id")+"_svg");//$(selectorElement).find("svg");//d3.select('.extent');
				 selectedArea
					.on("mousedown", mousedown)
					.on("mouseup", mouseup);
				var brushedContainer;
				
				var heightOfBrushedArea=height-margin.scale;//($(selectorElement).height()/1.2)-20;
				var heightMin=heightOfBrushedArea;//-yScale(minYScale);

				var isMouseDown=false;
				var initialPointOfDragging=0;	
				
				function mousedown() {
					
					var m = d3.mouse(this);
					brushedContainer = selectedArea.append("g").attr("transform", "translate("+0+"," +margin.top+ ")").attr("class","brushedArea").append("rect")
					.attr('class','brushedArea')
						.attr("x", m[0])
						.attr("y", yScale(maxYScale))
						.attr("width",0)
						.attr("height",function(){
							return heightOfBrushedArea;
							//return ;
						}).style("fill","rgba(1,1,1,.3)");
					initialPointOfDragging=m[0];
					selectedArea.on("mousemove",mousemove);
					isMouseDown=true;
				}
				
				function getData(){
					return data1;
				}
				
				
				var dataStarting,dataEnding,isMouseMove=false;
				function mouseup(){
					isMouseDown=false;
					if(isMouseMove){
						isMouseMove=false;
						var data1=getData();
						var startIndex=0,endIndex=0,isStartIndexFound=false,isLastIndexFound=false;
						
						for(var i=0;i<data1.length;i++){
							var dataObj=data1[i];
							//var objDate=new Date(dataObj[xFieldName]);
							//console.log(dataStarting +" : obj "+objDate);
							if((dataStarting == i)){
								startIndex=i;
								console.error("*** matched**");
								isStartIndexFound=true
							}
							if((dataEnding == i)){
								endIndex=i;
								isLastIndexFound=true
								console.error("*** matched ending**");
							}
						}
						
						if(isStartIndexFound && isLastIndexFound ){
							
							data1=data1.slice(startIndex,(endIndex+1));
							
							if((startIndex+3)<endIndex){
							
								$(selectorElement).find('svg g').empty();
								$(selectorElement).find(".brushedArea").remove();
								
								
								selectedArea.on("mousemove",null);
								selectedArea.on("mousedown",null);
								selectedArea.on("mouseup",null);
								
								callback(data1);
								
								//drawAreaChart.areaChart({'axisColor':'#222222','attachBrushEvent':true,'xAxisIndicationLabel':options.xAxisIndicationLabel,'yAxisIndicationLabel':options.yAxisIndicationLabel});
								//drawCircle.circleChart({'color':"black",'r':3,'data':data1});
							}else{
								alert("further  zooming is not feasible");
								$(selectorElement).find(".brushedArea").remove();
							}
						}
						//selectedArea.on("mousemove", null);
					}
				
				}
				var movementTimer = null;
				function mousemove() {
					console.log("Mosuemove");
					if(isMouseDown){
					//alert(data1.length);
						$(selectorElement).find("#tooltipChart").hide();
						var m = d3.mouse(this);
					    var bwidth=m[0]-initialPointOfDragging;
						brushedContainer.attr("width",bwidth);
					//	console.log("vakksjbshsddshj::: "+m[1]+"::  "+m[0]+":: "+width);
						dataStarting=Math.round(xScale.invert(m[1]));//new Date();
						dataEnding=Math.round(xScale.invert(m[0]));//new Date();
						console.log(Math.round(xScale.invert(m[1])) +":::"+Math.round(xScale.invert(m[0])));
						isMouseMove=true;
					}
					
				}
				 
			}
		};
		
		
		
        var drawBar = {
            barChart: function (options) {
                var options = $.extend({
                    'color': 'red',
                        'axisColor': 'blue',
                        'data': [],
                        'hideYAxis': false,
                        'widthOfBar': '',
                        'formatDate': '%b %d',
                        'showAllTicks': false,
                        'yFieldName': '',
                        'textonBar': false,
                        'yFieldName': '',
                        'padding': 0,
                        'attachBrushEvent': false,
                        'xAxisIndicationLabel': '',
                        'yAxisIndicationLabel': ''

                }, options);

                var data;
                if (options.data.length == 0) {
                    data = chartData;
                } else {
                    data = options.data;
                }

                var barYFieldName;
                if (options.yFieldName == "") {
                    barYFieldName = yFieldName;
                } else {
                    barYFieldName = options.yFieldName;
                }

                var differenceSlab = 10;
                var widthOfEachBar;

                if (options.widthOfBar == '') {
                    widthOfEachBar = Math.floor((width - margin.scale) / (data.length));
                } else {

                    widthOfEachBar = options.widthOfBar;
                }


                var elementId = $(selectorElement).attr("id");
                var className = elementId + "_rect_" + barYFieldName;





                if ($(selectorElement).find(".axis").length == 0) {

                    var formatXAxis = d3.time.format(options.formatDate);


                    if (options.showAllTicks) {
                        xAxis.ticks(d3.time.days, 1).tickFormat(formatXAxis).tickSize(0).tickPadding(8);
                    }
                    xAxis.tickFormat(formatXAxis).tickSize(0).tickPadding(8);

                    var xAxisElem = svgElement.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (height - margin.scale + 10) + ")")
                        .attr("stroke", options.axisColor)
                        .attr("fill", 'none')
                        .call(xAxis);

                    xAxisElem.selectAll(".tick")
                        .each(function (data) {
                        var date = new Date(data);
                        date = convertDateIntoYYMMDD(date);
                        svgElement.append("line")
                            .attr('class', 'horizontalGridLine')
                            .attr('x1', function () {

                            return xScale(parseDate.parse(date));
                        })
                            .attr('x2', function () {
                            return xScale(parseDate.parse(date));
                        })
                            .attr('y1', 0)
                            .attr('y2', (height - margin.scale + 10)).attr('stroke', '#F2F3F3');
                    });


                    var yAxisElem = svgElement.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + (width - margin.scale + 10) + "," + 3 + ")")
                        .attr("stroke", options.axisColor)
                        .attr("fill", 'none')
                        .call(yAxis);

                    yAxisElem.selectAll(".tick")
                        .each(function (data) {
                        svgElement.append("line")
                            .attr('class', 'horizontalGridLine')
                            .attr('x1', 0)
                            .attr('x2', (width - margin.scale + 10))
                            .attr('y1', function () {

                            return yScale(data) + 3;
                        })
                            .attr('y2', function () {
                            return yScale(data) + 3;
                        }).attr('stroke', '#F2F3F3');
                    })
                        .style("display", function () {
                        if (options.hideAxis) {
                            return "none";
                        } else {
                            return "block";
                        }
                    });


                }
                var barElements = svgElement.selectAll("." + className)
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("class", className)
                    .attr("x", function (d, i) {
                    return (xScale(parseDate.parse(d[xFieldName])) + options.padding);
                })
                    .attr("y", function (d) {
                    return yScale(d[barYFieldName]);
                })
                    .attr("width", widthOfEachBar)
                    .attr("height", function (d) {
                    return yScale(maxYScale);
                })
                    .on("mouseover", function (d) {
                    var yFieldVal = d[barYFieldName];
                    d3.select(this)
                        .attr("fill", 'red');

                    var parsedDate = parseDate.parse(d[xFieldName]);
                    var xVal = convertDateIntoYYMMDD(parsedDate);
                    attachToolTip.showToolTip(d3.event, yFieldVal, xVal, undefined);
                })
                    .on("mouseleave", function (d) {
                    var yFieldVal = d[barYFieldName];
                    d3.select(this)
                        .attr("fill", options.color);
                    attachToolTip.hideTooTip();
                });

                barElements.transition()
                    .duration(2000)
                    .attr('height', function (d, i) {
                    return (height - margin.scale) - yScale(d[barYFieldName]);
                }).attr("fill", options.color)


                if (options.textonBar) {
                    svgElement.selectAll(".barText")
                        .data(data)
                        .enter()
                        .append("text")
                        .text(function (d) {
                        return parseInt(d[barYFieldName]);
                    })
                        .attr('x', function (d) {
                        return (xScale(parseDate.parse(d[xFieldName])) + 2.5);
                    })
                        .attr('y', function (d) {
                        return (yScale(d[barYFieldName]) + 20);
                    });

                }

                if (options.attachBrushEvent) {
                    brushingChart.drawBrushing(data);
                }

            },
            mulipleBarChart: function (options) {
                var options = $.extend({
                    'barChartArray': []

                }, options);

                var barArray = options.barChartArray;

                var minValue, maxValue;
                for (var i = 0; i < barArray.length; i++) {
                    var barObj = barArray[i];
                    var yField = barObj.yFieldName;

                    var array = d3.extent(barObj.data, function (d, i) {
                        return d[yField];
                    });
                    if (i == 0) {
                        minValue = array[0];
                        maxValue = array[1];
                    } else {
                        if (minValue > array[0]) {
                            minValue = array[0];
                        }
                        if (maxValue < array[1]) {
                            maxValue = array[1];
                        }
                    }
                }


                yScale.domain([minValue, (maxValue + 3)]);

                for (var i = 0; i < barArray.length; i++) {
                    var barObj = barArray[i];

                    var keyValueArray = {};
                    for (key in barObj) {
                        keyValueArray[key] = barObj[key];
                    }
                    this.barChart(keyValueArray);
                }
            },
            stackedBarChart: function (options) {
                var options = $.extend({
                    'data': [],
                        'xFieldName': '',
                        'widthOfBar': '',
                        'axisColor': 'black',
                        'hideAxis': false,
                        'showAllTicks': false,
                        'redrawing': true,
                        'columnHeadingArray': [],
                        'xAxisIndicationLabel': '',
                        'yAxisIndicationLabel': ''
                }, options);




                width = width - marginSvg - margin.left;
                height = height - height*0.25;


                var stackedChartData = options.data;
                xFieldName = options.xFieldName;

                var widthOfEachBar;
                var stack = d3.layout.stack();

                var dataset = [];
                var color = options.colorArray;

                if (options.widthOfBar == '') {
                    widthOfEachBar = Math.floor((width) / data.length);
                } else {
                    widthOfEachBar = options.widthOfBar;
                }





                var keysArray = d3.keys(stackedChartData[0]).filter(function (key) {
                    return (key != options.xFieldName);
                });
				
				var legendNameMap={};
				for(var i=0;i<keysArray.length;i++){
					legendNameMap[keysArray[i]]="legend-"+i;
					
				}
				
               // color.domain(keysArray);

                var formattedStackedData = stackedChartData;

                formattedStackedData.forEach(function (d, i) {
                    var y0 = 0;
                    var countr = 0;
                    d.groupedData = keysArray.map(function (keyName) {

                        return {
                            x: d[xFieldName],
                            y0: y0,
                            y1: y0 += +d[keyName],
                            name: keyName,
                                'exactYVal': d[keyName]
                        };
                    });

                    d.total = d.groupedData[d.groupedData.length - 1].y1;
                });

                for (var j = 0; j < formattedStackedData.length; j++) {
                    var groupObj = formattedStackedData[j].groupedData;

                }

                maxYScale = d3.max(formattedStackedData, function (d) {
                    return d.total;
                });
                minYScale = d3.min(formattedStackedData, function (d) {
                    return d.total;
                });


                maxYScale = maxYScale * 1.5;
				//minYScale=minYScale-minYScale*0.5;

                yScale = d3.scale.linear()
                    .domain([0, maxYScale

                ])
                    .range([height, 0]);

                svgElement = svgElement.append("g")
                    .attr("transform", "translate(" + 0 + "," + margin.top + ")");

                xScale = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);
                xScale.domain(formattedStackedData.map(function (d) {
                    return d[xFieldName];
                }));

                xAxis = d3.svg.axis().scale(xScale).orient("bottom");



                yAxis = d3.svg.axis().scale(yScale)
                    .orient("right").ticks(4).tickSize(5, 0).tickFormat(d3.format(".2s"));

                var xAxisElem = svgElement.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + 0 + "," + (height) + ")")
                    .attr("stroke", options.axisColor)
                    .attr("fill", 'none')
                    .call(xAxis);
					
				xAxisElem.selectAll("text")
                    .attr("transform", "translate(" + 0 + ",15) rotate(0)");
				
				xAxisElem.selectAll("text").call(textWrapper.wrapText,xScale.rangeBand());
				

                var yAxisElem = svgElement.append('g')
                    .attr('class', 'y axis')
                    .attr("transform", "translate(" + (width) + "," + 0 + ")")
                    .attr("stroke", options.axisColor)
                    .attr("fill", 'none')
                    .call(yAxis);

                yAxisElem.selectAll(".tick")
                    .each(function (data) {
                    svgElement.append("line")
                        .attr('class', 'horizontalGridLine')
                        .attr('x1', 0)
                        .attr('x2', (width))
                        .attr('y1', function () {

                        return yScale(data);
                    })
                        .attr('y2', function () {
                        return yScale(data);
                    }).attr('stroke', '#F2F3F3');
                })
                    .style("display", function () {
                    if (options.hideAxis) {
                        return "none";
                    } else {
                        return "block";
                    }
                });

                if (options.xAxisIndicationLabel != "") {

                    var lengthOfLine = 40;
                    var indicationLineXPos0 = width / 2 - lengthOfLine;
                    var indicationLineXPos1 = width / 2 + lengthOfLine;

                    var indicationLineAndTextGap = 20;
                    var yLablePos = margin.scale - (indicationLineAndTextGap / 3);
                    var yLinePos = height + margin.scale - indicationLineAndTextGap;

                    var textPosition = height + margin.scale + indicationLineAndTextGap;
					
					/*
                    svgElement.append("path")
                        .attr('class', "axis-arrow-trianle")
                        .attr("d", d3.svg.symbol().type("triangle-up").size(10))
                        .attr("fill", "red")
                        .style('display', 'block')
                        .attr("transform", function (d) {
                        return "translate(" + indicationLineXPos1 + "," + yLinePos + ") rotate(90)";
                    });


                    svgElement.append("line")
                        .attr("class", 'x-axis-indication-line')
                        .attr('x1', indicationLineXPos0)
                        .attr('y1', (yLinePos))
                        .attr('x2', indicationLineXPos1)
                        .attr('y2', (yLinePos))
                        .attr("stroke", 'red');
					*/	
                    var textXPosition = (indicationLineXPos0 + indicationLineXPos1);
					
					/*
                    svgElement.append("text")
                        .attr('class', 'x-axis-indication')
                        .attr('text-anchor', 'middle')
                        .attr('x', (indicationLineXPos0))
                        .attr('y', (yLinePos+yLinePos*0.2))
                        .text(options.xAxisIndicationLabel);
					*/
					var pixcelPerChar=6;
					var xLabelTotalPixcel=options.xAxisIndicationLabel.toString().length*pixcelPerChar;
					var xLabelTop=height*0.2;
					var xLabelLeft=width/2-	xLabelTotalPixcel/2;
					axisLabelController.appendLabel(options.xAxisIndicationLabel,xLabelLeft,xLabelTop,0,xAxisElem,textStyleConfg.xLabelColor,600);

                }

                if (options.yAxisIndicationLabel != "") {

                    var lengthOfIndicatorLine = 40;
                    var yIndicatorLinePos0 = ((height) / 2 - 20);
                    var yIndicatorLinePos1 = yIndicatorLinePos0 + lengthOfIndicatorLine;

                    var xPosition0 = width + margin.scale - margin.left + 10;
					
					/*
                    svgElement.append("line")
                        .attr("class", 'y-axis-indication-line')
                        .attr('x1', xPosition0)
                        .attr('y1', (yIndicatorLinePos0))
                        .attr('x2', xPosition0)
                        .attr('y2', (yIndicatorLinePos1))
                        .attr("stroke", 'red');

				
                    svgElement.append("path")
                        .attr('class', "axis-arrow-trianle")
                        .attr("d", d3.svg.symbol().type("triangle-up").size(10))
                        .attr("fill", "red")
                        .style('display', 'block')
                        .attr("transform", function (d) {
                        return "translate(" + xPosition0 + "," + yIndicatorLinePos0 + ")";
                    });
					*/

                    var indicationLabelRef=svgElement
											.append("g")
											.attr("transform", "translate(" + (width + marginSvg - margin.left + 5) + "," + (yIndicatorLinePos1 + 30) + ")")
						
					axisLabelController.appendLabel(options.yAxisIndicationLabel,0,-(yIndicatorLinePos1 + 30)*0.4,90,indicationLabelRef,textStyleConfg.yLabelColor,600);
					/*
                        .append("text")
                        .attr("class", 'y-axis-indication')
                        .attr('text-anchor', 'middle')
                        .attr("transform", "rotate(90)")
                        .text(options.yAxisIndicationLabel)
					*/	
                }

                /* Add a group for each row of data */
                var groups = svgElement.selectAll("g.stack-grouping")
                    .data(formattedStackedData)
                    .enter()
                    .append("g")
                    .attr("class", 'stack-grouping')



               var allRect= groups.selectAll("rect")
                    .data(function (d) {
                    return d.groupedData;
                })
                    .enter()
                    .append("rect")
                    .attr("x", function (d, i) {
                    return (xScale((d["x"])));
                })
                    .attr("y", function (d) {
                    return yScale(0);
                })
                    .attr('class', function (d) {
                    return legendNameMap[d['name']] + " " + "bar";
                })
                    .attr("width", xScale.rangeBand())
                    .attr("height", function (d) {

                    return 0;
                })
                    .style("fill", function (d, i) {
                    return color[d.name];
                })
                    .on("mouseover", function (d) {
                    d3.select(this)
                        .attr('fill', 'yellow');

					

                    //toolTipManager.showToolTip(d3.event, d.exactYVal, d["x"], false, options.columnHeadingArray[d.name]);
					
					var yHeadingValueMap=[{"headingName":options.columnHeadingArray[d.name],"headingVal":d.exactYVal}];
						
					toolTipManager.showToolTip(d3.event,"",(d["x"]), false,yHeadingValueMap);

                })
                    .on("mouseleave", function (d, i) {
                    var targetElement = d3.select(this);
                    d3.select(this)
                        .attr('fill', $(targetElement).parents('g').attr('fill'));
                    toolTipManager.hideTooTip();
                });
				
				
				allRect.transition().duration(1000).attr("height",function(d){
						return (yScale(d["y0"]) - yScale(d.y1));
					
					})	
					.attr("y",function(d){
						return yScale(d.y1);
					});
					
				var legendColorArray=d3.keys(color);
                var stackChartLegend = svgElement.selectAll(".legend")
                    .data(legendColorArray)
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) {
                    return "translate("+margin.left+"," + (10 + i * 20) + ")";
                });

                var rectWidth = 18;
                var textGap = 10;
                var xRectLegend = 0;
                var xTextLegend = xRectLegend + rectWidth + textGap;
                var hideLegendList = {};
                stackChartLegend.append("rect")
                    .attr("x", xRectLegend)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function(d){
						return color[d];
					})
                    .on('click', function (d) {
                    var isHideElement = false;
                    if ($("rect" + "." + legendNameMap[d]).length > 1) {
                        isHideElement = true;
                        hideLegendList[d] = d;


                        d3.select(this).style("text-decoration", "grey");
                        d3.select(".legend-text." + legendNameMap[d]).style("text-decoration", "line-through");


                    } else {
                        isHideElement = false;
                        delete hideLegendList[d];



                        d3.select(this).style("fill", color[d]);
                        d3.select(".legend-text." + legendNameMap[d]).style("text-decoration", "none");
                    }

                    $(selectorElement).find("rect.bar").remove();
                    $(selectorElement).find("g.stack-grouping").remove();



                    redrawStackChart(d, hideLegendList);
                });

                stackChartLegend.append("text")
                    .attr("x", xTextLegend)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .attr("class", function (d) {
                    return "legend-text " + " " + legendNameMap[d];
                })
                    .text(function (d) {
                    return d;
                });
				
				hideAxisPath(svgElement);
						
				//set font here
				
				setTextStyleAndSvgBackGround(svgElement);
					
                function redrawStackChart(fieldName, hideLegendList) {



                    keysArray = d3.keys(stackedChartData[0]).filter(function (key) {
                        var filteredResult;

                        filteredResult = (key != options.xFieldName && hideLegendList[key] == undefined && key != "groupedData" && key != "total")



                        return filteredResult;
                    });


                    var formattedStackedData1 = stackedChartData;

                    formattedStackedData1.forEach(function (d, i) {
                        var y0 = 0;
                        d.groupedData = keysArray.map(function (keyName) {
                            return {
                                x: d[xFieldName],
                                y0: y0,
                                y1: y0 += +d[keyName],
                                name: keyName,
                                    'exactYVal': d[keyName]
                            };
                        });

                        d.total = d.groupedData[d.groupedData.length - 1].y1;

                    });


                    maxYScale = d3.max(formattedStackedData1, function (d) {
                        return d.total;
                    });
                    minYScale = d3.min(formattedStackedData1, function (d) {
                        return d.total;
                    });


                    maxYScale = maxYScale * 1.5;




                    var yScale1 = d3.scale.linear()
                        .domain([0, maxYScale

                    ]).range([height, 0]);

                    yAxis = d3.svg.axis().scale(yScale1)
                        .orient("right").ticks(4).tickSize(5, 0).tickFormat(d3.format(".2s"));

                    svgElement.select('.y.axis')
                        .call(yAxis)
                        .selectAll(".tick")
                        .each(function (data) {
                        svgElement.selectAll(".horizontalGridLine")
                            .attr('x1', 0)
                            .attr('x2', (width))
                            .attr('y1', function () {
                            return yScale1(data);
                        })
                            .attr('y2', function () {
                            return yScale1(data);
                        }).attr('stroke', '#F2F3F3');
                    })
                        .style("display", function () {
                        if (options.hideAxis) {
                            return "none";
                        } else {
                            return "block";
                        }
                    });

                    var groups = svgElement.selectAll("g.stack-grouping")
                        .data(formattedStackedData1)
                        .enter()
                        .append("g")
                        .attr("class", 'stack-grouping')



                    var rects = groups.selectAll("rect")
                        .data(function (d) {
                        return d.groupedData;
                    })
                        .enter()
                        .append("rect")
                        .attr("x", function (d, i) {
                        return (xScale((d["x"])));
                    })
                        .attr("y", function (d) {
                        return yScale1(0);
                    })
                        .attr('class', function (d) {
                        return legendNameMap[d['name']] + " " + "bar";
                    })
                        .attr("width", xScale.rangeBand())
                        .attr("height", function (d) {

                        return 0;
                    })
                        .style("fill", function (d, i) {
                        return color[d.name];
                    })
                        .on("mouseover", function (d) {
                        d3.select(this)
                            .attr('fill', 'yellow');


						
						var yHeadingValueMap=[{"headingName":options.columnHeadingArray[d.name],"headingVal":d.exactYVal}];
						
						toolTipManager.showToolTip(d3.event,"",(d["x"]), false,yHeadingValueMap);
                        //attachToolTip.showToolTip(d3.event, d.exactYVal, d["x"], false, options.columnHeadingArray[d.name]);

                    })
                        .on("mouseleave", function (d, i) {
                        var targetElement = d3.select(this);
                        d3.select(this)
                            .attr('fill', $(targetElement).parents('g').attr('fill'));
                        //attachToolTip.hideTooTip();
						toolTipManager.hideTooTip();
                    });

                    rects.transition()
                        .duration(2000)
                        .attr('height', function (d, i) {
                        return (yScale1(d.y0) - yScale1(d.y1));
                    })
					.attr("y",function(d){
						return yScale1(d.y1);
					})
					.
					attr("fill", function (d) {

                        return color[d.name];
                    });
					
					hideAxisPath(svgElement);
						
					//set font here
					
					setTextStyleAndSvgBackGround(svgElement);
					
                }
            },
			groupedBarChart: function (options) {
                var options = $.extend({
                    'data': [],
                        'xFieldName': '',
                        'widthOfBar': '',
                        'axisColor': 'black',
                        'hideAxis': false,
                        'yIndicationLabel': 'Value',
                }, options);

				
                width = width - marginSvg - margin.left;
                height = height - marginSvg;

                var widthOfEachBar;
                var stack = d3.layout.stack();

                var dataset = [];
                var color = '';

                color = d3.scale.category20


                var colors = options.colors;
			
                var groupedBarChartData = options.data;


                xFieldName = options.xFieldName;

                if (options.widthOfBar == '') {
                    widthOfEachBar = Math.floor((width) / groupedBarChartData.length);
                } else {
                    widthOfEachBar = options.widthOfBar;
                }


                var keysArray = d3.keys(groupedBarChartData[0]).filter(function (key) {
                    return (key != options.xFieldName);
                });

                groupedBarChartData.forEach(function (d, i) {
                    d.groupedData = keysArray.map(function (keyName) {
                        return {
                            xVal: keyName,
                            yVal: d[keyName],
							timeIndex:i,
							xFieldVal:d[xFieldName]
                        };
                    });
                    d.timeIndex = i;
                });
				
				var legendNameMap={};
				height=height*0.8;
				
				for(var i=0;i<keysArray.length;i++){
					legendNameMap[keysArray[i]]="legend-"+i;
				}
				
                dataset = groupedBarChartData;
				
                xScale = d3.time.scale().range([0, width], 0.5);
                
				xScale.domain(d3.extent(groupedBarChartData, function (d, i) {
                    return d["timeIndex"];
                }));
				
                var baseXScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.5);
                var tempXScale = d3.scale.ordinal();

                baseXScale.domain(dataset.map(function (d) {
                    return d["timeIndex"];
                }));

                tempXScale.domain(keysArray).rangeRoundBands([0, baseXScale.rangeBand()]);

                yScale = d3.scale.linear()
                    .range([(height-height*0.2),height*0.2]);

                maxYScale = d3.max(dataset, function (d, i) {

                    return d3.max(d.groupedData, function (d1) {
                        return d1["yVal"];
                    });
                });
                maxYScale = maxYScale * 1.5;
                yScale.domain([0, maxYScale])
                svgElement = svgElement.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			   
			   var largestStringLngth=0;
				var xAxisTicks = [];
				for(var counter =0 ;counter<dataset.length;counter++)
				{
					xAxisTicks[counter] = dataset[counter][xFieldName];
					if(largestStringLngth<(xAxisTicks[counter].toString()).length)
					{
							largestStringLngth = (xAxisTicks[counter].toString()).length;
					}
				}
		
				xAxis = d3.svg.axis().scale(baseXScale)
                    .orient("bottom")
					.tickValues(tickController.getXTickArray(0,(xAxisTicks.length),largestStringLngth, (width)));
          
				yAxis = d3.svg.axis().scale(yScale)
                    .orient("right").ticks(4).tickSize(5, 0);
                
				var xAxisElem =	svgElement.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + 0 + "," + (height) + ")")
                    .attr("stroke", options.axisColor)
                    .attr("fill", 'none')
                    .call(xAxis);
					
				xAxisElem.selectAll("text")
					.text(function(d){
						return xAxisTicks[d];
					})
					.attr('fill','black');
					
		
                var yAxisElem = svgElement.append('g')
                    .attr('class', 'y axis')
                    .attr("transform", "translate(" + (width) + "," + 0 + ")")
                    .attr("stroke", options.axisColor)
                    .attr("fill", 'none');

                yAxisElem.call(yAxis)
                    .selectAll(".tick")
                    .each(function (data) {
                    svgElement.append("line")
                        .attr('class', 'horizontalGridLine')
                        .attr('x1', 0)
                        .attr('x2', (width))
                        .attr('y1', function () {

                        return yScale(data);
                    })
                        .attr('y2', function () {
                        return yScale(data);
                    }).attr('stroke', '#F2F3F3');
                })
                    .style("display", function () {
                    if (options.hideAxis) {
                        return "none";
                    } else {
                        return "block";
                    }
                });
                var yLabelTop = ((height / 1.5) + (options.yAxisfactor.length / 2) * 5);
                var yLabelLeft = margin.right * 1.2;
				
				/*
                yAxisElem.append("text")
                    .text(function () {
                    return options.yAxisfactor;
                })
                    .style('font-style', 'italic')
                    .attr('transform', "translate(" + (yLabelLeft) + "," + (yLabelTop) + ") rotate(-90)")
                    .style('fill', options.yLabelColor);
				*/
				
				//y axis indication lable
				axisLabelController.appendLabel(options.yAxisfactor,yLabelLeft,yLabelTop,-90,yAxisElem,textStyleConfg.yLabelColor,600);
				
				//x axis indication lable
				var pixcelPerChar=6;
				var totalPixcel=options.xAxisfactor.length*pixcelPerChar;
				var xLabelLeft=(width/2)-(totalPixcel/2);
				var xLabelTop=height*0.2;
				
				axisLabelController.appendLabel(options.xAxisfactor,xLabelLeft,xLabelTop,0,xAxisElem,textStyleConfg.xLabelColor,600);
				
				var groups = svgElement.selectAll("g.bar-grouping")
                    .data(dataset)
                    .enter()
                    .append("g")
                    .attr("class", 'bar-grouping')
                    .attr("transform", function (d) {
                    return "translate(" + (baseXScale(d["timeIndex"])) + ",0)";
                });


                var rectsTrans = groups.selectAll("rect")
                    .data(function (d) {
                    return d.groupedData;
                })
                    .enter()
                    .append("rect")
                    .attr("x", function (d, i) {

                    return (tempXScale(0));
                })
                    .attr("y", function (d) {
                    return yScale(0);
                })
                    .attr('class', function (d) {
                    return "groupBar " + legendNameMap[d['xVal']];
                })
                    .style("fill", function (d, i) {
                    return options.colors[d['xVal']];
                })
                    .attr("width", (tempXScale.rangeBand() / 1.2))
                    .attr("height", function (d) {
                    return ((height) - yScale(d["yVal"]));
                })
                    .on("mouseover", function (d,i) {


                    d3.select(this)
                        .style('fill', 'yellow');
					
					var yHeadingValueMap=[{"headingName":d["xVal"],"headingVal":d["yVal"]}];
						
					toolTipManager.showToolTip(d3.event, d["yVal"],(options.xAxisfactor+ " "+d["xFieldVal"]), false,yHeadingValueMap);	
					
					//toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, options.yIndicationLabel);


                })
                    .on("mouseleave", function (d, i) {
                    var targetElement = d3.select(this);
                    d3.select(this)
                        .style('fill', function (d, i) {
                        return options.colors[d['xVal']];
                    });
                    toolTipManager.hideTooTip();
                });

                rectsTrans.transition().duration(function (d, i) {
                    return i * 600
                }).attr("x", function (d) {
                    return (tempXScale(d["xVal"]));
                }).attr('y', function (d) {
                    return yScale(d["yVal"]);
                });
                var stackChartLegend = svgElement.selectAll(".legend")
                    .data(keysArray)
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) {
                    return "translate(0," + (10 + i * 20) + ")";
                });

                var rectWidth = 18;
                var textGap = 10;
                var xRectLegend = 0;
                var xTextLegend = xRectLegend + rectWidth + textGap;
                var hideLegendList = {};

                stackChartLegend.append("rect")
                    .attr("x", xRectLegend)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function (d, i) {
                    return options.colors[d];
                })
                    .attr('index', function (d, i) {
                    return i;
                })
                    .on('click', function (d) {


                    var isHideElement = false;
                    var index = parseInt(d3.select(this).attr('index'));
                    if (!svgElement.selectAll("rect."+legendNameMap[d]).empty()) {

                        isHideElement = true;
                        hideLegendList[d] = d;

                        d3.select(this).style("fill", "grey");
                        d3.select(".legend-text." + legendNameMap[d]).style("text-decoration", "line-through");


                    } else {
                        isHideElement = false;
                        delete hideLegendList[d];

                        d3.select(this).style("fill", function (d, i) {

                            return options.colors[d];
                        });
                        d3.select(".legend-text." + legendNameMap[d]).style("text-decoration", "none");
                    }

                    $(selectorElement).find("rect.groupBar").remove();
                    $(selectorElement).find(".bar-grouping").remove();


                    redrawGroupedBarChart(d, hideLegendList);
                });
				
                function redrawGroupedBarChart(d, hideLegendList) {

                    keysArray = d3.keys(groupedBarChartData[0]).filter(function (key) {
                        var filteredResult;

                        filteredResult = (key != options.xFieldName && hideLegendList[key] == undefined && key != "groupedData" && key != "timeIndex")



                        return filteredResult;
                    });


                    var formattedGroupedBarData1 = groupedBarChartData;

                    groupedBarChartData.forEach(function (d, i) {
                        d.groupedData = keysArray.map(function (keyName) {
                            return {
                                xVal: keyName,
                                yVal: d[keyName]
                            };
                        });
                        d.timeIndex = i;
                    });

                    maxYScale = d3.max(dataset, function (d, i) {

                        return d3.max(d.groupedData, function (d1) {
                            return d1["yVal"];
                        });
                    });
                    maxYScale = maxYScale * 1.5;
                    yScale.domain([0, maxYScale]);

                    yAxis = d3.svg.axis().scale(yScale)
                        .orient("right").ticks(4).tickSize(5, 0);

                    tempXScale.domain(keysArray).rangeRoundBands([0, baseXScale.rangeBand()]);

                    svgElement.selectAll(".y.axis")
                        .call(yAxis);


                    /* Add a group for each row of data */
                    var groups = svgElement.selectAll("g.bar-grouping")
                        .data(groupedBarChartData)
                        .enter()
                        .append("g")
                        .attr("class", 'bar-grouping')
                        .attr("transform", function (d) {
                        return "translate(" + (baseXScale(0)) + ",0)";
                    });


                    var rectsTrans = groups.selectAll("rect")
                        .data(function (d) {
                        return d.groupedData;
                    })
                        .enter()
                        .append("rect")
                        .attr("x", function (d, i) {

                        return (tempXScale(d["xVal"]));
                    })
                        .attr("y", function (d) {
                        return yScale(d["yVal"]);
                    })
                        .attr('class', function (d) {
                        return "groupBar " + legendNameMap[d['xVal']];
                    })
                        .style("fill", function (d, i) {
                        return options.colors[d['xVal']];
                    })
                        .attr("width", (tempXScale.rangeBand() / 1.2))
                        .attr("height", function (d) {
                        return ((height) - yScale(d["yVal"]));
                    })
                        .on("mouseover", function (d) {
                        d3.select(this)
                            .attr('fill', 'yellow');

                        toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, options.yIndicationLabel);

                    })
                        .on("mouseleave", function (d, i) {
                        var targetElement = d3.select(this);
                        d3.select(this)
                            .attr('fill', $(targetElement).parents('g').attr('fill'));
                        toolTipManager.hideTooTip();
                    });

                    groups.transition().duration(function (d, i) {
                        return i * 190;
                    }).attr("transform", function (d) {
                        return "translate(" + (baseXScale(d["timeIndex"])) + ",0)";
                    });
					//hide all axis path
					hideAxisPath(svgElement);
						
					//set font here
					
						setTextStyleAndSvgBackGround(svgElement);
						

                }


                stackChartLegend.append("text")
                    .attr("x", xTextLegend)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .attr("class", function (d) {
                    return "legend-text " + " " + legendNameMap[d];
                })
                    .text(function (d) {
                    return d;
                });
				
				//hide all axis path
				hideAxisPath(svgElement);
					
				//set font here
				
				setTextStyleAndSvgBackGround(svgElement);
				
            },
	groupedBar2DChart: function(options,midCriteria) {
                var options =
				$.extend({
                    'data': [],
                        'xFieldName': '',
                        'widthOfBar': '',
                        'axisColor': 'black',
                        'hideAxis': false,
                        'yIndicationLabel': 'Value',
						'midVal':""
                }, options);
				
				
				
				
				var midVal;
				if(isNaN(midCriteria)){
					midVal="";
				}else{
					midVal=midCriteria;
				}
				
				width = width - marginSvg - margin.left;
                height = height - marginSvg;
				
				height=height*0.9;
				
                var widthOfEachBar;
                var stack = d3.layout.stack();
				
                var dataset = [];
                var color = '';

                color = d3.scale.category20


                var colors = options.colors;



                var groupedBarChartData = options.data;


                xFieldName = options.xFieldName;

                if (options.widthOfBar == '') {
                    widthOfEachBar = Math.floor((width) / groupedBarChartData.length);
                } else {
                    widthOfEachBar = options.widthOfBar;
                }



                var keysArray = d3.keys(groupedBarChartData[0]).filter(function (key) {
                    return (key != options.xFieldName);
                });

                groupedBarChartData.forEach(function (d, i) {
                    d.groupedData = keysArray.map(function (keyName) {
                        return {
                            xVal: keyName,
                            yVal: d[keyName],
							xFieldVal:d[xFieldName]
                        };
                    });
                    d.timeIndex = i;
                });
					
				var legendNameMap={};	
				for(var i=0;i<keysArray.length;i++){
					legendNameMap[keysArray[i]]="legend-"+i;
				}	
                dataset = groupedBarChartData;

                xScale = d3.time.scale().range([0, width], 0.5);
                xScale.domain(d3.extent(groupedBarChartData, function (d, i) {
                    return (d["timeIndex"]);
                }));

                var baseXScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.5);
                var tempXScale = d3.scale.ordinal();

                baseXScale.domain(dataset.map(function (d) {
                    return d["timeIndex"];
                }));

                tempXScale.domain(keysArray).rangeRoundBands([0, baseXScale.rangeBand()]);

                yScale = d3.scale.linear()
                    .range([(height), 0]);

                maxYScale = d3.max(dataset, function (d, i) {

                    return d3.max(d.groupedData, function (d1) {
                        return d1["yVal"];
                    });
                });
				
				var minYScale= d3.min(dataset, function (d, i) {

                    return d3.min(d.groupedData, function (d1) {
                        return d1["yVal"];
                    });
                });
				
				var midPoint;
				
				if(isNaN(midVal)){
					
					midPoint=Math.ceil((maxYScale+minYScale)/2);
				}else{
					midPoint=midVal;
				}
				
				
				maxYScale = maxYScale * 1.9;
				
				
				
				yScale.domain([minYScale, maxYScale])

                svgElement = svgElement.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			
			    var largestStringLngth=0;
				var xAxisTicks = [];
				for(var counter =0 ;counter<dataset.length;counter++)
				{
					xAxisTicks[counter] = dataset[counter][xFieldName];
					if(largestStringLngth<(xAxisTicks[counter].toString()).length)
					{
							largestStringLngth = (xAxisTicks[counter].toString()).length;
					}
				}
				
                xAxis = d3.svg.axis().scale(baseXScale)
                    .orient("bottom")
					.tickValues(tickController.getXTickArray(0,(xAxisTicks.length),largestStringLngth, (width)));
					
                yAxis = d3.svg.axis().scale(yScale)
                    .orient("right").ticks(4).tickSize(5, 0);

			var xAxisElem =	svgElement.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + 0 + "," + (height) + ")")
                    .attr("stroke", options.axisColor)
                    .attr("fill", 'none');
					
					xAxisElem
                    .call(xAxis)
					.selectAll("text")
					.text(function(d){
						return xAxisTicks[d];
					})
					.attr('fill','black');

         /*       svgElement.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + 0 + "," + (height) + ")")
                    .attr("stroke", options.axisColor)
                    .attr("fill", 'none')
                    .call(xAxis)
					.selectAll("text")
                    .text(function (d, i) {
						var obj = dataset[d];
						return obj[xFieldName];
					});*/

                var yAxisElem = svgElement.append('g')
                    .attr('class', 'y axis')
                    .attr("transform", "translate(" + (width) + "," + 0 + ")")
                    .attr("stroke", options.axisColor)
                    .attr("fill", 'none');
				
					
				//yAxis.tickValues(d3.range(0, height,midPoint));
				
				var tickArray=tickController.getTickArray(minYScale,maxYScale,5);
				
				if(tickArray.indexOf(midPoint) == -1){
					tickArray.push(midPoint);
				}
				
				//alert(tickArray +" mid "+midPoint + tickArray.indexOf(midPoint));
				
				yAxis.tickValues(tickArray);
				
				 yAxisElem.call(yAxis)
                    .selectAll(".tick")
                    .each(function (data) {
						svgElement.append("line")
							.attr('class', 'horizontalGridLine')
							.attr('x1', 0)
							.attr('x2', (width))
							.attr('y1', function () {

							return yScale(data);
						})
							.attr('y2', function () {
							return yScale(data);
						})
						.attr('stroke', '#F2F3F3')
						.attr("display",function(d){
							if(d == midPoint){
								return "none";
							}else{
								return "block";
							}
						});
					})
                    .style("display", function () {
						if (options.hideAxis) {
							return "none";
						} else {
							return "block";
						}
					});
					
                var yLabelTop = ((height / 1.5) + (options.yAxisfactor.length / 2) * 5);
                var yLabelLeft = margin.right * 1.2;
				/*
                yAxisElem.append("text")
                    .text(function () {
                    return options.yAxisfactor;
                })
                    .style('font-style', 'italic')
                    .attr('transform', "translate(" + (yLabelLeft) + "," + (yLabelTop) + ") rotate(-90)")
                    .style('fill', options.yLabelColor);
					
				*/	
				
				//y axis indication lable
				axisLabelController.appendLabel(options.yAxisfactor,yLabelLeft,yLabelTop,-90,yAxisElem,textStyleConfg.yLabelColor,600);
				
				//x axis indication lable
				var pixcelPerChar=6;
				var totalPixcel=options.xAxisfactor.length*pixcelPerChar;
				var xLabelLeft=(width/2)-(totalPixcel/2);
				var xLabelTop=height*0.15;
				
				axisLabelController.appendLabel(options.xAxisfactor,xLabelLeft,xLabelTop,0,xAxisElem,textStyleConfg.xLabelColor,600);
				
                var groups = svgElement.selectAll("g.bar-grouping")
                    .data(dataset)
                    .enter()
                    .append("g")
                    .attr("class", 'bar-grouping')
                    .attr("transform", function (d) {
                    return "translate(" + (baseXScale(d["timeIndex"])) + ",0)";
                });


                var rectsTrans = groups.selectAll("rect")
                    .data(function (d) {
                    return d.groupedData;
                })
                    .enter()
                    .append("rect")
                    .attr("x", function (d, i) {

                    return (tempXScale(0));
                })
                    .attr("y", function (d) {
                    return yScale(midPoint);
                })
                    .attr('class', function (d) {
                    return "groupBar " + legendNameMap[d['xVal']];
                })
                    .style("fill", function (d, i) {
                    return options.colors[d['xVal']];
                })
                    .attr("width", (tempXScale.rangeBand() / 1.2))
                    .attr("height", function (d) {
						if(yScale(d["yVal"])> yScale(midPoint)){
							return yScale(d["yVal"])-yScale(midPoint);
						}else{
							return (yScale(midPoint) - yScale(d["yVal"]));
						}
                })
                    .on("mouseover", function (d) {


                    d3.select(this)
                        .style('fill', 'yellow');
                    //toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, options.yIndicationLabel);
					
					var yHeadingValueMap=[{"headingName":options.yAxisfactor,"headingVal":d["yVal"]}];
						
					toolTipManager.showToolTip(d3.event,"",(d["xVal"] +" "+d["xFieldVal"]), false,yHeadingValueMap);

                })
                    .on("mouseleave", function (d, i) {
                    var targetElement = d3.select(this);
                    d3.select(this)
                        .style('fill', function (d, i) {
                        return options.colors[d['xVal']];
                    });
                    toolTipManager.hideTooTip();
                });

                rectsTrans.transition().duration(function (d, i) {
                    return i * 600
                }).attr("x", function (d) {
                    return (tempXScale(d["xVal"]));
                }).attr('y', function (d) {
					if(yScale(d["yVal"])> yScale(midPoint)){
						return yScale(midPoint);
					}else{
						return yScale(d["yVal"]);
					}
					
                });
                var stackChartLegend = svgElement.selectAll(".legend")
                    .data(keysArray)
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) {
                    return "translate(0," + (10 + i * 20) + ")";
                });

                var rectWidth = 18;
                var textGap = 10;
                var xRectLegend = 0;
                var xTextLegend = xRectLegend + rectWidth + textGap;
                var hideLegendList = {};

                stackChartLegend.append("rect")
                    .attr("x", xRectLegend)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function (d, i) {
                    return options.colors[d];
                })
                    .attr('index', function (d, i) {
                    return i;
                })
                    .on('click', function (d) {


                    var isHideElement = false;
                    var index = parseInt(d3.select(this).attr('index'));
					
					if (!svgElement.selectAll("rect."+legendNameMap[d]).empty()) {

                        isHideElement = true;
                        hideLegendList[d] = d;

                        d3.select(this).style("fill", "grey");
                        d3.select(".legend-text." +legendNameMap[d]).style("text-decoration", "line-through");


                    } else {
                        isHideElement = false;
                        delete hideLegendList[d];

                        d3.select(this).style("fill", function (d, i) {
							return options.colors[d];
                        });
                        d3.select(".legend-text." + legendNameMap[d]).style("text-decoration", "none");
                    }

                    $(selectorElement).find("rect.groupBar").remove();
                    $(selectorElement).find(".bar-grouping").remove();


                    redrawGroupedBarChart(d, hideLegendList);
                });

                function redrawGroupedBarChart(d, hideLegendList) {

                    keysArray = d3.keys(groupedBarChartData[0]).filter(function (key) {
                        var filteredResult;

                        filteredResult = (key != options.xFieldName && hideLegendList[key] == undefined && key != "groupedData" && key != "timeIndex")
						return filteredResult;
                    });


                    /*
					for(var i=0;i<keysArray.length;i++){
							
						console.log("key name "+keysArray[i] );
					}
					*/
					
                    groupedBarChartData.forEach(function (d, i) {
                        d.groupedData = keysArray.map(function (keyName) {
                            return {
                                xVal: keyName,
                                yVal: d[keyName]
                            };
                        });
                        d.timeIndex = i;
                    });
					
					var formattedGroupedBarData1 = groupedBarChartData;
					
					var maxYScale1 = d3.max(formattedGroupedBarData1, function (d, i) {

                        return d3.max(d.groupedData, function (d1) {
                            return d1["yVal"];
                        });
                    });
					
					var minYScale1= d3.min(formattedGroupedBarData1, function (d, i) {

										return d3.min(d.groupedData, function (d1) {
											return d1["yVal"];
										});
									});
				
					
					
					
					var midPoint1;
					if(isNaN(midVal)){
						midPoint1=Math.ceil((maxYScale1+minYScale1)/2);
					}else{
						midPoint1=midVal;
					}	
					//var midPoint1=((maxYScale1+minYScale1)/2);
					
					maxYScale1 = maxYScale1 * 1.9;
					yScale.domain([minYScale1, maxYScale1]);

                    yAxis = d3.svg.axis().scale(yScale)
                        .orient("right").ticks(4).tickSize(5, 0);
						
					tempXScale.domain(keysArray).rangeRoundBands([0, baseXScale.rangeBand()]);
					
					svgElement.selectAll(".horizontalGridLine").remove();
					//svgElement.selectAll(".customtick").remove();
					
					//yAxis.tickValues(d3.range(0, height,midPoint1));
					
					var tickArray2=tickController.getTickArray(minYScale,maxYScale,5);
					yAxis.tickValues(tickArray2);
				
					
					svgElement.selectAll(".y.axis")
                        .call(yAxis)
						.selectAll(".tick")
						.each(function (data) {
							console.log("************* text *******"+data);
							
								svgElement.append("line")
									.attr('class', 'horizontalGridLine')
									.attr('x1', 0)
									.attr('x2', (width))
									.attr('y1', function () {

									return yScale(data);
									})
									.attr('y2', function () {
										return yScale(data);
									}).attr('stroke', '#F2F3F3');
							
						})
						.style("display", function () {
							if (options.hideAxis) {
								return "none";
							} else {
								return "block";
							}
						});
						

                    /* Add a group for each row of data */
                    var groups = svgElement.selectAll("g.bar-grouping")
                        .data(formattedGroupedBarData1)
                        .enter()
                        .append("g")
                        .attr("class", 'bar-grouping')
						
                        .attr("transform", function (d) {
                        return "translate(" + (baseXScale(0)) + ",0)";
                    })
					
					
					

                    var rectsTrans = groups.selectAll("rect")
							.data(function (d) {
							return d.groupedData;
						})
                        .enter()
                        .append("rect")
                        .attr("x", function (d, i) {

                        return (tempXScale(d["xVal"]));
                    })
                    .attr("y", function (d) {
						//console.log("d[yVal ]"+yScale(d["yVal"]) +" mid "+ yScale(midPoint1));
						if(yScale(d["yVal"])>= yScale(midPoint1)){
							return yScale(midPoint1);
						}else{
							return yScale(d["yVal"]);
						}
                        //return yScale(d["yVal"]);
                    })
                    .attr('class', function (d) {
                        return "groupBar " + legendNameMap[d['xVal']];
                    })
                    .style("fill", function (d, i) {
                        return options.colors[d['xVal']];
                    })
					.attr("width", (tempXScale.rangeBand() / 1.2))
					.attr("height", function (d) {
						//console.log("d[yVal ]"+yScale(d["yVal"]) +" mid "+ yScale(midPoint1));
						if(yScale(d["yVal"])>= yScale(midPoint1)){
							return yScale(d["yVal"])-yScale(midPoint1);
						}else{
							return (yScale(midPoint1) - yScale(d["yVal"]));
						}
                        //return ((height) - yScale(d["yVal"]));
                    })
                        .on("mouseover", function (d) {
                        d3.select(this)
                            .attr('fill', 'yellow');

                        toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, options.yIndicationLabel);

                    })
                        .on("mouseleave", function (d, i) {
                        var targetElement = d3.select(this);
                        d3.select(this)
                            .attr('fill', $(targetElement).parents('g').attr('fill'));
                        toolTipManager.hideTooTip();
                    });
					
					
                    groups.transition().duration(function (d, i) {
                        return i * 190;
                    }).attr("transform", function (d) {
                        return "translate(" + (baseXScale(d["timeIndex"])) + ",0)";
                    });
					
					//hide all axis path
					hideAxisPath(svgElement);
						
					//set font here
					
					setTextStyleAndSvgBackGround(svgElement);
						
						
					
				}

                stackChartLegend.append("text")
                    .attr("x", xTextLegend)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .attr("class", function (d) {
                    return "legend-text " + " " + legendNameMap[d];
                })
                    .text(function (d) {
                    return d;
                });
				
				//hide all axis path
				hideAxisPath(svgElement);
					
				//set font here
				
					setTextStyleAndSvgBackGround(svgElement);
					
				
            },
			/*
				things left make xScale generic
				ticks spacing
			*/
			cricketAnalysis:function(cnfg){
				var marginCrickedAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.2,top:height*0.2,chartSeparator:5,xScalePaddingTop:height*0.1,yScalePaddingLeft:width*0.08};
				
				var scaleWidth=width-marginCrickedAnalChart.left-marginCrickedAnalChart.right;
				var scaleHeight=height-marginCrickedAnalChart.top-marginCrickedAnalChart.bottom;
				
				//var chartWidth=(scaleWidth)-marginCrickedAnalChart.chartSeparator;
				var overAxisStartPos=scaleHeight+marginCrickedAnalChart.chartSeparator;
				var heightOverAxis=(marginCrickedAnalChart.bottom/3);
				
				var wicketAxisStartPos=overAxisStartPos+heightOverAxis +marginCrickedAnalChart.chartSeparator;
				var wicketAxisHeight=marginCrickedAnalChart.bottom-heightOverAxis;
				 
				var tital = cnfg.data.tital; 
				var titalColor = cnfg.data.titalColor;
				var yData=cnfg.data.yData;
				var xData=cnfg.data.xData;
				var xDatacolor = cnfg.data.xDatacolor;
				var specialXData = cnfg.data.specialXData;
				var specialDataLabel = cnfg.data.specialDataLabel;
				var specialData = cnfg.data.specialData;
				var specialXDataColor = cnfg.data.specialXDataColor;
				var specialXDataLabel = cnfg.data.specialXDataLabel;
				var xLabelColor =  cnfg.data.xLabelColor;
				var yLabel = cnfg.data.yLabel;
				var specialDataLabelOfWicket = cnfg.data.specialDataLabelOfWicket;
				var colorArray=cnfg.colorArray;
				var xFieldName=cnfg.xFieldName;
				var yFieldName=cnfg.yFieldName;
				var axisColor=cnfg.axisColor;
				var tickColor=cnfg.data.textColor;
				var fontStyle=cnfg.data["font-style"];
				var ballSize =10,wicketWidth=30,wicketHeight=50,legendWidth=14,legendHeight=14,legendSize=14;
				//make Array of data
				var data=[];
				var loopIterator=yData.length>xData.length?yData:xData;
				
				for(var i=0;i<loopIterator.length;i++){
					var obj={};
					if(yData[i]){
						obj["y"]=yData[i];
					}else{
						//obj["y"]=0;
					}
					
					if(xData[i]){
						obj["x"]=xData[i];
					}else{
						//obj["x"]=xData[xData.length-1]+1;
					}
					if(specialXData[i])
					{
						obj["specialX"]=specialXData[i];
					}
					
					obj["timeIndex"]=i;
					data.push(obj);
				}			
				
				xScale =d3.scale.linear()
                    .range([(0),scaleWidth]);
				
				var minX=d3.min(data,function(d){
								return d["x"];
						 });
						 
				var maxX=d3.max(data,function(d){
								return d["x"];
							});		
				
				xScale.domain([0,maxX]);
				
				yScale =d3.scale.linear()
                    .range([(scaleHeight),5.5]);
				
				var minYScale=d3.min(data,function(d){
								return d["y"];
							});
				
				var maxYScale=d3.max(data,function(d){
								return d["y"];
							});
				
				maxYScale = maxYScale * 1.5;			
				
				yScale.domain([0,maxYScale]);
				
				svgElement = svgElement.append("g")
                    .attr("transform", "translate(" + marginCrickedAnalChart.left + "," + marginCrickedAnalChart.top + ")");

				xAxis = d3.svg.axis().scale(xScale)
                    .orient("bottom").ticks(10);


                yAxis = d3.svg.axis().scale(yScale)
                    .orient("left").tickValues(d3.range(3, maxYScale, maxYScale/4));
				
				var tooltip = d3.select("body")
								.append("div")
								.style('background','rgba(0,0,0,.6)')
								.style("position", "absolute")
									//.style("z-index", -1)
								.style("visibility", "hidden")
								.style("font-family",'calibri')
								.style("font-style",'normal')
								.style("color",'white')
								.style('padding','5px')
								.text("a simple tooltip"); 
				
				var GridLineLImage = svgElement.append("g")
						  .attr("class","GridLineLImage");
			/*	GridLineLImage.append("image")
							  .attr('x',-marginCrickedAnalChart.yScalePaddingLeft)
							  .attr('width',scaleWidth+marginCrickedAnalChart.yScalePaddingLeft+15)
						      .attr('height',scaleHeight)
						      .attr("xlink:href",'graph-base.png');*/
			
				var titalGroupOfTeam = svgElement.append("g")
						  .attr("class","tital-Group-of-team")
						  .attr("transform","translate("+(-marginCrickedAnalChart.yScalePaddingLeft)+","+(-marginCrickedAnalChart.top/1.5)+")");
				
				var gradientTital = titalGroupOfTeam.append("svg:defs")
									.append("svg:linearGradient")
									.attr("id", "gradientTital")
									.attr("x1", "0%")
									.attr("y1", "0%")
									.attr("x2", "100%")
									.attr("y2", "100%")
									.attr("spreadMethod", "pad")
								//	.attr("gradientUnits", "userSpaceOnUse")
									.attr("gradientTransform","rotate(45)");

				gradientTital.append("stop")
					.attr("offset", "0")
					.attr("stop-color", "#0e0c1a");
				gradientTital.append("stop")
					.attr("offset", "0.5")
					.attr("stop-color", "#414463");

				gradientTital
					.append("stop")
					.attr("offset", "1")
					.attr("stop-color", "#0e0c1a");
				
				titalGroupOfTeam.append('rect')
						  .attr("width",(scaleWidth+marginCrickedAnalChart.yScalePaddingLeft+15))
						  .attr("height",marginCrickedAnalChart.top/1.7)
						  .attr("fill","url(#gradientTital)");
				titalGroupOfTeam.append('text')
								.attr('x',30)
								.attr('y',30)
								.style("font-size",'22')
								.style("fill",titalColor)
								.style("font-family",fontStyle)
								.text(tital[0]+" v "+tital[1]);
			/*	var titalGroupOfGround = svgElement.append("g")
						  .attr("class","tital-Group-of-ground")
						  .attr("transform","translate("+(scaleWidth+15-marginCrickedAnalChart.yScalePaddingLeft)/2+","+(-marginCrickedAnalChart.top/1.5)+")");
				titalGroupOfGround.append('rect')
						  .attr("width",(scaleWidth+marginCrickedAnalChart.yScalePaddingLeft+15)/2)
						  .attr("height",marginCrickedAnalChart.top/1.7)
						  .attr('fill','#333c67');
				var GroundDetailText = tital[3]+"<br>"+tital[2];
				titalGroupOfGround.append('text')
								.attr('x',16)
								.attr('y',16)
								.style("font-size",'15')
								.style("fill",'white')
								.style("font-family",fontStyle)
								.html(GroundDetailText);*/
				
				var overAxis=svgElement.append("g")
						  .attr("class","over-axis-grouping");
						 // alert(overAxisStartPos);
						  
				var overAxisHeading=overAxis.append("rect")
											  .attr("class","over-axis-heading")
											  .attr("x",(-marginCrickedAnalChart.yScalePaddingLeft))
											  .attr("y",overAxisStartPos)
											  .attr("height",(heightOverAxis))
											  .attr("width",marginCrickedAnalChart.yScalePaddingLeft)
											  .attr("fill","#131e4c");
											  
				
				overAxis.append("text")
							  .attr("x",((-marginCrickedAnalChart.yScalePaddingLeft)/2))
							  .attr("y",(overAxisStartPos+(heightOverAxis/2)))
							  .attr("dy",".35em")							  
							  .attr("text-anchor","middle")
							  .text("OVERS")
							  .attr('fill',xLabelColor)
							  .style('font-weight',400)
							  .style("font-family",'Arial Black');
					
				var overScalegroup=overAxis.append("g").attr("class","over-scale-group").attr("transform", "translate(" + 0 + "," + (overAxisStartPos) + ")");
				
		var gradientOverAxis = overScalegroup.append("svg:defs")
									.append("svg:linearGradient")
									.attr("id", "gradientOverAxis")
									.attr("x1", "0%")
									.attr("y1", "0%")
									.attr("x2", "100%")
									.attr("y2", "100%")
									.attr("spreadMethod", "pad")
								//	.attr("gradientUnits", "userSpaceOnUse")
									.attr("gradientTransform","rotate(90)");

				gradientOverAxis.append("stop")
					.attr("offset", "0")
					.attr("stop-color", "#182051");
				gradientOverAxis.append("stop")
					.attr("offset", "0.5")
					.attr("stop-color", "#8289b5");

				gradientOverAxis
					.append("stop")
					.attr("offset", ".8")
					.attr("stop-color", "#182051");
				overScalegroup.append("rect")
						.attr("x",0)
						.attr("y",0)
						.attr("width",(scaleWidth+15))
						.attr("height",(heightOverAxis))
						.attr("fill","url(#gradientOverAxis)");
						
							  	
				var xAxisRef=overScalegroup.call(xAxis);
				d3.select('.over-scale-group').attr('fill','none');							 

				//xAxisRef.selectAll(".tick").attr("transform", "translate(" + (heightOverAxis/2) + "," + 0 + ")");
				
				xAxisRef.selectAll("text").attr("dy",".35em").text(function(d){
					if(parseInt(d) == 0){
						return "";
					}else{
						return d;
					}
				})
				.attr("transform", "translate(" + (0) + "," + (heightOverAxis/6) + ")")
				.style("fill","white")
				.style("font-family",fontStyle);
				
				
				var wicketAxisGroup=svgElement.append("g")
						  .attr("class","wicket-axis");
				
				var wicketAxisHeading=	wicketAxisGroup.append("rect")
														.attr("class","wicket-axis-heading")
														.attr("x",(-marginCrickedAnalChart.yScalePaddingLeft))
														.attr("y",wicketAxisStartPos)
														.attr("height",(heightOverAxis*3))
														.attr("width",marginCrickedAnalChart.yScalePaddingLeft)
														.attr("fill","#9c9ca6");
				wicketAxisGroup.append("image")
								.attr("x",(-marginCrickedAnalChart.yScalePaddingLeft/1.5))
								.attr("y",(wicketAxisStartPos))
								.attr("width",wicketWidth)
								.attr("height",wicketHeight)
								.attr("xlink:href",specialDataLabelOfWicket);
								
				var wicketScaleGroup=wicketAxisGroup
									 .append("g")
									 .attr("class","wicket-scale-group")
									 .attr("transform", "translate(" + 0 + "," + (wicketAxisStartPos) + ")");
				
			    wicketScaleGroup.append("rect")
				                .attr('class','show-wicket-in-over')
								.attr("x",0)
								.attr("y",0)
								.attr("width",(scaleWidth+15))
								.attr("height",(heightOverAxis*2))
								.attr("fill","#9c9ca6");
				var wicketsPerOver = [];
				var batsMan=[];
				for(key in specialData)
				{
					for(nestedKey in specialData[key])
					{
				     	for(batsman in specialData[key][nestedKey]){
							batsMan.push(batsman);
							wicketsPerOver.push(key);
						}
					}
					
				}	
				wicketScaleGroup.selectAll('img')
					.data(batsMan)
					.enter()
					.append("image")
					.attr("value",function(d,i){return d})
					.attr("x",function(d, i)
					{
				     	return   xScale(wicketsPerOver[i])-5
					})
					.attr("y",function(d,i)
					{
						var count =0 ;
						for(var index = i ;index>=0 ; index--)
						{
							if(wicketsPerOver[index]==wicketsPerOver[i])
							{
								count++;
							}
						}
						return count*(ballSize*1.1)-ballSize;
					})
					.attr("width",ballSize)
					.attr("height",ballSize)
					.attr("fill","red")
					.attr("xlink:href",specialDataLabel)
					.on("mouseover",function()
					{
					outerLoop:	for(key in specialData)
								{
									for(nestedKey in specialData[key])
									{
										for(batsman in specialData[key][nestedKey])
										{
											if(batsman==d3.select(this).attr('value'))
											break outerLoop;
										}
									}
								}	
							tooltip.style("visibility", "visible")
						   .style("top", (event.pageY-10)+"px")
					       .style("left",(event.pageX+10)+"px")
						   .text(d3.select(this).attr('value')+" "+specialData[key][nestedKey][batsman]);
					//	tooltip.style("visibility", "visible");
					//	getToolTipForShowWicketStatus(d3.select(this).attr('value'))
					})
					.on("mouseout",function(){tooltip.style("visibility", "hidden")});			
								
				
				
                var yAxisElem = svgElement.append('g')
                    .attr('class', 'y axis')
                    .attr("transform", "translate(" + (-marginCrickedAnalChart.yScalePaddingLeft) + "," + 0 + ")")
                    .attr("stroke", axisColor)
                    .attr("fill", 'none');
					
					yAxis.tickSize(0,50);
		
		/*		yAxisElem.append("image")
				         .attr("x",0)
						 .attr("y",0)
						 .style("stroke",'none')
						 .attr("height",scaleHeight)
						 .attr("width",marginCrickedAnalChart.yScalePaddingLeft)
						 .attr("xlink:href",'left-side-pattern.png');*/
			var gradientYAxis = yAxisElem.append("svg:defs")
									.append("svg:linearGradient")
									.attr("id", "gradientYAxis")
									.attr("x1", "0%")
									.attr("y1", "0%")
									.attr("x2", "100%")
									.attr("y2", "100%")
									.attr("spreadMethod", "pad")
								//	.attr("gradientUnits", "userSpaceOnUse")
									.attr("gradientTransform","rotate(45)");

				gradientYAxis.append("stop")
					.attr("offset", "0")
					.attr("stop-color", "#9c9ca6");
				gradientYAxis.append("stop")
					.attr("offset", "0.5")
					.attr("stop-color", "#ffffff");

				gradientYAxis
					.append("stop")
					.attr("offset", "1")
					.attr("stop-color", "#9c9ca6");		

				yAxisElem.append("rect")
						 .attr("class","run-axis")
						 .attr("x",0)
						 .attr("y",0)
						 .style("stroke",'none')
						 .attr("height",scaleHeight)
						 .attr("width",marginCrickedAnalChart.yScalePaddingLeft)
						 .attr("fill","url(#gradientYAxis)");
				
				var yAxisRef=yAxisElem.call(yAxis);
				yAxisRef.selectAll("text").attr("transform", "translate(" + (marginCrickedAnalChart.yScalePaddingLeft) + "," + 0 + ")").style("fill",tickColor);
				var yAxisLabel = svgElement.append("g")
                    .attr('class', 'yaxislabel')
                    .attr("transform", "translate(" + (-marginCrickedAnalChart.yScalePaddingLeft*2) + "," + 2*marginCrickedAnalChart.bottom + ")");
				yAxisLabel.append("text")
						  .attr("x",(0))
						  .attr("y",(scaleHeight/2))
						  .text(yLabel)
						  .style("font-size",'20')
						  .attr("transform","rotate(-90)")
						  .style("fill",tickColor)
						  .style("font-family",fontStyle);
				
				//width of bars	
				var barWidth=(scaleWidth/(data.length-1)*0.5);
				
				//simple line
				var simpleLine = svgElement.append("g")
								    .attr("class","simple-line")
								    .attr("transform","translate(0,0)");
				//				selectAll(".vline").d
                  simpleLine.append("line")
                    .attr("y1", function (d) {
                    return 0;
                })
                    .attr("y2", function (d) {
                    return scaleHeight;
                })
                    .attr("x1", function (d) {
                    return 0;
                })
                    .attr("x2", function (d) {
                    return 0;
                })
                    .style("stroke", "gray");
                  //  .attr("transform", "translate(" + left + "," + top + ")");	
				//draw bars
				var barRectangle=svgElement.append("g")
								.attr("class","bar-rectangle")
								.attr("transform","translate(0,0)");
		var gradientBar = barRectangle.append("svg:defs")
									.append("svg:linearGradient")
									.attr("id", "gradientBar")
									.attr("x1", "0%")
									.attr("y1", "0%")
									.attr("x2", "100%")
									.attr("y2", "100%")
									.attr("spreadMethod", "pad")
								//	.attr("gradientUnits", "userSpaceOnUse")
									.attr("gradientTransform","rotate(45)");

				gradientBar.append("stop")
					.attr("offset", "0")
					.attr("stop-color", "#9c9ca6");
				gradientBar.append("stop")
					.attr("offset", "0.5")
					.attr("stop-color", "#ffffff");

				gradientBar
					.append("stop")
					.attr("offset", "1")
					.attr("stop-color", "#0e0c1a");		

				barRectangle.append("rect")	
								.attr("class","run-bar")
								.attr("x",0)
								.attr("y",0)
								.style("stroke",'none')
								.attr("height",scaleHeight)
								.attr("width",scaleWidth+15)
								.attr("fill","url(#gradientBar)");
			/*	barGrouping.append("image")
							.attr("x",-20)
								.attr("y",0)
								.style("stroke",'none')
								.attr("height",scaleHeight)
								.attr("width",scaleWidth+55)
								.attr("xlink:href",'graph-base.png');*/
					

							 var gridManager = {
            init: function (svg, height, width, left, top) {
                var hfactor = Math.ceil(height * .2);
                var hRange = Math.ceil(height / hfactor);
                svg.selectAll(".hline").data(d3.range(hRange)).enter()
                    .append("line")
                    .attr("y1", function (d) {
                    return d * hfactor + 6;
                })
                    .attr("y2", function (d) {
                    return d * hfactor + 6;
                })
                    .attr("x1", function (d) {
                    return 0;
                })
                    .attr("x2", function (d) {
                    return width;
                })
                    .style("stroke", "gray")
                    .attr("transform", "translate(" + left + "," + top + ")");
            }

        };
				
				gridManager.init(svgElement, scaleHeight, scaleWidth, marginCrickedAnalChart.xScalePaddingLeft, marginCrickedAnalChart.xScalePaddingTop);
				
				//draw Legend of powerPlay
				var legendGroup = svgElement.append("g")
								.attr("class","legend-grouping")
								.attr("transform","translate("+(marginCrickedAnalChart.yScalePaddingLeft)/4+","+3+")");
					legendGroup.append("rect")	
							   .attr('width',legendWidth)
							   .attr('height',legendHeight)
							   .attr('fill',specialXDataColor);
					legendGroup.append('text')
							   .attr('x',legendHeight+3)
							   .attr('y',legendHeight/2)
							   .style("font-size !important",legendSize)
							   .style("fill",tickColor)
							   .style("font-family",fontStyle)
							   .text(specialXDataLabel);
				
				var barGrouping=svgElement.append("g")
								.attr("class","bar-grouping")
								.attr("transform","translate(0,0)");
				var bars=barGrouping.selectAll(".runs-bar")
							.data(data)
							.enter()
							.append("rect")
							.attr("class","runs-bar")
							.attr("x",function(d){
								return (xScale(d["x"])-barWidth/2);
							
							})
							.attr("y",function(d){
							
								return yScale(d["y"])+barWidth/2-5.5;
							})
							.attr("width",barWidth)
							.attr("height",function(d){
								return 0;
							})
							.attr("fill",function(d,i)
							{
									if(specialXData.indexOf(d["x"])==-1){return xDatacolor;}else{return specialXDataColor;}
							})
							.style("z-index", 51);
				var arcOverBar = barGrouping.selectAll("circle")
											.data(data)
							.enter()
							.append("circle")
							.attr("class","runs-bar")
							.attr("cx",function(d){
								return (xScale(d["x"]));
							
							})
							.attr("cy",function(d){
								return yScale(d["y"])+barWidth/2-5.5;
							})
							.attr("r",barWidth/2)
							.attr("fill",function(d,i)
							{
									if(specialXData.indexOf(d["x"])==-1){return xDatacolor;}else{return specialXDataColor;}
							})
							.style("z-index", 1);

			//	arcOverBar.transition().duration(2500);

				bars.transition().duration(1000).attr("height",function(d){
								return (yScale(0)-yScale(d["y"]));
							});
							

					
				svgElement.selectAll("text").style("font-weight",500);
				
			/*	function getToolTipForShowWicketStatus(keyName)
				{
					tooltip.style("z-index", 1)
							.style("visibility", "visible");
						   .style("top", (event.pageY-10)+"px")
					       .style("left",(event.pageX+10)+"px")
						   .text(keyName);
				}*/
				
				/*	
				yAxis.tickValues(yTickArray);
				
                var yAxisRef=yAxisElem.call(yAxis);
				
					yAxisRef.selectAll(".tick")
                    .each(function (data) {
						svgElement.append("line")
							.attr('class', 'horizontalGridLine')
							.attr('x1', 0)
							.attr('x2', (scaleWidth))
							.attr('y1', function () {
							return yScale(data);
						})
						.attr('y2', function () {
							return yScale(data);
						}).attr('stroke', '#F2F3F3');
					})
					.style("display", function () {
						
					});
				*/	
					/*
					yAxisRef.selectAll("text")
					.text(function(d,i){
						var tickVal="";
						if(parseInt(data1[i]["customY"]) == i){
							tickVal= data1[i][yFieldName];
						}
						return tickVal;
					})
					*/
			},
	/*
				this chart supprot xscale in quantity not for date
				also yscale should be sorted
			*/
			bulletBar:function(cnfg){
				
				var left=0,right;
				var yLabelLeftPer=0;
				if(width<400){
					left=80;
					right=80
					//yLabelLeftPer=0.8;
				}else{
					left=width*0.2;
					right=width*0.2;
					//yLabelLeftPer=0.8;
				}
				
				var marginBulletChart={left:left,right:right,bottom:height*0.2,top:height*0.05,chartSeparator:2,xScalePaddingTop:height*0.1,yScalePaddingLeft:left};
				
				var scaleWidth=width-marginBulletChart.left-marginBulletChart.right;
				var scaleHeight=height-marginBulletChart.top-marginBulletChart.bottom;
				
				var firstChartWidth=(scaleWidth/2)-marginBulletChart.chartSeparator;
				var secondChartStartPos=(scaleWidth/2)+marginBulletChart.chartSeparator;
				
				var data1=cnfg.data1;
				var data2=cnfg.data2;
				var colorArray=cnfg.colorArray;
				var xFieldName=cnfg.xFieldName;
				var yFieldName=cnfg.yFieldName;
				var axisColor=cnfg.axisColor;
				
				/*
				data1.sort(function(a,b){
					if(a[xFieldName]>b[xFieldName]){
						return 1;
					}
					else if(a[xFieldName]<b[xFieldName]){
						return -1;
					}else{
						return 0;
					}
				});
				*/
				
				
				var maxX=data1[0][xFieldName];
				
				//genereate timeIndex in integer
				for(var i=0;i<data1.length;i++){
					data1[i]["timeIndex"]=i;
					data1[i]["customY"]=i;
					
					if(data1[i][xFieldName]>data2[i][xFieldName]){
						maxX=data1[i][xFieldName];
					}else{
						maxX=data2[i][xFieldName];
					}
				}
				
				var yTickArray=[];
				
				for(var i=0;i<data1.length;i++){
					//yTickArray.push(data1[i][yFieldName]);
					yTickArray.push(data1[i]["customY"]);
				}
				
				
				
				xScale =d3.scale.linear()
                    .range([(firstChartWidth), 0]);
				
				var minX=data1[0]["timeIndex"];
				//var maxX=data1[(data1.length-1)]["timeIndex"];		
				
				//var maxX=d3.max(data1,function(d){
					//return d[xFieldName];
				//});
				
				xScale.domain([0,maxX]);
				
				
				var tempXScale=d3.scale.linear()
                    .range([firstChartWidth,0]);
				
				
				var tempMinX=d3.min(data1,function(d){
					return d[xFieldName];
				})
				
				var tempMaxX=d3.max(data1,function(d){
					return d[xFieldName];
				})
				
				tempXScale.domain([0,maxX]);
				
				
				//var baseXScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.5);
                //var tempXScale = d3.scale.ordinal();

                
               // tempXScale.domain(keysArray).rangeRoundBands([0, baseXScale.rangeBand()]);
				
				
				
                yScale =d3.scale.linear()
                    .range([(scaleHeight),0]);
				
				var minYScale=d3.min(data1,function(d){
								return d[yFieldName];
							});
				
				var maxYScale=d3.max(data1,function(d){
								return d["customY"];
							});
				
				//var midPoint=(minYScale+maxYScale)/2;	
				maxYScale = maxYScale * 1.5;			
				
				yScale.domain([0,maxYScale]);
				
				svgElement = svgElement.append("g")
                    .attr("transform", "translate(" + marginBulletChart.left + "," + (-marginBulletChart.top) + ")");

				xAxis = d3.svg.axis().scale(xScale)
                    .orient("bottom").ticks(10).tickSize(5, 0);


                yAxis = d3.svg.axis().scale(yScale)
                    .orient("left");
					
				var ticksInterval=maxX/5;
				xAxis.tickValues(d3.range(0,maxX,(ticksInterval)));
                var xAxisRef=svgElement.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + 0 + "," + (scaleHeight+marginBulletChart.xScalePaddingTop) + ")")
                    .attr("stroke", axisColor)
                    .attr("fill", 'none')
                    .call(xAxis)
					
					
					
					
                var yAxisElem = svgElement.append('g')
                    .attr('class', 'y axis')
                    .attr("transform", "translate(" + (-marginBulletChart.yScalePaddingLeft*0.05) + "," + 0 + ")")
                    .attr("stroke", axisColor)
                    .attr("fill", 'none');
				
				yAxis.tickValues(yTickArray);
				
                var yAxisRef=yAxisElem.call(yAxis);
				
					yAxisRef.selectAll(".tick")
                    .each(function (data) {
						svgElement.append("line")
							.attr('class', 'horizontalGridLine')
							.attr('x1', 0)
							.attr('x2', (scaleWidth))
							.attr('y1', function () {
							return yScale(data);
						})
						.attr('y2', function () {
							return yScale(data);
						}).attr('stroke', '#F2F3F3');
					})
					.style("display", function () {
						
					});
					
					yAxisRef.selectAll("text")
					.text(function(d,i){
						var tickVal="";
						if(parseInt(data1[i]["customY"]) == i){
							tickVal= data1[i][yFieldName];
						}
						return tickVal;
					})
				
				var barClassName=yFieldName+"-1";
				var barGrouping1=svgElement.append("g")
								.attr("class","bar-grouping");
				
				var heightOfBars=((scaleHeight/(data1.length-1))*0.5);
				var barGroupRangeBand=heightOfBars/2;
				var barGrouping1Ref=barGrouping1.selectAll("."+barClassName)
							.data(data1)
							.enter()
							.append("rect")
							.attr("class",""+barClassName)
							.attr("x",function(d){
								return xScale(0);
							})
							.attr("y",function(d){
								return yScale(d["customY"])-(barGroupRangeBand);
							})
							
							.attr("height",heightOfBars)
							.attr("width",function(d){
								return 0;
							})
							.on("mouseover",function(d,i){
								//var yHeadingValueMap=[{"headingName":yFieldName,"headingVal":data1[i][yFieldName]}];
								//toolTipManager.showToolTip(d3.event,"",(xFieldName +" "+d[xFieldName]), false,yHeadingValueMap);
								var yHeadingValueMap=[{"headingName":xFieldName,"headingVal":d[xFieldName]}];
								toolTipManager.showToolTip(d3.event,"",(yFieldName +" "+data1[i][yFieldName]), false,yHeadingValueMap);
								
								d3.select(this).style("fill","yellow");
							})
							.on("mouseleave",function(){
								toolTipManager.hideTooTip();
								d3.select(this).style("fill",colorArray[0]);
							});
							
				barGrouping1Ref
				.transition()
				.duration(1000)
				.attr("x",function(d){
					return (tempXScale(d[xFieldName]));
				})
				.attr("width",function(d){
					return (xScale(0)-tempXScale(d[xFieldName]));
				})
				.attr("fill",function(){
					return colorArray[0];
				})	;			
				
												
				//second chart 
				
				
				//genereate timeIndex in integer
				for(var i=0;i<data2.length;i++){
					data2[i]["timeIndex"]=i;
					data2[i]["customY"]=i;
				}
				
				var yTickArray2=[];
				
				for(var i=0;i<data2.length;i++){
					//yTickArray.push(data1[i][yFieldName]);
					yTickArray2.push(data2[i]["customY"]);
				}
				
				var xScale2 =d3.scale.linear()
                    .range([secondChartStartPos,scaleWidth]);
				
				var minX2=data2[0]["timeIndex"];
				//var maxX2=data1[(data1.length-1)]["timeIndex"];		
				
				var maxX2=d3.max(data2,function(d){
					return d[xFieldName];
				});		
				

				xScale2.domain([0,maxX2]);
				
				var xAxis2 = d3.svg.axis().scale(xScale2)
                    .orient("bottom").ticks(10).tickSize(5, 0);
				
			
				var ticksInterval=maxX2/5;
				xAxis2.tickValues(d3.range(0,maxX2,(ticksInterval)));
				//var tickArray=tickController.getTickArray(0,maxX2,3);
				//xAxis2.tickValues(tickArray);
				
				svgElement.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + 0 + "," + (scaleHeight+marginBulletChart.xScalePaddingTop) + ")")
                    .attr("stroke", axisColor)
                    .attr("fill", 'none')
                    .call(xAxis2)
					.selectAll("text")
                    .text(function (d, i) {
						
						var tickVal="";
						if(i == 0){
							return tickVal;
						}else{
							return d;
						}
					});
					
					
                var yAxisElem2 = svgElement.append('g')
                    .attr('class', 'y axis')
                    .attr("transform", "translate(" + (scaleWidth+marginBulletChart.yScalePaddingLeft*0.1) + "," +(0)+ ")")
                    .attr("stroke", axisColor)
                    .attr("fill", 'none');
				
				var yAxis2 = d3.svg.axis().scale(yScale)
                    .orient("right");
					
				//yAxis2.tickValues(d3.range(marginBulletChart.top, scaleHeight,(scaleHeight/9)));
				
				yAxis2.tickValues(yTickArray2);
                var yAxisRef2=yAxisElem2.call(yAxis2);
				yAxisRef2.selectAll("text")
						.text(function(d,i){
							var tickVal="";
							if(parseInt(data2[i]["customY"]) == i){
								tickVal= data2[i][yFieldName];
							}
							return tickVal;
						})
				
				
				var tempXScale2=d3.scale.linear()
                    .range([0,(scaleWidth-secondChartStartPos)]);
				
				
				var tempMinX2=d3.min(data2,function(d){
					return d[xFieldName];
				})
				
				var tempMaxX2=d3.max(data2,function(d){
					return d[xFieldName];
				})
				
				tempXScale2.domain([0,maxX]);
					
				var barGrouping2=svgElement.append("g")
											.attr("class","bar-grouping");
				
				var barClassName2=yFieldName+"-2";	
				var heightOfBars=((scaleHeight/(data1.length-1))*0.5);
				var barGroupRangeBand1=heightOfBars/2;
				var barGrouping2Ref=barGrouping2.selectAll("."+barClassName2)
							.data(data2)
							.enter()
							.append("rect")
							.attr("class",""+barClassName2)
							.attr("x",function(d){
								return (xScale2(0));
							})
							.attr("y",function(d){
								return yScale(d["customY"])-barGroupRangeBand1;
							})
							.attr("height",heightOfBars)
							.attr("width",function(d){
								return 0;;
							})
							.on("mouseover",function(d,i){
								var yHeadingValueMap=[{"headingName":xFieldName,"headingVal":d[xFieldName]}];
								toolTipManager.showToolTip(d3.event,"",(yFieldName +" "+data1[i][yFieldName]), false,yHeadingValueMap);
								d3.select(this).style("fill","yellow");
							})
							.on("mouseleave",function(){
								toolTipManager.hideTooTip();
								d3.select(this).style("fill",colorArray[1]);
							});;
							
				barGrouping2Ref
				.transition()
				.duration(1000)
				.attr("width",function(d){
					return tempXScale2(d[xFieldName]);
				})
				.attr("fill",function(){
					return colorArray[1];
				});
				
				//y inidcation label
				var yAxisPath=yAxisRef.selectAll("path");
				var yPathLength=yAxisPath.node().getTotalLength();
				
				var pixcelPerChar=6;
				var yTotalPixcel=cnfg.yLabel.length*pixcelPerChar;
				var yLabelTop=((yPathLength)/2+yTotalPixcel/2);
				var yLabelLeft=-(margin.left)*5.5;
				var yLabelLeft1=(margin.left)*5.5;
				
				axisLabelController.appendLabel(cnfg.yLabel,yLabelLeft,yLabelTop,-90,yAxisRef,textStyleConfg.yLabelColor,600);
				axisLabelController.appendLabel(cnfg.yLabel,yLabelLeft1,yLabelTop,-90,yAxisRef2,textStyleConfg.yLabelColor,600);
				
				//x indication label
				var xLabelLength=cnfg.xLabel.length*pixcelPerChar;
				var xLabelLeft=scaleWidth/2-xLabelLength/2;
				var xLabelTop=scaleHeight*0.15;
				axisLabelController.appendLabel(cnfg.xLabel,xLabelLeft,xLabelTop,0,xAxisRef,textStyleConfg.xLabelColor,600);
				//hide all axis path
				hideAxisPath(svgElement);
					
				//set font here
				
					setTextStyleAndSvgBackGround(svgElement);
						  
							
			},

            setYSclae: function (yField1, yField2) {
                var minAndMax = d3.extent(data, function (d) {
                    return d[yField1];
                });

                var minAndMax1 = d3.extent(data, function (d) {
                    return d[yField2];
                });


                var min1 = minAndMax[0];
                var max1 = minAndMax[1];

                var min2 = minAndMax1[0];
                var max2 = minAndMax1[1];

                var minYScaleTemp, maxYScaleTemp;
                if (min1 > min2) {
                    minYScaleTemp = min2;
                } else {
                    minYScaleTemp = min1;
                }

                if (max1 > max2) {
                    maxYScaleTemp = max1;
                } else {
                    maxYScaleTemp = max2;
                }

                minYScale = minYScaleTemp;
                maxYScale = maxYScaleTemp;
                yScale.domain([minYScale, (maxYScale)]);

            },
			
			barWithLogo:function(cnfg){
				
				width = $(selectorElement).width();
				height = $(selectorElement).height()*0.7;
				//textStyleConfg=styleConfg;
				
				selectorId = $(selectorElement).attr("id")
				$("#"+selectorId).empty();
				
				var svgClassName = selectorId + "_svg";
				
				console.error("id "+selectorId);
				svgElement = d3.select("#" + selectorId)
					.append("svg")
					.attr("width", '100%')
					.attr("height", height)
					.attr("class",svgClassName)
					.attr('viewBox','110 0 '+Math.max(width,height) +' '+Math.min(width,height) )
					.attr('preserveAspectRatio','xMinYMin')
					
				
				var marginCrickedAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.05,top:height*0.07,chartSeparator:5};
				
				var scaleWidth=width-marginCrickedAnalChart.left-marginCrickedAnalChart.right;
				var scaleHeight=height-marginCrickedAnalChart.top-marginCrickedAnalChart.bottom;
				
				var tital = cnfg.data.tital; 
				var titalColor = cnfg.data.titalColor;
				var yData=cnfg.data.yData;
				var xData=cnfg.data.xData;
				var imagePathArray=cnfg.data.imagePathArray;
				var xAxisLabelArray=cnfg.data.xData;
				var color=cnfg.data.color;
				var xIndicationLabel=cnfg.data.xIndicationLabel;
				var yIndicationLabel=cnfg.data.yIndicationLabel;
				//var xDatacolor = cnfg.data.xDatacolor;
				//var specialXData = cnfg.data.specialXData;
				//var specialDataLabel = cnfg.data.specialDataLabel;
				//var specialData = cnfg.data.specialData;
				//var specialXDataColor = cnfg.data.specialXDataColor;
				//var specialXDataLabel = cnfg.data.specialXDataLabel;
				//var xLabelColor =  cnfg.data.xLabelColor;
				//var yLabel = cnfg.data.yLabel;
				//var specialDataLabelOfWicket = cnfg.data.specialDataLabelOfWicket;
				//var colorArray=cnfg.colorArray;
				//var xFieldName=cnfg.xFieldName;
				//var yFieldName=cnfg.yFieldName;
				//var axisColor=cnfg.axisColor;
				//var tickColor=cnfg.data.textColor;
				//var fontStyle=cnfg.data["font-style"];
				//var ballSize =10,wicketWidth=30,wicketHeight=50,legendWidth=14,legendHeight=14,legendSize=14;
				//make Array of data
				var data=[];
				var loopIterator=yData.length>xData.length?yData:xData;
				var xAxisTickValues=[];
				for(var i=0;i<loopIterator.length;i++){
					var obj={"timeIndex":i,"x":xData[i],"y":yData[i],"imagePath":imagePathArray[i],'name':xAxisLabelArray[i]}
					data.push(obj);
					xAxisTickValues.push(i);
				}			
				
				xScale =d3.scale.linear()
                    .range([(0),scaleWidth-marginCrickedAnalChart.right]);
				
				var minX=data[0]["timeIndex"];
						 
				var maxX=data[data.length-1]["timeIndex"];
				
				xScale.domain([0,maxX]);
				
				yScale =d3.scale.linear()
                    .range([(scaleHeight),0]);
				
				var minYScale=d3.min(data,function(d){
								return d["y"];
							});
				
				var maxYScale=d3.max(data,function(d){
								return d["y"];
							});
				
				maxYScale = maxYScale * 1.5;			
				
				yScale.domain([0,maxYScale]);
				
				svgElement = svgElement.append("g")
                    .attr("transform", "translate(" + marginCrickedAnalChart.left + "," + marginCrickedAnalChart.top + ")");

				xAxis = d3.svg.axis().scale(xScale)
                    .orient("bottom").ticks(10);


                yAxis = d3.svg.axis().scale(yScale)
                    .orient("left");
				
				var xAxisElm=svgElement.append("g")
				.attr('class', 'x axis')
                .attr("transform", "translate(" + (0) + "," + (scaleHeight) + ")");
				
				var yAxisElm=svgElement.append("g")
				.attr('class', 'y axis')
                .attr("transform", "translate(" + (0) + "," + (0) + ")");
				
				xAxis.tickValues(xAxisTickValues);
				
				//xAxisElm.call(xAxis);
				
				
				yAxisElm.call(yAxis);
				
				
				var barWidth=(scaleWidth/data.length)*0.5;
				
				//create bars
				
				var barGrouping=svgElement.append("g")
								.attr("class","bar-grouping");
								
				var bars=barGrouping.selectAll(".bar")
							.data(data)
							.enter()
							.append("rect")
							.attr("width",barWidth)
							.attr("height",function(d,i){
								return 0;
							})
							.attr("x",function(d,i){
								
								return xScale(d["timeIndex"]);
								
							})
							.attr("y",function(d,i){
								return yScale(d.y);
							})
							.attr("fill",function(d,i){
								return color;
							})
							.on("mouseover",function(d,i){
								var yHeadingValueMap=[{"headingName":yIndicationLabel,"headingVal":d["y"]}];
								toolTipManager.showToolTip(d3.event,"",(xIndicationLabel +" "+d["x"]), false,yHeadingValueMap);
								d3.select(this).style("fill","yellow");	
							})
							.on("mouseleave",function(){
								toolTipManager.hideTooTip();
								d3.select(this).style("fill",color);
							});
				
				bars
				.transition()
				.duration(1000)
				.attr("height",function(d,i){
					return (yScale(0)-yScale(d.y))
				})
				;
				
				var xScaleOuterDiv=d3.select("#"+selectedElementId).append("div").style("left",(xScale(0))).style("width",scaleWidth).style("height",height*0.4);
				
				var xScaleGrouping=xScaleOuterDiv.selectAll(".xScalebar")
								  .data(data)
								  .enter()
								  .append("div")
								  .style("width",barWidth)
								  .style("height",(height*0.2))
								  
								  .style("left",function(d,i){
										return 0;
								  })
								  /*
								  .attr("y",function(d,i){
										return yScale(d["y"]);
								  })
								  */
								  .style("position","absolute")
								  .style("display","inline-block");
								  
								  
				var logoImgArray=xScaleGrouping.append("img")
							/*
							  .attr("x",function(d,i){
									return xScale(d["timeIndex"])-(barWidth/2.9)
							  })
							.attr("y",function(d,i){
								return 0;
							})
							*/
							.style("width",barWidth)
							.style("height",(height*0.2))
							.attr("src",function(d,i){
								return d.imagePath;
							})
							.on("mouseover",function(d,i){
								var yHeadingValueMap=[{"headingName":yIndicationLabel,"headingVal":d["y"]}];
								toolTipManager.showToolTip(d3.event,"",(xIndicationLabel +" "+d["x"]), false,yHeadingValueMap);
								
							})
							.on("mouseleave",function(){
								toolTipManager.hideTooTip();
								
							});
				
				xScaleGrouping
				.transition()
				.duration(1000)
				.style("left",function(d,i){
					if(i==0)	
					return marginCrickedAnalChart.left;
					else
					return (marginCrickedAnalChart.left)+xScale(i);
				});
				
				xScaleGrouping.append("div")
							.style("width",barWidth)
							.style("height",(height*0.1))
							.style("margin-top",height*0.05)
							.style("left",function(d,i){
									if(i==0)	
									return marginCrickedAnalChart.left;
									else
									return (marginCrickedAnalChart.left)+xScale(i);
							})
							.html(function(d,i){
								return d.name;
							})
							.style("word-wrap","break-word");	
							  	
				//hide all axis path
				hideAxisPath(svgElement);
					
				//set font here
				
				setTextStyleAndSvgBackGround(svgElement);
				
			}
        };

        var drawSquare = {
            squareChart: function (options) {
                var options = $.extend({
                    'color': 'red',
                        'axisColor': 'blue',
                        'data': [],
                        'xFieldName': '',
                        'yFieldName': '',
                        'widthOfSquare': 20
                }, options);

                var data;
                if (options.data.length == 0) {
                    data = chartData;
                } else {
                    data = options.data;
                }


                var xFieldNameSquare;
                var yFieldNameSquare;
                if (options.xFieldName == "") {
                    xFieldNameSquare = xFieldName;
                } else {
                    xFieldNameSquare = options.xFieldName;
                }

                if (options.yFieldName == "") {
                    yFieldNameSquare = yFieldName;
                } else {
                    yFieldNameSquare = options.yFieldName;
                }

                var differenceSlab = 10;
                var widthOfEachBar = Math.floor((width - margin.scale) / (data.length));
                var elementId = $(selectorElement).attr("id");
                var className = elementId + "_square_" + yFieldNameSquare;

                var squareDimesion = options.widthOfSquare;
                var percentageFctor = 35;

                svgElement.selectAll("." + className)
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("class", className)
                    .attr("x", function (d, i) {
                    return (xScale(parseDate.parse(d[xFieldNameSquare])) - ((squareDimesion * percentageFctor) / 100) + 7);
                })
                    .attr("y", function (d) {
                    return (yScale(d[yFieldNameSquare]) - 3 * ((squareDimesion * (percentageFctor)) / 100));
                })
                    .attr("width", squareDimesion)
                    .attr("height", function (d) {
                    return squareDimesion;
                })
                    .attr("fill", options.color)
                    .on("mouseover", function (d) {
                    var yFieldVal = d[yFieldNameSquare];
                    d3.select(this)
                        .attr('width', (squareDimesion + 5))
                        .attr('height', (squareDimesion + 5));
                    attachToolTip.showToolTip(d3.event);
                })
                    .on("mouseleave", function (d) {
                    var yFieldVal = d[yFieldNameSquare];
                    d3.select(this)
                        .attr('width', (squareDimesion))
                        .attr('height', (squareDimesion));
                    attachToolTip.hideTooTip();
                });

                if ($(selectorElement).find(".axis").length == 0) {
                    svgElement.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (height - margin.scale + 10) + ")")
                        .attr("stroke", options.axisColor)
                        .attr("fill", 'none')
                        .call(xAxis);

                    svgElement.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + (width - margin.scale + 10) + "," + 3 + ")")
                        .attr("stroke", options.axisColor)
                        .attr("fill", 'none')
                        .call(yAxis);
                }

            }

        }

        var drawCircle = {
            circleChart: function (options) {
                var options = $.extend({
                    'color': 'red',
                        'axisColor': 'blue',
                        "r": 10,
                        'data': []
                }, options);
                var data;
                if (options.data.length == 0) {
                    data = chartData;
                } else {
                    data = options.data;
                }

                var differenceSlab = 10;
                var widthOfEachBar = Math.floor((width - margin.scale) / (data.length));
                var elementId = $(selectorElement).attr("id");
                var className = elementId + "_circle";
                var squareDimesion = 20;
                var percentageFctor = 35;
				svgElement.selectAll("." + className)
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", className)
                    .attr("cx", function (d, i) {
						return (xScale(i) + options.r/2);
					})
                    .attr("cy", function (d) {
						return (yScale(d[yFieldName]) );
					})
                    .attr("r", options.r)
					.attr("fill", options.color)
                    .on("mouseover", function (d, i) {
					
						//$("#tooltipChart").show();
						console.log(JSON.stringify(d));
						
						//toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, "Money : " + d.id + "    Date : " + d.doj);
						var yHeadingValueMap=[{"headingName":cfgArea.yAxisIndicationLabel,"headingVal":d[yFieldName]}];
							
						toolTipManager.showToolTip(d3.event, "",(d[xFieldName]), false,yHeadingValueMap);
							var yFieldVal = d[yFieldName];
							d3.select(this)
								.attr('r', (options.r + 5));
							
						d3.select(this).attr("stroke",("cyan"));
						d3.select(this).attr("stroke-width","2").style("opacity","0.5");
						//attachToolTip.showToolTip(d3.event);
					})
                    .on("mouseleave", function (d) {
					
						var yFieldVal = d[yFieldName];
						d3.select(this)
							.attr('r', (options.r));
						toolTipManager.hideTooTip();
						
						d3.select(this).attr("stroke",("none"));
						d3.select(this).attr("stroke-width","0").style("opacity","1");
					   // attachToolTip.attachToolTip(d3.event);
					});


                if ($(selectorElement).find(".axis").length == 0) {
                    svgElement.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (height - margin.scale + 7) + ")")
                        .attr("stroke", options.axisColor)
                        .attr("fill", 'none')
                        .call(xAxis)
						.selectAll("text")
						.text(function(d){
							return data[d][xFieldName];
						});

                    svgElement.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + (width - margin.scale + 5) + "," + 3 + ")")
                        .attr("stroke", options.axisColor)
                        .attr("fill", 'none')
                        .call(yAxis);
                }

            }

        }

		
		var selectorId;
		function init(){
			
			//if (arguments.length == 1) {
			width = $(selectorElement).width();
			height = $(selectorElement).height();
			textStyleConfg=styleConfg;
			
			selectorId = $(selectorElement).attr("id")
			var svgClassName = selectorId + "_svg";
			
			svgElement = d3.select("#" + selectorId)
				.append("svg")
				.attr("width", '100%')
				.attr("height", '100%')
				.attr("class",svgClassName)
				.attr('viewBox','110 0 '+Math.max(width,height) +' '+Math.min(width,height) )
				.attr('preserveAspectRatio','xMinYMin')
				
			if (d3.select("#tooltipChart").empty()) {

                toolTipManager.appendToolTip();
            }	
		}
        
		init();		
				
				
			
            
			

        //} else {
          //  initSvg();
			//textStyleConfg=styleConfg;
        //}


        var drawPieChart = {
            pieChart: function (options) {
                var options = $.extend({

                    'data': []
                }, options);

                var dataset;
                if (options.data.length == 0) {
                    dataset = chartData;
                } else {
                    dataset = options.data;
                }

                var outerRadius = width / 2;
                var innerRadius = 0;
                var arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);

                var arcOver = d3.svg.arc()
                    .outerRadius(outerRadius + 10);



                var pie = d3.layout.pie();


                var color = d3.scale.category20();


                var svg = svgElement.append("svg")
                    .attr("width", width)
                    .attr("height", height);


                var arcs = svg.selectAll("g.arc")
                    .data(pie(dataset))
                    .enter()
                    .append("g")
                    .attr("class", "slice")
                    .attr("stroke", "white")
                    .attr("stroke-width", 3)
                    .attr("transform", "translate(" + (outerRadius) + "," + (outerRadius) + ")")
                    .on("mouseover", function (d) {
                    d3.select("#piechartTooltip")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                        .style("opacity", 10)
                        .select("#value")
                        .text(d.value);

                    d3.select(this)
                        .attr("stroke", "white")
                        .transition()
                        .duration(100)
                        .attr("d", arcOver)
                        .attr("stroke-width", 10);
                })
                    .on("mouseout", function () {

                    d3.select("#piechartTooltip")
                        .style("opacity", 0);

                    d3.select(this).transition()
                        .attr("d", arc)
                        .attr("stroke", "white")
                        .attr("stroke-width", 3)
                });



                arcs.append("path")
                    .attr("fill", function (d, i) {
                    return color(i);
                })
                    .attr("d", arc);

            }

        }



        var pyramidChart={
			drawPyramidChart:function(percent,textLabelsJson,isInvertPyramid,yLabel){
				//Increase the value for increasing width
				var widthFactor = -20;

				//Moving to left 
				//Note: It will decrease the width also
				var movingLeftFactor = 200;
				
				width=width-margin.scale;
				height=height-margin.scale;
				
				scaleX = d3.scale.linear()
				.domain([widthFactor, movingLeftFactor])
				.range([0, width]),

			scaleY = d3.scale.linear()
				.domain([0, 80])
				.range([height, 0]),

			color = d3.scale.category10();
		
			var value =  getCoordinatesFromPercent(sortNumber(percent)).arrayOfPolygons;
			
			var groping;
			if(isInvertPyramid){
				groping=svgElement.append("g")
					  .attr('transform',"translate(" + ((width-width/6)) + "," + (height+height/4) + ") rotate(180)")	;
			
			}else{
				groping=svgElement.append("g")
					  .attr('transform',"translate(" + (width/4) + "," + (margin.scale) + ")")	;
			}
			
			
			groping.selectAll("polygon").data(value)
				.enter().append("polygon")
				.attr("points", function (d) {
								return d.points.map(function (d) {
									return [scaleX(d.x), scaleY(d.y)].join(",");
									}).join(" ");
					})
				.attr("fill", function (d) {
				return color(d.name)
			}).attr("stroke-width", 0)
			.data(value)
			 .on("mouseover", function (d,i) {
				/*
				d3.select("#pyramidTooltip")
					.style("left", d3.event.pageX + "px")
					.style("top", d3.event.pageY + "px")
					.style("opacity", 1)
					.select("#value")
					.text(textLabelsJson[i].accountName + ' : '+textLabelsJson[i].amount);
					*/
					//toolTipManager.showToolTip(d3.event,textLabelsJson[i].amount, "", false,textLabelsJson[i].accountName);
					var yHeadingValueMap=[{"headingName":yLabel,"headingVal":textLabelsJson[i].amount}];
						
					toolTipManager.showToolTip(d3.event,"",(textLabelsJson[i].accountName), false,yHeadingValueMap);
			})
			.on("mouseout", function () {
				// Hide the tooltip
				/*
				d3.select("#pyramidTooltip")
					.style("opacity", 0);  
				*/
				toolTipManager.hideTooTip();	
			});
					
			var legendGrouping=svgElement.selectAll(".pyramidLegendGrouping")
						  .data(color.domain().slice())
						  .enter()
						  .append("g")
						  .attr("class","pyramidLegendGrouping")
						  .attr("transform", function(d, i) { return "translate(" + (width*0.05) + "," + (10+(i*22)) + ")" });
			
			var rectWidth=20;
			var textGap=10;
			var xRectLegend=0;
			var xTextLegend=xRectLegend+rectWidth+textGap;
				
			legendGrouping.append("rect")
						.attr("class","pyramidLegend")
						.attr("width",rectWidth)
						.attr("height",20)
						.attr("x",xRectLegend)
					    .attr("fill",color);
					  	
			legendGrouping.append("text")
				  .attr("x",xTextLegend)
				  .attr("y", 9)
				  .attr("dy", ".35em")
				  .style("text-anchor", "start")
				  .attr("class",function(d,i){
					return "legend-text "+" "+d;
				  })
				  .text(function(d,i) { return textLabelsJson[i].accountName; });  
	
				
			},
			draw3DPyramidSliceChart:function(cfg){
				var jsonData = DataConverter.getValueToPercentageArray(cfg.data);
								
					
				//height = 100;
				//width = 300;
				var outFactorInitial = ( width < height ? width : height);
				outFactor=outFactorInitial*0.60;
				
				var spaceInPyramid = 10;
				var sortedJsonData = [];
				var heightArray = getHeightArrayForData(jsonData);
				var angle = getNewAngle();
				var sideUpFactor = 30;
				var latentHeightArray = getLatentHeightArray(angle, heightArray, 0, sideUpFactor);
				var leftCoordinateX;
				var leftCoordinateY;
				var rightCoordinateX;
				var rightCoordinateY;
				var angleIncrement = 0;
				var colorArray=cfg.colorArray//["#8c564b", "#2ca02c","#d62728","#bcbd22","#1f77b4","#9467bd","#e377c2", "#7f7f7f", "#bcbd22","#1f77b4","#ff7f0e",];	
				var lowerData2 = [ { "x": 0, "y": 400},  { "x":0,  "y": 400}, { "x": 0,  "y": 400}, { "x": 0,  "y": 400}, { "x": 0,  "y": 400}]
				
				
				var lowerData = [ { "x": 200, "y": 400},  { "x": 200,  "y": 200},
								 { "x": 55,  "y": 150}, { "x": 35,  "y": 350}, { "x": 200,  "y": 400}]		
					
				var labelXPoints = [];
				var labelYPoints = [];
				var xNew=0;
				var yNew=0;
				if(width>height){
					xNew=(width-outFactor)/2;
					yNew=(0);
				}
				else{
					xNew=0;
					yNew=(height-outFactor)/2.1;
				}
				//else{}
				var transitionFator={"x":(outFactorInitial-getWidthOfPyramid())/2,"y":(outFactorInitial-getWidthOfPyramid())/2};
				
				
				var lineFunction = d3.svg.line()
										  .x(function(d) { return d.x; })
										  .y(function(d) { return d.y; })
										 .interpolate("linear");
				
				 
				 
				var svgContainer = svgElement
											.append("g")
											.attr("transform", "translate(" + (xNew) + "," + (yNew) + ")");;

				//var transitionFator={"x":(width-getWidthOfPyramid())/2,"y":0};			
			
				var x = (outFactorInitial*.3) +(outFactorInitial *.1);
				var y = outFactorInitial;		
				var intialX = x;
				var intialY = y;
				var heightY = heightArray[0];
				
				var color20 = d3.scale.category20c();
				var newY = y;
				var prevY = 0;
			
				var spacingFactor = spaceInPyramid;
				var flag = 0;
				
				for(var k = 0 ; k < heightArray.length  ; k++)
				{				
					if(k == (heightArray.length - 1))
						flag = 1;
						
					var lineGraph = svgContainer.append("path")
											.attr("d", lineFunction(lowerData2))
											.style("opacity", 0.0)
											
											.attr('fill', function (d, i) {
												return "white";
											})
											.transition().duration(2000).ease("linear")
											.attr("d", lineFunction(getCoordinatesForPyramid(x, newY, heightArray[k], jsonData, 1, sideUpFactor, latentHeightArray, latentHeightArray[k], angle, heightArray, prevY, k, spacingFactor, flag, sortedJsonData[k])))
											
											.style("opacity", 0.7)

											.attr("stroke",	"white")
											.attr("stroke-width", 1)
											
											.attr('fill', function (d, i) {
												return colorArray[k];
												//return color20(+i + +100)
											});
											
					var lineGraph = svgContainer.append("path")
											.attr("d", lineFunction(lowerData2))
											.style("opacity", 0.0)
											.attr('fill', function (d, i) {
												return "white";
											})
											.transition().duration(1500).ease("linear")
											.attr("d", lineFunction(getCoordinatesForPyramid(x, newY, heightArray[k], jsonData, 2, sideUpFactor, latentHeightArray, latentHeightArray[k], angle, heightArray, prevY, k, spacingFactor, flag, sortedJsonData[k])))
											.attr("stroke", "white")
											.style("opacity", 0.5)
											.attr("stroke-width", 0.5)
											.attr('fill', function (d, i) {
												return colorArray[k]
												//return color20(i)
											});
					
					
						
					var lineGraph = svgContainer.append("path")
											.attr("d", lineFunction(lowerData2))
											.style("opacity", 0.0)
											.attr('fill', function (d, i) {
												return "white";
											})
											.transition().duration(1000).ease("linear")
											.attr("d", lineFunction(getCoordinatesForPyramid(x, newY, heightArray[k], jsonData, 3, sideUpFactor, latentHeightArray, latentHeightArray[k], angle, heightArray, prevY, k, spacingFactor, flag, sortedJsonData[k])))
											.style("opacity", 0.3)
											.attr("stroke", "white")
											.attr("stroke-width", 0.3)
											.attr('fill', function (d, i) {
													return colorArray[k];
											});
					
					
					
						newY = y - heightArray[k] - spaceInPyramid;
						y = newY;
						prevY = heightArray[k];
					
					}
				
				var fontSize=outFactor<200?'10px':'12px';
				
				for(var j = 0; j < labelXPoints.length ; j++)
				{
					
					svgContainer.append("path")
											.attr("x", outFactor)
											.attr("y", outFactor)										
											.transition().delay( function(d, i){return 600 *j}).ease("bounce")
											.attr("d", lineFunction(getCoordinatesForLine(labelXPoints[j], labelYPoints[j], heightArray[j], sortedJsonData[j])))
											.attr("stroke", function (d, i) {
													return colorArray[j];
											})
											.attr("stroke-width", 1)
											.attr('fill',"none");			
											
					svgContainer.append("text")						
											.attr("x", outFactor)
											.attr("y", outFactor)
											.transition().delay( function(d, i){return 600 *j}).ease("bounce")
											.attr("x", labelXPoints[j] + 0.15* outFactor)
											.attr("y", labelYPoints[j] + (0.1*outFactor) + heightArray[j]/2)
											.text( cfg.labels[j]+" --> " + cfg.prefix + cfg.dataLable[j]+" "+cfg.unit)										
											.attr("font-family", "sans-serif")
											.attr("font-size", fontSize)
											.attr("fill", colorArray[j]);
				}
				
				function getWidthOfPyramid(){
					return ((0.6 * outFactor)*2);
				}
				
				function getNewAngle()
				{
					var degrees = Math.atan( (outFactor / (0.6 * outFactor)) ) * 180/Math.PI;
					return degrees ;			
				}			
						
				//working
				function sortNumber(data) 
				{
					//alert(data);
					var heightArr = [];
					var num = data.sort(function (a, b) {
						return parseInt(a) < parseInt(b);
					})			
					return heightArr;
				}
				
				//working
				function getArraySum(arrayVal)
				{	
					var sum = 0 ;
					for(var j = 0 ; j < arrayVal.length ; j++)
					{
						sum = sum + arrayVal[j];				
					}
					return sum;				
				}
						
				//working
				function getHeightArrayForData(jsonData)
				{								
					var totalHeight = outFactor;
					var heightArrayValue = [];
					for(var j = 0 ; j < jsonData.length ; j++)
					{
						heightArrayValue.push(totalHeight*jsonData[j]/100); 
						sortedJsonData.push(jsonData[j]);
					}
					sortedJsonData.sort(function (a, b) {
						return parseInt(a) < parseInt(b);
					});
					heightArrayValue.sort(function (a, b) {
						return parseInt(a) < parseInt(b);
					});
					
					
					return heightArrayValue;
							
				}
				
				//working
				function getTotalWidth()
				{
					return outFactor * 0.6 ;
				}			
				
				function getLatentHeightArray(angle, heightArrayVal, prevY1, sideUpFactor)
				{

					
					var totalLatentHeight = getArraySum(heightArrayVal) / (Math.sin(angle * (Math.PI / 180.0))) ;
								
					var latentHeightArray = [];
					
					for( var j = 0 ; j < heightArrayVal.length ; j++)
					{
						latentHeightArray.push(totalLatentHeight * heightArrayVal[j] / totalLatentHeight - 
														sideUpFactor * heightArrayVal[j] / totalLatentHeight);					
					}				
	//				
					
					return latentHeightArray;						
				}		
				
				
				
				
				function getYForFourthCoordinate(latentHeight, angle, prevY, heightY)
				{
					//alert(angle);
					var x = (latentHeight * (Math.cos(angle * (Math.PI / 180))));				
					return x;
				}		
				
				function getAngleAfterApplyingSideUp(sideUpFactor, heightArray, latentHeightArray)
				{
					var heightArraySum = getArraySum(heightArray);
					
					var latentHeightArraySum = getArraySum(latentHeightArray);	
								
					var radians = Math.sin(heightArraySum / (latentHeightArraySum - sideUpFactor));
					
					
					var angle = radians * 180/ Math.PI;
					
					return angle ;	
				}			
				
				function getHeightForTop(angle, bottomWidth)
				{	
					console.log("  Angle : " + angle + " bottomWidth : " + bottomWidth);
					var radians = angle * (Math.PI / 180);
					var h =  Math.tan(radians) * bottomWidth;
					return h;
				
				}
				
				function getCoordinatesForPyramid(x, y, heightY, jsonData, sideno, sideUpFactor, latentHeightArray, latentHeight, angle, heightArray, prevY, l, spacingFactor, flag, value)
				{
					
					var startX = x;
					var startY = y;			
					var lineData = [];						
					
						if(flag != 1)
						{
							if(sideno==1){						
									
									for(var i=0;i<5;i++){
											
																
									   if(i==0)
									   {						   
											y = y - heightY ;																		
									   }
									   else if(i==1)
									   {						   
											y = y + heightY ;										
									   }
									   else if(i==2)
									   {
											if(l==0)
											{
												x = x - getTotalWidth();
												y = y - sideUpFactor;
											}
											else
											{
												x = leftCoordinateX;
												y = leftCoordinateY - spacingFactor;									
											}								
									   }
									   else if(i==3)
									   {		
									
											//x = x + latentHeight;
											//y = y -  getYForFourthCoordinate(latentHeight, getAngleAfterApplyingSideUp(sideUpFactor, heightArray, latentHeightArray), prevY);
											
											//y = y - latentHeight ;
												x = x + getYForFourthCoordinate(latentHeight, getAngleAfterApplyingSideUp(sideUpFactor, heightArray, latentHeightArray) + angleIncrement, prevY, heightY) ;
												y = y - latentHeight ;
												leftCoordinateX = x;
												leftCoordinateY = y;
											
											
									   }     
										else if(i==4)
									   {						   
											x = startX;
											y = startY - heightY;								
									   }
										
										var nextY = y;
										var nextX = x;
														
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
									}                               
							}	
							else if(sideno==2){						
									
									for(var i=0;i<5;i++){
												
									   if(i==0)
									   {						   
											y = y - heightY;	
											
									   }
									   else if(i==1)
									   {						   
											y = y + heightY ;
											
									   }
									   else if(i==2)
									   {
									
											if(l==0)
											{
												
												x = x + getTotalWidth();
												y = y - sideUpFactor;
												
											}
											else
											{
												x = rightCoordinateX;
												y = rightCoordinateY - spacingFactor;
											}
											
											
									   }
									   else if(i==3)
									   {		
										
											
											x = x - getYForFourthCoordinate(latentHeight, getAngleAfterApplyingSideUp(sideUpFactor, heightArray, latentHeightArray) + angleIncrement, prevY, heightY);
											
											y = y - latentHeight;
											
											labelXPoints.push(x);
											labelYPoints.push(y);
											
											rightCoordinateX = x;
											rightCoordinateY = y;
											
									   }     
										else if(i==4)
									   {						   
											x = startX;
											y = startY - heightY;
											
									   }
										
										var nextY = y;
										var nextX = x;							   
									 
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
									}   
								}
								
							else if(sideno==3){		
							
									if(flag != 1)
									{
										var startXVal;
										var startYVal;
										for(var i=0;i<5;i++){
												
											
										   if(i==0)
										   {			
												startXVal = x;
												y = y - heightY;
												startYVal = y;								
										   }
										   else if(i==1)
										   {						   
												x = leftCoordinateX;
												y = leftCoordinateY;							 
										   }
										   else if(i==2)
										   {
												x = x + (startX - leftCoordinateX);  
												y = y - (startYVal - leftCoordinateY);
												
										   }
										   else if(i==3)
										   {		
												x = rightCoordinateX;
												y = rightCoordinateY;
												
										   }   
											
											else if(i==4)
											{						   
												x = startX;
												y = startY - heightY;
											
											}
											
											var nextY = y;
											var nextX = x;
										   
									 
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
										}
										
									}							
								}
						}
						else
						{
							var margin = x - leftCoordinateX;
									var c = getHeightForTop(angle, margin);
									
							if(sideno==1){						
									
									for(var i=0;i<5;i++){
											
																
									   if(i==0)
									   {				
											y = y - c;	
											startX = x;
											startY = y;
									   }
									   else if(i==1)
									   {						   
											y = y + c;										
									   }
									   else if(i==2)
									   {
											if(l==0)
											{
												x = x - getTotalWidth();
												y = y - sideUpFactor;
											}
											else
											{
												x = leftCoordinateX;
												y = leftCoordinateY - spacingFactor;									
											}								
									   }
									   else if(i==3)
									   {										
											x = startX;
											y = startY;	
											
									   }     									
										
										var nextY = y;
										var nextX = x;
														
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
									}                               
							}	
							else if(sideno==2){						
									
									for(var i=0;i<4;i++){
												
									   if(i==0)
									   {						   
											y = y - c ;		
											startX = x;
											startY = y;
									   }
									   else if(i==1)
									   {						   
											y = y + c ;										
									   }
									   else if(i==2)
									   {
									
												x = rightCoordinateX;
												y = rightCoordinateY - spacingFactor;		
											
									   }
									   else if(i==3)
									   {		
										
											x = startX;
											y = startY;
											labelXPoints.push(x);
											labelYPoints.push(y);
											rightCoordinateY = y;
											
											
									   }     
																			
										var nextY = y;
										var nextX = x;							   
									 
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
									}   
								}
								
							else if(sideno==3){		
							
									if(flag != 1)
									{
										var startXVal;
										var startYVal;
										for(var i=0;i<5;i++){
												
											
										   if(i==0)
										   {			
												
												startXVal = x;
												y = y - heightY;
												startYVal = y;								
										   }
										   else if(i==1)
										   {						   
												x = leftCoordinateX;
												y = leftCoordinateY;							 
										   }
										   else if(i==2)
										   {
												x = x + (startX - leftCoordinateX);  
												y = y - (startYVal - leftCoordinateY);
												
										   }
										   else if(i==3)
										   {		
												x = rightCoordinateX;
												y = rightCoordinateY;
												
										   }   
											
											else if(i==4)
											{						   
												x = startX;
												y = startY - heightY;
											
											}
											
											var nextY = y;
											var nextX = x;
										   
									 
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
										}
										
									}							
								}
						}
					return lineData;			
				} 
				
				
				
				
				function getCoordinatesForLine(x, y, height, value)
				{
					//alert(" X : " + x + " Y : " + y);
					var lineDataPoint = [];
					
						for(var m=0;m<3;m++){											
													
										   if(m==0)
										   {		
												
												x = x;	
												y = y + height/2;
										   }
										   else if(m==1)
										   {	
										   
												x = x + (0.3*outFactor)/2;										
										   }
										   else if(m==2)
										   {
												x = x + (.025*outFactor);
												y = y + (.025*outFactor);
										   }							   
											
											var nextY = y;
											var nextX = x;
															
											//alert(" X : " + x + " Y : " + y);
											//lineDataPoint.push(JSON.parse('{"x":'+x+',"y":'+y+'}'))	
											lineDataPoint.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      

						}             
							return lineDataPoint;
				}		
		
			
			},
			draw3DPyramidChartWithoutSlice:function(cfg){
			
				var jsonData = DataConverter.getValueToPercentageArray(cfg.data);
								
				var outFactorInitial = ( width < height ? width : height);
				outFactor=outFactorInitial*0.60;
				
				var spaceInPyramid = 0;
				var sortedJsonData = [];
				var heightArray = getHeightArrayForData(jsonData);
				var angle = getNewAngle();
				var sideUpFactor = 30;
				var latentHeightArray = getLatentHeightArray(angle, heightArray, 0, sideUpFactor);
				var leftCoordinateX;
				var leftCoordinateY;
				var rightCoordinateX;
				var rightCoordinateY;
				var angleIncrement = 0;
				var colorArray=cfg.colorArray;
				var lowerData2 = [ { "x": 0, "y": 400},  { "x":0,  "y": 400}, { "x": 0,  "y": 400}, { "x": 0,  "y": 400}, { "x": 0,  "y": 400}]
				
				
				var lowerData = [ { "x": 200, "y": 400},  { "x": 200,  "y": 200},
								 { "x": 55,  "y": 150}, { "x": 35,  "y": 350}, { "x": 200,  "y": 400}]		
					
				var labelXPoints = [];
				var labelYPoints = [];
				var xNew=0;
				var yNew=0;
				if(width>height){
					xNew=(width-outFactor)/2;
					yNew=(0);
				}
				else{
					xNew=0;
					yNew=(height-outFactor)/2.1;
				}
				//else{}
				var transitionFator={"x":(outFactorInitial-getWidthOfPyramid())/2,"y":(outFactorInitial-getWidthOfPyramid())/2};
				
				
				var lineFunction = d3.svg.line()
										  .x(function(d) { return d.x; })
										  .y(function(d) { return d.y; })
										 .interpolate("linear");
				
				 
				 
				var svgContainer = svgElement
											.append("g")
											.attr("transform", "translate(" + (xNew) + "," + (yNew) + ")");;

				//var transitionFator={"x":(width-getWidthOfPyramid())/2,"y":0};			
			
				var x = (outFactorInitial*.3) +(outFactorInitial *.1);
				var y = outFactorInitial;		
				var intialX = x;
				var intialY = y;
				var heightY = heightArray[0];
				
				var color20 = d3.scale.category20c();
				var newY = y;
				var prevY = 0;
			
				var spacingFactor = spaceInPyramid;
				var flag = 0;
				
				for(var k = 0 ; k < heightArray.length  ; k++)
				{				
					if(k == (heightArray.length - 1))
						flag = 1;
						
					var lineGraph = svgContainer.append("path")
											.attr("d", lineFunction(lowerData2))
											.style("opacity", 0.0)
											
											.attr('fill', function (d, i) {
												return "white";
											})
											.transition().duration(2000).ease("linear")
											.attr("d", lineFunction(getCoordinatesForPyramid(x, newY, heightArray[k], jsonData, 1, sideUpFactor, latentHeightArray, latentHeightArray[k], angle, heightArray, prevY, k, spacingFactor, flag, sortedJsonData[k])))
											
											.style("opacity", 0.7)

											.attr("stroke",	"white")
											.attr("stroke-width", 1)
											
											.attr('fill', function (d, i) {
												return colorArray[k];
												//return color20(+i + +100)
											});
											
					var lineGraph = svgContainer.append("path")
											.attr("d", lineFunction(lowerData2))
											.style("opacity", 0.0)
											.attr('fill', function (d, i) {
												return "white";
											})
											.transition().duration(1500).ease("linear")
											.attr("d", lineFunction(getCoordinatesForPyramid(x, newY, heightArray[k], jsonData, 2, sideUpFactor, latentHeightArray, latentHeightArray[k], angle, heightArray, prevY, k, spacingFactor, flag, sortedJsonData[k])))
											.attr("stroke", "white")
											.style("opacity", 0.5)
											.attr("stroke-width", 0.5)
											.attr('fill', function (d, i) {
												return colorArray[k]
												//return color20(i)
											});
					
					
						
					var lineGraph = svgContainer.append("path")
											.attr("d", lineFunction(lowerData2))
											.style("opacity", 0.0)
											.attr('fill', function (d, i) {
												return "white";
											})
											.transition().duration(1000).ease("linear")
											.attr("d", lineFunction(getCoordinatesForPyramid(x, newY, heightArray[k], jsonData, 3, sideUpFactor, latentHeightArray, latentHeightArray[k], angle, heightArray, prevY, k, spacingFactor, flag, sortedJsonData[k])))
											.style("opacity", 0.3)
											.attr("stroke", "white")
											.attr("stroke-width", 0.3)
											.attr('fill', function (d, i) {
													return colorArray[k];
											});
					
					
					
						newY = y - heightArray[k] - spaceInPyramid;
						y = newY;
						prevY = heightArray[k];
					
					}
				
				var fontSize=outFactor<200?'10px':'12px';
				
				for(var j = 0; j < labelXPoints.length ; j++)
				{
					
					svgContainer.append("path")
											.attr("x", outFactor)
											.attr("y", outFactor)										
											.transition().delay( function(d, i){return 600 *j}).ease("bounce")
											.attr("d", lineFunction(getCoordinatesForLine(labelXPoints[j], labelYPoints[j], heightArray[j], sortedJsonData[j])))
											.attr("stroke", function (d, i) {
													return colorArray[j];
											})
											.attr("stroke-width", 1)
											.attr('fill',"none");			
											
					svgContainer.append("text")						
											.attr("x", outFactor)
											.attr("y", outFactor)
											.transition().delay( function(d, i){return 600 *j}).ease("bounce")
											.attr("x", labelXPoints[j] + 0.15* outFactor+(j*3))
											.attr("y", labelYPoints[j] + (0.1*outFactor) + heightArray[j]/2-(j*3))
											.text( cfg.labels[j]+":" + cfg.data[j]+" "+cfg.unit)										
											.attr("font-family", "sans-serif")
											.attr("font-size", fontSize)
											.attr("fill", colorArray[j]);
				}
				
				function getWidthOfPyramid(){
					return ((0.6 * outFactor)*2);
				}
				
				function getNewAngle()
				{
					var degrees = Math.atan( (outFactor / (0.6 * outFactor)) ) * 180/Math.PI;
					return degrees ;			
				}			
						
				//working
				function sortNumber(data) 
				{
					//alert(data);
					var heightArr = [];
					var num = data.sort(function (a, b) {
						return parseInt(a) < parseInt(b);
					})			
					return heightArr;
				}
				
				//working
				function getArraySum(arrayVal)
				{	
					var sum = 0 ;
					for(var j = 0 ; j < arrayVal.length ; j++)
					{
						sum = sum + arrayVal[j];				
					}
					return sum;				
				}
						
				//working
				function getHeightArrayForData(jsonData)
				{								
					var totalHeight = outFactor;
					var heightArrayValue = [];
					for(var j = 0 ; j < jsonData.length ; j++)
					{
						heightArrayValue.push(totalHeight*jsonData[j]/100); 
						sortedJsonData.push(jsonData[j]);
					}
					sortedJsonData.sort(function (a, b) {
						return parseInt(a) < parseInt(b);
					});
					heightArrayValue.sort(function (a, b) {
						return parseInt(a) < parseInt(b);
					});
					
					
					return heightArrayValue;
							
				}
				
				//working
				function getTotalWidth()
				{
					return outFactor * 0.6 ;
				}			
				
				function getLatentHeightArray(angle, heightArrayVal, prevY1, sideUpFactor)
				{

					
					var totalLatentHeight = getArraySum(heightArrayVal) / (Math.sin(angle * (Math.PI / 180.0))) ;
								
					var latentHeightArray = [];
					
					for( var j = 0 ; j < heightArrayVal.length ; j++)
					{
						latentHeightArray.push(totalLatentHeight * heightArrayVal[j] / totalLatentHeight - 
														sideUpFactor * heightArrayVal[j] / totalLatentHeight);					
					}				
	//				
					
					return latentHeightArray;						
				}		
				
				
				
				
				function getYForFourthCoordinate(latentHeight, angle, prevY, heightY)
				{
					//alert(angle);
					var x = (latentHeight * (Math.cos(angle * (Math.PI / 180))));				
					return x;
				}		
				
				function getAngleAfterApplyingSideUp(sideUpFactor, heightArray, latentHeightArray)
				{
					var heightArraySum = getArraySum(heightArray);
					
					var latentHeightArraySum = getArraySum(latentHeightArray);	
								
					var radians = Math.sin(heightArraySum / (latentHeightArraySum - sideUpFactor));
					
					
					var angle = radians * 180/ Math.PI;
					
					return angle ;	
				}			
				
				function getHeightForTop(angle, bottomWidth)
				{	
					console.log("  Angle : " + angle + " bottomWidth : " + bottomWidth);
					var radians = angle * (Math.PI / 180);
					var h =  Math.tan(radians) * bottomWidth;
					return h;
				
				}
				
				function getCoordinatesForPyramid(x, y, heightY, jsonData, sideno, sideUpFactor, latentHeightArray, latentHeight, angle, heightArray, prevY, l, spacingFactor, flag, value)
				{
					
					var startX = x;
					var startY = y;			
					var lineData = [];						
					
						if(flag != 1)
						{
							if(sideno==1){						
									
									for(var i=0;i<5;i++){
											
																
									   if(i==0)
									   {						   
											y = y - heightY ;																		
									   }
									   else if(i==1)
									   {						   
											y = y + heightY ;										
									   }
									   else if(i==2)
									   {
											if(l==0)
											{
												x = x - getTotalWidth();
												y = y - sideUpFactor;
											}
											else
											{
												x = leftCoordinateX;
												y = leftCoordinateY - spacingFactor;									
											}								
									   }
									   else if(i==3)
									   {		
									
											//x = x + latentHeight;
											//y = y -  getYForFourthCoordinate(latentHeight, getAngleAfterApplyingSideUp(sideUpFactor, heightArray, latentHeightArray), prevY);
											
											//y = y - latentHeight ;
												x = x + getYForFourthCoordinate(latentHeight, getAngleAfterApplyingSideUp(sideUpFactor, heightArray, latentHeightArray) + angleIncrement, prevY, heightY) ;
												y = y - latentHeight ;
												leftCoordinateX = x;
												leftCoordinateY = y;
											
											
									   }     
										else if(i==4)
									   {						   
											x = startX;
											y = startY - heightY;								
									   }
										
										var nextY = y;
										var nextX = x;
														
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
									}                               
							}	
							else if(sideno==2){						
									
									for(var i=0;i<5;i++){
												
									   if(i==0)
									   {						   
											y = y - heightY;	
											
									   }
									   else if(i==1)
									   {						   
											y = y + heightY ;
											
									   }
									   else if(i==2)
									   {
									
											if(l==0)
											{
												
												x = x + getTotalWidth();
												y = y - sideUpFactor;
												
											}
											else
											{
												x = rightCoordinateX;
												y = rightCoordinateY - spacingFactor;
											}
											
											
									   }
									   else if(i==3)
									   {		
										
											
											x = x - getYForFourthCoordinate(latentHeight, getAngleAfterApplyingSideUp(sideUpFactor, heightArray, latentHeightArray) + angleIncrement, prevY, heightY);
											
											y = y - latentHeight;
											
											labelXPoints.push(x);
											labelYPoints.push(y);
											
											rightCoordinateX = x;
											rightCoordinateY = y;
											
									   }     
										else if(i==4)
									   {						   
											x = startX;
											y = startY - heightY;
											
									   }
										
										var nextY = y;
										var nextX = x;							   
									 
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
									}   
								}
								
							else if(sideno==3){		
							
									if(flag != 1)
									{
										var startXVal;
										var startYVal;
										for(var i=0;i<5;i++){
												
											
										   if(i==0)
										   {			
												startXVal = x;
												y = y - heightY;
												startYVal = y;								
										   }
										   else if(i==1)
										   {						   
												x = leftCoordinateX;
												y = leftCoordinateY;							 
										   }
										   else if(i==2)
										   {
												x = x + (startX - leftCoordinateX);  
												y = y - (startYVal - leftCoordinateY);
												
										   }
										   else if(i==3)
										   {		
												x = rightCoordinateX;
												y = rightCoordinateY;
												
										   }   
											
											else if(i==4)
											{						   
												x = startX;
												y = startY - heightY;
											
											}
											
											var nextY = y;
											var nextX = x;
										   
									 
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
										}
										
									}							
								}
						}
						else
						{
							var margin = x - leftCoordinateX;
									var c = getHeightForTop(angle, margin);
									
							if(sideno==1){						
									
									for(var i=0;i<5;i++){
											
																
									   if(i==0)
									   {				
											y = y - c;	
											startX = x;
											startY = y;
									   }
									   else if(i==1)
									   {						   
											y = y + c;										
									   }
									   else if(i==2)
									   {
											if(l==0)
											{
												x = x - getTotalWidth();
												y = y - sideUpFactor;
											}
											else
											{
												x = leftCoordinateX;
												y = leftCoordinateY - spacingFactor;									
											}								
									   }
									   else if(i==3)
									   {										
											x = startX;
											y = startY;	
											
									   }     									
										
										var nextY = y;
										var nextX = x;
														
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
									}                               
							}	
							else if(sideno==2){						
									
									for(var i=0;i<4;i++){
												
									   if(i==0)
									   {						   
											y = y - c ;		
											startX = x;
											startY = y;
									   }
									   else if(i==1)
									   {						   
											y = y + c ;										
									   }
									   else if(i==2)
									   {
									
												x = rightCoordinateX;
												y = rightCoordinateY - spacingFactor;		
											
									   }
									   else if(i==3)
									   {		
										
											x = startX;
											y = startY;
											labelXPoints.push(x);
											labelYPoints.push(y);
											rightCoordinateY = y;
											
											
									   }     
																			
										var nextY = y;
										var nextX = x;							   
									 
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
									}   
								}
								
							else if(sideno==3){		
							
									if(flag != 1)
									{
										var startXVal;
										var startYVal;
										for(var i=0;i<5;i++){
												
											
										   if(i==0)
										   {			
												
												startXVal = x;
												y = y - heightY;
												startYVal = y;								
										   }
										   else if(i==1)
										   {						   
												x = leftCoordinateX;
												y = leftCoordinateY;							 
										   }
										   else if(i==2)
										   {
												x = x + (startX - leftCoordinateX);  
												y = y - (startYVal - leftCoordinateY);
												
										   }
										   else if(i==3)
										   {		
												x = rightCoordinateX;
												y = rightCoordinateY;
												
										   }   
											
											else if(i==4)
											{						   
												x = startX;
												y = startY - heightY;
											
											}
											
											var nextY = y;
											var nextX = x;
										   
									 
										lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      
										}
										
									}							
								}
						}
					return lineData;			
				} 
				
				
				
				
				function getCoordinatesForLine(x, y, height, value)
				{
					//alert(" X : " + x + " Y : " + y);
					var lineDataPoint = [];
					
						for(var m=0;m<3;m++){											
													
										   if(m==0)
										   {		
												
												x = x;	
												y = y + height/2;
										   }
										   else if(m==1)
										   {	
										   
												x = x + (0.3*outFactor)/2;										
										   }
										   else if(m==2)
										   {
												x = x + (.025*outFactor);
												y = y + (.025*outFactor);
										   }							   
											
											var nextY = y;
											var nextX = x;
															
											//alert(" X : " + x + " Y : " + y);
											//lineDataPoint.push(JSON.parse('{"x":'+x+',"y":'+y+'}'))	
											lineDataPoint.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+ ',"value":'+value+'}'));                      

						}             
							return lineDataPoint;
				}					
			}	
		}

		function sortNumber(data) {
                var num = data.sort(function (a, b) {
                    return parseInt(a) < parseInt(b);
                })
                return num;
            }

            function getX(angle, height, widthX, prevX1) {
                var radians = angle * (Math.PI / 180);
                var x = (height / (Math.tan(radians))) + prevX1;
                return x;
            }

            function getY(angle, height) {
                var radians = angle * (Math.PI / 180);
                var val = (height / (Math.tan(radians)));
                return val;
            }

            function getCoordinatesFromPercent(data) {

                var widthFactorX = 50;
                var heightFactorY = 50;
                var spacingFactor = 2;

                var angle = 60;

                var widthX = (200) / 1.73;
                var heightY = data.length * heightFactorY;

                var currX1 = 0;
                var currX2 = 0;
                var currY1 = 0;
                var currY2 = 0;
                var prevX1 = 0;
                var prevY1 = 0;
                var prevX2 = 0;
                var prevY2 = 0;

                var polygon = {};
                var arrayOfPolygons = [];
                polygon.arrayOfPolygons = arrayOfPolygons;

                for (i = 1; i <= data.length; i++) {

                    var x;
                    var y;
                    var points = {};
                    var coordinates = [];
                    points.coordinates = coordinates;

                    for (j = 0; j < 4; j++) {

                        if (j == 0) {
                            x = getX(angle, data[i - 1], widthX, prevX1);
                            if (i == 1) {
                                y = getY(60, data[i - 1]);
                            } else {
                                y = +prevY1 + getY(angle, data[i - 1]);
                            }
                            currX1 = x;
                            currY1 = y + spacingFactor;

                        } else if (j == 1) {

                            x = x + (widthX - 2 * x);
                            if (i == 1) {
                                y = getY(60, data[i - 1]);
                            } else {
                                y = +prevY2 + getY(angle, data[i - 1]);
                            }
                            currX2 = x;
                            currY2 = y + spacingFactor;

                        } else if (j == 2) {
                            if (i == 1) {
                                x = widthX;
                                y = 0;
                            } else {
                                x = prevX2;
                                y = prevY2;
                            }

                        } else {
                            if (i == 1) {
                                x = 0;
                                y = 0;
                            } else {
                                x = prevX1;
                                y = prevY1;
                            }
                        }

                        var coordinate = {
                            "x": x,
                                "y": y
                        };

                        points.coordinates.push(coordinate)
                    }

                    prevX1 = currX1;
                    prevY1 = currY1;
                    prevX2 = currX2;
                    prevY2 = currY2;

                    var coordinateArray = {
                        "name": "Polygon-" + i,
                            "Percent": data[i - 1],
                            "points": points.coordinates
                    }
                    polygon.arrayOfPolygons.push(coordinateArray);
                }
                return polygon;
            }

        var radarChart = {
            drawRadarChart: function (id, d, options) {


                var curFactor = width > height ? height : width;
                var driftingFactorX = width * .10;
                var driftingFactorY = height * .10;
                var difting = 0;
                if (width > height) {
                    driftingFactorX = Math.round(width - height) / 2;
                    difting = driftingFactorX;
                } else {
                    driftingFactorY = Math.round(height - width) / 2;
                    difting = driftingFactorY;
                }

                var cfg = {
                    radius: 10,
                    w: curFactor - difting,
                    h: curFactor - difting,
                    factor: 1,
                    factorLegend: .85,
                    levels: 3,
                    maxValue: 0,
                    radians: 2 * Math.PI,
                    opacityArea: 0,
                    ToRight: 5,
                    TranslateX: driftingFactorX,
                    TranslateY: driftingFactorY,

                    ExtraWidthX: 100,
                    ExtraWidthY: 100,
                    color: d3.scale.category20()
                };

                if ('undefined' !== typeof options) {
                    for (var i in options) {
                        if ('undefined' !== typeof options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }
                cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function (i) {
                    return d3.max(i.map(function (o) {
                        return o.value;
                    }))
                }));
                var allAxis = (d[0].map(function (i, j) {
                    return i.axis
                }));
                var total = allAxis.length;
                var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
                var Format = d3.format('');


                var g = svgElement.append("svg:g")

                    .attr("width", cfg.w + cfg.ExtraWidthX)
                    .attr("height", cfg.h + cfg.ExtraWidthY)
                    .append("g")
                    .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");;

                var tooltip;



                for (var j = 0; j < cfg.levels; j++) {
                    var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
                    g.selectAll(".levels")
                        .data(allAxis)
                        .enter()
                        .append("svg:line")
                        .attr("x1", function (d, i) {
                        return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
                    })
                        .attr("y1", function (d, i) {
                        return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
                    })
                        .attr("x2", function (d, i) {
                        return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
                    })
                        .attr("y2", function (d, i) {
                        return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
                    })
                        .attr("class", "line")
                        .style("stroke", "grey")
                        .style("stroke-opacity", "3.75")
                        .style("stroke-width", "0.5px")
                        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
                }


                for (var j = 0; j < cfg.levels; j++) {

                    var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
                    g.selectAll(".levels")
                        .data([0])
                        .enter()
                        .append("svg:text")
                        .attr("x", function (d) {
                        return levelFactor * (1 - cfg.factor * Math.sin(0));
                    })
                        .attr("y", function (d) {
                        return levelFactor * (1 - cfg.factor * Math.cos(0));
                    })
                        .attr("class", "legend")
                        .style("font-family", "sans-serif")
                        .style("font-size", "12px")
                        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")")
                        .attr("fill", "#737373")
                        .text(Format((j + 1) * cfg.maxValue / cfg.levels));
                }

                series = 0;

                var axis = g.selectAll(".axis")
                    .data(allAxis)
                    .enter()
                    .append("g")
                    .attr("class", "axis");

                axis.append("line")
                    .attr("x1", cfg.w / 2)
                    .attr("y1", cfg.h / 2)
                    .attr("x2", function (d, i) {
                    return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
                })
                    .attr("y2", function (d, i) {
                    return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
                })
                    .attr("class", "line")
                    .style("stroke", "grey")
                    .style("stroke-width", "1px");

                axis.append("text")
                    .attr("class", "legend")
                    .text(function (d) {
                    return d
                })
                    .style("font-family", "sans-serif")
                    .style("font-size", "11px")
                    .attr("text-anchor", "middle")
                    .attr("dy", "1.5em")
                    .attr("transform", function (d, i) {
                    return "translate(0, -10)"
                })
                    .attr("x", function (d, i) {
                    return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total);
                })
                    .attr("y", function (d, i) {
                    return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total);
                });


                d.forEach(function (y, x) {
                    dataValues = [];
                    g.selectAll(".nodes")
                        .data(y, function (j, i) {
                        dataValues.push([
                        cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
                        cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))]);
                    });
                    dataValues.push(dataValues[0]);
                    g.selectAll(".area")
                        .data([dataValues])
                        .enter()
                        .append("polygon")
                        .attr("class", "radar-chart-serie" + series)
                        .style("stroke-width", "2px")
                        .style("stroke", cfg.color(series))
                        .attr("points", function (d) {
                        var str = "";
                        for (var pti = 0; pti < d.length; pti++) {
                            str = str + d[pti][0] + "," + d[pti][1] + " ";
                        }
                        return str;
                    })
                        .style("fill", function (j, i) {
                        return cfg.color(series)
                    })
                        .style("fill-opacity", cfg.opacityArea)
                        .on('mouseover', function (d) {
                        z = "polygon." + d3.select(this).attr("class");
                        g.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", 0.1);
                        g.selectAll(z)
                            .transition(200)
                            .style("fill-opacity", 0.9);
                    })
                        .on('mouseout', function () {
                        g.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", cfg.opacityArea);
                    });
                    series++;
                });
                series = 0;


                d.forEach(function (y, x) {
                    g.selectAll(".nodes")
                        .data(y).enter()
                        .append("svg:circle")
                        .attr("class", "radar-chart-serie" + series)
                        .attr('r', cfg.radius)
                        .attr("alt", function (j) {
                        return Math.max(j.value, 0)
                    })
                        .attr("cx", function (j, i) {
                        dataValues.push([
                        cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
                        cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))]);
                        return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total));
                    })
                        .attr("cy", function (j, i) {
                        return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total));
                    })
                        .attr("data-id", function (j) {
                        return j.axis
                    })
                        .style("fill", cfg.color(series)).style("fill-opacity", 1.9)
                        .on('mouseover', function (d) {
                        newX = parseFloat(d3.select(this).attr('cx')) - 10;
                        newY = parseFloat(d3.select(this).attr('cy')) - 5;

                        tooltip.attr('x', newX)
                            .attr('y', newY)
                            .text(Format(d.value))
                            .transition(100)
                            .style('opacity', 1);

                        z = "polygon." + d3.select(this).attr("class");
                        g.selectAll("polygon")
                            .transition(100)
                            .style("fill-opacity", 0.1);
                        g.selectAll(z)
                            .transition(200)
                            .style("fill-opacity", .7);
                    })
                        .on('mouseout', function () {
                        tooltip.transition(200)
                            .style('opacity', 0);
                        g.selectAll("polygon")
                            .transition(200)
                            .style("fill-opacity", cfg.opacityArea);
                    })
                        .append("svg:title")
                        .text(function (j) {
                        return Math.max(j.value, 0)
                    });

                    series++;
                });

                tooltip = g.append('text')
                    .style('opacity', 0)
                    .style('font-family', 'sans-serif')
                    .style('font-size', '13px');
            }
        };
		
		var combinationalChart={
			drawCombinationalChart:function(combinationalChartData){
			
			var divId=selectedElementId;
			var data=combinationalChartData;
			
			var width =parseInt(d3.select("#"+divId).style("width"));
			var height=parseInt(d3.select("#"+divId).style("height")); 
			var textSizeOfAxis,symbolSize,circleRadius,rectangleSize,legendSize;
			if(width<401)
			{
				textSizeOfAxis=8;
			}
			else if(width<601)
			{
				textSizeOfAxis =10;
			}
			else
			{
				textSizeOfAxis =13;
			}
			 
			if(height<301)
			{
				symbolSize = 10;
				circleRadius = 3; 
				rectangleSize = 5
				legendSize = 7;
			}
			else
			{
				symbolSize = 18;
				circleRadius = 5; 
				rectangleSize = 8
				legendSize = 12;
			}		
			
		  var margin = {top: height*.10, right: width*.10, bottom: height*.12, left: width*.10};
		  var scaleWidth = width - margin.left - margin.right;
		  var scaleHeight = height - margin.top - margin.bottom;
		  var divSelection = d3.select("#"+divId);
		  var i=0,maxGDP,minGDP,lineIndex,radius,innerRadius,selectedYear=data.xAxisData[0];
		  var grad = Math.PI/180;
		  var clickedYear = [data.PieData.Data1[0],data.PieData.Data2[0]];
		
		
		var xAxisTimeIndex = [];
		for(var counter = 0;counter<data.xAxisData.length ;counter++)
		{
			xAxisTimeIndex[counter] = counter;
		}
		
		//setmin and max data factor
		setMinMaxDataFactor();
			
		var scaleX = d3.scale.linear()
							.domain([0,data.xAxisData.length])
							.range([0,scaleWidth]); 
		
		var scaleOfCountry = d3.scale.linear()
							.domain([minGDP,maxGDP*2])
							.range([scaleHeight,0]); 

		  var divSelection = d3.select("#"+divId);
		  var checkSVGCicked =0;
		  var svgSelection = svgElement;
		
		//show grid view
		gridManager(svgSelection, scaleHeight, scaleWidth, margin.left, margin.top);
		
		var combinationalGroup = svgSelection.append("g")
						   .attr('id','combinationalGroup')
						   .attr("transform", "translate(" +margin.left + "," +margin.top + ")")
						   /*
							  .on("mouseover", function() {
									
									//d3.select("#toolTipChart").css("display","block");
									
									drawLine.style("visibility", "visible");tooltip.style("visibility", "visible");  
									mouseOverOnLine(d3.event);
								})
						 .on("mouseout",  function(){drawLine.style("visibility", "hidden");tooltip.style("visibility", "hidden"); })
						 */
						//.on("mousemove", mouseOverOnLine);

		radius = margin.top;
		innerRadius = radius - radius*.6;
		var arc = d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(radius);

				
		// show dount chart with revenue												 

		showDountChart();

		showLegend();				   
		showClickedSymbol();
		
		//title lable here
		axisLabelController.appendLabel(data.title,margin.left,-margin.top/3,0,combinationalGroup,textStyleConfg.titleColor,700);
		
		//xAxis label here
		var pixcelPerChar = 6;
		var totalXLabelPixcel=data.xAxisLabel.toString().length*pixcelPerChar;
		var xIndicationLabelTop=scaleHeight+(scaleHeight*0.12);
		var xIndicationLabelLeft=scaleWidth/2-totalXLabelPixcel/2;    
		axisLabelController.appendLabel(data.xAxisLabel,xIndicationLabelLeft,xIndicationLabelTop,0,combinationalGroup,textStyleConfg.xLabelColor,600);

		//yAxis label here
		
		var totalYLabelPixcel=data.yLabel.toString().length*pixcelPerChar;
		var yIndicationLabelTop=scaleHeight/2+totalYLabelPixcel/2;        
		var yIndicationLabelLeft=(-margin.left/2);
		axisLabelController.appendLabel(data.yLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,combinationalGroup,textStyleConfg.yLabelColor,600);
		
		
		var tooltip = d3.select("body")
			.append("div")
			.style('background','rgba(0,0,0,.6)')
			.style("position", "absolute")
			//.style("z-index", -1)
			.style("visibility", "hidden")
			.style("font-family",'calibri')
			.style("font-style",'normal')
			.style("color",'white')
			.style('padding','5px')
			.text("a simple tooltip")
			.style("display","none");
		
			
		var message =  d3.select("body").attr('id','outerDiv')
			.append("div")
			.style('width',200)
			.style('background','#1f77b4')
			.style("position", "absolute")
			.style("visibility", "hidden")
			.style("font-family",'calibri')
			.style("font-style",'normal')
			.style("padding",'2px')
			.style('box-shadow','0 0 10px #ccc')
			.style("color",'white')
			.style("font-size",15)
			.text("NEWS");
		message.append('img').attr('id','closeButton')
		.style('float','right')
		.style('margin-top','-10px')
		.style('margin-right','-10px')							
		.attr("src",'./img/cross.png').on('click',function(){message.style("visibility",'hidden')});	
		message.append('div').attr('id','innerDiv').style('padding','5px 10px 5px 10px').style("font-size",12).style("color",'black').style('background',"#fff").text('inner box');	
		//show data of line1 and line2
		   showLineData();

		var largestStringLngth=0;
			for(var counter =0 ;counter<data.xAxisData.length;counter++)
			{
				if(largestStringLngth<(data.xAxisData[counter].toString()).length)
				{
					largestStringLngth = (data.xAxisData[counter].toString()).length;
				}
			}
			   
		var xAxis = d3.svg.axis()
				.scale(scaleX)
				.orient("bottom")
				.tickValues(tickController.getXTickArray(0,(data.xAxisData.length),largestStringLngth, (scaleWidth)));		
		// svgSelection.selectAll('path').attr('fill','none');
		var xAxisTextRef =combinationalGroup.append("g")
							.attr('id','xAxis')
							.attr("class", "xAxis")
							.attr('fill','none')
						//	.attr('font-size',textSizeOfAxis)
							.attr("transform", "translate("+0+"," + (scaleHeight) + ")")
							.call(xAxis);					
			
		xAxisTextRef.selectAll('text')
					 .text(function(d){return data.xAxisData[d];})
				//	 .style('font-size',fontSize)
					 .attr('font-family','calibri')
					 .attr('fill','black');

		var yAxis = d3.svg.axis()
				.scale(scaleOfCountry)
				.orient("left")
				.tickValues(tickController.getTickArray(minGDP,maxGDP*2,10));
		   // svgSelection.selectAll('path').attr('fill','none');
			combinationalGroup.append("g")
						 .attr('id','yAxis')
									 .attr("class","yAxis")
									//.attr('fill',"none")
									 .attr('font-size',textSizeOfAxis)
									 .attr("transform", "translate( "+ 0 +" , "+ 0 +")")
									 .call(yAxis);	

		d3.select('.yAxis path').attr('fill','none');							 

		//show simple vertical line							 
		var lineArray = [];
		var simpleLine = d3.svg.line()
							   .x(function(d) { return lineArray[lineIndex++]; })
							   .y(function(d) { return lineArray[lineIndex++]; });	
		var drawLine = svgSelection.append("path")
				//  .style("display", "none")
				  .data([lineArray])
				  .attr("stroke", "gray")
				  .attr("stroke-width", 1)
				  .attr("fill", "none");
		
		//hide all axis path
			hideAxisPath(svgElement);
					
		//set font here
					
		setTextStyleAndSvgBackGround(svgElement);	
					  
		function showLineData()
		{
			var lineFunctionCountry1 = d3.svg.line()
								 .x(function(d,i) {return scaleX(xAxisTimeIndex[i]); })
								 .y(function(d,i) 
								 {	
											return scaleOfCountry(data.dataOfLine1[i]); 
								 })                         
								// .interpolate("cardinal");

		var lineGraphCountry1 = combinationalGroup.selectAll(".path")
							 .data([data.xAxisData])
							 .enter()
							 .append("path")
							 .attr("d", lineFunctionCountry1)	  
							 .attr("stroke",function(){return data.color[0]})
							 .attr("stroke-width", 3)
							 .attr("fill", "none");
											 
		combinationalGroup.selectAll('rect')
						 .data(data.xAxisData)
		  .enter()
		  .append("rect")
		  .attr("class","country1")
		   .attr('value',function(d,i){return i})
		  .attr("fill",function(d,i) { if(data.dataOfLine1[i]<0){return 'red'}else{return data.color[0]}})
		  .attr("x", function(d, i){return scaleX(xAxisTimeIndex[i])-rectangleSize/2;})
		  .attr("y",function(d,i) { return scaleOfCountry(data.dataOfLine1[i])-rectangleSize/2;})
		  .attr("width",function(d,i){if(data.dataOfLine1[i]<0){return rectangleSize +1 }else{return rectangleSize}} )
		  .attr("height",function(d,i){if(data.dataOfLine1[i]<0){return rectangleSize+1} else{return rectangleSize}} )
			.on("mouseover", function(d) {
									
				drawLine.style("visibility", "visible");tooltip.style("visibility", "visible").style("display","none");  
				mouseOverOnLine(d3.event,d3.select(this).attr('value'));
			})
			.on("mouseout",  function(){drawLine.style("visibility", "hidden");tooltip.style("visibility", "hidden"); 
				toolTipManager.hideTooTip();
			});
				 
							 
		var lineFunctionCountry2 = d3.svg.line()
								 .x(function(d,i) { console.log("years="+data.xAxisData[i]); return scaleX(xAxisTimeIndex[i]); })
								 .y(function(d,i) { console.log("dataOfLine2"+data.dataOfLine2[i]); return scaleOfCountry(data.dataOfLine2[i]); })                         
								 .interpolate("cardinal");

		var lineGraphCountry2 = combinationalGroup.selectAll(".path")
							 .data([data.xAxisData])
							 .enter()
							 .append("path")
							 .attr("d", lineFunctionCountry2)	  
							 .attr("stroke",data.color[1])
							 .attr("stroke-width", 3)
							 .attr("fill", "none");							 
									 
		combinationalGroup.selectAll('circle')
						 .data(data.xAxisData)
		  .enter()
		  .append("circle")
		  .attr("class","country2")
		  .attr('value',function(d,i){return i})
		  .attr("fill",function(d,i) {  if(data.dataOfLine2[i]<0){return 'red'}else{return data.color[1]}})
		  .attr("cx", function(d, i){return scaleX(xAxisTimeIndex[i]);})
		  .attr("cy",function(d,i) { return scaleOfCountry(data.dataOfLine2[i]);})
		  .attr('r',function(d,i){if(data.dataOfLine2[i]<0){return circleRadius+1}else{return circleRadius}})
		  .on("mouseover", function(d) {
									
				drawLine.style("visibility", "visible");tooltip.style("visibility", "visible").style("display","none");  
				mouseOverOnLine(d3.event,d3.select(this).attr('value'));
			})
			.on("mouseout",  function(){drawLine.style("visibility", "hidden");tooltip.style("visibility", "hidden"); 
				toolTipManager.hideTooTip();
			});

		}			  
		function mouseOverOnLine(event,dataIndex) 
			{
			
			//	alert(dataIndex);
				lineIndex=0;	
		
						selectedYear = data.xAxisData[dataIndex];
		
				getToolTip(dataIndex,event);
				clickedYear = [data.PieData.Data1[dataIndex],data.PieData.Data2[dataIndex]];
				showDountChart();
		  }   
			
		function getToolTip(keyName,event)
		{
		//	alert(keyName);
			var text;	
			if(data.dataOfLine1[keyName]>data.dataOfLine2[keyName])
			{
				text = data.xAxisData[keyName]+"=>"+data.labelLine1+" "+data.yLabel+" "+data.dataOfLine1[keyName]+"<br>"+data.xAxisData[keyName]+"=>"+data.labelLine2+" "+data.yLabel+" "+data.dataOfLine2[keyName];
			}
			else
			{
				text = data.xAxisData[keyName]+"=>"+data.labelLine2+" "+data.yLabel+" "+data.dataOfLine2[keyName]+"<br>"+data.xAxisData[keyName]+"=>"+data.labelLine1+" "+data.yLabel+" "+data.dataOfLine1[keyName];
			}
//			event.pageY=event.pageY-10;
//			event.pageX=event.pageX+10;
var yHeadingValueMap=[{"headingName":(data.labelLine2+" "+data.yLabel) ,"headingVal":data.dataOfLine2[keyName]},{"headingName":(data.labelLine1+" "+data.yLabel) ,"headingVal":data.dataOfLine1[keyName]}];
						
toolTipManager.showToolTip(event,"",(data.xAxisData[keyName]), false,yHeadingValueMap);
			
			/*	
			tooltip.style("z-index", 1)
				   .style("top", (event.pageY-10)+"px")
				   .style("left",(event.pageX+10)+"px")
				   .html(text);
			*/
				
		}

		function showDountChart()
		{
		d3.select("#dountGroup")
			   .remove();
			   
			var dountGroup = combinationalGroup.append("g")
						   .attr('id','dountGroup')
						   .attr("transform", "translate(" +margin.left + "," +(margin.top) + ")");
			
		 var pie = d3.layout.pie()
							.sort(null)
							.value(function(d) {if(d<0){return 0}else{return d};});
			var arcs = dountGroup.selectAll(".arc")
						.data(pie(clickedYear))
						.enter()
						.append("g")
						.attr('value',function(d,i){if(i==0){return data.labelLine1;}else{return data.labelLine2;}})
						.attr("fill",function(d,i) {return data.color[i];} )
						.on("mouseover", function(){d3.select(this).transition().duration(500).ease('bounce')
									  .attr('transform', function (d) 
									 {
										var dist = 8;
										d.midAngle = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
										var x = Math.sin(d.midAngle) * dist;
										var y = -Math.cos(d.midAngle) * dist;
										return 'translate(' + x + ',' + y + ')';
									 }) ; return tooltip.style("visibility", "visible");})
						.on("mousemove", function(){ getToolTipForDount(d3.select(this).attr('value'));	})
						.on("mouseout", function(){	d3.select(this).transition().duration(500).ease('bounce')
											  .attr('transform', 'translate(0,0)')
									return tooltip.style("visibility", "hidden");});
					
		arcs.append("path")
			.attr("d",arc).transition().duration(1500).attrTween("d", sweep);

		}
			
		function sweep(d) {
			   var i = d3.interpolate({startAngle: -180*grad, endAngle: -180*grad},d);
			 return function (call) {
			  //console.log(call);
			  return arc(i(call));
			 };
			}
		function setMinMaxDataFactor()
		{

		if(d3.min(data.dataOfLine1)<d3.min(data.dataOfLine2))
		{
			minGDP = d3.min(data.dataOfLine1);
		}
		else
		{
			minGDP = d3.min(data.dataOfLine2);
		}		
		if(d3.max(data.dataOfLine1)>d3.max(data.dataOfLine2))
		{
			maxGDP = d3.max(data.dataOfLine1);
		}
		else
		{
			maxGDP = d3.max(data.dataOfLine2);
		}			
		}	

		function showLegend()
		{
			var legendGroup = svgSelection.append("g")
										  .attr('id','legendGroup')					
										  .attr("transform", "translate(" +(2*margin.left+radius*1.5)+ "," + (2*margin.top-legendSize)+ ")");
		legendGroup.selectAll('rect')
		  .data(data.color)
		  .enter()
		  .append("rect")
		  .attr("class","legend")
		  .attr("fill",function(d,i) { return data.color[i];})
		  .attr("y",function(d,i) { return i*2*legendSize  })
		  .attr("width", legendSize)
		  .attr("height",legendSize);
		legendGroup.selectAll('text')
				   .data(data.color)
				   .enter()
				   .append('text')
				 //  .attr('x',function(d, i){ return ((i*(width*.20))+20);})
				   .attr("x", function(d, i){ return legendSize+3})
				   .attr("y",function(d,i) {  if(i==0){return legendSize}else { return 3*legendSize}}   )
				   .style('font-size',12)
				   .style('font-family','calibri')
				   .style('font-style','italic')
				 //  .attr('y',10)
				   .text(function(d,i) { if(i==0){return data.labelLine1+" "+data.yLabel;}else{return data.labelLine2+" "+data.yLabel;} });
		}
		function getToolTipForDount(keyName)
		{
			var text;
			if(keyName==data.labelLine1)
			{
				text = selectedYear+"=>"+data.labelLine1+" "+data.pieDataFactor+" "+clickedYear[0];
			}
			else
			{
					text = selectedYear+"=>"+data.labelLine2+" "+data.pieDataFactor+" "+clickedYear[1];
			}
							tooltip.style("z-index", 1)
								   .style("top", (event.pageY-10)+"px")
								   .style("left",(event.pageX+10)+"px")
								   .text(text);
		}

		function showClickedSymbol()
		{	
			var clickedSymbolGroup = combinationalGroup.append("g")
						   .attr('id','clickedSymbolGroup')
						   .attr("transform", "translate(" + 0 + "," +0 + ")");
			
			var index;
			var GDP1,GDP2,finalData;
			var clickedArray=[];
			for(key in data.clickedInfo)
			{
				clickedArray.push(data.xAxisData.indexOf(parseInt(key)));
			}
						clickedSymbolGroup.selectAll('img')
										  .data(clickedArray)
										  .enter()
										  .append("image")
										  .attr("value",function(d,i){ return data.xAxisData[d]})
										  .attr('x',function(d,i){return scaleX(d)-(symbolSize/2);})
										  .attr('y',function(d,i)
										  {
												
												index = getIndex(data.xAxisData[d]);
												GDP1 = data.dataOfLine1[index];
												GDP2 = data.dataOfLine2[index];
												if(GDP1>GDP2)
												{
													finalData = GDP1;
												}
												else
												{
													finalData = GDP2;
												}
												var countSymbolOnSameYear=0;
												
												for(var counter=i;counter>=0;counter--)
												{
													if(clickedArray[counter]==clickedArray[i])
													{
														++countSymbolOnSameYear;
													}	
												}
												
												return scaleOfCountry(finalData)- ((symbolSize*1.5)*countSymbolOnSameYear);
												})
										  .attr('width',symbolSize)
										  .attr('height',symbolSize)
										  .attr("xlink:href",data.clickedSybmol)
										  .on("click",function() {onClickSymbol(d3.select(this).attr('value'))});

						
				}
				function getIndex(keyName)
				{
					
					for(var counter=0;counter<data.xAxisData.length;counter++)
					{
						if(data.xAxisData[counter]==keyName)
						{
							//alert(counter);
							break;
						}
					}
					return counter;
				}
				
				function onClickSymbol(keyName)
				{
					d3.select('#innerDiv').text(data.clickedInfo[keyName]);
					message.style("visibility", "visible");
					message.style("top", (event.pageY-10)+"px")
										   .style("left",(event.pageX+10)+"px");
										   
					tooltip.style("visibility", "hidden");
				}
				function gridManager(svg, height, width, left, top) 
				{
								var hfactor = Math.ceil(height * .1);
								var vfactor = Math.ceil(width * .1);
								var hRange = Math.ceil(height / hfactor);
								var vRange = Math.ceil(width) / vfactor;
								svg.selectAll(".hline").data(d3.range(hRange)).enter()
									.append("line")
									.attr("y1", function (d) 
								{
									return d * hfactor + 6;
								})
									.attr("y2", function (d) {
									return d * hfactor + 6;
								})
									.attr("x1", function (d) {
									return 0;
								})
									.attr("x2", function (d) {
									return width;
								})
									.style("stroke", "lightgray")
									.style("z-index", -5)
									.attr("transform", "translate(" + left + "," + top + ")");

								svg.selectAll(".vline").data(d3.range(vRange)).enter()
									.append("line")
									.attr("x1", function (d) {
									console.log(" value D : " + d);
									return d * (width / 10);
								})
									.attr("x2", function (d) {
									return d * (width / 10);
								})
									.attr("y1", function (d) {
									return 0;
								})
									.attr("y2", function (d) {
									return height;
								})
									.style("stroke", "lightgray")
									.attr("z-index", -5)
									.attr("transform", "translate(" + left + "," + top + ")");
					 }
			
			}
		
		}


		var drillDownChart = {
            drawDrillDownChart: function (id, barData,options) {
                var cfg = {
                    topMargin: 5,
                    rightMargin: 30,
                    bottomMargin: 0,
                    leftMargin: 10,
                    color: d3.scale.category20(),
					toolTipLabel:'Drilled Chart',
					redraw:'false'
					
                };
				
				
                if ('undefined' !== typeof options) {
                    for (var i in options) {
                        if ('undefined' !== typeof options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }
				
				if(svgElement.selectAll(".tick").empty()){
					chartData=barData;	
					height=height-height*0.2;
				}else{
					svgElement.selectAll("g").remove();
				}
				
				InitChart();
				
				
				
				
				
                function InitChart() {


					var groupingHeight=height*0.1;
					var left;
					
					if(width*0.05<30){
						left=30;
					}else{
						left=width*0.05;
					}
					
                    var vis = svgElement.append("svg:g")
                        .attr("width", width)
                        .attr("height", height)
                        .attr('class', 'backtobrand')
						.attr("transform","translate("+left+","+height*0.1+")")
                        .append("g");
						
					
					
					
					var browserData=[];
					var counter=0;
					//find Max for browser
					var maxBrowserYVal=0;
					var minBrowserYVal=0;
					for(var key  in barData){
						if(maxBrowserYVal<barData[key].data){
							maxBrowserYVal=barData[key].data;
						}
						
						if(minBrowserYVal>barData[key].data){
							minBrowserYVal=barData[key].data;
						}
						
						//fomrat data
						var subData=barData[key].subData;
						var subDataArray=[];
						var subDataCountr=0;
						for(var subDataKey in subData){
							var subVal=subData[subDataKey];
							
							var subObj={"name":subDataKey,"x":subDataCountr,"y":subVal};
							subDataArray.push(subObj);
							subDataCountr++;
						}
						
						var obj={"x":counter,"y":barData[key].data,"name":key,"subData":subDataArray};
						browserData.push(obj);
						
						counter++;
					}
					
					
					var maxYScale=maxBrowserYVal;
						
					maxYScale=maxYScale*1.5;
					
					var xScale = d3.scale.ordinal().rangeRoundBands([left, (width-width*0.05)], 0.1).domain(
						
					browserData.map(function(d,i){
						return i;
					}))
					
					,

						
						
                        yScale = d3.scale.linear().range([height - cfg.topMargin, cfg.bottomMargin]).domain([0,
                        maxYScale]),

                        xAxis = d3.svg.axis()
                            .scale(xScale)
                            .tickSize(5)
                            .tickSubdivide(true),

                        yAxis = d3.svg.axis()
                            .scale(yScale)
                            .tickSize(5)
                            .orient("left")
                            .tickSubdivide(false);

		/*			var largestStringLngth=((browserData[0]["name"].toString()).length);
					for(var charCountr=0;charCountr<browserData.length;charCountr++){
						var currentStringLngth=(browserData[charCountr]["name"].toString()).length;
						
						if(largestStringLngth<currentStringLngth){
								largestStringLngth=currentStringLngth;
						}
					}*/
				
				//	var xAxisTickArr=tickController.getXTickArray(0,(browserData.length-1),largestStringLngth, (width - cfg.rightMargin));
				//	alert(xAxisTickArr);			
					//alert("length "+browserData.length +" largest "+largestStringLngth +" w "+(width - cfg.rightMargin) +" arr "+xAxisTickArr);
					
			//		xAxis.tickValues(xAxisTickArr)
                    var xAxisRef=vis.append('svg:g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + (height - cfg.bottomMargin) + ')')
                        .call(xAxis);
						
					xAxisRef.selectAll("text")
					.text(function(d,i){
							return browserData[d]["name"];
					});
					
					xAxisRef.selectAll("text").call(textWrapper.wrapText,40);
					
                    var yAxisRef=vis.append('svg:g')
                        .attr('class', 'y axis')
                        .attr('transform', 'translate(' + (cfg.leftMargin) + ','+(-cfg.bottomMargin)+')')
                        .call(yAxis);

                    vis.selectAll('rect')
                        .data(browserData)
                        .enter()
                        .append('rect')
                        .on('click', function (d) {
						
						
						if(d["subData"].length>0){
							drawNewBarChart(d["subData"]);
						}else{
							alert("dont have sub data");
						}
                        
						d3.select(".resetDrillBtnGroup").style("display","block");

                    })
                    .on("mouseover", function (d) {
							
							/*
							d3.select("#drillDownTooltip")
                            .style("left", d3.event.pageX + "px")
                            .style("top", d3.event.pageY + "px")
                            .style("opacity", 1)
                            .select("#value")
                            .text(d.y);
							*/
							
							var yHeadingValueMap=[{"headingName":(cfg.yLabel) ,"headingVal":d.y}];
							
							
							toolTipManager.showToolTip(d3.event,"",(cfg.xLabel +" "+d.name), false,yHeadingValueMap,d3.event.pageY*0.95);
							
							//toolTipManager.showToolTip(d3.event, d.y,"", false, cfg.toolTipLabel );
                    })
                     .on('mouseout', function (d) {
						toolTipManager.hideTooTip();
                        //d3.select("#drillDownTooltip").style("opacity", 0);
                    })
                        .attr('x', 0)
                        .attr('y', height)
                        .transition()
                        .duration(1200)
                        .attr('x', function (d) {
                        return xScale(d.x);
                    })
                    .attr('y', function (d) {
                        return yScale(d.y)-cfg.bottomMargin;
                    })
                    .attr('width', xScale.rangeBand())
                    .attr('height', function (d) {
						return ((height) - yScale(d.y));
                    })
                    .attr('fill', function (d, i) {
                        return cfg.color(i)
                    })
					.style("cursor",function(d){
						if(d["subData"].length>0){
							return "pointer";
						}else{
							return "";
						}
					});
					
					if(d3.select(".resetDrillDownBtn").empty()){
					
									var reesetBtnWidth=70;
									var reesetBtnHeight=30;
									
									var resetBtnGrouping=svgElement.append("g")
															.attr("class","resetDrillBtnGroup")
														  .attr("transform", "translate(" + (width-(cfg.leftMargin*3)) + "," + (margin.top) + ")" );
														  
														  resetBtnGrouping.append("rect")
														  .attr("width",reesetBtnWidth)
														  .attr("height",reesetBtnHeight)
														  .attr("x","0")
														  .attr("y","0")
														  .attr("rx","2")
														  .attr("ry","2")
														  .attr("class",'resetDrillDownBtn')
														  .on("mouseover",function(){
															d3.select('.resetDrillDownBtn').style("fill",'#7F7FFF');
														  })
														  .on("mouseout",function(){
															d3.select(this).style("fill",'blue');
														  })
														  .style('fill','blue')
														  .style('display','inline-block')
														  .style("cursor","pointer")
														  ;
														  
														  
									resetBtnGrouping.append("text")
													.attr("x",20)
													.attr("y",reesetBtnHeight/2)
													.attr("dy",'.35em')
													.attr("class","resetDrillDownBtn")
													.text("Reset")
													.attr("fill","white");
								d3.select(".resetDrillBtnGroup").style("display","none");
							}
					
					function drawNewBarChart(d) {

                        var data=d;
						
						/*
                        if (d.x == 'Chrome') data = Chrome;
                        else if (d.x == 'Firefox') data = Firefox;
						*/

                        if ('undefined' !== typeof data) {
                            vis.remove();


                            vis = svgElement.append("svg")
                                .attr("width", width)
                                .attr("height", (height*1.5))
                                .append("g")
								.attr("transform","translate("+left+","+height*0.05+")");


                            xScale = d3.scale.ordinal().rangeRoundBands([left, width - width*0.05], 0.1).domain(data.map(function (d) {
                                return d.x;
                            }));
							
							var maxYScale=d3.max(data, function (d) {
											return d.y;
										 });
							maxYScale=maxYScale*1.5;
							
                            yScale = d3.scale.linear().range([height -height*0.08,height*0.08]).domain([0,
                            maxYScale]);

                            xAxis = d3.svg.axis()
                                .scale(xScale)
                                .tickSize(5)
                                .tickSubdivide(false),

                            yAxis = d3.svg.axis()
                                .scale(yScale)
                                .tickSize(5)
                                .orient("left")
                                .tickSubdivide(false);
							
							var largestStringLngth=(data[0]["name"].length);
							for(var charCountr=0;charCountr<data.length;charCountr++){
								var currentStringLngth=data[charCountr]["name"].length;
								
								if(largestStringLngth<currentStringLngth){
										largestStringLngth=currentStringLngth;
								}
							}
						
							
							var xAxisTickArr=tickController.getXTickArray(0,(data.length),largestStringLngth, (width - cfg.rightMargin));
							
							//alert("length "+browserData.length +" largest "+largestStringLngth +" w "+(width - cfg.rightMargin) +" arr "+xAxisTickArr);
							
							xAxis.tickValues(xAxisTickArr)
                            var xAxisRef=vis.append('svg:g')
                                .attr('class', 'x axis')
                                .attr('transform', 'translate(0,' + (height - cfg.bottomMargin) + ')')
                                .call(xAxis);
								
								xAxisRef.selectAll("text")
								.text(function(d){
									return data[d]["name"];
								});

							var yAxisRef=vis.append('svg:g')
                                .attr('class', 'y axis')
                                .attr('transform', 'translate(' + (cfg.leftMargin) + ',-35)')
                                .call(yAxis);


                            vis.selectAll('rect')
                                .data(data)
                                .enter()
                                .append('rect')
                                .attr("id", id)
                                .on("mouseover", function (d) {
									/*
									d3.select("#drillDownTooltip")
										.style("left", d3.event.pageX + "px")
										.style("top", d3.event.pageY + "px")
										.style("opacity", 1)
										.select("#value")
										.text(d.y);
									*/
									var yHeadingValueMap=[{"headingName":(cfg.yLabel) ,"headingVal":d.y}];
						
									toolTipManager.showToolTip(d3.event,"",(cfg.xLabel +" "+d.name), false,yHeadingValueMap);
									
									//toolTipManager.showToolTip(d3.event, d.y,"", false, cfg.toolTipLabel );	
								})
                                .on('mouseout', function (d) {
									toolTipManager.hideTooTip();
									//d3.select("#drillDownTooltip").style("opacity", 0);
								})
                                .attr('x', 0)
                                .attr('y', height)
                                .transition()
                                .duration(1200)
                                .attr('x', function (d) {
                                return xScale(d.x);
                            })
                                .attr('y', function (d) {
                                return yScale(d.y)-cfg.bottomMargin;
                            })
                                .attr('width', xScale.rangeBand())
                                .attr('height', function (d) {
                                return ((height) - yScale(d.y));
                            })
                                .attr('fill', function (d, i) {
                                return cfg.color(i)
                            });
							
							//draw y indication label
						var pixcelPerChar=6;
						var totalYLabelPixcel=cfg.yLabel.toString().length*pixcelPerChar;
						var yIndicationLabelTop=height/2+totalYLabelPixcel/2;
						var yIndicationLabelLeft=-left-left*0.5;
						axisLabelController.appendLabel(cfg.yLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,yAxisRef,textStyleConfg.xLabelColor,600);
						
						var totalYLabelPixcel=cfg.xLabel.toString().length*pixcelPerChar;
						var xIndicationLabelTop=height*0.1;
						var xIndicationLabelLeft=width/2-totalYLabelPixcel/2;
						axisLabelController.appendLabel(cfg.xLabel,xIndicationLabelLeft,xIndicationLabelTop,0,xAxisRef,textStyleConfg.yLabelColor,600);
						
							d3.select(".resetDrillDownBtn").on("click", function (d) {


                                //$(selectorElement).find("svg g").remove();
								
								drillDownChart.drawDrillDownChart(id,chartData,options);
								
								d3.select(".resetDrillBtnGroup").style("display","none");
								
								
                            });
                        }
                    };
					
					//draw y indication label
					var pixcelPerChar=6;
					var totalYLabelPixcel=cfg.yLabel.toString().length*pixcelPerChar;
					var yIndicationLabelTop=height/2+totalYLabelPixcel/2;
					var yIndicationLabelLeft=-left;
					axisLabelController.appendLabel(cfg.yLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,yAxisRef,textStyleConfg.yLabelColor,600);
					
					var totalYLabelPixcel=cfg.xLabel.toString().length*pixcelPerChar;
					var xIndicationLabelTop=height*0.1;
					var xIndicationLabelLeft=width/2-totalYLabelPixcel/2;
					axisLabelController.appendLabel(cfg.xLabel,xIndicationLabelLeft,xIndicationLabelTop,0,xAxisRef,textStyleConfg.xLabelColor,600);
					
					//hide all axis path
					hideAxisPath(svgElement);
					
					//set font here
					
						setTextStyleAndSvgBackGround(svgElement);
					
                };
            }
        };
		//variation chart
		
		var darwVariationAnalysisGraph=
		{
				variationAnalysis:function(cnfg)
				{
						var variationAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.15,top:height*0.15,chartSeparator:5,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
				var title = cnfg.data.title;
				var subTitle =cnfg.data.subTitle;
				var titleColor = cnfg.data.titleColor;
				var yAxisData = cnfg.data.yAxisData;
				var yAxisLabel = cnfg.data.yAxisLabel;
				var xAxisData = cnfg.data.xAxisData;
				var xAxisLabel = cnfg.data.xAxisLabel;
				var scaleWidth=width-variationAnalChart.left-variationAnalChart.right;
				var scaleHeight=height-variationAnalChart.top-variationAnalChart.bottom;
				var fontSize,rectangleSize,rectangleTextSize,titleFontSize,gridFactor;
				if(width<501)
				{
						titleFontSize = 18
						gridFactor = 8;
						fontSize = 11;
						rectangleSize = 9;
						rectangleTextSize =9;
				}
				else
				{	
						titleFontSize = 20;
						gridFactor = 12;
						fontSize = 14;
						rectangleSize = 10;
						rectangleTextSize =10;
				}
				
				var fontFamily = 'calibri';
				var xAxisLabelColor = "black"
				//make low value and high value array
				var lowValue = [],highValue = [];
				var index =0;
				for(var outerLoop=0;outerLoop<xAxisData.length;outerLoop++)
				{
					for(var innerLoop=0;innerLoop<2;innerLoop++)
					{	
						if(innerLoop==0)
							lowValue[index]=xAxisData[outerLoop][innerLoop];
						else
							highValue[index++]=xAxisData[outerLoop][innerLoop];
					}
				}	
				
				variationMainGroup = svgElement.append("g")
					.attr('class','main-group')
                    .attr("transform", "translate(" + variationAnalChart.left + "," + variationAnalChart.top + ")");
								
			
				//title label here
				axisLabelController.appendLabel(title,(variationAnalChart.left),((-variationAnalChart.top/1.4)),0,variationMainGroup,textStyleConfg.titleColor,700);

				//subTitle label here				
				 axisLabelController.appendLabel(subTitle,(variationAnalChart.left+10),((-variationAnalChart.top/2.6)),0,variationMainGroup,textStyleConfg.titleColor,600);
				 
				 var gridManager = {
            init: function (svg, height, width, left, top) {
                var vfactor = Math.ceil(height * .2);
                var vRange = Math.ceil(width / vfactor);
				
                svg.selectAll(".vline").data(d3.range(vRange)).enter()
                    .append("line")
                    .attr("x1", function (d) {
                    return (d * (width /gridFactor));
                })
                    .attr("x2", function (d) {
                    return (d * (width /gridFactor));
                })
                    .attr("y1", function (d) {
                    return 0;
                })
                    .attr("y2", function (d) {
                    return height;
                })
                    .style("stroke", "gray")
                    .attr("transform", "translate(" + left + "," + top + ")");
            }

        };
				
		  gridManager.init(variationMainGroup, scaleHeight, scaleWidth, 0, 0);		
				
				
				var yScale = d3.scale.linear()
							   .domain([0,yAxisData.length-1])
                               .range([0,scaleHeight]);
	            
				var yAxis = d3.svg.axis()
                                  .scale(yScale)
                                  .orient("left")
								  .tickValues(tickController.getTickArray(0,yAxisData.length-1,12));
								  
                var yAxisGroup = variationMainGroup.append("g")
									.attr("class","y-axis")
									.attr("transform","translate("+0+","+0+")")
						       	    .attr('fill','none')
									.call(yAxis)
									.selectAll('text')
									.text(function(d){return yAxisData[d];})
									.attr('fill','black');	
		    
		    /*	var yAxisLabelGroup = variationMainGroup.append("g")
									.attr('class','y-axis-label-group')	
				     				.attr("transform","translate("+(-variationAnalChart.left/1.7)+","+scaleHeight/1.5+")");			
									
					yAxisLabelGroup.append('text')
					               .attr('x',0)
								   .attr('y',0)
								   .attr('font-size',fontSize)
							       .attr('font-family',fontFamily)
								   .attr('fill',titleColor)
								   .attr('transform','rotate(-90)')
								   .text(yAxisLabel);*/
				//yAxis label here
				var pixcelPerChar = 6;
				var totalYLabelPixcel=yAxisLabel.toString().length*pixcelPerChar;
				var yIndicationLabelTop=scaleHeight/2+totalYLabelPixcel/2;
				var yIndicationLabelLeft=(-variationAnalChart.left/2)
				axisLabelController.appendLabel(yAxisLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,variationMainGroup,textStyleConfg.yLabelColor,600);
				   
									
		//		alert(d3.min(lowValue)+"  " +d3.max(highValue));
				var xScale = d3.scale.linear()
							   .domain([d3.min(lowValue)*1.5,d3.max(highValue)*1.5])
                               .range([0,scaleWidth]);
	            
				var xAxis = d3.svg.axis()
                                  .scale(xScale)
                                  .orient("bottom");						  
                var xAxisGroup = variationMainGroup.append("g")
									.attr("class","x-axis")
									.attr("transform","translate("+0+","+(scaleHeight+10)+")")
						         	 
							         .attr('font-size',fontSize)
									 .attr('fint-family',fontFamily)
					                 .call(xAxis)
									 .selectAll('text')
									 .attr('fill','black');
				d3.select('.x-axis').attr('fill','none');	
			
		//xAxis label here
				var totalXLabelPixcel=xAxisLabel.toString().length*pixcelPerChar;
				var xIndicationLabelTop=scaleHeight+(scaleHeight*0.15);
				var xIndicationLabelLeft=scaleWidth/2-totalXLabelPixcel/2;
				axisLabelController.appendLabel(xAxisLabel,xIndicationLabelLeft,xIndicationLabelTop,0,variationMainGroup,textStyleConfg.xLabelColor,600);
				
				var rectangleGroup = variationMainGroup.append("g")
									.attr("class","rectangle-group")
									.attr("transform","translate("+0+","+0+")");
				
var rectangleGradient = rectangleGroup.append("svg:defs")
									.append("svg:linearGradient")
									.attr("id", "rectangleGradient")
									.attr("x1", "0%")
									.attr("y1", "0%")
									.attr("x2", "100%")
									.attr("y2", "100%")
									.attr("spreadMethod", "pad")
									.attr("gradientTransform","rotate(0)");

				rectangleGradient.append("stop")
					.attr("offset", "0")
					.attr("stop-color", "#04b4ae");
				rectangleGradient
					.append("stop")
					.attr("offset", "1")
					.attr("stop-color", "#0489b1");
		
								var midValue=(d3.min(lowValue)+d3.max(highValue))/2;
								
								var rectGroupRef=rectangleGroup.selectAll('rect')
											  .data(highValue)
											  .enter()
											  .append('rect')
											  .attr('value',function(d,i){return i})
											  .attr('x',function(d,i){return xScale(midValue);})
											  .attr('y',function(d,i){return yScale(i)})
											  .attr('width',function(d,i){return 0;})
											  .attr('height',rectangleSize)
											  .attr('fill',"url(#rectangleGradient)");
							
								rectGroupRef
								.transition()
								.duration(1000)
								.attr('x',function(d,i){return xScale(lowValue[i])})
								.attr('width',function(d,i){return xScale(highValue[i])-xScale(lowValue[i])});
								
											  
								rectangleGroup.selectAll('text')
											  .data(highValue)
											  .enter()
											  .append('text')
											  .attr('x',function(d,i){return xScale(lowValue[i])-((lowValue[i].toString().length+xAxisLabel.length)*(rectangleTextSize)/1.7)})
											  .attr('y',function(d,i){return yScale(i)+rectangleTextSize/1.5})
											  .attr('font-size',rectangleTextSize)
							                  .attr('font-family',fontFamily)
											  .attr('font-weight','500')
											  .text(function(d,i){return lowValue[i]+" "+xAxisLabel});
								
				var rectangleTextRightSide = variationMainGroup.append("g")
									.attr("class","rectangleTextRightSide")
									.attr("transform","translate("+0+","+0+")");
								
								
								rectangleTextRightSide.selectAll('text')
											  .data(highValue)
											  .enter()
											  .append('text')
											  .attr('x',function(d,i){return xScale(highValue[i])+6})
											  .attr('y',function(d,i){return yScale(i)+rectangleTextSize/1.5})
											  .attr('font-size',rectangleTextSize)
							                  .attr('font-family',fontFamily)
											  .attr('font-weight','500')
											  .text(function(d,i){return highValue[i]+" "+xAxisLabel});			  
											  //(lowValue[i].toString().length)*fontSize)
				}
		};
		
        var pieChartWithTransition = {
		drawPieChartWithTransition: function (options) {
                var options = $.extend({

                    'data': []
                }, options);

                var dataset=options.value;
				
				var factor = options.label;
				/*
                if (options.data.length == 0) {
                    dataset = chartData;
                } else {
                    dataset = options.data;
                }
				*/
                var legendsArray = options.key;
				var legendTextLength = 0;
				for(var index = 0;index<legendsArray.length;index++)
				{
					if(legendTextLength<legendsArray[index].length)
					{
						legendTextLength = legendsArray[index].length;
					}
				}
				
				
				
				
			//	alert(legendTextLength);
				var legendWidth=18;
                var curwidth = height > width ? width : height;
                var marginArc = curwidth * .20;
                var curMarginLeft = width * .25;
                var outerRadius = (curwidth - (marginArc)) / 2;
                outerRadius = outerRadius - legendTextLength*5-legendWidth*2;
				var innerRadius = 0;
                var radius = 100;
				var grad = Math.PI / 180;


                var pie = d3.layout.pie().sort(null).startAngle(0 * grad).endAngle(360 * grad);
                var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);
                var arcOver = d3.svg.arc().innerRadius(innerRadius)
                    .outerRadius(outerRadius + 14);

                var color = "";
                if (options.color == null) {
                    color = d3.scale.category20b();
                } else {
                    color = function (i) {
                        return options.color[i];
                    }
                }

                var svg = svgElement.append("g")
								.attr("transform", "translate(" +(-width*0.1) + "," + 0 + ")")
                  
				  //  .attr("width", width)
                  //  .attr("height", height);

                var arcs = svg.selectAll("g.arc")
                    .data(pie(dataset))
                    .enter()
                    .append("g")
                    .attr("class", "slice")
                    .attr("stroke", "white")
                    .attr("stroke-width", 0)
                    .attr("transform", "translate(" + (width/2) + "," + (height/3) + ")")
                    .on("mouseover", function (d, i) {

                    var json = JSON.parse('{"' + factor + '":' + d.value + "}");

                    svg.select('#' + legendsArray[i].replace(/ /g, "") + 'text')
                        .transition()
                        .attr("x", 24 + 10)
                        .style('font-weight', 'bold')
                        .style('fill', 'bold');
                    svg.select('#' + legendsArray[i].replace(/ /g, "") + 'path')
                        .attr("stroke", "white")
                        .transition()
                        .duration(500)
                        .attr("d", arcOver)
                        .attr("stroke-width", 1);
					
					var yHeadingValueMap=[{"headingName":(factor) ,"headingVal":d.value}];
						
					toolTipManager.showToolTip(d3.event,"",(legendsArray[i]), false,yHeadingValueMap);	
					//toolTipManager.showToolTip(d3.event,d.value,legendsArray[i], false,factor );	
                    //toolTipManager.showToolTipForBarWithMultipleLine(d3.event, json, legendsArray[i], false, null, false);
                })
                    .on("mouseout", function (d, i) {

                    svg.select('#' + legendsArray[i].replace(/ /g, "") + 'text')
                        .transition()
                        .attr("x", 24)
                        .style('font-weight', textStyleConfg["font-weight"])
                        .style('fill', 'black');
                    svg.select('#' + legendsArray[i].replace(/ /g, "") + 'path')
                        .transition()
                        .attr("d", arc)
                        .attr("stroke-width", 0);
					toolTipManager.hideTooTip();	
                    //toolTipManager.hideMulitpleLineBarToolTip();
                });



                arcs.append("path")
                    .attr("fill", function (d, i) {
                    return color(i);
                })
                    .attr('id', function (d, i) {
                    return legendsArray[i].replace(/ /g, "") + 'path';
                })
                .attr("d", arc)
                .on("click", function (d, i) {
                    svg.select('#' + legendsArray[i].replace(/ /g, "") + 'text')
                        .transition()
                        .attr("x", 24 + 10)
                        .style('font-weight', 'bold')
                        .style('fill', 'bold');
                    d3.select(this)
                        .attr("stroke", "white")
                        .transition()
                        .duration(500)
                        .attr("d", arcOver)
                        .attr("stroke-width", 1);
                })
                .on("mouseleave", function (d, i) {
					
                    svg.select('#' + legendsArray[i].replace(/ /g, "") + 'text')
                        .transition()
                        .attr("x", 24)
                        .style('font-weight', textStyleConfg["font-weight"])
                        .style('fill', textStyleConfg["legendTextColor"]);
					
						
                    d3.select(this).transition()
                        .attr("d", arc)
                        .attr("stroke-width", 0);
                })
                .transition().duration(1500).attrTween("d", sweep);

                function sweep(a) {
                    var i = d3.interpolate({
                        startAngle: -180 * grad,
                        endAngle: -180 * grad
                    }, a);
                    return function (t) {
                        return arc(i(t));
                    };
                }
				
				var legend = svgElement
				
				/*		
				append("svg")
                    .attr("class", "legend")
                    .attr("width", width)
                    .attr("height", height)
					*/
                    .selectAll("g.legendGrouping")
                    .data(legendsArray)
                    .enter().append("g")
                    .attr("transform", function (d, i) {
                    return "translate(" + (10) + "," + (10 + i * 20) + ")";
                });

                legend.append("rect")
                    .attr("width",legendWidth)
                    .attr("height", 18)
                    .style("fill", function (d, i) {

                    return color(i);
                });

                legend.append("text")
                    .attr('id', function (d, i) {
                    return legendsArray[i].replace(/ /g, "") + 'text';
                })
                    .attr("x", 233)
                    .transition()
                    .duration(function (d, i) {
                    return i * 400;
                })
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .text(function (d, i) {
                    return legendsArray[i];
                });
				
				
				setTextStyleAndSvgBackGround(svgElement);
            },
			dountChartWithLegend:function(cnfg)
			{
				var positionRect = 0,radius,innerRadius;
				var positionText = 0;
				var grad = Math.PI/180;
				var selected=1;
				var divId=cnfg.divId;
				var data=cnfg.data;
				
				 var backUpOfData = {
										key :[],
										value :[],
										color :[]
									};
				 var list = ['dountChart','pie chart'];
				 //alert(parseInt(d3.select("#"+divId).style("width")));
				 var width =parseInt(d3.select("#"+divId).style("width"));
				 var height=parseInt(d3.select("#"+divId).style("height")); 
				 var textSize,textHeight,textSpce;
				if(width<301 || height <301)
				{
					textSize = 10;textHeight=6,textSpace=7;
				}
				else if(width<401 || height <401)
				{
					textSize = 12;textHeight=9,textSpace=9;
				}
				else if(width<601 || height <601)
				{
					textSize = 14;textHeight=10,textSpace=12;
				}
				else
				{
					textSize = 15;textHeight=11,textSpace=19;
				}
				 var margin = {top: height*.10, right: width*.10, bottom: height*.20, left: width*.10};
				 var width = width - margin.left - margin.right;
				 var height = height - margin.top - margin.bottom;
				 var lengthOfChar=data.key.length;
				var tooltip = d3.select("body")
					.append("div")
					.style('background','rgba(0,0,0,.6)')
					.style("position", "absolute")
				//	.style("z-index", 1)
					.style("visibility", "hidden")
					.style("font-family",'calibri')
					.style("font-style",'normal')
					.style("color",'white')
					.text("a simple tooltip"); 
				var rectSize;
				if(height<width)
				{
					radius = (height/2);
					rectSize = height*.05;
				}
				else
				{
					radius = (width/2);
					rectSize = (width)*.05;
				}	 
				innerRadius = radius-(radius*.5);
				 var divSelection = d3.select("#"+divId);
				 
				 var svgSelection =svgElement;
				 
				 var group = svgSelection.append("g")
								   .attr('id','group')
								   .attr("transform", "translate(" + (width + margin.left + margin.right)/2 + "," + (((height + margin.top + margin.bottom)/2)-margin.top) + ")");
				 
				 var widthOfDount = 2*radius;
				 
				 var arc = d3.svg.arc()
							.innerRadius(innerRadius)
							.outerRadius(radius);
							
				 var pie = d3.layout.pie()
									.sort(null)
									.value(function(d) { return d;});
									
					refreshPie();				
				 /*	*/  
				var legendGroup = svgSelection.append("g")
								   .attr("transform", "translate(" +(((width + margin.left + margin.right)/2)-radius)+ "," + (((height + margin.top + margin.bottom)/2)+radius)+ ")");

				legendGroup.selectAll('rect')
				  .data(data.value)
				  .enter()
				  .append("rect")
				  .attr("class","legend")
				  .attr ('value',function(d,i) { return data.key[i];})
				  .attr("fill",function(d,i) { return data.color[i];})
				  .attr("x", function(d, i){ if(i>3){return ((parseInt(i/4)-1)+(positionRect++)*(widthOfDount*.3))}else{return (i*(widthOfDount*.3))};})
				  .attr("y",function(d,i) { if(i>3){return (rectSize*2) }   })
				  .attr("width", rectSize)
				  .attr("height",rectSize)
				  .on("click", function(d,i) 
				  {	
						if(d3.select(this).attr("fill")=="gray")
						{          d3.select(this).attr("fill",addPie(d3.select(this).attr('value')));
									d3.select(this).style("text-decoration","none");
						}			
						else
						{			d3.select(this).attr("fill","gray")
									d3.select(this).style("text-decoration","line-through");
									removePie(d3.select(this).attr('value')) ;	}
				})

				var legendText=legendGroup.selectAll('text')
						   .data(data.value)
						   .enter()
						   .append('text')
						 //  .attr('x',function(d, i){ return ((i*(width*.20))+20);})
						   .attr("x", function(d, i){ if(i>3){return ((parseInt(i/4)-1)+(positionText++)*(widthOfDount*.3))+rectSize+3}else{return (i*(widthOfDount*.3))+rectSize+3};})
						   .attr("y",function(d,i) { if(i>3){return (3*rectSize) }else{return rectSize}   })
						   .style('font-size',textSize)
						   .style('font-family','calibri')
						   .style('font-style','italic')
						 //  .attr('y',10)
						   .text(function(d,i) { return data.key[i]; });
				
				setTextStyleAndSvgBackGround(legendGroup);	
				
				legendText.style("fill",textStyleConfg["legendTextColor"]);
				
				 function removePie(keyName)
				 {
					var keyIndex=getIndex(keyName);	
					backUpOfData.value.splice(0,0,data.value[keyIndex]);
					backUpOfData.key.splice(0,0,data.key[keyIndex]);
					backUpOfData.color.splice(0,0,data.color[keyIndex]);
					data.value.splice(keyIndex,1);
					data.key.splice(keyIndex,1);
					data.color.splice(keyIndex,1);
					
					refreshPie();
				}
				function addPie(keyName)
				{
					for(var counter=0;counter<backUpOfData.key.length;counter++)
					{
						if(backUpOfData.key[counter]==keyName)
						{break;}
					}
					data.value.splice(0,0,backUpOfData.value[counter]);
					data.key.splice(0,0,backUpOfData.key[counter]);
					data.color.splice(0,0,backUpOfData.color[counter]);
					refreshPie();	
					return backUpOfData.color[counter];
				}  

				function getIndex(keyName)
				{
					for(var counter=0;counter<data.key.length;counter++)
					{
						if(data.key[counter]==keyName)
						{
							//alert(counter);
							break;
						}
					}
					return counter;
				}				
				function getPercentage(keyName)
				{
					var keyValue,sum=0;
					for(var traverse = 0 ;traverse<data.value.length;traverse++)
					{
						if(data.key[traverse]==keyName)
						{
							keyValue=data.value[traverse];
						}
						sum =sum+data.value[traverse];
					}
					return Math.round(((keyValue/sum)*100));
				}
				function getToolTip(keyName,event)
				{

					var keyIndex=getIndex(keyName);
					/*	
					tooltip.style("top", (event.pageY-10)+"px")
				   .style("left",(event.pageX+10)+"px")
				   .text(data.key[keyIndex]+","+data.label+"-"+getPercentage(keyName)+"%");
				   */
				   
					var yHeadingValueMap=[{"headingName":(data.label) ,"headingVal":getPercentage(keyName)+"%"}];
						
					toolTipManager.showToolTip(event,"",(data.key[keyIndex]), false,yHeadingValueMap);	
					
				}

				function refreshPie()
				{
					d3.select("#group")
					   .remove();
					group = svgSelection.append("g")
								   .attr('id','group')
								   .attr("transform", "translate(" + (width + margin.left + margin.right)/2 + "," + (((height + margin.top + margin.bottom)/2)-margin.top) + ")");

				var arcs = group.selectAll(".arc")
								.data(pie(data.value))
								.enter()
								.append("g")
								.attr('value',function(d,i) {return data.key[i];})
								.attr("fill",function(d,i){return data.color[i];} )
								.on("mouseover", function(){
									d3.select(this).transition().duration(500).ease('bounce')
									.attr('transform', function (d) 
									 {
										var dist = 15;
										d.midAngle = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
										var x = Math.sin(d.midAngle) * dist;
										var y = -Math.cos(d.midAngle) * dist;
										return 'translate(' + x + ',' + y + ')';
									 }) ;
									//return tooltip.style("visibility", "visible");
									getToolTip(d3.select(this).attr('value'),d3.event);	
								})
								/*
								.on("mousemove", function(){ 
									getToolTip(d3.select(this).attr('value'));	
									
								})
								*/
								.on("mouseout", function(){	d3.select(this).transition().duration(500).ease('bounce')
													  .attr('transform', 'translate(0,0)')
											//return tooltip.style("visibility", "hidden");
										toolTipManager.hideTooTip();	
								});
								
				arcs.append("path")
					.attr("d",arc)
					.transition().duration(1500).attrTween("d", sweep);
					try{
						setTextStyleAndSvgBackGround(legendGroup);
					}catch(err){
						
					}
				}

				function sweep(d) {
					   var i = d3.interpolate({startAngle: -180*grad, endAngle: -180*grad},d);
					 return function (call) {
					  //console.log(call);
					  return arc(i(call));
					 };
					}
				
			},

			drawDountWithBarChart:function(cnfg)
			{
				var divId=cnfg.divId;
				var data=cnfg.data;
				var subDataArray=cnfg.subDataArray;
				//var textColor=cnf.textColor;
				
				var positionRect = 0;
				var positionText = 0;
				var grad = Math.PI/180;
				var selected=1,radius,innerRadius;
				var popUpArc=0;
				var backUpOfData = {
										key :[],
										value :[],
										color :[]
									};
									
				 var width =parseInt(d3.select("#"+divId).style("width"));
				 var height=parseInt(d3.select("#"+divId).style("height")); 
				 var textSize,textHeight,textSpace;
				 if(width<301 || height <301)
				{
					textSize = 7;textHeight=6,textSpace=7;
				}
				else if(width<401 || height <401)
				{
					textSize = 10;textHeight=9,textSpace=9;
				}
				else if(width<601 || height <601)
				{
					textSize = 12;textHeight=10,textSpace=12;
				}
				else
				{
					textSize = 14;textHeight=11,textSpace=19;
				}
				var marginSpace = {top: height*.10, right: width*.10, bottom: height*.20, left: width*.10};
				var width = width - marginSpace.left - marginSpace.right;
				var height = height - marginSpace.top - marginSpace.bottom;
				
				var tooltip = d3.select("body")
					.append("div")
					.style('background','rgba(0,0,0,.6)')
					.style("position", "absolute")
				//	.style("z-index", 1)
					.style("visibility", "hidden")
					.style("font-family",'calibri')
					.style("font-style",'normal')
					.style("color",'white')
					.text("a simple tooltip"); 
				var divSelection = d3.select("#"+divId);
				 
				var svgSelection = svgElement.append("g")
											 .attr("transform","translate("+0+","+marginSpace.top+")");
				
				var dountGroup = svgSelection.append("g")
								   .attr('id','dountGroup')
								   .attr("transform", "translate(" + ((width + marginSpace.left + marginSpace.right)*.40)/2 + "," + ((marginSpace.top+marginSpace.bottom)) + ")");

				if(height<width*.40)
				{
					radius = (height/2);
					rectSize = height*.06;
				}
				else
				{
					radius = ((width*.40)/2);
					rectSize = (width*.40)*.06
				}	
				innerRadius = radius-(radius*.5);

				var lineGroup = svgSelection.append("g")
								   .attr('id','lineGroup')
								   .attr("transform", "translate(" + ((width + marginSpace.left + marginSpace.right)/2.4) + "," + 0 + ")");

				var lineArray = [0,(((height + marginSpace.top + marginSpace.bottom)/2)-marginSpace.bottom)-radius,0,(((height + marginSpace.top + marginSpace.bottom)/2)-marginSpace.bottom)+radius];				   
				var lineIndex=0;				   
				var simpleLine = d3.svg.line()
									   .x(function(d) { return lineArray[lineIndex++]; })
									   .y(function(d) { return lineArray[lineIndex++]; });	
				var drawLine = lineGroup.append("path")
							//  .style("display", "none")
							  .data([lineArray])
							  .attr("stroke", "lightgray")
							  .attr("stroke-width", 1)
							  .attr("fill", "none");	
				drawLine.attr("d",simpleLine);	  
						   
				var widthOfDount = (2*radius)+(2*margin.right/2.5);
				var arc = d3.svg.arc()
							.innerRadius(innerRadius)
							.outerRadius(radius);
							
				var pie = d3.layout.pie()
									.sort(null)
									.value(function(d) { return d;});

								
				//call piedount chart
				refreshPie();		
				//call bar chart
				showBarChart(data.key[0]);			
				// pop up arc
				d3.select("#"+data.key[0]).transition().duration(500).ease('bounce')
								.attr('transform', function (d) 
											 {
												var dist = 10;
												d.midAngle = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
												var x = Math.sin(d.midAngle) * dist;
												var y = -Math.cos(d.midAngle) * dist;
												return 'translate(' + x + ',' + y + ')';
											 }) ;										


				var legendGroup = svgSelection.append("g")
								   .attr("transform", "translate(" +((((width + marginSpace.left + marginSpace.right)*.40)/2)-(radius+marginSpace.right/2.5))+ "," +  ((((height + margin.top + margin.bottom)/2)-margin.bottom)+radius+10)+ ")");
				var widthOfDount = (2*radius)+(2*marginSpace.right/3);
				
				var legendWidth=10,legendHeight=10,pixcelPerChar=6,widthLimit=widthOfDount*0.9,textSeparator=20,nextLineSeparator=20;
				function isMoveLegendToNextLine(string,xPos,i){
					var currentLegendXPos=xPos+legendWidth+(string.length*pixcelPerChar)+textSeparator;
					
					if(currentLegendXPos>widthLimit){
						return {"startPos":(widthOfDount*0.05),"move":true};
						//return true;
					}
					else if(i == 0){
						return {"startPos":(widthOfDount*0.05),"move":false};
					}
					else{
						return {"startPos":currentLegendXPos+(widthOfDount*0.1),"move":false};
						//return false;
					}
				}
				
				var nextLineCounter=0;
				var xPos=(widthOfDount*.05),xPos1=(widthOfDount*.05),yPos=0;
				var positionXArray=[];
				var positionYArray=[];
				
				var legendPositionArray=legendController.getLegendPositionArray(data.key,(widthOfDount+widthOfDount*0.5),height);
				legendGroup.selectAll('rect')
				  .data(data.key)
				  .enter()
				  .append("rect")
				  .attr("class","legend")
				  .attr ('value',function(d,i) { return data.key[i];})
				  .attr("fill",function(d,i) { return data.color[i];})
				  .attr("x", function(d, i){ 
						//if(i>3){return ((parseInt(i/4)-1)+(positionRect++)*(widthOfDount*.3))}else{return (i*(widthOfDount*.3))};
						/*
						var moveToNextLine=isMoveLegendToNextLine(data.key[i],xPos,i);
						
						if(moveToNextLine.move){
							xPos=moveToNextLine.startPos;
						}else{
							xPos=moveToNextLine.startPos;
						}
						positionXArray.push(xPos);
						return xPos;
						*/
						return legendPositionArray[i].x
				  })
				  .attr("y",function(d,i) { 
						/*
						//if(i>3){return (rectSize*2) }   
						//var xPos=i*(widthOfDount*.3);
						var moveToNextLine=isMoveLegendToNextLine(data.key[i],xPos1,i);
						
						//var yPos=0;
						if(moveToNextLine.move){
							nextLineCounter++;
							yPos=nextLineCounter*nextLineSeparator;
							xPos1=moveToNextLine.startPos;
						}else{
							xPos1=moveToNextLine.startPos;
						}
						positionYArray.push(yPos);
						return yPos;
						*/
						return legendPositionArray[i].y;
					})
				  .attr("width", legendWidth)
				  .attr("height",legendHeight)
				  .on("click", function(d,i) 
				  {	
						if(d3.select(this).attr("fill")=="gray")
						{          d3.select(this).attr("fill",addPie(d3.select(this).attr('value')));
									d3.select(this).style("text-decoration","none");
						}			
						else
						{			d3.select(this).attr("fill","gray");
									d3.select(this).style("text-decoration","line-through");
									removePie(d3.select(this).attr('value')) ;	}
				})
				
				nextLineCounter=0;
				xPos=0*(widthOfDount*.3)+textSeparator,xPos1=0*(widthOfDount*.3);
				legendGroup.selectAll('text')
						   .data(data.key)
						   .enter()
						   .append('text')
						 //  .attr('x',function(d, i){ return ((i*(width*.20))+20);})
						   .attr("x", function(d, i){ 
								/*
								var x=positionXArray[i]+textSeparator;
								return x;
								*/
								return legendPositionArray[i].textPos;
						   })
						   .attr("y",function(d,i) {
								/*
								var y=positionYArray[i]+textSeparator-legendHeight;
								return y;
								*/
								return legendPositionArray[i].y+legendHeight;
						   })
						   .style('font-size',textSize)
						   .attr('fill',data.textAndLegendColor)
						   .style('font-style','italic')
						   .style('font-family','calibri')
						 //  .attr('y',10)
						   .text(function(d,i) { return d; });				   
					
				function removePie(keyName)
				 {
					var keyIndex=getIndex(keyName);	
					backUpOfData.value.splice(0,0,data.value[keyIndex]);
					backUpOfData.key.splice(0,0,data.key[keyIndex]);
					backUpOfData.color.splice(0,0,data.color[keyIndex]);
					data.value.splice(keyIndex,1);
					data.key.splice(keyIndex,1);
					data.color.splice(keyIndex,1);
					refreshPie();
				}
				function addPie(keyName)
				{
					for(var counter=0;counter<backUpOfData.key.length;counter++)
					{
						if(backUpOfData.key[counter]==keyName)
						{break;}
					}
					data.value.splice(0,0,backUpOfData.value[counter]);
					data.key.splice(0,0,backUpOfData.key[counter]);
					data.color.splice(0,0,backUpOfData.color[counter]);
					refreshPie();	
					return backUpOfData.color[counter];
				}  

				function getIndex(keyName)
				{
					for(var counter=0;counter<data.key.length;counter++)
					{
						if(data.key[counter]==keyName)
						{
							//alert(counter);
							break;
						}
					}
					return counter;
				}				
				function getPercentage(keyName)
				{
					var keyValue,sum=0;
					for(var traverse = 0 ;traverse<data.value.length;traverse++)
					{
						if(data.key[traverse]==keyName)
						{
							keyValue=data.value[traverse];
						}
						sum =sum+data.value[traverse];
					}
					return Math.round(((keyValue/sum)*100));
				}
				function getToolTip(keyName,event)
				{
					
					var keyIndex=getIndex(keyName);	
					//alert(event.pageY );
					console.log("*****event pagey "+event.pageY +" ****spae "+marginSpace.top);
					event.pageY=event.pageY;//-marginSpace.top;
					/*	
					tooltip.style("top", (event.pageY-10)+"px")
						   .style("left",(event.pageX+10)+"px")
						   .text(data.key[keyIndex]+"," +data.label+"-"+data.value[keyIndex] + ", " 
						   +getPercentage(keyName)+"%");
					*/
					var yHeadingValueMap=[{"headingName":(data.label) ,"headingVal":data.value[keyIndex]+" "+getPercentage(keyName)+"%"}];
						
					toolTipManager.showToolTip(event,"",(data.key[keyIndex]), false,yHeadingValueMap,d3.event.pageY*.90);	
					
				}

		
				function refreshPie()
					{

					d3.select("#dountGroup").remove();
					 dountGroup = svgSelection.append("g")
									   .attr('id','dountGroup')
									   .attr("transform", "translate(" + ((width + marginSpace.left + marginSpace.right)*.40)/2 + "," + (((height + marginSpace.top + marginSpace.bottom)/2)-marginSpace.bottom) + ")");

					var arcs = dountGroup.selectAll(".arc")
					.data(pie(data.value))
					.enter()
					.append("g")
					.attr('id',function(d,i) {return data.key[i];})
					.attr('value',function(d,i) {return data.key[i];})
					.attr("fill",function(d,i){return data.color[i];} )
					.on("click",function(){
							showBarChart(d3.select(this).attr('value'));	
							})

					.on("mouseover", function(){
					
				
					
					d3.select(this).transition().duration(500).ease('bounce')
					.attr('transform', function (d) 
								 {
									var dist = 10;
									d.midAngle = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
									var x = Math.sin(d.midAngle) * dist;
									var y = -Math.cos(d.midAngle) * dist;
									return 'translate(' + x + ',' + y + ')';
								 }) ;							 
								 //return tooltip.style("visibility", "visible");
						getToolTip(d3.select(this).attr('value'),d3.event);			 
					})
								 
					.on("mousemove", function(){ 
						if(popUpArc==0)
						{
							d3.select("#"+data.key[0]).transition().duration(500).ease('bounce')
										  .attr('transform', 'translate(0,0)');
							popUpArc=1;				  
						}
						getToolTip(d3.select(this).attr('value'),d3.event);	
					})
					
					.on("mouseout", function(){	
							d3.select(this).transition().duration(500).ease('bounce')
							.attr('transform', 'translate(0,0)')
							toolTipManager.hideTooTip();
							//return tooltip.style("visibility", "hidden");
					});
					
					arcs.append("path")
						.attr("d",arc)
						.transition().duration(1500).attrTween("d", sweep);
					}
					function sweep(d) {
						   var i = d3.interpolate({startAngle: -180*grad, endAngle: -180*grad},d);
						 return function (call) {
						  //console.log(call);
						  return arc(i(call));
						 };
						}
					function showBarChart(country)
					{
						d3.select("#barGroup").remove();
										var barGroup =  svgSelection.append("g")
									   .attr('id','barGroup')
									   .attr("transform","translate("+(((width + marginSpace.left + marginSpace.right)*.40)+ marginSpace.left)+"," +((((height + marginSpace.top + marginSpace.bottom)/2)-marginSpace.bottom)-(radius/1.5))+ ")");
										
											d3.select("#showCountryGroup").remove();
										var showCountryGroup =  svgSelection.append("g")
														   .attr('id','showCountryGroup')
														   .attr("transform","translate("+(((width + marginSpace.left + marginSpace.right)*.40)+ marginSpace.left)+"," +((((height + marginSpace.top + marginSpace.bottom)/2)-marginSpace.bottom)-(radius))+ ")");
											
										//	var country = d3.select(this).attr('value');
											
											showCountryGroup.append('text')
															.transition().duration(1500)
															.attr('fill',data.color[getIndex(country)])
															.style('font-family','calibri')
															.style('font-size',textSize*2)
															.style('font-style','italic')
															.text(country);	
										//	alert(subDataArray[country]);
										  //  var barHeight=30;
											var x = d3.scale.linear()
													  .domain([0, d3.max(subDataArray[country])])
													  .range([0, width*.32]);
											var bar = barGroup.selectAll("g")
															  .data(subDataArray[country]).enter().append("g")
															  .attr("transform", function(d, i) { return "translate(0," + i * rectSize*2.6 + ")"; });
										   
											var barRef=	bar.append("rect")
													.attr("width", function(d,i){return 0;})
												   .attr("height",rectSize*1.3);
												   
												   
										   barRef.transition().duration(1500)
										   .attr("width", function(d,i){return x(subDataArray[country][i]);})
										   .attr("fill",function(d,i) {return  subDataArray.color[i];});
												   
												   
												var sum=0;
												for(var index=0;index<subDataArray[country].length;index++)
												{
													sum = sum + subDataArray[country][index];
												} 
											   bar.append("text")
												  .transition().duration(1500)
												  .attr("x", function(d,i) {return x((subDataArray[country][i]))-textSize*2; })
												  .attr("y", (rectSize*1.3)/ 2)
												  .attr("dy", ".35em")
												  .style('font-size',textSize+2)
												  .attr('fill',data.textAndLegendColor)
												  .style('font-family','calibri')
												  .style('font-style','italic')
												  .text(function(d,i) { return Math.round((((subDataArray[country][i])/sum)*100)) + "%  "+subDataArray.key[i]; });
												 
			}
			
			//set font here
			setTextStyleAndSvgBackGround(svgElement);
			
			//set legendColor
			legendGroup.selectAll("text").style("fill",textStyleConfg.legendTextColor);	
		},
			
			multipleDountChartAnalysis : function(data) {
				
				
				var dountAnalChart={left:width*0.05,right:width*0.05,bottom:height*0.05,top:height*0.05,chartSeparator:10,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
				var scaleWidth=width-dountAnalChart.left-dountAnalChart.right;
				var scaleHeight=height-dountAnalChart.top-dountAnalChart.bottom;			
				var group,arcs;
				var totalClasses = data.data.length;
				var dountCenter = 1;
				var radius,innerRadius;
				var grad = Math.PI/180;
				var legendSize = scaleWidth * 0.015;
				var legendFontSize = legendSize*1.3;
				var arc12;
				radius = (((scaleWidth*.8)/Math.round(totalClasses/2))/2)<(scaleHeight/2)?(((scaleWidth*.8)/Math.round(totalClasses/2))/2):(scaleHeight/2);
				radius = radius*.4;
				innerRadius = radius * .75;
							
							
				var pie = d3.layout.pie()
						    .sort(null)
							.value(function(d) { return d;});	
				
				var setHorizontalDistance,setHorizontalDistanceRef; 
				for(var counter = 0 ; counter<totalClasses;counter++)
				{
					
					if(totalClasses==1)
					{
						group = svgElement.append('g')
							  .attr('class','dount-main-group')
							  .attr("transform", "translate(" + ((scaleWidth*.8)/2) + "," + (scaleHeight*.5) + ")");
							
							radius = ((scaleWidth*.8))<(scaleHeight)?(scaleWidth*.8):(scaleHeight);
							radius = radius*.4;
							innerRadius = radius * .75;
										
					}
					else if(counter<Math.round(totalClasses/2))
					{
						setHorizontalDistance = (scaleHeight*.3);
						group = svgElement.append('g')
							  .attr('class','dount-main-group'+counter)
							  .attr("transform", "translate(" + (((((scaleWidth*.8)/Math.round(totalClasses/2))*(counter+1))/2)+(counter*1.5*radius)) + "," + (setHorizontalDistance) + ")");								
					}
					else
					{
						
						if(totalClasses>6)
						{
							setHorizontalDistanceRef = ((setHorizontalDistance)+(radius*4));
						}
						else
						{
							setHorizontalDistanceRef = ((setHorizontalDistance)+(radius*3));
						}
						group = svgElement.append('g')
							  .attr('class','dount-main-group'+counter)
							  .attr("transform", "translate(" + (((((scaleWidth*.8)/Math.round(totalClasses/2))*(dountCenter))/2)+((dountCenter++ -1)*1.5*radius)) + "," + setHorizontalDistanceRef + ")");
					
					}
					
				var arc = d3.svg.arc()
							.innerRadius(innerRadius)
							.outerRadius(radius);	
					
					arcs = group.selectAll(".arc")
				.data(pie(data.data[counter].dountData))
		        .enter()
				.append("g")
				.attr('value',function(d,i) {return counter+" "+i;})
				.attr("fill",function(d,i){return data.data[counter].colorArray[i];} )
				.on("mouseover", function(d)
				{
					var KeyValue = d3.select(this).attr('value');
					var KeyArray  = KeyValue.split(" ");
					
						d3.select(this).transition().duration(500).ease('bounce')
						  .attr('transform', function (d) 
						 {
							var dist = 7;
							d.midAngle = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
							var x = Math.sin(d.midAngle) * dist;
							var y = -Math.cos(d.midAngle) * dist;
							return 'translate(' + x + ',' + y + ')';
						 });
						 /*
						 arc12 = d3.svg.arc()
							.innerRadius(innerRadius-5)
							.outerRadius(innerRadius-3)
							.startAngle(d.startAngle)
							.endAngle(d.endAngle);
															
															
						group.append("svg:path")
							.attr('display','block')
							.attr('class','ShowArc')
							.attr("fill", function(d, i){
								return "black";
							})
							.attr("d", arc12);*/

				})
				.on("mousemove", function()
				{
					var KeyValue = d3.select(this).attr('value');
					var KeyArray  = KeyValue.split(" ");
					console.log(data.data[parseInt(KeyArray[0])].dountKey[parseInt(KeyArray[1])]);
					var yHeadingValueMap=[{"headingName":data.data[parseInt(KeyArray[0])].dountKey[parseInt(KeyArray[1])],"headingVal":data.data[parseInt(KeyArray[0])].dountData[parseInt(KeyArray[1])]+" "+data.unit}];
						
						toolTipManager.showToolTip(d3.event,"",(data.data[parseInt(KeyArray[0])].className), false,yHeadingValueMap);
					
				})
				.on("mouseout", function()
				{	
					d3.select(".ShowArc").attr('display','none');
					d3.select(this).transition().duration(500).ease('linear')
					                  .attr('transform', 'translate(0,0)')
			    //         	return tooltip.style("visibility", "hidden");
				})
				.on("mouseleave",function(){
						toolTipManager.hideTooTip();
				});
		
		arcs.append("path")
		   .attr("d",arc)
		   .transition().duration(1500).attrTween("d", sweep);
				
	
				group.append('text')
					 .attr('x',-(data.data[counter].totalStudent.length*6)/2)
					 .attr('y',3)
					 .attr('font-family','calibri')
					 .text(data.data[counter].totalStudent);
				
				group.append('text')
					 .attr('x',-((data.data[counter].className.length*6)/2))
					 .attr('y',radius+(11))
					 .attr('font-family','calibri')
					 .text(data.data[counter].className);
					 
			
			
			}
	//legend here		
	var legendGroup = svgElement.append('g')
					   .attr('class','dount-main-group')
					   .attr("transform","translate(" +scaleWidth*.8 +","+scaleHeight*.3+")");
			
	
    var recrRef = legendGroup.selectAll('rect')
			   .data(data.legend)
			   .enter()
			   .append('rect')
			   .attr('width',legendSize)
			   .attr('height',legendSize)
			   .attr('x',function(){return -scaleWidth*.78})
			   .attr('y',function(d,i){return scaleHeight})
			   .attr('fill',function(d,i){return data.legendColor[i]});
			   
		recrRef.transition().duration(1500)
		       .attr('x',0)
			   .attr('y',function(d,i){return i*2*legendSize});
	
	
var textRef = legendGroup.selectAll('text')
			   .data(data.legend)
			   .enter()
			   .append('text')
			   .attr('x',function(){return -scaleWidth*.78})
			   .attr('y',function(d,i){return i*2*legendSize+legendSize/2})
			   .attr("dy",".31em")
			   .attr('font-family','calibri')
			   .attr('font-size',legendFontSize)
			   .text(function(d,i){return d;});

	    textRef.transition().duration(1500)
		       .attr('x',legendSize+8);
	
//horizontal line here
			legendGroup.append('line')
					   .attr("x1",-((scaleWidth*.75)*0.1))
					   .attr("y1",-legendSize/2)
					   .attr("x2",-((scaleWidth*.75)*0.1))
					   .attr("y2",data.legend.length*2*legendSize)
					   .attr("stroke","lightsteelblue")
			   	
			   
function sweep(d) {
       var i = d3.interpolate({startAngle: -180*grad, endAngle: -180*grad},d);
     return function (call) {
      //console.log(call);
      return arc(i(call));
     };
    }			

			}

		}


        var heatMapChart = {
            drawHeatMapChart: function (id, data,options) {
                var cfg = {

                    colorLow: '#F6fdff',
                    colorMed: '#81DCFF',
                    colorHigh: '#0BBCFF',
                    yAxisLabelSpacing: 50
                };


                if ('undefined' !== typeof options) {
                    for (var i in options) {
                        if ('undefined' !== typeof options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }
				
				var heatMapData=[];
				var yAxisValue=data["yAxisValue"];
				var xAxisValue=[];
				
                var gridSize = (0.70 * width) / yAxisValue.length;


                var margin = {
                    top: 0.03 * height,
                    right: (1 / 12) * width,
                    bottom: (1 / 20) * height,
                    left: (8 / 60) * width
                },
                widthHeatMap = width - cfg.yAxisLabelSpacing,
                    heightHeatMap = height - 0.03 * height - margin.top - margin.bottom;

				
				//format data according to heat map data requiremenet
				var tempHeatMapData=data.data;
				var rowNmber=0;
				for(var dataKey in tempHeatMapData){
					var dataArray=tempHeatMapData[dataKey];
					xAxisValue.push(dataKey);
					
					for(var dataCountr=0;dataCountr<dataArray.length;dataCountr++){
						var heatMapDataObj={};
						heatMapDataObj.row=rowNmber;
						heatMapDataObj.col=dataCountr;
						heatMapDataObj.hours=dataArray[dataCountr];
						heatMapData.push(heatMapDataObj);
					}
					rowNmber++;
				}
				
                var minColorValue = d3.min(heatMapData, function (d) {
                    return d.hours;
                })
                var maxColorValue = d3.max(heatMapData, function (d) {
                    return d.hours;
                });

                var colorScale = d3.scale.linear()
                    .domain([minColorValue, (minColorValue + maxColorValue) / 2, maxColorValue])
                    .range([cfg.colorLow, cfg.colorMed, cfg.colorHigh]);



                var h = (0.80 * height) / yAxisValue.length;
                w = (0.70 * width) / rowNmber;


                var x = d3.scale.linear()
                    .range([0, widthHeatMap]);

                var y = d3.scale.linear()
                    .range([heightHeatMap, 0]);

                var xScale = d3.scale.ordinal()
                    .domain(d3.range(rowNmber))
                    .rangeRoundBands([0, w * (rowNmber)], 0.05);

                var yScale = d3.scale.ordinal()
                    .domain(d3.range(yAxisValue.length))
                    .rangeRoundBands([0, h * (yAxisValue.length)], 0.10);


                var xAxis = d3.svg.axis()
                    .scale(xScale)
					
                    // .tickFormat(function (d) {
				   //	return xAxisValue[d];
				   //})
                    .orient("bottom").ticks(5);


                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .tickFormat(function (d) {
                    return yAxisValue[d];
                })
                    .orient("left").ticks(5);


                var svg = svgElement.append("svg")
                    .attr("width", widthHeatMap + margin.right / 2)
                    .attr("height", heightHeatMap + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + widthHeatMap*0.15 + "," + margin.top + ")");


                var heatMap = svg.selectAll("g")
                    .data(heatMapData, function (d) {
                    return d.col + ':' + d.row;
                })
                    .enter().append("svg:rect")
                    .attr("x", function (d) {
                    return d.row * w;
                })
                    .attr("y", function (d) {
                    return d.col * h;
                })
                    .attr("width", function (d) {
                    return w;
                })
                    .attr("height", function (d) {
                    return h;
                })
                    .style("fill", function (d) {
                    return colorScale(d.hours);
                })
                    .on("mouseover", function (d) {
                    d3.select(this).style('fill', 'cyan');
                    var x = d3.event.pageX;
                    drawPointer(d, x);
                })
                    .on("mouseout", function () {
                    d3.select(this).style("fill", function (d) {
                        return colorScale(d.hours);
                    })
                    undrawPointer();
                });


                var text = svg.selectAll("g")
                    .data(heatMapData, function (d) {
                    return d.col + ':' + d.row;
                })
                    .enter().append("svg:text")
                    .attr("x", function (d) {
                    return d.row * w;
                })
                    .attr("y", function (d) {
                    return d.col * h;
                })
                    .attr("text-anchor", "middle")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", function () {
                    return w * h / ((w + h) * 2.5);


                })
                    .attr("dy", function (d, i) {
                    return d.row + h / 2;
                })
                    .attr("dx", function (d) {
                    return d.col + w / 2;
                })
                    .text(function (d) {
                    return d.hours
                })
                    .on("mouseover", function (d) {

                    var x = d3.event.pageX;
                    drawPointer(d, x);

                })
                    .on("mouseout", function () {

                    undrawPointer();
                });
				
				//capture all x axis ticks
				var xAxisTickArray=[];
				for(var xTickCountr=0;xTickCountr<xAxisValue.length;xTickCountr++){
					xAxisTickArray.push(xTickCountr);
				}
				
				xAxis.tickValues(xAxisTickArray);
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + h * yAxisValue.length + ")")
                    .call(xAxis)
                    .selectAll("text")
					.text(function(d){
						return xAxisValue[d];
					})
                    .style("text-anchor", "end")
                    .attr("dx", "-1.0em")
                    .attr("dy", "0.15em")
                    .attr("transform", function (d) {
                    return "rotate(-45)"
                });

                svg.append("g")
                    .attr("class", "y axis")
					.call(yAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-0.0em")
                    .attr("dy", "0.0em")
                    .attr("transform", function (d) {
						return "rotate(0)"
					});
					
				var marginMeter = {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 8
                },
                widthMeter = width - marginMeter.left - marginMeter.right,
                    heightMeter = height - marginMeter.top - marginMeter.bottom;

                var svgMeter = svgElement.append("svg")
                    .attr("width", width - marginMeter.left + marginMeter.right)
                    .attr("height", heightMeter + marginMeter.top + marginMeter.bottom)
                    .append("g");



                var gradient = svgMeter
								/*
								.selectAll(id)
								.data(data, function (d) {
									return d.col + ':' + d.row;
								})
                    .enter()*/
					.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient")
                    .attr("x1", "0%")
                    .attr("y1", yScale(0))
                    .attr("x2", "0%")
                    .attr("y2", yScale(yAxisValue.length - 1))
                    .attr("gradientUnits", "userSpaceOnUse");
				
				gradient.append("svg:stop")
                    .attr("offset", "0%")
                    .attr("stop-color", colorScale(minColorValue))
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", "20%")
                    .attr("stop-color", colorScale(10))
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", "40%")
                    .attr("stop-color", colorScale(20))
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", "60%")
                    .attr("stop-color", colorScale(30))
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", "80%")
                    .attr("stop-color", colorScale(40))
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", "100%")
                    .attr("stop-color", colorScale(maxColorValue))
                    .attr("stop-opacity", 1);
				
				
                svgMeter.append("svg:rect")

                    .attr("x", width - (0.05 * width))
                    .attr("y", margin.top)
                    .attr("width", (yAxisValue.length * 3))
                    .attr("height", h * yAxisValue.length)
                    .style("fill", "url(#gradient)");


                var maxHours = d3.max(heatMapData, function (d) {
                    return d.hours
                });

                var meterYScale = d3.scale.linear().range([(h * yAxisValue.length), 0]);
                minYScale = d3.min(heatMapData, function (d) {
                    return d.hours;
                });
                maxYScale = d3.max(heatMapData, function (d) {
                    return d.hours;
                });

                meterYScale.domain([maxYScale, minYScale]);

                var meterYAxis = d3.svg.axis()
                    .scale(meterYScale).orient("right").ticks(4).tickSize(5, 0);


                svgMeter.append("g")
                    .attr("class", "y axis")
					.call(meterYAxis)
					.selectAll("text")
                    .style("text-anchor", "right")

                    .attr("x", width - (0.09 * width))
                    .attr("y", marginMeter.top)
                    .attr("dx", "0.0em")
                    .attr("dy", "0.0em")
                    .attr("transform", function (d) {
                    return "rotate(0)"
                });
				
				svgMeter.selectAll("line")
						.style("display",'none');
						
                svgMeter.append("g").append("svg:image")
                    .attr("id", "img")
                    .attr("xlink:href", "http://www.stocinn.com/stoccharts/img/pointer.png")
                    .attr("width", width / 30)
                    .attr("height", width / 30)
                    .style('display', 'none');

                function drawPointer(d, x) {
                    svgMeter.select(" #img").style('display', 'block');
                    svgMeter.select("#img")
                        .transition()
                        .attr("x", width - (0.09 * width))
                        .attr("y", meterYScale(d.hours));
                }

                function undrawPointer() {

                    svgMeter.select("#img").style('display', 'none');
                }
				
				//hide all axis path
					hideAxisPath(svgElement);
				
				//set font here
				
					setTextStyleAndSvgBackGround(svgElement);
				
            }
        }

		
       var scatterPlotChart = {

			drawScatterPlotChart: function (id, data) {
                var cfg = {

                    padding: data.padding,
                    toolTipLabel: "Population"
                };
				
				width=width*0.9;
				height=height*0.9;
				
				var xAxisArray=data.xAxisTickArray;
				var yIndicationLabel=data.yIndicationLabel;
				var xIndicationLabel=data.xIndicationLabel;
				var chartTitle=data.chartTitle;	
				/*
                if ('undefined' !== typeof options) {
                    for (var i in options) {
                        if ('undefined' !== typeof options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }*/


                var maxX = 0;
                var maxY = 0;
                var currMaxX;
                var currMaxY;
                var actualData = data.yAixsData;


                for (i = 0; i < actualData.length; i++) {
                    currMaxX = d3.max(actualData[i].data, function (d,k) {
								
                        return d;
                    });
                    currMaxY = d3.max(actualData[i].data, function (d) {
                        return d;
                    });

                    if (currMaxX > maxX) maxX = currMaxX;

                    if (currMaxY > maxY) maxY = currMaxY;
					actualData[i].legendName="legend-"+i
                }
				
				
                var leftMargins = 10;
                var topMargins = 0;
                var colors = d3.scale.category20();
				
				maxX=xAxisArray.length;
				
				var left;
				if(width*0.08<40){
					left=40;
				}else{
					left=width*0.08;
				}
				
				var xScale = d3.scale.linear()
                    .domain([0, maxX])
                    .range([left, width - width*0.05]);




                var yScale = d3.scale.linear()
                    .domain([0, 1.5 * maxY])
                    .range([height - cfg.padding * 2, cfg.padding]);


                var rScale = d3.scale.linear()
                    .domain([10, maxY])
                    .range([5, 10]);



                var formatAsPercentage = d3.format(".1%");


                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(5);



                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5);



                var svg = svgElement
                    .append("g")
                    .attr("transform", "translate(" + (left) + "," + topMargins + ")");

				/*
                gridManager.init(svg, height, width, leftMargins, topMargins);

				*/


                for (iVal = 0; iVal < actualData.length; iVal++) {
                    drawLineWithShape(svg, actualData[iVal], actualData[iVal].color, actualData[iVal].legendName);

                }

                function drawLineWithShape(svg, dataV, color, name) {

                    if (dataV.shape == 'circle') {
                        drawCircle(svg, getFormattedDataFromDataSetForScatter(dataV), color, name,dataV);

                    }
					
					else if (dataV.shape == 'square') {
                        drawSquare(svg, getFormattedDataFromDataSetForScatter(dataV), color, name,dataV);
                    }
					else {

                        drawTriangle(svg, getFormattedDataFromDataSetForScatter(dataV), color, name,dataV);
                    }
					
                }

				
                function drawCircle(svg, data, color, name,dataObj) {


                    svg.selectAll("." + name + " dot")
                        .data(data.coordinates)
                        .enter()
                        .append("circle")
                        .attr("class", name + " dot")
                        .on("mouseover", function (d,i) {
						
						var yHeadingValueMap=[{"headingName":dataObj.name +" "+yIndicationLabel,"headingVal":d.y}];
						
						toolTipManager.showToolTip(d3.event, d["yVal"],(xIndicationLabel +" " +xAxisArray[i]), false,yHeadingValueMap);
						//toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, cfg.toolTipLabel + "  " + d.y);
                    })
                        .on('mouseout', function (d) {

                        toolTipManager.hideTooTip();
                    })
         //               .attr('x', 0)
                        .attr("cx", function (d, i) {

                        return 0;
                    })
                        .attr("cy", function (d, i) {

                        return 0;
                    })

           //             .attr('y', height)
                        .transition()
                        .duration(1000)
             //           .attr('x', function (d,i) {
               //         return xScale(i);
                //    })
                        .attr("cx", function (d, i) {
						return xScale(i)-5/2;
                    })
                        .attr("cy", function (d, i) {
                        return yScale(d.y);
                    })
                        .attr("r", function (d, i) {

                        return 5;
                    })
                        .style("fill", function (d, i) {
                        return d.color;
                    });

                }

                function drawSquare(svg, data, color, name,dataObj) {

                    svg.selectAll("." + name + " dot")
                        .data(data.coordinates)
                        .enter()
                        .append("rect")
                        .attr("class", name + " dot")
                        .on("mouseover", function (d,i) {
						
						var yHeadingValueMap=[{"headingName":dataObj.name +" "+yIndicationLabel,"headingVal":d.y}];
						
						toolTipManager.showToolTip(d3.event, d["yVal"],(xIndicationLabel +" " +xAxisArray[i]), false,yHeadingValueMap);
                        //toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, cfg.toolTipLabel + "  " + d.y);
                    })
                        .on('mouseout', function (d) {

                        toolTipManager.hideTooTip();
                    })
                        .attr('x', 0)
                        .attr("width", function (d, i) {

                        return 0;
                    })
                        .attr("height", function (d, i) {

                        return 0;
                    })
                        .attr('y', 0)
                        .transition()
                        .duration(2000)
                        .attr("x", function (d,i) {

                        return xScale(i);
                    })
                        .attr("y", function (d, i) {
                        return yScale(d.y);
                    })
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("fill", function (d) {

                        return d.color;
                    });


                }

                function drawTriangle(svg, data, color, name,dataObj) {
                    svg.selectAll(name + " dot")
                        .data(data.coordinates)
                        .enter()
                        .append("path")
                        .on("mouseover", function (d) {
							
						var yHeadingValueMap=[{"headingName":dataObj.name +" "+yIndicationLabel,"headingVal":d.y}];
						
						toolTipManager.showToolTip(d3.event, d["yVal"],(xIndicationLabel +" " +xAxisArray[i]), false,yHeadingValueMap);
                        //toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, cfg.toolTipLabel + "  " + d.y);
                    })
                        .on('mouseout', function (d) {

                        toolTipManager.hideTooTip();
                    })
                        .attr("class", name + " dot")
                        .attr('x', 0)
                        .attr("width", function (d, i) {

                        return 0;
                    })
                        .attr("height", function (d, i) {

                        return 0;
                    })
                        .attr('y', 0)
                        .transition()
                        .duration(2000)
                        .attr("d", d3.svg.symbol().type("triangle-up"))
                        .attr("transform", function (d, i) {
                        return "translate(" + xScale(i) + "," + yScale(d.y) + ")";
                    })
                        .attr("fill", function (d) {
                        return d.color;
                    });


                }


                function getFormattedDataFromDataSetForScatter(dataV) {

                    var points = {};
                    var coordinates = [];
                    points.coordinates = coordinates;
                    for (j = 0; j < dataV.data.length; j++) {

                        var coordinate = {
                            "color": dataV.color,
                                "name": dataV.name,
                                "x": j,
                                "y": dataV.data[j]
                        };
                        points.coordinates.push(coordinate)
                    }
                    return points;
                }

                function convertStringToNumber(str) {
                    var hash = 0;
                    if (str.length == 0) return hash;

                    for (i = 0; i < str.length; i++) {
                        char = str.charCodeAt(i);
                        hash = ((hash << 5) - hash) + char;
                        hash = hash & hash;
                    }
                    return hash;
                }
				
				
				var largestStringLngth=((xAxisArray[0].toString()).length);
				for(var charCountr=0;charCountr<xAxisArray.length;charCountr++){
					var currentStringLngth=(xAxisArray[charCountr].toString()).length;
					
					if(largestStringLngth<currentStringLngth){
							largestStringLngth=currentStringLngth;
					}
				}
				
				
				var xAxisTickArr=tickController.getXTickArray(0,(xAxisArray.length),largestStringLngth, (width - (cfg.padding * 2) -(cfg.padding)));
				
				xAxis.tickValues(xAxisTickArr);
				
                var xAxisRef=svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + (height - cfg.padding) + ")")
                    .call(xAxis);
					
				xAxisRef.selectAll("text")
					
					.text(function(d,i){
						return xAxisArray[d];
					});
					

                var yAxisRef=svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + leftMargins + ",0)")
                    .call(yAxis);


                var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("width", width)
                    .attr("height", height)



                    .attr('transform', 'translate(' + width / 10 + ',50)');
					
				
				var legendHeight=10,legendWidth=10;
				var legendNameArray=[];
				for(var i=0;i<actualData.length;i++){
					legendNameArray.push(actualData[i].name);
				}
				var legendPositionArray=legendController.getLegendPositionArray(legendNameArray,(width*0.98),height);
				

                for (k = 0; k < actualData.length; k++) {
                    if (actualData[k].shape == 'square') {

                        legend.selectAll('rect')
                            .data([actualData[k]])
                            .enter()
                            .append("rect")
                            .attr("x", function (d, i) {
								//return i * ((100 / 500) * width);
								return legendPositionArray[k].x;
							})
                            .attr("y",function(d,i){
								return legendPositionArray[k].y;
							})
                            .attr("width",legendWidth)
                            .attr("height", legendHeight)
                            .style("fill", function (d, i) {
								return d.color;
							})
                            .on("click", function (d) {
								var state = d3.selectAll("." + d.legendName + ".dot").style("display");
								if (state == "none") {

									d3.selectAll("." + d.legendName + ".dot").style("display", "block");
									d3.select(".rectLegend" +"."+ d.name).style("text-decoration","none");
								} else {

									var selectedPath = svgElement.selectAll("." + d.legendName + "line");

									d3.selectAll("." + d.legendName + ".dot").style("display", "none");
									d3.select(".rectLegend" +"."+ d.name).style("text-decoration","line-through");
								}
							});
						
                        legend.selectAll('.rectLegend')
                            .data([actualData[k]])
                            .enter()
                            .append("text")
							.attr("class",function(d){
								return "rectLegend"+" "+d.name;
							})
                            .attr("x", function (d, i) {
								//return i * ((100 / 500) * width);
								return legendPositionArray[k].textPos;
							})
                            .attr("y",(legendPositionArray[k].y+legendHeight/2))
                            .attr("width", (actualData.length / 300) * width)
                            .attr("height", (actualData.length / 300) * width)
                            .attr("font-size", (10 / 500) * (width + height) / 2)
                            //.attr("dx", "1.50em")
                            .attr("dy", ".50em")
                            .text(function (d, i) {
								return d.name;
							});
							
                    } else if (actualData[k].shape == 'circle') {

                        legend.selectAll('circle')
                            .data([actualData[k]])
                            .enter()
                            .append("circle")
                            //.attr("x", function (d, i) {
                            //return i * ((100 / 500) * width);
							//return legendPositionArray[k].x;
                        //})
                            //.attr("y",legendPositionArray[k].y)
                            .attr("cx",legendPositionArray[k].x)
                            .attr("cy",legendPositionArray[k].y+legendHeight/2)
                            .attr("r", function (d, i) {

                            return legendWidth/2;
                        })
                            .style("fill", function (d, i) {

                            return d.color;
                        })
                        .on("click", function (d) {
                            var state = d3.selectAll("." + d.legendName + ".dot").style("display");
                            if (state == "none") {
                                d3.selectAll("." + d.legendName + ".dot").style("display", "block");
                                d3.select(".circleLegend" +"."+ d.name).style("text-decoration","none");
                            } else {
                                var selectedPath = svgElement.selectAll("." + d.legendName + "line");

                                d3.selectAll("." + d.legendName + ".dot").style("display", "none");
                                d3.select(".circleLegend" +"."+ d.name).style("text-decoration","line-through");
                            }
                        });


                        legend.selectAll('text1')
                            .data([actualData[k]])
                            .enter()
                            .append("text")
							.attr("class",function(d){
								return "circleLegend"+" "+d.name;
							})
                            .attr("x", function (d, i) {
								//return i * ((100 / 500) * width) + 0.20 * width;
								return legendPositionArray[k].textPos;
                        })
                            .attr("y",(legendPositionArray[k].y+legendHeight/2))
                            //.attr("width", (actualData.length / 300) * width)
                            //.attr("height", (actualData.length / 300) * width)
                            .attr("font-size", (10 / 500) * (width + height) / 2)
                            //.attr("dx", "1.5em")
                            .attr("dy", "0.50em")
                            .text(function (d, i) {
								return d.name;
							});
                    } else if (actualData[k].shape == 'triangle') {
                        legend.selectAll('triangle')
                            .data([actualData[k]])
                            .enter()
                            .append("path")
                            .attr("x", function (d, i) {
								//return i * ((100 / 500) * width);
								return legendPositionArray[k].x
							})
                            .attr("y",legendPositionArray[k].y)
                            .attr("d", d3.svg.symbol().type("triangle-up"))
                            .attr("transform", function (d, i) {
                            return "translate(" + (legendPositionArray[k].x) + "," + (legendPositionArray[k].y+legendHeight/2) + ")";
                        })
                            .style("fill", function (d, i) {
                            return d.color;
                        })
                            .on("click", function (d) {
                            var state = d3.selectAll("." + d.legendName + ".dot").style("display");
                            if (state == "none") {

                                d3.selectAll("." + d.legendName + ".dot").style("display", "block");
                                d3.select(".triangleLegend" +"."+ d.name).style("text-decoration","none");
                            } else {

                                var selectedPath = svgElement.selectAll("." + d.legendName + ".line");

                                d3.selectAll("." + d.legendName + ".dot").style("display", "none");
                                d3.select(".triangleLegend" +"."+ d.name).style("text-decoration","line-through");
                            }
                        });

                        legend.selectAll('text2')
                            .data([actualData[k]])
                            .enter()
                            .append("text")
							.attr("class",function(d){
								return "triangleLegend"+" "+d.name;
							})
                            .attr("x", function (d, i) {
                            //return i * ((100 / 500) * width) + 500;
							return legendPositionArray[k].textPos;
                        })
                            .attr("y",legendPositionArray[k].y+legendHeight/2)
                            //.attr("width", (actualData.length / 300) * width)
                            //.attr("height", (actualData.length / 300) * width)
                            .attr("font-size", (10 / 500) * (width + height) / 2)
                            //.attr("dx", "1.50em")
                            .attr("dy", ".50em")
                            .text(function (d, i) {
                            return d.name;
                        });
                    }

                }
				
				
				//y indicaton label
				var pixcelPerChar=6;
				var totalPixcel=yIndicationLabel.toString().length*pixcelPerChar;
				var yLabelTop=height/2+totalPixcel/2;
				
				axisLabelController.appendLabel(yIndicationLabel,-left*0.8,yLabelTop,-90,yAxisRef,textStyleConfg.yLabelColor,600);
				
				//x indication label
				var xLabelPixcel=xIndicationLabel.toString().length*pixcelPerChar;
				var xLabelLeft=width/2-xLabelPixcel/2;
				axisLabelController.appendLabel(xIndicationLabel,xLabelLeft,height*0.15,0,xAxisRef,textStyleConfg.xLabelColor,600);
				
				/*
				//chart title
				var xLabelPixcel=chartTitle.toString().length*pixcelPerChar;
				var xLabelLeft=width/2-xLabelPixcel/2;
				axisLabelController.appendLabel(chartTitle,xLabelLeft,height*0.1,0,svgElement);
				*/
				
				//hide all axis path
				hideAxisPath(svgElement);
				
				//set font here
				
				setTextStyleAndSvgBackGround(svgElement);
				
            }
        };
		
		function hideAxisPath(svgElement){
			svgElement.selectAll(".axis").select("path").style("display","none");
			svgElement.selectAll(".tick line").style("display","none");
		}
		
		function setTextStyleAndSvgBackGround(svgElement){
			
			var textStyle=textStyleConfg;
			
			var allText=svgElement.selectAll("text");
			allText.style("font-size",textStyle["font-size"])
			allText.style("font-family",textStyle["font-family"])
			allText.style("fill",textStyle["tick-font-color"],null);
			allText.style("font-weight",textStyle["font-weight"]);
			
			//set legend color
			svgElement.selectAll(".legend").selectAll("text").style("fill",textStyle["legendTextColor"]);
			
			console.log(textStyle["legendTextColor"]);
			
			/*
			if(textStyle["axisTickColor"]){
				//axis color
				svgElement.selectAll(".axis").selectAll("text").style("fill",textStyle["axisTickColor"],"");
			}
			*/
			
			//set svg background
			//var backgroundColor=textStyle["svg-background"];	
			//svgElement.style("background",backgroundColor)
			
		}
		
		
		
		
        var gridManager = {
            init: function (svg, height, width, left, top) {
                var hfactor = Math.ceil(height * .1);
                var vfactor = Math.ceil(height * .1);
                var hRange = Math.ceil(height / hfactor);

                var vRange = Math.ceil(width / vfactor);

                svg.selectAll(".hline").data(d3.range(hRange)).enter()
                    .append("line")
                    .attr("y1", function (d) {
                    return d * hfactor + 6;
                })
                    .attr("y2", function (d) {
                    return d * hfactor + 6;
                })
                    .attr("x1", function (d) {
                    return 0;
                })
                    .attr("x2", function (d) {
                    return width;
                })
                    .style("stroke", "#eee")
                    .attr("transform", "translate(" + left + "," + top + ")");



                svg.selectAll(".vline").data(d3.range(vRange)).enter()
                    .append("line")
                    .attr("x1", function (d) {
                    return d * (width / 5);
                })
                    .attr("x2", function (d) {
                    return d * (width / 5);
                })
                    .attr("y1", function (d) {
                    return 0;
                })
                    .attr("y2", function (d) {
                    return height;
                })
                    .style("stroke", "#eee")
                    .attr("transform", "translate(" + left + "," + top + ")");
            }

        };

		
var threeDBarChart = {
            drawThreeDBarChart: function (id, heightOfBars, options) {
                var cfg = {
                    topMargin: 5,
                    rightMargin: 30,
                    bottomMargin: 0,
                    leftMargin: 10,
                    color: d3.scale.category20(),
					toolTipLabelForYAxis: "Profit(in Crores)"
                };

                if ('undefined' !== typeof options) {
                    for (var i in options) {
                        if ('undefined' !== typeof options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }

               
			
			var widthOfBars = width / (2 * heightOfBars.length);
			var spacingFactorInBars = 40;
			var rightMargin = 140;
			height=height*0.8;
			
			var xAxisTicksArray=options.xAxisTickArray;
			
			
			var newXSpacingInBars = (0.3*width) / heightOfBars.length;
			spacingFactorInBars=newXSpacingInBars;		
			var newWidthOfBars = width / (2 * heightOfBars.length)
			widthOfBars = newWidthOfBars;
			
			var xSpacingInBars = widthOfBars + spacingFactorInBars;
			
			var maxHeight = d3.max(heightOfBars, function(d,i){ return d;})
			//alert(maxHeight);
			
			
			
			var leftBarMargin = 0;
			var leftMargins	= 30;
			var padding = 0;
			var bottomMargins = 0;
			var spacingInHorizontalLines = 40;
			
			var sum = 1;				
			for(k=0;k<(''+maxHeight).length - 1;k++)
			{
				sum = sum+"0";				
			}		
			
			var lineFunction = d3.svg.line()
									  .x(function(d) { return d.x; })
									  .y(function(d) { return d.y; })
									 .interpolate("linear");
			
			//The SVG Container
			
			var widthOfBarRegion=(heightOfBars.length * xSpacingInBars) + 50;
			
			var xScale = d3.scale.linear()
                    .domain([0, heightOfBars.length])
                    .range([leftMargins,widthOfBarRegion*0.95]);


            var yScale = d3.scale.linear()
                    .domain([0, 1.2 * maxHeight])
                    .range([height - 0.08 *height, 0]);             
			 
            var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
					.tickFormat(formatAsPercentage);

            var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");			
			
            var formatAsPercentage = d3.format("1");		
			//var midPoint=Math.ceil((maxYScale+minYScale)/2);
			
		
			yAxis.tickValues(d3.range(0, 1.15* maxHeight, ((1.15* maxHeight)/10)));
			
			var maxYScale =	maxHeight + 100*(''+maxHeight).length;			
			var nextY = yScale(1.15*maxHeight);			
			
			
			svgElement=svgElement
						.append("g")
						.attr("transform","translate("+widthOfBarRegion*0.1+","+height*0.08+")");
			
			widthOfBarRegion=widthOfBarRegion+widthOfBarRegion*0.05;
			function drawHorizontalLines(startX, startY, widthOfBars, maxHeight, heightOfBars, nextY)
			{
				maxHeight = yScale(maxHeight);
				startY = yScale(startY);
				
				
				var scaleLine=[];				
						for(l=0; l<3; l++)
						{
							if(l==0)
							{
								
								x = startX-widthOfBarRegion*0.07;
								y = (startY-nextY) + 0.03 * widthOfBarRegion;
								
							}	
							else if(l==1)
							{
								x=startX-20;
								y=(startY-nextY);
							}
							else if(l==2)
							{
								x=widthOfBarRegion;
								y=(startY-nextY);														
							}
						
							scaleLine.push(JSON.parse('{"x":'+x+',"y":'+y+'}'));                      
						}
						return scaleLine;					
			}
			
			var startX= width  - width * 0.89;
			var startY= height - height * 0.90;					
			
			
			var svgContainer = svgElement;
			for(j=0;j<10;j++)
			{
			
				var lineGraph = svgContainer.append("path")
									.attr("d", lineFunction(drawHorizontalLines(startX, startY, widthOfBars, maxHeight, heightOfBars, nextY)))
									//.attr("stroke", "blue")
									.attr("stroke-width", 0.5)
									.attr("fill", "none");	
				
				var lineGraphLength= lineGraph.node().getTotalLength();

									lineGraph
									  .attr("stroke-dasharray", lineGraphLength + " " + lineGraphLength)
									  .attr("stroke-dashoffset", lineGraphLength)
									  .transition()
									  .duration(2000)
									  .ease("linear")
									  .attr("stroke-dashoffset", 1)
									  .attr("stroke", "blue")
									  .attr("stroke-width", 0.5)
									  .attr("fill", "none");
			
						
				//drawScales(startX, startY, widthOfBars,maxHeight, heightOfBars, maxHeight, nextY);
						nextY=nextY + (yScale(0) - yScale((1.15* maxHeight)/10));						
			}
			
			
		var startX= width  - width * 0.89;
			var startY= height - height * 0.90;		
				//startY = 0;
				//showToolTip: function (e, yValArg, xValArg, hideXVal, yHeadingName)
				
			for(var j=0;j<heightOfBars.length;j++)
			{
				
				
				var lineGraph = svgContainer.append("path")	
								.attr("d", lineFunction(getSidesCordinates(startX+leftBarMargin, startY, widthOfBars, heightOfBars[j], 1, heightOfBars[j])))							
								.attr('val',function(){
									var cordinateArray=getSidesCordinates(startX+leftBarMargin, startY, widthOfBars, heightOfBars[j], 1, heightOfBars[j]);
									return cordinateArray[0].height;
								})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								   //toolTipManager.showToolTip(d3.event, null, null, false, cfg.toolTipLabelForYAxis + " :- " + d3.select(this).attr('val'));
								})
								.on("mouseout", function (d, i) {
									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								});
																	
					var lineGraphLength = lineGraph.node().getTotalLength();
		
									lineGraph
									  .attr("stroke-dasharray", lineGraphLength + " " + lineGraphLength)
									  .attr("stroke-dashoffset", lineGraphLength)
									  .transition()
									  .duration(2000)
									  .ease("linear")
									  .attr("stroke-dashoffset", 1)
									  .attr("stroke", "blue")
									  .attr("stroke-width", 1)
									  .attr("fill", "#6e839f");
				
				
				var lineGraph = svgContainer.append("path")
								.attr("d", lineFunction(getSidesCordinates(startX+leftBarMargin, startY, widthOfBars, heightOfBars[j], 2, heightOfBars[j])))
								.attr('val',function(){
										var cordinateArray=getSidesCordinates(startX+leftBarMargin, startY, widthOfBars, heightOfBars[j], 2, heightOfBars[j]);
										return cordinateArray[0].height;
									})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								   //toolTipManager.showToolTip(d3.event, null, null, false, cfg.toolTipLabelForYAxis + " :- " + d3.select(this).attr('val'));
								})
								.on("mouseout", function (d, i) {

									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								});
				
				var lineGraphLength = lineGraph.node().getTotalLength();

									lineGraph
									  .attr("stroke-dasharray", lineGraphLength + " " + lineGraphLength)
									  .attr("stroke-dashoffset", lineGraphLength)
									  .transition()
									  .duration(2000)
									  .ease("linear")
									  .attr("stroke-dashoffset", 1)
									  .attr("stroke", "blue")
									  .attr("stroke-width", 1)
									  .attr("fill", "#6e839f");
									  
				var lineGraph = svgContainer.append("path")
								.attr("d", lineFunction(getSidesCordinates(startX+leftBarMargin, startY, widthOfBars, heightOfBars[j], 3, heightOfBars[j])))
								.attr('val',function(){
										var cordinateArray=getSidesCordinates(startX+leftBarMargin, startY, widthOfBars, heightOfBars[j], 3, heightOfBars[j]);
										return cordinateArray[0].height;
									})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								   //toolTipManager.showToolTip(d3.event, null, null, false, cfg.toolTipLabelForYAxis + " :- " + d3.select(this).attr('val'));
								})
								.on("mouseout", function (d, i) {

									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								});
					
				var lineGraphLength= lineGraph.node().getTotalLength();

									lineGraph
									  .attr("stroke-dasharray", lineGraphLength + " " + lineGraphLength)
									  .attr("stroke-dashoffset", lineGraphLength)
									  .transition()
									  .duration(2000)
									  .ease("linear")
									  .attr("stroke-dashoffset", 1)
									  .attr("stroke", "blue")
									  .attr("stroke-width", 1)
									  .attr("fill", "#6e839f");
									  
				leftBarMargin=leftBarMargin+xSpacingInBars;		
				
			}
				


				function getSidesCordinates(x,y,width,height,sideno,heightOfBar){
				
			
				height = yScale(0) - yScale(height) ;
				
				
				var lineData=[];
				
				if(sideno==1){
						var factor=parseInt(width*.33) + 1;
						var xHit=0;
						var yHit=0;
						for(var i=0;i<5;i++){
									
						   if(i==0)
						   {
								y = yScale(0);				   
						   }
						   else if(i==1)
						   {
							   //height = yScale(y+height) - yScale(y);
							   y = y - height;								 
						   }
						   else if(i==2)
						   {
							   x=x+width;   
						   }
						   else if(i==3)
						   {
							   y=y+height;    
						   }     
							else if(i==4)
						   {
							  x=x-width;    
						   }
							
							var nextY=y;
							var nextX=x;
							   
						  //  alert(nextX+"::"+nextY);
							lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}'));                      
						}                               
				}
					  else if(sideno==2){
					  

						//var factor=parseInt(width*.33) + 1;
						var factor = 15;
						var xHit=0;
						var yHit=0;
						y = yScale(y); 
						
						for(var i=0;i<4;i++){
									
						   if(i==0)
						   {
							   y = yScale(0);
								//y = yScale(y);				   
						   }
						   else if(i==1)
						   {
							  // factor = yScale(y) - yScale(y + factor);
							   x=x-factor;
							   y=y-factor;								 
						   }
						   else if(i==2)
						   { 								
							   y=y-height;
							   //alert(" Y : "+ y  + "Height : " + height);
							
								//y = y + height;
							  // console.log("  Y : " +  y + " Height : " + height);
							 //  y = y - 1000;   
							   //nextY=nextY + (yScale(nextY) - yScale(nextY+spacingInHorizontalLines));	
						   }
						   else if(i==3)
						   {
							   x=x+factor;
							   y=y+factor;    
						   }     
							   
							var nextY=y;
							var nextX=x;
							lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}'));  
						}                               
						
					}
					else if(sideno==3){
						//var factor=parseInt(width*.33) + 1;
						factor = 15;
						var xHit=0;
						var yHit=0;
						for(var i=0;i<4;i++){
									
						   if(i==0)
						   {
								y=yScale(0) - height;
									
						   }
						   else if(i==1)
						   {
							   x=x-factor;
							   y=y-factor;
								 
						   }
						   else if(i==2)
						   {
							   x=x+width;   
						   }
						   else if(i==3)
						   {
							   x=x+factor;
							   y=y+factor;    
						   }     
							   
							var nextY=y;
							var nextX=x;
							   
							lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}')); 
						                   
						}                               
						
					}
				
					return lineData;
					
				}
					
			function mMove(){

				 var m = d3.mouse(this);
				 console.log(m);
				 d3.select(this).select("title").text(yScale(m[1]));
			}
			
			var largestStringLngth=0;
				for(var counter =0 ;counter<xAxisTicksArray.length;counter++)
				{
					if(largestStringLngth<(xAxisTicksArray[counter].toString()).length)
					{
						largestStringLngth = (xAxisTicksArray[counter].toString()).length;
					}
				}
				
			xAxis.tickValues(tickController.getXTickArray(0,(xAxisTicksArray.length),largestStringLngth, (widthOfBarRegion-leftMargins)));
	
			var xAxisRef=svgContainer.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate("+(startX)+"," + (height-20) + ")")
                    .call(xAxis);
					
			xAxisRef.selectAll("text")
					.text(function(d){
						return xAxisTicksArray[d];
					});


            var yAxisRef=svgContainer.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + (widthOfBarRegion*0.05) + ","+ (-5)  +")")
                    .call(yAxis);
						
			yAxisRef.selectAll("line").style("display",'none');
			yAxisRef.selectAll("path").style("display",'none');	
			
			//y axis indication label
			var pixcelPerChar=6;
			var yTotalPixcel=cfg.yLabel.toString().length*pixcelPerChar;
			var yLabelTop=height/2+yTotalPixcel/2;
			var yLabelLeft;
			
			if(width<350){
				yLabelLeft=-leftMargins*1.2;
			}else{
				yLabelLeft=-leftMargins*1.5;
			}
			
			axisLabelController.appendLabel(cfg.yLabel,yLabelLeft,yLabelTop,-90,yAxisRef,textStyleConfg.yLabelColor,600);
			
			var xTotalPixcel=cfg.xLabel.toString().length*pixcelPerChar;
			var xLabelLeft=widthOfBarRegion/2-xTotalPixcel/1.5;
			var xLabelTop=height*0.15;
			axisLabelController.appendLabel(cfg.xLabel,xLabelLeft,xLabelTop,0,xAxisRef,textStyleConfg.xLabelColor,600);
				
			}
		}


        var basicLineChart = {
          drawBasicLineChart: function (id, data) {
                var cfg = {

					padding :data.padding	,
					yAxisfactor : data.yAxisfactor,
					yLabelColor:data.yLabelColor,
					xAxisfactor : data.xAxisfactor,
					xLabelColor:data.xLabelColor
                };
				
				
				/*
                if ('undefined' !== typeof options) {
                    for (var i in options) {
                        if ('undefined' !== typeof options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }
				*/
				var xScaleTicksArray=data.xAxisTickArray;
				
				var margin = {
                    top: 30,
                    right: 30,
                    bottom: 40,
                    left: 100
                };
                width = width - margin.left - margin.right,
                height = height - margin.top - margin.bottom;


                var maxValue = 0;
                var currMaxValue;
                var actualData = data.yAxisData;

                for (i = 0; i < actualData.length; i++) {
                    currMaxValue = d3.max(actualData[i].data, function (d,k) {
									d["xVal"]=xScaleTicksArray[k];
					
									d["timeIndex"]=k;
									d["shape"]=actualData[i].shape;
                        return d;
                    });

                    if (currMaxValue > maxValue){
						maxValue = currMaxValue;
					}
					
					actualData[i].legendName="legend-"+i;	
					
                }
				
				var maxXScale = xScaleTicksArray.length;//d3.max(data, function(d, i){return data[i].Values.length;});
				
                var x = d3.scale.linear().domain([0, (maxXScale)]).range([width*0.02, width]),
                    y = d3.scale.linear().domain([0, 1.5 * maxValue]).range([height, 0]);
        	
				xAxis = d3.svg.axis()
							  .scale(x)
							  .orient("bottom");
	
                yAxis = d3.svg.axis().scale(y).ticks(10).orient("left");

                var factor = cfg.yAxisfactor;
                var svg = svgElement.append("g")
						  .attr("transform", "translate(" + (width*0.06) + "," + 0 + ")");
						  
                gridManager.init(svg, height, width, margin.left, margin.top);


				var line = d3.svg.line()
                    .x(function (d, i) {
                    return x(i);
                })
                    .y(function (d) {
                    return y(d);
                }).interpolate("cardinal");

                var rectOrder = d3.svg.line()
                    .x(function (d, i) {
                    return x(i) - 3;
                })
                .y(function (d) {
                    return y(d) - 3;
                }).interpolate("cardinal");

                var triangleOrder = d3.svg.line()
                    .x(function (d, i) {
                    return x(i) - 3;
                })
                    .y(function (d) {
                    return y(d) - 3;
                }).interpolate("cardinal");

                var area = d3.svg.area()
                    .x(line.x())
                    .y1(line.y())
                    .y0(y(0));


                for (iVal = 0; iVal < actualData.length; iVal++) {
					
					drawLineWithShape(svg, actualData[iVal], actualData[iVal].color, actualData[iVal].Name);
					
                }

                function drawLineWithShape(svg, data, color, name) {

                    if (data.Shape == 'circle') {
						drawCircle(svg, data, color, data.legendName);
					}
					else if (data.Shape == 'square') {

                        drawSquare(svg, data, color, data.legendName);
                    } else {

                        drawTriangle(svg, data, color,data.legendName);
                    }
					
                }


                function drawCircle(svg, data, color, name) {
                    var circleData = [data.data];
					
					var aLineContainer = svg.selectAll("svg")
                        .data(circleData)
                        .enter().append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                    var path = aLineContainer.append("path")
                        .attr("class", name + "line" +" "+data.legendName)
                        .attr("d", line)
                        .attr("fill", "none")
                        .style("stroke", color);


                    var lineLen = path.node().getTotalLength();

                    path.attr("stroke-dasharray",
                    lineLen + ", " + lineLen)
                        .attr("stroke-dashoffset", lineLen);

                    path.transition()
                        .duration(2000)
                        .attr("stroke-dashoffset", 0);

                    aLineContainer.selectAll("." + name + "dot")
                        .data(function (d, i) {
                        return d;
                    })
                        .enter()
                        .append("circle")
                        .on("mouseover", function (d, i) {

						d3.select(this)
						.attr('stroke','white')
						.attr('stroke-width','2px');
						
						
						var yHeadingValueMap=[{"headingName":data.Name,"headingVal":d}];
						
						toolTipManager.showToolTip(d3.event, d["yVal"],(xScaleTicksArray[i]), false,yHeadingValueMap);
                    })
                        .on("mouseout", function (d, i) {
							
						d3.select(this)
						.attr('stroke','white')
						.attr('stroke-width','0px');
                        var targetElement = d3.select(this);


                        toolTipManager.hideTooTip();
                    })
                        .attr("class", name + "dot circle")
                        .attr('x', 0)
                        .attr("cx", function (d, i) {

                        return 0;
                    })
                        .attr("cy", function (d, i) {

                        return 0;
                    })
                        .attr('y', 0)
                        .transition()
                        .duration(2000)
                        .attr("cx", line.x())
                        .attr("cy", line.y())
                        .attr("r", 3.0)
                        .attr("fill", color);

                }

                function drawSquare(svg, data, color, name) {

                    var data2 = [data.data];

                    var aLineContainer = svg.
                    selectAll("svg")
                        .data(data2)
                        .enter().append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                    var path = aLineContainer.append("path")
                        .attr("class", function (d) {
                        return name + "line" +" "+data.legendName;
                    })
                        .attr("d", line)
                        .attr("fill", "none")
                        .style("stroke", color);


                    var lineLen = path.node().getTotalLength();

                    path.attr("stroke-dasharray",
                    lineLen + ", " + lineLen)
                        .attr("stroke-dashoffset", lineLen);

                    path.transition()
                        .duration(2000)
                        .attr("stroke-dashoffset", 0);

                    aLineContainer.selectAll("." + name + "dot")
                        .data(function (d, i) {
                        return d;
                    })
                        .enter()
                        .append("rect")
                        .on("mouseover", function (d, i) {

						d3.select(this)
						.attr('stroke','white')
						.attr('stroke-width','2px');

                        //toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, name + " :- " + d);
						
						var yHeadingValueMap=[{"headingName":data.Name,"headingVal":d}];
						toolTipManager.showToolTip(d3.event, d["yVal"],((xScaleTicksArray[i])), false,yHeadingValueMap);	
                    })
                        .on("mouseout", function (d, i) {


						d3.select(this)
						.attr('stroke','white')
						.attr('stroke-width','0px');

                        toolTipManager.hideTooTip();
                    })
                        .attr("class", name + "dot square")
                        .attr('x', 0)
                        .attr("width", function (d, i) {

                        return 0;
                    })
                        .attr("height", function (d, i) {

                        return 0;
                    })
                        .attr('y', 0)
                        .transition()
                        .duration(2000)
                        .attr("x", rectOrder.x())
                        .attr("y", rectOrder.y())
                        .attr("width", 6)
                        .attr("height", 6)
                        .attr("fill", color);

                }

                function drawTriangle(svg, data, color, name) {
                    var triangleData = [data.data];

                    var aLineContainer = svg.
                    selectAll("svg")
                        .data(triangleData)
                        .enter().append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                    var path = aLineContainer.append("path")
                        .attr("class", name + "line" +" "+data.legendName)
                        .attr("d", line)
                        .attr("fill", "none")
                        .style("stroke", color);

                    var lineLen = path.node().getTotalLength();

                    path.attr("stroke-dasharray",
                    lineLen + ", " + lineLen)
                        .attr("stroke-dashoffset", lineLen);

                    path.transition()
                        .duration(2000)
                        .attr("stroke-dashoffset", 0);

                    aLineContainer.selectAll(name + "dot")
                        .data(function (d, i) {
                        return d;
                    })
                        .enter()
                        .append("path")
						.on("mouseover", function (d, i) {

						d3.select(this)
						.attr('stroke','white')
						.attr('stroke-width','2px');

						var yHeadingValueMap=[{"headingName":data.Name,"headingVal":d}];
						toolTipManager.showToolTip(d3.event, d["yVal"],(xScaleTicksArray[i]), false,yHeadingValueMap);	
                        //toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, name + " :- " + d);
                    })
                        .on("mouseout", function (d, i) {

						
						d3.select(this)
						.attr('stroke','white')
						.attr('stroke-width','0px');

                        var targetElement = d3.select(this);


                        toolTipManager.hideTooTip();
                    })
                        .attr("class", name + "dot triangle")
                        .attr('x', 0)
                        .attr("width", function (d, i) {

                        return 0;
                    })
                        .attr("height", function (d, i) {

                        return 0;
                    })
                        .attr('y', 0)
                        .transition()
                        .duration(2000)
                        .attr("d", d3.svg.symbol().type("triangle-up"))
                        .attr("transform", function (d, i) {
                        return "translate(" + x(i) + "," + y(d) + ")";
                    })
                        .attr("fill", color);


                }

                function getValueFromArray(data) {
                    var dataSet = [];

                    for (i = 0; i < data.length; i++) {
                        dataSet.push(data[i].value);
                    }

                    return dataSet;
                }


                var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("width", width)
                    .attr("height", height)
                    .attr('transform', 'translate(' + width / actualData.length + ',50)');
				
				
				var legendHeight=10,legendWidth=10;
				var legendNameArray=[];
				for(var i=0;i<actualData.length;i++){
					legendNameArray.push(actualData[i].Name);
				}
				var legendPositionArray=legendController.getLegendPositionArray(legendNameArray,(width*0.98),height);
				
                legend.selectAll('rect')
                    .data(actualData)
                    .enter()
                    .append("rect")
                    .attr("x", function (d, i) {
						//return i * ((100 / 500) * width);
						return legendPositionArray[i].x;
                })
                    .attr("y",function(d,i){
						return legendPositionArray[i].y;
					})
                    .attr("width",legendWidth)
                    .attr("height",legendHeight)
                    .style("fill", function (d, i) {
                    return d.color;
                })
                    .on("click", function (d) {
                    var state = d3.selectAll("." +d.legendName+"dot").style("display");
                    if (state == "none") {

                        var selectedPath = svgElement.selectAll("." + d.legendName + "line");
                        selectedPath.transition()
                            .duration(1000)
                            .ease("linear")
                            .attr("stroke-dashoffset", 0);
                        d3.selectAll("." + d.legendName+"dot."+d.Shape).style("display", "block");
						console.log(d.legendName+"dot"+d.Shape);
						d3.select("#" + d.legendName + "text").style("text-decoration", "none");
                    } else {


                        var selectedPath = svgElement.selectAll("." + d.legendName + "line");
                        var lineLen = selectedPath.node().getTotalLength();
                        selectedPath.transition()
                            .duration(1000)
                            .ease("linear")
                            .attr("stroke-dashoffset", lineLen);
							
							
                        d3.selectAll("." + d.legendName+"dot."+d.Shape).style("display", "none");
						console.log(d.legendName+"dot"+d.Shape);
						
                        d3.select("#" + d.legendName + "text").style("text-decoration", "line-through");
                    }


                });
				
				
                legend.selectAll('text')
                    .data(actualData)
                    .enter()
                    .append("text")

                    .attr('id', function (d) {
                    return d.legendName + "text";
                })
                    .attr("x", function (d, i) {
						//return i * ((100 / 500) * width);
						return legendPositionArray[i].textPos;
                })
                    .attr("y",function(d,i){
						return legendPositionArray[i].y+legendHeight/2;
					})
                    .attr("width", (15 / 500) * width)
                    .attr("height", (15 / 500) * height)
                    .attr("font-size", (12 / 500) * (width + height) / 2)
                    //.attr("dx", "1.50em")
                    .attr("dy", ".50em")
                    .text(function (d, i) {
                    return d.Name;
                });
				
				
				var largestStringLngth=((xScaleTicksArray[0].toString()).length);
				for(var charCountr=0;charCountr<xScaleTicksArray.length;charCountr++){
					var currentStringLngth=(xScaleTicksArray[charCountr].toString()).length;
					
					if(largestStringLngth<currentStringLngth){
							largestStringLngth=currentStringLngth;
					}
				}
				
				
				var xAxisTickArr=tickController.getXTickArray(0,(xScaleTicksArray.length),largestStringLngth, (width-width*0.02));
				xAxis.tickValues(xAxisTickArr);
				
                var xAxisEle = svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top) + ")")
                    .call(xAxis);
					
				xAxisEle.selectAll("text")
					.text(function(d,i){
						var xTextVal="";
						//retrived text index
						
						xTextVal=xScaleTicksArray[d];
						return xTextVal;
					});
					
				var yAxisElem = svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(yAxis);
					
                var yLabelTop = ((height / 2) + (cfg.yAxisfactor.length / 2) * 5);
                var yLabelLeft = margin.left * .20 - margin.left;
				/*
                yAxisElem.append("text")
                    .text(function () {
                    return cfg.yAxisfactor + " ";
                })
                    .style('font-style', 'italic')
                    .attr('transform', "translate(" + (yLabelLeft) + "," + (yLabelTop) + ") rotate(-90)")
                    .style('fill', cfg.yLabelColor);
				*/
				
				axisLabelController.appendLabel(cfg.yAxisfactor,yLabelLeft,yLabelTop,-90,yAxisElem,textStyleConfg.yLabelColor,600);
				
                var xLabelTop = margin.top + 5;
                var xLabelLeft = ((width / 2) - (cfg.xAxisfactor.length / 2) * 5);
				/*
                xAxisEle.append("text")
                    .text(function () {
                    return cfg.xAxisfactor + " ";
                })
                    .style('font-style', 'italic')
                    .attr('transform', "translate(" + (xLabelLeft) + "," + (xLabelTop) + ") ")
                    .style('fill', cfg.xLabelColor);
				*/	
					
				axisLabelController.appendLabel(cfg.xAxisfactor,xLabelLeft,xLabelTop,0,xAxisEle,textStyleConfg.xLabelColor,600);	
				
				//hide all axis path
				hideAxisPath(svgElement);
					
				//set font here
				
				setTextStyleAndSvgBackGround(svgElement);
				
            }
        };
		
		
		
		var stackedAreaChart = {
            drawStackedAreaChart: function (id, stackedAreaData, options) {
                var cfg = {
                    topMargin: 5,
                    rightMargin: 30,
                    bottomMargin: 0,
                    leftMargin: 10,
                    color: d3.scale.category20(),
					yAxisTootltipLabel:"Cost(in Crores): "
                };

                if ('undefined' !== typeof options) {
                    for (var i in options) {
                        if ('undefined' !== typeof options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }

            
			var data =  stackedAreaData;
			
			var margin = {top: 20, right: 30, bottom: 30, left: 40};
				width = width - margin.left - margin.right,
				height = height - margin.top - margin.bottom;

			var x = d3.scale.ordinal()
				.rangePoints([0, width]);

			var y = d3.scale.linear()
				.range([height, 0]);

			var z = d3.scale.category20();

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");
			var stack = d3.layout.stack().offset("zero")
				.values(function(d) { return d.values; })
				.x(function(d) { return d; })
				.y(function(d) { return d.y; });

			var nest = d3.nest()
			.key(function(d) {return d.name; })		

			var area = d3.svg.area()
				//.interpolate("monotone")
				.x(function(d) { return x(d.category); })
				   .y0(function(d) { return y(d.y0); })
				.y1(function(d) { return y(d.y0 + d.y); });

			var svg = svgElement.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				data.forEach(function(d) {
					d.value = +d.value;
				});

			var layers = stack(nest.entries(data));
				

			var a = function(d, i) { return d[i].category; };


			x.domain(['Dec','Jan','Feb']);
			   
			y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

			var svgE = svg.selectAll(".layer")
				  .data(layers)
				  .enter().append("g");
				  
			
			//svg.selectAll(".layer")
				//  .data(layers)
				 // .enter()
			svgE.append("path")
				  .attr("class", "area")
				  .attr("d", function(d) { return area(d.values); })
				  .style("fill", function(d, i) { return "white";  })
				  .on("mouseover", function (d,i) {
						
                        //toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, cfg.yAxisTootltipLabel + "  " + d.values[0].y + "   Name : " + d.values[0].name);
						var yHeadingValueMap=[{"headingName":cfg.yAxisTootltipLabel+" "+d.values[0].name,"headingVal":d.values[0].y}];
						
						toolTipManager.showToolTip(d3.event,"",(cfg.xLabel), false,yHeadingValueMap);
                    })
                  .on('mouseout', function (d) {

                        toolTipManager.hideTooTip();
                    })
				  .transition().delay(function(d, i) {
					return i * 500;
						})
				  .ease("back")
				  .style("fill", function(d, i) { return z(i); });
			   

			svgE.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  .transition().duration(2000)
				  .call(xAxis);
				  

			svgE.append("g")
				  .attr("class", "y axis")
				  .transition().duration(2000)
				  .call(yAxis);
				  
			//hide all axis path
			hideAxisPath(svgElement);
				
			//set font here
			
			setTextStyleAndSvgBackGround(svgElement);
					  
			        
			}
		}
		
		
		var funnelChart={
			drawFunnelChart:function(data){
				
				var funnelData = data.funnelData;
				var funnelKey = data.funnelKey;
				var colorArray = data.colorArray;
				var unit=data.unit;
				var label=data.label;
				
				var FunnelAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.15,top:height*0.1,chartSeparator:10,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
				var scaleWidth=width-FunnelAnalChart.left-FunnelAnalChart.right;
				var scaleHeight=height-FunnelAnalChart.top-FunnelAnalChart.bottom;
					
				
				var funnelChartMainGroup = svgElement.append("g")
								   .attr('class','main-group')
								   .attr("transform", "translate(" + FunnelAnalChart.left + "," + FunnelAnalChart.top + ")")

				var funnelClosedPath = d3.svg.line()
										 .x(function(d,i) {return funnelPathXCoordinate[i]; })
										 .y(function(d,i) {return funnelPathYCoordinate[i]; })                         
										 .interpolate("basis-closed");
						 
				var funnelPath = d3.svg.line()
									 .x(function(d,i) {return funnelPathXCoordinate[i]; })
									 .y(function(d,i) {return funnelPathYCoordinate[i]; }) 									 
						//			 .interpolate("basis-closed");
						
				var transitionPath = d3.svg.line()
									 .x(function(d,i) {return transitionXData[i]; })
									 .y(function(d,i) {return transitionYData[i]; }) 

				var funnelLowerClosedPath = d3.svg.line()
									 .x(function(d,i) {return funnelXCoordinateOfBelowPath[i]; })
									 .y(function(d,i) {return funnelYCoordinateOfBelowPath[i]; }) 
									 .interpolate("basis-closed");
			 
var transitionXData = [scaleWidth/2,scaleWidth/2,scaleWidth/2,scaleWidth/2];
var transitionYData = [scaleHeight+40,scaleHeight+40,scaleHeight+40,scaleHeight+40];
var ProductSum = 0;
var heightOfProduct = 0;
var rectXPosition; 
var rectYPosition;
var rectWidth; 
var funnelPathXCoordinate = [];
var funnelPathYCoordinate = [];

var funnelXCoordinateOfBelowPath = [];
var funnelYCoordinateOfBelowPath = [];
var scaleWidthForFunnel = (scaleWidth*.6);
var x1 = ((scaleWidth/2)-(scaleWidthForFunnel/2));
var y1 = 0;
var x4;
for(var i = 0 ; i<funnelData.length; i++)
{
	ProductSum = ProductSum + funnelData[i];
}
var scaleHeightWithSeparator = (scaleHeight+(funnelData.length*FunnelAnalChart.chartSeparator));
var rad = (scaleHeightWithSeparator/(scaleWidthForFunnel/2));
var degree = Math.atan(rad) * (180 / Math.PI);		

var angleValue = Math.tan(toRadians(degree));

function toRadians (angle) 
{
  return angle * (Math.PI / 180);
}			

var JsonXArray = {};
var JsonYArray = {};				
for(var index = 0 ; index<funnelData.length; index++)
{
	
	funnelPathXCoordinate = [];      
	funnelPathYCoordinate = []; 
	funnelXCoordinateOfBelowPath = [];
	funnelYCoordinateOfBelowPath = [];
	heightOfProduct = (funnelData[index]/ProductSum);
  
	var x2;
	 if(index!=funnelData.length-1)
	 {
		x2 = Math.abs(((scaleHeightWithSeparator*heightOfProduct)/angleValue));
	 }
	 else
	 {
		x2 = Math.abs(((scaleHeightWithSeparator*heightOfProduct)/2)/angleValue);
	 }
	 x4 = (((scaleWidth/2)-x1)*2)+x1;
	 
	 //set Coordinate of linear path
	 funnelPathXCoordinate.push(x1);
	 funnelPathXCoordinate.push(x1+x2);
	 funnelPathXCoordinate.push(x4-(funnelPathXCoordinate[1]-x1));
	 funnelPathXCoordinate.push(x4); 
	 
	 funnelPathYCoordinate.push(y1);
	 if(index!=funnelData.length-1)
	 {
		funnelPathYCoordinate.push(y1+(scaleHeight*heightOfProduct));
		funnelPathYCoordinate.push(y1+(scaleHeight*heightOfProduct));
	 }
	 else
	 {
		funnelPathYCoordinate.push(y1+((scaleHeight*heightOfProduct)/2));
		funnelPathYCoordinate.push(y1+((scaleHeight*heightOfProduct)/2));
	 }
	 funnelPathYCoordinate.push(y1);
	 
	 funnelChartMainGroup.append("linearGradient")				
        .attr("id", "gradient")			
        .attr("gradientUnits", "userSpaceOnUse")	
        .attr("x1",funnelPathXCoordinate[0])
		.attr("y1",funnelPathYCoordinate[0])			
        .attr("x2",funnelPathXCoordinate[3])
		.attr("y2", funnelPathYCoordinate[2])		
        .selectAll("stop")						
        .data([								
            {offset: "15%", color: colorArray[index]},		
        //    {offset: "40%", color: colorArrayLinearPath[index]},	
       //     {offset: "40%", color: "#ffffff"},		
            {offset: "62%", color: "#eaeaea"},		
       //     {offset: "62%", color: colorArrayLinearPath[index]},	
            {offset: "85%", color: colorArray[index]}	
        ])					
		.enter().append("stop")			
        .attr("offset", function(d) { return d.offset; })	
        .attr("stop-color", function(d) { return d.color; });

	 var lineGraph1 = funnelChartMainGroup.selectAll(".path")
						 .data([transitionXData])
						 .enter()   
						 .append("path")
						 .attr("d", transitionPath)
						 .attr("value",index)
						 .attr("stroke-width", 1)
						 .attr("fill","url(#gradient)")
						 .on("mouseover",function(){
							 
							   var keyIndex = d3.select(this).attr('value');
							   var sum = 0;
							   for(var index = 0;index<funnelData.length;index++)
							   {
								sum = sum + funnelData[index];
							   }
							   var percentage = Math.round(((funnelData[keyIndex])/sum)*100);
							   var yHeadingValueMap=[{"headingName":label,"headingVal":percentage + " " +unit}];
								  
							    toolTipManager.showToolTip(d3.event,"",(funnelKey[keyIndex]), false,yHeadingValueMap,d3.event.pageY*.90); 
						   })
						  .on("mouseleave",function(){
								  toolTipManager.hideTooTip();
						   });
						   
		lineGraph1.transition().duration(1000).ease("linear")
						 .attr("d", funnelPath(funnelPathXCoordinate))
						  
						 
						 
	// set horizontal Line here
		funnelChartMainGroup.append('line')
							.attr('class','horizontalLine')
							.attr('x1',function(){return ((funnelPathXCoordinate[3]+funnelPathXCoordinate[2])/2)+5})
							.attr('y1',function(){
							if(index!=funnelData.length-1)
							{return ((funnelPathYCoordinate[3]+funnelPathYCoordinate[2])/2)}
							else
							{
								return funnelPathYCoordinate[2];
							}})
							.attr('x2',function(){return ((scaleWidth/2)+(scaleWidthForFunnel/2))})
							.attr('y2',function(){
							if(index!=funnelData.length-1)
							{return ((funnelPathYCoordinate[3]+funnelPathYCoordinate[2])/2)}
							else
							{
								return funnelPathYCoordinate[2];
							}})
							.style("stroke","gray");
		
	// set text here
	 funnelChartMainGroup.append('text')
							.attr('class','text')
							.attr('x',function(){return ((scaleWidth/2)+(scaleWidthForFunnel/2))+5})
							.attr('y',function(){
							if(index!=funnelData.length-1)
							{return ((funnelPathYCoordinate[3]+funnelPathYCoordinate[2])/2)+3}
							else
							{
								return funnelPathYCoordinate[2]+3;
							}})
							.text(funnelKey[index])
							.attr("fill","gray")
							.style("font-family","calibri");
							
	x1 = funnelPathXCoordinate[1]+2;  
	y1 = funnelPathYCoordinate[1]+FunnelAnalChart.chartSeparator;
	
	//set cordinate for lower closed path
	funnelXCoordinateOfBelowPath[0] = funnelPathXCoordinate[1];
	funnelXCoordinateOfBelowPath[2] = funnelPathXCoordinate[2]; 
	funnelXCoordinateOfBelowPath[1] = (funnelPathXCoordinate[1] + funnelPathXCoordinate[2])/2;
	funnelXCoordinateOfBelowPath[3]= funnelXCoordinateOfBelowPath[1];
	var closedPathSharinkValue1 = (funnelXCoordinateOfBelowPath[1]-funnelXCoordinateOfBelowPath[0])/2;
	funnelXCoordinateOfBelowPath[0] = funnelXCoordinateOfBelowPath[0] - closedPathSharinkValue1;
	funnelXCoordinateOfBelowPath[2] = funnelXCoordinateOfBelowPath[2] + closedPathSharinkValue1;
	
	funnelYCoordinateOfBelowPath[0] = funnelPathYCoordinate[1];
	funnelYCoordinateOfBelowPath[1] = funnelYCoordinateOfBelowPath[0]-10;
	funnelYCoordinateOfBelowPath[2] = funnelPathYCoordinate[1];
	funnelYCoordinateOfBelowPath[3] = funnelYCoordinateOfBelowPath[0]+10;
	
	//store Value of Lower closed path
	JsonXArray[index] = funnelXCoordinateOfBelowPath;
	JsonYArray[index] = funnelYCoordinateOfBelowPath;

	rectXPosition = funnelPathXCoordinate[1];
	rectYPosition = funnelPathYCoordinate[1]
	rectWidth = funnelPathXCoordinate[2]-funnelPathXCoordinate[1];
	//set cordinate for upper closed path
	funnelPathXCoordinate[2] = funnelPathXCoordinate[3];
	funnelPathXCoordinate[1] = (funnelPathXCoordinate[0] + funnelPathXCoordinate[2])/2;  
	funnelPathXCoordinate[3] = funnelPathXCoordinate[1];
	var closedPathSharinkValue2 = (funnelPathXCoordinate[1]-funnelPathXCoordinate[0])/2;
	funnelPathXCoordinate[0] = funnelPathXCoordinate[0] - closedPathSharinkValue2;
	funnelPathXCoordinate[2] = funnelPathXCoordinate[2] + closedPathSharinkValue2;
	
	funnelPathYCoordinate[1] = funnelPathYCoordinate[0]-10;
	funnelPathYCoordinate[2] = funnelPathYCoordinate[0];
	funnelPathYCoordinate[3] = funnelPathYCoordinate[0]+10; 

	var lineGraph3 = funnelChartMainGroup.selectAll(".path")
						 .data([funnelPathXCoordinate])
						 .enter()
						 .append("path")
						 .attr("d", funnelClosedPath)	  
						 .attr("stroke-width", 1)
						 .attr("fill", function(){return colorArray[index]});
//		lineGraph3.transition().duration(1000).ease("linear")
	//					 .attr("d", funnelClosedPath(funnelPathXCoordinate));			
	 

	 
}

for(var index = 0;index<funnelData.length;index++)
{
	funnelXCoordinateOfBelowPath = JsonXArray[index];
	funnelYCoordinateOfBelowPath = JsonYArray[index];
	
 funnelChartMainGroup.append("linearGradient")				
        .attr("id", "gradient1")	
		.attr("gradientUnits", "userSpaceOnUse")	
        .attr("x1",funnelXCoordinateOfBelowPath[0])
		.attr("y1",funnelYCoordinateOfBelowPath[1])			
        .attr("x2",funnelXCoordinateOfBelowPath[2])
		.attr("y2", funnelYCoordinateOfBelowPath[3])		
        .selectAll("stop")						
        .data([								
            {offset: "15%", color: colorArray[index]},		
        //    {offset: "40%", color: colorArrayLinearPath[index]},	
       //     {offset: "40%", color: "#ffffff"},		
            {offset: "62%", color: "#eaeaea"},		
       //     {offset: "62%", color: colorArrayLinearPath[index]},	
            {offset: "85%", color: colorArray[index]}	
        ])					
		.enter().append("stop")			
        .attr("offset", function(d) { return d.offset; })	
        .attr("stop-color", function(d) { return d.color; });
	
	if(index!=funnelData.length-1)
	{
		var lineGraph2 = funnelChartMainGroup.selectAll(".path")
						 .data([funnelXCoordinateOfBelowPath])
						 .enter()
						 .append("path")
						 .attr("d", funnelLowerClosedPath)	  
						 .attr("stroke-width", 0)
						 .attr("fill","url(#gradient1)");
					//	 .attr("fill", function(){return colorArrayLinearPath[index]})
					//	 .attr("opacity",0.8);
	}
}

					funnelChartMainGroup.append('rect')
										.attr('x',rectXPosition)
										.attr('y',rectYPosition)
										.attr('width',rectWidth)
										.attr('height',((scaleHeightWithSeparator*heightOfProduct)/2))
										.attr('fill',colorArray[index-1])
				}

		}
		
		
		
		var drawGauageGraph={
			gaugeGraph:function(options){
			
				var	options=$.extend({
								'color': 'url(#gradient123)',
								'axisColor':'blue',
								'dataA':[],
								
							}, options);
				
				//appendToolTip();
				//data = dataA;
				var elementId=$(selectorElement).attr("id");
				var className=elementId+"_gauge";
				
				var tempData;
				if(options.dataA.length == 0 ){
					tempData=chartData;
				}else{
					tempData=options.dataA;
				}
				
				var maxSpeedValue=tempData[0].maxSpeedVal;
				
				var speedVal=tempData[0].speedVal;
				
				var differenceLeft=maxSpeedValue-speedVal;
				
				var data=[{"label":speedVal,"value":speedVal},{"label":differenceLeft,"value":differenceLeft}];
				
				
				var pi = Math.PI;
				var r=width*0.25;
				var ir=r/2;
				
				var color = d3.scale.category20c();     
				
				var centerChartDim=(width/2);
				var vis=svgElement.append("svg:g")
				.attr("class","pie")	
				.attr("transform", "translate(" + centerChartDim + "," + width*0.3 + ")")    
				
				var arc = d3.svg.arc()              
					.outerRadius(r)
					.innerRadius(ir);
			 
				var pie = d3.layout.pie() 
					.sort(null)
					.value(function(d) { return d.value; })
					.startAngle(-90 * (pi/180))
					.endAngle(90 * (pi/180));
			 
				var arcs = vis.selectAll("g.slice")     
					.data(pie(data))                          
					.enter()                            
					.append("svg:g")                
					.attr("class", "slice")
					
					arcs.append("svg:path")
							.attr("fill", function(d, i) {
								if(i == 0){
									return "yellow"
								}else{
									return "grey";
								}
							} ) 
							.attr("d", arc).on('mouseover',function(d){
								var hideXValue=true;
								console.log(JSON.stringify(d));
								//toolTipManager.showToolTip(d3.event, d["yVal"], d["xVal"], false, "" + "  " + d.value);
							})
							.on('mouseleave',function(){
								//toolTipManager.hideTooTip();
							});    
					                                    
					
					arcs.append("svg:text")                                     
							.attr("transform", function(d) {                    

							return "translate(" + arc.centroid(d) + ")";        
						})
						.attr("text-anchor", "middle")                          
						.text(function(d, i) {
							return data[i].label;
						});
				
				function findCharacterWidth(word){
						return ((word.length*18)/2);
				}
				
				vis.append("svg:text")
						 .attr("x",function(){
							options.arcStartIndLabel.length
							var widthOfLabel=findCharacterWidth(options.arcStartIndLabel);
							return (-(.35)*((width/2)+widthOfLabel));
						 })
						 .attr("y",20)
						 .attr("text-anchor","start")
						 .text(options.arcStartIndLabel);
						 /*
						 .attr("transform", function(d) {                    

							return "translate(" + arc.centroid(d) + ")";        
						  });
						 */
                 
				vis.append("svg:text")
                        .attr("x",0)
						.attr("y",20)
						.attr("text-anchor","middle")
						 .text(options.arcMiddleIndLabel);
						 
                 vis.append("svg:text")
                         .attr("x",function(){
							var widthOfLabel=findCharacterWidth(options.arcEndIndLabel);
							return ((.35)*((r*2)+widthOfLabel));
						 })
						 .attr("y",20)
                         .attr("text-anchor","end")
                         .text(options.arcEndIndLabel);
                         
                //set font here
				/*
					setTextStyleAndSvgBackGround(svgElement);
				*/	 
			}
		
		}	
		
		
		var redrawAreaChart=false;
		var drawAreaChart={
			areaChart:function(options){
				var	options=$.extend({
								'color': 'url(#gradient123)',
								'axisColor':'blue',
								'data':[],
								'attachBrushEvent':false,
								'xAxisIndicationLabel':'',
								'yAxisIndicationLabel':'',
								'xFieldName':'',
								'yFieldName':'',
								
							}, options);
			data=options.data;
			
			
			if(d3.select(".resetAreaBtn").empty()){
					
				var resetBtnWidth=70;
				var resetBtnHeight=30;
				var resetBtnGrouping=d3.select("#"+selectedElementId).append("div")
									  .style("left",(width*0.8))
									  .style("top",(height*0.1))
									  .attr("class",'resetAreaBtn')
									  .on("mouseover",function(){
										d3.select('.resetAreaBtn').style("background",'#7F7FFF');
									  })
									  .on("mouseout",function(){
										d3.select(this).style("background",'blue');
									  })
									  .style("width",resetBtnWidth)
									  .style("height",resetBtnHeight)
									  .style('background','blue')
									  .style('display','inline-block')
									  .style("z-index","999")
									  .style("position","absolute")
									  .style("line-height",resetBtnHeight+"px")
									  .style("color","#FFFFFF")
									  .style("text-align","center")
									  .style("border-radius","3px")
									  .style("cursor","pointer");
									  
				resetBtnGrouping.html("Reset");
				/*
									  resetBtnGrouping.append("rect")
									  .attr("width",reesetBtnWidth)
									  .attr("height",reesetBtnHeight)
									  .attr("x","0")
									  .attr("y","0")
									  .attr("rx","2")
									  .attr("ry","2")
									  */
									  
				/*					  
				resetBtnGrouping.append("text")
								.attr("x",20)
								.attr("y",reesetBtnHeight/2)
								.attr("dy",'.35em')
								.attr("class","resetAreaBtn")
								.text("Reset")
								.attr("fill","white");
				*/
			}
			
				
			d3.selectAll(".resetAreaBtn")
			.on("click",function(){
				
				xScale.domain(d3.extent(chartData, function(d,i) {
								return i;
							}));
							
							redrawAreaChart=true;
							$(selectorElement).find('svg g').empty();
							$(selectorElement).find(".brushedArea").remove();
							drawAreaChart.areaChart({'xFieldName':xFieldName,'yFieldName':yFieldName,'axisColor':'#222222','attachBrushEvent':true,'xAxisIndicationLabel':options.xAxisIndicationLabel,'yAxisIndicationLabel':options.yAxisIndicationLabel,data:chartData});
							drawCircle.circleChart({'color':"black",'r':3,'data':chartData});
			});
				
			if(!redrawAreaChart){
				xFieldName=options.xFieldName;
				yFieldName=options.yFieldName;
				chartData=data;
				cfgArea=options;
				
				var marginSvg = 50;
				width = $(selectorElement).width() - marginSvg;
				height = $(selectorElement).height() - marginSvg;

				var selectorId = $(selectorElement).attr("id");

				var svgClassName = selectorId + "_svg";
			

				svgElement = svgElement;

				xScale = d3.scale.linear().range([0, (width - margin.scale)]);
				yScale = d3.scale.linear().range([(height - margin.scale), 0]);

				minYScale = d3.min(data, function (d) {
					return d[yFieldName];
				});
				maxYScale = d3.max(data, function (d) {
					return d[yFieldName];
				});


				maxYScale=maxYScale*1.5;
				
				xScale.domain(d3.extent(data, function (d, i) {
					return i;
				}));
				
				/*
				xScale(0,data.length-1);
				*/
				yScale.domain([minYScale,maxYScale]);

				xAxis = d3.svg.axis().scale(xScale)
					.orient("bottom");

				yAxis = d3.svg.axis().scale(yScale)
					.orient("right").ticks(4).tickSize(5, 0);

				svgElement = svgElement.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
					.attr("class","grouping");

			}
				
				xScale.range([margin.areaLeft,width-margin.scale]);
				if(options.data.length == 0 ){
					data=chartData;
				}else{
					data=options.data;
				}			
				var elementId=$(selectorElement).attr("id");
				var className=elementId+"_area";
				//var className="hii";
				var squareDimesion=20;
				var percentageFctor=35;
				var area = d3.svg.area()
				.x(function(d,i) { 
					//console.error("x xScale "+d[xFieldName]+" x "+xScale(parseDate.parse(d[xFieldName])));
					return xScale(i); })
				.y0((height-margin.scale))
				.y1(function(d) { 
					//console.error("x "+yScale(d[yFieldName]));
					return yScale(d[yFieldName]); });
				
				
				var gradient1 = svgElement.append("svg:defs")
				.append("svg:linearGradient")
				.attr("id", "gradient123")
				.attr("x1", "0%")
				.attr("y1",yScale(minYScale))
				.attr("x2", "100%")
				.attr("y2", yScale(maxYScale))
				.attr("gradientUnits", "userSpaceOnUse")
				.attr("gradientTransform","rotate(90)");
				
				var startColor="#dce9f6";
				
				gradient1
					.append("stop")
					.attr("offset", "0%")
					.attr("stop-color", startColor)
					
					
				gradient1
					.append("stop")
					.attr("offset", "0.25")
					.attr("stop-color", "#e0ecf7");
				gradient1
					.append("stop")
					.attr("offset", "0.5")
					.attr("stop-color", "#e6f0f9");

				gradient1
					.append("stop")
					.attr("offset", ".75")
					.attr("stop-color", "#ebf2f9");
				
				gradient1
					.append("stop")
					.attr("offset", "100%")
					.attr("stop-color", "#ecf3fa")
					
				
				
				 
				var areaPath=svgElement
					   .append("path")
					   .datum(data)
					   .attr("class",className)
					   .attr("d",area)
					   .attr("fill",options.color)
					   
					   .on("mousemove",function(d){
							
							/*
							d3.event.stopPropagation();
							var xVal=xScale.invert(d3.event.pageX-margin.scale);
							var year=xVal.getFullYear();
							var month=(xVal.getMonth()+1);
							var date=xVal.getDate();
							
							if(month <10){
								month="0"+month;
							}
							if(date<10){
								date="0"+date;
							}
							var xDateValue=year+"-"+month+"-"+date;
							var y=d3.event.pageY-$(selectorElement).find('svg').position().top;
							var yVal=  Math.floor(yScale.invert(y));
							console.log("show tool tip ");
							//attachToolTip.showToolTip(d3.event,yVal,xDateValue,undefined);
							//toolTipManager.showToolTip(d3.event, d["yVal"], d["xDateValue"], false, "Tooltip" + "  ");
							var yHeadingValueMap=[{"headingName":options.yAxisIndicationLabel,"headingVal":yVal}];
							
							toolTipManager.showToolTip(d3.event, "",(options.xAxisIndicationLabel +" "+xDateValue), false,yHeadingValueMap);
							*/
						})
						.on("mouseleave",function(){
							try{
								//toolTipManager.hideTooTip(d3.event);
							}catch(err){
							}
						});
				
					
				//areaPath.transition().duration(1000).attr("d",area);						
				/*
				var areaLine=d3.svg.line()
								.x(function(d){	
									return xScale(parseDate.parse(d[xFieldName]));
								})
								.y(function(d){
									return yScale(d[yFieldName]);
								})
								.interpolate("linear");
				*/				
				/*				
				//draw line
				svgElement.append("path")
						   .attr("class","area-line")
						   .attr("d",areaLine(data))
						   .attr("stroke","blue")
						   .attr("fill","none");
				*/
				var xAxisElem;
				var yAxisElem;
				
				/*
				var largestStringLngth=(data[0][xFieldName].length);
					for(var charCountr=0;charCountr<data.length;charCountr++){
						var currentStringLngth=data[charCountr][xFieldName].length;
						
						if(largestStringLngth<currentStringLngth){
								largestStringLngth=currentStringLngth;
						}
					}
				
					
				var xAxisTickArr=tickController.getXTickArray(0,(data.length),largestStringLngth, (width - margin.scale));
				xAxis.tickValues(xAxisTickArr)
				*/
				
				//var formatDate = d3.time.format("%d'%b ");
				//xAxis.tickFormat(formatDate)
				  var largestStringLngth=0;
				var xAxisTicks = [];
				for(var counter =0 ;counter<data.length;counter++)
				{
					xAxisTicks[counter] = data[counter][xFieldName];
					if(largestStringLngth<(xAxisTicks[counter].toString()).length)
					{
							largestStringLngth = (xAxisTicks[counter].toString()).length;
					}
				}
				
			xAxis.tickValues(tickController.getXTickArray(0,(xAxisTicks.length),largestStringLngth, (width - margin.scale)));
					
				if($(selectorElement).find(".axis").length == 0){	
					xAxisElem=svgElement.append("g")			// Add the X Axis
					.attr("class", "x axis")
					.attr("transform", "translate(0," + (height-margin.scale+7) + ")")
					.attr("stroke",options.axisColor)
					.attr("fill",'none')
					.call(xAxis);
					
					xAxisElem.selectAll("text")
					.text(function(d){
						return xAxisTicks[d];
					})
					.attr('fill','black');
					
					yAxis.orient("left");
					
					yAxisElem=svgElement.append("g")			// Add the X Axis
					.attr("class", "y axis")
					.attr("transform", "translate("+(margin.areaLeft)+"," + 3+ ")")
					.attr("stroke",options.axisColor)
					.attr("fill",'none')
					.call(yAxis);
					
					
					// title here
					axisLabelController.appendLabel(options.title,2*margin.areaLeft,(height*0.08),0,svgElement,textStyleConfg.titleColor,700);
					
					//xAxis label here	
					var pixcelPerChar = 6;				
					var totalXLabelPixcel=options.xAxisIndicationLabel.toString().length*pixcelPerChar;
					var xIndicationLabelTop=(height*0.13);
					var xIndicationLabelLeft=width/2-totalXLabelPixcel/2;
					axisLabelController.appendLabel(options.xAxisIndicationLabel,xIndicationLabelLeft,xIndicationLabelTop,0,xAxisElem,textStyleConfg.xLabelColor,600);
					//yAxis label here
					var totalYLabelPixcel=options.xAxisIndicationLabel.toString().length*pixcelPerChar;
					var yIndicationLabelTop=height/2+totalYLabelPixcel/2;
					var yIndicationLabelLeft=(-margin.areaLeft/1.3);
					axisLabelController.appendLabel(options.yAxisIndicationLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,yAxisElem,textStyleConfg.yLabelColor,600);
				
				}
				
				/*
				if(d3.select(".resetAreaBtn").empty()){
					
					var reesetBtnWidth=70;
					var reesetBtnHeight=30;
					
					var resetBtnGrouping=svgElement.append("g")
										  .attr("transform", "translate(" + (width-(margin.scale)) + "," + (margin.top) + ")" );
										  
										  resetBtnGrouping.append("rect")
										  .attr("width",reesetBtnWidth)
										  .attr("height",reesetBtnHeight)
										  .attr("x","0")
										  .attr("y","0")
										  .attr("rx","2")
										  .attr("ry","2")
										  .attr("class",'resetAreaBtn')
										  .on("mouseover",function(){
											d3.select('.resetAreaBtn').style("fill",'#7F7FFF');
										  })
										  .on("mouseout",function(){
											d3.select(this).style("fill",'blue');
										  })
										  .style('fill','blue')
										  .style('display','inline-block')
										  .style("z-index","999");
										  
					resetBtnGrouping.append("text")
									.attr("x",20)
									.attr("y",reesetBtnHeight/2)
									.attr("dy",'.35em')
									.attr("class","resetAreaBtn")
									.text("Reset")
									.attr("fill","white");
					
				}
				
				
				d3.selectAll(".resetAreaBtn")
				.on("click",function(){
					
					xScale.domain(d3.extent(chartData, function(d,i) {
									return parseDate.parse(d[xFieldName]);
								}));
								
								redrawAreaChart=true;
								$(selectorElement).find('svg g').empty();
								$(selectorElement).find(".brushedArea").remove();
								drawAreaChart.areaChart({'xFieldName':xFieldName,'yFieldName':yFieldName,'axisColor':'#222222','attachBrushEvent':true,'xAxisIndicationLabel':options.xAxisIndicationLabel,'yAxisIndicationLabel':options.yAxisIndicationLabel,data:chartData});
								drawCircle.circleChart({'color':"black",'r':3,'data':chartData});
				});
				*/
				
				brushingChart.drawBrushing(function(brushedData){
					
					redrawAreaChart=true;
					/*redraw graph */
					xScale.domain(d3.extent(brushedData, function(d,i) {
								return i;
							}));
					$(selectorElement).find('svg .grouping').empty();
					$(selectorElement).find(".brushedArea").remove();		
					
					drawAreaChart.areaChart({'axisColor':'#222222','attachBrushEvent':true,'data':brushedData,'xAxisIndicationLabel':options.xAxisIndicationLabel,'yAxisIndicationLabel':options.yAxisIndicationLabel});
					drawCircle.circleChart({'color':"black",'r':3,'data':brushedData});
				});
					
				//hide all axis path
				hideAxisPath(svgElement);
					
				//set font here
				/*
					setTextStyleAndSvgBackGround(svgElement);
				*/	
				
				//}
				
			}
		
		}
		
		
		
		
		var drawMeter={
		   image:'',
		   needle:'',
		   plot:'',
		   arc:'',
		   prevdata:90,
		   text:'',
			meterChartTest:function(selectorId,imageURL){
			  var svg = svgElement;//d3.select("#"+selectorId).append("svg")
			  //.attr("width", 300)
			  //.attr("height", 300);
			  //Path inner and outer radius is adjusted
			  
			  var radius=(width/3);
			  var ir=(radius/2);
			  
			  drawMeter.arc = d3.svg.arc()
			  .innerRadius(ir)
			  .outerRadius(radius)
			  .startAngle(120 * (Math.PI/180))
			  .endAngle(240 * (Math.PI/180));

			  

			  var plot = svg
			  .append("g")
			  .attr("class", "arc");
			
			  var imageElement=svg.append("g").attr("transform", "translate( "+ (width/2-radius)+" , "+ (height/4) +")");	
			  drawMeter.image =imageElement.append("svg:image")
			  .attr('x',0)
			  .attr('y',0)
			  .attr('width',(radius*2))
			  .attr('height',ir)
			  .attr("xlink:href","gauge_skin.jpg")
			  .attr("id", "fillImage")
			  //.on("click", turnNeedle);
			  
			  drawMeter.text = svg.append("svg:text")
							
								// .attr("transform","translate(340,360)")
								.attr("transform", "translate( "+ (0.5112*width)+" , "+ (0.8780*height) +")")
								.attr("text-anchor", "middle")
								.text("");
			  
			  console.log("height of meter: " + height);
			  console.log("width of meter " + width);
			  var lengthOfNeedle=ir/2;
			  var marginNeedle=margin.top+4;
			  
			  drawMeter.needle = imageElement
			  /*
			  .append("g")
			  .attr("class", "needle")
			  .attr("transform", "translate( "+ (width-(width/4)-(lengthOfNeedle))+" , "+ (-(height-height/4-ir+marginNeedle)) +")")*/
			  //.attr("transform", "translate( "+ (0.29*width)+" , "+ (height/4) +")")
			  .append("path")
			  .attr("class", "tri")
			  .attr("d", "M" + (lengthOfNeedle + 2) + " " + (120 + 10) + " L" + lengthOfNeedle + " 0 L" + (lengthOfNeedle - 3) + " " + (120 + 10) + " C" + (lengthOfNeedle - 3) + " " + (120 + 20) + " " + (lengthOfNeedle + 3) + " " + (120 + 20) + " " + (lengthOfNeedle + 3) + " " + (120 + 10) + " Z")
			  //.attr("transform", "rotate(-90, " + lengthOfNeedle + "," + (height + 10) + ")");
			  .attr("transform", "translate("+(radius-ir)+","+(ir)+") rotate(-90) ");
			},

			turnNeedle:function(data)
			{    
			  
			 if(data<0){
			   drawMeter.text
			   .transition()
			  .attr('stroke','red')
			  .text(data);
			 }
			 else{
				  drawMeter.text
				.transition()
			  .attr('stroke','green')
			  .text(data);
			 }
			 drawMeter.needle
			  .transition()
			  .duration(1000)
			  .attrTween("transform", tween);
			 var x = drawMeter.getAngleFromCoordinate(drawMeter.getCoordinateFromData(drawMeter.prevdata));
			 
			 var y = drawMeter.getAngleFromCoordinate(drawMeter.getCoordinateFromData(drawMeter.getPercentFromAngle(drawMeter.getAngleForProfitAndLoss(data))));       
			 
			 function tween(d, i, a) {
			  return d3.interpolateString("rotate("+ x +", 150, 130)", "rotate("+ y +", 150, 130)");
			 }
			
			 
			 
			},   

			getPercentFromAngle:function(data)
			{
			 if(data < 0 && data >= -180)
			  return -(data*5/9);
			 else 
			  return (data*5/9);
			},
			getAngleFromCoordinate:function(x)
			{
			 var angle = 0;
			 var intialSum = 90;
			 return angle+= intialSum * x;
			},

			 getCoordinateFromData:function(percent)
			{
			 var coodinate;
			   coordinate = ((percent/100) - (1-percent/100)) ;      
			 
			 return coordinate;    
			},
			 getRadianFromData:function(percent)
			{
			 var coodinate;
			   coordinate = percent / 57.2958;      
			 
			 return coordinate;    
			},

			 callTurnNeedle:function()
			{
				var x = (Math.random() * 100) ;

			  meterChart.turnNeedle(x);
			  meterChart.prevdata = x;
			},
			
			getAngleForProfitAndLoss:function(x)
			{
			 var angle;
			 
			 if(x > 0 && x <= 100)
			 {
			   angle = 90 + (0.9 * x); 
			 }
			 else{ 
			 
			   angle =  90 + (0.9 * x);
			 }
			 //console.log(angle);
			 return angle;    
			}
			
		}
		
		var threeDStackedBarChart = {
				drawThreeDStackedBarChart: function (id, heightOfBars, heightOfBarTwo, threeDStackedBarsData, options, colorArray,gridLineColor, textColor, xAxisArray) {
                
				var cfg = {
						topMargin: 5,
						rightMargin: 30,
						bottomMargin: 0,
						leftMargin: 10,
						color: d3.scale.category20(),
						toolTipLabelForYAxis: "Profit(in Crores)",
						axisTextColor:'black',
						legendTextColor:'black'
					};

					if ('undefined' !== typeof options) {
						for (var i in options) {
							if ('undefined' !== typeof options[i]) {
								cfg[i] = options[i];
							}
						}
					}		   
		
				var widthOfBars = (0.9 * width) / (threeDStackedBarsData[0].data.length* 2);
				var spacingFactorInBars = 10;
				var rightMargin = 140;
				var ySpacingFactor = 5;		
				var newXSpacingInBars = (0.3*width) / threeDStackedBarsData.length;
				spacingFactorInBars=widthOfBars*.6;		
				var newWidthOfBars = (width) / (threeDStackedBarsData[0].data.length* 2);
				widthOfBars = newWidthOfBars;
				
				var xSpacingInBars = newWidthOfBars + spacingFactorInBars;
				
				var maxArrayForBars = [];
				var sumOfMaxInEachBar = 0;
				var legendArray=[];
				var legendNameMap={};
				for(var k = 0 ; k < threeDStackedBarsData.length ; k++)
				{					
					var max = d3.max(threeDStackedBarsData[k].data, function(d,i){ return d;});
					sumOfMaxInEachBar = sumOfMaxInEachBar + max;
					maxArrayForBars.push(max);	
					legendArray.push(threeDStackedBarsData[k].key);	
					legendNameMap[threeDStackedBarsData[k].key]="legend-"+k;	
				}
				
				var maxHeight =sumOfMaxInEachBar;
				var leftBarMargin = 0;
				var leftMargins	= 30;
				var padding = 0;
				var bottomMargins = 0;
				var spacingInHorizontalLines = 40;
				
				var sum = 1;				
				for(k=0;k<(''+maxHeight).length - 1;k++)
				{
					sum = sum+"0";				
				}		
				
				var lineFunction = d3.svg.line()
										  .x(function(d) { return d.x; })
										  .y(function(d) { return d.y; })
										 .interpolate("linear");
				
				
				var threeDBarXRegion=(threeDStackedBarsData[0].data.length* xSpacingInBars) + widthOfBars/2;
				var xScale = d3.scale.linear()
						.domain([0, threeDStackedBarsData[0].data.length])
						.range([widthOfBars/1.5,threeDBarXRegion ]);
						
					


				var yScale = d3.scale.linear()
						.domain([0, 1.55 * maxHeight])
						.range([height - 0.15 *height, 0]);             
				 
				var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient("bottom")					
						.tickFormat(formatAsPercentage)
						.tickSize(0);

				var yAxis = d3.svg.axis()
						.scale(yScale)						
						.orient("left")
						.tickSize(0);;			
				
				var formatAsPercentage = d3.format("1");		
			
				var largestStringLngth=0;
					for(var counter =0 ;counter<xAxisArray.length;counter++)
					{
						if(largestStringLngth<(xAxisArray[counter].toString()).length)
						{
							largestStringLngth = (xAxisArray[counter].toString()).length;
						}
					}
		        xAxis.tickValues(tickController.getXTickArray(0,(xAxisArray.length),largestStringLngth, (threeDBarXRegion-widthOfBars/1.5)));	
				//xAxis.tickValues(d3.range(0, xAxisArray.length , 1));
				yAxis.tickValues(d3.range(0, 1.5* maxHeight, ((1.5* maxHeight)/10)));
				
				var maxYScale =	maxHeight + 100*(''+maxHeight).length;			
				var nextY = yScale(1.5*maxHeight);			
				
				var leftTranslation;
				if(width<400){
					leftTranslation=50;
				}else{
					leftTranslation=threeDBarXRegion*0.02;
				}
				svgElement=svgElement.append("g")
						  .attr("transform","translate("+leftTranslation+",0)");
				
				threeDBarXRegion=threeDBarXRegion+threeDBarXRegion*.1;	
				function drawHorizontalLines(startX, startY, widthOfBars, maxHeight, heightOfBars, nextY)
				{
					maxHeight = yScale(maxHeight);
					startY = yScale(startY);
					
					
					var scaleLine=[];				
							for(l=0; l<3; l++)
							{
								if(l==0)
								{
									
									x = startX-threeDBarXRegion*0.07;
									y = (startY-nextY) + 0.03 * width;
									
								}	
								else if(l==1)
								{
									x=startX-20;
									y=(startY-nextY);
								}
								else if(l==2)
								{
									x=threeDBarXRegion;
									y=(startY-nextY);														
								}
							
								scaleLine.push(JSON.parse('{"x":'+x+',"y":'+y+'}'));                      
							}
							return scaleLine;					
				}
				
				var startX= width  - width * 0.89;
				var startY= height - height * 0.90;					
				
				
				var svgContainer = svgElement.append("g")
											  .attr("transform","translate("+width*0.04+","+0+")")	;
				for(j=0;j<10;j++)
				{
				
					var lineGraph = svgContainer.append("path")
										.attr("d", lineFunction(drawHorizontalLines(startX, startY, widthOfBars, maxHeight, heightOfBars, nextY)))
										//.attr("stroke", "blue")
										.attr("stroke-width", 0.5)
										.attr("fill", "none");	
					
					var lineGraphLength= lineGraph.node().getTotalLength();

										lineGraph
										  .attr("stroke-dasharray", lineGraphLength + " " + lineGraphLength)
										  .attr("stroke-dashoffset", lineGraphLength)
										  .transition()
										  .duration(2000)
										  .ease("linear")
										  .attr("stroke-dashoffset", 1)
										  .attr("stroke", gridLineColor)
										  .attr("stroke-width", 0.5)
										  .attr("fill", "none");
				
							nextY=nextY + (yScale(0) - yScale((1.5* maxHeight)/10));						
				}
				
				
			var startX= width  - width * 0.89;
		
			var startY = yScale(0);
			
			var topYSideOne = 0;
			var topYSideTwo = 0;
			var topYSideThree = 0;
				
				
			
            var elementLengthInData=threeDStackedBarsData[0].data.length;
			var totalElementsType = threeDStackedBarsData.length;
			
			for(var q=0; q<elementLengthInData; q++){
				
				var startY1 = yScale(0); 
				var currentHeight=0;
				
				for(var w=0; w<totalElementsType; w++){
				
					var currentData = threeDStackedBarsData[w].data;
					
					var lineGraph1 = svgContainer.append("path")	
									.attr("class","lineGraphClass " + legendNameMap[threeDStackedBarsData[w].key])
									.attr("d", lineFunction(getSidesCordinates(startX+leftBarMargin, startY1, widthOfBars, currentData[q], 1, currentData[q], 1 )))			
									.attr('val',function(){
										var cordinateArray=getSidesCordinates(startX+leftBarMargin, startY1, widthOfBars, currentData[q], 1, currentData[q], 1);
										return cordinateArray[0].height;
									})
									.attr("stroke", "grey")
									.attr("fill", colorArray[w])
									.attr("xVal",threeDStackedBarsData[w].key)		
									.on("mouseover",function(){
									   //toolTipManager.showToolTip(d3.event, null, null, false, cfg.toolTipLabelForYAxis + " :- " + d3.select(this).attr('val'));
									   var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
						
										toolTipManager.showToolTip(d3.event,"",(d3.select(this).attr('xVal')), false,yHeadingValueMap);
									})
									.on("mouseout", function (d, i) {
										var targetElement = d3.select(this);
										toolTipManager.hideTooTip();
									})
									.style("display","none");
						
					
					var lineGraph2 = svgContainer.append("path")
									.attr("class","lineGraphClass " + legendNameMap[threeDStackedBarsData[w].key])
									.attr("d", lineFunction(getSidesCordinates(startX+leftBarMargin, startY1, widthOfBars,currentData[q], 2, currentData[q], 1 )))
									.attr('val',function(){
											var cordinateArray=getSidesCordinates(startX+leftBarMargin, startY1, widthOfBars, currentData[q], 2, currentData[q], 1 );
											return cordinateArray[0].height;
										})
										.attr("stroke", "white")
									.attr("fill", colorArray[w])
									.attr("stroke", "grey")
									.attr("xVal",threeDStackedBarsData[w].key)		
									.on("mouseover",function(){
									   //toolTipManager.showToolTip(d3.event, null, null, false, cfg.toolTipLabelForYAxis + " :- " + d3.select(this).attr('val'));
									   var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
						
										toolTipManager.showToolTip(d3.event,"",(d3.select(this).attr('xVal')), false,yHeadingValueMap);
									})
									.on("mouseout", function (d, i) {

										var targetElement = d3.select(this);
										toolTipManager.hideTooTip();
									})
									.style("display","none");
				
					var lineGraph3 = svgContainer.append("path")
									.attr("class","lineGraphClass " + legendNameMap[threeDStackedBarsData[w].key])
									.attr("d", lineFunction(getSidesCordinates(startX+leftBarMargin, startY1, widthOfBars, currentData[q], 3, currentData[q], 1 )))
									.attr('val',function(){
											var cordinateArray=getSidesCordinates(startX+leftBarMargin, startY1, widthOfBars, currentData[q], 3, currentData[q], 1 );
											return cordinateArray[0].height;
										})
										.attr("stroke", "grey")
									.attr("fill", colorArray[w])
									.attr("xVal",threeDStackedBarsData[w].key)		
									.on("mouseover",function(){
									   //toolTipManager.showToolTip(d3.event, null, null, false, cfg.toolTipLabelForYAxis + " :- " + d3.select(this).attr('val'));
									   var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
						
										toolTipManager.showToolTip(d3.event,"",(d3.select(this).attr('xVal')), false,yHeadingValueMap);
									})
									.on("mouseout", function (d, i) {

										var targetElement = d3.select(this);
										toolTipManager.hideTooTip();
									})
									.style("display","none");
						
				        currentHeight+=currentData[q] ;
						startY1 = yScale(currentHeight) - ySpacingFactor * (w+1);						
						
				}			  
					
				leftBarMargin=leftBarMargin+xSpacingInBars;		
				startY1 = yScale(0);
			}
			
			
			var eleArray=$(".lineGraphClass").hide();
				for(var m=0; m<eleArray.length; m++){
					
					$(eleArray[m]).slideUp(m * 100).delay(m *40).fadeIn();					
				}
			
			hideAxisPath(svgElement);
		
			function getSidesCordinates(x,y,width,height,sideno,heightOfBar, dataNumber){
	
						height = yScale(0)-yScale(height) ;
					
						var lineData=[];
					
						if(sideno==1){
							var factor=parseInt(width*.33) + 1;
							var xHit=0;
							var yHit=0;
							for(var i=0;i<5;i++){
										
							   if(i==0)
							   {
									y = y;
														
							   }
							   else if(i==1)
							   {
								   y = y - height;	
							   }
							   else if(i==2)
							   {
								   x=x+width;   
							   }
							   else if(i==3)
							   {
								   y=y+height;    
							   }     
								else if(i==4)
							   {
								  x=x-width;    
							   }
								
								var nextY=y;
								var nextX=x;
								   
								lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}'));                      
							}                               
						}
					 else if(sideno==2){
						 
							//var factor = *(15/380);
							var factor=parseInt(width*.33) + 1;
							//alert(height);
							
							for(var i=0;i<4;i++){
										
							   if(i==0)
							   {								   
								   y = y;											   
							   }
							   else if(i==1)
							   {
								   x=x-factor;
								   y=y-factor;								 
							   }
							   else if(i==2)
							   { 								
								   y=y-height;									
							   }
							   else if(i==3)
							   {
								   x=x+factor;
								   y=y+factor;  
							   }     
								   
								var nextY=y;
								var nextX=x;
								lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}'));  
							}                               
							
						}
						else if(sideno==3){
							
							var factor=parseInt(width*.33) + 1;
							
							for(var i=0;i<4;i++){
										
							   if(i==0)
							   {
									topYSideThree = y + height;
									y = y - height;
									//topYSideThree = y;		
							   }
							   else if(i==1)
							   {
								   x=x-factor;
								   y=y-factor;
									 
							   }
							   else if(i==2)
							   {
								   x=x+width;   
							   }
							   else if(i==3)
							   {
								   x=x+factor;
								   y=y+factor;    
							   }     
								   
								var nextY=y;
								var nextX=x;
								   
								lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}')); 											   
							}                              							
						}					
						return lineData;						
					}
			
				
				function mMove(){

					 var m = d3.mouse(this);
					 console.log(m);
					 d3.select(this).select("title").text(yScale(m[1]));
				}
				

				var xAxisRef=svgContainer.append("g")
						.attr("class", "axis")
						.attr("transform", "translate("+startX+"," + (height - height * 0.15 + yScale(1.5 * maxHeight)) + ")")						
						.call(xAxis);
						
				xAxisRef.selectAll('text').text(function(d,i){
							
						 return xAxisArray[i];
						})
						.style("fill",textColor+" !important");


				var yAxisRef=svgElement.append("g")
						.attr("class", "axis")
						.attr("transform", "translate(" + (width*0.08) + ","+ (yScale(1.5 * maxHeight))  +")")
						.call(yAxis);
				/*
				d3.selectAll('.axis text')
						.style("fill",textColor);;	   
				
				d3.selectAll('.axis path').attr('fill','none');	
				*/
				
				//y indication label
				var pixcelPerChar=6;
				var indexOfParaenthesis=yAxisRef.attr("transform").indexOf("(")+1;
				var indexOfComma=yAxisRef.attr("transform").indexOf(",");
				
				var yTotalPixcel=cfg.yLabel.toString().length*pixcelPerChar;
				var yLabelTop=height/2+yTotalPixcel/2;
				
				var yLabelLeft;
				if(width<400){
					yLabelLeft=-parseInt(yAxisRef.attr("transform").substring(indexOfParaenthesis,indexOfComma))*1.5;
				}else{
					yLabelLeft=-parseInt(yAxisRef.attr("transform").substring(indexOfParaenthesis,indexOfComma))*0.7;
				}
				
				axisLabelController.appendLabel(cfg.yLabel,yLabelLeft,yLabelTop,-90,yAxisRef,textStyleConfg.yLabelColor,600);	
				
				//x indication label
				var xTotalPixcel=cfg.xLabel.toString().length*pixcelPerChar;
				var xLabelLeft=threeDBarXRegion/2-xTotalPixcel;
				var xLabelTop=height*0.1;
				axisLabelController.appendLabel(cfg.xLabel,xLabelLeft,xLabelTop,0,xAxisRef,textStyleConfg.xLabelColor,600);	
				
				var legend = svgContainer.append("g")
                    .attr("class", "legend")
                    .attr("width", width)
                    .attr("height", height)
                    .attr('transform', 'translate(' +startX + ','+(height * 0.08)+')');

				  
				  var legendWidth = 0;
				  var legendHeight = 0;
				
				  if(width > 300)
				  {
					  legendWidth = 12;
					  legendHeight = 12;
				  }
				  else
				  {
					  legendWidth = 10;
					  legendHeight = 10;
				  }
				 
				  var maxLengthOfKeys = d3.max(threeDStackedBarsData, function(d,i){  return d.key.length;});
				  
					
					
				   var newXCord=0;
				   var CordBean={
					   
						getX:function(){
							
							return newXCord;
						},
						setX:function(val){
							newXCord=val;
						}
				   }
				   
				   var legendPositionArray=legendController.getLegendPositionArray(legendArray,width,maxHeight*0.25);
                    legend.selectAll('rect')
							.data(legendArray)
                            .enter()
                            .append("rect")
                            .attr("x", function (d, i) {
								/*
								var moveToNextLine=isMoveLegendToNextLine(d.key,xPos,i);
						
								if(moveToNextLine.move){
									xPos=moveToNextLine.startPos;
								}else{
									xPos=moveToNextLine.startPos;
								}
								positionXArray.push(xPos);
								return xPos;
								*/
								return legendPositionArray[i].x;
                        })
                            .attr("y", function(d,i){
								/*
								var moveToNextLine=isMoveLegendToNextLine(d.key,xPos1,i);
						
								//var yPos=0;
								if(moveToNextLine.move){
									nextLineCounter++;
									yPos=nextLineCounter*nextLineSeparator;
									xPos1=moveToNextLine.startPos;
								}else{
									xPos1=moveToNextLine.startPos;
								}
								positionYArray.push(yPos);
								return yPos;
								*/
								return legendPositionArray[i].y;
							})
							.attr("width", legendWidth)
                            .attr("height", legendHeight)
                            .style("fill", function (d, i) {
                            return colorArray[i];
                        })
						.on("click", function (d) {
                            var state = svgElement.selectAll("." + legendNameMap[d]).style("display");
                            if (state == "none") {

								$("#"+selectedElementId).find("path."+legendNameMap[d]).slideUp(400).delay(400).fadeIn();
								svgElement.selectAll(".legend-text."+legendNameMap[d]).style("text-decoration","none");
                              
                            } else {

                                var selectedPath = svgElement.selectAll("." + legendNameMap[d]);
								$("#"+selectedElementId).find("path."+legendNameMap[d]).slideDown(400).delay(400).fadeOut();                              
								svgElement.selectAll(".legend-text."+legendNameMap[d]).style("text-decoration","line-through");
                            }
                        });	
                           
                    
                    legend.selectAll('text')
                            .data(legendArray)
                            .enter()
                            .append("text")
							.attr("class",function(d){
								return "legend-text "+legendNameMap[d];
							})
                            .attr("x", function (d, i) {
								/*
								var x=positionXArray[i]+textSeparator;
								return x;
								*/
								return legendPositionArray[i].textPos;
							})
                            .attr("y",function(d,i){
								/*
								var y=positionYArray[i]+textSeparator-legendHeight;
								return y;
								*/
								return legendPositionArray[i].y+legendHeight;
							})
							.attr("width", legendWidth)
                            .attr("height", legendHeight)
                            .attr("font-size", 12)
                           //.attr("dx", "1.50em")
                           .attr("dy", ".08em")
                            .text(function (d, i) {
                            return d;
                        });
						
				//set axistextColor
				//svgElement.selectAll(".axis").selectAll("text").style("fill",cfg.axisTextColor);
				
				//set legendColor
				//legend.selectAll("text").style("fill",cfg.legendTextColor);
				
				//set font here
				setTextStyleAndSvgBackGround(svgElement);	
			}
		};
		
		/*Network Connection Chart*/
		var globAnalysisGraph = 
		{
			globChartAnalysis:function(cnfg)
			{
				var globAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.1,top:height*0.1,chartSeparator:5,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
			
				var nodesArray = cnfg.data.nodesArray;
				var cordArray = cnfg.data.cordArray;
				var nodesColor = cnfg.data.nodesColor;
				var Data = cnfg.data.Data;
				var titleColor = cnfg.data.titleColor;
				var titleSize = cnfg.data.titleSize;
				var title = cnfg.data.title;
				var backGroundImage = cnfg.data.backGroundImage;
				var nodeText = 12 , pathText = 10 ,nodeTextColor = "gray",nodeCircleSize = 4;
				var textFamily = 'calibri';
				svgElement.style('background','url('+backGroundImage+') no-repeat')
				          .style('background-size','100% 100%');
				var globMainGroup = svgElement.append("g")
					.attr('class','glob-main-group')
                    .attr("transform", "translate(" + 0 + "," + 0 + ")");
		
				var xCoordinate = [],yCoordinate = [];
				var index =0;
				for(var outerLoop=0;outerLoop<cordArray.length;outerLoop++)
				{
					for(var innerLoop=0;innerLoop<2;innerLoop++)
					{	
						if(innerLoop==0)
							xCoordinate[index]=cordArray[outerLoop][innerLoop];
						else
							yCoordinate[index++]=cordArray[outerLoop][innerLoop];
					}
				}	

				globMainGroup.append('text')
							 .attr('class','globTitle')
							 .attr('x',globAnalChart.left*2)
							 .attr('y',titleSize)
							 .attr('font-size',titleSize)
						     .attr('text-family',textFamily)
							 .attr('fill',titleColor)
			 			     .text(title);
				
				var yScale = d3.scale.linear()
									 .domain([0,100])
									 .range([height,0]);
	            
				var yAxis = d3.svg.axis()
                                  .scale(yScale)
                                  .orient("left");
	             
                var yAxisGroup = globMainGroup.append("g")
									.attr("class","y-axis")
									.attr("transform","translate("+30+","+10+")")
						       	    .attr('fill','none')
									.style('display','none')
									.call(yAxis);
				var xScale = d3.scale.linear()
							         .domain([0,100])
                                     .range([0,width-20]);
	            
				var xAxis = d3.svg.axis()
                                  .scale(xScale)
                                  .orient("bottom");
	   
                var xAxisGroup = globMainGroup.append("g")
									.attr("class","x-axis")
									.attr("transform","translate("+10+","+(height-30)+")")
						       	    .attr('fill','none')
									.style('display','none')
									.call(xAxis);
						
				var showNodes =  globMainGroup.append("g")
											  .attr("class","show-nodes")
											  .attr("transform","translate("+0+","+0+")");		
				
								showNodes.selectAll('circle')
										 .data(nodesArray)
										 .enter()
										 .append('circle')
										 .attr('value',function(d,i){return i})
										 .attr('cx',function(d,i){return xScale(xCoordinate[i])})
										 .attr('cy',function(d,i){return yScale(yCoordinate[i])})
										 .attr('r',nodeCircleSize)
										 .attr('fill',function(d,i){return nodesColor[i]})
										 .on('mouseover',function()
										 {
												d3.select(this).attr('r',nodeCircleSize+3);
												var selectedNodeIndex = d3.select(this).attr('value');
												var selectedNode = nodesArray[selectedNodeIndex];
												d3.select("#"+selectedNode.replace(/ /g,'')).attr('font-size',nodeText+2).attr('fill','black');
												d3.selectAll('.'+selectedNode.replace(/ /g,'')).style('display','none');
												var setIndexOfData;
												for(var nodeCounter =0;nodeCounter<Data.length;nodeCounter++)
												{
													if(selectedNode==Data[nodeCounter].node)
													{
														setIndexOfData=nodeCounter;
														break;
													}
												}
												for(var connectedNodeWithPresentNode=0;connectedNodeWithPresentNode< Data[setIndexOfData].connectedNodes.length;connectedNodeWithPresentNode++)
												{	
													
													var nestedConnectedNode = Data[setIndexOfData].connectedNodes[connectedNodeWithPresentNode];
													var indexOfConnectedNode = nodesArray.indexOf(nestedConnectedNode);
													d3.select("#"+nestedConnectedNode.replace(/ /g,'')).attr('font-size',nodeText+2).attr('fill','black');
													d3.select("#"+(selectedNode+nestedConnectedNode).replace(/ /g,'')).attr('font-size',nodeText+1).attr('fill','black');
					   //                           alert("city "+ nestedConnectedNode + "index = "+indexOfConnectedNode+"  "+Data[nodeCounter].pathColor);
													var dashedLineGroup=globMainGroup.append("line")
																.attr('class','dotedLine')
																.attr("x1", function (d) 
																{
																	return xScale(xCoordinate[selectedNodeIndex]);
																})
																.attr("y1", function (d) {
																	return yScale(yCoordinate[selectedNodeIndex]);
																})
																.attr("x2", function (d) {
																	return xScale(xCoordinate[selectedNodeIndex]);
																})
																.attr("y2", function (d) {
																	return yScale(yCoordinate[selectedNodeIndex]);
																});
																
																dashedLineGroup
																.transition()
																.duration(1500)
																.attr("x2",function(){
																	return xScale(xCoordinate[indexOfConnectedNode]);
																})
																.attr("y2",function(){
																	return yScale(yCoordinate[indexOfConnectedNode]);
																})
																.style("stroke",'red')
																.style("stroke-dasharray", ("5, 5"));
												}
										})
										.on('mouseout',function()
										{
											d3.select(this).attr('r',nodeCircleSize);
											var selectedNodeIndex = d3.select(this).attr('value');
												var selectedNode = nodesArray[selectedNodeIndex];
											d3.selectAll('.'+selectedNode.replace(/ /g,'')).style('display','block');
											d3.selectAll('.dotedLine').style('display','none');
											d3.select("#"+selectedNode.replace(/ /g,'')).attr('font-size',nodeText).attr('fill',nodeTextColor);
											
											var setIndexOfData123;
												for(var nodeCounter =0;nodeCounter<Data.length;nodeCounter++)
												{
													if(selectedNode==Data[nodeCounter].node)
													{
														setIndexOfData123=nodeCounter;
														break;
													}
												}
											for(var connectedNodeWithPresentNode=0;connectedNodeWithPresentNode< Data[setIndexOfData123].connectedNodes.length;connectedNodeWithPresentNode++)
												{		
													var nestedConnectedNode = Data[setIndexOfData123].connectedNodes[connectedNodeWithPresentNode];
													d3.select("#"+nestedConnectedNode.replace(/ /g,'')).attr('font-size',nodeText).attr('fill',nodeTextColor);
													d3.select("#"+(selectedNode+nestedConnectedNode).replace(/ /g,'')).attr('font-size',nodeText-1).attr('fill',nodeTextColor);
												}

										});
				var showNodesText =  globMainGroup.append("g")
											  .attr("class","show-nodes-text")
											  .attr("transform","translate("+0+","+0+")")	;
									
									  showNodesText.selectAll('text')
									               .data(nodesArray)
												   .enter()
												   .append('text')
												   .attr('id',function(d){return d.replace(/ /g,'')})
												   .attr('x',function(d,i){return xScale(xCoordinate[i])-((d.length*nodeText)/2.5)})
												   .attr('y',function(d,i){return yScale(yCoordinate[i])-8})
												   .attr('font-size',nodeText)
												   .attr('font-family',textFamily)
												   .attr('fill',nodeTextColor)
												   .text(function(d,i){return d});
									
									  
				//show paths 						
				for(var nodeCounter =0;nodeCounter<Data.length;nodeCounter++)
				{
					var presentNode = Data[nodeCounter].node;
					var indexOfpresentNode = nodesArray.indexOf(presentNode);
					//alert(presentNode);
					for(var connectedNodeWithPresentNode=0;connectedNodeWithPresentNode< Data[nodeCounter].connectedNodes.length;connectedNodeWithPresentNode++)
					{
						
					   var nestedConnectedNode = Data[nodeCounter].connectedNodes[connectedNodeWithPresentNode];
					   var indexOfConnectedNode = nodesArray.indexOf(nestedConnectedNode);
					   
					   var deltaXX = Math.abs(xScale(xCoordinate[indexOfConnectedNode])-xScale(xCoordinate[indexOfpresentNode]));
					   var deltaYY = Math.abs(yScale(yCoordinate[indexOfConnectedNode])-yScale(yCoordinate[indexOfpresentNode]));
					   var rad = Math.atan2(deltaYY, deltaXX);
					   var degree = rad * (180 / Math.PI);
							globMainGroup.append('text')
								.attr('id',(presentNode+nestedConnectedNode).replace(/ /g,''))
								.attr("transform","translate("+(xScale(xCoordinate[indexOfConnectedNode])+xScale(xCoordinate[indexOfpresentNode]))/2+","+(yScale(yCoordinate[indexOfConnectedNode])+yScale(yCoordinate[indexOfpresentNode]))/2+")rotate("+(degree)+")")					
								.attr('font-size',nodeText-1)
							    .attr('font-family',textFamily)
								.attr('fill',nodeTextColor)
								.text(Data[nodeCounter].pathTexts[connectedNodeWithPresentNode]);
					   
					   var lineGroup = globMainGroup.append("line")
					                .attr('class',presentNode.replace(/ /g,''))
									.attr("x1", function (d) 
									{
										return xScale(xCoordinate[indexOfpresentNode]);
									})
									.attr("y1", function (d) {
										return yScale(yCoordinate[indexOfpresentNode]);
									})
									.attr("x2", function (d) {
										return xScale(xCoordinate[indexOfpresentNode]);
									})
									.attr("y2", function (d) {
										return yScale(yCoordinate[indexOfpresentNode]);
									});
									lineGroup.transition()
									         .delay(200)
											.duration(1500)
											.attr("x2",function(){
													return xScale(xCoordinate[indexOfConnectedNode]);
													})
											.attr("y2",function(){
													return yScale(yCoordinate[indexOfConnectedNode]);
													})
									.style("stroke",function(){return Data[nodeCounter].pathColor});
					}
				}
				
			},
		};
		
		
		var drawTreeChart={
			treeChart:function(cfg){
				var data=cfg.data;
				var linkColor=cfg["link-color"];
				var nodeColor=cfg["node-color"];
				
				
				var margin = {'top':(height*0.1),'right':(width*0.1), 'bottom': (height*0.1), 'left': (width*0.1)};
				
				width = width - margin.right - margin.left;
				height = height - margin.top - margin.bottom;
				
			
				
				var i = 0,
					duration = 750,
					root;

				var tree = d3.layout.tree()
					.size([height, width])
					.children(function(d) { return d.SubRoot; });

				var diagonal = d3.svg.diagonal()
					.projection(function(d) { return [d.y, d.x]; });

				var svg = svgElement
						  .append("g")
					      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


				  root = data;
				  root.x0 = height / 2;
				  root.y0 = 0;

				
				  update(root);


				  var no_of_levels = 0;
				  
				  console.log("Get of depth : " + getDepth(root));
				  
				 function getDepth(obj) {
						var depth = 0;
						if (obj.SubRoot) {
							obj.SubRoot.forEach(function (d) {
								var tmpDepth = getDepth(d)
								if (tmpDepth > depth) {
									depth = tmpDepth
								}
							})
						}
						return 1 + depth
					}
				  

				function update(source) {

				  // Compute the new tree layout.
				  var nodes = tree.nodes(root).reverse(),
					  links = tree.links(nodes);

				  // Normalize for fixed-depth.
				  nodes.forEach(function(d) { 
					d.y = d.depth * ((width-20)/getDepth(root)); });

				  // Update the nodes…
				  var node = svg.selectAll("g.node")
					  .data(nodes, function(d) { return d.ids || (d.ids = ++i); });

				  // Enter any new nodes at the parent's previous position.
				  var nodeEnter = node.enter().append("g")
					  .attr("class", "node")
					  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
					  .on("click", click);

				  nodeEnter.append("circle")
					  .attr("r", 1e-6)
					  .style("fill", function(d) { 
							//return d._children1 ? "lightsteelblue" : "#fff"; 
							return nodeColor;
						})
						.style("stroke","lightsteelblue")
						.on("mouseover",function(){
							d3.select(this).style("stroke-width","2");	
						})
						.on("mouseleave",function(){
							d3.select(this).style("stroke-width","1");
						});

				  nodeEnter.append("text")
					  .attr("x", function(d) { return d._children1 || d._children1 ? -10 : 10; })
					  .attr("dy", ".35em")
					  .attr("text-anchor", function(d) { return d._children1 || d._children1 ? "end" : "start"; })
					  .text(function(d) { return d.Element || d.Element || d.Root; })
					  .style("fill-opacity", 1e-6);

				  // Transition nodes to their new position.
				  var nodeUpdate = node.transition()
					  .duration(duration)
					  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

				  nodeUpdate.select("circle")
					  .attr("r", 4.5)
					  .style("fill", function(d) { 
							//return d._children1 ? "lightsteelblue" : "#fff"; 
							return nodeColor;
						})
						.style("stroke","lightsteelblue")
						/*
						.on("mouseover",function(){
							d3.select(this).style("stroke-width","2");	
						})
						.on("mouseleave",function(){
							d3.select(this).style("stroke-width","1");
						});
						*/
						
				  nodeUpdate.select("text")
					  .style("fill-opacity", 1);

				  // Transition exiting nodes to the parent's new position.
				  var nodeExit = node.exit().transition()
					  .duration(duration)
					  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
					  .remove();

				  nodeExit.select("circle")
					  .attr("r", 1e-6);

				  nodeExit.select("text")
					  .style("fill-opacity", 1e-6);

				  // Update the links…
				  var link = svg.selectAll("path.link")
					  .data(links, function(d) { return d.target.ids; });

				  // Enter any new links at the parent's previous position.
				  link.enter().insert("path", "g")
					  .attr("class", "link")
					  .attr("d", function(d) {
						var o = {x: source.x0, y: source.y0};
						return diagonal({source: o, target: o});
					  })
					  .style("stroke",linkColor)
					  .style("fill","none")
					  ;

				  // Transition links to their new position.
				  link.transition()
					  .duration(duration)
					  .attr("d", diagonal);

				  // Transition exiting nodes to the parent's new position.
				  link.exit().transition()
					  .duration(duration)
					  .attr("d", function(d) {
						var o = {x: source.x, y: source.y};
						return diagonal({source: o, target: o});
					  })
					  .remove();

				  // Stash the old positions for transition.
				  nodes.forEach(function(d) {
					d.x0 = d.x;
					d.y0 = d.y;
				  });
				}

				// Toggle children on click.
				function click(d) {
				  if (d.SubRoot) {
					d._children1 = d.SubRoot;
					d.SubRoot = null;
				  } else {
					d.SubRoot = d._children1;
					d._children1 = null;
				  }
				  update(d);
				}
				
			
			},
		};
		
		
		
		var areaChartWithNegativeValueGraph=
			{
					areaChartWithNegativeValueAnalysis:function(cnfg)
					{			
							var title = cnfg.data.title;
							var yAxisArray = cnfg.data.yAxisArray;
							var xAxisArray = cnfg.data.xAxisArray;
							var xAxisLabel = cnfg.data.xAxisLabel;
							var yAxisLabel = cnfg.data.yAxisLabel;
							var midPoint = cnfg.data.midPoint;
							var midPointLabel = cnfg.data.midPointLabel;
							var conditionArrayAboveMidPoint = cnfg.data.conditionArrayAboveMidPoint;
							var conditionArrayBelowMidPoint = cnfg.data.conditionArrayBelowMidPoint;
							
						
							var areaAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.15,top:height*0.1,chartSeparator:5,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
							var scaleWidth=width-areaAnalChart.left-areaAnalChart.right;
				            var scaleHeight=height-areaAnalChart.top-areaAnalChart.bottom;
							
							var fontSize =12,fontFamily = "calibri";
							//create array of x axis time index
							var xAxisTimeIndex = [];
							for(var counter = 0;counter<xAxisArray.length ;counter++)
							{
								xAxisTimeIndex[counter] = counter;
							}
							//grid view here
							var gridManager =   
								{
										init: function (svg, height, width, left, top) 
									{
										var hfactor = Math.ceil(height * .1);
										var vfactor = Math.ceil(height * .1);
										var hRange = Math.ceil(height / hfactor);

										var vRange = Math.ceil(width / vfactor);

										svg.selectAll(".hline").data(d3.range(hRange)).enter()
											.append("line")
											.attr("y1", function (d) {
											return d * hfactor+10;
										})
											.attr("y2", function (d) {
											return d * hfactor+10;
										})
											.attr("x1", function (d) {
											return 0;
										})
											.attr("x2", function (d) {
											return width;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");



										svg.selectAll(".vline").data(d3.range(vRange)).enter()
											.append("line")
											.attr("x1", function (d) {
											return d * vfactor;
										})
											.attr("x2", function (d) {
											return d * vfactor;
										})
											.attr("y1", function (d) {
											return 0;
										})
											.attr("y2", function (d) {
											return height;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");
									}

								};
						
				gridManager.init(svgElement, scaleHeight, scaleWidth, areaAnalChart.left, areaAnalChart.top);
						var leftMarginOfSvg = $(selectorElement).offset().left;
						svgElement.on("mouseover",function()
									{
										var x = event.pageX;
										var y = event.pageY;
										x=x-(leftMarginOfSvg+areaAnalChart.left);
										x = Math.round(xScale.invert(x));
										
										if(x>=0 && x<=xAxisArray.length)
										{
										var heading=xAxisArray[x];
										var xAxisVal = xAxisArray[x];
										var yAxisVal = yAxisArray[x];
										var yHeadingValueMap=[{"headingName":xAxisLabel,"headingVal":xAxisVal},
															//  {"headingName":"sss","headingVal":runPerBall},
															  {"headingName":yAxisLabel,"headingVal":yAxisVal}
														//	  {"headingName":totalRunUnit,"headingVal":totalRun}
															  ];
										
										toolTipManager.showToolTip(d3.event,"",(heading), false,yHeadingValueMap,d3.event.pageY*.90);	
										}
									})
									.on("mouseleave",function(){
										toolTipManager.hideTooTip();
									});


				
				
	
	var areaChartMainGroup = svgElement.append("g")
								   .attr('class','main-group')
								   .attr("transform", "translate(" + areaAnalChart.left + "," + areaAnalChart.top + ")")
		
		//title label here
		axisLabelController.appendLabel(title,(areaAnalChart.left),(-areaAnalChart.top/3),0,areaChartMainGroup,textStyleConfg.titleColor,600);
		var xScale = d3.scale.linear()
					 .domain([0,xAxisArray.length-1])
					 .range([0,scaleWidth]); 

		var yScale = d3.scale.linear()
                    .domain([d3.min(yAxisArray),d3.max(yAxisArray)*1.3])
                    .range([scaleHeight,0]);
					
			var largestStringLngth=0;
			for(var counter =0 ;counter<xAxisArray.length;counter++)
			{
				if(largestStringLngth<(xAxisArray[counter].toString()).length)
				{
					largestStringLngth = (xAxisArray[counter].toString()).length;
				}
			}
					
		//x axis
		var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.tickValues(tickController.getXTickArray(0,(xAxisArray.length),largestStringLngth, (scaleWidth)));
		var xAxisGroup=areaChartMainGroup.append("g")
						.attr('id','xAxis')
						.attr("class", "xAxis")
						.attr('fill',"none")
						.attr("transform", "translate("+0+"," + scaleHeight + ")")
						.call(xAxis);
	
			
					xAxisGroup.selectAll('text')
							 .text(function(d){
								return xAxisArray[d];
							 
							 })
							 .style('font-size',fontSize)
						     .attr('font-family',fontFamily)
							 .attr('fill','black');
							 
	/*	var xAxisLabelGroup = areaChartMainGroup.append("g")
									.attr("class","x-axis-label-group")
									.attr("transform","translate("+scaleWidth/2.5+","+(scaleHeight+(areaAnalChart.bottom))+")")
									xAxisLabelGroup.append('text')
											        .attr('x',0)
													.attr('y',0)
													.attr('font-size',fontSize*1.5)
													.attr('font-family',fontFamily)
													.attr('fill','gray')
													.text(xAxisLabel);	*/
	
	// xAxis label here
	var pixcelPerChar = 6;
	var totalXLabelPixcel=xAxisLabel.toString().length*pixcelPerChar;
	var xIndicationLabelTop=scaleHeight+(scaleHeight*0.15);
	var xIndicationLabelLeft=scaleWidth/2-totalXLabelPixcel/2;
	axisLabelController.appendLabel(xAxisLabel,xIndicationLabelLeft,xIndicationLabelTop,0,areaChartMainGroup,textStyleConfg.xLabelColor,600);												

		var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
		.tickValues(tickController.getTickArray(d3.min(yAxisArray),d3.max(yAxisArray)*1.3,10));
				
			areaChartMainGroup.append("g")
						.attr('id','yAxis')
						.attr("class", "yAxis")
						.attr('fill',"none")
						.attr('font-size',fontSize)
						.attr('font-family',fontFamily)
						.attr("transform", "translate("+(-fontSize)+"," + 0 + ")")
						.call(yAxis)
					    .selectAll('text')
						.attr('font-size',fontSize)
					    .attr('font-family',fontFamily)
						.attr('fill','black');	
		/*	var yAxisLabelGroup = areaChartMainGroup.append("g")
									.attr('class','y-axis-label-group')	
				     				.attr("transform","translate("+(-areaAnalChart.left/2)+","+scaleHeight/1.5+")");			
									
					yAxisLabelGroup.append('text')
								   .attr('font-size',fontSize*1.5)
							       .attr('font-family',fontFamily)
								   .attr('fill','gray')
								   .attr('transform','rotate(-90)')
								   .text(yAxisLabel);		*/
			//yAxis label here
			var totalYLabelPixcel=yAxisLabel.toString().length*pixcelPerChar;		
			var yIndicationLabelTop=scaleHeight/2+totalYLabelPixcel/2;
			var yIndicationLabelLeft=(-areaAnalChart.left/2);
			axisLabelController.appendLabel(yAxisLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,areaChartMainGroup,textStyleConfg.yLabelColor,600);
								   
		/*	var midPointLabelGroup = areaChartMainGroup.append("g")
									.attr('class','y-axis-label-group')	
				     				.attr("transform","translate("+(scaleWidth+(areaAnalChart.right/4))+","+0+")");			
									*/
					var midPointLabelArray = midPointLabel.split(' ');
					midPointLabelArray.push(midPoint);
					var midPointLabelArrayLength = parseInt(midPointLabelArray.length/2);
									
					for(var index = 0;index<midPointLabelArray.length;index++)
					{
						axisLabelController.appendLabel(midPointLabelArray[index],(scaleWidth+(scaleWidth*.01)),yScale(midPoint)-(midPointLabelArrayLength)*(fontSize) + (index*fontSize),0,areaChartMainGroup,"black",600);
					}
			/*		midPointLabelGroup.selectAll('text')
								   .data(midPointLabelArray)
								   .enter()
								   .append('text')
								   .attr('y',function(d,i){return yScale(midPoint)-(midPointLabelArrayLength)*(fontSize) + (i*fontSize)})
								   .attr('font-size',fontSize)
							       .attr('font-family',fontFamily)
								   .attr('fill','black')
								//   .attr('transform','rotate(90)')
								   .text(function(d){return d;});								*/   
							
						var	gradientAboveMid=$.extend({
								'color': 'url(#gradientAboveMid)',
							/*	'axisColor':'blue',
								'data':[],
								'attachBrushEvent':false,
								'xAxisIndicationLabel':'',
								'yAxisIndicationLabel':''*/
								
							}, gradientAboveMid);
					
					var aboveMidPointkey = [];
					var aboveMidPointvalues = [];
					for(index in conditionArrayAboveMidPoint)
					{
						for(key in conditionArrayAboveMidPoint[index])
							{
								aboveMidPointkey.push(key);
								aboveMidPointvalues.push(conditionArrayAboveMidPoint[index][key]);
							}
					}
				
				//	alert(keys+"  "+values)
				//	var aboveMidPointColorArray = ['#FFCCCC','#FF4D4D','#B22400'];
					var gradient1 = areaChartMainGroup.append("svg:defs")
				.append("svg:linearGradient")
				.attr("id", "gradientAboveMid")
				.attr("x1", "0%")
				.attr("y1", yScale(midPoint))
				.attr("x2", "0%")
				.attr("y2", yScale(d3.max(yAxisArray)*1.3))
				.attr("gradientUnits", "userSpaceOnUse")
				.selectAll("stop")
				.data(aboveMidPointkey)
				.enter().append("stop")
				.attr("offset", function(d,i) {return ""+((d-midPoint)/(d3.max(yAxisArray)*1.3))*100+"%"; })
				.attr("stop-color", function(d,i) {return aboveMidPointvalues[i]; });

				var	gradientBelowMid=$.extend({
								'color': 'url(#gradientBelowMid)',
							/*	'axisColor':'blue',
								'data':[],
								'attachBrushEvent':false,
								'xAxisIndicationLabel':'',
								'yAxisIndicationLabel':''*/
								
							}, gradientBelowMid);
					
				var belowMidPointkey = [];
					var belowMidPointvalues = [];
					for(index in conditionArrayBelowMidPoint)
					{
						for(key in conditionArrayBelowMidPoint[index])
							{
								belowMidPointkey.push(key);
								belowMidPointvalues.push(conditionArrayBelowMidPoint[index][key]);
							}
					}
				
				var gradient2 = areaChartMainGroup.append("svg:defs")
				.append("svg:linearGradient")
				.attr("id", "gradientBelowMid")
				.attr("x1", "0%")
				.attr("y1", yScale(d3.min(yAxisArray)))
				.attr("x2", "0%")
				.attr("y2", yScale(midPoint))
				.attr("gradientUnits", "userSpaceOnUse")
				.attr("gradientUnits", "userSpaceOnUse")
				.selectAll("stop")
				.data(belowMidPointkey)
				.enter().append("stop")
				.attr("offset", function(d,i) {return ""+(((midPoint)-d)/(midPoint-d3.min(yAxisArray)))*100+"%"; })
				.attr("stop-color", function(d,i) {return belowMidPointvalues[belowMidPointvalues.length-1-i]; });

				var turningPoints = [];
				var timeIndex = 0;
				var setColor = 1;
				var lastPointOfData = 0;
				var firstPath = -1,lastPath = -1;
				for(var index = 0 ; index<yAxisArray.length ; index++)
				{
					turningPoints = [];
					if(yAxisArray[index]>=midPoint)
					{
						setColor = 1;
						turningPoints.push(midPoint);
						for(var innerIndex = index ; innerIndex<yAxisArray.length ; innerIndex++)
						{
							if(yAxisArray[innerIndex]<midPoint)
							{
								turningPoints.push(midPoint);
								break;
							}
							turningPoints.push(yAxisArray[innerIndex]);
						//	alert("+ " +turningPoints);
						}
						if(turningPoints.length == 2 && index==yAxisArray.length-1)
						{
								turningPoints = [];
								turningPoints.push(midPoint);
								turningPoints.push(yAxisArray[yAxisArray.length-1]);
								turningPoints.push(midPoint);
						//		alert(turningPoints);
						}
					}
					else
					{
						setColor = 0;
						turningPoints.push(midPoint);
						for(var innerIndex = index ; innerIndex<yAxisArray.length ; innerIndex++)
						{
							
							if(yAxisArray[innerIndex]>=midPoint)
							{
								turningPoints.push(midPoint);
								break;
							}
							turningPoints.push(yAxisArray[innerIndex]);
						//	alert("- " +turningPoints);
						}
						if(turningPoints.length == 2 && index==yAxisArray.length-1)
						{
								turningPoints = [];
								turningPoints.push(midPoint);
								turningPoints.push(yAxisArray[yAxisArray.length-1]);
						}
					}
					
					
					firstPath = index;
					if(firstPath==0)
					{
						turningPoints.splice(0,1);
					}
					if(innerIndex==yAxisArray.length)
					{
						lastPath = 0;  
					}
					
					index = innerIndex-1;
				
				var area = d3.svg.area()
							.x(function(d,i) { return 0;})
							.y0(yScale(midPoint))
							.y1(function(d,i) { return yScale(turningPoints[i]); })
							.interpolate("cardinal");
									
				    var pathRef=areaChartMainGroup
							.append("path")
							.datum(turningPoints)
						    .attr("class","spyCloseprice")
						//.attr("class","spyCloseprice")
							//.attr("fill",'red')
							
							.attr("d",area(turningPoints));
							
					var area2 = d3.svg.area()
							.x(function(d,i) 
							{ 
								if(firstPath == 0)
								{
									firstPath = 1;
									return xScale(timeIndex++)
									
								}
								else if(lastPath == 0 && i==turningPoints.length-1)
								{
									lastPath = 1;
									return xScale(timeIndex);
								}
								else if(i==0)
								{
									return xScale(timeIndex-0.5);
								}
								else if(i==turningPoints.length-1)
								{
								//	alert(timeIndex-0.5+"  i==20 " );
									return xScale(timeIndex-0.5);
								}
								else
								{
								//	alert(timeIndex);
									return xScale(xAxisTimeIndex[timeIndex++]); }
							})
							.y0(yScale(midPoint))
							.y1(function(d,i) {return yScale(turningPoints[i]); })
							.interpolate("cardinal");
	
					pathRef.transition()
							.duration(2000)
							.attr("d",area2(turningPoints))
							//.attr("class","spyCloseprice")
							.attr("fill",function(d,i)
							{
								if(setColor==1)
								{
									return gradientAboveMid.color;
								}
								else
								{
									return gradientBelowMid.color;
								}
								//options.color
							});

			
							
					//	timeIndex--;	
				}
				var circleRef = areaChartMainGroup.selectAll('circle')
								  .data(xAxisTimeIndex)
								  .enter()
								  .append('circle')
								  .attr('cx',function(d,i){return 0})
								  .attr('cy',function(d,i){return 0})
								  .attr('r',4)
								//  .attr("fill","url(#gradient1)");
								 .attr('fill',function(d,i)
								 {
								 if(yAxisArray[i]>midPoint)
								 {return aboveMidPointvalues[aboveMidPointvalues.length-1];}
								 else
								 {return belowMidPointvalues[belowMidPointvalues.length-1]}});
			   circleRef.transition().duration(2000)
									 .attr('cx',function(d,i){return xScale(xAxisTimeIndex[i])})
								     .attr('cy',function(d,i){return yScale(yAxisArray[i])})
							
					},
			}
		
		var areaChartWithVaryColorGraph=
			{
					areaChartWithVaryColorAnalysis:function(cnfg)
					{			
							var title = cnfg.data.title;
							var yAxisArray = cnfg.data.yAxisArray;
							var xAxisArray = cnfg.data.xAxisArray;
							var xAxisLabel = cnfg.data.xAxisLabel;
							var yAxisLabel = cnfg.data.yAxisLabel;
							var midPoint = cnfg.data.midPoint;
							var midPointLabel = cnfg.data.midPointLabel;
							
							height=height*0.9;
							
							var areaAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.1,top:height*0.1,chartSeparator:5,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
							var scaleWidth=width-areaAnalChart.left-areaAnalChart.right;
				            var scaleHeight=height-areaAnalChart.top-areaAnalChart.bottom;
							
							var fontSize =14,fontFamily = "calibri";
							//create array of x axis time index
							var xAxisTimeIndex = [];
							for(var counter = 0;counter<xAxisArray.length ;counter++)
							{
								xAxisTimeIndex[counter] = counter;
							}
							//grid view here
							var gridManager =   
								{
										init: function (svg, height, width, left, top) 
									{
										var hfactor = Math.ceil(height * .1);
										var vfactor = Math.ceil(height * .1);
										var hRange = Math.ceil(height / hfactor);

										var vRange = Math.ceil(width / vfactor);

										svg.selectAll(".hline").data(d3.range(hRange)).enter()
											.append("line")
											.attr("y1", function (d) {
											return d * hfactor+10;
										})
											.attr("y2", function (d) {
											return d * hfactor+10;
										})
											.attr("x1", function (d) {
											return 0;
										})
											.attr("x2", function (d) {
											return width;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");



										svg.selectAll(".vline").data(d3.range(vRange)).enter()
											.append("line")
											.attr("x1", function (d) {
											return d * vfactor;
										})
											.attr("x2", function (d) {
											return d * vfactor;
										})
											.attr("y1", function (d) {
											return 0;
										})
											.attr("y2", function (d) {
											return height;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");
									}

								};
						
				gridManager.init(svgElement, scaleHeight, scaleWidth, areaAnalChart.left, areaAnalChart.top);

	var leftMarginOfSvg = $(selectorElement).offset().left;
	var areaChartMainGroup = svgElement.append("g")
								   .attr('class','main-group')
								   .attr("transform", "translate(" + areaAnalChart.left + "," + areaAnalChart.top + ")")
								   .on("mouseover",function()
									{
										var x = event.pageX;
										var y = event.pageY;
										x=x-(leftMarginOfSvg+areaAnalChart.left);
										x = Math.round(xScale.invert(x));
										var heading="XYZ";
										var xAxisVal = xAxisArray[x];
										var yAxisVal = yAxisArray[x];
										var yHeadingValueMap=[{"headingName":xAxisLabel,"headingVal":xAxisVal},
															//  {"headingName":"sss","headingVal":runPerBall},
															  {"headingName":yAxisLabel,"headingVal":yAxisVal}
														//	  {"headingName":totalRunUnit,"headingVal":totalRun}
															  ];
										
									//	toolTipManager.showToolTip(d3.event,"",(heading), false,yHeadingValueMap);	
									})
									.on("mouseleave",function(){
									//	toolTipManager.hideTooTip();
									});

		//title label here
		axisLabelController.appendLabel(title,(areaAnalChart.left),(-areaAnalChart.top/3),0,areaChartMainGroup,textStyleConfg.titleColor,700);
		var xScale = d3.scale.linear()
                    .domain([0,xAxisArray.length-1])
                    .range([0,scaleWidth]); 
		
		var yMin = d3.min(yAxisArray)*1.3;
		var yMax = d3.max(yAxisArray)*1.3;
		var yScale = d3.scale.linear()
                    .domain([yMin,yMax])
                    .range([scaleHeight,0]);
						
		var largestStringLngth=0;
					for(var counter =0 ;counter<xAxisArray.length;counter++)
					{
						if(largestStringLngth<(xAxisArray[counter].toString()).length)
						{
							largestStringLngth =(xAxisArray[counter].toString()).length;
						}
					}
					

		
		//x axis
		var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
		.tickValues(tickController.getXTickArray(0,(xAxisArray.length),largestStringLngth, (scaleWidth)));
		
			var xAxisGroup=areaChartMainGroup.append("g")
						.attr('id','xAxis')
						.attr("class", "xAxis")
						.attr('fill',"none")
						.attr("transform", "translate("+0+"," + scaleHeight + ")")
						.call(xAxis);
	
			
					xAxisGroup.selectAll('text')
							 .text(function(d){
								return xAxisArray[d];
							 
							 })
							 .style('font-size',fontSize)
						     .attr('font-family',fontFamily)
							 .attr('fill','black');
	

	//xAxis label here
	var pixcelPerChar = 6;
	var totalXLabelPixcel=xAxisLabel.toString().length*pixcelPerChar;
	var xIndicationLabelTop=scaleHeight+(scaleHeight*0.15);
	var xIndicationLabelLeft=scaleWidth/2-totalXLabelPixcel/2;
    axisLabelController.appendLabel(xAxisLabel,xIndicationLabelLeft,xIndicationLabelTop,0,areaChartMainGroup,textStyleConfg.xLabelColor,600);
		

		var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
		.tickValues(tickController.getTickArray(yMin,yMax,10));
				
			areaChartMainGroup.append("g")
						.attr('id','yAxis')
						.attr("class", "yAxis")
						.attr('fill',"none")
						.attr('font-size',12)
						.attr("transform", "translate("+0+"," + 0 + ")")
						.call(yAxis)
					    .selectAll('text')
						.attr('font-size',fontSize)
					    .attr('font-family',fontFamily)
						.attr('fill','black');	
		
	//yAxis label here
	var totalYLabelPixcel=yAxisLabel.toString().length*pixcelPerChar;
	var yIndicationLabelTop=scaleHeight/2+totalYLabelPixcel/2;					
	var yIndicationLabelLeft=(-areaAnalChart.left/2);
		axisLabelController.appendLabel(yAxisLabel,(-areaAnalChart.left/2),(scaleHeight/1.5),-90,areaChartMainGroup,textStyleConfg.yLabelColor,600);
		
					
					var midPointLabelArray = midPointLabel.split(' ');
					midPointLabelArray.push(midPoint);
					var midPointLabelArrayLength = parseInt(midPointLabelArray.length/2);
					//mid point label here
					for(var index = 0;index<midPointLabelArray.length;index++)
					{
						axisLabelController.appendLabel(midPointLabelArray[index],(scaleWidth+(scaleWidth*.01)),yScale(midPoint)-(midPointLabelArrayLength)*(fontSize) + (index*fontSize),0,areaChartMainGroup,"black",600);
					}
							   

				var turningPoints = [];
				var timeIndex = -0.5;
				var setColor = 1;
				var flag =0;
				for(var index = 0 ; index<yAxisArray.length ;)
				{
					turningPoints = [];
			
								if(flag==0)
								{
									flag=1;
									turningPoints.push(yAxisArray[index]);
									if((index+1)<yAxisArray.length )
									{
										turningPoints.push((yAxisArray[index+1]+yAxisArray[index])/2);
									}
								}
								else
								{
									flag=0;
									if((index+1)<yAxisArray.length )
									{
										turningPoints.push((yAxisArray[index+1]+yAxisArray[index])/2);
									}
									turningPoints.push(yAxisArray[index+1]);
									 index++
								}
					index = index;
				timeIndex= timeIndex+0.5;
				var area = d3.svg.area()
							.x(function(d,i) 
							{
								if(i==0)
								{
									return xScale(timeIndex);
								}
								else
								{
									return xScale(timeIndex+0.5);
								}
							})
							.y0(yScale(midPoint))
							.y1(function(d,i){ return yScale(turningPoints[i]); })
							
							
				areaChartMainGroup
							.append("path")
							.datum(turningPoints)
						    .attr("class","spyCloseprice")
							.attr("fill",function(d,i)
							{
								if(flag==0)
								{
								return "#1abc9c";
								}
								else
								{
									return "#d7dcde";
								}
							})
							.attr("d",area(turningPoints));	
				}
				var circleRef = areaChartMainGroup.selectAll('circle')
								  .data(xAxisTimeIndex)
								  .enter()
								  .append('circle')
								  .attr('cx',function(d,i){return 0})
								  .attr('cy',function(d,i){return 0})
								  .attr('r',4)
								//  .attr("fill","url(#gradient1)");
								 .attr('fill','#47A3FF');
							circleRef.transition().duration(2000)
									 .attr('cx',function(d,i){return xScale(xAxisTimeIndex[i])})
								     .attr('cy',function(d,i){return yScale(yAxisArray[i])})
							
					},
			}
			
		var comparisonGraph = 
		{
			comparisonAnalysis:function(cnfg)
			{
				 var yAxisEstimateData = cnfg.data.yAxisEstimateData;
				var yAxisActualData = cnfg.data.yAxisActualData;
				var xAxisData = cnfg.data.xAxisData;
				var yAxisUnit = cnfg.data.yAxisUnit;
				var yAxisLabel = cnfg.data.yAxisLabel;
				var xAxisLabel = cnfg.data.xAxisLabel;
				var title = cnfg.data.title;
				var titleColor = cnfg.data.titleColor;
				var yAxisEstimateDataUnit = cnfg.data.yAxisEstimateDataUnit;
				var yAxisActualDataUnit = cnfg.data.yAxisActualDataUnit;
				
				var compareAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.15,top:height*0.1,chartSeparator:5,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
				var scaleWidth=width-compareAnalChart.left-compareAnalChart.right;
				var scaleHeight=height-compareAnalChart.top-compareAnalChart.bottom;
					
				var estimateDataBarWidth =  (scaleWidth/(1.5*xAxisData.length));
				
				var fontSize =12,fontFamily = "calibri";	
				var xAxisTimeIndex = [];
			    for(var counter = 0;counter<xAxisData.length ;counter++)
				{
					xAxisTimeIndex[counter] = counter;
				}
				//grid here
				var gridManager =   
								{
										init: function (svg, height, width, left, top) 
									{
										var hfactor = Math.ceil(height * .1);
										var vfactor = Math.ceil(height * .2);
										var hRange = Math.ceil(height / hfactor);

										var vRange = Math.ceil(width / vfactor);

										svg.selectAll(".hline").data(d3.range(hRange)).enter()
											.append("line")
											.attr("y1", function (d) {
											return d * hfactor+10;
										})
											.attr("y2", function (d) {
											return d * hfactor+10;
										})
											.attr("x1", function (d) {
											return 0;
										})
											.attr("x2", function (d) {
											return width;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");



										svg.selectAll(".vline").data(d3.range(vRange)).enter()
											.append("line")
											.attr("x1", function (d) {
											return d * vfactor;
										})
											.attr("x2", function (d) {
											return d * vfactor;
										})
											.attr("y1", function (d) {
											return 0;
										})
											.attr("y2", function (d) {
											return height;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");
									}

								};
						
				gridManager.init(svgElement, scaleHeight, scaleWidth, compareAnalChart.left-(estimateDataBarWidth/2), compareAnalChart.top);
				
				var leftMarginOfSvg = $(selectorElement).offset().left;
				
				var compareChartMainGroup = svgElement.append("g")
								   .attr('class','main-group')
								   .attr("transform", "translate(" + compareAnalChart.left + "," + compareAnalChart.top + ")")
								   .on("mouseover",function()
									{
										var x = event.pageX;
										var y = event.pageY;
										x=x-(leftMarginOfSvg+compareAnalChart.left);
										x = Math.round(xScale.invert(x));
										if(x>=0 && x<xAxisData.length)
										{
										var heading=xAxisData[x];
										var yAxisEstimateVal = yAxisEstimateData[x] + " "+yAxisUnit;
										var yAxisActualVal = yAxisActualData[x] + " "+yAxisUnit;
										var yHeadingValueMap=[{"headingName":yAxisEstimateDataUnit+" "+yAxisLabel,"headingVal":yAxisEstimateVal},
															  {"headingName":yAxisActualDataUnit+" "+yAxisLabel,"headingVal":yAxisActualVal}
															  ];
										
										toolTipManager.showToolTip(d3.event,"",(heading), false,yHeadingValueMap,d3.event.pageY*.90);	
										}
									})
									.on("mouseleave",function(){
										toolTipManager.hideTooTip();
									});
				
	
			// title label here
			axisLabelController.appendLabel(title,compareAnalChart.left,(-compareAnalChart.top/3),0,compareChartMainGroup,textStyleConfg.titleColor,700);			   
				//	compareChartMainGroup.selectAll(".title").call(textWrapper.wrapText,80);	   
						   
								   
			//	titleRef.text(textWrapper.wrapText(title,30));						   
				
				var xScale = d3.scale.linear()
                                     .domain([0,xAxisData.length])
                                     .range([0,scaleWidth]); 
									 
				var yMin = d3.min(yAxisEstimateData)<d3.min(yAxisActualData)?d3.min(yAxisEstimateData):d3.min(yAxisActualData);
				var yMax = d3.max(yAxisEstimateData)>d3.max(yAxisActualData)?d3.max(yAxisEstimateData):d3.max(yAxisActualData);
				yMin = yMin*.3;
				yMax = yMax * 1.3;
				
				var yScale = d3.scale.linear()
								.domain([yMin,yMax])
								.range([scaleHeight,0]);
						
		//x axis
		
					var largestStringLngth=0;
					for(var counter =0 ;counter<xAxisData.length;counter++)
					{
						if(largestStringLngth<(xAxisData[counter].toString()).length)
						{
							largestStringLngth = (xAxisData[counter].toString()).length;
						}
					}
					
				var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.tickValues(tickController.getXTickArray(0,(xAxisData.length),largestStringLngth, (scaleWidth)));
				
				var xAxisTextRef = compareChartMainGroup.append("g")
										.attr('id','xAxis')
										.attr("class", "xAxis")
										.attr('fill',"none")
										.attr("transform", "translate("+0+"," + scaleHeight + ")")
										.call(xAxis);
							 xAxisTextRef.selectAll('text')
							             .text(function(d){return xAxisData[d];})
										 .style('font-size',fontSize)
										 .attr('font-family',fontFamily)
										 .attr('fill','black');

			       
	//xAxis label here	
		
	var pixcelPerChar=6;
	var totalXLabelPixcel=xAxisLabel.toString().length*pixcelPerChar;
	var xIndicationLabelTop=scaleHeight+(scaleHeight*0.13);
	var xIndicationLabelLeft=scaleWidth/2-totalXLabelPixcel/2;
	axisLabelController.appendLabel(xAxisLabel,xIndicationLabelLeft,xIndicationLabelTop,0,compareChartMainGroup,textStyleConfg.xLabelColor,600);			   							
													
				var yAxis = d3.svg.axis()
								.scale(yScale)
								.orient("left")
								.tickValues(tickController.getTickArray(yMin,yMax,8));
				
				compareChartMainGroup.append("g")
								.attr('id','yAxis')
								.attr("class", "yAxis")
								.attr('fill',"none")
								.attr("transform", "translate("+(-estimateDataBarWidth/2)+"," + 0 + ")")
								.call(yAxis)
								.selectAll('text')
								.style('font-size',fontSize)
								.style('font-family',fontFamily)
								.attr('fill','black');
				
		
		//yAxis label here					
		var totalYLabelPixcel=yAxisLabel.toString().length*pixcelPerChar;			
		var yIndicationLabelTop=scaleHeight/2+totalYLabelPixcel/2;
        var yIndicationLabelLeft=(-compareAnalChart.left/1.5);
		axisLabelController.appendLabel(yAxisLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,compareChartMainGroup,textStyleConfg.yLabelColor,600);			   													   
					
				var estimateRectGroupRef = compareChartMainGroup
											.selectAll('.rect')
											.data(yAxisEstimateData)
						    				.enter()
											.append('rect')
											.attr('width',estimateDataBarWidth)
											.attr('height',0)
											.attr('x',function(d,i){return xScale(i)-(estimateDataBarWidth/2)})
											.attr('y',scaleHeight)
											.attr('fill','#000000')
											.attr("opacity",0.2);
						estimateRectGroupRef
								.transition()
								.duration(1500)
								.attr('height',function(d,i){return yScale(yMin)-yScale(d)})
								.attr('y',function(d,i){return yScale(d)});
								
			var gradient = compareChartMainGroup.append("svg:defs")
						.append("svg:linearGradient")
						.attr("id", "gradient")
						.attr("x1", "0%")
						.attr("y1", "0%")
						.attr("x2", "100%")
						.attr("y2", "100%")
						.attr("spreadMethod", "pad");

						gradient.append("svg:stop")
						.attr("offset", "0%")
						.attr("stop-color", "#bfefee")
						.attr("stop-opacity", 1);

						gradient.append("svg:stop")
						.attr("offset", "50%")
						.attr("stop-color", "#79d1cf")
						.attr("stop-opacity", 1);
						
						 gradient.append("svg:stop")
						.attr("offset", "100%")
						.attr("stop-color", "#bfefee")
						.attr("stop-opacity", 1);

				
				var actualDataBarWidth =  (scaleWidth/(3*xAxisData.length));
				
				var actualRectGroupRef = compareChartMainGroup
											.selectAll('.rect')
											.data(yAxisActualData)
						    				.enter()
											.append('rect')
											.attr('width',actualDataBarWidth)
											.attr('height',0)
								            .attr('x',function(d,i){return xScale(i)-(actualDataBarWidth/2)})                               
								            .attr('y',scaleHeight)
										//	.attr('fill','#ff7f0e');
											.attr('fill',"url(#gradient)")
											.on("mouseover",function()
											{
												d3.select(this).attr('fill',"#3e9ad9");
											})
											.on("mouseleave",function()
											{
												d3.select(this).attr('fill',"url(#gradient)");
											});
											
						actualRectGroupRef
								.transition()
								.duration(1500)
								.attr('height',function(d,i){return yScale(yMin)-yScale(d)})
								.attr('y',function(d,i){return yScale(d)});
			},
		}

		var musicSpikesGraph=
		{
			musicSpikesAnalysis:function(cnfg)
			{
				var title = cnfg.data.title;
				var titleColor = cnfg.data.titleColor;
				var yAxisData = cnfg.data.yAxisData;
				var xAxisData = cnfg.data.xAxisData;
				var yAxisLabel = cnfg.data.yAxisLabel;
				var xAxisLabel = cnfg.data.xAxisLabel;
				var yAxisUnit = cnfg.data.yAxisUnit;
				
				
				var spikesAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.15,top:height*0.1,chartSeparator:5,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
				var scaleWidth=width-spikesAnalChart.left-spikesAnalChart.right;
				var scaleHeight=height-spikesAnalChart.top-spikesAnalChart.bottom;
					
				var fontSize =12,fontFamily = "calibri";	
				var xAxisTimeIndex = [];
			    for(var counter = 0;counter<xAxisData.length ;counter++)
				{
					xAxisTimeIndex[counter] = counter;
				}
				var leftMarginOfSvg = $(selectorElement).offset().left;			
				var spikesChartMainGroup = svgElement.append("g")
								   .attr('class','main-group')
								   .attr("transform", "translate(" + spikesAnalChart.left + "," + spikesAnalChart.top + ")")
								   .on("mouseover",function()
								   {
			
										var x = event.pageX;
										var y = event.pageY;
										x=x-(leftMarginOfSvg+spikesAnalChart.left);
										x = Math.round(xScale.invert(x));
										if(x>=0 && x<xAxisData.length)
										{
										var heading=xAxisData[x];
										var yAxisVal = yAxisData[x] + " "+yAxisUnit;
										var yHeadingValueMap=[{"headingName":yAxisLabel,"headingVal":yAxisVal}];
										
										toolTipManager.showToolTip(d3.event,"",(heading), false,yHeadingValueMap,d3.event.pageY*.90);	
										}
								   })
								   .on("mouseleave",function(){
										toolTipManager.hideTooTip();
									});
				
				// title here
			/*	spikesChartMainGroup.append('text')
							        .attr('class','title')
								   .attr('x',spikesAnalChart.left)
								   .attr('y',(-spikesAnalChart.top/3))
								   .attr('font-size',fontSize*1.4)
								   .attr('text-family',fontFamily)
								   .attr('fill',titleColor)
								   .text(title);*/
				// title label here				   
				axisLabelController.appendLabel(title,spikesAnalChart.left,(-spikesAnalChart.top/3),0,spikesChartMainGroup,textStyleConfg.titleColor,700);
				var xScale = d3.scale.linear()
                                     .domain([0,xAxisData.length])
                                     .range([0,scaleWidth]); 
		
				var yMin = d3.min(yAxisData)*.3;
				var yMax = d3.max(yAxisData)*1.3;
				var yScale = d3.scale.linear()
								.domain([yMin,yMax])
								.range([scaleHeight,0]);
						
		//x axis
				var largestStringLngth=0;
					for(var counter =0 ;counter<xAxisData.length;counter++)
					{
						if(largestStringLngth<(xAxisData[counter].toString()).length)
						{
							largestStringLngth = (xAxisData[counter].toString()).length;
						}
					}
					

				var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.tickValues(tickController.getXTickArray(0,(xAxisData.length),largestStringLngth, (scaleWidth)));
				
				var xAxisTextRef = spikesChartMainGroup.append("g")
										.attr('id','xAxis')
										.attr("class", "xAxis")
										.attr('fill',"none")
										.attr("transform", "translate("+0+"," + scaleHeight + ")")
										.call(xAxis);
							 xAxisTextRef.selectAll('text')
							             .text(function(d){return xAxisData[d];})
										 .style('font-size',fontSize)
										 .attr('font-family',fontFamily)
										 .attr('fill','black');

			/*	var xAxisLabelGroup = spikesChartMainGroup.append("g")
									.attr("class","x-axis-label-group")
									.attr("transform","translate("+scaleWidth/3+","+(scaleHeight+(spikesAnalChart.top))+")")
									xAxisLabelGroup.append('text')
											        .attr('x',0)
													.attr('y',0)
													.attr('font-size',fontSize*1.5)
													.attr('font-family',fontFamily)
													.attr('fill','gray')
													.text(xAxisLabel);*/
			// xAxis label here
			var pixcelPerChar = 6;
			var totalXLabelPixcel=xAxisLabel.toString().length*pixcelPerChar;
			var xIndicationLabelTop=scaleHeight+(scaleHeight*0.13);
			var xIndicationLabelLeft=scaleWidth/2-totalXLabelPixcel/2;

			axisLabelController.appendLabel(xAxisLabel,xIndicationLabelLeft,xIndicationLabelTop,0,spikesChartMainGroup,textStyleConfg.xLabelColor,600);										
													
				var yAxis = d3.svg.axis()
								.scale(yScale)
								.orient("left")
								.tickValues(tickController.getTickArray(yMin,yMax,10));
				
				spikesChartMainGroup.append("g")
								.attr('id','yAxis')
								.attr("class", "yAxis")
								.attr('fill',"none")
								.attr("transform", "translate("+(-fontSize)+"," + 0 + ")")
								.call(yAxis)
								.selectAll('text')
								.style('font-size',fontSize)
								.style('font-family',fontFamily)
								.attr('fill','black');
				
            /*    var yAxisLabelGroup = spikesChartMainGroup.append("g")
									.attr('class','y-axis-label-group')	
				     				.attr("transform","translate("+(-spikesAnalChart.left/2)+","+scaleHeight/1.5+")");			
									
				yAxisLabelGroup.append('text')
								   .attr('font-size',fontSize*1.5)
							       .attr('font-family',fontFamily)
								   .attr('fill','gray')
								   .attr('transform','rotate(-90)')
								   .text(yAxisLabel);		*/
				//yAxis Label here				   
			var totalYLabelPixcel=yAxisLabel.toString().length*pixcelPerChar;
			var yIndicationLabelTop=scaleHeight/2+totalYLabelPixcel/2;
			var yIndicationLabelLeft=(-spikesAnalChart.left/2);	
			axisLabelController.appendLabel(yAxisLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,spikesChartMainGroup,textStyleConfg.yLabelColor,600);	
				
				var barWidth =  (scaleWidth/(2*yAxisData.length)) ;	
				var subRect = [];
				for(var index = 0 ; index<yAxisData.length ; index++)
				{
					
					var rectHeight = yScale(d3.min(yAxisData)*.5)-yScale(yAxisData[index]);
					rectHeight = Math.round(rectHeight/7);
					for(var i =0;i<rectHeight;i++)
					{
						if(i==0)
						{
							subRect.push("newRectangle");
						}
						else
						{
							subRect.push("oldRectangle");
						}	
					}
				}	
					var timeIndexValue = -1;
					var yArrayIndex = -1;
					var YPositionOfRect= 0;
					var colorIndex = -1;
					var yValuetoSetColor=0;
					var rectangleGroupRef = spikesChartMainGroup
									 .selectAll('rect')
									 .data(subRect)
									 .enter()
									 .append('rect')
									 .attr("x",function(d,i)
									 {
										if(d=="newRectangle")
										{
											timeIndexValue++;
										}
										return ((xScale(timeIndexValue))-(barWidth/2));
									 })
									 .attr("y",function(d,i)
									 {return scaleHeight})
									 .attr('width',barWidth)
									 .attr('height',function(d)
									 {
										return 4;
									 })
									 .attr('fill',function(d,i)
									 {
										
										if(d=="newRectangle")
										{
											yValuetoSetColor = 0;
											colorIndex++;
										}
										var yValue = yScale.invert(((yScale(yAxisData[colorIndex]))+((yValuetoSetColor++)*7)));
										if(yValue<(d3.max(yAxisData))*.33)
										{		
											return "#1fb5ad";
										}
										else if(yValue<(d3.max(yAxisData))*.66)
										{
											return "#5cb85c";
										}
										else
										{
											return "#ff7878";
										}
									 });
					//	rectangleGroupRef			 
						rectangleGroupRef.transition()
							.duration(1000)
							.attr("y",function(d,i)
									 {
										if(d=="newRectangle")
										{
											YPositionOfRect=0;
											yArrayIndex++;
										}
										return ((yScale(yAxisData[yArrayIndex]))+((YPositionOfRect++)*7));
										return scaleHeight;
									 });
			},
		};
		var threeDGroupedBarChart = {
			drawThreeDGroupedBarChart: function (id, heightOfBarOne, heightOfBarTwo, options) {
                var cfg = {
                    topMargin: 5,
                    rightMargin: 30,
                    bottomMargin: 0,
                    leftMargin: 10,
                    colorArray:[],
					toolTipLabelForYAxis: "Profit(in Crores)"
                };

                if ('undefined' !== typeof options) {
                    for (var i in options) {
                        if ('undefined' !== typeof options[i]) {
                            cfg[i] = options[i];
                        }
                    }
                }

               
			var margin = {top: 0.1*height, right: 0.05*width, bottom: 0.13*height, left: 0.05*width};					
			var xAxisTicksArray=options.xAxisTickArray;
			
			var scaleWidth  = width - margin.left - margin.right;
			var scaleHeight = height - margin.top - margin.bottom;
			var spacingFactorInBars = (0.9*width) /  (2*heightOfBarOne.length);
			
			var widthOfBars = (0.9 * width) / (2 * (heightOfBarOne.length + heightOfBarTwo.length));
			
			var xSpacingInBars = widthOfBars + spacingFactorInBars;
			
			var maxHeightForBarOneData = d3.max(heightOfBarOne, function(d,i){ return d;});
			var maxHeightForBarTwoData = d3.max(heightOfBarTwo, function(d,i){ return d;});
			
			var maxHeight = maxHeightForBarOneData > maxHeightForBarTwoData ? maxHeightForBarOneData : maxHeightForBarTwoData;
			
			var leftBarMargin = widthOfBars;
			var leftMargins	= 0.03 * height;
			var padding = 0;
			
			
			var sum = 1;				
			for(k=0;k<(''+maxHeight).length - 1;k++)
			{
				sum = sum+"0";				
			}		
			
			var lineFunction = d3.svg.line()
									  .x(function(d) { return d.x; })
									  .y(function(d) { return d.y; })
									 .interpolate("linear");
			
			//The SVG Container
			
			var widthOfBarRegion=((heightOfBarOne.length + heightOfBarTwo.length) * widthOfBars)+ spacingFactorInBars*heightOfBarTwo.length ;
		
			var startX = width  - width * 0.90;
			var xScale = d3.scale.linear()
                    .domain([0, (heightOfBarOne.length)])
					.range([(startX+leftBarMargin), (scaleWidth)]);
					

            var yScale = d3.scale.linear()
                    .domain([0, 1.3 * maxHeight])
                    .range([scaleHeight, 0]);             
			 
            var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
					.tickFormat(formatAsPercentage);

            var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");			
			
            var formatAsPercentage = d3.format("1");							
			
		//	xAxis.tickValues(d3.range(0, heightOfBarOne.length, 1));
			yAxis.tickValues(d3.range(0, 1.3* maxHeight, ((1.3* maxHeight)/10)));
			
			var maxYScale =	maxHeight + 100*(''+maxHeight).length;			
			var nextY = yScale(1.3*maxHeight);			
			
			
			svgElement=svgElement
						.append("g")
						.attr("transform","translate("+width*0.07+","+margin.top+")");
						//.attr("transform","translate("+widthOfBarRegion*0.05+","+height*0.03+")");
			
		
			widthOfBarRegion=widthOfBarRegion+widthOfBarRegion*0.15;
			
			function drawHorizontalLines(startX, startY, widthOfBars, maxHeight, heightOfBarOne, nextY)
			{
				maxHeight = yScale(maxHeight);
				startY = yScale(startY);
				
				
				var scaleLine=[];				
						for(l=0; l<3; l++)
						{
							if(l==0)
							{
								
								x = startX-widthOfBarRegion*0.05;
								y = (startY-nextY) - 0.04 * widthOfBarRegion;
								
							}	
							else if(l==1)
							{
								x=startX-20;
								y=(startY-nextY);
							}
							else if(l==2)
							{
								x=scaleWidth;
								y=(startY-nextY);														
							}
						
							scaleLine.push(JSON.parse('{"x":'+x+',"y":'+y+'}'));                      
						}
						return scaleLine;					
			}
			
	
			var startY = yScale(1.2*maxHeight) ;					
			
			
			var svgContainer = svgElement;
			for(j=0;j<10;j++)
			{
			
				var lineGraph = svgContainer.append("path")
									.attr("d", lineFunction(drawHorizontalLines(startX, startY, widthOfBars, maxHeight, heightOfBarOne, nextY)))
									//.attr("stroke", "blue")
									.attr("stroke-width", 0.5)
									.attr("fill", "none");	
				
				var lineGraphLength= lineGraph.node().getTotalLength();

									lineGraph
									  .attr("stroke-dasharray", lineGraphLength + " " + lineGraphLength)
									  .attr("stroke-dashoffset", lineGraphLength)
									  .transition()
									  .duration(2000)
									  .ease("linear")
									  .attr("stroke-dashoffset", 1)
									  .attr("stroke", "blue")
									  .attr("stroke-width", 0.5)
									  .attr("fill", "none");
			
						
			
				nextY=nextY + (yScale(0) - yScale((1.3* maxHeight)/10));						
			}
			
			
			var startY= height - height * 0.90;		
			var colorGradientArray = ["#aaaa00","#75c200","#006bd5"];
			var colorArray = options.colorArray;
	
			
			
			
			for(var j=0;j<heightOfBarOne.length;j++)
			{			
				
				var lineGraph1 = svgContainer.append("path")	
								.attr("class", "threeDGroupedBarChart "+j)
								.attr("d", lineFunction(getSidesCordinates(xScale(j), startY, widthOfBars, heightOfBarTwo[j], 1, heightOfBarTwo[j])))							
								.attr('val',function(){
									var cordinateArray=getSidesCordinates(xScale(j), startY, widthOfBars, heightOfBarTwo[j], 1, heightOfBarTwo[j]);
									return cordinateArray[0].height;
								})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								})
								.on("mouseout", function (d, i) {
									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								})
								.attr("fill", "#99FF00");
																	
				
				
					
										
				
				var lineGraph2 = svgContainer.append("path")
								.attr("class", "threeDGroupedBarChart "+j)
								.attr("d", lineFunction(getSidesCordinates(xScale(j), startY, widthOfBars, heightOfBarTwo[j], 2, heightOfBarTwo[j])))
								.attr('val',function(){
										var cordinateArray=getSidesCordinates(xScale(j), startY, widthOfBars, heightOfBarTwo[j], 2, heightOfBarTwo[j]);
										return cordinateArray[0].height;
									})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								})
								.on("mouseout", function (d, i) {

									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								})
								.attr("fill", "#99FF00");
				
					
				
					var lineGraph3 = svgContainer.append("path")
								.attr("class", "threeDGroupedBarChart "+j)
								.attr("d", lineFunction(getSidesCordinates(xScale(j), startY, widthOfBars, heightOfBarTwo[j], 3, heightOfBarTwo[j])))
								.attr('val',function(){
										var cordinateArray=getSidesCordinates(xScale(j), startY, widthOfBars, heightOfBarTwo[j], 3, heightOfBarTwo[j]);
										return cordinateArray[0].height;
									})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								})
								.on("mouseout", function (d, i) {

									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								})
								.attr("fill", "#99FF00");
					
							

			
			var lineGraph1 = svgContainer.append("path")	
								.attr("class", "threeDGroupedBarChart "+j)
								.attr("d", lineFunction(getSidesCordinates(xScale(j)-widthOfBars, startY, widthOfBars, heightOfBarOne[j], 1, heightOfBarOne[j])))							
								.attr('val',function(){
									var cordinateArray=getSidesCordinates(xScale(j)-widthOfBars, startY, widthOfBars, heightOfBarOne[j], 1, heightOfBarOne[j]);
									return cordinateArray[0].height;
								})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								})
								.on("mouseout", function (d, i) {
									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								})
								.attr("fill", "#666666");
																	
					
				
				
			var lineGraph2 = svgContainer.append("path")
								.attr("class", "threeDGroupedBarChart "+j)
								.attr("d", lineFunction(getSidesCordinates(xScale(j)-widthOfBars, startY, widthOfBars, heightOfBarOne[j], 2, heightOfBarOne[j])))
								.attr('val',function(){
										var cordinateArray=getSidesCordinates(xScale(j)-widthOfBars, startY, widthOfBars, heightOfBarOne[j], 2, heightOfBarOne[j]);
										return cordinateArray[0].height;
									})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								})
								.on("mouseout", function (d, i) {

									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								})
								.attr("fill", "#666666");
				
											  
											
							
							
			
									  
				var lineGraph3 = svgContainer.append("path")
								.attr("class", "threeDGroupedBarChart "+j)
								.attr("d", lineFunction(getSidesCordinates(xScale(j)-widthOfBars, startY, widthOfBars, heightOfBarOne[j], 3, heightOfBarOne[j])))
								.attr('val',function(){
										var cordinateArray=getSidesCordinates(xScale(j)-widthOfBars, startY, widthOfBars, heightOfBarOne[j], 3, heightOfBarOne[j]);
										return cordinateArray[0].height;
									})
								.attr("xVal",xAxisTicksArray[j])	
								.attr("fill", "white")
								.on("mouseover",function(){
									var yHeadingValueMap=[{"headingName":cfg.toolTipLabelForYAxis,"headingVal":d3.select(this).attr('val')}];
									toolTipManager.showToolTip(d3.event,"",(options.xLabel+" "+d3.select(this).attr('xVal')), false,yHeadingValueMap);
								   
								})
								.on("mouseout", function (d, i) {

									var targetElement = d3.select(this);
									toolTipManager.hideTooTip();
								})
								.attr("fill", "#666666");
				
					}
				
				var eleArray=$(".threeDGroupedBarChart").hide();
				for(var m=0; m<eleArray.length; m++){
					
					$(eleArray[m]).slideUp(m * 300).delay(m *100).fadeIn();					
				}

			function getSidesCordinates(x,y,width,height,sideno,heightOfBar){
				
			
				height = yScale(0) - yScale(height) ;
				
				
				var lineData=[];
				
				if(sideno==1){
						var factor=parseInt(width*.33) + 1;
						var xHit=0;
						var yHit=0;
						for(var i=0;i<5;i++){
									
						   if(i==0)
						   {
								y = yScale(0);				   
						   }
						   else if(i==1)
						   {
							   //height = yScale(y+height) - yScale(y);
							   y = y - height;								 
						   }
						   else if(i==2)
						   {
							   x=x+width;   
						   }
						   else if(i==3)
						   {
							   y=y+height;    
						   }     
							else if(i==4)
						   {
							  x=x-width;    
						   }
							
							var nextY=y;
							var nextX=x;
							   
						  //  alert(nextX+"::"+nextY);
							lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}'));                      
						}                               
				}
					  else if(sideno==2){
					  

						var factor=parseInt(width*.33) + 1;
						
						var xHit=0;
						var yHit=0;
						y = yScale(y); 
						
						for(var i=0;i<4;i++){
									
						   if(i==0)
						   {
							   y = yScale(0);
								//y = yScale(y);				   
						   }
						   else if(i==1)
						   {
							  // factor = yScale(y) - yScale(y + factor);
							   x=x-factor;
							   y=y-factor;								 
						   }
						   else if(i==2)
						   { 								
							   y=y-height;
							   //alert(" Y : "+ y  + "Height : " + height);
							
								//y = y + height;
							  // console.log("  Y : " +  y + " Height : " + height);
							 //  y = y - 1000;   
							   //nextY=nextY + (yScale(nextY) - yScale(nextY+spacingInHorizontalLines));	
						   }
						   else if(i==3)
						   {
							   x=x+factor;
							   y=y+factor;    
						   }     
							   
							var nextY=y;
							var nextX=x;
							lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}'));  
						}                               
						
					}
					else if(sideno==3){
						var factor=parseInt(width*.33) + 1;
						var xHit=0;
						var yHit=0;
						for(var i=0;i<4;i++){
									
						   if(i==0)
						   {
								y=yScale(0) - height;
									
						   }
						   else if(i==1)
						   {
							   x=x-factor;
							   y=y-factor;
								 
						   }
						   else if(i==2)
						   {
							   x=x+width;   
						   }
						   else if(i==3)
						   {
							   x=x+factor;
							   y=y+factor;    
						   }     
							   
							var nextY=y;
							var nextX=x;
							   
							lineData.push(JSON.parse('{"x":'+nextX+',"y":'+nextY+',"height":'+heightOfBar+'}')); 
						                   
						}                               
						
					}
				
					return lineData;
					
				}
					
			function mMove(){

				 var m = d3.mouse(this);
				 console.log(m);
				 d3.select(this).select("title").text(yScale(m[1]));
			}
			
			var largestStringLngth=0;
			for(var counter =0 ;counter<xAxisTicksArray.length;counter++)
			{
				if(largestStringLngth<(xAxisTicksArray[counter].toString()).length)
				{
					largestStringLngth = (xAxisTicksArray[counter].toString()).length;
				}
			}
			xAxis.tickValues(tickController.getXTickArray(0,(xAxisTicksArray.length),largestStringLngth, (width-(startX+leftBarMargin))));
			var xAxisRef = svgContainer.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate("+(0)+"," + (scaleHeight) + ")")
                    .call(xAxis);
					
			xAxisRef.selectAll("text")
					.text(function(d){
						return xAxisTicksArray[d];
					});

			
					
			var startXForXTicks = width  - width * 0.90;				
            var yAxisRef=svgContainer.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + (startXForXTicks-widthOfBarRegion*0.05) + ","+ (-0.04 * widthOfBarRegion)  +")")
                    .call(yAxis);	   
			yAxisRef.selectAll("line").style("display",'none');
			yAxisRef.selectAll("path").style("display",'none');	
			
			//y indicationa label
			var indexOfParaenthesis=yAxisRef.attr("transform").indexOf("(")+1;
			var indexOfComma=yAxisRef.attr("transform").indexOf(",");
			 
			var pixcelPerChar=6;
			var yTotalPixcel=cfg.yLabel.toString().length*pixcelPerChar;
			var yLabelTop=scaleHeight/2+yTotalPixcel/2;
			
			var yLabelLeft;
			if(width<400){
				yLabelLeft=-parseInt(yAxisRef.attr("transform").substring(indexOfParaenthesis,indexOfComma))*2;
			}else{
				yLabelLeft=-parseInt(yAxisRef.attr("transform").substring(indexOfParaenthesis,indexOfComma))*0.95
			}
			
			axisLabelController.appendLabel(cfg.yLabel,yLabelLeft,yLabelTop,-90,yAxisRef,textStyleConfg.yLabelColor,600);
			
			//x indication label
			var xLabelPixcel=cfg.xLabel.length*pixcelPerChar;
			var xLabelTop=(scaleHeight*0.15);
			var xLabelLeft=(scaleWidth)/2-xLabelPixcel/2;
			axisLabelController.appendLabel(cfg.xLabel,xLabelLeft,xLabelTop,0,xAxisRef,textStyleConfg.xLabelColor,600);
			
			}
		}

		var barWithLabelGraph = 
		{
			barWithLabelAnalysis:function(data)
			{
				var yAxisData = data.yAxisData;
				var xAxisData = data.xAxisData;
				var colorArray = data.colorArray;
				var averageValue = data.averageValue;
				var unit = data.unit
				var bottomLabel = data.bottomLabel;
				
				var barAnalChart={left:width*0.15,right:width*0.1,bottom:height*0.25,top:height*0.15,chartSeparator:5,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
				var scaleWidth=width-barAnalChart.left-barAnalChart.right;
				var scaleHeight=height-barAnalChart.top-barAnalChart.bottom;
				var legendSize = 10;
				
				var gridManager =   
								{
										init: function (svg, height, width, left, top) 
									{
										var hfactor = Math.ceil(height * .1);
										var hRange = Math.ceil(height / hfactor);
										svg.selectAll(".hline").data(d3.range(hRange)).enter()
											.append("line")
											.attr("y1", function (d) {
											return d * hfactor+10;
										})
											.attr("y2", function (d) {
											return d * hfactor+10;
										})
											.attr("x1", function (d) {
											return 0;
										})
											.attr("x2", function (d) {
											return width;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");
										}
								};
						
				gridManager.init(svgElement, scaleHeight, scaleWidth, barAnalChart.left, barAnalChart.top);
			
				var xAxisTimeIndex = [];
			    for(var counter = 0;counter<xAxisData.length ;counter++)
				{
					xAxisTimeIndex[counter] = counter;
				}
		
				var barMainGroup = svgElement.append("g")
					.attr('class','barMainGroup')
                    .attr("transform", "translate(" + (barAnalChart.left) + "," + barAnalChart.top + ")")
					
				// xScale here
				
				var xScale = d3.scale.linear()
							         .domain([0,xAxisData.length-1])
                                     .range([0,scaleWidth]);

				
			/*	var xAxis = d3.svg.axis()
                                  .scale(xScale)
                                  .orient("bottom")
								  .tickValues(tickController.getXTickArray(0,(xAxisData.length),largestStringLngth, (scaleWidth)));
	   
                var xAxisGroup = barMainGroup.append("g")
									.attr("class","x-axis")
									.attr("transform","translate("+0+","+(scaleHeight)+")")

						       	    .attr('fill','none')
									//.style('display','none')
									.call(xAxis)
									.selectAll('text')
									.text(function(d){return xAxisData[d]})
									.attr('fill','black');*/

				var yMin = d3.min(yAxisData);
				var yMax = d3.max(yAxisData)*1.5;
				
				if(yMin<0)
				{
					yMin = yMin * 1.5;
				}
				
				//yScale here
				
				var yScale = d3.scale.linear()
							         .domain([yMin,yMax])
                                     .range([scaleHeight,0]);
	            
				var yAxis = d3.svg.axis()
                                  .scale(yScale)
                                  .orient("left");
	             
                var yAxisGroup = barMainGroup.append("g")
									.attr("class","left-y-axis")
									.attr("transform","translate("+(-barAnalChart.left*0.2)+","+0+")")
						       	    .attr('fill','none')
									.call(yAxis)
									.selectAll('text')
									.attr('fill','black');
									
				// draw bar here 
				
				var dataBarWidth =  (scaleWidth/(3*xAxisData.length));
				
				var rectGroupRef = barMainGroup
											.selectAll('.rect')
											.data(yAxisData)
						    				.enter()
											.append('rect')
											.attr('width',dataBarWidth)
											.attr('height',0)
								            .attr('x',function(d,i){return xScale(i)-(dataBarWidth/2)})                               
								            .attr('y',yScale(averageValue))
										//	.attr('fill','#ff7f0e');
											.attr('fill',function(d,i){return colorArray[i];})
										//	.on("mouseover",function()
										//	{
										//		d3.select(this).attr('fill',"#3e9ad9");
										//	})
										//	.on("mouseleave",function()
										//	{
										//		d3.select(this).attr('fill',"url(#gradient)");
										//	});
											
						rectGroupRef
								.transition()
								.duration(1500)
								.attr('height',function(d,i)
								{
									if(d>averageValue){return yScale(averageValue)-yScale(d);}
									else{return yScale(d) - yScale(averageValue);}
								})
								.attr('y',function(d,i)
								{
									if(d>averageValue){return yScale(d);}
									else{return yScale(averageValue);}
								});
									
				// bar label here
				var textGroupRef = barMainGroup.selectAll('.text')
											   .data(yAxisData)
											   .enter()
										       .append('text')
											   .attr('x',function(d,i){return xScale(i)-(dataBarWidth/3)})
											   .attr('y',function(d,i)
											   {
													if(d>averageValue){return yScale(d)-5;}
													else{return yScale(d)+15;}
											   })
											   .attr('fill',function(d){if(d>averageValue){return "green";}else{return "red";}})
											   .text(function(d)
											   {
												if(d>averageValue){return "+"+d+" "+unit;}
												else{return d+" "+unit;}
											   });
				
				// draw legend here
		
					var yPositionOfLegend = scaleHeight+scaleHeight*0.02;
					var legendPositionArray = legendController.showHorizontalLegend(scaleWidth,yPositionOfLegend,xAxisData,legendSize);
					
				var legendRef = barMainGroup.selectAll('.rect')
										    .data(legendPositionArray)
										    .enter()
											.append('rect')
											.attr('width',legendSize)
											.attr('height',legendSize)
											.attr('x',function(d,i){ return legendPositionArray[i].x;})
											.attr('y',function(d,i){return legendPositionArray[i].y;})
											.attr('fill',function(d,i){return colorArray[i]});
				
				var legendTextRef = barMainGroup.selectAll('.text')
										    .data(legendPositionArray)
										    .enter()
											.append('text')
											.attr('x',function(d,i){return legendPositionArray[i].textXPos;})
											.attr('y',function(d,i){return legendPositionArray[i].y + legendSize;})
											.attr('font-family','calibri')
											.text(function(d,i){return xAxisData[i];}); 
				
				// draw dotted line here
				
				var dottedLineRef = barMainGroup.append('line')
												.attr('x1',0)
												.attr('y1',(scaleHeight + (barAnalChart.bottom*.7)))
												.attr('x2',scaleWidth)
												.attr('y2',(scaleHeight + (barAnalChart.bottom*.7)))
												.attr('stroke','lightsteelblue');
				
				var lineTotalLength = scaleWidth;

                dottedLineRef.attr("stroke-dasharray", function (d) {


                    var dashLen = 3;
                    var ddLen = dashLen * 2;
                    var darray = dashLen;
                    while (ddLen < lineTotalLength) {
                        darray += "," + dashLen + "," + dashLen;
                        ddLen += dashLen * 2;
                    }

                        return darray + "," + lineTotalLength;
                })
                    .attr("stroke-dashoffset", lineTotalLength)
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0);
			
			// bottom label here
				barMainGroup.append('text')
							.attr('x',((scaleWidth/2)-(bottomLabel.length*6)/2))
							.attr('y',(scaleHeight + (barAnalChart.bottom*.7)+15))
							.attr('font-size',14)
							.style('font-style','bold')
							.style('font-family','calibri')
							.text(bottomLabel);

				
			}
		};
			
		/**
			logo Chart
		*/
		
		var drawLogoChart={
			logoChart:function(cnfg){
			
				width = $(selectorElement).width()*0.98;
				height = $(selectorElement).height()*0.98;
				//textStyleConfg=styleConfg;
				
				var margin={left:width*0.05,right:width*0.05,bottom:height*0.1,top:height*0.05,chartSeparator:5};
				
				var scaleWidth=width-margin.left-margin.right;
				var scaleHeight=height-margin.top-margin.bottom;
				
				var tital = cnfg.tital; 
				
				var textArray=cnfg.textArray;
				var imageArray=cnfg.imageArray;
				var arrowImageArray=cnfg.arrowImageArray;
				var imageFrameColorArray=cnfg.imageFrameColor;
				var legendArray=cnfg.legendArray;
				var legendColorArray=cnfg.legendColorArray;
				
				//make Array of data
				var maxRows=3;
				var elementPerRow=Math.ceil(imageArray.length/maxRows);
				
				var profilingElem=svgElement
								  .append("g")
				                  .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");	
				
				xScale =d3.scale.linear()
                    .range([0,scaleWidth-margin.right]);
				
				
				var minX=0;
						 
				var maxX=imageArray.length-1;
				
				yScale =d3.scale.linear()
                    .range([(scaleHeight-margin.top),margin.bottom]);
				
				
				/*
				xScale.domain([0,elementPerRow]);
				yScale.domain([0,(maxRows)]);	
				
				var chartData=[];	
				var y=0,x=0,counter=0;
				for(var i=0;i<imageArray.length;i++){
					
					counter++;
					console.log("counter "+counter +"  "+(counter>(elementPerRow)));
					if(counter>(elementPerRow)){
						y++;
						x=0;
						counter=1;
					}
					
					
					var obj={"x":x,"y":y,"index":i};
					chartData.push(obj);
					console.log("x "+obj.x+"  y"+obj.y +" row "+elementPerRow+" c"+counter);
					x++;
				}
				*/
				
				var maxColumns;
				
				
				if(width>400){
					maxColumns=4;
				}else{
					maxColumns=3;
				}
				
				
				
				//if data length is less than column length then take data.length as xScale max 
				//else xScale max is maxColumn
				if(imageArray.length>maxColumns){
					elementPerRow=maxColumns;
				}else{
					elementPerRow=imageArray.length;
				}
				
				maxRows=Math.ceil(imageArray.length/maxColumns);
				yScale.domain([0,(maxRows)]);	
				
				xScale.domain([0,elementPerRow]);
				
				//iterate data to set x and y for each record
				//whenever elementPerRow exceed it means we need to start new row 
				var chartData=[];	
				var y=maxRows-1,x=0,counter=0;
				for(var i=0;i<imageArray.length;i++){
					
					counter++;
					console.log("counter "+counter +"  "+(counter>(elementPerRow)));
					if(counter>(elementPerRow)){
						y--;
						x=0;
						counter=1;
					}
					
					
					var obj={"x":x,"y":y,"index":i};
					chartData.push(obj);
					console.log("x "+obj.x+"  y"+obj.y +" row "+elementPerRow+" c"+counter);
					x++;
				}
				
				//find the difference between two nearest x and y points
				//if there is only one point then divide its value to max scale
				
				var differenceX,differenceY;
				if(chartData[1]){
					differenceX=(xScale(chartData[1].x)-xScale(chartData[0].x))/2;
				}else{
					differenceX=xScale(chartData[0].x+0.5);
				}
				
				if(maxRows>1){
					differenceY=(yScale(chartData[maxColumns].y)-yScale(chartData[0].y))/2;
				}else{
					differenceY=yScale(chartData[0].y+0.5);
				}
				//var differenceX=(xScale(chartData[1].x)-xScale(chartData[0].x))/2;
				//var differenceY=(yScale(chartData[elementPerRow].y)-yScale(chartData[0].y))/2;
				
				//find min difference between two points to set radius
				var tempRadius=0;
				tempRadius=(differenceY>differenceX)?differenceX:differenceY;
				
				tempRadius=Math.abs(tempRadius);
				var imageRadius=tempRadius;
				
				//arc radius will be always half of image radius because it cover area according to diametr
				var arcRadius=tempRadius*0.50;
				
				
				var xAxis= d3.svg.axis()
							 .scale(xScale)
                             .orient("bottom");
				
				var yAxis= d3.svg.axis()
							 .scale(yScale)
                             .orient("left");
							 
				svgElement.append("g")
				.attr("transform", "translate(" + (margin.left) + "," + (scaleHeight) + ")")
				.call(xAxis);	
                
				svgElement.append("g")
				.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")")
				.call(yAxis);				
				
				for(var i=0;i<chartData.length;i++){
					chartData[i]["imageWidth"]=imageRadius;
					chartData[i]["imageHeight"]=imageRadius;
					chartData[i]["arcRadius"]=arcRadius;
					chartData[i]["profileImageName"]=imageArray[i];
					chartData[i]["arrowImageName"]=arrowImageArray[i];
					chartData[i]["imageFrameColor"]=imageFrameColorArray[i];
					chartData[i]["text"]=textArray[i];
					//chartData[i]["remark"]=
					drawProfile(chartData[i],profilingElem);
					//alert(arcRadius +" "+imageRadius);
				}
				
				
				//legend here
					var legendSize = 10;
					var yPositionOfLegend = scaleHeight+scaleHeight*0.02;
					var legendPositionArray = legendController.showHorizontalLegend(scaleWidth,yPositionOfLegend,legendArray,legendSize);
					
				var legendRef = profilingElem.selectAll('.rect')
										     .data(legendPositionArray)
										     .enter()
											 .append('rect')
											 .attr('width',legendSize)
											 .attr('height',legendSize)
											 .attr('x',function(d,i){ return legendPositionArray[i].x;})
											 .attr('y',function(d,i){return legendPositionArray[i].y;})
											 .attr('fill',function(d,i){return legendColorArray[i]});
				
				var legendTextRef = profilingElem.selectAll('.text')
										     .data(legendPositionArray)
										     .enter()
											 .append('text')
											 .attr('x',function(d,i){return legendPositionArray[i].textXPos;})
											 .attr('y',function(d,i){return legendPositionArray[i].y + legendSize;})
											 .attr('font-family','calibri')
											 .text(function(d,i){return legendArray[i];});
				
		/*		var legendGrouping=svgElement.append("g")
						  .attr("class","legend-grouping")
						  .attr("transform", "translate(" + (margin.left) + "," + (scaleHeight) + ")");*/
				
				/*
				legendGrouping.selectAll("rect.legend")
							  .data(legendArray)
							  		
				*/			  	
				
				function drawProfile(obj,parentElem){
						var profileGrouping=parentElem.append("g")
									 .attr("class",""+obj["profileImageName"])
									 .attr("transform", "translate(" + (0) + "," + (0) + ")");
						
						var y=obj["y"]+0.5;
						var x=obj["x"]+0.5;
						var arcInnerRadius=obj["arcRadius"];
						var arcOuterRadius=obj["arcRadius"]*1.2;
						var arrowImageWidth=(arcOuterRadius*2)*0.8;
						//var arrowImageHeight=obj["imageHeight"]*0.5;
						var arrowImageHeight=(arcOuterRadius*2)*0.6;
						var imageFrameColor=obj["imageFrameColor"];
						var profileImageName=obj["profileImageName"];
						var profileImageWidth=obj["imageWidth"];
						var profileImageHeight=obj["imageHeight"];
						
						var pie = d3.layout.pie()
							.sort(null)
							.value(function(d) { return d;});
							
						var arc = d3.svg.arc()
								   .innerRadius(arcInnerRadius)
								   .outerRadius(arcOuterRadius)
								   .startAngle(0)
								   .endAngle(360);
								   
						
						//arc
						profileGrouping.append("path")
										.attr("d",arc)
										.attr("transform",function(){
											return  "translate(" + (xScale(x)) + "," + (yScale(y)) + ")";
										})
										.attr("fill",imageFrameColor);
						
							
						//profileImage	
						profileGrouping.append("image")
										.attr("xlink:href",profileImageName)
										.attr("width",profileImageWidth)
										.attr("height",profileImageHeight)
										.attr("x",(xScale(x)-obj["imageWidth"]/2))
										.attr("y",(yScale(y)-obj["imageHeight"]/2))
						
						var arrowImageXPos=xScale(x)-obj["imageWidth"]/2;
						var arrowImageYPos=(yScale(y)+arrowImageHeight*0.2);
						
						//arrow image	
						profileGrouping.append("image")
										.attr("xlink:href",obj["arrowImageName"])
										.attr("width",arrowImageWidth)
										.attr("height",arrowImageHeight)
										.attr("x",(arrowImageXPos))
										.attr("y",(arrowImageYPos));
						
						var textData=obj["text"].toString();
						var pixcelPerChar=8;
						var fontSize=arrowImageWidth>arrowImageHeight?arrowImageHeight*0.25:arrowImageWidth*0.25;
						fontSize=Math.round(fontSize);
						
						if(fontSize>20){
							fontSize=20;
						}
						if(fontSize<10){
							fontSize=10;
						}
						
						var textXPos=xScale(x)-(textData.length/2)*pixcelPerChar;
						var textYPos=yScale(y)+arrowImageHeight*0.8-fontSize*0.25;
						
						
						//append text as remarks
						profileGrouping.append("text")
										.attr("x",textXPos)
										.attr("y",textYPos)
										.attr("dx",".2em")
										.attr("dy",".1em")
										.attr("text-anchor","start")
										.text(textData)
										.attr("fill","white")
										.attr("font-size",fontSize);
										
				}
					
				
			}
		}
		

		
		
		var detailAnalysisGraph = 
		{
			detailAnalysis:function(cnfg)
			{
				var leftYAxisData = cnfg.data.leftYAxisData;
				var rightYAxisData = cnfg.data.rightYAxisData;
				var xAxisData = cnfg.data.xAxisData;
				var topYSymbolArray = cnfg.data.topYSymbolArray;
				var bottomYSymbolArray = cnfg.data.bottomYSymbolArray;
				var title = cnfg.data.title;
				var titleColor = cnfg.data.titleColor;
				var titleSize = cnfg.data.titleSize;
				var rightYAxisLabel =cnfg.data.rightYAxisLabel;
				var leftYAxisLabel =cnfg.data.leftYAxisLabel;
				var xAxisLabel = cnfg.data.xAxisLabel;
				
				var detailAnalChart={left:width*0.1,right:width*0.1,bottom:height*0.13,top:height*0.1,chartSeparator:5,xScalePaddingTop:height*0.2,yScalePaddingLeft:width*0.1};
				var scaleWidth=width-detailAnalChart.left-detailAnalChart.right;
				var scaleHeight=height-detailAnalChart.top-detailAnalChart.bottom;
				
				var imageFolderPath=cnfg.data.imageFolderPath;
				
				var bottomYSymbolLabel=cnfg.data.bottomYSymbolLabel;
				var leftYAxisUnit=cnfg.data.leftYAxisUnit;
				var rightYAxisUnit=cnfg.data.rightYAxisUnit;
				
                var textFamily = 'calibri',textSize = 14;
				
				var xAxisTimeIndex = [];
			    for(var counter = 0;counter<xAxisData.length ;counter++)
				{
					xAxisTimeIndex[counter] = counter;
				}
				var gridManager =   
								{
										init: function (svg, height, width, left, top) 
									{
										var hfactor = Math.ceil(height * .1);
										var vfactor = Math.ceil(height * .1);
										var hRange = Math.ceil(height / hfactor);

										var vRange = Math.ceil(width / vfactor);

										svg.selectAll(".hline").data(d3.range(hRange)).enter()
											.append("line")
											.attr("y1", function (d) {
											return d * hfactor+10;
										})
											.attr("y2", function (d) {
											return d * hfactor+10;
										})
											.attr("x1", function (d) {
											return 0;
										})
											.attr("x2", function (d) {
											return width;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");



										svg.selectAll(".vline").data(d3.range(vRange)).enter()
											.append("line")
											.attr("x1", function (d) {
											return d * vfactor;
										})
											.attr("x2", function (d) {
											return d * vfactor;
										})
											.attr("y1", function (d) {
											return 0;
										})
											.attr("y2", function (d) {
											return height;
										})
											.style("stroke", "#eee")
											.attr("transform", "translate(" + left + "," + top + ")");
									}

								};
						
				gridManager.init(svgElement, scaleHeight, scaleWidth, detailAnalChart.left, detailAnalChart.top);
            
		  //alert($("#line28").offset().left);
			var leftMarginOfSvg = $(selectorElement).offset().left;
				var scoredMainGroup = svgElement.append("g")
					.attr('class','scoredMainGroup')
                    .attr("transform", "translate(" + detailAnalChart.left + "," + detailAnalChart.top + ")")
					.on("mouseover",function()
					{
						var x = event.pageX;
						var y = event.pageY;
						console.log("x = "+x+" y = "+y);
						x=x-(leftMarginOfSvg+detailAnalChart.left);
						x = Math.round(xScale.invert(x));
						
						console.log("x = "+x+" y = "+y);
						var ballType=bottomYSymbolArray[x];
						var runPerBall=topYSymbolArray[x];
						
						var averageUnit=leftYAxisUnit;
						var averageVal=leftYAxisData[x];
						
						var totalRunUnit=rightYAxisUnit;
						var totalRun=rightYAxisData[x];
						
						var yHeadingValueMap=[{"headingName":bottomYSymbolLabel,"headingVal":ballType},
											//  {"headingName":"sss","headingVal":runPerBall},
											  {"headingName":averageUnit,"headingVal":averageVal},
											  {"headingName":totalRunUnit,"headingVal":totalRun}
											  ];
						
						toolTipManager.showToolTip(d3.event,"",(runPerBall), false,yHeadingValueMap);	
					})
					.on("mouseleave",function(){
						toolTipManager.hideTooTip();
					});
			
				//left y scale
							   
				// title label here
				axisLabelController.appendLabel(title,detailAnalChart.left,0,0,scoredMainGroup,textStyleConfg.titleColor,700);
				
				// Right YAxis Label here
				var pixcelPerChar = 6;
				var totalYLabelPixcel=rightYAxisLabel.toString().length*pixcelPerChar;
				var leftYIndicationLabelTop=scaleHeight/2-totalYLabelPixcel/2;
				var leftYIndicationLabelLeft=(scaleWidth+(scaleWidth*0.01));
				axisLabelController.appendLabel(rightYAxisLabel,leftYIndicationLabelLeft,leftYIndicationLabelTop,90,scoredMainGroup,textStyleConfg.yLabelColor,600);			   
				
				// left YAxis Label here
				var totalYLabelPixcel=leftYAxisLabel.toString().length*pixcelPerChar;
				var rightYIndicationLabelTop=scaleHeight/2+totalYLabelPixcel/2;
				var rightYIndicationLabelLeft=(-detailAnalChart.yScalePaddingLeft/2);
				axisLabelController.appendLabel(leftYAxisLabel,rightYIndicationLabelLeft,rightYIndicationLabelTop,-90,scoredMainGroup,textStyleConfg.yLabelColor,600);			   

				// xAxis label here
				var totalXLabelPixcel=xAxisLabel.toString().length*pixcelPerChar;
				var xIndicationLabelTop=scaleHeight+(scaleHeight*0.13);
				var xIndicationLabelLeft=scaleWidth/2-totalXLabelPixcel/2;
				axisLabelController.appendLabel(xAxisLabel,xIndicationLabelLeft,xIndicationLabelTop,0,scoredMainGroup,textStyleConfg.xLabelColor,600);
				
							   
				var leftYScale = d3.scale.linear()
									 .domain([d3.min(leftYAxisData)*.7,d3.max(leftYAxisData)*1.5])
									 .range([scaleHeight,0]);
	            
				var leftYAxis = d3.svg.axis()
                                  .scale(leftYScale)
                                  .orient("left");
	             
                var LeftYAxisGroup = scoredMainGroup.append("g")
									.attr("class","left-y-axis")
									.attr("transform","translate("+0+","+0+")")
						       	    .attr('fill','none')
								//	.style('display','none')
									.call(leftYAxis)
									.selectAll('text')
									.attr('fill','black');
				//right y scale
				var rightYScale = d3.scale.linear()
									 .domain([d3.min(rightYAxisData)*.8,d3.max(rightYAxisData)*1.1])
									 .range([scaleHeight,0]);
	            
				var rightYAxis = d3.svg.axis()
                                  .scale(rightYScale)
                                  .orient("left");
	             
                var yAxisGroup = scoredMainGroup.append("g")
									.attr("class","right-y-axis")
									.attr("transform","translate("+(scaleWidth)+","+0+")")
						       	    .attr('fill','none')
								//	.style('display','none')
									.call(rightYAxis)
									.selectAll('text')
									.attr('fill','black');
				
				var xAxisTimeIndex = [];
			    for(var counter = 0;counter<xAxisData.length ;counter++)
				{
					xAxisTimeIndex[counter] = counter;
				}
				
				var xScale = d3.scale.linear()
							         .domain([0,xAxisData.length-1])
                                     .range([0,scaleWidth*.9]);
	            
					var largestStringLngth=0;
					for(var counter =0 ;counter<xAxisData.length;counter++)
					{
						if(largestStringLngth<(xAxisData[counter].toString()).length)
						{
							largestStringLngth = (xAxisData[counter].toString()).length;
						}
					}
					

				
				var xAxis = d3.svg.axis()
                                  .scale(xScale)
                                  .orient("bottom")
								  .tickValues(tickController.getXTickArray(0,(xAxisData.length),largestStringLngth, (scaleWidth)));
	   
                var xAxisGroup = scoredMainGroup.append("g")
									.attr("class","x-axis")
									.attr("transform","translate("+0+","+(scaleHeight)+")")
						       	    .attr('fill','none')
									//.style('display','none')
									.call(xAxis)
									.selectAll('text')
									.text(function(d){return xAxisData[d]})
									.attr('fill','black');
				
				var bottomSymbolSize = scaleWidth/(bottomYSymbolArray.length*2);
				var bottomYAxisImages = scoredMainGroup.selectAll('img')
							   .data(bottomYSymbolArray)
		     				   .enter()
							   .append('image')
							   .attr('x',function(d,i){return 0})
							   .attr('y',function(d,i){return scaleHeight-(bottomSymbolSize)})
							   .attr('width',bottomSymbolSize)
							   .attr('height',bottomSymbolSize)
							   .attr("xlink:href",function(d,i){
									return imageFolderPath+""+ d+'.png';
								});
								
		   bottomYAxisImages.transition()
							.duration(2500)
							.attr('x',function(d,i){return xScale(xAxisTimeIndex[i])-(bottomSymbolSize/2)});

				
											
				var rightLine = d3.svg.line()
								.x(function(d,i) {return xScale(xAxisTimeIndex[i]); })
								.y(function(d,i) {return rightYScale(rightYAxisData[i]); })                       
								.interpolate("cardinal");
				var topSymbolSize = scaleWidth/(topYSymbolArray.length*2);
				var rightLineGraph = scoredMainGroup.selectAll(".path")
										 .data([rightYAxisData])
										 .enter()
										 .append("path")
										 .attr("d", rightLine)	  
										 .attr("stroke","red")
										 .attr("stroke-width",1)
										 .attr("fill", "none");
				
				//transition
				var totalLength = rightLineGraph.node().getTotalLength();

                rightLineGraph.attr("stroke-dasharray", function (d) {
				
					
                        return totalLength + "," + totalLength;
                })
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0);


				
				
				
			var topYAxisImages = 	scoredMainGroup.selectAll('img')
							   .data(topYSymbolArray)
		     				   .enter()
							   .append('image')
							   .attr('x',function(d,i){return 0})
							   .attr('y',function(d,i){return 0})
							   .attr('width',topSymbolSize)
							   .attr('height',topSymbolSize)
							   .attr("xlink:href",function(d,i){
									return imageFolderPath+""+d+'.png'
								});
						topYAxisImages.transition()
							.duration(2500)
							.attr('x',function(d,i){ return  xScale(xAxisTimeIndex[i])-(topSymbolSize/2)})
							.attr('y',function(d,i){return rightYScale(rightYAxisData[i])-(topSymbolSize+5)});
		
				var leftLine = d3.svg.line()
								.x(function(d,i) {return xScale(xAxisTimeIndex[i]); })
								.y(function(d,i) {return leftYScale(leftYAxisData[i]); })                       
								.interpolate("cardinal");
				var leftLineGraph = scoredMainGroup.selectAll(".path")
										 .data([leftYAxisData])
										 .enter()
										 .append("path")
										 .attr("d", leftLine)	  
										 .attr("stroke","green")
										 .attr("stroke-width",1)
										 .attr("fill", "none");
									//	 .style("stroke-dasharray", ("3, 3"));
				//transition dashed Line
				var leftLineTotalLength = leftLineGraph.node().getTotalLength();

                leftLineGraph.attr("stroke-dasharray", function (d) {


                    var dashLen = 3;
                    var ddLen = dashLen * 2;
                    var darray = dashLen;
                    while (ddLen < leftLineTotalLength) {
                        darray += "," + dashLen + "," + dashLen;
                        ddLen += dashLen * 2;
                    }

                        return darray + "," + leftLineTotalLength;
                })
                    .attr("stroke-dashoffset", leftLineTotalLength)
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0);
				
				//hide axis path
				hideAxisPath(svgElement);
				
				//set font here
				setTextStyleAndSvgBackGround(svgElement);	

			},
		};
		
		var drawThreeDBubbleChart=
		{
				threeDBubbleChart:function(cnfg)
				{
							
					var title = cnfg.data.title;
					var titleColor = cnfg.data.titleColor;
					var yAxisData = cnfg.data.yAxisData;
					var yAxisLabel = cnfg.data.yAxisLabel;
					var xAxisData = cnfg.data.xAxisData;
					var xAxisLabel = cnfg.data.xAxisLabel;
					var series = cnfg.data.series;
					var legendArray=cnfg.data.legendArray;
				//	alert(title)
					if(width<501)
					{
							titleFontSize = 18
							gridFactor = 8;
							fontSize = 11;
							rectangleSize = 9;
							rectangleTextSize =9;
					}
					else
					{	
							titleFontSize = 20;
							gridFactor = 12;
							fontSize = 14;
							rectangleSize = 10;
							rectangleTextSize =10;
					}
					
					var fontFamily = 'calibri';
					var xAxisLabelColor = "black"
					
					var actualWidth = width < height ? width : height;

					var margin = {top: 0.15*height, right: 0.15*width, bottom: 0.15*height, left: 0.15*width};


					var arrraySampleData = [];

					function inputDataToRequiredData(series)
					{
						
						for(var j = 0 ; j < series.length ; j++)
						{
							var sData = [];
						   
								for(var k = 0; k < series[j].data.length; k++)
								{             
									 var reqD = series[j].data[k]  ;             sData.push(JSON.parse('{"x":'+reqD[0]+',"y":'+reqD[1]+',"r":'+reqD[2]+'}'));
									
								}
							arrraySampleData.push(sData);
						}
						return arrraySampleData;
					}

					var actualData = inputDataToRequiredData(series);

					var minXScale = d3.min(actualData[0], function (d) { return d.x; });
					var maxXScale = d3.max(actualData[0], function (d) { return d.x; });;
					var minYScale = d3.min(actualData[0], function (d) { return d.y; });
					var maxYScale = d3.max(actualData[0], function (d) { return d.y; });
					var maxRadius =  d3.max(actualData[0], function (d) { return d.r; });;
					var minRadius = d3.min(actualData[0], function (d) { return d.r; });;
					var currentMaxRadius = 0;
					var currentMinRadius = 0;
					   
					var currentMinXScale = 0;
					var currentMaxXScale = 0;
						
					var currentMinYScale = 0;
					var currentMaxYScale = 0;

					for(var a = 1 ; a < actualData.length ; a ++)
					{
							// console.log("  actualDataElement[b] : " + JSON.stringify(actualDataElement[b]));
							 
							 //alert(JSON.stringify(actualDataElement[b]));
							 currentMaxRadius = d3.max(actualData[a], function (d) { return d.r; });
							 currentMinRadius = d3.min(actualData[a], function (d) { return d.r; });  
							   
							 //console.log("  currentMaxRadius : "+ currentMaxRadius);
							 currentMaxXScale = d3.max(actualData[a], function (d) { return d.x; });
							 currentMinXScale = d3.min(actualData[a], function (d) { return d.x; });
							 
							 currentMaxYScale = d3.max(actualData[a], function (d) { return d.y; });
							 currentMinYScale = d3.min(actualData[a], function (d) { return d.y; });
						
						 if(currentMaxRadius > maxRadius)
							 maxRadius = currentMaxRadius;
						
						 if(currentMinRadius < minRadius)
							 minRadius = currentMinRadius;
						
						 if(currentMaxXScale > maxXScale)
							 maxXScale = currentMaxXScale;
						
						 if(currentMinXScale < minXScale)
							 minXScale = currentMinXScale;
						
						 if(currentMaxYScale > maxYScale)
							 maxYScale = currentMaxYScale;
						
						 if(currentMinYScale < minYScale)
							 minYScale = currentMinYScale;

					}

					var scale = d3.scale.linear().domain([0, maxRadius]).range([0 , 0.1*actualWidth]);

					var xRange = d3.scale.linear().range([margin.left, width - margin.right]).domain([0, 1.1*maxXScale]);

					var yRange = d3.scale.linear().range([height-margin.top,margin.bottom]).domain([minYScale, 1.2*maxYScale]);

					var xAxis = d3.svg.axis().scale(xRange).orient("bottom");
					var yAxis = d3.svg.axis().scale(yRange).orient("left");

							/*
							var vis = d3.select("#svgChart")
									 .append("svg")
									 .attr("width", width)
									 .attr("height", height)
									 .append("g")
									 .attr("transform", "translate(" + (0) + "," + 0 + ")");
							*/
						  
						  var vis = svgElement
									 .append("g")
									 .attr('class','bubble-main-group')
									 .attr("transform", "translate(" + (0) + "," + 0 + ")");
						  
					//title label here
					axisLabelController.appendLabel(title,margin.left*1.5,margin.top/2,0,vis,textStyleConfg.titleColor,700);
					//xAxis Label here
					var pixcelPerChar = 6;
					var totalXLabelPixcel=xAxisLabel.toString().length*pixcelPerChar;
					var xIndicationLabelTop=(height-margin.top)+((height-margin.top)*0.13);
					var xIndicationLabelLeft=(width - margin.right)/2-totalXLabelPixcel/2;
					axisLabelController.appendLabel(xAxisLabel,xIndicationLabelLeft,xIndicationLabelTop,0,vis,textStyleConfg.xLabelColor,600);
					
					//yAxis Label here	  
					var totalYLabelPixcel=yAxisLabel.toString().length*pixcelPerChar;
					var yIndicationLabelTop=(height)/2+totalYLabelPixcel/2;
					var yIndicationLabelLeft=(margin.left/2);
					axisLabelController.appendLabel(yAxisLabel,yIndicationLabelLeft,yIndicationLabelTop,-90,vis,textStyleConfg.yLabelColor,600);
					
					var colorGradientArray = ["#aaaa00","#75c200","#006bd5"];
					var colorArray = cnfg.data.colorArray;

					var x = 0;

					for(var e = 0 ; e < actualData.length; e++)
					{
							vis.selectAll("circle.s"+ e)   
							.data(actualData[e])
							.enter()
							.insert("circle")
							.attr("cx", function (d) { return xRange(d.x); })
							.attr("cy", function (d) { return yRange(d.y); })
							.attr("r", function (d) { return getActualRadius(d.r) })    
							.on("mouseover",function(d,i){
								var yHeadingValueMap=[{"headingName":yAxisLabel,"headingVal":d.y}];
						
								toolTipManager.showToolTip(d3.event,"",xAxisLabel+" "+(d.x), false,yHeadingValueMap);	
							})
							.on("mouseleave",function(d,i){
								toolTipManager.hideTooTip();	
							})
							.transition()
							.duration(1000)
							.attr("opacity", 0.3)
							.attr("class",'s'+ e)
							//.attr("fill",function (d, m) { return colorArray[e] }); 
							//.attr('fill', 'url(#gradient+'+e+')')
							.attr('fill',  function(d, i) {
								return "url(#gradient" + e + ")" ;
							});
							 
					   
							
						var gradient = vis.append("svg:defs")
							.append("svg:linearGradient")
							.attr("id", "gradient"+e)
							.attr("x1", "0%")
							.attr("y1", "0%")
							.attr("x2", "100%")
							.attr("y2", "100%")
							.attr("spreadMethod", "pad");
						
						// Define the gradient colors
						gradient.append("svg:stop")
							.attr("offset", "0%")
							//.attr("stop-color", colorGradientArray[e])
							.attr("stop-color", colorArray[e])
							.attr("stop-opacity", 1);
						
						gradient.append("svg:stop")
							.attr("offset", "100%")
							//.attr("stop-color", colorGradientArray[e]+1000)
							.attr("stop-color", colorArray[e]+1000)
							.attr("stop-opacity", 1);
						
					}

					function getActualRadius(radius)
					{
					   var val = scale(radius);
						
					   if(val < 0.008*actualWidth)
					   {
						   val = 0.008*actualWidth;
					   }
					   if(val > 0.04*actualWidth)
					   {
							val = 0.04*actualWidth;   
					   }
					   return val;    
					}


					vis.append("g")         
							.attr("class", "xGrid")
							.attr("transform", "translate(0," + (width - margin.bottom) + ")")
							.call(make_x_axis()        
							.tickSize(-width + margin.bottom , 0, 0)
							.tickFormat("")
							 
							).attr("opacity","0.3");

					   vis.append("g")         
							.attr("class", "yGrid")
						   .attr("transform",  "translate("+ margin.left +","+0+")")
							.call(make_y_axis()
							.tickSize(-height + 2*margin.bottom, 0, 0)
							.tickFormat("")
							).attr("opacity","0.3");


					function make_x_axis() {        
						return d3.svg.axis()
							 .scale(xRange)
							 .orient("bottom")
							 .ticks(10);
					}

					function make_y_axis() {        
						return d3.svg.axis()
							.scale(yRange)
							.orient("left")
							.ticks(10);
					}

				  vis.append("svg:g")
						.attr("class","xAxis axis")
						.transition()
						.call(xAxis)       
						.attr("transform", "translate("+ 0 +","+ (actualWidth - 0.9*margin.bottom) +")")
						.attr("stroke", 'black');
						
						vis.append("svg:g")
						.attr("class", "yAxis axis")
						.transition()
						.call(yAxis)        
						.attr("transform", "translate("+ 0.9*margin.left +","+0+")")
						.attr("stroke", 'black');

					
					
					svgElement.selectAll('.yAxis path').attr("fill", "none");
					svgElement.selectAll('.xAxis path').attr("fill", "none");

					svgElement.selectAll('.xGrid').attr("stroke", "lightgrey");
					svgElement.selectAll('.yGrid').attr("stroke", "lightgrey");

					svgElement.selectAll('.xGrid ').attr("opacity", 0.5);
					svgElement.selectAll('.yGrid ').attr("opacity", 0.5);

					svgElement.selectAll('.xGrid .tick').attr("stroke-width", 0);
					svgElement.selectAll('.yGrid .tick').attr("stroke-width", 0);
					
					

					var legendTop=height-margin.top;
					var chartWidth=width-margin.right;
					
					var legendGrouping = vis.append("g")
                    .attr("class", "legend-grouping")
                    .attr('transform', 'translate(' +0.9*margin.left + ','+(legendTop * 0.13)+')');

				  
				  var legendWidth = 12;
				  var legendHeight = 12;
				/*
				
				  if(width > 300)
				  {
					  legendWidth = 12;
					  legendHeight = 12;
				  }
				  else
				  {
					  legendWidth = 10;
					  legendHeight = 10;
				  }
				 */
				 
				
				var nextLineCounter=0;
				var xPos=(chartWidth*.05),xPos1=(chartWidth*.05),yPos=0;
				var positionXArray=[];
				var positionYArray=[];
				
				var legendPositionArray=legendController.getLegendPositionArray(legendArray,chartWidth,legendTop);
				
				for(var i=0;i<legendPositionArray.length;i++){
					console.log("x "+legendPositionArray[i].x +" y "+legendPositionArray[i].y +" end "+legendPositionArray[i].endPos);
				}
				
				legendGrouping.selectAll('rect.legendRect')
						.data(legendArray)
						.enter()
						.append("rect")
						.attr("class","legendRect")
						.attr("x", function (d, i) {
							return legendPositionArray[i].x;
						})
						.attr("y", function(d,i){
							return legendPositionArray[i].y;
						})
						.attr("width", legendWidth)
						.attr("height", legendHeight)
						
						.style("fill", function (d, i) {
							return "url(#gradient" + i + ")" ;
						})
						.attr("opacity", 0.3);
						/*
						.on("click", function (d) {
							
							var state = d3.selectAll("." + d.key.replace(/ /g,'')).style("display");
							if (state == "none") {

								$("."+d.key.replace(/ /g,'')).slideUp(400).delay(400).fadeIn();
							  
							} else {

								var selectedPath = svgElement.selectAll("." + d.key.replace(/ /g,''));
								$("."+d.key.replace(/ /g,'')).slideDown(400).delay(400).fadeOut();                              
							}
							
						});	
						*/
                           
                    newXCord=0;
					
                    legendGrouping.selectAll('text')
                            .data(legendArray)
                            .enter()
                            .append("text")
                            .attr("x", function (d, i) {
								return legendPositionArray[i].textPos;
							})
							.attr("y",function(d,i){
								return (legendPositionArray[i].y)+legendHeight;
							})
							.attr("width", legendWidth)
                            .attr("height", legendHeight)
                            .attr("font-size", 12)
                           //.attr("dx", "1.50em")
                            //.attr("dy", "1.15em")
                            .text(function (d, i) {
								return d;
							});
								
					
						
					
					//hide axis path
					hideAxisPath(svgElement);
					
					//set font here
					setTextStyleAndSvgBackGround(svgElement);	
					
					
				}
		};
		
		
		
        return {
            drawLine: lineChart.drawLine,
            drawBarWithMultipleLineAndCircle: lineChart.drawBarWithMultipleLineAndCircle,
            squareChart: drawSquare.squareChart,
            areaChart: drawAreaChart.areaChart,
            circleChart: drawCircle.circleChart,
            pieChart: drawPieChart.pieChart,
			gaugeGraph: drawGauageGraph.gaugeGraph,
            drawYAxis: agnitioChart.drawYAxis,
            drawMulitpleLineChartWithSquare: agnitioChart.drawMulitpleLineChartWithSquare,

			
            setYSclae: drawBar.setYSclae,
            drawPyramidChart: pyramidChart.drawPyramidChart,
			draw3DPyramidChartWithoutSlice:pyramidChart.draw3DPyramidChartWithoutSlice,
			draw3DPyramidSliceChart:pyramidChart.draw3DPyramidSliceChart,
            drawRadarChart: radarChart.drawRadarChart,
            drawDrillDownChart: drillDownChart.drawDrillDownChart,
            drawPieChartWithTransition: pieChartWithTransition.drawPieChartWithTransition,
			dountChartWithLegend:pieChartWithTransition.dountChartWithLegend,
			drawDountWithBarChart:pieChartWithTransition.drawDountWithBarChart,
			multipleDountChartAnalysis:pieChartWithTransition.multipleDountChartAnalysis,
            drawHeatMapChart: heatMapChart.drawHeatMapChart,
            groupedBarChart: drawBar.groupedBarChart,
			groupedBar2DChart: drawBar.groupedBar2DChart,
			bulletBar:drawBar.bulletBar,
			cricketAnalysis:drawBar.cricketAnalysis,
			barWithLogo:drawBar.barWithLogo,
            drawScatterPlotChart: scatterPlotChart.drawScatterPlotChart,
            drawBasicLineChart: basicLineChart.drawBasicLineChart,
			drawThreeDBarChart: threeDBarChart.drawThreeDBarChart,
			drawStackedAreaChart: stackedAreaChart.drawStackedAreaChart,
			stackedBarChart:drawBar.stackedBarChart,
			drawFunnelChart:funnelChart.drawFunnelChart,
			areaChart:drawAreaChart.areaChart,
			meterChart:drawMeter.meterChart,
			turnNeedle:drawMeter.turnNeedle,
			drawCombinationalChart:combinationalChart.drawCombinationalChart,
			drawThreeDStackedBarChart: threeDStackedBarChart.drawThreeDStackedBarChart,
			variationAnalysis:darwVariationAnalysisGraph.variationAnalysis,
			areaChartWithNegativeValueAnalysis:areaChartWithNegativeValueGraph.areaChartWithNegativeValueAnalysis,
			areaChartWithVaryColorAnalysis:areaChartWithVaryColorGraph.areaChartWithVaryColorAnalysis,
			musicSpikesAnalysis:musicSpikesGraph.musicSpikesAnalysis,
			comparisonAnalysis:comparisonGraph.comparisonAnalysis,
			drawThreeDGroupedBarChart: threeDGroupedBarChart.drawThreeDGroupedBarChart,
			globChartAnalysis:globAnalysisGraph.globChartAnalysis,
			detailAnalysis:detailAnalysisGraph.detailAnalysis,
			threeDBubbleChart:drawThreeDBubbleChart.threeDBubbleChart,
			treeChart:drawTreeChart.treeChart,
			barWithLabelAnalysis:barWithLabelGraph.barWithLabelAnalysis,
			logoChart:drawLogoChart.logoChart
			
			
		
        };
    };
	function convertDateIntoYYMMDD(date) {
    var month = date.getMonth() + 1;
    var dateInDigit = date.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (dateInDigit < 10) {
        dateInDigit = "0" + dateInDigit;
    }
    var dateInString = date.getFullYear() + "-" + month + "-" + dateInDigit;
    return dateInString;
}


var meterChart={
			image:'',
			needle:'',
			plot:'',
			arc:'',
			prevdata:90,
			text:'',
            init:function(selectorId,imageURL){
						
						var width=d3.select("#"+selectorId).style("width");
						var height=d3.select("#"+selectorId).style("height");
						
						width=parseInt(width.replace("px",""));
						height=parseInt(height.replace("px",""))
						
						var svg = d3.select("#"+selectorId).append("svg")
						.attr("width", width)
						.attr("height", height)
						.append("g")
						.attr("transform","translate("+(width/4)+","+0+")");
						
						//Path inner and outer radius is adjusted
						this.arc = d3.svg.arc()
						.innerRadius(30)
						.outerRadius(120)
						.startAngle(120 * (Math.PI/180))
						.endAngle(240 * (Math.PI/180));

						//alert(height);
						//alert(width);

						var plot = svg
						.append("g")
						.attr("class", "arc");

						this.image = svg.append("svg:image")
						.attr('x',20)
						.attr('y',0)
						.attr('width', 300-20)
						.attr('height', 250)
						.attr("xlink:href","gauge_skin.jpg")
						.attr("id", "fillImage")
						//.on("click", turnNeedle);
						
						this.text = svg.append("svg:text")
                    
                         .attr("transform","translate(165,220)")
                         .attr("text-anchor", "middle")
                         .text("");

						this.needle = svg
						.append("g")
						.attr("class", "needle")
						.attr("transform", "translate( 20 , 70)")
						.append("path")
						.attr("class", "tri")
						.attr("d", "M" + (300/2 + 2) + " " + (120 + 10) + " L" + 300/2 + " 0 L" + (300/2 - 3) + " " + (120 + 10) + " C" + (300/2 - 3) + " " + (120 + 20) + " " + (300/2 + 3) + " " + (120 + 20) + " " + (300/2 + 3) + " " + (120 + 10) + " Z")
						.attr("transform", "rotate(-90, " + 300/2 + "," + (120 + 10) + ")");
				},

				turnNeedle:function(data)
				{    
					 
					if(data<0){
						 meterChart.text
						 .transition()
						.attr('stroke','red')
						.text(data);
					}
					else{
					     meterChart.text
						 .transition()
						 .attr('stroke','green')
						 .text(data);
					}
					this.needle
						.transition()
						.duration(1000)
						.attrTween("transform", tween);
					var x = this.getAngleFromCoordinate(meterChart.getCoordinateFromData(meterChart.prevdata));
					
					var y = this.getAngleFromCoordinate(meterChart.getCoordinateFromData(meterChart.getPercentFromAngle(meterChart.getAngleForProfitAndLoss(data))));				   
					
					function tween(d, i, a) {
						return d3.interpolateString("rotate("+ x +", 150, 130)", "rotate("+ y +", 150, 130)");
					}				
					
				},   

				getPercentFromAngle:function(data)
				{
					if(data < 0 && data >= -180)
						return -(data*5/9);
					else 
						return (data*5/9);
				},
				getAngleFromCoordinate:function(x)
				{
					var angle = 0;
					var intialSum = 90;
					return angle+= intialSum * x;
				},

				 getCoordinateFromData:function(percent)
				{
					var coodinate;
					  coordinate = ((percent/100) - (1-percent/100)) ;      
					
					return coordinate;    
				},
				 getRadianFromData:function(percent)
				{
					var coodinate;
					  coordinate = percent / 57.2958;      
					
					return coordinate;    
				},

				 callTurnNeedle:function()
				{
					   var x = (Math.random() * 100) ;

						meterChart.turnNeedle(x);
						meterChart.prevdata = x;
				},
				
				getAngleForProfitAndLoss:function(x)
				{
					var angle;
					
					if(x > 0 && x <= 100)
					{
							angle = 90 + (0.9 * x); 
					}
					else{	
					
							angle =  90 + (0.9 * x);
					}
					//console.log(angle);
					return angle;				
				}
				
}

/*dashboard charts*/
/*dashboard charts*/
/*dashboard charts*/
/*dashboard charts*/
StockMarketChartManager={
	xScaleHistoricChart:'',
	data:'',
	cmfConfigurations:'',
	lineChartConfiguration:'',
	powerGauageChartConfiguration:'',
	selectorContainerId:'',
	chartHeightMap:{},
	margin:{top:10,left:20,right:20,bottom:10},
	scalableLimit:2,
	areaSubsetArray:[],
	area:'',
	textLabelDx:50,
	dateArray:[],
	chartStyleMap:{"hlcChart":"block","cmfChart":"block","powerGaugeChart":"block"},
	
	drawStockMarketCharts:function(id,data,cmfConfigurations,lineChartConfiguration,powerGauageChartConfiguration,dateArray){
		
		StockMarketChartManager.selectorContainerId=id;
		
		//d3.select("#"+id).style("background","#3A5568");
		
		StockMarketChartManager.emptyCharts();
		StockMarketChartManager.getHeightOfEachChart();
		
		StockMarketChartManager.cmfConfigurations=cmfConfigurations;
		StockMarketChartManager.lineChartConfiguration=lineChartConfiguration;
		StockMarketChartManager.powerGauageChartConfiguration=powerGauageChartConfiguration;
		
		
		StockMarketChartManager.data=data;
		StockMarketChartManager.dateArray=dateArray;
		
		StockMarketChartManager.drawHLCChart(lineChartConfiguration);
		StockMarketChartManager.drawCmfChart(cmfConfigurations);
		StockMarketChartManager.drawPowerGauageChart(powerGauageChartConfiguration);
		StockMarketChartManager.drawTimeScale(dateArray);
		StockMarketChartManager.attachHoveringEffect();
		StockMarketChartManager.listenWindowResize();	
		StockMarketChartManager.appendToolTip();	
		//StockMarketChartManager.attachPanningAndZooming(StockMarketChartManager.xScaleHistoricChart,id);
		
	},
	listenWindowResize:function(){
		$(window).resize(function () {
			StockMarketChartManager.updateChartOnResize();
		});
	},
	attachHoveringEffect:function(){
		
		var containerId=StockMarketChartManager.selectorContainerId;
		var margin=StockMarketChartManager.margin;
		
		var dateArray= StockMarketChartManager.dateArray;
		var hlcData=StockMarketChartManager.lineChartConfiguration.data;
		var cmfData=StockMarketChartManager.cmfConfigurations.data;
		var powerGauageData=StockMarketChartManager.powerGauageChartConfiguration.data;
		
		var hlcHighFieldName=StockMarketChartManager.lineChartConfiguration["highFieldName"];
		var hlcCloseFieldName=StockMarketChartManager.lineChartConfiguration["closeFieldName"];
		var hlcLowFieldName=StockMarketChartManager.lineChartConfiguration["lowFieldName"];
		
		
		var cmfFieldName=StockMarketChartManager.cmfConfigurations["fieldName"];
		var powerGaugeFieldName=StockMarketChartManager.powerGauageChartConfiguration["pgrFieldName"];
		
		d3.select("#"+containerId)
		.on("mousemove",function(){
		    console.log("mousemove ");
			var xScale=StockMarketChartManager.xScaleHistoricChart;	
			var marginLeft=margin.left-margin.left*0.08;
			
			var pageX=event.pageX-$("#"+containerId).offset().left;
			var lineXPos=Math.round(xScale.invert(pageX));
			
			if(lineXPos<0 || lineXPos>(dateArray.length-1)){
				//console.log("out of bound");
				d3.select("#"+containerId)
				.selectAll(".drag-line")
				.style("display","none");
				
				StockMarketChartManager.hideToolTip();
			}
			else{
				d3.select("#"+containerId)
				.selectAll(".drag-line")
				.attr("x1",xScale(lineXPos))
				.attr("x2",xScale(lineXPos));
				
				var hlcHigh=hlcData[lineXPos][hlcHighFieldName];
				var hlcClose=hlcData[lineXPos][hlcCloseFieldName];
				var hlcLow=hlcData[lineXPos][hlcLowFieldName];
				
				var cmfValue=cmfData[lineXPos][cmfFieldName];
				var powerGaugeVal=powerGauageData[lineXPos][powerGaugeFieldName];
				
				console.log(hlcHigh+" :: "+"::"+hlcClose+" :: "+hlcLow+":: "+cmfValue +" :: "+powerGaugeVal + " :: "+dateArray[lineXPos]);
				
				 var yHeadingValueMap=[{"headingName":hlcCloseFieldName,"headingVal":hlcClose},
									   {"headingName":hlcHighFieldName,"headingVal":hlcHigh},
									   {"headingName":hlcLowFieldName,"headingVal":hlcLow},
									   {"headingName":cmfFieldName,"headingVal":cmfValue},
									   {"headingName":powerGaugeFieldName,"headingVal":powerGaugeVal}
									   
									  ];
				 
				StockMarketChartManager.showToolTip(d3.event, "", dateArray[lineXPos],false,yHeadingValueMap ,"");
				
				d3.select("#"+containerId)
				.selectAll(".drag-line")
				.style("display","block");
			}
		})
		.on("mouseleave",function(){
				StockMarketChartManager.hideToolTip();
				
				d3.select("#"+containerId)
				.selectAll(".drag-line")
				.style("display","none");
			
		})
	},
	updateChartOnResize:function(){
	
		var cmfConfigurations=StockMarketChartManager.cmfConfigurations;
		var lineChartConfiguration=StockMarketChartManager.lineChartConfiguration;
		var powerGauageChartConfiguration=StockMarketChartManager.powerGauageChartConfiguration;
		
		StockMarketChartManager.emptyCharts();
		
		//StockMarketChartManager.chartStyleMap[chartName]="none";
		
		var isShowHlC=StockMarketChartManager.chartStyleMap["hlcChart"];
		var isShowCMF=StockMarketChartManager.chartStyleMap["cmfChart"];
		var isShowPowerGauage=StockMarketChartManager.chartStyleMap["powerGaugeChart"];
		
		StockMarketChartManager.getHeightOfEachChart();
		//var data=StockMarketChartManager.data;
		if(isShowHlC == "block"){
			StockMarketChartManager.drawHLCChart(lineChartConfiguration);
		}
		
		if(isShowCMF == "block"){
			StockMarketChartManager.drawCmfChart(cmfConfigurations);
		}
		
		if(isShowPowerGauage == "block"){
			StockMarketChartManager.drawPowerGauageChart(powerGauageChartConfiguration);
		}
		
		var dateArray=StockMarketChartManager.dateArray;
		StockMarketChartManager.drawTimeScale(dateArray);
	},
	updateChartWithData:function(data){
		var id=StockMarketChartManager.selectorContainerId;
		var cmfConfigurations=StockMarketChartManager.cmfConfigurations;
		var lineChartConfiguration=StockMarketChartManager.lineChartConfiguration;
		var powerGauageChartConfiguration=StockMarketChartManager.powerGauageChartConfiguration;
		
		StockMarketChartManager.drawStockMarketCharts(id,data,cmfConfigurations,lineChartConfiguration,powerGauageChartConfiguration);
	},
	hideChart:function(chartName){
		var id=StockMarketChartManager.selectorContainerId;
		//d3.select("#"+id).select("."+chartName).style("display",'none');
		
		var cmfConfigurations=StockMarketChartManager.cmfConfigurations;
		var lineChartConfiguration=StockMarketChartManager.lineChartConfiguration;
		var powerGauageChartConfiguration=StockMarketChartManager.powerGauageChartConfiguration;
		
		
		
		StockMarketChartManager.emptyCharts();
		
		StockMarketChartManager.chartStyleMap[chartName]="none";
		
		var isShowHlC=StockMarketChartManager.chartStyleMap["hlcChart"];
		var isShowCMF=StockMarketChartManager.chartStyleMap["cmfChart"];
		var isShowPowerGauage=StockMarketChartManager.chartStyleMap["powerGaugeChart"];
		
		StockMarketChartManager.getHeightOfEachChart();
		//var data=StockMarketChartManager.data;
		if(isShowHlC == "block"){
			StockMarketChartManager.drawHLCChart(lineChartConfiguration);
		}
		
		if(isShowCMF == "block"){
			StockMarketChartManager.drawCmfChart(cmfConfigurations);
		}
		
		if(isShowPowerGauage == "block"){
			StockMarketChartManager.drawPowerGauageChart(powerGauageChartConfiguration);
		}
		
		var dateArray=StockMarketChartManager.dateArray;
		StockMarketChartManager.drawTimeScale(dateArray);
		
		
	},
	showChart:function(chartName){
		var id=StockMarketChartManager.selectorContainerId;
		//d3.select("#"+id).select("."+chartName).style("display",'block');
		
		StockMarketChartManager.chartStyleMap[chartName]="block";
		
		var isShowHlC=StockMarketChartManager.chartStyleMap["hlcChart"];
		var isShowCMF=StockMarketChartManager.chartStyleMap["cmfChart"];
		var isShowPowerGauage=StockMarketChartManager.chartStyleMap["powerGaugeChart"];
		
		var cmfConfigurations=StockMarketChartManager.cmfConfigurations;
		var lineChartConfiguration=StockMarketChartManager.lineChartConfiguration;
		var powerGauageChartConfiguration=StockMarketChartManager.powerGauageChartConfiguration;
		
		StockMarketChartManager.emptyCharts();
		
		StockMarketChartManager.getHeightOfEachChart();
		//var data=StockMarketChartManager.data;
		if(isShowHlC == "block"){
			StockMarketChartManager.drawHLCChart(lineChartConfiguration);
		}
		
		if(isShowCMF == "block"){
			StockMarketChartManager.drawCmfChart(cmfConfigurations);
		}
		
		if(isShowPowerGauage == "block"){
			StockMarketChartManager.drawPowerGauageChart(powerGauageChartConfiguration);
		}
		
		var dateArray=StockMarketChartManager.dateArray;
		StockMarketChartManager.drawTimeScale(dateArray);
		
	},
	attachPanningAndZooming:function(xScale,id){
		var panningAndZooming=d3.behavior.zoom().x(xScale).scaleExtent([1, 8]).on("zoom", zoom);					
		d3.select('#'+id).call(panningAndZooming);
		var scalableLimit=StockMarketChartManager.scalableLimit;
		
		var width=d3.select('#'+id).style("width").replace("px","");
		
		function zoom() {
			
			var t = panningAndZooming.translate(),
			tx = t[0],
			ty = t[1];

			tx = Math.min(tx, 0);
			tx = Math.max(tx, width -( scalableLimit*width) );
			panningAndZooming.translate([tx, ty]);
			/* 
			d3.select("#xAxisCloseDifference").call(xAxisHistoricCharts);
			
			historicChartSvg.select(".historicLineDema").attr('d',demaLine(historicChartData));
			d3.selectAll('.closePriceDifferenceRect').data(historicChartData)
			.attr('x',function(d){ //console.log("update rect");
			return xScaleHistoricChart(parseDate.parse(d.timeIndex));})
			.attr('y',function(d){ return yScaleCloseDifference(d.close);});
			
			d3.selectAll('.closeBar').data(historicChartData)
						.attr('x',function(d){
							return xScaleHistoricChart(parseDate.parse(d.timeIndex));
						})
						.attr('y',function(d){
							return yScaleHistoricChart(d.close);
						});
			*/	
			
			var datRef=d3.selectAll('.money-flow-area ').data([StockMarketChartManager.areaSubsetArray])
			.attr('d',function(d){return StockMarketChartManager.area(d);});
			
			
		} 
	},
	emptyCharts:function(){
		var id=StockMarketChartManager.selectorContainerId;
		document.getElementById(""+id).innerHTML="";
		
	},
	getHeightOfEachChart:function(){
		var id=StockMarketChartManager.selectorContainerId;
		
		var containerHeight=d3.select("#"+id).style("height");
		
		containerHeight=parseInt(containerHeight.replace("px",""));
		
		var  chartHeightMap={"cmf":'',"hlc":"","powergauage":""};
		
		var cmfChartDisplay=StockMarketChartManager.chartStyleMap["cmfChart"];
		var lineChartDisplay=StockMarketChartManager.chartStyleMap["hlcChart"];
		var powerGauageChartDisplay=StockMarketChartManager.chartStyleMap["powerGaugeChart"];
		
		/*
		try{
			cmfChartDisplay=d3.select("#"+id).select(".cmfChart").style("display");
		}
		catch(err){
			console.log("cmf chart not exist");
		}
		
		try{
			lineChartDisplay=d3.select("#"+id).select(".hlcChart").style("display");
		}
		catch(err){
			console.log("line chart not exist");
		}
		
		try{
			powerGauageChartDisplay=d3.select("#"+id).select(".powerGaugeChart").style("display")
		}
		catch(err){
			console.log("gauage chart not exist");
		}
		*/
		
		var midHeight= containerHeight/2;	
		//height of hlc
		var hlcHeight=containerHeight;
		if(powerGauageChartDisplay == 'block'){
			hlcHeight=hlcHeight-midHeight/3;
		}
		
		if(cmfChartDisplay == "block"){
			hlcHeight=hlcHeight-midHeight/1.5;
		}
		
		
		//cmf height
		var cmfHeight=containerHeight;
		if(powerGauageChartDisplay == "block"){
			cmfHeight=cmfHeight-midHeight/3;
			//console.log("********cmf height removed ****");
		}
		
		if(lineChartDisplay == "block"){
			cmfHeight=cmfHeight-midHeight;
		}
		
		var powerGauageHeight=midHeight/6;
		
		chartHeightMap.cmf=cmfHeight;
		chartHeightMap.hlc=hlcHeight;
		chartHeightMap.powergauage=powerGauageHeight;
		
		StockMarketChartManager.chartHeightMap=chartHeightMap;
		
	},
	generateXScale:function(){
		var xMin=d3.min(dateArray.map( function(d) { return parseDate.parse(d);}));
		var xMax=d3.max(dateArray.map(function(d) { return parseDate.parse(d);}));
		xScaleHistoricChart=d3.time.scale().range([0, (historicalChartWidth*scalableLimit)]).domain([xMin,xMax]);
		
	},
	drawCmfChart:function(cmfChartConfigration){
		
		var id=StockMarketChartManager.selectorContainerId;
		var margin=StockMarketChartManager.margin;
		var scalableLimit=StockMarketChartManager.scalableLimit;
		
		var data=cmfChartConfigration.data;
		var cmfFieldName=cmfChartConfigration.fieldName;
		var chartHeightMap=StockMarketChartManager.chartHeightMap;
		
		
		var width=d3.select("#"+id).style("width");
		var height=chartHeightMap.cmf;
		
		width=parseInt(width.replace("px",""));
		
		var widthDomain=width-margin.left-margin.right;
		var heightDomain=height-margin.top-margin.bottom;
		
		
		
		var chart = d3.select("#"+id)
            .append("svg:svg")
            .attr("class", "cmfChart")
			.attr("id","cmfChart")
            .attr("width",width)
            .attr("height",height);
			
		
		var clipCMF = chart.append("defs").append("svg:clipPath")
		.attr("id", "clip1")
		.append("svg:rect")
		.attr("id", "clip-rect")
		.attr("x", "0")
		.attr("y", "0")
		.attr("width", width)
		.attr("height",height);	
		
		var cmfClipGrouping=chart.append('g').attr("clip-path", "url(#clip1)")
		
        if (data == undefined || data.length == 0) return;
		
		for (var i=0; i < data.length; i++) {
			var e=data[i];
			for (var k in e) {
				if (isNaN(e[k]) || e[k] == null){
					//console.log("value befor "+e[k]);
					e[k]="N/A";
					// console.log("value after "+e[k]);
				}
			}
			data[i]=e;
					
		}
		
		var moneyFlowArray=new Array();
		for(var i=0;i<data.length;i++){
			if(data[i][cmfFieldName] != "N/A"){
				moneyFlowArray.push(data[i][cmfFieldName]);
			}
			//data[i].timeIndex=data[i].timeIndex1;
		}
		
		moneyFlowArray.sort(function(a,b){
			if(a>b){
				return 1; 
			}
			else if(b>a){
				return -1;
			}
			else{
				return 0;
			}
		});
		
		var min=moneyFlowArray[0];
		var max=moneyFlowArray[moneyFlowArray.length-1];
		
		var midPoint=0;//(min+max)/2;
		
		
		var yScale = d3.scale.linear()
		.domain([min,max])
		.range([heightDomain-margin.bottom, margin.top]);
		
		var xScale = d3.scale.linear()
            .domain([d3.min(data.map(function (d) {
                return d.timeIndex;
            })), d3.max(data.map(function (d) {
                return d.timeIndex;
            }))])
			.range([margin.left, (widthDomain)]);
            //.range([margin.left, (widthDomain)*scalableLimit]);
		
		StockMarketChartManager.xScaleHistoricChart=xScale;
		
		// console.log("money flow min "+min +" max Money flow "+max);
		
		var textLabelDx=StockMarketChartManager.textLabelDx;
		
        cmfClipGrouping.append("line")
            .attr("class", "divider")
            .attr("x1", xScale(data[0].timeIndex))
            .attr("y1", yScale(midPoint))
            .attr("x2", xScale(data[data.length - 1].timeIndex))
            .attr("y2", yScale(midPoint));
		
		cmfClipGrouping.append("text")
            .attr("class", "yrule")
            .attr("x", widthDomain - margin.right+textLabelDx)
            .attr("y", yScale(midPoint))
            .attr("dy", 0)
            .attr("dx","-1.2em")
            .attr("text-anchor", "end")
            .text(parseFloat(midPoint).toFixed(2))
			.style("color","#FFFFFF")
			.attr("fill","white");
		
		
		var turningPoints = [0];

        $(data).each(function (index, datum) {
            if (index > 0) {
				if(!isNaN(data[index - 1][cmfFieldName]) && !isNaN(datum[cmfFieldName])){
					if (sign(data[index - 1][cmfFieldName]) != sign(datum[cmfFieldName]) && datum[cmfFieldName] != 0) {
						turningPoints.push(index);
					}
				}
				else{
					turningPoints.push(index);
				}
            }
        });
		
		/*
		$(data).each(function(i,obj){
			console.error("obj "+obj[cmfFieldName]);
		});
		*/
		
        turningPoints.push(data.length - 1);
		
		var alternatingStyle = data[0][cmfFieldName] > midPoint;
        var lastMidPointTimeStamp;
        $(turningPoints).each(function (index, tp0) {
            var subset;
            if (index != turningPoints.length - 1) {
                var tp1 = turningPoints[index + 1];
				//console.log("INDEX "+index + "index next  "+(index+1));
                subset = data.slice(tp0, tp1);
                if (lastMidPointTimeStamp != undefined) {
                    subset.unshift({
                        timeIndex: lastMidPointTimeStamp,
                        MoneyFlow: midPoint
                    });
                }
                lastMidPointTimeStamp = Math.round((data[tp1 - 1].timeIndex + data[tp1].timeIndex) / 2);
				
                
				var mFlow;
				if(tp1!=tp0 && tp1!=data.length-1){
					// < data.length - 1){
					mFlow=midPoint;
				}
				else{
					if(data[tp1][cmfFieldName]=="N/A"){
						mFlow=midPoint;
					}
					else{
						mFlow=data[tp1][cmfFieldName];
					}
				}
				

				subset.push({
					timeIndex: (tp1 + 1 <= data.length - 1) ? lastMidPointTimeStamp : data[data.length - 1].timeIndex+1,
					MoneyFlow:mFlow 
				});
				//console.log(data.length-1);
				if(data[data.length-1][cmfFieldName]>0 && data[data.length-2][cmfFieldName]<0 && tp1== (data.length-1) && tp1!=tp0 ){
					// console.log('splice');
					subset.splice(-1,1);
					subset.push({
						timeIndex: (tp1 + 1 <= data.length - 1) ? lastMidPointTimeStamp : data[data.length - 1].timeIndex+1,
						MoneyFlow:midPoint
					});
				}
				else if((data[data.length-1][cmfFieldName]<0 && data[data.length-2][cmfFieldName]>0) && tp1==data.length-1  && tp1!=tp0){
					// console.log('splice');
					subset.splice(-1,1);
					subset.push({
						timeIndex: (tp1 + 1 <= data.length - 1) ? lastMidPointTimeStamp : data[data.length - 1].timeIndex+1,
						MoneyFlow:midPoint
					});
				}
				
				else if((tp1!=tp0 && tp1==data.length-1)){
					subset.push({
						timeIndex: (tp1 + 1 <= data.length - 1) ? lastMidPointTimeStamp : data[data.length - 1].timeIndex+1,
						MoneyFlow:midPoint
					});
				}
				
				if(data[tp0].cmfFieldName == "N/A"){
					alternatingStyle=(data[tp1][cmfFieldName] >= midPoint);
				}
				else{	
              	
                  alternatingStyle=(data[tp0][cmfFieldName] >= midPoint);
				}
                
				//StockMarketChartManager.area = d3.svg.area()
				var area = d3.svg.area()
                    .x(function (d) {
						//console.log("time indewx "+xScale(d.timeIndex))
                        return xScale(d.timeIndex);
                    })
                    .y0(yScale(midPoint))
                    .y1(function (d) {
						
						if(d[cmfFieldName]!="N/A"){
							//console.log("cmf "+d[cmfFieldName] +" y "+yScale(d[cmfFieldName]));
							if(d[cmfFieldName] !=undefined){
								return yScale(d[cmfFieldName]);
							}else{
								//console.log("undefined");
								return yScale(midPoint);
							}
							
						}else{
							console.log("0 "+yScale(midPoint));
							return yScale(midPoint);
						}
                        
                    })
                    .interpolate("basis");
				
				$(subset).each(function(i,obj){
					//console.log("cmfsss "+obj[cmfFieldName] +" y "+yScale(obj[cmfFieldName]));
					if(obj[cmfFieldName] === undefined){
						//console.log("undeifne condi");
						obj[cmfFieldName]="N/A";
					}
					StockMarketChartManager.areaSubsetArray.push(obj);
				});
				
				
                cmfClipGrouping.append("path")
                    .datum(subset)
                    .attr("class", "money-flow-area " + ((alternatingStyle) ? "positive" : "negative"))
					.attr('fill',function(){
						if(alternatingStyle){
							return "green"
						}else{
							return "red";
						}
						
					})
                    .attr("d", area(subset));
				
            }
        });

		function sign(x) {
            return x > midPoint ? 1 : x < midPoint ? -1 : 0;
        }
		
		//append tool tip
		chart
		.append("line")
		.attr("x1",5)
		.attr("x2",5)
		.attr("y1",0)
		.attr("y2",height)
		.attr("class","drag-line")
		.style("display","none")
		.style("stroke","#FFFFFF")
		.style("stroke-width","2px");
	
	},
	drawHLCChart:function(lineChartConfiguration){
		var id=StockMarketChartManager.selectorContainerId;
		var margin=StockMarketChartManager.margin;
		var scalableLimit=StockMarketChartManager.scalableLimit;
		
		var data=lineChartConfiguration.data;
		var highFieldName=lineChartConfiguration.highFieldName;
		var closeFieldName=lineChartConfiguration.closeFieldName;
		var lowFieldName=lineChartConfiguration.lowFieldName;
		var highBand=lineChartConfiguration.HighBand;
		var lowBand=lineChartConfiguration.LowBand;
		var band=lineChartConfiguration.Band;
		var trend=lineChartConfiguration.Trend;
		
		var chartHeightMap=StockMarketChartManager.chartHeightMap;
		
		for (var i=0; i < data.length; i++) {
			var e=data[i];
			for (var k in e) {
				if (isNaN(e[k]) || e[k] == null){
					//console.log("value befor "+e[k]);
					e[k]="N/A";
					// console.log("value after "+e[k]);
				}
			}
			data[i]=e;
					
		}
		
		var width=d3.select("#"+id).style("width");
		var height=chartHeightMap.hlc;
		
		width=parseInt(width.replace("px",""));
		
		var widthDomain=width-margin.left-margin.right;
		var heightDomain=height-margin.top-margin.bottom;
		
		var chart = d3.select("#"+id)
            .append("svg:svg")
            .attr("class", "hlcChart")
			.attr("id","hlcChart")
            .attr("width",width)
            .attr("height",height);
		
		var min = getMinRange(data);

        var max = getMaxRange(data);
		
		var yScale = d3.scale.linear()
		.domain([min,max])
		.range([heightDomain-margin.bottom, margin.top]);
		
		var xScale = d3.scale.linear()
            .domain([d3.min(data.map(function (d) {
                return d.timeIndex;
            })), d3.max(data.map(function (d) {
                return d.timeIndex;
            }))])
			.range([margin.left, (widthDomain)]);
            //.range([margin.left, (widthDomain)*scalableLimit]);
		
		StockMarketChartManager.xScaleHistoricChart=xScale;	
		
		
		/*
       chart.selectAll("line.x")
            .data(xScale.ticks(10))
            .enter().append("svg:line")
            .attr("class", "x")
            .attr("x1", xScale)
            .attr("x2", xScale)
            .attr("y1", marginBottom)
            .attr("y2", chartHeight - marginTop)
            .attr("stroke", "#ccc");

        chart.selectAll("line.y")
            .data(yScale.ticks(10))
            .enter().append("svg:line")
            .attr("class", "y")
            .attr("x1", marginLeft)
            .attr("x2", width - marginRight)
            .attr("y1", yScale)
            .attr("y2", yScale)
            .attr("stroke", "#ccc");
		*/
		var textLabelDx=StockMarketChartManager.textLabelDx;
		
        chart.selectAll("text.yrule")
            .data(yScale.ticks(10))
            .enter().append("svg:text")
            .attr("class", "yrule")
            .attr("x", widthDomain - margin.right + textLabelDx)
            .attr("y", yScale)
            .attr("dy", 0)
            .attr("dx", 0)
            .attr("text-anchor", "end")
			.style("color","#FFFFFF")
			.style("font-size","12px")
            .attr("fill","#FFFFFF")
			.append("tspan")
			.text(function (d) {
                return (new Number(d)).toFixed(2) + "";
            })
			
			
			
		
        chart.selectAll("line.close")
            .data(data)
            .enter().append("svg:line")
            .attr("class", "close")
            .attr("x1", function (d) {
                return xScale(d.timeIndex) + 0.25 * (widthDomain) / data.length - 0.5;
            })
            .attr("y1", function (d) {
				//console.log("d.close "+d.Close +"scale  "+yScale(d.Close));
				if(d[closeFieldName]!="N/A"){
					return yScale(d[closeFieldName]);
				}else{
					$(this).select("line.close").attr('class','NA');
					return yScale(0);
				}
            })
            .attr("x2", function (d) {
                return xScale(d.timeIndex) + 0.25 * (widthDomain - (margin.left + margin.right)) / data.length + 2;
            })
            .attr("y2", function (d) {
                if(d[closeFieldName]!="N/A"){
                return yScale(d[closeFieldName]);
				}else{
					$(this).select("line.close").attr('class','NA');
					return yScale(0);
				}
            })
			.style("stroke","#15c515")
			.attr("stroke-width",'1px');
		
        chart.selectAll("line.stem")
            .data(data)
            .enter().append("svg:line")
            .attr("class", "stem")
            .attr("x1", function (d) {
                return xScale(d.timeIndex) + 0.25 * (widthDomain - (margin.left + margin.right)) / data.length;
            })
            .attr("x2", function (d) {
                return xScale(d.timeIndex) + 0.25 * (widthDomain - (margin.left + margin.right)) / data.length;
            })
            .attr("y1", function (d) {
				if(d[highFieldName]!="N/A"){
					//chart.select("line.stem").attr('class','NA');
                return yScale(d[highFieldName]);
				}else{
					$(this).select("line.stem").attr('class','NA');
					return yScale(0);
				}
                
            })
            .attr("y2", function (d) {
				
				if(d[lowFieldName]!="N/A"){
					return yScale(d[lowFieldName]);
				}else{
					$(this).select("line.stem").attr('class','NA');
					return yScale(0);
				}
                
            })
			.attr("stroke",'#15c515')
			.attr("stroke-width","1px");
		
		
        var highBandFunction = d3.svg.line()
            .x(function (d) {
                return xScale(d.timeIndex);
            })
            .y(function (d) {
                return yScale(d[highBand]);
            })
            .interpolate("linear").defined(function (d) {
                return d[highBand] != 0;
            }).defined(function (d) {
                return (d[highBand] != "N/A" && d[highBand]!=0);
            });

        var lowBandFunction = d3.svg.line()
            .x(function (d) {
                return xScale(d.timeIndex);
            })
            .y(function (d) {
                return yScale(d[lowBand]);
            })
            .interpolate("linear").defined(function (d) {
                return d[lowBand] != 0;
            })
			.defined(function (d) {
                return (d[lowBand] != "N/A" && d[lowBand]!=0);
            });
		
        var bandFunction = d3.svg.line()
            .x(function (d) {
                return xScale(d.timeIndex);
            })
            .y(function (d) {
                return yScale(d[band]);
            })
            .interpolate("linear").defined(function (d) {
                return d[band] != 0;
            })
			.defined(function (d) {
                return (d[band] != "N/A" && d[band]!=0);
            });

        var trendFunction = d3.svg.line()
            .x(function (d) {
                return xScale(d.timeIndex);
            })
            .y(function (d) {
                return yScale(d[trend]);
            })
            .interpolate("linear")
            .defined(function (d) {
                return (d[trend] != 0 && d[trend]!="N/A");
            });
		

        chart.selectAll("path.high-band")
            .data([data])
            .enter()
            .append("path")
            .attr("class", "high-band band")
            .style("stroke-dasharray", ("1, 4"))
            .attr("d", highBandFunction)
            .attr("stroke-width", 2)
            .attr("fill", "none")
			.attr("stroke-dasharray","1px, 4px")
			.attr("stroke",'#fcfcfc');

        chart.selectAll("path.low-band")
            .data([data])
            .enter()
            .append("path")
            .attr("class", "low-band band")
            .style("stroke-dasharray", ("1, 4"))
            .attr("d", lowBandFunction)
            .attr("stroke-width", 2)
            .attr("fill", "none")
			.attr("stroke-dasharray","1px, 4px")
			.attr("stroke",'#fcfcfc');
		
        chart.selectAll("path.mid-band")
            .data([data])
            .enter()
            .append("path")
            .attr("class", "band mid-band")
            .style("stroke-dasharray", ("1, 4"))
            .attr("d", bandFunction)
			.attr("stroke-width", 1)
            .attr("fill", "none")
			.attr("stroke",'#fcfcfc');

        chart.selectAll("path.trend")
            .data([data])
            .enter()
            .append("path")
            .attr("class", "trend")
            .attr("d", trendFunction)
            .attr("fill", "none")
			.attr("stroke","#e38502")
			.attr("stroke-width","1px");
		
		//append tool tip
		chart
		.append("line")
		.attr("x1",5)
		.attr("x2",5)
		.attr("y1",0)
		.attr("y2",height)
		.attr("class","drag-line")
		.style("display","none")
		.style("stroke","#FFFFFF")
		.style("stroke-width","2px");
		
		
	},
	drawPowerGauageChart:function(powerGauageConfiguration){
		var id=StockMarketChartManager.selectorContainerId;
		var margin=StockMarketChartManager.margin;
		var scalableLimit=StockMarketChartManager.scalableLimit;
		
		var data=powerGauageConfiguration.data;
		var powerGauageFieldName=powerGauageConfiguration.pgrFieldName;
		var pgrColorMap=powerGauageConfiguration.pgrColorMap;
		
		var chartHeightMap=StockMarketChartManager.chartHeightMap;
		
		
		for (var i=0; i < data.length; i++) {
			var e=data[i];
			for (var k in e) {
				if (isNaN(e[k]) || e[k] == null){
					//console.log("value befor "+e[k]);
					e[k]="N/A";
					// console.log("value after "+e[k]);
				}
			}
			data[i]=e;
					
		}
		
		var width=d3.select("#"+id).style("width");
		var height=chartHeightMap.powergauage;
		
		width=parseInt(width.replace("px",""));
		
		var widthDomain=width-margin.left-margin.right;
		var heightDomain=height-margin.top-margin.bottom;
		
		var chart = d3.select("#"+id)
            .append("svg:svg")
            .attr("class", "power-gauage")
			.attr("id","power-gauage")
            .attr("width",width)
            .attr("height",height);
		
		
		var max = d3.max(data.map(function (x) {
            return x["powerGauageFieldName"];
        }));

        var min = d3.min(data.map(function (x) {
            return x["powerGauageFieldName"];
        }));

		var yScale = d3.scale.linear()
		.domain([min,max])
		.range([heightDomain-margin.bottom, margin.top]);
		
		var xScale = d3.scale.linear()
            .domain([d3.min(data.map(function (d) {
                return d.timeIndex;
            })), d3.max(data.map(function (d) {
                return d.timeIndex;
            }))])
			.range([margin.left, (widthDomain)]);
            //.range([margin.left, (widthDomain)*scalableLimit]);
		
		StockMarketChartManager.xScaleHistoricChart=xScale;	
		
		var rectwidth = (xScale(data[1].timeIndex) - xScale(data[0].timeIndex));
		//console.log("recangle width "+rectwidth  +": i+1 timeIndex "+data[1].timeIndex +"  i timeIndex "+data[0].timeIndex);

        chart.selectAll("rect.rel-strength")
            .data(data)
            .enter()
            .append("svg:rect")
            .attr("class", "rel-strength")
            .attr("x", function (d) {
                return xScale(d.timeIndex);
            })
            .attr("y", function (d) {
                return 0;
            })
            .attr("width", rectwidth)
            .attr("height", heightDomain)
            .attr("fill", function (d) {
				return pgrColorMap[d[powerGauageFieldName]];
            })
            .attr("stroke", function (d) {
                return pgrColorMap[d[powerGauageFieldName]];
            });

		//append tool tip
		chart
		.append("line")
		.attr("x1",5)
		.attr("x2",5)
		.attr("y1",0)
		.attr("y2",height)
		.attr("class","drag-line")
		.style("display","none")
		.style("stroke","#FFFFFF")
		.style("stroke-width","2px");
		
	},
	drawTimeScale:function(dateArray){
	
		var xScale=StockMarketChartManager.xScaleHistoricChart;	
		var id=StockMarketChartManager.selectorContainerId;
		var margin=StockMarketChartManager.margin;
		
		var width=d3.select("#"+id).style("width");
		var height=30;
		
		width=parseInt(width.replace("px",""));
		
		var widthDomain=width-margin.left-margin.right;
		var heightDomain=20;
		
		var shown = {};
		var ticks=[];
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		
		var tickArray={};
		$(dateArray).each(function (i, d) {
			var date = new Date(d);
			if (shown[date.getMonth() + "-" + date.getYear()] == undefined
				&& date.getDate() < 15) {
				ticks.push(d);
				tickArray[d]=i;
				shown[date.getMonth() + "-" + date.getYear()] = true;
			}
         });
		
		
		for(var key in tickArray){
			console.log("keys    "+key +" value "+tickArray[key]);
		}
		var initialDate=new Date(ticks[0]);
		var counter=0;
		

		var svgSelection=d3.select("#"+id)
							.append("svg:svg")
							.attr("class", "time-axis")
							.attr("id","time-axis")
							.attr("width",width)
							.attr("height",height);
		/*	
		var timeAxisConatiner=svgSelection.append("div")
							.attr("class","time-axis")
							.attr("width",widthDomain)
							.attr("height",heightDomain)
							.attr("x",xScale(0))
							.attr("y",heightDomain);
		*/			
		/*
		var axis= d3.svg.axis()
                  .scale(xScale);
		
		svgSelection.call(axis).selectAll("text").attr("text",function(d,i){
			console.log("text "+d +"tick val "+tickArray[d]);
			if(tickArray[d]){
				var date=new Date(tickArray[d]);
				console.log("show me"+months[date.getMonth()]);
				return months[date.getMonth()];
			}else{
				return "";
			}
		});*/
			
		var tickGrouping=svgSelection.selectAll("div.tick")
		.data(ticks)
		.enter()
		.append("g")
		.attr("class", "tick")
		.attr("transform",function(d){
			console.log("xScale  "+xScale(tickArray[d]));
			var left= xScale(tickArray[d]);		
			return "translate("+left+"," + (margin.top) + ")";
		});
		
		tickGrouping
		.append("text")
		.style("color","#FFFFFF")
		.style("font-size","12px")
		.attr("fill","#FFFFFF")
		.text(function (d, i) {
			var date = new Date(d);

			if(i==0){
				// console.error("'" + (initialDate.getFullYear() + "").substr(2,3));
				return "'" + (initialDate.getFullYear() + "").substr(2,3);
			}

			return months[date.getMonth()];
		});
		/*
		.attr("x",function(d){
			console.log("xScale  "+xScale(tickArray[d]));
			return xScale(tickArray[d]);
		});
		
		.style("left", function (d) {
			return Math.round(xScale(d)) - 30 + "px";
		});
		*/
		
		//append tool tip
		svgSelection
		.append("line")
		.attr("x1",5)
		.attr("x2",5)
		.attr("y1",0)
		.attr("y2",height)
		.attr("class","drag-line")
		.style("display","none")
		.style("stroke","#FFFFFF")
		.style("stroke-width","2px");
	},
	appendToolTip:function(){
		var tootTipTemplate ='<div id="tooltipChart-stock-market" style="z-index:99999;float:none;display:none; margin:0px; padding:0px; position:absolute; width:150px;">'+
				'<div id="textContainer" style="width:150px; background-color:#eeeeee; border:solid 1px #666666; box-shadow:5px 5px 5px #5d5d5d; border-radius:7px; font-family:calibri; float:left; font-size:11px; padding:10px;">'+
				'	<div class="xVal" style="text-align:center; font-size:13px; background-color:#6699cc; border-top-left-radius:7px; margin-top:-10px; margin-left:-10px;  margin-right:-10px;border-top-right-radius:7px; padding:5px 10px;">14 jan</div>'+
					'<div id="y-label" class="y-label label1" style="width:60%;display:none; float:left; text-align:left; padding:3px 0;">Auto Loans</div>'+
					'<div  class="yVal label1" style="width:40%; float:right;display:none; text-align:right;  padding:3px 0;">$ 400</div>'+
			'		<div class="y-label label2" style="width:60%; float:left;display:none; text-align:left; padding:3px 0;">Auto Loans</div>'+
			'		<div class="yVal label2" style="width:40%;display:none; float:right; text-align:right;  padding:3px 0;">$ 400</div>'+
			'		<div class="y-label label3" style="width:60%; float:left; text-align:left; padding:3px 0;">Auto Loans</div>'+
			
			'		<div class="yVal label3" style="width:40%; float:right; text-align:right;  padding:3px 0;">$ 400</div>'+
			'		<div class="y-label label4" style="width:60%; float:left; text-align:left; padding:3px 0;">Auto Loans</div>'+
			
			'		<div class="yVal label4" style="width:40%; float:right; text-align:right;  padding:3px 0;">$ 400</div>'+
			'		<div class="y-label label5" style="width:60%; float:left; text-align:left; padding:3px 0;">Auto Loans</div>'+
			
			'		<div class="yVal label5" style="width:40%; float:right; text-align:right;  padding:3px 0;">$ 400</div>'+
			'	</div>'+
			//'	<div id="handIcon" style="position: relative; bottom:1px; height:40px; width:36px; '+
			//'	 background:url(http://www.stocinn.com/stoccharts/img/toolTips-arrow.png) no-repeat; clear:both; float:right; margin-bottom:-2px; right:-27px;">'+
			//'	 </div>'+
			'</div>';
		
		var id=StockMarketChartManager.selectorContainerId;	
		$('body').append(tootTipTemplate);
				
	},
	showToolTip: function (e, yValArg, xValArg, hideXVal, yHeadingMap) {
				
				
				
		var x = e.pageX;
		
		var y; 
		
		y=e.pageY;
		


		var yVal;
		yVal = yValArg;


		var timeVal;

		timeVal = xValArg;
		$('#tooltipChart-stock-market').find('.xVal').html("");
		
		$('#tooltipChart-stock-market').find('.xVal').html(timeVal);
		 
		//blank yLabel	
		$('#tooltipChart-stock-market').find('.y-label').html("");
		
		//blank yVal
		$('#tooltipChart-stock-market').find('.yVal').html("");
		
		//hide all  yLabel and yVal
		$('#tooltipChart-stock-market').find('.yVal').hide();
		$('#tooltipChart-stock-market').find('.y-label').hide();
		
		var toolTipRef=$('#tooltipChart-stock-market');
		//get YHeadingNames width Values and iterate to update yLabel and YVal 
		for(var i=0;i<yHeadingMap.length;i++){
			var headingObj=yHeadingMap[i];
			var counter=i+1;
			var yLabelClass=".y-label.label"+counter;
			var yValClass=".yVal.label"+counter;
			$(toolTipRef).find(yLabelClass).html(headingObj.headingName);
			$(toolTipRef).find(yValClass).html(headingObj.headingVal);
			
			$(toolTipRef).find(yValClass).show();
			$(toolTipRef).find(yLabelClass).show();
		}
		
		
		var marginLeft = x;
		if ($(".ps-scrollbar-x-rail")) {
			try {
				marginLeft += parseInt($(".ps-scrollbar-x-rail").css('left').replace("px", ''));
			} catch (err) {

			}
		}

		var tooTipElem = $('body').find("#tooltipChart-stock-market");
		var toolTipTextContainer = $(tooTipElem).find("#textContainer");
		
		
		var marginTop = y - ($("body").find("#tooltipChart-stock-market").height()*0.9);
		marginLeft=marginLeft-($("body").find("#tooltipChart-stock-market").width()*0.95);
		
		if((marginLeft-$(tooTipElem).width())<170){
			marginLeft=marginLeft*0.5+$(tooTipElem).width();
			
			//$(tooTipElem).find("#handIcon").css("right","94px");
		}else{
			//$(tooTipElem).find("#handIcon").css("right","-14px");
		}
		
		console.log("page y "+marginTop +"y "+y);
		
		$('body').find("#tooltipChart-stock-market").css("left", marginLeft);
		
		//keep margintop fixed for stock market chart
		var id=StockMarketChartManager.selectorContainerId;	
		
		var heightOfContainer=parseInt(d3.select("#"+id).style("height").replace("px",""));
		
		$('body').find("#tooltipChart-stock-market").css("top",heightOfContainer/2);
		//console.log("sss");
		$('body').find("#tooltipChart-stock-market").show();

	},
	hideToolTip: function () {
			$('#tooltipChart-stock-market').find('.yVal').html("");
			d3.select("#tooltipChart-stock-market").style('display', 'none');
	}
}
	
	function getMinRange(data) {
		//return Math.min(Math.min(getMinFromArray(data, "Trend"), getMinFromArray(data, "LowBand")), getMinFromArray(data, "Low"));
        return Math.min(Math.min(getMinFromArray(data, "Trend"), getMinFromArray(data, "LowBand")), getMinFromArray(data, "Low"),getMinFromArray(data, "Close"));
    }

    function getMaxRange(data) {
        //return Math.max(Math.max(getMaxFromArray(data, "Trend"), getMaxFromArray(data, "HighBand")), getMaxFromArray(data, "High"));
		return Math.max(Math.max(getMaxFromArray(data, "Trend"), getMaxFromArray(data, "HighBand")), getMaxFromArray(data, "High"),getMaxFromArray(data, "Close"));
    }

    function getMinFromArray(array, field) {
        var min = Number.MAX_VALUE;

        angular.forEach(array, function (d) {
            if (d[field] < min && d[field] != 0)
                min = d[field];
        });

        /*if (min == Number.MAX_VALUE)
            return undefined;*/

        return min;
    }

    function getMaxFromArray(array, field) {
        var max = -Number.MAX_VALUE;

        angular.forEach(array, function (d) {
            if (d[field] > max && d[field] != 0)
                max = d[field];
        });

        if (max == Number.MIN_VALUE)
            return undefined;

        return max;
    }