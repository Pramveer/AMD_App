import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './MarketOverview.html';
import * as pharmaLib from '../pharmaLib.js';

// Nisha Created on 4/5/2017 the new tab for Market Overview
// Nisha Modified on 4/6/2017 for compression and other UI changes
var CureData = null;
Template.MarketOverview.onCreated(function() {
    Template.MarketOverview.fetchAndRenderData();
});

Template.MarketOverview.rendered = function() {
    highLightTab('Pharma');
    pharmaLib.setPharmaHeader();
}


Template.MarketOverview.events({
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
    },
    //Praveen 03/29/2017 Added condition for radio buttons selection 
    'change #treamentAvgCostSelection .radioduration': function(e) {
        //hide loading wheel 
        pharmaLib.hideChartLoading();
        let data = CureData;
        console.log(e.target.value);
        let container = 'divRateFailure';
        if (e.target.value == "SVRNotAchieved") {
            renderHighBarChart(container, data.svr, 'Race', 'SVR12', 0);
        } else if (e.target.value == "Discontinued") {
            renderHighBarChart(container, data.discontinued, 'Race', 'IS_COMPLETED', 'No');
        } else if (e.target.value == "Followup") {
            renderHighBarChart(container, data.follow, 'Race', 'SVR12', null);
        } else if (e.target.value == "Notprescribed") {
            // renderHighBarChart(container, data.noPrescription, 'Race', 'Viral Load', null);
            plotPrepareChartData();
        } else {
            renderHighBarChart(container, data.svr, 'Race', 'SVR12', 0);
        }
    },
    'change #showSelectedPopulationPharma': () => {
        if ($("#showSelectedPopulationPharma").prop('checked')) {
            Router.current().render(Template.Summary);
        }
    }
});


let plotPrepareChartData = () => {
    let params = {};
    if (Pinscriptive.Filters) {
        params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
    }
    console.log('1');
    Meteor.call('dataForPharmaCurefailure', params, function(error, result) {
        if (error) {
            console.log('2');
        } else {
            let decompressed_object = LZString.decompress(result);
            let resulting_object = JSON.parse(decompressed_object);
            console.log('3');
            console.log(resulting_object);
            // pharmaLib.hideChartLoading();
            renderHighBarChart('divRateFailure', resulting_object, 'Race', 'Viral Load', null);
        }
    });
}


// Nisha 04/04/2017 modified for Geo Location Distribution
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
// Nisha 04/04/2017 modified for Geo Location Distribution
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

// Nisha 04/04/2017 Modified the chart as the 1st and last bars were not showing data
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
            onclick: function(d, i) {
                // console.log("onclick", d);
                // console.log(d.name);
                // console.log(data.yearlyCompetiterData[d.index].year);
                GetMapDataPerMedicine(data.yearlyCompetiterData[d.index].year, d.name);

                //     $("#drugDataPhysicianData").val(smeds);
                //     $("#drugDataPatientData").val(smeds);
                //     $("#drugDataGeoLocation").val(smeds); 

                //    renderLocationMap(AllDrugsDataGeoLocationCompetitorAnalysis, smeds);

                //    renderProviderLocation("#PhysicianData", $("#drugDataPhysicianData").val());
                //    renderPatientLocation("#PatientData", $("#drugDataPatientData").val());
                //    $("#LocationDetails").show();
                //    $("#Charts").hide();
            },
            json: data.yearlyCompetiterData,
            keys: {
                x: 'year',
                value: data.groupLabel
            },
            labels: {
                format: (v, id, i, j) => {
                    if (v !== null) {
                        if (parseInt(v) != 0)
                            return (parseInt(v) + '%');
                    }
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
    // Nisha 04/04/2017 modified for Geo Location Distribution
    d3.selectAll('.tick')
        .on('click', function(value, index) {
            //   console.log('Tick index: ' + index + ' value: ' + value );
            // console.log(data.yearlyCompetiterData[index].year);
            GetMapData(data.yearlyCompetiterData[index].year);

        });
    d3.select('#pharma_medicationcountYearly svg')
        .append("text")
        .attr("x", 400)
        .attr("y", 15)
        .style("font-size", "14px")
        .attr("text-anchor", "middle")
        .text("Click on bars to view Geo Location Distribution.");
}


// Nisha 04/04/2017 modified for Geo Location Distribution
function GetMapDataPerMedicine(datayear, smeds) {
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
            console.log(drugsData);
            var drugsData = _.countBy(finalUnCompressedResult1, 'MEDS_NM');
            renderDrugData('drugDataGeoLocation', drugsData);
            renderDrugData('drugDataPhysicianData', drugsData);
            renderDrugData('drugDataPatientData', drugsData);
            AllDrugsDataGeoLocationCompetitorAnalysis = finalUnCompressedResult1;
            renderLocationMap(AllDrugsDataGeoLocationCompetitorAnalysis, smeds);
            $("#drugDataPhysicianData").val(smeds);
            $("#drugDataPatientData").val(smeds);
            $("#drugDataGeoLocation").val(smeds);
            renderProviderLocation("#PhysicianData", $("#drugDataPhysicianData").val());
            renderPatientLocation("#PatientData", $("#drugDataPatientData").val());
        }
    });
}


// Nisha 04/04/2017 modified for Geo Location Distribution
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
            console.log(drugsData);
            var drugsData = _.countBy(finalUnCompressedResult1, 'MEDS_NM');
            renderDrugData('drugDataGeoLocation', drugsData);
            renderDrugData('drugDataPhysicianData', drugsData);
            renderDrugData('drugDataPatientData', drugsData);
            AllDrugsDataGeoLocationCompetitorAnalysis = finalUnCompressedResult1;
            renderLocationMap(finalUnCompressedResult1, '');
            // renderLocationMapAllDrugs();
        }
    });
}

// Nisha  04/04/2017  populate the dropdown
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

// Nisha 04/04/2017 modified for Geo Location Distribution
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

// Nisha 04/04/2017 modified for Geo Location Distribution and images
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

let renderPatientPrescrioptionCharts = (datapatientPresc) => {
    let data = datapatientPresc.patientPrescription;
    CureData = datapatientPresc.patientPrescription.care;
    // console.log('renderPatientPrescrioptionCharts');
    // console.log(datapatientPresc);
    renderTreatmentPieCharts('tPatientsBytreatment', datapatientPresc.treatment, 'treatment', 'Treatment');
    renderHighBarChart('tPatientbygenotype', data.genotype, 'Genotype', null);
    renderHighBarChart('tPatientsByPayer', data.insurance, 'Insurance', null);
    renderPrescriptionPieCharts('tPatientsbyFibrosis', data.fibrosis, 'Fibrosis');
    renderhighmapcharts('tPrescrobedTherapyMap', data.mapchart, 'Map');
    renderPayerMixobservedChart('newChartPayerMix', data.observedPayerMix, 'Observed Payer Mix');
    renderMarketShareOverMonthsChart('markerShareOverMonthsChart', datapatientPresc, 'ALL');
    renderHighBarChart('divRateFailure', CureData.svr, 'Race', 'SVR12', 0);
}


let renderTreatmentPieCharts = (container, data, key) => {

    let chartData = [];
    let total = 0;
    for (let key in data) {
        let json = {};
        json['name'] = key;
        json['y'] = data[key].count;
        total += json['y'];
        chartData.push(json);
    }
    $('#threapy-treatment-N').html(commaSeperatedNumber(total));
    if (total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: "" //'Treatment Distribution'
        },
        tooltip: {
            pointFormat: ''
        },
        credits: {
            enabled: false
        },
        colors: ["#f1cb6a", "#69bae7", "#e95a52", '#2e7e97', "#abd6ba"],
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            x: 10,
            y: 100,
            labelFormatter: function() {
                return this.name;
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    distance: -30,
                    rotate: 0,
                    format: '{point.percentage:.2f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
                showInLegend: true
            }
        },

        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Treatment</span>: <b>{point.name}</b><br/>
                          Patient Count:{point.y:,0.0f}<br/>`
        },
        series: [{
            name: 'Treatment',
            colorByPoint: true,
            data: chartData
        }]
    });
}


let renderMarketShareOverMonthsChart = (container, datamarketshare, filterParam) => {
    let data = datamarketshare.MarketShareOverMonthsChartData;
    let marketShareOverMonthsChartData = [];
    let colors = ['#17becf', '#2ca02c', '#d62728', '#ff7f0e', '#DDDF00', '#9467bd', '#1f77b4', '#e95a52', '#8c564b',
        '#f1cb6a', '#e377c2', '#17becf', '#000022'
    ]
    if (filterParam == 'ALL') {
        marketShareOverMonthsChartData = _.filter(data.marketShareOverMonthsChartData, (rec) => {
            return (rec.name.split('+').length == 1) || rec.name == 'Total Prescription';
        });
    } else {
        marketShareOverMonthsChartData = _.filter(data.marketShareOverMonthsChartData, (rec) => {
            return rec.name.includes(filterParam) || rec.name == 'Total Prescription';
        });
    }
    let i = 0,
        medicationPatientCount = 0,
        CombinedMedicationPatientCount = 0,
        totalPatientCount = 0;
    marketShareOverMonthsChartData = _.map(marketShareOverMonthsChartData, (rec) => {
        if (rec.name == filterParam) {
            medicationPatientCount += rec.totalPatientCount;
        } else if (rec.name.split('+').length != 1) {
            CombinedMedicationPatientCount += rec.totalPatientCount;
        } else {
            totalPatientCount += rec.totalPatientCount;
        }
        rec.color = colors[i];
        i = i == 12 ? 0 : i + 1;
        return rec;
    });
    if (filterParam != 'ALL') {
        let medicationPatientPercentage = parseFloat((medicationPatientCount / totalPatientCount) * 100).toFixed(2);
        let CombinedMedicationPatientPercentage = parseFloat((CombinedMedicationPatientCount / totalPatientCount) * 100).toFixed(2);
        $('#marketShareMedication').show();
        $('#marketShareMedication').html(`${filterParam} (N): ${commaSeperatedNumber(medicationPatientCount)} (${medicationPatientPercentage}%) and ${filterParam} VARIATION (N): ${commaSeperatedNumber(CombinedMedicationPatientCount)} (${CombinedMedicationPatientPercentage}%)`);
    } else {
        $('#marketShareMedication').hide();
    }
    //set patient count  
    $('#market-share-N').html(commaSeperatedNumber(data.totalPatient));
    if (data.totalPatient == 0) {
        fnNoDataFound(container);
        return;
    }
    $('#markerShareOverMonthsChart').html('');
    Highcharts.chart(container, {
        chart: {
            zoomType: 'x',
            width: 1230
        },
        title: {
            text: null
        },
        subtitle: {
            text: null
        },
        plotOptions: {
            column: {
                // stacking: 'normal',
                // dataLabels:{
                //         enabled:true,
                //         formatter:function(){
                //             return Math.round(this.y)+"%"
                //     }
                // },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            // let dataObj = _.clone(this);
                            // dataObj['id'] = this.series.name;
                            // filterPatientsByChart(dataObj, [], 'insurance');
                        }
                    }
                }
            }
        },
        credits: {
            enabled: false
        },
        xAxis: [{
            categories: data.seriesCategoryArray,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value} %',
                // style: {
                //     //color: Highcharts.getOptions().colors[1]
                // }
            },
            title: {
                text: '% of Prescription',
                // style: {
                //     color: Highcharts.getOptions().colors[1]
                // }
            }
        }, { // Secondary yAxis
            title: {
                text: 'Count of Prescription',
                // style: {
                //     color: Highcharts.getOptions().colors[0]
                // }
            },
            labels: {
                format: '{value}',
                // style: {
                //     color: Highcharts.getOptions().colors[0]
                // }
            },
            opposite: true
        }],
        tooltip: {
            shared: true,
            useHTML: true,
            formatter: function() {
                let html = '<div class="customC3ToolTip">';
                html += '<div class="customC3ToolTip-Header">' +
                    '<div><span style="text-align:center;"><b>' + this.x + '</b></span></center></div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">';
                for (let i = 0; i < this.points.length; i++) {
                    if (this.points[i].series.name == 'Total Prescription') {
                        html += '<div style="text-align:left"><span style="color: ' + this.points[i].point.color + '">\u25CF</span> ' + this.points[i].series.name + ': ' + commaSeperatedNumber(this.points[i].point.y) + '</div>';
                        html += '<div style="text-align:left"><span style="color: ' + this.points[i].point.color + '">\u25CF</span> Patient Count: ' + commaSeperatedNumber(this.points[i].point.distinctPatientCount) + '</div><br>';
                    } else {
                        html += '<div style="text-align:left"><span style="color: ' + this.points[i].point.color + '">\u25CF</span> ' + this.points[i].series.name + ': ' + commaSeperatedNumber(this.points[i].point.patientCount) + ' (' + this.points[i].point.y + '%) </div>';
                    }
                }
                html += '</div>' +
                    '</div>';
                return html;
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            x: 0,
            verticalAlign: 'top',
            y: 0,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: marketShareOverMonthsChartData
    });
}


//Nisha 04/05/2017 Added high charts bar
let renderHighBarChart = (container, data, key, label, lvalue) => {

    $('#threapy-' + key.toLowerCase() + '-N').html(commaSeperatedNumber(data.total));

    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }
    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: '' //label
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: key
            }
        },
        credits: {
            enabled: false
        },
        colors: ["#f1cb6a", "#69bae7", "#e95a52", '#2e7e97', "#abd6ba"],
        legend: {
            enabled: false
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {
                text: 'No of Patients(%)'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                },
                // cursor: 'pointer',
                // point: {
                //     events: {
                //         click: function() {
                //             let dataObj = _.clone(this);
                //             dataObj['id'] = this.name;
                //             filterPatientsByChart(dataObj, [], key.toLowerCase());
                //             if (label) {
                //                 dataObj['id'] = label;
                //                 dataObj['value'] = lvalue;
                //                 if (lvalue != 0)
                //                     filterPatientsByChart(dataObj, [], label.toLowerCase());
                //             }
                //         }
                //     }
                // }
            }
        },

        tooltip: {
            headerFormat: '',
            pointFormat: `<span>{point.name}</span>: <b>{point.y:.2f}%</b><br/>
                          Patient Count:{point.total:,0.0f}<br/>Total Patients:${commaSeperatedNumber(data.total)}`
        },

        series: [{
            name: key,
            colorByPoint: true,
            data: data.data
        }]
    });
}


let renderPrescriptionPieCharts = (container, data, key) => {

    $('#threapy-fibrosis-N').html(commaSeperatedNumber(data.total));
    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: '' //'Patients by Fibrosis'
        },
        tooltip: {
            pointFormat: ''
        },
        credits: {
            enabled: false
        },
        colors: customColorsArray(),//["#f1cb6a", "#69bae7", "#e95a52", '#2e7e97', "#abd6ba"],
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            x: 10,
            y: 50,
            labelFormatter: function() {
                if (isNaN(this.name)) {
                    return this.name;
                } else {
                    return 'F' + this.name
                }
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    enabled: true,
                    format: '{point.percentage:.2f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                },
                showInLegend: true
            },
            // series: {
            //     cursor: 'pointer',
            //     point: {
            //         events: {
            //             click: function() {
            //                 let dataObj = _.clone(this);
            //                 if (isNaN(this.name)) {
            //                     dataObj.id = null;
            //                 } else {
            //                     dataObj.id = this.name;
            //                 }
            //                 filterPatientsByChart(dataObj, [], 'fibrostage');
            //                 //alert('Category: ' + this.category + ', value: ' + this.y);
            //             }
            //         }
            //     }
            // }
        },

        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Fibrosis Stage</span>: <b>{point.name}</b><br/>
                          Patient Count:{point.y:,0.0f}<br/>Total Patients:{point.total:,0.0f} <br/>`
        },
        series: [{
            name: 'Fibrosis',
            colorByPoint: true,
            data: data.data
        }]
    });
}

let renderhighmapcharts = (container, data, key) => {
    // Instanciate the map
    $('#threapy-region-N').html(commaSeperatedNumber(data.total));
    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }
    Highcharts.mapChart(container, {

        chart: {
            borderWidth: 0
        },

        title: {
            text: "" //'Patient Distribution by Demographics'
        },

        // legend: {
        //     layout: 'horizontal',
        //     borderWidth: 0,
        //     floating: true,
        //     verticalAlign: 'top',
        //     y: 0
        // },
        colors: ["#f1cb6a", "#69bae7", "#e95a52", '#2e7e97', "#abd6ba"],
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
            data: data.data,
            mapData: Highcharts.maps['countries/us/us-all'],
            joinBy: ['postal-code', 'code'],
            dataLabels: {
                enabled: true,
                color: '#FFFFFF',
                format: '{point.value}'
            },
            name: 'Population density',
            tooltip: {
                pointFormat: 'Patient Count({point.code}): {point.value:,0.0f}<br/>'
            }
        }]
    });
}

let renderPayerMixobservedChart = (container, data, key, label) => {

    //check for no data 
    //set patient count  
    $('#payer-mix-N').html(commaSeperatedNumber(data.total));
    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.chart(container, {

        chart: {
            type: 'column'
        },

        title: {
            text: '' //'Observed and Estimated Starts  Distribution by Payer Mix'
        },

        xAxis: {
            categories: data.category
        },
        colors: ["#f1cb6a", "#69bae7", '#2e7e97', "#abd6ba"],
        yAxis: {
            allowDecimals: false,
            min: 0,
            max: 100,
            title: {
                text: 'No  of Patients(%)'
            }
        },
        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Insurance</span>: <b>{point.series.name}</b><br/>
                                Patient Count:{point.count:,0.0f}<br/>Total Patients:{point.ytotal:,0.0f} <br/>`
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return Math.round(this.y) + "%"
                    }
                }
            }
        },
        series: data.data
    });
}

let renderChartsPrescription = (baseData) => {
    renderCostRxBubbleChart('prescriptionCount-rxCost', baseData.costPrescription.all);
    addPrescriptionInformation(baseData.costPrescription.allTable);
    renderHighBarChartPrescription('prescriptionCount-IngredientCost', baseData.costPrescription.allTable);
    renderPredictionCountChart(baseData.prescriptionCount);
}

// Nisha 04/05/2017 for generating the Prescription Count and ingredient Cost Charts 

let renderPredictionCountChart = (baseData) => {
    let prescriptionCountData = baseData.AllPrescriptions;
    let totalCount = 0;
    if (prescriptionCountData.length > 0) {
        totalCount = prescriptionCountData[0].TotalPrescription;
    }

    $('#prescription-count-N').html(commaSeperatedNumber(totalCount));

    if (totalCount == 0) {
        fnNoDataFound('#prescriptionCount-ContainerDashboard');
    } else {
        Highcharts.chart('prescriptionCount-ContainerDashboard', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: ''
            },
            tooltip: {
                headerFormat: '',
                pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>{point.name} Count: <b>{point.PrescriptionCount:,0.0f}</b><br>Total Count: <b>{point.TotalPrescription:,0.0f}</b>'
            },
            colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        color: 'black',
                        distance: -30,
                        rotate: 0,
                        formatter: function() {
                            if (this.y > 4)
                                return Highcharts.numberFormat(this.y, 1) + '%';

                        },
                        style: {
                            fontWeight: '600',
                            fontSize: '11px',
                        }
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top',
                x: 10,
                y: 50,
                itemStyle: {
                    fontSize: '11px',
                    fontWeight: '300',
                    color: '#666666'
                }
            },
            series: [{
                name: 'Medication',
                colorByPoint: true,
                data: baseData.AllPrescriptions
            }]
        });
    }

    let prescriptionCountDataIng = baseData.AllIngredient;
    let totalCountIng = 0;
    for (let i = 0; i < prescriptionCountDataIng.length; i++) {
        totalCountIng += prescriptionCountDataIng[i].PrescriptionCount;
    }

    $('#ingredient-cost-N').html(commaSeperatedNumber(totalCountIng));

    if (totalCountIng == 0) {
        fnNoDataFound('#IngredientCost-ContainerDashboard');
    }
    Highcharts.chart('IngredientCost-ContainerDashboard', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.y:.1f}%</b><br>{point.name} Cost: <b>${point.PCharge:,.2f}</b><br>Total Cost: <b>${point.TotalPrescription:,.0f}</b>'
        },
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    color: 'black',
                    distance: -30,
                    rotate: 0,
                    formatter: function() {
                        if (this.y > 4)
                            return Highcharts.numberFormat(this.y, 1) + '%';

                    },
                    style: {
                        fontWeight: '600',
                        fontSize: '11px',
                    }
                },
                showInLegend: true
            }
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'top',
            x: 10,
            y: 50,
            itemStyle: {
                fontSize: '11px',
                fontWeight: '300',
                color: '#666666'
            }
        },
        series: [{
            name: 'Medication',
            colorByPoint: true,
            data: baseData.AllIngredient
        }]
    });
}

let renderCostRxBubbleChart = (container, data, key) => {

    let totalCount = 0;
    for (let i = 0; i < data.length; i++) {
        totalCount += data[i]['x'];
    }

    $('#cost-perrx-N').html(commaSeperatedNumber(totalCount));

    if (totalCount == 0) {
        fnNoDataFound('#' + container);
        return;
    }
    Highcharts.chart(container, {

        chart: {
            type: 'bubble',
            // plotBorderWidth: 1,
            zoomType: 'xy'
        },

        legend: {
            enabled: false
        },

        title: {
            text: ''
        },

        subtitle: {
            text: ''
        },

        xAxis: {
            gridLineWidth: 1,
            title: {
                text: 'Prescription Count'
            },
            labels: {
                format: '{value}'
            },
        },
        colors: customColorsArray(),
        yAxis: {
            startOnTick: false,
            endOnTick: false,
            title: {
                text: 'Cost per Prescription'
            },
            labels: {
                // format: '{value}',
                formatter: function() {
                    return '$' + autoFormatCostValue(this.value); //Math.round(this.value / 1000) + 'k';
                }
            },
            credits: {
                enabled: false
            },
            maxPadding: 0.2,
        },
        tooltip: {
            useHTML: true,
            formatter: function() {
                return `<span>Medication</span>: <b>${this.point.fullName}</b><br/>
                    Patient Count:${commaSeperatedNumber(this.x)}<br/>Avg Cost:$${commaSeperatedNumber(Math.round(this.y / 1000))}k<br/>`
            },
            followPointer: true
        },

        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                },
                showInLegend: true
            }
        },

        series: [{
            data: data
        }]

    });
}

//Nisha 04/05/2017 Add Prescription count table data
let addPrescriptionInformation = (baseData) => {

    if (baseData.total == 0) {
        fnNoDataFound('.prescriptionCount-rxCostTable');
        return;
    }
    let tableData = baseData.data;
    let tableHeader = ``;
    tableHeader = `<div class="common-efd-row MainTitle">
                        <div class="common-efd-cell1">Medication</div>
                        <div class="common-efd-cell1">Prescription Count</div>
                        <div class="common-efd-cell1">Ingredient Cost</div>
                        <div class="common-efd-cell1">Cost Per Rx</div>
                  </div>`;
    let htmlRow = ``;
    //sort data by ingredient cost 
    tableData.sort((a, b) => b.y - a.y);
    for (let i = 0; i < tableData.length; i++) {
        let data = tableData[i];
        htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1">${data.name}</div>
                        <div class="common-efd-cell1">${commaSeperatedNumber(data.count)}</div>
                        <div class="common-efd-cell1" title="$${commaSeperatedNumber(data.y.toFixed(2))}">$${autoFormatCostValue(data.y)}</div>
                        <div class="common-efd-cell1">$${commaSeperatedNumber(data.costperrx.toFixed(0))}</div>
                    </div>`;
    }

    $('.prescriptionCount-rxCostTable').html(tableHeader + htmlRow);
}

//Nisha 5th April 2017 Added bar chart for ingredient cost and prescription 
//Movedto Dashboard on 4th April
let renderHighBarChartPrescription = (container, data) => {

    //set value of N
    $('#ingr-costprescription-N').html(commaSeperatedNumber(data.total));

    //check for no data
    if (data.total == 0) {
        fnNoDataFound("#" + container);
        return;
    }

    Highcharts.chart(container, {
        chart: {
            type: 'column'
        },
        title: {
            text: '' //label
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            title: {
                text: 'Medication'
            }
        },
        credits: {
            enabled: false
        },
        colors: customColorsArray(),
        legend: {
            enabled: false
        },
        yAxis: {
            title: {
                text: 'Ingredient Cost($)'
            }
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    // format: '{point.y:.0f}%',
                    formatter: function() {
                        return '$' + autoFormatCostValue(this.y); //Math.round(this.y)+"%";
                    }
                },
            }
        },

        tooltip: {
            headerFormat: '',
            pointFormat: `<span>Medication</span>:{point.name}<br/> <span>Cost</span>:$ {point.y:,.2f}<br/>
                          Patient Count:{point.count:,0.0f}<br/>Total Patients:${commaSeperatedNumber(data.total)}`
        },

        series: [{
            name: '',
            colorByPoint: true,
            data: data.data
        }]
    });
}

Template.MarketOverview.fetchAndRenderData = (dbparams, templateObj) => {
    //get data for Competitor Analysis tabs
    let params = {};
    if (Pinscriptive.Filters) {
        params = getCurrentPopulationFilters(); // pharmaLib.getCurrentPopulationFilters();
    }
    pharmaLib.showChartLoading();


    Meteor.call('getPharmaTreatedPatientsDataForDashboards', params, function(errors, results) {
        if (errors) {
            pharmaLib.hideChartLoading();
        } else {
            pharmaLib.setAdvancedSearchFilters();
            pharmaLib.setPharmaHeader();
            let stringifyResult = LZString.decompress(results);
            let finalUnCompressedResult = JSON.parse(stringifyResult);
            //console.log(finalUnCompressedResult);
            renderPatientPrescrioptionCharts(finalUnCompressedResult);
            renderChartsPrescription(finalUnCompressedResult);

            setCohortPatientCount({ patientCount: finalUnCompressedResult.TotalN });

            Meteor.call('getPharmaCompetitorAnalysisYearlyData', params, function(error, result1) {
                if (error) {
                    pharmaLib.hideChartLoading();
                    console.log(error);
                } else {
                    pharmaLib.hideChartLoading();
                    // console.log('1');
                    let stringifyResult1 = LZString.decompress(result1);
                    let finalUnCompressedResult1 = JSON.parse(stringifyResult1);
                    // console.log('2');
                    localStorage.yearlyCompetiterData = stringifyResult1;
                    // console.log('3');
                    GenerateYearlyPerformanceChart({
                        data: finalUnCompressedResult1
                    });
                }
            });
            // yearly data method ends
        }
    });
    //get CompetitorAnalysis data
}

let fnNoDataFound = (container) => $(container).html('<div class="nodataFound">No Data Available</div>');