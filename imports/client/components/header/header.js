import {
    Template
} from 'meteor/templating';

import './header.html';
import '../common/drugPopupForValidation.js';

//details["PatientID"]='EMR100';
//Perform operation when template rendered
Template.Header.rendered = function() {

    $('.advancedSearchChange').html('Search');
    //$('.pharmaMedicationAdvanced').hide();
    //Set active class to Main Navigation according to page active
    $('.top-navigation > li > a').click(function() {
        // console.log("nav tab cicked");
        //   $('.top-navigation > li').removeClass('active');
        //   $(this).parent().addClass("active");
    });

    $('a.NavigateUrlByTabDesk').click(function() {
        // document.getElementById("anim_loading_theme").style.visibility = "hidden";
        // document.getElementById("overlay").style.display = "none";
    });

    //Commented By: Sukhdev
    // $('.NavigateUrlByTab').click(function () {
    //     var menuRight = document.getElementById('cbp-spmenu-s2');
    //     classie.toggle(this, 'active');
    //     classie.toggle(body, 'cbp-spmenu-push-toleft');
    //     classie.toggle(menuRight, 'cbp-spmenu-open');
    //     disableOther('showRightPush');
    // });

    //TODO: Commented by Sukhdev
    // var menuLeft = document.getElementById('cbp-spmenu-s1'),

    //     menuRight = document.getElementById('cbp-spmenu-s2'),
    //     showLeftPush = document.getElementById('showLeftPush'),
    //     showRightPush = document.getElementById('showRightPush'),
    //     body = document.body;

    // showLeftPush.onclick = function () {
    //     classie.toggle(this, 'active');
    //     classie.toggle(body, 'cbp-spmenu-push-toright');
    //     classie.toggle(menuLeft, 'cbp-spmenu-open');
    //     disableOther('showLeftPush');
    // };
    // showRightPush.onclick = function () {

    //     classie.toggle(this, 'active');
    //     classie.toggle(body, 'cbp-spmenu-push-toleft');
    //     classie.toggle(menuRight, 'cbp-spmenu-open');
    //     disableOther('showRightPush');
    // };

    // function disableOther(button) {
    //     if (button !== 'showLeftPush') {
    //         classie.toggle(showLeftPush, 'disabled');
    //     }
    //     if (button !== 'showRightPush') {
    //         classie.toggle(showRightPush, 'disabled');
    //     }
    // };
    //
    // $("#searchtoggle").click(function () {
    //     $("#searchform").slideToggle("slow");
    // });

    // $("#searchtoggle").click(function () {
    //     $(".container.headgradiant").toggleClass("nav-fix-bottom");
    // });
    //
    // $(".mb-userprofile").click(function () {
    //     if ($(".container.headgradiant").hasClass("nav-fix-bottom")) {
    //         $(".container.headgradiant").removeClass("nav-fix-bottom");
    //         $("#searchform").slideToggle("slow");
    //     }
    // });

    // show MyAccount popup

    // $('.user-control-div').click(function() {
    //     $('.user-control-div').show();
    // });

    // $('#js-show-myaccount,.hed-user-icon,.hed-user-name').click(function() {
    //     $('.user-control-div').show();
    // });
    //
    // // hide MyAccount popup
    // $('#js-close-myaccount').click(function() {
    //     $('.user-control-div').hide();
    // });
    //
    // // close "MyAccount" popup when clicked outside it
    // $(document).on('mouseup', function(e) {
    //     var container = $('.user-control-div');
    //     if (!container.is(e.target) // if the target of the click isn't the container...
    //         &&
    //         container.has(e.target).length === 0) // ... nor a descendant of the container
    //     {
    //         container.hide();
    //     }
    // });

    // Init DropDowns
    // $('.head-emr-details .pinDDL').selectize({
    //     create: true,
    //     sortField: {
    //         field: 'text',
    //         direction: 'asc'
    //     },
    //     dropdownParent: 'body'
    // });

    //Adjust Navigation based when PA Request tab is hidden by default

    // //TODO: resize tabs dynamically
    // $(window).resize(function() {
    //     var a = (($('#navbar-collapse').width()) / (($(".nav.navbar-nav").children().length - 1)));
    //     $('.nav.navbar-nav li').css('width', String(a));
    // });
    // AdjustNavigation();

};

//Create helper method for Header
Template.Header.helpers({

    // Calculate age based on date value
    'getAge': function(dateString) {

        /* Age calculation code reference from http://stackoverflow.com/
         * Reference from: http://stackoverflow.com/questions/4060004/calculate-age-in-javascript
         * @author: http://stackoverflow.com/users/17447/naveen
         */
        if (dateString != '' && dateString != null) {
            var today = new Date();
            var birthDate = new Date(dateString);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return dateString + "(" + age + " years)";
        } else {
            return '';
        }
    },

    'getBindStoreValue': function(dateString) {
        var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
        for (var i = 0; i < store.length; i++) {
            if (store[i].Abbreviation == dateString) {
                return store[i].State;
            }
        }
        return dateString;
    },
    'getBindStoreDisabled': function(dateString) {
        var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
        var flag = false;
        for (var i = 0; i < store.length; i++) {
            if (store[i].Abbreviation == dateString) {
                flag = true;
            }
        }
        if (flag) {
            return '';
        } else {
            return 'disabled';
        }
    },
    'getBindStoreOption': function(dateString) {
        var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
        var option = '';
        for (var i = 0; i < store.length; i++) {
            if (store[i].Abbreviation == dateString) {
                option = option + '<option value="' + store[i].Abbreviation + '" selected>' + store[i].State + '</option>'
            } else {
                option = option + '<option value="' + store[i].Abbreviation + '">' + store[i].State + '</option>'
            }
        }
        return dateString;
    },


    'isDisabledPatientRecord': function() {
        if (Router['PatientId'] != '') {
            return '';
        } else {
            return 'disabled';
        }
    },
    // Patient json collection  single
    'person': function() {

        var p = {
            "PatientID": "",
            "PatientName": "",
            "Address": "",
            "State": "",
            "Age": 0,
            "AdmissionDate": "",
            "DischargeDate": "",
            "ZipCode": "",
            "AreaCode": "",
            "Birthday": "",
            "Gender": "",
            "Languge": "",
            "Race": "",
            "Ethnicity": "",
            "Insurance": "",
            "Genotype": "",
            "Viral Load": 0,
            "ETOH": 0,
            "Treatment": " ",
            "Relapsed": "",
            "Partial Response": "",
            "Non Responsive": "",
            "HCC": 0,
            "Urine Screen": 0,
            "Cirrhosis": "",
            "Meld Score": 0,
            "Assessment Liver Disaese": "",
            "Fibrosur": "",
            "Liver Biopsy": "",
            "CMP": "",
            "CBC": "",
            "Pregnancy": "",
            "Renal Failure": "",
            "Mental Health": "",
            "Smoking": "",
            "Alcohol": "",
            "Body Weight": 0,
            "Drug": "",
            "Efficacy": "",
            "Adherance": "",
            "Utilization": "",
            "Cost": "",
            "Total Value": 0
        }
        return p;
    }

});



//Events for Header template
Template.Header.events({
    'change #Insurance': function(event, template) {
        var data = {
            "Insurance": event.currentTarget.value
        };
        if (event.currentTarget.value != '')
            saveheaderData(data, event.currentTarget.id);
        else
            emptyheaderData("Insurance", event.currentTarget.id);
    },
    'change #rfAdmissionDate': function(event, template) {
        var data = {
            "AdmissionDate": event.currentTarget.value
        };
        saveheaderData(data, event.currentTarget.id);
    },
    'change #State': function(event, template) {
        var data = {
            "State": event.currentTarget.value
        };
        if (event.currentTarget.value != 'default')
            saveheaderData(data, event.currentTarget.id);
        else
            emptyheaderData("State", event.currentTarget.id);
    },
    'change #ZipCode': function(event, template) {
        var data = {
            "ZipCode": event.currentTarget.value
        };
        if (event.currentTarget.value != '')
            saveheaderData(data, event.currentTarget.id);
        else
            emptyheaderData("ZipCode", event.currentTarget.id);
    },
    'change #rfAreaCode': function(event, template) {
        var data = {
            "AreaCode": event.currentTarget.value
        };
        saveheaderData(data, event.currentTarget.id);
    },
    'change #Birthday': function(event, template) {
        var data = {
            "Birthday": event.currentTarget.value
        };
        if (event.currentTarget.value != '')
            saveheaderData(data, event.currentTarget.id);
        else
            emptyheaderData("DOB", event.currentTarget.id);
    },
    'change #Race': function(event, template) {
        var data = {
            "Race": event.currentTarget.value
        };
        if (event.currentTarget.value != 'default')
            saveheaderData(data, event.currentTarget.id);
        else
            emptyheaderData("Race", event.currentTarget.id);
    },
    'change #Gender': function(event, template) {
        var data = {
            "Gender": event.currentTarget.value
        };
        if (event.currentTarget.value != '')
            saveheaderData(data, event.currentTarget.id);
        else
            emptyheaderData("Gender", event.currentTarget.id);
    }
});
