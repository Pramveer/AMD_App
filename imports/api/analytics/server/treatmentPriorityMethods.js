/*
    Backend api for  machine learning tabs
*/
import * as serverUtils from '../../common/serverUtils.js';
import * as analyticsChartsLib from './analyticsChartsData.js';
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 26-May-2017
 * @desc: Separated method for `TreatmentPriorityTabs` and updated caching key by name
 */
Meteor.syncMethods({
    // -- Need to remove unnecessary fields
    'getTreatmentPriorityTabsData': function (params, callback) {
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
                key: params.database + "analytics_treatment_priority"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function () {
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
            //             patients.PATIENT_ID_SYNTH as patientId,
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
            //             CIRRHOSISTYPE as cirrhosistype,
            //             patients.FibrosureStage,
            //             patients.Count_PLATELET,
            //             patients.Count_AST,
            //             patients.Count_APRI

            //         from IMS_HCV_PATIENTS as patients
            //             JOIN PATIENT_MEDICATIONS as medication
            //             ON patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH
            //         WHERE patients.IDW_PATIENT_ID_SYNTH <>0
            //             AND patients.IDW_PATIENT_ID_SYNTH is not null
            //             AND FIRST_ENCOUNTER is not null
            //         ${whereClause}
            //         ${preactiveAntivalsQuery};`;

            /**
         * @author: Arvind
         * @reviewer: 
         * @date: 15-March-2017
         * @desc:  Added three new column(	patients.CREATININE as labs_creatinine,	 PLATELET_COUNT as labs_platelet_count,
	   patients.INR_VALUE as labs_inr) in query for Cirrhosis model 
        */
            /**
             * @author: Arvind
             * @reviewer: 
             * @date: 14-Apr-2017
             * @desc: Added where condition  `FibrosureValue IS NOT NULL` fot treatment priority chart 
             * because we only plot chart based on this.
             * Previously we are fetching 13,538 raw records now we only fetch 3,650 records
             */

            // var ethnicity = null,
            //     age = null;
            // if (params.database) {
            //     if (params.database == 'PHS_HCV') {
            //         pdatabase = params.database + '.PHS_HCV_PATIENTS';
            //         mdatabase = params.database + '.PHS_PATIENT_MEDICATIONS';
            //         ethnicity = 'ETHNICITY';
            //         age = 'AGE_RANGE';
            //     } else if (params.database == 'IMS_LRX_AmbEMR_Dataset') {
            //         pdatabase = params.database + '.IMS_HCV_PATIENTS';
            //         mdatabase = params.database + '.PATIENT_MEDICATIONS';
            //         ethnicity = 'ETHNITY_1_DESC';
            //         age = 'AGE';
            //     }
            // }
            /**
             * @author: Nisha
             * @date: 16th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */

            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            let query = `select
                        patients.PATIENT_ID_SYNTH as patientId,
                        ${dbConfig.age} as age,
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
                        ALBUMIN as labs_albumin,
                        BILIRUBIN as labs_total_bilirubin,
                        RACE_DESC as race,
                        BODY_WEIGHT as weight,
                        ${dbConfig.ethnicity} as ethnicity,
                        0 as physician_cost,
                        0 as hospitalization_cost,
                        0 as diagnostic_testing_cost,
                        IS_LIVER_FAILURE as liver_disease,
                        Liver_Disease_Cost as liver_disease_cost,
                        CIRRHOSISTYPE as cirrhosistype,
                        patients.FibrosureStage,
                        patients.Count_PLATELET,
                        patients.Count_AST,
                        patients.Count_APRI,
                        patients.CIRRHOSIS_NOW_COST as costNow,
                        patients.CREATININE as labs_creatinine,
                        patients.PLATELET_COUNT as labs_platelet_count,
                        patients.INR_VALUE as labs_inr, medication.IS_PREACTING_ANTIVIRAL
                   from ${dbConfig.tblHcvPatient}  as patients
                  LEFT JOIN ${dbConfig.tblPatientMedication} as medication
                        ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE FIRST_ENCOUNTER is not null
                   
                    ${whereClause} ${preactiveAntivalsQuery};`;

            // console.log('********* Treattment Priority tab *************');
            // console.log(query);

            liveDb.db.query(query, function (error, result) {
                if (error) {
                    return;
                } else {
                    //result = serverUtils.filterPreactingAntivirals(result, );
                    console.log(result.length);
                    // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key:  params.database+ "analytics_treatment_priority",
                        data: result
                    });
                    caching.updateData();
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
});