/*
 *   This function Create a horizontal bar chart in the subpopulatio quality indicator.
 *   We pass it  data to create the chart. and also theid of the container where we want to render the chart.
 */

createSubpopulationSafetyIndicatorChart = function(container, chartData, tabName) {

    //This is how the Looks like when we pass it to the function
    /*var data = [
					{
						"drugs" : "Harvoni (12W)",
						"hospitalization" : 15,
						"cost" : 1500
					},
					{
						"drugs" : "Daklinza + Sovaldi (12W)",
						"hospitalization" : 9,
						"cost" : 900
					},
					{
						"drugs" : "Harvoni + Ribavirin (12W)",
						"hospitalization" : 16,
						"cost" : 1800
					}
				];

	data.sort( function(a, b){
		return b.hospitalization - a.hospitalization;
	}); */

    var bestValueData = chartData['bestValueData']['Safety'],
        optimizedData = chartData['optimaizeData'] ? chartData['optimaizeData']['Safety'] : [];
    //prepareDataDrugComparisonChart(tabName,optimizedData);
    var data = [];
    var compdata = [];
    var groupscomp = [];
    for (var i = 0; i < bestValueData.length; i++) {
        /**
         * @author: Yuvraj
         * @date: 21st march 2017
         * @desc: drugs having utilization more than zero will only be shown in safety popver now.  
        */
        if(bestValueData[i]['drugCount'] > 0) {
            var json = {};
            var compjson = {};
            var reactions = bestValueData[i]['drugReactions'],
                unoptDrugN = bestValueData[i]['drugCount'],
                unoptDrugCost = bestValueData[i]['drugCost'],
                optDrugN = optimizedData[i]['drugCount'],
                optDrugCost = optimizedData[i]['drugCost'];

            var changedData = getCostCountForReactions(reactions, unoptDrugN, unoptDrugCost, optDrugN, optDrugCost);
            var totalPatAdv = 0;
            var rec = JSON.parse(reactions);
            for (key in rec) {
                totalPatAdv += rec[key].count;
            }

            var perAdv = 0;
            if(totalPatAdv != 0){
                perAdv = parseFloat((changedData.count / totalPatAdv) * 100).toFixed(2);
            }
            
            var tempjson = {};
            for (key in rec) {
                tempjson[key] = Math.round(rec[key].count * perAdv * 0.01);
                if (tempjson[key] != 0) {
                    groupscomp.push(key);
                }
            }

            let count_reactions = 0;
            for(var key in rec) {
                if(rec[key].count > 0)
                 count_reactions++;
            }

            tempjson['count_p'] = changedData.count;
            tempjson['drugName'] = bestValueData[i]['drugName'];
            compdata.push(tempjson);

            json['drugs'] = bestValueData[i]['drugName'];
            json['hospitalization'] = changedData.count;
            json['adverseReactions'] = count_reactions;
            json['cost'] = changedData.cost;
            //Pram(20th Mar 17) : added key for safety data
            json['safetyData'] = bestValueData[i]['drugSafetyData'];
            data.push(json);
        }
        
    }
    var groups1 = $.unique(groupscomp);
    var drugComparisionChartContainer = tabName + 'drugComparisionChart';
    container1 = '#' + drugComparisionChartContainer + ' .comparisonChartBody';
    compdata.sort(function(a, b) {
        return a['count_p'] - b['count_p'];
    });
    renderDrugComparisionChart('#' + tabName + 'drugComparisionChart' + ' .comparisonChartBody', { chartData: compdata, groups: groups1 });
    $('#' + drugComparisionChartContainer).popover('hide');
    $('#' + drugComparisionChartContainer).popover({
        //container: 'body',
        content: function() {
            return $(container1).html();
        },
        placement: 'left',
        html: true,
        title: 'Drugs Comparision -<span>&nbsp;(Sorted by Safe Drugs)&nbsp;</span><i class=\'fa fa-times pull-right popoverTogle\' onclick=\'$(&quot;#' + drugComparisionChartContainer + '&quot;).popover(&quot;hide&quot;);\'></i>'
    }).click(function(e) {
        e.preventDefault();
        var realDrugsData = JSON.parse($(e.currentTarget).attr('data'));
        var temp = $(e.currentTarget).siblings('.popover').children('.popover-content');
        var popoverEle = $(e.currentTarget).siblings('.popover');
        $(temp).addClass('svgContent');
        $(temp).addClass('drugComparisonSVGWrapper');

        var comparisonChartData = { chartData: compdata, groups: groups1 }; //prepareDrugComparisonChartData(realDrugsData);

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
            $(popoverEle).css({ 'top': '-22px', 'left': '690px', 'max-width': '400px' });
        } else {
            renderDrugComparisionChart('.svgContent', comparisonChartData);
            $(popoverEle).css({ 'top': '-190px', 'left': '230px', 'max-width': '850px' });
            $(temp).css({ 'max-height': ($(temp).height() + 50) + 'px', 'width': ($('.svgContent').width() + 140) + 'px' });
            $(temp).css({ 'max-height': ($(temp).height() + 50) + 'px' });
            $(temp).removeClass('svgContent');
        }

    });
    data.sort(function(a, b) {
        return b.hospitalization - a.hospitalization;
    });

    let totalHospitalizations = 0;
    let totalAdverseReactions = 0;
    let totalDrugInteraction = 0;
    let totalLiverFailure = 0;
    let totalAnemia = 0;
    let totalCost = 0;
    for (let i = 0; i < data.length; i++) {
        totalHospitalizations += data[i].hospitalization;
        totalAdverseReactions += data[i].adverseReactions;
         //Pram(20th Mar 17) : changes for safety data
        let originalSafetyData = JSON.parse(data[i].safetyData);
        totalDrugInteraction += originalSafetyData.drug_interaction_count;
        totalLiverFailure += originalSafetyData.liver_failure_count;
        totalAnemia += originalSafetyData.anemia_count;
        totalCost += data[i].cost;
    }

    totalCost = commaSeperatedNumber(totalCost);


    // Show No Data Found When Zero Hospitalizations
    let nodata = true;
    for (let i = 0; i < data.length; i++) {
        if (data[i].hospitalization > 0) {
            nodata = false;
        }
    }

    if (nodata) {
        let html = '<span style="color: #aaaeaf;position:relative;left: 25%;top: 32%;font-size: 12px;"> No hospitalization and additional cost for this Subpopulation.</span>';
        $(container).html(html);
        return;
    }

    // Create Table Structure 

    let htmlData = '<div class="spSafetyPopoverData">';
     //Pram(20th Mar 17) : changes for safety data
    let header = `<div class="spSafetyTH">
                        <div class="spSafetyTHColumn-popup"> Drug Name </div>
                        <div class="spSafetyTHColumn-popup"> Hospitalization </div>
                        <div class="spSafetyTHColumn-popup"> Adverse Reactions </div>
                        <div class="spSafetyTHColumn-popup"> Drug to drug interactions </div>
                        <div class="spSafetyTHColumn-popup"> Liver Failure </div>
                        <div class="spSafetyTHColumn-popup"> Anemia </div>
                        <div class="spSafetyTHColumn-popup"> Additional Cost </div>
                    </div>`;

    let innerContent = `<div class="spSafetyTB">`;

    for (let i = 0; i < data.length; i++) {

        let drugs = data[i].drugs;
        let hospitalization = data[i].hospitalization;
        let adverseReactions = data[i].adverseReactions;

        let originalSafetyData = JSON.parse(data[i].safetyData);
        let cost = commaSeperatedNumber(data[i].cost);

         //Pram(20th Mar 17) : changes for safety data
        innerContent += `<div class="spSafetyRow">
                            <div class="spSafetyTbColumn-popup" style="text-align:left;"> ${drugs} </div>
                            <div class="spSafetyTbColumn-popup spHospitaizationCount" onclick="openDrugComparisonChart('${tabName}')"> ${hospitalization} </div>
                            <div class="spSafetyTbColumn-popup spAdverseReactionsCount" onclick="openDrugComparisonChart('${tabName}')"> ${adverseReactions} </div>
                            <div class="spSafetyTbColumn-popup spDrugInteractionCount" onclick="openDrugComparisonChart('${tabName}')"> ${originalSafetyData.drug_interaction_count} </div>
                            <div class="spSafetyTbColumn-popup spLiverFailureCount" onclick="openDrugComparisonChart('${tabName}')"> ${originalSafetyData.liver_failure_count} </div>
                            <div class="spSafetyTbColumn-popup spAnimiaCount" onclick="openDrugComparisonChart('${tabName}')"> ${originalSafetyData.anemia_count} </div>
                            <div class="spSafetyTbColumn-popup"> $${cost} </div>
                        </div>`;
    }

    innerContent += '</div>';
    
     //Pram(20th Mar 17) : changes for safety data
    let footer = `<div class="spSafetyTF">
                        <div class="spSafetyTfColumn-popup"> Total </div>
                        <div class="spSafetyTfColumn-popup"> ${totalHospitalizations} </div>
                        <div class="spSafetyTfColumn-popup"> ${totalAdverseReactions} </div>
                        <div class="spSafetyTfColumn-popup"> ${totalDrugInteraction} </div>
                        <div class="spSafetyTfColumn-popup"> ${totalLiverFailure} </div>
                        <div class="spSafetyTfColumn-popup"> ${totalAnemia} </div>
                        <div class="spSafetyTfColumn-popup"> $${totalCost} </div>
                    </div>`;

    htmlData = htmlData + header + innerContent + footer + '</div>';

    // Append the data in the container.
    $(container).html(htmlData);



}


openDrugComparisonChart = function(tabName) {
    //console.log("trigger the event for drugcomparison Chart");
    var drugComparisionChartContainer = tabName + 'drugComparisionChart';
    $('#' + drugComparisionChartContainer).trigger("click");
}

//function to calclute the cost & count percentage for the reactions in each drug
getCostCountForReactions = function(reactions, unoptDrugN, unoptDrugCost, optDrugN, optDrugCost) {
    var hospCost = 0,
        hospPatients = 0;
    reactions = JSON.parse(reactions);

    //loop for all reactions in the drug
    for (var key in reactions) {
        var reaction = reactions[key];
        if (reaction.count > 0) {
            hospPatients += reaction.count;
            hospCost += Math.round(reaction.cost);
        }
    }

    var hospitalizationPercent = unoptDrugN !=0?((hospPatients / unoptDrugN) * 100) : 0;
    hospitalizationPercent = parseFloat(hospitalizationPercent).toFixed(2);

    if (optDrugN || optDrugCost) {
        //if the patientCount & Cost is not similar i.e. that value is optimized
        if (!((optDrugN == unoptDrugN) && (optDrugCost == unoptDrugCost))) {
            var pCount = (hospitalizationPercent * optDrugN) / 100;
            pCount = isNaN(pCount) ? 0 : pCount;
            pCount = Math.round(pCount);
            //return the count based on the new patient count
            return { cost: hospCost * optDrugN, count: Math.round(pCount) };
        }
    }

    return { cost: hospCost * unoptDrugN, count: Math.round(hospPatients) };
}