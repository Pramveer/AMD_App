import * as serverUtils from '../../common/serverUtils.js';
import * as chartsLib from './analyticsChartsData.js';

let analyticsPatientsData = [];

Meteor.methods({
    'getAnalyticsTabData': (data) => {
        return JSON.stringify(analyticsPatientsData);
    }
});

Meteor.syncMethods({
    'getEfficacyTabData': function(params, callbackFn) {
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

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "analytics_efficacy_" + params.fdaCompliant
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callbackFn(undefined, data);
                }, 50);

                return false;
            }

            let whereClause = serverUtils.getQueryForAdvFilters(params),
                fdaCompliantQuery = getFdaCompliantQuery(params.fdaCompliant),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            let dataParams = {};
            dataParams['params'] = params;
            dataParams['efficacyRecords'] = null;

            /**
             * @author: Yuvraj Pal (17th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // let query = `select
            // 		patients.GENOTYPE as genotype,
            // 		patients.CIRRHOSIS as cirrhosis,
            // 		patients.TREATMENT as treatment,
            // 		patients.RACE_DESC as race,
            // 		patients.ETHNITY_1_DESC as ethnicity,
            // 		1 as total,
            // 		medication.SVR12,
            // 		YEAR(patients.FIRST_ENCOUNTER) as Year,
            // 		patients.PAT_ZIP as zipcode,
            // 		medication.VIRAL_LOAD as viralLoad,
            // 		medication.TREATMENT_PERIOD as treatmentPeriod,
            // 		medication.MEDICATION as Medication,
            // 		patients.IDW_PATIENT_ID_SYNTH as patientId,
            // 		patients.AGE as age,
            // 		patients.GENDER_CD as gender,
            // 		patients.FIRST_ENCOUNTER as admissionDate

            // 		from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
            // 		JOIN PATIENT_MEDICATIONS as medication
            // 		on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH WHERE
            // 		medication.MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            // 		${whereClause}
            // 		${fdaCompliantQuery}
            // 		${preactiveAntivalsQuery}`;
            /**
             * @author: Nisha
             * @date: 16th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

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

            let query = `select
                            patients.GENOTYPE as genotype,
                            patients.CIRRHOSIS as cirrhosis,
                            patients.TREATMENT as treatment,
                            patients.RACE_DESC as race,
                            patients.${dbConfig.ethnicity} as ethnicity,
                            1 as total,
                            medication.SVR12,
                            YEAR(patients.FIRST_ENCOUNTER) as Year,
                            patients.PAT_ZIP as zipcode,
                            medication.VIRAL_LOAD as viralLoad,
                            medication.TREATMENT_PERIOD as treatmentPeriod,
                            medication.MEDICATION as Medication,
                            patients.PATIENT_ID_SYNTH as patientId,
                            patients.${dbConfig.age} as age,
                            patients.IS_LIVER_FAILURE as AssessmentLiverDisease,
                            patients.GENDER_CD as gender,
                            patients.FIRST_ENCOUNTER as admissionDate

                        from ${dbConfig.tblHcvPatient}  as patients
                        JOIN ${dbConfig.tblPatientMedication} as medication
                        on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH WHERE
                        medication.MEDICATION IS NOT NULL
                        ${whereClause}
                        ${fdaCompliantQuery}
                        ${preactiveAntivalsQuery}`;

            // console.log('**********Efficacy Tab Query***********');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //set the data rows in the variable
                    analyticsPatientsData = result;
                    dataParams['efficacyRecords'] = result;
                    getSVRTrendsData(dataParams, callbackFn);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }

    },


    'getAdherenceTabData': function(params, callbackFn) {
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

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "analytics_adherence_" + params.fdaCompliant
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callbackFn(undefined, data);
                }, 50);

                return false;
            }

            let whereClause = serverUtils.getQueryForAdvFilters(params),
                fdaCompliantQuery = getFdaCompliantQuery(params.fdaCompliant),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            let dataParams = {};
            dataParams['params'] = params;

            /**
             * @author: Yuvraj Pal (17th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // let query = `select
            // 		patients.GENOTYPE as genotype,
            // 		patients.CIRRHOSIS as cirrhosis,
            // 		patients.TREATMENT as treatment,
            // 		patients.RACE_DESC as race,
            // 		patients.ETHNITY_1_DESC as ethnicity,
            // 		1 as total,
            // 		medication.SVR12,
            // 		YEAR(patients.FIRST_ENCOUNTER) as Year,
            // 		patients.PAT_ZIP as zipcode,
            // 		medication.VIRAL_LOAD as viralLoad,
            // 		medication.TREATMENT_PERIOD as treatmentPeriod,
            // 		medication.MEDICATION as Medication,
            // 		medication.DAYS_MEDICATION as days_med,
            // 		patients.IDW_PATIENT_ID_SYNTH as patientId,
            // 		patients.AGE as age,
            // 		patients.GENDER_CD as gender,
            // 		patients.FIRST_ENCOUNTER as admissionDate

            // 		from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
            // 		JOIN PATIENT_MEDICATIONS as medication
            // 		on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH WHERE
            // 		medication.MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            // 		${whereClause}
            // 		${fdaCompliantQuery}
            // 		${preactiveAntivalsQuery}`;

            /* @author: Nisha
             * @date: 16th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

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

            let query = `select
					patients.GENOTYPE as genotype,
					patients.CIRRHOSIS as cirrhosis,
					patients.TREATMENT as treatment,
					patients.RACE_DESC as race,
					patients.${dbConfig.ethnicity} as ethnicity,
					1 as total,
					medication.SVR12,
					YEAR(patients.FIRST_ENCOUNTER) as Year,
					patients.PAT_ZIP as zipcode,
					medication.VIRAL_LOAD as viralLoad,
					medication.TREATMENT_PERIOD as treatmentPeriod,
					medication.MEDICATION as Medication,
					ifnull(medication.DAYS_MEDICATION,0) as days_med,
					patients.PATIENT_ID_SYNTH as patientId,
                    patients.IS_LIVER_FAILURE as AssessmentLiverDisease,
					patients.${dbConfig.age} as age,
					patients.GENDER_CD as gender,
					patients.FIRST_ENCOUNTER as admissionDate

					from ${dbConfig.tblHcvPatient}  as patients
                    JOIN ${dbConfig.tblPatientMedication} as medication
					on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH WHERE
					medication.MEDICATION IS NOT NULL
					${whereClause}
					${fdaCompliantQuery}
					${preactiveAntivalsQuery}`;

            // console.log('**********Adherence Tab Query***********');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //set the data rows in the variable
                    analyticsPatientsData = result;
                    let dataObj = {};
                    let drugsData = prepareGroupedMedsData(result, 'adherence');
                    let uniquePatients = serverUtils.getUniqueArray(_.pluck(result, 'patientId')).length;
                    dataObj['chartsData'] = JSON.stringify(chartsLib.getAnalyticsAdherenceData(drugsData));
                    dataObj['totalPatients'] = uniquePatients;
                    dataObj['OldtotalPatients'] = drugsData[0]['TotalN'];
                    dataObj['patientData'] = result;

                    let compressed_object = LZString.compress(JSON.stringify(dataObj));

                    // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "analytics_adherence_" + params.fdaCompliant,
                        data: compressed_object
                    });
                    caching.updateData();

                    callbackFn(undefined, compressed_object);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }

    },


    'getUtilizationTabData': function(params, callbackFn) {
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

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            // let caching = new CachingObj({
            //     key: "analytics_utilization_" + params.fdaCompliant
            // });

            // if (caching.isDataAvailable()) {
            //     let data = caching.getAvailableData();
            //     setTimeout(function() {
            //         callbackFn(undefined, data);
            //     }, 50);

            //     return false;
            // }

            //console.log('calling server');
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                fdaCompliantQuery = getFdaCompliantQuery(params.fdaCompliant),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            let dataParams = {};
            dataParams['params'] = params;
            dataParams['utilizationRecords'] = null;

            /**
             * @author: Yuvraj Pal (17th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // let query = `select
            // 		patients.GENOTYPE as genotype,
            // 		patients.CIRRHOSIS as cirrhosis,
            // 		patients.TREATMENT as treatment,
            // 		patients.RACE_DESC as race,
            // 		patients.ETHNITY_1_DESC as ethnicity,
            // 		1 as total,
            // 		medication.SVR12,
            // 		YEAR(medication.STRT_DATE) as Year,
            // 		patients.PAT_ZIP as zipcode,
            // 		medication.VIRAL_LOAD as viralLoad,
            // 		medication.TREATMENT_PERIOD as treatmentPeriod,
            // 		medication.MEDICATION as Medication,
            // 		patients.IDW_PATIENT_ID_SYNTH as patientId,
            // 		patients.AGE as age,
            // 		patients.GENDER_CD as gender,
            // 		patients.FIRST_ENCOUNTER as admissionDate,
            //         medication.PROVIDER_ST_CD,
            //         patients.ST_CD,
            // 		(case WHEN medication.PROVIDER_ID_SYNTH IS NULL THEN 0
            // 			ELSE medication.PROVIDER_ID_SYNTH END ) as providerId
            // 		from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
            // 		JOIN PATIENT_MEDICATIONS as medication
            // 		on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH WHERE
            // 		medication.MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            // 		${whereClause}
            // 		${fdaCompliantQuery}
            // 		${preactiveAntivalsQuery}`;
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
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            /**
             * @author: Jayesh
             * @date: 31th May 2017 
             * @desc: commented below condition as IMS platform we are using preactive antivals condition.
            */
            // if (dbConfig.showPreactingAntivirals) {
            //     preactiveAntivalsQuery = ``;
            // }
            let query = `select
					patients.GENOTYPE as genotype,
					patients.CIRRHOSIS as cirrhosis,
					patients.TREATMENT as treatment,
					patients.RACE_DESC as race,
					patients.${dbConfig.ethnicity} as ethnicity,
					1 as total,
					medication.SVR12,
					YEAR(medication.STRT_DATE) as Year,
					patients.PAT_ZIP as zipcode,
					medication.VIRAL_LOAD as viralLoad,
					medication.TREATMENT_PERIOD as treatmentPeriod,
					medication.MEDICATION as Medication,
					patients.PATIENT_ID_SYNTH as patientId,
					patients.${dbConfig.age} as age,
                    patients.IS_LIVER_FAILURE as AssessmentLiverDisease,
					patients.GENDER_CD as gender,
					patients.FIRST_ENCOUNTER as admissionDate,
                    medication.PROVIDER_ST_CD,
                    patients.ST_CD,
					(case WHEN medication.PROVIDER_ID_SYNTH IS NULL THEN 0
						ELSE medication.PROVIDER_ID_SYNTH END ) as providerId					
					from ${dbConfig.tblHcvPatient}  as patients
                    JOIN ${dbConfig.tblPatientMedication} as medication
					on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH WHERE
					medication.MEDICATION IS NOT NULL
					${whereClause}
					${fdaCompliantQuery}
					${preactiveAntivalsQuery}`;

              //console.log('**********Utilization Tab Query***********');
              //console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //set the data rows in the variable
                    analyticsPatientsData = result;
                    dataParams['utilizationRecords'] = result;
                    getDrugByGenotypeData(dataParams, callbackFn);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },


    'getQualityViralScoreAnalysisData': function(params, callback) {
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

            // @Yuvraj 13th Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: "analytics_quality_viral_score_data"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callback(undefined, data);
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
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

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
             * @author: Yuvraj Pal (17th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            /**
             * @author: Jayesh Agraval (22th March 2017)
             * @desc: Modified query for ViralLoad Not Detected condition
             */
            // query = `select medication.PATIENT_ID_SYNTH,PatientId ,PAID as cost,medication.IDW_PATIENT_ID_SYNTH,ViralLoad,Perfed_Dt, STRT_DATE,END_DATE,ROUND(DATEDIFF(END_DATE, STRT_DATE)/7, 0) as weeks,GENOTYPE,
            // 				FibrosureValue as fibro_Value,CIRRHOSIS,RACE_DESC,GENDER_CD,Age,TREATMENT,MEDICATION,TREATMENT_PERIOD,medication.SVR12 from
            // 				PATIENT_MEDICATIONS medication join ALL_VIRAL_LOAD_RESULTS res
            // on medication.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS patients on
            // 			patients.IDW_PATIENT_ID_SYNTH = medication.IDW_PATIENT_ID_SYNTH
            // where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
            // AND MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            // ${whereClause} ${preactiveAntivalsQuery} ORDER BY STRT_DATE ASC
            // `;


            query = `SELECT medication.PATIENT_ID_SYNTH,
                        PatientId ,PAID as cost,
                        medication.IDW_PATIENT_ID_SYNTH,
                         (CASE 
                            WHEN ViralLoad = 'NOT DETECTED' THEN 0
                            ELSE ViralLoad
                        END ) as ViralLoad,
                        Perfed_Dt,
                        STRT_DATE,
                        END_DATE,
                        ROUND(DATEDIFF(END_DATE, STRT_DATE)/7, 0) as weeks,
                        GENOTYPE,
                        FibrosureValue as fibro_Value,
                        CIRRHOSIS,
                        RACE_DESC,
                        GENDER_CD,
                        Age,
                        TREATMENT,
                        MEDICATION,
                        TREATMENT_PERIOD,
                        medication.SVR12,
                        medication.IS_RELAPSED as relapsed,
                        medication.IS_REMITTED as remmitted
                    FROM
                        PATIENT_MEDICATIONS medication join ALL_VIRAL_LOAD_RESULTS res
                            on medication.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS patients
                            on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                        --  where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
                        where (ViralLoad <> 'DETECTED')
                        AND MEDICATION IS NOT NULL
                        ${whereClause} ${preactiveAntivalsQuery} ORDER BY STRT_DATE ASC`;


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
                    let preparedData = JSON.stringify(prepareComparisonChartData(result));
                    dataObj['comparisonChart'] = prepareComparisonChartData(result); //LZString.compress(preparedData);
                    let compressed_object = LZString.compress(JSON.stringify(dataObj));

                    // @author: Yuvraj 13th Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: "analytics_quality_viral_score_data",
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
    'getQualityIndicatorTabData': function(params, callbackFn) {

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

            // @Yuvraj 13th Feb 17 -  caching Implementation.
            // let caching = new CachingObj({
            //     key: params.database + "analytics_quality_indicator_data"
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


            let dataParams = {};
            dataParams['params'] = params;
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            //     let query = `select
            // 			patients.GENOTYPE as genotype,
            // 			patients.CIRRHOSIS as cirrhosis,
            // 			patients.TREATMENT as treatment,
            // 			patients.RACE_DESC as race,
            //          patients.IS_HEP_A,
            //          patients.IS_HEP_B,
            // 			patients.ETHNITY_1_DESC as ethnicity,
            // 			Year(STRT_DATE) as SYear,
            // 			STRT_DATE,
            // 			END_DATE,
            // 			patients.FIRST_ENCOUNTER as Perfed_Dt,
            // 			1 as total,
            // 			medication.SVR12,
            // 			YEAR(patients.FIRST_ENCOUNTER) as Year,
            // 			patients.PAT_ZIP as zipcode,
            // 			medication.VIRAL_LOAD as viralLoad,
            // 			medication.TREATMENT_PERIOD as treatmentPeriod,
            // 			medication.MEDICATION as Medication,
            // 			medication.DAYS_MEDICATION as days_med,
            // 			patients.IDW_PATIENT_ID_SYNTH as patientId,
            // 			patients.AGE as age,
            // 			patients.GENDER_CD as gender,
            // 			patients.FIRST_ENCOUNTER as admissionDate
            // 			from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
            // 			JOIN PATIENT_MEDICATIONS as medication
            // 			on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH
            // 			WHERE
            // 			medication.MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            // 			${whereClause} ${preactiveAntivalsQuery} ORDER BY STRT_DATE ASC`;

            let query = `select
                            patients.GENOTYPE as genotype,
                            patients.CIRRHOSIS as cirrhosis,
                            patients.TREATMENT as treatment,
                            patients.RACE_DESC as race,
                            patients.IS_HEP_A,
                            patients.IS_HEP_B,
                            patients.IS_RETREATED as retreated,
                            patients.${dbConfig.ethnicity} as ethnicity,
                            ROUND(DATEDIFF(END_DATE, STRT_DATE)/7, 0) as weeks,
                            Year(medication.STRT_DATE) as SYear,
                            medication.STRT_DATE,
                            medication.END_DATE,
                            patients.FIRST_ENCOUNTER as Perfed_Dt,
                            1 as total,
                            medication.SVR12,
                            YEAR(patients.FIRST_ENCOUNTER) as Year,
                            patients.PAT_ZIP as zipcode,
                            case medication.VIRAL_LOAD when 'NOT DETECTED' then 0 else medication.VIRAL_LOAD end as viralLoad,
                            medication.TREATMENT_PERIOD as treatmentPeriod,
                            medication.MEDICATION as Medication,
                            medication.DAYS_MEDICATION as days_med,
                            patients.PATIENT_ID_SYNTH as patientId,
                            patients.${dbConfig.age} as age,
                            patients.GENDER_CD as gender,
                            patients.FIRST_ENCOUNTER as admissionDate,
                            medication.IS_RELAPSED as relapsed,
                            medication.IS_REMITTED as remmitted,
                            medication.IS_PREACTING_ANTIVIRAL
                           
                        from ${dbConfig.pdatabase}  as patients
                        LEFT JOIN  ${dbConfig.mdatabase} as medication 
                            on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                       WHERE 
                       patients.PATIENT_ID_SYNTH <> 0 
                        ${whereClause} ${preactiveAntivalsQuery} ORDER BY STRT_DATE ASC`;

            // console.log('**********Quality indicator Tab Query***********');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    let filterDataMedication = serverUtils.filterPreactingAntivirals(result);
                    filterDataMedication = serverUtils.getFilteredData(filterDataMedication,'Medication');
                    dataParams['chartsData'] = prepareYearlySuccessRateData(filterDataMedication); //LZString.compress(JSON.stringify(prepareYearlySuccessRateData(result)));
                    dataParams['data'] = prepareQualityIndicatorsdata(filterDataMedication); //LZString.compress(JSON.stringify(prepareQualityIndicatorsdata(result)));
                    dataParams['hep'] = prepareQualityIndicatorsHCVData(result);
                    dataParams['comparisonChart'] = prepareComparisonChartData(filterDataMedication);
                    dataParams['totalPatients'] = result.length; //prepareQualityIndicatorsHCVData(result);
                    dataParams['totalUniquePatients'] = serverUtils.getUniqueCount(result,'patientId');
                    dataParams['totalUniquePatientsMedications'] = serverUtils.getUniqueCount(filterDataMedication,'patientId')//serverUtils.getUniqueCountMedication(filterDataMedication,'patientId','Medication',params.showPreactingAntivirals);
                    let compressed_object = LZString.compress(JSON.stringify(dataParams));

                    // @author: Yuvraj 13th Feb 17 - Saving data into caching object.
                    // let caching = new CachingObj({
                    //     key: params.database+"analytics_quality_indicator_data",
                    //     data: compressed_object
                    // });
                    // caching.updateData();

                    callbackFn(undefined, compressed_object);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getCareFailureChartData': function(params, callbackFn) {
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

            // @Yuvraj 13th Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: "care_failure_chart_data"
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

            let dataParams = {};
            dataParams['params'] = params;

            let query = `select
                            patients.GENOTYPE as genotype,
                            patients.CIRRHOSIS as cirrhosis,
                            patients.TREATMENT as treatment,
                            patients.RACE_DESC as race,                            
                            medication.SVR12,                           
                            medication.IS_COMPLETED,
                            medication.PATIENT_ID_SYNTH
                        from IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS  as patients
                            JOIN PATIENT_MEDICATIONS as medication
                            on medication.PATIENT_ID_SYNTH  = patients.PATIENT_ID_SYNTH
                        WHERE
                        medication.MEDICATION IS NOT NULL
                        ${whereClause} ${preactiveAntivalsQuery} ORDER BY STRT_DATE ASC`;

            // console.log('*********New chart Query***********');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    dataParams['chartsData'] = prepareCareFailureChartData(result);
                    let compressed_object = LZString.compress(JSON.stringify(dataParams));

                    // @author: Yuvraj 13th Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: "care_failure_chart_data",
                        data: compressed_object
                    });
                    caching.updateData();

                    callbackFn(undefined, compressed_object);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    // 'getQualityIndicatorsHepatitsData':function(params,callback){
    //   try {
    //       // Early exit condition
    //       //console.log(this.userId);
    //       if (!isValidUser({
    //               userId: this.userId
    //           })) {
    //           console.log('User not logged in');
    //           return undefined;
    //       }
    //       if (!isValidParams({
    //               params: params,
    //               cb: callback
    //           })) {
    //           console.log('Invalid Parameters');
    //           return undefined;
    //       }
    //
    //       let whereClause = serverUtils.getQueryForAdvFilters(params),
    //           preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;
    //
    //       if (params.showPreactingAntivirals) {
    //           preactiveAntivalsQuery = ``;
    //       }
    //
    //       let dataParams = {};
    //       dataParams['params'] = params;
    //
    //       let query = `select
    //         					patients.GENOTYPE as genotype,patients.IDW_PATIENT_ID_SYNTH,patients.PATIENT_ID_SYNTH,
    //                             TEST_NM,medication.MEDICATION,patients.GENDER_CD as gender,patients.GENOTYPE as genotype,
    //                   					patients.CIRRHOSIS as cirrhosis,
    //                   					patients.TREATMENT as treatment,
    //                   					patients.RACE_DESC as race
    //                             from IMS_LRX_AmbEMR_Dataset.RESULTS results
    //                             INNER JOIN IMS_HCV_PATIENTS as patients
    //         					on results.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
    //         					INNER JOIN PATIENT_MEDICATIONS as medication
    //         					on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH
    //         					WHERE
    //         					medication.MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
    //                   ${whereClause} ${preactiveAntivalsQuery}`;
    //
    //       // console.log('**********Quality indicator Tab Query***********');
    //       // console.log(query);
    //
    //       liveDb.db.query(query, function(error, result) {
    //           if (error) {
    //               console.log(error);
    //               return;
    //           } else {
    //               let data = JSON.stringify(prepareQualityIndicatorsHCVData(result));
    //               let compressed_object = LZString.compress(JSON.stringify(data));
    //               callback(undefined, compressed_object);
    //           }
    //       });
    //   } catch (ex) {
    //       console.log(JSON.stringify(ex));
    //   }
    // }
});

//Praveen 02/15/2017 2:10PM Prepare data for quality indicators chart hep a and hep b
let prepareQualityIndicatorsHCVData = (baseData) => {

    let chartDatajson = {};
    let chartData = [];
    //get the patient count for totla patients
    let totalPatients = serverUtils.getUniqueCount(baseData,'patientId');//baseData.length; //Object.keys(_.countBy(baseData, 'IDW_PATIENT_ID_SYNTH')).length;

    //data for hepB patients
    chartDatajson['hepB'] = preparedHepBPatientData(baseData, totalPatients);
    //console.log(chartDatajson);
    //data for hep c patients
    chartDatajson['hepac'] = prepareDataForHepACPatients(baseData, totalPatients);
    //console.log(chartDatajson);
    return chartDatajson;
}

//Praveen 02/15/2017 2:57PM Prepare data for quality indicators chart hep b
let preparedHepBPatientData = (baseData, totalPatients) => {
    let chartData = [];
    //filter data for hep b patient
    let filteredData = baseData.filter((rec) => rec.IS_HEP_B == 'Yes');

    //get the patient count for hep patient.
    let hepbPatient = serverUtils.getUniqueCount(filteredData,'patientId');//filteredData.length; //Object.keys(_.countBy(filteredData, 'IDW_PATIENT_ID_SYNTH')).length;

    let baseDataFilter = baseData.filter((rec) => rec.IS_HEP_B == 'No');

    //check for null data foraptient
    if (filteredData.length != 0) {
        let json = {};
        json['name'] = 'HEPATITS B';
        json['y'] = hepbPatient;
        json['total'] = totalPatients;
        json['dataPlot'] = prepareDataBasedOnCategory(filteredData, hepbPatient);
        chartData.push(json);
    }
    //check for null data
    if (baseData.length != 0) {
        let json = {};
        json['name'] = 'HEPATITS C';
        json['y'] = serverUtils.getUniqueCount(baseDataFilter,'patientId');//baseDataFilter.length;
        json['total'] = totalPatients;
        json['dataPlot'] = prepareDataBasedOnCategory(baseDataFilter, json['y']);
        chartData.push(json);
    }
    // console.log('inside hep b');
    // console.log(chartData);
    return {data:chartData,total:totalPatients,actual:hepbPatient};
}

//Praveen 02/15/2017 2:57PM Prepare data for quality indicators chart hep a and c
let prepareDataForHepACPatients = (baseData, totalPatients) => {
    let chartData = [];
    //filter data for hep A patient
    let filteredDataA = baseData.filter((rec) => rec.IS_HEP_A == 'Yes');

    //get the patient count for hep patient.
    let hepbPatient = serverUtils.getUniqueCount(filteredDataA,'patientId');//filteredDataA.length; //Object.keys(_.countBy(filteredDataA, 'IDW_PATIENT_ID_SYNTH')).length;

    let baseDataFilter = baseData.filter((rec) => rec.IS_HEP_A == 'No');

    //check for null data foraptient
    if (filteredDataA.length != 0) {
        let json = {};
        json['name'] = 'HEPATITS C';
        json['y'] = serverUtils.getUniqueCount(baseDataFilter,'patientId');
        json['total'] = totalPatients;
        json['dataPlot'] = prepareDataBasedOnCategory(baseDataFilter, json['y']);
        chartData.push(json);
    }

    //check for null data and push json into data prepared
    if (totalPatients != 0) {
        let json = {};
        json['name'] = 'HEPATITS A & C';
        json['y'] = hepbPatient;
        json['total'] = totalPatients;
        json['dataPlot'] = prepareDataBasedOnCategory(filteredDataA, hepbPatient);
        chartData.push(json);
    }

    // console.log('inside hep c');
    // console.log(chartData);
    //return hep a and c patients data
   return {data:chartData,total:totalPatients,actual:hepbPatient};
}

//Praveen 02/15/2017 common function to prepare data based on category like genotype,race
let prepareDataBasedOnCategory = (baseData, totalPatients) => {
    let chartData = {};
    chartData['genotype'] = null;
    chartData['race'] = null;
    chartData['gender'] = null;
    chartData['medication'] = null;
    chartData['cirrhosis'] = null;

    //based on genotype
    chartData['genotype'] = prepareByCategoryData(_.groupBy(baseData, 'genotype'), totalPatients);
    chartData['race'] = prepareByCategoryData(_.groupBy(baseData, 'race'), totalPatients);
    chartData['gender'] = prepareByCategoryData(_.groupBy(baseData, 'gender'), totalPatients);
    chartData['medication'] = prepareByCategoryData(_.groupBy(baseData, 'Medication'), totalPatients);
    chartData['cirrhosis'] = prepareByCategoryData(_.groupBy(baseData, 'cirrhosis'), totalPatients);

    return chartData;
}

let prepareByCategoryData = (baseData, totalPatients) => {
    let chartData = [];

    for (let key in baseData) {
        let json = {};
        let label = key == 'M' ? 'Male' : (key == 'F' ? 'Female' : (key == 'U' ? 'Unknown' : key));
        json['name'] = label;
        json['y'] =  serverUtils.getUniqueCount(baseData[key],'patientId');//baseData[key].length; //Object.keys(_.countBy(baseData[key], 'IDW_PATIENT_ID_SYNTH')).length;
        json['total'] = totalPatients;
        chartData.push(json);
    }

    return chartData;
}

let prepareQualityIndicatorsdata = (baseData) => {
    //filter data for patients having not null values
    //baseData = baseData.filter((rec)=>rec.SVR12 != null);
    let chartData = {};
    chartData['comparisonChart'] = null;
    //group patients based idw paltient id synth
    let grpPatientData = _.groupBy(baseData, 'patientId');
    let patientConsideredData = [];
    //filter data based on start date patients having 0 hcvr12 initially
    for (let key in grpPatientData) {
        let keyData = grpPatientData[key];
        //check for if it has more than one patients
        if (keyData.length) {
            if (keyData[0].SVR12 == 0) {
                for (let i = 0; i < keyData.length; i++) {
                    patientConsideredData.push(keyData[i]);
                }
            }
        }
    }
    chartData['genotype'] = prepareDataByGenotype(patientConsideredData, 'genotype');
    chartData['viralLoadBeforeTreatmentGenotype'] = prepareDataByGenotypeViralLoadBeforeTreatment(baseData, 'genotype');
    chartData['race'] = prepareDataByGenotype(patientConsideredData, 'race');
    chartData['gender'] = prepareDataByGenotype(patientConsideredData, 'gender');
    chartData['cirrhosis'] = prepareDataByGenotype(patientConsideredData, 'cirrhosis');
    chartData['medication'] = prepareDataByGenotype(patientConsideredData, 'Medication');
    chartData['dataSVR12'] = prepareQualityIndicatorsSVR12(baseData);
    return chartData;

}

let prepareDataByGenotype = (baseData, key) => {
    let grpGenodata = _.groupBy(baseData, key);
    let categories = [];
    let chartData = [];
    let arrayData = [];
    let arrayDataTotal = [];
    let jsontotal = {};
    let json = {};
    let total = 0;
    let actualTotal = 0;
    json['name'] = 'ReTreated';
    jsontotal['name'] = 'Total Uncured';

    for (let key in grpGenodata) {
        let keyData = grpGenodata[key];
        let len = serverUtils.getUniqueCount(keyData,'patientId');
        let retreatedPatient = getRetreatedPatientData(keyData);
        let label = key == 'M' ? 'Male' : (key == 'F' ? 'Female' : (key == 'U' ? 'Unknown' : key));
        total += len;
        actualTotal += retreatedPatient;
        categories.push(label);
        arrayData.push(len);
        arrayDataTotal.push(retreatedPatient);
    }
    json['data'] = arrayDataTotal;
    jsontotal['data'] = arrayData;
    chartData.push(jsontotal);
    chartData.push(json);
    return {
        keys: categories,
        data: chartData,
        total:total,
        actual:actualTotal
    };
}

let getRetreatedPatientData = (baseData) => {

    let grpPatientData = _.groupBy(baseData, 'patientId');
    let patientConsideredData = [];
    for (let key in grpPatientData) {
        let keyData = grpPatientData[key];
        if (keyData.length > 1) {
            for (let i = 0; i < keyData.length; i++) {
                patientConsideredData.push(keyData[i]);
            }
        }
    }
    let count = serverUtils.getUniqueCount(patientConsideredData,'patientId');
    return count;
}

let prepareDataByGenotypeViralLoadBeforeTreatment = (baseData, key) => {

    let grpGenodata = _.groupBy(baseData, key);
    let categories = [];
    let chartData = [];
    let arrayData = [];
    let arrayDataTotal = [];
    let jsontotal = {};
    let json = {};
    json['name'] = 'Tested Before';
    jsontotal['name'] = 'Total';

    let total = 0;
    let actualTotal = 0;
    for (let key in grpGenodata) {
        let keyData = grpGenodata[key];
        let len = serverUtils.getUniqueCount(keyData,'patientId');
        let retreatedPatient = getViralLoadBeforePatientData(keyData);
        categories.push(key);
        arrayData.push(len);
        total += len;
        actualTotal += retreatedPatient;
        arrayDataTotal.push(retreatedPatient);
    }
    json['data'] = arrayDataTotal;
    jsontotal['data'] = arrayData;
    chartData.push(jsontotal);
    chartData.push(json);
    return {
        keys: categories,
        data: chartData,
        total:total,
        actual:actualTotal
    };
}

let getViralLoadBeforePatientData = (baseData) => {
    let grpPatientData = _.groupBy(baseData, 'patientId');
    let patientConsideredData = [];
    //filter data based on start date patients having 0 hcvr12 initially
    for (let key in grpPatientData) {
        let keyData = grpPatientData[key];
        //check for if it has more than one patients
        if (keyData.length) {
            if (~~keyData[0].viralLoad != 0) {
                for (let i = 0; i < keyData.length; i++) {
                    patientConsideredData.push(keyData[i]);
                }
            }
        }
    }
    let count = serverUtils.getUniqueCount(patientConsideredData,'patientId');
    return count;
}

let prepareQualityIndicatorsSVR12 = (baseData) => {

    //filter data based on svr12
    baseData = baseData.filter((rec) => rec.SVR12 != null);
    let chartData = {};
    chartData['genotype'] = prepareDataSVR12ByKey(baseData, 'genotype');
    chartData['gender'] = prepareDataSVR12ByKey(baseData, 'gender');
    chartData['race'] = prepareDataSVR12ByKey(baseData, 'race');
    chartData['cirrhosis'] = prepareDataSVR12ByKey(baseData, 'cirrhosis');
    chartData['medication'] = prepareDataSVR12ByKey(baseData, 'Medication');
    // chartData['actual']=
    // chartData['total']= 
    return chartData;

}

let prepareDataSVR12ByKey = (baseData, key) => {
    let grpGenodata = _.groupBy(baseData, key);
    let categories = [];
    let chartData = [];
    let arrayData = [];
    let arrayDataTotal = [];
    let jsontotal = {};
    let json = {};
    json['name'] = 'Patients with RNA test';
    jsontotal['name'] = 'Total';

    let total = 0;
    let actualTotal = 0;
    for (let key in grpGenodata) {
        let keyData = grpGenodata[key];
        let len = serverUtils.getUniqueCount(keyData,'patientId');
        let retreatedPatient = getPatientsHavingSVR12(keyData);
        let label = key == 'M' ? 'Male' : (key == 'F' ? 'Female' : (key == 'U' ? 'Unknown' : key));
        categories.push(label);
        arrayData.push(len);
        total += len;
        actualTotal += retreatedPatient;
        arrayDataTotal.push(retreatedPatient);
    }
    json['data'] = arrayDataTotal;
    jsontotal['data'] = arrayData;
    chartData.push(jsontotal);
    chartData.push(json);
    return {
        keys: categories,
        data: chartData,
        total:total,
        actual:actualTotal
    };
}

let getPatientsHavingSVR12 = (baseData) => {
    baseData = baseData.filter((rec) => rec.SVR12 != 0);
    let count = serverUtils.getUniqueCount(baseData,'patientId');
    return count;
}

//prepare comparison chart Data
let prepareComparisonChartData = (baseData) => {

    //chartData
    let chartData = {};
    chartData['medication'] = null;
    chartData['cirrhosis'] = null;
    chartData['genotype'] = null;
    chartData['gender'] = null;
    //get data for medication
    chartData['medication'] = prepareComparisondataByKey(baseData, 'Medication');
    //group by cirrhosis
    chartData['cirrhosis'] = prepareComparisondataByKey(baseData, 'cirrhosis');
    //group by genotype
    chartData['genotype'] = prepareComparisondataByKey(baseData, 'genotype');
    //group by race
    chartData['race'] = prepareComparisondataByKey(baseData, 'race');
    //group by gender
    chartData['gender'] = prepareComparisondataByKey(baseData, 'gender');

    chartData['responders'] = prepareRespondersChartData(baseData);
    return chartData;
}

//Data for plotting two barsfor responders and non responders 02/14/2017---Praveen
let prepareRespondersChartData = (baseData) => {

    //get relapsed patient data
    let relp = getRelapsedPatientData(baseData);
    //getreinfected patients data
    let remp = getRemmittedPatientData(baseData);
    //get null responders data
    let nullp = getNullRespondersData(baseData);
    //get partil  reponse data
    let partRes = getPartialRespondersData(baseData);
    //console.log(nullp,partRes);
    let chartData = [];
    let respondrs = 0;
    total = relp.count + remp.count + nullp.count + partRes.count;
    if (relp.count != 0 || remp.count != 0) {
        let json = {};
        respondrs = relp.count + remp.count;
        json['name'] = 'Responders';
        json['y'] = (respondrs / total) * 100;;
        json['count'] = respondrs;
        json['total'] = total;
        chartData.push(json);
    }

    let nonrespondrs = 0;
    if (nullp.count != 0 || partRes.count != 0) {
        nonrespondrs = nullp.count + partRes.count;
        let json = {};
        json['name'] = 'Non Responders';
        json['y'] = (nonrespondrs / total) * 100;
        json['count'] = nonrespondrs;
        json['total'] = total;
        chartData.push(json);
    }
    return {
        chartData:chartData,
        total : total,
       
    };
}

let prepareComparisondataByKey = (baseData, key) => {

    //group by medication
    let keyGrpData = _.groupBy(baseData, key);
    let chartData = [];
    let reschartData = [];
    let nonchartData = [];
    let categories = [];
    let relapsedData = [];
    let remissionData = [];
    let nullRespondersData = [];
    let partialResponders = [];
    let responders = 0;
    let respondersCategories = [];
    let nonresponders = 0;
    let nonrespondersCategories = [];

    //let ttoal count
    let total  = 0;
    total += serverUtils.getUniqueCount(baseData,'patientId');
    //filter data and prepare json structure for it.
    for (let grpKey in keyGrpData) {
        //push category key data
        let label = grpKey == 'M' ? 'Male' : (grpKey == 'F' ? 'Female' : (grpKey == 'U' ? 'Unknown' : grpKey));

        let keyData = keyGrpData[grpKey];
        let relp = getRelapsedPatientData(keyData);
        let remp = getRemmittedPatientData(keyData);
        let nullp = getNullRespondersData(keyData);
        let partRes = getPartialRespondersData(keyData);

        if (relp.count != 0 || remp.count != 0) {
            respondersCategories.push(label);
            relapsedData.push(relp);
            remissionData.push(remp);
        }


        if (nullp.count != 0 || partRes.count != 0) {
            nonrespondersCategories.push(label);
            nullRespondersData.push(nullp)
            partialResponders.push(partRes);
        }

    }

    if (relapsedData.length) {
        reschartData.push({ name: 'Relapsed', data: relapsedData });
    }
    if (remissionData.length) {
        reschartData.push({ name: 'Retreated', data: remissionData });
    }
    if (nullRespondersData.length) {
        nonchartData.push({ name: 'Null Responders', data: nullRespondersData });
    }
    if (partialResponders.length) {
        nonchartData.push({ name: 'Partial Responders', data: partialResponders });
    }

    //return data based on responders and on responders
    let json = {
        'responders': {
            data: reschartData,
            keys: respondersCategories,
            total:total,
            actual:0
        },
        'nonresponders': {
            data: nonchartData,
            keys: nonrespondersCategories,
            total:total,
            actual:0
        }
    }

    return json
}

let getNullRespondersData = (baseData) => {
    let filteredData = baseData.filter((rec) => rec.SVR12 == 0);
    let count = serverUtils.getUniqueCount(filteredData,'patientId')//filteredData.length; //Object.keys(_.countBy(filteredData, 'PATIENT_ID_SYNTH')).length;
    let total = serverUtils.getUniqueCount(baseData,'patientId')//baseData.length; //Object.keys(_.countBy(baseData, 'PATIENT_ID_SYNTH')).length;
    let percentage = 0;
    if (total != 0) {
        percentage = (count / total) * 100;
    }
    return {
        y: count,
        total: total,
        count: count
    };
}

//get partial responders data
let getPartialRespondersData = (baseData) => {

    let filteredData = baseData.filter((rec) => {
        if (rec.weeks >= 24 && Math.log(rec.ViralLoad) > 2) {
            return true;
        }
    });
    let count = serverUtils.getUniqueCount(filteredData,'patientId');//filteredData.length; //Object.keys(_.countBy(filteredData, 'PATIENT_ID_SYNTH')).length;
    let total = serverUtils.getUniqueCount(baseData,'patientId');//baseData.length; //Object.keys(_.countBy(baseData, 'PATIENT_ID_SYNTH')).length;
    let percentage = 0;
    if (total != 0) {
        percentage = (count / total) * 100;
    }
    return {
        y: count,
        total: total,
        count: count
    };
}

//get relpasedPatientsData
let getRelapsedPatientData = (baseData) => {
    //let patientGrpData = _.groupBy(baseData, 'PATIENT_ID_SYNTH');
    // let RelapsedData = [];

    // for (let patientid in patientGrpData) {
    //     let paData = patientGrpData[patientid];
    //     //let flag = false;
    //     let startDate = paData[0]['STRT_DATE'];
    //     let endDate = paData[paData.length - 1]['END_DATE'];

    //     for (let index = 0; index < paData.length; index++) {
    //         //console.log(paData[index].Perfed_Dt,startDate,endDate);
    //         if (paData[index].Perfed_Dt > startDate) {
    //             let viraload = parseInt(paData[index]['ViralLoad']);
    //             //console.log(viraload,startDate,endDate);
    //             if (viraload != 0 && (paData[index].Perfed_Dt <= endDate)) {
    //                 RelapsedData.push(paData[index]);
    //             }
    //         }
    //     }
    // }
    //Modified by Praveen on 3 April 2017 
    let filteredData = baseData.filter((rec) => rec.relapsed == 'Yes');
    //let count = Object.keys(_.countBy(RelapsedData, 'PATIENT_ID_SYNTH')).length;
    //let total = Object.keys(_.countBy(baseData, 'PATIENT_ID_SYNTH')).length;
    let count = serverUtils.getUniqueCount(filteredData,'patientId');//filteredData.length;
    let total = serverUtils.getUniqueCount(baseData,'patientId');
    let percentage = 0;
    if (total != 0) {
        percentage = (count / total) * 100;
    }
    return {
        y: count,
        total: total,
        count: count
    };
}

let getRemmittedPatientData = (baseData) => {
    // let patientGrpData = _.groupBy(baseData, 'PATIENT_ID_SYNTH');
    // let RelapsedData = [];
    // let totalPatients = 0;
    // for (let patientid in patientGrpData) {
    //     let paData = patientGrpData[patientid];
    //     let flag = false;
    //     let startDate = paData[0]['STRT_DATE'];
    //     let endDate = paData[paData.length - 1]['END_DATE'];
    //     let temp_count = 0;
    //     for (let index = 1; index < paData.length; index++) {

    //         if (paData[index].Perfed_Dt > startDate && (paData[index].Perfed_Dt <= endDate)) {
    //             temp_count += 1;
    //         }
    //     }
    //     if (temp_count > 1) {
    //         totalPatients += 1;
    //     }
    //     for (let index = 1; index < paData.length; index++) {
    //         //console.log(paData[index].Perfed_Dt,startDate,endDate);
    //         if (paData[index].Perfed_Dt > startDate && parseInt(paData[0]['ViralLoad']) > 0) {

    //             let viraload = parseInt(paData[index]['ViralLoad']);
    //             //console.log(viraload,startDate,endDate);
    //             if (viraload == 0 && (paData[index].Perfed_Dt <= endDate)) {
    //                 RelapsedData.push(paData[index]);
    //                 break;
    //             }
    //         }
    //     }
    // }
    let filteredData = baseData.filter((rec) => rec.remmitted == 'Yes');
    let count = serverUtils.getUniqueCount(filteredData,'patientId');//filteredData.length; //Object.keys(_.countBy(RelapsedData, 'PATIENT_ID_SYNTH')).length;
    let total = serverUtils.getUniqueCount(baseData,'patientId');//baseData.length; //Object.keys(_.countBy(baseData, 'PATIENT_ID_SYNTH')).length;
    let percentage = 0;
    if (total != 0) {
        percentage = (count / total) * 100;
    }
    return {
        y: count,
        total: total,
        count: count
    };
}


let prepareCareFailureChartData = (patientsData) => {
    let finalData = {};
    var race = _.groupBy(patientsData, "race");
    var CareFailure = [];
    let mainarray = [];
    let resultNotAchievedarr = [],
        resultDiscontinuedarr = [],
        resultLostToFollowarr = [];
    let categoriesarr = [];
    for (var key in race) {
        categoriesarr.push(key);
        medications = [];
        // CareFailure.push(key);
        var resultNotAchieved = race[key].filter(function(row) { return row.SVR12 == 0; }).length;
        var resultDiscontinued = race[key].filter(function(row) { return row.IS_COMPLETED == "No"; }).length;
        var resultLostToFollow = race[key].filter(function(row) { return row.SVR12 == null; }).length;
        /*  console.log(key); 
          console.log(resultNotAchieved); 
          console.log(resultDiscontinued); 
          console.log(resultLostToFollow); */
        resultNotAchievedarr.push(resultNotAchieved);
        resultDiscontinuedarr.push(resultDiscontinued);
        resultLostToFollowarr.push(resultLostToFollow);

    }
    var total = 0;
    for (i = 0; i < resultNotAchievedarr.length; i++) {
        if (resultNotAchievedarr[i] != undefined) { total = total + parseInt(resultNotAchievedarr[i]); }
    }
    mainarray.push({ name: "SVR Not Achieved", data: resultNotAchievedarr, total: total });

    total = 0;
    for (i = 0; i < resultDiscontinuedarr.length; i++) {
        if (resultDiscontinuedarr[i] != undefined) { total = total + parseInt(resultDiscontinuedarr[i]); }
    }
    mainarray.push({ name: "Discontinued", data: resultDiscontinuedarr, total: total });

    for (i = 0; i < resultLostToFollowarr.length; i++) {
        if (resultLostToFollowarr[i] != undefined) { total = total + parseInt(resultLostToFollowarr[i]); }
    }
    mainarray.push({ name: "Lost To Follow up", data: resultLostToFollowarr, total: total });

    // CareFailure.push(mainarray);
    finalData.Categories = categoriesarr;
    finalData.CareFailureData = mainarray;
    return finalData;
}


let prepareYearlySuccessRateData = (patientsData) => {
    var years = _.groupBy(patientsData, "Year");

    let dataObject = {},
        CategoryArray = [],
        DataArray = [];

    for (var key in years) {
        let total = years[key].filter(obj => (obj.SVR12 != null));

        let undetected = years[key].filter(obj => (obj.SVR12 == 1));

        CategoryArray.push(key);
        // DataArray.push(undetected.length);
        let undetectedLen = serverUtils.getUniqueCount(undetected,'patientId');
        let totalLen = serverUtils.getUniqueCount(total,'patientId');
        DataArray.push({
            y: (undetectedLen / totalLen) * 100,
            totalpatients: totalLen,
            curedpatients: undetectedLen,
            color: serverUtils.getColorCodeByYear(key.toString())
        });
    }
    dataObject["CategoryArray"] = CategoryArray;
    dataObject["DataArray"] = DataArray;

    return dataObject;
}


//function to get SVR treand data
let getSVRTrendsData = (dataParams, callbackFn) => {
    let query = ``,
        dataObj = {},
        params = dataParams.params;

    let whereClause = serverUtils.getQueryForAdvFilters(params),
        fdaCompliantQuery = getFdaCompliantQuery(params.fdaCompliant);

    dataObj['PatientsJourney'] = null;

    /**
     * @author: Pramveer
     * @date: 27th Feb 17
     * @desc: Modified the query for the viral load value changes & added condition to use undetected viral load also.
     */

    // if (params.database) {
    //     if (params.database == 'PHS_HCV') {
    //         pdatabase = params.database + '.PHS_HCV_PATIENTS';
    //         mdatabase = params.database + '.PHS_PATIENT_MEDICATIONS';
    //         vdatabase = params.database + '.ALL_VIRAL_LOAD_RESULTS';
    //     } else if (params.database == 'IMS_LRX_AmbEMR_Dataset') {
    //         pdatabase = params.database + '.IMS_HCV_PATIENTS';
    //         mdatabase = params.database + '.PATIENT_MEDICATIONS';
    //         vdatabase = params.database + '.ALL_VIRAL_LOAD_RESULTS';
    //     }
    // }
    /**
     * @author: Nisha
     * @date: 16th May 17
     * @desc: Modified the query for Implementation of switch DB.
     */

    let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

    query = `select
				medication.PATIENT_ID_SYNTH, PatientId ,
                (CASE 
                    WHEN ViralLoad = 'NOT DETECTED' THEN 0
                    ELSE ViralLoad
                END ) as ViralLoad,
				ROUND(DATEDIFF(${dbConfig.Perfed_Dt}, STRT_DATE)/7, 0) as Weeks,
				Perfed_Dt,STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,
				MEDICATION,TREATMENT_PERIOD
				from ${dbConfig.tblPatientMedication} medication join ${dbConfig.tblViralload} res
				on medication.PATIENT_ID_SYNTH = res.PatientId join ${dbConfig.tblHcvPatient} as patients
				on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
				-- where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
                where (ViralLoad <> 'DETECTED')
				AND ROUND(DATEDIFF(${dbConfig.Perfed_Dt} , STRT_DATE)/7, 0) > -8
				AND ROUND(DATEDIFF(${dbConfig.Perfed_Dt} , STRT_DATE)/7, 0) < 70
				${whereClause}
				${fdaCompliantQuery}`;

    // console.log('***********SVR Trend Query**************');
    // console.log(query);

    liveDb.db.query(query, function(error, result) {
        if (error) {
            console.log(error);
            return;
        } else {
            let drugsData = prepareGroupedMedsData(dataParams.efficacyRecords, 'efficacy');
            dataObj.patientData = dataParams.efficacyRecords;
            dataObj['PatientsJourney'] = result;
            // dataObj['chartsData'] = JSON.stringify(chartsLib.getAnalyticsMainBarData(drugsData));
            dataObj['chartsData'] = JSON.stringify(chartsLib.getAnalyticsEfficacyData(drugsData));
            dataObj['totalPatients'] = drugsData[0]['TotalN'];
            // dataObj['chartsData'] = dataParams.efficacyRecords;
            let compressed_object = LZString.compress(JSON.stringify(dataObj));

            // @Yuvraj 10 Feb 17 - Saving data into caching object.
            let caching = new CachingObj({
                key: params.database + "analytics_efficacy_" + params.fdaCompliant,
                data: compressed_object
            });
            caching.updateData();

            callbackFn(undefined, compressed_object);
        }
    });

}

// let prepareGroupedMedsData = (patientsData, dataTab) => {
// 	let totalPatients = patientsData.length;

// 	let medsGrpsData = _.groupBy(patientsData, (rec) => {
// 		return rec.Medication + '_' + rec.treatment_Period; //group by drug name & treatment period (Harvoni_12)
// 	});

// 	let drugsData = [],
// 		drugId = 1,
// 		finalObj = {};


// 	//loop for all medication data
// 	for (let medGrp in medsGrpsData) {
// 		let currMedData = medsGrpsData[medGrp];
// 		let paramObj = {
// 			totalPatients: totalPatients,
// 			drugId: drugId
// 		}

// 		if (dataTab == 'efficacy') {
// 			drugsData.push(prepareEfficacyForSingleMed(currMedData, paramObj));
// 		} else if (dataTab == 'adherence') {
// 			drugsData.push(prepareAdherenceForSingleMed(currMedData, paramObj));
// 		}

// 		drugId++;
// 	}


// 	return drugsData;

// }

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 29-May-2017
 * @desc: Adapted method to calculate unique patient count for efficacy tab
*/
let prepareGroupedMedsData = (patientsData, dataTab) => {
    
    //let totalPatients = patientsData.length;
    //let totalPatients =_.unique (_.pluck(patientsData,"patientId")).length;
    let totalPatients =serverUtils.getUniqueCount(patientsData,"patientId");
    
    let medsGrpsData = _.groupBy(patientsData, (rec) => {
        return rec.Medication + '_' + rec.treatmentPeriod; //group by drug name & treatment period (Harvoni_12)
    });

    let drugsData = [],
        drugId = 1,
        finalObj = {};


    //loop for all medication data
    for (let medGrp in medsGrpsData) {
        let currMedData = medsGrpsData[medGrp];
        // console.log(currMedData);
        let paramObj = {
            totalPatients: totalPatients,
            drugId: drugId
        }

        if (dataTab == 'efficacy') {
            drugsData.push(prepareEfficacyForSingleMed(currMedData, paramObj));
        } else if (dataTab == 'adherence') {
            drugsData.push(prepareAdherenceForSingleMed(currMedData, paramObj));
        }

        drugId++;
    }


    return drugsData;

}



// let prepareEfficacyForSingleMed = (dataArray, dataObj) => {
// 	let drugObj = {};

// 	let total_count = 0,
// 		efficacy_len = 0,
// 		med_count = 0,
// 		svr_patients = 0;

// 	let drugName = dataArray[0].Medication,
// 		treatmentPeriod = dataArray[0].treatment_Period;

// 	for (let j = 0; j < dataArray.length; j++) {

// 		med_count = parseInt(dataArray[j]['total']);
// 		total_count += med_count;

// 		//  Modified for IMS DB Intefration
// 		// Consider only those patients for SVR calculation who have SVR data.
// 		if (dataArray[j]['SVR12'] != null) {
// 			svr_patients += med_count;
// 			if (dataArray[j]['SVR12'] == 1) {
// 				efficacy_len += med_count;
// 			}
// 		}

// 	}

// 	drugObj['DrugName'] = drugName + ' (' + treatmentPeriod + "W)";
// 	drugObj['DrugPopulationSize'] = total_count;
// 	drugObj['DrugN'] = total_count;
// 	drugObj['TotalN'] = dataObj.totalPatients;
// 	drugObj['DrugId'] = dataObj.drugId;
// 	drugObj['DrugSequence'] = dataObj.drugId;

// 	// var efficacy = ((efficacy_len/parseInt(total_count))*100);
// 	// Consider only patietnts with svr for efficacy calculations.
// 	let efficacy = svr_patients == 0 ? 'NA' : ((efficacy_len / parseInt(svr_patients)) * 100);

// 	drugObj['Efficacy'] = {
// 		'Efficacy': efficacy == 'NA' ? 'NA' : efficacy.toFixed(2),
// 		'PWeek12': 0,
// 		'ResponseRate': ('N=' + svr_patients)
// 	};

// 	return drugObj;
// }



let prepareEfficacyForSingleMed = (dataArray, dataObj) => {
    //For Efficacy tab I have considered only valid SVR12 result
    //dataArray=_.filter(dataArray,(d)=>{return d.SVR12 !==null;});
    //console.log(dataArray[0]);
    let drugObj = {};

    let total_count = 0,
        efficacy_len = 0,
        med_count = 0,
        svr_patients = 0;

    let drugName = dataArray[0].Medication,
        treatmentPeriod = dataArray[0].treatmentPeriod;
        // push all patient id in array
        let allPatientIds=[];

    for (let j = 0; j < dataArray.length; j++) {

        med_count = parseInt(dataArray[j]['total']);
        //// OLD commented code for calculating unique patient count
        //total_count += med_count;

        //  Modified for IMS DB Intefration
        // Consider only those patients for SVR calculation who have SVR data.
        if (dataArray[j]['SVR12'] != null) {
            svr_patients += med_count;
            allPatientIds.push(dataArray[j].patientId);
            if (dataArray[j]['SVR12'] == 1) {
                efficacy_len += med_count;
            }
        }

    }
    // console.log('dataArray');
    // console.log(dataArray);
    ////Calculate unique patient count
//    total_count= _.unique(allPatientIds).length
    //total_count= serverUtils.getUniqueArrayCount(allPatientIds);
    drugObj['DrugName'] = drugName + ' (' + treatmentPeriod + "W)";
    drugObj['DrugNameWithoutWeek'] = drugName;
    drugObj['TreatmentPeriod'] = treatmentPeriod;
    // drugObj['DrugPopulationSize'] = total_count;
    drugObj['DrugPopulationSize'] = svr_patients;
    // drugObj['DrugN'] = total_count;
    drugObj['DrugN'] = svr_patients;
    drugObj['TotalN'] = dataObj.totalPatients;
    drugObj['DrugId'] = dataObj.drugId;
    drugObj['DrugSequence'] = dataObj.drugId;

    // var efficacy = ((efficacy_len/parseInt(total_count))*100);
    // Consider only patietnts with svr for efficacy calculations.
    let efficacy = svr_patients == 0 ? 'NA' : ((efficacy_len / parseInt(svr_patients)) * 100);

    drugObj['Efficacy'] = {
        'Efficacy': efficacy == 'NA' ? 'NA' : efficacy.toFixed(2),
        'PWeek12': 0,
        'EffectivePatients': svr_patients,
        'ResponseRate': ('N=' + svr_patients)
    };

    // console.log('drugObj Efficacy ');
    // console.log(drugObj['Efficacy']);

    return drugObj;
}

let prepareAdherenceForSingleMed = (dataArray, dataObj) => {
    let drugObj = {};

    let total_count = 0,
        med_count = 0,
        sum_days_medication = 0;

    let drugName = dataArray[0].Medication,
        treatmentPeriod = dataArray[0].treatmentPeriod;

    for (let j = 0; j < dataArray.length; j++) {
        med_count = parseInt(dataArray[j]['total']);
        total_count += med_count;
        sum_days_medication += parseFloat(dataArray[j]['days_med']);

    }

    drugObj['DrugName'] = drugName + ' (' + treatmentPeriod + "W)";
    drugObj['DrugNameWithoutWeek'] = drugName;
    drugObj['TreatmentPeriod'] = treatmentPeriod;
    drugObj['DrugPopulationSize'] = total_count;
    drugObj['DrugN'] = total_count;
    drugObj['TotalN'] = dataObj.totalPatients;
    drugObj['DrugId'] = dataObj.drugId;
    drugObj['DrugSequence'] = dataObj.drugId;

    sum_days_medication = sum_days_medication / dataArray.length;

    let adherence = (sum_days_medication / (parseInt(treatmentPeriod) * 7)) * 100;

    drugObj['Adherence'] = {
        'Adherence': adherence,
        'EffectivePatients': total_count,
        'MPR': '(N=' + total_count + ')'
    };

    return drugObj;
}


let getFdaCompliantQuery = (fdaCheck) => {
    if (fdaCheck.toLowerCase() === 'yes') {
        return `AND medication.TREATMENT_PERIOD IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else if (fdaCheck.toLowerCase() === 'no') {
        return `AND medication.TREATMENT_PERIOD NOT IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else {
        return ``;
    }
}

let getDrugByGenotypeData = (dataParams, callbackFn) => {
    // console.log('testing');
    let query = ``,
        dataObj = {},
        params = dataParams.params;

    let fdaCompliantQuery = getFdaCompliantQuery(params.fdaCompliant);
    let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
    query = `select
					patients.PATIENT_ID_SYNTH as patientId,
					patients.GENOTYPE as genotype,
					patients.PAT_ZIP as zipcode,
					medication.MEDICATION,
					TREATMENT_PERIOD as treatmentPeriod
				from
					${dbConfig.tblHcvPatient} as patients
				JOIN
					${dbConfig.tblPatientMedication} as medication
				ON patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
				where
					medication.MEDICATION !=""
				${fdaCompliantQuery}`;

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
            // dataObj['UtilizationChartsData'] = JSON.stringify(chartsLib.getEfficacyBarData(drugsData));
            let uniquePatients = serverUtils.getUniqueArray(_.pluck(dataParams.utilizationRecords, 'patientId')).length;
            dataObj['totalPatients'] = uniquePatients;
            dataObj['allpatients'] = drugsData[0]['TotalN'];
            //dataObj['totalPatients'] = drugsData[0]['TotalN'];
            dataObj['drugsData'] = drugsData;
            let compressed_object = LZString.compress(JSON.stringify(dataObj));

            // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
            // let caching = new CachingObj({
            //     key: "analytics_utilization_" + params.fdaCompliant,
            //     data: compressed_object
            // });
            // caching.updateData();

            callbackFn(undefined, compressed_object);
        }
    });

}

let prepareUtilizaitonData = (patientsData) => {
        let totalPatients = 0,
            totalProviders = 0;
        totalPatients = patientsData.length;
        //totalPatients = serverUtils.getUniqueArray(_.pluck(patientsData, 'providerId')).length;
        //get total unique provider ids for the patients data
        totalProviders = serverUtils.getUniqueArray(_.pluck(patientsData, 'providerId')).length;

        let medsGrpsData = _.groupBy(patientsData, (rec) => {
            return rec.Medication + '_' + rec.treatmentPeriod; //group by drug name & treatment period (Harvoni_12)
        });

        let drugsData = [],
            drugId = 1,
            finalObj = {};
        //console.log(totalProviders);

        //loop for all medication data
        for (let medGrp in medsGrpsData) {
            let currMedData = medsGrpsData[medGrp];
            let paramObj = {};
            paramObj.totalPatients = totalPatients;
            paramObj.totalProviders = totalProviders;
            //get distinct providers count who prescribed this medication
            paramObj.medsProvider = serverUtils.getUniqueArray(_.pluck(currMedData, 'providerId')).length;
            paramObj.categoryNetwork = 0;
            paramObj.drugId = drugId;

            // drugsData.push(prepareSTCDUtilization(currMedData, paramObj));
            drugsData.push(prepareDataForSingleMedUtilization(currMedData, paramObj));
            drugId++;
        }

        return drugsData;
    }
    // Nisha 02/15/2017 modifed to get the State codes
let prepareSTCDUtilization = (dataArray) => {
    let getPatientLocations = _.countBy(dataArray, 'ST_CD');
    //    console.log(getPatientLocations);
    return getPatientLocations;
}

let prepareDataForSingleMedUtilization = (dataArray, dataObj) => {
    let drugObj = {};

    let total_count = 0,
        efficacy_len = 0,
        med_count = 0,
        svr_patients = 0,
        providerLength = dataObj.medsProvider,
        networkLength = 0;
    // ST_CD ='';

    let drugName = dataArray[0].Medication,
        treatmentPeriod = dataArray[0].treatmentPeriod;

    for (let j = 0; j < dataArray.length; j++) {

        med_count = parseInt(dataArray[j]['total']);
        total_count += med_count;
        // ST_CD += "," + dataArray[j]['ST_CD'];
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
    // drugObj['ST_CD'] = ST_CD;
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