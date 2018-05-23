import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './OtherMedicineCount.html';
import * as pharmaLib from '../pharmaLib.js';

let pharmaData = [];
let dummyMedication = [];

Template.OtherMedicineCount.onCreated(function () {
    pharmaData = AmdApp['pharma']['drugfulldata'];
});

Template.OtherMedicineCount.rendered = function () {

    //hide the show patients list icon
    $('.globalshowPatientPharma').hide();
    
    loadingDropdown();

    //  setTimeout(function () {

    //         $('#pharma-medicationOMC').selectize();
    //         var medicine = $("#pharma-medicationOMC").val();
    //         renderOtherMedicineCount(medicine);
    //     }, 200);

    setTimeout(function () {

        treatedTreatmentSelect = $('.treatedTreatmentOM').selectize();
        treatedTreatmentSelect[0].selectize.setValue(Session.get('pharmaTreatment'));

        treatedCirrhosisSelect = $('.treatedCirrhosisOM').selectize();
        treatedCirrhosisSelect[0].selectize.setValue(Session.get('pharmaCirrhosis'));

        treatedmedication = $('#pharma-medicationOMC').selectize();;
        treatedmedication[0].selectize.setValue(Session.get('pharmamedicine'));

        setGenotypeComboForCurrentPatient();

        renderOtherMedicineCount($("#pharma-medicationOMC").val());

    }, 200);

}

Template.OtherMedicineCount.events({
    'click .treatedApplyUniFiltersMO': function (e, template, data) {
        //set header data
        pharmaLib.setPharmaHeaderTabData();
        console.log('treatedApplyUniFiltersMO');
        if (data && data['data'] == 'refresh') {
            //setGenotypeComboForCurrentPatientSearch();
            let currentFilters = getCurrentPopulationFilters();
            console.log('currentFilters.genotypes refresh');
            console.log(currentFilters.genotypes);

            let treat = currentFilters.treatment.length == 1 ? convertFirstLetterCaps(currentFilters.treatment[0]) : 'all',
                cirrhosis = currentFilters.cirrhosis.length == 1 ? convertFirstLetterCaps(currentFilters.cirrhosis[0]) : 'all';

            Session.set('pharmaGenotype', currentFilters.genotypes);
            setGenotypeComboForCurrentPatient();
            treatedTreatmentSelect[0].selectize.setValue(treat);
            treatedCirrhosisSelect[0].selectize.setValue(cirrhosis);
            Session.set('pharmaTreatment', treat);
            Session.set('pharmaCirrhosis', cirrhosis);
            // $('#treatedselectGenotypePH .mutliSelect li input[value = "all"]').trigger('click');

        }
        else {

            Session.set('pharmamedicine', medicine);
            let genoTypes = _.compact(getGenotypeFromFiltters());
            Session.set('pharmaGenotype', genoTypes);
            Session.set('pharmaTreatment', $('.treatedTreatmentComo').val());
            Session.set('pharmaCirrhosis', $('.treatedCirrhosisComo').val());
        }
        renderOtherMedicineCount($("#pharma-medicationOMC").val());
    }
});

Template.OtherMedicineCount.helpers({
    'isLoading': function () {
        //   return Template.instance().loading.get();
    },
    'getGenotypeList': function () {
        //list genotype
        return PatientsGenotypeList;
    },
    'getMedication': function () {
              let dummyMedication = [];
              let drugArray = ["PegIntron","Pegasys","Victrelis"]
              for(let i = 0;i<AllDrugs.length;i++){
                let drugName = AllDrugs[i].name;
                if(drugArray.indexOf(drugName) == -1 )
                  dummyMedication.push(AllDrugs[i].name);
              }
            return dummyMedication;
    }
});


// funtion for applying filters
function getCurrentPopulationFilters() {
    let filters = AmdApp.Filters,
        othersFilters = {
            age: filters.age || [],
            alcohol: getArrFromFormattedStr(filters.alcohol),
            apri: filters.apri || [],
            chemistry: getArrFromFormattedStr(filters.chemistry),
            ethinicity: getArrFromFormattedStr(filters.ethinicity),
            etoh: filters.etoh || [],
            fibroscan: getArrFromFormattedStr(filters.fibroscan),
            fibrosure: getArrFromFormattedStr(filters.fibrosure),
            hcc: getArrFromFormattedStr(filters.hcc),
            hiv: getArrFromFormattedStr(filters.hiv),
            liverBiopsy: getArrFromFormattedStr(filters.liverBiopsy),
            liverAssesment: getArrFromFormattedStr(filters.liver_assesment),
            meld: filters.meld || [],
            mentalHealth: getArrFromFormattedStr(filters.mental_health),
            renalFailure: getArrFromFormattedStr(filters.renal_failure),
            viralLoad: filters.viralLoad || [],
            weight: filters.weight || []
        };

    let filterObj = {
        //string values to array
        genotypes: getArrFromFormattedStr(filters.genotypes),
        cirrhosis: getArrFromFormattedStr(filters.cirrhosis),
        treatment: getArrFromFormattedStr(filters.treatment),
        planType: getArrFromFormattedStr(filters.insurance),
        othersFilters: othersFilters
    }

    console.log("************Filter Object****************");
    console.log(filterObj);

    return filterObj;
}

// funtion to convert string to array
function getArrFromFormattedStr(str) {
    return str ? str.replace(/['"]+/g, '').split(',') : [];
}



function renderOtherMedicineCount(medicine) {

    //set header data
    pharmaLib.setPharmaHeaderTabData();
    let pharmaDataOtherMedicines = [];
    pharmaDataOtherMedicines = getDrugFilteredData(medicine);
    $('.searchPatientCountHeaderPharma').html(pharmaDataOtherMedicines.length);
    let groupedData = _.groupBy(pharmaDataOtherMedicines, 'othermedicine');
    // console.log(groupedData);
    let XnameArray = [];

    for (let keys in groupedData) {
        let countvalues = {};
        countvalues["axis"] = keys;
        countvalues["axisvalues"] = groupedData[keys].length;
        XnameArray.push(countvalues);
    }

    // console.log(XnameArray);
    let xlabels = ['x', 'No other (0)', '1 Other', '2 Others', '3 Others', '4 Others', '5 Others'];
    let xaxis = ['-', '0', '1', '2', '3', '4', '5'];
    let yaxisvalues = [];
    yaxisvalues.push("value");

    for (i = 1; i <= xaxis.length - 1; i++) {
        let yval = 0;
        for (j = 0; j <= XnameArray.length - 1; j++) {
            if (xaxis[i] == XnameArray[j].axis) {
                yval = XnameArray[j].axisvalues;//  yaxisvalues.push();
            }
        }
        yaxisvalues.push(yval);
    }

    // console.log(xaxis);
    // console.log(xlabels);
    // console.log(yaxisvalues);

    let container = "#pharma_medicationcount";
    d3.select(container).selectAll("*").remove();

    var chart = c3.generate({
        bindto: container,
        bar: {
            width: {
                ratio: 0.85
            }
        },
        size: {
            height: 360

        },
        color: {
            pattern: ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7']
        },
        data: {
            x: 'x',
            columns:
            [
                xlabels,
                yaxisvalues
            ],

            type: 'bar',
            color: function (inColor, data) {
                var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'];
                if (data.index !== undefined) {
                    return colors[data.index];
                }
                return inColor;
            },
            labels: {
                format: function (v, id, i, j) {
                    var labelv = '';
                    //  console.log(probgroup.length);
                    if (i != undefined) {
                        labelv = commaSeperatedNumber(yaxisvalues[i + 1]);
                        return labelv;
                    } else { }
                }
            }
        },
        axis: {
            x: {
                type: 'category',
                label: {
                    text: 'No. of Other Medicines',
                    position: 'center'
                }
            },
            y: {
                label: {
                    text: 'Patient Counts',
                    position: 'middle'
                }
            }
        },
        tooltip: {
            grouped: false,
            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                var colors = ['#e95a52', '#2e7e97', '#abd6ba', '#f1cb6a', '#69bae7'];
                let dataObj = d[0];

                let html = '';
                html = '<div class="customC3ToolTip">' +
                    '<div class="customC3ToolTip-Header">' +
                    '<div>' + xlabels[dataObj.index + 1] + '</div>' +
                    '</div>' +
                    '<div class="customC3ToolTip-Body">' +
                    '<div><div style="height:10px;width:10px;display:inline-block;background-color:' + colors[dataObj.index] + '"></div> Patients Count: ' + yaxisvalues[dataObj.index + 1] + '</div>' +
                    '</div>' +
                    '</div>';
                return html;
            }
        },
        legend: {
            show: false
        }
    });
}

let getDrugFilteredData = (medicine) => {
    /*console.log(pharmaData);
     console.log(typeof(pharmaData));*/
    let genoTypes = Session.get('pharmaGenotype');//_.compact(getGenotypeFromFiltters());
    let filteredpharmaData = pharmaData;

    if (medicine != 'all' && medicine != null && medicine != void 0 && medicine != "") {
        filteredpharmaData = filteredpharmaData.filter(a => a.MEDICATION.toLowerCase().indexOf(medicine.toLowerCase()) > -1);
    }
    // filteredpharmaData = filteredpharmaData.filter(function (a) {
    //     return a.MEDICATION.toLowerCase().indexOf(medicine.toLowerCase()) > -1;
    // });

    if ($('.treatedTreatmentOM').val() != 'all') {
        filteredpharmaData = filteredpharmaData.filter(function (a) {
            return a.TREATMENT == $('.treatedTreatmentOM').val();
        });
    }
    if ($('.treatedCirrhosisOM').val() != 'all') {
        filteredpharmaData = filteredpharmaData.filter(function (a) {
            return a.CIRRHOSIS == $('.treatedCirrhosisOM').val();
        });
    }
    // console.log(genoTypes);
    if (genoTypes.length && genoTypes[0].toLowerCase() != 'all') {
        filteredpharmaData = _.filter(filteredpharmaData, function (e) { for (var i = 0; i < genoTypes.length; i++) { if (e.GENOTYPE == genoTypes[i]) { return e; } } })
    }

    return filteredpharmaData;
}

function handleMultiGenoCombo(ele) {
    var className = $(ele).closest('.genotypeSelect').parent().parent().attr('id'); // Selecting the id of the container.

    var title = title_html = $(ele).val(); //$(ele).closest('.mutliSelect').find('input[type="checkbox"]').val();

    var selectedLength = $('#' + className + ' .multiSel').children().length;

    title_html = $(ele).val() + ',';

    //chekc if selected value is all
    if (title.toLowerCase() === 'all') {
        //loop for all the genotypes
        $('#' + className + ' .mutliSelect').find('input').each(function (index) {
            if ($(ele).is(':checked')) {
                //if all is selected disable all other values except ALL
                if (index) {
                    $(this).attr('disabled', true);
                    $(this).prop('checked', false);
                }
            } else {
                //Enable all values when all is diselected
                $(this).attr('disabled', false);
                $(this).prop('checked', false);
            }
        });

        //append all in value area if is selected
        if ($(ele).is(':checked')) {
            var html = '<span title="All">All</span>';
            $('#' + className + ' .multiSel').empty();
            $('#' + className + ' .multiSel').append(html);
            // $('#'+className +' .multiSel').show();
            // $('#'+className + ' .hida').hide();
        }
        //remove all from value area if is unselected
        else {
            $('#' + className + ' span[title="All"]').remove();
            // $('#'+className + ' .hida').show();
            // $('#'+className +' .multiSel').hide();
        }
        return;
    }

    //append the value in value area if is selected
    if ($(ele).is(':checked')) {
        var html = '<span title="' + title + '">' + title_html + '</span>';
        $('#' + className + ' .multiSel').append(html);
        // $('#'+className + ' .hida').hide();
        // $('#'+className +' .multiSel').show();
    }
    //remove the value from value area if is unselected
    else {
        $('#' + className + ' span[title="' + title + '"]').remove();
        var ret = $('.' + className + ' .hida');
        $('#' + className + ' .dropdown dt a').append(ret);
        if (selectedLength == 1) {
            // $('#'+className + ' .hida').show();
            // $('#'+className +' .multiSel').hide();
        }
    }
}

function loadingDropdown() {
    // $('.treatedTreatmentOM').selectize();
    // $('.treatedCirrhosisOM').selectize();
    // $('#pharma-medication').selectize();

    //events for multiselect combo
    $(".dropdown dt a").on('click', function () {
        $(".dropdown dd ul").slideToggle('fast');
    });

    $(".dropdown dd ul li a").on('click', function () {
        $(".dropdown dd ul").hide();
    });

    $(document).bind('click', function (e) {
        var $clicked = $(e.target);
        if (!$clicked.parents().hasClass("dropdown"))
            $(".dropdown dd ul").hide();
    });

    $('.mutliSelect input[type="checkbox"]').on('click', function (e) {
        handleMultiGenoCombo(e.target);
    });

}


function getGenotypeFromFiltters() {
    let genotypes = '';

    //get text data from mutlisselect combo
    $('#treatedselectGenotypeOM .multiSel').children().each(function (index) {
        genotypes += $(this).html().trim();
    });
    //remove last comma and change the genotype to array
    genotypes = genotypes[0] == ',' ? genotypes.substring(1, genotypes.length) : genotypes;
    genotypes = genotypes.split(',');
    return genotypes;
}
