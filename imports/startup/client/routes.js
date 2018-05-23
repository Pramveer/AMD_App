import {
    Router
} from 'meteor/iron:router';
import {
    Meteor
} from 'meteor/meteor';
import {
    Session
} from 'meteor/session';

import '../../client/pages/dashboard';

Router.configure({
    layoutTemplate: 'dashboardLayout'
});

Router.configure({
    // we use the  appBody template to define the layout for the entire app
    layoutTemplate: 'main',
    loadingTemplate: 'Loading'
});


//dummy PatientData
let dummyPatientdata = [{
    "PatientID": "",
    "PatientName": "",
    "Address": "",
    "State": "",
    "Age": 0,
    "AdmissionDate": "",
    "DischargeDate": "",
    "ZipCode": "",
    "AreaCode": "",
    "Birthday": "",
    "Gender": "",
    "Languge": "",
    "Race": "",
    "FIRST_ENCOUNTER": "",
    "Ethnicity": "",
    "Insurance": "",
    "Genotype": "",
    "Viral Load": "",
    "ETOH": "",
    "Treatment": " ",
    "Relapsed": "",
    "CLAIMS_INSURANCEPLAN": "",
    "Partial Response": "",
    "Non Responsive": "",
    "Tolerant": "",
    "PartialTolerant": "",
    "HCC": "",
    "Urine Screen": "",
    "Cirrhosis": "",
    "Meld Score": "",
    "Assessment Liver Disaese": "",
    "Fibrosur": "",
    "Fibroscan": "",
    "Liver Biopsy": "",
    "CMP": "",
    "CBC": "",
    "Pregnancy": "",
    "Renal Failure": "",
    "Mental Health": "",
    "HIV": "",
    "Alcohol": "",
    "Body Weight": "",
    "Drug": "",
    "Efficacy": "",
    "Adherance": "",
    "Utilization": "",
    "Cost": "",
    "Total Value": "",
    "Category_id": 1,
    "Compensated": "",
    "Decompensated": ""
}];

Router.PatientId = '';
//Default page to open


// Make Dashboard Tab as Default tab.

Router.route('/#', {
    layoutTemplate: 'dashboardLayout',
    template: 'Dashboard',
    onBeforeAction: function() {
        // Need to update code if requires for dashboard page
        if (isPrimaryCarePhysician()) {
            Router.go('/AssessmentTool');
            highLightTab('Patient Treatment');
            this.next();
        } else
        if (isModelPayerChanged()) {
            isModelChanged();
        } else {
            highLightTab('Dashboard');
            this.layout('dashboardLayout');

            // you need this because otherwise the router
            // will not render your templates
            // this.render();
            this.next();
        }

    },
    data: function() {
            highLightTab('Dashboard');

            if (Router['PatientId'] != '') {
                return {
                    Patientdata: selectedData(Router['PatientId'])
                };
            } else {
                return {
                    Patientdata: dummyPatientdata
                };
            }
        }
        //Router.go('/dashboard');
});


// Make Patient Tab as Default tab.

// Router.route('/#', {
//     template: 'Patient',
//     onBeforeAction: function() {
//         if (isModelPayerChanged()) {
//             isModelChanged();
//         } else {
//             highLightTab('Patient');
//             this.next();
//         }
//     },
//     data: function() {
//         highLightTab('Patient');
//         if (Router['PatientId'] != '') {
//             return {
//                 Patientdata: selectedData(Router['PatientId'])
//             }
//         } else {
//             return {
//                 Patientdata: dummyPatientdata
//             };
//         }
//     }
//         //Router.go('/dashboard');
// });

Router.route('/Patient', {
    // layoutTemplate: 'dashboardLayout',
    template: 'Patient',
    onBeforeAction: function(pause) {
        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 01-Mar-2017
         * @desc: 
         */
        // if (isPrimaryCarePhysician()) {
        //     Router.go('/AssessmentTool');
        //     highLightTab('Patient Treatment');
        // } else
        // if (isModelPayerChanged()) {
        //     isModelChanged();
        // } else {
        //     highLightTab('Patient');

        //     showMedsFilterInSearch(true);
        //     this.next();
        // }

        if (isCustomRole('Patient')) {
            if (isModelPayerChanged()) {
                isModelChanged();
            } else {
                highLightTab('Patient');

                showMedsFilterInSearch(true);
                this.next();
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
    },
    data: function() {

            highLightTab('Patient');

            if (Router['PatientId'] != '') {
                return {
                    Patientdata: selectedData(Router['PatientId'])
                };
            } else {
                return {
                    Patientdata: dummyPatientdata
                };
            }
        }
        //Router.go('/dashboard');
});

Router.route('newPatient', {
    template: 'Patient',
    onBeforeAction: function() {
        if (isModelPayerChanged()) {
            isModelChanged();
            showMedsFilterInSearch(true);
        } else {
            highLightTab('Patient');
            this.next();
        }
    },
    data: function() {

        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});


// Make Dashboard Tab as Default tab.

Router.route('/', {
    layoutTemplate: 'dashboardLayout',
    template: 'Dashboard',
    onBeforeAction: function() {

        //console.log(isPrimaryCarePhysician());
        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 01-March-2017
         * @desc: Added condition for PrimaryCarePhysician role, as he has not right to view dashboard page
         */
        if (isPrimaryCarePhysician()) {
            this.layout('main');
            Router.go('/AssessmentTool');
            highLightTab('Primary Care');
        } else if (isModelPayerChanged()) {
            isModelChanged();
        } else {
            highLightTab('Dashboard');
            this.next();
        }
    },
    data: function() {
        highLightTab('Dashboard');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            }
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }

    //Router.go('/dashboard');
});


// Make Patient Tab as Default tab.
// Router.route('/', {
//     template: 'Patient',
//     onBeforeAction: function() {
//         if (isModelPayerChanged()) {
//             isModelChanged();
//         } else {
//             highLightTab('Patient');
//             this.next();
//         }
//     },
//     data: function() {
//         highLightTab('Patient');
//         if (Router['PatientId'] != '') {
//             return {
//                 Patientdata: selectedData(Router['PatientId'])
//             }
//         } else {
//             return {
//                 Patientdata: dummyPatientdata
//             };
//         }
//     }

//     //Router.go('/dashboard');
// });




Router.route('/dashboard', {
    layoutTemplate: 'dashboardLayout',
    template: 'Dashboard',
    onBeforeAction: function() {
        if (isModelPayerChanged()) {
            isModelChanged();
        } else {
            highLightTab('Dashboard');
            this.next();
        }
    },
    data: function() {
        highLightTab('Dashboard');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            }
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});


var forceLogin = function() {
/*if (!Meteor.userId()) {
        // If user is not logged in render login template
        Router.go('/login');
    } else {
        //if user is logged in render requested template
        this.next();
    }*/
    this.next();

}




//Restricted by by user authentication
Router.onBeforeAction(forceLogin, {
    except: ['login']
});

Router.route('ClinicalTrialsAPI');
Router.route('EvidenceAPI');
Router.route('Pharmacological');
Router.route('Provider', {
    onBeforeAction: function(pause) {

        var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);

        // console.log("****************************Current Patinets id ********* : " + selectedData(Router['PatientId']));
        // console.log("*********Flag Returned is  "  + flag);

        if (!flag) {
            if (isModelPayerChanged()) {
                isModelChanged();
                highLightTab('Payer');
                Router.go('/Payer');
            } else {
                highLightTab('Patient');
                Router.go('/Patient');
            }
        } else {
            if (isModelPayerChanged()) {
                isModelChanged();
            } else {
                getSubpopulationData();
                showMedsFilterInSearch(true);
                this.next();
            }

        }
        return true;
    },
    data: function() {
        highLightTab('Provider');


        return {
            Patientdata: selectedData(Router['PatientId'])
        };

    }
}); // Drug Page
//pre authorization router for provider
Router.route('Provider/PreAuthorization', {
    template: 'Prioritization',
    onBeforeAction: function(pause) {

        var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);

        // console.log("****************************Current Patinets id ********* : " + selectedData(Router['PatientId']));
        // console.log("*********Flag Returned is  "  + flag);

        if (!flag) {
            if (isModelPayerChanged()) {
                isModelChanged();
                highLightTab('Payer');
                Router.go('/Payer');
            } else {
                highLightTab('Patient');
                Router.go('/Patient');
            }
        } else {
            if (isModelPayerChanged()) {
                isModelChanged();
            } else {
                getSubpopulationData();
                showMedsFilterInSearch(true);
                this.next();
            }

        }
        return true;
    },
    data: function() {
        highLightTab('Provider');


        return {
            Patientdata: selectedData(Router['PatientId'])
        };

    }
});

/* pharma tab router ends */
Router.route('Provider/PreAuthorization/:_id', {
    template: "Prioritization",
    path: '/Provider/PreAuthorization/:_id',
    onBeforeAction: function() {
        if (isModelPayerChanged()) {
            isModelChanged();
        } else {
            highLightTab('Provider');
            this.next();

        }
        showMedsFilterInSearch(true);
    },
    data: function() {
        highLightTab('Provider');
        console.log(this.params._id)
        if (this.params._id) {
            return {
                PAPatientdata: this.params._id
            }
        } else {
            return {
                PAPatientdata: null
            }
        }
    }
});

//pre authorization router for provider
Router.route('Provider/PreAuthArchive', {
    template: 'PreAuthArchive',
    onBeforeAction: function(pause) {
        /*
                var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);

                // console.log("****************************Current Patinets id ********* : " + selectedData(Router['PatientId']));
                // console.log("*********Flag Returned is  "  + flag);

                if (!flag) {
                    if (isModelPayerChanged()) {
                        isModelChanged();
                        highLightTab('Payer');
                        Router.go('/Payer');
                    } else {
                        highLightTab('Patient');
                        Router.go('/Patient');
                    }
                } else {
                    if (isModelPayerChanged()) {
                        isModelChanged();
                    } else {
                        getSubpopulationData();
                        showMedsFilterInSearch(true);
                        this.next();
                    }

                }*/
        highLightTab('Provider');
        this.next();
        return true;
    },
    data: function() {
        highLightTab('Provider');


        return {
            Patientdata: selectedData(Router['PatientId'])
        };

    }
});


//P & T model router for provider
Router.route('Provider/PTmodel', {
    template: 'PTmodel',
    onBeforeAction: function(pause) {

        var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);

        // console.log("****************************Current Patinets id ********* : " + selectedData(Router['PatientId']));
        // console.log("*********Flag Returned is  "  + flag);

        if (!flag) {
            if (isModelPayerChanged()) {
                isModelChanged();
                highLightTab('Payer');
                Router.go('/Payer');
            } else {
                highLightTab('Patient');
                Router.go('/Patient');
            }
        } else {
            if (isModelPayerChanged()) {
                isModelChanged();
            } else {
                getSubpopulationData();
                showMedsFilterInSearch(true);
                this.next();
            }

        }
        // highLightTab('Provider');
        // this.next();
        return true;
    },
    data: function() {
        highLightTab('Provider');


        return {
            Patientdata: selectedData(Router['PatientId'])
        };

    }
});

//pre authorization router for provider
Router.route('AssessmentTool', {
    template: 'screeningEvaulationTool',
    onBeforeAction: function(pause) {
        // Modified by Yuvraj May, 2nd 2017;

        // if (isPrimaryCarePhysician()) {
        //     Router.go('/AssessmentTool');
        //     highLightTab('Patient Treatment');
        //     this.next();
        //     return true;
        // }

        if (isCustomRole('AssessmentTool')) {
            Router.go('/AssessmentTool');
            highLightTab('Patient Treatment');
            this.next();
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;

        /* else 
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    highLightTab('Dashboard');
                    this.layout('dashboardLayout');  
                    this.next();
                }*/
        // highLightTab('Primary Care');
        // this.next();
        // return true;
    },
    data: function() {
        highLightTab('Primary Care');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };

    }
});

//PCPDashboard router  
Router.route('PCPDashboard', {
    template: 'PCPDashboard',
    onBeforeAction: function(pause) {
        // highLightTab('Primary Care');
        this.next();
        return true;
    },
    data: function() {
        return {
            Patientdata: selectedData(Router['PatientId'])
        };

    }
});

//PCPDashboard router  
Router.route('PCPSummary', {
    template: 'PCPSummary',
    onBeforeAction: function(pause) {
        // highLightTab('Primary Care');
        this.next();
        return true;
    },
    data: function() {
        return {
            Patientdata: selectedData(Router['PatientId'])
        };

    }
});


// Router.route('Provider', {
//     onBeforeAction: function(pause) {

//         var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);

//         // console.log("****************************Current Patinets id ********* : " + selectedData(Router['PatientId']));
//         // console.log("*********Flag Returned is  "  + flag);

//         if (!flag) {
//             if (isModelPayerChanged()) {
//                 isModelChanged();
//                 highLightTab('Payer');
//                 Router.go('/Payer');
//             } else {
//                 highLightTab('Patient');
//                 Router.go('/Patient');
//             }
//         } else {
//             if (isModelPayerChanged()) {
//                 isModelChanged();
//             } else {
//                 getSubpopulationData();
//                 this.next();
//             }

//         }
//         return true;
//     },
//     data: function() {
//         highLightTab('Provider');


//         return {
//             Patientdata: selectedData(Router['PatientId'])
//         };

//     }
// }); // Drug Page

// Payer Tab
Router.route('Payer', {
    template: 'Payer',
    onBeforeAction: function(pause) {
        if (isCustomRole('Payer')) {

            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                highLightTab('Patient');
                Router.go('/Patient');
            } else {
                getSubpopulationData();
                showMedsFilterInSearch(true);
                this.next();
            }

        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Payer');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

// Payer Tab
// Router.route('Pharma', {
//     template: 'Pharma',
/*  onBeforeAction: function(pause) {
      var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
      if (!flag) {
          if (isModelPayerChanged()) {
              isModelChanged();
              highLightTab('Pharma');
              Router.go('/Pharma');
          } else {
              highLightTab('Patient');
              Router.go('/Patient');
          }
      } else {
          if (isModelPayerChanged()) {
              isModelChanged();
          } else {
              getSubpopulationData();
              this.next();
          }
      }
      return true;
  },*/
//     data: function() {
//         highLightTab('Pharma');
//         return {
//             Patientdata: selectedData(Router['PatientId'])
//         };
//     }
// });
/* Pharma tabs router */
Router.route('Pharma/Summary', {
    template: 'Summary',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/Summary');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/Summary');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();

                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }


        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

Router.route('Pharma/CompetitorAnalysis', {
    template: 'CompetitorAnalysis',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/CompetitorAnalysis');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/CompetitorAnalysis');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

Router.route('Pharma/CompetitorCompare', {
    template: 'CompetitorCompare',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/CompetitorCompare');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/CompetitorCompare');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

// Prioritization
Router.route('Provider/Prioritization', {
    template: 'Prioritization',
    onBeforeAction: function(pause) {
        var flag = true;

        // Modified By Yuvraj (May 2nd, 2017) 
        // showMedsFilterInSearch(true);
        // this.next();
        // highLightTab('Provider');
        // return true;

        if (isCustomRole('Provider')) {
            showMedsFilterInSearch(true);
            highLightTab('Provider');
            this.next();
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Provider');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});


Router.route('Pharma/RWEBenchmark', {
    template: 'RWEBenchmark',
    onBeforeAction: function(pause) {
        var flag = true;
        /*  if (!flag) {
            if (isModelPayerChanged()) {
                isModelChanged();
                highLightTab('Pharma');
                Router.go('/Pharma/RWEBenchmark');
            } else {
                highLightTab('Pharma');
                Router.go('/Pharma/RWEBenchmark');
            }
            showMedsFilterInSearch(true);
        } else {
            if (isModelPayerChanged()) {
                isModelChanged();
            } else {
                this.next();
            }
            highLightTab('Pharma');
    }*/

        // showMedsFilterInSearch(true);
        // this.next();
        // highLightTab('Pharma');

        // Yuvraj May, 2nd 2017 - Uncommented above code. (No idea why this was commneted.)
        // Added Check if permission is granted to access the pharma tab.
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/RWEBenchmark');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/RWEBenchmark');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }

        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

Router.route('Pharma/PhysicianPatientTarget', {
    template: 'PhysicianPatientTarget',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/PhysicianPatientTarget');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/PhysicianPatientTarget');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

// Nisha route to MarketOverview under pharma
Router.route('Pharma/MarketOverview', {
    template: 'MarketOverview',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/MarketOverview');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/MarketOverview');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

Router.route('Pharma/TreatmentEfficacy', {
    template: 'PatientsJourney',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/TreatmentEfficacy');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/TreatmentEfficacy');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

Router.route('Pharma/ComorbidityAnalytics', {
    template: 'ComorbidityAnalytics',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/ComorbidityAnalytics');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/ComorbidityAnalytics');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});
Router.route('Pharma/TherapyCooccurance', {
    template: 'DrugOccurance',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/TherapyCooccurance');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/TherapyCooccurance');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
            showMedsFilterInSearch(true);
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});

Router.route('Pharma/MedicationCost', {
    template: 'MedicationCost',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/MedicationCost');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/MedicationCost');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
            showMedsFilterInSearch(true);
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});
Router.route('Pharma/AdvanceAnalytics', {
    template: 'AdvanceAnalytics',
    onBeforeAction: function(pause) {
        var flag = true;
        if (isCustomRole('Pharma')) {
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/AdvanceAnalytics');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/AdvanceAnalytics');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
            showMedsFilterInSearch(true);
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
});
/* pharma tab router ends */
Router.route('Patient/:_id', {
    template: "Patient",
    path: '/Patient/:_id',
    onBeforeAction: function() {
        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 01-Mar-2017
         * @desc: 
         * 
         * Modified By Yuvraj (May 2nd, 17) - Added check for custom role.
         */
        // if (isPrimaryCarePhysician()) {
        //     Router.go('/AssessmentTool');
        // } else if (isModelPayerChanged()) {
        //     isModelChanged();
        // } else {
        //     highLightTab('Patient');
        //     this.next();

        // }
        // showMedsFilterInSearch(true);

        if (isCustomRole('Patient')) {
            if (isModelPayerChanged()) {
                isModelChanged();
            } else {
                highLightTab('Patient');
                this.next();
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Patient');
        console.log(this.params._id)
        if (this.params._id) {
            return {
                Patientdata: selectedData(this.params._id)
            }
        } else {
            return {
                Patientdata: dummyPatientdata
            }
        }
    }
}); // Route for health record page
Router.route('login'); // Route for login module page
Router.route('PARequest'); // Route for new prior authorization request page
// Router.route('Efficacy', {
//     onBeforeAction: function(pause) {
//         var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
//         if (!flag) {
//             highLightTab('Patient');
//             Router.go('/Patient');
//         } else {
//             this.next();
//         }
//         return true;
//     },
//     data: function() {
//         highLightTab('Efficacy');
//         //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
//         return {
//             Patientdata: selectedData(Router['PatientId'])
//         };
//     }
// }); // Route for Efficacy page


Router.route('Analytics/Efficacy', {
    template: 'Efficacy',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Efficacy page



Router.route('Analytics/Adherence', {
    template: 'Adherence',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Adherence page


Router.route('Safety', {
    onBeforeAction: function(pause) {
        /*  var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
          if (!flag) {
              highLightTab('Patient');
              Router.go('/Patient');
          } else {
              this.next();
          }
          return true;*/
        var flag = true;
        this.next();
        highLightTab('Safety');
        return true;
    },
    data: function() {
        highLightTab('Safety');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Safety page

// Router.route('Adherence', {
//     onBeforeAction: function(pause) {
//         var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
//         if (!flag) {
//             highLightTab('Patient');
//             Router.go('/Patient');
//         } else {
//             this.next();
//         }
//         return true;
//     },
//     data: function() {
//         highLightTab('Adherence');
//         //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
//         return {
//             Patientdata: selectedData(Router['PatientId'])
//         };
//     }
// }); // Route for Adherence page

Router.route('Analytics', {
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); //Route for Analytics page
// Router.route('Utilization', {
//     onBeforeAction: function(pause) {
//         var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
//         if (!flag) {
//             highLightTab('Patient');
//             Router.go('/Patient');
//         } else {
//             this.next();
//         }
//         return true;
//     },
//     data: function() {
//         highLightTab('Utilization');
//         //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
//         return {
//             Patientdata: selectedData(Router['PatientId'])
//         };
//     }
// }); // Route for Utilization page

Router.route('Analytics/Utilization', {
    template: 'Utilization',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Utilization page


Router.route('Analytics/QualityIndicator', {
    template: 'QualityIndicator',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for QualityIndicator page


Router.route('Analytics/MachineLearning', {
    template: 'DiseaseProgression',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for MachineLearning page


Router.route('Analytics/Charts', {
    template: 'AnlyticsNewCharts',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for MachineLearning page


// ******************************************* Machine Learning Subtabs Start *********************************************************

Router.route('Analytics/MachineLearning/DiseasePrediction', {
    template: 'DiseaseProgression',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Disease Progression page


Router.route('Analytics/MachineLearning/RetreatmentDistribution', {
    template: 'RetreatmentDistribution',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Retreatment Distribution page


Router.route('Analytics/MachineLearning/SurvivalRate', {
    template: 'SurvivalRate',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for SurvivalRate page


Router.route('Analytics/MachineLearning/TreatmentPriority', {
    template: 'TreatmentPriority',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for TreatmentPriority page


Router.route('Analytics/MachineLearning/CostBurden', {
    template: 'CostBurden',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for CostBurden page


Router.route('Analytics/MachineLearning/RiskDistribution', {
    template: 'RiskDistribution',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for RiskDistribution page


Router.route('Analytics/MachineLearning/ProgressionModel', {
    template: 'ProgressionModel',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for ProgressionModel page


Router.route('Analytics/MachineLearning/SvrTrend', {
    template: 'svrtrendml',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for svrtrendml page



Router.route('Analytics/MachineLearning/Comorbidity', {
    template: 'comorbidityanalyticsml',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Comorbidity Analytics page


Router.route('Analytics/MachineLearning/Coinfections', {
    template: 'CoinfectionsTab',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Coinfections page


Router.route('Analytics/MachineLearning/PatientsJourney', {
    template: 'AnalyticsPatientsJourney',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Patient Journey page

// ******************************************* Machine Learning Subtabs End *********************************************************



/**
 * @author: Pramveer
 * @date: 1st May 17
 * @desc: Added route for the analytics waste opportunity section
 */

Router.route('Analytics/WasteOpportunity', {
    template: 'AnalyticsWasteOpportunity',
    onBeforeAction: function(pause) {
        if (isCustomRole('Analytics')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Payer');
                    Router.go('/Payer');
                } else {
                    highLightTab('Analytics');
                    Router.go('/Patient');
                }
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    getSubpopulationData();
                    this.next();
                }
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role

            this.render('AccessDenied');
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Analytics');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Analytics Waste Section




Router.route('Cost', {
    onBeforeAction: function(pause) {
        var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
        if (!flag) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        return true;
    },
    data: function() {
        highLightTab('Cost');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Cost page


Router.route('Geo', {
    onBeforeAction: function(pause) {
        var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
        if (!flag) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        return true;
    },
    data: function() {
        highLightTab('Geo');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for Geo page

Router.route('SafetySovaldi'); // Route for Safety page

//Router.route('GenerateCompareDrug');
// PA Request Page Submenu

Router.route('PARequests', {
    data: function() {
        highLightTab('Provider');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Route for PR Request module

Router.route('PADashboard', {
    onBeforeAction: function(pause) {
        var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
        if (!flag) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            highLightTab('Provider');
            this.next();
        }
        return true;

    },
    data: function() {
        highLightTab('Provider');
        //checkHealthRecordMandateryFieldEmpty(selectedData(Router['PatientId']));
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); // Prior authorization request

Router.route('CMMDashboard'); // Route for view all prior authorization request

// Drug Page links
//Router.route('CompareDrug'); // Rout for Comapre Drug , Directed from Drug page Compare button
Router.route('CompareDrug', {
    onBeforeAction: function(pause) {
        // Modified By Yuvraj (May 2nd, 17) - Added check for custom role.
        if (isCustomRole('Provider')) {
            var flag = checkHealthRecordMandateryGynoColTeatmentIsEmpty(selectedData(Router['PatientId']), this);
            if (!flag) {
                highLightTab('Patient');
                Router.go('/Patient');
            } else {
                this.next();
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Provider');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); //  Route for Comapre Drug

Router.route('CompareDrugRWE', {
    onBeforeAction: function(pause) {
        // Modified By Yuvraj (May 2nd, 17) - Added check for custom role.
        if (isCustomRole('Pharma')) {
            var flag = true;
            if (!flag) {
                if (isModelPayerChanged()) {
                    isModelChanged();
                    highLightTab('Pharma');
                    Router.go('/Pharma/RWEBenchmark');
                } else {
                    highLightTab('Pharma');
                    Router.go('/Pharma/RWEBenchmark');
                }
                showMedsFilterInSearch(true);
            } else {
                if (isModelPayerChanged()) {
                    isModelChanged();
                } else {
                    this.next();
                }
                highLightTab('Pharma');
            }
        } else {
            //Restrict Route for Other user than Admin or Payer Role
            this.render('AccessDenied');
        }
        return true;
    },
    data: function() {
        highLightTab('Pharma');
        return {
            Patientdata: selectedData(Router['PatientId'])
        };
    }
}); //  Route for Comapre Drug


// Health Record page sub menu
//Router.route('HP'); // Route for H&P page
Router.route('HP', {
    template: 'HP',
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
        showMedsFilterInSearch(true);
    }
});
Router.route('Labs'); // Route for Labs page
// Router.route('Labs', {
//     template: 'Labs',
//     data: function() {
//         highLightTab('Patient');
//         if (Router['PatientId'] != '') {
//             return {
//                 Patientdata: selectedData(Router['PatientId'])
//             };
//         } else {
//             return {
//                 Patientdata: dummyPatientdata
//             };
//         }
//     }
// });
Router.route('DiagnosisOrEvaluation'); // Route for DiagnosisOrEvaluation page
//Router.route('HCC'); // Route for HCC page
Router.route('HCC', {
    template: 'HCC',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
//Router.route('UrineScreen') // Route for Urine Screen
Router.route('UrineScreen', {
    template: 'UrineScreen',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
//Router.route('Fibrosure') // Route for Fibrosure page
Router.route('Fibrosure', {
    template: 'Fibrosure',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
//Router.route('LiverBiopsy') // Route for liver Biopsy
Router.route('LiverBiopsy', {
    template: 'LiverBiopsy',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
//Router.route('Fibroscan') // Route for Fibroscan
Router.route('Fibroscan', {
    template: 'Fibroscan',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
Router.route('MedicationHistory', {
    template: 'MedicationHistory',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});

Router.route('HerbalHistory', {
    template: 'HerbalHistory',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});

Router.route('SocialHistory', {
    template: 'SocialHistory',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
Router.route('Imaging', {
    template: 'Imaging',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
Router.route('PastHCVTreatment', {
    template: 'PastHCVTreatment',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
//Router.route('CMP') // Route for CMP
Router.route('CMP', {
    template: 'CMP',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
//Router.route('CBC') // Route for CBC
Router.route('CBC', {
    template: 'CBC',
    onBeforeAction: function(pause) {
        if (!Router['PatientId']) {
            highLightTab('Patient');
            Router.go('/Patient');
        } else {
            this.next();
        }
        showMedsFilterInSearch(true);
        return true;
    },
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
    }
});
//Router.route('ProgressNotes'); // Route for ProgressNotes
Router.route('ProgressNotes', {
    template: 'ProgressNotes',
    data: function() {
        highLightTab('Patient');
        if (Router['PatientId'] != '') {
            return {
                Patientdata: selectedData(Router['PatientId'])
            };
        } else {
            return {
                Patientdata: dummyPatientdata
            };
        }
        showMedsFilterInSearch(true);
    }
});

// Test page link
Router.route('Test'); // Testing page
Router.route('AccessDenied');
Router.route('Welcome'); // Route for welcome page
Router.route('AdminDashboard', {
    onBeforeAction: function(pause) {

        if (!isAdmin()) {
            console.log("Access Denied:");

            this.render('AccessDenied');
        } else {
            this.next();
        }
        return true;
    },
    data: function() {
        return {
            Users: AllUsers.reactive()
        }
    }
});
Router.route('SearchPatient', {
    waitOn: function() {
        return PatientDataList.reactive();
    },
    data: function() {
        highLightTab('Patient');
        return {
            Patientdata: dummyPatientdata
        };
    }
}); // Route for Main seach
Router.route('AdvancedSearch', {
    data: function() {
        highLightTab('Patient');
        return {
            Patientdata: dummyPatientdata
        };
    }
});


// highLightTab = function(name) {
//     var nav = document.getElementsByClassName('NavigateUrlByTabDesk');
//     console.log("**Active highLightTab**");
//     console.log(nav);
//     for (var i = 0; i < nav.length; i++) {
//         if (nav[i].innerHTML.trim().toLowerCase() == name.toLowerCase()) {
//             nav[i].parentNode.className = 'active';
//         } else {
//             nav[i].parentNode.className = '';
//         }
//     }
// }

selectedData = (id) => {
    // var patient = PatientDataList.reactive().filter(function(Patient) {
    //     return Patient.PATIENT_ID_SYNTH == id;
    // });
    let patient = null;
    if (AmdApp['SelectedPatient'] != null)
        patient = AmdApp['SelectedPatient'].filter(function(Patient) {
            return Patient.PATIENT_ID_SYNTH == id;
        });
    // var patient = AmdApp['SelectedPatient'];
    return patient;
    //PatientDataList.reactive();
}

checkHealthRecordMandateryFieldEmpty = function(record, flag, self) {
    if (!localStorage.getItem('mandatoryFieldReq')) {
        if (record.length == 0 || record[0].Genotype == null ||
            record[0].ViralLoad == null || record[0].ETOH == null ||
            record[0].Treatment == null || record[0].UrineScreen == null ||
            record[0].Cirrhosis == null || record[0].AssessmentLiverDisaese == null) {
            if (document.getElementById("overlayForNotificationPopup") == null) {
                $("body").append('<div class="mandatoryFieldReqoverlay" id="overlayForNotification" style="display:none;"></div>');
                var fields = '';
                if (record.length != 0) {
                    if (record[0].ViralLoad == null) {
                        fields = fields + 'Missing ViralLoad </br />';
                    }
                    if (record[0].ETOH == null) {
                        fields = fields + 'Missing ETOH </br />';
                    }
                    if (record[0].UrineScreen == null) {
                        fields = fields + 'Missing UrineScreen </br />';
                    }
                    if (record[0].AssessmentLiverDisaese == null) {
                        fields = fields + 'Missing AssessmentLiverDisaese </br />';
                    }
                } else {
                    fields = 'Missing ViralLoad </br />Missing ETOH </br />Missing UrineScreen </br />Missing AssessmentLiverDisaese </br />';
                }
                var div = '<div id="overlayForNotificationPopup" class="mandatoryFieldReq">' +
                    '<div class="poab_title">Warning !!!</div>' +
                    '<div class="poab_dec">' +
                    '<h1> Results may be inaccurate.</h1><br /><div style="color:red;" id="overlayForNotificationPopupFields" >' + fields + '</div>' +
                    '</br /><div><button style="color: #fff;" id="mandatoryFieldReq-btnCaptureResponseCon">Continue anyway</button>&nbsp;&nbsp;&nbsp;' +
                    '<button style="color: #fff;" id="mandatoryFieldReq-btnCaptureResponseCan" onClick="hideNotificationPopupCancle();">Cancel</button></div>' +
                    '<br /></div></div>';
                $("body").append(div);
                $('#mandatoryFieldReq-btnCaptureResponseCon').click(function() {
                    localStorage.setItem('mandatoryFieldReq', 'true');
                    document.getElementById("overlayForNotificationPopup").style.visibility = "hidden";
                    document.getElementById("overlayForNotification").style.display = "none";
                    self.next();
                });
            } else {
                var fields = '';
                if (record.length != 0) {
                    if (record[0].ViralLoad == null) {
                        fields = fields + 'Missing ViralLoad </br />';
                    }
                    if (record[0].ETOH == null) {
                        fields = fields + 'Missing ETOH </br />';
                    }
                    if (record[0].UrineScreen == null) {
                        fields = fields + 'Missing UrineScreen </br />';
                    }
                    if (record[0].AssessmentLiverDisaese == null) {
                        fields = fields + 'Missing AssessmentLiverDisaese </br />';
                    }
                } else {
                    fields = 'Missing ViralLoad </br />Missing ETOH </br />Missing UrineScreen </br />Missing AssessmentLiverDisaese </br />';
                }
                document.getElementById("overlayForNotificationPopupFields").innerHTML = fields;
            }
            document.getElementById("overlayForNotificationPopup").style.visibility = "visible";
            document.getElementById("overlayForNotification").style.display = "block";
        } else {
            self.next();
        }
    }
}


checkHealthRecordMandateryGynoColTeatmentIsEmpty = function(record, self) {
    var fields = 'the fields';
    var isValid = true;
    // by passing the condition to allow the user to navigate on other tabs
    if (record == null || record.length == 0) {
        isValid = false;
        return isValid;
    } else {
        console.log("Record length" + record.length);
    }
    if (record[0] == undefined) {
        fields = 'Genotype, Treatment, Cirrhosis , Viral Load, ... ';
        highLightTab("Patient");
        isValid = false;
    } else if (record.length != 0) {
        // //check for header contents
        // if (record[0].ZipCode == null || record[0].ZipCode == '') {
        //     fields = fields + 'ZipCode#';
        //     isValid = false;
        // }
        // if (record[0].Race == null || record[0].Race == 'default') {
        //     fields = fields + 'Race#';
        //     isValid = false;
        // }
        // if (record[0].Insurance == null || record[0].Insurance == '') {
        //     fields = fields + 'Insurance#';
        //     isValid = false;
        // }
        // if (record[0].Gender == null || record[0].Gender == '') {
        //     fields = fields + 'Gender#';
        //     isValid = false;
        // }
        // if (record[0].State == null || record[0].State == 'default') {
        //     fields = fields + 'State#';
        //     isValid = false;
        // }
        // if (record[0].Birthday == null || record[0].Birthday == '') {
        //     fields = fields + 'DOB#';
        //     isValid = false;
        // }
        // //check for health record content
        // if (record[0].Genotype == null || record[0].Genotype == 'default') {
        //     fields = fields + 'Genotype#';
        //     isValid = false;
        // }
        // if (record[0].Treatment == null || record[0].Treatment == '') {
        //     fields = fields + 'Treatment#';
        //     isValid = false;
        // }
        // if (record[0].Cirrhosis == null || record[0].Cirrhosis == '') {
        //     fields = fields + 'Cirrhosis#';
        //     isValid = false;
        // }
        // if (record[0].ViralLoad == null || record[0].ViralLoad == '') {
        //     fields = fields + 'Viral Load#';
        //     isValid = false;
        // }
        // // if(record[0].ETOH == null || record[0].ETOH == ''){
        // //     fields = fields + 'ETOH Level#';
        // //     isValid = false;
        // // }
        // if (record[0].Gender == null || record[0].Gender == '') {
        //     fields = fields + 'Gender#';
        //     isValid = false;
        // }
        // if (record[0].Ethnicity == null || record[0].Ethnicity == '') {
        //     fields = fields + 'Ethnicity#';
        //     isValid = false;
        // }
        // if (record[0].BodyWeight == null || record[0].BodyWeight == '' || record[0].BodyWeight == 0) {
        //     fields = fields + 'Body Weight#';
        //     isValid = false;
        // }
        // if (record[0].Pregnancy == null || record[0].Pregnancy == '') {
        //     fields = fields + 'Pregnancy#';
        //     isValid = false;
        // }
        // if (record[0].RenalFailure == null || record[0].RenalFailure == '') {
        //     fields = fields + 'Renal Failure#';
        //     isValid = false;
        // }
        // if (record[0].MentalHealth == null || record[0].MentalHealth == '') {
        //     fields = fields + 'Mental Health#';
        //     isValid = false;
        // }
        // if (record[0].HIV == null || record[0].HIV == '') {
        //     fields = fields + 'HIV#';
        //     isValid = false;
        // }
        // if (record[0].Alcohol == null || record[0].Alcohol == '') {
        //     fields = fields + 'Alcohol#';
        //     isValid = false;
        // }
        // if (record[0].AssessmentLiverDisaese == null || record[0].AssessmentLiverDisaese == '') {
        //     fields = fields + 'Assessment Liver Disaese#';
        //     isValid = false;
        // }
        // fields = fields.replace(/\#/g, ', ');
        // fields = fields.substring(0, 80);
        // if (fields.length > 75) {
        //     fields = fields + '...';
        // } else {
        //     fields = fields.substring(0, fields.length - 2);
        // }

        isValid = true;

    }


    return isValid;

    //  isValid = true;  remove this validation

    // if (isValid) {
    //     return true;
    // } else {
    //     window.clearTimeout(notificationPopupDelay);
    //     $('.validation-inspection').show();
    //     $('#inspected-validation').text(fields);
    //     notificationPopupDelay = setTimeout(function() {
    //         $('.validation-inspection').hide();
    //     }, 8000);
    //     return false;
    // }
}


isPayerOrAdmin = function() {
    var userInfo = Meteor.user();
    var user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
        "UserCount": 1,
        "username": "",
        "email": "",
        "organization": "",
        "org_id": 1,
        "role": 0
    };
    return user.role === 1 || user.role === 2 ? true : false;
}

isAdmin = function() {
    var userInfo = Meteor.user();
    var user = userInfo && userInfo.profile.userDetail ? userInfo.profile.userDetail : {
        "UserCount": 1,
        "username": "",
        "email": "",
        "organization": "",
        "org_id": 1,
        "role": 0
    };
    return user.role === 1 || user.is_super_user === 1 ? true : false;
};
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 01-March-2017
 * @desc: Added method to cehck user role is PrimaryCarePhysician or not
 */
isPrimaryCarePhysician = function() { 
    // function path : `../../lib/custom/common`  
    // For Primary Care Provider need to add role here
    return isPCPAuhtorized();
};

isCustomRole=function(tab){
    // function path : `../../lib/custom/common`
    return isUserAuthorized(tab);
}
isCustomRole_bkup = function(tab) { 
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
    let isPrimaryCarePhysicianRole = isPrimaryCarePhysician() && _.indexOf(AccessibleTabForPrimaryCarePhysician, tab.toLowerCase()) > -1;
    //Patient/Provider/Dashbaord/Analytics
    let AccessibleTabForProvider = ["patient", "provider", "analytics", "dashboard"];
    // Patient/Provider/Dashbaord/Analytics/Payer
    // Added `Assessmenttool` for payer role only for phs, we can restrict by organization if possible 
    let AccessibleTabForPayer = ["patient", "provider", "analytics", "dashboard", "payer","assessmenttool"];

    let isProviderRole = user.role === 3 && _.indexOf(AccessibleTabForProvider, tab.toLowerCase()) > -1 ? true : false;

    let isPayerRole = user.role === 2 && _.indexOf(AccessibleTabForPayer, tab.toLowerCase()) > -1 ? true : false;

    return isCustom || user.role === 1 || isPayerRole || isProviderRole || isPrimaryCarePhysicianRole ? true : false;
}


getSubpopulationData = function() {
    var pData = selectedData(Router['PatientId']);
    pData = pData[0];

    var treatmentData = '';
    var treat = '';

    if (pData.Relapsed === "Yes") {
        treat = "Relapsed";
    }
    if (pData.PartialResponse === "Yes") {
        treat = " Partial Response";
    }
    if (pData.NonResponsive === "Yes") {
        treat = " Non Responsive"
    }
    if (pData.Tolerant === "Yes") {
        treat = " Tolerant";
    }
    if (pData.PartialTolerant === "Yes") {
        treat = " Partial Tolerant";
    }
    if (pData.Treatment === "Yes") {
        treatmentData = "Naive";

    } else {
        treatmentData = "Experienced" + treat;

    }
    var category_name = '';
    if (pData.Cirrhosis == 'Yes') {

        category_name = category_name + pData.Genotype + " " + treatmentData + " cirrhosis";
    } else {
        category_name = category_name + pData.Genotype + " " + treatmentData;
    }
    var category_id = (category_name_list.indexOf(category_name)) + 1;

    Session.set('category_id', category_id);
    Router['category_id'] = category_id;
}

let isModelChanged = function() {

    let confirm = Session.get('treated_isCurrentModelModified') || Session.get('treating_isCurrentModelModified') || Session.get('untreated_isCurrentModelModified');
    if (confirm) {
        $('#loadWarningMessageTab').show();
    } else {
        $('#loadWarningMessageTab').hide();
        Session.set('isModel', false);
    }
    //$('#loadWarningMessageTab').show();
}

isModelPayerChanged = function() {
    return (Session.get('treated_isCurrentModelModified') || Session.get('treating_isCurrentModelModified') || Session.get('untreated_isCurrentModelModified'));
}

//function to show/hide the medication filter on the tabs
let showMedsFilterInSearch = (makeVisible) => {
    if (makeVisible) {
        $('.advFilters-medicationFilterButton').show();
        //$('.advFilters-medicationFilterSection .checkbox').show();
        $('.header-medicationInfo').show();
    } else {
        $('.advFilters-medicationFilterButton').hide();
        //$('.advFilters-medicationFilterSection .checkbox').hide();
        $('.header-medicationInfo').hide();
    }
}