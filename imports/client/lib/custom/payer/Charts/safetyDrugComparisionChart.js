/*
 *   This function creates Drugs Comparision charts in the safety section of each Drug.
 *   We provide the Container id and the data to create a stacked bar chart using C3.js
 */

renderDrugComparisionChart = function(containerName, data) {

    //console.log('******DrugComparision Chart Data*********');
    //console.log(data);
    // Prepare abbreviations of Large Drugs name with array for X-Axix Tick value
    // var extractedDrugs = _.pluck(data.chartData, 'drugName');
    // console.log(extractedDrugs);
    // var abbreviatedDrugs = _.map(extractedDrugs, function(drug) { return getDrugAbbr(drug) });
    // console.log(abbreviatedDrugs);

    //// WHAT IF WE FILTER RECORD BASED ON DRUGS TAKEN BY PATIENTS COUNT 0

    data.chartData = data.chartData.filter(function(itm) { return itm.count_p > 0 });

    var chart = c3.generate({
        bindto: containerName,
        //OLD PADDING BEFORE ROTATE AXIS
        // padding: {
        //     top: 10,
        //     right: 180,
        //     bottom: 30,
        //     left: 40,
        // },
        //NEW PADDING AFTER ROTATE AXIS
        padding: {
            top: 10,
            right: 180,
            bottom: 30,
            left: 220,
        },
        data: {
            type: 'bar',
            json: data.chartData,
            keys: {
                x: 'drugName',
                value: data.groups
            },
            groups: [data.groups],
        },
        size: {
            height: 350,
            width: 850
        },
        color: {
            pattern: ['#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
                //pattern: ['#1379B7','#3cbca9','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
        },
        axis: {
            //// Rotate Axis for chart 
            rotated: true,

            x: {
                type: 'category',

                tick: {
                    fit: true,
                    multiline: false
                },
                // label: {
                //     text: 'Drugs',
                //     position: 'outer-center'
                // }
            },
            y: {
                tick: {
                    //count: 5,
                    format: function(d) {
                        if (d) {
                            //Need to improve
                            return Math.round(d);
                        }
                    }
                },
                label: {
                    text: 'Patients',
                    position: 'outer-middle'
                }
            }
        },
        bar: {
            width: {
                ratio: 0.6
            }
        },
        legend: {
            show: true,
            position: 'inset',
            inset: {
                anchor: 'top-right',
                x: -165,
                y: 10,
                step: 10

            }

        },
        tooltip: {
            show: true,
            grouped: false,
            format: {
                value: function(value, ratio, id) {
                    var patientText = value > 1 ? 'Patients' : 'Patient';
                    return value + ' ' + patientText;
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
    //set the label color on x-axis
    setTimeout(function() {
        // d3.selectAll("svg")
        // d3.selectAll('.spClinicalTrialsSection .c3-axis-x-label')
        //     .attr("dy", "50")
        //     .attr("fill", "#555")
        //     .style("font-size", "14px")
        // d3.selectAll('.spClinicalTrialsSection .c3-axis-y-label')
        //     .attr("dy", "-15")
        //     .attr("fill", "#555")
        //     .style("font-size", "14px");
        // var d = $('.c3-legend-background').parent()[0];
        // var dimen = $(d).attr('transform').replace(/[a-z]/g,'').replace(/\(/g,'').replace(/\)/g,'').split(',');
        // $(d).attr('transform','translate('+(parseFloat(dimen[0])+154)+','+dimen[1]+')');
        // var dlegend  = $('.c3-legend-item text')
        // $(dlegend).each(function(){
        //     var data = $(this).html();
        //     data = data.split('_').join(' ');
        //     $(this).html(data);
        // });
    }, 200);
}

// Function to loop through the array of data and return a unique array. 
getUniqueArray = function(list) {
    var cleaned = [];
    list.forEach(function(itm) {
        var unique = true;
        cleaned.forEach(function(itm2) {
            if (_.isEqual(itm, itm2)) unique = false;
        });
        if (unique) cleaned.push(itm);
    });
    return cleaned;
}



prepareDrugComparisonChartData = function(data) {
    var chartData = [];
    var groups = [];
    var title = [];

    //Modify the given data to convert it into required shape for C3js stacjed chart.
    for (var i = 0; i < data.length; i++) {
        var drugData = data[i];
        var reactionsData = JSON.parse(drugData['adverse_reactions']);
        var json = {};
        var c_sum = 0;
        for (var key in reactionsData) {
            var reaction = reactionsData[key];
            //replace _ from the symptoms name 
            var symptomName = key.split('_').join(' ');

            if (reaction['count'] > 0) {
                groups.push(symptomName);
            }
            json[symptomName] = reaction['count'];
            c_sum += parseInt(reaction['count']);
            json['drugName'] = drugData['DrugName'];
        }
        title.push(drugData['DrugName']);
        json['count_p'] = c_sum;
        chartData.push(json);
    }
    chartData.sort(function(a, b) {
        return a['count_p'] - b['count_p'];
    });
    groups = getUniqueArray(groups);

    return { 'chartData': chartData, 'groups': groups }

}

function getDrugAbbr(drugName) {
    let abbr = '',
        plusSeparated = drugName.split('+');

    for (let i = 0; i < plusSeparated.length; i++) {
        abbr += plusSeparated[i].trim().charAt(0);

        if (i != plusSeparated.length - 1) {
            abbr += ' + ';
        }
    }

    return abbr;
}