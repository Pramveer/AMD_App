/*
 *This file contains all the methods used for the sub population view rendering for all 3 tabs
 * currently it has been implemented in the Treated & Treating tabs
 */

import * as payerUtils from './payerToolUtilities.js';

//sub population drug table functions
function assignIdforValueScore(id, tabName) {
    var ids = id.replace(/\W/g, '');
    if (tabName)
        return tabName + 'parentValueScoreDiv_' + ids;
    else
        return 'parentValueScoreDiv_' + ids;
}

export function calculateBestValueFromValues(bestValue, value, id, tabName) {
    var ids = id.replace(/\W/g, '');

    var tempValue = parseFloat(bestValue).toFixed(2);
    var value = parseFloat(value).toFixed(2);
    if (tempValue == value) {
        return '<div class="' + tabName + 'valueScoreDiv_' + ids + ' valueScoreDiv" style="background-color:#2fb39e;border-radius: 50%;">' +
            '<span id="' + tabName + 'valuescore_' + ids + '" class="alls" style="color:#fff;">' + value + '</span>' +
            '</div>';
    } else {
        return '<div class="' + tabName + 'valueScoreDiv_' + ids + ' valueScoreDiv">' +
            '<span id="' + tabName + 'valuescore_' + ids + '" class="alls">' + value + '</span>' +
            '</div>';
    }
}

export function assignIdforCanvas(drugName, valueName) {
    //For remove non alpha numeric character from string
    var ids = drugName.replace(/\W/g, '');
    var id = 'canvas_' + ids;
    return id;
}

function drawRingForCanvas(drugName, value, valueName, color) {
    setTimeout(function() {
        // var id = drugName.split(' + ').join('').split(' ').join('').split('(').join('').split(')').join('');
        //For remove non alpha numeric character from string
        var id = drugName.replace(/\W/g, '');
        id = valueName + 'canvas_' + id;
        var canvas = document.getElementById(id);
        //Added null or empty check before accessing canvas
        if (canvas) {
            var context = canvas.getContext('2d');
            var x = canvas.width / 2;
            var y = canvas.height / 2;
            var radius = 25;
            var startAngle = 0;
            var endAngle = 1.9 * Math.PI * (value / 100);
            var counterClockwise = false;
            context.clear();
            context.beginPath();
            context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
            context.lineWidth = 4;

            // line color
            context.strokeStyle = color;
            context.stroke();
        }

    }, 1000, drugName, value, valueName, color);
    return '';
}

function assignClassAndSliderEventForUtilization(utilization, drugName, tabName) {
    //For remove non alpha numeric character from string
    var ids = drugName.replace(/\W/g, '');
    var className = tabName + '-slider-range-max-utilization-' + ids;
    return className;
}

function assignClassAndSliderEventForCost(drugCost, drugName, tabName) {
    // var ids = drugName.split(' + ').join('').split(' ').join('').split('(').join('').split(')').join('');
    //For remove non alpha numeric character from string
    var ids = drugName.replace(/\W/g, '');
    var className = tabName + '-slider-range-min-cost-' + ids;
    var persent = (parseFloat(drugCost) * 50) / 100;
    setTimeout(function() {
        $("." + className).slider({
            range: "min",
            value: parseFloat(drugCost),
            min: parseFloat(drugCost) - persent,
            max: parseFloat(drugCost) + persent,
            slide: function(event, ui) {
                $(this).siblings('.value').text(commaSeperatedNumber(parseInt(ui.value)));
                $('#' + tabName + 'updatePanelResetCost_' + ids).css('visibility', 'visible');
                $(this).addClass('durty');


                moveSliderCalculateExpanses(tabName, event, ui, this, 'cost');
            }
        });
    }, 1000, ids, className, persent);
    return className;
}

function assignIdResetEventForCost(drugCost, drugName, tabName) {
    var ids = drugName.replace(/\W/g, '');
    var costResetId = tabName + 'updatePanelResetCost_';
    setTimeout(function() {
        $('#' + costResetId + ids).click(function(e) {
            drugCost = parseInt($('.' + tabName + '-slider-range-min-cost-' + ids).closest('.costSliderContainer').find('.totalCostValue').text().split(',').join(''));
            $('.' + tabName + '-slider-range-min-cost-' + ids).closest('.costSliderContainer').find('.value').text(commaSeperatedNumber(parseInt(drugCost)));
            $('.' + tabName + '-slider-range-min-cost-' + ids).slider('value', drugCost);
            moveSliderCalculateExpanses(tabName, '', '', $('.' + tabName + '-slider-range-min-cost-' + ids), 'cost');
            $('#' + costResetId + ids).css('visibility', 'hidden');
            $('.' + tabName + '-slider-range-min-cost-' + ids).removeClass('durty');
        });
    }, 700, ids, drugCost);
    return tabName + 'updatePanelResetCost_' + ids;
}




// re render the sub population table accordingly to cetagory.
export function DrawSPDrugInfoTableBody(tabName, DrugsData, listFlag, listBastValue, listTotalExp, listOptimizeExp, listCetagoryId) {

    $('.' + tabName + 'DrugInfoTableBody').html('');




    // if (!listFlag) {

    //     let clientTotalN = _.where(DrugsData, { isImsDrug: 0 })[0].TotalN;

    //     for (let i = 0; i < DrugsData.length; i++) {

    //         if (DrugsData[i].isImsDrug == 1) {
    //             DrugsData[i].Utilization.Utilization = 0;
    //             DrugsData[i].TotalN = clientTotalN;
    //             DrugsData[i].DrugN = 0;
    //         }
    //     }
    // }

    var thBGColor = ['#1FA05C', '#8347aa', '#ab8a19', '#4a545f', '#00a9a3', '#6e852e', '#aa4747', '#4c6f85', '#9fca53', '#1972ab']

    var bestValueForTotalPatientExpanses = 0;

    var totalExpanses = 0,
        totalPatients = 0,
        totalUtilization = 0;

    //check if profile is selected
    let appliedProfile = payerUtils.getSavingsProfile(tabName),
        isSavingProfSelected = appliedProfile.isSelected,
        drugConsideration = !isSavingProfSelected ? null : appliedProfile.profileInfo.split('_')[1];

    DrugsData.sort(function(a, b) {
        return parseFloat(b.TotalDisplayValue) - parseFloat(a.TotalDisplayValue);
    });


    let bestValueData = [];
    let hideRweReccDrug = false;
    if (!listFlag) {
        // get RWE data only.
        bestValueData = payerUtils.getFilteredDataset(DrugsData, false);
        bestValueData = bestValueData.length > 0 ? bestValueData : DrugsData;
    } else {
        bestValueData = DrugsData;
        hideRweReccDrug = true;
    }

    // get Best Values Score From IMS
    let filteredBVDrug = getBestValueScore(bestValueData);

    //let filteredBVDrug = _.where(DrugsData, bestValueDrugFromRwe)[0];

    let innerHTML = '';

    for (var i = 0; i < DrugsData.length; i++) {

        $('.' + tabName + 'ThisCategoryPatients').html(DrugsData[i]['TotalN']);

        var ids = DrugsData[i]['DrugName'].replace(/\W/g, '');
        var bestValueDragCost = 0;
        var bestValuetotalPatient = 0;
        // Commented By yuvraj : 16th March
        // var tempValue = parseFloat(parseFloat(DrugsData[i]['best_value']).toFixed(2));
        var value = parseFloat(parseFloat(DrugsData[i]['TotalDisplayValue']).toFixed(2));

        // if (bestValueScoreFromRwe == value && !isSavingProfSelected) {
        //     bestValueDragCost = parseInt(DrugsData[i]['Cost']['TotalCost']);
        //     bestValuetotalPatient = parseInt(DrugsData[i]['TotalN']);
        //     bestValueForTotalPatientExpanses = bestValueDragCost * bestValuetotalPatient;
        // }

        if (!isSavingProfSelected) {

            bestValueDragCost = parseInt(filteredBVDrug['Cost']['TotalCost']);
            bestValuetotalPatient = parseInt(filteredBVDrug['TotalN']);
            bestValueForTotalPatientExpanses = bestValueDragCost * bestValuetotalPatient;
        }


        if (!listFlag) {
            DrugsData[i]['realDrugN'] = DrugsData[i]['DrugN'];
            DrugsData[i]['realTotalCost'] = DrugsData[i]['Cost']['TotalCost'];
        }


        //check for the saving profile
        if (isSavingProfSelected) {
            let modifiedDrugN = parseInt(DrugsData[i]['TotalN']) * parseInt(DrugsData[i]['Utilization']['Utilization']) * 0.01;
            if (modifiedDrugN != 0) {
                bestValueForTotalPatientExpanses += parseInt(DrugsData[i]['Cost']['TotalCost']) * Math.round(modifiedDrugN);
            }

            modifiedDrugN = parseInt(DrugsData[i]['TotalN']) * parseInt(DrugsData[i]['Utilization']['Utilization']);
            DrugsData[i]['DrugN'] = Math.round(modifiedDrugN / 100);
        }


        // let modifiedDrugN = parseInt(DrugsData[i]['TotalN']) * parseInt(DrugsData[i]['Utilization']['Utilization']);
        // DrugsData[i]['DrugN'] = Math.round(modifiedDrugN / 100);

        innerHTML = innerHTML + DrawSPDrugInfoTableBodyInnerElement(tabName, DrugsData, DrugsData[i], ids, thBGColor[i], listCetagoryId);

        //totalExpanses = totalExpanses + parseInt(DrugsData[i]['calculatedTotalPayerCost']);

        if (!listFlag && isSavingProfSelected) {
            totalExpanses += getRealExpenseDataForDrug(DrugsData[i], tabName);
        } else {
            totalExpanses = totalExpanses + parseInt(DrugsData[i]['calculatedTotalPayerCost']);
        }

        totalPatients += parseInt(DrugsData[i]['DrugN']);
        totalUtilization += parseInt(DrugsData[i]['Utilization']['Utilization']);
    }

    // TO DO : We want immutable IMS DATA everytime.
    //let imsDrugsData = _.where(DrugsData, { isImsDrug: 1 });
    let imsDrugsData = getSubpopulationRWEDataForSPTable(tabName);

    imsDrugsData.sort(function(a, b) {
        return parseFloat(b.TotalDisplayValue) - parseFloat(a.TotalDisplayValue);
    });

    let ims_innerHTML = '';

    // Added By yuvraj 11th March 17 prepare ims_innerHTML
    // the following loop prepare inner table for REW Data.
    //Pram (21st Mar 17): check if there is no data for RWE 
    if (imsDrugsData.length == 0) {
        ims_innerHTML = '<div class="providerNoDataFound">No data found in Real World Evidence for the selected cohort.</div>';
    } else {
        for (var i = 0; i < imsDrugsData.length; i++) {

            ims_innerHTML = ims_innerHTML + DrawSPDrugInfoTableBodyInnerElement_IMS(tabName, imsDrugsData[i], ids, thBGColor[i], listCetagoryId);
        }
    }

    var subpopulationExpansesChartData = {};

    // Create Expense Chart
    if (innerHTML == '') {

    } else {


        if (listFlag == 'list') {
            // Prepare Expense chart object.

            subpopulationExpansesChartData = preapareExpenseChartObject(true, listBastValue, listTotalExp, listOptimizeExp);


        } else {
            subpopulationExpansesChartData = preapareExpenseChartObject(false, bestValueForTotalPatientExpanses, totalExpanses);

        }

        createSubpopulationExpansesChart(tabName + "ExpansesAndOutcomeChart", subpopulationExpansesChartData);
    }



    // added by Yuvraj 10th March
    // Updated by Jayesh 15th March For UI Design
    let html = prepareFinalDrugsTableStructure(tabName, innerHTML, ims_innerHTML);

    // Appned drugs table (Detail View).
    appendDrugsTableInContainer(tabName, html);

    // Not In USE
    var SubpopulationBubbles = $('.' + tabName + 'SubpopulationBubbles');

    // Appned the drugs data in to the reset icon. (This is unchanges data.)
    appendDrugsDataInResetIcon(tabName, DrugsData);

    for (var i = 0; i < DrugsData.length; i++) {


        var ids = DrugsData[i]['uniqueDrugId'].replace(/\W/g, '');
        var classNameUtilization = tabName + '-slider-range-max-utilization-' + ids;
        var classNameCost = tabName + '-slider-range-min-cost-' + ids;

        $('.' + classNameUtilization).attr('expansesData', JSON.stringify(subpopulationExpansesChartData));


        if (i == 0) {
            if (listFlag == 'list') {
                calculateQualityIndicatorsData(tabName, DrugsData, 'list', '', listCetagoryId);
            } else {
                calculateQualityIndicatorsData(tabName, DrugsData, 'render');
            }
        }


        //$('.'+classNameUtilization).attr('qualityIndicatorsData',JSON.stringify(qualityIndicatorsData));
        $('.' + classNameUtilization).attr('data', JSON.stringify(DrugsData[i]));
        $('.' + classNameCost).attr('data', JSON.stringify(DrugsData[i]));

        // //get the adverse reactions data for the drug
        var adverse_reactions = JSON.parse(DrugsData[i]['adverse_reactions']);
        var hospitalizationData = [],
            rxCostData = [];

        var parentContainer = tabName + 'Safety' + assignIdforCanvas(DrugsData[i]['uniqueDrugId']) + '_innerPopup';
        var drugPatientsCount = DrugsData[i]['TotalN'];
        var totalAdditionalCost = 0; //total additional cost


        for (var key in adverse_reactions) {
            var reaction = adverse_reactions[key];
            if (reaction.count > 0) {
                // hospitalizationData.push({ name: key, count: reaction.count / drugPatientsCount });
                // Display count not % value of patients
                hospitalizationData.push({ name: key, count: reaction.count });
                rxCostData.push({ name: key, cost: reaction.cost });
                totalAdditionalCost += Math.round(reaction.cost);
            }
        }


        //// OLD Rx Hospitalization code Start
        // //render for hospitalization Data Chart
        // var chartContainer = '#' + parentContainer + ' .hospitalizationChart';
        // $(chartContainer).attr('chartData', JSON.stringify(hospitalizationData));
        // renderDrugSafetyHospitalizationChart(chartContainer, hospitalizationData, { x: 'name', y: 'count' });

        // //render for RxCost Data Chart
        // chartContainer = '#' + parentContainer + ' .rxcostchart';
        // $(chartContainer).attr('chartData', JSON.stringify(rxCostData));
        // console.log("***chartContainer **");
        // console.log(chartContainer);
        // renderDrugSafetyDrugCostChart(chartContainer, rxCostData, { x: 'name', y: 'cost' });

        // //set the total Additional Cost
        // $('#' + parentContainer + ' .rxAddiCostValue').html('$' + commaSeperatedNumber(totalAdditionalCost));

        //// OLD Rx Hospitalization code END 
        //// NEW RX and HOSPITALIZATION Table Structure


        // Commented by Yuvraj 24th March 17 
        // $('#' + tabName + 'sub-hosp-rx-tbl' + assignIdforCanvas(DrugsData[i]['DrugName']))
        //     .html(prepareTableDataForHospitalizationAndRxCost({
        //         adverse_reactions: JSON.parse(DrugsData[i]['adverse_reactions']),
        //         hospitalizationData: hospitalizationData,
        //         rxCostData: rxCostData,
        //         TotalN: DrugsData[i]['TotalN'],
        //         TotalAdditionalCost: totalAdditionalCost
        //     }));



        //render clinical section for each drug
        parentContainer = parentContainer.replace('_innerPopup', '_clinicalTrialsSection');
        var container = '#' + parentContainer + ' .spClinicalTrialsSection';
        payerUtils.renderClinicalTrialsSection(container, DrugsData[i]);

        // Added by Yurvaj ( 24th March 17)
        let hospitalizationView = prepareTableDataForHospitalizationAndRxCost({
            adverse_reactions: JSON.parse(DrugsData[i]['adverse_reactions']),
            hospitalizationData: hospitalizationData,
            rxCostData: rxCostData,
            TotalN: DrugsData[i]['TotalN'],
            TotalAdditionalCost: totalAdditionalCost
        });
        $(container + ' .hospitalizationSection').attr('data-content', hospitalizationView)

        // var drugComparisionChartContainer = tabName+'drugComparisionChart';
        // $('#' +drugComparisionChartContainer+ '.comparisonChartBody').popover();
        // renderDrugComparisionChart('#' +drugComparisionChartContainer+ ' .comparisonChartBody',DrugsData);


        //render comparision chart data
        var drugComparisionChartContainer = tabName + 'drugComparisionChart';
        container = '#' + drugComparisionChartContainer + ' .comparisonChartBody';



        $('#' + drugComparisionChartContainer).popover({
            //container: 'body',
            content: function() {
                return $(container).html();
            },
            placement: 'left',
            html: true,
            title: 'Adverse Reactions Comparision -<span>&nbsp;(Sorted by Safe Drugs)&nbsp;</span><i class=\'fa fa-times pull-right popoverTogle\' onclick=\'$(&quot;#' + drugComparisionChartContainer + '&quot;).popover(&quot;hide&quot;);\'></i>'
        }).click(function(e) {
            e.preventDefault();
            //e.stopPropagation();
            var realDrugsData = JSON.parse($(e.currentTarget).attr('data'));
            var temp = $(e.currentTarget).siblings('.popover').children('.popover-content');
            var popoverEle = $(e.currentTarget).siblings('.popover');
            $(temp).addClass('svgContent');
            $(temp).addClass('drugComparisonSVGWrapper');
            realDrugsData = _.filter(realDrugsData, (a) => a.DrugN != 0);
            var comparisonChartData = prepareDrugComparisonChartData(realDrugsData);

            // Show No Data Found When Zero Hospitalizations
            var nodata = true;
            for (var i = 0; i < comparisonChartData.chartData.length; i++) {
                if (comparisonChartData.chartData[i].count_p > 0) {
                    nodata = false;
                }
            }

            if (nodata) {
                var html = '<span style="color: #aaaeaf;font-size: 12px;"> No hospitalization and additional cost for this Subpopulation.</span>';
                $('.svgContent').html(html);
                $(popoverEle).css({ 'top': '-22px !important', 'left': '690px !important', 'max-width': '400px' });
            } else {
                renderDrugComparisionChart('.svgContent', comparisonChartData);
                $(popoverEle).css({ 'top': '-190px', 'left': '230px', 'max-width': '850px' });
                $(temp).css({ 'max-height': ($(temp).height() + 50) + 'px', 'width': ($('.svgContent').width() + 140) + 'px' });
                $(temp).css({ 'max-height': ($(temp).height() + 50) + 'px' });
                $(temp).removeClass('svgContent');
            }

        });



        $('#' + drugComparisionChartContainer).attr('data', JSON.stringify(DrugsData));


        // To Open One Popover at a time and close other.
        $('[data-toggle=popover]').on('click', function(e) {
            $('[data-toggle=popover]').not(this).popover('hide');
        });


        //update total patient count, projected expanses & total Utilization
        $('.' + tabName + 'drugInfoFooter-totalProjExpenses').html('$' + commaSeperatedNumber(totalExpanses));
        $('.' + tabName + 'drugInfoFooter-totalPat').html(totalPatients);
        $('.' + tabName + 'drugInfoFooter-totalUti').html(totalUtilization + '%');

    }

    // Safety section for IMS tab  added by Yuvraj 16th March
    for (var i = 0; i < imsDrugsData.length; i++) {

        // //get the adverse reactions data for the drug
        var adverse_reactions = JSON.parse(imsDrugsData[i]['adverse_reactions']);

        var hospitalizationData = [];
        var rxCostData = [];
        var totalAdditionalCost = 0; //total additional cost

        for (var key in adverse_reactions) {
            var reaction = adverse_reactions[key];
            if (reaction.count > 0) {
                // Display count not % value of patients
                hospitalizationData.push({ name: key, count: reaction.count });
                rxCostData.push({ name: key, cost: reaction.cost });
                totalAdditionalCost += Math.round(reaction.cost);
            }
        }

        //  Required
        $('#ims_' + tabName + 'sub-hosp-rx-tbl' + assignIdforCanvas(imsDrugsData[i]['DrugName']))
            .html(prepareTableDataForHospitalizationAndRxCost({
                adverse_reactions: JSON.parse(imsDrugsData[i]['adverse_reactions']),
                hospitalizationData: hospitalizationData,
                rxCostData: rxCostData,
                TotalN: imsDrugsData[i]['TotalN'],
                TotalAdditionalCost: totalAdditionalCost
            }));


        var parentContainer = tabName + 'Safety' + assignIdforCanvas(imsDrugsData[i]['uniqueDrugId']) + '_innerPopup';

        //render clinical section for each drug
        parentContainer = parentContainer.replace('_innerPopup', '_clinicalTrialsSection');

        // container for drug Clinical Trail Section chart - Yurvaj
        var container = '#' + parentContainer + ' .spClinicalTrialsSection';

        // Render Clinical trial Section - Yuvraj
        payerUtils.renderClinicalTrialsSection(container, imsDrugsData[i]);

    } // for loop end.


    bindUtilizationLockUnlockEvent();

    bindClinicalTrailSectionOpenEvent();

    bindClinicalTrailSectionCloseEvent();

    //reCalculateValueScorePerDrug(DrugsData, tabName);
    setTimeout(function() {

        bindUtilizationSlideEvent(tabName);

    }, 800); // setTimeout End


    setBestValueAndRecommendedDrug(filteredBVDrug, tabName, hideRweReccDrug);


}; //  DrawSPDrugInfoTableBody End



function DrawSPDrugInfoTableBodyInnerElement(tabName, rawDrugsData, DrugsData, ids, thBGColor, category_id) {
    // console.log("*** DrugsData ****");
    // console.log(DrugsData);
    let datasetDrugClass = DrugsData.isImsDrug == 1 ? 'ims-table-row' : 'phs-table-row';

    /**
     * @author: Pramveer
     * @date: 15th Mar 17
     * @desc: modification for best value drug to be always the ims one
     */
    // To Do: show recommended drug in front of best value drug of ims.
    // let filteredImsData = _.where(rawDrugsData, { isImsDrug: 1 });
    // filteredImsData = _.sortBy(filteredImsData, 'TotalDisplayValue').reverse();
    // let bestValueIms = filteredImsData[0];

    let filteredData = rawDrugsData;

    //filteredData = _.sortBy(filteredData, 'TotalDisplayValue').reverse();
    filteredData = _.sortBy(filteredData, 'TotalActualValue').reverse();
    let bestValuePhs = filteredData[0];

    //let bestValue = _.pluck(filteredData, 'TotalDisplayValue')[0];
    let bestValue = filteredData[0].TotalDisplayValue;

    //DrugsData['best_value'] = bestValue
    //Pram(22th Mar 17): Check if no RWE drug is available then use the best value from the client dataset
    DrugsData['best_value'] = bestValue ? bestValue : parseFloat(DrugsData.best_value).toFixed(2);

    let clientHTML = `<div class="comparisonTableRow ${datasetDrugClass}">
                <div id="${tabName}resetUtilization" style="visibility: hidden;position: absolute;top: 8px;left: 43%;">Reset Utilization</div>
                <div id="${tabName}utilizationReset" class="utilizationReset" onclick="resetUtilizationSlider('${tabName}',this);" style="visibility: hidden;"></div>

                <div style="width: 97%; float:left;">
                    <div style="width:100%; float:left; padding-bottom: 15px;">
                        <div class="spTableArrowRight" style="float: left;"></div>
                        <div class="" style="float: left; margin: 4px;">
                            <span style="background:${thBGColor};width:10px;height:10px;border-radius:50%; display:block;"></span>
                        </div>
                        <div class="spTableDrugName">${DrugsData['DrugName']}</div>
                        <span id="${assignIdforValueScore(DrugsData['uniqueDrugId'], tabName)}_BVDrug" style="color: #2fb39e;display:none;">(Best Value Drug)</span>
                        <span id="${assignIdforValueScore(DrugsData['uniqueDrugId'], tabName)}_ReccDrug" style="color: #2fb39e;display:none;">(RWE Recommended Drug)</span>
                    </div>


                    <div style="width:100%; float: left;">
                        <div class="SpValueScoreContainer" style="width: 20%; float:left; text-align: center;">
                            <div class="vsCircle" id="${assignIdforValueScore(DrugsData['uniqueDrugId'], tabName)}">
                                ${calculateBestValueFromValues(DrugsData['best_value'], DrugsData['TotalDisplayValue'], DrugsData['uniqueDrugId'], tabName)}
                            </div>
                            <div class="bubbleFooter">Value Score</div>
                        </div>

                        <div class="${tabName}SubpopulationBubbles SubpopulationBubbles">
                            ${GeneratePercentCircleForPayer({ score: DrugsData["Efficacy"]["Efficacy"] ,tipData: {effCount: DrugsData["Efficacy"]["Efficacy_Count"] , total:DrugsData["DrugN"] }} )}
                            <div class="bubbleFooter">Efficacy</div>
                        </div>

                        <div class="${tabName}SubpopulationBubbles SubpopulationBubbles">
                        ${GeneratePercentCircleForPayer({ score: DrugsData["Adherence"]["Adherence"] })}
                            <div class="bubbleFooter">Adherence</div>
                        </div>


                        <div class="${tabName}Utilization" style="width: 20%; float:left; text-align: center;">
                            <div data="${DrugsData['DrugN']}" class="sliders">
                                <span style="color:#ef4823;" class="value">${DrugsData["Utilization"]["Utilization"]}</span>
                                <span style="color:#ef4823;">%</span>
                                <span class="drugTablelockunlock unlock lockhide" style="padding-bottom: 0px;">&nbsp;&nbsp;&nbsp;</span>
                                <div class="slider spUtilizationslider ${assignClassAndSliderEventForUtilization(DrugsData['Utilization']['Utilization'], DrugsData['uniqueDrugId'], tabName) }" ></div>

                                <div class="drugTablePCount totalPatientsValue" style="margin-left:-5px;display:inline-block;">${DrugsData['DrugN']}</div>
                                <div class="bubbleFooter">Utilization</div>
                            </div>
                        </div>

                        <div class="${tabName}Cost" style="width: 20%; float:left; text-align: center;">
                            <div class="" style="width: 100%; float:left;">
                                <div class="costSliderContainer">
                                    <div class="totalCostValue" style="display:none;">${commaSeperatedNumber(DrugsData['Cost']['TotalCost'])}</div>
                                    <div style="color:#ef4823;display:inline-block;">$</div>
                                    <div class="value" style="padding-bottom:0px;color:#ef4823;display:inline-block;">${commaSeperatedNumber(DrugsData['Cost']['TotalCost'])}</div>
                                    <div data="${DrugsData['DrugN']}" class="spCostslider ${assignClassAndSliderEventForCost(DrugsData['Cost']['TotalCost'], DrugsData['uniqueDrugId'], tabName) }" ></div>
                                </div>
                                <div id="${assignIdResetEventForCost(DrugsData['Cost']['TotalCost'], DrugsData['uniqueDrugId'], tabName) }" class="costReset" style="visibility: hidden;"></div>
                                <div class="bubbleFooter" style="position: relative; top:33px;left:15px;">Drug Cost</div>
                            </div>
                        </div>
                    </div>

                </div>

                <div id="${tabName}Safety${assignIdforCanvas(DrugsData['uniqueDrugId'])}_innerPopup" class="${tabName.replace(/\d+/g, '')}SafetyPopup" style="width:3%; float: left;">

                   <!-- //// COMMENTED CODE FOR HOSPITALIZATION AND  RX COST SMALL BAR CHART
                    // '<div style="width: 100%; float:left;">' +
                    // '<div class="hospitalizationChartLabel" style="width: 50%; float:left;">Hospitalization</div>' +
                    // '<div class="RxCostChartLabel" style="width: 50%; float:left;">' +
                    // '<span class="rxCostChartLabel">Rx</span>' +
                    // '<span class="rxAddiCostValue">$0</span>' +
                    // '<span class="rxAddiCostLabel">Additional Cost - </span>' +
                    // '</div>' +

                    // '</div>' +

                    // '<div style="width: 100%; float:left;">' +
                    // '<div style="width:50%; float:left">' +
                    // '<div class="hospitalizationChart" onclick="zoomSubpopulationChart(this,\'' + tabName + '\',\'hospitalizationchart\')"></div>' +
                    // '</div>' +
                    // '<div style="width:50%; float:left;">' +
                    // '<div class="rxcostchart" onclick="zoomSubpopulationChart(this,\'' + tabName + '\',\'rxcostchart\')"></div>' +
                    // '</div>' +
                    // '</div>' + -->

                    <div id="${tabName}sub-hosp-rx-tbl${assignIdforCanvas(DrugsData['uniqueDrugId'])}" class="${tabName.replace(/\d+/g, '')}SafetyPopup" style="width:100%; float: left;"></div>
                </div>

                <div id="${tabName}Safety${assignIdforCanvas(DrugsData['uniqueDrugId'])}_clinicalTrialsSection" style="width:2%; float: left;">
                    <div class="js-spClinicalTrialsSectionIcon" style="width: 100%; float:left; cursor:pointer;">
                        <img src="/menu-dot.png" />
                    </div>

                    <div class="spClinicalTrialSectionContainer" style="display: none;">
                        <div class="spClinicalTrialsSection">
                            <div style="width:100%; float: left;">
                                <div class="spClinicalTrialsSection-Title" style="float: left; width: 75%; padding-right: 5px;">Clinical Trials</div>
                                <div class="js-CloseSpClinicalTrialsSection" style="float: right; padding: 4px; cursor: pointer;"><img src="/menu-dot.png" /></div>
                            </div>
                            <div style="width:100%; float: left;">
                                <div class="topRiskSection js-riskSection riskSection isActive" data-content="" iframeData="false">Top Risk</div>
                                <div class="drugInteractionSection js-riskSection riskSection" data-content="" iframeData="true">Drug Interaction</div>
                                <div class="contraInteractionSection js-riskSection riskSection" data-content="" iframeData="true">Contra Indication</div>
                                <div class="lowRiskSection js-riskSection riskSection" data-content="" iframeData="false">Low Risk</div>
                                <div class="hospitalizationSection js-riskSection riskSection" data-content="" iframeData="false">Hospitalizations</div>
                            </div>
                        </div>
                        <div class="spClinicalTrialsContent"></div>
                    </div>

                </div>
            </div>`;


    return clientHTML;
}

function DrawSPDrugInfoTableBodyInnerElement_IMS(tabName, DrugsData, ids, thBGColor, category_id) {
    // console.log("*** DrugsData ****");
    // console.log(DrugsData);


    let clientHTML = `<div class="comparisonTableRow">
                <div id="resetUtilization_rwe" style="visibility: hidden;position: absolute;top: 8px;left: 43%;">Reset Utilization</div>
                <div id="${tabName}utilizationReset" class="utilizationReset" onclick="resetUtilizationSlider('${tabName}',this);" style="visibility: hidden;"></div>
                
                <div style="width: 55%; float:left;">
                    <div style="width:100%; float:left; padding-bottom: 15px;">
                        <div class="spTableArrowRight" style="float: left;"></div>
                        <div class="" style="float: left; margin: 4px;">
                            <span style="background:${thBGColor};width:10px;height:10px;border-radius:50%; display:block;"></span>
                        </div>
                        <div class="spTableDrugName">${DrugsData['DrugName']}</div>
                        <span id="${assignIdforValueScore(DrugsData['DrugName'], tabName)}_BVDrug" style="color: #2fb39e;display:none;">(best value drug)</span>
                    </div>


                    <div style="width:100%; float: left;">
                        <div class="SpValueScoreContainer" style="width: 20%; float:left; text-align: center;">
                            <div class="vsCircle" id="${assignIdforValueScore(DrugsData['DrugName'], tabName)}">
                                ${calculateBestValueFromValues(DrugsData['best_value'], DrugsData['TotalDisplayValue'], DrugsData['DrugName'], tabName)}
                            </div>
                            <div class="bubbleFooter">Value Score</div>
                        </div>

                        <div class="${tabName}SubpopulationBubbles SubpopulationBubbles">
                            ${GeneratePercentCircleForPayer({ score: DrugsData["Efficacy"]["Efficacy"] ,tipData: {effCount: DrugsData["Efficacy"]["Efficacy_Count"] , total:DrugsData["DrugN"] }} )}
                            <div class="bubbleFooter">Efficacy</div>
                        </div>

                        <div class="${tabName}SubpopulationBubbles SubpopulationBubbles">
                        ${GeneratePercentCircleForPayer({ score: DrugsData["Adherence"]["Adherence"] })}
                            <div class="bubbleFooter">Adherence</div>
                        </div>


                        <div class="${tabName}SubpopulationBubbles SubpopulationBubbles">
                            ${GeneratePercentCircleForPayer({ score: DrugsData["Utilization"]["Utilization"] },2)}
                            <div class="bubbleFooter">Utilization</div>
                        </div>


                        <div class="${tabName}SubpopulationBubbles SubpopulationBubbles subpopulation-ims-cost">
                            $${commaSeperatedNumber(DrugsData["Cost"]["TotalCost"])}
                            <div class="bubbleFooter" style="margin-top: 30px;">Drug Cost</div>
                        </div>

                    </div>

                </div>

                <div id="${tabName}Safety${assignIdforCanvas(DrugsData['DrugName'])}_innerPopup" class="${tabName.replace(/\d+/g, '')}SafetyPopup" style="width:43%; float: left;">


                   <!-- //// COMMENTED CODE FOR HOSPITALIZATION AND  RX COST SMALL BAR CHART
                    // '<div style="width: 100%; float:left;">' +
                    // '<div class="hospitalizationChartLabel" style="width: 50%; float:left;">Hospitalization</div>' +
                    // '<div class="RxCostChartLabel" style="width: 50%; float:left;">' +
                    // '<span class="rxCostChartLabel">Rx</span>' +
                    // '<span class="rxAddiCostValue">$0</span>' +
                    // '<span class="rxAddiCostLabel">Additional Cost - </span>' +
                    // '</div>' +

                    // '</div>' +

                    // '<div style="width: 100%; float:left;">' +
                    // '<div style="width:50%; float:left">' +
                    // '<div class="hospitalizationChart" onclick="zoomSubpopulationChart(this,\'' + tabName + '\',\'hospitalizationchart\')"></div>' +
                    // '</div>' +
                    // '<div style="width:50%; float:left;">' +
                    // '<div class="rxcostchart" onclick="zoomSubpopulationChart(this,\'' + tabName + '\',\'rxcostchart\')"></div>' +
                    // '</div>' +
                    // '</div>' + -->

                    <div id="ims_${tabName}sub-hosp-rx-tbl${assignIdforCanvas(DrugsData['DrugName'])}" class="${tabName.replace(/\d+/g, '')}SafetyPopup" style="width:100%; float: left;"></div>
                </div>

                <div id="${tabName}Safety${assignIdforCanvas(DrugsData['DrugName'])}_clinicalTrialsSection" style="width:2%; float: left;">
                    <div class="js-spClinicalTrialsSectionIcon" style="width: 100%; float:left; cursor:pointer;">
                        <img src="/menu-dot.png" />
                    </div>

                    <div class="spClinicalTrialSectionContainer" style="display: none;">
                        <div class="spClinicalTrialsSection">
                            <div style="width:100%; float: left;">
                                <div class="spClinicalTrialsSection-Title" style="float: left; width: 75%; padding-right: 5px;">Clinical Trials / Safety</div>
                                <div class="js-CloseSpClinicalTrialsSection" style="float: right; padding: 4px; cursor: pointer;"><img src="/menu-dot.png" /></div>
                            </div>
                            <div style="width:100%; float: left;">
                                <div class="topRiskSection js-riskSection riskSection isActive" data-content="" iframeData="false">Top Risk</div>
                                <div class="drugInteractionSection js-riskSection riskSection" data-content="" iframeData="true">Drug Interaction</div>
                                <div class="contraInteractionSection js-riskSection riskSection" data-content="" iframeData="true">Contra Indication</div>
                                <div class="lowRiskSection js-riskSection riskSection" data-content="" iframeData="false">Low Risk</div>
                                <div class="hospitalizationSection js-riskSection riskSection" data-content="" iframeData="false">Hospitalizations</div>
                            </div>
                        </div>
                        <div class="spClinicalTrialsContent"></div>
                    </div>

                </div>
            </div>`;

    return clientHTML;
}


function reCalculateValueScorePerDrug(DrugsData, tabName) {
    var tempDrugsData = [];

    //get current relative weights value
    let weightsObj = payerUtils.getRelativeWeightValues();

    var maxCost = (DrugsData[0]['Cost']['TotalCost'] / DrugsData[0]['TreatmentPeriod']) * 8;

    for (var i = 0; i < DrugsData.length; i++) {
        let stdCost = (DrugsData[i]['Cost']['TotalCost'] / DrugsData[i]['TreatmentPeriod']) * 8;

        if (maxCost < stdCost) {
            maxCost = stdCost;
        }
    }

    for (var i = 0; i < DrugsData.length; i++) {
        let stdDrugCost = (DrugsData[i]['Cost']['TotalCost'] / DrugsData[i]['TreatmentPeriod']) * 8;

        var cost_factor = ((maxCost - stdDrugCost) / maxCost) * 100;
        //calculate value score based on weights applied
        var value = (
            weightsObj.efficacy * DrugsData[i]['Efficacy']['Efficacy'] +
            weightsObj.adherence * DrugsData[i]['Adherence']['Adherence'] +
            weightsObj.cost * cost_factor
        ) / (
            (weightsObj.efficacy + weightsObj.adherence + weightsObj.cost) * 10
        );

        if (DrugsData[i]['Efficacy']['Efficacy'] == 'NA') {
            //value = (DrugsData[i]['Adherence']['Adherence'] + cost_factor) / 20;
            value = 0;
        }

        tempDrugsData.push({ 'drugName': DrugsData[i]['DrugName'], 'valueScore': value, 'uniqueDrugId': DrugsData[i]['uniqueDrugId'] });
    }
    tempDrugsData.sort(function(a, b) {
        return (a['valueScore'] - b['valueScore']);
    });
    for (var i = 0; i < tempDrugsData.length; i++) {
        var html = calculateBestValueFromValues(tempDrugsData[tempDrugsData.length - 1]['valueScore'], tempDrugsData[i]['valueScore'], tempDrugsData[i]['uniqueDrugId'], tabName);
        var ids = tempDrugsData[i]['uniqueDrugId'].replace(/\W/g, '');
        $('#' + tabName + 'parentValueScoreDiv_' + ids).html(html);
    }
}



openInnerContent = function(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" activeSubpopulationTab", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";

    evt.currentTarget.className += " activeSubpopulationTab";
}


resetUtilizationSlider = function(tabName, obj) {
    var DrugsData = JSON.parse($(obj).attr('data'));
    //console.log(DrugsData);
    $('#' + tabName + 'utilizationReset').css('visibility', 'hidden');
    $('#' + tabName + 'resetUtilization').css('visibility', 'hidden');
    var sliderMaxClass = tabName + '-slider-range-max-utilization-';

    for (var i = 0; i < DrugsData.length; i++) {
        var ids = DrugsData[i]['uniqueDrugId'].replace(/\W/g, '');
        $('.' + sliderMaxClass + ids).slider('option', 'disabled', false);
        $('.' + sliderMaxClass + ids).siblings('.drugTablelockunlock').removeClass('lock');
        $('.' + sliderMaxClass + ids).siblings('.drugTablelockunlock').removeClass('lockshow');
        $('.' + sliderMaxClass + ids).siblings('.drugTablelockunlock').addClass('lockhide');
        $('.' + sliderMaxClass + ids).siblings('.drugTablelockunlock').addClass('unlock');
        $('.' + sliderMaxClass + ids).slider("option", "max", DrugsData[i]["Utilization"]["Utilization"]);
        $('.' + sliderMaxClass + ids).slider('value', DrugsData[i]["Utilization"]["Utilization"]);
        $('.' + sliderMaxClass + ids).siblings('.value').text(DrugsData[i]["Utilization"]["Utilization"]);
        $('.' + sliderMaxClass + ids).siblings('.totalPatientsValue').text(DrugsData[i]["DrugN"]);
    }
    moveSliderCalculateExpanses(tabName, '', '', $('.' + sliderMaxClass + ids), 'utilization');
}

function moveSliderCalculateExpanses(tabName, event, ui, obj, view) {
    //console.log(event, ui, JSON.parse($(obj).attr('data')));
    var DrugsData = [];
    var totalExpanses = 0,
        totalUtilization = 0,
        totalPatients = 0;
    var subpopulationExpansesChartData;
    var sliderMaxClass = tabName + '-slider-range-max-utilization-';
    var eles = $("." + tabName + "Utilization div.sliders .slider");

    for (var i = 0; i < eles.length; i++) {
        var ele = $(eles[i]);
        var data = JSON.parse(ele.attr('data'));

        subpopulationExpansesChartData = JSON.parse(ele.attr('expansesData'));
        var ids = data['uniqueDrugId'].replace(/\W/g, '');

        if (view == 'utilization') {

        } else if (view == 'cost') {

        }

        //sum up utilization
        totalUtilization += parseFloat(parseFloat($('.' + sliderMaxClass + ids).siblings('.value').text()).toFixed(2));

        totalPatients += parseFloat($('.' + sliderMaxClass + ids).siblings('.totalPatientsValue').text());

        data['DrugN'] = parseFloat($('.' + sliderMaxClass + ids).siblings('.totalPatientsValue').text());
        data['Utilization']['Utilization'] = parseFloat($('.' + sliderMaxClass + ids).siblings('.value').text());
        data['Cost']['TotalCost'] = parseFloat($('.' + tabName + '-slider-range-min-cost-' + ids).siblings('.value').text().split(',').join(''));
        data['calculatedTotalPayerCost'] = parseFloat(parseFloat($('.' + sliderMaxClass + ids).siblings('.totalPatientsValue').text().split(',').join('')) * parseFloat($('.' + tabName + '-slider-range-min-cost-' + ids).siblings('.value').text().split(',').join('')));

        $('#' + tabName + 'totalExpanses_' + ids).html(commaSeperatedNumber(Math.round(parseFloat(parseFloat($('.' + sliderMaxClass + ids).siblings('.totalPatientsValue').text().split(',').join('')) * parseFloat($('.' + tabName + '-slider-range-min-cost-' + ids).siblings('.value').text().split(',').join(''))))));

        totalExpanses = totalExpanses + parseFloat(parseFloat($('.' + sliderMaxClass + ids).siblings('.totalPatientsValue').text().split(',').join('')) * parseFloat($('.' + tabName + '-slider-range-min-cost-' + ids).siblings('.value').text().split(',').join('')));

        ele.attr('data', JSON.stringify(data));

        $('.' + tabName + '-slider-range-min-cost-' + ids).attr('data', JSON.stringify(data));

        DrugsData.push(data);
    }

    totalExpanses = Math.round(totalExpanses);

    localStorage.setItem(tabName + 'SvgData', JSON.stringify(DrugsData));

    reCalculateValueScorePerDrug(DrugsData, tabName);
    //Commented OLD way to prepare relative value chart
    // renderSvgChartForSissionDataPayer(tabName, 'Cost', 'Efficacy', '.dimpleMapsContainerForPayer-' + tabName);
    //New Relative value chart for payer
    payerUtils.renderNewRelativeValueChart({ container: '.dimpleMapsContainerForPayer-' + tabName, xAxis: 'Cost', yAxis: 'Efficacy', tabName: tabName, height: 220, width: 400, relativeChartData: payerUtils.prepareDataForBubbleChart(DrugsData) });

    subpopulationExpansesChartData['optimized'] = true;

    var optimizedExpense = {
        "key": "optimized",
        "displayLabel": "Optimized Expenses",
        "expenses": totalExpanses,
        "icon": "average_value-white"
    };

    var arr = subpopulationExpansesChartData['expenses'];
    arr.push(optimizedExpense);
    subpopulationExpansesChartData['expenses'] = arr;

    // var tempName = $('.'+tabName+'SubPopulationCategoriesItem').html();
    var tempName = tabName.match("^[a-zA-Z]+$") != null ? $('.' + tabName + 'SubPopulationCategoriesItem').html() : $('.' + tabName + 'detailViewLink').attr('data');
    //var cat_id = category_name_list.indexOf(tempName) + 1;

    var data = Session.get(tabName.replace(/\d+/g, '') + 'Pat_SPListData');
    data.forEach(function(rec) {
        if (rec.category_name.trim() == tempName.trim()) {
            rec.optimizedValue = totalExpanses;
            rec.optimizedValue_display = commaSeperatedNumber(totalExpanses);
        }
    });

    //set total expenses
    $('.' + tabName + 'drugInfoFooter-totalProjExpenses').html('$' + commaSeperatedNumber(totalExpanses));

    // Show Error Message if Total Utilization is Greter than 100%
    // Pram(21st Mar 17): Patch for Utilization somehow thw utilization is summing upto 100.01 (Issue Unknown) so added patch condition for this for now
    // Arvind(07th Apr 17): Patch for Utilization somehow thw utilization is summing upto 100.32 (Issue Unknown) so added patch condition for this for now
    console.log(totalUtilization);
    if (totalUtilization.toFixed(2) >= 101 && (view == 'utilization')) {
        // var temp = $('.treated-slider-range-max-utilization-'+ids).siblings('.slider');
        sAlert.closeAll();
        sAlert.error('You have made the total utilization more then 100%. Please adjust it to be 100%', { timeout: 2500, onClose: function() {}, effect: 'bouncyflip', html: true });
        $('.' + tabName + 'drugInfoFooter-totalUti').html(totalUtilization + '%');
    } else {
        $('.' + tabName + 'drugInfoFooter-totalUti').html(totalUtilization + '%');
    }

    $('.' + tabName + 'drugInfoFooter-totalPat').html(totalPatients);
    Session.set(tabName.replace(/\d+/g, '') + 'Pat_SPListData', data);
    var cetagoryName = tempName.split(' ').join('.');
    //$('.treatedSubPopulationView-ListBody .'+cetagoryName).html('<span class="inner '+tempName+'" style="text-decoration: underline;cursor: pointer;" onclick="Template.TreatedPatients.reRenderOptimizeData(this,\'list\');" >$'+commaFormat(totalExpanses)+'</span>');

    setTimeout(function() {
        $('.' + tabName.replace(/\d+/g, '') + 'SubPopulationView-ListBody .inner.' + cetagoryName).attr('data', JSON.stringify(DrugsData));
        calculateQualityIndicatorsData(tabName, DrugsData, 'list', 'move');
        createSubpopulationExpansesChart(tabName + "ExpansesAndOutcomeChart", subpopulationExpansesChartData);
    }, 200, tabName, cetagoryName, DrugsData, subpopulationExpansesChartData);

    showSaveButton();
    Session.set(tabName.replace(/\d+/g, '') + '_isCurrentModelModified', true);
}

export function calculateQualityIndicatorsData(tabName, DrugsData, type, flag, cetagoryId) {
    var qualityIndicatorsDataEfficacy = 0,
        qualityIndicatorsDataAdherence = 0,
        qualityIndicatorsDataSafety = [],
        qualityIndicatorsDataCost = 0;

    if (type == 'render') {
        //console.log('********Render*********');

        // calculate sum of Efficacy Adherence and Cost. Find Out Safety.
        for (var i = 0; i < DrugsData.length; i++) {

            // calculating Sum.
            if (!isNaN(DrugsData[i]['Efficacy']['Efficacy'])) {
                //Pram (18th Apr 17): Changed to calculate weighted efficacy
                //qualityIndicatorsDataEfficacy = qualityIndicatorsDataEfficacy + parseInt(DrugsData[i]['Efficacy']['Efficacy']);

                qualityIndicatorsDataEfficacy = qualityIndicatorsDataEfficacy + ((parseInt(DrugsData[i]['Efficacy']['Efficacy']) * DrugsData[i]['DrugN']) / DrugsData[i]['TotalN']);
            }
            //qualityIndicatorsDataEfficacy = qualityIndicatorsDataEfficacy + parseInt(DrugsData[i]['Efficacy']['Efficacy']);
            //qualityIndicatorsDataAdherence = qualityIndicatorsDataAdherence + parseInt(DrugsData[i]["Adherence"]["Adherence"]);
            qualityIndicatorsDataAdherence = qualityIndicatorsDataAdherence + ((parseInt(DrugsData[i]['Adherence']['Adherence']) * DrugsData[i]['DrugN']) / DrugsData[i]['TotalN']);
            //store the safety info
            qualityIndicatorsDataSafety.push({
                drugName: DrugsData[i]['DrugName'],
                drugCost: DrugsData[i]['Cost']['TotalCost'],
                drugCount: DrugsData[i]['DrugN'],
                drugSafety: parseInt(DrugsData[i]['Safety']),
                drugReactions: DrugsData[i]['adverse_reactions'],
                drugSafetyData: DrugsData[i]['drugSafetyData'] //Pram(20th Mar 17) : changes for safety data
            });

            // calculated Total Payer Cost is the multiplication of drug cost and Number of patientsprescribed that drug.
            qualityIndicatorsDataCost = qualityIndicatorsDataCost + parseInt(DrugsData[i]['calculatedTotalPayerCost']);
        }

        // Calculating Average.
        //qualityIndicatorsDataEfficacy = qualityIndicatorsDataEfficacy / DrugsData.length;
        //qualityIndicatorsDataAdherence = qualityIndicatorsDataAdherence / DrugsData.length;


        qualityIndicatorsDataCost = qualityIndicatorsDataCost;

        // Final Quality Indicator Data Object.
        var qualityIndicatorsData = {
            "bestValueData": {
                "Efficacy": qualityIndicatorsDataEfficacy,
                "Adherence": qualityIndicatorsDataAdherence,
                "Safety": qualityIndicatorsDataSafety,
                "Cost": qualityIndicatorsDataCost
            },
            "optimaizeData": {
                "Efficacy": qualityIndicatorsDataEfficacy,
                "Adherence": qualityIndicatorsDataAdherence,
                "Safety": qualityIndicatorsDataSafety,
                "Cost": qualityIndicatorsDataCost
            }
        };

        // Append Quality indicator data in untilization slider.
        for (var i = 0; i < DrugsData.length; i++) {
            var ids = DrugsData[i]['uniqueDrugId'].replace(/\W/g, '');
            var classNameUtilization = tabName + '-slider-range-max-utilization-' + ids;
            $('.' + classNameUtilization).attr('qualityIndicatorsData', JSON.stringify(qualityIndicatorsData));
        }

        initaizeOrRedrawQualityIndicators(tabName, qualityIndicatorsData, '.' + tabName + 'SubPopulationSectionQualityIndicatorsContainer', DrugsData, flag);

    } else {
        //console.log('********Render Else*********');

        var ids = DrugsData[0]['uniqueDrugId'].replace(/\W/g, '');
        var classNameUtilization = tabName + '-slider-range-max-utilization-' + ids;
        // var realDrugsData = getAdvPayerDrugsData(tabName, data);
        // $('#'+tabName+'utilizationReset').attr('data',JSON.stringify(realDrugsData));

        if ($('.' + classNameUtilization).attr('qualityIndicatorsData')) {
            // get quality indicator data from the utilization slider. That we have append at the time of render.
            var qualityIndicatorsData = JSON.parse($('.' + classNameUtilization).attr('qualityIndicatorsData'));

            // get Efficacy, Adherence safety and Cost Data after Subpopulation has been modified.
            for (var i = 0; i < DrugsData.length; i++) {

                // calculating Average efficacy by looking at the value of each unilization slider
                /**
                 * Note : (97 + 98 + 99)/3 is equal to  97/3 + 98/3 + 99/3
                 */
                qualityIndicatorsDataEfficacy = qualityIndicatorsDataEfficacy + ((parseInt(DrugsData[i]['Efficacy']['Efficacy']) * DrugsData[i]['DrugN']) / DrugsData[i]['TotalN']);

                // calculating Average efficacy by looking at the value of each unilization slider
                qualityIndicatorsDataAdherence = qualityIndicatorsDataAdherence + ((parseInt(DrugsData[i]['Adherence']['Adherence']) * DrugsData[i]['DrugN']) / DrugsData[i]['TotalN']);

                // safety data for quality indicators
                qualityIndicatorsDataSafety.push({
                    drugName: DrugsData[i]['DrugName'],
                    drugCost: DrugsData[i]['Cost']['TotalCost'],
                    drugCount: DrugsData[i]['DrugN'],
                    drugSafety: parseInt(DrugsData[i]['Safety']),
                    drugReactions: DrugsData[i]['adverse_reactions'],
                    drugSafetyData: DrugsData[i]['drugSafetyData'] //Pram(20th Mar 17) : changes for safety data
                });
                // calculating total cost after any modification in the subpopulation
                // ccalculatedTotalPayerCost is the multiplication of drug cost and Number of patientsprescribed that drug.
                // Problem : This is pre calculated cost. The Number of patients here can be diffrent when we modified the slider. we cannot use calculatedTotalPayerCost here. -- Need to Change
                qualityIndicatorsDataCost = qualityIndicatorsDataCost + parseInt(DrugsData[i]['calculatedTotalPayerCost']);
            }

            //check for visible cost sliders
            var visibleCost_Sliders = 0;
            $('.' + tabName + 'DrugInfoTableBody .costReset').each(function() {
                if ($(this).css('visibility') == 'visible') {
                    visibleCost_Sliders++;
                }
            });

            var isUtilSliderHidden = $('#' + tabName + 'utilizationReset').css('visibility') == 'hidden';
            // if the utilization slider is hidden the data for Efficacy Adherence and Safety will the same and Original data.
            qualityIndicatorsData['optimaizeData']['Efficacy'] = isUtilSliderHidden ? qualityIndicatorsData['bestValueData']['Efficacy'] : qualityIndicatorsDataEfficacy;
            qualityIndicatorsData['optimaizeData']['Adherence'] = isUtilSliderHidden ? qualityIndicatorsData['bestValueData']['Adherence'] : qualityIndicatorsDataAdherence;
            qualityIndicatorsData['optimaizeData']['Safety'] = isUtilSliderHidden ? qualityIndicatorsData['bestValueData']['Safety'] : qualityIndicatorsDataSafety;

            // if Utilization is not chnaged and all Cost slider is also unchanged or reset then use the original Cost data.
            qualityIndicatorsData['optimaizeData']['Cost'] = ((isUtilSliderHidden) && (visibleCost_Sliders == 0)) ? qualityIndicatorsData['bestValueData']['Cost'] : qualityIndicatorsDataCost;

            initaizeOrRedrawQualityIndicators(tabName, qualityIndicatorsData, '.' + tabName + 'SubPopulationSectionQualityIndicatorsContainer', DrugsData, flag);

        } else {
            // in this case we have no data for Quality indicator in the Utilization slider.
            // Since we cannot get the orinal data from the slider SO we have to prepare it once again from the main data.

            // console.log('********Render Else --> qualityIndi data Else*********');
            // console.log('cetagoryId------>'+cetagoryId);
            var realqualityIndicatorsDataEfficacy = 0,
                realqualityIndicatorsDataAdherence = 0,
                realqualityIndicatorsDataSafety = [],
                realqualityIndicatorsDataCost = 0;
            var data = [];
            var tempData = [];

            var temp = getStoredDataByTab(tabName);


            temp = temp.reactive_spData;

            temp = refineTheRWEUtilization(temp);

            for (var key in temp) {
                tempData.push(temp[key]);
            }

            for (var i = 0; i < tempData.length; i++) {
                if (parseInt(tempData[i]['category_id']) == parseInt(cetagoryId)) {
                    data.push(tempData[i]);
                }
            }

            // var uti = roundToExact100(data, 100);
            // for (var i = 0; i < data.length; i++) {
            //     data[i].utilization = uti[i];
            // }

            var realDrugsData = getAdvPayerDrugsData(tabName, data);

            $('#' + tabName + 'utilizationReset').attr('data', JSON.stringify(realDrugsData));
            $('#' + tabName + 'utilizationReset').css('visibility', 'hidden');
            $('#' + tabName + 'resetUtilization').css('visibility', 'hidden');

            for (var i = 0; i < realDrugsData.length; i++) {

                // realqualityIndicatorsDataEfficacy = realqualityIndicatorsDataEfficacy + parseInt(realDrugsData[i]['Efficacy']['Efficacy']);
                // realqualityIndicatorsDataAdherence = realqualityIndicatorsDataAdherence + parseInt(realDrugsData[i]["Adherence"]["Adherence"]);

                realqualityIndicatorsDataEfficacy = realqualityIndicatorsDataEfficacy + ((parseInt(realDrugsData[i]['Efficacy']['Efficacy']) * realDrugsData[i]['DrugN']) / realDrugsData[i]['TotalN']);
                realqualityIndicatorsDataAdherence = realqualityIndicatorsDataAdherence + ((parseInt(realDrugsData[i]['Adherence']['Adherence']) * realDrugsData[i]['DrugN']) / realDrugsData[i]['TotalN']);

                realqualityIndicatorsDataSafety.push({
                    drugName: realDrugsData[i]['DrugName'],
                    drugCost: realDrugsData[i]['Cost']['TotalCost'],
                    drugCount: realDrugsData[i]['DrugN'],
                    drugSafety: realDrugsData[i]['Safety'],
                    drugReactions: realDrugsData[i]['adverse_reactions'],
                    drugSafetyData: realDrugsData[i]['drugSafetyData'] //Pram(20th Mar 17) : changes for safety data
                });

                realqualityIndicatorsDataCost = realqualityIndicatorsDataCost + parseInt(realDrugsData[i]['calculatedTotalPayerCost']);
            }

            // realqualityIndicatorsDataEfficacy = realqualityIndicatorsDataEfficacy / realDrugsData.length;
            // realqualityIndicatorsDataAdherence = realqualityIndicatorsDataAdherence / realDrugsData.length;
            //realqualityIndicatorsDataSafety = realqualityIndicatorsDataSafety/realDrugsData.length;
            realqualityIndicatorsDataCost = realqualityIndicatorsDataCost;

            // prepare Optimized Quality indicator data.
            for (var i = 0; i < DrugsData.length; i++) {
                qualityIndicatorsDataEfficacy = qualityIndicatorsDataEfficacy + ((parseInt(DrugsData[i]['Efficacy']['Efficacy']) * DrugsData[i]['DrugN']) / DrugsData[i]['TotalN']);
                qualityIndicatorsDataAdherence = qualityIndicatorsDataAdherence + ((parseInt(DrugsData[i]['Adherence']['Adherence']) * DrugsData[i]['DrugN']) / DrugsData[i]['TotalN']);
                //qualityIndicatorsDataSafety = qualityIndicatorsDataSafety + ((parseInt(DrugsData[i]['Safety'])*DrugsData[i]['DrugN'])/DrugsData[i]['TotalN']);
                qualityIndicatorsDataSafety.push({
                    drugName: DrugsData[i]['DrugName'],
                    drugCost: DrugsData[i]['Cost']['TotalCost'],
                    drugCount: DrugsData[i]['DrugN'],
                    drugSafety: DrugsData[i]['Safety'],
                    drugReactions: DrugsData[i]['adverse_reactions'],
                    drugSafetyData: DrugsData[i]['drugSafetyData'] //Pram(20th Mar 17) : changes for safety data
                });
                qualityIndicatorsDataCost = qualityIndicatorsDataCost + parseInt(DrugsData[i]['calculatedTotalPayerCost']);
            }

            setTimeout(function() {
                for (var i = 0; i < realDrugsData.length; i++) {

                    var ids = realDrugsData[i]['uniqueDrugId'].replace(/\W/g, '');
                    var classNameUtilization = tabName + '-slider-range-max-utilization-' + ids;
                    var classNameCost = tabName + '-slider-range-min-cost-' + ids;

                    for (var j = 0; j < DrugsData.length; j++) {

                        /**
                         * yuvraj (13th April 2017)
                         * comment : Customer drug and RWE drugs many have same drug Name So we have to check if the unique ID is same.
                         */

                        let drugsDataID = DrugsData[j]['uniqueDrugId'].replace(/\W/g, '');
                        // if (realDrugsData[i]['DrugName'] == DrugsData[j]['DrugName']) {
                        if (drugsDataID == ids) {

                            if (realDrugsData[i]['Utilization']['Utilization'] != DrugsData[j]['Utilization']['Utilization']) {
                                $('#' + tabName + 'utilizationReset').css({ 'visibility': 'visible' });
                                $('#' + tabName + 'resetUtilization').css({ 'visibility': 'visible' });
                            }

                            var persent = (parseFloat(realDrugsData[i]['Cost']['TotalCost']) * 50) / 100;
                            $('.' + classNameCost).slider("option", "min", parseFloat(realDrugsData[i]['Cost']['TotalCost']) - persent);
                            $('.' + classNameCost).slider("option", "max", parseFloat(realDrugsData[i]['Cost']['TotalCost']) + persent);
                            $('.' + classNameCost).siblings('.totalCostValue').text(commaSeperatedNumber(parseInt(realDrugsData[i]['Cost']['TotalCost'])));

                            if (realDrugsData[i]['Cost']['TotalCost'] != DrugsData[j]['Cost']['TotalCost']) {
                                $('#' + tabName + 'updatePanelResetCost_' + ids).css('visibility', 'visible');
                                $('.' + classNameCost).addClass('durty');
                            }
                        }
                    }

                    $('.' + classNameUtilization).slider("option", "max", realDrugsData[i]['Utilization']['Utilization']);

                }

                // Quality Indicator Object.
                var qualityIndicatorsData = {
                    "bestValueData": {
                        "Efficacy": realqualityIndicatorsDataEfficacy,
                        "Adherence": realqualityIndicatorsDataAdherence,
                        "Safety": realqualityIndicatorsDataSafety,
                        "Cost": realqualityIndicatorsDataCost
                    },
                    "optimaizeData": {
                        "Efficacy": $('#' + tabName + 'utilizationReset').css('visibility') == 'hidden' ? realqualityIndicatorsDataEfficacy : qualityIndicatorsDataEfficacy,
                        "Adherence": $('#' + tabName + 'utilizationReset').css('visibility') == 'hidden' ? realqualityIndicatorsDataAdherence : qualityIndicatorsDataAdherence,
                        "Safety": $('#' + tabName + 'utilizationReset').css('visibility') == 'hidden' ? realqualityIndicatorsDataSafety : qualityIndicatorsDataSafety,
                        "Cost": qualityIndicatorsDataCost
                    }
                };

                console.log('Uti Slider ==> ', $('#' + tabName + 'utilizationReset').css('visibility'));

                // Append Quality indicators data in the Utilization sliders.
                for (var i = 0; i < DrugsData.length; i++) {
                    var ids = DrugsData[i]['uniqueDrugId'].replace(/\W/g, '');
                    var classNameUtilization = tabName + '-slider-range-max-utilization-' + ids;
                    $('.' + classNameUtilization).attr('qualityIndicatorsData', JSON.stringify(qualityIndicatorsData));
                }

                initaizeOrRedrawQualityIndicators(tabName, qualityIndicatorsData, '.' + tabName + 'SubPopulationSectionQualityIndicatorsContainer', DrugsData, flag);
            }, 2000, realDrugsData, DrugsData, realqualityIndicatorsDataEfficacy, realqualityIndicatorsDataAdherence, realqualityIndicatorsDataSafety, realqualityIndicatorsDataCost, qualityIndicatorsDataEfficacy, qualityIndicatorsDataAdherence, qualityIndicatorsDataSafety, qualityIndicatorsDataCost);
        }
    }
}

// after move utilization and cost slider calculate the expanses and initaize Or Redraw Quality Indicators.
function initaizeOrRedrawQualityIndicators(tabName, data, view, DrugsData, moveFlag) {
    var temp = tabName.replace(/\d+/g, '');
    var sessionVariable = 'uniTreatedQualityIndicators';
    if (temp == 'treating')
        sessionVariable = 'uniTreatingQualityIndicators';
    else if (temp == 'untreated')
        sessionVariable = 'uniUnTreatedQualityIndicators';

    var uniTreatedQualityIndicators = Session.get(sessionVariable);


    // var html = '<div class="row">' +
    //     '<div class="subpopulationEfficacyIndicators subpopulationIndicators col-sm-3">' +
    //     '<div class="subAdheIndicatorIconParent">' +
    //     '<div class="subpopulationIndicatorValue">' + Math.abs(data['bestValueData']['Efficacy'] - data['optimaizeData']['Efficacy']).toFixed(2) + '%</div>' +
    //     '<div class="subpopulationIndicatorLabel">Efficacy</div>' +
    //     '</div>' +
    //     '<div class="subEffIndicatorIcon subIndicatorIcon">' + calculateIncreaseAndDecreaseSign(data['bestValueData']['Efficacy'], data['optimaizeData']['Efficacy']) + '</div>' +

    //     '</div>' +
    //     '<div class="subpopulationAdherenceIndicators subpopulationIndicators col-sm-3">' +
    //     '<div class="subAdheIndicatorIconParent">' +
    //     '<div class="subpopulationIndicatorValue">' + Math.abs(data['bestValueData']['Adherence'] - data['optimaizeData']['Adherence']).toFixed(2) + '%</div>' +
    //     '<div class="subpopulationIndicatorLabel">Adherence</div>' +
    //     '</div>' +
    //     '<div class="subAdheIndicatorIcon subIndicatorIcon">' + calculateIncreaseAndDecreaseSign(data['bestValueData']['Adherence'], data['optimaizeData']['Adherence']) + '</div>' +


    //     '</div>' +
    //     '<div class="subpopulationSafetyIndicators subpopulationIndicators col-sm-3">' +
    //     '<div class="subpopulationIndicatorValue"></div>' +
    //     '<div class="subpopulationIndicatorLabel subpopulationSafetyIndicator" style="text-decoration: underline; cursor: pointer;">Safety' +
    //     '<div class="safetyIndicatorChartContainer"></div>' +
    //     '</div>' +
    //     '<div class="subSafetyIndicatorIcon subIndicatorIcon"><img src="/dr.png"></div>' +
    //     '</div>' +
    //     '<div class="subpopulationCostIndicators subpopulationIndicators col-sm-3">' +
    //     '<div class="subAdheIndicatorIconParent ">' +
    //     '<div class="subpopulationIndicatorValue">' + calculatePercentageOfCost(data['bestValueData']['Cost'], data['optimaizeData']['Cost']) + '%</div>' +
    //     '<div class="subpopulationIndicatorLabel">Cost</div>' +
    //     '</div>' +
    //     '<div class="subCostIndicatorIcon subIndicatorIcon">' + calculateIncreaseAndDecreaseSign(data['bestValueData']['Cost'], data['optimaizeData']['Cost']) + '</div>' +

    //     '</div>' +
    //     '</div>';

    var html = `<div class="row">
        <div class="subpopulationEfficacyIndicators subpopulationIndicators col-sm-3">
            <div class="subAdheIndicatorIconParent">
                <div class="recommendedDrugInfo recommendedDrugInfo_abs">
                        <div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox">                                        
                            <div class="analytics-tooltipHead">Efficacy</div>
                            <div class="analytics-tooltipBody" style="font-size: 13px;">
                                <span class="boldfnt" style="float:none;">Definition</span> - 
                                The overall impact on efficacy is determined as the difference of average efficacy for all patients treated with 100% utilization of best value drug and average 
                                efficacy of patients treated with the current utilization management.
                                <br>
                                <span class="boldfnt">Formula</span> - <br>
                                (Avg. Efficacy with Best Value Drugs - Avg. Efficacy with Utilization Management)	
                                <br> 
                            </div>
                        </div>
                    </div>
                <div class="subpopulationIndicatorValue"> ${Math.abs(data['bestValueData']['Efficacy'] - data['optimaizeData']['Efficacy']).toFixed(2)} %</div>
                <div class="subpopulationIndicatorLabel">
                <span>Efficacy
                    
                </span>
            </div>
            </div>
            <div class="subEffIndicatorIcon subIndicatorIcon"> ${calculateIncreaseAndDecreaseSign(data['bestValueData']['Efficacy'], data['optimaizeData']['Efficacy'])} </div>
        </div>
        <div class="subpopulationAdherenceIndicators subpopulationIndicators col-sm-3">
            <div class="subAdheIndicatorIconParent">
                <div class="subpopulationIndicatorValue"> ${Math.abs(data['bestValueData']['Adherence'] - data['optimaizeData']['Adherence']).toFixed(2)} %</div>
                <div class="subpopulationIndicatorLabel"><span>Adherence
                    <div class="recommendedDrugInfo recommendedDrugInfo_abs">
                        <div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox">                                        
                            <div class="analytics-tooltipHead">Adherence</div>
                                <div class="analytics-tooltipBody" style="font-size: 13px;">
                                    <span class="boldfnt" style="float:none;">Definition</span> - 
                                    The overall impact on adherence is determined as the difference of average adherence for all patients treated with 100% utilization of best value drug and average adherence 
                                    of patients treated with the current utilization management.
                                    <br>
                                        <span class="boldfnt">Formula</span> - <br>
                                        (Avg. Adherence with Best Value Drugs - Avg. Adherence with Utilization Management)		
                                        <br>                                
                                </div>
                        </div>
                    </div>
				</span></div>
            </div>
            <div class="subAdheIndicatorIcon subIndicatorIcon"> ${calculateIncreaseAndDecreaseSign(data['bestValueData']['Adherence'], data['optimaizeData']['Adherence'])} </div>
        </div>
        <div class="subpopulationSafetyIndicators subpopulationIndicators col-sm-3">
            <div class="subpopulationIndicatorValue"></div>
            <div class="subpopulationIndicatorLabel subpopulationSafetyIndicator" style="text-decoration: underline; cursor: pointer;">
                <span>Safety
                    <div class="recommendedDrugInfo recommendedDrugInfo_abs">
                        <div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox">                                        
                            <div class="analytics-tooltipHead">Safety</div>
                                <div class="analytics-tooltipBody" style="font-size: 13px;">
                                    <span class="boldfnt" style="float:none;">Definition</span> - 
                                    This section represents the impact on safety categories ( e.g. rate of hospitalization, Adverse Reactions, Drug to Drug Interactions, 
                                    Liver Failure, & Anemia ) as the difference between the 100% utilization of the best value drugs and current utilization management.
                                    <br>
                                    <span class="boldfnt">Formula</span> - <br>  
                                    (% of patients for Best Value Drugs - % of patients for Utilization Management)
                                    <br>                                 
                                </div>
                        </div>
                </div>
            </span>
                <div class="safetyIndicatorChartContainer"></div>
            </div>
            <div class="subSafetyIndicatorIcon subIndicatorIcon"><img src="/dr.png"></div>
        </div>
        <div class="subpopulationCostIndicators subpopulationIndicators col-sm-3">
            <div class="subAdheIndicatorIconParent ">
                <div class="subpopulationIndicatorValue"> ${calculatePercentageOfCost(data['bestValueData']['Cost'], data['optimaizeData']['Cost'])}%</div>
                <div class="subpopulationIndicatorLabel"><span>Cost
                    <div class="recommendedDrugInfo recommendedDrugInfo_abs">
                        <div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox">                                        
                            <div class="analytics-tooltipHead">Cost</div>
                                <div class="analytics-tooltipBody" style="font-size: 13px;">
                                        <span class="boldfnt" style="float:none;">Definition</span> - 
                                        The overall impact on cost is determined as the difference of cost for all patients treated with 100% utilization of best value drugs  
                                        and cost for  patients treated with the current utilization management.
                                        <br>
                                            <span class="boldfnt">Formula</span> - <br>
                                            (Cost for Best Value Drugs - Cost for Utilization Management) / (Cost for Utilization Management)	
                                        <br>                                
                                </div>
                        </div>
                    </div>
                </span></div>
            </div>
            <div class="subCostIndicatorIcon subIndicatorIcon"> ${calculateIncreaseAndDecreaseSign(data['bestValueData']['Cost'], data['optimaizeData']['Cost'])} </div>

        </div>
        </div>`;


    $(view).html(html);

    let optimizeDataIndicators = {};
    // var cetagoryName = $('.'+tabName+'SubPopulationCategoriesItem.active').html();
    // var cetagoryId = $('.'+tabName+'SubPopulationCategoriesItem.active').attr('data');

    //fix for the optimize link
    let cetagoryId = tabName.match(/-?\d+\.?\d*/),
        cetagoryName = '';

    cetagoryId = parseInt(cetagoryId);

    // var spCategory = _.where(Patients_category, { category_id: cetagoryId });
    // if (spCategory.length > 0) {
    //     spCategory = spCategory[0];
    //     cetagoryName = spCategory.genotype + ' ' + spCategory.treatment + ' ';
    //     cetagoryName += spCategory.cirrhosis == 'Yes' ? 'cirrhosis' : '';
    //     cetagoryName += spCategory.viral_load == '' ? '' : spCategory.viral_load + ' ';
    //     cetagoryName += spCategory.treatment_condition;
    // }

    cetagoryName = payerUtils.getSubPopulatonNameById(cetagoryId);


    var efficacyArr = [],
        adherenceArr = [],
        costArr = [],
        safetyArr = [];
    var efficacyJson = {},
        adherenceJson = {},
        costJson = {};

    // Pram (18th Apr 17) : Changed the variables to use actual values
    // efficacyJson['bestValue'] = parseFloat(parseFloat(data['optimaizeData']['Efficacy']).toFixed(2));
    // efficacyJson['value'] = parseFloat(parseFloat(data['bestValueData']['Efficacy']).toFixed(2));
    efficacyJson['bestValue'] = parseFloat(parseFloat(data['bestValueData']['Efficacy']).toFixed(2));
    efficacyJson['value'] = parseFloat(parseFloat(data['optimaizeData']['Efficacy']).toFixed(2));
    efficacyJson['cetagoryName'] = cetagoryName;
    efficacyJson['cetagoryId'] = cetagoryId;

    adherenceJson['bestValue'] = parseFloat(parseFloat(data['bestValueData']['Adherence']).toFixed(2));
    adherenceJson['value'] = parseFloat(parseFloat(data['optimaizeData']['Adherence']).toFixed(2));
    adherenceJson['cetagoryName'] = cetagoryName;
    adherenceJson['cetagoryId'] = cetagoryId;

    costJson['bestValue'] = parseFloat(parseFloat(data['bestValueData']['Cost']).toFixed(2));
    costJson['value'] = parseFloat(parseFloat(data['optimaizeData']['Cost']).toFixed(2));
    costJson['cetagoryName'] = cetagoryName;
    costJson['cetagoryId'] = cetagoryId;

    if (uniTreatedQualityIndicators['optimizeDataIndicators']) {
        optimizeDataIndicators = uniTreatedQualityIndicators['optimizeDataIndicators'];
        var indicatorFlag = true;
        var efficacyData = optimizeDataIndicators['Efficacy']['data'],
            adherenceData = optimizeDataIndicators['Adherence']['data'],
            costData = optimizeDataIndicators['Cost']['data'];

        // var efficacyValue = 0,
        //     adherenceValue = 0;

        // costValue = 0, efficacyBestValue = 0, adherenceBestValue = 0;
        // costBestValue = 0;

        //Pram (19th Apr 17): Changed the logic for the optimizations
        let costPercent = 0,
            efficacyPercent = 0,
            adherencePercent = 0;

        let categoriesForEfficacy = 0,
            categoriesForAdherence = 0,
            categoriesForCost = 0,
            removeEfficacyCategory = [],
            removeAdherenceCategory = [],
            removeCostCategory = [];


        let isCategoryExists = isCategoryOptimized(cetagoryName, optimizeDataIndicators);

        //Insert only in the array if the category doesn't exist
        if (!isCategoryExists) {
            efficacyData.push(efficacyJson);
            adherenceData.push(adherenceJson);
            costData.push(costJson);
        }

        for (let i = 0; i < efficacyData.length; i++) {
            if (cetagoryName == efficacyData[i]['cetagoryName']) {
                efficacyData[i] = efficacyJson;
            }

            let percentVal = parseFloat(efficacyData[i]['bestValue'] - efficacyData[i]['value']);
            efficacyPercent += percentVal;

            //if difference in values is there then only need to consider the sub population
            if (Math.abs(percentVal) > 0) {
                categoriesForEfficacy++;
            }
            //push the data so that this particular sub population is removed
            else {
                removeEfficacyCategory.push(efficacyData[i]);
            }
        }

        for (let i = 0; i < adherenceData.length; i++) {
            if (cetagoryName == adherenceData[i]['cetagoryName']) {
                adherenceData[i] = adherenceJson;
            }

            let percentVal = parseFloat(adherenceData[i]['bestValue'] - adherenceData[i]['value']);
            adherencePercent += percentVal;

            //if difference in values is there then only need to consider the sub population
            if (Math.abs(percentVal) > 0) {
                categoriesForAdherence++;
            }
            //push the data so that this particular sub population is removed
            else {
                removeAdherenceCategory.push(adherenceData[i]);
            }
        }

        for (let i = 0; i < costData.length; i++) {
            if (cetagoryName == costData[i]['cetagoryName']) {
                costData[i] = costJson;
            }

            let percentVal = parseFloat(calculateRelativePercentageOfCost(costData[i]['bestValue'], costData[i]['value']));
            costPercent += percentVal;

            //if difference in values is there then only need to consider the sub population
            if (Math.abs(percentVal) > 0) {
                categoriesForCost++;
            }
            //push the data so that this particular sub population is removed
            else {
                removeCostCategory.push(costData[i]);
            }
        }

        //get the average for the changes of the values
        efficacyPercent = parseFloat(efficacyPercent / categoriesForEfficacy).toFixed(2);
        adherencePercent = parseFloat(adherencePercent / categoriesForAdherence).toFixed(2);
        costPercent = parseFloat(costPercent / categoriesForCost).toFixed(2);

        //remove the unoptimized sub population from the data array (if any)
        efficacyData = removeUnOptSubPopulation(efficacyData, removeEfficacyCategory);
        adherenceData = removeUnOptSubPopulation(adherenceData, removeAdherenceCategory);
        costData = removeUnOptSubPopulation(costData, removeCostCategory);



        // for (var i = 0; i < efficacyData.length; i++) {
        //     if (cetagoryName == efficacyData[i]['cetagoryName']) {
        //         efficacyData[i] = efficacyJson;
        //         indicatorFlag = false;
        //         efficacyBestValue = efficacyBestValue + parseFloat(parseFloat(data['bestValueData']['Efficacy']).toFixed(2));
        //         efficacyValue = efficacyValue + parseFloat(parseFloat(data['optimaizeData']['Efficacy']).toFixed(2));
        //     } else {
        //         efficacyValue = efficacyValue + efficacyData[i]['value'];
        //         efficacyBestValue = efficacyBestValue + efficacyData[i]['bestValue'];
        //     }
        // }

        // for (var i = 0; i < adherenceData.length; i++) {
        //     if (cetagoryName == adherenceData[i]['cetagoryName']) {
        //         adherenceData[i] = adherenceJson;
        //         indicatorFlag = false;
        //         adherenceBestValue = adherenceBestValue + parseFloat(parseFloat(data['bestValueData']['Adherence']).toFixed(2));
        //         adherenceValue = adherenceValue + parseFloat(parseFloat(data['optimaizeData']['Adherence']).toFixed(2));
        //     } else {
        //         adherenceBestValue = adherenceBestValue + adherenceData[i]['bestValue'];
        //         adherenceValue = adherenceValue + adherenceData[i]['value'];
        //     }
        // }

        // for (var i = 0; i < costData.length; i++) {
        //     if (cetagoryName == costData[i]['cetagoryName']) {
        //         costData[i] = costJson;
        //         indicatorFlag = false;
        //         costBestValue = costBestValue + parseFloat(parseFloat(data['bestValueData']['Cost']).toFixed(2));
        //         costValue = costValue + parseFloat(parseFloat(data['optimaizeData']['Cost']).toFixed(2));
        //     } else {

        //         costBestValue = costBestValue + costData[i]['bestValue'];
        //         costValue = costValue + costData[i]['value'];
        //     }
        // }

        // if (indicatorFlag) {
        //     efficacyData.push(efficacyJson);
        //     adherenceData.push(adherenceJson);
        //     costData.push(costJson);
        // }

        // optimizeDataIndicators['Efficacy']['data'] = efficacyData;
        // optimizeDataIndicators['Adherence']['data'] = adherenceData;
        // optimizeDataIndicators['Cost']['data'] = costData;
        // optimizeDataIndicators['Efficacy']['avg'] = parseFloat(parseFloat(Math.abs(parseFloat(parseFloat(efficacyBestValue / efficacyData.length).toFixed(2)) - parseFloat(parseFloat(efficacyValue / efficacyData.length).toFixed(2)))).toFixed(2));
        // optimizeDataIndicators['Adherence']['avg'] = parseFloat(parseFloat(Math.abs(parseFloat(parseFloat(adherenceBestValue / adherenceData.length).toFixed(2)) - parseFloat(parseFloat(adherenceValue / adherenceData.length).toFixed(2)))).toFixed(2));
        // //optimizeDataIndicators['Cost']['avg'] = calculatePercentageOfCost(costBestValue, costValue).toFixed(2);
        // optimizeDataIndicators['Cost']['avg'] = costPercent;
        // optimizeDataIndicators['Efficacy']['arrowIndicator'] = calculateIncreaseAndDecreaseClassName(parseFloat(parseFloat(efficacyBestValue / efficacyData.length).toFixed(2)), parseFloat(parseFloat(efficacyValue / efficacyData.length).toFixed(2)));
        // optimizeDataIndicators['Adherence']['arrowIndicator'] = calculateIncreaseAndDecreaseClassName(parseFloat(parseFloat(adherenceBestValue / adherenceData.length).toFixed(2)), parseFloat(parseFloat(adherenceValue / adherenceData.length).toFixed(2)));
        // //optimizeDataIndicators['Cost']['arrowIndicator'] = calculateIncreaseAndDecreaseClassName(parseFloat(parseFloat(costBestValue / costData.length).toFixed(2)), parseFloat(parseFloat(costValue / costData.length).toFixed(2)));
        // optimizeDataIndicators['Cost']['arrowIndicator'] = costPercent > 0 ? 'Increased' : 'Decreased' ;
        // optimizeDataIndicators['Safety'] = data['bestValueData']['Safety'];
        // optimizeDataIndicators[cetagoryId] = DrugsData;


        optimizeDataIndicators['Efficacy']['data'] = efficacyData;
        optimizeDataIndicators['Adherence']['data'] = adherenceData;
        optimizeDataIndicators['Cost']['data'] = costData;

        optimizeDataIndicators['Efficacy']['avg'] = Math.abs(parseFloat(efficacyPercent));
        optimizeDataIndicators['Adherence']['avg'] = Math.abs(parseFloat(adherencePercent));
        optimizeDataIndicators['Cost']['avg'] = Math.abs(parseFloat(costPercent));

        optimizeDataIndicators['Efficacy']['arrowIndicator'] = getArrowClassForValue(efficacyPercent);
        optimizeDataIndicators['Adherence']['arrowIndicator'] = getArrowClassForValue(adherencePercent);
        optimizeDataIndicators['Cost']['arrowIndicator'] = getArrowClassForValue(costPercent);

        optimizeDataIndicators['Safety'] = data['bestValueData']['Safety'];
        optimizeDataIndicators[cetagoryId] = DrugsData;

        uniTreatedQualityIndicators['optimizeDataIndicators'] = optimizeDataIndicators;

    } else {

        optimizeDataIndicators['Efficacy'] = {};
        optimizeDataIndicators['Efficacy']['avg'] = parseFloat(parseFloat(Math.abs((data['bestValueData']['Efficacy'] - data['optimaizeData']['Efficacy']))).toFixed(2));
        optimizeDataIndicators['Efficacy']['arrowIndicator'] = calculateIncreaseAndDecreaseClassName(data['bestValueData']['Efficacy'], data['optimaizeData']['Efficacy']);
        efficacyArr.push(efficacyJson);
        optimizeDataIndicators['Efficacy']['data'] = efficacyArr;

        optimizeDataIndicators['Adherence'] = {};
        optimizeDataIndicators['Adherence']['avg'] = parseFloat(parseFloat(Math.abs((data['bestValueData']['Adherence'] - data['optimaizeData']['Adherence']))).toFixed(2));
        optimizeDataIndicators['Adherence']['arrowIndicator'] = calculateIncreaseAndDecreaseClassName(data['bestValueData']['Adherence'], data['optimaizeData']['Adherence']);
        adherenceArr.push(adherenceJson);
        optimizeDataIndicators['Adherence']['data'] = adherenceArr;

        optimizeDataIndicators['Cost'] = {};
        optimizeDataIndicators['Cost']['avg'] = calculatePercentageOfCost(data['bestValueData']['Cost'], data['optimaizeData']['Cost']);
        optimizeDataIndicators['Cost']['arrowIndicator'] = calculateIncreaseAndDecreaseClassName(data['bestValueData']['Cost'], data['optimaizeData']['Cost']);
        costArr.push(costJson);
        optimizeDataIndicators['Cost']['data'] = costArr;

        optimizeDataIndicators['Safety'] = data['optimaizeData']['Safety'];
        optimizeDataIndicators[cetagoryId] = DrugsData;
        uniTreatedQualityIndicators['optimizeDataIndicators'] = optimizeDataIndicators;
    }

    if (moveFlag == 'move') {
        //$('.uniQualityPopupContentOptimizeDataIndicator').css({'display':'block'});
        Session.set(sessionVariable, uniTreatedQualityIndicators);
    }
    //render sub population safety quality indicators popup
    payerUtils.createSafetyQualityIndicatorPopover(tabName + "SubPopulationSectionQualityIndicatorsContainer", "subpopulationSafetyIndicator", data, tabName);
}

reRenderOptimizeData = function(obj, flag, best, total, optimize) {
    var ele = $(obj);
    var tabName = $(ele).attr('tabName');
    var sessionVariable = 'uniTreatedQualityIndicators';
    if (tabName.replace(/\d+/g, '') == 'treating')
        sessionVariable = 'uniTreatingQualityIndicators';
    else if (tabName.replace(/\d+/g, '') == 'untreated')
        sessionVariable = 'uniUnTreatedQualityIndicators';

    if (flag == 'list') {
        //toggle the view from list to details
        $('#' + tabName + 'SubpopulationTab').css('display', 'block');
        $('#' + tabName + 'SubpopulationTab').addClass('active').siblings().removeClass('active');
        $('.' + tabName + 'PatienttemplateSubSection').hide();
        $('.' + tabName + 'PatientchartSection').hide();
        $('.' + tabName + 'PatientsubPopulationSection').show();

        var DrugsData = JSON.parse($(ele).attr('data'));
        localStorage.setItem(tabName + 'SvgData', JSON.stringify(DrugsData));
        //Commented OLD way to prepare relative value chart
        //renderSvgChartForSissionDataPayer(tabName, 'Cost', 'Efficacy', '.dimpleMapsContainerForPayer-' + tabName);
        //New Relative value chart for payer
        payerUtils.renderNewRelativeValueChart({ container: '.dimpleMapsContainerForPayer-' + tabName, xAxis: 'Cost', yAxis: 'Efficacy', tabName: tabName, height: 220, width: 400, relativeChartData: payerUtils.prepareDataForBubbleChart(DrugsData) });

        // Modified by yuvraj 11th March
        DrawSPDrugInfoTableBody(tabName, DrugsData, 'list', best, total, optimize, $(ele).attr('dataContant'));
    } else {
        var cetagoryId = $(ele).attr('data');
        //close the popup
        $(ele).closest('.popover').hide();
        var DrugsData = Session.get(sessionVariable)['optimizeDataIndicators'][cetagoryId];
        localStorage.setItem(tabName + 'SvgData', JSON.stringify(DrugsData));


        //Commented OLD way to prepare relative value chart
        // renderSvgChartForSissionDataPayer(tabName, 'Cost', 'Efficacy', '.dimpleMapsContainerForPayer-' + tabName);
        //New Relative value chart for payer
        payerUtils.renderNewRelativeValueChart({ container: '.dimpleMapsContainerForPayer-' + tabName, xAxis: 'Cost', yAxis: 'Efficacy', tabName: tabName, height: 220, width: 400, relativeChartData: payerUtils.prepareDataForBubbleChart(DrugsData) });


        var SPListData = Session.get(tabName.replace(/\d+/g, '') + 'Pat_SPListData');
        var selectedSPListData;
        for (var i = 0; i < SPListData.length; i++) {
            if (SPListData[i]['category_id'] == cetagoryId) {
                selectedSPListData = SPListData[i];
            }
        }

        // Modified by yuvraj 11th March
        DrawSPDrugInfoTableBody(tabName, DrugsData, 'list', selectedSPListData['best_value_cost'], selectedSPListData['total_cost'], selectedSPListData['optimizedValue'], cetagoryId);
        $('.' + tabName + 'SubCategoryInfo-PatientCategory').html(ele.html());
        $('.' + tabName + 'SubPopulationCategoriesItem').removeClass('active');

        if (!$('.' + tabName + 'detailViewLink').hasClass('active')) {
            $('.' + tabName + 'detailViewLink').trigger('click');
        }
        smooth_scroll_to($('.' + tabName + 'detailViewLink'));
    }
}

function calculatePercentageOfCost(oldData, newData) {
    return parseFloat(parseFloat(Math.abs(100 - ((newData * 100) / oldData))).toFixed(2));
}

let calculateRelativePercentageOfCost = (oldData, newData) => {
    //return parseFloat(parseFloat(Math.abs(100 - ((newData * 100) / oldData))).toFixed(2));
    let percent = 100 - ((newData * 100) / oldData);

    return parseFloat(percent).toFixed(2);
}

let getArrowClassForValue = (value) => {
    let signArrow = '';
    if (value > 0) {
        signArrow = 'Increased';
    } else if (value < 0) {
        signArrow = 'Decreased';
    }
    return signArrow;
}

function calculateIncreaseAndDecreaseClassName(oldData, newData) {
    var signArrow = 'Increased';
    if (oldData <= newData) {
        signArrow = 'Increased';
    } else if (oldData >= newData) {
        signArrow = 'Decreased';
    }
    return signArrow;
}

//get drugs data

export function getAdvPayerDrugsData(tabName, data) {
    var selDrugsWithData;
    if (data) {
        selDrugsWithData = getPreparedDrugsData(tabName, data);
    } else {
        selDrugsWithData = getPreparedDrugsData(tabName);
    }

    if (selDrugsWithData && selDrugsWithData.length > 0) {
        // Calculate total patient or drugN and remove further calculaton using 'calculatedTotalN' helper a
        var totalDrugN = selDrugsWithData && selDrugsWithData.length > 0 ? parseInt(selDrugsWithData[0].TotalN) : 0;
        //Always expect Array of object
        for (var i = 0; i < selDrugsWithData.length; i++) {
            var onePatientN = selDrugsWithData[i].TotalN / 100;
            ////use rounding off utilization value for consistency in payer cost calculation
            var value = Math.round(onePatientN * (selDrugsWithData[i]['Utilization']['Utilization']));
            var payerCostc = selDrugsWithData[i]['Cost']['TotalCost'];

            let isUtiFloat = isFloat(selDrugsWithData[i]['Utilization']['Utilization']);
            let utiVal = selDrugsWithData[i]['Utilization']['Utilization'];

            if (isUtiFloat) {
                utiVal = utiVal.toFixed(2);
            } else {
                utiVal = parseInt(utiVal);
            }

            selDrugsWithData[i]['calculatedTotalPayerCost'] = Math.round(parseInt(selDrugsWithData[i]['DrugN']) * (parseFloat(payerCostc)));
            selDrugsWithData[i]['dispalyCalculatedTotalPayerCost'] = commaSeperatedNumber(Math.round(parseFloat(parseInt(selDrugsWithData[i]['DrugN']) * (parseFloat(payerCostc)))));
            selDrugsWithData[i]['calculatedTotalPatientCost'] = Math.round(parseFloat((value * parseFloat(payerCostc)) * 0.2));
            selDrugsWithData[i]['dispalyCalculatedTotalPatientCost'] = commaSeperatedNumber(Math.round(parseFloat((value * parseFloat(payerCostc)) * 0.2)));
            selDrugsWithData[i]['Efficacy']['Efficacy'] = Math.round(selDrugsWithData[i]['Efficacy']['Efficacy']);
            selDrugsWithData[i]['Adherence']['Adherence'] = Math.round(selDrugsWithData[i]['Adherence']['Adherence']);
            //selDrugsWithData[i]['Utilization']['Utilization'] = Math.round(selDrugsWithData[i]['Utilization']['Utilization']);
            selDrugsWithData[i]['Utilization']['Utilization'] = utiVal;
            selDrugsWithData[i]['Safety'] = Math.round(selDrugsWithData[i]['Safety']);
            selDrugsWithData[i]['Value'] = Math.round(selDrugsWithData[i]['TotalDisplayValue']); //added value score
        }
        sortArrOfObjectsByParam(selDrugsWithData, 'calculatedTotalPayerCost', false);
    } else {
        //TO DO if no records found
    }
    selDrugsWithData.sort(function(a, b) {
        return parseFloat(b['TotalDisplayValue']) - parseFloat(a['TotalDisplayValue']);
    });
    return selDrugsWithData;
}

//prepare Drugs Data treated.
export function getPreparedDrugsData(tabName, data) {
    var drugsData = [];
    var tempData = [];

    if (data) {
        tempData = data;
    } else {
        var temp = getStoredDataByTab(tabName);
        temp = temp.reactive_spData;
        for (key in temp) {
            tempData.push(temp[key]);
        }
    }

    if (tempData) {
        if (tempData.length === 0) {
            //$(".payerTabBChartContainer").css("display", "none");
            // console.log("*****HCVAnalyticsData LENGTH is ZERO");
            // Do not return nothing when we expect array of object
            // return;
        } else if (tempData[0]['medication']) {
            for (var index = 0; index < tempData.length; index++) {

                var Drugs = {};
                var period = tempData[index]['treatment_period'];
                var cost = parseFloat(tempData[index]['cost']);
                var patientLength = parseFloat(tempData[index]['count']).toFixed(0);
                Drugs['adverse_reactions'] = tempData[index]['adverse'];
                Drugs['drugSafetyData'] = tempData[index]['drugSafetyData']; //Pram(20th Mar 17) : changes for safety data
                Drugs['TreatmentPeriod'] = tempData[index]['treatment_period']; //Pram(23th Mar 17) : changes for safety data
                Drugs['Efficacy'] = {};
                Drugs['Cost'] = {};
                Drugs['Adherence'] = {};
                Drugs['Utilization'] = {};
                Drugs['DrugId'] = index + 1;
                Drugs['Efficacy']['Efficacy'] = tempData[index]['efficacy'];
                Drugs['Efficacy']['Efficacy_Count'] = tempData[index]['efficacy_patients'];
                Drugs['Utilization']['Utilization'] = tempData[index]['utilization'];
                Drugs['Safety'] = tempData[index]['safety'];
                Drugs['DrugName'] = tempData[index]['medication'] + " (" + period + "W)";
                Drugs['Adherence']['Adherence'] = tempData[index]['adherence'];
                Drugs['Cost']['TotalCost'] = cost;
                Drugs['Cost']['TotalCostDisplay'] = commaSeperatedNumber(cost);
                // Drugs['Cost']['PayerCWR12'] = (cost * 0.8).toFixed(0);
                Drugs['Cost']['PayerCWR12'] = (cost).toFixed(0);
                // Drugs['Cost']['PatientCWR12'] = (cost * 0.2).toFixed(0);
                Drugs['Cost']['PatientCWR12'] = (cost / tempData[index]['total']).toFixed(0);
                // Drugs['Cost']['PayerCW12'] = commaSeperatedNumber((cost * 0.8).toFixed(0));
                Drugs['Cost']['PayerCW12'] = commaSeperatedNumber((cost).toFixed(0));
                Drugs['Cost']['PatientCW12'] = commaSeperatedNumber((cost * 0.2).toFixed(0));
                Drugs['TotalN'] = tempData[index]['total'];
                Drugs['TotalDisplayValue'] = parseFloat(tempData[index]['value']).toFixed(2);

                //Pram (17 Apr 17) : Added key for actual value score.
                Drugs.TotalActualValue = parseFloat(Drugs['TotalDisplayValue']);

                Drugs['DrugN'] = tempData[index]['count'];
                Drugs['DrugPopulationSize'] = tempData[index]['count'];
                Drugs['DrugPopulationUtilization'] = tempData[index]['utilization'];;
                Drugs['best_value'] = tempData[index].best_value;
                Drugs['isImsDrug'] = tempData[index].isImsDrug;
                Drugs['uniqueDrugId'] = getUniqueIdForDrug(Drugs['isImsDrug'], Drugs['DrugName']);

                drugsData.push(Drugs);
            }
        }
    }
    if (!data) {
        localStorage.setItem(tabName + 'SvgDataFinal', JSON.stringify(drugsData));
    }
    localStorage.setItem(tabName + 'SvgData', JSON.stringify(drugsData));
    return drugsData;
};


function getStoredDataByTab(tabName) {
    var categoryId = tabName.match(/-?\d+\.?\d*/); //get integer value from string
    if (categoryId)
        tabName = tabName.replace(categoryId[0], '');

    if (tabName == 'treated') {
        return {
            spData: Session.get('uniTreatedQualityIndicators'),
            reactive_spData: getDataForCategory(TreatedAnalyticsData, categoryId)
        };
    } else if (tabName == 'treating') {
        return {
            spData: Session.get('uniTreatingQualityIndicators'),
            reactive_spData: getDataForCategory(TreatingAnalyticsData, categoryId)
        };
    } else {
        return {
            spData: Session.get('uniUnTreatedQualityIndicators'),
            reactive_spData: getDataForCategory(UnTreatedAnalyticsData, categoryId)
        };
    }
}

function getDataForCategory(dataObj, categoryId) {
    //Pram (14 Apr 17): Implemented the weights to be applied on the object
    dataObj = payerUtils.applyUniverseWeightsOnBaseObject(dataObj);

    if (categoryId)
        return _.where(dataObj, { category_id: parseInt(categoryId[0]) });
    else
        return dataObj;
}

var drawCircle = function(ele) {

    var allCharts = $(ele).children('.bubble');
    //console.log(allCharts.length);
    //var el = document.getElementById(allCharts)[0];
    // var el = allCharts[0];

    for (var i = 0; i < allCharts.length; i++) {
        var el = allCharts[i];

        var options = {
            percent: parseInt(el.getAttribute('data-percent')) || 25,
            size: el.getAttribute('data-size') || 75,
            lineWidth: el.getAttribute('data-line') || 10,
            rotate: el.getAttribute('data-rotate') || 0
        }

        var canvas = document.createElement('canvas');
        var span = document.createElement('span');
        span.textContent = options.percent + '%';

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

export function showSaveButton() {
    var hidden = $('.saveModelContainer');
    hidden.show('slide', { direction: 'right' }, 400);

}

let hideSaveButton = function() {
    var hidden = $('.saveModelContainer');
    hidden.hide('slide', { direction: 'right' }, 400);
}


let hideModelDetails = function() {
    var hidden = $('.modelInfoContainer');
    hidden.hide('slide', { direction: 'right' }, 400);
}

export function showModelDetails() {
    var hidden = $('.modelInfoContainer');
    hidden.show('slide', { direction: 'right' }, 400);
}

function GeneratePercentCircleForPayer(options, toFixedValue) {
    let score = options.score == 'NA' ? 'NA' : parseFloat(parseFloat(options.score).toFixed(0));
    // console.log("***GeneratePercentCircleForPayer****");
    // console.log(score);

    /**
     * @author: Pramveer
     * @date: 14th Mar 17
     * @desc: added variable to show the value upto 2 digit in the payer circles.
     */
    let displayScore = options.score == 'NA' ? 'NA' : parseFloat(parseFloat(options.score).toFixed(toFixedValue ? toFixedValue : 0));

    let title = ``;
    if (options.tipData) {
        //Generate title properly only if we have tipData other wise not
        title = `title="SVR N = ${options.tipData.effCount} , Total N =  ${options.tipData.total}"`;
    }

    // To Fixed issue with Adherence,Efficacy Circle issue when ${score}<=50 we need to set font-size for class fill 0px
    let circleRing = `<div class="bubble c100 p${score} small" style="font-size:60px;float:none">
                        <span ${title}">${displayScore}%</span>
                        <div class="slice">
                            <!--div class="bar" style="border:5px solid #646260"></div>
                            <div class="fill" style="border:5px solid #646260"></div-->
                            <div class="bar" style="border:5px solid #e95a52"></div>
                            <div class="fill" style="border:${score != 'NA' && score>50?5:0}px solid #e95a52"></div>
                        </div>
                    </div>`;
    // let div = document.createElement('div');
    // UI.renderWithData(Template[options.templateName], options.data, div);
    // return div.innerHTML;
    return circleRing;
}

//sub population drug table functions end


export function showOurRecomendations(tabName, filtersObj, baseAnalyticsData, selectedProf, prepareddata) {
    
    //Pram (23rd May 17) : apply the universe weights on the data object
    baseAnalyticsData = payerUtils.applyUniverseWeightsOnBaseObject(baseAnalyticsData);

    let preparedHtml = ``;
    let profCount = 1;
    let dataObj = getRecommendationsData(baseAnalyticsData, tabName, prepareddata);

    preparedHtml += `<div class="recommendedProfWrapper" tabname="${tabName}">`;

    for (let keys in dataObj) {
        let currentProf = dataObj[keys],
            impactsHtml = ``,
            impactsObj = currentProf.qualityImpacts;
        let checkedRadio = '';
        if (selectedProf != undefined) {
            checkedRadio = profCount == parseInt(selectedProf.replace(/\D/g, '').trim()) ? 'checked' : '';
        }
        // <div class="pro_name">Profile Name</div>
        preparedHtml += `<div class="pro_box_${profCount}">
            <div class="rec_profile_type profile_type_${profCount}">      
            <div class="pro_set">       
                <input type="radio" name="recommendationsRadio_${tabName}" class="recommendationsRadio js-recommendationsRadio"
                                        data="profile_${profCount}" ${checkedRadio}/>
                <span class="pro_set_label">${currentProf.Name}</span>
            </div>
            </div>
            <div class="profile_desc">
            <div class="pro_name">Profile Description</div><div class="recommendations-ApplyBtn js-${tabName.toLowerCase()}Recc-ApplyBtn" style="display:none;">Apply</div>
                <div class="saving_type_${profCount}">
                <div class="pro_name">Saving Opportunities : </div>
                <div class="pro_desc_text" style="height: 12px;font-size:15px;font-weight:600;">$${commaSeperatedNumber(currentProf.savings)}</div>
                </div>

                <div class="pro_desc_text">${currentProf.desc}</div>      
            </div>
            <div class="esac_box esac_${profCount}">
                <div class="all_impact_box all_impact_${profCount}"> 
                    <span>Efficacy
                        <div class="recommendedDrugInfo recommendedDrugInfo_abs">
                            <div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox tooltip_not_filling">                                        
                                <div class="analytics-tooltipHead">Efficacy</div>
                                <div class="analytics-tooltipBody" style="font-size: 13px;">
                                    <span class="boldfnt" style="float:none;">Definition</span> - 
                                    The overall impact on efficacy is determined as the difference of average efficacy for all patients treated with
                                     100% utilization of best value drug and average efficacy of patients treated with the current utilization management
                                      in each sub population.
                                      <br/><br/>
                                    <span class="boldfnt">Formula</span>  <br>
                                    (Avg. Efficacy with Best Value Drugs - Avg. Efficacy with Utilization Management)
                                    <br> 
                                </div>
                            </div>
                        </div>
                    </span>
                    <div class="safetytitle_fullwidth">
                        <div class="sf_fixheight_width"></div>
                        <div class="object_fullwidth"><div class="${impactsObj.efficacy_class}"></div><span>${impactsObj.efficacy}%</span></div>
                    </div>
                </div>
            <div class="all_impact_box all_impact_${profCount}"> <span>Safety
                <div class="recommendedDrugInfo recommendedDrugInfo_abs">`;
        if (profCount == 3)
            preparedHtml += `<div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox analytics-tooltip-right_zero tooltip_not_filling">`;
        else
            preparedHtml += `<div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox tooltip_not_filling">`;
        preparedHtml += `<div class="analytics-tooltipHead">Safety</div>
                                <div class="analytics-tooltipBody" style="font-size: 13px;">
                                        <span class="boldfnt" style="float:none;">Definition</span> - 
                                        This section represents the impact on safety categories (e.g. rate of hospitalization, Adverse Reactions, Drug to Drug Interactions, Liver Failure, & Anemia ) as the difference between the 
                                        100% utilization of the best value drugs and current utilization management.
                                        <br><br>
                                    <span class="boldfnt">Formula</span><br>  
                                    (% of patients for Best Value Drugs - % of patients for Utilization Management)
                                <br> 
                                        </div>
                                        </div>
                                    </div></span>
                <div class="safetytitle_halfwidth" style="width:30%;font-size:12px;">
                    <span>RX%</span>
                    <div class="object_fullwidth"><div class="${impactsObj.safety_class}"></div><span>${impactsObj.safety}%</span></div>
                    </div>
            <div class="safetytitle_halfwidth" style="width:70%;font-size:12px;">
                    <span>Hospitalization%</span>
                    <div class="object_fullwidth"><div class="${impactsObj.safety_class_hosp}" ></div><span>${impactsObj.safety_hosp}%</span></div>
                    </div>
                </div>
                <div class="all_impact_box all_impact_${profCount}"> <span>Adherence
                            <div class="recommendedDrugInfo recommendedDrugInfo_abs">
                                        <div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox tooltip_not_filling">                                        
                                        <div class="analytics-tooltipHead">Adherence</div>
                                            <div class="analytics-tooltipBody" style="font-size: 13px;">
            <span class="boldfnt" style="float:none;">Definition</span> -
            The overall impact on adherence is determined as the difference of average adherence for all patients treated with 100% utilization of best 
            value drug and average adherence of patients treated with the current utilization management in each sub population.<br><br>
                    <span class="boldfnt">Formula</span>  <br>
                    (Avg. Adherence with Best Value Drugs - Avg. Adherence with Utilization Management)	
                <br>                                </div>
                                            </div>
                                        </div></span>
                    <div class="safetytitle_fullwidth">
                        <div class="sf_fixheight_width"></div>
                        <div class="object_fullwidth"><div class="${impactsObj.adherence_class}"></div><span>${impactsObj.adherence}%</span></div>
                    </div>    
                </div>
                <div class="all_impact_box all_impact_${profCount}"> <span>Cost
                <div class="recommendedDrugInfo recommendedDrugInfo_abs">`;
        if (profCount == 3)
            preparedHtml += `<div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox analytics-tooltip-right_zero tooltip_not_filling">`;
        else
            preparedHtml += `<div class="analytics-tooltip mlInfoTip_tooltip custmpopupbox tooltip_not_filling">`;
        preparedHtml += `<div class="analytics-tooltipHead">Cost</div>
                                            <div class="analytics-tooltipBody" style="font-size: 13px;">
            <span class="boldfnt" style="float:none;">Definition</span> -
            The overall impact on cost is determined as the difference of cost for all patients treated with 100% utilization 
            of best value drugs  and cost for  patients treated with the current utilization management in each sub population.

            <br><br>
                    <span class="boldfnt">Formula</span>
                    (Cost for Best Value Drugs - Cost for Utilization Management) / (Cost for Utilization Management)
                    <br>		
                <br> 
                                            </div>
                                            </div>
                                        </div></span>
                    <div class="safetytitle_fullwidth">
                        <div class="sf_fixheight_width"></div>
                        <div class="object_fullwidth"><div class="${impactsObj.cost_class}"></div><span>${impactsObj.cost}%</span></div>
                    </div>       
                </div>
                </div>
            
            </div>`;

        profCount++;
    }

    preparedHtml += `</div>`;

    setFiltersValue(filtersObj, tabName);

    $('.' + tabName + 'Recommendations-Lists').html(preparedHtml);
}



let getRecommendationsData = (baseAnalyticsData, tabName, preparedtabSPData) => {

    let categoryData = _.groupBy(baseAnalyticsData, 'category_id'),
        dataObj = {},
        tabSPData = preparedtabSPData ? preparedtabSPData : Session.get(tabName + 'Pat_SPListData'),
        rweTabSPData = payerUtils.getModifiedIMSDataLikeSPList(baseAnalyticsData);

    dataObj['profile1'] = {
        savings: getSavingsForProfile(categoryData, 1),
        qualityImpacts: getQualityImpactsChange(tabSPData, 1, tabName, [1], baseAnalyticsData),
        desc: getRecommendationDesc(1, rweTabSPData, tabName),
        Name: '100% Utilization of Best value Drug'
    };
    dataObj['profile2'] = {
        savings: getSavingsForProfile(categoryData, 2),
        qualityImpacts: getQualityImpactsChange(tabSPData, 2, tabName, [0.75, 0.25], baseAnalyticsData),
        desc: getRecommendationDesc(2, rweTabSPData, tabName),
        Name: '75% - 25% Utilization of Best value Drugs'
    };
    dataObj['profile3'] = {
        savings: getSavingsForProfile(categoryData, 3),
        qualityImpacts: getQualityImpactsChange(tabSPData, 3, tabName, [0.50, 0.25, 0.25], baseAnalyticsData),
        desc: getRecommendationDesc(3, rweTabSPData, tabName),
        Name: '50% - 25% - 25% Utilization of Best value Drugs'
    };

    return dataObj;

}

let getSavingsForProfile = (categoryData, drugConsiderationProf) => {
    let totalSavings = 0;

    for (let category in categoryData) {
        // let drugsData = categoryData[category];
        let clientDrugsData = payerUtils.getFilteredDataset(categoryData[category], true);
        let rweDrugsData = payerUtils.getFilteredDataset(categoryData[category], false);

        //Pram (11 Apr 17) : Added check for reccomendation filters
        if (clientDrugsData.length == 0) {
            continue;
        }

        clientDrugsData = clientDrugsData.sort((a, b) => {
            return a.value - b.value;
        });

        /**
         * @author : Yuvraj
         * date : 10th April 2017
         * modified the logic to get best value drug.
         */

        //Pram (25th June 17): if no drugs are in real world then make the client dataset for that subpopulation as the rwe dataset
        rweDrugsData = rweDrugsData.length ? rweDrugsData : clientDrugsData;

        // rweDrugsData = payerUtils.sortDataInDesc(rweDrugsData, 'value');
        rweDrugsData = payerUtils.SortByBestDrugsDecendingOrder(rweDrugsData, 'value');


        let totalDrugs = rweDrugsData.length,
            bestValSavings = 0,
            otherSavings = 0,
            profArr1 = [1],
            profArr2 = [0.75, 0.25],
            profArr3 = [0.50, 0.25, 0.25];

        //check for when drug count is less than drug consideration
        // let drugConsideration = totalDrugs < drugConsideration ? totalDrugs : drugConsideration;
        let drugConsideration = totalDrugs < drugConsiderationProf ? totalDrugs : drugConsiderationProf;

        let totalCatPatients = clientDrugsData[0]['total'],
            utiPopulations = 0;

        if (totalDrugs) {
            for (let i = 0; i < drugConsideration; i++) {
                let drugCost = rweDrugsData[i]['cost'];

                utiPopulations = Math.round(totalCatPatients * eval('profArr' + drugConsideration + '[' + (i) + ']'));

                bestValSavings += drugCost * utiPopulations;
            }

            for (let j = 0; j < clientDrugsData.length; j++) {
                otherSavings += clientDrugsData[j]['cost'] * clientDrugsData[j]['count'];
            }
        }

        totalSavings += otherSavings - bestValSavings;
    }

    return totalSavings;

}

let getRecommendationDesc = (drugCount, data, tabName) => {
    if (drugCount == 1) {

        return `<ul class="nav nav-tabs tabviewcustm">
                    <li class="active"><a data-toggle="tab" href="#profile1_1">100 % Utilization</a></li>
                </ul>
                <div class="tab-content">
                    <div id="profile1_1" class="tab-pane fade in active">
                        <p>${getTooltipbodyhtmlprofile(0, data,drugCount,tabName)}</p>
                    </div>
                </div>`;
    } else if (drugCount == 2) {

        return `<ul class="nav nav-tabs tabviewcustm">
                    <li class="active"><a data-toggle="tab" href="#profile2_1">75% Utilization</a></li>
                    <li><a data-toggle="tab" href="#profile2_2">25% Utilization</a></li>
                </ul>
                <div class="tab-content">
                    <div id="profile2_1" class="tab-pane fade in active">
                        <p>${getTooltipbodyhtmlprofile(0, data,drugCount,tabName)}</p>
                    </div>
                    <div id="profile2_2" class="tab-pane fade">
                        <p>${getTooltipbodyhtmlprofile(1, data,drugCount,tabName)}</p>
                    </div>    
                </div>`;

    } else {

        return `<ul class="nav nav-tabs tabviewcustm">
                    <li class="active"><a data-toggle="tab" href="#profile3_1">50% Utilization</a></li>
                    <li><a data-toggle="tab" href="#profile3_2">25% Utilization</a></li>
                    <li><a data-toggle="tab" href="#profile3_3">25% Utilization</a></li>
                </ul>
                <div class="tab-content">
                    <div id= "profile3_1" class="tab-pane fade in active">
                        <p>${getTooltipbodyhtmlprofile(0, data,drugCount,tabName)}</p>
                    </div>     
                    <div id="profile3_2" class="tab-pane fade">
                        <p>${getTooltipbodyhtmlprofile(1, data,drugCount,tabName)}</p>
                    </div>
                    <div id="profile3_3" class="tab-pane fade">
                        <p>${getTooltipbodyhtmlprofile(2, data,drugCount,tabName)}</p>
                    </div>
                </div>`;
    }
}

function getTooltipbodyhtmlprofile(tooltipcount, drugsdata, drugCount, tabName) {
    if (drugsdata.length) {
        let html = '';
        for (let i = 0; i < drugsdata.length && i < 1; i++) {
            let cat_name = drugsdata[i].category_name;
            if (i == 0) {
                html += '<div class="recommnedation_medication_list" id="' + tabName + drugCount + '_expand_recommendation">';
                html += '<div class="profdesc_title">Sub Population: </div><div class="profdesc_desc">' + cat_name + '</div>';
                if (drugsdata[i].data[tooltipcount] != undefined) {
                    html += '<div class="profdesc_title">Drug Name :</div><div class="profdesc_desc"> ' + drugsdata[i].data[tooltipcount].medication +
                        '</div><div class="profdesc_title">Cost : </div><div class="profdesc_desc">$ ' + commaSeperatedNumber(drugsdata[i].data[tooltipcount].cost) + '</div>';
                }

                html += '</div>';
            }
        }
        if (drugsdata.length > 1) {
            html += '<div id = "' + tabName + drugCount + '" class="reccProfile-moreSpSection">';
            for (let i = 1; i < drugsdata.length; i++) {
                let cat_name = drugsdata[i].category_name;
                html += '<div class="recommnedation_medication_list">';
                html += '<div class="profdesc_title">Sub Population: </div><div class="profdesc_desc">' + cat_name + '</div>';
                if (drugsdata[i].data[tooltipcount] != undefined) {
                    html += '<div class="profdesc_title">Drug Name :</div><div class="profdesc_desc"> ' + drugsdata[i].data[tooltipcount].medication +
                        '</div><div class="profdesc_title">Cost : </div><div class="profdesc_desc">$ ' + commaSeperatedNumber(drugsdata[i].data[tooltipcount].cost) + '</div>';
                }
                html += '</div>';

            }

            html += '</div>';
        }

        return html;
    }
}

let getQualityImpactsChange = (unoptimizedData, drugConsiderationProf, tabName, profileArr, tabData) => {
    // Modified By Yuvraj & Pram 25th June 2017
    // let categories_len = unoptimizedData.length;
    var categories = _.pluck(unoptimizedData,"category_name");
    
    //var reactive_var = 'uniTreatedQualityIndicators';
    let diffData = [];

    //sort both optimized & unoptimized data 
    unoptimizedData.sort(function(a, b) {
        return a['count'] - b['count'];
    });

    let rweDataset = payerUtils.getModifiedIMSDataLikeSPList(tabData);

    rweDataset.sort(function(a, b) {
        return a['count'] - b['count'];
    });

    // console.log('safety recommne',tabName);
    var safety_data = renderUniverseSafetyIndicatorsProfile(tabName, true, drugConsiderationProf, profileArr, tabData);
    // console.log(safety_data);
    //calculations for pre optimization 
    var unopt_bestAdh = [],
        unopt_bestCost = [],
        unopt_bestEff = [],
        unopt_Ahd = [],
        unopt_Eff = [],
        unopt_Cost = [];

    let profArr1 = [1],
        profArr2 = [0.75, 0.25],
        profArr3 = [0.50, 0.25, 0.25];

    for (let i = 0; i < categories.length; i++) {
        // let drugData = unoptimizedData[i]['data'];
        let temp = _.where(unoptimizedData, {category_name:categories[i]})[0];
        var drugData =  temp['data'];

        // let categoryPatients = unoptimizedData[i]['count'];
        var categoryPatients =  temp['count'];

        //Pram (21st Mar 17): if no drugs are in real world then make the client dataset for that subpopulation as the rwe dataset
        // Modified By Yuvraj & Pram 25th June 2017
        // let rweDataDrugs = rweDataset[i] ? rweDataset[i]['data'] : drugData;
        let temp2 = _.where(rweDataset, {category_name:categories[i]})[0];
        let rweDataDrugs = temp2 ? temp2['data'] : drugData;

        //let rweDataDrugs = rweDataset[i]['data'];

        //sort the drug data on the value score
        drugData.sort(function(a, b) {
            return b['value'] - a['value'];
        });

        rweDataDrugs.sort(function(a, b) {
            return b['value'] - a['value'];
        });

        // drugConsideration = rweDataDrugs.length < drugConsideration ? rweDataDrugs.length : drugConsideration;
        let drugConsideration = rweDataDrugs.length < drugConsiderationProf ? rweDataDrugs.length : drugConsiderationProf;

        for (let i = 0; i < drugConsideration; i++) {
            let utiPopulations = Math.round(categoryPatients * eval('profArr' + drugConsideration + '[' + i + ']'));
            unopt_bestAdh.push(rweDataDrugs[i]['adherence']);
            unopt_bestEff.push(rweDataDrugs[i]['efficacy']);
            unopt_bestCost.push(rweDataDrugs[i]['cost'] * utiPopulations);
        }

        let costs = eff = adh = 0;
        for (let j = 0; j < drugData.length; j++) {
            costs += drugData[j]['cost'] * drugData[j]['count'];
            eff += isNaN(drugData[j]['efficacy']) ? 0 : (drugData[j]['efficacy'] * drugData[j]['count']);
            adh += drugData[j]['adherence'] * drugData[j]['count'];
        }

        //push the sum of the values for each category
        unopt_Ahd.push(adh / categoryPatients);
        unopt_Eff.push(eff / categoryPatients);
        unopt_Cost.push(costs);
    }

    //find the difference for the computation
    var finalJson = {};

    var diff_Adh = parseFloat(unopt_bestAdh.average() - unopt_Ahd.average()).toFixed(2),
        diff_Eff = parseFloat(unopt_bestEff.average() - unopt_Eff.average()).toFixed(2),
        diff_Cost = parseFloat(((unopt_bestCost.sum() - unopt_Cost.sum()) * 100) / unopt_Cost.sum()).toFixed(2);

    //input the data to display
    finalJson['adherence'] = diff_Adh < 0 ? Math.abs(diff_Adh) : diff_Adh;
    finalJson['efficacy'] = diff_Eff < 0 ? Math.abs(diff_Eff) : diff_Eff;
    finalJson['cost'] = diff_Cost < 0 ? Math.abs(diff_Cost) : diff_Cost;
    finalJson['safety'] = safety_data == undefined ? 0 : safety_data['rx'][0]['value'];
    finalJson['safety_hosp'] = safety_data == undefined ? 0 : safety_data['hosp'][0]['value'];
    //define class for the indicators
    finalJson['adherence_class'] = Math.round(diff_Adh) == 0 ? '' : (diff_Adh < 0 ? 'decreased' : 'increased');
    finalJson['efficacy_class'] = Math.round(diff_Eff) == 0 ? '' : (diff_Eff < 0 ? 'decreased' : 'increased');
    finalJson['cost_class'] = Math.round(diff_Cost) == 0 ? '' : (diff_Cost < 0 ? 'decreased' : 'increased');

    if (safety_data) {
        finalJson['safety_class'] = Math.round(safety_data['rx'][0]['value']) == 0 ? '' : safety_data['rx'][0]['affected'].toLowerCase();
        finalJson['safety_class_hosp'] = Math.round(safety_data['hosp'][0]['value']) == 0 ? '' : safety_data['hosp'][0]['affected'].toLowerCase();
        finalJson['affected_safety'] = Math.round(safety_data['rx'][0]['value']) == 0 ? '' : safety_data['rx'][0]['affected'].toLowerCase();
        finalJson['affected_safety_hosp'] = Math.round(safety_data['hosp'][0]['value']) == 0 ? '' : safety_data['hosp'][0]['affected'].toLowerCase();
    } else {
        finalJson['safety_class'] = '';
        finalJson['safety_class_hosp'] = '';
        finalJson['affected_safety'] = '';
        finalJson['affected_safety_hosp'] = '';
    }

    //define the value is increased/decresed
    finalJson['affected_adherence'] = Math.round(diff_Adh) == 0 ? '' : (diff_Adh < 0 ? 'Decreased' : 'Increased');
    finalJson['affected_efficacy'] = Math.round(diff_Eff) == 0 ? '' : (diff_Eff < 0 ? 'Decreased' : 'Increased');
    finalJson['affected_cost'] = Math.round(diff_Cost) == 0 ? '' : (diff_Cost < 0 ? 'Decreased' : 'Increased');

    // console.log('************FINAL JSON FOR OBJECT************');
    // console.log(finalJson);

    return finalJson;
}

function setFiltersValue(filtersObj, tabName) {
    let cirrhosisType = filtersObj.cirrhosis.length > 1 ? 'Both' : filtersObj.cirrhosis[0],
        treatmentType = filtersObj.treatment.length > 1 ? 'Both' : filtersObj.treatment[0],
        genotype = filtersObj.genotypes.length > 1 ? filtersObj.genotypes.join(',') : filtersObj.genotypes[0];

    $('#' + tabName + 'RecommendationsPopup .recommendationsTitle-Filters .rec-Genotype').html(genotype);
    $('#' + tabName + 'RecommendationsPopup .recommendationsTitle-Filters .rec-Cirrhosis').html(cirrhosisType);
    $('#' + tabName + 'RecommendationsPopup .recommendationsTitle-Filters .rec-Treatment').html(treatmentType);
}

/**
 * Prepare table representation for Rx and Hospitalized data 
    // {
    //     adverse_reactions:JSON.parse(DrugsData[i]['adverse_reactions']),
    // hospitalizationData:hospitalizationData,
    // rxCostData:rxCostData,
    // TotalN:DrugsData[i]['TotalN'],
    // TotalAdditionalCost:totalAdditionalCost
    // }

 */
function prepareTableDataForHospitalizationAndRxCost({ adverse_reactions, hospitalizationData, rxCostData, TotalN, TotalAdditionalCost }) {

    let finalContainer;
    let tblHeader = `<table class='subPopulation-hosp-rx-tbl spSafetyPopoverData'>
    <tr class='spSafetyTH'><td class='spSafetyTHColumn'>Hospitalized Condition</td><td class='spSafetyTHColumn'>Patient Count</td> <td class='spSafetyTHColumn'>Rx Cost ($)</td></tr>
    <tbody class='spSafetyTB'>`;
    let tblData = '';
    let tblFooter = '';
    let hospitalizedCount = 0;
    let totalRxCost = 0;
    // For Future use
    // tblData+= `<tr><td>${}</td><td>${}</td><td>${}</td></tr>`
    if (hospitalizationData && hospitalizationData.length > 0) {

        for (let i = 0; i < hospitalizationData.length; i++) {
            tblData += `<tr class='spSafetyRow'><td class='spSafetyTbColumn'>${hospitalizationData[i].name.split('_').join(' ')}</td><td class='spSafetyTbColumn'>${hospitalizationData[i].count}</td><td class='spSafetyTbColumn'>${commaSeperatedNumber(parseFloat(rxCostData[i].cost).toFixed(2))}</td></tr>`;
            hospitalizedCount += hospitalizationData[i].count;
            totalRxCost += rxCostData[i].cost;
        }
        totalRxCost = parseFloat(totalRxCost).toFixed(2);
        tblFooter = `<tr class='spSafetyTF'><td class='spSafetyTfColumn'>Total</td><td class='spSafetyTfColumn'>${hospitalizedCount}</td><td class='spSafetyTfColumn'>${commaSeperatedNumber(totalRxCost)}</td></tr>`;
        finalContainer = tblHeader + tblData + tblFooter + '<tbody></table>';
    } else {
        tblData = `<tr><td colspan='3' style='text-align:center'> No records available</td></tr>`;
        finalContainer = tblHeader + tblData + '<tbody></table>';
    }

    //     tblData += `<tr><td>Syndrom 1</td><td> 10</td><td>20</td></tr>
    // <tr><td>Syndrom 1</td><td> 10</td><td>20</td></tr>
    // <tr><td>Syndrom 1</td><td> 10</td><td>20</td></tr>
    // <tr><td>Syndrom 1</td><td> 10</td><td>20</td></tr>
    // <tr><td>Syndrom 1</td><td> 10</td><td>20</td></tr>`;
    //  console.log(tblData);


    // <div class="spSafetyTF">
    //                     <div class="spSafetyTfColumn"> Total </div>
    //                     <div class="spSafetyTfColumn"> 26 </div>
    //                     <div class="spSafetyTfColumn"> $21,264 </div>
    //                 </div>
    // console.log(finalContainer);
    return finalContainer;

}


















function preapareExpenseChartObject(isOptimized, bestVaueExpense, projectedExpenses, optimizedExpenses) {
    if (isOptimized) {
        return {
            "expenses": [{
                "key": "bestValue",
                "displayLabel": "100% Utilization of Best Value Drug",
                "expenses": bestVaueExpense,
                "icon": "best-value-white"
            }, {
                "key": "projected",
                "displayLabel": "Projected Expenses",
                "expenses": projectedExpenses,
                "icon": "average_value-white"
            }, {
                "key": "optimized",
                "displayLabel": "Optimized Expenses",
                "expenses": optimizedExpenses,
                "icon": "average_value-white"
            }],
            "optimized": true
        };
    } else {
        return {
            "expenses": [{
                "key": "bestValue",
                "displayLabel": "100% Utilization of Best Value Drug",
                "expenses": bestVaueExpense,
                "icon": "best-value-white"
            }, {
                "key": "projected",
                "displayLabel": "Projected Expenses",
                "expenses": projectedExpenses,
                "icon": "average_value-white"
            }],
            "optimized": false
        };
    }

}


function prepareFinalDrugsTableStructure(tabName, innerHTML, ims_innerHTML) {
    let html = `<div class="tab">
                <div class="tablinks btn subPopulationCommonTabBtn activeSubpopulationTab" title="Customize Drug Cost and Utilization" onclick="openInnerContent(event, 'client_${tabName}')">Customer</div>
                <div class="tablinks btn subPopulationCommonTabBtn" title="View RWE Drugs" onclick="openInnerContent(event, 'ims_${tabName}')">Real World Evidence</div>
                <div class="" style="padding-top: 7px;float: right;">
                    <div class="" style="float: left; margin: 4px;">
                        <span style="background:#f04823;width:10px;height:10px;border-radius:50%; display:block;"></span>
                    </div>
                    <div class="spTableDrugName">Customer</div>
                    <div class="" style="float: left; margin: 4px;">
                        <span style="background:#ddd;width:10px;height:10px;border-radius:50%; display:block;"></span>
                    </div>
                    <div class="spTableDrugName" >Real World Evidence</div>
                    <div id="${tabName}drugComparisionChart" class="dccContainer">
                        <div class="drugComparisonIcon"></div>
                        <div class="drugComparisonSection">Adverse Reactions
                            <div class="comparisonChartBody"></div>
                        </div>
                    </div> 
                </div>
            </div>

            <div id="client_${tabName}" class="tabcontent">
                ${innerHTML}
            </div>

            <div id="ims_${tabName}" class="tabcontent" style="display: none">
                ${ims_innerHTML}
            </div>`;

    return html;
}

function appendDrugsTableInContainer(tabName, html) {
    $('.' + tabName + 'DrugInfoTableBody').html(html);
}


function appendDrugsDataInResetIcon(tabName, DrugsData) {
    $('#' + tabName + 'utilizationReset').attr('data', JSON.stringify(DrugsData));
    $('#' + tabName + 'utilizationReset').css('visibility', 'hidden');
    $('#' + tabName + 'resetUtilization').css('visibility', 'hidden');

}


function bindUtilizationLockUnlockEvent() {
    // Utilization Slider Lock and Unlock event.
    $('.drugTablelockunlock').click(function() {
        if ($(this).hasClass('lock')) {
            $(this).removeClass('lock');
            $(this).addClass('unlock');
            var temp = $($(this).siblings('.slider'));
            temp.slider('option', 'disabled', false);
        } else {
            $(this).removeClass('unlock');
            $(this).addClass('lock');
            var temp = $($(this).siblings('.slider'));
            temp.slider('option', 'disabled', true);
            //temp.slider("option", "max", temp.slider("option", "value"));
        }
    });
}

function bindClinicalTrailSectionOpenEvent() {
    // Clinical Trial Section Popup open Event
    $('.js-spClinicalTrialsSectionIcon').click(function(e) {
        $('.spClinicalTrialSectionContainer').css('display', 'none');
        $(document).mouseup(function(e) {
            var container = $(".spClinicalTrialSectionContainer");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                container.hide();
            }
        });
        $(e.currentTarget).next('.spClinicalTrialSectionContainer').css('display', 'block');
        setTimeout(function() {
            //$('#'+parentContainer+'.topRiskSection').trigger('click');
            $('.topRiskSection').trigger('click');
        }, 100);
    });
}

function bindClinicalTrailSectionCloseEvent() {
    // Close Event for Clinical Trial Section.
    $('.js-CloseSpClinicalTrialsSection').click(function(e) {
        $(e.currentTarget).parent().parent().parent('.spClinicalTrialSectionContainer').css('display', 'none');
    });
}

function bindUtilizationSlideEvent(tabName) {
    var sliders = $("." + tabName + "Utilization div.sliders .slider");


    sliders.each(function() {
        var value = 0,
            availableTotal = 100;

        // Yurvaj - 20th march
        var data = JSON.parse($(this).attr('data'));
        var onePatientUtilization = parseFloat((100 / data['TotalN']).toFixed(2));
        console.log($(this).siblings('.value').text());
        $(this).empty().slider({
            value: parseFloat($(this).siblings('.value').text()),
            min: 0,
            max: parseFloat($(this).siblings('.value').text()),
            range: "min",
            step: onePatientUtilization,
            animate: 100,
            slide: function(event, ui) {

                // Update display to current value
                $('#' + tabName + 'utilizationReset').css('visibility', 'visible');
                $('#' + tabName + 'resetUtilization').css('visibility', 'visible');

                // //update model modified variable
                // Session.set(tabName.replace(/\d+/g, '') + '_isCurrentModelModified', true);
                $(this).siblings('.value').text(ui.value);
                $(this).siblings('.drugTablelockunlock').removeClass('lockhide');
                $(this).siblings('.drugTablelockunlock').addClass('lockshow');

                // Yurvaj - 20th march
                let patientsByUtilization = (1 / onePatientUtilization) * ui.value
                    // $(this).siblings('.totalPatientsValue').text(Math.round(ui.value * oneN));
                $(this).siblings('.totalPatientsValue').text(Math.round(patientsByUtilization));

                // Get current total
                var total = 0;

                sliders.not(this).each(function() {
                    total += $(this).slider("option", "value");
                });

                // Need to do this because apparently jQ UI
                // does not update value until this event completes
                total += ui.value;
                console.log("**UTI-TOTAL**" + total);
                if (total > 100) {
                    console.log(total);
                    console.log('percentage can not be greater than 100');
                    // $(this).siblings('.slider').slider("option","off",true);
                    // sAlert.error('percentage can not be greater than 100',{timeout: 10000,onClose: function() {},effect: 'bouncyflip', html: true});
                }

                //total = total>100?100:total;
                var max = availableTotal - total;
                //$(this).slider("option", "max", max + ui.value)
                // Update each slider

                sliders.not(this).each(function() {
                    var t = $(this),
                        value = parseFloat(t.slider("option", "value"));
                    // Yurvaj - 20th march
                    let patientsByUtilization = parseFloat((1 / onePatientUtilization) * value).toFixed(2);
                    if (t.siblings('.drugTablelockunlock').hasClass('unlock')) {
                        t.slider("option", "max", max + value)

                    }
                    t.siblings('.value').text(value);
                    // t.siblings('.totalPatientsValue').text(Math.round(value * oneN));
                    t.siblings('.totalPatientsValue').text(Math.round(patientsByUtilization));
                    t.slider('value', parseFloat(value.toFixed(2)));
                });

                moveSliderCalculateExpanses(tabName, event, ui, this, 'utilization');
            }
        }); // Slide Event End


    }); // Each loop End
}






function getBestValueScore(imsDataSet) {
    console.log("Best Value data in subpopulation.");
    console.log(imsDataSet);
    // let drugsData = sortDataInDesc(imsDataSet, 'TotalDisplayValue');

    let drugsData = SortSPByBestDrugsDecendingOrder(imsDataSet, 'TotalDisplayValue');
    return drugsData[0];
}

let sortDataInDesc = (dataArray, value) => {
    let data = _.sortBy(dataArray, value);
    return data.reverse();
}

/**
 * @author: Pramveer
 * @date: 16th Mar 17
 * @desc: function to get raw rwe data for a particular category
 */

let getSubpopulationRWEDataForSPTable = (tabName) => {
    let category_id = parseInt(tabName.replace(/[^\d.]/g, ''));

    //Pram (14 Apr 17) : Apply the universe weights to the data object
    let baseDataset = payerUtils.applyUniverseWeightsOnBaseObject(TreatedAnalyticsData);

    let rweRawData = payerUtils.getFilteredDataset(baseDataset, false);

    rweRawData = _.filter(rweRawData, (rec) => {
        return rec.category_id == category_id;
    });

    let finalData = Template.TreatedPatients.__helpers.get('DrugsData')(rweRawData, category_id);
    // console.log('****************SP IMS DATA*****************');
    // console.log(finalData);
    return finalData;

}


/**
 * @author: Pramveer
 * @date: 16th Mar 17
 * @desc: refine the dataobjects for rwe to make it 0
 */
export let refineTheRWEUtilization = (baseDataObj) => {
    //extend the object so that it doesn't effect the original one
    //let rawDataSet = jQuery.extend(true, {}, baseDataObj);
    let rawDataSet = baseDataObj;

    //group raw data based on druh type
    let grpData = _.groupBy(rawDataSet, 'isImsDrug');

    for (let keys in rawDataSet) {
        let currDrug = rawDataSet[keys];
        if (currDrug.isImsDrug) {
            //make the rwe total to equal to client total
            currDrug.total = grpData[0][0].total;
            currDrug.utilization = 0;
            currDrug.unique_total = 0;
            currDrug.count = 0;
        }
    }

    return rawDataSet;

}

let getRealExpenseDataForDrug = (drugObj, tabName) => {
    let filterObj = {
        category_id: parseInt(tabName.replace(/[^\d.]/g, '')),
        isImsDrug: 0,
        medication: drugObj.DrugName.replace(/\s*\(.*?\)\s*/g, ''), //replace the content between ()
        treatment_period: parseInt(drugObj.DrugName.replace(/[^\d.]/g, ''))
    };

    //Pram (14 Apr 17) : Apply the universe weights to the object
    let baseDataset = payerUtils.applyUniverseWeightsOnBaseObject(TreatedAnalyticsData);

    let filteredData = _.where(baseDataset, filterObj);
    //todo
    return filteredData.length ? (filteredData[0].cost * filteredData[0].count) : 0;
}

/**
 * @author: Pramveer
 * @date: 21st Mar 17
 * @desc: function to provide unique id to each drug
 */
let getUniqueIdForDrug = (isRweDrug, drugName) => {
    let uniqueDrugId = drugName + '_' + 'isClientDrug';

    if (isRweDrug == 1) {
        uniqueDrugId = drugName + '_' + 'notClientDrug';
    }

    return uniqueDrugId;
}

/**
 * @author: pramveer
 * @date: March 28th,2017
 * @desc: This function shows best value drug in front of drug name having highest value score,and recommended
 *        drug in front of drug having highest value score from imsDataSet.  
 */
let setBestValueAndRecommendedDrug = (bvDrug, tabName, hideRweReccDrug) => {

    // let rweData = _.where(drugsData, { isImsDrug: 1 });
    // rweData = _.sortBy(rweData, 'TotalDisplayValue').reverse();
    // let bestValueRwe = rweData[0];

    // let bvDrug = _.sortBy(drugsData, 'TotalDisplayValue').reverse();
    // let bestValueDrug = bvDrug[0];

    //Pram(4 Apr 17): Check if no rwe drug then make the Customer drug for rwe best value 
    // bestValueRwe = bestValueRwe ? bestValueRwe : bestValueDrug;

    // let uniqueDrugIdRwe = bestValueRwe.uniqueDrugId.replace(/\W/g, '');
    let uniqueDrugIdRwe = bvDrug.uniqueDrugId.replace(/\W/g, '');

    // let bestValueDrugId = bestValueDrug.uniqueDrugId.replace(/\W/g, '');

    //$('#' + tabName + 'parentValueScoreDiv_' + bestValueDrugId + '_BVDrug').show();

    //Pram  (17 Apr 17) : Show reccomended drug only on first load of the drug list table
    if (!hideRweReccDrug) {
        $('#' + tabName + 'parentValueScoreDiv_' + uniqueDrugIdRwe + '_ReccDrug').show();
    }

}




/**
 * @author: Yuvraj Pal
 * @desc: this function will return the dataset in the ecending order of the besrt value drug. 
 * The best value dug is been choosen by comparing the treatment period and cost. 
 * @date : 7th April, 2017
 */

export let SortSPByBestDrugsDecendingOrder = (dataArray, value) => {
    // accending order.
    //let data = _.sortBy(dataArray, value);

    // let data = dataArray.sort(function(a, b) {
    //     return parseFloat(b[value]) > parseFloat(a[value]);
    // });

    //Pram (17 Apr 17) : Sorted on new value score key
    let data = _.sortBy(dataArray, 'TotalActualValue').reverse();


    // decending order
    // data = data.reverse();

    // get best value drug.
    let bestValuesDrug = data[0];

    //  get score of the best value drug.
    let bestValueScore = bestValuesDrug['TotalActualValue'];

    // find out all the drugs where value score is equal to "bestValueScore"
    let bestValueScoreDrugs = _.where(data, { 'TotalActualValue': bestValueScore });

    if (bestValueScoreDrugs.length > 1) {
        // there is more than one drug with the bestValueScore.

        let finalArray = [];

        // find not_best_value_drugs;
        let notBestValueDrugs = data.filter(function(drug) {
            return drug['TotalActualValue'] != bestValueScore;
        });

        // sort the bestValueDrugs in the order of priority.
        let bestDrugsByPriority = findSPBestDrugsByPriority(bestValueScoreDrugs);

        // push Best Drugs into final array.
        for (let i = 0; i < bestDrugsByPriority.length; i++) {
            finalArray.push(bestDrugsByPriority[i]);
        }

        // sort NotBestValueDrugs in reverse order of the value scores again.
        // accending order.
        // notBestValueDrugs = _.sortBy(notBestValueDrugs, value);
        // decending order
        // notBestValueDrugs = data.reverse();

        notBestValueDrugs = notBestValueDrugs.sort(function(a, b) {
            return parseFloat(b[value]) > parseFloat(a[value]);
        });

        // push Best Drugs into final array.
        for (let i = 0; i < notBestValueDrugs.length; i++) {
            finalArray.push(notBestValueDrugs[i]);
        }

        return finalArray;

    } else {
        // there is other drugs with the same value score.
        return data;
    }

}


// this function sort the drugs with best value score in order of priority.
function findSPBestDrugsByPriority(bestValueDrugs) {
    let finalBestValueDrugs = [];

    let bestDrug = '';

    // find drug with minimum treatment period.
    // sort by accending order of treatment period
    bestValueDrugs = bestValueDrugs.sort(function(a, b) {
        return a.TreatmentPeriod > b.TreatmentPeriod;
    });
    // get minimum treatment period
    let minimumTreatmentDrug = bestValueDrugs[0];
    // find Minimum treatment period
    let minimumTreatmentPeriod = minimumTreatmentDrug.TreatmentPeriod;

    // find out if there are more drugs with minimum treatment period.
    let drugsWithMinTreatment = _.where(bestValueDrugs, { 'TreatmentPeriod': minimumTreatmentPeriod });

    // if there are more than one drug with the minimum treatment period.
    if (drugsWithMinTreatment.length > 1) {

        // find out drug with minimum cost out of the above drugs.
        // sort by accending order of cost
        drugsWithMinTreatment = drugsWithMinTreatment.sort(function(a, b) {
            return a.Cost.TotalCost > b.Cost.TotalCost;
        });
        // get minimum cost
        let minimumCostDrug = drugsWithMinTreatment[0];
        // find Minimum treatment period
        let minimumCost = minimumCostDrug.Cost.TotalCost;
        // find out if there are more drugs with minimum Cost.
        //let drugsWithMinCost = _.where(drugsWithMinTreatment, { 'TreatmentPeriod': minimumCost });

        let drugsWithMinCost = _.filter(drugsWithMinTreatment, (rec) => {
            return rec.Cost.TotalCost == minimumCost;
        });


        // if there is more than one drug with same cost.
        if (drugsWithMinCost.length > 1) {

            // find out drug with the max efficacy.
            // sort by decending order of efficacy.
            drugsWithMinCost = drugsWithMinCost.sort(function(a, b) {
                return a.Efficacy.Efficacy < b.Efficacy.Efficacy;
            });
            // get maximum Efficacy
            let maxEfficacyDrug = drugsWithMinCost[0];
            // find maximum Efficacy
            let maxEfficacy = maxEfficacyDrug.Efficacy.Efficacy;
            // find out if there are more drugs with maximum Efficacy.
            //let drugsWithMaxEfficacy = _.where(drugsWithMinCost, { 'Efficacy.Efficacy': maxEfficacy });

            let drugsWithMaxEfficacy = _.filter(drugsWithMinCost, (rec) => {
                return rec.Efficacy.Efficacy == maxEfficacy;
            });

            // if there are more than one drug with same efficacy then.
            if (drugsWithMaxEfficacy.length > 1) {
                // find out drug with best adherence.
                // sort by decending order of Adherence.
                drugsWithMaxEfficacy = drugsWithMaxEfficacy.sort(function(a, b) {
                    return a.Adherence.Adherence < b.Adherence.Adherence;
                });
                // get maximum Adherence
                let maxAdherenceDrug = drugsWithMaxEfficacy[0];

                // just consier the maxAdherenceDrug
                bestDrug = maxAdherenceDrug;

            } else {
                bestDrug = drugsWithMaxEfficacy;
            }

        } else {
            bestDrug = drugsWithMinCost;
        }

    } else {
        bestDrug = drugsWithMinTreatment;
    }


    finalBestValueDrugs.push(bestDrug);

    // remove best drug from the bestValueDrugs array.
    bestValueDrugs = _.filter(bestValueDrugs, function(drug) {

        if (drug.DrugName != bestDrug[0].DrugName) {
            return true;
        } else if (drug.TreatmentPeriod != bestDrug[0].TreatmentPeriod) {
            return true;
        } else {
            return false;
        }

        // return ((drug.DrugName != bestDrug[0].DrugName) && (drug.TreatmentPeriod != bestDrug[0].TreatmentPeriod))
    });

    // Add other bestValueDrugs into finalBestValueDrugs
    for (let i = 0; i < bestValueDrugs.length; i++) {
        finalBestValueDrugs.push(bestValueDrugs[i]);
    }


    return _.flatten(finalBestValueDrugs);

}

/**
 * @author: Pramveer
 * @date: 19th Apr 17
 * @desc: function to check whether sub population is optimized or not
 */
let isCategoryOptimized = (categoryName, optimizedVariable) => {
    let checkObj = optimizedVariable.Adherence.data;

    let data = _.where(checkObj, { cetagoryName: categoryName });

    return data.length > 0 ? true : false;
}

/**
 * @author: Pramveer
 * @date: 19th Apr 17
 * @desc: function to remove the object from the array
 */
let removeUnOptSubPopulation = (initialData, removalData) => {
    //return the initial data if the objects to be removed is 0
    if (removalData.length == 0) {
        return initialData;
    }

    //remove the unoptimized sub population based on the category name
    let finalData = payerUtils.removeObjectsFromArray(initialData, removalData, 'cetagoryName');

    return finalData;
}