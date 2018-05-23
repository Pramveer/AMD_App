import {
    Template
} from 'meteor/templating';
import './safety.html';

var safetyAjaxs = [];
var drugsInfo = [];
var section = '';
var tab;
//Set Drug Display Limit for selection
var DRUG_LIMIT = 10;
Template.Safety.rendered = function() {
    console.log("Safety tab rendered");
    // $('#js-nav-payer a').removeClass('active');
    // $('#js-nav-patient a').removeClass('active');
    // $('#js-nav-provider a').removeClass('active');
    // $('#js-nav-analytics a').removeClass('active');
    // $('#safety_cirrhosis').find('.efd-cell2_subpopulaiton').html($('#desc_cirrhosis').find('.efd-cell2_subpopulaiton').html());
    // $('#safety_treatment').find('.efd-cell2_subpopulaiton').html($('#desc_treatment').find('.efd-cell2_subpopulaiton').html());
    // $('#safety_genotype').find('.efd-cell2_subpopulaiton').html($('#desc_genotype').find('.efd-cell2_subpopulaiton').html());
    //console.log(window.location.pathname.toLowerCase());
    if ((window.location.pathname.toLowerCase() == "/payer")) {
        console.log(window.location.pathname.toLowerCase());
        //#safetyLinkToBack
        $('#safetyLinkToBack').hide();
        $('.e-slidemenu').hide();
        //// Commented as it not necessary
        // Session.set("selectedPatientData", this.data.Patientdata);
        ////
        //render the link for back to payer tab
        //renderBackLinkToPayer();
        // $("#allDrugsCombo").val('0');

    }

    if (Session.get('selectedPage') == "pharma") {
        renderBackLinkToPharma();
        // $('#safety_cirrhosis').find('.efd-cell2_subpopulaiton').html($('#desc_cirrhosis_pharma').find('.efd-cell2_subpopulaiton').html());
        // $('#safety_treatment').find('.efd-cell2_subpopulaiton').html($('#desc_treatment_pharma').find('.efd-cell2_subpopulaiton').html());
        // $('#safety_genotype').find('.efd-cell2_subpopulaiton').html($('#desc_genotype_pharma').find('.efd-cell2_subpopulaiton').html());
    }
    var selectedDrugs = [];
    tab = 0;
    $("#allDrugsCombo").val(localStorage.getItem('DrugName'));
    if (localStorage.getItem('SafetySection')) {
        section = localStorage.getItem('SafetySection');
        section = section.split('#')[1];
    }
    localStorage.setItem('selectedDrugChartView', 'CD');

    //var filterData = localStorage.filteredDrugsForGraph && JSON.parse(localStorage.filteredDrugsForGraph) ? JSON.parse(localStorage.filteredDrugsForGraph) : [];
    // remove extra parsing process for faster performance
    var filterData = localStorage.filteredDrugsForGraph ? JSON.parse(localStorage.filteredDrugsForGraph) : [];
    //Display Graph for Drugs selection not more that 4 Drugs
    //Display Default 4 drugs data if no drugs is selected
    if (filterData && filterData.length > 0) {
        localStorage.setItem('filterDataDrug', filterData);
        /*if (localStorage.getItem('selectedDrugChartView') == 'CS') {
            GenerateSafetyDetailCircularChartSymtomsWithDrug(filterData);
        } else if (localStorage.getItem('selectedDrugChartView') == 'CD') {
            GenerateSafetyDetailCircularChartDrugWithSymtoms(filterData);
        } else if (localStorage.getItem('selectedDrugChartView') == 'CM') {
            GenerateSafetyDetailMatrixChartSymtomsWithDrug(filterData);
        }*/

    }

    generateDrugTabs();

    // set minimum height for scroll in drug selection slide
    $('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));
    // Scroll To Top
    $(document).ready(function() {
        $(window).scrollTop(0);
    });
    var allDrugsData = JSON.parse(localStorage.AllDrugsData);
    $('.machineLearn-totalPatients').html(commaSeperatedNumber(allDrugsData[0].TotalN || 0));
}
Template.Safety.helpers({
    'DrugInfo': function() {
        var Drugs = AllDrugs.reactive();
        return Drugs;
    },
    'getReactionsData': function() {
        var PatientData = Session.get("selectedPatientData");
        var params = [];
        var genotype = '';
        var treatment = '';
        var cirrhosis = '';
        var viral_load = '';

        genotype = PatientData[0]['Genotype'];
        treatment = PatientData[0]['Treatment'] == 'Yes' ? 'Naive' : 'Experienced';
        cirrhosis = PatientData[0]['Cirrhosis'];
        viral_load = PatientData[0]['ViralLoad'];
        if (viral_load == 6) {
            cirrhosis = '';
        } else {
            viral_load = '';
        }

        params = [genotype, treatment, cirrhosis, viral_load];

        PatientReactions.change(params);
        PatientReactions.addEventListener('update', function(data, diff) {

            // recall the function to refill chart data with array returned from DB
            GenerateSafetyDetailCircularChartDrugWithSymtoms(localStorage.getItem('filterDataDrug').split(','));
            document.getElementById("anim_loading_theme").style.visibility = "hidden";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("anim_loading_theme").style.top = "40%";

        });
    }
});

Template.Safety.events({
    'change .AdverseReactionCharts': function(e) {
        var ele = e.currentTarget;
        if (ele.value == 1) {
            localStorage.setItem('selectedDrugChartView', 'CS');
            GenerateSafetyDetailCircularChartSymtomsWithDrug(localStorage.getItem('filterDataDrug').split(','));
        } else if (ele.value == 2) {
            localStorage.setItem('selectedDrugChartView', 'CD');
            GenerateSafetyDetailCircularChartDrugWithSymtoms(localStorage.getItem('filterDataDrug').split(','));
        } else if (ele.value == 3) {
            localStorage.setItem('selectedDrugChartView', 'CM');
            GenerateSafetyDetailMatrixChartSymtomsWithDrug(localStorage.getItem('filterDataDrug').split(','));
        }
    },
    'click .safetydrugTabs .safetydrugTab-links a': function(e) {
        var ele = e.currentTarget;
        var currentAttrValue = $(ele).attr('href');
        // Show/Hide Tabs
        $('.safetydrugTab' + currentAttrValue).show().siblings().hide();
        // Change/remove current tab to active
        $(ele).parent('li').addClass('active').siblings().removeClass('active');
        $(ele).parent('li').css('background-color', '#a5a7aa');
        $(ele).parent('li').siblings().css('background-color', '#a5a7aa');
        $(ele).parent('li').prev().css('background-color', '#112e42');
        var selectedTab = currentAttrValue.substr(currentAttrValue.lastIndexOf('_') + 1);
        tab = selectedTab - 1;
        Template.Safety.toggle(section, selectedTab - 1);
        e.preventDefault();
    },
    'change .eff-sidebox input:checkbox': function(e) {
        var selectedDrugs = $('.eff-sidebox input:checked').map(function() {
            return this.value;
        }).get();

        //Capture last selected drugs and and also display it in drug choice popup if it never display for current session
        if (e.target && e.target.checked) {
            //If Drug popup displayed once in current session then it will never show again but capture information
            if (selectedDrugs && selectedDrugs.length == 1) {
                localStorage.lastSelectedDrug = e.target.value;
                if (localStorage.IsDrugCaptured && localStorage.IsDrugCaptured === "true") {
                    $('.drug-inspection').slideUp();
                } else {
                    //WrapDrugName(localStorage.lastSelectedDrug);
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
            if (selectedDrugs.length > 0 && selectedDrugs.length <= DRUG_LIMIT) {
                for (var k = 0; k <= selectedDrugs.length - 1; k++) {
                    filterData.push(selectedDrugs[k]);
                }
                // To Do for safety on change event
                localStorage.setItem('filterDataDrug', filterData);
                if (localStorage.getItem('selectedDrugChartView') == 'CS') {
                    GenerateSafetyDetailCircularChartSymtomsWithDrug(filterData);
                } else if (localStorage.getItem('selectedDrugChartView') == 'CD') {
                    GenerateSafetyDetailCircularChartDrugWithSymtoms(filterData);
                } else if (localStorage.getItem('selectedDrugChartView') == 'CM') {
                    GenerateSafetyDetailMatrixChartSymtomsWithDrug(filterData);
                }
            } else {
                //Restriction or limit # drugs on page
                $('.drug-selection-warning').slideDown();
                setTimeout(function() {
                    $('.drug-selection-warning').slideUp()
                }, 3000);

            }
            $('.efficacy-warning').hide();
        } else {
            localStorage.selectedDrugs = JSON.stringify([]);
            //Display warning if no record are selected and clear graph data with setting last selection in local
            // To Do for safety on change event
            localStorage.setItem('filterDataDrug', []);
            if (localStorage.getItem('selectedDrugChartView') == 'CS') {
                GenerateSafetyDetailCircularChartSymtomsWithDrug(filterData);
            } else if (localStorage.getItem('selectedDrugChartView') == 'CD') {
                GenerateSafetyDetailCircularChartDrugWithSymtoms(filterData);
            } else if (localStorage.getItem('selectedDrugChartView') == 'CM') {
                GenerateSafetyDetailMatrixChartSymtomsWithDrug(filterData);
            }
            $('.efficacy-warning').slideDown();
            setTimeout(function() {
                $('.efficacy-warning').slideUp();
            }, 3000);

        }
        section = '';
        generateDrugTabs();
        // set minimum height for scroll in drug selection slide
        $('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));

    }
});
Template.Safety.toggle = function(clickedEle, tabNum, subsection) {
    tabNum = tabNum == undefined ? tab : tabNum;
    clickedEle = clickedEle != undefined ? clickedEle : '';
    var mixedID, id, drugname;

    //if section is clicked from the drug on safety page.
    if (!clickedEle.id) {
        drugname = drugsInfo[tabNum]['name'].toUpperCase();
        drugname = drugname.replace(/ /g, "_");
        mixedID = drugname + "_" + clickedEle;
        id = clickedEle;
    }
    //if section is to expanded via navigating from Drug page.
    else {
        mixedID = clickedEle.id;
        id = mixedID.substr(mixedID.lastIndexOf('_') + 1);
        //drugname = drugsInfo[tabNum]['name'].toUpperCase();
        drugname = mixedID.split('_')[0];
        drugname = drugname.replace(/ /g, "_");
    }
    var pele = document.getElementById(mixedID);
    var ele = document.getElementById(drugname + '_collapsableElement_' + id);
    var previewTextDiv = document.getElementById(drugname + '_previewText_' + id);
    if (ele.className == 'collapseElement') {
        ele.className = 'expandElement'
        pele.className = 'drug-label-open';
        previewTextDiv.style.display = 'none';
    } else {
        ele.className = 'collapseElement';
        pele.className = 'drug-label-close';
        previewTextDiv.style.display = 'blocsk';
    }
    if (subsection != '' && subsection != null) {
        scrollToId(subsection);
    } else if (!clickedEle.id) {
        scrollToId(mixedID);
    }
};


Template.Safety.ReloadDrug = function(id) {
    var x = document.getElementById("allDrugsCombo").value;
    Template.Safety.DrugSetId = x;
    document.getElementById('drugsTabs').innerHTML = '';
    document.getElementById("displayContant").innerHTML = '';
    displayResult(x, "displayContant");
};
Template.Safety.destroyed = function() {
    //localStorage.setItem('DrugName','');
    for (i = 0; i < safetyAjaxs.length; i++) {
        safetyAjaxs[i].abort();
    }

    //remove safety link from header and adjust the nav bar items width
    var element = $("#headerNavBar li").children("a[href$='/Safety']");
    $(element).parent().remove();
    $('.top-navigation').css('width', '960px');
        // var allListEle = $('#headerNavBar li');
        // var parentWidth = $('#headerNavBar').css('width');
        // parentWidth = parentWidth.replace('px', '');
        // var childWidth = (parseInt(parentWidth) / (allListEle.length - 1)) -50+ 'px';
        // for (var index = 0; index < allListEle.length; index++) {
        //     $(allListEle[index]).css('width', 'auto');
        // }


    //set keyword and subsection to empty
    localStorage.setItem('DrugToHighlight', '');
    localStorage.setItem('SafetySubSectionId', '');
};

var xhttp;
if (window.ActiveXObject) {
    xhttp = new ActiveXObject("Msxml2.XMLHTTP");
} else {
    xhttp = new XMLHttpRequest();
}

function loadXMLDoc(filename) {
    xhttp.open("GET", filename, false);
    try {
        xhttp.responseType = "msxml-document"
    } catch (err) {} // Helping IE11
    xhttp.send("");
    return xhttp.responseXML;
}

function displayResultOLD(setId, nodeEle) {
    var xml, xsl;
    $('#defaultMsg').css('display', 'none');
    document.getElementById("anim_loading_theme").style.top = "130%";
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
    safetyAjaxs.push(
        $.ajax({
            url: 'data/' + setId + '.xml',
            //url: 'http://dailymed.nlm.nih.gov/dailymed/services/v2/spls/' + setId + '.xml',
            dataType: 'text',
            timeout: 120000,
            success: function(result) {
                console.log(result);
                document.getElementById(nodeEle).innerHTML = '';
                document.getElementById(nodeEle).appendChild(result);
                document.getElementById(nodeEle).value = setId;

                //For first time set empty string value if safety section is undefined
                // Fixed -Toggle box generating an error
                var sectionId = localStorage.getItem('SafetySection') ? localStorage.getItem('SafetySection') : "";
                localStorage.setItem('SafetySection', '');
                var nav = document.getElementsByClassName('NavigateUrlByTabDesk');
                for (var i = 0; i < nav.length; i++) {
                    if (nav[i].innerHTML == 'Safety') {
                        nav[i].parentNode.className = 'active';
                    } else {
                        nav[i].parentNode.className = '';
                    }
                }
                if (sectionId != '') {
                    setTimeout(function() {
                        location.href = sectionId;
                        setTimeout(function() {
                            var subsection = localStorage.getItem('SafetySubSectionId');
                            console.log(sectionId);
                            Template.Safety.toggle(sectionId.split('#')[1], 0, subsection);
                            var keyword = localStorage.getItem('DrugToHighlight');
                            if (!keyword == '') {
                                var myHilitor = new Hilitor("body");
                                myHilitor.apply(keyword);
                            }
                        }, 300);
                    }, 800);

                }
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("anim_loading_theme").style.top = "40%";



            },
            error: function(xhr, textStatus, errorThrown) {
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("anim_loading_theme").style.top = "40%";
            }
        })
    );
}



function displayResult_Brian(setId, nodeEle) {
    var xml, xsl;
    $('#defaultMsg').css('display', 'none');
    document.getElementById("anim_loading_theme").style.top = "130%";
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
    safetyAjaxs.push(
        $.ajax({
            url: 'data/' + setId + '.xml',
            //url: 'http://dailymed.nlm.nih.gov/dailymed/services/v2/spls/' + setId + '.xml',
            dataType: 'text',
            timeout: 120000,
            success: function(result) {
                var xml1 = result;
                xml1 = xml1.replace('<document xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 http://www.accessdata.fda.gov/spl/schema/spl.xsd">', '<document>');
                xml1 = xml1.replace(/\xsi:/g, '');
                xml1 = xml1.replace(/\paragraph/g, 'p');
                xml1 = xml1.replace(/\list/g, 'ul');
                xml1 = xml1.replace(/\item/g, 'li');
                xml1 = xml1.replace(/\linkHtml/g, 'a');
                xml = $.parseXML(xml1);
                safetyAjaxs.push(
                    $.ajax({
                        url: 'data/data.xsl',
                        success: function(result1) {
                            xsl = result1;
                            //if (window.ActiveXObject || xhttp.responseType == "msxml-document") { // code for IE
                            if (window.ActiveXObject || "ActiveXObject" in window) {

                                //ex = xml.transformNode(xsl);
                                var xmlAsString = ActiveXObject_PR(xml, xsl);

                                document.getElementById(nodeEle).innerHTML = xmlAsString;


                            } else if (document.implementation && document.implementation.createDocument) { // code for Chrome, Firefox, Opera, etc.
                                var xsltProcessor = new XSLTProcessor();
                                xsltProcessor.importStylesheet(xsl);
                                resultDocument = xsltProcessor.transformToFragment(xml, document);
                                document.getElementById(nodeEle).innerHTML = '';
                                document.getElementById(nodeEle).appendChild(resultDocument);
                                document.getElementById(nodeEle).value = setId;

                                //For first time set empty string value if safety section is undefined
                                // Fixed -Toggle box generating an error
                                var sectionId = localStorage.getItem('SafetySection') ? localStorage.getItem('SafetySection') : "";
                                localStorage.setItem('SafetySection', '');
                                var nav = document.getElementsByClassName('NavigateUrlByTabDesk');
                                for (var i = 0; i < nav.length; i++) {
                                    if (nav[i].innerHTML == 'Safety') {
                                        nav[i].parentNode.className = 'active';
                                    } else {
                                        nav[i].parentNode.className = '';
                                    }
                                }
                                if (sectionId != '') {
                                    setTimeout(function() {
                                        location.href = sectionId;
                                        setTimeout(function() {
                                            var subsection = localStorage.getItem('SafetySubSectionId');
                                            console.log(sectionId);
                                            Template.Safety.toggle(sectionId.split('#')[1], 0, subsection);
                                            var keyword = localStorage.getItem('DrugToHighlight');
                                            if (!keyword == '') {
                                                var myHilitor = new Hilitor("body");
                                                myHilitor.apply(keyword);
                                            }
                                        }, 300);
                                    }, 800);

                                }
                                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                                document.getElementById("overlay").style.display = "none";
                                document.getElementById("anim_loading_theme").style.top = "40%";
                            }
                            document.getElementById("anim_loading_theme").style.visibility = "hidden";
                            document.getElementById("overlay").style.display = "none";
                            document.getElementById("anim_loading_theme").style.top = "40%";
                        }
                    })
                );
            },
            error: function(xhr, textStatus, errorThrown) {
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("anim_loading_theme").style.top = "40%";
            }
        })
    );
}


function displayResult(setId, nodeEle) {
    var xml, xsl;
    $('#defaultMsg').css('display', 'none');
    document.getElementById("anim_loading_theme").style.top = "130%";
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
    safetyAjaxs.push(
        $.ajax({
            url: `data/${setId}.html`,
            //  url: 'data/Harvoni.html',
            //url: 'http://dailymed.nlm.nih.gov/dailymed/services/v2/spls/' + setId + '.xml',
            dataType: 'text',
            timeout: 120000,
            success: function(result) {
                //console.log(result);
                document.getElementById(nodeEle).innerHTML = '';
                //document.getElementById(nodeEle).appendChild(result);
                document.getElementById(nodeEle).innerHTML = result;
                document.getElementById(nodeEle).value = setId;

                //For first time set empty string value if safety section is undefined
                // Fixed -Toggle box generating an error
                var sectionId = localStorage.getItem('SafetySection') ? localStorage.getItem('SafetySection') : "";
                localStorage.setItem('SafetySection', '');
                var nav = document.getElementsByClassName('NavigateUrlByTabDesk');
                for (var i = 0; i < nav.length; i++) {
                    if (nav[i].innerHTML == 'Safety') {
                        nav[i].parentNode.className = 'active';
                    } else {
                        nav[i].parentNode.className = '';
                    }
                }
                if (sectionId != '') {
                    setTimeout(function() {
                        location.href = sectionId;
                        setTimeout(function() {
                            var subsection = localStorage.getItem('SafetySubSectionId');
                            console.log(sectionId);
                            Template.Safety.toggle(sectionId.split('#')[1], 0, subsection);
                            var keyword = localStorage.getItem('DrugToHighlight');
                            if (!keyword == '') {
                                var myHilitor = new Hilitor("body");
                                myHilitor.apply(keyword);
                            }
                        }, 300);
                    }, 800);

                }
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("anim_loading_theme").style.top = "40%";



            },
            error: function(xhr, textStatus, errorThrown) {
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
                document.getElementById("anim_loading_theme").style.top = "40%";
            }
        })
    );
}



/* function to calculate the drugs selected in the drugs page and generate the respective tabs for them */
function generateDrugTabs() {
    var selectedDrugs = '';
    selectedDrugs += localStorage.getItem('DrugName') + '+';
    if (localStorage.selectedDrugs) {
        var checkedDrugs = JSON.parse(localStorage.selectedDrugs);
        for (i = 0; i < checkedDrugs.length; i++) {
            selectedDrugs += checkedDrugs[i] + '+';
        }
    }

    selectedDrugs = selectedDrugs.split('+');
    var drugsToDisplay = [];
    document.getElementById('displayContant').innerHTML = '';

    //fetch the data from AllDrugs and match it on the basis of the drugs selected on the Drug page.
    for (i = 0; i < selectedDrugs.length; i++) {
        // remove the content between () brackets
        selectedDrugs[i] = selectedDrugs[i].replace(/\s*\(.*?\)\s*/g, '');
        // remove the trailing space from start & end of line
        selectedDrugs[i] = selectedDrugs[i].replace(/(^[\s]+|[\s]+$)/g, '');
        for (j = 0; j < AllDrugs.length; j++) {
            //check drugname case insensitive
            if (selectedDrugs[i].toUpperCase() == AllDrugs[j]['name'].toUpperCase()) {
                drugsToDisplay.push({
                    name: AllDrugs[j]['name'],
                    //OLD CODE BASED ON SET ID
                    //setId: AllDrugs[j]['setId']
                    setId: AllDrugs[j]['name']
                });
            }
        }
    }

    drugsInfo = drugsToDisplay = getUniqueArray(drugsToDisplay);

    document.getElementById("drugsTabs").innerHTML = '';
    var drugTabs = '',
        drugTabsContent = '';

    // generating the drug tabs
    if (drugsToDisplay.length) {
        drugTabs = '<ul class="safetydrugTab-links">';
        drugTabsContent = '<div class="safetydrugTab-content">';
        for (i = 0; i < drugsToDisplay.length; i++) {
            var nodeEle = 'drugTab_' + (i + 1);
            drugTabs += '<li><a id=tabLink_' + (i + 1) + ' href=#' + nodeEle + '>' +
                drugsToDisplay[i].name + ''
            '</a></li>';
            drugTabsContent += '<div id=' + nodeEle + ' class="safetydrugTab"></div>';
        }
        drugTabs += '</ul>';
        drugTabsContent += '</div>';
        document.getElementById("drugsTabs").innerHTML = drugTabs;
        $(drugTabsContent).appendTo('#drugsTabs');
        $('#tabLink_1').parent('li').addClass('active').siblings().removeClass('active');
        $('#tabLink_1').parent('li').css('border-top-left-radius', '10px');
        $('#tabLink_1').css('border-top-left-radius', '10px');
        $('#drugTab_1').addClass('active').siblings().removeClass('active');
        var tabs = 0;
        while (tabs < drugsToDisplay.length) {
            var nodeEle = 'drugTab_' + (tabs + 1);
            displayResult(drugsToDisplay[tabs].setId, nodeEle);
            tabs++;
        }
    }
}
/* end of function */

/* Function to remove duplicate records from JSON array */
function getUniqueArray(List) {
    var cleaned = [];
    List.forEach(function(itm) {
        var unique = true;
        cleaned.forEach(function(itm2) {
            if (_.isEqual(itm, itm2)) unique = false;
        });
        if (unique) cleaned.push(itm);
    });
    return cleaned;
}
/* end of function */

function GenerateSafetyDetailMatrixChartSymtomsWithDrug(filterData) {
    var minValue = 94;
    var maxValue = 99;
    var color = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]
    var color1 = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
    var jsonData = retriveDrugDataToFillChart(filterData);
    $('#safety-chart-footer').css({
        display: "none"
    });
    $('#safety-chart').css({
        borderRadius: "0px"
    });
    var symtomsArray = ["Fatigue", "Nausea", "Insomnia", "Headache", "Diarrhea", "Pruritus", "Anemia", "Asthenia", "Rash"];
    var finaljsonData = [];
    for (var j = 0; j < symtomsArray.length; j++) {
        var drugData = {};
        var tipData = [];
        drugData["len"] = 30;
        drugData["color"] = color[j];
        drugData["label"] = symtomsArray[j];
        drugData["id"] = symtomsArray[j];
        for (var k = 0; k < jsonData.length; k++) {
            var tipJson = {};
            tipJson["asix"] = jsonData[k]["label"];
            tipJson["value"] = jsonData[k][symtomsArray[j]];
            tipJson["color"] = color1[k];
            drugData[jsonData[k]["label"]] = jsonData[k][symtomsArray[j]];
            tipData.push(tipJson);
        }
        drugData["tipData"] = tipData;
        drugData["Genotype"] = 1;
        drugData["Treatment"] = "Naive";
        drugData["TreatmentPeriod"] = "12 Weeks";
        drugData["Cirrhosis"] = "WO";
        drugData["Clinical Trial"] = 89 - j / 2;
        drugData["Real World Evidence"] = 84 - j / 2;
        drugData["SVR"] = 87 - j / 2;
        finaljsonData.push(drugData);
    }
    document.getElementById('safetyChartPriview').style.display = 'block';
    document.getElementById('safety-chart-parent').style.width = '550px';
    document.getElementById('safetyChart').style.minWidth = '200px';
    document.getElementById('safetyChart').style.width = '200px';
    var parant = d3.select("svg#safety-chart");
    parant.selectAll("*").remove();
    parant.style("text-align", "start");
    parant.attr("width", "550");
    var left = 0;
    var right = 0;
    var count = 0;
    for (var j = 0; j < finaljsonData.length; j++) {
        var popup = parant.append("g");
        var rect = popup.append("rect")
            .attr("class", "priviewGraphMatrix")
            .attr("x", left)
            .attr("y", right)
            .attr("width", 180)
            .attr("height", 230)
            .style("fill", "#CFE2CB")
            .style("stroke", "#CFE2CB")
            .style("stroke-width", 0)
            .style("opacity", 0.7)
            .attr("rx", 5)
            .attr("ry", 5);
        var w = 130;
        var h = 130;
        var tipData = finaljsonData[j].tipData;
        var xScale = d3.scale.ordinal()
            .domain(d3.range(tipData.length))
            .rangeRoundBands([0, w], 0.05);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(tipData, function(d) {
                return d.value;
            })])
            .range([0, h]);

        var asix = function(d) {
            return d.asix;
        };
        var color = function(d) {
            return d.color;
        };
        var titleText = popup.append("text")
            .text(' % ' + finaljsonData[j].label)
            .attr("text-anchor", "middle")
            .attr("x", left + 70)
            .attr("y", right + 20)
            //.attr("transform", "rotate(90)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "#000000");
        var svg = popup.append("g")
            .attr("data", finaljsonData[j].label + '-------' + JSON.stringify(tipData))
            .attr("width", w)
            .attr("class", 'svgContainer')
            .attr("height", h)
            .attr("transform", "translate(" + (left + 20) + "," + (right + 50) + ")");
        svg.selectAll("rect")
            .data(tipData, asix)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return xScale(i);
            })
            .attr("y", function(d) {
                return h - yScale(d.value);
            })
            .attr("width", xScale.rangeBand())
            .attr("height", function(d) {
                return yScale(d.value);
            })
            .attr("fill", function(d) {
                return d.color;
            })
        svg.selectAll("text")
            .data(tipData, asix)
            .enter()
            .append("text")
            .text(function(d) {
                return d.value;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
            })
            .attr("y", function(d) {
                return h - yScale(d.value) + 14;
            })
            //.attr("transform", "rotate(90)")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "#ffffff");
        if (count >= 2) {
            count = 0;
            left = 0;
            right = right + 240;
        } else {
            count++;
            left = left + 190;
        }
    }
    setTimeout(function() {
        d3.selectAll(".svgContainer")
            .on("mouseover", function(e) {
                var safetyChartPriview = document.getElementById('safetyChartPriview');
                var scrollTop = document.body.scrollTop;
                if (scrollTop < 262) {
                    safetyChartPriview.style.top = (400 - scrollTop) + 'px';
                } else if (scrollTop > 400) {
                    if (scrollTop > 490) {
                        safetyChartPriview.style.top = '-50px';
                    } else {
                        safetyChartPriview.style.top = '10px';
                    }
                } else {
                    safetyChartPriview.style.top = '100px';
                }
                var temp = $(this).attr('data').split('-------');
                var tipData = JSON.parse(temp[1]);
                var tipTitle = temp[0];
                var parant1 = d3.select("svg#safetyPriviewChart");
                parant1.attr('height', 600);
                popup1 = parant1.append("g");
                var rect = popup1.append("rect")
                    .attr("class", "priviewGraph")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 360)
                    .attr("height", 480)
                    .style("fill", "gray")
                    .style("stroke", "gray")
                    .style("stroke-width", 0)
                    .style("opacity", 0.7)
                    .attr("rx", 5)
                    .attr("ry", 5);
                //  var color1 = ["#4d525f","#f74649","#46bebc","#f7cf46","#95a2c1","#21486b","#94314d","#607329","#8c564b"];
                var color1 = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
                var w = 260;
                var h = 360;
                var xScale = d3.scale.ordinal()
                    .domain(d3.range(tipData.length))
                    .rangeRoundBands([0, w], 0.05);

                var yScale = d3.scale.linear()
                    .domain([0, d3.max(tipData, function(d) {
                        return d.value;
                    })])
                    .range([0, h]);

                var asix = function(d) {
                    return d.asix;
                };
                var color = function(d) {
                    return d.color;
                };
                var svg1 = popup1.append("g")
                    .attr("width", w)
                    .attr("height", h)
                    .attr("transform", "translate(" + 40 + "," + 70 + ")");
                svg1.selectAll("rect")
                    .data(tipData, asix)
                    .enter()
                    .append("rect")
                    .attr("x", function(d, i) {
                        return xScale(i);
                    })
                    .attr("y", function(d) {
                        return h - yScale(d.value);
                    })
                    .attr("width", xScale.rangeBand())
                    .attr("height", function(d) {
                        return yScale(d.value);
                    })
                    .attr("fill", function(d) {
                        return d.color;
                    })
                svg1.selectAll("text")
                    .data(tipData, asix)
                    .enter()
                    .append("text")
                    .text(function(d) {
                        return d.value;
                    })
                    .attr("text-anchor", "middle")
                    .attr("x", function(d, i) {
                        return xScale(i) + xScale.rangeBand() / 2;
                    })
                    .attr("y", function(d) {
                        return h - yScale(d.value) + 14;
                    })
                    .attr("width", xScale.rangeBand())
                    .attr("height", function(d) {
                        return yScale(d.value);
                    })
                    //.attr("transform", "rotate(90)")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "11px")
                    .attr("fill", "#ffffff");
                svg1.append("text")
                    .attr("fill", "red")
                    .attr('x', 80)
                    .attr('dy', -30)
                    .text('% ' + tipTitle);
                for (var j = 0; j < tipData.length; j++) {
                    var title = tipData[j].asix.split('+');
                    var barTitle = svg1.append("text")
                        .attr("fill", "#000000")
                        .attr("transform", "rotate(-90)")
                        .attr('x', -350)
                        .attr('dy', ((j + 1) * (260 / tipData.length) - ((260 / tipData.length) / 2)))
                        .text(tipData[j].asix);
                }
            })
            .on("mouseout", function() {
                if (popup1 !== null) {
                    popup1.remove();
                }
            });
    }, 1000);
}

function GenerateSafetyDetailCircularChartSymtomsWithDrug(filterData, dataFirst, dataLast) {
    var first = 0,
        last = 9;
    if (dataFirst) {
        first = dataFirst;
    }
    if (dataLast) {
        last = dataLast;
    }
    var minValue = 94;
    var maxValue = 99;
    var color = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]
    var color1 = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
    var jsonData = retriveDrugDataToFillChart(filterData);
    document.getElementById('safetyChartPriview').style.display = 'none';
    /*var symtomsArray = [];
    for (var z = 0; z < SafetyAdverseReactions.length; z++) {
        symtomsArray.push(SafetyAdverseReactions[z].symptom);
    }*/
    $('#safety-chart-footer').css({
        display: "block"
    });
    $('#safety-chart').css({
        borderRadius: "0px"
    });
    var colorCount = 0;
    var finaljsonData = [];
    for (var j = first; j < last; j++) {
        var drugData = {};
        if (j == 11 || j == 22 || j == 33 || j == 44 || j == 55) {
            colorCount = 0;
        }
        drugData["len"] = 30;
        drugData["color"] = color[colorCount];
        drugData["label"] = SafetyAdverseReactions[j].symptom;
        drugData["id"] = SafetyAdverseReactions[j].symptom;
        for (var k = 0; k < jsonData.length; k++) {
            if (jsonData[k][SafetyAdverseReactions[j].symptom]) {
                drugData[jsonData[k]["label"]] = jsonData[k][SafetyAdverseReactions[j].symptom];
            } else {
                drugData[jsonData[k]["label"]] = 0;
            }
        }
        drugData["Genotype"] = 1;
        drugData["Treatment"] = "Naive";
        drugData["TreatmentPeriod"] = "12 Weeks";
        drugData["Cirrhosis"] = "WO";
        drugData["Clinical Trial"] = 89 - j / 2;
        drugData["Real World Evidence"] = 84 - j / 2;
        drugData["SVR"] = 87 - j / 2;
        finaljsonData.push(drugData);
        colorCount++;
    }
    var circosChart = new circosJS({
        container: '#safety-chart',
        width: 800,
        height: 500,
        left: 160,
        right: 10
    });
    circosChart.layout({
            innerRadius: 240,
            outerRadius: 280,
            labels: {
                display: true,
                size: 17,
                radialOffset: 15
            },
            ticks: {
                display: false
            }
        },
        finaljsonData
    );

    circosChart.render();
    var color1 = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
    var tipData1 = [];
    for (var k = 0; k < jsonData.length; k++) {
        var tipJson = {};
        tipJson["asix"] = jsonData[k]["label"];
        tipJson["value"] = finaljsonData[0][jsonData[k]["label"]];
        tipJson["color"] = color1[k];
        tipData1.push(tipJson);
    }
    var containerSvg = d3.select("#safety-chart-footer");
    var containerSvgG = containerSvg.append("g").attr('data', JSON.stringify({
        "first": first,
        "last": last,
        "cursor": "next"
    })).style("cursor", "pointer");
    var containerSvgG1 = containerSvg.append("g").attr('data', JSON.stringify({
        "first": first,
        "last": last,
        "cursor": "privious"
    })).style("cursor", "pointer");
    var containerSvgG2 = containerSvg.append("g");
    var containerSvgNextRect = containerSvgG.append("rect")
        .attr("class", "nextBtn")
        .attr("x", 680)
        .attr("y", 90)
        .attr("width", 120)
        .attr("height", 50)
        .style("fill", "#ffffff")
        .style("stroke", "#000000")
        .style("stroke-width", 1)
        .style("opacity", 1)
        .attr("rx", 5)
        .attr("ry", 5);
    containerSvgG.on('click', function() {
        var svgDataForNext = JSON.parse($(this).attr('data'));
        renderCircularGraphData(filterData, SafetyAdverseReactions.length, svgDataForNext.first, svgDataForNext.last, svgDataForNext.cursor);
    });
    containerSvgG.append("text")
        .attr('x', 700)
        .attr('dy', 120)
        .attr("font-family", "sans-serif")
        .attr("font-size", "18px")
        .attr("fill", "#009cff")
        .text('Next >>');
    var containerSvgPreviousRect = containerSvgG1.append("rect")
        .attr("class", "priviousBtn")
        .attr("x", 100)
        .attr("y", 90)
        .attr("width", 120)
        .attr("height", 50)
        .style("fill", "#ffffff")
        .style("stroke", "#000000")
        .style("stroke-width", 1)
        .style("opacity", 1)
        .attr("rx", 5)
        .attr("ry", 5);
    containerSvgG1.on('click', function() {
        var svgDataForPrevious = JSON.parse($(this).attr('data'));
        renderCircularGraphData(filterData, SafetyAdverseReactions.length, svgDataForPrevious.first, svgDataForPrevious.last, svgDataForPrevious.cursor);
    });
    containerSvgG2.append("text")
        .attr('x', 350)
        .attr('dy', 120)
        .attr("font-family", "sans-serif")
        .attr("font-size", "18px")
        .attr("fill", "#009cff")
        .text('Showing : ' + first + ' To ' + last + ' Of ' + SafetyAdverseReactions.length);
    containerSvgG1.append("text")
        .attr('x', 110)
        .attr('dy', 120)
        .attr("font-family", "sans-serif")
        .attr("font-size", "18px")
        .attr("fill", "#009cff")
        .text('<< Previous');
    showInnerChartDataForCircle(finaljsonData[0], tipData1, "Symptoms");
    setTimeout(function() {
        d3.selectAll(".all g.cs-layout g")
            .on("mouseover", function(e) {
                if (popup !== null) {
                    popup.remove();
                }
                var color1 = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
                var tipData = [];
                for (var k = 0; k < jsonData.length; k++) {
                    var tipJson = {};
                    tipJson["asix"] = jsonData[k]["label"];
                    tipJson["value"] = e[jsonData[k]["label"]];
                    tipJson["color"] = color1[k];
                    tipData.push(tipJson);
                }
                showInnerChartDataForCircle(e, tipData, "Symptoms");
            })

        .on("mouseout", function() {
            // Remove the chart
            //document.getElementById('safetyChart').innerHTML = '';
            if (popup !== null) {
                popup.remove();
            }
        });
    }, 500);
}

function GenerateSafetyDetailCircularChartDrugWithSymtoms(filterData) {
    var minValue = 94;
    var maxValue = 99;
    $('#safety-chart-footer').css({
        display: "none"
    });
    $('#safety-chart').css({
        borderRadius: "0px"
    });
    var color = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]
    var color1 = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
    var jsonData = retriveDrugDataToFillChart(filterData);
    document.getElementById('safetyChartPriview').style.display = 'none';
    var circosChart = new circosJS({
        container: '#safety-chart',
        width: 800,
        height: 500,
        left: 160,
        right: 10
    });
    circosChart.layout({
            innerRadius: 240,
            outerRadius: 280,
            labels: {
                display: true,
                size: 15,
                radialOffset: 15
            },
            ticks: {
                display: false
            }
        },
        jsonData
    );

    circosChart.render();
    var svgParent = d3.select('#safety-chart');
    var defs = svgParent.append('defs');
    var filter = defs.append('filter')
        .attr('id', 'f4')
        .attr('width', '105%')
        .attr('height', '115%');
    filter.append('feOffset')
        .attr('result', 'offOut')
        .attr('in', 'SourceGraphic')
        .attr('dx', '-5')
        .attr('dy', '-5');
    filter.append('feColorMatrix')
        .attr('result', 'matrixOut')
        .attr('in', 'offOut')
        .attr('type', 'matrix')
        .attr('values', '0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0');
    filter.append('feGaussianBlur')
        .attr('result', 'blurOut')
        .attr('in', 'matrixOut')
        .attr('stdDeviation', '5');
    filter.append('feBlend')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'blurOut')
        .attr('mode', 'normal');
    var filter1 = defs.append('filter')
        .attr('id', 'f3')
        .attr('width', '200%')
        .attr('height', '200%');
    filter1.append('feOffset')
        .attr('result', 'offOut')
        .attr('in', 'SourceAlpha')
        .attr('dx', '5')
        .attr('dy', '5');
    filter1.append('feGaussianBlur')
        .attr('result', 'blurOut')
        .attr('in', 'offOut')
        .attr('stdDeviation', '10');
    filter1.append('feBlend')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'blurOut')
        .attr('mode', 'normal');
    var filter2 = defs.append('filter')
        .attr('id', 'f2')
        .attr('width', '200%')
        .attr('height', '200%');
    filter2.append('feOffset')
        .attr('result', 'offOut')
        .attr('in', 'SourceGraphic')
        .attr('dx', '10')
        .attr('dy', '10');
    filter2.append('feGaussianBlur')
        .attr('result', 'blurOut')
        .attr('in', 'offOut')
        .attr('stdDeviation', '10');
    filter2.append('feBlend')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'blurOut')
        .attr('mode', 'normal');
    //if single drug is selected
    if (jsonData.length == 1) {
        d3.selectAll('#' + jsonData[0]['id']).attr('fill', 'transparent').attr("stroke", "none");
        var eles = d3.selectAll('#arc-label' + jsonData[0]['id']);
        eles.attr("stroke", jsonData[0]['color']);
        eles.attr("stroke-width", "30px");
    }


    jsonData[0].Reactions.sort(function(a, b) {
        return parseFloat(b.value) - parseFloat(a.value);
    });
    var arc = $('.all g.cs-layout g');
    for (var a = 0; a < arc.length; a++) {
        if (jsonData[0]['id'] == $(arc[a]).attr('class')) {
            $(arc[a]).attr("filter", "url(#f3)");
        }
    }
    showInnerChartDataForCircle(jsonData[0], jsonData[0].Reactions, "Drugs");
    setTimeout(function() {
        d3.selectAll(".all g.cs-layout g")
            .on("click", function(e) {
                if (popup !== null) {
                    popup.remove();
                }
                $('.all g.cs-layout g').removeAttr("filter");
                $(this).attr("filter", "url(#f3)");
                e.Reactions.sort(function(a, b) {
                    return parseFloat(b.value) - parseFloat(a.value);
                });
                showInnerChartDataForCircle(e, e.Reactions, "Drugs");
            });
    }, 500);
}

function renderCircularGraphInnerData(e, tipData, len, first, last, svgData) {
    if (svgData == 'next') {
        if (last >= len) {
            first = len - 9;
            last = len;
        } else {
            if ((last + 9) >= len) {
                first = len - 9;
                last = len;
            } else {
                first = first + 9;
                last = last + 9
            }
        }
    } else {
        if (first <= 0) {
            first = 0;
            last = 9;
        } else {
            if ((first - 9) <= 0) {
                first = 0;
                last = 9;
            } else {
                first = first - 9;
                last = last - 9
            }
        }
    }
    setTimeout(function() {
        if (popup !== null) {
            popup.remove();
        }
        showInnerChartDataForCircle(e, tipData, '', first, last);
    }, 500);
}

function showInnerChartDataForCircle(e, tipData, flag, dataFirst, dataLast) {
    var first = 0,
        last = tipData.length;
    if (dataFirst) {
        first = dataFirst;
    }
    if (dataLast) {
        last = dataLast;
    } else if (last > 9) {
        last = 9;
    }
    var testData = [];
    for (var k = first; k < last; k++) {

        tipData[k]['label'] = tipData[k]['value'];
        tipData[k]['value'] = tipData[k]['value'];
        testData.push(tipData[k]);
    }
    // check if the last bar value is small then increase the bar size by 2
    var flag = false;
    for (var k = 0; k < testData.length; k++) {
        if (testData[k].label == 1) {
            flag = true;
            break;
        }
    }
    if (flag) {
        for (var k = 0; k < testData.length; k++) {
            testData[k]['value'] = testData[k]['value'] + 2;
        }
    }
    var parant = d3.select("g.all");
    popup = parant.append("g");
    var w = 290;
    var h = 290;
    var xScale = d3.scale.ordinal()
        .domain(d3.range(testData.length))
        .rangeRoundBands([0, w], 0.05);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(testData, function(d) {
            return d.value;
        })])
        .range([0, 280]);

    var asix = function(d) {
        return d.asix;
    };
    var color = function(d) {
        return d.color;
    };
    var svg1 = popup.append("g")
        .attr("width", w)
        .attr("height", h)
        .attr("transform", "translate(" + (140) + "," + (-145) + ")");

    var svg = svg1.append("g")
        .attr("width", w)
        .attr("height", h)
        .attr("transform", "rotate(90)");
    svg.selectAll("rect")
        .data(testData, asix)
        .enter()
        .append("rect")
        .attr("class", "shadow")
        .attr("x", function(d, i) {
            return xScale(i);
        })
        .attr("y", function(d) {
            return h - yScale(d.value);
        })
        .attr("width", 30)
        .attr("height", function(d) {
            return yScale(d.value);
        })
        .attr("fill", function(d) {
            return d.color;
        })
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("filter", "url(#f4)");
    var tempCount = -1;
    for (var j = 0; j < testData.length; j++) {
        var title = testData[j].asix.split('+');
        var barTitle = svg.append("text")
            .attr("fill", "#000000")
            .attr("transform", "rotate(-90)")
            .attr('x', -280)
            .attr('dy', ((j + 1) * (290 / testData.length) - ((290 / testData.length) / 2)) + 5)
            .attr("font-family", "sans-serif")
            .attr("font-size", "13px")
            .attr("fill", "#ffffff")
            .text(testData[j].asix.length > 25 ? (testData[j].asix).substring(0, 20) + '...' : testData[j].asix)
            .append("tspan")
            .attr("fill", "#ffffff")
            .attr('x', function(d) {
                return '-' + (h - yScale(testData[j].value) + 40);
            })
            .attr('dy', 0)
            .text('(' + testData[j].label + '%)');
    }
    var lableForInnerChart = e.label.split(' + ');
    if ((e.label).length > 30) {
        svg1.append("text")
            .attr('width', 200)
            .attr('x', -200)
            .attr('dy', -40)
            .attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("fill", "#828282")
            .text(lableForInnerChart[0] + ' + ' + lableForInnerChart[1])
            .append("tspan")
            .attr('x', -190)
            .attr('dy', 20)
            .text(lableForInnerChart[2])
    } else {
        svg1.append("text")
            .attr('width', 200)
            .attr('x', (e.label).length > 20 ? -260 : -200)
            .attr('dy', -40)
            .attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("fill", "#828282")
            .text(e.label);
    }

    var previousParent = svg1.append("g")
        .attr('data', JSON.stringify({
            "first": first,
            "last": last,
            "cursor": "previous"
        }));
    if (first != 0) {
        previousParent.on('click', function() {
            var svgDataForPrevious = JSON.parse($(this).attr('data'));
            renderCircularGraphInnerData(e, tipData, tipData.length, svgDataForPrevious.first, svgDataForPrevious.last, svgDataForPrevious.cursor);
        });
    }
    var previous = previousParent.append("g")
        .attr('class', 'arrow left')
        .attr('width', 30)
        .attr('height', 42)
        .attr('viewBox', "0 0 50 80")
        .attr('transform', 'translate(-345,100)');
    if (first == 0) {
        previous.append("image")
            .attr('xlink:href', 'back-d.png')
            .attr('width', 30)
            .attr('height', 42);
    } else {
        previous.append("image")
            .attr('xlink:href', 'back-a.png')
            .attr('width', 30)
            .attr('height', 42);
    }
    var nextParent = svg1.append("g")
        .attr('data', JSON.stringify({
            "first": first,
            "last": last,
            "cursor": "next"
        }));
    if (last != tipData.length) {
        nextParent.on('click', function() {
            var svgDataForPrevious = JSON.parse($(this).attr('data'));
            renderCircularGraphInnerData(e, tipData, tipData.length, svgDataForPrevious.first, svgDataForPrevious.last, svgDataForPrevious.cursor);
        });
    }
    var next = nextParent.append("g")
        .attr('class', 'arrow right')
        .attr('width', 30)
        .attr('height', 42)
        .attr('viewBox', "0 0 50 80")
        .attr('transform', 'translate(20,100)');
    if (last == tipData.length) {
        next.append("image")
            .attr('xlink:href', 'next-d.png')
            .attr('width', 30)
            .attr('height', 42);
    } else {
        next.append("image")
            .attr('xlink:href', 'next-a.png')
            .attr('width', 30)
            .attr('height', 42);
    }

    if (first == 0) {
        svg1.append("text")
            .attr('x', -240)
            .attr('dy', 330)
            .attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("fill", "#828282")
            .text('Showing : ')
            .append("tspan")
            .attr('x', -150)
            .attr('dy', 2)
            .attr("fill", "orange")
            .text((first + 1) + '-' + last)
            .append("tspan")
            .attr('x', -120)
            .attr('dy', 0)
            .attr("fill", "#828282")
            .text(' of ')
            .append("tspan")
            .attr('x', -90)
            .attr('dy', 0)
            .attr("fill", "blue")
            .text(tipData.length);
    } else {
        svg1.append("text")
            .attr('x', -240)
            .attr('dy', 330)
            .attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("fill", "#828282")
            .text('Showing : ')
            .append("tspan")
            .attr('x', -150)
            .attr('dy', 2)
            .attr("fill", "orange")
            .text((first + 1) + '-' + last)
            .append("tspan")
            .attr('x', -100)
            .attr('dy', 0)
            .attr("fill", "#828282")
            .text(' of ')
            .append("tspan")
            .attr('x', -70)
            .attr('dy', 0)
            .attr("fill", "blue")
            .text(tipData.length);
    }
}

function retriveDrugDataToFillChart(filterData) {
    var reactionsData = PatientReactions.reactive();
    var jsonData = [];
    var treatmentFiltered = [];

    // Math.floor(Math.random() * ((y-x)+1) + x);
    var selectedDrugName = filterData && filterData.length > 0 ? filterData : [];
    //var selectedDrugName = JSON.parse(sampleData);
    //console.log("Selected Drug length" + selectedDrugName.length);
    if (selectedDrugName.length > 0) {

        var allDrugData = JSON.parse(localStorage.AllDrugsData);

        var filterDrugs = allDrugData.filter(function(d) {
            if (selectedDrugName.indexOf(d.DrugName) > -1) {
                return true;
            } else {
                return false;
            }
        });
        var color = ["#8dd3c7", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f", "#ffffb3"]
        var color1 = ["#7da7d9", "#df9b9b", "#c4df9b", "#6dcff6", "#fbaf5d", "#8781bd", "#c7b299", "#82ca9c", "#acacac"];
        for (var i = 0; i <= selectedDrugName.length - 1; i++) {
            var drugData = {};


            $('.data-conatainer').show();
            $('.efficacy-warning').hide();
            // generate dynamic data for tabs
            var Reactions = [];

            treatmentFiltered = reactionsData.filter(function(record) {
                var medication = record.medication + ' (' + record.treatment_Period + 'W)';
                return medication == selectedDrugName[i];
            });

            // fill array to display in the chart
            drugData['Medication'] = selectedDrugName[i];
            var colorCount = 0;
            for (var j = 0; j < SafetyAdverseReactions.length; j++) {
                var reactionCount = treatmentFiltered.filter(function(record) {
                    return record.ar_id == SafetyAdverseReactions[j].reaction_id;
                });
                var value = (reactionCount.length / SafetyAdverseReactions.length) * 100;
                if (reactionCount.length > 0) {
                    var json = {};
                    json['asix'] = SafetyAdverseReactions[j].reaction;
                    json['value'] = parseInt(value);
                    json['color'] = color[colorCount];
                    colorCount++;
                    if (colorCount > 9)
                        colorCount = 0;
                    Reactions.push(json);
                }
            }
            drugData['Reactions'] = Reactions;
            drugData['len'] = selectedDrugName[i].length;
            drugData['color'] = color[i];
            drugData['label'] = selectedDrugName[i];
            var labelID = selectedDrugName[i].split(' + ').join('').split(' ').join('').split('(').join('').split(')').join('');
            drugData['id'] = labelID;
            jsonData.push(drugData);

        }
    }
    console.log(jsonData);
    return jsonData;
}

function renderCircularGraphData(filterData, len, first, last, svgData) {
    var obj = $('#safety-chart');
    if (svgData == 'next') {
        if (last >= len) {
            first = len - 9;
            last = len;
        } else {
            if ((last + 9) >= len) {
                first = len - 9;
                last = len;
            } else {
                first = first + 9;
                last = last + 9
            }
        }
        obj.css({
            borderRadius: "200px"
        });
        obj.stop().animateRotate(-180, {
            duration: 1000,
            complete: function() {
                obj.animateRotate(0, {
                    duration: 1000
                });
            }
        });
    } else {
        if (first <= 0) {
            first = 0;
            last = 9;
        } else {
            if ((first - 9) <= 0) {
                first = 0;
                last = 9;
            } else {
                first = first - 9;
                last = last - 9
            }
        }
        obj.css({
            borderRadius: "200px"
        });
        obj.stop().animateRotate(180, {
            duration: 1000,
            complete: function() {
                obj.animateRotate(0, {
                    duration: 1000
                });
            }
        });
    }
    setTimeout(function() {
        d3.select('#safety-chart-footer').selectAll("*").remove();
        GenerateSafetyDetailCircularChartSymtomsWithDrug(filterData, first, last);
    }, 2000);
}

function GenerateSafetyDetail(filterData) {


    var minValue = 94;
    var maxValue = 99;
    var jsonData = [];
    var sampleJson = {
        "Medication": "Harvoni",
        "Genotype": 1,
        "Treatment": "Naive",
        "TreatmentPeriod": "12 Weeks",
        "Cirrhosis": "WO",
        "Clinical Trial": 98,
        "Real World Evidence": 95.3,
        "SVR": 98,

        "Real World Evidence Fatigue": 98,
        "Real World Evidence Nausea": 95.3,
        "Real World Evidence Insomnia": 98,
        "Real World Evidence Headache": 98,
        "Real World Evidence Diarrhea": 95.3,


    };

    // Math.floor(Math.random() * ((y-x)+1) + x);
    var selectedDrugName = filterData && filterData.length > 0 ? filterData : [];
    //var selectedDrugName = JSON.parse(sampleData);
    //console.log("Selected Drug length" + selectedDrugName.length);
    if (selectedDrugName.length > 0) {

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
            drugData["Genotype"] = 1;
            drugData["Treatment"] = "Naive";
            drugData["TreatmentPeriod"] = "12 Weeks";
            drugData["Cirrhosis"] = "WO";
            drugData["Clinical Trial"] = 89 - i / 2;
            drugData["Real World Evidence"] = 84 - i / 2;
            drugData["SVR"] = 87 - i / 2;
            drugData["Fatigue"] = 22 - i / 2;
            drugData["Nausea"] = 23 - i / 2;
            drugData["Insomnia"] = 18 - i / 2;
            drugData["Headache"] = 25 - i / 2;
            drugData["Diarrhea"] = 24 - i / 2;

            drugData["Pruritus"] = 24 - i / 2;
            drugData["Anemia"] = 20 - i / 2;
            drugData["Asthenia"] = 13 - i / 2;
            drugData["Rash"] = 5 - i / 2;

            jsonData.push(drugData);

        }
        var chartHeight = jsonData.length * 200;

        $('.safetyAdverseSection').css('height', chartHeight + 50);
        var chart = c3.generate({

            bindto: '#safety-chart',
            size: {
                height: chartHeight,
            },
            data: {
                //Set X- axis label
                json: jsonData,
                keys: {
                    x: 'Medication', // it's possible to specify 'x' when category axis
                    value: ["Fatigue", "Headache", "Nausea", "Insomnia", "Pruritus", "Anemia", "Diarrhea", "Asthenia", "Rash"]
                },
                type: 'bar',
                labels: {
                    format: function(value, name, i, j) {
                        return value + '% - ' + name;
                    }
                },
            },
            bar: {
                /*width: {
                    ratio: 0.5 // this makes bar width 50% of length between ticks
                }*/
                width: 15
            },
            tooltip: {
                grouped: true,
            },
            legend: {
                //position: 'right',
                position: 'inset',
                inset: {
                    anchor: 'top-right',
                    x: 20,
                    y: 10,
                    step: 5
                }
            },
            color: {
                //pattern: ['#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#4472C4', '#70AD47', '#255E91', '#9E480E', '#636363', '#997300', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
                pattern: ['#4d525f', '#f74649', '#46bebc', '#f7cf46', '#95a2c1', '#f78d46', '#21486b', '#94314d', '#607329', '#e74d00', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
            },
            axis: {
                rotated: true,
                x: {
                    type: 'categorized',
                },
                y: {
                    label: {
                        text: '% of Adverse Reactions',
                        position: 'outer-center'
                    },
                    tick: {
                        format: function(v) {
                            return v + '%';
                        }
                    },

                    max: 50,
                    min: 0,
                    // Range includes padding, set 0 if no padding needed
                    padding: {
                        top: 0,
                        bottom: 0
                    }
                }
            }
        });

        //// custom tooltip for c3 graph
        d3.selectAll('.c3-axis-x>.tick')
            .append('title')
            .text(function(d) {
                return d < selectedDrugName.length ? selectedDrugName[d] : '';
            });
        // set minimum height for scroll in drug selection slide
        $('.eff-sideboxdiv').css('height', ($('.slidesec').height() + 30));

    } else {

        $('.data-conatainer').hide();
        $('.efficacy-warning').show();
        //$('.cbContainer').hide();

        //Hide table as well as graph

    }

}




// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.

function Hilitor(id, tag) {

    var targetNode = document.getElementById(id) || document.body;
    var hiliteTag = tag || "EM";
    var skipTags = new RegExp("^(?:" + hiliteTag + "|SCRIPT|FORM|SPAN)$");
    var colors = ["#ff6", "#a0ffff", "#9f9", "#f99", "#f6f"];
    var wordColor = [];
    var colorIdx = 0;
    var matchRegex = "";
    var openLeft = false;
    var openRight = false;

    this.setMatchType = function(type) {
        switch (type) {
            case "left":
                this.openLeft = false;
                this.openRight = true;
                break;
            case "right":
                this.openLeft = true;
                this.openRight = false;
                break;
            case "open":
                this.openLeft = this.openRight = true;
                break;
            default:
                this.openLeft = this.openRight = false;
        }
    };

    this.setRegex = function(input) {
        input = input.replace(/^[^\w]+|[^\w]+$/g, "").replace(/[^\w'-]+/g, "|");
        var re = "(" + input + ")";
        if (!this.openLeft) re = "\\b" + re;
        if (!this.openRight) re = re + "\\b";
        matchRegex = new RegExp(re, "i");
    };

    this.getRegex = function() {
        var retval = matchRegex.toString();
        retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, "");
        retval = retval.replace(/\|/g, " ");
        return retval;
    };

    // recursively apply word highlighting
    this.hiliteWords = function(node) {
        if (node === undefined || !node) return;
        if (!matchRegex) return;
        if (skipTags.test(node.nodeName)) return;

        if (node.hasChildNodes()) {
            for (var i = 0; i < node.childNodes.length; i++)
                this.hiliteWords(node.childNodes[i]);
        }
        if (node.nodeType == 3) { // NODE_TEXT
            if ((nv = node.nodeValue) && (regs = matchRegex.exec(nv))) {
                if (!wordColor[regs[0].toLowerCase()]) {
                    wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
                }

                var match = document.createElement(hiliteTag);
                match.appendChild(document.createTextNode(regs[0]));
                match.style.backgroundColor = wordColor[regs[0].toLowerCase()];
                match.style.fontStyle = "inherit";
                match.style.color = "#000";

                var after = node.splitText(regs.index);
                after.nodeValue = after.nodeValue.substring(regs[0].length);
                node.parentNode.insertBefore(match, after);
            }
        };
    };

    // remove highlighting
    this.remove = function() {
        var arr = document.getElementsByTagName(hiliteTag);
        while (arr.length && (el = arr[0])) {
            var parent = el.parentNode;
            parent.replaceChild(el.firstChild, el);
            parent.normalize();
        }
    };

    // start highlighting at target node
    this.apply = function(input) {
        this.remove();
        if (input === undefined || !input) return;
        this.setRegex(input);
        this.hiliteWords(targetNode);
    };

}

//scroll to a particular element/section
function scrollToId(id) {
    let ele = $('html,body');
    let targetElmOffset = $("#" + id).offset().top;
    if (window.location.pathname.toLowerCase() == "/payer") {
        ele = $('.popup-body');
        targetElmOffset -= 130;
    }
    $(ele).animate({
        scrollTop: targetElmOffset
    }, 'slow');
}



//function to render link back to payer tab
function renderBackLinkToPharma() {
    var html = '<div class="safetyBackLinkSection">' +
        '<span>Back to  </span>' +
        '<span class="tabNametoGo"> Pharma </span>' +
        '<span> tab </span>' +
        '</div>';
    // var html = `  <div class="cpbackbtn">
    //                             <a href="{{pathFor 'Pharma/RWEBenchmark'}}" class="compareDrugbackbtn"><span class="compareDrugbackbtnIcon"><i class="fa fa-chevron-left" aria-hidden="true"></i></span>Back To Pharma</a>
    //                         </div>`;

    $('#safetyLinkToBack').html();
    $('#safetyLinkToBack').html(html);

    assignEventToBackPharmaLink();
}


//function to assign event to back link
function assignEventToBackPharmaLink() {
    $('.safetyBackLinkSection .tabNametoGo').click(function() {

        $('#safetyLinkToBack').html();
        //route back to payer tab
        window.location = 'javascript:Router.go("Pharma/RWEBenchmark");';
    });
}

//function to render link back to payer tab
function renderBackLinkToPayer() {
    var payerTabInfo = AmdApp['payer']['safetyTabInfo'];

    //if is rendered from safety tab
    if (payerTabInfo) {
        if (payerTabInfo.isFromPayerTab) {
            var html = '<div class="safetyBackLinkSection">' +
                '<span>Back to  </span>' +
                '<span class="tabNametoGo">' + payerTabInfo.tabName + '</span>' +
                '<span> tab </span>' +
                '</div>';


            $('#safetyLinkToBack').html();
            $('#safetyLinkToBack').html(html);

            assignEventToBackLink();
        }
    }
}

//function to assign event to back link
function assignEventToBackLink() {
    $('.safetyBackLinkSection .tabNametoGo').click(function() {

        $('#safetyLinkToBack').html();
        //route back to payer tab
        window.location = 'javascript:Router.go("Payer");';
    });
}