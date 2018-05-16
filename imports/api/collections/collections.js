// Collection decalred globaly
Pages = new Meteor.Collection("pages");
//PatiantDetail = new Meteor.Collection("patiant");
//commented PatientDataList as we are moving this collection in import structure
//// Commented publication from imports/api/patient/server/publications.js,@Arvind, 16-FEB-2017
//PatientDataList = new MysqlSubscription('searchListFromDb'); //Drug Page - When main helper execute
//PatientDataListCount = new MysqlSubscription('searchListFromDbCount');
//// Commented END

//Drugs_data = new MysqlSubscription('AllDrugInfo');  //Drug Page - When main helper execute
AllDrugs = new MysqlSubscription('AllDrugData'); //Drug Page - Used when  we click on the CI DI Capsules
// AllICERDrugs = new MysqlSubscription('AllDrugICERData'); //Drug Page - Used to get ICER Drugs
//DrugRiskData = new MysqlSubscription('DrugRiskData');   //Drug Page
//Hcv_Patients_Data = new MysqlSubscription('HcvPatientsData'); //Drug Page
Drugs_Adverse_Reaction = new MysqlSubscription('getAdverseReactionsForDrugs');
SafetyAdverseReactions = new MysqlSubscription('getSafetyAdverseReactions');
PatientReactions = new MysqlSubscription('getPatientAdverseReactions');
// AnalyticsTabData = new MysqlSubscription('getAnalyticsTabData');
AllUsers = new MysqlSubscription('GetAllUsers');
HCVAnalyticsData = new MysqlSubscription('getHCVAnalyticsData');
Patients_category = new MysqlSubscription('getAllPatientsCategory');
Patients_Analytics = new MysqlSubscription('PatientsAll');
GetGenotypeData = new MysqlSubscription("getGenotypeData");
PatientsCountByGenotypeCirrhosis = new MysqlSubscription("getPatientsGenotypeCirrhosis");
Meteor.users.deny({
    update: function() {
        return true;
    }
});

//TreatedAnalyticsData = new MysqlSubscription('getTreatedAnalyticsData');
// UnTreatedAnalyticsData = new MysqlSubscription('getUnTreatedAnalyticsData');
// TreatingAnalyticsData = new MysqlSubscription('getTreatingAnalyticsData');
ClaimsInsurancePlan = new MysqlSubscription('getClaimsInsurancePlans');
AdvPayerPatientsCount = new MysqlSubscription('getAdvPayer_PatientsCount');
GenotypeList = new MysqlSubscription('getGenotypeList');
PatientsGenotypeList = ["1a", "1b", "2", "3", "4"];
EthnicityList = ['AFRICAN AMERICAN', 'ASIAN', 'CAUCASIAN', 'OTHER', 'UNKNOWN'];
//UnTreatedPatientsData = new MysqlSubscription('getUnTreatedPatientsData');
//all possible category names , need to be dynamic todo
category_name_list = ["1a Naive cirrhosis", "1a Naive", "1a Naive 6", "1b Naive cirrhosis",
    "1b Naive", "2 Naive cirrhosis", "2 Naive", "3 Naive cirrhosis", "3 Naive",
    "4 Naive cirrhosis", "4 Naive", "5 Naive cirrhosis", "5 Naive",
    "6 Naive cirrhosis", "6 Naive", "1 Experienced cirrhosis", "1 Experienced",
    "1b Experienced cirrhosis", "1b Experienced", "2 Experienced cirrhosis",
    "2 Experienced", "3 Experienced cirrhosis", "3 Experienced", "4 Experienced cirrhosis",
    "4 Experienced", "5 Experienced cirrhosis", "5 Experienced", "6 Experienced cirrhosis",
    "6 Experienced", "1a Experienced cirrhosis", "1a Experienced", "1a ExperiencedRelapsed",
    "1a Experienced Partial Response", "1a Experienced Non Responsive", "1 Naive cirrhosis", "1 Naive",
];
ListOfYear = new MysqlSubscription('getListOfYear');

// Distinct Medications Available
DistinctMedicationCombinations = new MysqlSubscription('DistinctMedicationCombinations');


//Distinct Preacting Antivirals
DistinctPreactingAntivirals = new MysqlSubscription('DistinctPreactingAntivirals');

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 01-Mar-2017
 * @desc: Added subscription for newly created method to fetch all created role for our system
 */
//Fetch all roles
AllRoles = new MysqlSubscription('GetAllRoles');

/**
 * @author: Pramveer
 * @date: 17th July 2017
 * @desc: Added subscription for cirhosis model accuracy data
 */
__CirrhosisModelAccuracyData = new MysqlSubscription('getCirrhosisModelAccuracyData');