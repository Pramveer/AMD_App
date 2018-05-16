/*
*   This Function creates the Universe view Safety Quality Indicator chart.
*
*
*/
import {getFilteredDataset} from '../payerToolUtilities.js';

renderUniverseSafetyIndicators = function(tabName) {
    setTimeout(function(){
        var fetchedData =  getSessionDataByTab(tabName);
        var spData = fetchedData.spData,
            unoptSafetyData = fetchedData.reactive_spData;
        var profileData = {};
        let rweUnoptSafetyData = getFilteredDataset(TreatedAnalyticsData, false);
        //return if no data is found
        if(!(spData || unoptSafetyData) ) {
            return;
        }

        var chartData = [],
            isDataOptimized = false;
        
        //set optimized flag
        if(spData['optimizeDataIndicators']) {
            if(spData['optimizeDataIndicators']['Adherence']) {
                isDataOptimized = spData['optimizeDataIndicators']['Adherence']['avg'] > 0 ? true : false;
            }
        }

        //group the data by the category ids        
        unoptSafetyData = _.groupBy(unoptSafetyData,'category_id');

        rweUnoptSafetyData = _.groupBy(rweUnoptSafetyData,'category_id');
        /**
         * @author: Yuvraj
         * @date: 22nd march 2017
         * @desc: declared new variables to calculate count at best value drug, for optimized subpopulation and category wise.
        */
        var totalPatients = 0, 
            totalBestRxCost = 0, //total RxCost at best value drug
            totalBestHospCount = 0, //total # patients hospitalised at best value drug
            totalRxCost = 0, //total RxCost 
            totalAnemiaCount = 0, //total anemia count
            totalLiverFailure = 0, //total liver failure count
            totalDrugInteraction = 0, //total drug to drug interactions count
            totalHospCount = 0,//total # patients hospitalised
            totalAdvRecCount = 0,  //total adverse reaction count
            totalBestAnemiaCount = 0, //total anemia count for optimized subpopulation drug.
            totalBestLiverFailure = 0, //total liver failure count at best value drug.
            totalBestDrugInteraction = 0, //total drug to drug interaction count at best value drug.
            totalBestAdvRecCount = 0, //total adverse reaction count at best value drug.
            opt_totalRxCost = 0, //total RxCost for optimized sub populations drugs
            opt_totalHospCount = 0, //total # patients hospitalised for optimized sub populations drugs
            opt_totalAnemiaCount = 0, //total anemia count for optimized sub populations drugs
            opt_totalLiverFailure = 0, //total liver faliure count for optimized sub populations drugs
            opt_totalDrugInteraction = 0, //total drug to drug interaction count for optimized sub populations drugs
            opt_totalAdvRec = 0; //total adverse reaction count for optimized sub populations drugs

        var optimizedSubPopulations = []; //all optimized sub populations
        optimizedSubPopulations = isDataOptimized ? spData['optimizeDataIndicators'] : [];
         var currentOptSubPop = []; //drugs for the given optimized sub population
        //loop for all sub populations in the data
        for(var keys in unoptSafetyData) {
            var categoryData = unoptSafetyData[keys]; //all drugs for the given sub population
            let rweCategoryData = rweUnoptSafetyData[keys] ?  rweUnoptSafetyData[keys] : categoryData;
            
           
            if(isDataOptimized && (optimizedSubPopulations.hasOwnProperty(keys)) ) {
                currentOptSubPop = optimizedSubPopulations[keys];
                //sort optimized drugs on the value score
                currentOptSubPop.sort(function(a,b){
                    return a.value - b.value;
                });
            }

            //sort all drugs on the value score
            categoryData.sort(function(a,b){
                return a.value - b.value;
            });

            rweCategoryData.sort(function(a,b){
                return a.value - b.value;
            });

            var bestValueDrug = rweCategoryData[rweCategoryData.length - 1]; //get best value drug
            var adverse = bestValueDrug['adverse'];
            var reac = JSON.parse(adverse);
            var count_rec = 0;
            /**
             * @author: Yuvraj
             * @date: March 22nd 2017 
             * @desc: It calculates number of those adverse reactions that have count more than zero.
            */
            for(var key in reac) {
                if(reac[key].count > 0)
                 count_rec++;
            }
            //get RxCost & # Hosp  data for the best value drug
            /**
             * @author: Yuvraj
             * @date: March 22nd 2017
             * @desc: get anemia count,liver failure count,drug to drug interaction count,adverse reaction count for best value drug.
            */
            var bestData = getCostCountForReactions_updated(bestValueDrug['adverse'],bestValueDrug['count'],bestValueDrug['cost']);
            totalBestRxCost += bestData.cost;
            totalBestHospCount += bestData.count;
            var safetyData = JSON.parse(bestValueDrug.drugSafetyData);
            totalBestAnemiaCount += safetyData.anemia_count;
            totalBestLiverFailure += safetyData.liver_failure_count;
            totalBestDrugInteraction += safetyData.drug_interaction_count;
            totalBestAdvRecCount += count_rec;


            var data = 0,
            totalPatients = 0,
            totalRxCost = 0,
            totalHospCount = 0,
            totalAnemiaCount = 0,
            totalLiverFailure = 0,
            totalDrugInteraction = 0,
            totalAdvRecCount = 0;

            //loop for all drugs data
            for(var i=0;i<categoryData.length;i++) {
                var reactions = categoryData[i]['adverse'],
                    drugN = categoryData[i]['count'],
                    drugCost = categoryData[i]['cost'],
                    drugData = JSON.parse(categoryData[i].drugSafetyData),
                    anemiaCount = drugData.anemia_count,
                    liverFailure = drugData.liver_failure_count,
                    drugInteraction = drugData.drug_interaction_count,
                    totalCount = 0;

                var rec = JSON.parse(reactions);
                var count_reactions = 0;
                for(var key in rec) {
                    if(rec[key].count > 0)
                    count_reactions++;
                }
                var adverseReaction = count_reactions;
                //get the RxCost & # Hosp computations for the drug
                /**
                 * @author: Yuvraj
                 * @date: March 22nd 2017 
                 * @desc: get total anemia count,liver failure count,drug to drug interaction count,adverse reaction count for  drug.
                */
                data = getCostCountForReactions_updated(reactions,drugN,drugCost);
                totalPatients += drugN;
                totalRxCost += data.cost;
                totalHospCount += data.count;
                totalAnemiaCount += anemiaCount;
                totalLiverFailure += liverFailure;
                totalDrugInteraction += drugInteraction;
                totalAdvRecCount += adverseReaction;
                
            }

                //get the RxCost & # Hosp computations for the optimized drug
                /**
                 * @author: Yuvraj
                 * @date: March 22nd 2017 
                 * @desc:  get total anemia count,liver failure count,drug to drug interaction count,adverse reaction count for optimized drug.
                */
                if(currentOptSubPop.length) {
                    for(var i=0;i<currentOptSubPop.length;i++){
                            var opt_drugSafetyData = JSON.parse(currentOptSubPop[i]['drugSafetyData']);
                            var opt_drugN = currentOptSubPop[i]['DrugN'],
                            opt_drugCost = currentOptSubPop[i]['Cost']['TotalCost'];
                            var advReactions = currentOptSubPop[i].adverse_reactions;
                            var opt_data = getCostCountForReactions_updated(advReactions,drugN,drugCost,opt_drugN,opt_drugCost);
                            opt_totalRxCost += opt_data.cost;
                            opt_totalHospCount += opt_data.count;
                            opt_totalAnemiaCount += opt_drugSafetyData.anemia_count;
                            opt_totalLiverFailure += opt_drugSafetyData.liver_failure_count;
                            opt_totalDrugInteraction += opt_drugSafetyData.drug_interaction_count;


                            var rect = JSON.parse(advReactions);
                            var countRec = 0;
                            for(var key in rect) {
                            if(rect[key].count > 0)
                                countRec++;
                            }
                            var advReaction = countRec;
                            opt_totalAdvRec += advReaction;
                    }

                }
                else {
                    opt_totalRxCost += isDataOptimized ? data.cost : 0;
                    opt_totalHospCount += isDataOptimized ? data.count : 0;
                    opt_totalAnemiaCount += isDataOptimized ? anemiaCount : 0;
                    opt_totalLiverFailure += isDataOptimized ? liverFailure : 0;
                    opt_totalDrugInteraction += isDataOptimized ? drugInteraction : 0;
                    opt_totalAdvRec += isDataOptimized ? adverseReaction : 0;

                }           
        }

        //json for RxCost & # Hosp based on optimized & unoptimized ones
        /**
         * @author: Yuvraj
         * @date: March 22nd 2017 
         * @desc: added json for anemia count,liver failure count,drug to drug interaction count and adverse reaction count.
        */
        var rxCost_unoptimizedData = {}, hosp_unoptimizedData = {},advRec_unoptimizedData = {},
            anemc_unoptimizedData = {}, livfl_unoptimizedData = {}, drgint_unoptimizedData = {},
            rxCost_optimizedData = {} , hosp_optimizedData = {}, advRec_optimizedData = {},
            anemc_optimizedData = {}, livfl_optimizedData = {}, drgint_optimizedData = {};
            
            rxCost_unoptimizedData['name'] = 'unoptimized'; hosp_unoptimizedData['name'] = 'unoptimized';
            anemc_unoptimizedData['name'] = 'unoptimized'; advRec_unoptimizedData['name'] = 'unoptimized';
            livfl_unoptimizedData['name'] = 'unoptimized'; drgint_unoptimizedData['name'] = 'unoptimized';
          
            rxCost_optimizedData['name'] = 'optimized'; hosp_optimizedData['name'] = 'optimized';
            anemc_optimizedData['name'] = 'optimized';  advRec_optimizedData['name'] = 'optimized';
            livfl_optimizedData['name'] = 'optimized'; drgint_optimizedData['name'] = 'optimized';

       
        //get the value & indicator for the best RxCost
        var valueChanges = getValueChanged(totalBestRxCost,totalRxCost);
        // rxCost_unoptimizedData['value'] = totalBestRxCost;
        // rxCost_unoptimizedData['valueChange'] =  valueChanges.value;
        rxCost_unoptimizedData['value'] = valueChanges.value;
        rxCost_unoptimizedData['affected'] = valueChanges.affected;


        //get the value & indicator for the optimized Rxcost
        valueChanges = getValueChanged(totalBestRxCost,opt_totalRxCost);
        // rxCost_optimizedData['value'] = opt_totalRxCost;
        // rxCost_optimizedData['valueChange'] =  valueChanges.value;
        rxCost_optimizedData['value'] = valueChanges.value;
        rxCost_optimizedData['affected'] = valueChanges.affected;

        //push the optimized & unoptimized objects in the chartData
        chartData.push(rxCost_unoptimizedData);
        chartData.push(rxCost_optimizedData);

        //plot the Rxcost Chart 
        // var container = '#'+tabName + 'UniSafetyRxCostChart';
        // plotUniSafetyIndicatorChart(chartData,container);

        profileData['rx'] = chartData;
        //empty the chartData for new data
        chartData = [];
        //get the value & indicator for the best #Hosp
        valueChanges = getValueChanged(totalBestHospCount,totalHospCount);
        // hosp_unoptimizedData['value'] =  totalBestHospCount;
        // hosp_unoptimizedData['valueChange'] =  valueChanges.value;
        hosp_unoptimizedData['value'] =  valueChanges.value;
        hosp_unoptimizedData['affected'] = valueChanges.affected;

        //get the value & indicator for the optimized #Hosp
        valueChanges = getValueChanged(totalBestHospCount,opt_totalHospCount);
        // hosp_optimizedData['value'] = opt_totalHospCount;
        // hosp_optimizedData['valueChange'] =  valueChanges.value;
        hosp_optimizedData['value'] = valueChanges.value;
        hosp_optimizedData['affected'] = valueChanges.affected;

        //push the optimized & unoptimized objects in the chartData
        chartData.push(hosp_unoptimizedData);
        chartData.push(hosp_optimizedData);

        //plot the #Hosp Chart 
        // container = '#'+tabName + 'UniSafetyHosptChart';
        // plotUniSafetyIndicatorChart(chartData,container);
        profileData['hospitalised'] = chartData;
        //empty the chartData for new data
        chartData = [];


        /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: get the value & indicator for the best #Adverse Reaction
        */
         //get the value & indicator for the best #Adverse Reaction
        valueChanges = getValueChanged(totalBestAdvRecCount,totalAdvRecCount);
        advRec_unoptimizedData['value'] =  valueChanges.value;
        advRec_unoptimizedData['affected'] = valueChanges.affected;
        

         /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: get the value & indicator for the optimized #Adverse Reaction
        */
        valueChanges = getValueChanged(totalBestAdvRecCount,opt_totalAdvRec);
        advRec_optimizedData['value'] = valueChanges.value;
        advRec_optimizedData['affected'] = valueChanges.affected;

        //push the optimized & unoptimized objects in the chartData
        chartData.push(advRec_optimizedData);
        chartData.push(advRec_unoptimizedData);

        //plot the #Hosp Chart 
        // container = '#'+tabName + 'UniSafetyAdvReacChart';
        // plotUniSafetyIndicatorChart(chartData,container);
        profileData['adverse'] = chartData;
          // empty the chartData for new data
         chartData = [];

        /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: get the value & indicator for the best #drug interaction
        */
        valueChanges = getValueChanged(totalBestDrugInteraction,totalDrugInteraction);

        drgint_unoptimizedData['value'] =  valueChanges.value;
        drgint_unoptimizedData['affected'] = valueChanges.affected;

        /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: get the value & indicator for the optimized #drug interaction
        */
        valueChanges = getValueChanged(totalBestDrugInteraction,opt_totalDrugInteraction);

        drgint_optimizedData['value'] = valueChanges.value;
        drgint_optimizedData['affected'] = valueChanges.affected;

        //push the optimized & unoptimized objects in the chartData
        chartData.push(drgint_unoptimizedData);
        chartData.push(drgint_optimizedData);

        //plot the #drugInteraction Chart 
        // container = '#'+tabName + 'UniSafetyInteracChart';
        // plotUniSafetyIndicatorChart(chartData,container);
        profileData['drugInteraction'] = chartData;
        //empty the chartData for new data
        chartData = [];

         /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: get the value & indicator for the best #liver failure
        */
        valueChanges = getValueChanged(totalBestLiverFailure,totalLiverFailure);

        livfl_unoptimizedData['value'] =  valueChanges.value;
        livfl_unoptimizedData['affected'] = valueChanges.affected;

        /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: get the value & indicator for the optimized #Liver Failure
        */
        valueChanges = getValueChanged(totalBestLiverFailure,opt_totalLiverFailure);

        livfl_optimizedData['value'] = valueChanges.value;
        livfl_optimizedData['affected'] = valueChanges.affected;

        //push the optimized & unoptimized objects in the chartData
        chartData.push(livfl_unoptimizedData);
        chartData.push(livfl_optimizedData);

        //plot the #liverFailure Chart 
        // container = '#'+tabName + 'UniSafetyLiverFailChart';
        // plotUniSafetyIndicatorChart(chartData,container);
        profileData['liverFailure'] = chartData;
        //empty the chartData for new data
        chartData = [];

        
        /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: get the value & indicator for the best #Anemia Count
        */
        valueChanges = getValueChanged(totalBestAnemiaCount,totalAnemiaCount);

        anemc_unoptimizedData['value'] =  valueChanges.value;
        anemc_unoptimizedData['affected'] = valueChanges.affected;

      
        /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: get the value & indicator for the optimized #Anemia Count
        */
        valueChanges = getValueChanged(totalBestAnemiaCount,opt_totalAnemiaCount);
      
        anemc_optimizedData['value'] = valueChanges.value;
        anemc_optimizedData['affected'] = valueChanges.affected;

        //push the optimized & unoptimized objects in the chartData
        chartData.push(anemc_unoptimizedData);
        chartData.push(anemc_optimizedData);

        //plot the #anemiaCount Chart 
        // container = '#'+tabName + 'UniSafetyAnemiaChart';
        // plotUniSafetyIndicatorChart(chartData,container);
        profileData['anemiaCount'] = chartData;

        /**
         * @author: Yuvraj
         * @date: March 23rd 2017
         * @desc: if value is zero then it returns null and does not show it in the table.
        */

        hosp_unoptimizedData = getValue(hosp_unoptimizedData);
        advRec_unoptimizedData = getValue(advRec_unoptimizedData);
        drgint_unoptimizedData = getValue(drgint_unoptimizedData);
        anemc_unoptimizedData = getValue(anemc_unoptimizedData);
        livfl_unoptimizedData = getValue(livfl_unoptimizedData);
        rxCost_unoptimizedData = getValue(rxCost_unoptimizedData);
        
        hosp_optimizedData = getValue(hosp_optimizedData);
        advRec_optimizedData = getValue(advRec_optimizedData);
        drgint_optimizedData = getValue(drgint_optimizedData);
        anemc_optimizedData = getValue(anemc_optimizedData);
        livfl_optimizedData = getValue(livfl_optimizedData);
        rxCost_optimizedData = getValue(rxCost_optimizedData);
        /**
         * @author: Yuvraj
         * @date: march 22nd 2017 
         * @desc: html for popup of safety in universe view.
        */

        let html = `<div class='col-md-12'>
                    <table>`;

        let headerHtml = `<tr class='uvSafetyTH'>`;
        let innerContent = `<tr class='uvSafetyRow' style='border-left: 5px solid #809FBC;'>`;
        let htmlData = `<tr class='uvSafetyRow' style='border-left: 5px solid #5A6D8D;'>`;
                  
        let content = `<div class='uniSafetyChartLegends col-md-12'>
                            Using Best Value Drug<div class='safetyLegendsBest'></div>
                            After Modification <div class='safetyLegendsOptimized'></div>
                      </div>`;
       let hospHtml = `<th class='uvSafetyTHColumn-popup uniSafetyHosptCount'> Hospitalization </td>`; 
       let hospRowHtml = `<td class='uvSafetyTbColumn-popup uniSafetyHosptCount'>
                                ${hosp_unoptimizedData['value']} <img src='${getImage(hosp_unoptimizedData)}' class='uniSafety'/>
                          </td>`;                   
       let adrecHtml = `<th class='uvSafetyTHColumn-popup uniSafetyAdvReacCount '> Adverse Reactions </td>`;    
       let adRowHtml = `<td class='uvSafetyTbColumn-popup uniSafetyAdvReacCount'>
                                ${advRec_unoptimizedData['value']} <img src='${getImage(advRec_unoptimizedData)}' class='uniSafety'/>
                        </td>`;                  
       let interHtml = `<th class='uvSafetyTHColumn-popup uniSafetyInteracCount'> Drug to drug interactions </td>`;
       let interRowHtml = `<td class='uvSafetyTbColumn-popup uniSafetyInteracCount'>
                                ${drgint_unoptimizedData['value']} <img src='${getImage(drgint_unoptimizedData)}' class='uniSafety'/>
                           </td>`;                         
       let livflHtml = `<th class='uvSafetyTHColumn-popup uniSafetyLiverFailCount'> Liver Failure </td>`;                         
       let livflRowHtml = `<td class='uvSafetyTbColumn-popup uniSafetyLiverFailCount'>
                                ${livfl_unoptimizedData['value']} <img src='${getImage(livfl_unoptimizedData)}' class='uniSafety'/>
                            </td>`;
       let anemHtml = `<th class='uvSafetyTHColumn-popup uniSafetyAnemiaCount'> Anemia </td>`;                        
       let anemRowHtml = `<td class='uvSafetyTbColumn-popup uniSafetyAnemiaCount'>
                                ${anemc_unoptimizedData['value']}  <img src='${getImage(anemc_unoptimizedData)}' class='uniSafety'/>
                          </td>`;
       let rxcoHtml = ` <th class='uvSafetyTHColumn-popup uniSafetyRxCostCount'> Additional Cost </td>`;
       let rxcoRowHtml = `<td class='uvSafetyTbColumn-popup uniSafetyRxCostCount'>
                                ${rxCost_unoptimizedData['value']}  <img src='${getImage(rxCost_unoptimizedData)}' class='uniSafety'/>
                           </td>`;
       let hospopt = `<td class='uvSafetyTbColumn-popup uniSafetyHosptCount'>
                                ${hosp_optimizedData['value']}  <img src='${getImage(hosp_optimizedData)}' class='uniSafety'/>
                      </td>`;
       let advopt = `<td class='uvSafetyTbColumn-popup uniSafetyAdvReacCount'>
                                ${advRec_optimizedData['value']}  <img src='${getImage(advRec_optimizedData)}' class='uniSafety'/>
                    </td>`;
       let interopt = `<td class='uvSafetyTbColumn-popup uniSafetyInteracCount'>
                                ${drgint_optimizedData['value']}  <img src='${getImage(drgint_optimizedData)}' class='uniSafety'/>
                        </td>`;
       let livflopt = `<td class='uvSafetyTbColumn-popup uniSafetyLiverFailCount'>
                                ${livfl_optimizedData['value']}  <img src='${getImage(livfl_optimizedData)}' class='uniSafety'/>
                        </td>`;
       let anemopt = `<td class='uvSafetyTbColumn-popup uniSafetyAnemiaCount'>
                                ${anemc_optimizedData['value']}  <img src='${getImage(anemc_optimizedData)}' class='uniSafety'/>
                     </td>`;
       let rxopt = `<td class='uvSafetyTbColumn-popup uniSafetyRxCostCount'>
                                ${rxCost_optimizedData['value']}  <img src='${getImage(rxCost_optimizedData)}' class='uniSafety'/>
                    </td>`;
        /**
         * @author: Yuvraj
         * @date: 23rd march 2017
         * @desc: show column only if it has some value
        */
       if(hosp_unoptimizedData['value'] || hosp_optimizedData['value']) {
           headerHtml += hospHtml;
           innerContent += hospRowHtml;
           htmlData += hospopt;
       }                        
       if(advRec_unoptimizedData['value'] || advRec_optimizedData['value']) {
           headerHtml += adrecHtml;
           innerContent += adRowHtml;
           htmlData += advopt;
       }
       if(drgint_unoptimizedData['value'] || drgint_optimizedData['value']) {
           headerHtml += interHtml;
           innerContent += interRowHtml;
           htmlData += interopt;
       }                        
       if(livfl_unoptimizedData['value'] || livfl_optimizedData['value']) {
           headerHtml += livflHtml;
           innerContent += livflRowHtml;
           htmlData += livflopt;
       }
       if(anemc_unoptimizedData['value'] || anemc_optimizedData['value']) {
           headerHtml += anemHtml;
           innerContent += anemRowHtml;
           htmlData += hospopt;
       }                        
       if(rxCost_unoptimizedData['value'] || rxCost_optimizedData['value']) {
           headerHtml += rxcoHtml;
           innerContent += rxcoRowHtml;
           htmlData += rxopt;
       }

    headerHtml += `</tr>`;
    innerContent += `</tr>`;
    htmlData += `</tr>`;
      if(currentOptSubPop.length) {
          html += headerHtml + innerContent + htmlData + `</table> </div>` + content;
      } else {
          html += headerHtml + innerContent + `</table> </div>` + content;
      }
            $('.treatedSafetyQualityCharts').html(html);

        Session.set(tabName+'Universe_safety',profileData);

    },100);
}

function getValue(Data) {
    if(Data['value']) {
        Data['value'] = Data['value']+'%';
    } else {
        Data['value'] = '';
    }
    return Data;
}



renderUniverseSafetyIndicatorsProfile = function(tabName,profileflag,drugConsideration,profileArray,tabData) {
        var fetchedData =  getSessionDataByTab(tabName);
        var spData = fetchedData.spData,
            unoptSafetyData = tabData?tabData:fetchedData.reactive_spData;
        var profileData = {};
        //return if no data is found
        if(!(spData || unoptSafetyData) ) {
            return;
        }

        var chartData = [],
            isDataOptimized = false;
        
        //set optimized flag
        if(spData['optimizeDataIndicators']) {
            if(spData['optimizeDataIndicators']['Adherence']) {
                isDataOptimized = spData['optimizeDataIndicators']['Adherence']['avg'] > 0 ? true : false;
            }
        }

        //group the data by the category ids        
        unoptSafetyData = _.groupBy(unoptSafetyData,'category_id');
        
        var totalPatients = 0, 
            totalBestRxCost = 0, //total RxCost at best value drug
            totalBestHospCount = 0, //total # patients hospitalised at best value drug
            totalRxCost = 0, //total RxCost 
            totalHospCount = 0, //total # patients hospitalised
            opt_totalRxCost = 0, //total RxCost for optimized sub populations drugs
            opt_totalHospCount = 0; //total # patients hospitalised for optimized sub populations drugs

        var optimizedSubPopulations = []; //all optimized sub populations
        optimizedSubPopulations = isDataOptimized ? spData['optimizeDataIndicators'] : [];

        //loop for all sub populations in the data
        for(var keys in unoptSafetyData) {
            let categoryData = unoptSafetyData[keys]; //all drugs for the given sub population
            
            var currentOptSubPop = []; //drugs for the given optimized sub population
            if(isDataOptimized && (optimizedSubPopulations.hasOwnProperty(keys)) ) {
                currentOptSubPop = optimizedSubPopulations[keys];
                //sort optimized drugs on the value score
                currentOptSubPop.sort(function(a,b){
                    return a.value - b.value;
                });
            }

            //sort all drugs on the value score
            categoryData.sort(function(a,b){
                return a.value - b.value;
            });
            
            var bestData = {};
            var bestValueDrug = [];
            var cat_len = categoryData.length;
            if(profileArray.length == 2){
                if(categoryData[cat_len-1] != undefined){
                        bestData = getCostCountForReactions(categoryData[cat_len-1]['adverse'],categoryData[cat_len-1]['count'],categoryData[cat_len-1]['cost']);
                        totalBestRxCost += bestData.cost;
                        totalBestHospCount += bestData.count;
                }

                if(categoryData[cat_len-2] != undefined){
                        bestData = getCostCountForReactions(categoryData[cat_len-2]['adverse'],categoryData[cat_len-2]['count'],categoryData[cat_len-2]['cost']);
                        totalBestRxCost += bestData.cost;
                        totalBestHospCount += bestData.count;
                }

            }
            else if(profileArray.length == 3){
                for(let kl = 0;kl<profileArray.length;kl++){
                   if(categoryData[cat_len-kl-1] != undefined){
                        bestData = getCostCountForReactions(categoryData[cat_len-kl-1]['adverse'],categoryData[cat_len-kl-1]['count'],categoryData[cat_len-kl-1]['cost']);
                        totalBestRxCost += bestData.cost;
                        totalBestHospCount += bestData.count;
                    }
                }

            }
            else{
                bestValueDrug = categoryData[categoryData.length-1]; //get best value drug
                //get RxCost & # Hosp  data for the best value drug
                bestData = getCostCountForReactions(bestValueDrug['adverse'],bestValueDrug['count'],bestValueDrug['cost']);
                totalBestRxCost += bestData.cost;
                totalBestHospCount += bestData.count;
            }

            

            // console.log('profile');
            // console.log(bestData,profileArray,categoryData);

            //loop for all drugs data
            for(var i=0;i<categoryData.length;i++) {
                var reactions = categoryData[i]['adverse'],
                    drugN = categoryData[i]['count'] ;//* categoryData[i]['utilization'],
                    drugCost = categoryData[i]['cost'],
                    totalCount = 0;

                //get the RxCost & # Hosp computations for the drug
                var data = getCostCountForReactions(reactions,drugN,drugCost);
                totalPatients += drugN;
                totalRxCost += data.cost;
                totalHospCount += data.count;
                

                //get the RxCost & # Hosp computations for the optimized drug
                if(currentOptSubPop.length) {
                    var opt_drugN = currentOptSubPop[i]['DrugN'];
                    opt_drugCost = currentOptSubPop[i]['Cost']['TotalCost'];
                    var opt_data = getCostCountForReactions(reactions,drugN,drugCost,opt_drugN,opt_drugCost);
                    opt_totalRxCost += opt_data.cost;
                    opt_totalHospCount += opt_data.count;
                }
                else {
                    opt_totalRxCost += isDataOptimized ? data.cost : 0;
                    opt_totalHospCount += isDataOptimized ? data.count : 0;
                }
            }            
        }

        //json for RxCost & # Hosp based on optimized & unoptimized ones
        var rxCost_unoptimizedData = {}, hosp_unoptimizedData = {},
            rxCost_optimizedData = {} , hosp_optimizedData = {};
            rxCost_unoptimizedData['name'] = 'unoptimized', hosp_unoptimizedData['name'] = 'unoptimized';
            rxCost_optimizedData['name'] = 'optimized', hosp_optimizedData['name'] = 'optimized';

        //console.log(totalBestRxCost,totalRxCost);
        //get the value & indicator for the best RxCost
        var valueChanges = getValueChanged(totalBestRxCost,totalRxCost);
        // rxCost_unoptimizedData['value'] = totalBestRxCost;
        // rxCost_unoptimizedData['valueChange'] =  valueChanges.value;
        rxCost_unoptimizedData['value'] = valueChanges.value;
        rxCost_unoptimizedData['affected'] = valueChanges.affected;

        //get the value & indicator for the optimized Rxcost
        valueChanges = getValueChanged(totalBestRxCost,opt_totalRxCost);
        // rxCost_optimizedData['value'] = opt_totalRxCost;
        // rxCost_optimizedData['valueChange'] =  valueChanges.value;
        rxCost_optimizedData['value'] = valueChanges.value;
        rxCost_optimizedData['affected'] = valueChanges.affected;

        //push the optimized & unoptimized objects in the chartData
        chartData.push(rxCost_unoptimizedData);
        chartData.push(rxCost_optimizedData);

        //profile
        profileData['rx'] = chartData;

        //empty the chartData for new data
        chartData = [];
        //get the value & indicator for the best #Hosp
        valueChanges = getValueChanged(totalBestHospCount,totalHospCount);
        // hosp_unoptimizedData['value'] =  totalBestHospCount;
        // hosp_unoptimizedData['valueChange'] =  valueChanges.value;
        hosp_unoptimizedData['value'] =  valueChanges.value;
        hosp_unoptimizedData['affected'] = valueChanges.affected;

        //get the value & indicator for the optimized #Hosp
        valueChanges = getValueChanged(totalBestHospCount,opt_totalHospCount);
        // hosp_optimizedData['value'] = opt_totalHospCount;
        // hosp_optimizedData['valueChange'] =  valueChanges.value;
        hosp_optimizedData['value'] = valueChanges.value;
        hosp_optimizedData['affected'] = valueChanges.affected;

        //push the optimized & unoptimized objects in the chartData
        chartData.push(hosp_unoptimizedData);
        chartData.push(hosp_optimizedData);

        //profile
        profileData['hosp'] = chartData;
        // console.log('ren',tabName,profileData);
        return profileData;
        
}
//function to get data by tab name 
function getSessionDataByTab(tabName) {
    if(tabName == 'treated') {
        return {
            spData: Session.get('uniTreatedQualityIndicators'),
            reactive_spData : getFilteredDataset(TreatedAnalyticsData, true)
        };
    }
    else if(tabName == 'treating') {
        return {
            spData: Session.get('uniTreatingQualityIndicators'),
            reactive_spData : TreatingAnalyticsData
        };
    }
    else {
        return {
            spData: Session.get('uniUnTreatedQualityIndicators'),
            reactive_spData : UnTreatedAnalyticsData
        };
    }
}

//function to render the RxCost Chart
// function plotUniSafetyIndicatorChart(data,container) {
//     var chartData = data;
//     /*
//     var unoptimizedData = {}, optimizedData = {};
//     unoptimizedData['name'] = 'unoptimized' , optimizedData['name'] = 'optimized';

//     //for now plotting on Cost but needs to be plotted on AdditionalCost
//     if(data) {
//         unoptimizedData['value'] = data['cost'];
//         unoptimizedData['affected'] = data['affected_cost'];

//         optimizedData['value'] = data['optimizeDataIndicators'] ? data['optimizeDataIndicators']['Cost']['avg'] : 0,
//         optimizedData['affected'] = data['optimizeDataIndicators'] ? data['optimizeDataIndicators']['Cost']['arrowIndicator'] : 'Increased'
//     }
//     else {
//         unoptimizedData['value'] = 0;
//         unoptimizedData['affected'] = 'Increased';

//         optimizedData['value'] = 0;
//         optimizedData['affected'] = 'Increased';
//     }

//     chartData.push(unoptimizedData);
//     chartData.push(optimizedData);*/
//     //console.log('*******Universe Safety RxCost Chart********');
//     //console.log(chartData);
   
//     var outerWidth = 100;
//     var outerHeight = 180;
//     var margin = { left: 10, top: 60, right: 10, bottom: 0 };
//     var barPadding = 0.2;

//     var xColumn = "name";
//     var yColumn = "value";
//     var YAxisLabelText = yColumn == 'expenses' ? 'Projected Expenses' : 'Projected Savings';
//     var colorColumn = "name";

//     var innerWidth  = outerWidth  - margin.left - margin.right;
//     var innerHeight = outerHeight - margin.top  - margin.bottom;

//     d3.select(container).selectAll("*").remove();
//     var svg = d3.select(container).append("svg")
//         .attr("width",  outerWidth)
//         .attr("height", outerHeight);

//     var div  = d3.select(container).append('div')
//                 .attr('class','tooltipcirrhosi')
//                 .style('opacity',0)
//                 .style('position','absolute');

//     var g = svg.append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//     var xAxisG = g.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(0," + innerHeight + ")");
//     var yAxisG = g.append("g")
//         .attr("class", "y axis");

//     var xScale = d3.scale.ordinal().rangeBands([0, innerWidth], barPadding);
//     var yScale = d3.scale.linear().range([innerHeight, 0]);

//         yScale.domain([0, Math.round(d3.max(chartData, function (d){ return d[yColumn]; }))]);
//     var colorScale = d3.scale.category10();
//     colorScale.range(['#809FBC','#5A6D8D']);

//     // Use a modified SI formatter that uses "B" for Billion.
//     var siFormat = d3.format("s");
//     var customTickFormat = function (d){
//     return siFormat(d).replace("G", "B");
//     };

//     xScale.domain(chartData.map( function (d){ return d[xColumn]; }));
//     //yScale.domain([0, d3.max(chartData, function (d){ return d[yColumn]; })]);    
//     colorScale.domain(chartData.map(function (d){ return d[colorColumn]; }));

//     /*var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
//         .outerTickSize(1);
//     // http://stackoverflow.com/questions/35314835/why-the-last-tick-doesnt-have-values-d3-js
//     var yAxis = d3.svg.axis().scale(yScale).orient("left")
//         .tickValues(yScale.ticks(5).concat(yScale.domain()[1]))
//         .tickFormat(customTickFormat)
//         .outerTickSize(1);

//     xAxisG
//       .call(xAxis)
//       .selectAll("text")  
//       .attr("dx", "-.8em")
//       .attr("dy", "1em")
//       .style('font-size', '14px')
//       .style('fill', '#999');

//     yAxisG
//         .call(yAxis)
//         .append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("x", -90)
//         .attr("y", -55)
//         .attr("dy", ".71em")
//         .style("text-anchor", "middle")
//         .style('font-size', '14px')
//         .style('fill', '#999')
//         .text(YAxisLabelText); */

//     var bars = g.selectAll("rect").data(chartData);
//     bars.enter().append("rect")
//       .attr("width", xScale.rangeBand());
//     bars
//       .attr("x", function (d){ return xScale(d[xColumn]); })
//       .attr("y", function (d){ return yScale(d[yColumn]); })
//       .attr("height", function (d){ 
//             if(innerHeight > yScale(d[yColumn]) ) 
//                 return innerHeight - yScale(d[yColumn]); 
//             else 
//                 return yScale(d[yColumn]) - innerHeight;
//         })
//       .attr("fill", function (d){ return colorScale(d[colorColumn]); });
        
//       bars.exit().remove(); 


//       var imgGrp = g.selectAll("image").data(chartData);    
//       imgGrp.enter().append("image")
//         .attr("class", "universesafetyIndicator")
//         .attr("x",  function (d){ return xScale(d[xColumn]); })
//         .attr("y", function (d){ return yScale(d[yColumn]) - 35; })
//         .attr("xlink:href", function (d){ 
//             var image = d["affected"] == "Increased" ? "/ua.png" : "/da.png";
//             if(d.value)
//                 return image; 
//             else
//                 return ;
//         })
//         .style("width", 24)
//         .style("height", 32);

    
//      imgGrp.exit().remove();

//      var textGrp = g.selectAll("text").data(chartData);    
//       textGrp.enter().append("text")
//         .attr("class", "universesafetyIndicator")
//         .attr("x",  function (d){ return xScale(d[xColumn]) + 30; })
//         .attr("y", function (d){ return yScale(d[yColumn]) - 15; })
//         .attr("visibility", function(d){
//             if(d.value)
//                 return "visible"; 
//             else
//                 return "hidden";
//         })
//         .text(function(d){
//             //return d.valueChange + '%';
//             return d.value + '%';
//         });
//       textGrp.exit().remove();  

    

//     // var bars = g.append("g")
//     //     .attr("class", "x axis")
//     //     .attr("transform", "translate(0," + innerHeight + ")");
//     // for(var i = 0; i<chartData.length; i++){
//     //     bars.append("rect")
//     //       .attr("width", xScale.rangeBand());
//     //     bars
//     //       .attr("x", xScale(chartData[i][xColumn]))
//     //       .attr("y",  yScale(chartData[i][yColumn]))
//     //       .attr("height", innerHeight - yScale(chartData[i][yColumn]))
//     //       .attr("fill", colorScale(chartData[i][colorColumn]));

//     //       var image = chartData[i].affected == "Increased" ? "/up-arrow-blue.png" : "/down-arrow-blue.png";
          
//     //       bars.append("image")
//     //         .attr("class", "universesafetyIndicator" + i)
//     //         .attr("x",  xScale(chartData[i][xColumn]))
//     //         .attr("y", innerHeight - yScale(chartData[i][yColumn]) + 30)
//     //         .attr("xlink:href", image)
//     //         .style("width", 32)
//     //         .style("height", 32);
//     // }
// }

function getValueChanged(oldValue , newValue) {
    var json = {},
        valDiff = 0, //difference in both the values
        value = 0;
    
    //if any value is unchanged make the difference 0 
    //(especially for the optimized one at the first time when no data is optimized)
    if(oldValue == 0 || newValue == 0) {
        value = 0;
    }
    else {
        // valDiff = (oldValue - newValue)/oldValue;
        // valDiff = Math.round(valDiff);

        valDiff = (oldValue - newValue);
        //modifed by praveen 03/31/2017
        // value = (valDiff*100) / newValue;
        if(valDiff>0){
            value = (valDiff / oldValue)*100;
        }
        else{
            value = (valDiff / newValue)*100;
        } 
        value = Math.round(value);
    }
    
    json['value'] = Math.abs(value);
    json['affected'] = valDiff > 0 ? 'Increased' : 'Decreased';
    return json;
}







//function to calclute the cost & count percentage for the reactions in each drug
getCostCountForReactions_updated = function(reactions, unoptDrugN, unoptDrugCost, optDrugN, optDrugCost) {
    var hospCost = 0,
        hospPatients = 0;
    reactions = JSON.parse(reactions);

    //loop for all reactions in the drug
    for (var key in reactions) {
        var reaction = reactions[key];
        if (reaction.count > 0) {
            hospPatients += reaction.count;
            hospCost += Math.round(reaction.cost);
        }
    }

    var hospitalizationPercent = (hospPatients / unoptDrugN) * 100;
    hospitalizationPercent = parseFloat(hospitalizationPercent).toFixed(2);

    //hospPatients = hospitalizationPercent * unoptDrugN;

    if (optDrugN || optDrugCost) {
        //if the patientCount & Cost is not similar i.e. that value is optimized
        if (!((optDrugN == unoptDrugN) && (optDrugCost == unoptDrugCost))) {
            var pCount = (hospitalizationPercent * optDrugN) / 100;
            pCount = isNaN(pCount) ? 0 : pCount;
            pCount = Math.round(pCount);
            //return the count based on the new patient count
            return { cost: hospCost * optDrugN, count: Math.round(pCount) };
        }
    }

    return { cost: hospCost * unoptDrugN, count: Math.round(hospPatients) };
}


function getImage(chartData) {
     var image = chartData.affected == "Increased" ? "/ua.png" : "/da.png";
            if(chartData.value)
                return image; 
            else
                return '';
}