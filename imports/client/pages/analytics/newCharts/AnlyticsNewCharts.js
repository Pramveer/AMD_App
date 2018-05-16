import {
    Template
} from 'meteor/templating';
import './AnlyticsNewCharts.html';

Template.AnlyticsNewCharts.onCreated(function() {
    var self = this;
    this.loading = new ReactiveVar(false);
    this.noData = new ReactiveVar(false);

    let params = {}; //getCurrentPopulationFilters();
    //params['fdaCompliant'] = "all";

    //self.loading.set(true);
    executeChartsRender(params, self);
    Template.AnlyticsNewCharts.executeCareFailureChart();
});


Template.AnlyticsNewCharts.rendered = function() {
    renderPayerMixobservedChart();
}
Template.AnlyticsNewCharts.helpers({
    'isLoading': function() {
        return false; //Template.instance().loading.get();
    },
    'noDataFound': function() {
        return false; //Template.instance().noData.get();
    },
});

Template.AnlyticsNewCharts.events({


});


let executeChartsRender = (params, tempateObj) => {
    console.log("Oveserved and Estimated Starts rendered.");

    tempateObj.loading.set(false);
    tempateObj.noData.set(false);
    // renderPayerMixobservedChart();


}

let renderPayerMixobservedChart = () => {

    let data = { "COMMERCIAL": { "2010": 53, "2011": 39, "2012": 27, "2013": 15, "2014": 13, "2015": 16, "2016": 1 }, "MEDICAID": { "2010": 65, "2011": 22, "2012": 34, "2013": 12, "2014": 29, "2015": 15, "2016": 6 }, "MEDICARE": { "2010": 22, "2011": 5, "2012": 2, "2013": 1, "2014": 2, "2015": 3, "2016": 1 } };
    let categories = [];
    for (let key in data["COMMERCIAL"]) {
        categories.push(key);
    }
    let chartData = [];
    for (let key in data) {
        let json = {};
        json['name'] = key;
        let keyData = data[key];
        let dkey = [];
        for (let kt in keyData) {
            dkey.push(keyData[kt]);
        }
        json['data'] = dkey;
        json['stack'] = 'Observed';
        chartData.push(json);
    }

    Highcharts.chart('newChartPayerMix', {

        chart: {
            type: 'column'
        },

        title: {
            text: ''
        },

        xAxis: {
            categories: categories
        },
        colors: ['#ecf0f1', '#3498db', '#2980b9'],
        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: 'No  of Patients(%)'
            }
        },

        tooltip: {
            formatter: function() {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return this.y + "%"
                    }
                }
            }
        },
        series: chartData
            // series: [{
            //     name: 'Commercial',
            //     data: [69, 59, 27],
            //     stack: 'Observed'
            // }, {
            //     name: 'Medicaid',
            //     data: [11, 14, 21],
            //     stack: 'Observed'
            // }, {

        //     name: 'Medicare',
        //     data: [20, 27, 52],
        //     stack: 'Observed'
        // },{ 
        //         linkedTo:':previous',
        //     name: 'Commercial',
        //     data: [70, 60, 50],
        //     stack: 'National'
        // }, {
        //         linkedTo:':previous',
        //     name: 'Medicaid',
        //     data: [5, 10, 15],
        //     stack: 'National'
        // }, {
        //         linkedTo:':previous',
        //     name: 'Medicare',
        //     data: [25, 30, 35],
        //     stack: 'National'
        // }]
    });
}

let renderCareFailureChart = (careFailurechartData) => {
    Highcharts.chart('divRateFailure', {

        chart: {
            type: 'column'
        },

        title: {
            text: ''
        },
        xAxis: {
            categories: careFailurechartData.Categories
        },
        colors: ['#ecf0f1', '#3498db', '#2980b9'],
        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: 'No  of Patients'
            }
        },

        tooltip: {
            /*  formatter: function() {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
        }*/
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true
                        /*,
                                            formatter: function() {
                                                return this.y + "%"
                                        }*/
                }
            }
        },
        series: careFailurechartData.CareFailureData
    });
}

//fetch data from server
Template.AnlyticsNewCharts.executeCareFailureChart = (flag) => {
    let medication = '';
    let params = getCurrentPopulationFilters();

    Meteor.call('getCareFailureChartData', params, function(error1, results) {
        if (error1) {} else {
            let decompressed_object = LZString.decompress(results);
            result = JSON.parse(decompressed_object);
            console.log(result.chartsData);
            renderCareFailureChart(result.chartsData);
        }
    });
}