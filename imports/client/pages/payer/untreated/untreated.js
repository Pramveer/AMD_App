import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './untreated.html';

import * as subpopUtils from '../../../lib/custom/payer/AdvPayerSPUtils.js';
import * as payerUtils from '../../../lib/custom/payer/payerToolUtilities.js';

//default sort order for Sub population List view
let sortUnTreatedSPListby = 'count';

let untreatedSPData = [],
    allDrugsList = null,
    isComparitiveFilter = false,
    currentFilters = null,
    patientCountSliderData = null,
    UnTreatedPatientsData = null,
    possibleCategories = null,
    isPatientSliderChanged = false;

let untreatedPlanSelect = '';
let untreatedTreatmentSelect = '';
let untreatedTenureSelect = '';
let untreatedCirrhosis = '';

let untreatedPlanSelectProfile = '';
let untreatedTreatmentSelectProfile = '';
let untreatedTenureSelectProfile = '';
let untreatedCirrhosisProfile = '';
UnTreatedAnalyticsData = null;



Template.UnTreatedPatients.rendered = function() {
    isPatientSliderChanged = false;
    //disable export patient button
    $('.exportPatientsSection').css({ 'opacity': '0.6', 'pointer-events': 'none' });


    // Assigning Event for Reset  Functionality
    assignEventForResetFunctionality();


    // Set count of treated patients 
    setTotalPatientCount();

    // Hide and Show appropriate sections in Subpopulation View  -- Need some code cleanup.
    hideAndShowSPSections();

    // Assign event for relative weights sliders.
    assignEventRelatveSliders();


    // Initialize main Session Variable
    initSessionVariables();

    // This event will close all other pouovers if clicked outside of any popover.
    assignEventToCloseAllPopovers();

    // Render Current patinet's data by default.
    renderCurrentPatientDataByDefault();

    // Assign onlick event to open and create the complication rate popup for the first time.
    renderComplicationRatePopup();


    // Assign event to close complication rate popup
    assignEventToCloseComplicationRatePopup();


    // set genotype combo for with current patient's genotype. 
    setGenotypeComboForCurrentPatient();

    //initital selectize
    untreatedPlanSelect = $('.untreatedInsurancePlanSelect').selectize();
    untreatedTreatmentSelect = $('.untreatedTreatment').selectize();
    untreatedTenureSelect = $('#unTreatedSelectTenureValue').selectize();
    untreatedCirrhosis = $('.untreatedCirrhosis').selectize();

    untreatedPlanSelectProfile = $('.untreatedInsurancePlanSelectProfile').selectize();
    untreatedTreatmentSelectProfile = $('.untreatedTreatmentProfile').selectize();
    untreatedTenureSelectProfile = $('#unTreatedSelectTenureValueProfile').selectize();
    untreatedCirrhosisProfile = $('.untreatedCirrhosisProfile').selectize();

    var currPatient = Session.get('selectedPatientData');
    var curTreatment = currPatient[0].Treatment;
    untreatedPlanSelect[0].selectize.setValue('all');
    untreatedPlanSelectProfile[0].selectize.setValue('all');
    let treat = curTreatment == 'Yes' ? 'Naive' : 'Experienced';
    untreatedTreatmentSelect[0].selectize.setValue(treat);
    untreatedCirrhosis[0].selectize.setValue(currPatient[0].Cirrhosis);
    untreatedTenureSelect[0].selectize.setValue(parseInt(ListOfYear[0].year));
    untreatedTreatmentSelectProfile[0].selectize.setValue(treat);
    untreatedCirrhosisProfile[0].selectize.setValue(currPatient[0].Cirrhosis);
    untreatedTenureSelectProfile[0].selectize.setValue(parseInt(ListOfYear[0].year));
};

Template.UnTreatedPatients.helpers({
    'uniUnTreatedQualityIndicators': function() {
        var data = Session.get('uniUnTreatedQualityIndicators');
        if (data) {
            data['adherence'] = isNaN(data['adherence']) ? 0 : data['adherence'];
            data['efficacy'] = isNaN(data['efficacy']) ? 0 : data['efficacy'];
            data['cost'] = isNaN(data['cost']) ? 0 : data['cost'];
            return data;
        } else {
            var obj = {
                adherence: 0,
                efficacy: 0,
                cost: 0,
                adherence_class: 'indicatePositiveValue',
                efficacy_class: 'indicatePositiveValue',
                cost_class: 'indicatePositiveValue',
                affected_adherence: 'Increased',
                affected_efficacy: 'Increased',
                affected_cost: 'Increased'
            }
            return obj;
        }
    },
    'isModelChanged': function() {
        if (Session.get('untreated_isCurrentModelModified')) {
            showSaveButton();
        } else {
            hideSaveButton();
        }
    },
    'renderUnTreatedSafetyQualityChart': function() {
        if (UnTreatedAnalyticsData) {
            subpopUtils.renderUniverseSafetyIndicators('untreated');
        }
    },
    'getListData': function() {
        var data = Session.get('untreatedPat_SPListData');
        if (!data) {
            return [];
        }
        if (data != null && data.length) {
            data.removeValue('count', 0);
            for (var i = 0; i < data.length; i++) {
                data[i]['sequence'] = i + 1;
            }
        }
        return data;
    },
    'iscomplicationDataEmpty': function() {
        //return Session.get('untreatedPat_ComplicationData').length>0?false:true;
        var data = Session.get('untreatedPat_ComplicationData');
        if (data) {
            if (data.length)
                return false;
            else
                return true;
        } else {
            return true;
        }
    },
    'getMedicationComplicationList': function() {
        return Session.get('untreatedPat_SPListData');
    },
    'calculateBestValueFromValues': function(bestValue, value, id) {
        calculateBestValueFromValues(bestValue, value, id);
    },
    'isOptimizedValueGreaterThanZero': function(optimizedValue) {
        if (optimizedValue != 0) {
            return true;
        } else {
            return false;
        }
    },
    'DrugsData': function(data, category_id) {
        var selDrugsWithData;
        category_id = (category_id == undefined ? '' : category_id);
        if (data) {
            selDrugsWithData = subpopUtils.getPreparedDrugsData('untreated' + category_id, data);
        } else {
            selDrugsWithData = subpopUtils.getPreparedDrugsData('untreated' + category_id);
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

                selDrugsWithData[i]['calculatedTotalPayerCost'] = Math.round(parseInt(selDrugsWithData[i]['DrugN']) * (parseFloat(payerCostc)));
                selDrugsWithData[i]['dispalyCalculatedTotalPayerCost'] = commaSeperatedNumber(Math.round(parseFloat(parseInt(selDrugsWithData[i]['DrugN']) * (parseFloat(payerCostc)))));
                selDrugsWithData[i]['calculatedTotalPatientCost'] = Math.round(parseFloat((value * parseFloat(payerCostc)) * 0.2));
                selDrugsWithData[i]['dispalyCalculatedTotalPatientCost'] = commaSeperatedNumber(Math.round(parseFloat((value * parseFloat(payerCostc)) * 0.2)));
                selDrugsWithData[i]['Efficacy']['Efficacy'] = Math.round(selDrugsWithData[i]['Efficacy']['Efficacy']);
                selDrugsWithData[i]['Adherence']['Adherence'] = Math.round(selDrugsWithData[i]['Adherence']['Adherence']);
                selDrugsWithData[i]['Utilization']['Utilization'] = Math.round(selDrugsWithData[i]['Utilization']['Utilization']);
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
    },
    'getPlanList': function() {
        //list of insurance plan
        return ClaimsInsurancePlan;
    },
    'getGenotypeList': function() {
        //list genotype
        return GenotypeList.reactive()
    },
    'checkActive': function(ele) {
        $('.untreatedsubPopulationCategoriesContainer').children().each(function(index) {
            if (index == 0) {
                $(this).trigger('click');
            }
        });
        return 'active';
    },
    'isoptimizeDataIndicators': function(optimizeDataIndicators) {
        if (optimizeDataIndicators) {
            return true;
        } else {
            return false;
        }
    },
    'getListYear': function() {
        var list = [];
        var len = parseInt(ListOfYear[0].year);
        for (var i = 0; i < len; i++) {
            list.push({ "year": i + 1 });
        }
        return list;
    },
    'complicationRateView': function() {
        return Session.get('untreatedPat_ComplicationData');;

    },
    'isDrugChecked': function(drugids) {
        var tabName = 'untreated';
        var drugIDArray = drugids.split(',');
        //treatedPat_ComplicationData
        var checked = isDrugChecked(drugIDArray, 'untreatedPat_SPListData', isComparitiveFilter);
        return checked;
    },
    'isSelected': function(type, data) {
        var currPatient = Session.get('selectedPatientData');
        var curplan = currPatient[0].Insurance;
        var curTreatment = currPatient[0].Treatment;
        var curCirrhosis = currPatient[0].Cirrhosis;
        switch (type) {
            case 'treatment':
                {
                    if (data.trim().toLowerCase() == curTreatment.trim().toLowerCase()) {
                        return 'selected';
                    }

                }
            case 'plan':
                {
                    if (data.trim().toLowerCase() == curplan.trim().toLowerCase()) {
                        return '';
                    }

                }
            case 'cirrhosis':
                {
                    if (data.trim().toLowerCase() == curCirrhosis.trim().toLowerCase()) {
                        return 'selected';
                    }

                }
            case 'time':
                {
                    if (parseInt(data) == parseInt(ListOfYear[0].year)) {
                        return 'selected';
                    }

                }
        }

    },
    'stringifyOptimizedData': function(id) {
        let data = Session.get('untreatedSPSvgData');
        let temp = "untreated" + id + "SvgData";
        let requiredData = '';
        if (data) {
            for (let i = 0; i < data.length; i++) {
                if (data[i][temp]) {
                    requiredData = data[i][temp]
                }
            }
        }

        return requiredData;
    }
});


Template.UnTreatedPatients.events({
    'click .configNewDrug': function(e) {
        $('.selectedDragToCetagoryType').html('');
        $('#newdrugname').val('');
        $('#newcost').val('');
        $('#newefficacy').val('');
        //$('#newsafety').val('');
        $('#newadherence').val('');
        $('#newtreatmentPeriod').val('');
        $('#newselectGenotype').val('');
        $('#selectedDragToCetagoryTypeDataArray').val('');

    },
    'click .untreatedSafety': function(e) {
        $('#' + e.currentTarget.id + '_innerPopup').toggle();
        var temp = $(e.currentTarget);
        if (document.getElementById(e.currentTarget.id + '_innerPopup').style.display == 'none') {
            $(temp.parent()).css({ 'background': 'transparent', 'height': '50px', 'padding-top': '0px', 'margin-top': '0px' });
        } else {
            $(temp.parent()).css({ 'background': 'rgba(128, 128, 128, 0.52)', 'height': '90px', 'padding-top': '10px', 'margin-top': '-10px' });
        }
    },
    'click .chartSubPopulationHeader .tabNavigation li a': function(e) {
        var tabName = $(e.currentTarget).html().toLowerCase();
        $(e.currentTarget).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();

        document.getElementById("anim_loading_theme").style.top = "90%";
        document.getElementById("anim_loading_theme").style.visibility = "visible";
        document.getElementById("overlay").style.display = "block";
        //removeTemplate();
        //if ($("#templateRenderSection").children().length > 0) {
        //    removeTemplate();
        //}

        //insertTemplate(tabName);
        $('.untreatedPatienttemplateSubSection').hide();
        if (tabName === "charts") {
            $('.untreatedPatientchartSection').show();
        } else if (tabName === "sub population") {
            $('.untreatedPatientsubPopulationSection').show();
        }
        document.getElementById("anim_loading_theme").style.visibility = "hidden";
        document.getElementById("overlay").style.display = "none";
        document.getElementById("anim_loading_theme").style.top = "40%";
        highlightTab(tabName);
    },
    'click .untreatedSubPopListViewSwitch': function(e) {
        handleSubPopViewSwitch(e.currentTarget);
    },
    'click .untreatedSubPopLDetailViewSwitch': function(e) {
        handleSubPopViewSwitch(e.currentTarget);
    },
    'click .untreatedApplyUniFilters': function(e) {

        payerUtils.resetSavingsProfile('untreated');
        if (Session.get('untreated_isCurrentModelModified')) {
            Session.set('untreated_editGoTrigger', true);
            showWarningMsgForLoadingModel(0, 'untreated');
        } else {

            // Remover All lgends from Chart Section if any.
            $(".c3-legend-item").remove();

            // showloadingWheel();
            showUniverseLoadingWheel();
            showChartLoadingMask();

            // Main Apply is clicked so we dont need previously stored Drugs.
            isComparitiveFilter = false;

            setRelativeWeightsSliderTo100();
            //call handle filter function
            handleFilterChange();

            //call to fetch patients for patients slider
            getUntreatedPatientsData();
            //reset all variables
            $('.untreated_modelInfoContainer .modelNotesInput').val('');
            $('.untreated_modelInfoContainer .modelNameInput').val('');
            $('.untreated_modelInfoContainer .saveModelButton').attr('data', '');
            hideSaveButton();
            Session.set('untreated_isCurrentModelModified', false);
            Session.set('untreated_isCurrentModelSaved', false);
            Session.set('untreated_currentModelId', null);
        }

    },
     // Click Event for the Go button in the Saving Profile Popup.
    'click .untreatedApplyUniFiltersProfile': function(e) {

        let planType = $('.untreatedInsurancePlanSelectProfile').val(),
            genotypes = getGenotypeFromFiltters('untreatedselectGenotypeProfile'),
            cirrhosis = getCirrhosisFromFilters('untreatedCirrhosisProfile'),
            treatment = getTreatmentFromFilters('untreatedTreatmentProfile'),
            tenureValue = parseInt($('.untreatedtenureProfile').val()),
            allFlag = '';

        if (genotypes[0].toLowerCase() == 'all' && planType == 'all' && treatment == 'all' && cirrhosis == 'all') {
            allFlag = 'all';
        }

        if (genotypes[0].toLowerCase() == 'all') {
            genotypes = [];
            for (var i = 0; i < GenotypeList.length; i++) {
                genotypes.push(GenotypeList[i].hcv_genotype);
            }
        }

        // if ALL is selected in the insurance Plan Select box
        if (planType === 'all') {
            var allPlans = [];
            ClaimsInsurancePlan.forEach(function(rec) {
                allPlans.push(rec['claims_insurancePlan']);
            });
            allPlans = allPlans.join(',');
            planType = allPlans.replace(',', '","');
        }

        var categoryData = {
            genotypes: genotypes,
            treatment: treatment,
            cirrhosis: cirrhosis,
            flag: allFlag
        };

        //get the category id list and category name
        var id_list = payerUtils.getPossibleCatCombination(categoryData);

        var dbParams = {};
        dbParams['ids'] = id_list.split(',');
        dbParams['plans'] = planType;
        dbParams['tenure'] = tenureValue;
        dbParams['patientsType'] = 'untreated';
        dbParams['filteredMedications'] = [];

        payerUtils.resetSavingsProfile('untreated');

        Meteor.call('getAnalyticsDataForPatients', dbParams, (error, result) =>{

            //get payertool data
            let result_data  = preparePayerToolData(id_list,result,false,false,true);

            //append UI for Savings Profile
            subpopUtils.showOurRecomendations('untreated',categoryData,result,undefined,result_data);
        });

    },
    'click .js-ourRecommendationsLinkUnTreated':function(event,template) {        
        $('#untreatedRecommendationsPopup').show();
    },
    'click .js-untreatedRecc-ApplyBtn': function(event,templat) {
        let profUtilizations = [1.0];
        let selectedProf = $('input[name=recommendationsRadio_untreated]:checked').attr('data');

        if(selectedProf.toLowerCase() == 'profile_2') {
            profUtilizations = [0.75,0.25];
        }
        else if (selectedProf.toLowerCase() == 'profile_3') {
            profUtilizations = [0.50,0.25,0.25];
        }

            let planType = $('.untreatedInsurancePlanSelectProfile').val(),
            genotypes = getGenotypeFromFiltters('untreatedselectGenotypeProfile'),
            cirrhosis = getCirrhosisFromFilters('untreatedCirrhosisProfile'),
            treatment = getTreatmentFromFilters('untreatedTreatmentProfile'),
            tenureValue = parseInt($('.untreatedtenureProfile').val()),
            allFlag = '';

        if (genotypes[0].toLowerCase() == 'all' && planType == 'all' && treatment == 'all' && cirrhosis == 'all') {
            allFlag = 'all';
        }

        if (genotypes[0].toLowerCase() == 'all') {
            genotypes = [];
            for (var i = 0; i < GenotypeList.length; i++) {
                genotypes.push(GenotypeList[i].hcv_genotype);
            }
        }

        // if ALL is selected in the insurance Plan Select box
        if (planType === 'all') {
            var allPlans = [];
            ClaimsInsurancePlan.forEach(function(rec) {
                allPlans.push(rec['claims_insurancePlan']);
            });
            allPlans = allPlans.join(',');
            planType = allPlans.replace(',', '","');
        }

        var categoryData = {
            genotypes: genotypes,
            treatment: treatment,
            planType:planType,
            cirrhosis: cirrhosis,
            tenureValue:tenureValue,
            flag: allFlag
        };

        //get the category id list and category name
        var id_list = payerUtils.getPossibleCatCombination(categoryData);

        var dbParams = {};
        dbParams['ids'] = id_list.split(',');
        dbParams['plans'] = planType;
        dbParams['tenure'] = tenureValue;
        dbParams['patientsType'] = 'untreated';
        dbParams['filteredMedications'] = [];

        $('#untreatedRecommendationsPopup').hide();
        showloadingWheel();
        payerUtils.storeFitersData('untreated', categoryData, planType, tenureValue);
        fetchAndRenderData(dbParams, id_list,true,selectedProf);
        setTimeout(function(){
            payerUtils.setSavingsProfile('untreated',selectedProf.toLowerCase());
            handleProfileSelection(profUtilizations);
            setMainFilters(categoryData);
            hideLoadingWheel();
        },500);
        
        collapseSubpopulationDetailView();
    },
    'click .showuntreatedall': function(e) {
        // document.getElementById("anim_loading_theme").style.top = "90%";
        // document.getElementById("anim_loading_theme").style.visibility = "visible";
        // document.getElementById("overlay").style.display = "block";

        // showloadingWheel();
        showUniverseLoadingWheel();
        showChartLoadingMask();

        //make the filters selection to all
        payerUtils.setFiltersToAll('untreated');

        //call handle filter function
        handleFilterChange('all');

        //call to fetch patients for patients slider
        getUntreatedPatientsData('all');

    },
    'click .untreatedsortComplicationRate': function(e) {
        var sortBy = 'drugGroupName';
        var value = $(e.currentTarget).attr('sort');
        var data = Session.get('untreatedPat_ComplicationData');
        if (value == 'complicationCost') {
            sortBy = 'complicationCost';
        } else if (value == 'complicationRate') {
            sortBy = 'complicationRate';
        } else if (value == 'drugGroupName') {
            sortBy = 'drugGroupName';
        }
        $('.untreatedsortComplicationRate').each(function() {
            var tempvalue = $(this).attr('sort');
            if (tempvalue == value) {
                if ($(this).hasClass('sortg')) {
                    $(this).removeClass('sortg');
                    $(this).addClass('sortred');
                }
            } else {
                $(this).removeClass('sortred');
                $(this).addClass('sortg');
            }
            //console.log($(this).hasClass('sortred'));
        });
        if ($('.' + value).hasClass('sortred')) {
            if ($('.' + value).attr('type') == 'asc') {
                data.sort(function(a, b) {
                    return b[sortBy] - a[sortBy];
                });
                $('.' + value).attr('type', 'desc');
            } else if ($('.' + value).attr('type') == 'no') {
                data.sort(function(a, b) {
                    return a[sortBy] - b[sortBy];
                });
                $('.' + value).attr('type', 'asc');
            } else {
                data.sort(function(a, b) {
                    return a[sortBy] - b[sortBy];
                });
                $('.' + value).attr('type', 'asc');
            }
        }
        Session.set('untreatedPat_ComplicationData', data);
        complicationBodyuntreated(); //sort data and append html to modal
    },

    'click .optimizeLink': function(e, template) {
        payerUtils.optimzeSPLinkClick(e.currentTarget);
    },
    'click .untreatedcomplicationsApplybutton': function() {
        isComparitiveFilter = true;
        $('.complicationsClosebutton').trigger('click');
        Session.set('untreated_isCurrentModelModified', true);

        // Remover All lgends from Chart Section if any.
        $(".c3-legend-item").remove();

        // showloadingWheel();
        showUniverseLoadingWheel();
        showChartLoadingMask();

        // List of Medicattion in the Complication rate View.
        var listmed = $('.medcomplistuntreated');

        //filter_med_list  ==== is the List Of Checked medication in the Complication rate view.
        var filter_med_list = '';
        for (var i = 0; i < listmed.length; i++) {
            if (listmed[i].checked == true) {
                //filter_med_list.push(listmed[i].value);
                filter_med_list += listmed[i].value;
                filter_med_list += ',';
            }
        }
        var filter_meds = filter_med_list.split(',');
        filter_meds.pop();
        //console.log('************JOINED ARRAY********');
        //console.log(filter_meds);
        handleFilterChange(filter_meds);

    },
    'click .medcomplistcheckeduntreated': function() {
        if ($('.medcomplistcheckeduntreated').prop('checked') == true) {
            $('.medcomplistuntreated').each(function(d) {
                $(this).prop('checked', true);
            });
        } else {
            $('.medcomplistuntreated').each(function(d) {
                $(this).prop('checked', false);
            });
        }
    },
    'click .medcomplistuntreated': function() {
        var stat = true;
        $('.medcomplistuntreated').each(function(d) {
            if ($(this).prop('checked') == false) {
                stat = false;
            }
        });
        $('.medcomplistcheckeduntreated').prop('checked', stat);
    },
    'input .untreatedpayersearchbox': function(e) {
        var text = $(e.currentTarget).val().toLowerCase();
        $('.complicationRateViewuntreated').each(function(d) {
            var patternd = $(this).text().toLowerCase().replace(/\s/g, '');
            if (patternd.indexOf(text) == -1) {
                $(this).css('display', 'none');
            } else {
                $(this).css('display', 'block');
            }

        });

    },
    'click .untreatedsubpopsort': function(e) {
        // //alert($(e.currentTarget).attr('sort'));
        // var sortBy = 'count';
        // var value = $(e.currentTarget).attr('sort');
        // var data = Session.get('untreatedPat_SPListData');

        // if(value == 'projectedcost') {
        //     sortBy = 'total_cost';
        // }
        // else if(value == 'sortbestcost'){
        //     sortBy = 'best_value_cost';
        // }
        // else if(value == 'sortsaving'){
        //         sortBy = 'savings';
        // }
        // else if(value == 'sortoptimize'){
        //         sortBy = 'optimizedValue';
        // }
        // else if(value == 'category_name'){
        //         sortBy = 'category_name';
        // }
        // else{
        //     sortBy = 'count';
        // }

        // $('.untreatedsubpopsort').each(function(){
        //     var tempvalue = $(this).attr('sort');
        //     if(tempvalue == value){
        //         if($(this).hasClass('sortg')){
        //             $(this).removeClass('sortg');
        //             $(this).addClass('sortred');
        //         }
        //     }
        //     else{
        //         $(this).removeClass('sortred');
        //         $(this).addClass('sortg');
        //     }
        //     //console.log($(this).hasClass('sortred'));
        // });
        // //remove all active classes
        // $('.untreateddetailViewLink').each(function(index){
        //     $(this).removeClass('active');
        // });
        // //hide all subpopulation info
        // $('.untreatedSubPopulationView-ListBody .subPopulationListViewDetailView').each(function(index){
        //     $(this).attr('style','display:none');
        // });
        // if($('.untreated'+value).hasClass('sortred')){
        //     if($('.untreated'+value).attr('type') == 'asc'){
        //         if(value == 'category_name'){
        //             data.sort(sortAlphaNumDesc);
        //         }
        //         else{
        //             data.sort(function(a, b) {
        //                 return b[sortBy] - a[sortBy];
        //             });
        //         }
        //         $('.untreated'+value).attr('type','desc');
        //     }
        //     else if($('.untreated'+value).attr('type') == 'no'){
        //          if(value == 'category_name'){
        //             data.sort(sortAlphaNumDesc);
        //         }
        //         else{
        //             data.sort(function(a, b) {
        //                 return b[sortBy] - a[sortBy];
        //             });
        //         }
        //          $('.untreated'+value).attr('type','asc');
        //     }
        //     else{
        //          if(value == 'category_name'){
        //             data.sort(sortAlphaNumAsc);
        //         }
        //         else{
        //             data.sort(function(a, b) {
        //                 return a[sortBy] - b[sortBy];
        //             });
        //         }
        //          $('.untreated'+value).attr('type','asc');
        //     }
        // }     
        // Session.set('untreatedPat_SPListData',data);
    },
    'click .untreateddetailViewLink': function(e, template) {
        var ele = e.currentTarget;
        var categoryName = $(ele).attr('data');
        var category_id = $(ele).attr('identifier');
        $('.untreatedTotalFilteredPatients').html(Session.get('untreatedTotalPatients'));

        var isViewOpen = $('.untreatedlistDetailView_' + category_id).css('display') == 'block' ? true : false;

        //detail view show and hide
        if (isViewOpen) {
            $('.untreatedlistDetailView_' + category_id).hide();
            $(ele).removeClass('active');
        } else {
            $('.untreatedlistDetailView_' + category_id).show();
            $(ele).addClass('active');

            if ($(ele).children().find('.isOptimizedSection').length > 0) {
                var me = $(ele).children().find('.isOptimizedSection')[0];
                var temp = $(me).attr('onclick').split('(').join('').split(')').join('').split(',');
                reRenderOptimizeData(me, 'list', parseInt(temp[2]), parseInt(temp[3]), parseInt(temp[4]));
            } else {
                renderSubPopulationSingleCategory(ele);
            }
        }

    },
    'change .untreatedSubPopulationList-SortCombo': function(e, template) {
        var sortBy = 'count';
        var value = $(e.currentTarget).val();
        var data = Session.get('untreatedPat_SPListData');
        if (value == 'projectedCost') {
            sortBy = 'optimizedValue';
        }
        data.sort(function(a, b) {
            return a[sortBy] - b[sortBy];
        });
        Session.set('untreatedPat_SPListData', data);

        //trigger the first click of the Categories List
        setTimeout(function() {
            $('.untreatedSubPopulationCategoriesItem:first-child').trigger('click');
        }, 200);
    },
    'click .untreatedSubPopulationCategoriesItem': function(e, template) {
        $('.untreatedSubPopulationCategoriesItem').removeClass('active');
        $(e.currentTarget).addClass('active');
        renderSubPopulationCategoriesItem(e.currentTarget);
    },
    'click .untreatedDetailedAnalytics': function(e) {

        $('#untreatedSubpopulationTab').css('display', 'block');
        $('#untreatedSubpopulationTab').addClass('active').siblings().removeClass('active');

        e.preventDefault();

        $("#anim_loading_theme").css("top", "90%");
        $("#anim_loading_theme").css("visibility", "visible");
        $("#overlay").show();

        $('.untreatedPatienttemplateSubSection').hide();
        $('.untreatedPatientchartSection').hide();
        $('.untreatedPatientsubPopulationSection').show();

        var elem = $('#untreatedSubpopulationTab');
        smooth_scroll_to(elem);

        $("#anim_loading_theme").css("top", "40%");
        $("#anim_loading_theme").css("visibility", "hidden");
        $("#overlay").hide();
        highlightTab("sub population");
    },
    'click .untreatedsafecheck': function() {
        //if($('.treatedsafecheck')[0].checked == true){
        /*  document.getElementById("anim_loading_theme").style.top = "90%";
          document.getElementById("anim_loading_theme").style.visibility = "visible";
          document.getElementById("overlay").style.display = "block";
          handleFilterChange();*/
        // }

    },
    'change #unTreatedPatSlider': function(e) {
        let count = $(e.currentTarget).val();
        Session.set('untreated_isCurrentModelModified', true);
        handlePatientSlider(count);
    },
    'click .exportPatientsData': function(e) {
        exportPatientsData(e.currentTarget);
    },
    'click .untreated_saveModelContainer .js-saveCurrentModel': function() {
        // SaveCurrentModel();
        // $('.saveModelNote').val('');
        // $('#saveModelName').val('');
    },
    'click .untreated_saveModelContainer #js-saveModel': function() {
        Template.UnTreatedPatients.SaveCurrentModel();
    },
    'click .untreated_saveModelContainer .js-showModelDetails': function() {
        showModelDetails();
        $('.untreated_saveModelContainer .js-showModelDetails').hide();
    },
    'click .untreated_saveModelContainer .js-hideModelDetails': function() {
        hideModelDetails();
        setTimeout(function() {
            $('.untreated_saveModelContainer .js-showModelDetails').show();
        }, 400);
    },

    'click .untreated_saveModelContainer .js-LoadCurrentModel': function() {
        Template.UnTreatedPatients.loadSavedModel();
    },
    'click .untreated_saveModelContainer .loadSavedModel': function() {
        listSavedModels();
    },
});

Template.UnTreatedPatients.destroyed = function() {
    untreatedSPData = [];
    allDrugsList = null;
    isComparitiveFilter = false;
}


function highlightTab(tabName) {
    $(".untreatedPatient .tabNavigation li").each(function(i) {
        if ($(this).children('a').html().toLowerCase() === tabName) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}
//Calculate of Size Payer. 
Template.UnTreatedPatients.calculateSizePayer = function(minimum, maximum, populationSize, totalCount, previousAllocatedSize) {
    var diffrenceInSize = 12 / (totalCount - 2);
    return previousAllocatedSize + diffrenceInSize;
};

Template.UnTreatedPatients.sortNumberPayer = function(a, b) {
    return a - b;
};

//calculate Median value chart 
Template.UnTreatedPatients.calculateMedianPayer = function(dataArray) {
    //    dataArray.sort();
    dataArray.sort(Template.UnTreatedPatients.sortNumberPayer);
    var nthValue = Math.floor(dataArray.length / 2);

    if (dataArray.length % 2 === 0) {
        return (dataArray[nthValue - 1] + dataArray[nthValue]) / 2;
    } else {
        return dataArray[nthValue];
    }
};


function handleSubPopViewSwitch(ele) {
    //console.log($(ele));
}

// handle the event to click on change filter for untreated patient.
// This Flag Comtains the list of medication if this function has been called by hitting the apply button of complication rate view.
let handleFilterChange = (complicationRateDrugs) =>{

    //set the patient slider data to null
    patientCountSliderData = null;
    isPatientSliderChanged = false;

    // Show and hide subpopulation section and Remove Active classes
    removeActiveClassFromLists();
    showSPView();
    showSPlistView();
    hideSPDetailView();

    let planType = genotypes = treatment = cirrhosis = tenureValue = '';

    planType = getPlanTypeFromFilters();
    genotypes = getGenotypeFromFiltters();
    treatment = getTreatmentFromFilters();
    cirrhosis = getCirrhosisFromFilters();
    tenureValue = getLastYearValue();

    setGenotypeComboForProfileSection(genotypes,cirrhosis,treatment,planType,tenureValue);

    let flag1 = '';
    //if ALL is seleccted in the Genotype Selectbox Plan and Treatment and Cirrhosis.
    if (genotypes[0].toLowerCase() == 'all' && $('.untreatedInsurancePlanSelect').val() == 'all' && $('.untreatedTreatment').val() == 'all' && $('.untreatedCirrhosis').val() == 'all') {
        flag1 = 'all';
    }

    //if all is selected in the genotype Combo.
    if (genotypes[0].toLowerCase() == 'all') {
        genotypes = [];
        for (var i = 0; i < GenotypeList.length; i++) {
            genotypes.push(GenotypeList[i].hcv_genotype);
        }
    }

    // if ALL is selected in the insurance Plan Select box
    if (planType === 'all') {
        var allPlans = [];
        ClaimsInsurancePlan.forEach(function(rec) {
            allPlans.push(rec['claims_insurancePlan']);
        });
        allPlans = allPlans.join(',');
        planType = allPlans.replace(',', '","');
    }

    var categoryData = {
        genotypes: genotypes,
        treatment: treatment,
        cirrhosis: cirrhosis,
        flag: flag1
    };

    //set current filters
    currentFilters = categoryData;
    var category_data = payerUtils.getPossibleCatCombination(categoryData);
    var id_list = category_data;
    //set possible categories 
    possibleCategories = id_list;

    var filter_med_list = [];
    if (isComparitiveFilter && complicationRateDrugs != undefined && complicationRateDrugs != 'all') {
        filter_med_list = complicationRateDrugs;
    }

    // Not In Use
    // var safe_check = 'no';
    // if(isComparitiveFilter){
    //      safe_check = 'safe';
    // }



    //call the helper function get filtered data
    var dbParams = {};
    dbParams['ids'] = id_list.split(',');
    dbParams['plans'] = planType;
    dbParams['tenure'] = tenureValue;
    dbParams['patientsType'] = 'untreated';
    dbParams['filteredMedications'] = filter_med_list;

    payerUtils.storeFitersData('untreated', categoryData, planType, tenureValue);

    fetchAndRenderData(dbParams, id_list);

}

// Supporting Functions
function getPlanTypeFromFilters() {
    return $('.untreatedInsurancePlanSelect').val()
}

function getGenotypeFromFiltters(domId) {
    let genotypes = '',
        id = domId ? domId:'untreatedselectGenotype';

    //get text data from mutlisselect combo
    $('#'+id+' .multiSel').children().each(function(index) {
        genotypes += $(this).html().trim();
    });
    //remove last comma and change the genotype to array
    genotypes = genotypes[0] == ',' ? genotypes.substring(1, genotypes.length) : genotypes;
    genotypes = genotypes.split(',');
    return genotypes;
}

function getTreatmentFromFilters(domCls) {
    let cls = domCls ? domCls: 'untreatedTreatment',
        treatment = $('.'+cls).val();

    if (treatment == 'all') {
        treatment = 'Naive,Experienced';
    }
    treatment = treatment.split(','); // Converting it into an array.
    return treatment;
}

function getCirrhosisFromFilters(domCls) {
    let id = domCls ? domCls : 'untreatedCirrhosis',
        cirrhosis = $('.'+id).val();

    if (cirrhosis == 'all') {
        cirrhosis = 'Yes,No';
    }
    cirrhosis = cirrhosis.split(','); // Converting it into an array.
    return cirrhosis;
}

    function getLastYearValue() {
        return $('#unTreatedSelectTenureValue').val(); //get year value
    }




function renderCurrentPatientDataByDefault() {

    // Remover All lgends from Chart Section if any.
    $(".c3-legend-item").remove();

    //showloadingWheel();
    showUniverseLoadingWheel();
    showChartLoadingMask();

    showSPView();
    removeActiveClassFromLists();
    setTimeout(function() {
        showSPlistView();
        hideSPDetailView();
    }, 200);


    var tenureValue = parseInt(ListOfYear[0].year) * 12;

    var allPlans = [];
    ClaimsInsurancePlan.forEach(function(rec) {
        allPlans.push(rec['claims_insurancePlan']);
    });
    
    // var currPatient = Session.get('selectedPatientData');
    // allPlans.push(currPatient[0].Insurance);
    allPlans = allPlans.join(',');
    var planType = allPlans.replace(',', '","');

    var category_id = Session.get('category_id');
    category_id = category_id.toString();

    //call the helper function get filtered data
    var dbParams = {};
    dbParams['ids'] = category_id.split(',');
    dbParams['plans'] = planType;
    dbParams['tenure'] = tenureValue;
    dbParams['patientsType'] = 'untreated';
    dbParams['filteredMedications'] = [];

    // storeFitersData('treated', dbParams);
    // console.log(selectedFilters);

    var currentPatient = getCurrentPatientData();
    var treatment = currentPatient.Treatment == "Yes" ? "Naive" : "Experienced";
    var categoryData = {
        genotypes: currentPatient.Genotype.split(),
        treatment: treatment.split(),
        cirrhosis: currentPatient.Cirrhosis.split(),
        flag: false
    };

    //set current filters
    currentFilters = categoryData;

    payerUtils.storeFitersData('untreated', categoryData, planType, tenureValue);
    fetchAndRenderData(dbParams, category_id);

    //call to fetch patients for patients slider
    getUntreatedPatientsData();

}


function fetchAndRenderData(dbParams, id_list,profilecheck,selectedProf) {
    var changeDrugData = false;

    //check for filter applied or not
    if (!(isComparitiveFilter)) {
        changeDrugData = true;
    }

        //reset the savings profile
    if(!profilecheck)
        payerUtils.resetSavingsProfile('untreated');

    Meteor.call('getAnalyticsDataForPatients', dbParams, function(error, result) {
        // console.log('*************Data Fetched fFom Server*****************');
        // console.log(result);
        if (!result) {
            sAlert.closeAll();
            sAlert.error('No Data Found for current selection! Please change filters', { timeout: 2500, onClose: function() {}, effect: 'bouncyflip', html: true, position: 'top-left' });
            return;
        }
        UnTreatedAnalyticsData = result;
        Session.set('untreated_category_id_list', id_list); //get id_list from Session

        preparePayerToolData(id_list, result, changeDrugData);

        //refresh the universe quality indicators
        var optimizedData = Session.get('untreatedPat_SPListData');
        var reactive_var = 'uniUnTreatedQualityIndicators';


        renderTheData(untreatedSPData, optimizedData, reactive_var);

        //append UI for Savings Profile
        payerUtils.resetSavingsProfile('untreated');
        subpopUtils.showOurRecomendations('untreated',currentFilters,UnTreatedAnalyticsData,selectedProf);

        //return result;
    });
}

function renderTheData(untreatedSPData, optimizedData, reactive_var) {
    //console.log(untreatedSPData);
    payerUtils.renderUniverseQualityIndicators(untreatedSPData, optimizedData, reactive_var);


    //hide load mask
    hideLoadingWheel();
    hideUniverseLoadingWheel();
    setTimeout(function() {
        //console.log(untreatedSPData);
        //render charts for the tab
        payerUtils.renderChartsForTab('untreated', untreatedSPData);

        hideChartLoadingMask();
    }, 300);

    //show the subpopulation section
    $('.untreatedSubpopulationWrapper').show();

    // //set tenure value on the chart
    // var str = $('#unTreatedSelectTenureValue').val() == "1" ? 'Month':'Months';
    // $('.untreatedTenure').html('Last '+$('#unTreatedSelectTenureValue').val()+' ' +str)

    // $('.untreatedsubPopulationCategoriesContainer').html('Last '+$('#unTreatedSelectTenureValue').val()+' ' +str);
    // $('#untreatedyearvalue').html(tenureValue);

}


//render sub population data
let renderSubPopulationSingleCategory = (obj) =>{
    //show load mask
    showloadingWheel();

    let ids = $(obj).attr('data');
    let cat_id = $(obj).attr('identifier');
    $('.untreated' + cat_id + 'SubCategoryInfo-PatientCategory').html(ids);
    let data = [];
    if (patientCountSliderData) {
        data = patientCountSliderData;
    } else {
        data = UnTreatedAnalyticsData;
    }
    Meteor.call('HcvAnalyticsTreatedBySingleCetagory', [cat_id, data], function(err, res) {
        if (res.length > 0) {
            $('.untreated' + cat_id + 'ThisCategoryPatients').html(res[0]['total']);
        } else {
            $('.untreated' + cat_id + 'ThisCategoryPatients').html(0);
        }

        res = refineUtilization(res,cat_id);
        let DrugsData = Template.UnTreatedPatients.__helpers.get('DrugsData')(res, cat_id);
        renderSvgChartForSissionDataPayer('untreated' + cat_id, 'Cost', 'Efficacy', '.dimpleMapsContainerForPayer-untreated' + cat_id);
        subpopUtils.DrawSPDrugInfoTableBody('untreated' + cat_id, DrugsData);

        //hide load mask
        hideLoadingWheel();
    });
}

  //function to set Utilization & count
let refineUtilization = (backendData,catID) =>{
        let resClone = [],
        baseData = Session.get('untreatedPat_SPListData'),
        filteredDrugData = _.where(baseData,{category_id:parseInt(catID)})[0]['data'];

        for(let i=0;i<backendData.length;i++) {
            let json = _.clone(backendData[i]),
                matchedDrug = _.where(filteredDrugData,{medication:json['medication'],period:json['treatment_period']})[0];
            if(matchedDrug != undefined){
                json['utilization'] = matchedDrug['utilization'];
                resClone.push(json);
            }
            else{
                resClone.push(backendData[i]);
            }
            
            //json['count'] = matchedDrug['count'];
                
            
        }
        return resClone;
}

// This functions takes the Row data and Identifies all possible subpopulation.
// We calculate all values score best value drug and saving fr all the subpopulation and keep that data into a session variable.
// We also calculate Universe view Expenses and Savings and Apply it into the Universe view.
function preparePayerToolData(id, analyticsdata, changeDrugData, isLoadedModel,recommedationFlag) {
    var id_list = id.split(',');
    var prepareddata = [];
    var AnalyticsData = analyticsdata;

    var sum_score = 0; //for all categories
    var best_score_cat = 0; //for all categories
    var total_savings = 0;
    var total_cost_cat = 0;
    var best_value_cost_cat = 0;
    var total_pop = 0;
    var valuegap = 0;
    var savings_category = {};
    //loop through category id to calculate savings for all categories in list
    var id_count = 0;
    for (var i = 0; i < id_list.length; i++) {
        //get data for particular category
        var data = null;
        if (isPatientSliderChanged)
            data = _.where(AnalyticsData, { category_id: parseInt(id_list[i]) });
        else
            data = _.where(AnalyticsData, { category_id: parseInt(id_list[i]) });

        data = data.filter(function(item) {
            return item.value != null && item.count != 0;
        });
        //calculation for value score and savings
        if (data.length > 0) { //check if it contains data for category or not
            id_count += 1;
            var best_score = 0;
            var total_cost = 0;
            var sum_value_score = 0;
            var best_score_cost = 0;
            var total = 0;
            var category_data = [];
            var json = {};
            savings_category[i] = {};
            var id = 0;

            //calculation of score for a single category
            for (var j = 0; j < data.length; j++) {

                var temp = {};
                temp['medication'] = data[j].medication;
                temp['cost'] = data[j].cost;
                temp['efficacy'] = data[j].efficacy;
                temp['adherence'] = data[j].adherence;
                temp['utilization'] = data[j].utilization;
                temp['value'] = data[j].value;
                temp['safety'] = data[j].safety;
                temp['count'] = data[j].count;
                temp['safe'] = data[j].safe_check;
                var medid = data[j].drugid;

                if (isComparitiveFilter == true)
                    temp['checked'] = "checked";
                else {
                    temp['checked'] = "";
                }

                temp['drugid'] = medid;
                temp['period'] = data[j].treatment_period;
                temp['comp_value'] = (data[j].comp_value).toFixed(2);
                temp['compli_cost'] = commaSeperatedNumber(parseInt(data[j].compli_cost));
                best_score = data[j].best_value;
                best_score_cost = data[j].best_cost;
                total = data[j].total;
                sum_value_score += data[j].value;
                category_data.push(temp);
                total_cost += data[j].cost * data[j].count;
                id = data[j].category_id;
            }

            json['data'] = category_data;
            json['count'] = total;
            json['category_id'] = parseInt(id);
            json['category_name'] = category_name_list[parseInt(id) - 1];
            json['total_cost'] = total_cost;
            json['total_cost_display'] = commaSeperatedNumber(json['total_cost']);
            json['best_value_cost'] = best_score_cost * total;
            json['best_value_cost_display'] = commaSeperatedNumber(json['best_value_cost']);
            json['savings'] = total_cost - best_score_cost * total;
            json['savings_display'] = commaSeperatedNumber(json['savings']);
            best_score_cat += best_score;
            var observedvalue = (data.length <= 0 ? 0 : (sum_value_score / data.length));
            sum_score += observedvalue;
            total_cost_cat += total_cost;
            json['optimizedValue'] = 0;
            json['optimizedValue_display'] = commaSeperatedNumber(json['optimizedValue']);
            best_value_cost_cat += best_score_cost * total;
            total_savings += total_cost - best_score_cost * total;
            total_pop += total;
            prepareddata.push(json);
        }
    }
    if(!recommedationFlag){
            if (id_count != 0) {
                sum_score = sum_score / id_count;
                best_score_cat = (best_score_cat / id_count).toFixed(2);
                valuegap = best_score_cat - sum_score;
                //set the savings on display page
                $('.untreatedcurrent_best').html(sum_score.toFixed(2));
                $('.untreatedavgbest').html(best_score_cat);
                $('.untreatedvaluegap').html(valuegap.toFixed(2));
            }

            $('.untreatedcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
            $('.untreatedcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
            $('.untreatedcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));

            //set data for display in universe Section
            let UniverseSavingData = {
                                        'TotalCost':Math.round(total_cost_cat),
                                        'Saving':Math.round(total_savings),
                                        'BestValueUtilization':Math.round(best_value_cost_cat),
                                        'QualityIndicators':[]
                                     }
            Session.set('UnTreated_UniverseSavingData',UniverseSavingData);
            //calculate savings per patient
            var saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
            $('.untreatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(saving_perpatient));


            if (!isPatientSliderChanged) {
                $('#untreatedCurrentCount').html(commaSeperatedNumber(total_pop));

                $('#unTreatedPatSlider').prop('disabled', false);
                $('#unTreatedPatSlider').attr('max', total_pop); //update the slider with max value
                $('#unTreatedPatSlider').val(total_pop); //update the slider with max value
                $('#unTreatedPatSlider').rangeslider('update', true); //set the update property of slider to true

                $('.unTreatedPatSliderCount').html(total_pop);
                $('.exportPatientsSection').css({ 'opacity': '1', 'pointer-events': 'all' });
            }
            $('.untreatedTotalFilteredPatients').html(total_pop);

            //update the subpopulation list table        
            prepareddata.sort(sortAlphaNumAsc);
            //complication rate data

            if (!isLoadedModel) {
                if (changeDrugData) {
                    var finalData = [];
                    var dataArray = _.groupBy(UnTreatedAnalyticsData, 'medication');;
                    for (var key in dataArray) {
                        var drugData = dataArray[key];
                        var json = {},
                            totalComp_Cost = 0,
                            totalComp_Count = 0,
                            treatment_Count = 0,
                            drugIds = [];
                        for (var i = 0; i < drugData.length; i++) {
                            totalComp_Cost += drugData[i]['compli_cost'];
                            totalComp_Count += drugData[i]['total_reaction_count'];
                            treatment_Count += drugData[i]['treatment_period'] * drugData[i]['count'] * 7;
                            drugIds.push(drugData[i]['drugid']);
                        }
                        json['drugGroupName'] = key;
                        json['complicationRate'] = getComplicationsForDrug(totalComp_Count, treatment_Count);
                        json['complicationRateLabel'] = json['complicationRate'].toFixed(2)
                        json['complicationCost'] = totalComp_Cost;
                        json['complicationCostLabel'] = commaSeperatedNumber(Math.round(totalComp_Cost));
                        json['drugIds'] = drugIds.join(',');
                        finalData.push(json);
                    }
                    //store complication rate data in  session
                    Session.set('untreatedPat_ComplicationData', finalData);
                }
                Session.set('untreatedPat_SPListData', prepareddata);
            }
            Session.set('untreatedTotalPatients', total_pop);
            //set the filtered data in the variable to compute the difference with the optimized one
            untreatedSPData = prepareddata;
            var parentSelector = 'untreatedSubPopulationList-Footer';
            $('.' + parentSelector + ' .SPList-totalPatients').html(total_pop);
            $('.' + parentSelector + ' .totalProjectedCost').html('$ ' + commaSeperatedNumber(total_cost_cat));
            $('.' + parentSelector + ' .totalBestCost').html('$ ' + commaSeperatedNumber(best_value_cost_cat));
            $('.' + parentSelector + ' .totalSavingsOppurtunity').html('$ ' + commaSeperatedNumber(total_savings));
    }
    else{
        return prepareddata;
    }
}

//function to calculate savings and values based on weight applied
//here we are passing id list of patients
Template.UnTreatedPatients.valuecalculatorAdvanced = function(isLoadedModel) {

    //return if filters return blank data
    if (untreatedSPData.length == 0) {
        return;
    }
    let efficacy = $('#txtEffWeightuntreated').val();
    let adherence = $('#txtAdhWeightuntreated').val();
    let cost = $('#txtCostWeightuntreated').val();

    w1 = efficacy / 100; //get efficacy slider value 
    w2 = adherence / 100; //get adherence slider value 
    w3 = cost / 100; //get cost slider value
    //set all value scoresand savings to zero if no filters applied i.e 0%
    if (w1 === 0 && w2 === 0 && w3 === 0) {
        $(".alls").html(0);
        $('.untreatedcurrent_best').html(0); //set observed value
        $('.untreatedavgbest').html(0); //set average best score
        $('.untreatedvaluegap').html(0); // set value gap
        $('.untreatedcardValueBest').html('$ ' + commaSeperatedNumber(0)); //set value best savings to 0
        $('.untreatedcardValueGap').html('$ ' + commaSeperatedNumber(0)); //set savings opportunity lost 
        $('.untreatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(0)); //set savings per ptient to 0
        return;
    }
    var id_list = Session.get('untreated_category_id_list').split(',');
    //var id_list = id.split(','); //slit id to array
    var prepareddata = []; //data to store values
    var AnalyticsData = []; //get data from Subscription variable
    if (patientCountSliderData) {
        AnalyticsData = patientCountSliderData;
    } else {
        AnalyticsData = UnTreatedAnalyticsData;
    }
    var sum_score = 0; //for all categories
    var best_score_cat = 0; //for all categories
    var total_savings = 0; //total savings for all categories
    var total_cost_cat = 0; //total cost for all categories
    var best_value_cost_cat = 0; //best value cost across category
    var total_pop = 0; //total population of category
    var savings_category = {}; //dictionary to contain calculated values
    var valuegap = 0;
    //loop through id list to get categories data
    var id_count = 0;
    for (var i = 0; i < id_list.length; i++) {

        //get category data for particular category id
        var data = _.where(AnalyticsData, { category_id: parseInt(id_list[i]) });
        //filter data if it contains null value score and count
        data = data.filter(function(item) {
            return item.value != null && item.count != 0;
        });
        //console.log('*****************started***********');
        if (data.length > 0) { //check if it contains data for category or not
            id_count += 1;
            var best_score = 0; //set best_score
            var total_cost = 0; //set total_cost
            var sum_value_score = 0; //set sum of all value score of a category
            var best_score_cost = 0; //best score cost for a category
            var total = 0; //total length of population for category
            var category_data = []; //arrayto store data
            var json = {};
            savings_category[i] = {};
            var id = 0; //set id = 0;
            //prepareddata[i]['data'] = category_data; //update category data to 
            for (var j = 0; j < data.length; j++) {
                var temp = {};
                temp['medication'] = data[j].medication; //set medication
                temp['cost'] = data[j].cost; //set cost
                temp['efficacy'] = data[j].efficacy; //set efficacy
                temp['adherence'] = data[j].adherence; //set adherence
                temp['utilization'] = data[j].utilization; //set utilization
                temp['safety'] = data[j].safety; //set safety 
                temp['count'] = data[j].count; //set medication count
                temp['safe'] = data[j].safe_check;
                var medid = data[j].drugid;
                if (isComparitiveFilter == true)
                    temp['checked'] = "checked";
                else {
                    temp['checked'] = "";
                }
                temp['drugid'] = medid;
                temp['period'] = data[j].treatment_period;
                temp['comp_value'] = (data[j].comp_value).toFixed(2);
                temp['compli_cost'] = commaSeperatedNumber(parseInt(data[j].compli_cost));
                //calculate cost factor for value score calculation
                //generalise cost
                var cost_factor = ((data[j].max_cost - data[j].cost) / data[j].max_cost) * 100;
                //calculate value score based on weights applied 
                var value = (w1 * data[j].efficacy + w2 * data[j].adherence + w3 * cost_factor) / ((w1 + w2 + w3) * 10);
                //check for best value score and set best score cost to the cost of current drug
                if (best_score <= value) {
                    best_score = value;
                    best_score_cost = data[j].cost;
                }
                temp['value'] = value; //put value score calculated to json
                total = data[j].total; //get total length of medication
                sum_value_score += value; //sum the value score
                category_data.push(temp); //put the json in category_data array
                total_cost += data[j].cost * data[j].count; //sum the total cost of all medication in a category

                id = data[j].category_id; //get category id
                //console.log(value,w1,w2,w3,data[j].efficacy,data[j].adherence,cost_factor);
            }
            //console.log(best_score,best_score_cost);
            json['data'] = category_data;
            json['count'] = total;
            json['category_id'] = parseInt(id);
            json['category_name'] = category_name_list[parseInt(id) - 1];
            json['total_cost'] = total_cost;
            json['total_cost_display'] = commaSeperatedNumber(json['total_cost']);
            json['best_value_cost'] = best_score_cost * total;
            json['best_value_cost_display'] = commaSeperatedNumber(json['best_value_cost']);
            json['savings'] = total_cost - best_score_cost * total;
            json['savings_display'] = commaSeperatedNumber(json['savings']);
            best_score_cat += best_score; //calculate sum of best scores
            var observedvalue = sum_value_score / data.length; //get observed value score
            sum_score += observedvalue; //sum of value scores observed
            total_cost_cat += total_cost; //total cost across all categories
            best_value_cost_cat += best_score_cost * total; //best value cost of all categories
            total_savings += total_cost - best_score_cost * total; //savings for all categories
            total_pop += total; //total length of all categories i.e patient count 
            json['optimizedValue'] = 0;
            json['optimizedValue_display'] = commaSeperatedNumber(json['optimizedValue']);
            prepareddata.push(json);
        }
        //console.log('*****************end***********');  
    }
    if (id_count != 0) {
        sum_score = sum_score / id_count; //average score for all categories
        best_score_cat = (best_score_cat / id_count).toFixed(2); //average best score for all categories
        valuegap = best_score_cat - sum_score; // calculate value gap
        //set the values on UI
        //console.log(sum_score,best_score_cat,valuegap);
        $('.untreatedcurrent_best').html(sum_score.toFixed(2));
        $('.untreatedavgbest').html(best_score_cat);
        $('.untreatedvaluegap').html(valuegap.toFixed(2));
    }


    $('.untreatedcardValueBest').html('$ ' + commaSeperatedNumber(best_value_cost_cat));
    $('.untreatedcardValueObserved').html('$ ' + commaSeperatedNumber(total_cost_cat));
    $('.untreatedcardValueGap').html('$ ' + commaSeperatedNumber(total_savings));
    var saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
    $('.untreatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(saving_perpatient));
    $('#untreatedCurrentCount').html(commaSeperatedNumber(total_pop));
    $('.untreatedTotalFilteredPatients').html(total_pop);

    // if this is a loaded model then we do not want ot set the data into session variable as we have already done that.
    if (!isLoadedModel) {
        Session.set('untreatedPat_SPListData', prepareddata);
    }

    Session.set('untreatedTotalPatients', total_pop);
    var parentSelector = 'untreatedSubPopulationList-Footer';
    $('.' + parentSelector + ' .SPList-totalPatients').html(total_pop);
    $('.' + parentSelector + ' .totalProjectedCost').html('$ ' + commaSeperatedNumber(total_cost_cat));
    $('.' + parentSelector + ' .totalBestCost').html('$ ' + commaSeperatedNumber(best_value_cost_cat));
    $('.' + parentSelector + ' .totalSavingsOppurtunity').html('$ ' + commaSeperatedNumber(total_savings));

}


function getUntreatedPatientsData(flag) {
    var filterParams = {},
        insurancePlans = $('.untreatedInsurancePlanSelect').val();

    var possibleCats = payerUtils.getPossibleCatCombination(currentFilters);
    if (insurancePlans === 'all') {
        var allPlans = [];
        ClaimsInsurancePlan.forEach(function(rec) {
            allPlans.push(rec['claims_insurancePlan']);
        });
        allPlans = allPlans.join(',');
        insurancePlans = allPlans.replace(',', '","');
    }
    filterParams['ids'] = possibleCats;
    filterParams['plans'] = insurancePlans;

    Meteor.call('getUnTreatedPatientsSliderData', filterParams, function(error, result) {

        if (result.length) {
            UnTreatedPatientsData = result;
        }
    });
}

//function to handle the slide event for the patients count slider.
function handlePatientSlider(count) {
    //return if no filter is applied
    if (!currentFilters)
        return;

    //show load mask
    $('#anim_loading_theme').css('top', '90%');
    $('#anim_loading_theme').css('visibility', 'visible');
    $('#overlay').show();

    var slicedPatient = parseInt(count);
    if (slicedPatient < 1) {
        patientCountSliderData = null;
        //hide load mask
        $('#anim_loading_theme').css('top', '40%');
        $('#anim_loading_theme').css('visibility', 'hidden');
        $('#overlay').hide();
        return;
    }

    var data = prepareSelectedPatientsData(slicedPatient);
    patientCountSliderData = data;
    //console.log(data);
    var possibleCats = payerUtils.getPossibleCatCombination(currentFilters);
    isPatientSliderChanged = true;
    preparePayerToolData(possibleCats, data);


    //refresh the universe quality indicators
    var optimizedData = Session.get('untreatedPat_SPListData');
    var reactive_var = 'uniUnTreatedQualityIndicators';
    payerUtils.renderUniverseQualityIndicators(untreatedSPData, optimizedData, reactive_var);

    setTimeout(function() {
        //render charts for the tab
        payerUtils.renderChartsForTab('untreated', untreatedSPData);
        //hide load mask
        $('#anim_loading_theme').css('top', '40%');
        $('#anim_loading_theme').css('visibility', 'hidden');
        $('#overlay').hide();
    }, 300);


    if (!(isComparitiveFilter)) {
        allDrugsList = Tracker.nonreactive(function() {
            return UnTreatedAnalyticsData;
        });
    }

    //show sub population list view section
    $('.untreatedSubPopulationListView-Container').show();

    //hide the sub population detail view
    $('.untreatedSubPopulationDetailView-Container').hide();
}

//function to prepare the data for the selected patients on the slider
function prepareSelectedPatientsData(patientCount) {
    var patientsData = [];
    patientsData = jQuery.extend(true, [], UnTreatedPatientsData);
    var baseData = UnTreatedAnalyticsData;

    patientsData.splice(patientCount);

    //group by categories
    patientsData = _.groupBy(patientsData, 'category_id');
    baseData = _.groupBy(baseData, 'category_id');

    var finalData = {},
        drugsCount = 0;

    for (var keys in baseData) {
        //if the category matches in both the data
        if (patientsData.hasOwnProperty(keys)) {
            var drugs = baseData[keys];
            var currentCatPatients = patientsData[keys].length;
            var totalCatPatients = drugs[0]['total'];
            var changedPercent = currentCatPatients / totalCatPatients;

            for (var i = 0; i < drugs.length; i++) {
                var json = jQuery.extend(true, {}, drugs[i]);
                json['count'] = Math.round((json['utilization'] * currentCatPatients) / 100);
                json['total'] = currentCatPatients;

                finalData[drugsCount] = json;
                drugsCount++;
            }
        } else {
            continue;
        }
    }
    return finalData;
}

//function to export patients data
function exportPatientsData(obj) {
    var patientCount = $('.unTreatedPatSliderCount').html();
    patientCount = parseInt(patientCount);
    var patientsData = [];
    patientsData = jQuery.extend(true, [], UnTreatedPatientsData);
    patientsData.splice(patientCount);

    //Generate a file name
    var fileName = "UnTreatedPatients",
        showLabel = true;

    //remove category_id from patients
    for (var i = 0; i < patientsData.length; i++) {
        delete patientsData[i]['category_id'];
    }


    //reference http://jsfiddle.net/hybrid13i/JXrwM/

    //If patientsData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof patientsData != 'object' ? JSON.parse(patientsData) : patientsData;

    var CSV = '';

    //This condition will generate the Label/Header
    if (showLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index.toUpperCase() + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName = fileName.replace(/ /g, "_");

    //Initialize file format you want csv or xls
    var uri = 'data:text/xls;charset=utf-8,' + escape(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".xls";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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

function complicationBodyuntreated() {
    $('.untreatedcomplicationData').html('');
    var data = Session.get('untreatedPat_ComplicationData');
    var html = ''; //<div class="col-md-12 complicationRateViewP complicationRateViewtreated" id = "complicationRateView_treated">';
    for (var i = 0; i < data.length; i++) {
        html += '<div class="col-md-12 complicationRateViewP complicationRateViewuntreated" id = "complicationRateView_untreated">';
        html += '<div class="col-md-1 checkbox">' +
            '<label>';
        if (isDrugChecked(data[i].drugIds.split(','), 'untreatedPat_SPListData', isComparitiveFilter)) {
            html += '<input type="checkbox" class=" medcomplistuntreated" value="' + data[i].drugIds + '" checked/>';
        } else {
            html += '<input type="checkbox" class=" medcomplistuntreated" value="' + data[i].drugIds + '"/>';
        }

        html += '<span class="cr"><i class="cr-icon fa fa-check"></i></span>' +
            '</label>' +
            '</div>' +
            '<div class="col-md-3 crDrugName" style="padding-left:26px;">' +
            '<div style="width:50%;">' + data[i].drugGroupName + '</div>' +
            '</div>' +
            '<div class="col-md-3 crCost">' +
            '<div style="width:15%;">' + data[i].complicationRateLabel + '</div>' +
            '</div>' +
            '<div class="col-md-3 crCost">' +
            '<div style="width:96%;">$' + data[i].complicationCostLabel + '</div>' +
            '</div>';
        html += '</div>';
    }

    $('.untreatedcomplicationData').html(html);
    //$('.medcomplistuntreated').trigger('click');
}

function sortAlphaNumAsc(a, b) {
    var key = 'category_name';
    var reA = /[a-zA-Z]/g;
    var reN = /[^0-9]/g;
    var aA = a[key].replace(reA, "").replace(/\s/g, '');
    var bA = b[key].replace(reA, "").replace(/\s/g, '');
    if (aA === bA) {
        var aN = parseInt(a[key].replace(reN, ""), 10);
        var bN = parseInt(b[key].replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}

function sortAlphaNumDesc(a, b) {
    var key = 'category_name';
    var reA = /[a-zA-Z]/g;
    var reN = /[^0-9]/g;
    var aA = a[key].replace(reA, "").replace(/\s/g, '');
    var bA = b[key].replace(reA, "").replace(/\s/g, '');
    if (aA === bA) {
        var aN = parseInt(a[key].replace(reN, ""), 10);
        var bN = parseInt(b[key].replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA < bA ? 1 : -1;
    }
}


function showUniverseLoadingWheel() {
    $(".relativeWeightsContainer").css("visibility", "hidden");
    $(".expensesContainer").css("visibility", "hidden");
    $(".universe_loader_overlay").show();
    $(".universe_loader").show();
}

function hideUniverseLoadingWheel() {
    $(".relativeWeightsContainer").css("visibility", "visible");
    $(".expensesContainer").css("visibility", "visible");
    $(".universe_loader_overlay").hide();
    $(".universe_loader").hide();
}

function showChartLoadingMask() {
    $(".untreatedChartscontainer").css("visibility", "hidden");
    $(".chart_loader_overlay").show();
    $(".chart_loader").show();
}

function hideChartLoadingMask() {
    $(".untreatedChartscontainer").css("visibility", "Visible");
    $(".chart_loader_overlay").hide();
    $(".chart_loader").hide();
}



// supporting Functions executes at render.

function assignEventForResetFunctionality() {
    //untreated reset event
    $('#untreatedreset').click(function(e) {
        payerUtils.resetPayerFilters(e.currentTarget);
    });
}

function setTotalPatientCount() {
    //set count of untreated patients 
    $('#unTreatedTotalCount').html(AdvPayerPatientsCount[0].untreated);
}

function hideAndShowSPSections() {
    $('.untreatedPatienttemplateSubSection').hide();
    $('.subPopulationListViewDetailView').hide();
    $('.untreatedPatientchartSection').show();
    $('.untreatedSubPopulationListView-Container').show();
}

function assignEventRelatveSliders() {

    //weight slider function on change
    $("#txtEffWeightuntreated").change("input", function(e) {
        Template.UnTreatedPatients.valuecalculatorAdvanced();
        Session.set('untreated_isCurrentModelModified', true);
    });
    $("#txtAdhWeightuntreated").change("input", function(e) {
        Template.UnTreatedPatients.valuecalculatorAdvanced();
        Session.set('untreated_isCurrentModelModified', true);
    });
    $("#txtCostWeightuntreated").change("input", function(e) {
        Template.UnTreatedPatients.valuecalculatorAdvanced();
        Session.set('untreated_isCurrentModelModified', true);
    });
}

function setRelativeWeightsSliderTo100() {
    $('#txtEffWeightuntreated').val(100);
    $('#txtAdhWeightuntreated').val(100);
    $('#txtCostWeightuntreated').val(100);

    $('#txtEffWeightuntreated').rangeslider('update', true);
    $('#txtAdhWeightuntreated').rangeslider('update', true);
    $('#txtCostWeightuntreated').rangeslider('update', true);


    var output = $('#txtEffWeightuntreated').next().next();
    output.html(100 + "%");
    var output = $('#txtAdhWeightuntreated').next().next();
    output.html(100 + "%");
    var output = $('#txtCostWeightuntreated').next().next();
    output.html(100 + "%");
}

function initSessionVariables() {
    //set subpopulation list data blank
    Session.set('untreatedPat_SPListData', []);
    Session.set('untreatedPat_ComplicationData', []);
    //set the universe quality indicators value null
    Session.set('uniUnTreatedQualityIndicators', null);
}

function assignEventToCloseAllPopovers() {
    // To Open One Popover at a time and close other.
    $('[data-toggle=popover]').on('click', function(e) {
        $('[data-toggle=popover]').not(this).popover('hide');
    });
}

function renderComplicationRatePopup() {
    //----- OPEN popup for Complication rate
    $('.untreatedDrugCheck .complicationRate').on('click', function(e) {
        // var targeted_popup_class = jQuery(this).attr('data-popup-open');
        // $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);

        e.preventDefault();
        $('.untreatedcomplicationData').html('');
        var data = Session.get('untreatedPat_ComplicationData');
        var html = ''; //<div class="col-md-12 complicationRateViewP complicationRateViewtreated" id = "complicationRateView_treated">';
        for (var i = 0; i < data.length; i++) {
            html += '<div class="col-md-12 complicationRateViewP complicationRateViewuntreated" id = "complicationRateView_untreated">';
            html += '<div class="col-md-1 checkbox">' +
                '<label>';
            if (isDrugChecked(data[i].drugIds.split(','), 'untreatedPat_SPListData', isComparitiveFilter)) {
                html += '<input type="checkbox" class=" medcomplistuntreated" value="' + data[i].drugIds + '" checked/>';
            } else {
                html += '<input type="checkbox" class=" medcomplistuntreated" value="' + data[i].drugIds + '"/>';
            }

            html += '<span class="cr"><i class="cr-icon fa fa-check"></i></span>' +
                '</label>' +
                '</div>' +
                '<div class="col-md-3 crDrugName" style="padding-left:26px;">' +
                '<div style="width:50%;">' + data[i].drugGroupName + '</div>' +
                '</div>' +
                '<div class="col-md-3 crCost">' +
                '<div style="width:15%;">' + data[i].complicationRateLabel + '</div>' +
                '</div>' +
                '<div class="col-md-3 crCost">' +
                '<div style="width:96%;">$' + data[i].complicationCostLabel + '</div>' +
                '</div>';
            html += '</div>';
        }

        $('.untreatedcomplicationData').html(html);
    });
}

function assignEventToCloseComplicationRatePopup() {
    //----- CLOSE
    $('[data-popup-close]').on('click', function(e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);

        e.preventDefault();
    });
}

function setGenotypeComboForCurrentPatient() {
    //selecting genotype of current patient
    var currPatient = Session.get('selectedPatientData');
    setTimeout(function() {
        $('#untreatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        $('#untreatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
        $('.isCheckeduntreated').each(function(d) {
            $(this).prop('disabled', false);
            if ($(this).val() == currPatient[0].Genotype) {
                $(this).trigger('click');
            }
        });
        $('.isCheckeduntreatedProfile').each(function(d) {
            $(this).prop('disabled', false);
            if ($(this).val() == currPatient[0].Genotype) {
                $(this).trigger('click');
            }
        });
    }, 200);
}

let setGenotypeComboForProfileSection = (genotypes,cirrhosis,treatment,planType,tenureValue) =>{

    genotypes = genotypes?genotypes:getGenotypeFromFiltters();
    planType = planType?planType:getPlanTypeFromFilters();
    //genotypes = getGenotypeFromFiltters();
    treatment = treatment?treatment:getTreatmentFromFilters();
    cirrhosis = cirrhosis?cirrhosis:getCirrhosisFromFilters();


    if(genotypes[0] == 'all'){
         $('#untreatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
    }
    else{
            $('#untreatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
            $('#untreatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');

            $('.isCheckeduntreatedProfile').each((d,element) =>{
                //$(element).prop('disabled', false);
                if (genotypes.indexOf($(element).val()) > -1 && !$(element).prop('disabled')) {
                    $(element).trigger('click');
                }
            });
    }

    untreatedPlanSelectProfile[0].selectize.setValue(planType);

    //set treatment
    let treat = treatment.length > 1 ? 'all' : (treatment[0] == 'Yes' ? 'Naive' : 'Experienced');
    untreatedTreatmentSelectProfile[0].selectize.setValue(treat);

    //set cirrhosis
    if (cirrhosis.length <= 1) {
        untreatedCirrhosisProfile[0].selectize.setValue(cirrhosis[0]);
    } else {
        untreatedCirrhosisProfile[0].selectize.setValue('all');
    }
    
    untreatedTenureSelectProfile[0].selectize.setValue(parseInt(tenureValue));

}
Template.UnTreatedPatients.SaveCurrentModel = function() {
    let userid = Meteor.user().profile.userDetail.email;
    let dbParams = {
        'userId': userid,
        'modelName': $('.untreated_modelInfoContainer .modelNameInput').val()
    };
    // Meteor.call('IsModelExist', [dbParams], function(error, result) {
    //     if (result.statuscode == 0) {
    //         sAlert.error('Error! in saving model!', { timeout: 1500, onClose: function() { console.log('model save error - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
    //         setTimeout(function() {
    //             sAlert.closeAll();
    //         }, 3000);
    //     } else {
    //         if (result.response[0].num > 0) {
    //             sAlert.error('A model with this model name already exist!', { timeout: 1500, onClose: function() { console.log('model save error - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
    //             setTimeout(function() {
    //                 sAlert.closeAll();
    //             }, 3000);
    //             return false;
    //         }
    //     }
    let selectedFilters = payerUtils.getFiltersData();
    //console.log(selectedFilters);
    let genotypes = selectedFilters.untreated.genotypes;
    let treatment = selectedFilters.untreated.treatment;
    let cirrhosis = selectedFilters.untreated.cirrhosis;
    let planType = selectedFilters.untreated.planType;
    let tenureValue = selectedFilters.untreated.tenureValue;
    let flag = selectedFilters.untreated.flag;

    let categoryData = {
        genotypes: genotypes,
        treatment: treatment,
        cirrhosis: cirrhosis,
        flag: flag
    };

    //get the category id list and category name
    let category_data = payerUtils.getPossibleCatCombination(categoryData);
    let id_list = category_data;

    let localStorageSPData = getOptimizedDataFromLocalStorage(id_list);

    //localStorage.setItem('subpopulationOptimizedData', JSON.stringify(localStorageSPData));

    //let id_list = Session.get('untreated_category_id_list');

    let relativeWeights = getRelativeWeightsSliderData();


    let optimizedData = Session.get('untreatedPat_SPListData');

    // localStorage.setItem('savedTreatedData', JSON.stringify(TreatedAnalyticsData));
    // localStorage.setItem('savedOptimizedData', JSON.stringify(optimizedData));
    localStorage.setItem('untreated_category_id_list', JSON.stringify(id_list));
    // localStorage.setItem('mainFilters', JSON.stringify(selectedFilters.treated));
    // localStorage.setItem('raletiveWeights', JSON.stringify(relativeWeights));

    let complicationRateData = Session.get('untreatedPat_ComplicationData');
    let patientSliderCount = $("#unTreatedPatSlider").val();
    let UniverseSavingData = {
                                'TotalCost':parseInt($('.untreatedcardValueObserved').html().replace(/\D/g,'')),
                                'Saving':parseInt($('.untreatedcardValueGap').html().replace(/\D/g,'')),
                                'BestValueUtilization':parseInt($('.untreatedcardValueBest').html().replace(/\D/g,'')),
                                'QualityIndicators':Session.get('uniUnTreatedQualityIndicators'),
                                'UniverseSafety':Session.get('untreatedUniverse_safety')
                             }

    let modelNote = $('.untreated_modelInfoContainer .modelNotesInput').val().trim();
    let modelName = $('.untreated_modelInfoContainer .modelNameInput').val();
    userid = Meteor.user().profile.userDetail.email;
    let lastUpdated = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
    let tabName = 'UnTreated';
    if (modelName == '' || userid == undefined) {
        showModelDetails();
        $('.untreated_saveModelContainer .js-showModelDetails').hide();
        sAlert.error('Error! <br> Please Fill Mandatory Fields!', { timeout: 2500, onClose: function() { console.log('closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
        setTimeout(function() {
            sAlert.closeAll();
        }, 1000);


    } else {

        let dbParams = {
            'userId': userid,
            'tabName': tabName,
            'note': modelNote,
            'modelName': modelName,
            'lastUpdated': lastUpdated,
            'AnalyticsRowData': JSON.stringify(UnTreatedAnalyticsData),
            'OptimizedData': JSON.stringify(optimizedData),
            'isComplicationRateFilter': isComparitiveFilter,
            'ComplicationRateDrugsData': JSON.stringify(complicationRateData),
            'SelectedFilters': JSON.stringify(selectedFilters.untreated),
            'RelativeWeightsSliders': JSON.stringify(relativeWeights),
            'UntreatedTabPatietsSlider': JSON.stringify(patientSliderCount),
            'action': 'no',
            'modelId': Session.get('untreated_currentModelId'),
            'localStorageSPData': JSON.stringify(localStorageSPData),
            'UniverseSavingData' : JSON.stringify(UniverseSavingData)
        };
        Meteor.call('saveModelDetails', [dbParams], function(result, error) {
            if (error) {
                sAlert.error('Error! in saving model!', { timeout: 1500, onClose: function() { console.log('model save error - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
                setTimeout(function() {
                    sAlert.closeAll();
                }, 5000);
            } else {
                if (result['details'] == 'update') {
                    sAlert.success('updated Successfully!', { timeout: 1000, onClose: function() { console.log('model save success - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
                    setTimeout(function() {
                        sAlert.closeAll();
                    }, 3000);
                    Session.set('isModel', true);
                    Session.set('untreated_isCurrentModelModified', false);
                    Session.set('untreated_isCurrentModelSaved', true);
                } else if (result['details'] == 'exists') {
                    sAlert.error('A model with this model name already exist!', { timeout: 1500, onClose: function() { console.log('model save error - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
                    setTimeout(function() {
                        sAlert.closeAll();
                    }, 3000);
                    //showSaveButton();
                } else {
                    sAlert.success('Model details Saved Successfully!', { timeout: 1000, onClose: function() { console.log('model save success - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
                    setTimeout(function() {
                        sAlert.closeAll();
                    }, 3000);
                    Meteor.call('getSavedModelData', [{ userId: Meteor.user().profile.userDetail.email }], function(error, result) {
                        if (result) {
                            if (result.length > 0) {
                                currentModelId = result[0].modelId;
                                Session.set('isModel', true);
                                Session.set('untreated_isCurrentModelModified', false);
                                Session.set('untreated_currentModelId', result[0].modelId);
                                $('.untreated_modelInfoContainer .saveModelButton').attr('data', result[0].modelId);

                            }
                        }
                    });
                }


            }
        });

        //hideSaveButton();


    }
    // });

    function SaveModelIntoDB() {

    }


}


Template.UnTreatedPatients.loadSavedModel = function(modelId) {

    removeActiveClassFromLists();
    showSPView();
    showSPlistView();
    hideSPDetailView();

    //let selectedFilters = payerUtils.getFiltersData('treated');
    let untreatedAnalyticsData = [];
    let relativeWeights = [];
    let optimizedData = [];
    let mainFilters = [];
    let isComplicationFilterApplied = false;
    let complicationRateData = [];
    let spLocalStorageData = [];
    let patientSliderCount = 0;
    showUniverseLoadingWheel();
    showChartLoadingMask();
    Meteor.call('getSavedModelData', [{ userId: Meteor.user().profile.userDetail.email, id: modelId }], function(error, result) {
        if (error) {

        } else {
            Session.set('isModel', true);
            untreatedAnalyticsData = JSON.parse(result[0].AnalyticsRowData);
            relativeWeights = JSON.parse(result[0].RelativeWeightsSliders);
            optimizedData = JSON.parse(result[0].OptimizedData);
            mainFilters = JSON.parse(result[0].SelectedFilters);
            patientSliderCount = JSON.parse(result[0].UntreatedTabPatietsSlider);
            //isPatientSliderChanged = true;
            Session.set('untreatedPat_ComplicationData', JSON.parse(result[0].ComplicationRateDrugsData))
            isComparitiveFilter = result[0].isComplicationRateFilter == 0 ? false : true;

            let UniverseSavingData = JSON.parse(result[0].UniverseSavingData);
            Session.set('UnTreated_UniverseSavingData',UniverseSavingData);

            spLocalStorageData = JSON.parse(result[0].localStorageSPData) ? JSON.parse(result[0].localStorageSPData) : []; //JSON.parse(localStorage.getItem('subpopulationOptimizedData'));
            setSPLocalStorageData(spLocalStorageData);

            currentModelId = result[0].modelId;
            Session.set('untreated_isCurrentModelModified', false);
            Session.set('untreated_isCurrentModelSaved', true);
            Session.set('untreated_currentModelId', result[0].modelId);
            //set model box details
            $('.untreated_modelInfoContainer .modelNotesInput').val(result[0].note);
            $('.untreated_modelInfoContainer .modelNameInput').val(result[0].modelName);
            $('.untreated_modelInfoContainer .saveModelButton').attr('data', result[0].modelId);

            let genotypes = mainFilters.genotypes;
            let treatment = mainFilters.treatment;
            let cirrhosis = mainFilters.cirrhosis;
            let planType = mainFilters.planType;
            let tenureValue = mainFilters.tenureValue;
            let flag = mainFilters.flag;

            let categoryData = {
                genotypes: genotypes,
                treatment: treatment,
                cirrhosis: cirrhosis,
                flag: flag
            };

            // Set Current filters value.
            payerUtils.storeFitersData('untreated', categoryData, planType, tenureValue);

            //set current filters
            currentFilters = categoryData;

            //call to fetch patients for patients slider
            getUntreatedPatientsData();

            //get the category id list and category name
            let category_data = payerUtils.getPossibleCatCombination(categoryData);
            let id_list = category_data;
            //global variable for treatedDbData
            UnTreatedAnalyticsData = untreatedAnalyticsData;
            Session.set('untreated_category_id_list', id_list);

            // //check for filter applied or not
            // if(isComplicationFilterApplied) {
            //     //store complication rate data in  session
            //     Session.set('treatedPat_ComplicationData', complicationRateData);   
            // }

            // The ChangedData in the arguments will be false as we are not clicking ont he Go button of the main filters. 
            preparePayerToolData(id_list, untreatedAnalyticsData, false, true);

            setMainFilters(mainFilters);
            setRelativeWeights(relativeWeights);


            let reactive_var = 'uniUnTreatedQualityIndicators';

            // "treatedSPData" is set into the session in "preparePayerToolData" function.
            payerUtils.renderUniverseQualityIndicators(untreatedSPData, optimizedData, reactive_var);
            optimizedData.sort(function(a, b) {
                return b.count - a.count;
            });

            collapseSubpopulationDetailView();

            Session.set('untreatedPat_SPListData', optimizedData);

            // Updated Calculation according to Relative Weights Sliders.
            Template.UnTreatedPatients.valuecalculatorAdvanced(true);

            // Set patient Slider Count
            setPatientSlider(patientSliderCount);

            //hide load mask
            hideLoadingWheel();
            hideUniverseLoadingWheel();
            setTimeout(function() {
                //render charts for the tab
                payerUtils.renderChartsForTab('untreated', untreatedSPData);

                hideChartLoadingMask();
            }, 300);

            //show the subpopulation section
            $('.untreatedSubpopulationWrapper').show();


            //set tenure value on the chart
            // var str = $('#unTreatedSelectTenureValue').val() == "1" ? 'Month':'Months';
            // $('.untreatedtenure').html('Last '+$('#unTreatedSelectTenureValue').val()+' ' +str);
        }
    });


}


// Supporting Funtion for handle Filter Change

function collapseSubpopulationDetailView() {
    //remove all active classes
    $('.untreateddetailViewLink').each(function(index) {
        $(this).removeClass('active');
    });
    //hide all subpopulation info
    $('.untreatedSubPopulationView-ListBody .subPopulationListViewDetailView').each(function(index) {
        $(this).attr('style', 'display:none');
    });
}

// Remove Active class from the lists in the List view.
function removeActiveClassFromLists() {
    $('.untreateddetailViewLink').each(function(index) {
        $(this).removeClass('active');
    });
}

//show sub population section
function showSPView() {
    $('.untreatedchartSubPopulation').show();
}

//show sub population list view section
function showSPlistView() {
    $('.untreatedSubPopulationListView-Container').show();
}

//hide the sub population detail view
function hideSPDetailView() {
    $('.untreatedSubPopulationDetailView-Container').hide();
}

function getCurrentPatientData() {
    return Session.get('selectedPatientData')[0];
}

function showSaveButton() {
    var hidden = $('.untreated_saveModelContainer');
    hidden.show('slide', { direction: 'left' }, 400);
    hidden.animateCss('fadeInLeft');
    hidden.animateCss('bounce');

}


function hideSaveButton() {
    var hidden = $('.untreated_saveModelContainer');
    hidden.animateCss('fadeOutRight');
    hidden.hide('slide', { direction: 'left' }, 400);
}


function hideModelDetails() {
    var hidden = $('.untreated_modelInfoContainer');
    hidden.hide('slide', { direction: 'left' }, 400);
}

function showModelDetails() {
    var hidden = $('.untreated_modelInfoContainer');
    hidden.show('slide', { direction: 'left' }, 400);
}

function getRelativeWeightsSliderData() {
    let obj = {};
    let efficacy = $('#txtEffWeightuntreated').val();
    let adherence = $('#txtAdhWeightuntreated').val();
    let cost = $('#txtCostWeightuntreated').val();

    obj['efficacy'] = efficacy;
    obj['adherence'] = adherence;
    obj['cost'] = cost;

    return obj;
}


let setMainFilters = function(data) {
    // console.log("Setting Main Filters");
    // console.log(data);
    var genotypes = data.genotypes;
    if (genotypes == undefined) {
        genotypes = [];
    }

    //$('#treatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
    if (genotypes.length == GenotypeList.length) {
        if ($('.isCheckedalluntreated').prop('checked') == false) {
            $('#untreatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        }
    } else {
        if ($('.isCheckedalluntreated').prop('checked') == false) {
            $('#untreatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        }
        $('#untreatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        $('.isCheckeduntreated').each(function(d) {
            //$(this).trigger('click');
            $(this).prop('disabled', false);
            if (genotypes.indexOf($(this).val()) >= 0) {
                $(this).trigger('click');
            }
        });
    }

    //set plan
    let plan = data.planType.split(',');
    plan = plan.length > 1 ? 'all' : plan[0];
    untreatedPlanSelect[0].selectize.setValue(plan);

    //set treatment
    let treat = data.treatment.length > 1 ? 'all' : data.treatment[0];
    untreatedTreatmentSelect[0].selectize.setValue(treat);

    //set tenure
    if (data.tenureValue > 7) {
        data.tenureValue = data.tenureValue / 12;
    }
    untreatedTenureSelect[0].selectize.setValue(data.tenureValue);

    //set cirrhosis
    if (data.cirrhosis.length <= 1) {
        untreatedCirrhosis[0].selectize.setValue(data.cirrhosis[0]);
    } else {
        untreatedCirrhosis[0].selectize.setValue('all');
    }
}


let setRelativeWeights = function(data) {
    //console.log("Setting Relative Weights");
    //console.log(data);
    $('#txtEffWeightuntreated').val(data.efficacy);
    $('#txtAdhWeightuntreated').val(data.adherence);
    $('#txtCostWeightuntreated').val(data.cost);

    $('#txtEffWeightuntreated').rangeslider('update', true);
    $('#txtAdhWeightuntreated').rangeslider('update', true);
    $('#txtCostWeightuntreated').rangeslider('update', true);


    var output = $('#txtEffWeightuntreated').next().next();
    output.html(data.efficacy + "%");
    var output = $('#txtAdhWeightuntreated').next().next();
    output.html(data.adherence + "%");
    var output = $('#txtCostWeightuntreated').next().next();
    output.html(data.cost + "%");
}

let setPatientSlider = function(count) {
    $('#unTreatedPatSlider').prop('disabled', false);
    $('#unTreatedPatSlider').val(count);
    $('#unTreatedPatSlider').rangeslider('update', true);

    var output = $('#unTreatedPatSlider').next().next();
    output.html(count);
}


let getOptimizedDataFromLocalStorage = function(ids) {
    // let tabname = "untreated";
    // let subpopulationOptimizedData = [];
    // let temp = ids.split(",");
    // for(let i=0; i<temp.length; i++){
    //     let key = tabname + temp[i] + "SvgData";
    //     let data = localStorage.getItem(key);
    //     let obj = {};
    //     obj[key] = data;
    //     subpopulationOptimizedData.push(obj);
    // }

    // return subpopulationOptimizedData;

    let subpopulationOptimizedData = [];
    $('.untreatedSubPopulationView-ListBody .inner').each(function() {
        let tabname = $(this).attr('tabname');
        let data = JSON.parse($(this).attr('data'));
        if (data != null) {
            let obj = {};
            obj[tabname + "SvgData"] = data;
            subpopulationOptimizedData.push(obj);
        }
    });
    return subpopulationOptimizedData;

}

let setSPLocalStorageData = function(data) {
    Session.set('untreatedSPSvgData', data);
}

function hideLoadingWheel() {
    $('#anim_loading_theme').css('top', '40%');
    $('#anim_loading_theme').css('visibility', 'hidden');
    $('#overlay').hide();
}

function showloadingWheel() {
    $("#anim_loading_theme").css("top", "90%");
    $("#anim_loading_theme").css("visibility", "visible");
    $("#overlay").show();
}

function showWarningMsgForLoadingModel(id, tabname) {

    let html = `<div class="col-md-12 ">

                    You have unsaved Changes. Do you want to save them?
                    </div>

                    <button type="button" modelId="${id}" tabname="${tabname}" class="btn btn-default loadWarningMessageButtonSave warningMsgBtn">Yes</button>
                    <button type="button" modelId="${id}" tabname="${tabname}" class="btn btn-default continueUnsavedchanges warningMsgBtn">No</button>`;

    $('#loadWarningMessageContent').html(html);
    $('#loadWarningMessage').show();
}


function handleProfileSelection(profUtilizations) {
    let baseData = _.groupBy(UnTreatedAnalyticsData,'category_id');

    let sum_score = 0,
        categoriesCount = 0,
        best_score_cat = 0,
        total_savings = 0,
        total_cost_cat = 0,
        best_value_cost_cat = 0,
        total_pop = 0,
        valuegap = 0,
        preparedData = [];

    for (let keys in baseData) {
        let best_score = 0,
            total_cost = 0,
            sum_value_score = 0,
            best_score_cost = 0,
            total = 0,
            category_data = [],
            json = {},
            drugsData = baseData[keys];

            //sort drugs data on the value score
            drugsData = drugsData.sort( (a,b) => {
                return b.value - a.value;
            });
        
        for (let j=0;j<drugsData.length;j++) {
            let temp = {},
                adjustedData = adjustUtiForProfile(j,profUtilizations,drugsData[j].total);

            temp['medication'] = drugsData[j].medication;
            temp['cost'] = drugsData[j].cost;
            temp['efficacy'] = drugsData[j].efficacy;
            temp['adherence'] = drugsData[j].adherence;
            temp['utilization'] = adjustedData.ajdustedUti*100;
            temp['count'] = drugsData[j].count;
            temp['value'] = drugsData[j].value;
            temp['safety'] = drugsData[j].safety;
            temp['safe'] = drugsData[j].safe_check;

            temp['drugid'] = drugsData[j].drugid;
            temp['period'] = drugsData[j].treatment_period;
            temp['comp_value'] = (drugsData[j].comp_value).toFixed(2);
            temp['compli_cost'] = commaSeperatedNumber(parseInt(drugsData[j].compli_cost));
            
            best_score = drugsData[j].best_value;
            best_score_cost += getBestValueCost(j,profUtilizations,drugsData);
            total = drugsData[j].total; // Total Count
            sum_value_score += drugsData[j].value;
            total_cost += drugsData[j].cost * drugsData[j].count;

            category_data.push(temp);
        }

        json['data'] = category_data;
        json['count'] = total;
        json['category_id'] = parseInt(keys);
        json['category_name'] = category_name_list[parseInt(keys) - 1];
        json['total_cost'] = Math.round(total_cost);
        json['total_cost_display'] = commaSeperatedNumber(Math.round(json['total_cost']));
        json['best_value_cost'] = Math.round(best_score_cost);
        json['best_value_cost_display'] = commaSeperatedNumber(Math.round(json['best_value_cost']));
        json['savings'] = Math.round(total_cost - best_score_cost);
        json['savings_display'] = commaSeperatedNumber(Math.round(json['savings']));
        best_score_cat += best_score;
        var observedvalue = (drugsData.length <= 0 ? 0 : (sum_value_score / drugsData.length));
        sum_score += observedvalue;
        total_cost_cat += total_cost;
        json['optimizedValue'] = 0;
        json['optimizedValue_display'] = commaSeperatedNumber(Math.round(json['optimizedValue']));
        best_value_cost_cat += best_score_cost;
        total_savings += total_cost - best_score_cost;
        total_pop += total;

        categoriesCount++;
        
        preparedData.push(json);
    }

    sum_score = sum_score / categoriesCount;
    best_score_cat = (best_score_cat / categoriesCount).toFixed(2);
    valuegap = best_score_cat - sum_score;
    //set the savings on display page
    $('.untreatedcurrent_best').html(sum_score.toFixed(2));
    $('.untreatedavgbest').html(best_score_cat);
    $('.untreatedvaluegap').html(valuegap.toFixed(2));

    $('.untreatedcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
    $('.untreatedcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
    $('.untreatedcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));

    //calculate savings per patient
    let saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
    $('.untreatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(saving_perpatient));
    $('#untreatedCurrentCount').html(commaSeperatedNumber(total_pop));
    $('.untreatedTotalFilteredPatients').html(total_pop);
    Session.set('untreatedTotalPatients', total_pop);

    preparedData.sort(function(a, b) {
        return b.count - a.count;
    });

    //set the data into session variable 
    Session.set('untreatedPat_SPListData', preparedData);

    //set the filtered data in the variable to compute the difference with the optimized one
    untreatedSPData = preparedData;

    //refresh the universe quality indicators
    var optimizedData = Session.get('untreatedPat_SPListData');
    var reactive_var = 'uniUnTreatedQualityIndicators';

    renderTheData(untreatedSPData, optimizedData, reactive_var);

    //helper functions
    function adjustUtiForProfile(drugIndex,profUtiArray,totalCount) {
        let ajdustedUti = 0;

        if(profUtiArray[drugIndex]) {
            ajdustedUti = profUtiArray[drugIndex];
        }
        
        return {
            ajdustedUti: ajdustedUti,
            adjustedCount: Math.round(totalCount * ajdustedUti)
        }
    }

    function getBestValueCost(drugIndex,profUtiArray,drugsArray) {
        let val = drugsArray[drugsArray.length-1]['total'];
        val = Math.round(val * (profUtiArray[drugIndex] ? profUtiArray[drugIndex] : 0));

        return drugsArray[drugIndex]['cost'] * val;
    }
}