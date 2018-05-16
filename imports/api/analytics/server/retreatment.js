/*
    Backend api for Retreatment tab.
*/
import * as serverUtils from '../../common/serverUtils.js';
import * as analyticsChartsLib from './analyticsChartsData.js';


Meteor.syncMethods({

    'getRetreatmentPatientData': function(params, callback) {
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
            /**
             * @author:Nisha Regil (19 May 2017)
             * @desc:  Implementation for comparision view
             */
            let caching = new CachingObj({
                key: params.database + "analytics_retreatment_data"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function() {
                    callback(undefined, data);
                }, 50);
                return false;
            }

            let query = ``;
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            let dataObj = {};
            // console.log(params);
            // console.log("*** WWHERE CLAUSE ****");
            // console.log(whereClause);

            /**
             * @author: Yuvraj Pal (20th Feb 2017)
             * @desc: Modified queries to use PATIENT_ID_SYNTH insted of IDW_PATIENT_ID_SYNTH
             */

            // query = `SELECT LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine,medication.PATIENT_ID_SYNTH ,medication.IDW_PATIENT_ID_SYNTH , MEDICATION ,
            //  TREATMENT_PERIOD ,NDC , STRT_DATE ,END_DATE ,DAYS_MEDICATION ,patients.VIRAL_LOAD , SVR12 ,  Age ,GENDER_CD ,DEAD_IND,
            //  RACE_DESC ,   GENOTYPE , CIRRHOSIS , TREATMENT , TREATMENT_CONDITION ,PAID
            //  FROM  PATIENT_MEDICATIONS as medication INNER JOIN IMS_HCV_PATIENTS patients
            //  on medication.IDW_PATIENT_ID_SYNTH = patients.IDW_PATIENT_ID_SYNTH
            //  where MEDICATION IS NOT NULL AND medication.IDW_PATIENT_ID_SYNTH <> 0
            //  ${whereClause} ${preactiveAntivalsQuery}`;
            //// Modified:Arvind,20-FEB-2017 Group by 'MEDICATION' instead of 'NDC' column
            ////and added patients.IS_RETREATED='YES' and FDA Complaint treatment period in where condition
            /**
             * @author: Nisha
             * @date: 17th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            //  medication.IDW_PATIENT_ID_SYNTH,
            // console.log(params.database);
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            query = `SELECT
                        LENGTH(MEDICATION) - LENGTH(REPLACE(MEDICATION, '+', '')) as othermedicine,
                        medication.PATIENT_ID_SYNTH,
                        MEDICATION,
                        TREATMENT_PERIOD ,
                        NDC,
                        STRT_DATE,
                        END_DATE,
                        DAYS_MEDICATION,
                        patients.VIRAL_LOAD,
                        SVR12,
                        ${dbConfig.age} as Age,
                        GENDER_CD,
                        DEAD_IND,
                        RACE_DESC,
                        GENOTYPE,
                        CIRRHOSIS,
                        TREATMENT,
                        TREATMENT_CONDITION,
                        sum(PAID) as PAID,
                        count(1) as TreatmentCount,
                        IS_RETREATED
                        FROM ${dbConfig.tblPatientMedication} as medication
                        JOIN ${dbConfig.tblHcvPatient} patients
                            on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH
                        WHERE MEDICATION IS NOT NULL                        
                        ${whereClause} ${preactiveAntivalsQuery}
                          AND medication.TREATMENT_PERIOD IN (${serverUtils.getFDACompliantTreatmentPeriod()})
                         GROUP BY medication.PATIENT_ID_SYNTH,MEDICATION`;

            //   GROUP BY medication.PATIENT_ID_SYNTH,NDC `; -- AND patients.IS_RETREATED='YES'
            // console.log(query);
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log('getRetreatmentPatientData');
                    console.log(error);
                    return;
                } else {
                    // console.log('********* Result fetched *************');
                    // dataObj.TotalN = result.length;
                    dataObj.RetreatedDistribution = analyticsChartsLib.prepareRetreatmentDistributionWithMedication(result);
                    // console.log(dataObj.RetreatedDistribution);
                    // @author: Yuvraj 13th Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "analytics_retreatment_data",
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