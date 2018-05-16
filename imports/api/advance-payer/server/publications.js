Meteor.publish('getPatientsGenotypeCirrhosis', function() {
    var query = 'select count(*) as count,GENOTYPE as genotype,CIRRHOSIS as hcv_cirrhosis from IMS_HCV_PATIENTS group by GENOTYPE,CIRRHOSIS;';

    return liveDb.select(query, [{
        table: "IMS_HCV_PATIENTS"
    }]);
});

/**
 * @author: Yuvraj Pal (16th Feb 17)
 * @desc: commented because we are switching to PATIENT_ID_SYNTH.
*/

// //get list of insurance plan from patients
// Meteor.publish('getClaimsInsurancePlans', function() {
    
//     //let query = `select distinct CLAIMS_INSURANCEPLAN as claims_insurancePlan,REPLACE(CLAIMS_INSURANCEPLAN, ' ','') as claims_insurancePlan_value from IMS_HCV_PATIENTS`;
//     //Pram (13th Feb 17) to get plans only with medication data

//     let query = `SELECT DISTINCT CLAIMS_INSURANCEPLAN as claims_insurancePlan,
//                 REPLACE(CLAIMS_INSURANCEPLAN, ' ','') as claims_insurancePlan_value
//                 FROM IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS as patients
//                 JOIN PATIENT_MEDICATIONS as medication on patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH 
//                 WHERE medication.MEDICATION IS NOT NULL 
//                 AND patients.IDW_PATIENT_ID_SYNTH <> 0 
//                 AND CLAIMS_INSURANCEPLAN IS NOT NULL AND SVR12 IS NOT NULL
//                 GROUP BY CLAIMS_INSURANCEPLAN,MEDICATION,SVR12 
//                 HAVING  COUNT(1) > 1 ORDER BY COUNT(1) DESC`;

//     return liveDb.select(query, [{
//         table: "IMS_HCV_PATIENTS"
//     }]);
// });

/**
 * @author: Yuvraj Pal (16th Feb 17)
 * @desc: Added because we are switching to PATIENT_ID_SYNTH.
*/
Meteor.publish('getClaimsInsurancePlans', function() {
    
    //let query = `select distinct CLAIMS_INSURANCEPLAN as claims_insurancePlan,REPLACE(CLAIMS_INSURANCEPLAN, ' ','') as claims_insurancePlan_value from IMS_HCV_PATIENTS`;
    //Pram (13th Feb 17) to get plans only with medication data

    let query = `SELECT 
                    DISTINCT CLAIMS_INSURANCEPLAN as claims_insurancePlan,
                    REPLACE(CLAIMS_INSURANCEPLAN, ' ','') as claims_insurancePlan_value
                FROM IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS as patients
                JOIN PATIENT_MEDICATIONS as medication 
                    ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH 
                WHERE medication.MEDICATION IS NOT NULL 
                    AND CLAIMS_INSURANCEPLAN IS NOT NULL AND SVR12 IS NOT NULL
                GROUP BY CLAIMS_INSURANCEPLAN,
                    MEDICATION,
                    SVR12 HAVING  COUNT(1) > 1 
                ORDER BY COUNT(1) DESC`;

    return liveDb.select(query, [{
        table: "IMS_HCV_PATIENTS"
    }]);
});


//get list of genotype from patients
Meteor.publish('getGenotypeList', function() {
    var query = 'select distinct GENOTYPE as hcv_genotype from IMS_HCV_PATIENTS order by GENOTYPE';
    return liveDb.select(query, [{
        table: "IMS_HCV_PATIENTS"
    }]);
});

//get list of year data
Meteor.publish('getListOfYear', function() {
    var query = "select (max(year(STR_TO_DATE(FIRST_ENCOUNTER,'%Y-%m-%d'))) - min(year(STR_TO_DATE(FIRST_ENCOUNTER,'%Y-%m-%d')))) as year from IMS_HCV_PATIENTS where year(STR_TO_DATE(FIRST_ENCOUNTER,'%Y-%m-%d')) != 0;";
    return liveDb.select(query, [{
        table: "IMS_HCV_PATIENTS"
    }]);
});

//get patient count treated,untreated,treating
Meteor.publish('getAdvPayer_PatientsCount', function() {
    /*var query = 'select (select count(*) from HCV_patients  where medication!="" and dischargeDate is not null) as treated,'+
        '(select count(*) from HCV_patients  where medication = " " and dischargeDate is null ) as untreated,'+
        '(select count(*) from HCV_patients  where medication!="" and dischargeDate is  null) as treating;';*/
    
    // Modified BY Yuvraj (16th Feb 17).  Switching to PATIENT_ID_SYNTH
    // let query = `SELECT COUNT(IDW_PATIENT_ID_SYNTH) as treated FROM PATIENT_MEDICATIONS;`;
    let query = `SELECT COUNT(PATIENT_ID_SYNTH) as treated FROM PATIENT_MEDICATIONS;`;

    return liveDb.select(query, [{
        table: "IMS_HCV_PATIENTS"
    }]);
});
