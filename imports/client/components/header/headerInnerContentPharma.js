import { Template } from 'meteor/templating';
import './headerInnerContentPharma.html'

Template.HeaderInnerContentPharma.onCreated(function() {


});
Template.HeaderInnerContentPharma.onRendered(function() {
    let data = AmdApp.Filters;
    setPayerHeaderTabData(data);
    setFilterHeader(data);
});

Template.HeaderInnerContentPharma.onDestroyed(function() {


});

Template.HeaderInnerContentPharma.events({
    //export and show patients
    'click .ecf-exportPatientPharma': (e) => {
        data = getDrugFilteredData(Session.get('pharmamedicine'));
        exportPatientsData(e.currentTarget, data, 'pharmaPatientData');
    },
    'click .globalshowPatientPharma': (e) => {
        $(e.currentTarget).find('i').toggleClass('fa-toggle-on fa-toggle-off');
        $('.js-showPateintsList').trigger('click');

    }
});


let setPayerHeaderTabData = (params) => {
    try {


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

        setMedicationInfoInCohort();

        $('#desc_cirrhosis_pharma').find('.efd-cell2_subpopulaiton').html(cirrhosis);

        $('#desc_treatment_pharma').find('.efd-cell2_subpopulaiton').html(treatment);

        // $('#desc_cirrhosis_pharma').find('.efd-cell2_subpopulaiton').html(params['cirrhosis'] != null ? params['cirrhosis'].replace(/'/g, '').toString() : 'All');

        // $('#desc_treatment_pharma').find('.efd-cell2_subpopulaiton').html(convertFirstLetterCaps(params['treatment'] != null ? params['treatment'].replace(/'/g, '').toString() : 'All'));

        $('#desc_genotype_pharma').find('.efd-cell2_subpopulaiton').html(params['genotypes'] != null ? params['genotypes'].replace(/'/g, '').toString() : 'All');

        //$('#desc_plan_analytics').find('.efd-cell2_subpopulaiton').html('All');

        //$('#desc_month_analytics').find('.efd-cell2_subpopulaiton').html(parseInt(ListOfYear[0].year) * 12);
        // let medication = params['medication'];
        // if (medication != null)
        //     medication = medication.split(',').length == 0 ? 'All' : convertFirstLetterCaps(medication.replace(/'/g, '').toString());
        // else
        //     medication = 'ALL';
        //      $('.header-medicationInfo .ecf-Medication').html(displayHtml);

        // $('#desc_medication_pharma').find('.efd-cell2_subpopulaiton').html(convertFirstLetterCaps(medication || 'ALL'));

        //$('.searchPatientCountHeaderPharma').html(params['patientCountTab'] || 0);
    } catch (ex) {
        // console.log(ex);
    }
}



let setFilterHeader = (params) => {
    if (params != null) {
        $("#filter_desc").show();
        $('#patient-pager').show();

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

        $('.searchPatientCountHeader').html(commaSeperatedNumber(params['patientCountTab'] || 0));

    }
}