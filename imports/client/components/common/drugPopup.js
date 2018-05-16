import { Template } from 'meteor/templating';

import './drugPopup.html';

Template.DrugPopup.rendered = function() {

    //If Drug popup displayed once in current session then it will never show again but capture information
    if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
        $('.drug-inspection').slideUp();
    } else {

        //WrapDrugName(localStorage.lastSelectedDrug);
        //Display drug popup if last drug is selected in current session
        if (localStorage.lastSelectedDrug && localStorage.lastSelectedDrug.length > 0) {
            $('#inspected-drug').text(localStorage.lastSelectedDrug).attr('title', localStorage.lastSelectedDrug);

            $('.drug-inspection').slideDown();
        }
    }
};


Template.DrugPopup.events({
    //Captures Inspected drug response for future use
    'click #btnCaptureResponse': function() {

        //If Drug Inspection popup displayed once then it will never display popup again, but capture information
        localStorage.IsDrugCaptured = true;
        //To Do capture or save response with drugname for logged in user and hide the popup

        //no need to save record on yes button click
        //isDrugPrescribed();

        //hide poupup if yes clicked
        $('.drug-inspection').slideUp();

    }
});