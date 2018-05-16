/*
    Backend api for Survival Rate tab.
*/
import * as serverUtils from '../../common/serverUtils.js';

Meteor.syncMethods({

    // query for Survival rate tab. -- Need to remove unnecessary fields
    'getSurvivalRateTabsData': function(params, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!isValidParams({
                    params: params,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "analytics_survival_rate"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callback(undefined, data);
                }, 50);

                return false;
            }

            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }


            // Yuvraj 7th April, Modified Query in order to fix the filtering functionality.
            var ethnicity = null,
                age = null;
            if (params.database) {
                if (params.database == 'PHS_HCV') {
                    pdatabase = params.database + '.PHS_HCV_PATIENTS';
                    mdatabase = params.database + '.PHS_PATIENT_MEDICATIONS';
                    ethnicity = 'ETHNICITY';
                    age = 'AGE_RANGE';
                } else if (params.database == 'IMS_LRX_AmbEMR_Dataset') {
                    pdatabase = params.database + '.IMS_HCV_PATIENTS';
                    mdatabase = params.database + '.PATIENT_MEDICATIONS';
                    ethnicity = 'ETHNITY_1_DESC';
                    age = 'AGE';
                }
            }
            let query = `select distinct
                        patients.PATIENT_ID_SYNTH as patientId,
                        ${age} as age,
                        GENOTYPE as genotype,
                        CIRRHOSIS as cirrhosis,
                        patients.VIRAL_LOAD as viralLoad,
                        TREATMENT as treatment,
                        LIVER_ASSESMENT as AssessmentLiverDisease,
                        GENDER_CD as gender,
                        FIRST_ENCOUNTER as dischargeDate,
                        (case when ALCOHOL = "Yes" then 1 else 0 end) as alcohol,
                        (case when MENTAL_HEALTH = "Yes" then 1 else 0 end) as mentalHealth,
                        (case when RENAL_FAILURE = "Yes" then 1 else 0 end) as renalFailure,
                        (case when PREGNANCY = "Yes" then 1 else 0 end) as Pregnancy,
                        IS_ANIMIA as anemia,
                        '' as Cardiovascular,
                        MELD_SCORE as meldScore,
                        HIV,
                        '' as Muscular_dystrophy,
                        '' aS Schistosomiasis_coinfection,
                        PAT_ZIP as zipcode,
                        IS_FibrosureLab as fibrosis,
                        FibrosureValue as fibro_Value,
                        (case when APRI <= 1 then 'N' else 'Y' end) as disease_progression,
                        AST as labs_ast,
                        APRI as labs_apri,
                        ALT as labs_alt,
                        0 as labs_platelets,
                        MELD_SCORE as labs_meld,
                        '' as labs_inr,
                        ALBUMIN as labs_albumin,
                        BILIRUBIN as labs_total_bilirubin,
                        BODY_WEIGHT as weight,
                        ${ethnicity} as ethnicity,
                        '' as physician_service,
                        0 as physician_cost,
                        '' as hospitalization,
                        0 as hospitalization_cost,
                        '' as diagnostic_testing,
                        0 as diagnostic_testing_cost,
                        IS_LIVER_FAILURE as liver_disease,
                        Liver_Disease_Cost as liver_disease_cost,
                        '' as jaundice,
                        '' as ascites,
                        '' as variceal_hemorrhage,
                        '' as encephalopathy,
                        '' as ctpScore,
                        CIRRHOSISTYPE as cirrhosistype,

                        patients.LIVER_BIOPSY as liverBiopsy,
                      --  medication.SVR12 as svr12,
                        (CASE
                            WHEN patients.RACE_DESC = 'UNKNOWN' THEN patients.${ethnicity}
                            WHEN patients.RACE_DESC = 'OTHER'THEN patients.${ethnicity}
                            ELSE patients.RACE_DESC
                        END) as race,

                      medication.MEDICATION as Medication,
                     --   medication.TREATMENT_PERIOD as treatmentPeriod,
                    --    medication.VIRAL_LOAD as viralLoad,
                        '' as ctpScore,
                        patients.FibrosureStage,
                        patients.IS_LIVER_FAILURE as liverFailure,
                        patients.Count_AST,
                        patients.Count_APRI,
                        patients.CIRRHOSIS_NOW_COST as costNow,
                        medication.IS_PREACTING_ANTIVIRAL
                  	from ${pdatabase}  as patients
                   left JOIN ${mdatabase} as medication
                        ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                   -- WHERE FIRST_ENCOUNTER is not null
                   --     AND MELD_SCORE is not null
                   WHERE 1= 1
                    ${whereClause};`;


            // console.log('********* Survival Rate query *************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    return;
                } else {
                  // result = serverUtils.filterPreactingAntivirals(result, params.showPreactingAntivirals);
    // console.log(serverUtils.getUniqueCount(result,'patientId'));
                    let compressed_object = LZString.compress(JSON.stringify(result));
                    // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "analytics_survival_rate",
                        data: compressed_object
                    });
                    caching.updateData();

                    callback(undefined, compressed_object);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },


    //query for risk distribution tab
    'getRiskDistributionTabData': function(params, callbackFn) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                //console.log('User not logged in');
                return undefined;
            }
            if (!isValidParams({
                    params: params,
                    cb: callbackFn
                })) {
                //console.log('Invalid Parameters');
                return undefined;
            }

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "analytics_risk_distribution"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callbackFn(undefined, data);
                }, 50);

                return false;
            }

            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            var ethnicity = null,
                age = null;
            if (params.database) {
                if (params.database == 'PHS_HCV') {
                    pdatabase = params.database + '.PHS_HCV_PATIENTS';
                    mdatabase = params.database + '.PHS_PATIENT_MEDICATIONS';
                    ethnicity = 'ETHNICITY';
                    age = 'AGE_RANGE';
                } else if (params.database == 'IMS_LRX_AmbEMR_Dataset') {
                    pdatabase = params.database + '.IMS_HCV_PATIENTS';
                    mdatabase = params.database + '.PATIENT_MEDICATIONS';
                    ethnicity = 'ETHNITY_1_DESC';
                    age = 'AGE';
                }
            }

            let query = `SELECT  distinct
                                patients.PATIENT_ID_SYNTH as patientId,
                                patients.${age} as age,
                                patients.GENOTYPE as genotype,patients.CIRRHOSIS as cirrhosis,
                                patients.TREATMENT as treatment,patients.HIV,
                                (case when patients.RENAL_FAILURE = "Yes" then 1 else 0 end) as renalFailure,
                                patients.LIVER_BIOPSY as liverBiopsy,
                                -- medication.SVR12 as svr12,
                                (CASE
                                    WHEN patients.RACE_DESC = 'UNKNOWN' THEN patients.${ethnicity}
                                    WHEN patients.RACE_DESC = 'OTHER'THEN patients.${ethnicity}
                                    ELSE patients.RACE_DESC
                                END) as race,
                                patients.BODY_WEIGHT as weight,
                                patients.${ethnicity} as ethnicity,patients.GENDER_CD as gender,
                                medication.MEDICATION as Medication,
                            --  medication.TREATMENT_PERIOD as treatmentPeriod,
                            --  medication.VIRAL_LOAD as viralLoad,
                                patients.MELD_SCORE as meldScore,
                                patients.MELD_SCORE as labs_meld,
                                '' as ctpScore,
                                patients.FIRST_ENCOUNTER as dischargeDate,
                                patients.FibrosureStage,
                                patients.Count_PLATELET,
                                patients.IS_LIVER_FAILURE as liverFailure,
                                patients.Count_AST,
                                patients.Count_APRI,
                                patients.CIRRHOSIS_NOW_COST as costNow,
                                medication.IS_PREACTING_ANTIVIRAL
                            from ${pdatabase}  as patients
                           left JOIN ${mdatabase} as medication
                                ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                         --   WHERE medication.MEDICATION IS NOT NULL
                         WHERE 1= 1
                                ${whereClause};`;

            // console.log('************Risk Distribution query*************');
            // console.log(query);

            let dataObj = {};
            dataObj['coinfectionData'] = null;

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                  //  result = serverUtils.filterPreactingAntivirals(result, params.showPreactingAntivirals);
  // console.log(serverUtils.getUniqueCount(result,'patientId'));
                    let compressed_object = LZString.compress(JSON.stringify(result));
                    // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "analytics_risk_distribution",
                        data: compressed_object
                    });
                    caching.updateData();

                    callbackFn(undefined, compressed_object);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }

});
