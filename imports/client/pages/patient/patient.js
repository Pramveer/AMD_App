import {
    Template
} from 'meteor/templating';

import './patient.html';
// import '../clinicalCalculators/clinicalCals.js';
// import '../footer/footer.js';
// import '../../lib/icheck.js';
// import '../../lib/jquery.placeholder.min.js';
patientCount = new ReactiveVar(0);
patientRowNo = 1;
let health_details = {};
let mePatient;

Template.Patient.onCreated = function() {
    $('.pharmasubmenu_Btn').hide();
    $('.analyticssubmenu_Btn').hide();
}
Template.Patient.rendered = function() {
    // console.log("PAtient Rendered");
    highLightTab('Patient');
    $('.pharmasubmenu_Btn').hide();
    $('.analyticssubmenu_Btn').hide();
    console.log('this');
    mePatient = this.data.Patientdata;
    //console.log(mePatient);
    // var acc = document.getElementsByClassName("accordionlist");
    // var i;

    // for (i = 0; i < acc.length; i++) {
    //     acc[i].onclick = function() {
    //         this.classList.toggle("active");
    //         this.nextElementSibling.classList.toggle("show");
    //     }
    // }
    // //events for multiselect combo
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

    // $('.mutliSelect input[type="checkbox"]').on('click', function(e) {
    //     handleMultiGenoCombo(e.target);
    // });
    let patientcount = patientCount == void 0 ? (AmdApp['Filters'] != undefined ? AmdApp['Filters']['patientCountTab'] : 0) : patientCount.get();
    if (patientcount > 0) {
        $('.advanceSearchClickable').css({ 'opacity': '1', 'pointer-events': 'all' });
    } else {
        $('.advanceSearchClickable').css({ 'opacity': '0.6', 'pointer-events': 'none' });
    }
    // $('.left-side-menu li').click(function() {
    //     $('.left-side-menu li a').removeClass('active');
    //     $(this).children('a').addClass('active');
    // });
    $('.left-side-menu li').click(function() {
        $('.left-side-menu li a').removeClass('active');
        $(this).children('a').addClass('active');
        $('.left-side-menu li').children('ul').hide();
        $(this).children('ul').show();
    });

    patientRendered(mePatient);
    //$('.ApplyFilterbtn').trigger('click','update');

};

Template.Patient.events({
    'click .pager-button': function(e) {
        if (e.target.id != null) {
            switch (e.target.id) {
                case 'filter-patient-previous':
                    if (patientRowNo != 1)
                        patientRowNo--;
                    break;
                case 'filter-patient-next':
                    let patientcount = patientCount == void 0 ? (AmdApp['Filters'] != undefined ? AmdApp['Filters']['patientCountTab'] : 0) : patientCount.get();
                    if (patientRowNo <= parseInt(patientcount))
                        patientRowNo++;
                    break;
            }
            //let params = AmdApp['Filters'];
            let params = getCurrentPopulationFilters();
            params.patientCount = true;

            if (params != null) {
                console.log('********************* RowNo' + patientRowNo);
                params['patientCount'] = false;
                params['rowNo'] = patientRowNo;
                Meteor.call('searchPatients', params, (error, results) => {
                    if (error || (results.length < 0)) {
                        console.log('No data fetched');
                        window.clearTimeout(notificationPopupDelay);
                        $('.fltlft').hide();
                        $('.advanceSearchClickable').css({ 'opacity': '0.6', 'pointer-events': 'none' });
                        $('.validation-inspection').show();
                        $('#inspected-validation').text('No Record Found..');
                        notificationPopupDelay = setTimeout(function() {
                            $('.validation-inspection').hide();
                        }, 8000);
                        return;
                    } else {
                        //console.log(results);
                        $('.advanceSearchClickable').css({ 'opacity': '1', 'pointer-events': 'all' });
                        let patientID = results[0].PATIENT_ID_SYNTH;
                        if (document.getElementById('patientID')) {
                            document.getElementById('patientID').innerHTML = '';
                        }
                        Router['PatientId'] = patientID;
                        localStorage.PatientID = patientID;
                        params['patientId'] = patientID;
                        localStorage.isSearched = true;
                        localStorage.removeItem("selectedDrugs");
                        localStorage.removeItem("lastSelectedDrug");
                        localStorage.removeItem("AllDrugsName");
                        localStorage.removeItem("AllDrugsData");
                        //Added by Arvind 0n 10th March 2017
                        //Clear last selection for Prioritze Decision Parameters
                        localStorage.removeItem("isProviderWeightSliderChanges");
                        localStorage.removeItem("provider_relative_weights");
                        
                        //console.log(results);
                        AmdApp['SelectedPatient'] = results;
                        Router.go('/Patient/' + patientID);
                    }
                });

            }
        }
    },
    'click .searchtoggle': function() {
        //increment the counter when button is clicked
        $("#searchform").slideToggle("slow");
    },
    'click .btnLab': function() {
        Router.go('/Labs');
    },
    'click .patient-decision-making': function(){
        Router.go('/AssessmentTool');
    },
    'click .calc-link': function(e) {

        //  console.log('inside');
        e.preventDefault();
        var url = $(this).data("calc-url");

        loadIframe(url);

        $('#tooltip-box-clinical-calculator').modal({
            closeClass: 'modal-close',
            escClose: true
        });
    }


});

Template.Patient.destroyed = function() {

    //Hide Clinical calculator modal when health record page destoryed
    $(".modal-box, .modal-overlay").fadeOut(5, function() {
        $(".modal-overlay").remove();
    });
    //This is important to display all records in other tabs even if user didn't go to drugs
    //Template.Drugs.__helpers.get('DrugInfoUpdated').call();

    // set the patient data in the Session variable
    Session.set("selectedPatientData", this.data.Patientdata);

};

//Helper method for HealthRecord Template to dispay record based on value from json object
Template.Patient.helpers({
    'PatientCount': function() {
        return patientCount == void 0 ? (AmdApp['Filters'] != undefined ? AmdApp['Filters']['patientCountTab'] : 0) : patientCount.get();
    },
    'genotypeNullTooltip': function() {
        patientCount.get();
        return AmdApp.Filters ? AmdApp.Filters.genotypes ? "Patients with missing genotype are excluded." : "" : "";
    },
    'PatientRowNumber': function() {
        return patientRowNo;
    },
    'maskedDate': (date) => {
        return new Date(date).getFullYear();
    },
    'PatientId': () => {
        return Math.abs(Router['PatientId']);
    },
    'rerenderPatient': function() {
        // console.log(this);
        var self = this;
        Meteor.setTimeout(function() {
            if (self) {
                if (self.TREATMENT) {
                    console.log(self.TREATMENT);
                    $("input[name=rdTreatmentExperienced][value=" + self.TREATMENT + "]").prop('checked', true);
                }
                //// No need to select or checked Experinced treatment type for now we have only one type
                if (self.TREATMENT_CONDITION) {
                    $("input[name=rdTreatmentCondition][value=" + mapTreatmentCondition(self.TREATMENT_CONDITION) + "]").prop('checked', true);
                }
                if (self.TREATMENT === 'Experienced')
                    $(".dvToggleTreatment").show();
                else
                    $(".dvToggleTreatment").hide();
            }
        }, 300);
    },
    //calculating APRI
    'APRIValue': function() {
        try {
            var me = this.Patientdata;
            //if (me === undefined) {
            //Change condition for non empty using falsy/truthy check
            if (!me) {
                var PatientID = Router['PatientId'];
                me = PatientDataList.filter(function(Patient) {
                    return Patient.PATIENT_ID_SYNTH == PatientID;
                });
            }
            var dbApri = me[0].APRI;
            if (dbApri != null && dbApri != '') {
                //Change condition for non empty using falsy/truthy check
                //   if (dpApri) {
                return parseFloat(dbApri);
            } else {
                var calculatedApri = ((parseInt(me[0].labs_ast) / 40) / parseInt(me[0].labs_platelets)) * 100;
                calculatedApri = parseFloat(calculatedApri).toFixed(2);
                return calculatedApri;
            }
        } catch (e) {

        }
    },

    //Method converts Date value to age using moment js
    'isDisabledPatientRecord': function() {
        /* if (Router['PatientId'] != '') {
             return '';
         } else {
             return 'disabled';
         }*/
        return 'disabled';
    },
    'isDisabledChecked': function(value) {
        if (value === 'Yes') {
            return "";
        } else {
            return "clsDesableOpacity";
        }
    },
    'isDisabledCheckedProp': function(value) {
        if (value === 'Yes') {
            return "";
        } else {
            return "disabled";
        }
    },
    'isDisabledCheckedTreatment': function(value) {
        if (value === 'No') {
            return "";
        } else {
            return "clsDesableOpacity";
        }
    },
    'isDisabledCheckedCirrhosis': function(value) {
        if (value === 'No') {
            return "";
        } else {
            return "clsDesableOpacity";
        }
    },
    isFemale: function(value) {
        let gender = $('#Gender').val();
        if ((value && value.toLowerCase() !== 'male') || (gender && gender.toLowerCase() !== 'male'))
            return 'block';
        else return 'none';
    },
    'isDisabledCheckedPropTreatment': function(value) {
        if (value === 'No') {
            return "";
        } else {
            return "disabled";
        }
    },
    'isDisabledCheckedPropCirrhosis': function(value) {
        if (value === 'No') {
            return "";
        } else {
            return "disabled";
        }
    },
    'selectedCombo': function(gender) {
        var selectBox;
        if (gender === "Female") {
            selectBox = "<option value=\"\">Select Gender</option><option value=\"Male\">Male</option><option value=\"Female\" selected>Female</option>";
        } else if (gender === "Male") {
            selectBox = "<option value=\"\">Select Gender</option><option value=\"Male\" selected>Male</option><option value=\"Female\">Female</option>";
        } else {
            selectBox = "<option value=\"\" selected >Select Gender</option><option value=\"Male\">Male</option><option value=\"Female\">Female</option>";
        }
        return selectBox;

    },

    'selectedEthnicityCombo': function(Ethnicity) {
        var selectBox;
        if (Ethnicity === "Hispanic or Latino") {
            selectBox = "<option value=\"\">Select Ethnicity</option><option value=\"Not Hispanic or Latino\">Not Hispanic or Latino</option><option value=\"Hispanic or Latino\" selected >Hispanic or Latino</option>";
        } else if (Ethnicity === "Not Hispanic or Latino") {
            selectBox = "<option value=\"\">Select Ethnicity</option><option value=\"Not Hispanic or Latino\" selected >Not Hispanic or Latino</option><option value=\"Hispanic or Latino\">Hispanic or Latino</option>";
        } else {
            selectBox = "<option value=\"\" selected >Select Ethnicity</option><option value=\"Not Hispanic or Latino\">Not Hispanic or Latino</option><option value=\"Hispanic or Latino\">Hispanic or Latino</option>";
        }
        return selectBox;

    },
    'selectedGenotypeCombo': function(Genotype) {
        var selectBox;
        if (Genotype != null) {
            switch (Genotype.trim()) {
                // case '1':
                //     {
                //         selectBox = "<option value=\"default\" >Select Genotype</option><option value=\"1\" selected>1</option><option value=\"1a\">1a</option><option value=\"1b\">1b</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option><option value=\"6\">6</option>";
                //         break;
                //     }
                case '1a':
                    {
                        selectBox = "<option value=\"default\" >Select Genotype</option><option value=\"1a\" selected>1a</option><option value=\"1b\">1b</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option><option value=\"6\">6</option>";
                        break;
                    }
                case '1b':
                    {
                        selectBox = "<option value=\"default\" > Select Genotype</option><option value=\"1b\" selected>1b</option><option value=\"1a\">1a</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option><option value=\"6\">6</option>";
                        break;
                    }
                case '2':
                    {
                        selectBox = "<option value=\"default\" >Select Genotype</option><option value=\"2\" selected>2</option><option value=\"1a\">1a</option><option value=\"1b\">1b</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option><option value=\"6\">6</option>";
                        break;
                    }
                case '3':
                    {
                        selectBox = "<option value=\"default\" >Select Genotype</option><option value=\"3\" selected>3</option><option value=\"1a\">1a</option><option value=\"1b\">1b</option><option value=\"2\">2</option><option value=\"4\">4</option><option value=\"5\">5</option><option value=\"6\">6</option>";
                        break;
                    }
                case '4':
                    {
                        selectBox = "<option value=\"default\" >Select Genotype</option><option value=\"4\" selected>4</option><option value=\"1a\">1a</option><option value=\"1b\">1b</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"5\">5</option><option value=\"6\">6</option>";
                        break;
                    }
                case '5':
                    {
                        selectBox = "<option value=\"default\" >Select Genotype</option><option value=\"5\" selected>5</option><option value=\"1a\">1a</option><option value=\"1b\">1b</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"6\">6</option>";
                        break;
                    }
                case '6':
                    {
                        selectBox = "<option value=\"default\" >Select Genotype</option><option value=\"6\" selected>6</option><option value=\"1a\">1a</option><option value=\"1b\">1b</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option>";
                        break;
                    }
                default:
                    {
                        selectBox = "<option value=\"default\" selected >Select Genotype</option><option value=\"1a\">1a</option><option value=\"1b\">1b</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option><option value=\"6\">6</option>";
                        break;
                    }
            }
        } else {
            selectBox = "<option value=\"default\" selected >Select Genotype</option><option value=\"1a\">1a</option><option value=\"1b\">1b</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option><option value=\"5\">5</option><option value=\"6\">6</option>";
        }
        return selectBox;

    },
    'DateToAge': function(pDate) {
        if (pDate != '') {
            return moment().diff(pDate, 'years');
        } else {
            return '';
        }
    },
    //Method Set highlight class if formdata is invalid
    'isFormValid': function(pData) {

        if (pData) {
            return " ";
        } else {
            return "highlight";
        }
    },
    'isFormValidInt': function(pData) {

        if (pData != null && pData != '' && pData != 0) {
            return " ";
        } else {
            return "highlight";
        }
    },
    'isChecked': function(value) {

        if (value && value != '') {
            return " ";
        } else {
            return "highlight";
        }
    },


    'riskbox': function(pValue) {
        if (pValue && pValue.toLowerCase() === "yes")
            return "riskbox";
        else
            return " ";
    },

    'exclamation': function(pValue) {
        if (pValue && pValue.toLowerCase() === "yes")
            return '<i class="fa fa-exclamation-circle risk-icon"></i>';
        else
            return " ";
    },
    'clsDesableOpacity': function(pValue) {
        if (pValue && pValue === 'Experinced')
            return " ";
        else
            return 'clsDesableOpacity';
    },
    'treatmentTypeNaive': function(pValue) {
        if (pValue && pValue === "Naive")
            return "checked";
        else
            return " ";
    },
    'treatmentTypeExperinced': function(pValue) {
        if (pValue && pValue === "Experinced")
            return "checked";
        else
            return " ";
    },

    'actualFibrosure': function(pValue) {
        if (pValue) {
            var value = pValue.substring(1, pValue.length);
            return value;
        }
    },
    'isDisable': function(pFlag) {

        if (pFlag && pFlag.toLowerCase() === 'yes')
            return ' ';
        else
            return 'disabled';
    },
    //Method set radio button to checked if value is yes
    'isYesChecked': function(pValue) {
        if (pValue && pValue.toLowerCase() === 'yes')
            return 'checked';
        else
            return '';
    },

    isCheckedCirrhosis: function(value) {
        if (value === 'Yes') {
            $(".dvToggleCirrhosis").removeClass("clsDesableOpacity");
            return '<input type="radio" class="hltrec_radio" name="rdCirrhosis" value="Yes" checked />Yes<input type="radio" class="hltrec_radio" name="rdCirrhosis" value="No"/>No';
        } else if (value === 'No') {
            $(".dvToggleCirrhosis").addClass("clsDesableOpacity");
            return '<input type="radio" class="hltrec_radio" name="rdCirrhosis" value="Yes" />Yes<input type="radio" class="hltrec_radio" name="rdCirrhosis" value="No" checked />No';
        } else {
            $(".dvToggleCirrhosis").removeClass("clsDesableOpacity");
            return '<input type="radio" class="hltrec_radio" name="rdCirrhosis" value="Yes" />Yes<input type="radio" class="hltrec_radio" name="rdCirrhosis" value="No" />No';
        }
    },
    isCheckedTreatment: function(value) {
        if (value === 'Yes') {
            $(".dvToggleTreatment").addClass("clsDesableOpacity");
            return '<input type="radio" name="rdTreatmentExperienced" class="hltrec_radio" value="Yes" checked />Naive<input type="radio" name="rdTreatmentExperienced" class="hltrec_radio" value="No" />Experienced';
        } else if (value === 'No') {
            $(".dvToggleTreatment").removeClass('clsDesableOpacity');
            return '<input type="radio" name="rdTreatmentExperienced" class="hltrec_radio" value="Yes" />Naive<input type="radio" name="rdTreatmentExperienced" class="hltrec_radio" value="No" checked />Experienced';
        } else {
            $(".dvToggleTreatment").removeClass('clsDesableOpacity');
            return '<input type="radio" name="rdTreatmentExperienced" class="hltrec_radio" value="Yes" />Naive<input type="radio" name="rdTreatmentExperienced" class="hltrec_radio" value="No" />Experienced';
        }
    },
    //Method set radio button to checked if value is no
    'isNoChecked': function(pValue) {
        if (pValue && pValue.toLowerCase() === 'no')
            return 'checked';
        else
            return '';
    },
    'isFibroscanChecked': function(pValue) {
        if (pValue && pValue.toLowerCase() === 'fibroscan')
            return 'checked';
        else
            return '';
    },
    'isNaiveChecked': function(pValue) {
        if (pValue && pValue.toLowerCase() === 'naive')
            return 'checked';
        else
            return '';
    },
    'isExperiencedChecked': function(pValue) {
        if (pValue && pValue.toLowerCase() === 'experienced')
            return 'checked';
        else
            return '';
    },


    //Method converts Date value to age using calculation
    'getAge': function(dateString) {
        if (dateString && dateString != null && dateString != '') {
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
    //Method return class name basen on template value e.g. CBC anc CMC value
    'setLabClass': function(pValue) {

        if (pValue && String(pValue).length > 0)
            return 'btnLab';
        else
            return 'disableLabBtn';
    },
    'SinglePatient': function() {

        Meteor.subscribe("Patientdata", Session.get("PatientId"));
        return Pages.find({});
    },

    //Method set patient data as json and bind to front end
    'person': function() {
        var p = {

            "PatientID": "EMR8768",
            "PatientName": "John Smith",
            "Address": "7678 Somewhere St, Los Angeles CA 90092",
            "Birthday": "9/12/1976",
            "Age": 0,
            "Gender": "Male",
            "Languge": "English",
            "Race": "White",
            "Ethnicity": "Non-Hispanic",
            "Insurance": "Aetna",
            "Genotype": "1",
            "ViralLoad": 6.041,
            "ETOH": 0.03,
            "Treatment": "Experinced",
            "Relapsed": "",
            "PartialResponse": "",
            "NonResponsive": "",
            "Tolerant": "",
            "PartialTolerant": "",
            "HCC": 20,
            "UrineScreen": 0.2,
            "Cirrhosis": "Yes",
            "MeldScore": 30,
            "AssessmentLiverDisaese": "Yes",
            "Fibrosur": "F1",
            "Fibroscan": 0,
            "LiverBiopsy": "Noramal",
            "CMP": "Link to a popup window",
            "CBC": "Link to a popup window",
            "Pregnancy": "No",
            "RenalFailure": "Yes",
            "MentalHealth": "No",
            "HIV": "No",
            "Alcohol": "No",
            "BodyWeight": 215,
            "Drug": "Harvoni",
            "Efficacy": "Clinical Guidelines - 98% VS. Real World Evidence (n=2909) - 97% ",
            "Adherance": "Adherence Rate : 67%\nTime to Discontinued of meds: 5Wk\nMPR: 89%",
            "Utilization": "Prescription Rate: 349 VS. Real World Evidence (n=2909) - 500 ",
            "Cost": "To Patient: 12K \nTo Payer: 85K",
            "Total Value": 97

        };
        return p;
    }
});

var notificationPopupDelay;

function saveNotificationForHealthRecordPage(fieldName, notificationId) {
    //    console.log(fieldName);
    //    console.log(notificationId);
    //  console.log("Record saved");
    //window.clearTimeout(notificationPopupDelay);
    // document.getElementById(notificationId + 'Notification').style.display = 'block';
    // $('#' + notificationId + 'Notification').fadeIn('slow').delay(2500).fadeOut('slow');
    // // notificationPopupDelay = setTimeout(function(){
    // //  document.getElementById(notificationId+'Notification').style.display = 'none';
    // // },2500);
    showToastMessage();
}

function patientRendered(patientData) {
    //console.log("** Adjust Navigation Called in health record***");
    //Adjust Navigation based when PA Request tab is hidden by default

    //$('.head-emr-details').show();
    //  if(!localStorage.getItem('SortDrugsBy')){
    // yuvraj 8th March :  Default Sorting should be by Drug Score.
    //localStorage.setItem('SortDrugsBy', 'drugScore');
    
    // Arvind 10th May,2017 :  Default Sorting should be by utilization.
    localStorage.setItem('SortDrugsBy', 'utilization');
    localStorage.setItem('SortingType', 'desc');
    //Added by Arvind 0n 10th March 2017
    //Clear last selection for Prioritze Decision Parameters
    localStorage.removeItem("isProviderWeightSliderChanges");
    localStorage.removeItem("provider_relative_weights");
    
    //Selected Experinced condition in Treatment by
    // If TREATMENT_CONDITION is not empty then checked sub value
    //console.log(patientData);
    if (patientData && patientData.length > 0) {
        if (patientData[0].TREATMENT) {
            //console.log(patientData[0].TREATMENT);
            $("input[name=rdTreatmentExperienced][value=" + patientData[0].TREATMENT + "]").prop('checked', true);
        }
        //// No need to select or checked Experinced treatment type for now we have only one type
        if (patientData[0].TREATMENT_CONDITION) {
            $("input[name=rdTreatmentCondition][value=" + mapTreatmentCondition(patientData[0].TREATMENT_CONDITION) + "]").prop('checked', true);
        }
    }
    //}
    //console.log('Patient Tab rendered');
    //console.log(this.data.Patientdata);

    // $('.js-nav-item').removeClass('active');
    //  $('#js-nav-patient').addClass('active');
    // $('#js-nav-patient a').addClass('active');
    // $('#js-nav-provider a').removeClass('active');
    // $('#js-nav-payer a').removeClass('active');
    // $('#js-nav-analytics a').removeClass('active');



    // $(window).resize(function () {
    //     var a = (($('#navbar-collapse').width()) / (($(".nav.navbar-nav").children().length - 1)));
    //     $('.nav.navbar-nav li').css('width', String(a));
    // });


    function loadIframe(url) {
        var $iframe = $('#forPostyouradd');
        if ($iframe.length) {
            $iframe.attr('src', url);
            return false;
        }
        return true;
    }

    // Init DropDowns
    $('#frmPatien .pinDDL').selectize({
        create: true,
        sortField: {
            field: 'text',
            direction: 'asc'
        },
        dropdownParent: 'body'
    });
    initializeHeaderDDL();

    // $('.fa-chevron-down').click(function(e) {
    //     if ($(e.target).parents('li').hasClass("hasSubMenu")) {
    //         e.preventDefault();
    //         var elem = this;
    //         $(elem).parents('li').find('.sub-sidemenu').slideToggle("slow");

    //         if ($(elem).parents('li').attr("data-rotate") == "close") {
    //             $(elem).parents('li').find('.submenu-arrow i').rotate(180);
    //             $(elem).parents('li').attr("data-rotate", "open");
    //         } else if ($(elem).parents('li').attr("data-rotate") == "open") {
    //             $(elem).parents('li').find('.submenu-arrow i').rotate(0);
    //             $(elem).parents('li').attr("data-rotate", "close");
    //         }
    //         //return false;
    //     } else {
    //         //    return false;
    //     }
    // });

    // $('li.hasSubMenu').click(function(e) {
    //     // if ($(e.target).hasClass("hasSubMenu")) {
    //     e.preventDefault();
    //     var elem = this;
    //     $(elem).find('.sub-sidemenu').slideToggle("slow");

    //     if ($(elem).attr("data-rotate") == "close") {
    //         $(elem).find('.submenu-arrow i').rotate(180);
    //         $(elem).attr("data-rotate", "open");
    //     } else if ($(elem).attr("data-rotate") == "open") {
    //         $(elem).find('.submenu-arrow i').rotate(0);
    //         $(elem).attr("data-rotate", "close");
    //     }
    //     // }
    // });
    // $('.psAccordion .hasSubMenu').click(function(e) {

    //     if ($(e.target).parent().hasClass("hasSubMenu")) {
    //         e.preventDefault();
    //         let elem = this;
    //         //$(elem).find('.sub-sidemenu').slideToggle("slow");

    //         if ($(elem).attr('data-rotate') == "close") {
    //             $(elem).find('.submenu-arrow i').rotate(180);
    //             $(elem).attr('data-rotate','open');
    //             $(elem).find('.sub-sidemenu').show();
    //         } else if ($(elem).attr('data-rotate') == "open") {
    //             $(elem).find('.submenu-arrow i').rotate(0);
    //             $(elem).find('.sub-sidemenu').hide();
    //             $(elem).attr('data-rotate','close');
    //         }
    //         //return false;
    //     } else {
    //         //    return false;
    //     }
    // });




    // $('.submenu-arrow').hover(function() {
    //     $(this).prev().css('background', '#ef4823').css('color', '#fff');
    // }, function() {
    //     $(this).prev().css('background', '#fff').css('color', '#231f20');
    // });

    // $('.left-side-menu>li>a').hover(function() {
    //     $(this).css('background', '#ef4823').css('color', '#fff');
    // }, function() {
    //     $(this).css('background', '#fff').css('color', '#231f20');
    // });

    $('#js-new-patient').click(function() {
        Meteor.call('generatePatientIDForNewRecord', function(error, result) {
            if (error) {
                alert("error");
            } else {
                //once patient are inserted successfully need to set patientID
                localStorage.setItem('PatientID', result);
                //Router['PatientId'] = '';
                Router['PatientId'] = result;
                PatientDataList.change([result]);
                //$('.saveButton').css('display', 'none');
                Router.go('newPatient');
                setTimeout(function() {
                    if (document.getElementById('patientID') !== null) {
                        document.getElementById('patientID').innerHTML = '';
                        document.getElementById('patientID').innerHTML = result;
                        $("#rfAdmissionDate").focus();
                    }
                    Router['PatientId'] = result;
                    //    PatientDataList.change([result]);
                }, 500);

                setTimeout(function() {
                    // Init DropDowns
                    // $('.pinDDL').selectize({
                    //     create: true,
                    //     sortField: {
                    //         field: 'text',
                    //         direction: 'asc'
                    //     },
                    //     dropdownParent: 'body'
                    // });
                    //
                    // $("#volume").slider({
                    //     min: 0,
                    //     max: 4,
                    //     value: $("#txtFibroscan").val(),
                    //     range: "min",
                    //     animate: true,
                    //     slide: function(event, ui) {
                    //         setVolume((ui.value) / 100);
                    //     },
                    //     change: function() {
                    //         let fiboScan = $("#volume").slider('value');
                    //         $("#txtFibroscan").val(fiboScan);
                    //         Meteor.call('update_data', {
                    //             "Fibroscan": fiboScan
                    //         }, "sample_patients", Router['PatientId'], function(error, result) {
                    //             if (error) {
                    //
                    //             } else {
                    //                 saveNotificationForHealthRecordPage('Fibroscan', 'txtFibroscan');
                    //             }
                    //         });
                    //     }
                    // });
                    //
                    // var myMedia = document.createElement('audio');
                    //
                    //
                    // function setVolume(myVolume) {
                    //     var myMedia = document.getElementById('myMedia');
                    // }

                    patientRendered();
                    $("#volume").slider("option", "disabled", false);
                }, 1000);
            }
        });
    });

    $('input[type=range]').rangeslider({
        polyfill: false
    });

    $(document).on('input', 'input[type="range"]', function(e) {
        var output = $(e.currentTarget).next().next();
        output.html(e.currentTarget.value);
    });

    $("#volume").slider({
        min: 0,
        max: 4,
        value: $("#txtFibroscan").val(),
        range: "min",
        animate: true,
        disabled: true,
        slide: function(event, ui) {
                setVolume((ui.value) / 100);
            }
            /*,
                    change: function() {
                        let fiboScan = $("#volume").slider('value');
                        $("#txtFibroscan").val(fiboScan);
                        Meteor.call('update_data', {
                            "Fibroscan": fiboScan
                        }, "sample_patients", Router['PatientId'], function(error, result) {
                            if (error) {

                            } else {
                                saveNotificationForHealthRecordPage('Fibroscan', 'txtFibroscan');
                            }
                        });
                    }*/
    });
    var myMedia = document.createElement('audio');


    function setVolume(myVolume) {
        var myMedia = document.getElementById('myMedia');
    }





    // var a = (($('#navbar-collapse').width()) / (($(".nav.navbar-nav").children().length - 1)));
    // $('.nav.navbar-nav li').css('width', String(a));
    //
    // // for mobile version navigation
    // $('.NavigateUrlByTab').click(function () {
    //     var menuRight = document.getElementById('cbp-spmenu-s2');
    //     classie.toggle(this, 'active');
    //     classie.toggle(body, 'cbp-spmenu-push-toleft');
    //     classie.toggle(menuRight, 'cbp-spmenu-open');
    //     disableOther('showRightPush');
    // });
    // var menuLeft = document.getElementById('cbp-spmenu-s1'),
    //
    //     menuRight = document.getElementById('cbp-spmenu-s2'),
    //     showLeftPush = document.getElementById('showLeftPush'),
    //     showRightPush = document.getElementById('showRightPush'),
    //     body = document.body;
    // if (showLeftPush !== null) {
    //     showLeftPush.onclick = function () {
    //
    //         classie.toggle(this, 'active');
    //         classie.toggle(body, 'cbp-spmenu-push-toright');
    //         classie.toggle(menuLeft, 'cbp-spmenu-open');
    //         disableOther('showLeftPush');
    //     };
    // }
    // if (showRightPush !== null) {
    //     showRightPush.onclick = function () {
    //
    //         classie.toggle(this, 'active');
    //         classie.toggle(body, 'cbp-spmenu-push-toleft');
    //         classie.toggle(menuRight, 'cbp-spmenu-open');
    //         disableOther('showRightPush');
    //     };
    // }
    //
    // function disableOther(button) {
    //     if (button !== 'showLeftPush') {
    //         classie.toggle(showLeftPush, 'disabled');
    //     }
    //     if (button !== 'showRightPush') {
    //         classie.toggle(showRightPush, 'disabled');
    //     }
    // };

    //iCheck for checkbox and radio inputs
    // $('input[type="checkbox"].minimal, input[type="radio"].minimal').iCheck({
    //     checkboxClass: 'icheckbox_minimal-blue',
    //     radioClass: 'iradio_minimal-blue'
    // });
    // //Red color scheme for iCheck
    // $('input[type="checkbox"].minimal-red, input[type="radio"].minimal-red').iCheck({
    //     checkboxClass: 'icheckbox_minimal-red',
    //     radioClass: 'iradio_minimal-red'
    // });
    // //Flat red color scheme for iCheck
    // $('input[type="checkbox"].flat-red, input[type="radio"].flat-red').iCheck({
    //     checkboxClass: 'icheckbox_flat-green',
    //     radioClass: 'iradio_flat-green'
    // });

    $(document).ready(function() {
        $(window).scrollTop(0);
    });

    $('a[data-modal-id="popupForCalculator"]').click(function(e) {
        e.preventDefault();
        var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
        $("body").append(appendthis);
        $(".modal-overlay").fadeTo(500);

        //$(".js-modalbox").fadeIn(500);
        var modalBox = $(this).attr('data-modal-id');
        $('#' + modalBox).fadeIn($(this).data());
        $('#meldframe').css('height', '730px');
    });


    $('a[data-modal-id="popupForAPRICalculator"]').click(function(e) {
        e.preventDefault();
        var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
        $("body").append(appendthis);
        $(".modal-overlay").fadeTo(500);

        //$(".js-modalbox").fadeIn(500);
        var modalBox = $(this).attr('data-modal-id');
        $('#' + modalBox).fadeIn($(this).data());
        $('#meldframe').css('height', '730px');
        $('#meldframe').attr('src', '/ClinicalCalcs/APRICalculator/cal.html');
        var modalBox = $('#popupForCalculator');
        document.getElementById('clinicalCalcTitle').innerHTML = 'APRI Calculator';
        modalBox.show();
    });


    $(".js-modal-close, .modal-overlay").click(function() {
        $('#meldframe').attr('src', '/ClinicalCalcs/meldPopup/cal.html');
        $(".modal-box, .modal-overlay").fadeOut(500, function() {
            $(".modal-overlay").remove();
        });

    });
    //Radio change event , On load panel desable when no checkbox selected
    var txtInput = $('input[name=rdALD]:checked').val();
    if (txtInput === 'Yes') {
        $(".dvToggleTreatment").hide();
        // $(".dvAssessmentld :input").prop('disabled', false);
        // $(".dvAssessmentld").removeClass('clsDesableOpacity');
    } else {
        $(".dvToggleTreatment").show();
        // $(".dvAssessmentld  :input").prop("disabled", true);
        // $(".dvAssessmentld").addClass("clsDesableOpacity");
    }

    //Radio change event , On load panel desable when no checkbox selected
    var txtInput = $('input[name=rdCirrhosis]:checked').val();
    if (txtInput === 'Yes') {
        $(".dvToggleCirrhosis").show();
        // $(".dvAssessmentld :input").prop('disabled', false);
        // $(".dvAssessmentld").removeClass('clsDesableOpacity');
    } else {
        $(".dvToggleCirrhosis").hide();
        // $(".dvAssessmentld  :input").prop("disabled", true);
        // $(".dvAssessmentld").addClass("clsDesableOpacity");
    }

    // Treatment panel Unable/Desable
    $('input[type=radio][name=rdTreatmentExperienced]').change(function() {
        Meteor.call('update_data', {
            "Treatment": this.value
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('Treatment', 'rdTreatmentExperienced');
            }
        });
        if (this.value === 'No') {
            $(".dvToggleTreatment").show();
            // $(".dvToggleTreatment :input").prop('disabled', false);
            // $(".dvToggleTreatment").removeClass('clsDesableOpacity');

        } else if (this.value === 'Yes') {
            $(".dvToggleTreatment").hide();
            // $(".dvToggleTreatment  :input").prop("disabled", true);
            // $(".dvToggleTreatment").addClass("clsDesableOpacity");
            Meteor.call('update_data', {
                "Relapsed": "No",
                "PartialResponse": "No",
                "NonResponsive": "No",
                "Tolerant": "No",
                "PartialTolerant": "No"
            }, "sample_patients", Router['PatientId']);
        }
    });

    // Cirrhosis  panel Unable/Desable
    $('input[type=radio][name=rdCirrhosis]').change(function() {

        Meteor.call('update_data', {
            "Cirrhosis": this.value
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('Cirrhosis', 'rdCirrhosis');
            }
        });
        if (this.value === 'No') {
            // $(".dvCirrhosis  :input").prop("disabled", true);
            // $(".dvCirrhosis").addClass("clsDesableOpacity");
            $(".dvToggleCirrhosis").hide();
            Meteor.call('update_data', {
                "Compensated": "No",
                "Decompensated": "No"
            }, "sample_patients", Router['PatientId']);

        } else if (this.value === 'Yes') {
            // $(".dvCirrhosis :input").prop('disabled', false);
            // $(".dvCirrhosis").removeClass('clsDesableOpacity');
            $(".dvToggleCirrhosis").show();

        }
    });
    $('.dvToggleCirrhosis').change(function() {
        var txtInput = $('input[name=rdCirrhosisCondition]:checked').val();
        if (txtInput === "Compensated") {
            Meteor.call('update_data', {
                "Compensated": "Yes",
                "Decompensated": "No"
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('Compensated', 'rdCompensated');
                }
            });
        } else if (txtInput === "Decompensated") {
            Meteor.call('update_data', {
                "Compensated": "No",
                "Decompensated": "Yes"
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('Decompensated', 'rdDecompensated');
                }
            });
        }

    });

    $('.dvToggleTreatment').change(function() {
        var txtInput = $('input[name=rdTreatmentCondition]:checked').val();
        if (txtInput === "Relapsed") {
            Meteor.call('update_data', {
                "Relapsed": "Yes",
                "PartialResponse": "No",
                "NonResponsive": "No",
                "Tolerant": "No",
                "PartialTolerant": "No"
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('Relapsed', 'rdTreatmentConditionRel');
                }
            });
        } else if (txtInput === "PartialResponse") {
            Meteor.call('update_data', {
                "Relapsed": "No",
                "PartialResponse": "Yes",
                "NonResponsive": "No",
                "Tolerant": "No",
                "PartialTolerant": "No"
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('PartialResponse', 'rdTreatmentConditionParRes');
                }
            });
        } else if (txtInput === "NonResponsive") {
            Meteor.call('update_data', {
                "Relapsed": "No",
                "PartialResponse": "No",
                "NonResponsive": "Yes",
                "Tolerant": "No",
                "PartialTolerant": "No"
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('PartialResponse', 'rdTreatmentConditionNonRes');
                }
            });
        } else if (txtInput === "Tolerant") {
            Meteor.call('update_data', {
                "Relapsed": "No",
                "PartialResponse": "No",
                "NonResponsive": "No",
                "Tolerant": "Yes",
                "PartialTolerant": "No"
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('PartialResponse', 'rdTreatmentConditionTol');
                }
            });
        } else if (txtInput === "PartialTolerant") {
            Meteor.call('update_data', {
                "Relapsed": "No",
                "PartialResponse": "No",
                "NonResponsive": "No",
                "Tolerant": "No",
                "PartialTolerant": "Yes"
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('PartialResponse', 'rdTreatmentConditionParTol');
                }
            });
        }

    });
    //Assessment of liver desease panel unable/desable
    $('input[type=radio][name=rdALD]').change(function() {
        Meteor.call('update_data', {
            "AssessmentLiverDisaese": this.value
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('Assessment Liver Disaese', 'rdALD');
            }
        });
        if (this.value === 'No') {

            $(".dvAssessmentld  :input").prop("disabled", true);
            $(".dvAssessmentld").addClass("clsDesableOpacity", 'rdCirrhosis');

        } else if (this.value === 'Yes') {

            $(".dvAssessmentld :input").prop('disabled', false);
            $(".dvAssessmentld").removeClass('clsDesableOpacity');
        }
    });

    // check input validation , check text length
    $("#txtFibroscan").change("input", function(e) {
        var txtFibroscan = $('#txtFibroscan').val();

        if (txtFibroscan.length > 0) {
            Meteor.call('update_data', {
                "Fibroscan": txtFibroscan
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('Fibroscan', 'txtFibroscan');
                }
            });
            $(".dvAssessmentld").removeClass('highlight');
        } else {
            $(".dvAssessmentld").addClass('highlight');
        }
    });


    $("#Gender1").change(function(e) {
        //console.log("Gender1");
        var selectBox = this.value;
        Meteor.call('update_data', {
            "Gender": this.value
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('Gender', 'Gender1');
            }
        });
        if (selectBox) {
            $('.rfGender').removeClass('highlight');
            //  console.log(this.value);
        } else {
            $('.rfGender').addClass('highlight');
        }
        if (selectBox.toLowerCase() !== 'male') {
            $('.dvPregnancy').show();
        } else {
            $('.dvPregnancy').hide()
        }
    });
    $("#rfage").on("input", function(e) {
        var input = this.value;
        if (input == '') {
            input = 0;
        }
        Meteor.call('update_data', {
            "Age": input
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {
                console.log('saving age' + error);
            } else {
                saveNotificationForHealthRecordPage('Gender', 'rfage');
            }
        });
        if (input) {
            $('.rfAge').removeClass('highlight');
            console.log(this.value);
        } else {
            $('.rfAge').addClass('highlight');
        }
    });
    $("#Gender1").on("change", function(e) {
        console.log(e);
        $("#Gender").val(e.currentTarget.value);
    });
    // check input validation , check text length
    $(".dvCMPCBC").on("input", function(e) {
        var txtCMP = $('#txtCMP').val();
        var txtCBC = $('#txtCBC').val();

        if (txtCMP.length > 0) {
            $(".dvCMP").removeClass('highlight');
            Meteor.call('update_data', {
                "CMP": txtCMP
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('CMP', 'dvCMP');
                }
            });
        } else {
            $(".dvCMP").addClass('highlight');
        }

        if (txtCBC.length > 0) {
            $(".dvCBC").removeClass('highlight');
            Meteor.call('update_data', {
                "CBC": txtCBC
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('CBC', 'dvCBC');
                }
            });
        } else {
            $(".dvCBC").addClass('highlight');
        }
    });

    // check input validation , check text length
    $("#ETOH").on("input", function(e) {
        var txtInput = this.value;
        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvETOHLevel').removeClass('highlight');
                Meteor.call('update_data', {
                    "ETOH": txtInput
                }, "sample_patients", Router['PatientId'], function(error, result) {
                    if (error) {

                    } else {
                        saveNotificationForHealthRecordPage('ETOH', 'ETOH');
                    }
                });
            } else {
                this.value = '';
            }
        } else {
            $('.dvETOHLevel').addClass('highlight');
        }
    });

    // check input validation , check text length
    //  var me = this.data.Patientdata;
    var me = patientData ? patientData : mePatient;
    //console.log(me);
    if (me && me.length > 0) {
        //console.log(me[0].TREATMENT);
        if (me[0].TREATMENT === 'Experienced')
            $(".dvToggleTreatment").show();
        else
            $(".dvToggleTreatment").hide();
        if (me[0].PatientID == "" || me[0].PatientID == null)
            $("#volume").slider("option", "disabled", true);
        else
            $("#volume").slider("option", "disabled", false);
    }
    $("#Genotype").change(function(e) {
        //    console.log("Genotype");
        //    console.log(e);
        var txtInput = this.value;
        if (txtInput.length > 0 || txtInput != 'default') {
            $('.dvGenotype').removeClass('highlight');
            health_details["Genotype"] = txtInput;
            PatientDataList.filter(function(data) {
                if (data.PatientID == me[0].PatientID) {
                    data["Genotype"] = txtInput;
                }
            });
            Meteor.call('update_data', {
                "Genotype": txtInput
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('Genotype', 'Genotype');
                }
            });
        } else {
            $('.dvGenotype').addClass('highlight');
        }
    });



    // check input validation , check text length
    $("#txtViralLoad").on("input", function(e) {
        var txtInput = this.value;
        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvViralLoad').removeClass('highlight');
                Meteor.call('update_data', {
                    "ViralLoad": txtInput
                }, "sample_patients", Router['PatientId'], function(error, result) {
                    if (error) {

                    } else {
                        saveNotificationForHealthRecordPage('ViralLoad', 'txtViralLoad');
                    }
                });
            } else {
                this.value = '';
            }
        } else {
            $('.dvViralLoad').addClass('highlight');
        }
    });



    // check input validation , check text length
    $(".dvUrineScreen").on("input", function(e) {
        var txtInput = this.value;
        if (txtInput.length > 0) {
            $('.dvUrineScreen').removeClass('highlight');
            Meteor.call('update_data', {
                "UrineScreen": this.value
            }, "sample_patients", Router['PatientId'], function(error, result) {
                if (error) {

                } else {
                    saveNotificationForHealthRecordPage('UrineScreen', 'dvUrineScreen');
                }
            });
        } else {
            $('.dvUrineScreen').addClass('highlight');
        }
    });
    // check input validation , check text length
    $("#txtbodyweight").on("input", function(e) {
        var txtInput = this.value;
        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvbodyweight').removeClass('highlight');
                Meteor.call('update_data', {
                    "BodyWeight": this.value
                }, "sample_patients", Router['PatientId'], function(error, result) {
                    if (error) {

                    } else {
                        saveNotificationForHealthRecordPage('BodyWeight', 'txtbodyweight');
                    }
                });
            } else {
                this.value = '';
            }
        } else {
            $('.dvbodyweight').addClass('highlight');
        }
    });
    //meld score insertion
    $("#txtmeldscore").on("input", function(e) {
        var txtInput = this.value;
        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvMeld').removeClass('highlight');
                Meteor.call('update_data', {
                    "MeldScore": this.value
                }, "sample_patients", Router['PatientId'], function(error, result) {
                    if (error) {

                    } else {
                        saveNotificationForHealthRecordPage('MeldScore', 'txtmeldscore');
                    }
                });
            } else {
                this.value = '';
            }
        } else {
            $('.dvMeld').addClass('highlight');
        }
    });
    //APRI insertion
    $("#txtapri").on("input", function(e) {
        var txtInput = this.value;
        //console.log(txtInput);
        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvApri').removeClass('highlight');
                Meteor.call('update_data', {
                    "APRI": this.value ? this.value : 0
                }, "sample_patients", Router['PatientId'], function(error, result) {
                    if (error) {

                    } else {
                        saveNotificationForHealthRecordPage('APRI', 'apri');
                    }
                });
            } else {
                this.value = '';
            }
        } else {
            $('.dvApri').addClass('highlight');
        }
    });
    //Ethnicity
    $("#rfEthnicity").change(function(e) {
        //    console.log("rfEthnicity");
        var selectBox = this.value;
        Meteor.call('update_data', {
            "Ethnicity": this.value
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('Ethnicity', 'rfEthnicity');
            }
        });

    });
    // check input validation , check text length
    $(".dvTreatment").on("change", function(e) {
        //   var txtInput = $('.dvTreatment input').val();
        var txtInput = $('input[name=rdTreatmentExperienced]:checked').val();
        // console.log(txtInput);
        if (txtInput.length > 0) {
            $('.dvTreatment').removeClass('highlight');
        } else {
            $('.dvTreatment').addClass('highlight');
        }
    });
    $(".dvCirrh").on("change", function(e) {
        //   var txtInput = $('.dvTreatment input').val();
        var txtInput = $('input[name=rdCirrhosis]:checked').val();

        if (txtInput.length > 0) {
            $('.dvCirrh').removeClass('highlight');
        } else {
            $('.dvCirrh').addClass('highlight');
        }
    });
    $(".dvAssessment").on("change", function(e) {

        var txtInput = $('input[name=rdALD]:checked').val();
        console.log(txtInput);
        if (txtInput.length > 0) {
            $('.dvAssessment').removeClass('highlight');

            if (txtInput === 'Yes') {
                $(".dvAssessmentld :input").prop('disabled', false);
                $(".dvAssessmentld").removeClass('clsDesableOpacity');
            }

        } else {
            $('.dvAssessment').addClass('highlight');
        }
    });
    //pregnancy value
    $(".dvPregnancy").on("change", function(e) {
        var txtInput = $('input[name=rdPregnancy]:checked').val();
        Meteor.call('update_data', {
            "Pregnancy": txtInput
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('Pregnancy', 'rdPregnancy');
            }
        });
    });
    //Renal Failure
    $(".dvRenelFailure").on("change", function(e) {

        var txtInput = $('input[name=rdRenal]:checked').val();
        Meteor.call('update_data', {
            "RenalFailure": txtInput
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('RenalFailure', 'rdRenal');
            }
        });
    });
    //HIV
    $(".dvHIV").on("change", function(e) {

        var txtInput = $('input[name=rdHIV]:checked').val();
        Meteor.call('update_data', {
            "HIV": txtInput
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('HIV', 'rdHIV');
            }
        });
    });
    //Mental health
    $(".dvMentalHealth").on("change", function(e) {

        var txtInput = $('input[name=rdMental]:checked').val();
        Meteor.call('update_data', {
            "MentalHealth": txtInput
        }, "sample_patients", Router['PatientId'], function(error, result) {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('MentalHealth', 'rdMental');
            }
        });
    });

    //Alcohol
    $(".dvAlcohol").on("change", function(e) {

        let txtInput = $('input[name=rdAlcohol]:checked').val();
        Meteor.call('update_data', {
            "Alcohol": txtInput
        }, "sample_patients", Router['PatientId'], (error, result) => {
            if (error) {

            } else {
                saveNotificationForHealthRecordPage('Alcohol', 'rdAlcohol');
            }
        });
    });
    // Append Riskbox to right radio column .
    $(".hltrecr_right input[type=radio]").change(function() {
        if (this.value === "Yes") {
            $(this).closest(".fulwidbox").addClass("riskbox");
            $(this).closest(".fulwidbox").append('<i class="fa fa-exclamation-circle risk-icon"></i>');
        } else {
            $(this).closest(".fulwidbox").removeClass("riskbox");
            $(this).closest(".fulwidbox").find("i").remove();
        }
    });
    //dvUrineScreen
    //Add placeholder for IE-9
    $('input, textarea').placeholder();

}

function mapTreatmentCondition(pCondition) {
    let result = '';

    pCondition = pCondition ? pCondition : '';
    switch (pCondition) {
        case 1:
            result = 'Relapsed';
            break;
        case 2:
            result = 'PartialResponse';
            break;
        case 3:
            result = 'NonResponsive';
            break;
        case 4:
            result = 'Tolerant';
            break;
        case 5:
            result = 'PartialTolerant';
            break;
        default:
            result = 'Relapsed'
            break;
    }
    return result
}