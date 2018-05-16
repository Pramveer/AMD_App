import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './screeningEvaulationTool.html';

/**
 * Added: Jayesh 24-Feb-2017
 * Issue :
 * Description :Primary Care and evaulation, treatment
 * Modified : Nisha 03/09/2017 fro addictional questions and validations in screening and evaluation
 * Modified : Nisha 03/10/2017 fro addictional questions and validations in screening and evaluation for medicaid as well as commercial
 * Modified : Nisha 03/16/2017 for addictional questions and validations in demographics, screening,evaluation and Treatment for medicaid as well as commercial
 * Modified : Nisha 03/17/2017 for Added feature for showing Patient Summary in popup with data indications
 * Modified : Nisha 03/20/2017 - 03/24/2017 for Added the changes as per client after internal demos
 * Modified : Nisha 03/31/2017 - 04/03/2017 Did the changes after the 2nd internal demo
 * Modified : Nisha 04/18/2017 Did the changes for Editing the exising  data
 * Modified : Arvind 05/04/2017 Did the changes for to display tab for other role SPECIAL REQUIREMENT FOR PHS 
 * Modifie : Nisha 10/18/2017 for changes speciafied by Chad
 */
let patientDetailsSearch = ReactiveVar({});
let patientDetails = {};
// screen four fields
patientDetails.genotype = '';
patientDetails.cirrhosis = '';
patientDetails.treatment = '';

let evaluationSelectedFlag = false;

// changes screening
let setScreening = -1;
let drugsData = [];
let dataRendered = false;
let editdataRendered = false;
let currentdate = '';

function HighlightTopNav() {

    let val = checkInputvalues("PhysicianPlan");

    var div;
    // console.log(val);
    if (val == 'Treatment')
        div = document.getElementById("topnavigation");
    else
        div = document.getElementById("topnavigationScreening");

    var items = div.getElementsByTagName("li");
    for (var i = 0; i < items.length; i++) {
        if (setScreening == i)
            $(items[i]).addClass("step-active");
        else if (setScreening > i) {
            $(items[i]).removeClass("step-active");
            $(items[i]).addClass("step-done");
        } else if (setScreening < i) {
            $(items[i]).removeClass("step-active");
            $(items[i]).removeClass("step-done");
        }
    }
    if (setScreening == 2) {
        $("#divViewSummary").show();
        $("#divsummarttitle").attr('title', "Treatment Summary");
    } else
        $("#divViewSummary").hide();
}



function IncreaseScreen() {
    setScreening = setScreening + 1;
    HighlightTopNav();
    $('html, body').animate({
        scrollTop: 0
    }, 'slow');
}

function DecreaseScreen() {
    setScreening = setScreening - 1;
    HighlightTopNav();
    $('html, body').animate({
        scrollTop: 0
    }, 'slow');
}


function intialScreenI() {
    $("#screenPartI input:radio").prop("checked", false);
    $('#validationMessageContainer').hide();
    // $('#divIntravenousDrugPatient').hide();
}

function intialScreenII() {
    $('#screenPartII input:radio').prop("checked", false);
    $('#divHCVAntiBodyResult').hide();
    $('#divHcvRnaTest').hide();
    $('#divHcvRnaTestResult').hide();
    hideValidationMessage();
    $('#btnScreeningPartII').show();
    $('#btnScreeningPartIISubmit').hide();
}

function intialScreenIII() {
    $('#screenPartIII input:radio').prop("checked", false);
}

function intialScreenIV() {
    $('#screenPartIV input:radio').prop("checked", false);
    $("#ddlGenotype").val("Select");
    $('#validationMessageContainer').hide();
}

Template.screeningEvaulationTool.onCreated(function() {
    highLightTab('Primary Care');
    $(".head-emr-details").hide();
    $('#headerSingleSearch').hide();
    $('#topnavigation').show();
    $('#topnavigationScreening').hide();
    intialScreenI();
    intialScreenII();
    intialScreenIV();
});




Template.screeningEvaulationTool.onDestroyed(function() {
    // deregister from some central store
    console.log("screeningEvaulationTool -> Distoryed");
    /**
         * @author: Arvind
         * @reviewer: 
         * @date: 04-May-2017
         * @desc: If current loggedin user have payer role and want to access pcp model then need
         *  to hide user manual icon as well as feedback icon when user move from this template to other template
         * BUT show search cohort menu
         * // function path : `../../lib/custom/common`
		return isUserAuthorized(tab);
        */
    //  if(Meteor.user() && Meteor.user().profile.userDetail.role === 2){
    if (isUserAuthorized('assessmenttool')) {
        $(".needhelp-div").hide();
        $(".usermanual-div").hide();
        $(".searchPatientMenu").show();
        //Show Searched cohort detail for other than assessmenttool page
        $(".head-emr-details").show();
        $('#headerSingleSearch').show();
        //Set over rise width to previous existing width for user seting 
        $(".user-info-setting").css("width", "420");
    }
});

Template.screeningEvaulationTool.rendered = function() {
    //Hide Searched cohort detail for assessmenttool page
    $(".head-emr-details").hide();
    $('#headerSingleSearch').hide();
    // $('.ui.accordion').accordion('refresh');
    // $('.editButton').hide();
    $("#divaccDemographics").addClass("active");
    $("#divaccDemographicscontent").addClass("active");
    $(".user-info-setting").css("width", "500");
    /**
         * @author: Arvind
         * @reviewer: 
         * @date: 04-May-2017
         * @desc: If current loggedin user have payer role and want to access pcp model then need to showuser manual icon
         * as well as feedback icon 
         *  * BUT hide search cohort menu
          * // function path : `../../lib/custom/common`
		return isUserAuthorized(tab);
        */
    //  if(Meteor.user() && Meteor.user().profile.userDetail.role === 2){
    if (isUserAuthorized('assessmenttool')) {
        $(".needhelp-div").show();
        $(".usermanual-div").show();
        $(".searchPatientMenu").hide();
        $(".user-info-setting").css("width", "620");
    }


    editdataRendered = false;
    dataRendered = false;
    setTimeout(function() {
        highLightTab('Primary Care');
        console.log("Primary Care highligh called");
        $('#topnavigation').show();
        $('#topnavigationScreening').hide();
        $("#headerSingleSearch").fadeOut();

    }, 700);
    setScreening = -1;
    IncreaseScreen();
    // var patid = PatientIDgenerator();
    // $("#txtPatientId").val(patid);
    // console.log(moment().format("HHmmDDMMYYYY"));

    $("#screenPartI").find("input,checkbox,textarea,select,button,label").click(function() {
        $(".js-showDateApply").hide();

    });
    $("#screenPartII").find("input,checkbox,textarea,select,button,label").click(function() {
        $(".js-showDateApply").hide();

    });
    $("#screenPartIII").find("input,checkbox,textarea,select,button,label").click(function() {
        $(".js-showDateApply").hide();

    });
    $("#screenPartIV").find("input,checkbox,textarea,select,button,label").click(function() {
        $(".js-showDateApply").hide();

    });

    $(".pcp-eval-labresults .datefieldform").click(function() {
        $(".js-showDateApply").show();

    });

    $(".pcp-eval-hepa .datefieldform").click(function() {
        $(".js-showDateApply").show();

    });

    $(".pcp-eval-labresults .datefieldform").change(function(e) {
        // currentdate = $(e.currentTarget).val();
        currentdate = e.currentTarget.id;
    });


    $(".pcp-eval-hepa .datefieldform").change(function(e) {
        currentdate = e.currentTarget.id;
    });

    $("#ddlPlanTypeUM").click(function(e) {
        // console.log($("#ddlPlanTypeUM").val());
        var url = '';
        if ($("#ddlPlanTypeUM").val() == "Treatment") {
            url = '/UserManual/pcpmodel/pcpusermanual.html';
        } else {
            url = '/UserManual/pcpmodel/pcpusermanualscreening.html';
        }
        // var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
        // $("body").append(appendthis);
        // $(".modal-overlay").fadeTo(500);
        // var modalBox = $(this).attr('data-modal-id');
        // $('#' + modalBox).fadeIn($(this).data());
        // $('#usermanualframe').css('height', '570px');
        // $('#usermanualframe').css('width', '100%');
        $('#usermanualframe').attr('src', url);
        // var modalBox = $('#popupForUserManual');
        // modalBox.show();

    });

    $('a[data-modal-id="popupForMELDCalculator"]').click(function(e) {
        e.preventDefault();
        var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
        $("body").append(appendthis);
        $(".modal-overlay").fadeTo(500);
        var modalBox = $(this).attr('data-modal-id');
        $('#' + modalBox).fadeIn($(this).data());
        $('#meldframe').css('height', '730px');
        $('#meldframe').attr('src', '/ClinicalCalcs/meldPopup/cal.html');
        var modalBox = $('#popupForCalculator');
        document.getElementById('clinicalCalcTitle').innerHTML = 'Clinical Calculator';
        modalBox.show();
        $('html, body').animate({
            scrollTop: 100
        }, 'slow');
    });

    $('a[data-modal-id="popupForChildPughCalculator"]').click(function(e) {
        e.preventDefault();
        var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
        $("body").append(appendthis);
        $(".modal-overlay").fadeTo(500);
        var modalBox = $(this).attr('data-modal-id');
        $('#' + modalBox).fadeIn($(this).data());
        $('#meldframe').css('height', '730px');
        $('#meldframe').attr('src', '/ClinicalCalcs/CTP-C/cal.html');
        var modalBox = $('#popupForCalculator');
        document.getElementById('clinicalCalcTitle').innerHTML = 'Clinical Calculator';
        modalBox.show();
        $('html, body').animate({
            scrollTop: 100
        }, 'slow');
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
        document.getElementById('clinicalCalcTitle').innerHTML = 'Clinical Calculator';
        modalBox.show();
        $('html, body').animate({
            scrollTop: 100
        }, 'slow');
    });


    $(".js-modal-close, .modal-overlay").click(function() {
        $('#meldframe').attr('src', '/ClinicalCalcs/meldPopup/cal.html');
        $(".modal-box, .modal-overlay").fadeOut(500, function() {
            $(".modal-overlay").remove();
        });
    });
    setTimeout(function() {
        (function blink() {
            $('.blinkPCPText').fadeOut(500).fadeIn(500, blink);
        })();
    }, 700);


    /**
                     * @author: Yuvraj
                     * @date: 29th feb 2017
                     * @desc: click event of acordion list

                    $('.accordionlistps').on('click', (e) => {

                        $('.accordionlistps').each((d, element) => {
                            if ($(element).hasClass('active') == true && $(element).text() != $(e.currentTarget).text()) {
                                $(element).removeClass('active');
                                $(element).next().removeClass('show');
                            }
                        });

                        //current accordion list check
                        if ($(e.currentTarget).hasClass('active')) {
                            $(e.currentTarget).removeClass('active');
                            $(e.currentTarget).next().removeClass('show');
                        } else {
                            $(e.currentTarget).addClass('active');
                            $(e.currentTarget).next().addClass('show');
                        }

                    }); */
    //set max date and min date in date filed
    let date = new Date();
    //$('input[type=date]').attr('min','1900-01-01');
    //$('input[type=date]').attr('max',moment(date).format("YYYY-MM-DD"));
    let start = new Date('01/01/1900');
    let end = new Date();
    $('#patientBirthYear').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: false,
        minDate: start,
        maxDate: end,
        locale: {
            cancelLabel: ''
        }
    });
    $('.datefieldform').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: false,
        minDate: start,
        maxDate: end,
        locale: {
            cancelLabel: '',
        }
    });

    //cb(start, end);

    $('input[name="patientBirthYear"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('MM/DD/YYYY'));
        setAgeOfPatient(picker.startDate);
    });

    $('.datefieldform').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('MM/DD/YYYY'));
        currentdate = $(this).attr('id');
    });

    // Nisha 04/25/2017 for block wise validation.
    $("#divaccDemographics").on("click", openDemographics);
    $("#divaccRiskFactors").on("click", checkDemographicsValidation);
    $("#divaccHepaticisStatus").on("click", checkRiskFactors);

    $("#divaccEvalHcvStatus").on("click", openEvaluation);
    $("#divaccEvalAlcohol").on("click", checkEvalHCVstatus);
    $("#divEvalRiskFactorstitle").on("click", openEvalRiskFactors);
    $("#divEvalDebilitatingFatigue").on("click", checkEvalRiskFactors);
    $("#divEvalLaboratoryTests").on("click", showEvalLaboratoryTests);
    $("#divEvalAlcoholscreening").on("click", checkEvalRiskFactorsBeforeLabs);

}

let showEvalLaboratoryTests = () => {
    if (chcvRnastatus()) {
        if (checkEvalFCT()) {
            $("#divaccEvaluation>div.active").removeClass("active");
            $('#divEvalLaboratoryTestscontent [id^=diverror]').hide();
            $('#divEvalLaboratoryTests').addClass("active");
            $('#divEvalLaboratoryTestscontent').addClass("active");
        } else {
            $("#divaccEvaluation>div.active").removeClass("active");
            // $('#divEvalRiskFactors [id^=diverror]').hide();
            $('#divEvalRiskFactorstitle').addClass("active");
            $('#divEvalRiskFactors').addClass("active");
        }
    }
}

let checkEvalRiskFactorsBeforeLabs = () => {
    if (chcvRnastatus()) {
        // checkEvalRiskFactors();
        // TreatmentEvalFileValiation();

        if (checkEvalFCT()) {
            if (TreatmentEvalFileValiation()) {
                $("#divaccEvaluation>div.active").removeClass("active");
                $('#divEvalAlcoholscreeningcontent [id^=diverror]').hide();
                $('#divEvalAlcoholscreening').addClass("active");
                $('#divEvalAlcoholscreeningcontent').addClass("active");
            } else {
                $("#divaccEvaluation>div.active").removeClass("active");
                // $('#divEvalRiskFactors [id^=diverror]').hide();
                $('#divEvalLaboratoryTests').addClass("active");
                $('#divEvalLaboratoryTestscontent').addClass("active");
            }

        } else {
            $("#divaccEvaluation>div.active").removeClass("active");
            // $('#divEvalRiskFactors [id^=diverror]').hide();
            $('#divEvalRiskFactorstitle').addClass("active");
            $('#divEvalRiskFactors').addClass("active");
        }
    }
}

let checkEvalRiskFactors = () => {
    if (chcvRnastatus()) {
        if (checkEvalFCT()) {
            $("#divaccEvaluation>div.active").removeClass("active");
            $('#divEvalDebilitatingFatiguecontent [id^=diverror]').hide();
            $('#divEvalDebilitatingFatigue').addClass("active");
            $('#divEvalDebilitatingFatiguecontent').addClass("active");
        } else {
            $("#divaccEvaluation>div.active").removeClass("active");
            // $('#divEvalRiskFactors [id^=diverror]').hide();
            $('#divEvalRiskFactorstitle').addClass("active");
            $('#divEvalRiskFactors').addClass("active");
        }
    }
}

let checkEvalFCT = () => {

    // Fibrosis
    if ($('input[name=seriousdeseasesFibrosisTest]:checked').length !== 0) {
        let seriousdeseasesFibrosisTest = checkInputvalues("seriousdeseasesFibrosisTest");

        if (seriousdeseasesFibrosisTest == "Yes") {
            let FibroStage = $('#ddlFibrosisstage').val();
            if (FibroStage.trim() == '') {
                showErrormessage("FibrosisTestValues", "Please enter the Fibrosis Stage.", true);
                return;
            }
            let errormessage = "Please enter one of the Fibrosis test values.";

            let txtFibroscanScore = checkforValidationTxtSelectOthers('txtFibroscanScore', 'txtFibroscanScoreOthers', "FibrosisTestValues", errormessage); //txtFibroscanScore;
            let txtFibrosistestScore = checkforValidationTxtSelectOthers('txtFibrosistestScore', 'txtFibrosistestScoreOthers', "FibrosisTestValues", errormessage); //txtFibrosistestScore;
            let txtAPRIscore = checkforValidationTxtSelectOthers('txtAPRIscore', 'txtAPRIscoreOthers', "FibrosisTestValues", errormessage); //txtAPRIscore;
            let txtFibroMeterscore = checkforValidationTxtSelectOthers('txtFibroMeterscore', 'txtFibroMeterscoreOthers', "FibrosisTestValues", errormessage); //txtFibroMeterscore;

            if (txtFibroscanScore == 0 && txtFibrosistestScore == 0 && txtAPRIscore == 0 && txtFibroMeterscore == 0) {
                return;
            }
        }
    }
    showErrormessage("FibrosisTestValues", "", false);
    // Fibrosis

    // Cirrhossi and treatment
    if ($('input[name=CommChildPughTest]:checked').length !== 0) {
        let CommChildPughTest = checkInputvalues("CommChildPughTest");

        //if condition is true
        if (CommChildPughTest == "Yes") {

            let txtChildPughscore = checkforValidationTxtSelectOthers("txtChildPughscore", "txtChildPughscoreOthers", "CirrhosisTestValues", "Please enter valid the Cirrhosis Child-Pugh score.");
            if (txtChildPughscore == 0) {
                return;
            }


            let txtMELDscore = checkforValidationTxtSelectOthers("txtMELDscore", "txtMELDscoreOthers", "CirrhosisTestValues", "Please enter the MELD score.");
            if (txtMELDscore == 0) {
                return;
            }
        }
    }
    showErrormessage("CirrhosisTestValues", "", false);

    if ($('input[name=treatmentexperienced]:checked').length == 0) {
        showErrormessage("TreatmentExperienced", "Please select is member treatment experienced?", true);
        return;
    }

    showErrormessage("TreatmentExperienced", "", false);
    // Cirrhossi and treatment
    return true;
}

let openEvalRiskFactors = () => {
    if (chcvRnastatus()) {
        $("#divaccEvaluation>div.active").removeClass("active");
        $('#divEvalRiskFactors [id^=diverror]').hide();
        $('#divEvalRiskFactorstitle').addClass("active");
        $('#divEvalRiskFactors').addClass("active");
    }
}

let checkEvalHCVstatus = () => {
    if (chcvRnastatus()) {
        $("#divaccEvaluation>div.active").removeClass("active");
        $('#divaccEvalAlcoholcontent [id^=diverror]').hide();
        $('#divaccEvalAlcohol').addClass("active");
        $('#divaccEvalAlcoholcontent').addClass("active");
    }
}
let chcvRnastatus = () => {
    let txtHcvRnaTestResultEval = $('#txtHcvRnaTestResultEval').val();
    let ddlgenotype = $('#ddlgenotypeEval').val();

    if (txtHcvRnaTestResultEval == '') {
        showErrormessage("HcvRnaTestEvaluation", "Please send the patient for HCV RNA test.", true);
        return;
    }

    if (ddlgenotype == '') {
        showErrormessage("HcvRnaTestEvaluation", "Please send the patient for HCV RNA test.", true);
        return;
    }
    return true;
}

let openEvaluation = () => {
    $("#divaccEvaluation>div.active").removeClass("active");
    $('#divaccEvalHcvStatuscontent [id^=diverror]').hide();
    $('#divaccEvalHcvStatus').addClass("active");
    $('#divaccEvalHcvStatuscontent').addClass("active");
}

let openDemographics = () => {
    $('#divaccDemographicscontent [id^=diverror]').hide();
    $("#divuiDemographics>div.active").removeClass("active");
    $("#divaccDemographics").addClass("active");
    $("#divaccDemographicscontent").addClass("active");
}

let checkRiskFactors = () => {
    checkDemographicsValidation();
    let PhysicianPlan = checkInputvalues("PhysicianPlan");

    if (PhysicianPlan == 'Treatment') {
        if ($('input[name=hemodialysisUser]:checked').length == 0) {
            showErrormessage("hemodialysisUser", 'Please select an option!', true);

            return;
        } else if ($('input[name=patientStatus]:checked').length == 0) {
            showErrormessage("patientStatus", 'Please select an option!', true);

            return;
        } else if ($('input[name=seriousdeseasesPatientmanSex]:checked').length == 0) {
            showErrormessage("seriousdeseasesPatientmanSex", 'Please select an option!', true);

            return;
        }
    }
    $("#divuiDemographics>div.active").removeClass("active");
    $('#divaccHepaticisStatuscontent [id^=diverror]').hide();
    $("#divaccHepaticisStatus").addClass("active");
    $("#divaccHepaticisStatuscontent").addClass("active");

}

let checkDemographicsValidation = () => {
    let PhysicianPlan = $('input[name=PhysicianPlan]:checked').val();
    let plantype = $('input[name=treatmentPlanType]:checked').val();
    let patientID = $('#txtPatientId').val();
    let birthYear = moment($('#patientBirthYear').val()).year();
    let today = moment();
    let validation = (birthYear < today.year() && birthYear >= 1900);


    if (!PhysicianPlan) {
        showErrormessage("PhysicianPlan", 'Please select Treat/Screen plan type!', true);
        return;
    }
    if (!plantype) {
        showErrormessage("treatmentPlanType", 'Please select treatment plan type !', true);
        return;
    }
    if (patientID == "") {
        showErrormessage("txtPatientId", 'Please enter patient ID!', true);
        return;
    }
    if (!validation) {
        showErrormessage("patientBirthYear", 'Please enter valid patient\'s date of birth !', true);
        return;
    }
    $("#divuiDemographics>div.active").removeClass("active");
    $('#divaccRiskFactorscontent [id^=diverror]').hide();
    $("#divaccRiskFactors").addClass("active");
    $("#divaccRiskFactorscontent").addClass("active");
}

let PatientIDgenerator = () => {
    var min = 1000;
    var max = 9999;
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    var tt = moment().format("DDMMYY");
    num = num + tt;
    return num;
}

let TreatmentEvalFileValiation = () => {

    // praveen 25 April 2017

    let EvalHepaBantigenfilel = checkEvalValues("divtxtEvalHepaBantigenfileupload");
    let EvalHepaBantibodyfilel = checkEvalValues("divtxtEvalHepaBantibodyfileupload");
    let EvalHepaBcoreantibodytotalfilel = checkEvalValues("divtxtEvalHepaBcoreantibodytotalfileupload");
    let EvalHepaAantibodyfilel = checkEvalValues("divtxtEvalHepaAantibodyfileupload");
    let EvalHIVantibodyfilel = checkEvalValues("divtxtEvalHIVantibodyfileupload");


    let isAnyHepaFileUploaded = EvalHepaBantigenfilel > 0 || EvalHepaBantibodyfilel > 0 || EvalHepaBcoreantibodytotalfilel > 0 || EvalHepaAantibodyfilel > 0 || EvalHIVantibodyfilel > 0;

    if (!isAnyHepaFileUploaded) {

        let EvalHepaBantigenDate = $("#txtEvalHepaBantigendate").val();
        let txtEvalHepaBantigen = $('#txtEvalHepaBantigen').val();
        if (txtEvalHepaBantigen.trim() == '' || EvalHepaBantigenDate == '') {
            showErrormessage("txtEvalHepaBantigen", "Please enter Hepatitis B surface antigen value and date or upload related file.", true);
            return;
        }

        let EvalHepaBantibodyDate = $("#txtEvalHepaBantibodydate").val();
        let txtEvalHepaBantibody = $('#txtEvalHepaBantibody').val();
        if (txtEvalHepaBantibody.trim() == '' || EvalHepaBantibodyDate == '') {
            showErrormessage("txtEvalHepaBantibody", "Please enter Hepatitis B surface antibody value and date or upload related file.", true);
            return;
        }

        let EvalHepaBcoreantibodytotalDate = $("#txtEvalHepaBcoreantibodytotaldate").val();
        let txtEvalHepaBcoreantibodytotal = $('#txtEvalHepaBcoreantibodytotal').val();
        if (txtEvalHepaBcoreantibodytotal.trim() == '' || EvalHepaBcoreantibodytotalDate == '') {
            showErrormessage("txtEvalHepaBcoreantibodytotal", "Please enter Hepatitis B core antibody total value and date or upload related file.", true);
            return;
        }

        let EvalHepaAantibodyDate = $("#txtEvalHepaAantibodydate").val();
        let txtEvalHepaAantibody = $('#txtEvalHepaAantibody').val();
        if (txtEvalHepaAantibody.trim() == '' || EvalHepaAantibodyDate == '') {
            showErrormessage("txtEvalHepaAantibody", "Please enter Hepatitis A antibody total value and date or upload related file.", true);
            return;
        }

        let EvalHIVantibodyDate = $("#txtEvalHIVantibodydate").val();

        let txtEvalHIVantibody = $('#txtEvalHIVantibody').val();
        if (txtEvalHIVantibody.trim() == '' || EvalHIVantibodyDate == '') {
            showErrormessage("txtEvalHIVantibody", "Please enter HIV antibody value and date or upload related file.", true);
            return;
        }

    }

    let EvalPlateletsfilel = checkEvalValues("divtxtEvalPlateletsfileupload");
    let EvalWBCfilel = checkEvalValues("divtxtEvalWBCfileupload");
    let filel = checkEvalValues("divtxtEvalPlateletsfileupload");
    let EvalHemoglobinfilel = checkEvalValues("divtxtEvalHemoglobinfileupload");
    let EvalASTfilel = checkEvalValues("divtxtEvalASTfileupload");
    let EvalALTfilel = checkEvalValues("divtxtEvalALTfileupload");
    let EvalBilirubinfilel = checkEvalValues("divtxtEvalBilirubinfileupload");
    let EvalAlbuminfilel = checkEvalValues("divtxtEvalAlbuminfileupload");
    let EvalINRfilel = checkEvalValues("divtxtEvalINRfileupload");
    let EvalSerumCrfilel = checkEvalValues("divtxtEvalSerumCrfileupload");
    let EvalSerumSodiumfilel = checkEvalValues("divtxtEvalSerumSodiumfileupload");


    let isAnyLabResultFileUploaded = EvalWBCfilel > 0 || EvalPlateletsfilel > 0 || EvalHemoglobinfilel > 0 || EvalASTfilel > 0 || EvalALTfilel > 0 || EvalBilirubinfilel > 0 || EvalAlbuminfilel > 0 || EvalINRfilel > 0 || EvalSerumCrfilel > 0 || EvalSerumSodiumfilel > 0;

    if (!isAnyLabResultFileUploaded) {
        let EvalWBCDate = $("#txtEvalWBCdate").val();
        let txtEvalWBC = $('#txtEvalWBC').val();
        if (txtEvalWBC.trim() == '' || EvalWBCDate == '') {
            showErrormessage("txtEvalWBC", 'Please enter WBC value and date or upload related file.', true);
            return;
        }

        let EvalPlateletsDate = $("#txtEvalPlateletsdate").val();
        let txtEvalPlatelets = $('#txtEvalPlatelets').val();
        if (txtEvalPlatelets.trim() == '' || EvalPlateletsDate == '') {
            showErrormessage("txtEvalPlatelets", 'Please enter Platelets value and date or upload related file.', true);
            return;
        }


        let EvalHemoglobinDate = $("#txtEvalHemoglobindate").val();
        let txtEvalHemoglobin = $('#txtEvalHemoglobin').val();
        if (txtEvalHemoglobin.trim() == '' || EvalHemoglobinDate == '') {
            showErrormessage("txtEvalHemoglobin", 'Please enter Hemoglobin value and date or upload related file.', true);
            return;
        }

        let EvalASTDate = $("#txtEvalASTdate").val();
        let txtEvalAST = $('#txtEvalAST').val();
        if (txtEvalAST.trim() == '' || EvalASTDate == '') {
            showErrormessage("txtEvalAST", 'Please enter AST value and date or upload related file.', true);
            return;
        }

        let EvalALTDate = $("#txtEvalALTdate").val();
        let txtEvalALT = $('#txtEvalALT').val();
        if (txtEvalALT.trim() == '' || EvalALTDate == '') {
            showErrormessage("txtEvalALT", 'Please enter ALT value and date or upload related file.', true);
            return;
        }

        let EvalBilirubinDate = $("#txtEvalBilirubindate").val();
        let txtEvalBilirubin = $('#txtEvalBilirubin').val();
        if (txtEvalBilirubin.trim() == '' || EvalBilirubinDate == '') {
            showErrormessage("txtEvalBilirubin", 'Please enter Bilirubin value and date or upload related file.', true);
            return;
        }

        let EvalAlbuminDate = $("#txtEvalAlbumindate").val();
        let txtEvalAlbumin = $('#txtEvalAlbumin').val();
        if (txtEvalAlbumin.trim() == '' || EvalAlbuminDate == '') {
            showErrormessage("txtEvalAlbumin", "Please enter Albumin value and date or upload related file.", true);
            return;
        }

        let EvalINRDate = $("#txtEvalINRdate").val();
        let txtEvalINR = $('#txtEvalINR').val();
        if (txtEvalINR.trim() == '' || EvalINRDate == '') {
            showErrormessage("txtEvalINR", "Please enter INR value and date or upload related file.", true);
            return;
        }

        let EvalSerumCrDate = $("#txtEvalSerumCrdate").val();
        let txtEvalSerumCr = $('#txtEvalSerumCr').val();
        if (txtEvalSerumCr.trim() == '' || EvalSerumCrDate == '') {
            showErrormessage("txtEvalSerumCr", "Please enter Serum Creatinine (SCr) value and date or upload related file.", true);
            return;
        }

        let EvalSerumSodiumDate = $("#txtEvalSerumSodiumdate").val();
        let txtEvalSerumSodium = $('#txtEvalSerumSodium').val();
        if (txtEvalSerumSodium.trim() == '' || EvalSerumSodiumDate == '') {
            showErrormessage("txtEvalSerumSodium", "Please enter Serum Sodium value and date or upload related file.", true);
            return;
        }
    }
    return true;
}

Template.screeningEvaulationTool.destroyed = function() {
    //$('#assessmentSearchOnSelection').dialog('destroy').remove();
};

Template.screeningEvaulationTool.helpers({
    'getGenotypeListEval': () => {
        //patientDetailsSearch.get(); 
        let genotypeList = [];
        let patientList = patientDetailsSearch.get();

        _.each(PatientsGenotypeList, (rec) => {
            let genoJson = {};
            genoJson.selected = patientList ? patientList.PATIENT_EVALUATIONGENOTYPE == rec ? 'selected' : '' : '';
            genoJson.name = rec;
            genotypeList.push(genoJson);
        });
        return genotypeList;
    },
    'getGenotypeListScreen': () => {
        //patientDetailsSearch.get(); 
        let genotypeList = [];
        let patientList = patientDetailsSearch.get();

        _.each(PatientsGenotypeList, (rec) => {
            let genoJson = {};
            genoJson.selected = patientList ? patientList.PATIENT_SCREENINGGENOTYPE == rec ? 'selected' : '' : '';
            genoJson.name = rec;
            genotypeList.push(genoJson);
        });
        return genotypeList;
    },
    'ScreeningPatient': () => [patientDetailsSearch.get()],
    'isPhysicianPlanExists': (data, param) => {

        /*  if (data === undefined && param === "Treatment") {
            $('#topnavigation').show();
            $('#topnavigationScreening').hide();
            return 'checked';
    } else*/
        if (data && data === param) {
            if (param == 'Treatment') {
                $('#topnavigation').show();
                $('#topnavigationScreening').hide();
            } else {
                $('#topnavigation').hide();
                $('#topnavigationScreening').show();
            }
            return 'checked';
        } else {
            return '';
        }


    },
    'isInsurancePlanExists': (insurance, param) => {
        /*  if (insurance === undefined && param === "Medicare") {
            return 'checked';
    } else*/
        if (insurance && insurance === param) {
            return 'checked';
        } else {
            return '';
        }
    },
    'checkIfYes': (data, param) => {
        if (data && data.replace(/\s/g, '').toLowerCase() === param.replace(/\s/g, '').toLowerCase()) {
            return 'checked';
        }
        // else if (data && data.replace(/\s/g, '').toLowerCase() === param.replace(/\s/g, '').toLowerCase()) {
        //     return 'checked';
        // }
        else {
            return ''
        }
    },
    'checkIfDiscontinued': (data, param) => {
        // console.log(data, param);
        if (data && data.indexOf(param) > -1) {
            return 'checked';
        } else {
            return ''
        }
    },
    'checkIfSelected': (data, param) => {
        // console.log(data, param);
        // if (data && data.replace(/\s/g, '').toLowerCase() == param.replace(/\s/g, '').toLowerCase()) {
        if (data && data.toLowerCase() == param.toLowerCase()) {
            return 'selected';
        }
        //  else if (data && data.replace(/\s/g, '').toLowerCase() == param.replace(/\s/g, '').toLowerCase()) {
        //     return 'selected';
        // } 
        else {
            return '';
        }
    },
    'checkIfSelectedOption': (data, param, id) => {
        if (data) {
            console.log(data);
            data = JSON.parse(data);
            let option = data.option;
            let value = data.value;
            if (option != 'others') {
                if (option && option.toLowerCase() == param.toLowerCase()) {
                    return 'selected';
                } else {
                    return '';
                }
            } else {
                if (option == param.toLowerCase()) {
                    $('#' + id).show();
                    return 'selected';
                } else {
                    $('#' + id).hide();
                }
            }
        } else {
            $('#' + id).hide();
            return '';
        }

    },
    'checkifOthersValue': (data) => {
        data = JSON.parse(data);
        if (data && data.option == 'others') {
            return data.value;
        } else {
            return '';
        }
    },
    'checkDateFormat': (date, type) => {
        if (date) {
            return moment(date).format("MM/DD/YYYY")
        } else {
            return '';
        }
        if (date && type == 'birthyear') {
            setAgeOfPatient(date);
        }
    },
    'checkIfFile': (param) => {
        if (param == 'Yes') {
            return `style="display:block;"`;
        } else {
            return `style="display:none;"`;
        }
    }
});

// Added click events by yuvraj 24 feb 2017
Template.screeningEvaulationTool.events({
    //Added By Jayesh 14th april 2017 Risk Factor section in both paths that will mark all the question NO (switch "No to All").
    'change #chkRiskFactorNoToAll': function(e) {
        if ($('#chkRiskFactorNoToAll:checked').val()) {
            $("#divDemograpchicRiskfactors input:radio[value='No']").prop('checked', 'checked');
        } else {
            $("#divDemograpchicRiskfactors input:radio").prop("checked", false);
        }
        hideMessages();
    },
    'change .FSV': function(e) {
        var item = 0;
        $(".FSV").each(function() {
            if (this.value !== "")
                item = item + 1;
        });
        if (item > 0) {
            $('.FSVlabel .asterik').hide();
            showErrormessage("FibrosisTestValues", "", false);
        } else {
            $('.FSVlabel .asterik').show();
        }
    },
    // 'click #divaccRiskFactors': function(e) {
    //     // console.log("test");
    //     // let patientID = $('#txtPatientId').val();
    //     // let birthYear = moment($('#patientBirthYear').val()).year();
    //     // let validation = birthYear < today.year() && birthYear >= 1900;
    //     // if (patientID == "") {
    //     //     showErrormessage("txtPatientId", 'Please enter patient ID!', true);
    //     //     return;
    //     // }
    //     // if (!validation) {
    //     //     showErrormessage("patientBirthYear", 'Please enter valid patient\'s date of birth !', true);
    //     //     return;
    //     // }
    //     // $("#divuiDemographics>div.active").removeClass("active");
    //     // $("#divaccRiskFactors").addClass("active");
    //     // $("#divaccRiskFactorscontent").addClass("active");
    // },
    'change #chkRiskFactorEvalNoToAll': function(e) {
        if ($('#chkRiskFactorEvalNoToAll:checked').val()) {
            cleardivEvalRiskFactors("#divEvalRiskFactors");
            $("#chkRiskFactorEvalNoToAll").prop("checked", true);
            $("#divEvalRiskFactors input:radio[value='No']").prop('checked', 'checked');
            $("#divTreatment input:radio").prop("checked", false);
            $("#divradiochartnote input:radio").prop("checked", false);
            $("#divEvalRiskFactors [id^=diverror]").hide();

        } else {
            $("#divEvalRiskFactors input:radio").prop("checked", false);
        }
    },
    'click .js-dialysis': function(e) {
        showErrormessage("txtEvalSerumCr", "", false);
        if ($('.js-dialysis:checked').val() == "Yes") {
            $("#txtEvalSerumCr").val("4.0");
            $("#txtEvalSerumCr").prop("disabled", true);
        } else {
            // $("#txtEvalSerumCr").val("");
            $("#txtEvalSerumCr").prop("disabled", false);
        }
        calculateMeld();
    },
    'click .editButton': function(e) {
        //console.log('edit');
        $("#screenPartI").find("input,checkbox,textarea,select").prop("disabled", false);
        $("#screenPartII").find("input,checkbox,textarea,select").prop("disabled", false);
        $("#screenPartIII").find("input,checkbox,textarea,select").prop("disabled", false);
        $("#screenPartIV").find("input,checkbox,textarea,select").prop("disabled", false);
        editdataRendered = true;
        dataRendered = false;
        $("#divPatientDetailsSearch").find("input,checkbox,textarea,select").prop("disabled", true);
    },
    // 'click .needhelp': function(e) {
    //     $("#txtproblem").val('');
    //     $("#divScreenHelp").dialog({
    //         dialogClass: 'containerDialog',
    //         minHeight: '100px',
    //         width: 'auto',
    //         close: function(event, ui) {
    //             $(this).dialog('close');
    //         },
    //         create: function(event, ui) {
    //             // Set maxWidth
    //             $(this).css("maxWidth", "660px");
    //         }
    //     });

    //     $('.submitproblem').on('click', function(e) {
    //         // console.log('submit problem called');
    //         var email = ['nisha@binaryrepublik.com', 'arvind.mepani@binaryrepublik.com'];
    //         var mailFields = {
    //             to: email,
    //             subject: 'Pinscriptive : PCP Model',
    //             type: 5, // For  sending out PCP problems
    //             problem: $("#txtproblem").val()
    //         };

    //         Meteor.call('sendEmail', mailFields, function(err, res) {
    //             console.log("Email send successfully");
    //             $("#divScreenHelp").dialog('close');
    //         });
    //     })

    // },
    // 'click .submitproblem': function(e) {

    // },
    'input #txtAPRIscore': function(e) {
        let val = $("#txtAPRIscore").val();
        $("#divmessageTreatmentEligible").empty();
        if (val.trim() != "") {
            if (patientDetails.plantype == "Medicaid") {
                if (parseFloat(val) >= 0.3)
                    $("#divmessageTreatmentEligible").html("This patient is meeting treatment criteria.");

            } else if (patientDetails.plantype == "Commercial") {
                if (parseFloat(val) >= 1.5)
                    $("#divmessageTreatmentEligible").html("This patient is meeting treatment criteria.");

            }

        }
    },
    'click .uploadButton': function(e) {
        // console.log(e);
        var itemid = e.currentTarget.id.replace("uploadButton", "#custom-upload");
        var mailitemid = $(itemid).parent().parent().attr('id');
        // console.log(mailitemid);
        let parentclass = $("#" + mailitemid).parent().parent().attr("class");
        // console.log(parentclass);

        if (parentclass === 'pcp-eval-hepa') {
            $('.pcp-eval-hepa [id^=diverror]').hide();
            $('.pcp-eval-hepa .asterik').hide();
        } else if (parentclass === 'pcp-eval-labresults') {
            $('.pcp-eval-labresults [id^=diverror]').hide();
            $('.pcp-eval-labresults .asterik').hide();
        }

    },
    'click .js-showDateApply': function(e) {
        // console.log(e);
        var itemid = currentdate;
        // console.log(itemid);
        let parentclass = $("#" + itemid).parent().parent().parent().parent().attr("class");
        // console.log(parentclass);

        let datev = formatDateMoment().setDate($("#" + itemid).val());
        if (parentclass === 'pcp-eval-hepa') {
            $('.pcp-eval-hepa .datefieldform').val($("#" + itemid).val());
        } else if (parentclass === 'pcp-eval-labresults') {
            $('.pcp-eval-labresults .datefieldform').val($("#" + itemid).val());
        }

    },
    // 'click .deleteUploadedFile': function(e) {
    //     console.log('deleteUploadedFile');
    //     var itemid = e.currentTarget.id.replace("deleteUploadedFile", "#custom-upload");
    //     var mailitemid = $(itemid).parent().parent().attr('id');
    //     console.log(mailitemid);
    //     let parentclass = $("#" + mailitemid).parent().parent().attr("class");
    //     console.log(parentclass);

    //      if (parentclass === 'pcp-eval-hepa') { 
    //          if ($('.pcp-eval-hepa li').length <=0 )           
    //         $('.pcp-eval-hepa .asterik').show();
    //     } else if (parentclass === 'pcp-eval-labresults') {
    //           if ($('.pcp-eval-labresults li').length <=0 ) 
    //         $('.pcp-eval-labresults .asterik').show();
    //     }

    // },
    'click .js-treatmentPlanType': function(e) {
        showErrormessage("treatmentPlanType", '', false);
        // hideValidationMessage();
        // hideResultMessage();
        // if ($('#patientBirthYear').val()) {
        //     updatePatientScreenIData(patientDetails, false);
        // }
    },
    'input .calcMeld': function(e) {
        calculateMeld();
    },
    'click .successmessage_closebtn': function(e) {
        $('.formReviewPopup').show();
    },
    'click .successmessage_closebtnNegative': function() {
        $('.successmessagePopupFeedbackNegative').hide();
    },
    'click .submitFormReview': function(e) {
        let value = $(e.currentTarget).attr('data');
        let time = moment(new Date()).format("YYYY-MM-DD");
        let emailId = Meteor.user().emails[0].address;
        let textData = $('#txtfeedback').val();
        // Meteor.call('saveFeedackElectronicForm', {
        //     'feedback': value,
        //     'time': time,
        //     'email': emailId,
        //     'suggestion': textData
        // }, function(error, result) {
        //     if (error) {
        //         console.log('error submitting result');
        //         $('.formReviewPopup').hide();
        //         $('.successmessagePopup').hide();
        //         $('.successmessagePopupFeedbackNegative').hide();
        //     } else {
        //         showSAlertSuccess('Thank You for your Feedback');
        //         $('.successmessagePopupFeedbackNegative').hide();
        //         $('.negativeFeedbackForm').hide();
        //         $('.formReviewPopup-container').hide();
        //         setTimeout(()=>{
        //             $('.formReviewPopup').hide();
        //             $('.successmessagePopup').hide();
        //             Router.current().render(Template.dummyScreeningEvalationTool);
        //             Router.current().render(Template.screeningEvaulationTool);
        //         },100);
        //     }
        // });
        $('.submitfeedback').attr('data', value);
        $('.negativeFeedbackForm').show();
    },
    'input #txtfeedback': function(e) {
        let txt = $('#txtfeedback').val();
        if (txt != '') {
            $('.submitfeedback').show();
        } else {
            $('.submitfeedback').hide();
        }
    },
    'click .submitfeedback': function(e) {
        let value = $(e.currentTarget).attr('data');
        let time = moment(new Date()).format("YYYY-MM-DD");
        let emailId = Meteor.user().emails[0].address;
        let textData = $('#txtfeedback').val();
        Meteor.call('saveFeedackElectronicForm', {
            'feedback': value,
            'time': time,
            'email': emailId,
            'suggestion': textData
        }, function(error, result) {
            if (error) {
                console.log('error submitting result');
                $('.formReviewPopup').hide();
                $('.successmessagePopup').hide();
                $('.successmessagePopupFeedbackNegative').hide();
            } else {
                showSAlertSuccess('Thank You for your Feedback');
                $('.successmessagePopupFeedbackNegative').hide();
                $('.negativeFeedbackForm').hide();
                $('.formReviewPopup-container').hide();
                setTimeout(() => {
                    $('.formReviewPopup').hide();
                    $('.successmessagePopup').hide();
                    Router.current().render(Template.dummyScreeningEvalationTool);
                    Router.current().render(Template.screeningEvaulationTool);
                }, 100);
            }
        });
    },
    'click .successmessage_closebtnform': function(e) {
        patientDetailsSearch.set({});
        Router.current().render(Template.dummyScreeningEvalationTool);
        Router.current().render(Template.screeningEvaulationTool);
    },
    'click .print': function(e) {
        //Get the HTML of div
        var divElements = $("#upperSummaryDemographics").html();
        //   var divElements = generatePrintHTML();

        var mywindow = window.open('', '_blank', 'height=400,width=600');
        mywindow.document.write('<html><head> ' + $("head").html());
        mywindow.document.write(getStyleForPrint());
        mywindow.document.write('</head><body onload="window.print();window.close();">');

        mywindow.document.write(divElements);
        mywindow.document.write('</body></html>');

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/
    },
    'click .js-treatmentexperienced': function(e) {
        showErrormessage("TreatmentExperienced", "", false);
        let val = checkInputvalues("treatmentexperienced");

        if (val == 'Yes') {
            $('#divTreatment').show();
        } else {
            $('#divTreatment').hide();
            // removeSelectedRadio('#divTreatment');
            // $('#txtlisttreatmentregimen').val('');
            // $('#txtreasondiscontinue').val('');
            clearTreatmentDetails("#divTreatment");
        }
    },
    'click .js-NS5A': function(e) {
        let val = checkInputvalues("NS5A");

        if (val == 'Yes') {
            $('#divNA5details').show();
        } else {
            $('#divNA5details').hide();
            $('#txtEvalNS5Apolymorphisms').val('');
            $('#txtEvalNS5Apolymorphismsdate').val('');
        }
    },
    'click .js-completeregimen': function(e) {
        let val = checkInputvalues("completeregimen");

        if (val == 'No') {
            $('#divreasondiscontinue').show();
        } else {
            $('#divreasondiscontinue').hide();
            $('#txtreasondiscontinue').val('');
        }
    },
    // added by Yuvraj 
    'input #txtFibroscanScore': function(e) {
        let val = $('#txtFibroscanScore').val();
        if (val == 'others') {
            $('#txtFibroscanScoreOthers').show();
        } else {
            $('#txtFibroscanScoreOthers').hide();
        }
    },
    // added by Yuvraj 
    'input #txtFibrosistestScore': function(e) {
        let val = $('#txtFibrosistestScore').val();
        if (val == 'others') {
            $('#txtFibrosistestScoreOthers').show();
        } else {
            $('#txtFibrosistestScoreOthers').hide();
        }
    },
    // added by Yuvraj 
    'input #txtFibroMeterscore': function(e) {
        let val = $('#txtFibroMeterscore').val();
        if (val == 'others') {
            $('#txtFibroMeterscoreOthers').show();
        } else {
            $('#txtFibroMeterscoreOthers').hide();
        }
    },
    // added by Yuvraj 
    'input #txtAPRIscore': function(e) {
        let val = $('#txtAPRIscore').val();
        if (val == 'others') {
            $('#txtAPRIscoreOthers').show();
        } else {
            $('#txtAPRIscoreOthers').hide();
        }
    },

    // added by Yuvraj 
    // 'input #txtChildPughscore': function(e) {
    //     let val = $('#txtChildPughscore').val();
    //     if (val == 'others') {
    //         $('#txtChildPughscoreOthers').show();
    //     } else {
    //         $('#txtChildPughscoreOthers').hide();
    //     }
    // },
    // added by Yuvraj 
    // 'input #txtMELDscore': function(e) {
    //     let val = $('#txtMELDscore').val();
    //     if (val == 'others') {
    //         $('#txtMELDscoreOthers').show();
    //     } else {
    //         $('#txtMELDscoreOthers').hide();
    //     }
    // },

    'input .Fibroscan': function(e) {
        // yuvraj 24-04-2017
        let txtFibroscanScore = $('#txtFibroscanScore').val();


        // ending 
        let txtFibrosistestScore = $('#txtFibrosistestScore').val();
        let txtAPRIscore = $('#txtAPRIscore').val();
        let txtFibroMeterscore = $('#txtFibroMeterscore').val();
        let messEvalutionrequiresSpecialist = $('#divEvalutionrequiresSpecialist').text().trim();
        if (txtFibroscanScore.trim() == '' && txtFibrosistestScore.trim() == '' && txtAPRIscore.trim() == '' && txtFibroMeterscore.trim() == '') {
            showErrormessage("FibrosisTestValues", "Please enter the Fibrosis test values.", true);
        } else
            showErrormessage("FibrosisTestValues", "", false);
    },
    // 'input .pcscreening': function(e) {
    //     if ($('#diverrorPCScreening:visible').length > 0) {
    //         if ($('input[name=chkPCScreening]:checked').length == 0 || $("#txtPCScreeningName").val().trim() == "" || $("#txtPCScreeningDate").val().trim() == "")
    //             showErrormessage("PCScreening", "Please check the acknowledgement checkbox, enter the Physician Name and Date for certifying this form.", true);
    //         else
    //             showErrormessage("PCScreening", "", false);
    //     }
    // },
    'input #txtPatientId': function(e) {
        let val = $('#txtPatientId').val();
        if (val.trim() !== '')
            showErrormessage("txtPatientId", '', false);
        else
            showErrormessage("txtPatientId", 'Please enter patient ID!', true);
    },
    // 'input .pctreatment': function(e) {
    //     if ($('#diverrorPCTreatment:visible').length > 0) {
    //         if ($('input[name=chkPCTreatment]:checked').length == 0 || $("#txtPCTreatmentName").val().trim() == "" || $("#txtPCTreatmentDate").val().trim() == "")
    //             showErrormessage("PCTreatment", "Please check the acknowledgement checkbox, enter the Physician Name and Date for certifying this form.", true);
    //         else
    //             showErrormessage("PCTreatment", "", false);
    //     }
    // },
    // 'change #chkPCTreatment': function(e) {
    //     // if ($('#diverrorPCTreatment:visible').length > 0) {
    //     if ($('input[name=chkPCTreatment]:checked').length == 0 || $("#txtPCTreatmentName").val().trim() == "" || $("#txtPCTreatmentDate").val().trim() == "")
    //         showErrormessage("PCTreatment", "Please check the acknowledgement checkbox, enter the Physician Name and Date for certifying this form.", true);
    //     else
    //         showErrormessage("PCTreatment", "", false);
    //     // }
    // },
    // 'change #chkPCScreening': function(e) {
    //     // if ($('#diverrorPCScreening:visible').length > 0) {
    //     if ($('input[name=chkPCScreening]:checked').length == 0 || $("#txtPCScreeningName").val().trim() == "" || $("#txtPCScreeningDate").val().trim() == "")
    //         showErrormessage("PCScreening", "Please check the acknowledgement checkbox, enter the Physician Name and Date for certifying this form.", true);
    //     else
    //         showErrormessage("PCScreening", "", false);
    //     // }
    // },
    'input .HCVRNAEVAL': function(e) {
        let txtHcvRnaTestResult = $('#txtHcvRnaTestResultEval').val();
        let ddlgenotype = $('#ddlgenotypeEval').val();
        let HcvRnaTestResultDate = $('#txtHcvRnaTestResultDateEval').val();
        showErrormessage("HcvRnaTestEvaluation", "", false);
        //  && HcvRnaTestResultDate === ''
        if (txtHcvRnaTestResult === '' && ddlgenotype === '')
            showErrormessage("HcvRnaTestEvaluation", "Please send the patient for HCV RNA test.", true);
        // if (txtHcvRnaTestResult === '') {
        //     showErrormessage("HcvRnaTestEvaluation", 'Please enter Hepatitis C Antibody test Result!', true);
        //     return;
        // }
        // if (ddlgenotype === null) {
        //     showErrormessage("HcvRnaTestEvaluation", 'Please select valid genotype for Hepatitis C diagnosis!', true);
        //     return;
        // }
        // if (HcvRnaTestResultDate === '') {
        //     showErrormessage("HcvRnaTestEvaluation", 'Please enter HCV RNA lab test date!', true);
        //     return;
        // }
    },
    'change .qvalue': function(e) {
        // console.log(e.currentTarget.id);
        if (e.currentTarget.value.trim() != "")
            showErrormessage(e.currentTarget.id, "", false);
    },
    'input .qvaluehepab': function(e) {
        let EvalHepaBantigen = $("#txtEvalHepaBantibody").val();
        let EvalHepaBantigenDate = $("#txtEvalHepaBantibodydate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalHepaBantibody", "", false);
    },
    'input .qvaluehepabsantigen': function(e) {
        let EvalHepaBantigen = $("#txtEvalHepaBantigen").val();
        let EvalHepaBantigenDate = $("#txtEvalHepaBantigendate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalHepaBantigen", "", false);
    },
    'input .qvaluehepab': function(e) {
        let EvalHepaBantigen = $("#txtEvalHepaBantibody").val();
        let EvalHepaBantigenDate = $("#txtEvalHepaBantibodydate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalHepaBantibody", "", false);
    },
    'input .qvaluehepabcore': function(e) {
        let EvalHepaBantigen = $("#txtEvalHepaBcoreantibodytotal").val();
        let EvalHepaBantigenDate = $("#txtEvalHepaBcoreantibodytotaldate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalHepaBcoreantibodytotal", "", false);
    },
    'input .qvaluehepaaantibody': function(e) {
        let EvalHepaBantigen = $("#txtEvalHepaAantibody").val();
        let EvalHepaBantigenDate = $("#txtEvalHepaAantibodydate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalHepaAantibody", "", false);
    },
    'input .qvaluehivantibody': function(e) {
        let EvalHepaBantigen = $("#txtEvalHIVantibody").val();
        let EvalHepaBantigenDate = $("#txtEvalHIVantibodydate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalHIVantibody", "", false);
    },
    'input .qvaluewbc': function(e) {
        let EvalHepaBantigen = $("#txtEvalWBC").val();
        let EvalHepaBantigenDate = $("#txtEvalWBCdate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalWBC", "", false);
    },
    'input .qvalueplatellet': function(e) {
        let EvalHepaBantigen = $("#txtEvalPlatelets").val();
        let EvalHepaBantigenDate = $("#txtEvalPlateletsdate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalPlatelets", "", false);
    },
    'input .qvaluehemoglobin': function(e) {
        let EvalHepaBantigen = $("#txtEvalHemoglobin").val();
        let EvalHepaBantigenDate = $("#txtEvalHemoglobindate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalHemoglobin", "", false);
    },
    'input .qvalueast': function(e) {
        let EvalHepaBantigen = $("#txtEvalAST").val();
        let EvalHepaBantigenDate = $("#txtEvalASTdate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalAST", "", false);
    },
    'input .qvaluealt': function(e) {
        let EvalHepaBantigen = $("#txtEvalALT").val();
        let EvalHepaBantigenDate = $("#txtEvalALTdate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalALT", "", false);
    },
    'input .qvaluebilirubin': function(e) {
        let EvalHepaBantigen = $("#txtEvalBilirubin").val();
        let EvalHepaBantigenDate = $("#txtEvalBilirubindate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalBilirubin", "", false);
    },
    'input .qvaluealbumin': function(e) {
        let EvalHepaBantigen = $("#txtEvalAlbumin").val();
        let EvalHepaBantigenDate = $("#txtEvalAlbumindate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalAlbumin", "", false);
    },
    'input .qvalueINR': function(e) {
        let EvalHepaBantigen = $("#txtEvalINR").val();
        let EvalHepaBantigenDate = $("#txtEvalINRdate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalINR", "", false);
    },
    'input .qvalueSCr': function(e) {
        let EvalHepaBantigen = $("#txtEvalSerumCr").val();
        let EvalHepaBantigenDate = $("#txtEvalSerumCrdate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalSerumCr", "", false);
    },
    'input .qvalueSSodium': function(e) {
        let EvalHepaBantigen = $("#txtEvalSerumSodium").val();
        let EvalHepaBantigenDate = $("#txtEvalSerumSodiumdate").val();
        if (EvalHepaBantigen.trim() !== '' && EvalHepaBantigenDate !== '')
            showErrormessage("txtEvalSerumSodium", "", false);
    },
    'click .labsfiles': function(e) {
        // console.log(e.currentTarget.id);
        var id = e.currentTarget.id.replace("paperclip", "");
        var divid = "div" + id + "fileupload";
        if ($(e.currentTarget).hasClass('labsfilesclass') == true) {
            $("#" + divid).hide();
            $(e.currentTarget).removeClass('labsfilesclass');
        } else {
            $(e.currentTarget).addClass('labsfilesclass');
            $("#" + divid).show();
        }
    },
    'input #txtChildPughscore': function(e) {
        let txtChildPughscore = $('#txtChildPughscore').val();
        if (txtChildPughscore.trim() != "")
            showErrormessage("CirrhosisTestValues", "", false);

        // added by Yuvraj
        if (txtChildPughscore == 'others') {
            $('#txtChildPughscoreOthers').show();
        } else {
            $('#txtChildPughscoreOthers').hide();
        }
    },
    'input #txtMELDscore': function(e) {
        let txtMELDscore = $('#txtMELDscore').val();
        if (txtMELDscore.trim() != "")
            showErrormessage("CirrhosisTestValues", "", false);

        // added by Yuvraj 
        if (txtMELDscore == 'others') {
            $('#txtMELDscoreOthers').show();
        } else {
            $('#txtMELDscoreOthers').hide();
        }
    },
    /*  'input #txtFibroscanScore': function(e) {
        let txtFibroscanScore = $('#txtFibroscanScore').val();
        if (txtFibroscanScore.trim() != "")
            showErrormessage("FibrosisTestValues", "", false);

    },
    'input #txtFibrosistestScore': function(e) {
        let txtFibrosistestScore = $('#txtFibrosistestScore').val();
        if (txtFibrosistestScore.trim() != "")
            showErrormessage("txtFibrosistestScore", "", false);

    },
    'input #txtFibroMeterscore': function(e) {
        let txtFibroMeterscore = $('#txtFibroMeterscore').val();
        if (txtFibroMeterscore.trim() != "")
            showErrormessage("txtFibroMeterscore", "", false);

    },
    'input #txtAPRIscore': function(e) {
        let txtAPRIscore = $('#txtAPRIscore').val();
        if (txtAPRIscore.trim() != "")
            showErrormessage("txtAPRIscore", "", false);

},*/
    'input #txtEvalALTUpperLimit': function(e) {
        let txtEvalALTUpperLimit = $('#txtEvalALTUpperLimit').val();
        if (txtEvalALTUpperLimit.trim() != "")
            showErrormessage("txtALT", "", false);
    },
    'input #txtEvalALTLowerLimit': function(e) {
        let txtEvalALTLowerLimit = $('#txtEvalALTLowerLimit').val();
        if (txtEvalALTLowerLimit.trim() != "")
            showErrormessage("txtALT", "", false);
    },
    'input #txtEvalASTUpperLimit': function(e) {
        let txtEvalASTUpperLimit = $('#txtEvalASTUpperLimit').val();
        if (txtEvalASTUpperLimit.trim() != "")
            showErrormessage("txtAST", "", false);
    },
    'input #txtEvalASTLowerLimit': function(e) {
        let txtEvalASTLowerLimit = $('#txtEvalASTLowerLimit').val();
        if (txtEvalASTLowerLimit.trim() != "")
            showErrormessage("txtAST", "", false);
    },
    'input #txtHcvRnaTestResult': function(e) {
        let txtHcvRnaTestResult = $('#txtHcvRnaTestResult').val();
        if (txtHcvRnaTestResult.trim() != "")
            showErrormessage("HCVAntiBodyResultQue", "", false);
    },
    'input #txtHcvRnaTestResultDate': function(e) {
        let txtHcvRnaTestResultDate = $('#txtHcvRnaTestResultDate').val();
        if (txtHcvRnaTestResultDate.trim() != "")
            showErrormessage("HCVAntiBodyResultQue", "", false);
    },
    'change #ddlgenotype': function(e) {
        let ddlgenotype = $('#ddlgenotype').val();
        if (ddlgenotype != '')
            showErrormessage("HCVAntiBodyResultQue", "", false);
    },
    'input .js-birthYear': function(e) {
        hideValidationMessage();
        hideResultMessage();
        // console.log('birtyear'+moment($('#patientBirthYear').val()).year());
        let birthYear = moment($('#patientBirthYear').val()).year();
        if (birthYear.toString().length == 4) {
            // parseInt($('#patientBirthYear').val());
            if (birthYear <= 1965 && birthYear >= 1945) {
                // showResultMessageDemographics('Hepatitis C testing is recommended.');
                // $(e.currentTarget).parent().siblings('#ResultMsgContainerDemographics').children().find('.DemographicsResultMsgContent').html('Hepatitis C testing is recommended.');
                // $(e.currentTarget).parent().siblings('#ResultMsgContainerDemographics').show();
                showRecommendationMessage("patientBirthYear", 'Hepatitis C testing is recommended.', true);
            } else {
                // $(e.currentTarget).parent().siblings('#ResultMsgContainerDemographics').hide();
                showRecommendationMessage("patientBirthYear", '', false);
            }

        }

        // if (e.currentTarget.value.length == 4) {
        //     updatePatientScreenIData(patientDetails, false);
        // } else if (e.currentTarget.value.length == 0) {
        //     // $('#divIntravenousDrugPatient').hide();
        // }
    },
    'click .js-HepaCPatient': function(e) {
        if (patientDetails.HepaCPatient) {
            patientDetails.prevHepaCPatient = patientDetails.HepaCPatient;
        }
        // let val = $('input[name=HepaCPatient]:checked').val();
        // if (val == 'Yes') {

        // } else {

        // }
    },
    'click .js-alchoholScreeningTest': function(e) {
        let val = checkInputvalues("alchoholScreeningTest");

        if (val == 'Yes') {
            $('#divAlcoholSceeningfileupload').show();
        } else {
            $('#divAlcoholSceeningfileupload').hide();
            GlobaldeleteAllfile($("#divAlcoholSceeningfileupload .customUploadControlId").html().trim());
        }
    },
    'click .demographics': function(e) {
        let val = checkInputvalues("demographics");

        let valHepaCPatient = checkInputvalues("HepaCPatient");

        let valPhysicianPlan = checkInputvalues("PhysicianPlan");

        let birthYear = moment($('#patientBirthYear').val()).year(); // parseInt($('#patientBirthYear').val());

        if (e.currentTarget.name == "HepaCPatient" && valHepaCPatient == 'Yes' && valPhysicianPlan == 'Treatment') {
            // showResultMessageDemographics('Please move right on to Evaluation Module.');
            // showRecommendationMessage("HepaCPatient", 'Please move right on to Evaluation Module.', true);
            hideValidationMessage();
            return;
        }
        //  else {
        // showRecommendationMessage("HepaCPatient", '', false);
        // if any of the value is Yes then show the message else not
        let selections = checkDemographicsSelectedValues();
        //console.log(e.currentTarget.name);
        if (selections.length > 0 || (birthYear <= 1965 && birthYear >= 1945)) {
            hideMessagesWithValidation();
            if (e.currentTarget.defaultValue == "Yes") {
                $("#chkRiskFactorNoToAll").prop("checked", false);
                showRecommendationMessage(e.currentTarget.name, 'Hepatitis C testing is recommended.', true);
            } else {
                showRecommendationMessage(e.currentTarget.name, '', false);
            }
            hideValidationMessage();
        } else {
            hideResultMessageDemographics();
            hideMessages();
            showRecommendationMessage(e.currentTarget.name, '', false);
            hideValidationMessage();
        }
        // }
    },
    'click .requiresSpecialist': function(e) {
        if (e.currentTarget.defaultValue == "Yes") {
            $("#chkRiskFactorEvalNoToAll").prop("checked", false);

        }
        // MessageEvaluation();
        // let selections = checkEvaluationSpecialistRequiredSelectedValues();
        // let selectionsNames = checkEvaluationSpecialistRequiredSelectedNames();
        // let disease, diseasenames = "";
        // let tlength = selectionsNames.length;
        // //console.log(tlength);
        // if (tlength > 1) {
        //     for (i = 0; i < selectionsNames.length; i++) {
        //         disease += selectionsNames[i] + ",";
        //     }
        //     // console.log(disease);
        //     pos = disease.lastIndexOf(",");
        //     disease = disease.substring(0, pos);

        //     diseasenames = replace_last_comma_with_and(disease);
        //     diseasenames = diseasenames.replace("undefined", "");
        //     //console.log(diseasenames);
        // } else
        //     diseasenames = selectionsNames[0];

        // if (selections.length > 0) {
        //     $("#lblEvalutionrequiresSpecialist").html('This Patient needs to be referred to specialists for ' + diseasenames + '.');
        //     $("#divEvalutionrequiresSpecialist").show();

        // } else {
        //     $("#lblEvalutionrequiresSpecialist").html('');
        //     $("#divEvalutionrequiresSpecialist").hide();
        // }
    },
    // 'click .requiresSpecialistduringTreatment': function(e) {
    //     let selections = checkEvaluationSpecialistRequiredDuringTreatmentSelectedValues();
    //     if (selections.length > 0) {
    //         $("#lblEvalutionrequiresSpecialistduringTreatment").html('This high risk patients require a specialists consultation during Treament.');
    //         $("#divEvalutionrequiresSpecialistduringTreatment").show();

    //     } else {
    //         $("#lblEvalutionrequiresSpecialistduringTreatment").html('');
    //         $("#divEvalutionrequiresSpecialistduringTreatment").hide();
    //     }
    // },
    'click .js-antibodyTest': function(e) {
        showErrormessage("antibodyTest", '', false);
        let val = checkInputvalues("antibodyTest");

        if (val == 'Yes') {
            $('#divHCVAntiBodyResultQue').show();
            hideResultMessage();
            hideValidationMessage();
            $('input[name=antibodyPatientTest]').removeAttr("disabled");
        } else {
            $('#divHCVAntiBodyResultQue').hide();
            hideResultMessage();
            showRecommendationMessageScreening("antibodyTest", 'Please send patient to have blood drawn for hepatitis C antibody.', true);
            showRecommendationMessageScreening("antibodyPatientTest", "", false);
            showRecommendationMessageScreening("HCVAntiBodyResultQue", "", false);
            $('#txtHcvRnaTestResult').val('');
            $("#ddlgenotype").val("");
            $("#txtHcvRnaTestResultDate").val("");
            removeSelectedRadio('#divHCVAntiBodyResultQue');
            $('input[name=antibodyPatientTest]').attr("disabled", "disabled");
        }
    },
    'click .js-HcvRnaTest': function(e) {
        // console.log('js-RNATest');
        /*  let val = $('input[name=HcvRnaTest]:checked').val();
        // console.log(val);
        if (val == 'Yes') {
            $('#divquantitativeHcvRnaTest').show();

            $('#divseriousdeseasesTest').show();
            if (patientDetails.plantype === "Medicaid") {
                $('#divseriousdeseasesMediHIV1CoMedicaidTest').show();
                $('#divdecompensatedcirrhosisTest').show();
            } else if (patientDetails.plantype === "Commercial") {
                $('#divalchoholTest').show();
                $('#divprescribedTest').show();
                $('#divCommChildPughTest').show();
            }
        } else {
            $('#divquantitativeHcvRnaTest').hide();
            $('#divalchoholTest').hide();
            $('#divprescribedTest').hide();
            $('#divseriousdeseasesTest').hide();
            $('#divseriousdeseasesMediHIV1CoMedicaidTest').hide();
            $('#divdecompensatedcirrhosisTest').hide();
            $('#divCommChildPughTest').hide();
            $('#divHcvRnaTestResult').hide();
            removeSelectedRadio('#divquantitativeHcvRnaTest');
            removeSelectedRadio('#divalchoholTest');
            removeSelectedRadio('#divprescribedTest');
            removeSelectedRadio('#divseriousdeseasesTest');
            removeSelectedRadio('#divseriousdeseasesMediHIV1CoMedicaidTest');
            removeSelectedRadio('#divdecompensatedcirrhosisTest');
            removeSelectedRadio('#divCommChildPughTest');
            $('#txtHcvRnaTestResultDate').val('');
            $('#txtHcvRnaTestResult').val('');
        }
        hideValidationMessage();
hideResultMessage();*/
    },
    'click .js-quantitativeHcvRnaTest': function(e) {
        // console.log('js-RNATest');
        let val = checkInputvalues("quantitativeHcvRnaTest");

        // console.log(val);
        if (val == 'Yes') {
            $('#divHcvRnaTestResult').show();
            // $('#divalchoholTest').show();
        } else {
            $('#divHcvRnaTestResult').hide();
            $('#txtHcvRnaTestResultDate').val('');
            $('#txtHcvRnaTestResult').val('');
            // $('#divalchoholTest').hide();
            // $('#divprescribedTest').hide();
            // $('#divseriousdeseasesTest').hide();
            // removeSelectedRadio('#divalchoholTest');
            // removeSelectedRadio('#divprescribedTest');
            // removeSelectedRadio('#divseriousdeseasesTest');
        }
        hideValidationMessage();
        hideResultMessage();
    },
    'click .js-PhysicianPlan': function(e) {
        let val = checkInputvalues("PhysicianPlan");

        // console.log(val);
        if (val == 'Treatment') {
            $('#divpatienthisincarc').hide();
            $('#topnavigation').show();
            $('#topnavigationScreening').hide();
            // $("#psNavigation").text('Patient Treatment');
            //Added By Jayesh 14th april 2017 Treatment Path - Demographics page - make items E, C and G mandatory.
            $(".treatmentPathMandatory").show();
            // highLightTab('Patient Treatment');
        } else {
            $('#divpatienthisincarc').show();
            $('#topnavigation').hide();
            $('#topnavigationScreening').show();
            //Added By Jayesh 14th april 2017 Treatment Path - Demographics page - make items E, C and G mandatory.
            $(".treatmentPathMandatory").hide();
            // $("#psNavigation").text('Primary Care');
            //  highLightTab('Primary Care');
        }
        hideValidationMessage();
        hideResultMessage();
        let valHepaCPatient = checkInputvalues("HepaCPatient");

        let birthYear = moment($('#patientBirthYear').val()).year();
        if (valHepaCPatient == 'Yes' && val == 'Treatment') {
            // showRecommendationMessage("HepaCPatient", 'Please move right on to Evaluation Module.', true);
            hideValidationMessage();
        } else if (valHepaCPatient == 'Yes' && val == 'Screening') {
            showRecommendationMessage("HepaCPatient", 'Hepatitis C testing is recommended.', true);
            hideValidationMessage();
        } else {
            showRecommendationMessage("HepaCPatient", '', false);
            // if any of the value is Yes then show the message else not
            let selections = checkDemographicsSelectedValues();
            if (selections.length > 0 || (birthYear <= 1965 && birthYear >= 1945)) {
                // showResultMessageDemographics('Hepatitis C testing is recommended.');
                // showResultMessageDemographics_new(e, 'Hepatitis C testing is recommended.');
                showRecommendationMessage(e.currentTarget.name, 'Hepatitis C testing is recommended.', true);
                hideValidationMessage();
            } else {
                hideResultMessageDemographics();
                // hideResultMessageDemographics_new(e);
                showRecommendationMessage(e.currentTarget.name, '', false);
                hideValidationMessage();
            }
        }

    },
    'change .js-alchoholTest': function(e) {
        let val = checkInputvalues("alcoholTest");

        if (val !== 'Previously Stopped') {
            $("#txtalchoholStoppedperiod").val('');
            $("#txtalchoholStopped").val('');
        }
    },
    'click .js-prescribedTest': function(e) {
        // let val = $('input[name=prescribedTest]:checked').val();
        // if (val == 'Yes') {
        //     // $('#divHCVAntiBodyResult').show();
        //     $('#divseriousdeseasesTest').show();
        // } else {
        //     $('#divseriousdeseasesTest').hide();
        //     removeSelectedRadio('#divseriousdeseasesTest');
        // }
        hideValidationMessage();
        hideResultMessage();
    },
    'click .js-antibodyPatientTest': function(e) {
        let val = checkInputvalues("antibodyPatientTest");

        var PhysicianPlan = $('input[name=PhysicianPlan]:checked').val();
        showRecommendationMessage("HCVAntiBodyResultQue", "", false);
        showRecommendationMessage("antibodyPatientTest", "", false);
        // removeCertificationDetails("#divPhysicianCertificationScreening");
        if (val == 'Positive') {
            if (patientDetails.PhysicianPlan != 'Treatment') {
                // $("#divPhysicianCertificationScreening").show();
                $("#divViewSummary").show();
                $("#divsummarttitle").attr('title', "Screening Summary");

            } else {
                // $("#divPhysicianCertificationScreening").hide();
                $("#divViewSummary").hide();
            }
            $('.divHCVAntiBodyResultQue').show();
            hideValidationMessage();
            hideResultMessage();
            ShowHideSubmitScreen2();
        } else {
            showRecommendationMessageScreening("antibodyPatientTest", "Primary Care done successfully. Patient with Negative Hepatitis C Antibody test result need not be revisited.", true);
            $('.divHCVAntiBodyResultQue').hide();
            showRecommendationMessageScreening("HCVAntiBodyResultQue", "Primary Care done successfully. Patient with Negative Hepatitis C Antibody test result need not be revisited.", true);
            // showValidationMessageS2('Primary Care done successfully. Patient with Negative Hepatitis C Antibody test result need not be revisited.');
            // $('#divPhysicianCertificationScreening').show();
            $("#divViewSummary").show();
            $("#divsummarttitle").attr('title', "Screening Summary");
            $('#btnScreeningPartII').hide();
            $('#btnScreeningPartIISubmit').show();

            removeSelectedRadio('#divHCVAntiBodyResult');
            $('#txtHcvRnaTestResult').val('');
            $("#ddlgenotype").val("");
            $("#txtHcvRnaTestResultDate").val("");
            hideResultMessage();
        }
        // hideValidationMessage();

        // let val = $('input[name=antibodyPatientTest]:checked').val();
        // if (val == 'Reactive') {
        //     $('#divHcvRnaTest').show();
        // } else {
        //     $('#divHcvRnaTest').hide();
        //     $('#divHcvRnaTestResult').hide();
        // }
        // hideValidationMessage();
        // hideResultMessage();
        // $('input[name=HcvRnaTest]:radio').prop("checked", false);
        // //$('input[name=HcvRnaTestResult]:radio').prop("checked", false);
        // $('#txtHcvRnaTestResultDate').val('');
        // $('#txtHcvRnaTestResult').val('');
    },
    'click #btnScreeningPartIISubmit': function(e) {
        SubmitPatientScreenIIData(patientDetails);
    },
    'click .analyticsCommonPopupOptionsButton': function(e) {
        let valantibodyPatientTest = checkInputvalues("antibodyPatientTest");

        if (valantibodyPatientTest == "Negative") {
            SetSummaryDetails(patientDetails, "screening");
            $("#patientSummaryPopup").modal('show');
        } else {
            var PhysicianPlan = checkInputvalues("PhysicianPlan");

            if (patientDetails.PhysicianPlan == 'Treatment')
                SetSummaryDetails(patientDetails, "treatment");
            else
                SetSummaryDetails(patientDetails, "screening");
            $("#patientSummaryPopup").modal('show');
        }
    },
    'click .js-antibodyPatTestResult': function(e) {
        let val = checkInputvalues("antibodyPatTestResult");

        if (val == 'Reactive') {
            $('#divHcvRnaTest').show();
        } else {
            $('#divHcvRnaTest').hide();
            $('#divquantitativeHcvRnaTest').hide();
            $('#divHcvRnaTestResult').hide();
            removeSelectedRadio('#divHcvRnaTest');
            removeSelectedRadio('#divquantitativeHcvRnaTest');
            removeSelectedRadio('#divHcvRnaTestResult');
            $('#txtHcvRnaTestResultDate').val('');
            $('#txtHcvRnaTestResult').val('');
        }
        hideValidationMessage();
        hideResultMessage();
        // $('input[name=HcvRnaTest]:radio').prop("checked", false);
        //$('input[name=HcvRnaTestResult]:radio').prop("checked", false);
    },
    'click .js-seriousdeseasesFibrosisTest': function(e) {
        let val = checkInputvalues("seriousdeseasesFibrosisTest");

        if (val == 'Yes') {
            $('#divFibrosis').show();
        } else {
            $('#divFibrosis').hide();
        }
        $('#divFibrosis').find('input[type=text]').val("");
        $('#ddlFibrosisstage').val('');
        showErrormessage("FibrosisTestValues", "", false);
        //  clearTreatmentDetails("#divFibrosisCodeValues");
        $('#divFibrosisCodeValues').find('select').each(function() {
            $(this).val("");
        });
        $('#divFibrosisCodeValues2').find('select').each(function() {
            $(this).val("");
        });
        var item = 0;
        $(".FSV").each(function() {
            if (this.value !== "")
                item = item + 1;
        });
        if (item > 0) {
            $('.FSVlabel .asterik').hide();
        } else {
            $('.FSVlabel .asterik').show();
        }

    },
    'click .js-CommChildPughTest': function(e) {
        let val = checkInputvalues("CommChildPughTest");

        if (val == 'Yes') {
            $('#CommChildPughTest').show();
        } else {
            $('#CommChildPughTest').hide();
        }
        $('#CommChildPughTest').find('input[type=text]').val("");
        removeSelectedRadio("#CommChildPughTest");
        showErrormessage("CirrhosisTestValues", "", false);
        //   clearTreatmentDetails("#CommChildPughTest");
        $('#CommChildPughTest').find('select').each(function() {
            $(this).val("");
        });

    },
    'click .js-chartnote': function(e) {
        let val = checkInputvalues("chartnote");

        if (val == 'Yes') {
            $('#CommChildPughTestfileupload').show();
        } else {
            $('#CommChildPughTestfileupload').hide();
            GlobaldeleteAllfile($("#CommChildPughTestfileupload .customUploadControlId").html().trim());
        }
    },

    // 'click .js-RNATestResult': function (e) {
    //     let val = $('input[name=HcvRnaTestResult]:checked').val();
    // },

    'click #btnScreeningPartI': function(e) {
        updatePatientScreenIData(patientDetails, true);
        // $('#patientScreenMainTitle').html('Screening');
    },
    'click #btnScreeningPartII': function(e) {
        // updatePatientScreenIIData(patientDetails);
        validatePatientScreenIIData(patientDetails);
        // $('#screenPartII').hide();
        // $('#screenPartIII').show();
        // hideValidationMessage();
        // hideResultMessage();
        // IncreaseScreen();
        // $('#patientScreenMainTitle').html('Evaluation');

    },
    'click #btnScreenIIBackScreenI': function(e) {
        $('#screenPartII').hide();
        $('#screenPartI').show();
        // $("#ResultMsgContainerDemographics").show();
        DecreaseScreen();
    },
    'click #btnBackDemographics': function(e) {
        $('#screenNegativeResultMsgI').hide();
        $('#screenPartI').show();
        $('#validationMessageContainer').hide();
        // $('#patientScreenMainTitle').html('Demographics');
        DecreaseScreen();
    },
    'click #btnScreeningPartIII': function(e) {
        let evaluationSelectedFlag = patientTreatmentType(patientDetails);
        if (evaluationSelectedFlag) {
            let params = getCurrentPopulationFilters();
            params['genotypes'] = [patientDetails.genotype];
            params['cirrhosis'] = [patientDetails.cirrhosis];
            params['treatment'] = [patientDetails.treatment];
            params['efficacyWeight'] = 100;
            params['adherenceWeight'] = 100;
            params['costWeight'] = 100;
            params['fdaCompliant'] = "yes";
            params['topScore'] = 6;
            //console.log(params);
            Meteor.call('getProviderPageData', params, function(error, result) {
                /* if (error) {
                     console.log(error);
                     $("#drugsContainer").empty();
                     $("#drugsContainer").append("No drugs found for the given medical situation.");
                 } else {*/
                console.log('getProviderPageData called');
                $("#drugsContainer").empty();

                if (error) {

                    $("#drugsContainer").append("<div style='padding:10px;color:red'>No drugs found for the given medical situation.</div>");
                } else {
                    let decompressed_object = LZString.decompress(result);
                    let resulting_object = JSON.parse(decompressed_object);
                    var item = 0;

                    drugsData = resulting_object.drugsData;
                    drugRiskData = resulting_object.riskData;
                    //  console.log(drugsData);
                    var color = ['#ffb732', '#ffc04c', '#ffc966', '#ffd27f', '#ffdb99', '#ffe4b2', '#ffedcc'];


                    for (var keys in drugsData) {
                        if (drugsData[keys].DrugName) {
                            var drug = drugsData[keys].DrugName;
                            var Efficacy = 'NA';
                            var Safety = 'NA';
                            var Adherence = 'NA';

                            if (drugsData[keys].Efficacy.Efficacy != null && drugsData[keys].Efficacy.Efficacy != "" && drugsData[keys].Efficacy.Efficacy.trim() != "NA") {
                                Efficacy = parseFloat(drugsData[keys].Efficacy.Efficacy).toFixed(0) + "%";
                            }
                            if (drugsData[keys].Safety != null && drugsData[keys].Safety != "" && drugsData[keys].Safety.trim() != "NA") {
                                Safety = parseFloat(drugsData[keys].Safety).toFixed(0) + "%";
                            }
                            if (drugsData[keys].Adherence.Adherence != null && drugsData[keys].Adherence.Adherence != "") {
                                Adherence = parseFloat(drugsData[keys].Adherence.Adherence).toFixed(0) + "%";
                            }

                            item = item + 1;
                            topitemcount = '';
                            bottomitemcount = '';
                            if (item % 3 != 0) {
                                topitemcount = '<div class="">';
                                bottomitemcount = '</div>';
                            }
                            $("#drugsContainer").append(topitemcount + '<div class="col-lg-4 boxshadow_borderline" style="padding-top:30px; padding-bottom: 28px;background-color:' + color[item] + '"> ' +
                                '<h3 class="panel-title containertitle drugname" style="padding-left:15px;padding-bottom:10px;cursor: pointer;">' + drug + '   <div class="safetyFlag" style="width: 25px; float: right;">' +
                                '<div class="infodiv pdl-safety"><span><img src="/dosage.png"></span><div class="info-div-tooltip-box"><div class="beforearrow"></div> <div class="info-div-tooltipbox-titl" style="padding-top:10px">' +
                                '<span> Drug Details </span></div><div class="info-div-tooltip-content"><div class="info-div-tooltip-list-box"><div class="safetyRiskPopupMessage">Drug Score:  ' + drugsData[keys].Best_Drug_Score + '<br />Efficacy: ' + Efficacy +
                                '<br />Adherence: ' + Adherence + '</div>  </div>  </div> </div>  </div>  </div></h3>');
                            $("#drugsContainer").append('</div>' + bottomitemcount);
                            // <br />Safety: ' + Safety + '
                        }
                    }
                }

                $('#screenPartIII').hide();
                $("#divprescribedTest").hide();
                let message = ``;
                /*  if (patientDetails.plantype == "Medicare") {
                        if (patientDetails.genotype == "1a" || patientDetails.genotype == "1b") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Viekira Pak four tablets daily, +/-weight based Ribavirin for 12 weeks</b> `;
                        } else if (patientDetails.genotype == "2" || patientDetails.genotype == "5" || patientDetails.genotype == "6") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Epclusa one tablet daily for 12 weeks</b> `;
                        } else if (patientDetails.genotype == "3") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Epclusa one tablet daily, +/-weight based Ribavirin for 12 weeks</b> `;
                        } else if (patientDetails.genotype == "4") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                    <b> Technivie three tablets daily x 12 weeks, plus weight based Ribavirin for 12 weeks</b> `;
                        }
                    } else if (patientDetails.plantype == "Medicaid") {
                        let val = checkInputvalues("NS5A");

                        if (patientDetails.genotype == "1a") {
                            if (val == 'Yes') {
                                message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Zepatier and Ribavirin daily for 16 weeks </b> `;
                            } else {
                                message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Zepatier, 1 tablet daily for 12 weeks </b> `;
                            }
                        } else if (patientDetails.genotype == "1b") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Zepatier, 1 tablet daily for 12 weeks </b> `;
                        } else if (patientDetails.genotype == "2" || patientDetails.genotype == "5" || patientDetails.genotype == "6") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Epclusa, 1 tablet daily for 12 weeks </b> `;
                        } else if (patientDetails.genotype == "3") {
                            if (val == 'Yes') {
                                message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                                <b> Epclusa and Ribavirin daily for 12 weeks </b> `;
                            } else {
                                message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Epclusa, 1 tablet daily for 12 weeks </b> `;
                            }
                        } else if (patientDetails.genotype == "4") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                       <b> Zepatier, 1 tablet daily for 12 weeks</b> `;
                        }
                    } else if (patientDetails.plantype == "Commercial") {
                        let val = checkInputvalues("NS5A");

                        if (patientDetails.genotype == "1a") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Viekira and Ribavirin daily for 12 weeks </b> `;
                        } else if (patientDetails.genotype == "1b") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Viekira, daily for 12 weeks </b> `;
                        } else if (patientDetails.genotype == "2" || patientDetails.genotype == "5" || patientDetails.genotype == "6") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Epclusa, 1 tablet daily for 12 weeks </b> `;
                        } else if (patientDetails.genotype == "3") {
                            if (val == 'Yes') {
                                message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                                <b> Epclusa and Ribavirin daily for 12 weeks </b> `;
                            } else {
                                message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Epclusa, 1 tablet daily for 12 weeks </b> `;
                            }
                        } else if (patientDetails.genotype == "4") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                       <b> Technivie and Ribavirin, daily for 12 weeks</b> `;
                        }
                }*/
                //  if ($("#txtAPRIscore").val().indexOf("F3") != -1 || $("#txtAPRIscore").val().indexOf("F4") != -1 || ($("#txtAPRIscoreOthers").val().trim() != "" && parseInt($("#txtAPRIscoreOthers").val()) > 0))

                var Fibrosisstage4 = false;
                if ($("#ddlFibrosisstage").val() == "Stage 4")
                    Fibrosisstage4 = true;

                var ChirrhosisClassBC = false;
                if (patientDetails.ChildPughTest && patientDetails.ChildPughTest == 'Yes')
                    ChirrhosisClassBC = true;
                if ($("#txtChildPughscore").val() == "Class A")
                    ChirrhosisClassBC = false;
                else if ($("#txtChildPughscore").val() == "Class B" || $("#txtChildPughscore").val() == "Class C")
                    ChirrhosisClassBC = true;
                //(patientDetails.ChildPughTest && patientDetails.ChildPughTest == 'Yes')
                var CExtrahepaLiverTransplant = (ChirrhosisClassBC == true || (patientDetails.seriousdeseasesLymphomaTest && patientDetails.seriousdeseasesLymphomaTest == 'Yes') ||
                    (patientDetails.seriousdeseasesCryoglobulinemiaTest && patientDetails.seriousdeseasesCryoglobulinemiaTest == 'Yes') ||
                    (patientDetails.seriousdeseasesRenalinsufficiencyTest && patientDetails.seriousdeseasesRenalinsufficiencyTest == 'Yes') ||
                    (patientDetails.seriousdeseasesLivertransplantTest && patientDetails.seriousdeseasesLivertransplantTest == 'Yes')
                );
                var NoCExtrahepaLiverTransplant = false;
                if (CExtrahepaLiverTransplant == false)
                    NoCExtrahepaLiverTransplant = true;


                /*     var NoCExtrahepaLiverTransplant = ((patientDetails.ChildPughTest && patientDetails.ChildPughTest == 'No') || (patientDetails.seriousdeseasesLymphomaTest && patientDetails.seriousdeseasesLymphomaTest == 'No') ||
                        (patientDetails.seriousdeseasesCryoglobulinemiaTest && patientDetails.seriousdeseasesCryoglobulinemiaTest == 'No') ||
                        (patientDetails.seriousdeseasesRenalinsufficiencyTest && patientDetails.seriousdeseasesRenalinsufficiencyTest == 'No') ||
                        (patientDetails.seriousdeseasesLivertransplantTest && patientDetails.seriousdeseasesLivertransplantTest == 'No')
            );*/

                if (patientDetails.genotype == "1a" || patientDetails.genotype == "1b") {
                    if (Fibrosisstage4 == false) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 8 weeks</b> `;
                    }
                    if (Fibrosisstage4 == true) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 12 weeks</b> `;

                    }
                    if (CExtrahepaLiverTransplant == true) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }
                    if (patientDetails.TEwithNS5A == "Yes" && NoCExtrahepaLiverTransplant == true) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                          <b> Mavyret, 3 tablets daily for 16 weeks</b> `;
                    }
                    if (CExtrahepaLiverTransplant == true && patientDetails.TEwithNS5A == "Yes") {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }
                    if (CExtrahepaLiverTransplant == true && patientDetails.TEwithNS34A == "Yes") {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }
                    if (NoCExtrahepaLiverTransplant == true && patientDetails.TEwithNS34A == "Yes" && patientDetails.TEwithNS5A == "Yes") {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }
                    if (CExtrahepaLiverTransplant == true && patientDetails.TEwithNS34A == "Yes" && patientDetails.TEwithNS5A == "Yes") {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }
                    if (patientDetails.TEwithNS5A == "No" && NoCExtrahepaLiverTransplant == true && patientDetails.TEwithNS34A == "Yes") {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                          <b> Mavyret, 3 tablets daily for 12 weeks</b> `;
                    }
                    /*else if (Fibrosisstage4 == true || patientDetails.cirrhosis == "Yes") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 12 weeks</b> `;

                            if (patientDetails.treatmentexperienced == "Yes" && (patientDetails.TEwithNS34A == "Yes" || patientDetails.TEwithNS5A == "Yes")) {
                                message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                              <b> Mavyret, 3 tablets daily for 16 weeks</b> `;
                            }
                    }*/

                } else if (patientDetails.genotype == "2" || patientDetails.genotype == "4" || patientDetails.genotype == "5" || patientDetails.genotype == "6") {
                    if (Fibrosisstage4 == false) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 8 weeks</b> `;
                    }
                    if (Fibrosisstage4 == true) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 12 weeks</b> `;
                    }
                    if (NoCExtrahepaLiverTransplant == true && patientDetails.treatmentexperienced == "Yes") {
                        if (Fibrosisstage4 == false) {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 8 weeks</b> `;
                        }
                        if (Fibrosisstage4 == true) {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 12 weeks</b> `;
                        }

                    }
                    if (CExtrahepaLiverTransplant == true || (patientDetails.TEwithNS34A == "Yes" || patientDetails.TEwithNS5A == "Yes")) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }

                } else if (patientDetails.genotype == "3") {
                    if (Fibrosisstage4 == false) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 8 weeks</b> `;
                    }
                    if (Fibrosisstage4 == true) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 12 weeks</b> `;
                    }
                    if (CExtrahepaLiverTransplant == true) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }
                    if (CExtrahepaLiverTransplant == true && patientDetails.treatmentexperienced == "Yes") {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }
                    if (NoCExtrahepaLiverTransplant == true && patientDetails.treatmentexperienced == "Yes" && (patientDetails.TEwithNS34A == "No" && patientDetails.TEwithNS5A == "No")) {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 16 weeks</b> `;
                    }
                    if (patientDetails.TEwithNS34A == "Yes" || patientDetails.TEwithNS5A == "Yes") {
                        message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b>Patient’s condition is complicated clinically and should be referred to specialist.</b> `;
                    }
                    /* if (Fibrosisstage4 == false) {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 8 weeks</b> `;
                        } else if (Fibrosisstage4 == true || patientDetails.cirrhosis == "Yes") {
                            message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                         <b> Mavyret, 3 tablets daily for 12 weeks</b> `;

                            if (patientDetails.treatmentexperienced == "Yes") {
                                message = `For Patient <b>#${patientDetails.patientID}</b> with Genotype <b>${patientDetails.genotype}</b> and Treatment <b>${capitalize(patientDetails.treatment)}</b> it is recommended by the Payer that you prescribe the following :
                              <b> Mavyret, 3 tablets daily for 16 weeks</b> `;
                            }
                    }*/
                }

                $("#recommendedMessage").html(message);
                $('#recommendedMessageContainer').show();
                if (editdataRendered)
                    $('#btnScreeningPartIVSubmit').show();
                else if (dataRendered)
                    $('#btnScreeningPartIVSubmit').hide();
                $('#screenPartIV').show();
                // $('#divPhysicianCertificationTreatment').show();
                hideValidationMessage();
                // updateTestResults(patientDetails);
                // showPatientSummaryData(patientDetails);
                IncreaseScreen();
                //  }
            });
        } else // if no item in evaluation is selected
        {
            showValidationMessageS3("Please fill in details before moving to Treatment! ");
            setTimeout(function() {
                hideValidationMessage();
            }, 5000);
        }

    },
    'click #btnScreenIIIBackScreenI': function(e) {
        SetScreeningItemsNull();
        // if (patientDetails.HepaCPatient && patientDetails.HepaCPatient == 'Yes') {
        if (patientDetails.PhysicianPlan == 'Treatment') {
            $('#screenPartIII').hide();
            $('#screenPartI').show();
            // $('#patientScreenMainTitle').html('Screening');
            $('#validationMessageContainer').hide();
            DecreaseScreen();
            // DecreaseScreen();
        } else {
            $('#screenPartIII').hide();
            $('#screenPartII').show();
            $('#btnScreeningPartII').show();
            $('#btnScreeningPartIISubmit').hide();
            // $('#patientScreenMainTitle').html('Screening');
            $('#validationMessageContainer').hide();
            DecreaseScreen();
        }
    },
    'click #btnScreeningPartIV': function(e) {
        updatePatientScreenIVData(patientDetails);
    },
    'click .drugname': function(e) {
        determineTreatmentPlan(patientDetails);
        hideValidationMessage();
        hideResultMessage();
    },
    'click #btnScreenIVBackScreenI': function(e) {
        $('#screenPartIV').hide();
        hideEvaluationMessages();
        $('#screenPartIII').show();
        // $('#patientScreenMainTitle').html('Evaluation');
        $('#validationMessageContainer').hide();
        DecreaseScreen();

    },
    'click .js-metabolicPanelOption': function(e) {
        let val = checkInputvalues("metabolicPanelOption");

        if (val == 'Manual') {
            $('#divMetabolicUpload').hide();
            $('#divMetabolicManual').show();
        } else if (val == 'Upload') {
            $('#divMetabolicUpload').show();
            $('#divMetabolicManual').hide();
        } else {
            $('#divMetabolicUpload').hide();
            $('#divMetabolicManual').hide();
        }
    },
    'click .js-HCVgenotypeOption': function(e) {
        let val = checkInputvalues("HCVgenotypeOption");

        if (val == 'Manual') {
            $('#divHCVgenotypeUpload').hide();
            $('#divHCVgenotypeManual').show();
        } else if (val == 'Upload') {
            $('#divHCVgenotypeUpload').show();
            $('#divHCVgenotypeManual').hide();
        } else {
            $('#divHCVgenotypeUpload').hide();
            $('#divHCVgenotypeManual').hide();
        }
    },
    'click .js-CBCOption': function(e) {
        let val = checkInputvalues("CBCOption");

        if (val == 'Manual') {
            $('#divCBCUpload').hide();
            $('#divCBCManual').show();
        } else if (val == 'Upload') {
            $('#divCBCUpload').show();
            $('#divCBCManual').hide();
        } else {
            $('#divCBCUpload').hide();
            $('#divCBCManual').hide();
        }
    },
    'click .js-INROption': function(e) {
        let val = checkInputvalues("INROption");

        if (val == 'Manual') {
            $('#divINRUpload').hide();
            $('#divINRManual').show();
        } else if (val == 'Upload') {
            $('#divINRUpload').show();
            $('#divINRManual').hide();
        } else {
            $('#divINRUpload').hide();
            $('#divINRManual').hide();
        }
    },
    'click .js-HIVOption': function(e) {
        let val = checkInputvalues("HIVOption");

        if (val == 'Manual') {
            $('#divHIVUpload').hide();
            $('#divHIVManual').show();
        } else if (val == 'Upload') {
            $('#divHIVUpload').show();
            $('#divHIVManual').hide();
        } else {
            $('#divHIVUpload').hide();
            $('#divHIVManual').hide();
        }
    },
    'click .js-HBVsurfaceOption': function(e) {
        let val = checkInputvalues("HBVsurfaceOption");

        if (val == 'Manual') {
            $('#divHBVsurfaceUpload').hide();
            $('#divHBVsurfaceManual').show();
        } else if (val == 'Upload') {
            $('#divHBVsurfaceUpload').show();
            $('#divHBVsurfaceManual').hide();
        } else {
            $('#divHBVsurfaceUpload').hide();
            $('#divHBVsurfaceManual').hide();
        }
    },
    'click .js-HAVvaccinationOption': function(e) {
        let val = checkInputvalues("HAVvaccinationOption");

        if (val == 'Manual') {
            $('#divHAVvaccinationUpload').hide();
            $('#divHAVvaccinationManual').show();
        } else if (val == 'Upload') {
            $('#divHAVvaccinationUpload').show();
            $('#divHAVvaccinationManual').hide();
        } else {
            $('#divHAVvaccinationUpload').hide();
            $('#divHAVvaccinationManual').hide();
        }
    },
    'click .js-HBVvaccinationOption': function(e) {
        let val = checkInputvalues("HBVvaccinationOption");

        if (val == 'Manual') {
            $('#divHBVvaccinationUpload').hide();
            $('#divHBVvaccinationManual').show();
        } else if (val == 'Upload') {
            $('#divHBVvaccinationUpload').show();
            $('#divHBVvaccinationManual').hide();
        } else {
            $('#divHBVvaccinationUpload').hide();
            $('#divHBVvaccinationManual').hide();
        }
    },
    'click .js-alcoholScreeningOption': function(e) {
        let val = checkInputvalues("alcoholScreeningOption");

        if (val == 'Manual') {
            $('#divalcoholScreeningUpload').hide();
            $('#divalcoholScreeningManual').show();
        } else if (val == 'Upload') {
            $('#divalcoholScreeningUpload').show();
            $('#divalcoholScreeningManual').hide();
        } else {
            $('#divalcoholScreeningUpload').hide();
            $('#divalcoholScreeningManual').hide();
        }
    },
    'click .js-HCVRNASixMonthOption': function(e) {
        let val = checkInputvalues("HCVRNASixMonthOption");

        if (val == 'Manual') {
            $('#divHCVRNASixMonthUpload').hide();
            $('#divHCVRNASixMonthManual').show();
        } else if (val == 'Upload') {
            $('#divHCVRNASixMonthUpload').show();
            $('#divHCVRNASixMonthManual').hide();
        } else {
            $('#divHCVRNASixMonthUpload').hide();
            $('#divHCVRNASixMonthManual').hide();
        }
    },
    'click .js-HAVtotalAntibodyOption': function(e) {
        let val = checkInputvalues("HAVtotalAntibodyOption");

        if (val == 'Manual') {
            $('#divHAVtotalAntibodyUpload').hide();
            $('#divHAVtotalAntibodyManual').show();
        } else if (val == 'Upload') {
            $('#divHAVtotalAntibodyUpload').show();
            $('#divHAVtotalAntibodyManual').hide();
        } else {
            $('#divHAVtotalAntibodyUpload').hide();
            $('#divHAVtotalAntibodyManual').hide();
        }
    },
    'click .js-HBVcoreAntibodyOption': function(e) {
        let val = checkInputvalues("HBVcoreAntibodyOption");

        if (val == 'Manual') {
            $('#divHBVcoreAntibodyUpload').hide();
            $('#divHBVcoreAntibodyManual').show();
        } else if (val == 'Upload') {
            $('#divHBVcoreAntibodyUpload').show();
            $('#divHBVcoreAntibodyManual').hide();
        } else {
            $('#divHBVcoreAntibodyUpload').hide();
            $('#divHBVcoreAntibodyManual').hide();
        }
    },
    'click #sm_btn_view_test': function(e) {
        $('#screenPartIV').hide();
        $('#screenPartIII').show();
        // $('#patientScreenMainTitle').html('Evaluation');
        $('#validationMessageContainer').hide();
        DecreaseScreen();
    },
    //event for submitting the information
    'click #btnScreeningPartIVSubmit': (e) => {

        let evaluationSelectedFlag = patientTreatmentType(patientDetails);
        if (evaluationSelectedFlag) {
            let params = patientDetails;
            if (editdataRendered) {
                Meteor.call('UPDATE_PATIENT_SCREENINGTREATMENT_DATA', patientDetails, function(error, result) {
                    if (error) {
                        console.log("error", error);
                    } else {
                        showSAlertSuccess('Treatment updated successfully!');

                        var email = ['nisha@binaryrepublik.com', 'arvind.mepani@binaryrepublik.com'];
                        var mailFields = {
                            to: email,
                            subject: 'Updated PCP Request',
                            type: 6, // PCP Submit
                            site: window.location.href,
                            physician: Meteor.user().profile.userDetail.first_name
                        };

                        Meteor.call('sendEmail', mailFields, function(err, res) {
                            console.log("Email send successfully");

                        });

                    }
                });
            } else {
                //console.log(params);
                Meteor.call('INSERT_PATIENT_TREATMENT_DATA', params, function(error, result) {
                    if (error) {
                        console.log("error", error);
                    } else {
                        let selections = checkEvaluationSpecialistRequiredSelectedValues();
                        var HepaB = false,
                            HIV = false;
                        if ($("#txtEvalHepaBcoreantibodytotal").val().trim() != "") {
                            if ($("#txtEvalHepaBcoreantibodytotal").val().trim() == "R")
                                HepaB = true;
                            else if (parseFloat($("#txtEvalHepaBcoreantibodytotal").val().trim()) > 0)
                                HepaB = true;
                        }

                        if ($("#txtEvalHIVantibody").val().trim() != "") {
                            if ($("#txtEvalHIVantibody").val().trim() == "R")
                                HIV = true;
                            else if (parseFloat($("#txtEvalHIVantibody").val().trim()) > 0)
                                HIV = true;
                        }

                        /*  if (selections.length > 0 || HepaB || HIV) {
                            let message = `<span style="color:black;font-weight:600;margin-bottom:15px;">
                                     Patient’s condition is complicated clinically and should be referred to specialist. 
                                     </span><br> </br>
                                    Information submitted successfully! `;
                            showSAlertSuccess(message);
                        } else {
                            showSAlertSuccess('Information submitted successfully!');
                    }*/
                        showSAlertSuccess('Information submitted successfully!');
                        var email = ['nisha@binaryrepublik.com', 'arvind.mepani@binaryrepublik.com'];
                        var mailFields = {
                            to: email,
                            subject: 'New PCP Request',
                            type: 6, // PCP Submit
                            site: window.location.href,
                            physician: Meteor.user().profile.userDetail.first_name
                        };

                        Meteor.call('sendEmail', mailFields, function(err, res) {
                            console.log("Email send successfully");

                        });

                    }
                });
            }
        }
    },
    //onchange event for date of birth 
    'change #patientBirthYear': function(e) {
        // let birthYear = moment($('#patientBirthYear').val()).year(); //parseInt($('#patientBirthYear').val());
        // let today = moment().year();
        // let age = today - birthYear;
        setAgeOfPatient($('#patientBirthYear').val());
    },
    //Praveen 3 April 2017 added button for search patients 
    'click .openAssessmentPatient': function(e) {
        $('#txtPatientIdSearch').val('');
        // $('.editButton').hide();
        editdataRendered = false;
        //create dialog instance of jquery dialogue box 
        $("#assessmentSearchOnSelection").dialog({
            dialogClass: 'containerDialog',
            minHeight: '100px',
            close: function(event, ui) {
                $(this).dialog('close');
            }
        });

        $('.renderEnteredPatient').on('click', function(e) {
            let patientIdToSearch = $('#txtPatientIdSearch').val();
            let selectedOption = $('#ddlPatientIDTypeSearch').val();
            fetchAndRenderPatientData({
                'PCP_PATIENT_ID': parseInt(patientIdToSearch),
                'PCP_PATIENT_ID_TYPE': selectedOption
            });
            $("[id^=diverror]").hide();
        })
    },
    'change .js-documentedfatigue': function(e) {
        let value = $(e.currentTarget).val();
        let plan = checkInputvalues("treatmentPlanType");

        if (value == 'Yes' && plan == 'Medicaid') {
            showRecommendationMessage('documentedfatigue', 'Meeting qualification criteria for the Medicaid population', true);
        } else {
            showRecommendationMessage('documentedfatigue', '', false);
        }
    },
    'change .js-treatmentPlanType': function(e) {
        let value = $(e.currentTarget).val();
        let cond = checkInputvalues("documentedfatigue");

        if (cond == 'Yes' && value == 'Medicaid') {
            showRecommendationMessage('documentedfatigue', 'Meeting qualification criteria for the Medicaid population', true);
        } else {
            showRecommendationMessage('documentedfatigue', '', false);
        }
    }
});



let SetSummaryDetails = (patient, screen) => {
    $("#divScreeningSummary").show();
    $("#divEvaluationSummary").show();
    $("#divTreatmentSummary").show();
    let val = checkInputvalues("PhysicianPlan");

    if (val == 'Treatment')
        $("#lblSummary").html('Treatment Summary');
    else
        $("#lblSummary").html('Screening Summary');
    //  Demographics Section start
    if (patientDetails.patientIDType)
        $("#sm_txt_patient_id_type").html(patientDetails.patientIDType);
    if (patientDetails.patientID)
        $("#sm_txt_patient_id").html(patientDetails.patientID);
    if (patientDetails.plantype)
        $("#sm_txt_treatmentPlan").html(patientDetails.plantype);
    if (patientDetails.birthYear)
        $("#sm_txt_birthYear").html(moment(patientDetails.birthYear).format("MM/DD/YYYY"));

    if (patientDetails.intravenousDrugUser)
        $("#imgDemoDrugInjectionSummary").attr('class', "fa fa-check presentItem");
    else
        $("#imgDemoDrugInjectionSummary").attr('class', "fa fa-times missingItem");

    if (patientDetails.HIVUser)
        $("#imgDemoHIVinfectionSummary").attr('class', "fa fa-check presentItem");
    else
        $("#imgDemoHIVinfectionSummary").attr('class', "fa fa-times missingItem");

    if (patientDetails.hemodialysisUser)
        $("#imgDemoHemodialysisSummary").attr('class', "fa fa-check presentItem");
    else
        $("#imgDemoHemodialysisSummary").attr('class', "fa fa-times missingItem");


    if (patientDetails.bloodTransUser)
        $("#imgDemoBloodTransfusionSummary").attr('class', "fa fa-check presentItem");
    else
        $("#imgDemoBloodTransfusionSummary").attr('class', "fa fa-times missingItem");

    // if (patientDetails.patientALT)
    //     $("#imgDemoAbnormalALTSummary").attr('class', "fa fa-check presentItem");
    // else
    //     $("#imgDemoAbnormalALTSummary").attr('class', "fa fa-times missingItem");

    if (patientDetails.patientStatus)
        $("#imgDemoExposedHCVBloodSummary").attr('class', "fa fa-check presentItem");
    else
        $("#imgDemoExposedHCVBloodSummary").attr('class', "fa fa-times missingItem");

    if (patientDetails.patientbirth)
        $("#imgDemoBornHCVwomanSummary").attr('class', "fa fa-check presentItem");
    else
        $("#imgDemoBornHCVwomanSummary").attr('class', "fa fa-times missingItem");

    if (patientDetails.HepaCPatient)
        $("#imgDemoHaveHCVSummary").attr('class', "fa fa-check presentItem");
    else
        $("#imgDemoHaveHCVSummary").attr('class', "fa fa-times missingItem");
    //  Demographics Section end

    //   Primary Care section start
    if (screen == "screening") {
        // Assing the patientDetails values since Next is not clicked
        // SetScreeningItemsNull();
        if ($('input[name=antibodyTest]:checked').length > 0) {
            let antibodyTest = checkInputvalues("antibodyTest");

            patientDetails.antibodyTest = antibodyTest;
        }
        if ($('input[name=antibodyPatientTest]:checked').length !== 0) {
            let antibodyPatientTest = checkInputvalues("antibodyPatientTest");

            patientDetails.antibodyPatientTest = antibodyPatientTest;
        }

        let txtHcvRnaTestResult = $('#txtHcvRnaTestResult').val();
        patientDetails.txtHcvRnaTestResult = txtHcvRnaTestResult;

        let ddlgenotype = $('#ddlgenotype').val();
        patientDetails.genotype = ddlgenotype;

        let HcvRnaTestResultDate = $('#txtHcvRnaTestResultDate').val();
        patientDetails.HcvRnaTestResultDateScreening = HcvRnaTestResultDate;
    }
    // console.log(patientDetails.antibodyPatientTest);
    if (patientDetails.antibodyPatientTest)
        $("#sm_txt_HCV_Result").html(patientDetails.antibodyPatientTest);

    if (patientDetails.antibodyPatientTest == "Negative") {
        $("#divNegativeTestResult").html("Primary Care done successfully. Patient with Negative Hepatitis C Antibody test result need not be revisited.");
        $("#divNegativeTestResult").show();
        $("#divSceeningResult").hide();
        $("#divScreeningGenotype").hide();
        $("#sm_txt_HCV_Result").val(patientDetails.antibodyPatientTest);
        $("#sm_txt_Result").val("");
        $("#sm_txt_Genotype").val("");
    } else {
        $("#divNegativeTestResult").html("");
        $("#divNegativeTestResult").hide();
        $("#divSceeningResult").show();
        $("#divScreeningGenotype").show();

        if (patientDetails.txtHcvRnaTestResult)
            $("#sm_txt_Result").html(patientDetails.txtHcvRnaTestResult + ' IU/ml');
        if (patientDetails.genotype)
            $("#sm_txt_Genotype").html(patientDetails.genotype);
    }

    if (screen == "screening") {
        $("#divEvaluationSummary").hide();
        $("#divTreatmentSummary").hide();
        return;
    }
    // if ((patientDetails.HepaCPatient && patientDetails.HepaCPatient == "No") || patientDetails.HepaCPatient == undefined) {

    // }
    //   Primary Care section end

    //   Patient Evaluation section start
    // (patientDetails.HepaCPatient && patientDetails.HepaCPatient == "Yes") || patientDetails.antibodyPatientTest == "Positive"
    if (val == 'Treatment') {
        if (patientDetails.antibodyPatientTest != "Positive")
            $("#divScreeningSummary").hide();

        if (patientDetails.alcoholTest == "Previously Stopped")
            $("#divAlcoholSummary").html("Patient is free from alcohol and illicit IV drugs " + $("#txtalchoholStopped").val() + " " + $("#txtalchoholStoppedperiod").val() + " prior to initiation of therapy.");
        else if (patientDetails.alcoholTest == "Current")
            $("#divAlcoholSummary").html("Patient is not free from alcohol and illicit IV drugs 6 months prior to initiation of therapy.");
        else if (patientDetails.alcoholTest == "Never")
            $("#divAlcoholSummary").html("Patient did not receive Alcohol Screening/Counseling.");
        else
            $("#divAlcoholSummary").html("Undertermined.");

        if (patientDetails.patientStatus)
            $("#imgDemoExposedHCVBloodSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgDemoExposedHCVBloodSummary").attr('class', "fa fa-times missingItem");


        if (patientDetails.seriousdeseasesFibrosisTest)
            $("#imgEvalFibrosisSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalFibrosisSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.CommChildPughTest)
            $("#imgEvalCirrhosisChildPughSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalCirrhosisChildPughSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesLymphomaTest)
            $("#imgEvalLymphomaSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalLymphomaSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesRenalinsufficiencyTest)
            $("#imgEvalRenalinsufficiencySummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalRenalinsufficiencySummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesCryoglobulinemiaTest)
            $("#imgEvalCryoglobulinemiaSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalCryoglobulinemiaSummary").attr('class', "fa fa-times missingItem");


        if (patientDetails.seriousdeseasesLivertransplantTest)
            $("#imgEvalLiverTransplantSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalLiverTransplantSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesMediHIV1Co)
            $("#imgEvalMediHIV1CoSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalMediHIV1CoSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesMediHEPAB)
            $("#imgEvalMediHEPABSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalMediHEPABSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesMediType2Diabetes)
            $("#imgEvalMediType2DiabetesSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalMediType2DiabetesSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesMediPorphyria)
            $("#imgEvalPorphyriaSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalPorphyriaSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesPatientmanSex)
            $("#imgEvalPatientmanSexSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalPatientmanSexSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesPatientinjectiondrug)
            $("#imgEvalPatientinjectiondrugSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalPatientinjectiondrugSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesPatientwomenchildbearing)
            $("#imgEvalPatientwomenchildbearingSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalPatientwomenchildbearingSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.seriousdeseasesPatienthcvinfected)
            $("#imgEvalPatienthcvinfectedSummary").attr('class', "fa fa-check presentItem");
        else
            $("#imgEvalPatienthcvinfectedSummary").attr('class', "fa fa-times missingItem");

        if (patientDetails.treatmentexperienced == "Yes")
            $("#divTreatementTypeSummary").html("Experienced");
        else if (patientDetails.treatmentexperienced == "No")
            $("#divTreatementTypeSummary").html("Naive");
        else
            $("#divTreatementTypeSummary").html("Undetermined");

        // $("#sm_txtEvalHepaBantigen").removeAttr("class");
        // $("#sm_txtEvalHepaBantigendate").removeAttr("class");
        // $("#sm_txtEvalHepaBantibody").removeAttr("class");
        // $("#sm_txtEvalHepaBantibodydate").removeAttr("class");
        // $("#sm_txtEvalHepaBcoreantibodytotal").removeAttr("class");
        // $("#sm_txtEvalHepaBcoreantibodytotaldate").removeAttr("class");
        // $("#sm_txtEvalHepaAantibody").removeAttr("class");
        // $("#sm_txtEvalHepaAantibodydate").removeAttr("class");
        // $("#sm_txtEvalHIVantibody").removeAttr("class");
        // $("#sm_txtEvalHIVantibodydate").removeAttr("class");
        // $("#sm_txtEvalNS5Apolymorphisms").removeAttr("class");
        // $("#sm_txtEvalNS5Apolymorphismsdate").removeAttr("class");
        // $("#sm_txtEvalASTLimits").removeAttr("class");
        // $("#sm_txtEvalASTLimitsdate").removeAttr("class");
        // $("#sm_txtEvalALTLimits").removeAttr("class");
        // $("#sm_txtEvalALTLimitsdate").removeAttr("class");
        // $("#sm_txtEvalWBC").removeAttr("class");
        // $("#sm_txtEvalWBCdate").removeAttr("class");
        // $("#sm_txtEvalPlatelets").removeAttr("class");
        // $("#sm_txtEvalPlateletsdate").removeAttr("class");
        // $("#sm_txtEvalHemoglobin").removeAttr("class");
        // $("#sm_txtEvalHemoglobindate").removeAttr("class");
        // $("#sm_txtEvalAST").removeAttr("class");
        // $("#sm_txtEvalASTdate").removeAttr("class");
        // $("#sm_txtEvalALT").removeAttr("class");
        // $("#sm_txtEvalNALTdate").removeAttr("class");
        // $("#sm_txtEvalBilirubin").removeAttr("class");
        // $("#sm_txtEvalBilirubindate").removeAttr("class");
        // $("#sm_txtEvalAlbumin").removeAttr("class");
        // $("#sm_txtEvalAlbumindate").removeAttr("class");
        // $("#sm_txtEvalINR").removeAttr("class");
        // $("#sm_txtEvalINRdate").removeAttr("class");
        // $("#sm_txtEvalSerumCreatinine").removeAttr("class");
        // $("#sm_txtEvalSerumCreatininedate").removeAttr("class");
        // $("#sm_txtEvalMELDScore").removeAttr("class");

        //=============================================================   fa fa-times ===================================
        if (patientDetails.EvalHepaBantigen)
            $("#sm_txtEvalHepaBantigen").html(patientDetails.EvalHepaBantigen);
        else
        //$("#sm_txtEvalHepaBantigen").html("");
            $("#sm_txtEvalHepaBantigen").attr('class', "fa fa-times missingItem");


        if (patientDetails.EvalHepaBantigenDate)
            $("#sm_txtEvalHepaBantigendate").html(formatDateMoment().setDate(patientDetails.EvalHepaBantigenDate));
        else
            $("#sm_txtEvalHepaBantigendate").attr('class', "fa fa-times missingItem");

        //  console.log(patientDetails.EvalHepaBantigenfile);
        var filename = "";

        if (patientDetails.EvalHepaBantigenfile != "null") {
            //    console.log(JSON.parse(patientDetails.EvalHepaBantigenfile));
            filename = _.pluck(JSON.parse(patientDetails.EvalHepaBantigenfile), 'name');
            $("#sm_txtEvalHepaBantigenfile").html(filename[0]);
        } else
        // $("#sm_txtEvalHepaBantigenfile").html("");
            $("#sm_txtEvalHepaBantigenfile").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHepaBantibody)
            $("#sm_txtEvalHepaBantibody").html(patientDetails.EvalHepaBantibody);
        else
        //$("#sm_txtEvalHepaBantibody").html("");
            $("#sm_txtEvalHepaBantibody").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHepaBantibodyDate)
            $("#sm_txtEvalHepaBantibodydate").html(moment(patientDetails.EvalHepaBantibodyDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalHepaBantibodydate").html("");
            $("#sm_txtEvalHepaBantibodydate").html("<i class='fa fa-times missingItem'>");



        if (patientDetails.EvalHepaBantibodyfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalHepaBantibodyfile), 'name');
            $("#sm_txtEvalHepaBantibodyfile").html(filename[0]);
        } else
        //$("#sm_txtEvalHepaBantibodyfile").html("");
            $("#sm_txtEvalHepaBantibodyfile").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHepaBcoreantibodytotal)
            $("#sm_txtEvalHepaBcoreantibodytotal").html(patientDetails.EvalHepaBcoreantibodytotal);
        else
        //$("#sm_txtEvalHepaBcoreantibodytotal").html("");
            $("#sm_txtEvalHepaBcoreantibodytotal").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHepaBcoreantibodytotalDate)
            $("#sm_txtEvalHepaBcoreantibodytotaldate").html(moment(patientDetails.EvalHepaBcoreantibodytotalDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalHepaBcoreantibodytotaldate").html("");
            $("#sm_txtEvalHepaBcoreantibodytotaldate").html("<i class='fa fa-times missingItem'>");



        if (patientDetails.EvalHepaBcoreantibodytotalfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalHepaBcoreantibodytotalfile), 'name');
            $("#sm_txtEvalHepaBcoreantibodytotalfile").html(filename[0]);
        } else
        //$("#sm_txtEvalHepaBcoreantibodytotalfile").html("");
            $("#sm_txtEvalHepaBcoreantibodytotalfile").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHepaAantibody)
            $("#sm_txtEvalHepaAantibody").html(patientDetails.EvalHepaAantibody);
        else
        //$("#sm_txtEvalHepaAantibody").html("");
            $("#sm_txtEvalHepaAantibody").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHepaAantibodyDate)
            $("#sm_txtEvalHepaAantibodydate").html(moment(patientDetails.EvalHepaAantibodyDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalHepaAantibodydate").html("");
            $("#sm_txtEvalHepaAantibodydate").html("<i class='fa fa-times missingItem'>");



        if (patientDetails.EvalHepaAantibodyfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalHepaAantibodyfile), 'name');
            $("#sm_txtEvalHepaAantibodyfile").html(filename[0]);
        } else
        //$("#sm_txtEvalHepaAantibodyfile").html("");
            $("#sm_txtEvalHepaAantibodyfile").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHIVantibody)
            $("#sm_txtEvalHIVantibody").html(patientDetails.EvalHIVantibody);
        else
        //$("#sm_txtEvalHIVantibody").html("");
            $("#sm_txtEvalHIVantibody").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHIVantibodyDate)
            $("#sm_txtEvalHIVantibodydate").html(moment(patientDetails.EvalHIVantibodyDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalHIVantibodydate").html("");
            $("#sm_txtEvalHIVantibodydate").html("<i class='fa fa-times missingItem'>");



        if (patientDetails.EvalHIVantibodyfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalHIVantibodyfile), 'name');
            $("#sm_txtEvalHIVantibodyfile").html(filename[0]);
        } else
        //$("#sm_txtEvalHIVantibodyfile").html("");
            $("#sm_txtEvalHIVantibodyfile").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalNS5Apolymorphisms)
            $("#sm_txtEvalNS5Apolymorphisms").html(patientDetails.EvalNS5Apolymorphisms);
        else
        //$("#sm_txtEvalNS5Apolymorphisms").html("");
            $("#sm_txtEvalNS5Apolymorphisms").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalNS5ApolymorphismsDate)
            $("#sm_txtEvalNS5Apolymorphismsdate").html(moment(patientDetails.EvalNS5ApolymorphismsDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalNS5Apolymorphismsdate").html("");
            $("#sm_txtEvalNS5Apolymorphismsdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalNS5Apolymorphismsfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalNS5Apolymorphismsfile), 'name');
            $("#sm_txtEvalNS5Apolymorphismsfile").html(filename[0]);
        } else
        //$("#sm_txtEvalNS5Apolymorphismsfile").html("");
            $("#sm_txtEvalNS5Apolymorphismsfile").html("<i class='fa fa-times missingItem'>");


        if (patientDetails.EvalASTUpperLimit && patientDetails.EvalASTLowerLimit)
            $("#sm_txtEvalASTLimits").html(patientDetails.EvalASTLowerLimit + " - " + patientDetails.EvalASTUpperLimit);
        else
        //$("#sm_txtEvalASTLimits").html("");
            $("#sm_txtEvalASTLimits").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalASTLimitDate)
            $("#sm_txtEvalASTLimitsdate").html(moment(patientDetails.EvalASTLimitDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalASTLimitsdate").html("");
            $("#sm_txtEvalASTLimitsdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalASTLimitfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalASTLimitfile), 'name');
            $("#sm_txtEvalASTLimitsfile").html(filename[0]);
        } else
        //$("#sm_txtEvalASTLimitsfile").html("");
            $("#sm_txtEvalASTLimitsfile").html("<i class='fa fa-times missingItem'>");
        //-1            


        //2
        if (patientDetails.EvalALTUpperLimit && patientDetails.EvalALTLowerLimit)
            $("#sm_txtEvalALTLimits").html(patientDetails.EvalALTLowerLimit + " - " + patientDetails.EvalALTUpperLimit);
        else
        //$("#sm_txtEvalALTLimits").html("");
            $("#sm_txtEvalALTLimits").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalALTLimitDate)
            $("#sm_txtEvalALTLimitsdate").html(moment(patientDetails.EvalALTLimitDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalALTLimitsdate").html("");
            $("#sm_txtEvalALTLimitsdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalALTLimitfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalALTLimitfile), 'name');
            $("#sm_txtEvalALTLimitsfile").html(filename[0]);
        } else
        //$("#sm_txtEvalALTLimitsfile").html("");
            $("#sm_txtEvalALTLimitsfile").html("<i class='fa fa-times missingItem'>");
        //-2  


        //3
        if (patientDetails.EvalWBC)
            $("#sm_txtEvalWBC").html(patientDetails.EvalWBC);
        else
        //$("#sm_txtEvalWBC").html("");
            $("#sm_txtEvalWBC").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalWBCDate)
            $("#sm_txtEvalWBCdate").html(moment(patientDetails.EvalWBCDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalWBCdate").html("");
            $("#sm_txtEvalWBCdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalWBCfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalWBCfile), 'name');
            $("#sm_txtEvalWBCfile").html(filename[0]);
        } else
        //$("#sm_txtEvalWBCfile").html("");
            $("#sm_txtEvalWBCfile").html("<i class='fa fa-times missingItem'>");
        //-3

        //4
        if (patientDetails.EvalPlatelets)
            $("#sm_txtEvalPlatelets").html(patientDetails.EvalPlatelets);
        else
        //$("#sm_txtEvalPlatelets").html("");
            $("#sm_txtEvalPlatelets").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalPlateletsDate)
            $("#sm_txtEvalPlateletsdate").html(moment(patientDetails.EvalPlateletsDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalPlateletsdate").html("");
            $("#sm_txtEvalPlateletsdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalPlateletsfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalPlateletsfile), 'name');
            $("#sm_txtEvalPlateletsfile").html(filename[0]);
        } else
        //$("#sm_txtEvalPlateletsfile").html("");
            $("#sm_txtEvalPlateletsfile").html("<i class='fa fa-times missingItem'>");

        //-4

        //5
        if (patientDetails.EvalHemoglobin)
            $("#sm_txtEvalHemoglobin").html(patientDetails.EvalHemoglobin);
        else
        //$("#sm_txtEvalHemoglobin").html("");
            $("#sm_txtEvalHemoglobin").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHemoglobinDate)
            $("#sm_txtEvalHemoglobindate").html(moment(patientDetails.EvalHemoglobinDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalHemoglobindate").html("");
            $("#sm_txtEvalHemoglobindate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalHemoglobinfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalHemoglobinfile), 'name');
            $("#sm_txtEvalHemoglobinfile").html(filename[0]);
        } else
        //$("#sm_txtEvalHemoglobinfile").html("");
            $("#sm_txtEvalHemoglobinfile").html("<i class='fa fa-times missingItem'>");
        //-5


        //6
        if (patientDetails.EvalAST)
            $("#sm_txtEvalAST").html(patientDetails.EvalAST);
        else
        //$("#sm_txtEvalAST").html("");
            $("#sm_txtEvalAST").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalASTDate)
            $("#sm_txtEvalASTdate").html(moment(patientDetails.EvalASTDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalASTdate").html("");
            $("#sm_txtEvalASTdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalASTfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalASTfile), 'name');
            $("#sm_txtEvalASTfile").html(filename[0]);
        } else
        //$("#sm_txtEvalASTfile").html("");
            $("#sm_txtEvalASTfile").html("<i class='fa fa-times missingItem'>");
        //-6

        //7
        if (patientDetails.EvalALT)
            $("#sm_txtEvalALT").html(patientDetails.EvalALT);
        else
        //$("#sm_txtEvalALT").html("");
            $("#sm_txtEvalALT").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalALTDate)
            $("#sm_txtEvalNALTdate").html(moment(patientDetails.EvalALTDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalNALTdate").html("");
            $("#sm_txtEvalNALTdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalALTfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalALTfile), 'name');
            $("#sm_txtEvalALTfile").html(filename[0]);
        } else
        //$("#sm_txtEvalALTfile").html("");
            $("#sm_txtEvalALTfile").html("<i class='fa fa-times missingItem'>");
        //-7


        //8
        if (patientDetails.EvalBilirubin)
            $("#sm_txtEvalBilirubin").html(patientDetails.EvalBilirubin);
        else
        //$("#sm_txtEvalBilirubin").html("");
            $("#sm_txtEvalBilirubin").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalBilirubinDate)
            $("#sm_txtEvalBilirubindate").html(moment(patientDetails.EvalBilirubinDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalBilirubindate").html("");
            $("#sm_txtEvalBilirubindate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalBilirubinfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalBilirubinfile), 'name');
            $("#sm_txtEvalBilirubinfile").html(filename[0]);
        } else
        //$("#sm_txtEvalBilirubinfile").html("");
            $("#sm_txtEvalBilirubinfile").html("<i class='fa fa-times missingItem'>");
        //-8

        //9
        if (patientDetails.EvalAlbumin)
            $("#sm_txtEvalAlbumin").html(patientDetails.EvalAlbumin);
        else
        //$("#sm_txtEvalAlbumin").html("");
            $("#sm_txtEvalAlbumin").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalAlbuminDate)
            $("#sm_txtEvalAlbumindate").html(moment(patientDetails.EvalAlbuminDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalAlbumindate").html("");
            $("#sm_txtEvalAlbumindate").html("<i class='fa fa-times missingItem'>");

        // console.log('patientDetails');
        // console.log(patientDetails);

        if (patientDetails.EvalAlbuminfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalAlbuminfile), 'name');
            $("#sm_txtEvalAlbuminfile").html(filename[0]);
        } else
        //$("#sm_txtEvalAlbuminfile").html("");
            $("#sm_txtEvalAlbuminfile").html("<i class='fa fa-times missingItem'>");
        //-9

        //10
        if (patientDetails.EvalINR)
            $("#sm_txtEvalINR").html(patientDetails.EvalINR);
        else
        //$("#sm_txtEvalINR").html("");
            $("#sm_txtEvalINR").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalINRDate)
            $("#sm_txtEvalINRdate").html(moment(patientDetails.EvalINRDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalINRdate").html("");
            $("#sm_txtEvalINRdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalINRfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalINRfile), 'name');
            $("#sm_txtEvalINRfile").html(filename[0]);
        } else
        //$("#sm_txtEvalINRfile").html("");
            $("#sm_txtEvalINRfile").html("<i class='fa fa-times missingItem'>");
        //-10


        //11
        if (patientDetails.EvalSerumCr)
            $("#sm_txtEvalSerumCreatinine").html(patientDetails.EvalSerumCr);
        else
        //$("#sm_txtEvalSerumCreatinine").html("");
            $("#sm_txtEvalSerumCreatinine").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalSerumCrDate)
            $("#sm_txtEvalSerumCreatininedate").html(moment(patientDetails.EvalSerumCrDate).format("MM/DD/YYYY"));
        else
        //$("#sm_txtEvalSerumCreatininedate").html("");
            $("#sm_txtEvalSerumCreatininedate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalSerumCrfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalSerumCrfile), 'name');
            $("#sm_txtEvalSerumCreatininefile").html(filename[0]);
        } else
            $("#sm_txtEvalSerumCreatininefile").html("<i class='fa fa-times missingItem'>");
        //-11
        //-Serum Sodium
        if (patientDetails.EvalSerumSodium)
            $("#sm_txtEvalSerumSodium").html(patientDetails.EvalSerumSodium);
        else
            $("#sm_txtEvalSerumSodium").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalSerumSodiumDate)
            $("#sm_txtEvalSerumSodiumdate").html(moment(patientDetails.EvalSerumSodiumDate).format("MM/DD/YYYY"));
        else
            $("#sm_txtEvalSerumSodiumdate").html("<i class='fa fa-times missingItem'>");

        if (patientDetails.EvalSerumSodiumfile != "null") {
            filename = _.pluck(JSON.parse(patientDetails.EvalSerumSodiumfile), 'name');
            $("#sm_txtEvalSerumSodiumfile").html(filename[0]);
        } else
            $("#sm_txtEvalSerumSodiumfile").html("<i class='fa fa-times missingItem'>");
        //-Serum Sodium

        //12  - MELD Score
        if (patientDetails.meldScoreValue)
            $("#sm_txtEvalMELDScore").html(patientDetails.meldScoreValue);
        else
        //$("#sm_txtEvalMELDScore").html("");
            $("#sm_txtEvalMELDScore").html("<i class='fa fa-times missingItem'>");
        //-12

        //=== Fa fa END





    }
    //   Patient Evaluation section end

    //   Patient Treament section start
    $("#divTreatmentRecommendationSummary").html($("#recommendedMessage").html());
    // $("#divRWERecommendationSummary").empty();
    // for (var keys in drugsData) {
    //     if (drugsData[keys].DrugName) {
    //         var drug = drugsData[keys].DrugName;

    //         $("#divRWERecommendationSummary").append('<div class=""><div class="col-lg-4 boxshadow_borderline" style="padding-top:30px; padding-bottom: 28px;"> ' +
    //             '<h3 class="panel-title containertitle drugname" style="padding-left:15px;padding-bottom:10px;">' + drug + '</h3>');
    //         $("#divRWERecommendationSummary").append('</div></div>');
    //     }
    // }
    //   Patient Treament section end

}

// Nisha 03/17/2017 set the Demographics item to null before assiging
let SetDemographicsItemsNull = () => {
    patientDetails.PhysicianPlan = null;
    patientDetails.patientID = null;
    patientDetails.patientIDType = null;
    patientDetails.plantype = null;
    patientDetails.birthYear = null;
    patientDetails.intravenousDrugUser = null;
    patientDetails.HIVUser = null;
    patientDetails.hemodialysisUser = null;
    patientDetails.bloodTransUser = null;
    patientDetails.patientStatus = null;
    patientDetails.patientbirth = null;
    patientDetails.seriousdeseasesPatientmanSex = null;
    patientDetails.seriousdeseasesPatienthcvinfected = null;
    patientDetails.seriousdeseasesPatientwomenchildbearing = null;
    patientDetails.seriousdeseaseshisincarc = null;
    patientDetails.patientALT = null;
    patientDetails.HepaCPatient = null;
    patientDetails.DemographicsComments = null;
}

// Nisha 03/17/2017 set the Screening item to null before assiging
let SetScreeningItemsNull = () => {
    patientDetails.antibodyTest = null;
    patientDetails.antibodyPatientTest = null;
    patientDetails.txtHcvRnaTestResult = null;
    patientDetails.genotype = null;
    patientDetails.ScreeningComments = null;
    patientDetails.HcvRnaTestResultDateScreening = null;
    patientDetails.HcvRnaTestGenotypeDateScreening = null;
}

// Nisha 03/17/2017 set the Evaluation item to null before assiging
//Praveen 03/23/2017 Modified ordering based on patient treatment function and added new keys
let SetEvaluationItemsNull = () => {
    patientDetails.txtHcvRnaTestResultEval = null;
    patientDetails.genotype = null;
    patientDetails.txtEvalRNAResultDate = null;
    patientDetails.HcvRnaTestGenotypeDateEval = null;
    patientDetails.alcoholTest = null;
    patientDetails.alcoholstoppedperiod = null;
    patientDetails.alcoholstoppedperiodtype = null;
    patientDetails.seriousdeseasesFibrosisTest = null;
    patientDetails.FibroStage = null;
    patientDetails.txtFibroscanScore = null;
    patientDetails.txtFibrosistestScore = null;
    patientDetails.txtAPRIscore = null;
    patientDetails.txtFibroMeterscore = null;
    patientDetails.txtEvalutionrequiresSpecialist = null;
    patientDetails.CommChildPughTest = null;
    patientDetails.txtChildPughscore = null;
    patientDetails.txtMELDscore = null;
    patientDetails.CommChildPughTestchartnote = null;
    patientDetails.CommChildPughTestchartnoteFile = null;
    patientDetails.seriousdeseasesLymphomaTest = null;
    patientDetails.seriousdeseasesRenalinsufficiencyTest = null;
    patientDetails.seriousdeseasesCryoglobulinemiaTest = null;
    patientDetails.seriousdeseasesLivertransplantTest = null;
    patientDetails.seriousdeseasesMediHIV1Co = null;
    patientDetails.seriousdeseasesMediHEPAB = null;
    patientDetails.seriousdeseasesMediType2Diabetes = null;
    patientDetails.seriousdeseasesMediPorphyria = null;
    patientDetails.treatmentexperienced = null;
    patientDetails.TEwithNS5A = null;
    patientDetails.TEwithNS34A = null;
    patientDetails.completeregimen = null;
    patientDetails.reasondiscontinue = null;
    patientDetails.patientresponse = null;
    patientDetails.txtHCVRNAWeekDurationResponse = null;
    patientDetails.txtHcvRnaTestResultResponse = null;
    patientDetails.documentedfatigue = null;

    patientDetails.EvalHepaBantigen = null;
    patientDetails.EvalHepaBantigenDate = null;
    patientDetails.EvalHepaBantigenfile = null;

    patientDetails.EvalHepaBantibody = null;
    patientDetails.EvalHepaBantibodyDate = null;
    patientDetails.EvalHepaBantibodyfile = null;

    patientDetails.EvalHepaBcoreantibodytotal = null;
    patientDetails.EvalHepaBcoreantibodytotalDate = null;
    patientDetails.EvalHepaBcoreantibodytotalfile = null;

    patientDetails.EvalHepaAantibody = null;
    patientDetails.EvalHepaAantibodyDate = null;
    patientDetails.EvalHepaAantibodyfile = null;

    patientDetails.EvalHIVantibody = null;
    patientDetails.EvalHIVantibodyDate = null;
    patientDetails.EvalHIVantibodyfile = null;

    patientDetails.EvalNS5Apolymorphismsflag = null;
    patientDetails.EvalNS5Apolymorphisms = null;
    patientDetails.EvalNS5ApolymorphismsDate = null;
    patientDetails.EvalNS5Apolymorphismsfile = null;

    patientDetails.EvalASTLowerLimit = null;
    patientDetails.EvalASTUpperLimit = null;
    patientDetails.EvalASTLimitDate = null;
    patientDetails.EvalASTLimitfile = null;

    patientDetails.EvalALTUpperLimit = null;
    patientDetails.EvalALTLowerLimit = null;
    patientDetails.EvalALTLimitDate = null;
    patientDetails.EvalALTLimitfile = null;


    patientDetails.EvalBilirubin = null;
    patientDetails.EvalAlbumin = null;
    patientDetails.EvalINR = null;
    patientDetails.EvalSerumCr = null;
    patientDetails.EvalSerumSodium = null;
    patientDetails.EvalBilirubinDate = null;
    patientDetails.EvalAlbuminDate = null;
    patientDetails.EvalINRDate = null;
    patientDetails.EvalSerumCrDate = null;
    patientDetails.EvalSerumSodiumDate = null;
    patientDetails.EvalBilirubinfile = null;
    patientDetails.EvalAlbuminfile = null;
    patientDetails.EvalINRfile = null;
    patientDetails.EvalSerumCrfile = null;
    patientDetails.EvalSerumSodiumfile = null;
    patientDetails.dialysis = null;
    patientDetails.EvalALT = null;
    patientDetails.EvalALTDate = null;
    patientDetails.EvalALTfile = null;

    patientDetails.EvalAST = null;
    patientDetails.EvalASTDate = null;
    patientDetails.EvalASTfile = null;

    patientDetails.EvalHemoglobin = null;
    patientDetails.EvalHemoglobinDate = null;
    patientDetails.EvalHemoglobinfile = null;

    patientDetails.EvalPlatelets = null;
    patientDetails.EvalPlateletsDate = null;
    patientDetails.EvalPlateletsfile = null;

    patientDetails.EvalWBC = null;
    patientDetails.EvalWBCDate = null;
    patientDetails.EvalWBCfile = null;

    patientDetails.patientScreeningAlcohol = null;
    patientDetails.realWorldEvidenceDrugs = null;
    patientDetails.recommendedTreatmentForPatient = null;
    patientDetails.patientEvaluationAlcoholFile = null;
}

// Nisha 03/17/2017 set the Hide/Show Submit/Next button in Screening page
let ShowHideSubmitScreen2 = () => {
    let val = checkInputvalues("PhysicianPlan");

    if (val == 'Treatment') {
        // $('#btnScreenIIBackScreenI').hide();
        $('#btnScreeningPartII').show();
        $('#btnScreeningPartIISubmit').hide();
    } else {
        // $('#btnScreenIIBackScreenI').hide();
        $('#btnScreeningPartII').hide();
        $('#btnScreeningPartIISubmit').show();
    }
    // let val = $('input[name=antibodyPatientTest]:checked').val();
    // if (val == 'Negative') {
    //     $('#btnScreeningPartII').hide();
    //     $('#btnScreeningPartIISubmit').show();
    // } else {
    //     $('#btnScreeningPartII').show();
    //     $('#btnScreeningPartIISubmit').hide();
    // }
}

// Nisha 03/17/2017 clear the selected radiobutton from within a div
let removeSelectedRadio = (container) => {
    $(container).find('input[type=radio]').prop("checked", false);
}

let clearScreen2Details = (container) => {
    $(container).find('input[type=radio]').prop("checked", false);
    $(container).find('input[type=checkbox]').prop("checked", false);
    $(container).find('input[type=text]').val("");
    $(container).find('input[type=date]').val("");
    $("#ddlgenotype").val("");
    hideValidationMessage();
}

let cleardivEvalRiskFactors = (container) => {
    $(container).find('input[type=radio]').prop("checked", false);
    $(container).find('input[type=checkbox]').prop("checked", false);
    $(container).find('input[type=text]').val("");
    $(container).find('input[type=date]').val("");
    $(container).find('select').val("");
}


let clearTreatmentDetails = (container) => {
    $(container).find('input[type=radio]').prop("checked", false);
    $(container).find('input[type=checkbox]').prop("checked", false);
    $(container).find('input[type=text]').val("");
    $("#ddlHCVRNA").val("");
}

// let checkCertificationDetails = (checkbox, nametext, datevalue, screen) => {
//     let filledCertidetails = false;
//     //showErrormessage("PCScreening", "", false);
//     if (screen === "screening")
//         showErrormessage("PCScreening", "", false);
//     else if (screen === 'treatment') {
//         showErrormessage("PCTreatment", "", false);
//     }

//     if ($('input[name=' + checkbox + ']:checked').length !== 0 && $("#" + nametext).val().trim() != "" && $("#" + datevalue).val().trim() != "") {
//         filledCertidetails = true;
//     } else {
//         /*  sAlert.error('Please enter all the required fields for certifying this form.', {
//               timeout: 3000,
//               onClose: function() {
//                   console.log('Primary Care- closing alert in 1000ms...');
//               },
//               effect: 'bouncyflip',
//               html: true,
//               position: 'top-left',
//               width: '400px'
//           });
//           setTimeout(function() {
//               sAlert.closeAll();
//           }, 3000);*/
//         if (screen === "screening")
//             showErrormessage("PCScreening", "Please check the acknowledgement checkbox, enter the Physician Name and Date for certifying this form.", true);
//         else if (screen === 'treatment') {
//             showErrormessage("PCTreatment", "Please check the acknowledgement checkbox, enter the Physician Name and Date for certifying this form.", true);
//         }
//         return;
//     }

//     return filledCertidetails;
// }

function replace_last_comma_with_and(x) {
    var pos = x.lastIndexOf(',');
    return x.substring(0, pos) + ' and ' + x.substring(pos + 1);
}

let showSAlert = (message) => {
    sAlert.error(message, {
        timeout: 3000,
        onClose: function() {
            console.log('Primary Care- closing alert in 1000ms...');
        },
        effect: 'bouncyflip',
        html: true,
        position: 'top-left',
        width: '400px'
    });
    setTimeout(function() {
        sAlert.closeAll();
    }, 3000);

}

let showSAlertSuccess = (message) => {
    /*  sAlert.success(message, {
          timeout: 1500,
          onClose: function() {
              console.log('Primary Care - closing alert in 1000ms...');
          },
          effect: 'bouncyflip',
          html: true,
          position: 'top-left',
          width: '400px'
      });
      setTimeout(function() {
          sAlert.closeAll();
          // Router.current().render(Template.Patient);
          Router.current().render(Template.screeningEvaulationTool);
      }, 3000);*/

    // var msg = alertify.alert('Primary Care', message);
    // setTimeout(function() {
    //     msg.destroy();
    //     Router.current().render(Template.screeningEvaulationTool);
    // }, 3000);

    //$('.successmessagePopup').show();
    //$('.negativeFeedbackForm').show();
    $('.formReviewPopup').show();
    $('.successmessagePopup-container').html(message);
}

let removeCertificationDetails = (container) => {
    $(container).find('input[type=checkbox]').prop("checked", false);
    $(container).find('input[type=text]').val("");
}

let checkDemographicsSelectedValues = () => {
    var a = [];
    $(".demographics:checked").each(function() {
        if (this.value == "Yes")
            a.push(this.value);
    });
    return a;
}

let checkEvaluationSpecialistRequiredSelectedValues = () => {
    var a = [];
    $(".requiresSpecialist:checked").each(function() {
        if (this.value == "Yes") {
            a.push(this.value);
        }
    });
    return a;
}

let checkEvaluationSpecialistRequiredSelectedNames = () => {

    var names = [];
    $(".requiresSpecialist:checked").each(function() {
        if (this.value == "Yes") {
            var itemName = "";
            switch (this.name) {
                case "seriousdeseasesFibrosisTest":
                    itemName = "Fibrosis";
                    break;
                case "CommChildPughTest":
                    itemName = "Cirrhosis Child-Pugh";
                    break;
                case "seriousdeseasesLymphomaTest":
                    itemName = "Lymphoma";
                    break;
                case "seriousdeseasesRenalinsufficiencyTest":
                    itemName = "Renal insufficiency";
                    break;
                case "seriousdeseasesCryoglobulinemiaTest":
                    itemName = "Cryoglobulinemia";
                    break;
                case "seriousdeseasesLivertransplantTest":
                    itemName = "Liver Transplant";
                    break;
                case "seriousdeseasesMediHIV1Co":
                    itemName = "HIV-1 co-infection";
                    break;
                case "seriousdeseasesMediHEPAB":
                    itemName = "Hepatitis B co-infection";
                    break;
                case "seriousdeseasesMediType2Diabetes":
                    itemName = "Type 2 Diabetes Mellitus";
                    break;
                case "seriousdeseasesMediPorphyria":
                    itemName = "Porphyria Cutanea Tarda";
                    break;
                case "treatmentexperienced":
                    itemName = "Treatment Experienced";
                    break;
                default:
                    itemName = "Invalid Day";

            }
            names.push(itemName);
        }
    });

    return names;
}

let checkEvaluationSpecialistRequiredDuringTreatmentSelectedValues = () => {
    var a = [];
    $(".requiresSpecialistduringTreatment:checked").each(function() {
        if (this.value == "Yes")
            a.push(this.value);
    });
    return a;
}

function hideMessages() {
    showErrormessage("intravenousDrugUser", '', false);
    showErrormessage("HIVUser", '', false);
    showErrormessage("hemodialysisUser", '', false);
    showErrormessage("bloodTransUser", '', false);
    showErrormessage("patientALT", '', false);
    showErrormessage("patientStatus", '', false);
    showErrormessage("patientbirth", '', false);
    showErrormessage("seriousdeseasesPatientmanSex", '', false);
    showErrormessage("seriousdeseasesPatienthcvinfected", '', false);
    showErrormessage("seriousdeseasesPatientwomenchildbearing", '', false);
    showErrormessage("seriousdeseaseshisincarc", '', false);
    showErrormessage("HepaCPatient", '', false);
}

function hideMessagesWithValidation() {
    if ($('input[name=intravenousDrugUser]:checked').length == 0)
        showErrormessage("intravenousDrugUser", '', false);
    if ($('input[name=HIVUser]:checked').length == 0)
        showErrormessage("HIVUser", '', false);
    if ($('input[name=hemodialysisUser]:checked').length == 0)
        showErrormessage("hemodialysisUser", '', false);
    if ($('input[name=bloodTransUser]:checked').length == 0)
        showErrormessage("bloodTransUser", '', false);
    if ($('input[name=patientALT]:checked').length == 0)
        showErrormessage("patientALT", '', false);
    if ($('input[name=patientStatus]:checked').length == 0)
        showErrormessage("patientStatus", '', false);
    if ($('input[name=patientbirth]:checked').length == 0)
        showErrormessage("patientbirth", '', false);
    if ($('input[name=seriousdeseasesPatientmanSex]:checked').length == 0)
        showErrormessage("seriousdeseasesPatientmanSex", '', false);
    if ($('input[name=seriousdeseasesPatienthcvinfected]:checked').length == 0)
        showErrormessage("seriousdeseasesPatienthcvinfected", '', false);
    if ($('input[name=seriousdeseasesPatientwomenchildbearing]:checked').length == 0)
        showErrormessage("seriousdeseasesPatientwomenchildbearing", '', false);
    if ($('input[name=seriousdeseaseshisincarc]:checked').length == 0)
        showErrormessage("seriousdeseaseshisincarc", '', false);
    if ($('input[name=HepaCPatient]:checked').length == 0)
        showErrormessage("HepaCPatient", '', false);
}

// Jayesh 02th MAR 2017
// update and validate screen I data
// Nisha 03/20/2017 Modified as per new rules
let updatePatientScreenIData = (patientDetails, redirectFlag) => {
    SetDemographicsItemsNull();
    let birthYear = moment($('#patientBirthYear').val()).year(); //parseInt($('#patientBirthYear').val());
    let today = moment();
    let patientID = $('#txtPatientId').val();
    if ($('input[name=PhysicianPlan]:checked').length > 0) {
        patientDetails.PhysicianPlan = $('input[name=PhysicianPlan]:checked').val();
        patientDetails.patientIDType = $('#ddlPatientIDType').val();

        if ($('input[name=treatmentPlanType]:checked').length > 0) {
            var plantype = $('input[name=treatmentPlanType]:checked').val();
            showErrormessage("treatmentPlanType", '', false);
            if (patientID == "") {
                // showValidationMessage('Please enter patient ID!');
                // showSAlert('Please enter patient ID!');
                showErrormessage("txtPatientId", 'Please enter patient ID!', true);
                showErrormessage("treatmentPlanType", '', false);
                hideResultMessage();
                showValidationMessage("Please fill in details before moving further! ");
                setTimeout(function() {
                    hideValidationMessage();
                }, 5000);
                return;

            } else
                patientDetails.patientID = patientID;
            showErrormessage("txtPatientId", '', false);

            if (birthYear < today.year() && birthYear >= 1900) {
                // if ($('input[name=treatmentPlanType]:checked').length > 0) {
                //     var plantype = $('input[name=treatmentPlanType]:checked').val();
                patientDetails.plantype = plantype;
                // set patient birth year
                let datebirthtosave = $('#patientBirthYear').val();
                patientDetails.birthYear = moment(datebirthtosave).format("YYYY-MM-DD"); //datebirthtosave;

                showErrormessage("patientBirthYear", '', false);
                // if (birthYear <= 1965 && birthYear >= 1945) { //1957 check
                //     // showResultMessageDemographics('Hepatitis C testing is recommended.');
                //     // $('#screenPartI').hide();
                //     // $('#screenPartII').show();
                //     // hideValidationMessage();
                //     // hideResultMessage();
                //     // hideResultMessageDemographics();
                //     // IncreaseScreen();
                // } else {
                //Added By Jayesh 14th april 2017 Treatment Path - Demographics page - make items E, C and G mandatory.
                if (patientDetails.PhysicianPlan == 'Treatment') {
                    if ($('input[name=hemodialysisUser]:checked').length == 0) {
                        showErrormessage("hemodialysisUser", 'Please select an option!', true);
                        showValidationMessage("Please fill in details before moving further! ");
                        setTimeout(function() {
                            hideValidationMessage();
                        }, 5000);
                        return;
                    } else if ($('input[name=patientStatus]:checked').length == 0) {
                        showErrormessage("patientStatus", 'Please select an option!', true);
                        showValidationMessage("Please fill in details before moving further! ");
                        setTimeout(function() {
                            hideValidationMessage();
                        }, 5000);
                        return;
                    } else if ($('input[name=seriousdeseasesPatientmanSex]:checked').length == 0) {
                        showErrormessage("seriousdeseasesPatientmanSex", 'Please select an option!', true);
                        showValidationMessage("Please fill in details before moving further! ");
                        setTimeout(function() {
                            hideValidationMessage();
                        }, 5000);
                        return;
                    }
                }

                if ((birthYear <= 1965 && birthYear >= 1945) || ($('input[name=intravenousDrugUser]:checked').length > 0 ||
                        $('input[name=HIVUser]:checked').length > 0 ||
                        $('input[name=hemodialysisUser]:checked').length > 0 ||
                        $('input[name=bloodTransUser]:checked').length > 0 ||
                        $('input[name=patientALT]:checked').length > 0 ||
                        $('input[name=patientStatus]:checked').length > 0 ||
                        $('input[name=patientbirth]:checked').length > 0 ||
                        $('input[name=seriousdeseasesPatientmanSex]:checked').length > 0 ||
                        $('input[name=seriousdeseasesPatienthcvinfected]:checked').length > 0 ||
                        $('input[name=seriousdeseasesPatientwomenchildbearing]:checked').length > 0 ||
                        $('input[name=seriousdeseaseshisincarc]:checked').length > 0 ||
                        $('input[name=HepaCPatient]:checked').length > 0
                    )) {
                    patientDetails.intravenousDrugUser = $('input[name=intravenousDrugUser]:checked').val();
                    patientDetails.HIVUser = $('input[name=HIVUser]:checked').val();
                    patientDetails.hemodialysisUser = $('input[name=hemodialysisUser]:checked').val();
                    patientDetails.bloodTransUser = $('input[name=bloodTransUser]:checked').val();
                    patientDetails.patientALT = $('input[name=patientALT]:checked').val();
                    patientDetails.patientStatus = $('input[name=patientStatus]:checked').val();
                    patientDetails.patientbirth = $('input[name=patientbirth]:checked').val();
                    patientDetails.seriousdeseasesPatientmanSex = $('input[name=seriousdeseasesPatientmanSex]:checked').val();
                    patientDetails.seriousdeseasesPatienthcvinfected = $('input[name=seriousdeseasesPatienthcvinfected]:checked').val();
                    patientDetails.seriousdeseasesPatientwomenchildbearing = $('input[name=seriousdeseasesPatientwomenchildbearing]:checked').val();
                    patientDetails.seriousdeseaseshisincarc = $('input[name=seriousdeseaseshisincarc]:checked').val();
                    patientDetails.HepaCPatient = $('input[name=HepaCPatient]:checked').val();
                    // patientDetails.DemographicsComments = $('#DemographicsResultMsgContent').html();
                    hideMessages();

                    // if (!dataRendered) {
                    //     if (patientDetails.prevHepaCPatient != patientDetails.HepaCPatient) {
                    //         // clearScreen2Details('#screenPartII');
                    //     }
                    // }
                    // patientDetails.HepaCPatient == 'Yes' &&
                    if (patientDetails.PhysicianPlan == 'Treatment') {
                        patientDetails.DemographicsComments = "Please move right on to Evaluation Module.";
                        $('#screenPartI').hide();
                        hideEvaluationMessages();
                        if (patientDetails.HepaCPatient == 'Yes') {
                            patientDetails.seriousdeseasesMediHIV1Co = null;
                            patientDetails.seriousdeseasesMediHEPAB = null;
                            patientDetails.seriousdeseasesMediType2Diabetes = null;
                            patientDetails.seriousdeseasesMediPorphyria = null;
                            removeSelectedRadio('#divEvalHighRisk');
                            $('#divEvalHighRisk').hide();
                            MessageEvaluation();

                        } else
                            $('#divEvalHighRisk').show();

                        if (patientDetails.plantype == "Commercial")
                            $("#fibrolabel").show();
                        else
                            $("#fibrolabel").hide();

                        $('#screenPartIII').show();



                        $("#divaccEvaluation>div.active").removeClass("active");
                        $('#divaccEvalHcvStatuscontent [id^=diverror]').hide();
                        $('#divaccEvalHcvStatus').addClass("active");
                        $('#divaccEvalHcvStatuscontent').addClass("active");

                        hideValidationMessage();
                        hideResultMessage();
                        IncreaseScreen();

                        if (editdataRendered || dataRendered) {
                            if ($('.pcp-eval-hepa li').length > 0)
                                $('.pcp-eval-hepa .asterik').hide();
                            else
                                $('.pcp-eval-hepa .asterik').show();

                            if ($('.pcp-eval-labresults li').length > 0)
                                $('.pcp-eval-labresults .asterik').hide();
                            else
                                $('.pcp-eval-labresults .asterik').show();
                        }
                        return;
                    } else {
                        let birthYear = moment($('#patientBirthYear').val()).year();
                        let selections = checkDemographicsSelectedValues();
                        if (selections.length > 0 || (birthYear <= 1965 && birthYear >= 1945))
                            patientDetails.DemographicsComments = 'Hepatitis C testing is recommended.';
                        $('#screenPartI').hide();
                        $('#screenPartII').show();
                        $('#divaccScreening').addClass("active");
                        $('#divaccScreeningContent').addClass("active");

                        showErrormessage("PCScreening", "", false);
                        if ($('input[name=antibodyPatientTest]:checked').length == 0)
                            $('input[name=antibodyPatientTest]').attr("disabled", "disabled");
                        // if (patientDetails.PhysicianPlan != 'Treatment')
                        //     $("#divPhysicianCertificationScreening").show();
                        // else
                        //     $("#divPhysicianCertificationScreening").hide();
                        hideValidationMessage();
                        hideResultMessage();
                        // hideResultMessageDemographics();
                        ShowHideSubmitScreen2();
                        IncreaseScreen();
                        if (dataRendered) {
                            $("#btnScreeningPartIISubmit").hide();
                            $("#divViewSummary").show();
                            $("#divsummarttitle").attr('title', "Screening Summary");

                        } else if (editdataRendered) {
                            $("#btnScreeningPartIISubmit").show();
                            $("#divViewSummary").show();
                            $("#divsummarttitle").attr('title', "Screening Summary");
                        }
                        return;
                    }
                } else { // if 5-12 is not selected
                    if (redirectFlag) {
                        // showValidationMessage('Please select an option for either Questions #5-#12!');
                        // showSAlert('Please select an option for either Questions #5-#12!');
                        showErrormessage("intravenousDrugUser", 'Please select an option!', true);
                        showErrormessage("HIVUser", 'Please select an option!', true);
                        showErrormessage("hemodialysisUser", 'Please select an option!', true);
                        showErrormessage("bloodTransUser", 'Please select an option!', true);
                        showErrormessage("patientALT", 'Please select an option!', true);
                        showErrormessage("patientStatus", 'Please select an option!', true);
                        showErrormessage("patientbirth", 'Please select an option!', true);
                        showErrormessage("seriousdeseasesPatientmanSex", 'Please select an option!', true);
                        showErrormessage("seriousdeseasesPatienthcvinfected", 'Please select an option!', true);
                        showErrormessage("seriousdeseasesPatientwomenchildbearing", 'Please select an option!', true);
                        showErrormessage("seriousdeseaseshisincarc", 'Please select an option!', true);
                        showErrormessage("HepaCPatient", 'Please select an option!', true);
                        hideResultMessage();
                        return;
                    }
                }
                // }
            } else {
                // showSAlert("Please enter valid patient's date of birth !");

                showErrormessage("patientBirthYear", 'Please enter valid patient\'s date of birth !', true);
                hideResultMessage();
                showValidationMessage("Please fill in details before moving further! ");
                setTimeout(function() {
                    hideValidationMessage();
                }, 5000);
                return;
            }

        } else {
            // showValidationMessage("Please fill in details before moving further! ");
            // showSAlert('Please select treatment plan type !');
            showErrormessage("treatmentPlanType", 'Please select treatment plan type !', true);
            hideResultMessage();
            showValidationMessage("Please fill in details before moving further! ");
            setTimeout(function() {
                hideValidationMessage();
            }, 5000);
            return;
        }


    } else {
        showErrormessage("PhysicianPlan", 'Please select Treat/Screen plan type!', true);
        hideResultMessage();
        showValidationMessage("Please fill in details before moving further! ");
        setTimeout(function() {
            hideValidationMessage();
        }, 5000);
        return;
    }
}


let showErrormessage = (tid, tmessage, flag) => {
    var message = `<div class="col-md-12  errorContainer">
<p id="DemographicsResultMsgContent" style="font-size:14px;text-align:left;" for="DemographicsResultMsgContent" class="control-label errorText DemographicsResultMsgContent">${tmessage} 
</p></div>`;
    $("#diverror" + tid).empty();
    if (flag) {
        $("#diverror" + tid).html(message);
        $("#diverror" + tid).show();
    } else {
        $("#diverror" + tid).hide();
    }
}

let showRecommendationMessage = (tid, tmessage, flag) => {
    var message = `<div class="col-md-12  recommendationContainer">
<p id="DemographicsResultMsgContent" style="font-size:14px;text-align:left;" for="DemographicsResultMsgContent" class="control-label recommendation DemographicsResultMsgContent">${tmessage} 

<span style="float:right;">Reference :<a target="_blank" href="http://www.gastro.org/practice/practice-management/395-005PNQ_13-1_HCV_Branded_Algorithm_Web.pdf">The AGA Institute</a></span>
  
</p>
                                                </div>`;
    $("#diverror" + tid).empty();
    if (flag) {
        $("#diverror" + tid).html(message);
        $("#diverror" + tid).show();
    } else {
        $("#diverror" + tid).hide();
    }
}


let showRecommendationMessageScreening = (tid, tmessage, flag) => {
    var message = `<div class="col-md-12  recommendationContainer">
<p id="DemographicsResultMsgContent" style="font-size:14px;text-align:left;" for="DemographicsResultMsgContent" class="control-label recommendation DemographicsResultMsgContent">${tmessage} 
  </p> </div>`;
    $("#diverror" + tid).empty();
    if (flag) {
        $("#diverror" + tid).html(message);
        $("#diverror" + tid).show();
    } else {
        $("#diverror" + tid).hide();
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Nisha 03/09/2017 Function to validate the entered patient details
let SubmitPatientScreenIIData = (patientDetails) => {
    SetScreeningItemsNull();
    let ddlgenotype = $('#ddlgenotype').val();
    let HcvRnaTestResultDate = $('#txtHcvRnaTestResultDate').val();
    let HcvRnaTestGenotypeDate = $('#txtHcvRnaTestGenotypeDate').val();
    if ($('input[name=antibodyTest]:checked').length > 0) {
        let antibodyTest = checkInputvalues("antibodyTest");

        showErrormessage("antibodyTest", '', false);
        patientDetails.antibodyTest = antibodyTest;
        if (antibodyTest == 'No') {
            showSAlertSuccess('Screening submitted successfully!');
            // showResultMessage('The AGA Institute recommends patient is all right.');
            // hideValidationMessage();
        } else if (antibodyTest == 'Yes') {
            if ($('input[name=antibodyPatientTest]:checked').length !== 0) {
                let antibodyPatientTest = checkInputvalues("antibodyPatientTest");

                showErrormessage("antibodyPatientTest", '', false);
                patientDetails.antibodyPatientTest = antibodyPatientTest;
                if (antibodyPatientTest == 'Positive') {

                    showErrormessage("HCVAntiBodyResultQue", '', false);
                    let txtHcvRnaTestResult = $('#txtHcvRnaTestResult').val();

                    if (txtHcvRnaTestResult !== '') {
                        patientDetails.txtHcvRnaTestResult = txtHcvRnaTestResult;
                    } else {
                        // showValidationMessageS2('Please enter Hepatitis C Antibody test Result!');
                        // showSAlert('Please enter Hepatitis C Antibody test Result!');
                        showErrormessage("HCVAntiBodyResultQue", 'Please enter Hepatitis C Antibody test Result!', true);
                        hideResultMessage();
                        return;
                    }
                    if (HcvRnaTestResultDate != '') {
                        patientDetails.HcvRnaTestResultDateScreening = formatDateMoment().setSaveDate(HcvRnaTestResultDate);
                        // patientDetails.HcvRnaTestGenotypeDateScreening = HcvRnaTestGenotypeDate;
                    } else {
                        showErrormessage("HCVAntiBodyResultQue", 'Please enter HCV RNA lab test date!', true);
                        hideResultMessage();
                        return;
                    }

                    if (ddlgenotype !== '') {
                        patientDetails.genotype = ddlgenotype;
                    } else {
                        // showValidationMessageS2('Please select valid genotype for Hepatitis C diagnosis!');
                        // showSAlert('Please select valid genotype for Hepatitis C diagnosis!');
                        showErrormessage("HCVAntiBodyResultQue", 'Please select valid genotype for Hepatitis C diagnosis!', true);
                        hideResultMessage();
                        return;
                    }
                    if (HcvRnaTestGenotypeDate != '') {
                        patientDetails.HcvRnaTestGenotypeDateScreening = formatDateMoment().setSaveDate(HcvRnaTestGenotypeDate);
                    } else {
                        showErrormessage("HCVAntiBodyResultQue", 'Please enter HCV RNA Genotype date!', true);
                        hideResultMessage();
                        return;
                    }

                    patientDetails.ScreeningComments = null;

                    if (editdataRendered) {
                        Meteor.call('UPDATE_PATIENT_SCREENINGTREATMENT_DATA', patientDetails, function(error, result) {
                            if (error) {
                                console.log("error", error);
                            } else {
                                showSAlertSuccess('Screening updated successfully!');

                                var email = ['nisha@binaryrepublik.com', 'arvind.mepani@binaryrepublik.com'];
                                var mailFields = {
                                    to: email,
                                    subject: 'Updated PCP Request',
                                    type: 6, // PCP Submit
                                    site: window.location.href,
                                    physician: Meteor.user().profile.userDetail.first_name
                                };

                                Meteor.call('sendEmail', mailFields, function(err, res) {
                                    console.log("Email send successfully");

                                });

                            }
                        });
                    } else {


                        Meteor.call('INSERT_PATIENT_SCREENINGTREATMENT_DATA', patientDetails, function(error, result) {
                            if (error) {
                                console.log("error", error);
                            } else {
                                showSAlertSuccess('Screening submitted successfully!');

                                var email = ['nisha@binaryrepublik.com', 'arvind.mepani@binaryrepublik.com'];
                                var mailFields = {
                                    to: email,
                                    subject: 'New PCP Request',
                                    type: 6, // PCP Submit
                                    site: window.location.href,
                                    physician: Meteor.user().profile.userDetail.first_name
                                };

                                Meteor.call('sendEmail', mailFields, function(err, res) {
                                    console.log("Email send successfully");

                                });

                            }
                        });
                    }
                } else if (antibodyPatientTest == 'Negative') {
                    patientDetails.ScreeningComments = "Primary Care done successfully. Patient with Negative Hepatitis C Antibody test result need not be revisited.";
                    //add date 
                    patientDetails.HcvRnaTestResultDateScreening = HcvRnaTestResultDate != "" ? formatDateMoment().setSaveDate(HcvRnaTestResultDate) : null;
                    patientDetails.genotype = ddlgenotype != '' ? ddlgenotype : null;
                    patientDetails.HcvRnaTestGenotypeDateScreening = HcvRnaTestGenotypeDate != "" ? formatDateMoment().setSaveDate(HcvRnaTestGenotypeDate) : null;;

                    if (editdataRendered) {
                        Meteor.call('UPDATE_PATIENT_SCREENINGTREATMENT_DATA', patientDetails, function(error, result) {
                            if (error) {
                                console.log("error", error);
                            } else {
                                showSAlertSuccess('Screening updated successfully!');

                                var email = ['nisha@binaryrepublik.com', 'arvind.mepani@binaryrepublik.com'];
                                var mailFields = {
                                    to: email,
                                    subject: 'Updated PCP Request',
                                    type: 6, // PCP Submit
                                    site: window.location.href,
                                    physician: Meteor.user().profile.userDetail.first_name
                                };

                                Meteor.call('sendEmail', mailFields, function(err, res) {
                                    console.log("Email send successfully");

                                });

                            }
                        });
                    } else {

                        Meteor.call('INSERT_PATIENT_SCREENINGTREATMENT_DATA', patientDetails, function(error, result) {
                            if (error) {
                                console.log("error", error);
                            } else {
                                //console.log("success");
                                showSAlertSuccess('Screening submitted successfully!');

                                var email = ['nisha@binaryrepublik.com', 'arvind.mepani@binaryrepublik.com'];
                                var mailFields = {
                                    to: email,
                                    subject: 'New PCP Request',
                                    type: 6, // PCP Submit
                                    site: window.location.href,
                                    physician: Meteor.user().profile.userDetail.first_name
                                };

                                Meteor.call('sendEmail', mailFields, function(err, res) {
                                    console.log("Email send successfully");

                                });

                            }
                        });
                    }
                    hideResultMessage();
                }
            } else {
                // showValidationMessageS2('Please select option of Hepatitis C Antibody test!');
                // showSAlert('Please select option of Hepatitis C Antibody test!');
                showErrormessage("antibodyPatientTest", 'Please select option of Hepatitis C Antibody test!', true);
                hideResultMessage();
            }
        }

    } else {
        // showValidationMessageS2('Please select an option!');
        // showSAlert('Please select an option!');
        showErrormessage("antibodyTest", 'Please select an option!', true);
        hideResultMessage();
    }
}

// Nisha 03/09/2017 Function to validate the entered patient details
let validatePatientScreenIIData = (patientDetails) => {
    SetScreeningItemsNull();
    let ddlgenotype = $('#ddlgenotype').val();
    let HcvRnaTestResultDate = $('#txtHcvRnaTestResultDate').val();
    let HcvRnaTestGenotypeDate = $('#txtHcvRnaTestGenotypeDate').val();

    showErrormessage("antibodyTest", '', false);
    showErrormessage("antibodyPatientTest", '', false);
    showErrormessage("HCVAntiBodyResultQue", '', false);
    if ($('input[name=antibodyTest]:checked').length == 0) {
        // showSAlert('Please select an option!');
        showErrormessage("antibodyTest", 'Please select an option!', true);
        hideResultMessage();
        return;
    }

    if (patientDetails.HepaCPatient && patientDetails.HepaCPatient == 'Yes') {
        $('#screenPartII').hide();
        hideEvaluationMessages();
        $('#screenPartIII').show();
        hideValidationMessage();
        hideResultMessage();
        IncreaseScreen();
        return;
    }
    // } else {
    //     showValidationMessageS2('Please select an option!');
    //     hideResultMessage();
    //     return;
    // }
    else if ($('input[name=antibodyTest]:checked').length > 0) {
        let antibodyTest = checkInputvalues("antibodyTest");

        patientDetails.antibodyTest = antibodyTest;
        if (antibodyTest == 'No') {
            showRecommendationMessageScreening("antibodyTest", 'Please send patient to have blood drawn for hepatitis C antibody.', true);
            return;
        } else if (antibodyTest == 'Yes') {
            if ($('input[name=antibodyPatientTest]:checked').length !== 0) {
                // showErrormessage("antibodyPatientTest", '', false);
                let antibodyPatientTest = checkInputvalues("antibodyPatientTest");

                patientDetails.antibodyPatientTest = antibodyPatientTest;
                if (antibodyPatientTest == 'Positive') {
                    // showErrormessage("HCVAntiBodyResultQue", '', false);
                    let txtHcvRnaTestResult = $('#txtHcvRnaTestResult').val();

                    if (txtHcvRnaTestResult !== '') {
                        patientDetails.txtHcvRnaTestResult = txtHcvRnaTestResult;
                        $('#txtHcvRnaTestResultEval').val(txtHcvRnaTestResult);
                    } else {
                        // showValidationMessageS2('Please enter Hepatitis C Antibody test Result!');
                        // showSAlert('Please enter Hepatitis C Antibody test Result!');
                        showErrormessage("HCVAntiBodyResultQue", 'Please enter Hepatitis C Antibody test Result!', true);
                        hideResultMessage();
                        return;
                    }
                    if (ddlgenotype !== '') {
                        patientDetails.genotype = ddlgenotype;
                        $('#ddlgenotypeEval').val(ddlgenotype);
                    } else {
                        // showValidationMessageS2('Please select valid genotype for Hepatitis C diagnosis!');
                        // showSAlert('Please select valid genotype for Hepatitis C diagnosis!');
                        showErrormessage("HCVAntiBodyResultQue", 'Please select valid genotype for Hepatitis C diagnosis!', true);
                        hideResultMessage();
                        return;
                    }
                    patientDetails.HcvRnaTestResultDateScreening = formatDateMoment().setSaveDate(HcvRnaTestResultDate);
                    $('#txtHcvRnaTestResultDateEval').val(formatDateMoment().setDate(HcvRnaTestResultDate));
                    patientDetails.HcvRnaTestGenotypeDateScreening = formatDateMoment().setSaveDate(HcvRnaTestGenotypeDate);
                    $('#txtHcvRnaTestGenotypeDateEval').val(formatDateMoment().setDate(HcvRnaTestGenotypeDate));


                    // if (HcvRnaTestResultDate != '') {

                    // } else {
                    //     // showValidationMessageS2('Please enter HCV RNA lab test date!');
                    //     // showSAlert('Please enter HCV RNA lab test date!');
                    //     showErrormessage("HCVAntiBodyResultQue", 'Please enter HCV RNA lab test date!', true);
                    //     hideResultMessage();
                    //     return;
                    // }
                    $('#screenPartII').hide();
                    hideEvaluationMessages();
                    $('#screenPartIII').show();
                    hideValidationMessage();
                    hideResultMessage();
                    IncreaseScreen();
                } // else {
                //     // showValidationMessageS2('Please select an option!');
                //     showSAlert('Please select an option!');
                //     hideResultMessage();
                // }
            } else {
                // showValidationMessageS2('Please select option of Hepatitis C Antibody test!');
                // showSAlert('Please select option of Hepatitis C Antibody test!');
                showErrormessage("antibodyPatientTest", 'Please select option of Hepatitis C Antibody test!', true);
                hideResultMessage();
            }
        }
    }
}

function hideEvaluationMessages() {
    showErrormessage("HcvRnaTestEvaluation", '', false);
    showErrormessage("FibrosisTestValues", '', false);
    showErrormessage("CirrhosisTestValues", '', false);
    showErrormessage("TreatmentExperienced", '', false);
    showErrormessage("txtEvalHepaBantigen", '', false);
    showErrormessage("txtEvalHepaBantibody", '', false);
    showErrormessage("txtEvalHepaBcoreantibodytotal", '', false);
    showErrormessage("txtEvalHepaAantibody", '', false);
    showErrormessage("txtEvalHIVantibody", '', false);
    showErrormessage("txtEvalNS5Apolymorphisms", '', false);
    showErrormessage("txtAST", '', false);
    showErrormessage("txtALT", '', false);
    showErrormessage("txtEvalWBC", '', false);
    showErrormessage("txtEvalPlatelets", '', false);
    showErrormessage("txtEvalHemoglobin", '', false);
    showErrormessage("txtEvalAST", '', false);
    showErrormessage("txtEvalALT", '', false);
    showErrormessage("txtEvalBilirubin", '', false);
    showErrormessage("txtEvalAlbumin", '', false);
    showErrormessage("txtEvalINR", '', false);
    showErrormessage("txtEvalSerumCr", '', false);
    showErrormessage("txtEvalSerumSodium", '', false);
}
//// yuvraj code 
function checkvalue(val) {
    if (val === "others")
        document.getElementById('color').style.display = 'block';
    else
        document.getElementById('color').style.display = 'none';
}
// Jayesh 02th MAR 2017
// update and validate screen II data
/*let updatePatientScreenIIData = (patientDetails) => {
        let negativeTestResultMsg = `The AGA Institute recommends If patient has ongoing high risk behaviors,
                    conduct counseling, retesting and other testing as appropriate.
                    <br /> <br />
                    Persons who use or inject illegal drugs should be advised: to stop using and injecting drugs; to enter and complete
                    substance abuse treatment.
                    <br /> <br />
                    Persons who are at risk for sexually transmitted diseases should be advised: that the surest way to prevent the
                    spread of HIV infection and other STDs is to have sex with only one uninfected partner or not to have sex at all; to use
                    latex condoms correctly and every time to protect themselves and their partners from diseases.`
        if ($('input[name=antibodyTest]:checked').length > 0) {
            let antibodyTest = $('input[name=antibodyTest]:checked').val();
            patientDetails.antibodyTest = antibodyTest;
            if (antibodyTest == 'No') {
                //$('#screenPartII').hide();
                showResultMessage('The AGA Institute recommends to conduct HCV Anybody test.');
                hideValidationMessage();
            } else if (antibodyTest == 'Yes' && $('input[name=js-HcvRnaTest]:checked').length > 0) {

                let antibodyTestResult = $('input[name=js-HcvRnaTest]:checked').val();
                patientDetails.antibodyTestResult = antibodyTestResult;
                if (antibodyTestResult == 'No') {
                    //$('#screenPartII').hide();
                    showResultMessage(negativeTestResultMsg);
                    hideValidationMessage();
                } else if (antibodyTestResult == 'Yes' && $('input[name=js-HcvRnaTest]:checked').length > 0) {
                    let RNATest = $('input[name=HcvRnaTest]:checked').val();
                    patientDetails.RNATest = RNATest;
                    if (RNATest == 'No') {
                        //$('#screenPartII').hide();
                        showResultMessage('The AGA Institute highly recommends to conduct Quantitative HCV RNA test.');
                        hideValidationMessage();
                    } else if (RNATest == 'Yes') {
                        if ($('#txtHcvRnaTestResult').val()) {
                            let RNATestResult = $('#txtHcvRnaTestResult').val();
                            patientDetails.RNATestResult = RNATestResult;
                            if ($('#txtHcvRnaTestResultDate').val()) {
                                let RNATestDate = $('#txtHcvRnaTestResultDate').val();
                                patientDetails.RNATestDate = RNATestDate;
                                if (RNATestResult <= 0) {
                                    //$('#screenPartII').hide();
                                    showResultMessage(negativeTestResultMsg);
                                    hideValidationMessage();
                                } else {
                                    if (checkTestResultDateMoreSixMonth(RNATestDate)) {
                                        $('#divForRNAMoreSixMonthsTest').show();
                                    } else {
                                        $('#divForRNAMoreSixMonthsTest').hide();
                                    }
                                    $('#screenPartII').hide();

                                    $('#screenPartIII').show();
                                    hideValidationMessage();
                                    hideResultMessage();
                                    IncreaseScreen();
                                    // $('#patientScreenMainTitle').html('Evaluation');
                                }
                            } else {
                                showValidationMessage('Please enter valid date of the HCV RNA Test !');
                                hideResultMessage();
                            }
                        } else {
                            showValidationMessage('Please enter the HCV RNA Test Result !');
                            hideResultMessage();
                        }
                    } else {
                        showValidationMessage('Please select option !');
                        hideResultMessage();
                    }
                } else {
                    showValidationMessage('Please select option !');
                    hideResultMessage();
                }

            } else {
                showValidationMessage('Please select option !');
                hideResultMessage();
            }


        } else {
            showValidationMessage('Please select option !');
            hideResultMessage();
        }

    }*/

let patientTreatmentType = (patientDetails) => {
        //reset values to null 
        SetEvaluationItemsNull();
        hideEvaluationMessages();
        let txtHcvRnaTestResultEval = $('#txtHcvRnaTestResultEval').val();
        let ddlgenotype = $('#ddlgenotypeEval').val();
        let txtHcvRnaTestResultDateEval = $('#txtHcvRnaTestResultDateEval').val();
        let txtHcvRnaTestGenotypeDateEval = $('#txtHcvRnaTestGenotypeDateEval').val();

        if (txtHcvRnaTestResultEval && txtHcvRnaTestResultEval !== '') {
            patientDetails.txtHcvRnaTestResultEval = txtHcvRnaTestResultEval;
        } else {
            // showSAlert('Please send the patient for HCV RNA test.');
            // showValidationMessageS3('Please send the patient for HCV RNA test.');
            // hideResultMessage();
            showErrormessage("HcvRnaTestEvaluation", "Please send the patient for HCV RNA test.", true);
            return;
        }

        if (ddlgenotype !== '') {
            patientDetails.genotype = ddlgenotype;
        } else {
            // showSAlert('Please send the patient for HCV RNA test.');
            showErrormessage("HcvRnaTestEvaluation", "Please send the patient for HCV RNA test.", true);

            // showValidationMessageS3('Please send the patient for HCV RNA test.');
            // hideResultMessage();
            return;
        }
        //get test rna result date
        // let txtRNAResultDateValue = $('#txtHcvRnaTestResultDateEval').val();
        // if (txtRNAResultDateValue) {
        patientDetails.txtEvalRNAResultDate = formatDateMoment().setSaveDate(txtHcvRnaTestResultDateEval);
        patientDetails.HcvRnaTestGenotypeDateEval = formatDateMoment().setSaveDate(txtHcvRnaTestGenotypeDateEval);
        CheckHCVTestDataValidation(txtHcvRnaTestResultDateEval, txtHcvRnaTestGenotypeDateEval);
        // } else {
        //     patientDetails.txtEvalRNAResultDate = null;
        //     showErrormessage("HcvRnaTestEvaluation", "Please send the patient for HCV RNA test.", true);
        //     return;
        // }
        //get alcohol test value
        let alcoholTest = checkInputvalues("alcoholTest");

        patientDetails.alcoholTest = alcoholTest;
        // if (!alcoholTest && alcoholTest !== '') {
        //     patientDetails.alcoholTest = alcoholTest;
        // }

        patientDetails.alcoholstoppedperiod = $("#txtalchoholStopped").val();
        patientDetails.txtalchoholStoppedperiod = $("#alcoholstoppedperiodtype").val();

        let messEvalutionrequiresSpecialist = $('#divEvalutionrequiresSpecialist').text().trim();
        if ($('input[name=seriousdeseasesFibrosisTest]:checked').length !== 0) {
            let seriousdeseasesFibrosisTest = checkInputvalues("seriousdeseasesFibrosisTest");

            patientDetails.seriousdeseasesFibrosisTest = seriousdeseasesFibrosisTest;
            evaluationSelectedFlag = true;
            if (seriousdeseasesFibrosisTest == "Yes") {
                let txtFibroscanScore = $('#txtFibroscanScore').val();
                let txtFibrosistestScore = $('#txtFibrosistestScore').val();
                let txtAPRIscore = $('#txtAPRIscore').val();
                let txtFibroMeterscore = $('#txtFibroMeterscore').val();
                let FibroStage = $('#ddlFibrosisstage').val();
                if (FibroStage.trim() == '') {
                    showErrormessage("FibrosisTestValues", "Please enter the Fibrosis Stage.", true);
                    return;
                } else if (FibroStage.trim() == 'other') {
                    patientDetails.FibroStage = $('#ddlFibrosisstage').val();
                } else
                //  patientDetails.FibroStage = $('#ddlFibrosisstage').val();
                if (txtFibroscanScore.trim() == '' && txtFibrosistestScore.trim() == '' && txtAPRIscore.trim() == '' && txtFibroMeterscore.trim() == '') {
                    // showSAlert('Please enter the Fibrosis test values.');                    
                    showErrormessage("FibrosisTestValues", "Please enter the Fibrosis test values.", true);
                    // showValidationMessageS3('Please enter the Fibrosis test values.');
                    return;
                } else {
                    let errormessage = ""; //Please enter one of the Fibrosis test values.";

                    txtFibroscanScore = checkforValidationTxtSelectOthers('txtFibroscanScore', 'txtFibroscanScoreOthers', "FibrosisTestValues", errormessage); //txtFibroscanScore;
                    txtFibrosistestScore = checkforValidationTxtSelectOthers('txtFibrosistestScore', 'txtFibrosistestScoreOthers', "FibrosisTestValues", errormessage); //txtFibrosistestScore;
                    txtAPRIscore = checkforValidationTxtSelectOthers('txtAPRIscore', 'txtAPRIscoreOthers', "FibrosisTestValues", errormessage); //txtAPRIscore;
                    txtFibroMeterscore = checkforValidationTxtSelectOthers('txtFibroMeterscore', 'txtFibroMeterscoreOthers', "FibrosisTestValues", errormessage); //txtFibroMeterscore;

                    if (txtFibroscanScore == 0 && txtFibrosistestScore == 0 && txtAPRIscore == 0 && txtFibroMeterscore == 0) {
                        return;
                    }
                    if (txtFibroscanScore != 0)
                        patientDetails.txtFibroscanScore = JSON.stringify(txtFibroscanScore);

                    if (txtFibrosistestScore != 0)
                        patientDetails.txtFibrosistestScore = JSON.stringify(txtFibrosistestScore);

                    if (txtAPRIscore != 0)
                        patientDetails.txtAPRIscore = JSON.stringify(txtAPRIscore);

                    if (txtFibroMeterscore != 0)
                        patientDetails.txtFibroMeterscore = JSON.stringify(txtFibroMeterscore);

                }

            }
        }
        // yuvraj
        patientDetails.txtEvalutionrequiresSpecialist = messEvalutionrequiresSpecialist;
        //Praveen 03/23/2017 check for Cirrhosis Child-Pugh score
        if ($('input[name=CommChildPughTest]:checked').length !== 0) {
            let CommChildPughTest = checkInputvalues("CommChildPughTest");
            patientDetails.CommChildPughTest = CommChildPughTest;
            evaluationSelectedFlag = true;
            //if condition is true
            if (CommChildPughTest == "Yes") {

                let txtChildPughscore = checkforValidationTxtSelectOthers("txtChildPughscore", "txtChildPughscoreOthers", "CirrhosisTestValues", "Please enter valid the Cirrhosis Child-Pugh score.");
                if (txtChildPughscore == 0) {
                    return;
                } else {
                    patientDetails.txtChildPughscore = JSON.stringify(txtChildPughscore);

                }

                let txtMELDscore = checkforValidationTxtSelectOthers("txtMELDscore", "txtMELDscoreOthers", "CirrhosisTestValues", "Please enter the MELD score.");
                if (txtMELDscore == 0) {
                    return;
                } else {
                    patientDetails.txtMELDscore = JSON.stringify(txtMELDscore);

                }

                let ifAnyChartNotes = $('input[name=chartnote]:checked').val();
                if (ifAnyChartNotes == "Yes") {
                    //get the uploaded files 

                    patientDetails.CommChildPughTestchartnoteFile = getUploadedfiles("CommChildPughTestfileupload");

                }
                patientDetails.CommChildPughTestchartnote = ifAnyChartNotes;
            }
        }

        if ($('input[name=treatmentexperienced]:checked').length == 0) {
            // showSAlert('Please select is member treatment experienced?');
            // showValidationMessageS3('Please select is member treatment experienced?');
            showErrormessage("TreatmentExperienced", "Please select is member treatment experienced?", true);
            return;
        } else {
            let treatmentexperienced = checkInputvalues("treatmentexperienced");

            patientDetails.treatmentexperienced = treatmentexperienced;
        }
        //Praveen 03/23/2017 check if treatment then get other patient antidoby results 
        if (patientDetails.PhysicianPlan == "Treatment") {

            let EvalHepaBantigenfilel = checkEvalValues("divtxtEvalHepaBantigenfileupload");
            let EvalHepaBantibodyfilel = checkEvalValues("divtxtEvalHepaBantibodyfileupload");
            let EvalHepaBcoreantibodytotalfilel = checkEvalValues("divtxtEvalHepaBcoreantibodytotalfileupload");
            let EvalHepaAantibodyfilel = checkEvalValues("divtxtEvalHepaAantibodyfileupload");
            let EvalHIVantibodyfilel = checkEvalValues("divtxtEvalHIVantibodyfileupload");


            let isAnyHepaFileUploaded = EvalHepaBantigenfilel > 0 || EvalHepaBantibodyfilel > 0 || EvalHepaBcoreantibodytotalfilel > 0 || EvalHepaAantibodyfilel > 0 || EvalHIVantibodyfilel > 0;

            if (!isAnyHepaFileUploaded) {
                let EvalHepaBantigenDate = $("#txtEvalHepaBantigendate").val();
                let txtEvalHepaBantigen = $('#txtEvalHepaBantigen').val();

                if (txtEvalHepaBantigen.trim() == '' || EvalHepaBantigenDate == '') {
                    showErrormessage("txtEvalHepaBantigen", "Please enter Hepatitis B surface antigen value and date or upload related file.", true);
                    return;
                }


                let EvalHepaBantibodyDate = $("#txtEvalHepaBantibodydate").val();
                let txtEvalHepaBantibody = $('#txtEvalHepaBantibody').val();
                if (txtEvalHepaBantibody.trim() == '' || EvalHepaBantibodyDate == '') {
                    showErrormessage("txtEvalHepaBantibody", "Please enter Hepatitis B surface antibody value and date or upload related file.", true);
                    return;
                }

                let EvalHepaBcoreantibodytotalDate = $("#txtEvalHepaBcoreantibodytotaldate").val();
                let txtEvalHepaBcoreantibodytotal = $('#txtEvalHepaBcoreantibodytotal').val();
                if (txtEvalHepaBcoreantibodytotal.trim() == '' || EvalHepaBcoreantibodytotalDate == '') {
                    showErrormessage("txtEvalHepaBcoreantibodytotal", "Please enter Hepatitis B core antibody total value and date or upload related file.", true);
                    return;
                }

                let EvalHepaAantibodyDate = $("#txtEvalHepaAantibodydate").val();
                let txtEvalHepaAantibody = $('#txtEvalHepaAantibody').val();
                if (txtEvalHepaAantibody.trim() == '' || EvalHepaAantibodyDate == '') {
                    showErrormessage("txtEvalHepaAantibody", "Please enter Hepatitis A antibody total value and date or upload related file.", true);
                    return;
                }

                let EvalHIVantibodyDate = $("#txtEvalHIVantibodydate").val();

                let txtEvalHIVantibody = $('#txtEvalHIVantibody').val();
                if (txtEvalHIVantibody.trim() == '' || EvalHIVantibodyDate == '') {
                    showErrormessage("txtEvalHIVantibody", "Please enter HIV antibody value and date or upload related file.", true);
                    return;
                }

            }

            let EvalPlateletsfilel = checkEvalValues("divtxtEvalPlateletsfileupload");
            let EvalWBCfilel = checkEvalValues("divtxtEvalWBCfileupload");
            let filel = checkEvalValues("divtxtEvalPlateletsfileupload");
            let EvalHemoglobinfilel = checkEvalValues("divtxtEvalHemoglobinfileupload");
            let EvalASTfilel = checkEvalValues("divtxtEvalASTfileupload");
            let EvalALTfilel = checkEvalValues("divtxtEvalALTfileupload");
            let EvalBilirubinfilel = checkEvalValues("divtxtEvalBilirubinfileupload");
            let EvalAlbuminfilel = checkEvalValues("divtxtEvalAlbuminfileupload");
            let EvalINRfilel = checkEvalValues("divtxtEvalINRfileupload");
            let EvalSerumCrfilel = checkEvalValues("divtxtEvalSerumCrfileupload");
            let EvalSerumSodiumfilel = checkEvalValues("divtxtEvalSerumSodiumfileupload");


            let isAnyLabResultFileUploaded = EvalWBCfilel > 0 || EvalPlateletsfilel > 0 || EvalHemoglobinfilel > 0 || EvalASTfilel > 0 || EvalALTfilel > 0 || EvalBilirubinfilel > 0 || EvalAlbuminfilel > 0 || EvalINRfilel > 0 || EvalSerumCrfilel > 0 || EvalSerumSodiumfilel > 0;

            if (!isAnyLabResultFileUploaded) {
                let EvalWBCDate = $("#txtEvalWBCdate").val();
                let txtEvalWBC = $('#txtEvalWBC').val();
                if (txtEvalWBC.trim() == '' || EvalWBCDate == '') {
                    showErrormessage("txtEvalWBC", 'Please enter WBC value and date or upload related file.', true);
                    return;
                }

                let EvalPlateletsDate = $("#txtEvalPlateletsdate").val();
                let txtEvalPlatelets = $('#txtEvalPlatelets').val();
                if (txtEvalPlatelets.trim() == '' || EvalPlateletsDate == '') {
                    showErrormessage("txtEvalPlatelets", 'Please enter Platelets value and date or upload related file.', true);
                    return;
                }


                let EvalHemoglobinDate = $("#txtEvalHemoglobindate").val();
                let txtEvalHemoglobin = $('#txtEvalHemoglobin').val();
                if (txtEvalHemoglobin.trim() == '' || EvalHemoglobinDate == '') {
                    showErrormessage("txtEvalHemoglobin", 'Please enter Hemoglobin value and date or upload related file.', true);
                    return;
                }

                let EvalASTDate = $("#txtEvalASTdate").val();
                let txtEvalAST = $('#txtEvalAST').val();
                if (txtEvalAST.trim() == '' || EvalASTDate == '') {
                    showErrormessage("txtEvalAST", 'Please enter AST value and date or upload related file.', true);
                    return;
                }

                let EvalALTDate = $("#txtEvalALTdate").val();
                let txtEvalALT = $('#txtEvalALT').val();
                if (txtEvalALT.trim() == '' || EvalALTDate == '') {
                    showErrormessage("txtEvalALT", 'Please enter ALT value and date or upload related file.', true);
                    return;
                }

                let EvalBilirubinDate = $("#txtEvalBilirubindate").val();
                let txtEvalBilirubin = $('#txtEvalBilirubin').val();
                if (txtEvalBilirubin.trim() == '' || EvalBilirubinDate == '') {
                    showErrormessage("txtEvalBilirubin", 'Please enter Bilirubin value and date or upload related file.', true);
                    return;
                }

                let EvalAlbuminDate = $("#txtEvalAlbumindate").val();
                let txtEvalAlbumin = $('#txtEvalAlbumin').val();
                if (txtEvalAlbumin.trim() == '' || EvalAlbuminDate == '') {
                    showErrormessage("txtEvalAlbumin", "Please enter Albumin value and date or upload related file.", true);
                    return;
                }

                let EvalINRDate = $("#txtEvalINRdate").val();
                let txtEvalINR = $('#txtEvalINR').val();
                if (txtEvalINR.trim() == '' || EvalINRDate == '') {
                    showErrormessage("txtEvalINR", "Please enter INR value and date or upload related file.", true);
                    return;
                }

                let EvalSerumCrDate = $("#txtEvalSerumCrdate").val();
                let txtEvalSerumCr = $('#txtEvalSerumCr').val();
                if (txtEvalSerumCr.trim() == '' || EvalSerumCrDate == '') {
                    showErrormessage("txtEvalSerumCr", "Please enter Serum Creatinine (SCr) value and date or upload related file.", true);
                    return;
                }

                let EvalSerumSodiumDate = $("#txtEvalSerumSodiumdate").val();
                let txtEvalSerumSodium = $('#txtEvalSerumSodium').val();
                if (txtEvalSerumSodium.trim() == '' || EvalSerumSodiumDate == '') {
                    showErrormessage("txtEvalSerumSodium", "Please enter Serum Sodium value and date or upload related file.", true);
                    return;
                }
            }

            /*  if (EvalPlateletsfilel <= 0) {
               
            }

            if (EvalHemoglobinfilel <= 0) {
                let EvalHemoglobinDate = $("#txtEvalHemoglobindate").val();
                let txtEvalHemoglobin = $('#txtEvalHemoglobin').val();
                if (txtEvalHemoglobin.trim() == '' || EvalHemoglobinDate == '') {
                    showErrormessage("txtEvalHemoglobin", 'Please enter Hemoglobin value and date or upload related file.', true);
                    return;
                }
            }

            if (EvalASTfilel <= 0) {
                let EvalASTDate = $("#txtEvalASTdate").val();
                let txtEvalAST = $('#txtEvalAST').val();
                if (txtEvalAST.trim() == '' || EvalASTDate == '') {
                    showErrormessage("txtEvalAST", 'Please enter AST value and date or upload related file.', true);
                    return;
                }
            }

            if (EvalALTfilel <= 0) {
                let EvalALTDate = $("#txtEvalALTdate").val();
                let txtEvalALT = $('#txtEvalALT').val();
                if (txtEvalALT.trim() == '' || EvalALTDate == '') {
                    showErrormessage("txtEvalALT", 'Please enter ALT value and date or upload related file.', true);
                    return;
                }
            }

            if (EvalBilirubinfilel <= 0) {
                let EvalBilirubinDate = $("#txtEvalBilirubindate").val();
                let txtEvalBilirubin = $('#txtEvalBilirubin').val();
                if (txtEvalBilirubin.trim() == '' || EvalBilirubinDate == '') {
                    showErrormessage("txtEvalBilirubin", 'Please enter Bilirubin value and date or upload related file.', true);
                    return;
                }
            }

            if (EvalAlbuminfilel <= 0) {
                let EvalAlbuminDate = $("#txtEvalAlbumindate").val();
                let txtEvalAlbumin = $('#txtEvalAlbumin').val();
                if (txtEvalAlbumin.trim() == '' || EvalAlbuminDate == '') {
                    showErrormessage("txtEvalAlbumin", "Please enter Albumin value and date or upload related file.", true);
                    return;
                }
            }

            if (EvalINRfilel <= 0) {
                let EvalINRDate = $("#txtEvalINRdate").val();
                let txtEvalINR = $('#txtEvalINR').val();
                if (txtEvalINR.trim() == '' || EvalINRDate == '') {
                    showErrormessage("txtEvalINR", "Please enter INR value and date or upload related file.", true);
                    return;
                }
            }

            if (EvalSerumCrfilel <= 0) {
                let EvalSerumCrDate = $("#txtEvalSerumCrdate").val();
                let txtEvalSerumCr = $('#txtEvalSerumCr').val();
                if (txtEvalSerumCr.trim() == '' || EvalSerumCrDate == '') {
                    showErrormessage("txtEvalSerumCr", "Please enter Serum Creatinine (SCr) value and date or upload related file.", true);
                    return;
                }
        }*/

        }
        CheckPatientChrrhosisTreatment(patientDetails);
        //extrahepatic patients data
        if ($('input[name=seriousdeseasesLymphomaTest]:checked').length !== 0) {
            let seriousdeseasesLymphomaTest = checkInputvalues("seriousdeseasesLymphomaTest");

            patientDetails.seriousdeseasesLymphomaTest = seriousdeseasesLymphomaTest;
            evaluationSelectedFlag = true;
        }

        if ($('input[name=seriousdeseasesRenalinsufficiencyTest]:checked').length !== 0) {
            let seriousdeseasesRenalinsufficiencyTest = checkInputvalues("seriousdeseasesRenalinsufficiencyTest");

            patientDetails.seriousdeseasesRenalinsufficiencyTest = seriousdeseasesRenalinsufficiencyTest;
            evaluationSelectedFlag = true;
        }

        if ($('input[name=seriousdeseasesCryoglobulinemiaTest]:checked').length !== 0) {
            let seriousdeseasesCryoglobulinemiaTest = checkInputvalues("seriousdeseasesCryoglobulinemiaTest");

            patientDetails.seriousdeseasesCryoglobulinemiaTest = seriousdeseasesCryoglobulinemiaTest;
            evaluationSelectedFlag = true;
        }
        //liver transplant check data
        if ($('input[name=seriousdeseasesLivertransplantTest]:checked').length !== 0) {
            let seriousdeseasesLivertransplantTest = checkInputvalues("seriousdeseasesLivertransplantTest");

            patientDetails.seriousdeseasesLivertransplantTest = seriousdeseasesLivertransplantTest;
            evaluationSelectedFlag = true;
        }

        //hiv risk characterisitcs
        if ($('input[name=seriousdeseasesMediHIV1Co]:checked').length !== 0) {
            let seriousdeseasesMediHIV1Co = checkInputvalues("seriousdeseasesMediHIV1Co");

            patientDetails.seriousdeseasesMediHIV1Co = seriousdeseasesMediHIV1Co;
            evaluationSelectedFlag = true;
        }
        if ($('input[name=seriousdeseasesMediHEPAB]:checked').length !== 0) {
            let seriousdeseasesMediHEPAB = checkInputvalues("seriousdeseasesMediHEPAB");

            patientDetails.seriousdeseasesMediHEPAB = seriousdeseasesMediHEPAB;
            evaluationSelectedFlag = true;
        }
        if ($('input[name=seriousdeseasesMediType2Diabetes]:checked').length !== 0) {
            let seriousdeseasesMediType2Diabetes = checkInputvalues("seriousdeseasesMediType2Diabetes");

            patientDetails.seriousdeseasesMediType2Diabetes = seriousdeseasesMediType2Diabetes;
            evaluationSelectedFlag = true;
        }
        if ($('input[name=seriousdeseasesMediPorphyria]:checked').length !== 0) {
            let seriousdeseasesMediPorphyria = checkInputvalues("seriousdeseasesMediPorphyria");

            patientDetails.seriousdeseasesMediPorphyria = seriousdeseasesMediPorphyria;
            evaluationSelectedFlag = true;
        }

        if ($('input[name=treatmentexperienced]:checked').length !== 0) {
            let treatmentexperienced = checkInputvalues("treatmentexperienced");

            patientDetails.treatmentexperienced = treatmentexperienced;
            evaluationSelectedFlag = true;
        }

        //Praveen 03/23/2017 check if treatment is Yes then store these other records
        if (patientDetails.treatmentexperienced == "Yes") {
            //add text data 
            patientDetails.listtreatmentregimen = $("#txtlisttreatmentregimen").val();
            //check for complete regimen 
            if ($('input[name=completeregimen]:checked').length !== 0) {
                let completeregimen = checkInputvalues("completeregimen");

                patientDetails.completeregimen = completeregimen;
                //if selection is no
                if (completeregimen == 'No') {
                    //reason for discontinuation
                    let adverseReactions = $('input[id=chkAdverseEvents]:checked').val() !== undefined ? $('input[id=chkAdverseEvents]:checked').val() : "";
                    let patientNonCompl = $('input[id=chkPatientNC]:checked').val() !== undefined ? $('input[id=chkPatientNC]:checked').val() : "";
                    let provPayerIssue = $('input[id=chkProviderPayerIssues]:checked').val() !== undefined ? $('input[id=chkProviderPayerIssues]:checked').val() : "";
                    patientDetails.reasondiscontinue = adverseReactions + "," + patientNonCompl + "," + provPayerIssue;
                }
            }
            //check for type of TEwithNS5A 
            if ($('input[name=TEwithNS5A]:checked').length !== 0) {
                let TEwithNS5A = checkInputvalues("TEwithNS5A");

                patientDetails.TEwithNS5A = TEwithNS5A;
            }

            //check for type of TEwithNS34A 
            if ($('input[name=TEwithNS34A]:checked').length !== 0) {
                let TEwithNS34A = checkInputvalues("TEwithNS34A");

                patientDetails.TEwithNS34A = TEwithNS34A;
            }

            //check for type of response 
            if ($('input[name=patientresponse]:checked').length !== 0) {
                let patientresponse = checkInputvalues("patientresponse");

                patientDetails.patientresponse = patientresponse;
            }
            // if ($('input[name=patientnonresponder]:checked').length !== 0) {
            //     let patientnonresponder = $('input[name=patientnonresponder]:checked').val();
            //     patientDetails.patientresponse = patientnonresponder;
            // }

            //store resultsof hcvrna week and hcv rna result
            patientDetails.txtHCVRNAWeekDurationResponse = $('#ddlHCVRNA').val() || '';
            patientDetails.txtHcvRnaTestResultResponse = $('#txtHCVRNATreatment').val();
        }

        //documented fatigue data 
        if ($('input[name=documentedfatigue]:checked').length !== 0) {
            let documentedfatigue = checkInputvalues("documentedfatigue");

            patientDetails.documentedfatigue = documentedfatigue;
        }

        //Praveen 03/23/2017 Lab Data results

        //Hepatitis B surface antigen
        patientDetails.EvalHepaBantigen = $("#txtEvalHepaBantigen").val();
        patientDetails.EvalHepaBantigenDate = formatDateMoment().setSaveDate($("#txtEvalHepaBantigendate").val());

        //get the uploaded files 

        patientDetails.EvalHepaBantigenfile = getUploadedfiles("divtxtEvalHepaBantigenfileupload");
        //Hepatitis B surface antibody
        patientDetails.EvalHepaBantibody = $("#txtEvalHepaBantibody").val();
        patientDetails.EvalHepaBantibodyDate = formatDateMoment().setSaveDate($("#txtEvalHepaBantibodydate").val());

        //get the uploaded files 

        patientDetails.EvalHepaBantibodyfile = getUploadedfiles("divtxtEvalHepaBantibodyfileupload");

        //Hepatitis B core antibody total
        patientDetails.EvalHepaBcoreantibodytotal = $("#txtEvalHepaBcoreantibodytotal").val();
        patientDetails.EvalHepaBcoreantibodytotalDate = formatDateMoment().setSaveDate($("#txtEvalHepaBcoreantibodytotaldate").val());
        //get the uploaded files 

        patientDetails.EvalHepaBcoreantibodytotalfile = getUploadedfiles("divtxtEvalHepaBcoreantibodytotalfileupload");

        //Hepatitis A antibody total
        patientDetails.EvalHepaAantibody = $("#txtEvalHepaAantibody").val();
        patientDetails.EvalHepaAantibodyDate = formatDateMoment().setSaveDate($("#txtEvalHepaAantibodydate").val());
        //get the uploaded files 

        patientDetails.EvalHepaAantibodyfile = getUploadedfiles("divtxtEvalHepaAantibodyfileupload");


        //HIV antibody
        patientDetails.EvalHIVantibody = $("#txtEvalHIVantibody").val();
        patientDetails.EvalHIVantibodyDate = formatDateMoment().setSaveDate($("#txtEvalHIVantibodydate").val()); //$("#txtEvalHIVantibodydate").val();
        //get the uploaded files 

        patientDetails.EvalHIVantibodyfile = getUploadedfiles("divtxtEvalHIVantibodyfileupload");

        //NS5A resistance-associated polymorphisms (for genotype 1a patients considered for Zepatier therapy)
        if ($('input[name=NS5A]:checked').length !== 0) {
            let EvalNS5Apolymorphismsflag = checkInputvalues("NS5A");

            patientDetails.EvalNS5Apolymorphismsflag = EvalNS5Apolymorphismsflag;
        }

        patientDetails.EvalNS5Apolymorphisms = $("#txtEvalNS5Apolymorphisms").val();
        patientDetails.EvalNS5ApolymorphismsDate = formatDateMoment().setSaveDate($("#txtEvalNS5Apolymorphismsdate").val()); //$("#txtEvalNS5Apolymorphismsdate").val();
        //get the uploaded files 

        patientDetails.EvalNS5Apolymorphismsfile = getUploadedfiles("divtxtEvalNS5Apolymorphismsfileupload");

        //Aspartate transaminase upper and lower limit
        patientDetails.EvalASTUpperLimit = $("#txtEvalASTUpperLimit").val();
        patientDetails.EvalASTLowerLimit = $("#txtEvalASTLowerLimit").val();

        patientDetails.EvalASTLimitDate = formatDateMoment().setSaveDate($("#txtEvalASTLimitdate").val()); //$("#txtEvalASTLimitdate").val();
        //get the uploaded files 

        patientDetails.EvalASTLimitfile = getUploadedfiles("divtxtEvalASTLimitfileupload");

        //Alanine Transaminase (ALT including upper and lower limits within past 3 months
        patientDetails.EvalALTUpperLimit = $("#txtEvalALTUpperLimit").val();
        patientDetails.EvalALTLowerLimit = $("#txtEvalALTLowerLimit").val();
        patientDetails.EvalALTLimitDate = formatDateMoment().setSaveDate($("#txtEvalALTLimitdate").val()); //$("#txtEvalALTLimitdate").val();
        //get the uploaded files 

        patientDetails.EvalALTLimitfile = getUploadedfiles("divtxtEvalALTLimitfileupload");

        //other lab results data  
        //WBC
        patientDetails.EvalWBC = $("#txtEvalWBC").val();
        patientDetails.EvalWBCDate = formatDateMoment().setSaveDate($("#txtEvalWBCdate").val()); //$("#txtEvalWBCdate").val();

        //get the uploaded files 

        patientDetails.EvalWBCfile = getUploadedfiles("divtxtEvalWBCfileupload");
        //Platelets
        patientDetails.EvalPlatelets = $("#txtEvalPlatelets").val();
        patientDetails.EvalPlateletsDate = formatDateMoment().setSaveDate($("#txtEvalPlateletsdate").val()); //("#txtEvalPlateletsdate").val();
        //get the uploaded files 

        patientDetails.EvalPlateletsfile = getUploadedfiles("divtxtEvalPlateletsfileupload");
        //Hemoglobin
        patientDetails.EvalHemoglobin = $("#txtEvalHemoglobin").val();
        patientDetails.EvalHemoglobinDate = formatDateMoment().setSaveDate($("#txtEvalHemoglobindate").val()); //$("#txtEvalHemoglobindate").val();
        //get the uploaded files 

        patientDetails.EvalHemoglobinfile = getUploadedfiles("divtxtEvalHemoglobinfileupload");
        // //AST
        patientDetails.EvalAST = $("#txtEvalAST").val();
        patientDetails.EvalASTDate = formatDateMoment().setSaveDate($("#txtEvalASTdate").val()); //$("#txtEvalASTdate").val();
        //get the uploaded files 

        patientDetails.EvalASTfile = getUploadedfiles("divtxtEvalASTfileupload");
        //ALT
        patientDetails.EvalALT = $("#txtEvalALT").val();
        patientDetails.EvalALTDate = formatDateMoment().setSaveDate($("#txtEvalALTdate").val()); //$("#txtEvalALTdate").val();
        //get the uploaded files 

        patientDetails.EvalALTfile = getUploadedfiles("divtxtEvalALTfileupload");
        //Bilirubin
        patientDetails.EvalBilirubin = $("#txtEvalBilirubin").val();
        patientDetails.EvalBilirubinDate = formatDateMoment().setSaveDate($("#txtEvalBilirubindate").val()); //$("#txtEvalBilirubindate").val();
        //get the uploaded files 

        patientDetails.EvalBilirubinfile = getUploadedfiles("divtxtEvalBilirubinfileupload");
        //Albumin
        patientDetails.EvalAlbumin = $("#txtEvalAlbumin").val();
        patientDetails.EvalAlbuminDate = formatDateMoment().setSaveDate($("#txtEvalAlbumindate").val()); //$("#txtEvalAlbumindate").val();
        //get the uploaded files 

        patientDetails.EvalAlbuminfile = getUploadedfiles("divtxtEvalAlbuminfileupload");

        //INR
        patientDetails.EvalINR = $("#txtEvalINR").val();
        patientDetails.EvalINRDate = formatDateMoment().setSaveDate($("#txtEvalINRdate").val()); //$("#txtEvalINRdate").val();
        //get the uploaded files 

        patientDetails.EvalINRfile = getUploadedfiles("divtxtEvalINRfileupload");

        //SerumCr
        patientDetails.EvalSerumCr = $("#txtEvalSerumCr").val();
        patientDetails.EvalSerumCrDate = formatDateMoment().setSaveDate($("#txtEvalSerumCrdate").val()); //$("#txtEvalSerumCrdate").val();
        //get the uploaded files 

        patientDetails.EvalSerumCrfile = getUploadedfiles("divtxtEvalSerumCrfileupload");

        patientDetails.EvalSerumSodium = $("#txtEvalSerumSodium").val();
        patientDetails.EvalSerumSodiumDate = formatDateMoment().setSaveDate($("#txtEvalSerumSodiumdate").val());
        //get the uploaded files 

        patientDetails.EvalSerumSodiumfile = getUploadedfiles("divtxtEvalSerumSodiumfileupload");

        if ($('input[name=dialysis]:checked').length !== 0) {
            let dialysis = $('input[name=dialysis]:checked').val();
            patientDetails.dialysis = dialysis;
        }
        // //Assign Other Evaluation items
        // patientDetails.Fibrosistest = $("#txtFibrosistest").val();
        // patientDetails.FibrosistestScore = $("#txtFibrosistestScore").val();

        //alcohol related screening/cousellor
        let alcoholScreeningEval = checkInputvalues("alchoholScreeningTest");

        if (alcoholScreeningEval) {
            patientDetails.patientScreeningAlcohol = alcoholScreeningEval;
            if (alcoholScreeningEval == "Yes") {
                patientDetails.patientEvaluationAlcoholFile = getUploadedfiles("divAlcoholSceeningfileupload");
            } else {
                patientDetails.patientEvaluationAlcoholFile = null;
            }
        }
        // Assign Other Evaluation items
        //Add treatment information and real world evidence data 
        let recommendedMessageTreatment = $('#recommendedMessage').html().trim();
        if (recommendedMessageTreatment !== '') {

            let medication = $(".drugname").text().split("Drug Details");
            let medicationInfo = [];
            for (let i = 0; i < medication.length; i += 2) {
                medicationInfo.push(medication[i].trim());
            }
            patientDetails.realWorldEvidenceDrugs = medicationInfo.join(";");
            patientDetails.recommendedTreatmentForPatient = recommendedMessageTreatment;
        }

        hideValidationMessage();
        return true;
    }
    // Nisha 03 MAR 2017
    // created to show hide div in evaluation
let showhideEvaluationDivs = (patientDetails) => {
        if (patientDetails.seriousdeseasesLivertransplantTest && patientDetails.seriousdeseasesLivertransplantTest == 'Yes')
            $("#divLiverTransplant").show();
        else
            $("#divLiverTransplant").hide();
        if (patientDetails.seriousdeseasesFibrosisTest && patientDetails.seriousdeseasesFibrosisTest == 'Yes')
            $("#divFibrosis").show();
        else
            $("#divFibrosis").hide();
        if ((patientDetails.seriousdeseasesCryoglobulinemiaTest && patientDetails.seriousdeseasesCryoglobulinemiaTest == 'Yes') ||
            (patientDetails.seriousdeseasesRenalinsufficiencyTest && patientDetails.seriousdeseasesRenalinsufficiencyTest == 'Yes') ||
            (patientDetails.seriousdeseasesLymphomaTest && patientDetails.seriousdeseasesLymphomaTest == 'Yes'))
            $("#divExtraheapatic").show();
        else
            $("#divExtraheapatic").hide();
        if (patientDetails.prescribedTest && patientDetails.prescribedTest == 'Yes')
            $("#divProviderCounseling").show();
        else
            $("#divProviderCounseling").hide();
        if (patientDetails.alcoholTest && patientDetails.alcoholTest == 'No')
            $("#divAlcoholscreeningcounseling").show();
        else
            $("#divAlcoholscreeningcounseling").hide();
        if (patientDetails.seriousdeseasesMediType2DiabetesLivertransplantTest && patientDetails.seriousdeseasesMediType2DiabetesLivertransplantTest == 'Yes')
            $("#divMediDiabetes").show();
        else
            $("#divMediDiabetes").hide();

        if (patientDetails.seriousdeseasesMediPorphyriaLivertransplantTest && patientDetails.seriousdeseasesMediPorphyriaLivertransplantTest == 'Yes')
            $("#divPorphyria").show();
        else
            $("#divPorphyria").hide();

        if (patientDetails.ChildPughTest && patientDetails.ChildPughTest == 'Yes')
            $("#divChildPugh").show();
        else
            $("#divChildPugh").hide();

        if (patientDetails.plantype == "Medicaid") {
            $("#divmediINR").show();
            $("#divmediAlbumin").show();
            $("#divmediBilirubin").show();
            $("#divcomDrugs").hide();
        } else {
            $("#divcomDrugs").show();
            $("#divmediINR").hide();
            $("#divmediAlbumin").hide();
            $("#divmediBilirubin").hide();
        }

    }
    // Jayesh 02th MAR 2017
    // updated test results
let updateTestResults = (patientDetails) => {
    //take dynamic file upload id

    patientDetails.filesMetabolic = getUploadedfiles("divMetabolicUpload");
    patientDetails.serumCreatinine = $('#txtSerunCreatinine').val();
    patientDetails.ALTlevels = $('#txtALTlevels').val();

    patientDetails.filesHCVgenotype = getUploadedfiles("divHCVgenotypeUpload");
    patientDetails.HCVgenotype = $('#ddlHCVgenotype').val();

    patientDetails.filesCBC = getUploadedfiles("divCBCUpload");
    patientDetails.CBC = $('#txtCBC').val();
    patientDetails.Platelets = $('#txtplatelets').val();

    patientDetails.filesINR = getUploadedfiles("divINRUpload");
    patientDetails.INR = $('#txtINR').val();

    patientDetails.filesHIVantibody = getUploadedfiles("divHIVUpload");
    patientDetails.HIVantibody = $('#txtHIV').val();

    patientDetails.filesHBVsurfaceAntigen = getUploadedfiles("divHBVsurfaceUpload");
    patientDetails.HBVsurfaceAntigen = $('#txtHBVsurfaceAntigen').val();

    patientDetails.filesHAVvaccination = getUploadedfiles("divHAVvaccinationUpload");
    patientDetails.HAVvaccination = $('#txtHAVvaccination').val();

    patientDetails.filesHBVvaccination = getUploadedfiles("divHBVvaccinationUpload");
    patientDetails.HBVvaccination = $('#txtHBVvaccination').val();

    patientDetails.filesAlcoholScreening = getUploadedfiles("divalcoholScreeningUpload");
    patientDetails.AlcoholScreening = $('#txtalcoholScreening').val();
}


// yuvraj 24th FEB 2017
// this function will process the inputs provided by the user and show the appropriate screen.
// Jayesh 24th FEB 2017
// added antibody test result message div
// let proceddInputs = (patientDetails) => {
//     console.log(patientDetails);
//     let negativeTestResultMsg = `The AGA Institute recommends If patient has ongoing high risk behaviors,
//                     conduct counseling, retesting and other testing as appropriate.
//                     <br /> <br />
//                     Persons who use or inject illegal drugs should be advised: to stop using and injecting drugs; to enter and complete
//                     substance abuse treatment.
//                     <br /> <br />
//                     Persons who are at risk for sexually transmitted diseases should be advised: that the surest way to prevent the
//                     spread of HIV infection and other STDs is to have sex with only one uninfected partner or not to have sex at all; to use
//                     latex condoms correctly and every time to protect themselves and their partners from diseases.`
//     if (patientDetails['antibodyTest'] == 'No') {
//         $('#screenPartII').hide();
//         $('#screenNegativeResultMsgContent').html('The AGA Institute recommends to conduct  HCV Anybody test.');
//         $('#screenNegativeResultMsgI').show();
//     } else if (patientDetails['antibodyTest'] == 'Yes' && patientDetails['antibodyTestResult'] == 'Non-Reactive') {
//         $('#screenPartII').hide();

//         $('#screenNegativeResultMsgContent').html(negativeTestResultMsg);
//         $('#screenNegativeResultMsgI').show();
//     } else if (patientDetails['RNATest'] == 'No') {
//         $('#screenPartII').hide();
//         $('#screenNegativeResultMsgContent').html('The AGA Institute highly recommends to conduct Quantitative HCV RNA test.');
//         $('#screenNegativeResultMsgI').show();
//     } else if (patientDetails['RNATest'] == 'Yes' && patientDetails['RNATestResult'] == 'Negative') {
//         $('#screenPartII').hide();
//         $('#screenNegativeResultMsgContent').html(negativeTestResultMsg);
//         $('#screenNegativeResultMsgI').show();
//     } else if (patientDetails['RNATest'] == 'Yes' && patientDetails['RNATestResult'] == 'Positive') {

//     }

// }

// Jayesh 02th MAR 2017
// update and validate screen IV data
let updatePatientScreenIVData = (patientDetails) => {
    if ((patientDetails.seriousdeseasesFibrosisTest && patientDetails.seriousdeseasesFibrosisTest == 'Yes') ||
        (patientDetails.seriousdeseasesLymphomaTest && patientDetails.seriousdeseasesLymphomaTest == 'Yes') ||
        (patientDetails.seriousdeseasesCryoglobulinemiaTest && patientDetails.seriousdeseasesCryoglobulinemiaTest == 'Yes') ||
        (patientDetails.seriousdeseasesRenalinsufficiencyTest && patientDetails.seriousdeseasesRenalinsufficiencyTest == 'Yes') ||
        (patientDetails.seriousdeseasesLivertransplantTest && patientDetails.seriousdeseasesLivertransplantTest == 'Yes') ||
        (patientDetails.seriousdeseasesMediType2DiabetesLivertransplantTest && patientDetails.seriousdeseasesMediType2DiabetesLivertransplantTest == 'Yes') ||
        (patientDetails.seriousdeseasesMediPorphyriaLivertransplantTest && patientDetails.seriousdeseasesMediPorphyriaLivertransplantTest == 'Yes') ||
        (patientDetails.plantype == "Medicaid" && patientDetails.ChildPughTest && patientDetails.ChildPughTest == 'Yes') ||
        (patientDetails.plantype == "Commercial" && patientDetails.ChildPughTest && patientDetails.ChildPughTest == 'No') ||
        (patientDetails.seriousdeseasesMediHIV1CoLivertransplantTest && patientDetails.seriousdeseasesMediHIV1CoLivertransplantTest == 'Yes') ||
        (patientDetails.seriousdeseasesMediHEPABLivertransplantTest && patientDetails.seriousdeseasesMediHEPABLivertransplantTest == 'Yes')
    ) {
        patientDetails.cirrhosis = "Yes";
    } else
        patientDetails.cirrhosis = "No";

    if (patientDetails.cirrhosis == "Yes")
        patientDetails.treatment = "experienced";
    else if (patientDetails.prescribedTest && patientDetails.prescribedTest == "Yes")
        patientDetails.treatment = "experienced";
    else
        patientDetails.treatment = "naive";
    // if ($('#ddlGenotype').val() && $('input[name=patientCirrhosis]:checked').length > 0 && $('input[name=treatmentType]:checked').length > 0) {
    //     patientDetails.genotype = $('#ddlGenotype').val();
    //     patientDetails.cirrhosis = $('input[name=patientCirrhosis]:checked').val();
    //     patientDetails.treatment = $('input[name=treatmentType]:checked').val();
    //     determineTreatmentPlan(patientDetails);
    //     hideValidationMessage();
    //     hideResultMessage();
    // } else {
    //     showValidationMessage('Please select option !');
    //     hideResultMessage();
    // }
    determineTreatmentPlan(patientDetails);
    hideValidationMessage();
    hideResultMessage();

}

let determineTreatmentPlan = (patientDetails) => {
    //console.log('Primary Care Object Detail');
    //console.log(patientDetails);
    // if(Pinscriptive.Filters)
    // {
    //     Pinscriptive.Filters.genotypes = "'" + patientDetails.genotype + "'";
    //     Pinscriptive.Filters.cirrhosis = "'" + patientDetails.cirrhosis + "'";
    //     Pinscriptive.Filters.treatment = "'" + patientDetails.treatment + "'";
    // }
    // else{
    //     Pinscriptive.Filters ={};
    //     Pinscriptive.Filters.genotypes = "'" + patientDetails.genotype + "'";
    //     Pinscriptive.Filters.cirrhosis = "'" + patientDetails.cirrhosis + "'";
    //     Pinscriptive.Filters.treatment = "'" + patientDetails.treatment + "'";
    // }
    // Router.go('/provider');
    $('.resetFilterbtn').trigger('click');
    $("input[name='chkGenoType']").each(function(e) {
        if (this.value == patientDetails.genotype) {
            this.checked = true
        }
    });
    $("input[name='chkCirrhosis']").each(function(e) {
        if (this.value == patientDetails.cirrhosis) {
            this.checked = true
        }
    });
    $("input[name='chkTreatment']").each(function(e) {
        if (this.value == patientDetails.treatment) {
            this.checked = true
        }
    });
    $('.top-navigation li a').each(function() {
            if ($(this).text().toLowerCase() == 'provider') {
                $(this).show();
            }
        })
        //reset screening
    setScreening = -1;
    //highLightTab('provider');
    $('.ApplyFilterbtn').trigger('click');
}

let CheckPatientChrrhosisTreatment = (pateint) => {
    if (patientDetails.treatmentexperienced == "Yes")
        patientDetails.treatment = "experienced";
    else
        patientDetails.treatment = "naive";

    if (patientDetails.txtChildPughscore > 7 || patientDetails.txtAPRIscore >= 1.5 || patientDetails.txtFibrosistestScore >= 0.75 || patientDetails.txtFibroscanScore >= 12.5)
        patientDetails.cirrhosis = "Yes";
    else
        patientDetails.cirrhosis = "No";
}

let showValidationMessage = (msg) => {
    $('#validationMessage').html(msg);
    $('#validationMessageContainer').show();
    // $('html, body').animate({
    //     scrollTop: $('#validationMessageContainer').position().top
    // }, 'slow');
}
let showValidationMessageS2 = (msg) => {
    $('#validationMessageS2').html(msg);
    $('#validationMessageContainerS2').show();
    // $('html, body').animate({
    //     scrollTop: $('#validationMessageContainer').position().top
    // }, 'slow');
}
let showValidationMessageS3 = (msg) => {
    $('#validationMessageS3').html(msg);
    $('#validationMessageContainerS3').show();
    // $('html, body').animate({
    //     scrollTop: $('#validationMessageContainer').position().top
    // }, 'slow');
}

let showResultMessage = (msg) => {
    $('#screenNegativeResultMsgContent').html(msg);
    $('#ResultMsgContainer').show();
    // $('html, body').animate({
    //     scrollTop: $('#ResultMsgContainer').position().top
    // }, 'slow');
}

let showResultMessageDemographics = (msg) => {
    $('#DemographicsResultMsgContent').html(msg);
    $('#ResultMsgContainerDemographics').show();
}

let showResultMessageDemographics_new = (e, msg) => {
    $(e.currentTarget).parent().parent().parent().siblings('#ResultMsgContainerDemographics').children().find('.DemographicsResultMsgContent').html(msg);
    $(e.currentTarget).parent().parent().parent().siblings('#ResultMsgContainerDemographics').show();
}

let hideValidationMessage = () => {
    $('#validationMessageContainer').hide();
    $('#validationMessageContainerS2').hide();
    $('#validationMessageContainerS3').hide();
}

let hideResultMessage = () => {
    // if ((patientDetails.HepaCPatient && patientDetails.HepaCPatient == 'No') && $('#screenPartII:visible').length > 0)
    //     $('#ResultMsgContainer').show();
    // else
    //     $('#ResultMsgContainer').hide();
}

let hideResultMessageDemographics = () => {
    $('#ResultMsgContainerDemographics').hide();
}

let hideResultMessageDemographics_new = (e) => {
    $(e.currentTarget).parent().parent().parent().siblings('#ResultMsgContainerDemographics').hide();
}


let checkTestResultDateMoreSixMonth = (dateParam) => {
    let today = moment();
    let lastSixMonths = today.subtract(6, 'months');
    return moment(dateParam).isBefore(lastSixMonths);
}

let showPatientSummaryData = (patientDetails) => {
    if (patientDetails.patientId)
        $('#sm_txt_patient_id').val(patientDetails.patientId);
    if (patientDetails.treatmentPlanType)
        $('#sm_txt_treatmentPlan').val(patientDetails.treatmentPlanType);
    if (patientDetails.currentIntravenousDrugsUser)
        $('#sm_txt_intravenousDrugUsed').val(patientDetails.currentIntravenousDrugsUser);
    if (patientDetails.birthYear)
        $('#sm_txt_birthYear').val(moment(patientDetails.birthYear).format("MM/DD/YYYY"));
    if (patientDetails.isHIV)
        $('#sm_txt_hiv').val(patientDetails.isHIV);
    if (patientDetails.isHIV)
        $('#sm_txt_HCVRNA').val(patientDetails.isHIV);
    if (patientDetails.patientId)
        $('#sm_txt_HCVRNADate').val(patientDetails.patientId);
    if (patientDetails.genotype)
        $('#sm_txt_HCVGenotype').val(patientDetails.genotype);
    if (patientDetails.patientId)
        $('#sm_txt_prescribedByProvider').val(patientDetails.patientId);
    if (patientDetails.patientId)
        $('#sm_txt_HIVCoInfection').val(patientDetails.patientId);
    if (patientDetails.patientId)
        $('#sm_txt_HepBCoInfection').val(patientDetails.patientId);
    if (patientDetails.patientId)
        $('#sm_txt_fibrosis').val(patientDetails.patientId);
    if (patientDetails.seriousdeseasesLivertransplantTest)
        $('#sm_txt_liver_transplant').val(patientDetails.seriousdeseasesLivertransplantTest);

}

let getStyleForPrint = () => {
    return `<style>
        div {
            display: block;
        }
        .row{
             padding: 15px;
        }
        .col-md-3 {
            width: 33%;
        float: left;
            position: relative;
            min-height: 1px;
        }
    </style>`
}

let fetchAndRenderPatientData = (params) => {

    //fetch data from server for particular patient id 
    Meteor.call('searchScreeningPatientData', params, function(error, result) {
        if (error) {
            $('#assessmentSearchOnSelection').dialog('destroy');
            alert('No Data Found');
            return;
        } else {
            if (result.length == 1) {
                patientDetailsSearch.set(result[0]);
                setAgeOfPatient(result[0].PATIENT_BIRTHYEAR);
                try {
                    $('#assessmentSearchOnSelection').dialog('destroy');
                    setAttachedFilesFromSearch(result[0]);
                    dataRendered = true;

                    $(".searchmessage").html("<span style='color:Red'>A Patient has been found! It is in review mode.</span>");
                    $("#divScreenMessage").dialog({
                        dialogClass: 'containerDialog',
                        minHeight: '100px',
                        width: 'auto',
                        closeOnEscape: false,
                        open: function(event, ui) {
                            $(".ui-dialog-title", ui.dialog | ui).hide();
                            $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                        }

                    });
                    setTimeout(function() {
                        $("#divScreenMessage").dialog('close');
                    }, 2500);


                    $("#screenPartI").find("input,checkbox,textarea,select").prop("disabled", true);
                    $("#screenPartII").find("input,checkbox,textarea,select").prop("disabled", true);
                    $("#screenPartIII").find("input,checkbox,textarea,select").prop("disabled", true);
                    $("#screenPartIV").find("input,checkbox,textarea,select").prop("disabled", true);
                    // $('.editButton').show();
                } catch (ex) {
                    console.log(ex);
                }
            } else {

                $("#screenPartI").find("input,checkbox,textarea,select").prop("disabled", false);
                $("#screenPartII").find("input,checkbox,textarea,select").prop("disabled", false);
                $("#screenPartIII").find("input,checkbox,textarea,select").prop("disabled", false);
                $("#screenPartIV").find("input,checkbox,textarea,select").prop("disabled", false);

                dataRendered = false;

                $(".searchmessage").html("<span style='color:Red'>No Data Found for current selection! Please change filters.</span>");
                $("#divScreenMessage").dialog({
                    dialogClass: 'containerDialog',
                    minHeight: '100px',
                    width: 'auto',
                    closeOnEscape: false,
                    open: function(event, ui) {
                        $(".ui-dialog-title", ui.dialog | ui).hide();
                        $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                    }
                });
                setTimeout(function() {
                    $("#divScreenMessage").dialog('close');
                }, 2500);

                $('#assessmentSearchOnSelection').dialog('destroy');
                patientDetailsSearch.set({});
                // $('.editButton').hide();
                editdataRendered = false;
            }

            //console.log(result);
        }
    });
}


//Praveen 5th April 2017 function to set the attached files from search 
let setAttachedFilesFromSearch = (data) => {

    //console.log(data);
    //CommChildPughTestfileupload file

    /* hide all divs */
    $('#divNA5details').hide();
    $('#divFibrosis').hide();
    $('#divTreatment').hide();
    $('#divreasondiscontinue').hide();
    $("#divViewSummary").hide();
    $('#CommChildPughTest').hide();
    showRecommendationMessageScreening("HCVAntiBodyResultQue", "", false);

    if (data.PCP_PHYSICIAN_PLAN == 'Screening') {
        // $("#divViewSummary").show();
        // $("#divsummarttitle").attr('title', "Screening Summary");
        $('#divpatienthisincarc').show();
        if (data.PATIENT_IS_ANTIBODYTEST == 'Yes') {
            $('#divHCVAntiBodyResultQue').show();
        }
        if (data.PATIENT_ANTIBODYTESTRESULT == 'Negative') {
            showRecommendationMessageScreening("HCVAntiBodyResultQue", "Primary Care done successfully. Patient with Negative Hepatitis C Antibody test result need not be revisited.", true);
        }
        if (data.PATIENT_ANTIBODYTESTRESULT == 'Positive') {
            $('.divHCVAntiBodyResultQue').show();
        }

    }

    if (data.PATIENT_IS_CHARTNOTE == 'Yes') {
        if (data.PATIENT_COMMCHILDPUGHTESTFILE) {
            setUploadedFiles('.CommChildPughTestfileupload', data.PATIENT_COMMCHILDPUGHTESTFILE);
        }
    }

    if (data.PATIENT_IS_COMMCHILDPUGHTEST == 'Yes') {
        $('#CommChildPughTest').show();
    }

    if (data.PATIENT_IS_EVALNS5APOLYMORPHISMS == 'Yes') {
        $('#divNA5details').show();
    }

    if (data.PATIENT_IS_SERIOUSDESEASESFIBROSISTEST == 'Yes') {
        $('#divFibrosis').show();
    }

    if (data.PATIENT_IS_TREATMENTEXPERICED == 'Yes') {
        $('#divTreatment').show();
    }

    if (data.PATIENT_DOCUMENTEDFATIGUE == 'Yes' && data.PATIENT_INSURANCETYPE == 'Medicaid') {
        showRecommendationMessage('documentedfatigue', 'Meeting qualification criteria for the Medicaid population', true);
    }

    if (data.PATIENT_COMPLETEREGIMEN == 'No') {
        $('#divreasondiscontinue').show();
    }

    //divtxtEvalHepaBantigenfileupload
    if (data.PATIENT_EVALHEPABANTIGENFILE != "null") {
        setUploadedFiles('.divtxtEvalHepaBantigenfileupload', data.PATIENT_EVALHEPABANTIGENFILE);
    }

    //Hep B Anti Body
    if (data.PATIENT_EVALHEPABANTIBODYFILE != "null") {
        setUploadedFiles('.divtxtEvalHepaBantibodyfileupload', data.PATIENT_EVALHEPABANTIBODYFILE);
    }
    //hepb core antibody
    if (data.PATIENT_EVALHEPABCOREANTIBODYTOTALFILE != "null") {
        setUploadedFiles('.divtxtEvalHepaBcoreantibodytotalfileupload', data.PATIENT_EVALHEPABCOREANTIBODYTOTALFILE);
    }

    if (data.PATIENT_EVALHEPAANTIBODYFILE != "null") {
        setUploadedFiles('.divtxtEvalHepaAantibodyfileupload', data.PATIENT_EVALHEPAANTIBODYFILE);
    }
    //get the uploaded files
    if (data.PATIENT_EVALHIVANTIBODYFILE != "null") {
        setUploadedFiles('.divtxtEvalHIVantibodyfileupload', data.PATIENT_EVALHIVANTIBODYFILE);
    }
    //get the uploaded files
    if (data.PATIENT_EVALNS5APOLYMORPHISMSFILE != "null") {
        setUploadedFiles('.divtxtEvalNS5Apolymorphismsfileupload', data.PATIENT_EVALNS5APOLYMORPHISMSFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALASTLIMITFILE != "null") {
        setUploadedFiles('.divtxtEvalASTLimitfileupload', data.PATIENT_EVALASTLIMITFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALALTLIMITFILE != "null") {
        setUploadedFiles('.divtxtEvalALTLimitfileupload', data.PATIENT_EVALALTLIMITFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALWBCFILE != "null") {
        setUploadedFiles('.divtxtEvalWBCfileupload', data.PATIENT_EVALWBCFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALPLATELETSFILE != "null") {
        setUploadedFiles('.divtxtEvalPlateletsfileupload', data.PATIENT_EVALPLATELETSFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALHEMOGLOBINFILE != "null") {
        setUploadedFiles('.divtxtEvalHemoglobinfileupload', data.PATIENT_EVALHEMOGLOBINFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALASTFILE != "null") {
        setUploadedFiles('.divtxtEvalASTfileupload', data.PATIENT_EVALASTFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALALTFILE != "null") {
        setUploadedFiles('.divtxtEvalALTfileupload', data.PATIENT_EVALALTFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALBILIRUBINFILE != "null") {
        setUploadedFiles('.divtxtEvalBilirubinfileupload', data.PATIENT_EVALBILIRUBINFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALALBUMINFILE != "null") {
        setUploadedFiles('.divtxtEvalAlbuminfileupload', data.PATIENT_EVALALBUMINFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALINRFILE != "null") {
        setUploadedFiles('.divtxtEvalINRfileupload', data.PATIENT_EVALINRFILE);
    }
    //get the uploaded files 
    if (data.PATIENT_EVALSERUMCRFILE != "null") {
        setUploadedFiles('.divtxtEvalSerumCrfileupload', data.PATIENT_EVALSERUMCRFILE);
    }
    //alcohol screening
    if (data.PATIENT_IS_ALCHOHOLSCREENINGTEST == 'Yes') {
        $('#divAlcoholSceeningfileupload').show();
        if (data.PATIENT_ALCOHOLSCEENINGFILE) {
            setUploadedFiles('.divAlcoholSceeningfileupload', data.PATIENT_ALCOHOLSCEENINGFILE);
        }
    } else {
        $('#divAlcoholSceeningfileupload').hide();
    }

    ////get the uploaded files sodium
    if (data.PATIENT_EVALSERUMSODIUMFILE != "null") {
        setUploadedFiles('.divtxtEvalSerumSodiumfileupload', data.PATIENT_EVALSERUMSODIUMFILE);
    }

    let scr = data.PATIENT_EVALSERUMCR;
    let inr = data.PATIENT_EVALINR;
    let billirubin = data.PATIENT_EVALBILIRUBIN;
    let serumSodium = data.PATIENT_EVALSERUMSODIUM;
    // let meldscore = $("#txtMELDscore").val();

    if (scr != null && inr != null && billirubin != null && serumSodium != null) {

        if (parseInt(serumSodium) < 125)
            serumSodium = 125;
        if (parseInt(serumSodium) > 137)
            serumSodium = 137;

        if (parseInt(scr) < 1)
            scr = 1;

        if (parseInt(inr) < 1)
            inr = 1;

        if (parseInt(billirubin) < 1)
            billirubin = 1;


        let meldiResult = Math.round(10 * ((0.957 * Math.log(scr)) + (0.378 * Math.log(billirubin)) + (1.12 * Math.log(inr)) + 0.643));
        console.log(meldiResult);

        if (meldiResult >= 12) {
            let meldiResult1 = parseInt(meldiResult + 1.32 * (137 - parseFloat(serumSodium)) - (0.033 * parseFloat(meldiResult) * (137 - parseFloat(serumSodium))));
            $("#txtEvalMeldScoreCalculated").val(meldiResult1);
        } else
            $("#txtEvalMeldScoreCalculated").val(meldiResult);
        $("#divmeld").show();
    }
}


function showFileList(controlId) {

    let fileList = Session.get('UploadedScreeingFiles' + controlId);
    let html = ``;
    if (fileList && fileList.length > 0) {
        $('#display-' + controlId).show();
        fileList.forEach(function(value, index) {
            html += `<li type="${value.type}" name="${value.name}" 
            data-control-id="${controlId}" style="float:left;margin-right:10px;">${value.name}</li>
        <button class="deleteUploadedFile" id="deleteUploadedFile-${controlId}"  data-control-id="${controlId}" data="${value.id}">X</button><br/> `
        });
        $('#file-listing-' + controlId).html(html);
        $('#file-listing-' + controlId + ' li').on('click', function(e) {
            e.preventDefault();
            if (e.currentTarget.attributes['data-control-id']) {
                let controlId = e.currentTarget.attributes['data-control-id'].value;

                let type = $(e.currentTarget).attr('type');
                let name = $(e.currentTarget).attr('name');
                // let data = $(e.currentTarget).attr('data');
                //downloadFile({type:type,name:name,dataUrl:data});
                // $("#dialog").dialog({
                //   modal:true
                // });
                let fileList = _.where(Session.get('UploadedScreeingFiles' + controlId), {
                    name: name,
                    type: type
                });
                if (fileList && fileList.length > 0) {
                    $('#frame-' + controlId.trim()).attr("src", fileList[0].dataUrl);
                    //$('.analyticsPatientsPopup').show();
                    download(fileList[0].dataUrl, name, type);
                }
            }
        });
        $('#file-listing-' + controlId + ' .deleteUploadedFile').on('click', function(e) {
            e.preventDefault();
            if (e.currentTarget.attributes['data-control-id']) {
                let controlId = e.currentTarget.attributes['data-control-id'].value;

                let data = Session.get('UploadedScreeingFiles' + controlId);
                let filename = $(e.currentTarget).attr('data');
                let sdata = [];
                for (let i = 0; i < data.length; i++) {
                    let filen = data[i].id;
                    if (filename && filen != filename) {
                        sdata.push(data[i]);
                    }
                }
                if (filename)
                    Session.set('UploadedScreeingFiles' + controlId, sdata);
                showFileList(controlId);
            }

            //console.log('deleteUploadedFile');
            var itemid = e.currentTarget.id.replace("deleteUploadedFile", "#custom-upload");
            var mailitemid = $(itemid).parent().parent().attr('id');
            //console.log(mailitemid);
            let parentclass = $("#" + mailitemid).parent().parent().attr("class");
            //console.log(parentclass);

            if (parentclass === 'pcp-eval-hepa') {
                if ($('.pcp-eval-hepa li').length <= 0)
                    $('.pcp-eval-hepa .asterik').show();
            } else if (parentclass === 'pcp-eval-labresults') {
                if ($('.pcp-eval-labresults li').length <= 0)
                    $('.pcp-eval-labresults .asterik').show();
            }
        });
    } else {
        $('#file-listing-' + controlId).html('');
        $('#display-' + controlId).hide();
    }
}

function download(data, strFileName, strMimeType) {

    var self = window, // this script is only for browsers anyway...
        defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
        mimeType = strMimeType || defaultMime,
        payload = data,
        url = !strFileName && !strMimeType && payload,
        anchor = document.createElement("a"),
        toString = function(a) {
            return String(a);
        },
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
            setTimeout(function() {
                ajax.send();
            }, 0); // allows setting custom ajax headers using the return:
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
        new myBlob([payload], {
            type: mimeType
        });


    function dataUrlToBlob(strUrl) {
        var parts = strUrl.split(/[:;,]/),
            type = parts[1],
            decoder = parts[2] == "base64" ? atob : decodeURIComponent,
            binData = decoder(parts.pop()),
            mx = binData.length,
            i = 0,
            uiArr = new Uint8Array(mx);

        for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);

        return new myBlob([uiArr], {
            type: type
        });
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
                if (winMode === true) {
                    setTimeout(function() {
                        self.URL.revokeObjectURL(anchor.href);
                    }, 250);
                }
            }, 66);
            return true;
        }

        // handle non-a[download] safari as best we can:
        if (/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
            url = url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
            if (!window.open(url)) { // popup blocked, offer direct download:
                if (confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")) {
                    location.href = url;
                }
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
        setTimeout(function() {
            document.body.removeChild(f);
        }, 333);

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

let MessageEvaluation = () => {
    let selections = checkEvaluationSpecialistRequiredSelectedValues();
    let selectionsNames = checkEvaluationSpecialistRequiredSelectedNames();
    let disease, diseasenames = "";
    let tlength = selectionsNames.length;
    //console.log(tlength);
    if (tlength > 1) {
        for (i = 0; i < selectionsNames.length; i++) {
            disease += selectionsNames[i] + ",";
        }
        // console.log(disease);
        pos = disease.lastIndexOf(",");
        disease = disease.substring(0, pos);

        diseasenames = replace_last_comma_with_and(disease);
        diseasenames = diseasenames.replace("undefined", "");
        //console.log(diseasenames);
    } else
        diseasenames = selectionsNames[0];

    if (selections.length > 0) {
        //$("#lblEvalutionrequiresSpecialist").html('This Patient needs to be referred to specialists for ' + diseasenames + '.');
        //$("#divEvalutionrequiresSpecialist").show();

    } else {
        //$("#lblEvalutionrequiresSpecialist").html('');
        //$("#divEvalutionrequiresSpecialist").hide();
    }
}



function CheckHCVTestDataValidation(rnaTestDate, genotypeDate) {
    let rnaFlag = checkTestResultDateMoreMonth(rnaTestDate, 3);
    let genotypeFlag = checkTestResultDateMoreMonth(genotypeDate, 12);
    let htmltxt = ``;
    let flag = false;
    if (rnaFlag && genotypeFlag) {
        htmltxt = `HCV RNA test should be taken within 3 months and 
                    HCV genotype test should be taken within 12 months.`;
        flag = true;
    } else if (rnaFlag) {
        htmltxt = `HCV RNA test should be taken within 3 months.`;
        flag = true;
    } else if (genotypeFlag) {
        htmltxt = `HCV genotype test should be taken within 12 months.`;
        flag = true;
    } else {
        $('.divPCPHCVTestResultMessage').hide();
        $('#screenPartIV .infodiv').hide();
        $('#patientSummaryPopup .infodiv').hide();
    }

    if (flag) {
        $('#screenPartIV .infodiv').show();
        $('.divPCPHCVTestResultMessage').show();
        $('#patientSummaryPopup .infodiv').show();
        $('.divPCPHCVTestResultMessage p').html(htmltxt);
    }

}


let checkTestResultDateMoreMonth = (dateParam, months) => {
    let today = moment();
    let lastSixMonths = today.subtract(months, 'months');
    return moment(dateParam).isBefore(lastSixMonths);
}

let cb = (start, end) => {
    $('#patientBirthYear span').html('MM/DD/YYYY');
}

//check for select option and value
let checkforValidationTxtSelectOthers = (selectid, txtid, messageid, message) => {

    let option = $('#' + selectid).val();
    let value = $('#' + txtid).val();

    if (option != '') {
        if (option != 'others') {
            return {
                'option': option,
                'value': 0
            };
        } else if (option == 'others' && value != '') {
            return {
                'option': option,
                'value': value
            };
        } else {
            if (message != "")
                showErrormessage(messageid, message, true);
            return 0;
        }
    } else {
        if (message != "")
            showErrormessage(messageid, message, true);
        return 0;
    }
}

//Praveen 25 April 2017 to format date
let formatDateMoment = () => {
    return {
        setSaveDate: (date) => date ? moment(date).format("YYYY-MM-DD") : null,
        setDate: (date) => date ? moment(date).format("MM/DD/YYYY") : null
    }
}

// Praveen 25-04-2017 to check the list of files
let checkEvalValues = (txtid) => {
    let controlId = $('.' + txtid).text().trim();
    return $('#file-listing-' + controlId + ' li').length;
}

let checkInputvalues = (id) => {
    let inputid = $('input[name = ' + (id) + ']:checked').val();
    return (inputid && inputid != '') ? inputid : '';
}


let calculateMeld = () => {
    let scr = $("#txtEvalSerumCr").val();
    let inr = $("#txtEvalINR").val();
    let billirubin = $("#txtEvalBilirubin").val();
    let meldscore = $("#txtMELDscore").val();
    let serumSodium = $("#txtEvalSerumSodium").val();

    if (scr != "" && inr != "" && billirubin != "" && serumSodium != "") {

        if (parseInt(serumSodium) < 125)
            serumSodium = 125;
        if (parseInt(serumSodium) > 137)
            serumSodium = 137;

        if (parseInt(scr) < 1)
            scr = 1;

        if (parseInt(inr) < 1)
            inr = 1;

        if (parseInt(billirubin) < 1)
            billirubin = 1;
        let meldiResult = Math.round(10 * ((0.957 * Math.log(scr)) + (0.378 * Math.log(billirubin)) + (1.12 * Math.log(inr)) + 0.643));

        // -- MELD(i) score less than 12 do not require Serum Sodium correction.
        if (meldiResult >= 12) {
            let meldiResult1 = parseInt(meldiResult + 1.32 * (137 - parseFloat(serumSodium)) - (0.033 * parseFloat(meldiResult) * (137 - parseFloat(serumSodium))));
            $("#txtEvalMeldScoreCalculated").val(meldiResult1);
        } else
            $("#txtEvalMeldScoreCalculated").val(meldiResult);

        $("#divmeld").show();
    } else if (meldscore != "") {
        $("#txtEvalMeldScoreCalculated").val(meldscore);
        $("#divmeld").show();
    }
    patientDetails.meldScoreValue = $("#txtEvalMeldScoreCalculated").val() || "";

}

//set age of patient
let setAgeOfPatient = (data) => {
    let age = moment().diff(data, 'years');
    if (isNaN(age) || age <= 0) {
        $("#patientAgeDemo").html("");
    } else {
        $("#patientAgeDemo").html("Age: " + age);
        if (age < 50)
            $("#divpatientchildbearing").show();
        else
            $("#divpatientchildbearing").hide();
    }
}

let getUploadedfiles = (id) => {
        let controlId = $('.' + id).text().trim();
        let file = JSON.stringify(Session.get('UploadedScreeingFiles' + controlId) || null);
        return file;
    }
    // let isAnyFileUploaded = (date,txt) => {
    //                 let date1 = $("#"+date).val();
    //                 let txt1 = $('#'+txt).val();
    //                 if (txt1.trim() == '' || date1 == '') {
    //                     showErrormessage(txt1 , 'Please enter '+txt+' value and date or upload related file.', true);
    //                     return;
    //                 }
    // }

//Praveen 26 April common function for setting uploaded files
let setUploadedFiles = (id, data) => {
    let controlId = $(id).text().trim(); //getcontrolid
    Session.set('UploadedScreeingFiles' + controlId, JSON.parse(data));
    showFileList(controlId);
}