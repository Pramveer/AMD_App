import './dashboard.html';
import '../../components/sidebars/patientsidebar.js';

Template.Dashboard.onCreated(function() {

});

Template.Dashboard.rendered = () => {

  renderCharts();

};

Template.Dashboard.ReRenderCharts = () => {
    renderCharts();
};

Template.Dashboard.helpers({

});

let renderCharts = () => {
    let colors = ['#2e7e97', '#67BC42', '#3399CC', '#F0E68C', '#BC36FE', '#000'];
    // Building Data for Line Chart
    let  LineChartData = {};
    LineChartParameters = {};
    LineChartParameters.container= 'hepetitiesChart';
    LineChartParameters.title= 'Title';
    LineChartParameters.subtitle= 'Subtitle';
    LineChartParameters.xAxisText= 'x-axis';
    LineChartParameters.yAxisText= 'Y-Axis Text';
    LineChartData = [{name: 'Anti-HCV Therapy',data: [{mydata: '2013', y: 15},{mydata: '2014', y: 0},{mydata: '2015', y: 5},{mydata: '2016', y: 4}]}]
    // Building Data for Column Chart
    let columnChartData = {};
    columnChartParameters = {};
    columnChartParameters.container= 'HCVPrevelenceChart';
    columnChartParameters.title= 'Title';
    columnChartParameters.subtitle= 'Subtitle';
    columnChartParameters.categories= ['2013', '2014', '2015','2016'];
    columnChartParameters.yAxisText= 'Y-Axis Text';
    columnChartData = [{name: 'Hepitities C',data: [{mydata: 'Anti1', y: 5},{mydata: 'Anti1', y: 4},{mydata: 'Anti1', y: 3},{mydata: 'Anti1', y: 2}]},{name: 'Vitamin C',data: [{mydata: 'Anti1', y: 4},{mydata: 'Anti1', y: 3},{mydata: 'Anti1', y: 2}]}];
    // Building Data for MultiLine Chart
    let  multilineChartData = {};
    multilineChartParameters = {};
    multilineChartParameters.container= 'hcvPrevelenceChart';
    multilineChartParameters.title= 'Title';
    multilineChartParameters.subtitle= 'Subtitle';
    multilineChartParameters.xAxisText= 'x-axis';
    multilineChartParameters.yAxisText= 'Y-Axis Text';
    multilineChartData= [{name: 'Hep C',data: [{mydata: 'Anti1', y: 5},{mydata: 'Anti1', y: 4},{mydata: 'Anti1', y: 3},{mydata: 'Anti1', y: 2}]},{name: 'Vitamin C',data: [{mydata: 'Anti1', y: 4},{mydata: 'Anti1', y: 3},{mydata: 'Anti1', y: 2}]}]
    // Building Data for Stacked Chart
    let payermixChartData = {};
    payermixChartParameters = {};
    payermixChartParameters.container= 'payermix';
    payermixChartParameters.title= 'Title';
    payermixChartParameters.subtitle= 'Subtitle';
    payermixChartParameters.xAxisText= 'Year';
    payermixChartParameters.categories=['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas'];
    payermixChartParameters.yAxisText= 'Y-Axis Text';
    payermixChartData =[{name: 'John', data: [5, 3, 4, 7, 2]}, {name: 'Jane',data: [2, 2, 3, 2, 1]}, {name: 'Joe',data: [3, 4, 4, 2, 5]}]
    // Building Data for Market Chart
    let MarketChartData = {};
    MarketChartParameters = {};
    MarketChartParameters.container= 'markerShareOverMonthsChart';
    MarketChartParameters.title= 'Title';
    MarketChartParameters.subtitle= 'Subtitle';
    MarketChartParameters.xAxisText= 'Year';
    MarketChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    MarketChartParameters.yAxisText= 'Y-Axis Text';
    MarketChartData =[{name: 'John', data: [5, 3, 4, 7, 2]}, {name: 'Jane',data: [2, 2, 3, 2, 1]}, {name: 'Joe',data: [3, 4, 4, 2, 5]}]
    // Building Data for RX Chart
    let rxChartData = {};
    rxChartParameters = {};
    rxChartParameters.container= 'prescriptionCount-rxCost';
    rxChartParameters.title= 'Title';
    rxChartParameters.subtitle= 'Subtitle';
    rxChartParameters.xAxisText= 'Year';
    rxChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    rxChartParameters.yAxisText= 'Y-Axis Text';
    rxChartData =[{name: 'John', data: [5, 3, 4, 7, 2]}, {name: 'Jane',data: [2, 2, 3, 2, 1]}, {name: 'Joe',data: [3, 4, 4, 2, 5]}]
    // Building Data for IngredientCost Chart
    let ingredientChartData = {};
    ingredientChartParameters = {};
    ingredientChartParameters.container= 'notalCount-IngredientCost';
    ingredientChartParameters.title= 'Title';
    ingredientChartParameters.subtitle= 'Subtitle';
    ingredientChartParameters.xAxisText= 'Year';
    ingredientChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    ingredientChartParameters.yAxisText= 'Y-Axis Text';
    ingredientChartData =[{"name": "Browsers","colorByPoint": true,"data": [{
                    "name": "Chrome",
                    "y": 62.74,
                    "drilldown": "Chrome"
                },
                {
                    "name": "Firefox",
                    "y": 10.57,
                    "drilldown": "Firefox"
                },
            {
                    "name": "Other",
                    "y": 7.62,
                    "drilldown": null
                }
            ]
        }
    ];
    // Building Data for avgcost Chart
    let avgcostChartData = {};
    avgcostChartParameters = {};
    avgcostChartParameters.container= 'treamentAvgCostSelection';
    avgcostChartParameters.title= 'Title';
    avgcostChartParameters.subtitle= 'Subtitle';
    avgcostChartParameters.xAxisText= 'Year';
    avgcostChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    avgcostChartParameters.yAxisText= 'Y-Axis Text';
    avgcostChartData =[{"name": "Browsers","colorByPoint": true,"data": [{
        "name": "Chrome",
        "y": 62.74,
        "drilldown": "Chrome"
    },
    {
        "name": "Firefox",
        "y": 10.57,
        "drilldown": "Firefox"
    },
    {
        "name": "Other",
        "y": 7.62,
        "drilldown": null
    }
    ]
    }
    ];
    // Building Data for Count Chart
    let countChartData = {};
    countChartParameters = {};
    countChartParameters.container= 'Count-ContainerDashboard';
    countChartParameters.title= 'Title';
    countChartParameters.subtitle= 'Subtitle';
    countChartParameters.xAxisText= 'Year';
    countChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    countChartParameters.yAxisText= 'Y-Axis Text';
    countChartData =[{name: 'John', data: [5, 3, 4, 7, 2]}, {name: 'Jane',data: [2, 2, 3, 2, 1]}, {name: 'Joe',data: [3, 4, 4, 2, 5]}]
    // Building Data for fibrosis Chart
    let fibrosisChartData = {};
    fibrosisChartParameters = {};
    fibrosisChartParameters.container= 'tPatientsbyFibrosis';
    fibrosisChartParameters.title= 'Title';
    fibrosisChartParameters.subtitle= 'Subtitle';
    fibrosisChartParameters.xAxisText= 'Year';
    fibrosisChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    fibrosisChartParameters.yAxisText= 'Y-Axis Text';
    fibrosisChartData =[{name: 'John', data: [5, 3, 4, 7, 2]}, {name: 'Jane',data: [2, 2, 3, 2, 1]}, {name: 'Joe',data: [3, 4, 4, 2, 5]}]
    // Building Data for Genotype Chart
    let genotypeChartData = {};
    genotypeChartParameters = {};
    genotypeChartParameters.container= 'tPatientbygenotype';
    genotypeChartParameters.title= 'Title';
    genotypeChartParameters.subtitle= 'Subtitle';
    genotypeChartParameters.xAxisText= 'Year';
    genotypeChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    genotypeChartParameters.yAxisText= 'Y-Axis Text';
    genotypeChartData =[{name: '', colorByPoint: true, data: [{ name: 'Blue', y: 5.78, color: colors[0] }, {
            name: 'Green',
            y: 5.19,
            color: colors[1]

        }, {
            name: 'Purple',
            y: 19.33,
            color: colors[4]

        }]
    }];

    // Building Data for IngredientCost Chart
    let ingredientcontainerChartData = {};
    ingredientcontainerChartParameters = {};
    ingredientcontainerChartParameters.container= 'IngredientCost-ContainerDashboard';
    ingredientcontainerChartParameters.title= 'Title';
    ingredientcontainerChartParameters.subtitle= 'Subtitle';
    ingredientcontainerChartParameters.xAxisText= 'Year';
    ingredientcontainerChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    ingredientcontainerChartParameters.yAxisText= 'Y-Axis Text';
    ingredientcontainerChartData =[{name: 'John', data: [5, 3, 4, 7, 2]}, {name: 'Jane',data: [2, 2, 3, 2, 1]}, {name: 'Joe',data: [3, 4, 4, 2, 5]}]
    // Building Data for prescribe Chart
    let prescribeChartData = {};
    prescribeChartParameters = {};
    prescribeChartParameters.container= 'patients-prescribed';
    prescribeChartParameters.title= 'Title';
    prescribeChartParameters.subtitle= 'Subtitle';
    prescribeChartParameters.xAxisText= 'Year';
    prescribeChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    prescribeChartParameters.yAxisText= 'Y-Axis Text';
    prescribeChartData =[{name: '', colorByPoint: true, data: [{ name: 'Blue', y: 5.78, color: colors[0] }, {
            name: 'Green',
            y: 5.19,
            color: colors[1]

        }, {
            name: 'Purple',
            y: 19.33,
            color: colors[4]

        }]
    }];

    // Building Data for patientsTreatment Chart
    let patientsTreatmentcontainerChartData = {};
    patientsTreatmentcontainerChartParameters = {};
    patientsTreatmentcontainerChartParameters.container= 'tPatientsBytreatment';
    patientsTreatmentcontainerChartParameters.title= 'Title';
    patientsTreatmentcontainerChartParameters.subtitle= 'Subtitle';
    patientsTreatmentcontainerChartParameters.xAxisText= 'Year';
    patientsTreatmentcontainerChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    patientsTreatmentcontainerChartParameters.yAxisText= 'Y-Axis Text';
    patientsTreatmentcontainerChartData =[{name: 'John', data: [5, 3, 4, 7, 2]}, {name: 'Jane',data: [2, 2, 3, 2, 1]}, {name: 'Joe',data: [3, 4, 4, 2, 5]}]
    // Building Data for drugFibrosis Chart
    let  drugFibrosiChartData = {};
    drugFibrosiChartParameters = {};
    drugFibrosiChartParameters.container= 'fibrosis';
    drugFibrosiChartParameters.title= 'Title';
    drugFibrosiChartParameters.subtitle= 'Subtitle';
    drugFibrosiChartParameters.xAxisText= 'Year';
    drugFibrosiChartParameters.categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    drugFibrosiChartParameters.yAxisText= 'Y-Axis Text';
    drugFibrosiChartData =[{name: 'John', data: [5, 3, 4, 7, 2]}, {name: 'Jane',data: [2, 2, 3, 2, 1]}, {name: 'Joe',data: [3, 4, 4, 2, 5]}]
    //charts function call
    renderMapChart();
    renderhepetitiesChart(LineChartParameters,LineChartData);
    renderHCVPrevelenceChart(columnChartParameters,columnChartData);
    renderhcvPrevelenceChart(multilineChartParameters,multilineChartData);
    renderpayermixchart(payermixChartParameters,payermixChartData);
    markerShareOverMonthsChart(MarketChartParameters,MarketChartData);
    renderrxCost(rxChartParameters,rxChartData);
    renderIngredientCostChart(ingredientChartParameters,ingredientChartData);
    rendercostselectionchart(avgcostChartParameters,avgcostChartData);
    renderCountContainerDashboard(countChartParameters,countChartData);
    renderfibrosisDashboard(fibrosisChartParameters,fibrosisChartData);
    rendertPatientbygenotype(genotypeChartParameters,genotypeChartData);
    renderingredientcontainer(ingredientcontainerChartParameters,ingredientcontainerChartData);
    rendertprescribeChart(prescribeChartParameters,prescribeChartData);
    renderpatientsTreatmentcontainer(patientsTreatmentcontainerChartParameters,patientsTreatmentcontainerChartData);
    renderdrugfibrosisChart(drugFibrosiChartParameters,drugFibrosiChartData);
}



let renderMapChart =() => {

$.getJSON('https://cdn.rawgit.com/highcharts/highcharts/057b672172ccc6c08fe7dbb27fc17ebca3f5b770/samples/data/us-population-density.json', function (data) {

  // Make codes uppercase to match the map data
  $.each(data, function () {
      this.code = this.code.toUpperCase();
  });

  // Instantiate the map
  Highcharts.mapChart('us-map', {

      chart: {
          map: 'countries/us/us-all',
          borderWidth: 1
      },

      title: {
          text: 'US population density (/km²)'
      },

      exporting: {
          sourceWidth: 600,
          sourceHeight: 500
      },

      legend: {
          layout: 'horizontal',
          borderWidth: 0,
          backgroundColor: 'rgba(255,255,255,0.85)',
          floating: true,
          verticalAlign: 'top',
          y: 25
      },

      mapNavigation: {
          enabled: true
      },

      colorAxis: {
          min: 1,
          type: 'logarithmic',
          minColor: '#EEEEFF',
          maxColor: '#000022',
          stops: [
              [0, '#EFEFFF'],
              [0.67, '#4444FF'],
              [1, '#000022']
          ]
      },

      series: [{
          animation: {
              duration: 1000
          },
          data: data,
          joinBy: ['postal-code', 'code'],
          dataLabels: {
              enabled: true,
              color: '#FFFFFF',
              format: '{point.code}'
          },
          name: 'Population density',
          tooltip: {
              pointFormat: '{point.code}: {point.value}/km²'
          }
      }]
  });
});

}

let  renderhepetitiesChart = (parameters,LineChartData) => {
    Highcharts.chart(parameters.container, {
        chart: {
            type: 'line'
        },
        title: {
            text:parameters.title
        },
        subtitle: {
            text:parameters.subtitle
        },
        xAxis: {
            title: {
                text:parameters.xAxisText
            }
        },
        yAxis: {
            title: {
                text:parameters.yAxisText
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            },
            
			 },
        legend: {
            enabled: false
        },
        series:LineChartData
    });
   }

let renderHCVPrevelenceChart = (parameters,columnChartData) => {
    Highcharts.chart(parameters.container, {
   
        chart: {
            type: 'column'
        },
        title: {
            text:parameters.title
        },
        xAxis: {
            categories:parameters.categories 
        },
        yAxis: {
            title: {
                text:parameters.yAxisText
            }
        },
		plotOptions: {
            column: {
               
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            }
		},
        series: columnChartData
		
});
}



let renderhcvPrevelenceChart = (parameters,multilineChartData) => {
    Highcharts.chart(parameters.container, {
        chart: {
            type: 'line'
        },
        title: {
            text:parameters.title
        },
        subtitle: {
            text:parameters.subtitle
        },
        xAxis: {
            title: {
                text:parameters.xAxisText
            }
        },
        yAxis: {
            title: {
                text:parameters.yAxisText
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            },
            
			 },
        legend: {
            enabled: false
        },
        series:multilineChartData
    });
}

//Stacked Chart
let renderpayermixchart = (parameters,StackedChartData)=>{
    Highcharts.chart(parameters.container, {
        chart: {
          type: 'column'
        },
        title: {
          text: parameters.title
        },
        xAxis: {
          categories:parameters.categories 
        },
        yAxis: {
          min: 0,
          title: {
            text: parameters.yAxisText
          },
          stackLabels: {
            enabled: true,
            style: {
              fontWeight: 'bold',
              color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
          }
        },
        legend: {
          align: 'right',
          x: -30,
          verticalAlign: 'top',
          y: 25,
          floating: true,
          backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
          borderColor: '#CCC',
          borderWidth: 1,
          shadow: false
        },
        tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
              color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
            }
          }
        },
        series: StackedChartData
      });
    }

let markerShareOverMonthsChart = (parameters,MarketChartData) => {
    Highcharts.chart(parameters.container, {
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: parameters.title
    },
    subtitle: {
        text: parameters.subtitle
    },
    xAxis: [{
        categories:parameters.categories ,
        crosshair: true
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value}°C',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        title: {
            text: 'Temperature',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        opposite: true

    }, { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Rainfall',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        labels: {
            format: '{value} mm',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        }

    }, { // Tertiary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Sea-Level Pressure',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        labels: {
            format: '{value} mb',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        opposite: true
    }],
    tooltip: {
        shared: true
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 55,
        floating: true,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    series:MarketChartData
});
}

let renderrxCost = (parameters,rxChartData) => {
Highcharts.chart(parameters.container, {

    chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy'
    },

    legend: {
        enabled: false
    },

    title: {
        text: parameters.title
    },

    subtitle: {
        text: parameters.subtitle
    },

    xAxis: {
        gridLineWidth: 1,
        title: {
            text: 'Daily fat intake'
        },
        labels: {
            format: '{value} gr'
        },
        plotLines: [{
            color: 'black',
            dashStyle: 'dot',
            width: 2,
            value: 65,
            label: {
                rotation: 0,
                y: 15,
                style: {
                    fontStyle: 'italic'
                },
                text: 'Safe fat intake 65g/day'
            },
            zIndex: 3
        }]
    },

    yAxis: {
        startOnTick: false,
        endOnTick: false,
        title: {
            text: 'Daily sugar intake'
        },
        labels: {
            format: '{value} gr'
        },
        maxPadding: 0.2,
        plotLines: [{
            color: 'black',
            dashStyle: 'dot',
            width: 2,
            value: 50,
            label: {
                align: 'right',
                style: {
                    fontStyle: 'italic'
                },
                text: 'Safe sugar intake 50g/day',
                x: -10
            },
            zIndex: 3
        }]
    },

    tooltip: {
        useHTML: true,
        headerFormat: '<table>',
        pointFormat: '<tr><th colspan="2"><h3>{point.country}</h3></th></tr>' +
            '<tr><th>Fat intake:</th><td>{point.x}g</td></tr>' +
            '<tr><th>Sugar intake:</th><td>{point.y}g</td></tr>' +
            '<tr><th>Obesity (adults):</th><td>{point.z}%</td></tr>',
        footerFormat: '</table>',
        followPointer: true
    },

    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            }
        }
    },

    series: rxChartData

});
}
let renderIngredientCostChart = (parameters,ingredientChartData) => {
    Highcharts.chart(parameters.container, {
        chart: {
            type: 'column'
        },
        title: {
            text: parameters.title
        },
        subtitle: {
            text: parameters.subtitle
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'Total percent market share'
            }
    
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                }
            }
        },
    
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
    
        series: ingredientChartData
        
    });
} 

let rendercostselectionchart = (parameters,avgcostChartData) => {
    // Create the chart
    Highcharts.chart(parameters.container, {
        chart: {
            type: 'column'
        },
        title: {
            text: parameters.title
        },
        subtitle: {
            text: parameters.subtitle
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'Total percent market share'
            }
    
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                }
            }
        },
    
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
    
        series:avgcostChartData 
    });
    }

    let renderCountContainerDashboard = (parameters,countChartData) => {
        Highcharts.chart(parameters.container, {
          chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              type: 'pie'
          },
          title: {
              text:parameters.title
          },
          tooltip: {
              pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          plotOptions: {
              pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                      enabled: true,
                      format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                      style: {
                          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                      }
                  }
              }
          },
          series:countChartData
        });
        }

        let renderfibrosisDashboard = (parameters,fibrosisChartData) => {
            Highcharts.chart(parameters.container, {
              chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false,
                  type: 'pie'
              },
              title: {
                  text:parameters.title
              },
              tooltip: {
                  pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
              },
              plotOptions: {
                  pie: {
                      allowPointSelect: true,
                      cursor: 'pointer',
                      dataLabels: {
                          enabled: true,
                          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                          style: {
                              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                          }
                      }
                  }
              },
              series:fibrosisChartData
            });
            }
           
            let rendertPatientbygenotype = (parameters,genotypeChartData) => {
            Highcharts.chart(parameters.container, {
                chart: {
                    type: 'column'              
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: {
                        text: ''
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: false                       
                        }
                    }
                },        
        series:genotypeChartData 
            });
        }

        let renderingredientcontainer = (parameters,ingredientcontainerChartData) => {
            Highcharts.chart(parameters.container, {
              chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false,
                  type: 'pie'
              },
              title: {
                  text:parameters.title
              },
              tooltip: {
                  pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
              },
              plotOptions: {
                  pie: {
                      allowPointSelect: true,
                      cursor: 'pointer',
                      dataLabels: {
                          enabled: true,
                          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                          style: {
                              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                          }
                      }
                  }
              },
              series:ingredientcontainerChartData
            });
            }
            let rendertprescribeChart = (parameters,prescribeChartData) => {
                Highcharts.chart(parameters.container, {
                    chart: {
                        type: 'column'              
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        type: 'category'
                    },
                    yAxis: {
                        title: {
                            text: ''
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            borderWidth: 0,
                            dataLabels: {
                                enabled: false                       
                            }
                        }
                    },        
            series:prescribeChartData 
                });
            }
            let renderpatientsTreatmentcontainer = (parameters,patientsTreatmentcontainerChartData) => {
                Highcharts.chart(parameters.container, {
                  chart: {
                      plotBackgroundColor: null,
                      plotBorderWidth: null,
                      plotShadow: false,
                      type: 'pie'
                  },
                  title: {
                      text:parameters.title
                  },
                  tooltip: {
                      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                  },
                  plotOptions: {
                      pie: {
                          allowPointSelect: true,
                          cursor: 'pointer',
                          dataLabels: {
                              enabled: true,
                              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                              style: {
                                  color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                              }
                          }
                      }
                  },
                  series:patientsTreatmentcontainerChartData
                });
                }

                let renderdrugfibrosisChart = (parameters,drugFibrosiChartData) => {
                    Highcharts.chart(parameters.container, {
                        chart: {
                            type: 'column'              
                        },
                        title: {
                            text: ''
                        },
                        subtitle: {
                            text: ''
                        },
                        xAxis: {
                            type: 'category'
                        },
                        yAxis: {
                            title: {
                                text: ''
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            series: {
                                borderWidth: 0,
                                dataLabels: {
                                    enabled: false                       
                                }
                            }
                        },        
                series:drugFibrosiChartData 
                    });
                }

                
    
           