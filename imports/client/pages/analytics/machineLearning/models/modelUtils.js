/*
  file contains utilities functions for sub tabs under machine learning
 */

import * as analyticsLib from '../../analyticsLib.js';
import * as decisionTreeLib from '../../../../lib/custom/customize-decision-tree.js';
//import DecisionTree from '../../../../lib/custom/customize-decision-tree.js'

let mlTabsData = [];

export function getMLTabsData() {
    return mlTabsData;
}

export function setMLTabsData(data) {
    mlTabsData = data;
}

export function showChartLoading() {
    $('.mlSubTabsChartSectionMask').show();
    $('.mlSubTabsChartSectionWrap').hide();
}

export function hideChartLoading() {
    setTimeout(function() {
        $('.mlSubTabsChartSectionMask').hide();
        $('.mlSubTabsChartSectionWrap').show();
    }, 100);
}

export function renderPatientsList(data, parentContainer, showLabsFirst) {
    let params = Pinscriptive['Filters'];

    let geno = params.genotypes ? params.genotypes.replace(/\'/g, "") : 'All';
    let treat = params.treatment ? (params.treatment.replace(/\'/g, "") != 'naive,experienced' ? upperCaseFirstModel(params.treatment.replace(/\'/g, "")) : 'All') : 'All';
    let cirr = params.cirrhosis ? (params.cirrhosis.replace(/\'/g, "") != 'Yes,No' ? params.cirrhosis.replace(/\'/g, "") : 'All') : 'All';

    $('.' + parentContainer).empty();

    let MainHtml = `<div class="popup-inner" style='width: 1280px!important; height: 648px; padding: 10px 20px;'>
	                <button type="button" class="close mlTabs_closebtn" ><span aria-hidden="true">×</span></button>
                    <div class="analyticsPatientsPopup-header"></div>
                    <div class="analyticsPatientsPopup-container"></div>`;

    // header section
    let headerHtml = ``;


    headerHtml += `<div class="analyticsCommonPopupHeader" style="margin-top: -5px;">
                        <div class="analyticsCommonPopupHeaderInner">                            
                            <div class="analyticsCommonPopupFilterDesc">
                                <div class="analyticsCommonPopupFilterDescTitle">Genotype:</div>
                                <div class="analyticsCommonPopupFilterDescValue">${geno}</div>
                            </div>
                            <div class="analyticsCommonPopupFilterDesc">
                                <div class="analyticsCommonPopupFilterDescTitle">Treatment:</div>
                                <div class="analyticsCommonPopupFilterDescValue">${treat}</div>
                            </div>
                            <div class="analyticsCommonPopupFilterDesc">
                                    <div class="analyticsCommonPopupFilterDescTitle">Cirrhosis:</div>
                                    <div class="analyticsCommonPopupFilterDescValue">${cirr}</div>
                            </div>
                            <div class="analyticsCommonPopupOptions">
                                <div class="analyticsCommonPopupOptionsButton commonPopupPatientCount"  title="Patient Count"><span style="cursor: default;"><i class="fa fa-users" aria-hidden="true"></i></span><p>${data.length}</p></div>
                                <div title="Export Patients" class="analyticsCommonPopupOptionsButton commonPopupExportPatientIcon"><span><i class="fa fa-share-square-o" aria-hidden="true"></i></span></div>
                            </div>
                        </div>
	                </div>`;

    //container for patient data
    let patientContentHtml = `<div class="analyticsCommonPopupPatientContent">`;

    if (parentContainer == 'cirrhosisDistributionPList') {
        patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRow">PatientID</div>
                                    <div class="showInRowMin">Age</div>
                                    <div class="showInRowMin">Gender</div>
                                    <div class="showInRowMin">Genotype</div>
                                    <div class="showInRow">Treatment</div>
                                    <div class="showInRowMin">Cirrhosis</div>
                                    <div class="showInRowMax">Viral Load</div>
                                    <div class="showInRow">Platelet</div>
                                    <div class="showInRow">APRI</div>
                                    <div class="showInRow">AST</div>
                                </div>`;
    } else {
        patientContentHtml += `<div class="analyticsCommonPopupPatientsHeader" style="width: 100%;float: left;position: relative;">
                                    <div class="showInRow">PatientID</div>
                                    <div class="showInRowMin">Age</div>
                                    <div class="showInRowMin">Gender</div>
                                    <div class="showInRowMin">Genotype</div>
                                    <div class="showInRow">Treatment</div>
                                    <div class="showInRowMin">Cirrhosis</div>
                                    <div class="showInRow">Viral Load</div>
                                    <div class="showInRow">Liver Disease</div>
                                    <div class="showInRowMax">Race</div>
                                    <div class="showInRow">Ethnicity</div>
                                </div>`;
    }
    patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

    for (let i = 0; i < data.length; i++) {
        if (parentContainer == 'cirrhosisDistributionPList') {
            patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                                    <div class="showInRow">${data[i].patientId}</div>
                                    <div class="showInRowMin">${data[i].age}</div>
                                    <div class="showInRowMin">${analyticsLib.getGenderType(data[i].gender)}</div>
                                    <div class="showInRowMin">${data[i].genotype}</div>
                                    <div class="showInRow" >${data[i].treatment}</div>
                                    <div class="showInRowMin">${data[i].cirrhosis}</div>
                                    <div class="showInRowMax">${formatViralLoad(data[i].viralLoad)}</div>
                                    <div class="showInRow" >${data[i].Count_PLATELET}</div>
                                    <div class="showInRowMax" >${data[i].Count_APRI}</div>
                                    <div class="showInRow" >${data[i].Count_AST}</div>
                                    </div>`;
        } else {
            patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                                    <div class="showInRow">${data[i].patientId}</div>
                                    <div class="showInRowMin">${data[i].age}</div>
                                    <div class="showInRowMin">${analyticsLib.getGenderType(data[i].gender)}</div>
                                    <div class="showInRowMin">${data[i].genotype}</div>
                                    <div class="showInRow" >${data[i].treatment}</div>
                                    <div class="showInRowMin">${data[i].cirrhosis}</div>
                                    <div class="showInRow">${formatViralLoad(data[i].viralLoad)}</div>
                                    <div class="showInRow" >${analyticsLib.getLiverAssessmentType(data[i].AssessmentLiverDisease)}</div>
                                    <div class="showInRowMax" >${data[i].race}</div>
                                    <div class="showInRow" >${data[i].ethnicity}</div>
                                    </div>`;
        }
    }
    patientContentHtml += '</div>';
    MainHtml += headerHtml;
    MainHtml += patientContentHtml;
    MainHtml += `</div>`;


    $('.' + parentContainer).html(MainHtml);
    // $('.' + parentContainer).show();
    //bind export patient button  click event
    $('.commonPopupExportPatientIcon').click(function() {
        exportPatientsData($(this), 'Adharence_' + dataObj.medicationInfo.Medication + ' (' + dataObj.medicationInfo.treatmentPeriod + 'W)_Patients', data);
    });



    /*
        $('.' + parentContainer + '-listMask').show();
        $('.' + parentContainer).hide();
        $('.' + parentContainer + ' .analyticsPatientsPopup-container').empty();

        let patientsHtml = '',
            headerHtml = '';

        patientsHtml = `<div class="mlTabPatientsList">
                            <div class="ecf-patientsHeader">
                                <div class="showInRow">PatientID</div>
                                <div class="showInRow">Age</div>
                                <div class="showInRow">Gender</div>
                                <div class="showInRow">Genotype</div>
                                <div class="showInRow">Treatment</div>
                                <div class="showInRow">Cirrhosis</div>
                                <div class="showInRow">Viral Load</div>
                                <div class="showInRow">CTP Score</div>
                                <div class="showInRow">Meld Score</div>
                                <div class="showInRow">Liver Disease</div>
                            </div>`;

        let innerHtml = '<div class="ecf-patientContainer">';

        for (let i = 0; i < data.length; i++) {
            innerHtml += `<div class="ecf-patientRow js-ml-patientRow" child="hidden" patient="${data[i].patientId}" id="${data[i].patientId}_PRow">
                            <div class="showInRow">${data[i].patientId}</div>
                            <div class="showInRow">${data[i].age}</div>
                            <div class="showInRow">${analyticsLib.getGenderType(data[i].gender)}</div>
                            <div class="showInRow">${data[i].genotype}</div>
                            <div class="showInRow">${data[i].treatment}</div>
                            <div class="showInRow">${data[i].cirrhosis}</div>
                            <div class="showInRow">${formatViralLoad(data[i].viralLoad)}</div>
                            <div class="showInRow">${data[i].ctpScore}</div>
                            <div class="showInRow">${formatMeldScore(data[i].meldScore)}</div>
                            <div class="showInRow">${analyticsLib.getLiverAssessmentType(data[i].AssessmentLiverDisease)}</div>
                            <div class="showInRow optimizeIcon"></div>
                        </div>`;

            innerHtml += getExpandableViewDom(data[i], showLabsFirst);
        }

        innerHtml += '</div>';

        patientsHtml += innerHtml + '</div>';

        $('.' + parentContainer + ' .analyticsPatientsPopup-container').html(patientsHtml);
        $('.' + parentContainer + ' .analyticsPatientsPopup-header').html(headerHtml);
        */
    // setTimeout(function() {
    //     //unbind event for the list
    //     $('.' + parentContainer + ' .js-ml-patientRow').unbind();
    //     $('.' + parentContainer + ' .js-ml-patientRow').click(function(event) {
    //         event.preventDefault();
    //         handleRowClick($(event.currentTarget), data);
    //     });

    // }, 50);

    // setTimeout(function() {
    //     //$('.' + parentContainer + '-listMask').hide();
    //     //$('.' + parentContainer).show();
    // }, 1000);
}

function handleRowClick(obj, patientsData) {
    let childState = $(obj).attr('child'),
        childEle = $(obj).next('.ecf-patientDetailSection'),
        patientId = parseInt($(obj).attr('patient'));

    $(childEle).find('svg').remove();
    $('.ecf-patientDetailSection').hide();
    $('.ecf-patientRow').removeClass('active');
    if (childState == 'visible') {
        $(obj).attr('child', 'hidden');
        $(obj).removeClass('active');
        $(childEle).hide(500);
        return;
    } else {
        $(obj).attr('child', 'visible');
        $(obj).addClass('active');
        $(childEle).show(500);
    }

    analyticsLib.scrollPatientDetails($(childEle).attr('id'));
    analyticsLib.scrollPatientDetails($(obj).attr('id'));
}

function getExpandableViewDom(data, showLabsFirst) {
    let html = '';

    html = '<div class="ecf-patientDetailSection" id="' + data.patientId + '_detailSection">';

    if (showLabsFirst) {
        html += getlabsData(data);
        html += '<div class="col-md-12 patientsList-rowSeparator"></div>';
        html += getCategoriesCost(data);
    } else {
        html += getCategoriesCost(data);
        html += '<div class="col-md-12 patientsList-rowSeparator"></div>';
        html += getlabsData(data);
    }

    html += '<div class="col-md-12 patientsList-rowSeparator"></div>';
    html += getDemoGraphicData(data);

    html += '</div>';

    return html;
}

function getCategoriesCost(data) {
    let html = ``;

    html = `<div class="col-md-4">
                <div class="efd-cell1">Physician Service</div>
                <div class="efd-cell2">$ ${data.physician_cost}</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">Diagnostic Testing</div>
                <div class="efd-cell2">$ ${data.diagnostic_testing_cost}</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">Antiviral Therapy</div>
                <div class="efd-cell2">$ ${data.claims_cost}</div>
            </div>`;

    if (data.hospitalization == 1) {
        html += `<div class="col-md-4">
                <div class="efd-cell1">Hospitalization</div>
                <div class="efd-cell2">$ ${data.hospitalization_cost}</div>
            </div>`;
    }

    if (data.liver_disease == 1) {
        html += `<div class="col-md-4">
                <div class="efd-cell1">Liver Disease</div>
                <div class="efd-cell2">$ ${data.liver_disease_cost}</div>
            </div>`;
    }

    return html;
}

function getlabsData(data) {
    let html = '';

    html = `<div class="col-md-4">
                <div class="efd-cell1">Apri: </div>
                <div class="efd-cell2">${data.labs_apri}</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">Albumin: </div>
                <div class="efd-cell2">${data.labs_albumin}(g/dL)</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">Ast: </div>
                <div class="efd-cell2">${data.labs_ast}(IU/L)</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">ALT: </div>
                <div class="efd-cell2">${data.labs_alt}(IU/L)</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">INR: </div>
                <div class="efd-cell2">${data.labs_inr}</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">Meld: </div>
                <div class="efd-cell2">${formatMeldScore(data.labs_meld)}</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">Fibrosis: </div>
                <div class="efd-cell2">${data.fibro_Value}</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">Platelets: </div>
                <div class="efd-cell2">${data.labs_platelets}(10^9/L)</div>
            </div>
            <div class="col-md-4">
                <div class="efd-cell1">Bilirubin: </div>
                <div class="efd-cell2">${data.labs_total_bilirubin}(mg/dL)</div>
            </div>`;

    return html;
}

function getDemoGraphicData(data) {
    let html = '';

    html = '<div class="col-md-4">' +
        '<div class="efd-cell1">Weight: </div>' +
        '<div class="efd-cell2">' + data.weight + ' (Kg)</div>' +
        '</div>' +
        '<div class="col-md-4">' +
        '<div class="efd-cell1">Ethinicity: </div>' +
        '<div class="efd-cell2">' + data.ethnicity + '</div>' +
        '</div>' +
        '<div class="col-md-4">' +
        '<div class="efd-cell1">Race: </div>' +
        '<div class="efd-cell2">' + data.race + '</div>' +
        '</div>';

    return html;
}

export function getClickFilterObj(dataKey, filterKey, filtersArray) {

    filterKey = !filterKey ? null : filterKey.toLowerCase();

    let jsonObj = {};
    jsonObj['key'] = null;
    jsonObj['value'] = null;
    jsonObj['identifier'] = filterKey;
    jsonObj['type'] = 'value';
    jsonObj['altkey'] = null;

    switch (filterKey) {
        case 'genotype':
            jsonObj['key'] = 'genotype';
            jsonObj['value'] = dataKey.id;
            break;

        case 'treatment':
            jsonObj['key'] = 'treatment';
            jsonObj['value'] = dataKey.id;
            break;

        case 'cirrhosis':
            jsonObj['key'] = 'cirrhosis';
            jsonObj['value'] = dataKey.id == 'Cirrhosis' ? 'Yes' : 'No';
            break;

        case 'apri':
            jsonObj['key'] = 'disease_progression';
            jsonObj['value'] = dataKey.id == 'APRI > 1' ? 'Y' : 'N';
            break;

        case 'risk':
            jsonObj['key'] = dataKey.id;
            jsonObj['value'] = dataKey.value;
            break;

        case 'risk1':
            jsonObj['key'] = dataKey.id;
            jsonObj['value'] = dataKey.value;
            break;


        case 'costburden':
            jsonObj['key'] = dataKey.id;
            jsonObj['value'] = 1;
            jsonObj['altkey'] = dataKey.id.split(' ').join('_').toLowerCase()
            break;

        case 'race':
            jsonObj['key'] = 'race';
            jsonObj['value'] = dataKey.id;
            break;

        case 'ethnicity':
            jsonObj['key'] = 'ethnicity';
            jsonObj['value'] = dataKey.id;
            break;

        case 'gender':
            jsonObj['key'] = 'gender';
            jsonObj['value'] = dataKey.id == 'Male' ? 'M' : 'F';
            break;

        case 'age':
            jsonObj['key'] = 'age';
            jsonObj['value'] = dataKey.id;
            jsonObj['type'] = 'range';
            break;

        case 'meldscore':
            jsonObj['key'] = 'labs_meld';
            jsonObj['value'] = dataKey.id;
            jsonObj['type'] = 'range';
            break;

        case 'fibrovalue':
            jsonObj['key'] = 'fibro_Value';
            jsonObj['value'] = dataKey.id;
            jsonObj['type'] = 'range';
            break;

        case 'dischargedate':
            jsonObj['key'] = 'dischargeDate';
            jsonObj['value'] = dataKey.id;
            jsonObj['type'] = 'date';
            break;

        case 'medication':
            jsonObj['key'] = 'antiviral_therapy';
            jsonObj['value'] = dataKey.id;
            break;

        case 'ctpscore':
            jsonObj['key'] = 'ctpScore';
            jsonObj['value'] = dataKey.id;
            jsonObj['type'] = 'range';
            break;

        case 'cirrhosistype':
            jsonObj['key'] = 'cirrhosistype';
            jsonObj['value'] = dataKey.id;
            break;
    }
    if (filtersArray.length > 0) {
        if (filterKey == "fibrovalue" || filterKey == "cirrhosistype") {
            if ((filtersArray.find(x => x.key == jsonObj.key)) != null) {
                (filtersArray.find(x => x.key == jsonObj.key)).value = jsonObj.value;
                return filtersArray;
            }
        }
    }
    filtersArray.push(jsonObj);
    return filtersArray;
}

export function checkFilterExists(filterKey, filtersArray) {
    let filterObj = _.findWhere(filtersArray, {
        identifier: filterKey.toLowerCase()
    });

    if (filterObj)
        return true;
    else
        return false;
}

export function removeObjectsFromArray(initialArray, removeArray, removekey) {
    let defaultArray = _.clone(initialArray);
    for (var i = defaultArray.length - 1; i >= 0; i--) {
        for (var j = 0; j < removeArray.length; j++) {
            if (defaultArray[i] && (defaultArray[i][removekey] === removeArray[j][removekey])) {
                defaultArray.splice(i, 1);
            }
        }
    }
    return defaultArray;
}

export function addObjectsToArray(initialArray, addArray) {
    let defaultArray = _.clone(initialArray);
    for (let i = 0; i < addArray.length; i++) {
        defaultArray.push(addArray[i]);
    }
    return defaultArray;
}

export function filterForRangeObjects(modifiedData, rangeObjectsArray) {

    //filter for age object
    let ageObj = _.findWhere(rangeObjectsArray, {
        identifier: 'age'
    });

    if (ageObj) {
        let ageRange = ageObj.value.split('-'),
            minAge, maxAge = 0;
        minAge = ageRange[0].replace('+', '')
        maxAge = ageRange.length > 1 ? ageRange[1].replace('+', '') : 150;

        modifiedData = _.filter(modifiedData, function(rec) {
            return rec.age >= parseInt(minAge) && rec.age <= parseInt(maxAge)
        });
    }

    //filter for meldScore
    let meldObj = _.findWhere(rangeObjectsArray, {
        identifier: 'meldscore'
    });

    if (meldObj) {
        let valueRange = meldObj.value.split('-'),
            minValue, maxValue = 0;
        minValue = valueRange[0].replace('>', '')
        maxValue = valueRange.length > 1 ? valueRange[1].replace('>', '') : 150;

        modifiedData = _.filter(modifiedData, function(rec) {
            return rec.labs_meld >= parseFloat(minValue) && rec.labs_meld <= parseFloat(maxValue)
        });
    }

    //filter for fibro value
    let fibroObj = _.findWhere(rangeObjectsArray, {
        identifier: 'fibrovalue'
    });

    if (fibroObj) {
        let valueRange = fibroObj.value.split('-'),
            minValue, maxValue = 0;
        minValue = valueRange[0].replace('+', '')
        maxValue = valueRange.length > 1 ? valueRange[1].replace('+', '') : 150;

        modifiedData = _.filter(modifiedData, function(rec) {
            return rec.fibro_Value >= parseFloat(minValue) && rec.fibro_Value <= parseFloat(maxValue)
        });
    }

    //filter for meldScore
    let ctpObj = _.findWhere(rangeObjectsArray, {
        identifier: 'ctpscore'
    });

    if (ctpObj) {
        let valueRange = ctpObj.value.split('-'),
            minValue, maxValue = 0;
        minValue = valueRange[0].replace('>', '')
        maxValue = valueRange.length > 1 ? valueRange[1].replace('>', '') : 150;

        modifiedData = _.filter(modifiedData, function(rec) {
            return rec.ctpScore >= parseFloat(minValue) && rec.ctpScore <= parseFloat(maxValue)
        });
    }

    return modifiedData;
}


//function to export patients data
export function exportPatientsData(obj, fileName, data) {

    var patientsData = [];
    patientsData = jQuery.extend(true, [], data);

    //Generate a file name
    var showLabel = true;

    fileName = fileName || 'default_patient';
    //remove category_id from patients
    for (var i = 0; i < patientsData.length; i++) {
        delete patientsData[i]['category_id'];
    }


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

//function to get main data : previously created by Nisha just made it common
export function getFilteredDataOnDateCombos(datatoFilter, filtered) {
    let fromDate = $('#selectfromdate').val(),
        toDate = $('#selecttodate').val();

    let startDate = new Date(fromDate + '-01-01');
    let endDate = new Date(toDate + '-12-31');

    if (filtered == '') {
        datatoFilter = datatoFilter.filter(
            function(a) {
                return (new Date(a.dischargeDate) >= startDate && new Date(a.dischargeDate) <= endDate);
            });
        return datatoFilter;
    } else if (filtered == 'true') {
        let mdata = [];
        // mainData = AnalyticsTabData;
        datatoFilter = datatoFilter.filter(
            function(a) {
                return (new Date(a.dischargeDate) >= startDate && new Date(a.dischargeDate) <= endDate);
            });
    }
    return datatoFilter
}

// Function for the Therapy Distribution chart 
export function DrawTherapyDistribution(data, container) {
    $('#pharma_TherapyDistribution').empty();
    let medication = data.medication;
    if (medication.toLowerCase() != 'all') {
        let patientDataefficacy = data.patientData;
        // console.log(analyticsPatientsData['efficacy']);
        // //"8,12,16,24,48"
        // var totalData = patientDataefficacy.filter(function(a) {
        //     return (a.Medication == medication && a.isCured != null);
        // });
        // // console.log(totalData);

        // var curedData = patientDataefficacy.filter(function(a) {
        //     return (a.Medication == medication && a.isCured == 1);
        // });

        let groupedDatatreatmentPeriod = _.groupBy(patientDataefficacy, 'treatmentPeriod');
        let groupedDataGenotype = _.groupBy(patientDataefficacy, 'genotype');

        let xvalues = [];
        let dataplot = [];

        for (let item in groupedDataGenotype) {
            let jsonObj = {};
            let itemdata = [];
            jsonObj['name'] = item;
            groupedDatatreatmentPeriod = _.groupBy(groupedDataGenotype[item], 'treatmentPeriod');
            for (let keys in groupedDatatreatmentPeriod) {
                var eff = 0;

                var totalData = groupedDatatreatmentPeriod[keys].filter(function(a) {
                    return (a.Medication == medication && a.isCured != null);
                });
                // console.log(totalData);

                var curedData = groupedDatatreatmentPeriod[keys].filter(function(a) {
                    return (a.Medication == medication && a.isCured == 1);
                });


                if (parseFloat(curedData.length) > 0 && parseFloat(totalData.length) > 0) {
                    eff = (parseFloat(curedData.length) * 100) / parseFloat(totalData.length);
                }
                itemdata.push(eff);
            }
            jsonObj['data'] = itemdata;
            dataplot.push(jsonObj);
            // sum = 0;
            // if (parseFloat(groupedDataGenotype[item].length) > 0 && parseFloat(totalData.length) > 0) {
            //     sum = (parseFloat(groupedDataGenotype[item].length) * 100) / parseFloat(totalData.length);
            // }
            // itemdata.push(sum);
        }
        console.log(dataplot);
        for (let keys in groupedDatatreatmentPeriod) {
            xvalues.push(keys);
        }
        console.log(dataplot);
        Highcharts.chart(container, {
            chart: {
                type: 'column'
            },
            title: {
                text: ' '
            },
            xAxis: {
                categories: xvalues
            },
            credits: {
                enabled: false
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Efficacy %'
                },
                stackLabels: {
                    enabled: true,
                    formatter: function() {
                        return parseFloat(this.total).toFixed(2) + " %";
                    },
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                    }
                }
            },
            legend: {
                // align: 'right',
                // x: -30,
                // verticalAlign: 'top',
                // y: 25,
                // floating: true,
                // backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                // borderColor: '#CCC',
                // borderWidth: 1,
                // shadow: false
                show: false
            },
            tooltip: {
                formatter: function() {
                    var s = '<b> Week : ' + this.x + '</b>';

                    $.each(this.points, function(i, point) {
                        s += '<br/><b>  ' + point.series.name + ': </b>' + parseFloat(point.y).toFixed(2) + " %";
                    });

                    return s;
                },
                shared: true
            },
            plotOptions: {
                column: {
                    //   stacking: 'normal'
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return this.y.toFixed(2) + ' %';
                        }
                    }
                }
            },
            series: dataplot
        });

    }
}

//function to format meld score value
let formatMeldScore = (meldValue) => {
    let formatValue = '';

    if (isNaN(parseFloat(meldValue))) {
        formatValue = 'Not Available';
    } else {
        formatValue = parseFloat(meldValue).toFixed(2);
    }

    return formatValue;
}

//function to format viral load value
let formatViralLoad = (viralLoad) => {
    let formatValue = '';

    if (viralLoad) {
        if (isNaN(parseFloat(viralLoad))) {
            formatValue = viralLoad;
        } else {
            formatValue = parseFloat(viralLoad).toFixed(2) + 'M';
        }
    } else {
        formatValue = 'Not Available';
    }

    return formatValue;
}


let upperCaseFirstModel = (str) => {
    if (str)
        return str.charAt(0).toUpperCase() + str.substring(1);
    else
        return '';
}

export function renderDecisionTreeLabels(patientLength) {
    let params = Pinscriptive['Filters'];

    let geno = params.genotypes ? params.genotypes.replace(/\'/g, "") : 'All';
    let treat = params.treatment ? (params.treatment.replace(/\'/g, "") != 'naive,experienced' ? upperCaseFirstModel(params.treatment.replace(/\'/g, "")) : 'All') : 'All';
    let cirr = params.cirrhosis ? (params.cirrhosis.replace(/\'/g, "") != 'Yes,No' ? params.cirrhosis.replace(/\'/g, "") : 'All') : 'All';
    $(".FilteredPopupGenotypeValue").html(geno);
    $(".FilteredPopupTreatmentValue").html(treat);
    $(".FilteredPopupCihhosisValue").html(cirr);
    $(".commonPopupPatientCount").html(`<span style="cursor: default;"><i class="fa fa-users" aria-hidden="true"></i></span><p>${patientLength}</p>`);

}
export function renderDecisionTreePopup(data, sampleData, parentContainer) {

    let predictionClass = "cirrhosis";
    let training_data = data;

    let decistionTreeObj = decisionTreeLib.DecisionTreeID3(training_data, predictionClass, sampleData.featured);
    let predicted_class = decisionTreeLib.predict(sampleData.sample);
    console.log('prediction ' + predicted_class);
    console.log(predicted_class);
    $('#cirrhosisPredictionResultBox').show();
    if (predicted_class.val == "Yes") {
        $('#cirrhosisPredictionResultMessage').html(`Patient has ` + predicted_class.probability + `% risk of cirrhosis from above criteria`);
    } else {
        let prob = parseFloat(100 - predicted_class.probability).toFixed(2);
        $('#cirrhosisPredictionResultMessage').html(`Patient has ` + prob + `% risk of cirrhosis from above criteria`);
    }

    let treeModel = decisionTreeLib.toJSON();
    console.log('tree Model');
    console.log(treeModel);
    //$('#decisionTreeChartContent')
    // $('.' + parentContainer).empty();

    // let MainHtml = `<div class="popup-inner" style='width: 1280px!important; height: 648px; padding: 10px 20px;'>
    //                 <button type="button" class="close mlTabs_closebtn" ><span aria-hidden="true">×</span></button>
    //                 <div class="analyticsPatientsPopup-header"></div>
    //                 <div class="analyticsPatientsPopup-container"></div>`;

    // // header section
    // let headerHtml = ``;


    // headerHtml += `<div class="analyticsCommonPopupHeader" style="margin-top: -5px;">
    //                     <div class="analyticsCommonPopupHeaderInner">                            
    //                         <div class="analyticsCommonPopupFilterDesc">
    //                             <div class="analyticsCommonPopupFilterDescTitle">Genotype:</div>
    //                             <div class="analyticsCommonPopupFilterDescValue">${geno}</div>
    //                         </div>
    //                         <div class="analyticsCommonPopupFilterDesc">
    //                             <div class="analyticsCommonPopupFilterDescTitle">Treatment:</div>
    //                             <div class="analyticsCommonPopupFilterDescValue">${treat}</div>
    //                         </div>
    //                         <div class="analyticsCommonPopupFilterDesc">
    //                                 <div class="analyticsCommonPopupFilterDescTitle">Cirrhosis:</div>
    //                                 <div class="analyticsCommonPopupFilterDescValue">${cirr}</div>
    //                         </div>
    //                     </div>
    //                 </div>`;

}
// added by jayesh 18th May 2017 for prepare dom
export function prepareDomForComparisionCharts(plottingData) {
    analyticsLib.prepareDomForComparisionCharts(plottingData);
}

export function settingMedicationColor(medication) {
    let color;
    switch (medication) {
        case "HARVONI":
        case "H":
            color = "#C6FF00";
            break;
        case "PEGASYS":
        case "P":
            color = "#673AB7";
            break;
        case "SOVALDI":
        case "S":
            color = "#E57373";
            break;
        case "OLYSIO":
        case "O":
            color = "#FFF176";
            break;
        case "TECHNIVIE":
        case "T":
            color = "#2196F3";
            break;
        case "RIBAVIRIN":
        case "R":
            color = "#BA68C8";
            break;
        case "DAKLINZA":
        case "D":
            color = "#BDBDBD";
            break;
        case "VIEKIRA PAK":
        case "VIEKIRAPAK":
        case "V":
            color = "#B388FF";
            break;
        case "RIBAVIRIN + SOVALDI":
        case "RIBAVIRIN+SOVALDI":
        case "R+S":
            color = "#69bae7";
            break;
        case "OLYSIO + SOVALDI":
        case "OLYSIO+SOVALDI":
        case "O + S":
            color = "#EDE7F6";
            break;
        case "DAKLINZA + SOVALDI":
        case "DAKLINZA+SOVALDI":
        case "D + S":
            color = "#B3E5FC";
            break;
        case "PEGASYS + RIBAVIRIN + SOVALDI":
        case "PEGASYS+RIBAVIRIN+SOVALDI":
        case "P + R + S":
            color = "#7C4DFF";
            break;
        case "HARVONI + RIBAVIRIN":
        case "HARVONI+RIBAVIRIN":
        case "H + R":
            color = "#BA68C8";
            break;
        case "PEGASYS + SOVALDI":
        case "PEGASYS+SOVALDI":
        case "P + S":
            color = "#FF8A65";
            break;
        case "RIBAVIRIN + VIEKIRA PAK":
        case "RIBAVIRIN+VIEKIRAPAK":
        case "R + V":
            color = "#A1887F";
            break;
        case "DAKLINZA + RIBAVIRIN + SOVALDI":
        case "DAKLINZA+RIBAVIRIN+SOVALDI":
        case "D + R + S":
            color = "#7C4DFF";
            break;
        case "OLYSIO + RIBAVIRIN + SOVALDI":
        case "OLYSIO+RIBAVIRIN+SOVALDI":
        case "O + R + S":
            color = "#B3E5FC";
            break;
        case "PEGASYS + RIBAVIRIN":
        case "PEGASYS+RIBAVIRIN":
        case "P + R":
            color = "#64FFDA";
            break;
        case "RIBAVIRIN + TECHNIVIE":
        case "RIBAVIRIN+TECHNIVIE":
        case "R + T":
            color = "#0091EA";
            break;
        case "EPCLUSA":
        case "E":
            color = "#FFA500";
            break;
        case "ZEPATIER":
        case "Z":
            color = "#67818a";
            break;
        case "EPCLUSA + RIBAVIRIN":
        case "EPCLUSA+RIBAVIRIN":
        case "E + R":
            color = "#ffb732";
            break;
        case "OLYSIO + PEGASYS + SOVALDI":
        case "OLYSIO+PEGASYS+SOVALDI":
        case "O+P+S":
            color = "#b27300";
            break;
        case "PEGASYS + RIBAVIRIN + VICTRELIS":
        case "PEGASYS+RIBAVIRIN+VICTRELIS":
        case "P+R+V":
            color = "#ff4c4c";
            break;
        case "RIBAVIRIN + ZEPATIER":
        case "RIBAVIRIN+ZEPATIER":
        case "R+Z":
            color = "#cc0000";
            break;

    }
    return color;
}