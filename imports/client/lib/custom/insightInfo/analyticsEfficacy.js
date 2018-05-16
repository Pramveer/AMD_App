// Create an immediately invoked functional expression to wrap our code
(function () {

    // Define our constructor
    this.AnalyticsEfficacy = function () {

        // Define option defaults
        var defaults = {
            id: 'insight-info',
            chartData : [],
            chartName : ''
        }

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

    }

    // Utility method to extend defaults with user options
    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    //Public Methods
    AnalyticsEfficacy.prototype.testMethod = function () {
        console.log(this.options);
        alert("test method is called from AnalyticsEfficacy class");
    }

    //Public Methods
    AnalyticsEfficacy.prototype.prepareInsightContent = function () {
        let chartName = this.options.chartName;
        let chartData = this.options.chartData;
        let content = '';
        
        if(chartName == "scoreCard"){
            content = getContentScoreCard(chartData);
        }else if(chartName == "therapyDistribution"){
            content = getContentTherapyDistribution(chartData);
        }

        return content;
    }


    // suppoting Functions

    function getContentScoreCard(chartDataObj) {
        chartDataObj = JSON.parse(chartDataObj);
        let chartData = chartDataObj.chartData;
        let insightObj = identifyMostUsedDrugCureRate(chartData);
        
        return insightObj.cureRate + " % of all patients who have taken " + insightObj.drugName + " shows an SVR12 reading of zero.";
        
        // This function tells what drug is prescribed to most of the patietns and what is its cure rate.
        function identifyMostUsedDrugCureRate(chartData){
            // identify most used drug.
            let mostUsedDrug = _.max(chartData, function(rec){ return parseFloat(rec['Population Health']); });
            // return Insight object.
            return {cureRate : mostUsedDrug.weightedAvg, drugName : mostUsedDrug.label};
        }
    }

    
    // This function will prepare One line statement for therapy distribution chart unfet Efficacy tab.
    function getContentTherapyDistribution(chartDataObj){
        chartData = chartDataObj.chartData.mainData;
        let medication  = chartDataObj.medication;

        let insightObj = identifyEffectiveTherapy(chartData);
        return  "For "+ insightObj +" week Therapy, "+medication+" is more effective medication.";

        function identifyEffectiveTherapy(chartData){
            let effectiveDrug = _.max(chartData, function(rec){ return parseFloat(rec['y']); });
            let eff = effectiveDrug.y;
            // if more than one has same efficacy.
            let mostEffectiveDrugs = _.where(chartData, {y : eff });

            let weeks = '';
            for(let i = 0; i<mostEffectiveDrugs.length; i++){
                if(i == mostEffectiveDrugs.length -1){
                    weeks += mostEffectiveDrugs[i]['name'];
                }else if(i == mostEffectiveDrugs.length -2){
                    weeks += mostEffectiveDrugs[i]['name'] + ' and ';
                }else{
                    weeks += mostEffectiveDrugs[i]['name'] + ', ';
                }
            }
            return weeks;
        }
    }


} ());
