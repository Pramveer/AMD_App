import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './treated.html';
import { ReactiveVar } from 'meteor/reactive-var';
import * as subpopUtils from '../../../lib/custom/payer/AdvPayerSPUtils.js';
import * as payerUtils from '../../../lib/custom/payer/payerToolUtilities.js';

//default sort order for Sub population List view
var treatedSPData = [],
    allDrugsList = null,
    isComparitiveFilter = false;

let treatedPlanSelect = '';
let treatedTreatmentSelect = '';
let treatedTenureSelect = '';
let treatedCirrhosis = '';
let treatedFdaCombo = ``;
let treatedRebateCombo = ``;
let treatedPreactingCombo = '';

let treatedPlanSelectProfile = '';
let treatedTreatmentSelectProfile = '';
let treatedTenureSelectProfile = '';
let treatedCirrhosisProfile = '';
let treatedFdaComboProfile = ``;
let treatedRebateComboProfile = ``;
let treatedPreactingComboProfile = '';

//global variable for treatedDbData
TreatedAnalyticsData = null;
let headerparams = {};
//current filters
var currentTabFilters = null;

//complications rate checked drugs
let complication_CheckedDrugs = [];

// Keep RelativeWeights
let ralativeWeights = {};


Template.TreatedPatients.rendered = function() {


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
    treatedPlanSelect = $('.treatedInsurancePlanSelect').selectize();
    treatedTreatmentSelect = $('.treatedTreatment').selectize();
    treatedTenureSelect = $('.treatedtenure').selectize();
    treatedCirrhosis = $('.treatedCirrhosis').selectize();
    treatedFdaCombo = $('.treatedFdaCombo').selectize();
    treatedRebateCombo = $('.treatedRebateCombo').selectize();
    treatedPreactingCombo = $('.treatedPreactingCombo').selectize();

    let currentFilters = getCurrentPopulationFilters();
    let treat = currentFilters.treatment.length > 1 || currentFilters.treatment.length < 1 ? 'all' : convertFirstLetterCaps(currentFilters.treatment[0]),
        cirrhosis = currentFilters.cirrhosis.length > 1 || currentFilters.cirrhosis.length < 1 ? 'all' : convertFirstLetterCaps(currentFilters.cirrhosis[0]);

    treatedPlanSelect[0].selectize.setValue('all');
    treatedTreatmentSelect[0].selectize.setValue(treat);
    treatedCirrhosis[0].selectize.setValue(cirrhosis);
    //treatedTenureSelect[0].selectize.setValue(parseInt(ListOfYear[0].year));

    //initital selectize for profile
    treatedPlanSelectProfile = $('.treatedInsurancePlanSelectProfile').selectize();
    treatedTreatmentSelectProfile = $('.treatedTreatmentProfile').selectize();
    treatedTenureSelectProfile = $('.treatedtenureProfile').selectize();
    treatedCirrhosisProfile = $('.treatedCirrhosisProfile').selectize();
    treatedFdaComboProfile = $('.treatedFdaComboProfile').selectize();
    treatedRebateComboProfile = $('.treatedRebateComboProfile').selectize();
    treatedPreactingComboProfile = $('.treatedPreactingComboProfile').selectize();

    treatedPlanSelectProfile[0].selectize.setValue('all');
    treatedTreatmentSelectProfile[0].selectize.setValue(treat);
    treatedCirrhosisProfile[0].selectize.setValue(cirrhosis);
    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    //treatedTenureSelectProfile[0].selectize.setValue(parseInt(ListOfYear[0].year));
    treatedFdaComboProfile[0].selectize.setValue('all');

    // added by Yuvraj 11th April 2017 : Render waste opportuntiy section by default
    //renderWasteOpportunitySection();
};


//  Helper Functions
Template.TreatedPatients.helpers({

    'getAnalyticsData': function(id_list, plan, time, type, safe, med_id, callback) {
        //change filter variables
        TreatedAnalyticsData.change([id_list, plan, time, type, safe, med_id]);
        //get data from MySQL subscription variable
        var myVar = setInterval(function() {
            if (TreatedAnalyticsData.ready()) {
                clearInterval(myVar);
                // console.log('***Data Fetched***');
                callback(TreatedAnalyticsData.reactive());
            }
        }, 1000);
    },

    'isModelPresent': function() {
        return Session.get('isModel');
    },

    'isModelChanged': function() {

        if (Session.get('treated_isCurrentModelModified')) {
            showSaveButton();
        } else {
            hideSaveButton();
        }
    },

    'uniTreatedQualityIndicators': function() {
        var data = Session.get('uniTreatedQualityIndicators');
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

    'renderTreatedSafetyQualityChart': function() {
        if (TreatedAnalyticsData) {
            renderUniverseSafetyIndicators('treated');
        }
    },

    'getListData': function() {
        var data = Session.get('treatedPat_SPListData');
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

    'isOptimizedValueGreaterThanZero': function(total_cost, optimizedValue) {
        if (optimizedValue != 0 && (total_cost != optimizedValue)) {
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

    'iscomplicationDataEmpty': function() {
        //return Session.get('treatedPat_ComplicationData').length>0?false:true;
        var data = Session.get('treatedPat_ComplicationData');
        if (data) {
            if (data.length)
                return false;
            else
                return true;
        } else {
            return true;
        }
    },

    'isoptimizeDataIndicators': function(optimizeDataIndicators) {
        if (optimizeDataIndicators) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    // 'getListYear': function() {
    //     var list = [];
    //     var len = parseInt(ListOfYear[0].year);
    //     for (var i = 0; i < len; i++) {
    //         list.push({ "year": i + 1 });
    //     }
    //     return list;
    // },

    'DrugsData': function(data, category_id) {
        var selDrugsWithData;
        category_id = (category_id == undefined ? '' : category_id);
        if (data) {
            selDrugsWithData = subpopUtils.getPreparedDrugsData('treated' + category_id, data);
        } else {
            selDrugsWithData = subpopUtils.getPreparedDrugsData('treated' + category_id);
        }

        if (selDrugsWithData && selDrugsWithData.length > 0) {
            // Calculate total patient or drugN and remove further calculaton using 'calculatedTotalN' helper a
            var totalDrugN = selDrugsWithData && selDrugsWithData.length > 0 ? parseInt(selDrugsWithData[0].TotalN) : 0;
            //Always expect Array of object
            for (var i = 0; i < selDrugsWithData.length; i++) {

                // Yuvraj - 20th March
                // var onePatientN = selDrugsWithData[i].TotalN / 100;
                // ////use rounding off utilization value for consistency in payer cost calculation
                // var value = Math.round(onePatientN * (selDrugsWithData[i]['Utilization']['Utilization']));

                // var onePatientN = / 100;
                var onePatientUtilization = parseFloat((100 / selDrugsWithData[i].TotalN).toFixed(2));
                let patientsByUtilization = (1 / onePatientUtilization) * selDrugsWithData[i]['Utilization']['Utilization'];


                var payerCostc = selDrugsWithData[i]['Cost']['TotalCost'];

                selDrugsWithData[i]['calculatedTotalPayerCost'] = Math.round(parseInt(selDrugsWithData[i]['DrugN']) * (parseFloat(payerCostc)));
                selDrugsWithData[i]['dispalyCalculatedTotalPayerCost'] = commaSeperatedNumber(Math.round(parseFloat(parseInt(selDrugsWithData[i]['DrugN']) * (parseFloat(payerCostc)))));

                // Yuvraj - 20th March
                // selDrugsWithData[i]['calculatedTotalPatientCost'] = Math.round(parseFloat((value * parseFloat(payerCostc)) * 0.2));
                selDrugsWithData[i]['calculatedTotalPatientCost'] = Math.round(parseFloat((patientsByUtilization * parseFloat(payerCostc)) * 0.2));

                // Yuvraj - 20th March
                // selDrugsWithData[i]['dispalyCalculatedTotalPatientCost'] = commaSeperatedNumber(Math.round(parseFloat((value * parseFloat(payerCostc)) * 0.2)));
                selDrugsWithData[i]['dispalyCalculatedTotalPatientCost'] = commaSeperatedNumber(Math.round(parseFloat((patientsByUtilization * parseFloat(payerCostc)) * 0.2)));


                selDrugsWithData[i]['Efficacy']['Efficacy'] = selDrugsWithData[i]['Efficacy']['Efficacy'] == 'NA' ? 'NA' : Math.round(selDrugsWithData[i]['Efficacy']['Efficacy']);
                selDrugsWithData[i]['Efficacy']['Efficacy_Count'] = selDrugsWithData[i]['Efficacy']['Efficacy_Count'];
                selDrugsWithData[i]['Adherence']['Adherence'] = Math.round(selDrugsWithData[i]['Adherence']['Adherence']);
                selDrugsWithData[i]['Adherence']['Adherence'] = Math.round(selDrugsWithData[i]['Adherence']['Adherence']);
                selDrugsWithData[i]['isImsDrug'] = selDrugsWithData[i]['isImsDrug'];
                let isUtiFloat = isFloat(selDrugsWithData[i]['Utilization']['Utilization']);
                let utiVal = selDrugsWithData[i]['Utilization']['Utilization'];

                if (isUtiFloat) {
                    utiVal = utiVal.toFixed(2);
                } else {
                    utiVal = parseInt(utiVal);
                }

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
    },

    'stringifyOptimizedData': function(id) {
        let data = Session.get('treatedSPSvgData');
        let temp = "treated" + id + "SvgData";
        let requiredData = '';
        if (data) {
            for (let i = 0; i < data.length; i++) {
                if (data[i][temp]) {
                    requiredData = JSON.stringify(data[i][temp]);
                    //localStorage.setItem(temp, JSON.stringify(data[i][temp]));
                }
            }
        }

        return requiredData;
    }
});




// Events
Template.TreatedPatients.events({

    //click event for global search criteria
    'click #treatedPayerContainer': function(e, template) {
        //get filters data
        let currentFilters = getCurrentPopulationFilters();
        let treat = currentFilters.treatment.length > 1 || currentFilters.treatment.length < 1 ? 'all' : convertFirstLetterCaps(currentFilters.treatment[0]),
            cirrhosis = currentFilters.cirrhosis.length > 1 || currentFilters.cirrhosis.length < 1 ? 'all' : convertFirstLetterCaps(currentFilters.cirrhosis[0]);

        treatedPlanSelect[0].selectize.setValue('all');
        treatedTreatmentSelect[0].selectize.setValue(treat);
        treatedCirrhosis[0].selectize.setValue(cirrhosis);
        /**
         * @author: pramveer
         * @date:21st feb 2017  
         * @desc:removed years field from filters 
         */
        //treatedTenureSelect[0].selectize.setValue(parseInt(ListOfYear[0].year) * 12);

        //initital selectize for profile
        treatedPlanSelectProfile[0].selectize.setValue('all');
        treatedTreatmentSelectProfile[0].selectize.setValue(treat);
        treatedCirrhosisProfile[0].selectize.setValue(cirrhosis);
        /**
         * @author: pramveer
         * @date:21st feb 2017  
         * @desc:removed years field from filters 
         */
        //treatedTenureSelectProfile[0].selectize.setValue(parseInt(ListOfYear[0].year) * 12);
        treatedFdaComboProfile[0].selectize.setValue('all');
        showUniverseLoadingWheel();
        showChartLoadingMask();
        //trigger for changes to take effect
        //$('.treatedApplyUniFilters').trigger('click');
        handleFilterChange();
    },

    // Click Event for the Go button in the main filters.
    'click .treatedApplyUniFilters': function(e, template, data) {
        $('.treatedNodataSection').hide();
        $('.treatedDataSectionWrapper').show();

        if (data && data['data'] == 'refresh') {
            setGenotypeComboForCurrentPatient();
            let currentFilters = getCurrentPopulationFilters();

            // change plan type from array to string.
            if (currentFilters.planType instanceof Array) {
                currentFilters.planType = currentFilters.planType[0];
            }

            let treat = currentFilters.treatment.length == 1 ? convertFirstLetterCaps(currentFilters.treatment[0]) : 'all',
                cirrhosis = currentFilters.cirrhosis.length == 1 ? convertFirstLetterCaps(currentFilters.cirrhosis[0]) : 'all';

            treatedPlanSelect[0].selectize.setValue(currentFilters.planType != void 0 ? currentFilters.planType.replace(/'/g, "") : 'all');
            treatedTreatmentSelect[0].selectize.setValue(treat);
            treatedCirrhosis[0].selectize.setValue(cirrhosis);
            /**
             * @author: pramveer
             * @date:21st feb 2017  
             * @desc:removed years field from filters 
             */
            //treatedTenureSelect[0].selectize.setValue(parseInt(ListOfYear[0].year));
            headerparams['genotypes'] = AmdApp.Filters.genotypes;

            headerparams['cirrhosis'] = cirrhosis != null ? cirrhosis.toUpperCase() : 'All';
            headerparams['treatment'] = treat != null ? treat.toUpperCase() : 'All';
            //headerparams['planType'] = treat !=null?treat.toUpperCase():'All';
            //trigger all action
            //console.log('headerparams ', headerparams);
            //$('#treatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');

            // Set count of treated patients
            setTotalPatientCount();
            // Render Current patinet's data by default.
            renderCurrentPatientDataByDefault(currentFilters.planType.replace(/'/g, ""));
            // Nisha 02/20/2017 Changes for commorn Chorort menu
            setCohortHeaderMenu({ tabName: "payer" });

        } else {

            payerUtils.resetSavingsProfile('treated');

            if (Session.get('treated_isCurrentModelModified')) {
                Session.set('treated_editGoTrigger', true);
                showWarningMsgForLoadingModel(0, 'treated');
            } else {
                $(".c3-legend-item").remove();

                // showloadingWheel();
                showUniverseLoadingWheel();
                showChartLoadingMask();

                // Main Apply is clicked so we dont need previously stored Drugs for complication rate popups.
                isComparitiveFilter = false;
                $('.treated_modelInfoContainer .modelNotesInput').val('');
                $('.treated_modelInfoContainer .modelNameInput').val('');
                $('.treated_modelInfoContainer .saveModelButton').attr('data', '');
                hideSaveButton();
                Session.set('treated_isCurrentModelModified', false);
                Session.set('treated_isCurrentModelSaved', false);
                Session.set('treated_currentModelId', 0);

                setRelativeWeightsSliderTo100();
                //call handle filter function
                handleFilterChange();
            }
            // Remover All lgends from Chart Section if any.
        }

    },

    // Click Event for the Go button in the Saving Profile Popup.
    'click .treatedApplyUniFiltersProfile': function(e) {

        let planType = $('.treatedInsurancePlanSelectProfile').val(),
            genotypes = getGenotypeFromFiltters('treatedselectGenotypeProfile'),
            cirrhosis = getCirrhosisFromFilters('treatedCirrhosisProfile'),
            treatment = getTreatmentFromFilters('treatedTreatmentProfile'),
            /**
             * @author: pramveer
             * @date:21st feb 2017  
             * @desc:removed years field from filters 
             */
            //tenureValue = parseInt($('.treatedtenureProfile').val()),
            fdaCompliant = $('#treatedFdaComboProfile').val(),
            preactingValue = getPreactingAntiviralValue(true),
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

        let categoryData = {
            genotypes: genotypes,
            treatment: treatment,
            cirrhosis: cirrhosis,
            planType: planType,
            fdaCompliant: fdaCompliant,
            flag: allFlag,
            preactingValue: preactingValue
        };

        //get the category id list and category name
        var id_list = payerUtils.getPossibleCatCombination(categoryData);

        let dbParams = categoryData;
        dbParams['plans'] = planType == 'all' ? '' : planType;
        dbParams['duration'] = getCurrentPopulationFilters().duration;
        dbParams['patientsType'] = 'treated';
        dbParams['fdaCompliant'] = fdaCompliant;
        dbParams['filteredMedications'] = getCurrentPopulationFilters().medicationArray;
        //dbParams['showPreactingAntivirals'] = getCurrentPopulationFilters().showPreactingAntivirals;
        dbParams['showPreactingAntivirals'] = preactingValue;
        dbParams.rebateDiscount = getRebatePriceValueProfile();
        dbParams.rebateDb = getRebateDatasetName();
        //payerUtils.resetSavingsProfile('treated');

        Meteor.call('getAnalyticsDataForPatients', dbParams, (error, results) => {

            let decompressed_object = !results ? '{}' : LZString.decompress(results);
            let resulting_object = JSON.parse(decompressed_object);

            if (!resulting_object || _.isEmpty(resulting_object)) {
                sAlert.closeAll();
                sAlert.error('No Data Found for current selection! Please change filters', { timeout: 2500, onClose: function() {}, effect: 'bouncyflip', html: true, position: 'top-left' });
                return;
            }

            let id_list = getUniqueArray(_.pluck(resulting_object, 'category_id')).join(',');

            let result_data = preparePayerToolData(id_list, resulting_object, false, false, { renderTabView: false });
            //append UI for Savings Profile
            subpopUtils.showOurRecomendations('treated', categoryData, resulting_object, undefined, result_data);

        });

        //$('.treatedConditionSelectionProfile').hide();

    },

    //  Click event for New Drug configuration button
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


    'click .medcomplistchecked': function() {
        if ($('.medcomplistchecked').prop('checked') == true) {
            $('.medcomplisttreated').each(function(d) {
                $(this).prop('checked', true);
            });
        } else {
            $('.medcomplisttreated').each(function(d) {
                $(this).prop('checked', false);
            });
        }
    },


    'click .medcomplisttreated': function() {
        var stat = true;
        $('.medcomplisttreated').each(function(d) {
            if ($(this).prop('checked') == false) {
                stat = false;
            }
        });
        $('.medcomplistchecked').prop('checked', stat);
    },


    'input .treatedpayersearchbox': function(e) {
        var text = $(e.currentTarget).val().toLowerCase();
        $('.complicationRateViewtreated').each(function(d) {
            var patternd = $(this).text().toLowerCase().replace(/\s/g, '');
            if (patternd.indexOf(text) == -1) {
                $(this).css('display', 'none');
            } else {
                $(this).css('display', 'block');
            }

        });

    },

    // Click event for the Apply button in the complication rate view.
    'click .treatedcomplicationsApplybutton': function(e) {
        isComparitiveFilter = true;
        Session.set('treated_isCurrentModelModified', true);
        var listmed = $('.medcomplisttreated');
        var filter_med_list = '';
        var phs;
        for (var i = 0; i < listmed.length; i++) {
            if (listmed[i].checked == true && listmed[i].id == "0") {
                phs = 1;
                break;
            } else {
                phs = 0;
            }
        }
        if (phs) {

            $('.complicationsClosebutton').trigger('click');

            // Remover All lgends from Chart Section if any.
            $(".c3-legend-item").remove();

            // showloadingWheel();
            showUniverseLoadingWheel();
            showChartLoadingMask();

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
            //set the checked drugs in the array
            complication_CheckedDrugs = filter_meds;
            handleFilterChange(filter_meds);
        } else {

            sAlert.error('Select at least one Customer Drug');
        }

    },

    //  Not Sure --  need Some information about what this event does.
    'click .treatedSafety': function(e) {
        $('#' + e.currentTarget.id + '_innerPopup').toggle();
        var temp = $(e.currentTarget);
        if (document.getElementById(e.currentTarget.id + '_innerPopup').style.display == 'none') {
            $(temp.parent()).css({ 'background': 'transparent', 'height': '50px', 'padding-top': '0px', 'margin-top': '0px' });
        } else {
            $(temp.parent()).css({ 'background': 'rgba(128, 128, 128, 0.52)', 'height': '90px', 'padding-top': '10px', 'margin-top': '-10px' });
        }
    },

    'click #filters': (e) => {
        if ($('.treatedConditionSelectionProfile').is(":visible")) {
            $('.treatedConditionSelectionProfile').hide();
        } else {
            $('.treatedConditionSelectionProfile').show();
        }


    },
    // Click Event when we switch between Charts and Subpopulation Sections.
    'click .chartSubPopulationHeader .tabNavigation li a': function(e) {
        //console.log(e)
        var tabName = $(e.currentTarget).attr('tabName');
        $(e.currentTarget).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();

        showloadingWheel();
        // showUniverseLoadingWheel();
        // showChartLoadingMask();

        //removeTemplate();
        //if ($("#templateRenderSection").children().length > 0) {
        //    removeTemplate();
        //}

        //insertTemplate(tabName);
        $('.treatedPatienttemplateSubSection').hide();
        if (tabName === "charts") {
            $('.treatedPatientchartSection').show();
            $('.treatedPatientsubPopulationSection').hide();
            $('#treatedWasteOppotunityPopup-Content_new').hide();
            $('.treatedPatientourRecommendationsSection').hide();
        } else if (tabName === "sub population") {
            $('.treatedPatientsubPopulationSection').show();
            $('#treatedWasteOppotunityPopup-Content_new').hide();
            $('.treatedPatientourRecommendationsSection').hide();
            $('.treatedPatientchartSection').hide();
        } else if (tabName === "recommendations") {
            $('.treatedPatientourRecommendationsSection').show();
            $('.treatedPatientchartSection').hide();
            $('.treatedPatientsubPopulationSection').hide();
            $('#treatedWasteOppotunityPopup-Content_new').hide();
            $('.expand_recommendationBtn').attr('data', 'more');
            $('.reccProfile-moreSpSection').hide();
            $('.expand_recommendationBtn').html('more..');
            setGenotypeComboForProfileSection();
            $('#treatedWasteOppotunityPopup-Content_new').hide();
        } else if (tabName === "Clinical Appropriateness") {

            $('.js-wasteDiscontinuedTreatment').children('a').trigger('click');
            $('.js-wasteOverview').children('a').trigger('click');

            // renderWasteOpportunitySection();
            // appendWateDataUniverseLevel('#treatedWasteOppotunityPopup-Content_new');
            $('.treatedPatientourRecommendationsSection').hide();
            $('.treatedPatientchartSection').hide();
            $('.treatedPatientsubPopulationSection').hide();
            $('.treatedPatientwasteOpportunitySection').show();
            $('.js-wasteOppotunityNavLinks').removeClass('active');
            $('.js-wasteOverview').addClass('active');

            $('.tab-pane .wasteOppotunity-SectionWrapper').removeClass('active');
            $('#js-wasteOverviewTab').addClass('active');
            $('#treatedWasteOppotunityPopup-Content_new').show();


        }
        hideLoadingWheel();
        highlightTab(tabName);

        $('.treatedSubPopulationCategoriesItem').children().each(function(index) {
            if (index == 0) {
                $(this).trigger('click');
            }
        });
    },


    'click .subpopsort': function(e) {
        //alert($(e.currentTarget).attr('sort'));
        // var sortBy = 'count';
        // var value = $(e.currentTarget).attr('sort');
        // var data = Session.get('treatedPat_SPListData');

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

        // $('.subpopsort').each(function(){
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
        // $('.detailViewLink').each(function(index){
        //     $(this).removeClass('active');
        // });
        // //hide all subpopulation info
        // $('.treatedSubPopulationView-ListBody .subPopulationListViewDetailView').each(function(index){
        //     $(this).attr('style','display:none');
        // });
        // if($('.'+value).hasClass('sortred')){
        //     if($('.'+value).attr('type') == 'asc'){
        //         if(value == 'category_name'){
        //             data.sort(sortAlphaNumDesc);
        //         }
        //         else{
        //             data.sort(function(a, b) {
        //                 return b[sortBy] - a[sortBy];
        //             });
        //         }
        //         $('.'+value).attr('type','desc');
        //     }
        //     else if($('.'+value).attr('type') == 'no'){
        //           if(value == 'category_name'){
        //               data.sort(sortAlphaNumAsc);
        //         }
        //         else{
        //             data.sort(function(a, b) {
        //                 return a[sortBy] - b[sortBy];
        //             });
        //         }
        //          $('.'+value).attr('type','asc');
        //     }
        //     else{
        //           if(value == 'category_name'){
        //            data.sort(sortAlphaNumAsc);
        //         }
        //         else{
        //             data.sort(function(a, b) {
        //                 return a[sortBy] - b[sortBy];
        //             });
        //         }
        //          $('.'+value).attr('type','asc');
        //     }
        // }
        // Session.set('treatedPat_SPListData',data);
    },



    'click .sortComplicationRate': function(e) {
        var sortBy = 'drugGroupName';
        var value = $(e.currentTarget).attr('sort');
        var data = Session.get('treatedPat_ComplicationData');
        if (value == 'complicationCost') {
            sortBy = 'complicationCost';
        } else if (value == 'complicationRate') {
            sortBy = 'complicationRate';
        } else if (value == 'drugGroupName') {
            sortBy = 'drugGroupName';
        }
        $('.sortComplicationRate').each(function() {
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
        Session.set('treatedPat_ComplicationData', data);
        complicationBody();

    },


    'click .showtreatedall': function(e) {
        // showloadingWheel();
        showUniverseLoadingWheel();
        showChartLoadingMask();

        //make the filters selection to all
        payerUtils.setFiltersToAll('treated');

        //call handle filter function
        handleFilterChange('all');
    },


    'click .optimizeLink': function(e, template) {
        payerUtils.optimzeSPLinkClick(e.currentTarget);
    },

    // This event renders the Subpopulation Detail View
    'click .detailViewLink': function(e, template) {
        var ele = e.currentTarget;
        var categoryName = $(ele).attr('data');
        var category_id = $(ele).attr('identifier');
        $('.treatedTotalFilteredPatients').html(Session.get('treatedTotalPatients'));

        var isViewOpen = $('.treatedlistDetailView_' + category_id).css('display') == 'block' ? true : false;

        //detail view show and hide
        if (isViewOpen) {
            $('.treatedlistDetailView_' + category_id).hide();
            $(ele).removeClass('active');
        } else {
            $('.treatedlistDetailView_' + category_id).show();
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


    'change .treatedSubPopulationList-SortCombo': function(e, template) {
        var sortBy = 'count';
        var value = $(e.currentTarget).val();
        var data = Session.get('treatedPat_SPListData');
        if (value == 'projectedCost') {
            sortBy = 'optimizedValue';
        }
        data.sort(function(a, b) {
            return a[sortBy] - b[sortBy];
        });
        Session.set('treatedPat_SPListData', data);

        //trigger the first click of the Categories List
        setTimeout(function() {
            $('.treatedSubPopulationCategoriesItem:first-child').trigger('click');
        }, 200);
    },


    'click .treatedSubPopulationCategoriesItem': function(e, template) {
        $('.treatedSubPopulationCategoriesItem').removeClass('active');
        $(e.currentTarget).addClass('active');
        renderSubPopulationCategoriesItem(e.currentTarget);
    },


    // Not in Use
    'click .treatedDetailedAnalytics': function(e) {

        $('#treatedSubpopulationTab').css('display', 'block');
        $('#treatedSubpopulationTab').addClass('active').siblings().removeClass('active');

        e.preventDefault();

        showloadingWheel();
        // showUniverseLoadingWheel();
        // showChartLoadingMask();

        //removeTemplate();
        //if ($("#templateRenderSection").children().length > 0) {
        //    removeTemplate();
        //}

        //insertTemplate(tabName);
        $('.treatedPatienttemplateSubSection').hide();
        $('.treatedPatientchartSection').hide();
        $('.treatedPatientsubPopulationSection').show();

        var elem = $('#treatedSubpopulationTab');
        smooth_scroll_to(elem);

        hideLoadingWheel();
        highlightTab("sub population");
    },


    'click .treated_saveModelContainer .js-saveCurrentModel': function() {
        // SaveCurrentModel();
        // $('.saveModelNote').val('');
        // $('#saveModelName').val('');
    },


    'click .treated_saveModelContainer #js-saveModel': function() {
        Template.TreatedPatients.SaveCurrentModel();
        // $('.saveModelNote').val('');
        // $('#saveModelName').val('');

    },


    'click .treated_saveModelContainer .js-showModelDetails': function() {
        showModelDetails();
        $('.treated_saveModelContainer .js-showModelDetails').hide();
    },


    'click .treated_saveModelContainer .js-hideModelDetails': function() {
        hideModelDetails();
        setTimeout(function() {
            $('.treated_saveModelContainer .js-showModelDetails').show();
        }, 400);
    },


    'click .treated_saveModelContainer .js-LoadCurrentModel': function() {
        Template.TreatedPatients.loadSavedModel();
    },


    'click .treated_saveModelContainer .loadSavedModel': function() {
        listSavedModels();
    },
    // Added By Jayesh 20th March 2017 For Combined menu for Hospitalization Rate, New Drug, Model etc
    'click .js-menu-recommandation': function() {
        $('.js-payer-menu-panel').slideToggle();
    },
    'click .js-menuitem-selection': function() {
        $('.js-payer-menu-panel').hide();
    },

    // Not in Use
    'click .treatedsafecheck': function() {
        //if($('.treatedsafecheck')[0].checked == true){
        /*document.getElementById("anim_loading_theme").style.top = "90%";
        document.getElementById("anim_loading_theme").style.visibility = "visible";
        document.getElementById("overlay").style.display = "block";
        handleFilterChange();*/
        // }

    },


    'click .js-ourRecommendationsLink': function(event, template) {
        $('.expand_recommendationBtn').attr('data', 'more');
        $('.reccProfile-moreSpSection').hide();
        $('.expand_recommendationBtn').html('more..');
        $('.recommendationsContainer').css('overflow-y', 'auto');
        //$('#treatedRecommendationsPopup').show();
        setGenotypeComboForProfileSection();
    },

    // 'click .js-wasteOppotunityLink': function(event, template) {
    //     $('.js-wasteOppotunityNavLinks').removeClass('active');
    //     $('.js-wasteOverview').addClass('active');

    //     $('.tab-pane').removeClass('active');
    //     $('#js-wasteOverviewTab').addClass('active');

    //     $('#treatedWasteOppotunityPopup').show();

    //     appendWateDataUniverseLevel('#treatedWasteOppotunityPopup-Content');

    // },


    'click .js-treatedRecc-ApplyBtn': function(event, templat) {

        let profUtilizations = [1.0];
        let selectedProf = $('input[name=recommendationsRadio_treated]:checked').attr('data');

        if (selectedProf.toLowerCase() == 'profile_2') {
            profUtilizations = [0.75, 0.25];
        } else if (selectedProf.toLowerCase() == 'profile_3') {
            profUtilizations = [0.50, 0.25, 0.25];
        }

        payerUtils.setSavingsProfile('treated', selectedProf.toLowerCase());

        let planType = $('.treatedInsurancePlanSelectProfile').val(),
            genotypes = getGenotypeFromFiltters('treatedselectGenotypeProfile'),
            cirrhosis = getCirrhosisFromFilters('treatedCirrhosisProfile'),
            treatment = getTreatmentFromFilters('treatedTreatmentProfile'),
            rebate = getRebatePriceValueProfile(),
            rebateDb = getRebateDatasetName(),
            /**
             * @author: pramveer
             * @date:21st feb 2017  
             * @desc:removed years field from filters 
             */
            //tenureValue = parseInt($('.treatedtenureProfile').val()),
            fdaCompliant = $('#treatedFdaComboProfile').val(),
            preactingValue = getPreactingAntiviralValue(true);
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
        // if (planType === 'all') {
        //     //// OLD CODE COMMENTED FOR selection planType all
        //     var allPlans = [];
        //     ClaimsInsurancePlan.forEach(function(rec) {
        //         allPlans.push(rec['claims_insurancePlan']);
        //     });
        //     allPlans = allPlans.join(',');
        //     planType = allPlans.replace(',', '","');
        //     //// set planType null or empty if plantype all selcted , which is handled by server side
        //     //planType = '';
        // }

        let categoryData = {
            genotypes: genotypes,
            treatment: treatment,
            planType: planType,
            cirrhosis: cirrhosis,
            //tenureValue: tenureValue,
            flag: allFlag,
            fdaCompliant: fdaCompliant,
            rebate: rebate,
            rebateDiscount: rebate,
            rebateDb: rebateDb,
            preactingValue: preactingValue
        };

        //get the category id list and category name
        //var id_list = payerUtils.getPossibleCatCombination(categoryData);

        let dbParams = categoryData;
        dbParams['plans'] = planType;
        dbParams['duration'] = getCurrentPopulationFilters().duration;
        dbParams['patientsType'] = 'treated';
        //// OLD fda complaint check for recomandation profile
        // dbParams['fdaCompliant'] = getFdaComplaintCheck();
        dbParams['fdaCompliant'] = fdaCompliant;
        // categoryData.fdaCompliant = $('#treatedFdaComboProfile').val();

        dbParams['filteredMedications'] = getCurrentPopulationFilters().medicationArray;
        //dbParams['showPreactingAntivirals'] = getCurrentPopulationFilters().showPreactingAntivirals;
        dbParams['showPreactingAntivirals'] = preactingValue;

        $('#treatedRecommendationsPopup').hide();
        showloadingWheel();

        payerUtils.storeFitersData('treated', categoryData, planType);

        let profApplyObject = {
            renderTabView: true,
            selectedProf: selectedProf,
            profUtilizations: profUtilizations
        };
        fetchAndRenderData(dbParams, true, profApplyObject);

        payerUtils.setSavingsProfile('treated', selectedProf.toLowerCase());
        setMainFilters(categoryData);

        collapseSubpopulationDetailView();
    },

    'change #treatedRebateCombo': (event, template) => {
        //Todo show the rebate on popup
        //$(".rebatecheckbox input:radio:checked").prop("checked", false);

        //create dialog instance of jquery dialogue box 
        $("#treatedRebateOnSelection").dialog({
            dialogClass: 'containerDialog',
            minHeight: '100px',
            close: function(event, ui) {
                $(this).dialog('close');
                //hide the selectize dropdown
                $('.treatedRebateCombo .selectize-dropdown').hide();
                $('.treatedRebateCombo .selectize-input').removeClass('focus input-active dropdown-active');
                $('div.selectize-input > input').blur();
            }
        });

        //add the widget position
        $("#treatedRebateOnSelection").dialog("widget").position({
            my: 'center bottom+140px',
            at: 'left-60px',
            of: '.goButtonWrapper'
        });
        //event on radio button for closing dialog
        $(".rebatecheckbox input:radio").click(function() {
            $('#treatedRebateOnSelection').dialog('close');
            $('.treatedRebateCombo .selectize-dropdown').hide();
            $('.treatedRebateCombo .selectize-input').removeClass('focus input-active dropdown-active');
            $('div.selectize-input > input').blur();
        });
    },
    'click .js-uniWeightsMoveWarningYesBtn': (event, template) => {
        $('#uniWeightsMoveWarningMsgBox').hide();
        resumeUniverseSliders();
    },
    'click .js-uniWeightsMoveWarningNoBtn': (event, template) => {
        $('#uniWeightsMoveWarningMsgBox').hide();
        // relativeWeights is the variable that  preserve weights at last change.
        setRelativeWeightsSlider(ralativeWeights);
    },
    'click .clinical-appropriateness': (event) => {
        let data = $(event.currentTarget).attr('data');
        let container = '#treatedWasteOppotunityPopup-Content_new';
        // appendWateDataUniverseLevel('#' + data + '-clinical', data);
        appendWateDataUniverseLevel(container, data);
    },
    'click .nav-tabs li.disabled > a[data-toggle=tab]':(e)=>{
        e.stopImmediatePropagation();
    }
});



Template.TreatedPatients.destroyed = function() {
    treatedSPData = [];
    allDrugsList = null;
    isComparitiveFilter = false;

    //destroy the rebate dialog
    try {
        $('#treatedRebateOnSelection').dialog('destroy').remove();
    } catch (ex) {
        //console.log('initilization error of dialog');
    }

}

//Calculate of Size Payer.
Template.TreatedPatients.calculateSizePayer = function(minimum, maximum, populationSize, totalCount, previousAllocatedSize) {
    var diffrenceInSize = 12 / (totalCount - 2);
    return previousAllocatedSize + diffrenceInSize;
};

Template.TreatedPatients.sortNumberPayer = function(a, b) {
    return a - b;
};

//calculate Median value chart
Template.TreatedPatients.calculateMedianPayer = function(dataArray) {
    //    dataArray.sort();
    dataArray.sort(Template.TreatedPatients.sortNumberPayer);
    var nthValue = Math.floor(dataArray.length / 2);

    if (dataArray.length % 2 === 0) {
        return (dataArray[nthValue - 1] + dataArray[nthValue]) / 2;
    } else {
        return dataArray[nthValue];
    }
};




function highlightTab(tabName) {
    $(".treatedPatient .tabNavigation li").each(function(i) {
        if ($(this).children('a').html().toLowerCase() === tabName.toLowerCase()) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}


// handle the event to click on change filter for treated patient.
/*
    handles event on change filter
    get all condition filter data and values to make call to backend.
    initializes all charts and subpopulation data.
*/
// This Flag Comtains the list of medication if this function has been called by hitting the apply button of complication rate view.
function handleFilterChange(flag) {

    // The following function removes active class from subpopulation list view.
    removeActiveClassFromLists();

    showSPView();

    showSPlistView();

    hideSPDetailView();

    let planType = genotypes = treatment = cirrhosis = tenureValue = fdaCompliant = '';

    planType = getPlanTypeFromFilters();
    genotypes = getGenotypeFromFiltters();
    treatment = getTreatmentFromFilters();
    cirrhosis = getCirrhosisFromFilters();
    rebateDiscount = getRebatePriceValue();
    rebateDb = getRebateDatasetName();

    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    //tenureValue = getLastYearValue();
    fdaCompliant = getFdaComplaintCheck();
    headerparams['genotypes'] = genotypes.join(',');
    headerparams['cirrhosis'] = cirrhosis ? (cirrhosis.length > 1 ? 'All' : cirrhosis[0]) : 'All';
    headerparams['treatment'] = treatment ? (treatment.length > 1 ? 'All' : treatment[0]) : 'All';
    headerparams['planType'] = planType;

    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    // headerparams['tenureValue'] = tenureValue;

    setPayerHeaderTabData(headerparams);

    //set genotypes for profile filters
    setGenotypeComboForProfileSection(genotypes, cirrhosis, treatment, planType, tenureValue, fdaCompliant);

    // set flag1 for all data
    var flag1 = '';
    //if no  genotype and plan is selected then show all drugs info flag1 is to all and genotype value is passed
    if (genotypes[0].toLowerCase() == 'all' && $('.treatedInsurancePlanSelect').val() == 'all' && $('.treatedTreatment').val() == 'all' && $('.treatedCirrhosis').val() == 'all') {
        flag1 = 'all';
    }

    //if all is selected in the genotype Combo.
    if (genotypes[0].toLowerCase() == 'all') {
        genotypes = [];
        for (var i = 0; i < GenotypeList.length; i++) {
            genotypes.push(GenotypeList[i].hcv_genotype);
        }
    }

    // // if ALL is selected in the insurance Plan Select box
    // if (planType === 'all') {
    //     var allPlans = [];
    //     ClaimsInsurancePlan.forEach(function(rec) {
    //         allPlans.push(rec['claims_insurancePlan']);
    //     });
    //     allPlans = allPlans.join(',');
    //     planType = allPlans.replace(',', '","');
    // }


    //put the data into json object
    var categoryData = {
        genotypes: genotypes,
        treatment: treatment,
        cirrhosis: cirrhosis,
        fdaCompliant: fdaCompliant,
        planType: planType,
        flag: flag1,
        rebateDiscount: rebateDiscount,
        rebateDb: rebateDb
    };

    //set filters
    currentTabFilters = categoryData;

    //get the category id list and category name
    // var category_data = payerUtils.getPossibleCatCombination(categoryData);
    // var id_list = category_data;

    //call template function to get patients data
    //initilizing variable to get medication list id passed
    var filter_med_list = [];
    //if filter is applied and flag is not set to all then medication list is set medication list passed
    if (isComparitiveFilter && flag != undefined && flag != 'all') {
        filter_med_list = flag;
    } else {
        filter_med_list = getCurrentPopulationFilters().medicationArray;
    }

    //call the helper function get filtered data
    var dbParams = categoryData;
    dbParams['plans'] = planType;
    dbParams['duration'] = getCurrentPopulationFilters().duration;
    dbParams['patientsType'] = 'treated';
    dbParams['fdaCompliant'] = fdaCompliant;
    dbParams['filteredMedications'] = filter_med_list;
    //dbParams['showPreactingAntivirals'] = getCurrentPopulationFilters().showPreactingAntivirals;
    dbParams['showPreactingAntivirals'] = getPreactingAntiviralValue();

    payerUtils.storeFitersData('treated', categoryData, planType);
    fetchAndRenderData(dbParams, null, { renderTabView: true });

}

// Supporting Functions
function getPlanTypeFromFilters() {
    return $('.treatedInsurancePlanSelect').val()
}

function getGenotypeFromFiltters(domId) {
    let genotypes = '',
        id = domId ? domId : 'treatedselectGenotype';

    //get text data from mutlisselect combo
    $('#' + id + ' .multiSel').children().each(function(index) {
        genotypes += $(this).html().trim();
    });
    //remove last comma and change the genotype to array
    genotypes = genotypes[0] == ',' ? genotypes.substring(1, genotypes.length) : genotypes;
    genotypes = genotypes.split(',');
    return genotypes;
}

function getTreatmentFromFilters(domCls) {
    let cls = domCls ? domCls : 'treatedTreatment',
        treatment = $('.' + cls).val();

    if (treatment == 'all') {
        treatment = 'Naive,Experienced';
    }
    treatment = treatment.split(','); // Converting it into an array.
    return treatment;
}

function getCirrhosisFromFilters(domCls) {
    let id = domCls ? domCls : 'treatedCirrhosis',
        cirrhosis = $('.' + id).val();

    if (cirrhosis == 'all') {
        cirrhosis = 'Yes,No';
    }
    cirrhosis = cirrhosis.split(','); // Converting it into an array.
    return cirrhosis;
}

/**
 * @author: pramveer
 * @date:21st feb 2017  
 * @desc:removed years field from filters 
 */

// function getLastYearValue() {
//     return $('#selectTenureValue').val(); //get year value
// }

// This Flag Comtains the list of medication if this function has been called by hitting the apply button of complication rate view.
function handleFilterChangeProfile(flag) {

    removeActiveClassFromLists();
    showSPView();
    showSPlistView();
    hideSPDetailView();

    let planType = genotypes = treatment = cirrhosis = tenureValue = fdaCompliant = '';

    planType = getPlanTypeFromFilters();
    genotypes = getGenotypeFromFiltters();
    treatment = getTreatmentFromFilters();
    cirrhosis = getCirrhosisFromFilters();
    //tenureValue = getLastYearValue();
    fdaCompliant = getFdaComplaintCheck();
    rebateDiscount = getRebatePriceValueProfile();
    rebateDb = getRebateDatasetName();

    //set forparams header data
    headerparams['genotypes'] = genotypes.join(',');
    headerparams['cirrhosis'] = cirrhosis ? (cirrhosis.length > 1 ? 'All' : cirrhosis[0]) : 'All';
    headerparams['treatment'] = treatment ? (treatment.length > 1 ? 'All' : treatment[0]) : 'All';
    headerparams['planType'] = planType;
    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    //headerparams['tenureValue'] = tenureValue;

    setPayerHeaderTabData(headerparams);
    // set flag1 for all data
    var flag1 = '';
    //is no  genotype and plan is selected then show all drugs info flag1 is to all and genotype value is passed
    if (genotypes[0].toLowerCase() == 'all' && $('.treatedInsurancePlanSelectProfile').val() == 'all' && $('.treatedTreatment').val() == 'all' && $('.treatedCirrhosis').val() == 'all') {
        flag1 = 'all';
    }

    //if all is selected in the genotype Combo.
    if (genotypes[0].toLowerCase() == 'all') {
        genotypes = [];
        for (var i = 0; i < GenotypeList.length; i++) {
            genotypes.push(GenotypeList[i].hcv_genotype);
        }
    }

    // // if ALL is selected in the insurance Plan Select box
    // if (planType === 'all') {
    //     var allPlans = [];
    //     ClaimsInsurancePlan.forEach(function(rec) {
    //         allPlans.push(rec['claims_insurancePlan']);
    //     });
    //     allPlans = allPlans.join(',');
    //     planType = allPlans.replace(',', '","');
    // }


    //put the data into json object
    var categoryData = {
        genotypes: genotypes,
        planType: planType,
        treatment: treatment,
        cirrhosis: cirrhosis,
        fdaCompliant: fdaCompliant,
        flag: flag1,
        rebateDiscount: rebateDiscount,
        rebateDb: rebateDb
    };

    //set filters
    currentTabFilters = categoryData;

    //get the category id list and category name
    // var category_data = payerUtils.getPossibleCatCombination(categoryData);
    // var id_list = category_data;

    //call template function to get patients data
    //initilizing variable to get medication list id passed
    var filter_med_list = [];
    //if filter is applied and flag is not set to all then medication list is set medication list passed
    if (isComparitiveFilter && flag != undefined && flag != 'all') {
        filter_med_list = flag;
    }


    //call the helper function get filtered data
    var dbParams = categoryData;
    dbParams['plans'] = planType;
    dbParams['duration'] = getCurrentPopulationFilters().duration;
    dbParams['patientsType'] = 'treated';
    dbParams['filteredMedications'] = filter_med_list;

    payerUtils.storeFitersData('treated', categoryData, planType);
    fetchAndRenderData(dbParams);


    // Supporting Functions
    function getPlanTypeFromFilters() {
        return $('.treatedInsurancePlanSelectProfile').val()
    }

    function getFdaComplaintCheck() {
        return $('.treatedFdaComboProfile').val();
    }

    function getGenotypeFromFiltters() {
        let genotypes = '';
        //get text data from mutlisselect combo
        $('#treatedselectGenotypeProfile .multiSel').children().each(function(index) {
            genotypes += $(this).html().trim();
        });
        //remove last comma and change the genotype to array
        genotypes = genotypes[0] == ',' ? genotypes.substring(1, genotypes.length) : genotypes;
        genotypes = genotypes.split(',');
        return genotypes;
    }

    function getTreatmentFromFilters() {
        let treatment = $('.treatedTreatmentProfile').val();
        if (treatment == 'all') {
            treatment = 'Naive,Experienced';
        }
        treatment = treatment.split(','); // Converting it into an array.
        return treatment;
    }

    function getCirrhosisFromFilters() {
        let cirrhosis = $('.treatedCirrhosisProfile').val();
        if (cirrhosis == 'all') {
            cirrhosis = 'Yes,No';
        }
        cirrhosis = cirrhosis.split(','); // Converting it into an array.
        return cirrhosis;
    }

    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    // function getLastYearValue() {
    //     return $('#selectTenureValueProfile').val(); //get year value
    // }

}

//render sub population data
function renderSubPopulationSingleCategory(obj) {
    //show load mask
    showloadingWheel();
    // showUniverseLoadingWheel();
    // showChartLoadingMask();

    var ids = $(obj).attr('data');
    var cat_id = $(obj).attr('identifier');
    $('.treated' + cat_id + 'SubCategoryInfo-PatientCategory').html(ids);

    //Pram (14 Apr 17) : Implement the universe weights on data objects
    let baseData = payerUtils.applyUniverseWeightsOnBaseObject(TreatedAnalyticsData);

    // get data or specific category.
    let categoryData = _.where(baseData, { category_id: parseInt(cat_id) });

    // Yuvraj, We have convert our main data into object of and Object format. Since everything dependent upon that particular data structure.
    categoryData = covertArrayToObj(categoryData);

    var data = {
        //phsData: subpopUtils.refineTheRWEUtilization(TreatedAnalyticsData),
        phsData: payerUtils.refineUtilizationForReccomendationProfile(categoryData, 'treated'),
        imsData: covertArrayToObj(payerUtils.getFilteredDataset(categoryData, false))
    };

    Meteor.call('HcvAnalyticsTreatedBySingleCetagory', { id: cat_id, data: data }, function(err, res) {
        if (res.phsData.length > 0) {
            $('.treated' + cat_id + 'ThisCategoryPatients').html(res.phsData[0]['total']);
        } else {
            $('.treated' + cat_id + 'ThisCategoryPatients').html(0);
        }

        console.log(res);
        // PHS DATA -- Added By Yuvraj 11th March
        //(PRAM 14 Mar)TODO: need to make changes in the refine utilization function till then commented the function call
        //let phsres = refineUtilization(res.phsData, cat_id);
        let phsres = res.phsData;
        let phsDrugsData = Template.TreatedPatients.__helpers.get('DrugsData')(phsres, cat_id);

        // IMS DATA -- Added By Yuvraj 11th March
        //(PRAM 14 Mar)TODO: need to make changes in the refine utilization function till then commented the function call
        //let imsres = refineUtilization(res.imsData, cat_id);
        // let imsres = res;
        // let imsDrugsData = Template.TreatedPatients.__helpers.get('DrugsData')(imsres, cat_id);
        //Commented OLD way to prepare relative value chart
        // renderSvgChartForSissionDataPayer('treated' + cat_id, 'Cost', 'Efficacy', '.dimpleMapsContainerForPayer-treated' + cat_id);
        //New Relative value chart for payer
        payerUtils.renderNewRelativeValueChart({ container: '.dimpleMapsContainerForPayer-treated' + cat_id, xAxis: 'Cost', yAxis: 'Efficacy', tabName: 'treated' + cat_id, height: 220, width: 400, relativeChartData: payerUtils.prepareDataForBubbleChart(phsDrugsData) });
        subpopUtils.DrawSPDrugInfoTableBody('treated' + cat_id, phsDrugsData);
        //hide load mask
        hideLoadingWheel();
    });

    //function to set Utilization & count
    /**
     * @author: Pramveer
     * @date: 14th Mar 17
     * @desc: currently this function is making the utlization of the ims object to 0 because it matches the phsdata drugs 
     * so need to change the function accordingly
     * @TODO : the profile recommendations functionality for both dataset needs to be done
     */
    function refineUtilization(backendData, catID) {
        let resClone = [],
            baseData = Session.get('treatedPat_SPListData'),
            filteredDrugData = _.where(baseData, { category_id: parseInt(catID) })[0]['data'];

        for (let i = 0; i < backendData.length; i++) {
            let json = _.clone(backendData[i]),
                matchedDrug = _.where(filteredDrugData, { medication: json['medication'], period: json['treatment_period'] })[0];
            if (matchedDrug != undefined) {
                json['utilization'] = matchedDrug['utilization'];
                resClone.push(json);
            } else {
                resClone.push(backendData[i]);
            }

            //json['count'] = matchedDrug['count'];


        }
        return resClone;
    }
}

/**
 * @author: Pramveer
 * @date: 10 Mar 17
 * @desc: New function to prepare payer tool data
 */

let preparePayerToolData = (id_list, analyticsdata, changeDrugData, isLoadedModel, recommedationFlag) => {

    // let imsDataSet = _.groupBy(analyticsdata.imsData, 'category_id');
    // let phsDataSet = _.groupBy(analyticsdata.phsData, 'category_id');

    // let imsDataSet = payerUtils.getFilteredDataset(analyticsdata, false);
    // let phsDataSet = payerUtils.getFilteredDataset(analyticsdata, true);

    // imsDataSet = _.groupBy(imsDataSet, 'category_id');
    // phsDataSet = _.groupBy(phsDataSet, 'category_id');

    //imsDataSet = prepareExpensesDataForDataSet(imsDataSet);
    // let expenseData = prepareExpensesDataForDataSet(phsDataSet, imsDataSet, recommedationFlag);

    // Apply weights to the analytics data.
    let weightedAnalyticsData = payerUtils.applyUniverseWeightsOnBaseObject(analyticsdata);

    let expenseData = prepareExpensesDataForDataSet(weightedAnalyticsData, recommedationFlag);




    // Add a check to render view according to recommendation flag.
    if (recommedationFlag.renderTabView) {
        // Added by Yurvaj 14th March
        // this function will render data in the universe View
        renderUniverseViewData(expenseData);

        // Added by Yurvaj 15th March
        // this function will render data in the universe View
        renderUniverseViewValueScores(analyticsdata);

        // Added by Yurvaj 15th March
        // this function will set the Total Expenses, Best Values Expenses and Savings into the SUbpopulation View Footer.
        // and total patient count in the subpopulation detail view header.
        renderSubpulationTotalExpenses(expenseData);

        // Added by Yurvaj 15th March
        // this function will set the total patient into a session variable.
        setTotalPatientsInSession(expenseData);



        // Pending 
        // //sort data based on subpopulation
        // //prepareddata.sort(sortAlphaNumAsc);

        // prepareddata.sort(function(a, b) {
        //     return b.count - a.count;
        // });


        // Set treatedSPData variable - this is used to render the subpopulation view.
        treatedSPData = expenseData;

        // if this is not a loaded model.
        if (!isLoadedModel) {

            // if this is a loaded model then we do not want to set the data into session variable as we have already done that.
            Session.set('treatedPat_SPListData', expenseData);

            if (changeDrugData) {
                //complication rate data
                var finalData = [];
                var dataArray = _.groupBy(analyticsdata, 'medication');
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
                    json['isImsDrug'] = dataArray[key][0].isImsDrug;
                    finalData.push(json);
                }
                //store complication rate data in  session
                Session.set('treatedPat_ComplicationData', finalData);
            }

        }
    } else {
        return expenseData;
    }
}


let reorganisePHSData = (dataResult) => {
    let imsDataSet = _.groupBy(dataResult.imsData, 'category_id');
    let phsDataSet = _.groupBy(dataResult.phsData, 'category_id');

    let finalPhsDataArray = [];

    for (let obj in dataResult.phsData) {
        finalPhsDataArray.push(dataResult.phsData[obj]);
    }


    //loop for categories 
    for (let category in phsDataSet) {
        let phsDrugs = phsDataSet[category],
            imsDrugs = imsDataSet[category];

        let imsMedications = _.uniq(_.pluck(imsDrugs, 'medication')),
            phsMedications = _.uniq(_.pluck(phsDrugs, 'medication'));


        // take only those medications which are not available in the PHS Dataset

        for (let i = 0; i < imsMedications.length; i++) {
            if (phsMedications.indexOf(imsMedications[i]) == -1) {
                // let index = imsMedications.indexOf(phsMedications[i])
                // imsMedications.splice(index, 1);
                let filteredDrugs = _.where(imsDrugs, { medication: imsMedications[i] });

                for (let j = 0; j < filteredDrugs.length; j++) {
                    let drugObj = _.clone(filteredDrugs[j]);
                    drugObj.utilization = 0;
                    //drugObj.isImsDrug = true;
                    drugObj.total = phsDrugs[0].total;
                    drugObj.count = 0;
                    drugObj.unique_total = 0;

                    finalPhsDataArray.push(drugObj);
                }

            }
        }
    }

    let finalPhsDataObj = {};

    for (let k = 0; k < finalPhsDataArray.length; k++) {
        finalPhsDataObj[k] = finalPhsDataArray[k];
    }

    dataResult.phsData = finalPhsDataObj;

    // console.log(dataResult);
    return dataResult;

}

// let getValueScoreData = (dataset, isPhs) => {
//     let grpData = _.groupBy(dataset, 'category_id');

//     let valueScore = 0,
//         categoryCount = 0;

//     for (let keys in grpData) {

//         let drugsData = sortDataInDesc(grpData[keys], 'value');
//         let drugCount = 0;

//         for (let i = 0; i < drugsData.length; i++) {
//             if (isPhs) {
//                 valueScore += drugsData[i].isImsDrug ? 0 : drugsData[i].value;
//                 drugCount += drugsData[i].isImsDrug ? 0 : 1;
//             } else {
//                 valueScore = drugsData[0].value;
//             }
//         }

//         valueScore = isPhs ? (valueScore / drugCount) : valueScore;
//         categoryCount++;
//     }

//     return (valueScore / categoryCount).toFixed(2);
// }

// Modified By Yuvraj 14th March
let getValueScoreData = (dataset) => {

    let grpData = _.groupBy(dataset, 'category_id');

    let sumValueScore = 0,
        categoryCount = 0;

    for (let keys in grpData) {

        let drugsData = applyUniverseweights(grpData[keys]);
        drugsData = sortDataInDesc(drugsData, 'value');
        let drugCount = 0;
        let valueScore = 0;
        for (let i = 0; i < drugsData.length; i++) {
            valueScore += drugsData[i].count * drugsData[i].value;
        }

        // valueScore = isPhs ? (valueScore / drugCount) : valueScore;
        sumValueScore += valueScore / drugsData[0].total;
        categoryCount++;
    }

    return (sumValueScore / categoryCount).toFixed(2);
}


let getBestValueScoreData = (rweDataset, clientDataset) => {
    let grpData = _.groupBy(rweDataset, 'category_id');
    let clientGrpData = _.groupBy(clientDataset, 'category_id');

    grpData = grpData ? grpData : clientGrpData;

    let sumValueScore = 0,
        categoryCount = 0;

    for (let keys in clientGrpData) {
        //Pram (21st Mar 17): if no drugs are in real world then make the client dataset for that subpopulation as the rwe dataset
        let rweDrugData = grpData[keys] ? grpData[keys] : clientGrpData[keys];

        let drugsData = applyUniverseweights(rweDrugData);
        // Yuvraj (10th April 2017) : finding the best value score. Here, it does not matter if two drugs have same value score. 
        drugsData = sortDataInDesc(drugsData, 'value');
        sumValueScore += drugsData[0].value;
        categoryCount++;
    }

    return (sumValueScore / categoryCount).toFixed(2);
}


let sortDataInDesc = (dataArray, value) => {
    let data = _.sortBy(dataArray, value);
    return data.reverse();
}

// Not in USE
// This functions takes the Row data and Identifies all possible subpopulation.
// We calculate all values score best value drug and saving fr all the subpopulation and keep that data into a session variable.
// We also calculate Universe view Expenses and Savings and Apply it into the Universe view.
let preparePayerToolData_old = (id_list, analyticsdata, changeDrugData, isLoadedModel, recommedationFlag) => {

    let prepareddata = [];

    id_list = id_list.split(',');

    let AnalyticsData = analyticsdata;
    let sum_score = 0; //for all categories
    let best_score_cat = 0; //for all categories
    let total_savings = 0;
    let total_cost_cat = 0;
    let best_value_cost_cat = 0;
    let total_pop = 0;
    let valuegap = 0;
    let savings_category = {};

    //loop through category id to calculate savings for all categories in list
    let id_count = 0;
    for (let i = 0; i < id_list.length; i++) {
        //get data for particular category
        let data = _.where(AnalyticsData, { category_id: parseInt(id_list[i]) });
        data = data.filter((item) => item.value != null && item.count != 0);

        //calculation for value score and savings
        if (data.length > 0) { //check if it contains data for category or not
            id_count += 1;
            let best_score = 0;
            let total_cost = 0;
            let sum_value_score = 0;
            let best_score_cost = 0;
            let total = 0;
            let category_data = [];
            let json = {};
            let sum_uti = 0;
            savings_category[i] = {};
            let id = 0;
            //calculation of score for a single category
            for (var j = 0; j < data.length; j++) {
                var temp = {};
                if (data[j].count) {
                    temp['medication'] = data[j].medication;
                    temp['cost'] = data[j].cost;
                    temp['efficacy'] = data[j].efficacy;
                    temp['efficacy_count'] = data[j].efficacy_patients; //efficacy count
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
                    total = data[j].total; // Total Count
                    sum_value_score += data[j].value;
                    category_data.push(temp);
                    total_cost += data[j].cost * data[j].count;
                    id = data[j].category_id;
                }

            }

            json['data'] = category_data;
            json['count'] = total;
            json['category_id'] = parseInt(id);
            //json['category_name'] = category_name_list[parseInt(id) - 1];
            json['category_name'] = data[0]['category_name'];
            json['total_cost'] = Math.round(total_cost);
            json['total_cost_display'] = commaSeperatedNumber(Math.round(json['total_cost']));
            json['best_value_cost'] = Math.round(best_score_cost * total);
            json['best_value_cost_display'] = commaSeperatedNumber(Math.round(json['best_value_cost']));
            json['savings'] = Math.round(total_cost - best_score_cost * total);
            json['savings_display'] = commaSeperatedNumber(Math.round(json['savings']));
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



    if (!recommedationFlag) {
        if (id_count != 0) {
            sum_score = sum_score / id_count;
            best_score_cat = (best_score_cat / id_count).toFixed(2);
            valuegap = best_score_cat - sum_score;
            //set the savings on display page
            $('.treatedcurrent_best').html(sum_score.toFixed(2));
            $('.treatedavgbest').html(best_score_cat);
            $('.treatedvaluegap').html(valuegap.toFixed(2));
        }

        $('.treatedcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
        $('.treatedcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
        $('.treatedcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));



        //set data for display in universe Section
        let UniverseSavingData = {
            'TotalCost': Math.round(total_cost_cat),
            'Saving': total_savings,
            'BestValueUtilization': best_value_cost_cat,
            'QualityIndicators': []
        };
        Session.set('Treated_UniverseSavingData', UniverseSavingData);

        //calculate savings per patient
        var saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
        $('.treatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(saving_perpatient));
        $('#treatedCurrentCount').html(commaSeperatedNumber(total_pop));
        $('.treatedTotalFilteredPatients').html(total_pop);
        Session.set('treatedTotalPatients', total_pop);

        //sort data based on subpopulation
        //prepareddata.sort(sortAlphaNumAsc);

        prepareddata.sort(function(a, b) {
            return b.count - a.count;
        });

        // if this is a loaded model then we do not want ot set the data into session variable as we have already done that.
        if (!isLoadedModel) {
            Session.set('treatedPat_SPListData', prepareddata);
        }
        //set the filtered data in the variable to compute the difference with the optimized one
        treatedSPData = prepareddata;

        if (!isLoadedModel) {
            if (changeDrugData) {
                //complication rate data
                var finalData = [];
                var dataArray = _.groupBy(TreatedAnalyticsData, 'medication');
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
                Session.set('treatedPat_ComplicationData', finalData);
            }
        }

        //$('.searchPatientCountHeaderPayer').html(total_pop);

        let parentSelector = 'treatedSubPopulationList-Footer';
        $('.' + parentSelector + ' .SPList-totalPatients').html(total_pop);
        $('.' + parentSelector + ' .totalProjectedCost').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
        $('.' + parentSelector + ' .totalBestCost').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
        $('.' + parentSelector + ' .totalSavingsOppurtunity').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));
    } else {

        return prepareddata;
    }
}



// Not in USE
//function to calculate savings and values based on weight applied
//here we are passing id list of patients
Template.TreatedPatients.valuecalculatorAdvanced_OLD = function(isLoadedModel) {

    //return if filters return blank data
    if (treatedSPData.length == 0) {
        return;
    }
    // w1 = localStorage.getItem('weff')==undefined?1:(parseFloat(localStorage.getItem('weff')/100)); //get efficacy slider value in range 1-10
    // w2 = localStorage.getItem('wadh')==undefined?1:(parseFloat(localStorage.getItem('wadh')/100)); //get adherence slider value in range 1-10
    // w3 = localStorage.getItem('wcost')==undefined?1:(parseFloat(localStorage.getItem('wcost')/100)); //get cost slider value in range 1-10

    let efficacy = $('#txtEffWeightTreated').val();
    let adherence = $('#txtAdhWeightTreated').val();
    let cost = $('#txtCostWeightTreated').val();

    w1 = efficacy / 100; //get efficacy slider value
    w2 = adherence / 100; //get adherence slider value
    w3 = cost / 100; //get cost slider value

    //set all value scoresand savings to zero if no filters applied i.e 0%
    if (w1 === 0 && w2 === 0 && w3 === 0) {
        $(".alls").html(0);
        $('.treatedcurrent_best').html(0); //set observed value
        $('.treatedavgbest').html(0); //set average best score
        $('.treatedvaluegap').html(0); // set value gap
        $('.treatedcardValueBest').html('$ ' + commaSeperatedNumber(0)); //set value best savings to 0
        $('.treatedcardValueGap').html('$ ' + commaSeperatedNumber(0)); //set savings opportunity lost
        $('.treatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(0)); //set savings per ptient to 0
        return;
    }
    var id_list = Session.get('treated_category_id_list').split(',');
    //var id_list = id.split(','); //slit id to array
    var prepareddata = []; //data to store values
    var AnalyticsData = TreatedAnalyticsData; //get data from Subscription variable
    var sum_score = 0; //for all categories
    var best_score_cat = 0; //for all categories
    var total_savings = 0; //total savings for all categories
    var total_cost_cat = 0; //total cost for all categories
    var best_value_cost_cat = 0; //best value cost across category
    var total_pop = 0; //total population of category
    var savings_category = {}; //dictionary to contain calculated values
    var valuegap = 0;
    //var filterdrug = Session.get("filterdruglist");
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
            //json['category_name'] = category_name_list[parseInt(id) - 1];
            json['category_name'] = data[0]['category_name'];
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
        $('.treatedcurrent_best').html(sum_score.toFixed(2));
        $('.treatedavgbest').html(best_score_cat);
        $('.treatedvaluegap').html(valuegap.toFixed(2));
    }


    $('.treatedcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
    $('.treatedcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
    $('.treatedcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));
    var saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
    $('.treatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(saving_perpatient));
    $('#treatedCurrentCount').html(commaSeperatedNumber(total_pop));
    $('.treatedTotalFilteredPatients').html(total_pop);
    Session.set('treatedTotalPatients', total_pop);

    // if this is a loaded model then we do not want ot set the data into session variable as we have already done that.
    if (!isLoadedModel) {
        Session.set('treatedPat_SPListData', prepareddata);
    }

    var parentSelector = 'treatedSubPopulationList-Footer';
    $('.' + parentSelector + ' .SPList-totalPatients').html(total_pop);
    $('.' + parentSelector + ' .totalProjectedCost').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
    $('.' + parentSelector + ' .totalBestCost').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
    $('.' + parentSelector + ' .totalSavingsOppurtunity').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));

}



//function to calculate savings and values based on weight applied
//here we are passing id list of patients
Template.TreatedPatients.valuecalculatorAdvanced = function(isLoadedModel) {

    //Pram (14 Apr 17) : Commented as the data length can be zero in case of 0 weights
    //return if filters return blank data
    // if (treatedSPData.length == 0) {
    //     return;
    // }

    let weights = getRelativeWeights();

    // Preserve Relative Weights
    ralativeWeights = weights;



    let id_list = Session.get('treated_category_id_list').split(',');
    let prepareddata = []; //data to store values
    //let AnalyticsData = TreatedAnalyticsData; //get data from Subscription variable

    //Pram (14 Apr 17) : Implement the weights on the base data
    let AnalyticsData = payerUtils.applyUniverseWeightsOnBaseObject(TreatedAnalyticsData);

    // let imsDataSet = _.groupBy(AnalyticsData.imsData, 'category_id');
    // let phsDataSet = _.groupBy(AnalyticsData.phsData, 'category_id');

    let imsDataSet = _.groupBy(payerUtils.getFilteredDataset(AnalyticsData, false), 'category_id');
    let phsDataSet = _.groupBy(payerUtils.getFilteredDataset(AnalyticsData, true), 'category_id');

    // let expenseData = prepareExpensesDataForDataSet(phsDataSet, imsDataSet);

    let expenseData = prepareExpensesDataForDataSet(AnalyticsData);

    treatedSPData = expenseData;

    //Pram (17 Apr 17) : Prepare data for comparitive value chart
    subpopUtils.getPreparedDrugsData('treated');

    // executeDataRendering(AnalyticsData, null, null, true);
    payerUtils.renderChartsForTab('treated', treatedSPData);

    // console.log('**********Value calculator treatedspData***********');
    // console.log(treatedSPData);
    // Added by Yurvaj 14th March
    // this function will render data in the universe View
    renderUniverseViewValueScores(AnalyticsData);

    // Added by Yurvaj 14th March
    renderUniverseViewData(expenseData);

    // Added by Yurvaj 15th March
    // this function will set the Total Expenses, Best Values Expenses and Savings into the SUbpopulation View Footer.
    // and total patient count in the subpopulation detail view header.
    renderSubpulationTotalExpenses(expenseData);

    // Added by Yurvaj 15th March
    // this function will set the UniverView data into a session variable.
    setUniverseViewDataInSession(expenseData);

    // Added by Yurvaj 15th March
    // this function will set the total patient into a session variable.
    setTotalPatientsInSession(expenseData);

    //Pram (23rd May 17) : Call the reccommendation function on slider tweaks
    payerUtils.resetSavingsProfile('treated');
    subpopUtils.showOurRecomendations('treated', currentTabFilters, AnalyticsData, null);

    // if this is a loaded model then we do not want to set the data into session variable as we have already done that.
    if (!isLoadedModel) {
        Session.set('treatedPat_SPListData', expenseData);
    }

    //set all value scores and savings to zero if no filters applied i.e 0%
    if (weights.efficacy === 0 && weights.adherence === 0 && weights.cost === 0) {
        //setUniverseViewToZero();
        //return;
        //Pram (13 Apr 17) : Commented the code & added popup section for warning msg
        displayWarningMsgForZeroWeights();
    }

}



// Updated By Jayesh 15th March for condition check for divide by zero issue.
function getComplicationsForDrug(compCount, compTreatment) {
    if (compTreatment != 0) {
        let complicationRate = compCount / compTreatment;
        return isNaN(complicationRate) ? 0 : complicationRate * 1000;
    } else {
        return 0;
    }
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
            if (checkedDrugArray.indexOf(drugsData[j]['medication'].toString()) > -1) {
                drugChecked = true;
                break;
            }
        }
    }

    return drugChecked;
}


function renderCurrentPatientDataByDefault(advancefilterInsu) {

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

    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    //var tenureValue = parseInt(ListOfYear[0].year);

    var allPlans = [];
    if (advancefilterInsu && advancefilterInsu != 'all') {
        allPlans.push(advancefilterInsu);
    } else {
        // ClaimsInsurancePlan.forEach(function(rec) {
        //     allPlans.push(rec['claims_insurancePlan']);
        // });
    }
    ////As When page render from patient to payer then we don't have insurance filter so I have set explicitly 'all' 
    let planType = 'all';

    //var currPatient = Session.get('selectedPatientData');
    //allPlans.push(currPatient[0].Insurance);
    // allPlans = allPlans.join(',');
    // let planType = allPlans.replace(',', '","');

    let category_id = Session.get('category_id');
    category_id = category_id.toString();


    // storeFitersData('treated', dbParams);
    // console.log(selectedFilters);

    //let currentPatient = getCurrentPatientData();

    let currentFilters = getCurrentPopulationFilters();
    let categoryData = {
        genotypes: currentFilters.genotypes,
        treatment: currentFilters.treatment,
        cirrhosis: currentFilters.cirrhosis,
        fdaCompliant: getFdaComplaintCheck(),
        planType: planType,
        flag: false,
        rebateDiscount: getRebatePriceValue(),
        rebateDb: getRebateDatasetName()
    };

    //call the helper function get filtered data
    let dbParams = categoryData;
    dbParams['plans'] = (advancefilterInsu != void 0 ? planType : null);
    dbParams['duration'] = getCurrentPopulationFilters().duration;
    dbParams['patientsType'] = 'treated';
    dbParams['filteredMedications'] = currentFilters.medicationArray;
    dbParams['fdaCompliant'] = getFdaComplaintCheck();
    dbParams['othersFilters'] = currentFilters.othersFilters;
    //dbParams['showPreactingAntivirals'] = currentFilters.showPreactingAntivirals;
    dbParams['showPreactingAntivirals'] = getPreactingAntiviralValue();
    // console.log("FIRST TIME DBPARAMS:");
    // console.log(dbParams);
    //set the filters
    currentTabFilters = categoryData;

    payerUtils.storeFitersData('treated', categoryData, planType);
    fetchAndRenderData(dbParams, category_id, { renderTabView: true });

}



function fetchAndRenderData(dbParams, profilecheck, profApplyObject) {
    var changeDrugData = false;

    //call function to show charts section tab
    fnShowChartsTabOnRender();
    //check for filter applied or not
    if (!(isComparitiveFilter)) {
        changeDrugData = true;
    }

    //reset the savings profile
    // if(!profilecheck)
    //     payerUtils.resetSavingsProfile('treated');
    // console.log("****** dbParams*****");

    //console.log(dbParams);
    //console.log(dbParams.planType);

    //Set planType empty if insurance plan is selected all, because patient with insurance value null can't handle by this condition
    // if (dbParams.planType && dbParams.planType.toLowerCase() == 'all') {
    //     dbParams.planType = '';
    // }

    //added param for rebate combo
    // dbParams.rebateDiscount = dbParams.rebateDiscount||getRebatePriceValue();
    // dbParams.rebateDb = getRebateDatasetName() || 'both';

    Meteor.call('getAnalyticsDataForPatients', dbParams, function(error, results) {
        // console.log('*************Data Fetched fFom Server*****************');
        // console.log(result);
        let decompressed_object = !results ? '{}' : LZString.decompress(results);
        let result = JSON.parse(decompressed_object);

        // console.log('**************Payer Tab New Data****************');
        // console.log(result);

        //result = reorganisePHSData(result);

        //Pram (30th May 17) : Check if any customer drug is present or not
        let isAnyClientDrug = _.groupBy(result, 'isImsDrug')[0];

        if (!result || !isAnyClientDrug || _.isEmpty(result)) {
            sAlert.closeAll();
            $('.treatedNodataSection').show();
            $('.treatedDataSectionWrapper').hide();
            sAlert.error('No Data Found for current selection! Please change filters', { timeout: 2500, onClose: function() {}, effect: 'bouncyflip', html: true, position: 'top-left' });
            hideLoadingWheel();
            return;
        }

        TreatedAnalyticsData = result;

        //Pram (14 Apr 17) : Function to render the data

        executeDataRendering(result, profilecheck, profApplyObject, changeDrugData);

        //console.log("******************Data Fetched*******************");
        //console.log(result);

        checkTabsWastePayerTb();
        //return result;

        // added by Yuvraj 11th April 2017 : Render waste opportuntiy section by default
        renderWasteOpportunitySection();

        //append UI for Savings Profile
        //Pram (23rd May 17) : commented the function and called it in the executeDataRendering()     
        //subpopUtils.showOurRecomendations('treated', currentTabFilters, TreatedAnalyticsData, profApplyObject ? profApplyObject.selectedProf : null);
    });
}

/**
 * @author: Pramveer
 * @date: 14 Apr 17
 * @desc: function to render the data on UI
 */
let executeDataRendering = (result, profilecheck, profApplyObject, changeDrugData) => {
    $('.treatedNodataSection').hide();

    //update the tooltip of the patient count
    setTooltipForTotalPats(result);

    let id_list = getUniqueArray(_.pluck(result, 'category_id')).join(',');

    Session.set('treated_category_id_list', id_list); //get id_list from Session


    // if Profile is not selected 
    let profObj = {};
    if (!profApplyObject) {
        profObj.renderTabView = null;
        profObj.profUtilizations = null;
    } else {
        profObj = profApplyObject;
    }

    preparePayerToolData(id_list, result, changeDrugData, false, profObj);

    //refresh the universe quality indicators
    var optimizedData = Session.get('treatedPat_SPListData');
    var reactive_var = 'uniTreatedQualityIndicators';

    // treatedSPData is a global variable which is assigned data in the preparePayerToolData function.
    renderTheData(treatedSPData, optimizedData, reactive_var);

    //Pram (23rd May 17) : Called the reccemmendation function in this function 
    subpopUtils.showOurRecomendations('treated', currentTabFilters, TreatedAnalyticsData, profApplyObject ? profApplyObject.selectedProf : null);

    // if (profApplyObject) {
    //     //data calculations for the selected profile
    //     handleProfileSelection(profApplyObject.profUtilizations);

    //     hideLoadingWheel();
    // }

    // console.log('**********Execute render treatedspData***********');
    // console.log(treatedSPData);

}

function renderTheData(treatedSPData, optimizedData, reactive_var) {

    // console.log('****####@@@@@@@#####****');
    // console.log('The Caller function is ==> '+arguments.callee.caller.toString());

    payerUtils.renderUniverseQualityIndicators(treatedSPData, optimizedData, reactive_var);


    //hide load mask
    hideLoadingWheel();
    hideUniverseLoadingWheel();
    setTimeout(function() {
        //render charts for the tab
        payerUtils.renderChartsForTab('treated', treatedSPData);

        hideChartLoadingMask();
    }, 300);

    //show the subpopulation section
    $('.treatedSubpopulationWrapper').show();

    //set tenure value on the chart
    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters, set difference of duration on chart.
     */
    let str = getCurrentPopulationFilters().duration.replace("BETWEEN", "").split('AND');

    let startDate = new Date(str[0].trim().replace(/'/g, '')).getFullYear();
    let endDate = new Date(str[1].trim().replace(/'/g, '')).getFullYear();

    let html = endDate - startDate;
    if (html == 0) {
        html = 1;
    }

    let string = html == 1 ? 'year' : 'years';

    $('.treatedTenureValue').html('Last ' + html + ' ' + string);
    // // $('.treatedsubPopulationCategoriesContainer').html(html);
    //  $('#treatedyearvalue').html(tenureValue);

    // if(changeDrugData){
    //     allDrugsList = Tracker.nonreactive(function(){
    //         return TreatedAnalyticsData;
    //     });
    // }
}


// let getRebatePriceValue = () => {
//     let rebateValue = $('#treatedRebateCombo').val();
//     if (rebateValue && rebateValue == 'None') {
//         return 0;
//     }
//     return parseInt(rebateValue);
// }
let getRebatePriceValue = () => ~~$('#treatedRebateCombo').val();

// let getRebatePriceValueProfile = () => {
//     let rebateValue = $('#treatedRebateComboProfile').val();
//     if (rebateValue && rebateValue == 'None') {
//         return 0;
//     }
//     return parseInt(rebateValue);
// }

let getRebatePriceValueProfile = () => ~~$('#treatedRebateComboProfile').val();

let getRebateDatasetName = () => {
    //let rebateDb = $('#treatedRebateOnCombo').val();
    let rebateDb = $(".rebatecheckbox input:radio:checked").prop('value');
    if (rebateDb) {
        return rebateDb
    }
    return 'both';
}

let getPreactingAntiviralValue = (isFromReccProfile) => {
    let value = null,
        finalVal = false;

    if (isFromReccProfile) {
        value = $('.treatedPreactingComboProfile').val();
    } else {
        value = $('.treatedPreactingCombo').val();
    }

    if (value == 'Yes') {
        finalVal = true;
    } else {
        finalVal = false;
    }
    return finalVal;
}

/**
 * @author: Pramveer
 * @date: 13 Apr 17
 * @desc: function to display warning msg for 0 values of weight sliders
 */

let displayWarningMsgForZeroWeights = () => {
    $('#uniWeightsZeroWarningMsgBox').show();
}


function complicationBody() {

    $('.treatedcomplicationData').html('');
    var data = Session.get('treatedPat_ComplicationData');


    var html = ''; //<div class="col-md-12 complicationRateViewP complicationRateViewtreated" id = "complicationRateView_treated">';
    for (let drug of data) {
        html += '<div class="col-md-12 complicationRateViewP complicationRateViewtreated" id = "complicationRateView_treated">';
        html += '<div class="col-md-1 checkbox">' +
            '<label>';
        if ((complication_CheckedDrugs.indexOf(drug.drugGroupName) > -1) || (!isComparitiveFilter)) {
            html += '<input type="checkbox" class=" medcomplisttreated" value="' + drug.drugGroupName + '" checked/>';
        } else {
            html += '<input type="checkbox" class=" medcomplisttreated" value="' + drug.drugGroupName + '"/>';
        }

        html += '<span class="cr"><i class="cr-icon fa fa-check"></i></span>' +
            '</label>' +
            '</div>' +
            '<div class="col-md-3 crDrugName" style="padding-left:26px;">' +
            '<div style="width:95%;">' + drug.drugGroupName + '</div>' +
            '</div>' +
            '<div class="col-md-3 crCost">' +
            '<div style="width:15%;">' + drug.complicationRateLabel + '</div>' +
            '</div>' +
            '<div class="col-md-3 crCost">' +
            '<div style="width:96%;">$' + drug.complicationCostLabel + '</div>' +
            '</div>';
        html += '</div>';
    }

    $('.treatedcomplicationData').html(html);
    // $('.medcomplisttreated').trigger('click');
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
    $(".treatedChartscontainer").css("visibility", "hidden");
    $(".chart_loader_overlay").show();
    $(".chart_loader").show();
}

function hideChartLoadingMask() {
    $(".treatedChartscontainer").css("visibility", "Visible");
    $(".chart_loader_overlay").hide();
    $(".chart_loader").hide();
}


function assignEventRelatveSliders() {
    //Pram (19th Apr 17) : Added check for optimized sub population & moved the execution code to another single function
    //weight slider function on change
    $("#txtEffWeightTreated").change("input", function(e) {

        if (isAnySubpopulationOptimized()) {
            showTheSliderMoveWarning();
        } else {
            resumeUniverseSliders();
        }

    });

    $("#txtAdhWeightTreated").change("input", function(e) {
        if (isAnySubpopulationOptimized()) {
            showTheSliderMoveWarning();
        } else {
            resumeUniverseSliders();
        }
    });

    $("#txtCostWeightTreated").change("input", function(e) {
        if (isAnySubpopulationOptimized()) {
            showTheSliderMoveWarning();
        } else {
            resumeUniverseSliders();
        }
    });
}

/**
 * @author: Pramveer
 * @date: 19th Apr 17
 * @desc: function to execute the slider tweaks
 */
function resumeUniverseSliders() {
    Template.TreatedPatients.valuecalculatorAdvanced();
    // Added By Yuvraj (11th April 2017) : Quality indicators needs to be reset.
    resetUniverseQualityIndicators();
    showChartSection();
    Session.set('treated_isCurrentModelModified', true);
}

function setRelativeWeightsSliderTo100() {
    $('#txtEffWeightTreated').val(100);
    $('#txtAdhWeightTreated').val(100);
    $('#txtCostWeightTreated').val(100);

    $('#txtEffWeightTreated').rangeslider('update', true);
    $('#txtAdhWeightTreated').rangeslider('update', true);
    $('#txtCostWeightTreated').rangeslider('update', true);


    var output = $('#txtEffWeightTreated').next().next();
    output.html(100 + "%");
    var output = $('#txtAdhWeightTreated').next().next();
    output.html(100 + "%");
    var output = $('#txtCostWeightTreated').next().next();
    output.html(100 + "%");
}


function renderComplicationRatePopup() {
    //----- OPEN popup for Complication rate
    $('.treatedDrugCheck .complicationRate').on('click', function(e) {
        //var targeted_popup_class = jQuery(this).attr('data-popup-open');
        //  $('[data-popup="' + targeted_popup_class + '"]').fadeIn(350);
        e.preventDefault();
        $('.treatedcomplicationData').html('');
        var data = Session.get('treatedPat_ComplicationData');
        var html = ''; //<div class="col-md-12 complicationRateViewP complicationRateViewtreated" id = "complicationRateView_treated">';
        for (var i = 0; i < data.length; i++) {
            let datasetDrugClass = data[i].isImsDrug == 1 ? 'ims-table-row' : 'phs-table-row';
            html += `<div class="col-md-12 complicationRateViewP complicationRateViewtreated ${datasetDrugClass}" id = "complicationRateView_treated">`;
            html += '<div class="col-md-1 checkbox">' +
                '<label>';
            if ((complication_CheckedDrugs.indexOf(data[i].drugGroupName) > -1) || (!isComparitiveFilter)) {
                html += '<input type="checkbox" class=" medcomplisttreated " value="' + data[i].drugGroupName + '" id="' + data[i].isImsDrug + '" checked/>';
            } else {
                html += '<input type="checkbox" class=" medcomplisttreated" value="' + data[i].drugGroupName + '" id="' + data[i].isImsDrug + '" />';
            }

            html += '<span class="cr"><i class="cr-icon fa fa-check"></i></span>' +
                '</label>' +
                '</div>' +
                '<div class="col-md-3 crDrugName" style="padding-left:26px;">' +
                '<div style="width:95%;">' + data[i].drugGroupName + '</div>' +
                '</div>' +
                '<div class="col-md-3 crCost">' +
                '<div style="width:15%;">' + data[i].complicationRateLabel + '</div>' +
                '</div>' +
                '<div class="col-md-3 crCost">' +
                '<div style="width:96%;">$' + data[i].complicationCostLabel + '</div>' +
                '</div>';
            html += '</div>';
        }

        $('.treatedcomplicationData').html(html);

        var stat = true;

        $('.medcomplisttreated').each(function(d) {
            if ($(this).prop('checked') == false) {
                stat = false;
            }
        });

        $('.medcomplistchecked').prop('checked', stat);
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

// To Open One Popover at a time and close other.
function assignEventToCloseAllPopovers() {
    $('[data-toggle=popover]').on('click', function(e) {
        $('[data-toggle=popover]').not(this).popover('hide');
    });
}

function initSessionVariables() {
    //set subpopulation list data blank
    Session.set('treatedPat_SPListData', []);
    Session.set('treatedPat_ComplicationData', []);
    //set the universe quality indicators value null
    Session.set('uniTreatedQualityIndicators', null);
}

function assignEventForResetFunctionality() {
    //treated reset event
    $('#treatedreset').click(function(e) {
        payerUtils.resetPayerFilters(e.currentTarget);
    });
}

function setTotalPatientCount() {
    $('#treatedTotalCount').html(AdvPayerPatientsCount[0].treated);
}

function hideAndShowSPSections() {
    $('.treatedPatienttemplateSubSection').hide();
    $('.subPopulationListViewDetailView').hide();
    $('.treatedPatientchartSection').show();
    $('.treatedSubPopulationListView-Container').hide();
}

// function setGenotypeComboForCurrentPatient() {
//     //selecting genotype of current patient
//     let genotypes = getCurrentPopulationFilters().genotypes;

//     setTimeout(function() {
//         if (genotypes.length < 1) {
//             $('#treatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
//             $('#treatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
//             //return;
//         }
//         $('#treatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
//         $('#treatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
//         $('.isChecked').each(function(d) {
//             $(this).prop('disabled', false);
//             if (genotypes.indexOf($(this).val()) > -1 && !$(this).prop('disabled')) {
//                 $(this).trigger('click');
//             }
//         });

//         $('.isCheckedProfile').each(function(d) {
//             $(this).prop('disabled', false);
//             if (genotypes.indexOf($(this).val()) > -1 && !$(this).prop('disabled')) {
//                 $(this).trigger('click');
//             }
//         });
//     }, 200);
// }
function setGenotypeComboForCurrentPatient() {
    //selecting genotype of current patient
    let genotypes = getCurrentPopulationFilters().genotypes;

    setTimeout(function() {
        genotypeFilterApply('isCheckedall','isChecked',genotypes,'treatedselectGenotype');
        ///set genotype for profile
        genotypeFilterApply('isCheckedallProfile','isCheckedProfile',genotypes,'treatedselectGenotypeProfile');
    }, 200);
}

let genotypeFilterApply = (allId,checkId,genotypes,multiSelectId) =>{
    
    //console.log(genotypes,checkId);
    if(genotypes  && genotypes.length>0 && genotypes[0].toLowerCase() === 'all'){
        genotypes = [];
    }
    let checkedAll = $('.'+allId).prop('checked');
        if(checkedAll && genotypes.length >= 1){
            $('#'+multiSelectId+' .mutliSelect li input[value = "all"]').trigger('click');
            $('.'+checkId).each(function(d) {
                //$(this).prop('disabled', false);
                if (genotypes.indexOf($(this).val()) > -1) {
                        $(this).trigger('click');
                    }
            });
        }
        else if(!checkedAll && ~~genotypes.length < 1){
             $('#'+multiSelectId+' .mutliSelect li input[value = "all"]').trigger('click');
        }
        else if(!checkedAll && ~~genotypes.length >= 1){
            $('.'+checkId).each(function(d) {
                let chkGeno = genotypes.indexOf($(this).val());
                if(chkGeno == -1 && $(this).prop('checked')){
                    $(this).trigger('click');
                    //$(this).prop('disabled', true);
                }
                else if(chkGeno>-1 && !$(this).prop('checked')){
                    $(this).trigger('click');
                    $(this).prop('disabled', false);
                }
            });
        }
}
let setGenotypeComboForProfileSection = (genotypes, cirrhosis, treatment, planType, tenureValue, fdaCompliant) => {

    genotypes = genotypes ? genotypes : getGenotypeFromFiltters();
    planType = planType ? planType : getPlanTypeFromFilters();
    //genotypes = getGenotypeFromFiltters();
    treatment = treatment ? treatment : getTreatmentFromFilters();
    cirrhosis = cirrhosis ? cirrhosis : getCirrhosisFromFilters();

    let rebateDiscount = getRebatePriceValue() || 'None';
    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    //tenureValue = tenureValue ? tenureValue : getLastYearValue();
    fdaCompliant = fdaCompliant ? fdaCompliant : $('#treatedFdaCombo').val();


    // if (genotypes[0] == 'all') {
    //     $('#treatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
    // } else {
    //     $('#treatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');
    //     $('#treatedselectGenotypeProfile .mutliSelect li input[value = "all"]').trigger('click');

    //     $('.isCheckedProfile').each((d, element) => {
    //         //$(element).prop('disabled', false);
    //         if (genotypes.indexOf($(element).val()) > -1 && !$(element).prop('disabled')) {
    //             $(element).trigger('click');
    //         }
    //     });
    // }
    genotypeFilterApply('isCheckedallProfile','isCheckedProfile',genotypes,'treatedselectGenotypeProfile');

    treatedPlanSelectProfile[0].selectize.setValue(planType);

    //set treatment
    let treat = treatment.length > 1 ? 'all' : treatment[0];
    treatedTreatmentSelectProfile[0].selectize.setValue(treat);

    //set cirrhosis
    if (cirrhosis.length <= 1) {
        treatedCirrhosisProfile[0].selectize.setValue(cirrhosis[0]);
    } else {
        treatedCirrhosisProfile[0].selectize.setValue('all');
    }
    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    //treatedTenureSelectProfile[0].selectize.setValue(tenureValue);

    treatedFdaComboProfile[0].selectize.setValue(fdaCompliant);

    //set rebate combo
    treatedRebateComboProfile[0].selectize.setValue(rebateDiscount);

    let preactingValue = $('.treatedPreactingCombo').val();
    treatedPreactingComboProfile[0].selectize.setValue(preactingValue);
}

// Remove Active class from the lists in the List view.
function removeActiveClassFromLists() {
    $('.detailViewLink').each(function(index) {
        $(this).removeClass('active');
    });
}

//show sub population section
function showSPView() {
    $('.treatedchartSubPopulation').show();
}

//show sub population list view section
function showSPlistView() {
    $('.treatedSubPopulationListView-Container').show();
}

//hide the sub population detail view
function hideSPDetailView() {
    $('.treatedSubPopulationDetailView-Container').hide();
}


function getCurrentPatientData() {
    return Session.get('selectedPatientData')[0];
}




Template.TreatedPatients.SaveCurrentModel = function() {
    //console.log("****** SaveCurrentModel *****")
    let userid = Meteor.user().profile.userDetail.email;
    let dbParams = {
        'userId': userid,
        'modelName': $('.treated_modelInfoContainer .modelNameInput').val(),
        'modelId': Session.get('treated_currentModelId')
    };
    // Meteor.call('IsModelExist', [dbParams], function(error, result) {
    //     if (result.statuscode == 0) {
    //         sAlert.error('Error! in saving model!', { timeout: 1500, onClose: function() { console.log('model save error - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
    //         setTimeout(function() {
    //             sAlert.closeAll();
    //         }, 3000);
    //     } else {
    //         // if (result.response[0].num == 1) {
    //         //     sAlert.error('A model with this model name already exist!', { timeout: 1500, onClose: function() { console.log('model save error - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
    //         //     setTimeout(function() {
    //         //         sAlert.closeAll();
    //         //     }, 3000);
    //         //     return false;
    //         // }
    //         // else{

    //         // }
    //     }
    let selectedFilters = payerUtils.getFiltersData();

    //console.log(selectedFilters);
    let genotypes = selectedFilters.treated.genotypes;
    let treatment = selectedFilters.treated.treatment;
    let cirrhosis = selectedFilters.treated.cirrhosis;
    let planType = selectedFilters.treated.planType;
    //let tenureValue = selectedFilters.treated.tenureValue;
    let flag = selectedFilters.treated.flag;

    let categoryData = {
        genotypes: genotypes,
        treatment: treatment,
        cirrhosis: cirrhosis,
        flag: flag
    };

    //get the category id list and category name
    let category_data = payerUtils.getPossibleCatCombination(categoryData);
    // console.log("***category_data*****");
    // console.log(category_data);
    let id_list = category_data;

    let localStorageSPData = getOptimizedDataFromLocalStorage(id_list);

    //localStorage.setItem('subpopulationOptimizedData', JSON.stringify(localStorageSPData));

    //let id_list = Session.get('category_id_list');

    let relativeWeights = getRelativeWeightsSliderData();


    let optimizedData = Session.get('treatedPat_SPListData');

    // localStorage.setItem('savedTreatedData', JSON.stringify(TreatedAnalyticsData));
    // localStorage.setItem('savedOptimizedData', JSON.stringify(optimizedData));
    localStorage.setItem('treated_category_id_list', JSON.stringify(id_list));
    // localStorage.setItem('mainFilters', JSON.stringify(selectedFilters.treated));
    // localStorage.setItem('raletiveWeights', JSON.stringify(relativeWeights));

    let complicationRateData = Session.get('treatedPat_ComplicationData');

    let UniverseSavingData = {
        'TotalCost': parseInt($('.treatedcardValueObserved').html().replace(/\D/g, '')),
        'Saving': parseInt($('.treatedcardValueGap').html().replace(/\D/g, '')),
        'BestValueUtilization': parseInt($('.treatedcardValueBest').html().replace(/\D/g, '')),
        'QualityIndicators': Session.get('uniTreatedQualityIndicators'),
        'UniverseSafety': Session.get('treatedUniverse_safety')
    }
    let modelNote = $('.treated_modelInfoContainer .modelNotesInput').val().trim();
    let modelName = $('.treated_modelInfoContainer .modelNameInput').val();
    userid = Meteor.user().profile.userDetail.email;
    let lastUpdated = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
    let tabName = 'Treated';
    if (modelName == '' || userid == undefined) {
        showModelDetails();
        $('.treated_saveModelContainer .js-showModelDetails').hide();
        sAlert.error('Error! <br> Please Fill Mandatory Fields!', { timeout: 2500, onClose: function() { console.log('closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
        setTimeout(function() {
            sAlert.closeAll();
        }, 1000);
        // sAlert.settings.position = "top-left";

    } else {

        let dbParams = {
            'userId': userid,
            'tabName': tabName,
            'note': modelNote,
            'modelName': modelName,
            'lastUpdated': lastUpdated,
            'AnalyticsRowData': JSON.stringify(TreatedAnalyticsData),
            'OptimizedData': JSON.stringify(optimizedData),
            'isComplicationRateFilter': isComparitiveFilter,
            'ComplicationRateDrugsData': JSON.stringify(complicationRateData),
            'SelectedFilters': JSON.stringify(selectedFilters.treated),
            'RelativeWeightsSliders': JSON.stringify(relativeWeights),
            'UntreatedTabPatietsSlider': JSON.stringify([1]),
            'action': 'no',
            'modelId': Session.get('treated_currentModelId'),
            'localStorageSPData': JSON.stringify(localStorageSPData),
            'UniverseSavingData': JSON.stringify(UniverseSavingData)
        };

        Meteor.call('saveModelDetails', [dbParams], function(result, error) {
            if (error) {
                sAlert.error('Error! in saving model!', { timeout: 1500, onClose: function() { console.log('model save error - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
                setTimeout(function() {
                    sAlert.closeAll();
                }, 3000);
            } else {
                if (result['details'] == 'update') {
                    sAlert.success('updated Successfully!', { timeout: 1000, onClose: function() { console.log('model save success - closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
                    setTimeout(function() {
                        sAlert.closeAll();
                    }, 2000);
                    Session.set('isModel', true);
                    Session.set('treated_isCurrentModelModified', false);
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
                    }, 2000);
                    Meteor.call('getSavedModelData', [{ userId: Meteor.user().profile.userDetail.email }], function(error, result) {
                        if (result) {
                            if (result.length > 0) {
                                currentModelId = result[0].modelId;

                                Session.set('treated_currentModelId', result[0].modelId);
                                $('.treated_modelInfoContainer .saveModelButton').attr('data', result[0].modelId);

                            }
                        }
                    });
                    Session.set('isModel', true);
                    Session.set('treated_isCurrentModelModified', false);
                    Session.set('treated_isCurrentModelSaved', true);
                }


            }
        });

        //hideSaveButton();


    }
    // });

    function SaveModelIntoDB() {

    }


}



Template.TreatedPatients.loadSavedModel = function(modelId) {

    //let selectedFilters = payerUtils.getFiltersData('treated');
    let treatedAnalyticsData = [];
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
            treatedAnalyticsData = JSON.parse(result[0].AnalyticsRowData);
            relativeWeights = JSON.parse(result[0].RelativeWeightsSliders);
            optimizedData = JSON.parse(result[0].OptimizedData);
            mainFilters = JSON.parse(result[0].SelectedFilters);

            Session.set('treatedPat_ComplicationData', JSON.parse(result[0].ComplicationRateDrugsData))
            isComparitiveFilter = result[0].isComplicationRateFilter == 0 ? false : true;

            let UniverseSavingData = JSON.parse(result[0].UniverseSavingData);
            Session.set('Treated_UniverseSavingData', UniverseSavingData);

            spLocalStorageData = JSON.parse(result[0].localStorageSPData) ? JSON.parse(result[0].localStorageSPData) : []; //JSON.parse(localStorage.getItem('subpopulationOptimizedData'));
            setSPLocalStorageData(spLocalStorageData);

            currentModelId = result[0].modelId;
            Session.set('treated_isCurrentModelModified', false);
            Session.set('treated_isCurrentModelSaved', true);
            Session.set('treated_currentModelId', result[0].modelId);
            //set model box details
            $('.treated_modelInfoContainer .modelNotesInput').val(result[0].note);
            $('.treated_modelInfoContainer .modelNameInput').val(result[0].modelName);
            $('.treated_modelInfoContainer .saveModelButton').attr('data', result[0].modelId);
            let genotypes = mainFilters.genotypes;
            let treatment;
            if (mainFilters.treatment.length && mainFilters) {
                treatment = mainFilters.treatment;
            } else {
                treatment = 'All';
                mainFilters.treatment = 'All';
            }
            let cirrhosis;
            if (mainFilters.cirrhosis.length && mainFilters) {
                cirrhosis = mainFilters.cirrhosis;
            } else {
                cirrhosis = 'All';
                mainFilters.cirrhosis = 'All';
            }
            //let treatment = mainFilters.treatment;
            // let cirrhosis = mainFilters.cirrhosis;
            let planType = mainFilters.planType;
            //let tenureValue = mainFilters.tenureValue;
            let flag = mainFilters.flag;
            let fdaCompliant = mainFilters.fdaCompliant;

            let categoryData = {
                genotypes: genotypes,
                treatment: treatment,
                cirrhosis: cirrhosis,
                planType: planType,
                fdaCompliant: fdaCompliant,
                flag: flag,
                rebateDb: mainFilters.rebateDb || 'both',
                rebateDiscount: mainFilters.rebateDiscount || 0
            };
            //console.log("** LOAD MODEL **");
            //console.log('categoryData ',categoryData);
            // console.log('mainFilters ',mainFilters);
            // Set Current filters value.
            payerUtils.storeFitersData('treated', categoryData, planType);

            //get the category id list and category name
            // let category_data = payerUtils.getPossibleCatCombination(categoryData);
            // let id_list = category_data;
            //global variable for treatedDbData

            let id_list = getUniqueArray(_.pluck(treatedAnalyticsData, 'category_id')).join(',');

            TreatedAnalyticsData = treatedAnalyticsData;
            Session.set('treated_category_id_list', id_list);

            // //check for filter applied or not
            // if(isComplicationFilterApplied) {
            //     //store complication rate data in  session
            //     Session.set('treatedPat_ComplicationData', complicationRateData);
            // }

            // The ChangedData in the arguments will be false as we are not clicking ont he Go button of the main filters.
            preparePayerToolData(id_list, treatedAnalyticsData, false, true, { renderTabView: true });

            setMainFilters(mainFilters);
            setRelativeWeights(relativeWeights);
            // removing the popup
            $('#treatedRebateOnSelection').dialog('destroy').hide();

            let reactive_var = 'uniTreatedQualityIndicators';

            // "treatedSPData" is set into the session in "preparePayerToolData" function.
            payerUtils.renderUniverseQualityIndicators(treatedSPData, optimizedData, reactive_var);
            optimizedData.sort(function(a, b) {
                return b.count - a.count;
            });

            collapseSubpopulationDetailView();

            Session.set('treatedPat_SPListData', optimizedData);

            // Updated Calculation according to Relative Weights Sliders.
            Template.TreatedPatients.valuecalculatorAdvanced(true);

            //hide load mask
            hideLoadingWheel();
            hideUniverseLoadingWheel();
            setTimeout(function() {
                //render charts for the tab
                payerUtils.renderChartsForTab('treated', treatedSPData);

                hideChartLoadingMask();
            }, 300);

            //show the subpopulation section
            $('.treatedSubpopulationWrapper').show();

            /**
             * @author: pramveer
             * @date:21st feb 2017  
             * @desc:removed years field from filters , set difference of duration on chart
             */
            //set tenure value on the chart
            let str = getCurrentPopulationFilters().duration.replace("BETWEEN", "").split('AND');

            let startDate = new Date(str[0].trim().replace(/'/g, '')).getFullYear();
            let endDate = new Date(str[1].trim().replace(/'/g, '')).getFullYear();

            let html = endDate - startDate;
            if (html == 0) {
                html = 1;
            }

            let string = html == 1 ? 'year' : 'years';

            $('.treatedTenureValue').html('Last ' + html + ' ' + string);
        }
    });


}

function collapseSubpopulationDetailView() {
    //remove all active classes
    $('.detailViewLink').each(function(index) {
        $(this).removeClass('active');
    });
    //hide all subpopulation info
    $('.treatedSubPopulationView-ListBody .subPopulationListViewDetailView').each(function(index) {
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

//is model exist or not
function isModelExist() {
    return currentModelId ? true : false;
}


function getRelativeWeightsSliderData() {
    let obj = {};
    let efficacy = $('#txtEffWeightTreated').val();
    let adherence = $('#txtAdhWeightTreated').val();
    let cost = $('#txtCostWeightTreated').val();

    obj['efficacy'] = efficacy;
    obj['adherence'] = adherence;
    obj['cost'] = cost;

    return obj;
}

function setMainFilters(data) {
    //console.log("Setting Main Filters");
    // console.log(data);
    var genotypes = data.genotypes;
    if (genotypes == undefined) {
        genotypes = [];
    }

    //$('#treatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
    if (genotypes.length == GenotypeList.length) {
        if ($('.isCheckedall').prop('checked') == false) {
            $('#treatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        }
    } else {
        if ($('.isCheckedall').prop('checked') == false) {
            $('#treatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        }
        $('#treatedselectGenotype .mutliSelect li input[value = "all"]').trigger('click');
        $('.isChecked').each(function(d) {
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
    //console.log(plan);
    treatedPlanSelect[0].selectize.setValue(plan);

    //set treatment
    let treat = data.treatment.length > 1 ? 'all' : data.treatment[0];
    treatedTreatmentSelect[0].selectize.setValue(treat);

    //set tenure
    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    //treatedTenureSelect[0].selectize.setValue(data.tenureValue);

    //set cirrhosis
    if (data.cirrhosis.length <= 1) {
        treatedCirrhosis[0].selectize.setValue(data.cirrhosis[0]);
    } else {
        treatedCirrhosis[0].selectize.setValue('all');
    }

    ////set fda commplaint
    //console.log(data);
    if (data.fdaCompliant) {
        treatedFdaCombo[0].selectize.setValue(data.fdaCompliant);
    } else {
        treatedFdaCombo[0].selectize.setValue('yes');
    }

    //set rebate value
    if (data.rebateDiscount) {
        treatedRebateCombo[0].selectize.setValue(data.rebateDiscount);
        $('input:radio[name=myRadio][value=' + data.rebateDb + ']').click();
    } else {
        treatedRebateCombo[0].selectize.setValue('None');
    }

    let preactingValue = data.preactingValue ? 'Yes' : 'No';
    treatedPreactingCombo[0].selectize.setValue(preactingValue);
}

function setRelativeWeights(data) {
    //console.log("Setting Relative Weights");
    //console.log(data);
    $('#txtEffWeightTreated').val(data.efficacy);
    $('#txtAdhWeightTreated').val(data.adherence);
    $('#txtCostWeightTreated').val(data.cost);

    $('#txtEffWeightTreated').rangeslider('update', true);
    $('#txtAdhWeightTreated').rangeslider('update', true);
    $('#txtCostWeightTreated').rangeslider('update', true);


    var output = $('#txtEffWeightTreated').next().next();
    output.html(data.efficacy + "%");
    var output = $('#txtAdhWeightTreated').next().next();
    output.html(data.adherence + "%");
    var output = $('#txtCostWeightTreated').next().next();
    output.html(data.cost + "%");
}

$(".mySaveBu").click(function() {


});



function showSaveButton() {
    var hidden = $('.treated_saveModelContainer');
    hidden.show('slide', { direction: 'left' }, 400);
    hidden.animateCss('fadeInLeft');
    hidden.animateCss('bounce');

}


function hideSaveButton() {
    var hidden = $('.treated_saveModelContainer');
    hidden.animateCss('fadeOutRight');
    hidden.hide('slide', { direction: 'left' }, 400);
}


function hideModelDetails() {
    var hidden = $('.treated_modelInfoContainer');
    hidden.hide('slide', { direction: 'left' }, 400);
}

function showModelDetails() {
    var hidden = $('.treated_modelInfoContainer');
    hidden.show('slide', { direction: 'left' }, 400);
}



function getOptimizedDataFromLocalStorage(ids) {
    // let tabname = "treated";
    // let subpopulationOptimizedData = [];
    // let temp = ids.split(",");
    // for (let i = 0; i < temp.length; i++) {
    //     let key = tabname + temp[i] + "SvgData";
    //     let data = JSON.parse(localStorage.getItem(key));
    //     if(data != null){
    //         let obj = {};
    //         obj[key] = data;
    //         subpopulationOptimizedData.push(obj);
    //     }
    // }

    // return subpopulationOptimizedData;



    let subpopulationOptimizedData = [];
    $('.treatedSubPopulationView-ListBody .inner').each(function() {
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
    Session.set('treatedSPSvgData', data);

    // if (data) {
    //     for (let i = 0; i < data.length; i++) {
    //         for(let key in data[i]){
    //             if(data[i][key] != null){
    //                 localStorage.setItem(key, JSON.stringify(data[i][key]));
    //             }
    //         }

    //     }
    // }
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
    let baseData = _.groupBy(TreatedAnalyticsData, 'category_id');

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
        drugsData = drugsData.sort((a, b) => {
            return b.value - a.value;
        });

        for (let j = 0; j < drugsData.length; j++) {
            let temp = {},
                adjustedData = adjustUtiForProfile(j, profUtilizations, drugsData);

            temp['medication'] = drugsData[j].medication;
            temp['cost'] = drugsData[j].cost;
            temp['efficacy'] = drugsData[j].efficacy;
            temp['adherence'] = drugsData[j].adherence;
            temp['utilization'] = adjustedData.ajdustedUti * 100;
            //temp['count'] = adjustedData.adjustedCount;
            temp['count'] = drugsData[j].count
            temp['value'] = drugsData[j].value;
            temp['safety'] = drugsData[j].safety;
            temp['safe'] = drugsData[j].safe_check;

            temp['drugid'] = drugsData[j].drugid;
            temp['period'] = drugsData[j].treatment_period;
            temp['comp_value'] = (drugsData[j].comp_value).toFixed(2);
            temp['compli_cost'] = commaSeperatedNumber(parseInt(drugsData[j].compli_cost));

            best_score = drugsData[j].best_value;
            best_score_cost += getBestValueCost(j, profUtilizations, drugsData);
            total = drugsData[j].total; // Total Count
            sum_value_score += drugsData[j].value;
            total_cost += drugsData[j].cost * drugsData[j].count;

            category_data.push(temp);
        }

        json['data'] = category_data;
        json['count'] = total;
        json['category_id'] = parseInt(keys);
        json['category_name'] = drugsData[0]['category_name'];
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
    $('.treatedcurrent_best').html(sum_score.toFixed(2));
    $('.treatedavgbest').html(best_score_cat);
    $('.treatedvaluegap').html(valuegap.toFixed(2));

    $('.treatedcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(best_value_cost_cat)));
    $('.treatedcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(total_cost_cat)));
    $('.treatedcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(total_savings)));

    //calculate savings per patient
    let saving_perpatient = total_pop == 0 ? 0 : (total_savings / total_pop).toFixed(2);
    $('.treatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(saving_perpatient));
    $('#treatedCurrentCount').html(commaSeperatedNumber(total_pop));
    $('.treatedTotalFilteredPatients').html(total_pop);
    Session.set('treatedTotalPatients', total_pop);

    preparedData.sort(function(a, b) {
        return b.count - a.count;
    });

    //set the data into session variable
    Session.set('treatedPat_SPListData', preparedData);

    //set the filtered data in the variable to compute the difference with the optimized one
    treatedSPData = preparedData;

    //refresh the universe quality indicators
    var optimizedData = Session.get('treatedPat_SPListData');
    var reactive_var = 'uniTreatedQualityIndicators';

    renderTheData(treatedSPData, optimizedData, reactive_var);

    //helper functions
    function adjustUtiForProfile(drugIndex, profUtiArray, drugsArray) {
        let ajdustedUti = 0;

        if (profUtiArray[drugIndex]) {
            ajdustedUti = profUtiArray[drugIndex];
        }

        if (drugsArray.length < profUtiArray.length) {
            if (drugsArray.length == 1) {
                ajdustedUti = 1;
            } else if (drugsArray.length == 2) {
                ajdustedUti = drugIndex == 0 ? 0.75 : 0.25;
            } else if (drugsArray.length == 3) {
                ajdustedUti = drugIndex == 0 ? 0.5 : 0.25;
            }
        }

        return {
            ajdustedUti: ajdustedUti,
            adjustedCount: Math.round(drugsArray[0].total * ajdustedUti)
        }
    }

    function getBestValueCost(drugIndex, profUtiArray, drugsArray) {
        let val = drugsArray[drugsArray.length - 1]['total'];
        val = Math.round(val * (profUtiArray[drugIndex] ? profUtiArray[drugIndex] : 0));

        return drugsArray[drugIndex]['cost'] * val;
    }
}

function convertFirstLetterCaps(str) {
    if (str) {
        let lower = str.toLowerCase();
        return lower.replace(/(^| )(\w)/g, function(x) {
            return x.toUpperCase();
        });
    }

}

let setTooltipForTotalPats = (rawData) => {
    rawData = payerUtils.getFilteredDataset(rawData, true);
    let categoryData = _.groupBy(rawData, 'category_id'),
        actualTotal = 0,
        uniquePatientsCount = 0,
        efficacyTotal = 0,
        usedTotal = 0;

    for (let keys in categoryData) {
        actualTotal = categoryData[keys][0]['allTotalDataRecords'];
        uniquePatientsCount = categoryData[keys][0]['uniquePatientIds'];
        efficacyTotal += _.pluck(categoryData[keys], 'efficacy_patients').sum();
        usedTotal += categoryData[keys][0]['total'];
    }

    // $('.searchPatientCountHeaderPayer').html(commaSeperatedNumber(actualTotal));

    //Pram (29th May 17) : Changed the count on the payer tab
    // Nisha 02/20/2017 Changes for commorn Chorort menu
    //setCohortPatientCount({ patientCount: actualTotal });
    // $('#treatedAllRecordsCount').html(commaSeperatedNumber(actualTotal));
    // $('#treatedDistinctCount').html(commaSeperatedNumber(usedTotal));

    setCohortPatientCount({ patientCount: uniquePatientsCount });
    $('#treatedAllRecordsCount').html(commaSeperatedNumber(uniquePatientsCount));
    $('#treatedDistinctCount').html(commaSeperatedNumber(usedTotal));

    let tootTipData = `<div class="payerCount-infoTip">
                        <!-- <div class="payerCount-infoTip-Header">Payer Count Adjustment</div> -->
                        <div class="payerCount-infoTip-Section">
                            <div class="payerInfo-Label">Patients With SVR : </div>
                            <div class="payerInfo-Value boldfnt">${commaSeperatedNumber(efficacyTotal)}</div>
                        </div>
                        <div class="horizon-fyiSeparator"></div>
                        <div class="payerCount-infoTip-Section">
                            For analytics on the payer tab we are only using the records which falls under the medications
                            where the cost for medication is available and also the svr data is available.
                        </div>
                    </div>`;

    $('.totalSPPatients-Info').tooltip({ contents: '<div></div>' });
    $('.totalSPPatients-Info').tooltip('option', 'content', tootTipData);
}

let setPayerHeaderTabData = (params) => {
    $('#desc_cirrhosis').find('.efd-cell2_subpopulaiton').html(params['cirrhosis'] != null ? params['cirrhosis'].replace(/'/g, '').toString() : 'All');

    $('#desc_treatment').find('.efd-cell2_subpopulaiton').html(params['treatment'] != null ? params['treatment'].replace(/'/g, '').toString() : 'All');

    $('#desc_genotype').find('.efd-cell2_subpopulaiton').html(params['genotypes'] != null ? params['genotypes'].replace(/'/g, '').toString() : 'All');

    //$('#desc_plan_payer').find('.efd-cell2_subpopulaiton').html(convertFirstLetterCaps(params['planType']) != null ? convertFirstLetterCaps(params['planType']) : 'all');
    setInsurancePlanInHeader(params['planType']);
    /**
     * @author: pramveer
     * @date:21st feb 2017  
     * @desc:removed years field from filters 
     */
    //$('#desc_month_payer').find('.efd-cell2_subpopulaiton').html(params['tenureValue'] || parseInt(ListOfYear[0].year) * 12);
}

//function to get FDA complaint check
let getFdaComplaintCheck = () => {
    return $('.treatedFdaCombo').val();
}





// These functions needs to be moved in a new file. Modified By Yurvaj 14th March

function renderUniverseViewData(expenseData) {
    let bestValueCost = _.pluck(expenseData, 'best_value_cost').sum();
    let totalSavings = _.pluck(expenseData, 'savings').sum();
    let totalExpenses = _.pluck(expenseData, 'total_cost').sum();
    let totalPatients = _.pluck(expenseData, 'count').sum();
    let perPatientSaving = totalSavings / totalPatients;

    setUniverseViewTotalExpenses(totalExpenses);
    setUniverseViewBestValueExpenses(bestValueCost);
    setUniverseViewTotalSavings(totalSavings);
    setUniverseViewPerPatientSavings(perPatientSaving);
}

function renderUniverseViewValueScores(analyticsdata) {

    //let observedValue = getValueScoreData(analyticsdata.phsData);
    // let bestValue = getValueScoreData(analyticsdata.imsData);
    let clientDataset = payerUtils.getFilteredDataset(analyticsdata, true);
    let rweDataset = payerUtils.getFilteredDataset(analyticsdata, false);
    let observedValue = getValueScoreData(clientDataset);

    observedValue = isNaN(observedValue) ? 0 : observedValue;

    // We dont want to take average within the subpopulation
    //let bestValue = getBestValueScoreData(analyticsdata.imsData);
    let bestValue = getBestValueScoreData(rweDataset, clientDataset);
    bestValue = isNaN(bestValue) ? 0 : bestValue;

    let valueGap = (bestValue - observedValue).toFixed(2);

    setUniverseViewObservedValue(observedValue);
    setUniverseViewBestValue(bestValue);
    setUniverseViewValueGap(valueGap);
}

function setUniverseViewTotalExpenses(totalExpenses) {
    $('.treatedcardValueObserved').html('$ ' + commaSeperatedNumber(Math.round(totalExpenses)));
}

function setUniverseViewBestValueExpenses(bestValueCost) {
    $('.treatedcardValueBest').html('$ ' + commaSeperatedNumber(Math.round(bestValueCost)));
}

function setUniverseViewTotalSavings(totalSavings) {
    $('.treatedcardValueGap').html('$ ' + commaSeperatedNumber(Math.round(totalSavings)));
}

function setUniverseViewPerPatientSavings(perPatientSaving) {
    //Pram (13 Apr 17) : Added check for NaN value for per patient savings
    let displayValue = isNaN(perPatientSaving) ? 0 : parseFloat(perPatientSaving).toFixed(2);
    $('.treatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(displayValue));
}

function setUniverseViewObservedValue(observedValue) {
    $('.treatedcurrent_best').html(observedValue);
}

function setUniverseViewBestValue(bestValue) {
    $('.treatedavgbest').html(bestValue);
}

function setUniverseViewValueGap(valueGap) {
    $('.treatedvaluegap').html(valueGap);
}



// let prepareExpensesDataForDataSet = (dataset, imsDataSet, recommedationFlag) => {
//     let preparedData = [];

//     for (let category in dataset) {
//         let drugsData = dataset[category];
//         let rweData = imsDataSet[category];

//         //Pram (21st Mar 17): if no drugs are in real world then make the client dataset for that subpopulation as the rwe dataset
//         rweData = rweData ? rweData : drugsData;


//         //let uniVerseObj = {};
//         let uniVerseObj = payerUtils.getStructureForSPList();

//         // pending
//         // apply weights on the combined dataset then do further calculation. This should be done in the Prepare Payet tool data method.
//         let imsdata = applyUniverseweights(rweData);
//         drugsData = applyUniverseweights(drugsData);

//         //filter drugs with value score > 0
//         imsdata = payerUtils.getDrugsWithValueScoreGreaterThanZero(imsdata,'value');
//         drugsData = payerUtils.getDrugsWithValueScoreGreaterThanZero(drugsData,'value');

//         if(drugsData.length) {
//             //let bestValueExpenses = getBestValueCost(imsdata) * drugsData[0].total;

//             let profUti = recommedationFlag ? recommedationFlag.profUtilizations : null;
//             let bestValueExpenses = getBestValueCostForCategory(imsdata, profUti, drugsData[0].total);
//             let projecteExpenses = getExpensesForCategory(drugsData);

//             uniVerseObj.best_value_cost = bestValueExpenses;
//             uniVerseObj.best_value_cost_display = commaSeperatedNumber(bestValueExpenses);
//             uniVerseObj.category_id = drugsData[0].category_id;
//             uniVerseObj.category_name = drugsData[0].category_name;
//             uniVerseObj.count = drugsData[0].total;

//             // Why only phsData?  We should give Combined data
//             uniVerseObj.data = prepareDrugsData(drugsData);

//             uniVerseObj.optimizedValue = 0;
//             uniVerseObj.optimizedValue_display = 0;
//             uniVerseObj.savings = projecteExpenses - bestValueExpenses;
//             uniVerseObj.savings_display = commaSeperatedNumber(uniVerseObj.savings);
//             uniVerseObj.total_cost = projecteExpenses;
//             uniVerseObj.total_cost_display = commaSeperatedNumber(projecteExpenses);
//         }

//         preparedData.push(uniVerseObj);
//     }

//     //console.log(preparedData);

//     return preparedData;

//     //function to get best value drug
//     function getBestValueCostForCategory(currDataset, drugConsideration, totalCatPatients) {
//         // let drugsData = sortDataInDesc(currDataset, 'value');
//         // return drugsData[0].cost * drugsData[0].total;
//         let bestValCost = 0,
//             totalDrugs = currDataset.length,
//             utiPopulations = 0,
//             profArr1 = [1],
//             profArr2 = [0.75, 0.25],
//             profArr3 = [0.50, 0.25, 0.25];


//         /**
//          * @author: Yuvraj Pal
//          * @desc: Implemetation of logic when we have same values score for two drugs. We have to select the appropriate drugs by compareing the treatmetn period and Cost.
//          * @date: 7th April 2017
//          */

//         // currDataset = payerUtils.sortDataInDesc(currDataset, 'value');

//         currDataset = payerUtils.SortByBestDrugsDecendingOrder(currDataset, 'value');

//         drugConsideration = drugConsideration ? drugConsideration.length : 1;

//         drugConsideration = totalDrugs < drugConsideration ? totalDrugs : drugConsideration;

//         for (let i = 0; i < drugConsideration; i++) {
//             let drugCost = currDataset[i]['cost'];

//             utiPopulations = Math.round(totalCatPatients * eval('profArr' + drugConsideration + '[' + (i) + ']'));

//             bestValCost += drugCost * utiPopulations;
//         }

//         return bestValCost;

//     }

//     function getBestValueCost(currDataset) {
//         let drugsData = sortDataInDesc(currDataset, 'value');
//         return drugsData[0].cost;
//     }

//     //function to get savings
//     function getExpensesForCategory(currDataset) {
//         let totalExpenses = 0;
//         for (let i = 0; i < currDataset.length; i++) {
//             totalExpenses += currDataset[i].count * currDataset[i].cost;
//         }
//         return totalExpenses;
//     }
// }





let prepareExpensesDataForDataSet = (analyticsdata, recommedationFlag) => {
    let preparedData = [];

    let dataset = payerUtils.getFilteredDataset(analyticsdata, true);
    let imsDataSet = payerUtils.getFilteredDataset(analyticsdata, false);


    dataset = _.groupBy(dataset, 'category_id');
    imsDataSet = _.groupBy(imsDataSet, 'category_id');
    analyticsdata = _.groupBy(analyticsdata, 'category_id');



    for (let category in dataset) {
        let drugsData = dataset[category];
        let imsdata = imsDataSet[category];

        let combinedAnalyticsData = analyticsdata[category];


        //Pram (21st Mar 17): if no drugs are in real world then make the client dataset for that subpopulation as the rwe dataset
        imsdata = imsdata ? imsdata : drugsData;


        //let uniVerseObj = {};
        let uniVerseObj = payerUtils.getStructureForSPList();

        // apply weights on the combined dataset then do further calculation. This should be done in the Prepare Payet tool data method.
        // let imsdata = applyUniverseweights(rweData);
        // drugsData = applyUniverseweights(drugsData);

        //filter drugs with value score > 0
        imsdata = payerUtils.getDrugsWithValueScoreGreaterThanZero(imsdata, 'value');
        drugsData = payerUtils.getDrugsWithValueScoreGreaterThanZero(drugsData, 'value');

        if (drugsData.length) {
            //let bestValueExpenses = getBestValueCost(imsdata) * drugsData[0].total;

            let profUti = recommedationFlag ? recommedationFlag.profUtilizations : null;
            let bestValueExpenses = getBestValueCostForCategory(imsdata, profUti, drugsData[0].total);
            let projecteExpenses = getExpensesForCategory(drugsData);

            uniVerseObj.best_value_cost = bestValueExpenses;
            uniVerseObj.best_value_cost_display = commaSeperatedNumber(bestValueExpenses);
            uniVerseObj.category_id = drugsData[0].category_id;
            uniVerseObj.category_name = drugsData[0].category_name;
            uniVerseObj.count = drugsData[0].total;

            // This data is used in calculating the quality indicators' calculations in the universe view.
            uniVerseObj.data = prepareDrugsData(drugsData);

            uniVerseObj.optimizedValue = 0;
            uniVerseObj.optimizedValue_display = 0;
            uniVerseObj.savings = projecteExpenses - bestValueExpenses;
            uniVerseObj.savings_display = commaSeperatedNumber(uniVerseObj.savings);
            uniVerseObj.total_cost = projecteExpenses;
            uniVerseObj.total_cost_display = commaSeperatedNumber(projecteExpenses);
        }

        preparedData.push(uniVerseObj);
    }

    //console.log(preparedData);

    return preparedData;

    //function to get best value drug
    function getBestValueCostForCategory(currDataset, drugConsiderationProf, totalCatPatients) {
        // let drugsData = sortDataInDesc(currDataset, 'value');
        // return drugsData[0].cost * drugsData[0].total;
        let bestValCost = 0,
            totalDrugs = currDataset.length,
            utiPopulations = 0,
            profArr1 = [1],
            profArr2 = [0.75, 0.25],
            profArr3 = [0.50, 0.25, 0.25];


        /**
         * @author: Yuvraj Pal
         * @desc: Implemetation of logic when we have same values score for two drugs. We have to select the appropriate drugs by compareing the treatmetn period and Cost.
         * @date: 7th April 2017
         */

        // currDataset = payerUtils.sortDataInDesc(currDataset, 'value');

        currDataset = payerUtils.SortByBestDrugsDecendingOrder(currDataset, 'value');

        let drugConsideration = drugConsiderationProf ? drugConsiderationProf.length : 1;

        drugConsideration = totalDrugs < drugConsideration ? totalDrugs : drugConsideration;

        for (let i = 0; i < drugConsideration; i++) {
            let drugCost = currDataset[i]['cost'];

            utiPopulations = Math.round(totalCatPatients * eval('profArr' + drugConsideration + '[' + (i) + ']'));

            bestValCost += drugCost * utiPopulations;
        }

        return bestValCost;

    }

    function getBestValueCost(currDataset) {
        let drugsData = sortDataInDesc(currDataset, 'value');
        return drugsData[0].cost;
    }

    //function to get savings
    function getExpensesForCategory(currDataset) {
        let totalExpenses = 0;
        for (let i = 0; i < currDataset.length; i++) {
            totalExpenses += currDataset[i].count * currDataset[i].cost;
        }
        return totalExpenses;
    }
}

let prepareDrugsData = (dataArray) => {
    let finalArray = [];

    for (let j = 0; j < dataArray.length; j++) {
        let json = _.clone(dataArray[j]);

        json['efficacy_count'] = dataArray[j].efficacy_patients;
        json['safe'] = dataArray[j].safe_check;

        if (isComparitiveFilter == true)
            json['checked'] = "checked";
        else {
            json['checked'] = "";
        }

        json['drugid'] = dataArray[j].drugid;
        json['period'] = dataArray[j].treatment_period;
        json['comp_value'] = (dataArray[j].comp_value).toFixed(2);
        json['compli_cost'] = commaSeperatedNumber(parseInt(dataArray[j].compli_cost));

        finalArray.push(json);
    }

    return finalArray;
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



// Added By Yurvaj 15th March 
// This function will set the Total Expenses in the subpopulation list view.
function renderSubpulationTotalExpenses(expenseData) {

    let bestValueExpenses = _.pluck(expenseData, 'best_value_cost').sum();
    let totalSavings = _.pluck(expenseData, 'savings').sum();
    let projectedExpenses = _.pluck(expenseData, 'total_cost').sum();
    let totalPatients = _.pluck(expenseData, 'count').sum();

    setSPViewTotalPatients(totalPatients);
    setSPViewToatalPatientHeader(totalPatients);
    setSPViewProjectedExpenses(projectedExpenses);
    setSPViewBestValueExpenses(bestValueExpenses);
    setSPViewTotalSavings(totalSavings);
}

function setSPViewTotalPatients(totalPatients) {
    let parentSelector = 'treatedSubPopulationList-Footer';
    $('.' + parentSelector + ' .SPList-totalPatients').html(totalPatients);
}

function setSPViewToatalPatientHeader(totalPatients) {
    $('.treatedTotalFilteredPatients').html(totalPatients); // Subpulation Total patient.
}

function setSPViewProjectedExpenses(projectedExpenses) {
    let parentSelector = 'treatedSubPopulationList-Footer';
    $('.' + parentSelector + ' .totalProjectedCost').html('$ ' + commaSeperatedNumber(Math.round(projectedExpenses)));
}

function setSPViewBestValueExpenses(bestValueExpenses) {
    let parentSelector = 'treatedSubPopulationList-Footer';
    $('.' + parentSelector + ' .totalBestCost').html('$ ' + commaSeperatedNumber(Math.round(bestValueExpenses)));
}

function setSPViewTotalSavings(totalSavings) {
    let parentSelector = 'treatedSubPopulationList-Footer';
    $('.' + parentSelector + ' .totalSavingsOppurtunity').html('$ ' + commaSeperatedNumber(Math.round(totalSavings)));
}


// Added By Yuvraj 15th March 17 
// This function will set the universe view data into session.
function setUniverseViewDataInSession(expenseData) {

    let bestValueExpenses = _.pluck(expenseData, 'best_value_cost').sum();
    let totalSavings = _.pluck(expenseData, 'savings').sum();
    let projectedExpenses = _.pluck(expenseData, 'total_cost').sum();
    let totalPatients = _.pluck(expenseData, 'count').sum();


    //set data for display in universe Section
    let UniverseSavingData = {
        'TotalCost': Math.round(projectedExpenses),
        'Saving': totalSavings,
        'BestValueUtilization': bestValueExpenses,
        'QualityIndicators': []
    };

    Session.set('Treated_UniverseSavingData', UniverseSavingData);
}

function setTotalPatientsInSession(expenseData) {
    let totalPatients = _.pluck(expenseData, 'count').sum();
    // Set Total Patients into the session.
    Session.set('treatedTotalPatients', totalPatients);
}

function setUniverseViewToZero() {
    $(".alls").html(0);
    $('.treatedcurrent_best').html(0); //set observed value
    $('.treatedavgbest').html(0); //set average best score
    $('.treatedvaluegap').html(0); // set value gap
    $('.treatedcardValueBest').html('$ ' + commaSeperatedNumber(0)); //set value best savings to 0
    $('.treatedcardValueGap').html('$ ' + commaSeperatedNumber(0)); //set savings opportunity lost
    $('.treatedcardValueGapSaving').html('$ ' + commaSeperatedNumber(0)); //set savings per ptient to 0
    $('.treatedcardValueObserved').html('$' + commaSeperatedNumber(0)); //set value observed to 0
}


// Waste Data at Universe Level
function appendWateDataUniverseLevel(container, data) {
    if (!data) {
        // container = '#client-clinical';
        data = 'client';
    }
    let params = {};

    let planType = genotypes = treatment = cirrhosis = fdaCompliant = '';
    let currentFilters = getCurrentPopulationFilters();

    params.planType = getPlanTypeFromFilters();
    genotypes = getGenotypeFromFiltters();
    //params.genotypes = getGenotypeFromFiltters();
    params.treatment = getTreatmentFromFilters();
    params.cirrhosis = getCirrhosisFromFilters();
    //params.fdaCompliant  = getFdaComplaintCheck();

    params.genotypes = (genotypes.indexOf('All') > -1 || genotypes.indexOf('ALL') > -1) ? [] : genotypes;
    params.fdaCompliant = null;
    params.rebateDiscount = getRebatePriceValue();
    params.showPreactingAntivirals = currentFilters.showPreactingAntivirals;
    params.duration = currentFilters.duration;
    params.database = data == "client" ? 'PHS_HCV' : 'IMS_LRX_AmbEMR_Dataset';
    params.isClient = data == "client" ? true : false;

    $(container).empty();
    //Insert the template on the popup
    UI.renderWithData(Template.PayerWasteOpportunity, params, $(container)[0]);
}




function covertArrayToObj(array) {
    let obj = {};
    for (let i = 0; i < array.length; i++) {
        obj[i] = array[i];
    }
    return obj;
}

/**
 * Praveen :To hide all subtabs except subpopulation section chart
 */
let fnShowChartsTabOnRender = () => {
    highlightTab('charts');
    //hide recommendation section
    $('.treatedPatientourRecommendationsSection').hide();

    //hide the sub population section
    $('.treatedPatientsubPopulationSection').hide();

    //hide waste opportunity section
    $('.treatedPatientwasteOpportunitySection').hide();

    //show charts section
    $('.treatedPatientchartSection').show();

}


/**
 * Yuvraj : Referesh Univerview Quality indicators
 */

function resetUniverseQualityIndicators() {
    //refresh the universe quality indicators
    var optimizedData = Session.get('treatedPat_SPListData');
    var reactive_var = 'uniTreatedQualityIndicators';

    payerUtils.renderUniverseQualityIndicators(treatedSPData, optimizedData, reactive_var);
}


function renderWasteOpportunitySection() {
    appendWateDataUniverseLevel('#treatedWasteOppotunityPopup-Content_new');
    // appendWateDataUniverseLevel();

    //$('.treatedPatientwasteOpportunitySection').show();
    //$('.js-wasteOppotunityNavLinks').removeClass('active');
    //$('.js-wasteOverview').addClass('active');

    //$('.tab-pane .wasteOppotunity-SectionWrapper').removeClass('active');
    //$('#js-wasteOverviewTab').addClass('active');
    //$('#treatedWasteOppotunityPopup-Content_new').show();
}

function showChartSection() {


    $('.detailViewLink').each(function(i, ele) {
        let category_id = $(ele).attr('identifier');

        $('.treatedlistDetailView_' + category_id).hide();
        $(ele).removeClass('active');
    });

    $('.treatedPatientsubPopulationSection').hide();
    $('#treatedWasteOppotunityPopup-Content_new').hide();
    $('.treatedPatientourRecommendationsSection').hide();
    $('.treatedPatientchartSection').show();

    $('#treatedChartTab').addClass('active').siblings().removeClass('active');
}



let isAnySubpopulationOptimized = () => {
    let isOptimized = false;

    let qualityIndicatorsData = Session.get('uniTreatedQualityIndicators');

    if (!qualityIndicatorsData['optimizeDataIndicators']) {
        return isOptimized;
    }

    let optimizedData = qualityIndicatorsData['optimizeDataIndicators'];

    if (optimizedData.Efficacy.data.length > 0 || optimizedData.Cost.data.length > 0) {
        isOptimized = true;
    }

    return isOptimized;
}

let showTheSliderMoveWarning = () => {
    $('#uniWeightsMoveWarningMsgBox').show();
}



function setRelativeWeightsSlider(weights) {
    $('#txtEffWeightTreated').val(weights.efficacy * 100);
    $('#txtAdhWeightTreated').val(weights.adherence * 100);
    $('#txtCostWeightTreated').val(weights.cost * 100);

    $('#txtEffWeightTreated').rangeslider('update', true);
    $('#txtAdhWeightTreated').rangeslider('update', true);
    $('#txtCostWeightTreated').rangeslider('update', true);


    var output = $('#txtEffWeightTreated').next().next();
    output.html(weights.efficacy * 100 + "%");
    var output = $('#txtAdhWeightTreated').next().next();
    output.html(weights.adherence * 100 + "%");
    var output = $('#txtCostWeightTreated').next().next();
    output.html(weights.cost * 100 + "%");
}


let checkTabsWastePayerTb = () =>{
    $('.clinical-appropriatenessc').removeClass('disabled');
    $('.clinical-appropriatenessb').addClass('disabled');
    $('.clinical-appropriatenessc').addClass('active');
    $('.clinical-appropriatenessb').removeClass('active');
 }