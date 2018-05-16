import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './svrtrendml.html';

import * as mlSubTabsUtil from '../modelUtils.js';


let analyticsPatientsJourney = [];
let TherapyData = [];
let chartMedication = [];
let allMedicationData = [];
let medicationProfile = '';
Pinscriptive.TreatmentEfficacy = {};

Template.svrtrendml.onCreated(function() {
    // Distinct Medications Available
    if (!DistinctMedicationCombinations.length) {
        DistinctMedicationCombinations = new MysqlSubscription('DistinctMedicationCombinations');
    }


    var self = this;
    this.loading = new ReactiveVar(true);
    this.noData = new ReactiveVar(false);
    $(".globalexportPatient1").hide();
    $(".globalshowPatient1").hide();
    $('.headerbuttonFilesection').hide();
    let params = getCurrentPopulationFilters();
    executeTreamentEfficacyData(params, self);
});

Template.svrtrendml.destroyed = function() {
    $(".globalexportPatient1").show();
    $(".globalshowPatient1").show();
}
Template.svrtrendml.rendered = function() {
    // initializeDropdown();
}

Template.svrtrendml.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    },
    'getMedication': function() {

        // "DistinctMedicationCombinations" is the publication defined in patients API folder.
        allMedicationData = DistinctMedicationCombinations.reactive();

        if (allMedicationData.length > 0) {
            let ReturnMedicineData = [];
            for (i = 0; i < allMedicationData.length; i++) {
                let MedicineData = {};
                // let color = '';
                let color = ['#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99', '#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99'];

                MedicineData['medicinename'] = allMedicationData[i].MEDICATION;
                MedicineData['color'] = color[i];

                ReturnMedicineData.push(MedicineData);
            }
            return ReturnMedicineData;
        }
    },
});

Template.svrtrendml.events({
    'click .treatedApplyUniFiltersPJ': function(e, template, data) {

        if (data && data == 'refresh') {
            template.loading.set(true);
            template.noData.set(false);
            let params = getCurrentPopulationFilters();
            // Modified By Yuvraj 14th Feb 17 -  Removed Go button. No need foe extra flag.
            // executeTreamentEfficacyData(params, template, true);
            executeTreamentEfficacyData(params, template);
        } else {
            // medicationProfile = $('#pharma-medicationPJ').selectize();
            // initializeDropdown();
            handleGoButton();
        }

    },
    'click .treatedApplyUniFiltersClear': function(e) {
        chartMedication = [];

        $("#divWeekResponse input[type=radio]").each(function() {
            $(this).prop('checked', false);
        });
    },
    'click .medicinelist': function(e) {
        // var medications = $("#example").multiselect("getChecked").map(function() {
        //     return this.value;
        // }).get();

        /**
         * Yuvraj 14th Feb 17 -  Removed Drug Dropdown and added dependancy on main medication filters.
         */
        let params = {};
        params = getCurrentPopulationFilters();
        var medications = [];
        medications = params != undefined ? params.medicationArray : {};;
        if (params == undefined || params.medicationArray == undefined || params.medicationArray.length == 0) {
            let medication = []; //DistinctMedicationCombinations;
            for (let i = 0; i < DistinctMedicationCombinations.length; i++) {
                medication.push(DistinctMedicationCombinations[i]['MEDICATION']);
            }
            medications = medication;
        }

        drawSvrTrendChart(medications);
    },
    'change .radioduration': function(e) {
        // var medications = $("#example").multiselect("getChecked").map(function() {
        //     return this.value;
        // }).get();

        /**
         * Yuvraj 14th Feb 17 -  Removed Drug Dropdown and added dependancy on main medication filters.
         */
        let params = {};
        params = getCurrentPopulationFilters();
        var medications = [];
        medications = params != undefined ? params.medicationArray : {};;
        if (params == undefined || params.medicationArray == undefined || params.medicationArray.length == 0) {
            let medication = []; //DistinctMedicationCombinations;
            for (let i = 0; i < DistinctMedicationCombinations.length; i++) {
                medication.push(DistinctMedicationCombinations[i]['MEDICATION']);
            }
            medications = medication;
        }

        drawSvrTrendChart(medications);
    },
    'click .viral_load_over_time_title': (e) => {
        if ($('.viral_load_over_time_opition').width() == 0)
            openNav();
        else {
            closeNav();
        }
    },
    'click .globalshowPatienttreatmentefficacy': (event, template) => {
        $('.treatmentEfficacyPList-listMask').hide();
        $('.treatmentEfficacyPList').show();
    },
    'click .globalexportPatienttreatmentefficacy': (event) => {
        mlSubTabsUtil.exportPatientsData(event.currentTarget, 'treatmentEfficacy', analyticsPatientsJourney);
    },
    'click .close.mlTabs_closebtn': function(e) {
        $('.analyticsPatientsPopup').hide();
    },
    'click .togglechart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        let primaryData = [];
        let secondaryData = [];
        let baseOrigData = Pinscriptive.TreatmentEfficacy.realData;
        let baseCompData = Pinscriptive.TreatmentEfficacy.compData;
        let baseOrigDataQA = Pinscriptive.TreatmentEfficacy.realDataQA;
        let baseCompDataQA = Pinscriptive.TreatmentEfficacy.compDataQA;
        if (value == 'viraloadbefore') {
            primaryData = baseOrigDataQA.pharmaAnalysisData;
            secondaryData = baseCompDataQA.pharmaAnalysisData;
        } else if (value == 'viraloadafter') {
            primaryData = baseOrigDataQA.pharmaAnalysisData;
            secondaryData = baseCompDataQA.pharmaAnalysisData;
        }
        //basedon current database
        //if current data is customer specific no need tto swtich variable else we need tto switch variable primaryData,secondaryData
        //by default customer data is selected then method value is true
        // console.log(primaryData);
        // console.log(secondaryData);
        if (isCustomerDataset()) {
            plotComparisionDataCharts(value, primaryData, secondaryData, desc);
        } else {
            plotComparisionDataCharts(value, secondaryData, primaryData, desc);
        }
    }

});

let executeTreamentEfficacyData = (params, tempateObj) => {

    params.medication = '';
    Meteor.call('getTreatmentEfficacyDataAnalytics', params, function(error, result) {
        if (error) {
            tempateObj.loading.set(false);
            tempateObj.noData.set(true);
            Pinscriptive.TreatmentEfficacy.realData = null;
        } else {
            analyticsPatientsJourney = JSON.parse(result);
            var uniquepatients = _.uniq(_.pluck(analyticsPatientsJourney, 'PATIENT_ID_SYNTH')).length;
            // console.log(uniquepatients);
            //Praveen 02/20/2017 commmon cohort
            // setCohortPatientCount({ patientCount: _.uniq(uniquepatients).length });
            //meteor call to fetch viral score data from server
            Pinscriptive.TreatmentEfficacy.realData = analyticsPatientsJourney;
            Meteor.call('getTreatmentEfficacyViralScoreAnalysisData', params, function(error1, result1) {

                if (error1) {
                    tempateObj.loading.set(false);
                    tempateObj.noData.set(true);
                    Pinscriptive.TreatmentEfficacy.realDataQA = null;
                } else {
                    Template.svrtrendml.__helpers.get('getMedication').call();
                    //console.log(result);
                    tempateObj.loading.set(false);
                    tempateObj.noData.set(false);
                    setTimeout(function() {
                        initializeDropdown();
                        handleGoButton();
                        var PerN = 0;
                        // DEcompression form Viral Score Analysis Data (Yuvraj - Compression is not done on the the server side yet.)
                        // var decompressed_object_result = LZString.decompress(result1);
                        // var resulting_object_result = JSON.parse(decompressed_object_result);
                        let resulting_object_result = JSON.parse(result1);
                        DrawViralScoreCharts(resulting_object_result.pharmaAnalysisData);

                        $("#unique-VL-N").text(commaSeperatedNumber(uniquepatients));
                        $("#unique-VL-TotalN").text(commaSeperatedNumber(resulting_object_result.pharmaAnalysisData.BaseDataCount));
                        PerN = (uniquepatients / resulting_object_result.pharmaAnalysisData.BaseDataCount) * 100;
                        $("#unique-VL-PerN").text(parseInt(PerN) + '%');

                        // console.log(analyticsPatientsJourney.length);
                        $("#total-VL-N").text(commaSeperatedNumber(analyticsPatientsJourney.length));
                        // console.log(resulting_object_result.pharmaAnalysisData.ALLDATA);
                        $("#before-treatment-N").text(commaSeperatedNumber(resulting_object_result.pharmaAnalysisData.BeforeStartCount));
                        $("#before-treatment-TotalN").text(commaSeperatedNumber(resulting_object_result.pharmaAnalysisData.BaseDataCount));
                        PerN = (resulting_object_result.pharmaAnalysisData.BeforeStartCount / resulting_object_result.pharmaAnalysisData.BaseDataCount) * 100;
                        $("#before-treatment-PerN").text(parseInt(PerN) + '%');

                        $("#after-treatment-N").text(commaSeperatedNumber(resulting_object_result.pharmaAnalysisData.AfterStartCount));
                        $("#after-treatment-TotalN").text(resulting_object_result.pharmaAnalysisData.BaseDataCount);
                        PerN = (resulting_object_result.pharmaAnalysisData.AfterStartCount / resulting_object_result.pharmaAnalysisData.BaseDataCount) * 100;
                        $("#after-treatment-PerN").text(parseInt(PerN) + '%');
                        $(".viralload-TotalN").text(commaSeperatedNumber(resulting_object_result.pharmaAnalysisData.AllBaseDataCount));
                        $("#viralload-before-TotalN").text(commaSeperatedNumber(resulting_object_result.pharmaAnalysisData.AllBeforeStartCount));
                        $("#viralload-after-TotalN").text(commaSeperatedNumber(resulting_object_result.pharmaAnalysisData.AllAfterStartCount));
                        setCohortPatientCount({ patientCount: commaSeperatedNumber(resulting_object_result.pharmaAnalysisData.BaseDataCount) });
                        Pinscriptive.TreatmentEfficacy.realDataQA = resulting_object_result;
                    }, 100);

                }
                fetchSecondaryDataset(params); //fetch secondary data
            });

        }
    });
}

let initializeDropdown = () => {
    $("#example").multiselect({
        selectedText: "# of # selected",
        checkAllText: "Select All",
        multiple: true,
        uncheckAllText: "Unselect All",
        classes: "te_selectMedication",
        minWidth: 250,
        noneSelectedText: "Select...",
    });
}

let handleGoButton = () => {
    // var medicine = $("#example").multiselect("getChecked").map(function() {
    //     return this.value;
    // }).get();
    // chartMedication = [];
    // showItems();
    // chartMedication = medicine;


    let params = {};
    params = getCurrentPopulationFilters();
    var chartMedication = [];
    chartMedication = params != undefined ? params.medicationArray : {};

    if (params == undefined || params.medicationArray == undefined || params.medicationArray.length == 0) {
        let medication = []; //DistinctMedicationCombinations;
        for (let i = 0; i < DistinctMedicationCombinations.length; i++) {
            medication.push(DistinctMedicationCombinations[i]['MEDICATION']);
        }
        chartMedication = medication;
    }

    if (!chartMedication.length) {
        $('.totalTreatmentEfficacyPatietnsPerDrug').html("0");
        $('#pharma_svrTrendByPatient').empty();
        $('#pharma_patientsjourney').html('<div class="providerNoDataFound">Please Select Medications</div>');
    } else {
        // renderPatientsJourneyChart(medicine);
        // renderTreatmentEfficacyChart(chartMedication, analyticsPatientsJourney, "pharma_patientsjourney");
        //renderTreatmentEfficacyChart(chartMedication, analyticsPatientsJourney, "pharma_svrTrendByPatient", true);

        const wrapperContainer = "#treatmentEfficacyViralLoadSyncCharts";
        const containerForPatients = "pharma_svrTrendByPatient";
        const containerForViralLoad = "pharma_patientsjourney";

        const totalCountContainer = ".totalTreatmentEfficacyPatietnsPerDrug";
        const radioButtonContainer = "#divWeekResponse";

        renderSyncTreatmentEfficacyChart(chartMedication, analyticsPatientsJourney, wrapperContainer, containerForViralLoad, containerForPatients, totalCountContainer, radioButtonContainer);


        // Find Unique patients and Update the patient count in the header.
        // Yurvaj (20th Feb 17): Switching back to PATIENT_ID_SYNTH
        // var uniquepatients = _.pluck(analyticsPatientsJourney, 'IDW_PATIENT_ID_SYNTH');
        var uniquepatients = _.pluck(analyticsPatientsJourney, 'PATIENT_ID_SYNTH');
        //Praveen 02/20/2017 commmon cohort
        // setCohortPatientCount({ patientCount: _.uniq(uniquepatients).length });
        //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
    }
}

let DrawViralScoreCharts = (AdvanceAnalyticsData) => {

        //console.log(AdvanceAnalyticsData);
        if (AdvanceAnalyticsData.BeforeStart != null) {
            renderViralScoreCharts("#SVRBeforeTreatment", AdvanceAnalyticsData.BeforeStart);
        }

        // if (AdvanceAnalyticsData.DuringMedication != null) {
        //     renderViralScoreCharts("#SVRDuringTreatment", AdvanceAnalyticsData.DuringMedication);
        // }

        if (AdvanceAnalyticsData.AfterStart != null) {
            renderViralScoreCharts("#SVRAfterTreatment", AdvanceAnalyticsData.AfterStart);
        }

    }
    // Render the PatientsJourney SVR Trend chart
function renderPatientsJourneyChart(medicine) {
    $("#pharma_patientsjourney").empty();

    let dataPJ = [];
    let maxWeeks = [];
    let minWeeks = [];


    dataPJ = analyticsPatientsJourney;
    maxWeeks = _.max(dataPJ, function(dataPJT) {
        return parseInt(dataPJT.Weeks);
    });
    minWeeks = _.min(dataPJ, function(dataPJT) {
        return parseInt(dataPJT.Weeks);
    });

    let groupedData = _.groupBy(dataPJ, 'MEDICATION');
    // console.log(dataPJ);
    let categoriesx = [];
    let seriesy = [];
    let maxvalue = maxWeeks.Weeks;
    let minvalue = minWeeks.Weeks;
    let plotBands = [];

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
            var rangefrom = range.split('-')[0];
            var rangeto = range.split('-')[1];
            var from = 0,
                to = 0;
            dataPJ = dataPJ.filter(function(a) {
                return (parseInt(a.TREATMENT_PERIOD) >= parseInt(rangefrom) && parseInt(a.TREATMENT_PERIOD) <= parseInt(rangeto));
            });

            console.log(dataPJ);
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

    // By Default if No radio button is selected, Select ALL
    if (!plotBands.length) {
        $("#divWeekResponse input[type=radio][value='all']").prop('checked', true);
    }

    let ymaxvalue = 0;
    let xMaxValueCurr = 0;
    let xMaxValue = 0;
    let totalPatientsPerDrug = 0;
    if (chartMedication.length > 0) {
        for (let i = 0; i < chartMedication.length; i++) {
            let drugToBeFiltered = chartMedication[i];
            let jsonObj = {},
                filteredcount = [],
                dataweekcount = [];
            for (let week = parseInt(minvalue); week <= parseInt(maxvalue); week++) {
                let total = 0;

                filteredcount = dataPJ.filter(function(a) {
                    // return (a.MEDICATION.toLowerCase().indexOf(drugToBeFiltered.toLowerCase()) > -1 && a.Weeks == week);
                    return (a.MEDICATION.toLowerCase() == drugToBeFiltered.toLowerCase() && a.Weeks == week);
                });

                // Yurvaj (20th Feb 17): Switching back to PATIENT_ID_SYNTH
                let patientcount = _.pluck(filteredcount, 'PATIENT_ID_SYNTH');
                // let patientcount = _.pluck(filteredcount, 'IDW_PATIENT_ID_SYNTH');
                patientcount = _.uniq(patientcount).length;


                for (let j = 0; j < filteredcount.length; j++) {
                    total = total + parseFloat(filteredcount[j].ViralLoad);
                }

                let valt = 0.0;

                if (filteredcount.length > 0 && total > 0)
                    valt = Math.log(parseFloat(total / filteredcount.length)); // Math.log(parseFloat(total / filteredcount.length));

                if (valt < 0)
                    valt = 0.0;

                // console.log("************* Week  " + week);
                // console.log("************* Total Viral Load   " + total);
                // console.log("************* Total Patient   " + filteredcount.length);
                // console.log("************* Total Unique Patient   " + patientcount);
                // console.log("************* Total Patient Increasing  " + totalPatientsPerDrug);


                // valt = parseFloat(valt).toFixed(2);

                // show only those points where data is available.
                //if(patientcount){
                xMaxValueCurr = week;
                dataweekcount.push({
                    y: valt,
                    patientcount: patientcount
                });
                // }

                totalPatientsPerDrug += patientcount;

                if (ymaxvalue < valt)
                    ymaxvalue = valt;
            }

            if (xMaxValue < xMaxValueCurr) {
                xMaxValue = xMaxValueCurr;
            }

            var color = '';
            color = ['#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99', '#D98880', '#D7BDE2', '#A9CCE3', '#A3E4D7', '#F7DC6F', '#B9770E', '#884EA0', '#D6EAF8', '#EDBB99'];

            jsonObj['name'] = chartMedication[i];
            jsonObj['data'] = dataweekcount;
            jsonObj['color'] = color[i];
            seriesy.push(jsonObj);

        }

        // update Patatient Count
        $('.totalTreatmentEfficacyPatietnsPerDrug').html(commaSeperatedNumber(totalPatientsPerDrug));


        // console.log(seriesy);
        for (let week = parseInt(minvalue); week <= parseInt(maxvalue); week++) {
            categoriesx.push(week);
        }

        //console.log(seriesy);

        // Check if data is not available for selected Medications.
        let NoDataFlag = true;
        for (let i = 0; i < seriesy.length; i++) {
            if (seriesy[i].data.length != 0) {
                NoDataFlag = false;
            }
        }


        if (NoDataFlag) {
            $('#pharma_patientsjourney').html('<div class="providerNoDataFound">No Data Available</div>');
        } else {
            Highcharts.chart('pharma_patientsjourney', {
                chart: {
                    zoomType: 'xy'
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
                    // min: 0,
                    // max: (parseInt(xMaxValue) + 5),
                    plotBands: plotBands
                },
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


let renderViralScoreCharts = (container, ChartData) => {

    let groupedData = [];
    let labelb = '';
    let labela = '';
    let tooltiplabel = '';

    //console.log(ChartData);
    labelb = 'Viral Load Score';
    labela = 'Total Number of Patients';
    tooltiplabel = 'Viral Load Test Count';
    // xaxisvalues = ['x', "<0.2M", "0.2M-1M", "1M-5M", "5M-25M", "25M+"];
    // Nisha 02/14/2017 Commented and changed the X axis to add the Undetectable
    xaxisvalues = ['x', "Undetectable", "<0.2M", "0.2M-1M", "1M-5M", "5M-25M", "25M+"];

    let yaxisvalues = ChartData.yaxisvalues;
    // Get the SVR Test Count for the Patients
    let patientuniquecount = ChartData.patientuniquecount;

    let colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd'];

    var chart = c3.generate({
        bindto: container,
        padding: {
            top: 2
        },
        bar: {
            width: {
                ratio: 0.85
            }
        },
        size: {
            height: 260,
            width: 550
        },
        color: {
            pattern: colors
        },
        data: {
            x: 'x',
            columns: [
                xaxisvalues,
                yaxisvalues
            ],
            type: 'bar',
            color: function(inColor, data) {

                //var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                if (data.index !== undefined) {
                    return colors[data.index];
                }
                return inColor;
            },
            labels: {
                format: function(v, id, i, j) {
                    var labelv = '';
                    //  console.log(probgroup.length);
                    if (i != undefined) {
                        labelv = commaSeperatedNumber(yaxisvalues[i + 1]);
                        return labelv;
                    } else {}
                }
            }
        },
        axis: {
            x: {
                type: 'category',
                label: {
                    text: labelb,
                    position: 'center'
                }
            },
            y: {
                label: {
                    text: labela,
                    position: 'middle'
                },
                tick: {
                    count: 6,
                    format: (d) => commaSeperatedNumber(Math.round(d))
                }
            }
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                // var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7', '#009900'];
                let dataObj = d[0];

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + xaxisvalues[dataObj.index + 1] + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> ' + tooltiplabel + ': ' + commaSeperatedNumber(patientuniquecount[dataObj.index + 1]) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        legend: {
            show: false
        }
    });
}

// Function for the Therapy Distribution chart
function DrawTherapyDistribution(data, container) {
    $('#pharma_TherapyDistribution').empty();
    let medication = data.medication;
    //  if (medication.toLowerCase() != 'all') {
    let patientDataefficacy = data.patientData.filter(function(a) {
        return (a.Medication == medication);
    });
    // console.log(analyticsPatientsData['efficacy']);
    // //"8,12,16,24,48"
    // var totalData = patientDataefficacy.filter(function(a) {
    //     return (a.Medication == medication && a.isCured != null);
    // });
    // // console.log(totalData);

    // var curedData = patientDataefficacy.filter(function(a) {
    //     return (a.Medication == medication && a.isCured == 1);
    // });

    let groupedDatatreatmentPeriod = _.groupBy(patientDataefficacy, 'treatmentPeriod');
    let groupedDataGenotype = _.groupBy(patientDataefficacy, 'genotype');

    let xvalues = [];
    let dataplot = [];

    for (let item in groupedDataGenotype) {
        let jsonObj = {};
        let itemdata = [];
        jsonObj['name'] = item;
        groupedDatatreatmentPeriod = _.groupBy(groupedDataGenotype[item], 'treatmentPeriod');
        for (let keys in groupedDatatreatmentPeriod) {
            var eff = 0;

            var totalData = groupedDatatreatmentPeriod[keys].filter(function(a) {
                return (a.isCured != null);
            });
            // console.log(totalData);

            var curedData = groupedDatatreatmentPeriod[keys].filter(function(a) {
                return (a.isCured == 1);
            });


            if (parseFloat(curedData.length) > 0 && parseFloat(totalData.length) > 0) {
                eff = (parseFloat(curedData.length) * 100) / parseFloat(totalData.length);
            }
            itemdata.push(eff);
        }
        jsonObj['data'] = itemdata;
        dataplot.push(jsonObj);
        // sum = 0;
        // if (parseFloat(groupedDataGenotype[item].length) > 0 && parseFloat(totalData.length) > 0) {
        //     sum = (parseFloat(groupedDataGenotype[item].length) * 100) / parseFloat(totalData.length);
        // }
        // itemdata.push(sum);
    }
    //console.log(dataplot);
    for (let keys in groupedDatatreatmentPeriod) {
        xvalues.push(keys);
    }
    //console.log(dataplot);
    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: ' '
        },
        xAxis: {
            categories: xvalues
        },
        credits: {
            enabled: false
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Efficacy %'
            },
            stackLabels: {
                enabled: true,
                formatter: function() {
                    return parseFloat(this.total).toFixed(2) + " %";
                },
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                }
            }
        },
        legend: {
            // align: 'right',
            // x: -30,
            // verticalAlign: 'top',
            // y: 25,
            // floating: true,
            // backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            // borderColor: '#CCC',
            // borderWidth: 1,
            // shadow: false
            show: false
        },
        tooltip: {
            formatter: function() {
                var s = '<b> Week : ' + this.x + '</b>';

                $.each(this.points, function(i, point) {
                    s += '<br/><b>  ' + point.series.name + ': </b>' + parseFloat(point.y).toFixed(2) + " %";
                });

                return s;
            },
            shared: true
        },
        plotOptions: {
            column: {
                //   stacking: 'normal'
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return this.y.toFixed(2) + ' %';
                    }
                }
            }
        },
        series: dataplot
    });

    // }
}


//navigation search and close
let openNav = () => {
    if (document.getElementById("viral_load_over_time_opition")) {
        document.getElementById("viral_load_over_time_opition").style.width = "1040px";
    }
}

let closeNav = () => {
    if (document.getElementById("viral_load_over_time_opition")) {
        document.getElementById("viral_load_over_time_opition").style.width = "0";
    }
}


let drawSvrTrendChart = (medications) => {
    // renderPatientsJourneyChart(medications);
    let chartMedication = medications;
    // renderTreatmentEfficacyChart(chartMedication, analyticsPatientsJourney, "pharma_patientsjourney");
    //renderTreatmentEfficacyChart(chartMedication, analyticsPatientsJourney, "pharma_svrTrendByPatient", true);

    // wrapperContainer will be used for bind and unbind sync events.
    const wrapperContainer = "#treatmentEfficacyViralLoadSyncCharts";
    const containerForPatients = "pharma_svrTrendByPatient";
    const containerForViralLoad = "pharma_patientsjourney";

    const totalCountContainer = ".totalTreatmentEfficacyPatietnsPerDrug";
    const radioButtonContainer = "#divWeekResponse";
    renderSyncTreatmentEfficacyChart(chartMedication, analyticsPatientsJourney, wrapperContainer, containerForViralLoad, containerForPatients, totalCountContainer, radioButtonContainer);

    // Find Unique patients and Update the patient count in the header.

    // Yurvaj (20th Feb 17): Switching back to PATIENT_ID_SYNTH
    // var uniquepatients = _.pluck(analyticsPatientsJourney, 'IDW_PATIENT_ID_SYNTH');
    var uniquepatients = _.pluck(analyticsPatientsJourney, 'PATIENT_ID_SYNTH');
    //Praveen 02/20/2017 commmon cohort
    // setCohortPatientCount({ patientCount: _.uniq(uniquepatients).length });
    //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(_.uniq(uniquepatients).length));
}

function hideItems() {
    $('#ViralLoadOvertime').hide();
    $('#TherapyDistribution').hide();
}

function showItems() {
    $('#ViralLoadOvertime').show();
    $('#TherapyDistribution').show();
}

function forSelection(medicine) {
    $("#divMedicineList input[type=checkbox]").each(function() {
        if ($(this).val() == medicine)
            $(this).prop('checked', true);
        else
            $(this).prop('checked', false);
    });
}

let fetchSecondaryDataset = (params) => {

    params.database = getReverseSelectedDatabase(); //get database
    Meteor.call('getTreatmentEfficacyDataAnalytics', params, function(error, result) {
        //console.log('First call fethed');
        if (error) {
            Pinscriptive.TreatmentEfficacy.compData = null;
        } else {
            result = JSON.parse(result);
            Pinscriptive.TreatmentEfficacy.compData = result;
            Meteor.call('getTreatmentEfficacyViralScoreAnalysisData', params, function(error1, result1) {
                if (error1) {
                    Pinscriptive.TreatmentEfficacy.compDataQA = null;
                } else {
                    result1 = JSON.parse(result1);
                    Pinscriptive.TreatmentEfficacy.compDataQA = result1;
                    $('.togglechart').show();
                }
            });
        }
    });
}


//function to plot comparision charts
let plotComparisionDataCharts = (plottingData, primaryData, secondaryData, diffplottingData) => {

    mlSubTabsUtil.prepareDomForComparisionCharts(plottingData);

    let primaryContainer = '#primaryDataViewSection',
        secondaryContainer = '#secondaryDataViewSection';

    let chartTypeLabel = '';

    //empty the containers
    $(primaryContainer).empty();
    $(secondaryContainer).empty();

    switch (plottingData) {

        case 'viraloadbefore':
            chartTypeLabel = 'Viral Load Before Treatment';
            renderViralScoreCharts(primaryContainer, primaryData.BeforeStart);
            renderViralScoreCharts(secondaryContainer, secondaryData.BeforeStart);
            break;
        case 'viraloadafter':
            chartTypeLabel = 'Viral Load After Ending Treatment';
            renderViralScoreCharts(primaryContainer, primaryData.AfterStart);
            renderViralScoreCharts(secondaryContainer, secondaryData.AfterStart);
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}