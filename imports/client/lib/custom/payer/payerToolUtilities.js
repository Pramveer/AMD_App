import { refineTheRWEUtilization } from './AdvPayerSPUtils.js';

//import the chart files
import './Charts';
var spChartsData = {};
spChartsData['treated'] = {},
    spChartsData['treating'] = {},
    spChartsData['untreated'] = {};

// Store selected filter in an object for easy access.
let selectedFilters = {
    'treated': {},
    'treating': {},
    'untreated': {}
};

//selected profiles
let selectedSavingProfile = {
    treated: {
        isSelected: false,
        profileInfo: null
    },
    treating: {
        isSelected: false,
        profileInfo: null
    },
    untreated: {
        isSelected: false,
        profileInfo: null
    }
};
//For new relative value chart
let relativeValueChartData = [],
    relativeChartContainer = null;

Meteor.startup(function() {

    sAlert.config({
        effect: 'bouncyflip',
        position: 'bottom-right',
        timeout: 5000,
        html: false,
        onRouteClose: true,
        stack: true,
        offset: '100px',
        beep: false,
        onClose: _.noop
    });

});

// Comma formated Number.
commaFormat = d3.format(',');

// Function to handle the click event for changing view of subpopulation (List View and Detail View)
// currentActiveClass is currently action class and classToActivate is which needs to be activated
changeSupopulationView = (currentActiveClass, classToActivate) => {
    $("." + currentActiveClass).removeClass("active");
    $("." + classToActivate).addClass("active");
    var currentActiveView = currentActiveClass.split("-")[0];
    var viewToActivate = classToActivate.split("-")[0];

    $("." + currentActiveView + "-Container").css("display", "none");
    $("." + viewToActivate + "-Container").css("display", "inline-block");

    //fire the click of first category if tab is detail view
    if (viewToActivate.indexOf('DetailView') > -1) {
        var tabName = viewToActivate.replace(/([A-Z])/g, ' $1').trim();
        tabName = tabName.split(' ')[0];
        $('.' + tabName + 'SubPopulationCategoriesItem:first-child').trigger('click');
    }
}

export function resetPayerFilters(ele) {
    var className = $(ele).attr('id').replace('reset', '');
    className += 'SelectionMenu';

    //reset all inputs
    $('.' + className).find(':input').each(function() {
        switch (this.type) {
            case 'password':
            case 'text':
            case 'textarea':
            case 'file':
            case 'select-one':
            case 'select-multiple':
                $(this).val('');
                break;
            case 'radio':
            case 'checkbox':
                this.checked = false;
        }
    });

    //reset genotype multi combo
    $('.' + className + ' .mutliSelect').find('li').each(function() {
        $(this).children('input').prop('checked', false);
    });

    $('.' + className + ' .multiSel').html('');
    $('.' + className + ' .hida').show();
    $('.' + className + ' .insurancePlanSelect').prop('selectedIndex', 0);

}

export function setFiltersToAll(tabName) {
    var className = tabName + 'SelectionMenu';

    //set the multiselect genotype combo value to all if it is not selected to all
    if (!($('.' + className + ' .mutliSelect input[type="checkbox"][value="all"]').prop('checked')))
        $('.' + className + ' .mutliSelect input[type="checkbox"][value="all"]').trigger('click');

    //set all inputs to all
    $('.' + className).find(':input').each(function() {
        switch (this.type) {
            case 'password':
            case 'text':
            case 'textarea':
            case 'file':
                $(this).val('');
                break;
            case 'select-one':
                //case 'select-multiple':
                $(this).val('all');
                break;
            case 'radio':
            case 'checkbox':
                this.checked = true;
        }
    });

    if (tabName == 'treated') {
        $('#selectTenureValue').val($('#selectTenureValue option:last-child').val());
    } else if (tabName == 'untreated') {
        $('#unTreatedSelectTenureValue').val($('#unTreatedSelectTenureValue option:last-child').val());
    }

}


export function handleMultiGenoCombo(ele) {
    var className = $(ele).closest('.genotypeSelect').parent().parent().attr('id'); // Selecting the id of the container.

    var title = title_html = $(ele).val(); //$(ele).closest('.mutliSelect').find('input[type="checkbox"]').val();

    var selectedLength = $('#' + className + ' .multiSel').children().length;

    title_html = $(ele).val() + ',';

    //chekc if selected value is all
    if (title.toLowerCase() === 'all') {
        //loop for all the genotypes
        $('#' + className + ' .mutliSelect').find('input').each(function(index) {
            if ($(ele).is(':checked')) {
                //if all is selected disable all other values except ALL
                if (index) {
                    $(this).attr('disabled', true);
                    $(this).prop('checked', false);
                }
            } else {
                //Enable all values when all is diselected
                $(this).attr('disabled', false);
                $(this).prop('checked', false);
            }
        });

        //append all in value area if is selected
        if ($(ele).is(':checked')) {
            var html = '<span title="All">All</span>';
            $('#' + className + ' .multiSel').empty();
            $('#' + className + ' .multiSel').append(html);
            // $('#'+className +' .multiSel').show();
            // $('#'+className + ' .hida').hide();
        }
        //remove all from value area if is unselected
        else {
            $('#' + className + ' span[title="All"]').remove();
            // $('#'+className + ' .hida').show();
            // $('#'+className +' .multiSel').hide();
        }
        return;
    }

    //append the value in value area if is selected
    if ($(ele).is(':checked')) {
        var html = '<span title="' + title + '">' + title_html + '</span>';
        $('#' + className + ' .multiSel').append(html);
        // $('#'+className + ' .hida').hide();
        // $('#'+className +' .multiSel').show();
    }
    //remove the value from value area if is unselected
    else {
        $('#' + className + ' span[title="' + title + '"]').remove();
        var ret = $('.' + className + ' .hida');
        $('#' + className + ' .dropdown dt a').append(ret);
        if (selectedLength == 1) {
            // $('#'+className + ' .hida').show();
            // $('#'+className +' .multiSel').hide();
        }
    }
}

// Getting Possible subpopulation cobinations
export function getPossibleCatCombination(data) {
    var allCategories = Patients_category,
        possibleCategories = [];

    //if filter is set to all then return all categories
    if (data['flag']) {
        if (data['flag'] === 'all') {
            for (var i = 0; i < allCategories.length; i++) {
                possibleCategories.push(allCategories[i].category_id);
            }
            possibleCategories.push(32);
            possibleCategories.push(33);
            possibleCategories.push(34);
            possibleCategories = getUniqueArray(possibleCategories);
            return possibleCategories.join(',');
        }

    }

    var genotypes = data['genotypes'], //selected genotypes
        cirrhosis = data['cirrhosis'], //selected cirrhosis
        treatments = data['treatment']; //selected treatment

    //filter data based on selected genotypes
    var filteredCats = _.filter(allCategories, function(rec) {
        return _.contains(genotypes, rec.genotype)
    });

    //filter data on selected treatment type
    if (treatments.length) {
        filteredCats = _.filter(filteredCats, function(rec) {
            return _.contains(treatments, rec.treatment)
        });
    }

    //filter data on cirrhosis
    if (cirrhosis.length) {
        filteredCats = _.filter(filteredCats, function(rec) {
            return _.contains(cirrhosis, rec.cirrhosis)
        });
    }

    for (var i = 0; i < filteredCats.length; i++) {
        possibleCategories.push(filteredCats[i].category_id);
    }

    //console.log(filteredCats);
    possibleCategories = getUniqueArray(possibleCategories);
    return possibleCategories.join(',');
}


export function optimzeSPLinkClick(ele) {
    var viewName = $(ele).attr('viewname');
    var categoryName = $(ele).attr('data');
    var parentSelector = viewName + 'subPopulationCategoriesContainer';

    $('.' + viewName + 'SubPopulationDetailView-Switch').trigger('click');

    $('.' + parentSelector).find('.subPopulationCategoriesItem').each(function() {
        $(this).removeClass('active');
        if ($(this).html() == categoryName) {
            $(this).addClass('active');
            $(this).trigger('click');
            $('.subcategoryInfo-PatientCategory').html(categoryName);
        }
    });
}


//function to update Universe view Quality Indicators
export function renderUniverseQualityIndicators(unoptimizedData, optimizedData, reactive_var) {

    //console.log(unoptimizedData);
    //var unoptimizedData = treatedSPData;
    //var optimizedData = Session.get('treatedPat_SPListData');
    
    // var categories_len = optimizedData.length;
    var categories = _.pluck(optimizedData,"category_name");


    //var reactive_var = 'uniTreatedQualityIndicators';
    var diffData = [];
    var finalJson = {};

    if (unoptimizedData.length == 0) {
        finalJson['adherence'] = 0;
        finalJson['efficacy'] = 0;
        finalJson['cost'] = 0;

        //define class for the indicators
        finalJson['adherence_class'] = getChangeInIndicators(0).cls;
        finalJson['efficacy_class'] = getChangeInIndicators(0).cls;
        finalJson['cost_class'] = getChangeInIndicators(0).cls;

        //define the value is increased/decresed
        finalJson['affected_adherence'] = getChangeInIndicators(0).label;
        finalJson['affected_efficacy'] = getChangeInIndicators(0).label;
        finalJson['affected_cost'] = getChangeInIndicators(0).label;

        Session.set(reactive_var, finalJson);
        return false;
    }

    //sort both optimized & unoptimized data
    unoptimizedData.sort(function(a, b) {
        return a['count'] - b['count'];
    });
    optimizedData.sort(function(a, b) {
        return a['count'] - b['count'];
    });

    let rweDataset = getModifiedIMSDataLikeSPList();

    rweDataset.sort(function(a, b) {
        return a['count'] - b['count'];
    });

    //current tab for Saving Profile Selection
    let currTab = reactive_var.replace('QualityIndicators', '');
    currTab = currTab.replace('uni', '').toLowerCase();
    let appliedProfile = getSavingsProfile(currTab),
        drugConsiderationProf = 1,
        profArr1 = [1],
        profArr2 = [0.75, 0.25],
        profArr3 = [0.50, 0.25, 0.25];

    if (appliedProfile.isSelected) {
        drugConsiderationProf = appliedProfile.profileInfo.split('_')[1];
        drugConsiderationProf = parseInt(drugConsiderationProf);
    }

    //calculations for pre optimization
    var unopt_bestAdh = [],
        unopt_bestCost = [],
        unopt_bestEff = [],
        unopt_Ahd = [],
        unopt_Eff = [],
        unopt_Cost = [];

    for (var i = 0; i < categories.length; i++) {

        // var drugData = unoptimizedData[i]['data'];
        let temp = _.where(unoptimizedData, {category_name:categories[i]})[0];
        var drugData =  temp['data'];

        // var categoryPatients = unoptimizedData[i]['count'];
        var categoryPatients =  temp['count'];

        //Pram (21st Mar 17): if no drugs are in real world then make the client dataset for that subpopulation as the rwe dataset
        // let rweDataDrugs = rweDataset[i] ? rweDataset[i]['data'] : drugData;
        let temp2 = _.where(rweDataset, {category_name:categories[i]})[0];
        let rweDataDrugs = temp2 ? temp2['data'] : drugData;

        //sort the drug data on the value score
        // drugData.sort(function(a, b) {
        //     return b['value'] - a['value'];
        // });

        /**
         * @author : Yuvraj
         * date : 10th April 2017
         * modified the logic to get best value drug.
         */
        drugData = SortByBestDrugsDecendingOrder(drugData, 'value');


        // rweDataDrugs.sort(function(a, b) {
        //     return b['value'] - a['value'];
        // });

        /**
         * @author : Yuvraj
         * date : 10th April 2017
         * modified the logic to get best value drug.
         */
        rweDataDrugs = SortByBestDrugsDecendingOrder(rweDataDrugs, 'value');

        // push the best values for each category
        // unopt_bestAdh.push(drugData[0]['adherence']);
        // unopt_bestEff.push(drugData[0]['efficacy']);
        // unopt_bestCost.push(drugData[0]['cost'] * categoryPatients);

        let drugConsideration = drugData.length < drugConsiderationProf ? drugData.length : drugConsiderationProf;

        for (let k = 0; k < drugConsideration; k++) {
            let utiPopulations = Math.round(categoryPatients * eval('profArr' + drugConsideration + '[' + k + ']'));
            unopt_bestAdh.push(rweDataDrugs[k]['adherence']);
            unopt_bestEff.push(rweDataDrugs[k]['efficacy']);
            unopt_bestCost.push(rweDataDrugs[k]['cost'] * utiPopulations);
        }

        var costs = eff = adh = 0;
        for (var j = 0; j < drugData.length; j++) {
            costs += drugData[j]['cost'] * drugData[j]['count'];
            eff += drugData[j]['efficacy'] == 'NA' ? 0 : (drugData[j]['efficacy'] * drugData[j]['count']);
            adh += drugData[j]['adherence'] * drugData[j]['count'];
        }

        //push the sum of the values for each category
        unopt_Ahd.push(adh / categoryPatients);
        unopt_Eff.push(eff / categoryPatients);
        unopt_Cost.push(costs);
    }

    //find the difference for the computation

    var diff_Adh = parseFloat(unopt_bestAdh.average() - unopt_Ahd.average()).toFixed(2),
        diff_Eff = parseFloat(unopt_bestEff.average() - unopt_Eff.average()).toFixed(2),
        diff_Cost = parseFloat(((unopt_bestCost.sum() - unopt_Cost.sum()) * 100) / unopt_Cost.sum()).toFixed(2);

    //Pram (13 Apr 17) : Implemented check for NaN cost diff
    if (isNaN(diff_Cost)) {
        diff_Cost = 0;
    }

    //input the data to display
    finalJson['adherence'] = diff_Adh < 0 ? Math.abs(diff_Adh) : diff_Adh;
    finalJson['efficacy'] = diff_Eff < 0 ? Math.abs(diff_Eff) : diff_Eff;
    finalJson['cost'] = diff_Cost < 0 ? Math.abs(diff_Cost) : diff_Cost;

    //define class for the indicators
    finalJson['adherence_class'] = getChangeInIndicators(diff_Adh).cls;
    finalJson['efficacy_class'] = getChangeInIndicators(diff_Eff).cls;
    finalJson['cost_class'] = getChangeInIndicators(diff_Cost).cls;

    //define the value is increased/decresed
    finalJson['affected_adherence'] = getChangeInIndicators(diff_Adh).label;
    finalJson['affected_efficacy'] = getChangeInIndicators(diff_Eff).label;
    finalJson['affected_cost'] = getChangeInIndicators(diff_Cost).label;

    //console.log(finalJson);
    Session.set(reactive_var, finalJson);
}

//function to render the clinical trial section  for each drug
export function renderClinicalTrialsSection(container, drugsData) {
    // console.log('**********Clinical Trial Section**********');
    var drugName = drugsData['DrugName'],
        safety = drugsData['Safety'];
    var dataObj = Blaze._globalHelpers.renderDrugsRiskData(drugName, safety, AdvPayerDrugsRiskData);
    //console.log(dataObj);

    var lrSections = '<div class="spClinicalDrugsInfo">',
        hrSections = '<div class="spClinicalDrugsInfo">',
        diSections = '<div class="spClinicalDrugsInfo">',
        ciSections = '<div class="spClinicalDrugsInfo">';

    var tabs = '<ul class="spClinicalULTabs">';

    for (var i = 0; i < dataObj.length; i++) {
        var riskInfo = dataObj[i];
        var isActive = '';
        if (i == 0)
            isActive = ' activeDrug';

        //tabs for the drugs
        tabs += '<li class="spClinicalULTab' + isActive + '">' +
            '<a infotab="drugCTsection_' + riskInfo['drugname'] + '">' + riskInfo['drugname'] + '</a>' +
            '</li>';

        //LR Section data
        // Modified By Yurvaj : May 22nd 2017 -  Added Check for Drugs added by Users, Showing No data Found Message.
        if(riskInfo['lrFile']){
            lrSections += '<div class="seperateDrugSection' + isActive + '" data="drugCTsection_' + riskInfo['drugname'] + '">' +
            '<iframe class="lr-hr-Frame" src=' + riskInfo['lrFile'] + ' onload="Template.Provider.popupLoaded(this)"></iframe>' +
            '<a href="#" drug=' + riskInfo['drugname'] + ' section="#34084-4" class="btn btn-default btn-block lr-hr-moreInfo"><span class="lr-hr-moreInfoIcon"></span>full text</a>' +
            '<span style="color:red;padding-right:5px;">*</span><span style="display:inline-block; margin-top: 10px;">Sourced from <a href="http://dailymed.nlm.nih.gov/dailymed/" >http://dailymed.nlm.nih.gov</a></span>' +
            '</div>';
        } else {
            lrSections += '<div class="seperateDrugSection' + isActive + '" data="drugCTsection_' + riskInfo['drugname'] + '">' +
                '<div class="providerNoDataFound">No data found.</div>' +
            '</div>';
        }
        

        //HR Section data
        // Modified By Yurvaj : May 22nd 2017 -  Added Check for Drugs added by Users, Showing No data Found Message.
        if(riskInfo['hrFile']){
            hrSections += '<div class="seperateDrugSection' + isActive + '" data="drugCTsection_' + riskInfo['drugname'] + '">' +
                '<iframe class="lr-hr-Frame" src=' + riskInfo['hrFile'] + ' onload="Template.Provider.popupLoaded(this)"></iframe>' +
                '<a href="#" drug=' + riskInfo['drugname'] + ' section="#34084-4" class="btn btn-default btn-block lr-hr-moreInfo"><span class="lr-hr-moreInfoIcon"></span>full text</a>' +
                '<span style="color:red;padding-right:5px;">*</span><span style="display:inline-block; margin-top: 10px;">Sourced from <a href="http://dailymed.nlm.nih.gov/dailymed/" >http://dailymed.nlm.nih.gov</a></span>' +
                '</div>';
        } else {
            hrSections += '<div class="seperateDrugSection' + isActive + '" data="drugCTsection_' + riskInfo['drugname'] + '">' +
                '<div class="providerNoDataFound">No data found.</div>' +
                '</div>';
        }

        //CI Section data
        ciSections += '<div class="seperateDrugSection' + isActive + '" data="drugCTsection_' + riskInfo['drugname'] + '" ' +
            'interactiondata="true" sectionname="CI">' +
            '</div>';

        //DI Section data
        diSections += '<div class="seperateDrugSection' + isActive + '" data="drugCTsection_' + riskInfo['drugname'] + '" ' +
            'interactiondata="true" sectionname="DI">' +
            '</div>';
    }

    tabs += '</ul>';

    //append tabs to sections
    lrSections = tabs + lrSections + '</div>';
    hrSections = tabs + hrSections + '</div>';
    diSections = tabs + diSections + '</div>';
    ciSections = tabs + ciSections + '</div>';

    $(container + ' .topRiskSection').attr('data-content', hrSections);
    $(container + ' .lowRiskSection').attr('data-content', lrSections);
    $(container + ' .drugInteractionSection').attr('data-content', diSections);
    $(container + ' .contraInteractionSection').attr('data-content', ciSections);

}


// Function to created Popover and Call the CreateSafetyIndicator Chart function.
export function createSafetyQualityIndicatorPopover(parentContainer, className, data, tabName) {

    //render safetyQulaityIndicator Chart
    var container = '.' + parentContainer + ' .safetyIndicatorChartContainer';
    createSubpopulationSafetyIndicatorChart(container, data, tabName);
    $('.' + parentContainer + ' .' + className).popover({
        //container: 'body',
        content: function() {
            return $(container).html();
        },
        placement: 'bottom',
        html: true,
        title: 'Safety <i class=\'fa fa-times pull-right popoverTogle\' onclick=\'$(&quot;.subpopulationIndicatorLabel&quot;).popover(&quot;hide&quot;);\'></i>'
    });
}

// toggle the up down/arrow on the Quality Indicators section.
calculateIncreaseAndDecreaseSign = function(oldData, newData) {
    var signArrow = '';
    if (oldData < newData) {
        signArrow = '<img src="/ua.png">';
    } else if (oldData > newData) {
        signArrow = '<img src="/da.png">';
    } else {
        signArrow = '<img src="/ua.png">';
    }

    //if no change in value then remove image
    if (oldData == newData) {
        signArrow = '';
    }

    return signArrow;
};

roundToExact100 = function(l, target) {
    var off = target - _.reduce(l, function(acc, x) { return acc + Math.round(x.utilization) }, 0);
    return _.chain(l).
    map(function(x, i) { return Math.round(x.utilization) + (off > i) - (i >= (l.length + off)) }).
    value();
}

//function to render the charts
export function renderChartsForTab(tabName, subPopulationData) {

    // Rendering genotype vs Saving Chart
    //savingVsGenotypeChart("#" + tabName + "FutureSavingChart", subPopulationData);

    // Cure rate Chart Creation
    createCureRateChart("#" + tabName + "_cureRateChart", subPopulationData);

    // Rendering genotype vs Saving Chart
    savingVsGenotypeChart("#" + tabName + "FutureSavingChart", subPopulationData);

    // Genotype Vs Cirrhosis Chart.
    //genotypeVsCirrhosisChart("#" + tabName + "GenotypeVsCirrhosisChart", subPopulationData);

    //Creating ValueGap Chart
    //createValueGapChart("#" + tabName + "SavingOppotunityLostChart", subPopulationData);

    //Cirrhosis Vs Non Cirrhosis
    cirrhosisVsNoncirrhosisChart("#" + tabName + "CirrhosisVsNonCirrhosisChart", subPopulationData);

    // Genotype Vs Cirrhosis Chart.
    genotypeVsCirrhosisChart("#" + tabName + "GenotypeVsCirrhosisChart", subPopulationData);

    //Creating ValueGap Chart
    //createValueGapChart("#" + tabName + "SavingOppotunityLostChart", subPopulationData);

    //Cirrhosis Vs Non Cirrhosis
    //cirrhosisVsNoncirrhosisChart("#" + tabName + "CirrhosisVsNonCirrhosisChart", subPopulationData);

    //render the Compartive value Chart
    //// Added different type of check for displaying zoom chart for subpopulation relative chart

    // // -----------------

    // var selectedMadication = '';
    // var data = [];
    // //Commented dependable drugData value fro value score chart which is repeatitive and lengthy
    // // var tempData = jQuery.parseJSON(e.currentTarget.attributes.drugData.nodeValue);

    // //For Payer Tab

    // //-------------------
    var compValueData = JSON.parse(localStorage.getItem(tabName + 'SvgDataFinal'));
    // console.log("****COMPARATIVE VALUE CHART****");
    // console.log(subPopulationData);
    // console.log(compValueData);
    //     let subPopulationInfo;
    /**
     * @author: Pramveer
     * @date: March 24th 2017
     * @desc: it assign zero value to utilization,drug count if the drug is from IMS dataset. 
     */
    for (var i = 0; i < compValueData.length; i++) {
        if (compValueData[i]['isImsDrug']) {
            compValueData[i]['DrugN'] = 0;
            compValueData[i]['TotalN'] = 0;
            compValueData[i]['Utilization']['Utilization'] = 0;
        }
    }

    //    subPopulationInfo = {
    //                 genotypes: tempd[0],
    //                 cirrhosis: tempd[2] == undefined ? 'No' : 'Yes',
    //                 treatment: tempd[1],

    //             };
    //     var totalPatients = $('#' + tabName + 'CurrentCount').html();
    //     totalPatients = totalPatients.replace(/\,/g, '');
    //     totalPatients = parseInt(totalPatients);



    //     subPopulationInfo.TotalN=totalPatients;
    // renderComparitiveValueChart(compValueData, 'Cost', 'Efficacy', tabName + '_conparativeDrugValueChart', tabName);
    renderNewRelativeValueChart({
        container: '#' + tabName + '_conparativeDrugValueChart',
        xAxis: 'Cost',
        isFilteredChart: true,
        yAxis: 'Efficacy',
        height: 260,
        width: 360,
        relativeChartData: prepareDataForBubbleChart(compValueData),
        tabName: tabName
    })

    spChartsData[tabName]['compartiveValueChartData'] = compValueData;


    spChartsData[tabName]['commonChartsData'] = subPopulationData;
}
/**
* Description : Method for preparing payer tab relative value chart. Small as well as zoom chart
Template path :../imports/client/components/graph/payerRelativeValue
 */
export function renderNewRelativeValueChart(options) {
    //console.log(spChartsData['treated']['compartiveValueChartData']);

    if (options.relativeChartData.length == 0) {
        $(options.container).html('<div class="providerNoDataFound">No Data Found</div>');
        return;
    }


    let subPopulationInfo = {};

    if (options.tabName) {
        if (options.tabName.match("^[a-zA-Z]+$") != null) {

            let temp = getFiltersData();

            let genotype = temp[options.tabName].genotypes;
            let cirrhosis = temp[options.tabName].cirrhosis;
            let treatment = temp[options.tabName].treatment;

            if (genotype instanceof Array) {
                genotype = genotype.join(',');
            }


            if (cirrhosis instanceof Array) {
                if (cirrhosis.length > 1)
                    cirrhosis = 'ALL';
                else
                    cirrhosis = cirrhosis[0];
            }

            if (treatment instanceof Array) {
                if (treatment.length > 1)
                    treatment = 'ALL';
                else
                    treatment = treatment[0];
            }

            // $('.GenotypeCik').html(genotype);
            // $('.CirrhosisCik').html(cirrhosis);
            // $('.TreatmentCik').html(treatment);
            // $('#TotalNContainer').html($('#' + option.tabName + 'CurrentCount').html());

            //                     var totalPatients = $('#' + option.tabName + 'CurrentCount').html();
            // totalPatients = totalPatients.replace(/\,/g, '');
            // totalPatients = parseInt(totalPatients);

            subPopulationInfo = {
                genotypes: genotype,
                cirrhosis: cirrhosis,
                treatment: treatment,
                TotalN: $('#' + options.tabName + 'DistinctCount').html()
            };
        } else {
            // $('#TotalNContainer').html($('.' + tabName + 'ThisCategoryPatients').html());
            var tempd = $('.' + options.tabName + 'detailViewLink').attr('data');
            tempd = tempd.split(' ');

            subPopulationInfo = {
                genotypes: tempd[0],
                cirrhosis: tempd[2] == undefined ? 'No' : 'Yes',
                treatment: tempd[1],
                TotalN: $('.' + options.tabName + 'ThisCategoryPatients').html()
            };


        }
    }
    // console.log("**** subPopulationInfo***** ");
    // console.log(subPopulationInfo);

    //filter for universe view chart
    let relativeChartData = [];
    if (options.isFilteredChart) {
        let imsDrugs = _.where(options.relativeChartData, { isImsDrug: 1 });
        let phsDrug = _.where(options.relativeChartData, { isImsDrug: 0 });

        let groupByDrugsIms = _.groupBy(imsDrugs, 'Madication');
        let groupByDrugsPhs = _.groupBy(phsDrug, 'Madication');
        let finalDataIms = [];
        let finalDataPhs = [];
        let totalPatients = _.pluck(options.relativeChartData, 'DrugN').sum();

        for (let key in groupByDrugsIms) {
            let json = {};
            json['Madication'] = key;
            let allDrugs = groupByDrugsIms[key];
            let drugsLength = allDrugs.length;
            let efficacy = 0,
                adherence = 0,
                patientCount = 0;
            let selectedMadication = 'false';
            for (let i = 0; i < drugsLength; i++) {
                efficacy += allDrugs[i]['Efficacy'];
                adherence += allDrugs[i]['Adherence'];
                patientCount += allDrugs[i]['DrugN'];
                if (allDrugs[i]['SelectedMadication'] == 'true') {
                    selectedMadication = 'true';
                }
            }
            json['Efficacy'] = (efficacy / drugsLength).toFixed(2);
            json['Adherence'] = (adherence / drugsLength).toFixed(2);
            json['Expenses'] = allDrugs[0]['Cost'] * patientCount;
            json['DrugN'] = patientCount;
            json['TotalN'] = totalPatients;
            json['Utilization'] = ((patientCount / totalPatients) * 100).toFixed(2);
            json['Cost'] = allDrugs[0]['Cost'];
            json['SelectedMadication'] = selectedMadication;

            finalDataIms.push(json);
        }

        for (let key in groupByDrugsPhs) {
            let json = {};
            json['Madication'] = key;
            let allDrugs = groupByDrugsPhs[key];
            let drugsLength = allDrugs.length;
            let efficacy = 0,
                adherence = 0,
                patientCount = 0;
            let selectedMadication = false;
            for (let i = 0; i < drugsLength; i++) {
                efficacy += allDrugs[i]['Efficacy'];
                adherence += allDrugs[i]['Adherence'];
                patientCount += allDrugs[i]['DrugN'];
                if (allDrugs[i]['SelectedMadication'] == 'true') {
                    selectedMadication = 'true';
                }
            }
            json['Efficacy'] = (efficacy / drugsLength).toFixed(2);
            json['Adherence'] = (adherence / drugsLength).toFixed(2);
            json['Expenses'] = allDrugs[0]['Cost'] * patientCount;
            json['DrugN'] = patientCount;
            json['TotalN'] = totalPatients;
            json['Utilization'] = ((patientCount / totalPatients) * 100).toFixed(2);
            json['Cost'] = allDrugs[0]['Cost'];
            json['SelectedMadication'] = selectedMadication;

            finalDataPhs.push(json);
        }

        finalDataIms.sort(function(a, b) {
            return b.PatientCount - a.PatientCount;
        });

        finalDataPhs.sort(function(a, b) {
            return b.PatientCount - a.PatientCount;
        });


        let finalChartData = [];
        finalChartData.push(finalDataIms);
        finalChartData.push(finalDataPhs);

        relativeChartData = _.flatten(finalChartData);

    } else {
        relativeChartData = options.relativeChartData;
    }

    let dataObj = {
        subPopulationInfo: options.subPopulationInfo ? options.subPopulationInfo : subPopulationInfo,
        //data: options.relativeChartData,
        data: relativeChartData,
        isFilteredChart: options.isFilteredChart,

        isSmallChart: options.height ? true : false,
        axis: { x: options.xAxis, y: options.yAxis },
        sizeParams: { svgHeight: options.height, svgWidth: options.width }
    };

    //console.log(options.container);
    $(options.container).empty();
    //render the template in the UI from /imports/client/components/graph/payerRelativeValue/relativeValue.html
    UI.renderWithData(Template.PayerRelativeValueChart, dataObj, $(options.container)[0]);
    setTimeout(function() {
        //Add click event for zooming small chart in subpopulation view
        if (options.tabName) {
            $(options.container).click(function(e) {

                let comparitveValueChartData =

                    renderNewRelativeValueChart({
                        subPopulationInfo: subPopulationInfo,
                        container: '#relativeValueZoomChartsPopup-container',
                        isFilteredChart: options.isFilteredChart ? true : (e.currentTarget.id == 'treated_conparativeDrugValueChart' ? true : false),
                        xAxis: 'Cost',
                        yAxis: 'Efficacy',
                        relativeChartData: isUniverseWeightsZero() ? [] : options.relativeChartData

                    })

                // Display Popup for relative chart on payer
                setTimeout(function() {
                    $('.subpopulationChartsPopup-header').html('Comparative Value Chart');

                    //// Sometimes title and Genotypes value are set from different payer tab zoom chart so, set empty explicitly
                    $('.subpopulationChartsPopup-title').html('');
                    $('.subpopulationChartsPopup-footer').html('');
                    $('#relativeValueZoomChartsPopup').show();
                }, 50);

                //unload event for the popup
                //$('#subpopulationChartsPopup .comparativeDrugValueChart_legends').remove();
                $('[data-popup-close]').on('click', function(e) {
                    var targetClass = $(this).attr('data-popup-close');
                    //$('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);
                    $('#relativeValueZoomChartsPopup .comparativeDrugValueChart_legends').remove();
                    e.preventDefault();
                });

            });

        }

    }, 200);


}

function calculateSize(minimum, maximum, populationSize, totalCount, previousAllocatedSize) {
    var diffrenceInSize = 12 / (totalCount - 2);
    //    Pinscriptive.PrevioulyAllocatedSize = previousAllocatedSize + diffrenceInSize;
    return previousAllocatedSize + diffrenceInSize;
}

export function createComplicationRateView(id, rdata, tabName, isComparitiveFilter) {


    //  var html = '<div class="">';
    //  var table = '<table id="complicationrateTable_'+tabName+'" class="table table-striped complicationrateTable">'+
    //                  '<thead>'+
    //                    '<tr>'+
    //                      '<th class="complicationsRateHeadings" style="background: none;"></th>'+
    //                      '<th class="complicationsRateHeadings sortg">Drugs</th>'+
    //                      '<th class="complicationsRateHeadings sortg">Complication rate per 1000 days</th>'+
    //                      '<th class="complicationsRateHeadings sortg">Cost of complications per 1000 days</th>'+

    //                    '</tr>'+
    //                  '</thead>'+
    //                  '<tbody>';

    //  //rdata = JSON.parse(rdata);
    //  //console.log(rdata);
    //  //store all the data in the array
    //  var dataArray = [];
    //  for(var key in rdata){
    //      dataArray.push(rdata[key]);
    //  }
    //  //group by medication name
    //  dataArray = _.groupBy(dataArray,'medication');

    //  var finalData = [];
    //  for(var key in dataArray){
    //      var drugData = dataArray[key];
    //      var json = {},
    //          totalComp_Cost = 0,
    //          totalComp_Count = 0,
    //          treatment_Count = 0,
    //          drugIds = [];
    //      for(var i=0;i<drugData.length;i++) {
    //          totalComp_Cost += drugData[i]['compli_cost'];
    //          totalComp_Count += drugData[i]['total_reaction_count'];
    //          treatment_Count += drugData[i]['treatment_period'] * drugData[i]['count'] * 7;
    //          drugIds.push(drugData[i]['drugid']);
    //      }
    //      json['drugGroupName'] = key;
    //      json['complicationRate'] = getComplicationsForDrug(totalComp_Count,treatment_Count);
    //      json['complicationCost'] = totalComp_Cost;
    //      json['drugIds'] = drugIds.join(',');
    //      finalData.push(json);
    //  }
    //  //console.log('********************ALL DRUGS LIST***********************');
    //  //console.log(finalData);

    //  for(var i=0;i<finalData.length;i++) {
    //      var drugIDArray = finalData[i].drugIds.split(',');
    //      var checked = isDrugChecked(drugIDArray, tabName+'Pat_SPListData', isComparitiveFilter);
    //      //var checked = true;
    //      table += '<tr style="text-align:left">';
    //      if(checked)
    //          table +=  '<td><input type="checkbox" class=" medcomplist'+tabName+'" value="'+finalData[i].drugIds+'" checked="true"/></td>';
    //      else
    //          table += '<td><input type="checkbox" class=" medcomplist'+tabName+'" value="'+finalData[i].drugIds+'"></td>';

    //          table +=  '<td class="crDrugName">'+finalData[i].drugGroupName+'</td>'+

    //              '<td class="crValue">'+(finalData[i].complicationRate).toFixed(2)+'</td>'+
    //              '<td class="crCost">$'+commaSeperatedNumber(Math.round(finalData[i].complicationCost))+'</td>';


    //      table += '</tr>';
    //  }

    //  table += '</tbody></table>';

    // // var applyButtonContainer = '<div class="complicationViewApplyContaier"><div class="complicationsApplybutton">Apply</div></div>';

    //  // html = html + table +'<div>' + applyButtonContainer;
    //  html = html + table +'<div>';
    // $(id).html("");

    // $(id).html(html);

}


function isDrugChecked(checkedDrugArray, sessionDataVariable, isComparitiveFilter) {
    if (!isComparitiveFilter)
        return true;

    var rawData = Session.get(sessionDataVariable);
    var drugChecked = false;
    for (var i = 0; i < rawData.length; i++) {
        var drugsData = rawData[i]['data'];

        for (var j = 0; j < drugsData.length; j++) {
            /*if((drugId == drugsData[j]['drugid']) && (drugsData[j]['checked'] == 'checked')) {
                drugChecked = true;
                break;
            }*/
            if (checkedDrugArray.indexOf(drugsData[j]['drugid'].toString()) > -1) {
                drugChecked = true;
                break;
            }
        }
    }

    return drugChecked;
}

function getComplicationsForDrug(compCount, compTreatment) {
    return (compCount / compTreatment) * 1000;
}

//function from the common.js file
WrapDrugName = function(drug) {
    //split drug with '+' symbol
    var splittedDrug = drug.split('+');
    if (splittedDrug.length > 1) {
        //split second index drug with '(' symbol
        var furtherSplittedDrug = splittedDrug[1].split('(');
        if (furtherSplittedDrug.length > 1) {
            //To Do display  both array as zero index drug from it is and also set title for it
            $('#inspected-drug').text((splittedDrug[0] + '+' + furtherSplittedDrug[0]) + '...').attr('title', drug);
        } else {
            //To Do display  both array as zero index drug from it is and also set title for it
            if (splittedDrug.length > 2) {
                $('#inspected-drug').text((splittedDrug[0] + '+' + furtherSplittedDrug[0]) + '...').attr('title', drug);
            } else {
                $('#inspected-drug').text((splittedDrug[0] + '+' + furtherSplittedDrug[0])).attr('title', drug);
            }
        }
    } else {
        //To Do display drug as it is and also set title for it
        $('#inspected-drug').text(drug).attr('title', drug);
    }
}

zoomSubpopulationChart = function(ele, tabName, chartName) {
    var container = 'subpopulationChartsPopup-container',
        headerText = '',
        footerText = '',
        titleText = '',
        subPopulationData = null,
        yAxisPlotCondition = $('.' + tabName + 'ActuaExpensesChartSavings').hasClass('active') ? 'savings' : 'total_cost';

    chartName = chartName.toLowerCase();

    tabName = tabName.replace(/[0-9]/g, '');
    subPopulationData = getDataforChart(tabName, 'commonChartsData');

    $('#' + container).empty();
    $('#' + container).attr('tabname', tabName);

    var sizeParams = {
        height: 400,
        width: 650
    };

    switch (chartName) {
        case 'genotypeandsavings':
            // Rendering genotype vs Saving Chart
            savingVsGenotypeChart("#" + container, subPopulationData, sizeParams);
            headerText = 'Genotype V/S Savings';
            titleText = 'With Best Value Drug (In Dollars)';
            footerText = 'Genotypes';
            break;

        case 'cureratechart':
            // Cure rate Chart Creation
            createCureRateChart("#" + container, subPopulationData, sizeParams);
            headerText = 'Potential For Cure';
            break;

        case 'genotypeandcirrhosis':
            // Genotype Vs Cirrhosis Chart.
            genotypeVsCirrhosisChart("#" + container, subPopulationData, yAxisPlotCondition, sizeParams);
            headerText = 'Genotype V/S Cirrhosis';
            footerText = 'Genotypes';
            break;

        case 'cirrhosisandnoncirrhosis':
            //Cirrhosis Vs Non Cirrhosis
            cirrhosisVsNoncirrhosisChart("#" + container, subPopulationData, yAxisPlotCondition, sizeParams);
            headerText = 'Cirrhosis V/S Non-Cirrhosis';
            break;

        case 'genotypeandvaluegap':
            //Creating ValueGap Chart
            createValueGapChart("#" + container, subPopulationData, sizeParams);
            headerText = 'Lost Value';
            titleText = 'By Patient Category';
            break;

        case 'compartivevalue':
            //render the Compartive value Chart
            // renderComparitiveValueChart(subPopulationData,'Cost','Efficacy',container,tabName,sizeParams);
            headerText = 'Comparative Value Chart';
            //titleText = 'Top 5 Drugs';
            // footerText = '<span style="position: absolute;top: 10%;right: 24%;">' +
            //     '<img src="/optimalPointForValueZoneDot.png"/>' +
            //     '</span>' +
            //     '<div style="width: 70%;margin: auto;">' +
            //     '<span style="padding-left:10%;"><img src="/relativeTabChart.png" /></span>' +
            //     '<span style="float:right;padding-right:10%;"><img src="/comparitveValue.png" /></span>' +
            //     '</div>';


            // -----------------

            var selectedMadication = '';
            var data = [];
            //Commented dependable drugData value fro value score chart which is repeatitive and lengthy
            // var tempData = jQuery.parseJSON(e.currentTarget.attributes.drugData.nodeValue);
            // tempData = JSON.parse(localStorage.AllDrugsData);
            //For Payer Tab
            console.log("***** Relative value chart for subPopulation in Payer Zoom*****");
            console.log(subPopulationData);
            // tempData = subPopulationData;


            var tempData = JSON.parse(localStorage.getItem(tabName + 'SvgData'));
            if (tempData.length == 0) {
                console.log('***compValueData.length***');
                console.log(tempData.length);
                tempData = JSON.parse(localStorage.getItem(tabName + 'SvgDataFinal'));
            }

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
                    // if (tempData[i].Adherence.Adherence == 'NaN') {
                    //     json['Adherence'] = 55;
                    // } else {
                    //     json['Adherence'] = parseFloat(tempData[i].Adherence.Adherence);
                    // }
                    json['Cost'] = parseInt(tempData[i].Cost.TotalCost / 1000);

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






            //-------------------


            relativeValueChartData = data;
            console.log("Zoom Relative value chart data");

            console.log(container);


            // renderComparitiveValueChart(compValueData, 'Cost', 'Efficacy', tabName + '_conparativeDrugValueChart', tabName);

            renderNewRelativeValueChart({ container: '#' + container, xAxis: 'Cost', yAxis: 'Efficacy', relativeChartData: data })

            break;

        case 'hospitalizationchart':
            headerText = 'Hospitalization';
            var data = JSON.parse($(ele).attr('chartData'));
            //render hospitalization chart
            renderDrugSafetyHospitalizationChart('#' + container, data, { x: 'name', y: 'count' }, { height: 400, width: 850 });
            $('.subpopulationChartsPopup-close').css('margin-top', '20px');
            break;

        case 'rxcostchart':
            headerText = 'Rx Additional Cost';
            var data = JSON.parse($(ele).attr('chartData'));
            //render rx cost chart
            renderDrugSafetyDrugCostChart('#' + container, data, { x: 'name', y: 'cost' }, { height: 400, width: 850 });
            $('.subpopulationChartsPopup-close').css('margin-top', '20px');
            break;
    }

    setTimeout(function() {
        $('.subpopulationChartsPopup-header').html(headerText);
        $('.subpopulationChartsPopup-title').html(titleText);
        $('.subpopulationChartsPopup-footer').html(footerText);
        $('#subpopulationChartsPopup').show();
    }, 50);

    //unload event for the popup
    //$('#subpopulationChartsPopup .comparativeDrugValueChart_legends').remove();
    $('[data-popup-close]').on('click', function(e) {
        var targetClass = $(this).attr('data-popup-close');
        //$('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);
        $('#subpopulationChartsPopup .comparativeDrugValueChart_legends').remove();
        e.preventDefault();
    });

}

function getDataforChart(tabName, chartName) {
    return spChartsData[tabName][chartName];
}

/**
 * @author: pramveer
 * @date:21st feb 2017  
 * @desc:tenure value is removed because years field is removed from filters 
 */
export function storeFitersData(tabname, categoryData, planType) {
    selectedFilters[tabname]['flag'] = categoryData.flag;
    selectedFilters[tabname]['genotypes'] = categoryData.genotypes;
    selectedFilters[tabname]['treatment'] = categoryData.treatment;
    selectedFilters[tabname]['cirrhosis'] = categoryData.cirrhosis;
    selectedFilters[tabname]['planType'] = planType;
    selectedFilters[tabname]['fdaCompliant'] = categoryData.fdaCompliant;
    selectedFilters[tabname]['rebateDiscount'] = categoryData.rebateDiscount;
    selectedFilters[tabname]['rebateDb'] = categoryData.rebateDb;
    // if (tenureValue) {
    //     selectedFilters[tabname]['tenureValue'] = tenureValue;
    // }
}

export function getFiltersData() {
    return selectedFilters;
}


export function getSavingsProfile(tabName) {
    var intVal = tabName.match(/-?\d+\.?\d*/);
    tabName = tabName.replace(intVal, '');

    return selectedSavingProfile[tabName];
}

export function setSavingsProfile(tabName, profileData) {
    var intVal = tabName.match(/-?\d+\.?\d*/);
    tabName = tabName.replace(intVal, '');

    selectedSavingProfile[tabName]['isSelected'] = true;
    selectedSavingProfile[tabName]['profileInfo'] = profileData;
}

export function resetSavingsProfile(tabName) {
    var intVal = tabName.match(/-?\d+\.?\d*/);
    tabName = tabName.replace(intVal, '');

    selectedSavingProfile[tabName]['isSelected'] = false;
    selectedSavingProfile[tabName]['profileInfo'] = null;
}

let getChangeInIndicators = (diffValue) => {
    let label, cls;

    if (parseFloat(diffValue) == 0.00) {
        label = 'No Change';
        cls = 'indicateUnchangeValue';
    } else if (diffValue < 0) {
        label = 'Decreased';
        cls = 'indicateNegativeValue';
    } else {
        label = 'Increased';
        cls = 'indicatePositiveValue';
    }

    return {
        label: label,
        cls: cls
    }
}

//Prepare Data For Bubble Chart
export function prepareDataForBubbleChart(selDrugsWithData) {
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
                json['Efficacy'] = parseFloat(parseFloat(tempData[i].Efficacy.Efficacy).toFixed(2));
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
            json['Utilization'] = parseFloat(parseFloat(tempData[i].Utilization.Utilization).toFixed(2));
            json['TotalN'] = tempData[i].TotalN;
            json['DrugN'] = tempData[i].DrugN;
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
            json['DrugPopulationUtilization'] = parseFloat(parseFloat(tempData[i].Utilization.Utilization).toFixed(2));
            if (tempData[i].isImsDrug == 0) {
                json['SelectedMadication'] = 'true';
            } else {
                json['SelectedMadication'] = 'false';
            }

            json['SelectSvg'] = 'SelectedMadication';
            json['drugNameDisplayCount'] = i;
            json['isImsDrug'] = tempData[i].isImsDrug;
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


/**
 * @author: Pramveer
 * @date: 14th Mar 17
 * @desc: function to prepare the similar structure for IMS data as we have for PHS data 
 */
export let getModifiedIMSDataLikeSPList = (baseDataObj) => {

    //Pram: (12 Apr 17) Added param to prepare data for selected dataset
    let dataset = null;
    let baseDataSet = baseDataObj ? baseDataObj : TreatedAnalyticsData;

    //Pram (14 Apr 17) : Implemented the weights to be applied to the object 
    baseDataSet = applyUniverseWeightsOnBaseObject(baseDataSet);

    // if(baseDataObj) {
    //     dataset = _.groupBy(getFilteredDataset(baseDataObj, false), 'category_id');
    // }
    // else {
    //     dataset = _.groupBy(getFilteredDataset(TreatedAnalyticsData, false), 'category_id');
    // }

    dataset = _.groupBy(getFilteredDataset(baseDataSet, false), 'category_id');

    let preparedData = [];

    for (let category in dataset) {
        let drugsData = dataset[category];

        // drugsData = applyUniverseweights(drugsData);

        let uniVerseObj = {};

        //let imsdata = applyUniverseweights(imsDataSet[category]);

        // let bestValueCost = getBestValueCostForCategory(imsdata);
        // let expenses = getExpensesForCategory(drugsData);

        uniVerseObj.best_value_cost = 0; // bestValueCost;
        uniVerseObj.best_value_cost_display = 0; // commaSeperatedNumber(bestValueCost);
        uniVerseObj.category_id = drugsData[0].category_id;
        uniVerseObj.category_name = drugsData[0].category_name;
        uniVerseObj.count = drugsData[0].total;
        uniVerseObj.data = prepareDrugsData(drugsData);
        uniVerseObj.optimizedValue = 0;
        uniVerseObj.optimizedValue_display = 0;
        uniVerseObj.savings = 0; // expenses - bestValueCost;
        uniVerseObj.savings_display = 0; //commaSeperatedNumber(uniVerseObj.savings);
        uniVerseObj.total_cost = 0; // expenses;
        uniVerseObj.total_cost_display = 0; // commaSeperatedNumber(expenses);

        preparedData.push(uniVerseObj);
    }

    return preparedData;
}


/**
 * @author: Pramveer
 * @date: 14th Mar 17
 * @desc: function to prepare drugs structure for a given category/ sub population
 */
export let prepareDrugsData = (dataArray) => {
    let finalArray = [];

    for (let j = 0; j < dataArray.length; j++) {
        let json = _.clone(dataArray[j]);

        json['efficacy_count'] = dataArray[j].efficacy_patients;
        json['safe'] = dataArray[j].safe_check;

        // if (isComparitiveFilter == true)
        //     json['checked'] = "checked";
        // else {
        json['checked'] = "";
        //}

        json['drugid'] = dataArray[j].drugid;
        json['period'] = dataArray[j].treatment_period;
        json['comp_value'] = (dataArray[j].comp_value).toFixed(2);
        json['compli_cost'] = commaSeperatedNumber(parseInt(dataArray[j].compli_cost));

        finalArray.push(json);
    }

    return finalArray;
}

/**
 * @author: Pramveer
 * @date: 
 * @desc: 
 */

export let sortDataInDesc = (dataArray, value) => {
    let data = _.sortBy(dataArray, value);
    return data.reverse();
}

export let getFilteredDataset = (baseDataset, isClient) => {
    let filteredData = {};

    if (isClient) {
        filteredData = _.filter(baseDataset, (rec) => {
            return rec.isImsDrug == 0;
        });
    } else {
        filteredData = _.filter(baseDataset, (rec) => {
            return rec.isImsDrug == 1;
        });
    }

    return filteredData;
}

/**
 * @author: Pramveer
 * @date: 20th Mar 17
 * @desc: 
 */
export let refineUtilizationForReccomendationProfile = (baseDataObj, currTab) => {
    let finalData = {};
    //extend the object so that it doesn't effect the original one
    let baseData = jQuery.extend(true, {}, baseDataObj);

    let appliedProfile = getSavingsProfile(currTab),
        drugConsiderationProf = 1,
        drugCount = 0,
        profArr1 = [1],
        profArr2 = [0.75, 0.25],
        profArr3 = [0.50, 0.25, 0.25];

    if (appliedProfile.isSelected) {
        drugConsiderationProf = appliedProfile.profileInfo.split('_')[1];
        drugConsiderationProf = parseInt(drugConsiderationProf);
    } else {
        return refineTheRWEUtilization(baseData);
    }

    //group for category id
    baseData = _.groupBy(baseData, 'category_id');

    //loop for all categories
    for (let keys in baseData) {
        let drugsData = baseData[keys],
            refinedUtiCount = 0,
            totalPopCount = _.where(drugsData, { isImsDrug: 0 })[0].total;

        /**
         * @author : Yuvraj
         * date : 10th April 2017
         * modified the logic to get best value drug.
         */
        // drugsData = sortDataInDesc(drugsData, 'value');
        drugsData = SortByBestDrugsDecendingOrder(drugsData, 'value');

        for (let i = 0; i < drugsData.length; i++) {
            let drugObj = _.clone(drugsData[i]);

            //make all the client drug utilization to zero
            if (drugObj.isImsDrug == 0) {
                drugObj.utilization = 0;
                drugObj.unique_total = 0;
                drugObj.total = totalPopCount;
                drugObj.count = 0;
            } else if ((drugObj.isImsDrug == 1) && (refinedUtiCount < drugConsiderationProf)) {
                drugObj.utilization = Math.round(eval('profArr' + drugConsiderationProf + '[' + (refinedUtiCount) + ']') * 100);
                drugObj.count = Math.round((totalPopCount * drugObj.utilization) / 100);
                drugObj.total = totalPopCount;
                refinedUtiCount++;
            } else {
                drugObj.utilization = 0;
                drugObj.unique_total = 0;
                drugObj.total = totalPopCount;
                drugObj.count = 0;
            }

            finalData[drugCount] = drugObj;
            drugCount++;
        }
    }

    console.log('************ Profile Refined UM *************');
    console.log(finalData);

    return finalData;
}



/**
 * @author: Yuvraj Pal
 * @desc: this function will return the dataset in the ecending order of the besrt value drug. 
 * The best value dug is been choosen by comparing the treatment period and cost. 
 * @date : 7th April, 2017
 */

export let SortByBestDrugsDecendingOrder = (dataArray, value) => {
    //Pram (13 Apr 17): Implemented check for empty dataset
    if (dataArray.length < 1) {
        return [];
    }

    // accending order.
    let data = _.sortBy(dataArray, value);
    // decending order
    data = data.reverse();

    // get best value drug.
    let bestValuesDrug = data[0];

    //  get score of the best value drug.
    let bestValueScore = bestValuesDrug['value'];

    // find out all the drugs where value score is equal to "bestValueScore"
    let bestValueScoreDrugs = _.where(data, { 'value': bestValueScore });

    if (bestValueScoreDrugs.length > 1) {
        // there is more than one drug with the bestValueScore.

        let finalArray = [];

        // find not_best_value_drugs;
        let notBestValueDrugs = data.filter(function(drug) {
            return drug['value'] != bestValueScore;
        });

        // sort the bestValueDrugs in the order of priority.
        //let bestDrugsByPriority = findBestDrugsByPriority(bestValueScoreDrugs);

        //Pram(12 Apr 17) : Added check for the value score
        let isBestValueZero = _.pluck(bestValueScoreDrugs, 'value').sum() < 1 ? true : false;
        let bestDrugsByPriority = [];

        if (isBestValueZero) {
            bestDrugsByPriority = bestValueScoreDrugs;
        } else {
            bestDrugsByPriority = findBestDrugsByPriority(bestValueScoreDrugs);
        }

        // push Best Drugs into final array.
        for (let i = 0; i < bestDrugsByPriority.length; i++) {
            finalArray.push(bestDrugsByPriority[i]);
        }

        // sort NotBestValueDrugs in reverse order of the value scores again.
        // accending order.
        // notBestValueDrugs = _.sortBy(notBestValueDrugs, value);
        // // decending order
        // notBestValueDrugs = data.reverse();

        notBestValueDrugs = notBestValueDrugs.sort((a, b) => {
            return b.value > a.value;
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
function findBestDrugsByPriority(bestValueDrugs) {
    let finalBestValueDrugs = [];

    let bestDrug = '';

    // find drug with minimum treatment period.
    // sort by accending order of treatment period
    bestValueDrugs = bestValueDrugs.sort(function(a, b) {
        return a.treatment_period > b.treatment_period;
    });
    // get minimum treatment period
    let minimumTreatmentDrug = bestValueDrugs[0];
    // find Minimum treatment period
    let minimumTreatmentPeriod = minimumTreatmentDrug.treatment_period;

    // find out if there are more drugs with minimum treatment period.
    let drugsWithMinTreatment = _.where(bestValueDrugs, { 'treatment_period': minimumTreatmentPeriod });

    // if there are more than one drug with the minimum treatment period.
    if (drugsWithMinTreatment.length > 1) {

        // find out drug with minimum cost out of the above drugs.
        // sort by accending order of cost
        drugsWithMinTreatment = drugsWithMinTreatment.sort(function(a, b) {
            return a.cost > b.cost;
        });
        // get minimum cost
        let minimumCostDrug = drugsWithMinTreatment[0];
        // find Minimum treatment period
        let minimumCost = minimumCostDrug.cost;
        // find out if there are more drugs with minimum Cost.
        let drugsWithMinCost = _.where(drugsWithMinTreatment, { 'cost': minimumCost });

        // if there is more than one drug with same cost.
        if (drugsWithMinCost.length > 1) {

            // find out drug with the max efficacy.
            // sort by decending order of efficacy.
            drugsWithMinCost = drugsWithMinCost.sort(function(a, b) {
                return a.efficacy < b.efficacy;
            });
            // get maximum Efficacy
            let maxEfficacyDrug = drugsWithMinCost[0];
            // find maximum Efficacy
            let maxEfficacy = maxEfficacyDrug.efficacy;
            // find out if there are more drugs with maximum Efficacy.
            let drugsWithMaxEfficacy = _.where(drugsWithMinCost, { 'efficacy': maxEfficacy });

            // if there are more than one drug with same efficacy then.
            if (drugsWithMaxEfficacy.length > 1) {
                // find out drug with best adherence.
                // sort by decending order of Adherence.
                drugsWithMaxEfficacy = drugsWithMaxEfficacy.sort(function(a, b) {
                    return a.adherence < b.adherence;
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
        // return ((drug.medication != bestDrug[0].medication) && (drug.treatment_period != bestDrug[0].treatment_period))
        let medname = bestDrug.length > 0 ? bestDrug[0].medication : '';
        if (drug.medication != medname) {
            return true;
        } else if (bestDrug.length > 0 && drug.treatment_period != bestDrug[0].treatment_period) {
            return true;
        } else {
            return false;
        }

    });

    // Add other bestValueDrugs into finalBestValueDrugs
    for (let i = 0; i < bestValueDrugs.length; i++) {
        finalBestValueDrugs.push(bestValueDrugs[i]);
    }


    //return finalBestValueDrugs;
    //Pram(12 Apr 17) : Flatten the response so it does not get into internal array of array
    return _.flatten(finalBestValueDrugs);

}



function applyUniverseweights(dataArray) {
    let finalArray = [];
    let weights = getRelativeWeights();

    for (let j = 0; j < dataArray.length; j++) {

        //todo check for nan efficacy & cost 0
        let json = _.clone(dataArray[j]);
        // taking satardard Cost
        // let costFactor = ((dataArray[j].max_cost - dataArray[j].cost) / dataArray[j].max_cost) * 100;
        let costFactor = ((dataArray[j].max_cost - dataArray[j].standard_cost) / dataArray[j].max_cost) * 100;

        if (weights.efficacy == 0 && weights.adherence == 0 && weights.cost == 0) {
            json['value'] = 0; //put value score calculated to json
        } else {
            //calculate value score based on weights applied
            let valueScore = (
                weights.efficacy * dataArray[j].efficacy +
                weights.adherence * dataArray[j].adherence +
                weights.cost * costFactor
            ) / (
                (weights.efficacy + weights.adherence + weights.cost) * 10
            );

            json['value'] = valueScore; //put value score calculated to json
        }
        finalArray.push(json);
    }
    return finalArray;
}

function getRelativeWeights() {

    let efficacy = $('#txtEffWeightTreated').val();
    let adherence = $('#txtAdhWeightTreated').val();
    let cost = $('#txtCostWeightTreated').val();

    return { efficacy: efficacy / 100, adherence: adherence / 100, cost: cost / 100 };
}

/**
 * @author: Pramveer
 * @date: 13 Apr 17
 * @desc: function to return dataarray for non zero values
 */
export let getDrugsWithValueScoreGreaterThanZero = (dataset, valueKey) => {
    let filteredData = [];

    filteredData = _.filter(dataset, (rec) => {
        return rec[valueKey] != 0;
    });

    return filteredData;
}

/**
 * @author: Pramveer
 * @date: 13 Apr 17
 * @desc: function to return structure for Sup population list data
 */
export let getStructureForSPList = () => {
    let jsonObj = {};

    jsonObj.best_value_cost = 0;
    jsonObj.best_value_cost_display = '$0';
    jsonObj.category_id = 0;
    jsonObj.category_name = null;
    jsonObj.count = 0;
    jsonObj.data = [];
    jsonObj.optimizedValue = 0;
    jsonObj.optimizedValue_display = 0;
    jsonObj.savings = 0;
    jsonObj.savings_display = '$0';
    jsonObj.total_cost = 0;
    jsonObj.total_cost_display = '$0';

    return jsonObj;
}

/**
 * @author: Pramveer
 * @date: 14 Apr 17
 * @desc: function to implement the universe weights on base data object
 */
export let applyUniverseWeightsOnBaseObject = (baseDataObj) => {
    let preparedDataObj = {};
    //get current relative weights value
    let weightsObj = getRelativeWeightValues();

    //extend the data from the base data to make changes
    let defaultData = jQuery.extend(true, {}, baseDataObj);

    //group for sub population
    let groupedData = _.groupBy(defaultData, 'category_id');
    let drugCount = 0;

    //traverse for each sub population
    for (let keys in groupedData) {

        let drugsData = groupedData[keys];

        for (let i = 0; i < drugsData.length; i++) {
            let drugObj = _.clone(drugsData[i]);

            //calculate the cost factor
            let costFactor = ((drugObj.max_cost - drugObj.standard_cost) / drugObj.max_cost) * 100;

            //if all 3 weights are zero then make the value score 0
            if (weightsObj.efficacy == 0 && weightsObj.adherence == 0 && weightsObj.cost == 0) {
                drugObj['value'] = 0; //put value score calculated to drugObj
            } else {
                //calculate value score based on weights applied
                let valueScore = (
                    weightsObj.efficacy * drugObj.efficacy +
                    weightsObj.adherence * drugObj.adherence +
                    weightsObj.cost * costFactor
                ) / (
                    (weightsObj.efficacy + weightsObj.adherence + weightsObj.cost) * 10
                );

                drugObj['value'] = valueScore; //put value score calculated to drugObj
            }

            //consider drug only if it have a value score > 0
            if (drugObj.value > 0) {
                preparedDataObj[drugCount] = drugObj;
                drugCount++;
            }

        }
    }

    return preparedDataObj;
}

/**
 * @author: Pramveer
 * @date: 14 Apr 17
 * @desc: function to get current values of universe relative weights
 */
export let getRelativeWeightValues = () => {

    let efficacy = $('#txtEffWeightTreated').val();
    let adherence = $('#txtAdhWeightTreated').val();
    let cost = $('#txtCostWeightTreated').val();

    return { efficacy: efficacy / 100, adherence: adherence / 100, cost: cost / 100 };
}

/**
 * @author: Pramveer
 * @date: 17 Apr 17
 * @desc: function to check whether universe weights are 0 or not
 */
export let isUniverseWeightsZero = () => {
    let uniWeights = getRelativeWeightValues();

    let isZero = (uniWeights.adherence + uniWeights.cost + uniWeights.efficacy) == 0 ? true : false;

    return isZero;
}

/**
 * @author: Pramveer
 * @date: 18th Apr 17
 * @desc: function to return category name by category id
 */
export let getSubPopulatonNameById = (catId) => {
    let categoryId = catId ? parseInt(catId) : 0;
    let filteredData = _.where(TreatedAnalyticsData, { category_id: catId });

    return filteredData[0].category_name;
}

/*
 * @author: Pramveer
 * @date: 18th Apr 17
 * @desc: function to return category name by category id
 * function to remove objects from array based on the key
 * PARAMETERS
 * initialArray: base array from the objects are to be removed
 * removeArray: array of objects that are to be removed
 * removekey: key name on which the array are to be matched & spliced
 */
export let removeObjectsFromArray = (initialArray, removeArray, removekey) => {
    let defaultArray = _.clone(initialArray);
    for (var i = defaultArray.length - 1; i >= 0; i--) {
        for (var j = 0; j < removeArray.length; j++) {
            if (defaultArray[i] && (defaultArray[i][removekey] === removeArray[j][removekey])) {
                defaultArray.splice(i, 1);
            }
        }
    }
    return defaultArray;
}