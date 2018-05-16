import { Template } from 'meteor/templating';
import './progressionModel.html';
import * as mlSubTabsUtil from '../modelUtils.js';

let filterObjectsArray = [];
let filteredData = [];
let filtered = '';

Template.ProgressionModel.onCreated(function () {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function () {
        let params = getCurrentPopulationFilters();
        params['fdaCompliant'] = "all";
        executeProgressionModelRender(params, self);
    });
});

Template.ProgressionModel.rendered = function () {
    filterObjectsArray = [];
    $('.headerbuttonFilesection').hide();
}

Template.ProgressionModel.helpers({

});

Template.ProgressionModel.events({
    'click .js-stageSections': function (e, template) {
        let fibrorange = $(e.currentTarget).attr('fibrorange');
        let dataObj = {};
        dataObj['id'] = fibrorange;
        $('.js-stageSections').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $('.js-stageSections1').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $(e.currentTarget).attr("style", "background-color:#D6DBDF !important;");

        filterChartByData(dataObj, 'fibroValue');
    },
    'click .js-stageSections1': function (e, template) {
        let fibrorange = $(e.currentTarget).attr('fibrorange');
        let dataObj = {};
        dataObj['id'] = fibrorange;
        $('.js-stageSections').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $('.js-stageSections1').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $(e.currentTarget).attr("style", "background-color:#D6DBDF !important;");

        filterChartByData(dataObj, 'fibroValue');
    },
    'click .js-cirrhosisSectionHeader': function (e, template) {
        let dataObj = {};
        let cirrhosistype = $(e.currentTarget).attr('cirrhosistype')
        dataObj['id'] = cirrhosistype;
        $('.js-cirrhosisSectionHeader').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $(e.currentTarget).attr("style", "background-color:gray !important;");

        filterChartByData(dataObj, 'cirrhosistype');
    },
    'click .js-liverTransplantSection': function (e, template) {
        let dataObj = {};

        //filter for ctp score
        dataObj['id'] = '>7';
        filterChartByData(dataObj, 'ctpscore');

        //filter for meld score
        dataObj['id'] = '>10'
        filterChartByData(dataObj, 'meldscore');
    },
    'click .globalshowPatientprogressionmodel': function (event, template) {
        $('.progressionModelPList-listMask').hide();
        $('.progressionModelPList').show();
    },
    'click .globalexportPatientprogressionmodel': function (event) {
        let baseData =  _.clone(filteredData);
        filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(baseData,filtered);
        mlSubTabsUtil.exportPatientsData(event.currentTarget, 'progressionmodel', filteredData);
    },
    'click .js-analytics-applyDateFilters': function (event, template, data) {
        if(data && data == 'refresh'){
          template.loading.set(true);
          let params = getCurrentPopulationFilters();
          params['fdaCompliant'] = "all";
          executeProgressionModelRender(params, template);
        }
        else{
            filtered = 'true';
            filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(filteredData,filtered);
            mlSubTabsUtil.renderPatientsList(filteredData, "progressionModelPList");
            renderChartsWithFilteredData(filteredData);
        }
    },
    'click .close.mlTabs_closebtn': function (e) {
        $('.analyticsPatientsPopup').hide();
    }
});

let executeProgressionModelRender = (params, tempateObj) =>{
     Meteor.call('getProgressionModelTabsData', params, (error, result) => {
        if(error){
            // console.log(error);
            tempateObj.loading.set(false);
        }else{
            tempateObj.loading.set(false);
            mlSubTabsUtil.showChartLoading();
            setTimeout(function(){
                let AnalyticsTabData = result;
                AnalyticsTabData = AnalyticsTabData.filter((d) => !isNaN(parseFloat(d.fibro_Value)));
                filteredData = mlSubTabsUtil.getFilteredDataOnDateCombos(AnalyticsTabData,filtered);
                mlSubTabsUtil.renderPatientsList(filteredData, "progressionModelPList");
                renderProgressionCharts(filteredData);
                let patientCount  = commaSeperatedNumber(filteredData.length);
                //Praveen 02/20/2017 commmon cohort
                setCohortPatientCount({ patientCount: patientCount });
                //$('.searchPatientCountHeaderAnalytics').html(patientCount);
                mlSubTabsUtil.hideChartLoading();
            },300)
        }
    });
}


function renderProgressionCharts(data) {
    // console.log('*********Progression Model Data************');
    // console.log(data);
    //renderProgressionFactorsChart(data);
   /* let fromDate = $('#selectfromdate').val(),
        toDate = $('#selecttodate').val();
    //console.log(fromDate);
    //console.log(toDate);
    var startDate = new Date(fromDate + '-01-01');
    var endDate = new Date(toDate + '-01-01');

    data = data.filter(
        function (a) {
            return (new Date(a.dischargeDate).getFullYear() >= startDate.getFullYear() && new Date(a.dischargeDate).getFullYear() <= endDate.getFullYear());
        });*/

    renderCirrhosisDevelopmentChart(data);
    populateProgressionModelData(data);
}


function renderProgressionFactorsChart(data) {
    let totalPatients = data.length;
    let container = '#diseaseProgression-factorsChart',
        keys = [],
        chartData = [],
        colors = ['#17becf', '#fbde97', '#b1e8ea', '#1f77b4'];

    let ctpRanges = _.groupBy(data, function (rec) {
        let fibroValue = rec.ctpScore;

        if (fibroValue >= 5 && fibroValue <= 7)
            return "5-7";
        if (fibroValue >= 8 && fibroValue <= 12)
            return "8-12";
        if (fibroValue >= 13 && fibroValue <= 15)
            return "13-15";
    });


    for (let keys in ctpRanges) {
        let json = {};
        let pData = ctpRanges[keys];
        json['ctpRange'] = keys;
        json['count'] = pData.length;
        json['percentage'] = (pData.length / data.length) * 100;
        chartData.push(json);
    }

    //sort chart data
    chartData.sort(function (a, b) {
        let range1 = a.ctpRange.split('-')[0],
            range2 = b.ctpRange.split('-')[0];

        range1 = range1.replace('+', '');
        range2 = range2.replace('+', '');

        return range1 - range2;
    });

    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'ctpRange',
                value: ['percentage']
            },
            labels: {
                format: function (v, id, i, j) {
                    if (i != undefined)
                        return isNaN(parseInt(v)) ? '' : commaSeperatedNumber(chartData[i]['count']);
                }
            },
            onclick: function (d, element) {
                //c3js library have issue sometimes it not handle proper click event for stacked chart
                //if value is not undefined then call method and display data accordingly otherwise not
                if (d.value) {
                    let filterData = chartData[d.index],
                        dataObj = _.clone(d);

                    //filter for ctp score
                    dataObj['id'] = filterData.ctpRange;
                    filterChartByData(dataObj, 'ctpscore');
                } else {
                    console.log("improper click and data");
                }
            }
        },
        size: {
            height: 250,
            width: 550
        },
        legend: {
            show: false,
        },
        tooltip: {
            show: true,
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    filterData = chartData[dataObj.x];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>CTP Range: ' + filterData.ctpRange + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>' +
                    'Patient Count: ' + filterData.count + ' - ' + filterData.percentage.toFixed(2) + '%</div>' +
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
                    text: 'Patient Mortality in %',
                    position: 'middle'
                }
            }
        },
        color: {
            pattern: colors
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
    });
}

function renderCirrhosisDevelopmentChart(treatedPatients) {
    let container = '#diseaseProgression-CirrhosisDevelop',
        chartData = [],
        keys = [];

    let ageGroupData = _.groupBy(treatedPatients, function (rec) {
        if (rec.age >= 0 && rec.age <= 17)
            return '0-17';
        else if (rec.age >= 18 && rec.age <= 34)
            return '18-34';
        else if (rec.age >= 35 && rec.age <= 50)
            return '35-50';
        else if (rec.age >= 51 && rec.age <= 69)
            return '51-69';
        else if (rec.age >= 70)
            return '70+';
    });

    for (let ages in ageGroupData) {
        let jsonObj = {};
        let pData = ageGroupData[ages];
        jsonObj['age'] = ages;
        jsonObj['count'] = pData.length;
        jsonObj['percentage'] = (pData.length / treatedPatients.length) * 100;
        chartData.push(jsonObj);
        //keys.push(ages);
    }

    //sort chart data
    chartData.sort(function (a, b) {
        let age1 = a.age.split('-')[0],
            age2 = b.age.split('-')[0];

        age1 = age1.replace('+', '');
        age2 = age2.replace('+', '');

        return age1 - age2;
    });

    let chart = c3.generate({
        bindto: container,
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'age',
                value: ['percentage']
            },
            labels: {
                format: function (v, id, i, j) {
                    if (i != undefined)
                        return isNaN(parseInt(v)) ? '' : commaSeperatedNumber(chartData[i]['count']);
                }
            },
            onclick: function (d, element) {
                //c3js library have issue sometimes it not handle proper click event for stacked chart
                //if value is not undefined then call method and display data accordingly otherwise not
                if (d.value) {
                    let filterData = chartData[d.index];
                    let dataObj = _.clone(d);
                    dataObj['id'] = filterData.age;
                    filterChartByData(dataObj, 'age');
                } else {
                    console.log("improper click and data");
                }
            }
        },
        size: {
            height: 250,
            width: 1000
        },
        legend: {
            show: false,
        },
        tooltip: {
            show: true,
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    filterData = chartData[dataObj.x];

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = $$.levelColor ? $$.levelColor(dataObj.value) : color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>Age Group: ' + filterData.age + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>' +
                    'Patient Count: ' + filterData.count + ' - ' + filterData.percentage.toFixed(2) + '%</div>' +
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
                    text: 'Cirrhosis Development in %',
                    position: 'middle'
                }
            }
        },
        color: {
            //  pattern: ['#809FBC', '#5A6D8D']
            pattern: ['#2e7e97']
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
    });
}

function populateProgressionModelData(baseData) {
    let parentContainer = '#progressionModelChart';

    let cirrhosisTypeData = _.groupBy(baseData, 'cirrhosistype'),
        compensatedCirrhosis = cirrhosisTypeData['Compensated'] ? cirrhosisTypeData['Compensated'] : [],
        decompensatedCirrhosis = cirrhosisTypeData['Decompensated'] ? cirrhosisTypeData['Decompensated'] : [];

    let fibroStageData = _.groupBy(baseData, function (rec) {
        let fibroValue = rec.fibro_Value;

        if (fibroValue >= 0 && fibroValue <= 0.27)
            return "0";
        if (fibroValue >= 0.28 && fibroValue <= 0.31)
            return "1";
        if (fibroValue >= 0.32 && fibroValue <= 0.58)
            return "2";
        if (fibroValue >= 0.59 && fibroValue <= 0.73)
            return "3";
        if (fibroValue >= 0.74 && fibroValue <= 1.00)
            return "4";
    });

    // console.log(fibroStageData);
    renderCompensatedData(compensatedCirrhosis);
    renderDecompensatedData(decompensatedCirrhosis);
    renderLiverTransplantData(baseData);

    //function to populate compensated cirrhosis data
    function renderCompensatedData(compData) {
        if (compData.length == 0) {
            $(parentContainer + ' .compCirrhosisCount').parent().css('visibility', 'hidden');
            $(parentContainer + ' .stage0Count').parents('.stageSections').css('cursor', 'context-menu').removeClass('js-stageSections showHandIcon');
            $(parentContainer + ' .stage1Count').parents('.stageSections').css('cursor', 'context-menu').removeClass('js-stageSections showHandIcon');
            $(parentContainer + ' .stage2Count').parents('.stageSections').css('cursor', 'context-menu').removeClass('js-stageSections showHandIcon');
        } else {
            $(parentContainer + ' .stage0Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            $(parentContainer + ' .stage1Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            $(parentContainer + ' .stage2Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            $(parentContainer + ' .compCirrhosisCount').parent().css('visibility', 'visible');
            $(parentContainer + ' .compCirrhosisCount').html(compData.length);
        }

        let stageData = getStagesData(fibroStageData, '0');
        if (stageData.length == 0) {
            $(parentContainer + ' .stage0Count').parent().css('visibility', 'hidden');
        } else {
            $(parentContainer + ' .stage0Count').parent().css('visibility', 'visible');
            $(parentContainer + ' .stage0Count').html(stageData.length);
        }
        var stage0Count = stageData.length;

        stageData = getStagesData(fibroStageData, '1');
        if (stageData.length == 0) {
            $(parentContainer + ' .stage1Count').parent().css('visibility', 'hidden');
        } else {
            $(parentContainer + ' .stage1Count').parent().css('visibility', 'visible');
            $(parentContainer + ' .stage1Count').html(stageData.length);
        }
        var stage1Count = stageData.length;
        stageData = getStagesData(fibroStageData, '2');
        if (stageData.length == 0) {
            $(parentContainer + ' .stage2Count').parent().css('visibility', 'hidden');
        } else {
            $(parentContainer + ' .stage2Count').parent().css('visibility', 'visible');
            $(parentContainer + ' .stage2Count').html(stageData.length);
        }

        if (stage1Count != 0 || stageData.length != 0 || stage0Count != 0) {
            $(parentContainer + ' .decompCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', 'context-menu').removeClass('js-cirrhosisSectionHeader showHandIcon');
        } else {
            $(parentContainer + ' .decompCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
        }
        if (filterObjectsArray.length > 0) {
            if ((filterObjectsArray.find(x => x.key == 'cirrhosistype')) == null) {
                $(parentContainer + ' .stage1Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
                $(parentContainer + ' .stage2Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            } else {
                if ((filterObjectsArray.find(x => x.key == 'fibro_Value')) == null) {
                    $(parentContainer + ' .decompCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
                } else {
                    if (stage1Count != 0 || stageData.length != 0) {
                        $(parentContainer + ' .decompCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', 'context-menu').removeClass('js-cirrhosisSectionHeader showHandIcon');
                    }
                }
            }
        }
    }
    //function to populate decompensated cirrhosis data
    function renderDecompensatedData(decompData) {
        if (decompData.length == 0) {
            $(parentContainer + ' .decompCirrhosisCount').parent().css('visibility', 'hidden');
            $(parentContainer + ' .stage3Count').parents('.stageSections').css('cursor', 'context-menu').removeClass('js-stageSections showHandIcon');
            $(parentContainer + ' .stage4Count').parents('.stageSections').css('cursor', 'context-menu').removeClass('js-stageSections showHandIcon');
        } else {
            $(parentContainer + ' .stage3Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            $(parentContainer + ' .stage4Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            $(parentContainer + ' .decompCirrhosisCount').parent().css('visibility', 'visible');
            $(parentContainer + ' .decompCirrhosisCount').html(decompData.length);
        }

        let stageData = getStagesData(fibroStageData, '3');
        if (stageData.length == 0) {
            $(parentContainer + ' .stage3Count').parent().css('visibility', 'hidden');
        } else {
            $(parentContainer + ' .stage3Count').parent().css('visibility', 'visible');
            $(parentContainer + ' .stage3Count').html(stageData.length);
        }
        var stage3Count = stageData.length;
        stageData = getStagesData(fibroStageData, '4');
        if (stageData.length == 0) {
            $(parentContainer + ' .stage4Count').parent().css('visibility', 'hidden');
        } else {
            $(parentContainer + ' .stage4Count').parent().css('visibility', 'visible');
            $(parentContainer + ' .stage4Count').html(stageData.length);
        }

        if (stage3Count != 0 || stageData.length != 0) {
            $(parentContainer + ' .compCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', 'context-menu').removeClass('js-cirrhosisSectionHeader showHandIcon');
        } else {
            $(parentContainer + ' .compCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
        }
        if (filterObjectsArray.length > 0) {
            if ((filterObjectsArray.find(x => x.key == 'cirrhosistype')) == null) {
                $(parentContainer + ' .stage3Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
                $(parentContainer + ' .stage4Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            } else {
                if ((filterObjectsArray.find(x => x.key == 'fibro_Value')) == null) {
                    $(parentContainer + ' .compCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
                } else {
                    if (stage3Count != 0 || stageData.length != 0) {
                        $(parentContainer + ' .compCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', 'context-menu').removeClass('js-cirrhosisSectionHeader showHandIcon');
                    }
                }
            }
        } else {
            $('#progressionModelChart .compCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
            $('#progressionModelChart .decompCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
            $('#progressionModelChart .stage1Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            $('#progressionModelChart .stage2Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            $('#progressionModelChart .stage3Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
            $('#progressionModelChart .stage4Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
        }
    }

    function getStagesData(data, key) {
        let filterData = data[key] ? data[key] : [];
        return filterData;
    }

    function renderLiverTransplantData(data) {
        let filterData = _.filter(data, function (rec) {
            let meldScore = parseFloat(rec.labs_meld),
                ctpScore = parseInt(rec.ctpScore);
            if (ctpScore >= 7 && meldScore >= 10)
                return true;
        });

        $(parentContainer + ' .liverTransplantCount').html(filterData.length);
    }

}


//filtering data starts

function filterChartByData(dataKey, filterKey) {
    // let isAlreadyFiltered = mlSubTabsUtil.checkFilterExists(filterKey, filterObjectsArray);

    // if (isAlreadyFiltered)
    //     return;

    $('.customC3ToolTip').hide();
    filterObjectsArray = mlSubTabsUtil.getClickFilterObj(dataKey, filterKey, filterObjectsArray);
    renderChartsWithFilteredData();
}

function addBreadsCrums(breadCrumsData) {
    let parentWrapper = 'progressionModel-Crums';
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

    setTimeout(function () {
        $('.js-dashboard-clearFilter').on('click', function () {
            deleteBreadCrum($(this));
        });

        $('.js-dashboard-clearAll').on('click', function () {
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
        $('.progressionModel-Crums').empty();
        $('.cirrhosisSections').find('.stageSections').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $('.cirrhosisSections').find('.stageSections1').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $('.js-cirrhosisSectionHeader').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $('#progressionModelChart .compCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
        $('#progressionModelChart .decompCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
        $('#progressionModelChart .stage1Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
        $('#progressionModelChart .stage2Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
        $('#progressionModelChart .stage3Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
        $('#progressionModelChart .stage4Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
    }
    if (filterkey == 'fibrovalue') {
        $('.cirrhosisSections').find('.stageSections ').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $('#progressionModelChart .compCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
        $('#progressionModelChart .decompCirrhosisCount').parents('.cirrhosisSectionHeader').css('cursor', '').addClass('js-cirrhosisSectionHeader showHandIcon');
    }
    if (filterkey == 'cirrhosistype') {
        $('.js-cirrhosisSectionHeader').each(function (i, obj) {
            $(this).removeAttr("style");
        });
        $('#progressionModelChart .stage1Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
        $('#progressionModelChart .stage2Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
        $('#progressionModelChart .stage3Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
        $('#progressionModelChart .stage4Count').parents('.stageSections').css('cursor', '').addClass('js-stageSections showHandIcon');
    }

    renderChartsWithFilteredData();
}

function renderChartsWithFilteredData() {
    let modifiedData = _.clone(filteredData);

    let rangeObjectsArray = [];

    if (filterObjectsArray.length > 0) {
        rangeObjectsArray = _.where(filterObjectsArray, { type: 'range' });

        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.removeObjectsFromArray(filterObjectsArray, rangeObjectsArray, 'type');
        }

        for (let i = 0; i < filterObjectsArray.length; i++) {
            let filterObj = {};
            let isAltkey = filterObjectsArray[i].altkey ? true : false;
            let isAntiviralTherapy = filterObjectsArray[i].key == "Antiviral Therapy" ? true : false;

            if (isAltkey)
                filterObj[filterObjectsArray[i].altkey] = filterObjectsArray[i].value;
            else
                filterObj[filterObjectsArray[i].key] = filterObjectsArray[i].value;

            if (isAntiviralTherapy)
                modifiedData = modifiedData;
            else
                modifiedData = _.where(modifiedData, filterObj);
        }

        if (rangeObjectsArray.length > 0) {
            filterObjectsArray = mlSubTabsUtil.addObjectsToArray(filterObjectsArray, rangeObjectsArray);

            //filter the data on range objects
            modifiedData = mlSubTabsUtil.filterForRangeObjects(modifiedData, rangeObjectsArray);
        }
    }

    addBreadsCrums(filterObjectsArray);
    modifiedData = mlSubTabsUtil.getFilteredDataOnDateCombos(modifiedData,filtered);

    $('.progressionModel-totalPatients').html(commaSeperatedNumber(modifiedData.length));

    //Praveen 02/20/2017 commmon cohort
    setCohortPatientCount({ patientCount: modifiedData.length });
    //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(modifiedData.length));

    renderProgressionCharts(modifiedData);
    mlSubTabsUtil.renderPatientsList(modifiedData, 'progressionModelPList');
    mlSubTabsUtil.hideChartLoading();
}
