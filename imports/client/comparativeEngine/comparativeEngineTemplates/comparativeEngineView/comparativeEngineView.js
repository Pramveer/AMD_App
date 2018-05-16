import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './comparativeEngineView.html';


Template.CompareEngineView.onCreated(function () {
    // console.log("*********** Compare View Configurations ***************");
    // console.log(this.data);

    // Call functions for fetching the data.

});

Template.CompareEngineView.rendered = function () {
    // $('.compareEngineView_container').html(this.data.compareConfig.compareOptions + ' Vs. ' +this.data.compareConfig.compareBy + ' chart will be displayed here.');

    // generate id for the container.
    let id = getVisualizationDetails(this.data).id;
    // create containers with loading wheel
    createVisualizationContaier(this.data, id);

    // show loading wheel

    // Prepare the data.

    // dummy data for C3 Js library
    // let data = { 
    //         "Caucasian":
    //             { "count":12149, "race":"Caucasian" },
    //         "Unknown":
    //             { "count":5674, "race":"Unknown" },
    //         "African American":
    //             { "count":2720, "race":"African American" },
    //         "Hispanic":
    //             { "count":398, "race":"Hispanic" },
    //         "Other":
    //             { "count":317, "race":"Other" },
    //         "Asian":
    //             { "count":195, "race":"Asian" }
    //     };

    // Render the Comparison visualization.
    // id = '#'+id; -- Not needed for high Chart
    // renderRaceVsGenotype(id);
    let visualizationName = getVisualizationDetails(this.data).visualizationName;
    if(visualizationName == "pendingVisualizations"){
        pendingVisualizations(id, this.data);
    }else{
        eval(visualizationName+'('+id+')');
    }
    

    // hide loading wheel.

}

Template.CompareEngineView.helpers({
});

Template.CompareEngineView.events({
    'click .backToCompareOptions': function (event, template) {
        var comparativeEngine = new ComparativeEngine();
        comparativeEngine.renderCompareOptiosView();
    }
});



let createVisualizationContaier = (selectedOptions, id) => {
    console.log(selectedOptions);

    let html = '';
    html = `<div class="boxContainerDashboard">
                <div class="panel-heading">
                    <h3 class="panel-title containertitle" style="text-align:left;float:left; display: inline-block;"> ${selectedOptions.compareConfig.compareOptions} Vs. ${selectedOptions.compareConfig.compareBy}</h3>

                </div>
                <div class="panel-body">
                    <div id="${id}">
                        
                    </div>
                </div>
            </div>`

    $('.compareEngineView_container').html(html);
}


let getVisualizationDetails = (selectedOptions) => {
    if(selectedOptions.compareConfig.compareOptions == "Race Distribution" && selectedOptions.compareConfig.compareBy == "Genotype"){
        return {id: "raceDistributionVsGenotype", visualizationName : "renderRaceVsGenotype"};
    }else if(selectedOptions.compareConfig.compareOptions == "Race Distribution" && selectedOptions.compareConfig.compareBy == "Year"){
        return {id: "raceDistributionVsYear", visualizationName : "renderRaceVsYear"};
    }else{
        return {id: "mainVisualizationContainer", visualizationName : "pendingVisualizations"};
    }
    
}


let renderRaceVsGenotype = (container) => {
    Highcharts.chart(container , {
        chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ['Caucasian', 'African American', 'Hispanic', 'Other', 'Asian']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count'
            }
        },
        legend: {
            reversed: true
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: [{
            name: '1a',
            data: [500, 300, 400, 700, 200]
        }, {
            name: '1b',
            data: [200, 200, 300, 200, 100]
        }, {
            name: '2',
            data: [300, 400, 400, 200, 500]
        },{
            name: '3',
            data: [300, 400, 400, 200, 500]
        },{
            name: '4',
            data: [300, 400, 400, 200, 500]
        }]
    });
}



let renderRaceVsYear = (container) =>{
     Highcharts.chart(container, {
        chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ['Caucasian', 'African American', 'Hispanic', 'Other', 'Asian']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Patient Count'
            }
        },
        legend: {
            reversed: true
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: [{
            name: '2011',
            data: [500, 300, 400, 700, 200]
        }, {
            name: '2012',
            data: [200, 200, 300, 200, 100]
        }, {
            name: '2013',
            data: [300, 400, 400, 200, 500]
        },{
            name: '2014',
            data: [300, 400, 400, 200, 500]
        },{
            name: '2015',
            data: [300, 400, 400, 200, 500]
        },{
            name: '2016',
            data: [300, 400, 400, 200, 500]
        }]
    });
}

let pendingVisualizations = (container, data) => {
    $('#'+container).html(data.compareConfig.compareOptions + ' Vs. ' +data.compareConfig.compareBy + ' visualization will be displayed here.');

}