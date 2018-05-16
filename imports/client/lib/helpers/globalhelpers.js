import {
    Template
} from 'meteor/templating';

// Helper method to check user is logged in or not
Template.registerHelper('currentuser', () => {
    var user = Meteor.user() ? Meteor.user().profile.userDetail.username : null;
    //var user = localStorage.getItem('user');
    return user ? true : false;
});

Template.registerHelper('logout', () => {
    var user = Meteor.user().profile.userDetail.username = '';
    return user ? true : false;
});

//Display or render header based on condition
Template.registerHelper('isWelcome', () => {
    console.log(location.pathname);
    var isVisible = true;
    if (location.pathname.toLowerCase() === '/welcome' || location.pathname.toLowerCase() === '/login' || location.pathname.toLowerCase() === '/admindashboard' || location.pathname.toLowerCase() === '/dashboard' || location.pathname.toLowerCase() === '/#' || location.pathname.toLowerCase().length <= 2) {
        isVisible = false;
    }
    if (location.pathname.toLowerCase() === '/login') {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'scroll';
    }
    return isVisible;
});

Template.registerHelper('isSearchPatient', () => {
    if (Router['PatientId'] != '') {
        return true;
    } else {
        return false;
    }
});

//Display or render header based on condition
Template.registerHelper('isWrapperNeeded', () => {
    var isVisible = "wrapper";
    if (location.pathname.toLowerCase() === '/login') {
        isVisible = "";
    }

    return isVisible;
});
Template.registerHelper('maskedDate', (pDate) => {
    let date = new Date(pDate).getFullYear();
    return isNaN(date) ? '' : date;
});

Template.registerHelper('roundOffAPRI', (pValue) => {
    return pValue && parseFloat(pValue) > 0 ? parseFloat(pValue).toFixed(2) : '';
});

Template.registerHelper('maskedZipCode', (pZipCode) => {
    //Need to handle ZipCode which is three digit as per Hippa
    let zipCode = pZipCode && pZipCode.length == 5 ? pZipCode.substring(2, pZipCode.length) : (pZipCode ? pZipCode : "");
    return zipCode.length > 0 ? `XX${zipCode}` : "";
});
Template.registerHelper('isFullWidth', () => {
    var isVisible = "fullwidth";
    if (location.pathname.toLowerCase() === '/login') {
        isVisible = "";
    }

    return isVisible;
});

//Check weather user is in Specific role or not and then display tabs on header navigation
Template.registerHelper('isPayerOrAdmin', () => {
    //old code running with Meteor.user
    var userInfo = Meteor.user();
    var user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
        "UserCount": 1,
        "username": "",
        "email": "",
        "organization": "",
        "org_id": 1,
        "role": 0,
        "tabs_name": ""
    };
    return user.role === 1 || user.role === 2 ? true : false;
});

// Check whether is from custom role and if yes then check user have access to specific tab or page
Template.registerHelper('isCustomRole', function (tab) {
    console.log(tab);
    console.log("logged-customerole");
    return isCustomRole(tab);
});

// /**
//  * @author: Arvind
//  * @reviewer: 
//  * @date: 01-March-2017
//  * @desc: Added method to cehck user role is PrimaryCarePhysician or not
//  */
// let isPrimaryCarePhysician = function () {
//     var userInfo = Meteor.user();
//     var user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
//         "UserCount": 1,
//         "username": "",
//         "email": "",
//         "organization": "",
//         "org_id": 1,
//         "role": 0
//     };
//     return user.role === 5 ? true : false;
// };
let isCustomRole = (tab) => {   
    
    /**
     Role : PCP,PHARMA,SUPERUSER ,Provider,Payer,Custom,Admin 
    PCP always separate(shouldn’t visible for any other user or customer e.g PHS)
    Provider: Patient/Provider/Dashbaord/Analytics
    Payer : Patient/Provider/Dashbaord/Analytics/Payer
    PHARMA: role have access to Pharma tab and Analytics tab,Dashboard   Phrama/Analytics/Dashboard
    SUPERUSER : Phrama,Payer,Provider (Each for role have their super user role user who create user on behalf)
    Admin: Have access to entire app
    Custom: user have access to specific tab entered
    Admin :1
    Payer : 2
    Provider : 3
    Custom : 4
    PrimaryCarePhysician : 5
        */
    var userInfo = Meteor.user();
    var user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
        "UserCount": 1,
        "username": "",
        "email": "",
        "organization": "",
        "org_id": 1,
        "role": 0,
        "tabs_name": ""
    };

    var AccessibleTab = user.role === 4 && user.tabs_name && user.tabs_name.length > 0 ? user.tabs_name.split(',') : [];
    var isCustom = user.role === 4 && _.indexOf(AccessibleTab, tab) > -1 ? true : false;
    /**
     * @author: Arvind
     * @reviewer: 
     * @date: 01-Mar-2017
     * @updated : 02-May-2017
     * @desc: Added condition check for user role PrimaryCarePhysician along with accessible tab for that role
     * Added more role(Payer,Provider) configuration 
     */
    let AccessibleTabForPrimaryCarePhysician = ["assessmenttool", "provider"];
    let isPrimaryCarePhysicianRole = isPCPAuhtorized() && _.indexOf(AccessibleTabForPrimaryCarePhysician, tab.toLowerCase()) > -1;
    //Patient/Provider/Dashbaord/Analytics
    let AccessibleTabForProvider = ["patient", "provider", "analytics", "dashboard"];
    // Patient/Provider/Dashbaord/Analytics/Payer
    let AccessibleTabForPayer = ["patient", "provider", "analytics", "dashboard", "payer"];

    let isProviderRole = user.role === 3 && _.indexOf(AccessibleTabForProvider, tab.toLowerCase()) > -1 ? true : false;

    let isPayerRole = user.role === 2 && _.indexOf(AccessibleTabForPayer, tab.toLowerCase()) > -1 ? true : false;

    return isCustom || user.role === 1 || isPayerRole || isProviderRole || isPrimaryCarePhysicianRole ? true : false;
};

//Check weather user is in Specific PrimaryCarePhysicianRole or not and then display tabs on header navigation
Template.registerHelper('isPrimaryCarePhysicianRole', () => {
    // function path : `../../lib/custom/common`  
    // For Primary Care Provider need to add role here
    return isPCPAuhtorized();
});
//helper to get risk data for drug
Template.registerHelper('renderDrugsRiskData', (drugName, safetyPercent, DrugRiskData) => {
    //get individual drug name from the combination of drugs
    //store drug full name to display in drug popup
    var drugFullName = drugName;
    drugName = drugName.replace("THEN", '+');
    var n = drugName.indexOf('=');
    drugName = drugName.substring(0, n != -1 ? n : drugName.length);
    drugName = drugName.split(' + ');
    var week = '';
    var week_temp = drugName[drugName.length - 1].split(' ');
    //get the Treatment period from the drugname
    week = week_temp[week_temp.length - 1];
    if (week == '')
        week = week_temp[week_temp.length - 2];
    /* console.log(drugName);

     console.log(week);  */
    var finalData = [];
    var tempweek = week.substring(1, week.indexOf('W'));

    //  console.log(tempweek);
    for (i = 0; i < drugName.length; i++) {
        //remove the content between barckets ()
        drugName[i] = drugName[i].replace(/\s*\(.*?\)\s*/g, '');
        //remove extra trailing space from drugname
        drugName[i] = drugName[i].replace(/(^[\s]+|[\s]+$)/g, '');
        // drugName[i] = drugName[i].replace('-', '');
        //  console.log(drugName[i]);

        // if (tempweek >= 0 && tempweek <= 8)
        //     tempweek = 8;
        // else if (tempweek > 8 && tempweek <= 12)
        //     tempweek = 12;
        // else if (tempweek > 12 && tempweek <= 24)
        //     tempweek = 24;
        // else if (tempweek > 24 && tempweek <= 48)
        //     tempweek = 48;
        // else if (tempweek > 48)
        //     tempweek = 48;

        // console.log(DrugRiskData);
        // Added by Yuvraj
        var isDrugMatched = false;

        for (j = 0; j < DrugRiskData.length; j++) {
            // var drugPeriod = DrugRiskData[j]['Drugname'] + ' (' + DrugRiskData[j]['Treatment_Period'] + 'W)';

            // modified by Yuvraj  25/11/2016
            var drugPeriod = DrugRiskData[j]['Drugname'];
            var lrPopover = 'popover',
                hrPopover = 'popover';
            //if ((drugName[i].toUpperCase() + ' ' + week) === drugPeriod.toUpperCase()) {


            var flag = false;
            var Pregnancy_In_LR = "";
            var Pregnancy_In_HR = "";
            var RenalFailure_In_LR = "";
            var RenalFailure_In_HR = "";
            var MentalHealth_In_LR = "";
            var MentalHealth_In_HR = "";
            var HIV_In_LR = "";
            var HIV_In_HR = "";
            var Alcohol_In_LR = "";
            var Alcohol_In_HR = "";

            var Pregnancy_LR_Title = "";
            var Pregnancy_HR_Title = "";
            var RenalFailure_LR_Title = "";
            var RenalFailure_HR_Title = "";
            var MentalHealth_LR_Title = "";
            var MentalHealth_HR_Title = "";
            var HIV_LR_Title = "";
            var HIV_HR_Title = "";
            var Alcohol_LR_Title = "";
            var Alcohol_HR_Title = "";

            var Pregnancy_LR_Section = "";
            var Pregnancy_HR_Section = "";
            var RenalFailure_LR_Section = "";
            var RenalFailure_HR_Section = "";
            var MentalHealth_LR_Section = "";
            var MentalHealth_HR_Section = "";
            var HIV_LR_Section = "";
            var HIV_HR_Section = "";
            var Alcohol_LR_Section = "";
            var Alcohol_HR_Section = "";
            var hivdosageflag = false;
            var bodyWeight = 0;
            var CurrentPatientData = Session.get("selectedPatientData");
            var dosage_risk = [];


            var drugitems = DrugRiskData.filter(function (el) {
                return (el.Drugname.toUpperCase() == drugPeriod.toUpperCase());
            });


            // Modified By Yurvaj (4th Jan 2017);
            // When we dont have Risk information of a drug with same name and treatment period, 
            // we are modifying its treatment period and taking the closest availabel one to show the risk information.
            var weeks = _.pluck(drugitems, 'Treatment_Period');

            let modifiedWeeks = [];
            _.each(weeks, (rec) => {
                let obj = {};
                obj['week'] = parseInt(rec);
                obj['quotient'] = rec / tempweek;
                modifiedWeeks.push(obj);
            });
            tempweek = _.where(modifiedWeeks, {
                quotient: _.min(_.pluck(modifiedWeeks, 'quotient'))
            })[0]['week'];

            // var maxweek = Math.max.apply(Math, weeks);
            // /* console.log(maxweek);
            //  console.log('----3----');*/

            // if (tempweek >= maxweek)
            //     tempweek = maxweek;

            // modified by Yuvraj  25/11/2016
            if ((drugName[i].toUpperCase() === drugPeriod.toUpperCase()) && (DrugRiskData[j]['Treatment_Period'] == tempweek)) {
                //  console.log(drugPeriod.toUpperCase());
                //  console.log(drugName[i].toUpperCase());
                // if (drugPeriod.toUpperCase().indexOf(drugName[i].toUpperCase()) != -1) {
                isDrugMatched = true;
                // week = '(' + tempweek + 'W)';
                // console.log(tempweek);
                // console.log('----4----');
                // week = tempweek

                if (CurrentPatientData != undefined) {
                    flag = isAnyInputYes(CurrentPatientData);
                    if (flag) {
                        var temp = whichInputIsYes(CurrentPatientData);
                        flag = false;
                        hivdosageflag = false;
                        bodyWeight = temp[0].BodyWeight;

                        if (temp[0].Pregnancy == DrugRiskData[j]['Pregnancy_In_LR']) {
                            Pregnancy_In_LR = "Pregnancy";
                            Pregnancy_LR_Title = DrugRiskData[j]['Pregnancy_LR_Title'];
                            Pregnancy_LR_Section = DrugRiskData[j]['Pregnancy_LR_Section'];
                            flag = true;
                        }

                        if (temp[0].Pregnancy == DrugRiskData[j]['Pregnancy_In_HR']) {
                            Pregnancy_In_HR = "Pregnancy";
                            Pregnancy_HR_Title = DrugRiskData[j]['Pregnancy_HR_Title'];
                            Pregnancy_HR_Section = DrugRiskData[j]['Pregnancy_HR_Section'];
                            flag = true;
                        }

                        if (temp[0].RenalFailure == DrugRiskData[j]['RenalFailure_In_LR']) {
                            RenalFailure_In_LR = "Renal Failure";
                            RenalFailure_LR_Title = DrugRiskData[j]['RenalFailure_LR_Title'];
                            RenalFailure_LR_Section = DrugRiskData[j]['RenalFailure_LR_Section'];
                            flag = true;
                        }
                        if (temp[0].RenalFailure == DrugRiskData[j]['RenalFailure_In_LR']) {
                            RenalFailure_In_HR = "Renal Failure";
                            RenalFailure_HR_Title = DrugRiskData[j]['RenalFailure_HR_Title'];
                            RenalFailure_HR_Section = DrugRiskData[j]['RenalFailure_HR_Section'];
                            flag = true;
                        }

                        if (temp[0].MentalHealth == DrugRiskData[j]['MentalHealth_In_LR']) {
                            MentalHealth_In_LR = "Mental Health";
                            MentalHealth_LR_Title = DrugRiskData[j]['MentalHealth_LR_Title'];
                            MentalHealth_LR_Section = DrugRiskData[j]['MentalHealth_LR_Section'];

                            flag = true;
                        }
                        if (temp[0].MentalHealth == DrugRiskData[j]['MentalHealth_In_HR']) {
                            MentalHealth_In_HR = "Mental Health";
                            MentalHealth_HR_Title = DrugRiskData[j]['MentalHealth_HR_Title'];
                            MentalHealth_HR_Section = DrugRiskData[j]['MentalHealth_HR_Section'];
                            flag = true;
                        }

                        if (temp[0].HIV == DrugRiskData[j]['HIV_In_LR']) {
                            HIV_In_LR = "HIV";
                            HIV_LR_Title = DrugRiskData[j]['HIV_LR_Title'];
                            HIV_LR_Section = DrugRiskData[j]['HIV_LR_Section'];
                            flag = true;
                            hivdosageflag = true;
                        }
                        if (temp[0].HIV == DrugRiskData[j]['HIV_In_HR']) {
                            HIV_In_HR = "HIV";
                            HIV_HR_Title = DrugRiskData[j]['HIV_HR_Title'];
                            HIV_HR_Section = DrugRiskData[j]['HIV_HR_Section'];
                            flag = true;
                            hivdosageflag = true;
                        }

                        if (temp[0].Alcohol == DrugRiskData[j]['Alcohol_In_LR']) {
                            Alcohol_In_LR = "Alcohol";
                            Alcohol_LR_Title = DrugRiskData[j]['Alcohol_LR_Title'];
                            Alcohol_LR_Section = DrugRiskData[j]['Alcohol_LR_Section'];
                            flag = true;
                        }

                        if (temp[0].Alcohol == DrugRiskData[j]['Alcohol_In_HR']) {
                            Alcohol_In_HR = "Alcohol";
                            Alcohol_HR_Title = DrugRiskData[j]['Alcohol_HR_Title'];
                            Alcohol_HR_Section = DrugRiskData[j]['Alcohol_HR_Section'];
                            flag = true;
                        }
                    }

                }


                if (hivdosageflag && DrugRiskData[j]['conditions']) {

                    var weight = CurrentPatientData[0].BodyWeight;
                    var drug_condition = DrugRiskData[j]['conditions'].split(';');
                    dosage_risk.push({
                        'name': 'HIV',
                        'value': drug_condition[0].split('then')[1]
                    });
                    if (weight < 75) {
                        dosage_risk.push({
                            'name': 'Weight < 75',
                            'value': drug_condition[0].split('then')[1]
                        });
                        //html += ''+drug_condition[0].split('then')[1]+'';
                    } else {
                        dosage_risk.push({
                            'name': 'Weight > 75',
                            'value': drug_condition[1].split('then')[1]
                        });
                        //html += ''+drug_condition[1].split('then')[1]+'';
                    }
                }


                if (dosage_risk.length == 0) {
                    hivdosageflag = false;
                }
                /* Converting Counts into percentage */

                var LR_Count = parseInt(DrugRiskData[j]['LR_Count']);
                var HR_Count = parseInt(DrugRiskData[j]['HR_count']);
                var LR_Count_Percent = (LR_Count * 100) / (LR_Count + HR_Count);
                var HR_Count_Percent = (HR_Count * 100) / (LR_Count + HR_Count);

                /* Converting Counts into percentage with respect to Safety Percentage. */

                var Remaining_Safety_Percentage = 100 - safetyPercent;
                var LR_Percentage = (LR_Count_Percent / 100) * Remaining_Safety_Percentage;
                LR_Percentage = LR_Percentage.toFixed(1);
                var HR_Percentage = (HR_Count_Percent / 100) * Remaining_Safety_Percentage;
                HR_Percentage = HR_Percentage.toFixed(1);


                /* Condition to Display Popup or Not */
                if (DrugRiskData[j]['LR_Count'] == '0') {
                    //lrPopover = 'not-Popover';
                    DrugRiskData[j]['LR_filePath'] = '/RiskTables/NORISKFOUND.html';
                }

                // if (DrugRiskData[j]['HR_count'] == '0')
                //hrPopover = 'not-Popover';

                // Modified By Yuvraj 28/11/2016
                //drugPeriod = DrugRiskData[j]['Drugname'] + ' (' + DrugRiskData[j]['Treatment_Period'] + 'W)';
                drugPeriod = drugName[i] + ' ' + week;
                /* console.log(drugPeriod);
                 console.log('drugPeriod');*/

                finalData.push({

                    drugname: DrugRiskData[j]['Drugname'],
                    drugnamewithperiod: drugPeriod,
                    drugDosage: DrugRiskData[j]['standard_dosage'] ? DrugRiskData[j]['standard_dosage'] : getNearestDosage(DrugRiskData, DrugRiskData[j]),
                    drugConditions: DrugRiskData[j]['conditions'],
                    drugDosageFlag: hivdosageflag,
                    dosageArray: dosage_risk,
                    // hrcount: DrugRiskData[j]['HR_count'],
                    // lrcount: DrugRiskData[j]['LR_Count'],
                    hrcount: LR_Percentage,
                    lrcount: HR_Percentage,
                    lrFile: DrugRiskData[j]['LR_filePath'],
                    hrFile: DrugRiskData[j]['HR_filePath'],
                    lrPopover: lrPopover,
                    hrPopover: hrPopover,

                    Pregnancy_In_LR: Pregnancy_In_LR,
                    Pregnancy_In_HR: Pregnancy_In_HR,
                    RenalFailure_In_LR: RenalFailure_In_LR,
                    RenalFailure_In_HR: RenalFailure_In_HR,
                    MentalHealth_In_LR: MentalHealth_In_LR,
                    MentalHealth_In_HR: MentalHealth_In_HR,
                    HIV_In_LR: HIV_In_LR,
                    HIV_In_HR: HIV_In_HR,
                    Alcohol_In_LR: Alcohol_In_LR,
                    Alcohol_In_HR: Alcohol_In_HR,

                    Pregnancy_LR_Title: Pregnancy_LR_Title,
                    Pregnancy_HR_Title: Pregnancy_HR_Title,
                    RenalFailure_LR_Title: RenalFailure_LR_Title,
                    RenalFailure_HR_Title: RenalFailure_HR_Title,
                    MentalHealth_LR_Title: MentalHealth_LR_Title,
                    MentalHealth_HR_Title: MentalHealth_HR_Title,
                    HIV_LR_Title: HIV_LR_Title,
                    HIV_HR_Title: HIV_HR_Title,
                    Alcohol_LR_Title: Alcohol_LR_Title,
                    Alcohol_HR_Title: Alcohol_HR_Title,

                    Pregnancy_LR_Section: Pregnancy_LR_Section,
                    Pregnancy_HR_Section: Pregnancy_HR_Section,
                    RenalFailure_LR_Section: RenalFailure_LR_Section,
                    RenalFailure_HR_Section: RenalFailure_HR_Section,
                    MentalHealth_LR_Section: MentalHealth_LR_Section,
                    MentalHealth_HR_Section: MentalHealth_HR_Section,
                    HIV_LR_Section: HIV_LR_Section,
                    HIV_HR_Section: HIV_HR_Section,
                    Alcohol_LR_Section: Alcohol_LR_Section,
                    Alcohol_HR_Section: Alcohol_HR_Section,

                    showFlag: flag,
                    drugFullName: drugFullName
                });

                break;
            }

        }

        // Modified By Yuvraj 29/11/2016
        if (!isDrugMatched) {
            // Modified By Yuvraj 29/11/2016
            drugPeriod = drugName[i] + ' ' + week;
            finalData.push({

                drugname: drugName[i],
                drugnamewithperiod: drugPeriod
            });
        }


    }
    return finalData;
});

function getNearestDosage(DrugRiskData, currentRisk) {
    let filteredData = _.where(DrugRiskData, {
        Drugname: currentRisk.Drugname
    });
    let dosage = '';

    if (filteredData) {
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i]['standard_dosage']) {
                dosage = filteredData[i]['standard_dosage'];
            }
        }
    }

    return dosage;
}

//helper to get patient sub population Info
Template.registerHelper('getPateintInfo', () => {
    var data = Template.Provider.__helpers.get('getPopulationData').call();
    return data;
});

//helper to calculate Age from Year
Template.registerHelper('calculateAgeFromBirthYear', (pYear) => {
    let data = '';
    if (pYear)
        data = new Date().getFullYear() - parseInt(pYear);
    return isNaN(data) ? 0 : data;
});

//helper to calculate Viral load in millions
Template.registerHelper('convertViralLoadToMillion', (pData) => {
    let data = '';
    if (pData)
        data = (parseFloat(pData) / 1000000).toFixed(2);
    return isNaN(data) ? '' : data;
});


Template.registerHelper('getGenderSelected', (data) => {
    var store = [{
        value: 'M',
        name: 'Male'
    }, {
        value: 'F',
        name: 'Female'
    }];
    let gender = '';
    var flag = false;
    for (var i = 0; i < store.length; i++) {
        if (store[i]['value'] == data) {
            flag = true;
            gender = store[i]['name'];
        }
    }
    if (flag) {
        return gender;
    } else {
        return '';
    }
});

//helper to get years combo value in machine learning sub tabs
Template.registerHelper('getMacLearnYearsComboValues', () => {
    let cdate = new Date();
    let toyears = [];
    for (i = 2010; i <= 2016; i++) {
        toyears.push(i);
    }
    return toyears;
});

//helper to set from date in the year combo of machine learning sub tabs
Template.registerHelper('getMacLearnFromDateValue', (optionVal) => {
    let cdate = new Date();
    if (optionVal.toString() === '2011') {
        return 'selected'
    }
});

//helper to set to date in the year combo of machine learning sub tabs
Template.registerHelper('getMacLearnToDateValue', (optionVal) => {
    let cdate = new Date();
    if (optionVal.toString() === '2016') {
        return 'selected'
    }
});


Template.registerHelper('getBindStoreSelected', (state_cd) => {
    //var store = Template.HeaderInnerContentEditMode.__helpers[" BindStates"]();

    var store = [{
        State: "Alabama",
        Abbreviation: "AL"
    }, {
        State: "Alaska",
        Abbreviation: "AK"
    }, {
        State: "Arizona",
        Abbreviation: "AZ"
    }, {
        State: "Arkansas",
        Abbreviation: "AR"
    }, {
        State: "California",
        Abbreviation: "CA"
    }, {
        State: "Colorado",
        Abbreviation: "CO"
    }, {
        State: "Connecticut",
        Abbreviation: "CT"
    }, {
        State: "Delaware",
        Abbreviation: "DE"
    }, {
        State: "District of Columbia",
        Abbreviation: "DC"
    }, {
        State: "Florida",
        Abbreviation: "FL"
    }, {
        State: "Georgia",
        Abbreviation: "GA"
    }, {
        State: "Hawaii",
        Abbreviation: "HI"
    }, {
        State: "Idaho",
        Abbreviation: "ID"
    }, {
        State: "Illinois",
        Abbreviation: "IL"
    }, {
        State: "Indiana",
        Abbreviation: "IN"
    }, {
        State: "Iowa",
        Abbreviation: "IA"
    }, {
        State: "Kansas",
        Abbreviation: "KS"
    }, {
        State: "Kentucky",
        Abbreviation: "KY"
    }, {
        State: "Louisiana",
        Abbreviation: "LA"
    }, {
        State: "Maine",
        Abbreviation: "ME"
    }, {
        State: "Montana",
        Abbreviation: "MT"
    }, {
        State: "Nebraska",
        Abbreviation: "NE"
    }, {
        State: "Nevada",
        Abbreviation: "NV"
    }, {
        State: "New Hampshire",
        Abbreviation: "NH"
    }, {
        State: "New Jersey",
        Abbreviation: "NJ"
    }, {
        State: "New Mexico",
        Abbreviation: "NM"
    }, {
        State: "New York",
        Abbreviation: "NY"
    }, {
        State: "North Carolina",
        Abbreviation: "NC"
    }, {
        State: "North Dakota",
        Abbreviation: "ND"
    }, {
        State: "Ohio",
        Abbreviation: "OH"
    }, {
        State: "Oklahoma",
        Abbreviation: "OK"
    }, {
        State: "Oregon",
        Abbreviation: "OR"
    }, {
        State: "Maryland",
        Abbreviation: "MD"
    }, {
        State: "Massachusetts",
        Abbreviation: "MA"
    }, {
        State: "Michigan",
        Abbreviation: "MI"
    }, {
        State: "Minnesota",
        Abbreviation: "MN"
    }, {
        State: "Mississippi",
        Abbreviation: "MS"
    }, {
        State: "Missouri",
        Abbreviation: "MO"
    }, {
        State: "Pennsylvania",
        Abbreviation: "PA"
    }, {
        State: "Rhode Island",
        Abbreviation: "RI"
    }, {
        State: "South Carolina",
        Abbreviation: "SC"
    }, {
        State: "South Dakota",
        Abbreviation: "SD"
    }, {
        State: "Tennessee",
        Abbreviation: "TN"
    }, {
        State: "Texas",
        Abbreviation: "TX"
    }, {
        State: "Utah",
        Abbreviation: "UT"
    }, {
        State: "Vermont",
        Abbreviation: "VT"
    }, {
        State: "Virginia",
        Abbreviation: "VA"
    }, {
        State: "Washington",
        Abbreviation: "WA"
    }, {
        State: "West Virginia",
        Abbreviation: "WV"
    }, {
        State: "Wisconsin",
        Abbreviation: "WI"
    }, {
        State: "Wyoming",
        Abbreviation: "WY"
    }];

    var flag = false;
    let state = '';
    for (var i = 0; i < store.length; i++) {
        if (store[i]['Abbreviation'] == state_cd) {
            flag = true;
            state = store[i]['State'];
        }
    }
    if (flag) {
        return state;
    } else {
        return '';
    }
});


//helper to get distinct drug combination
Template.registerHelper('getDistinctDrugCombos', () => {
    let drugsArray = DistinctMedicationCombinations.reactive();
    let medsCombo = [];
    for (let i = 0; i < drugsArray.length; i++) {
        medsCombo.push({
            medication: drugsArray[i].MEDICATION
        });
    }
    return medsCombo;
});

// function to check which health risk is marked as Yes/true.
function isAnyInputYes(patient) {
    var flag;
    if (patient[0].HIV === "Yes" || patient[0].Pregnancy === "Yes" || patient[0].RenalFailure === "Yes" || patient[0].Alcohol === "Yes" || patient[0].MentalHealth === "Yes") {
        flag = true;
    } else {
        flag = false;
    }
    return flag;
}

// function to check the health risk conditiins of a patient.
function whichInputIsYes(patient) {
    var inputs = [];
    var HIV;
    var Pregnancy;
    var RenalFailure;
    var Alcohol;
    var MentalHealth;
    // if (patient[0].HIV === "Yes") {
    //     HIV = "Yes"
    // }
    // if (patient[0].Pregnancy === "Yes") {
    //     Pregnancy = "Yes"
    // }
    // if (patient[0].RenalFailure === "Yes") {
    //     RenalFailure = "Yes"
    // }
    // if (patient[0].Alcohol === "Yes") {
    //     Alcohol = "Yes"
    // }
    // if (patient[0].MentalHealth === "Yes") {
    //     MentalHealth = "Yes"
    // }

    if (patient[0].HIV === "Yes") {
        HIV = "Yes"
    }
    if (patient[0].PREGNANCY === "Yes") {
        Pregnancy = "Yes"
    }
    if (patient[0].RENAL_FAILURE === "Yes") {
        RenalFailure = "Yes"
    }
    if (patient[0].ALCOHOL === "Yes") {
        Alcohol = "Yes"
    }
    if (patient[0].MENTAL_HEALTH === "Yes") {
        MentalHealth = "Yes"
    }

    inputs.push({
        HIV: HIV,
        Pregnancy: Pregnancy,
        RenalFailure: Pregnancy,
        Alcohol: Alcohol,
        MentalHealth: MentalHealth
    });
    return inputs;
}

let getFullYear = (pDate) => {
    let datePart = pDate ? pDate.split('/') : [];
    if (datePart.length > 2) {
        return datePart[2];
    } else {
        return pDate;
    }
}