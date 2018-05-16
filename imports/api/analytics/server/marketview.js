/*
    Backend api for marketview tab.
*/
import * as serverUtils from '../../common/serverUtils.js';


Meteor.syncMethods({
    // query for comorbity tab.
    //New Chart with market share over month
    'getMarketViewChartData': function(params, callbackFn) {
        try {
            // Early exit condition
            // console.log(this.userId);
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
                key: params.database + "analytics_marketview_chart"
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
             * @author: Jayesh Agrawal (24th March 2017)
             * @desc: Added code for Medication Market After FDA Approval Dec 2013
			 http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/combo-dual-axes/
             */
            /**
             * @author: Nisha
             * @date: 17th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            // console.log(preactiveAntivalsQuery);
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
                            medication.STRT_DATE as start_date,
                            medication.TREATMENT_PERIOD as treatmentPeriod,
                            medication.MEDICATION as medication,
                            patients.PATIENT_ID_SYNTH as patientId,
                            IS_PREACTING_ANTIVIRAL as IS_PREACTING_ANTIVIRAL 
                        from ${dbConfig.tblHcvPatient}  as patients
                        JOIN ${dbConfig.tblPatientMedication} as medication
                        on medication.PATIENT_ID_SYNTH = patients.PATIENT_ID_SYNTH WHERE
                        medication.MEDICATION IS NOT NULL
                        ${whereClause}
                        ${preactiveAntivalsQuery}`;


            // console.log('**********Market View Tab Query***********');
            // console.log(query);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    //set the data rows in the variable
                    let dataObj = {};
                    let drugsData = prepareMarketShareOverMonthsChartData(result);
                    dataObj['MarketShareOverMonthsChartData'] = drugsData;
                    // dataObj['MarketShareTotalUniquePatients'] = serverUtils.getUniqueCount(result, 'patientId');
                    let compressed_object = LZString.compress(JSON.stringify(dataObj));
                    let caching = new CachingObj({
                        key: params.database + "analytics_marketview_chart",
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
    //query for prescription risk distribution
    'getPrescriptionCountData': function(params, callbackFn) {
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
                    cb: callbackFn
                })) {
                //console.log('Invalid Parameters');
                return undefined;
            }

            // @Yuvraj 10 Feb 17 -  caching Implementation.
            // let caching = new CachingObj({
            //     key: "analytics_prediction_distribution"
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

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }
             //console.log(preactiveAntivalsQuery);
            /**
             * @author: Nisha
             * @date: 17th May 17
             * @desc: Modified the query for Implementation of switch DB.
             */
            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
               /**
             * @author: Jayesh
             * @date: 31th May 2017 
             * @desc: commented below condition as IMS platform we are using preactive antivals condition.
            */
            // if (dbConfig.showPreactingAntivirals) {
            //     preactiveAntivalsQuery = ``;
            // }
            /*  let query = `select count(PATIENT_ID_SYNTH) as PrescriptionCount ,pat_meds.MEDICATION,avg(CHARGE) as CHARGE  
				from ((select medication.PATIENT_ID_SYNTH,MEDICATION,TREATMENT_PERIOD from join ${dbConfig.tblPatientMedication} medication join ${dbConfig.tblHcvPatient} as patients
				on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
				 where medication.MEDICATION is not NULL ${whereClause} ${preactiveAntivalsQuery} ) as pat_meds inner join 
				(select  MEDICATION,TREATMENT_PERIOD,avg(CHARGE) as CHARGE from IMS_LRX_AmbEMR_Dataset.MEDS_CLAIMS_ALL group by MEDICATION,TREATMENT_PERIOD) as claims on 
				claims.MEDICATION = pat_meds.MEDICATION and pat_meds.TREATMENT_PERIOD = claims.TREATMENT_PERIOD) 
				group by MEDICATION;`;*/

            let query = `select count(patients.PATIENT_ID_SYNTH) TotalPrescriptionCount, count(distinct patients.PATIENT_ID_SYNTH) as PrescriptionCount, MEDICATION, avg(PAID) as CHARGE from 
                ${dbConfig.tblPatientMedication} medication  join ${dbConfig.tblHcvPatient} as patients
                on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH
                where medication.MEDICATION is not NULL ${whereClause} ${preactiveAntivalsQuery}  group by MEDICATION;`;

            // console.log('************Prescription Data Distribution query*************');
            // console.log(query);
            let chartData = {};

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                } else {
                    let chartJson = {};
                    chartJson['prepareCounts'] = preparePrescriptionCounts(result);
                    // chartJson['prepareIngredientCounts'] = prepareIngredientCounts(result);
                    chartJson['prescriptionCount'] = prepareDataForPrescriptionChart(result);
                    chartJson['costPrescription'] = prepareDataforRxCostPrescription(result);
                    let compressed_object = LZString.compress(JSON.stringify(chartJson));
                    // let caching = new CachingObj({
                    //     key: "analytics_prediction_distribution",
                    //     data: compressed_object
                    // });
                    // caching.updateData();

                    callbackFn(undefined, compressed_object);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
});


/**
 * @author: Jayesh Agrawal (29th March 2017)
 * @desc: Added code for Medication Market After FDA Approval Dec 2013
 */
let prepareMarketShareOverMonthsChartData = (data) => {
    // Expected Format for chart
    // [{
    //     name: 'Patient Count',
    //     type: 'column',
    //     yAxis: 1,
    //     data: [{name : xaxis, y:value, extraValue:data}],
    //     },
    //  {
    //     name: 'Medication Name',
    //     type: 'line',
    //     data: [{name : xaxis, y:value, extraValue:data}],
    //     }]
    // console.log(data);
    let chartData = {};

    // filter Data of After FDA Approval Dec 2013.
    filterData = data;
    // commented by Yuvraj 28 June 2017
    // let filterData = _.filter(data, (rec) => {
    //     let startDate = moment(new Date(rec.start_date));
    //     return startDate.isAfter(new Date('12-01-2013')) && rec.medication;
    // });
    // filterData = _.sortBy(filterData, (rec) => {
    //     let dt = new Date(rec.start_date);
    //     return dt;
    // });
    chartData.UniquetotalPatient = serverUtils.getUniqueCount(filterData, 'patientId');
    chartData.totalPatient = filterData.length;
    // format start date into DEC-2013 (MMM-YYYY).
    filterData = _.map(filterData, (rec) => {
        rec.STRT_DATE_FORMATED = moment(new Date(rec.start_date)).format("MMM-YYYY");
        return rec;
    });

    // grouping Data By Start startDate
    let groupedData = _.groupBy(filterData, (rec) => {
        return rec.STRT_DATE_FORMATED;
    });

    let seriesDataArrayObj = [];
    // prepare patient count series
    let patienCountJsonObj = {};
    patienCountJsonObj.name = 'Total Prescription'; // 'Patient Count'
    patienCountJsonObj.type = 'column'; //'column'
    patienCountJsonObj.totalPatientCount = filterData.length;
    patienCountJsonObj.yAxis = 1;

    let patienCountDataArray = [];
    for (let key in groupedData) {
        let tempJsonObj = {};
        tempJsonObj.name = key;
        tempJsonObj.y = groupedData[key].length;
        //tempJsonObj.color = '#e1e5e6';
        let distinctPatientList = _.uniq(groupedData[key], function(rec) { return rec.patientId; });
        tempJsonObj.distinctPatientCount = distinctPatientList.length;
        patienCountDataArray.push(tempJsonObj);
    }
    patienCountJsonObj.data = patienCountDataArray;

    seriesDataArrayObj.push(patienCountJsonObj);

    let seriesCategoryArray = [];
    for (let key in groupedData) {
        seriesCategoryArray.push(key);
    }

    // grouping Data By medication
    let singleMedicationList = [];
    let medicationGroupedData = _.groupBy(filterData, (rec) => {
        return rec.medication;
    });
    for (let key in medicationGroupedData) {
        let tempGroupedData = _.groupBy(medicationGroupedData[key], (rec) => {
            return rec.STRT_DATE_FORMATED;
        });
        seriesDataArrayObj.push(getSeriesFitData(tempGroupedData, { name: key, totalCount: medicationGroupedData[key].length }, 'line', patienCountDataArray));
        if (key.split('+').length == 1) {
            singleMedicationList.push(key);
        }
    }
    chartData.marketShareOverMonthsChartData = seriesDataArrayObj;
    chartData.seriesCategoryArray = seriesCategoryArray;
    chartData.singleMedicationList = singleMedicationList;
    //chartData.filterData= filterData;
    return chartData;
}

let getSeriesFitData = (groupedData, medication, type, allPatientGroupByMonthData) => {
    let mainJsonObj = {};
    mainJsonObj.name = medication.name; // 'Patient Count'
    mainJsonObj.totalPatientCount = medication.totalCount;
    mainJsonObj.type = type; //'column'
    let tempDataArray = [];

    let patientCount = 0;
    let percentage = 0;
    _.each(allPatientGroupByMonthData, (rec) => {
        patientCount = 0;
        for (let key in groupedData) {
            if (key === rec.name) {
                patientCount = groupedData[key].length;
            }
        }
        percentage = patientCount == 0 ? 0 : parseFloat(parseFloat((patientCount * 100) / rec.y).toFixed(2));
        let tempJsonObj = {};
        tempJsonObj.name = rec.name;
        tempJsonObj.y = isNaN(percentage) ? 0 : percentage;
        tempJsonObj.patientCount = patientCount;
        // tempJsonObj.color = settingMedicationColor(rec.name);
        tempDataArray.push(tempJsonObj);
    });

    mainJsonObj.data = tempDataArray;
    return mainJsonObj;

}




// supporting functions for ICER Chart in Cost Burden tab.
let preparePrescriptionCounts = (data) => {
    var totalPrescriptions = 0;
    var uniquePrescriptions = 0;
    var dataObj = {};
    for (i = 0; i < data.length; i++) {
        totalPrescriptions = totalPrescriptions + data[i].TotalPrescriptionCount;
        uniquePrescriptions = uniquePrescriptions + data[i].PrescriptionCount;
    }
    dataObj.totalPrescriptionsCount = totalPrescriptions;
    dataObj.uniquePrescriptionsCount = uniquePrescriptions;

    // var filterdata = data.filter(function(d) {
    //     return (d.MEDICATION.indexOf("+") == -1)
    // });
    // totalPrescriptions = 0;
    // for (i = 0; i < filterdata.length; i++) {
    //     totalPrescriptions = totalPrescriptions + filterdata[i].PrescriptionCount;
    // }

    // dataObj.SinglePrescriptionsCounts = totalPrescriptions;

    // filterdata = data.filter(function(d) {
    //     return (d.MEDICATION.indexOf("+") !== -1)
    // });
    // totalPrescriptions = 0;
    // for (i = 0; i < filterdata.length; i++) {
    //     totalPrescriptions = totalPrescriptions + filterdata[i].PrescriptionCount;
    // }
    // dataObj.CombinedPrescriptionsCounts = totalPrescriptions;

    return dataObj;
}


let prepareIngredientCounts = (data) => {
    var totalIngredientCost = 0;
    var dataObj = {};
    for (i = 0; i < data.length; i++) {
        totalIngredientCost = totalIngredientCost + (data[i].PrescriptionCount * data[i].CHARGE);
    }
    dataObj.totalPrescriptionsCount = totalIngredientCost;

    var filterdata = data.filter(function(d) {
        return (d.MEDICATION.indexOf("+") == -1)
    });
    totalIngredientCost = 0;
    for (i = 0; i < filterdata.length; i++) {
        totalIngredientCost = totalIngredientCost + (data[i].PrescriptionCount * data[i].CHARGE);
    }

    dataObj.SinglePrescriptionsCounts = totalIngredientCost;

    filterdata = data.filter(function(d) {
        return (d.MEDICATION.indexOf("+") !== -1)
    });
    totalIngredientCost = 0;
    for (i = 0; i < filterdata.length; i++) {
        totalIngredientCost = totalIngredientCost + (data[i].PrescriptionCount * data[i].CHARGE);
    }
    dataObj.CombinedPrescriptionsCounts = totalIngredientCost;

    return dataObj;
}

let prepareDataForPrescriptionChart = (data) => {
    var totalPrescriptions = 0;
    var seriesdata = [];
    var chartData = {};
    var dataObj = {};
    for (i = 0; i < data.length; i++) {
        // console.log(temp1[i].PrescriptionCount);
        totalPrescriptions = totalPrescriptions + data[i].PrescriptionCount;
    }
    // dataObj.totalPrescriptionsCount = totalPrescriptions;
    // console.log(totalPrescriptions);
    for (i = 0; i < data.length; i++) {
        data[i].PrescriptionCountPercent = (data[i].PrescriptionCount / totalPrescriptions) * 100;
    }

    for (i = 0; i < data.length; i++) {
        if (data[i].MEDICATION.indexOf('+') != -1) {
            chartData = ({
                name: data[i].MEDICATION,
                y: data[i].PrescriptionCountPercent,
                PrescriptionCount: data[i].PrescriptionCount,
                TotalPrescription: totalPrescriptions,
                PCharge: data[i].CHARGE,
                color: serverUtils.settingMedicationColor(data[i].MEDICATION)
            });
            seriesdata.push(chartData);
        }
    }

    // All Prescription Count 
    dataObj.AllPrescriptions = seriesdata;

    var filterdata = data.filter(function(d) {
        return (d.MEDICATION.indexOf("+") == -1)
    });

    // totalPrescriptions = 0;
    seriesfilterdata = [];
    chartfilterdata = {};

    // for (i = 0; i < filterdata.length; i++) {
    //     // console.log(temp1[i].PrescriptionCount);
    //     totalPrescriptions = totalPrescriptions + filterdata[i].PrescriptionCount;
    // }
    // console.log(totalPrescriptions);
    for (i = 0; i < filterdata.length; i++) {
        filterdata[i].PrescriptionCountPercent = (filterdata[i].PrescriptionCount / totalPrescriptions) * 100;
    }

    for (i = 0; i < filterdata.length; i++) {

        chartfilterdata = ({ name: filterdata[i].MEDICATION, y: filterdata[i].PrescriptionCountPercent, PrescriptionCount: filterdata[i].PrescriptionCount, TotalPrescription: totalPrescriptions, PCharge: filterdata[i].CHARGE });
        seriesfilterdata.push(chartfilterdata);
    }
    // Single Prescription Count 
    dataObj.SinglePrescriptions = seriesfilterdata;

    var totalIngredientCost = 0;
    var seriesIngredientCostData = [];
    var chartIngredientCostData = {};

    for (i = 0; i < data.length; i++) {
        data[i].IngredientCost = (data[i].PrescriptionCount * data[i].CHARGE);
    }

    for (i = 0; i < data.length; i++) {
        totalIngredientCost = totalIngredientCost + data[i].IngredientCost;
    }
    // console.log(totalIngredientCost);
    for (i = 0; i < data.length; i++) {
        data[i].IngredientCostPercent = (data[i].IngredientCost / totalIngredientCost) * 100;
    }

    for (i = 0; i < data.length; i++) {

        if (data[i].MEDICATION.indexOf('+') != -1) {
            chartIngredientCostData = ({
                name: data[i].MEDICATION,
                y: data[i].IngredientCostPercent,
                PrescriptionCount: data[i].PrescriptionCount,
                TotalPrescription: totalIngredientCost,
                PCharge: data[i].CHARGE,
                color: serverUtils.settingMedicationColor(data[i].MEDICATION)
            });
            seriesIngredientCostData.push(chartIngredientCostData);
        }
    }

    // All IngredientCost  
    dataObj.AllIngredient = seriesIngredientCostData;


    // totalIngredientCost = 0;
    seriesIngredientCostData = [];
    chartIngredientCostData = {};

    for (i = 0; i < filterdata.length; i++) {
        filterdata[i].IngredientCost = (filterdata[i].PrescriptionCount * filterdata[i].CHARGE);
    }

    // for (i = 0; i < filterdata.length; i++) {
    //     totalIngredientCost = totalIngredientCost + filterdata[i].IngredientCost;
    // }
    // console.log(totalIngredientCost);
    for (i = 0; i < filterdata.length; i++) {
        filterdata[i].IngredientCostPercent = (filterdata[i].IngredientCost / totalIngredientCost) * 100;
    }

    for (i = 0; i < filterdata.length; i++) {

        chartIngredientCostData = ({
            name: filterdata[i].MEDICATION,
            y: filterdata[i].IngredientCostPercent,
            PrescriptionCount: filterdata[i].PrescriptionCount,
            TotalPrescription: totalIngredientCost,
            PCharge: filterdata[i].CHARGE,
            color: serverUtils.settingMedicationColor(filterdata[i].MEDICATION)
        });
        seriesIngredientCostData.push(chartIngredientCostData);
    }

    dataObj.SingleIngredientCost = seriesIngredientCostData;


    return dataObj;

}

//Praveen 03/30/2017 To prepare data for cost per rx chart in risk distribution 
let prepareDataforRxCostPrescription = (baseData) => {

        let chartData = {};
        chartData['all'] = null;
        chartData['single'] = null;
        chartData['allTable'] = null;
        chartData['singleTable'] = null;
        let filterdataall = baseData.filter((d) => d.MEDICATION.indexOf("+") !== -1);
        //prepare data for all medication 
        chartData['all'] = prepareDataBubblePrescition(filterdataall); //baseData
        //prepare data for all table 
        chartData['allTable'] = prepareDataForTable(baseData);
        //filter data for single medication 
        let filterdata = baseData.filter((d) => d.MEDICATION.indexOf("+") == -1);

        chartData['single'] = prepareDataBubblePrescition(filterdata);
        chartData['singleTable'] = prepareDataForTable(filterdata);
        return chartData;
    }
    //prepare data forbubble chart 
let prepareDataBubblePrescition = (baseData) => {
        let chartData = [];
        //group data by medication 
        let medicationgrpData = _.groupBy(baseData, 'MEDICATION');
        let colors = customColorsArray();
        let couln = 0;
        for (let key in medicationgrpData) {
            let json = {};
            //get abbr value for drug name 
            json['name'] = getDrugAbbr(key);
            json['fullName'] = key;
            let datak = medicationgrpData[key];
            let lengthofp = 0;
            let cost = 0;
            let total_cost = 0
            for (let i = 0; i < datak.length; i++) {
                cost += datak[i].CHARGE;
                total_cost += datak[i].PrescriptionCount * datak[i].CHARGE;
                lengthofp += datak[i].PrescriptionCount;
            }
            json['x'] = lengthofp;
            json['z'] = total_cost;
            json['y'] = lengthofp != 0 ? (cost / datak.length) : 0;
            json['color'] = serverUtils.settingMedicationColor(key);
            couln += 1;
            if (lengthofp) {
                chartData.push(json);
            }
        }
        //reutrn the result 
        return chartData;
    }
    //function to get Abbr from Full Name
function getDrugAbbr(drugName) {
    let abbr = '',
        plusSeparated = drugName.split('+');

    for (let i = 0; i < plusSeparated.length; i++) {
        abbr += plusSeparated[i].trim().charAt(0);

        if (i != plusSeparated.length - 1) {
            abbr += ' + ';
        }
    }

    return abbr;
}

//Praveen 03/31/2017 prepare data for table in risk distribution section 
//cost per rx,average cost,prescription count for all medications 
let prepareDataForTable = (baseData) => {
    //group data by medication 
    let medicationgrpData = _.groupBy(baseData, 'MEDICATION');
    //loop through all  medication 
    let chartdata = [];
    let total = 0;
    for (let medication in medicationgrpData) {
        let json = {};
        json['fullName'] = medication;
        json['name'] = getDrugAbbr(medication);
        let datak = medicationgrpData[medication];
        let lengthofp = 0;
        let cost = 0;
        for (let i = 0; i < datak.length; i++) {
            cost += datak[i].CHARGE || 0;
            lengthofp += datak[i].PrescriptionCount;
        }
        json['count'] = lengthofp;
        total += lengthofp;
        json['y'] = cost * lengthofp;
        json['costperrx'] = lengthofp != 0 ? (cost / datak.length) : 0;
        json['color'] = serverUtils.settingMedicationColor(medication);
        chartdata.push(json);

    }

    return { data: chartdata, total: total };
}


//Praveen 04/03/2017 added custom colors array 
customColorsArray = () => {
    return ["#abd6ba", "#f1cb6a", "#69bae7", '#2e7e97', '#FFCDD2', '#E57373', '#673AB7', '#EDE7F6', '#7C4DFF', '#B388FF', '#B3E5FC', '#4FC3F7', '#039BE5', '#40C4FF', '#0091EA', '#A5D6A7', '#43A047', '#69F0AE', '#FFF176', '#FF8A65', '#B0BEC5', '#A1887F', '#BDBDBD', '#FFB74D', '#C6FF00', '#64FFDA', '#2196F3', '#2196F3', '#BA68C8'];
}