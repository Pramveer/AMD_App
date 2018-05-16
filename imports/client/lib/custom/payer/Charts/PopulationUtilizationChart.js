// This Function Creates Utilization Chart with respective to gorups in the popup.
// This chart has been created by taking reference through cure rate chart.
createPopulationUtilizationChart = function(containerName, chartData, sizeParams) {
    var data = [];
    if (!chartData) {
        return;
    } else {

        // Variables used for C3js Data.       
        var groups = [];
        var patientCountKey;
        var totalpatients = 0;
        var barcolor = "#e95a52";

        // Preparing Objects as per the data requirement according to C3.js Stacked Chart.
        for (key in chartData) {
            patientCountKey = key;
            for (cnt = 0; cnt < chartData[key].length; cnt++) {
                var dataobj = {};
                dataobj["utilization"] = chartData[key][cnt].year;
                dataobj[key] = chartData[key][cnt].count;
                totalpatients += chartData[key][cnt].count;
                data.push(dataobj);
            }
            groups.push(key);
        }
        if (containerName == "#myNetworkUtilization")
            barcolor = "#2e7e97";
        else if (containerName == "#populationUtilization")
            barcolor = "#69bae7";
    }
    console.log("************Utilization CHART DATA***************");
    console.log(data);

    d3.select(containerName).selectAll("*").remove();
    if (data.length <= 0) {
        $(containerName).parent().remove();
        return;
    }
    var chart = c3.generate({
        bindto: containerName,
        padding: {
            top: 15,
            right: 60
                // left: 250,
        },
        data: {
            type: 'bar',
            json: data,
            keys: {
                x: 'utilization',
                value: groups
            },
            //groups: [groups],
            order: 'null',
            labels: {
                format: function(v, id, i, j) {
                    if (sizeParams) {
                        return commaSeperatedNumber(v);
                    } else {
                        // Dont Show The tick above each bar.
                    }
                },
            }

        },
        size: {
            height: sizeParams ? sizeParams.height : 220,
            width: sizeParams ? sizeParams.width : 980
        },
        color: {
            pattern: [barcolor, '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
                //pattern: [ '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#D1BCF7', '#809FBC', '#5A6D8D']
        },
        axis: {
            x: {
                type: 'category',
            },
            y: {
                max: ((Math.max.apply(Math, data.map(function(o) {
                    return o["1a"]
                })) < 8) ? 7 : (Math.max.apply(Math, data.map(function(o) {
                    return o["1a"]
                })))),
                min: 0,
                padding: {
                    bottom: 0
                },
                // tick: {
                // format: function(d) {
                //     if (d) {
                //         //Need to improve
                //         //convert value to million scale
                //         // return parseFloat(d / 1000000).toFixed(1);

                //         var str = siFormat(d).replace("G", "B");
                //         if (d >= 1000) {
                //             var res = str.substring(str.length - 1, str.length);
                //             var val = Math.round(parseInt(str.replace(res, "")));
                //             return val + res;
                //         } else {
                //             return Math.round(str);
                //         }
                //         //return d.toFixed(1);
                //     }
                //     return d;
                // }
                // },
                label: {
                    text: 'Patient Count',
                    position: 'outer-middle'
                }
            }
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
        legend: {
            show: true,
            position: 'inset',
            inset: {
                anchor: 'top-right',
                x: -55,
                y: 10,
                step: 10

            }

        },
        tooltip: {
            grouped: false,
            format: {
                title: function(d) {
                    return data[d]['utilization'];
                },
                value: function(value, ratio, id) {
                    value = commaSeperatedNumber(value);
                    return value + ' Patients';
                }
            }
        },
        grid: {
            y: {
                lines: [
                    { value: 0 }
                ]
            }
        }
    });

    // var firstLegend = d3.select(".c3-legend-item");
    // var legendCon = d3.select(firstLegend.node().parentNode);
    // var legendY = parseInt(firstLegend.select('text').attr('y'));
    // d3.select('.legendtextsmall').remove();
    // legendCon
    //     .append('text')
    //     .text('Genotype')
    //     .attr('class', 'legendtextsmall')
    //     .attr('x', -17)
    //     .attr('fill', '#999fa2')
    //     .attr('font-size', '10px')
    //     .attr('y', legendY - 20);
    // if (sizeParams) {
    //     setTimeout(function() {
    //         var firstLegend = d3.select(containerName + " .c3-legend-item");
    //         var legendCon = d3.select(firstLegend.node().parentNode);
    //         var legendY = parseInt(firstLegend.select('text').attr('y'));
    //         d3.select('.legendtext').remove();
    //         d3.select('.legendtextsmall').remove();
    //         legendCon
    //             .append('text')
    //             .text('Genotypes')
    //             .attr('class', 'legendtext')
    //             .attr('x', -26)
    //             .attr('fill', '#999fa2')
    //             .attr('font-size', '13px')
    //             .attr('y', legendY - 20);
    //     }, 200);
    d3.select(containerName).append('div').attr('style', 'margin-bottom:60px;text-align: center;').
    html('<span style="font-size:14px;"><i class="fa fa-user" style="color:#333" aria-hidden="true"></i>' +
        '<span  style="margin-left:10px;color:#333">Total Patients: ' + totalpatients + '</span></span>');
    $('.c3-axis').attr('style', 'font-size:14px');
    $('.c3-axis-y2').remove();
    // $('.ecf-utilizationContainer').css('width', '100%');
    // $(containerName).css('width', parseInt($('.analyticsPatientsPopup-container').css('width')) - 60);
    // $('.groupUtilizationPopup').find('svg').css('width', '100%');
    // $('.c3').css('width', '100%');
    // }
}

// Use a modified SI formatter that uses "B" for Billion.
var siFormat = d3.format("s");