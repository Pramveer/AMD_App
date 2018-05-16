import { Template } from 'meteor/templating';
import './geo.html';

var DRUG_LIMIT = 4;
var GeoDatas = [];
// var color = ["#8dd3c7", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f", "#ffffb3"]
// var color1 = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
var Colors = ["#FF1493", "#CD853F", "#0D2231", "#388E8E", "#660033", "#14374F", "#73AD21", "#5F5F5F"];
//var Colors = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
var GeoModule = function() {
    // Selected score value
    var selectedGeo = '';
    // Store all selected drugs name
    var selectedDrugs = [];
    // Selected location type
    var selectedProp = '';
    // Google map object
    var map;
    // Collection of all marker object
    var markers = [];
    // Selected all drugs with data 
    var drugs = [];
    // Store marker bound value based on collection of marker value
    var bounds;
    // Store last zoom level of maps
    var prevZoomLevel;
    // Create global info window object for better reusability
    var infoWindow;

    //Register all events at one place
    var bindEvents = function() {

        $(".eff-sidebox input:checkbox").change(function(e) {
            selectedDrugs = $('.eff-sidebox input:checked').map(function() {
                return this.value;
            }).get();

            //Capture last selected drugs and and also display it in drug choice popup if it never display for current session
            if (e.target && e.target.checked) {
                //If Drug popup displayed once in current session then it will never show again but capture information
                if (selectedDrugs && selectedDrugs.length === 1) {
                    localStorage.lastSelectedDrug = e.target.value;
                    if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
                        $('.drug-inspection').slideUp();
                    } else {
                        //Display drug popup if last drug is selected in current session
                        if (localStorage.lastSelectedDrug && localStorage.lastSelectedDrug.length > 0) {
                            $('#inspected-drug').text(localStorage.lastSelectedDrug).attr('title', localStorage.lastSelectedDrug);

                            $('.drug-inspection').slideDown();
                        }
                    }
                }
            }

            var filterData = [];

            //Check weather any drug is selected or not 
            if (selectedDrugs && selectedDrugs.length > 0) {
                localStorage.selectedDrugs = JSON.stringify(selectedDrugs);
            } else {
                localStorage.selectedDrugs = JSON.stringify([]);
                //Display warning if no record are selected and clear graph data with setting last selection in local
                $('.efficacy-warning').slideDown();
                setTimeout(function() {
                    $('.efficacy-warning').slideUp();
                }, 3000);
            }

            redrawMap();
            // set minimum height for scroll in drug selection slide
            $('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));

        });
        $("#ddlScoreFilter").change(function() {
            selectedProp = $(this).val();
            redrawMap();
        });

        $("#ddlFilter").change(function() {
            selectedGeo = $(this).val();
            redrawMap();
        });
    };

    //Wrap drug name if name is loger to fit in marker info  
    WrapDrugName = function(drug) {
        //split drug with '+' symbol
        var truncatedDrug = '';
        var splittedDrug = drug.split('+');
        if (splittedDrug.length > 1) {
            //split second index drug with '(' symbol
            var furtherSplittedDrug = splittedDrug[1].split('(');
            if (furtherSplittedDrug.length > 1) {
                //To Do display  both array as zero index drug from it is and also set title for it               
                truncatedDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]) + '...';
            } else {
                //To Do display  both array as zero index drug from it is and also set title for it  
                if (splittedDrug.length > 2) {
                    truncatedDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]) + '...';
                } else {
                    //$('#inspected-drug').text((splittedDrug[0] + '+' + furtherSplittedDrug[0])).attr('title', drug);
                    truncatedDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);
                }
            }
        } else {
            //To Do display drug as it is and also set title for it
            truncatedDrug = drug;
        }
        return truncatedDrug;
    };

    //Fetch Address based on filter selection with count for each value e.g. By State,City,ZipCode
    var getAddressesFromSelection = function() {
        var terms = [];
        selectedDrugs.forEach(function(item, i) {
            var drug = _.findWhere(drugs, {
                DrugName: item
            });

            var geo = _.findWhere(GeoDatas, {
                DrugName: item
            });

            if (drug && geo) {
                if (selectedGeo == "State") {
                    var temp = _.countBy(geo.GeoData.States);
                    _.each(temp, function(value, key) {
                        terms.push({
                            drugId: item,
                            Address: key,
                            Count: value,
                            Color: Colors[i]
                        });
                    });

                } else if (selectedGeo == "City") {
                    var temp = _.countBy(geo.GeoData.Cities);
                    _.each(temp, function(value, key) {
                        terms.push({
                            drugId: item,
                            Address: key,
                            Count: value,
                            Color: Colors[i]
                        });

                    });
                } else if (selectedGeo == "ZipCode") {
                    var temp = _.countBy(geo.GeoData.ZipCodes);
                    _.each(temp, function(value, key) {
                        terms.push({
                            drugId: item,
                            Address: key,
                            Count: value,
                            Color: Colors[i]
                        });
                    });
                }
            }
        });
        //return data Grouped by Address field
        return _.groupBy(terms, 'Address');
    };

    //Prepare location collection with lat long based on filterd address  collection
    var getLocationsFromAddresses = function(addresses) {

        var locations = [];

        $.ajaxSetup({
            async: false
        });

        _.each(addresses, function(value, key) {

            $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address=' + key + '&sensor=false', null, function(data) {
                //null check for location info
                var location = data.results.length > 0 && data.results[0].geometry && data.results[0].geometry.location ? data.results[0].geometry.location : null;
                if (location) {
                    locations.push({
                        Location: location,
                        Address: key,
                        drugData: value
                    });
                }
            });
        });


        $.ajaxSetup({
            async: true
        });
        return locations;

    };

    // Redraw or regenrate maps based on all selected filter and selection
    var redrawMap = function() {

        var addresses = getAddressesFromSelection();
        var locations = getLocationsFromAddresses(addresses);
        deleteMarkers();
        locations.forEach(function(item) {
            addMarker(item);
        });

        //Group marker based on selected area
        var bounds = new google.maps.LatLngBounds();

        markers.forEach(function(item) {
            bounds.extend(item.getPosition());
        });
        //Store current bound for future use when we close info window
        prevZoomLevel = bounds;
        setMapOnAll(map);
        map.fitBounds(bounds);


    };

    //Initialize map object at once
    var initMap = function() {

        var centerPoint = {
            lat: 39,
            lng: -95
        };

        var myMapOptions = {
            center: centerPoint,
            zoom: 3,
            mapTypeControl: false,
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        //initialize infoWindow Object at once
        infoWindow = new google.maps.InfoWindow({
            maxWidth: 260,
            pixelOffset: new google.maps.Size(80, 0)
        });

        map = new google.maps.Map(document.getElementById('map'), myMapOptions);
    };

    //Clear all markers based on filter change
    var clearMarkers = function() {
        setMapOnAll(null);
    };

    //Delete all markers based on filter change
    var deleteMarkers = function() {
        clearMarkers();
        markers = [];
    };

    //Prepare tooltip based on address(or location data) along with drugs infromation
    var getTooltipByDrugId = function(data) {

        var combinedTooltip = "";
        var totalCount = 0;
        var tooltipHeader = "";
        data.drugData.forEach(function(item) {

            var tooltip = "";
            var drug = _.findWhere(drugs, {
                DrugName: item.drugId
            });

            if (drug) {
                /** @totalCount :Address or Zipcode wise calculation
                 *  @item.Count  drug specific count
                 */
                totalCount += item.Count;
                tooltip += "<p title='" + drug.DrugName + "' '> " + "<span style='color:" + item.Color + "'>" + WrapDrugName(drug.DrugName) + " </span>";
                if (selectedProp == "Efficacy") {
                    var extractedN = RegExp('.*?(\\d+)', ["i"]).exec(drug.Efficacy.ResponseRate);
                    var N = extractedN && extractedN[1] ? Number(extractedN[1]) : 0;
                    tooltip += ": (N=" + item.Count + ") " + (Number(drug.Efficacy.Efficacy) / N * Number(item.Count)).toFixed(2) + '%' + "</p>";
                } else if (selectedProp == "Adherence") {
                    var extractedN = RegExp('.*?(\\d+)', ["i"]).exec(drug.Adherence.MPR);
                    var N = extractedN && extractedN[1] ? Number(extractedN[1]) : 0;
                    tooltip += ": (N=" + item.Count + ") " + (Number(drug.Adherence.Adherence) / N * Number(item.Count)).toFixed(2) + '%' + "</p>";
                } else if (selectedProp == "Utilization") {
                    var extractedN = RegExp('.*?(\\d+)', ["i"]).exec(drug.Utilization.Rx);
                    var N = extractedN && extractedN[1] ? Number(extractedN[1]) : 0;
                    tooltip += ": (N=" + item.Count + ") " + (Number(drug.Utilization.Utilization) / N * Number(item.Count)).toFixed(2) + '%' + "</p>";
                }
            }

            combinedTooltip += tooltip;

        });
        //Display total ount for each location in header
        tooltipHeader = "<h4 style='text-align:center;'>" + $("#ddlFilter").val() + ":" + "(N=" + totalCount + ")" + data.Address + "</h4>";
        return tooltipHeader + combinedTooltip;
    };

    // Add marker object in markers (collection of marker object) with different marker color, click as well as closeClick events
    var addMarker = function(item) {

        var iconColor = "orange";
        if (selectedProp == "Efficacy") {
            iconColor = "red";
        } else if (selectedProp == "Safety") {
            iconColor = "blue";
        } else if (selectedProp == "Adherence") {
            iconColor = "yellow";
        } else if (selectedProp == "Utilization") {
            iconColor = "green";
        }


        var marker = new google.maps.Marker({
            position: item.Location,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: "http://maps.google.com/mapfiles/ms/icons/" + iconColor + ".png"
        });

        markers.push(marker);

        var tooltip = getTooltipByDrugId(item);
        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                //set different color for clicked marker
                //marker.setIcon("http://maps.google.com/mapfiles/ms/icons/pink.png");
                //add zoom level for each marker when we click on marker
                map.panTo(marker.getPosition());
                map.setZoom(9);
                infoWindow.setContent(tooltip);
                infoWindow.open(map, marker);
                $('#map div').filter(function() {
                    return $(this).css('width') == '16px';
                }).css({
                    'display': 'none'
                })


            }
        })(marker));

        //add closeclick event for infoWindow to resize map to previsous Zoom level
        google.maps.event.addListener(infoWindow, 'closeclick', function() {

            map.fitBounds(prevZoomLevel);
        });
    };

    //set all marker object on map
    var setMapOnAll = function(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    };

    //render Map called once when geo tab rendered
    var renderMap = function() {
        selectedDrugs = $('.eff-sidebox input:checked').map(function() {
            return this.value;
        }).get();
        selectedGeo = $('#ddlFilter').val();
        selectedProp = $('#ddlScoreFilter').val();

        drugs = localStorage.AllDrugsData && JSON.parse(localStorage.AllDrugsData) ? JSON.parse(localStorage.AllDrugsData) : [];
        GeoDatas = localStorage.AllGeoData && JSON.parse(localStorage.AllGeoData) ? JSON.parse(localStorage.AllGeoData) : [];
        bindEvents();
        google.maps.event.addDomListener(window, 'load', initMap());
        redrawMap();
    };

    return {
        renderMap: renderMap
    };
}();


//Perform operation when template rendered
Template.Geo.rendered = function() {
    //Call renderMap fom GeoModule
    GeoModule.renderMap();
    // set minimum height for scroll in drug selection slide
    $('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));
    
    var allDrugsData = JSON.parse(localStorage.AllDrugsData);
    $('.machineLearn-totalPatients').html(commaSeperatedNumber(allDrugsData[0].TotalN || 0));
};
