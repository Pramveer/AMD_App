import {
    Template
} from 'meteor/templating';
import './efficacy.html';
import * as analyticsLib from '../analyticsLib.js';

//Set Drug Display Limit for selection
var DRUG_LIMIT = 10;
export let fdaCompliant = '';
//Perform operation when template rendered

// this array will contain the Final Modified Array to plot the Efficacy Bubbles.
let FinalDrugsArray = [];
let allDrugsData = [];

// created object to store data for comparative functionality
let primaryData = {},
    secondaryData = {};
//Perform operation when template rendered
Template.Efficacy.onCreated(function () {
    var self = this;
    this.loading = new ReactiveVar(false);
    this.noData = new ReactiveVar(false);

    let params = getCurrentPopulationFilters();
    params['fdaCompliant'] = "yes";
    fdaCompliant = "yes";


    self.loading.set(true);
    executeEfficacyRender(params, self);
});





Template.Efficacy.rendered = function () {
    document.getElementById("anim_loading_theme").style.visibility = "hidden";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("anim_loading_theme").style.top = "40%";

    //show export button
    $('.headerbuttonFilesection').show();
    // Nisha 02/14/2017 Show the menu after navigation from payer tab
    $('.analyticssubmenu_Btn').show();

    $('.head-emr-details .switch').show();
    // initialize tooltip
    $('.pop').each(function () {
        var $elem = $(this);
        $elem.popover({
            placement: 'auto',
            trigger: 'hover',
            html: true,
            container: $elem,
            animation: true,
            // content: 'This is the popover content. You should be able to mouse over HERE.'
        });
    });



}
Template.Efficacy.destroyed = function () {
    //localStorage.removeItem("efficacyChartData");
}

Template.Efficacy.events({
    'click .globalshowPatientefficacy': function (event, template) {
        $('.diseasePredictionPList-listMask').hide();
        analyticsLib.prepareDomForShowPatients('efficacy');
        //$('.analyticsPatientsPopup').show();
    },
    'click .globalexportPatientefficacy': function (event) {

        /**
 * @author: Arvind
 * @reviewer: 
 * @date: 25-May-2017
 * @desc: 
 * //// OLD commented below code by Arvind on 25-May-2017 which is used prior to start comparative functionality  (Total patient counts not adding up in therapy distribution)
   //var data = analyticsLib.getDataForMedications('', 'efficacy', true);
   //// New way to prepare data object for comparative chart
*/

        let data = analyticsLib.getDataForMedicationsExtension({
            medication: '',
            subTab: 'efficacy',
            returnAll: true,
            patientsData: primaryData.efficacyData.patientData
        });

        analyticsLib.exportPatientsData(event.currentTarget, 'efficacy', data);
    },
    'click .efficacy li': function (e, template, data) {
        let tabData = $(e.currentTarget).children('a').attr('data');

        if (data && data == 'refresh') {
            tabData = $('.efficacy li.active a').attr('data');
        }

        $(e.currentTarget).addClass('active').siblings().removeClass('active');

        e.preventDefault();

        if (tabData == "withFDACompliant") {
            //console.log("Render FDA Comliant Data.");

            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "yes";
            fdaCompliant = "yes";

            template.loading.set(true);
            executeEfficacyRender(params, template);


        } else if (tabData == "withoutFDACompliant") {
            //console.log("Render Without FDA Comliant Data.");
            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "no";
            fdaCompliant = "no";

            template.loading.set(true);
            executeEfficacyRender(params, template);

        } else if (tabData == "allMedsData") {
            //console.log("Render All Drugs Data.");

            let params = getCurrentPopulationFilters();
            params['fdaCompliant'] = "all";
            fdaCompliant = "all";

            template.loading.set(true);
            executeEfficacyRender(params, template);
        }
    },

    'click .togglechart': function (event) {
        let value = $(event.currentTarget).attr('data');
        let desc = $(event.currentTarget).attr('diff');
        if (isCustomerDataset()) {
            plotComparisionDataCharts({
                plottingData: value,
                primaryData: primaryData,
                secondaryData: secondaryData,
                desc: desc
            });
        } else {
            plotComparisionDataCharts({
                plottingData: value,
                primaryData: secondaryData,
                secondaryData: primaryData,
                desc: desc
            });
        }
    }



});

//Create helper method for Efficacy page
Template.Efficacy.helpers({
    'isLoading': function () {
        return Template.instance().loading.get();
    },
    'noDataFound': function () {
        return Template.instance().noData.get();
    },
    'isVisible': function () {
        var sampleData = localStorage.selectedDrugs;
        //var selectedDrugName = sampleData && JSON.parse(sampleData) ? JSON.parse(sampleData) : [];
        // remove extra parsing process for faster performance
        var selectedDrugName = sampleData ? JSON.parse(sampleData) : [];
        if (selectedDrugName > 0) {
            return "display:block";
        } else {
            return "display:none";
        }
    },
    'getPateintInfo': function () {
        var data = Template.Provider.__helpers.get('getPopulationData').call();
        // console.log(data);
        return data;
    }
});


function renderEfficacyBarChart(chartDataObj, totalPatients) {
    GenerateEfficacyBarChart(chartDataObj, totalPatients);

    // On Hold until we comup with correct on line statement that describe the insight. -- Commented by Yuvraj 10 Feb 17
    // let insight = new InsightInfo({
    //     tabName: 'analytics_efficacy',
    //     chartName: 'scoreCard',
    //     id: 'analytics_efficacyScoreCard',
    //     chartData: chartDataObj
    // });

    // insight.renderContent();
}

// this function renders the main Efficacy score card.
function GenerateEfficacyBarChart(chartDataObj, totalPatients) {
    chartDataObj = JSON.parse(chartDataObj);
    columnsData = chartDataObj.chartData;
    FinalDrugsArray = chartDataObj.finalDrugsArray;

    columnsData.sort(function (a, b) {
        return parseFloat(b["Population Health"]) - parseFloat(a["Population Health"]);
    });

    // console.log("****** chartDataObj *********");
    // console.log(columnsData);

    if (columnsData.length > 0) {
        $('#efficacy-container').html('');
    }

    //append total patients count
    //Praveen 02/20/2017 commmon cohort
    // setCohortPatientCount({
    //     patientCount: totalPatients
    // });
    // $("#efficacyTab-N").html();
    //$('.searchPatientCountHeader').html(commaSeperatedNumber(totalPatients));


    d3.select('.dimpleMapsContainer').selectAll("*").remove();

    let svgOptions = {
        svgWidth1: 950,
        svgWidth2: 270,
        generalHeight: 80,
        generalMargin: 5,
    }
    let {
        svgWidth1,
        svgWidth2,
        generalHeight,
        generalMargin
    } = svgOptions;

    var svgHieght = columnsData.length * generalHeight;

    //allDrugData
    var svg1 = d3.select("#efficacy-container").append("svg").attr("height", svgHieght).attr("width", svgWidth1).style("background", "");

    var barColor = ['#102430', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97'];
    var barInnerCircleColor = ['#102430', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97', '#2e7e97'];

    var firstGroup = svg1.append('g').attr("transform", "translate(" + 0 + "," + 0 + ")");

    let opacity = 1.0;
    for (let i = 0; i < columnsData.length; i++) {

        var x = 0,
            y = 0,
            rectHeight = generalHeight - generalMargin;
        var HeaderHieght = 20;
        var arr1 = columnsData[i].label.split('+');

        if (arr1.length > 0) {
            var popupHeader = firstGroup.append("text")
                .attr("class", "drugNameDisplay")
                .attr("x", 0)
                .attr("y", (rectHeight + generalMargin) * i + 15)
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
                        .attr('dy', 14)
                        .text(arr1[j]);
                    HeaderHieght = HeaderHieght + 7;
                } else {
                    popupHeader.append('tspan')
                        .attr('x', 0)
                        .attr('dy', 21)
                        .text(arr1[j]);
                    HeaderHieght = HeaderHieght + 15;
                }

            }
        } else {
            var popupHeader = firstGroup.append("text")
                .attr("class", "drugNameDisplay")
                .attr("x", 0)
                .attr("y", (rectHeight + generalMargin) * i + 30)
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
            .attr("x", 120)
            .attr("y", ((rectHeight + generalMargin) * i) + 10)
            .attr("width", 730)
            .attr("height", rectHeight - 20)
            .attr("onclick", "renderEfficacayDetails(event)")
            .attr("drug", columnsData[i].label)
            .style("fill", "#E4E0DC")
            .style("cursor", "pointer");

        var widthBar = ((parseFloat(columnsData[i].weightedAvg) * 730) / 100);

        // ADD FIRST CIRCLE AT END
        firstGroup.append('rect')
            .attr("x", 120)
            .attr("y", ((rectHeight + generalMargin) * i) + 10)
            .attr("width", widthBar)
            .attr("height", rectHeight - 20)
            .attr("onclick", "renderEfficacayDetails(event)")
            .attr("drug", columnsData[i].label)
            .style("fill", barColor[0])
            .style("opacity", opacity)
            .style("cursor", "pointer");

        // ADD CIRCLE AT END
        firstGroup.append('circle')
            //.attr("cx", 110 + widthBar)
            //Added 2 because if we have lower value of utilization chart display in consistent, Need other solution for this issue
            .attr("cx", 120 + 2 + widthBar)
            .attr("cy", ((rectHeight + generalMargin) * i) + 37.5)
            .attr("r", 27.5)
            .attr("onclick", "renderEfficacayDetails(event)")
            .attr("drug", columnsData[i].label)
            .style("fill", barInnerCircleColor[0])
            //.style("stroke", "#ffffff")
            .style("stroke-width", 1)
            .style("opacity", opacity)
            .style("cursor", "pointer");

        //Add White rectangle to hide circle for smaller value or utilization
        //Need to calculate x and Width value dynamically based on `widthBar` value
        if (widthBar <= 27.5) {
            //Render Small rectangle only for lower vale for bar
            //console.log(widthBar);
            firstGroup.append('rect')
                .attr("x", 120 - 27.5)
                .attr("y", ((rectHeight + generalMargin) * i) + 10)
                .attr("width", 27.5)
                .attr("height", rectHeight - 20)
                .style("fill", '#ffffff')
                .style("stroke-width", 1)
                .style("opacity", opacity);
        }

        //FIRST ROW INDICATOR VALUE TEXT
        var val = fixForInteger(columnsData[i].weightedAvg);
        // val = val.toFixed(0);
        var drugName = columnsData[i].label;
        let obj = {
            value: val,
            drugName: drugName,
            DrugN: columnsData[i].TotalDrugN
        };

        // tooltip on text of efficacy chart
        var tooltip = d3.select("#efficacy-container")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "20")
            .style("visibility", "hidden")
            .style("width", "200px")
            .style("font-size", "13px")
            .style("font-family", "Open Sans,sans-serif")
            .style("background-color", "white")
            .style("padding", "10px 10px")
            .style("box-sizing", "border-box")
            .style("box-shadow", "0px 0px 30px 3px rgba(56, 56, 56, 0.5)")

        firstGroup.append("text")
            .attr("class", "drugNameDisplayText")
            .attr("x", 920)
            .attr("y", ((rectHeight + generalMargin) * i) + 40)
            .style("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .style("font-family", "Open Sans, sans-serif")
            .style("fill", "rgb(105, 104, 104)")
            .style("opacity", 1)
            .attr('data', JSON.stringify(obj))
            .style("cursor", "pointer")
            .text(val + '%')
            /**
             * Yuvraj 14th feb 17
             * Tooltip information on te percentage text that will descibe what that percentage means.
             */
            // mouse over event for tooltip of efficacy chart.
            .on("mouseover", function (e) {
                let dataObj = JSON.parse($(this).attr('data'));
                 tooltip.html('Efficacy of <b>' + dataObj.DrugN + '</b>  presciption for <b>' + dataObj.drugName + '</b> is <b>' + dataObj.value + '%</b>')
                //tooltip.html('Efficacy of <b>' + dataObj.DrugN + '</b>  patients who have been prescribed <b>' + dataObj.drugName + '</b> is <b>' + dataObj.value + '%</b>')
                tooltip.style("visibility", "visible");
                return true;
            })
            // mouse move event for tooltip of efficacy chart.
            .on("mousemove", function (e) {
                let dataObj = JSON.parse($(this).attr('data'));
                //tooltip.html('Efficacy of <b>' + dataObj.DrugN + '</b>  patients who have been prescribed <b>' + dataObj.drugName + '</b> is <b>' + dataObj.value + '%</b>')
                tooltip.html('Efficacy of <b>' + dataObj.DrugN + '</b>  presciption for <b>' + dataObj.drugName + '</b> is <b>' + dataObj.value + '%</b>')
                tooltip.style("top", (event.pageY - 300) + "px").style("left", (event.pageX - 120) + "px");
                return true;
            })
            // hide tooltip on mouseout.
            .on("mouseout", function () {
                tooltip.style("visibility", "hidden")
                return true;
            });
    }


};



function fixForInteger(val) {
    if (val == 0) {
        return 0 + '%';
    } else if (val == 'NA') {
        return 'Not Available';
    }

    var convertToInt = parseInt(val);
    var remainder = val % convertToInt;
    if (remainder == 0) {
        return convertToInt;
    }

    return parseFloat(val).toFixed(2);
}

function getPadded(number) {
    var digit = getlength(number);
    var str = number.toString();
    if (digit == 1) {
        var str = pad(number, 2);
    }
    return str;
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function getlength(number) {
    return number.toString().length;
}

function assignClickEventToEffBubbles() {
    $('.js-ecf-circle').click(function () {
        // analyticsLib.appendPatientsDetails($(this));
        renderEfficacayDetails($(this));
    });
}

function FixNaNForCircle(val) {
    if (val == 'NA') {
        return 0;
    }
    return val;
}


renderEfficacayDetails = (event) => {
    let medicationInfo = {};

    let drugName = $(event.target).attr('drug');

    //    valueData = $(obj).find('.efficacyBubble').attr('data-text');

    medicationInfo['Medication'] = drugName;
    // medicationInfo['Medication'] = medicationInfo['Medication'].replace(/\s*\(.*?\)\s*/g, '');

    // FinalDrugsArray is defined  at the top of this page.
    var therapy = _.where(FinalDrugsArray, {
        DrugName: drugName
    });
    medicationInfo['therapy'] = therapy;

    // drugName = drugName.split(' ');
    // drugName = drugName[drugName.length - 1];
    // drugName = drugName.replace('(', '');
    // drugName = drugName.replace('W)', '');
    // medicationInfo['treatmentPeriod'] = parseInt(drugName);

    let dummyCheck = $(event.target).attr('drug').indexOf("THEN") > 1 ? true : false;
    // let dummyCheck = drugName;
    let data = [];

    /**
 * @author: Arvind
 * @reviewer: 
 * @date: 25-May-2017
 * @desc: 
 * //// OLD commented below code by Arvind on 25-May-2017 which is used prior to start comparative functionality  (Total patient counts not adding up in therapy distribution)
    //data = analyticsLib.getDataForMedications(medicationInfo, 'efficacy', dummyCheck);
   //// New way to prepare data object for comparative chart
*/

    data = analyticsLib.getDataForMedicationsExtension({
        medication: drugName,
        subTab: 'efficacy',
        returnAll: dummyCheck,
        patientsData: primaryData.efficacyData.patientData
    });
    
    // prepareDomForPatients(data, { medicationInfo: medicationInfo, value: valueData, subTab: 'efficacy' });
    // prepareNewDomInThePopup(data, { medicationInfo: medicationInfo, value: valueData, subTab: 'efficacy' });
    //    analyticsLib.prepareEfficacyPopup(data, { medicationInfo: medicationInfo, value: valueData, subTab: 'efficacy' });
    analyticsLib.prepareEfficacyPopup(data, {
        medicationInfo: medicationInfo,
        subTab: 'efficacy',
        patientsData: primaryData.efficacyData.patientData
    });

};


function plotCureDistributionChart(container, data, chartName) {
    container = '#' + container;
    let colors = '#17becf';

    if (chartName == 'race')
        colors = '#fbde97';
    else if (chartName == 'gender')
        colors = '#b1e8ea';
    else if (chartName == 'age')
        colors = '#1f77b4';


    let chartData = [{
        'Status': 'Cured',
        'Patient Count': data.filter(function (rec) {
            return rec.isCured == 1;
        }).length
    }, {
        'Status': 'Not Cured',
        'Patient Count': data.filter(function (rec) {
            return rec.isCured == 0;
        }).length
    }];


    let chart = c3.generate({
        bindto: container,
        padding: {
            top: 8,
            right: 60,
        },
        data: {
            type: 'bar',
            json: chartData,
            keys: {
                x: 'Status',
                value: ['Patient Count']
            },
            labels: {
                format: function (v, id, i, j) {
                    //console.log(v + ' ' +id + i +' '+j);
                    return commaSeperatedNumber(v);
                },
            },
        },
        size: {
            height: 230,
            width: 400
        },
        legend: {
            show: false,
            //position:'right',
        },
        tooltip: {
            show: true,
            grouped: false
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
            pattern: [colors]
        },
        bar: {
            width: {
                ratio: 0.8
            }
        },
    });
    if (chartName == 'race') {
        $('[id*="_RaceCure"]').css('max-height', '');
        $('[id*="_RaceCure"]').find('svg').attr('height', '225');
    }
}

let executeEfficacyRender = (params, tempateObj) => {
    Meteor.call('getEfficacyTabData', params, function (error, result) {
        if (error) {
            tempateObj.loading.set(false);
            tempateObj.noData.set(true);
        } else {
            //allDrugsData = result.drugsData;
            let decompressed_object = LZString.decompress(result);
            result = JSON.parse(decompressed_object);

            AmdApp['MedicationSVR'] = result.PatientsJourney;
            primaryData.efficacyData = result;
            tempateObj.loading.set(false);
            tempateObj.noData.set(false);
            // self.loading.set(false);
            setTimeout(function () {
                // console.log("****** Row Data *********");
                // console.log(result);
                renderEfficacyBarChart(result.chartsData, result.totalPatients);

                // let drugsData = prepareGroupedMedsData(result.chartsData, 'efficacy');
                // result.chartsData = JSON.stringify(getAnalyticsMainBarData(drugsData));
                // result['totalPatients'] = drugsData[0]['TotalN'];
                // GenerateEfficacyBarChart(result.chartsData,result.totalPatients);

                // renderStackedEfficacyChart(result.chartsData,result.totalPatients);
                setCohortPatientCount({
                    patientCount: result.totalPatients
                });
                /**
                 * 115 (88.46%) Over 130 Patient with SVR12. 
                130 (25.95%) Patient with SVR12 Over 501 Patient with Medications. 
                 */
                let patientDataWithSvr12 = _.filter(result.patientData, (d) => {
                    return d.SVR12 !== null;
                });

                $("#efficacyTab-N").html(getHTMLCustomTextN(getUniqueCount(patientDataWithSvr12, "patientId"),result.totalPatients, "Patient With Medication and SVR12"));

            }, 500);

            /**
             * @author: Arvind
             * @reviewer: 
             * @date: 26-May-2017
             * @desc: Commented below method which calling server side method to retrive data.
             * After comprative functionality this not working as expected. So passed required data `patientData` in method parameter 
             */

            analyticsLib.getPatientsDataForAnalytics((res) => {
                if (!res) {
            //         tempateObj.loading.set(false);
            //         tempateObj.noData.set(true);
                    console.log('fetched data for showing results');
        }
            });
        }
        //Fetch Secondary datset 
        fetchSecondaryDataset(params);
    });
};

let getAnalyticsMainBarData = (efficacyData) => {
    FinalDrugsArray = [];
    if (efficacyData.length > 0) {

        let medications = _.uniq(_.pluck(efficacyData, 'DrugNameWithoutWeek'));

        let treatmentPeriod = _.uniq(_.pluck(efficacyData, 'TreatmentPeriod'));

        console.log("Medications");
        console.log(medications);

        console.log("Treatment Period");
        console.log(treatmentPeriod);

        treatmentPeriod.sort(function (a, b) {
            return parseInt(b) - parseInt(a);
        });

        let finalArray2 = _.groupBy(efficacyData, 'DrugNameWithoutWeek');
        console.log(finalArray2);

        // initialize FinalDrugsArray to be emplty;
        FinalDrugsArray = [];
        //medications = [];
        for (let key in finalArray2) {
            let obj = {};
            obj['DrugName'] = key;

            obj['TotalDrugN'] = 0;
            let DrugsGroup = finalArray2[key];
            obj['therapy'] = DrugsGroup;

            for (let i = 0; i < DrugsGroup.length; i++) {
                obj['TotalDrugN'] += DrugsGroup[i].DrugN;
            }
            if (obj['TotalDrugN'] != 0) {
                FinalDrugsArray.push(obj);
                //  medications.push(key);
            }
        }

        console.log(FinalDrugsArray);



        let seriese = [];

        for (let i = 0; i < treatmentPeriod.length; i++) {
            let serieseObj = {};
            let data = [];
            serieseObj['name'] = treatmentPeriod[i];

            for (let j = 0; j < FinalDrugsArray.length; j++) {
                let therapy = FinalDrugsArray[j].therapy;
                let isDataPushed = false;
                for (let k = 0; k < therapy.length; k++) {
                    if (therapy[k].TreatmentPeriod == treatmentPeriod[i]) {
                        data.push(therapy[k].Efficacy.Efficacy == 'NA' ? 0 : parseFloat(therapy[k].Efficacy.Efficacy));
                        isDataPushed = true;
                    }
                }
                if (!isDataPushed) {
                    data.push(0);
                }
            }
            serieseObj['data'] = data;
            if (data.sum() != 0) {
                seriese.push(serieseObj);
            }

        }

        let rmedications = [];
        for (let i = 0; i < medications.length; i++) {
            let flag = false;
            for (let j = 0; j < seriese.length; j++) {
                if (seriese[j][i] != 0) {
                    flag = true;
                }
            }
            if (flag) {
                rmedications.push(medications[i]);
            }
        }
        console.log("****** Final Seriese data ********");
        console.log(seriese);

        return {
            seriese: seriese,
            medications: rmedications
        };
    }

}



/*
let getAnalyticsMainBarData = (efficacyData) => {
    let FinalDrugsArray = [];
    if (efficacyData.length > 0) {


        let finalArray2 = _.groupBy(efficacyData, 'DrugNameWithoutWeek');

        // initialize FinalDrugsArray to be emplty;
        FinalDrugsArray = [];
        for (let key in finalArray2) {
            let obj = {};
            obj['DrugName'] = key;

            obj['TotalDrugN'] = 0;
            let DrugsGroup = finalArray2[key];
            obj['therapy'] = DrugsGroup;

            for (let i = 0; i < DrugsGroup.length; i++) {
                obj['TotalDrugN'] += DrugsGroup[i].DrugN;
            }
            FinalDrugsArray.push(obj);
        }
    }

    console.log(FinalDrugsArray);

    var chartData = [];
    let OtherValue = 0;
    let OtherValueMe = 0,
        OtherValueMyNetwork = 0,
        OtherValuePopulationHealth = 0;
    let totalUtiScore = 0;

    let totalPatients = efficacyData[0]['TotalN'];

    for (var i = 0; i < FinalDrugsArray.length; i++) {

        var utiScore = FinalDrugsArray[i] && FinalDrugsArray[i]["TotalDrugN"] ? FinalDrugsArray[i]["TotalDrugN"] : 0;
        // calculate percentage
        utiScore = (utiScore * 100) / totalPatients;

        var wrapDrug = '';
        column = [];

        var splittedDrug = FinalDrugsArray[i]["DrugName"].split('+');
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
            wrapDrug = FinalDrugsArray[i]["DrugName"];

        }

        PopulationHealth = FinalDrugsArray[i] && FinalDrugsArray[i]["TotalDrugN"] ? FinalDrugsArray[i]["TotalDrugN"] : 0;

        //Check weather same truncated drug name exist or not
        var calculatedDrugs = chartData.filter(function(d) {
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

        row.label = FinalDrugsArray[i]["DrugName"];
        row.value = parseFloat(utiScore).toFixed(2);
        row["Population Health"] = parseFloat(utiScore).toFixed(2);
        chartData.push(row);

    }


    chartData.sort(function(a, b) {
        return parseFloat(b["Population Health"]) - parseFloat(a["Population Health"]);
    });

    return {chartData: chartData, finalDrugsArray : FinalDrugsArray};
}

*/


let prepareGroupedMedsData = (patientsData, dataTab) => {
    let totalPatients = patientsData.length;

    let medsGrpsData = _.groupBy(patientsData, (rec) => {
        return rec.Medication + '_' + rec.treatmentPeriod; //group by drug name & treatment period (Harvoni_12)
    });

    let drugsData = [],
        drugId = 1,
        finalObj = {};


    //loop for all medication data
    for (let medGrp in medsGrpsData) {
        let currMedData = medsGrpsData[medGrp];
        let paramObj = {
            totalPatients: totalPatients,
            drugId: drugId
        }

        if (dataTab == 'efficacy') {
            drugsData.push(prepareEfficacyForSingleMed(currMedData, paramObj));
        } else if (dataTab == 'adherence') {
            drugsData.push(prepareAdherenceForSingleMed(currMedData, paramObj));
        }

        drugId++;
    }


    return drugsData;

}

let prepareEfficacyForSingleMed = (dataArray, dataObj) => {
    let drugObj = {};

    let total_count = 0,
        efficacy_len = 0,
        med_count = 0,
        svr_patients = 0;

    let drugName = dataArray[0].Medication,
        treatmentPeriod = dataArray[0].treatmentPeriod;

    for (let j = 0; j < dataArray.length; j++) {

        med_count = parseInt(dataArray[j]['total']);
        total_count += med_count;

        //  Modified for IMS DB Intefration
        // Consider only those patients for SVR calculation who have SVR data.
        if (dataArray[j]['SVR12'] != null) {
            svr_patients += med_count;
            if (dataArray[j]['SVR12'] == 1) {
                efficacy_len += med_count;
            }
        }

    }

    drugObj['DrugName'] = drugName + ' (' + treatmentPeriod + "W)";
    drugObj['DrugNameWithoutWeek'] = drugName;
    drugObj['TreatmentPeriod'] = treatmentPeriod;
    drugObj['DrugPopulationSize'] = total_count;
    drugObj['DrugN'] = total_count;
    drugObj['TotalN'] = dataObj.totalPatients;
    drugObj['DrugId'] = dataObj.drugId;
    drugObj['DrugSequence'] = dataObj.drugId;

    // var efficacy = ((efficacy_len/parseInt(total_count))*100);
    // Consider only patietnts with svr for efficacy calculations.
    let efficacy = svr_patients == 0 ? 'NA' : ((efficacy_len / parseInt(svr_patients)) * 100);

    drugObj['Efficacy'] = {
        'Efficacy': efficacy == 'NA' ? 'NA' : efficacy.toFixed(2),
        'PWeek12': 0,
        'ResponseRate': ('N=' + svr_patients)
    };

    return drugObj;
}





let renderStackedEfficacyChart = (chartDataObj, totalPatients) => {

    chartDataObj = JSON.parse(chartDataObj);
    let seriese = chartDataObj.seriese;
    let medications = chartDataObj.medications;
    //append total patients count
    //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(totalPatients));
    //Praveen 02/20/2017 commmon cohort
    setCohortPatientCount({
        patientCount: totalPatients
    });

    Highcharts.chart('efficacy-container', {
        chart: {
            type: 'bar',
            height: 1000
        },
        title: {
            text: null
        },
        xAxis: {
            categories: medications,

        },
        yAxis: {
            min: 0,
            title: {
                text: '',
            },
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            labels: {
                enabled: false
            },
            minorTickLength: 0,
            tickLength: 0
        },
        legend: {
            reversed: true
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (event) {
                            renderEfficacayDetails(event.point.category);
                        }
                    }
                },
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    align: 'right',
                    color: '#222',
                    x: -10,
                    formatter: function () {
                        console.log(this);
                        if (this.y == 0) {
                            // this.point.dataLabel.x = 50;
                            // return 'NA';
                        } else {
                            return this.y + '%';
                        }
                    }
                },
                pointPadding: 0.1,
                groupPadding: 0
            }
        },
        series: seriese
    });
}


//function to plot comparision charts
let plotComparisionDataCharts = ({
    plottingData,
    primaryData,
    secondaryData,
    desc
}) => {


    let chartContainer = {};
    chartContainer.primaryDivID = 'primaryDataViewSection',
        chartContainer.secondaryDivID = 'secondaryDataViewSection';


    chartContainer.height = 800;
    chartContainer.width = 510;

    //empty the containers
    $('#' + chartContainer.primaryDivID).empty();
    $('#' + chartContainer.secondaryDivID).empty();

    analyticsLib.prepareDomForComparisionCharts(plottingData);

    // let phsContainer = 'primaryDataViewSection',
    //     imsContainer = 'secondaryDataViewSection';

    let chartTypeLabel = '';


    // chartSize.svgWidth1= 250;
    // chartSize.svgWidth2= 270;
    // chartSize.generalHeight= 60;
    // chartSize.generalMargin= 5;


    switch (plottingData) {

        case 'efficacy-container':
            chartTypeLabel = 'Sustained Virologic Response (SVR)';
            chartContainer.chartTitle = chartTypeLabel;
            chartContainer.tabName = "Efficacy";
            HighBarChartForComparative({
                container: chartContainer.primaryDivID,
                chartDataObj: primaryData.efficacyData.chartsData,
                chartContainer: chartContainer
            });
            HighBarChartForComparative({
                container: chartContainer.secondaryDivID,
                chartDataObj: secondaryData.efficacyData.chartsData,
                chartContainer: chartContainer
            });

            break;
    }

    $('.chartTypeLabel').html(chartTypeLabel);
    //show the popup
    $('#datasetComparsionPopup').show();
}

function HighBarChartForComparative({
    container,
    chartDataObj,
    chartSize,
    chartTitle,
    tabName,
    chartContainer
}) {
    console.log(container);
    chartDataObj = JSON.parse(chartDataObj);
    columnsData = chartDataObj.highchartData;
    //FinalDrugsArray = chartDataObj.finalDrugsArray;
    console.log(columnsData);
    columnsData = _.sortBy(columnsData, (rec) => {
        return rec.name.toString();
    });

    Highcharts.chart(container, {
        chart: {
            type: 'bar',
            height: chartContainer.height,
            width: chartContainer.width,
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'category',
            labels: {
                formatter: function () {
                    let xlabel = this.value.toString().split('+');
                    let html = '<span>';
                    _.each(xlabel, (rec) => {
                        html += rec + '<br />';
                    });
                    html += '</span>';
                    return html;
                }
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            gridLineWidth: 0,
            title: {
                text: null
            },
            labels: {
                enabled: false
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            reversed: false,
            enabled: false
        },
        plotOptions: {
            series: {
                stacking: 'normal',
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            //console.log(this);
                            chartContainer.chartName = this.name;
                            renderDrilldownChart(chartContainer);
                        }
                    }
                }
            },
            bar: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y + '%';
                    }
                },
            }
        },
        tooltip: {
            formatter: function () {
                return `${chartContainer.tabName} of <b> ${this.point.TotalDrugN}  </b>  patients who have been<br /> prescribed <b> ${this.point.name}</b> is 
                         <b> ${this.y}%</b>`;
            }
        },
        series: [{
            name: chartContainer.chartTitle,
            data: columnsData
        }]
    });
}



function renderDrilldownChart(chartContainer) {


    let medicationInfo = {};



    //    valueData = $(obj).find('.efficacyBubble').attr('data-text');

    medicationInfo['Medication'] = chartContainer.chartName;
    // medicationInfo['Medication'] = medicationInfo['Medication'].replace(/\s*\(.*?\)\s*/g, '');

    //// bELOW final FinalDrugsArray should be different for each dataset  need to modify
    // FinalDrugsArray is defined  at the top of this page.
    var therapy = _.where(FinalDrugsArray, {
        DrugName: chartContainer.chartName
    });
    medicationInfo['therapy'] = therapy;

    // drugName = drugName.split(' ');
    // drugName = drugName[drugName.length - 1];
    // drugName = drugName.replace('(', '');
    // drugName = drugName.replace('W)', '');
    // medicationInfo['treatmentPeriod'] = parseInt(drugName);

    let dummyCheck = chartContainer.chartName.indexOf("THEN") > 1 ? true : false;
    // let dummyCheck = drugName;
    let data = [];
    /**
 * @author: Arvind
 * @reviewer: 
 * @date: 25-May-2017
 * @desc: 
 * //// OLD commented below code by Arvind on 25-May-2017 which is used prior to start comparative functionality  (Total patient counts not adding up in therapy distribution)
    //data = analyticsLib.getDataForMedications(medicationInfo, 'efficacy', dummyCheck);
   //// New way to prepare data object for comparative chart
*/

    data = analyticsLib.getDataForMedicationsExtension({
        medication: chartContainer.chartName,
        subTab: 'efficacy',
        returnAll: dummyCheck,
        patientsData: primaryData.efficacyData.patientData
    });




    // prepare primary div for rendering location map, age distribution, therapy distribution.
    let primaryHtml = `<div class="col-lg-12">
                        <div><b>${chartContainer.chartName}</b></div>
                    </div>
                    <div class="col-lg-12" style="min-height:420px">
                        <div class="" ><b>Therapy Distribution</b></div>
                        <div class="" id="${chartContainer.primaryDivID}comparativeTherapyDistribution"></div>
                    </div>
                    `;
    try {

        primaryHtml += prepareHtmlForViralLoadOverTimeComparativeChart({
            isPrimary: true,
            chartContainer: chartContainer,
            data: filterDataByMedication(primaryData.efficacyData.patientData, chartContainer.chartName),
            dataObj: {
                medicationInfo: medicationInfo,
                subTab: 'efficacy'
            }
        });
    } catch (ex) {
        console.log(ex);
    }
    $('#' + chartContainer.primaryDivID).html(primaryHtml);

    // prepare secondary div for rendering location map, age distribution, therapy distribution.
    let secondaryHtml = `<div class="col-lg-12">
                        <div><b>${chartContainer.chartName}</b></div>
                        <div style="cursor:pointer;position: relative!important;top:-60px" class="efficacyBack customChartBackButton backButtonCss">Back</div>
                    </div>
                    <div class="col-lg-12" style="min-height:420px;margin-top: -46px;">
                        <div class="" ><b>Therapy Distribution</b></div>
                        <div class="" id="${chartContainer.secondaryDivID}comparativeTherapyDistribution"></div>
                    </div>
                    `;
    try {
        secondaryHtml += prepareHtmlForViralLoadOverTimeComparativeChart({
            isPrimary: false,
            chartContainer: chartContainer,
            data: filterDataByMedication(primaryData.efficacyData.patientData, chartContainer.chartName),
            dataObj: {
                medicationInfo: medicationInfo,
                subTab: 'efficacy'
            }
        });
    } catch (ex) {
        console.log(ex);
    }
    $('#' + chartContainer.secondaryDivID).html(secondaryHtml);
    // bind back button event for drill up main chart in comparative.
    $('.efficacyBack').on('click', function () {
        // filping dataset 
        if (isCustomerDataset()) {
            //Need to change chartn ame method for efficacy
            HighBarChartForComparative({
                container: chartContainer.primaryDivID,
                chartDataObj: primaryData.efficacyData.chartsData,
                chartContainer: chartContainer
            });
            HighBarChartForComparative({
                container: chartContainer.secondaryDivID,
                chartDataObj: secondaryData.efficacyData.chartsData,
                chartContainer: chartContainer
            });

            // renderCompartiveHighBarCharts(chartContainer.primaryDivID, primaryData.adherenceData.chartsData, chartContainer);
            // renderCompartiveHighBarCharts(chartContainer.secondaryDivID, secondaryData.adherenceData.chartsData, chartContainer);
        } else {
            //     renderCompartiveHighBarCharts(chartContainer.primaryDivID, secondaryData.adherenceData.chartsData, chartContainer);
            //     renderCompartiveHighBarCharts(chartContainer.secondaryDivID, primaryData.adherenceData.chartsData, chartContainer);
            HighBarChartForComparative({
                container: chartContainer.primaryDivID,
                chartDataObj: secondaryData.efficacyData.chartsData,
                chartContainer: chartContainer
            });
            HighBarChartForComparative({
                container: chartContainer.secondaryDivID,
                chartDataObj: primaryData.efficacyData.chartsData,
                chartContainer: chartContainer
            });

        }
    });
    let primaryfilterData = [],
        secondaryfilterData = [];

    let analyticsParams = AmdApp['Filters'];
    // console.log(analyticsParams.genotypes);

    var selectedGenotypes = [];
    if (analyticsParams.genotypes != null) {
        var genotypes = analyticsParams.genotypes;

        var geno = genotypes.replace(/\'/g, "");
        var t = [];
        t = geno.split(",");

        // console.log(t);
        for (i = 0; i < t.length; i++) {
            // console.log(t[i]);
            selectedGenotypes.push(t[i]);
        }

    } else
        selectedGenotypes = null;

    // filping dataset 
    if (isCustomerDataset()) {
        //Not required at this time so commented
        // primaryfilterData = filterDataByMedication(primaryData.efficacyData.patientData, chartContainer.chartName);
        // secondaryfilterData = filterDataByMedication(secondaryData.efficacyData.patientData, chartContainer.chartName);

        analyticsLib.renderEfficayTherapyDisributionForComparative({
            container: chartContainer.primaryDivID + 'comparativeTherapyDistribution',
            chartData: analyticsLib.prepareDataForEfficacyTherapyDistributionChart({
                treatedPatients: primaryData.efficacyData.patientData,
                medication: chartContainer.chartName
            }),
            medication: chartContainer.chartName
        });

        analyticsLib.renderEfficayTherapyDisributionForComparative({
            container: chartContainer.secondaryDivID + 'comparativeTherapyDistribution',
            chartData: analyticsLib.prepareDataForEfficacyTherapyDistributionChart({
                treatedPatients: secondaryData.efficacyData.patientData,
                medication: chartContainer.chartName
            }),
            medication: chartContainer.chartName
        });

        // For SVR Over Time

        analyticsLib.renderEfficacyMedcationSVRTrendChartForComparative({
            container: 'ap_AggregateSVRChart' + chartContainer.primaryDivID,
            medication: chartContainer.chartName,
            genoTypes: selectedGenotypes,
            svrData: primaryData.efficacyData.PatientsJourney
        });


        analyticsLib.renderEfficacyMedcationSVRTrendChartForComparative({
            container: 'ap_AggregateSVRChart' + chartContainer.secondaryDivID,
            medication: chartContainer.chartName,
            genoTypes: selectedGenotypes,
            svrData: secondaryData.efficacyData.PatientsJourney
        });

    } else {

        //Not required at this time so commented
        // primaryfilterData = filterDataByMedication(secondaryData.efficacyData.patientData, chartContainer.chartName);
        // secondaryfilterData = filterDataByMedication(primaryData.efficacyData.patientData, chartContainer.chartName);

        analyticsLib.renderEfficayTherapyDisributionForComparative({
            container: chartContainer.primaryDivID + 'comparativeTherapyDistribution',
            chartData: analyticsLib.prepareDataForEfficacyTherapyDistributionChart({
                treatedPatients: secondaryData.efficacyData.patientData,
                medication: chartContainer.chartName
            }),
            medication: chartContainer.chartName
        });

        analyticsLib.renderEfficayTherapyDisributionForComparative({
            container: chartContainer.secondaryDivID + 'comparativeTherapyDistribution',
            chartData: analyticsLib.prepareDataForEfficacyTherapyDistributionChart({
                treatedPatients: primaryData.efficacyData.patientData,
                medication: chartContainer.chartName
            }),
            medication: chartContainer.chartName
        });


        // For SVR Over Time

        analyticsLib.renderEfficacyMedcationSVRTrendChartForComparative({
            container: 'ap_AggregateSVRChart' + chartContainer.primaryDivID,
            medication: chartContainer.chartName,
            genoTypes: selectedGenotypes,
            svrData: secondaryData.efficacyData.PatientsJourney
        });


        analyticsLib.renderEfficacyMedcationSVRTrendChartForComparative({
            container: 'ap_AggregateSVRChart' + chartContainer.secondaryDivID,
            medication: chartContainer.chartName,
            genoTypes: selectedGenotypes,
            svrData: primaryData.efficacyData.PatientsJourney
        });


    }
    // Here I need to adapt changes which is responsible for efiicacy popup render

}


function filterDataByMedication(data, medication) {
    let baseData = data.filter(function (rec) {
        let drugName = rec.Medication;
        if (drugName == medication) {
            return true;
        } else {
            return false;
        }
    });
    return baseData;
}

// Added By Arvind 24th May 2017 for fetching data of second dataset to compare data.
let fetchSecondaryDataset = (params) => {
   // console.log("getEfficacyTabData-> Started fetching...");
    params.database = getReverseSelectedDatabase();
    Meteor.call('getEfficacyTabData', params, function (error, result) {
        if (error) {
            // tempateObj.loading.set(false);
            // tempateObj.noData.set(true);
        } else {
            //allDrugsData = result.drugsData;
            let decompressed_object = LZString.decompress(result);
            result = JSON.parse(decompressed_object);
            secondaryData.efficacyData = result;
            $('.togglechart').show();
          //  console.log("getEfficacyTabData-> Fetched Successfully");
        }
    });
}

function prepareHtmlForViralLoadOverTimeComparativeChart({
    chartContainer,
    isPrimary,
    isSecondary,
    dataObj
}) {

    let contentBox = `<div class="apContentBox">
                        <div class="">
                            <div class="col-md-12">
                                <div class="col-md-12">`;
    //// Here need to adapt changes related with both Primary and secondary dataset
    let filteredSRVData = isPrimary ? primaryData.efficacyData.PatientsJourney : secondaryData.efficacyData.PatientsJourney;

    //// This filter also can be adapted based on current drug selection
    filteredSRVData = filteredSRVData.filter(function (a) {
        return a.MEDICATION == dataObj.medicationInfo.Medication;
    });

    var TreatmentWeeks = [];


    let strradiobutton = '';
    // strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="999" checked> All Weeks ';
    //// `fdaCompliant` variable created at top 
    if (fdaCompliant === "yes") {
        TreatmentWeeks = _.groupBy(filteredSRVData, 'TREATMENT_PERIOD');
        // console.log('TreatmentWeeks');
        // console.log(TreatmentWeeks);
        // $('#divWeekResponse').empty();
        for (let weekkeys in TreatmentWeeks) {
            if (parseInt(weekkeys) == 8) {
                strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-' + weekkeys + '" checked> ' + weekkeys + ' Weeks ';
            } else {
                strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-' + weekkeys + '"> ' + weekkeys + ' Weeks ';

            }
        }
        // $('#divWeekResponse').append(strradiobutton);
        // console.log(strradiobutton);
        contentBox = contentBox + `<div class="col-md-12" style="margin-top:30px;border:1px solid #ddd;min-height:450px;"  >
        <h3>Viral Load Over Time
          <!--  <div class="insight-icon">
                <i class="fa fa-lightbulb-o" aria-hidden="true" id="insight" style="font-size:24px;right: 850px;"></i>
                <div class="arrow-insight" style="right: 864px;top: 34px;"></div>
                <div class="insight-content-box" style="left: 50px;>
                     <div class="insight-header">
                                    Insight - Sustained Virologic Response (SVR)
                    </div>
                    <div class="col-md-12">
                         <div class="col-md-3 insight-image">
                            <img src="/insight-image.png" align="top" />
                        </div>
                    <div class="col-md-9 insight-body" style="padding: 20px 10px;">
                    </div>
                    </div>
                </div>
            </div>  -->
        </h3>
            <div class="effSvrChartWrap">
                <div id='divWeekResponse${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}' style="display:none">
                <label style = "font-weight : normal;float: left;">Therapy Period :</label>
                        &nbsp; &nbsp;${strradiobutton}
                </div>
               <!-- Commented for compartive charts -->
                    <!-- 
                <div class="followPatientsDiv" id="followSamePatients" title="" style="float:right;"></div>
                <div class="backToSvrTrend" style="float:right;"> 
                <div class="backButtonCss js-backtoSvrTrend">Back to Svr Trend</div>-->
            </div>
            <div  id="ap_AggregateSVRChart${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}"> test </div>
        </div>
        <div class="effSinglePatientWrap" style="display:none;" >
             <div class="backToSvrTrend" style="float:right;">
                <div class="backButtonCss js-backtoPatients">Back</div>
            </div>
            <div  id="eff_SinglePatientJourney${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}"> test </div>
        </div>
        </div>`;

    } else if (fdaCompliant === "no") {

        var maxweekspp = _.max(_.pluck(filteredSRVData, 'TREATMENT_PERIOD'));
        // console.log('maxweekspp');
        // console.log(maxweekspp);

        if (parseInt(maxweekspp) >= 0 && parseInt(maxweekspp) <= 8) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-' + maxweekspp + '" checked> 0 - ' + maxweekspp + ' Weeks ';
        } else if (parseInt(maxweekspp) > 8) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-8" checked> 0 - 8 Weeks ';
        }
        if (parseInt(maxweekspp) >= 9 && parseInt(maxweekspp) <= 12) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="9-' + maxweekspp + '"> 9 - ' + maxweekspp + ' Weeks ';
        } else if (parseInt(maxweekspp) > 12) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="9-12"> 9 - 12 Weeks ';
        }
        if (parseInt(maxweekspp) >= 13 && parseInt(maxweekspp) <= 24) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="13-' + maxweekspp + '"> 13 - ' + maxweekspp + ' Weeks ';
        } else if (parseInt(maxweekspp) > 24) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="13-24"> 13 - 24 Weeks ';
        }
        if (parseInt(maxweekspp) >= 25 && parseInt(maxweekspp) <= 48) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="25-' + maxweekspp + '"> 25 - ' + maxweekspp + ' Weeks ';
        } else if (parseInt(maxweekspp) > 48) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="25-48"> 25 - 48 Weeks ';
        }

        contentBox = contentBox + `<div class="col-md-12" style="margin-top:30px;border:1px solid #ddd;min-height:450px;" >
            <h3>Viral Load Over Time
           <!-- <div class="insight-icon">
                <i class="fa fa-lightbulb-o" aria-hidden="true" id="insight" style="font-size:24px;right: 850px;"></i>
                <div class="arrow-insight" style="right: 864px;top: 34px;"></div>
                <div class="insight-content-box" style="left: 50px;>
                    <div class="insight-header">
                                    Insight - Sustained Virologic Response (SVR)
                    </div>
                    <div class="col-md-12">
                         <div class="col-md-3 insight-image">
                            <img src="/insight-image.png" align="top" />
                        </div>
                    <div class="col-md-9 insight-body" style="padding: 20px 10px;">
                    </div>
                    </div>
                </div>
            </div> -->
        </h3>
        <div class="effSvrChartWrap">
            <div id='divWeekResponse${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}' style="display:none">
            <label style = "font-weight : normal;float: left;">Therapy Period : </label>
                        &nbsp; &nbsp; ${strradiobutton}
                    </div>
                    <!-- Commented for compartive charts -->
                    <!-- 
                <div class="followPatientsDiv" id="followSamePatients" title="" style="float:right;"></div>
                <div class="backToSvrTrend" style="float:right;"> 
                    <div class="backButtonCss js-backtoSvrTrend">Back to Svr Trend</div>
                </div>-->
            <div  id="ap_AggregateSVRChart${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}"> test </div></div>
        </div>
        <div class="effSinglePatientWrap" style="display:none;" >
             <div class="backToSvrTrend" style="float:right;">
                <div class="backButtonCss js-backtoPatients">Back</div>
            </div>
            <div  id="eff_SinglePatientJourney${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}"> test </div>
        </div>`;
    } else {

        var maxweekspp = _.max(_.pluck(filteredSRVData, 'TREATMENT_PERIOD'));
        // console.log('maxweekspp');
        // console.log(maxweekspp);

        if (parseInt(maxweekspp) >= 0 && parseInt(maxweekspp) <= 8) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-' + maxweekspp + '" checked> 0 - ' + maxweekspp + ' Weeks ';
        } else {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="0-8" checked> 0 - 8 Weeks ';
        }
        if (parseInt(maxweekspp) >= 9 && parseInt(maxweekspp) <= 12) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="9-' + maxweekspp + '"> 9 - ' + maxweekspp + ' Weeks ';
        } else {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="9-12"> 9 - 12 Weeks ';
        }
        if (parseInt(maxweekspp) >= 13 && parseInt(maxweekspp) <= 24) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="13-' + maxweekspp + '"> 13 - ' + maxweekspp + ' Weeks ';
        } else {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="13-24"> 13 - 24 Weeks ';
        }
        if (parseInt(maxweekspp) >= 25 && parseInt(maxweekspp) <= 48) {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="25-' + maxweekspp + '"> 25 - ' + maxweekspp + ' Weeks ';
        } else {
            strradiobutton = strradiobutton + '<input type="radio" name="duration"  class="radioduration" value="25-48"> 25 - 48 Weeks ';
        }

        contentBox = contentBox + `<div class="col-md-12" style="margin-top:30px;border:1px solid #ddd;min-height:450px;" >
        <h3>Viral Load Over Time
        <!-- <div class="insight-icon">
            <i class="fa fa-lightbulb-o" aria-hidden="true" id="insight" style="font-size:24px;right: 850px;"></i>
            <div class="arrow-insight" style="right: 864px;top: 34px;"></div>
            <div class="insight-content-box" style="left: 50px;">
                <div class="insight-header">
                                Insight - Sustained Virologic Response (SVR)
                </div>
                <div class="col-md-12">
                  <div class="col-md-3 insight-image">
                            <img src="/insight-image.png" align="top" />
                    </div>
                    <div class="col-md-9 insight-body" style="padding: 20px 10px;">
                    </div>
                </div>
            </div>
        </div> -->
    </h3>
     <div class="effSvrChartWrap">
        <div id='divWeekResponse${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}' style="display:none">
            <div class="" style="float: left;">
                <label style = "font-weight : normal;float: left;">Therapy Period : </label>
                        &nbsp; &nbsp; ${strradiobutton}
            </div>
           <!-- Commented for compartive charts -->
                    <!-- 
                <div class="followPatientsDiv" id="followSamePatients" title="" style="float:right;"></div>
                <div class="backToSvrTrend" style="float:right;">
                <div class="backButtonCss js-backtoSvrTrend">Back to Svr Trend</div>
              
            </div>   -->
        </div>
        <div  id="ap_AggregateSVRChart${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}"> test </div></div>
    </div>
    <div class="effSinglePatientWrap" style="display:none;" >
            <div class="backToSvrTrend" style="float:right;">
            <div class="backButtonCss js-backtoPatients">Back</div>
        </div>
        <div  id="eff_SinglePatientJourney${isPrimary?chartContainer.primaryDivID:chartContainer.secondaryDivID}"> test </div>
    </div>`;
    }

    return contentBox;
}