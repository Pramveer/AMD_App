import { Meteor } from 'meteor/meteor';
//import {liveDb} from '';

Meteor.publish('AllDrugData', function() {
    if (!this.userId) return undefined;
    return liveDb.select('select setId,name from drugs', [{
        table: "drugs"
    }]);
});


Meteor.publish('AllDrugICERData', function() {
    if (!this.userId) return undefined;
    return liveDb.select('select distinct MEDICATION from IMS_HCV_ICER where SuccessProbability is not null and AverageCost is not null', [{
        table: "ICERdrugs"
    }]);
});


Meteor.publish('getAdverseReactionsForDrugs', function() {
    if (!this.userId) return undefined;
    return liveDb.select(
        'SELECT adverse_reactions,medication,treatment_Period,hcv_cirrhosis,hcv_genotype,treatment from HCV_patients where medication!=" " and dischargeDate is not null', [{
            table: 'HCV_patients'
        }]
    );
});
//function to fetch the Adverse reactions
Meteor.publish('getSafetyAdverseReactions', function() {
    if (!this.userId) return undefined;
    return liveDb.select('select * from adverse_reactions_master;', [{
        table: "adverse_reactions_master;"
    }]);
});

//test function to get symptom data
Meteor.publish('getPatientAdverseReactions', function(data) {
    if (!this.userId) return undefined;
    if (!(data instanceof Array)) return;

    var genotype = data[0];
    var treatment = data[1];
    var cirrhosis = data[2];
    var viral_load = data[3];

    var query = 'SELECT patients_ar.ar_id,HCV_patients.medication,HCV_patients.treatment_Period FROM patients_ar LEFT JOIN HCV_patients ON patients_ar.mrn_crswlk = HCV_patients.mrn_crswlk' +
        ' where HCV_patients.category_id IN (select id from patients_cat where genotype= "' + genotype + '" AND treatment="' + treatment + '" AND cirrhosis = "' + cirrhosis + '" OR viral_load ="' + viral_load + '" OR viral_load ="6") ' +
        ' AND patients_ar.ar_id > 0  ORDER BY patients_ar.mrn_crswlk ASC;';

    var result = liveDb.select(query, [{
        table: "patients_ar"
    }], function(error, results, fields) {});

    return result;

});