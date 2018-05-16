/*
    * Utilities Function for the DashBoard
 */


/*
    function to invoke filtering for the dashboard data based on filter objects
    PARAMETERS
    datakey : c3/d3 data object
    filterKey : key value for filter
    dataInfoObj : object contiang filterArrays & base data
*/
export function filterPatientsByChart(dataKey, filterKey, filtersArray) {
    //prepare filter objects
    filtersArray = prepareFilterObj(dataKey, filterKey, filtersArray);
    //get modified data
    return filtersArray;

}

/*
    function to add breadCrum for the filtered data
    PARAMETERS
    breadCrumsData: array of filter objects
    parentWrapper: dom element on which the breadCrums are to be appended
*/
export function addFilterBreadCrums(breadCrumsData, parentWrapper) {
    //let parentWrapper = 'dashBoard-breadCrumSections';
    let breadCrums = ``;

    $('.' + parentWrapper).hide();

    //create bread crum sections for all filter objects
    for (let i = 0; i < breadCrumsData.length; i++) {
        let fiterData = breadCrumsData[i];
        let label = fiterData.key ? fiterData.key.split('_').join(' ') : '';
        let value = fiterData.value;
        if(label == 'CLAIMS INSURANCEPLAN') {
            label = 'Insurance Group';
        }
        if(label == 'CLAIMS INSURANCEPLANSub') {
            label = 'Insurance Plan';
        }
        if(label == 'yearAdmission') {
            label = 'Year';
        }
        //Praveen 03/22/2017 Added conditions for 1 to Yes convert
        if(value == 1){
          value = "Yes";
        }
        else if(value == 0){
          value = "No";
        }
        //Praveen 03/29/2017 Added condition for null value
        else if(value == null){
          value = "Not Available";
        }
        else{}

        breadCrums += `<div class="dashBoard-breadCrum">
                            <div class="dashBoard-filterkey">${label} : </div>
                            <div class="dashBoard-filterValue">${value}</div>
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
        if (breadCrumsData.length) {
            $('.' + parentWrapper).show();
        }

    }, 100);
}


/*
    function to remove breadCrums
    PARAMETERS
    obj: dom object on which event is triggered
    filtersArray: array of filters objects
    removeAll: boolean to clear all filters
*/
export function deleteBreadCrum(obj, filtersArray, removeAll) {

    let filterkey = $(obj).attr('key');

    //remove the object from filterdataKey
    filtersArray = _.without(filtersArray, _.findWhere(filtersArray, {
        identifier: $(obj).attr('key')
    }));

    if (removeAll) {
        filtersArray = [];
        $('.dashBoard-breadCrumSections').empty();
        Session.set('Mprob', '');
    }

    return filtersArray;
}


/*
    function to prepare filters objects
    PARAMETERS
    dataKey: c3/d3 click data object
    filterKey: key for filterring data
    filtersArray: array of filters objects
*/
function prepareFilterObj(dataKey, filterKey, filtersArray) {

    filterKey = !filterKey ? null : filterKey.toLowerCase();

    let jsonObj = {};
    jsonObj['key'] = null;
    jsonObj['value'] = null;
    jsonObj['identifier'] = filterKey;
    jsonObj['type'] = 'value';

    switch (filterKey) {
        case 'genotype':
            jsonObj['key'] = 'genotype';
            jsonObj['value'] = dataKey.id == 'Undetected'?null:dataKey.id;
            break;

        case 'treatment':
            jsonObj['key'] = 'treatment';
            jsonObj['value'] = dataKey.id;
            break;

        case 'cirrhosis':
            if (dataKey['cirrhosis'] == 'Cirrhosis') {
                jsonObj['key'] = 'cirrhosistype';
                jsonObj['value'] = dataKey.id;
            }
            else {
                jsonObj['key'] = 'cirrhosis';
                jsonObj['value'] = dataKey.id == 'Cirrhosis' ? 'Yes' : 'No';
            }

            break;

        case 'apri':
            jsonObj['key'] = 'APRI';
            jsonObj['value'] = dataKey.id == 'APRI > 1' ? '>1' : '<1';
            jsonObj['type'] = 'range';
            break;

        case 'risk':
            jsonObj['key'] = dataKey.id;
            jsonObj['value'] = 1;
            break;

        case 'costburden':
            jsonObj['key'] = dataKey.id;
            jsonObj['value'] = 1;
            break;

        case 'race':
            jsonObj['key'] = 'race';
            jsonObj['value'] = dataKey.id.toUpperCase();
            break;

        case 'gender':
            jsonObj['key'] = 'gender';
            jsonObj['value'] = dataKey.id == 'Male' ? 'M' : 'F';
            break;

        case 'age':
            jsonObj['key'] = 'age';
            jsonObj['value'] = dataKey.id;
            //jsonObj['type'] = 'range';
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

        case 'date':
            jsonObj['key'] = 'date';
            jsonObj['value'] = dataKey;
            jsonObj['type'] = 'range';
            break;

        case 'medication':
            jsonObj['key'] = 'medication';
            jsonObj['value'] = dataKey.id;
            break;
        case 'insurance':
            jsonObj['key'] = 'CLAIMS_INSURANCEPLAN';
            jsonObj['value'] = dataKey.id;
            jsonObj['type'] = 'custom';
            break;
        case 'insurancetype':
            jsonObj['key'] = 'CLAIMS_INSURANCEPLANSub';
            jsonObj['value'] = dataKey.id;
            jsonObj['type'] = 'customsub';
            break;

        case 'svr':
            jsonObj['key'] = 'SVR';
            jsonObj['value'] = dataKey.id;
            jsonObj['type'] = 'range';
            break;
        case 'retreated':
            jsonObj['key'] = 'IS_RETREATED';
            jsonObj['value'] = 'YES';
            break;
        case 'map':
            jsonObj['key'] = 'state_code';
            jsonObj['value'] = dataKey.id;
            break;
        case 'fibrostage':
            jsonObj['key'] = 'FibrosureStage';
            jsonObj['value'] = dataKey.id;
            break;
        case 'svr12':
            jsonObj['key'] = dataKey.id;
            jsonObj['value'] = dataKey.value;
            break;
        case 'is_completed':
            jsonObj['key'] = dataKey.id;
            jsonObj['value'] = dataKey.value;
            break;
        case 'no_prescription':
            jsonObj['key'] = dataKey.id;
            jsonObj['value'] = dataKey.value;
            break;
        case 'year':
            jsonObj['key'] = 'yearAdmission';
            jsonObj['value'] = ~~dataKey.id;
            break;
        
    }

    filtersArray.push(jsonObj);

    return filtersArray;
}

/*
    function to check whether the filter exists, params
    PARAMETERS
    filterkey : key to find filter name
    filtersArray : Array of filter objects
*/
export function checkFilterExists(filterKey, filtersArray) {
    let filterObj = _.findWhere(filtersArray, { identifier: filterKey.toLowerCase() });
    return filterObj?true:false;
}


//function to finalize the filter process
export function finalizeFilterProcess(modifiedData, selectizeCombo) {

    $('.totalPatientsCountDashboard').html(commaSeperatedNumber(modifiedData.totalpatients));
    let genderData = modifiedData.gender;
    $('.femalePatientsCount').html(commaSeperatedNumber(genderData['F'] ? genderData['F'].count : 0));
    $('.malePatientsCount').html(commaSeperatedNumber(genderData['M'] ? genderData['M'].count : 0));
    $('.transgenderPatientsCount').html(commaSeperatedNumber(genderData['U'] ? genderData['U'].count : 0));


    selectizeCombo.selectize.setValue("select");
    $('.genotypeDistSelect').trigger('change');
}

export let showChartMask = () =>{
    $('.mlSubTabsChartSectionMask').show();
    $('.dashboardWrap').hide();
}
export function hideChartMask() {
    setTimeout(function () {
        $('.mlSubTabsChartSectionMask').hide();
        $('.dashboardWrap').show();
    }, 700);
}

export function findMax(data, key) {
    var max = _.max(_.pluck(data, key));
    return max;
}

export function camelCaseToActualWord(text) {
    var word = text;
    // insert a space before all caps
    var temp = word.replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    var finalWord = temp.replace(/^./, function (str) {
        return str.toUpperCase();
    });
    if (finalWord.toLowerCase() == 'hiv') {
        return finalWord.toUpperCase();
    } else {
        return finalWord;
    }
}


//function to convert into upper case first letter
export  let toTitleCase = (str) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
