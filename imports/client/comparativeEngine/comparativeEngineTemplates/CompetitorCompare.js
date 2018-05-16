import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './CompetitorCompare.html';

import {
    Promise
} from 'meteor/promise';


Template.CompetitorCompare.onCreated(function () {



});
Template.CompetitorCompare.helpers({
    // 'isLoading': () => Template.instance().loading.get(),
    compareData() {
        //// For Reference : localStorage.AllCompitetorChartData,localStorage.yearlyCompetiterData
        //// Null or undefined check
        let allCompitetorChartData = JSON.parse(localStorage.AllCompitetorChartData);
        let svrDistribution = [];
        for (let key in allCompitetorChartData.allDistributionData) {

            svrDistribution.push({
                key: key,
                cssClass: (key == 'Detectable SVR' ? 'pin-comp-detec' : 'pin-comp-undetec'),
                value: parseFloat(allCompitetorChartData.allDistributionData[key] / allCompitetorChartData.TotalN * 100).toFixed(1)
            });
        }
        //  console.log(allCompitetorChartData);
        //  console.log(svrDistribution);
        let yearlyData = JSON.parse(localStorage.yearlyCompetiterData);
        let genotypeDistribution = allCompitetorChartData.genotypeChartData;
        let genotypeData = [];
        let rawGenotypeData = {};
        _.forEach(allCompitetorChartData.genotypeChartData, (item) => {
            let SVR_Detectable = parseFloat(item.graphData["Detectable SVR"] / item.count * 100).toFixed(0),
                SVR_Undetectable = parseFloat(item.graphData["Undetectable SVR"] / item.count * 100).toFixed(0);
            genotypeData.push({
                genotype: item.key,
                SVR_Detectable: SVR_Detectable,
                SVR_Undetectable: SVR_Undetectable,
                SVR_Detectable_style: `width:${(parseFloat(SVR_Detectable)+3)}%;`,
                SVR_Undetectable_Style: `width:${(parseFloat(SVR_Undetectable)-5)}%;`
            });
        });
        let rawCureRateData = allCompitetorChartData.rawData;
        let finalData = [];
        // Iterate drug groupby result one by one and prepare data for compare template

        for (let key in rawCureRateData) {
            let tempFinal = {};
            let tempSVRDistribution = [];
            let tempGenotypeData = [];
            let tempYearlyDrugData = [];
            let tempCirrhosisData=[];
            // Prepare SVR Distribution for each drug
            let countBySVRDistribution = _.countBy(allCompitetorChartData.rawData[key], 'SVR_Result');
            for (let svr in countBySVRDistribution) {
                tempSVRDistribution.push({
                        key: svr,
                        cssClass: (svr == 'Detectable SVR' ? 'pin-comp-detec' : 'pin-comp-undetec'),
                        value: parseFloat(countBySVRDistribution[svr] / rawCureRateData[key].length * 100).toFixed(1)
                    }

                );
            }
            // Prepare SVR Distribution for each drug based on Genotype
            let grpByGenotype = _.groupBy(rawCureRateData[key], 'GENOTYPE');
            for (let genotype in grpByGenotype) {
                //Further genotype distribution with SVR Result
                let cntBySVR = _.countBy(grpByGenotype[genotype], 'SVR_Result');

                // tempGenotypeData.push({
                // genotype:genotype
                // });
                let SVR_Detectable = parseFloat(cntBySVR["Detectable SVR"] / grpByGenotype[genotype].length * 100).toFixed(0),
                    SVR_Undetectable = parseFloat(cntBySVR["Undetectable SVR"] / grpByGenotype[genotype].length * 100).toFixed(0);
                SVR_Detectable = isNaN(SVR_Detectable) ? 0 : SVR_Detectable;
                SVR_Undetectable = isNaN(SVR_Undetectable) ? 0 : SVR_Undetectable;

                //genotypeData.push({genotype:item.key,SVR_Detectable:SVR_Detectable,SVR_Undetectable:SVR_Undetectable,SVR_Detectable_style:`width:${(parseFloat(SVR_Detectable)+3)}%;`,SVR_Undetectable_Style:`width:${(parseFloat(SVR_Undetectable)-5)}%;`});

                tempGenotypeData.push({
                    genotype: genotype,
                    SVR_Detectable: SVR_Detectable,
                    SVR_Undetectable: SVR_Undetectable,
                    SVR_Detectable_style: `width:${(parseFloat(SVR_Detectable)+3)}%;`,
                    SVR_Undetectable_Style: `width:${(parseFloat(SVR_Undetectable)-5)}%;`
                });
            }

            // Prepare SVR Distribution for each drug based on Cirrhosis
            let grpByCirrhosis = _.groupBy(rawCureRateData[key], 'CIRRHOSIS');
            for (let cirrhosis in grpByCirrhosis) {
                //Further genotype distribution with SVR Result
                let cntBySVR = _.countBy(grpByCirrhosis[cirrhosis], 'SVR_Result');

                // tempGenotypeData.push({
                // genotype:genotype
                // });
                let SVR_Detectable = parseFloat(cntBySVR["Detectable SVR"] / grpByCirrhosis[cirrhosis].length * 100).toFixed(0),
                    SVR_Undetectable = parseFloat(cntBySVR["Undetectable SVR"] / grpByCirrhosis[cirrhosis].length * 100).toFixed(0);
                SVR_Detectable = isNaN(SVR_Detectable) ? 0 : SVR_Detectable;
                SVR_Undetectable = isNaN(SVR_Undetectable) ? 0 : SVR_Undetectable;

                //genotypeData.push({genotype:item.key,SVR_Detectable:SVR_Detectable,SVR_Undetectable:SVR_Undetectable,SVR_Detectable_style:`width:${(parseFloat(SVR_Detectable)+3)}%;`,SVR_Undetectable_Style:`width:${(parseFloat(SVR_Undetectable)-5)}%;`});

                tempCirrhosisData.push({
                    cirrhosis: cirrhosis,
                    SVR_Detectable: SVR_Detectable,
                    SVR_Undetectable: SVR_Undetectable,
                    SVR_Detectable_style: `width:${(parseFloat(SVR_Detectable)+3)}%;`,
                    SVR_Undetectable_Style: `width:${(parseFloat(SVR_Undetectable)-5)}%;`
                });
            }

            tempFinal.name = key;
            tempFinal.SVRDistribution = tempSVRDistribution;

            tempFinal.genotypeData = tempGenotypeData;
             tempFinal.cirrhosisData =tempCirrhosisData;

            // Prepare or filter yearly drug distribution data
            // for(let drug in yearlyData.rawData ){
            //     //Calculate only if drug is macthed based on group
            //     if(key.split(' + ').indexOf(drug)>-1){
            //     let cntByFillYear=_.countBy(yearlyData.rawData[drug],'fillyear');
            //     for(let year in cntByFillYear){
            //        tempYearlyDrugData.push({year:year,totalPatients:cntByFillYear[year],percentage:parseFloat(cntByFillYear[year]/yearlyData.rawData[drug].length * 100).toFixed(0)});

            //     }

            //     }


            // }
            //tempFinal.yearlyData=tempYearlyDrugData;
            //Static as it is
            tempFinal.yearlyData = yearlyData.yearlyCompetiterData;


            //prepare final data for comparative 
            finalData.push(tempFinal);
        }

        /**
         * - > Compitetor Comparision
        Step1 - Get All Raw Data to client first -Done
        Step2 - Group By Medication for yearly comparision
        Step3 - Group By SVR Result for Overall cure rate by medication 
        Step4 - Group By Genotype for Overall cure rate by Genotype
         * 
         */

        //console.log(finalData);


        let rawData = [{
            name: 'Harvoni',
            yearlyData: yearlyData,
            SVRDistribution: svrDistribution,
            genotypeData: genotypeData
        }, {
            name: 'Harvoni',
            yearlyData: yearlyData,
            SVRDistribution: svrDistribution,
            genotypeData: genotypeData
        }, {
            name: 'Harvoni',
            yearlyData: yearlyData,
            SVRDistribution: svrDistribution,
            genotypeData: genotypeData
        }];
        //console.log(rawData);
        return finalData;
    }
});


Template.CompetitorCompare.rendered = function () {

    //Remove old data from template 
    // $('#pin-comp-content').empty();


    ////Set eaqual height for each compare row
    equalHeight($(".pin-comp-col1"));
    equalHeight($(".pin-comp-col2"));
    equalHeight($(".pin-comp-col3"));
    ////Set padding dynamic for each row in compare view
    $(".pin-comp-col1-header").css('padding-top', (($(".pin-comp-col1").height() / 2) - 15));
    $(".pin-comp-col2-header").css('padding-top', (($(".pin-comp-col2").height() / 2) - 15));
    $(".pin-comp-col3-header").css('padding-top', (($(".pin-comp-col3").height() / 2) - 15));

    if ($(".pin-comp-body-single-drug").length <= 3) {
        //// Set Dynamic Width for vertical column based on count
        $(".pin-comp-body-single-drug").css('width', ($(".pin-comp-body").width() - ($(".pin-comp-body-single-drug").length * 10)) / $(".pin-comp-body-single-drug").length);
        $(".pin-comp-body-scroll").css('width', (($(".pin-comp-body-single-drug").length * $(".pin-comp-body-single-drug").outerWidth()) + ($(".pin-comp-body-single-drug").length * 10)));
    } else {
        //// Set Dynamic scroll view based on total width for each vertical column
        $(".pin-comp-body-scroll").css('width', (($(".pin-comp-body-single-drug").length * $(".pin-comp-body-single-drug").outerWidth()) + ($(".pin-comp-body-single-drug").length * 10)));
    }

}


/**
 * Descciption :Set same height for provided element
 *
 */
function equalHeight(group) {
    tallest = 0;
    group.each(function () {
        thisHeight = $(this).height();
        if (thisHeight > tallest) {
            tallest = thisHeight;
        }
    });
    group.height(tallest);
}