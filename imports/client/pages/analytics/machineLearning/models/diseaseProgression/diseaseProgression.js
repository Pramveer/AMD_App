import { Template } from 'meteor/templating';
import './diseaseProgression.html';
import * as mlSubTabsUtil from '../modelUtils.js';

let AnalyticsTabData = null,
    CausalFactorsData = [],
    filterObjectsArray = [],
    filtered = '';

Template.DiseaseProgression.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function () {
        let params = getCurrentPopulationFilters();
        params['fdaCompliant'] = "all";
        executeDiseaseProgressionRender(params, self);
    });
});

Template.DiseaseProgression.rendered = function() {
    filterObjectsArray = [];
    $('.headerbuttonFilesection').hide();
}

Template.DiseaseProgression.helpers({
    'isLoading': function () {
        return Template.instance().loading.get();
    },
    'getPateintInfo': function() {
        let data = Template.Provider.__helpers.get('getPopulationData').call();
        return data;
    },
    'AnalyticsMessage': function(baseData) {
        // console.log('AnalyticsMessage');

        let mainData = [];
        //get disease progression data if not null
        mainData = baseData ? baseData : AnalyticsTabData;
        //group data basedon disease progression
        //renderDiseaseProgressionCharts(mainData);
    }
});

Template.DiseaseProgression.events({
    'change .apriChangeCombo': function(event) {
        if ($(event.currentTarget).val().toLowerCase() == 'no') {
            renderChartForApri(CausalFactorsData[0].patientsData);
        } else {
            renderChartForApri(CausalFactorsData[1].patientsData);
        }
    },
    'click .globalshowPatientdiseaseprediction': function(event, template) {
        $('.diseasePredictionPList-listMask').hide();
        $('.diseasePredictionPList').show();
    },
    /**
     * Modified By : Yuvraj
     * date : 13th Feb 17
     * desc : We are no longer using date filters, So Filtering is not required.
     */
    'click .globalexportPatientdiseaseprediction': function(event) {
        // let filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(AnalyticsTabData,filtered);
        // console.log(filteredData);
        mlSubTabsUtil.exportPatientsData(event.currentTarget, 'diseaseprogression', AnalyticsTabData);
    },
    // the data is passed from Advance Search file (When we click on the Apply button of the Advance Search Feature.)
    /**
     * Modified By : Yuvraj
     * date : 13th Feb 17
     * desc : We are no longer using date filters, So else condition is not required.
     */
    'click .js-analytics-applyDateFilters': function(event, template,data) {

        if(data && data == 'refresh'){
          template.loading.set(true);
          let params = getCurrentPopulationFilters();
          params['fdaCompliant'] = "all";
          executeDiseaseProgressionRender(params, template);
        }
        // else{
        //     filtered = 'true';
        //     let filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(AnalyticsTabData,filtered);
        //     mlSubTabsUtil.renderPatientsList(filteredData, "diseasePredictionPList");
        //     renderDiseaseProgressionCharts(filteredData);
        //     //Template.DiseaseProgression.__helpers.get('AnalyticsMessage')(filteredData);
        //     $('.machineLearn-totalPatients').html(commaSeperatedNumber(filteredData.length));
        //     $('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(filteredData.length))
        //   }
    },
    // close Event for the Patient Details Popup.
    'click .close.mlTabs_closebtn': function (e) {
        $('.analyticsPatientsPopup').hide();
    }

});


Template.DiseaseProgression.reRender = function (){
    let self = this;
    this.loading = new ReactiveVar(true);
    this.loading.set(true);
    let params = getCurrentPopulationFilters();
    params['fdaCompliant'] = "all";
    executeDiseaseProgressionRender(params, self);
};


let executeDiseaseProgressionRender = (params, tempateObj) =>{
    //params.medicationArray = null;
    Meteor.call('getDiseaseProgressionTabsData', params, (error, result) => {
        if(error){
            console.log(error);
            tempateObj.loading.set(false);
        }else{
            tempateObj.loading.set(false);
            setTimeout(function(){
                AnalyticsTabData = result;
                // Modified By Yuvraj -  We are no longer using date filters. So, use AnalyticsTabData insted of filteredData;
                // let filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(AnalyticsTabData,filtered);

                mlSubTabsUtil.renderPatientsList(AnalyticsTabData, "diseasePredictionPList");
                renderDiseaseProgressionCharts(AnalyticsTabData);
                let patientCount  = commaSeperatedNumber(AnalyticsTabData.length);
                $('.machineLearn-totalPatients').html(patientCount);
                //Praveen 02/20/2017 commmon cohort
                setCohortPatientCount({ patientCount: patientCount });
                //$('.searchPatientCountHeaderAnalytics').html(patientCount);
            },300)
        }
    });
}

//render disease progression charts
let renderDiseaseProgressionCharts = (mainData) =>{

    //group data basedon disease progression
    let diseaseProgressionGroupedData = _.groupBy(mainData,'disease_progression');
    let chartData = [];
    let pieChartData = [];
    let colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'];
    if(mainData.length>0){
      let datakeys = Object.keys(mainData[0]).filter((d1)=>d1.indexOf('labs')>-1);
      let keys = datakeys.map((key)=>key.replace('labs_','').split('_').join(' ').toUpperCase());
      let colorindex = 0;
      //set totalpatient count
      $('.apriGreaterPatients').html(commaSeperatedNumber(diseaseProgressionGroupedData['Y'].length));
      $('.apriLessPatients').html(commaSeperatedNumber(diseaseProgressionGroupedData['N'].length));
      //Praveen 02/20/2017 commmon cohort
      setCohortPatientCount({ patientCount: mainData.length });
      //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(mainData.length))
      //prepare data for charts
      for(let key in diseaseProgressionGroupedData){
        let jsonpi = {};//for pi  chart
        let json = {};//for bar chart
        json['type'] = 'column';
        json['name'] = key == 'Y'?'APRI > 1':'APRI < 1';
        jsonpi['name'] = key == 'Y'?'APRI > 1':'APRI < 1';
        let tempdata = diseaseProgressionGroupedData[key];
        jsonpi['y'] =  tempdata.length;
        jsonpi['color'] =  key == 'Y'?'#e95a52':'#2e7e97';//colors[colorindex];
        json['color'] =  key == 'Y'?'#e95a52':'#2e7e97';
        json['data'] = [];
        let labDataIndi = [];
        colorindex += 1;
        for(let i=0;i<datakeys.length;i++){
          let tmpkey = datakeys[i];
          let sum = [];
          let total_patients = 0;
          for(let j=0;j<tempdata.length;j++){
            if(tempdata[j] !=void 0 && tempdata[j][tmpkey] != '' && tempdata[j][tmpkey] != null){
              sum.push(parseFloat(tempdata[j][tmpkey]));
              total_patients += 1;
            }
          }
          //get medican of data
          let medicantmpkey = calculate_median(sum);
          labDataIndi.push({y:isNaN(medicantmpkey)?0:Math.round(medicantmpkey,3),total:total_patients});
        }
        json['data'] = labDataIndi;
        chartData.push(json);
        pieChartData.push(jsonpi);
      }

      //render pie chartData
      renderDiseaseprogressionpiechart(pieChartData);

      //render chart
      Highcharts.chart('analyticsChartDiseaseProgression', {
        chart: {
            height: 450
        },
        title: {
            text: ''
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{y}',
                    style: {
                            fontWeight: '300',
                            fontSize:'10px',
                    }
                }
            }
        },
        xAxis: {
            categories: keys
        },
        credits:{
            enabled:false
        },
        yAxis: {
            title: {
                text: 'Median Value Score'
            }
        },
        colors:colors,
        tooltip: {
            useHTML: true,
            headerFormat: '<div class="">',
            pointFormat:`<div class="">
                            <div>{point.name}</div>
                            </div><div class="">
                            <div> {point.series.name}:{point.y}</div>
                            </div>`,
            footerFormat: '</div>',
            followPointer: false,
            hideDelay: 30
        },
        series: chartData
    });
    mlSubTabsUtil.hideChartLoading();

  }

}

let renderDiseaseprogressionpiechart=(chartData) =>{

        Highcharts.setOptions({
            lang: {
                thousandsSep: ','
            }
        });
        Highcharts.chart('analyticsChartDiseaseProgressionpie', {
          chart: {
              height: 445,
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              type: 'pie'
          },
          title: {
              text: ''
          },
          tooltip: {
              useHTML: true,
              headerFormat: '<div class="">',
              pointFormat:`<div class="">
                                <div>{point.name}</div>
                                </div><div class="">
                                <div>Patient Count:{point.y:,.0f}</div>
                                </div>`,
              footerFormat: '</div>',
              followPointer: false,
              hideDelay: 30
          },
          credits:{
            enabled:false
          },
          plotOptions: {
              pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                      enabled: true,
                      format: '{point.name} <br /> {point.percentage:.1f} %',
                  },
                  cursor: 'pointer',
                  point: {
                      events: {
                          click: function () {
                              let filterData = chartData[this.colorIndex];
                              let dataObj = {};
                              //filter by gender
                              //dataObj['id'] = this.category;
                              //filterChartByData(dataObj, 'APRI');
                          }
                      }
                  }
              }
          },
          series: [{
              data: chartData,
              items:null
          }]
      });

      mlSubTabsUtil.hideChartLoading();
}



// Additional Functions

let calculate_median = (array_name) =>{
    array_name.sort();
    let len = array_name.length;
    //check if length of array is 1
    if (len == 1) {
        return array_name[0];
    }
    if (len == 0) {
        return 0;
    }
    if (len == 2) {
        return (array_name[0] + array_name[1]) / 2;
    }
    if (len % 2 === 0) {
        return (array_name[len / 2] + array_name[(len / 2) + 1]) / 2;
    } else {
        return (array_name[(len + 1) / 2]);
    }
}

function scrollToId(id) {
    $('html,body').animate({
        scrollTop: $("#" + id).offset().top
    }, 'slow');
}

//function to add comma to thousand place on a number ,sourced from http://wwww.stackoverflow.com
function commaSeperatedNumber(val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
}

function executeRender() {
    // renderAnalyticsChart();
    let dpYesData,
        dpNoData,
        chartData = CausalFactorsData; //JSON.parse(localStorage.CausalFactors);

    dpYesData = _.where(chartData, { name: "Disease progression" })[0];
    dpNoData = _.where(chartData, { name: "No disease progression" })[0];

    $('.apriGreaterPatients').html(commaSeperatedNumber(dpYesData['total']));
    $('.apriLessPatients').html(commaSeperatedNumber(dpNoData['total']));
    renderAnalyticsRingChart(chartData);
}

function clickEventForOuterRing() {
    let apriOne = d3.select('.APRIOne'),
        apriTwo = d3.select('.APRITwo');

    apriOne.on('click', function(d) {
        handleOuterRingClick(d);
    });
    apriTwo.on('click', function(d) {
        handleOuterRingClick(d);
    });
}

function handleOuterRingClick(data) {
    //render patients list popup
    mlSubTabsUtil.renderPatientsList(data.patientsData, 'diseasePredictionPList');
    //call function to plot charts for patients
    renderChartForApri(data.patientsData);
}

function renderChartForApri(data, noScroll) {
    $('.mlDistributionChartWrapper').show();
    if (noScroll) {
        //scroll the section to charts
        scrollToId('causalFactorsChart');
    }
    renderGenderDistributionChart(data);
    renderAgeDistributionChart(data);
    renderRaceDistributionChart(data);
}

function renderGenderDistributionChart(treatedPatients) {
    container = '#ml-genderDistribution';
    let keys = [];
    let chartData = [];
    let GenderGrpData = _.groupBy(treatedPatients, 'gender');
    for (let key in GenderGrpData) {
        let labl = (key == 'M' ? 'Male' : 'Female');
        let json = {}
        json['gender'] = labl;
        json['Patient Count'] = GenderGrpData[key].length;
        keys.push(labl);
        chartData.push(json);
    }
    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'gender',
                value: ['Patient Count']
            },
            labels: {
                format: function(v, id, i, j) {
                    //console.log(v + ' ' +id + i +' '+j);
                    return commaSeperatedNumber(v);
                },
            },
            onclick: function(d, element) {
                //c3js library have issue sometimes it not handle proper click event for stacked chart
                //if value is not undefined then call method and display data accordingly otherwise not
                if (d.value) {
                    let filterData = chartData[d.index];
                    let dataObj = _.clone(d);
                    dataObj.id = filterData.gender;
                    filterChartByData(dataObj, 'gender');
                } else {
                    console.log("improper click and data");
                }
            }
        },
        size: {
            height: 200,
            width: 400
        },
        legend: {
            show: false,
            //position:'right',
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    value = dataObj.value,
                    filterData = chartData[dataObj.index];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + filterData.gender + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Patients Count: ' + value + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        axis: {
            x: {
                type: 'category',
            },
            y: {
                label: {
                    text: 'Patient Count',
                    position: 'middle'
                }
            }
        },
        color: {
            pattern: ['#5A6D8D']
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
    });
}

function renderRaceDistributionChart(treatedPatients) {
    container = '#ml-raceDistribution';

    let keys = ['American Indian', 'Alaskan Native', 'Asian', 'African American', 'White'],
        chartData = {},
        filteredData = [];

    filteredData = treatedPatients.filter(function(rec) {
        return rec.race == 'American Indian';
    });
    chartData['American Indian'] = filteredData.length;

    filteredData = treatedPatients.filter(function(rec) {
        return rec.race == 'Alaskan Native';
    });
    chartData['Alaskan Native'] = filteredData.length;

    filteredData = treatedPatients.filter(function(rec) {
        return rec.race == 'Asian';
    });
    chartData['Asian'] = filteredData.length;

    filteredData = treatedPatients.filter(function(rec) {
        return rec.race == 'African American';
    });
    chartData['African American'] = filteredData.length;

    filteredData = treatedPatients.filter(function(rec) {
        return rec.race == 'White';
    });
    chartData['White'] = filteredData.length;

    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: [chartData],
            keys: {
                value: keys
            },
            onclick: function(d, element) {
                //c3js library have issue sometimes it not handle proper click event for stacked chart
                //if value is not undefined then call method and display data accordingly otherwise not
                if (d.value) {
                    filterChartByData(d, 'race');
                } else {
                    console.log("improper click and data");
                }
            }
        },
        donut: {
            width: 50
        },
        size: {
            height: 200,
            width: 400
        },
        legend: {
            show: true,
            position: 'right',
        },
        color: {
            // pattern: ['#809fbc','#5a6d8d','#84bfa4','#133248','#b4d9c4']
            pattern: ['#6F848F', '#ABBFCC', '#93A6AB', '#7E8887', '#C9C8C0']
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = chartData[id];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Race ' + id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Total Patients: ' + filterData + ' - ' + ratio + '%</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}

function renderAgeDistributionChart(treatedPatients) {
    container = '#ml-ageDistribution';

    let keys = ['0-17', '18-34', '35-50', '51-69', '70+'],
        chartData = {},
        filteredData = [];

    filteredData = treatedPatients.filter(function(rec) {
        return rec.age >= 0 && rec.age <= 17;
    });
    chartData['0-17'] = filteredData.length;

    filteredData = treatedPatients.filter(function(rec) {
        return rec.age >= 18 && rec.age <= 34;
    });
    chartData['18-34'] = filteredData.length;

    filteredData = treatedPatients.filter(function(rec) {
        return rec.age >= 35 && rec.age <= 50;
    });
    chartData['35-50'] = filteredData.length;

    filteredData = treatedPatients.filter(function(rec) {
        return rec.age >= 51 && rec.age <= 69;
    });
    chartData['51-69'] = filteredData.length;

    filteredData = treatedPatients.filter(function(rec) {
        return rec.age >= 70;
    });
    chartData['70+'] = filteredData.length;


    var chart = c3.generate({
        bindto: container,
        data: {
            type: 'donut',
            json: [chartData],
            keys: {
                value: keys
            },
            onclick: function(d, element) {
                //c3js library have issue sometimes it not handle proper click event for stacked chart
                //if value is not undefined then call method and display data accordingly otherwise not
                if (d.value) {
                    filterChartByData(d, 'age');
                } else {
                    console.log("improper click and data");
                }
            }
        },
        donut: {
            width: 50
        },
        size: {
            height: 200,
            width: 400
        },
        legend: {
            show: true,
            position: 'right',
        },
        color: {
            // pattern: ['#809FBC','#5A6D8D','#84BFA4', '#B4D9C4', '#F2F2F0', '#A6A48D', '#F2ECD8', '#FAB4B2', '#C28B91', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5','#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
            pattern: ["#414A50", "#1F6F78", "#118A7E", "#3BAEA0", '#93E4C1']
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = chartData[id];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Age Group ' + id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>Total Patients: ' + filterData + ' - ' + ratio + '%</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        }
    });
}

function filterChartByData(dataKey, filterKey) {
    let isAlreadyFiltered = mlSubTabsUtil.checkFilterExists(filterKey, filterObjectsArray);

    if (isAlreadyFiltered)
        return;

    $('.customC3ToolTip').hide();
    hideChartContainers();
    mlSubTabsUtil.showChartLoading();
    filterObjectsArray = mlSubTabsUtil.getClickFilterObj(dataKey, filterKey, filterObjectsArray);
    renderChartsWithFilteredData();
}

function addBreadsCrums(breadCrumsData) {
    let parentWrapper = 'diseaseProgression-Crums';
    let breadCrums = ``;

    $('.' + parentWrapper).hide();

    for (let i = 0; i < breadCrumsData.length; i++) {
        let fiterData = breadCrumsData[i];
        let label = fiterData.key ? fiterData.key.split('_').join(' ') : '';

        breadCrums += `<div class="dashBoard-breadCrum">
                            <div class="dashBoard-filterkey">${label} : </div>
                            <div class="dashBoard-filterValue">${fiterData.value}</div>
                            <div class="dashboard-clearFilter js-dashboard-clearFilter fa fa-trash" key="${fiterData.identifier}"></div>
                        </div>`;
    }

    if (breadCrumsData.length) {
        breadCrums += `<div class="dashBoard-breadCrum">
                        <div class="dashboard-clearAll js-dashboard-clearAll" title="Clear All Filters">Clear All</div>
                    </div>`;
    }


    $('.' + parentWrapper).empty();
    $('.' + parentWrapper).html(breadCrums);

    setTimeout(function() {
        $('.js-dashboard-clearFilter').on('click', function() {
            deleteBreadCrum($(this));
        });

        $('.js-dashboard-clearAll').on('click', function() {
            deleteBreadCrum($(this), true);
        });

        if (breadCrumsData.length) {
            $('.' + parentWrapper).show();
        }

    }, 100);
}

function deleteBreadCrum(obj, removeAll) {
    let filterkey = $(obj).attr('key');
    //remove the object from filterdataKey
    filterObjectsArray = _.without(filterObjectsArray, _.findWhere(filterObjectsArray, {
        identifier: $(obj).attr('key')
    }));
    if (removeAll) {
        filterObjectsArray = [];
        $('.diseaseProgression-Crums').empty();
    }
    renderChartsWithFilteredData();
}

function renderChartsWithFilteredData() {
    let modifiedData = _.clone(mlSubTabsUtil.getMLTabsData());

    let rangeObjectsArray = [];

    if (filterObjectsArray.length > 0) {
        rangeObjectsArray = _.where(filterObjectsArray, { type: 'range' });

        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.removeObjectsFromArray(filterObjectsArray, rangeObjectsArray, 'type');
        }

        for (let i = 0; i < filterObjectsArray.length; i++) {
            let filterObj = {};
            filterObj[filterObjectsArray[i].key] = filterObjectsArray[i].value;
            modifiedData = _.where(modifiedData, filterObj);
        }

        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.addObjectsToArray(filterObjectsArray, rangeObjectsArray);

            //filter the data on range objects
            modifiedData = mlSubTabsUtil.filterForRangeObjects(modifiedData, rangeObjectsArray);
        }
    }
    addBreadsCrums(filterObjectsArray);
    filterApriChart(modifiedData);
    renderChartForApri(modifiedData);
    mlSubTabsUtil.renderPatientsList(modifiedData, 'diseasePredictionPList');
    showChartContainers();
    mlSubTabsUtil.hideChartLoading();
}


function filterApriChart(modifiedData) {
    Template.DiseaseProgression.__helpers.get('AnalyticsMessage')(modifiedData);
}

function showChartContainers() {
    $('.causalFactorsChart-Container').show();
    $('.analyticsChart-Parent').show();
}

function hideChartContainers() {
    $('.causalFactorsChart-Container').hide();
    $('.analyticsChart-Parent').hide();
}
