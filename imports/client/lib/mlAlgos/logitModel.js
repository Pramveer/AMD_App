/*
    Author: Pramveer , 7th Feb 17
    Module for logistics regression model
*/

let customPatientsData = []; //variable to store the custom patients data
let CostModelData = null; //MysqlSubscription variable for cost model data
let probRangeSliderValue = 45; //default probability range slider value for cirrhotic model
let timeRangeSliderValue = 10; //default time frame range slider value for cirrhotic model
let cirrhoiticChartData = null; //chart data of the probability chart
let probabilityChartObj = null; // chart object of the probability chart
let modelAccuracyData = null; //MysqlSubscription variable for accuracy model data
let colorPalettes = ['#f1cb6a', '#69bae7', '#e95a52', '#2e7e97', '#abd6ba', '#98df8a', '#d62728', '#1f77b4', '#ff7f0e']; // different color palettes for scatter cirrhosis chart

//function to call publish for cirrhotic model cost data
export let callPublishForCostModel = () => {
    //CostModelData = new MysqlSubscription('getCirrhoticModelCostData');
}

//Pram(17th July 2017) : function to append the value for stats
export let appendAccuracyScore = (domClass) => {
    let currFilters = getCurrentPopulationFilters();
    let allAccData = __CirrhosisModelAccuracyData.reactive(); 

    let filterData = getFilterDataForAccuracy(currFilters,allAccData);   
    console.log(filterData);

    let accuracy = getAvgForModelStats(filterData, 'ACCURACY'),
        r2Score = getAvgForModelStats(filterData, 'R2_SCORE'),
        roc = getAvgForModelStats(filterData, 'ROC');

    accuracy = accuracy == 'NA' ? 'NA' : (parseFloat(accuracy) + '%');
    r2Score = r2Score == 'NA' ? 'NA' : (parseFloat(r2Score * 100) + '%'); //Convert the score on 100% scale
    roc = roc == 'NA' ? 'NA' : (parseFloat(roc * 100) + '%'); //Convert the score on 100% scale

    $('.modelAccvalue').html(accuracy);
    $('.modelR2value').html(r2Score);
    $('.modelROCvalue').html(roc);

}

let getAvgForModelStats = (dataArray, key) => {
    let value = 0;

    let refineData = _.filter(dataArray ,(rec) => {
        return rec[key] != null;
    });

    if(refineData.length < 1) {
        return 'NA'
    }

    value =  _.pluck(refineData, key).average();

    return value.toFixed(2);
}

let getFilterDataForAccuracy = (currFilters, dataArray) => {
    let genotype = currFilters.genotypes,
        cirrhosis = currFilters.cirrhosis,
        treatment = currFilters.treatment;

    if(dataArray.length < 1) {
        return [];
    }

    let isMultipleGenotype = false, 
        filteredData = dataArray;


    if(currFilters.cirrhosis.length == 0 || currFilters.cirrhosis.length == 2 ) {
        cirrhosis = 'ALL';
    }
    else {
        cirrhosis = currFilters.cirrhosis[0];
    }

    if(currFilters.treatment.length == 0 || currFilters.treatment.length == 2 ) {
        treatment = 'ALL';
    }
    else {
        treatment = currFilters.treatment[0];
    }

    if(currFilters.genotypes.length == 0 || currFilters.genotypes.length == 5 ) {
        genotype = 'ALL';
    }
    else if(currFilters.genotypes.length == 1) {
        genotype = currFilters.genotypes[0];
    }
    else {
        isMultipleGenotype = true;
        let refinedData = [];

        for(let i=0;i<currFilters.genotypes.length;i++) {
            refinedData.push(_.where(filteredData, {GENOTYPE: currFilters.genotypes[i]}));
        }

        filteredData = _.flatten(refinedData)
    }

    treatment = treatment.replace('naive', 'Naive');

    if(isMultipleGenotype) {
        return _.where(filteredData, {CIRRHOSIS: cirrhosis,TREATMENT: treatment});
    }
    else {
        return _.where(filteredData, {GENOTYPE: genotype, CIRRHOSIS: cirrhosis,TREATMENT: treatment});
    }
}

//weights for the cirrhotic probability features
const cirrhoitcFeaturesWeight = {

    /*
     * @Author: Pramveer (14th Feb 2017)
     * @Desc: Commented the old weights as the liver assesment is excluded from it now
     */

    /*'INTERCEPT': -2.91199902,
    'GENDER_CD': -0.13128615,
    'AGE': 0.03352899,
    'FibrosureStage': -0.0567039,
    'RACE_DESC': 0.02178647,
    'BILIRUBIN': 0.4185993,
    'INR_VALUE': 0.00944991,
    'HIV': 0.28916587,
    'CREATININE': 0.00982947,
    'MENTAL_HEALTH': -0.48094245,
    'PLATELET_COUNT': -0.29389671,
    'LIVER_ASSESMENT': -0.34042588 */


    /*'INTERCEPT': -0.04118886,
    'BILIRUBIN': 0.2240529,
    'INR_VALUE': -0.0423359,
    'CREATININE': 0.00132194,
    'PLATELET_COUNT': -0.01412149,
    'AGE': 0.02553884,
    'AST': 0.00912248,
    'ALT': -0.00745878*/

    'INTERCEPT': -4.5211496836141487,
    'BILIRUBIN': -0.042717219657024734,
    'INR_VALUE': 0.64169448598077095,
    'CREATININE': 0.34110131156163598,
    'PLATELET_COUNT': -0.033853656001229721,
    'AGE': 0.18794564588240198,
    'AST': 0.32523798226801137,
    'ALT': -0.095824116279129359
};

/**
 * @author: Pramveer
 * @date: 20th Feb 17
 * @desc: features weight for the cirhotic time prediction
 */
const cirrhoticTimeFeaturesWeight = {
    // 'INTERCEPT': 1933.3210247747547,
    // 'AGE': -11.264474455917101,
    // 'BILIRUBIN': 87.418225128203744,
    // 'INR_VALUE': 175.71231312068227,
    // 'CREATININE': -18.165176258546506,
    // 'PLATELET_COUNT': -1.5661086524077867,
    // 'AST': -4.4407776111887163,
    // 'ALT': 2.4366497089873906,
    // 'CIRRHOTIC_PROBABILITY': -7.3915201319456134

    'INTERCEPT': 1664.3864232676096,
    'AGE': -16.389314698121726,
    'BILIRUBIN': 56.149524963032825,
    'INR_VALUE': 163.9323757331494,
    'CREATININE': -19.486719379420144,
    'PLATELET_COUNT': -0.022604029672371011,
    'AST': -5.8471121962236161,
    'ALT': 2.9073199165424439,
    'CIRRHOTIC_PROBABILITY': 1.1503494900117426
}


/**
 * @author: Pramveer
 * @date: 3rd Mar 17
 * @desc: features weight for the cost prediction
 */
const cirrhoticCostFeaturesWeight = {
    /*'INTERCEPT': 78157.223134646658,
    'GENDER_CD': -1517.0064068570998,
    'AGE': 270.12029883975788,
    'FibrosureStage': 505.92112825258857,
    'RACE_DESC': 972.27939844910031,
    'BILIRUBIN':  255.60724834274612,
    'INR_VALUE': 74663.869658318727,
    'HIV': 7810.9451477178845,
    'CREATININE': -108.84916088874957,
    'PLATELET_COUNT': 31639.647249608824,
    'AST': -1.1946734664452379,
    'ALT': -2.2700229627953377,
    'CHARGE_NOW': -0.38030901446472853
    */

    /**
     * @author: Pramveer
     * @date: 6th Mar 17
     * @desc: Added new features for the cost
     */

    // 'INTERCEPT': 51966.836834244459,
    // 'GENDER_CD': -923.66066234251468,
    // 'AGE': 75.098436123985621,
    // 'RACE_DESC': 2264.4112160986574,
    // 'BILIRUBIN':  4412.5998475353144,
    // 'INR_VALUE': 205.00833403631802,
    // 'CREATININE': -4.5502670847985298,
    // 'PLATELET_COUNT': -15.81823132683463,
    // 'AST':  -31.675779799090513,
    // 'ALT':  22.505377941792979,
    // 'CHARGE_NOW': 0.51218448896998581,

    // 'INTERCEPT': 51966.83683424446,
    // 'PLATELET_COUNT': -15.81823132683463,
    // 'AST': -31.675779799090513,
    // 'BILIRUBIN': 4412.599847535314,
    // 'AGE': 75.09843612398562,
    // 'ALT': 22.50537794179298,
    // 'GENDER_CD': -923.6606623425147,
    // 'CHARGE_NOW': 0.5121844889699858,
    // 'CREATININE': -4.55026708479853,
    // 'INR_VALUE': 205.00833403631802,

    'INTERCEPT': 46223.581439368281,
    'PLATELET_COUNT': 2.9178438917056817,
    'AST': -21.260728211195197,
    'BILIRUBIN': 4125.5385631517092,
    'AGE': 137.26549002144139,
    'ALT': 15.984070064015976,
    'GENDER_CD': -2456.816568898013,
    'CHARGE_NOW': 0.36638392207009851,
    'CREATININE': -9.7930965961012824,
    'INR_VALUE': -611.95619850980211
}


/**
 * @author: Praveen
 * @date: 03/16/2017
 * @desc: Added new features for the tipping point
 */

/**
 * @author: Arvind
 * @date: 16th Mar 2017
 * @desc: features weight for the tipping point prediction
 */
const cirrhoticTippingPointFeaturesWeight = {
    'PLATELET_COUNT': 0.57587061652712856,
    'AST': -2.4019384142010152,
    'BILIRUBIN': 38.497622862947445,
    'AGE': 1.7156106896390835,
    'ALT': 1.4967258029820827,
    'INTERCEPT': 239.65657359358443,
    'DAYS_CIRRHOSIS': 0.1307327650196447,
    'CREATININE': -16.996269113111502,
    'INR_VALUE': 42.82860180401876
};

//function to get the weights for the tipping point model
export let getCirrhoticTippingPointFeaturesWeight = () => {
    return cirrhoticTippingPointFeaturesWeight;
};

//function to remove the custom patients 
export let removeCustomPatients = () => {
    customPatientsData = [];
}

//function to predict tipping point probability for the patients
export let predictCirrhoticTippingPointProbability = (patientDataObj, timeProbability) => {

    let weights = cirrhoticTippingPointFeaturesWeight;

    let probability = 0,
        result = 0;
    //mathematical equation for the logit mode

    // sum product for intercept
    result += (1 * weights.INTERCEPT);

    // sum product for Age
    result += (patientDataObj.AGE * weights.AGE);

    // sum product for BILIRUBIN
    result += (patientDataObj.BILIRUBIN * weights.BILIRUBIN);

    // sum product for INR
    result += (patientDataObj.INR_VALUE * weights.INR_VALUE);

    // sum product for CREATININE
    result += (patientDataObj.CREATININE * weights.CREATININE);

    // sum product for PLATELET_COUNT
    result += (patientDataObj.PLATELET_COUNT * weights.PLATELET_COUNT);

    //sum product for ALT
    result += (patientDataObj.ALT * weights.ALT);

    //sum product for AST
    result += (patientDataObj.AST * weights.AST);

    //sum product for DAYS_CIRRHOSIS
    //DAYS_CIRRHOSIS
    //convert the time period into months instead of days
    result += (parseFloat(timeProbability) * weights.DAYS_CIRRHOSIS);

    //dummy check for absolute values
    probability = Math.abs(parseInt(result / 30));

    return probability;
};


//function to get the weights for the model
export let getCirrhoitcFeaturesWeight = () => {
    return cirrhoitcFeaturesWeight;
}

//function to set data in custom patients
export let setCustomPatientsData = (data) => {

    //check if data is null then empty the variable
    if (!data) {
        customPatientsData = [];
        return;
    }

    let patientObj = _.clone(data);

    //patientObj.race = getRaceCode(patientObj.RACE_DESC, true);
    patientObj.gender = getGenderCode(patientObj.GENDER_CD, true);
    patientObj.labs_total_bilirubin = patientObj.BILIRUBIN;
    patientObj.labs_inr = patientObj.INR_VALUE;
    //patientObj.HIV = patientObj.HIV == '1' ? 'Yes' : 'No';
    patientObj.labs_creatinine = patientObj.CREATININE;
    //patientObj.mentalHealth = patientObj.MENTAL_HEALTH;
    patientObj.labs_platelet_count = patientObj.PLATELET_COUNT;
    //patientObj.AssessmentLiverDisease = patientObj.LIVER_ASSESMENT == '1' ? 'Yes' : 'No';
    patientObj.age = patientObj.AGE;
    //patientObj.FibrosureStage = patientObj.FibrosureStage;
    patientObj.labs_ast = patientObj.AST;
    patientObj.labs_alt = patientObj.ALT;
    patientObj.costNow = patientObj.COST_NOW;


    // patientObj.labs_apri = ((patientObj.AST / 40) / patientObj.PLATELET_COUNT) * 100;
    // patientObj.labs_apri = parseFloat(parseFloat(patientObj.labs_apri).toFixed(2));
    // patientObj.labs_meld = 10 * ((0.957 * Math.log(patientObj.CREATININE)) + (0.378 * Math.log(patientObj.BILIRUBIN)) + (1.12 * Math.log(patientObj.INR_VALUE))) + 6.43;
    // patientObj.labs_meld = parseFloat(parseFloat(patientObj.labs_meld).toFixed(2));
    patientObj.FibrosureScore = (patientObj.AGE * patientObj.AST) / (patientObj.PLATELET_COUNT * Math.sqrt(patientObj.ALT));
    patientObj.FibrosureStage = getFibrosisStage(patientObj.FibrosureScore);

    //added check for custom patients NAN values
    patientObj.labs_apri = ((patientObj.AST / 40) / patientObj.PLATELET_COUNT) * 100;
    patientObj.labs_apri = parseFloat(parseFloat(patientObj.labs_apri).toFixed(2));

    patientObj.labs_apri = isNaN(patientObj.labs_apri) ? 'NA' : patientObj.labs_apri;

    if ( (patientObj.CREATININE <= 0) || (patientObj.BILIRUBIN <= 0) || (patientObj.INR_VALUE <= 0)) {
        patientObj.labs_meld = 0;
    } else {
        patientObj.labs_meld = 10 * ((0.957 * Math.log(patientObj.CREATININE)) + (0.378 * Math.log(patientObj.BILIRUBIN)) + (1.12 * Math.log(patientObj.INR_VALUE))) + 6.43;
        patientObj.labs_meld = parseFloat(parseFloat(patientObj.labs_meld).toFixed(2));
    }


    // console.log(patientObj);

    customPatientsData.push(patientObj);
};
//function for fibrosis data
let getFibrosisStage = (fibro_Value) => {


    let fibroValue = parseFloat(parseFloat(fibro_Value).toFixed(2));

    if (fibroValue >= 0 && fibroValue <= 0.21)
        return "0";
    if (fibroValue >= 0.22 && fibroValue <= 0.31)
        return "1";
    if (fibroValue >= 0.32 && fibroValue <= 0.58)
        return "2";
    if (fibroValue >= 0.59 && fibroValue <= 0.73)
        return "3";
    //if (fibroValue >= 0.74 && fibroValue <= 1.00)
    if (fibroValue >= 0.74)
        return "4";
    else
        return "NA";
};

/**
 * @author: Pramveer
 * @date: 20th Feb 17
 * @desc: Change the condition to predict the time or cirrhosis based on the isTimePrediction flag
 */

//function to predict probability for the patients
export let predictCirrhoticProbability = (patientDataObj, isTimePrediction) => {
    let weights = isTimePrediction ? cirrhoticTimeFeaturesWeight : cirrhoitcFeaturesWeight;

    let probability = 0,
        result = 0;
    //mathematical equation for the logit mode

    // sum product for intercept
    result += (1 * weights.INTERCEPT);

    // sum product for gender
    // Commented by Arvind on 15-March-2017 as this feature not in used for cirrhosis model
    // result += (patientDataObj.GENDER_CD * weights.GENDER_CD);

    // sum product for Age
    result += (patientDataObj.AGE * weights.AGE);

    // sum product for Race
    // Commented by Arvind on 15-March-2017 as this feature not in used for cirrhosis model
    // result += (patientDataObj.RACE_DESC * weights.RACE_DESC);

    // sum product for Fib Stage
    // Commented by Arvind on 15-March-2017 as this feature not in used for cirrhosis model
    //  result += (patientDataObj.FibrosureStage * weights.FibrosureStage);

    // sum product for BILIRUBIN
    result += (patientDataObj.BILIRUBIN * weights.BILIRUBIN);

    // sum product for Alcohol
    result += (patientDataObj.INR_VALUE * weights.INR_VALUE);

    // sum product for Hiv
    // Commented by Arvind on 15-March-2017 as this feature not in used for cirrhosis model
    // result += (patientDataObj.HIV * weights.HIV);

    // sum product for Meld Score
    result += (patientDataObj.CREATININE * weights.CREATININE);

    // sum product for Mental health
    //Pram(14th feb 17) Commented as now we are not using this in the algo
    //result += (patientDataObj.MENTAL_HEALTH * weights.MENTAL_HEALTH);

    // sum product for Renal Failure
    result += (patientDataObj.PLATELET_COUNT * weights.PLATELET_COUNT);

    // sum product for Liver Assessment
    //Pram(14th feb 17) Commented as now we are not using this in the algo
    //result += (patientDataObj.LIVER_ASSESMENT * weights.LIVER_ASSESMENT);

    //sum product for AST
    result += (patientDataObj.ALT * weights.ALT);

    //sum product for AST
    result += (patientDataObj.AST * weights.AST);

    //check if the type is time prediction
    if (isTimePrediction) {
        //convert the time period into months instead of days
        result += (parseFloat(isTimePrediction) * weights.CIRRHOTIC_PROBABILITY);

        //dummy check for absolute values
        probability = Math.abs(parseInt(result / 30));
    } else {
        //bound the probability to be between 0 - 1 (as the logit model use the ln values)
        probability = Math.exp(result) / (1 + Math.exp(result));
    }

    return probability;
}


//function to predict the cost after for patient
export let predictCirrhoticCost = (patientDataObj) => {
    let weights = cirrhoticCostFeaturesWeight;

    let result = 0;

    // sum product for intercept
    result += (1 * weights.INTERCEPT);

    // sum product for gender
    result += (patientDataObj.GENDER_CD * weights.GENDER_CD);

    // sum product for Age
    result += (patientDataObj.AGE * weights.AGE);

    // sum product for Race
    //result += (patientDataObj.RACE_DESC * weights.RACE_DESC);

    // sum product for Fib Stage
    // Commented by Arvind on 15-March-2017 as this feature not in used for cirrhosis model
    //result += (patientDataObj.FibrosureStage * weights.FibrosureStage);

    // sum product for BILIRUBIN
    result += (patientDataObj.BILIRUBIN * weights.BILIRUBIN);

    // sum product for Alcohol
    result += (patientDataObj.INR_VALUE * weights.INR_VALUE);

    // sum product for Hiv
    // Commented by Arvind on 15-March-2017 as this feature not in used for cirrhosis model
    // result += (patientDataObj.HIV * weights.HIV);

    // sum product for Meld Score
    result += (patientDataObj.CREATININE * weights.CREATININE);

    // sum product for Renal Failure
    result += (patientDataObj.PLATELET_COUNT * weights.PLATELET_COUNT);

    //sum product for AST
    result += (patientDataObj.ALT * weights.ALT);

    //sum product for AST
    result += (patientDataObj.AST * weights.AST);

    //sum product for CHARGE
    //result += (patientDataObj.COST_NOW * weights.CHARGE_NOW);

    return result;
}

//function to set cirrhotic value slider
export let setProbRangeSliderValue = (value) => {
    probRangeSliderValue = value ? value : 45;
}

//function to set the time slider value
export let setTimeRangeSliderValue = (value) => {
    timeRangeSliderValue = value ? value : 10;
}

//function to refine the patients patientDataObj
export let refinePatientData = (patientDataObj) => {
    let preparedObj = _.clone(patientDataObj);

    preparedObj.GENDER_CD = getGenderCode(patientDataObj.gender);
    //preparedObj.RACE_DESC = getRaceCode(patientDataObj.race);
    preparedObj.BILIRUBIN = parseFloat(patientDataObj.labs_total_bilirubin);
    preparedObj.INR_VALUE = parseInt(patientDataObj.labs_inr);
    //// Commented by Arvind on 15-March-2017 as this feature not in used for cirrhosis model
    // preparedObj.HIV = patientDataObj.HIV == 'Yes' ? 1 : 0;
    preparedObj.CREATININE = parseFloat(patientDataObj.labs_creatinine);
    //preparedObj.MENTAL_HEALTH = parseInt(patientDataObj.mentalHealth);
    preparedObj.PLATELET_COUNT = parseInt(patientDataObj.labs_platelet_count);
    //preparedObj.LIVER_ASSESMENT = patientDataObj.AssessmentLiverDisease == 'Yes' ? 1 : 0;
    preparedObj.AGE = patientDataObj.age;
    preparedObj.AST = patientDataObj.labs_ast;
    preparedObj.ALT = patientDataObj.labs_alt;
    preparedObj.COST_NOW = patientDataObj.costNow;

    return preparedObj;
}

//function to refine gender by name/code
let getGenderCode = (val, isByCode) => {
    let genderStore = [{
            index: 0,
            name: 'F'
        },
        {
            index: 1,
            name: 'M'
        },
        {
            index: 2,
            name: 'U'
        }
    ];

    let value = '';

    //check if is Name is to be returned instead of code
    if (isByCode) {
        value = _.where(genderStore, {
            index: val
        })[0].name;
    } else {
        value = _.where(genderStore, {
            name: val
        })[0].index;
    }

    return value;
}

//function to refine race by name/code
let getRaceCode = (val, isByCode) => {
    let raceStore = [{
            index: 0,
            name: 'AFRICAN AMERICAN'
        },
        {
            index: 1,
            name: 'CAUCASIAN'
        },
        {
            index: 2,
            name: 'UNKNOWN'
        },
        {
            index: 3,
            name: 'ASIAN'
        },
        {
            index: 4,
            name: 'OTHER'
        },
        {
            index: 5,
            name: 'HISPANIC'
        },
    ];

    let value = '';

    //check if is Name is to be returned instead of code
    if (isByCode) {
        value = _.where(raceStore, {
            index: val
        })[0].name;
    } else {
        value = _.where(raceStore, {
            name: val
        })[0].index;
    }

    return value;
}


//function to plot the probability chart
export let plotProbabilityChart = (container, baseData, isInitialLoad) => {

    let isEmptyData = (baseData.length == 0 && customPatientsData.length == 0);

    if (isEmptyData) {
        let html = `No data found for chart as the selected cohort is already cirrhotic. To predict the probability choose add new patient.`;
        $('#' + container).html('<div style="text-align:center;color:red;padding:60px;">' + html + '</div>');
        return;
    }

    let canvasHeight = 500,
        canvasWidth = 1000;

    let scatterData = {
        cohortData: prepareScatterData(baseData),
        customData: prepareScatterData(customPatientsData)
    };

    //set the chart data
    cirrhoiticChartData = scatterData;

    //prepare object for the params
    let chartObj = {
        height: canvasHeight,
        width: canvasWidth,
        chartData: scatterData,
        container: container
    };

    plotScatterChart(chartObj, isInitialLoad);


}

//function to plot the probability chart extension method
export let plotProbabilityChartExtension = ({
    container,
    baseData,
    isInitialLoad,
    modelName
}) => {

    let isEmptyData = (baseData.length == 0 && customPatientsData.length == 0);

    if (isEmptyData) {
        let html = `No data found for chart as the selected cohort is already cirrhotic. To predict the probability choose add new patient.`;
        $('#' + container).html('<div style="text-align:center;color:red;padding:60px;">' + html + '</div>');
        return;
    }

    let canvasHeight = 500,
        canvasWidth = 1000;

    let scatterData = {
        cohortData: prepareScatterDataExtension({
            baseData: baseData,
            modelName: modelName
        }),
        customData: prepareScatterDataExtension({
            baseData: customPatientsData,
            modelName: modelName
        })
    };

    //set the chart data
    cirrhoiticChartData = scatterData;

    let dataforoverlap = scatterData.cohortData;

    scatterData.overlapData = getOverlapDataForPatients(dataforoverlap);

    //remove the overlapped data from the real data
    //scatterData.cohortData = _.difference(dataforoverlap,scatterData.overlap);
    scatterData.cohortData = removeObjectsFromArray(dataforoverlap, scatterData.overlapData, 'patientId');

    //prepare object for the params
    let chartObj = {
        height: canvasHeight,
        width: canvasWidth,
        chartData: scatterData,
        container: container
    };


    plotScatterChartExtension({
        chartObj: chartObj,
        isInitialLoad: isInitialLoad,
        modelName: modelName
    });

}


//function to prepare scatter chart data
let prepareScatterData = (baseData) => {
        /**
         * @Author: Pramveer (14th Feb 17)
         * @Desc: Removed the raw data concept as now we can pass the json to highchart
         */
        let chartData = [];

        //check for blank data
        if (!baseData.length) {
            return chartData;
        }

        //loop for data points
        for (let i = 0; i < baseData.length; i++) {
            let json = _.clone(baseData[i]),
                rawJson = {},
                probData = [],
                refinedPatient = refinePatientData(baseData[i]);

            json.probability = predictCirrhoticProbability(refinedPatient) * 100;

            //added time frame for being cirrhotic
            json.timePeriod = predictCirrhoticProbability(refinePatientData(baseData[i]), json.probability);
            //json.timePeriod = parseInt(Math.random() * (30 - 2) + 2);

            //consider patient cirrhotic by plotBands range / range slider value
            json.isCirrhotic = parseInt(json.probability) >= probRangeSliderValue ? 'Yes' : 'No';

            /**
             * @author: Arvind
             * @reviewer:
             * @date: 16 March 2017
             * @desc:  Added new property for storing tippingPointProbability
             */
            json.tippingPointProbability = predictCirrhoticTippingPointProbability(refinePatientData(baseData[i]), json.timePeriod);


            // let costObj = getCirrhoticCostForPatient(baseData[i], json.isCirrhotic);
            // json.cost = costObj.todayCost;
            // json.afterCost = costObj.afterCost;

            let cirrhoticTodayCost = refinedPatient.COST_NOW;
            let cirrhoticAfterCost = predictCirrhoticCost(refinedPatient);

            //dummy check to make after cost always high
            if (cirrhoticTodayCost > cirrhoticAfterCost) {
                let tempCost = cirrhoticAfterCost;
                cirrhoticAfterCost = cirrhoticTodayCost;
                cirrhoticTodayCost = tempCost;
            }

            json.cost = json.isCirrhotic == 'Yes' ? cirrhoticAfterCost : cirrhoticTodayCost;
            json.afterCost = json.isCirrhotic == 'Yes' ? cirrhoticTodayCost : cirrhoticAfterCost;

            //push the x-axis data
            json.x = json.probability;

            //push the y-axis data
            json.y = json.cost;


            //check for time slider
            if (json.timePeriod > timeRangeSliderValue) {
                json.y = null;
            }

            //push the chart data
            chartData.push(json);

        }

        return chartData;
    }
    //function to prepare scatter chart data extension method
let prepareScatterDataExtension = ({
    baseData,
    modelName
}) => {
    /**
     * @Author: Pramveer (14th Feb 17)
     * @Desc: Removed the raw data concept as now we can pass the json to highchart
     */
    let chartData = [];

    //check for blank data
    if (!baseData.length) {
        return chartData;
    }

    //loop for data points
    for (let i = 0; i < baseData.length; i++) {
        let json = _.clone(baseData[i]),
            rawJson = {},
            probData = [],
            refinedPatient = refinePatientData(baseData[i]);

        json.probability = predictCirrhoticProbability(refinedPatient) * 100;

        //added time frame for being cirrhotic
        json.timePeriod = predictCirrhoticProbability(refinePatientData(baseData[i]), json.probability);
        //json.timePeriod = parseInt(Math.random() * (30 - 2) + 2);

        //consider patient cirrhotic by plotBands range / range slider value
        json.isCirrhotic = parseInt(json.probability) >= probRangeSliderValue ? 'Yes' : 'No';

        /**
         * @author: Arvind
         * @reviewer:
         * @date: 16 March 2017
         * @desc:  Added new property for storing tippingPointProbability
         */
        json.tippingPointProbability = predictCirrhoticTippingPointProbability(refinePatientData(baseData[i]), json.timePeriod);

        // let costObj = getCirrhoticCostForPatient(baseData[i], json.isCirrhotic);
        // json.cost = costObj.todayCost;
        // json.afterCost = costObj.afterCost;

        let cirrhoticTodayCost = refinedPatient.COST_NOW;
        let cirrhoticAfterCost = predictCirrhoticCost(refinedPatient);

        //dummy check to make after cost always high
        if (cirrhoticTodayCost > cirrhoticAfterCost) {
            let tempCost = cirrhoticAfterCost;
            cirrhoticAfterCost = cirrhoticTodayCost;
            cirrhoticTodayCost = tempCost;
        }

        json.cost = json.isCirrhotic == 'Yes' ? cirrhoticAfterCost : cirrhoticTodayCost;
        json.afterCost = json.isCirrhotic == 'Yes' ? cirrhoticTodayCost : cirrhoticAfterCost;

        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 12-Apr-2017
         * @desc: set X,Y point based on model used 
         * For Tipping point and circle of center of cluster model we plot y axis as tipping point
         */
        //// Below condition will further improved based on code reusability
        // set chart plotting based on modelName 
        //push the x-axis data
        json.x = json.probability;
        //push the y-axis data

        if (modelName && (modelName === "tipping-point")) {
            json.y = json.tippingPointProbability;
        } else {
            json.y = json.cost;
        }



        //check for time slider
        if (json.timePeriod > timeRangeSliderValue) {
            json.y = null;
        }

        //push the chart data
        chartData.push(json);

    }
    
    return chartData;
}


//function to plot the scatter chart
let plotScatterChart = (chartObj, isInitialLoad) => {
    //console.log(chartObj.chartData);

    // options - see http://api.highcharts.com/highcharts
    //added max value praveen on 11 April 2017
    let maxValue = 100;
    if (probRangeSliderValue > 90 && probRangeSliderValue < 140) {
        maxValue = 140;
    } else if (probRangeSliderValue > 140) {
        maxValue = Math.round(1.5 * probRangeSliderValue);
    }

    let chart = new Highcharts.chart(chartObj.container, {
            chart: {
                zoomType: 'xy',
                height: chartObj.height - 50,
                // width: chartObj.width,
            },
            title: {
                text: ''
            },

            subtitle: {
                text: 'Click and drag to zoom in.'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Probability'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true,
                min: 0,
                max: maxValue,
                plotBands: [{
                        from: 0,
                        to: probRangeSliderValue,
                        color: '#EFFFFF',
                        label: {
                            text: `Probability < ${probRangeSliderValue}`,
                            style: {
                                color: '#999999'
                            },
                            y: 20
                        }
                    },
                    {
                        from: probRangeSliderValue,
                        to: 140,
                        color: '#FFEFFF',
                        label: {
                            text: `Probability > ${probRangeSliderValue}`,
                            style: {
                                color: '#999999'
                            },
                            y: 20
                        }
                    }
                ],
                //show the connecting line on hover
                crosshair: {
                    width: 2,
                    dashStyle: 'ShortDot'
                }
            },
            yAxis: {
                title: {
                    text: 'Cost Today'
                },
                //show the connecting line on hover
                crosshair: {
                    width: 2,
                    dashStyle: 'ShortDot'
                },
                labels: {
                    formatter: function() {
                        //console.log(this);
                        if (this.value)
                            return autoFormatCostValue(this.value);
                    }
                }
            },
            tooltip: {
                useHTML: true,
                followPointer: false,
                hideDelay: 30,
                formatter: function() {
                    //console.log(this);
                    let filteredData = this.point;

                    let todayCost = parseFloat(this.y).toFixed(2),
                        afterCost = parseFloat(filteredData.afterCost).toFixed(2);

                    //if the patient is considered cirrhotic by slider value then swap the values
                    if (filteredData.isCirrhotic == 'Yes') {
                        let temp = todayCost;
                        todayCost = afterCost;
                        afterCost = temp;
                    }

                    let toottipHtml = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip">
                                        <div class="relativeValueChartTooltip-Body" style="width:270px;">
                                            <div class="tooltip-DrugName">Patient: ${parseInt(filteredData.patientId)}</div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Probability: </div>
                                                <div class="col-md-6 tooltip-SectionValue">${parseFloat(this.x).toFixed(2)}%</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Time : </div>
                                                <div class="col-md-6 tooltip-SectionValue">${filteredData.tippingPointProbability >filteredData.timePeriod  ?filteredData.tippingPointProbability :filteredData.timePeriod} Months</div>
                                            </div>
                                             <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Tipping Point : </div>
                                                <div class="col-md-6 tooltip-SectionValue">${filteredData.tippingPointProbability >filteredData.timePeriod  ?filteredData.timePeriod :filteredData.tippingPointProbability} Months</div>
                                            </div>
                                            <div class="costDataWrapper">
                                                <div class="tooltip-Section">
                                                    <div class="col-md-6 tooltip-SectionLabel">Cost Today: </div>
                                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(parseInt(todayCost))}</div>
                                                </div>
                                                <div class="tooltip-Section">
                                                    <div class="col-md-6 tooltip-SectionLabel">Cost After: </div>
                                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(parseInt(afterCost))}</div>
                                                </div>
                                            </div>

                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">Age: </div>
                                                <div class="tooltip-SectionValue">${filteredData.age}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">Gender: </div>
                                                <div class="tooltip-SectionValue">${filteredData.gender}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">APRI: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_apri).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">MELD Score: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_meld).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">INR: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_inr).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">CREATININE : </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_creatinine).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">PLATELET COUNT: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_platelet_count).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">BILIRUBIN: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_total_bilirubin).toFixed(2)}</div>
                                            </div>
                                                <!-- Commented old tooltip by Arvind on 15-March-2017 -->
                                          <!--   <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">HIV: </div>
                                                <div class="tooltip-SectionValue">${filteredData.HIV}</div>
                                            </div>-->
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">FIB Stage: </div>
                                                <div class="tooltip-SectionValue">${filteredData.FibrosureStage}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">ALT: </div>
                                                <div class="tooltip-SectionValue">${filteredData.labs_alt}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">AST: </div>
                                                <div class="tooltip-SectionValue">${filteredData.labs_ast}</div>
                                            </div>
                                        </div>
                                    </div>`;

                    return toottipHtml;
                }
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 8,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                },
                series: {
                    turboThreshold: 0,
                    //Pram (03 Apr 17) : Tooltip issue fix 
                    // http://api.highcharts.com/highcharts/plotOptions.series.stickyTracking
                    stickyTracking: true
                }
            },
            series: [{
                    name: 'Cohort Patients',
                    type: 'scatter',
                    color: 'rgba(119, 152, 191, 0.8)',
                    //data: [ [170.2, 62.3], [177.8, 82.7], [179.1, 79.1], [190.5, 98.2], [177.8, 84.1] ]
                    data: chartObj.chartData.cohortData,
                },

                {
                    name: 'Custom Patients',
                    type: 'scatter',
                    color: 'rgba(218, 93, 65, 0.8)',
                    data: chartObj.chartData.customData,
                }
            ]
        },
        function(chart) {
            // if (isInitialLoad) {
            //     updateTimeSlider(chartObj.chartData);
            //     $('#cirrhoticTime-Slider').trigger('change');
            // }
            // getPatientCount(chartObj.chartData);
        });

    //assign the chart object to the global accessible object to access it outside
    probabilityChartObj = chart;
}

//function to plot the scatter chart for extention model
let plotScatterChartExtension = ({
        chartObj,
        isInitialLoad,
        modelName
    }) => {
        console.log(chartObj.chartData);


        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 13-Apr-2017
         * @desc: Extend original chartobj for cohort patient and add circle as center of cluster
         * in centerOfClusterData method one extra property 'chartObj.chartData.centerOfCluster' added
         */
        let seriesData = [];
        //extend chart object based on modelName
        if (modelName && modelName === "tipping-point") {

            //drawScatterChart method call inside function 
            prepareKMeansClusterData({
                chartObj: chartObj,
                isInitialLoad: isInitialLoad,
                modelName: modelName
            });
        } else {

            //Prepare seriesData object for default model
            // seriesData = [{
            //         name: 'Cohort Patients',
            //         type: 'scatter',
            //         color: 'rgba(119, 152, 191, 0.8)',
            //         //data: [ [170.2, 62.3], [177.8, 82.7], [179.1, 79.1], [190.5, 98.2], [177.8, 84.1] ]
            //         data: chartObj.chartData.cohortData,
            //     },

            //     {
            //         name: 'Custom Patients',
            //         type: 'scatter',
            //         color: 'rgba(218, 93, 65, 0.8)',
            //         data: chartObj.chartData.customData,
            //     },
            //     {
            //         name: 'Overlapped Patients',
            //         type: 'scatter',
            //         color: 'rgba(174, 85, 10, 0.8)',
            //         data: [ [45,254874], [80, 985741]],
            //     }
            // ];
            //Call method seprately for each model

            seriesData = [{
                    name: 'Cohort Patients',
                    type: 'scatter',
                    color: 'rgba(119, 152, 191, 0.8)',
                    data: chartObj.chartData.cohortData,
                }];

            if(chartObj.chartData.customData.length > 0) {
                seriesData.push({
                    name: 'Custom Patients',
                    type: 'scatter',
                    color: 'rgba(218, 93, 65, 0.8)',
                    data: chartObj.chartData.customData,
                });
            }

             if(chartObj.chartData.overlapData.length > 0) {
                seriesData.push({
                    name: 'Overlapped Patients',
                    type: 'scatter',
                    color: 'rgba(174, 85, 10, 0.8)',
                    data: chartObj.chartData.overlapData,
                });
            }


            drawScatterChart({
                chartObj: chartObj,
                isInitialLoad: isInitialLoad,
                modelName: modelName,
                seriesData: seriesData
            });
        }


    }
    /**
     * @author: Arvind
     * @reviewer: 
     * @date: 17-Apr-2017
     * @desc: Created new method to draw scatter chart for cirrhosis model
     */
let drawScatterChart = ({
    chartObj,
    isInitialLoad,
    modelName,
    seriesData
}) => {
    // options - see http://api.highcharts.com/highcharts
    //added max value praveen on 11 April 2017
    let maxValue = 100;
    if (probRangeSliderValue > 90 && probRangeSliderValue < 140) {
        maxValue = 140;
    } else if (probRangeSliderValue > 140) {
        maxValue = Math.round(1.5 * probRangeSliderValue);
    }
    var chart = new Highcharts.chart(chartObj.container, {
            chart: {
                //zoomType: 'xy',
                zoomType: 'x',
                height: chartObj.height - 50,
                // width: chartObj.width,
            },
            title: {
                text: ''
            },
            legend: {
                borderWidth: 1,
                title: {
                    text: (modelName === 'tipping-point' ? 'Percentage of Patients' : null)
                },
            },
            subtitle: {
                text: 'Click and drag to zoom in.'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Probability'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true,
                min: 0,
                max: maxValue,
                plotBands: [{
                        from: 0,
                        to: probRangeSliderValue,
                        color: '#EFFFFF',
                        label: {
                            text: `Probability < ${probRangeSliderValue}`,
                            style: {
                                color: '#999999'
                            },
                            y: 20
                        }
                    },
                    {
                        from: probRangeSliderValue,
                        to: 140,
                        color: '#FFEFFF',
                        label: {
                            text: `Probability > ${probRangeSliderValue}`,
                            style: {
                                color: '#999999'
                            },
                            y: 20
                        }
                    }
                ],
                //show the connecting line on hover
                crosshair: {
                    width: 2,
                    dashStyle: 'ShortDot'
                }
            },
            yAxis: {
                title: {
                    text: (modelName === 'tipping-point' ? 'Tipping Point (In Month)' : 'Cost Today')
                },
                //show the connecting line on hover
                crosshair: {
                    width: 2,
                    dashStyle: 'ShortDot'
                },
                labels: {
                    formatter: function() {
                        //console.log(this);
                        if (this.value)
                            return autoFormatCostValue(this.value);
                    }
                }
            },
            tooltip: {
                useHTML: true,
                followPointer: false,
                hideDelay: 30,
                formatter: function() {
                    //console.log(this);
                    return getTooltipForProbabilityChart(this);
                }
            },
            plotOptions: {
                scatter: {
                    cursor: 'pointer',
                    events: {
                        click: function (event) {
                            // pid to filter the data of Overlap patients
                            let pid=event.point.patientId;
                            // isClickedNeeded to check whether the drawChartOnPopup() function is needed to call or not
                            let isClickNeeded = false;
                            if(cirrhoiticChartData.overlapData.length) {
                                let filteredData = _.where(cirrhoiticChartData.overlapData, {patientId:pid});
                                isClickNeeded = filteredData.length > 0 ? true : false;
                            }
                            

                            if(isClickNeeded) {
                                drawChartOnPopup(event);
                            }
                            else {
                                return false;
                            }
                            
                        }
                    },
                    marker: {
                        radius: 8,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                },
                bubble: {
                    // minSize:100,
                    //maxSize:200,
                    minSize: '30%',
                    maxSize: '55%'
                },
                series: {
                    turboThreshold: 0,
                    //Pram (03 Apr 17) : Tooltip issue fix 
                    // http://api.highcharts.com/highcharts/plotOptions.series.stickyTracking
                    stickyTracking: false
                }
            },
            series: seriesData
        },
        function(chart) {
            // if (isInitialLoad) {
            //     updateTimeSlider(chartObj.chartData);
            //     $('#cirrhoticTime-Slider').trigger('change');
            // }
            if (isTimeSliderUpdateNeeded(isInitialLoad, chartObj.chartData)) {
                updateTimeSlider(chartObj.chartData);
                $('#cirrhoticTime-Slider').trigger('change');
            }
            getPatientCount(chartObj.chartData);
        });

    //assign the chart object to the global accessible object to access it outside
    probabilityChartObj = chart;
};

/**
 * @author: Pramveer
 * @reviewer: 
 * @date: 11-May-2017
 * @desc: Created new method to check whether need to update the time slider or not
 */
let isTimeSliderUpdateNeeded = (initLoad, dataObj) => {
    //if the chart is initailly loaded then slider needs to be updated
    if (initLoad) {
        return true;
    }

    if (dataObj.customData) {
        let currentMaxValue = parseInt($('#cirrhoticTime-Slider').attr('max'));
        let maxCustomTime = _.max(_.pluck(dataObj.customData, 'timePeriod'));

        //if the time period for new custom patient is max then current time range then it needs to be updated
        if (maxCustomTime > currentMaxValue) {
            setTimeout(() => {
                $('#cirrhoticTime-Slider').rangeslider('update', true); //set the update property of slider to true
            }, 100);
            return true;
        }
    }
}


//function to get Cirrhotic Cost as per patient data
export let getCirrhoticCostForPatient = (patientDataObj, isPatientCirrhotic) => {
    let costBaseData = CostModelData.reactive(),
        filteredData = [];



    //filter cost Data on age group
    filteredData = _.filter(costBaseData, (rec) => {
        let minAge = rec.BRTH_YR_NBR.split('-')[0],
            maxAge = rec.BRTH_YR_NBR.split('-')[1];

        return patientDataObj.age >= parseInt(minAge) && patientDataObj.age < maxAge;
    });

    let filterObj = {
        GENDER_CD: patientDataObj.gender,
        BILIRUBIN: patientDataObj.labs_total_bilirubin,
        CREATININE: patientDataObj.labs_creatinine,
        INR_VALUE: patientDataObj.labs_inr,
        PLATELET_COUNT: patientDataObj.labs_platelet_count,
        // OLD CODE commentd on 15-March-2017 by Arvind
        // INR_VALUE: patientDataObj.labs_inr == '1' ? 'Yes' : 'No',
        // PLATELET_COUNT: patientDataObj.labs_platelet_count == '1' ? 'Yes' : 'No',
        // OLD CODE END
        //Pram(14th feb 17) Commented as now we are not using this in the algo
        //MENTAL_HEALTH: patientDataObj.mentalHealth == '1' ? 'Yes' : 'No',
        //Pram(14th feb 17) Commented as now we are not using this in the algo
        //LIVER_ASSESMENT: patientDataObj.AssessmentLiverDisease,
        //CIRRHOSIS: isPatientCirrhotic
    }

    //cirrhotic today cost for patient with No Cirrhosis
    filterObj.CIRRHOSIS = 'No';
    let cirrFilteredData = _.where(filteredData, filterObj);
    let cirrhoticTodayCost = cirrFilteredData.length ? cirrFilteredData[0].CHARGE : 0;

    //cirrhotic afterwards cost for patient with Yes Cirrhosis
    filterObj.CIRRHOSIS = 'Yes';
    cirrFilteredData = _.where(filteredData, filterObj);
    let cirrhoticAfterCost = cirrFilteredData.length ? cirrFilteredData[0].CHARGE : 0;

    /**
     * @author: Pramveer
     * @date: 2nd Mar 17
     * @desc: Dummy adjust to show patients only with cost
     */

    if (parseInt(cirrhoticAfterCost) == 0 && parseInt(cirrhoticTodayCost) == 0) {
        cirrhoticTodayCost = Math.random() * (65874 - 10240) + 10240;
        cirrhoticAfterCost = Math.random() * (84751 - 12400) + 12400;
    }


    /**
     * @author: Pramveer
     * @date: 1st Mar 17
     * @desc: dummycheck to make the today cost always small as right now we've 0 cost more patients
     */
    if (cirrhoticTodayCost > cirrhoticAfterCost) {
        let tempCost = cirrhoticAfterCost;
        cirrhoticAfterCost = cirrhoticTodayCost;
        cirrhoticTodayCost = tempCost;
    }


    //swap the cost values plotting if the patient is considered cirrhotic by slider value/ plotbands
    return {
        todayCost: isPatientCirrhotic == 'Yes' ? cirrhoticAfterCost : cirrhoticTodayCost,
        afterCost: isPatientCirrhotic == 'Yes' ? cirrhoticTodayCost : cirrhoticAfterCost
    };
}


/**
 * @author: Pramveer
 * @date: 21st Feb 17
 * @desc: function to hide/show the patients based on the time frame slider value
 */

export let showPatientsWithSelectedTime = (timeValue) => {
    let chartData = cirrhoiticChartData.cohortData;

    let series = probabilityChartObj.series[0];

    if (series.data.length) {
        //loop for all points
        for (let i = 0; i < series.data.length; i++) {
            let yPoint = null;
            if (series.data[i].timePeriod >= timeValue) {
                yPoint = null;
            } else {
                let filteredData = _.where(chartData, {
                    patientId: series.data[i].patientId
                })[0];
                yPoint = filteredData.cost;
            }

            //update the point
            series.data[i].update({
                y: yPoint
            });
        }
    }
}


/**
 * @author: Pramveer
 * @date: 22nd Feb 17
 * @desc: Added function to update the time slider when the data is redendered for first time
 */
let updateTimeSlider = (scatterChartData) => {
    //get all the time data from the cohort data
    let timeArray = _.pluck(scatterChartData.cohortData, 'timePeriod');

    //if custom patients are there then also get their time frame
    if (scatterChartData.customData) {
        timeArray.push(_.pluck(scatterChartData.customData, 'timePeriod'));
        timeArray = _.flatten(timeArray);
    }

    timeArray = _.uniq(timeArray);

    //sort the array
    timeArray = timeArray.sort(function(a, b) {
        return a - b;
    });

    let minTime = timeArray[0] <= 0 ? 1 : timeArray[0],
        maxTime = timeArray[timeArray.length - 1];

    //Pram(11th May 17): Added display time for making min value 0 for time slider
    let displayMinTime = 0;

    $('#cirrhoticTime-Slider').prop('disabled', false);
    $('#cirrhoticTime-Slider').attr('min', displayMinTime); //update the slider with min value
    $('#cirrhoticTime-Slider').attr('max', maxTime); //update the slider with max value
    //$('#cirrhoticTime-Slider').val(10); //update the slider with max value
    $('#cirrhoticTime-Slider').val(Math.round((minTime + maxTime) / 2)); //update the slider with middle value

    //set the html for the indicators to show min/max sliders values
    $('.cirrhoticTimeFrame-Slider .weightslidspan0').html(displayMinTime); //update the min html value
    $('.cirrhoticTimeFrame-Slider .weightslidspan100').html(maxTime); //update the max html value
    $('.cirrhoticTimeFrame-Slider .sliderOutput').html(Math.round((minTime + maxTime) / 2) + ' Months'); //set the output value
    timeRangeSliderValue = Math.round((minTime + maxTime) / 2);

    //$('#cirrhoticTime-Slider').rangeslider('update', true); //set the update property of slider to true
}

/**
 * @author: Pramveer
 * @date: 23rd Feb 17
 * @desc: function for patient count in cirrhotic probability model
 */
let getPatientCount = (scatterChartData) => {
        let lessThan = 0,
            moreThan = 0;

        //filter data based on the time slider value
        let filterData = _.filter(scatterChartData.cohortData, (rec) => {
            return rec.timePeriod <= timeRangeSliderValue;
        });

        //Quick fix
        //filterData = _.uniq(_.pluck(filterData, 'probability'));

        //console.log(filterData.length);

        //loop for all filtered patients
        for (let i = 0; i < filterData.length; i++) {
            //increment less patients count if probability value is less than the slider value
            if (filterData[i].probability < probRangeSliderValue) {
                lessThan++;
            }
            //increment the patients count for more probability patients
            else {
                moreThan++;
            }
        }

        // for (let i = 0; i < filterData.length; i++) {
        //     //increment less patients count if probability value is less than the slider value
        //     if (filterData[i] < probRangeSliderValue) {
        //         lessThan++;
        //     }
        //     //increment the patients count for more probability patients
        //     else {
        //         moreThan++;
        //     }
        // }
        //    console.log(lessThan);
        //console.log(moreThan);
        $('#lessProbPatient_count').html(lessThan);
        $('#moreProbPatient_count').html(moreThan);
    }
    /**
     * Added by Arvind on 14-Apr-2017
     * Generate random color 
     * Reference from : http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
     * @returns 
     */
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 14-19-Apr-2017
 * @desc: Calculate cluster data based on k-means algorithm
 */
let prepareKMeansClusterData = ({
    chartObj,
    isInitialLoad,
    modelName
}) => {

    let data = chartObj.chartData.cohortData;
    // Create the data 2D-array (vectors) describing the data
    let vectors = [];
    data = _.filter(data, (rec) => { return rec.x && rec.y });
    let totalPatient = data.length;

    //Pram (11th May 17) : Added check if no patients are found from the sliders & filters
    if (totalPatient < 1) {
        return;
    }

    //prepare vector from data points
    for (let i = 0; i < data.length; i++) {
        vectors[i] = [data[i]['x'], data[i]['y']];
    }
    let seriesData = [];
    //Set size of cluster you want to prepare
    let noOfClusters = 5;
    if (noOfClusters > vectors.length) {
        noOfClusters = vectors.length;
    }
    ////ml-kmeans library based cluster calculation
    const ml_kmeans = require('ml-kmeans');
    //// initialize ml_kmeans by passing vector array and no. of cluster
    // let kmeansResult = ml_kmeans(vectors, noOfClusters,{ maxIterations : 100,
    // tolerance : 1e-4, initialization : 'random'});
    let kmeansResult = ml_kmeans(vectors, noOfClusters, {
        maxIterations: 100,
        tolerance: 1e-4
    });

    /**
      KMeansResult: Cluster identifier for each data dot and centroids with the following fields:
'clusters': Array of indexes for the clusters(Vectors).
'centroids': Array with the resulting centroids.
'iterations': Number of iterations that took to converge
     */
    console.log(kmeansResult);
    let clusterPointSeries = [];

    for (let k = 0; k < kmeansResult.centroids.length; k++) {
        if (!isNaN(kmeansResult.centroids[k].error)) {
            let clusterPoint = [];
            let vectorPatient = 0;
            for (let vector in kmeansResult.clusters) {
                // Here k is cluster number and `kmeansResult.clusters` store vector index with associated cluster.
                if (k === kmeansResult.clusters[vector]) {
                    //prepare cluster wise data point series
                    clusterPoint.push(_.findWhere(chartObj.chartData.cohortData, {
                        x: vectors[vector][0]
                    }));
                    vectorPatient++;
                }
            }
            let patientPercentage = parseFloat((vectorPatient * 100) / totalPatient).toFixed(2);
            let avgCostAfter = 0,
                avgCostToday = 0;
            let patientIdList = [];
            _.each(clusterPoint, (rec) => {
                if (rec.afterCost < rec.cost) {
                    let temp = rec.afterCost;
                    rec.afterCost = rec.cost;
                    rec.cost = temp;
                }
                patientIdList.push(rec.patientId);
                avgCostAfter += rec.afterCost;
                avgCostToday += rec.cost;
            });
            avgCostAfter = parseInt(avgCostAfter / clusterPoint.length);
            avgCostToday = parseInt(avgCostToday / clusterPoint.length);
            let avgCoseIncrease = avgCostAfter - avgCostToday;
            let percentageCostIncrease = parseFloat((avgCoseIncrease * 100) / avgCostToday).toFixed(2);
            //prepare final data series by combining cluster wise series data
            clusterPointSeries.push({
                name: 'CohortPatient' + k,
                type: 'scatter',
                showInLegend: false,
                stickyTracking: false,
                data: clusterPoint
            });
            clusterPointSeries.push({
                name: patientPercentage + '%',
                type: 'bubble',
                stickyTracking: false,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return this.key;
                    }
                },

                //  color: getRandomColor(),
                //  color:'rgba(119, 152, 191, 0.8)',
                //data: [ [170.2, 62.3], [177.8, 82.7], [179.1, 79.1], [190.5, 98.2], [177.8, 84.1] ]
                //data: clusterPoint,
                data: [{
                    x: kmeansResult.centroids[k].centroid[0],
                    y: kmeansResult.centroids[k].centroid[1],
                    z: bubbleSizeBasedOnPercentage(patientPercentage),
                    name: patientPercentage + '%',
                    avgCostAfter: avgCostAfter,
                    avgCostToday: avgCostToday,
                    avgCoseIncrease: avgCoseIncrease,
                    percentageCostIncrease: percentageCostIncrease,
                    patientCount: clusterPoint.length,
                    patientIdList: patientIdList
                }]
            });
        }
    }
    console.log(clusterPointSeries);
    //Call method seprately for each model
    drawbubbleChart({
        chartObj: chartObj,
        isInitialLoad: isInitialLoad,
        modelName: modelName,
        seriesData: clusterPointSeries
    });
};
// added by jayesh 25th april 2017
// custom function for bubble size based % of patient in cluster.
let bubbleSizeBasedOnPercentage = (percentage) => {
    if (percentage <= 20) {
        return 400;
    } else if (percentage <= 40) {
        return 450;
    } else if (percentage <= 60) {
        return 500;
    } else if (percentage <= 80) {
        return 550;
    } else if (percentage <= 100) {
        return 600;
    }
}


/**
 * @author: Jayesh
 * @reviewer: 
 * @date: 17-Apr-2017
 * @desc: Created new method to draw bubble chart for priority of prevention model.
 */
let drawbubbleChart = ({
    chartObj,
    isInitialLoad,
    modelName,
    seriesData
}) => {
    // options - see http://api.highcharts.com/highcharts
    //added max value praveen on 11 April 2017
    let maxValue = 100;
    if (probRangeSliderValue > 90 && probRangeSliderValue < 140) {
        maxValue = 140;
    } else if (probRangeSliderValue > 140) {
        maxValue = Math.round(1.5 * probRangeSliderValue);
    }
    var chart = new Highcharts.chart(chartObj.container, {
            chart: {
                //zoomType: 'xy',
                zoomType: 'x',
                height: chartObj.height - 50,
                // width: chartObj.width,
            },
            title: {
                text: ''
            },
            legend: {
                borderWidth: 1,
                title: {
                    text: (modelName === 'tipping-point' ? 'Percentage of Patients' : null)
                },
            },
            subtitle: {
                text: 'Click and drag to zoom in.'
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Probability'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true,
                min: 0,
                max: maxValue,
                plotBands: [{
                        from: 0,
                        to: probRangeSliderValue,
                        color: '#EFFFFF',
                        label: {
                            text: `Probability < ${probRangeSliderValue}`,
                            style: {
                                color: '#999999'
                            },
                            y: 20
                        }
                    },
                    {
                        from: probRangeSliderValue,
                        to: 140,
                        color: '#FFEFFF',
                        label: {
                            text: `Probability > ${probRangeSliderValue}`,
                            style: {
                                color: '#999999'
                            },
                            y: 20
                        }
                    }
                ],
                //show the connecting line on hover
                crosshair: {
                    width: 2,
                    dashStyle: 'ShortDot'
                }
            },
            yAxis: {
                title: {
                    text: (modelName === 'tipping-point' ? 'Tipping Point (In Month)' : 'Cost Today')
                },
                //show the connecting line on hover
                crosshair: {
                    width: 2,
                    dashStyle: 'ShortDot'
                },
                labels: {
                    formatter: function() {
                        //console.log(this);
                        if (this.value)
                            return autoFormatCostValue(this.value);
                    }
                }
            },
            tooltip: {
                useHTML: true,
                followPointer: false,
                hideDelay: 30,
                formatter: function() {
                    //console.log(this);
                    let filteredData = this.point;
                    let toottipHtml = ``;

                    if (filteredData.avgCostAfter) {
                        toottipHtml = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip">
                                        <div class="relativeValueChartTooltip-Body" style="width:450px">
                                            <div class="tooltip-Section" style='word-wrap: break-word;'>
                                                <div class="col-md-6 tooltip-SectionLabel"><b>${parseFloat(this.x).toFixed(2)}% probability that this ${parseFloat(filteredData.name).toFixed(2)}% of  patients will become <br />  cirrhotic in ${parseInt(this.y)} months.</b></div>
                                            </div>   
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Avg Cost Before Tipping Point : </div>
                                                <div class="col-md-6 tooltip-SectionValue">$ ${commaSeperatedNumber(filteredData.avgCostToday)}</div>
                                            </div>                                        
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Avg Cost After Tipping Point: </div>
                                                <div class="col-md-6 tooltip-SectionValue">$ ${commaSeperatedNumber(filteredData.avgCostAfter)}</div>
                                            </div>
                                             <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Increased Cost : </div>
                                                <div class="col-md-6 tooltip-SectionValue">$ ${commaSeperatedNumber(filteredData.avgCoseIncrease)} (${filteredData.percentageCostIncrease}%)</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Patient Count : </div>
                                                <div class="col-md-6 tooltip-SectionValue"> ${commaSeperatedNumber(filteredData.patientCount)}</div>
                                            </div>
                                        </div>
                        </div>`;
                    } else {
                        toottipHtml = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip">
                                        <div class="relativeValueChartTooltip-Body" style="width:270px;">
                                            <div class="tooltip-DrugName">Patient: ${parseInt(filteredData.patientId)}</div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Probability: </div>
                                                <div class="col-md-6 tooltip-SectionValue">${parseFloat(this.x).toFixed(2)}%</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Time : </div>
                                                <div class="col-md-6 tooltip-SectionValue">${filteredData.tippingPointProbability >filteredData.timePeriod  ?filteredData.tippingPointProbability :filteredData.timePeriod} Months</div>
                                            </div>
                                             <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Tipping Point : </div>
                                                <div class="col-md-6 tooltip-SectionValue">${filteredData.tippingPointProbability >filteredData.timePeriod  ?filteredData.timePeriod :filteredData.tippingPointProbability} Months</div>
                                            </div>
                                            <div class="costDataWrapper">
                                                <div class="tooltip-Section">
                                                    <div class="col-md-6 tooltip-SectionLabel">Cost Today: </div>
                                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(parseInt(filteredData.cost))}</div>
                                                </div>
                                                <div class="tooltip-Section">
                                                    <div class="col-md-6 tooltip-SectionLabel">Cost After: </div>
                                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(parseInt(filteredData.costNow))}</div>
                                                </div>
                                            </div>

                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">Age: </div>
                                                <div class="tooltip-SectionValue">${filteredData.age}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">Gender: </div>
                                                <div class="tooltip-SectionValue">${filteredData.gender}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">APRI: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_apri).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">MELD Score: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_meld).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">INR: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_inr).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">CREATININE : </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_creatinine).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">PLATELET COUNT: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_platelet_count).toFixed(2)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">BILIRUBIN: </div>
                                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_total_bilirubin).toFixed(2)}</div>
                                            </div>
                                                <!-- Commented old tooltip by Arvind on 15-March-2017 -->
                                          <!--   <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">HIV: </div>
                                                <div class="tooltip-SectionValue">${filteredData.HIV}</div>
                                            </div>-->
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">FIB Stage: </div>
                                                <div class="tooltip-SectionValue">${filteredData.FibrosureStage}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">ALT: </div>
                                                <div class="tooltip-SectionValue">${filteredData.labs_alt}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">AST: </div>
                                                <div class="tooltip-SectionValue">${filteredData.labs_ast}</div>
                                            </div>
                                        </div>
                                    </div>`;
                    }
                    return toottipHtml;
                }
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 8,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                },
                bubble: {
                    // minSize:100,
                    //maxSize:200,
                    minSize: '20%',
                    maxSize: '45%'
                },
                series: {
                    turboThreshold: 0,
                    //Pram (03 Apr 17) : Tooltip issue fix 
                    // http://api.highcharts.com/highcharts/plotOptions.series.stickyTracking
                    // stickyTracking: true,
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function() {
                                if (this.avgCostAfter) {
                                    let inteventionChart = {},
                                        clusterData = {};
                                    inteventionChart.container = 'interventionChartContent';
                                    //inteventionChart.seriesData = seriesData;
                                    clusterData.avgCostToday = this.avgCostToday;
                                    clusterData.avgCostAfter = this.avgCostAfter;
                                    clusterData.avgCoseIncrease = this.avgCoseIncrease;
                                    clusterData.name = this.name;
                                    clusterData.percentageCostIncrease = this.percentageCostIncrease;
                                    clusterData.patientCount = this.patientCount;
                                    inteventionChart.clusterData = clusterData;
                                    inteventionChart.chartData = [{
                                            type: 'arearange',
                                            dashStyle: 'LongDash',
                                            stickyTracking: false,
                                            'stroke-width': 5,
                                            stroke: 'black',
                                            //  clusterData:clusterData,
                                            data: [
                                                [this.avgCostToday, this.avgCostToday],
                                                [this.avgCostToday, this.avgCostAfter]
                                            ]
                                        }]
                                        // inteventionChart.yMin = -100000;
                                    inteventionChart.yMin = -25000;
                                    // inteventionChart.yMax = 700000;
                                    $('#interventionBack').show();
                                    $('#interventionChartContent').show();
                                    $('#tippingPointChartContent').hide();
                                    renderInterventionDrillDownChart(inteventionChart);
                                }
                            }
                        }
                    }
                }
            },
            series: seriesData
        },
        function(chart) {
            // if (isInitialLoad) {
            //     updateTimeSlider(chartObj.chartData);
            //     $('#cirrhoticTime-Slider').trigger('change');
            // }
            // getPatientCount(chartObj.chartData);
        });

    //assign the chart object to the global accessible object to access it outside
    probabilityChartObj = chart;
};


//function to render intervention chart
let renderInterventionDrillDownChart = (baseChartObj) => {
    let chartDataObj = getInterventionData(baseChartObj);
    let dataLabelCount = 1;
    Highcharts.chart(baseChartObj.container, {
        chart: {
            // type: 'bubble',
            plotBorderWidth: 1,
            // height: baseChartObj.chartHeight,
            // zoomType: 'xy'
        },
        legend: {
            enabled: false
        },
        title: {
            text: null
        },
        subtitle: {
            text: ' '
        },
        xAxis: {
            min: -1.5,
            max: 2.5,
            // categories: [-5, 5],
            //  gridLineWidth: 1,
            //tickPositions: [-1, 1],
            title: {
                // text: 'Tipping Point (In Month)'
                text: null,
            },
            labels: {
                format: '{value}',
                enabled: false
            },
            plotBands: chartDataObj.xPlotBands,
            plotLines: chartDataObj.xPlotLines
        },

        yAxis: {
            min: chartDataObj.yMin,
            //  max: chartDataObj.yMax,
            // reversed: true,
            startOnTick: false,
            endOnTick: false,
            title: {
                text: 'Average Cost'
            },
            labels: {
                format: '${value}'
            },
            maxPadding: 0.2,
            plotBands: chartDataObj.yPlotBands,
            plotLines: chartDataObj.yPlotLines,
        },

        tooltip: {
            useHTML: true,
            formatter: function() {
                //console.log(this);
                let filteredData = baseChartObj.clusterData;
                let toottipHtml = ``;

                if (filteredData.avgCostAfter) {
                    toottipHtml = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip">
                                        <div class="relativeValueChartTooltip-Body" style="width:450px">
                                            <div class="tooltip-Section" style='word-wrap: break-word;'>
                                                <div class="col-md-6 tooltip-SectionLabel">
                                                <b>${filteredData.name} probability that there will be a ${parseFloat(filteredData.percentageCostIncrease).toFixed(2)} % jump in estimated <br/> care cost for this ${parseFloat(filteredData.name).toFixed(2)} % of 
												patients if some type of intervention <br/>is not made.</b>
                                            </div>
                                             <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Avg Cost Before Tipping Point : </div>
                                                <div class="col-md-6 tooltip-SectionValue">$ ${commaSeperatedNumber(filteredData.avgCostToday)}</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Avg Cost After Tipping Point: </div>
                                                <div class="col-md-6 tooltip-SectionValue">$ ${commaSeperatedNumber(filteredData.avgCostAfter)}</div>
                                            </div>
                                             <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Increased Cost : </div>
                                                <div class="col-md-6 tooltip-SectionValue">$ ${commaSeperatedNumber(filteredData.avgCoseIncrease)} (${filteredData.percentageCostIncrease}%)</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Patient Count : </div>
                                                <div class="col-md-6 tooltip-SectionValue"> ${commaSeperatedNumber(filteredData.patientCount)}</div>
                                            </div>
                                        </div>
                        </div>`;
                }
                return toottipHtml;
            },
            //   followPointer: false,
            //  hideDelay: 30
        },

        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        let label = '';
                        if (dataLabelCount <= 2) {
                            label = '$ ' + commaSeperatedNumber(this.y);
                            dataLabelCount++;
                        }
                        return label;
                    }
                }
            }
        },

        series: chartDataObj.chartData
    });
}

//function to prepare chart data for intervent chart
let getInterventionData = (chartDataObj) => {
    let finalObj = chartDataObj;
    finalObj.chartHeight = 600;

    finalObj.xPlotBands = [

    ];

    finalObj.yPlotBands = [

    ];

    finalObj.xPlotLines = [{
        color: 'red',
        width: 2,
        value: 0.5
    }, {
        color: 'transaprent',
        dashStyle: 'dot',
        width: 2,
        value: -10,
        label: {
            enabled: false,
            rotation: 0,
            x: 0,
            y: -10,
            style: {
                fontStyle: 'italic',
                fontWeight: 'bold'
            },
            text: ''
        },
        zIndex: 3
    }, {
        color: 'transaprent',
        dashStyle: 'dot',
        width: 2,
        value: -1.5,
        label: {
            rotation: 0,
            x: 0,
            y: 500 - 120, //chartheight - 120
            style: {
                fontStyle: 'italic',
                fontWeight: 'bold'
            },
            text: 'Cost Before Tipping Point'
        },
        zIndex: 3
    }];

    finalObj.yPlotLines = [{
        color: 'red',
        width: 2,
        value: 0
    }, {
        color: 'tranparent',
        dashStyle: 'dot',
        width: 2,
        // value: finalObj.yMax, //yMax instead of yMin because we've inverted the Y axis for Optimal Point
        label: {
            enabled: false,
            align: 'right',
            style: {
                fontStyle: 'italic',
                fontWeight: 'bold'
            },
            text: '',
            x: 10,
            y: -10
        },
        zIndex: 3
    }, {
        color: 'tranparent',
        dashStyle: 'dot',
        width: 2,
        value: finalObj.yMin, //yMin instead of yMax because we've inverted the Y axis for Optimal Point
        label: {
            align: 'right',
            style: {
                fontStyle: 'italic',
                fontWeight: 'bold'
            },
            text: 'Cost After Tipping Point',
            x: 0,
            y: 14
        },
        zIndex: 3
    }];
    return finalObj;
}

/**
 * @author: Pramveer
 * @date: 16-May-2017
 * @desc: function to get the tooltip structure for the probability chart
 */
let getTooltipForProbabilityChart = (currPoint) => {

    let currentOverlapPats = 2;
    if(currPoint.series.name == 'Overlapped Patients') {
		let filterData = _.where(cirrhoiticChartData.overlapData ,{x: currPoint.x});
        currentOverlapPats = filterData.length;
		
        let html = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip">
                        <div>
                            There are ${currentOverlapPats} overlapped patients. <br/>
                            Click to see the patients.
                        </div>
                    </div>`;

        return html;
    }

    let filteredData = currPoint.point;

    let todayCost = parseFloat(currPoint.y).toFixed(2),
        afterCost = parseFloat(filteredData.afterCost).toFixed(2);

    //if the patient is considered cirrhotic by slider value then swap the values
    if (filteredData.isCirrhotic == 'Yes') {
        let temp = todayCost;
        todayCost = afterCost;
        afterCost = temp;
    }

    let toottipHtml = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip">
                        <div class="relativeValueChartTooltip-Body" style="width:270px;">
                            <div class="tooltip-DrugName">Patient: ${parseInt(filteredData.patientId)}</div>
                            <div class="tooltip-Section">
                                <div class="col-md-6 tooltip-SectionLabel">Probability: </div>
                                <div class="col-md-6 tooltip-SectionValue">${parseFloat(filteredData.probability).toFixed(2)}%</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="col-md-6 tooltip-SectionLabel">Time : </div>
                                <div class="col-md-6 tooltip-SectionValue">${filteredData.tippingPointProbability >filteredData.timePeriod  ?filteredData.tippingPointProbability :filteredData.timePeriod} Months</div>
                            </div>
                                <div class="tooltip-Section">
                                <div class="col-md-6 tooltip-SectionLabel">Tipping Point : </div>
                                <div class="col-md-6 tooltip-SectionValue">${filteredData.tippingPointProbability >filteredData.timePeriod  ?filteredData.timePeriod :filteredData.tippingPointProbability} Months</div>
                            </div>
                            <div class="costDataWrapper">
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Cost Today: </div>
                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(parseInt(todayCost))}</div>
                                </div>
                                <div class="tooltip-Section">
                                    <div class="col-md-6 tooltip-SectionLabel">Cost After: </div>
                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(parseInt(afterCost))}</div>
                                </div>
                            </div>

                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">Age: </div>
                                <div class="tooltip-SectionValue">${filteredData.age}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">Gender: </div>
                                <div class="tooltip-SectionValue">${filteredData.gender}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">APRI: </div>
                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_apri).toFixed(2)}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">MELD Score: </div>
                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_meld).toFixed(2)}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">INR: </div>
                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_inr).toFixed(2)}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">CREATININE : </div>
                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_creatinine).toFixed(2)}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">PLATELET COUNT: </div>
                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_platelet_count).toFixed(2)}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">BILIRUBIN: </div>
                                <div class="tooltip-SectionValue">${parseFloat(filteredData.labs_total_bilirubin).toFixed(2)}</div>
                            </div>
                                <!-- Commented old tooltip by Arvind on 15-March-2017 -->
                            <!--   <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">HIV: </div>
                                <div class="tooltip-SectionValue">${filteredData.HIV}</div>
                            </div>-->
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">FIB Stage: </div>
                                <div class="tooltip-SectionValue">${filteredData.FibrosureStage}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">ALT: </div>
                                <div class="tooltip-SectionValue">${filteredData.labs_alt}</div>
                            </div>
                            <div class="tooltip-Section">
                                <div class="bulletPointWrap">
                                    <div class="bulletPoint"></div>
                                </div>
                                <div class="tooltip-SectionLabel">AST: </div>
                                <div class="tooltip-SectionValue">${filteredData.labs_ast}</div>
                            </div>
                        </div>
                    </div>`;

    return toottipHtml;
}

/**
 * @author: Pramveer
 * @date: 16-May-2017
 * @desc: function to show the chart for overlapped patients on the popup
 */
let drawChartOnPopup = (base) => {
    
    $('#cirrhosis-probabilityPopupChartWrapper').show();
    // overlapXVal consist the value of x axis of Overlap Patients
    let overlapXVal = base.point.x; 

    let filteredData = _.where(cirrhoiticChartData.overlapData, { x:  overlapXVal});

    let separatedDots = getRefinedOverlapPoints(filteredData);

    let color = gettingPlotBandColorForPopupChart(overlapXVal ,probRangeSliderValue);

    // getting the minimun and maximun values of PlotBand according to the Overlap Patients 
        let minXVal = Math.floor(overlapXVal - 10), 
        maxXVal = Math.floor(overlapXVal + 10);
    // checking the value and setting them if it is less than 0
    if(minXVal < 0) {
        minXVal = 0;
    }
// checking the value and setting them if it is greater than 100
    if(maxXVal > 100) {
        maxXVal = 100;
    }

    Highcharts.chart('cirrhosis-probabilityPopupChart', {
        chart: {
            type: 'scatter',
            zoomType: 'xy',
            height: 400
        },
        title: {
            text: 'Overlapped Patients'
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Probability'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            min: minXVal,
            max: maxXVal,
            plotBands: [{
                from: 0,
                to: maxXVal,
                color: color,
                label: {
                    text: `Probability < ${probRangeSliderValue}`,
                    style: {
                        color: '#999999'
                    },
                    y: 20
                }
            }],
            //show the connecting line on hover
            crosshair: {
                width: 2,
                dashStyle: 'ShortDot'
            }
        },
        yAxis: {
            title: {
                text: 'Cost Today'
            },
            //show the connecting line on hover
            crosshair: {
                width: 2,
                dashStyle: 'ShortDot'
            },
            labels: {
                formatter: function () {
                    //console.log(this);
                    if (this.value)
                        return autoFormatCostValue(this.value);
                }
            }
        },
        tooltip: {
            useHTML: true,
            followPointer: false,
            hideDelay: 30,
            formatter: function () {
                //console.log(this);
                return getTooltipForProbabilityChart(this);
            }
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x} %, ${point.y} K'
                }
            }
        },
        series: [{
            name: 'Overlap Patients',
            color: 'rgba(223, 83, 83, .5)',
            data: separatedDots
        }]
    });

}

/**
 * @author: Pramveer
 * @date: 16-May-2017
 * @desc: function to return the overlapped chart data
 */
let getOverlapDataForPatients = (baseData) => {
    let overlapData = [];

    baseData = baseData.filter(function (rec) {
        return rec.y;
    });

    for (let i = 0; i < baseData.length; i++) {
        let tempx = baseData[i].x,
            tempy = baseData[i].y

        let flag = 0; //flag to check the overlap condition

        //check for the above (x,y) values in the data 
        for (let j = 0; j < baseData.length; j++) {
            if ((baseData[j].x == tempx) && (baseData[j].y == tempy)) {
                flag++;
            }
        }

        //If the values are found more than once then need to push it in the overlap array
        if (flag > 1) {
            overlapData.push(baseData[i]);
            // i = i+2;
        }
    }
    return overlapData;
}

/**
 * @author: Pramveer
 * @date: 16-May-2017
 * @desc: function to remove objects from array
 */
let removeObjectsFromArray = (initialArray, removeArray, removekey) => {
    let defaultArray = _.clone(initialArray);
    for (var i = defaultArray.length - 1; i >= 0; i--) {
        for (var j = 0; j < removeArray.length; j++) {
            if (defaultArray[i] && (defaultArray[i][removekey] === removeArray[j][removekey])) {
                defaultArray.splice(i, 1);
            }
        }
    }
    return defaultArray;
}

/**
 * @author: Pramveer
 * @date: 17-May-2017
 * @desc: function for getting the values in same (x,y) Plotting Point
 */

let getRefinedOverlapPoints = (basicData) => {
        let baseData = jQuery.extend(true, [], basicData);
        let len = baseData.length;

        let xVal = baseData[0].x;

    for (let i = 1; i < len; i++) {
        baseData[i].x = baseData[i].x + (Math.random() * (5 - 1) +1) ;

        if(baseData[i].x >= 100)
            baseData[i].x=baseData[i].x - (Math.random() * (5 - 1) +1) ;

       // baseData[i].x = baseData[i].x + (Math.random() * 2); // add random number between 1 to 10
    }
    return baseData;
}

/**
 * @author: Pramveer
 * @date: 17-May-2017
 * @desc: function for getting the PlotBandcolor according to xValue
 */
let gettingPlotBandColorForPopupChart = (xValue,plotBands)=>{
    return xValue < plotBands ? '#EFFFFF' : '#FFEFFF';
}