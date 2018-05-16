// Function to create Genotype Vs Cirrhosis Chart
/*
 *   Following function creates a stacked bar chart to represent Saving or Expenses on Cirhosis and NoCirhosis patients as per Genotype.
 *   containerName is either id or className where we want to render the chart and data is Filtered dataset.
 *   yAxisPlotCond - Y axis plot condition. It tells us whether we want to show Savings of Expenses on the Y Axis.
 */
genotypeVsCirrhosisChart = function(containerName, data, yAxisPlotCond, sizeParams) {

    var chartData = [];
    var groups = [];
    var title = [];
    var yColumnData = yAxisPlotCond ? yAxisPlotCond : 'savings';
    var YAxisLabelText = yColumnData == 'savings' ? 'Projected Savings' : 'Projected Expenses';
    totalDisplayPatients = [];
    if (!data || data.length == 0) {
        
        $(containerName).html('<div class="providerNoDataFound">No Data Found</div>');
        return;

        // chartData = [{
        //     "cirrhosis": 877,
        //     "genotype": "1",
        //     "non - cirrhosis": 737
        // }, {
        //     "cirrhosis": 204,
        //     "genotype": "1a",
        //     "non - cirrhosis": 216
        // }, {
        //     "cirrhosis": 1115,
        //     "genotype": "1b",
        //     "non - cirrhosis": 1277
        // }, {
        //     "cirrhosis": 398,
        //     "genotype": "2",
        //     "non - cirrhosis": 473

        // }, {
        //     "cirrhosis": 321,
        //     "genotype": "3",
        //     "non - cirrhosis": 355
        // }, {
        //     "cirrhosis": 149,
        //     "genotype": "4",
        //     "non - cirrhosis": 156
        // }, {
        //     "cirrhosis": 100,
        //     "genotype": "5",
        //     "non - cirrhosis": 74
        // }, {
        //     "cirrhosis": 139,
        //     "genotype": "6",
        //     "non - cirrhosis": 117
        // }];
        // totalDisplayPatients = chartData;
        // groups = ["cirrhosis", "non - cirrhosis"];

        // title = ["1", "1a", "1b", "2", "3", "4", "5", "6"];
    } else {

        // Followin is the way to convert the dataset into the required json format as it is shown above.

        // group by the data by genotypes
        var jsonData = _.groupBy(data, function(record) {
            return record.category_name.split(' ')[0];
        });


        //loop for each data to get genotypes & Count
        for (var key in jsonData) {
            var json = {};
            json['genotype'] = key;

            //push the key in the titles array
            title.push(key);

            var categories = jsonData[key];
            var cirrhosisCount = 0,
                cirr_yColumnData = 0;
            var nonCirrhosisCount = 0,
                nonCirr_yColumnData = 0;
            for (var i = 0; i < categories.length; i++) {
                if ( (categories[i]['category_name'].indexOf('cirrhosis') > -1) || (categories[i]['category_name'].indexOf('Cirrhosis') > -1) ) {
                    cirr_yColumnData += categories[i][yColumnData];
                    cirrhosisCount += categories[i]['count'];
                } else {
                    nonCirr_yColumnData += categories[i][yColumnData];
                    nonCirrhosisCount += categories[i]['count'];
                }
            }
            json['Cirrhosis'] = cirr_yColumnData;
            json['Non-Cirrhosis'] = nonCirr_yColumnData;
            json['cirrhosis_count'] = cirrhosisCount;
            json['nonCirrhosis_count'] = nonCirrhosisCount;
            json['total'] = nonCirrhosisCount + cirrhosisCount;
            totalDisplayPatients.push(json);
            chartData.push(json);
        }
        groups = ["Cirrhosis", "Non-Cirrhosis"];

        // console.log("*********** Required Genotype Vs Cirrhosis Data ***********");
        // console.log(totalDisplayPatients);
    }
    //sort data based on genotype
    chartData.sort(function(a, b) {
        return a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, '');
    });

    title.sort(function(a, b) {
        return a.replace(/\D+/g, '') - b.replace(/\D+/g, '');
    });
    // console.log(chartData);
    d3.select(containerName).selectAll("*").remove();
    var chart = c3.generate({
        bindto: containerName,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'genotype',
                value: groups
            },
            groups: [groups],
            order: 'null',
            labels: {
                format: function(v, id, i, j) {
                    // console.log(totalDisplayPatients[i]);
                    /*  if (j === groups.length - 1) {

                          return commaSeperatedNumber(totalDisplayPatients[i].total);
                          //return v;
                      }*/
                    if (containerName == "#subpopulationChartsPopup-container") {
                        if (i != undefined && j === groups.length - 1) {
                            return commaSeperatedNumber(chartData[i].total);
                        }
                        // else if(totalDisplayPatients[i]['Non-Cirrhosis'] <0 && totalDisplayPatients[i].Cirrhosis >0){
                        //         if(j === 0)
                        //            {
                        //                  return totalDisplayPatients[i].total;
                        //         }
                        //return v;

                        // }
                        else {
                            //return i+'/'+j +'/'+v;
                        }
                    }
                },
            }
            /*onclick: function(d, element) {
                //c3js library have issue sometimes it not handle proper click event for stacked chart
                //if value is not undefined then call method and display data accordingly otherwise not
                if (d.value) {
                    filterByChart(d);
                } else {
                    console.log("improper click and data");
                }
            })*/
        },
        size: {
            height: sizeParams ? sizeParams.height : 234,
            width: sizeParams ? sizeParams.width : 520
        },
        /* padding: {
             top: 15
         },*/
        color: {
            //  pattern: ['#809FBC','#5A6D8D']
            pattern: ['#abd6ba', '#2e7e97']
                //pattern: [ '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91' , '#D1BCF7', '#809FBC', '#5A6D8D']

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
                    format: function(d) {
                        if (d) {
                            // We are using Si formate to convert the value in appropriate format.
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
                }
            }
        },
        bar: {
            width: {
                ratio: 0.9
            }
        },
        legend: {
            show: true,
            position: 'right',
            // inset: {
            //         anchor: 'top-right',
            //         x: -165,
            //         y: 10,
            //         step: 10

            // }
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
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                if (id == 'Cirrhosis')
                    countValue = filterData[0]['cirrhosis_count'];
                else
                    countValue = filterData[0]['nonCirrhosis_count'];

                var html = '',
                    valueLabel = yColumnData == 'savings' ? 'Savings' : 'Expenses';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Genotype: ' + title[dataObj.index] + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + commaSeperatedNumber(countValue) + '</div>' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div> ' + valueLabel + ': $ ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
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
}


// Use a modified SI formatter that uses "B" for Billion.
var siFormat = d3.format("s");

// function sortAlphaNumeric(list){
//     var reA = /[^a-zA-Z]/g;
//     var reN = /[^0-9]/g;
//     function sortAlphaNum(a,b) {
//         var AInt = parseInt(a, 10);
//         var BInt = parseInt(b, 10);

//         if(isNaN(AInt) && isNaN(BInt)){
//             var aA = a.replace(reA, "");
//             var bA = b.replace(reA, "");
//             if(aA === bA) {
//                 var aN = parseInt(a.replace(reN, ""), 10);
//                 var bN = parseInt(b.replace(reN, ""), 10);
//                 return aN === bN ? 0 : aN > bN ? 1 : -1;
//             } else {
//                 return aA > bA ? 1 : -1;
//             }
//         }else if(isNaN(AInt)){
//             return 1;
//         }else if(isNaN(BInt)){
//             return -1;
//         }else{
//             return AInt > BInt ? 1 : -1;
//         }
//     }
// }


// var newlist = [ 2, 3, "1a", 4, "1b"].sort(sortAlphaNum);
