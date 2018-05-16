import {
    Template
} from 'meteor/templating';
import './pharma.html';
import { Session } from 'meteor/session'
// import {
//     Meteor
// } from 'meteor/meteor';



//import * as pharmaLib from './pharmaLib.js';

let pharmaData = [];
let dummyMedication = [];
let pharmaDataTotalCount = [];

Template.Pharma.onCreated(function() {
    // if (!Pinscriptive.Filters) {
    //     Session.set('pharmaTreatment', 'all');
    //     Session.set('pharmaCirrhosis', 'all');
    //     Session.set('pharmaGenotype', '');
    // } else {
    //     Session.set('pharmaTreatment', '');
    //     Session.set('pharmaCirrhosis', '');
    //     Session.set('pharmaGenotype', '');
    // }
    // Session.set('pharmamedicine', 'all');
    var self = this;
    this.loading = new ReactiveVar(true);
    this.noData = new ReactiveVar(false);
    /*var category_id = Session.get('category_id');
    var currPatient = Session.get('selectedPatientData');*/
    this.autorun(function() {

        // Meteor.call('getPatientPharmaData', {}, function(error, result) {
        //     if (error) {
        //         self.loading.set(false);
        //         self.noData.set(true);
        //     } else {
        //         pharmaData = result.pharmaData;
        //         Pinscriptive['pharma']['drugfulldata'] = pharmaData;
        //         setTimeout(function() {
        //             self.loading.set(false);
        //             renderFirstTab();

        //         }, 500);
        //     }
        // });

        // Meteor.call('getPharmaViralScoreAnalysisData', {}, function(error, result) {
        //     if (error) {
        //         self.loading.set(false);
        //         self.noData.set(true);
        //     } else {
        //         // console.log(result);
        //         Pinscriptive['pharma']['drugviralscoreanalysisdata'] = result.pharmaAnalysisData;
        //         self.loading.set(false);
        //     }
        // });

        // Meteor.call('getPharmaCompetitorAnalysisData', {}, function(error, result) {
        //     if (error) {
        //         self.loading.set(false);
        //         self.noData.set(true);
        //     } else {
        //         // console.log(result);
        //         Pinscriptive['pharma']['pharmaCompetitorAnalysisData'] = result.pharmaCompetitorAnalysisData;
        //         self.loading.set(false);
        //     }
        // });

        // Meteor.call('getPharmaCompetitorAnalysisYearlyData', {}, function(error, result) {
        //     if (error) {
        //         self.loading.set(false);
        //         self.noData.set(true);
        //     } else {
        //         // console.log(result);
        //         Pinscriptive['pharma']['getPharmaCompetitorAnalysisYearlyData'] = result.pharmaCompetitorAnalysisYearlyData;
        //         self.loading.set(false);
        //     }
        // });

        // Meteor.call('getPharmaComorbidity', {}, function(error, result) {
        //     if (error) {
        //         self.loading.set(false);
        //         self.noData.set(true);
        //     } else {
        //         // console.log(result);
        //         Pinscriptive['pharma']['pharmaComorbidity'] = result.pharmaComorbidity;
        //         self.loading.set(false);
        //     }
        // });

        // Meteor.call('getPatientsJourney', {}, function (error, result) {
        //     if (error) {
        //         self.loading.set(false);
        //         self.noData.set(true);
        //     } else {
        //         // console.log(result);
        //         Pinscriptive['pharma']['PatientsJourney'] = result.PatientsJourney;
        //         self.loading.set(false);
        //     }
        // });
        //// Commented PatientCost method as we are calling in created template of medication cost
        // Meteor.call('getPatientsCost', null, (error, results) => {
        //     if (error || (results.length < 0)) {
        //         alert('No data fetched for the sub population');
        //         self.loading.set(false);
        //         self.noData.set(true);
        //     } else {
        //         Pinscriptive['pharma']['PatientsCost'] = results;
        //         self.loading.set(false);
        //     }
        // });

    });
});

Template.Pharma.rendered = function() {
    highLightTab('Pharma');
    //change number format for highcharts
}

function renderFirstTab() {
    setTimeout(function() {
        insertTemplate("marketoverview");
    }, 200)
}

Template.Pharma.events({
    'click .advancePharmaSubTabs .advancePharmaSubTabs-links li': function(e) {
        var tabName = $(e.currentTarget).find('.tabname').html().toLowerCase();
        $(e.currentTarget).addClass('active').siblings().removeClass('active');

        e.preventDefault();
        insertTemplate(tabName);

    }
});


Template.Pharma.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    }
});

function insertTemplate(tabName) {
    //Clear parent element before render dynamic template to it
    document.getElementById("anim_loading_theme").style.top = "90%";
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
    $('#templateRenderSection').empty();
    //  $('#GeneralTab').hide();
    if (tabName === "therapy co-occurance") {
        UI.render(Template.DrugOccurance, $('#templateRenderSection')[0])
    } else if (tabName === "other medicines count") {
        // $('#OtherMedicineCountSection').show();
        UI.render(Template.OtherMedicineCount, $('#templateRenderSection')[0])
    } else if (tabName === "advance analytics") {
        UI.render(Template.AdvanceAnalytics, $('#templateRenderSection')[0])

    } else if (tabName === "comorbidity analytics") {
        UI.render(Template.ComorbidityAnalytics, $('#templateRenderSection')[0])

    } else if (tabName === "competitor analysis") {
        UI.render(Template.CompetitorAnalysis, $('#templateRenderSection')[0])
    } else if (tabName === "cost") {
        UI.render(Template.MedicationCost, $('#templateRenderSection')[0])
    } else if (tabName === "patient journey") { // "treatment efficacy"
        UI.render(Template.PatientsJourney, $('#templateRenderSection')[0])
    } else if (tabName === "summary") {
        //  UI.render(Template.AdvanceAnalytics, $('#templateRenderSection')[0])
        //$('#GeneralTab').show();
        UI.render(Template.Summary, $('#templateRenderSection')[0])
    }
    document.getElementById("anim_loading_theme").style.visibility = "hidden";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("anim_loading_theme").style.top = "40%";
}