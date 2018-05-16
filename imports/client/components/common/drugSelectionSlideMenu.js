import { Template } from 'meteor/templating';

import './drugSelectionSlideMenu.html';

Template.DrugSelectionSlideMenu.rendered = function() {
    //Logic for open slide menu for drug selection tab
    $(".menulines").click(function() {
        if ($(this).attr("trigger") === "1") {

            $('.drug-toggle-title').text('Close Drugs');
            $(".slidesec").animate({
                right: '330px'
            }, 1000);
            $(this).attr("trigger", "0");
        } else {
            $('.drug-toggle-title').text('Modify Drugs');
            $(".slidesec").animate({
                right: '0px'
            }, 1000);
            $(this).attr("trigger", "1");
        }
    });


    //old js - $('.eff-sideboxdiv').css('padding-bottom', ($('.slidesec').height()));

    //for Efficacy Page

    //$('.eff-sideboxdiv').css('max-height', ($('.slidesec').height() + 30 ));

    //$('.eff-sideboxdiv').css('padding-bottom', ($('.adherence-container').height()));
};
