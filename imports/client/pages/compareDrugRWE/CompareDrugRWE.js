import { Template } from 'meteor/templating';
import './CompareDrugRWE.html';

var DRUG_LIMIT = 4;

Template.CompareDrugRWE.rendered = function() {

    // remove extra parsing process for faster performance
    var selectedDrugs = localStorage.selectedDrugs ? JSON.parse(localStorage.selectedDrugs) : [];
    var filterData = localStorage.filteredDrugsForGraph ? JSON.parse(localStorage.filteredDrugsForGraph) : [];

    //Display Graph for Drugs selection not more that 4 Drugs
    //Display Default 4 drugs data if no drugs is selected
    if (selectedDrugs && selectedDrugs.length > 0) {
        DisplayCompareDrugsData(selectedDrugs);
    } else if (filterData && filterData.length > 0) {
        DisplayCompareDrugsData(filterData);
    }
    //Scroll page to Header so all content is visible
    $('html,body').animate({
        scrollTop: $(".grid-fix").offset().top - ($(window).height() / 2) + 150
    }, 'slow');

    var allDrugsData = JSON.parse(localStorage.AllDrugsData);
    $('.machineLearn-totalPatients').html(commaSeperatedNumber(allDrugsData[0].TotalN || 0));



}

//Handle events for Efficacy
Template.CompareDrugRWE.events({
    //Handle checkbox change event for drug selection
    'change .eff-sidebox input:checkbox': function(e) {
        var selectedDrugs = $('.eff-sidebox input:checked').map(function() {
            return this.value;
        }).get();
        localStorage.selectedDrugs = JSON.stringify(selectedDrugs);
        //Capture last selected drugs and and also display it in drug choice popup if it never display for current session
        if (e.target && e.target.checked) {
            //If Drug popup displayed once in current session then it will never show again but capture information
            if (selectedDrugs && selectedDrugs.length === 1) {
                localStorage.lastSelectedDrug = e.target.value;
                if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
                    $('.drug-inspection').slideUp();
                } else {
                    //WrapDrugName(localStorage.lastSelectedDrug);
                    //Display drug popup if last drug is selected in current session
                    if (localStorage.lastSelectedDrug && localStorage.lastSelectedDrug.length > 0) {
                        $('#inspected-drug').text(localStorage.lastSelectedDrug).attr('title', localStorage.lastSelectedDrug);

                        $('.drug-inspection').slideDown();
                    }
                }
            }
        }

        //Display selected drugs from drug selection menu
        DisplayCompareDrugsData(selectedDrugs);
    },
    'click .apiLinksSpan': function(event, template) {
        localStorage.isFromCompareDrugs = true;
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
    }
});


/**
 *  Display compare drugs based on drug selectiom
 *  @param Array Object filterData
 *  filterData have selected drugs  info in array of object
 */
function DisplayCompareDrugsData(filterData) {
    //To Do  display data based on drug selection

    var finalHtml = '';
    // remove extra parsing process for faster performance

    var selDrugsWithData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];
    $('#compare-content').html('');
    if (filterData && filterData.length > 1) {

        var filterDrugs = selDrugsWithData.filter(function(d) {
            return filterData.indexOf(d.DrugName) > -1;
        });
        var drugsTOCompare = filterDrugs.length;
        for (var i = 0; i < filterDrugs.length; i++) {

            var drugName;
            if (drugsTOCompare === 2) {
                drugName = filterDrugs[i].DrugName
            } else if (drugsTOCompare === 3) {

                if (filterDrugs[i].DrugName.length > 30) {
                    drugName = filterDrugs[i].DrugName.substring(0, 27);
                    drugName = drugName + '...';
                } else {
                    drugName = filterDrugs[i].DrugName
                }

            } else if (drugsTOCompare === 4) {

                if (filterDrugs[i].DrugName.length > 20) {
                    drugName = filterDrugs[i].DrugName.substring(0, 17);
                    drugName = drugName + '...';
                } else {
                    drugName = filterDrugs[i].DrugName
                }

            } else if (drugsTOCompare === 5) {

                if (filterDrugs[i].DrugName.length > 15) {
                    drugName = filterDrugs[i].DrugName.substring(0, 12);
                    drugName = drugName + '...';
                } else {
                    drugName = filterDrugs[i].DrugName
                }

            } else if (drugsTOCompare <= 9) {

                if (filterDrugs[i].DrugName.length > 10) {
                    drugName = filterDrugs[i].DrugName.substring(0, 8);
                    drugName = drugName + '..';
                } else {
                    drugName = filterDrugs[i].DrugName
                }

            } else {
                if (filterDrugs[i].DrugName.length > 7) {
                    drugName = filterDrugs[i].DrugName.substring(0, 6);
                    drugName = drugName + '.';
                } else {
                    drugName = filterDrugs[i].DrugName
                }

            }
            var svg = CreateSVGForValueZone(filterDrugs, filterDrugs[i].DrugName, filterDrugs[i].DrugSequence);
            //console.log(filterDrugs[i].DrugSequence);
            var svgContainer = `<div class="gaugeMeter" style="display: inline-block; margin-top: -12px;" title='Go To Pharma Tab for more info'>
                  <div id="SvgForValueZone${filterDrugs[i].DrugSequence}"></div>
                  <img src="/select-position.png" class="optimalPointForValueZone">
                  </div>`;
            var compareHtml = '<div class="grid-fix-cell">' +

                '<div class="cprsHeaader c-drug-tbl-div">' +
                '<div class="cprsDrug_Cell c-drug-tbl-title" title="' + filterDrugs[i].DrugName + '"><p>' + drugName + '</p></div>' +
                '</div>' +
                '<div class="cprsInnerdivContainer">' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + fixToInteger(filterDrugs[i].Efficacy.Efficacy) + '%</div>' +
                '</div>' +
                //Updated By Jayesh 22th May 2015 For removing safety from provider tab
                // '<div class="cprsInnerdiv">' +
                // '<div class="cplsLables">&nbsp;</div>' +
                // '<div class="cplsMeasures">' + (isNaN(filterDrugs[i].Safety) ? 0 : fixToInteger(filterDrugs[i].Safety)) + '%</div>' +
                // '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + fixToInteger(filterDrugs[i].Adherence.Adherence) + '%</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + fixToInteger(filterDrugs[i].Utilization.Utilization) + '%</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + GenerateCostSymbol(filterDrugs[i].Cost.TotalCost) + '</div>' +
                // '<div class="cplsMeasures">' + GenerateCostSymbol(filterDrugs[i].Cost.PatientCW12) + '</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsMeasures">' + svgContainer + '</div>' +
                '<div class="cplsLables">&nbsp;</div>' +
                '</div>' +
                '</div>' +

                '</div>';


            $('#compare-content').append(compareHtml);
            var svg = CreateSVGForValueZone(filterDrugs, filterDrugs[i].DrugName, filterDrugs[i].DrugSequence);
            //  finalHtml = finalHtml + compareHtml;
        }
        //  $('#compare-content').append(finalHtml);
        //// Related to display safety section with dynamic height
        //// Refrence :  http://stackoverflow.com/questions/6060992/element-with-the-max-height-from-a-set-of-elements
        //// Author : Matt Ball

        // set minimum height for scroll in drug selection slide
        $('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));


    } else {
        //To Do if less than 2 drugs is selected
        console.log('To Do if less than 2 drugs is selected');
    }
};

let GenerateCostSymbol = (pCost) => {
    //Payer bubble to show $$$ not actual cost scale: 0-50K $ 50-100 $$ 150-200K $$$ 200-300 $$$$
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
    //console.log(pCost);
    return costSymbol;
};


let CreateSVGForValueZone = (DrugsData, DrugName, DrugSequence) => {
    setTimeout(() => {
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
        return renderSvgForValueZone('Cost', 'Efficacy', data, DrugSequence);
        // $(".svgd").each(function(i) {
        //     //restriction for non empty id element
        //     if (this.id && this.id.length > 0) {
        //         fillDrugFuelGuage(Number($(this).attr('data-value')), String(this.id), $(this).attr('data-class'));
        //     }
        // });
        // //hide the load mask
        // document.getElementById("anim_loading_theme").style.visibility = "hidden";
        // document.getElementById("overlay").style.display = "none";
        // document.getElementById("anim_loading_theme").style.top = "40%";
    }, 500);
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

    if (eleID != '' || eleID != null) {
        setTimeout(function() {
            document.getElementById(eleID).scrollIntoView({
                block: "end",
                behavior: "smooth"
            });
        }, 200);
    }

    if (parentID) {
        $('html,body').animate({
            scrollTop: $(parentID).offset().top - 100
        }, 'slow');
    }
}



Template.CompareDrugRWE.helpers({


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
            $(".svgd").each(function(i) {
                //restriction for non empty id element
                if (this.id && this.id.length > 0) {
                    fillDrugFuelGuage(Number($(this).attr('data-value')), String(this.id), $(this).attr('data-class'));
                }
            });
            //hide the load mask
            document.getElementById("anim_loading_theme").style.visibility = "hidden";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("anim_loading_theme").style.top = "40%";
        }, 500);
    }

});




function renderSvgForValueZone(xAxis, yAxis, data, DrugSequence) {

    var testData = data[0];
    //check if the data does not have values return
    if ((testData['DrugN'] < 1) || (testData['Adherence'] < 1) || (isNaN(testData['Safety'])))
        return;

    d3.select("#SvgForValueZone" + DrugSequence).selectAll("*").remove();
    var svgHeight = 70,
        svgWidth = 70,
        xOffset = 15,
        yOffset = 15;
    var svg = d3.select("#SvgForValueZone" + DrugSequence).append("svg").attr("height", svgHeight).attr("width", svgWidth).style("background", "");
    var svgData = getRangeForChart(xAxis, yAxis, xOffset, yOffset, svgHeight, svgWidth, data);
    // Draw X-Axis and Y-Axis in Provider Page
    DrawSvgForValueZone(svg, svgHeight, svgWidth, xOffset, yOffset, xAxis, yAxis, svgData);
    //console.log("***Render SVG for value Zone***");
    //console.log(svgData);
    for (var i = 0; i < svgData.length; i++) {
        // Draw circle with placement of selected drugs on  Provider tab's value chart
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
    //     .attr("points", "" + (height) + "," + (height - yOffset - 0.5) + "  " + (width - arrowHeight) + "," + (width - xOffset + arrowWidth / 2) + " " + (width - arrowHeight) + "," + (width - xOffset - arrowWidth / 2) )
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

function displayColorAndSizeAccordingToLength(data, first, second, third) {
    var len = data.length,
        firstCount = 0,
        secondCount = 0,
        thirdCount = 0,
        opacity = ['0.7', '0.5', '0.3', '0.3', '0.3', '0.3'];
    for (var i = 0; i < len; i++) {
        if (parseFloat(data[i]['DrugInfo']['Utilization']) <= first) {
            data[i]['bubbleColor'] = '#009eff';
            data[i]['bubbleSize'] = 20;
            data[i]['bubbleOpacity'] = opacity[firstCount]
            firstCount++;
        } else if (parseFloat(data[i]['DrugInfo']['Utilization']) > first && parseFloat(data[i]['DrugInfo']['Utilization']) <= second) {
            data[i]['bubbleColor'] = '#e18602';
            data[i]['bubbleSize'] = 30;
            data[i]['bubbleOpacity'] = opacity[secondCount]
            secondCount++;
        } else if (parseFloat(data[i]['DrugInfo']['Utilization']) > second && parseFloat(data[i]['DrugInfo']['Utilization']) <= third) {
            data[i]['bubbleColor'] = '#1b1464';
            data[i]['bubbleSize'] = 40;
            data[i]['bubbleOpacity'] = opacity[thirdCount]
            thirdCount++;
        }
    }
}


function calculateSize(minimum, maximum, populationSize, totalCount, previousAllocatedSize) {


    var diffrenceInSize = 12 / (totalCount - 2);

    //    Pinscriptive.PrevioulyAllocatedSize = previousAllocatedSize + diffrenceInSize;
    return previousAllocatedSize + diffrenceInSize;


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

/////////////////////////************** These functions remove decimal points if number is an Integer ***************************/////////////////

function fixToInteger(parameter) {
    var convertToInt = parseInt(parameter);
    var remainder = parameter % convertToInt;
    if (remainder == 0) {
        return convertToInt;
    }

    return parseFloat(parameter).toFixed(2);
}