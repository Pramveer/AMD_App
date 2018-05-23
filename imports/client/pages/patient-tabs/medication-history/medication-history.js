import './medication-history.html';


let LabsData = [];
let pharmacyData = [];
patientCount = new ReactiveVar(0);
patientRowNo = 1;

Template.MedicationHistory.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let PatientID = localStorage.getItem("PatientID");
        if (PatientID != '') { let params = getCurrentPopulationFilters();

            Meteor.call('getMedicationHistoryAll', PatientID,params, function(error, result) {
                if (error) {
                    self.loading.set(false);
                } else {
                    LabsData = result;
                    Meteor.call('getMedicationHistoryPharma', PatientID,params, function(error, pharmaResults) {
                        if (error) {
                            self.loading.set(false);
                        } else {
                            pharmacyData = pharmaResults;
                            self.loading.set(false);
                        }
                    });
                }
            });

        } else {
            LabsData = [];
            self.loading.set(false);
        }
    });
});
Template.MedicationHistory.events({
    'click .pager-button': function(e, template) {
        if (e.target.id != null) {
            switch (e.target.id) {
                case 'filter-patient-previous':
                    if (patientRowNo != 1)
                        patientRowNo--;
                    break;
                case 'filter-patient-next':
                    let patientcount = patientCount == void 0 ? (AmdApp['Filters'] != undefined ? AmdApp['Filters']['patientCountTab'] : 0) : patientCount.get();
                    if (patientRowNo <= parseInt(patientcount))
                        patientRowNo++;
                    break;
            }
            let params = getCurrentPopulationFilters();
            if (params != null) {
                //console.log('********************* RowNo' + patientRowNo);
                params['patientCount'] = false;
                params['rowNo'] = patientRowNo;
                Meteor.call('searchPatients', params, (error, results) => {
                    if (error || (results.length < 0)) {
                        console.log('No data fetched');
                        window.clearTimeout(notificationPopupDelay);
                        $('.fltlft').hide();
                        $('.validation-inspection').show();
                        $('#inspected-validation').text('No Record Found..');
                        notificationPopupDelay = setTimeout(function() {
                            $('.validation-inspection').hide();
                        }, 8000);
                        return;
                    } else {
                        //console.log(results);
                        $('.patient-row-history').html(params['rowNo']);
                        let patientID = results[0].PATIENT_ID_SYNTH;
                        if (document.getElementById('patientID')) {
                            document.getElementById('patientID').innerHTML = '';
                        }
                        Router['PatientId'] = patientID;
                        localStorage.PatientID = patientID;
                        params['patientId'] = patientID;
                        $('.history-patientid').html(Math.abs(patientID));
                        localStorage.isSearched = true;
                        //get data
                        getPatientData(patientID, template);
                        localStorage.removeItem("selectedDrugs");
                        localStorage.removeItem("lastSelectedDrug");
                        localStorage.removeItem("AllDrugsName");
                        localStorage.removeItem("AllDrugsData");
                        //console.log(results);
                        AmdApp['SelectedPatient'] = results;
                        Router.go('/MedicationHistory');
                    }
                });

            }
        }
    }
});

Template.MedicationHistory.rendered = function() {
    //Reference from http://www.jqueryscript.net/table/jQuery-Plugin-For-Bootstrap-Based-Data-Table-Bootstrap-Data-Table.html
    //console.log("Medication Rendered");

    // $('.pin-labs-div .table').bdt({
    //     pageRowCount: 10,
    //     arrowDown: 'fa-angle-down',
    //     arrowUp: 'fa-angle-up'
    // });
    // $('.psAccordion .hasSubMenu').click(function(e) {

    //     if ($(e.target).parent().hasClass("hasSubMenu")) {
    //         e.preventDefault();
    //         var elem = this;
    //         $(elem).find('.sub-sidemenu').slideToggle("slow");

    //         if ($(elem).data("rotate") == "close") {
    //             $(elem).find('.submenu-arrow i').rotate(180);
    //             $(elem).data("rotate", "open");
    //         } else if ($(elem).data("rotate") == "open") {
    //             $(elem).find('.submenu-arrow i').rotate(0);
    //             $(elem).data("rotate", "close");
    //         }
    //         //return false;
    //     } else {
    //         //    return false;
    //     }
    // });

    $('.left-side-menu li').click(function() {
        $('.left-side-menu li a').removeClass('active');
        $(this).children('a').addClass('active');
    });
};


Template.MedicationHistory.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    //check for no data
    // Yurvaj April 14th, Changed Queary to use a select statement not Stored Procedure.
    // 'isDataPresent': () => LabsData[0].length > 0 ? true : false,
    'isDataPresent': () => LabsData.length > 0 ? true : false,

    'isPharmaDataPresent': () => pharmacyData.length > 0 ? true : false,

    'PatientCount': function() {
        return patientCount == void 0 ? AmdApp['Filters']['patientCountTab'] : patientCount.get();
    },
    'PatientRowNumber': function() {
        return patientRowNo;
    },
    'PatientId': () => {
        return Math.abs(Router['PatientId']);
    },

    'getPatientLab': function() {
        if (LabsData && LabsData.length > 0) {
            // console.log(LabsData);
            setTimeout(function() {

                // $('.pin-labs-history .table-history').bdt({
                //     pageRowCount: 15,
                //     arrowDown: 'fa-angle-down',
                //     arrowUp: 'fa-angle-up'
                // });

                $('.pin-labs-history .table-history').bootstrapTable();
            }, 200);
            return LabsData;
        }
    },

    'getPharmaMedications': function() {
        if (pharmacyData && pharmacyData.length > 0) {
            setTimeout(function() {
                $('.pin-labs-history-pharmacy .table-history').bootstrapTable();
            }, 200);
            return pharmacyData;
        }
    }
});


let getPatientData = (PatientID, template) => {
    //let PatientID = localStorage.getItem("PatientID");
    template.loading.set(true);
    if (PatientID != '') { let params = getCurrentPopulationFilters();

        Meteor.call('getMedicationHistoryAll', PatientID,params, function(error, result) {
            if (error) {
                template.loading.set(false);
            } else {
                LabsData = result;
                Meteor.call('getMedicationHistoryPharma', PatientID,params, function(error, pharmaResults) {
                    if (error) {
                        template.loading.set(false);
                    } else {
                        pharmacyData = pharmaResults;
                        template.loading.set(false);
                    }
                });
            }
        });

    } else {
        LabsData = [];
        pharmacyData = [];
        template.loading.set(false);
    }
}