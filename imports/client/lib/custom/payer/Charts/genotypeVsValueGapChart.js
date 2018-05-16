// Value Gap Chart

createValueGapChart = function (containerName,data,sizeParams){

    var chartData = [];
    var jsonData = [];
    var max_value = 0;
    //if data is empty then use dummy data.
    if(!data){
        return ;
        // chartData = [
        //             {
        //                 "1 Experienced":0.69,
        //                 "1 Experienced cirrhosis":0.34,
        //                 "genotype":"1"
        //             },
        //             {
        //                 "1a Experienced": 0.24,
        //                 "1a Experienced Partial Response": 0,
        //                 "1a Experienced Relapsed": 0,
        //                 "1a Experienced cirrhosis": 0.33,
        //                 "1a Naive": 0.94,
        //                 "1a Naive < 6 million": 0,
        //                 "1a Naive cirrhosis": 0.95,
        //                 "genotype": "1a"

        //             },
        //             {
        //                 "1b Experienced":0.2,
        //                 "1b Experienced cirrhosis":0.74,
        //                 "1b Naive":0.98,
        //                 "1b Naive cirrhosis":1.05,
        //                 "genotype":"1b"
        //             },
        //             {
        //                 "2 Experienced":0.42,
        //                 "2 Experienced cirrhosis":0.42,
        //                 "2 Naive":1.05,
        //                 "2 Naive cirrhosis":0.43,
        //                 "genotype":"2"
        //             },
        //             {
        //                 "3 Experienced":0.58,
        //                 "3 Experienced cirrhosis":0.19,
        //                 "3 Naive":0.72,
        //                 "3 Naive cirrhosis":1.18,
        //                 "genotype":"3"
        //             },
        //             {
        //                 "4 Experienced":0.29,
        //                 "4 Experienced cirrhosis":0.29,
        //                 "4 Naive":0.68,
        //                 "4 Naive cirrhosis":0.68,
        //                 "genotype":"4"
        //             },
        //             {
        //                 "5 Experienced":0,
        //                 "5 Experienced cirrhosis":0,
        //                 "5 Naive":0.39,
        //                 "5 Naive cirrhosis":0.39,
        //                 "genotype":"5"
        //             },
        //             {
        //                 "6 Experienced":0,
        //                 "6 Experienced cirrhosis":0,
        //                 "6 Naive":0.24,
        //                 "6 Naive cirrhosis":0.24,
        //                 "genotype":"6"
        //             }
        //             ];

    }else{


        // group by the data by genotypes
        jsonData = _.groupBy(data,function(record){
            return record.category_name.split(' ')[0];
        });
        var catn = [];
        max_value = 0;
        var dataLabel = {};
        //loop for each data to get genotypes & savings
        for(var key in jsonData) {
            var json = {};
            json['genotype'] = key;
            var categories = jsonData[key];
            for(var i=0;i<categories.length;i++) {
                var drugsData = categories[i]['data'];
                var values = [];
                var total_count = 0;
                var sum_value = 0

                for(var j=0;j<drugsData.length;j++) {
                    //push value score in the values array
                    sum_value += parseFloat(drugsData[j]['value'])*parseInt(drugsData[j]['count']);
                    values.push(parseFloat(drugsData[j]['value']));
                    total_count += parseInt(drugsData[j]['count']);
                }
                values = values.sort(sortNumber);
                //values = values.sort();
                var valueGap = values[values.length - 1] - (sum_value/total_count);
                var temp = parseFloat(valueGap.toFixed(2) * total_count);
                if(max_value<=temp){
                    max_value = temp;
                }
                json[categories[i]['category_name']] = temp;
                dataLabel[categories[i]['category_name']] = commaSeperatedNumber(total_count);
                catn.push(categories[i]['category_name']);
            }
           // dataLabel.push(jsontemp);
            chartData.push(json);
        }

         //console.log('********Genotype / Value Gap Chart Data*******');
         //console.log(chartData);
    }
    //sort data based on genotype
    chartData.sort(function(a,b){
        return a.genotype.replace(/\D+/g,'') - b.genotype.replace(/\D+/g,'');
    });


    $(containerName).empty();
    d3.select(containerName).selectAll("*").remove();

    var data2 = chartData;//JSON.parse('[{"genotype":"1b","1b Experienced cirrhosis":59.160000000000004,"1b Experienced":75.04,"1b Naive":99.17999999999999,"1b Naive cirrhosis":189.57},{"genotype":"1a","1a Naive":74.74,"1a Naive cirrhosis":112.24,"1a Experienced":171.39,"1a Experienced cirrhosis":103}]');
    var margin = {top: 25, right: 0, bottom: 40, left: 60},
        width = sizeParams ? sizeParams.width +150 : 400,
        height = sizeParams ? sizeParams.height : 260 ;

    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width-6], .1);
    if(sizeParams){
        x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width-130], .1);
    }
    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .domain([0, max_value])
        .range([height, 0]);
    var color_comb = [
            ['#B71C1C', '#C62828', '#D32F2F', '#E53935', '#F44336', '#EF5350', '#E57373', '#EF9A9A', '#FFCDD2', '#FFEBEE'],
            ['#1A237E', '#283593', '#303F9F', '#3949AB', '#3F51B5', '#5C6BC0', '#7986CB', '#9FA8DA', '#C5CAE9', '#E8EAF6'],
            ['#01579B', '#0277BD', '#0288D1', '#039BE5', '#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA', '#B3E5FC', '#E1F5FE'],
            ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9'],
            ['#F57F17', '#F9A825', '#FBC02D', '#FDD835', '#FFEB3B', '#FFEE58', '#FFF176', '#FFF59D', '#FFF9C4', '#FFFDE7'],
            ['#3E2723', '#4E342E', '#5D4037', '#6D4C41', '#795548', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9'],
            ['#BF360C', '#D84315', '#E64A19', '#F4511E', '#FF5722', '#FF7043', '#FF8A65', '#FFAB91', '#FFCCBC', '#FBE9E7'],
            ['#263238', '#37474F', '#455A64', '#546E7A', '#607D8B', '#78909C', '#90A4AE', '#B0BEC5', '#CFD8DC', '#ECEFF1']
        ];
    var color = d3.scale.ordinal()
        .range([
              '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
        ]);
    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        //.tickValues(y.ticks(6));
        .ticks(6);
        //.tickFormat(d3.format(".2s"));

    var svg = d3.select(containerName).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background", "")
        .style("margin-top", "5px")
        .attr("class", "valueGapBarChart")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var color_k = -1;
            for(var k = 0;k<data2.length;k++){
                color = d3.scale.ordinal().range(color_comb[k]);
                data1 = [data2[k]];
                var categoryNames = d3.keys(data1[0]).filter(function(key) { return key !== "genotype"; });

                  data2.forEach(function(d) {
                    d.values =  categoryNames.map(function(name) {
                        return {name: name,value: isNaN(d[name]) ? 0 : d[name]};
                    });
                  });
                  x0.domain(data2.map(function(d) { return d.genotype; }));
                  x1.domain(categoryNames).rangeRoundBands([0, x0.rangeBand()]);
                  var genotypes = svg.selectAll(".genotype")
                      .data(data1)
                    .enter().append("g")
                      .attr("class", "genotypes")
                      .attr("transform", function(d) { return "translate(" + x0(d.genotype) + ",0)"; });

                  genotypes.selectAll("rect")
                      .data(function(d) { return d.values; })
                    .enter().append("rect")
                      .attr("width", x1.rangeBand())
                      .attr("x", function(d) { return x1(d.name); })
                      .attr("data", function(d) { return d.name })
                      .attr("count", function(d) { return dataLabel[d.name];})
                      .attr("class", function(d) { return d.value })
                      .attr("y", function(d) { return y(d.value); })
                      .attr("height", function(d) { return height - y(d.value); })
                      //.attr("fill", function(d) { return color(d.name); })
                      //.attr("fill", function(d,i) { return colores_google(i); })
                      .attr("fill", function(d,i) { color_k = color_k+1;return colores_google(color_k);})
                      .on("click", function(d) {
                                    var data = $(this).attr('data');
                                    if(sizeParams){
                                        handleFilterForchart(data, containerName);
                                    }
                                    
                                })
                       .on("mouseover", function(e) {
                                    var me = $(this);
                                    var patientCount = _.where(data,{category_name:e.name});
                                    patientCount = patientCount[0].count;

                                    var coor = d3.mouse(this);
                                    var cx = parseFloat(me.attr('x'))+5,
                                        cy = parseFloat(me.attr('y'))+10,
                                        width = 200,
                                        height = 24,
                                        r = 7,
                                        x = (cx + r + width < svg.attr("width") ?
                                            cx + r + 40 :
                                            (cx - r - width) + 40),
                                        y = cy + (parseFloat(me.attr('height')) / 2);

                                    popup = svg.append("g").attr("class", "popupOnValueChartParentWindow");
                                    popup.append("rect")
                                        .attr("x", cx)
                                        .attr("y", cy)
                                        .attr("width", width)
                                        .attr("height", height)
                                        .style("fill", "#808080")
                                        .style("stroke", "#aaa")
                                        .style("stroke-width", 1)
                                        .style("color",'#fff')
                                        .style("z-index",90)
                                        .style("opacity", 0.8);
                                        //.attr("rx", 8)
                                        //.attr("ry", 8);
                                    popup.append("rect")
                                        .attr("x", cx)
                                        .attr("y", cy+24)
                                        .attr("width", width)
                                        .attr("height", 2 * height+5)
                                        .style("fill", "#fff")
                                        .style("stroke", "#cccccc")
                                        .style("border","1px solid #CCC")
                                        .style("opacity", 0.8)
                                        .style("stroke-width", 1);
                                       // .style("opacity", 1);
                                        //.attr("rx", 8)
                                        //.attr("ry", 8);
                                     popup.append("text")
                                        .attr("x", cx + width/5)
                                        .attr("y", cy + 18)
                                        .attr("fill", "#fff")
                                        .attr("font-size", "14px")
                                        .style('font-weight',300)
                                        .style("opacity", 0.8)
                                        .text(me.attr('data'));
                                    popup.append("rect")
                                        .attr("x", cx+4)
                                        .attr("y", cy+41)
                                        .attr("width", 10)
                                        .attr("height", 10)
                                        .style("fill", me.attr('fill'))
                                        .style("opacity", 0.8)
                                        .style("stroke", "#cccccc");

                                    popup.append("text")
                                        .attr("x", cx + 18)
                                        .attr("y", cy + 50)
                                        .attr('fill','#333')
                                        .style("opacity", 1)
                                        .style('font-weight',300)
                                        .style("font-size", "13px")
                                        //.style('text-anchor','middle')
                                        .text('Patient Count : ' +patientCount);

                                    popup.append("rect")
                                        .attr("x", cx+4)
                                        .attr("y", cy+58)
                                        .attr("width", 10)
                                        .attr("height", 10)
                                        .style("fill", me.attr('fill'))
                                        .style("opacity", 0.8)
                                        .style("stroke", "#cccccc");

                                    popup.append("text")
                                        .attr("x", cx + 18)
                                        .attr("y", cy + 66)
                                        .attr('fill','#333')
                                        .style('font-weight',300)
                                        .style("opacity", 1)
                                        .style("font-size", "13px")
                                        .text('Lost Value : ' + parseFloat(me.attr('class')).toFixed(2));

                                })
                       .on("mouseout", function(e) {
                                    if (popup !== null) {
                                      popup.remove();
                                    }
                                });
                      if(sizeParams){
                        genotypes.selectAll("text")
                              .data(function(d) { return d.values; })
                            .enter().append('text')
                                          .attr('fill','#999')
                                          .style('font-weight',300)
                                          .style('font-size','10px')
                                          .attr("text-anchor", "middle")
                                          //.attr("transform", function(d) { return "translate("+(x1(d.name) + x1.rangeBand()/4)+","+(y(d.value)-30)+") rotate(90)";})
                                          .attr('x',function(d) { return x1(d.name) + x1.rangeBand()/2; })
                                          .attr('y',function(d) { return y(d.value)-3; })
                                          .text(function(d) {return dataLabel[d.name]; });

                              }

        }

                if(sizeParams){
                 let color_k = -1;
                 var legend = svg.selectAll(".legend")
                                      .data(catn)
                                    .enter().append("g")
                                      .attr("class", "legend")
                                      .attr("transform", function(d, i) { return "translate(10," + ((i * 15))+ ")"; });

                                  legend.append("rect")
                                      .attr("x", width - 18)
                                      .attr("width", 10)
                                      .attr("height", 10)
                                      .style("fill", function(d,i) { color_k = color_k+1;return colores_google(color_k);});

                                  legend.append("text")
                                      .attr("x", width - 24)
                                      .attr("y", 5)
                                      .style('font-weight',300)
                                      .style("font-size", "11px")
                                      .attr("dy", ".35em")
                                      .style("text-anchor", "end")
                                      .text(function(d) { return d; });
                }
                svg.append("g")
                      .attr("class", "x axis")
                      .attr("fill", '#999')
                      .style("font-size", '12px')
                      .style("font-weight", '300')
                      .attr("transform", "translate(0," + height + ")")
                      .call(xAxis)
                      .append("text")
                      //.attr("transform", "rotate(-90)")
                      .attr("x", width / 2.5)
                      .attr("y", 26)
                      .attr("dy", ".71em")
                      .attr("fill", '#999')
                      .style("font-size", '14px')
                      .style("font-weight", '300')
                      .style("text-anchor", "right")
                      .text("Genotypes");;

             svg.append("g")
                      .attr("class", "y axis")
                      .attr("fill", '#999')
                      .style("font-size", '12px')
                      .style("font-weight", '300')
                      .call(yAxis)
                    .append("text")
                      .attr("transform", "rotate(-90)")
                      .attr("x", "-" + (height / 2))
                      .attr("y", -51)
                      .attr("dy", ".71em")
                      .attr("fill", '#999')
                      .style("font-size", '14px')
                      .style("font-weight", '300')
                      .style("text-anchor", "middle")
                      .text("Lost Value");
    }
    function sortNumber(a, b) {
        return a - b;
    }

function colores_google(k) {
  //var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  var colores_g = ['#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];//['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5',"#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
//var colores_g = [ '#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91' , '#D1BCF7', '#809FBC', '#5A6D8D'];

  //return colores_g[n % colores_g.length];
  return colores_g[k];
}





function handleFilterForchart(dataObj,containerName) {
    let currentSubPopulation = Patients_category.filter((rec) => {
        return rec.category_name.trim() == dataObj;
    });
    currentSubPopulation = currentSubPopulation[0];

    let tabname = $(containerName).attr('tabname');

    let targetPopulation = tabname +''+currentSubPopulation.category_id+'detailViewLink';

    //close the popup
    $(containerName).siblings('div.popup-close').trigger('click');

    //open sub population view
    $('#'+tabname+'SubpopulationTab a').trigger('click');

    // Change Disply of the targetted Subpopulation to Avoid Toggle Featur.
    $('.'+tabname+'listDetailView_' + currentSubPopulation.category_id).css('display', 'none');
    //open view for particular category
    $('.'+targetPopulation).trigger('click');

    //scroll to that Section
    smooth_scroll_to($('.'+targetPopulation));
}
