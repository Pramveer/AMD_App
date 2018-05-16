/*
    Backend api for comorbidity tab.
*/
import * as serverUtils from '../../../common/serverUtils.js';

/**
 * @author: Jayesh Agrawal
 * @date: 01th June 2017
 * @desc: method for Patient with HCC related lab result distrubution
*/

Meteor.syncMethods({
    // query for comorbity tab.
    'getHCCDistributionData': function (params, callback) {
        try {

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

            let caching = new CachingObj({
                key: params.database + "hccdistribution_chart_data"
            });

            if (caching.isDataAvailable()) {
                let data = caching.getAvailableData();
                setTimeout(function () {
                    callback(undefined, data);
                }, 50);
                return false;
            }

            let whereClause = serverUtils.getQueryForAdvFilters(params);
            let preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;
            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
            // console.log('preactiveAntivalsQuery');

            let query = ``,
                dataObj = {};

            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);

            query = `SELECT patients.PATIENT_ID_SYNTH,
		                patients.GENOTYPE,
                        patients.CIRRHOSIS,
                        patients.FibrosureStage,
                        patients.${dbConfig.ethnicity} as ethnicity,
                        patients.IS_HCCLab
                  	    FROM ${dbConfig.tblHcvPatient}  as patients
                        LEFT JOIN ${dbConfig.tblPatientMedication} medication
                        on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                    Where 1=1 -- patients.IS_HCCLab='Yes'
                    ${whereClause} ${preactiveAntivalsQuery};`;

            // console.log("****HCC Query");
            // console.log(query);

            liveDb.db.query(query, function (error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {


                    let stringified = JSON.stringify(prepareHCCDistributionChartData({
                        data: result
                    }));
                    //  console.log('Source:'+stringified.length);
                    let compressed_object = LZString.compress(stringified);

                    // @author: Yuvraj 13th Feb 17 - Saving data into caching object.
                    let caching = new CachingObj({
                        key: params.database + "hccdistribution_chart_data",
                        data: compressed_object
                    });
                    caching.updateData();

                    callback(undefined, compressed_object);
                    // callback(undefined, dataObj);
                }
            });
        } catch (ex) {
            //console.log(JSON.stringify(ex));
        }
    }
});



/**
 * Description : Prepare required charts data for HCC distribution data
 *
 */
let prepareHCCDistributionChartData = ({ data }) => {

    let finalData = {},
    totalHCCPatientCount = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');
 data = data.filter(function(d) {
     return d.IS_HCCLab == 'Yes';
 });

 uniqueHCCPatientCount = serverUtils.getUniqueCount(data, 'PATIENT_ID_SYNTH');

 finalData.totalHCCPatientCount = totalHCCPatientCount;
    finalData.uniqueHCCPatientCount = uniqueHCCPatientCount;
    //  Patient with HCC related lab result distrubution by GENOTYPE
    finalData.genotypeDistribution = prepareHighchartGroupData({ groupedData: _.groupBy(data, 'GENOTYPE'), uniqueHCCPatientCount: uniqueHCCPatientCount });
    //  Patient with HCC related lab result distrubution by CIRRHOSIS
    finalData.cirrhosisDistribution = prepareHighchartGroupData({ groupedData: _.groupBy(data, 'CIRRHOSIS'), uniqueHCCPatientCount: uniqueHCCPatientCount });
    //  Patient with HCC related lab result distrubution by ethnicity
    finalData.ethnicityDistribution = prepareHighchartGroupData({ groupedData: _.groupBy(data, 'ethnicity'), uniqueHCCPatientCount: uniqueHCCPatientCount });
    //  Patient with HCC related lab result distrubution by FibrosureStage
    let fibrosureStageData = _.filter(data, (rec) => {
        return rec.FibrosureStage != null;
    });
    fibrosureStageData = _.map(fibrosureStageData, (rec) => {
        rec.FibrosureStage = 'F' + rec.FibrosureStage;
        return rec;
    });
    finalData.fibrosureStageDistribution = prepareHighchartGroupData({ groupedData: _.groupBy(fibrosureStageData, 'FibrosureStage'), uniqueHCCPatientCount: uniqueHCCPatientCount });

    return finalData;
}

let prepareHighchartGroupData = ({ groupedData, uniqueHCCPatientCount }) => {
    let chartData = [];

    for (let key in groupedData) {
        let uniquePatientCount = serverUtils.getUniqueCount(groupedData[key], 'PATIENT_ID_SYNTH');
        chartData.push({
            name: key,
            y: uniquePatientCount,
            totalPatient: uniqueHCCPatientCount,
            patientPercentage: parseFloat(uniquePatientCount * 100 / uniqueHCCPatientCount).toFixed(2)
        });
    }

    return chartData;
}
