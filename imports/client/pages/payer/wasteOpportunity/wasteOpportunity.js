/**
 * @author: Pramveer
 * @date: 27th Mar 17
 * @desc: Added file for the waste Opportunity popup
 */
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './wasteOpportunity.html';

let wasteData = [];
let wasteDataAll = [];
//let labs_AnalysisData = new ReactiveVar({});

Template.PayerWasteOpportunity.onCreated(function() {
    this.loading = new ReactiveVar(true);

    let self = this;
    let params = self.data;

    let isFromAnalytics = params.genotypes ? false : true;

    if (isFromAnalytics) {
        params = getCurrentPopulationFilters();
    }
    //Hard code the rebate discount value to 0 
    params.rebateDiscount = 0;

    //console.log("********* Preparing waste data at universe level *********");
    //let params = getCurrentPopulationFilters();
    Meteor.call('getWasteDataForPatients', params, (err, res) => {
        if (err) {
            self.loading.set(false);
            checkTabsWastePayerTb();
        } else {
            let result = LZString.decompress(res);
            result = JSON.parse(result);
            wasteData = result.data;
            wasteDataAll = result;
            checkTabsWastePayerTb();
            //labs_AnalysisData.set(result.labAnalysisData);
            populateTheWasteDataSection(params, result, isFromAnalytics);
            self.loading.set(false);
        }
    });
});

Template.PayerWasteOpportunity.rendered = function() {

}

Template.PayerWasteOpportunity.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'labtestStats': function() {
        let labtestStats = [];

        if (this.isClient) {
            labtestStats = [{
                    testName: 'ALBUMIN',
                    patientCount: 388,
                    percent: getPercentForlabs(388)
                },
                {
                    testName: 'ALK PHOS',
                    patientCount: 387,
                    percent: getPercentForlabs(387)
                },
                {
                    testName: 'ALT(SGPT)',
                    patientCount: 388,
                    percent: getPercentForlabs(388)
                },
                {
                    testName: 'AST(SGOT)',
                    patientCount: 386,
                    percent: getPercentForlabs(386)
                },
                {
                    testName: 'BILIRUBIN',
                    patientCount: 124,
                    percent: getPercentForlabs(124)
                },
                {
                    testName: 'BILIRUBIN, DIRECT',
                    patientCount: 272,
                    percent: getPercentForlabs(272)
                },
                {
                    testName: 'BILIRUBIN, INDIRECT',
                    patientCount: 269,
                    percent: getPercentForlabs(269)
                },
                {
                    testName: 'BILIRUBIN, TOTAL',
                    patientCount: 388,
                    percent: getPercentForlabs(388)
                },
                // {
                //     testName: 'CREAT',
                //     patientCount: 0,
                //     percent: getPercentForlabs(0)
                // },
                {
                    testName: 'INR',
                    patientCount: 230,
                    percent: getPercentForlabs(230)
                },
                {
                    testName: 'PLATELETS',
                    patientCount: 421,
                    percent: getPercentForlabs(421)
                },
                {
                    testName: 'TSH',
                    patientCount: 88,
                    percent: getPercentForlabs(88)
                },
            ];
        } else {
            labtestStats = [{
                    testName: 'ALBUMIN',
                    patientCount: 5216,
                    percent: getPercentForlabs_benchmark(5216)
                },
                {
                    testName: 'ALK PHOS',
                    patientCount: 953,
                    percent: getPercentForlabs_benchmark(953)
                },
                {
                    testName: 'ALT(SGPT)',
                    patientCount: 4851,
                    percent: getPercentForlabs_benchmark(4851)
                },
                {
                    testName: 'AST(SGOT)',
                    patientCount: 4741,
                    percent: getPercentForlabs_benchmark(4741)
                },
                {
                    testName: 'BILIRUBIN, DIRECT',
                    patientCount: 13,
                    percent: getPercentForlabs_benchmark(13)
                },
                {
                    testName: 'BILIRUBIN, INDIRECT',
                    patientCount: 5,
                    percent: getPercentForlabs_benchmark(5)
                },
                {
                    testName: 'BILIRUBIN, TOTAL',
                    patientCount: 76,
                    percent: getPercentForlabs_benchmark(76)
                },
                {
                    testName: 'CREATININE',
                    patientCount: 4956,
                    percent: getPercentForlabs_benchmark(4956)
                },
                {
                    testName: 'INR',
                    patientCount: 963,
                    percent: getPercentForlabs_benchmark(963)
                },
                {
                    testName: 'PLATELETS',
                    patientCount: 2771,
                    percent: getPercentForlabs_benchmark(2771)
                },
                {
                    testName: 'TSH',
                    patientCount: 1558,
                    percent: getPercentForlabs_benchmark(1558)
                },
            ];
        }

        return labtestStats;

        function getPercentForlabs(value) {
            return (parseFloat((value / 895) * 100)).toFixed(1);
        }

        function getPercentForlabs_benchmark(value) {
            return (parseFloat((value / 16258) * 100)).toFixed(1);
        }

    },
    'isClient': function() {
        return this.isClient;
    }
});

Template.PayerWasteOpportunity.events({
    'change #treamentAvgCostSelection .radioduration': function(e) {
        let data = wasteData.care;
        let container = 'divRateFailure';
        if (e.target.value == "SVRNotAchieved") {
            renderHighBarChart(container, data.svr, 'Race', 'SVR12', 0);
        } else if (e.target.value == "Discontinued") {
            renderHighBarChart(container, data.discontinued, 'Race', 'IS_COMPLETED', 'No');
        } else if (e.target.value == "Followup") {
            renderHighBarChart(container, data.follow, 'Race', 'SVR12', null);
        } else if (e.target.value == "Notprescribed") {
            renderHighBarChart(container, data.Notprescribed, 'Race', 'NO_PRESCRIPTION', 'YES');
        } else if (e.target.value == "Regiments") {
            renderHighBarChart(container, data.Regiments, 'Race', 'IS_INAPPROPRIATE_REGIMEN', 'YES');
        } else if (e.target.value == "HCVRNA") {
            renderHighBarChart(container, data.HCVRNA, 'Race', 'IS_HAVE_HCV_RNA_PRIOR_TREATMENT', 'NO');
        } else if (e.target.value == "TherapyDuration") {
            renderHighBarChart(container, data.TherapyDuration, 'Race', 'TREATMENT_PERIOD', null);
        } else {
            renderHighBarChart(container, data.svr, 'Race', 'SVR12', 0);
        }
    },
    'click #waste-switch-overview': function(e) {
        let element = e.currentTarget;
        $(element).toggleClass('fa-toggle-on fa-toggle-off');
        let title = '';
        if ($(element).hasClass('fa-toggle-on')) {
            title = 'Switch to Overview';
        } else {
            title = 'Switch to Care Failure Chart';
        }
        $(element).attr('title', title);
        $('#wastOverviewMainScreen').toggle();
        $('#wastOverviewCureFailureChartScreen').toggle();
        $('.ui.accordion').accordion('refresh');
    },
    //click event for the waste boxes
    'click .wasteOpportunity-Card': (event, template) => {
        let clickData = $(event.currentTarget).attr('clickdata');

        //perform cleck event only if it's required
        if (clickData && clickData != '') {
            //trigger the click event of the menu
            $('.' + clickData).children('a').click();
        } else {
            return false;
        }
    },
    'click .analyticsWaste': function(e, template, data) {
        renderCharts(template);
    },
    'click .analytics_closebtn': function() {
        $('.analyticsPatientsPopup').hide();
    },
    'click .globalexportPatientWaste': (event) => {
        let identifier = $(event.currentTarget).attr('data');
        let identifierdiff = $(event.currentTarget).attr('diff');
        let identifieridiff = $(event.currentTarget).attr('idiff');
        let ids = [];
        if (identifier == 'costopportunity') {
            if (identifierdiff) {
                ids = wasteDataAll.costOpportunity[identifierdiff].patientIds;
            } else
                ids = wasteDataAll.costOpportunity.nonMedRecObj.patientIds;
        } else if (identifier == 'regiments') {
            ids = wasteDataAll[identifier].patientIds;
        } else if (identifier == 'wasteChartsData') {
            if (identifieridiff) {
                ids = wasteDataAll.data[identifier][identifierdiff][identifieridiff];
            } else {
                ids = wasteDataAll.data[identifier][identifierdiff].patientIds;
            }
        } else
            ids = wasteDataAll.actualWaste[identifier]["patientIds"];
        getPatientsDetails({}, ids);
    }
});

//funtion to invoke charts
let invokeChartsRender = (wasteDataObj) => {

    renderOverviewSectionCharts(wasteDataObj);

}



let populateTherapyData1 = (wasteDataObj) => {

    let totalpatients = 0,
        therapyDurationPatients = 0,
        therapyDurationCost = 0;

    // let therapyPatientsWOSVR = 0,
    //     therapyPatientsWOSVRCost = 0,
    //     therapyPatientsUncured = 0,
    //     therapyPatientsUncuredCost = 0;

        let therapyData = wasteDataObj.therapyDuration;

        totalpatients += wasteDataObj.patientCount;

        therapyDurationPatients += therapyData.patientCount;
       // therapyDurationCost += therapyData.totalCost;

        //therapyPatientsWOSVR += therapyData.innerData.patientsWithoutSVR.patientCount;
        //therapyPatientsWOSVRCost += therapyData.innerData.patientsWithoutSVR.totalCost;

        //therapyPatientsUncured += therapyData.innerData.patientsWithSVR.cureStatus.unCured.patientCount;
        //therapyPatientsUncuredCost += therapyData.innerData.patientsWithSVR.cureStatus.unCured.totalCost;


    //append the data on the UI
    $('.therapyDurationTotal').html(therapyDurationPatients);
    // $('#therapyDurationTotalCost').html(autoFormatCostValue(therapyDurationCost));
    // appendCostInTooltip('#therapyDurationTotalCost', therapyDurationCost);

    $('#patientsWithTherapyDuration').html(therapyDurationPatients);
    //$('#patientsWithTherapyDuration-Cost').html(getCostForCard(therapyDurationCost));
    $('#patientsWithTherapyDuration-percent').html(' - (' + getPercentForCards(therapyDurationPatients, totalpatients) + ')');


    $('#therapyDurationTotal-percent').html(' - (' + getPercentForCards(therapyDurationPatients, totalpatients) + ')');

    // $('#therapyDuration-WOSVR12').html(therapyPatientsWOSVR);
    // $('#therapyDuration-WOSVR12Cost').html(getCostForCard(therapyPatientsWOSVRCost));
    // $('#therapyDuration-WOSVR12Percent').html(' - (' + getPercentForCards(therapyPatientsWOSVR, therapyDurationPatients) + ')');

    // $('#therapyDuration-uncured').html(therapyPatientsUncured);
    // $('#therapyDuration-uncuredCost').html(getCostForCard(therapyPatientsUncuredCost));
    // $('#therapyDuration-uncuredPercent').html(' - (' + getPercentForCards(therapyPatientsUncured, therapyDurationPatients) + ')');

}


let populateRetreatmentData1 = (data) => {

    // Added By Yuvraj - May 24th 2017 (We are sending the total patient count directly in a key from backend. We dont have to caculate it again.)
    let wasteDataObj = data.categoriesData;
    let patientsWithMedication = data.withMedication.patientCount;
    let patientsWithoutMedication = data.withoutMedication.patientCount;

    let totalpatients = 0,
        retreatmentPatients = 0,
        retreatmentCost = 0;

    // let retreatmentPatientsWOSVR = 0,
    //     retreatmentPatientsWOSVRCost = 0,
    //     retreatmentPatientsUncured = 0,
    //     retreatmentPatientsUncuredCost = 0;

        let retreatment = wasteDataObj.retreatmentData;

        totalpatients += wasteDataObj.patientCount;

        retreatmentPatients += retreatment.patientCount;
       // retreatmentCost += retreatment.totalCost;

       // retreatmentPatientsWOSVR += retreatment.innerData.patientsWithoutSVR.patientCount;
      //  retreatmentPatientsWOSVRCost += retreatment.innerData.patientsWithoutSVR.totalCost;

       // retreatmentPatientsUncured += retreatment.innerData.patientsWithSVR.cureStatus.unCured.patientCount;
      //  retreatmentPatientsUncuredCost += retreatment.innerData.patientsWithSVR.cureStatus.unCured.totalCost;



    //append the data on the UI
    $('.retreatmentPatientsTotal').html(retreatmentPatients);
    // $('#retreatmentPatientsTotalCost').html(autoFormatCostValue(retreatmentCost));
    // appendCostInTooltip('#retreatmentPatientsTotalCost', retreatmentCost);

    $('#patientsWithRetreatedPatients').html(retreatmentPatients);
   // $('#patientsWithRetreatedPatients-Cost').html(getCostForCard(retreatmentCost));
    // $('#patientsWithRetreatedPatients-percent').html(' - (' + getPercentForCards(retreatmentPatients, retreatmentPatients) + ')');
    $('#patientsWithRetreatedPatients-percent').html(' - (' + getPercentForCards(retreatmentPatients, patientsWithMedication) + ')');

    $('#retreatmentTotal-percent').html(' - (' + getPercentForCards(retreatmentPatients, totalpatients) + ')');

    // $('#retreatment-WOSVR12').html(retreatmentPatientsWOSVR);
    // $('#retreatment-WOSVR12Cost').html(getCostForCard(retreatmentPatientsWOSVRCost));
    // $('#retreatment-WOSVR12Percent').html(' - (' + getPercentForCards(retreatmentPatientsWOSVR, retreatmentPatients) + ')');

    // $('#retreatment-uncured').html(retreatmentPatientsUncured);
    // $('#retreatment-uncuredCost').html(getCostForCard(retreatmentPatientsUncuredCost));
    // $('#retreatment-uncuredPercent').html(' - (' + getPercentForCards(retreatmentPatientsUncured, retreatmentPatients) + ')');
}


let populateRegimenData1 = (wasteDataObj) => {
    let totalpatients = 0,
        regimenPatients = 0;
      //  regimenCost = 0;

    // let regimenPatientsWOSVR = 0,
    //    // regimenPatientsWOSVRCost = 0,
    //     regimenPatientsUncured = 0;
    //    // regimenPatientsUncuredCost = 0;

        let regimen = wasteDataObj.regimenData;

        totalpatients += wasteDataObj.patientCount;

        regimenPatients += regimen.patientCount;
        //regimenCost += regimen.totalCost;

        //regimenPatientsWOSVR += regimen.innerData.patientsWithoutSVR.patientCount;
       // regimenPatientsWOSVRCost += regimen.innerData.patientsWithoutSVR.totalCost;

        //regimenPatientsUncured += regimen.innerData.patientsWithSVR.cureStatus.unCured.patientCount;
        //regimenPatientsUncuredCost += regimen.innerData.patientsWithSVR.cureStatus.unCured.totalCost;

    //append the data on the UI
    $('.regimenPatientsTotal').html(regimenPatients);
    //$('#regimenPatientsTotalCost').html(autoFormatCostValue(regimenCost));
    //appendCostInTooltip('#regimenPatientsTotalCost', regimenCost);

    $('#patientsWithInappropriateRegiments').html(regimenPatients);
    //$('#patientsWithInappropriateRegiments-Cost').html(getCostForCard(regimenCost));
    $('#patientsWithInappropriateRegiments-percent').html(' - (' + getPercentForCards(regimenPatients, totalpatients) + ')');


    $('#regimenTotal-percent').html(' - (' + getPercentForCards(regimenPatients, totalpatients) + ')');

    // $('#regimen-WOSVR12').html(regimenPatientsWOSVR);
    // $('#regimen-WOSVR12Cost').html(getCostForCard(regimenPatientsWOSVRCost));
    // $('#regimen-WOSVR12Percent').html(' - (' + getPercentForCards(regimenPatientsWOSVR, regimenPatients) + ')');

    // $('#regimen-uncured').html(regimenPatientsUncured);
    // $('#regimen-uncuredCost').html(getCostForCard(regimenPatientsUncuredCost));
    // $('#regimen-uncuredPercent').html(' - (' + getPercentForCards(regimenPatientsUncured, regimenPatients) + ')');
}


let populateHcvRNAData1 = (wasteDataObj) => {
    let totalpatients = 0,
        patientsWithHCVRNA = 0,
        patientsWithHCVRNACost = 0,
        patientsWithHCVRNARelapsed = 0,
        patientsWithHCVRNARelapsedCost = 0,
        patientsWithHCVRNARetreated = 0,
        patientsWithHCVRNARetreatedCost = 0;


        let hcvRNA = wasteDataObj.hcvRNA,
            hcvRNARelapsed = wasteDataObj.hcvRNARelapsed,
            hcvRNARetreated = wasteDataObj.hcvRNARetreated;

        totalpatients += wasteDataObj.patientCount;

        patientsWithHCVRNA += hcvRNA.patientCount;
        //patientsWithHCVRNACost += hcvRNA.totalCost;
        patientsWithHCVRNARelapsed += hcvRNARelapsed.patientCount;
        //patientsWithHCVRNARelapsedCost += hcvRNARelapsed.totalCost;
        patientsWithHCVRNARetreated += hcvRNARetreated.patientCount;
       // patientsWithHCVRNARetreatedCost += hcvRNARetreated.totalCost;


    $('.NoHCVRNAPatientsTotal').html(patientsWithHCVRNA);
   // $('#NoHCVRNAPatientsTotalCost').html(autoFormatCostValue(patientsWithHCVRNACost));
   // appendCostInTooltip('#NoHCVRNAPatientsTotalCost', patientsWithHCVRNACost);

    $('#NoHCVRNATotal-percent').html(' - (' + getPercentForCards(patientsWithHCVRNA, totalpatients) + ')');

    $('#patientsWithNullRNA').html(patientsWithHCVRNA);
    //$('#patientsWithNullRNA-Cost').html(getCostForCard(patientsWithHCVRNACost));
    $('#patientsWithNullRNA-percent').html(' - (' + getPercentForCards(patientsWithHCVRNA, totalpatients) + ')');

    // $('#wastage-totalPatientsWithNullRNA').html(patientsWithHCVRNA);

    //     $('#patientsWithNullRNARelapsed').html(patientsWithHCVRNARelapsed);
    //     //$('#patientsWithNullRNARelapsed-Cost').html(getCostForCard(patientsWithHCVRNARelapsedCost));
    //     $('#patientsWithNullRNARelapsed-percent').html(' - (' + getPercentForCards(patientsWithHCVRNARelapsed, patientsWithHCVRNA) + ')');

    //     $('#patientsWithNullRNARetreated').html(patientsWithHCVRNARetreated);
    //   //  $('#patientsWithNullRNARetreated-Cost').html(getCostForCard(patientsWithHCVRNARetreatedCost));
    //     $('#patientsWithNullRNARetreated-percent').html(' - (' + getPercentForCards(patientsWithHCVRNARetreated, patientsWithHCVRNA) + ')');

}

let populateNotFillingNextPrescriptionData1 = (data) => {

    // Added By Yuvraj - May 24th 2017 (We are sending the total patient count directly in a key from backend. We dont have to caculate it again.)
    let wasteDataObj = data.categoriesData;
    let patientsWithMedication = data.withMedication.patientCount;
    let patientsWithoutMedication = data.withoutMedication.patientCount;


    let totalpatients = 0,
        patientsWithNotFillingNextPrescription = 0,
        patientsWithNotFillingNextPrescriptionCost = 0;


        let hcvNotFillingNextPrescription = wasteDataObj.hcvNotFillingNextPrescription;

        totalpatients += wasteDataObj.patientCount;

        patientsWithNotFillingNextPrescription += hcvNotFillingNextPrescription.patientCount;
        //patientsWithNotFillingNextPrescriptionCost += hcvNotFillingNextPrescription.totalCost;


    // $('.notFillingNextPrescriptionPatientsTotal').html(patientsWithNotFillingNextPrescription);
    // $('#notFillingNextPrescriptionPatientsTotalCost').html(autoFormatCostValue(patientsWithNotFillingNextPrescriptionCost));
    // appendCostInTooltip('#notFillingNextPrescriptionPatientsTotalCost', patientsWithNotFillingNextPrescriptionCost);
    // $('#notFillingNextPrescriptionTotal-percent').html(' - (' + getPercentForCards(patientsWithNotFillingNextPrescription, totalpatients) + ')');

    // $('#notFillingNextPrescriptionTotal-percent').html(' - (' + getPercentForCards(patientsWithNotFillingNextPrescription, patientsWithMedication) + ')');

    $('#patientsWithNotFillingNextPrescription').html(patientsWithNotFillingNextPrescription);
    //$('#patientsWithNotFillingNextPrescription-Cost').html(getCostForCard(patientsWithNotFillingNextPrescriptionCost));
    // $('#patientsWithNotFillingNextPrescription-percent').html(' - (' + getPercentForCards(patientsWithNotFillingNextPrescription, totalpatients) + ')');
    $('#patientsWithNotFillingNextPrescription-percent').html(' - (' + getPercentForCards(patientsWithNotFillingNextPrescription, patientsWithMedication) + ')');

}

let populateNoPrescriptionData1 = (data, actualWaste) => {
    // Added By Yuvraj - May 24th 2017 (We are sending the total patient count directly in a key from backend. We dont have to caculate it again.)
    let wasteDataObj = data.categoriesData;
    let patientsWithMedication = data.withMedication.patientCount;
    let patientsWithoutMedication = data.withoutMedication.patientCount;

    let totalpatients = 0,
        patientsWithNoPrescription = 0,
        patientsWithNotFillingNextPrescription = 0,
        patientsWithNotFillingNextPrescriptionCost = 0,
        patientsWithNoPrescriptionCost = 0;



        let hcvNoPrescription = wasteDataObj.hcvNoPrescription;
        let hcvNotFillingNextPrescription = wasteDataObj.hcvNotFillingNextPrescription;

        // totalpatients += wasteDataObj[keys].patientCount;

        totalpatients += hcvNoPrescription.totalPatientCount;

        patientsWithNotFillingNextPrescription += hcvNotFillingNextPrescription.patientCount;
       // patientsWithNotFillingNextPrescriptionCost += hcvNotFillingNextPrescription.totalCost;

        patientsWithNoPrescription += hcvNoPrescription.patientCount;
     //   patientsWithNoPrescriptionCost += hcvNoPrescription.totalCost;


    //$('.noPrescriptionTotal').html(patientsWithNoPrescription + patientsWithNotFillingNextPrescription);
    $('.noPrescriptionTotal').html(patientsWithoutMedication);

    //$('#noPrescriptionTotalCost').html(autoFormatCostValue(patientsWithNoPrescriptionCost + patientsWithNotFillingNextPrescriptionCost));

    let missingPresCost = _.pluck(actualWaste.noPrescriptionObj.chartData, 'y').sum();
    //appendCostInTooltip('#noPrescriptionTotalCost', patientsWithNoPrescriptionCost + patientsWithNotFillingNextPrescriptionCost);
    // $('#noPrescriptionTotalCost').html(autoFormatCostValue(missingPresCost));
    // appendCostInTooltip('#noPrescriptionTotalCost', missingPresCost);
    $('#noPrescriptionTotal-percent').html(' - (' + getPercentForCards(patientsWithoutMedication, patientsWithoutMedication + patientsWithMedication) + ')');

    $('#patientsWithNoPrescription').html(patientsWithNoPrescription);
    //$('#patientsWithNoPrescription-Cost').html(getCostForCard(patientsWithNoPrescriptionCost));
    // $('#patientsWithNoPrescription-percent').html(' - (' + getPercentForCards(patientsWithNoPrescription, totalpatients) + ')');
    $('#patientsWithNoPrescription-percent').html(' - (' + getPercentForCards(patientsWithNoPrescription, patientsWithoutMedication + patientsWithMedication) + ')');
    // $('#total-wastage-noPrescriptionAndNoRefill').html(patientsWithNoPrescription + patientsWithNotFillingNextPrescription);

}


let populateNonFdaCombosSection1 = (wasteDataObj) => {
    let totalpatients = 0,
        nonfdaApprovedCombosPatients = 0,
        nonfdaApprovedCombosCost = 0;



        let nonfdaApprovedCombos = wasteDataObj.nonfdaApprovedCombos;

        totalpatients += wasteDataObj.patientCount;

        nonfdaApprovedCombosPatients += nonfdaApprovedCombos.patientCount;
        //nonfdaApprovedCombosCost += nonfdaApprovedCombos.totalCost;


    $('.waste-totalNonfdaCombosPatients').html(nonfdaApprovedCombosPatients);
    // $('.waste-totalNonfdaCombosCost').html(autoFormatCostValue(nonfdaApprovedCombosCost));
    // appendCostInTooltip('.waste-totalNonfdaCombosCost', nonfdaApprovedCombosCost);

   // $('#waste-totalNonfdaCombosCost-Menu').html(getCostForCard(nonfdaApprovedCombosCost));

    $('.waste-totalNonfdaCombosPercent').html(' - (' + getPercentForCards(nonfdaApprovedCombosPatients, totalpatients) + ')');
}


let overAllTotalWasteCost1 = (wasteDataObj) => {
    let totalSpentCost = _.pluck(wasteDataObj, 'overAllCost').sum();
    let totalWasteCost = _.pluck(wasteDataObj, 'estimatedWasteCost').sum();

    // $('#totalExpenditureCost').html(autoFormatCostValue(totalSpentCost));

    // $('#totalWasteCost').html(autoFormatCostValue(totalWasteCost));
    // appendCostInTooltip('#totalWasteCost', totalWasteCost);

    // $('#totalExpenditureCost-Percent').html(' - (' + getPercentForCards(totalWasteCost, totalSpentCost) + ')');

}

let renderRelapsedSectionCharts = (wasteDataObj) => {
    //week distribution chart
    //waste-RelapsedWeekDistributionChart
    // let data = [
    //     {name: 'Week 8', y: 154},
    //     {name: 'Week 16', y: 410},
    //     {name: 'Week 24', y: 600},
    //     {name: 'Week 36', y: 520}
    // ];

    let data = wasteDataObj.therapyDistributionForRelapsed;

    Highcharts.chart('waste-RelapsedWeekDistributionChart', {
        chart: {
            type: 'pie',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}W : {point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Treatment Period: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Treatment Period: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Weeks',
            colorByPoint: true,
            data: data
        }]
    });


    //treatment distribution chart
    //waste-RelapsedTreatmentDistributionChart

    let dataObj = wasteDataObj.treatmentDistributionForRelapsed;
    // dataObj.data = [
    //     {name: 'Naive', y: 154 , drilldown: 'NaiveDrillDown'},
    //     {name: 'Experienced', y: 410 , drilldown: 'ExperiencedDrillDown'},
    // ];

    // dataObj.drillDown = [
    //     {
    //         name: 'Naive',
    //         id: 'NaiveDrillDown',
    //         data: [
    //             {name: '1a', y: 70},
    //             {name: '1b', y: 60},
    //             {name: '2', y: 24}
    //         ]
    //     }
    // ];

    let relapsedTreamentChart = new Highcharts.chart('waste-RelapsedTreatmentDistributionChart', {
        chart: {
            type: 'pie',
            width: 450,
            height: 400,
            events: {
                drilldown: function(e) {
                    relapsedTreamentChart.subtitle.update({ text: 'Click back button to view treatment distribution' });
                },
                drillup: function(e) {
                    relapsedTreamentChart.subtitle.update({ text: 'Click the slices to view genotype distribution' });
                }
            }
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: 'Click the slices to view genotype distribution'
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>{series.name}: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>{series.name}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Treatment',
            colorByPoint: true,
            data: dataObj.data
        }],
        drilldown: {
            series: dataObj.drilldown,
            drillUpButton: getStyleForHighchartBackBtn()
        }
    });
}

let renderSVR12SectionsCharts = (wasteChartData) => {
    let data = wasteChartData.genotypeDistributionForNullSVR12;

    //genotype distribution
    // let data = [{
    //         name: '1a',
    //         y: 56,
    //     }, {
    //         name: '1b',
    //         y: 24,
    //     }];

    if (data.length == 0) {
        appendNoDataFoundSection('waste-SVR12GenotypeDistributionChart');
        appendNoDataFoundSection('waste-SVR12TherapyDistributionChart');
        return;
    } else {
        Highcharts.chart('waste-SVR12GenotypeDistributionChart', {
            chart: {
                type: 'column',
                width: 450,
                height: 400
            },
            colors: customColorsArray(),
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Genotypes'
                }
            },
            yAxis: {
                title: {
                    text: 'Patients'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}'
                    }
                }
            },
            // tooltip: {
            //     useHTML: true,
            //     followPointer: false,
            //     headerFormat: `<div>`,
            //     pointFormat: `<div>Genotype: {point.name}</div>
            //                 <div>Patient Count: {point.y}</div>
            //                 <div>Cost: {point.cost}</div>`,
            //     footerFormat: `</div>`,
            //     hideDelay: 30
            // },
            tooltip: {
                useHTML: true,
                followPointer: false,
                headerFormat: `<div>`,
                pointFormat: `<div>Genotype: {point.name}</div>
                            <div>Patient Count: {point.y}</div>`,
                footerFormat: `</div>`,
                hideDelay: 30
            },
            series: [{
                name: 'Genotype',
                colorByPoint: true,
                data: data
            }],
        });
    }


    //Therapy distribution
    // let newData = [{
    //         name: '8',
    //         y: 56,
    //     }, {
    //         name: '12',
    //         y: 24,
    //     }];
    let therapyData = wasteChartData.therapyDistributionForNullSVR12;
    Highcharts.chart('waste-SVR12TherapyDistributionChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Treatment Period (in weeks)'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Treatment Period: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Treatment Period: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Weeks',
            colorByPoint: true,
            data: therapyData
        }],
    });
}

let populateProviderSectionData = (wasteDataObj) => {
    // let data = [
    //     {code: 'NJ', value: 125},
    //     {code: 'CA', value: 574},
    //     {code: 'PA', value: 457},
    //     {code: 'AK', value: 963},
    //     {code: 'TX', value: 587},
    //     {code: 'MT', value: 985},
    //     {code: 'CO', value: 214},
    //     {code: 'UT', value: 325},
    //     {code: 'KY', value: 452},
    //     {code: 'TN', value: 965},
    //     {code: 'AL', value: 487},
    //     {code: 'GA', value: 325},
    //     {code: 'IN', value: 698}
    // ];

    let data = wasteDataObj.providersByStateForNullSVR12;
    if (data && data.length < 1) {
        appendNoDataFoundSection('waste-ProviderDistribution');
        //appendNoDataFoundSection('waste-ProviderDistributionGenotype');
        return;
    }
    Highcharts.mapChart('waste-ProviderDistribution', {

        chart: {
            borderWidth: 0,
            width: 450,
            height: 390,
            marginLeft: 20,
            padding: 5
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },

        legend: {
            layout: 'horizontal',
            borderWidth: 0,
            backgroundColor: 'rgba(255,255,255,0.85)',
            floating: true,
            verticalAlign: 'top',
            y: 25
        },

        mapNavigation: {
            enabled: true
        },

        colorAxis: {
            min: 1,
            type: 'logarithmic',
            minColor: '#EEEEFF',
            maxColor: '#000022',
            stops: [
                [0, '#EFEFFF'],
                [0.67, '#4444FF'],
                [1, '#000022']
            ]
        },

        series: [{
            animation: {
                duration: 1000
            },
            data: data,
            mapData: Highcharts.maps['countries/us/us-all'],
            joinBy: ['postal-code', 'code'],
            dataLabels: {
                enabled: true,
                color: '#FFFFFF',
                format: '{point.value}'
            },
            name: '',
            tooltip: {
                useHTML: true,
                followPointer: false,
                headerFormat: `<div>`,
                pointFormat: `<div>State Code: {point.code}</div><br/>
                            <div>Provider Count: {point.value:,0.0f}</div>`,
                footerFormat: `</div>`,
                hideDelay: 30
            },
            // tooltip: {
            //     pointFormat: '{point.code}: {point.value}'
            // }
        }]
    });

    //genotype wise distribution 
    // Highcharts.chart('waste-ProviderDistributionGenotype', {
    //     chart: {
    //         type: 'column',
    //         width: 450,
    //         height: 400
    //     },
    //     title: {
    //         text: ''
    //     },
    //     subtitle: {
    //         text: ''
    //     },
    //     colors: customColorsArray(),
    //     xAxis: {
    //         type: 'category',
    //         title: {
    //             text: 'Genotype'
    //         }
    //     },
    //     yAxis: {
    //         title: {
    //             text: 'No of Patients'
    //         }
    //     },
    //     legend: {
    //         enabled: false
    //     },
    //     plotOptions: {
    //         series: {
    //             borderWidth: 0,
    //             dataLabels: {
    //                 enabled: true,
    //                 //format:`$ {point.y:,0.0f}`,
    //                 formatter:function(){
    //                     if(this.y){
    //                         return commaSeperatedNumber(this.y);
    //                     }
    //                 }
    //             }
    //         }
    //     },
    //     tooltip: {
    //         useHTML: true,
    //         followPointer: false,
    //         headerFormat: `<div>`,
    //         pointFormat: `<div>Genotype: {point.name}</div>
    //                     <div>Patient Count: {point.count:,0.0f}</div>
    //                     <div>Cost: {point.cost}</div>`,
    //         footerFormat: `</div>`,
    //         hideDelay: 30
    //     },

    //     series: [{
    //         name: 'Genotype',
    //         colorByPoint: true,
    //         data: wasteDataObj.genotypeDistributionForNullSVR12
    //     }],
    // });

    /**
     * @author: Pramveer
     * @date: 22nd May 17
     * @desc: Added new functions for new charts
     */
    providerDrugDistibution(wasteDataObj.drugDistribution);
    providerNonHCVRnaPriorTreatment(wasteDataObj.nonhcvPriorTreatment);
    providerNonFdaPrescriptions(wasteDataObj.nonFdaCompliantPrescriptions);

}

/**
 * @author: Pramveer
 * @date: 22nd May 17
 * @desc: function to render provider chart for drug distribution
 */
let providerDrugDistibution = (chartData) => {
    if (chartData && chartData.length < 1) {
        appendNoDataFoundSection('waste-ProviderDrugDistribution');
        return;
    }

    Highcharts.chart('waste-ProviderDrugDistribution', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Medications'
            }
        },
        yAxis: {
            title: {
                text: 'Providers'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Medication: {point.fullName}</div>
        //                 <div>Provider Count: {point.y}</div>
        //                 <div>Patient Count: {point.patients}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Medication: {point.fullName}</div>
                        <div>Provider Count: {point.y}</div>
                        <div>Patient Count: {point.patients}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: chartData
        }],
    });

}

/**
 * @author: Pramveer
 * @date: 22nd May 17
 * @desc: function to render provider chart for HCV RNA prior treatment
 */
let providerNonHCVRnaPriorTreatment = (chartData) => {
    if (chartData && chartData.length < 1) {
        appendNoDataFoundSection('waste-ProviderNoHCVRNAPriorTreatment');
        return;
    }

    Highcharts.chart('waste-ProviderNoHCVRNAPriorTreatment', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Treatment Period (in Weeks)'
            }
        },
        yAxis: {
            title: {
                text: 'Providers'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Treatment Period: {point.name}</div>
        //                 <div>Provider Count: {point.y}</div>
        //                 <div>Patient Count: {point.patients}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Treatment Period: {point.name}</div>
                        <div>Provider Count: {point.y}</div>
                        <div>Patient Count: {point.patients}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: chartData
        }],
    });

}

/**
 * @author: Pramveer
 * @date: 22nd May 17
 * @desc: function to render provider chart for non fda compliant medications
 */
let providerNonFdaPrescriptions = (chartData) => {
    if (chartData && chartData.length < 1) {
        appendNoDataFoundSection('waste-ProviderNonFdaComplaintPrescription');
        return;
    }

    Highcharts.chart('waste-ProviderNonFdaComplaintPrescription', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Non FDA Compliant Medications'
            }
        },
        yAxis: {
            title: {
                text: 'Providers'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Medication: {point.fullName}</div>
        //                 <div>Provider Count: {point.y}</div>
        //                 <div>Patient Count: {point.patients}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Medication: {point.fullName}</div>
                        <div>Provider Count: {point.y}</div>
                        <div>Patient Count: {point.patients}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: chartData
        }],
    });

}

let renderRegimentsCharts = (wasteChartData, medicationSwitchData) => {
    //Therapy Distribution
    //waste-RegimentsDrugDistribution
    //console.log(wasteChartData);
    //let dataObj = {};
    // dataObj.data = [
    //     {name: 'Sovaldi', y: 14 , drilldown: 'Sovaldi_DrillDown'},
    //     {name: 'Ribavirin', y: 20 , drilldown: 'Ribavirin_DrillDown'},
    //     {name: 'Daklinza', y: 50 , drilldown: null},
    //     {name: 'Viekira Pak', y: 60 , drilldown: null},
    // ];

    // dataObj.drilldown = [
    //     {
    //         name: 'Sovaldi',
    //         id: 'Sovaldi_DrillDown',
    //         data: [
    //             {name: '2', y: 70},
    //             {name: '14', y: 60},
    //             {name: '5', y: 24}
    //         ]
    //     },
    //     {
    //         name: 'Ribavirin',
    //         id: 'Ribavirin_DrillDown',
    //         data: [
    //             {name: '21', y: 70},
    //             {name: '4', y: 60},
    //             {name: '50', y: 24}
    //         ]
    //     }
    // ];
    //console.log(wasteChartData);
    regimentsDrilldownChartMedication(wasteChartData);


    //Cost Distribution
    //waste-RegimentsDrugCost
    // let data = [
    //     {name: 'Sovaldi',y: 58471 },
    //     {name: 'Ribavirin',y: 87541},
    //     {name: 'Daklinza',y: 96354},
    //     {name: 'Viekira Pak',y: 12544},
    // ];
    let data = wasteChartData.regimentsCost;
    if (data.length < 1) {
        appendNoDataFoundSection('waste-RegimentsDrugCost');
    } else {
        Highcharts.chart('waste-RegimentsDrugCost', {
            chart: {
                type: 'column',
                width: 450,
                height: 400
            },
            colors: customColorsArray(),
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Drugs'
                }
            },
            yAxis: {
                title: {
                    text: 'Cost($)'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        //format:`$ {point.y:,0.0f}`,
                        formatter: function() {
                            if (this.y) {
                                return '$' + autoFormatCostValue(this.y);
                            }
                        }
                    }
                }
            },
            // tooltip: {
            //     useHTML: true,
            //     followPointer: false,
            //     headerFormat: `<div>`,
            //     pointFormat: `<div>Drug: {point.fullName}</div>
            //                     <div>Patient Count: {point.count:,0.0f}</div>
            //                     <div>Cost:$ {point.y:,0.0f}</div>`,
            //     footerFormat: `</div>`,
            //     hideDelay: 30
            // },
            tooltip: {
                useHTML: true,
                followPointer: false,
                headerFormat: `<div>`,
                pointFormat: `<div>Drug: {point.fullName}</div>
                                <div>Patient Count: {point.count:,0.0f}</div>`,
                footerFormat: `</div>`,
                hideDelay: 30
            },

            series: [{
                name: 'Genotype',
                colorByPoint: true,
                data: data
            }],
        });

    }
    //medication switch
    let switchObj = medicationSwitchData.medicationSwitch;
    // switchObj.data = [
    //     {name: '1', y: 154 , drilldown: 'NaiveDrillDown'},
    //     {name: '2', y: 120 , drilldown: 'ExperiencedDrillDown'},
    //     {name: '3', y: 240 , drilldown: null},
    // ];

    // switchObj.drillDown = [
    //     {
    //         name: 'Naive',
    //         id: 'NaiveDrillDown',
    //         data: [
    //             {name: '1a', y: 70},
    //             {name: '1b', y: 60},
    //             {name: '2', y: 24}
    //         ]
    //     }
    // ];
    if (switchObj.data.length < 1) {
        appendNoDataFoundSection('waste-RegimentsDrugCost');
    } else {
        let medSwitchChart = new Highcharts.chart('waste-RegimentsMedicationSwitchChart', {
            chart: {
                type: 'pie',
                width: 950,
                height: 400,
                events: {
                    drilldown: function(e) {
                        medSwitchChart.subtitle.update({ text: 'Click back button to view medication switch counts' });
                        medSwitchChart.legend.title.attr({ text: 'Medications' });
                    },
                    drillup: function(e) {
                        medSwitchChart.subtitle.update({ text: 'Click the slices to view medication distribution' });
                        medSwitchChart.legend.title.attr({ text: 'Medication Switches' });
                    }
                }
            },
            colors: customColorsArray(),
            title: {
                text: ''
            },
            subtitle: {
                text: 'Click the slices to view medication distribution'
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:,0.0f}%',
                        distance: -30,
                        rotate: 0
                    },
                    showInLegend: true
                }
            },
            legend: {
                title: {
                    text: 'Medication Switches'
                },
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top',
                x: 10,
                y: 50,
                itemStyle: {
                    fontSize: '11px',
                    fontWeight: '300',
                    color: '#666666'
                },
                labelFormatter: function() {
                    //if(this.name.length<4){
                    //return 'Switch:'+this.name;
                    return this.name;
                    //}    
                }
            },
            tooltip: {
                useHTML: true,
                followPointer: false,
                headerFormat: `<div>`,
                pointFormat: `<div>{series.name}: {point.name}</div>
                                <div>Patient Count: {point.count}</div>`,
                footerFormat: `</div>`,
                hideDelay: 30
            },
            series: [{
                name: 'No of Medications',
                colorByPoint: true,
                data: switchObj.data
            }],
            drilldown: {
                series: switchObj.drilldown,
                drillUpButton: getStyleForHighchartBackBtn()
            }
        });
    }

}

let regimentsDrilldownChartMedication = (wasteChartData) =>{
    let dataObj = wasteChartData.regimentsdrilldown;
    if (dataObj.data.length < 1) {
        appendNoDataFoundSection('waste-RegimentsDrugDistribution');
    } else {
        let regimentsCharts = new Highcharts.chart('waste-RegimentsDrugDistribution', {
            chart: {
                type: 'pie',
                width: 450,
                height: 400,
                events: {
                    drilldown: function(e) {
                        regimentsCharts.subtitle.update({ text: 'Click back button to view Therapy distribution(in weeks)' });
                        //regimentsCharts.legend.update({ enabled: false });
                    },
                    drillup: function(e) {
                        regimentsCharts.subtitle.update({ text: 'Click the slices to view Treatment period distribution(in weeks)' });
                        //regimentsCharts.legend.update({ enabled: true });
                    }
                }
            },
            colors: customColorsArray(),
            title: {
                text: ''
            },
            subtitle: {
                text: 'Click the slices to view Treatment period Distribution(in weeks)'
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        //format: '{point.y:,0.2f}%',
                        distance: -30,
                        rotate: 0,
                        formatter: function() {
                            //console.log(this);
                            if (this.point.isDrilldown) {
                                return this.point.name + ':' + Highcharts.numberFormat(this.y, 2) + '%';
                            } else {
                                if (this.y > 4)
                                    return Highcharts.numberFormat(this.y, 2) + '%';
                            }

                        },
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top',
                x: 10,
                y: 50,
                itemStyle: {
                    fontSize: '11px',
                    fontWeight: '300',
                    color: '#666666'
                },
                labelFormatter: function() {
                    if (this.name.length < 4) {
                        return this.name;
                    }
                    return getDrugAbbr(this.name);
                }
            },
            
            tooltip: {
                useHTML: true,
                followPointer: false,
                formatter: function() {
                    if (this.point.isDrilldown) {
                        return `<span>${this.series.name}</span>: <b>${this.point.name}</b><br/>
                            Medication:${this.point.medname}<br/>
                            Patient Count:${commaSeperatedNumber(~~this.point.count)}<br/>
                            Expected Dosage:${this.point.actualDosage}
                            <br/>Given Dosage:${this.point.givenDosage}<br/>
                            Dosage Quantity:${this.point.countDosage}<br/>`;
                    } else {
                        return `<span>${this.series.name}</span>: <b>${this.point.name}</b><br/>
                            Patient Count:${commaSeperatedNumber(this.point.count)}<br/>`;
                    }

                },
                // headerFormat: `<div>`,
                // pointFormat: `<div>Drug: {point.name}</div>
                //             <div>Patient Count: {point.count:,0.0f}</div>
                //             <div>Cost: $ {point.cost:,0.0f}</div>`,
                // footerFormat: `</div>`,
                hideDelay: 30
            },
            series: [{
                name: 'Drug',
                colorByPoint: true,
                data: dataObj.data
            }],
            drilldown: {
                series: dataObj.drilldown,
                drillUpButton: getStyleForHighchartBackBtn()
            }
        });
    }
}
let renderTherapyDurationCharts = (wasteChartData) => {
    //NON FDA Genotype Distribution 
    let dataObj = wasteChartData.therapyDurationData;

    if (dataObj.data.length < 1) {
        appendNoDataFoundSection('waste-TherapyNonFdaGenotypes');
        return;
    }
    // dataObj.data = [
    //     {name: '1a', y: 14 , drilldown: '1a_DrillDown'},
    //     {name: '1b', y: 20 , drilldown: '1b_DrillDown'},
    //     {name: '2', y: 50 , drilldown: '2_DrillDown'},
    //     {name: '3', y: 60 , drilldown: null},
    //     {name: '4', y: 80 , drilldown: null}
    // ];

    // dataObj.drilldown = [
    //     {
    //         name: '1a',
    //         id: '1a_DrillDown',
    //         data: [
    //             {name: '4', y: 70},
    //             {name: '10', y: 60},
    //             {name: '11', y: 24}
    //         ]
    //     },
    //     {
    //         name: '1b',
    //         id: '1b_DrillDown',
    //         data: [
    //             {name: '4', y: 80},
    //             {name: '18', y: 90},
    //             {name: '40', y: 54}
    //         ]
    //     },
    //     {
    //         name: '2',
    //         id: '2_DrillDown',
    //         data: [
    //             {name: '4', y: 45},
    //             {name: '18', y: 60},
    //             {name: '50', y: 15}
    //         ]
    //     }
    // ];

    let therapyDrillChart = new Highcharts.chart('waste-TherapyNonFdaGenotypes', {
        chart: {
            type: 'column',
            width: 950,
            height: 400,
            events: {
                drilldown: function(e) {
                    therapyDrillChart.subtitle.update({ text: 'Click back button to view genotype distrbution' });
                    therapyDrillChart.xAxis[0].axisTitle.attr({
                        text: 'Treatment Period (in weeks)'
                    });
                },
                drillup: function(e) {
                    therapyDrillChart.subtitle.update({ text: 'Click the bars to view the Non FDA weeks Distribution' });
                    therapyDrillChart.xAxis[0].axisTitle.attr({
                        text: 'Genotypes'
                    });
                }
            }
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: 'Click the bars to view the Non FDA weeks Distribution'
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Genotypes'
            }
        },
        yAxis: {
            title: {
                text: 'No of Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>{series.name}: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>{series.name}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: dataObj.data
        }],
        drilldown: {
            series: dataObj.drilldown,
            drillUpButton: getStyleForHighchartBackBtn()
        }
    });
}

let renderRetreatedCharts = (wasteChartData) => {
    let retreatedObj = wasteChartData.retreatedChartsData;

    if (retreatedObj.genotypeDistribution.length < 1) {
        appendNoDataFoundSection('waste-RetreatedGenotypesChart');
        appendNoDataFoundSection('waste-RetreatedWeeksChart');
        return;
    }
    //Genotype Distribution
    // let data = [{
    //         name: '1a',
    //         y: 56,
    //     }, {
    //         name: '1b',
    //         y: 24,
    //     }, {
    //         name: '2',
    //         y: 50,
    //     }];
    Highcharts.chart('waste-RetreatedGenotypesChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Genotypes'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Genotype: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Genotype: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: retreatedObj.genotypeDistribution
        }],
    });

    //Therapy weeks Distribution
    // let weeksData = [{
    //         name: '4',
    //         y: 56,
    //     }, {
    //         name: '6',
    //         y: 24,
    //     }, {
    //         name: '14',
    //         y: 50,
    //     }];
    Highcharts.chart('waste-RetreatedWeeksChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Treatment Period (in weeks)'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Treatment Period: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Treatment Period: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: retreatedObj.treatmentPeriodDistribution
        }],
    });

}

let renderDiscontinuedCharts = (wasteChartData) => {
    let discontinueData = wasteChartData.discontinuedData;
    //Genotype Distribution
    // let data = [{
    //         name: '1a',
    //         y: 56,
    //     }, {
    //         name: '1b',
    //         y: 24,
    //     }, {
    //         name: '2',
    //         y: 50,
    //     }];
    if (discontinueData && discontinueData.genotypeDistribution.length < 1) {
        appendNoDataFoundSection('waste-DiscontinuedGenotypeChart');
        appendNoDataFoundSection('waste-DiscontinuedWeeksChart');
        return;
    } else {
        Highcharts.chart('waste-DiscontinuedGenotypeChart', {
            chart: {
                type: 'column',
                width: 450,
                height: 400
            },
            colors: customColorsArray(),
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Genotypes'
                }
            },
            yAxis: {
                title: {
                    text: 'Patients'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}'
                    }
                }
            },
            // tooltip: {
            //     useHTML: true,
            //     followPointer: false,
            //     headerFormat: `<div>`,
            //     pointFormat: `<div>Genotype: {point.name}</div>
            //                     <div>Patient Count: {point.y}</div>
            //                     <div>Cost: {point.cost}</div>`,
            //     footerFormat: `</div>`,
            //     hideDelay: 30
            // },
            tooltip: {
                useHTML: true,
                followPointer: false,
                headerFormat: `<div>`,
                pointFormat: `<div>Genotype: {point.name}</div>
                                <div>Patient Count: {point.y}</div>`,
                footerFormat: `</div>`,
                hideDelay: 30
            },
            series: [{
                name: 'Genotype',
                colorByPoint: true,
                data: discontinueData.genotypeDistribution
            }],
        });
    }
    //Therapy weeks Distribution
    // let weeksData = [{
    //         name: '4',
    //         y: 56,
    //     }, {
    //         name: '6',
    //         y: 24,
    //     }, {
    //         name: '14',
    //         y: 50,
    //     }];

    Highcharts.chart('waste-DiscontinuedWeeksChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Treatment Period (in Weeks)'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Treatment Period: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Treatment Period: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: discontinueData.treatmentPeriodDistribution
        }],
    });
}



let renderIncompleteTreatmentCharts = (wasteChartData) => {
    let discontinueData = wasteChartData.discontinuedData;
    //Genotype Distribution
    // let data = [{
    //         name: '1a',
    //         y: 56,
    //     }, {
    //         name: '1b',
    //         y: 24,
    //     }, {
    //         name: '2',
    //         y: 50,
    //     }];
    if (discontinueData && discontinueData.genotypeDistribution.length < 1) {
        appendNoDataFoundSection('waste-IncompleteTreatmentGenotypeChart');
        appendNoDataFoundSection('waste-incompleteTreatmentdWeeksChart');
        return;
    } else {
        Highcharts.chart('waste-IncompleteTreatmentGenotypeChart', {
            chart: {
                type: 'column',
                width: 450,
                height: 400
            },
            colors: customColorsArray(),
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Genotypes'
                }
            },
            yAxis: {
                title: {
                    text: 'Patients'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}'
                    }
                }
            },
            // tooltip: {
            //     useHTML: true,
            //     followPointer: false,
            //     headerFormat: `<div>`,
            //     pointFormat: `<div>Genotype: {point.name}</div>
            //                     <div>Patient Count: {point.y}</div>
            //                     <div>Cost: {point.cost}</div>`,
            //     footerFormat: `</div>`,
            //     hideDelay: 30
            // },
            tooltip: {
                useHTML: true,
                followPointer: false,
                headerFormat: `<div>`,
                pointFormat: `<div>Genotype: {point.name}</div>
                                <div>Patient Count: {point.y}</div>`,
                footerFormat: `</div>`,
                hideDelay: 30
            },
            series: [{
                name: 'Genotype',
                colorByPoint: true,
                data: discontinueData.genotypeDistribution
            }],
        });
    }
    //Therapy weeks Distribution
    // let weeksData = [{
    //         name: '4',
    //         y: 56,
    //     }, {
    //         name: '6',
    //         y: 24,
    //     }, {
    //         name: '14',
    //         y: 50,
    //     }];

    Highcharts.chart('waste-incompleteTreatmentdWeeksChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Treatment Period (in Weeks)'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Treatment Period: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Treatment Period: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: discontinueData.treatmentPeriodDistribution
        }],
    });
}



let renderTreatmentChangeCharts = (wasteChartData) => {
    let discontinueData = wasteChartData.treatmentChangeData;
    //Genotype Distribution
    // let data = [{
    //         name: '1a',
    //         y: 56,
    //     }, {
    //         name: '1b',
    //         y: 24,
    //     }, {
    //         name: '2',
    //         y: 50,
    //     }];
    if (discontinueData && discontinueData.genotypeDistribution.length < 1) {
        appendNoDataFoundSection('waste-treatmentChangeGenotypeChart');
        appendNoDataFoundSection('waste-treatmentChangeWeeksChart');
        return;
    } else {
        Highcharts.chart('waste-treatmentChangeGenotypeChart', {
            chart: {
                type: 'column',
                width: 450,
                height: 400
            },
            colors: customColorsArray(),
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Genotypes'
                }
            },
            yAxis: {
                title: {
                    text: 'Patients'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}'
                    }
                }
            },
            // tooltip: {
            //     useHTML: true,
            //     followPointer: false,
            //     headerFormat: `<div>`,
            //     pointFormat: `<div>Genotype: {point.name}</div>
            //                     <div>Patient Count: {point.y}</div>
            //                     <div>Cost: {point.cost}</div>`,
            //     footerFormat: `</div>`,
            //     hideDelay: 30
            // },
            tooltip: {
                useHTML: true,
                followPointer: false,
                headerFormat: `<div>`,
                pointFormat: `<div>Genotype: {point.name}</div>
                                <div>Patient Count: {point.y}</div>`,
                footerFormat: `</div>`,
                hideDelay: 30
            },
            series: [{
                name: 'Genotype',
                colorByPoint: true,
                data: discontinueData.genotypeDistribution
            }],
        });
    }
    //Therapy weeks Distribution
    // let weeksData = [{
    //         name: '4',
    //         y: 56,
    //     }, {
    //         name: '6',
    //         y: 24,
    //     }, {
    //         name: '14',
    //         y: 50,
    //     }];

    Highcharts.chart('waste-treatmentChangeWeeksChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Treatment Period (in Weeks)'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Treatment Period: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Treatment Period: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: discontinueData.treatmentPeriodDistribution
        }],
    });
}



let renderNonFdaCombinationCharts = (wasteChartData) => {
    let baseChartData = wasteChartData.nonfdaCombosData;

    if (baseChartData && baseChartData.therapyDistribution.length < 1) {
        appendNoDataFoundSection('waste-NonFdaCombosDistribution');
        appendNoDataFoundSection('waste-NonFdaGenotypeDistribution');
        return;
    }
    Highcharts.chart('waste-NonFdaCombosDistribution', {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Medications'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>Medication: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Medication: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseChartData.therapyDistribution
        }],
    });

    renderPatientsGenotypeDistrbutionBars('waste-NonFdaGenotypeDistribution', baseChartData.genotypeDistribution);
}


let renderNonHcvRnaCharts = (wasteChartData) => {
    let baseChartData = wasteChartData.nonHcvRnaData;

    //render chart for non hcv rna patients
    renderPatientsGenotypeDistrbutionBars('waste-hcvRnaGenotypeDistribution', baseChartData.genotypeDistribution);

    //render chart for non hcv rna patients
    renderPatientsGenotypeDistrbutionBars('waste-hcvRnaRelapsedDistribution', baseChartData.relaspedDistribution);

    //render chart for non hcv rna patients
    renderPatientsGenotypeDistrbutionBars('waste-hcvRnaRetreatedDistribution', baseChartData.retreatedDistribution);
}


let renderPatientsGenotypeDistrbutionBars = (container, chartData) => {

    if (chartData.length < 1) {
        appendNoDataFoundSection(container);
        return;
    }
    Highcharts.chart(container, {
        chart: {
            type: 'column',
            width: 450,
            height: 400
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Genotypes'
            }
        },
        yAxis: {
            title: {
                text: 'Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>{series.name}: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>{series.name}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: chartData
        }],
    });
}

//function to append current filters on the waste popup
let appendFiltersOnWastePopup = (filterObj) => {
    let genotype = filterObj.genotypes.length > 0 ? filterObj.genotypes.join(',') : 'All';
    let cirrhosis = filterObj.cirrhosis.length > 1 ? 'Both' : filterObj.cirrhosis[0];
    let treatment = filterObj.treatment.length > 1 ? 'All' : filterObj.treatment[0];

    $('.waste-genotype').html(genotype);
    $('.waste-treatment').html(treatment);
    $('.waste-cirrhosis').html(cirrhosis);
}


let getCostForCard = (costVal) => {
    return commaSeperatedNumber(Math.round(costVal));
}

let getPercentForCards = (numerator, demoninator) => {
    let percent = 0;

    if (numerator == 0 || demoninator == 0) {
        percent = 0;
    } else {
        percent = (parseFloat((numerator / demoninator) * 100)).toFixed(1);
    }

    return percent + '%';
}

let appendCostInTooltip = (ele, value) => {

    let tooltipValue = '$' + getCostForCard(value);

    $(ele).tooltip({ contents: '<div></div>' });
    $(ele).tooltip('option', 'content', tooltipValue);
}

let renderHighBarChart = (container, data, key, label, lvalue) => {

    //  $('#threapy-'+key.toLowerCase()+'-N').html(commaSeperatedNumber(data.total));

    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }
    Highcharts.chart(container, {
        chart: {
            type: 'column',
            width: 950,
            hight: 600
        },
        colors: customColorsArray(),
        title: {
            text: '' //label
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: key
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'No of Patients(%)'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                }
            }
        },

        // tooltip: {
        //     formatter: function() {
        //         return `<span>${this.point.name}</span>: <b>${parseFloat(this.point.y).toFixed(1)}%</b>
        //                   <br/>Patient Count: ${commaSeperatedNumber(this.point.total)} | Cost: $ ${autoFormatCostValue(this.point.patientCost)}
        //                   <br/>Total Patients: ${commaSeperatedNumber(data.total)} | Cost: $ ${autoFormatCostValue(this.point.totalCost)}`;
        //     }
        // },

        tooltip: {
            formatter: function() {
                return `<span>${this.point.name}</span>: <b>${parseFloat(this.point.y).toFixed(1)}%</b>
                          <br/>Patient Count: ${commaSeperatedNumber(this.point.total)}
                          <br/>Total Patients: ${commaSeperatedNumber(data.total)} `;
            }
        },
        series: [{
            name: key,
            colorByPoint: true,
            data: data.data
        }]
    });
}

let fnNoDataFound = (container) => $(container).html('<div class="nodataFound">No Data Available</div>');

//function to get Abbr from Full Name
function getDrugAbbr(drugName) {
    let abbr = '',
        plusSeparated = drugName.split('+');

    for (let i = 0; i < plusSeparated.length; i++) {
        abbr += plusSeparated[i].trim().charAt(0);

        if (i != plusSeparated.length - 1) {
            abbr += ' + ';
        }
    }

    return abbr;
}


function renderNoPrescritionChartData(wasteChartData) {
    let data = wasteChartData.noPrescritionData;
    let container = 'waste-NoPrescriptionGenotypeDistributionChart';

    if (data.total == 0) {
        appendNoDataFoundSection(container);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            width: 450,
            height: 400,
        },
        colors: customColorsArray(),
        title: {
            text: '' //label
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Genotypes'
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        yAxis: {
            // min: 0, 
            // max: 100,
            title: {
                text: 'Patient Count'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    //  format: '{point.y:.1f}%'
                    formatter: function() {
                        return commaSeperatedNumber(this.point.y);
                    }
                }
            }
        },

        // tooltip: {
        //     formatter: function() {
        //         return `<span>${this.point.name}</span>: <b>${parseFloat(this.point.total).toFixed(1)}%</b>
        //                   <br/>Patient Count: ${commaSeperatedNumber(this.point.y)} | Cost: $ ${autoFormatCostValue(this.point.patientCost)}
        //                   <br/>Total Patients: ${commaSeperatedNumber(data.total)} | Cost: $ ${autoFormatCostValue(this.point.totalCost)}`;
        //     }
        // },

        tooltip: {
            formatter: function() {
                return `<span>${this.point.name}</span>: <b>${parseFloat(this.point.total).toFixed(1)}%</b>
                          <br/>Patient Count: ${commaSeperatedNumber(this.point.y)}
                          <br/>Total Patients: ${commaSeperatedNumber(data.total)}`;
            }
        },

        series: [{
            name: 'Genotypes',
            colorByPoint: true,
            data: data.data
        }]
    });

}

function renderNotFillingNextPrescriptionChart(wasteChartData) {
    let dataObj = wasteChartData.notFillingNextPrescriptionData;

    if (dataObj.data.length < 1) {
        appendNoDataFoundSection('waste-withoutPrescriptionRefillingChart');
        return;
    }

    /*let relapsedTreamentChart = new Highcharts.chart('waste-withoutPrescriptionRefillingChart', {
        chart: {
            type: 'pie',
            width: 450,
            height: 400,
            events: {
                drilldown: function (e) {
                    relapsedTreamentChart.subtitle.update({ text: 'Click back button to view prescription filling distribution' });
                },
                drillup: function (e) {
                    relapsedTreamentChart.subtitle.update({ text: 'Click the slices to view treatment distribution' });
                }
            }
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: 'Click the slices to view treatment distribution'
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y}'
                }
            }
        },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>{series.name}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Prescription Filling',
            colorByPoint: true,
            data: dataObj.data
        }],
        drilldown: {
            series: dataObj.drilldown,
            drillUpButton: getStyleForHighchartBackBtn()
        }
    }); */

    Highcharts.chart('waste-withoutPrescriptionRefillingChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400,
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Genotype'
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        yAxis: {
            title: {
                text: 'Patient Count'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    //  format: '{point.y:.1f}%'
                    formatter: function() {
                        return commaSeperatedNumber(this.point.y);
                    }
                }
            }
        },

        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>Genotype: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },

        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: dataObj.data
        }]
    });
}


//function to append no data found section for charts
let appendNoDataFoundSection = (container) => {
    let errMsg = `<div class="waste-noDataFoundSection">
                    <div class="waste-noDataFoundMsg">No data available for this section.</div>
                </div>`;

    $('#' + container).html(errMsg);
}

let renderCharts = (template) => {

    template.loading.set(true);
    let params = template.data;

    let isFromAnalytics = params.genotypes ? false : true;

    if (isFromAnalytics) {
        params = getCurrentPopulationFilters();
    }
    //Hard code the rebate discount value to 0 
    params.rebateDiscount = 0;

    //console.log("********* Preparing waste data at universe level *********");
    //let params = getCurrentPopulationFilters();
    Meteor.call('getWasteDataForPatients', params, (err, res) => {
        template.loading.set(false);
        if (!err) {
            let result = LZString.decompress(res);
            result = JSON.parse(result);
            wasteData = result.data;
            wasteDataAll = result;
            populateTheWasteDataSection(params, result, isFromAnalytics);

        }
    });
}


/**
 * @author: Pramveer
 * @date: 22nd May 17
 * @desc: Added common function to invoke the section data
 */
let populateTheWasteDataSection = (params, dataResult, isFromAnalytics) => {

    let wasteData = dataResult.data;
    setTimeout(() => {
        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });
        console.log(dataResult)
        appendFiltersOnWastePopup(params);
        // populateWasteQuestionsData(wasteData);
        populateWasteQuestionsData1(wasteData);

        //invokeChartsRender(result);

        //populateTherapyData(wasteData.wasteCategoriesData);
         populateTherapyData1(wasteData.categoriesData);
        //populateRegimenData(wasteData.wasteCategoriesData);
        populateRegimenData1(wasteData.categoriesData);
       // populateRetreatmentData(wasteData);
       populateRetreatmentData1(wasteData);
       // populateHcvRNAData(wasteData.wasteCategoriesData);
        populateHcvRNAData1(wasteData.categoriesData);
       // populateNotFillingNextPrescriptionData(wasteData);
       populateNotFillingNextPrescriptionData1(wasteData);

        // populateNoPrescriptionData(wasteData, dataResult.actualWaste);
         populateNoPrescriptionData1(wasteData, dataResult.actualWaste);
        //populateProviderSectionData(wasteData.wasteCategoriesData);
        //populateNonFdaCombosSection(wasteData.wasteCategoriesData);
        populateNonFdaCombosSection1(wasteData.categoriesData);
        // overAllTotalWasteCost(wasteData.wasteCategoriesData);
          overAllTotalWasteCost1(wasteData.categoriesData);

        //renderCharts 
        renderSVR12SectionsCharts(wasteData.wasteChartsData);
        renderRelapsedSectionCharts(wasteData.wasteChartsData);
        populateProviderSectionData(wasteData.wasteChartsData.providerCharts);
        renderHighBarChart('divRateFailure', wasteData.care.svr, 'Race', 'SVR12', 0);
        //renderRegimentsCharts(wasteData.wasteChartsData.regimentsSectionData);
        renderRegimentsCharts(dataResult.regiments, wasteData.wasteChartsData);
        renderTherapyDurationCharts(wasteData.wasteChartsData);
        renderRetreatedCharts(wasteData.wasteChartsData);
        // renderDiscontinuedCharts(wasteData.wasteChartsData);
        renderIncompleteTreatmentCharts(wasteData.wasteChartsData);
        renderTreatmentChangeCharts(wasteData.wasteChartsData);
        renderNonFdaCombinationCharts(wasteData.wasteChartsData);
        renderNoPrescritionChartData(wasteData.wasteChartsData);
        renderNotFillingNextPrescriptionChart(wasteData.wasteChartsData);
        renderNonHcvRnaCharts(wasteData.wasteChartsData);
        // hepatitis A and B
        renderHepatitisAChart(wasteData.wasteChartsData);
        renderHepatitisBChart(wasteData.wasteChartsData);



        appendProviderSection(wasteData.providers);


        if (!isFromAnalytics) {
            let totalPatients = wasteData.withMedication.patientCount + wasteData.withoutMedication.patientCount;
            // renderCostOppotunitySection(dataResult.costOpportunity, totalPatients);
            renderCostOppotunitySection(dataResult, totalPatients);

            renderLabAnalysisSections(dataResult.actualWaste.noPrescriptionObj);
        }
        renderClinicalCategoryChart(dataResult.actualWaste);

        //  wasteCategoryTableData(dataResult.actualWaste);

        //set patient count on the header
        if (isFromAnalytics) {
            // $('#js-wasteOverviewTab .ws-header').hide();
            // $('.wasteOppotunity-SectionWrapper .ws-header').hide();

            $('.js-wasteCostOpportuntiy').hide();

           // let dataObj = wasteData.wasteCategoriesData;

            let totalPatients = 0;

            // for (let keys in dataObj) {
            //     totalPatients += dataObj[keys].patientCount;
            // }
            totalPatients = wasteData.withMedication.patientCount + wasteData.withoutMedication.patientCount;

            $('.searchPatientCountHeader').html(totalPatients);
        }

    }, 100);

    setTimeout(() => {
        $('[data-toggle="popover"]').popover();
    }, 500);

}


/**
 * @author: Yuvraj Pal
 * @desc: this function will render Cost Opportuntiy Section.
 * @date: May, 23rd 2017
 */

let renderCostOppotunitySection = (dataObj, totalUniquePatients) => {

    // let medRecords = dataObj.medRecObj;
    // let nonMedRecords = dataObj.nonMedRecObj;
    let medRecords = dataObj.costOpportunity.medRecObj;
    let nonMedRecords = dataObj.costOpportunity.nonMedRecObj;

    let totalPatients = medRecords.patientCount + nonMedRecords.patientCount;

    // let medCost = medRecords.totalCost;
    // let medCost = dataObj.actualWaste.overlappingWasteCost;
    let uncuredCost = dataObj.actualWaste.uncuredCost;
    let missingSVR12Cost = dataObj.actualWaste.missingSVR12Cost;


    let nonMedCost = nonMedRecords.totalCost;

    let medCharts = medRecords.charts,
        nonMedCharts = nonMedRecords.charts;


    // Pateint With Medcation
    // append Count
    // append Cost

    $('#uniquePatientsForWaste').html(medRecords.patientCount);
    $('#uniquePatientsForWaste-percent').html(' - (' + getPercentForCards(medRecords.patientCount, totalPatients) + ')');
    // $('#uniquePatientsForWaste-Cost').html(getCostForCard(medCost));

    $('#uncuredWaste-Cost').html(getCostForCard(uncuredCost));
    $('#missingSVR12Waste-Cost').html(getCostForCard(missingSVR12Cost));


    // Create genotype Distribution Chart
    //renderGenotypeDistributionChart(medCharts.genotypeDistribution, 'waste-uniquePatientsForWasteGenotype');
    let bygenotypeDistribution = medCharts.genotypeDistribution.slice(0);
    bygenotypeDistribution.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    let bytreatmentDistribution = medCharts.treatmentDistribution.slice(0);
    bytreatmentDistribution.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    let bycirrhosisDistribution = medCharts.cirrhosisDistribution.slice(0);
    bycirrhosisDistribution.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    let bygenderDistribution = medCharts.genderDistribution.slice(0);
    bygenderDistribution.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    // Create genotype Distribution Chart
    //renderGenotypeDistributionChart(medCharts.genotypeDistribution, 'waste-uniquePatientsForWasteGenotype');
    renderCategoryChartsForCostOpportunity(bygenotypeDistribution, 'waste-uniquePatientsForWasteGenotype', 'genotype');
    renderCategoryChartsForCostOpportunity(bytreatmentDistribution, 'waste-uniquePatientsForWasteTreatment', 'treatment');
    renderCategoryChartsForCostOpportunity(bycirrhosisDistribution, 'waste-uniquePatientsForWasteCirrhosis', 'cirrhosis');
    renderCategoryChartsForCostOpportunity(bygenderDistribution, 'waste-uniquePatientsForWasteGender', 'gender');


    // patient without Medication
    // append Cost
    // append Cost
    $('#uniquePatientsWithNoPrescription').html(nonMedRecords.patientCount)
    $('#uniquePatientsWithNoPrescription-percent').html(' - (' + getPercentForCards(nonMedRecords.patientCount, totalPatients) + ')');
    //$('#uniquePatientsWithNoPrescription-Cost').html(getCostForCard(nonMedCost));
    let bygenotypeDistributionpres = nonMedCharts.genotypeDistribution.slice(0);
    bygenotypeDistributionpres.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    let bytreatmentDistributionpres = nonMedCharts.treatmentDistribution.slice(0);
    bytreatmentDistributionpres.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    let bycirrhosisDistributionpres = nonMedCharts.cirrhosisDistribution.slice(0);
    bycirrhosisDistributionpres.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    let bygenderDistributionpres = nonMedCharts.genderDistribution.slice(0);
    bygenderDistributionpres.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    bygenderDistributionpres.sort();
    // Create genotype Distribution Chart
    //renderGenotypeDistributionChart(nonMedCharts.genotypeDistribution, 'waste-nonPrescriptionForWasteGenotype');
    renderCategoryChartsForCostOpportunity(bygenotypeDistributionpres, 'waste-nonPrescriptionForWasteGenotype', 'genotype');
    renderCategoryChartsForCostOpportunity(bytreatmentDistributionpres, 'waste-nonPrescriptionForWasteTreatment', 'treatment');
    renderCategoryChartsForCostOpportunity(bycirrhosisDistributionpres, 'waste-nonPrescriptionForWasteCirrhosis', 'cirrhosis');
    renderCategoryChartsForCostOpportunity(bygenderDistributionpres, 'waste-nonPrescriptionForWasteGender', 'gender');

    $('#waste-costOpportunityTotalWastePatients').html(totalPatients);
    $('#waste-costOpportunityTotalPatients').html(totalUniquePatients);

}


let renderCategoryChartsForCostOpportunity = (wasteChartData, container, renderKey) => {
    if (wasteChartData.length == 0) {
        appendNoDataFoundSection(container);
        return;
    }

    let xAxislabel = '',
        tooltipName = '';

    if (renderKey == 'treatment') {
        xAxislabel = tooltipName = 'Treatment';
    } else if (renderKey == 'cirrhosis') {
        xAxislabel = tooltipName = 'Cirrhosis';
    } else if (renderKey == 'gender') {
        xAxislabel = tooltipName = 'Gender';
    } else {
        xAxislabel = 'Genotypes';
        tooltipName = 'Genotype';
    }


    Highcharts.chart(container, {
        chart: {
            type: 'column',
            width: 450,
            height: 400,
        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: xAxislabel
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        yAxis: {
            title: {
                text: 'Patient Count'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    //  format: '{point.y:.1f}%'
                    formatter: function() {
                        return commaSeperatedNumber(this.point.y);
                    }
                }
            }
        },

        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>${tooltipName}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>
                        <div>Cost: {point.cost}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },

        series: [{
            name: renderKey,
            colorByPoint: true,
            data: wasteChartData
        }]
    });
}

let appendProviderSection = (dataObj) => {
    let totalProviders = dataObj.providerCount,
        providerWOSvr12 = dataObj.noSvrData.providerCount

    $('.wastage-totalProviders').html(totalProviders);
    $('#universeProvidersWOSvr').html(providerWOSvr12);
    $('#providersWOSvr-percent').html(' - (' + getPercentForCards(providerWOSvr12, totalProviders) + ')');
}

let renderHepatitisAChart = (wasteChartData) => {

    let dataObj = wasteChartData.hepAGenotypeChart;

    //    console.log('dataObj',dataObj);

    // let dataObj = {};
    //     dataObj.data = [
    //         {name: '1a', y: 14 , drilldown: '1a_DrillDown'},
    //         {name: '1b', y: 20 , drilldown: '1b_DrillDown'},
    //         {name: '2', y: 50 , drilldown: '2_DrillDown'},
    //         {name: '3', y: 60 , drilldown: null},
    //         {name: '4', y: 80 , drilldown: null}
    //     ];

    //     dataObj.drilldown = [
    //         {
    //             name: 'Treatment Period',
    //             id: '1a_DrillDown',
    //             data: [
    //                 {name: '4', y: 70},
    //                 {name: '10', y: 60},
    //                 {name: '11', y: 24}
    //             ]
    //         },
    //         {
    //             name: 'Treatment Period',
    //             id: '1b_DrillDown',
    //             data: [
    //                 {name: '4', y: 80},
    //                 {name: '18', y: 90},
    //                 {name: '40', y: 54}
    //             ]
    //         },
    //         {
    //             name: 'Treatment Period',
    //             id: '2_DrillDown',
    //             data: [
    //                 {name: '4', y: 45},
    //                 {name: '18', y: 60},
    //                 {name: '50', y: 15}
    //             ]
    //         }
    //     ];

    let therapyDrillChart = new Highcharts.chart('waste-HepatitisAChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400,

        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {

        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Hepatitis A'
            }
        },
        yAxis: {
            title: {
                text: 'No of Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>{series.name}: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>{series.name}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: dataObj
        }],

    });
}

let renderHepatitisBChart = (wasteChartData) => {


    let dataObj = wasteChartData.hepBGenotypeChart;
    //    console.log('dataObj',wasteChartData.hepatitisBChart);
    // let dataObj = {};
    //     dataObj.data = [
    //         {name: '1a', y: 14 , drilldown: '1a_DrillDown'},
    //         {name: '1b', y: 20 , drilldown: '1b_DrillDown'},
    //         {name: '2', y: 50 , drilldown: '2_DrillDown'},
    //         {name: '3', y: 60 , drilldown: null},
    //         {name: '4', y: 80 , drilldown: null}
    //     ];

    //     dataObj.drilldown = [
    //         {
    //             name: 'Treatment Period',
    //             id: '1a_DrillDown',
    //             data: [
    //                 {name: '4', y: 70},
    //                 {name: '10', y: 60},
    //                 {name: '11', y: 24}
    //             ]
    //         },
    //         {
    //             name: 'Treatment Period',
    //             id: '1b_DrillDown',
    //             data: [
    //                 {name: '4', y: 80},
    //                 {name: '18', y: 90},
    //                 {name: '40', y: 54}
    //             ]
    //         },
    //         {
    //             name: 'Treatment Period',
    //             id: '2_DrillDown',
    //             data: [
    //                 {name: '4', y: 45},
    //                 {name: '18', y: 60},
    //                 {name: '50', y: 15}
    //             ]
    //         }
    //     ];

    let therapyDrillChart = new Highcharts.chart('waste-HepatitisBChart', {
        chart: {
            type: 'column',
            width: 450,
            height: 400,

        },
        colors: customColorsArray(),
        title: {
            text: ''
        },
        subtitle: {

        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Hepatitis B'
            }
        },
        yAxis: {
            title: {
                text: 'No of Patients'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y}'
                }
            }
        },
        // tooltip: {
        //     useHTML: true,
        //     followPointer: false,
        //     headerFormat: `<div>`,
        //     pointFormat: `<div>{series.name}: {point.name}</div>
        //                 <div>Patient Count: {point.y}</div>
        //                 <div>Cost: {point.cost}</div>`,
        //     footerFormat: `</div>`,
        //     hideDelay: 30
        // },
        tooltip: {
            useHTML: true,
            followPointer: false,
            headerFormat: `<div>`,
            pointFormat: `<div>{series.name}: {point.name}</div>
                        <div>Patient Count: {point.y}</div>`,
            footerFormat: `</div>`,
            hideDelay: 30
        },
        series: [{
            name: 'Genotype',
            colorByPoint: true,
            data: dataObj
        }],

    });
}

let getPatientsDetails = (params, patientIds) => {
    //if (patientIds) {

    //}
    params = getCurrentPopulationFilters();
    params.patientIds = patientIds;
    params.database = $('.treatedPatientwasteOpportunitySection .nav-tabs .active').attr('data') == 'client' ? 'PHS_HCV' : 'IMS_LRX_AmbEMR_Dataset';
    
    Meteor.call('getPatientsDetails', params, function(error, result) {
        if (error) {
            console.log('Error ');
        } else {
            let decompressed_object = LZString.decompress(result);
            result = JSON.parse(decompressed_object);
            //console.log(result);
            renderPatientData(result);
        }

    });
}

let getJSONInfoNameTotal = (data) => {
    let jsonData = {};
    jsonData['y'] = data.patientCount;
    jsonData['total'] = data.patientCount;
    jsonData['cost'] = data.totalCost;
    jsonData['patientIds'] = [];
    return jsonData;
}

let getJSONInfoNameData = (kdata, key) => {
    let json = {};
    let data = kdata['svrStatus'][key];
    json['y'] = data.cost;
    json['cost'] = data.cost;
    json['count'] = data.patientCount;
    json['total'] = kdata.patientCount;
    json['patientIds'] = data.patientIds;
    json['redirect'] = kdata.redirect;
    return json;
}

let renderClinicalCategoryChart = (wasteChartData) => {

    //  Highcharts.setOptions ({
    //     colors:[
    //         '#5a9bd4',
    //         '#faa75b',
    //         '#7ac36a',
    //         '#9e67ab',
    //         '#f15a60',
    //         '#ce7058',
    //         '#d77fb4'
    //     ]
    // });
    let data = wasteChartData; //{"patientCount":2149,"providerCount":194,"discontinued":{"patientCount":112,"providerCount":77,"totalCost":12138709,"svrStatus":{"missingSVR12":{"patientCount":91,"cost":10119667,"patientIds":[1007582811,1015117110,1018507407,1021270382,1022770660,1034818175,1040430472,1065116666,1068133201,1068508710,1070503573,1084147527,1086066740,1092323816,1098278704,1098977775,1108989779,1125137234,1131555954,1133400621,1162603652,1167711606,1174234756,1179570438,1191977928,1195167728,1209624363,1222642991,1231290185,1232600503,1241867394,1242318799,1258065202,1277720027,1302257088,1310041318,1322100879,1324396159,1351057484,1357072627,1364685860,1372749757,1376296967,1387044795,1391507121,1400139339,1416298314,1419788551,1419981561,1422864824,1436766485,1453239413,1455468782,1458085629,1461964883,1462037063,1479395808,1486114473,1500124796,1505854178,1507934830,1528229919,1537074179,1540680790,1559650141,1560954016,1579962016,1584924110,1592900223,1674335615,1701198490,1784231967,1786810615,1810268011,1818028216,1823679720,1826772270,1840865775,1857867162,1880945485,1882632298,1884631844,1897580918,1899843432,1902275036,1911460457,1938174100,1953578265,1961792185,1975470406,1983837580]},"cured":{"patientCount":18,"cost":1774441,"patientIds":[1014435870,1023237900,1040906100,1125137234,1231290185,1234166015,1247724993,1348728922,1429921716,1431579079,1617416748,1668349188,1705764634,1721639396,1872960991,1880273175,1941413671,1987948918]},"uncured":{"patientCount":5,"cost":244601,"patientIds":[1035785823,1177983291,1238427628,1649161799,1765602190]}}},"treatmentChange":{"patientCount":0,"providerCount":0,"totalCost":0,"svrStatus":{"missingSVR12":{"patientCount":0,"cost":0,"patientIds":[]},"cured":{"patientCount":0,"cost":0,"patientIds":[]},"uncured":{"patientCount":0,"cost":0,"patientIds":[]}}},"inappropriateRegiment":{"patientCount":69,"providerCount":59,"totalCost":5467777,"svrStatus":{"missingSVR12":{"patientCount":55,"cost":4721022,"patientIds":[1018507407,1022770660,1025140840,1051761403,1057979479,1063748044,1068133201,1085971823,1112726790,1133400621,1136380467,1149170658,1152797198,1166872776,1166909969,1167711606,1182675245,1191977928,1232910474,1241138243,1258842892,1264684518,1272228984,1282275441,1310041318,1316927198,1320872087,1338106811,1339018413,1374720451,1376296967,1397150466,1400139339,1419788551,1422864824,1436766485,1458414125,1505854178,1571069820,1602681110,1610651825,1711047701,1719639541,1721809460,1769725888,1804684026,1865562842,1899843432,1918833237,1922115772,1949258007,1980632140,1983837580,1986907500,1991540067]},"cured":{"patientCount":12,"cost":620421,"patientIds":[1103804675,1164778911,1174893900,1175462714,1418799313,1463568493,1505889856,1570040715,1629770831,1809355751,1872960991,1941413671]},"uncured":{"patientCount":2,"cost":126334,"patientIds":[1212112609,1238427628]}}},"inappropriateMedication":{"patientCount":36,"providerCount":33,"totalCost":643592,"svrStatus":{"missingSVR12":{"patientCount":27,"cost":388067,"patientIds":[1063748044,1137948745,1140433739,1282275441,1309780599,1327909536,1351057484,1416298314,1461964883,1500124796,1521042215,1560954016,1566741949,1572433916,1674335615,1717816706,1719639541,1726528304,1745584578,1819636705,1820491822,1846082234,1857867162,1884631844,1922115772,1980632140,1993325599]},"cured":{"patientCount":8,"cost":254925,"patientIds":[1083033912,1357069868,1462761542,1632452701,1762450411,1880273175,1961635222,1975968323]},"uncured":{"patientCount":1,"cost":600,"patientIds":[1177983291]}}},"nonFdaTherapyDuration":{"patientCount":197,"providerCount":130,"totalCost":20265779,"svrStatus":{"missingSVR12":{"patientCount":148,"cost":16348932,"patientIds":[1010308384,1019195488,1021270382,1025140840,1051761403,1057979479,1063748044,1085971823,1086066740,1098278704,1111741713,1112726790,1113072260,1122287007,1136380467,1137948745,1140433739,1144835136,1146087149,1149080430,1149170658,1149476423,1152797198,1159757785,1166015559,1166872776,1166909969,1170338571,1171314633,1179570438,1182675245,1195167728,1201317462,1213377056,1220723583,1223350411,1227653418,1230680703,1232600503,1232910474,1242318799,1255018991,1257867423,1264684518,1272228984,1276241222,1281679757,1282275441,1283223992,1306650563,1309701922,1309780599,1312878255,1316927198,1320872087,1324396159,1327909536,1332939836,1351057484,1352510636,1357072627,1372749757,1377980439,1387044795,1397150466,1400139339,1400686035,1407246969,1413025302,1419806068,1422864824,1430268551,1434049084,1436766485,1458849259,1461964883,1462696649,1479395808,1484102146,1486114473,1500124796,1512811848,1521042215,1540680790,1544340492,1562809992,1566741949,1572433916,1576689736,1582894010,1584924110,1587387638,1592900223,1602681110,1606893073,1621509789,1637053814,1644050446,1644230881,1646881209,1649161799,1649567086,1670943248,1674335615,1677715055,1696222291,1707549904,1711047701,1717816706,1719518717,1719639541,1726528304,1732383608,1745584578,1769725888,1794194319,1799796619,1810106262,1819512916,1819636705,1820491822,1831816157,1865562842,1868810396,1880945485,1884631844,1889603239,1897580918,1906051526,1918833237,1922115772,1926634184,1940207170,1948308778,1949258007,1953578265,1953995976,1961792185,1971115439,1975470406,1980632140,1981125488,1981326483,1983837580,1986677626,1993325599,1994656011,1999679560]},"cured":{"patientCount":45,"cost":3612095,"patientIds":[1046873470,1083033912,1098977775,1103804675,1147947059,1164778911,1174893900,1175462714,1274756599,1303649448,1345428197,1348728922,1357069868,1357072627,1369738752,1391388594,1418799313,1454494546,1462761542,1463568493,1493096065,1562809992,1624230786,1629770831,1632452701,1636846108,1637087419,1668349188,1673465669,1698154874,1704939943,1705764634,1747807788,1762450411,1813482204,1868052799,1872960991,1880273175,1900301625,1902881927,1928095753,1936195610,1945499941,1961635222,1975968323]},"uncured":{"patientCount":7,"cost":304752,"patientIds":[1155365091,1212112609,1238427628,1644523844,1713632360,1851281309,1975968323]}}},"relapsed":{"patientCount":4,"providerCount":4,"totalCost":340834,"svrStatus":{"missingSVR12":{"patientCount":0,"cost":0,"patientIds":[]},"cured":{"patientCount":2,"cost":327500,"patientIds":[1659821214,1955215963]},"uncured":{"patientCount":2,"cost":13334,"patientIds":[1035785823,1765602190]}}},"retreated":{"patientCount":9,"providerCount":9,"totalCost":1433671,"svrStatus":{"missingSVR12":{"patientCount":8,"cost":836002,"patientIds":[1007582811,1084147527,1125137234,1231290185,1234166015,1310041318,1429921716,1826772270]},"cured":{"patientCount":5,"cost":491002,"patientIds":[1014435870,1125137234,1231290185,1234166015,1429921716]},"uncured":{"patientCount":1,"cost":106667,"patientIds":[1007582811]}}}}
    let discontinued = data['discontinued'];
    let inappropriateMedication = data["inappropriateMedication"];
    let inappropriateRegiment = data["inappropriateRegiment"];
    let nonFdaTherapyDuration = data["nonFdaTherapyDuration"];
    let relapsed = data["relapsed"];
    let retreated = data["retreated"]
    let treatmentChange = data["treatmentChange"];
    let missingRNA = data["missingHCVRNA"];
    let missingPresRefill = data['missingPrescriptionRefill'];
    let categories = ['Missing HCV RNA', 'Incomplete Treatment', 'Non FDA Therapy Duration', 'Medication Combination', 'Inappropriate Regiment', 'Relapsed', 'Retreated', "Missing Prescription Refill"];

    let chartData = [
        // {
        //     name:'Total',
        //     grouping:false,
        //     color:'rgba(204,204,204,.5)',
        //     data:[

        //             getJSONInfoNameTotal(nonFdaTherapyDuration),
        //             getJSONInfoNameTotal(inappropriateMedication),
        //             getJSONInfoNameTotal(inappropriateRegiment),
        //             getJSONInfoNameTotal(relapsed),
        //             getJSONInfoNameTotal(retreated)
        //         ]
        // },
        {
            name: 'Cured',
            data: [
                getJSONInfoNameData(missingRNA, 'cured'),
                getJSONInfoNameData(discontinued, 'cured'),
                getJSONInfoNameData(nonFdaTherapyDuration, 'cured'),
                getJSONInfoNameData(inappropriateMedication, 'cured'),
                getJSONInfoNameData(inappropriateRegiment, 'cured'),
                getJSONInfoNameData(relapsed, 'cured'),
                getJSONInfoNameData(retreated, 'cured'),
                getJSONInfoNameData(missingPresRefill, 'cured')
            ]
        },
        {
            name: 'Detectable SVR Post Therapy',
            data: [
                getJSONInfoNameData(missingRNA, 'uncured'),
                getJSONInfoNameData(discontinued, 'uncured'),
                getJSONInfoNameData(nonFdaTherapyDuration, 'uncured'),
                getJSONInfoNameData(inappropriateMedication, 'uncured'),
                getJSONInfoNameData(inappropriateRegiment, 'uncured'),
                getJSONInfoNameData(relapsed, 'uncured'),
                getJSONInfoNameData(retreated, 'uncured'),
                getJSONInfoNameData(missingPresRefill, 'uncured')
            ]
        },
        {
            name: 'Missing SVR12',
            data: [
                getJSONInfoNameData(missingRNA, 'missingSVR12'),
                getJSONInfoNameData(discontinued, 'missingSVR12'),
                getJSONInfoNameData(nonFdaTherapyDuration, 'missingSVR12'),
                getJSONInfoNameData(inappropriateMedication, 'missingSVR12'),
                getJSONInfoNameData(inappropriateRegiment, 'missingSVR12'),
                getJSONInfoNameData(relapsed, 'missingSVR12'),
                getJSONInfoNameData(retreated, 'missingSVR12'),
                getJSONInfoNameData(missingPresRefill, 'missingSVR12')
            ]
        }
    ]

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'waste-clincalCategories',
            type: 'column',
            zoomType: 'xy',
        },
        title: {
            text: ''
        },

        credits: {
            enabled: false
        },
        tooltip: {
            headerFormat: '',
            pointFormat: `{point.series.name}<br/>
                                        Patient Count:{point.count:,0.0f}<br/>Total Patient Count:{point.total:,0.0f} <br/>Total Expense:$ {point.cost:,0.0f}<br/>`
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        if (this.series.name != 'Cured' && this.point.cost != 0)
                            return autoFormatCostValue(this.point.cost);
                        //return commaSeperatedNumber(this.point.count);
                    }
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            let clickData = this.redirect;
                            //perform cleck event only if it's required
                            if (clickData && clickData != '') {
                                //trigger the click event of the menu
                                $('.' + clickData).children('a').click();
                            } else {
                                return false;
                            }
                            //getPatientsDetails({},this.patientIds);
                        }
                    }
                }
            },
            series: {
                shadow: false,
                borderWidth: 0,
                pointPadding: 0
            },
        },
        xAxis: {
            categories: categories,
            lineColor: '#999',
            lineWidth: 1,
            tickColor: '#666',
            tickLength: 3,
            title: {
                text: 'Clincal Appropriateness Categories',
                style: {
                    color: '#333'
                }
            }
        },
        yAxis: {
            lineColor: '#999',
            lineWidth: 1,
            tickColor: '#666',
            tickWidth: 1,
            tickLength: 3,
            gridLineColor: '#ddd',
            title: {
                text: 'Cost($)',
                rotation: 270,
                margin: 10,
                style: {
                    color: '#333'
                }
            }
        },
        // series: [{
        //     name:'Total',
        //     groupPadding:.16,
        //     color:'rgba(204,204,204,.5)',
        //     grouping:true,
        //     data:[23,44,80,39,76]       
        // },{
        //     name:'Cured',
        //     data: [7,12,16,32,64]
        // },{
        //     name:'Not Cured',
        //     data: [16,32,64,7,12]
        // }]
        series: chartData
    });

    chart.series[0].hide();
}

let renderPatientData = (data) => {

    //$('.analyticsPatientsPopup').empty();

    //container for patient data
    let patientContentHtml = `<div class="analyticsCommonPopupPatientContent analyticsCommonPopupPatientContentWaste">`;
    patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader common-efd-row MainTitle" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRow common-efd-row" >PatientID</div>
                                    <div class="showInRowMin common-efd-row" >Gender</div>
                                    <div class="showInRowMin common-efd-row" >Genotype</div>
                                    <div class="showInRow common-efd-row" >Treatment</div>
                                    <div class="showInRow common-efd-row" >Ethnicity</div>
                                    <div class="showInRow common-efd-row" >Race</div>
                                </div>`;

    patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

    for (let i = 0; i < data.length; i++) {
        patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                                <div class="showInRow common-efd-row">${data[i].patientId}</div>
                                <div class="showInRowMin common-efd-row" >${data[i].gender}</div>
                                <div class="showInRowMin common-efd-row" >${data[i].genotype}</div>
                                <div class="showInRow common-efd-row" >${data[i].treatment}</div>
                                <div class="showInRow common-efd-row" >${data[i].ethnicity}</div>
                                <div class="showInRowMax common-efd-row" >${data[i].race}</div>
                                </div>`;

    }
    patientContentHtml += '</div>';

    $('.analyticsPatientsPopup-container').html(patientContentHtml);

    $('.analyticsPatientsPopup').show();
}

/**
 * @author: Pramveer
 * @date: 1st Jun 17
 * @desc: function to render lab analysis section
 */
let renderLabAnalysisSections = (labDataObj) => {
    let chartData = labDataObj.chartData;
    let totalLabsPats = 0,
        totalCost = 0;


    if (chartData.length < 1) {
        appendNoDataFoundSection('waste-labNameDistribution');
    } else {
        totalLabsPats = labDataObj.patientCount;
        totalCost = _.pluck(chartData, 'y').sum();

        $('#labCostUniquePatients').html(totalLabsPats);
        $('#labCostTotalCost').html(autoFormatCostValue(totalCost));
        $('#uniquePatientsWithNoPrescription-Cost').html(getCostForCard(totalCost));

        Highcharts.chart('waste-labNameDistribution', {
            chart: {
                type: 'column',
                width: 950,
                height: 400
            },
            colors: customColorsArray(),
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Labs'
                }
            },
            yAxis: {
                title: {
                    text: 'Labs Cost'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        //format:`$ {point.y:,0.0f}`,
                        formatter: function() {
                            if (this.y) {
                                //return '$' + autoFormatCostValue(this.y);
                                return this.point.count;
                            }
                        }
                    }
                }
            },
            tooltip: {
                useHTML: true,
                followPointer: false,
                headerFormat: `<div>`,
                pointFormat: `<div>Lab: {point.name}</div>
                                <div>Patient Count: {point.count:,0.0f}</div>
                                <div>Cost: {point.formatCost}</div>`,
                footerFormat: `</div>`,
                hideDelay: 30
            },

            series: [{
                name: 'Genotype',
                colorByPoint: true,
                data: chartData
            }],
        });
    }
}

let wasteCategoryTableData = (tableData) => {


    let tableHeader = ``;
    tableHeader = `<div class="common-efd-row MainTitle">
                        <div class="common-efd-cell1" style="width: 25%"><b>Waste Category</b></div>
                        <div class="common-efd-cell1" style="width: 25%"><b>Missing SVR12</b></div>
                        <div class="common-efd-cell1" style="width:25%"><b>Cured Data</b></div>
                        <div class="common-efd-cell1" style="width:25%"><b>Cured Data</b></div>
                  </div>`;
    // tableHeader = `<div class="common-efd-row MainTitle">
    //                     <div class="common-efd-cell1" style="width: 25%"><b>Waste Category</b></div>
    //                     <div class="common-efd-cell1" style="width: 25%"><b>Missing SVR12</b></div>
    //                     <div class="common-efd-cell1" style="width:50%"><b>Patients with SVR12 data</b>
    //                         <div style="width: 25% style="float:left;" ><b style="float:left; padding-left: 70px;" >Cured Data</b></div>
    //                         <div style="width: 25% style="float:right; padding-right: 110px; " ><b style="float:right; padding-right: 110px;" >Uncured Data</b></div>
    //                     </div>
    //               </div>`;
    let htmlRow = ``;
    for (let key in tableData) {
        if (key == 'patientCount' || key == 'providerCount' || key == 'noPrescriptionObj') {

        } else {
            htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1"  style="width: 25%">${toTitleCase(tableData[key].categoryName)}</div>
                        <div class="common-efd-cell1"  style="width: 25%">${tableData[key].svrStatus.missingSVR12.patientCount}</div>
                        <div class="common-efd-cell1" style="width: 25% ">${tableData[key].svrStatus.cured.patientCount}</div>
                        <div class="common-efd-cell1" style="width: 25% ">${tableData[key].svrStatus.uncured.patientCount}</div>
                    </div>`;
        }

    }
    //  for (let key in tableData) {
    //     if(key == 'patientCount' || key =='providerCount'){

    //     }else{
    //         htmlRow += `<div class="common-efd-row">
    //                     <div class="common-efd-cell1"  style="width: 25%">${key}</div>
    //                     <div class="common-efd-cell1"  style="width: 25%">${tableData[key].svrStatus.missingSVR12.patientCount}</div>
    //                     <div class="common-efd-cell1"  style="width: 50%">
    //                         <div class="common-efd-cell1" style="width: 25% float:left">${tableData[key].svrStatus.cured.patientCount}</div>
    //                         <div class="common-efd-cell1" style="width: 25% float:right">${tableData[key].svrStatus.uncured.patientCount}</div>
    //                     </div>
    //                 </div>`;
    //     }

    // }
    // htmlRow += `<div class="common-efd-row">
    //                    <div class="common-efd-cell1" style="width: 25%">11</div>
    //                     <div class="common-efd-cell1" style="width: 25%">11</div>
    //                     <div class="common-efd-cell1" style="width: 50%" >
    //                         <div class="common-efd-cell1" style="width: 25% float:left">11</div>
    //                         <div class="common-efd-cell1" style="width: 25% float:right">11</div>
    //                     </div>
    //                 </div>`;
    // for (let i = 0; i < tableData.length; i++) {
    //     let data = tableData[i];
    //     console.log(data);
    //     htmlRow += `<div class="common-efd-row">
    //                     <div class="common-efd-cell1"  style="width: 25%">${data}</div>
    //                     <div class="common-efd-cell1"  style="width: 25%">${data.missingSVR12.patientCount}</div>
    //                     <div class="common-efd-cell1"  style="width: 50%">
    //                         <div class="common-efd-cell1" style="width: 25% float:left">${data.cured.patientCount}</div>
    //                         <div class="common-efd-cell1" style="width: 25% float:right">${data.uncured.patientCount}</div>
    //                     </div>
    //                 </div>`;
    // }
    $('.wasteCategoryTable').html(tableHeader + htmlRow);

}


//function to populate waste data on universe section
let populateWasteQuestionsData1 = (data) => {

    // Added By Yuvraj - May 24th 2017 (We are sending the total patient count directly in a key from backend. We dont have to caculate it again.)
    // let wasteDataObj = data.wasteCategoriesData;
    let wasteDataObj = data.categoriesData;
    let patientsWithMedication = data.withMedication.patientCount;
    let patientsWithoutMedication = data.withoutMedication.patientCount;
    let overallUniquePatients = patientsWithMedication + patientsWithoutMedication;

    let overallTotalPatients = 0,
        overallTotalProviders = 0;

    let patientsWithSvrTest = 0,
        patientsWithoutSvrTest = 0,
        providersWithSvrTest = 0,
        providersWithoutSvrTest = 0,
        totalCurePatients = 0,
        totalUncuredPatients = 0,
        totalDiscontinuedPatients = 0,
        totalTreatmentChangePatients = 0;


    let relapsedPatientsWithSvr = 0,
        relapsedPatientsWithoutSvr = 0,
        relapsedPatientsWithTreatmentChange = 0,
        relapsedPatientsWithTreatmentCompleted = 0;

    let totalWithoutSvrTestCost = 0,
        totalDiscontinuedCost = 0,
        totalUncuredPatientsCost = 0,
        totalRelapsedWOSVRCost = 0,
        totalRelapsedWithSVRCost = 0,
        relapsedtreatmentChangeCost = 0,
        relapsedtreatmentCompleteCost = 0;

    let totalRelapsedPatients = 0,
        totalRelapsedPatientsCost = 0;


    let missingSVR12NoPrescription = 0;
    let missingHcvRnaNoPrescription = 0;
    let missingViralLoadNoPrescription = 0;


    let hepAToalPatients = 0,
        hepAVaccine = 0,
        hepBToalPatients = 0,
        hepBVaccine = 0;

    let noRefillPatients = 0;




    //let completedData = wasteDataObj.completed.innerData;
    let discontinueData = wasteDataObj.discontinued;
    let treatmentChangeData = wasteDataObj.treatmentChange;
    let relapsedData = wasteDataObj.relapsedData;
    let svrData = wasteDataObj.svrData;

    let NoSvr12NoPrescription = wasteDataObj.noMedicationNosvr12;
    let NoHcvRnaNoPrescription = wasteDataObj.nohcvRnaNoMedication;
    let NoViralLoadNoPrescription = wasteDataObj.noMedicationNoViralLoad;

    let hepABData = wasteDataObj.hepAB;

    //sum up overall total patients/providers
    overallTotalPatients += wasteDataObj.patientCount;
    overallTotalProviders += wasteDataObj.providerCount;


    missingSVR12NoPrescription += NoSvr12NoPrescription.patientCount;
    missingHcvRnaNoPrescription += NoHcvRnaNoPrescription.patientCount;
    missingViralLoadNoPrescription += NoViralLoadNoPrescription.patientCount;

    //sum up patient count
    // patientsWithSvrTest += completedData.patientsWithSVR.patientCount;
    //patientsWithoutSvrTest += completedData.patientsWithoutSVR.patientCount;
    patientsWithoutSvrTest += svrData.patientsWithoutSVR.patientCount;

    //sum up provider count
    // providersWithSvrTest += completedData.patientsWithSVR.providerCount;
    // providersWithoutSvrTest += completedData.patientsWithoutSVR.providerCount;

    //sum up cured/uncured patients
    // totalCurePatients += completedData.patientsWithSVR.cureStatus.cured.patientCount;
    // totalUncuredPatients += completedData.patientsWithSVR.cureStatus.unCured.patientCount;

    //relapsed patients Data calculations
    relapsedPatientsWithSvr += relapsedData.innerData.patientsWithSVR.patientCount; //use
    relapsedPatientsWithoutSvr += relapsedData.innerData.patientsWithoutSVR.patientCount; //use

    relapsedPatientsWithTreatmentChange += relapsedData.innerData.changedTreatment.patientCount; //use
    relapsedPatientsWithTreatmentCompleted += relapsedData.innerData.completedTreatment.patientCount; //use
    totalRelapsedPatients += relapsedData.patientCount;

    //sum up the cot for the sections
    // totalWithoutSvrTestCost += completedData.patientsWithoutSVR.totalCost;
    totalWithoutSvrTestCost += svrData.patientsWithoutSVR.totalCost;

    //sum up the total discontinued patients
    totalDiscontinuedPatients += discontinueData.patientCount;
    // totalDiscontinuedPatients += wasteDataObj[keys].hcvNotFillingNextPrescription.patientCount;
    noRefillPatients += wasteDataObj.hcvNotFillingNextPrescription.patientCount;

    //sum up the total treatment change patients
    totalTreatmentChangePatients += treatmentChangeData.patientCount


    // sum HEP A And HEP B Patients;
    hepAToalPatients += hepABData.HEP_A_TOTAL_PATIENT;
    hepAVaccine += hepABData.HEP_A_VACCINE;
    hepBToalPatients += hepABData.HEP_B_TOTAL_PATIENT;
    hepBVaccine += hepABData.HEP_B_VACCINE;


    // //cost data sum up
    // totalDiscontinuedCost += discontinueData.totalCost;
    // totalUncuredPatientsCost += completedData.patientsWithSVR.cureStatus.unCured.totalCost;
    // totalRelapsedWOSVRCost += relapsedData.innerData.patientsWithoutSVR.totalCost;
    // totalRelapsedWithSVRCost += relapsedData.innerData.patientsWithSVR.totalCost;
    // relapsedtreatmentChangeCost += relapsedData.innerData.changedTreatment.totalCost;
    // relapsedtreatmentCompleteCost += relapsedData.innerData.completedTreatment.totalCost;
    // totalRelapsedPatientsCost += relapsedData.totalCost;


    //append the total patients 
    $('.wastage-totalPatients').html(patientsWithMedication + patientsWithoutMedication);
    $('.wastage-totalPatientsWithMedication').html(patientsWithMedication);
    //$('.wastage-totalProviders').html(overallTotalProviders);

    //append the values on the UI
    $('.totalPatientsWithoutSvr12').html(patientsWithoutSvrTest); 
    // $('#universeProvidersWOSvr').html(providersWithoutSvrTest);
    // $('#universeTotalUncuredPatients').html(totalUncuredPatients);
    $('#discontinued-totalPatients').html(totalDiscontinuedPatients + noRefillPatients);
    // $('.wastage-totalDiscontinuedPatients').html(totalDiscontinuedPatients + noRefillPatients);

    //let totalcostrelapsedforOverview = totalRelapsedWOSVRCost + totalRelapsedWithSVRCost + relapsedtreatmentChangeCost + relapsedtreatmentCompleteCost;
    // let totalPatientsOverview = totalRelapsedPatients+relapsedPatientsWithTreatmentChange + relapsedPatientsWithoutSvr + relapsedPatientsWithSvr;

    let totalPatientsOverview = relapsedPatientsWithTreatmentCompleted + relapsedPatientsWithTreatmentChange + relapsedPatientsWithoutSvr + relapsedPatientsWithSvr;

    //append relapsed data on the UI
    $('#relapsed-WithoutSVR').html(relapsedPatientsWithoutSvr);
    $('#relapsed-WithSVR').html(relapsedPatientsWithSvr);
    $('#relapsed-treatmentChange').html(relapsedPatientsWithTreatmentChange);
    $('#relapsed-treatmentCompleted').html(relapsedPatientsWithTreatmentCompleted);
    $('#totalRelapsedPatients').html(totalPatientsOverview);
    $('#totalRelapsedPatients').html(totalRelapsedPatients);
    $('.totalRelapsedPatients').html(totalRelapsedPatients);
    // $('.totalPatientsWithSvr12').html(patientsWithSvrTest);

    //append cost data on the UI

    // $('#discontinued-totalCost').html(autoFormatCostValue(totalDiscontinuedCost));
    // appendCostInTooltip('#discontinued-totalCost', totalDiscontinuedCost);

    // $('.totalWithoutSvrTestCost').html(autoFormatCostValue(totalWithoutSvrTestCost));
    // appendCostInTooltip('.totalWithoutSvrTestCost', totalWithoutSvrTestCost);


    // $('#totalRelapsedPatientsCost').html(autoFormatCostValue(totalcostrelapsedforOverview));
    // appendCostInTooltip('#totalRelapsedPatientsCost', totalcostrelapsedforOverview);

    // $('#totalUncuredPatientsCost').html(getCostForCard(totalUncuredPatientsCost));
   // $('#totalProvidersWOSvrCost').html(getCostForCard(totalWithoutSvrTestCost));
   //$('#totalProvidersWOSvrCostPatient').html(getCostForCard(totalWithoutSvrTestCost));
   // $('#totalRelapsedWOSVRCost').html(getCostForCard(totalRelapsedWOSVRCost));
    //$('#totalRelapsedWithSVRCost').html(getCostForCard(totalRelapsedWithSVRCost));
    //$('#relapsedtreatmentChangeCost').html(getCostForCard(relapsedtreatmentChangeCost));
    //$('#relapsedtreatmentCompleteCost').html(getCostForCard(relapsedtreatmentCompleteCost));



    //percentage binding
    //$('#discontinued-percent').html(' - (' + getPercentForCards(totalDiscontinuedPatients, overallTotalPatients) + ')');
    $('#discontinued-percent').html(' - (' + getPercentForCards(totalDiscontinuedPatients + noRefillPatients, overallTotalPatients) + ')');

    $('.universePatientsWOSvr-percent').html(' - (' + getPercentForCards(patientsWithoutSvrTest, overallTotalPatients) + ')');
    $('#totalRelapsed-percent').html(' - (' + getPercentForCards(totalPatientsOverview, overallTotalPatients) + ')');
    // $('#retreated-totalPercent').html(' - (0%)');

    // $('#relapsed-WithoutSVRPercent').html(' - (' + getPercentForCards(relapsedPatientsWithoutSvr, totalRelapsedPatients) + ')');
    $('#relapsed-WithoutSVRPercent').html(' - (' + getPercentForCards(relapsedPatientsWithoutSvr, patientsWithMedication) + ')');
    // $('#relapsed-WithSVRPercent').html(' - (' + getPercentForCards(relapsedPatientsWithSvr, totalRelapsedPatients) + ')');
    $('#relapsed-WithSVRPercent').html(' - (' + getPercentForCards(relapsedPatientsWithSvr, patientsWithMedication) + ')');
    // $('#relapsed-treatmentChangePercent').html(' - (' + getPercentForCards(relapsedPatientsWithTreatmentChange, totalRelapsedPatients) + ')');
    $('#relapsed-treatmentChangePercent').html(' - (' + getPercentForCards(relapsedPatientsWithTreatmentChange, patientsWithMedication) + ')');
    // $('#relapsed-treatmentCompletedPercent').html(' - (' + getPercentForCards(relapsedPatientsWithTreatmentCompleted, totalRelapsedPatients) + ')');
    $('#relapsed-treatmentCompletedPercent').html(' - (' + getPercentForCards(relapsedPatientsWithTreatmentCompleted, patientsWithMedication) + ')');

    // $('#universeTotalUncuredPercent').html(' - (' + getPercentForCards(totalUncuredPatients, patientsWithSvrTest) + ')');
    //$('#providersWOSvr-percent').html(' - (' + getPercentForCards(providersWithoutSvrTest, overallTotalProviders) + ')');

    // $('#patientsWithDiscontinuedTreatment').html(totalDiscontinuedPatients);
    // $('#patientsWithDiscontinuedTreatment-Cost').html(getCostForCard(totalDiscontinuedCost));
    // $('#patientsWithDiscontinuedTreatment-percent').html(' - (' + getPercentForCards(totalDiscontinuedPatients, overallTotalPatients) + ')');


    $('#patientsWithIncompleteTreatment').html(totalDiscontinuedPatients);
   // $('#patientsWithIncompleteTreatment-Cost').html(getCostForCard(totalDiscontinuedCost));
    $('#patientsWithIncompleteTreatment-percent').html(' - (' + getPercentForCards(totalDiscontinuedPatients, overallTotalPatients) + ')');


    $('#patientsWithTreatmentChange').html(totalTreatmentChangePatients);
    // $('#patientsWithTreatmentChange-Cost').html(getCostForCard(totalDiscontinuedCost));
    $('#patientsWithTreatmentChange-percent').html(' - (' + getPercentForCards(totalTreatmentChangePatients, overallTotalPatients) + ')');



    $('#patientsWithNoSVR12Treatment').html(patientsWithoutSvrTest);
    //$('#patientsWithNoSVR12Treatment-Cost').html(getCostForCard(totalWithoutSvrTestCost));
    $('#patientsWithNoSVR12Treatment-percent').html(' - (' + getPercentForCards(patientsWithoutSvrTest, overallTotalPatients) + ')');


    $('#patientsWithNoSVR12AndNoTreatment').html(missingSVR12NoPrescription);
    $('#patientsWithNoSVR12AndNoTreatment-percent').html(' - (' + getPercentForCards(missingSVR12NoPrescription, overallUniquePatients) + ')');

    $('#patientsWithNullRNAAndNoMedication').html(missingHcvRnaNoPrescription);
    $('#patientsWithNullRNAAndNoMedication-percent').html(' - (' + getPercentForCards(missingHcvRnaNoPrescription, overallUniquePatients) + ')');

    $('#patientsWithNoPrescriptionNoViralLoad').html(missingViralLoadNoPrescription);
    $('#patientsWithNoPrescriptionNoViralLoad-percent').html(' - (' + getPercentForCards(missingViralLoadNoPrescription, overallUniquePatients) + ')');

    // Appen Hep A and Hep B Data.
    $('#hepATotalPatients').html(hepAToalPatients);
    $('#hepBTotalPatients').html(hepBToalPatients);
    $('#hepATotalPatients-percent').html(' - (' + getPercentForCards(hepAToalPatients, overallUniquePatients) + ')');
    $('#hepBTotalPatients-percent').html(' - (' + getPercentForCards(hepBToalPatients, overallUniquePatients) + ')');

    $('#uniquePatientsWithHepAVaccine').html(hepAVaccine);
    $('#uniquePatientsWithHepAVaccine-percent').html(' - (' + getPercentForCards(hepAVaccine, hepAToalPatients) + ')');

    $('#uniquePatientsWithHepBVaccine').html(hepBVaccine);
    $('#uniquePatientsWithHepBVaccine-percent').html(' - (' + getPercentForCards(hepBVaccine, hepBToalPatients) + ')');


}



let checkTabsWastePayerTb = () =>{
    let activeTab = $('.treatedPatientwasteOpportunitySection .nav-tabs .active').attr('data');
    if(activeTab == 'client'){
        $('.clinical-appropriatenessb').removeClass('disabled');
        $('.clinical-appropriatenessc').addClass('disabled');
    }
    else{
        $('.clinical-appropriatenessc').removeClass('disabled');
        $('.clinical-appropriatenessb').addClass('disabled');
    }
}