import './past-hcv-treatment.html';


let LabsData = [];
patientCount = new ReactiveVar(0);
patientRowNo = 1;

Template.PastHCVTreatment.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let PatientID = localStorage.getItem("PatientID");
        if (PatientID != '') { let params = getCurrentPopulationFilters();

            Meteor.call('getPastHCVMedication', PatientID,params ,function(error, result) {
                if (error) {
                    self.loading.set(false);
                } else {
                    LabsData = result;
                    self.loading.set(false);
                }
            });

        } else {
            LabsData = [];
            self.loading.set(false);
        }
    });
});

Template.PastHCVTreatment.rendered = function() {

    $('.left-side-menu li').click(function() {
        $('.left-side-menu li a').removeClass('active');
        $(this).children('a').addClass('active');
    });
};

Template.PastHCVTreatment.events({
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
                        let patientID = results[0].PATIENT_ID_SYNTH;
                        if (document.getElementById('patientID')) {
                            document.getElementById('patientID').innerHTML = '';
                        }
                        $('.patient-row-number-past').html(params['rowNo']);
                        Router['PatientId'] = patientID;
                        localStorage.PatientID = patientID;
                        params['patientId'] = patientID;
                        $('.past-patientid').html(Math.abs(patientID));
                        localStorage.isSearched = true;
                        //get data
                        getPatientData(patientID, template);
                        localStorage.removeItem("selectedDrugs");
                        localStorage.removeItem("lastSelectedDrug");
                        localStorage.removeItem("AllDrugsName");
                        localStorage.removeItem("AllDrugsData");
                        //console.log(results);
                        AmdApp['SelectedPatient'] = results;
                        Router.go('/PastHCVTreatment');
                    }
                });

            }
        }
    },
});

Template.PastHCVTreatment.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'PatientCount': function() {
        return patientCount == void 0 ? AmdApp['Filters']['patientCountTab'] : patientCount.get();;
    },
    'PatientRowNumber': function() {
        return patientRowNo;
    },
    'PatientId': () => {
        return Math.abs(Router['PatientId']);
    },
    //check for no data
    'isDataPresent': () => LabsData.length > 0 ? true : false,

    'getPatientLab': function() {
        if (LabsData && LabsData.length > 0) {
            // console.log(LabsData);
            setTimeout(function() {

                // $('.pin-labs-past .table-past').bdt({
                //     pageRowCount: 25,
                //     arrowDown: 'fa-angle-down',
                //     arrowUp: 'fa-angle-up'
                // });

                $('.pin-labs-past .table-past').bootstrapTable();
            }, 200);
            return LabsData;
        }
    }
});

let getPatientData = (PatientID, template) => {
    //let PatientID = localStorage.getItem("PatientID");
    template.loading.set(true);
    if (PatientID != '') { let params = getCurrentPopulationFilters();

        Meteor.call('getPastHCVMedication', PatientID,params ,function(error, result) {
            if (error) {
                template.loading.set(false);
            } else {
                LabsData = result;
                template.loading.set(false);
            }
        });

    } else {
        LabsData = [];
        template.loading.set(false);
    }
}