import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './treatmentEfficacyCompareEngine.html';
import * as pharmaLib from '../../../../pages/pharma/pharmaLib.js';



let pharmaPatientsJourney = [];

Template.TreatmentEfficacyCompareEngine.onCreated(function() {
    showChartLoading();
    executePatientsJourneyRender();
});

Template.TreatmentEfficacyCompareEngine.rendered = function() {
}

Template.TreatmentEfficacyCompareEngine.helpers({
    // 'isLoading': () => Template.instance().loading.get(),
});

Template.TreatmentEfficacyCompareEngine.events({

});


let executePatientsJourneyRender = () =>{

    params = {};
    if (AmdApp.Filters) {
        showChartLoading();
        params = pharmaLib.getCurrentPopulationFilters();
        // We dont want to be dependent on the selected medication.
        params.medication = '';
    }

    Meteor.call('getPatientsJourneyData', params, function(error1, results) {
        if (error1) {
            hideChartLoading();
        } else {
            // pharmaPatientsJourney = results.PatientsJourney;
            pharmaPatientsJourney = JSON.parse(results);
            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });

            setTimeout(function() {
               handleGoButton();
            },100);
        }
    });

}



// Tnis Function will handle what needs to be done when "GO" button is clicked.
let handleGoButton = () => {

    allMedicationData = DistinctMedicationCombinations.reactive();
    let medications = [];
    if (allMedicationData && allMedicationData.length >0) {
        
        for (let i = 0; i < allMedicationData.length; i++) {

            medications.push(allMedicationData[i].MEDICATION);
        }
    }

    if(!medications.length){
        $('#pharma_patientsjourney').html('<div class="providerNoDataFound">Please Select Medications</div>');
    }else{
        if(pharmaPatientsJourney.length){
            renderTreatmentEfficacyChart(medications, pharmaPatientsJourney, "pharma_patientsjourney");
            // renderTreatmentEfficacyChart(medications, pharmaPatientsJourney, "pharma_SvrPatientCount", true);
        }else{
            executePatientsJourneyRender();
        }

    }
    hideChartLoading();
}





// hide loading wheel
function hideChartLoading() {
    setTimeout(function() {
        $('.mlSubTabsChartSectionMask').hide();
        $('.mlSubTabsChartSectionWrap').show();
    }, 100);
}
// show loading wheel
function showChartLoading() {
    $('.mlSubTabsChartSectionMask').show();
    $('.mlSubTabsChartSectionWrap').hide();
}
