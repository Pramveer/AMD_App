/*
 * This function creates hospitalization chart in the Safet Section of each Drug in the subpopulation section.
 * containerName is either id or className where we want to render the chart and dataJson is Filtered dataset for each drug.
 * graphRules - What we want to plot on X and Y axis.
 */
renderDrugSafetyHospitalizationChart = function(containerName, dataJson, graphRules, sizeParams) {
    /*var dataJson = [
        { count: 15,cost: 147},
        { count: 20,cost: 154},
        { count: 10, cost: 250},
        { count: 14, cost: 475}
    ];*/

    // formatting reaction names

    for (var i = 0; i < dataJson.length; i++) {
        dataJson[i].name = dataJson[i].name.split('_').join(' ');
    }

    // Show No Data Found When No Data
    if (dataJson.length == 0) {
        var html = '<span class="noHospitalizationData"> No Hospitalization Data.</span>';
        $(containerName).html(html);
        return;
    }

    var xAxis_plot = graphRules['x'],
        yAxis_plot = graphRules['y'];
    //var containerWidth = $(containerName).width(), containerHeight = $(containerName.split(' ')[0]).height();

    var containerWidth = sizeParams ? sizeParams.width : 270,
        containerHeight = sizeParams ? sizeParams.height : 150;

    var margin = { top: 10, right: 0, bottom: sizeParams ? 80 : 40, left: 15 },
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    if (containerName == "#subpopulationChartsPopup-container") {
        var margin = { top: 20, right: 20, bottom: sizeParams ? 80 : 40, left: 15 },
            width = containerWidth - margin.left - margin.right,
            height = containerHeight - margin.top - margin.bottom;
    }

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .outerTickSize(1);;

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5, "%");

    var svg = d3.select(containerName).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(dataJson.map(function(d) { return d[xAxis_plot]; }));
    y.domain([0, d3.max(dataJson, function(d) { return d[yAxis_plot]; })]);


    var tooltip = d3.select(containerName).append('div')
        .attr('class', 'hospitalizationTooltip')
        .style("display", 'none')
        .style('position', 'absolute');

    var xAxisG = svg.append("g")
        .attr("class", "safetyChart-x-axis")
        .attr("transform", "translate(0," + height + ")")

    var leftTextFont = sizeParams ? '15px' : '12px',
        rightTextFont = sizeParams ? '14px' : '8px',
        leftTextPos = sizeParams ? -180 : -80;

    xAxisG
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("font-size", rightTextFont)
        .attr("font-family", "sans-serif")
        .attr("fill", "#aaaeaf")
        .attr("transform", "rotate(0)")
        .call(wrap, x.rangeBand());
    /*var xAxisLabel = xAxisG.append("text")
       .attr("transform", "translate(" + (width * 2/3 ) + "," + 40 + ")")
       .style("text-anchor", "end")
       .style('font-size', '16px')
       .style('fill', '#7CC576')
       .text("Side Effects");*/

    let yValue = -5;
    if (sizeParams) {
        yValue = -15;
    }

    var yAsixG = svg.append("g")
        .attr("class", "safetyChart-y-axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", leftTextPos)
        .attr("y", yValue)
        .attr("dy", ".71em")
        .style("text-anchor", "start")
        .style('font-size', leftTextFont)
        .style('fill', '#aaaeaf')
        .text("% of Patients");

    svg.selectAll(".bar")
        .data(dataJson)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[xAxis_plot]); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d[yAxis_plot]); })
        .attr("height", function(d) { return height - y(d[yAxis_plot]); })
        .style('fill', '#f1cb6a')
        //.style('fill', '#102330')
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("display", 'block');
            var html = '<div>' +
                (d.count * 100).toFixed(2) + '%' +
                '</div>';
            tooltip.html(html)
                .style("left", parseInt(d3.mouse(this)[0]) + "px")
                .style("top", parseInt(d3.mouse(this)[1]) + 40 + "px");

        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("display", 'none');
        });

    //  console.log(containerName);
    if (containerName == "#subpopulationChartsPopup-container") {
        svg.selectAll("text.bar")
            .data(dataJson)
            .enter().append("text")
            // .attr("class", "bar")
            .attr("text-anchor", "middle")
            .attr("color", "black")
            .attr("x", function(d) { return x(d[xAxis_plot]) + x.rangeBand() / 2; })
            .attr("y", function(d) { return y(d[yAxis_plot]) - 5; })
            .text(function(d) { return (d.count * 100).toFixed(2) + '%'; });
    }


    //set the  position of y Axis label
    setTimeout(function() {

        d3.selectAll('.hospitalizationChart .safetyChart-x-axis .tick text')
            .attr("y", 0);
        d3.selectAll('.hospitalizationChart .safetyChart-x-axis .tick text tspan')
            .attr("y", 0);
    }, 100);




    // Using C3js
    /*  var chart = c3.generate({
        bindto: containerName,
        data: {
          json: dataJson,
          type: "bar",

          keys: {
            x: xAxis_plot, // it's possible to specify 'x' when category axis
            value: [yAxis_plot],
          },

        },
        size: {
              height: 160,
              width: 210
        },
        padding: {
            top: 0,
            right: 0,
            bottom:20,
            left: 20
        },
        color: {
          pattern: ['#102330','#3cbca9']
        },
        axis: {
              x: {
                  type: 'category',
                  tick:{
                    fit: true
                  }
              },
              y: {
                  label: {
                      text: 'Patietns %',
                      position: 'outer-middle'
                  },

              }
          },
          bar: {
              width: {
                  ratio: 0.95
              }
          },
          legend: {
              show: false
          }
      });


      //set the  position of y Axis label
      setTimeout(function() {

          d3.selectAll('.hospitalizationChart .c3-axis-y-label')
              .attr("dy", "-10");
          d3.selectAll('.hospitalizationChart .c3-axis-x .tick text')
              .attr("y", 4);
      }, 50);
      */

}



function wrap(text, width) {
    width = 9;
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null); //append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            //tspan.text(line.join(" "));
            // if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan")
                .attr("x", 0)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                .text(word);
            //}
        }
    });
}