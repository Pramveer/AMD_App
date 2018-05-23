//function to remove obj from array
Array.prototype.removeValue = function(name, value) {
    var array = $.map(this, function(v, i) {
        return v[name] === value ? null : v;
    });
    this.length = 0; //clear original array
    this.push.apply(this, array); //push all elements except the one we want to delete
}

//function to return comma Seperated values
commaSeperatedNumber = function(val) {
    if (val) {
        while (/(\d+)(\d{3})/.test(val.toString())) {
            val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
        }
    }
    return val;
}

//function to find average of array list
Array.prototype.average = function() {
    var sum = 0;
    var j = 0;
    for (var i = 0; i < this.length; i++) {
        if (isFinite(this[i])) {
            sum = sum + parseFloat(this[i]);
            j++;
        }
    }
    if (j === 0) {
        return 0;
    } else {
        return sum / j;
    }
}


//function to find sum of array list
Array.prototype.sum = function() {
    var sum = 0;
    var j = 0;
    for (var i = 0; i < this.length; i++) {
        if (isFinite(this[i])) {
            sum = sum + parseFloat(this[i]);
            j++;
        }
    }
    if (j === 0) {
        return 0;
    } else {
        return sum;
    }
}


sortNumber = function(a, b) {
    return a - b;
}



// function to make safety visible on Header
displaySafetyOnHeader = function() {
    // check if safety link already exist or not
    var eleExists = $("#headerNavBar li").children("a[href$='/Safety']");
    if (eleExists.length === 0) {
        var html = '<li><a href="/Safety" class="NavigateUrlByTabDesk">Safety</a><div class="orangeborder"></div></li>';
        $(html).insertAfter("#headerNavBar li:eq(4)");
        $('.top-navigation').css('width', '960px');

        // get all elements in the nav bar and change their width
        // var allListEle = $('#headerNavBar li');
        // var parentWidth = $('#headerNavBar').css('width');
        // parentWidth = parentWidth.replace('px', '');
        // var childWidth = (parseInt(parentWidth) / (allListEle.length - 1)) - 50+ 'px';
        // for (var index = 0; index < allListEle.length; index++) {
        //     $(allListEle[index]).css('width', childWidth);
        // }
    }
}


getSafetyRiskInfo = function(setId, sectionName, isFromPayer) {

    var xslFile = "";

    if (sectionName.sectionName === "DI") {
        xslFile = "/data/safetyDrugInteractionSection.xsl";
        elementClass = "DICapsule";
    } else if (sectionName.sectionName === "CI") {
        xslFile = "/data/safetyContraIndicationSection.xsl";
        elementClass = "CICapsule";
    }

    if(!setId){
        if (isFromPayer) {
            $(isFromPayer).html('<div class="providerNoDataFound">No data found.</div>');
        } else {
            $(sectionName.frameObj).contents().find("body").html('<div class="providerNoDataFound">No data found.</div>');
        }
        return;
    }

    $.ajax({
        url: '/data/' + setId + '.xml',
        dataType: 'text',
        timeout: 120000,
        success: function(result) {
            result = result.replace('<document xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 http://www.accessdata.fda.gov/spl/schema/spl.xsd">', '<document>');
            result = result.replace(/\xsi:/g, '');
            result = result.replace(/\paragraph/g, 'p');
            result = result.replace(/\list/g, 'ul');
            result = result.replace(/\item/g, 'li');
            result = result.replace(/\linkHtml/g, 'a');
            var resultXml = $.parseXML(result);
            //console.log(resultXml);
            $.ajax({
                url: xslFile,
                timeout: 60000,
                success: function(xslResult) {
                    //COMMENTED OLD XSLT PARSING CODE
                    // var xsltProcessor = new XSLTProcessor();
                    // xsltProcessor.importStylesheet(xslResult);
                    // resultDocument = xsltProcessor.transformToFragment(resultXml, document);
                    //
                    if (isFromPayer) {
                        $('.' + elementClass).attr('data-content', "");
                        $('.' + elementClass).attr('data-content', "Loading...");
                    }

                    //COMMENTED OLD XSLT PARSING CODE
                    // // http://jsfiddle.net/44RvK/
                    // var xmlAsString = new XMLSerializer().serializeToString(resultDocument);



                    var xmlAsString;
                    if (window.ActiveXObject || "ActiveXObject" in window) {
                        console.log("IE Browser");
                        xmlAsString = ActiveXObject_PR(xslResult, resultXml);
                        //console.log(xmlAsString);
                    } else {
                        //console.log("OTHER than IE Browser");
                        xmlAsString = xsltProcessor_PR(xslResult, resultXml);
                    }

                    setTimeout(function() {
                        if (isFromPayer) {
                            $(isFromPayer).html(xmlAsString);
                        } else {
                            // $('.' + elementClass).attr('html', true);
                            // $('.' + elementClass).attr('data-content', `<div class='cust-popup-box'><div class='cust-popup-title'> <span>Real World Evidence <span class='totalPatientsCount'>({{totalPatients}} Patients)</span></span></div>
                            // <div class='cust-popup-content'>${xmlAsString}</div></div>`);
                            // var popover = $('.' + elementClass).data('bs.popover');
                            // popover.setContent();
                            // popover.$tip.addClass(popover.options.placement);
                            $(sectionName.frameObj).contents().find("body").html(xmlAsString);
                            //console.log(xmlAsString);
                            //bind click event to frame
                            $(sectionName.frameObj).contents().find("a.lr-hr-moreInfo").click(function(event) {
                                var drug = $(event.currentTarget).attr('drug');
                                var section = $(event.currentTarget).attr('section');
                                localStorage.setItem('DrugName', drug);
                                localStorage.setItem('SafetySection', section);

                                displaySafetyOnHeader();
                                window.location = 'javascript:Router.go("Safety");';
                            });
                        }
                    }, 500);

                },
                error: function(xhr, textStatus, errorThrown) {
                    console.log(xhr);
                }
            });
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log(xhr);
        }
    });
}


// Scroll smoothly to an element
smooth_scroll_to = function(elem) {
    var offset = 0;
    offset = $(elem).offset().top;
    $('html, body').animate({
        scrollTop: offset
    }, 550);
}

sortArrOfObjectsByParam = function(arrToSort, strObjParamToSortBy, sortAscending) {
    if (sortAscending == undefined) sortAscending = true; // default to true

    if (sortAscending) {
        arrToSort.sort(function(a, b) {
            return parseFloat(a[strObjParamToSortBy]) > parseFloat(b[strObjParamToSortBy]);
        });
    } else {
        arrToSort.sort(function(a, b) {
            return parseFloat(a[strObjParamToSortBy]) < parseFloat(b[strObjParamToSortBy]);
        });
    }
}

ActiveXObject_PR = function(xsl, xml) {
    var srcTree = new ActiveXObject("Msxml2.DOMDocument");
    srcTree.async = false;
    // You can substitute other XML file names here.
    srcTree.load(xml);

    var xsltTree = new ActiveXObject("Msxml2.DOMDocument");
    xsltTree.async = false;
    // You can substitute other XSLT file names here.
    xsltTree.load(xsl);

    return srcTree.transformNode(xsltTree);
}

xsltProcessor_PR = function(xslResult, resultXml) {
    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslResult);
    resultDocument = xsltProcessor.transformToFragment(resultXml, document);
    return new XMLSerializer().serializeToString(resultDocument);
}

//Refrence from https://jsfiddle.net/0o75bw43/1/
roundPercentages = function(l, target) {
    var off = target - _.reduce(l, function(acc, x) {
        return acc + Math.round(x)
    }, 0);
    let alreadySubstracted = false;
    let substraction = false;
    return _.chain(l).
    map(function(x, i) {
        lastSubstraction = (i >= (l.length + off)) && !lastButOneSubstraction;
        lastButOneSubstraction = (l[i + 1] == 0 && i + 1 >= (l.length + off) && !(i >= (l.length + off)));

        return Math.round(x) + (off > i) - (lastSubstraction || lastButOneSubstraction)
    }).
    value();
}


//function to get range of values to exact target value
roundToExact100 = function(l, target, identifier, key) {
        var off = target - _.reduce(l, function(acc, x) {
            return acc + Math.round(x[identifier][key])
        }, 0);
        return _.chain(l).
            //sortBy(function(x) { return Math.round(x.a) - x.a }).
        map(function(x, i) {
            return Math.round(x[identifier][key]) + (off > i) - (i >= (l.length + off))
        }).
        value();
    }
    //function to get range of values to exact target value
roundToExactUtilization100 = function(l, target, identifier, key) {
    var off = target - _.reduce(l, function(acc, x) {
        return acc + Math.round(x[identifier][key])
    }, 0);
    return _.chain(l).
        //sortBy(function(x) { return Math.round(x.a) - x.a }).
    map(function(x, i) {
        return Math.round(x[identifier][key]) + (off > i) - (i >= (l.length + off))
    }).
    value();
}

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 06-Apr-2017
 * @desc: Find new function for convert decimal place with position without rounding off
 * WE ARE FACING ISSUE WITH CALCULATION UTILIZATION WHICH GO BEYOND 100% 
 * Reference link : http://stackoverflow.com/questions/4187146/display-two-decimal-places-no-rounding
 * For Two decimal placement
 * Convert the number into a string, match the number up to the second decimal place:
 * var with2Decimals = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
 * original author : http://stackoverflow.com/users/53114/gumbo
 */
toFixedWithoutRound = (num, fixed) => {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
};


// Used to round the percentages in the circles
roundPercent = function(pScore) {
        if (pScore == 0 || pScore == 'NA') {
            return 0;
        }
        var convertToInt = parseInt(pScore);
        var remainder = pScore % convertToInt;
        if (remainder == 0) {
            return convertToInt;
        }

        return parseFloat(pScore).toFixed(2);
    }
    //Highlight active tab
highLightTab = function(name) {
    var nav = document.getElementsByClassName('NavigateUrlByTabDesk');

    for (var i = 0; i < nav.length; i++) {
        if (nav[i].innerHTML.trim().toLowerCase() == name.toLowerCase()) {
            nav[i].parentNode.className = 'active';
        } else {
            nav[i].parentNode.className = '';
        }
    }
}


//function to export patients data
exportPatientsData = (obj, data, fileName) => {
    //var patientCount = $('.unTreatedPatSliderCount').html();
    //patientCount = parseInt(patientCount);
    var patientsData = [];
    patientsData = jQuery.extend(true, [], data);
    //patientsData.splice(patientCount);

    //Generate a file name
    fileName = fileName || "PatientsData";
    let showLabel = true;

    // //remove category_id from patients
    // for (var i = 0; i < patientsData.length; i++) {
    //     delete patientsData[i]['category_id'];
    // }


    //reference http://jsfiddle.net/hybrid13i/JXrwM/

    //If patientsData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof patientsData != 'object' ? JSON.parse(patientsData) : patientsData;

    var CSV = '';

    //This condition will generate the Label/Header
    if (showLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index.toUpperCase() + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName = fileName.replace(/ /g, "_");

    //Initialize file format you want csv or xls
    var uri = 'data:text/xls;charset=utf-8,' + escape(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".xls";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}


convertFirstLetterCaps = (str) => {
    if (str) {
        let lower = str.toLowerCase();
        return lower.replace(/(^| )(\w)/g, function(x) {
            return x.toUpperCase();
        });
    }
}

isFloat = (n) => {
    return Number(n) === n && n % 1 !== 0;
}

getCurrentPopulationFilters = () => {
    let filters = AmdApp.Filters,
        othersFilters = {
            age: getArrFromFormattedStr(filters == undefined ? '' : filters.age), //filters.age || [],
            alcohol: getArrFromFormattedStr(filters == undefined ? '' : filters.alcohol),
            apri: getArrFromFormattedStr(filters == undefined ? '' : filters.apri), //filters.apri || [],
            chemistry: getArrFromFormattedStr(filters == undefined ? '' : filters.chemistry),
            ethinicity: getArrFromFormattedStr(filters == undefined ? '' : filters.ethinicity),
            etoh: getArrFromFormattedStr(filters == undefined ? '' : filters.etoh), // filters.etoh || [],
            fibroscan: getArrFromFormattedStr(filters == undefined ? '' : filters.fibroscan),
            fibrosure: getArrFromFormattedStr(filters == undefined ? '' : filters.fibrosure),
            hcc: getArrFromFormattedStr(filters == undefined ? '' : filters.hcc),
            hiv: getArrFromFormattedStr(filters == undefined ? '' : filters.hiv),
            liverBiopsy: getArrFromFormattedStr(filters == undefined ? '' : filters.liverBiopsy),
            liverAssesment: getArrFromFormattedStr(filters == undefined ? '' : filters.liver_assesment),
            meld: getArrFromFormattedStr(filters == undefined ? '' : filters.meld), //filters.meld || [],
            mentalHealth: getArrFromFormattedStr(filters == undefined ? '' : filters.mental_health),
            renalFailure: getArrFromFormattedStr(filters == undefined ? '' : filters.renal_failure),
            viralLoad: getArrFromFormattedStr(filters == undefined ? '' : filters.viralLoad), //ffilters.viralLoad || [],
            weight: getArrFromFormattedStr(filters == undefined ? '' : filters.weight), //filters.weight || []
        };

    //get the conditions for preacting antivirals
    let getMedsAndPreactingData = combineMedsAndPreactingAntivirals(filters);

    let filterObj = {
        //string values to array
        genotypes: getArrFromFormattedStr(filters == undefined ? '' : filters.genotypes),
        cirrhosis: getArrFromFormattedStr(filters == undefined ? '' : filters.cirrhosis),
        treatment: getArrFromFormattedStr(filters == undefined ? '' : filters.treatment),
        planType: filters == undefined ? '' : (filters.insurance ? getArrFromFormattedStr(filters.insurance) : 'all'),
        duration: filters == undefined ? '' : filters.timeFilter,
        othersFilters: othersFilters,
        medicationArray: getMedsAndPreactingData.medications,
        showPreactingAntivirals: getMedsAndPreactingData.usePreactingAntivirals,
        database: (filters == undefined ? 'IMS_LRX_AmbEMR_Dataset' : filters.database)
       }

    //  console.log("************Filter Object****************");
     //console.log(filterObj);

    return filterObj;
}

//function to combine the medications AND Preacting Antivirals
combineMedsAndPreactingAntivirals = (filterDataObj) => {
    let medications = getArrFromFormattedStr(filterDataObj == undefined ? '' : filterDataObj.medication),
        preactingAntivirals = getArrFromFormattedStr(filterDataObj == undefined ? '' : filterDataObj.preactingAntivirals);

    let finalMedicationToFetch = [],
        usePreactingAntivirals = preactingAntivirals.length > 0 ? true : false;

    //check if user has selected any preacting antivirals from the menu
    if (usePreactingAntivirals) {
        finalMedicationToFetch.push(preactingAntivirals); //push the selected preacting antivirals

        //check if user has selected any medication from medication filters
        if (medications.length > 0) {
            finalMedicationToFetch.push(medications); //push the selcted medications
        } else {
            //finalMedicationToFetch.push(_.pluck(DistinctMedicationCombinations, 'MEDICATION')); //push all medications
        }

        //merge the arrays into single array
        finalMedicationToFetch = _.flatten(finalMedicationToFetch);
    } else {
        //make the user selected medication to be filtered only
        finalMedicationToFetch = medications;
    }

    return {
        medications: finalMedicationToFetch,
        usePreactingAntivirals: usePreactingAntivirals
    }
};

getArrFromFormattedStr = (str) => {
    if (str == undefined) {
        return [];
    }
    return str ? str.replace(/['"]+/g, '').split(',') : [];
}


//function to set the medication info in the header
setMedicationInfoInCohort = () => {
    // console.log('setMedicationInfoInCohort');
    //Praveen 02/20/2017 initialising the variable
    //Nisha 05/17/2017 initialising the variable
    let displayHtml = '',
        tootTipData = '';
    if (AmdApp.Filters) {
        let medications = getCurrentPopulationFilters().medicationArray;

        if (medications.length != 0) {
            displayHtml = medications[0].split('+')[0];
            displayHtml = displayHtml.trim() + ' ...';

            for (let i = 0; i < medications.length; i++) {
                tootTipData += `<div>${medications[i].toUpperCase()}<div>`;
            }
        }
    }
    //Nisha 05/17/2017 initialising the variable if empty string
    if (!displayHtml.trim()) {
        displayHtml = 'All';
        tootTipData = `All`;
    }


    $('.header-medicationInfo .ecf-Medication').html(displayHtml);
    $('.header-medicationInfo .ecf-Medication').tooltip({
        contents: '<div></div>'
    });
    $('.header-medicationInfo .ecf-Medication').tooltip('option', 'content', tootTipData);
}


//function to set insuranceplan in header
setInsurancePlanInHeader = (planType) => {
    let insurance = planType ? planType : getCurrentPopulationFilters().planType;
    let displayHtml = '',
        tootTipData = ``;

    if (insurance == 'all') {
        displayHtml = 'All';
        tootTipData = `All`;
    } else {
        displayHtml = planType ? planType.slice(0, 6) + ' ...' : insurance[0].slice(0, 6) + ' ...';
        tootTipData = planType ? planType : insurance[0];
    }

    $('#desc_plan_payer').find('.efd-cell2_subpopulaiton').html(displayHtml);
    $('#desc_plan_payer').find('.efd-cell2_subpopulaiton').tooltip({
        contents: '<div></div>'
    });
    $('#desc_plan_payer').find('.efd-cell2_subpopulaiton').tooltip('option', 'content', tootTipData);
    $('#desc_month_payer').find('.efd-cell2_subpopulaiton').html(parseInt(ListOfYear[0].year));
    $('#desc_plan_payer').show();
    $('#desc_month_payer').show();
}

/**
 * Added: Arvind 10-Feb-2017
 * Issue :Redudant code for setting or updating cohort menu
 * Description : Single method to set cohort menu for active tab
 * Depends: This method depends on global object `AmdApp.Filters`
 */

setCohortHeaderMenu = ({
    tabName
}) => {

    try {
        //console.log("tabName:" + tabName);

        setFilterHeaderForPatientProvider({
            tabName: tabName,
            params: AmdApp.Filters
        });
        //let insurance = planType ? planType : currentCohortFilters.planType;
        let displayHtml = '',
            tootTipData = ``;

        // if (insurance == 'all') {
        //     displayHtml = 'All';
        //     tootTipData = `All`;
        // } else {
        //     displayHtml = planType ? planType.slice(0, 6) + ' ...' : insurance[0].slice(0, 6) + ' ...';
        //     tootTipData = planType ? planType : insurance[0];
        // }

        // $('#desc_plan_payer').find('.efd-cell2_subpopulaiton').html(displayHtml);
        // $('#desc_plan_payer').find('.efd-cell2_subpopulaiton').tooltip({
        //     contents: '<div></div>'
        // });
        // $('#desc_plan_payer').find('.efd-cell2_subpopulaiton').tooltip('option', 'content', tootTipData);
        //console.log(AmdApp.Filters);
        if (AmdApp.Filters) {
            let currentCohortFilters = getCurrentPopulationFilters();
            let medications = currentCohortFilters.medicationArray;

            // Overwrite same variable so we can utilized in Updating medication info
            displayHtml = '';
            tootTipData = ``;

            if (medications.length) {
                displayHtml = medications[0].split('+')[0];
                displayHtml = displayHtml.trim() + ' ...';

                for (let i = 0; i < medications.length; i++) {
                    tootTipData += `<div>${medications[i].toUpperCase()}<div>`;
                }
            } else {
                displayHtml = 'All';
                tootTipData = `All`;
            }

            $('.header-medicationInfo .ecf-Medication').html(displayHtml);
            $('.header-medicationInfo .ecf-Medication').tooltip({
                contents: '<div></div>'
            });
            $('.header-medicationInfo .ecf-Medication').tooltip('option', 'content', tootTipData);
        }
    } catch (e) {
        console.log("Error in global `AmdApp.Filters`");
        //console.log(e);
    }
};

/**REFERENCE FROM PATIENT/PROVIDER
 *  Added: Arvind 10-Feb-2017
 *  Created single method to set cohort menu for patient and provider tab
 *
 */
let setFilterHeaderForPatientProvider = ({
    params,
    tabName
}) => {
    //let params=getCurrentPopulationFilters();
    // console.log("tabName::" + tabName);
    // console.log('setFilterHeaderForPatientProvider');
    // console.log(params); 
    if (params) {
        $('#patient-pager').show();
        $("#filter_desc").show();

        /**REFERENCE FROM PATIENT/PROVIDER
         *  Modified: Arvind 10-Feb-2017
         *  Issue :Cohort menu not changes when we move from Pharma/Analytics/Payer tab
         *  Solution :Internal reference from provider.js file line no : 4219,
         *  Added below missing cohort element which need to set when patient and provider tab rendered
         *  headerInnerContentPharma.js file line no:33 for Capatalize first letter for Cirrhosis,Treatment
         *
         */
        let treatment = params['treatment'];
        if (treatment != null)
            treatment = treatment.split(',').length > 1 ? 'All' : convertFirstLetterCaps(treatment.replace(/'/g, '').toString());
        else
            treatment = 'All';

        let cirrhosis = params['cirrhosis'];
        if (cirrhosis != null)
            cirrhosis = cirrhosis.split(',').length > 1 ? 'All' : convertFirstLetterCaps(cirrhosis.replace(/'/g, '').toString());
        else
            cirrhosis = 'All';

        $('#desc_cirrhosis').show();
        $('#desc_cirrhosis').find('.efd-cell2_subpopulaiton').html(cirrhosis);
        $('#desc_treatment').show();
        $('#desc_treatment').find('.efd-cell2_subpopulaiton').html(treatment);
        $('#desc_genotype').show();
        $('#desc_genotype').find('.efd-cell2_subpopulaiton').html(params['genotypes'] != null ? params['genotypes'].replace(/'/g, '').toString() : 'All');
        $("#desc_patient_count").show();
        // Nisha 02/20/2017 Changes for commorn Chorort menu
        if (tabName == 'pharma')
        setMedicationInfoInCohort();
        if (tabName == 'payer')
            setInsurancePlanInHeader();
        //// Modified End: Arvind 10-Feb-2017
        if (params['hiv'] != null) {
            $('#desc_hiv').show();
            $('#desc_hiv').find('.efd-cell2_subpopulaiton').html(params['hiv'].replace(/'/g, '').toString());
        } else {
            $('#desc_hiv').hide();
            $('#desc_hiv').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['mental_health'] != null) {
            $('#desc_mentalhealth').show();
            $('#desc_mentalhealth').find('.efd-cell2_subpopulaiton').html(params['mental_health'].replace(/'/g, '').toString());
        } else {
            $('#desc_mentalhealth').hide();
            $('#desc_mentalhealth').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['renal_failure'] != null) {
            $('#desc_renalfailure').show();
            $('#desc_renalfailure').find('.efd-cell2_subpopulaiton').html(params['renal_failure'].replace(/'/g, ''));
        } else {
            $('#desc_renalfailure').hide();
            $('#desc_renalfailure').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['liver_assesment'] != null) {
            $('#desc_liverassessment').show();
            $('#desc_liverassessment').find('.efd-cell2_subpopulaiton').html(params['liver_assesment'].replace(/'/g, '').toString());
        } else {
            $('#desc_liverassessment').hide();
            $('#desc_liverassessment').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['fibrosure'] != null) {
            $('#desc_fibrosure').show();
            $('#desc_fibrosure').find('.efd-cell2_subpopulaiton').html(params['fibrosure'].replace(/'/g, '').toString());
        } else {
            $('#desc_fibrosure').hide();
            $('#desc_fibrosure').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['liverBiopsy'] != null) {
            $('#desc_liverbiopsy').show();
            $('#desc_liverbiopsy').find('.efd-cell2_subpopulaiton').html(params['liverBiopsy'].replace(/'/g, '').toString());
        } else {
            $('#desc_liverbiopsy').hide();
            $('#desc_liverbiopsy').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['fibroscan'] != null) {
            $('#desc_fibroscan').show();
            $('#desc_fibroscan').find('.efd-cell2_subpopulaiton').html(params['fibroscan'].replace(/'/g, '').toString());
        } else {
            $('#desc_fibroscan').hide();
            $('#desc_fibroscan').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['hcc'] != null) {
            $('#desc_hcc').show();
            $('#desc_hcc').find('.efd-cell2_subpopulaiton').html(params['hcc'].replace(/'/g, '').toString());
        } else {
            $('#desc_hcc').hide();
            $('#desc_hcc').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['chemistry'] != null) {
            $('#desc_chemistry').show();
            $('#desc_chemistry').find('.efd-cell2_subpopulaiton').html(params['chemistry'].replace(/'/g, '').toString());
        } else {
            $('#desc_chemistry').hide();
            $('#desc_chemistry').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['alcohol'] != null) {
            $('#desc_alcohol').show();
            $('#desc_alcohol').find('.efd-cell2_subpopulaiton').html(params['alcohol'].replace(/'/g, '').toString());
        } else {
            $('#desc_alcohol').hide();
            $('#desc_alcohol').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['age'] != null) {
            $('#desc_age').show();
            $('#desc_age').find('.efd-cell2_subpopulaiton').html(params['age'].replace(/'/g, '').toString());
        } else {
            $('#desc_age').hide();
            $('#desc_age').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['ethnicity'] != null) {
            $('#desc_ethnicity').show();
            $('#desc_ethnicity').find('.efd-cell2_subpopulaiton').html(params['ethnicity'].replace(/'/g, '').toString());
        } else {
            $('#desc_ethnicity').hide();
            $('#desc_ethnicity').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['meld'] != null) {
            $('#desc_meldscore').show();
            $('#desc_meldscore').find('.efd-cell2_subpopulaiton').html(params['meld'].replace(/'/g, '').toString());
        } else {
            $('#desc_meldscore').hide();
            $('#desc_meldscore').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['etoh'] != null) {
            $('#desc_etoh').show();
            $('#desc_etoh').find('.efd-cell2_subpopulaiton').html(params['etoh'].replace(/'/g, '').toString());
        } else {
            $('#desc_etoh').hide();
            $('#desc_etoh').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['weight'] != null) {
            $('#desc_weight').show();
            $('#desc_weight').find('.efd-cell2_subpopulaiton').html(params['weight'].replace(/'/g, '').toString());
        } else {
            $('#desc_weight').hide();
            $('#desc_weight').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['viralLoad'] != null) {
            $('#desc_virallaod').show();
            $('#desc_virallaod').find('.efd-cell2_subpopulaiton').html(params['viralLoad'].replace(/'/g, '').toString());
        } else {
            $('#desc_virallaod').hide();
            $('#desc_virallaod').find('.efd-cell2_subpopulaiton').html('');
        }
        if (params['apri'] != null) {
            $('#desc_apri').show();
            $('#desc_apri').find('.efd-cell2_subpopulaiton').html(params['apri'].replace(/'/g, '').toString());
        } else {
            $('#desc_apri').hide();
            $('#desc_apri').find('.efd-cell2_subpopulaiton').html('');
        }
        if (tabName != 'provider' && tabName != 'pharma' && tabName != "payer") {
            // Do not update cohort count for provider tab
            // Notes: below field is updated independently from provider tab based on button click of FDA

            $('.searchPatientCountHeader').html(commaSeperatedNumber(params['patientCountTab'] || 0));
        }


    } else {
        //   Nisha 02/20/2017 Changes for commorn Chorort menu
        if (tabName == "pharma") {
            $("#filter_desc").show();
            $('#desc_cirrhosis').show();
            $('#desc_treatment').show();
            $('#desc_genotype').show();
            $('#desc_cirrhosis').find('.efd-cell2_subpopulaiton').html('ALL');
            $('#desc_treatment').find('.efd-cell2_subpopulaiton').html('ALL');
            $('#desc_genotype').find('.efd-cell2_subpopulaiton').html('ALL');
            setMedicationInfoInCohort();
        }
    }
}

/**
 *  Added: Arvind 13-Feb-2017
 *  Description: Created sigle method to set patient count on cohort menu
 */

setCohortPatientCount = ({
    patientCount
}) => {
    $('.searchPatientCountHeader').html(commaSeperatedNumber(patientCount || 0));
    // $('.searchPatientCountHeaderPharma').html(commaSeperatedNumber(patientCount || 0));
}

/**
 * @author: Pramveer
 * @date: 29 Mar 17
 * @desc: function to autoformat the cost
 * @param: number: value to be formatted , digits: toFixed value
 * @reference: http://stackoverflow.com/questions/9461621/how-to-format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900-in-javascrip
 */

autoFormatCostValue = (number, digits) => {
    let toFixedDigit = digits ? digits : 1;

    let costStore = [{
                value: 1E18,
                symbol: "QT"
            },
            {
                value: 1E15,
                symbol: "QD"
            },
            {
                value: 1E12,
                symbol: "T"
            },
            {
                value: 1E9,
                symbol: "B"
            },
            {
                value: 1E6,
                symbol: "M"
            },
            {
                value: 1E3,
                symbol: "K"
            }
        ],
        rx = /\.0+$|(\.[0-9]*[1-9])0+$/,
        i;

    for (let i = 0; i < costStore.length; i++) {
        if (number >= costStore[i].value) {
            return (number / costStore[i].value).toFixed(toFixedDigit).replace(rx, "$1") + ' ' + costStore[i].symbol;
        }
    }
    return number.toFixed(toFixedDigit).replace(rx, "$1");
}

/**
 * @author: Pramveer
 * @date: 5th Apr 17
 * @desc: function return the style object for the highcharts drilldown back button
 */
getStyleForHighchartBackBtn = () => {
    return {
        relativeTo: 'spacingBox',
        position: {
            y: 20,
            x: 0
        },
        theme: {
            fill: '#ee4118',
            'stroke-width': 0,
            stroke: 'none',
            cursor: 'pointer',
            color: 'white',
            r: 2,
            states: {
                hover: {
                    fill: '#ee4118'
                },
                select: {
                    stroke: '#039',
                    fill: '#ee4118'
                }
            },
            plotShadow: true,
            boxShadow: {
                color: 'grey',
                width: 10,
                offsetX: 1,
                offsetY: 1
            }
        }
    };
}

//Praveen 04/03/2017 added custom colors array 
customColorsArray = () => {
    return ["#abd6ba", "#f1cb6a", "#69bae7", '#2e7e97', '#FFCDD2', '#E57373', '#673AB7', '#EDE7F6', '#7C4DFF',
        '#B388FF', '#B3E5FC', '#039BE5', '#40C4FF', '#0091EA', '#A5D6A7', '#43A047', '#69F0AE', '#FFF176', '#FF8A65', '#B0BEC5',
        '#A1887F', '#BDBDBD', '#FFB74D', '#C6FF00', '#64FFDA', '#2196F3', '#2196F3', '#BA68C8'
    ];
}

//Praveen 03/04/2017 Added function to append html
fnNoDataFoundChart = (container) => $(container).html('<div class="nodataFound">No Data Available</div>');

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 04-May-2017
 * @desc: Added common fucntion to check is user have access to specific tab or not
 */
isUserAuthorized = (tab) => {
    //console.log("*******tab*******");
    //console.log(tab);
    /**
		Role : PCP,PHARMA,SUPERUSER ,Provider,Payer,Custom,Admin 
		PCP always separate(shouldn’t visible for any other user or customer e.g PHS)
		Provider: Patient/Provider/Dashbaord/Analytics
		Payer : Patient/Provider/Dashbaord/Analytics/Payer
		PHARMA: role have access to Pharma tab and Analytics tab,Dashboard   Phrama/Analytics/Dashboard
		SUPERUSER : Phrama,Payer,Provider (Each for role have their super user role user who create user on behalf)
		Admin: Have access to entire app
		Custom: user have access to specific tab entered
		Admin :1
		Payer : 2
		Provider : 3
		Custom : 4
		PrimaryCarePhysician : 5
     */
    let userInfo = Meteor.user();
    let user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
        "UserCount": 1,
        "username": "",
        "email": "",
        "organization": "",
        "org_id": 1,
        "role": 0,
        "tabs_name": ""
    };

    let AccessibleTab = user.role === 4 && user.tabs_name && user.tabs_name.length > 0 ? user.tabs_name.split(',') : [];
    let isCustom = user.role === 4 && _.indexOf(AccessibleTab, tab) > -1 ? true : false;
    /**
     * @author: Arvind
     * @reviewer: 
     * @date: 01-Mar-2017
     * @updated : 02-May-2017
     * @desc: Added condition check for user role PrimaryCarePhysician along with accessible tab for that role
     * Added more role(Payer,Provider) configuration 
     */
    let AccessibleTabForPrimaryCarePhysician = ["assessmenttool"];
    let isPrimaryCarePhysicianRole = isPCPAuhtorized() && _.indexOf(AccessibleTabForPrimaryCarePhysician, tab.toLowerCase()) > -1;
    //Patient/Provider/Dashbaord/Analytics
    let AccessibleTabForProvider = ["patient", "provider", "analytics", "dashboard"];
    // Patient/Provider/Dashbaord/Analytics/Payer
    // Added `Assessmenttool` for payer role only for phs, we can restrict by organization if possible 
    let AccessibleTabForPayer = ["patient", "provider", "analytics", "dashboard", "payer", "assessmenttool"];

    let isProviderRole = user.role === 3 && _.indexOf(AccessibleTabForProvider, tab.toLowerCase()) > -1 ? true : false;

    let isPayerRole = user.role === 2 && _.indexOf(AccessibleTabForPayer, tab.toLowerCase()) > -1 ? true : false;
    // As `assessmenttool` is displayed for admin role and need to hide for admin as it is separate module.
    // To hide pcp tool for admin user below code are added
    let isAdminRole = user.role === 1;

    return isCustom || isAdminRole || isPayerRole || isProviderRole || isPrimaryCarePhysicianRole ? true : false;
};

/**
 * @author: Arvind
 * @reviewer: 
 * @date : 04-May-2017
 * @desc: Added method to cehck user role is PrimaryCarePhysician
 */
isPCPAuhtorized = function() {
    var userInfo = Meteor.user();
    var user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
        "UserCount": 1,
        "username": "",
        "email": "",
        "organization": "",
        "org_id": 1,
        "role": 0
    };
    // For Primary Care Physician add role here
    return user.role === 5 ? true : false;
};

// getSelectedDatabase = (name) => {
//     let value = $("#showSelectedDatabase").attr('data');
//     // return value?value:'IMS_LRX_AmbEMR_Dataset'
//     if (parseInt(value) == 0) {
//         return 'PHS_HCV';
//     } else {
//         return 'IMS_LRX_AmbEMR_Dataset';
//     }
// }

//function to check for current db selection is customer or not
isCustomerDataset = () => $('#showSelectedDatabase').prop('checked');

//fet database name
getSelectedDatabase = () => isCustomerDataset() ? 'PHS_HCV':'IMS_LRX_AmbEMR_Dataset';

//fet database name
getReverseSelectedDatabase = () => isCustomerDataset() ? 'IMS_LRX_AmbEMR_Dataset':'PHS_HCV';

//get colors by genotype
genotypeFixedColors = (val, isByCode) => {

    val = val ? val.toString() : 'null'; //check for undefined or null

    let genStore = [{
            index: 0,
            name: '1a',
            color: "#abd6ba"
        },
        {
            index: 1,
            name: '1b',
            color: "#f1cb6a"
        },
        {
            index: 2,
            name: '3',
            color: "#69bae7"
        },
        {
            index: 3,
            name: '4',
            color: "#2e7e97"
        },
        {
            index: 4,
            name: '5',
            color: "#FFCDD2"
        },
        {
            index: 5,
            name: '6',
            color: "#E57373"
        },
        {
            index: 6,
            name: 'null',
            color: "#673AB7"
        },
        {
            index: 7,
            name: '1',
            color: "#EDE7F6"
        },
        {
            index: 8,
            name: '2',
            color: "#B388FF"
        },
    ];

    let value = '';

    //check if is Name is to be returned instead of code
    try {
        if (isByCode) {
            value = _.where(genStore, {
                index: val
            })[0].color;
        } else {
            value = _.where(genStore, {
                name: val
            })[0].color;
        }
    } catch (e) {

    }
    return value;
}



//age function for range
createAgeRangeIfNot = (baseData) => {
    let ageGroups = null;
    if (baseData.length > 0) {
        let age0 = baseData[0].age.toString();
        if (age0.indexOf('-') != -1 || age0.indexOf('+') != -1) {
            ageGroups = _.groupBy(baseData, 'age');
        } else {
            ageGroups = _.groupBy(baseData, function(rec) {
                if (rec.age >= 0 && rec.age <= 22)
                    return '0-22';
                else if (rec.age >= 23 && rec.age <= 32)
                    return '23-32';
                else if (rec.age >= 33 && rec.age <= 42)
                    return '33-42';
                else if (rec.age >= 43 && rec.age <= 52)
                    return '43-52';
                else if (rec.age >= 53 && rec.age <= 62)
                    return '53-62';
                else if (rec.age >= 63 && rec.age <= 72)
                    return '63-72';
                else if (rec.age >= 73 && rec.age <= 82)
                    return '73-82';
                else if (rec.age >= 83)
                    return '83+';
            });
        }
    }
    return ageGroups;
}


let settingMedicationColor = (medication)=>{
    let color;
    switch(medication){
        case "HARVONI" : case "H" : color ="#C6FF00";  break;
        case "PEGASYS" : case "P":color="#673AB7";break;
        case "SOVALDI": case"S":color="#E57373"; break;
        case "OLYSIO":case "O":color="#FFF176"; break;
        case "TECHNIVIE" : case "T":color ="#2196F3"; break;
        case "RIBAVIRIN" : case "R":color="#BA68C8"; break;
        case "DAKLINZA" : case "D":color="#BDBDBD"; break;
        case "VIEKIRA PAK":case "VIEKIRAPAK":case "V":color="#B388FF";break;
        case "RIBAVIRIN + SOVALDI" :case "RIBAVIRIN+SOVALDI" :case "R+S" :color="#69bae7"; break;
        case "OLYSIO + SOVALDI" : case "OLYSIO+SOVALDI":case "O + S":color="#EDE7F6";break;
        case "DAKLINZA + SOVALDI":case "DAKLINZA+SOVALDI":case "D + S":color="#B3E5FC";break;
        case "PEGASYS + RIBAVIRIN + SOVALDI":case "PEGASYS+RIBAVIRIN+SOVALDI":case"P + R + S":color="#7C4DFF";break;
        case "HARVONI + RIBAVIRIN":case "HARVONI+RIBAVIRIN" : case"H + R":color="#BA68C8"; break;
        case "PEGASYS + SOVALDI" : case "PEGASYS+SOVALDI" : case "P + S":color="#FF8A65";break;
        case "RIBAVIRIN + VIEKIRA PAK":case "RIBAVIRIN+VIEKIRAPAK":case "R + V":color="#A1887F";break;
        case "DAKLINZA + RIBAVIRIN + SOVALDI":case "DAKLINZA+RIBAVIRIN+SOVALDI":case"D + R +S":color="#7C4DFF";break;
        case "OLYSIO + RIBAVIRIN + SOVALDI":case "OLYSIO+RIBAVIRIN+SOVALDI":case "O + R + S":color="#B3E5FC"; break;
        case "PEGASYS + RIBAVIRIN":case "PEGASYS+RIBAVIRIN":case "P + R":color="#64FFDA"; break;
        case "RIBAVIRIN + TECHNIVIE":case "RIBAVIRIN+TECHNIVIE":case "R + T":color="#0091EA"; break;
    }
    return color;
}


//list of 120 colors
getColorByValue = (index) => {
    let colors =  ["#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c",
                    "#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194",
                    "#ce6dbd","#de9ed6","#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c",
                    "#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194",
                    "#ce6dbd","#de9ed6","#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c",
                    "#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194",
                    "#ce6dbd","#de9ed6","#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c",
                    "#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194",
                    "#ce6dbd","#de9ed6","#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c",
                    "#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194",
                    "#ce6dbd","#de9ed6","#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c",
                    "#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194",
                    "#ce6dbd","#de9ed6"];
    let value = ~~index.toString().replace(/\D+/g,'');
    return value<colors.length?colors[value]:colors[0];
}

//function to refine color code by year
getColorCodeByYear = (val, isByCode) => {
    let raceStore = [{
            index: 8,
            name: '2010',
            color:"#0091EA"
        },
        {
            index: 1,
            name: '2011',
            color:"#f1cb6a"
        },
        {
            index: 1,
            name: '2012',
            color:"#f1cb6a"
        },
        {
            index: 2,
            name: '2013',
            color:"#69bae7"
        },
        {
            index: 3,
            name: '2014',
            color:"#2e7e97"
        },
        {
            index: 4,
            name: '2015',
            color:"#FFCDD2"
        },
        {
            index: 5,
            name: '2016',
            color:"#E57373"
        },
        {
            index: 6,
            name: '2017',
            color:"#673AB7"
        },
        {
            index: 7,
            name: '2018',
            color:"#EDE7F6"
        },
    ];

    let value = '';
    //check if is Name is to be returned instead of code
    try{
            if (isByCode) {
                value = _.where(raceStore, {
                    index: val
                })[0].color;
                } else {
                    value = _.where(raceStore, {
                        name: val
                    })[0].color;
                }
    }
    catch(e){   
    }
    return value;
}



//function to refine color code by year
getColorCodeByTreatment = (val, isByCode) => {
    let raceStore = [{
            index: 8,
            name: 'naive',
            color:"#0091EA"
        },
        {
            index: 1,
            name: 'experienced',
            color:"#f1cb6a"
        },
        {
            index: 2,
            name: '',
            color:"#f1cb6a"
        }
    ];

    let value = '';
    //check if is Name is to be returned instead of code
    try{
            if (isByCode) {
                value = _.where(raceStore, {
                    index: val.toLowerCase()
                })[0].color;
                } else {
                    value = _.where(raceStore, {
                        name: val.toLowerCase()
                    })[0].color;
                }
    }
    catch(e){   
    }
    return value;
}

//get title Case
toTitleCase = (str) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());


//get unique patient count
// getUniqueCount = (baseData,key) => {
//     if(baseData)
//         return baseData.length>0?_.unique(_.pluck(baseData,key)).length:0;
//     else{
//         return 0;
//     }
// }

// //get count filter by medication
// getUniqueCountMedication = (baseData,key,mkey) => {
//     if(baseData){
//         let filteredData = baseData.filter((rec)=>rec[mkey]!=undefined && rec[mkey]!=null && rec[mkey]!='');
//         return filteredData.length>0?_.unique(_.pluck(filteredData,key)).length:0;
//     }
//     else{
//         return 0;
//     }
// }

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 30-May-2017
 * @desc: We have used `map` and `Set` to calculate unique patient count
 * Reference link :  https://www.reindex.io/blog/you-might-not-need-underscore/
 * Original Author : Ville Immonen
 * https://codereview.stackexchange.com/questions/60128/removing-duplicates-from-an-array-quickly
 * 
*/
//get unique patient count
getUniqueCount = (baseData, key) => {
    //PAT_CNT++;
    //return baseData ?baseData.length:0;
    if (baseData){
//      _ids = [];

// for (obj in baseData) {
//   _ids.push(obj[key]);
// }
        //return new Set(baseData.map(value => value[key])).size;
        return new Set(_.pluck(baseData,key)).size;
    }
    else {
        return 0;
    }
}

/**
 * get count filter by medication
 * @param {*} baseData Array Of object
 * @param {*} key      Filter primary key(here PATIENT_ID_SYNTH) to find unique records
 * @param {*} mkey     Filter secondary key(For Medication) tofiind unique records 
 * @returns unique array count value
 */
getUniqueCountMedication = (baseData, key, mkey) => {
   // MED_CNT++;
 //return baseData ?baseData.length:0;
    if (baseData) {
        let filteredData = baseData.filter((rec) => rec[mkey] != undefined && rec[mkey] != null && rec[mkey] != '');
        //return filteredData.length > 0 ? new Set(baseData.map(value => value[key])).size : 0;
        return filteredData.length > 0 ? new Set(_.pluck(baseData,key)).size : 0;
        
    } else {
        return 0;
    }
}


//get text format for N
getHTMLTextN = (actual,total)=>{
    if(total){
        let percentage = (actual/total)*100;
        return commaSeperatedNumber(actual)+' ('+percentage.toFixed(2)+'%) Over '+commaSeperatedNumber(total)+' Patient with Medications'; 
    }
    else{
        return 0;
    }
}

//get text format for N
getHTMLCustomTextN = (actual,total,message,innermessage="")=>{
    if(total){
        let percentage = (actual/total)*100;
        return commaSeperatedNumber(actual)+' ('+percentage.toFixed(2)+'%)'+innermessage+' Over '+commaSeperatedNumber(total)+' '+message; 
    }
    else{
        return 0;
    }
}


//function to remove duplicate entries from an array
getUniqueArray=(baseData)=> {
    // var cleaned = [];
    // List.forEach(function(itm) {
    //     var unique = true;
    //     cleaned.forEach(function(itm2) {
    //         if (_.isEqual(itm, itm2)) unique = false;
    //     });
    //     if (unique) cleaned.push(itm);
    // });
     if (baseData) {
        return baseData.length > 0 ? Array.from(new Set(baseData)): [];
    } else {
        return [];
    }
  
}

//function to remove duplicate entries from an array
/**
 *  Function takes array argument and return count for unique array value
 * @export 
 * @param {any} baseData  required
 * @returns unique array element count
 */
getUniqueArrayCount=(baseData)=> {
    // var cleaned = [];
    // List.forEach(function(itm) {
    //     var unique = true;
    //     cleaned.forEach(function(itm2) {
    //         if (_.isEqual(itm, itm2)) unique = false;
    //     });
    //     if (unique) cleaned.push(itm);
    // });
     if (baseData) {
        return baseData.length > 0 ? new Set(baseData).size: 0;
    } else {
        return 0;
    }
  
}

//filter data based on preacting acting viral
filterPreactingAntivirals = (dataArray , preactingFlag) => {
    let filteredData = [];

    //if the flag is true for preacting antivirals then return the data as it is
    if(preactingFlag) {
        filteredData = dataArray;
    }
    //else need to use only those records with preacting as 'NO' and null (due to left join)
    else {
        //filteredData = _.where(dataArray, {IS_PREACTING_ANTIVIRAL: 'NO'})
        filteredData = _.filter(dataArray , (rec) => {
            return rec.IS_PREACTING_ANTIVIRAL == 'NO' || rec.IS_PREACTING_ANTIVIRAL == null;
        }); 
    }
    return filteredData;
}


//get range for fibrosis stage
getRangeForStage = (stage) =>{
        let stageStore = [{
            stage: 0,
            range: '0-0.21'
        }, {
            stage: 1,
            range: '0.22-0.31'
        }, {
            stage: 2,
            range: '0.32-0.58'
        }, {
            stage: 3,
            range: '0.59-0.73'
        }, {
            stage: 4,
            range: '0.74+'
        },{
            stage: null,
            range: null
        } ];

        let filterStage = _.where(stageStore, {
            stage: stage
        })[0];
        return filterStage ? filterStage.range : '';
    }