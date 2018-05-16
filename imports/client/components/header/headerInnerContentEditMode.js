import {
    Template
} from 'meteor/templating';

import './headerInnerContentEditMode.html';

let details = {};
let insuranceDDL;
let raceDDL;
let genderDDL;
let stateDDL;
// Apply default configuration once header loaded for edit mode
Template.HeaderInnerContentEditMode.rendered = function() {
    //console.log("Header Data Rendered");
    //console.log(Pinscriptive['Filters']);
    let Stab = this.data || {};
    console.log("selectd tab = " + Stab);
    if (Pinscriptive['Filters'] != null) {
        // setFilterHeader(Pinscriptive['Filters']);
        // setMedicationInfoInCohort();
        //Arvind, 13-Feb-2017,single Cohort function for all tab
        //console.log("selectd tab = " + Stab);
        if (Stab == "pharma") {
            setCohortHeaderMenu({
                tabName: "pharma"
            });
            //Praveen 02/20/2017 changed text from search to cohort criteria
              $('.advancedSearchChange').html('Cohort Criteria');
        } else {
            setCohortHeaderMenu({
                tabName: "patient"
            });
            //Praveen 02/20/2017 changed name from cohort criteria to search
            $('.advancedSearchChange').html('Search');
        }
    }
    if(Stab == 'analytics'){
        $('.headerbuttonFilesection').show();
    }
    else{
        $('.headerbuttonFilesection').hide();
    }
    //$('.pharmaMedicationAdvanced').hide();
    //Masked input to restrict dirty data
    $("#ZipCode").mask("XX999");
    $("#Birthday").mask("9999");
    $("#rfAdmissionDate").mask("9999");
    $("#rfAreaCode").mask("999");
    $("#Gender").on("change", function(e) {
        $("#Gender1").val(e.currentTarget.value);
        if (e.currentTarget.value && e.currentTarget.value.toLowerCase() !== 'male') {
            $('.dvPregnancy').show();
            $('.flagPrenancy').show();

        } else {
            $('.dvPregnancy').hide();
            $('.flagPrenancy').hide();
        }
    });
    $("#Birthday").on("change", function(e) {
        var dateString = e.currentTarget.value;
        if (dateString != '' && dateString != null) {
            var today = new Date();
            var birthDate = new Date(`01/01/${dateString}`);
            var age = today.getFullYear() - birthDate.getFullYear();
            var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            $("#rfage").val(age);
            $(".rfAge").removeClass('highlight');
            Meteor.call('update_data', {
                "Age": age
            }, "sample_patients", Router['PatientId'], (error, result) => {
                if (error) {

                } else {
                    showToastMessage();
                    //document.getElementById('rfageNotification').style.display = 'block';
                    setTimeout(function() {
                        //  document.getElementById('rfageNotification').style.display = 'none';
                    }, 2500)
                }
            });
        } else {
            $("#rfage").val(0);
            $(".rfAge").addClass('highlight');
        }
    });
    $("input[data='header']").change(function() {
        $('.saveButton').css('display', 'block');
    });
    $("select[data='header']").change(function() {
        $('.saveButton').css('display', 'block');
    });

    initializeHeaderDDL();

    // $('.head-emr-details .pinDDL').selectize({
    //     create: true,
    //     sortField: {
    //         field: 'text',
    //         direction: 'asc'
    //     },
    //     dropdownParent: 'body'
    // });

    // if ($('.head-emr-details').find('.pinDDL.selectized').length <= 0) {
    //        $('.head-emr-details .pinDDL').selectize({
    //            create: true,
    //            sortField: {
    //                field: 'text',
    //                direction: 'asc'
    //            },
    //            dropdownParent: 'body'
    //        });
    //    }
    //    else {
    //        console.log('code works')
    //    }


};
//Praveen 02/20/2017 added events for template export and import
Template.HeaderInnerContentEditMode.events({

	'click .globalexportPatient1':(e)=>{
		let tabname = getactiveTab();
		$('.globalexportPatient'+tabname).trigger('click');
	}
	,
	'click .globalshowPatient1':(e)=>{
		let tabname = getactiveTab();
		$('.globalshowPatient'+tabname).trigger('click');
	},
    'change #showSelectedDatabase':()=>{
        let value =  $('#showSelectedDatabase').prop('checked');
        if(value){
            $("#showSelectedDatabase").attr('data',1);
            $(".showSelectedDatabase").attr('title','Client');
        }
        else{
            $("#showSelectedDatabase").attr('data',0);
            $(".showSelectedDatabase").attr('title','Benchmark');
        } 
        $('.ApplyFilterbtn').trigger('click');
    },
});

let getactiveTab = ()=>{
	let tabname = $('.Analytic_submenu_list li.active a').text().toLowerCase();
	if(tabname == 'machine learning'){
		tabname = $('.macLearningsubTabs-links li.active a').text().split(' ').join('').toLowerCase();
	}
	return tabname;
}

Template.HeaderInnerContentEditMode.helpers({
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
    'isDisabledPatientRecord': function() {
        /*  if (Router['PatientId'] != '') {
              return '';
          } else {
              return 'disabled';
          }*/
        return 'disabled';
    },
    'getBindStoreSelected': function(state_cd) {
        var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
        var flag = false;
        let state = '';
        console.log(state_cd);
        for (var i = 0; i < store.length; i++) {
            if (store[i]['Abbreviation'] == state_cd) {
                flag = true;
                state = store[i]['State'];
            }
        }
        console.log(state);
        if (flag) {
            return state;
        } else {
            return '';
        }
    },
    'getBindStoreOption': function(dateString) {
        var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
        var option = '';
        for (var i = 0; i < store.length; i++) {
            if (store[i]['Abbreviation'] == dateString) {
                option = option + '<option value="' + store[i]['Abbreviation'] + '" selected>' + store[i]['State'] + '</option>'
            } else {
                option = option + '<option value="' + store[i]['Abbreviation'] + '">' + store[i]['State'] + '</option>'
            }
        }
        return option;
    },
    /* 'getRaceSelected': function(dateString) {
         var store = [{
             value: 'American Indian',
             name: 'American Indian'
         }, {
             value: 'Alaskan Native',
             name: 'Alaskan Native'
         }, {
             value: 'Asian',
             name: 'Asian'
         }, {
             value: 'African American',
             name: 'African American'
         }, {
             value: 'Native Hawaiian or Other Pacific Island',
             name: 'Native Hawaiian or Other Pacific Island'
         }, {
             value: 'White',
             name: 'White'
         }];
         var flag = false;
         for (var i = 0; i < store.length; i++) {
             if (store[i]['value'] == dateString) {
                 flag = true;
             }
         }
         if (flag) {
             return '';
         } else {
             return 'selected';
         }
     },*/
    'getRaceOption': function(dateString) {
        var data = [{
            value: 'American Indian',
            name: 'American Indian'
        }, {
            value: 'Alaskan Native',
            name: 'Alaskan Native'
        }, {
            value: 'Asian',
            name: 'Asian'
        }, {
            value: 'African American',
            name: 'African American'
        }, {
            value: 'Native Hawaiian or Other Pacific Island',
            name: 'Native Hawaiian or Other Pacific Island'
        }, {
            value: 'White',
            name: 'White'
        }];
        var option = '';
        for (var i = 0; i < data.length; i++) {
            if (data[i]['value'] == dateString) {
                option = option + '<option value="' + data[i]['value'] + '" selected>' + data[i]['name'] + '</option>'
            } else {
                option = option + '<option value="' + data[i]['value'] + '">' + data[i]['name'] + '</option>'
            }
        }
        return option;
    },
    'getSelectedInsurance': function(data) {
        console.log(data);
        return data; //plan == patientPlan.Insurance ? "selected" : "";
    },
    'getGenderSelected': function(data) {
        var store = [{
            value: 'M',
            name: 'Male'
        }, {
            value: 'F',
            name: 'Female'
        }];
        let gender = '';
        var flag = false;
        for (var i = 0; i < store.length; i++) {
            if (store[i]['value'] == data) {
                flag = true;
                gender = store[i]['name'];
            }
        }
        if (flag) {
            return gender;
        } else {
            return '';
        }
        //return gender;
    },
    'getGenderOption': function(dateString) {
        var data = [{
            value: 'Male',
            name: 'Male'
        }, {
            value: 'Female',
            name: 'Female'
        }];
        var option = '';
        for (var i = 0; i < data.length; i++) {
            if (data[i]['value'] == dateString) {
                option = option + '<option value="' + data[i]['value'] + '" selected>' + data[i]['name'] + '</option>'
            } else {
                option = option + '<option value="' + data[i]['value'] + '">' + data[i]['name'] + '</option>'
            }
        }
        return option;
    },
    //Method Set highlight class if formdata is invalid
    'isFormValid': function(pData) {

        if (pData) {
            return " ";
        } else {
            return "highlight";
        }
    },

    'getPlanList': function() {
        //list of insurance plan
        return ClaimsInsurancePlan;
    },
    //Method store all state value and then return to PA Request Page
    'BindStates': function() {
        var states = [{
            State: "Alabama",
            Abbreviation: "AL"
        }, {
            State: "Alaska",
            Abbreviation: "AK"
        }, {
            State: "Arizona",
            Abbreviation: "AZ"
        }, {
            State: "Arkansas",
            Abbreviation: "AR"
        }, {
            State: "California",
            Abbreviation: "CA"
        }, {
            State: "Colorado",
            Abbreviation: "CO"
        }, {
            State: "Connecticut",
            Abbreviation: "CT"
        }, {
            State: "Delaware",
            Abbreviation: "DE"
        }, {
            State: "District of Columbia",
            Abbreviation: "DC"
        }, {
            State: "Florida",
            Abbreviation: "FL"
        }, {
            State: "Georgia",
            Abbreviation: "GA"
        }, {
            State: "Hawaii",
            Abbreviation: "HI"
        }, {
            State: "Idaho",
            Abbreviation: "ID"
        }, {
            State: "Illinois",
            Abbreviation: "IL"
        }, {
            State: "Indiana",
            Abbreviation: "IN"
        }, {
            State: "Iowa",
            Abbreviation: "IA"
        }, {
            State: "Kansas",
            Abbreviation: "KS"
        }, {
            State: "Kentucky",
            Abbreviation: "KY"
        }, {
            State: "Louisiana",
            Abbreviation: "LA"
        }, {
            State: "Maine",
            Abbreviation: "ME"
        }, {
            State: "Montana",
            Abbreviation: "MT"
        }, {
            State: "Nebraska",
            Abbreviation: "NE"
        }, {
            State: "Nevada",
            Abbreviation: "NV"
        }, {
            State: "New Hampshire",
            Abbreviation: "NH"
        }, {
            State: "New Jersey",
            Abbreviation: "NJ"
        }, {
            State: "New Mexico",
            Abbreviation: "NM"
        }, {
            State: "New York",
            Abbreviation: "NY"
        }, {
            State: "North Carolina",
            Abbreviation: "NC"
        }, {
            State: "North Dakota",
            Abbreviation: "ND"
        }, {
            State: "Ohio",
            Abbreviation: "OH"
        }, {
            State: "Oklahoma",
            Abbreviation: "OK"
        }, {
            State: "Oregon",
            Abbreviation: "OR"
        }, {
            State: "Maryland",
            Abbreviation: "MD"
        }, {
            State: "Massachusetts",
            Abbreviation: "MA"
        }, {
            State: "Michigan",
            Abbreviation: "MI"
        }, {
            State: "Minnesota",
            Abbreviation: "MN"
        }, {
            State: "Mississippi",
            Abbreviation: "MS"
        }, {
            State: "Missouri",
            Abbreviation: "MO"
        }, {
            State: "Pennsylvania",
            Abbreviation: "PA"
        }, {
            State: "Rhode Island",
            Abbreviation: "RI"
        }, {
            State: "South Carolina",
            Abbreviation: "SC"
        }, {
            State: "South Dakota",
            Abbreviation: "SD"
        }, {
            State: "Tennessee",
            Abbreviation: "TN"
        }, {
            State: "Texas",
            Abbreviation: "TX"
        }, {
            State: "Utah",
            Abbreviation: "UT"
        }, {
            State: "Vermont",
            Abbreviation: "VT"
        }, {
            State: "Virginia",
            Abbreviation: "VA"
        }, {
            State: "Washington",
            Abbreviation: "WA"
        }, {
            State: "West Virginia",
            Abbreviation: "WV"
        }, {
            State: "Wisconsin",
            Abbreviation: "WI"
        }, {
            State: "Wyoming",
            Abbreviation: "WY"
        }];
        return states;
    },

});

Template.HeaderInnerContentEditMode.events({
    'click .saveButton': function(e) {
        //  alert("Save Button Clicked");
        var validate = validateHeaderForm();
        if (validate) {
            getHeaderFieldValue();
            Meteor.call('update_data', details, 'sample_patients', Router["PatientId"], function(error, result) {
                if (error) {
                    document.getElementById('PopupBox').innerHTML = 'Form has been not saved';
                    document.getElementById('PopupBox').style.color = 'red';
                    document.getElementById('PopupBox').style.border = '2px solid red';
                    document.getElementById('PopupBox').style.display = 'block';
                    $('.saveButton').css('display', 'none');
                    $('#PopupBox').fadeIn('fast').delay(2500).fadeOut('fast');
                } else {
                    document.getElementById('PopupBox').innerHTML = 'Form has been saved';
                    document.getElementById('PopupBox').style.color = 'green';
                    document.getElementById('PopupBox').style.border = '2px solid green';
                    document.getElementById('PopupBox').style.display = 'block';
                    $('.saveButton').css('display', 'none');
                    $('#PopupBox').fadeIn('fast').delay(2500).fadeOut('fast');
                }
            });
            //Meteor.call('insert_data',Template.Header.__helpers[" person"]()); //pass json file of entered records from person function
        } else {
            document.getElementById('PopupBox').innerHTML = 'Form is incomplete. Please fill in required fields.';
            document.getElementById('PopupBox').style.color = 'red';
            document.getElementById('PopupBox').style.border = '2px solid red';
            document.getElementById('PopupBox').style.display = 'block';
            $('#PopupBox').fadeIn('fast').delay(2500).fadeOut('fast')
        }
    }
});

function getHeaderFieldValue() {
    details["ZipCode"] = $("#ZipCode").val();
    details["AreaCode"] = $("#rfAreaCode").val();
    details["AdmissionDate"] = $("#rfAdmissionDate").val();
    details["DischargeDate"] = $(".rfDischargeDate").val();
    details["State"] = $("#State").val();
    details["Birthday"] = $("#Birthday").val();
    details["Languge"] = $(".rfLanguage").val();
    details["Gender"] = $("#Gender").val();
    details["Race"] = $("#Race").val();
    details["Ethnicity"] = $(".rfEthnicity").val();
    details["Insurance"] = $("#Insurance").val();
}

// function initializeHeaderDDL() {
//     genderDDL = $('.head-emr-details #Gender').selectize({
//         create: true,
//         dropdownParent: 'body'
//     });//
//
//     stateDDL = $('.head-emr-details #State').selectize({
//         create: true,
//         dropdownParent: 'body'
//     });
//
//     insuranceDDL = $('.head-emr-details #Insurance').selectize({
//         create: true,
//         dropdownParent: 'body'
//     });
//     // console.log(genderDDL);
//     // console.log(raceDDL);
//     // console.log(insuranceDDL);
//     // console.log(stateDDL);
// }


let setFilterHeader = (params) => {
    if (params != null) {
        $('#patient-pager').show();
        $("#filter_desc").show();

        /**
         *  Modified: Arvind 10-Feb-2017
         *  Issue :Cohort menu not changes when we move from Pharma/Analytics/Payer tab
         *  Solution :Internal reference from provider.js file line no : 4219,
         *  Added below missing cohort element which need to set when patient and provider tab rendered
         *  headerInnerContentPharma.js file line no:33 for Capatalize first letter for Cirrhosis,Treatment
         *
         */
        let treatment = params['treatment'];
        if (treatment != null)
            treatment = treatment.split(',').length > 1 ? 'All' : convertFirstLetterCaps(treatment.replace(/'/g, '').toString());
        else
            treatment = 'All';

        let cirrhosis = params['cirrhosis'];
        if (cirrhosis != null)
            cirrhosis = cirrhosis.split(',').length > 1 ? 'All' : convertFirstLetterCaps(cirrhosis.replace(/'/g, '').toString());
        else
            cirrhosis = 'All';

        $('#desc_cirrhosis').show();
        $('#desc_cirrhosis').find('.efd-cell2_subpopulaiton').html(cirrhosis);
        $('#desc_treatment').show();
        $('#desc_treatment').find('.efd-cell2_subpopulaiton').html(treatment);
        $('#desc_genotype').show();
        $('#desc_genotype').find('.efd-cell2_subpopulaiton').html(params['genotypes'] != null ? params['genotypes'].replace(/'/g, '').toString() : 'All');
        $("#desc_patient_count").show();

        //// Modified End: Arvind 10-Feb-2017
        if (params['hiv'] != null) {
            $('#desc_hiv').show();
            $('#desc_hiv').find('.efd-cell2_subpopulaiton').html(params['hiv'].replace(/'/g, '').toString());
        } else {
            $('#desc_hiv').hide();
            $('#desc_hiv').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['mental_health'] != null) {
            $('#desc_mentalhealth').show();
            $('#desc_mentalhealth').find('.efd-cell2_subpopulaiton').html(params['mental_health'].replace(/'/g, '').toString());
        } else {
            $('#desc_mentalhealth').hide();
            $('#desc_mentalhealth').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['renal_failure'] != null) {
            $('#desc_renalfailure').show();
            $('#desc_renalfailure').find('.efd-cell2_subpopulaiton').html(params['renal_failure'].replace(/'/g, ''));
        } else {
            $('#desc_renalfailure').hide();
            $('#desc_renalfailure').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['liver_assesment'] != null) {
            $('#desc_liverassessment').show();
            $('#desc_liverassessment').find('.efd-cell2_subpopulaiton').html(params['liver_assesment'].replace(/'/g, '').toString());
        } else {
            $('#desc_liverassessment').hide();
            $('#desc_liverassessment').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['fibrosure'] != null) {
            $('#desc_fibrosure').show();
            $('#desc_fibrosure').find('.efd-cell2_subpopulaiton').html(params['fibrosure'].replace(/'/g, '').toString());
        } else {
            $('#desc_fibrosure').hide();
            $('#desc_fibrosure').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['liverBiopsy'] != null) {
            $('#desc_liverbiopsy').show();
            $('#desc_liverbiopsy').find('.efd-cell2_subpopulaiton').html(params['liverBiopsy'].replace(/'/g, '').toString());
        } else {
            $('#desc_liverbiopsy').hide();
            $('#desc_liverbiopsy').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['fibroscan'] != null) {
            $('#desc_fibroscan').show();
            $('#desc_fibroscan').find('.efd-cell2_subpopulaiton').html(params['fibroscan'].replace(/'/g, '').toString());
        } else {
            $('#desc_fibroscan').hide();
            $('#desc_fibroscan').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['hcc'] != null) {
            $('#desc_hcc').show();
            $('#desc_hcc').find('.efd-cell2_subpopulaiton').html(params['hcc'].replace(/'/g, '').toString());
        } else {
            $('#desc_hcc').hide();
            $('#desc_hcc').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['chemistry'] != null) {
            $('#desc_chemistry').show();
            $('#desc_chemistry').find('.efd-cell2_subpopulaiton').html(params['chemistry'].replace(/'/g, '').toString());
        } else {
            $('#desc_chemistry').hide();
            $('#desc_chemistry').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['alcohol'] != null) {
            $('#desc_alcohol').show();
            $('#desc_alcohol').find('.efd-cell2_subpopulaiton').html(params['alcohol'].replace(/'/g, '').toString());
        } else {
            $('#desc_alcohol').hide();
            $('#desc_alcohol').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['age'] != null) {
            $('#desc_age').show();
            $('#desc_age').find('.efd-cell2_subpopulaiton').html(params['age'].replace(/'/g, '').toString());
        } else {
            $('#desc_age').hide();
            $('#desc_age').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['ethnicity'] != null) {
            $('#desc_ethnicity').show();
            $('#desc_ethnicity').find('.efd-cell2_subpopulaiton').html(params['ethnicity'].replace(/'/g, '').toString());
        } else {
            $('#desc_ethnicity').hide();
            $('#desc_ethnicity').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['meld'] != null) {
            $('#desc_meldscore').show();
            $('#desc_meldscore').find('.efd-cell2_subpopulaiton').html(params['meld'].replace(/'/g, '').toString());
        } else {
            $('#desc_meldscore').hide();
            $('#desc_meldscore').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['etoh'] != null) {
            $('#desc_etoh').show();
            $('#desc_etoh').find('.efd-cell2_subpopulaiton').html(params['etoh'].replace(/'/g, '').toString());
        } else {
            $('#desc_etoh').hide();
            $('#desc_etoh').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['weight'] != null) {
            $('#desc_weight').show();
            $('#desc_weight').find('.efd-cell2_subpopulaiton').html(params['weight'].replace(/'/g, '').toString());
        } else {
            $('#desc_weight').hide();
            $('#desc_weight').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['viralLoad'] != null) {
            $('#desc_virallaod').show();
            $('#desc_virallaod').find('.efd-cell2_subpopulaiton').html(params['viralLoad'].replace(/'/g, '').toString());
        } else {
            $('#desc_virallaod').hide();
            $('#desc_virallaod').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['apri'] != null) {
            $('#desc_apri').show();
            $('#desc_apri').find('.efd-cell2_subpopulaiton').html(params['apri'].replace(/'/g, '').toString());
        } else {
            $('#desc_apri').hide();
            $('#desc_apri').find('.efd-cell2_subpopulaiton').html('');
        }

        $('.searchPatientCountHeader').html(commaSeperatedNumber(params['patientCountTab'] || 0));

    }
}



let getSelectedDatabase = (name) => {
    let value = $('#showSelectedDatabase').prop('checked');
    return value ? 'IMS_LRX_AmbEMR_Dataset' : 'PHS_HCV';
}

