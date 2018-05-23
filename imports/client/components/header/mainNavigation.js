import {
    Template
} from 'meteor/templating';
import {
    Router
} from 'meteor/iron:router';
import './mainNavigation.html';

Template.mainNavigation.onCreated(function() {
    $('.pharmasubmenu_Btn').hide();
    $('.analyticssubmenu_Btn').hide();
});
// Nisha 02/14/2017 added this to hid the menus while refresh
Template.mainNavigation.onRendered(function() {
    $('.pharmasubmenu_Btn').hide();
    $('.analyticssubmenu_Btn').hide();
});

Template.mainNavigation.onDestroyed(function() {

    // deregister from some central store
    //  GalleryTemplates = _.without(GalleryTemplates, this);
});

Template.mainNavigation.events({

    'click .NavigateUrlByTabDesk': function(e, template, data) {
        let tabName = (data == undefined) ? $(e.currentTarget).html().toLowerCase() : data["tabName"];
        //close navigation Option
        closeNav();
        if (isModelPayerChanged()) {
            $('#loadWarningMessageTab').show();
        } else {

            Router.go('/' + tabName);
            $('.insurancePayer').hide();
            $('.pharmasubmenu_Btn').hide();
            $('.analyticssubmenu_Btn').hide();
            $('.switch').show();

            let filters = AmdApp.Filters;
            if (tabName == 'payer') {
                //$('#headerSingleSearch').empty();
                $('.advancedSearchChange').html('Search');
                //$('.pharmaMedicationAdvanced').hide();
                $('.insurancePayer').show();
                Session.set('headerTab', 'payer');
                $('.headerbuttonFilesection').hide();
                $('.switch').hide();
                // UI.renderWithData(Template.HeaderInnerContentPayerTab, filters, $('#headerSingleSearch')[0]);
                //UI.render(Template.HeaderInnerContentEditMode, $('#headerSingleSearch')[0]);
            } else if (tabName == 'patient' || tabName == 'provider') {
                /**
                 *  Modified: Arvind 10-Feb-2017
                 *  Issue :Cohort menu not changes when we move from patient to provider  or vice versa once it is rendered
                 *  Solution : commented below Session condition which causes issue in cohort section
                 *  due to that below first condition always true and display wrong cohort info
                 *  Note : Session variable retain value when we change search criteria and render data where we are previously
                 */

                // Session.set('headerTab', tabName);

                //// Modified end
                $('.switch').show();
                if (Session.get('headerTab') == 'patient' || Session.get('headerTab') == 'provider') {
                    $('.searchPatientCountHeader').html(filters != null ? commaSeperatedNumber(filters.patientCountTab) : 0);
                } else {
                    //$('#headerSingleSearch').empty();
                    //UI.render(Template.HeaderInnerContentEditMode, $('#headerSingleSearch')[0]);
                    $('.searchPatientCountHeader').html(filters != null ? commaSeperatedNumber(filters.patientCountTab) : 0);
                }
                $('.headerbuttonFilesection').hide();
                $('.advancedSearchChange').html('Search');
                //$('.pharmaMedicationAdvanced').hide();

            } else if (tabName == 'analytics') {
                //$('#headerSingleSearch').empty();
                $('.insurancePayer').hide();
                $('.switch').show();
                //UI.renderWithData(Template.HeaderInnerContentEditMode, "analytics", $('#headerSingleSearch')[0]);
                $('.headerbuttonFilesection').show();
                //UI.render(Template.HeaderInnerContentAnalytics, $('#headerSingleSearch')[0]);
                //$('.searchPatientCountHeaderAnalytics').html(filters != null ? commaSeperatedNumber(filters.patientCountTab) : 0);
                $('.searchPatientCountHeader').html(filters != null ? commaSeperatedNumber(filters.patientCountTab) : 0);

                $('.advancedSearchChange').html('Search');
                Session.set('headerTab', 'analytics');
                if (AmdApp.Filters)
                    $('.analyticssubmenu_Btn').show();
                //$('.pharmaMedicationAdvanced').hide();
            } else if (tabName == 'pharma') {
                //$('#headerSingleSearch').empty();
                $('.insurancePayer').hide();
                $('.switch').show();
                $('.pharmasubmenu_Btn').show();
                $('.pharma_submenu_main_div').css('width', 0);
                $('.pharma_submenu_main_div').hide();
                $('.headerbuttonFilesection').hide();
                Session.set('headerTab', 'pharma');
                // UI.render(Template.HeaderInnerContentPharma, $('#headerSingleSearch')[0]);
                //UI.renderWithData(Template.HeaderInnerContentEditMode, "pharma", $('#headerSingleSearch')[0]);
                $('.searchPatientCountHeader').html(filters != null ? commaSeperatedNumber(filters.patientCountTab) : 0);
            } else {
                //$('#headerSingleSearch').empty();
                $('.insurancePayer').hide();
                $('.switch').show();
                $('.headerbuttonFilesection').hide();
                //UI.render(Template.HeaderInnerContentEditMode, $('#headerSingleSearch')[0]);
                $('.searchPatientCountHeader').html(filters != null ? commaSeperatedNumber(filters.patientCountTab) : 0);
                $('.advancedSearchChange').html('Search');
                //$('.pharmaMedicationAdvanced').hide();
            }
            $('#loadWarningMessageTab').hide();
        }
    },
    'click .pharmasubmenu_Btn': (e) => {
        if ($('.pharma_submenu_main_div').width() == 0) {
            $('.pharma_submenu_main_div').css('width', 250);
            $('.pharma_submenu_main_div').show();
        } else {
            $('.pharma_submenu_main_div').css('width', 0);
            $('.pharma_submenu_main_div').hide();
        }

    },
    'click .analyticssubmenu_Btn': (e) => {
        if ($('.Analytic_submenu_main_div').width() == 0) {
            $('.Analytic_submenu_main_div').css('width', 250);
            $('.Analytic_submenu_main_div').show();
        } else {
            $('.Analytic_submenu_main_div').css('width', 0);
            $('.Analytic_submenu_main_div').hide();
        }

    },
    'click .searchPatientMenu': (e) => {
        if ($('#mySidenav').width() == 0)
            openNav();
        else {
            closeNav();
        }
    },
    //comparison popup hide
    'click .js-closeDatasetComparsionPopup': (event, template) => {
        $('#datasetComparsionPopup').hide();
    },
});

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 03-May-2017
 * @desc: Added isAuthorized helper method to show or hide on navigation menu as global helper `isCustomRole` 
 * not working as expected.
*/
Template.mainNavigation.helpers({
	'isAuthorized': (tab) => {
		//console.log(tab);
        // function path : `../../lib/custom/common`
		return isUserAuthorized(tab);
	}
});

//navigation search and close
let openNav = () => {
    document.getElementById("mySidenav").style.width = "350px";
    // jayesh 4th april 2017 solved search menu blank issue
    if( !$("#advancesearchdiv").hasClass("active") &&  !$("#basicsearchdiv").hasClass("active"))
    {
        $(".searchboxlisting li").removeClass("active");
        $(".searchboxlisting li:first-child").addClass("active");
        $("#advancesearchdiv").removeClass("in");
        $("#basicsearchdiv").removeClass("in");
        $("#basicsearchdiv").addClass("in");
        $("#basicsearchdiv").addClass("active");
    }
}

let closeNav = () => {
    document.getElementById("mySidenav").style.width = "0";
}
