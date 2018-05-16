/*
    Backend api for  machine learning tabs
*/
import * as serverUtils from '../../common/serverUtils.js';
import * as analyticsChartsLib from './analyticsChartsData.js';


let treatmentEfficacyPatientsData = [];

Meteor.methods({
    'getTreatmentEfficacyPatientData': (data) => {
        return JSON.stringify(treatmentEfficacyPatientsData);
    }
});

Meteor.syncMethods({
    // -- Need to remove unnecessary fields
    'getDiseaseProgressionTabsData': function(params, callback) {
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
                key: "analytics_disease_progression"
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

            /**
             * @author: Yuvraj Pal (17th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // let query = `select
            //             patients.IDW_PATIENT_ID_SYNTH as patientId,
            //             Age as age,
            //             GENOTYPE as genotype,
            //             CIRRHOSIS as cirrhosis,
            //             patients.VIRAL_LOAD as viralLoad,
            //             TREATMENT as treatment,
            //             LIVER_ASSESMENT as AssessmentLiverDisease,
            //             GENDER_CD as gender,
            //             FIRST_ENCOUNTER as dischargeDate,
            //             (case when ALCOHOL = "Yes" then 1 else 0 end) as alcohol,
            //             (case when MENTAL_HEALTH = "Yes" then 1 else 0 end) as mentalHealth,
            //             (case when RENAL_FAILURE = "Yes" then 1 else 0 end) as renalFailure,
            //             (case when PREGNANCY = "Yes" then 1 else 0 end) as Pregnancy,
            //             IS_ANIMIA as anemia,
            //             '' as Cardiovascular,
            //             MELD_SCORE as meldScore,
            //             HIV,
            //             '' as Muscular_dystrophy,
            //             '' aS Schistosomiasis_coinfection,
            //             PAT_ZIP as zipcode,
            //             IS_FibrosureLab as fibrosis,
            //             FibrosureValue as fibro_Value,
            //             (case when APRI <= 1 then 'N' else 'Y' end) as disease_progression,
            //             AST as labs_ast,
            //             APRI as labs_apri,
            //             ALT as labs_alt,
            //             0 as labs_platelets,
            //             MELD_SCORE as labs_meld,
            //             '' as labs_inr,
            //             ALBUMIN as labs_albumin,
            //             BILIRUBIN as labs_total_bilirubin,
            //             RACE_DESC as race,
            //             BODY_WEIGHT as weight,
            //             ETHNITY_1_DESC as ethnicity,
            //             '' as physician_service,
            //             0 as physician_cost,
            //             '' as hospitalization,
            //             0 as hospitalization_cost,
            //             '' as diagnostic_testing,
            //             0 as diagnostic_testing_cost,
            //             IS_LIVER_FAILURE as liver_disease,
            //             Liver_Disease_Cost as liver_disease_cost,
            //             '' as jaundice,
            //             '' as ascites,
            //             '' as variceal_hemorrhage,
            //             '' as encephalopathy,
            //             '' as ctpScore,
            //             CIRRHOSISTYPE as cirrhosistype

            //         from IMS_HCV_PATIENTS as patients
            //             JOIN PATIENT_MEDICATIONS as medication
            //             ON patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH
            //         WHERE patients.IDW_PATIENT_ID_SYNTH <>0
            //             AND patients.IDW_PATIENT_ID_SYNTH is not null
            //             AND FIRST_ENCOUNTER is not null
            //             AND APRI is not null
            //         ${whereClause} ${preactiveAntivalsQuery};`;


            let query = `select
                        patients.PATIENT_ID_SYNTH as patientId,
                        Age as age,
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
                        RACE_DESC as race,
                        BODY_WEIGHT as weight,
                        ETHNITY_1_DESC as ethnicity,
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
                        CIRRHOSISTYPE as cirrhosistype

                    from IMS_HCV_PATIENTS as patients
                        JOIN PATIENT_MEDICATIONS as medication
                        ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE FIRST_ENCOUNTER is not null
                        AND APRI is not null
                    ${whereClause} ${preactiveAntivalsQuery};`;


            // let extraParams = ` IDW_PATIENT_ID_SYNTH <>0  AND IDW_PATIENT_ID_SYNTH is not null and FIRST_ENCOUNTER is not null
            //             and APRI is not null`;

            // query = appendFiltersToQuery(query, data, extraParams);

            // console.log('********* Disease Progression query *************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    return;
                } else {
                    // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: "analytics_disease_progression",
                        data: result
                    });
                    caching.updateData();
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    // -- Need to remove unnecessary fields
    'getProgressionModelTabsData': function(params, callback) {
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
                    cb: callback
                })) {
                //console.log('Invalid Parameters');
                return undefined;
            }

            let whereClause = serverUtils.getQueryForAdvFilters(params);

            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // let query = `select
            //             PATIENT_ID_SYNTH as patientId,
            //             Age as age,
            //             GENOTYPE as genotype,
            //             CIRRHOSIS as cirrhosis,
            //             VIRAL_LOAD as viralLoad,
            //             TREATMENT as treatment,
            //             LIVER_ASSESMENT as AssessmentLiverDisease,
            //             GENDER_CD as gender,
            //             FIRST_ENCOUNTER as dischargeDate,
            //             (case when ALCOHOL = "Yes" then 1 else 0 end) as alcohol,
            //             (case when MENTAL_HEALTH = "Yes" then 1 else 0 end) as mentalHealth,
            //             (case when RENAL_FAILURE = "Yes" then 1 else 0 end) as renalFailure,
            //             (case when PREGNANCY = "Yes" then 1 else 0 end) as Pregnancy,
            //             IS_ANIMIA as anemia,
            //             '' as Cardiovascular,
            //             MELD_SCORE as meldScore,
            //             HIV,
            //             '' as Muscular_dystrophy,
            //             '' aS Schistosomiasis_coinfection,
            //             PAT_ZIP as zipcode,
            //             IS_FibrosureLab as fibrosis,
            //             FibrosureValue as fibro_Value,
            //             (case when APRI <= 1 then 'N' else 'Y' end) as disease_progression,
            //             AST as labs_ast,
            //             APRI as labs_apri,
            //             ALT as labs_alt,
            //             0 as labs_platelets,
            //             MELD_SCORE as labs_meld,
            //             '' as labs_inr,
            //             ALBUMIN as labs_albumin,
            //             BILIRUBIN as labs_total_bilirubin,
            //             RACE_DESC as race,
            //             BODY_WEIGHT as weight,
            //             ETHNITY_1_DESC as ethnicity,
            //             '' as physician_service,
            //             0 as physician_cost,
            //             '' as hospitalization,
            //             0 as hospitalization_cost,
            //             '' as diagnostic_testing,
            //             0 as diagnostic_testing_cost,
            //             IS_LIVER_FAILURE as liver_disease,
            //             Liver_Disease_Cost as liver_disease_cost,
            //             '' as jaundice,
            //             '' as ascites,
            //             '' as variceal_hemorrhage,
            //             '' as encephalopathy,
            //             '' as ctpScore,
            //             CIRRHOSISTYPE as cirrhosistype

            //         from IMS_HCV_PATIENTS as patients
            //         WHERE IDW_PATIENT_ID_SYNTH <>0
            //             AND IDW_PATIENT_ID_SYNTH is not null
            //             AND FIRST_ENCOUNTER is not null
            //         ${whereClause};`;


            let query = `select
                        PATIENT_ID_SYNTH as patientId,
                        Age as age,
                        GENOTYPE as genotype,
                        CIRRHOSIS as cirrhosis,
                        VIRAL_LOAD as viralLoad,
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
                        RACE_DESC as race,
                        BODY_WEIGHT as weight,
                        ETHNITY_1_DESC as ethnicity,
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
                        CIRRHOSISTYPE as cirrhosistype

                    from IMS_HCV_PATIENTS as patients
                    WHERE FIRST_ENCOUNTER is not null
                    ${whereClause};`;


            liveDb.db.query(query, function(error, result) {
                if (error) {
                    return;
                } else {
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            //console.log(JSON.stringify(ex));
        }
    },

    // query for comorbity tab.
    'getPatientMedicineData': function(params, callback) {
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
                    cb: callback
                })) {
                //console.log('Invalid Parameters');
                return undefined;
            }
            var query = '',
                dataObj = {};
            dataObj['pharmaData'] = null;

            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // query = "SELECT LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine ,medication.PATIENT_ID_SYNTH , MEDICATION , " +
            //     "TREATMENT_PERIOD ,NDC , STRT_DATE ,END_DATE ,DAYS_MEDICATION ,hcv.VIRAL_LOAD , SVR12 ,  Age ,GENDER_CD ,DEAD_IND, " +
            //     "RACE_DESC ,   GENOTYPE , CIRRHOSIS , TREATMENT , TREATMENT_CONDITION  " +
            //     "FROM  IMS_LRX_AmbEMR_Dataset.PATIENT_MEDICATIONS medication INNER JOIN IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS hcv " +
            //     "on medication.PATIENT_ID_SYNTH = hcv.PATIENT_ID_SYNTH ";

            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' hcv.FIRST_ENCOUNTER >="2013-01-01"';

            query = `SELECT
                        LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine ,
                        medication.PATIENT_ID_SYNTH ,
                        MEDICATION,
                        TREATMENT_PERIOD,
                        NDC,
                        STRT_DATE,
                        END_DATE,
                        DAYS_MEDICATION,
                        hcv.VIRAL_LOAD,
                        SVR12,
                        Age,
                        GENDER_CD,
                        DEAD_IND,
                        RACE_DESC,
                        GENOTYPE,
                        CIRRHOSIS,
                        TREATMENT,
                        TREATMENT_CONDITION
                    FROM  IMS_LRX_AmbEMR_Dataset.PATIENT_MEDICATIONS medication
                    INNER JOIN IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS hcv
                        ON medication.PATIENT_ID_SYNTH = hcv.PATIENT_ID_SYNTH`;


            liveDb.db.query(query, function(error, result) {
                if (error) {
                    //console.log(error);
                    return;
                } else {
                    dataObj['pharmaData'] = result;
                    callback(undefined, dataObj);
                }
            });
        } catch (ex) {
            //console.log(JSON.stringify(ex));
        }
    },




    // query for Coinfection tab
    'getCoinfectionTabData': function(params, callbackFn) {
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

            // @Yuvraj 13th Feb 17 -  caching Implementation.
            // let caching = new CachingObj({
            //     key: params.database+"analytics_coinfection_data"
            // });

            // if (caching.isDataAvailable()) {
            //     let data = caching.getAvailableData();
            //     setTimeout(function() {
            //         callbackFn(undefined, data);
            //     }, 50);
            //     return false;
            // }

            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            //check db config
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            // if (dbConfig.showPreactingAntivirals) {
            //     preactiveAntivalsQuery = ``;
            // }
            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // let query = `SELECT
            //     patients.IDW_PATIENT_ID_SYNTH as patientId,
            //     patients.Age as age,
            //     patients.GENOTYPE as genotype,patients.CIRRHOSIS as cirrhosis,
            //     patients.TREATMENT as treatment,patients.HIV as hiv,
            //     patients.RACE_DESC as race,
            //     patients.ETHNITY_1_DESC as ethnicity,
            //     patients.LIVER_BIOPSY as liverBiopsy,
            //     patients.IS_HEP_B,
            //     medication.SVR12 as svr12,
            //     medication.VIRAL_LOAD as viralLoad,
            //     patients.MELD_SCORE as meldScore,
            //     '' as ctpScore,
            //     patients.FIRST_ENCOUNTER as dischargeDate
            //     FROM IMS_HCV_PATIENTS as patients
            //     JOIN PATIENT_MEDICATIONS as medication
            //     ON patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH
            //     WHERE medication.MEDICATION IS NOT NULL
            //         AND medication.IDW_PATIENT_ID_SYNTH <> 0
            //         AND medication.IDW_PATIENT_ID_SYNTH is not null
            //     ${whereClause} ${preactiveAntivalsQuery};`;

            let query = `SELECT
                            patients.PATIENT_ID_SYNTH as patientId,
                            patients.${dbConfig.age} as age,
                            patients.GENOTYPE as genotype,patients.CIRRHOSIS as cirrhosis,
                            patients.TREATMENT as treatment,patients.HIV as hiv,
                            patients.RACE_DESC as race,
                            patients.${dbConfig.ethnicity} as ethnicity,
                            patients.LIVER_BIOPSY as liverBiopsy,
                            patients.IS_HEP_B,
                            medication.SVR12 as svr12,
                            medication.VIRAL_LOAD as viralLoad,
                            medication.MEDICATION as medication,
                            patients.MELD_SCORE as meldScore,
                            '' as ctpScore,
                            patients.FIRST_ENCOUNTER as dischargeDate,
                            medication.IS_PREACTING_ANTIVIRAL
                        FROM ${dbConfig.pdatabase} as patients
                        LEFT  JOIN  ${dbConfig.mdatabase} as medication
                            ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                         WHERE patients.PATIENT_ID_SYNTH <> 0 
                            ${whereClause} ${preactiveAntivalsQuery};`;

            // console.log('************Co-infections query*************');
            // console.log(query);

            let dataObj = {};
            dataObj['coinfectionData'] = null;

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    //console.log(error);
                    return;
                } else {
                    //callbackFn(undefined, result);

                    // @author: Yuvraj 13th Feb 17 - Saving data into caching object.
                    // let caching = new CachingObj({
                    //     key: "analytics_coinfection_data",
                    //     data: JSON.stringify(result)
                    // });
                    // caching.updateData();
                    //result = serverUtils.filterPreactingAntivirals(result,params.showPreactingAntivirals);
                    callbackFn(undefined, JSON.stringify(result));
                }
            });
        } catch (ex) {
            //console.log(JSON.stringify(ex));
        }
    },

    // query for treament efficacy tab   -- Not in Use.
    'getTreamentEfficacyData': function(params, callbackFn) {
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
                    cb: callbackFn
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            let dataParams = {};

            dataParams.params = params;
            dataParams.treamentEfficacyRecords = null;

            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // let query = `select
            //         patients.GENOTYPE as genotype,
            //         patients.CIRRHOSIS as cirrhosis,
            //         patients.TREATMENT as treatment,
            //         patients.RACE_DESC as race,
            //         patients.ETHNITY_1_DESC as ethnicity,
            //         1 as total,
            //         medication.SVR12,
            //         YEAR(patients.FIRST_ENCOUNTER) as Year,
            //         patients.PAT_ZIP as zipcode,
            //         medication.VIRAL_LOAD as viralLoad,
            //         medication.TREATMENT_PERIOD as treatmentPeriod,
            //         medication.MEDICATION as Medication,
            //         patients.IDW_PATIENT_ID_SYNTH as patientId,
            //         patients.AGE as age,
            //         patients.GENDER_CD as gender,
            //         SVR12 as isCured,
            //         patients.FIRST_ENCOUNTER as admissionDate
            //         from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
            //         JOIN PATIENT_MEDICATIONS as medication
            //         on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH WHERE
            //         medication.MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            //         ${whereClause} ${preactiveAntivalsQuery}`;


            let query = `select
                            patients.GENOTYPE as genotype,
                            patients.CIRRHOSIS as cirrhosis,
                            patients.TREATMENT as treatment,
                            patients.RACE_DESC as race,
                            patients.ETHNITY_1_DESC as ethnicity,
                            1 as total,
                            medication.SVR12,
                            YEAR(patients.FIRST_ENCOUNTER) as Year,
                            patients.PAT_ZIP as zipcode,
                            medication.VIRAL_LOAD as viralLoad,
                            medication.TREATMENT_PERIOD as treatmentPeriod,
                            medication.MEDICATION as Medication,
                            patients.PATIENT_ID_SYNTH as patientId,
                            patients.AGE as age,
                            patients.GENDER_CD as gender,
                            SVR12 as isCured,
                            patients.FIRST_ENCOUNTER as admissionDate
                        from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
                        JOIN PATIENT_MEDICATIONS as medication
                            on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                        WHERE medication.MEDICATION IS NOT NULL
                            ${whereClause} ${preactiveAntivalsQuery}`;

            // console.log('**********Treatment Efficacy Tab Query***********');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //set the data rows in the variable
                    treatmentEfficacyPatientsData = result;
                    dataParams.treamentEfficacyRecords = result;
                    getPatientsJourneyData(dataParams, callbackFn);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }

    },

    //query for Suspected Cirrhosis risk distribution tab
    'getSuspectedCirrhosisRiskDistributionTabData': function(params, callbackFn) {
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
                    cb: callbackFn
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let whereClause = serverUtils.getQueryForAdvFilters(params);

            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            //     let query = `SELECT
            //         patients.IDW_PATIENT_ID_SYNTH as patientId,
            //         patients.Age as age,
            //         patients.GENOTYPE as genotype,patients.CIRRHOSIS as cirrhosis,
            //         patients.TREATMENT as treatment,patients.HIV,
            //         (case when patients.RENAL_FAILURE = "Yes" then 1 else 0 end) as renalFailure,
            //         patients.LIVER_BIOPSY as liverBiopsy,
            //         patients.RACE_DESC as race,patients.BODY_WEIGHT as weight,
            //         patients.ETHNITY_1_DESC as ethnicity,patients.GENDER_CD as gender,
            //         patients.MELD_SCORE as meldScore,
            //         '' as ctpScore,
            //         patients.FIRST_ENCOUNTER as dischargeDate,
            //         cirrhosisfs.FibrosureStage,
            //         cirrhosisfs.Count_PLATELET,
            //         cirrhosisfs.Count_AST,
            //         cirrhosisfs.Count_APRI
            //         FROM IMS_HCV_PATIENTS as patients
            //         JOIN IMS_HCV_Suspected_Cirrhosis as cirrhosisfs
            //         ON patients.IDW_PATIENT_ID_SYNTH = cirrhosisfs.IDW_PATIENT_ID_SYNTH
            //         WHERE (patients.IDW_PATIENT_ID_SYNTH <> 0 and  patients.IDW_PATIENT_ID_SYNTH  is not null)
            //  ${whereClause} ;`;

            let query = `SELECT
                            patients.PATIENT_ID_SYNTH as patientId,
                            patients.Age as age,
                            patients.GENOTYPE as genotype,patients.CIRRHOSIS as cirrhosis,
                            patients.TREATMENT as treatment,patients.HIV,
                            (case when patients.RENAL_FAILURE = "Yes" then 1 else 0 end) as renalFailure,
                            patients.LIVER_BIOPSY as liverBiopsy,
                            patients.RACE_DESC as race,patients.BODY_WEIGHT as weight,
                            patients.ETHNITY_1_DESC as ethnicity,patients.GENDER_CD as gender,
                            patients.MELD_SCORE as meldScore,
                            '' as ctpScore,
                            patients.FIRST_ENCOUNTER as dischargeDate,
                            cirrhosisfs.FibrosureStage,
                            cirrhosisfs.Count_PLATELET,
                            cirrhosisfs.Count_AST,
                            cirrhosisfs.Count_APRI
                        FROM IMS_HCV_PATIENTS as patients
                        JOIN IMS_HCV_Suspected_Cirrhosis as cirrhosisfs
                            ON patients.PATIENT_ID_SYNTH = cirrhosisfs.PATIENT_ID_SYNTH
                        WHERE ${whereClause} ;`;

            // console.log('************Risk Distribution query*************');
            // console.log(query);

            let dataObj = {};
            dataObj['coinfectionData'] = null;

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //callbackFn(undefined, result);
                    callbackFn(undefined, JSON.stringify(result));
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }

});


//funcation to get patient journery data
let getPatientsJourneyData = (dataParams, callbackFn) => {
    let query = ``,
        dataObj = {},
        params = dataParams.params;
    let whereClause = serverUtils.getQueryForAdvFilters(params),
        preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

    if (params.showPreactingAntivirals) {
        preactiveAntivalsQuery = ``;
    }

    dataObj.PatientsJourney = null;

    /**
     * @author: Yuvraj Pal (20th Feb 2017)
     * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
     */

    // query = `select
    //         medication.IDW_PATIENT_ID_SYNTH,PatientId ,ViralLoad,
    //         ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) as Weeks,
    //         Perfed_Dt,STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,
    //         MEDICATION,TREATMENT_PERIOD
    //         from PATIENT_MEDICATIONS as medication join ALL_VIRAL_LOAD_RESULTS res
    //         on medication.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS as patients
    //         on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
    //         where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
    //         AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) > -8
    //         AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 70
    //         ${whereClause} ${preactiveAntivalsQuery}`;

    query = `select
                medication.PATIENT_ID_SYNTH, PatientId ,
                case when ViralLoad like '%NOT DETECTED%' then 0 else ViralLoad end as ViralLoad,
                ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) as Weeks,
                Perfed_Dt,STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,
                MEDICATION,TREATMENT_PERIOD
            from PATIENT_MEDICATIONS as medication
            join ALL_VIRAL_LOAD_RESULTS res
                on medication.PATIENT_ID_SYNTH = res.PatientId
            join IMS_HCV_PATIENTS as patients
                on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
            where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$'  or ViralLoad like '%NOT DETECTED%')
                AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) > -8
                AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 70
                ${whereClause} ${preactiveAntivalsQuery}`;


    // console.log('*********** Patients Journey Query**************');
    // console.log(query);

    liveDb.db.query(query, function(error, result) {
        if (error) {
            console.log(error);
            return;
        } else {
            dataObj.PatientsJourney = result;
            // dataObj.Medication =  prepareSVRMedicationData(dataParams.treamentEfficacyRecords);
            getDistinctMedications(dataObj, callbackFn);
            //callbackFn(undefined, dataObj);
        }
    });
}


//funcation to get patient journery data
let getDistinctMedications = (dataObj, callbackFn) => {
    let query = `SELECT DISTINCT MEDICATION From PATIENT_MEDICATIONS order by MEDICATION`;

    liveDb.db.query(query, function(error, result) {
        if (error) {
            console.log(error);
            return;
        } else {
            dataObj.Medication = result;
            callbackFn(undefined, JSON.stringify(dataObj));
        }
    });
}


let prepareSVRMedicationData = (data) => {
    let dummyMedication = [];
    let medication = _.pluck(data, 'Medication');
    medication = _.map(medication, function(e) {
        return e.includes('+') ? e.split('+') : e;
    });

    for (let i = 0; i < medication.length; i++) {
        if (Array.isArray(medication[i])) {
            for (let j = 0; j < medication[i].length; j++) {
                dummyMedication.push(medication[i][j].trim());
            }
        } else {
            dummyMedication.push(medication[i].trim());
        }
    }
    dummyMedication = _.sortBy(_.uniq(dummyMedication), function(e) {
        return e;
    })
    return dummyMedication;
}