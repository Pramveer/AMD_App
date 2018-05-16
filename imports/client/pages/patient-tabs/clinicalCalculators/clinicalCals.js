import { Template } from 'meteor/templating';
import './clinicalCals.html';

Template.ClinicalCalcList.rendered = function() {
    //console.log("Calc Rendered");


    $('.psAccordion .hasSubMenu').click(function(e) {

        if ($(e.target).parent().hasClass("hasSubMenu")) {
            e.preventDefault();
            var elem = this;
            $(elem).find('.sub-sidemenu').slideToggle("slow");

            if ($(elem).data("rotate") == "close") {
                $(elem).find('.submenu-arrow i').rotate(180);
                $(elem).data("rotate", "open");
            } else if ($(elem).data("rotate") == "open") {
                $(elem).find('.submenu-arrow i').rotate(0);
                $(elem).data("rotate", "close");
            }
            //return false;
        } else {
            //    return false;
        }
    });

    $('.clinicalCalcsList a').click(function(event, template) {
        //  console.log(event);
        document.getElementById('meldframe').src = '';
        var calcName = event.currentTarget.attributes['calcname'].value;
        document.getElementById("anim_loading_theme").style.top = "70%";
        document.getElementById("anim_loading_theme").style.visibility = "visible";
        document.getElementById("overlay").style.display = "block";
        var data = getCalcDir(calcName);
        openModalWindow(data);
    });

    $('#clinicalCalcsList li').click(function() {
        $('#clinicalCalcsList li').removeClass('active');
        $(this).addClass('active');
    });

};

Template.ClinicalCalcList.events({
    'click .clinicalCalcsList a': function(event, template) {
        //  console.log(event);
        document.getElementById('meldframe').src = '';
        var calcName = event.currentTarget.attributes['calcname'].value;
        document.getElementById("anim_loading_theme").style.top = "70%";
        document.getElementById("anim_loading_theme").style.visibility = "visible";
        document.getElementById("overlay").style.display = "block";
        var data = getCalcDir(calcName);
        openModalWindow(data);
    },
    'click #clinicalCalcsList li': function() {

        $('#clinicalCalcsList li').children('a').removeClass('active');
        $(this).children('a').addClass('active');

    }
});

Template.ClinicalCalcList.toggleCalcs = function(ele) {
    var calcList = $('.clinicalCalcsList').css('display');
    if (calcList === 'block') {
        $('.clinicalCalcsList').css('display', 'none');
    } else {
        $('.clinicalCalcsList').css('display', 'block');
    }
};

function openModalWindow(data) {
    var displayFrame = document.getElementById('meldframe');
    displayFrame.onload = function() {
        frameLoaded();
    };
    var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
    $("body").append(appendthis);
    $(".modal-overlay").fadeTo(500);
    var modalBox = $('#popupForCalculator');
    document.getElementById('clinicalCalcTitle').innerHTML = 'Clinical Calculator';
    modalBox.show();
    $('#meldframe').css('height', data.height)
    displayFrame.src = data.path;
}

//function to get the path for the selected calculator resources.
function getCalcDir(calcName) {
    var calcFolder = '';
    var height = '500px';
    switch (calcName) {
        case 'APRI':
            calcFolder = 'APRICalculator';
            height = '660px';
            break;
        case 'AUDIT-C':
            calcFolder = 'AUDIT-C';
            height = '822px';
            break;
        case 'BMI':
            calcFolder = 'BMI-C';
            height = '580px';
            break;
        case 'CrCl':
            calcFolder = 'CrCl-C';
            height = '577px';
            break;
        case 'CAGE':
            calcFolder = 'CAGEQuestionnaire';
            height = '600px';
            break;
        case 'CTP':
            calcFolder = 'CTP-C';
            height = '822px';
            break;
        case 'FIB-4':
            calcFolder = 'FIB-4';
            height = '512px';
            break;
        case 'Glasgow':
            calcFolder = 'GlasgowComaScale';
            height = '804px';
            break;
        case 'GFR':
            calcFolder = 'GFR-C';
            height = '660px';
            break;
        case 'SAAG':
            calcFolder = 'SAAG-C';
            height = '408';
            break;
        default:
            calcFolder = 'meldPopup';
            height = '730px';
            break;
    }
    calcFolder = '/ClinicalCalcs/' + calcFolder + '/cal.html?';

    return { path: calcFolder, height: height };
}

function frameLoaded() {
    document.getElementById("anim_loading_theme").style.visibility = "hidden";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("anim_loading_theme").style.top = "40%";
}