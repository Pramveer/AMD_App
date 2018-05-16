// Render the PatientsJourney SVR Trend chart
renderSyncTreatmentEfficacyChart = function (medicine, data, wrapperContainer, containerForViralLoad, containerForPatients, totalCountContainer, radioButtonContainer) {
    // Clear the container in which we have to render the chart.
    $('#'+containerForViralLoad).empty();
    $('#'+containerForPatients).empty();

    // get Patients data with Viral Load results
     let dataPJ = data;

    // find Max Week and Min Week -  This will be use full in Looping over the data.
    let maxWeeks = _.max(dataPJ, function(dataPJT) { return parseInt(dataPJT.Weeks); });
    let minWeeks = _.min(dataPJ, function(dataPJT) { return parseInt(dataPJT.Weeks); });
    let maxvalue = maxWeeks.Weeks;
    let minvalue = minWeeks.Weeks;

    // Group Data by Medications
    let groupedData = _.groupBy(dataPJ, 'MEDICATION');

    // Filter data based on selected range of weeks.
    let dataForSelectedWeeks = getSyncPlotBandRangesForViralLoadChart(dataPJ,maxvalue, radioButtonContainer);
    let plotBands = dataForSelectedWeeks.plotBands;
    dataPJ = dataForSelectedWeeks.data;

    let range = 0;
        range = $(radioButtonContainer +" input[type=radio]:checked").val() == undefined ? 0 : $(radioButtonContainer +" input[type=radio]:checked").val();
    let rangeto = 0;
    if (range != 0) {
        rangeto = range.split('-')[1];
    }


    let availableData = isDataAvailable(dataPJ, medicine, rangeto);
    let isDataExist = availableData.status;
    let medicationsWithData = availableData.medications;
    if(!isDataExist){
        $('#'+containerForViralLoad).html('<div class="providerNoDataFound">Not Enough Data Available</div>');
        return;
    }


    // By Default if No radio button is selected, Select ALL
    if(!plotBands.length){
         $(radioButtonContainer +" input[type=radio][value='0-8']").prop('checked', true);
    }

    // this variable will give us Total Unique Patients that will be used to plot the Chart.
    let totalPatientsWithViralLoadData = [];

    let ymaxvalue_viralLoad = 0;
    let ymaxvalue_patientCount = 0;

    let xMaxValueCurr = 0;
    let xMaxValue = 0;

    let totalPatientsPerDrug = 0;

    //  this Arary will contain final cahrt data for all selected Medications
    let seriesy_viraLoad = [];
    let seriesy_patientCount = [];

    let datasets = [];

    // "chartMedication" is the global variable that we update every time when filter is changed or Medication Dropdown is Changed
    // but now it is same as medicine;
    // Updated by Yurvaj 14th Feb 17 : Only those medicaiton which have data.
    let chartMedication = medicationsWithData;

    if (chartMedication.length > 0) {

        for (let i = 0; i < chartMedication.length; i++) {
            let drugToBeFiltered = chartMedication[i];
            // this variable will be used to keep Chart Data per Medication for viralLoad
            let jsonObj_viralLoad = {};

            // this variable will be used to keep Chart Data per Medication for patientCount
            let jsonObj_patientCount = {};
            // this variable will be used to get data for a particular Medication
            let filteredcount = [];

            let viralLoadPerDrug = [];
            let patientCountPerDrug = [];

            for (let week = parseInt(minvalue); week <= parseInt(maxvalue); week++) {
                let total = 0;

                // Filtering the data based on Medication.
                filteredcount = dataPJ.filter(function(a) {
                    // return (a.MEDICATION.toLowerCase().indexOf(drugToBeFiltered.toLowerCase()) > -1 && a.Weeks == week);
                    return (a.MEDICATION.toLowerCase() == drugToBeFiltered.toLowerCase() && a.Weeks == week);
                });

                // total Patients who have viral load data is available for particular drug and week.-  not Unique
                // Yurvaj (20th Feb 17): Switching back to PATIENT_ID_SYNTH
                // let patientcount = _.pluck(filteredcount, 'IDW_PATIENT_ID_SYNTH');
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
                if (filteredcount.length > 0 && total > 0){
                    valt = Math.log(parseFloat(total / filteredcount.length));
                    if (valt < 0){
                        valt = 0.0;
                    }
                    else{
                        valt = parseFloat(valt.toFixed(2));
                    }
                }


                // push the Average viral load value and unique patients for the particular drug and week into an array.
                //  this array will be used for creating the data for the Chart.
                viralLoadPerDrug.push({ y: valt, patientcount: patientcount });

                // total in for all data points -  Not Unique. two data points may have some patients in common.
                // This variable is not being used anyywhere right now.
                totalPatientsPerDrug += patientcount;

                if (ymaxvalue_viralLoad < valt){
                        ymaxvalue_viralLoad = valt;
                }

                // push the unique patients for the particular drug and week into an array.
                //  this array will be used for creating the data for the Chart.
                patientCountPerDrug.push({ y: patientcount, patientcount: patientcount });

                // total in for all data points -  Not Unique. two data points may have some patients in common.
                // This variable is not being used anyywhere right now.
                //totalPatientsPerDrug += patientcount;

                if (ymaxvalue_patientCount < patientcount){
                        ymaxvalue_patientCount = patientcount;
                }





            }

            //Praveen 02/27/2017 Added new unique colors
            // var color = ['#D98880','#D7BDE2','#A9CCE3','#A3E4D7','#F7DC6F','#B9770E','#884EA0','#D6EAF8','#EDBB99',
            //             '#D98880','#D7BDE2','#A9CCE3','#A3E4D7','#F7DC6F','#B9770E','#884EA0','#D6EAF8','#EDBB99'];


            var color = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7',
                        '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
            // Final data object for a particular Medication viral load
            jsonObj_viralLoad['name'] = chartMedication[i];
            jsonObj_viralLoad['data'] = viralLoadPerDrug;
            jsonObj_viralLoad['color'] = color[i];
            jsonObj_viralLoad['chartName'] = "viralLoad";
            jsonObj_viralLoad['tooltip'] = { valueSuffix: ' Log'};

            // Push into Final Array for the Chart Data.
            seriesy_viraLoad.push(jsonObj_viralLoad);


            // Final data object for a particular Medication viral load
            jsonObj_patientCount['name'] = chartMedication[i];
            jsonObj_patientCount['data'] = patientCountPerDrug;
            jsonObj_patientCount['color'] = color[i];
            jsonObj_patientCount['chartName'] = "patientCount";
            jsonObj_patientCount['tooltip'] = { valueSuffix: ' Patients'}

            // Push into Final Array for the Chart Data.
            seriesy_patientCount.push(jsonObj_patientCount);


        }

        datasets =  [{
            "name": "Y-Axis: Viral Load ( in log )",
            "data": seriesy_viraLoad,
            "container": containerForViralLoad,
            "unit": "Log"
        },
        {
            "name": "Y-Axis: Patient Count",
            "data": seriesy_patientCount,
            "container": containerForPatients,
            "unit": "Patients"
        }];



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
        // the logic for nodata flag needs to be rewritten.
        let NoDataFlag = false; // let NoDataFlag = true;
        // for(let i = 0; i<seriesy.length; i++){
        //     if(seriesy[i].data.length !=0){
        //         NoDataFlag = false;
        //     }
        // }


        if(NoDataFlag){
            // Show No Data Found instd of Empty Chart.
            // $('#pharma_patientsjourney').html('<div class="providerNoDataFound">No Data Available</div>');
           // $('#'+container).html('<div class="providerNoDataFound">No Data Available</div>');
           return;

        }else{

            // console.log("** Treatment Efficacy data **");
            // console.log(datasets);

                // console.log(dataset);

                // Render High Chart.
                    // Highcharts.chart(container, {
                    // chart: {
                    //     zoomType: 'xy',
                    //     height: 400,
                    //     width: 1200
                    // },
                    // title: {
                    //     text: ' '

                    // },
                    // credits: {
                    //     enabled: false
                    // },
                    // xAxis: {
                    //     categories: categoriesx,
                    //     title: {
                    //         text: 'Weeks'
                    //     },
                    //     plotBands: plotBands
                    // },
                    // plotOptions: {
                    //     series: {
                    //         events: {
                    //             legendItemClick: function() {
                    //                 var visibility = this.visible ? 'visible' : 'hidden';
                    //             }
                    //         }
                    //     },
                    //     line: {
                    //         dataLabels: {
                    //             enabled: true,
                    //             formatter: function() {
                    //                 if(isPatient){
                    //                     return Highcharts.numberFormat(this.y, 0) > 0 ? Highcharts.numberFormat(this.y, 0) : '';
                    //                 } else {
                    //                     return Highcharts.numberFormat(this.y, 2) > 0 ? Highcharts.numberFormat(this.y, 2) : '';
                    //                 }

                    //             }
                    //         }
                    //     }
                    // },
                    // yAxis: {
                    //     min: 0,
                    //     max: (ymaxvalue + 5),
                    //     // tickInterval: 1000,
                    //     title: {
                    //         text: yAxisLabel
                    //     },
                    //     // labels: {
                    //     //     enabled: false,
                    //     //     format: yAxisData == '{value}'
                    //     // },
                    //     plotLines: [{
                    //         value: 0,
                    //         width: 1,
                    //         color: '#808080'
                    //     }]
                    // },
                    // // tooltip: {
                    // //     valueSuffix: '°C'
                    // // },
                    // legend: {
                    //     layout: 'vertical',
                    //     align: 'right',
                    //     verticalAlign: 'top',
                    //     borderWidth: 0
                    // },

                    // series: seriesy,
                    // tooltip: {
                    //     formatter: function() {
                    //         var s = '<b> Week: </b>' + this.x;

                    //         $.each(this.points, function() {
                    //             s += '<br/><b>' + this.series.name + ': </b>' +
                    //                 this.y.toFixed(2);
                    //             s += '<br/><b>Patient Count: </b>' +
                    //                 this.point.patientcount;
                    //         });

                    //         return s;
                    //     },
                    //     shared: true
                    // }
                    //  });



            let charts = [];

            $.each(datasets, function (i, dataset) {

                // $('<div class="tretmentEfficacyChart">')
                // .appendTo('#'+container);
                //Praveen 02/27/2017 Added color
                Highcharts.chart(dataset.container, {
                    chart: {
                            marginLeft: 40, // Keep all charts left aligned
                            spacingTop: 20,
                            spacingBottom: 20,
                            zoomType: 'xy',
                            height: 400,
                            width: 1200
                        },
                        title: {
                            text: dataset.name,
                            align: 'left',
                            margin: 0,
                            x: 30,
                            style: {
                                fontWeight: 'bold',
                                fontSize: 14
                            }
                        },
                        colors:['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
                        credits: {
                            enabled: false
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'top',
                            borderWidth: 0
                        },
                        xAxis: {
                            crosshair: true,
                            events: {
                                setExtremes: syncExtremes
                            },
                            categories: categoriesx,
                            title: {
                                text: 'Weeks'
                            },
                            plotBands: plotBands
                        },
                        yAxis: {
                            title: {
                                text: null
                            }
                        },
                         plotOptions: {
                            series: {
                                point: {
                                    events: {
                                        mouseOver: function () {
                                           // console.log(this.series.name);
                                           highlightPoint(this.series.name);
                                        }
                                    }
                                },
                                events: {
                                    mouseOut: function () {
                                        if (this.chart.lbl) {
                                            this.chart.lbl.hide();
                                        }
                                    }
                                }
                            }
                        },
                        tooltip: {
                            positioner: function () {
                                return {
                                    x: 350,// x: this.chart.chartWidth - this.label.width, // right aligned
                                    y: 5 // align to title
                                };
                            },
                            borderWidth: 0,
                            backgroundColor: 'none',
                            pointFormat: '{series.name} : {point.y} ',
                            headerFormat: '',
                            shadow: false,
                            style: {
                                fontSize: '14px'
                            },
                            // formatter: function() {
                            //     var s = '<b> Week: </b>' + this.x;

                            //     $.each(this.points, function() {
                            //         s += '<br/><b>' + this.series.name + ': </b>' +
                            //             this.y.toFixed(2);
                            //         s += '<br/><b>Patient Count: </b>' +
                            //             this.point.patientcount;
                            //     });

                            //     return s;
                            // },
                        },

                        series: dataset.data
                },function(chart) {
                    charts.push(chart);
                }); // highchart close

            }); // each loop close


            let highlightPoint = (drugName) => {
                /**
                 * In order to synchronize tooltips and crosshairs, override the
                 * built-in events with handlers defined on the parent element.
                 */

                $(wrapperContainer).unbind('mousemove touchmove touchstart');
                $(wrapperContainer).bind('mousemove touchmove touchstart', function (e) {
                    var chart,
                        point,
                        i,
                        event;

                    for (i = 0; i < charts.length; i = i + 1) {
                        chart = charts[i];
                        event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                        // console.log(chart.series)
                        let hoverPoint = _.where(chart.series, {name: drugName})[0];
                        // point = chart.series[0].searchPoint(event, true); // Get the hovered point
                        point = hoverPoint.searchPoint(event, true); // Get the hovered point

                        if (point) {
                            point.highlight(e);
                        }
                    }
                });
            }

            /**
             * Override the reset function, we don't need to hide the tooltips and crosshairs.
             */
            Highcharts.Pointer.prototype.reset = function () {
                return undefined;
            };

            /**
             * Highlight a point by showing tooltip, setting hover state and draw crosshair
             */
            Highcharts.Point.prototype.highlight = function (event) {
                this.onMouseOver(); // Show the hover marker
                this.series.chart.tooltip.refresh(this); // Show the tooltip
                this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
            };
        } // else condition close


    }


    /**
     * Synchronize zooming through the setExtremes event handler.
     */
    function syncExtremes(e) {
        var thisChart = this.chart;

        if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
            Highcharts.each(Highcharts.charts, function (chart) {
                if (chart !== thisChart) {
                    if (chart.xAxis[0].setExtremes) { // It is null while updating
                        chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                    }
                }
            });
        }
    }

}

// Get Filtered data and PlotBands
getSyncPlotBandRangesForViralLoadChart = (dataPJ,maxvalue, radioButtonContainer) => {

    //console.log(dataPJ);
    let plotBands = [];

    // this function will filter data based on selected weeks on the ui.
    if(!($(radioButtonContainer +" input[type=radio]:checked").val() == 'all' || $(radioButtonContainer + " input[type=radio]:checked").val() == undefined )){

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
        range = $(radioButtonContainer +" input[type=radio]:checked").val() == undefined ? 0 : $(radioButtonContainer +" input[type=radio]:checked").val();

        if (range != 0) {
            let rangefrom = range.split('-')[0];
            let rangeto = range.split('-')[1];
            let from = 0, to = 0;

            dataPJ = dataPJ.filter(function (a) {
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
        data : dataPJ,
        plotBands : plotBands
    }
}



function isDataAvailable(chartData, medications, rangeto){
    // console.log(chartData);
    let flag = false;
    let medicationsWithData = [];
    let count = 0;
    for(let i = 0; i<medications.length; i++){

        let medicationData  = _.where( chartData, { MEDICATION:medications[i].toUpperCase() });

        // console.log(medicationData);
        flag = checkIfEnoughDataExist(medicationData, rangeto);
        if(flag){
            count++;
            medicationsWithData.push(medications[i]);
        }
    }
    if(count){
        flag = true;
    }

    return {status: flag, medications: medicationsWithData};
}

/**
 * @author : Yuvraj 15th Feb 17
 * @desc : Added Check that data should be greater than zero in baseline as well as Followup period.
 */
function checkIfEnoughDataExist(medicationData, rangeto){
    let flag = false;
    let baselineFlag = false;
    let followupFlag = false;
    for(let i = 0; i<medicationData.length; i++){
        if(parseFloat(medicationData[i].ViralLoad) != 0){

            if(medicationData[i].Weeks<0){
                baselineFlag = true;
            }
            if(medicationData[i].Weeks > parseInt(rangeto)){
                followupFlag =  true;
            }
        }
    }

    if(baselineFlag && followupFlag){
        flag = true;
    }
    return flag;
}
