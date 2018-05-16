// Create an immediately invoked functional expression to wrap our code
(function () {

    // Define our constructor
    this.InsightInfo = function () {

        // Define option defaults
        var defaults = {
            id: 'insight-info'
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
    InsightInfo.prototype.testMethod = function () {
        console.log(this.options);
        alert("test method is called from Insight info class");
    }


    InsightInfo.prototype.renderContent = function () {
        let tabName = this.options.tabName; 
        let chartName = this.options.chartName;
        let id = this.options.id;
        let chartData = this.options.chartData;

        let content = prepareInsightContent(tabName,chartName, chartData);
        insertContent(id, content);
    }


    // Utility Functions
    function prepareInsightContent(tabName,chartName, chartData){
        let content = '';
        if(tabName == "analytics_efficacy"){

            let insightClass = new AnalyticsEfficacy({
                chartName : chartName, 
                chartData: chartData
            });
            
           content = insightClass.prepareInsightContent()
        }
        
        return content;
    }

    function insertContent(id,content) {
        $('#'+id).html(content)
    }


} ());