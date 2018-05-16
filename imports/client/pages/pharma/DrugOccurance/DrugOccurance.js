import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './DrugOccurance.html';
import * as pharmaLib from '../pharmaLib.js';

let pharmaData = [];
let dummyMedication = [];

Template.DrugOccurance.onCreated(function() {
    // pharmaData = Pinscriptive['pharma']['drugfulldata'];
    //var self = this;
    pharmaLib.showChartLoading();
    //let params = {};
    //check for existing filterif any
    // if (pharmaLib.isSessionFilterSet()) {
    //     params = pharmaLib.getFormattedParamsSession();
    // } else if (Pinscriptive.Filters) {
    //     params = pharmaLib.getCurrentPopulationFilters();
    // } else {
    //     params = pharmaLib.getFormattedParamsSession();
    // }

    //set pharma header
    // pharmaLib.setPharmaHeader();
    //fetch data
    Template.DrugOccurance.fetchAndRenderData();
});

Template.DrugOccurance.rendered = function() {
    //hide the show patients list icon
    $('.globalshowPatientPharma').hide();
    //set filter on cohort menu
    pharmaLib.setAdvancedSearchFilters();
    highLightTab('Pharma');
    //set header of pharma
    // pharmaLib.setPharmaHeader();
    //Praveen 03/06/2017 Removed commented code


}


Template.DrugOccurance.events({
    'click .js-comparativeEngine': function(e) {
        renderComaparativeOptionsView();
    }

});


Template.DrugOccurance.helpers({

});


let renderOtherMedicineOccurance = ({ medicine, data }) => {
    // console.log("*** renderOtherMedicineOccurance Today***");
    // console.log(data.AllMedicineOccuranceData);
    let pharmaDataOtherMedicines = [];
    let filtereddrug = [];
    let chartData = [];

    let container = "#pharma_medicationcooccur";
    d3.select(container).selectAll("*").remove();

    let chart = c3.generate({
        bindto: container,
        padding: {
            top: 20,
            left: 60,
            bottom: 20
        },
        bar: {
            width: {
                ratio: 0.85
            }
        },
        size: {
            height: 400,
            width: 950
        },
        color: {
            pattern: ['#2ca02c', '#d62728', '#ff7f0e', '#bcbd22', '#9467bd', '#1f77b4', '#e95a52', '#8c564b',
                '#f1cb6a', '#e377c2', '#17becf', '#dbdb8d', "#676767", '#e377c2', '#ff9896', "#929FA8", "#97E0E3",
                "#FBDE97", '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#c49c94', '#2e7e97',
                '#f7b6d2', '#7f7f7f', '#c7c7c7', '#17becf', '#9edae5', '#aec7e8', '#ff7f0e', '#ffbb78',
                '#2ca02c'
            ]

        },
        data: {
            json: data.AllMedicineOccuranceData,
            keys: {
                x: 'drugName', // specify that the "name" key is the x value
                value: data.groupLabel // specify that the "age" key is the y value
            },
            groups: [data.groupLabel],
            type: 'bar',
            order: null,
            labels: {
                format: function(v, id, i, j) {
                    let labelv = '';
                    if (i != undefined && j == data.groupLabel.length - 1) {
                        return data.AllMedicineOccuranceData[i]['percentage'] + '%';
                        // return commaSeperatedNumber(data.AllMedicineOccuranceData[i]['total']) + '(' + data.AllMedicineOccuranceData[i]['percentage'] + '%)';
                    }

                }
            }
        },
        axis: {
            rotated: false,
            x: {
                type: 'category',
                label: {
                    text: 'Medication Name',
                    position: 'center'
                }
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                }
            }
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#2ca02c', '#d62728', '#ff7f0e', '#bcbd22', '#9467bd', '#1f77b4', '#e95a52', '#8c564b',
                    '#f1cb6a', '#e377c2', '#17becf', '#dbdb8d', "#676767", '#e377c2', '#ff9896', "#929FA8", "#97E0E3",
                    "#FBDE97", '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#c49c94', '#2e7e97',
                    '#f7b6d2', '#7f7f7f', '#c7c7c7', '#17becf', '#9edae5', '#aec7e8', '#ff7f0e', '#ffbb78',
                    '#2ca02c'
                ];

                let dataObj = d[0];
                console.log(dataObj);
                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + dataObj.id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patient Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        legend: {
            show: true,
            position: 'right'
        }
    });
    // BindDrugCounts(tabledata);
}

let renderGenoTypeMedicineOccurance = ({ data, genotypeGroup, chartTotal }) => {
    // console.log(chartTotal);
    let container = "#pharma_GenotypeWiseSingleCombinedBar";
    d3.select(container).selectAll("*").remove();
    var chart = c3.generate({
        data: {
            x: 'x',
            columns: data,
            type: 'bar',
            groups: [genotypeGroup],
            order: null,
            labels: {
                format: function(v, id, i, j) {
                    // console.log(id, i, j);
                    if (i != undefined && j == genotypeGroup.length - 1 && id != undefined)
                        return commaSeperatedNumber(chartTotal[0][i + 1]);
                }
            }
        },
        padding: {
            top: 10,
            bottom: 20,
        },
        size: {
            height: 400,
            width: 550
        },
        color: {
            pattern: ['#2ca02c', '#d62728', '#ff7f0e', '#bcbd22', '#9467bd', '#1f77b4', '#e95a52', '#8c564b',
                '#f1cb6a', '#e377c2', '#17becf', '#dbdb8d', "#676767", '#e377c2', '#ff9896', "#929FA8", "#97E0E3",
                "#FBDE97", '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#c49c94', '#2e7e97',
                '#f7b6d2', '#7f7f7f', '#c7c7c7', '#17becf', '#9edae5', '#aec7e8', '#ff7f0e', '#ffbb78',
                '#2ca02c'
            ]

        },
        axis: {
            rotated: false,
            x: {
                type: 'category',
                label: {
                    text: 'Genotype',
                    position: 'center'
                }
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                }
            }
        },
        bar: {
            width: {
                ratio: 0.8 // this makes bar width 50% of length between ticks
            }
        },

        bindto: container,
        legend: {
            show: false
        }
    });
    /*
        let chart = c3.generate({
            bindto: container,
            padding: {
                top: 20,
                left: 60,
                bottom: 20
            },
            bar: {
                width: {
                    ratio: 0.85
                }
            },
            size: {
                height: 400,
                width: 950
            },
            color: {
                pattern: ['#2ca02c', '#d62728', '#ff7f0e', '#bcbd22', '#9467bd', '#1f77b4', '#e95a52', '#8c564b',
                    '#f1cb6a', '#e377c2', '#17becf', '#dbdb8d', "#676767", '#e377c2', '#ff9896', "#929FA8", "#97E0E3",
                    "#FBDE97", '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#c49c94', '#2e7e97',
                    '#f7b6d2', '#7f7f7f', '#c7c7c7', '#17becf', '#9edae5', '#aec7e8', '#ff7f0e', '#ffbb78',
                    '#2ca02c'
                ]

            },
            data: {
                json: data.AllMedicineOccuranceData,
                keys: {
                    x: 'drugName', // specify that the "name" key is the x value
                    value: data.groupLabel // specify that the "age" key is the y value
                },
                groups: [data.groupLabel],
                type: 'bar',
                order: null,
                labels: {
                    format: function(v, id, i, j) {
                        let labelv = '';
                        if (i != undefined && j == data.groupLabel.length - 1) {
                            return commaSeperatedNumber(data.AllMedicineOccuranceData[i]['total']);
                        }

                    }
                }
            },
            axis: {
                rotated: false,
                x: {
                    type: 'category',
                    label: {
                        text: 'Medication Name',
                        position: 'center'
                    }
                },
                y: {
                    label: {
                        text: 'Patient Count',
                        position: 'middle'
                    }
                }
            },
            tooltip: {
                grouped: false,
                contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                    var colors = ['#2ca02c', '#d62728', '#ff7f0e', '#bcbd22', '#9467bd', '#1f77b4', '#e95a52', '#8c564b',
                        '#f1cb6a', '#e377c2', '#17becf', '#dbdb8d', "#676767", '#e377c2', '#ff9896', "#929FA8", "#97E0E3",
                        "#FBDE97", '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#c49c94', '#2e7e97',
                        '#f7b6d2', '#7f7f7f', '#c7c7c7', '#17becf', '#9edae5', '#aec7e8', '#ff7f0e', '#ffbb78',
                        '#2ca02c'
                    ];

                    let dataObj = d[0];

                    let html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div>' + dataObj.id + '</div>' +
                        '</div>' +
                        '<div class="customC3ToolTip-Body">' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patient Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                        '</div>' +
                        '</div>';
                    return html;
                }
            },
            legend: {
                show: true,
                position: 'right'
            }
        });
        */
}



let renderOtherMedicineOccuranceSingle = ({ medicine, data }) => {
    //console.log("****renderOtherMedicineOccuranceSingle****");
    let pharmaDataOtherMedicines = [];
    let filtereddrug = [];
    let chartData = [];
    //console.log(pharmaData);

    // console.log(tabledata);
    let container = "#pharma_medicationcooccur";
    d3.select(container).selectAll("*").remove();

    let chart = c3.generate({
        bindto: container,
        padding: {
            top: 20,
            left: 190
        },
        bar: {
            width: {
                ratio: 0.85
            }
        },
        size: {
            height: 400,
            width: 1050
        },
        color: {
            pattern: ['#809FBC', '#5A6D8D', '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']

        },
        data: {
            json: data.singleMedicineOccuranceData,
            keys: {
                x: 'drugName', // specify that the "name" key is the x value
                value: ["count"] // specify that the "age" key is the y value
            },
            type: 'bar',
            color: function(inColor, data) {
                var colors = ['#809FBC', '#5A6D8D', '#84BFA4', '#B4D9C4', '#BDB76B', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

                if (data.index !== undefined) {
                    return colors[data.index];
                }
                return inColor;
            },
            labels: {
                format: function(v, id, i, j) {
                    let labelv = '';
                    if (i != undefined) {
                        return data.singleMedicineOccuranceData[i]['percentage'] + '%';
                        // return commaSeperatedNumber(v) + '(' + data.singleMedicineOccuranceData[i]['percentage'] + '%)';
                    }
                }
            }
        },
        axis: {
            rotated: false,
            x: {
                type: 'category',
                label: {
                    text: 'Medication Name',
                    position: 'center'
                }
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                }
            }
        },
        tooltip: {
            grouped: false,
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#809FBC', '#5A6D8D', '#84BFA4', '#B4D9C4', '#BDB76B', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

                let dataObj = d[0];

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + data.singleMedicineOccuranceData[dataObj.index].drugName + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patient Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        legend: {
            show: false
        }
    });
    // BindDrugCounts(tabledata);
}


let renderSingleCombinedOccurancePerCirrhosis = ({ data }) => {
    // console.log(data.CirrhosisWiseSingleCombined);
    // console.log(data.CirrhosisWiseSingleCombinedDrillDown);

    let container = "pharma_medicationSingleCombinedCirrhosis";
    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: 400,
            width: 550,
            zoomType: 'y'
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Cirrhosis'
            }
        },
        subtitle: {
            text: 'Click the bar to view details. '
        },
        legend: {
            enabled: true
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
                }
            }
        },
        colors: ["#f1cb6a", "#69bae7"],
        series: data.CirrhosisWiseSingleCombined,
        drilldown: {
            series: data.CirrhosisWiseSingleCombinedDrillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: 0
                },
                theme: {
                    fill: '#ee4118',
                    'stroke-width': 0,
                    stroke: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    r: 2,
                    states: {
                        hover: {
                            fill: '#ee4118'
                        },
                        select: {
                            stroke: '#039',
                            fill: '#ee4118'
                        }
                    },
                    plotShadow: true,
                    boxShadow: {
                        color: 'grey',
                        width: 10,
                        offsetX: 1,
                        offsetY: 1
                    }
                }

            }
        }
    });
}


let renderTreatmentWiseSingleCombinedOccurance = ({ data }) => {
    // console.log(data.TreatmentWiseSingleCombined);
    // console.log(data.TreatmentWiseSingleCombinedDrillDown);

    let container = "pharma_medicationSingleCombinedTreatmentPeriod";
    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: 400,
            width: 550,
            zoomType: 'y'
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Treatment Period(in weeks)'
            },
            labels: {
                rotation: -45
            }
        },
        subtitle: {
            text: 'Click the bar to view details. '
        },
        legend: {
            enabled: true
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
                }
            }
        },
        colors: ["#e95a52", '#2e7e97'],
        series: data.TreatmentWiseSingleCombined,
        drilldown: {
            series: data.TreatmentWiseSingleCombinedDrillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: 0
                },
                theme: {
                    fill: '#ee4118',
                    'stroke-width': 0,
                    stroke: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    r: 2,
                    states: {
                        hover: {
                            fill: '#ee4118'
                        },
                        select: {
                            stroke: '#039',
                            fill: '#ee4118'
                        }
                    },
                    plotShadow: true,
                    boxShadow: {
                        color: 'grey',
                        width: 10,
                        offsetX: 1,
                        offsetY: 1
                    }
                }

            }
        }
    });
}


let renderMedicationWiseSingleCombinedOccurance = ({ data }) => {
    // console.log(data.MedicationWiseSingleCombined);
    // console.log(data.TreatmentWiseSingleCombinedDrillDown);

    let container = "pharma_medicationSingleCombined";
    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: 400,
            width: 550,
            zoomType: 'y'
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Medication'
            },
            labels: {
                rotation: -45
            }
        },
        subtitle: {
            text: 'Click the bar to view details. '
        },
        legend: {
            enabled: true
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
                }
            }
        },
        colors: ['#2ca02c', '#d62728'],
        series: data.MedicationWiseSingleCombined,
        drilldown: {
            series: data.MedicationWiseSingleCombinedDrillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: 0
                },
                theme: {
                    fill: '#ee4118',
                    'stroke-width': 0,
                    stroke: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    r: 2,
                    states: {
                        hover: {
                            fill: '#ee4118'
                        },
                        select: {
                            stroke: '#039',
                            fill: '#ee4118'
                        }
                    },
                    plotShadow: true,
                    boxShadow: {
                        color: 'grey',
                        width: 10,
                        offsetX: 1,
                        offsetY: 1
                    }
                }

            }
        }
    });
}

let renderSingleCombinedOccuranceFibrosis = ({ data }) => {
    // console.log(data.FibrostageWiseSingleCombinedDrillDown);

    let container = "pharma_medicationSingleCombinedFibrosis";
    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: 400,
            width: 550,
            zoomType: 'y'
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Fib-4'
            }
        },
        subtitle: {
            text: 'Click the bar to view details. '
        },
        legend: {
            enabled: true
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
                }
            }
        },
        colors: ['#ff7f0e', '#bcbd22'],
        series: data.FibrostageWiseSingleCombined,
        drilldown: {
            series: data.FibrostageWiseSingleCombinedDrillDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: 0
                },
                theme: {
                    fill: '#ee4118',
                    'stroke-width': 0,
                    stroke: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    r: 2,
                    states: {
                        hover: {
                            fill: '#ee4118'
                        },
                        select: {
                            stroke: '#039',
                            fill: '#ee4118'
                        }
                    },
                    plotShadow: true,
                    boxShadow: {
                        color: 'grey',
                        width: 10,
                        offsetX: 1,
                        offsetY: 1
                    }
                }

            }
        }
    });
}


let renderSingleCombinedOccurance = ({ data }) => {
    // console.log(data.jsonsinglecombinedgroupDrilDown);
    // console.log(data.SingleCombineDrug);

    let container = "pharma_medicationSingleCombinedPie";
    Highcharts.chart(container, {
        chart: {
            type: 'pie',
            height: 400,
            width: 550
        },
        title: {
            text: null
        },
        subtitle: {
            text: 'Click the slices to view details. '
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y:,0.0f}' //,
                        // distance: -35,
                        // style: {
                        //     color: 'white'
                        // }
                },
                // showInLegend: true
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:black">{point.name}</span>: <b>{point.y:,0.0f}</b><br/>'
        },
        series: [{
            name: 'Drug',
            colorByPoint: true,
            data: data.SingleCombineDrug

        }],
        drilldown: {
            series: data.jsonsinglecombinedgroupDrilDown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 24,
                    x: 0
                },
                theme: {
                    fill: '#ee4118',
                    'stroke-width': 0,
                    stroke: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    r: 2,
                    states: {
                        hover: {
                            fill: '#ee4118'
                        },
                        select: {
                            stroke: '#039',
                            fill: '#ee4118'
                        }
                    },
                    plotShadow: true,
                    boxShadow: {
                        color: 'grey',
                        width: 10,
                        offsetX: 1,
                        offsetY: 1
                    }
                }

            }

        }
    });

    /* d3.select(container).selectAll("*").remove();

     var chart = c3.generate({
         bindto: container,
         data: {
             json: data.SingleCombineDrug,
             keys: {
                 value: data.SingleCombineDrugKeys
             },
             type: 'pie'
         },
         size: {
             height: 295,
             width: 600
         },
         legend: {
             show: true
         },
         color: {
             pattern: ['#2e7e97', '#e95a52']
         },
         tooltip: {
             grouped: false,
             contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                 var colors = ['#2e7e97', '#e95a52'];
                 let dataObj = d[0];
                 console.log(dataObj);
                 let html = '';
                 html = '<div class="customC3ToolTip">' +
                     '<div class="customC3ToolTip-Header">' +
                     '<div>' + dataObj.id + '</div>' +
                     '</div>' +
                     '<div class="customC3ToolTip-Body">' +
                     '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patient Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                     '</div>' +
                     '</div>';
                 return html;
             }
         }
     });*/

}
let rendersuccessRateChart = (container, data, keyword) => {


    //set the value on tooltip
    //$('#'+keyword+'SuccessRateCount').html(commaSeperatedNumber(data.total));

    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: data.key,
            crosshair: true,
            title: {
                text: keyword
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Success Rate(%)'
            }
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        credits: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                // return this.series.name + '<b/>  <b>' + '' + '</b> :  ' + Highcharts.numberFormat(this.y, 2) + "%";
                return '  <b>' + this.series.name + '</b> :  ' + Highcharts.numberFormat(this.y, 2) + "%<br> <b>Patient Count : </b>" + this.point.undetectedCount + "<br> <b>Total Count : </b>" + this.point.totalCount;
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return Highcharts.numberFormat(this.y, 2) + "%";
                    }
                }
            }
        },
        series: data.data
    });
}


let DrawCharts = ({ dataSuccessRate }) => {
    //Praveen 03/06/2017 added tooltipinfo patient count
    let container = "pharma_medicationSuccessRate";
    $('#medicationSuccessRateCount').html(commaSeperatedNumber(dataSuccessRate.total));

    Highcharts.chart(container, {
        chart: {
            type: 'column',
            height: 400,
            width: 550
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        xAxis: {
            categories: dataSuccessRate.medicines,
            title: {
                text: 'Medication'
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'Success Rate(%)'
            },
            labels: {
                overflow: 'justify'
            }
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        tooltip: {
            formatter: function() {
                // console.log(this);
                return '  <b>' + this.x + '</b> :  ' + Highcharts.numberFormat(this.y, 2) + "%<br> <b>Patient Count : </b>" + this.point.undetectedCount + "<br> <b>Total Count : </b>" + this.point.totalCount;
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return Highcharts.numberFormat(this.y, 2) + "%";
                    }
                }
            }
        },
        legend: false,
        credits: {
            enabled: false
        },
        series: [{
            data: dataSuccessRate.MedicationPercent
        }]
    });
}

let DrawChartsCirrhosisSuccess = ({ dataSuccessRate }) => {
        // console.log(dataSuccessRate);

        let container = "pharma_cirrhosisCompareSuccessRate";
        Highcharts.chart(container, {
            chart: {
                type: 'column',
                height: 400,
                width: 560
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },
            xAxis: {
                categories: dataSuccessRate.cirrhosis,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Success Rate(%)'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
            tooltip: {
                formatter: function() {
                    return '' + this.x + ':  ' + Highcharts.numberFormat(this.y, 2) + "%<br/> Patient Count : " + Highcharts.numberFormat(this.point.count, 0);
                }
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return Highcharts.numberFormat(this.y, 2) + "%";
                        }
                    }
                }
            },
            legend: false,
            credits: {
                enabled: false
            },
            series: [{
                data: dataSuccessRate.cirrhosisData
            }]
        });
    }
    //function to fetch data from server from filters applied

Template.DrugOccurance.fetchAndRenderData = () => {
    let params = {};
    let medicine = '';
    if (Pinscriptive.Filters) {
        //Praveen 02/20/2017 changed function to reference from common.js pharmaLib.getCurrentPopulationFilters()
        params = getCurrentPopulationFilters();
        medicine = Pinscriptive.Filters.medication ? Pinscriptive.Filters.medication.replace(/'/g, '').toString() : 'all';
    } else {
        medicine = 'all';
    }
    pharmaLib.showChartLoading();
    pharmaLib.setAdvancedSearchFilters();
    pharmaLib.setPharmaHeader();
    //get data for summary tabs
    // templateObj.autorun(function() {
    //meteor call for fetching data
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });

    Meteor.call('getTherapyCoOccuranceData', params, function(error, result) {
        if (error) {
            pharmaLib.hideChartLoading();
        } else {

            Meteor.call('getPharmaCompetitorAnalysisData', params, function(error, result1) {
                if (error) {
                    pharmaLib.hideChartLoading();
                } else {
                    let stringifyResult1 = LZString.decompress(result1);
                    let finalUnCompressedResult1 = JSON.parse(stringifyResult1);
                    let stringifyResult = LZString.decompress(result);
                    let finalUnCompressedResult = JSON.parse(stringifyResult);
                    //  pharmaData = result.pharmaData;
                    // console.log(result.pharmaData1);
                    // Pinscriptive['pharma']['drugfulldata'] = pharmaData;
                    pharmaLib.hideChartLoading();
                    //render charts
                    //let medicine = $("#pharma-medicationDO").val();
                    //set patient count on header


                    // OLD CODE
                    //$('.searchPatientCountHeaderPharma').html(finalUnCompressedResult.TotalN);
                    //Added :13-FEB-2017 Arvind,sigle method to set patient count on cohort menu
                    setCohortPatientCount({ patientCount: finalUnCompressedResult.TotalN });
                    //  Session.set('pharmamedicine',medicine );

                    //check for plotting the valid charts
                    if (medicine && medicine != 'all') {
                        renderOtherMedicineOccuranceSingle({ medicine: medicine, data: finalUnCompressedResult });
                    } else {
                        renderOtherMedicineOccurance({ medicine: medicine, data: finalUnCompressedResult });
                    }
                    //console.log(result1);
                    renderSingleCombinedOccurance({ data: finalUnCompressedResult });
                    renderSingleCombinedOccurancePerCirrhosis({ data: finalUnCompressedResult });
                    renderSingleCombinedOccuranceFibrosis({ data: finalUnCompressedResult });
                    renderTreatmentWiseSingleCombinedOccurance({ data: finalUnCompressedResult });
                    renderMedicationWiseSingleCombinedOccurance({ data: finalUnCompressedResult });
                    renderGenoTypeMedicineOccurance({ data: finalUnCompressedResult.GenotypeWiseSingleCombined, genotypeGroup: finalUnCompressedResult.GroupGenotypeData, chartTotal: finalUnCompressedResult.GenotypeWiseSingleCombinedTotal })
                    rendersuccessRateChart('pharma_cirrhosisCompareSuccessRate', finalUnCompressedResult1.cirrhosisChartDataSuccess, 'Cirrhosis');
                    rendersuccessRateChart('pharma_GenotypeCompareSuccessRate', finalUnCompressedResult1.GenotypeChartDataSuccess, 'Genotype')
                    $('#CirrhosisSuccessRateCount').html(commaSeperatedNumber(finalUnCompressedResult1.cirrhosisChartDataSuccess.total));
                    $('#GenotypeSuccessRateCount').html(commaSeperatedNumber(finalUnCompressedResult1.GenotypeChartDataSuccess.total));
                    DrawCharts({

                        dataSuccessRate: finalUnCompressedResult1.DrugSuccessRate
                    });
                }
            });


        }
    });
    // });
}



// Render for comparativeengine
let renderComaparativeOptionsView = () => {
    var comparativeEngine = new ComparativeEngine({
        tabName: "DrugOccuranceTab-Pharma"
    });

    comparativeEngine.renderCompareOptiosView();
}