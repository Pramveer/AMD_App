import { Template } from 'meteor/templating';
import './pinscriptiveApp.html';

//created a global variable
Pinscriptive = {};
Pinscriptive['payer'] = {};
Pinscriptive['payer']['safetyTabInfo'] = null;
Pinscriptive['payer']['treated'] = null;
Pinscriptive['payer']['treating'] = null;
Pinscriptive['payer']['untreated'] = null;
Pinscriptive['dashboard'] = {};
Pinscriptive['dashboard']['treatedPatients'] = null;
Pinscriptive['pharma'] = {};
Pinscriptive['pharma']['druglist']=null;
Pinscriptive['pharma']['drugfulldata'] = null;
Pinscriptive['pharma']['drugviralscoreanalysisdata'] = null;
Pinscriptive['pharma']['pharmaCompetitorAnalysisData'] = null;
Pinscriptive['pharma']['pharmaComorbidity'] = null;
Pinscriptive['pharma']['pharmaCompetitorAnalysisYearlyData'] = null;
Pinscriptive['pharma']['PatientsJourney'] = null;
Pinscriptive['MedicationSVR'] = null;
//PatientDataList.change(['']);
//Implement global helper method which will be used anywhere in entire application

// Helper method to check user is logged in or not
Template.registerHelper('currentuser', function() {
    var user = Meteor.user() ? Meteor.user().profile.userDetail.username : null;
    //var user = localStorage.getItem('user');
    return user ? true : false;
});

Template.registerHelper('logout', function() {
    var user = Meteor.user().profile.userDetail.username = '';
    return user ? true : false;
});

//Display or render header based on condition
Template.registerHelper('isWelcome', function(pValue) {
    var isVisible = true;
    if (location.pathname.toLowerCase() === '/welcome' || location.pathname.toLowerCase() === '/login' || location.pathname.toLowerCase() === '/admindashboard') {
        isVisible = false;
    }
    if (location.pathname.toLowerCase() === '/login') {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'scroll';
    }
    return isVisible;
});

//Check weather user is in Specific role or not and then display tabs on header navigation
Template.registerHelper('isPayerOrAdmin', function() {
    var userInfo = Meteor.user();
    var user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
        "UserCount": 1,
        "username": "",
        "email": "",
        "organization": "",
        "org_id": 1,
        "role": 0,
        "tabs_name": ""
    };
    return user.role === 1 || user.role === 2 ? true : false;
});

// Checck weather is from custom role and if yes then check user have access to specific tab or page
Template.registerHelper('isCustomRole', function(tab) {
    var userInfo = Meteor.user();
    var user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
        "UserCount": 1,
        "username": "",
        "email": "",
        "organization": "",
        "org_id": 1,
        "role": 0,
        "tabs_name": ""
    };

    var AccessibleTab = user.role === 4 && user.tabs_name && user.tabs_name.length > 0 ? user.tabs_name.split(',') : [];
    var isCustom = user.role === 4 && _.indexOf(AccessibleTab, tab) > -1 ? true : false;

    return isCustom || user.role === 1 || user.role === 2 || user.role === 3 ? true : false;
});

//General JSON Parser
Pinscriptive.parseJSON = function(data, defaultValue) {
    var result = defaultValue ? defaultValue : [];
    try {
        result = JSON.parse(data);
    } catch (e) {
        console.log("***ERROR WHILE PARSING JSON DATA");
    }

    return result;
}

//remove the credits from Highcharts Globally
if(Highcharts)
    Highcharts.defaultOptions.credits.enabled = false;

