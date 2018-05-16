/*

    * This file contains the methods that the Header tab uses
    * When we breakdown the header file into multiple templates into seperate files
    * these functions were moved in this file.
    * client/Header/
 */
blankHeaderFieldValue = function() {
    $("#ZipCode").val('');
    $("#rfAreaCode").val('');
    $("#rfAdmissionDate").val('');
    $(".rfDischargeDate").val('');
    $("#State").val('');
    $("#Birthday").val('');
    $(".rfLanguage").val('');
    $("#Gender").val('');
    $("#Race").val('');
    $(".rfEthnicity").val('');
    $("#Insurance").val('');
}

cheackAdmissionDate = function () {
    var value = $("#rfAdmissionDate").val().length;
    if (value <= 0) {
        return false;
    } else {
        return true;
    }
}


cheackInsurance = function () {
    var value = $("#Insurance").val().length;
    if (value <= 0) {
        return false;
    } else {
        return true;
    }
}

cheackState = function () {
    var value = $("#State").val().length;
    if (value <= 0) {
        return false;
    } else {
        return true;
    }
}

cheackZipCode = function() {
    var value = $("#ZipCode").val().length;
    if (value <= 0) {
        return false;
    } else {
        return true;
    }
}

cheackAreaCode = function() {
    var value = $("#rfAreaCode").val().length;
    if (value <= 0) {
        return false;
    } else {
        return true;
    }
}

cheackBirthday = function() {
    var value = $("#Birthday").val().length;
    if (value <= 0) {
        return false;
    } else {
        return true;
    }
}

cheackRace = function() {
    var value = $("#Race").val().length;
    if (value <= 0) {
        return false;
    } else {
        return true;
    }
}

cheackGender = function() {
    var value = $("#Gender").val().length;
    if (value <= 0) {
        return false;
    } else {
        return true;
    }
}

validateHeaderForm = function() {

    if (!cheackAdmissionDate() || !cheackInsurance() || !cheackState() || !cheackZipCode() || !cheackAreaCode() || !cheackBirthday() || !cheackRace() || !cheackGender()) {
        return false;
    } else {
        return true;
    }

}

saveheaderData = function(data, eleId) {
    Meteor.call('update_data', data, "sample_patients", Router['PatientId'], function(error, result) {
        if (error) {} else {
            //saveNotificationForHeader(eleId);
            showToastMessage();
        }
    });
}

emptyheaderData = function(msg, eleID) {
    $('#' + eleID).css('border-color', 'red');
    setTimeout(function() {
        $('#' + eleID).css('border-color', '');
    }, 4500);
    window.clearTimeout(notificationPopupDelay);
    $('.validation-inspection').show();
    $('#inspected-validation').text(msg);
    notificationPopupDelay = setTimeout(function() {
        $('.validation-inspection').hide();
    }, 2000);
}


saveNotificationForHeader = function(eleID) {
    $('#' + eleID).parent('span').next().css('display', 'block');
    $('#' + eleID).parent('span').next().fadeIn('slow').delay(2500).fadeOut('slow');
}

//Adjust Navigation tab width automatically based on window size and no of tabs
AdjustNavigation =  function() {
    console.log("** Adjust Navigation Called***");
    var a = (($('#navbar-collapse').width()) / (($(".nav.navbar-nav").children().length - 1)));
    $('.nav.navbar-nav li').css('width', String(a));
}

showToastMessage = function () {
/*$.toast({
heading: 'Information',
text: 'Information saved successfully',
icon: 'info',
loader: false,
position: {
right: 120,
top: 400
},
loaderBg: '#9EC600'
});*/
};

initializeHeaderDDL=() =>{
   /* genderDDL = $('.head-emr-details #Gender').selectize({
        create: true,
        dropdownParent: 'body'
    });
    raceDDL = $('.head-emr-details #Race').selectize({
        create: true,
        dropdownParent: 'body'
    });

    stateDDL = $('.head-emr-details #State').selectize({
        create: true,
        dropdownParent: 'body'
    });

    insuranceDDL = $('.head-emr-details #Insurance').selectize({
        create: true,
        dropdownParent: 'body'
    });*/
    // console.log(genderDDL);
    // console.log(raceDDL);
    // console.log(insuranceDDL);
    // console.log(stateDDL);
}
