import * as serverUtils from '../../common/serverUtils.js';
import * as pharmaUtils from './pharmaUtils.js';
import {
    LZString
} from 'meteor/nunohvidal:lz-string';
import {
    Meteor
} from 'meteor/meteor';


Meteor.syncMethods({
    'getPatientPharmaData': function(params, callback) {
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
            /* var category_id = params.id;
              var treatment = params.treatment.toLowerCase();
              var cirrhosis = params.cirrhosis;
              var genotype = params.genotype;*/


            // Yuvraj 10 Feb 17 -  We will work on this thing after the demo.

            // let caching = new CachingObj({
            //     key : params['tabname']
            // });


            // if(caching.isDataAvailable()){
            //     let data = caching.getAvailableData();
            //     setTimeout(function() {
            //         callback(undefined , data);
            //     }, 50);

            //     return false;
            // }


            var query = '',
                dataObj = {};

            dataObj['pharmaData'] = null;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            // console.log(params);
            // console.log("*** WWHERE CLAUSE ****");
            // console.log(whereClause);


            query = `SELECT LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine ,medication.PATIENT_ID_SYNTH , MEDICATION ,
            TREATMENT_PERIOD ,NDC , STRT_DATE ,END_DATE ,DAYS_MEDICATION ,patients.VIRAL_LOAD , SVR12 as isCured,  Age ,GENDER_CD ,DEAD_IND,
            RACE_DESC ,ETHNITY_1_DESC,   GENOTYPE , CIRRHOSIS , TREATMENT , TREATMENT_CONDITION  ,PAID,IS_RETREATED
            FROM  PATIENT_MEDICATIONS medication INNER JOIN IMS_HCV_PATIENTS patients
            on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH and MEDICATION IS NOT NULL
             ${whereClause}
             ${preactiveAntivalsQuery}
            `;

            // console.log('*********getPatientPharmaData *************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    // console.log('Summary error');
                    // console.log(error);
                    return;
                } else {
                    // console.log('********* Result fetched *************');
                    //console.log(params);
                    if (params['tabname'] == 'summary') {
                        let parsed_result = [];
                        // console.log('**********Result Fetched Length***********');
                        // console.log(Buffer.byteLength(result,'utf8'));
                        if (result.length) {
                            let data = _.groupBy(result, 'PATIENT_ID_SYNTH');
                            for (let key in data) {
                                if (data[key].length > 1) {
                                    parsed_result.push(data[key][0]);
                                } else {
                                    parsed_result.push(data[key][0]);
                                }
                            }
                        }
                        // OLD MEthod
                        // prepareChartsData(result, params, callback);
                        // New Mthod

                        prepareChartsData(parsed_result, result, params, callback);

                    } else if (params['tabname'] == 'advanceanalytics') {
                        dataObj['pharmaGenotypeData'] = serverUtils.PharmaAdvanceAnalyticsGenotypeData(result);
                        dataObj['pharmaPatientLength'] = result.length;
                        // dataObj['pharmaData'] = result;

                        let stringyfyResult = JSON.stringify(dataObj);
                        // console.log("Before Compressed:" + stringyfyResult.length);
                        let compressedResult = LZString.compress(stringyfyResult);
                        // console.log("After Compressed:" + compressedResult.length);

                        callback(undefined, compressedResult);
                    } else {
                        dataObj['pharmaData'] = result;

                        let stringyfyResult = JSON.stringify(dataObj);
                        // console.log("Before Compressed:" + stringyfyResult.length);
                        let compressedResult = LZString.compress(stringyfyResult);
                        // console.log("After Compressed:" + compressedResult.length);


                        callback(undefined, compressedResult);
                    }


                }

            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPharmaViralScoreAnalysisData': function(params, callback) {
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
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
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
            /**
             * @author: Arvind
             * @reviewer: 
             * @date: 29-March-2017
             * @desc:  Added `IS_RELAPSED`,`IS_REMITTED` column in query which I used for find relapsed patient 
             */
            query = `select medication.PATIENT_ID_SYNTH,PatientId
             ,PAID as cost
             ,medication.IDW_PATIENT_ID_SYNTH,ViralLoad
             ,Perfed_Dt
             , STRT_DATE
             ,END_DATE
             ,GENOTYPE
             ,FibrosureValue as fibro_Value
             ,CIRRHOSIS
             ,RACE_DESC
             ,GENDER_CD
             ,Age
             ,TREATMENT
             ,MEDICATION
             ,TREATMENT_PERIOD 
             ,IS_RELAPSED,
             IS_REMITTED
             from PATIENT_MEDICATIONS medication join ALL_VIRAL_LOAD_RESULTS res
            on medication.PATIENT_ID_SYNTH = res.PatientId
            join IMS_HCV_PATIENTS patients on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
            where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
            AND MEDICATION IS NOT NULL
            ${whereClause}
            ${preactiveAntivalsQuery}
             ORDER BY STRT_DATE ASC
            `;

            /*   console.log('*********getPatientPharmaData *************');
               console.log(query);*/
            // console.log('*********getPharmaViralScoreAnalysisData *************');
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    // console.log('getPharmaViralScoreAnalysisData');
                    // console.log(error);
                    return;
                } else {
                    // console.log('********* Result fetched *************');
                    dataObj['pharmaAnalysisData'] = serverUtils.PharmaAdvanceAnalyticsChartsData(result);

                    let stringyfyResult = JSON.stringify(dataObj);
                    // console.log("Before Compressed:" + stringyfyResult.length);
                    let compressedResult = LZString.compress(stringyfyResult);
                    // console.log("After Compressed:" + compressedResult.length);
                    callback(undefined, compressedResult);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPharmaCompetitorAnalysisData': function(params, callback) {
        try {
            // Early exit condition
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            // console.log('1');
            if (!isValidParams({
                    params: params,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }

            var query = ``,
                dataObj = {};
            //  console.log('2');
            dataObj['pharmaCompetitorAnalysisData'] = null;

            let whereClause = ``;
            // console.log(params);
            //query for genotype
            if (params.genotypes && params.genotypes.length) {
                whereClause += ` AND  patients.GENOTYPE IN (${serverUtils.getStrFromArray(params.genotypes)})`;
            }

            //query for treatment
            if (params.treatment && params.treatment.length) {
                whereClause += ` AND patients.TREATMENT IN (${serverUtils.getStrFromArray(params.treatment)})`;
            }

            //query for cirrhosis
            if (params.cirrhosis && params.cirrhosis.length) {
                whereClause += ` AND patients.CIRRHOSIS IN (${serverUtils.getStrFromArray(params.cirrhosis)})`;
            }

            //query for Medication (Pharma Tab)
            /* if (params.medication && params.medication.length) {
                whereClause += ` AND MEDICATION IN (${serverUtils.getStrFromArray(params.medication)})`;
                // whereClause += ` AND MEDICATION  Like "%${params.medication}%"`;
        }*/
            // Nisha 03/01/2017 Modified to fix filtering by Medication issue
            if (params.medicationArray && params.medicationArray.length) {
                whereClause += ` AND MEDICATION IN (${serverUtils.getStrFromArray(params.medicationArray)})`;
                // whereClause += ` AND MEDICATION  Like "%${params.medication}%"`;
            }

            let preactiveAntivalsQuery = ` AND pmc.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            // console.log(whereClause);
            // //Praveen 03/24/2017 added date condition by default;
            // let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';
            //////// New Compiteteor Query
            // console.log('3');
            query = ` SELECT distinct patients.PATIENT_ID_SYNTH, MEDICATION, patients.GENOTYPE, IFNULL(SVR_BEFORE, 0) as SVR_BEFORE, IFNULL(SVR_AFTER, 0) as SVR_AFTER, TREATMENT, CIRRHOSIS,
            case when (IFNULL(SVR_BEFORE, 0) <> 0 and IFNULL(SVR_AFTER, 0) > 0) then 'Detectable SVR' else 'Undetectable SVR' end as SVR_Result
            FROM PATIENT_MEDICATIONS pmc join
            IMS_HCV_PATIENTS patients on pmc.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
            Where pmc.MEDICATION IS NOT NULL and pmc.SVR_CURE_RATE_FLAG=1
              ${whereClause}
              ${preactiveAntivalsQuery}
               `;
            // console.log('*********getPharmaCompetitorAnalysisData *************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    // console.log('********* Result fetched *************');
                    //  dataObj['pharmaCompetitorAnalysisData'] = result;
                    let stringyfyResult = JSON.stringify(pharmaUtils.prepareCompetitorAnalysisChartData({
                        data: result
                    }));
                    // console.log("Before Compressed:"+stringyfyResult.length);
                    let compressedResult = LZString.compress(stringyfyResult);
                    //console.log("After Compressed:"+compressedResult.length);

                    callback(undefined, compressedResult);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPharmaTreatedPatientsDataForDashboards': function(params, callback) {
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
                    params: {},
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let whereClause = serverUtils.getQueryForAdvFilters(params);

            let preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            let query = '',
                dataObj = {};
            dataObj['patientPrescription'] = null;
            /**
             * @author: Arvind
             * @reviewer: 
             * @date: 05-Apr-2017
             * @desc: Adeed 'is_hospitalized' and 'is_liver_failure' column previously this flag was calculated
             *  by Hospitalization_Cost and liver_disease_cost
             */
            query = `select 
                    patients.PATIENT_ID_SYNTH as patientId,
                    patients.IDW_PATIENT_ID_SYNTH as patientId1, 
                    Age as age, 
                    GENOTYPE as genotype,
                    CIRRHOSIS as cirrhosis,
                    patients.VIRAL_LOAD  as viralLoad,
                    TREATMENT as treatment,
                    GENDER_CD as gender, 
                    STRT_DATE as start_date,
                    FIRST_ENCOUNTER as admissionDate,
                    year(FIRST_ENCOUNTER) as yearAdmission,
                    FibrosureStage,
                    (case when ALCOHOL = "Yes" then 1 else 0 end) as Alcohol, 
                    (case when MENTAL_HEALTH = "Yes" then 1 else 0 end) as "Mental Health",
                    (case when RENAL_FAILURE = "Yes" then 1 else 0 end)  as "Renal Failure",
                    IS_ANIMIA as anemia,"" as Cardiovascular,MELD_SCORE as meldScore, 
                    (case when HIV = "Yes" then 1 else 0 end) as HIV,"" as Muscular_dystrophy,
                    "" as Schistosomiasis_coinfection,
                    PAT_ZIP as zipcode,
                    ST_CD as state_code, 
                    FIBROSCANE as fibrosis,
                    "" disease_progression,
                    "" labs_ast,
                    "" labs_apri,
                    "" labs_alt,
                    "" labs_platelets,
                    MELD_SCORE as  labs_meld,
                    "" labs_inr,
                    "" labs_albumin,
                    "" labs_total_bilirubin,
                    RACE_DESC  as race,
                    BODY_WEIGHT as weight,
                    ETHNITY_1_DESC as ethnicity,
                    CIRRHOSISTYPE as cirrhosistype,
                    FIRST_ENCOUNTER as dischargeDate, 
                    MEDICATION as medication,
                    IS_RETREATED,
                    patients.APRI as "APRI" ,
                    CLAIMS_INSURANCEPLAN,
                    medication.IS_COMPLETED,
                    medication.SVR12,
                    (CASE 
                    WHEN CLAIMS_INSURANCEPLAN REGEXP '^Commercial' = 1 THEN 'Commercial' 
                    WHEN CLAIMS_INSURANCEPLAN REGEXP '^Medicaid' = 1 THEN 'Medicaid' 
                    WHEN CLAIMS_INSURANCEPLAN REGEXP '^Medicare' = 1 THEN 'Medicare' 
                    WHEN CLAIMS_INSURANCEPLAN = 'No Enrollment' THEN 'No Enrollment' 
                    ELSE 'NA'
                    END)
                    as InsuranceGrp,
                    (case when MEDICATION is not null  then 1 else 0 end) as "Antiviral Therapy" , 
                    cast(PAID as decimal(12,2)) as claims_cost, 
                    cast(PAID as decimal(12,2)) as "Antiviral Therapy_Cost",
                    is_liver_failure as "Liver Disease", 
                    cast(Liver_Disease_Cost as decimal(12,2)) as "Liver Disease_Cost",
                    FibrosureValue as fibro_Value,
                    Physician_Service_Cost as "Physician Service_Cost",
                    (case when Physician_Service_Cost is not null  then 1 else 0 end) as "Physician Service",
                    Hospitalization_Cost,
                    is_hospitalized as "Hospitalization",
                    IS_PREACTING_ANTIVIRAL  
                FROM IMS_HCV_PATIENTS  patients 
                JOIN PATIENT_MEDICATIONS medication   
                    ON patients.PATIENT_ID_SYNTH  = medication.PATIENT_ID_SYNTH
                    where 1=1
                  ${whereClause}
                  ${preactiveAntivalsQuery}`;
            //   LEFT OUTER 


            // console.log('*********Market Overview*************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //treatment data
                    dataObj['treatment'] = pharmaUtils.getKeyValueForData(_.groupBy(result, 'treatment'), 'treatment');

                    dataObj['patientPrescription'] = pharmaUtils.preparePatientPrescriptionData(result);
                    dataObj['MarketShareOverMonthsChartData'] = pharmaUtils.prepareMarketShareOverMonthsChartData(result);
                    dataObj['TotalN'] = result.length;
                    // console.log('chart data prepared');
                    getPrescriptionData(dataObj, params, callback);
                }
            });

        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'dataForPharmaCurefailure': function(params, callbackFn) {
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
                    params: {},
                    cb: callbackFn
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let whereClause = serverUtils.getQueryForAdvFiltersWithoutMedication(params);
            let query = `select  patients.GENOTYPE as genotype,
                            patients.CIRRHOSIS as cirrhosis,
                            patients.TREATMENT as treatment,
                            patients.RACE_DESC as race,  
                            patients.PATIENT_ID_SYNTH ,
                            medication.PATIENT_ID_SYNTH,
                            NO_PRESCRIPTION 
                            FROM IMS_HCV_PATIENTS as patients 
                            LEFT JOIN PATIENT_MEDICATIONS as medication
                            ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                            WHERE patients.NO_PRESCRIPTION IS NOT NULL ${whereClause}`;
            // let whereClause =  serverUtils.getQueryForAdvFilters(params);
            // let query = `select  patients.GENOTYPE as genotype,
            //                 patients.CIRRHOSIS as cirrhosis,
            //                 patients.TREATMENT as treatment,
            //                 patients.RACE_DESC as race,  
            //                 patients.PATIENT_ID_SYNTH ,
            //                 medication.PATIENT_ID_SYNTH,
            //                 NO_PRESCRIPTION,
            //                 0 from  IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients  
            //                -- tbl_Temp_NR_PositiveViralLoad pv
            //               --  on patients.PATIENT_ID_SYNTH = pv.PATIENT_ID_SYNTH                           
            //                 left join PATIENT_MEDICATIONS medication on
            //                 patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH 
            // 				where NO_PRESCRIPTION ='Yes'
            //                 and medication.PATIENT_ID_SYNTH is null ${whereClause}`;

            liveDb.db.query(query, (error, result) => {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //console.log("Set PatientData");
                    let data = prepareDataPositiveViralLoad(result);
                    let stringified = JSON.stringify(data);
                    let compressed_object = LZString.compress(stringified);
                    callbackFn(undefined, compressed_object);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPharmaCompetitorAnalysisYearlyData': function(params, callback) {
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
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }

            var query = ``,
                dataObj = {};

            dataObj['pharmaCompetitorAnalysisYearlyData'] = null;
            let whereClause = ``;
            // console.log(params);
            //query for genotype
            if (params.genotypes && params.genotypes.length) {
                whereClause += ` AND GENOTYPE IN (${serverUtils.getStrFromArray(params.genotypes)})`;
            }

            //query for treatment
            if (params.treatment && params.treatment.length) {
                whereClause += ` AND TREATMENT IN (${serverUtils.getStrFromArray(params.treatment)})`;
            }

            //query for cirrhosis
            if (params.cirrhosis && params.cirrhosis.length) {
                whereClause += ` AND CIRRHOSIS IN (${serverUtils.getStrFromArray(params.cirrhosis)})`;
            }

            //Praveen 03/21/2017 query for preacting antiviral MEDICATION_MARKET_SHARE
            if (params.medicationArray && params.medicationArray.length) {
                whereClause += ` AND MEDS_NM IN (${serverUtils.getStrFromArray(params.medicationArray)})`;
                // whereClause += ` AND MEDICATION  Like "%${params.medication}%"`;
            }
            //Praveen 03/21/2017 query for preacting antiviral MEDICATION_MARKET_SHARE
            let preactiveAntivalsQuery = '';
            preactiveAntivalsQuery = ` AND MEDS_NM NOT IN ('RIBAVIRIN') AND MEDS_NM NOT LIKE 'PEGASYS'`;
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            whereClause += preactiveAntivalsQuery;

            //Praveen 03/24/2017 added date condition by default;
            // let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';
            // // No Filter by medication reqiured
            // //query for Medication (Pharma Tab)
            let filteredMedicine = params.medication;
            // // params.medication = 'all';
            // if (params.medication && params.medication != 'all') {
            //     whereClause += ` AND BRAND_NAME IN (${serverUtils.getStrFromArray(params.medication)})`;
            //     // whereClause += ` AND BRAND_NAME  Like "%${params.medication}%"`;
            // }
            //  console.log(whereClause);
            // ${whereClause}
            //// Here dynamic query building need to change fot this table 10K Records
            ////Added `PATIENT_ID_SYNTH` column in below query on 17-FEB-2017 by Arvind
            query = `SELECT  patients.PATIENT_ID_SYNTH, patients.IDW_PATIENT_ID_SYNTH , MEDS_NM ,FILL_YEAR,GENOTYPE,TREATMENT,CIRRHOSIS,FILL_YEAR  FROM MEDICATION_MARKET_SHARE productYear
            join IMS_HCV_PATIENTS patients  on productYear.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
            Where  1=1
            ${whereClause}
            `;
            //console.log('*********getPharmaCompetitorAnalysisYearlyData Query fetched *************');
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {

                    // console.log('********* getPharmaCompetitorAnalysisYearlyData Result fetched *************');
                    // console.log(result.length);
                    //  dataObj['pharmaCompetitorAnalysisYearlyData'] = result;
                    //dataObj.pharmaCompetitorAnalysisYearlyData1 =  pharmaUtils.prepareCompetitorAnalysisChartData({data:result});
                    let stringyfyResult = JSON.stringify(pharmaUtils.prepareCompetitorAnalysisYearlyChartData({
                        data: result,
                        filteredMedicine: filteredMedicine
                    }));
                    // console.log("Before Compressed:" + stringyfyResult.length);
                    let compressedResult = LZString.compress(stringyfyResult);
                    // console.log("After Compressed:" + compressedResult.length);
                    callback(undefined, compressedResult);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPharmaCompetitorAnalysisYearlyMapData': function(params, callback) {
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
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }

            var query = ``,
                dataObj = {};

            dataObj['pharmaCompetitorAnalysisYearlyData'] = null;
            let whereClause = ``;

            //query for genotype
            if (params.genotypes && params.genotypes.length) {
                whereClause += ` AND GENOTYPE IN (${serverUtils.getStrFromArray(params.genotypes)})`;
            }

            //query for treatment
            if (params.treatment && params.treatment.length) {
                whereClause += ` AND TREATMENT IN (${serverUtils.getStrFromArray(params.treatment)})`;
            }

            //query for cirrhosis
            if (params.cirrhosis && params.cirrhosis.length) {
                whereClause += ` AND CIRRHOSIS IN (${serverUtils.getStrFromArray(params.cirrhosis)})`;
            }

            if (params.Year) {
                whereClause += ` AND FILL_YEAR = ${params.Year}`;
            }

            //Praveen 03/21/2017 query for preacting antiviral MEDICATION_MARKET_SHARE
            let preactiveAntivalsQuery = '';
            preactiveAntivalsQuery = ` AND MEDS_NM NOT IN ('RIBAVIRIN') AND MEDS_NM NOT LIKE 'PEGASYS'`;
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            whereClause += preactiveAntivalsQuery;

            query = `SELECT patients.PATIENT_ID_SYNTH, patients.IDW_PATIENT_ID_SYNTH , MEDS_NM ,FILL_YEAR,GENOTYPE,TREATMENT,CIRRHOSIS,
            case when PROVIDER_ST_CD is null then 'Undetermined'
            when PROVIDER_ST_CD = '' then 'Undetermined'
            else PROVIDER_ST_CD end as PROVIDER_ST_CD,
            case when ST_CD is null then 'Undetermined'
            when ST_CD = '' then 'Undetermined'
            else ST_CD end as PATIENT_ST_CD FROM MEDICATION_MARKET_SHARE productYear
            join IMS_HCV_PATIENTS patients  on productYear.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
            Where  1=1
            ${whereClause}`;
            //console.log('*********getPharmaCompetitorAnalysisYearlyData Query fetched *************');
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    let stringyfyResult = JSON.stringify(result);
                    let compressedResult = LZString.compress(stringyfyResult);
                    callback(undefined, compressedResult);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPhysicanPatientTargetTabData': function(params, callback) {
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
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }

            //console.log('calling server');
            let whereClause = ``,
                fdaCompliantQuery = getFdaCompliantQuery(params.fdaCompliant),
                preactiveAntivalsQuery = ` AND meds.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            let dataParams = {};
            dataParams['params'] = params;
            dataParams['utilizationRecords'] = null;

            //query for genotype
            if (params.genotypes && params.genotypes.length) {
                whereClause += ` AND  patients.GENOTYPE IN (${serverUtils.getStrFromArray(params.genotypes)})`;
            }

            //query for treatment
            if (params.treatment && params.treatment.length) {
                whereClause += ` AND patients.TREATMENT IN (${serverUtils.getStrFromArray(params.treatment)})`;
            }

            //query for cirrhosis
            if (params.cirrhosis && params.cirrhosis.length) {
                whereClause += ` AND patients.CIRRHOSIS IN (${serverUtils.getStrFromArray(params.cirrhosis)})`;
            }

            //query for Medication (Pharma Tab)
            if (params.medication && params.medication.length) {
                whereClause += ` AND  meds.MEDICATION IN (${serverUtils.getStrFromArray(params.medication)})`;
                // whereClause += ` AND meds.MEDICATION  Like "%${params.medication}%"`;
            }
            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';


            let query = `select
					patients.GENOTYPE as genotype,
					patients.CIRRHOSIS as cirrhosis,
					patients.TREATMENT as treatment,
					patients.RACE_DESC as race,
					patients.ETHNITY_1_DESC as ethnicity,
					1 as total,
					meds.SVR12,
					YEAR(meds.STRT_DATE) as Year,
					patients.PAT_ZIP as zipcode,
					meds.VIRAL_LOAD as viralLoad,
					meds.TREATMENT_PERIOD as treatmentPeriod,
					meds.MEDICATION as Medication,
					patients.PATIENT_ID_SYNTH as patientId,
					patients.AGE as age,
					patients.GENDER_CD as gender,
                    patients.IS_LIVER_FAILURE as AssessmentLiverDisease,
					patients.FIRST_ENCOUNTER as admissionDate,
                    meds.PROVIDER_ST_CD,
                    patients.ST_CD,
					(case WHEN meds.PROVIDER_ID_SYNTH IS NULL THEN 0
						ELSE meds.PROVIDER_ID_SYNTH END ) as providerId
					from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
					JOIN PATIENT_MEDICATIONS as meds
					on meds.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH WHERE
					meds.MEDICATION IS NOT NULL
					${whereClause}
					${fdaCompliantQuery}
					${preactiveAntivalsQuery}`;

            /* let query = `select
                     patients.GENOTYPE as genotype,
                     patients.CIRRHOSIS as cirrhosis,
                     patients.TREATMENT as treatment,
                     patients.RACE_DESC as race,
                     patients.ETHNITY_1_DESC as ethnicity,
                     1 as total,
                     meds.SVR12,
                     YEAR(patients.FIRST_ENCOUNTER) as Year,
                     patients.PAT_ZIP as zipcode,
                     meds.VIRAL_LOAD as viralLoad,
                     meds.TREATMENT_PERIOD as treatmentPeriod,
                     meds.MEDICATION as Medication,
                     patients.PATIENT_ID_SYNTH as patientId,
                     patients.AGE as age,
                     patients.GENDER_CD as gender,
                     patients.FIRST_ENCOUNTER as admissionDate,
                     meds.PROVIDER_ST_CD,
                     patients.ST_CD,
                     (case WHEN meds.PROVIDER_ID_SYNTH IS NULL THEN 0
                         ELSE meds.PROVIDER_ID_SYNTH END ) as providerId
                     from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
                     join PATIENT_MEDICATIONS as meds
                     on meds.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH WHERE
                     meds.MEDICATION IS NOT NULL
                     ${whereClause}
                     ${fdaCompliantQuery}
                     ${preactiveAntivalsQuery}
                     `; */

            //console.log('**********getPhysicanPatientTargetTabData Tab Query***********');
            //  console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //console.log(result.length);
                    dataParams['utilizationRecords'] = result;

                    getDrugByGenotypeData(dataParams, callback);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPharmaComorbidity': function(params, callback) {
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
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var query = ``,
                dataObj = {};

            dataObj.pharmaComorbidity = null;

            let whereClause = ``,
                preactiveAntivalsQuery = ` AND m.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            //query for genotype
            if (params.genotypes && params.genotypes.length) {
                whereClause += ` AND p.GENOTYPE IN (${serverUtils.getStrFromArray(params.genotypes)})`;
            }

            //query for treatment
            if (params.treatment && params.treatment.length) {
                whereClause += ` AND p.TREATMENT IN (${serverUtils.getStrFromArray(params.treatment)})`;
            }

            //query for cirrhosis
            if (params.cirrhosis && params.cirrhosis.length) {
                whereClause += ` AND p.CIRRHOSIS IN (${serverUtils.getStrFromArray(params.cirrhosis)})`;
            }

            //query for Medication (Pharma Tab)
            if (params.medication && params.medication.length) {
                whereClause += ` AND m.MEDICATION IN (${serverUtils.getStrFromArray(params.medication)})`;
            }

            // console.log(params);
            // console.log("*** WWHERE CLAUSE ****");
            //// Here dynamic query building need to change fot this table

            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND p.FIRST_ENCOUNTER >="2013-01-01"';

            // console.log(whereClause);
            query = `select c.BILLG_ICD9_CD,p.PATIENT_ID_SYNTH,c.Comorbidity,c.ICD9_Codes,m.MEDICATION ,p.GENOTYPE ,p.CIRRHOSIS ,p.TREATMENT ,m.SVR_BEFORE ,m.SVR_AFTER ,  case when (IFNULL(m.SVR_BEFORE, 0) <> 0 and IFNULL(m.SVR_AFTER, 0) > 0) then 'Detectable SVR' else 'Undetectable SVR'
            end as SVR_Result,DIAGNOSIS_DESC  from  IMS_HCV_MEDICATIONS_COMORBIDITY c
            join IMS_HCV_PATIENTS p on c.PATIENT_ID_SYNTH=p.PATIENT_ID_SYNTH
            join PATIENT_MEDICATIONS m on m.PATIENT_ID_SYNTH=p.PATIENT_ID_SYNTH
            Where m.MEDICATION IS NOT NULL  and m.SVR_CURE_RATE_FLAG=1
            ${whereClause}
            ${preactiveAntivalsQuery}`;
            // console.log('*********getPharmaComorbidity Query fetched *************');
            // console.log(query);
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    // console.log('********* pharmaComorbidity Result Proccesed *************');

                    let stringyfyResult = JSON.stringify(pharmaUtils.prepareComorbiditiesWithICDChartsData({
                        data: result
                    }));
                    // console.log("Before Compressed:"+stringyfyResult.length);
                    let compressedResult = LZString.compress(stringyfyResult);
                    //console.log("After Compressed:"+compressedResult.length);
                    callback(undefined, compressedResult);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPatientsJourney': function(params, callback) {
        // Early exit condition
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
        var query = ``,
            dataObj = {};

        dataObj['PatientsJourney'] = null;
        let whereClause = serverUtils.getQueryForAdvFilters(params),
            preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

        // Dynamic condition for PREACTING_ANTIVIRAL
        if (params.showPreactingAntivirals) {
            preactiveAntivalsQuery = ``;
        }

        // console.log(params);
        // console.log("*** WWHERE CLAUSE ****");
        // console.log(whereClause);
        // previous query

        query = `select medication.PATIENT_ID_SYNTH,PatientId ,ViralLoad, ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) as Weeks,Perfed_Dt,STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,MEDICATION,TREATMENT_PERIOD
            from PATIENT_MEDICATIONS medication join ALL_VIRAL_LOAD_RESULTS res  on medication.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS patients
            on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
             where
             (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$') AND MEDICATION IS NOT NULL
            AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) > -8 AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 70
            ${whereClause}
            ${preactiveAntivalsQuery}
            `;
        // console.log('********* getPatientsJourney Query fetched *************');
        liveDb.db.query(query, function(error, result) {
            if (error) {
                console.log(error);
                return;
            } else {
                // console.log('********* Result fetched *************');
                dataObj['PatientsJourney'] = result;
                callback(undefined, dataObj);
            }
        });
    },
    'getPatientsCost': function(params, callback) {
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
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let query = ``;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            let dataObj = {};
            // console.log(params);
            // console.log("*** WWHERE CLAUSE ****");
            // console.log(whereClause);
            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';

            //// OLD query
            query = `SELECT LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine,medication.PATIENT_ID_SYNTH ,medication.IDW_PATIENT_ID_SYNTH , MEDICATION ,
             TREATMENT_PERIOD ,NDC , STRT_DATE ,END_DATE ,DAYS_MEDICATION ,patients.VIRAL_LOAD , SVR12 ,  Age ,GENDER_CD ,DEAD_IND,
             RACE_DESC ,   GENOTYPE , CIRRHOSIS , TREATMENT , TREATMENT_CONDITION ,SUM(PAID) as PAID
             FROM  PATIENT_MEDICATIONS medication INNER JOIN IMS_HCV_PATIENTS patients
             on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH
             where MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
              ${whereClause}
              ${preactiveAntivalsQuery}
              GROUP BY medication.PATIENT_ID_SYNTH,medication.MEDICATION
               `;
            //// OLD query

            //// Modified:Arvind,14-FEB-2017 Group by 'MEDICATION' instead of 'NDC' column
            //// Commnetd group by for pattientcost for each retreatment
            // query = `SELECT LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine,medication.PATIENT_ID_SYNTH ,medication.IDW_PATIENT_ID_SYNTH , MEDICATION ,
            //  TREATMENT_PERIOD ,NDC , STRT_DATE ,END_DATE ,DAYS_MEDICATION ,patients.VIRAL_LOAD , SVR12 ,  Age ,GENDER_CD ,DEAD_IND,
            //  RACE_DESC ,   GENOTYPE , CIRRHOSIS , TREATMENT , TREATMENT_CONDITION ,PAID,IS_RETREATED
            //  FROM  PATIENT_MEDICATIONS medication INNER JOIN IMS_HCV_PATIENTS patients
            //  on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH
            //  where MEDICATION IS NOT NULL
            // -- and patients.IS_RETREATED='YES'
            //   ${whereClause}
            //   ${preactiveAntivalsQuery}
            //     GROUP BY medication.PATIENT_ID_SYNTH,medication.MEDICATION
            //    `;
            //console.log('********* getPatientsCost Query fetched *************');
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log('getPatientsCost');
                    console.log(error);
                    return;
                } else {
                    // console.log('********* Result fetched *************');
                    if (params['tabname'] == 'medicationcost') {
                        dataObj.MedicationCostData = pharmaUtils.prepareMedicationCostCalculatedChartsData(result);
                        dataObj.RetreatedDistribution = pharmaUtils.prepareRetreatmentDistributionWithMedication(result);
                        dataObj.CostPatientLength = result.length;


                        let stringyfyResult = JSON.stringify(dataObj);
                        //console.log("Before Compressed:" + stringyfyResult.length);
                        let compressedResult = LZString.compress(stringyfyResult);
                        //console.log("After Compressed:" + compressedResult.length);
                        callback(undefined, compressedResult);
                    } else {

                        callback(undefined, result);
                    }
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getICERData': function(params, callbackFn) {
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
            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';

            query = `SELECT
                    count(patients.PATIENT_ID_SYNTH) as pCount,
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
    // query for treament efficacy tab
    'getTreamentEfficacyDataPharma': function(params, callbackFn) {
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

            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';

            let dataParams = {};

            dataParams.params = params;
            dataParams.treamentEfficacyRecords = null;

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
                  join PATIENT_MEDICATIONS as medication
                  on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH WHERE
                  medication.MEDICATION IS NOT NULL
                  ${whereClause}
                  ${preactiveAntivalsQuery}
                  `;

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


    'getPatientsJourneyData': function(params, callbackFn) {
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
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            let PatientsJourney = [];

            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';

            // let limit  = '';
            // console.log(params);
            // if(params && params['topPatient']!= undefined){
            //   limit = 'LIMIT '+params['topPatient'];
            // }
            ////Added `PATIENT_ID_SYNTH` column in below query on 17-FEB-2017 by Arvind
            let query = `select
            medication.IDW_PATIENT_ID_SYNTH,medication.PATIENT_ID_SYNTH,PatientId ,ViralLoad,
            ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) as Weeks,
            Perfed_Dt,STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,
            MEDICATION,TREATMENT_PERIOD
            from PATIENT_MEDICATIONS medication join ALL_VIRAL_LOAD_RESULTS res
            on medication.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS as patients
            on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
            where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
            AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) > -8
            AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 70
            ${whereClause}
            ${preactiveAntivalsQuery}`;

            // console.log('*********** Patients Journey Query**************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    PatientsJourney = result;
                    PatientsJourney = JSON.stringify(PatientsJourney);
                    callbackFn(undefined, PatientsJourney);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    // Get Therapy Co Occurance Data
    'getTherapyCoOccuranceData': function(params, callbackFn) {
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
            var query = '',
                dataObj = {};

            dataObj['pharmaData'] = null;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            query = `SELECT LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine ,case when LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) > 0 then 'Combined' else 'Single' end as MedicineStatus,medication.PATIENT_ID_SYNTH , MEDICATION ,
            TREATMENT_PERIOD ,NDC , STRT_DATE ,END_DATE ,DAYS_MEDICATION ,patients.VIRAL_LOAD , SVR12 as isCured,  Age ,GENDER_CD ,DEAD_IND,
            RACE_DESC ,ETHNITY_1_DESC,   GENOTYPE , CIRRHOSIS , TREATMENT , TREATMENT_CONDITION  ,PAID,FibrosureStage, case when (TREATMENT_PERIOD>=0 && TREATMENT_PERIOD<=5) then '[0,5]'
            when (TREATMENT_PERIOD>5 && TREATMENT_PERIOD<=10) then '[5,10]'
            when (TREATMENT_PERIOD>10 && TREATMENT_PERIOD<=15) then '[10,15]'
            when (TREATMENT_PERIOD>15 && TREATMENT_PERIOD<=20) then '[15,20]'
            when (TREATMENT_PERIOD>20 && TREATMENT_PERIOD<=25) then '[20,25]'
            when (TREATMENT_PERIOD>25 && TREATMENT_PERIOD<=30) then '[25,30]'
            when (TREATMENT_PERIOD>30 && TREATMENT_PERIOD<=35) then '[30,35]'
            when (TREATMENT_PERIOD>35 && TREATMENT_PERIOD<=40) then '[35,40]'
            when (TREATMENT_PERIOD>40 && TREATMENT_PERIOD<=45) then '[40,45]'
            when (TREATMENT_PERIOD>45 && TREATMENT_PERIOD<=50) then '[45,50]'
            else '>50'
            end as TWEEK
            FROM  PATIENT_MEDICATIONS medication INNER JOIN IMS_HCV_PATIENTS patients
            on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
            WHERE  medication.MEDICATION IS NOT NULL
             ${whereClause}
             ${preactiveAntivalsQuery}
             ORDER BY TREATMENT_PERIOD
            `;


            //console.log('*********getTherapyCoOccuranceData *************');
            //  console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //  console.log('********* Result fetched *************');
                    console.log(result.length);

                    //   dataObj.pharmaData = result;
                    //  dataObj.pharmaData1= prepareTherapyCoOccuranceChartsData({data:result});

                    let stringyfyResult = JSON.stringify(pharmaUtils.prepareTherapyCoOccuranceChartsData({
                        data: result
                    }));
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
    //get the extrahepatic data
    'getExtraHepaticData': function(params, callbackFn) {
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

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            //Praveen 03/24/2017 added date condition by default;
            //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';

            query = `SELECT distinct patients.IDW_PATIENT_ID_SYNTH,patients.PATIENT_ID_SYNTH,patients.GENOTYPE,patients.CIRRHOSIS,patients.TREATMENT,patients.FibrosureValue as fibro_Value,
                symptoms.ARTHRALGIA,symptoms.ARTHRITIS,symptoms.CEREBRAL,symptoms.CRYOGLOBULINEMIA,symptoms.FATIGUE,symptoms.FIBROMYALGIA,symptoms.CARDIOMYOPATHY,
                symptoms.IDIOPATHIC_THROMBOCYTOPENIC_PURPURA,symptoms.INSULIN_RESISTANCE,symptoms.LICHEN_MYXOEDEMATOUS,symptoms.MULTIPLE_MYELOMA,symptoms.NEUTROPENIA,
                symptoms.PARESTHESIA,
                symptoms.ARTHRALGIA_COST,symptoms.ARTHRITIS_COST,symptoms.CEREBRAL_COST,symptoms.CRYOGLOBULINEMIA_COST,symptoms.FATIGUE_COST,symptoms.FIBROMYALGIA_COST,
                symptoms.CARDIOMYOPATHY_COST,symptoms.IDIOPATHIC_THROMBOCYTOPENIC_PURPURA_COST,symptoms.INSULIN_RESISTANCE_COST,symptoms.LICHEN_MYXOEDEMATOUS_COST,
                symptoms.MULTIPLE_MYELOMA_COST,symptoms.NEUTROPENIA_COST,symptoms.PARESTHESIA_COST
                FROM IMS_HCV_PATIENTS as patients JOIN IMS_PATIENT_SYMPTOMS as symptoms
                ON patients.PATIENT_ID_SYNTH = symptoms.PATIENT_ID_SYNTH
                join PATIENT_MEDICATIONS as medication on
                medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                WHERE 1=1
                ${whereClause}
                ${preactiveAntivalsQuery}
                `;

            // console.log('*****************Extra Hepatic Query ********************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    // Yuvraj 13th Feb 17 -  Moved this function in the common utilities file at it is being used at more than one tab not just pharma.
                    // let chartData = pharmaUtils.prepareDataForExtraHepaticChart(result);
                    let chartData = serverUtils.prepareDataForExtraHepaticChart(result);
                    //console.log("getExtraHepaticData");
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
    //Nisha 02/27/2017 get the Prescription Duration data
    'getPrescriptionDurationData': function(params, callback) {
        try {

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

            var query = '',
                dataObj = {};

            dataObj['pharmaData'] = null;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            let whereClausePrescriptionDuration = ``;

            if (params.PDGenoType != "")
                whereClausePrescriptionDuration += ` AND GENOTYPE = '${params.PDGenoType}'`;

            whereClausePrescriptionDuration += ` AND (TREATMENT_PERIOD >= '${params.PDTreatmentFrom}'`;
            whereClausePrescriptionDuration += ` AND TREATMENT_PERIOD <= '${params.PDTreatmentTo}')`;

            query = `SELECT LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine ,medication.PATIENT_ID_SYNTH , MEDICATION ,
            TREATMENT_PERIOD ,NDC , STRT_DATE ,END_DATE ,DAYS_MEDICATION ,patients.VIRAL_LOAD , SVR12 as isCured,  Age ,GENDER_CD ,DEAD_IND,
            RACE_DESC ,ETHNITY_1_DESC,   GENOTYPE , CIRRHOSIS , TREATMENT , TREATMENT_CONDITION  ,PAID,IS_RETREATED
            FROM  PATIENT_MEDICATIONS medication INNER JOIN IMS_HCV_PATIENTS patients
            on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH and MEDICATION IS NOT NULL
            ${whereClause}
            ${preactiveAntivalsQuery}
            ${whereClausePrescriptionDuration}
            `;

            // console.log('*********getPatientPharmaData *************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    // console.log('Summary error');
                    console.log(error);
                    return;
                } else {
                    let stringyfyResult = JSON.stringify(pharmaUtils.preparePrescriptionDurationData(result));
                    let compressedResult = LZString.compress(stringyfyResult);
                    callback(undefined, compressedResult);
                }

            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
});


let prepareUtilizaitonData = (patientsData) => {
    let totalPatients = 0,
        totalProviders = 0;
    totalPatients = patientsData.length;

    //get total unique provider ids for the patients data
    totalProviders = serverUtils.getUniqueArray(_.pluck(patientsData, 'providerId')).length;

    let medsGrpsData = _.groupBy(patientsData, (rec) => {
        return rec.Medication + '_' + rec.treatmentPeriod; //group by drug name & treatment period (Harvoni_12)
    });

    let drugsData = [],
        drugId = 1,
        finalObj = {};
    //console.log(totalProviders);

    //loop for all meds data
    for (let medGrp in medsGrpsData) {
        let currMedData = medsGrpsData[medGrp];
        let paramObj = {};
        paramObj.totalPatients = totalPatients;
        paramObj.totalProviders = totalProviders;
        //get distinct providers count who prescribed this medication
        paramObj.medsProvider = serverUtils.getUniqueArray(_.pluck(currMedData, 'providerId')).length;
        paramObj.categoryNetwork = 0;
        paramObj.drugId = drugId;

        drugsData.push(prepareDataForSingleMedUtilization(currMedData, paramObj));
        drugId++;
    }

    return drugsData;
}


let prepareDataForSingleMedUtilization = (dataArray, dataObj) => {
    let drugObj = {};

    let total_count = 0,
        efficacy_len = 0,
        med_count = 0,
        svr_patients = 0,
        providerLength = dataObj.medsProvider,
        networkLength = 0;

    let drugName = dataArray[0].Medication,
        treatmentPeriod = dataArray[0].treatmentPeriod;

    for (let j = 0; j < dataArray.length; j++) {

        med_count = parseInt(dataArray[j]['total']);
        total_count += med_count;

        //providerLength += med_count;

        //  Modified for IMS DB Intefration
        // Consider only those patients for SVR calculation who have SVR data.
        if (dataArray[j]['SVR12'] != null) {
            svr_patients += med_count;
            if (dataArray[j]['SVR12'] == 1) {
                efficacy_len += med_count;
            }
        }

    }

    drugObj['DrugName'] = drugName + ' (' + treatmentPeriod + "W)";
    drugObj['DrugPopulationSize'] = total_count;
    drugObj['DrugN'] = total_count;
    drugObj['TotalN'] = dataObj.totalPatients;
    drugObj['DrugId'] = dataObj.drugId;
    drugObj['DrugSequence'] = dataObj.drugId;
    drugObj['Treatment_Period'] = treatmentPeriod + " Weeks";
    // Nisha 02/15/2017 modifed to get the State codes
    drugObj['State_Code'] = prepareSTCDUtilization(dataArray);

    // var efficacy = ((efficacy_len/parseInt(total_count))*100);
    // Consider only patietnts with svr for efficacy calculations.
    drugObj['Utilization'] = {
        'Utilization': dataObj.totalPatients == 0 ? 0 : ((total_count / dataObj.totalPatients) * 100).toFixed(2),
        'Rx': '(N=' + total_count + ')',
        'NetworkLength': dataObj.categoryNetwork == 0 ? 0 : (networkLength / dataObj.categoryNetwork) * 100,
        'net': networkLength,
        'ProviderLength': dataObj.totalProviders == 0 ? 0 : ((providerLength / dataObj.totalProviders) * 100).toFixed(2)
    };

    return drugObj;
}

//funcation to get patient journery data
let getPatientsJourneyData = (dataParams, callbackFn) => {

    if (!isValidParams({
            params: dataParams,
            cb: callbackFn
        })) {
        console.log('Invalid Parameters');
        return undefined;
    }
    let query = ``,
        dataObj = {},
        params = dataParams.params;
    let whereClause = serverUtils.getQueryForAdvFilters(params),
        preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;

    // Dynamic condition for PREACTING_ANTIVIRAL
    if (params.showPreactingAntivirals) {
        preactiveAntivalsQuery = ``;
    }
    //Praveen 03/24/2017 added date condition by default;
    //let date_query_default = ' AND patients.FIRST_ENCOUNTER >="2013-01-01"';

    dataObj.PatientsJourney = null;
    query = `select
            medication.IDW_PATIENT_ID_SYNTH, medication.PATIENT_ID_SYNTH,PatientId ,ViralLoad,
            ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) as Weeks,
            Perfed_Dt,STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,
            MEDICATION,TREATMENT_PERIOD
            from PATIENT_MEDICATIONS medication join ALL_VIRAL_LOAD_RESULTS res
            on medication.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS as patients
            on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
            where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
            AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) > -8
            AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 70
            ${whereClause}
            ${preactiveAntivalsQuery}`;

    // console.log('*********** Patients Journey Query**************');
    // console.log(query);

    liveDb.db.query(query, function(error, result) {
        if (error) {
            console.log(error);
            return;
        } else {
            dataObj.PatientsJourney = result;
            // dataObj.Medication =  prepareSVRMedicationData(dataParams.treamentEfficacyRecords);
            // getDistinctMedications(dataObj, callbackFn);
            callbackFn(undefined, dataObj);
        }
    });
}

// Not in Use
//funcation to get patient journery data
let getDistinctMedications = (dataObj, callbackFn) => {
    // Early exit condition

    if (!isValidParams({
            params: dataObj,
            cb: callbackFn
        })) {
        console.log('Invalid Parameters');
        return undefined;
    }
    //Praveen 03/21/2017 query for preacting antiviral MEDICATION_MARKET_SHARE
    let preactiveAntivalsQuery = '';
    preactiveAntivalsQuery = ` AND MEDS_NM NOT IN ('RIBAVIRIN') AND MEDS_NM NOT LIKE 'PEGASYS'`;

    whereClause += preactiveAntivalsQuery;
    let query = `SELECT DISTINCT MEDICATION From PATIENT_MEDICATIONS where MEDICATION NOT IN ('RIBAVIRIN') and MEDICATION NOT LIKE 'PEGASYS' order by MEDICATION`;

    liveDb.db.query(query, function(error, result) {
        if (error) {
            console.log(error);
            return;
        } else {
            dataObj.Medication = result;
            callbackFn(undefined, dataObj);
        }
    });
}


//get summary data for pharma tab
let prepareChartsData = (data, allData, params, callback) => {
    let dataObj = {};
    dataObj['totalPatients'] = data.length;
    //// Commented below object as it fetches all patients and medication data just for count value
    //  dataObj['pharmaData'] = data;
    dataObj['chartData'] = serverUtils.PharmaSummaryChartsData(data);
    //// Referenced from Dashboard chart
    dataObj['RetreatedPatientChartData'] = pharmaUtils.prepareRetreatedPatientChartDataBasedOnFlag(_.filter(data, (item) => {
        if (item.IS_RETREATED == 'YES') {
            return item;
        }
    }));

    let stringyfyResult = JSON.stringify(dataObj);
    // console.log("Before Compressed:" + stringyfyResult.length);
    let compressedResult = LZString.compress(stringyfyResult);
    // console.log("After Compressed:" + compressedResult.length);

    // @Yuvraj 10 Feb 17 -  We will work on this thing after the demo.
    // let caching = new CachingObj({
    //     key : params['tabname'],
    //     data : compressedResult
    // });
    // caching.updateData();

    callback(undefined, compressedResult);
}


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
        // let filterMedsQuery = `AND companalytics.MEDICATION IN (${serverUtils.getStrFromArray(medsArray)})`;


        let filterMedsQuery = `AND medication.MEDICATION IN (${serverUtils.getStrFromArray(medsArray)})`;

        //// New query after merging competiter
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


        // console.log('*********Qaly Data Query**************');
        // console.log(query);

        liveDb.db.query(query, function(error, result) {
            if (error) {
                console.log(error);
                return;
            } else {
                dataObj.successData = result;
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

// Nisha 02/17/2017 modifed to get the State codes
let prepareSTCDUtilization = (dataArray) => {
    let getPatientLocations = _.countBy(dataArray, 'ST_CD');
    //    console.log(getPatientLocations);
    return getPatientLocations;
}


let getDrugByGenotypeData = (dataParams, callbackFn) => {

    if (!isValidParams({
            params: dataParams,
            cb: callbackFn
        })) {
        console.log('Invalid Parameters');
        return undefined;
    }
    // console.log('testing');
    let query = ``,
        dataObj = {},
        params = dataParams.params;

    let fdaCompliantQuery = getFdaCompliantQuery(params.fdaCompliant),
        preactiveAntivalsQuery = ` AND meds.IS_PREACTING_ANTIVIRAL = 'NO' `;

    // Dynamic condition for PREACTING_ANTIVIRAL
    if (params.showPreactingAntivirals) {
        preactiveAntivalsQuery = ``;
    }

    query = `select
                    patients.PATIENT_ID_SYNTH as patientId,
                    patients.GENOTYPE as genotype,
                    patients.PAT_ZIP as zipcode,
                    meds.MEDICATION,
                    TREATMENT_PERIOD as treatmentPeriod
                from
                    IMS_HCV_PATIENTS as patients
                JOIN
                    PATIENT_MEDICATIONS as meds
                ON patients.PATIENT_ID_SYNTH = meds.PATIENT_ID_SYNTH
                where
                    meds.MEDICATION !=""
                ${fdaCompliantQuery}
                ${preactiveAntivalsQuery}`;

    // console.log('**********get Drug By Genotype Query**************');
    // console.log(query);

    liveDb.db.query(query, function(error, result) {
        if (error) {
            console.log(error);
            return;
        } else {
            let drugsData = prepareUtilizaitonData(dataParams.utilizationRecords);
            dataObj['getDrugByGenotype'] = result;
            dataObj['patientDataUtilization'] = dataParams.utilizationRecords;
            dataObj['PhysicanPatientTargetTotal'] = dataParams.utilizationRecords.length;
            dataObj['totalPatients'] = drugsData[0]['TotalN'];
            dataObj['drugsData'] = drugsData;

            let stringyfyResult = JSON.stringify(dataObj);
            // console.log("Before Compressed:"+stringyfyResult.length);
            let compressedResult = LZString.compress(stringyfyResult);
            // console.log("After Compressed:"+compressedResult.length);

            callbackFn(undefined, compressedResult);
        }
    });

}


let getFdaCompliantQuery = (fdaCheck) => {
    if (fdaCheck.toLowerCase() === 'yes') {
        return `AND meds.TREATMENT_PERIOD IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else if (fdaCheck.toLowerCase() === 'no') {
        return `AND meds.TREATMENT_PERIOD NOT IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else {
        return ``;
    }
}


// Get Risk & Benefits Data
let getPrescriptionData = (data, params, callback) => {
    let dataObj = data;
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

        let whereClause = serverUtils.getQueryForAdvFilters(params),
            preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

        if (params.showPreactingAntivirals) {
            preactiveAntivalsQuery = ``;
        }

        let query = `select count(PATIENT_ID_SYNTH) as PrescriptionCount ,pat_meds.MEDICATION,avg(CHARGE) as CHARGE  
				from ((select medication.PATIENT_ID_SYNTH,MEDICATION,TREATMENT_PERIOD from PATIENT_MEDICATIONS medication join IMS_HCV_PATIENTS as patients
				on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
				 where medication.MEDICATION is not NULL ${whereClause} ${preactiveAntivalsQuery} ) as pat_meds inner join 
				(select  MEDICATION,TREATMENT_PERIOD,avg(CHARGE) as CHARGE from MEDS_CLAIMS_ALL group by MEDICATION,TREATMENT_PERIOD) as claims on 
				claims.MEDICATION = pat_meds.MEDICATION and pat_meds.TREATMENT_PERIOD = claims.TREATMENT_PERIOD) 
				group by MEDICATION;`;

        // console.log('************Prescription Data Distribution query*************');
        // console.log(query);


        liveDb.db.query(query, function(error, result) {
            if (error) {
                console.log(error);
                return;
            } else {

                dataObj['prescriptionCount'] = pharmaUtils.prepareDataForPrescriptionChart(result);
                dataObj['costPrescription'] = pharmaUtils.prepareDataforRxCostPrescription(result);
                let stringyfyResult = JSON.stringify(dataObj);
                let compressed_object = LZString.compress(stringyfyResult);
                callback(undefined, compressed_object);
            }
        });
    } catch (ex) {
        console.log(JSON.stringify(ex));
    }
}


let prepareDataPositiveViralLoad = (baseData) => {
    let grpRace = _.groupBy(baseData, 'race');
    let total = baseData.length;
    let chartdata = [];
    for (let key in grpRace) {
        let json = {};
        json['name'] = key;
        let len = grpRace[key].length;
        json['y'] = (len / total) * 100;
        json['total'] = len;
        chartdata.push(json);
    }
    return { data: chartdata, total: total };
}