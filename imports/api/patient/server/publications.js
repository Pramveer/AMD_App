
/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

// Meteor.publish('PatientData', function() {

//       //    if (!this.userId) return undefined;
      
//       // return liveDb.select(
//       //     'SELECT PatientID from sample_patients order by patientid desc limit 1', [{
//       //         table: 'sample_patients'
//       //     }]

//       return liveDb.select(
//           'SELECT PATIENT_ID_SYNTH as PatientID from IMS_HCV_PATIENTS order by PATIENT_ID_SYNTH desc limit 1', [{
//               table: 'IMS_HCV_PATIENTS'
//           }]

//       );
//   });
// Meteor.publish('searchListFromDb', function(data) {
//       //if (!this.userId) return undefined;
//   if (!data) return;
//       if (!(data instanceof Array)) return;

//       var d = '%' + data[0] + '%';
//       var limit= data.length==2?data[1]:10;
//       //console.log(limit);
//       //var query = "SELECT * FROM sample_patients where PatientID like" + liveDb.db.escape(d) + " Limit 10";
      
//       var query = "SELECT PATIENT_ID_SYNTH as PatientID, IMS_HCV_PATIENTS.* FROM IMS_HCV_PATIENTS WHERE PATIENT_ID_SYNTH LIKE" + liveDb.db.escape(d) + " OR CIRRHOSIS LIKE" + liveDb.db.escape(d) + " OR TREATMENT LIKE" + liveDb.db.escape(d) + " Limit "+limit;
      
//       // let query = 'SELECT PATIENT_ID_SYNTH as PatientID, "" as PatientName,"" as Address, ST_CD as State, APRI, '+
//       //               '35 as Age,"" as AdmissionDate , "" as DischargeDate,'+
//       //               'PAT_ZIP as ZipCode, "" as AreaCode,BRTH_YR_NBR as Birthday,GENDER_CD as Gender,'+
//       //               '"" as Languge,RACE_DESC as Race,ETHNITY_1_DESC as Ethnicity,"" as Insurance,1 as Genotype,'+
//       //               'VIRAL_LOAD as ViralLoad,0 as ETOH,TREATMENT as Treatment,"" as Relapsed,'+
//       //               '"" as PartialResponse,"" as NonResponsive,"" as Tolerant,"" as PartialTolerant,"" as HCC,"" as UrineScreen,'+
//       //               'CIRRHOSIS as Cirrhosis,MELD_SCORE as MeldScore,"" as AssessmentLiverDisaese,"" as Fibrosur,FIBROSCANE as Fibroscan,'+
//       //               'LIVER_BIOPSY as LiverBiopsy,"" as CMP,"" as CBC,PREGNANCY as Pregnancy,'+
//       //               'RENAL_FAILURE as RenalFailure,MENTAL_HEALTH as MentalHealth,HIV as HIV,Alcohol,0 as BodyWeight,'+
//       //               '"" as Drug,"" as Efficacy,"" as Adherance,"" as Utilization,'+
//       //               '"" as Cost,"" as TotalValue,"" as Category_id '+
//       //               'FROM IMS_HCV_PATIENTS WHERE PATIENT_ID_SYNTH LIKE '+ liveDb.db.escape(d) + ' Limit '+limit;

//        console.log("********************************************************");              
//        console.log(query);

//       console.log("********************************************************");  

//       var result = liveDb.select(
//           query, [{
//               table: 'IMS_HCV_PATIENTS'
//           }]
//       );
//       //console.log(result);
//       return result;
//   });

//   Meteor.publish('searchListFromDbCount', function(data) {
//         //if (!this.userId) return undefined;
//     if (!data) return;
//         if (!(data instanceof Array)) return;

//         var d = '%' + data[0] + '%';

//         //console.log(limit);
//         //var query = "SELECT * FROM sample_patients where PatientID like" + liveDb.db.escape(d) + " Limit 10";
//        // var query = "SELECT count(*) as PatientCount FROM sample_patients where PatientID like" + liveDb.db.escape(d) + " ";

//         var query = "SELECT count(*) as PatientCount FROM IMS_HCV_PATIENTS where PATIENT_ID_SYNTH like" + liveDb.db.escape(d) + "  OR CIRRHOSIS LIKE" + liveDb.db.escape(d) + " OR TREATMENT LIKE" + liveDb.db.escape(d) + "  ";


//         var result = liveDb.select(
//             query, [{
//                 table: 'IMS_HCV_PATIENTS'
//             }]
//         );
//         //console.log(result);
//         return result;
//     });

    /**
     * @author: pramveer
     * @date: 20th feb 2017
     * @desc:Get Distinct Medication combinations excluding the preacting antivirals combinations 
    */
    Meteor.publish('DistinctMedicationCombinations', function() {

        let query = `SELECT DISTINCT MEDICATION From PATIENT_MEDICATIONS  WHERE IS_PREACTING_ANTIVIRAL = 'NO' 
                    order by MEDICATION`;
        var result = liveDb.select(
            query, [{
                table: 'PATIENT_MEDICATIONS'
            }]
        );
        return result;
    });


    //Distinct Preacting Antivirals
    Meteor.publish('DistinctPreactingAntivirals', function() {

        let query = `SELECT DISTINCT MEDICATION FROM PATIENT_MEDICATIONS
                WHERE IS_PREACTING_ANTIVIRAL = 'YES'
                order by MEDICATION`;
        let result = liveDb.select(
            query, [{
                table: 'PATIENT_MEDICATIONS'
            }]
        );
        return result;
    });
     

    
/**
 * @author: Pramveer
 * @date: 17th July 2017
 * @desc: Added new publish method to fetch all created role for our system
 */
//publish all roles
Meteor.publish('getCirrhosisModelAccuracyData',function() {
    return liveDb.select('SELECT * FROM CIRRHOSIS_MODEL_ACCURACY', [{
        table: 'CIRRHOSIS_MODEL_ACCURACY',
    }]);
});