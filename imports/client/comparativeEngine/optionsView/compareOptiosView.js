import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './compareOptiosView.html';


Template.CompareOptionsView.onCreated(function() {

});

Template.CompareOptionsView.rendered = function() {
    initializeSelectBox();
    disableDorpdown("ce_compareAgainstOptions");
}

Template.CompareOptionsView.helpers({
    // 'isLoading': () => Template.instance().loading.get(),
    compareOptions() {
        // return this.compareOptions;
        return getCompareOptions();
    },
    compareBy() {
        // return this.conpareAgainst;
        // return getCompareByOptions(selectOption);
    }

});

Template.CompareOptionsView.events({
   'click .js-optionsViewApply': (event, template) => {
    //    console.log(" CE Apply Button is Clicked");

    // get configurations for compare engin view.  --Pending
    let compareOption = $('#ce_compareOptions').val();
    // get what needs to be compare against what.  --Pending
    let compareBy = $('#ce_compareAgainstOptions').val();

    // dummy object
    let configurations = {
        compareOptions : compareOption,
        compareBy : compareBy
    };
    
    // call function that open compare engine popup and renders the data. (pass the configurations)
    renderComapareView(configurations);

    },

    'change #ce_compareOptions': function(event) {
        // get selected option
        let selectedOption = event.currentTarget.value;

        if(selectedOption == "select"){
            disableDorpdown("ce_compareAgainstOptions");
            return false;
        }else{
            enableDorpdown("ce_compareAgainstOptions");
        }

        // get compare by options according to selected options.
        let compareByOptions = getCompareByOptions(selectedOption);
        // append the option menu for compare by dropdown.
        createCompareByOptionsMenu(compareByOptions);
        // enable the dropdown.
    },

});


let renderComapareView = (config) => {
    var comparativeEngine = new ComparativeEngine({
        compareConfigurations : {
            compareOptions :  config.compareOptions,
            compareBy : config.compareBy
        }
    });

    comparativeEngine.renderCompareEngineView();
}


let createCompareByOptionsMenu = (compareByOptions) => {
    let options = '<option value="select">Select...</option>';
    for(let i=0; i<compareByOptions.length; i++){
        options += `<option value="${compareByOptions[i]}">${compareByOptions[i]}</option>` 
    }

    $('#ce_compareAgainstOptions').selectize()[0].selectize.destroy();
    $('#ce_compareAgainstOptions').empty();
    $('#ce_compareAgainstOptions').html(options);
    $('#ce_compareAgainstOptions').selectize();
}

let enableDorpdown = (id) => {
    $('#'+id).removeAttr('disabled');
}

let disableDorpdown = (id) => {
    $('#'+id).attr('disabled', 'disabled');
}


let getCompareOptions = () => {
    return ["Race Distribution", "Age Distribution", "Medications", "Cure Rate", "SVR Trend"];
}


let getCompareByOptions = (selectedOption) => {
    return ["Genotype",  "Treatment", "Cirrhosis", "Year", "Apri"];
}

let initializeSelectBox = () => {
    $('#ce_compareOptions').selectize();
    $('#ce_compareAgainstOptions').selectize();
}
