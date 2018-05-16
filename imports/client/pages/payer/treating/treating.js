import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './treating.html';

import * as subpopUtils from '../../../lib/custom/payer/AdvPayerSPUtils.js';
import * as payerUtils from '../../../lib/custom/payer/payerToolUtilities.js';

//default sort order for Sub population List view
var treatingSPData = [],
    allDrugsList = null,
    isComparitiveFilter = false;

let treatingPlanSelect = '';
let treatingTreatmentSelect = '';
let treatingTenureSelect = '';
let treatingCirrhosis = '';
let treatingPlanSelectProfile = '';
let treatingTreatmentSelectProfile = '';
let treatingTenureSelectProfile = '';
let treatingCirrhosisProfile = '';
TreatingAnalyticsData = null;

//current filters
var currentTabFilters = null;

Template.TreatingPatients.rendered = function() {

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
    treatingPlanSelect = $('.treatingInsurancePlanSelect').selectize();
    treatingTreatmentSelect = $('.treatingTreatment').selectize();
    treatingCirrhosis = $('.treatingCirrhosis').selectize();
    treatingPlanSelectProfile = $('.treatingInsurancePlanSelectProfile').selectize();
    treatingTreatmentSelectProfile = $('.treatingTreatmentProfile').selectize();
    treatingCirrhosisProfile = $('.treatingCirrhosisProfile').selectize();
    var currPatient = Session.get('selectedPatientData');
    var curTreatment = currPatient[0].Treatment;
    treatingPlanSelect[0].selectize.setValue('all');
    let treat = curTreatment == 'Yes' ? 'Naive' : 'Experienced';
    treatingTreatmentSelect[0].selectize.setValue(treat);
    treatingCirrhosis[0].selectize.setValue(currPatient[0].Cirrhosis);
    treatingPlanSelectProfile[0].selectize.setValue('all');
    treatingTreatmentSelectProfile[0].selectize.setValue(treat);
    treatingCirrhosisProfile[0].selectize.setValue(currPatient[0].Cirrhosis);
};


Template.TreatingPatients.helpers({
    'uniTreatingQualityIndicators': function() {
        var data = Session.get('uniTreatingQualityIndicators');
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
    'iscomplicationDataEmpty': function() {
        //return Session.get('treatingPat_ComplicationData').length>0?false:true;
        var data = Session.get('treatingPat_ComplicationData');
        if (data) {
            if (data.length)
                return false;
            else
                return true;
        } else {
            return true;
        }
    },
    'renderTreatingSafetyQualityChart': function() {
        if (TreatingAnalyticsData) {
            renderUniverseSafetyIndicators('treating');
        }
    },
    'getListData': function() {
        var data = Session.get('treatingPat_SPListData');
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
    'calculateBestValueFromValues': function(bestValue, value, id) {
        subpopUtils.calculateBestValueFromValues(bestValue, value, id);
    },
    'isOptimizedValueGreaterThanZero': function(optimizedValue) {
        if (optimizedValue != 0) {
            return true;
        } else {
            return false;
        }
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
        $('.treatingsubPopulationCategoriesContainer').children().each(function(index) {
            if (index == 0) {
                //$(this).trigger('click');
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
        for (var i = 0; i < ListOfYear[0].year; i++) {
            list.push({ "year": i + 1 });
        }
        return list;
    },
    'complicationRateView': function() {
        return Session.get('treatingPat_ComplicationData');
    },
    'isDrugChecked': function(drugids) {
        var tabName = 'treating';
        var drugIDArray = drugids.split(',');
        //treatedPat_ComplicationData
        var checked = isDrugChecked(drugIDArray, 'treatingPat_SPListData', isComparitiveFilter);
        return checked;
    },

    'DrugsData': function(data, category_id) {
        var selDrugsWithData;
        category_id = (category_id == undefined ? '' : category_id);
        if (data) {
            selDrugsWithData = subpopUtils.getPreparedDrugsData('treating' + category_id, data);
        } else {
            selDrugsWithData = subpopUtils.getPreparedDrugsData('treating' + category_id);
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
    'isSelected': function(type, data) {
        var currPatient = Session.get('selectedPatientData');
        var curTreatment = currPatient[0].Treatment;
        treatingPlanSelect[0].selectize.setValue(currPatient[0].Insurance);
        let treat = curTreatment == 'Yes' ? 'Naive' : 'Experienced';
        treatingTreatmentSelect[0].selectize.setValue(treat);
        treatingCirrhosis[0].selectize.setValue(currPatient[0].Cirrhosis);
        //setGenotypeComboForCurrentPatient();
        // switch (type) {
        //     case 'treatment':
        //         {
        //             if (data.trim().toLowerCase() == curTreatment.trim().toLowerCase()) {
        //                 return 'selected';
        //             }

        //         }
        //     case 'plan':
        //         {
        //             if (data.trim().toLowerCase() == curplan.trim().toLowerCase()) {
        //                 return '';
        //             }

        //         }
        //     case 'cirrhosis':
        //         {
        //             if (data.trim().toLowerCase() == curCirrhosis.trim().toLowerCase()) {
        //                 return 'selected';
        //             }

        //         }
        // }

    },
    'isModelChanged': function() {
        if (Session.get('treating_isCurrentModelModified')) {
            showSaveButton();
        } else {
            hideSaveButton();
        }
    },
    'stringifyOptimizedData': function(id) {
        let data = Session.get('treatingSPSvgData');
        let temp = "treating" + id + "SvgData";
        let requiredData = '';
        if (data) {
            for (let i = 0; i < data.length; i++) {
                if (data[i][temp]) {
                    requiredData = JSON.stringify(data[i][temp]);
                }
            }
        }
        return requiredData;
    }
});

Template.TreatingPatients.events({
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
    'click .js-ourRecommendationsLinkTreating':function(event,template) {        
        $('#treatingRecommendationsPopup').show();
        setGenotypeComboForProfileSection();
    },
     'click .js-treatingRecc-ApplyBtn': function(event,templat) {
        let profUtilizations = [1.0];
        let selectedProf = $('input[name=recommendationsRadio_treating]:checked').attr('data');

        if(selectedProf.toLowerCase() == 'profile_2') {
            profUtilizations = [0.75,0.25];
        }
        else if (selectedProf.toLowerCase() == 'profile_3') {
            profUtilizations = [0.50,0.25,0.25];
        }

        let planType = $('.treatingInsurancePlanSelectProfile').val(),
            genotypes = getGenotypeFromFiltters('treatingselectGenotypeProfile'),
            cirrhosis = getCirrhosisFromFilters('treatingCirrhosisProfile'),
            treatment = getTreatmentFromFilters('treatingTreatmentProfile'),
            tenureValue = parseInt($('.treatingtenureProfile').val()),
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
        dbParams['patientsType'] = 'treating';
        dbParams['filteredMedications'] = [];

        $('#treatingRecommendationsPopup').hide();
        showloadingWheel();
        payerUtils.storeFitersData('treating', categoryData, planType, tenureValue);
        fetchAndRenderData(dbParams, id_list,true,selectedProf);
        setTimeout(function(){
            payerUtils.setSavingsProfile('treating',selectedProf.toLowerCase());
            handleProfileSelection(profUtilizations);
            setMainFilters(categoryData);
            hideLoadingWheel();
        },500);
        collapseSubpopulationDetailView();
    },
    'click .treatingSafety': function(e) {
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
        $('.treatingPatienttemplateSubSection').hide();
        if (tabName === "charts") {
            $('.treatingPatientchartSection').show();
        } else if (tabName === "sub population") {
            $('.treatingPatientsubPopulationSection').show();
        }
        document.getElementById("anim_loading_theme").style.visibility = "hidden";
        document.getElementById("overlay").style.display = "none";
        document.getElementById("anim_loading_theme").style.top = "40%";
        highlightTab(tabName);

        $('.treatingSubPopulationCategoriesItem').children().each(function(index) {
            if (index == 0) {
                $(this).trigger('click');
            }
        });
    },
    'click .treatingApplyUniFilters': function(e) {

        payerUtils.resetSavingsProfile('treating');
        if (Session.get('treating_isCurrentModelModified')) {
            Session.set('treating_editGoTrigger', true);
            showWarningMsgForLoadingModel(0, 'treating');
        } else {
            // Remover All lgends from Chart Section if any.
            $(".c3-legend-item").remove();

            // showloadingWheel();
            showUniverseLoadingWheel();
            showChartLoadingMask();

            // Main Apply is clicked so we dont need previously stored Drugs.
            isComparitiveFilter = false;
            $('.treating_saveModelContainer .modelNotesInput').val('');
            $('.treating_saveModelContainer .modelNameInput').val('');
            $('.treating_saveModelContainer .saveModelButton').attr('data', '');
            Session.set('treating_isCurrentModelModified', false);
            Session.set('treating_isCurrentModelSaved', false);
            Session.set('treating_currentModelId', null);

            setRelativeWeightsSliderTo100();
            //call handle filter function
            handleFilterChange();
        }
    },
      // Click Event for the Go button in the Saving Profile Popup.
    'click .treatingApplyUniFiltersProfile': function(e) {

        let planType = $('.treatingInsurancePlanSelectProfile').val(),
            genotypes = getGenotypeFromFiltters('treatingselectGenotypeProfile'),
            cirrhosis = getCirrhosisFromFilters('treatingCirrhosisProfile'),
            treatment = getTreatmentFromFilters('treatingTreatmentProfile'),
            tenureValue = parseInt($('.treatingtenureProfile').val()),
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
        dbParams['patientsType'] = 'treating';
        dbParams['filteredMedications'] = [];

        payerUtils.resetSavingsProfile('treating');

        Meteor.call('getAnalyticsDataForPatients', dbParams, (error, result) =>{

            //get payertool data
            let result_data  = preparePayerToolData(id_list,result,false,false,true);
            //append UI for Savings Profile
            subpopUtils.showOurRecomendations('treating',categoryData,result,undefined,result_data);
        });

    },
    'click .showtreatingall': function(e) {
        // document.getElementById("anim_loading_theme").style.top = "90%";
        // document.getElementById("anim_loading_theme").style.visibility = "visible";
        // document.getElementById("overlay").style.display = "block";

        showUniverseLoadingWheel();
        showChartLoadingMask();

        //make the filters selection to all
        payerUtils.setFiltersToAll('treating');

        //call handle filter function
        handleFilterChange('all');
    },
    'click .optimizeLink': function(e, template) {
        payerUtils.optimzeSPLinkClick(e.currentTarget);
    },
    'click .treatingsortComplicationRate': function(e) {
        var sortBy = 'drugGroupName';
        var value = $(e.currentTarget).attr('sort');
        var data = Session.get('treatingPat_ComplicationData');
        if (value == 'complicationCost') {
            sortBy = 'complicationCost';
        } else if (value == 'complicationRate') {
            sortBy = 'complicationRate';
        } else if (value == 'drugGroupName') {
            sortBy = 'drugGroupName';
        }
        $('.treatingsortComplicationRate').each(function() {
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
        Session.set('treatingPat_ComplicationData', data);
        complicationBodytreating(); //recreating modal html in modal
    },
    'click .treatingcomplicationsApplybutton': function() {
        isComparitiveFilter = true;
        Session.set('treated_isCurrentModelModified', true);
        $('.complicationsClosebutton').trigger('click');

        // Remover All lgends from Chart Section if any.
        $(".c3-legend-item").remove();

        // showloadingWheel();
        showUniverseLoadingWheel();
        showChartLoadingMask();

        var listmed = $('.medcomplisttreating');
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
    'click .medcomplistcheckedtreating': function() {
        if ($('.medcomplistcheckedtreating').prop('checked') == true) {
            $('.medcomplisttreating').each(function(d) {
                $(this).prop('checked', true);
            });
        } else {
            $('.medcomplisttreating').each(function(d) {
                $(this).prop('checked', false);
            });
        }
    },
    'click .medcomplisttreating': function() {
        var stat = true;
        $('.medcomplisttreating').each(function(d) {
            if ($(this).prop('checked') == false) {
                stat = false;
            }
        });
        $('.medcomplistcheckedtreating').prop('checked', stat);
    },
    'input .treatingpayersearchbox': function(e) {
        var text = $(e.currentTarget).val().toLowerCase();
        $('.complicationRateViewtreating').each(function(d) {
            var patternd = $(this).text().toLowerCase().replace(/\s/g, '');
            if (patternd.indexOf(text) == -1) {
                $(this).css('display', 'none');
            } else {
                $(this).css('display', 'block');
            }

        });

    },
    'click .treatingsubpopsort': function(e) {
        // //alert($(e.currentTarget).attr('sort'));
        // var sortBy = 'count';
        // var value = $(e.currentTarget).attr('sort');
        // var data = Session.get('treatingPat_SPListData');

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

        // $('.treatingsubpopsort').each(function(){
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
        // $('.treatingdetailViewLink').each(function(index){
        //     $(this).removeClass('active');
        // });
        // //hide all subpopulation info
        // $('.treatingSubPopulationView-ListBody .subPopulationListViewDetailView').each(function(index){
        //     $(this).attr('style','display:none');
        // });
        // if($('.treating'+value).hasClass('sortred')){
        //     if($('.treating'+value).attr('type') == 'asc'){
        //         if(value == 'category_name'){
        //             data.sort(sortAlphaNumDesc);
        //         }
        //         else{
        //             data.sort(function(a, b) {
        //                 return b[sortBy] - a[sortBy];
        //             });
        //         }
        //         $('.treating'+value).attr('type','desc');
        //     }
        //     else if($('.treating'+value).attr('type') == 'no'){
        //          if(value == 'category_name'){
        //             data.sort(sortAlphaNumAsc);
        //         }
        //         else{
        //             data.sort(function(a, b) {
        //                 return b[sortBy] - a[sortBy];
        //             });
        //         }
        //          $('.treating'+value).attr('type','asc');
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
        //          $('.treating'+value).attr('type','asc');
        //     }
        // }

        // // data.sort(function(a, b) {
        // //             return a[sortBy] - b[sortBy];
        // //         });

        // Session.set('treatingPat_SPListData',data);
    },
    'click .treatingdetailViewLink': function(e, template) {
        var ele = e.currentTarget;
        var categoryName = $(ele).attr('data');
        var category_id = $(ele).attr('identifier');
        $('.treatingTotalFilteredPatients').html(Session.get('treatingTotalPatients'));

        var isViewOpen = $('.treatinglistDetailView_' + category_id).css('display') == 'block' ? true : false;

        //detail view show and hide
        if (isViewOpen) {
            $('.treatinglistDetailView_' + category_id).hide();
            $(ele).removeClass('active');
        } else {
            $('.treatinglistDetailView_' + category_id).show();
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
    'change .treatingSubPopulationList-SortCombo': function(e, template) {
        var sortBy = 'count';
        var value = $(e.currentTarget).val();
        var data = Session.get('treatingPat_SPListData');
        if (value == 'projectedCost') {
            sortBy = 'optimizedValue';
        }
        data.sort(function(a, b) {
            return a[sortBy] - b[sortBy];
        });
        Session.set('treatingPat_SPListData', data);

        //trigger the first click of the Categories List
        setTimeout(function() {
            $('.treatingSubPopulationCategoriesItem:first-child').trigger('click');
        }, 200);
    },
    'click .treatingSubPopulationCategoriesItem': function(e, template) {
        $('.treatingSubPopulationCategoriesItem').removeClass('active');
        $(e.currentTarget).addClass('active');
        renderSubPopulationCategoriesItem(e.currentTarget);
    },

    'click .treatingDetailedAnalytics': function(e) {

        $('#treatingSubpopulationTab').css('display', 'block');
        $('#treatingSubpopulationTab').addClass('active').siblings().removeClass('active');

        e.preventDefault();

        document.getElementById("anim_loading_theme").style.top = "90%";
        document.getElementById("anim_loading_theme").style.visibility = "visible";
        document.getElementById("overlay").style.display = "block";
        //removeTemplate();
        //if ($("#templateRenderSection").children().length > 0) {
        //    removeTemplate();
        //}

        //insertTemplate(tabName);
        $('.treatingPatienttemplateSubSection').hide();
        $('.treatingPatientchartSection').hide();
        $('.treatingPatientsubPopulationSection').show();

        var elem = $('#treatingSubpopulationTab');
        smooth_scroll_to(elem);

        document.getElementById("anim_loading_theme").style.visibility = "hidden";
        document.getElementById("overlay").style.display = "none";
        document.getElementById("anim_loading_theme").style.top = "40%";
        highlightTab("sub population");
    },

    'click .treatingsafecheck': function() {
        //if($('.treatingsafecheck')[0].checked == true){
        /* document.getElementById("anim_loading_theme").style.top = "90%";
         document.getElementById("anim_loading_theme").style.visibility = "visible";
         document.getElementById("overlay").style.display = "block";
         handleFilterChange();*/
        // }

    },
    'click .js-saveCurrentModel': function() {
        // SaveCurrentModel();
        // $('.saveModelNote').val('');
        // $('#saveModelName').val('');
    },
    'click .treating_modelInfoContainer #js-saveModel': function() {
        Template.TreatingPatients.SaveCurrentModel();
        // $('.saveModelNote').val('');
        // $('#saveModelName').val('');

    },
    'click .js-showModelDetails-treating': function() {
        showModelDetails();
        $('.js-showModelDetails-treating').hide();
    },
    'click .js-hideModelDetails-treating': function() {
        hideModelDetails();
        setTimeout(function() {
            $('.js-showModelDetails-treating').show();
        }, 400);
    },

    'click .js-LoadCurrentModel': function() {
        Template.TreatingPatients.loadSavedModel();
    },
    'click .loadSavedModel': function() {
        listSavedModels();
    },
    // Not in Use
    'click .treatedsafecheck': function() {
        //if($('.treatedsafecheck')[0].checked == true){
        /*document.getElementById("anim_loading_theme").style.top = "90%";
        document.getElementById("anim_loading_theme").style.visibility = "visible";
        document.getElementById("overlay").style.display = "block";
        handleFilterChange();*/
        // }

    }
});

Template.TreatingPatients.destroyed = function() {
    treatingSPData = [];
    allDrugsList = null;
    isComparitiveFilter = false;
}

function highlightTab(tabName) {
    $(".treatingPatient .tabNavigation li").each(function(i) {
        if ($(this).children('a').html().toLowerCase() === tabName) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}

//Calculate of Size Payer. 
Template.TreatingPatients.calculateSizePayer = function(minimum, maximum, populationSize, totalCount, previousAllocatedSize) {
    var diffrenceInSize = 12 / (totalCount - 2);
    return previousAllocatedSize + diffrenceInSize;
};

Template.TreatingPatients.sortNumberPayer = function(a, b) {
    return a - b;
};

//calculate Median value chart 
Template.TreatingPatients.calculateMedianPayer = function(dataArray) {
    //    dataArray.sort();
    dataArray.sort(Template.TreatingPatients.sortNumberPayer);
    var nthValue = Math.floor(dataArray.length / 2);

    if (dataArray.length % 2 === 0) {
        return (dataArray[nthValue - 1] + dataArray[nthValue]) / 2;
    } else {
        return dataArray[nthValue];
    }
};

// handle the event to click on change filter for treating patient.
let handleFilterChange = (flag) =>{

    removeActiveClassFromLists();
    showSPView();
    showSPlistView();
    hideSPDetailView();

    // //hide no data section 
    // $('.treatingSP404Section').hide();

    let planType = genotypes = treatment = cirrhosis = tenureValue = '';

    planType = getPlanTypeFromFilters();
    genotypes = getGenotypeFromFiltters();
    treatment = getTreatmentFromFilters();
    cirrhosis = getCirrhosisFromFilters();
    tenureValue = getLastYearValue();

    //set genotypes for profile filters
    setGenotypeComboForProfileSection(genotypes,cirrhosis,treatment,planType);

    var flag1 = '';

    if (genotypes[0].toLowerCase() == 'all' && $('.treatingInsurancePlanSelect').val() == 'all' && $('.treatingTreatment').val() == 'all' && $('.treatingCirrhosis').val() == 'all') {
        flag1 = 'all';
    }

    //for genotype all
    if (genotypes[0].toLowerCase() == 'all') {
        genotypes = [];
        for (var i = 0; i < GenotypeList.length; i++) {
            genotypes.push(GenotypeList[i].hcv_genotype);
        }
    }

    var categoryData = {
        genotypes: genotypes,
        treatment: treatment,
        cirrhosis: cirrhosis,
        flag: flag1
    };

    //set filters
    currentTabFilters =  categoryData;

    //console.log('----+++',categoryData,'+++--');
    let category_data = payerUtils.getPossibleCatCombination(categoryData);
    let id_list = category_data;


    let filter_med_list = [];
    if (isComparitiveFilter && flag != undefined && flag != 'all') {
        filter_med_list = flag;
        // Session.set('filterdruglist',filter_med_list);
        //console.log() 
    }

    if (planType === 'all') {
        var allPlans = [];
        ClaimsInsurancePlan.forEach(function(rec) {
            allPlans.push(rec['claims_insurancePlan']);
        });
        allPlans = allPlans.join(',');
        planType = allPlans.replace(',', '","');
    }

    //call the helper function get filtered data
    let dbParams = {};
    dbParams['ids'] = id_list.split(',');
    dbParams['plans'] = planType;
    dbParams['tenure'] = 0;
    dbParams['patientsType'] = 'treating';
    dbParams['filteredMedications'] = filter_med_list;

    payerUtils.storeFitersData('treating', categoryData, planType);

    // console.log('********DB Params*******');
    // console.log(dbParams);
    fetchAndRenderData(dbParams, id_list);

   
}

    // Supporting Functions
    let  getPlanTypeFromFilters = () => $('.treatingInsurancePlanSelect').val();


    function getGenotypeFromFiltters(domId) {
        let genotypes = '',
            id = domId ? domId:'treatingselectGenotype';

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
        let cls = domCls ? domCls: 'treatingTreatment',
            treatment = $('.'+cls).val();

        if (treatment == 'all') {
            treatment = 'Naive,Experienced';
        }
        treatment = treatment.split(','); // Converting it into an array.
        return treatment;
}

    function getCirrhosisFromFilters(domCls) {
        let id = domCls ? domCls : 'treatingCirrhosis',
            cirrhosis = $('.'+id).val();

        if (cirrhosis == 'all') {
            cirrhosis = 'Yes,No';
        }
        cirrhosis = cirrhosis.split(','); // Converting it into an array.
        return cirrhosis;
}

    function getLastYearValue() {
        return $('#selectTenureValue').val(); //get year value
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


    // var tenureValue = parseInt(ListOfYear[0].year) * 12;

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
    // dbParams['tenure'] = tenureValue;
    dbParams['patientsType'] = 'treating';
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

    //set filters value
    currentTabFilters = categoryData;

    payerUtils.storeFitersData('treating', categoryData, planType);
    fetchAndRenderData(dbParams, category_id);

}

function fetchAndRenderData(dbParams, id_list,profilecheck,selectedProf) {
    var changeDrugData = false;

    //check for filter applied or not
    if (!(isComparitiveFilter)) {
        changeDrugData = true;
    }
    //reset the savings profile
    if(!profilecheck)
        payerUtils.resetSavingsProfile('treating');


    Meteor.call('getAnalyticsDataForPatients', dbParams, function(error, result) {
        // console.log('*************Data Fetched fFom Server*****************');
        // console.log(result);
        if (!result) {
            sAlert.closeAll();
            sAlert.error('No Data Found for current selection! Please change filters', { timeout: 2500, onClose: function() {}, effect: 'bouncyflip', html: true, position: 'top-left' });
            return;
        }
        TreatingAnalyticsData = result;
        Session.set('treating_category_id_list', id_list); //get id_list from Session

        preparePayerToolData(id_list, result, changeDrugData);

        //refresh the universe quality indicators
        var optimizedData = Session.get('treatingPat_SPListData');
        var reactive_var = 'uniTreatingQualityIndicators';


        renderTheData(treatingSPData, optimizedData, reactive_var);

        
        //append UI for Savings Profile
        payerUtils.resetSavingsProfile('treating');
        subpopUtils.showOurRecomendations('treating',currentTabFilters,TreatingAnalyticsData,selectedProf);

        //return result;
    });
}


function renderTheData(treatingSPData, optimizedData, reactive_var) {

    payerUtils.renderUniverseQualityIndicators(treatingSPData, optimizedData, reactive_var);


    //hide load mask
    hideLoadingWheel();
    hideUniverseLoadingWheel();
    setTimeout(function() {
        //render charts for the tab
        payerUtils.renderChartsForTab('treating', treatingSPData);

        hideChartLoadingMask();
    }, 300);

    //show the subpopulation section
    $('.treatingSubpopulationWrapper').show();

}

// Not in use
// function renderSubPopulationCategoriesItem(obj){
//     //show  load mask
//     $('#anim_loading_theme').css('top','166%');
//     $('#anim_loading_theme').css('visibility','visible');
//     $('#overlay').show();

//     var ids = $(obj).attr('data');
//     $('.treatingSubCategoryInfo-PatientCategory').html($(obj).html());
//     var data = TreatingAnalyticsData;
//     Meteor.call('HcvAnalyticsTreatedBySingleCetagory',[ids,data],function(err, res){
// 		if(res.length > 0){
// 			$('.treatingThisCategoryPatients').html(res[0]['total']);
// 		}else{
// 			$('.treatingThisCategoryPatients').html(0);
// 		}
// 		var DrugsData = Template.TreatingPatients.__helpers.get('DrugsData')(res);
// 		renderSvgChartForSissionDataPayer('treating','Cost', 'Efficacy','.dimpleMapsContainerForPayer-treating');
// 		subpopUtils.DrawSPDrugInfoTableBody('treating',DrugsData);

//         //hide load mask
//         $('#anim_loading_theme').css('top','40%');
//         $('#anim_loading_theme').css('visibility','hidden');
//         $('#overlay').hide();
// 	});
// }

//render sub population data
let renderSubPopulationSingleCategory = (obj) =>{
    //show load mask
    showloadingWheel();

    let ids = $(obj).attr('data');
    let cat_id = $(obj).attr('identifier');
    $('.treating' + cat_id + 'SubCategoryInfo-PatientCategory').html(ids);
    var data = TreatingAnalyticsData;
    Meteor.call('HcvAnalyticsTreatedBySingleCetagory', [cat_id, data], function(err, res) {
        if (res.length > 0) {
            $('.treating' + cat_id + 'ThisCategoryPatients').html(res[0]['total']);
        } else {
            $('.treating' + cat_id + 'ThisCategoryPatients').html(0);
        }
        res = refineUtilization(res,cat_id);

        let DrugsData = Template.TreatingPatients.__helpers.get('DrugsData')(res, cat_id);
        renderSvgChartForSissionDataPayer('treating' + cat_id, 'Cost', 'Efficacy', '.dimpleMapsContainerForPayer-treating' + cat_id);
        subpopUtils.DrawSPDrugInfoTableBody('treating' + cat_id, DrugsData);

        //hide load mask
        hideLoadingWheel();
    });
}

  //function to set Utilization & count
let refineUtilization = (backendData,catID) =>{
        let resClone = [],
        baseData = Session.get('treatingPat_SPListData'),
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
//function to call when we apply filters
let preparePayerToolData = (id, analyticsdata, changeDrugData, isLoadedModel,recommedationFlag) =>{
    var id_list = id.split(',');
    var prepareddata = [];

    var AnalyticsData = analyticsdata;
    /*.filter(function(item){
                            return item.safety!=null && item.utilization!=null && item.value!=null;
             });*/
    //TreatingAnalyticsData.depend();
    //TreatingAnalyticsData = HcvAnalyticsTreating;
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
        var data = _.where(AnalyticsData, { category_id: parseInt(id_list[i]) });
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
            var sum_uti = 0;
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
                temp['comp_value'] = data[j].comp_value;
                temp['compli_cost'] = data[j].compli_cost;
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
            json['total_cost_display'] = commaSeperatedNumber(Math.round(json['total_cost']));
            json['best_value_cost'] = best_score_cost * total;
            json['best_value_cost_display'] = commaSeperatedNumber(Math.round(json['best_value_cost']));
            json['savings'] = total_cost - best_score_cost * total;
            json['savings_display'] = commaSeperatedNumber(json['savings']);
            best_score_cat += best_score;
            var observedvalue = (data.length <= 0 ? 0 : (sum_value_score / data.length));
            sum_score += observedvalue;
            total_cost_cat += total_cost;
            json['optimizedValue'] = 0;
            json['optimizedValue_display'] = commaSeperatedNumber(Math.round(json['optimizedValue']));
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
                $('.treatingcurrent_best').html(sum_score.toFixed(2));
                $('.treatingavgbest').html(best_score_cat);
                $('.treatingvaluegap').html(valuegap.toFixed(2));
            }

            $('.treatingcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
            $('.treatingcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
            $('.treatingcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));
            //calculate savings per patient
            var saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
            $('.treatingcardValueGapSaving').html('$ ' + commaSeperatedNumber(Math.round(saving_perpatient)));
            $('#treatingCurrentCount').html(commaSeperatedNumber(total_pop));
            $('.treatingTotalFilteredPatients').html(total_pop);

            //hide the load mask
            // document.getElementById("anim_loading_theme").style.visibility = "hidden";
            // document.getElementById("overlay").style.display = "none";
            // document.getElementById("anim_loading_theme").style.top = "40%";

            //update the subpopulation list table        
            // prepareddata.sort(function(a, b) {
            //     return a.count - b.count;
            // });
            //sort data based on subpopulation
            //prepareddata.sort(sortAlphaNumAsc);
            //complication rate data

            Session.set('treatingTotalPatients', total_pop);
            if (!isLoadedModel) {
                if (changeDrugData) {
                    var finalData = [];
                    var dataArray = _.groupBy(TreatingAnalyticsData, 'medication');;
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
                    Session.set('treatingPat_ComplicationData', finalData);
                }
                Session.set('treatingPat_SPListData', prepareddata);
            }

            //set the filtered data in the variable to compute the difference with the optimized one
            treatingSPData = prepareddata;
            var parentSelector = 'treatingSubPopulationList-Footer';
            $('.' + parentSelector + ' .SPList-totalPatients').html(total_pop);
            $('.' + parentSelector + ' .totalProjectedCost').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
            $('.' + parentSelector + ' .totalBestCost').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
            $('.' + parentSelector + ' .totalSavingsOppurtunity').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));
    }
    else{
        return prepareddata;
    }
}

//function to calculate savings and values based on weight applied
//here we are passing id list of patients
Template.TreatingPatients.valuecalculatorAdvanced = function(isLoadedModel) {

    //return if filters return blank data
    if (treatingSPData.length == 0) {
        return;
    }
    // w1 = localStorage.getItem('weff')==undefined?1:(parseFloat(localStorage.getItem('weff')/100)); //get efficacy slider value in range 1-10
    // w2 = localStorage.getItem('wadh')==undefined?1:(parseFloat(localStorage.getItem('wadh')/100)); //get adherence slider value in range 1-10
    // w3 = localStorage.getItem('wcost')==undefined?1:(parseFloat(localStorage.getItem('wcost')/100)); //get cost slider value in range 1-10
    let efficacy = $('#txtEffWeightTreating').val();
    let adherence = $('#txtAdhWeightTreating').val();
    let cost = $('#txtCostWeightTreating').val();

    w1 = efficacy / 100; //get efficacy slider value 
    w2 = adherence / 100; //get adherence slider value 
    w3 = cost / 100; //get cost slider value
    //set all value scoresand savings to zero if no filters applied i.e 0%
    if (w1 === 0 && w2 === 0 && w3 === 0) {
        $(".alls").html(0);
        $('.treatingcurrent_best').html(0); //set observed value
        $('.treatingavgbest').html(0); //set average best score
        $('.treatingvaluegap').html(0); // set value gap
        $('.treatingcardValueBest').html('$ ' + commaSeperatedNumber(0)); //set value best savings to 0
        $('.treatingcardValueGap').html('$ ' + commaSeperatedNumber(0)); //set savings opportunity lost 
        $('.treatingcardValueGapSaving').html('$ ' + commaSeperatedNumber(0)); //set savings per ptient to 0
        return;
    }
    var id_list = Session.get('treating_category_id_list').split(',');
    //var id_list = id.split(','); //slit id to array
    var prepareddata = []; //data to store values
    var AnalyticsData = TreatingAnalyticsData; //get data from Subscription variable
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
            json['category_id'] = parseInt(id);
            json['count'] = total;
            json['category_name'] = category_name_list[parseInt(id) - 1];
            json['total_cost'] = total_cost;
            json['total_cost_display'] = commaSeperatedNumber(Math.round(json['total_cost']));
            json['best_value_cost'] = best_score_cost * total;
            json['best_value_cost_display'] = commaSeperatedNumber(Math.round(json['best_value_cost']));
            json['savings'] = total_cost - best_score_cost * total;
            json['savings_display'] = commaSeperatedNumber(Math.round(json['savings']));
            best_score_cat += best_score; //calculate sum of best scores
            var observedvalue = sum_value_score / data.length; //get observed value score
            sum_score += observedvalue; //sum of value scores observed
            total_cost_cat += total_cost; //total cost across all categories
            best_value_cost_cat += best_score_cost * total; //best value cost of all categories
            total_savings += total_cost - best_score_cost * total; //savings for all categories
            total_pop += total; //total length of all categories i.e patient count 
            json['optimizedValue'] = 0;
            json['optimizedValue_display'] = commaSeperatedNumber(Math.round(json['optimizedValue']));
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
        $('.treatingcurrent_best').html(sum_score.toFixed(2));
        $('.treatingavgbest').html(best_score_cat);
        $('.treatingvaluegap').html(valuegap.toFixed(2));
    }


    $('.treatingcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
    $('.treatingcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
    $('.treatingcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));
    var saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
    $('.treatingcardValueGapSaving').html('$ ' + commaSeperatedNumber(saving_perpatient));
    $('#treatingCurrentCount').html(commaSeperatedNumber(total_pop));
    $('.treatingTotalFilteredPatients').html(total_pop);

    //set data for display in universe Section
    let UniverseSavingData = {
                                'TotalCost':Math.round(total_cost_cat),
                                'Saving':total_savings,
                                'BestValueUtilization':best_value_cost_cat,
                                'QualityIndicators':[]
                             }
    Session.set('Treating_UniverseSavingData',UniverseSavingData);

    // if this is a loaded model then we do not want ot set the data into session variable as we have already done that.
    if (!isLoadedModel) {
        Session.set('treatingPat_SPListData', prepareddata);
    }
    Session.set('treatingTotalPatients', total_pop);
    var parentSelector = 'treatingSubPopulationList-Footer';
    $('.' + parentSelector + ' .SPList-totalPatients').html(total_pop);
    $('.' + parentSelector + ' .totalProjectedCost').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
    $('.' + parentSelector + ' .totalBestCost').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
    $('.' + parentSelector + ' .totalSavingsOppurtunity').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));

}

Template.TreatingPatients.SaveCurrentModel = function() {
    let userid = Meteor.user().profile.userDetail.email;
    let dbParams = {
        'userId': userid,
        'modelName': $('.treating_modelNameInput').val()
    };

    let selectedFilters = payerUtils.getFiltersData();
    //console.log(selectedFilters);
    let genotypes = selectedFilters.treating.genotypes;
    let treatment = selectedFilters.treating.treatment;
    let cirrhosis = selectedFilters.treating.cirrhosis;
    let planType = selectedFilters.treating.planType;
    let flag = selectedFilters.treating.flag;

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

    //let id_list = Session.get('category_id_list');

    let relativeWeights = getRelativeWeightsSliderData();


    let optimizedData = Session.get('treatingPat_SPListData');

    localStorage.setItem('treating_category_id_list', JSON.stringify(id_list));


    let complicationRateData = Session.get('treatingPat_ComplicationData');

    let UniverseSavingData = {
                                'TotalCost':parseInt($('.treatingcardValueObserved').html().replace(/\D/g,'')),
                                'Saving':parseInt($('.treatingcardValueGap').html().replace(/\D/g,'')),
                                'BestValueUtilization':parseInt($('.treatingcardValueBest').html().replace(/\D/g,'')),
                                'QualityIndicators':Session.get('uniTreatingQualityIndicators'),
                                'UniverseSafety':Session.get('treatingUniverse_safety')
                             }

    let modelNote = $('.treating_modelNotesInput').val().trim();
    let modelName = $('.treating_modelNameInput').val();
    userid = Meteor.user().profile.userDetail.email;
    let lastUpdated = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
    let tabName = 'Treating';
    if (modelName == '' || userid == undefined) {
        showModelDetails();
        $('.js-showModelDetails-treating').hide();
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
            'AnalyticsRowData': JSON.stringify(TreatingAnalyticsData),
            'OptimizedData': JSON.stringify(optimizedData),
            'isComplicationRateFilter': isComparitiveFilter,
            'ComplicationRateDrugsData': JSON.stringify(complicationRateData),
            'SelectedFilters': JSON.stringify(selectedFilters.treating),
            'RelativeWeightsSliders': JSON.stringify(relativeWeights),
            'UntreatedTabPatietsSlider': JSON.stringify([1]),
            'action': 'no',
            'modelId': Session.get('treating_currentModelId'),
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
                    Session.set('treating_isCurrentModelModified', false);
                    Session.set('isModel', true);
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
                                Session.set('treating_isCurrentModelSaved', true);
                                Session.set('treating_isCurrentModelModified', false);
                                Session.set('isModel', true);
                                Session.set('treating_currentModelId', result[0].modelId);
                                $('.treating_saveModelButton').attr('data', result[0].modelId);

                            }
                        }
                    });
                }

            }
        });

        // hideSaveButton();


    }
    // });

}

Template.TreatingPatients.loadSavedModel = function(modelId) {

    removeActiveClassFromLists();
    showSPView();
    showSPlistView();
    hideSPDetailView();

    //let selectedFilters = payerUtils.getFiltersData('treating');
    let treatingAnalyticsData = [];
    let relativeWeights = [];
    let optimizedData = [];
    let mainFilters = [];
    let isComplicationFilterApplied = false;
    let complicationRateData = [];
    let spLocalStorageData = [];
    showUniverseLoadingWheel();
    showChartLoadingMask();
    Meteor.call('getSavedModelData', [{ userId: Meteor.user().profile.userDetail.email, id: modelId }], function(error, result) {
        if (error) {

        } else {
            Session.set('isModel', true);
            treatingAnalyticsData = JSON.parse(result[0].AnalyticsRowData);
            relativeWeights = JSON.parse(result[0].RelativeWeightsSliders);
            optimizedData = JSON.parse(result[0].OptimizedData);
            mainFilters = JSON.parse(result[0].SelectedFilters);

            Session.set('treatingPat_ComplicationData', JSON.parse(result[0].ComplicationRateDrugsData))
            isComparitiveFilter = result[0].isComplicationRateFilter == 0 ? false : true;

            let UniverseSavingData = JSON.parse(result[0].UniverseSavingData);
            Session.set('Treating_UniverseSavingData',UniverseSavingData);

            spLocalStorageData = JSON.parse(result[0].localStorageSPData) || []; //JSON.parse(localStorage.getItem('subpopulationOptimizedData'));
            setSPLocalStorageData(spLocalStorageData);

            currentModelId = result[0].modelId;
            Session.set('treating_isCurrentModelModified', false);
            Session.set('treating_isCurrentModelSaved', true);
            Session.set('treating_currentModelId', result[0].modelId);
            //set model box details
            $('.treating_modelNotesInput').val(result[0].note);
            $('.treating_modelNameInput').val(result[0].modelName);
            $('.treating_saveModelButton').attr('data', result[0].modelId);

            let genotypes = mainFilters.genotypes;
            let treatment = mainFilters.treatment;
            let cirrhosis = mainFilters.cirrhosis;
            let planType = mainFilters.planType;
            let flag = mainFilters.flag;
            //let tenureValue = mainFilters.tenureValue;

            let categoryData = {
                genotypes: genotypes,
                treatment: treatment,
                cirrhosis: cirrhosis,
                flag: flag
            };

            // Set Current filters value.
            payerUtils.storeFitersData('treating', categoryData, planType, 0);

            //get the category id list and category name
            let category_data = payerUtils.getPossibleCatCombination(categoryData);
            let id_list = category_data;
            //global variable for treatedDbData
            TreatingAnalyticsData = treatingAnalyticsData;
            Session.set('treating_category_id_list', id_list);

            // //check for filter applied or not
            // if(isComplicationFilterApplied) {
            //     //store complication rate data in  session
            //     Session.set('treatedPat_ComplicationData', complicationRateData);   
            // }

            // The ChangedData in the arguments will be false as we are not clicking ont he Go button of the main filters. 
            preparePayerToolData(id_list, treatingAnalyticsData, false, true);

            setMainFilters(mainFilters);
            setRelativeWeights(relativeWeights);

            let reactive_var = 'uniTreatingQualityIndicators';

            // "treatingSPData" is set into the session in "preparePayerToolData" function.
            payerUtils.renderUniverseQualityIndicators(treatingSPData, optimizedData, reactive_var);
            optimizedData.sort(function(a, b) {
                return b.count - a.count;
            });

            collapseSubpopulationDetailView();

            Session.set('treatingPat_SPListData', optimizedData);

            // Updated Calculation according to Relative Weights Sliders.
            Template.TreatingPatients.valuecalculatorAdvanced(true);

            //hide load mask
            hideLoadingWheel();
            hideUniverseLoadingWheel();
            setTimeout(function() {
                //render charts for the tab
                payerUtils.renderChartsForTab('treating', treatingSPData);

                hideChartLoadingMask();
            }, 300);

            //show the subpopulation section
            $('.treatingSubpopulationWrapper').show();

        }
    });


}

function collapseSubpopulationDetailView() {
    //remove all active classes
    $('.treatingdetailViewLink').each(function(index) {
        $(this).removeClass('active');
    });
    //hide all subpopulation info
    $('.treatingSubPopulationView-ListBody .subPopulationListViewDetailView').each(function(index) {
        $(this).attr('style', 'display:none');
    });
}

//check for model modification
function isModelChanged(type) {

    if (isCurrentModelSaved) {
        isCurrentModelModified = true;
    }
    showSaveButton();

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


function complicationBodytreating() {
    $('.treatingcomplicationData').html('');
    var data = Session.get('treatingPat_ComplicationData');
    var html = ''; //<div class="col-md-12 complicationRateViewP complicationRateViewtreated" id = "complicationRateView_treated">';
    for (var i = 0; i < data.length; i++) {
        html += '<div class="col-md-12 complicationRateViewP complicationRateViewtreating" id = "complicationRateView_treating">';
        html += '<div class="col-md-1 checkbox">' +
            '<label>';
        if (isDrugChecked(data[i].drugIds.split(','), 'treatingPat_SPListData', isComparitiveFilter)) {
            html += '<input type="checkbox" class=" medcomplisttreating" value="' + data[i].drugIds + '" checked/>';
        } else {
            html += '<input type="checkbox" class=" medcomplisttreating" value="' + data[i].drugIds + '"/>';
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

    $('.treatingcomplicationData').html(html);
    //$('.medcomplisttreating').trigger('click');
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
    $(".treatingChartscontainer").css("visibility", "hidden");
    $(".chart_loader_overlay").show();
    $(".chart_loader").show();
}

function hideChartLoadingMask() {
    $(".treatingChartscontainer").css("visibility", "Visible");
    $(".chart_loader_overlay").hide();
    $(".chart_loader").hide();
}

function assignEventForResetFunctionality() {
    //treated reset event
    $('#treatingreset').click(function(e) {
        payerUtils.resetPayerFilters(e.currentTarget);
    });
}

function setTotalPatientCount() {
    $('#treatingTotalCount').html(AdvPayerPatientsCount[0].treated);
}

function hideAndShowSPSections() {
    $('.treatingPatienttemplateSubSection').hide();
    $('.subPopulationListViewDetailView').hide();
    $('.treatingPatientchartSection').show();
    $('.treatingSubPopulationListView-Container').show();
}

function assignEventRelatveSliders() {

    //weight slider function on change
    $("#txtEffWeightTreating").change("input", function(e) {
        Template.TreatingPatients.valuecalculatorAdvanced();
        Session.set('treating_isCurrentModelModified', true);

    });

    $("#txtAdhWeightTreating").change("input", function(e) {
        Template.TreatingPatients.valuecalculatorAdvanced();
        Session.set('treating_isCurrentModelModified', true);
    });

    $("#txtCostWeightTreating").change("input", function(e) {
        Template.TreatingPatients.valuecalculatorAdvanced();
        Session.set('treating_isCurrentModelModified', true);
    });
}


function setRelativeWeightsSliderTo100() {
    $('#txtEffWeightTreating').val(100);
    $('#txtAdhWeightTreating').val(100);
    $('#txtCostWeightTreating').val(100);

    $('#txtEffWeightTreating').rangeslider('update', true);
    $('#txtAdhWeightTreating').rangeslider('update', true);
    $('#txtCostWeightTreating').rangeslider('update', true);


    var output = $('#txtEffWeightTreating').next().next();
    output.html(100 + "%");
    var output = $('#txtAdhWeightTreating').next().next();
    output.html(100 + "%");
    var output = $('#txtCostWeightTreating').next().next();
    output.html(100 + "%");
}

function initSessionVariables() {
    //set subpopulation list data blank
    Session.set('treatingPat_SPListData', []);
    Session.set('treatingPat_ComplicationData', []);
    //set the universe quality indicators value null
    Session.set('uniTreatingQualityIndicators', null);
}

function assignEventToCloseAllPopovers() {
    // To Open One Popover at a time and close other.
    $('[data-toggle=popover]').on('click', function(e) {
        $('[data-toggle=popover]').not(this).popover('hide');
    });
}

function renderComplicationRatePopup() {
    //----- OPEN popup for Complication rate
    $('.treatingDrugCheck .complicationRate').on('click', function(e) {
        // var targeted_popup_class = jQuery(this).attr('data-popup-open');
        // $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);

        e.preventDefault();
        $('.treatingcomplicationData').html('');
        var data = Session.get('treatingPat_ComplicationData');
        var html = ''; //<div class="col-md-12 complicationRateViewP complicationRateViewtreated" id = "complicationRateView_treated">';
        for (var i = 0; i < data.length; i++) {
            html += '<div class="col-md-12 complicationRateViewP complicationRateViewtreating" id = "complicationRateView_treating">';
            html += '<div class="col-md-1 checkbox">' +
                '<label>';
            if (isDrugChecked(data[i].drugIds.split(','), 'treatingPat_SPListData', isComparitiveFilter)) {
                html += '<input type="checkbox" class=" medcomplisttreating" value="' + data[i].drugIds + '" checked/>';
            } else {
                html += '<input type="checkbox" class=" medcomplisttreating" value="' + data[i].drugIds + '"/>';
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

        $('.treatingcomplicationData').html(html);
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
        $('#treatingselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        $('#treatingselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
        $('.isCheckedtreating').each(function(d) {
            $(this).prop('disabled', false);
            if ($(this).val() == currPatient[0].Genotype) {
                $(this).trigger('click');
            }
        });
        $('.isCheckedtreatingProfile').each(function(d) {
            $(this).prop('disabled', false);
            if ($(this).val() == currPatient[0].Genotype) {
                $(this).trigger('click');
            }
        });
        
    }, 200);
}

//set filteron profile section view popup
let setGenotypeComboForProfileSection = (genotypes,cirrhosis,treatment,planType) =>{

    genotypes = genotypes?genotypes:getGenotypeFromFiltters();
    planType = planType?planType:getPlanTypeFromFilters();
    //genotypes = getGenotypeFromFiltters();
    treatment = treatment?treatment:getTreatmentFromFilters();
    cirrhosis = cirrhosis?cirrhosis:getCirrhosisFromFilters();


    if(genotypes[0] == 'all'){
         $('#treatingselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
    }
    else{
            $('#treatingselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
            $('#treatingselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');

            $('.isCheckedtreatingProfile').each((d,element) =>{
                //$(element).prop('disabled', false);
                if (genotypes.indexOf($(element).val()) > -1 && !$(element).prop('disabled')) {
                    $(element).trigger('click');
                }
            });
    }

    treatingPlanSelectProfile[0].selectize.setValue(planType);

    //set treatment
    let treat = treatment.length > 1 ? 'all' : (treatment[0] == 'Yes' ? 'Naive' : 'Experienced');
    treatingTreatmentSelectProfile[0].selectize.setValue(treat);

    //set cirrhosis
    if (cirrhosis.length <= 1) {
        treatingCirrhosisProfile[0].selectize.setValue(cirrhosis[0]);
    } else {
        treatingCirrhosisProfile[0].selectize.setValue('all');
    }


}


// Remove Active class from the lists in the List view.
function removeActiveClassFromLists() {
    $('.treatingdetailViewLink').each(function(index) {
        $(this).removeClass('active');
    });
}

//show sub population section
function showSPView() {
    $('.treatingchartSubPopulation').show();
}

//show sub population list view section
function showSPlistView() {
    $('.treatingSubPopulationListView-Container').show();
}

//hide the sub population detail view
function hideSPDetailView() {
    $('.treatingSubPopulationDetailView-Container').hide();
}

function getCurrentPatientData() {
    return Session.get('selectedPatientData')[0];
}



function showSaveButton() {
    var hidden = $('.treating_saveModelContainer');
    hidden.show('slide', { direction: 'left' }, 400);
    hidden.animateCss('fadeInLeft');
    hidden.animateCss('bounce');

}


function hideSaveButton() {
    var hidden = $('.treating_saveModelContainer');
    hidden.animateCss('fadeOutRight');
    hidden.hide('slide', { direction: 'left' }, 400);
}


function hideModelDetails() {
    var hidden = $('.treating_modelInfoContainer');
    hidden.hide('slide', { direction: 'left' }, 400);
}

function showModelDetails() {
    var hidden = $('.treating_modelInfoContainer');
    hidden.show('slide', { direction: 'left' }, 400);
}

function getRelativeWeightsSliderData() {
    let obj = {};
    let efficacy = $('#txtEffWeightTreating').val();
    let adherence = $('#txtAdhWeightTreating').val();
    let cost = $('#txtCostWeightTreating').val();

    obj['efficacy'] = efficacy;
    obj['adherence'] = adherence;
    obj['cost'] = cost;

    return obj;
}

let setMainFilters = function(data) {
    //console.log("Setting Main Filters");
    //console.log(data);
    var genotypes = data.genotypes;
    if (genotypes == undefined) {
        genotypes = [];
    }

    if (genotypes.length == GenotypeList.length) {
        if ($('.isCheckedalltreating').prop('checked') == false) {
            $('#treatingselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        }
    } else {
        if ($('.isCheckedalltreating').prop('checked') == false) {
            $('#treatingselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        }
        $('#treatingselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        $('.isCheckedtreating').each(function(d) {
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
    treatingPlanSelect[0].selectize.setValue(plan);

    //set treatment
    let treat = data.treatment.length > 1 ? 'all' : data.treatment[0];
    treatingTreatmentSelect[0].selectize.setValue(treat);

    //set cirrhosis
    if (data.cirrhosis.length <= 1) {
        treatingCirrhosis[0].selectize.setValue(data.cirrhosis[0]);
    } else {
        treatingCirrhosis[0].selectize.setValue('all');
    }
}

let setRelativeWeights = function(data) {
    //console.log("Setting Relative Weights");
    //console.log(data);
    $('#txtEffWeightTreating').val(data.efficacy);
    $('#txtAdhWeightTreating').val(data.adherence);
    $('#txtCostWeightTreating').val(data.cost);

    $('#txtEffWeightTreating').rangeslider('update', true);
    $('#txtAdhWeightTreating').rangeslider('update', true);
    $('#txtCostWeightTreating').rangeslider('update', true);

    var output = $('#txtEffWeightTreating').next().next();
    output.html(data.efficacy + "%");
    var output = $('#txtAdhWeightTreating').next().next();
    output.html(data.adherence + "%");
    var output = $('#txtCostWeightTreating').next().next();
    output.html(data.cost + "%");
}

let hideLoadingWheel = function() {
    $('#anim_loading_theme').css('top', '40%');
    $('#anim_loading_theme').css('visibility', 'hidden');
    $('#overlay').hide();
}

let showloadingWheel = function() {
    $("#anim_loading_theme").css("top", "90%");
    $("#anim_loading_theme").css("visibility", "visible");
    $("#overlay").show();
}



function getOptimizedDataFromLocalStorage(ids) {
    // let tabname = "treating";
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
    $('.treatingSubPopulationView-ListBody .inner').each(function() {
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

function setSPLocalStorageData(data) {
    //console.log(data);
    Session.set('treatingSPSvgData', data);
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
    let baseData = _.groupBy(TreatingAnalyticsData,'category_id');

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
    $('.treatingcurrent_best').html(sum_score.toFixed(2));
    $('.treatingavgbest').html(best_score_cat);
    $('.treatingvaluegap').html(valuegap.toFixed(2));

    $('.treatingcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
    $('.treatingcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
    $('.treatingcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));

    //calculate savings per patient
    let saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
    $('.treatingcardValueGapSaving').html('$ ' + commaSeperatedNumber(saving_perpatient));
    $('#treatingCurrentCount').html(commaSeperatedNumber(total_pop));
    $('.treatingTotalFilteredPatients').html(total_pop);
    Session.set('treatingTotalPatients', total_pop);

    preparedData.sort(function(a, b) {
        return b.count - a.count;
    });

    //set the data into session variable 
    Session.set('treatingPat_SPListData', preparedData);

    //set the filtered data in the variable to compute the difference with the optimized one
    treatingSPData = preparedData;

    //refresh the universe quality indicators
    var optimizedData = Session.get('treatingPat_SPListData');
    var reactive_var = 'uniTreatingQualityIndicators';

    renderTheData(treatingSPData, optimizedData, reactive_var);

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