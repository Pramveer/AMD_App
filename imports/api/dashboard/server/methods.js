import * as dashUtils from './dashUtils.js';
import * as serverUtils from '../../common/serverUtils.js';
Meteor.methods({
    'filterDataForDashBoard': function(filtersArray) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!_.isArray(filtersArray)) {
                console.log('Invalid Parameters');
                return undefined;
            }
            let baseData = dashUtils.getPatientsData(),
                modifiedData = [];
            let filtersArrayFlag = 0;
            if (filtersArray.length) {
                modifiedData = dashUtils.filterChartData(baseData, filtersArray,true);
                filtersArrayFlag = 1;
            } else {
                modifiedData = baseData;
                let filteredDate = new Date("2013-01-01").getTime();
                modifiedData = modifiedData.filter((rec) => new Date(rec.admissionDate).getTime() >= filteredDate);
            }
            filtersArrayFlag = _.where(filtersArray, { type: 'custom' }).length > 0 ? 1 : 0;
            let finalData = [];
            try{
                finalData = dashUtils.prepareChartsData(modifiedData,filtersArrayFlag);
            }catch(ex){}
            let stringified = JSON.stringify(finalData);
            //  console.log('Dashboard Source:'+stringified.length);
            let compressed_object = LZString.compress(stringified);
            return compressed_object;

        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
        'filterDataForDashBoardClient': function(filtersArray) {
            try {
                // Early exit condition
                //console.log(this.userId);
                if (!isValidUser({
                        userId: this.userId
                    })) {
                    console.log('User not logged in');
                    return undefined;
                }
                if (!_.isArray(filtersArray)) {
                    console.log('Invalid Parameters');
                    return undefined;
                }
                let baseData = dashUtils.getPatientsDataClient(),
                    modifiedData = [];
                let filtersArrayFlag = 0;
                if (filtersArray.length) {
                    modifiedData = dashUtils.filterChartData(baseData, filtersArray);
                    filtersArrayFlag = 1;
                } else {
                    modifiedData = baseData;
                    let filteredDate = new Date("2013-01-01").getTime();
                    modifiedData = modifiedData.filter((rec) => new Date(rec.admissionDate).getTime() >= filteredDate);
                }
                filtersArrayFlag = _.where(filtersArray, { type: 'custom' }).length > 0 ? 1 : 0;
                let finalData = [];
                try{
                    finalData = dashUtils.prepareChartsData(modifiedData, filtersArrayFlag);
                }catch(ex){
                    console.log(ex);
                }
            
                let stringified = JSON.stringify(finalData);
                //  console.log('Dashboard Source:'+stringified.length);
                let compressed_object = LZString.compress(stringified);
                return compressed_object;

            } catch (ex) {
                console.log(JSON.stringify(ex));
            }
        }
});

Meteor.syncMethods({
    'getTreatedPatientsDataForDashboards': function(params, callback) {
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
            let query = '',
                query1;

            /**
             * @author: Yuvraj Pal (16th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             * @author: Yuvraj 20th Feb : Added Preacting antiviral column.
             Removed query
             * @author: Arvind
             * @reviewer: 
             * @date: 05-Apr-2017
             * @desc: Adeed 'is_hospitalized' and 'is_liver_failure' column previously this flag was calculated
             *  by Hospitalization_Cost and liver_disease_cost
             */
            query = `select 
                    IMS_HCV_PATIENTS.PATIENT_ID_SYNTH as patientId,
                    IMS_HCV_PATIENTS.IDW_PATIENT_ID_SYNTH as patientId1, 
                    Age as age, 
                    GENOTYPE as genotype,
                    CIRRHOSIS as cirrhosis,
                    IMS_HCV_PATIENTS.VIRAL_LOAD  as viralLoad,
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
                    UPPER(RACE_DESC)  as race,
                    BODY_WEIGHT as weight,
                    ETHNITY_1_DESC as ethnicity,
                    CIRRHOSISTYPE as cirrhosistype,
                    FIRST_ENCOUNTER as dischargeDate, 
                    MEDICATION as medication,
                    IS_RETREATED,
                    IMS_HCV_PATIENTS.APRI as "APRI" ,
                    CLAIMS_INSURANCEPLAN,
                    PATIENT_MEDICATIONS.IS_COMPLETED,
                    PATIENT_MEDICATIONS.SVR12,
                    NO_PRESCRIPTION,
                    (CASE 
                    WHEN CLAIMS_INSURANCEPLAN REGEXP '^Commercial' = 1 THEN 'Commercial' 
                    WHEN CLAIMS_INSURANCEPLAN REGEXP '^Medicaid' = 1 THEN 'Medicaid' 
                    WHEN CLAIMS_INSURANCEPLAN REGEXP '^Medicare' = 1 THEN 'Medicare' 
                    WHEN CLAIMS_INSURANCEPLAN = 'No Enrollment' THEN 'No Enrollment' 
                    ELSE 'NA'
                    END)
                    as InsuranceGrp,
                    RETREATMENT_CONSIDER,
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
                FROM IMS_HCV_PATIENTS  
                LEFT OUTER JOIN PATIENT_MEDICATIONS 
                    ON IMS_HCV_PATIENTS.PATIENT_ID_SYNTH  = PATIENT_MEDICATIONS.PATIENT_ID_SYNTH
                ORDER BY END_DATE DESC`;


            // console.log('*********Dashboard*************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {

                    //dummy check for fibrosis value
                    dashUtils.setPatientsData(result);
                    //console.log("Set PatientData");
                    //filter data by time 
                    let filteredDate = new Date("2013-01-01").getTime();

                    result = result.filter((rec) => new Date(rec.admissionDate).getTime() >= filteredDate);

                    let data = dashUtils.prepareChartsData(result);
                    let stringified = JSON.stringify(data);
                    //  console.log('Dashboard Source:'+stringified.length);
                    let compressed_object = LZString.compress(stringified);
                    // console.log('Dashboard Compressed Data:'+compressed_object.length);
                    callback(undefined, compressed_object);
                }
            });

        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPatientsDataForCustomer': function(params, callbackFn) {
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

            /**
             * @author: Yuvraj Pal (16th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             * @author: Yuvraj 20th Feb : Added Preacting antiviral column. 
             */
            let query = `SELECT 
                            patients.PATIENT_ID_SYNTH as patientId,
                            patients.UCI AS patientId1, 
                            AGE_RANGE as age, 
                            GENOTYPE as genotype,
                            CIRRHOSIS as cirrhosis,
                            patients.VIRAL_LOAD  as viralLoad,
                            TREATMENT as treatment,
                            GENDER_CD as gender, 
                            STRT_DATE as start_date,
                            ST_CD as state_code,
                            FibrosureStage,
                            FIRST_ENCOUNTER as admissionDate,
                            year(FIRST_ENCOUNTER) as yearAdmission,
                            (case when ALCOHOL = "Yes" then 1 else 0 end) as Alcohol, 
                            (case when MENTAL_HEALTH = "Yes" then 1 else 0 end) as "Mental Health",
                            (case when RENAL_FAILURE = "Yes" then 1 else 0 end)  as "Renal Failure",
                            IS_ANIMIA as anemia,"" as Cardiovascular,MELD_SCORE as meldScore, 
                            (case when HIV = "Yes" then 1 else 0 end) as HIV,"" as Muscular_dystrophy,
                            "" as Schistosomiasis_coinfection,
                            PAT_ZIP as zipcode, 
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
                            UPPER(RACE_DESC)  as race,
                            BODY_WEIGHT as weight,
                            ETHNICITY as ethnicity,
                            CIRRHOSISTYPE as cirrhosistype,
                            FIRST_ENCOUNTER as dischargeDate,
                            IS_RETREATED, 
                            MEDICATION as medication,
                            patients.APRI as "APRI" ,
                            CLAIMS_INSURANCEPLAN,
                            IS_COMPLETED,
                            medications.SVR12,
                            NO_PRESCRIPTION,
                            (CASE 
                            WHEN CLAIMS_INSURANCEPLAN REGEXP '^Commercial' = 1 THEN 'Commercial' 
                            WHEN CLAIMS_INSURANCEPLAN REGEXP '^Medicaid' = 1 THEN 'Medicaid' 
                            WHEN CLAIMS_INSURANCEPLAN REGEXP '^Medicare' = 1 THEN 'Medicare' 
                            WHEN CLAIMS_INSURANCEPLAN = 'No Enrollment' THEN 'No Enrollment' 
                            ELSE 'NA'
                            END)
                            as InsuranceGrp,
                            RETREATMENT_CONSIDER,
                            (case when MEDICATION is not null  then 1 else 0 end) as "Antiviral Therapy" , 
                            cast(PAID as decimal(12,2)) as claims_cost, 
                            cast(PAID as decimal(12,2)) as "Antiviral Therapy_Cost",
                            (case when Liver_Disease_Cost is null or Liver_Disease_Cost=0 then 0 else 1 end) as "Liver Disease", 
                            cast(Liver_Disease_Cost as decimal(12,2)) as "Liver Disease_Cost",
                            FibrosureValue as fibro_Value,
                            Physician_Service_Cost as "Physician Service_Cost",
                            (case when Physician_Service_Cost is not null  then 1 else 0 end) as "Physician Service",
                            Hospitalization_Cost,
                            (case when Hospitalization_Cost is not null  then 1 else 0 end) as "Hospitalization",
                            'NO' as IS_PREACTING_ANTIVIRAL  
                        FROM PHS_HCV.PHS_HCV_PATIENTS  as patients
                        LEFT OUTER JOIN PHS_HCV.PHS_PATIENT_MEDICATIONS as medications 
                            ON patients.PATIENT_ID_SYNTH  = medications.PATIENT_ID_SYNTH 
                        ORDER BY GENOTYPE,END_DATE DESC`;

            liveDb.db.query(query, (error, result) => {
                if (error) {
                    console.log(error);
                    return;
                } else {

                    //console.log("Set PatientData");
                    //console.log('second query');
                    dashUtils.setPatientsDataClient(result);
                    let filteredDate = new Date("2013-01-01").getTime();

                    result = result.filter((rec) => new Date(rec.admissionDate).getTime() >= filteredDate);
                    let data = dashUtils.prepareChartsData(result);
                    let stringified = JSON.stringify(data);
                    let compressed_object = LZString.compress(stringified);

                    callbackFn(undefined, compressed_object);
                }
            });

        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
});
