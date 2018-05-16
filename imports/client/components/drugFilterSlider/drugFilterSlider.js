import { Template } from 'meteor/templating';
import './drugFilterSlider.html';

Template.DrugFilterSlider.rendered = function() {
    //Logic for open slide menu for filter drug
    $(".filterSliderDiv").click(function() {
        if ($(this).attr("trigger") === "1") {

            $(".weightSliderContent").css('display', 'none');
            $(".filterSliderContent").css('display', 'block');
            $('.drug-toggle-title').text('Close Filter');

            $(".slidesec").animate({
                right: '400px'
            }, 1000);
            $(this).attr("trigger", "0");
        } else {
            $('.drug-toggle-title').text('Open Filter');

            $(".slidesec").animate({
                right: '0px'
            }, 1000);
            $(this).attr("trigger", "1");
        }
    });
    //Logic for open slide menu for filter drug by weight
    $(".weightSliderDiv").click(function() {
        if ($(this).attr("trigger") === "2") {
            $(".weightSliderContent").css('display', 'block');
            $(".filterSliderContent").css('display', 'none');
            $('.drug-toggle-title-weight').text('Settings');

            $(".slidesec").animate({
                right: '400px'
            }, 1000);
            $(this).attr("trigger", "0");
        } else {
            $('.drug-toggle-title-weight').text('Settings');

            $(".slidesec").animate({
                right: '0px'
            }, 1000);
            $(this).attr("trigger", "2");
        }
    });

    $("#txtEffWeight").change("input", function(e) {
        localStorage.setItem('wefficacy', $('#txtEffWeight').val());
    });

    $("#txtAdhWeight").change("input", function(e) {
        localStorage.setItem('wadherence', $('#txtAdhWeight').val());
    });

    $("#txtUtiWeight").change("input", function(e) {
        localStorage.setItem('wutilization', $('#txtUtiWeight').val());
    });
    
    $("#txtCostWeight").change("input", function(e) {
        localStorage.setItem('wcost', $('#txtCostWeight').val());
    });

    // event for weight apply btn
    $('.payerApplyWeight').on('click', function(e) {
        if ($('#analyticsGenotypeCombo').val() === "0") {
            Template.Payer.valuecalculatorAll();
        } else
            Template.Payer.valuecalculator();
    });
}

Template.DrugFilterContent.helpers({
    'genotypeComboItems': function() {
        var comboItems = [
            { genotype: 'All', value: '0' },
            { genotype: '1', value: '1' },
            { genotype: '1a', value: '1a' },
            { genotype: '1b', value: '1b' },
            { genotype: '2', value: '2' },
            { genotype: '3', value: '3' },
            { genotype: '4', value: '4' },
            { genotype: '5', value: '5' },
            { genotype: '6', value: '6' }
        ];
        return comboItems;
    }
});
