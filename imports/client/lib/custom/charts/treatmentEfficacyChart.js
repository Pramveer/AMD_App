// Render the PatientsJourney SVR Trend chart
renderTreatmentEfficacyChart = function (medicine, data, container, isPatient) {
    // Clear the container in which we have to render the chart.
    // $("#pharma_patientsjourney").empty();
    $('#'+container).empty();

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
    let dataForSelectedWeeks = getPlotBandRangesForViralLoadChart(dataPJ,maxvalue);
    let plotBands = dataForSelectedWeeks.plotBands;
    dataPJ = dataForSelectedWeeks.data;

    // By Default if No radio button is selected, Select ALL
    if(!plotBands.length){
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
    // but now it is same as medicine;
    let chartMedication = medicine;

    let yAxisLabel = "Viral Load (in log)";

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
                let patientcount = _.pluck(filteredcount, 'IDW_PATIENT_ID_SYNTH');
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
                }

                if(!isPatient) {

                    // push the Average viral load value and unique patients for the particular drug and week into an array.
                    //  this array will be used for creating the data for the Chart.
                    dataweekcount.push({ y: valt, patientcount: patientcount });

                    // total in for all data points -  Not Unique. two data points may have some patients in common.
                    // This variable is not being used anyywhere right now.
                    totalPatientsPerDrug += patientcount;

                    if (ymaxvalue < valt){
                         ymaxvalue = valt;
                    }


                    // we have to plot the chart based on Patient Count
                } else {
                    yAxisLabel = "Patient Count";

                     // push the unique patients for the particular drug and week into an array.
                    //  this array will be used for creating the data for the Chart.
                    dataweekcount.push({ y: patientcount, patientcount: patientcount });

                    // total in for all data points -  Not Unique. two data points may have some patients in common.
                    // This variable is not being used anyywhere right now.
                    totalPatientsPerDrug += patientcount;

                    if (ymaxvalue < patientcount){
                         ymaxvalue = patientcount;
                    }

                }
            } //  Closing of the loop for the all weeks of Viral Load for a particular Medication

            var color = ['#D98880','#D7BDE2','#A9CCE3','#A3E4D7','#F7DC6F','#B9770E','#884EA0','#D6EAF8','#EDBB99',
                        '#D98880','#D7BDE2','#A9CCE3','#A3E4D7','#F7DC6F','#B9770E','#884EA0','#D6EAF8','#EDBB99'];

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
        for(let i = 0; i<seriesy.length; i++){
            if(seriesy[i].data.length !=0){
                NoDataFlag = false;
            }
        }


        // Append Title for the Charts
        if(!isPatient) {
            $('.'+container+'_title').html("Y-Axis: Viral Load");
        } else {
            $('.'+container+'_title').html("Y-Axis: Patient Count");
        }


        if(NoDataFlag){
            // Show No Data Found instd of Empty Chart.
            // $('#pharma_patientsjourney').html('<div class="providerNoDataFound">No Data Available</div>');
            $('#'+container).html('<div class="providerNoDataFound">No Data Available</div>');

        }else{
            // Render High Chart.
             Highcharts.chart(container, {
                chart: {
                    zoomType: 'xy',
                    type: 'line',
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
                plotOptions: {
                    series: {
                        events: {
                            legendItemClick: function() {
                                var visibility = this.visible ? 'visible' : 'hidden';
                            }
                        }
                    },
                    colors:['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
                    line: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                if(isPatient){
                                    return Highcharts.numberFormat(this.y, 0) > 0 ? Highcharts.numberFormat(this.y, 0) : '';
                                } else {
                                    return Highcharts.numberFormat(this.y, 2) > 0 ? Highcharts.numberFormat(this.y, 2) : '';
                                }

                            }
                        }
                    }
                },
                yAxis: {
                    // min: 0,
                    // max: (ymaxvalue + 5),
                    // tickInterval: 1000,
                    title: {
                        text: yAxisLabel
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

// Get Filtered data and PlotBands
getPlotBandRangesForViralLoadChart = (dataPJ,maxvalue) => {

    //console.log(dataPJ);
    let plotBands = [];

    // this function will filter data based on selected weeks on the ui.
    if(!($("#divWeekResponse input[type=radio]:checked").val() == 'all' || $("#divWeekResponse input[type=radio]:checked").val() == undefined )){

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

            //console.log(maxvalue);
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
