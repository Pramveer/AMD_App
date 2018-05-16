// Function to create Expanses and Outcome chart.
// if optimized key is set to true in that case the optimized chart will be created else the default one.

createSubpopulationExpansesChart = function(className,data,sizeParams){

    d3.select('.'+className).selectAll("*").remove();
    var svgHieght = sizeParams ? sizeParams.height : 200;
    var svgWidth = sizeParams ? sizeParams.width : 385;

    //var barColor = ['#064763', '#E07823', '#82C44C', '#DAC40A', '#F47B04', '#42CCC1', '#003471', '#82C44C', '#DAC40A', '#F47B04'];
    var barColor = ['#815493', '#d65151', '#82C44C', '#DAC40A', '#F47B04', '#42CCC1', '#003471', '#82C44C', '#DAC40A', '#F47B04'];
    

    var barInnerCircleColor = ['#064763', '#E07823', '#5C982B', '#887A00', '#884504', '#157C74', '#0072BC', '#5C982B', '#887A00', '#884504'];   


    var svg = d3.select("."+className).append("svg").attr("height", svgHieght).attr("width", svgWidth).style("background", "");
    
    var barsGroup = svg.append('g')
        .attr("transform", "translate(" + 0 + "," + 0 + ")");

    if(!data){
       //check for no data found
       $("."+className).html('<div class="providerNoDataFound">No Data Found</div>');
       return;
    // data =      {
    //             "expenses":[{
    //             "key": "bestValue",
    //             "displayLabel":"100% Utilization of Best Value Drug",
    //             "expenses": 28562235,
    //             "icon":"best-value-white"
    //             },
    //             {
    //             "key": "projected",
    //             "displayLabel":"Projected Expenses",
    //             "expenses": 35562235,
    //             "icon":"average_value-white"
    //             },
    //             {"key": "optimized",
    //             "displayLabel":"Optimized Expenses",
    //             "expenses": 45562235,
    //             "icon":"average_value-white"
    //             }],
    //             "optimized": true
    //             };
  }
    

    data = calculateExpansesInPercentage(data);

    var bestValueSaving = calculateBestValueSaving(data);


    var maxBarWidth = 200;
    var bestValueBarWidth = 0;

    var barsLeftOffset = 0;
    var barsRightOffset = 10;

    var innerBarLeftPadding = 5;
    var innerBarRightPadding = 10;

    var innerBarTotalOffsetLeft = barsLeftOffset + innerBarLeftPadding;

    var rectHeight = 30;
    var barAndLabelGap = 10;

    if(data.optimized){
        rectHeight = 30;
        barAndLabelGap = 5;
    }

    for (var i = 0; i < data.expenses.length; i++) {
        var x = 0,
            y = 0;

        barsGroup.append("text")
            .attr("class", "drugNameDisplay" + i)
            .attr("x", 0)
            .attr("y", (rectHeight + 35) * i + 15)
            .style("text-anchor", "start")
            .style("font-size", "12px")
            .style("font-family", "sans-serif")
            .style("fill", "#666")
            .style("opacity", 0.8)
            .text(data.expenses[i].displayLabel);

        barsGroup.append('rect')
            .attr("x", barsLeftOffset)
            .attr("y", ((rectHeight + 35) * i) + 15 + barAndLabelGap)
            .attr("width", maxBarWidth)
            .attr("height", rectHeight)
            .style("fill", "#e1e1e1");
        
        var widthBar = ((parseFloat(data.expenses[i].expensesPercentage) * maxBarWidth) / 100);

        barsGroup.append('rect')
            .attr("x", 0)
            .attr("y", ((rectHeight + 35) * i) + 15 + barAndLabelGap)
            .attr("width", widthBar)
            .attr("height", rectHeight)
            .style("fill", barColor[i])
            .style("opacity", 1);

        barsGroup.append("text")
            .attr("x", maxBarWidth + 20)
            .attr("y", (rectHeight + 35) * i + 35 + barAndLabelGap)
            .style("text-anchor", "start")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .style("fill", barColor[i])
            .style("opacity", 0.8)
            .text("$"+commaFormat(data.expenses[i].expenses));
    }

    if(data.optimized){

    }else{

        barsGroup.append("text")
            .attr("x", maxBarWidth - 50)
            .attr("y", (rectHeight + 35) * 2 + 30)
            .style("text-anchor", "end")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .style("fill", barColor[i])
            .style("opacity", 0.8)
            .text("Best Value Saving");


        barsGroup.append("text")
            .attr("x", maxBarWidth + 20)
            .attr("y", (rectHeight + 35) * 2 + 30)
            .style("text-anchor", "start")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .style("font-family", "sans-serif")
            .style("fill", barColor[i])
            .style("opacity", 0.8)
            .text("$"+commaFormat(calculateBestValueSaving(data)));
    }



}


// Calculating the Expenses in Percentage.
calculateExpansesInPercentage = function (data){

  var currentUtilizationExpanses = findMaxExpenses(data);

  for(var i =0; i<data.expenses.length; i++){
    var expensesPercentage = (data.expenses[i].expenses * 100)/currentUtilizationExpanses;
    data.expenses[i].expensesPercentage = expensesPercentage;
  }

  return data;

}

//calculating the Saving when compare with best value Expenses.
calculateBestValueSaving = function(data){
  var bestValueExpenses = 0;
  var projectedExpenses = 0;
  for(var i =0; i<data.expenses.length; i++){
    if(data.expenses[i].key == "bestValue"){
      bestValueExpenses = data.expenses[i].expenses;
    }else if(data.expenses[i].key == "projected"){
      projectedExpenses = data.expenses[i].expenses;
    }
  }

  var saving = projectedExpenses -  bestValueExpenses;
  return saving;
}


function findMaxExpenses(data) {
  var maxExpense = _.max(_.pluck(data.expenses, 'expenses'));
  return maxExpense;
}