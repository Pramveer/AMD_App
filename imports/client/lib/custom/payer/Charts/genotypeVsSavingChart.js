// Saving Vs Genotype Chart
/*
 *   This function creates Stacked Chart to represent Savings as per Genotypes in Chart Section.
 *   containerName is either id or className where we want to render the chart and Data is Filtered dataset.
 */
savingVsGenotypeChart = function (containerName, data, sizeParams) {
    if (containerName == "#subpopulationChartsPopup-container") {
        //  $(".subpopulationChartsPopup-back").show();
        $(".subpopulationChartsPopup-message").show();
         $("#subpopulationChartsPopup-footer").show();
    }

    var chartData = [];
    var groups = [];
    var title = [];
    var jsonData = [];
    var totalDisplayPatients = [];
    //if data is empty then use dummy data
    // Following the json format of required data.
    if (!data || data.length == 0) {
         //check for no data found
        $(containerName).html('<div class="providerNoDataFound">No Data Found</div>');
        return;

        // chartData = [{
        //     "1a Experienced": 11252000,
        //     "1a Experienced Partial Response": 0,
        //     "1a Experienced Relapsed": 0,
        //     "1a Experienced cirrhosis": 13722800,
        //     "1a Naive": 6581050,
        //     "1a Naive cirrhosis": 11583100,
        //     "genotype": "1a"
        // },
        // {
        //     "1a Naive cirrhosis": 11583100,
        //     "1b Experienced": 13722800,
        //     "1b Experienced cirrhosis": 13722800,
        //     "1b Naive": 13722800,
        //     "1b Naive cirrhosis": 13722800,
        //     "genotype": "1b"
        // },
        // {
        //     "2 Experienced": 11583100,
        //     "2 Experienced cirrhosis": 13722800,
        //     "2 Naive": 13722800,
        //     "2 Naive cirrhosis": 13722800,
        //     "genotype": "2"
        // },
        // {
        //     "3 Experienced cirrhosis": 13722800,
        //     "3 Naive": 13722800,
        //     "3 Naive cirrhosis": 13722800,
        //     "genotype": "3"
        // },
        // {
        //     "4 Experienced": 13722800,
        //     "4 Experienced cirrhosis": 13722800,
        //     "4 Naive": 13722800,
        //     "4 Naive cirrhosis": 13722800,
        //     "genotype": "4"
        // },
        // {
        //     "5 Experienced": 13722800,
        //     "5 Experienced cirrhosis": 13722800,
        //     "5 Naive": 13722800,
        //     "5 Naive cirrhosis": 13722800,
        //     "genotype": "5"
        // },
        // {
        //     "6 Experienced": 13722800,
        //     "6 Experienced cirrhosis": 13722800,
        //     "6 Naive": 13722800,
        //     "genotype": "6"
        // }
        // ];


        // groups = [
        //     "1a Experienced",
        //     "1a Experienced cirrhosis",
        //     "1a Experienced Partial Response",
        //     "1a Experienced Relapsed",
        //     "1a Naive",
        //     "1a Naive <6 million",
        //     "1a Naive cirrhosis",
        //     "1b Experienced",
        //     "1b Experienced cirrhosis",
        //     "1b Naive",
        //     "1b Naive cirrhosis",
        //     "2 Experienced",
        //     "2 Experienced cirrhosis",
        //     "2 Naive",
        //     "2 Naive cirrhosis",
        //     "3 Experienced",
        //     "3 Experienced cirrhosis",
        //     "3 Naive",
        //     "3 Naive cirrhosis",
        //     "4 Experienced",
        //     "4 Experienced cirrhosis",
        //     "4 Naive",
        //     "4 Naive cirrhosis",
        //     "5 Experienced",
        //     "5 Experienced cirrhosis",
        //     "5 Naive",
        //     "5 Naive cirrhosis",
        //     "6 Experienced",
        //     "6 Experienced cirrhosis",
        //     "6 Naive"
        // ];
        // title = ["1a", "1b", "2", "3", "4", "5", "6"];

    } else {
        //console.log(chartData);
        // Followin is the way to convert the dataset into the required json format as it is shown above.

        // group by the data by genotypes
        jsonData = _.groupBy(data, function (record) {
            return record.category_name.split(' ')[0];
        });
        let formatedData = formatDataForNewChart(jsonData);
        // console.log('Catefory Name ' + formatedData.genotypes);
        //console.log('Ctegory Value ' + formatedData.values);
        // console.log(formatedData);
        var color = ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba', '#FAB4B2', '#C28B91'];
        var chart = c3.generate({
            bindto: containerName,
            data: {
                x: 'genotypes',
                columns: [
                    formatedData.genotypes,
                    formatedData.values
                ],
                type: 'bar',
                labels: {
                    format: function (v, id, i, j) {
                        if (containerName == "#subpopulationChartsPopup-container") {
                            if (i != undefined)
                                return commaSeperatedNumber(formatedData.patientcounts[i + 1]);
                        }
                    }
                },
                onclick: function (options) {
                    var genotype = formatedData.genotypes[options.x + 1];
                    //  getDrillDownData(genotype, jsonData);
                    DrawChart(genotype, jsonData, containerName, sizeParams);
                },
                colors: {
                    values: function (d) {
                        //   console.log(d.index);
                        return color[d.index];
                    },
                },
            },
            size: {
                height: sizeParams ? sizeParams.height : 230,
                width: sizeParams ? sizeParams.width + 200 : 400
            },
            axis: {
                x: {
                    type: 'category'
                },
                y: {
                    tick: {
                        //count: 5,
                        format: function (d) {
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
                        }
                    },
                    label: {
                        text: 'Payer Savings',
                        position: 'outer-middle'
                    }
                }
            },
            legend: {
                show: false
            },
            tooltip: {
                grouped: false,

                // Formating Tooltip to Display Savings & patient count.
                contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                    var definedcolors = ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba', '#FAB4B2', '#C28B91'];
                    var dataObj = d[0],
                        genotype = defaultTitleFormat(dataObj.index),
                        savingValue = Math.round(dataObj.value),
                        patientCount = formatedData.patientcounts[dataObj.index + 1];

                    var $$ = this,
                        config = $$.config,
                        bgcolor;
                    bgcolor = definedcolors[dataObj.index];
                    var html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div>Genotype: ' + genotype + '</div>' +
                        '</div>' +
                        '<div class="customC3ToolTip-Body">' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + commaSeperatedNumber(patientCount) + '</div>' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Savings : $ ' + commaSeperatedNumber(savingValue) + '</div>' +
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

        function DrawChart(genotype, jsonData, containerName, sizeParams) {
            if (containerName == "#subpopulationChartsPopup-container") {
                $(".subpopulationChartsPopup-footer").hide();
                $(".subpopulationChartsPopup-back").show();
                $(".subpopulationChartsPopup-message").show();
                var color = ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba', '#FAB4B2', '#C28B91', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b']
                var formatedCategoryData = getDrillDownData(genotype, jsonData);

                var chart = c3.generate({
                    bindto: containerName,
                    data: {
                        x: 'categoryname',
                        columns: [
                            formatedCategoryData.categoryname,
                            formatedCategoryData.categoryvalues
                        ],
                        type: 'bar',
                        labels: {
                            format: function (v, id, i, j) {
                                if (i != undefined)
                                    return commaSeperatedNumber(formatedCategoryData.categorypatientcounts[i + 1]);
                            }
                        },
                        colors: {
                            categoryvalues: function (d) {
                                //  console.log(d.index);
                                return color[d.index];
                            },
                        },
                        onclick: function (options) {
                            //  console.log(formatedCategoryData.categoryname[options.x + 1]);
                            if (formatedCategoryData.categoryname[options.x + 1] != '') {
                                if (sizeParams)
                                    handleFilterForchart(formatedCategoryData.categoryname[options.x + 1], containerName);
                            } else {
                                console.log('wrong value or event');
                            }
                        }
                    },
                    size: {
                        height: sizeParams ? sizeParams.height : 250,
                        width: sizeParams ? sizeParams.width + 200 : 400
                    },
                    axis: {
                        x: {
                            type: 'category',
                             tick: {
                                rotate: -45,
                                multiline: true
                            },  height: 150 ,
                            label: {
                                text: 'Sub types',
                                position: 'outer-center'
                            }
                        },
                        y: {
                            tick: {
                                //count: 5,
                                format: function (d) {
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
                                }
                            },
                            label: {
                                text: 'Payer Savings',
                                position: 'outer-middle'
                            }
                        }
                    },
                    legend: {
                        show: false
                    },
                    tooltip: {
                        grouped: false,

                        // Formating Tooltip to Display Savings & patient count.
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                            var definedcolors = ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba', '#FAB4B2', '#C28B91'];
                            var dataObj = d[0],
                                genotype = defaultTitleFormat(dataObj.index),
                                savingValue = Math.round(dataObj.value),
                                patientCount = formatedCategoryData.categorypatientcounts[dataObj.index + 1];

                            var $$ = this,
                                config = $$.config,
                                bgcolor;
                            bgcolor = definedcolors[dataObj.index];
                            var html = '';
                            html = '<div class="customC3ToolTip">' +
                                '<div class="customC3ToolTip-Header">' +
                                '<div>Genotype Sub-Type: ' + genotype + '</div>' +
                                '</div>' +
                                '<div class="customC3ToolTip-Body" style="text-align:left;">' +
                                '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + commaSeperatedNumber(patientCount) + '</div>' +
                                '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Savings : $ ' + commaSeperatedNumber(savingValue) + '</div>' +
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

            /* if (containerName == "#subpopulationChartsPopup-container") {
                 var svg = d3.select(containerName).append("svg");
                 svg.selectAll("text.bar")
                     .data(formatedCategoryData)
                     .enter().append("text")
                     .attr("text-anchor", "middle")
                     .attr("x", function(d) { return x(d[xAxis_plot]) + x.rangeBand() / 2; })
                     .attr("y", function(d) { return y(d[yAxis_plot]) - 5; })
                     .text(function(d) { return d.index });
             }*/

        }

        return;
        var len = 0;
        var totalDisplayPatients = [];
        //loop for each data to get genotypes & savings
        for (var key in jsonData) {
            var json = {};
            var tempjson = {};
            json['genotype'] = key;
            tempjson[key] = 0;
            tempjson['genotype'] = key;
            //push the key in the titles array
            title.push(key);
            console.log(' Key = ' + key);
            var categories = jsonData[key];
            // console.log(categories);
            for (var i = 0; i < categories.length; i++) {

                json[categories[i]['category_name']] = categories[i]['savings'];
                tempjson[key] += categories[i]['count'];
                tempjson[categories[i]['category_name']] = categories[i]['savings'];
                //push groups name in the array
                groups.push(categories[i]['category_name']);
            }
            tempjson['count_category'] = i;
            chartData.push(json);
            totalDisplayPatients.push(tempjson);
        }

        groups = getUniqueArray(groups);
        //console.log('groups = ' + groups);
        // console.log('********Genotype / Savings Chart Data*******');
        //  console.log(chartData,totalDisplayPatients);
    }
    //  console.log(chartData);
    //sort data based on genotype
    chartData.sort(function (a, b) {
        return a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, '');
    });
    totalDisplayPatients.sort(function (a, b) {
        return a.genotype.replace(/\D+/g, '') - b.genotype.replace(/\D+/g, '');
    });
    len = groups.length;

    d3.select(containerName).selectAll("*").remove();

    var chart = c3.generate({
        bindto: containerName,
        padding: {
            top: 15,
        },
        data: {
            type: 'bar',
            // type: 'pie',
            json: chartData,
            keys: {
                x: 'genotype',
                value: groups
            },
            groups: [groups],
            order: null,
            labels: {
                format: function (v, id, i, j) {
                    if (id != undefined && i != undefined) {
                        if (totalDisplayPatients[i]['count_category'] != 0 && totalDisplayPatients[i][id.substring(0, 2).trim()] != undefined) {
                            return commaSeperatedNumber(totalDisplayPatients[i][id.substring(0, 2).trim()]);

                        }
                        // else{
                        //  return i+'/'+j;
                        // }
                    }

                },
            },
            onclick: function (d) {
                console.log(d.value);
                if (d.value) {
                    if (sizeParams)
                        handleFilterForchart(d, containerName);
                } else {
                    console.log('wrong value or event');
                }
            },
        },
        size: {
            height: sizeParams ? sizeParams.height : 250,
            width: sizeParams ? sizeParams.width + 200 : 400
        },
        color: {
            pattern: ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba', '#FAB4B2', '#C28B91']
            /*  pattern: ['#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
              //  pattern: [ '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91' , '#D1BCF7', '#809FBC', '#5A6D8D']*/

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
                    format: function (d) {
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
                    }
                },
                label: {
                    text: 'Payer Savings',
                    position: 'outer-middle'
                }
            }
        },
        bar: {
            width: {
                ratio: 0.5
            }
        },
        legend: {
            show: sizeParams == null ? false : true,
            position: 'right'
        },
        tooltip: {
            grouped: false,

            // Formating Tooltip to Display Savings & patient count.
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                var dataObj = d[0],
                    genotype = defaultTitleFormat(dataObj.index),
                    savingValue = Math.round(dataObj.value),
                    patientCount = 0;

                var filterData = _.where(data, { category_name: dataObj.id });
                patientCount = filterData[0].count;

                var $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);


                var html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Genotype: ' + genotype + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div style="text-align:center;font-weight:bold;">' + dataObj.name + '</div>' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + commaSeperatedNumber(patientCount) + '</div>' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Savings : $ ' + commaSeperatedNumber(savingValue) + '</div>' +
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

    //set the label color on x-axis
    // setTimeout(function () {
    //     d3.selectAll('.futureSavingChart .c3-axis-x-label')
    //         .attr("dy", "30");
    //     for (var i = 0; i < chartData.length; i++) {
    //         var k = 0;
    //         var chk = totalDisplayPatients[i].count_category;
    //         for (var key in chartData[i]) {
    //             if (k != chk)
    //                 $('.c3-texts-' + key.split(' ').join('-')).remove();
    //             k++;
    //         }

    //     }
    // }, 100);


}

// Use a modified SI formatter that uses "B" for Billion.
var siFormat = d3.format("s");

function handleFilterForchart(dataObj, containerName) {
    let tabname = $(containerName).attr('tabname'),
        category_id = getCategoryIdByTabName(tabname,dataObj);

    let targetPopulation = tabname + '' + category_id + 'detailViewLink';

    //close the popup
    $(containerName).siblings('div.popup-close').trigger('click');

    //open sub population view
    $('#' + tabname + 'SubpopulationTab a').trigger('click');

    // Change Disply of the targetted Subpopulation to Avoid Toggle Featur.
    $('.' + tabname + 'listDetailView_' + category_id).css('display', 'none');

    //open view for particular category
    $('.' + targetPopulation).trigger('click');

    //scroll to that Section
    smooth_scroll_to($('.' + targetPopulation));
}

function getCategoryIdByTabName(tabName,categoryName) {
    let category_id = 0,
        filteredData = [];

    if(tabName.toLowerCase() == 'treated') {
        filteredData = _.where(TreatedAnalyticsData, {category_name:categoryName});
    }
    else if(tabName.toLowerCase() == 'treating') {
        filteredData = _.where(TreatingAnalyticsData, {category_name:categoryName});
    }
    else {
        filteredData = _.where(UnTreatedAnalyticsData, {category_name:categoryName});
    }

    category_id = filteredData[0]['category_id'];
    return category_id;
}

function formatDataForNewChart(dataObj) {

    let genotypes = ['genotypes'],
        values = ['values'],
        patientcounts = ['patientcounts'];



    for (let keys in dataObj) {

        let innerPops = dataObj[keys],
            totalpatientcounts = 0,

            totalSavings = 0;



        for (let i = 0; i < innerPops.length; i++) {

            totalSavings += innerPops[i]['savings'];
            totalpatientcounts += innerPops[i]['count'];
        }


        genotypes.push(keys);
        values.push(totalSavings);
        patientcounts.push(totalpatientcounts);
    }



    return { genotypes: genotypes, values: values, patientcounts: patientcounts }

}

function getDrillDownData(genotype, baseData) {
    let categoryname = ['categoryname'],
        categoryvalues = ['categoryvalues'],
        categorypatientcounts = ['categorypatientcounts'];

    let currentGenotypeData = baseData[genotype];
    // mainArr = [];
    for (let i = 0; i < currentGenotypeData.length; i++) {
        //  let dataArr = [];
        categoryname.push(currentGenotypeData[i].category_name);
        categoryvalues.push(currentGenotypeData[i].savings);
        categorypatientcounts.push(currentGenotypeData[i].count);
        // mainArr.push(dataArr);
    }
    return { categoryname: categoryname, categoryvalues: categoryvalues, categorypatientcounts: categorypatientcounts }
}
