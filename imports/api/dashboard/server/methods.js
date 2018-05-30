/**
 * Author: Pram
 * Date: 25th May 2018
 * Desc: Backend API for dashboard Page
 */

 //Map chart object
let mapData = [];


// LineChart object
let chartData = [];
let yearData =[];

//return object
let returnObj = {};



Meteor.syncMethods({
    'getDashboardData': (params, callbackFn) => {
        let query = 'SELECT  RACE_DESC, GENDER_CD, AMD_STAGE, AGE,ST_CD,PAT_ZIP,year(FIRST_ENCT_DATE) as FIRST_ENCT_DATE,BRTH_YR_NBR FROM AMD_PATIENT';

        try{
            liveDb.db.query(query, (error, result) => {
                if (error) {
                    callbackFn(error, null);
                }
                else {
                   let return_obj = prepareChartdata(result)
                    callbackFn(undefined, return_obj);
                }
            });
        }
        catch(e) {
            console.log('Error in Processing method');
        }
    },

});


//function to fetch data and create  chart
let prepareChartdata = (result) => {
    // console.log(result)
    let mapChartData = mapChart(result)
    let lineChartData = lineChart(result)
    let estimatedInfection = estimatedInfectionChart(result)
	let prevelence=prevelenceChart(result)
    returnObj = {
        lineChart: lineChartData,
        mapChart :mapChartData,
        columnChart: estimatedInfection,
		prevelenceChart:prevelence
    }

    return returnObj


}
//Mapchart
let mapChart = (result) => {
    let state = _.groupBy(result,"ST_CD");
    //let year = _.groupBy(result, "BRTH_YR_NBR")
    // console.log(PAT_ZIP[272])
    var x = 0;
    mapData = [];
  //  yearData = [];
    for (let keys in state) {
        let year = _.countBy(state[keys], "PAT_ZIP")

        mapData.push({
            value:state[keys].length,
            code:keys 
        });
        x++;
    }

    let mapChart = {
       // x: yearData.slice(1,4),
        data: mapData
    }
    return mapChart
}
//Line Chart
let lineChart = (result) => {
	//console.log(result);
    // let PAT_ZIP = _.groupBy(result,"PAT_ZIP");
	
 
    let year = _.groupBy(result, "FIRST_ENCT_DATE")
     //console.log(year)
    var x = 0;
    chartData = [];
    yearData = [];
    for (let keys in year) {
      chartData.push({
          y:  year[keys].length,
          mydata: keys
      });
      yearData.push(keys);
    }

    let lineChart = {
        x: yearData.splice(1,4),
        data: chartData.splice(1,4)
    }
    return lineChart
}

let estimatedInfectionChart = (result) =>{
     let yearData=[]
	 let chartData={}
	 let antiHcvData=[]
	 let hcvRnaData=[]
    let year = _.groupBy(result, "BRTH_YR_NBR")
	//filteredData = _.groupBy(result,'GENDER_CD')
	//console.log(filteredData)
	for (let keys in year) {
		let pData = year[keys];
	//filter for male
        let filteredData = _.filter(pData, (rec) => {
            return rec.GENDER_CD == 'M';

        });
		 antiHcvData.push({
            y:filteredData.length
        });
		 filteredData = _.filter(pData, (rec) => {
            return rec.GENDER_CD == 'F';

        });
		 hcvRnaData.push({
            y:filteredData.length
        });
		yearData.push(keys);

		//console.log(filteredData)

	}
	//year wise 2013 - 2017
    chartData = {
		series: [{
			name: 'Male',
			data: antiHcvData.slice(0,4)

		}, {
			name: 'Female',
			data: hcvRnaData.slice(0,4)
		}],
		categories:yearData.slice(0,4)
	}

   //chartData.categories=yearData
   console.log(chartData)

 return chartData;

 }

 
 let prevelenceChart = (result) =>{
	 let series=[]
	 let chartData=[]
	 let yearData=[]
	 let year=_.groupBy(result,"FIRST_ENCT_DATE")
	 for (let keys in year){
		 let age=_.groupBy(year[keys],"AGE");
		   let obj = {};
		   obj.name=keys;
		   obj.data=getCountByKey(age).slice(0,5) ;
		    series.push(obj);
		 yearData.push(_.pluck(obj.data, 'cat'))
		   yearData = _.flatten(yearData);
        yearData = _.uniq(yearData);
		 chartData={
		 categories:yearData.slice(0,5) ,
		 data:series.slice(0,5) 
		 }
	 }
	 
	 let returnData=chartData 
	 return returnData
 }
 
 function getCountByKey(age) {
	 		let dummy=[]
			for(let data in age)
		 {
			 dummy.push({
				 cat:data,
				 y:age[data].length
				 
		 })
		 }
		 return dummy
 }