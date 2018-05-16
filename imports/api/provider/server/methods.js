import * as serverUtils from '../../common/serverUtils.js';
Meteor.syncMethods({
    
    'AddHCVChecklistData': function(pData, callback) {
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
            liveDb.db.query('Call AddHCVCheckListUser(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? ,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? ,?,?,? ,?,?,?,?,?)', [pData.PATIENTNAME,
                    pData.DOB,
                    pData.ChronicHepa,
                    pData.GENOTYPE,
                    pData.hcvRNALevel,
                    pData.hcvRNALevelDate,
                    pData.ChronicHepaExtra,
                    pData.ASTFlag,
                    pData.ALTFlag,
                    pData.BilirubinFlag,
                    pData.AlbuminFlag,
                    pData.INRFlag,
                    pData.PlateletCountFlag,
                    pData.HemoglobinFlag,
                    pData.CreatinineFlag,
                    pData.HBsAGFlag,
                    pData.antiHBsFlag,
                    pData.antiHBcFlag,
                    pData.LiverTransplantFlag,
                    pData.LiverTransplantCheckFlag,
                    pData.LiverTransplantCheckPastDate,
                    pData.LiverTransplantBeingConsidered,
                    pData.LiverAssessmentFlag,
                    pData.TreatmentExperienced,
                    pData.TreatmentExperiencedRegimen,
                    pData.TreatmentExperiencedRegimenFlag,
                    pData.TreatmentExperiencedReasonDiscontinuation,
                    pData.TreatmentExperiencedPatientResponse,
                    pData.TreatmentExperiencedDirectActingAntiViral,
                    pData.TreatmentExperiencedReviewedFlag,
                    pData.ResistanceTestingGenotype1aZepaFlag,
                    pData.ResistanceTestingGenotype1aZepaNS5A,
                    pData.ResistanceTestingGenotype3TNCFlag,
                    pData.ResistanceTestingGenotype3TNCNS5A,
                    pData.ResistanceTestingGenotype3TNNonCFlag,
                    pData.ResistanceTestingGenotype3TNNonCNS5A,
                    pData.ResistanceTestingPriorTreatmentFailureFlag,
                    pData.ResistanceTestingPriorTreatmentFailureNS5A,
                    pData.ResistanceTestingPriorTreatmentFailureNS3,
                    pData.RequestMedicationsDrug1,
                    pData.RequestMedicationsDose1,
                    pData.RequestMedicationsDuration1,
                    pData.RequestMedicationsDrug2,
                    pData.RequestMedicationsDose2,
                    pData.RequestMedicationsDuration2,
                    pData.RequestMedicationsAlternativeEqui,
                    pData.RequestMedicationsAlternativeDrugs,
                    pData.RequestMedicationsComments,
                    pData.AdherencePotentialFlag,
                    pData.attachments
                ],

                function(error, result) {
                    if (error) {
                        //If in First place any error occurs
                        console.log(error);
                        r = {
                            message: "Some internal problem while user insertion",
                            statuscode: -1,
                            response: error
                        };
                        callback(undefined, r);

                    } else if (result && result.affectedRows > 0) {
                        //User added
                        //To Do Send email once user created
                        r = {
                            message: "User added successfully",
                            statuscode: 0,
                            response: result,
                            userData: pData

                        };
                        callback(undefined, r);

                    } else {
                        //User not added
                        r = {
                            message: "User not added",
                            statuscode: 1,
                            response: result
                        };
                        callback(undefined, r);
                    }
                });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
    'getPreAuthorizationFormData': function(params, callback) {
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

            dataObj['PreauthorizationData'] = null;


            let newQuery = `SELECT hcv_id,hcv_PATIENTNAME,hcv_DOB, DATE_FORMAT(hcv_DOB,'%Y-%m-%d') hcv_DOBPA,hcv_ChronicHepa,hcv_GENOTYPE,hcvRNALevel,hcvRNALevelDate ,DATE_FORMAT(hcvRNALevelDate,'%Y-%m-%d') hcvRNALevelDatePA,hcv_ChronicHepaExtra,
            hcv_ASTFlag,hcv_ALTFlag,hcv_BilirubinFlag,hcv_AlbuminFlag,hcv_INRFlag,hcv_PlateletCountFlag,hcv_HemoglobinFlag,hcv_CreatinineFlag,
            hcv_HBsAGFlag,hcv_antiHBsFlag,hcv_antiHBcFlag,hcv_LiverTransplantFlag,hcv_LiverTransplantCheckFlag,hcv_LiverTransplantCheckPastDate ,DATE_FORMAT(hcv_LiverTransplantCheckPastDate,'%Y-%m-%d') hcv_LiverTransplantCheckPastDatePA,
            hcv_LiverTransplantBeingConsidered,hcv_LiverAssessmentFlag,hcv_TreatmentExperienced,hcv_TreatmentExperiencedRegimen,hcv_TreatmentExperiencedRegimenFlag,
            hcv_TreatmentExperiencedReasonDiscontinuation,hcv_TreatmentExperiencedPatientResponse,hcv_TreatmentExperiencedDirectActingAntiViral,
            hcv_TreatmentExperiencedReviewedFlag,hcv_ResistanceTestingGenotype1aZepaFlag,hcv_ResistanceTestingGenotype1aZepaNS5A,hcv_ResistanceTestingGenotype3TNCFlag,
            hcv_ResistanceTestingGenotype3TNCNS5A,hcv_ResistanceTestingGenotype3TNNonCFlag,hcv_ResistanceTestingGenotype3TNNonCNS5A,hcv_ResistanceTestingPriorTreatmentFailureFlag,
            hcv_ResistanceTestingPriorTreatmentFailureNS5A,hcv_ResistanceTestingPriorTreatmentFailureNS3,hcv_RequestMedicationsDrug1,
            hcv_RequestMedicationsDose1,hcv_RequestMedicationsDuration1 ,hcv_RequestMedicationsDrug2,hcv_RequestMedicationsDose2,
            hcv_RequestMedicationsDuration2 ,hcv_RequestMedicationsAlternativeEqui,hcv_RequestMedicationsAlternativeDrugs,hcv_RequestMedicationsComments,
            hcv_AdherencePotentialFlag,attachments from IMS_HCV_CheckList where 1=1`;

            if (params.form == "PAForm")
                newQuery = newQuery + ` and hcv_id = ${params.PAID}; `;

            if (params.form == "PAFormList")
                newQuery = newQuery + ` and hcv_PATIENTNAME like "%${params.patientname}%" ;`;

            // console.log("***************  NEw  Query 1 ******************************");
            // console.log(newQuery);

            liveDb.db.query(newQuery, function(error, result) {
                if (error || result.length < 1) {
                    console.log(error);
                    callback(true, null);
                } else {
                    dataObj['PreauthorizationData'] = result;
                    let stringified = JSON.stringify(dataObj);
                    let compressed_object = LZString.compress(stringified);

                    //callback(undefined,data);
                    callback(undefined, compressed_object);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }

});


//commented by Pram (10th Feb 17) to make the treatment period query common
//in order to fix the Medication Utilization bug
/*function getNonFDACompliantTreatmentPeriod(treatmentPeriod) {
    console.log(treatmentPeriod);

    let originalTreatmentPeriod = treatmentPeriod.split(',');
    let filteredTreatmentPeriod = [];
    for (var i = 0; i < originalTreatmentPeriod.length; i++) {

        if (!(originalTreatmentPeriod[i] == 8 || originalTreatmentPeriod[i] == 12 || originalTreatmentPeriod[i] == 16 || originalTreatmentPeriod[i] == 24 || originalTreatmentPeriod[i] == 48)) {
            filteredTreatmentPeriod.push(originalTreatmentPeriod[i]);
        }
    }
    filteredTreatmentPeriod = filteredTreatmentPeriod.join(",");
    // console.log(filteredTreatmentPeriod);
    return filteredTreatmentPeriod;
}


function getFDACompliantTreatmentPeriod(treatmentPeriod) {
    // console.log(treatmentPeriod);
    return "8,12,16,24,48";
} */
