import { Template } from 'meteor/templating';
import './paRequest.html';
import '../../lib/cover-my-meds-api-plugins'; // coverMyMeds plugin reference

Template.PARequest.rendered = function() {
    $(function() {
        // configure API_ID before use any CoveMyMeds method
        var tokenIds = JSON.parse(localStorage.getItem('cmm_plugin_api_token_ids')) || [],
            config = {
               // apiId: 'e7c6hxn22nj9o5uo0skx',// 'rr6q9juuelyysacc529d',
                 apiId:  'rr6q9juuelyysacc529d',
                version: 1
            };

        var isValid = false;
        // Store some example PA IDs for Pagination 
        //Commented dummy token ID, this would be comes from database if we save
        // if (tokenIds.length === 0) {
        //     //When Application Start for first time store pre enter PR Request token Id
        //     tokenIds = ["8p9yhrsfog657pue8cbo", "d2mh3vkz6hg2gdv3guf9", "qg1je9uoqyvg8pljw51g", "l511cltghdpima3qh0ck", "znf34d3f0bwa8n5iwjk8", "m7ti609w2sj2ht4ftcsn", "obfy0zkjh2fzkbpotzw9", "ezl0thiqv3uob9nygclu", "iwk6583o4m1v7es1fjxz", "vngf9cavoal7k1of0l2n", "8x4eskhlk4uzwu6lqh8i"];
        //     localStorage.setItem('cmm_plugin_api_token_ids', JSON.stringify(tokenIds));
        // }

        //Search Drugs by name using CoverMyMeds API
        $('#drug-search').drugSearch({
            apiId: config.apiId,
            version: config.version
        });

        //Search Form by name using CoverMyMeds API for PA Request
        $('#form-search').formSearch({
            apiId: config.apiId,
            version: config.version
        });
//Commented as default State field is highlighted
        // var stateVar = $('#state').val();
        // if (stateVar === "Select a state") {
        //     $('#state').parent().parent().addClass('highlight');
        // } else {
        //     $('#state').parent().parent().removeClass('highlight');
        // }

        //Check patient last name for valid entry
        $("#patient-fname").blur(function() {
            var fname = $(this).val().trim();
            if ($(this).val().trim().length > 0) {
                $(this).parent().parent().removeClass('highlight');
                isValid = true;
            } else {
                $(this).parent().parent().addClass('highlight');
                isValid = false;
            }
        });
        //Check patient last name for valid entry
        $("#patient-lname").blur(function() {
            if ($(this).val().trim().length > 0) {
                $(this).parent().parent().removeClass('highlight');
                isValid = true;
            } else {
                $(this).parent().parent().addClass('highlight');
                isValid = false;
            }

        });


        $("#patient-dob").blur(function() {
            if ($(this).val().trim().length > 0) {
                $(this).parent().parent().removeClass('highlight');
                isValid = true;
            } else {
                $(this).parent().parent().addClass('highlight');
                isValid = false;
            }
        });

        //Check state search input for valid entry
        $("#state").change(function() {
            var stateVar = $(this).val();
            if (stateVar === "Select a state") {
                $(this).parent().parent().addClass('highlight');
                isValid = true;
            } else {
                $(this).parent().parent().removeClass('highlight');
                isValid = false;
            }
        });

        //Set Drugname if request comes from Drugs Page
        if (localStorage.getItem('paDrugName')) {
            $('#s2id_drug-search .select2-chosen').text(localStorage.getItem('paDrugName'));
            $("#s2id_drug-search input[type='text']").val(localStorage.getItem('paDrugName'));
            //$('#s2id_drug-search .select2-drop').show();
            //// clear last selected value
            //localStorage.removeItem('paDrugName');
        }

        //Check drud search input for valid entry
        $("#s2id_drug-search input[type='text']").blur(function() {
            if ($("#drug-search").val().trim().length > 0) {
                $("#drug-search").parent().parent().removeClass('highlight');
                isValid = true;
            } else {
                $("#drug-search").parent().parent().addClass('highlight');
                isValid = false;
            }
        });

        //Check form search input for valid entry
        $("#s2id_form-search input[type='text']").blur(function() {
            if ($("#form-search").val().trim().length > 0) {
                $("#form-search").parent().parent().removeClass('highlight');
                isValid = true;
            } else {
                $("#form-search").parent().parent().addClass('highlight');
                isValid = false;
            }
        });

        //Trigger Send PA request once we fill data
        $('#start-request').createRequest({
            apiId: config.apiId,
            version: config.version,
            success: function(data, status, xhr) {
                // Temporarily store data in localstorage, to be accessed later
                // later token may be stored in database so we can grab PR Request based on that tokens Id and app_Id
               /**
                * @author: Arvind
                * @reviewer: 
                * @date: 13-Apr-2017
                * @desc: Added default empty array if tokenId not generated
               */
                var tokenIds = JSON.parse(localStorage.getItem('cmm_plugin_api_token_ids'))||[];
                //Store token ID to local storage which will be used in dashboard
                tokenIds.push(data.request.tokens[0].id);
                localStorage.setItem('cmm_plugin_api_token_ids', JSON.stringify(tokenIds));
                //location.href = "/PADashboard";
                Router.go('/PADashboard');
            },
            error: function(data, status, xhr) {
                console.log(xhr);
                alert('Please make sure that each field is properly filled out.');
            }
        });

    });

};


//Created helper method to bind state dynamically to PA Request page
Template.PARequest.helpers({


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

    //Method Set highlight class if formdata is invalid
    'isFormValid': function(pData) {

        if (pData) {
            return " ";
        } else {
            return "highlight";
        }
    },
    //Method store patient's information which will use while creating PA Request
    'person': function() {
        var p = {
            "PatientID": "EMR8768",
            "PatientName": "John Smith",
            "Address": "7678 Somewhere St, Los Angeles CA 90092",
            "Birthday": "9/12/1976",
            "Gender": "Male",
            "Languge": "English",
            "Race": "White",
            "Ethnicity": "Non-Hispanic",
            "Insurance": "Aetna",
            "Genotype": "1",
            "ViralLoad": 6.041,
            "ETOH": 0.03,
            "Treatment": "Na�ve ",
            "Relapsed": "",
            "PartialResponse": "",
            "NonResponsive": "",
            "HCC": 20,
            "UrineScreen": 0.2,
            "Cirrhosis": "Yes",
            "MeldScore": 30,
            "AssessmentLiverDisaese": "Yes",
            "Fibrosur": "F1",
            "LiverBiopsy": "Noramal",
            "CMP": "Link to a popup window",
            "CBC": "Link to a popup window",
            "Pregnancy": "No",
            "RenalFailure": "Yes",
            "MentalHealth": "No",
            "Smoking": "Yes",
            "Alcohol": "No",
            "BodyWeight": 215,
            "Drug": "Harvoni",
            "Efficacy": "Clinical Guidelines - 98% VS. Real World Evidence (n=2909) - 97% ",
            "Adherance": "Adherence Rate : 67%\nTime to Discontinued of meds: 5Wk\nMPR: 89%",
            "Utilization": "Prescription Rate: 349 VS. Real World Evidence (n=2909) - 500 ",
            "Cost": "To Patient: 12K \nTo Payer: 85K",
            "Total Value": 97
        };
        p.fname = "John";
        p.lname = "Smith";
        return p;
    }
});

// Template.PARequests.destroyed = function() {

//     //remove safety link from header and adjust the nav bar items width
//     var element = $("#headerNavBar li").children("a[href$='/PADashboard']");
//     $(element).parent().remove();
//     var allListEle = $('#headerNavBar li');
//     var parentWidth = $('#headerNavBar').css('width');
//     parentWidth = parentWidth.replace('px', '');
//     var childWidth = (parseInt(parentWidth) / (allListEle.length)) + 'px';
//     for (var index = 0; index < allListEle.length; index++) {
//         $(allListEle[index]).css('width', childWidth);
//     }

// };