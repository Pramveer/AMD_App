/*
 *   This function creates chart to Display Total Saving or Expenses for Cirrhosis and NonCirrhosis Patients.
 *   containerName is either id or className where we want to render the chart and data is Filtered dataset.
 *   yAxisPlotCond - Y axis plot condition. It tells us whether we want to show Savings of Expenses on the Y Axis.
 */
cirrhosisVsNoncirrhosisChart = function(containerName, data, yAxisPlotCond, sizeParams) {
    var chartData = [];

    if (!data || data.length == 0) {
        //check for no data found
        $(containerName).html('<div class="providerNoDataFound">No Data Found</div>');
        return;
    } else {

        // Followin is the way to convert the dataset into the required json format.
        var cirrhosisCount = 0,
            cirr_expenses = 0,
            cirr_savings = 0;
        var nonCirrhosisCount = 0,
            nonCirr_expenses = 0,
            nonCirr_savings = 0;
        for (var i = 0; i < data.length; i++) {
            if ( (data[i]['category_name'].indexOf('cirrhosis') > -1) || (data[i]['category_name'].indexOf('Cirrhosis') > -1 ) ) {
                cirrhosisCount += data[i]['count'];
                cirr_savings += parseInt(data[i]['savings']);
                cirr_expenses += parseInt(data[i]['total_cost']);
            } else {
                nonCirrhosisCount += data[i]['count'];
                nonCirr_savings += parseInt(data[i]['savings']);
                nonCirr_expenses += parseInt(data[i]['total_cost']);
            }
        }

        chartData = [{
            "name": "Cirrhosis",
            "population": cirrhosisCount,
            "savings": cirr_savings,
            "total_cost": cirr_expenses
        }, {
            "name": "Non Cirrhosis",
            "population": nonCirrhosisCount,
            "savings": nonCirr_savings,
            "total_cost": nonCirr_expenses
        }, ];

    }


    //
    //  ==================== Chart using C3.js Library  =====================================
    //chart

    // pattern: [ '#84BFA4 ', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91' , '#D1BCF7', '#809FBC', '#5A6D8D'];

    var xColumn = "name";
    var yColumn = yAxisPlotCond ? yAxisPlotCond : "savings";
    var YAxisLabelText = yColumn == 'total_cost' ? 'Projected Expenses' : 'Projected Savings';

    d3.select(containerName).selectAll("*").remove();

    var chart = c3.generate({
        bindto: containerName,
        data: {
            json: chartData,
            type: "bar",

            keys: {
                x: xColumn, // it's possible to specify 'x' when category axis
                value: [yColumn],
            },
            order: 'null',
            labels: {
                format: function(v, id, i, j) {
                    if (i != undefined && containerName == "#subpopulationChartsPopup-container")
                        return commaSeperatedNumber(chartData[i] == undefined ? 0 : chartData[i].population);
                },
            },
            color: function(color, d) {
                // d will be 'id' when called for legends
                //console.log(d);
                if (typeof d === 'object') {
                    if (chartData[d.index].name == "Cirrhosis")
                        return '#abd6ba';
                    // return '#809FBC';
                    else {
                        return '#2e7e97';

                        //  return '#5A6D8D';
                    }
                }
                //return d.id && d.id === 'data3' ? d3.rgb(color).darker(d.value / 150) : color;
            }
        },
        size: {
            height: sizeParams ? sizeParams.height : 254,
            width: sizeParams ? sizeParams.width - 150 : 600
        },
        padding: {
            top: 15
        },
        axis: {
            x: {
                type: 'category',
                /*label: {
                    text: 'Genotypes',
                    position: 'outer-center'
                } */
            },
            y: {
                tick: {
                    //count: 5,
                    inner: true,
                    format: function(d) {
                        if (d) {

                            /// We are using Si formate to convert the value in appropriate format.
                            // If the value is greater or equal to 1000 than it means that after converting it using the siFormat,
                            // it will have an alphabet at the end like 1000 will become 1k or 1000000 will become 1M.
                            var str = siFormat(d).replace("G", "B");
                            d = Math.abs(d);

                            if (d >= 1000) {
                                var res = str.substring(str.length - 1, str.length);
                                var val = Math.round(parseInt(str.replace(res, "")));
                                return val + res;
                            } else {
                                return Math.round(str);
                            }
                        }
                        return d;
                    },
                },

                label: {
                    text: YAxisLabelText,
                    position: 'outer-middle'
                },

            }
        },
        bar: {
            width: {
                ratio: 0.5
            }
        },
        color: {
            // pattern: ["#809FBC", "#5A6D8D"]
            pattern: ["#abd6ba", "#2e7e97"]
        },
        legend: {
            show: false,
            position: 'right'
                // position:'inset',
                //         inset: {
                //                 anchor: 'top-right',
                //                 x: -165,
                //                 y: 10,
                //                 step: 10

            //         }
        },
        tooltip: {
            grouped: false,

            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var dataObj = d[0];
                var countValue = 0,
                    id = dataObj.id;
                var filterData = chartData.filter(function(rec) {
                    return rec[id] == dataObj.value;
                });

                var $$ = this,
                    config = $$.config,
                    bgcolor,
                    // bgcolor = filterData[0]['name'] == "Cirrhosis" ? "#809FBC" : "#5A6D8D";
                    bgcolor = filterData[0]['name'] == "Cirrhosis" ? "#abd6ba" : "#2e7e97";

                countValue = filterData[0]['population'];

                var html = '',
                    valueLabel = yColumn == 'savings' ? 'Savings' : 'Expenses';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + filterData[0]['name'] + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + commaSeperatedNumber(countValue) + '</div>' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div> ' + valueLabel + ': $ ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },

    });

    d3.select(containerName).insert('div')
        .attr('class', 'legend').style('float', 'right').style('margin-top', sizeParams ? '135px' : '110px').style('margin-right', sizeParams ? '108px' : '0px')
        .insert('ul').attr('class', 'list-group').style('list-style', 'none').style('text-align','left')
        .selectAll('span')
        .data(chartData)
        .enter().append('li')
        .append('div').attr('class', 'legend-label')
        .attr('data-id', function(id) {
            return id.name;
        })
        .append('div', '.legend-label').style('font-size', sizeParams ? '14px' : '11px')
        .html(function(id) {
            var data = chart.data(id);
            return id.name;
        })
        .on('mouseover', function(id, i) {
            d3.select(containerName + ' .c3-event-rect-' + i).attr('opacity', 0.1);
            chart.focus(chartData);
        })
        .on('mouseout', function(id, i) {
            d3.select(containerName + ' .c3-event-rects .c3-event-rect-' + i).attr('opacity', 1);
            chart.revert();
        })
        .insert('div', '.legend-label').style('width', sizeParams ? '14px' : '10px').style('height', sizeParams ? '14px' : '10px').style('display', 'inline-block').style('float', 'left').style('margin-top', '3px').style('margin-right', '5px')
        .each(function(id) {
            d3.select(this).style('background-color', function(id) {
                if (id.name == "Cirrhosis") return '#abd6ba';
                else return '#2e7e97'
            });
        })
        .html(function(id) {
            return '&nbsp';
        });

    chart.resize({ width: sizeParams ? sizeParams.width : 520, height: sizeParams ? sizeParams.height : 254 });
}




// Use a modified SI formatter that uses "B" for Billion.
var siFormat = d3.format("s");
