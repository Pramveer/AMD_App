import './fibrosure.html';



let FibrosureLabsData = [];
patientCount = new ReactiveVar(0);
patientRowNo = 1;

Template.Fibrosure.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let PatientID = localStorage.getItem("PatientID");
        if (PatientID != '') { let params = getCurrentPopulationFilters();

            Meteor.call('getLabDetails', PatientID, 'FIBROSURE', params,function(error, result) {
                if (error) {
                    self.loading.set(false);
                } else {
                    FibrosureLabsData = result;
                    self.loading.set(false);
                }
            });

        } else {
            FibrosureLabsData = [];
            self.loading.set(false);
        }
    });
});

Template.Fibrosure.rendered = function() {

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

    $('.left-side-menu li').click(function (){
$('.left-side-menu li a').removeClass('active');
$(this).children('a').addClass('active');
});
};

Template.Fibrosure.events({
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
                      $('.patient-row-fibrosure').html(params['rowNo']);
                      let patientID = results[0].PATIENT_ID_SYNTH;
                      if (document.getElementById('patientID')) {
                          document.getElementById('patientID').innerHTML = '';
                      }
                      Router['PatientId'] = patientID;
                      localStorage.PatientID = patientID;
                      params['patientId']  = patientID;
                      $('.fibrosure-patientid').html(Math.abs(patientID));
                      localStorage.isSearched = true;
                      //get data
                      getPatientData(patientID,template);
                      localStorage.removeItem("selectedDrugs");
                      localStorage.removeItem("lastSelectedDrug");
                      localStorage.removeItem("AllDrugsName");
                      localStorage.removeItem("AllDrugsData");
                      //console.log(results);
                      AmdApp['SelectedPatient'] = results;
                      Router.go('/Fibrosure');
                  }
              });

          }
      }
  }
});


Template.Fibrosure.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    //check for no data
    'isDataPresent': () => FibrosureLabsData.length > 0 ? true : false,
    'PatientCount': function() {
        return patientCount == void 0 ? AmdApp['Filters']['patientCountTab'] : patientCount.get();
    },
    'PatientRowNumber': function() {
        return patientRowNo;
    },
    'PatientId':()=>{
            return Math.abs(Router['PatientId']);
    },
    'getPatientLab': function() {
        if (FibrosureLabsData) {
            setTimeout(function() {
                // $('.pin-labs-fibrosure .table-fibrosure').bdt({
                //     pageRowCount: 15,
                //     arrowDown: 'fa-angle-down',
                //     arrowUp: 'fa-angle-up'
                // });

                $('.pin-labs-fibrosure .table-fibrosure').bootstrapTable();
            }, 200);
            return FibrosureLabsData;
        }
    }
});

let getPatientData = (PatientID, template) => {
    //let PatientID = localStorage.getItem("PatientID");
    template.loading.set(true);
    if (PatientID != '') { let params = getCurrentPopulationFilters();

        Meteor.call('getLabDetails', PatientID, 'FIBROSURE', params,function(error, result) {
            if (error) {
                template.loading.set(false);
            } else {
                FibrosureLabsData = result;
                template.loading.set(false);
            }
        });

    } else {
        FibrosureLabsData = [];
        template.loading.set(false);
    }
}
