import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';

import './PTmodel.html';
/**
 * Added: Jayesh 17-Feb-2017
 * Issue :
 * Description : P & T Model tempalte method
 * Reference: http://www.valueinhealthjournal.com/article/S1098-3015(13)01695-1/fulltext
 */

let PTmodelData = {};
let selectedDrugs = [];

Template.PTmodel.onCreated(function() {
    var self = this;
    self.loading = new ReactiveVar(true);
    self.noData = new ReactiveVar(false);

    getPTModelData(self);

});

Template.PTmodel.rendered = function() {
    // ToggleMedicationSideMenu();
};

Template.PTmodel.destroyed = function() {

};

// Helper methods for Drugs template
Template.PTmodel.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    },
    // function for bind all medication list
    'MedicationList': function() {
        if (PTmodelData.allMedication) {
            let medicationList = _.map(PTmodelData.allMedication, (rec) => {
                rec.chkChecked = selectedDrugs && selectedDrugs.indexOf(rec.medication) > -1 ? "Checked" : "";
                return rec;
            });
            setTimeout(function() {
                ToggleMedicationSideMenu();
                if (selectedDrugs && selectedDrugs.length > 0) {
                    DisplayCompareDrugsData(selectedDrugs);
                }
            }, 250);

            return medicationList;
        }
    },

});

//Events for medication page
Template.PTmodel.events({
    'click .close.mlTabs_closebtn': function(e) {
        $('.analyticsPatientsPopup').hide();
        ClearPopupValue();
    },
    // event for cohort search filter 
    'click .rweb-list li': function(e, template) {
        template.loading.set(true);
        template.noData.set(false);
        getPTModelData(template);
    },
    // event for save risk and social benefits 
    'click #btnPtPopupRiskSave': function(e, template) {
        $('.analyticsPatientsPopup').hide();
        let medicationName = $('.analyticsCommonPopupDrugName').html();
        getPTSaveRiskData(template, medicationName);
    },
    //Handle checkbox change event for drug selection
    'change .eff-sidebox input:checkbox': function(e) {
        selectedDrugs = $('.eff-sidebox input:checked').map(function() {
            return this.value;
        }).get();

        DisplayCompareDrugsData(selectedDrugs);
    },
    'click .apiLinksSpan': function(event, template) {
        switch (event.currentTarget.id) {
            case "clinicalTrials_Api":
                window.location = 'javascript:Router.go("ClinicalTrialsAPI");';
                break;
            case "evidenceBased_Api":
                window.location = 'javascript:Router.go("EvidenceAPI");';
                break;
            case "Pharmacological_Api":
                window.location = 'javascript:Router.go("Pharmacological");';
                break;
            default:
                break;
        }
    },

    'click #ddlPtSocialBenefits': function(event, template, medication, socialBenefits) {
        getPTSaveBenefitsData(template, medication, socialBenefits);
    },
    'change #chkNoneOfTheAbove': function(event, template){
        if(!$("#chkNoneOfTheAbove").is(":checked")){
            enabledRisks();
        }
        else{
            ClearAndDisabledRisks();
        }
    }
});

// fucntion for get all medication data for P & T model
let getPTModelData = (self) => {
    let params = getCurrentPopulationFilters();
    if (Meteor.user()) {
        params.username = Meteor.user().username;
    }
    Meteor.call('getPTmodelPageData', params, function(error, result) {
        if (error) {
            self.loading.set(false);
            self.noData.set(true);
        } else {

            let decompressed_object = LZString.decompress(result);
            let resulting_object = JSON.parse(decompressed_object);
            PTmodelData = resulting_object;
            console.log('PT Model Data');
            console.log(resulting_object);
            self.loading.set(false);

            //set patient count on the header
            $('.searchPatientCountHeader').html(commaSeperatedNumber(resulting_object.totalCostPatientCount));
        }

    });
}

// function for save risk for each medication
let getPTSaveRiskData = (self, medication) => {

    if (Meteor.user()) {

        let pData = {};
        pData.ptMEDICATION = medication;
        pData.ptUSERNAME = Meteor.user().username;
        pData.ptSOCIAL_BENIFITS = null,
            //true =1,false=0
        pData.ptRISK1 = $('#chkRisk1').is(':checked') ? 1 : 0;
        //set none of these option in P T model.
        pData.ptRISK1 = $('#chkNoneOfTheAbove').is(':checked') ? 2 : pData.ptRISK1;
        pData.ptRISK2 = $('#chkRisk2').is(':checked') ? 1 : 0;
        pData.ptRISK3 = $('#chkRisk3').is(':checked') ? 1 : 0;
        pData.ptRISK4 = $('#chkRisk4').is(':checked') ? 1 : 0;
        pData.ptRISK5 = $('#chkRisk5').is(':checked') ? 1 : 0;
        pData.ptRISK6 = $('#chkRisk6').is(':checked') ? 1 : 0;
        pData.ptRISK7 = $('#chkRisk7').is(':checked') ? 1 : 0;
        pData.ptRISK8 = $('#chkRisk8').is(':checked') ? 1 : 0;
        pData.ptRISK9 = $('#chkRisk9').is(':checked') ? 1 : 0;
        pData.ptRISK10 = $('#chkRisk10').is(':checked') ? 1 : 0;
        pData.ptRISK11 = $('#chkRisk11').is(':checked') ? 1 : 0;
        pData.ptRISK12 = $('#chkRisk12').is(':checked') ? 1 : 0;
        pData.ptRISK13 = $('#chkRisk13').is(':checked') ? 1 : 0;
        pData.ptRISK14 = $('#chkRisk14').is(':checked') ? 1 : 0;
        pData.ptFlag = 'Risk';


        ClearPopupValue();
        Meteor.call('savePtRiskBenefitsData', pData, function(error, result) {
            sAlert.success('Risk saved successfully.', {
                timeout: 1500,
                onClose: function() {
                    //console.log('Risk and Social Benefits save error - closing alert in 1000ms...');
                },
                effect: 'bouncyflip',
                html: true,
                position: 'top-left',
                width: '400px'
            });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
            self.loading.set(true);
            self.noData.set(false);
            getPTModelData(self);
        });
    }
}


// function for save risk for each medication
let getPTSaveBenefitsData = (self, medication, ptSOCIAL_BENIFITS) => {

    if (Meteor.user()) {

        let pData = {};
        pData.ptMEDICATION = medication;
        pData.ptUSERNAME = Meteor.user().username;
        pData.ptSOCIAL_BENIFITS = ptSOCIAL_BENIFITS,
        pData.ptRISK1 = null;
        pData.ptRISK2 = null;
        pData.ptRISK3 = null;
        pData.ptRISK4 = null;
        pData.ptRISK5 = null;
        pData.ptRISK6 = null;
        pData.ptRISK7 = null;
        pData.ptRISK8 = null;
        pData.ptRISK9 = null;
        pData.ptRISK10 = null;
        pData.ptRISK11 = null;
        pData.ptRISK12 = null;
        pData.ptRISK13 = null;
        pData.ptRISK14 = null;
        pData.ptFlag = 'Benefits';

        ClearPopupValue();
        Meteor.call('savePtRiskBenefitsData', pData, function(error, result) {
            sAlert.success('Social Benefits saved successfully.', {
                timeout: 1500,
                onClose: function() {
                    //console.log('Risk and Social Benefits save error - closing alert in 1000ms...');
                },
                effect: 'bouncyflip',
                html: true,
                position: 'top-left',
                width: '400px'
            });
            setTimeout(function() {
                sAlert.closeAll();
            }, 3000);
            self.loading.set(true);
            self.noData.set(false);
            getPTModelData(self);
        });
    }
}

// function for toggle side of medication
let ToggleMedicationSideMenu = () => {
    $(".menulines").click(function() {
        if ($(this).attr("trigger") === "1") {

            $('.drug-toggle-title').text('Close Medications');
            $(".slidesec").animate({
                right: '330px'
            }, 1000);
            $(this).attr("trigger", "0");
        } else {
            $('.drug-toggle-title').text('Add Medications');
            $(".slidesec").animate({
                right: '0px'
            }, 1000);
            $(this).attr("trigger", "1");
        }
    });
}



/**
 *  Display compare drugs based on drug selectiom
 *  @param Array Object filterData
 *  filterData have selected drugs  info in array of object
 */

function DisplayCompareDrugsData(filterData) {
    //To Do  display data based on drug selection
    let finalHtml = '';
    $('#compare-content').html('');
    let filterDrugs = _.filter(PTmodelData.medicationData, (rec) => {
        return filterData.indexOf(rec.medication) > -1;
    });

    let drugsTOCompare = filterDrugs.length;
    for (let i = 0; i < filterDrugs.length; i++) {

        let drugName;
        if (drugsTOCompare === 2) {
            drugName = filterDrugs[i].medication
        } else if (drugsTOCompare === 3) {

            if (filterDrugs[i].medication.length > 30) {
                drugName = filterDrugs[i].medication.substring(0, 27);
                drugName = drugName + '...';
            } else {
                drugName = filterDrugs[i].medication
            }

        } else if (drugsTOCompare === 4) {

            if (filterDrugs[i].medication.length > 20) {
                drugName = filterDrugs[i].medication.substring(0, 17);
                drugName = drugName + '...';
            } else {
                drugName = filterDrugs[i].medication
            }

        } else if (drugsTOCompare === 5) {

            if (filterDrugs[i].medication.length > 15) {
                drugName = filterDrugs[i].medication.substring(0, 12);
                drugName = drugName + '...';
            } else {
                drugName = filterDrugs[i].medication
            }

        } else if (drugsTOCompare <= 9) {

            if (filterDrugs[i].medication.length > 10) {
                drugName = filterDrugs[i].medication.substring(0, 8);
                drugName = drugName + '..';
            } else {
                drugName = filterDrugs[i].medication
            }

        } else {
            if (filterDrugs[i].medication.length > 7) {
                drugName = filterDrugs[i].medication.substring(0, 6);
                drugName = drugName + '.';
            } else {
                drugName = filterDrugs[i].medication
            }

        }
        // set DOM for compare medication with value
        let compareHtml = '<div class="grid-fix-cell">' +

            '<div class="cprsHeaader c-drug-tbl-div">' +
            '<div class="cprsDrug_Cell c-drug-tbl-title" title="' + filterDrugs[i].medication + '"><p>' + drugName + '</p></div>' +
            '</div>' +
            '<div class="cprsInnerdivContainer">' +
            '<div class="cprsInnerdiv">' +
            // '<div class="cplsLables">&nbsp;</div>' +
            '<div class="cplsMeasures"><span title="' + parseFloat(filterDrugs[i].efficacy) + '">' +
            GetParameterValue(filterDrugs[i].normailizeEfficacy) + '</span>' +
            '<span class="macLearningsubTabs-infoIcon mlInfoTip">' +
            '<div class="analytics-tooltip mlInfoTip_tooltip ptEfficacyToolTip tooltip-right" >' +
            '<div class="analytics-tooltipHead">' +
            filterDrugs[i].medication + ' EFFICACY' +
            '</div> ' +
            '<div class="analytics-tooltipBody" style="font-size: 13px;">' +
            '<b>Efficacy:</b> ' + parseFloat(filterDrugs[i].efficacy).toFixed(2) + '<br />' +
            '(minimum = 1.5; maximum = 12)<br /><br />' +
            '<b>Outcome:</b> ' + parseFloat(filterDrugs[i].treatmentOutcome.outcome) + '<br />' +
            '<b>Tolerability:</b> ' + parseFloat(filterDrugs[i].normailizeTolerability) + '<br />' +
            '<b>Duration:</b> ' + parseFloat(filterDrugs[i].duration.total_duration) + '<br />' +
            '<b>Evidence:</b> 3<br />' +
            '</div>' +
            '</div>' +
            '</span>' +
            '</div>' +
            '</div>';
           let benefitHigh = '',
                benefitModerate = '',
                benefitLow = '',
                benfitSelectd = '',
                riskDiv = '',
                riskIcon = '';
          
                if(filterDrugs[i].riskAndBenefits.normailizeRisks != 0)
                {
                    riskDiv = GetParameterValue(filterDrugs[i].riskAndBenefits.normailizeRisks);
                    riskIcon = 'fa-pencil-square-o';
                }
                else
                {
                    riskDiv = 'Enter Risks';
                    riskIcon = 'fa-plus-square-o';
                }    
            if (GetParameterValue(filterDrugs[i].riskAndBenefits.socialBenefits) == 'High') {
                benefitHigh = 'selected';
            } else if (GetParameterValue(filterDrugs[i].riskAndBenefits.socialBenefits) == 'Moderate') {
                benefitModerate = 'selected';
            } else if (GetParameterValue(filterDrugs[i].riskAndBenefits.socialBenefits) == 'Low'){
                benefitLow = 'selected';
            }
            else{
                benfitSelectd ='selected';
            }
            compareHtml += '<div class="cprsInnerdiv" >' +
                '<div class="cplsMeasures"></div>' +
                '<div class="cplsMeasures">' + riskDiv + '  &nbsp<div class="ptOpenRiskDisk" style="display: inline-block;" medication-data="' + filterDrugs[i].medication +
                '"patientCount="' + filterDrugs[i].cost.totalCostPatient + '" flag="0"><i class="fa ' + riskIcon +'" style="font-size: 18px;" aria-hidden="true"></i></div></div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                // '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' +
                '<div class="ptModelDropdown form-group">' +
                '<select style="width: 115px;" medication-data="' + filterDrugs[i].medication + '" class="js-ptSocialBenefits form-control">' +
                '<option value="Select" disabled ' + benfitSelectd + '>Select</option>' +
                '<option value="3" ' + benefitHigh + '>High</option>' +
                '<option value="2" ' + benefitModerate + '>Moderate</option>' +
                '<option value="1" ' + benefitLow + '>Low</option>' +
                '</select>' +
                '</div>' +
                '</div></div>' +
                '</div>';


        if (filterDrugs[i].overallValue == 0) {
            compareHtml +=
                '<div class="cprsInnerdiv">' +
                // '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + GenerateCostSymbolWithNormalize(filterDrugs[i].cost.avgCost, filterDrugs[i].normailizeCost) + '</div>' +
                // '<div class="cplsMeasures">' + GenerateCostSymbol(filterDrugs[i].Cost.PatientCW12) + '</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsMeasures"><span title="' + parseFloat(filterDrugs[i].overallValue).toFixed(2) + '">' + filterDrugs[i].normalizeOverallValue + '</span>' +
                '</div>' +
                // '<div class="cplsLables">&nbsp;</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsMeasures">' + commaSeperatedNumber(filterDrugs[i].cost.totalCostPatient) + '</div>' +
                // '<div class="cplsLables">&nbsp;</div>' +
                '</div>' +
                '</div>' +
                '</div>';

        } else {
    
            compareHtml +=
                '<div class="cprsInnerdiv">' +
                // '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + GenerateCostSymbolWithNormalize(filterDrugs[i].cost.avgCost, filterDrugs[i].normailizeCost) + '</div>' +
                // '<div class="cplsMeasures">' + GenerateCostSymbol(filterDrugs[i].Cost.PatientCW12) + '</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsMeasures"><span title="' + parseFloat(filterDrugs[i].overallValue).toFixed(2) + '">' + filterDrugs[i].normalizeOverallValue + '</span>' +
                '<span class="macLearningsubTabs-infoIcon mlInfoTip">' +
                '<div class="analytics-tooltip mlInfoTip_tooltip ptEfficacyToolTip tooltip_regement" >' +
                '<div class="analytics-tooltipHead">' +
                filterDrugs[i].medication + ' Overall Score' +
                '</div> ' +
                '<div class="analytics-tooltipBody" style="font-size: 13px;">' +
                '<b>Overall Score:</b> ' + parseFloat(filterDrugs[i].overallValue).toFixed(2) + '<br /><br />' +
                '<b>Efficacy:</b> ' + parseFloat(filterDrugs[i].efficacy).toFixed(2) + '<br />' +
                '<b>Risks:</b> ' + parseFloat(filterDrugs[i].riskAndBenefits.risks) + '<br />' +
                '<b>Social Benefits:</b> ' + parseFloat(filterDrugs[i].riskAndBenefits.socialBenefits) + '<br />' +
                '<b>Cost :</b> $' + commaSeperatedNumber(parseInt(filterDrugs[i].cost.avgCost)) + '<br />' +
                '</div>' +
                '</div>' +
                '</span>' +
                '</div>' +
                // '<div class="cplsLables">&nbsp;</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsMeasures">' + commaSeperatedNumber(filterDrugs[i].cost.totalCostPatient) + '</div>' +
                // '<div class="cplsLables">&nbsp;</div>' +
                '</div>' +
                '</div>' +

                '</div>';
        }

        $('#compare-content').append(compareHtml);

    }

    // set minimum height for scroll in drug selection slide
    $('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));

    // click event open for risk and social benefits pop up
    $('.ptOpenRiskDisk').on('click', function(e) {
        $('.ptModelPopup').show();
        let selectedMedication = e.currentTarget.attributes['medication-data'] ? e.currentTarget.attributes['medication-data'].value : undefined;
        if (selectedMedication) {
            $('.analyticsCommonPopupDrugName').html(selectedMedication);
            if (e.currentTarget.attributes['flag'] && e.currentTarget.attributes['flag'].value === "0") {
                let filterMedicaiton = _.filter(PTmodelData.medicationData, (rec) => {
                    return rec.medication === selectedMedication;
                });
                if (filterMedicaiton && filterMedicaiton[0].riskAndBenefitsData && filterMedicaiton[0].riskAndBenefitsData.length > 0) {
                    //$("input[name=ptSocialBenefits][value='"+ filterMedicaiton[0].riskAndBenefitsData[0].SOCIAL_BENIFITS +"']").prop("checked",true);
                    if(filterMedicaiton[0].riskAndBenefitsData[0].RISK1 != 2)
                    {
                        enabledRisks();
                        $("input[id=chkRisk1]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK1 == 1 ? true : false);
                        $("input[id=chkRisk2]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK2 == 1 ? true : false);
                        $("input[id=chkRisk3]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK3 == 1 ? true : false);
                        $("input[id=chkRisk4]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK4 == 1 ? true : false);
                        $("input[id=chkRisk5]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK5 == 1 ? true : false);
                        $("input[id=chkRisk6]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK6 == 1 ? true : false);
                        $("input[id=chkRisk7]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK7 == 1 ? true : false);
                        $("input[id=chkRisk8]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK8 == 1 ? true : false);
                        $("input[id=chkRisk9]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK9 == 1 ? true : false);
                        $("input[id=chkRisk10]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK10 == 1 ? true : false);
                        $("input[id=chkRisk11]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK11 == 1 ? true : false);
                        $("input[id=chkRisk12]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK12 == 1 ? true : false);
                        $("input[id=chkRisk13]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK13 == 1 ? true : false);
                        $("input[id=chkRisk14]").prop("checked", filterMedicaiton[0].riskAndBenefitsData[0].RISK14 == 1 ? true : false);
                    }
                    else{
                        ClearAndDisabledRisks();
                        $("input[id=chkNoneOfTheAbove]").prop("checked", true);
                    }
                }
            }
        }
        if (e.currentTarget.attributes['patientCount']) {
            let patientCount = commaSeperatedNumber(parseInt(e.currentTarget.attributes['patientCount'].value));
            $('.commonPopupPatientCount p').html(patientCount);
        }

    });

    // click event for social benefit
    $('.js-ptSocialBenefits').on('change', function(e, template) {
        if (e.currentTarget.value) {
            let selectedMedication = e.currentTarget.attributes['medication-data'] ? e.currentTarget.attributes['medication-data'].value : undefined;
            if (selectedMedication) {
                $("#ddlPtSocialBenefits").trigger("click", [selectedMedication, e.currentTarget.value]);
            }
        }
    });
}

// function for fix integer 
function fixToInteger(parameter) {
    var convertToInt = parseInt(parameter);
    var remainder = parameter % convertToInt;
    if (remainder == 0) {
        return convertToInt;
    }

    return parseFloat(parameter).toFixed(2);
}

//function for map cost value 
let GenerateCostSymbolWithNormalize = (pCost, normalizeCost) => {
    var cost = !isNaN(parseInt(pCost)) && $.isNumeric(pCost) ? parseInt(pCost) : 0
    var costSymbol = '';
    if (normalizeCost == 1) {
        costSymbol = '<span title="$' + commaSeperatedNumber(parseInt(pCost)) + '">$</span>';
    } else if (normalizeCost == 2) {
        costSymbol = '<span title="$' + commaSeperatedNumber(parseInt(pCost)) + '">$$</span>';
    } else if (normalizeCost == 3) {
        costSymbol = '<span title="$' + commaSeperatedNumber(parseInt(pCost)) + '">$$$</span>';
    } else {
        costSymbol = '<span>$$$$</span>';
    }
    //console.log(pCost);
    return costSymbol;
};

//function for map parameter value 
let GetParameterValue = (value) => {
    let dataString = '';
    if (value == 1) {
        dataString = 'Low';
    } else if (value == 2) {
        dataString = 'Moderate';
    } else if (value == 3) {
        dataString = 'High';
    }
    return dataString;
}

//function for clear risk and benefit popup
let ClearPopupValue = () => {
    $("input[name=ptSocialBenefits][value='2']").prop("checked", true);
    $("input[id=chkRisk1]").prop("checked", false);
    $("input[id=chkRisk2]").prop("checked", false);
    $("input[id=chkRisk3]").prop("checked", false);
    $("input[id=chkRisk4]").prop("checked", false);
    $("input[id=chkRisk5]").prop("checked", false);
    $("input[id=chkRisk6]").prop("checked", false);
    $("input[id=chkRisk7]").prop("checked", false);
    $("input[id=chkRisk8]").prop("checked", false);
    $("input[id=chkRisk9]").prop("checked", false);
    $("input[id=chkRisk10]").prop("checked", false);
    $("input[id=chkRisk11]").prop("checked", false);
    $("input[id=chkRisk12]").prop("checked", false);
    $("input[id=chkRisk13]").prop("checked", false);
    $("input[id=chkRisk14]").prop("checked", false);
}

let ClearAndDisabledRisks = () => {
    $("input[id=chkRisk1]").prop("checked", false);
    $("input[id=chkRisk2]").prop("checked", false);
    $("input[id=chkRisk3]").prop("checked", false);
    $("input[id=chkRisk4]").prop("checked", false);
    $("input[id=chkRisk5]").prop("checked", false);
    $("input[id=chkRisk6]").prop("checked", false);
    $("input[id=chkRisk7]").prop("checked", false);
    $("input[id=chkRisk8]").prop("checked", false);
    $("input[id=chkRisk9]").prop("checked", false);
    $("input[id=chkRisk10]").prop("checked", false);
    $("input[id=chkRisk11]").prop("checked", false);
    $("input[id=chkRisk12]").prop("checked", false);
    $("input[id=chkRisk13]").prop("checked", false);
    $("input[id=chkRisk14]").prop("checked", false);
    // disable riskes
    $("input[id=chkRisk1]").prop("disabled", true);
    $("input[id=chkRisk2]").prop("disabled", true);
    $("input[id=chkRisk3]").prop("disabled", true);
    $("input[id=chkRisk4]").prop("disabled", true);
    $("input[id=chkRisk5]").prop("disabled", true);
    $("input[id=chkRisk6]").prop("disabled", true);
    $("input[id=chkRisk7]").prop("disabled", true);
    $("input[id=chkRisk8]").prop("disabled", true);
    $("input[id=chkRisk9]").prop("disabled", true);
    $("input[id=chkRisk10]").prop("disabled", true);
    $("input[id=chkRisk11]").prop("disabled", true);
    $("input[id=chkRisk12]").prop("disabled", true);
    $("input[id=chkRisk13]").prop("disabled", true);
    $("input[id=chkRisk14]").prop("disabled", true);
}

let enabledRisks = () => { 
    // enable riskes
    $("input[id=chkRisk1]").prop("disabled", false);
    $("input[id=chkRisk2]").prop("disabled", false);
    $("input[id=chkRisk3]").prop("disabled", false);
    $("input[id=chkRisk4]").prop("disabled", false);
    $("input[id=chkRisk5]").prop("disabled", false);
    $("input[id=chkRisk6]").prop("disabled", false);
    $("input[id=chkRisk7]").prop("disabled", false);
    $("input[id=chkRisk8]").prop("disabled", false);
    $("input[id=chkRisk9]").prop("disabled", false);
    $("input[id=chkRisk10]").prop("disabled", false);
    $("input[id=chkRisk11]").prop("disabled", false);
    $("input[id=chkRisk12]").prop("disabled", false);
    $("input[id=chkRisk13]").prop("disabled", false);
    $("input[id=chkRisk14]").prop("disabled", false);
}