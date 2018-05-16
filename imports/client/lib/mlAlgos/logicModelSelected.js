/*
    Author: Pramveer , 7th Feb 17
    Module for logistics regression model
*/

let customPatientsData = []; //variable to store the custom patients data
let CostModelData = null; //MysqlSubscription variable for cost model data
let probRangeSliderValue = 45; //default probability range slider value for cirrhotic model
let timeRangeSliderValue = 10; //default time frame range slider value for cirrhotic model
let probabilityChartObj = null; // chart object of the probability chart
let cirrhoiticChartData = null; //chart data of the probability chart

//function to call publish for cirrhotic model cost data
export let callPublishForCostModel = () => {
    //CostModelData = new MysqlSubscription('getCirrhoticModelCostData');
}


//weights for the cirrhotic probability features
const cirrhoitcFeaturesWeight = {

    'INTERCEPT': -0.46389211,
    'GENDER_CD': -0.55814593,
    'FibrosureStage': -0.01970562,
    'RACE_DESC': -0.03071107,
    'CIRRHOSIS': 3.82081724,
    'TREATMENT': 1.03436836,
    'GENOTYPE': -0.09617669,
};

/**
 * @author: Pramveer
 * @date: 20th Feb 17
 * @desc: features weight for the cirhotic time prediction
*/
//Needto get new time features for liver risk
const cirrhoticTimeFeaturesWeight = {

    'INTERCEPT': 1336.6226211818498,
    'GENDER_CD': -154.26771829814092,
    'FibrosureStage': 43.620070166153333,
    'RACE_DESC':  -38.351304227570424,
    'CIRRHOSIS': 896.92400920776709,
    'TREATMENT': 193.70962181208816,
    'GENOTYPE': -52.966968348576216,
    'CIRRHOTIC_PROBABILITY': -12.089687935415295
}


/**
 * @author: Praveen
 * @date: 6th March 17
 * @desc: features weight for the liver disease cost  prediction
*/
const liverDiseaseCostFeaturesWeight = {

    'INTERCEPT': 122000.01037958034,
    'GENDER_CD': -50617.361742063891,
    'FibrosureStage': 10646.272295955108,
    'RACE_DESC': 20841.868472527767,
    'CIRRHOSIS': 0,
    'TREATMENT': -181681.91431548164,
    'GENOTYPE': 3199.8093081206307,
    'CHARGE_NOW': -0.013842039875487353
}


//function to get the weights for the model
export let getCirrhoitcFeaturesWeight = () => {
    return cirrhoitcFeaturesWeight;
}

//function to set data in custom patients
export let setCustomPatientsData = (data) => {

    //check if data is null then empty the variable
    if(!data) {
        customPatientsData = [];
        return;
    }

    let patientObj = _.clone(data);

    patientObj.race = getRaceCode(patientObj.RACE_DESC,true);
    patientObj.gender = getGenderCode(patientObj.GENDER_CD,true);
    patientObj.cirrhosis = patientObj.CIRRHOSIS;
    patientObj.genotype = patientObj.GENOTYPE;
    patientObj.treatment = patientObj.TREATMENT;
    patientObj.FibrosureStage = patientObj.FibrosureStage;

    customPatientsData.push(patientObj);
}

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
    result += (patientDataObj.GENDER_CD * weights.GENDER_CD);

    // sum product for Race
    result += (patientDataObj.RACE_DESC * weights.RACE_DESC);

    // sum product for Cirrhosis
    result += (patientDataObj.CIRRHOSIS * weights.CIRRHOSIS);

    // sum product for Fib Stage
    result += (patientDataObj.FibrosureStage * weights.FibrosureStage);

    // sum product for genotype
    result += (patientDataObj.GENOTYPE * weights.GENOTYPE);

    // sum product for Treatment
    result += (patientDataObj.TREATMENT * weights.TREATMENT);

    //check if the type is time prediction
    if(isTimePrediction) {
        //convert the time period into months instead of days
        result += (parseFloat(isTimePrediction) * weights.CIRRHOTIC_PROBABILITY);

        probability = parseInt(result/30);
    }
    else {
        //bound the probability to be between 0 - 1 (as the logit model use the ln values)
        probability = (Math.exp(result) / (1 + Math.exp(result)))*100;
    }

    return probability;
}

/**
 * @author: Praveen
 * @date: 6th March 17
 * @desc:  Predict cost for liver disease
*/

//function to predict probability for the patients
export let predictLiverDiseaseCost = (patientDataObj) => {
    let weights = liverDiseaseCostFeaturesWeight;

    let probability = 0,
        result = 0;
    //mathematical equation for the logit mode
    //refine the data values
    patientDataObj = refinePatientData(patientDataObj);
    // sum product for intercept
    result += (1 * weights.INTERCEPT);

    // sum product for gender
    result += (patientDataObj.GENDER_CD * weights.GENDER_CD);

    // sum product for Race
    result += (patientDataObj.RACE_DESC * weights.RACE_DESC);

    // sum product for Cirrhosis
    result += (patientDataObj.CIRRHOSIS * weights.CIRRHOSIS);

    // sum product for Fib Stage
    result += (patientDataObj.FibrosureStage * weights.FibrosureStage);

    // sum product for genotype
    result += (patientDataObj.GENOTYPE * weights.GENOTYPE);

    // sum product for Treatment
    result += (patientDataObj.TREATMENT * weights.TREATMENT);

    //get probability cost
    result += (patientDataObj.costNow * weights.CHARGE_NOW);
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
    preparedObj.RACE_DESC = getRaceCode(patientDataObj.race);
    preparedObj.TREATMENT = getTreatmentCode(patientDataObj.treatment);//parseFloat(patientDataObj.treatment.toLowerCase() == 'naive'?0:1);
    preparedObj.CIRRHOSIS = getCirrhosisCode(patientDataObj.cirrhosis);//parseInt(patientDataObj.cirrhosis.toLowerCase() == 'yes'?1:0);
    preparedObj.GENOTYPE = getGenotypeCode(patientDataObj.genotype);//parseFloat(patientDataObj.genotype);
    preparedObj.FibrosureStage = patientDataObj.FibrosureStage;

    return preparedObj;
}

let getTreatmentCode = (value) =>{
  if(isNaN(parseInt(value))){
    return value.toLowerCase() == 'yes'?1:0;
  }
  else{
    return value;
  }
}
//function to refine cirrhosis code
let getCirrhosisCode = (value) =>{
  if(isNaN(parseInt(value))){
    return value.toLowerCase() == 'naive'?0:1;
  }
  else{
    return value;
  }
}

//Praveen 02/28/2017 function to refine genotype
let getGenotypeCode = (value) =>{
  let genotype = {'1a': 3, '1b': 2, '2': 1, '3': 0, '4': 4};
  return genotype.value || 0;
}

//Praveen 02/28/2017 function to refine gender by name/code
let getGenderCode = (val, isByCode) => {
    let genderStore = [
        {index: 1 , name : 'F'},
        {index: 2 , name : 'M'},
        {index: 0 , name : 'U'}
    ];

    let value = '';

    //check if is Name is to be returned instead of code
    if(isByCode) {
        value = _.where(genderStore,{index: val})[0].name;
    }
    else{
        value = _.where(genderStore,{name: val})[0].index;
    }

    return value;
}

//function to refine race by name/code
let getRaceCode = (val,isByCode) => {
    let raceStore = [
        {index: 1 , name: 'AFRICAN AMERICAN'},
        {index: 0 , name: 'CAUCASIAN'},
        {index: 2 , name: 'UNKNOWN'},
        {index: 3 , name: 'ASIAN'},
        {index: 4 , name: 'OTHER'},
        {index: 3 , name: 'HISPANIC'},
    ];

    let value = '';

    //check if is Name is to be returned instead of code
    if(isByCode) {
        value = _.where(raceStore,{index: val})[0].name;
    }
    else{
        value = _.where(raceStore,{name: val})[0].index;
    }

    return value;
}


//function to plot the probability chart
export let plotProbabilityChart = (container, baseData, isInitialLoad) => {
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
    plotScatterChart(chartObj,isInitialLoad);

}


//function to prepare scatter chart data
let prepareScatterData = (baseData) => {
    /**
     * @Author: Pramveer (14th Feb 17)
     * @Desc: Removed the raw data concept as now we can pass the json to highchart
    */
    let chartData = [];

    //check for blank data
    if(!baseData.length) {
        return chartData;
    }

    //loop for data points
    for(let i=0;i<baseData.length;i++) {
        let json = _.clone(baseData[i]),
            rawJson = {},
            probData = [];

        json.probability = predictCirrhoticProbability(refinePatientData(baseData[i]));

        //added time frame for being cirrhotic
        json.timePeriod = predictCirrhoticProbability(refinePatientData(baseData[i]), json.probability);

        //consider patient cirrhotic by plotBands range / range slider value
        json.isCirrhotic = parseInt(json.probability) >= probRangeSliderValue ? 'Yes' : 'No';

        //let costObj = getCirrhoticCostForPatient(baseData[i], json.isCirrhotic);

        json.cost = json.costNow;
        json.afterCost = predictLiverDiseaseCost(json);

        //push the x-axis data
        json.x = json.probability;

        //push the y-axis data
        json.y = json.cost;

        //check for time slider
        if(json.timePeriod > timeRangeSliderValue){
            //json.y = null;
        }

        //push the chart data
        chartData.push(json);

    }

    return chartData;
}

//function to plot the scatter chart
let plotScatterChart = (chartObj, isInitialLoad) => {
    console.log(chartObj.chartData);

    // options - see http://api.highcharts.com/highcharts
    let chart = new Highcharts.chart(chartObj.container, {
        chart: {
            zoomType: 'xy',
            height: chartObj.height - 50,
            width: chartObj.width,
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
            max: 100,
            plotBands: [
                {
                    from: 0,
                    to: probRangeSliderValue,
                    color: '#EFFFFF',
                    label: {
                        text: `Probability Less Than ${probRangeSliderValue}`,
                        style: {
                            color: '#999999'
                        },
                        y: 20
                    }
                },
                {
                    from: probRangeSliderValue,
                    to: 120,
                    color: '#FFEFFF',
                    label: {
                        text: `Probability Greater Than ${probRangeSliderValue}`,
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
                text: 'Cost'
            },
            //show the connecting line on hover
            crosshair: {
                width: 2,
                dashStyle: 'ShortDot'
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
                if(filteredData.isCirrhotic == 'Yes') {
                    let temp = todayCost;
                    todayCost = afterCost;
                    afterCost = temp;
                }

                let toottipHtml = `<div class="relativeValueChartTooltip cirrhoticProbChartTooltip">
                                        <div class="relativeValueChartTooltip-Body">
                                            <div class="tooltip-DrugName">Patient: ${parseInt(filteredData.patientId)}</div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Probability: </div>
                                                <div class="col-md-6 tooltip-SectionValue">${parseFloat(this.x).toFixed(2)}%</div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="col-md-6 tooltip-SectionLabel">Time : </div>
                                                <div class="col-md-6 tooltip-SectionValue">${Math.abs(filteredData.timePeriod)} Months</div>
                                            </div>
                                            <div class="costDataWrapper">
                                                <div class="tooltip-Section">
                                                    <div class="col-md-6 tooltip-SectionLabel">Cost Today: </div>
                                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(todayCost)}</div>
                                                </div>
                                                <div class="tooltip-Section">
                                                    <div class="col-md-6 tooltip-SectionLabel">Cost After: </div>
                                                    <div class="col-md-6 tooltip-SectionValue">$${commaSeperatedNumber(afterCost)}</div>
                                                </div>
                                            </div>
                                            <div class="tooltip-Section">
                                                <div class="bulletPointWrap">
                                                    <div class="bulletPoint"></div>
                                                </div>
                                                <div class="tooltip-SectionLabel">Race: </div>
                                                <div class="tooltip-SectionValue">${filteredData.race}</div>
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
                                                <div class="tooltip-SectionLabel">Renal Failure: </div>
                                                <div class="tooltip-SectionValue">${filteredData.renalFailure == 1 ? 'Yes' : 'No'}</div>
                                            </div>
                                        </div>
                                    </div>`;

                return toottipHtml;
            }
        },
        plotOptions: {
                series: {
                    turboThreshold: 0
                }
        },
        series: [
            {
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
        if(isInitialLoad) {
            updateTimeSlider(chartObj.chartData);
        }
        getPatientCount(chartObj.chartData);
    });

    //assign the chart object to the global accessible object to access it outside
    probabilityChartObj = chart;
}

//function to get Cirrhotic Cost as per patient data
export let getCirrhoticCostForPatient = (patientDataObj, isPatientCirrhotic) => {
    let costBaseData = CostModelData.reactive(),
        filteredData = [];

    filteredData = costBaseData;

    let filterObj = {
        GENDER_CD: patientDataObj.gender,
        RACE_DESC: patientDataObj.race,
        GENOTYPE: patientDataObj.genotype,
        CIRRHOSIS: patientDataObj.cirrhosis,
        TREATMENT: patientDataObj.treatment,
        FibrosureStage: patientDataObj.FibrosureStage
    }

    //cirrhotic today cost for patient with No Cirrhosis
    // filterObj.CIRRHOSIS = 'No';
    // let cirrFilteredData = _.where(filteredData,filterObj);
    // let cirrhoticTodayCost = cirrFilteredData.length ? cirrFilteredData[0].CHARGE : 0;
    //
    // //cirrhotic afterwards cost for patient with Yes Cirrhosis
    // filterObj.CIRRHOSIS = 'Yes';
    // cirrFilteredData = _.where(filteredData,filterObj);
    // let cirrhoticAfterCost = cirrFilteredData.length ? cirrFilteredData[0].CHARGE : 0;

    //swap the cost values plotting if the patient is considered cirrhotic by slider value/ plotbands
    let costToday = getRandomInt(2000,100000);//Math.random(50)*10000;
    let costAfter = getRandomInt(costToday,200000);
    // return {
    //    todayCost: isPatientCirrhotic == 'Yes' ? cirrhoticAfterCost : cirrhoticTodayCost,
    //    afterCost: isPatientCirrhotic == 'Yes' ? cirrhoticTodayCost : cirrhoticAfterCost
    // };
    return {
       todayCost: costAfter,
       afterCost: costToday
    };
}


/**
 * @author: Pramveer
 * @date: 21st Feb 17
 * @desc: function to hide/show the patients based on the time frame slider value
*/

let getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
export let showPatientsWithSelectedTime = (timeValue) => {
    let chartData = cirrhoiticChartData.cohortData;

    let series = probabilityChartObj.series[0];

    if(series.data.length) {
        //loop for all points
        for(let i=0;i<series.data.length;i++) {
            let yPoint = null;
            if(series.data[i].timePeriod >= timeValue) {
                yPoint = null;
            }
            else {
                let filteredData = _.where(chartData,{patientId:series.data[i].patientId})[0];
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
    let timeArray = _.pluck(scatterChartData.cohortData,'timePeriod');

    //if custom patients are there then also get their time frame
    if(scatterChartData.customData) {
        timeArray.push(_.pluck(scatterChartData.customData,'timePeriod'));
        timeArray = _.flatten(timeArray);
    }

    timeArray = _.uniq(timeArray);

    //sort the array
    timeArray = timeArray.sort(function(a,b) {
        return a-b;
    });

    let minTime = timeArray[0] <= 0 ? 1 : timeArray[0],
        maxTime = timeArray[timeArray.length - 1];

    $('#cirrhoticTime-Slider').prop('disabled', false);
    $('#cirrhoticTime-Slider').attr('min', minTime); //update the slider with min value
    $('#cirrhoticTime-Slider').attr('max', maxTime); //update the slider with max value
    $('#cirrhoticTime-Slider').val(10); //update the slider with max value

    //set the html for the indicators to show min/max sliders values
    $('.cirrhoticTimeFrame-Slider .weightslidspan0').html(minTime); //update the min html value
    $('.cirrhoticTimeFrame-Slider .weightslidspan100').html(Math.abs(maxTime)); //update the max html value
    $('.cirrhoticTimeFrame-Slider .sliderOutput').html(10 + ' Months'); //set the output value


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
    let filterData = _.filter(scatterChartData.cohortData,(rec) => {
            return rec.timePeriod <= timeRangeSliderValue
        });

    //loop for all filtered patients
    for(let i=0; i<filterData.length;i++){
        //increment less patients count if probability value is less than the slider value
        if(filterData[i].probability < probRangeSliderValue) {
            lessThan++;
        }
        //increment the patients count for more probability patients
        else {
            moreThan++;
        }
    }
    $('#lessProbPatient_count').html(lessThan);
    $('#moreProbPatient_count').html(moreThan);
}
