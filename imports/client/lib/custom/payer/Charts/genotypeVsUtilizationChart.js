// Function to create Genotype Vs Cirrhosis Chart
/*
 *   Following function creates a stacked bar chart to represent Saving or Expenses on Cirhosis and NoCirhosis patients as per Genotype.
 *   containerName is either id or className where we want to render the chart and data is Filtered dataset.
 *   yAxisPlotCond - Y axis plot condition. It tells us whether we want to show Savings of Expenses on the Y Axis.
 */
genotypeVsUtilizationChart = function(containerName, data, drugName, sizeParams) {

    var chartData = [];
    var groups = [drugName];
    var title = [];
    var yColumnData = 'savings';
    var YAxisLabelText = 'Patient Count';
    totalDisplayPatients = [];
    chartData = data["data"];
    console.log(chartData);
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
                    if (containerName == "#subpopulationChartsPopup-container") {
                        if (i != undefined) {
                            return commaSeperatedNumber(chartData[i].total);
                        } else {
                            //return i+'/'+j +'/'+v;
                        }
                    }
                },
            },
            onclick: function(options) {
                console.log(chartData[options.x].genotype);
                DrawGeoLocationByGenotype(chartData[options.x].Drug, chartData[options.x].zipcode);
            },
        },
        size: {
            height: sizeParams ? sizeParams.height : 380,
            width: sizeParams ? sizeParams.width : 420
        },
        color: {
            pattern: ['#abd6ba', '#2e7e97']
        },
        padding: {
            top: 5,
            right: 0,
            bottom: 10,
            left: 60,
        },
        axis: {
            x: {
                type: 'category',
                label: {
                    text: 'GenoTypes',
                    position: 'outer-center',
                },
            },
            y: {
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
            show: false,
        },
        tooltip: {
            grouped: false,

            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                var dataObj = d[0];
                var countValue = 0,
                    id = dataObj.id;
                // var filterData = chartData.filter(function(rec) {
                //     return rec[id] == dataObj.value;
                // });
                var filterData = chartData[dataObj.index];
                var $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);
                countValue = filterData[drugName];
                // if (id == 'Cirrhosis')
                //     countValue = filterData[0]['cirrhosis_count'];
                // else
                //     countValue = filterData[0]['nonCirrhosis_count'];

                var html = '',
                    valueLabel = 'Patient Count';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Genotype: ' + filterData.genotype + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    // '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patient Count: ' + countValue + '</div>' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div> ' + valueLabel + ': ' + commaSeperatedNumber(dataObj.value) + '</div>' +
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

function DrawGeoLocationByGenotype(drugName, zipCode) {
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(41.013843, -105.115165);
    let myOptions = {
        zoom: 3,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    $('#geomapUtilizationReset').remove();
    $('#geoPopulationSection').prev().append('<div id="geomapUtilizationReset" title="Reset" class="utilizationReset" drugName="' + drugName + '" style="visibility: visible;left: 2%; top: 8px;" ></div>');
    $('#geomapUtilizationReset').click(function() {
        var drugName = $(this).attr('drugName');
        var tempdata = _.groupBy(Pinscriptive['DrugByGenotype'], 'medication');
        var data = tempdata[drugName];
        var zipCode = _.uniq(_.pluck(data, 'zipcode'));
        $('#geomapUtilizationReset').remove();
        DrawGeoLocationByGenotype(drugName, zipCode);
    });
    let map = new google.maps.Map(document.getElementById('geoPopulationSection'), myOptions);
    _.each(zipCode, function(value) {
        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + value + '&sensor=false&components=country:US', null, (response) => {
            //console.log(response);
            //null check for location info
            let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;

            map.setCenter(location);
            let marker = new google.maps.Marker({
                map: map,
                position: location
            });
            google.maps.event.trigger(map, 'resize');
        });
    });
}