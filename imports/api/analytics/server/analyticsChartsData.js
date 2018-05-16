/*
    charts data functions library
*/
import * as serverUtils from '../../common/serverUtils.js';


export let getAnalyticsAdherenceData = (efficacyData) => {
    let FinalDrugsArray = [];
    if (efficacyData.length > 0) {


        let finalArray2 = _.groupBy(efficacyData, 'DrugNameWithoutWeek');

        // initialize FinalDrugsArray to be emplty;
        FinalDrugsArray = [];
        for (let key in finalArray2) {
            let obj = {};
            obj['DrugName'] = key;

            obj['TotalDrugN'] = 0;
            let DrugsGroup = finalArray2[key];
            obj['therapy'] = DrugsGroup;

            for (let i = 0; i < DrugsGroup.length; i++) {
                obj['TotalDrugN'] += DrugsGroup[i].DrugN;
            }
            FinalDrugsArray.push(obj);
        }
    }

    // console.log(FinalDrugsArray);

    var chartData = [],
        highchartData = [];
    let OtherValue = 0;
    let OtherValueMe = 0,
        OtherValueMyNetwork = 0,
        OtherValuePopulationHealth = 0;
    let totalUtiScore = 0;

    let totalPatients = efficacyData[0]['TotalN'];

    for (let i = 0; i < FinalDrugsArray.length; i++) {

        let utiScore = FinalDrugsArray[i] && FinalDrugsArray[i]["TotalDrugN"] ? FinalDrugsArray[i]["TotalDrugN"] : 0;
        // calculate percentage
        utiScore = (utiScore * 100) / totalPatients;

        // console.log(FinalDrugsArray[i]);

        let weightedAverage = getWeightedAvgAdherence(FinalDrugsArray[i]);

        // let wrapDrug = '';

        // column = [];

        // let splittedDrug = FinalDrugsArray[i]["DrugName"].split('+');
        // if (splittedDrug.length > 1) {
        //     //split second index drug with '(' symbol
        //     let furtherSplittedDrug = splittedDrug[1].split('(');
        //     if (furtherSplittedDrug.length > 1) {
        //         //To Do display  both array as zero index drug from it is and also set title for it
        //         wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');
        //     } else {
        //         //To Do display  both array as zero index drug from it is and also set title for it
        //         if (splittedDrug.length > 2) {
        //             wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');

        //         } else {
        //             wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);

        //         }
        //     }
        // } else {
        //     //To Do display drug as it is and also set title for it
        //     wrapDrug = FinalDrugsArray[i]["DrugName"];

        // }

        // PopulationHealth = FinalDrugsArray[i] && FinalDrugsArray[i]["TotalDrugN"] ? FinalDrugsArray[i]["TotalDrugN"] : 0;

        // //Check weather same truncated drug name exist or not
        // let calculatedDrugs = chartData.filter(function(d) {
        //     if (d[0] == wrapDrug) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // });

        // if (calculatedDrugs.length > 0) {
        //     wrapDrug = wrapDrug + ' ';
        // }
        let row = {},
            highchartDataRow = {};
        // console.log('weightedAverage');
        // console.log(weightedAverage);
        if (weightedAverage != 'NA' && weightedAverage != NaN) {
            // console.log('not added');
            row.label = FinalDrugsArray[i]["DrugName"];
            row.value = parseFloat(utiScore).toFixed(2);
            row["weightedAvg"] = parseFloat(weightedAverage).toFixed(2);
            row["Population Health"] = parseFloat(utiScore).toFixed(2);
            row["TotalDrugN"] = FinalDrugsArray[i]["TotalDrugN"];
            chartData.push(row);

            //added by jayesh 23th May 2017 for adherence comparative highchart display
            highchartDataRow.name = FinalDrugsArray[i]["DrugName"];
            highchartDataRow.y = parseFloat(weightedAverage.toFixed(2));
            highchartDataRow.populationHealth = parseFloat(utiScore.toFixed(2));
            highchartDataRow.TotalDrugN = FinalDrugsArray[i]["TotalDrugN"];
            highchartDataRow.color = serverUtils.settingMedicationColor(FinalDrugsArray[i]["DrugName"]);
            highchartData.push(highchartDataRow);
        }

    }


    chartData.sort(function (a, b) {
        return parseFloat(b["weightedAvg"]) - parseFloat(a["weightedAvg"]);
    });

    highchartData.sort(function (a, b) {
        return b.y - a.y;
    });

    return {
        chartData: chartData,
        finalDrugsArray: FinalDrugsArray,
        highchartData: highchartData
    };


    function getWeightedAvgAdherence(dataArray) {
        // console.log("Find out weighted Average.");
        let weightedAvg = 0;
        let totalPatient = 0;
        let theray = dataArray.therapy;

        for (let i = 0; i < theray.length; i++) {
            // console.log('Adherence');
            // console.log(theray[i]);
            // console.log(theray[i].Adherence.Adherence);
            if (theray[i].Adherence.Adherence != 'NA') {
                weightedAvg += (parseFloat(theray[i].Adherence.Adherence) * parseInt(theray[i].Adherence.EffectivePatients));
                totalPatient += parseInt(theray[i].Adherence.EffectivePatients);
            }
        }
        // console.log(' w t');
        // console.log(weightedAvg);
        // console.log(totalPatient);

        if (weightedAvg != 0 && totalPatient != 0) {
            weightedAvg = weightedAvg / totalPatient;
        } else {
            weightedAvg = 'NA';
        }

        return weightedAvg;
    }
}



export let getAnalyticsEfficacyData = (efficacyData) => {
    let FinalDrugsArray = [];
    if (efficacyData.length > 0) {
        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 29-May-2017
         * @desc: Filted Efficacy record with svr12 value
         */
      //  console.log("Before filter efficacyData:"+efficacyData.length);
        // First filter data which will used for Efficacye tab
        efficacyData = _.filter(efficacyData, (d) => {
            return d.SVR12 !== null;
        });
        //console.log("After filter efficacyData:"+efficacyData.length);

        let finalArray2 = _.groupBy(efficacyData, 'DrugNameWithoutWeek');

        // initialize FinalDrugsArray to be emplty;
        FinalDrugsArray = [];
        for (let key in finalArray2) {
            let obj = {};
            obj['DrugName'] = key;

            obj['TotalDrugN'] = 0;
            let DrugsGroup = finalArray2[key];
            obj['therapy'] = DrugsGroup;

            for (let i = 0; i < DrugsGroup.length; i++) {
                obj['TotalDrugN'] += DrugsGroup[i].DrugN;
            }
            FinalDrugsArray.push(obj);
        }
    }

    // console.log(FinalDrugsArray);
    //// Added `highchartData` object to store highchart data for comparative functionality with two dataset
    var chartData = [],
        highchartData = [];
    let OtherValue = 0;
    let OtherValueMe = 0,
        OtherValueMyNetwork = 0,
        OtherValuePopulationHealth = 0;
    let totalUtiScore = 0;

    let totalPatients = efficacyData[0]['TotalN'];

    for (let i = 0; i < FinalDrugsArray.length; i++) {

        let utiScore = FinalDrugsArray[i] && FinalDrugsArray[i]["TotalDrugN"] ? FinalDrugsArray[i]["TotalDrugN"] : 0;
        // calculate percentage
        utiScore = (utiScore * 100) / totalPatients;

        // console.log(FinalDrugsArray[i]);

        let weightedAverage = getWeightedAvg(FinalDrugsArray[i]);

        // let wrapDrug = '';

        // column = [];

        // let splittedDrug = FinalDrugsArray[i]["DrugName"].split('+');
        // if (splittedDrug.length > 1) {
        //     //split second index drug with '(' symbol
        //     let furtherSplittedDrug = splittedDrug[1].split('(');
        //     if (furtherSplittedDrug.length > 1) {
        //         //To Do display  both array as zero index drug from it is and also set title for it
        //         wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');
        //     } else {
        //         //To Do display  both array as zero index drug from it is and also set title for it
        //         if (splittedDrug.length > 2) {
        //             wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');

        //         } else {
        //             wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);

        //         }
        //     }
        // } else {
        //     //To Do display drug as it is and also set title for it
        //     wrapDrug = FinalDrugsArray[i]["DrugName"];

        // }

        // PopulationHealth = FinalDrugsArray[i] && FinalDrugsArray[i]["TotalDrugN"] ? FinalDrugsArray[i]["TotalDrugN"] : 0;

        // //Check weather same truncated drug name exist or not
        // let calculatedDrugs = chartData.filter(function(d) {
        //     if (d[0] == wrapDrug) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // });

        // if (calculatedDrugs.length > 0) {
        //     wrapDrug = wrapDrug + ' ';
        // }
        //// Added `highchartDataRow` object to store highchart data for comparative functionality with two dataset
        let row = {},
            highchartDataRow = {};

        if (weightedAverage != 'NA') {
            row.label = FinalDrugsArray[i]["DrugName"];
            row.value = parseFloat(utiScore).toFixed(2);
            row["weightedAvg"] = parseFloat(weightedAverage).toFixed(2);
            row["Population Health"] = parseFloat(utiScore).toFixed(2);
            row["TotalDrugN"] = FinalDrugsArray[i]["TotalDrugN"];
            chartData.push(row);

            //added by Arvind 23th May 2017 for efficacy comparative with highchart
            highchartDataRow.name = FinalDrugsArray[i]["DrugName"];
            highchartDataRow.y = parseFloat(weightedAverage.toFixed(2));
            highchartDataRow.populationHealth = parseFloat(utiScore.toFixed(2));
            highchartDataRow.TotalDrugN = FinalDrugsArray[i]["TotalDrugN"];
            highchartDataRow.color = serverUtils.settingMedicationColor(FinalDrugsArray[i]["DrugName"]);
            highchartData.push(highchartDataRow);
        }

    }


    chartData.sort(function (a, b) {
        return parseFloat(b["weightedAvg"]) - parseFloat(a["weightedAvg"]);
    });

    highchartData.sort(function (a, b) {
        return b.y - a.y;
    });

    return {
        chartData: chartData,
        finalDrugsArray: FinalDrugsArray,
        highchartData: highchartData
    };


    function getWeightedAvg(dataArray) {
        // console.log("Find out weighted Average.");
        let weightedAvg = 0;
        let totalPatient = 0;
        let theray = dataArray.therapy;

        for (let i = 0; i < theray.length; i++) {
            if (theray[i].Efficacy.Efficacy != 'NA') {
                weightedAvg += (parseFloat(theray[i].Efficacy.Efficacy) * parseInt(theray[i].Efficacy.EffectivePatients));
                totalPatient += parseInt(theray[i].Efficacy.EffectivePatients);
            }
        }
        if (weightedAvg != 0 && totalPatient != 0) {
            weightedAvg = weightedAvg / totalPatient;
        } else {
            weightedAvg = 'NA';
        }

        return weightedAvg;
    }
}


// NOt in Use
export let getAnalyticsMainBarData = (efficacyData) => {
    let FinalDrugsArray = [];
    if (efficacyData.length > 0) {
        //$('#efficacy-container').html('');

        for (let i = 0; i < efficacyData.length; i++) {
            let drugNameWithoutWeek = efficacyData[i].DrugName.replace(/\s*\(.*?\)\s*/g, '');
            efficacyData[i]['DrugNameWithoutWeek'] = drugNameWithoutWeek;
        }


        let finalArray2 = _.groupBy(efficacyData, 'DrugNameWithoutWeek');

        // initialize FinalDrugsArray to be emplty;
        FinalDrugsArray = [];
        for (let key in finalArray2) {
            let obj = {};
            obj['DrugName'] = key;

            obj['TotalDrugN'] = 0;
            let DrugsGroup = finalArray2[key];
            obj['therapy'] = DrugsGroup;

            for (let i = 0; i < DrugsGroup.length; i++) {
                obj['TotalDrugN'] += DrugsGroup[i].DrugN;
            }
            FinalDrugsArray.push(obj);
        }

        //append total patients count
        //$('.searchPatientCountHeaderAnalytics').html(commaSeperatedNumber(allDrugsData[0]['TotalN']));
    }

    // console.log(FinalDrugsArray);

    var chartData = [];
    let OtherValue = 0;
    let OtherValueMe = 0,
        OtherValueMyNetwork = 0,
        OtherValuePopulationHealth = 0;
    let totalUtiScore = 0;

    let totalPatients = efficacyData[0]['TotalN'];

    for (var i = 0; i < FinalDrugsArray.length; i++) {

        var utiScore = FinalDrugsArray[i] && FinalDrugsArray[i]["TotalDrugN"] ? FinalDrugsArray[i]["TotalDrugN"] : 0;
        // calculate percentage
        utiScore = (utiScore * 100) / totalPatients;

        var wrapDrug = '';
        column = [];

        var splittedDrug = FinalDrugsArray[i]["DrugName"].split('+');
        if (splittedDrug.length > 1) {
            //split second index drug with '(' symbol
            var furtherSplittedDrug = splittedDrug[1].split('(');
            if (furtherSplittedDrug.length > 1) {
                //To Do display  both array as zero index drug from it is and also set title for it
                wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');
            } else {
                //To Do display  both array as zero index drug from it is and also set title for it
                if (splittedDrug.length > 2) {
                    wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0] + '...');

                } else {
                    wrapDrug = (splittedDrug[0] + '+' + furtherSplittedDrug[0]);

                }
            }
        } else {
            //To Do display drug as it is and also set title for it
            wrapDrug = FinalDrugsArray[i]["DrugName"];

        }

        PopulationHealth = FinalDrugsArray[i] && FinalDrugsArray[i]["TotalDrugN"] ? FinalDrugsArray[i]["TotalDrugN"] : 0;

        //Check weather same truncated drug name exist or not
        var calculatedDrugs = chartData.filter(function (d) {
            if (d[0] == wrapDrug) {
                return true;
            } else {
                return false;
            }
        });

        if (calculatedDrugs.length > 0) {
            wrapDrug = wrapDrug + ' ';
        }
        var row = {};

        row.label = FinalDrugsArray[i]["DrugName"];
        row.value = parseFloat(utiScore).toFixed(2);
        row["Population Health"] = parseFloat(utiScore).toFixed(2);
        chartData.push(row);

    }


    chartData.sort(function (a, b) {
        return parseFloat(b["Population Health"]) - parseFloat(a["Population Health"]);
    });

    return {
        chartData: chartData,
        finalDrugsArray: FinalDrugsArray
    };
}


// chart data for genotype distribution & individul patient journey on patient journey tab
export let getAnalyticsPJDistribution = (baseData) => {

    let pjData = [];
    //filter data having less then 2 svr test count
    let groupbyPatientId = _.groupBy(baseData, 'PATIENT_ID_SYNTH');
    for (let key in groupbyPatientId) {
        let keyData = groupbyPatientId[key];
        if (keyData.length >= 2) {
            for (let i = 0; i < keyData.length; i++) {
                pjData.push(keyData[i]);
            }
        }
    }
    //sort data by weeks
    let dataArray = _.sortBy(pjData, 'Weeks');
    let grpData = _.groupBy(dataArray, 'GENOTYPE');

    let genotypeChartData = [],
        viralLoadChartData = {},
        allPatients = [];

    //let uniqueWeeks = _.uniq(_.pluck(dataArray,'Weeks'));old code
    let maxWeeks = _.max(dataArray, function (dataPJT) {
        return parseInt(dataPJT.Weeks);
    }).Weeks;
    let minWeeks = _.min(dataArray, function (dataPJT) {
        return parseInt(dataPJT.Weeks);
    }).Weeks;
    let uniqueWeeks = []; //_.uniq(_.pluck(baseData,'Weeks'));
    //console.log(maxWeeks,minWeeks)
    for (let week = parseInt(minWeeks); week <= parseInt(maxWeeks); week++) {
        uniqueWeeks.push(week);
    }
    let plotBands = getPlotBandRangesForViralLoadChartNew(pjData, maxWeeks);
    for (let keys in grpData) {
        let genoData = grpData[keys],
            data = [];

        //data for the genotype distribution chart
        data.push(keys);
        data.push(_.uniq(_.pluck(genoData, 'PATIENT_ID_SYNTH')).length);
        genotypeChartData.push(_.flatten(data)); //example [1a,10]

        //data for the viral load chart
        let viralSeriesData = [];

        let pDataGrp = _.groupBy(genoData, 'PATIENT_ID_SYNTH');

        for (let patient in pDataGrp) {
            let obj = {},
                pData = pDataGrp[patient];
            let weeksData = [];
            let flag = false;
            for (let i = 0; i < uniqueWeeks.length; i++) {
                let currWeek = _.where(pData, {
                    Weeks: uniqueWeeks[i]
                });

                if (currWeek.length) {
                    let viralLoadInLog = Math.log(parseFloat(currWeek[0].ViralLoad));
                    //weeksData.push(isNaN(parseFloat(currWeek[0].ViralLoad)) ? 0 : viralLoadInLog);
                    weeksData.push(isNaN(viralLoadInLog) ? 0 : viralLoadInLog);
                    if (viralLoadInLog > 0) {
                        flag = true;
                    }
                } else {
                    weeksData.push(0);
                }
                ////
            }
            if (weeksData.length > 0 && flag) {
                obj.name = patient;
                obj.data = weeksData;
                viralSeriesData.push(obj); //[{name: '123', data:[2.01,5.2]}]
                allPatients.push({
                    id: patient
                });
            }

        }

        viralLoadChartData[keys] = {
            xCategories: uniqueWeeks,
            seriesData: viralSeriesData,
            plotBands: plotBands.plotBands
        }

    }

    return {
        genotypeChartData: genotypeChartData,
        viralLoadChartData: viralLoadChartData,
        uniqueTotal: _.uniq(_.pluck(allPatients, 'id')).length
    }
}


// /**
//  * Description : Prepare required charts data for retreatment chart with drilldown no of treatment, medicaiton, treatment period
//  */
// export let prepareRetreatmentDistributionWithMedication = (data) => {

//     let max_treatment_num = getMaxTreatmentNumber(_.groupBy(data, 'PATIENT_ID_SYNTH'));

//     let finalData = [];
//     let finalTreatmentChartData = [];
//     let finalObj = {};
//     let genGrpData = _.groupBy(data, 'GENOTYPE');

//     let finalMedicationChartData = [];
//     let finalTreatment_periodChartData = [];
//     let ChartData = [];
//     let totalPatientcount = 0;
//     for (let geno in genGrpData) {
//         let patientCount = 0;
//         let treatmentChartData = [];
//         let medicationChartData = [];
//         let treatment_periodChartData = [];
//         let preparePatientData = [];
//         // grouping by patient id
//         let patientGrpData = _.groupBy(genGrpData[geno], 'PATIENT_ID_SYNTH');
//         for (let tnum = max_treatment_num - 1; tnum >= 1; tnum--) {
//             let retreatedPatientCount = 0;
//             for (let patientid in patientGrpData) {
//                 // prepare cost data for extra treatment
//                 if (patientGrpData[patientid][tnum]) {
//                     retreatedPatientCount++;
//                     patientCount++;
//                     preparePatientData.push(patientGrpData[patientid][tnum])
//                 }
//             }
//             if (retreatedPatientCount > 0) {
//                 //prepare data for no of treatment
//                 treatmentChartData.push({
//                     name: tnum + 1,
//                     y: retreatedPatientCount
//                 });
//             }
//         }
//         //prepare data for no of treatment by genotyoe
//         finalTreatmentChartData.push({
//             name: geno,
//             data: treatmentChartData,
//             startAngle: 90
//         });
//         if (patientCount != 0) {
//             totalPatientcount = totalPatientcount + patientCount;
//             ChartData.push({
//                 name: geno,
//                 y: patientCount
//             });
//         }
//         //prepare data for medication distribution of retreatment patient.
//         let medicationGrouped = _.groupBy(preparePatientData, 'MEDICATION');
//         for (let medication in medicationGrouped) {
//             if (medicationGrouped[medication].length > 0) {
//                 medicationChartData.push({
//                     name: medication,
//                     y: medicationGrouped[medication].length
//                 });
//             }
//         }
//         finalMedicationChartData.push({
//             name: geno,
//             data: medicationChartData,
//             startAngle: 90
//         });
//         //prepare data for treatment period distribution of retreatment patient.
//         let treatment_periodGrouped = _.groupBy(preparePatientData, 'TREATMENT_PERIOD');
//         for (let period in treatment_periodGrouped) {
//             if (treatment_periodGrouped[period].length > 0) {
//                 treatment_periodChartData.push({
//                     name: period,
//                     y: treatment_periodGrouped[period].length
//                 });
//             }
//         }
//         finalTreatment_periodChartData.push({
//             name: geno,
//             data: treatment_periodChartData,
//             startAngle: 90
//         });
//     }
//     finalData.push({
//         name: 'Patient Count',
//         data: ChartData
//     })
//     finalObj.retreatedByGenotype = finalData;
//     finalObj.noOfTreatmentByGenotypeChartData = finalTreatmentChartData;
//     finalObj.medicationByGenotypeChartData = finalMedicationChartData;
//     finalObj.treatmentPeriodChartData = finalTreatment_periodChartData;
//     finalObj.TotalN = totalPatientcount;

//     return finalObj;

// }

/**
 * Description : Prepare required charts data for retreatment chart with drilldown no of treatment, medicaiton, treatment period
 */

export let prepareRetreatmentDistributionWithMedication = (dataALL) => {
    try {
        let finalData = [];
        let finalTreatmentChartData = [];
        let finalObj = {};
        // Nisha; 05/25/2017; Logic For Uniue patient count in Total 
        var uniquecountsALL = _.uniq(dataALL, function (person) {
            return person.PATIENT_ID_SYNTH;
        });
        finalObj.TotalRecordsN = uniquecountsALL.length;
        // console.log(dataALL.length);

        let data = dataALL.filter(function (a) {
            return a.IS_RETREATED.toLowerCase().trim() == 'yes';
        });
        let max_treatment_num = getMaxTreatmentNumber(_.groupBy(data, 'PATIENT_ID_SYNTH'));

        let genGrpData = _.groupBy(data, 'GENOTYPE');

        let finalMedicationChartData = [];
        let finalTreatment_periodChartData = [];
        let ChartData = [];
        let totalPatientcount = 0;
        //OLD CODE START
        // for (let geno in genGrpData) {
        //     let patientCount = 0;
        //     let treatmentChartData = [];
        //     let medicationChartData = [];
        //     let treatment_periodChartData = [];
        //     let preparePatientData = [];
        //     // grouping by patient id
        //     let patientGrpData = _.groupBy(genGrpData[geno], 'PATIENT_ID_SYNTH');
        //     for (let tnum = max_treatment_num - 1; tnum >= 1; tnum--) {
        //         let retreatedPatientCount = 0;
        //         for (let patientid in patientGrpData) {
        //             // prepare cost data for extra treatment
        //             if (patientGrpData[patientid][tnum]) {
        //                 retreatedPatientCount++;
        //                 patientCount++;
        //                 preparePatientData.push(patientGrpData[patientid][tnum])
        //             }
        //         }
        //         if (retreatedPatientCount > 0) {
        //             //prepare data for no of treatment
        //             treatmentChartData.push({
        //                 name: tnum + 1,
        //                 y: retreatedPatientCount
        //             });
        //         }
        //     }
        //     //prepare data for no of treatment by genotyoe
        //     finalTreatmentChartData.push({
        //         name: geno,
        //         data: treatmentChartData,
        //         startAngle: 90
        //     });
        //     if (patientCount != 0) {
        //         totalPatientcount = totalPatientcount + patientCount;
        //         ChartData.push({
        //             name: geno,
        //             y: patientCount
        //         });
        //     }
        //     //prepare data for medication distribution of retreatment patient.
        //     let medicationGrouped = _.groupBy(preparePatientData, 'MEDICATION');
        //     for (let medication in medicationGrouped) {
        //         if (medicationGrouped[medication].length > 0) {
        //             medicationChartData.push({
        //                 name: medication,
        //                 y: medicationGrouped[medication].length
        //             });
        //         }
        //     }
        //     finalMedicationChartData.push({
        //         name: geno,
        //         data: medicationChartData,
        //         startAngle: 90
        //     });
        //     //prepare data for treatment period distribution of retreatment patient.
        //     let treatment_periodGrouped = _.groupBy(preparePatientData, 'TREATMENT_PERIOD');
        //     for (let period in treatment_periodGrouped) {
        //         if (treatment_periodGrouped[period].length > 0) {
        //             treatment_periodChartData.push({
        //                 name: period,
        //                 y: treatment_periodGrouped[period].length
        //             });
        //         }
        //     }
        //     finalTreatment_periodChartData.push({
        //         name: geno,
        //         data: treatment_periodChartData,
        //         startAngle: 90
        //     });
        // }
        // finalData.push({
        //         name: 'Patient Count',
        //         data: ChartData
        //     })
        ////OLD CODE END
        //// New calculation for retreatment
        /**
         * Added: Arvind 15-Feb-2017
         * Issue :Retreatment chart calculated is not acurate 
         * Description : So created new logic to generate chart data for only patients with IS_RETREATED column value 'YES'
         */
        ChartData = [];
        finalData = [];
        finalTreatmentChartData = [];
        finalMedicationChartData = [];
        finalTreatment_periodChartData = [];
        let colorg = '';
        for (let geno in genGrpData) {
            let treatmentChartData = [];
            let medicationChartData = [];
            let treatment_periodChartData = [];

            switch (geno) {
                case '1a':
                    colorg = "#abd6ba";
                    break;
                case '1b':
                    colorg = "#f1cb6a";
                    break;
                case '2':
                    colorg = "#69bae7";
                    break;
                case '3':
                    colorg = "#2e7e97";
                    break;
                case '4':
                    colorg = "#FFCDD2";
                    break;
                case '1':
                    colorg = "#E57373";
                    break;
                default:
                    colorg = "#673AB7";

            }

            let uniquecountsData = _.uniq(genGrpData[geno], function (person) {
                return person.PATIENT_ID_SYNTH;
            });

            ChartData.push({
                name: geno,
                y: uniquecountsData.length,
                color: colorg
            });

            // let cntByTreatmentCount = _.countBy(genGrpData[geno], 'TreatmentCount');
            // let cntByTreatmentPeriod = _.countBy(genGrpData[geno], 'TREATMENT_PERIOD');
            // let cntByTreatmentMedication = _.countBy(genGrpData[geno], 'MEDICATION');

            let cntByTreatmentCount = _.countBy(uniquecountsData, 'TreatmentCount');
            let cntByTreatmentPeriod = _.countBy(uniquecountsData, 'TREATMENT_PERIOD');
            let cntByTreatmentMedication = _.countBy(uniquecountsData, 'MEDICATION');

            //prepare data for no of treatment
            for (treatmentCnt in cntByTreatmentCount) {
                treatmentChartData.push({
                    name: parseInt(treatmentCnt),
                    y: cntByTreatmentCount[treatmentCnt]
                });
            }
            //prepare data for no of treatment by genotyoe
            finalTreatmentChartData.push({
                name: geno,
                data: treatmentChartData,
                startAngle: 90
            });
            //prepare data for medication distribution of retreatment patient.

            for (let medication in cntByTreatmentMedication) {

                medicationChartData.push({
                    name: medication,
                    y: cntByTreatmentMedication[medication]
                });

            }
            finalMedicationChartData.push({
                name: geno,
                data: medicationChartData,
                startAngle: 90
            });
            //prepare data for treatment period distribution of retreatment patient.

            for (let period in cntByTreatmentPeriod) {

                treatment_periodChartData.push({
                    name: period,
                    y: cntByTreatmentPeriod[period]
                });

            }
            finalTreatment_periodChartData.push({
                name: geno,
                data: treatment_periodChartData,
                startAngle: 90
            });


        }
        finalData.push({
            name: 'Patient Count',
            data: ChartData
        })

        finalObj.retreatedByGenotype = finalData;
        finalObj.noOfTreatmentByGenotypeChartData = finalTreatmentChartData;
        finalObj.medicationByGenotypeChartData = finalMedicationChartData;
        finalObj.treatmentPeriodChartData = finalTreatment_periodChartData;
        //finalObj.TotalN = totalPatientcount;
        // Nisha; 05/25/2017; Logic For Uniue patient count in Total 
        uniquecountsALL = _.uniq(data, function (person) {
            return person.PATIENT_ID_SYNTH;
        });
        finalObj.TotalN = uniquecountsALL.length;
        // finalObj.AllDATA = dataALL
        // finalObj.raw = data;
        // finalObj.totalPatient = data.length;
        return finalObj;
    } catch (ex) {
        console.log(ex);
    }
}


//get maximum treatment number for medication cost
let getMaxTreatmentNumber = (patientGrpData) => {
    let maximum_treatment_num = 0;
    for (let patientid in patientGrpData) {
        if (patientGrpData[patientid].length > maximum_treatment_num) {
            maximum_treatment_num = patientGrpData[patientid].length;
        }
    }
    return maximum_treatment_num;
}

// Get Filtered data and PlotBands
let getPlotBandRangesForViralLoadChartNew = (dataPJ, maxvalue) => {

    //console.log(dataPJ);
    let plotBands = [];

    // this function will filter data based on selected weeks on the ui.
    if (true) {

        plotBands.push({
            from: 0,
            to: 8,
            color: '#EFFFFF',
            label: {
                text: 'Baseline',
                style: {
                    color: '#999999'
                },
                y: 20
            }
        });

        let range = 0;
        range = '0-8'; //$("#divWeekResponse input[type=radio]:checked").val() == undefined ? '0-8' : $("#divWeekResponse input[type=radio]:checked").val();

        if (range != 0) {
            let rangefrom = range.split('-')[0];
            let rangeto = range.split('-')[1];
            let from = 0,
                to = 0;

            dataPJ = dataPJ.filter(function (a) {
                return (parseInt(a.TREATMENT_PERIOD) >= parseInt(rangefrom) && parseInt(a.TREATMENT_PERIOD) <= parseInt(rangeto));
            });

            // console.log(dataPJ);
            from = 8;
            to = parseInt(rangeto) + 8;

            plotBands.push({
                from: from,
                to: to,
                color: '#FFFFEF',
                label: {
                    text: 'Treatment Period',
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            });

            //console.log(maxvalue);
            from = parseInt(rangeto) + 8;
            to = parseInt(maxvalue) + 8;

            plotBands.push({
                from: from,
                to: to,
                color: '#FFEFFF',
                label: {
                    text: 'Follow-Up',
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            });

        } else {

            from = 8;
            to = 16;

            plotBands.push({
                from: from,
                to: to,
                color: '#FFFFEF',
                label: {
                    text: 'Treatment Period',
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            });

            from = 16;
            to = parseInt(maxvalue) + 8;

            plotBands.push({
                from: from,
                to: to,
                color: '#FFEFFF',
                label: {
                    text: 'Follow-Up',
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            });
        }
    } // end of if condition for 'all' check


    return {
        data: dataPJ,
        plotBands: plotBands
    }
}