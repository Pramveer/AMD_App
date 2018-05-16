import { Template } from 'meteor/templating';

import './drugSelectionOption.html';

Template.DrugSelectionOption.rendered = function() {
    var DRUG_LIMIT = 10;

    //var selectedDrugs = localStorage.selectedDrugs && JSON.parse(localStorage.selectedDrugs) ? JSON.parse(localStorage.selectedDrugs) : [];
    //  var selDrugs = localStorage.AllDrugsName && JSON.parse(localStorage.AllDrugsName) ? JSON.parse(localStorage.AllDrugsName) : [];
    // var selDrugsWithData = localStorage.AllDrugsData && JSON.parse(localStorage.AllDrugsData) ? JSON.parse(localStorage.AllDrugsData) : [];

    //Auto checked selected drugs in efficacy page
    // remove extra parsing process for faster performance
    var selectedDrugs = localStorage.selectedDrugs ? JSON.parse(localStorage.selectedDrugs) : [];
    var selDrugs = localStorage.AllDrugsName ? JSON.parse(localStorage.AllDrugsName) : [];
    var selDrugsWithData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];

    //Add selected checkbox in efficacy page
    var filterData = [];
    if (selectedDrugs.length === 0) {
        //If drugs are available but not selected from drug page then display first four drug
        for (var k = 0; k <= selDrugsWithData.length - 1; k++) {
            if (k < DRUG_LIMIT) {
                //Set filtered or order drug name
                selectedDrugs.push(selDrugsWithData[k].DrugName);
            }
        }

    }

    //Auto checked selected drugs in drug toggle option
    for (var l = 0; l < selectedDrugs.length; l++) {
        //Need to improve logic for auto checked checkbox from last selected drugs
        $(".eff-sidebox input:checkbox[value='" + selectedDrugs[l] + "']").attr("checked", true);
    }

    if (selDrugs.length > 0) {
        //Visited Drugs page and also have drug data for selected patient

        if (selectedDrugs.length > 0) {
            //Visited Drugs page and also selected drugs
            if (selectedDrugs.length > 0 && selectedDrugs.length <= DRUG_LIMIT) {
                for (var k = 0; k <= selectedDrugs.length - 1; k++) {
                    filterData.push(selectedDrugs[k]);
                }

            } else {
                //Restriction or limit # drugs on Efficacy page
                for (var k = 0; k < DRUG_LIMIT; k++) {
                    filterData.push(selectedDrugs[k]);
                }

                $('.drug-selection-warning').slideDown();
                setTimeout(function() {
                    $('.drug-selection-warning').slideUp()
                }, 3000);

            }
            //GenerateEfficacyDetail(filterData);

        } else {


            // console.log('No Selected records');
            $('.data-conatainer').hide();
            $('.efficacy-warning').slideDown();
            setTimeout(function() {
                $('.efficacy-warning').slideUp();
            }, 3000);
        }
    } else {
        //Never visit on drugs page or Patient is not selected
        $('.data-conatainer').hide();
        $('.efficacy-warning').slideDown();
        setTimeout(function() {
            $('.efficacy-warning').slideUp();
        }, 3000);
    }
    //Store Filtered drugs for Graph 
    localStorage.filteredDrugsForGraph = JSON.stringify(filterData);


};

Template.DrugSelectionOption.helpers({
    //Bing drug selection checkbox slider from drugs page with all drugs data
    'DrugsData': function() {
        //var selDrugsWithData = localStorage.AllDrugsData && JSON.parse(localStorage.AllDrugsData) ? JSON.parse(localStorage.AllDrugsData) : [];
        // remove extra parsing process for faster performance
        var selDrugsWithData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];

        return selDrugsWithData;
    },
    // method to display color for drugs accordingly
    'isDrugInsured': function(pValue) {

        if (pValue && pValue.toLowerCase() === 'yes')
            return 'eff-orng';
        else
            return 'uninsured-drugs';
    },
    //render score value based on active page e.g. For Efficacy -Efficacy score are displayed and for Safety -Safety Score are displayed
    'bifurcateScoreValue': function(currentItem) {
        var activeTemplate = $('.NavigateUrlByTabDesk').closest('.active').text();
        activeTemplate = activeTemplate && activeTemplate.trim() ? activeTemplate.trim() : '';
        var dynamicScore = '';
        switch (activeTemplate) {
            case 'Adherence':
                dynamicScore = activeTemplate + ' ' + this.Adherence.Adherence;
                break;
            case 'Efficacy':
                dynamicScore = activeTemplate + ' ' + this.Efficacy.Efficacy;

                break;
            case 'Cost':
                dynamicScore = activeTemplate + ' ' + this.Cost.Cost;
                break;
            case 'Safety':
                dynamicScore = activeTemplate + ' ' + this.Safety;
                break;
            case 'Utilization':
                dynamicScore = activeTemplate + ' ' + this.Utilization.Utilization;
                break;
            default:
                dynamicScore = '';
                break;

        }
        return dynamicScore + (dynamicScore.length > 0 ? '%' : '');
    }

});