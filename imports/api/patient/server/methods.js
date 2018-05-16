var Patient = new MysqlSubscription('PatientData');

import * as serverUtils from '../../common/serverUtils.js';
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 15,16-May-2017
 * @desc: Started Adapting changes related to PHS and Benchmark switch
 * Converted Stored procedure query to inline query
 */
Meteor.syncMethods({
    'getLabDetails': function(PatientID, TabName, params, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!PatientID || !TabName || !_.isFunction(callback)) {
                console.log('Invalid Parameters');
                return undefined;
            }
            if (!isValidParams({
                    params: params,
                    cb: callback
                })) {
                console.log('Invalid Parameters.');
                return undefined;
            }

            let query = '';
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            // console.log(dbConfig);
            if (!PatientID || !TabName) return;
            // Here PatientID is refereeing to 'PATIENT_ID_SYNTH'
            query = `SELECT DISTINCT TEST_NM, VALUE_TXT, REF_RNG_TXT, DATE_FORMAT(RECED_DT,"%M %e, %Y") AS RECED_DT FROM ${dbConfig.tblLabs} 
            WHERE Patient_ID = ${PatientID}  AND Tab_Name ="${TabName}" 
            and VALUE_TXT not in ('0','') 
             LIMIT 100`;
            // console.log(query);
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    callback(true, error);
                    //return;
                } else {
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    'getHerbalMedicationHistory': function(PatientID, params, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!PatientID || !_.isFunction(callback)) {
                console.log('Invalid Parameters');
                return undefined;
            }

            let query = '';

            if (!PatientID) return;
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            // I found herbal medication from only ambulatory prescription from PHS data
            if (dbConfig.DB_NM === 'PHS_HCV') {
                query = `                            
                          select MEDS_NM,DISPENSE_QTY,
                           date_format(str_to_date(START_DATE, '%m/%d/%Y'),'%M %e, %Y') as STRT_DATE,
                           date_format(str_to_date(END_DATE, '%m/%d/%Y'),'%M %e, %Y') as END_DATE,
                           date_format(str_to_date(ORDERING_DT, '%m/%d/%Y'),'%M %e, %Y') as RECED_DT
                           
                          from PHS_HCV.deid_prescriptions_inpatient  where 
                          pat_id=${PatientID}
                          and (meds_nm like '%silymarin%' or meds_nm like '%Probiotics%' 
                       or meds_nm like '%glycyrrhizin%' or meds_nm like '%lactoferrin %'
                        or meds_nm like 'interferon%'
                        or meds_nm like '%herbal%'
                       )
                        and DISPENSE_QTY not in ('0','')
                          union all
                          
                          select MEDS_NM,DISPENSE_QTY,
                           date_format(str_to_date(START_DATE, '%m/%d/%Y'),'%M %e, %Y') as STRT_DATE,
                           date_format(str_to_date(END_DATE, '%m/%d/%Y'),'%M %e, %Y') as END_DATE,
                           date_format(str_to_date(ORDERING_DT, '%m/%d/%Y'),'%M %e, %Y') as RECED_DT
                           
                          from PHS_HCV.deid_prescriptions_ambulatory where pat_id=${PatientID}
                          and (meds_nm like '%silymarin%' or meds_nm like '%Probiotics%' 
                       or meds_nm like '%glycyrrhizin%' or meds_nm like '%lactoferrin %'
                        or meds_nm like 'interferon%'
                        or meds_nm like '%herbal%'
                       ) 
                        and DISPENSE_QTY not in ('0','')
                       `;
            } else if (dbConfig.DB_NM === 'IMS_LRX_AmbEMR_Dataset') {
                query = `SELECT m. MEDS_NM,m.DISPENSE_QTY,DATE_FORMAT(m.STRT_DT,"%M %e, %Y") AS STRT_DATE,DATE_FORMAT(m.END_DT,"%M %e, %Y") AS END_DATE,DATE_FORMAT(m.RECED_DT,"%M %e, %Y") AS RECED_DATE
                          from MEDICATIONS m 
                       WHERE (m.meds_nm like '%silymarin%' or m.meds_nm like '%Probiotics%' 
                       or m.meds_nm like '%glycyrrhizin%' or m.meds_nm like '%lactoferrin %'
                        or m.meds_nm like 'interferon%'
                        or m.meds_nm like '%herbal%'
                       )
                        AND m.PATIENT_ID_SYNTH = ${PatientID}

                         and m.DISPENSE_QTY not in ('0','') 
                        `;
            }
            // console.log(query);
            // Here PatientID is refereeing to 'PATIENT_ID_SYNTH'
            //liveDb.db.query('call pin_sp_AVM_GetHerbalMedicationByPatientId(?)', [PatientID], function (error, result) {
            liveDb.db.query(query, function(error, result) {

                if (error) {
                    console.log(error);
                    callback(true, error);
                    // return;
                } else {
                    // console.log(result.length);
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getSocialHistory': function(PatientID, params, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!PatientID || !_.isFunction(callback)) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let query = '';

            if (!PatientID) return;
            // Here PatientID is refereeing to 'PATIENT_ID_SYNTH'
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            if (dbConfig.DB_NM === 'PHS_HCV') {
                query = ` SELECT prob.DX_NAME as PROB_NM
          ,  date_format(str_to_date(ONSET_DT, '%m/%d/%Y'),'%M %e, %Y') as RECED_DATE
                    FROM PHS_HCV.deid_problem prob
                    where (prob.PROB_CATG_DESC like '%social%' or prob.DX_NAME like '%social%')
                    and prob.PAT_ID = ${PatientID}`;
            } else if (dbConfig.DB_NM === 'IMS_LRX_AmbEMR_Dataset') {
                query = `SELECT prob.PROB_NM,DATE_FORMAT(prob.RECED_DT,"%M %e, %Y") AS RECED_DATE
                    FROM PROBLEM prob 
         where (prob.PROB_CATG_DESC like '%social%'  or PROB_NM like '%social%')
            and prob.PATIENT_ID_SYNTH = ${PatientID}`;
            }

            console.log("social history**");
            //  liveDb.db.query('call pin_sp_AVM_GetAllSocialHistoryByPatientId(?)', [PatientID], function (error, result) {
            liveDb.db.query(query, function(error, result) {

                if (error) {
                    console.log(error);
                    callback(true, error);
                    //   return;
                } else {
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    'getMedicationHistoryAll': function(PatientID, params, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!PatientID || !_.isFunction(callback)) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let query = '';

            if (!PatientID) return;

            // Commented By Yuvraj (April 14th 2017) : I dont wanna use a stored procedure to fetch the data. 
            // Since Stored Procedure is just firing a simple select query.
            // // Here PatientID is refereeing to 'PATIENT_ID_SYNTH'
            // liveDb.db.query('call pin_sp_AVM_GetAllMedicationHistoryByPatientId(?)', [PatientID], function(error, result) {
            //     if (error) {
            //         return;
            //     } else {
            //         //  console.log(result);
            //         callback(undefined, result);
            //     }
            // });


            // Added By Yuvraj April 14th
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            if (dbConfig.DB_NM === 'PHS_HCV') {
                query = `                            
                          select MEDS_NM,DISPENSE_QTY,
                           date_format(str_to_date(START_DATE, '%m/%d/%Y'),'%M %e, %Y') as STRT_DATE,
                           date_format(str_to_date(END_DATE, '%m/%d/%Y'),'%M %e, %Y') as END_DATE,
                           date_format(str_to_date(ORDERING_DT, '%m/%d/%Y'),'%M %e, %Y') as RECED_DT
                           
                          from PHS_HCV.deid_prescriptions_inpatient  where pat_id=${PatientID}
                          and  DISPENSE_QTY not in ('0','')
                          union all
                          
                          select MEDS_NM,DISPENSE_QTY,
                           date_format(str_to_date(START_DATE, '%m/%d/%Y'),'%M %e, %Y') as STRT_DATE,
                           date_format(str_to_date(END_DATE, '%m/%d/%Y'),'%M %e, %Y') as END_DATE,
                           date_format(str_to_date(ORDERING_DT, '%m/%d/%Y'),'%M %e, %Y') as RECED_DT
                           
                          from PHS_HCV.deid_prescriptions_ambulatory where pat_id=${PatientID}
                           and  DISPENSE_QTY not in ('0','') `;
            } else if (dbConfig.DB_NM === 'IMS_LRX_AmbEMR_Dataset') {
                query = `SELECT rxlookup.PRODUCT_NAME as MEDS_NM,
                            date_format(meds.STRT_DT,"%M %e, %Y") as STRT_DATE,
                            date_format(meds.END_DT,"%M %e, %Y") as END_DATE,
                            meds.DISPENSE_QTY
                            FROM IMS_LRX_AmbEMR_Dataset.MEDICATIONS as meds
                            JOIN IMS_LRX_AmbEMR_Dataset.aemr_rx_lookup as rxlookup
                            ON meds.NDC = rxlookup.NDC
                            WHERE meds.PATIENT_ID_SYNTH  = ${PatientID}
                            AND rxlookup.PRODUCT_NAME <> '' 
                            and  meds.DISPENSE_QTY not in ('0','')
                            ORDER BY STRT_DATE ASC`;
            }
            // console.log(query);
            liveDb.db.query(query, function(error, result) {

                if (error) {
                    console.log(error);
                    callback(true, error);
                    //  return;
                } else {
                    // console.log(result.length);
                    callback(undefined, result);
                }
            });


        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    'getMedicationHistoryPharma': function(PatientID, params, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!PatientID || !_.isFunction(callback)) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let query = '';

            if (!PatientID) return;
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            if (dbConfig.DB_NM === 'PHS_HCV') {
                query = `  select L1_BRAND_NAME as MEDS_NM
                    , SUM_FACT_FCTS_RX_CDML_EDRG_DAY as DAYS_SUPPLY
                    , SUM_FACT_FCTS_RX_CDML_EDRG_QTY as QUANTITY
                    , date_format(str_to_date(L1_CCYYMMDD_SVC_DT, '%m/%d/%Y'),'%Y-%m-%d') as FILL_DATE
                    from PHS_HCV.deid_med_rx_claims 
                      WHERE UCI = (Select UCI FROM PHS_HCV.PHS_HCV_PATIENTS WHERE PATIENT_ID_SYNTH =  ${PatientID} 
                                                        AND UCI <> 0 LIMIT 1)
                        and SUM_FACT_FCTS_RX_CDML_EDRG_DAY not in ('0','') 
                        and SUM_FACT_FCTS_RX_CDML_EDRG_QTY not in ('0','')  `;
            } else if (dbConfig.DB_NM === 'IMS_LRX_AmbEMR_Dataset') {
                query = `  SELECT
                            REPLACE(lrPro.BRAND_NAME,' RX','') as MEDS_NM,
                            lrxt.QUANTITY,
                            lrxt.DAYS_SUPPLY AS  DAYS_SUPPLY,
                            date_format(str_to_date(lrxt.FILL_DATE, '%Y%m%d'),'%Y-%m-%d') as FILL_DATE
                            FROM RX as lrxt 
                            JOIN PRODUCT as lrPro 
                            ON lrxt.PRODUCT_ID = lrPro.PRODUCT_ID
                            WHERE lrxt.PATIENT_ID = (Select IDW_PATIENT_ID_SYNTH FROM IMS_HCV_PATIENTS WHERE PATIENT_ID_SYNTH =  ${PatientID} 
                                                        AND IDW_PATIENT_ID_SYNTH <> 0 LIMIT 1)
                                    and lrxt.DAYS_SUPPLY not in ('0','') 
                                    and  lrxt.QUANTITY not in ('0','') 
                            ORDER BY FILL_DATE ASC`;
            }
            // console.log(query);
            liveDb.db.query(query, function(error, result) {

                if (error) {
                    console.log(error);
                    callback(true, error);
                    // return;
                } else {
                    // console.log(result.length);
                    callback(undefined, result);
                }
            });


        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    'getPastHCVMedication': function(PatientID, params, callback) {
        try {
            console.log(params);
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!PatientID || !_.isFunction(callback)) {
                console.log('Invalid Parameters..');
                return undefined;
            }
            let query = '';

            if (!PatientID) return;
            // Here PatientID is refereeing to 'PATIENT_ID_SYNTH'
            /**
             * @author: Arvind
             * @reviewer: 
             * @date: 15-May-2017
             * @desc: Converted stopred procedure query to inline query for multi database integration,
             * It requires changed on client side code also
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            query = `SELECT m.*,DATE_FORMAT(m.STRT_DATE,"%M %e, %Y") AS STRT_DATE,DATE_FORMAT(m.END_DATE,"%M %e, %Y") AS END_DATE
             from ${dbConfig.tblPatientMedication} m 
                   WHERE  m.PATIENT_ID_SYNTH = ${PatientID}   LIMIT 100`;
            // console.log(query);
            //   liveDb.db.query('call pin_sp_AVM_GetPastHCVMedicationByPatientId(?)', [PatientID], function (error, result) {
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    callback(true, error);
                    //    return;
                } else {
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    //Pram -- commented these previous filters and integrated new one
    'searchPatients_old': function(params, callback) {
        let query = '',
            genotype = params.genotypes,
            treatment = params.treatment,
            cirrhosis = params.cirrhosis,
            hiv = params.hiv,
            mental_health = params.mental_health,
            renal_failure = params.renal_failure,
            liver_assesment = params.liver_assesment,
            fibroscan = params.fibroscan,
            fibrosure = params.fibrosure,
            liverBiopsy = params.liverBiopsy,
            hcc = params.hcc,
            chemistry = params.chemistry,
            alcohol = params.alcohol,
            ethnicity = params.ethnicity,
            meld = params.meld,
            etoh = params.etoh,
            age = params.age,
            weight = params.weight,
            viralLoad = params.viralLoad,
            apri = params.apri,
            PatientCount = params.patientCount,
            insurance = params.insurance,
            duration = params.timeFilter,
            medication = params.medication,
            rowNo = params.rowNo;

        query = 'SELECT IMS_HCV_PATIENTS.PATIENT_ID_SYNTH ,GENDER_CD ,BRTH_YR_NBR,ETHNITY_1_DESC, PAT_ZIP ,RACE_DESC, ST_CD ,ALBUMIN ,ETOH ,ALCOHOL ,ALKALINE ,ALT ,APRI, AST ,BILIRUBIN ,BLOOD_UREA_NITROGEN , ' +
            'CALCIUM ,CARBON_DIOXIDE ,CHLIRINE ,GENOTYPE ,CIRRHOSIS ,TREATMENT ,TREATMENT_CONDITION ,CREATININE ,FIBROSCANE ,HIV ,MELD_SCORE, LIVER_BIOPSY ,MENTAL_HEALTH , ' +
            'POTASSIUM ,PREGNANCY ,RENAL_FAILURE ,SODIUM ,PROTEIN ,IMS_HCV_PATIENTS.VIRAL_LOAD ,FIRST_ENCOUNTER ,LIVER_ASSESMENT ,BODY_WEIGHT ,BMI ,IS_HOSPITALIZED ,IS_LIVER_FAILURE ,' +
            'IS_DRUG_INTERACTION ,IS_ANIMIA ,IMS_HCV_PATIENTS.IDW_PATIENT_ID_SYNTH ,CLAIMS_INSURANCEPLAN, IS_FibrosureLab ,IS_LiverBiopsyLab ,IS_FibroscanLab ,IS_HCCLab ,IS_ChemistryLab ,' +
            'Age,DEAD_IND ,CIRRHOSISTYPE ,Liver_Disease_Cost,FibrosureValue,Physician_Service_Cost, Hospitalization_Cost, Count_PLATELET, Count_AST, Count_APRI, FibrosureStage , ' +
            'MEDICATION,TREATMENT_PERIOD,NDC,STRT_DATE,END_DATE,DAYS_MEDICATION,SVR12,CHARGE, ALLOWED, PAID, COPAY, COINSAMT, CHARGE_MODE, ALLOWED_MODE, PAID_MODE, ' +
            'COPAY_MODE, COINSAMT_MODE, Symptomatic_Bradycardia,Ophthalmologic_Disorders,Pulmonary_Disorders,High_ALT_Elevations,Pancreatitis,Hepatic_Failure,Bone_Marrow_Toxicity,' +
            'Symptomatic_Bradycardia_COST, Ophthalmologic_Disorders_COST, Pulmonary_Disorders_COST, High_ALT_Elevations_COST,Pancreatitis_COST, Hepatic_Failure_COST, ' +
            'Bone_Marrow_Toxicity_COST, Neuropsychiatric_Events_COST, Neuropsychiatric_Events,PROVIDER_ID_SYNTH  ';

        if (PatientCount) {
            query += ', count(IMS_HCV_PATIENTS.PATIENT_ID_SYNTH) as \'Patient_Count\'';
        }

        query += ' FROM IMS_LRX_AmbEMR_Dataset.IMS_HCV_PATIENTS ' +
            'join PATIENT_MEDICATIONS ' +
            'on PATIENT_MEDICATIONS.PATIENT_ID_SYNTH = IMS_HCV_PATIENTS.PATIENT_ID_SYNTH where ';



        var flag = false;
        if (treatment != null) {
            query += ' TREATMENT IN (' + treatment + ')';
            flag = true;
        }


        if (medication != null) {
            if (flag)
                query += ' AND ';
            query += ' MEDICATION IN (' + medication + ') ';
            flag = true;
        }

        if (cirrhosis != null) {
            if (flag)
                query += ' AND ';
            query += ' CIRRHOSIS IN (' + cirrhosis + ')';
            flag = true;
        }
        if (genotype != null) {
            if (flag)
                query += ' AND ';
            query += ' GENOTYPE IN (' + genotype + ')';
            flag = true;
        }
        if (insurance != null) {
            if (flag)
                query += ' AND ';
            query += ' claims_insurancePlan IN (' + insurance + ')';
            flag = true;
        }
        if (hiv != null) {
            if (flag)
                query += ' AND ';
            query += ' HIV IN (' + hiv + ')';
            flag = true;
        }
        if (mental_health != null) {
            if (flag)
                query += ' AND ';
            query += ' MENTAL_HEALTH IN (' + mental_health + ')';
            flag = true;
        }
        if (renal_failure != null) {
            if (flag)
                query += ' AND ';
            query += ' RENAL_FAILURE IN (' + renal_failure + ')';
            flag = true;
        }
        if (liver_assesment != null) {
            if (flag)
                query += ' AND ';
            query += ' LIVER_ASSESMENT IN (' + liver_assesment + ')';
            flag = true;
        }
        if (fibroscan != null) {
            if (flag)
                query += ' AND ';
            query += ' IS_FibroscanLab IN (' + fibroscan + ')';
            flag = true;
        }
        if (fibrosure != null) {
            if (flag)
                query += ' AND ';
            query += ' IS_FibrosureLab IN (' + fibrosure + ')';
            flag = true;
        }
        if (liverBiopsy != null) {
            if (flag)
                query += ' AND ';
            query += ' IS_LiverBiopsyLab IN (' + liverBiopsy + ')';
            flag = true;
        }
        if (hcc != null) {
            if (flag)
                query += ' AND ';
            query += ' IS_HCCLab IN (' + hcc + ')';
            flag = true;
        }
        if (chemistry != null) {
            if (flag)
                query += ' AND ';
            query += ' IS_ChemistryLab IN (' + chemistry + ')';
            flag = true;
        }

        if (alcohol != null) {
            if (flag)
                query += ' AND ';
            query += ' ALCOHOL IN (' + alcohol + ')';
            flag = true;
        }
        if (ethnicity != null) {
            if (flag)
                query += ' AND ';
            query += ' ETHNITY_1_DESC IN (' + ethnicity + ')';
            flag = true;
        }

        if (duration != null) {
            if (flag)
                query += ' AND ';
            query += ' FIRST_ENCOUNTER ' + duration + '';
            flag = true;
        }

        if (age != null) {
            let ageFlag = false;
            if (flag)
                query += ' AND ';
            //console.log(age);
            //console.log(age.length);
            query += ' (';
            for (let i = 0; i < age.length; i++) {
                switch (age[i]) {
                    case '0-17':
                        query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 0 AND (YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) <= 17) ';
                        ageFlag = true;
                        flag = true;
                        break;
                    case '18-34':
                        if (ageFlag)
                            query += ' OR ';
                        query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 18 AND (YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) <= 34) ';
                        ageFlag = true;
                        flag = true;
                        break;
                    case '35-50':
                        if (ageFlag)
                            query += ' OR ';
                        query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 35 AND (YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) <= 50) ';
                        ageFlag = true;
                        flag = true;
                        break;
                    case '51-69':
                        if (ageFlag)
                            query += ' OR ';
                        query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 51 AND (YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) <= 69) ';
                        ageFlag = true;
                        flag = true;
                        break;
                    case '70+':
                        if (ageFlag)
                            query += ' OR ';
                        query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 70) ';
                        flag = true;
                        break;
                }
            }
            query += ') ';
        }
        if (meld != null) {
            let meldFlag = false;
            if (flag)
                query += ' AND ';
            //console.log(age);
            //console.log(age.length);
            query += ' (';
            for (let i = 0; i < meld.length; i++) {
                switch (meld[i]) {
                    case '<9':
                        query += ' (MELD_SCORE <= 9) ';
                        meldFlag = true;
                        flag = true;
                        break;
                    case '10-19':
                        if (meldFlag)
                            query += ' OR ';
                        query += ' (MELD_SCORE >= 10 AND MELD_SCORE <= 19) ';
                        meldFlag = true;
                        flag = true;
                        break;
                    case '20-29':
                        if (meldFlag)
                            query += ' OR ';
                        query += ' (MELD_SCORE >= 20 AND MELD_SCORE <= 29) ';
                        meldFlag = true;
                        flag = true;
                        break;
                    case '30-39':
                        if (meldFlag)
                            query += ' OR ';
                        query += ' (MELD_SCORE >= 30 AND MELD_SCORE <= 39) ';
                        meldFlag = true;
                        flag = true;
                        break;
                    case '40+':
                        if (meldFlag)
                            query += ' OR ';
                        query += ' (MELD_SCORE >= 40) ';
                        flag = true;
                        break;
                }
            }
            query += ') ';
        }
        if (etoh != null) {
            let etohFlag = false;
            if (flag)
                query += ' AND ';
            //console.log(age);
            //console.log(age.length);
            query += ' (';
            for (let i = 0; i < etoh.length; i++) {
                switch (etoh[i]) {
                    case '0-50':
                        if (etohFlag)
                            query += ' OR ';
                        query += ' (ETOH >= 0 AND ETOH <= 50) ';
                        etohFlag = true;
                        flag = true;
                        break;
                    case '51-299':
                        if (etohFlag)
                            query += ' OR ';
                        query += ' (ETOH >= 51 AND ETOH <= 299) ';
                        etohFlag = true;
                        flag = true;
                        break;
                    case '300-500':
                        if (etohFlag)
                            query += ' OR ';
                        query += ' (ETOH >= 300 AND ETOH <= 500) ';
                        etohFlag = true;
                        flag = true;
                        break;
                }
            }
            query += ' ) ';
        }
        if (weight != null) {
            let weightFlag = false;
            if (flag)
                query += ' AND ';
            //console.log(age);
            //console.log(age.length);
            query += ' ( ';
            for (let i = 0; i < weight.length; i++) {
                switch (weight[i]) {
                    case '0-99':
                        if (weightFlag)
                            query += ' OR ';
                        query += ' (BODY_WEIGHT >= 0 AND BODY_WEIGHT <= 99) ';
                        weightFlag = true;
                        flag = true;
                        break;
                    case '100-199':
                        if (weightFlag)
                            query += ' OR ';
                        query += ' (BODY_WEIGHT >= 100 AND BODY_WEIGHT <= 199) ';
                        weightFlag = true;
                        flag = true;
                        break;
                    case '200-299':
                        if (weightFlag)
                            query += ' OR ';
                        query += ' (BODY_WEIGHT >= 200 AND BODY_WEIGHT <= 299) ';
                        weightFlag = true;
                        flag = true;
                        break;
                    case '300-399':
                        if (weightFlag)
                            query += ' OR ';
                        query += ' (BODY_WEIGHT >= 300 AND BODY_WEIGHT <= 399) ';
                        weightFlag = true;
                        flag = true;
                        break;
                    case '400-499':
                        if (weightFlag)
                            query += ' OR ';
                        query += ' (BODY_WEIGHT >= 400 AND BODY_WEIGHT <= 499) ';
                        weightFlag = true;
                        flag = true;
                        break;
                }
            }
            query += ' ) ';
        }

        if (viralLoad != null) {
            let viralLoadFlag = false;
            if (flag)
                query += ' AND ';
            //console.log(age);
            //console.log(age.length);
            query += ' ( ';
            for (let i = 0; i < viralLoad.length; i++) {
                switch (viralLoad[i]) {
                    case '3+':
                        if (viralLoadFlag)
                            query += ' OR ';
                        query += ' (VIRAL_LOAD >= 3000000) ';
                        viralLoadFlag = true;
                        flag = true;
                        break;
                    case '2-3':
                        if (viralLoadFlag)
                            query += ' OR ';
                        query += ' (VIRAL_LOAD >= 2000000 AND VIRAL_LOAD <= 3000000) ';
                        viralLoadFlag = true;
                        flag = true;
                        break;
                    case '1-2':
                        if (viralLoadFlag)
                            query += ' OR ';
                        query += ' (VIRAL_LOAD >= 1000000 AND VIRAL_LOAD <= 2000000) ';
                        viralLoadFlag = true;
                        flag = true;
                        break;
                    case '<1':
                        if (viralLoadFlag)
                            query += ' OR ';
                        query += ' (VIRAL_LOAD <= 1000000) ';
                        viralLoadFlag = true;
                        flag = true;
                        break;
                }
            }
            query += ' ) ';
        }

        if (apri != null) {
            let apriFlag = false;
            if (flag)
                query += ' AND ';
            //console.log(age);
            //console.log(age.length);
            query += ' ( ';
            for (let i = 0; i < apri.length; i++) {
                switch (apri[i]) {
                    case '<0.5':
                        if (apriFlag)
                            query += ' OR ';
                        query += ' (APRI < 0.5) ';
                        apriFlag = true;
                        flag = true;
                        break;
                    case '0.5-1':
                        if (apriFlag)
                            query += ' OR ';
                        query += ' (APRI >= 0.5 AND APRI < 1) ';
                        apriFlag = true;
                        flag = true;
                        break;
                    case '1-1.5':
                        if (apriFlag)
                            query += ' OR ';
                        query += ' (APRI >= 1 AND APRI < 1.5) ';
                        apriFlag = true;
                        flag = true;
                        break;
                    case '1.5+':
                        if (apriFlag)
                            query += ' OR ';
                        query += ' (APRI >= 1.5) ';
                        apriFlag = true;
                        flag = true;
                        break;
                }
            }
            query += ' ) ';
        }

        // if (!flag) {
        //     query = query.replace('where', '');
        // }

        if (flag) {
            query += ' AND ';
        }
        query += ` MEDICATION <> '' `;

        if (rowNo !== null) {
            query += ' LIMIT ' + rowNo + ',1';
        } else {
            query += ' LIMIT 1';
        }

        // console.log("************************ Patient Tab Search Query **************************")
        // // console.log(query);
        liveDb.db.query(query, function(error, result) {
            if (error) {
                //console.log('error');
                callback(true, error);
            } else {
                //console.log(query,result);
                callback(undefined, result);
            }
        });
    },
    //Pram -- New filters Integration
    'searchPatients': function(params, callbackFn) {
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
            let query = ``,
                //  preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`,
                preactiveAntivalsQuery = '',
                countQuery = ``;
            //added by jayesh 26th may 2017 for showing distinct patient count and updated left join for 
            // displaying all patients.
            if (params.patientCount) {
                countQuery = `, count(distinct patients.PATIENT_ID_SYNTH) as Patient_Count `;
            }

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            let pdatabase = 'IMS_HCV_PATIENTS';
            let mdatabase = 'PATIENT_MEDICATIONS';
            query = `SELECT
                        patients.PATIENT_ID_SYNTH ,GENDER_CD ,BRTH_YR_NBR,ETHNITY_1_DESC, PAT_ZIP ,
                        RACE_DESC, ST_CD ,ALBUMIN ,ETOH ,ALCOHOL ,ALKALINE ,ALT ,APRI, AST ,BILIRUBIN ,BLOOD_UREA_NITROGEN ,
                        CALCIUM ,CARBON_DIOXIDE ,CHLIRINE ,GENOTYPE ,CIRRHOSIS ,TREATMENT ,TREATMENT_CONDITION ,CREATININE ,
                        FIBROSCANE ,HIV ,MELD_SCORE, LIVER_BIOPSY ,MENTAL_HEALTH ,POTASSIUM ,PREGNANCY ,RENAL_FAILURE ,SODIUM ,
                        PROTEIN ,patients.VIRAL_LOAD ,FIRST_ENCOUNTER ,LIVER_ASSESMENT ,BODY_WEIGHT ,BMI ,IS_HOSPITALIZED ,
                        IS_LIVER_FAILURE ,IS_DRUG_INTERACTION ,IS_ANIMIA ,patients.IDW_PATIENT_ID_SYNTH ,CLAIMS_INSURANCEPLAN, 
                        IS_FibrosureLab ,IS_LiverBiopsyLab ,IS_FibroscanLab ,IS_HCCLab ,IS_ChemistryLab ,Age,DEAD_IND ,CIRRHOSISTYPE ,
                        Liver_Disease_Cost,FibrosureValue,Physician_Service_Cost, Hospitalization_Cost, Count_PLATELET, Count_AST, Count_APRI,
                        FibrosureStage , MEDICATION,TREATMENT_PERIOD,NDC,STRT_DATE,END_DATE,DAYS_MEDICATION,SVR12,CHARGE, ALLOWED, PAID, COPAY, 
                        COINSAMT, CHARGE_MODE, ALLOWED_MODE, PAID_MODE, COPAY_MODE, COINSAMT_MODE, Symptomatic_Bradycardia,Ophthalmologic_Disorders,
                        Pulmonary_Disorders,High_ALT_Elevations,Pancreatitis,Hepatic_Failure,Bone_Marrow_Toxicity,Symptomatic_Bradycardia_COST, 
                        Ophthalmologic_Disorders_COST, Pulmonary_Disorders_COST, High_ALT_Elevations_COST,Pancreatitis_COST, Hepatic_Failure_COST, 
                        Bone_Marrow_Toxicity_COST, Neuropsychiatric_Events_COST, Neuropsychiatric_Events,PROVIDER_ID_SYNTH
                        ${countQuery}
                        FROM ${pdatabase}  as patients 
                        LEFT JOIN ${mdatabase} as medication
                        on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH where 
                        1=1
                        ${whereClause}
                        ${preactiveAntivalsQuery}
                        `;
            if (params.database) {
                if (params.database == 'PHS_HCV') {
                    pdatabase = params.database + '.PHS_HCV_PATIENTS';
                    mdatabase = params.database + '.PHS_PATIENT_MEDICATIONS';
                    query = `SELECT 
                        patients.PATIENT_ID_SYNTH ,GENDER_CD ,BRTH_YEAR_RANGE AS BRTH_YR_NBR,ETHNICITY AS ETHNITY_1_DESC, PAT_ZIP ,
                        RACE_DESC, ST_CD ,ALBUMIN ,ETOH ,ALCOHOL ,ALKALINE ,ALT ,APRI, AST ,BILIRUBIN ,BLOOD_UREA_NITROGEN ,
                        CALCIUM ,CARBON_DIOXIDE ,CHLORINE ,GENOTYPE ,CIRRHOSIS ,TREATMENT ,TREATMENT_CONDITION ,CREATININE ,
                        FIBROSCANE ,HIV ,MELD_SCORE, LIVER_BIOPSY ,MENTAL_HEALTH ,POTASSIUM ,PREGNANCY ,RENAL_FAILURE ,SODIUM ,
                        PROTEIN ,patients.VIRAL_LOAD ,FIRST_ENCOUNTER ,LIVER_ASSESMENT ,BODY_WEIGHT ,BMI ,IS_HOSPITALIZED ,
                        IS_LIVER_FAILURE ,IS_DRUG_INTERACTION ,IS_ANIMIA ,patients.UCI AS IDW_PATIENT_ID_SYNTH ,CLAIMS_INSURANCEPLAN, 
                        IS_FibrosureLab ,IS_LiverBiopsyLab ,IS_FibroscanLab ,IS_HCCLab ,IS_ChemistryLab ,AGE_RANGE AS Age,DEAD_IND ,CIRRHOSISTYPE ,
                        Liver_Disease_Cost,FibrosureValue,Physician_Service_Cost, Hospitalization_Cost, Count_PLATELET, Count_AST, Count_APRI,
                        FibrosureStage , MEDICATION,TREATMENT_PERIOD,NDC,STRT_DATE,END_DATE,DAYS_MEDICATION,SVR12,CHARGE, ALLOWED, PAID, COPAY, 
                        COINSAMT, CHARGE_MODE, ALLOWED_MODE, PAID_MODE, COPAY_MODE, COINSAMT_MODE, Symptomatic_Bradycardia,Ophthalmologic_Disorders,
                        Pulmonary_Disorders,High_ALT_Elevations,Pancreatitis,Hepatic_Failure,Bone_Marrow_Toxicity,Symptomatic_Bradycardia_COST, 
                        Ophthalmologic_Disorders_COST, Pulmonary_Disorders_COST, High_ALT_Elevations_COST,Pancreatitis_COST, Hepatic_Failure_COST, 
                        Bone_Marrow_Toxicity_COST, Neuropsychiatric_Events_COST, Neuropsychiatric_Events,PROVIDER_ID_SYNTH
                        ${countQuery}
                        FROM ${pdatabase}  as patients 
                        LEFT JOIN ${mdatabase} as medication
                        on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH where 
                        1=1
                        ${whereClause}
                        ${preactiveAntivalsQuery}
                        `;
                }
            }


            //// console.log(query);
            //For Limiting patients record based on next ,prev click

            if (params && params.rowNo) {
                query += ' LIMIT ' + params.rowNo + ',1';
            } else {
                query += ' LIMIT 1 ';
            }
            //// console.log(query);
            // console.log("************************ Patient Tab New Search Query **************************");
            // // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    //console.log('error');
                    callbackFn(true, error);
                } else {
                    //console.log(query,result);
                    //// console.log(result.length);
                    callbackFn(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    // Nisha insert screening or Treatment data into PCP DATASET 
    'INSERT_PATIENT_SCREENINGTREATMENT_DATA': function(data, callbackFn) {

        //console.log(data);
        var querycolumns = `insert into PCP_DATASET.PCP_PATIENT_SCREENINGTREATMENT
        (
        PCP_VISITID`;

        var queryvalues = ` values
        (
        1`;

        if (data.PhysicianPlan) {
            querycolumns += `,PCP_PHYSICIAN_PLAN`;
            queryvalues += `,'${data.PhysicianPlan}'`;
        }

        if (data.patientID) {
            querycolumns += `,PCP_PATIENT_ID`;
            queryvalues += `,'${data.patientID}'`;
        }

        if (data.patientIDType) {
            querycolumns += `,PCP_PATIENT_ID_TYPE`;
            queryvalues += `,'${data.patientIDType}'`;
        }

        if (data.plantype) {
            querycolumns += `,PATIENT_INSURANCETYPE`;
            queryvalues += `,'${data.plantype}'`;
        }

        if (data.birthYear) {
            querycolumns += `,PATIENT_BIRTHYEAR`;
            queryvalues += `,'${data.birthYear}'`;
        }

        if (data.intravenousDrugUser) {
            querycolumns += `,PATIENT_IS_INTRAVENOUSDRUGUSER`;
            queryvalues += `,'${data.intravenousDrugUser}'`;
        }

        if (data.HIVUser) {
            querycolumns += `,PATIENT_IS_HIV`;
            queryvalues += `,'${data.HIVUser}'`;
        }

        if (data.hemodialysisUser) {
            querycolumns += `,PATIENT_IS_HEMODIALYSIS`;
            queryvalues += `,'${data.hemodialysisUser}'`;
        }

        if (data.bloodTransUser) {
            querycolumns += `,PATIENT_IS_BLOODTRANS`;
            queryvalues += `,'${data.bloodTransUser}'`;
        }

        if (data.seriousdeseasesPatientmanSex) {
            querycolumns += `,PATIENT_IS_PATIENTMANSEX`;
            queryvalues += `,'${data.seriousdeseasesPatientmanSex}'`;
        }

        if (data.seriousdeseasesPatienthcvinfected) {
            querycolumns += `,PATIENT_IS_HCVINFECTED`;
            queryvalues += `,'${data.seriousdeseasesPatienthcvinfected}'`;
        }

        if (data.seriousdeseasesPatientwomenchildbearing) {
            querycolumns += `,PATIENT_IS_WOMENCHILDBEARING`;
            queryvalues += `,'${data.seriousdeseasesPatientwomenchildbearing}'`;
        }

        if (data.patientALT) {
            querycolumns += `,PATIENT_IS_ALT`;
            queryvalues += `,'${data.patientALT}'`;
        }

        if (data.patientStatus) {
            querycolumns += `,PATIENT_IS_PUBLICSAFETYWORKER`;
            queryvalues += `,'${data.patientStatus}'`;
        }

        if (data.patientbirth) {
            querycolumns += `,PATIENT_IS_BORNHCWOMAN`;
            queryvalues += `,'${data.patientbirth}'`;
        }

        if (data.HepaCPatient) {
            querycolumns += `,PATIENT_IS_HEAPATITISC`;
            queryvalues += `,'${data.HepaCPatient}'`;
        }

        if (data.DemographicsComments) {
            querycolumns += `,PATIENT_DEMOGRAPHICSCOMMENTS`;
            queryvalues += `,'${data.DemographicsComments}'`;
        }

        if (data.antibodyTest) {
            querycolumns += `,PATIENT_IS_ANTIBODYTEST`;
            queryvalues += `,'${data.antibodyTest}'`;
        }

        if (data.antibodyPatientTest) {
            querycolumns += `,PATIENT_ANTIBODYTESTRESULT`;
            queryvalues += `,'${data.antibodyPatientTest}'`;
        }

        if (data.txtHcvRnaTestResult) {
            querycolumns += `,PATIENT_SCREENINGHCVRNA`;
            queryvalues += `,'${data.txtHcvRnaTestResult}'`;
        }

        if (data.genotype) {
            querycolumns += `,PATIENT_SCREENINGGENOTYPE`;
            queryvalues += `,'${data.genotype}'`;
        }

        if (data.ScreeningComments) {
            querycolumns += `,PATIENT_SCREENINGCOMMENTS`;
            queryvalues += `,'${data.ScreeningComments}'`;
        }
        if (data.HcvRnaTestResultDateScreening) {
            querycolumns += `,PATIENT_SCREENING_RNARESULTDATE`;
            queryvalues += `,'${data.HcvRnaTestResultDateScreening}'`;
        }

        if (data.HcvRnaTestGenotypeDateScreening) {
            querycolumns += `,PATIENT_SCREENING_RNAGENOTYPEDATE`;
            queryvalues += `,'${data.HcvRnaTestGenotypeDateScreening}'`;
        }

        if (data.seriousdeseaseshisincarc) {
            querycolumns += `,PATIENT_IS_INCARCERATION`;
            queryvalues += `,'${data.seriousdeseaseshisincarc}'`;
        }

        if (data.genotype) {
            querycolumns += `,PATIENT_GENOTYPE`;
            queryvalues += `,'${data.genotype}'`;
        }

        if (data.cirrhosis) {
            querycolumns += `,PATIENT_CIRRHOSIS`;
            queryvalues += `,'${data.cirrhosis}'`;
        }

        if (data.treatment) {
            querycolumns += `,PATIENT_TREATMENT`;
            queryvalues += `,'${data.treatment}'`;
        }

        querycolumns += `)`;
        queryvalues += `)`;
        var query = querycolumns + queryvalues;
        // // console.log(query);
        // var result = liveDb.db.query(query);
        try {
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    // error.query = query;
                    callbackFn(true, error);
                } else {
                    callbackFn(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'UPDATE_PATIENT_SCREENINGTREATMENT_DATA': function(data, callbackFn) {

        //console.log(data);
        var querycolumns = `update PCP_DATASET.PCP_PATIENT_SCREENINGTREATMENT        
        SET PCP_VISITID = 1`;

        if (data.PhysicianPlan) {
            querycolumns += `,PCP_PHYSICIAN_PLAN = '${data.PhysicianPlan}'`;
        } else
            querycolumns += `,PCP_PHYSICIAN_PLAN = null`;

        if (data.seriousdeseaseshisincarc) {
            querycolumns += `,PATIENT_IS_INCARCERATION = '${data.seriousdeseaseshisincarc}'`;
        } else
            querycolumns += `,PATIENT_IS_INCARCERATION = null`;

        if (data.plantype) {
            querycolumns += `,PATIENT_INSURANCETYPE = '${data.plantype}'`;
        } else
            querycolumns += `,PATIENT_INSURANCETYPE = null`;

        if (data.birthYear) {
            querycolumns += `,PATIENT_BIRTHYEAR = '${data.birthYear}'`;
        } else
            querycolumns += `,PATIENT_BIRTHYEAR = null`;

        if (data.intravenousDrugUser) {
            querycolumns += `,PATIENT_IS_INTRAVENOUSDRUGUSER = '${data.intravenousDrugUser}'`;
        } else
            querycolumns += `,PATIENT_IS_INTRAVENOUSDRUGUSER = null`;

        if (data.HIVUser) {
            querycolumns += `,PATIENT_IS_HIV = '${data.HIVUser}'`;
        } else
            querycolumns += `,PATIENT_IS_HIV = null`;

        if (data.hemodialysisUser) {
            querycolumns += `,PATIENT_IS_HEMODIALYSIS = '${data.hemodialysisUser}'`;
        } else
            querycolumns += `,PATIENT_IS_HEMODIALYSIS = null`;

        if (data.bloodTransUser) {
            querycolumns += `,PATIENT_IS_BLOODTRANS = '${data.bloodTransUser}'`;
        } else
            querycolumns += `,PATIENT_IS_BLOODTRANS = null`;

        if (data.seriousdeseasesPatientmanSex) {
            querycolumns += `,PATIENT_IS_PATIENTMANSEX = '${data.seriousdeseasesPatientmanSex}'`;
        } else
            querycolumns += `,PATIENT_IS_PATIENTMANSEX = null`;

        if (data.seriousdeseasesPatienthcvinfected) {
            querycolumns += `,PATIENT_IS_HCVINFECTED = '${data.seriousdeseasesPatienthcvinfected}'`;
        } else
            querycolumns += `,PATIENT_IS_HCVINFECTED = null`;

        if (data.seriousdeseasesPatientwomenchildbearing) {
            querycolumns += `,PATIENT_IS_WOMENCHILDBEARING = '${data.seriousdeseasesPatientwomenchildbearing}'`;
        } else
            querycolumns += `,PATIENT_IS_WOMENCHILDBEARING = null`;

        if (data.patientALT) {
            querycolumns += `,PATIENT_IS_ALT = '${data.patientALT}'`;
        } else
            querycolumns += `,PATIENT_IS_ALT = null`;

        if (data.patientStatus) {
            querycolumns += `,PATIENT_IS_PUBLICSAFETYWORKER = '${data.patientStatus}'`;
        } else
            querycolumns += `,PATIENT_IS_PUBLICSAFETYWORKER = null`;

        if (data.patientbirth) {
            querycolumns += `,PATIENT_IS_BORNHCWOMAN = '${data.patientbirth}'`;
        } else
            querycolumns += `,PATIENT_IS_BORNHCWOMAN = null`;

        if (data.HepaCPatient) {
            querycolumns += `,PATIENT_IS_HEAPATITISC = '${data.HepaCPatient}'`;
        } else
            querycolumns += `,PATIENT_IS_HEAPATITISC = null`;

        if (data.seriousdeseaseshisincarc) {
            querycolumns += `,PATIENT_IS_INCARCERATION = '${data.seriousdeseaseshisincarc}'`;
        } else
            querycolumns += `,PATIENT_IS_INCARCERATION = null`;

        if (data.DemographicsComments) {
            querycolumns += `,PATIENT_DEMOGRAPHICSCOMMENTS = '${data.DemographicsComments}'`;
        } else
            querycolumns += `,PATIENT_DEMOGRAPHICSCOMMENTS = null`;

        if (data.antibodyTest) {
            querycolumns += `,PATIENT_IS_ANTIBODYTEST = '${data.antibodyTest}'`;
        } else
            querycolumns += `,PATIENT_IS_ANTIBODYTEST = null`;

        if (data.antibodyPatientTest) {
            querycolumns += `,PATIENT_ANTIBODYTESTRESULT = '${data.antibodyPatientTest}'`;
        } else
            querycolumns += `,PATIENT_ANTIBODYTESTRESULT = null`;

        if (data.txtHcvRnaTestResult) {
            querycolumns += `,PATIENT_SCREENINGHCVRNA = '${data.txtHcvRnaTestResult}'`;
        } else
            querycolumns += `,PATIENT_SCREENINGHCVRNA = null`;

        if (data.genotype && data.PhysicianPlan == "Screening") {
            querycolumns += `,PATIENT_SCREENINGGENOTYPE = '${data.genotype}'`;
        } else
            querycolumns += `,PATIENT_SCREENINGGENOTYPE = null`;

        if (data.ScreeningComments) {
            querycolumns += `,PATIENT_SCREENINGCOMMENTS = '${data.ScreeningComments}'`;
        } else
            querycolumns += `,PATIENT_SCREENINGCOMMENTS = null`;

        if (data.HcvRnaTestResultDateScreening) {
            querycolumns += `,PATIENT_SCREENING_RNARESULTDATE = '${data.HcvRnaTestResultDateScreening}'`;
        } else
            querycolumns += `,PATIENT_SCREENING_RNARESULTDATE = null`;

        if (data.HcvRnaTestGenotypeDateScreening) {
            querycolumns += `,PATIENT_SCREENING_RNAGENOTYPEDATE = '${data.HcvRnaTestGenotypeDateScreening}'`;
        } else
            querycolumns += `,PATIENT_SCREENING_RNAGENOTYPEDATE = null`;

        if (data.genotype) {
            querycolumns += `,PATIENT_GENOTYPE = '${data.genotype}'`;
        } else
            querycolumns += `,PATIENT_GENOTYPE = null`;

        if (data.cirrhosis) {
            querycolumns += `,PATIENT_CIRRHOSIS = '${data.cirrhosis}'`;
        } else
            querycolumns += `,PATIENT_CIRRHOSIS = null`;

        if (data.treatment) {
            querycolumns += `,PATIENT_TREATMENT = '${data.treatment}'`;
        } else
            querycolumns += `,PATIENT_TREATMENT = null`;

        if (data.txtHcvRnaTestResultEval) {
            querycolumns += `,PATIENT_EVALUATIONHCVRNA = '${data.txtHcvRnaTestResultEval}'`;
        } else
            querycolumns += `,PATIENT_EVALUATIONHCVRNA = null`;

        if (data.genotype && data.PhysicianPlan == "Treatment") {
            querycolumns += `,PATIENT_EVALUATIONGENOTYPE = '${data.genotype}'`;
        } else
            querycolumns += `,PATIENT_EVALUATIONGENOTYPE = null`;

        if (data.txtEvalRNAResultDate) {
            querycolumns += `,PATIENT_EVALUATIONRNARESULTDATE = '${data.txtEvalRNAResultDate}'`;
        } else
            querycolumns += `,PATIENT_EVALUATIONRNARESULTDATE = null`;

        if (data.HcvRnaTestGenotypeDateEval) {
            querycolumns += `,PATIENT_EVALUATIONRNAGENOTYPEDATE = '${data.HcvRnaTestGenotypeDateEval}'`;
        } else
            querycolumns += `,PATIENT_EVALUATIONRNAGENOTYPEDATE = null`;

        if (data.alcoholTest) {
            querycolumns += `,PATIENT_IS_ALCOHOLTEST = '${data.alcoholTest}'`;
        } else
            querycolumns += `,PATIENT_IS_ALCOHOLTEST = null`;

        if (data.alcoholstoppedperiod) {
            querycolumns += `,PATIENT_ALCOHOLPERIOD = '${data.alcoholstoppedperiod}'`;
        } else
            querycolumns += `,PATIENT_ALCOHOLPERIOD = null`;

        if (data.alcoholstoppedperiodtype) {
            querycolumns += `,PATIENT_ALCOHOLPERIODTYPE = '${data.alcoholstoppedperiodtype}'`;
        } else
            querycolumns += `,PATIENT_ALCOHOLPERIODTYPE = null`;

        if (data.seriousdeseasesFibrosisTest) {
            querycolumns += `,PATIENT_IS_SERIOUSDESEASESFIBROSISTEST = '${data.seriousdeseasesFibrosisTest}'`;
        } else
            querycolumns += `,PATIENT_IS_SERIOUSDESEASESFIBROSISTEST = null`;


        if (data.FibroStage) {
            querycolumns += `,PATIENT_FIROSISSTAGE = '${data.FibroStage}'`;
        } else
            querycolumns += `,PATIENT_FIROSISSTAGE = null`;

        if (data.txtFibroscanScore) {
            querycolumns += `,PATIENT_FIBROSCANSCORE = '${data.txtFibroscanScore}'`;
        } else
            querycolumns += `,PATIENT_FIBROSCANSCORE = null`;

        if (data.txtFibrosistestScore) {
            querycolumns += `,PATIENT_FIBROSISTESTSCORE = '${data.txtFibrosistestScore}'`;
        } else
            querycolumns += `,PATIENT_FIBROSISTESTSCORE = null`;

        if (data.txtAPRIscore) {
            querycolumns += `,PATIENT_APRISCORE = '${data.txtAPRIscore}'`;
        } else
            querycolumns += `,PATIENT_APRISCORE = null`;


        if (data.txtFibroMeterscore) {
            querycolumns += `,PATIENT_FIBROMETERSCORE = '${data.txtFibroMeterscore}'`;
        } else
            querycolumns += `,PATIENT_FIBROMETERSCORE = null`;

        if (data.CommChildPughTest) {
            querycolumns += `,PATIENT_IS_COMMCHILDPUGHTEST = '${data.CommChildPughTest}'`;
        } else
            querycolumns += `,PATIENT_IS_COMMCHILDPUGHTEST = null`;

        if (data.txtChildPughscore) {
            querycolumns += `,PATIENT_CHILDPUGHSCORE = '${data.txtChildPughscore}'`;
        } else
            querycolumns += `,PATIENT_CHILDPUGHSCORE = null`;

        if (data.txtMELDscore) {
            querycolumns += `,PATIENT_MELDSCORE = '${data.txtMELDscore}'`;
        } else
            querycolumns += `,PATIENT_MELDSCORE = null`;


        if (data.CommChildPughTestchartnote) {
            querycolumns += `,PATIENT_IS_CHARTNOTE = '${data.CommChildPughTestchartnote}'`;
        } else
            querycolumns += `,PATIENT_IS_CHARTNOTE = null`;

        if (data.CommChildPughTestchartnoteFile != null) {
            querycolumns += `,PATIENT_COMMCHILDPUGHTESTFILE = '${data.CommChildPughTest}'`;
        } else
            querycolumns += `,PATIENT_COMMCHILDPUGHTESTFILE = 'null'`;

        if (data.seriousdeseasesLymphomaTest) {
            querycolumns += `,PATIENT_IS_LYMPHOMATEST = '${data.seriousdeseasesLymphomaTest}'`;
        } else
            querycolumns += `,PATIENT_IS_LYMPHOMATEST = null`;

        if (data.seriousdeseasesRenalinsufficiencyTest) {
            querycolumns += `,PATIENT_IS_RENALINSUFFICIENCYTEST = '${data.seriousdeseasesRenalinsufficiencyTest}'`;
        } else
            querycolumns += `,PATIENT_IS_RENALINSUFFICIENCYTEST = null`;


        if (data.seriousdeseasesCryoglobulinemiaTest) {
            querycolumns += `,PATIENT_IS_CRYOGLOBULINEMIATEST = '${data.seriousdeseasesCryoglobulinemiaTest}'`;
        } else
            querycolumns += `,PATIENT_IS_CRYOGLOBULINEMIATEST = null`;

        if (data.seriousdeseasesLivertransplantTest) {
            querycolumns += `,PATIENT_IS_LIVERTRANSPLANTTEST = '${data.CommChildPughTest}'`;
        } else
            querycolumns += `,PATIENT_IS_LIVERTRANSPLANTTEST = null`;

        if (data.seriousdeseasesMediHIV1Co) {
            querycolumns += `,PATIENT_IS_MEDIHIV1CO = '${data.seriousdeseasesMediHIV1Co}'`;
        } else
            querycolumns += `,PATIENT_IS_MEDIHIV1CO = null`;

        if (data.seriousdeseasesMediHEPAB) {
            querycolumns += `,PATIENT_IS_MEDIHEPAB = '${data.seriousdeseasesMediHEPAB}'`;
        } else
            querycolumns += `,PATIENT_IS_MEDIHEPAB = null`;


        if (data.seriousdeseasesMediType2Diabetes) {
            querycolumns += `,PATIENT_IS_MEDITYPE2DIABETES = '${data.seriousdeseasesMediType2Diabetes}'`;
        } else
            querycolumns += `,PATIENT_IS_MEDITYPE2DIABETES = null`;

        if (data.seriousdeseasesMediPorphyria) {
            querycolumns += `,PATIENT_IS_MEDIPORPHYRIA = '${data.CommChildPughTest}'`;
        } else
            querycolumns += `,PATIENT_IS_MEDIPORPHYRIA = null`;

        if (data.treatmentexperienced) {
            querycolumns += `,PATIENT_IS_TREATMENTEXPERICED = '${data.treatmentexperienced}'`;
        } else
            querycolumns += `,PATIENT_IS_TREATMENTEXPERICED = null`;

        if (data.txtEvalutionrequiresSpecialist) {
            querycolumns += `,PATIENT_EVALUTIONREQUIRESSPECIALISTCOMMENTS = '${data.txtEvalutionrequiresSpecialist}'`;
        } else
            querycolumns += `,PATIENT_EVALUTIONREQUIRESSPECIALISTCOMMENTS = null`;


        if (data.listtreatmentregimen) {
            querycolumns += `,PATIENT_LISTTREATMENTREGIMEN = '${data.listtreatmentregimen}'`;
        } else
            querycolumns += `,PATIENT_LISTTREATMENTREGIMEN = null`;

        if (data.completeregimen) {
            querycolumns += `,PATIENT_COMPLETEREGIMEN = '${data.completeregimen}'`;
        } else
            querycolumns += `,PATIENT_COMPLETEREGIMEN = null`;

        if (data.reasondiscontinue) {
            querycolumns += `,PATIENT_REASONOFDISCONTINUATION = '${data.reasondiscontinue}'`;
        } else
            querycolumns += `,PATIENT_REASONOFDISCONTINUATION = null`;


        if (data.patientresponse) {
            querycolumns += `,PATIENT_THERAPYRESPONSE = '${data.patientresponse}'`;
        } else
            querycolumns += `,PATIENT_THERAPYRESPONSE = null`;


        if (data.txtHCVRNAWeekDurationResponse) {
            querycolumns += `,PATIENT_THERAPYRESPONSE_HCVRNA = '${data.txtHCVRNAWeekDurationResponse}'`;
        } else
            querycolumns += `,PATIENT_THERAPYRESPONSE_HCVRNA = null`;

        if (data.txtHcvRnaTestResultResponse) {
            querycolumns += `,PATIENT_THERAPYRESPONSE_HCVRNARESULT = '${data.txtHcvRnaTestResultResponse}'`;
        } else
            querycolumns += `,PATIENT_THERAPYRESPONSE_HCVRNARESULT = null`;

        if (data.documentedfatigue) {
            querycolumns += `,PATIENT_DOCUMENTEDFATIGUE = '${data.documentedfatigue}'`;
        } else
            querycolumns += `,PATIENT_DOCUMENTEDFATIGUE = null`;

        if (data.EvalHepaBantigen) {
            querycolumns += `,PATIENT_EVALHEPABANTIGEN = '${data.EvalHepaBantigen}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABANTIGEN = null`;


        if (data.EvalHepaBantigenDate) {
            querycolumns += `,PATIENT_EVALHEPABANTIGENDATE = '${data.EvalHepaBantigenDate}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABANTIGENDATE = null`;

        if (data.EvalHepaBantigenfile != null) {
            querycolumns += `,PATIENT_EVALHEPABANTIGENFILE = '${data.EvalHepaBantigenfile}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABANTIGENFILE = 'null'`;

        if (data.EvalHepaBantibody) {
            querycolumns += `,PATIENT_EVALHEPABANTIBODY = '${data.EvalHepaBantibody}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABANTIBODY = null`;


        if (data.EvalHepaBantibodyDate) {
            querycolumns += `,PATIENT_EVALHEPABANTIBODYDATE = '${data.EvalHepaBantibodyDate}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABANTIBODYDATE = null`;

        if (data.EvalHepaBantibodyfile != null) {
            querycolumns += `,PATIENT_EVALHEPABANTIBODYFILE = '${data.EvalHepaBantibodyfile}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABANTIBODYFILE = 'null'`;

        if (data.EvalHepaBcoreantibodytotal) {
            querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTAL = '${data.EvalHepaBcoreantibodytotal}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTAL = null`;


        if (data.EvalHepaBcoreantibodytotalDate) {
            querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTALDATE = '${data.EvalHepaBcoreantibodytotalDate}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTALDATE = null`;

        if (data.EvalHepaBcoreantibodytotalfile != null) {
            querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTALFILE = '${data.EvalHepaBcoreantibodytotalfile}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTALFILE = 'null'`;

        if (data.EvalHepaAantibody) {
            querycolumns += `,PATIENT_EVALHEPAANTIBODY = '${data.EvalHepaAantibody}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPAANTIBODY = null`;


        if (data.EvalHepaAantibodyDate) {
            querycolumns += `,PATIENT_EVALHEPAANTIBODYDATE = '${data.EvalHepaAantibodyDate}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPAANTIBODYDATE = null`;

        if (data.EvalHepaAantibodyfile != null) {
            querycolumns += `,PATIENT_EVALHEPAANTIBODYFILE = '${data.EvalHepaAantibodyfile}'`;
        } else
            querycolumns += `,PATIENT_EVALHEPAANTIBODYFILE = 'null'`;

        if (data.EvalHIVantibody) {
            querycolumns += `,PATIENT_EVALHIVANTIBODY = '${data.EvalHIVantibody}'`;
        } else
            querycolumns += `,PATIENT_EVALHIVANTIBODY = null`;


        if (data.EvalHIVantibodyDate) {
            querycolumns += `,PATIENT_EVALHIVANTIBODYDATE = '${data.EvalHIVantibodyDate}'`;
        } else
            querycolumns += `,PATIENT_EVALHIVANTIBODYDATE = null`;

        if (data.EvalHIVantibodyfile != null) {
            querycolumns += `,PATIENT_EVALHIVANTIBODYFILE = '${data.EvalHIVantibodyfile}'`;
        } else
            querycolumns += `,PATIENT_EVALHIVANTIBODYFILE = 'null'`;

        if (data.EvalNS5Apolymorphisms) {
            querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMS = '${data.EvalNS5Apolymorphisms}'`;
        } else
            querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMS = null`;

        if (data.EvalNS5Apolymorphismsflag) {
            querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMSDATE = '${data.EvalNS5Apolymorphismsflag}'`;
        } else
            querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMSDATE = null`;


        if (data.EvalNS5ApolymorphismsDate) {
            querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMSDATE = '${data.EvalNS5ApolymorphismsDate}'`;
        } else
            querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMSDATE = null`;

        if (data.EvalNS5Apolymorphismsfile != null) {
            querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMSFILE = '${data.EvalNS5Apolymorphismsfile}'`;
        } else
            querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMSFILE = 'null'`;

        if (data.EvalASTUpperLimit) {
            querycolumns += `,PATIENT_EVALASTUPPERLIMIT = '${data.EvalASTUpperLimit}'`;
        } else
            querycolumns += `,PATIENT_EVALASTUPPERLIMIT = null`;

        if (data.EvalASTLowerLimit) {
            querycolumns += `,PATIENT_EVALASTLOWERLIMIT = '${data.EvalASTLowerLimit}'`;
        } else
            querycolumns += `,PATIENT_EVALASTLOWERLIMIT = null`;


        if (data.EvalASTLimitDate) {
            querycolumns += `,PATIENT_EVALASTLIMITDATE = '${data.EvalASTLimitDate}'`;
        } else
            querycolumns += `,PATIENT_EVALASTLIMITDATE = null`;

        if (data.EvalASTLimitfile != null) {
            querycolumns += `,PATIENT_EVALASTLIMITFILE = '${data.EvalASTLimitfile}'`;
        } else
            querycolumns += `,PATIENT_EVALASTLIMITFILE = 'null'`;

        if (data.EvalALTUpperLimit) {
            querycolumns += `,PATIENT_EVALALTUPPERLIMIT = '${data.EvalALTUpperLimit}'`;
        } else
            querycolumns += `,PATIENT_EVALALTUPPERLIMIT = null`;

        if (data.EvalALTLowerLimit) {
            querycolumns += `,PATIENT_EVALALTLOWERLIMIT = '${data.EvalALTLowerLimit}'`;
        } else
            querycolumns += `,PATIENT_EVALALTLOWERLIMIT = null`;


        if (data.EvalALTLimitDate) {
            querycolumns += `,PATIENT_EVALALTLIMITDATE = '${data.EvalALTLimitDate}'`;
        } else
            querycolumns += `,PATIENT_EVALALTLIMITDATE = null`;

        if (data.EvalALTLimitfile != null) {
            querycolumns += `,PATIENT_EVALALTLIMITFILE = '${data.EvalALTLimitfile}'`;
        } else
            querycolumns += `,PATIENT_EVALALTLIMITFILE = 'null'`;

        if (data.EvalBilirubin) {
            querycolumns += `,PATIENT_EVALBILIRUBIN = '${data.EvalBilirubin}'`;
        } else
            querycolumns += `,PATIENT_EVALBILIRUBIN = null`;


        if (data.EvalBilirubinDate) {
            querycolumns += `,PATIENT_EVALBILIRUBINDATE = '${data.EvalBilirubinDate}'`;
        } else
            querycolumns += `,PATIENT_EVALBILIRUBINDATE = null`;

        if (data.EvalBilirubinfile != null) {
            querycolumns += `,PATIENT_EVALBILIRUBINFILE = '${data.EvalBilirubinfile}'`;
        } else
            querycolumns += `,PATIENT_EVALBILIRUBINFILE = 'null'`;

        if (data.EvalAlbumin) {
            querycolumns += `,PATIENT_EVALALBUMIN = '${data.EvalAlbumin}'`;
        } else
            querycolumns += `,PATIENT_EVALALBUMIN = null`;


        if (data.EvalAlbuminDate) {
            querycolumns += `,PATIENT_EVALALBUMINDATE = '${data.EvalAlbuminDate}'`;
        } else
            querycolumns += `,PATIENT_EVALALBUMINDATE = null`;

        if (data.EvalAlbuminfile != null) {
            querycolumns += `,PATIENT_EVALALBUMINFILE = '${data.EvalAlbuminfile}'`;
        } else
            querycolumns += `,PATIENT_EVALALBUMINFILE = 'null'`;


        if (data.EvalINR) {
            querycolumns += `,PATIENT_EVALINR = '${data.EvalINR}'`;
        } else
            querycolumns += `,PATIENT_EVALINR = null`;


        if (data.EvalINRDate) {
            querycolumns += `,PATIENT_EVALINRDATE = '${data.EvalINRDate}'`;
        } else
            querycolumns += `,PATIENT_EVALINRDATE = null`;

        if (data.EvalINRfile != null) {
            querycolumns += `,PATIENT_EVALINRFILE = '${data.EvalINRfile}'`;
        } else
            querycolumns += `,PATIENT_EVALINRFILE = 'null'`;


        if (data.EvalSerumCr) {
            querycolumns += `,PATIENT_EVALSERUMCR = '${data.EvalSerumCr}'`;
        } else
            querycolumns += `,PATIENT_EVALSERUMCR = null`;


        if (data.EvalSerumCrDate) {
            querycolumns += `,PATIENT_EVALSERUMCRDATE = '${data.EvalSerumCrDate}'`;
        } else
            querycolumns += `,PATIENT_EVALSERUMCRDATE = null`;

        if (data.EvalSerumCrfile != null) {
            querycolumns += `,PATIENT_EVALSERUMCRFILE = '${data.EvalSerumCrfile}'`;
        } else
            querycolumns += `,PATIENT_EVALSERUMCRFILE = 'null'`;


        if (data.EvalAST) {
            querycolumns += `,PATIENT_EVALAST = '${data.EvalAST}'`;
        } else
            querycolumns += `,PATIENT_EVALAST = null`;


        if (data.EvalASTDate) {
            querycolumns += `,PATIENT_EVALASTDATE = '${data.EvalASTDate}'`;
        } else
            querycolumns += `,PATIENT_EVALASTDATE = null`;

        if (data.EvalASTfile != null) {
            querycolumns += `,PATIENT_EVALASTFILE = '${data.EvalASTfile}'`;
        } else
            querycolumns += `,PATIENT_EVALASTFILE = 'null'`;

        if (data.EvalALT) {
            querycolumns += `,PATIENT_EVALALT = '${data.EvalALT}'`;
        } else
            querycolumns += `,PATIENT_EVALALT = null`;


        if (data.EvalALTDate) {
            querycolumns += `,PATIENT_EVALALTDATE = '${data.EvalALTDate}'`;
        } else
            querycolumns += `,PATIENT_EVALALTDATE = null`;

        if (data.EvalALTfile != null) {
            querycolumns += `,PATIENT_EVALALTFILE = '${data.EvalALTfile}'`;
        } else
            querycolumns += `,PATIENT_EVALALTFILE = 'null'`;


        if (data.EvalHemoglobin) {
            querycolumns += `,PATIENT_EVALHEMOGLOBIN = '${data.EvalHemoglobin}'`;
        } else
            querycolumns += `,PATIENT_EVALHEMOGLOBIN = null`;


        if (data.EvalHemoglobinDate) {
            querycolumns += `,PATIENT_EVALHEMOGLOBINDATE = '${data.EvalHemoglobinDate}'`;
        } else
            querycolumns += `,PATIENT_EVALHEMOGLOBINDATE = null`;

        if (data.EvalHemoglobinfile != null) {
            querycolumns += `,PATIENT_EVALHEMOGLOBINFILE = '${data.EvalHemoglobinfile}'`;
        } else
            querycolumns += `,PATIENT_EVALHEMOGLOBINFILE = 'null'`;

        if (data.EvalPlatelets) {
            querycolumns += `,PATIENT_EVALPLATELETS = '${data.EvalPlatelets}'`;
        } else
            querycolumns += `,PATIENT_EVALPLATELETS = null`;


        if (data.EvalPlateletsDate) {
            querycolumns += `,PATIENT_EVALPLATELETSDATE = '${data.EvalPlateletsDate}'`;
        } else
            querycolumns += `,PATIENT_EVALPLATELETSDATE = null`;

        if (data.EvalPlateletsfile != null) {
            querycolumns += `,PATIENT_EVALPLATELETSFILE = '${data.EvalPlateletsfile}'`;
        } else
            querycolumns += `,PATIENT_EVALPLATELETSFILE = 'null'`;

        if (data.EvalWBC) {
            querycolumns += `,PATIENT_EVALWBC = '${data.EvalWBC}'`;
        } else
            querycolumns += `,PATIENT_EVALWBC = null`;


        if (data.EvalWBCDate) {
            querycolumns += `,PATIENT_EVALWBCDATE = '${data.EvalWBCDate}'`;
        } else
            querycolumns += `,PATIENT_EVALWBCDATE = null`;

        if (data.EvalWBCfile != null) {
            querycolumns += `,PATIENT_EVALWBCFILE = '${data.EvalWBCfile}'`;
        } else
            querycolumns += `,PATIENT_EVALWBCFILE = 'null'`;

        if (data.patientScreeningAlcohol) {
            querycolumns += `,PATIENT_IS_ALCHOHOLSCREENINGTEST = '${data.patientScreeningAlcohol}'`;
        } else
            querycolumns += `,PATIENT_IS_ALCHOHOLSCREENINGTEST = null`;

        if (data.patientEvaluationAlcoholFile != null) {
            querycolumns += `,PATIENT_ALCOHOLSCEENINGFILE = '${data.patientEvaluationAlcoholFile}'`;
        } else
            querycolumns += `,PATIENT_ALCOHOLSCEENINGFILE = 'null'`;

        if (data.realWorldEvidenceDrugs) {
            querycolumns += `,PATIENT_PCP_REALWORLDEVIDENCE = '${data.realWorldEvidenceDrugs}'`;
        } else
            querycolumns += `,PATIENT_PCP_REALWORLDEVIDENCE = null`;

        if (data.recommendedTreatmentForPatient) {
            querycolumns += `,PATIENT_PCP_TREATMENTRECOMMENTDATIONS = '${data.recommendedTreatmentForPatient}'`;
        } else
            querycolumns += `,PATIENT_PCP_TREATMENTRECOMMENTDATIONS = null`;

        querycolumns += ` where PCP_PATIENT_ID='${data.patientID}' and PCP_PATIENT_ID_TYPE= '${data.patientIDType}'`;


        // console.log(querycolumns);

        var query = querycolumns;
        // // console.log(query);
        // var result = liveDb.db.query(query);
        try {
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    // error.query = query;
                    callbackFn(true, error);
                } else {
                    callbackFn(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'INSERT_PATIENT_TREATMENT_DATA': function(data, callbackFn) {
        try {

            let query = screeningEvaluationTreatmentQuery(data);
            //// console.log(query);
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callbackFn(true, error);
                } else {
                    callbackFn(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'searchScreeningPatientData': function(params, callbackFn) {
        try {

            let wherClause = ``;
            if (params) {
                if (params['PCP_PATIENT_ID']) {
                    wherClause += ` WHERE PCP_PATIENT_ID = ${params['PCP_PATIENT_ID']} AND PCP_PATIENT_ID_TYPE = "${params['PCP_PATIENT_ID_TYPE']}" `;
                }
            }

            let query = `select * from PCP_DATASET.PCP_PATIENT_SCREENINGTREATMENT ${wherClause} limit 1`;
            //// console.log(query);
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callbackFn(true, error);
                } else {
                    //console.log(result);
                    callbackFn(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    //Praveen 17 April 2017 To save PCP model feedback form data.
    'saveFeedackElectronicForm': function(param, callbackFn) {
        let query = ``;
        try {
            if (param) {
                query = `INSERT INTO  PCP_DATASET.FeedbackElectronicForm 
                         (email,feedbackType,date) values('${param.email}','${param.feedback}','${param.time}');`
            }
            //// console.log(query);
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callbackFn(true, error);
                } else {
                    //console.log(result);
                    callbackFn(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
});

//Added comment by Arvind 16-FEB-2017, Need to review about below Meteor methods which is no longer used
Meteor.methods({
    'insert_data': function(data) {
        //data in json format
        /*	var column = '';
        	var valued = [];
        	var quest = '';
        	for (var key in data) {
        		column += key + ',';
        		valued.push(data[key]);
        		quest += " ? ,";
        	}
        	column = column.substr(0, column.length - 1) + " ";
        	quest = quest.substr(0, quest.length - 1) + " ";
        	var result = liveDb.db.query('insert into sample_patients ( ' + column + ' ) values ( ' + quest + ' )', valued);
        	Patient.changed();
        	PatientDataList.changed();
        	PatientDataList.depend();*/
    },
    'SearchFromDbList': function(id) {
        // // Find the selected player in the array of results
        // PatientDataList.depend();
        // PatientDataList.filter(function (Patient) {
        //     return Patient.PatientID == id;
        // });

    },
    'select_data': function(data, table, where_clause) {
        // //data in string format
        // liveDb.db.query(
        //     'select ' + data + ' from ' + table + ' ' + where_clause);
    },
    'generatePatientIDForNewRecord': function() {
        /*Patient.depend();
        Patient.changed();
        var Patientid = '';
        var PatientID1 = Patient.reactive().filter(function(patient) {
        	Patientid = patient.PatientID;

        })[0];
        var temp = Patientid.split('EMR');
        var PatientID = 'EMR' + (parseInt(temp[1]) + 1);
        var result = liveDb.db.query('insert into sample_patients ( PatientID ) values ( ? )', [PatientID]);
        var result_delete = liveDb.db.query('update sample_patients set date_added =  ?  where patientid=?', [new Date(), PatientID]);
        Patient.changed();
        console.log(Patient);
        return PatientID;*/
        return 0;
    },
    'update_data': function(data, table, PatientID) {
        /*	var query = '';
        	var temp = [];
        	Patient.depend();
        	for (var key in data) {
        		query += key + " = ? , ";

        		temp.push(data[key]);
        	}
        	temp.push(PatientID);
        	query = query.substr(0, query.length - 2);

        	if (PatientID && PatientID !== '') {
        		var result = liveDb.db.query(
        			'UPDATE ' + table + ' SET ' + query + ' WHERE PatientID = ?', temp);

        	}
        	Patient.changed();
        	PatientDataList.changed();
        	PatientDataList.depend();*/
    },
    getCurrentTime: function() {
        // console.log('on server, getCurrentTime called');
        return new Date();
    },
    welcome: function(name) {

        if (name === undefined || name.length <= 0) {
            throw new Meteor.Error(404, "Please enter your name");
        }
        return "Welcome " + name;
    },
    PatientList: function() {
        // PatientList.depend();
        // Pages.insert({}, callback);
        // return PatientList.reactive();
    },

});


let screeningEvaluationTreatmentQuery = (data) => {
    let querycolumns = `insert into PCP_DATASET.PCP_PATIENT_SCREENINGTREATMENT
                (
                PCP_VISITID`;

    var queryvalues = ` values
                (
                1`;


    if (data.PhysicianPlan) {
        querycolumns += `,PCP_PHYSICIAN_PLAN`;
        queryvalues += `,'${data.PhysicianPlan}'`;
    }

    if (data.patientID) {
        querycolumns += `,PCP_PATIENT_ID`;
        queryvalues += `,'${data.patientID}'`;
    }

    if (data.patientIDType) {
        querycolumns += `,PCP_PATIENT_ID_TYPE`;
        queryvalues += `,'${data.patientIDType}'`;
    }

    if (data.plantype) {
        querycolumns += `,PATIENT_INSURANCETYPE`;
        queryvalues += `,'${data.plantype}'`;
    }

    if (data.birthYear) {
        querycolumns += `,PATIENT_BIRTHYEAR`;
        queryvalues += `,'${data.birthYear}'`;
    }

    if (data.intravenousDrugUser) {
        querycolumns += `,PATIENT_IS_INTRAVENOUSDRUGUSER`;
        queryvalues += `,'${data.intravenousDrugUser}'`;
    }

    if (data.HIVUser) {
        querycolumns += `,PATIENT_IS_HIV`;
        queryvalues += `,'${data.HIVUser}'`;
    }

    if (data.hemodialysisUser) {
        querycolumns += `,PATIENT_IS_HEMODIALYSIS`;
        queryvalues += `,'${data.hemodialysisUser}'`;
    }

    if (data.bloodTransUser) {
        querycolumns += `,PATIENT_IS_BLOODTRANS`;
        queryvalues += `,'${data.bloodTransUser}'`;
    }

    if (data.seriousdeseasesPatientmanSex) {
        querycolumns += `,PATIENT_IS_PATIENTMANSEX`;
        queryvalues += `,'${data.seriousdeseasesPatientmanSex}'`;
    }

    if (data.seriousdeseasesPatienthcvinfected) {
        querycolumns += `,PATIENT_IS_HCVINFECTED`;
        queryvalues += `,'${data.seriousdeseasesPatienthcvinfected}'`;
    }

    if (data.seriousdeseasesPatientwomenchildbearing) {
        querycolumns += `,PATIENT_IS_WOMENCHILDBEARING`;
        queryvalues += `,'${data.seriousdeseasesPatientwomenchildbearing}'`;
    }

    if (data.seriousdeseaseshisincarc) {
        querycolumns += `,PATIENT_IS_INCARCERATION`;
        queryvalues += `,'${data.seriousdeseaseshisincarc}'`;
    }

    if (data.patientALT) {
        querycolumns += `,PATIENT_IS_ALT`;
        queryvalues += `,'${data.patientALT}'`;
    }

    if (data.patientStatus) {
        querycolumns += `,PATIENT_IS_PUBLICSAFETYWORKER`;
        queryvalues += `,'${data.patientStatus}'`;
    }

    if (data.patientbirth) {
        querycolumns += `,PATIENT_IS_BORNHCWOMAN`;
        queryvalues += `,'${data.patientbirth}'`;
    }

    if (data.HepaCPatient) {
        querycolumns += `,PATIENT_IS_HEAPATITISC`;
        queryvalues += `,'${data.HepaCPatient}'`;
    }

    if (data.DemographicsComments) {
        querycolumns += `,PATIENT_DEMOGRAPHICSCOMMENTS`;
        queryvalues += `,'${data.DemographicsComments}'`;
    }

    if (data.antibodyTest) {
        querycolumns += `,PATIENT_IS_ANTIBODYTEST`;
        queryvalues += `,'${data.antibodyTest}'`;
    }

    if (data.antibodyPatientTest) {
        querycolumns += `,PATIENT_ANTIBODYTESTRESULT`;
        queryvalues += `,'${data.antibodyPatientTest}'`;
    }

    //  Commented as Treatment will not have Screening details.
    // if (data.txtHcvRnaTestResult) {
    //     querycolumns += `,PATIENT_SCREENINGHCVRNA`;
    //     queryvalues += `,'${data.txtHcvRnaTestResult}'`;
    // }

    // if (data.HcvRnaTestResultDateScreening) {
    //     querycolumns += `,PATIENT_SCREENING_RNARESULTDATE`;
    //     queryvalues += `,'${data.HcvRnaTestResultDateScreening}'`;
    // }

    // if (data.genotype) {
    //     querycolumns += `,PATIENT_SCREENINGGENOTYPE`;
    //     queryvalues += `,'${data.genotype}'`;
    // }

    // if (data.ScreeningComments) {
    //     querycolumns += `,PATIENT_SCREENINGCOMMENTS`;
    //     queryvalues += `,'${data.ScreeningComments}'`;
    // }
    // if (data.HcvRnaTestResultDateScreening) {
    //     querycolumns += `,PATIENT_SCREENING_RNARESULTDATE`;
    //     queryvalues += `,'${data.HcvRnaTestResultDateScreening}'`;
    // }


    //// Evaluation data 
    if (data.txtHcvRnaTestResultEval) {
        querycolumns += `,PATIENT_EVALUATIONHCVRNA`;
        queryvalues += `,'${data.txtHcvRnaTestResultEval}'`;
    }

    if (data.genotype) {
        querycolumns += `,PATIENT_EVALUATIONGENOTYPE`;
        queryvalues += `,'${data.genotype}'`;
    }

    //rna result date 
    if (data.txtEvalRNAResultDate) {
        querycolumns += `,PATIENT_EVALUATIONRNARESULTDATE`;
        queryvalues += `,'${data.txtEvalRNAResultDate}'`;
    }

    if (data.HcvRnaTestGenotypeDateEval) {
        querycolumns += `,PATIENT_EVALUATIONRNAGENOTYPEDATE`;
        queryvalues += `,'${data.HcvRnaTestGenotypeDateEval}'`;
    }


    if (data.alcoholTest) {
        querycolumns += `,PATIENT_IS_ALCOHOLTEST`;
        queryvalues += `,'${data.alcoholTest}'`;
    }

    if (data.alcoholstoppedperiod) {
        querycolumns += `,PATIENT_ALCOHOLPERIOD`;
        queryvalues += `,'${data.alcoholstoppedperiod}'`;
    }

    if (data.alcoholstoppedperiodtype) {
        querycolumns += `,PATIENT_ALCOHOLPERIODTYPE`;
        queryvalues += `,'${data.alcoholstoppedperiodtype}'`;
    }

    if (data.seriousdeseasesFibrosisTest) {
        querycolumns += `,PATIENT_IS_SERIOUSDESEASESFIBROSISTEST`;
        queryvalues += `,'${data.seriousdeseasesFibrosisTest}'`;
    }


    if (data.FibroStage) {
        querycolumns += `,PATIENT_FIROSISSTAGE`;
        queryvalues += `,'${data.FibroStage}'`;
    }
    if (data.txtFibroscanScore) {
        querycolumns += `,PATIENT_FIBROSCANSCORE`;
        queryvalues += `,'${data.txtFibroscanScore}'`;
    }
    if (data.txtFibrosistestScore) {
        querycolumns += `,PATIENT_FIBROSISTESTSCORE`;
        queryvalues += `,'${data.txtFibrosistestScore}'`;
    }
    if (data.txtAPRIscore) {
        querycolumns += `,PATIENT_APRISCORE`;
        queryvalues += `,'${data.txtAPRIscore}'`;
    }
    if (data.txtFibroMeterscore) {
        querycolumns += `,PATIENT_FIBROMETERSCORE`;
        queryvalues += `,'${data.txtFibroMeterscore}'`;
    }

    if (data.CommChildPughTest) {
        querycolumns += `,PATIENT_IS_COMMCHILDPUGHTEST`;
        queryvalues += `,'${data.CommChildPughTest}'`;
    }
    if (data.txtChildPughscore) {
        querycolumns += `,PATIENT_CHILDPUGHSCORE`;
        queryvalues += `,'${data.txtChildPughscore}'`;
    }
    if (data.txtMELDscore) {
        querycolumns += `,PATIENT_MELDSCORE`;
        queryvalues += `,'${data.txtMELDscore}'`;
    }

    if (data.CommChildPughTestchartnote) {
        querycolumns += `,PATIENT_IS_CHARTNOTE`;
        queryvalues += `,'${data.CommChildPughTestchartnote}'`;
    }

    if (data.CommChildPughTestchartnoteFile != null) {
        querycolumns += `,PATIENT_COMMCHILDPUGHTESTFILE`;
        queryvalues += `,'${data.CommChildPughTestchartnoteFile}'`;
    }

    if (data.seriousdeseasesLymphomaTest) {
        querycolumns += `,PATIENT_IS_LYMPHOMATEST`;
        queryvalues += `,'${data.seriousdeseasesLymphomaTest}'`;
    }
    if (data.seriousdeseasesRenalinsufficiencyTest) {
        querycolumns += `,PATIENT_IS_RENALINSUFFICIENCYTEST`;
        queryvalues += `,'${data.seriousdeseasesRenalinsufficiencyTest}'`;
    }
    if (data.seriousdeseasesCryoglobulinemiaTest) {
        querycolumns += `,PATIENT_IS_CRYOGLOBULINEMIATEST`;
        queryvalues += `,'${data.seriousdeseasesCryoglobulinemiaTest}'`;
    }
    if (data.seriousdeseasesLivertransplantTest) {
        querycolumns += `,PATIENT_IS_LIVERTRANSPLANTTEST`;
        queryvalues += `,'${data.seriousdeseasesLivertransplantTest}'`;
    }
    if (data.seriousdeseasesMediHIV1Co) {
        querycolumns += `,PATIENT_IS_MEDIHIV1CO`;
        queryvalues += `,'${data.seriousdeseasesMediHIV1Co}'`;
    }
    if (data.seriousdeseasesMediHEPAB) {
        querycolumns += `,PATIENT_IS_MEDIHEPAB`;
        queryvalues += `,'${data.seriousdeseasesMediHEPAB}'`;
    }
    if (data.seriousdeseasesMediType2Diabetes) {
        querycolumns += `,PATIENT_IS_MEDITYPE2DIABETES`;
        queryvalues += `,'${data.seriousdeseasesMediType2Diabetes}'`;
    }
    if (data.seriousdeseasesMediPorphyria) {
        querycolumns += `,PATIENT_IS_MEDIPORPHYRIA`;
        queryvalues += `,'${data.seriousdeseasesMediPorphyria}'`;
    }

    if (data.treatmentexperienced) {
        querycolumns += `,PATIENT_IS_TREATMENTEXPERICED`;
        queryvalues += `,'${data.treatmentexperienced}'`;
    }

    if (data.txtEvalutionrequiresSpecialist) {
        querycolumns += `,PATIENT_EVALUTIONREQUIRESSPECIALISTCOMMENTS`;
        queryvalues += `,'${data.txtEvalutionrequiresSpecialist}'`;
    }

    if (data.listtreatmentregimen) {
        querycolumns += `,PATIENT_LISTTREATMENTREGIMEN`;
        queryvalues += `,'${data.listtreatmentregimen}'`;
    }
    if (data.TEwithNS5A) {
        querycolumns += `,TEwithNS5A`;
        queryvalues += `,'${data.TEwithNS5A}'`;
    }
    if (data.TEwithNS34A) {
        querycolumns += `,TEwithNS34A`;
        queryvalues += `,'${data.TEwithNS34A}'`;
    }
    if (data.completeregimen) {
        querycolumns += `,PATIENT_COMPLETEREGIMEN`;
        queryvalues += `,'${data.completeregimen}'`;
    }

    if (data.reasondiscontinue) {
        querycolumns += `,PATIENT_REASONOFDISCONTINUATION`;
        queryvalues += `,'${data.reasondiscontinue}'`;
    }


    if (data.patientresponse) {
        querycolumns += `,PATIENT_THERAPYRESPONSE`;
        queryvalues += `,'${data.patientresponse}'`;
    }
    if (data.txtHCVRNAWeekDurationResponse) {
        querycolumns += `,PATIENT_THERAPYRESPONSE_HCVRNA`;
        queryvalues += `,'${data.txtHCVRNAWeekDurationResponse}'`;
    }
    if (data.txtHcvRnaTestResultResponse) {
        querycolumns += `,PATIENT_THERAPYRESPONSE_HCVRNARESULT`;
        queryvalues += `,'${data.txtHcvRnaTestResultResponse}'`;
    }

    if (data.documentedfatigue) {
        querycolumns += `,PATIENT_DOCUMENTEDFATIGUE`;
        queryvalues += `,'${data.documentedfatigue}'`;
    }
    if (data.EvalHepaBantigen) {
        querycolumns += `,PATIENT_EVALHEPABANTIGEN`;
        queryvalues += `,'${data.EvalHepaBantigen}'`;
    }

    if (data.EvalHepaBantigenDate) {
        querycolumns += `,PATIENT_EVALHEPABANTIGENDATE`;
        queryvalues += `,'${data.EvalHepaBantigenDate}'`;
    }

    if (data.EvalHepaBantigenfile != null) {
        querycolumns += `,PATIENT_EVALHEPABANTIGENFILE`;
        queryvalues += `,'${data.EvalHepaBantigenfile}'`;
    }

    if (data.EvalHepaBantibody) {
        querycolumns += `,PATIENT_EVALHEPABANTIBODY`;
        queryvalues += `,'${data.EvalHepaBantibody}'`;
    }

    if (data.EvalHepaBantibodyDate) {
        querycolumns += `,PATIENT_EVALHEPABANTIBODYDATE`;
        queryvalues += `,'${data.EvalHepaBantibodyDate}'`;
    }

    if (data.EvalHepaBantibodyfile != null) {
        querycolumns += `,PATIENT_EVALHEPABANTIBODYFILE`;
        queryvalues += `,'${data.EvalHepaBantibodyfile}'`;
    }

    if (data.EvalHepaBcoreantibodytotal) {
        querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTAL`;
        queryvalues += `,'${data.EvalHepaBcoreantibodytotal}'`;
    }

    if (data.EvalHepaBcoreantibodytotalDate) {
        querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTALDATE`;
        queryvalues += `,'${data.EvalHepaBcoreantibodytotalDate}'`;
    }

    if (data.EvalHepaBcoreantibodytotalfile != null) {
        querycolumns += `,PATIENT_EVALHEPABCOREANTIBODYTOTALFILE`;
        queryvalues += `,'${data.EvalHepaBcoreantibodytotalfile}'`;
    }

    if (data.EvalHepaAantibody) {
        querycolumns += `,PATIENT_EVALHEPAANTIBODY`;
        queryvalues += `,'${data.EvalHepaAantibody}'`;
    }

    if (data.EvalHepaAantibodyDate) {
        querycolumns += `,PATIENT_EVALHEPAANTIBODYDATE`;
        queryvalues += `,'${data.EvalHepaAantibodyDate}'`;
    }

    if (data.EvalHepaAantibodyfile != null) {
        querycolumns += `,PATIENT_EVALHEPAANTIBODYFILE`;
        queryvalues += `,'${data.EvalHepaAantibodyfile}'`;
    }

    if (data.EvalHIVantibody) {
        querycolumns += `,PATIENT_EVALHIVANTIBODY`;
        queryvalues += `,'${data.EvalHIVantibody}'`;
    }

    if (data.EvalHIVantibodyDate) {
        querycolumns += `,PATIENT_EVALHIVANTIBODYDATE`;
        queryvalues += `,'${data.EvalHIVantibodyDate}'`;
    }

    if (data.EvalHIVantibodyfile != null) {
        querycolumns += `,PATIENT_EVALHIVANTIBODYFILE`;
        queryvalues += `,'${data.EvalHIVantibodyfile}'`;
    }

    if (data.EvalNS5Apolymorphisms) {
        querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMS`;
        queryvalues += `,'${data.EvalNS5Apolymorphisms}'`;
    }


    if (data.EvalNS5Apolymorphismsflag) {
        querycolumns += `,PATIENT_IS_EVALNS5APOLYMORPHISMS`;
        queryvalues += `,'${data.EvalNS5Apolymorphismsflag}'`;
    }

    if (data.EvalNS5ApolymorphismsDate) {
        querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMSDATE`;
        queryvalues += `,'${data.EvalNS5ApolymorphismsDate}'`;
    }

    if (data.EvalNS5Apolymorphismsfile != null) {
        querycolumns += `,PATIENT_EVALNS5APOLYMORPHISMSFILE`;
        queryvalues += `,'${data.EvalNS5Apolymorphismsfile}'`;
    }

    if (data.EvalASTUpperLimit) {
        querycolumns += `,PATIENT_EVALASTUPPERLIMIT`;
        queryvalues += `,'${data.EvalASTUpperLimit}'`;
    }
    if (data.EvalASTLowerLimit) {
        querycolumns += `,PATIENT_EVALASTLOWERLIMIT`;
        queryvalues += `,'${data.EvalASTLowerLimit}'`;
    }

    if (data.EvalASTLimitDate) {
        querycolumns += `,PATIENT_EVALASTLIMITDATE`;
        queryvalues += `,'${data.EvalASTLimitDate}'`;
    }

    if (data.EvalASTLimitfile != null) {
        querycolumns += `,PATIENT_EVALASTLIMITFILE`;
        queryvalues += `,'${data.EvalASTLimitfile}'`;
    }


    if (data.EvalALTUpperLimit) {
        querycolumns += `,PATIENT_EVALALTUPPERLIMIT`;
        queryvalues += `,'${data.EvalALTUpperLimit}'`;
    }
    if (data.EvalALTLowerLimit) {
        querycolumns += `,PATIENT_EVALALTLOWERLIMIT`;
        queryvalues += `,'${data.EvalALTLowerLimit}'`;
    }

    if (data.EvalALTLimitDate) {
        querycolumns += `,PATIENT_EVALALTLIMITDATE`;
        queryvalues += `,'${data.EvalALTLimitDate}'`;
    }

    if (data.EvalALTLimitfile != null) {
        querycolumns += `,PATIENT_EVALALTLIMITFILE`;
        queryvalues += `,'${data.EvalALTLimitfile}'`;
    }


    if (data.EvalBilirubin) {
        querycolumns += `,PATIENT_EVALBILIRUBIN`;
        queryvalues += `,'${data.EvalBilirubin}'`;
    }
    if (data.EvalBilirubinDate) {
        querycolumns += `,PATIENT_EVALBILIRUBINDATE`;
        queryvalues += `,'${data.EvalBilirubinDate}'`;
    }

    if (data.EvalBilirubinfile != null) {
        querycolumns += `,PATIENT_EVALBILIRUBINFILE`;
        queryvalues += `,'${data.EvalBilirubinfile}'`;
    }

    if (data.EvalAlbumin) {
        querycolumns += `,PATIENT_EVALALBUMIN`;
        queryvalues += `,'${data.EvalAlbumin}'`;
    }
    if (data.EvalAlbuminDate) {
        querycolumns += `,PATIENT_EVALALBUMINDATE`;
        queryvalues += `,'${data.EvalAlbuminDate}'`;
    }

    if (data.EvalAlbuminfile != null) {
        querycolumns += `,PATIENT_EVALALBUMINFILE`;
        queryvalues += `,'${data.EvalAlbuminfile}'`;
    }

    if (data.EvalINR) {
        querycolumns += `,PATIENT_EVALINR`;
        queryvalues += `,'${data.EvalINR}'`;
    }
    if (data.EvalINRDate) {
        querycolumns += `,PATIENT_EVALINRDATE`;
        queryvalues += `,'${data.EvalINRDate}'`;
    }

    if (data.EvalINRfile != null) {
        querycolumns += `,PATIENT_EVALINRFILE`;
        queryvalues += `,'${data.EvalINRfile}'`;
    }

    if (data.EvalSerumCr) {
        querycolumns += `,PATIENT_EVALSERUMCR`;
        queryvalues += `,'${data.EvalSerumCr}'`;
    }
    if (data.EvalSerumCrDate) {
        querycolumns += `,PATIENT_EVALSERUMCRDATE`;
        queryvalues += `,'${data.EvalSerumCrDate}'`;
    }

    if (data.EvalSerumCrfile != null) {
        querycolumns += `,PATIENT_EVALSERUMCRFILE`;
        queryvalues += `,'${data.EvalSerumCrfile}'`;
    }

    // AST
    if (data.EvalAST) {
        querycolumns += `,PATIENT_EVALAST`;
        queryvalues += `,'${data.EvalAST}'`;
    }
    if (data.EvalASTDate) {
        querycolumns += `,PATIENT_EVALASTDATE`;
        queryvalues += `,'${data.EvalASTDate}'`;
    }

    if (data.EvalASTfile != null) {
        querycolumns += `,PATIENT_EVALASTFILE`;
        queryvalues += `,'${data.EvalASTfile}'`;
    }

    // ALT 
    if (data.EvalALT) {
        querycolumns += `,PATIENT_EVALALT`;
        queryvalues += `,'${data.EvalALT}'`;
    }
    if (data.EvalALTDate) {
        querycolumns += `,PATIENT_EVALALTDATE`;
        queryvalues += `,'${data.EvalALTDate}'`;
    }

    if (data.EvalALTfile != null) {
        querycolumns += `,PATIENT_EVALALTFILE`;
        queryvalues += `,'${data.EvalALTfile}'`;
    }

    //Hemoglobin 
    if (data.EvalHemoglobin) {
        querycolumns += `,PATIENT_EVALHEMOGLOBIN`;
        queryvalues += `,'${data.EvalHemoglobin}'`;
    }
    if (data.EvalHemoglobinDate) {
        querycolumns += `,PATIENT_EVALHEMOGLOBINDATE`;
        queryvalues += `,'${data.EvalHemoglobinDate}'`;
    }

    if (data.EvalHemoglobinfile != null) {
        querycolumns += `,PATIENT_EVALHEMOGLOBINFILE`;
        queryvalues += `,'${data.EvalHemoglobinfile}'`;
    }

    //Platelets 
    if (data.EvalPlatelets) {
        querycolumns += `,PATIENT_EVALPLATELETS`;
        queryvalues += `,'${data.EvalPlatelets}'`;
    }
    if (data.EvalPlateletsDate) {
        querycolumns += `,PATIENT_EVALPLATELETSDATE`;
        queryvalues += `,'${data.EvalPlateletsDate}'`;
    }

    if (data.EvalPlateletsfile != null) {
        querycolumns += `,PATIENT_EVALPLATELETSFILE`;
        queryvalues += `,'${data.EvalPlateletsfile}'`;
    }

    //WBC 
    if (data.EvalWBC) {
        querycolumns += `,PATIENT_EVALWBC`;
        queryvalues += `,'${data.EvalWBC}'`;
    }
    if (data.EvalWBCDate) {
        querycolumns += `,PATIENT_EVALWBCDATE`;
        queryvalues += `,'${data.EvalWBCDate}'`;
    }

    if (data.EvalWBCfile != null) {
        querycolumns += `,PATIENT_EVALWBCFILE`;
        queryvalues += `,'${data.EvalWBCfile}'`;
    }

    if (data.patientScreeningAlcohol) {
        querycolumns += `,PATIENT_IS_ALCHOHOLSCREENINGTEST`;
        queryvalues += `,'${data.patientScreeningAlcohol}'`;
    }
    if (data.patientEvaluationAlcoholFile != null) {
        querycolumns += `,PATIENT_ALCOHOLSCEENINGFILE`;
        queryvalues += `,'${data.patientEvaluationAlcoholFile}'`;
    }

    if (data.realWorldEvidenceDrugs) {
        querycolumns += `,PATIENT_PCP_REALWORLDEVIDENCE`;
        queryvalues += `,'${data.realWorldEvidenceDrugs}'`;
    }

    //data for screening patients
    if (data.recommendedTreatmentForPatient) {
        querycolumns += `,PATIENT_PCP_TREATMENTRECOMMENTDATIONS`;
        queryvalues += `,'${data.recommendedTreatmentForPatient}'`;
    }
    //cirrhosis data 
    if (data.cirrhosis) {
        querycolumns += `,PATIENT_CIRRHOSIS`;
        queryvalues += `,'${data.cirrhosis}'`;
    }
    //genotype data 
    if (data.genotype) {
        querycolumns += `,PATIENT_GENOTYPE`;
        queryvalues += `,'${data.genotype}'`;
    }
    //ptatient treatment 
    if (data.treatment) {
        querycolumns += `,PATIENT_TREATMENT`;
        queryvalues += `,'${data.treatment}'`;
    }

    if (data.EvalSerumSodium) {
        querycolumns += `,PATIENT_EVALSERUMSODIUM`;
        queryvalues += `,'${data.EvalSerumSodium}'`;
    }
    if (data.EvalSerumSodiumDate) {
        querycolumns += `,PATIENT_EVALSERUMSODIUMDATE`;
        queryvalues += `,'${data.EvalSerumSodiumDate}'`;
    }
    if (data.EvalSerumSodiumfile != null) {
        querycolumns += `,PATIENT_EVALSERUMSODIUMFILE`;
        queryvalues += `,'${data.EvalSerumSodiumfile}'`;
    }

    if (data.dialysis) {
        querycolumns += `,PATIENT_IS_DIALYSIS`;
        queryvalues += `,'${data.dialysis}'`;
    }

    querycolumns += `)`;
    queryvalues += `)`;
    let query = querycolumns + queryvalues;

    return query;
}