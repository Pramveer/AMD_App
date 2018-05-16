import {
    Template
} from 'meteor/templating';
import './cmp.html';

let cmpLabsData = [];
patientCount = new ReactiveVar(0);
patientRowNo = 1;
Template.CMP.onCreated(function() {
    let self = this;
    this.loading = new ReactiveVar(true);
    this.autorun(function() {
        let PatientID = localStorage.getItem("PatientID");
        if (PatientID != '') {  let params = getCurrentPopulationFilters();

            Meteor.call('getLabDetails', PatientID, 'CHEMISTRY', params, function(error, result) {
                if (error) {
                    self.loading.set(false);
                } else {
                    cmpLabsData = result;
                    self.loading.set(false);
                }
            });

        } else {
            cmpLabsData = [];
            self.loading.set(false);
        }
    });
});

Template.CMP.events({
  'click .pager-button': function(e,template) {
      if (e.target.id != null) {
          switch (e.target.id) {
              case 'filter-patient-previous':
                  if (patientRowNo != 1)
                      patientRowNo--;
                  break;
              case 'filter-patient-next':
                  let patientcount =  patientCount == void 0?(Pinscriptive['Filters'] != undefined?Pinscriptive['Filters']['patientCountTab']:0):patientCount.get();
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
                      $('.patient-row-cmp').html(params['rowNo']);
                      let patientID = results[0].PATIENT_ID_SYNTH;
                      if (document.getElementById('patientID')) {
                          document.getElementById('patientID').innerHTML = '';
                      }
                      Router['PatientId'] = patientID;
                      localStorage.PatientID = patientID;
                      params['patientId']  = patientID;
                      $('.cmp-patientid').html(Math.abs(patientID));
                      localStorage.isSearched = true;
                      //get data
                      getPatientData(patientID,template);
                      localStorage.removeItem("selectedDrugs");
                      localStorage.removeItem("lastSelectedDrug");
                      localStorage.removeItem("AllDrugsName");
                      localStorage.removeItem("AllDrugsData");
                      //console.log(results);
                      Pinscriptive['SelectedPatient'] = results;
                      Router.go('/CMP');
                  }
              });
          }
      }
  }
});
Template.CMP.rendered = function() {
        //Reference from http://www.jqueryscript.net/table/jQuery-Plugin-For-Bootstrap-Based-Data-Table-Bootstrap-Data-Table.html
        //$('.pin-labs-cmp .table-cmp').bdt();
        // $('.psAccordion .hasSubMenu').click(function(e) {

        //     if ($(e.target).parent().hasClass("hasSubMenu")) {
        //         e.preventDefault();
        //         var elem = this;
        //         //$(elem).find('.sub-sidemenu').slideToggle("slow");

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


        /*
    $("#txtAST").on("input", function(e) {
        var txtInput = this.value;

        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvAST').removeClass('highlight');
                saveCMPData({'labs_ast':txtInput},'txtAST');
            } else {
                this.value = '';
            }
        } else {
            $('.dvAST').addClass('highlight');
        }
    });
    $("#txtSodium").on("input", function(e) {
        var txtInput = this.value;

        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvSodium').removeClass('highlight');
                saveCMPData({'labs_cmp_sodium':txtInput},'txtSodium');
            } else {
                this.value = '';
            }
        } else {
            $('.dvSodium').addClass('highlight');
        }
    });
      $("#txtPotassium").on("input", function(e) {
        var txtInput = this.value;

        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvK').removeClass('highlight');
                saveCMPData({'labs_cmp_potassium':txtInput},'txtPotassium');
            } else {
                this.value = '';
            }
        } else {
            $('.dvK').addClass('highlight');
        }
    });
      $("#txtChloride").on("input", function(e) {
        var txtInput = this.value;

        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvCl').removeClass('highlight');
                saveCMPData({'labs_cmp_chloride':txtInput},'txtPotassium');
            } else {
                this.value = '';
            }
        } else {
            $('.dvCl').addClass('highlight');
        }
    });
      $("#txtCO2").on("input", function(e) {
        var txtInput = this.value;

        if (txtInput.length > 0) {
            if ($.isNumeric(txtInput)) {
                $('.dvCl').removeClass('highlight');
                saveCMPData({'labs_cmp_co2':txtInput},'txtPotassium');
            } else {
                this.value = '';
            }
        } else {
            $('.dvCO2').addClass('highlight');
        }
    });
    */
    }
    /*
    function saveCMPData(data, eleId) {
        Meteor.call('update_data', data, "sample_patients", Router['PatientId'], function(error, result) {
            if (!error) { saveNotificationForCMP(eleId); } else {
            }

        });
    }

    function saveNotificationForCMP(eleID) {
        $('#' + eleID).parent('span').next().css('display', 'block');
        $('#' + eleID).parent('span').next().fadeIn('slow').delay(2500).fadeOut('slow');
    }
    */


Template.CMP.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    //check for no data
    'isDataPresent': () => cmpLabsData.length > 0 ? true : false,

    'PatientCount': function() {
        return patientCount == void 0 ? Pinscriptive['Filters']['patientCountTab'] : patientCount.get();
    },
    'PatientRowNumber': function() {
        return patientRowNo;
    },
    'PatientId':()=>{
            return Math.abs(Router['PatientId']);
    },
    'getPatientLab': function() {
        if (cmpLabsData) {
            setTimeout(function() {
                // $('.pin-labs-cmp .table-cmp').bdt({
                //     pageRowCount: 15,
                //     arrowDown: 'fa-angle-down',
                //     arrowUp: 'fa-angle-up'
                // });
                $('.pin-labs-cmp .table-cmp').bootstrapTable()
            }, 200);
            return cmpLabsData;
        }
    }
});

let getPatientData = (PatientID, template) => {
    //let PatientID = localStorage.getItem("PatientID");
    template.loading.set(true);
    if (PatientID != '') {  let params = getCurrentPopulationFilters();

        Meteor.call('getLabDetails', PatientID, 'CHEMISTRY', params, function(error, result) {
            if (error) {
                template.loading.set(false);
            } else {
                cmpLabsData = result;
                template.loading.set(false);
            }
        });

    } else {
        cmpLabsData = [];
        template.loading.set(false);
    }
}
