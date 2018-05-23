import {
    Template
} from 'meteor/templating';

import './advancedsearch.html';


let PatientDataList = '';
Template.AdvancedSearch.onCreated(function() {

});

Template.AdvancedSearch.rendered = function() {

    //var acc = document.getElementsByClassName("accordionlist");
    //close nav bar on outside click
    // $(document).on('mouseup', function(e) {
    //     var container = $('.top-navigation-div');
    //     if (!container.is(e.target) // if the target of the click isn't the container...
    //         &&
    //         container.has(e.target).length === 0) // ... nor a descendant of the container
    //     {
    //         if ($('.daterangepicker').css('display') == 'none')
    //             closeNav();
    //         else {
    //             //closeNav();
    //         }
    //         // else{
    //         //
    //         // }
    //     }
    // });

    //// ## NEW CODE FOR CHECK DATEPICKER IS VISBLE OR NOT
    $(document).on('mouseup', function(e) {
        var container = $('.top-navigation-div');
        if (!container.is(e.target) // if the target of the click isn't the container...
            &&
            container.has(e.target).length === 0) // ... nor a descendant of the container
        {

            //Get all daterangepicker in variable
            let isDatePickerVisible = false;
            let allDateRangeInstance = $('.daterangepicker');

            _.each(allDateRangeInstance, function(itm) {
                // If one instance display is block then it is visible
                if ($(itm).css('display') == 'block') {
                    isDatePickerVisible = true;
                    //console.log($(itm).css('display'));
                }

            });
            // if ($('.daterangepicker').parent().length == 1 && $('.daterangepicker.dropdown-menu.ltr.opensright.show-calendar').css('display') == 'none')
            // If one div contains block that means it is visible in page
            if (!isDatePickerVisible)
                closeNav();
            else {
                //closeNav();
            }

        }
    });
    ////  ## NEW CODE END
    var i;
    // $('body').not('.searchPatientMenu').on('çlick', function() {
    //     //close navigation Option
    //     if($('.daterangepicker').is('hidden'))
    //       closeNav();
    // });

    if (AmdApp['Filters'] != null) {
        setFilterHeader(AmdApp['Filters']);
    }
    setSelectedFilters(AmdApp['Filters']);

    //Praveen 02/22/2017 changed '01/07/2010' to new Date('01/07/2010')
    //Modified By Praveen 03/24/2017 date changed to 01/01/2013 to current date
    let start = new Date('01/01/2013'); //moment().subtract(6, 'year');
    let end = new Date(); //.subtract(1, 'year');
    //initilise date picker
    try{
        $('input[name="chkTreatmentTime"]').daterangepicker({
            startDate: start,
            endDate: end,
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last 3 Month': [moment().subtract(3, 'month').startOf('month'), moment().subtract(3, 'month').endOf('month')]

            }
        }, cb);

        $('#chkTreatmentTime').on('apply.daterangepicker', function(ev, picker) {
            //openNav();
        });
        $('#chkTreatmentTime').on('cancel.daterangepicker', function(ev, picker) {
            //do something, like clearing an input
            $('#chkTreatmentTime').val('');
            //openNav();
        });
    }catch(ex){

    }
    
    $('.accordionlist').on('click', (e) => {

        $('.accordionlist').each((d, element) => {
            if ($(element).hasClass('active') == true && $(element).text() != $(e.currentTarget).text()) {
                $(element).removeClass('active');
                $(element).next().removeClass('show');
            }
        });

        //current accordion list check
        if ($(e.currentTarget).hasClass('active')) {
            $(e.currentTarget).removeClass('active');
            $(e.currentTarget).next().removeClass('show');
        } else {
            $(e.currentTarget).addClass('active');
            $(e.currentTarget).next().addClass('show');
        }

    });
};

Template.AdvancedSearch.events({
    'click .ApplyFilterbtn': function(e, template, triggerData) {
        //   template.loading.set(true);
        // to render the FDA Complient tab on the provider tab.
        e.stopPropagation();

        /**
         * @author Yuvraj Pal 10th Feb 17
         * @desc We are clearing the main caching object when apply button is clicked
         */
        //executeApplyButtonClick(e, template, triggerData);
        Meteor.call('clearCachingObj', (error, result) => {
            // result will return true after clearing the object.
            if (result) {
                $('#popupForLoading').show();
                executeApplyButtonClick(e, template, triggerData);
            }
        });
    },
    'click .resetFilterbtn': function(e, template) {
        $('.search-checkbox-btn').prop('checked', false);
    },
    'click .js-advFilters-showMedsComboIcon': (e, template) => {
        let comboSection = $(e.currentTarget).next();
        let isHidden = $(comboSection).attr('ishidden') == 'true' ? true : false;

        if (isHidden) {
            $(comboSection).show({
                duration: 400,
                easing: 'swing'
            });
            $(comboSection).attr('ishidden', 'false');
        } else {
            $(comboSection).hide();
            $(comboSection).attr('ishidden', 'true');
        }
    }
});

Template.AdvancedSearch.helpers({

    'getGenotypeList': () => PatientsGenotypeList,

    'getEthnicityList': () => EthnicityList,

    'getInsuranceList': () => ClaimsInsurancePlan.filter((d) => d.claims_insurancePlan != null) || [],

    'filterInsurance': (data) => data != null ? data.replace(' ', '') : '',

    'getMedication': () => {
        let dummyMedication = [];

        let drugArray = ["PegIntron", "Pegasys", "Victrelis"]
        for (let i = 0; i < AllDrugs.length; i++) {
            let drugName = AllDrugs[i].name;
            if (drugArray.indexOf(drugName) == -1)
                dummyMedication.push({
                    'name': AllDrugs[i].name,
                    'drugId': i + 1
                });
        }
        return dummyMedication;
    },
    'getMedicationComboData': (medName, drugId) => {
        let doComboExitsts = false;
        let distinctMeds = DistinctMedicationCombinations.reactive();

        // if(isPreacting) {
        //     distinctMeds = DistinctPreactingAntivirals.reactive();
        // }

        let possibleComboMeds = [];

        if (!medName) {
            return;
        }

        medName = medName.toUpperCase();

        //filter only where medication exists in combination
        for (let i = 0; i < distinctMeds.length; i++) {
            let drug = distinctMeds[i].MEDICATION;
            if (drug.indexOf('+') > -1) {

                //check if drug exists in combinations
                if (drug.indexOf(medName) > -1) {
                    doComboExitsts = true;
                    let json = {};
                    json.drugId = drugId + '_' + (i + 1);
                    json.name = drug;
                    possibleComboMeds.push(json);
                }
            }
        }

        return {
            isCombo: doComboExitsts,
            comboData: possibleComboMeds
        };
    },
    'getPreactingAntvirals': () => {
        let preActingMeds = [
            { name: 'Ribavirin', drugId: 21 },
            { name: 'Pegasys', drugId: 22 }
        ];
        return preActingMeds;
    },
    'getPreactingComboData': (medName, drugId) => {
        let doComboExitsts = false;
        let distinctMeds = DistinctPreactingAntivirals.reactive();

        let possibleComboMeds = [];

        if ((!medName) || (medName.toUpperCase() == 'RIBAVIRIN')) {
            return;
        }

        medName = medName.toUpperCase();

        //filter only where medication exists in combination
        for (let i = 0; i < distinctMeds.length; i++) {
            let drug = distinctMeds[i].MEDICATION;
            if (drug.indexOf('+') > -1) {

                //check if drug exists in combinations
                if (drug.indexOf(medName) > -1) {
                    doComboExitsts = true;
                    let json = {};
                    json.drugId = drugId + '_' + (i + 1);
                    json.name = drug;
                    possibleComboMeds.push(json);
                }
            }
        }

        return {
            isCombo: doComboExitsts,
            comboData: possibleComboMeds
        };
    }
});


let getSelectedDataFromFiltersDuration = (name) => {
    let data = $('#' + name).data('daterangepicker');
    //praveen 03/29/2017 modified date format 
    let startDate = moment(data.startDate.format('YYYY/MM/DD')).format("YYYY-MM-DD"); //new Date(data.startDate._d).toISOString().split('T')[0];
    let endDate = moment(data.endDate.format('YYYY/MM/DD')).format("YYYY-MM-DD"); //new Date(data.endDate._d).toISOString().split('T')[0];
    return "BETWEEN '" + startDate + "' AND '" + endDate + "'";
}
let getSelectedDataFromFilters = (name) => {
    let resultArray = [],
        result = '';
    $.each($("input[name='" + name + "']:checked"), function(e) {
        resultArray.push(this.value);
    });
    if (resultArray.length > 0)
        result = resultArray.map(function(e) {
            return (e !== 'all') ? ("'" + e + "'") : e
        }).join(',');
    else
        result = null;
    return result;
}

let getSelectedDataFromFiltersWithOutQuoteInsurance = () => {
    let resultArray = [];
    let result = '';
    if ($("input[name='chkInsurancePlan']:checked").val() == 'all') {
        return null;
    }
    $.each($("input[name='chkInsurancePlan']:checked"), function(e) {
        resultArray.push(this.value);
    });
    if (resultArray.length > 0)
        result = resultArray.map(function(e) {
            return (e !== 'all') ? ("'" + e + "'") : e
        }).join(',');
    else
        result = null;
    return result;
}


let getSelectedDataFromFiltersWithOutQuotePreactingAntivirals = () => {
    let resultArray = [];
    let result = '';
    if ($("input[name='chkPreactingAntivirals']:checked").val() == 'all') {
        return null;
    }
    $.each($("input[name='chkPreactingAntivirals']:checked"), function(e) {
        resultArray.push(this.value);
    });
    if (resultArray.length > 0)
        result = resultArray.map(function(e) {
            return (e !== 'all') ? ("'" + e + "'") : e
        }).join(',');
    else
        result = null;
    return result;
}

let getSelectedDataFromFiltersWithOutQuoteMedication = () => {
        let resultArray = [];
        let result = '';
        if ($("input[name='chkMedication']:checked").val() == 'all') {
            return null;
        }
        $.each($("input[name='chkMedication']:checked"), function(e) {
            resultArray.push(this.value);
        });
        if (resultArray.length > 0)
            result = resultArray.map(function(e) {
                return (e !== 'all') ? ("'" + e + "'") : e
            }).join(',');
        else
            result = null;
        return result;
    }
    // function getSelectedDataFromFiltersWithOutQuote(name) {
    //     let resultArray = [];

//     $.each($("input[name='" + name + "']:checked"), function(e) {
//         resultArray.push(this.value);
//     });

//     if (resultArray.length > 0)
//         result = resultArray.map(function(e) {
//             // return (e !== 'all') ? ("'" + e + "'") : e
//             return (e !== 'all') ? ("" + e + "") : e
//         }).join(',');
//     else
//         result = null;
//     return result;
// }

function getSelectedDataFromFiltersWithOutQuote(name) {
    let resultArray = [];
    $.each($("input[name='" + name + "']:checked"), function(e) {
        resultArray.push(this.value);
    });
    if (resultArray.length > 0)
        return resultArray;
    else
        return null;
}

function setSelectedFilters(selectedFilters) {
    var filters = [];
    if (selectedFilters == null) return;
    filters.push(selectedFilters['cirrhosis'] != null ? selectedFilters['cirrhosis'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['treatment'] != null ? selectedFilters['treatment'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['genotypes'] != null ? selectedFilters['genotypes'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['hiv'] != null ? selectedFilters['hiv'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['mental_health'] != null ? selectedFilters['mental_health'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['renal_failure'] != null ? selectedFilters['renal_failure'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['liver_assesment'] != null ? selectedFilters['liver_assesment'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['fibrosure'] != null ? selectedFilters['fibrosure'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['liverBiopsy'] != null ? selectedFilters['liverBiopsy'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['fibroscan'] != null ? selectedFilters['fibroscan'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['hcc'] != null ? selectedFilters['hcc'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['chemistry'] != null ? selectedFilters['chemistry'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['alcohol'] != null ? selectedFilters['alcohol'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['age'] != null ? selectedFilters['age'] : []);
    filters.push(selectedFilters['ethnicity'] != null ? selectedFilters['ethnicity'].replace(/'/g, '').split(',') : []);
    filters.push(selectedFilters['meld'] != null ? selectedFilters['meld'] : []);
    filters.push(selectedFilters['etoh'] != null ? selectedFilters['etoh'] : []);
    filters.push(selectedFilters['weight'] != null ? selectedFilters['weight'] : []);
    filters.push(selectedFilters['viralLoad'] != null ? selectedFilters['viralLoad'] : []);
    filters.push(selectedFilters['apri'] != null ? selectedFilters['apri'] : []);

    var ele = ['chkCirrhosis', 'chkTreatment', 'chkGenoType', 'chkHIV', 'chkMentalHealth', 'chkRenalFailure', 'chkLiverAssessment',
        'chkFibrosure', 'chkLiverBiopsy', 'chkFibroscan',
        'chkHCC', 'chkChemistry', 'chkAlcohol', 'chkAge', 'chkEthnicity', 'chkMeld', 'chkEtoh', 'chkWeight', 'chkViralLoad', 'chkApri'
    ];
    for (var count = 0; count < filters.length; count++) {
        var coll = filters[count];
        for (var sel = 0; sel < coll.length; sel++) {
            $("input[name='" + ele[count] + "'][value='" + coll[sel] + "']").attr('checked', 'checked');
            // $("input[value='" + coll[sel] + "']").attr('checked', 'checked');
        }
    }
}

//set filter header data on cohort
function setFilterHeader(params) {
    if (params != null) {
        $("#filter_desc").show();
        $('#patient-pager').show();
        // $("#desc_patient_count").show();
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

        //set medication info in the filters
        setMedicationInfoInCohort();

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

    }
}


let closeNav = () => {
    if (document.getElementById("mySidenav") != null)
        document.getElementById("mySidenav").style.width = "0";
}
let cb = (start, end) => {
    $('#chkTreatmentTime span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
}

let handleMacLearnRefresh = (subTab) => {
    subTab = subTab.toLowerCase();
    //console.log(subTab);
    //handle the data refresh event for the machine learning respective tabs
    switch (subTab) {
        case 'disease prediction':
            $('.js-analytics-applyDateFilters').trigger('click', 'refresh');
            // Template.DiseaseProgression.reRender();
            // Template.DiseaseProgression.rendered();
            break;
            //Updated By Jayesh 18th april 2017 - updated tabname for solved cohort search is not working in survival rate tab
        case 'risk & survival rate':
            $('.js-analytics-applyDateFilters').trigger('click', 'refresh');
            break;

        case 'priority of treatment':
            $('.js-analytics-applyDateFilters').trigger('click', 'refresh');
            break;

        case 'cost burden':
            $('.js-analytics-applyDateFilters').trigger('click', 'refresh');
            break;

            // case 'risk distribution'://renamed tab fix issue for search
        case 'market view':
            $('.js-analytics-applyDateFilters').trigger('click', 'refresh');
            break;

        case 'progression model':
            $('.js-analytics-applyDateFilters').trigger('click', 'refresh');
            break;

        case 'treatment efficacy':
            // $('.js-analytics-applyDateFilters').trigger('click','refresh');
            $('.treatedApplyUniFiltersPJ').trigger('click', 'refresh');
            break;

        case 'comorbidity':
            // $('.js-analytics-applyDateFilters').trigger('click','refresh');
            $('.treatedApplyUniFiltersComo').trigger('click', 'refresh');
            // Template.comorbidityanalyticsml.executeComorbidityRender();
            break;

        case 'co-infections':
            $('.js-analytics-applyDateFilters').trigger('click', 'refresh');
            break;

        case 'patient journey':
            $('.js-analyticsPJ-applySideFilters').trigger('click', 'refresh');
            break;
        case 'retreatment':
            // console.log('M L retreatment distribution');
            $('.retreatmentdistribution li.active').trigger('click', 'refresh');
            break;
        default:
            $('.macLearningsubTabs-links li.active').trigger('click', 'refresh');
    }
}


function executeApplyButtonClick(e, template, triggerData) {
    patientRowNo = 1;
    let cirrhosis = getSelectedDataFromFilters('chkCirrhosis'),
        treatment = getSelectedDataFromFilters('chkTreatment'),
        genotypes = getSelectedDataFromFilters('chkGenoType'),
        hiv = getSelectedDataFromFilters('chkHIV'),
        mental_health = getSelectedDataFromFilters('chkMentalHealth'),
        renal_failure = getSelectedDataFromFilters('chkRenalFailure'),
        liver_assesment = getSelectedDataFromFilters('chkLiverAssessment'),
        fibrosure = getSelectedDataFromFilters('chkFibrosure'),
        liverBiopsy = getSelectedDataFromFilters('chkLiverBiopsy'),
        fibroscan = getSelectedDataFromFilters('chkFibroscan'),
        hcc = getSelectedDataFromFilters('chkHCC'),
        chemistry = getSelectedDataFromFilters('chkChemistry'),
        alcohol = getSelectedDataFromFilters('chkAlcohol'),
        // age = getSelectedDataFromFiltersWithOutQuote('chkAge'),
        age = getSelectedDataFromFilters('chkAge'),
        ethnicity = getSelectedDataFromFilters('chkEthnicity'),
        // meld = getSelectedDataFromFiltersWithOutQuote('chkMeld'),
        meld = getSelectedDataFromFilters('chkMeld'),
        // etoh = getSelectedDataFromFiltersWithOutQuote('chkEtoh'),
        etoh = getSelectedDataFromFilters('chkEtoh'),
        // weight = getSelectedDataFromFiltersWithOutQuote('chkWeight'),
        weight = getSelectedDataFromFilters('chkWeight'),
        // viralLoad = getSelectedDataFromFiltersWithOutQuote('chkViralLoad'),
        viralLoad = getSelectedDataFromFilters('chkViralLoad'),
        // apri = getSelectedDataFromFiltersWithOutQuote('chkApri'),
        apri = getSelectedDataFromFilters('chkApri'),
        insurance = getSelectedDataFromFiltersWithOutQuoteInsurance('chkInsurancePlan'),
        medication = getSelectedDataFromFiltersWithOutQuoteMedication('chkMedication'),
        preactingAntivirals = getSelectedDataFromFiltersWithOutQuotePreactingAntivirals('chkPreactingAntivirals'),
        duration = getSelectedDataFromFiltersDuration('chkTreatmentTime'),
        database = getSelectedDatabase('chkDatabase');
    topPatientSelection = null;
    let params = {};
    params['cirrhosis'] = cirrhosis;
    params['treatment'] = treatment;
    params['genotypes'] = genotypes;
    params['hiv'] = hiv;
    params['mental_health'] = mental_health;
    params['renal_failure'] = renal_failure;
    params['liver_assesment'] = liver_assesment;
    params['fibrosure'] = fibrosure;
    params['liverBiopsy'] = liverBiopsy;
    params['hcc'] = hcc;
    params['chemistry'] = chemistry;
    params['fibroscan'] = fibroscan;
    params['alcohol'] = alcohol;
    params['age'] = age;
    params['meld'] = meld;
    params['etoh'] = etoh;
    params['weight'] = weight;
    params['viralLoad'] = viralLoad;
    params['ethnicity'] = ethnicity;
    params['insurance'] = insurance;
    params['apri'] = apri;
    params['patientCount'] = true;
    params['rowNo'] = null;
    params['patientCountTab'] = 0;
    params['medication'] = medication;
    params.preactingAntivirals = preactingAntivirals;
    params['topPatient'] = $('#chkTreatmentN').val();
    params['timeFilter'] = duration;
    params['database'] = database;
    params['isCustomerDataset'] = isCustomerDataset();
    AmdApp['Filters'] = params;
    $('.validation-inspection').hide();

    if ((triggerData == 'update') && (params.genotypes)) {
        setFilterHeader(params);
        $('#popupForLoading').hide();
        return;
    }

    let dbParams = getCurrentPopulationFilters();
    dbParams.patientCount = true;

    Meteor.call('searchPatients', dbParams, (error, results) => {
        if (error || (results.length < 0)) {
            //console.log('No data fetched');
            if (patientCount != void 0)
                patientCount.set(0);
            //$('#headerSingleSearch').empty();

            setFilterHeader(params);
            window.clearTimeout(notificationPopupDelay);
            $('.fltlft').hide();
            $('.advanceSearchClickable').css({
                'opacity': '0.6',
                'pointer-events': 'none'
            });
            $('.validation-inspection').show();
            $('#inspected-validation').text('No Record Found..');
            notificationPopupDelay = setTimeout(function() {
                $('.validation-inspection').hide();
            }, 8000);
            closeNav(); //close search menu
            $('#popupForLoading').hide();
            return;
        } else {
            //console.log(results);
            //console.log(results);
            $('.switch').show();
            if (results[0].PATIENT_ID_SYNTH && results[0].PATIENT_ID_SYNTH != null) {

                let patientID = results[0].PATIENT_ID_SYNTH;
                if (results[0].Patient_Count) {
                    if (patientCount) {
                        patientCount.set(results[0].Patient_Count);
                    }
                    $('.searchPatientCountHeader').html(results[0].Patient_Count);
                    params['totalcount'] = results[0].Patient_Count;
                    AmdApp['Filters']['patientCountTab'] = results[0].Patient_Count;
                }

                $('.advanceSearchClickable').css({
                    'opacity': '1',
                    'pointer-events': 'all'
                });
                if (document.getElementById('patientID')) {
                    document.getElementById('patientID').innerHTML = '';
                }
                Router['PatientId'] = patientID;
                localStorage.PatientID = patientID;
                localStorage.isSearched = true;
                localStorage.removeItem("selectedDrugs");
                localStorage.removeItem("lastSelectedDrug");
                localStorage.removeItem("AllDrugsName");
                localStorage.removeItem("AllDrugsData");
                //console.log(results);
                AmdApp['SelectedPatient'] = results;
                $("#filter_desc").show();
                setFilterHeader(params);

                let activeTab = $('.top-navigation li.active a').html();
                if (activeTab == 'patient') {
                    $('.insurancePayer').hide();
                    //$('.pharmaMedicationAdvanced').hide();
                    //  if(Session.get('headerTab') != 'provider'){
                    // $('#headerSingleSearch').empty();
                    // UI.render(Template.HeaderInnerContentEditMode, $('#headerSingleSearch')[0]);
                    $('.searchPatientCountHeader').html(results[0].Patient_Count);
                    //  }
                    Router.go('/Patient/' + patientID);
                    Session.set('headerTab', 'patient');
                    $('.headerbuttonFilesection').hide();
                    //setFilterHeader(params);
                } else if (activeTab == 'provider') {
                    Session.set('headerTab', 'provider');
                    $('.insurancePayer').hide();
                    $('.headerbuttonFilesection').hide();
                    //$('.pharmaMedicationAdvanced').hide();
                    //Pram (10th Feb 17) Changed the click event as changed the wrapper class for design
                    let activeTab = $('.rweb-list li.active')[0].className.replace('active', '').trim();
                    if (activeTab == "withFDACompliant") {
                        Session.set('provider_subtab', 'withFDACompliant');
                    } else if (activeTab == "withoutFDACompliant") {
                        Session.set('provider_subtab', 'withoutFDACompliant');
                    }
                    // Jayesh 28 Feb 2017 Primary Care Tool Redirect to provider page
                    else if (activeTab == "screening-evaluation") {
                        Router.go('/provider');
                    } else {
                        Session.set('provider_subtab', 'allMedsData');
                    }

                    //Pram (10th Feb 17) Changed the click event as changed the wrapper class for design
                    //trigger click event for fetching data
                    $('.rweb-list li.active').trigger('click');

                } else if (activeTab == 'analytics') {
                    Session.set('headerTab', 'analytics');
                    //$('#headerSingleSearch').empty();
                    //$('.pharmaMedicationAdvanced').hide();
                    $('.insurancePayer').hide();
                    $('.headerbuttonFilesection').show();
                    //UI.render(Template.HeaderInnerContentAnalytics, $('#headerSingleSearch')[0]);
                    //Praveen 02/20/2017 common cohort
                    //UI.renderWithData(Template.HeaderInnerContentEditMode, "analytics", $('#headerSingleSearch')[0]);
                    //trigger click event for fetching data
                    let tabname = $('.Analytic_submenu_list li.active a').text(); //$('.analyticsSubTabs-links li.active a').text();
                    // console.log(tabname.toLowerCase());
                    tabname = tabname.toLowerCase().trim() == 'quality indicators' ? 'qualityIndicator' : tabname;

                    let itabName = $('.Analytic_submenu_list li.active a').attr("href").indexOf("MachineLearning"); // $('.Analytic_inner_submenu_list li.active').text().trim();
                    
                    if (itabName != -1) {
                        handleMacLearnRefresh(tabname);
                    } else {
                        // console.log(tabname.toLowerCase());
                        //if(tabname.toLowerCase() == 'waste opportunity'){
                        if(tabname.toLowerCase() == 'clinical appropriateness'){
                            $('.analyticsWaste').trigger('click', 'refresh');
                        }
                        else
                            $('.' + tabname.toLowerCase() + ' li.active').trigger('click', 'refresh');
                        // console.log('click event called');
                    }
                    // $('.' + tabname.toLowerCase() + 'Subtabs-links li.active').trigger('click', 'refresh');
                    //$('.patientsPopup-closeBtn').trigger('click', [{ 'data': 'refresh' }]);
                } else if (activeTab == 'payer') {
                    Session.set('headerTab', 'payer');
                    $('.insurancePayer').show();
                    $('.headerbuttonFilesection').hide();
                    $('.switch').hide();
                    //$('.pharmaMedicationAdvanced').hide();
                    // $('#headerSingleSearch').empty();
                    // UI.render(Template.HeaderInnerContentEditMode, $('#headerSingleSearch')[0]);
                    // UI.renderWithData(Template.HeaderInnerContentPayerTab, params, $('#headerSingleSearch')[0]);
                    //trigger click event for fetching data
                    $('.treatedApplyUniFilters').trigger('click', [{
                        'data': 'refresh'
                    }]);
                } else if (activeTab == 'pharma') {
                    Session.set('headerTab', 'pharma');
                    $('.insurancePayer').hide();
                    $('.headerbuttonFilesection').hide();
                    //$('.pharmaMedicationAdvanced').show();
                    //$('#headerSingleSearch').empty();

                    // UI.renderWithData(Template.HeaderInnerContentPharma, params, $('#headerSingleSearch')[0]);
                    //UI.renderWithData(Template.HeaderInnerContentEditMode, "pharma", $('#headerSingleSearch')[0]);
                    //// OLD CODE ActiveItem is undefined
                    // //trigger click event for fetching data
                    // let ActiveItem = $('.advancePharmaSubTabs-links li.active a').attr('id'); //$('.advancePharmaSubTabs-links li.active a').html();
                    ////NEW CODE


                    // //trigger click event for fetching data
                    let ActiveItem = $('.pharma_submenu_list li.active a').attr('id'); //$('.advancePharmaSubTabs-links li.active a').html();

                    //console.log(ActiveItem.toLowerCase());
                    //event trigger ofr each subtabs
                    //ActiveItem Should not be null or undefined
                    if (ActiveItem.toLowerCase() == "competitortab") {
                        Template.CompetitorAnalysis.fetchAndRenderData();
                    } else if (ActiveItem.toLowerCase() == "summarytab") {
                        Template.Summary.fetchAndRenderData(); //call template function
                    } else if (ActiveItem.toLowerCase() == "marketoverview") {
                        Template.MarketOverview.fetchAndRenderData(); //call template function
                    } else if (ActiveItem.toLowerCase() == "patientjourneytab") {
                        Template.PatientsJourney.executePatientsJourneyRender(true);
                    } else if (ActiveItem == "comorbidityTab") {
                        Template.ComorbidityAnalytics.fetchAndRenderData();

                    } else if (ActiveItem == "targetMarketTab") {
                        Template.DrugOccurance.fetchAndRenderData();

                    } else if (ActiveItem == "valuePropositionTab") {
                        Template.MedicationCost.fetchAndRenderData();
                    } else if (ActiveItem == "viralLoadTab") {
                        Template.AdvanceAnalytics.fetchAndRenderData();

                    } else if (ActiveItem.trim() == "physicianPatientTab") {
                        Template.PhysicianPatientTarget.fetchAndRenderData();
                    } else if (ActiveItem.trim() == "benchmarkTab") {
                        let activeTab = $('.rweb-list li.active a').attr('data');

                        if (activeTab == "withFDACompliant") {
                            Session.set('rwebenchmark_subtab', 'withFDACompliant');
                        } else if (activeTab == "withoutFDACompliant") {
                            Session.set('rwebenchmark_subtab', 'withoutFDACompliant');
                        } else {
                            Session.set('rwebenchmark_subtab', 'allMedsData');
                        }

                        //trigger click event for fetching data
                        $('.rweb-list li.active').trigger('click');
                    }
                } else {
                    $('.pharmaMedicationAdvanced').hide();
                    $('.insurancePayer').hide();
                    $('.headerbuttonFilesection').hide();
                    Router.go('/Patient/' + patientID);
                }
                closeNav(); //close search menu
                $('#popupForLoading').hide();

            } else {
                patientCount != void 0 ? patientCount.set(0) : '';
                $('.searchPatientCountHeader').html(0);
                $('.advanceSearchClickable').css({
                    'opacity': '0.6',
                    'pointer-events': 'none'
                });
                Router['PatientId'] = '';
                localStorage.PatientID = null;
                AmdApp['SelectedPatient'] = [];
                Router.go('/Patient');
                setFilterHeader(params);
                window.clearTimeout(notificationPopupDelay);
                $('.fltlft').hide();
                $('.validation-inspection').show();
                $('#inspected-validation').text('No Record Found..');
                notificationPopupDelay = setTimeout(function() {
                    $('.validation-inspection').hide();
                }, 8000);
                closeNav(); //close search menu
                $('#popupForLoading').hide();
            }
        }
    });

}


let getSelectedDatabase = (name) => {
    let value = $('#showSelectedDatabase').prop('checked');
    /**
     * @author: Jayesh
     * @reviewer: 
     * @date: 30th May 2017 
     * @desc: By default set IMS database
    */
    return value ? 'PHS_HCV':'IMS_LRX_AmbEMR_Dataset';
}
