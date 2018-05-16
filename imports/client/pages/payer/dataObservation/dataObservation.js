/**
 * @author: Yuvraj
 * @date: 25th May 17
 * @desc: Added file for the Data Observation template
 */
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './dataObservation.html';

// Added By Yuvraj May 23rd 2017. 
// This reactive variable will be used in the helper for rendering the waste due to Non standard CPT codes.
let nonStandardCptCodes = new ReactiveVar([]);

Template.DataObservation.onCreated(function() {
    getDataQualityData();
});

Template.DataObservation.rendered = function() {

}
Template.DataObservation.helpers({
    'patientAnalysisData': function() {
        let PatientAnalysis = [{
                Observations: 'It is found that <b>2965 (92.51%)</b> of 3205 patients are missing Genotypes.'
            }, {
                Observations: `It is found that <b>429 (13.38%)</b> of 3205 patients don't have HEPC related ICD codes and keyword in the problem table.`
            },
            {
                Observations: `It is found that <b>367 (11.45%)</b> of 3205 patients don't have HEPC related ICD codes and keyword in the problem table and they also don't have any HEPC medication.`
            },
            {
                Observations: 'It is found that <b>172 (44.55%)</b> of 367 patients have Viral Load data'
            },
            {
                Observations: `It is found that <b>195 (50.51%)</b> of 367 patients don't have Viral Load data.`
            },
            {
                Observations: 'It is found that <b>331 (58.75%)</b> of 367 patients are with HEP C Encounter.'
            },
            {
                Observations: 'It is found that <b>36 (9.32%)</b> of 367 patients are without HEP C Encounter.'
            },
            {
                Observations: 'Only <b>2 (0.5%)</b> of 367 patients have <b>NO</b> HEP C Encounter but <b>WITH</b> Viral Load.'
            },
            {
                Observations: 'It is found that <b>34 (8.8%)</b> of 367 patients are with <b>NO</b> HEP C Encounter <b>NOR</b> Viral Load.'
            },
            {
                Observations: 'It is found that <b>NO</b> patients of 367 patients are with <b>NO</b> HEP C Encounter, <b>NO</b> Viral Load but <b>WITH</b> HEP C Claims.'
            },
            {
                Observations: 'It is found that <b>34 (8.8%)</b> of 367 patients are with <b>NO</b> HEP C Encounter and <b>NO</b> Viral Load and <b>NO</b> HEP C Claims.'
            },
            {
                Observations: 'It is found that <b>172</b>(out of 367 patients which has positive viral load) Total patients are with <b>NO</b> HEP C Problem and <b>NO</b> HEP C Medication.'
            },
            {
                Observations: 'It is found that <b>152 (86.85%)</b> of 172 patients have only one record for Viral Load in the result table.'
            },
            {
                Observations: 'It is found that <b>20 (11.62%)</b> of 172 patients have more than one records for Viral Load in the result table.'
            },
            {
                Observations: 'It is found that <b>29 (16.86%)</b> of 172 patients are <b>WITH</b> positive Viral Load but <b>NO</b> HEP C Medication.'
            },
            {
                Observations: 'It is found that <b>72 (41.86%)</b> of 172 patients have Viral load as <b>NOT DETECTED</b>.'
            }
        ];
        return PatientAnalysis;
    },
    'dataLog': function() {
        let DataLog = [{
                Observations: 'Only <b>240</b> patients have Genotype information.',
                Status: 'Close'
            },
            {
                Observations: '<b>DX_ID</b> is missing from deid_problem table.',
                Status: 'Close'
            },
            {
                Observations: 'There are data with <b>mismatched CPT codes</b> to industry standards.',
                Status: 'Open'
            },
            {
                Observations: 'There are patients with missing <b>Viral Load Data</b>.',
                Status: 'Close'
            },
            {
                Observations: 'There are data with <b>mismatched ICD codes</b> to standard definitions.',
                Status: 'Open'
            },
            {
                Observations: 'It is found that <b>1429</b> patients are linked with claims.',
                Status: 'Open'
            },
            {
                Observations: 'It is found that <b>474</b> patients with HEP C medications are linked with claims.',
                Status: 'Open'
            }, {
                Observations: 'It is found that <b>180</b> patients with HEP C medications are linked with claims and have amount greater than 0.',
                Status: 'Open'
            }, {
                Observations: 'It is found that there are <b>101</b> patients are with older drugs.',
                Status: 'Open'
            }, {
                Observations: 'It is found that there are <b>168</b> patients are with newer drugs.',
                Status: 'Open'
            }, {
                Observations: 'It is found that <b>1489</b> patients are linked with medical claims data.',
                Status: 'Open'
            }, {
                Observations: 'It is found that <b>1716</b> patients are with missing claims data.',
                Status: 'Open'
            }, {
                Observations: '<b>LOINC</b> is not used',
                Status: 'Open'
            }, {
                Observations: '<b>NDC</b> is not used',
                Status: 'Open'
            },
            {
                Observations: 'It is found that Medication data have alternate Medication names but <b>NDC code</b> is missing.',
                Status: 'Open'
            }

        ];
        return DataLog;
    },
    'riskLog': function() {
        let RiskLog = [{
                Observations: 'Only <b>671 (20.64%)</b> of 3205 patients has HCV medication associated with their records.',
                Status: 'Open'
            },
            {
                Observations: 'Med_Rx Prices for <b>CDML_COPAY_AMT</b> & <b>CDML_TOT_PA_LIAB</b> Values (0, 20, 38 etc.)',
                Status: 'Open'
            },
            {
                Observations: '<b>Data Documentation.</b>',
                Status: 'Open'
            },
            {
                Observations: 'Lookup Table for Medication – maps only to <b>Ribavirin</b>.',
                Status: 'Open'
            }
        ];
        return RiskLog;
    },
    'nullReportData': function() {
        let NullReport = [{
                Table: 'deid_allergy',
                NullPercent: '49.84'
            },
            {
                Table: 'deid_vaccine',
                NullPercent: '37.88'
            },
            {
                Table: 'deid_vitals_ambulatory',
                NullPercent: '0.14'
            },
            {
                Table: 'deid_vitals_inpatient',
                NullPercent: '65.47'
            },
            {
                Table: 'deid_encounter_ambulatory',
                NullPercent: '25.51'
            },
            {
                Table: 'deid_encounter_inpatient',
                NullPercent: '13.72'
            },
            {
                Table: 'deid_med_claims',
                NullPercent: '85.68'
            },
            {
                Table: 'deid_patient_master',
                NullPercent: '50.15'
            },
            {
                Table: 'deid_prescriptions_ambulatory',
                NullPercent: '35.54'
            },
            {
                Table: 'deid_prescriptions_inpatient',
                NullPercent: '41.68'
            },
            {
                Table: 'deid_problem',
                NullPercent: '47.18'
            },
            {
                Table: 'deid_results_ambulatory',
                NullPercent: '44.89'
            },
            {
                Table: 'deid_results_inpatient',
                NullPercent: '47.11'
            }
        ];

        return NullReport;


    },
    'cptCodeWaste': function() {
        let cptCodeWaste = nonStandardCptCodes.get();

        if (_.isArray(cptCodeWaste) && cptCodeWaste.length) {
            return cptCodeWaste;
        } else {
            cptCodeWaste = [{
                    testName: 'Hepatitis A vaccine, adult dosage, for intramuscular use',
                    standardCode: '90632',
                    custmerCodes: 'IMM24, IMM25'
                },
                {
                    testName: 'Hepatitis B vaccine, adult dosage, for intramuscular use',
                    standardCode: '90746',
                    custmerCodes: 'IMM73, IMM27, IMM28, IMM33'
                },
                {
                    testName: 'Hepatitis A and hepatitis B vaccine, adult dosage, for intramuscular use',
                    standardCode: '90636',
                    custmerCodes: 'IMM36'
                }
            ];

            return cptCodeWaste;
        }
    },
});
Template.DataObservation.events({

});

/**
 * @author: Pramveer
 * @date: 23rd May 17
 * @desc: function to get the data quality data
 */
let getDataQualityData = () => {
    let params = {};
    params.database = 'PHS_HCV';

    Meteor.call('getDataQualityData', params, (err, res) => {
        if (!err) {
            let result = LZString.decompress(res);
            result = JSON.parse(result);

            console.log(result);

            setTimeout(() => {
                appendDataQualityIssue(result.countData);
                nonStandardCptCodes.set(result.codesData);
                dataObservationTable();
            }, 100);

        }

    });
}

/**
 * @author: Pramveer
 * @date: 23rd May 17
 * @desc: function to populate the data for data quality
 */
let appendDataQualityIssue = (dataObj) => {
    let missingGenoPatients = dataObj[0].nullGenotypes,
        totalPatients = dataObj[0].totalPatients;

    // $('#dataQualityMissingGenotypes-percent').html(' - ('+getPercentForCards(missingGenoPatients, totalPatients)+')');
    // $('#dataQualityMissingGenotypes').html(missingGenoPatients);
    // $('#dataQualityMissingGenotypes-allPatient').html(totalPatients);

    // We have found 240 patients with Genotype Data.
    // $('#dataQualityMissingGenotypes-percent').html(' - (' + getPercentForCards(totalPatients - 240, totalPatients) + ')');
    // $('#dataQualityMissingGenotypes').html(totalPatients - 240);
    $('#dataQualityMissingGenotypes-allPatient').html(totalPatients);
}
////////////////////////////////////////////////////////
// let dataObservationTable = (baseData) => {
let dataObservationTable = () => {
    // if (baseData.total == 0) {
    //     fnNoDataFound('.prescriptionCount-rxCostTable');
    //     return;
    // }
    // let tableData = baseData.data;
    let tableHeader = ``;
    tableHeader = `<div class="common-efd-row MainTitle">
                        <div class="common-efd-cell1" style="width: 15%"><b>Genotype</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>Total Patients</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>Completed Therapy based on pharmacy claims data</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>Due for 12 weeks post-therapy completion viral load</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>SVR12</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>Detectable viral load after treatment</b></div>
                  </div>`;
    let htmlRow = ``;
    htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1" style="width: 15%">1</div>
                        <div class="common-efd-cell1" style="width: 15%">18</div>
                        <div class="common-efd-cell1" style="width: 15%">1</div>
                        <div class="common-efd-cell1" style="width: 15%">1</div>
                        <div class="common-efd-cell1" style="width: 15%">0</div>
                        <div class="common-efd-cell1" style="width: 15%">0</div>
                    </div>`;
    htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1" style="width: 15%">1a</div>
                        <div class="common-efd-cell1" style="width: 15%">2149</div>
                        <div class="common-efd-cell1" style="width: 15%">673</div>
                        <div class="common-efd-cell1" style="width: 15%">521</div>
                        <div class="common-efd-cell1" style="width: 15%">152</div>
                        <div class="common-efd-cell1" style="width: 15%">24</div>
                    </div>`;
    htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1" style="width: 15%">1b</div>
                        <div class="common-efd-cell1" style="width: 15%">171</div>
                        <div class="common-efd-cell1" style="width: 15%">94</div>
                        <div class="common-efd-cell1" style="width: 15%">73</div>
                        <div class="common-efd-cell1" style="width: 15%">21</div>
                        <div class="common-efd-cell1" style="width: 15%">0</div>
                    </div>`;
    htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1" style="width: 15%">2</div>
                        <div class="common-efd-cell1" style="width: 15%">223</div>
                        <div class="common-efd-cell1" style="width: 15%">149</div>
                        <div class="common-efd-cell1" style="width: 15%">105</div>
                        <div class="common-efd-cell1" style="width: 15%">44</div>
                        <div class="common-efd-cell1" style="width: 15%">9</div>
                    </div>`;
    htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1" style="width: 15%">3</div>
                        <div class="common-efd-cell1" style="width: 15%">519</div>
                        <div class="common-efd-cell1" style="width: 15%">121</div>
                        <div class="common-efd-cell1" style="width: 15%">98</div>
                        <div class="common-efd-cell1" style="width: 15%">23</div>
                        <div class="common-efd-cell1" style="width: 15%">7</div>
                    </div>`;
    htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1" style="width: 15%">4</div>
                        <div class="common-efd-cell1" style="width: 15%">30</div>
                        <div class="common-efd-cell1" style="width: 15%">10</div>
                        <div class="common-efd-cell1" style="width: 15%">8</div>
                        <div class="common-efd-cell1" style="width: 15%">2</div>
                        <div class="common-efd-cell1" style="width: 15%">1</div>
                    </div>`;
    htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1" style="width: 15%">null</div>
                        <div class="common-efd-cell1" style="width: 15%">95</div>
                        <div class="common-efd-cell1" style="width: 15%">6</div>
                        <div class="common-efd-cell1" style="width: 15%">6</div>
                        <div class="common-efd-cell1" style="width: 15%">0</div>
                        <div class="common-efd-cell1" style="width: 15%">0</div>
                    </div>`;
    htmlRow += `<div class="common-efd-row">
                        <div class="common-efd-cell1" style="width: 15%"><b>Total :</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>3205</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>1024</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>812</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>242</b></div>
                        <div class="common-efd-cell1" style="width: 15%"><b>41</b></div>
                    </div>`;
    //sort data by ingredient cost 
    // tableData.sort((a, b) => b.y - a.y);
    // for (let i = 0; i < tableData.length; i++) {
    //     let data = tableData[i];
        // htmlRow += `<div class="common-efd-row">
        //                 <div class="common-efd-cell1">${data.name}</div>
        //                 <div class="common-efd-cell1">${commaSeperatedNumber(data.count)}</div>
        //                 <div class="common-efd-cell1" title="$${commaSeperatedNumber(data.y.toFixed(2))}">$${autoFormatCostValue(data.y)}</div>
        //                 <div class="common-efd-cell1">$${commaSeperatedNumber(data.costperrx.toFixed(0))}</div>
        //             </div>`;
    // }

     $('.dataObservtionTable').html(tableHeader + htmlRow);
}
