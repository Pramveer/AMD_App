import * as serverUtils from '../../common/serverUtils.js';
/**
 * Added: Jayesh 10-Feb-2017
 * Issue :
 * Description : P & T Model method and calculation
 * Reference: http://www.valueinhealthjournal.com/article/S1098-3015(13)01695-1/fulltext
 */
Meteor.syncMethods({
    'getPTmodelPageData': function (params, callback) {
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
            let dataObj = {};

            dataObj.medicationData = null;

            //for preacting antivirals integration
            let whereClause = serverUtils.getQueryForAdvFilters(params),
                preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

            if (params.showPreactingAntivirals) {
                preactiveAntivalsQuery = ``;
            }

            let dbConfig = serverUtils.getCurrentDatabaseConfiguration(params);
            
            let newQuery = `SELECT count(DISTINCT medication.PATIENT_ID_SYNTH) as total, 
                        count(DISTINCT medication.PROVIDER_ID_SYNTH) as uniqueProviders,
                        avg(CASE WHEN medication.PAID IS NULL THEN 0 ELSE medication.PAID END) as cost, MEDICATION, treatment_Period  
                        from ${dbConfig.tblHcvPatient} as patients join ${dbConfig.tblPatientMedication} as medication
                        on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH AND medication.SVR12 is not null
                        WHERE medication.MEDICATION IS NOT NULL AND medication.PAID <> 0 
                        ${whereClause} ${preactiveAntivalsQuery} 
                        group by
                        medication.MEDICATION,
                        medication.treatment_Period ORDER by medication.MEDICATION ;`;

            // console.log("***************  NEw  Query 1 ******************************");
            // console.log(newQuery);

            liveDb.db.query(newQuery, function (error, result) {
                if (error || result.length < 1) {
                    callback(true, null);
                } else {
                    //calculated weightCost
                    let finalData = _.map(result, (rec) => {
                        rec.weightedCost = parseFloat(rec.total) * parseFloat(rec.cost);
                        return rec;
                    });
                    //console.log(dataObj);
                    dataObj.medicationData = finalData;
                    dataObj.params = params;

                    getMedicationPatientsDataWithSVR(dataObj, callback);

                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'savePtRiskBenefitsData': function (pData, callback){
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
                    params: pData,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }            
            liveDb.db.query('Call AddUpdatePTRiskBenefitsData(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
                   [pData.ptUSERNAME,
                    pData.ptMEDICATION,
                    pData.ptSOCIAL_BENIFITS,
                    pData.ptRISK1,
                    pData.ptRISK2,
                    pData.ptRISK3,
                    pData.ptRISK4,
                    pData.ptRISK5,
                    pData.ptRISK6,
                    pData.ptRISK7,
                    pData.ptRISK8,
                    pData.ptRISK9,
                    pData.ptRISK10,
                    pData.ptRISK11,
                    pData.ptRISK12,
                    pData.ptRISK13,
                    pData.ptRISK14,
                    pData.ptFlag
                ],

                function(error, result) {
                    if (error) {
                        //If in First place any error occurs
                        console.log(error);
                        r = {
                            message: "Some internal problem while insertion",
                            statuscode: -1,
                            response: error
                        };
                        callback(undefined, r);

                    } else if (result && result.affectedRows > 0) {
                        //User added
                        //To Do Send email once user created
                        r = {
                            message: "Risk & Benefits added successfully",
                            statuscode: 0,
                            response: result,
                            userData: pData

                        };
                        callback(undefined, r);

                    } else {
                        //User not added
                        r = {
                            message: "Risk & Benefits not added",
                            statuscode: 1,
                            response: result
                        };
                        callback(undefined, r);
                    }
                });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
});


// Get Patient Data 
let getMedicationPatientsDataWithSVR = (data, callback) => {
    let dataObj = data;

    dataObj.patientsDataWithSVR = null;

    //preacting antivirals integration
    let whereClause = serverUtils.getQueryForAdvFilters(dataObj.params),
        preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

    if (dataObj.params.showPreactingAntivirals) {
        preactiveAntivalsQuery = ``;
    }
    let dbConfig = serverUtils.getCurrentDatabaseConfiguration(dataObj.params); 
 
    let newQuery = `select distinct
	                    medication.PATIENT_ID_SYNTH,
	                    IS_HOSPITALIZED,
	                    IS_LIVER_FAILURE,
	                    IS_DRUG_INTERACTION,
	                    IS_ANIMIA,
	                    PROVIDER_ID_SYNTH as provider_id,            
	                    SVR12,
	                    (CASE WHEN medication.DAYS_MEDICATION  IS NULL THEN 0 ELSE medication.DAYS_MEDICATION END) as days_med,
	                    medication.TREATMENT_PERIOD as treatment_Period,
	                    medication.MEDICATION,
                        medication.SVR_BEFORE,
                        medication.SVR_AFTER
		            from ${dbConfig.tblHcvPatient} as patients
                    join ${dbConfig.tblPatientMedication} as medication on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH and medication.SVR12 is not null
			        WHERE medication.MEDICATION IS NOT NULL AND medication.PAID <> 0
                    ${whereClause} ${preactiveAntivalsQuery}`;

    // console.log('******************NEW QUERY 2********************************');
    // console.log(newQuery);

    liveDb.db.query(newQuery, function (error, result) {
        if (error) {
            return;
        } else {
            //calculated adherence
            let finalData = _.map(result, (rec) => {
                rec.adherence = parseFloat((rec.days_med / (parseInt(rec.treatment_Period) * 7)) * 100);
                return rec;
            });

            dataObj.patientsDataWithSVR = finalData;
            getPatientViralloadData(dataObj, callback);
        }
    });
}

// Get Viralload Data
let getPatientViralloadData = (data, callback) => {
    let dataObj = data;

    dataObj.patientViralload = null;

    //changes by Pram for preacting antivirals integration
    let whereClause = serverUtils.getQueryForAdvFilters(dataObj.params),
        preactiveAntivalsQuery = `AND medication.IS_PREACTING_ANTIVIRAL = 'NO'`;

    if (dataObj.params.showPreactingAntivirals) {
        preactiveAntivalsQuery = ``;
    }
    let dbConfig = serverUtils.getCurrentDatabaseConfiguration(dataObj.params);
    
    let newQuery = `select distinct all_viral_load.PatientId, all_viral_load.Perfed_Dt as Perfed_Dt,
                case when all_viral_load.ViralLoad = 'NOT DETECTED' THEN 0 ELSE all_viral_load.ViralLoad END as ViralLoad, 
                medication.MEDICATION,medication.END_DATE  
                from ${dbConfig.tblHcvPatient} as patients
                join ${dbConfig.tblPatientMedication} as medication on patients.PATIENT_ID_SYNTH = medication.PATIENT_ID_SYNTH 
                join ${dbConfig.tblViralload} as all_viral_load on patients.PATIENT_ID_SYNTH =  all_viral_load.PatientId
	            WHERE medication.MEDICATION IS NOT NULL AND medication.PAID <> 0 AND
		        DATE(all_viral_load.Perfed_Dt) > DATE(medication.END_DATE) and (
                all_viral_load.ViralLoad ='NOT DETECTED' OR all_viral_load.ViralLoad REGEXP '^[0-9]+\\.?[0-9]*$') 
                ${whereClause} ${preactiveAntivalsQuery}`;


    // console.log('******************NEW QUERY 3********************************');
    // console.log(newQuery);

    liveDb.db.query(newQuery, function (error, result) {
        if (error) {
            return;
        } else {
            dataObj.patientViralload = result;
            getptRiskBenefitsData(dataObj, callback)
            //     let stringified = JSON.stringify(dataObj);
            //     let compressed_object = LZString.compress(stringified);
            // let finaldata = prepareMedicationCalculatedData(dataObj);
            // console.log('***Result****');
            // console.log(finaldata);
            // let stringified = JSON.stringify(finaldata);
            // let compressed_object = LZString.compress(stringified);

            // callback(undefined, compressed_object);


        }
    });
}

// Get Risk & Benefits Data
let getptRiskBenefitsData = (data, callback) => {
    let dataObj = data;

    dataObj.riskBenefitsData = null;

    let newQuery = `SELECT MEDICATION, SOCIAL_BENIFITS, RISK1, RISK2, RISK3, RISK4, RISK5, RISK6,
    RISK7, RISK8, RISK9, RISK10, RISK11, RISK12, RISK13, RISK14 FROM PT_RISK_BENEFITS`;
    if(dataObj.params.username)
    {
        newQuery = newQuery + ` WHERE USERNAME = '${dataObj.params.username}'`;
    }

    // console.log('******************NEW QUERY 3********************************');
    // console.log(newQuery);

    liveDb.db.query(newQuery, function (error, result) {
        if (error) {
            return;
        } else {
            dataObj.riskBenefitsData = result;
            // console.log(result[0]);
            //     let stringified = JSON.stringify(dataObj);
            //     let compressed_object = LZString.compress(stringified);
            let finaldata = prepareMedicationCalculatedData(dataObj);
            // console.log('***Result****');
            // console.log(finaldata);
            let stringified = JSON.stringify(finaldata);
            let compressed_object = LZString.compress(stringified);

            callback(undefined, compressed_object);


        }
    });
}
let prepareMedicationCalculatedData = (data) => {
    // console.log('**** preparing ***');
    //total patient count;
    let totalCostPatientCount = 0, medicationSeq=0,
        allMedication = [],
        allTolerability = [],
        allCost = [],
        allEfficacy = [];
    //Selected combined medication logic
    let medicationFilterFlag = true, medicationFilterData=[];
    if(data.params.medicationArray)
    {
       // let combinedMedication = serverUtils.getStrFromArray(data.params.medicationArray).split(',');
        let combinedMedication = data.params.medicationArray;
        for(let i =0; i<combinedMedication.length; i++)
        {
            if(combinedMedication[i] && combinedMedication[i].split(' + ').length > 1)
            {
                medicationFilterFlag= false;
            }
        }
    }
    //filtered medication by exclude combined medication
    if(medicationFilterFlag)
    {
        medicationFilterData = _.filter(data.medicationData, (rec) => {
            return rec.MEDICATION && rec.MEDICATION.split(' + ').length === 1;
        });
    }
    else{
        medicationFilterData = data.medicationData;
    }
    //console.log(medicationFilterData);
    //grouping the medication
    let groupedMedication = _.groupBy(medicationFilterData, (rec) => {
        return rec.MEDICATION;
    });
    let finalData = [],
        finalDataJson = {};
    // calculated data for medication
    for (let key in groupedMedication) {
        let medicationJsonObj = {};
        // set medication
        medicationSeq++;
        medicationJsonObj.medication = key;
        medicationJsonObj.medicationSeq = medicationSeq;
      
        
        // filter patients record by medication
        let patientsDataWithSVRFilterData =_.where(data.patientsDataWithSVR, {
            MEDICATION: key
        });
        // filter viral load data by medication
        let patientViralloadFilterData = _.where(data.patientViralload, {
            MEDICATION: key
        });
        
        // filter risk and benefits data by medication
        let riskAndBenefitsFilterData = _.where(data.riskBenefitsData, {
            MEDICATION: key
        });
        // medicationJsonObj.efficacy = prepareEfficacy(data, key);


        medicationJsonObj.treatmentOutcome = prepareTreatmentOutCome(patientsDataWithSVRFilterData);
        // console.log('**** treatmentOutcome ***');
        // console.log(medicationJsonObj.treatmentOutcome);

        medicationJsonObj.tolerability = prepareTolerability(patientsDataWithSVRFilterData);
        allTolerability.push(parseFloat(medicationJsonObj.tolerability.avgAdharence));
        // console.log('**** treatmentOutcome ***');
        // console.log(medicationJsonObj.treatmentOutcome);
        medicationJsonObj.riskAndBenefitsData = riskAndBenefitsFilterData;
        medicationJsonObj.riskAndBenefits = prepareRiskAndBenefits(riskAndBenefitsFilterData);
        // console.log('**** treatmentOutcome ***');
        // console.log(medicationJsonObj.treatmentOutcome);

        medicationJsonObj.duration = prepareDuration(patientViralloadFilterData);
        // console.log('**** duration ***');
        // console.log(medicationJsonObj.duration);
        // evidence weight = 3
        medicationJsonObj.evidence = 3;

        medicationJsonObj.cost = prepareTreatmentCost(groupedMedication[key]);
        allCost.push(medicationJsonObj.cost.avgCost);
        // console.log('**** cost ***');
        //console.log(medicationJsonObj.cost);
        // medicationJsonObj.medicationCountPatientCount = groupedMedication[key].length;

        totalCostPatientCount += medicationJsonObj.cost.totalCostPatient;

        finalData.push(medicationJsonObj);
        allMedication.push({medication:key,medicationSeq:medicationSeq});
    }
    
    finalData = _.map(finalData, (rec) => {
      //  rec.tolerabilityRatio = tolerabilityRatio;

        // mapped normailize tolerability 0.5 to 2
        rec.normailizeTolerability = parseFloat(mapDataToFloatInterval(allTolerability, rec.tolerability.avgAdharence));
        // mapped normailize cost 1 to 3
        rec.normailizeCost = mapDataToIntInterval(allCost, rec.cost.avgCost);
        // console.log(rec.normailizeCost);

        // calculated efficacy
        rec.efficacy =parseFloat(parseFloat((parseFloat(rec.treatmentOutcome.outcome)*parseFloat(rec.normailizeTolerability))
        + parseFloat(rec.evidence) +  parseFloat(rec.duration.total_duration)).toFixed(2));
        // set overall value for no risk and benefits
        // if(!rec.riskAndBenefits.noneOfThese && (rec.riskAndBenefits.normailizeRisks==0 && rec.riskAndBenefits.socialBenefits==0)
        // condition for require both risk and benefits.
        if(!rec.riskAndBenefits.noneOfThese && (rec.riskAndBenefits.normailizeRisks==0 || rec.riskAndBenefits.socialBenefits==0))
        {
            rec.overallValue = 0;
            rec.normalizeOverallValue = "Fill all the Fields";
        }
        else{
            // calculate overall value for each medication
            rec.overallValue = rec.efficacy + (4 - rec.normailizeCost) + (4 -  rec.riskAndBenefits.normailizeRisks) +
            (rec.riskAndBenefits.socialBenefits)  ;
            // High Value = 16 – 21
            // Moderate Value = 10.5 – 15.5
            // Low Value = 4.5 – 10
            if(rec.overallValue >16 && rec.overallValue <= 21)
            {
                rec.normalizeOverallValue = "High";
            }
            else if(rec.overallValue > 11 && rec.overallValue <= 16)
            {
                rec.normalizeOverallValue = "Moderate";
            }
            else if(rec.overallValue <= 11)
            {
                rec.normalizeOverallValue = "Low";
            }
        }
        allEfficacy.push(rec.efficacy);
        return rec;
    });
    
    finalData = _.map(finalData, (rec) => {
       // calculated normailize Efficacy 1 to 3 
        rec.normailizeEfficacy = mapDataToIntInterval(allEfficacy, rec.efficacy); 
        rec.percentageEfficacy = parseFloat((rec.efficacy*100)/12).toFixed(2); 
        return rec;
    });
  
    // finalData =finalData.sort( function( a, b ) { return b.efficacy - a.efficacy; });

    finalDataJson.medicationData = finalData;
    finalDataJson.totalCostPatientCount = totalCostPatientCount;
    finalDataJson.allMedication = allMedication;
  //  finalDataJson.riskBenefitsData = data.riskBenefitsData;
    // console.log('***Done***');
    // console.log(finalDataJson);
    return finalDataJson;
}



let prepareTreatmentOutCome = (data) => {
    if (data.length > 0) {
        let totalPatient = data.length,
            successPatientCount = 0,
            success_rate = 0,
            failPatientCount = 0,
            improvePatientCount = 0,
            endLifePatientCount = 0,
            improve_function = 0,
            end_of_life = 0,
            treatmentOutcome = 0;
        // grouped by svr12 
        let patientSVR12 = _.groupBy(data, function (rec) {
            return rec.SVR12;
        });
        for (let key in patientSVR12) {
            // check for cure patient
            if (key == 1) {
                // calculated success rate
                successPatientCount = patientSVR12[key].length;
                //success_rate = parseFloat((successPatientCount * 100)/totalPatient);
                success_rate = parseFloat((successPatientCount) / totalPatient);
            } else if (key == 0) {
                failPatientCount = patientSVR12[key].length;
                _.map(patientSVR12[key], (rec) => {
                    if (rec.SVR_BEFORE && rec.SVR_AFTER && rec.SVR_AFTER < rec.SVR_BEFORE) {
                        // count improve patient
                        improvePatientCount += 1;
                    } else {
                        // count end of life patient
                        endLifePatientCount += 1;
                    }
                });

                // calculated improve function
                //improve_function =  parseFloat((improvePatientCount * 100)/totalPatient);
                improve_function = parseFloat((improvePatientCount) / totalPatient);

                // calculated end of life
                //failPatientCount =  parseFloat((improvePatientCount * 100)/totalPatient);
                end_of_life = parseFloat((endLifePatientCount) / totalPatient);
            }
        }
        // weight value for success rate = 3, improve function =2, end of life =1
        treatmentOutcome = parseFloat((success_rate * 3) + (improve_function * 2) + (end_of_life * 1)).toFixed(2);

        return {
            outcome: parseFloat(treatmentOutcome),
            outcomePatient: totalPatient,
            success_rate: success_rate,
            successPatientCount: successPatientCount,
            improve_function: improve_function,
            improvePatientCount: improvePatientCount,
            end_of_life: end_of_life,
            endLifePatientCount: endLifePatientCount
        };
    } else {
        return {
            outcome: 0,
            outcomePatient: 0,
            success_rate: 0,
            successPatientCount: 0,
            improve_function: 0,
            improvePatientCount: 0,
            end_of_life: 0,
            endLifePatientCount: 0
        };
    }

}


let prepareTolerability = (data) => {
    let avgAdharence = 0,
        totalPatient = 0,
        sumAdherence = 0;
    // sum up Adherence and patient count for all patient 
    _.map(data, (rec) => {
        sumAdherence += parseFloat(rec.adherence);
        totalPatient += 1;
    });

    avgAdharence = parseFloat(sumAdherence / totalPatient).toFixed(2);

    return {
        avgAdharence: parseFloat(avgAdharence),
        totalPatient: totalPatient
    };

}


let prepareDuration = (data) => {
    if (data.length > 0) {
        let patientDuration = [];
        // grouped viral load data by patient 
        let groupedpatient = _.groupBy(data, (rec) => {
            return rec.PatientId
        })
        for (let key in groupedpatient) {
            let patientJsonObj = {};
            let tempLength = groupedpatient[key].length;
            // check for empty viral load data for each patient
            if (tempLength > 0) {
                //calculate duration for last viral load record with zero value
                if (parseInt(groupedpatient[key][tempLength - 1].ViralLoad) == 0) {
                    let today = moment();
                    let Perfed_Dt = moment(groupedpatient[key][tempLength - 1].Perfed_Dt);
                    patientJsonObj.duration = today.diff(Perfed_Dt, 'days');
                    patientJsonObj.patientId = key;
                } else {
                    let zeroDurationFlag = false;
                    for (let i = 0; i < tempLength; i++) {
                        //calculate duration for any viral load record with zero value
                        if (parseInt(groupedpatient[key][i].ViralLoad) == 0) {
                            if (groupedpatient[key][i + 1]) {
                                // set flag if no viral load record with zero value
                                zeroDurationFlag = true;
                                let zero_record_date = moment(groupedpatient[key][i].Perfed_Dt);
                                let next_record_date = moment(groupedpatient[key][i + 1].Perfed_Dt);

                                patientJsonObj.duration = next_record_date.diff(zero_record_date, 'days');
                                patientJsonObj.patientId = key;
                            }
                        }
                    }
                    //  set duration zero for no record
                    if (!zeroDurationFlag) {
                        patientJsonObj.duration = 0;
                        patientJsonObj.patientId = key;
                    }
                }
                patientDuration.push(patientJsonObj);
            }
        }
        let totalDurationPatient = patientDuration.length,
            patientCountMore3 = 0,
            patientCount1_3 = 0,
            patientCount3month1 = 0,
            patientCountLess3 = 0;
        _.map(patientDuration, (rec) => {
            // sum up patient count for duration >3 year (1095)days
            // sum up patient count for duration 1-3 year (>=365 && < 1095)days
            // sum up patient count for duration 3 month - 1  year (>=90 && < 365)days
            // sum up patient count for duration  < 3 month (<90 )days
            if (rec.duration >= 1095) {
                patientCountMore3 += 1;
            } else if (rec.duration >= 365 && rec.duration < 1095) {
                patientCount1_3 += 1;
            } else if (rec.duration >= 90 && rec.duration < 365) {
                patientCount3month1 += 1;
            } else if (rec.duration < 90) {
                patientCountLess3 += 1;
            }

        });
        // calculate duration with weight value of duration
        // >3 year weight value : 3
        // 1-3 year wight valut : 2
        // 3 month - 1 year : 1
        // < 3 month : 0
        total_duration = parseFloat(((patientCountMore3 / totalDurationPatient) * 3) +
            ((patientCount1_3 / totalDurationPatient) * 2) +
            ((patientCount3month1 / totalDurationPatient) * 1) +
            ((patientCountLess3 / totalDurationPatient) * 0)).toFixed(2);

        return {
            total_duration: parseFloat(total_duration),
            patientCountMore3: patientCountMore3,
            patientCount1_3: patientCount1_3,
            patientCount3month1: patientCount3month1,
            patientCountLess3: patientCountLess3,
            totalDurationPatient: totalDurationPatient
        };
    } else {
        return {
            total_duration: 0,
            patientCountMore3: 0,
            patientCount1_3: 0,
            patientCount3month1: 0,
            patientCountLess3: 0,
            totalDurationPatient: 0
        };

    }
}

// function for calculate treatment cost
let prepareTreatmentCost = (data) => {
    let totalCost = 0,
        avgCost = 0;
    totalPatient = 0;
    
    // sum up cost and patient count for all patient 
    _.map(data, (rec) => {
        totalPatient += parseFloat(rec.total);
        totalCost += rec.weightedCost;
    });

    avgCost = parseFloat(totalCost / totalPatient).toFixed(2);

    return {
        avgCost: parseInt(avgCost),
        totalCostPatient: totalPatient
    };
}

// function for normalize array data to map between 0.5 to 2
// please refer this example : https://jsfiddle.net/jayesh_agrawal/LrLacuvL/2/
let mapDataToFloatInterval = function (data, currentValue) {
    let minValue = _.min(data),
        maxValue = _.max(data);

    let ratio = (currentValue-minValue)/(maxValue - minValue);

    currentValue =(ratio*(2-0.5) + 0.5); 
    
    return currentValue ? parseFloat(currentValue).toFixed(2) : 2;
}


// function for normalize array data to map between 1 to 3
// https://jsfiddle.net/jayesh_agrawal/436mm97L/6/
let mapDataToIntInterval = function (data, currentValue) {
    let minValue = _.min(data),
        maxValue = _.max(data);

    let ratio = (currentValue-minValue)/(maxValue - minValue);
    
    currentValue =Math.round(ratio*(3-1) + 1);    

    return currentValue ? currentValue : 3;
}


/*
Risk Infomation and it's weight value 

1. The ordering and prescribing of this medication is restricted by an Food and Drug Administration mandate or manufacturer controls.	26
2. The labeling for this medication includes a black-box waming.	15
3. Historic Christiana Care experience with similar medications suggests there would be safetly concerns if the medication was approved for formulary addition.	10
4. This medication falls within the category of “high alert medication” as defined by Christiana Care policy.	10
5. This medication is dosed in a manner that increases the potential for error (e.g. weight-based dosing, titrated to effect, titrated in response to lab results, dosed in micrograms, etc.).	5
6. The drug interaction profile includes contraindications or major severity drug interactions with other medications currently utilized at Christiana Care.	3
7. There is potential for a look-alike/sound-alike medication error.	3
8. Use of this medication requires ongoing laboratory monitoring for early detection of specific side effects.	3
9. This medication been commercially available in the United States for less than 1 year.	2
10. There are recommendations for dosing in “special populations” (e.g., neonates, adolescents, elderly, renal impairment and hepatic impairment).	2
11. The medication comes in a ready-to-use dosage form.	−2
12. This medication presents documented safety concerns when used by breast-feeding or pregnant patients.	1
13. There are special considerations for timing the administration of this agent (e.g., food, antacids and tube feedings)?	1
14. There are other safety considerations identified during the review of this medication.	1
*/

let prepareRiskAndBenefits = function (data) {
    if(data.length > 0)
    {
        let socialBenefits = 0, risks=0, normailizeRisks=0, noneOfThese = false;
      //  console.log(parseInt(data[0].RISK1));
        if(parseInt(data[0].RISK1) != 2)
        {
            // calculate risks data by addition of their weight value
            risks += (parseInt(data[0].RISK1) == 1) ? 26 : 0;
            risks += (parseInt(data[0].RISK2) == 1) ? 15 : 0;
            risks += (parseInt(data[0].RISK3) == 1) ? 10 : 0;
            risks += (parseInt(data[0].RISK4) == 1) ? 10 : 0;
            risks += (parseInt(data[0].RISK5) == 1) ? 5 : 0;
            risks += (parseInt(data[0].RISK6) == 1) ? 3 : 0;
            risks += (parseInt(data[0].RISK7) == 1) ? 3 : 0;
            risks += (parseInt(data[0].RISK8) == 1) ? 3 : 0;
            risks += (parseInt(data[0].RISK9) == 1) ? 2 : 0;
            risks += (parseInt(data[0].RISK10) == 1) ? 2 : 0;
            risks += (parseInt(data[0].RISK11) == 1) ? -2 : 0;
            risks += (parseInt(data[0].RISK12) == 1) ? 1 : 0;
            risks += (parseInt(data[0].RISK13) == 1) ? 1 : 0;
            risks += (parseInt(data[0].RISK14) == 1) ? 1 : 0;
           
            // Normalize risk value between 1 to 3 
            if(risks==0)
            {
                normailizeRisks=0;
            }
            else if(risks<24)
            {
                normailizeRisks=1;
            }
            else if(risks>=24 && risks<=39)
            {
                normailizeRisks=2;
            }
            else if(risks>39)
            {
                normailizeRisks=3;
            }
        }
        else{
            noneOfThese= true;
        }
        if(data[0].SOCIAL_BENIFITS){
            socialBenefits =  parseInt(data[0].SOCIAL_BENIFITS);
        }
        else{
            socialBenefits = 0;
        }

        return { risks:risks, socialBenefits:socialBenefits, normailizeRisks:normailizeRisks,noneOfThese:noneOfThese}
    }
    else{
        return { risks:0, socialBenefits:0,normailizeRisks:0,noneOfThese:false}
    }
}