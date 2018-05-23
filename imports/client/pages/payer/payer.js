import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './payer.html';

import * as payerUtils from '../../lib/custom/payer/payerToolUtilities.js';

AdvPayerDrugsRiskData = null;
let selectizeDrop = '';
let tabs = ['treated', 'treating', 'untreated'];

let compareModel_check_count = 0;
let compareModel_checked_ids = [];
let compareModel_checked_tab = '';
let payer_savedModelsData = [];
//For new relative value chart
let relativeValueChartData = [],
    relativeChartContainer = null;

//set model variables for all tabs
for (let tab in tabs) {
    Session.set(tabs[tab] + '_currentModelId', 0);
    Session.set(tabs[tab] + '_isCurrentModelSaved', false);
    Session.set(tabs[tab] + '_isCurrentModelModified', false);
}

Session.set('isModel', false);

Template.Payer.onCreated(function() {

    let self = this;
    this.isModel = new ReactiveVar(false);


    this.autorun(function() {

        Meteor.call('getSavedModelData', [{ 'userId': Meteor.user().profile.userDetail.email }], function(error, result) {
            if (error) {
                Session.set('isModel', false);
                // flag = false; 
            } else {
                if (result.length > 0) {
                    Session.set('isModel', true);
                    self.isModel.set(true);
                }
            }
        });

    });


});



Template.Payer.rendered = function() {
    highLightTab('Payer');
    // Initializing RDropdowns.
    selectizeDrop = $('.AdvancePayer .pinDDL').selectize({
        create: true,
        dropdownParent: null
    });



    Meteor.call('getDrugsRiskData', {}, function(error, result) {
        // Nisha 02/20/2017 Changes for commorn Chorort menu
        setCohortHeaderMenu({ tabName: "payer" });
        AdvPayerDrugsRiskData = result;
    });

    // Initializing Range Sliders.
    $('input[type=range]').rangeslider({
        polyfill: false
    });

    $(document).on('input', '.WeightSliderDiv input[type="range"]', function(e) {
        var output = $(e.currentTarget).next().next();
        output.html(e.currentTarget.value + "%");
    });

    //http://stackoverflow.com/questions/11703093/how-to-dismiss-a-twitter-bootstrap-popover-by-clicking-outside
    $('#AdvancePayer').on('click', function(e) {
        //only buttons
        if ($(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover.in').length === 0) {
            $('[data-toggle="popover"]').popover('hide');
        }

        //close the rebate on popup
        try {
            $('#treatedRebateOnSelection').dialog('close');
        } catch (ex) {
            //console.log('initilization error of dialog');
        }


        //buttons and icons within buttons
        /*
        if ($(e.target).data('toggle') !== 'popover'
            && $(e.target).parents('[data-toggle="popover"]').length === 0
            && $(e.target).parents('.popover.in').length === 0) {
            $('[data-toggle="popover"]').popover('hide');
        }
        */
    });


    HCVAnalyticsData.change(['1a', 'naive', 'cirrhosis']);
    $('#treatedCount').html(commaSeperatedNumber(AdvPayerPatientsCount[0].treated));
    //$('#treatingCount').html(commaSeperatedNumber(AdvPayerPatientsCount[0].treating));
    //$('#untreatedCount').html(commaSeperatedNumber(AdvPayerPatientsCount[0].untreated));


    $('.templateSection').hide();
    $('#TreatedPatientsSection').show();

    //events for multiselect combo
    // $(".dropdown dt a").on('click', function() {
    //     $(".dropdown dd ul").slideToggle('fast');
    // });

    // $(".dropdown dd ul li a").on('click', function() {
    //     $(".dropdown dd ul").hide();
    // });

    // $(document).bind('click', function(e) {
    //     var $clicked = $(e.target);
    //     if (!$clicked.parents().hasClass("dropdown"))
    //         $(".dropdown dd ul").hide();
    // });

    $('.mutliSelect input[type="checkbox"]').on('click', function(e) {
        payerUtils.handleMultiGenoCombo(e.target);
    });

    //events for multiselect combo in recommendations genotype
    $(".rec-dropdown dt a").on('click', function() {
        $(".rec-dropdown dd ul").slideToggle('fast');
    });

    $(".rec-dropdown dd ul li a").on('click', function() {
        $(".rec-dropdown dd ul").hide();
    });

    $(document).bind('click', function(e) {
        var $clicked = $(e.target);
        if (!$clicked.parents().hasClass("rec-dropdown"))
            $(".rec-dropdown dd ul").hide();
    });

    $(".popup-rec-dropdown dt a").on('click', function() {
        $(".popup-rec-dropdown dd ul").slideToggle('fast');
    });

    //events for multiselect combo in recommendations popup genotype
    $(".popup-rec-dropdown dd ul li a").on('click', function() {
        $(".popup-rec-dropdown dd ul").hide();
    });

    $(document).bind('click', function(e) {
        var $clicked = $(e.target);
        if (!$clicked.parents().hasClass("popup-rec-dropdown"))
            $(".popup-rec-dropdown dd ul").hide();
    });

    //events for multiselect combo in main genotype
    $(".main-dropdown dt a").on('click', function() {
        $(".main-dropdown dd ul").slideToggle('fast');
    });

    $(".main-dropdown dd ul li a").on('click', function() {
        $(".main-dropdown dd ul").hide();
    });

    $(document).bind('click', function(e) {
        var $clicked = $(e.target);
        if (!$clicked.parents().hasClass("main-dropdown"))
            $(".main-dropdown dd ul").hide();
    });

    //popover events
    $("[data-toggle=popover]").popover();
    $('.valueChartLegend').hide();
    $('.valueChartChangeAxisCombo ').hide();
};
Template.Payer.helpers({
    'getGenotypeList': function() {
        //list genotype
        return GenotypeList.reactive()
    },
    'isModelPresent': function() {
        return Session.get('isModel');
    }
});

Template.Payer.events({
    'click .selectDragToCetagoryType': function(e) {
        sAlert.closeAll();
        var priserveData = $('#selectedDragToCetagoryTypeDataArray').val();
        var data = [];
        if (priserveData != '') {
            data = JSON.parse(priserveData);
        }
        var genotype = $('#newselectGenotype').find(":selected").val();
        var cirrhosis = $('input[name=cirrhosisoptradio]:checked').val();
        var treatment = $('input[name=treatmentoptradio]:checked').val();
        var treatmentPeriod = $('#newtreatmentPeriod').val();
        if (genotype == '' || cirrhosis == '' || treatment == '' || treatmentPeriod == '') {
            sAlert.error('Error! <br> Please Fill Mandatory Fields!', { timeout: 2500, onClose: function() { console.log('closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
            setTimeout(function() {
                sAlert.closeAll();
            }, 1000);
        } else {
            var flag = true;
            for (var i = 0; i < data.length; i++) {
                if (data[i]['genotype'] == genotype && data[i]['cirrhosis'] == cirrhosis && data[i]['treatment'] == treatment && data[i]['treatmentPeriod'] == treatmentPeriod) {
                    flag = false;
                }
            }
            if (flag) {
                var html = '<tr>' +
                    '<td>' + genotype + '</td>' +
                    '<td>' + (cirrhosis == "Yes" ? 'With' : 'Without') + '</td>' +
                    '<td>' + treatment + '</td>' +
                    '<td>' + treatmentPeriod + 'W</td>' +
                    '</tr>';
                data.push({
                    "genotype": genotype,
                    "cirrhosis": cirrhosis,
                    "treatment": treatment,
                    "treatmentPeriod": treatmentPeriod,
                    "category_id": get_category_id(genotype, treatment, cirrhosis)
                });
                $('#selectedDragToCetagoryTypeDataArray').val(JSON.stringify(data));
                $('.selectedDragToCetagoryType').append(html);
            }
        }
    },
    'click #popupclose': function() {
        $(".subpopulationChartsPopup-back").hide();
        $(".subpopulationChartsPopup-message").hide();
        $(".subpopulationChartsPopup-footer").show();

    },
    'click .selectedDragToCetagoryTypeButton': function(e) {
        var json = $('#selectedDragToCetagoryTypeDataArray').val();
        if (json == '') {
            sAlert.error('Error! <br> Please Select Combination of cetagory!', { timeout: 2500, onClose: function() { console.log('closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
            setTimeout(function() {
                sAlert.closeAll();
            }, 1000);
        } else {
            if ($('#newdrugname').val() == '' || $('#newcost').val() == '' || $('#newefficacy').val() == '' || $('#newadherence').val() == '') {
                sAlert.error('Error! <br> Please Fill Mandatory Fields!', { timeout: 2500, onClose: function() { console.log('closing alert in 1000ms...'); }, effect: 'bouncyflip', html: true, position: 'top-left' });
                setTimeout(function() {
                    sAlert.closeAll();
                }, 1000);
            } else {
                var data = {
                    "drugname": $('#newdrugname').val(),
                    "drugcost": $('#newcost').val(),
                    "drugefficacy": $('#newefficacy').val(),
                    "drugadherence": $('#newadherence').val(),
                    "categoryData": JSON.parse($('#selectedDragToCetagoryTypeDataArray').val())
                };
                Meteor.call('SaveNewMedication', [data]);
                $('.selectedDragToCetagoryType').html('');
                $('#newdrugname').val('');
                $('#newcost').val('');
                $('#newefficacy').val('');
                $('#newadherence').val('');
                $('#newtreatmentPeriod').val('');
                $('#newselectGenotype').val('');
                $('#selectedDragToCetagoryTypeDataArray').val('');
                sAlert.closeAll();
            }
        }

    },
    'click .payerModelPopup .loadWarningMessageButtonSave': function(e) {
        $('#loadWarningMessage').hide();
        // $('#loadWarningMessage').modal('hide');
        let id = $(e.currentTarget).attr('modelId');
        let tab = $(e.currentTarget).attr('tabname').toLowerCase();
        $('.templateSection').hide();
        if (tab == 'treated') {
            $('.advancePayerSubTabs-links li.TreatedTab').addClass('active').siblings().removeClass('active');
            Template.TreatedPatients.SaveCurrentModel();
            $('#TreatedPatientsSection').show();
        } else if (tab == 'treating') {
            $('.advancePayerSubTabs-links li.TreatingTab').addClass('active').siblings().removeClass('active');
            Template.TreatingPatients.SaveCurrentModel();
            $('#TreatingPatientsSection').show();
        } else {
            $('.advancePayerSubTabs-links li.UnTreatedTab').addClass('active').siblings().removeClass('active');
            Template.UnTreatedPatients.SaveCurrentModel();
            $('#UnTreatedPatientsSection').show();
        }

    },
    'click .payerModelPopup .continueUnsavedchanges': function(e) {
        //$('#loadWarningMessage').modal('hide');
        $('#loadWarningMessage').hide();

        let id = $(e.currentTarget).attr('modelId');
        let tabName = $(e.currentTarget).attr('tabname').toLowerCase();


        //$('#loadWarningMessage').modal('hide');
        if (Session.get(tabName + '_editGoTrigger')) {
            Session.set(tabName + '_isCurrentModelModified', false);
            $('.' + tabName + 'ApplyUniFilters').trigger('click');

        } else {
            $('.templateSection').hide();
            if (tabName == 'treated') {
                $('.advancePayerSubTabs-links li.TreatedTab').addClass('active').siblings().removeClass('active');
                $('#TreatedPatientsSection').show();
                Template.TreatedPatients.loadSavedModel(id);
            } else if (tabName == 'treating') {
                $('.advancePayerSubTabs-links li.TreatingTab').addClass('active').siblings().removeClass('active');
                $('#TreatingPatientsSection').show();
                Template.TreatingPatients.loadSavedModel(id);

            } else if (tabName == 'untreated') {
                $('.advancePayerSubTabs-links li.UnTreatedTab').addClass('active').siblings().removeClass('active');
                $('#UnTreatedPatientsSection').show();
                Template.UnTreatedPatients.loadSavedModel(id);
            }
        }

    },
    'click .WarningMsgCurrentModelDelete': function(e) {
        //$('#WarningMsgForCurrentModel').model('hide');
        $('#WarningMsgForCurrentModel').hide();
        let id = $(e.currentTarget).attr('modelId');
        let tab = $(e.currentTarget).attr('tabname').toLowerCase();

        Session.set(tab + '_currentModelId', 0);
        Session.set(tab + '_isCurrentModelSaved', false);
        Session.set(tab + '_isCurrentModelModified', true);
        $('.' + tab + '_modelInfoContainer .modelNotesInput').val('');
        $('.' + tab + '_modelInfoContainer .modelNameInput').val('');
        $('.' + tab + '_modelInfoContainer .saveModelButton').attr('data', '');

        removeModel(id);

    },
    'click .WarningMsgCurrentModelClose': function() {
        $('#WarningMsgForCurrentModel').hide();
    },

    'click .advancePayerSubTabs .advancePayerSubTabs-links li': function(e) {
        var tabName = $(e.currentTarget).find('.tabname').html().toLowerCase();
        $(e.currentTarget).addClass('active').siblings().removeClass('active');

        e.preventDefault();

        document.getElementById("anim_loading_theme").style.top = "90%";
        document.getElementById("anim_loading_theme").style.visibility = "visible";
        document.getElementById("overlay").style.display = "block";
        //removeTemplate();
        //if ($("#templateRenderSection").children().length > 0) {
        //    removeTemplate();
        //}

        //insertTemplate(tabName);
        $('.templateSection').hide();
        if (tabName === "treated patients") {
            $('#TreatedPatientsSection').show();
        } else if (tabName === "treating patients") {
            $('#TreatingPatientsSection').show();
        } else if (tabName === "untreated patients") {
            $('#UnTreatedPatientsSection').show();
        }
        document.getElementById("anim_loading_theme").style.visibility = "hidden";
        document.getElementById("overlay").style.display = "none";
        document.getElementById("anim_loading_theme").style.top = "40%";
        //highlightTab(tabName);
    },
    'click .spClinicalULTab': function(event, template) {
        var ele = $(event.currentTarget);
        $(ele).addClass('activeDrug').siblings().removeClass('activeDrug');
        var tabToShow = $(ele).children('a').attr('infotab');
        $(ele).parent().next().find('.seperateDrugSection').each(function(index) {
            // set the clicked tab active & show it
            if (tabToShow == $(this).attr('data')) {
                $(this).addClass('activeDrug').siblings().removeClass('activeDrug');
            }

            //load interaction Data
            if ($(this).attr('interactiondata') == "true") {
                $(this).html('Loading.......');
                var drug = $(this).attr('data');
                drug = drug.split('_')[1];
                var setID = AllDrugs.filter(function(record) {
                    return record.name === drug;
                });

                if (!setID.length) {
                    setID = '';
                } else {
                    setID = setID[0].setId;
                }
                var sectionName = $(this).attr('sectionName')

                getSafetyRiskInfo(setID, { sectionName: sectionName, frameObj: null }, $(this));
            }
        });
    },
    'click .lr-hr-moreInfo': function(event, template) {
        var drug = $(event.currentTarget).attr('drug');
        var section = $(event.currentTarget).attr('section');
        localStorage.setItem('DrugName', drug);
        localStorage.setItem('SafetySection', section);

        var parentContainer = $(event.currentTarget).closest('.spClinicalTrialSectionContainer').parent();
        var canvasId = $(parentContainer).attr('id'),
            mixedTabName = canvasId.split('_')[0].replace('Safetycanvas', ''),
            tabName = mixedTabName.replace(/\d+/g, ''),
            category_id = parseInt(mixedTabName.replace(tabName, '')),
            drugid = canvasId.split('_')[1];

        AmdApp['payer']['safetyTabInfo'] = {
            canvasId: canvasId,
            tabName: tabName,
            category_id: category_id,
            drugid: drugid,
            isFromPayerTab: true
        };

        //displaySafetyOnHeader();       
        $('.safety_blk_bg').css('height', ($('html').height()));
        $(".safety_popup").show();
        UI.render(Template.Safety, $('#safety_popup').find('.popup-body')[0]);
        $('.popup-body').animate({
            scrollTop: 0
        }, 1);
        $('#allDrugsCombo option:contains(' + drug + ')').attr('selected', 'selected');
        $('#allDrugsCombo').trigger('onchange');
        $('.popup-body').find('.posrelovfhid').removeClass('container');
        $('.popup-modal').css('left', $('.fullwidth').offset().left);
        $('.popup-body').css('height', ($(window).height() - 170) + 'px');
        // window.location = 'javascript:Router.go("Safety");';
    },
    'click .safety_closebtn': function() {
        // OLD CODE for highlight payer tab
        // $('a.NavigateUrlByTabDesk[href="/Payer"]').addClass("active");
        $('a.NavigateUrlByTabDesk[href="/Payer"]').parent().addClass("active");
        $(".safety_popup, .overlay").hide();
    },
    'click .js-riskSection': function(e, template) {
        var ele = $(e.currentTarget),
            content = $(ele).attr('data-content'),
            isFrameData = $(ele).attr('iframeData') == 'true' ? true : false,
            displaySection = $(ele).parent().parent().next();

        $(ele).addClass('isActive').siblings().removeClass('isActive');

        $(displaySection).html();
        $(displaySection).html(content);

        //load first drug/tab data
        if (isFrameData) {
            $(displaySection).find('.spClinicalULTabs :first-child').trigger('click');
        }

    },
    'click .subpopulationChartsPopup-back': function() {
        let tab = $('#subpopulationChartsPopup-container').attr('tabname').toLowerCase();
        $(".subpopulationChartsPopup-back").hide();
        $(".subpopulationChartsPopup-footer").show();
        zoomSubpopulationChart(this, tab, 'genotypeandsavings');
    },
    'click .ActuaExpensesChartSwitch button': function(e, template) {
        var ele = $(e.currentTarget);
        var activeCls = '';
        var tabName = '';

        activeCls = $(ele).attr('class').split(' ');
        tabName = activeCls[0];
        activeCls = activeCls[activeCls.length - 1];


        tabName = tabName.split('ActuaExpensesChart')[0];

        //return if the active element is clicked
        if (activeCls == 'active')
            return;

        $(ele).addClass('active').siblings().removeClass('active');
        var yAxisPlot = 'total_cost';
        if ($(ele).html().toLowerCase() == 'savings') {
            yAxisPlot = 'savings';
            changeActualExpenseAndSavingTitle("savings", tabName);
        } else {
            changeActualExpenseAndSavingTitle("expenses", tabName);
        }

        handleSwitchForActualExpenses(ele, yAxisPlot);
        setTimeout(function() {
            d3.selectAll('.GenotypeVsCirrhosisChart .c3-axis-x-label')
                .attr("dy", "32");
        }, 300);
    },
    'change .comparativeChart_Combo select': function(e, template) {
        var value = $(e.currentTarget).val();
        var identifier = $(e.currentTarget).parent().attr('data');
        var xAxisPlot = 'Cost',
            yAxisPlot = 'Efficacy';
        var chartContainer = identifier + '_conparativeDrugValueChart';

        if (value == 2) {
            xAxisPlot = 'Utilization';
            yAxisPlot = 'Expenses';
        }
        var data = JSON.parse(localStorage.getItem(identifier + 'SvgDataFinal'));
        // Commented OLD Relative value chart from Payer
        //renderComparitiveValueChart(data, xAxisPlot, yAxisPlot, chartContainer, identifier);

        //Added new Highchart bubble for relative value chart
        relativeChartContainer = chartContainer;
        relativeValueChartData = data;
        //renderNewRelativeValueChart(container, 'Cost', 'Efficacy', 500, 950);
        renderNewRelativeValueChart(container, xAxisPlot, yAxisPlot, 500, 950);


    },
    'click .loadSavedModel': function() {
        listSavedModels();
        $('#listSavedModelList').empty();
        $('#loadExistingModels').show();
        compareModel_check_count = 0;
        compareModel_checked_ids = [];
        payer_savedModelsData = [];
        compareModel_checked_tab = '';

    },
    'click .js-recommendations-ApplyBtn': function(event, templat) {

    },
    'change .js-recommendationsRadio': function(event, template) {
        $(event.target).parents('.recommendedProfWrapper').find('.recommendations-ApplyBtn').hide();
        $(event.target).parent().parent().next().find('.recommendations-ApplyBtn').show();
    },
    'change .js-payerModel-Checkbox': function(event, template) {

        let isChecked = event.target.checked,
            modelId = parseInt($(event.target).attr('modelid'));
        let current_category_data = $(event.target).attr('category_data');
        let flag = true;
        //check for each checkbox category data except current checked

        $('.js-payerModel-Checkbox').each((d, element) => {
            if ($(element).prop('checked') == true && $(element).attr('modelid') != modelId) {
                let category_changed = $(element).attr('category_data');
                if (category_changed != current_category_data) {
                    flag = false;
                }
                if ($(event.target).attr('tabName').toLowerCase() != $(element).attr('tabName').toLowerCase()) {
                    flag = false;
                }
            }
        });

        if (!flag) {
            $(event.target).prop('checked', false);
            sAlert.error('Please select similar models and tabs!', { timeout: 1000, onClose: function() {}, effect: 'bouncyflip', html: true, position: 'top-left' });
            setTimeout(function() {
                sAlert.closeAll();
            }, 2500);
        }

        if ($(event.target).prop('checked')) {
            compareModel_check_count++;
            compareModel_checked_ids.push(parseInt(modelId));
        }

        if (!isChecked) {
            if (compareModel_checked_ids.indexOf(parseInt(modelId)) != -1) {
                compareModel_check_count--;
                compareModel_checked_ids.removeByValue(parseInt(modelId));
            }

        }


        if (compareModel_check_count > 1) {
            $('.payer-compareModelBtn').show();
        } else {
            $('.payer-compareModelBtn').hide();
        }
    },
    'click .js-payer-compareModelBtn': (event, template) => {
        $('#comparePayerModelsContainer').empty();
        //UI.renderWithData(Template.ComparePayerModel, [{obj:'1233'}], $('#comparePayerModelsContainer')[0]);
        let modelDataObj = {
            modelsData: payer_savedModelsData,
            checkedIds: compareModel_checked_ids,

        };

        UI.renderWithData(Template.ComparePayerModel, modelDataObj, $('#comparePayerModelsContainer')[0]);
        $('#loadExistingModels').hide();
        $('#comparePayerModelsUI').show();
    },
    'click .expand_recommendation': (event) => {
        // let id = $(event.currentTarget).attr('href');
        // if($(''+id).attr('toggle') == 0){
        //     $('.recommendationsContainer').css('overflow-y','auto');
        //     $(id+'_expand_recommendation .expand_recommendation').html('less..');
        //     $(''+id).attr('toggle',1);
        //     //$(''event.currentTarget).html('less..');
        // }
        // else{
        //     $(id+'_expand_recommendation .expand_recommendation').html('more..');
        //     $(''+id).attr('toggle',0);
        //     $('.recommendationsContainer').scrollTop(0);
        //     $('.recommendationsContainer').css('overflow-y','hidden');
        //     //$(event.currentTarget).html('more..');
        // }

        let state = $(event.currentTarget).attr('data');
        if (state == 'more') {
            $('.expand_recommendationBtn').attr('data', 'less');
            $('.reccProfile-moreSpSection').show();
            $('.expand_recommendationBtn').html('less..');
            //$('.recommendationsContainer').css('overflow-y', 'auto');
        } else {
            $('.expand_recommendationBtn').attr('data', 'more');
            $('.reccProfile-moreSpSection').hide();
            $('.expand_recommendationBtn').html('more..');
            //$('.recommendationsContainer').css('overflow-y', 'auto');
        }
    },
    'click .js-uniWeightsZeroWarningBtn': (event, template) => {
        $('#uniWeightsZeroWarningMsgBox').hide();
    }
});

Template.Payer.destroyed = function() {
    //clear Session variables
    //Session.set('lastPatientTreated');
    for (let tab in tabs) {
        Session.set(tabs[tab] + '_currentModelId', 0);
        Session.set(tabs[tab] + '_isCurrentModelSaved', false);
        Session.set(tabs[tab] + '_isCurrentModelModified', false);
    }
    AdvPayerDrugsRiskData = null;
};


function highlightTab(tabName) {

    $(".advancePayerSubTabs-links li").each(function(i) {
        if ($(this).find('.tabname').html().toLowerCase() === tabName) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}

//get category id
function get_category_id(gen, treat, cirr) {
    var category_name = '';
    if (cirr == "Yes") {
        category_name = gen + " " + treat + " cirrhosis";
    } else {
        category_name = gen + " " + treat;
    }
    return (category_name_list.indexOf(category_name)) + 1;
}

//function to get the Sub Population
function getSubPopulationDataForTab(tabName) {
    if (tabName == 'treated')
        return Session.get('treatedPat_SPListData');
    else if (tabName == 'treating')
        return Session.get('treatingPat_SPListData');
    else
        return Session.get('untreatedPat_SPListData');
}

function handleSwitchForActualExpenses(ele, yAxisPlot) {
    var genoVScirr_chartContainer = '#' + $(ele).parent().next().children('div.chartBody').attr('id');
    var cirrVSnoncirr_chartContainer = '#' + $(ele).parent().next().next().attr('id');

    var tabName = $(ele).attr('class');

    // Inserting space based on capital letters in camelCase word. and then split them based on space.
    tabName = tabName.replace(/([A-Z])/g, ' $1').trim();
    tabName = tabName.split(' ')[0];

    var data = getSubPopulationDataForTab(tabName);

    cirrhosisVsNoncirrhosisChart(cirrVSnoncirr_chartContainer, data, yAxisPlot);
    genotypeVsCirrhosisChart(genoVScirr_chartContainer, data, yAxisPlot);
}



function changeActualExpenseAndSavingTitle(type, tabName) {
    let title = "Projected Savings";
    if (type == "expenses") {
        title = "Projected Expenses Incurred";
    }

    if (tabName == "treated") {
        $('#treatedActualExpenseChartTitle').html(title);
    } else if (tabName == "treating") {
        $('#treatingActualExpenseChartTitle').html(title);
    } else {
        $('#untreatedActualExpenseChartTitle').html(title);
    }
}


let listSavedModels = function() {
    $('#listSavedModelList-loadingMask .chart_loader').show();
    $('#listSavedModelList-loadingMask').show();

    Meteor.call('getSavedModelData', [{ userId: Meteor.user().profile.userDetail.email, id: undefined }], function(error, result) {
        if (error) {
            $('#listSavedModelList-loadingMask .chart_loader').hide();
            $('#listSavedModelList-loadingMask').hide();
            console.log('error getting data');
        } else {
            if (result.length > 0) {
                payer_savedModelsData = result;
                Session.set('isModel', true);
                let html = '';
                let headerhtml = '';
                $('#listSavedModelList-Header').html(headerhtml);
                $('#listSavedModelList').html(html);

                headerhtml = `<div class="savedModelRowHeader">
                                <div class="modelHeaderColumn" style="width: 5%;">Compare</div>
                                <div class="modelHeaderColumn" style="width: 20%;">Name</div>
                                <div class="modelHeaderColumn" style="width: 10%;">Tab</div>
                                <div class="modelHeaderColumn" style="width: 20%;">Notes</div>
                                <div class="modelHeaderColumn" style="width: 15%;">Last Updated</div>
                                <div class="modelHeaderColumn" style="width: 20%;">Load Model</div>
                                <div class="modelHeaderColumn" style="width: 10%;">Delete</div>
                                </div>`;

                for (let m = 0; m < result.length; m++) {

                    mainFilters = JSON.parse(result[m].SelectedFilters);
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

                    //get the category id list and category name
                    let category_data = payerUtils.getPossibleCatCombination(categoryData);

                    html += `<div class="savedModelRow savedModelRow_${result[m].modelId}">
                                <div class="modelRowColumn" style="width:5%;">
                                    <input type="checkbox" class="payerModel-Checkbox js-payerModel-Checkbox" 
                                    tabname="${result[m].tabName}" modelid="${result[m].modelId}" category_data = '${category_data}' style="position:inherit;"></input>
                                </div>
                                <div class="modelRowColumn editModel editModel_${result[m].tabName}" data="${result[m].modelId}" tabName = "${result[m].tabName}" style="width: 20%;min-height: 40px; cursor:pointer;">${result[m].modelName}</div>
                                <div class="modelRowColumn editModel editModel_${result[m].tabName}" data="${result[m].modelId}" tabName = "${result[m].tabName}" style="width: 10%;min-height: 40px;">${result[m].tabName}</div>
                                <div class="modelRowColumn editModel editModel_${result[m].tabName}" data="${result[m].modelId}" tabName = "${result[m].tabName}" style="width: 20%;min-height: 40px;">${result[m].note}</div>
                                <div class="modelRowColumn editModel editModel_${result[m].tabName}" data="${result[m].modelId}" tabName = "${result[m].tabName}"  style="width: 15%;min-height: 40px;">${formattedDate(result[m].lastUpdated)}</div>
                                <div class="modelRowColumn editModel editModel_${result[m].tabName}" data="${result[m].modelId}" tabName = "${result[m].tabName}"  title = "load model" style="width: 20%;min-height: 40px;"><span style="cursor:pointer;" ><img src="/load-model-icon.png" class="loadModelIcon"> </span></div>
                                <div class="modelRowColumn removeModel" tabname="${result[m].tabName}" data="${result[m].modelId}" title = "delete model" style="width: 10%;"><span style="cursor:pointer;" ><img src="/delete-model-icon.png" class="deleteModelIcon"></span></div>
                            </div>`;

                }

                //footer for the compare button
                let footerHtml = ``;
                footerHtml = `<div class="payer-compareModelBtn js-payer-compareModelBtn" style="display:none;">Compare Models</div>`;

                $('#listSavedModelList-loadingMask .chart_loader').hide();
                $('#listSavedModelList-loadingMask').hide();

                //append data to div
                $('#listSavedModelList-Header').append(headerhtml);
                $('#listSavedModelList').append(html);
                $('#listSavedModelList-Footer').html(footerHtml);
                assignEvents();
            } else {
                let html = '<div class="errorNoSavedModalData">You have not saved any Model yet</div>';
                $('#listSavedModelList-Header').html('');
                $('#listSavedModelList').html(html);
                Session.set('isModel', true);
            }

            //assign events for edit and delete models

        }
    });


}

//format date
let formattedDate = function(data) {
    let date = new Date(data);
    let time = date.toLocaleTimeString().split(':');
    return (date.toString().replace(/\S+\s(\S+)\s(\d+)\s(\d+)\s.*/, '$1​ $2 $3')) + ' ' + time[0] + ':' + time[1]; //$.datepicker.formatDate("M d, yy", new Date(data));
}

//function to delete model
let removeModel = function(id) {
    Meteor.call('removeModelDetails', [{ modelId: id, userId: Meteor.user().profile.userDetail.email }], function(result, error) {
        if (result) {
            sAlert.success('Deleted Successfully!', { timeout: 1000, onClose: function() {}, effect: 'bouncyflip', html: true, position: 'top-left' });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
            $('.savedModelRow_' + id).remove();
            if (result['details'] == 'no') {
                Session.set('isModel', false);
                $('#loadExistingModels').hide();
            }


        } else {
            sAlert.error('Error in removing model!', { timeout: 1000, onClose: function() {}, effect: 'bouncyflip', html: true, position: 'top-left' });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
        }
    });
}

//event binds for saved models row
let assignEvents = function() {

    $('.removeModel').on('click', function() {
        let id = $(this).attr('data');
        let tabname = $(this).attr('tabname').toLowerCase();

        if (Session.get(tabname + '_currentModelId') == id) {
            showWarningMsgForDeletingCurentModel(id, tabname);
        } else {
            removeModel(id);
        }


    });

    $('.editModel').on('click', function() {
        let id = $(this).attr('data');
        let tabName = $(this).attr('tabName').toLowerCase();
        //$('#loadExistingModels').hide();
        $('#loadExistingModels').hide();
        //Session.set('editModelTrigger',true);
        Session.set(tabName + '_editGoTrigger', false);
        if (isTabHasUnSavedChanges(tabName)) {
            showWarningMsgForLoadingModel(id, tabName, tabName.charAt(0).toUpperCase() + tabName.substring(1));
        } else {
            let tab = tabName;
            $('.templateSection').hide();
            if (tabName == 'treated') {
                tab = 'Treated';
                $('#TreatedPatientsSection').show();
                Template.TreatedPatients.loadSavedModel(id);

            } else if (tabName == 'treating') {
                tab = 'Treating';
                $('#TreatingPatientsSection').show();
                Template.TreatingPatients.loadSavedModel(id);

            } else if (tabName == 'untreated') {
                tab = 'UnTreated';
                $('#UnTreatedPatientsSection').show();
                Template.UnTreatedPatients.loadSavedModel(id);
            }

            $('.advancePayerSubTabs-links li.' + tab + 'Tab').addClass('active').siblings().removeClass('active');
        }

    });
}


function showWarningMsgForDeletingCurentModel(id, tabname) {

    let html = `<div class="col-md-12 ">
                    This model is currently in use. Do you really want to delete it?
                    </div>

                    <button type="button" modelId="${id}" tabname="${tabname}" class="btn btn-default WarningMsgCurrentModelDelete warningMsgBtn">Yes</button>
                    <button type="button" class="btn btn-default WarningMsgCurrentModelClose warningMsgBtn">No</button>`;

    $('#WarningMsgCurrentModelContent').html(html);
    //$('#loadExistingModels').hide();
    $('#WarningMsgForCurrentModel').show();
}


function showWarningMsgForLoadingModel(id, tabname, titleTabName) {

    let html = `<div class="col-md-12 ">

                    You have unsaved Changes on ${titleTabName} tab. Do you want to save them?
                    </div>

                    <button type="button" modelId="${id}" tabname="${tabname}" class="btn btn-default loadWarningMessageButtonSave warningMsgBtn">Yes</button>
                    <button type="button" modelId="${id}" tabname="${tabname}" class="btn btn-default continueUnsavedchanges warningMsgBtn">No</button>`;

    $('#loadWarningMessageContent').html(html);
    $('#loadWarningMessage').show();
}

function isTabHasUnSavedChanges(tab) {
    return Session.get(tab + '_isCurrentModelModified');
}