/**
 * @author: Pramveer
 * @date: 15th Mar 17
 * @desc: Modified changes to get reccomendation UM data from ims drugs data
 */
// import {getModifiedIMSDataLikeSPList,sortDataInDesc} from '../payerToolUtilities.js'; 
import { getModifiedIMSDataLikeSPList, SortByBestDrugsDecendingOrder } from '../payerToolUtilities.js';


// this Function Creates Cure Rate Chart in the Chart Section.
// We have created this chart using the D3js libreary First but then we moved to C3.js Library just to make styling consistent.
// Right now  we have commented the code for Creating this Staked chart using the D3Js. We  are keeping that just for the
// refrence purpose if we need to create any staked chart in future.
createCureRateChart = function(containerName, chartData, sizeParams) {
    let data = [];
    let len = 0;
    let groups = [];
    let totalCurrentUMPatients = 0;
    let totalRecommendedUMPatients = 0;
    //get array of total patients
    let totalDisplayPatients = [];
    // Variables used for C3js Data.
    let c3JsCurrentUmDataObj = {};
    let c3JsRecommendedUmDataObj = {};
    let jsonData = {};
    let reccUMJsonData = {};
    let imsData = getModifiedIMSDataLikeSPList(); //get ims data in similar structure like its for PHS default dataset
    if (!chartData || chartData.length == 0) {
        //check for no data found
        $(containerName).html('<div class="providerNoDataFound">No Data Found</div>');
        return;

        /*
         *   Following is the data format required to create D3js Stacked Chart.
         */


        // data = [
        //   {
        //     "key": "1a",
        //     "values": [
        //       {
        //         "utilization": "Current UM",
        //         "genotype": "1a",
        //         "population": 450,

        //       },
        //       {
        //         "utilization": "Recommended UM",
        //         "genotype": "1a",
        //         "population": 500,
        //       },

        //     ]
        //   },
        //    {
        //     "key": "1b",
        //     "values": [
        //       {
        //         "utilization": "Current UM",
        //         "genotype": "1b",
        //         "population": 750,

        //       },
        //       {
        //         "utilization": "Recommended UM",
        //         "genotype": "1b",
        //         "population": 900,
        //       },

        //     ]
        //   },
        //    {
        //     "key": "1",
        //     "values": [
        //       {
        //         "utilization": "Current UM",
        //         "genotype": "1",
        //         "population": 380,

        //       },
        //       {
        //         "utilization": "Recommended UM",
        //         "genotype": "1",
        //         "population": 600,
        //       },

        //     ]
        //   },
        // ];

    } else {

        // Followin is the way to convert the dataset into the required json format as it is shown above.
        // group by the data by genotypes
        jsonData = _.groupBy(chartData, (record) => record.category_name.split(' ')[0]);
        reccUMJsonData = _.groupBy(imsData, (record) => record.category_name.split(' ')[0]);

        // console.log('************IMS CURE RATE DATA***************');
        // console.log(reccUMJsonData);
        totalCurrentUMPatients = 0;
        totalRecommendedUMPatients = 0;
        //get array of total patients
        totalDisplayPatients = [];
        // Variables used for C3js Data.
        c3JsCurrentUmDataObj = {};
        c3JsRecommendedUmDataObj = {};
        groups = [];

        for (let key in jsonData) {
            let obj = {};
            obj['key'] = key;
            len += 1;
            let thisGenotypePatientsUsingCurrentUtilization = 0;
            let thisGenotypePatientsUsingRecommandedUtilization = 0;

            let categories = jsonData[key];
            let imsCategories = reccUMJsonData[key] ? reccUMJsonData[key] : jsonData[key];
            for (let i = 0; i < categories.length; i++) {
                let DrugsData = categories[i]['data'];

                //Pram (21st Mar 17): if no drugs are in real world then make the client dataset for that subpopulation as the rwe dataset
                let imsDrugsData = imsCategories[i] ? imsCategories[i]['data'] : DrugsData;
                //let imsDrugsData = imsCategories[i]['data'];

                let thisCategoryPatients = categories[i]['count'];
                let result = getCuredPatientsUsingCurrentUtiliation(DrugsData, imsDrugsData);
                let thisCategoryPatientsUsingCurrentUtilization = result.Count;
                let bestValueEfficacy = result.Efficacy;
                let thisCategoryPatientsUsingRecommandedUtilization = Math.round((bestValueEfficacy * thisCategoryPatients) / 100);
                thisGenotypePatientsUsingCurrentUtilization += thisCategoryPatientsUsingCurrentUtilization;
                thisGenotypePatientsUsingRecommandedUtilization += thisCategoryPatientsUsingRecommandedUtilization;

            }

            // **************************************************************************************************************************************

            // // Preparing Objects as per the data requirement according to D3js Stacked Chart.
            //     var currentUtilizationObj = {"utilization": "Current UM", "genotype": key, "population": thisGenotypePatientsUsingCurrentUtilization};
            //     var recommandedUtilizationObj = {"utilization": "Recommended UM", "genotype": key, "population": thisGenotypePatientsUsingRecommandedUtilization};

            //     // find out total patients according to recommanded and Current UM
            //     totalCurrentUMPatients += thisGenotypePatientsUsingCurrentUtilization;
            //     totalRecommendedUMPatients += thisGenotypePatientsUsingRecommandedUtilization;
            //     var arr = [];
            //         arr.push(currentUtilizationObj);
            //         arr.push(recommandedUtilizationObj);

            //     obj['values'] = arr;
            //     data.push(obj);

            // ****************************************************************************************************************************************

            // Preparing Objects as per the data requirement according to C3.js Stacked Chart.
            c3JsCurrentUmDataObj[key] = thisGenotypePatientsUsingCurrentUtilization;
            c3JsRecommendedUmDataObj[key] = thisGenotypePatientsUsingRecommandedUtilization;
            groups.push(key);

            // find out total patients according to recommanded and Current UM
            totalCurrentUMPatients += thisGenotypePatientsUsingCurrentUtilization;
            totalRecommendedUMPatients += thisGenotypePatientsUsingRecommandedUtilization;
        }

        c3JsCurrentUmDataObj['utilization'] = "Current UM";
        c3JsRecommendedUmDataObj['utilization'] = "Recommended UM";
        data.push(c3JsCurrentUmDataObj);
        data.push(c3JsRecommendedUmDataObj);

        totalDisplayPatients.push(totalCurrentUMPatients);
        totalDisplayPatients.push(totalRecommendedUMPatients);
    }
    // console.log("************CURE RATE CHART DATA***************");
    // console.log(data);



    // Following commented code was being used when we were creating this stacked chart using the D3js library.

    /*
        // Chart Creation usng D3js

        var svg_parentDiv = document.getElementById(containerName);
        // var wid = svg_parentDiv.offsetWidth;
        // var hei = svg_parentDiv.offsetHeight-12;
        var wid = 450;
        var hei = 270;
        var outerWidth = parseInt(wid);
        var outerHeight = parseInt(hei);

        // var outerWidth = 500;
        // var outerHeight = 250;
        var margin = { left: 70, top: 30, right: 30, bottom: 70 };
        var barPadding = 0.2;

        var xColumn = "utilization";
        var yColumn = "population";
        var colorColumn = "genotype";
        var layerColumn = colorColumn;

        var innerWidth  = outerWidth  - margin.left - margin.right;
        var innerHeight = outerHeight - margin.top  - margin.bottom;

        d3.select(containerName).selectAll("*").remove();
        var svg = d3.select(containerName).append("svg")
        .attr("width",  outerWidth)
        .attr("height", outerHeight);
        var div  = d3.select(containerName).append('div')
                    .attr('class','tooltipcure')
                    .style('opacity',0)
                    .style('position','absolute');

        var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var xAxisG = g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + innerHeight + ")");
        var yAxisG = g.append("g")
        .attr("class", "y axis");
        var colorLegendG = g.append("g")
        .attr("class", "color-legend")
        .attr("transform", "translate("+ (parseInt(wid) - 120) + ", 0)");

        var xScale = d3.scale.ordinal().rangeBands([0, innerWidth], barPadding);
        var yScale = d3.scale.linear().range([innerHeight, 0]);
        var colorScale = d3.scale.category10();
        colorScale.range(['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']);

        // Use a modified SI formatter that uses "B" for Billion.
        var siFormat = d3.format("s");
        var customTickFormat = function (d){
        return siFormat(d).replace("G", "B");
        };



        // var colorLegend = d3.legend.color()
        // .scale(colorScale)
        // .shapePadding(3)
        // .shapeWidth(15)
        // .shapeHeight(15)
        // .labelOffset(4);



        var stack = d3.layout.stack()
          .y(function (d){ return d[yColumn]; })
          .values(function (d){ return d.values; });

        var layers = stack(data);

        xScale.domain(layers[0].values.map(function (d){
          return d[xColumn];
        }));

        yScale.domain([
          0,
          d3.max(layers, function (layer){
            return d3.max(layer.values, function (d){
              return d.y0 + d.y;
            });
          })
        ]);

        colorScale.domain(layers.map(function (layer){
          return layer.key;
        }));


        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

        // var yAxis = d3.svg.axis().scale(yScale).orient("left")
        // .tickValues(yScale.ticks(5).concat(yScale.domain()[1]))
        // .tickFormat(customTickFormat)
        // .outerTickSize(0);

        var yAxis = d3.svg.axis().scale(yScale).orient("left")
        .ticks(4)
        .tickFormat(customTickFormat);


        xAxisG.call(xAxis)
            .append("text")
            .attr("x", innerWidth/2)
            .attr("y",  55)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .style('font-size', '14px')
            .style('fill', '#999')
            .text("Cure Rate");

        yAxisG.call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -90)
            .attr("y", -50)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .style('font-size', '14px')
            .style('fill', '#999')
            .text("Patient Cured");

        var layers = g.selectAll(".layer").data(layers);
        layers.enter().append("g").attr("class", "layer");
        layers.exit().remove();
        layers.style("fill", function (d){
          return colorScale(d.key);
        });

        var bars = layers.selectAll("rect").data(function (d){
          return d.values;
        });
        bars.enter().append("rect")
        bars.exit().remove();
        bars
          .attr("x", function (d){ return xScale(d[xColumn]); })
          .attr("y", function (d){ return yScale(d.y0 + d.y); })
          .attr("width", xScale.rangeBand())
          .attr("height", function (d){ return innerHeight - yScale(d.y); })
          .on("mousemove", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                var html = '<div class="c3-tooltip-container" style="pointer-events: none;">'+
                '<table class="c3-tooltip"><tbody><tr><th colspan="2">Genotype:'+d.genotype+'  </th></tr>'+
                '<tr class="c3-tooltip-name">'+
                '<td class="name"><span style="background-color:#ff7f0e">'+
                '</span>Patient Count</td><td class="value">'+(d.population).toFixed(0)+'</td></tr></tbody>'+
                '</table></div>';
                div.html(html)
                    .style("left", parseInt(d3.mouse(this)[0]) + "px")
                    .style("top", parseInt(d3.mouse(this)[1])+30 + "px");
                //console.log(d[xColumn]);
                })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        //colorLegendG.call(colorLegend);


         var transY = outerHeight - 50;

        var patientsCounts = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + transY + ")");
        // Current recommendation Patient Count
        patientsCounts.append("image")
                .attr("class", "drugNameDisplayText" + i)
                .attr("x",  75)
                .attr("y", 10)
                .attr("xlink:href", "/patient_icon_orange.png")
                .style("width", 16)
                .style("height", 16);

        patientsCounts.append("text")
              .attr("x", 110)
              .attr("y", 23)
              .style("text-anchor", "middle")
              .style("font-size", "12px")
              .style("font-weight", "normal")
              .style("font-family", "sans-serif")
              .style("fill", "#797878")
              .style("opacity", 1)
              .text(totalCurrentUMPatients);

        // Current recommendation Patient Count
        patientsCounts.append("image")
                .attr("class", "drugNameDisplayText" + i)
                .attr("x", 220)
                .attr("y", 10)
                .attr("xlink:href", "/patient_icon_orange.png")
                .style("width", 16)
                .style("height", 16);

        patientsCounts.append("text")
              .attr("x", 250)
              .attr("y", 23)
              .style("text-anchor", "middle")
              .style("font-size", "12px")
              .style("font-weight", "normal")
              .style("font-family", "sans-serif")
              .style("fill", "#999")
              .style("opacity", 1)
              .text(totalRecommendedUMPatients);


        function type(d){
            d.population = +d.population;
            return d;
        }

        */

    // ==============================================================================================================
    // ==============================================================================================================
    // ==============================================================================================================



    /*
     *   C3.js Chart==================
     */

    // data = [{
    //             "1a": 204,
    //             "1b": 304,
    //             "2": 404,
    //             "utilization": "Recommended UM"
    //         }, {
    //             "1a": 250,
    //             "1b": 154,
    //             "2": 158,
    //             "utilization": "Current UM",
    //         }];

    // var groups = ["1a", "1b", "2"];
    // var title = ["1", "1a", "1b", "2", "3", "4", "5", "6"];
    // console.log('cure rate chart data');
    // console.log(data);
    // console.log(chartData);

    d3.select(containerName).selectAll("*").remove();

    var chart = c3.generate({
        bindto: containerName,
        padding: {
            top: 15,
            right: 60,
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


                    // console.log(data);
                    // console.log("----" +v+ "------" +id+ "------" +i+ "------"  +j+ "------");
                    // if(j === len-1){
                    //     //console.log(data);
                    //     return commaSeperatedNumber(totalDisplayPatients[i]);
                    // }
                    // else{
                    //     //return i+'/'+j;
                    // }
                },
            }

        },
        size: {
            height: sizeParams ? sizeParams.height : 248,
            width: sizeParams ? sizeParams.width : 400
        },
        color: {
            pattern: ['#2e7e97', '#e95a52', '#69bae7', '#f1cb6a', '#abd6ba', '#FAB4B2', '#C28B91']
                /* pattern: ['#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
                     //pattern: [ '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#D1BCF7', '#809FBC', '#5A6D8D']*/
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
                // max: ((Math.max.apply(Math, data.map(function(o) {
                //     return o["1a"]
                // })) < 8) ? 7 : (Math.max.apply(Math, data.map(function(o) {
                //     return o["1a"]
                // })))),
                min: 0,
                padding: {
                    bottom: 0
                },
                // tick: {
                //     //count: 5,
                //     format: function(d) {
                //         if (d) {
                //             //Need to improve
                //             //convert value to million scale
                //            // return parseFloat(d / 1000000).toFixed(1);

                //             var str = siFormat(d).replace("G", "B");
                //             if(d >=1000){
                //                 var res = str.substring(str.length-1, str.length);
                //                 var val = Math.round(parseInt(str.replace(res, "")));
                //                 return val + res;
                //             }else{
                //                 return Math.round(str);
                //             }
                //             //return d.toFixed(1);
                //         }
                //         return d;
                //     }
                // },
                label: {
                    text: 'Patient Cured',
                    position: 'outer-middle'
                }
            }
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
        // legend: {
        //     show: true,
        //     position: 'right'
        // },
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

    $(containerName).next().children('.currentUMPatients').children('span').html(totalCurrentUMPatients);
    $(containerName).next().children('.recomendedUMPatients').children('span').html(totalRecommendedUMPatients);
    var firstLegend = d3.select(".c3-legend-item");
    var legendCon = d3.select(firstLegend.node().parentNode);
    var legendY = parseInt(firstLegend.select('text').attr('y'));
    d3.select('.legendtextsmall').remove();
    legendCon
        .append('text')
        .text('Genotype')
        .attr('class', 'legendtextsmall')
        .attr('x', -17)
        .attr('fill', '#999fa2')
        .attr('font-size', '10px')
        .attr('y', legendY - 20);
    if (sizeParams) {
        setTimeout(function() {
            var firstLegend = d3.select("#subpopulationChartsPopup-container .c3-legend-item");
            var legendCon = d3.select(firstLegend.node().parentNode);
            var legendY = parseInt(firstLegend.select('text').attr('y'));
            d3.select('.legendtext').remove();
            legendCon
                .append('text')
                .text('Genotypes')
                .attr('class', 'legendtext')
                .attr('x', -26)
                .attr('fill', '#999fa2')
                .attr('font-size', '13px')
                .attr('y', legendY - 20);
        }, 200);
        d3.select('#subpopulationChartsPopup-container').append('div').html('<span style="font-size:14px;"><i class="fa fa-user" style="color:#333" aria-hidden="true"></i><span  style="margin-left:10px;color:#333">' + (commaSeperatedNumber(totalCurrentUMPatients)) + '</span></span><span style="font-size:14px;margin-left:200px"><i class="fa fa-user" style="color:#333" aria-hidden="true"></i><span  style="margin-left:10px;color:#333">' + (commaSeperatedNumber(totalRecommendedUMPatients)) + '</span></span>');
    }
}


/*
 *   Following function returns the Total Patinets Count, Percentage and Efficacy for the best value Drug.
 *
 */
getCuredPatientsUsingCurrentUtiliation = function(drugsData, imsDrugsData) {
    // console.log("inner Drug Data");
    // console.log(drugsData);

    let totalPatienCount = 0;
    let totalPatientPercentage = 0;

    let bestValueEfficacy = 0;
    let bestValueScore = 0;

    /**
     * @author: Pramveer
     * @date: 15th Mar 17
     * @desc: commented the below code as now we pick the best value drugs for our reccomendation from the ims data 
     */

    // bestValueScore = _.max(_.pluck(drugsData, 'value'));

    // for (let i = 0; i < drugsData.length; i++) {
    //     if(!isNaN(drugsData[i].efficacy)) {
    //          totalPatienCount += Math.round((drugsData[i].count * drugsData[i].efficacy) / 100);
    //     }

    //     //totalPatientPercentage = (drugsData[i].utilization * drugsData[i].efficacy) / 100;
    //     if (drugsData[i].value == bestValueScore) {
    //         bestValueEfficacy = drugsData[i].efficacy;
    //     }

    // }

    //filter both dataset for NAN efficacy 
    drugsData = _.filter(drugsData, (rec) => {
        return !isNaN(rec.efficacy);
    });

    imsDrugsData = _.filter(imsDrugsData, (rec) => {
        return !isNaN(rec.efficacy);
    });

    //get total patients from the phs dataset
    for (let i = 0; i < drugsData.length; i++) {
        totalPatienCount += Math.round((drugsData[i].count * drugsData[i].efficacy) / 100);
    }

    //sort the ims data on value score in descending order
    // imsDrugsData = sortDataInDesc(imsDrugsData,'value');
    imsDrugsData = SortByBestDrugsDecendingOrder(imsDrugsData, 'value');
    bestValueEfficacy = imsDrugsData[0].efficacy; //get best value efficacy


    return { "Count": totalPatienCount, "Efficacy": bestValueEfficacy };
}

// Use a modified SI formatter that uses "B" for Billion.
var siFormat = d3.format("s");