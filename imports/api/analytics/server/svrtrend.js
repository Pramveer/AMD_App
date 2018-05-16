/*
    Backend api for Treatment Efficacy tab.
*/
import * as serverUtils from '../../common/serverUtils.js';
import * as analyticsChartsLib from './analyticsChartsData.js';

Meteor.syncMethods({
    /**
     * @author Yuvraj (13th Feb 17) :  This function is being used in Treatment Effiacy tab as well as Patient Journey tab in Analytics.
     */
    'getTreatmentEfficacyDataAnalytics': function(params, callbackFn) {
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
                key: params.database + "analytics_treatment_efficacy"
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

            // if (params.showPreactingAntivirals) {
            //     preactiveAntivalsQuery = ``;
            // }

            let PatientsJourney = [];
            let getIndividualPJData = params.showIndividualPJ ? true : false;

            /**
             * @author: Yuvraj Pal (17th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // let query = `select
            // medication.IDW_PATIENT_ID_SYNTH,PatientId ,ViralLoad,
            // ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) as Weeks,
            // Perfed_Dt,STRT_DATE,END_DATE,GENOTYPE,CIRRHOSIS,TREATMENT,
            // MEDICATION,TREATMENT_PERIOD
            // from PATIENT_MEDICATIONS as medication
            // join ALL_VIRAL_LOAD_RESULTS res
            // on medication.PATIENT_ID_SYNTH = res.PatientId join IMS_HCV_PATIENTS as patients
            // on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
            // where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$')
            // AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) > -8
            // AND ROUND(DATEDIFF(Perfed_Dt, STRT_DATE)/7, 0) < 70
            // ${whereClause} ${preactiveAntivalsQuery}
            // AND medication.IDW_PATIENT_ID_SYNTH <> 0`;
            /**
             * @author: Nisha
             * @date: 17th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            if (dbConfig.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            let query = `select
                            medication.PATIENT_ID_SYNTH,
                            PatientId ,
                            case when ViralLoad like '%NOT DETECTED%' then 0 else ViralLoad end as ViralLoad,
                            ROUND(DATEDIFF(${dbConfig.Perfed_Dt}, STRT_DATE)/7, 0) as Weeks,
                            ${dbConfig.Perfed_Dt} as Perfed_Dt,
                            STRT_DATE,
                            END_DATE,
                            GENOTYPE,
                            CIRRHOSIS,
                            TREATMENT,
                            MEDICATION,
                            TREATMENT_PERIOD
                        from ${dbConfig.tblPatientMedication} as medication
                        join ${dbConfig.tblViralload} res
                            on medication.PATIENT_ID_SYNTH = res.PatientId join ${dbConfig.tblHcvPatient} as patients
                            on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                        where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$' or ViralLoad like '%NOT DETECTED%')
                            AND ROUND(DATEDIFF(${dbConfig.Perfed_Dt}, STRT_DATE)/7, 0) > -8
                            AND ROUND(DATEDIFF(${dbConfig.Perfed_Dt}, STRT_DATE)/7, 0) < 70
                            ${whereClause} ${preactiveAntivalsQuery} `;

            // console.log('*********** Patients Journey Query**************');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    PatientsJourney = result;
                    if (!getIndividualPJData) {
                        PatientsJourney = JSON.stringify(PatientsJourney);
                        callbackFn(undefined, PatientsJourney);
                    } else {
                        let dataObj = {};
                        dataObj.patientsJourney = PatientsJourney;
                        // var CountData = _.uniq(PatientsJourney, function(person) {
                        //     return person.PATIENT_ID_SYNTH;
                        // });
                        // console.log('CountData');
                        // console.log(CountData);
                        dataObj.patientDistributionData = analyticsChartsLib.getAnalyticsPJDistribution(PatientsJourney);

                        // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                        let caching = new CachingObj({
                            key: params.database + "analytics_treatment_efficacy",
                            data: JSON.stringify(dataObj)
                        });
                        caching.updateData();

                        callbackFn(undefined, JSON.stringify(dataObj));
                    }

                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }

    },

    // Yuvraj 10th Feb 17 - the following function was written in the pharma tab api folder.
    // I have just copied it here sothat I don't get any conflict with pharma data
    // this query is being used in the treatmentefficacy tab.  I have changed the name of the function to diffrentiate.
    'getTreatmentEfficacyViralScoreAnalysisData': function(params, callback) {
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

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            let caching = new CachingObj({
                key: params.database + "getTreatmentEfficacyViralScoreAnalysisData"
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
                preactiveAntivalsQuery = ` AND medication.IS_PREACTING_ANTIVIRAL = 'NO' `;


            /**
             * @author: Nisha
             * @date: 17th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            // Dynamic condition for PREACTING_ANTIVIRAL
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            query = `SELECT medication.PATIENT_ID_SYNTH,
                        PatientId ,
                        PAID as cost,                      
                        case when ViralLoad like '%NOT DETECTED%' then 0 else ViralLoad end as ViralLoad,
                        ${dbConfig.Perfed_Dt} as Perfed_Dt,
                        STRT_DATE,
                        END_DATE,
                        GENOTYPE,
                        FibrosureValue as fibro_Value,
                        CIRRHOSIS,
                        RACE_DESC,
                        GENDER_CD,
                        ${dbConfig.age} as Age,
                        TREATMENT,
                        MEDICATION,
                        TREATMENT_PERIOD
                    from ${dbConfig.tblPatientMedication}  medication
                    join ${dbConfig.tblViralload}  res
                        on medication.PATIENT_ID_SYNTH = res.PatientId
                    join ${dbConfig.tblHcvPatient} patients
                        on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    where (ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$' or ViralLoad like '%NOT DETECTED%')
                        AND MEDICATION IS NOT NULL
                        ${whereClause}
                        ${preactiveAntivalsQuery}
                    ORDER BY STRT_DATE ASC`;

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


                    // @author: Yuvraj 10 Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "getTreatmentEfficacyViralScoreAnalysisData",
                        data: JSON.stringify(dataObj)
                    });
                    caching.updateData();

                    callback(undefined, JSON.stringify(dataObj));
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
});