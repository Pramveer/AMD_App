import { Template } from 'meteor/templating';
import './cost.html';

var DRUG_LIMIT = 4;
//Perform operation when template rendered
Template.Cost.rendered = function() {

    //var filterData = localStorage.filteredDrugsForGraph && JSON.parse(localStorage.filteredDrugsForGraph) ? JSON.parse(localStorage.filteredDrugsForGraph) : [];
    // remove extra parsing process for faster performance
    var filterData = localStorage.filteredDrugsForGraph ? JSON.parse(localStorage.filteredDrugsForGraph) : [];

    //Display Graph for Drugs selection not more that 4 Drugs
    //Display Default 4 drugs data if no drugs is selected

        GenerateCostDetail(filterData);

    //Set Fields from header data
    $('#txtEMR').val($('#patientID').text().trim());
    $('#txtInsurance').val($('#Insurance').val()); // Default "Untied Healthcare"
    $('#txtPlan').val('PPO'); // Default "PPO"
    //Hide extra height for cost title
    $('.cost-tbl-box').css('padding-bottom', ($('.cost-title').height() - 8));
    
    var allDrugsData = JSON.parse(localStorage.AllDrugsData);
    $('.machineLearn-totalPatients').html(commaSeperatedNumber(allDrugsData[0].TotalN || 0));

};


//Handle events for cost
Template.Cost.events({
    //Handle checkbox change event for drug selection
    'change .eff-sidebox input:checkbox': function(e) {

        //Grab all selected checkbox value
        var selectedDrugs = $('.eff-sidebox input:checked').map(function() {
            return this.value;
        }).get();

        //Capture last selected drugs and and also display it in drug choice popup if it never display for current session
        if (e.target && e.target.checked) {
            //If Drug popup displayed once in current session then it will never show again but capture information
            if (selectedDrugs && selectedDrugs.length == 1) {
                localStorage.lastSelectedDrug = e.target.value;
                if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
                    $('.drug-inspection').slideUp();
                } else {
                    //WrapDrugName(localStorage.lastSelectedDrug);
                    //Display drug popup if last drug is selected in current session
                    if (localStorage.lastSelectedDrug && localStorage.lastSelectedDrug.length > 0) {
                        $('#inspected-drug').text(localStorage.lastSelectedDrug).attr('title', localStorage.lastSelectedDrug);

                        $('.drug-inspection').slideDown();
                    }
                }
            }
        }

        var filterData = [];

        //Check weather any drug is selected or not
        if (selectedDrugs && selectedDrugs.length > 0) {
            localStorage.selectedDrugs = JSON.stringify(selectedDrugs);
            if (selectedDrugs.length > 0) {
                for (var k = 0; k <= selectedDrugs.length - 1; k++) {
                    filterData.push(selectedDrugs[k]);
                }
                GenerateCostDetail(filterData);
            } else {
                //Restriction or limit # drugs on page
                $('.drug-selection-warning').slideDown();
                setTimeout(function() {
                    $('.drug-selection-warning').slideUp()
                }, 3000);

            }
            $('.efficacy-warning').hide();
        } else {
            localStorage.selectedDrugs = JSON.stringify([]);
            //Display warning if no record are selected and clear graph data with setting last selection in local
            GenerateCostDetail([]);
            $('.efficacy-warning').slideDown();
            setTimeout(function() {
                $('.efficacy-warning').slideUp();
            }, 3000);

        }

    }
});


/**
 *  Prepare cost detail based on drug selectiom
 *  @param Array Object filterData
 *  filterData have selected drugs  info in array of object
 */
function GenerateCostDetail(filterData) {
    var jsonData = [];
    // Math.floor(Math.random() * ((y-x)+1) + x);
    var selectedDrugName = filterData && filterData.length > 0 ? filterData : [];

    //var selectedDrugName = JSON.parse(sampleData);
    //console.log("Selected Drug length" + selectedDrugName.length);

        //Filter drugs data by drug name with data
        var filterDrugs = JSON.parse(localStorage.AllDrugsData);


        for (var i = 0; i <= filterDrugs.length - 1; i++) {
            var drugData = {};

            drugData["Medication"] = filterDrugs[i].DrugName;

            $('.data-conatainer').show();
            $('.efficacy-warning').hide();
            //drugData["Medication"] = selectedDrugName[i];

            drugData["Genotype"] = 1;
            drugData["Treatment"] = "Naive";
            drugData["TreatmentPeriod"] = "12 Weeks";
            drugData["Cirrhosis"] = "WO";

            drugData["SVR"] = 87 - i / 2;
            drugData["IsInsured"] = filterDrugs[i] && filterDrugs[i]["IsInsured"] ? filterDrugs[i]["IsInsured"] : 'No';
            drugData["CostToPatient"] = filterDrugs[i] && filterDrugs[i]["Cost"]["PatientCW12"] ? filterDrugs[i]["Cost"]["PatientCW12"] : '$$';
            drugData["CostToPayer"] = filterDrugs[i] && filterDrugs[i]["Cost"]["PayerCW12"] ? filterDrugs[i]["Cost"]["PayerCW12"] : '$$';
            drugData["CostToPatientNumber"] = filterDrugs[i] && filterDrugs[i]["Cost"]["PatientCW12"] ? Number(filterDrugs[i]["Cost"]["PatientCW12"].replace(/[^0-9\.]+/g, "")) : 0;
            drugData["CostToPayerNumber"] = filterDrugs[i] && filterDrugs[i]["Cost"]["PayerCW12"] ? Number(filterDrugs[i]["Cost"]["PayerCW12"].replace(/[^0-9\.]+/g, "")) : 0;
            drugData["CostEstimateNumber"] = filterDrugs[i] && filterDrugs[i]["Cost"]["CostEstimate"] ? Number(filterDrugs[i]["Cost"]["CostEstimate"]) : 0;
            drugData["CostEstimateSymbol"] = filterDrugs[i] && filterDrugs[i]["Cost"]["CostEstimateSymbol"] ? filterDrugs[i]["Cost"]["CostEstimateSymbol"] : "";
            jsonData.push(drugData);

        }



    // Sort by Value high to low
    jsonData.sort(function(a, b) {
        return parseFloat(b.CostEstimateNumber) - parseFloat(a.CostEstimateNumber);
    });

    // //Sorting algorithm for json object from http://jsfiddle.net/RcZP3/
    //    filterDrugs.sort(function(a, b) {
    //        if (a.column == b.column) {
    //            return a.row == b.row ? 0 : +a.row > +b.row ? 1 : -1;
    //        }

    //        return +a.column > +b.column ? 1 : -1;
    //    });


    // Prepare html data for Cost based on drug selection
    var costHtml = '';
    //set header
    var headerHtml = '<div class="costContentTable">' +
        '<div class="dCost_Cell"> Drugs </div>' +
        '<div class="dCost_Cell dCost_Fxwid"> Formulary </div>' +
        '<div class="dCost_Cell dCost_Fxwid_Dlr"> Cost Estimate </div>' +
        //  '<div class="dCost_Cell dCost_Fxwid_Dlr"> Patient </div>' +
        '</div>';
    costHtml += headerHtml;
    for (var i = 0; i < jsonData.length; i++) {
        costHtml = costHtml + '<div class="dCost_Tbl_Row">' +
            '<div class="dCost_Cell" title="' + jsonData[i]["Medication"] + '">' + jsonData[i]["Medication"] + '</div>' +
            '<div class="dCost_Cell dCost_Fxwid txtShadow">' + (jsonData[i]["IsInsured"] === 'Yes' ? 'Preferred' : 'Not Preferred') + '</div>' +
            '<div class="dCost_Cell dCost_Fxwid_Dlr txtShadow">' + jsonData[i]["CostEstimateSymbol"] + '</div>' +
            //'<div class="dCost_Cell dCost_Fxwid_Dlr txtShadow">$' + jsonData[i]["CostToPatient"] + '</div>' +
            '</div>';
    }
    $('#cost-container').html(costHtml);
    // set minimum height for scroll in drug selection slide
    $('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));

};



/**
 *  Generate Cost symbol based on cost value
 *  @param String pCost
 *  pCost is cost value of treatment for Payer and Patient
 *  @return costSymbol
    string Symbol relevant to cost value
*/
function GenerateCostSymbol(pCost) {
    //Payer bubble to show $$$ not actual cost scale: 0-50K $ 50-100 $$ 150-200K $$$ 200-300 $$$$
    var cost = !isNaN(parseInt(pCost)) && $.isNumeric(pCost) ? parseInt(pCost) : 0
    var costSymbol = '';
    if (cost <= 57000) {
        costSymbol = '<span title="$0-57K">$</span>';
    } else if (cost > 57000 && cost <= 90000) {
        costSymbol = '<span title="$57-90K">$$</span>';
    } else if (cost > 90000 && cost <= 150000) {
        costSymbol = '<span title="$90-150K">$$$</span>';
    } else {
        costSymbol = '<span>$$$$</span>';
    }
    return costSymbol;
};
