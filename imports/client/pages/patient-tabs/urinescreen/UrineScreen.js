import './urineScreen.html';


let UrineScreenLabsData = [];
patientCount = new ReactiveVar(0);
patientRowNo = 1;

Template.UrineScreen.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let PatientID = localStorage.getItem("PatientID");
        if (PatientID != '') { let params = getCurrentPopulationFilters();

            Meteor.call('getLabDetails', PatientID, 'DRUG',params, function(error, result) {
                if (error) {
                    self.loading.set(false);
                } else {
                    UrineScreenLabsData = result;
                    self.loading.set(false);
                }
            });

        } else {
            UrineScreenLabsData = [];
            self.loading.set(false);
        }
    });
});

Template.UrineScreen.events({
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
                        $('.patient-row-urine').html(params['rowNo']);
                        let patientID = results[0].PATIENT_ID_SYNTH;
                        if (document.getElementById('patientID')) {
                            document.getElementById('patientID').innerHTML = '';
                        }
                        Router['PatientId'] = patientID;
                        localStorage.PatientID = patientID;
                        params['patientId'] = patientID;
                        $('.urine-patientid').html(Math.abs(patientID));
                        localStorage.isSearched = true;
                        //get data
                        getPatientData(patientID, template);
                        localStorage.removeItem("selectedDrugs");
                        localStorage.removeItem("lastSelectedDrug");
                        localStorage.removeItem("AllDrugsName");
                        localStorage.removeItem("AllDrugsData");
                        //console.log(results);
                        AmdApp['SelectedPatient'] = results;
                        Router.go('/UrineScreen');
                    }
                });
            }
        }
    }
});

Template.UrineScreen.rendered = function() {
    $('.left-side-menu li').click(function() {
        $('.left-side-menu li a').removeClass('active');
        $(this).children('a').addClass('active');
    });
};


Template.UrineScreen.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    //check for no data
    'isDataPresent': () => UrineScreenLabsData.length > 0 ? true : false,

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
        if (UrineScreenLabsData) {
            setTimeout(function() {
                // $('.pin-labs-urine .table-urine').bdt({
                //     pageRowCount: 15,
                //     arrowDown: 'fa-angle-down',
                //     arrowUp: 'fa-angle-up'
                // });
                $('.pin-labs-urine .table-urine').bootstrapTable();
            }, 200);
            return UrineScreenLabsData;
        }
    }
});

let getPatientData = (PatientID, template) => {
    //let PatientID = localStorage.getItem("PatientID");
    template.loading.set(true);
    if (PatientID != '') { let params = getCurrentPopulationFilters();

        Meteor.call('getLabDetails', PatientID, 'DRUG',params, function(error, result) {
            if (error) {
                template.loading.set(false);
            } else {
                UrineScreenLabsData = result;
                template.loading.set(false);
            }
        });

    } else {
        UrineScreenLabsData = [];
        template.loading.set(false);
    }
}