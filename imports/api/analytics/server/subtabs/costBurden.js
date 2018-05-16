/**
 * @author: Pramveer
 * @date: 26th May 17
 * @desc: separate backend file for cost burden tab
*/

import * as serverUtils from '../../../common/serverUtils.js';


Meteor.syncMethods({
    'getCostBurdenTabsData': (params, callbackFn) => {
        try {
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

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "analytics_cost_burden"
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

             /**
             * @author: Arvind
             * @reviewer: 
             * @date: 05-Apr-2017
             * @desc: Adeed 'is_hospitalized' and 'is_liver_failure' column previously this flag was calculated
             *  by Hospitalization_Cost and liver_disease_cost
             */

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
                        '' as labs_inr,
                        ALBUMIN as labs_albumin,
                        BILIRUBIN as labs_total_bilirubin,
                        RACE_DESC as race,
                        BODY_WEIGHT as weight,
                        ${dbConfig.ethnicity} as ethnicity,
                        case when PAID = '' then 0 when PAID is null then 0  else PAID end  as claims_cost,
                        MEDICATION as medication,
                        (case when Physician_Service_Cost is not null  then 1 else 0 end) as physician_service,
                         case Physician_Service_Cost when '' then 0 else Physician_Service_Cost end as physician_cost,
                        is_hospitalized as hospitalization,
                        case when Hospitalization_Cost = '' then 0 when Hospitalization_Cost is null then 0 else Hospitalization_Cost end as hospitalization_cost,
                        '' as diagnostic_testing,
                        0 as diagnostic_testing_cost,
                        MEDICATION as antiviral_therapy,
                         case when PAID = '' then 0 when PAID is null then 0 else PAID end as antiviral_therapy_cost,
                        is_liver_failure as liver_disease,
                        case when Liver_Disease_Cost = '' then 0 when Liver_Disease_Cost is null then 0 else  cast(Liver_Disease_Cost as decimal(12,2)) end as liver_disease_cost,
                        '' as jaundice,
                        '' as ascites,
                        '' as variceal_hemorrhage,
                        '' as encephalopathy,
                        '' as ctpScore,
                        CIRRHOSISTYPE as cirrhosistype,medication.IS_PREACTING_ANTIVIRAL
                    from  ${dbConfig.tblHcvPatient} as patients
                      LEFT  JOIN ${dbConfig.tblPatientMedication} as medication
                        ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE FIRST_ENCOUNTER is not null
                    ${whereClause}
                    order by MEDICATION;`;

            // console.log('************** Cost Burden Query **********************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    return;
                } else {
                    result = serverUtils.filterPreactingAntivirals(result, params.showPreactingAntivirals);

                    let compressed_object = LZString.compress(JSON.stringify(result));
                    // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "analytics_cost_burden",
                        data: compressed_object
                    });
                    caching.updateData();

                    callbackFn(undefined, compressed_object);
                }
            });
        }
        catch(ex) {
            console.log(JSON.stringify(ex));
        }
    },
    // Yuvraj 10th Feb 17 - the following function was written in the pharma tab api folder.
    // I have just copied it here sothat I don't get any conflict with pharma data
    'getViralScoreAnalysisData': function(params, callbackFn) {
        try {
            // Early exit condition
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

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "getViralScoreAnalysisData"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callbackFn(undefined, data);
                }, 50);

                return false;
            }


            /* var category_id = params.id;
              var treatment = params.treatment.toLowerCase();
              var cirrhosis = params.cirrhosis;
              var genotype = params.genotype;*/
            var query = ``,
                dataObj = {};

            dataObj['pharmaAnalysisData'] = null;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            // console.log(params);
            // console.log("*** WWHERE CLAUSE ****");
            // console.log(whereClause);

            /*  query = "select round(VALUE_TXT) as ViralScore,pharma.PATIENT_ID_SYNTH,BRAND_NAME as MEDICATION,PERFED_DT,START_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,ROUND(DATEDIFF(END_DATE, START_DATE)/7, 0) as weeks " +
                  "from  IMS_LRX_AmbEMR_Dataset.IMS_HCV_PHARMA  pharma join IMS_HCV_PATIENTS hcv on hcv.PATIENT_ID_SYNTH = pharma.PATIENT_ID_SYNTH " +
                  "where (VALUE_TXT < 12 and  VALUE_TXT REGEXP '^[0-9]+\\.?[0-9]*$')";*/

            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // query = `select medication.PATIENT_ID_SYNTH,PatientId ,PAID as cost,medication.IDW_PATIENT_ID_SYNTH,ViralLoad,Perfed_Dt, STRT_DATE,END_DATE,GENOTYPE,FibrosureValue as fibro_Value,CIRRHOSIS,RACE_DESC,GENDER_CD,Age,TREATMENT,MEDICATION,TREATMENT_PERIOD from PATIENT_MEDICATIONS medication join ALL_VIRAL_LOAD_RESULTS res
            // on medication.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS patients on patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH
            // where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
            // AND MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            // ${whereClause}
            // ${preactiveAntivalsQuery}
            //  ORDER BY STRT_DATE ASC
            // `;
            /**
             * @author: Arvind
             * @reviewer: 
             * @date: 29-March-2017
             * @desc:  Added `IS_RELAPSED`,`IS_REMITTED` column in query which I used for find relapsed patient 
             */
            /**
             * @author: Nisha
             * @date: 16th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            //  medication.IDW_PATIENT_ID_SYNTH,
            query = `select medication.PATIENT_ID_SYNTH,
                        PatientId ,
                        case when PAID is null then 0 when PAID = '' then 0 else PAID end as cost,                      
                        case when ViralLoad like '%NOT DETECTED%' then 0 else ViralLoad end as ViralLoad,
                        ${dbConfig.Perfed_Dt} as Perfed_Dt,
                        STRT_DATE,END_DATE,GENOTYPE, FibrosureValue as fibro_Value,CIRRHOSIS,
                        RACE_DESC,GENDER_CD,${dbConfig.age} as Age,TREATMENT,
                        MEDICATION,TREATMENT_PERIOD,IS_RELAPSED, IS_REMITTED
                    from ${dbConfig.tblPatientMedication} medication
                    join ${dbConfig.tblViralload} res
                        on medication.PATIENT_ID_SYNTH = res.PatientId join ${dbConfig.tblHcvPatient} patients
                        on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$' or ViralLoad like '%NOT DETECTED%')
                        AND MEDICATION IS NOT NULL
                    ${whereClause}
                    ${preactiveAntivalsQuery}
                    ORDER BY STRT_DATE ASC`;


            /*   console.log('*********getPatientPharmaData *************');
             */
            // console.log('*********get ViralScoreAnalysisData *************');
            // console.log(query);
            liveDb.db.query(query, function(error, result) {
                if (error) {

                    // console.log('getPharmaViralScoreAnalysisData');
                    console.log(error);
                    return;
                } else {
                    // console.log('********* Result fetched *************');
                    dataObj['pharmaAnalysisData'] = serverUtils.PharmaAdvanceAnalyticsChartsData(result);

                    let stringyfyResult = JSON.stringify(dataObj);
                    let compressedResult = LZString.compress(stringyfyResult);


                    // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "getViralScoreAnalysisData",
                        data: compressedResult
                    });
                    caching.updateData();

                    callbackFn(undefined, compressedResult);

                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
     /**
     * @author: Yuvraj Pal (28 FEb 2017)
     * @desc: This function was written in Pharma tab API folder, I have just copied it here sothat we can have a saperate method for Analytics tab.
     */
    'getICERData_Analytics': function(params, callbackFn) {
        try {
            // Early exit condition
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


            // @Yuvraj 28th Feb 17 -  caching Implementation.
            // let caching = new CachingObj({
            //     key: "analytics_cost_burden_icer"
            // });

            // if (caching.isDataAvailable()) {
            //     let data = caching.getAvailableData();
            //     setTimeout(function() {
            //         callbackFn(undefined, data);
            //     }, 50);

            //     return false;
            // }


            // let query = ``;
            // query = `select MEDICATION,SuccessProbability,AverageCost from IMS_HCV_ICER `;

            // liveDb.db.query(query, function(error, result) {
            //     if (error) {
            //         console.log(error);
            //         return;
            //     } else {
            //         callback(undefined, result);
            //     }
            // });
            let query = ``;
            //from the previous query only MEDICATION,SuccessProbability,AverageCost are to be used in ICER Calculation.
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            let dataObj = {};
            dataObj.params = params;
            // console.log(params.database);
            // console.log(params.database.indexOf('PHS_HCV'));
            if (params.database.indexOf('PHS_HCV') != -1) {
                query = `SELECT
                    count(distinct patients.PATIENT_ID_SYNTH) as pCount,
                    AVG(PHS_HCV.FN_CALCULATE_AGEMEDIAN(patients.AGE_RANGE)) as avgAge,
                    medication.MEDICATION,
                    SUM(medication.PAID)  as medCostSum,
                    sum(medication.TREATMENT_PERIOD) as treatmentPeriodSum
                    FROM PHS_HCV.PHS_HCV_PATIENTS as patients
                    JOIN PHS_HCV.PHS_PATIENT_MEDICATIONS as medication
                    ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE patients.FibrosureValue > 0.58
                    AND medication.MEDICATION IS NOT NULL
                    AND medication.PAID > 0 
                    ${whereClause}
                    ${preactiveAntivalsQuery}                  
                    GROUP BY medication.MEDICATION;`;
            } else {
                query = `SELECT
                    count(distinct patients.PATIENT_ID_SYNTH) as pCount,
                    AVG(patients.Age) as avgAge,
                    medication.MEDICATION,
                    SUM(medication.CHARGE)  as medCostSum,
                    sum(medication.TREATMENT_PERIOD) as treatmentPeriodSum
                    FROM IMS_HCV_PATIENTS as patients
                    JOIN PATIENT_MEDICATIONS as medication
                    ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    WHERE patients.FibrosureValue > 0.58
                    AND medication.MEDICATION IS NOT NULL
                    AND medication.CHARGE > 0
                    ${whereClause}
                    ${preactiveAntivalsQuery}
                    GROUP BY medication.MEDICATION;`;
            }

            // console.log('******************ICER DATA QUERY*****************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log('getICERData');
                    console.log(error);
                    return;
                } else {
                    dataObj.costData = result;
                    dataObj.medsArray = _.uniq(_.pluck(result, 'MEDICATION'));
                    fetchQualyData(dataObj, callbackFn);
                    //callbackFn(undefined, JSON.stringify(calculateICERData(result)) );
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    
    //Nisha 02/10/2017 get the Liver transplant data
    'getLiverTransplantCostData': function(params, callbackFn) {
        try {
            // Early exit condition
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
            let caching = new CachingObj({
                key: params.database + "analytics_liver_transplant"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callbackFn(undefined, data);
                }, 50);

                return false;
            }

            let query = ``;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';
            /**
             * @author: Nisha
             * @date: 16th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

            query = `select distinct id,charge.PATIENT_ID_SYNTH,Code,RECED_DT,Liver_Transplant_Date,replace(COST_CD,'_',' ') as COST_CD,Prob_NM,GENOTYPE,
                 medication.IS_PREACTING_ANTIVIRAL,charge.CHARGE,case when RECED_DT < Liver_Transplant_Date then 'Cost Before' else 'Cost After' end as Occurance  from  ${dbConfig.tblLiverTransplantCharge} charge join ${dbConfig.tblHcvPatient} patients
                 on charge.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                 left join ${dbConfig.tblPatientMedication} medication
                 on charge.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                 WHERE 1=1
                 ${whereClause} ${preactiveAntivalsQuery}
                 ORDER by GENOTYPE,COST_CD
                 `;

            //    query = `select distinct id,charge.PATIENT_ID_SYNTH,Code, RECED_DT,Liver_Transplant_Date,COST_CD,Prob_NM, charge.CHARGE,case when RECED_DT < Liver_Transplant_Date then 'Before' else 'After' end as Occurance from IMS_HCV_LIVERTRANSPLANT_CHARGE charge`;

            // console.log('*****************getLiverTransplantCostData ********************');
            // console.log(params.database);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    
                    //result = serverUtils.filterPreactingAntivirals(result, params.showPreactingAntivirals);
                    // let chartData = result;
                    let chartData = prepareLiverTransplantData(result, params.genotypes);
                    //console.log("getExtraHepaticData");
                    let stringyfyResult = JSON.stringify(chartData);
                    //console.log("Before Compressed:"+stringyfyResult.length);
                    let compressedResult = LZString.compress(stringyfyResult);
                    //console.log("After Compressed:"+compressedResult.length);

                    let caching = new CachingObj({
                        key: params.database + "analytics_liver_transplant",
                        data: compressedResult
                    });
                    caching.updateData();

                    callbackFn(undefined, compressedResult);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    //Nisha 02/22/2017 get the Liver transplant data
    'getLiverTransplantCostDataDrillDown': function(params, callbackFn) {
        // console.log('***************** START getLiverTransplantCostData Drill Down ********************');

        try {
            // Early exit condition
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
            let query = ``;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;
            let whereClauseDrillDown = ``;
            whereClauseDrillDown += ` AND GENOTYPE = '${params.LTGenoType}'`;
            whereClauseDrillDown += ` AND Occurance = '${params.LTCostType}'`;
            whereClauseDrillDown += ` AND COST_CD = '${params.LTCostDrillDown}'`;

            // console.log('whereClauseDrillDown');
            // console.log(whereClauseDrillDown);

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';
            /**
             * @author: Nisha
             * @date: 16th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

            query = `select id, PATIENT_ID_SYNTH,Code,COST_CD,Prob_NM,GENOTYPE,Occurance,CHARGE, Innertable.IS_PREACTING_ANTIVIRAL
                     from (select distinct id,charge.PATIENT_ID_SYNTH,Code,RECED_DT,Liver_Transplant_Date,COST_CD,Prob_NM,GENOTYPE,
                 charge.CHARGE,case when RECED_DT < Liver_Transplant_Date then 'Cost Before' else 'Cost After' end as Occurance  from   ${dbConfig.tblLiverTransplantCharge} charge join ${dbConfig.tblHcvPatient} patients
                 on charge.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                 left join ${dbConfig.tblPatientMedication} medication
                 on charge.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                 WHERE 1=1
                 ${whereClause} ${preactiveAntivalsQuery}
                 ) Innertable
                 WHERE 1=1 ${whereClauseDrillDown}
                 `;

            //console.log('*****************getLiverTransplantCostData Drill Down ********************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {

                    //result = serverUtils.filterPreactingAntivirals(result, params.showPreactingAntivirals);

                    let chartData = result;
                    let stringyfyResult = JSON.stringify(chartData);
                    //console.log("Before Compressed:"+stringyfyResult.length);
                    let compressedResult = LZString.compress(stringyfyResult);
                    //console.log("After Compressed:"+compressedResult.length);
                    callbackFn(undefined, compressedResult);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
});




//supporting functions
/**
 * @author: Yuvraj Pal (28 FEb 2017)
 * @desc: This functions were written in Pharma tab API file, I have just copied it here sothat we can have a saperate method for Analytics tab.
 */
//function to fetch the Qaly data
let fetchQualyData = (dataObj, callbackFn) => {
    let params = dataObj.params;
    let medsArray = dataObj.medsArray;
    let query = ``;
    let whereClause = serverUtils.getQueryForAdvFilters(params),
        preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

    // Dynamic condition for PREACTING_ANTIVIRAL
    if (params.showPreactingAntivirals) {
        preactiveAntivalsQuery = ``;
    }
    // @Nish 05/19/2017 removed caching as it was generating issue for binding the dropdown Reactive item. 
    // @Yuvraj 28th Feb 17 -  caching Implementation.
    // let caching = new CachingObj({
    //     key: "analytics_cost_burden_icer"
    // });

    // if (caching.isDataAvailable()) {
    //     let data = caching.getAvailableData();
    //     setTimeout(function() {
    //         callbackFn(undefined, data);
    //     }, 50);

    //     return false;
    // }

    // let filterMedsQuery = `AND companalytics.MEDICATION IN (${serverUtils.getStrFromArray(medsArray)})`;


    let filterMedsQuery = `AND medication.MEDICATION IN (${serverUtils.getStrFromArray(medsArray)})`;

    //// New query after merging competiter
    if (params.database.indexOf('PHS_HCV') != -1) {
        query = `SELECT
            distinct  patients.PATIENT_ID_SYNTH,
            medication.MEDICATION,
            SVR_AFTER,SVR_BEFORE
            FROM PHS_HCV.PHS_PATIENT_MEDICATIONS as medication
            join PHS_HCV.PHS_HCV_PATIENTS as patients
            on patients.PATIENT_ID_SYNTH  = medication.PATIENT_ID_SYNTH
            where patients.FibrosureValue > 0.58
            and patients.FibrosureValue REGEXP '^[0-9]+\\.?[0-9]*$'
            and medication.SVR_CURE_RATE_FLAG=1
                ${whereClause}
                ${filterMedsQuery}
                ${preactiveAntivalsQuery}
        ;`;
            } else {
                query = ` SELECT
            distinct  patients.IDW_PATIENT_ID_SYNTH, patients.PATIENT_ID_SYNTH,
            medication.MEDICATION,
            SVR_AFTER,SVR_BEFORE
            FROM PATIENT_MEDICATIONS as medication
            join IMS_HCV_PATIENTS as patients
            on patients.PATIENT_ID_SYNTH  = medication.PATIENT_ID_SYNTH
            where patients.FibrosureValue > 0.58
            and patients.FibrosureValue REGEXP '^[0-9]+\\.?[0-9]*$'

        and medication.SVR_CURE_RATE_FLAG=1
                ${whereClause}
                ${filterMedsQuery}
                ${preactiveAntivalsQuery}
        ;`;
    }

    // console.log('*********Qaly Data Query**************');
    // console.log(query);

    liveDb.db.query(query, function(error, result) {
        if (error) {
            console.log(error);
            return;
        } else {
            dataObj.successData = result;

            // @author: Yuvraj 28th Feb 17 - Saving data into caching object.
            // let caching = new CachingObj({
            //     key: "analytics_cost_burden_icer",
            //     data: JSON.stringify(dataObj)
            // });
            // caching.updateData();

            callbackFn(undefined, JSON.stringify(calculateICERData(dataObj)));
        }
    });
}

//function to calculate ICER Data
let calculateICERData = (dataObj) => {
    let costData = dataObj.costData;
    let successData = dataObj.successData;

    let grpSuccessData = _.groupBy(successData, 'MEDICATION');
    let allSuccessLength = successData.length;

    // console.log('ICER DATA COUNT => ',costData.length);
    // console.log('QALY DATA COUNT => ',successData.length);

    let preparedData = [],
        uniQueMedications = [];

    for (let i = 0; i < costData.length; i++) {
        let drugObj = {};

        drugObj.MEDICATION = costData[i].MEDICATION;
        drugObj.SuccessProbability = getSuccessProbability(grpSuccessData[costData[i].MEDICATION], allSuccessLength);
        drugObj.AverageCost = parseFloat(costData[i].medCostSum / costData[i].treatmentPeriodSum).toFixed(2);
        drugObj.count = costData[i].pCount;

        uniQueMedications.push(costData[i].MEDICATION);
        preparedData.push(drugObj);
    }

    return {
        data: preparedData,
        medication: uniQueMedications
    }
}

//function to calculate the Success Probability
let getSuccessProbability = (drugArray, totalCount) => {
    let successProb = 0.0,
        successCount = 0;

    if (!drugArray)
        return successProb;

    for (let i = 0; i < drugArray.length; i++) {
        let svrBefore = parseFloat(drugArray[i].SVR_BEFORE),
            svrAfter = parseFloat(drugArray[i].SVR_AFTER);
        if ((svrBefore != svrAfter) && (parseFloat(svrAfter) == 0)) {
            successCount++;
        }
    }
    // console.log('Meds', drugArray[0].MEDICATION);
    // console.log('Success Count', successCount);
    // console.log('Total Count', totalCount);

    successProb = (successCount / totalCount) * 100;
    return parseFloat(successProb).toFixed(2);
}

/**
 * Nisha
 * 02/14/2017
 * Description : Prepare required charts data for Liver Transplant average cost before and after treatment.
 * 02/16/17 : modified the logid for Drill down.
 */
export let prepareLiverTransplantData = (data, genotypes) => {

    /**
     * @author: Pramveer
     * @date: 1st Mar 17
     * @desc: Implemented the average cost on the data & Implemented json structure for drilldwon dataset.
     */

    let finalObj = {};
    // Grouped by "Before" / "After"
    var chartDataMedicineStatus = _.groupBy(data, 'Occurance');

    var jsonSCTreatmentPho = [],
        jsonTreatmentPSCDrilDown = [];
    let js = [];
    for (let keys in chartDataMedicineStatus) {

        var chartDatasinglecombineTreatmentPho = {},
            jsTreatmentPhodata = {},
            jsonSCWiseTreatmentPho = [],
            chartDataSCTreatmentP = [],
            jsonSCTreatmentP = {};
        // Grouped by Genotype
        var chartDataTreatmentPhosisWise = _.groupBy(chartDataMedicineStatus[keys], 'GENOTYPE');
        var sumavgpatientcharges = 0;
        var sumavgpatientchargescost_cd = 0;
        for (let keysSCTreatmentP in chartDataTreatmentPhosisWise) {

            for (i = 0; i < chartDataTreatmentPhosisWise[keysSCTreatmentP].length; i++) {
                // Sum for Genotypes
                sumavgpatientcharges = sumavgpatientcharges + chartDataTreatmentPhosisWise[keysSCTreatmentP][i].CHARGE;
            }
            // Average cost
            // sumavgpatientcharges = sumavgpatientcharges / _.uniq(_.pluck(chartDataTreatmentPhosisWise[keysSCTreatmentP], 'PATIENT_ID_SYNTH')).length;
            //let categoryPatients = _.uniq(_.pluck(chartDataTreatmentPhosisWise[keysSCTreatmentP], 'PATIENT_ID_SYNTH'));
            let categoryPatients = serverUtils.getUniqueCount(chartDataTreatmentPhosisWise[keysSCTreatmentP], 'PATIENT_ID_SYNTH');
            let avgCostForCategory = sumavgpatientcharges / categoryPatients;
            chartDatasinglecombineTreatmentPho = ({ name: keysSCTreatmentP, y: sumavgpatientcharges, drilldown: keys + "_" + keysSCTreatmentP, avgCost: avgCostForCategory, total: ~~categoryPatients });
            jsonSCWiseTreatmentPho.push(chartDatasinglecombineTreatmentPho);
            // Grouped by Cost Codes
            let TreatmentPhoSCData = _.groupBy(chartDataTreatmentPhosisWise[keysSCTreatmentP], 'COST_CD');

            chartDataSCTreatmentP = [];
            for (let keysSCTreatmentPM in TreatmentPhoSCData) {
                sumavgpatientchargescost_cd = 0
                js = [];
                let json = {};

                for (i = 0; i < TreatmentPhoSCData[keysSCTreatmentPM].length; i++) {
                    // Sum for Cost codes
                    sumavgpatientchargescost_cd = sumavgpatientchargescost_cd + TreatmentPhoSCData[keysSCTreatmentPM][i].CHARGE;
                }
                // Average cost
                // sumavgpatientchargescost_cd = sumavgpatientchargescost_cd / _.uniq(_.pluck(TreatmentPhoSCData[keysSCTreatmentPM], 'PATIENT_ID_SYNTH')).length;

                //let codepatients = _.uniq(_.pluck(TreatmentPhoSCData[keysSCTreatmentPM], 'PATIENT_ID_SYNTH'));
                let codepatients = serverUtils.getUniqueCount(TreatmentPhoSCData[keysSCTreatmentPM], 'PATIENT_ID_SYNTH');
                let avgCostForCodes = sumavgpatientchargescost_cd / codepatients;

                // js.push(keysSCTreatmentPM);
                // js.push(sumavgpatientchargescost_cd);
                // js.push(avgCostForCodes);
                //chartDataSCTreatmentP.push(js);

                json.name = keysSCTreatmentPM;
                json.y = sumavgpatientchargescost_cd;
                json.avgCost = avgCostForCodes;
                json.total = ~~codepatients;

                chartDataSCTreatmentP.push(json);
            }

            jsonSCTreatmentP = ({ name: keysSCTreatmentP, id: keys + "_" + keysSCTreatmentP, data: chartDataSCTreatmentP });
            jsonTreatmentPSCDrilDown.push(jsonSCTreatmentP);
        }
        //console.log(sumavgpatientcharges);
        jsTreatmentPhodata = ({ name: keys, data: jsonSCWiseTreatmentPho });
        jsonSCTreatmentPho.push(jsTreatmentPhodata);
    }


    finalObj.jsonTreatmentPSCDrilDownt = jsonTreatmentPSCDrilDown;
    finalObj.jsonSCTreatmentPhot = jsonSCTreatmentPho;
    //finalObj.uniqueTotal = _.uniq(_.pluck(data, 'PATIENT_ID_SYNTH')).length;
    finalObj.uniqueTotal = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
    // finalObj.fullData = data;
    return finalObj;
}
