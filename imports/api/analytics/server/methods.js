// Meteor.methods({
//     'update_cost': function(data) {
//         // console.log(data);
//         var result = liveDb.db.query(
//             'UPDATE hcv_analytics  SET  cost = ? WHERE drug_id = ?', data);

//     },
//     'update_payer_saving': function(data) {
//         // console.log(data);
//         var result = liveDb.db.query(
//             'UPDATE payer_savings  SET  total_saving = ? WHERE category_id = ?', data);

//     },
//     'insert_hcv_analytics': function(data) {
//         var quest = '';
//         for (var i = 0; i < data.length; i++) {
//             quest = quest + data[i] + " ,";
//         }
//         quest = quest.substr(0, quest.length - 1) + " ";
//         var query = 'insert into hcv_analytics (  drug_id, category_id, value, count, efficacy, utilization, adherence,cost,total_length,best_value,max_cost,cost_gap ) values (' + quest + ' )';
//         // console.log(query);
//         var result = liveDb.db.query(query);
//     },

// });

// Meteor.syncMethods({
//      'getDrugByGenotype': function(params, callback) {
//         //console.log('callingserver');
//         let query = '',
//             dataObj = {};
//         // query = 'select mrn_crswlk as patientId,FLOOR( DATEDIFF(NOW(),birthday) / 365.25) as age,hcv_genotype as genotype,' +
//         //     'hcv_cirrhosis as cirrhosis,hcv_viral_load as viralLoad,treatment,gender_cd as gender,admissionDate,' +
//         //     '(case when alcohol_sts = "Yes" then 1 else 0 end) as Alcohol,mentalHealth as "Mental Health",cast(renalFailure as unsigned) as "Renal Failure",safety_anemia as anemia,Cardiovascular,labs_meld as meldScore,' +
//         //     'HIV_status as HIV,Muscular_dystrophy,Schistosomiasis_coinfection,postal_cd as zipcode,hcv_Fibrosur as fibrosis,' +
//         //     'disease_progression,labs_ast,labs_apri,labs_alt,labs_platelets,labs_meld,labs_inr,labs_albumin,labs_total_bilirubin,race_cd as race,' +
//         //     'weight,ethnicity,cirrhosistype,dischargeDate,medication, ' +
//         //     'HIV_status as HIV,postal_cd as zipcode, race_cd as race, disease_progression,(case when pregnancy = "Yes" then 1 else 0 end) as Pregnancy, physician_service as "Physician Service",physician_cost as "Physician Service_Cost",hospitalization as Hospitalization,hospitalization_cost as "Hospitalization_Cost",diagnostic_testing as "Diagnostic Testing",' +
//         //     'diagnostic_testing_cost as "Diagnostic Testing_Cost",1 as "Antiviral Therapy",antiviral_therapy_cost as "Antiviral Therapy_Cost",liver_disease as "Liver Disease",liver_disease_cost as  "Liver Disease_Cost", antiviral_therapy, antiviral_therapy_cost ,fibro_Value  from HCV_patients as patient JOIN cost_burden_categories as costBurden ' +
//         //     'ON patient.mrn_crswlk = costBurden.PatientID where medication !="" and dischargeDate is not null ;';


//         query = `select
//                     p.PATIENT_ID_SYNTH as patientId,
//                     Age as age,
//                     GENOTYPE as genotype,
//                     CIRRHOSIS as cirrhosis,
//                     m.VIRAL_LOAD as viralLoad,
//                     TREATMENT as treatment,
//                     GENDER_CD as gender,
//                     FIRST_ENCOUNTER as admissionDate,
//                     (case when ALCOHOL = "Yes" then 1 else 0 end) as Alcohol,
//                     MENTAL_HEALTH as "Mental Health",
//                     cast(RENAL_FAILURE as unsigned) as "Renal Failure",
//                     IS_ANIMIA as anemia,
//                     'Not Available'as Cardiovascular,
//                     MELD_SCORE as meldScore,
//                     HIV,
//                     'Not Available' as Muscular_dystrophy,
//                     'Not Available' as Schistosomiasis_coinfection,
//                     PAT_ZIP as zipcode,
//                     FibrosureValue as fibrosis,
//                     (case when APRI < 1 then 'N' else 'Y' end) as disease_progression,
//                     AST as labs_ast,
//                     APRI as labs_apri,
//                     ALT as labs_alt,
//                     '' as labs_platelets,
//                     MELD_SCORE as labs_meld,
//                     '' as labs_inr,
//                     ALBUMIN as labs_albumin,
//                     BILIRUBIN as labs_total_bilirubin,
//                     RACE_DESC as race,
//                     BODY_WEIGHT as weight,
//                     ETHNITY_1_DESC as ethnicity,
//                     CIRRHOSISTYPE as cirrhosistype,
//                     FIRST_ENCOUNTER as dischargeDate,
//                     m.MEDICATION,
//                     (case when PREGNANCY = "Yes" then 1 else 0 end) as Pregnancy,
 
//                     Physician_Service_Cost as "Physician Service_Cost"
//                     , (case when Physician_Service_Cost is not null  then 1 else 0 end) as "Physician Service"  
//                     , Hospitalization_Cost
//                     , (case when Hospitalization_Cost is not null  then 1 else 0 end) as "Hospitalization",
//                     'Not Available' as "Diagnostic Testing",
//                     0 as "Diagnostic Testing_Cost",
//                     1 as "Antiviral Therapy",
//                     m.PAID as "Antiviral Therapy_Cost"
//                     , (case when Liver_Disease_Cost is null or Liver_Disease_Cost=0 then 0 else 1 end) as "Liver Disease"
//                     , cast(Liver_Disease_Cost as decimal(12,2)) as "Liver Disease_Cost"
//                     , 1 as antiviral_therapy,
//                     m.PAID as antiviral_therapy_cost,
//                     FibrosureValue as fibro_Value,
//                     TREATMENT_PERIOD as treatmentPeriod
//                 from
//                     IMS_HCV_PATIENTS as p
//                 JOIN
//                     PATIENT_MEDICATIONS as m
//                 ON p.IDW_PATIENT_ID_SYNTH = m.IDW_PATIENT_ID_SYNTH

//                 where
//                     MEDICATION !=""  AND p.IDW_PATIENT_ID_SYNTH !=0  AND p.IDW_PATIENT_ID_SYNTH is not null `;



//         // console.log("**************** DRUG BY GENOTYPE **************************");
//         //console.log(query);
//         liveDb.db.query(query, function(error, result) {
//             if (error) {
//                 console.log(error);
//                 return;
//             } else {
//               //  console.log('callingtest'+result);
//                 callback(undefined, result);
//             }
//         });
//     },
    
//     'getSVRTrend': function(params, callback) {
//         var query = ``,
//             dataObj = {};

//         dataObj['PatientsJourney'] = null;

//         // query = "select med.PATIENT_ID_SYNTH,PatientId ,ViralLoad, case when ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 0 then 0 when Perfed_Dt > END_DATE then TREATMENT_PERIOD " +
//         //     "else  ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) end  as Weeks,Perfed_Dt  , STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,MEDICATION,TREATMENT_PERIOD from PATIENT_MEDICATIONS med join IMS_HCV_VIRALLOAD_RESULTS res " +
//         //     "on med.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS hcv on hcv.PATIENT_ID_SYNTH = med.PATIENT_ID_SYNTH where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$') " +
//         //     "and INSTR(MEDICATION,'+') =0 ";

//         query = "select med.PATIENT_ID_SYNTH,PatientId ,ViralLoad, ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) as Weeks,Perfed_Dt,STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,MEDICATION,TREATMENT_PERIOD " +
//             "from PATIENT_MEDICATIONS med join IMS_HCV_VIRALLOAD_RESULTS res  on med.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS hcv " +
//             "on hcv.PATIENT_ID_SYNTH = med.PATIENT_ID_SYNTH where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')  " +
//             "AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) > -8 AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 70";

//         let fdaCompliant = params.fdaCompliant;
//         let treatmentPeriods = [];
//         if (fdaCompliant == "yes") {
//             treatmentPeriods = getFDACompliantTreatmentPeriod();
//             query += ` AND TREATMENT_PERIOD IN (` + treatmentPeriods + `) `;

//         } else if (fdaCompliant == "no") {
//             treatmentPeriods = getFDACompliantTreatmentPeriod();
//             query += ` AND TREATMENT_PERIOD NOT IN (` + treatmentPeriods + `) `;
//         }

//         liveDb.db.query(query, function(error, result) {
//             if (error) {
//                 console.log(error);
//                 return;
//             } else {
//                 dataObj['PatientsJourney'] = result;
//                 callback(undefined, dataObj);
//             }
//         });
//     },
    
//     'getMedicationSVRData': function(params, callback) {
//         var query = ``,
//             dataObj = {};

//         dataObj['MedicationSvr'] = null;

//         query = "select med.PATIENT_ID_SYNTH,PatientId ,ViralLoad, case when ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 0 then 0 when Perfed_Dt > END_DATE then TREATMENT_PERIOD " +
//             "else  ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) end  as Weeks,Perfed_Dt  , STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,MEDICATION,TREATMENT_PERIOD from PATIENT_MEDICATIONS med join IMS_HCV_VIRALLOAD_RESULTS res " +
//             "on med.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS hcv on hcv.PATIENT_ID_SYNTH = med.PATIENT_ID_SYNTH ";

//         let extraParams = ` (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$') `;

//         query = appendFiltersToQuery(query, params, extraParams);

//         /*
//         let fdaCompliant = params.fdaCompliant;
//         let treatmentPeriods = [];
//         if (fdaCompliant == "yes") {
//             treatmentPeriods = getFDACompliantTreatmentPeriod();
//             query += ` AND TREATMENT_PERIOD IN (` + treatmentPeriods + `) `;

//         } else if (fdaCompliant == "no") {
//             treatmentPeriods = getFDACompliantTreatmentPeriod();
//             query += ` AND TREATMENT_PERIOD NOT IN (` + treatmentPeriods + `) `;
//         }
// */
//         liveDb.db.query(query, function(error, result) {
//             if (error) {
//                 console.log(error);
//                 return;
//             } else {
//                 dataObj['MedicationSvr'] = result;
//                 callback(undefined, dataObj);
//             }
//         });
//     },
//     'getMacLearningTabsData': function(data, callback) {
//         //let category_id = data.id,
//         let query = '';

//         // query = 'select mrn_crswlk as patientId,FLOOR( DATEDIFF(NOW(),birthday) / 365.25) as age,hcv_genotype as genotype,' +
//         //     'hcv_cirrhosis as cirrhosis,hcv_viral_load as viralLoad,treatment,AssessmentLiverDisease,gender_cd as gender,' +
//         //     'Medication,Treatment_Period as treatmentPeriod,dischargeDate,days_medication  as medDays,' +
//         //     '(case when alcohol_sts = "Yes" then 1 else 0 end) as alcohol ,cast(renalFailure as unsigned) as mentalHealth,cast(renalFailure as unsigned) as renalFailure,(case when pregnancy = "Yes" then 1 else 0 end) as Pregnancy, safety_anemia as anemia,Cardiovascular,meldScore,' +
//         //     'HIV_status as HIV,Muscular_dystrophy,Schistosomiasis_coinfection,postal_cd as zipcode,hcv_Fibrosur as fibrosis,fibro_Value,' +
//         //     'disease_progression,labs_ast,labs_apri,labs_alt,labs_platelets,labs_meld,labs_inr,labs_albumin,' +
//         //     'labs_total_bilirubin,race_cd as race,weight,ethnicity,claims_cost,' +
//         //     'physician_service,physician_cost,hospitalization,hospitalization_cost,diagnostic_testing,' +
//         //     'diagnostic_testing_cost,antiviral_therapy,antiviral_therapy_cost,liver_disease,liver_disease_cost,' +
//         //     'jaundice,ascites,variceal_hemorrhage,encephalopathy,ctpScore,cirrhosistype ' +
//         //     'from HCV_patients as patient JOIN cost_burden_categories as costBurden ' +
//         //     'ON patient.mrn_crswlk = costBurden.PatientID ' +
//         //     'where medication !="" and dischargeDate is not null ' +
//         //     'and category_id =' + category_id + ' and  disease_progression!= ""';




//         // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//         query = `select
//                     p.PATIENT_ID_SYNTH as patientId,
//                     Age as age,
//                     GENOTYPE as genotype,
//                     CIRRHOSIS as cirrhosis,
//                     m.VIRAL_LOAD as viralLoad,
//                     TREATMENT as treatment,
//                     LIVER_ASSESMENT as AssessmentLiverDisease,
//                     GENDER_CD as gender,
//                     m.MEDICATION as Medication,
//                     m.TREATMENT_PERIOD as treatmentPeriod,
//                     FIRST_ENCOUNTER as dischargeDate,
//                     DAYS_MEDICATION  as medDays,
//                     (case when ALCOHOL = "Yes" then 1 else 0 end) as alcohol,
//                     (case when MENTAL_HEALTH = "Yes" then 1 else 0 end) as mentalHealth,
//                     (case when RENAL_FAILURE = "Yes" then 1 else 0 end) as renalFailure,
//                     (case when PREGNANCY = "Yes" then 1 else 0 end) as Pregnancy,
//                     IS_ANIMIA as anemia,
//                     '' as Cardiovascular,
//                     MELD_SCORE as meldScore,
//                     HIV,
//                     '' as Muscular_dystrophy,
//                     '' aS Schistosomiasis_coinfection,
//                     PAT_ZIP as zipcode,
//                     IS_FibrosureLab as fibrosis,
//                     FibrosureValue as fibro_Value,
//                     (case when APRI <= 1 then 'N' else 'Y' end) as disease_progression,
//                     AST as labs_ast,
//                     APRI as labs_apri,
//                     ALT as labs_alt,
//                     0 as labs_platelets,
//                     MELD_SCORE as labs_meld,
//                     '' as labs_inr,
//                     ALBUMIN as labs_albumin,
//                     BILIRUBIN as labs_total_bilirubin,
//                     RACE_DESC as race,
//                     BODY_WEIGHT as weight,
//                     ETHNITY_1_DESC as ethnicity,
//                     PAID as claims_cost,
//                    (case when Physician_Service_Cost is not null  then 1 else 0 end) as physician_service,
//                     Physician_Service_Cost as physician_cost,
//                     (case when Hospitalization_Cost is not null  then 1 else 0 end) as hospitalization,
//                     Hospitalization_Cost as hospitalization_cost,
//                     '' as diagnostic_testing,
//                     0 as diagnostic_testing_cost,
//                     MEDICATION as antiviral_therapy,
//                     PAID as antiviral_therapy_cost,
//                     (case when Liver_Disease_Cost is null or Liver_Disease_Cost=0 then 0 else 1 end) as liver_disease,
//                     Liver_Disease_Cost as liver_disease_cost,
//                     '' as jaundice,
//                     '' as ascites,
//                     '' as variceal_hemorrhage,
//                     '' as encephalopathy,
//                     '' as ctpScore,
//                     CIRRHOSISTYPE as cirrhosistype

//                 from IMS_HCV_PATIENTS as p
//                     JOIN PATIENT_MEDICATIONS as m
//                     ON p.IDW_PATIENT_ID_SYNTH = m.IDW_PATIENT_ID_SYNTH `;

//         let extraParams = `MEDICATION !='' AND p.IDW_PATIENT_ID_SYNTH !=0  AND p.IDW_PATIENT_ID_SYNTH is not null and FIRST_ENCOUNTER is not null
//                    -- and APRI is not null`;

//         query = appendFiltersToQuery(query, data, extraParams);

//         // console.log('*********Machine Learning *************');
//         // console.log(query);

//         liveDb.db.query(query, function(error, result) {
//             if (error) {
//                 return;
//             } else {
//                 //dummy check for fibrosis value
//                 //let data = calculateFibrosisValue(result);
//                 callback(undefined, result);
//             }
//         });
//     },
    
//     'getPatientsDataForAnalytics': function(params, callback) {
//         // let category_id = params.category_id,
//         dataObj = {};
//         // let query = 'select mrn_crswlk as patientId,provider_id as providerId,FLOOR( DATEDIFF(NOW(),birthday) / 365.25) as age,hcv_genotype as genotype,' +
//         //     'YEAR(admissionDate) as Year,' +
//         //     'admissionDate,hcv_cirrhosis as cirrhosis,hcv_viral_load as viralLoad,treatment,AssessmentLiverDisease,gender_cd as gender,' +
//         //     'weight,ethnicity,Medication,Treatment_Period as treatmentPeriod,dischargeDate,days_medication  as medDays,' +
//         //     'alcohol_sts as alcohol,mentalHealth,renalFailure,safety_anemia as anemia,Cardiovascular,' +
//         //     'labs_ast,labs_apri,labs_alt,labs_platelets,labs_meld,labs_inr,labs_albumin,labs_total_bilirubin,' +
//         //     'HIV_status as HIV,Muscular_dystrophy,Schistosomiasis_coinfection,postal_cd as zipcode,' +
//         //     '(case when hcv_svr12 = "2" then 0 else 1 end) as isCured,race_cd as race ' +
//         //     'from HCV_patients where medication !="" and dischargeDate is not null ' +
//         //     'and category_id =' + category_id + ' order by Year desc;';




//         // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//         // console.log(params);


//         query = `select
//                     p.IDW_PATIENT_ID_SYNTH as patientId,
//                     PROVIDER_ID_SYNTH as providerId,
//                     Age as age,
//                     GENOTYPE as genotype,
//                     YEAR(FIRST_ENCOUNTER) as Year,
//                     FIRST_ENCOUNTER as admissionDate,
//                     CIRRHOSIS as cirrhosis,
//                     m.VIRAL_LOAD as viralLoad,
//                     TREATMENT as treatment,
//                     LIVER_ASSESMENT as AssessmentLiverDisease,
//                     GENDER_CD as gender,
//                     BODY_WEIGHT as weight,
//                     ETHNITY_1_DESC as ethnicity,
//                     Medication,
//                     TREATMENT_PERIOD as treatmentPeriod,
//                     FIRST_ENCOUNTER as dischargeDate,
//                     DAYS_MEDICATION  as medD,
//                     ALCOHOL as alcohol,
//                     MENTAL_HEALTH as mentalHealth,
//                     RENAL_FAILURE as renalFailure,
//                     IS_ANIMIA as anemia,
//                     '' as Cardiovascular,
//                     AST as labs_ast,
//                     APRI as labs_apri,
//                     ALT as labs_alt,
//                     0 as labs_platelets,
//                     MELD_SCORE as labs_meld,
//                     '' as labs_inr,
//                     ALBUMIN as labs_albumin,
//                     BILIRUBIN as labs_total_bilirubin,
//                     HIV,
//                     '' as Muscular_dystrophy,
//                     '' as Schistosomiasis_coinfection,
//                     PAT_ZIP as zipcode,
//                     SVR12 as isCured,
//                     RACE_DESC as race

//                 from IMS_HCV_PATIENTS as p
//                 JOIN
//                     PATIENT_MEDICATIONS as m
//                 ON p.IDW_PATIENT_ID_SYNTH = m.IDW_PATIENT_ID_SYNTH `;

//         let extraParams = `MEDICATION !="" AND p.IDW_PATIENT_ID_SYNTH !=0  AND p.IDW_PATIENT_ID_SYNTH is not null 
//                     and FIRST_ENCOUNTER is not null
//                 order by Year desc`;


//         query = appendFiltersToQuery(query, params, extraParams);

//         // console.log(query);

//         dataObj['params'] = params;
//         dataObj['treatedPatients'] = null;

//         liveDb.db.query(query, function(error, result) {
//             if (error || result.length < 1) {
//                 callback(true, error);
//                 //return;
//             } else {
//                 dataObj['treatedPatients'] = result;
//                 getTreatingPatientsForAnalytics(dataObj, callback);
//                 //callback(undefined,result);
//             }
//         });
//     }
// });

// function getTreatingPatientsForAnalytics(dataObj, callback) {
//     let params = dataObj.params,
//         treatedPatients = dataObj.treatedPatients,
//         finalData = {};

//     finalData['treatedPatients'] = treatedPatients;
//     finalData['treatingPatients'] = null;
//     finalData['params'] = params;

//     // let query = 'select mrn_crswlk as patientId,FLOOR( DATEDIFF(NOW(),birthday) / 365.25) as age,hcv_genotype as genotype,' +
//     //     'hcv_cirrhosis as cirrhosis,hcv_viral_load as viralLoad,treatment,AssessmentLiverDisease,gender_cd as gender, ' +
//     //     'Medication,Treatment_Period as treatmentPeriod,days_medication  as medDays ' +
//     //     'from HCV_patients where medication !="" and dischargeDate is null ' +
//     //     'and category_id =' + params.category_id + ';';


//     // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




//     let query = `select
//                     p.IDW_PATIENT_ID_SYNTH as patientId,
//                     Age as age,
//                     GENOTYPE as genotype,
//                     CIRRHOSIS as cirrhosis,
//                     m.VIRAL_LOAD as viralLoad,
//                     TREATMENT as treatment,
//                     LIVER_ASSESMENT as AssessmentLiverDisease,
//                     GENDER_CD as gender,
//                     MEDICATION as Medication,
//                     TREATMENT_PERIOD as treatmentPeriod,
//                     DAYS_MEDICATION  as medDays
//                 from IMS_HCV_PATIENTS as p
//                     JOIN PATIENT_MEDICATIONS as m
//                     ON p.IDW_PATIENT_ID_SYNTH = m.IDW_PATIENT_ID_SYNTH `;


//     let extraParams = ` MEDICATION !=""
//                     and FIRST_ENCOUNTER is null`;

//     query = appendFiltersToQuery(query, params, extraParams);
//     // Treating Patients
//     // console.log("*********************** Treating patients ***********************************")
//     // console.log(query);


//     liveDb.db.query(query, function(error, result) {
//         if (error) {
//             callback(true, error);
//             //return;
//         } else {
//             finalData['treatingPatients'] = result;
//             //  getPatientsDataForAnalytics_Org(finalData, callback);
//             callback(undefined, finalData);
//         }
//     });
// }

// function getPatientsDataForAnalytics_Org(dataObj, callback) {
//     let category_id = dataObj.params.category_id;
//     let params = dataObj.params;

//     //To Do : Need to change the static provider id to the one who is currently logged in
//     // let query = 'select mrn_crswlk as patientId,provider_id as providerId,FLOOR( DATEDIFF(NOW(),birthday) / 365.25) as age,hcv_genotype as genotype,' +
//     //     'YEAR(admissionDate) as Year,' +
//     //     'admissionDate,hcv_cirrhosis as cirrhosis,hcv_viral_load as viralLoad,treatment,AssessmentLiverDisease,gender_cd as gender,' +
//     //     'weight,ethnicity,Medication,Treatment_Period as treatmentPeriod,dischargeDate,days_medication  as medDays,' +
//     //     'alcohol_sts as alcohol,mentalHealth,renalFailure,safety_anemia as anemia,Cardiovascular,' +
//     //     'HIV_status as HIV,Muscular_dystrophy,Schistosomiasis_coinfection,postal_cd as zipcode,' +
//     //     '(case when hcv_svr12 = "2" then 0 else 1 end) as isCured,race_cd as race ' +
//     //     'from HCV_patients where medication !="" and dischargeDate is not null ' +
//     //     'and category_id =' + category_id + ' and network_id = (select network_id from HCV_patients where dischargeDate is not null ' +
//     //     'and category_id =' + category_id + ' and provider_id=182 LIMIT 1) order by Year desc;';


//     // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//     let query = `select
//                     p.IDW_PATIENT_ID_SYNTH as patientId,
//                     PROVIDER_ID_SYNTH as providerId,
//                     Age age,
//                     GENOTYPE as genotype,
//                     YEAR(FIRST_ENCOUNTER) as Year,
//                     FIRST_ENCOUNTER as admissionDate,
//                     CIRRHOSIS as cirrhosis,
//                     m.VIRAL_LOAD as viralLoad,
//                     TREATMENT treatment,
//                     LIVER_ASSESMENT as AssessmentLiverDisease,
//                     GENDER_CD as gender,
//                     BODY_WEIGHT weight,
//                     ETHNITY_1_DESC ethnicity,
//                     MEDICATION Medication,
//                     TREATMENT_PERIOD as treatmentPeriod,
//                     FIRST_ENCOUNTER dischargeDate,
//                     DAYS_MEDICATION  as medDays,
//                     ALCOHOL as alcohol,
//                     MENTAL_HEALTH as mentalHealth,
//                     RENAL_FAILURE renalFailure,
//                     IS_ANIMIA as anemia,
//                     '' Cardiovascular,
//                     HIV as HIV,
//                     '' as Muscular_dystrophy,
//                     '' as Schistosomiasis_coinfection,
//                     PAT_ZIP as zipcode,
//                     SVR12 as isCured,
//                     RACE_DESC as race
//                 from IMS_HCV_PATIENTS as p
//                     JOIN PATIENT_MEDICATIONS as m
//                     ON p.IDW_PATIENT_ID_SYNTH = m.IDW_PATIENT_ID_SYNTH`;

//     let extraParams = ` MEDICATION !="" AND p.IDW_PATIENT_ID_SYNTH !=0  AND p.IDW_PATIENT_ID_SYNTH is not null 
//                     and FIRST_ENCOUNTER is not null
//                     and network_id = (select network_id from HCV_patients where dischargeDate is not null
//                                         and GENOTYPE IN ('1a','1b') LIMIT 1)
//                 order by Year desc`;



//     query = appendFiltersToQuery(query, params, extraParams);



//     // console.log("*********************** ORG patients ***********************************")
//     //     console.log(query);


//     liveDb.db.query(query, function(error, result) {
//         if (error || result.length < 1) {
//             callback(true, error);
//         } else {
//             dataObj['MyNetworkPatients'] = result;
//             // getDrugByGenotype(dataObj, callback);
//             callback(undefined, dataObj);
//         }
//     });
// }



// let appendFiltersToQuery = function(query, params, extraParams) {
//     // Need pass query with no where case.
//     let treatment = params.treatment,
//         cirrhosis = params.cirrhosis,
//         genotype = params.genotypes,
//         hiv = params.hiv,
//         mental_health = params.mental_health,
//         renal_failure = params.renal_failure,
//         liver_assesment = params.liver_assesment,
//         fibroscan = params.fibroscan,
//         fibrosure = params.fibrosure,
//         liverBiopsy = params.liverBiopsy,
//         hcc = params.hcc,
//         chemistry = params.chemistry,
//         alcohol = params.alcohol,
//         ethnicity = params.ethnicity,
//         meld = params.meld,
//         etoh = params.etoh,
//         age = params.age,
//         weight = params.weight,
//         viralLoad = params.viralLoad,
//         apri = params.apri,
//         PatientCount = params.patientCount,
//         rowNo = params.rowNo;


//     var flag = false;
//     query += ' where ';
//     if (treatment != null) {
//         query += ' TREATMENT IN (' + treatment + ')';
//         flag = true;
//     }

//     if (cirrhosis != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' CIRRHOSIS IN (' + cirrhosis + ')';
//         flag = true;
//     }
//     if (genotype != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' GENOTYPE IN (' + genotype + ')';
//         flag = true;
//     }
//     if (hiv != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' HIV IN (' + hiv + ')';
//         flag = true;
//     }
//     if (mental_health != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' MENTAL_HEALTH IN (' + mental_health + ')';
//         flag = true;
//     }
//     if (renal_failure != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' RENAL_FAILURE IN (' + renal_failure + ')';
//         flag = true;
//     }
//     if (liver_assesment != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' LIVER_ASSESMENT IN (' + liver_assesment + ')';
//         flag = true;
//     }
//     if (fibroscan != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' IS_FibroscanLab IN (' + fibroscan + ')';
//         flag = true;
//     }
//     if (fibrosure != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' IS_FibrosureLab IN (' + fibrosure + ')';
//         flag = true;
//     }
//     if (liverBiopsy != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' IS_LiverBiopsyLab IN (' + liverBiopsy + ')';
//         flag = true;
//     }
//     if (hcc != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' IS_HCCLab IN (' + hcc + ')';
//         flag = true;
//     }
//     if (chemistry != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' IS_ChemistryLab IN (' + chemistry + ')';
//         flag = true;
//     }

//     if (alcohol != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' ALCOHOL IN (' + alcohol + ')';
//         flag = true;
//     }
//     if (ethnicity != null) {
//         if (flag)
//             query += ' AND ';
//         query += ' ETHNITY_1_DESC IN (' + ethnicity + ')';
//         flag = true;
//     }

//     if (age != null) {
//         let ageFlag = false;
//         if (flag)
//             query += ' AND ';
//         //console.log(age);
//         //console.log(age.length);
//         query += ' (';
//         for (let i = 0; i < age.length; i++) {
//             switch (age[i]) {
//                 case '0-17':
//                     query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 0 AND (YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) <= 17) ';
//                     ageFlag = true;
//                     flag = true;
//                     break;
//                 case '18-34':
//                     if (ageFlag)
//                         query += ' OR ';
//                     query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 18 AND (YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) <= 34) ';
//                     ageFlag = true;
//                     flag = true;
//                     break;
//                 case '35-50':
//                     if (ageFlag)
//                         query += ' OR ';
//                     query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 35 AND (YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) <= 50) ';
//                     ageFlag = true;
//                     flag = true;
//                     break;
//                 case '51-69':
//                     if (ageFlag)
//                         query += ' OR ';
//                     query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 51 AND (YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) <= 69) ';
//                     ageFlag = true;
//                     flag = true;
//                     break;
//                 case '70+':
//                     if (ageFlag)
//                         query += ' OR ';
//                     query += ' ((YEAR(CURRENT_TIMESTAMP) - BRTH_YR_NBR) >= 70) ';
//                     flag = true;
//                     break;
//             }
//         }
//         query += ') ';
//     }
//     if (meld != null) {
//         let meldFlag = false;
//         if (flag)
//             query += ' AND ';
//         //console.log(age);
//         //console.log(age.length);
//         query += ' (';
//         for (let i = 0; i < meld.length; i++) {
//             switch (meld[i]) {
//                 case '<9':
//                     query += ' (MELD_SCORE <= 9) ';
//                     meldFlag = true;
//                     flag = true;
//                     break;
//                 case '10-19':
//                     if (meldFlag)
//                         query += ' OR ';
//                     query += ' (MELD_SCORE >= 10 AND MELD_SCORE <= 19) ';
//                     meldFlag = true;
//                     flag = true;
//                     break;
//                 case '20-29':
//                     if (meldFlag)
//                         query += ' OR ';
//                     query += ' (MELD_SCORE >= 20 AND MELD_SCORE <= 29) ';
//                     meldFlag = true;
//                     flag = true;
//                     break;
//                 case '30-39':
//                     if (meldFlag)
//                         query += ' OR ';
//                     query += ' (MELD_SCORE >= 30 AND MELD_SCORE <= 39) ';
//                     meldFlag = true;
//                     flag = true;
//                     break;
//                 case '40+':
//                     if (meldFlag)
//                         query += ' OR ';
//                     query += ' (MELD_SCORE >= 40) ';
//                     flag = true;
//                     break;
//             }
//         }
//         query += ') ';
//     }
//     if (etoh != null) {
//         let etohFlag = false;
//         if (flag)
//             query += ' AND ';
//         //console.log(age);
//         //console.log(age.length);
//         query += ' (';
//         for (let i = 0; i < etoh.length; i++) {
//             switch (etoh[i]) {
//                 case '0-50':
//                     if (etohFlag)
//                         query += ' OR ';
//                     query += ' (ETOH >= 0 AND ETOH <= 50) ';
//                     etohFlag = true;
//                     flag = true;
//                     break;
//                 case '51-299':
//                     if (etohFlag)
//                         query += ' OR ';
//                     query += ' (ETOH >= 51 AND ETOH <= 299) ';
//                     etohFlag = true;
//                     flag = true;
//                     break;
//                 case '300-500':
//                     if (etohFlag)
//                         query += ' OR ';
//                     query += ' (ETOH >= 300 AND ETOH <= 500) ';
//                     etohFlag = true;
//                     flag = true;
//                     break;
//             }
//         }
//         query += ' ) ';
//     }
//     if (weight != null) {
//         let weightFlag = false;
//         if (flag)
//             query += ' AND ';
//         //console.log(age);
//         //console.log(age.length);
//         query += ' ( ';
//         for (let i = 0; i < weight.length; i++) {
//             switch (weight[i]) {
//                 case '0-99':
//                     if (weightFlag)
//                         query += ' OR ';
//                     query += ' (BODY_WEIGHT >= 0 AND BODY_WEIGHT <= 99) ';
//                     weightFlag = true;
//                     flag = true;
//                     break;
//                 case '100-199':
//                     if (weightFlag)
//                         query += ' OR ';
//                     query += ' (BODY_WEIGHT >= 100 AND BODY_WEIGHT <= 199) ';
//                     weightFlag = true;
//                     flag = true;
//                     break;
//                 case '200-299':
//                     if (weightFlag)
//                         query += ' OR ';
//                     query += ' (BODY_WEIGHT >= 200 AND BODY_WEIGHT <= 299) ';
//                     weightFlag = true;
//                     flag = true;
//                     break;
//                 case '300-399':
//                     if (weightFlag)
//                         query += ' OR ';
//                     query += ' (BODY_WEIGHT >= 300 AND BODY_WEIGHT <= 399) ';
//                     weightFlag = true;
//                     flag = true;
//                     break;
//                 case '400-499':
//                     if (weightFlag)
//                         query += ' OR ';
//                     query += ' (BODY_WEIGHT >= 400 AND BODY_WEIGHT <= 499) ';
//                     weightFlag = true;
//                     flag = true;
//                     break;
//             }
//         }
//         query += ' ) ';
//     }

//     if (viralLoad != null) {
//         let viralLoadFlag = false;
//         if (flag)
//             query += ' AND ';
//         //console.log(age);
//         //console.log(age.length);
//         query += ' ( ';
//         for (let i = 0; i < viralLoad.length; i++) {
//             switch (viralLoad[i]) {
//                 case '3+':
//                     if (viralLoadFlag)
//                         query += ' OR ';
//                     query += ' (IMS_HCV_PATIENTS.VIRAL_LOAD >= 3000000) ';
//                     viralLoadFlag = true;
//                     flag = true;
//                     break;
//                 case '2-3':
//                     if (viralLoadFlag)
//                         query += ' OR ';
//                     query += ' (IMS_HCV_PATIENTS.VIRAL_LOAD >= 2000000 AND IMS_HCV_PATIENTS.VIRAL_LOAD <= 3000000) ';
//                     viralLoadFlag = true;
//                     flag = true;
//                     break;
//                 case '1-2':
//                     if (viralLoadFlag)
//                         query += ' OR ';
//                     query += ' (IMS_HCV_PATIENTS.VIRAL_LOAD >= 1000000 AND IMS_HCV_PATIENTS.VIRAL_LOAD <= 2000000) ';
//                     viralLoadFlag = true;
//                     flag = true;
//                     break;
//                 case '<1':
//                     if (viralLoadFlag)
//                         query += ' OR ';
//                     query += ' (IMS_HCV_PATIENTS.VIRAL_LOAD <= 1000000) ';
//                     viralLoadFlag = true;
//                     flag = true;
//                     break;
//             }
//         }
//         query += ' ) ';
//     }

//     if (apri != null) {
//         let apriFlag = false;
//         if (flag)
//             query += ' AND ';
//         //console.log(age);
//         //console.log(age.length);
//         query += ' ( ';
//         for (let i = 0; i < apri.length; i++) {
//             switch (apri[i]) {
//                 case '<0.5':
//                     if (apriFlag)
//                         query += ' OR ';
//                     query += ' (APRI < 0.5) ';
//                     apriFlag = true;
//                     flag = true;
//                     break;
//                 case '0.5-1':
//                     if (apriFlag)
//                         query += ' OR ';
//                     query += ' (APRI >= 0.5 AND APRI < 1) ';
//                     apriFlag = true;
//                     flag = true;
//                     break;
//                 case '1-1.5':
//                     if (apriFlag)
//                         query += ' OR ';
//                     query += ' (APRI >= 1 AND APRI < 1.5) ';
//                     apriFlag = true;
//                     flag = true;
//                     break;
//                 case '1.5+':
//                     if (apriFlag)
//                         query += ' OR ';
//                     query += ' (APRI >= 1.5) ';
//                     apriFlag = true;
//                     flag = true;
//                     break;
//             }
//         }
//         query += ' ) ';
//     }
//     let fdaCompliant = params.fdaCompliant;
//     let treatmentPeriods = [];
//     if (fdaCompliant == "yes") {
//         if (flag)
//             query += ' AND ';
//         treatmentPeriods = getFDACompliantTreatmentPeriod();
//         query += ` TREATMENT_PERIOD IN (` + treatmentPeriods + `) `;
//         flag = true;
//     } else if (fdaCompliant == "no") {

//         if (flag)
//             query += ' AND ';
//         treatmentPeriods = getFDACompliantTreatmentPeriod();
//         query += ` TREATMENT_PERIOD NOT IN (` + treatmentPeriods + `) `;
//         flag = true;
//     }
//     if (extraParams != null && extraParams != '') {
//         if (flag)
//             query += ' AND ';
//         query += extraParams;
//         flag = true;
//     }
//     if (!flag) {
//         query = query.replace('where', '');
//     }
//     return query;

// }


// function getFDACompliantTreatmentPeriod() {
//     // console.log(treatmentPeriod);
//     return "8,12,16,24,48";
// }