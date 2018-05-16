import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';

import './Prioritization.html';

let validator;
let mePatientPAForm;
var PreauthorizationData = null;
Session.set('FilesUpload', []);

Template.Prioritization.onCreated(function() {

});

Template.Prioritization.rendered = function() {
    // For validating the form entry
    validator = $("#frmPreAuthorization").validate({
        rules: {
            txtPatient: {
                required: true
            }
        },
        messages: {
            txtPatient: {
                required: "Please enter patient name."
            }
        }

    });
    // Render the data based on selected id
    mePatientPAForm = this.data.PAPatientdata;
    if (mePatientPAForm != null)
        patientPADataRendered(mePatientPAForm);
};

Template.Prioritization.helpers({
    // get the list of predefined GENOTYPEs
    'getGenotypeList': () => PatientsGenotypeList,
    'uploadFiles': () => Session.get('UploadedFiles')
});


Template.Prioritization.events({
    //Save user record when click save button
    'click #btnSaveUser': function() {
        let isValid = $("#frmPreAuthorization").valid();
        if (!isValid) {
            // alertify.alert('Pre Authorization', 'Please enter all the required fields for this form.');

            sAlert.error('Please enter all the required fields for this form.', {
                timeout: 1500,
                onClose: function() {
                    console.log('Pre Authorization save error - closing alert in 1000ms...');
                },
                effect: 'bouncyflip',
                html: true,
                position: 'top-left',
                width: '400px'
            });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);

        } else {
            SaveData();

            //To Do Logic for Save operation
            // console.log("Record Saved successfully");
        }
    },
    'click .js-providerSubtabs-links': function(e, template) {
        let tabData = $(e.currentTarget).children('a').attr('data');
        e.preventDefault();
        //set provider subtab data link
        Session.set('provider_subtab', tabData);
        Router.go('Provider');
    },
    // Nisha 02/13/2017 Click event for the Pre Authorizaton form
    'click .pro_rightsideimg': function(e) {
        Router.go('Provider/PreAuthArchive');
    },
    // Jayesh 02/17/2017 Click event for P & T Model
    'click .ptModelButton': function(e) {
        Router.go('Provider/PTmodel');
    },
    // Praveen 02/13/2017 Click event for Download uploaded file
    'click .downloadFileLink li': function(e, template) {
        e.preventDefault();
        let type = $(e.currentTarget).attr('type');
        let name = $(e.currentTarget).attr('name');
        let data = $(e.currentTarget).attr('data');
        //downloadFile({type:type,name:name,dataUrl:data});
        // $("#dialog").dialog({
        //   modal:true
        // });
        // $('.analyticsPatientsPopup').show();
        $("#frame").attr("src", data);
        //download(data,name,type);
    },
    //popup close written by Praveen
    'click .analytics_closebtn': function() {
        $('.analyticsPatientsPopup').hide();
    },
    // Praveen 02/13/2017 Click event for delete selected uploaded file
    'click .deleteUploadedFile': function(e, template) {
        e.preventDefault();
        let data = Session.get('UploadedFiles');
        let filename = $(e.currentTarget).attr('data');
        let sdata = [];
        for (let i = 0; i < data.length; i++) {
            let filen = data[i].id;
            if (filename && filen != filename) {
                sdata.push(data[i]);
            }
        }
        if (filename)
            Session.set('UploadedFiles', sdata);
    }
});

// Function to clear all the form fields
function ClearFields() {
    $(".singlepagecontent").find(':input').each(function() {
        if (this.type == 'button') {
            //do nothing
        } else if (this.type == 'checkbox' || this.type == 'radio') {
            this.checked = false;
        } else if (this.type == 'file') {
            var control = $(this);
            control.replaceWith(control = control.clone(true));
        } else {
            $(this).val('');
        }
    });

}

// Function to Save the data from the form to database
function SaveData() {
    let pData = {
        PATIENTNAME: $("#txtPatient").val().trim(),
        DOB: $("#txtDOB").val().trim(),
        ChronicHepa: $("#chkChronicHep").prop("checked"),
        GENOTYPE: $("#txtGenotype").val().trim(),
        hcvRNALevel: $("#txtHCVRNALevel").val().trim(),
        hcvRNALevelDate: $("#txtHCVRNALevelDate").val() == "" ? null : $("#txtHCVRNALevelDate").val(),
        ChronicHepaExtra: $("#rdChronicHYes").prop("checked") == true ? true : false,
        ASTFlag: $("#chkAST").prop("checked"),
        ALTFlag: $("#chkALT").prop("checked"),
        BilirubinFlag: $("#chkBilirubin").prop("checked"),
        AlbuminFlag: $("#chkAlbumin").prop("checked"),
        INRFlag: $("#chkINR").prop("checked"),
        PlateletCountFlag: $("#chkPlateletCount").prop("checked"),
        HemoglobinFlag: $("#chkHemoglobin").prop("checked"),
        CreatinineFlag: $("#chkCreatinine").prop("checked"),
        HBsAGFlag: $("#chkhbsag").prop("checked"),
        antiHBsFlag: $("#chkantihbs").prop("checked"),
        antiHBcFlag: $("#chkantihbc").prop("checked"),
        LiverTransplantFlag: $("#rdliverTransplantYes").prop("checked") == true ? true : false,
        LiverTransplantCheckFlag: $("#chkliverTransplantPastDate").prop("checked"),
        LiverTransplantCheckPastDate: $("#LiverTransplantCheckPastDate").val() == "" ? null : $("#LiverTransplantCheckPastDate").val(),
        LiverTransplantBeingConsidered: $("#chkliverTransplantBeingConsidered").prop("checked"),
        LiverAssessmentFlag: $("#chkliverTransplantBeingConsidered").prop("checked"),
        TreatmentExperienced: $("#rdtreatmentexperiencedYes").prop("checked") == true ? true : false,
        TreatmentExperiencedRegimen: $("#txtTreatmentExperiencedRegimen").val().trim(),
        TreatmentExperiencedRegimenFlag: $('input[name=rdtreatmentexperiencedcompleted]:checked').val(),
        TreatmentExperiencedReasonDiscontinuation: $("#txtTreatmentExperiencedReasonDiscontinuation").val().trim(),
        TreatmentExperiencedPatientResponse: $('input[name=rdpatientsresponsecompleted]:checked').val(),
        TreatmentExperiencedDirectActingAntiViral: $("#rdretreatmentneededcompletedYes").prop("checked") == true ? true : false,
        TreatmentExperiencedReviewedFlag: $("#rdprojectechoYes").prop("checked") == true ? true : false,
        ResistanceTestingGenotype1aZepaFlag: $("#rdgenozepYes").prop("checked") == true ? true : false,
        ResistanceTestingGenotype1aZepaNS5A: $("#chkgenozep").prop("checked"),
        ResistanceTestingGenotype3TNCFlag: $("#rdgenotcYes").prop("checked") == true ? true : false,
        ResistanceTestingGenotype3TNCNS5A: $("#chkgenotc").prop("checked"),
        ResistanceTestingGenotype3TNNonCFlag: $("#rdgenotnoncYes").prop("checked") == true ? true : false,
        ResistanceTestingGenotype3TNNonCNS5A: $("#chkgenotnonc").prop("checked"),
        ResistanceTestingPriorTreatmentFailureFlag: $('input[name=rdantiviralDAA]:checked').val(),
        ResistanceTestingPriorTreatmentFailureNS5A: $("#chkantiviralDAANS5A").prop("checked"),
        ResistanceTestingPriorTreatmentFailureNS3: $("#chkantiviralDAANS3").prop("checked"),
        RequestMedicationsDrug1: $("#txtRequestedMedicationDrug1").val().trim(),
        RequestMedicationsDose1: $("#txtRequestedMedicationDose1").val().trim(),
        RequestMedicationsDuration1: $("#txtRequestedMedicationDuration1").val().trim(),
        RequestMedicationsDrug2: $("#txtRequestedMedicationDrug2").val().trim(),
        RequestMedicationsDose2: $("#txtRequestedMedicationDose2").val().trim(),
        RequestMedicationsDuration2: $("#txtRequestedMedicationDuration2").val().trim(),
        RequestMedicationsAlternativeEqui: $("#chkAgreeable").prop("checked"),
        RequestMedicationsAlternativeDrugs: $("#chkAgreeableGuidance").prop("checked"),
        RequestMedicationsComments: $("#txtComments").val().trim(),
        AdherencePotentialFlag: $("#chkattest").prop("checked"),
        attachments: JSON.stringify(Session.get('UploadedFiles'))
    };

    Meteor.call('AddHCVChecklistData', pData, function(err, res) {
        // console.log("User added successfully..");
        // alertify.alert('Pre Authorization', 'Pre Authorization form submitted successfully.');
        ClearFields();
        // setTimeout(function() {
        //     alertify.closeAll();
        // }, 1000);
        sAlert.success('Pre Authorization form submitted successfully.', {
            timeout: 1500,
            onClose: function() {
                console.log('Pre Authorization save error - closing alert in 1000ms...');
            },
            effect: 'bouncyflip',
            html: true,
            position: 'top-left',
            width: '400px'
        });
        setTimeout(function() {
            sAlert.closeAll();
        }, 3000);

    });

}

// Function to render the selected PA form data
function patientPADataRendered(PAformData) {

    let pData = {
        PAID: PAformData,
        form: 'PAForm'
    };

    Meteor.call('getPreAuthorizationFormData', pData, function(error, result) {
        if (error) {
            sAlert.error('There is Error loading the page data.', {
                timeout: 1500,
                onClose: function() {
                    console.log('Pre Authorization error - closing alert in 1000ms...');
                },
                effect: 'bouncyflip',
                html: true,
                position: 'top-left',
                width: '400px'
            });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
        } else {
            let decompressed_object = LZString.decompress(result);
            let resulting_object = JSON.parse(decompressed_object);
            PreauthorizationData = resulting_object.PreauthorizationData;
            // Fetch the data and hide the save button
            $(".PAtg_box_btn").hide();
            RenderPAformValues(PreauthorizationData);
        }

    });

}
// Render the Patient Data
function RenderPAformValues(PreauthorizationData) {
    $("#txtPatient").val(PreauthorizationData[0].hcv_PATIENTNAME);

    $("#txtDOB").val(PreauthorizationData[0].hcv_DOBPA);
    if (PreauthorizationData[0].hcv_ChronicHepa != null) {
        if (PreauthorizationData[0].hcv_ChronicHepa.data[0] == 1)
            $("#chkChronicHep").prop("checked", "true");
    }
    $("#txtGenotype").val(PreauthorizationData[0].hcv_GENOTYPE);
    $("#txtHCVRNALevel").val(PreauthorizationData[0].hcvRNALevel);
    $("#txtHCVRNALevelDate").val(PreauthorizationData[0].hcvRNALevelDatePA);
    if (PreauthorizationData[0].hcv_ChronicHepaExtra != null) {
        if (PreauthorizationData[0].hcv_ChronicHepaExtra.data[0] == 1)
            $("#rdChronicHYes").prop("checked", "true");
        else if (PreauthorizationData[0].hcv_ChronicHepaExtra.data[0] == 0)
            $("#rdChronicHNo").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_ASTFlag != null) {
        if (PreauthorizationData[0].hcv_ASTFlag.data[0] == 1)
            $("#chkAST").prop("checked", "true");
    }
    if (PreauthorizationData[0].hcv_ALTFlag != null) {
        if (PreauthorizationData[0].hcv_ALTFlag.data[0] == 1)
            $("#chkALT").prop("checked", "true");
    }
    if (PreauthorizationData[0].hcv_BilirubinFlag != null) {
        if (PreauthorizationData[0].hcv_BilirubinFlag.data[0] == 1)
            $("#chkBilirubin").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_AlbuminFlag != null) {
        if (PreauthorizationData[0].hcv_AlbuminFlag.data[0] == 1)
            $("#chkAlbumin").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_INRFlag != null) {
        if (PreauthorizationData[0].hcv_INRFlag.data[0] == 1)
            $("#chkINR").prop("checked", "true");
    }
    if (PreauthorizationData[0].hcv_PlateletCountFlag != null) {
        if (PreauthorizationData[0].hcv_PlateletCountFlag.data[0] == 1)
            $("#chkPlateletCount").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_HemoglobinFlag != null) {
        if (PreauthorizationData[0].hcv_HemoglobinFlag.data[0] == 1)
            $("#chkHemoglobin").prop("checked", "true");
    }
    if (PreauthorizationData[0].hcv_CreatinineFlag != null) {
        if (PreauthorizationData[0].hcv_CreatinineFlag.data[0] == 1)
            $("#chkCreatinine").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_HBsAGFlag != null) {
        if (PreauthorizationData[0].hcv_HBsAGFlag.data[0] == 1)
            $("#chkhbsag").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_antiHBsFlag != null) {
        if (PreauthorizationData[0].hcv_antiHBsFlag.data[0] == 1)
            $("#chkantihbs").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_antiHBcFlag != null) {
        if (PreauthorizationData[0].hcv_antiHBcFlag.data[0] == 1)
            $("#chkantihbc").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_LiverTransplantFlag != null) {
        if (PreauthorizationData[0].hcv_LiverTransplantFlag.data[0] == 1)
            $("#rdliverTransplantYes").prop("checked", "true");
        else if (PreauthorizationData[0].hcv_LiverTransplantFlag.data[0] == 0)
            $("#rdliverTransplantNo").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_LiverTransplantCheckFlag != null) {
        if (PreauthorizationData[0].hcv_LiverTransplantCheckFlag.data[0] == 1)
            $("#chkliverTransplantPastDate").prop("checked", "true");
    }
    $("#LiverTransplantCheckPastDate").val(PreauthorizationData[0].hcv_LiverTransplantCheckPastDatePA);
    // LiverTransplantCheckPastDate: $("#LiverTransplantCheckPastDate").val() == "" ? null : $("#LiverTransplantCheckPastDate").val(),
    if (PreauthorizationData[0].hcv_LiverTransplantBeingConsidered != null) {
        if (PreauthorizationData[0].hcv_LiverTransplantBeingConsidered.data[0] == 1)
            $("#chkliverTransplantBeingConsidered").prop("checked", "true");
    }
    if (PreauthorizationData[0].hcv_LiverAssessmentFlag != null) {
        if (PreauthorizationData[0].hcv_LiverAssessmentFlag.data[0] == 1)
            $("#chkliverTransplantBeingConsidered").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_TreatmentExperienced != null) {
        if (PreauthorizationData[0].hcv_TreatmentExperienced.data[0] == 1)
            $("#rdtreatmentexperiencedYes").prop("checked", "true");
        else if (PreauthorizationData[0].hcv_TreatmentExperienced.data[0] == 0)
            $("#rdtreatmentexperiencedNo").prop("checked", "true");
    }

    $("#txtTreatmentExperiencedRegimen").val(PreauthorizationData[0].hcv_TreatmentExperiencedRegimen);
    $("#txtTreatmentExperiencedReasonDiscontinuation").val(PreauthorizationData[0].hcv_TreatmentExperiencedReasonDiscontinuation);

    if (PreauthorizationData[0].hcv_TreatmentExperiencedDirectActingAntiViral != null) {
        if (PreauthorizationData[0].hcv_TreatmentExperiencedDirectActingAntiViral.data[0] == 1)
            $("#rdretreatmentneededcompletedYes").prop("checked", "true");
        else if (PreauthorizationData[0].hcv_TreatmentExperiencedDirectActingAntiViral.data[0] == 0)
            $("#rdretreatmentneededcompletedNo").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_TreatmentExperiencedReviewedFlag != null) {
        if (PreauthorizationData[0].hcv_TreatmentExperiencedReviewedFlag.data[0] == 1)
            $("#rdprojectechoYes").prop("checked", "true");
        else if (PreauthorizationData[0].hcv_TreatmentExperiencedReviewedFlag.data[0] == 0)
            $("#rdprojectechoNo").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_ResistanceTestingGenotype1aZepaFlag != null) {
        if (PreauthorizationData[0].hcv_ResistanceTestingGenotype1aZepaFlag.data[0] == 1)
            $("#rdgenozepYes").prop("checked", "true");
        else if (PreauthorizationData[0].hcv_ResistanceTestingGenotype1aZepaFlag.data[0] == 0)
            $("#rdgenozepYes").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_ResistanceTestingGenotype1aZepaNS5A != null) {
        if (PreauthorizationData[0].hcv_ResistanceTestingGenotype1aZepaNS5A.data[0] == 1)
            $("#chkgenozep").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNCFlag != null) {
        if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNCFlag.data[0] == 1)
            $("#rdgenotcYes").prop("checked", "true");
        else if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNCFlag.data[0] == 0)
            $("#rdgenotcNo").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNCNS5A != null) {
        if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNCNS5A.data[0] == 1)
            $("#chkgenotc").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNNonCFlag != null) {
        if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNNonCFlag.data[0] == 1)
            $("#rdgenotnoncYes").prop("checked", "true");
        else if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNNonCFlag.data[0] == 0)
            $("#rdgenotnoncNo").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNNonCNS5A != null) {
        if (PreauthorizationData[0].hcv_ResistanceTestingGenotype3TNNonCNS5A.data[0] == 1)
            $("#chkgenotnonc").prop("checked", "true");
    }
    if (PreauthorizationData[0].hcv_ResistanceTestingPriorTreatmentFailureNS5A != null) {
        if (PreauthorizationData[0].hcv_ResistanceTestingPriorTreatmentFailureNS5A.data[0] == 1)
            $("#chkantiviralDAANS5A").prop("checked", "true");
    }
    if (PreauthorizationData[0].hcv_ResistanceTestingPriorTreatmentFailureNS3 != null) {
        if (PreauthorizationData[0].hcv_ResistanceTestingPriorTreatmentFailureNS3.data[0] == 1)
            $("#chkantiviralDAANS3").prop("checked", "true");
    }

    $("#txtRequestedMedicationDrug1").val(PreauthorizationData[0].hcv_RequestMedicationsDrug1);
    $("#txtRequestedMedicationDose1").val(PreauthorizationData[0].hcv_RequestMedicationsDose1);
    $("#txtRequestedMedicationDuration1").val(PreauthorizationData[0].hcv_RequestMedicationsDuration1);
    $("#txtRequestedMedicationDrug2").val(PreauthorizationData[0].hcv_RequestMedicationsDrug2);
    $("#txtRequestedMedicationDose2").val(PreauthorizationData[0].hcv_RequestMedicationsDose2);
    $("#txtRequestedMedicationDuration2").val(PreauthorizationData[0].hcv_RequestMedicationsDuration2);

    if (PreauthorizationData[0].hcv_RequestMedicationsAlternativeEqui != null) {
        if (PreauthorizationData[0].hcv_RequestMedicationsAlternativeEqui.data[0] == 1)
            $("#chkAgreeable").prop("checked", "true");
    }

    if (PreauthorizationData[0].hcv_RequestMedicationsAlternativeDrugs != null) {
        if (PreauthorizationData[0].hcv_RequestMedicationsAlternativeDrugs.data[0] == 1)
            $("#chkAgreeableGuidance").prop("checked", "true");
    }

    $("#txtComments").val(PreauthorizationData[0].hcv_RequestMedicationsComments);

    if (PreauthorizationData[0].hcv_AdherencePotentialFlag != null) {
        if (PreauthorizationData[0].hcv_AdherencePotentialFlag.data[0] == 1)
            $("#chkattest").prop("checked", "true");
    }
    if (PreauthorizationData[0].hcv_TreatmentExperiencedRegimenFlag != null) {
        $("input[name=rdtreatmentexperiencedcompleted][value=" + PreauthorizationData[0].hcv_TreatmentExperiencedRegimenFlag + "]").prop('checked', true);
    }
    if (PreauthorizationData[0].hcv_TreatmentExperiencedPatientResponse != null) {
        $("input[name=rdpatientsresponsecompleted][value=" + PreauthorizationData[0].hcv_TreatmentExperiencedPatientResponse + "]").prop('checked', true);
    }
    if (PreauthorizationData[0].hcv_ResistanceTestingPriorTreatmentFailureFlag != null) {
        $("input[name=rdantiviralDAA][value=" + PreauthorizationData[0].hcv_ResistanceTestingPriorTreatmentFailureFlag + "]").prop('checked', true);
    }

    //Praveen 02/16/2017 5:58PM check for uploadedfiles if present and set on uploaded files section
    if (PreauthorizationData[0].attachments != null) {
        //parse into json data
        let dataAttached = JSON.parse(PreauthorizationData[0].attachments);
        //check if attachments are present or not
        if (dataAttached.length) {
            //set it to variable
            Session.set('UploadedFiles', dataAttached);
        }
    }
}

function download(data, strFileName, strMimeType) {

    var self = window, // this script is only for browsers anyway...
        defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
        mimeType = strMimeType || defaultMime,
        payload = data,
        url = !strFileName && !strMimeType && payload,
        anchor = document.createElement("a"),
        toString = function(a) { return String(a); },
        myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
        fileName = strFileName || "download",
        blob,
        reader;
    myBlob = myBlob.call ? myBlob.bind(self) : Blob;

    if (String(this) === "true") { //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
        payload = [payload, mimeType];
        mimeType = payload[0];
        payload = payload[1];
    }


    if (url && url.length < 2048) { // if no filename and no mime, assume a url was passed as the only argument
        fileName = url.split("/").pop().split("?")[0];
        anchor.href = url; // assign href prop to temp anchor
        if (anchor.href.indexOf(url) !== -1) { // if the browser determines that it's a potentially valid url path:
            var ajax = new XMLHttpRequest();
            ajax.open("GET", url, true);
            ajax.responseType = 'blob';
            ajax.onload = function(e) {
                download(e.target.response, fileName, defaultMime);
            };
            setTimeout(function() { ajax.send(); }, 0); // allows setting custom ajax headers using the return:
            return ajax;
        } // end if valid url?
    } // end if url?


    //go ahead and download dataURLs right away
    if (/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)) {

        if (payload.length > (1024 * 1024 * 1.999) && myBlob !== toString) {
            payload = dataUrlToBlob(payload);
            mimeType = payload.type || defaultMime;
        } else {
            return navigator.msSaveBlob ? // IE10 can't do a[download], only Blobs:
                navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
                saver(payload); // everyone else can save dataURLs un-processed
        }

    } //end if dataURL passed?

    blob = payload instanceof myBlob ?
        payload :
        new myBlob([payload], { type: mimeType });


    function dataUrlToBlob(strUrl) {
        var parts = strUrl.split(/[:;,]/),
            type = parts[1],
            decoder = parts[2] == "base64" ? atob : decodeURIComponent,
            binData = decoder(parts.pop()),
            mx = binData.length,
            i = 0,
            uiArr = new Uint8Array(mx);

        for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);

        return new myBlob([uiArr], { type: type });
    }

    function saver(url, winMode) {

        if ('download' in anchor) { //html5 A[download]
            anchor.href = url;
            anchor.setAttribute("download", fileName);
            anchor.className = "download-js-link";
            anchor.innerHTML = "downloading...";
            anchor.style.display = "none";
            document.body.appendChild(anchor);
            setTimeout(function() {
                anchor.click();
                document.body.removeChild(anchor);
                if (winMode === true) { setTimeout(function() { self.URL.revokeObjectURL(anchor.href); }, 250); }
            }, 66);
            return true;
        }

        // handle non-a[download] safari as best we can:
        if (/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
            url = url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
            if (!window.open(url)) { // popup blocked, offer direct download:
                if (confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")) { location.href = url; }
            }
            return true;
        }

        //do iframe dataURL download (old ch+FF):
        var f = document.createElement("iframe");
        document.body.appendChild(f);

        if (!winMode) { // force a mime that will download:
            url = "data:" + url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
        }
        f.src = url;
        setTimeout(function() { document.body.removeChild(f); }, 333);

    } //end saver




    if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
        return navigator.msSaveBlob(blob, fileName);
    }

    if (self.URL) { // simple fast and modern way using Blob and URL:
        saver(self.URL.createObjectURL(blob), true);
    } else {
        // handle non-Blob()+non-URL browsers:
        if (typeof blob === "string" || blob.constructor === toString) {
            try {
                return saver("data:" + mimeType + ";base64," + self.btoa(blob));
            } catch (y) {
                return saver("data:" + mimeType + "," + encodeURIComponent(blob));
            }
        }

        // Blob but not URL support:
        reader = new FileReader();
        reader.onload = function(e) {
            saver(this.result);
        };
        reader.readAsDataURL(blob);
    }
    return true;
}; /* end download() */