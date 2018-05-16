import {
    Template
} from 'meteor/templating';

import './searchpatient.html';
Template.SearchPatient.onCreated(function() {
    var self = this;
    this.loading = new ReactiveVar(true);
    var limit = Session.get('limit');
    this.autorun(function() {
        PatientDataList.reactive();
        self.loading.set(false);
    });
});


Template.SearchPatient.rendered = function() {

    //console.log("Result rendered");
    //$('.head-emr-details').hide();

    //$('.js-nav-item').removeClass('active');
    $('#js-nav-patient').addClass('active');

    // // Generate responsive design for mobile 480px
    // var maxwidth = $('html').css('width');
    // var isMoobile = (maxwidth && maxwidth.split('px')[0] <= 480) ? true : false;
    //
    // if (isMoobile) {
    //     //$('.container.headgradiant').addClass("nav-fix-bottom");
    // } else {
    //     $('.container.headgradiant').removeClass("nav-fix-bottom");
    // }
};

//Remove fixed navigation when navigate from searchpage to different page
Template.SearchPatient.destroyed = function() {
    //$('.container.headgradiant').removeClass("nav-fix-bottom");
};

//Handle events for Search Patient
Template.SearchPatient.events({
    //Handle click event for patient selection
    "click .search_result": function(e) {

        if (document.getElementById('patientID')) {
            document.getElementById('patientID').innerHTML = '';
        }
        Router['PatientId'] = this.PATIENT_ID_SYNTH;
        // Set Selected PatientID for drug inspection functionality
        localStorage.PatientID = this.PATIENT_ID_SYNTH;
        //Clear old drugs data
        $('.searchinput').val('');
        ClearDrugsData();
        //  $('#navbar-search-input').val('');
        Router.go('/Patient/' + this.PATIENT_ID_SYNTH);

    },
    //Handle click event for patient selection
    "click .search_result1": function(e) {

        if (document.getElementById('patientID')) {
            document.getElementById('patientID').innerHTML = '';
        }
        Router['PatientId'] = this.PATIENT_ID_SYNTH;
        // Set Selected PatientID for drug inspection functionality
        localStorage.PatientID = this.PATIENT_ID_SYNTH;
        localStorage.isSearched = true;
        //Clear old drugs data
        $('.searchinput').val('');
        ClearDrugsData();
        //$('#navbar-search-input').val('');
        Router.go('/Patient/' + this.PATIENT_ID_SYNTH);

    },
    'click .sed-loadmore-btn': function() {
        //       console.log("LoadMore Clicked..");
        //       console.log($(".searchinput").val());
        // console.log(Session.get('limit'));
        var patientLimit = (Session.get('limit') ? Session.get('limit') : 10) + 10;
        var totalPatientCount = PatientDataListCount.length > 0 ? PatientDataListCount[0].PatientCount : PatientDataList.length;
        if (totalPatientCount > patientLimit) {
            //console.log(patientLimit);
            Session.set("limit", patientLimit);
            PatientDataList.change([$(".searchinput").val(), patientLimit]);
        } else {
            //console.log(patientLimit);
            //console.log(totalPatientCount);

            $('.sed-loadmore-btn').hide();
        }
    }

    //Commented By: Sukhdev
    //Handle click event for patient selection in mobile
    // "click .res_searchdiv": function (e) {
    //     document.getElementById('patientID').innerHTML = '';
    //     Router['PatientId'] = this.PATIENT_ID_SYNTH;
    //     // Set Selected PatientID for drug inspection functionality
    //     $("#searchform").slideToggle("slow");
    //     localStorage.PatientID = this.PATIENT_ID_SYNTH; //Clear old drugs data
    //     ClearDrugsData();
    //     $('#navbar-search-input').val('');
    //     Router.go('/Patient/' + this.PATIENT_ID_SYNTH);
    // }

});
//Create helper method for SearchPatiet page

Template.SearchPatient.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'getCirrhosis': function(selectedval) {
        var returnval = '';
        if (selectedval == '1') {
            returnval = 'Yes';
        } else {
            returnval = 'No';
        }
        return returnval;
    },
    'SearchPatientDataList': function() {

        PatientDataList.reactive();
       //  console.log(PatientDataList);
        return PatientDataList;

    },
    'Condition_Row': function() {
        Search_Row_Num = Search_Row_Num + 1;
        return Search_Row_Num % 2 != 0;
    },
    'PatientCount': () => {
       // return PatientDataListCount.length > 0 ? PatientDataListCount[0].PatientCount : PatientDataList.length;
        PatientDataListCount.reactive();
        return PatientDataListCount[0].PatientCount;
    },
    // Calculate age based on date value
    'getAge': function(dateString) {
        /* Age calculation code reference from http://stackoverflow.com/
         * Reference from: http://stackoverflowpatientID.com/questions/4060004/calculate-age-in-javascript
         * @author: http://stackoverflow.com/users/17447/naveen
         */
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return dateString + "(" + age + " years)";
    },

    'HighlightSearchedText': function(PatientName) {

        var text = Session.get("searchValue");
        var query = new RegExp("(\\b" + text + "\\b)", "gim");
        var e = PatientName;
        var enew = e.replace(/(<i>|<\/i>)/igm, "");
        var newe = enew.replace(query, "<i>$1</i>");
        // alert(text + " | " + query + " | " + enew + " | " + newe);
        return newe;
    }
});


/**
 *  Clear Patient's specific drugs data when user select new patient
 */
function ClearDrugsData() {
    localStorage.removeItem("selectedDrugs");
    localStorage.removeItem("lastSelectedDrug");
    localStorage.removeItem("AllDrugsName");
    localStorage.removeItem("AllDrugsData");
}