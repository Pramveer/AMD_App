import {
    Meteor
} from 'meteor/meteor';
//function to prepare dom for patients data
// Nisha 02/20/2017 Change in functions for common cohor
export function prepareDomForPharmaPatients(dataObj, medicinename) {

    let geno = 'All',
        treat = 'All',
        cirr = 'All';
    // if(isSessionFilterSet())
    // {
    //     geno = Session.get('pharmaGenotype') && Session.get('pharmaGenotype') != '' ? Session.get('pharmaGenotype') : 'All';
    //     treat = Session.get('pharmaTreatment') && Session.get('pharmaTreatment') != '' ? upperCaseFirstModel(Session.get('pharmaTreatment')) : 'All';
    //     cirr = Session.get('pharmaCirrhosis') && Session.get('pharmaCirrhosis') != '' ? upperCaseFirstModel(Session.get('pharmaCirrhosis')) : 'All';
    // }
    // else
    if (AmdApp.Filters) {
        let params = AmdApp['Filters'];

        geno = params.genotypes ? params.genotypes.replace(/\'/g, "") : 'All';
        treat = params.treatment ? (params.treatment.replace(/\'/g, "") != 'naive,experienced' ? upperCaseFirstModel(params.treatment.replace(/\'/g, "")) : 'All') : 'All';
        cirr = params.cirrhosis ? (params.cirrhosis.replace(/\'/g, "") != 'Yes,No' ? params.cirrhosis.replace(/\'/g, "") : 'All') : 'All';
    }
    $('.pharmaPatientsPopup').empty();

    let MainHtml = `<div class="popup-inner" style='width: 1280px!important; height: 648px; top: 50%; padding: 10px 20px;'>
	                <button type="button" class="close pharma_closebtn" ><span aria-hidden="true">×</span></button>
                    <div class="pharmaPatientsPopup-header"></div>
                    <div class="pharmaPatientsPopup-container"></div>`;

    // header section
    let headerHtml = ``;


    headerHtml += `<div class="analyticsCommonPopupHeader" style="margin-top: -5px;">
                        <div class="analyticsCommonPopupHeaderInner">`;
    if (medicinename && medicinename != 'all') {
        headerHtml += `<div class="analyticsCommonPopupDrugName">${medicinename} </div>`;
    }
    headerHtml += `<div class="analyticsCommonPopupFilterDesc">
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
                                <div class="analyticsCommonPopupOptionsButton commonPopupPatientCount"><span style="cursor: default;"><i class="fa fa-users" aria-hidden="true"></i></span><p>${dataObj.length}</p></div>
                                <div title="Export Patients" class="analyticsCommonPopupOptionsButton commonPopupExportPatientIcon"><span><i class="fa fa-share-square-o" aria-hidden="true"></i></span></div>
                            </div>
                        </div>
	                </div>`;

    //container for patient data
    let patientContentHtml = `<div class="analyticsCommonPopupPatientContent">`;
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

    patientContentHtml += `<div class="ecf-patientContainer mlPatientsDetailWrapper">`;

    for (let i = 0; i < dataObj.length; i++) {
        patientContentHtml += `<div class="ecf-patientRow js-ecf-patientRow" child="hidden" patient="${dataObj[i].PATIENT_ID_SYNTH}" id="${dataObj[i].PATIENT_ID_SYNTH}_PRow">
                                    <div class="showInRow">${dataObj[i].PATIENT_ID_SYNTH}</div>
                                    <div class="showInRowMin">${dataObj[i].Age}</div>
                                    <div class="showInRowMin">${getGenderType(dataObj[i].GENDER_CD)}</div>
                                    <div class="showInRowMin">${dataObj[i].GENOTYPE}</div>
                                    <div class="showInRow" >${dataObj[i].TREATMENT}</div>
                                    <div class="showInRowMin">${dataObj[i].CIRRHOSIS}</div>
                                    <div class="showInRow">${formatViralLoadValue(dataObj[i].VIRAL_LOAD)}</div>
                                    <div class="showInRow" >${getLiverAssessmentType(dataObj[i].LIVER_ASSESMENT)}</div>
                                    <div class="showInRowMax" >${dataObj[i].RACE_DESC}</div>
                                    <div class="showInRow" >${dataObj[i].ETHNITY_1_DESC}</div>
                                    </div>`;
    }
    patientContentHtml += '</div>';
    MainHtml += headerHtml;
    MainHtml += patientContentHtml;
    MainHtml += `</div>`;


    $('.pharmaPatientsPopup').html(MainHtml);
    // $('.' + parentContainer).show();
    //bind export patient button  click event
    $('.commonPopupExportPatientIcon').click(function() {
        exportPatientsData($(this), 'Pharma_' + medicinename + '_Patients', dataObj);
    });

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


function formatViralLoadValue(viralLoad) {
    if (viralLoad == null || viralLoad == undefined) {
        return "Not Available"
    } else if (viralLoad == "DETECTED" || viralLoad == "NOT DETECTED") {
        return viralLoad;
    } else {
        return viralLoad + ' M';
    }
}

let upperCaseFirstModel = (str) => {
    if (str)
        return str.charAt(0).toUpperCase() + str.substring(1);
    else
        return '';
}
export function getGenderType(value) {
    if (value == 'M')
        return 'Male';
    else if (value == 'F')
        return 'Female';
    else if (value == 'U')
        return 'Unknown';
}

export function getLiverAssessmentType(value) {
    if (value < 2)
        return 'No';
    else
        return 'Yes';
}

export function setPharmaHeaderTabData() {

    //Praveen 02/20/2017 show sub menu icon on pharma
    $('.pharmasubmenu_Btn').show();
    if (!AmdApp.Filters) {
        // $('#desc_cirrhosis_pharma').find('.efd-cell2_subpopulaiton').html('ALL');
        // $('#desc_treatment_pharma').find('.efd-cell2_subpopulaiton').html('ALL');
        // $('#desc_genotype_pharma').find('.efd-cell2_subpopulaiton').html('ALL');
        $('#desc_cirrhosis').find('.efd-cell2_subpopulaiton').html('ALL');
        $('#desc_treatment').find('.efd-cell2_subpopulaiton').html('ALL');
        $('#desc_genotype').find('.efd-cell2_subpopulaiton').html('ALL');
        $('.header-medicationInfo .ecf-Medication').html("ALL");
        // $('#desc_medication_pharma').find('.efd-cell2_subpopulaiton').html('ALL');
    }
    // $('#desc_cirrhosis_pharma').find('.efd-cell2_subpopulaiton').html(convertFirstLetterCaps(Session.get('pharmaCirrhosis') != null ? Session.get('pharmaCirrhosis').replace(/'/g, '').toString() : 'All'));
    //
    // $('#desc_treatment_pharma').find('.efd-cell2_subpopulaiton').html(convertFirstLetterCaps(Session.get('pharmaTreatment') != null ? Session.get('pharmaTreatment').replace(/'/g, '').toString() : 'All'));
    // //let genotypes = '';
    //
    // if (Session.get('pharmaGenotype') && Session.get('pharmaGenotype').length > 0) {
    //     $('#desc_genotype_pharma').find('.efd-cell2_subpopulaiton').html(Session.get('pharmaGenotype').join(',').replace(/'/g, '').toString());
    // } else {
    //     $('#desc_genotype_pharma').find('.efd-cell2_subpopulaiton').html('ALL');
    // }
    // if (Session.get('pharmamedicine') && Session.get('pharmamedicine') != '') {
    //     $('#desc_medication_pharma').find('.efd-cell2_subpopulaiton').html(convertFirstLetterCaps(Session.get('pharmamedicine').replace(/'/g, '').toString()));
    // } else {
    //     $('#desc_medication_pharma').find('.efd-cell2_subpopulaiton').html(convertFirstLetterCaps('All'));
    //
    // }
    //$('#desc_genotype_pharma').find('.efd-cell2_subpopulaiton').html((Session.get('pharmaGenotype') != null || Session.get('pharmaGenotype') != '')? Session.get('pharmaGenotype').join(',').replace(/'/g, '').toString() : 'All');

}
//get genotypefilters data for given id
export let getGenotypeFromFiltters = (selectorId) => {
    let genotypes = '';

    //get text data from mutlisselect combo
    $('#' + selectorId + ' .multiSel').children().each(function(index) {
        genotypes += $(this).html().trim();
    });
    if (genotypes == 'All') {
        return [];
    }
    //remove last comma and change the genotype to array
    genotypes = genotypes[0] == ',' ? genotypes.substring(1, genotypes.length) : genotypes;
    genotypes = genotypes.split(',');
    return genotypes;
}

export let handleMultiGenoCombo = (ele) => {
        let className = $(ele).closest('.genotypeSelect').parent().parent().attr('id'); // Selecting the id of the container.

        let title = title_html = $(ele).val(); //$(ele).closest('.mutliSelect').find('input[type="checkbox"]').val();

        let selectedLength = $('#' + className + ' .multiSel').children().length;

        title_html = $(ele).val() + ',';

        //chekc if selected value is all
        if (title.toLowerCase() === 'all') {
            //loop for all the genotypes
            $('#' + className + ' .mutliSelect').find('input').each(function(index) {
                if ($(ele).is(':checked')) {
                    //if all is selected disable all other values except ALL
                    if (index) {
                        $(this).attr('disabled', true);
                        $(this).prop('checked', false);
                    }
                } else {
                    //Enable all values when all is diselected
                    $(this).attr('disabled', false);
                    $(this).prop('checked', false);
                }
            });

            //append all in value area if is selected
            if ($(ele).is(':checked')) {
                var html = '<span title="All">All</span>';
                $('#' + className + ' .multiSel').empty();
                $('#' + className + ' .multiSel').append(html);
            }
            //remove all from value area if is unselected
            else {
                $('#' + className + ' span[title="All"]').remove();
            }
            return;
        }

        //append the value in value area if is selected
        if ($(ele).is(':checked')) {
            var html = '<span title="' + title + '">' + title_html + '</span>';
            $('#' + className + ' .multiSel').append(html);
        }
        //remove the value from value area if is unselected
        else {
            $('#' + className + ' span[title="' + title + '"]').remove();
            let ret = $('.' + className + ' .hida');
            $('#' + className + ' .dropdown dt a').append(ret);
        }
    }
    /*
    export let getCurrentPopulationFilters = () => {

        //from common file
        //getCurrentPopulationFilters();

        try {

            let filters = AmdApp.Filters,
                othersFilters = {
                    age: filters.age || [],
                    alcohol: getArrFromFormattedStr(filters.alcohol),
                    apri: getArrFromFormattedStr(filters.apri), // filters.apri || [],
                    chemistry: getArrFromFormattedStr(filters.chemistry),
                    ethinicity: getArrFromFormattedStr(filters.ethinicity),
                    etoh: filters.etoh || [],
                    fibroscan: getArrFromFormattedStr(filters.fibroscan),
                    fibrosure: getArrFromFormattedStr(filters.fibrosure),
                    hcc: getArrFromFormattedStr(filters.hcc),
                    hiv: getArrFromFormattedStr(filters.hiv),
                    liverBiopsy: getArrFromFormattedStr(filters.liverBiopsy),
                    liverAssesment: getArrFromFormattedStr(filters.liver_assesment),
                    meld: filters.meld || [],
                    mentalHealth: getArrFromFormattedStr(filters.mental_health),
                    renalFailure: getArrFromFormattedStr(filters.renal_failure),
                    viralLoad: filters.viralLoad || [],
                    weight: filters.weight || [],
                    topN: filters.topPatient
                };
            ////If AmdApp.Filters doesn't have treatment and cirrhosis selection then set explicitly all
            // filters.cirrhosis = filters.cirrhosis ? filters.cirrhosis : "'Yes','No'";
            // filters.treatment = filters.treatment ? filters.treatment : "'naive','experienced'";

            console.log(filters.medication);

            //get the conditions for preacting antivirals
            //call from /import/client/lib/custom/common.js
            let getMedsAndPreactingData = combineMedsAndPreactingAntivirals(filters);

            let filterObj = {
                //string values to array
                genotypes: getArrFromFormattedStr(filters.genotypes),
                cirrhosis: getArrFromFormattedStr(filters.cirrhosis),
                treatment: getArrFromFormattedStr(filters.treatment),
                planType: getArrFromFormattedStr(filters.insurance),
                medication: getArrFromFormattedStr(filters.medication),
                duration: filters.timeFilter,
                othersFilters: othersFilters,
                medicationArray: getMedsAndPreactingData.medications,
                showPreactingAntivirals: getMedsAndPreactingData.usePreactingAntivirals
            }

            // console.log("************Filter Object****************");
            // console.log(filterObj);

            return filterObj;
        } catch (ex) {
            // console.log(ex);
        }
    }*/

// function to get array from string
let getArrFromFormattedStr = (str) => str ? str.replace(/['"]+/g, '').split(',') : [];

//get format parmatrs from Session
export let getFormattedParamsSession = () => {

    let genoTypes = Session.get('pharmaGenotype'); //_.compact(getGenotypeFromFiltters());
    let treatment = Session.get('pharmaTreatment'); //get treatment value
    let cirrhosis = Session.get('pharmaCirrhosis'); //get cirrhosis value
    let medication = Session.get('pharmamedicine'); //get medicine value
    // if(genoTypes && genoTypes != ''){
    //
    // }
    if (treatment && treatment != '' && treatment != 'all') {
        treatment = [treatment];
    } else {
        treatment = '';
    }
    if (cirrhosis && cirrhosis != '' && cirrhosis != 'all') {
        cirrhosis = [cirrhosis];
    } else {
        cirrhosis = '';
    }

    if (medication && medication != '' && medication != 'all') {
        medication = [medication]
    } else {
        medication = '';
    }
    //get all parameters
    let dbparams = {
        cirrhosis: cirrhosis,
        genotypes: genoTypes,
        treatment: treatment,
        medication: medication
    }
    return dbparams;
}
export let getDrugFilteredData = (pharmadata, parammedicine) => {

    let genoTypes = Session.get('pharmaGenotype'); //_.compact(getGenotypeFromFiltters());
    let treatment = Session.get('pharmaTreatment'); //get treatment value
    let cirrhosis = Session.get('pharmaCirrhosis'); //get cirrhosis value
    let medicine = Session.get('pharmamedicine'); //get medicine value
    let filteredpharmaData = pharmadata;

    if (medicine && medicine != 'all') {
        filteredpharmaData = filteredpharmaData.filter(a => a.MEDICATION.toLowerCase().indexOf(medicine.toLowerCase()) > -1);
    }

    if (treatment && treatment != 'all') {
        filteredpharmaData = filteredpharmaData.filter((a) => a.TREATMENT == treatment);
    }

    if (cirrhosis && cirrhosis != 'all') {
        filteredpharmaData = filteredpharmaData.filter((a) => a.CIRRHOSIS == cirrhosis);
    }
    // console.log(genoTypes);
    if (genoTypes && genoTypes.length > 0) {
        filteredpharmaData = _.filter(filteredpharmaData, function(e) {
            for (var i = 0; i < genoTypes.length; i++) {
                if (e.GENOTYPE == genoTypes[i]) {
                    return e;
                }
            }
        })
    }
    //set patient count on header
    $('.searchPatientCountHeaderPharma').html(filteredpharmaData.length);
    return filteredpharmaData;
}


export function showChartLoading() {
    $('.mlSubTabsChartSectionMask').show();
    $('.mlSubTabsChartSectionWrap').hide();
}

export function hideChartLoading() {
    setTimeout(function() {
        $('.mlSubTabsChartSectionMask').hide();
        $('.mlSubTabsChartSectionWrap').show();
    }, 1000);
}

//set header of patient
export let setPharmaHeader = () => {
    //render header for pharma tab
    $('#headerSingleSearch').empty();
    $('.pharmaMedicationAdvanced').show();
    $('.insurancePayer').hide();
    $('.pharmasubmenu_Btn').show();
    // highLightTab('Pharma');
    // $('.pharmaMedicationAdvanced').show();
    // $('.insurancePayer').hide();
    // UI.render(Template.HeaderInnerContentPharma, $('#headerSingleSearch')[0]);
    // setPharmaHeaderTabData();
    // console.log("pharma");

    UI.renderWithData(Template.HeaderInnerContentEditMode, "pharma", $('#headerSingleSearch')[0]);

    setCohortHeaderMenu({ tabName: "pharma" });
}

// This function true or false based on session defined or not for pharma tab
export let isSessionFilterSet = () => {
    let isDefined = Session.get('pharmaTreatment') !== undefined || Session.get('pharmaCirrhosis') !== undefined || Session.get('pharmaGenotype') !== undefined || Session.get('pharmamedicine') !== undefined;
    return isDefined;
}

export let setAdvancedSearchFilters = () => {
    $('.pharmaMedicationAdvanced').show();
    $('.advancedSearchChange').html('Cohort Criteria');
    $('.analyticssubmenu_Btn').hide();
    $('.pharmasubmenu_Btn').show();
}


//get druglist
export let getDrugList = () => {
    let dummyMedication = [];
    let drugArray = ["PegIntron", "Pegasys", "Victrelis"];
    for (let i = 0; i < AllDrugs.length; i++) {
        let drugName = AllDrugs[i].name;
        if (drugArray.indexOf(drugName) == -1)
            dummyMedication.push(AllDrugs[i].name);
    }
    return dummyMedication;
}