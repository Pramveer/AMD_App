import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './hccDistributionChart.html';

let primaryData = {},
    secondaryData = {};
/**
 * @author: Jayesh Agrawal
 * @date: 02th June 2017
 * @desc: Created HCC distribution as separate template, we can utilize this chart multiple place.
 * we will need to work on comparative fucntionality as common method, currently it depends on analyticsLib library.
*/

Template.hccDistributionChart.onCreated(function () {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.noData = new ReactiveVar(true);

    executeHCCDistributionRender(self);
});



Template.hccDistributionChart.rendered = function () {
    // To do when rendered
};

Template.hccDistributionChart.helpers({
    'isLoading': function () {
        return Template.instance().loading.get();
    }
});


Template.hccDistributionChart.events({

     'change #hccSelection .radioduration': function(e) {
        let chartSize = {};
        chartSize.height = 500;
        chartSize.width = 1000;

        if (e.target.value == "Ethnicity") {
            $('#hccToggleChart').attr('data', 'Ethnicity');
             DrawHCCDistributionChart({
                    container: 'hccDistributionChart',
                    data: primaryData.hccData.ethnicityDistribution,
                    chartTitle: 'Ethnicity',
                    chartSize: chartSize
                });
        } else if (e.target.value == "Genotype") {
            $('#hccToggleChart').attr('data', 'Genotype');
             DrawHCCDistributionChart({
                    container: 'hccDistributionChart',
                    data: primaryData.hccData.genotypeDistribution,
                    chartTitle: 'Genotype',
                    chartSize: chartSize
                });
        } else if (e.target.value == "Cirrhosis") {
            $('#hccToggleChart').attr('data', 'Cirrhosis');
            DrawHCCDistributionChart({
                    container: 'hccDistributionChart',
                    data: primaryData.hccData.cirrhosisDistribution,
                    chartTitle: 'Cirrhosis',
                    chartSize: chartSize
                });
        } else if (e.target.value == "FibStages") {
            $('#hccToggleChart').attr('data', 'FibStages');
             DrawHCCDistributionChart({
                    container: 'hccDistributionChart',
                    data: primaryData.hccData.fibrosureStageDistribution,
                    chartTitle: 'FibStages',
                    chartSize: chartSize
                });
        }
    },
      'click #hccToggleChart': function(event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        if (isCustomerDataset()) {
            plotComparisionDataCharts({ plottingData: value, primaryData: primaryData, secondaryData: secondaryData, desc: desc });
        } else {
            plotComparisionDataCharts({ plottingData: value, primaryData: secondaryData, secondaryData: primaryData, desc: desc });
        }
    }
});

let executeHCCDistributionRender = (templateObj) => {

    let params = getCurrentPopulationFilters();
    if(!params.showPreactingAntivirals) {
        params.showPreactingAntivirals = true;
    }
    Meteor.call('getHCCDistributionData', params, function (error1, results) {
        if (error1) {
            templateObj.loading.set(false);
            templateObj.noData.set(true);
        } else {
            primaryData.hccData = JSON.parse(LZString.decompress(results));

            templateObj.loading.set(false);
            templateObj.noData.set(false);

            let chartSize = {};
            chartSize.height = 500;
            chartSize.width = 1000
            setTimeout(function () {
                DrawHCCDistributionChart({
                    container: 'hccDistributionChart',
                    data: primaryData.hccData.ethnicityDistribution,
                    chartTitle: 'Ethnicity',
                    chartSize: chartSize
                });
                $('#hcc-distribution-N').text(commaSeperatedNumber(primaryData.hccData.uniqueHCCPatientCount));
                $('#hcc-distribution-TotalN').text(commaSeperatedNumber(primaryData.hccData.totalHCCPatientCount));
              var PerN = (primaryData.hccData.uniqueHCCPatientCount / primaryData.hccData.totalHCCPatientCount) * 100;
              $("#hcc-distribution-PerN").text(parseInt(PerN) + '%');
            }, 100);
            executeComparativeHCCDistributionRender(params);
        }
    });
}


let executeComparativeHCCDistributionRender = (params) => {
    params.database = getReverseSelectedDatabase();

    Meteor.call('getHCCDistributionData', params, function (error1, results) {
        if (error1) {
            console.log(error1);
            secondaryData.hccData = [];
        } else {
            secondaryData.hccData = JSON.parse(LZString.decompress(results));
            //console.log(secondaryData);
            setTimeout(function() {
            $('#hccToggleChart').show();
            },100);
        }
    });
}

let DrawHCCDistributionChart = ({ container, data, chartTitle, chartSize }) => {

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: chartSize.height,
            width: chartSize.width,
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        lang: {
            thousandsSep: ','
        },
        // colors: ['#fc4f30','#30a2da'],
        credits: {
            enabled: false
        },
        xAxis: {
            type: 'category',
            title: {
                text: chartTitle
            },
            labels: {
                //rotation: chartSize.rotation,
                style: {
                    fontSize: '11px',
                    fontFamily: 'Open Sans,sans-serif'
                }
            }
        },
        tooltip: {
            formatter: function () {
                let html = '<div class="customC3ToolTip">';
                html += '<div class="customC3ToolTip-Header">' +
                    '<div><b>' + chartTitle +'</b> - ' + this.key + '</div>' +
                    '</div><br>';
                html += '<div class="customC3ToolTip-Body"><div><div style="height:10px;width:10px;display:inline-block;background-color:' + this.point.color + '"></div>Patient Count: ' + commaSeperatedNumber(this.y) + '</div><br />';
                html += '<div class="customC3ToolTip-Body"><div><div style="height:10px;width:10px;display:inline-block;background-color:' + this.point.color + '"></div>Patient Percentage: ' + commaSeperatedNumber(this.point.patientPercentage) + '%</div><br />'+
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        yAxis: {
            title: {
                text: 'Patient Count'
            },
        },
        legend: {
            enabled: false
        },
        series: [{
            name: "patient count",
            data: data
        }],
        plotOptions: {
            column: {
                stacking: 'normal',
                colorByPoint: true,
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        //return this.point.patientPercentage + ' %';
                        return commaSeperatedNumber(this.y);
                        //commaSeperatedNumber(parseInt(this.point.patientPercentage));
                    },
                    verticalAlign: 'top',
                    shadow: false,
                    style: {
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: 'gray'
                    }
                }
            }
        },

    });
}



let plotComparisionDataCharts = ({ plottingData, primaryData, secondaryData, desc }) => {

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    let phsContainer = 'primaryDataViewSection',
        imsContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';

    let chartSize = {};
    chartSize.height = 500;
    chartSize.width = 530;
    // chartSize.rotation = -90;

    //empty the containers
    $('#' + imsContainer).empty();
    $('#' + phsContainer).empty();
    console.log(primaryData.symptomsData);
    switch (plottingData) {

        case 'Ethnicity':
            chartTypeLabel = 'Hepatocellular Carcinoma Distribution';
            DrawHCCDistributionChart({
                container: phsContainer,
                data: primaryData.hccData.ethnicityDistribution,
                chartTitle: 'Ethnicity',
                chartSize: chartSize
            });
            DrawHCCDistributionChart({
                container: imsContainer,
                data: secondaryData.hccData.ethnicityDistribution,
                chartTitle: 'Ethnicity',
                chartSize: chartSize
            });
            break;
        case 'Genotype':
        chartTypeLabel = 'Hepatocellular Carcinoma Distribution';
        DrawHCCDistributionChart({
            container: phsContainer,
            data: primaryData.hccData.genotypeDistribution,
            chartTitle: 'Genotype',
            chartSize: chartSize
        });
        DrawHCCDistributionChart({
            container: imsContainer,
            data: secondaryData.hccData.genotypeDistribution,
            chartTitle: 'Genotype',
            chartSize: chartSize
        });
        break;
        case 'Cirrhosis':
        chartTypeLabel = 'Hepatocellular Carcinoma Distribution';
        DrawHCCDistributionChart({
            container: phsContainer,
            data: primaryData.hccData.cirrhosisDistribution,
            chartTitle: 'Cirrhosis',
            chartSize: chartSize
        });
        DrawHCCDistributionChart({
            container: imsContainer,
            data: secondaryData.hccData.cirrhosisDistribution,
            chartTitle: 'Cirrhosis',
            chartSize: chartSize
        });
        break;
        case 'FibStages':
            chartTypeLabel = 'Hepatocellular Carcinoma Distribution';
            DrawHCCDistributionChart({
                container: phsContainer,
                data: primaryData.hccData.fibrosureStageDistribution,
                chartTitle: 'Fib-Stages',
                chartSize: chartSize
            });
            DrawHCCDistributionChart({
                container: imsContainer,
                data: secondaryData.hccData.fibrosureStageDistribution,
                chartTitle: 'Fib-Stages',
                chartSize: chartSize
            });
            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}