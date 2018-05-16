import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './PatientsJourney.html';
import * as pharmaLib from '../pharmaLib.js';

let pharmaPatientsJourney = [];
let pharmaData = [];
let dummyMedication = [];
let chartMedication = [];
let allMedicationData = [];
// Nisha 02/20/2017 Change in functions for common cohor
Template.PatientsJourney.onCreated(function() {

    // Distinct Medications Available
    if (!DistinctMedicationCombinations.length) {
        DistinctMedicationCombinations = new MysqlSubscription('DistinctMedicationCombinations');
    }


    //set header of pharma
    // pharmaLib.setPharmaHeader();

    Template.PatientsJourney.executePatientsJourneyRender();
});

Template.PatientsJourney.rendered = function() {
    //hide the show patients list icon
    $('.globalshowPatientPharma').hide();
    highLightTab('Pharma');
    // Initialize Multiselect Dropdown http://www.erichynds.com/blog/jquery-ui-multiselect-widget
    // initializeDropdown();

    // pharmaLib.setAdvancedSearchFilters();

    //set header of pharma
    // pharmaLib.setPharmaHeader();

}

Template.PatientsJourney.helpers({
    // 'getGenotypeList': function() {
    //     //list genotype
    //     return PatientsGenotypeList;
    // },
    'getMedication': function() {
        //new code
        //    allMedicationData = Session.get('allMedicationData');
        // "DistinctMedicationCombinations" is the publication defined in patients API folder.
        allMedicationData = DistinctMedicationCombinations.reactive();
        Session.set('allMedicationData', allMedicationData);

        if (allMedicationData && allMedicationData.length > 0) {
            let ReturnMedicineData = [];
            for (let i = 0; i < allMedicationData.length; i++) {

                let color = ['#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99', '#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99'];

                let MedicineData = {};
                MedicineData['medicinename'] = allMedicationData[i].MEDICATION;
                MedicineData['color'] = color[i];

                ReturnMedicineData.push(MedicineData);
            }
            return ReturnMedicineData;
        }
    },
    // 'getMedicineColors': function() {
    //     var medicinecolors = ['#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99'];
    //     return medicinecolors;

    // }

});

Template.PatientsJourney.events({

    'click .treatedApplyUniFiltersPJ': function(e, template, data) {

        pharmaLib.showChartLoading();
        handleGoButton();
        //set header data
        pharmaLib.setPharmaHeaderTabData();



    },

    'click .treatedApplyUniFiltersClear': function(e) {
        chartMedication = [];

        $("#divWeekResponse input[type=radio]").each(function() {
            $(this).prop('checked', false);
        });
    },

    // 'click .medicinelist': function(e) {
    //     pharmaLib.showChartLoading();

    //     var medications = $("#pharma_te_medications").multiselect("getChecked").map(function(){
    //         return this.value;
    //     }).get();

    //     renderPatientsJourneyChart(medications);
    //     pharmaLib.hideChartLoading();
    // },
    'change #divWeekResponse .radioduration': function(e) {
        pharmaLib.showChartLoading();

        // var medications = $("#pharma_te_medications").multiselect("getChecked").map(function () {
        //     return this.value;
        // }).get();

        params = {};
        //Praveen 02/20/2017 changed function to reference from common.js pharmaLib.getCurrentPopulationFilters()
        params = getCurrentPopulationFilters();
        var medications = [];
        medications = params != undefined ? params.medication : {};;
        if (params == undefined || params.medication == undefined || params.medication.length == 0) {
            let medication = []; //DistinctMedicationCombinations;
            for (let i = 0; i < DistinctMedicationCombinations.length; i++) {
                medication.push(DistinctMedicationCombinations[i]['MEDICATION']);
            }
            medications = medication;
        }
        if (medications.length) {
            chartMedication = medications;
            // renderTreatmentEfficacyChart(chartMedication, pharmaPatientsJourney, "pharma_patientsjourney");
            // renderTreatmentEfficacyChart(chartMedication, pharmaPatientsJourney, "pharma_SvrPatientCount", true);

            const wrapperContainer = "#treatmentEfficacyViralLoadSyncCharts";
            const containerForPatients = "pharma_SvrPatientCount";
            const containerForViralLoad = "pharma_patientsjourney";

            const totalCountContainer = ".totalTreatmentEfficacyPatietnsPerDrug";
            const radioButtonContainer = "#divWeekResponse";

            renderSyncTreatmentEfficacyChart(chartMedication, pharmaPatientsJourney, wrapperContainer, containerForViralLoad, containerForPatients, totalCountContainer, radioButtonContainer);


            // Find Unique patients and Update the patient count in the header.
            var uniquepatients = _.pluck(pharmaPatientsJourney, 'IDW_PATIENT_ID_SYNTH');
            // OLD CODE
            //$('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
            //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
            setCohortPatientCount({ patientCount: _.uniq(uniquepatients).length });
        } else {
            $('#pharma_patientsjourney').html('<div class="providerNoDataFound">Please Select Medications</div>');
        }

        pharmaLib.hideChartLoading();
    },

    'click .js-comparativeEngine': function(e) {
        // comparativeEngineTest();

        renderComaparativeOptionsView();
    },


});

//fetch data from server
Template.PatientsJourney.executePatientsJourneyRender = (flag) => {

    params = {};
    let medication = '';
    if (Pinscriptive.Filters) {
        pharmaLib.showChartLoading();
        params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
        // console.log('params.medication');
        // console.log(params.medication);
        // We dont want to be dependent on the selected medication.
        // if (params.medication.length > 0) {
        //     medication = params.medication[0];
        // }
        // params.medication = '';
    }


    Meteor.call('getPatientsJourneyData', params, function(error1, results) {
        if (error1) {
            pharmaLib.hideChartLoading();
        } else {
            pharmaLib.setAdvancedSearchFilters();
            pharmaLib.setPharmaHeader();
            // pharmaPatientsJourney = results.PatientsJourney;
            pharmaPatientsJourney = JSON.parse(results);
            // let dataPJ = pharmaPatientsJourney.filter((rec)=>Math.log(rec.ViralLoad) != 0 && parseInt(rec.ViralLoad) != 0);
            // pharmaPatientsJourney = dataPJ;

            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });

            //modified PATIENT_ID_SYNTH to IDW_PATIENT_ID_SYNTH
            var uniquepatients = _.pluck(pharmaPatientsJourney, 'PATIENT_ID_SYNTH');
            //set patient count on tooltip for viral load
            $('#ViralLoadPatientCount').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
            //medication filter
            // let medicationfilteredData = filterDataByMedication(pharmaPatientsJourney, medication);
            // renderUndetectedSVRchartsDuringTreatment(medicationfilteredData);
            // renderUndetectedSVRchartsAfterTreatment(medicationfilteredData);
            let d = JSON.parse(results);
            renderUndetectedSVRchartsDuringTreatment(d);
            renderUndetectedSVRchartsAfterTreatment(d);

            if (params == undefined || params.medication == undefined || params.medication.length == 0) {
                let medication = []; //DistinctMedicationCombinations;
                for (let i = 0; i < DistinctMedicationCombinations.length; i++) {
                    medication.push(DistinctMedicationCombinations[i]['MEDICATION']);
                }
                const wrapperContainer = "#treatmentEfficacyViralLoadSyncCharts";
                const containerForPatients = "pharma_SvrPatientCount";
                const containerForViralLoad = "pharma_patientsjourney";

                const totalCountContainer = ".totalTreatmentEfficacyPatietnsPerDrug";
                const radioButtonContainer = "#divWeekResponse";

                renderSyncTreatmentEfficacyChart(medication, pharmaPatientsJourney, wrapperContainer, containerForViralLoad, containerForPatients, totalCountContainer, radioButtonContainer);

            }
            if (params.medication && params.medication.length > 0) {
                // renderTreatmentEfficacyChart(params.medication, pharmaPatientsJourney, "pharma_patientsjourney");
                // renderTreatmentEfficacyChart(params.medication, pharmaPatientsJourney, "pharma_SvrPatientCount", true);
                const wrapperContainer = "#treatmentEfficacyViralLoadSyncCharts";
                const containerForPatients = "pharma_SvrPatientCount";
                const containerForViralLoad = "pharma_patientsjourney";

                const totalCountContainer = ".totalTreatmentEfficacyPatietnsPerDrug";
                const radioButtonContainer = "#divWeekResponse";

                renderSyncTreatmentEfficacyChart(params.medication, pharmaPatientsJourney, wrapperContainer, containerForViralLoad, containerForPatients, totalCountContainer, radioButtonContainer);

            }

            // OLD CODE
            //$('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
            //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
            setCohortPatientCount({ patientCount: _.uniq(uniquepatients).length });
            pharmaLib.hideChartLoading();
            //Template.PatientsJourney.__helpers.get('getMedication').call();
            // setTimeout(function() {

            //     if (flag) {
            //         handleGoButton();
            //     } else {
            //         initializeDropdown();
            //     }
            // }, 100);
        }
    });

}

//filter for medication
let filterDataByMedication = (baseData, medication) => {
    //console.log(medication);
    if (medication && medication == '') {
        return baseData;
    }
    let filteredData = baseData.filter((d) => d.MEDICATION != null && d.MEDICATION.toLowerCase().indexOf(medication.toLowerCase()) > -1);
    return filteredData;
}

//prepare data for charts
let renderUndetectedSVRchartsDuringTreatment = (baseData) => {
    let chartData = [];
    let data = filterDataUndetectedDuringTreatment(baseData);
    //console.log('----',data)
    let grpByMedication = _.groupBy(data, 'MEDICATION');
    let categories = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24', '24-28', '28+']; //Object.keys(prepareweeksGroupDuringTreatment(data));
    //console.log(categories);
    for (let key in grpByMedication) {
        let json = {};
        json['name'] = key;

        let weekData = [];
        let keyData = grpByMedication[key];
        json['data'] = getLengthOfArrayWeeks(keyData);
        chartData.push(json);
    }

    $('#UndetectedDuringCount').html(commaSeperatedNumber(data.length));

    console.log(chartData);
    renderUndetcedSVRDuringTreatment('pharmaTreatmentSVRUnDetected', chartData, categories);
}

//prepare data for charts
let renderUndetectedSVRchartsAfterTreatment = (baseData) => {
    let chartData = [];
    let data = filterDataUndetectedAfterTreatment(baseData);
    // console.log('----',data)
    let grpByMedication = _.groupBy(data, 'MEDICATION');
    let categories = ['0-4', '8-12', '16-20', '24-28', '32-36', '40-44', '48-52']; //'48-52','56-60','64-68'];//Object.keys(prepareweeksGroupDuringTreatment(data));
    //console.log(categories);
    for (let key in grpByMedication) {
        let json = {};
        json['name'] = key;
        let keyData = grpByMedication[key];
        json['data'] = getLengthOfArrayWeeksAfter(keyData);
        chartData.push(json);
    }
    // console.log(chartData,data);
    $('#UndetectedAfterCount').html(commaSeperatedNumber(data.length));
    renderUndetcedSVRDuringTreatment('pharmaTreatmentSVRUnDetectedAfter', chartData, categories);
}

//Edited By:Praveen 02/27/2017 function to plot group chart based on medication
let renderUndetcedSVRDuringTreatment = (container, chartData, categories) => {

    /**
     * @author: Pramveer
     * @date: 28th Feb 17
     * @desc: Added check for No data found.
     */
    if (chartData.length < 1) {
        $('#' + container).html('<div class="providerNoDataFound" style="font-weight:bold;">No Data Available</div>');
        return;
    }

    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: categories,
            crosshair: true,
            title: {
                text: 'Treatment Period (in Weeks)'
            }
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Patient Count (%)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><br/>',
            pointFormat: '{series.name} : ({point.y:,.2f} %)<br>Patient Count : {point.count:,.0f} <br>Total Count : {point.totalcount:,.0f}',
            footerFormat: '',
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        if (this.y != 0) {
                            return commaSeperatedNumber(this.y.toFixed(2)) + '%';
                        }
                    },
                }
            },
        },
        series: chartData
    });
}

let prepareweeksGroupDuringTreatment = (baseData) => {
    let WeeksRange = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24', '24-28', '28+'];
    let weekGrpData = _.groupBy(baseData, function(rec) {
        if (rec.TREATMENT_PERIOD >= 0 && rec.TREATMENT_PERIOD <= 4)
            return '0-4';
        else if (rec.TREATMENT_PERIOD >= 4 && rec.TREATMENT_PERIOD <= 8)
            return '4-8';
        else if (rec.TREATMENT_PERIOD >= 8 && rec.TREATMENT_PERIOD <= 12)
            return '8-12';
        else if (rec.TREATMENT_PERIOD >= 12 && rec.TREATMENT_PERIOD <= 16)
            return '12-16';
        else if (rec.TREATMENT_PERIOD >= 16 && rec.TREATMENT_PERIOD <= 20)
            return '16-20';
        else if (rec.TREATMENT_PERIOD >= 20 && rec.TREATMENT_PERIOD <= 24)
            return '20-24';
        else if (rec.TREATMENT_PERIOD >= 24 && rec.TREATMENT_PERIOD <= 28)
            return '24-28';
        else if (rec.TREATMENT_PERIOD >= 28)
            return '28+';
    });
    //console.log(weekGrpData);
    return weekGrpData;
}

let getLengthOfArrayWeeks = (baseData) => {

    let data = [0, 0, 0, 0, 0, 0, 0, 0];
    data[0] = baseData.filter((rec) => (rec.TREATMENT_PERIOD >= 0 && rec.TREATMENT_PERIOD <= 4)).length;
    data[1] = baseData.filter((rec) => (rec.TREATMENT_PERIOD >= 4 && rec.TREATMENT_PERIOD <= 8)).length;
    data[2] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 8 && rec.TREATMENT_PERIOD <= 12).length;
    data[3] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 12 && rec.TREATMENT_PERIOD <= 16).length;
    data[4] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 16 && rec.TREATMENT_PERIOD <= 20).length;
    data[5] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 20 && rec.TREATMENT_PERIOD <= 24).length;
    data[6] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 24 && rec.TREATMENT_PERIOD <= 28).length;
    data[7] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 28).length;

    let actualArray = [];
    let total = data.sum();
    for (let i = 0; i < data.length && total > 0; i++) {
        let json = {};
        json['y'] = (data[i] / total) * 100;
        json['count'] = data[i];
        json['totalcount'] = total;
        actualArray.push(json);
    }
    return actualArray;

    //return data;

}

let getLengthOfArrayWeeksAfter = (baseData) => {

    let data = [0, 0, 0, 0, 0, 0, 0];
    data[0] = baseData.filter((rec) => (rec.TREATMENT_PERIOD >= 0 && rec.TREATMENT_PERIOD <= 4)).length;
    data[1] = baseData.filter((rec) => (rec.TREATMENT_PERIOD >= 8 && rec.TREATMENT_PERIOD <= 12)).length;
    data[2] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 16 && rec.TREATMENT_PERIOD <= 20).length;
    data[3] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 24 && rec.TREATMENT_PERIOD <= 28).length;
    data[4] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 32 && rec.TREATMENT_PERIOD <= 36).length;
    data[5] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 40 && rec.TREATMENT_PERIOD <= 44).length;
    data[6] = baseData.filter((rec) => rec.TREATMENT_PERIOD >= 48 && rec.TREATMENT_PERIOD <= 52).length;

    let actualArray = [];
    let total = data.sum();
    for (let i = 0; i < data.length && total > 0; i++) {
        let json = {};
        json['y'] = (data[i] / total) * 100;
        json['count'] = data[i];
        json['totalcount'] = total;
        actualArray.push(json);
    }
    return actualArray;

}

// let prepareweeksGroup = (baseData) =>{
//     let weekGrpData =  _.groupBy(baseData, function(rec) {
//         if (rec.Weeks >= 0 && rec.Weeks <= 4)
//             return '0-4';
//         else if (rec.Weeks >= 8 && rec.Weeks <= 12)
//             return '8-12';
//         else if (rec.Weeks >= 16 && rec.Weeks <= 20)
//             return '16-20';
//         else if (rec.Weeks >= 24 && rec.Weeks <= 28)
//             return '24-28';
//         else if (rec.Weeks >= 32 && rec.Weeks <= 36)
//             return '32-36';
//         else if (rec.Weeks >= 40)
//             return '40+';
//     });

//     return weekGrpData;
// }
//prepare data for Undetected SVR during treatment
let filterDataUndetectedDuringTreatment = (baseData) => {
    let patientGrpData = _.groupBy(baseData, 'PATIENT_ID_SYNTH'); //group data based on patient id
    let RelapsedData = [];

    for (let patientid in patientGrpData) {
        let paData = patientGrpData[patientid];
        let flag = false;
        let startDate = paData[0]['STRT_DATE'];
        let endDate = paData[paData.length - 1]['END_DATE'];

        for (let index = 1; index < paData.length; index++) {
            //console.log(paData[index].Perfed_Dt,startDate,endDate);
            if (paData[index].END_DATE > startDate) {
                let viraload = parseInt(paData[index]['ViralLoad']);
                //console.log(viraload,startDate,endDate);
                if (viraload == 0 && (paData[index].STRT_DATE <= endDate)) {
                    RelapsedData.push(paData[index]);
                    //break;
                }
            }
        }
    };
    return RelapsedData;
}

//prepare data for Undetected SVR during treatment
let filterDataUndetectedAfterTreatment = (baseData) => {
    let patientGrpData = _.groupBy(baseData, 'PATIENT_ID_SYNTH'); //group data based on patient id
    let RelapsedData = [];

    let TempData = []
    for (let patientid in patientGrpData) {
        let paData = patientGrpData[patientid];
        let flag = false;
        let endDateAfter = paData[0]['END_DATE'];
        let StartDateAfter = paData[paData.length - 1]['STRT_DATE'];
        //TempData = [];
        for (let index = 1; index < paData.length; index++) {
            //console.log(paData[index].Perfed_Dt,startDate,endDate);
            if (paData[index].STRT_DATE > paData[index - 1].END_DATE) {
                let viraload = parseInt(paData[index]['ViralLoad']);
                //console.log(viraload,startDate,endDate);
                if (viraload == 0 && (paData[index - 1].END_DATE <= paData[index].STRT_DATE)) {
                    RelapsedData.push(paData[index]);
                    //break;
                }
            }
        }
    };
    //   if(TempData.length>0){
    //       RelapsedData.push(TempData[0]);
    //   }
    return RelapsedData;
}

// // Initializing the Multiselect Dropdown
// let initializeDropdown = () => {
//     $("#pharma_te_medications").multiselect({
//         selectedText: "# of # selected",
//         checkAllText: "Select All",
//         multiple: true,
//         uncheckAllText: "Unselect All",
//         classes: "te_selectMedication",
//         minWidth: 250,
//         noneSelectedText: "Select...",
//     });
// }

// Tnis Function will handle what needs to be done when "GO" button is clicked.
let handleGoButton = () => {
    // var medicine = $("#pharma_te_medications").multiselect("getChecked").map(function() {
    //     return this.value;
    // }).get();
    // chartMedication = [];
    // chartMedication = medicine;

    params = {};
    //Praveen 02/20/2017 changed function to reference from common.js pharmaLib.getCurrentPopulationFilters()
    params = getCurrentPopulationFilters();
    var chartMedication = [];
    chartMedication = params != undefined ? params.medication : {};

    if (params == undefined || params.medication == undefined || params.medication.length == 0) {
        let medication = []; //DistinctMedicationCombinations;
        for (let i = 0; i < DistinctMedicationCombinations.length; i++) {
            medication.push(DistinctMedicationCombinations[i]['MEDICATION']);
        }
        chartMedication = medication;
    }
    if (!chartMedication.length) {
        $('.totalTreatmentEfficacyPatietnsPerDrug').html("0");
        $('#pharma_SvrPatientCount').empty();
        $('#pharma_patientsjourney').html('<div class="providerNoDataFound">Please Select Medications</div>');
    } else {
        if (pharmaPatientsJourney.length) {
            // renderPatientsJourneyChart(medicine,pharmaPatientsJourney, "pharma_patientsjourney");
            // renderTreatmentEfficacyChart(chartMedication, pharmaPatientsJourney, "pharma_patientsjourney");
            // renderTreatmentEfficacyChart(chartMedication, pharmaPatientsJourney, "pharma_SvrPatientCount", true);

            const wrapperContainer = "#treatmentEfficacyViralLoadSyncCharts";
            const containerForPatients = "pharma_SvrPatientCount";
            const containerForViralLoad = "pharma_patientsjourney";

            const totalCountContainer = ".totalTreatmentEfficacyPatietnsPerDrug";
            const radioButtonContainer = "#divWeekResponse";

            renderSyncTreatmentEfficacyChart(chartMedication, pharmaPatientsJourney, wrapperContainer, containerForViralLoad, containerForPatients, totalCountContainer, radioButtonContainer);


            // Find Unique patients and Update the patient count in the header.
            var uniquepatients = _.pluck(pharmaPatientsJourney, 'IDW_PATIENT_ID_SYNTH');
            // OLD CODE
            //$('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
            //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
            setCohortPatientCount({ patientCount: _.uniq(uniquepatients).length });
        } else {
            Template.PatientsJourney.executePatientsJourneyRender(true);
        }

    }
    pharmaLib.hideChartLoading();
}

// Render the PatientsJourney SVR Trend chart  -- NOT IN USE
function renderPatientsJourneyChart(medicine) {
    // Clear the container in which we have to render the chart.
    $("#pharma_patientsjourney").empty();

    // get Patients data with Viral Load results
    let dataPJ = pharmaPatientsJourney;

    // Find Unique patients and Update the patient count in the header.
    var uniquepatients = _.pluck(pharmaPatientsJourney, 'IDW_PATIENT_ID_SYNTH');

    // OLD CODE
    //$('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
    //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
    setCohortPatientCount({ patientCount: _.uniq(uniquepatients).length });

    // find Max Week and Min Week -  This will be use full in Looping over the data.
    let maxWeeks = _.max(dataPJ, function(dataPJT) {
        return parseInt(dataPJT.Weeks);
    });
    let minWeeks = _.min(dataPJ, function(dataPJT) {
        return parseInt(dataPJT.Weeks);
    });
    let maxvalue = maxWeeks.Weeks;
    let minvalue = minWeeks.Weeks;

    // Group Data by Medications
    let groupedData = _.groupBy(dataPJ, 'MEDICATION');

    // Filter data based on selected range of weeks.
    let dataForSelectedWeeks = filterDataOnSelectedWeeks(dataPJ, maxvalue);
    let plotBands = dataForSelectedWeeks.plotBands;
    dataPJ = dataForSelectedWeeks.data;

    // By Default if No radio button is selected, Select ALL
    if (!plotBands.length) {
        $("#divWeekResponse input[type=radio][value='all']").prop('checked', true);
    }

    // this variable will give us Total Unique Patients that will be used to plot the Chart.
    let totalPatientsWithViralLoadData = [];

    let ymaxvalue = 0;

    let xMaxValueCurr = 0;
    let xMaxValue = 0;

    let totalPatientsPerDrug = 0;

    //  this Arary will contain final cahrt data for all selected Medications
    let seriesy = [];

    // "chartMedication" is the global variable that we update every time when filter is changed or Medication Dropdown is Changed
    if (chartMedication.length > 0) {

        for (let i = 0; i < chartMedication.length; i++) {
            let drugToBeFiltered = chartMedication[i];
            // this variable will be used to keep Chart Data per Medication.
            let jsonObj = {};
            // this variable will be used to get data for a particular Medication
            let filteredcount = [];

            let dataweekcount = [];

            for (let week = parseInt(minvalue); week <= parseInt(maxvalue); week++) {
                let total = 0;

                // Filtering the data based on Medication.
                filteredcount = dataPJ.filter(function(a) {
                    // return (a.MEDICATION.toLowerCase().indexOf(drugToBeFiltered.toLowerCase()) > -1 && a.Weeks == week);
                    return (a.MEDICATION.toLowerCase() == drugToBeFiltered.toLowerCase() && a.Weeks == week);
                });

                // total Patients who have viral load data is available for particular drug and week.-  not Unique
                let patientcount = _.pluck(filteredcount, 'PATIENT_ID_SYNTH');
                // pushing all the patients in an array. - This will be  used to get the unique patients in the end.
                totalPatientsWithViralLoadData.push(patientcount);

                // total number of unique patients who have viral load data is available for particular drug and week.
                patientcount = _.uniq(patientcount).length;

                // calculate sum of Viral Load values for the particular drug and week
                for (let j = 0; j < filteredcount.length; j++) {
                    total = total + parseFloat(filteredcount[j].ViralLoad);
                }

                let valt = 0.0;
                // find Average of Viral Load values for the particular drug and week and Converting viral load value into LOG format.
                if (filteredcount.length > 0 && total > 0) {
                    valt = Math.log(parseFloat(total / filteredcount.length));
                    if (valt < 0) {
                        valt = 0.0;
                    }
                }

                // push the Average viral load value and unique patients for the particular drug and week into an array.
                //  this array will be used for creating the data for the Chart.
                dataweekcount.push({
                    y: valt,
                    patientcount: patientcount
                });

                // total in for all data points -  Not Unique. two data points may have some patients in common.
                // This variable is not being used anyywhere right now.
                totalPatientsPerDrug += patientcount;

                if (ymaxvalue < valt)
                    ymaxvalue = valt;
            } //  Closing of the loop for the all weeks of Viral Load for a particular Medication

            var color = ['#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99',
                '#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99'
            ];

            // Final data object for a particular Medication
            jsonObj['name'] = chartMedication[i];
            jsonObj['data'] = dataweekcount;
            jsonObj['color'] = color[i];

            // Push into Final Array for the Chart Data.
            seriesy.push(jsonObj);

        }
        // Flattern the array that have patient id of all the patients where Viral load is available.
        totalPatientsWithViralLoadData = _.flatten(totalPatientsWithViralLoadData);

        // Finding Unique Total Number of Patients.
        totalPatientsWithViralLoadData = _.uniq(totalPatientsWithViralLoadData).length;

        // Update Patient Count for selected Medications
        $('.totalTreatmentEfficacyPatietnsPerDrug').html(commaSeperatedNumber(totalPatientsWithViralLoadData));

        // data for x axis categories
        let categoriesx = [];
        for (let week = parseInt(minvalue); week <= parseInt(maxvalue); week++) {
            categoriesx.push(week);
        }

        // Check if data is not available for selected Medications.
        let NoDataFlag = true;
        for (let i = 0; i < seriesy.length; i++) {
            if (seriesy[i].data.length != 0) {
                NoDataFlag = false;
            }
        }


        if (NoDataFlag) {
            // Show No Data Found instd of Empty Chart.
            $('#pharma_patientsjourney').html('<div class="providerNoDataFound">No Data Available</div>');

        } else {
            // Render High Chart.
            //MOdified 02/27/2017 Added colors
            Highcharts.chart('pharma_patientsjourney', {
                chart: {
                    zoomType: 'xy',
                    height: 400,
                    width: 1200
                },
                title: {
                    text: ' '

                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    categories: categoriesx,
                    title: {
                        text: 'Weeks'
                    },
                    plotBands: plotBands
                },
                colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
                plotOptions: {
                    series: {
                        events: {
                            legendItemClick: function() {
                                var visibility = this.visible ? 'visible' : 'hidden';
                            }
                        }
                    },
                    line: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return Highcharts.numberFormat(this.y, 2) > 0 ? Highcharts.numberFormat(this.y, 2) : '';
                            }
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    max: (ymaxvalue + 5),
                    // tickInterval: 1000,
                    title: {
                        text: 'Viral Load (in log)'
                    },
                    // labels: {
                    //     enabled: false,
                    //     format: yAxisData == '{value}'
                    // },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                // tooltip: {
                //     valueSuffix: '°C'
                // },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    borderWidth: 0
                },

                series: seriesy,
                tooltip: {
                    formatter: function() {
                        var s = '<b> Week: </b>' + this.x;

                        $.each(this.points, function() {
                            s += '<br/><b>' + this.series.name + ': </b>' +
                                this.y.toFixed(2);
                            s += '<br/><b>Patient Count: </b>' +
                                this.point.patientcount;
                        });

                        return s;
                    },
                    shared: true
                }
            });
        }


    }
}

// Get Filtered data and PlotBands -- NOT IN USE
let filterDataOnSelectedWeeks = (dataPJ, maxvalue) => {

    let plotBands = [];

    // this function will filter data based on selected weeks on the ui.
    if (!($("#divWeekResponse input[type=radio]:checked").val() == 'all' || $("#divWeekResponse input[type=radio]:checked").val() == undefined)) {

        plotBands.push({
            from: 0,
            to: 8,
            color: '#EFFFFF',
            label: {
                text: 'Baseline',
                style: {
                    color: '#999999'
                },
                y: 20
            }
        });

        let range = 0;
        range = $("#divWeekResponse input[type=radio]:checked").val() == undefined ? 0 : $("#divWeekResponse input[type=radio]:checked").val();

        if (range != 0) {
            let rangefrom = range.split('-')[0];
            let rangeto = range.split('-')[1];
            let from = 0,
                to = 0;

            dataPJ = dataPJ.filter(function(a) {
                return (parseInt(a.TREATMENT_PERIOD) >= parseInt(rangefrom) && parseInt(a.TREATMENT_PERIOD) <= parseInt(rangeto));
            });

            // console.log(dataPJ);
            from = 8;
            to = parseInt(rangeto) + 8;

            plotBands.push({
                from: from,
                to: to,
                color: '#FFFFEF',
                label: {
                    text: 'Treatment Period',
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            });

            from = parseInt(rangeto) + 8;
            to = parseInt(maxvalue) + 8;

            plotBands.push({
                from: from,
                to: to,
                color: '#FFEFFF',
                label: {
                    text: 'Follow-Up',
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            });

        } else {

            from = 8;
            to = 16;

            plotBands.push({
                from: from,
                to: to,
                color: '#FFFFEF',
                label: {
                    text: 'Treatment Period',
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            });

            from = 16;
            to = parseInt(maxvalue) + 8;

            plotBands.push({
                from: from,
                to: to,
                color: '#FFEFFF',
                label: {
                    text: 'Follow-Up',
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            });
        }
    } // end of if condition for 'all' check


    return {
        data: dataPJ,
        plotBands: plotBands
    }
}





// Additional Supporting Functions

// funciton to get the filtered data
// function getCurrentPopulationFilters() {
//     let filters = Pinscriptive.Filters,
//         othersFilters = {
//             age: filters.age || [],
//             alcohol: getArrFromFormattedStr(filters.alcohol),
//             apri: filters.apri || [],
//             chemistry: getArrFromFormattedStr(filters.chemistry),
//             ethinicity: getArrFromFormattedStr(filters.ethinicity),
//             etoh: filters.etoh || [],
//             fibroscan: getArrFromFormattedStr(filters.fibroscan),
//             fibrosure: getArrFromFormattedStr(filters.fibrosure),
//             hcc: getArrFromFormattedStr(filters.hcc),
//             hiv: getArrFromFormattedStr(filters.hiv),
//             liverBiopsy: getArrFromFormattedStr(filters.liverBiopsy),
//             liverAssesment: getArrFromFormattedStr(filters.liver_assesment),
//             meld: filters.meld || [],
//             mentalHealth: getArrFromFormattedStr(filters.mental_health),
//             renalFailure: getArrFromFormattedStr(filters.renal_failure),
//             viralLoad: filters.viralLoad || [],
//             weight: filters.weight || []
//         };
//
//     let filterObj = {
//         //string values to array
//         genotypes: getArrFromFormattedStr(filters.genotypes),
//         cirrhosis: getArrFromFormattedStr(filters.cirrhosis),
//         treatment: getArrFromFormattedStr(filters.treatment),
//         planType: getArrFromFormattedStr(filters.insurance),
//         othersFilters: othersFilters
//     }
//
//     // console.log("************Filter Object****************");
//     // console.log(filterObj);
//
//     return filterObj;
// }

// function to get array from string
function getArrFromFormattedStr(str) {
    return str ? str.replace(/['"]+/g, '').split(',') : [];
}


// let setGenotypeComboForCurrentPatient = () => {
//     //selecting genotype of current patient
//     // console.log('setGenotypeComboForCurrentPatient');
//
//     let genotypes = Session.get('pharmaGenotype');
//     // console.log(genotypes);
//     if (genotypes && genotypes.length > 0) {
//         setTimeout(() => {
//             if ($('.isCheckedallPJ').prop('checked')) {
//                 $('#treatedselectGenotypePJ .mutliSelect li input[value = "all"]').trigger('click');
//             }
//             $('.multiSel').empty();
//             $('.isChecked').prop('checked', false);
//             $('.isChecked').each(function(d) {
//                 if (genotypes.indexOf($(this).val()) > -1) {
//                     $(this).trigger('click');
//                 }
//             });
//         }, 200);
//     } else {
//         if (!$('.isCheckedallPJ').prop('checked'))
//             $('#treatedselectGenotypePJ .mutliSelect li input[value = "all"]').trigger('click');
//     }
// }

// function handleMultiGenoCombo(ele) {
//     var className = $(ele).closest('.genotypeSelect').parent().parent().attr('id'); // Selecting the id of the container.
//
//     var title = title_html = $(ele).val(); //$(ele).closest('.mutliSelect').find('input[type="checkbox"]').val();
//
//     var selectedLength = $('#' + className + ' .multiSel').children().length;
//
//     title_html = $(ele).val() + ',';
//
//     //chekc if selected value is all
//     if (title.toLowerCase() === 'all') {
//         //loop for all the genotypes
//         $('#' + className + ' .mutliSelect').find('input').each(function(index) {
//             if ($(ele).is(':checked')) {
//                 //if all is selected disable all other values except ALL
//                 if (index) {
//                     $(this).attr('disabled', true);
//                     $(this).prop('checked', false);
//                 }
//             } else {
//                 //Enable all values when all is diselected
//                 $(this).attr('disabled', false);
//                 $(this).prop('checked', false);
//             }
//         });
//
//         //append all in value area if is selected
//         if ($(ele).is(':checked')) {
//             var html = '<span title="All">All</span>';
//             $('#' + className + ' .multiSel').empty();
//             $('#' + className + ' .multiSel').append(html);
//             // $('#'+className +' .multiSel').show();
//             // $('#'+className + ' .hida').hide();
//         }
//         //remove all from value area if is unselected
//         else {
//             $('#' + className + ' span[title="All"]').remove();
//             // $('#'+className + ' .hida').show();
//             // $('#'+className +' .multiSel').hide();
//         }
//         return;
//     }
//
//     //append the value in value area if is selected
//     if ($(ele).is(':checked')) {
//         var html = '<span title="' + title + '">' + title_html + '</span>';
//         $('#' + className + ' .multiSel').append(html);
//         // $('#'+className + ' .hida').hide();
//         // $('#'+className +' .multiSel').show();
//     }
//     //remove the value from value area if is unselected
//     else {
//         $('#' + className + ' span[title="' + title + '"]').remove();
//         var ret = $('.' + className + ' .hida');
//         $('#' + className + ' .dropdown dt a').append(ret);
//         if (selectedLength == 1) {
//             // $('#'+className + ' .hida').show();
//             // $('#'+className +' .multiSel').hide();
//         }
//     }
// }
//
// function loadingDropdown() {
//
//     // $('#pharma-medicationDO').selectize();
//
//     //events for multiselect combo
//     $(".dropdown dt a").on('click', function() {
//         $(".dropdown dd ul").slideToggle('fast');
//     });
//
//     $(".dropdown dd ul li a").on('click', function() {
//         $(".dropdown dd ul").hide();
//     });
//
//     $(document).bind('click', function(e) {
//         var $clicked = $(e.target);
//         if (!$clicked.parents().hasClass("dropdown"))
//             $(".dropdown dd ul").hide();
//     });
//
//     $('.mutliSelect input[type="checkbox"]').on('click', function(e) {
//         handleMultiGenoCombo(e.target);
//     });
//
// }

// function getGenotypeFromFiltters() {
//     let genotypes = [];
//     pharmaLib.getGenotypeFromFiltters('treatedselectGenotypePJ')
//         //get text data from mutlisselect combo
//     $('#treatedselectGenotypePJ .multiSel').children().each(function(index) {
//         let genotype = $(this).html().trim() && $(this).html().trim() != 'ALL' ? $(this).html().trim().replace(',', '') : '';
//         genotypes.push(genotype);
//     });
//     //remove last comma and change the genotype to array
//     //genotypes = genotypes[0] == ',' ? genotypes.substring(1, genotypes.length) : genotypes;
//     //genotypes = genotypes.split(',');
//     return genotypes;
// }













// comapative Engine

function comparativeEngineTest() {
    var comparativeEngine = new ComparativeEngine({
        tabName: "TreatmentEfficacyTab-Pharma"
    });

    comparativeEngine.testMethod();
}

let renderComaparativeOptionsView = () => {
    var comparativeEngine = new ComparativeEngine({
        tabName: "TreatmentEfficacyTab-Pharma"
    });

    comparativeEngine.renderCompareOptiosView();
}