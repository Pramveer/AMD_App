var jsonData;
var filterData = [];

var pieColors = [
	{ strokeColor:  '#38b19d', textColor: '#3cbca9'},
	{ strokeColor:  '#d65151', textColor: '#e05454'},
	{ strokeColor:  '#815493', textColor: '#925ca5'}
];

function TemplateRendered() {

	$.ajaxSetup({
		async: false
	});

	$.getJSON('chartData/data.json', function(response) {
		jsonData = response;
	});

	$.ajaxSetup({
		async: true
	});


	// removed modify drug so now showing all drugs on charts
	var allDrugsData = jsonData;
	var uti = roundToExact100(allDrugsData, 100, 'Utilization', 'Utilization');
	var net = roundToExact100(allDrugsData, 100, 'Utilization', 'NetworkLength');
	var provi = roundToExact100(allDrugsData, 100, 'Utilization', 'ProviderLength');

	for (var k = 0; k < allDrugsData.length; k++) {
		filterData.push(allDrugsData[k]['DrugName']);
		allDrugsData[k]['Utilization'].Utilization = uti[k];
		allDrugsData[k]['Utilization'].NetworkLength = net[k];
		allDrugsData[k]['Utilization'].ProviderLength = provi[k];
	}

	localStorage.setItem('AllDrugsData', JSON.stringify(allDrugsData));
	GenerateUtilizationBarBubbleMixedChart(filterData);

};

$(document).ready(function() {
	TemplateRendered();
});

// Math.floor(Math.random() * ((y-x)+1) + x);
var selectedDrugName = filterData && filterData.length > 0 ? filterData : [];


//var allDrugData = localStorage.AllDrugsData && JSON.parse(localStorage.AllDrugsData) ? JSON.parse(localStorage.AllDrugsData) : [];
// remove extra parsing process for faster performance
var allDrugData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];

//var selectedDrugName = JSON.parse(sampleData);
//console.log("Selected Drug length" + selectedDrugName.length);
if (selectedDrugName.length > 0) {
	//Filter drugs data by drug name with data
	var allDrugData = JSON.parse(localStorage.AllDrugsData);

	var filterDrugs = allDrugData.filter(function(d) {
		if (selectedDrugName.indexOf(d.DrugName) > -1) {
			return true;
		} else {
			return false;
		}
	});


	for (var i = 0; i <= selectedDrugName.length - 1; i++) {
		var drugData = {};

		var splittedDrug = selectedDrugName[i].split('+');
		if (splittedDrug.length > 1) {
			//split second index drug with '(' symbol
			var furtherSplittedDrug = splittedDrug[1].split('(');
			if (furtherSplittedDrug.length > 1) {
				//To Do display  both array as zero index drug from it is and also set title for it               
				drugData["Medication"] = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');
			} else {
				//To Do display  both array as zero index drug from it is and also set title for it  
				if (splittedDrug.length > 2) {
					drugData["Medication"] = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');

				} else {
					drugData["Medication"] = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);

				}
			}
		} else {
			//To Do display drug as it is and also set title for it
			drugData["Medication"] = selectedDrugName[i];

		}


		$('.data-conatainer').show();
		$('.efficacy-warning').hide();
		//drugData["Medication"] = selectedDrugName[i];
		var Me, MyNetwork, PopulationHealth;
		PopulationHealth = filterDrugs[i] && filterDrugs[i]["Utilization"]["Utilization"] ? Number(filterDrugs[i]["Utilization"]["Utilization"]) : 0;
		Me = filterDrugs[i] && filterDrugs[i]["Utilization"]["ProviderLength"] ? Number(filterDrugs[i]["Utilization"]["ProviderLength"]) : 0;
		MyNetwork = filterDrugs[i] && filterDrugs[i]["Utilization"]["NetworkLength"] ? Number(filterDrugs[i]["Utilization"]["NetworkLength"]) : 0;
		drugData["Genotype"] = 1;
		drugData["Treatment"] = "Naive";
		drugData["TreatmentPeriod"] = "12 Weeks";
		drugData["Cirrhosis"] = "WO";

		drugData["Me"] = Me.toFixed(2);
		drugData["My Network"] = MyNetwork.toFixed(2);
		drugData["SVR"] = 87 - i / 2;

		drugData["Population Health"] = PopulationHealth.toFixed(2);
		jsonData.push(drugData);

	}


	var chart = c3.generate({
		padding: {
			bottom: 20,
			left: 30
		},
		size: {
			height: 400
		},
		bindto: '#utilization-bar-chart',
		data: {
			//Set X- axis label
			json: jsonData,

			keys: {
				x: 'Medication', // it's possible to specify 'x' when category axis
				value: ['Me', 'My Network', 'Population Health'],
			},
			colors: {
				'Me': '#5B9BD5',
				'My Network': '#ED7D31',
				'Population Health': '#A5A5A5'
			},
			type: 'bar',
			labels: {
				format: function(v, id, i, j) {
					return v + '%';
				}
			},
		},
		axis: {
			x: {
				type: 'categorized',

			},
			y: {
				tick: {
					format: function(v) {
						return v + '%';
					}
				},
				//Do not supply ax or min value if range is not known 
				// max: 60,
				// min: 0,
				// Range includes padding, set 0 if no padding needed
				padding: {
					top: 10,
					bottom: 0
				}
			}
		}
		// ,
		// zoom: {
		// enabled: true
		// }
	});

	//// custom tooltip for c3 graph
	d3.selectAll('.c3-axis-x>.tick')
		.append('title')
		.text(function(d) {
			return d < selectedDrugName.length ? selectedDrugName[d] : '';
		});
	// set minimum height for scroll in drug selection slide
	//$('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));


} else {	
	//$('.data-conatainer').hide();
	//$('.efficacy-warning').show();
	//$('.cbContainer').hide();

	//Hide table as well as graph

};

function GenerateUtilizationBarBubbleMixedChart(filterData) {
	//var DrugData = localStorage.AllDrugsData && JSON.parse(localStorage.AllDrugsData) ? JSON.parse(localStorage.AllDrugsData) : [];
	// remove extra parsing process for faster performance
	var DrugData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];
	var DrugData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];
	var columnsData = [];
	var OtherValue = 0;
	var OtherValueMe = 0,
		OtherValueMyNetwork = 0,
		OtherValuePopulationHealth = 0;
	var totalUtiScore = 0;

	var allDrugData = [],
		filterSelectedDrugs = [],
		otherDrugs = [];
	//Created business logic to first grab selected drugs along with non selected drugs
	filterSelectedDrugs = DrugData.filter(function(d) {
		return filterData.indexOf(d.DrugName) > -1;
	});
	//concat or merge two json object  to one 
	allDrugData = filterSelectedDrugs.concat(otherDrugs);

	for (var i = 0; i < allDrugData.length; i++) {

		var utiScore = allDrugData[i] && allDrugData[i]["Utilization"]["Utilization"] ? allDrugData[i]["Utilization"]["Utilization"] : 0;
		totalUtiScore = Number(totalUtiScore) + Number(utiScore);

		var wrapDrug = '';
		column = [];
		
		var splittedDrug = allDrugData[i]["DrugName"].split('+');
		if (splittedDrug.length > 1) {
			//split second index drug with '(' symbol
			var furtherSplittedDrug = splittedDrug[1].split('(');
			if (furtherSplittedDrug.length > 1) {
				//To Do display  both array as zero index drug from it is and also set title for it               
				wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');
			} else {
				//To Do display  both array as zero index drug from it is and also set title for it  
				if (splittedDrug.length > 2) {
					wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');

				} else {
					wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);

				}
			}
		} else {
			//To Do display drug as it is and also set title for it
			wrapDrug = allDrugData[i]["DrugName"];

		}
		
		var Me, MyNetwork, PopulationHealth;
		PopulationHealth = allDrugData[i] && allDrugData[i]["Utilization"]["Utilization"] ? Number(allDrugData[i]["Utilization"]["Utilization"]) : 0;
		Me = allDrugData[i] && allDrugData[i]["Utilization"]["ProviderLength"] ? Number(allDrugData[i]["Utilization"]["ProviderLength"]) : 0;
		MyNetwork = allDrugData[i] && allDrugData[i]["Utilization"]["NetworkLength"] ? Number(allDrugData[i]["Utilization"]["NetworkLength"]) : 0;
		
		//Check weather same truncated drug name exist or not
		var calculatedDrugs = columnsData.filter(function(d) {
			if (d[0] == wrapDrug) {
				return true;
			} else {
				return false;
			}
		});

		if (calculatedDrugs.length > 0) {
			wrapDrug = wrapDrug + ' ';
		}
		var row = {};
		if (columnsData.length > filterSelectedDrugs.length) {
			//Set remaining value to others if more than 4 drug is selected
			OtherValue = Number(OtherValue) + Number(utiScore);
			OtherValueMe = Number(OtherValueMe) + Number(Me);
			OtherValueMyNetwork = Number(OtherValueMyNetwork) + Number(MyNetwork);
			OtherValuePopulationHealth = Number(OtherValuePopulationHealth) + Number(PopulationHealth);
			if (i === (allDrugData.length - 1)) {
				// column.push("Other");
				// column.push(OtherValue);
				row.label = "Other";
				row.value = OtherValue;
				row.extra = "Other";
				row["Me"] = OtherValueMe;
				row["My Network"] = OtherValueMyNetwork;
				row["SVR"] = 87 + i / 2;
				row["Population Health"] = OtherValuePopulationHealth;
				columnsData.push(row);
			}
		} else {
			row.label = allDrugData[i]["DrugName"];
			row.value = Number(utiScore);
			row.extra = allDrugData[i]["DrugName"];
			row["Me"] = Me.toFixed(2);
			row["My Network"] = MyNetwork.toFixed(2);
			row["SVR"] = 87 - i / 2;

			row["Population Health"] = PopulationHealth.toFixed(2);
			// column.push(wrapDrug);
			// column.push(Number(utiScore));

			columnsData.push(row);
		}
	}

	//Generate pie chart with d3pie library
	$("#utilization-pie-chart").empty();
	//var pie = new d3pie("utilization-pie-chart");	
	d3.select('.dimpleMapsContainer').selectAll("*").remove();
	var svgHieght = filterSelectedDrugs.length * 110;
	
	var svg1 = d3.select("#utilization-pie-chart-part1").append("svg").attr("height", svgHieght).attr("width", 775).style("background", "");
	var svg2 = d3.select("#utilization-pie-chart-part2").append("svg").attr("height", svgHieght).attr("width", 270).style("background", "");
	//var chartLegendSvg = d3.select("#chart-legend").append("svg").attr("height", svgHieght).style("background", "");
	
	var barColor = ['#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430'];
	var barInnerCircleColor = ['#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430', '#102430'];
	
	var firstGroup = svg1.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")");
	var secondGroup = svg2.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")");
	//var legendGroup = chartLegendSvg.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")");

	for (var i = 0; i < filterSelectedDrugs.length; i++) {
		
		var x = 0, y = 0, rectHeight = 75;
		var HeaderHieght = 20;		
		var arr1 = columnsData[i].label.split('+');
		
		if (arr1.length > 0) {
			var popupHeader = firstGroup.append("text")
				.attr("class", "drugNameDisplay")
				.attr("x", 0)
				.attr("y", (rectHeight + 5) * i + 30)
				//    .attr("height", bubbleData['Size'] * 3)
				.style("text-anchor", "start")
				.style("font-size", "11.8px")
				.style("font-weight", "bold")
				.style("fill", "#696868")
				.style("opacity", 1.0);
			for (var j = 0; j < arr1.length; j++) {
				if (j === 0) {
					popupHeader.append('tspan')
						.attr('x', 0)
						.attr('dy', 7)
						.text(arr1[j]);
					HeaderHieght = HeaderHieght + 7;
				} else {
					popupHeader.append('tspan')
						.attr('x', 0)
						.attr('dy', 15)
						.text(arr1[j]);
					HeaderHieght = HeaderHieght + 15;
				}

			}
		} else {
			var popupHeader = firstGroup.append("text")
				.attr("class", "drugNameDisplay")
				.attr("x", 0)
				.attr("y", (rectHeight + 5) * i + 30)
				//    .attr("height", bubbleData['Size'] * 3)
				.style("text-anchor", "start")
				.style("font-size", "13px")
				.style("font-weight", "bold")
				.style("font-family", "Open Sans, sans-serif")
				.style("fill", "#696868")
				.style("opacity", 0.7)
				.text(columnsData[i].label);
			HeaderHieght = HeaderHieght + 7;
		}
		
		//ADD BACKGROUND COLUMN
		firstGroup.append('rect')
			.attr("rx", 27.5)
			.attr("ry", 27.5)
			 .attr("x", 110)
			 .attr("y", ((rectHeight + 5) * i) + 10)
			 .attr("width", 550)
			 .attr("height", rectHeight - 20)
			 .style("fill", "#E4F4FF")
			 .style("stroke", "#C7E7FC")
			// //    .style("stroke-width", 1)
			// //    .style("opacity", 0.71)
			// //    .attr("rx", 8)
			// //    .attr("ry", 8);
		
		var widthBar = ((parseFloat(columnsData[i].value) * 550) / 100);
		
		// ADD FIRST CIRCLE AT END
		firstGroup.append('rect')
			.attr("x", 110)
			.attr("y", ((rectHeight + 5) * i) + 10)
			.attr("width", widthBar)
			.attr("height", rectHeight - 20)
			.style("fill", barColor[i])
			.style("opacity", 1);
		
		// ADD CIRCLE AT END
		firstGroup.append('circle')
			.attr("cx", 110 + widthBar)
			.attr("cy", ((rectHeight + 5) * i) + 37.5)
			.attr("r", 27.5)
			.style("fill", barInnerCircleColor[i])
			//.style("stroke", "#ffffff")
			.style("stroke-width", 1)
			.style("opacity", 1);
		
		
		//FIRST ROW INDICATOR VALUE TEXT
		var val = columnsData[i].value;
		val = val.toFixed(0);
		firstGroup.append("text")
			.attr("class", "drugNameDisplayText")
			.attr("x", 700)
			.attr("y", ((rectHeight + 5) * i) + 40)
			.style("text-anchor", "middle")
			.style("font-size", "18px")
			.style("font-weight", "bold")
			.style("font-family", "Open Sans, sans-serif")
			.style("fill", "rgb(105, 104, 104)")
			.style("opacity", 1)
			.text(getPadded(val) + '%');
	}

	for (var i = 0; i < filterSelectedDrugs.length; i++) {
		
		var x = 0, y = 0, rectHeight = 75;
		var me = Math.round(columnsData[i]['Me']);
		var myNetwork = Math.round(columnsData[i]['My Network']);
		var PopulationHealth = Math.round(columnsData[i]["Population Health"]);

		// FIRST CIRCLE IN ROW
		secondGroup.append('circle')
			.attr("cx", 40)
			.attr("cy", ((rectHeight + 5) * i) + 37.5)
			//    .attr("r", calculateBubbleSize(columnsData, me, 'Me'))
			.attr("r", 27.5)
			.style("fill", "none")
			.style("stroke", pieColors[0].strokeColor)
			.style("stroke-width", 5)
			.style("opacity", 1);
		
		// FIRST CIRCLE TEXT
		secondGroup.append("text")
			.attr("class", "drugNameDisplayText")
			.attr("x", 40)
			.attr("y", ((rectHeight + 5) * i) + 40)
			.style("text-anchor", "middle")
			.style("font-size", "15px")
			.style("font-weight", "bold")
			.style("font-family", "Open Sans, sans-serif")
			.style("fill", pieColors[0].textColor)
			.style("opacity", 0.4)
			.text(getPadded(me) + '%');

			
		// SECOND CIRCLE
		secondGroup.append('circle')
			.attr("cx", 140)
			.attr("cy", ((rectHeight + 5) * i) + 37.5)
			//.attr("r", calculateBubbleSize(columnsData, myNetwork, 'My Network'))
			.attr("r", 27.5)
			.style("fill", "none")
			.style("stroke", pieColors[1].strokeColor)
			.style("stroke-width", 5)
			.style("opacity", 1);
		
		// SECOND CIRCLE TEXT
		secondGroup.append("text")
			.attr("class", "drugNameDisplayText")
			.attr("x", 140)
			.attr("y", ((rectHeight + 5) * i) + 40)
			.style("text-anchor", "middle")
			.style("font-size", "15px")
			.style("font-weight", "bold")
			.style("font-family", "Open Sans, sans-serif")
			.style("fill", pieColors[1].textColor)
			.style("opacity", 1)
			.text(getPadded(myNetwork) + '%');
		
		// THIRD CIRCLE
		secondGroup.append('circle')
			.attr("cx", 230)
			.attr("cy", ((rectHeight + 5) * i) + 37.5)
			.attr("r", 27.5)
			.style("fill", "none")
			.style("stroke", pieColors[2].strokeColor)
			.style("stroke-width", 5)
			.style("opacity", 1);
		
		// THIRD CIRCLE TEXT
		secondGroup.append("text")
			.attr("class", "drugNameDisplayText")
			.attr("x", 230)
			.attr("y", ((rectHeight + 5) * i) + 40)
			.style("text-anchor", "middle")
			.style("font-size", "15px")
			.style("font-weight", "bold")
			.style("font-family", "Open Sans, sans-serif")
			.style("fill", pieColors[2].textColor)
			.style("opacity", 1)
			.text(getPadded(PopulationHealth) + '%');
	}
	//    calculateBubbleSize(columnsData, me, 'Population Health');    
};

/**
 *  Prepare Utilization pie chart for all drugs for patient 
 */
function GenerateUtilizationPieChart(filterData) {
	//var DrugData = localStorage.AllDrugsData && JSON.parse(localStorage.AllDrugsData) ? JSON.parse(localStorage.AllDrugsData) : [];
	// remove extra parsing process for faster performance
	var DrugData = localStorage.AllDrugsData ? JSON.parse(localStorage.AllDrugsData) : [];
	var columnsData = [];
	var OtherValue = 0;
	var totalUtiScore = 0;


	var allDrugData = [],
		filterSelectedDrugs = [],
		otherDrugs = [];
	//Created business logic to first grab selected drugs along with non selected drugs
	filterSelectedDrugs = DrugData.filter(function(d) {
		return filterData.indexOf(d.DrugName) > -1;
	});
	//concat or merge two json object  to one 
	allDrugData = filterSelectedDrugs.concat(otherDrugs);

	for (var i = 0; i < allDrugData.length; i++) {

		var utiScore = allDrugData[i] && allDrugData[i]["Utilization"]["Utilization"] ? allDrugData[i]["Utilization"]["Utilization"] : 0;

		totalUtiScore = Number(totalUtiScore) + Number(utiScore);

		var wrapDrug = '';
		column = [];
		var splittedDrug = allDrugData[i]["DrugName"].split('+');
		if (splittedDrug.length > 1) {
			//split second index drug with '(' symbol
			var furtherSplittedDrug = splittedDrug[1].split('(');
			if (furtherSplittedDrug.length > 1) {
				//To Do display  both array as zero index drug from it is and also set title for it               
				wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');
			} else {
				//To Do display  both array as zero index drug from it is and also set title for it  
				if (splittedDrug.length > 2) {
					wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');

				} else {
					wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);

				}
			}
		} else {
			//To Do display drug as it is and also set title for it
			wrapDrug = allDrugData[i]["DrugName"];

		}

		//Check weather same truncated drug name exist or not
		var calculatedDrugs = columnsData.filter(function(d) {
			return d[0] === wrapDrug;
		});

		if (calculatedDrugs.length > 0) {
			wrapDrug = wrapDrug + ' ';
		}
		var row = {};
		if (columnsData.length > 3) {
			//Set remaining value to others if more than 4 drug is selected
			OtherValue = Number(OtherValue) + Number(utiScore);

			if (i === (allDrugData.length - 1)) {
				// column.push("Other");
				// column.push(OtherValue);
				row.label = "Other";
				row.value = OtherValue;
				row.extra = "Other"

			}
		} else {
			row.label = allDrugData[i]["DrugName"];
			row.value = Number(utiScore);
			row.extra = allDrugData[i]["DrugName"];
			// column.push(wrapDrug);
			// column.push(Number(utiScore));


		}
		columnsData.push(row);
	}

	//Generate pie chart with d3pie library
	$("#utilization-pie-chart").empty();
	var pie = new d3pie("utilization-pie-chart", {
		size: {
			//canvasHeight: 400
			canvasWidth: 800
		},
		data: {
			content: columnsData
		},
		tooltips: {
			enabled: true,
			type: "placeholder",
			//string: "{label}: {percentage}% ({value})",
			string: "{label}: {value}%",

			// data is an object with the three properties listed below. Just modify the properties
			// directly - there's no need to return anything
			placeholderParser: function(index, data) {
				data.label = data.label + " ";
				data.value = data.value.toFixed(2);
				//data.value = data.value.toFixed(2);
			}
		}
	});

};

function drawLegend(){
	
	var legends = $('.legend-item');
	
	legends.each(function(index, legend){
		
		var icon = $(legend).find('.utilization-legend-icon')[0];
		
		var svgDimension = 30;
		var trans = svgDimension / 2;
		
		var svg = d3.select(icon).append("svg").attr("height", svgDimension).attr("width",svgDimension).style("background", "");
		var group = svg.append('g').attr("transform", "translate(" + trans + "," + trans + ")");				
		group.append('circle')
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", 13)
			.style("fill", "none")
			.style("stroke", "#DEE0DF")
			.style("stroke-width", 2)
			.style("opacity", 1);
		
	});
	
	
}

drawLegend();



function roundToExact100(l, target, identifier, key) {
	var off = target - _.reduce(l, function(acc, x) {
		return acc + Math.round(x[identifier][key])
	}, 0);
	return _.chain(l).
		//sortBy(function(x) { return Math.round(x.a) - x.a }).
	map(function(x, i) {
		return Math.round(x[identifier][key]) + (off > i) - (i >= (l.length + off))
	}).
	value();
}

function getPadded(number)
{
	var digit = getlength(number);
	var str = number.toString();
	if(digit == 1)
	{
		var str = pad(number, 2);
	}
	return str;
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function getlength(number) {
    return number.toString().length;
}