import {
    Template
} from 'meteor/templating';
import { LZString } from 'meteor/nunohvidal:lz-string';
import { Meteor } from 'meteor/meteor';
import './CompetitorAnalysis.html';
import * as pharmaLib from '../pharmaLib.js';
import {
    Promise
} from 'meteor/promise';

// Nisha 02/20/2017 Change in functions for common cohor
// Nisha 02/20/2017 Change in functions for common cohor
// Nisha 03/06/2017 Modification for Geolocation distribution of Drugs
// Nisha 04/04/2017 Modification for Alignment of charts

let pharmaData = [];
let dummyMedication = [];
let pharmaCompetitorAnalysis = [];
let pharmaCompetitorAnalysisYearlyData = [];
let nodata = '';
let nodatagenotype = '';
let nodatacirrhosis = '';
let nodatatreatment = '';
let treatedTreatmentSelect = '';
let treatedCirrhosis = '';
// let AllDrugsDataCompetitorAnalysis = [];
let AllDrugsDataGeoLocationCompetitorAnalysis = [];

Template.CompetitorAnalysis.onCreated(function() {

    //var self = this;
    pharmaLib.showChartLoading();

    //set pharma header
    // pharmaLib.setPharmaHeader();
    // //fetch data from server query
    // executeCompAnalyticsRender(params, self);
    Template.CompetitorAnalysis.fetchAndRenderData();
    renderAccordian();
});

function renderAccordian() {
    $('#accordion').accordion({
        collapsible: true,
        beforeActivate: function(event, ui) {
            // The accordion believes a panel is being opened
            if (ui.newHeader[0]) {
                var currHeader = ui.newHeader;
                var currContent = currHeader.next('.ui-accordion-content');
                // The accordion believes a panel is being closed
            } else {
                var currHeader = ui.oldHeader;
                var currContent = currHeader.next('.ui-accordion-content');
            }
            // Since we've changed the default behavior, this detects the actual status
            var isPanelSelected = currHeader.attr('aria-selected') == 'true';

            // Toggle the panel's header
            currHeader.toggleClass('ui-corner-all', isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top', !isPanelSelected).attr('aria-selected', ((!isPanelSelected).toString()));

            // Toggle the panel's icon
            currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e', isPanelSelected).toggleClass('ui-icon-triangle-1-s', !isPanelSelected);

            // Toggle the panel's content
            currContent.toggleClass('accordion-content-active', !isPanelSelected)
            if (isPanelSelected) { currContent.slideUp(); } else { currContent.slideDown(); }

            return false; // Cancels the default action
        }
    });
}

Template.CompetitorAnalysis.rendered = function() {
    //hide the show patients list icon
    $('.globalshowPatientPharma').hide();
    highLightTab('Pharma');
    //set pharma header
    // pharmaLib.setAdvancedSearchFilters();

    //render header for pharma tab
    //set header of pharma
    // pharmaLib.setPharmaHeader();
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });

}

Template.CompetitorAnalysis.events({
    'click .js-comparativeEngine': function(e) {

    },
    'click #competitoranalysischart': function(e) {
        $("#LocationDetails").hide();
        $("#Charts").show();
    },
    'change #drugDataPhysicianData': function(e) {
        // console.log($("#drugDataPhysicianData").val());
        renderProviderLocation("#PhysicianData", $("#drugDataPhysicianData").val());
    },
    'change #drugDataPatientData': function(e) {
        // console.log($("#drugDataPatientData").val());
        renderPatientLocation("#PatientData", $("#drugDataPatientData").val());
    },
    'change #drugDataGeoLocation': function(e) {
        let smeds = $("#drugDataGeoLocation").val();
        $("#drugDataPhysicianData").val(smeds);
        $("#drugDataPatientData").val(smeds);
        if ($("#drugDataGeoLocation").val() == 'Select')
            smeds = '';
        if (smeds === '')
            renderLocationMapAllDrugs();
        else
            renderLocationMap(AllDrugsDataGeoLocationCompetitorAnalysis, smeds);

        renderProviderLocation("#PhysicianData", $("#drugDataPhysicianData").val());
        renderPatientLocation("#PatientData", $("#drugDataPatientData").val());
    }
});


//draw genotype charts
let DrawChartsGenotype = ({
    medicine,
    data
}) => {
    //$("#genotypegraphcontainers").empty();
    //$("#genotypegraphcontainers2").empty();
    renderStackedChart(genotypegraphcontainers, data.prepareGenotypeChartDatastack);
    // let data =pharmaCompetitorAnalysis;// getDrugFilteredData(medicine);
    // let grpGenoData = _.groupBy(data,'GENOTYPE');

    // for(let key in grpGenoData){
    //     let keyData = grpGenoData[key];
    //     let count = keyData.length;

    //     let chartDom = `<div class="col-md-4 compAnalysisInnerCharts">
    //                     <h3 class="panel-title containertitle">${key} (N=${commaSeperatedNumber(count)})</h3>
    //                     <div id="pharma_VLsuccessrate_${key}">${key}</div>
    //                 </div>`;
    //     //adding div
    //     $("#genotypegraphcontainers").append(chartDom);
    //     renderCompetitorAnalysis(medicine, 'genotype', "#pharma_VLsuccessrate_"+key, key, keyData);
    // }
    // var i = 0,
    //     j = 0;
    // var totalgitems = '';
    // data.genotypeChartData.forEach(function(item) {
    //     i = i + 1;
    //     let chartDom = `<div class="col-md-4 compAnalysisInnerCharts">
    //                     <h3 class="panel-title containertitle">${item.key} (N=${commaSeperatedNumber(item.count)})</h3>
    //                     <div id="pharma_VLsuccessrate_${item.key}">${item.key}</div>
    //                 </div>`;
    //     if (i <= 2)
    //         $("#genotypegraphcontainers").append(chartDom);
    //     else if (i > 2) {
    //         $("#genotypegraphcontainers2").append(chartDom);
    //     }
    //     totalgitems = totalgitems + item.key + ",";
    //     console.log(totalgitems);
    //     console.log(PatientsGenotypeList);
    //     renderCompetitorAnalysis(medicine, 'cirrhosis', "#pharma_VLsuccessrate_" + item.key, item.key, item.graphData);

    // });
    // j = totalgitems.split(",", -1).length - 1;
    // for (i = 0; i < PatientsGenotypeList.length; i++) {
    //     console.log(PatientsGenotypeList[i]);
    //     let chartDom = ``;

    //     if (totalgitems.indexOf(PatientsGenotypeList[i]) == -1) {
    //         chartDom = `<div class="col-md-4 compAnalysisInnerCharts" style="height:360px">
    //                     <h3 class="panel-title containertitle">${PatientsGenotypeList[i]} (N=0)</h3>
    //                     <div class="nodataFound" style="margin-top:50px">No Data Available</div>
    //                     </div>`;
    //     } else {
    //         j = j + 1;
    //     }
    //     if (j <= 2)
    //         $("#genotypegraphcontainers").append(chartDom);
    //     else if (j > 2) {
    //         $("#genotypegraphcontainers2").append(chartDom);
    //     }
    // }




    if (convertFirstLetterCaps(medicine) != 'All') {
        $("#mednamegeno").html(convertFirstLetterCaps('Medications'));
    } else {
        $("#mednamegeno").html(convertFirstLetterCaps(medicine));
    }
}

//draw cirrhosis charts
let DrawChartsCirrhosis = ({
    medicine,
    data
}) => {
    $("#cirrhosisgraphcontainers").empty();
    // let data =pharmaCompetitorAnalysis; // getDrugFilteredData(medicine);
    // let grpCirrData = _.groupBy(data,'CIRRHOSIS');

    // for(let key in grpCirrData){
    //     let keyData = grpCirrData[key];
    //     let count = keyData.length;

    //     let chartDom = `<div class="col-md-6 compAnalysisInnerCharts">
    //                     <h3 class="panel-title containertitle">${key} (N=${commaSeperatedNumber(count)})</h3>
    //                     <div id="pharma_VLsuccessrate_${key}">${key}</div>
    //                 </div>`;
    //     $("#cirrhosisgraphcontainers").append(chartDom);
    //     renderCompetitorAnalysis(medicine, 'cirrhosis', "#pharma_VLsuccessrate_"+key,key, keyData);

    // }




    data.cirrhosisChartData.forEach(function(item) {
        let chartDom = `<div class="col-md-6 compAnalysisInnerCharts">
                        <h3 class="panel-title containertitle">${item.key} (N=${commaSeperatedNumber(item.count)})</h3>
                        <div id="pharma_VLsuccessrate_${item.key}" style="width:240px;height:270px;">${item.key}</div>
                    </div>`;
        $("#cirrhosisgraphcontainers").append(chartDom);
        renderCompetitorAnalysis(medicine, 'cirrhosis', "#pharma_VLsuccessrate_" + item.key, item.key, item.graphData);
    });
};


let DrawChartsTreatment = ({
    medicine,
    data
}) => {
    $("#treatmentgraphcontainers").empty();

    data.treatmentChartData.forEach(function(item) {
        let chartDom = `<div class="col-md-6 compAnalysisInnerCharts">
                            <h3 class="panel-title containertitle"> ${item.key} (N=${commaSeperatedNumber(item.count)}) </h3>
                            <div id="pharma_VLsuccessrate_${item.key}" style="width:240px;height:270px;">${item.key}</div>
                            </div>`;
        $("#treatmentgraphcontainers").append(chartDom);
        //render the charts
        renderCompetitorAnalysis(medicine, 'treatment', "#pharma_VLsuccessrate_" + item.key, item.key, item.graphData);
    });

}

// function formatNote(notemsg) {
//     notemsg = notemsg.substring(0, notemsg.length - 1);
//     var replacement = ' and ';
//     notemsg = notemsg.replace(/,([^,]*)$/, replacement + '$1');
//     return notemsg;
// }


let DrawCharts = ({
    competitorAnalysisYearlyData,
    competitorAnalysisData
}) => {

    $("#pharmanotes").empty();

    // GenerateYearlyPerformanceChart({
    //     data: competitorAnalysisYearlyData
    // });
    let medicine = '';
    if (Pinscriptive.Filters) {
        medicine = Pinscriptive.Filters.medication ? Pinscriptive.Filters.medication.replace(/'/g, '').toString() : 'ALL';
    } else {
        medicine = 'ALL';
    }
    // renderCompetitorAnalysisForAll(medicine, '', "#pharma_medicationcount", "",competitorAnalysisData);
    DrawChartsForAllRecords({
        medicine: medicine,
        data: competitorAnalysisData
    });

    //renderCompetitorAnalysis(medicine, "" "#pharma_medicationcount", "",data:competitorAnalysisData);
    DrawChartsGenotype({
        medicine: medicine,
        data: competitorAnalysisData
    });
    DrawChartsCirrhosis({
        medicine: medicine,
        data: competitorAnalysisData
    });
    DrawChartsTreatment({
        medicine: medicine,
        data: competitorAnalysisData
    });
    //set header data
    pharmaLib.setPharmaHeaderTabData();
}
let DrawChartsForAllRecords = ({
    medicine,
    data
}) => {
    //renderCompetitorAnalysisForAll(medicine, '', "#pharma_medicationcount", "",data);
    renderCompetitorAnalysis(medicine, "", "#pharma_medicationcount", "", data);
}
Template.CompetitorAnalysis.helpers({
    // 'isLoading': function() {
    //     //   return Template.instance().loading.get();
    // },
    // 'getGenotypeList': function() {
    //     //list genotype
    //     return PatientsGenotypeList;
    // },
    // 'getMedication': function() {
    //     let dummyMedication = [];
    //     let drugArray = ["PegIntron", "Pegasys", "Victrelis"]
    //     for (let i = 0; i < AllDrugs.length; i++) {
    //         let drugName = AllDrugs[i].name;
    //         if (drugArray.indexOf(drugName) == -1)
    //             dummyMedication.push(AllDrugs[i].name);
    //     }
    //     return dummyMedication;
    // }

});

// Nisha 02/13/2017 Modified the chart as the 1st and last bars were not showing data
function GenerateYearlyPerformanceChart({
    data
}) {
    console.log(data);
    //console.log(data.groupLabel);
    let pharmaDataOtherMedicines = [];
    //Calculate uniq drug count for special case for Competitor Analytics Yearly chart
    let uniqueDrugCount = _.uniq(data.groupLabel).length;
    console.log(uniqueDrugCount);
    let container = "#pharma_medicationcountYearly";
    d3.select(container).selectAll("*").remove();

    var chart = c3.generate({
        bindto: container,
        padding: {
            top: 10,
            bottom: 15
        },
        data: {
            type: 'bar',
            json: data.yearlyCompetiterData,
            keys: {
                x: 'year',
                value: data.groupLabel
            },
            labels: {
                format: (v, id, i, j) => {
                    // Display label if only one drug is selected other wise not
                    return uniqueDrugCount == 1 ? (v + '%') : '';
                },
            },
        },
        bar: {
            width: {
                ratio: 0.9
            }
        },
        size: {
            height: 340,
            width: 800
        },
        legend: {
            show: true,
            position: 'right',
        },
        color: {
            pattern: ['#3a84aa', '#639364', '#c3635f', '#ffc91e', '#c0872b', '#ed7bab', '#999999', '#008000', '#ED7D31']
        },
        tooltip: {
            grouped: false,
            // Formating Tooltip to Display Saving and Expenses Bith at the same Time.
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                let dataObj = d[0],
                    id = dataObj.id,
                    ratio = (dataObj.ratio * 100).toFixed(2),
                    filterData = data.yearlyCompetiterData;
                // console.log(dataObj);
                // console.log(filterData);
                // console.log('filterData[dataObj.index]' + filterData[dataObj.index].year);
                let pattotal = _.pluck(filterData, id + '-' + filterData[dataObj.index].year);
                let total = 0;
                //  console.log(pattotal);

                for (i = 0; i < pattotal.length; i++) {
                    if (pattotal[i] != undefined)
                        total = pattotal[i];
                }

                let $$ = this,
                    config = $$.config,
                    bgcolor
                bgcolor = color(dataObj.id);

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + id + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div style="text-align:left;"><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>  Patients:  ' + commaSeperatedNumber(total) + '<br><div style="height:10px;width:10px;display:inline-block;background-color:' + bgcolor + '"></div>  Market Share: ' + dataObj.value + '%</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        axis: {
            y: {
                max: 100,
                //min: 0,
                // padding: { top: 0, bottom: -10 },
                label: {
                    text: 'Percentage of Patients',
                    position: 'middle'
                }
            },

            x: {
                type: 'category', // Nisha
                label: {
                    text: 'Year',
                    position: 'center'
                }
            }
        },
        grid: {
            y: {
                lines: [{
                        value: 0,
                        text: ''
                    }

                ]
            }
        }
    });
    // Nisha 03/03/2017 modified for Geo Location Distribution
    d3.selectAll('.tick')
        .on('click', function(value, index) {
            //   console.log('Tick index: ' + index + ' value: ' + value );
            // console.log(data.yearlyCompetiterData[index].year);
            GetMapData(data.yearlyCompetiterData[index].year)
        });
}

// Nisha 03/03/2017 modified for Geo Location Distribution
function GetMapData(datayear) {
    let params = {};
    if (Pinscriptive.Filters) {
        params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
    }
    params.Year = datayear;
    let finalUnCompressedResult1 = null;
    $("#selectedYear").text(datayear);
    Meteor.call('getPharmaCompetitorAnalysisYearlyMapData', params, function(error, result1) {
        if (error) {
            console.log(error);
        } else {
            $("#LocationDetails").show();
            $("#Charts").hide();
            $('#PhysicianData').empty();
            $('#PatientData').empty();
            let stringifyResult1 = LZString.decompress(result1);
            finalUnCompressedResult1 = JSON.parse(stringifyResult1);
            var drugsData = _.countBy(finalUnCompressedResult1, 'MEDS_NM');
            renderDrugData('drugDataGeoLocation', drugsData);
            renderDrugData('drugDataPhysicianData', drugsData);
            renderDrugData('drugDataPatientData', drugsData);
            AllDrugsDataGeoLocationCompetitorAnalysis = finalUnCompressedResult1;
            // renderLocationMap(finalUnCompressedResult1, '');
            renderLocationMapAllDrugs();
        }
    });
}
// Nisha 03/03/2017 modified for Geo Location Distribution
// Nisha 03/06/2017 modified for Geo Location Distribution and images
function renderLocationMap(Data, selectedmedication) {
    $("#geoLocationMaps").empty();

    if (selectedmedication != '') {
        Data = Data.filter(function(a) {
            return (a.MEDS_NM == selectedmedication);
        });
    }
    $(".machineLearn-totalPatients").html(Data.length);
    var zipCodes = _.groupBy(Data, "PATIENT_ST_CD");
    // console.log(Data);
    // console.log(zipCodes);
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(41.013843, -105.115165);
    let chartZoom = 4;

    let myOptions = {
        zoom: chartZoom,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    let map = new google.maps.Map(document.getElementById('geoLocationMaps'), myOptions);
    /*
        //   for (var key in zipCodes) {
        for (i = 0; i < Data.length; i++) {
            //    console.log(key);
            //    console.log(zipCodes[key].length);
            // if (key != "Undetermined") {
            if (Data[i]["PROVIDER_ST_CD"] != "Undetermined") {
                let icona = '';

                icona = '/' + Data[i]["MEDS_NM"].charAt(0) + '.png';

                $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + Data[i]["PROVIDER_ST_CD"] + '&sensor=false&components=country:US', null, (response, status) => {
                    //console.log(response);
                    //null check for location info
                    if (response.status == google.maps.GeocoderStatus.OK) {
                        let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;

                        map.setCenter(location);
                        let marker = new google.maps.Marker({
                            map: map,
                            position: location,
                            icon: icona
                        }); 
                    }
                });
            }
        }
        // renderLocationTable(Data);
    */
    let icona = '';
    if (selectedmedication != '') {
        icona = '/' + selectedmedication.charAt(0) + '.png';
    }

    for (var key in zipCodes) {
        if (key != "Undetermined") {
            let content = '';

            content = "<b>Patient Distribution Per Drug:</b> <br /><div style='text-align:left'>";
            let PROVIDER_STCountData = _.countBy(zipCodes[key], 'MEDS_NM');
            for (let PROVIDER_STkey in PROVIDER_STCountData) {
                content += PROVIDER_STkey + " - " + PROVIDER_STCountData[PROVIDER_STkey] + "<br />";
            }
            content += "</div>"
                // console.log(content);
                // console.log(PROVIDER_STCountData);

            $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + key + '&sensor=false&components=country:US', null, (response, status) => {
                //console.log(response);
                //null check for location info
                if (response.status == google.maps.GeocoderStatus.OK) {
                    let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;

                    map.setCenter(location);
                    let marker = new google.maps.Marker({
                        map: map,
                        position: location,
                        icon: icona
                    });

                    let infowindow = new google.maps.InfoWindow();

                    google.maps.event.addListener(marker, 'mouseover', (function(marker, content, infowindow) {
                        return function() {
                            infowindow.setContent(content);
                            infowindow.open(map, marker);
                        };
                    })(marker, content, infowindow));

                    // assuming you also want to hide the infowindow when user mouses-out
                    marker.addListener('mouseout', function() {
                        infowindow.close();
                    });

                    map.setCenter(latlng);

                }
            });
        }
    }

}

// Nisha 03/06/2017 modified for Geo Location Distribution and images
function renderLocationMapAllDrugs() {
    $("#geoLocationMaps").empty();
    let treatedPatients = AllDrugsDataGeoLocationCompetitorAnalysis;
    $(".machineLearn-totalPatients").html(treatedPatients.length);
    // console.log('renderLocationMapAllDrugs');
    var zipCodes = _.groupBy(treatedPatients, "PATIENT_ST_CD");
    // console.log(zipCodes);

    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(41.013843, -105.115165);
    let chartZoom = 4;
    let myOptions = {
        zoom: chartZoom,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    let map = new google.maps.Map(document.getElementById('geoLocationMaps'), myOptions);

    for (var key in zipCodes) {
        if (key != "Undetermined") {
            let content = '';

            content = "<b>Patient Distribution Per Drug:</b> <br /><div style='text-align:left'>";
            let PROVIDER_STCountData = _.countBy(zipCodes[key], 'MEDS_NM');
            for (let PROVIDER_STkey in PROVIDER_STCountData) {
                content += PROVIDER_STkey + " - " + PROVIDER_STCountData[PROVIDER_STkey] + "<br />";
            }
            content += "</div>"
                // console.log(content);
                // console.log(PROVIDER_STCountData);

            $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + key + '&sensor=false&components=country:US', null, (response, status) => {
                //console.log(response);
                //null check for location info
                if (response.status == google.maps.GeocoderStatus.OK) {
                    let location = response.results.length > 0 && response.results[0].geometry && response.results[0].geometry.location ? response.results[0].geometry.location : null;

                    map.setCenter(location);
                    let marker = new google.maps.Marker({
                        map: map,
                        position: location
                            // icon: "http://maps.google.com/mapfiles/ms/icons" + icona
                    });

                    let infowindow = new google.maps.InfoWindow();

                    google.maps.event.addListener(marker, 'mouseover', (function(marker, content, infowindow) {
                        return function() {
                            infowindow.setContent(content);
                            infowindow.open(map, marker);
                        };
                    })(marker, content, infowindow));

                    // assuming you also want to hide the infowindow when user mouses-out
                    marker.addListener('mouseout', function() {
                        infowindow.close();
                    });

                    map.setCenter(latlng);

                }
            });
        }
    }

}


// Nisha 03/03/2017 modified for Geo Location Distribution
// function renderLocationTable(locationData) {
//     AllDrugsDataCompetitorAnalysis = locationData;
//     $("#geoLocationMapsTable").empty();
//     var chartContentHtml = `<div class="panel boxshadow_borderline" style="height:650px;">
//                                  <div class="col-lg-6">
//                                         <div style ="float: left;width: 100%;text-align: left;padding-bottom: 3px;" >
//                                          Physician Location Distribution <select id="drugDataPhysicianData">
//                                         </select>  
//                                         </div></div>
//                                  <div class="col-lg-6">
//                                     <div style ="float: left;width: 100%;text-align: left;padding-bottom: 3px;" >
//                                        Patient Location Distribution <select id="drugDataPatientData">
//                                         </select>  
//                                         </div>
//                                         </div>
//                                  <div class="col-lg-6" style="height:600px;overflow:auto">

// 							    	  <div id="PhysicianData">  </div>
// 							       </div>
// 							      <div class="col-lg-6" style="height:600px;overflow:auto">

// 								     <div id="PatientData"> </div>
// 						        	</div></div>`;

//     $("#geoLocationMapsTable").html(chartContentHtml);
//     // console.log(_.uniq(_.pluck(locationData, 'MEDS_NM')));
//     // var drugsData = _.uniq(_.pluck(locationData, 'MEDS_NM'));
//     var drugsData = _.countBy(AllDrugsDataGeoLocationCompetitorAnalysis, 'MEDS_NM');
//     // console.log(drugsData);
//     renderDrugData('drugDataPhysicianData', drugsData);
//     renderDrugData('drugDataPatientData', drugsData);
//     //  renderProviderLocation("#PhysicianData",locationData);
//     //  renderPatientLocation("#PatientData",locationData);
// }

// Nisha 02/17/2017 populate the dropdown
function renderDrugData(container, utilData) {
    // console.log('utilData');
    select = document.getElementById(container);
    $('#' + container).children().remove();
    // console.log(utilData);

    option = document.createElement('option');
    option.value = option.text = "Select";
    select.add(option);
    for (let key in utilData) {
        option = document.createElement('option');
        option.value = option.text = key;
        select.add(option);
    }
}

// Nisha 03/03/2017 modified for Geo Location Distribution
//function to render Provider Location Table
function renderProviderLocation(container, selectedmedication) {
    let medsData = AllDrugsDataGeoLocationCompetitorAnalysis;
    var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
    medsData = medsData.filter(function(a) {
        return (a.MEDS_NM == selectedmedication);
    });
    let meds = _.groupBy(medsData, 'MEDS_NM');
    $(container).empty();
    for (var keys in meds) {
        let getPatientLocations = _.countBy(meds[keys], 'PROVIDER_ST_CD');
        var sorted = _.chain(getPatientLocations).
        map(function(cnt, brand) {
                return {
                    brand: brand,
                    count: cnt,
                    Statename: "Undertermined"
                }
            }).sortBy('count').reverse()
            .value();
        // console.log(treatedPatients);
        // console.log(sorted);
        // console.log(getPatientLocations);
        let patientContentHtml = ``;

        patientContentHtml += `<div style="color:#ef4823"><b>${keys}</b></div><div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRowP" > State (Provider) </div>
                                    <div class="showInRowP" >Patient Count</div>
                           </div>`;

        patientContentHtml += `<div class="mlPatientsDetailWrapper">`;

        for (i = 0; i < sorted.length; i++) {

            for (var j = 0; j < store.length; j++) {
                if (store[j]['Abbreviation'] == sorted[i].brand) {
                    sorted[i].Statename = store[j]['State'];
                }
                // if (sorted[i].brand == null)
                //     sorted[i].Statename = "Undertermined";
            }


            if (sorted[i].Statename != "Undertermined") {
                patientContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP"  style="padding-left:40px;text-align:left">${sorted[i].Statename}</div>
                                    <div class="showInRowP">${sorted[i].count}</div>
                               </div>`;
            }

        }

        var sorted = sorted.filter(function(a) {
            return (a.Statename == "Undertermined");
        });


        for (i = 0; i < sorted.length; i++) {
            patientContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP" style="padding-left:40px;text-align:left">${sorted[i].Statename}</div>
                                    <div class="showInRowP">${sorted[i].count}</div>
                               </div>`;


        }

        patientContentHtml += `</div>`;
        // console.log(patientContentHtml);
        $(container).append(patientContentHtml);
    }
}
// Nisha 03/03/2017 modified for Geo Location Distribution
//function to render Patient Location Table
function renderPatientLocation(container, selectedmedication) {
    let medsData = AllDrugsDataGeoLocationCompetitorAnalysis;
    var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();
    medsData = medsData.filter(function(a) {
        return (a.MEDS_NM == selectedmedication);
    });
    let meds = _.groupBy(medsData, 'MEDS_NM');
    $(container).empty();
    for (var keys in meds) {
        let getPatientLocations = _.countBy(meds[keys], 'PATIENT_ST_CD');
        var sorted = _.chain(getPatientLocations).
        map(function(cnt, brand) {
                return {
                    brand: brand,
                    count: cnt,
                    Statename: "Undertermined"
                }
            }).sortBy('count').reverse()
            .value();
        // console.log(treatedPatients);
        // console.log(sorted);
        // console.log(getPatientLocations);
        let patientContentHtml = ``;

        patientContentHtml += `<div style="color:#ef4823"><b>${keys}</b></div><div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRowP" > State (Patient) </div>
                                    <div class="showInRowP" >Patient Count</div>
                           </div>`;

        patientContentHtml += `<div class="mlPatientsDetailWrapper">`; //ecf-patientContainer 

        for (i = 0; i < sorted.length; i++) {
            for (var j = 0; j < store.length; j++) {
                if (store[j]['Abbreviation'] == sorted[i].brand) {
                    sorted[i].Statename = store[j]['State'];
                }
            }


            if (sorted[i].Statename != "Undertermined") {
                patientContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP"  style="padding-left:40px;text-align:left">${sorted[i].Statename}</div>
                                    <div class="showInRowP">${sorted[i].count}</div>
                               </div>`;
            }

        }

        var sorted = sorted.filter(function(a) {
            return (a.Statename == "Undertermined");
        });

        for (i = 0; i < sorted.length; i++) {
            patientContentHtml += `<div class="ecf-patientRowP js-ecf-patientRow">
                                    <div class="showInRowP" style="padding-left:40px;text-align:left">${sorted[i].Statename}</div>
                                    <div class="showInRowP">${sorted[i].count}</div>
                               </div>`;


        }

        patientContentHtml += `</div>`;
        // console.log(patientContentHtml);
        $(container).append(patientContentHtml);
    }
}


function renderCompetitorAnalysis(medicine, reporttype, container, chartdrawval, chartBaseData) {

    let pharmaDataOtherMedicines = [];

    let barColor1 = '#30a2da';
    let barColor2 = '#fc4f30';
    if (reporttype == "genotype") {
        //  pharmaDataOtherMedicines = chartBaseData;
        barColor1 = '#8f42f4';
        barColor2 = '#f95f1d'; //getDrugFilteredData(medicine, chartdrawval, '', '');
    } else if (reporttype == "cirrhosis") {
        // pharmaDataOtherMedicines = chartBaseData;
        barColor1 = '#2e7e97';
        barColor2 = '#e95a52'; //getDrugFilteredData(medicine, '', chartdrawval, '');
    } else if (reporttype == "treatment") {
        //   pharmaDataOtherMedicines = chartBaseData;
        barColor1 = '#4aaaa5';
        barColor2 = '#db3340'; //getDrugFilteredData(medicine, '', '', chartdrawval);
    } else {
        // pharmaDataOtherMedicines =pharmaCompetitorAnalysis ;//getDrugFilteredData(medicine, '', '', '');
        //console.log(pharmaDataOtherMedicines);
    }

    //let groupedData = reporttype==''?chartBaseData:_.groupBy(pharmaDataOtherMedicines, 'SVR_Result');
    //// As Chart data is prepared server side we are setting value for eacch chart
    let groupedData = chartBaseData;

    //// For allDistributionData chart we are passing full object from server side as we also need TotalN
    if (chartdrawval == "") {
        groupedData = chartBaseData.allDistributionData
    }
    // let height = 340;
    // let width = 250;
    let height = 340;
    let width = 400;
    if (chartdrawval != "") {
        height = 260;
        width = 270;
    }

    let keys = ['Undetectable SVR', 'Detectable SVR'],
        total = 0,
        chartData = {},
        filteredData = [];

    let XnameArray = [];
    if (chartdrawval == "") {
        //// For allDistributionData chart we are passing full object from server side as we also need TotalN
        total = chartBaseData.TotalN;
        if (convertFirstLetterCaps(medicine) != 'All') {
            $("#medname").html(convertFirstLetterCaps('Medications') + " Cure Rate ( N = " + commaSeperatedNumber(total) + " )");
        } else {
            $("#medname").html(convertFirstLetterCaps(medicine) + " Cure Rate ( N = " + commaSeperatedNumber(total) + " )");
        }
        if (total == 0) {
            $("#MedicineSuccessRate").hide();
            var fullnotes = '';
            fullnotes = fullnotes + '** There are no Treatment Outcomes for ' + medicine + '<br/>';
            $("#pharmanotes").append(fullnotes);
        } else
            $("#MedicineSuccessRate").show();
    }

    for (let keys in groupedData) {
        let countvalues = {};
        XnameArray[keys] = groupedData[keys];
        //  XnameArray.push(countvalues);
    }
    // console.log("****renderCompetitorAnalysis*****");
    // console.log(XnameArray);
    if ($(container).length > 0) {
        d3.select(container).selectAll("*").remove();

        var chart = c3.generate({
            bindto: container,
            data: {
                type: 'pie',
                json: [XnameArray],
                keys: {
                    value: keys
                },
            },
            padding: {
                bottom: 15
            },
            size: {
                height: height,
                width: width
            },
            legend: {
                show: true
                    // ,position: 'inset',
                    // inset: {
                    //     anchor: 'top-left',
                    //     x: 200
                    // }
            },
            color: {
                pattern: [barColor1, barColor2]
            },
            tooltip: {
                grouped: false,
                contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                    var colors = [barColor1, barColor2];
                    let dataObj = d[0];

                    let html = '';
                    html = '<div class="customC3ToolTip">' +
                        '<div class="customC3ToolTip-Header">' +
                        '<div>' + dataObj.id + '</div>' +
                        '</div>' +
                        '<div class="customC3ToolTip-Body">' +
                        '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patient Count: ' + commaSeperatedNumber(dataObj.value) + '</div>' +
                        '</div>' +
                        '</div>';
                    return html;
                }
            }
        });
    }
}

function getDrugFilteredData(medicine, genotypeval, cirrhosisval, treatmentval) {


    let filteredpharmaData = '';
    //medicine = Session.get('pharmamedicine');
    if (medicine == "")
        filteredpharmaData = pharmaCompetitorAnalysisYearlyData;
    else
        filteredpharmaData = pharmaCompetitorAnalysis;
    return filteredpharmaData;
}

Template.CompetitorAnalysis.fetchAndRenderData = (dbparams, templateObj) => {
    //get data for Competitor Analysis tabs
    let params = {};
    if (Pinscriptive.Filters) {
        params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
    }
    pharmaLib.showChartLoading();

    // console.log("***** Params getPharmaCompetitorAnalysisData*****");
    // console.log(params);
    //get competitor analysis data
    Meteor.call('getPharmaCompetitorAnalysisData', params, function(errors, results) {
        if (errors) {
            console.log(errors);
            pharmaLib.hideChartLoading();
        } else {
            pharmaLib.setAdvancedSearchFilters();
            pharmaLib.setPharmaHeader();
            let stringifyResult = LZString.decompress(results);
            let finalUnCompressedResult = JSON.parse(stringifyResult);
            pharmaLib.hideChartLoading();
            //Set the total N to Cohort               

            // OLD CODE
            // $('.searchPatientCountHeaderPharma').html(finalUnCompressedResult.TotalN);
            //Added :14-FEB-2017 Arvind,sigle method to set patient count on cohort menu
            setCohortPatientCount({ patientCount: finalUnCompressedResult.TotalN });
            //console.log("***** PRINT IN CONSOLE FOR COMPARISION getPharmaCompetitorAnalysisData*****");
            // console.log(results);

            // IF Data not fetched then call server method
            //query to get data based on yearly basis without medication filter
            localStorage.AllCompitetorChartData = stringifyResult;
            // localStorage.yearlyCompetiterData = stringifyResult1;
            DrawCharts({
                competitorAnalysisYearlyData: null,
                competitorAnalysisData: finalUnCompressedResult
            });

            // Meteor.call('getPharmaCompetitorAnalysisYearlyData', params, function(error, result1) {
            //     if (error) {
            //         pharmaLib.hideChartLoading();
            //     } else {
            //         pharmaLib.hideChartLoading();
            //         //console.log("***** PRINT IN CONSOLE FOR COMPARISION getPharmaCompetitorAnalysisYearlyData*****");
            //         //   console.log(result1);
            //         let stringifyResult1 = LZString.decompress(result1);
            //         let finalUnCompressedResult1 = JSON.parse(stringifyResult1);
            //         // console.log("Compressed result1:" + result1.length)
            //         // console.log("stringifyResult1:" + stringifyResult1.length);
            //         // console.log("result:" + results.length)
            //         // console.log("Compressed stringifyResult:" + stringifyResult.length);
            //         // Pass result of both query to single method
            //         localStorage.AllCompitetorChartData = stringifyResult;
            //         localStorage.yearlyCompetiterData = stringifyResult1;
            //         DrawCharts({
            //             competitorAnalysisYearlyData: finalUnCompressedResult1,
            //             competitorAnalysisData: finalUnCompressedResult
            //         });
            //     }
            // });
            // yearly data method ends
        }
    });
    //get CompetitorAnalysis data
}


// Render for comparativeengine
let renderComaparativeOptionsView = () => {
    var comparativeEngine = new ComparativeEngine({
        tabName: "CompetitorAnalysisTab-Pharma"
    });

    comparativeEngine.renderCompareOptiosView();
}

let renderStackedChart = (container, data) => {
    console.log(data);
    if (data.total == 0) {
        fnNoDataFoundChart('#' + container);
        return;
    }
    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: data.key,
            title: {
                text: 'Genotype'
            },
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count'
            },
            labels: {
                formatter: function() {
                    return commaSeperatedNumber(this.value);
                }
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                },
                formatter: function() {
                    return commaSeperatedNumber(this.total);
                }
            }
        },
        legend: {
            enabled: true,
            align: 'right',
            x: -10,
            verticalAlign: 'top',
            y: -10,
            // layout: 'vertical',
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            headerFormat: 'Genotype:{point.x}<br/>',
            pointFormat: '{series.name}: {point.per:,0.2f}%<br/>Patient Count: {point.y:,0.0f}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: false,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                }
            }
        },
        series: data.data
    });
}