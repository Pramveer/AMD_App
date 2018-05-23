import './herbal-history.html';


let LabsData = [];
patientCount = new ReactiveVar(0);
patientRowNo = 1;

Template.HerbalHistory.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let PatientID = localStorage.getItem("PatientID");
        if (PatientID != '') { let params = getCurrentPopulationFilters();

            Meteor.call('getHerbalMedicationHistory', PatientID, params,function(error, result) {
                if (error) {
                     console.log(error);
                    self.loading.set(false);
                } else {
                     console.log(result);
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

Template.HerbalHistory.rendered = function() {
    //Reference from http://www.jqueryscript.net/table/jQuery-Plugin-For-Bootstrap-Based-Data-Table-Bootstrap-Data-Table.html
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

Template.HerbalHistory.events({
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
                        $('.patient-row-herbal').html(params['rowNo']);
                        let patientID = results[0].PATIENT_ID_SYNTH;
                        if (document.getElementById('patientID')) {
                            document.getElementById('patientID').innerHTML = '';
                        }
                        Router['PatientId'] = patientID;
                        localStorage.PatientID = patientID;
                        params['patientId'] = patientID;
                        $('.herbal-patientid').html(Math.abs(patientID));
                        localStorage.isSearched = true;
                        //get data
                        getPatientData(patientID, template);
                        localStorage.removeItem("selectedDrugs");
                        localStorage.removeItem("lastSelectedDrug");
                        localStorage.removeItem("AllDrugsName");
                        localStorage.removeItem("AllDrugsData");
                        //console.log(results);
                        AmdApp['SelectedPatient'] = results;
                        Router.go('/HerbalHistory');
                    }
                });

            }
        }
    }
});

Template.HerbalHistory.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    //check for no data
    'isDataPresent': () => LabsData.length > 0 ? true : false,

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

                // $('.pin-labs-herbal .table-herbal').bdt({
                //     pageRowCount: 15,
                //     arrowDown: 'fa-angle-down',
                //     arrowUp: 'fa-angle-up'
                // });
                $('.pin-labs-herbal .table-herbal').bootstrapTable();
            }, 200);
            return LabsData;
        }
    }
});


let getPatientData = (PatientID, template) => {
    //let PatientID = localStorage.getItem("PatientID");
    template.loading.set(true);
    if (PatientID != '') { let params = getCurrentPopulationFilters();

        Meteor.call('getHerbalMedicationHistory', PatientID, params,function(error, result) {
            if (error) {
                console.log(error);
                template.loading.set(false);
            } else {
                console.log(result);
                LabsData = result;
                template.loading.set(false);
            }
        });

    } else {
        LabsData = [];
        template.loading.set(false);
    }
}