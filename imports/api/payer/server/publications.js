
/**
 * @author: Pramveer
 * @date: 18th Apr 17
 * @desc: commented the code for previous tables that are not being used.
*/

// /* eslint-disable prefer-arrow-callback */

// import { Meteor } from 'meteor/meteor';

// Meteor.publish('getAllPatientsCategory', function() {
//       if (!this.userId) return undefined;

//       return liveDb.select('select * from patients_cat', [{
//           table: 'patients_cat'
//       }]);
//   });
//   Meteor.publish('PatientsAll', function() {
//       if (!this.userId) return undefined;
//       return liveDb.select('select category_id,adherence,utilization,cost,efficacy,value,cost_gap,count,safety from hcv_analytics', [{
//           table: 'hcv_analytics'
//       }]);
//   });
//   // function to get HCV analytics data for Payer Tab
//   Meteor.publish('getHCVAnalyticsData', function(data) {
//       if (!this.userId) return undefined;
//       var query = '';
//       var category_name = "";
//       if (!(data instanceof Array))
//           query = "select  avg(value) as value,avg(best_value) as best_value,avg(cost) as cost,sum(count) as total,(select sum(total_saving) from payer_savings) as total_savings,(select count(*) from HCV_patients where medication!='' and dischargeDate is not null) as count from hcv_analytics;";
//       else {
//           for (var i = 0; i < data.length; i++) {
//               if (data[i])
//                   category_name = category_name + ' ' + data[i];
//           }
//           category_name = category_name.trim();
//           query = 'SELECT therapy.medication, therapy.treatment_period, analytics.cost,analytics.total_length,analytics.value,0 as total_savings,analytics.best_value,analytics.count,' +
//               'analytics.efficacy,analytics.utilization,analytics.adherence,analytics.safety FROM hcv_analytics as analytics LEFT JOIN prescription_ref_chart ' +
//               'as therapy ON analytics.drug_id = therapy.id WHERE analytics.category_id IN' +
//               '(select id from patients_cat where category_name="' + category_name + '")';

//       }
//       return liveDb.select(query, [{
//           table: "hcv_analytics"
//       }]);
//   });

//   // function to get data for genotype chart on payer tab

//   Meteor.publish('getGenotypeData', function() {
//       if (!this.userId) return undefined;
//       var query = 'SELECT analytics.category_id,category.category_name, sum(analytics.count) as count,' +
//           'payer_savings.total_saving as payer_saving ,' +
//           'round( avg(analytics.best_value-analytics.value),2) as value_gap FROM hcv_analytics as analytics ' +
//           'LEFT JOIN patients_cat as category ON analytics.category_id = category.id ' +
//           'left join payer_savings on payer_savings.category_id=category.id group by category.category_name;';

//       return liveDb.select(query, [{
//           table: "hcv_analytics"
//       }]);
//   });
//   //function to get data for hcv patients all treated,untreated,treating
//  /*  Meteor.publish('Hcv_Patients_Data_Advanced', function() {
//       var query = 'SELECT count(*) as total ,'+
//                   ' avg(days_medication) as actual_Period,category_id,avg(claims_cost) as cost,medication,hcv_genotype,hcv_svr12,'+
//                   ' medication,hcv_cirrhosis ,treatment ,treatment_Period,safety_admission_hospital,safety_drug_interactions,'+
//                   ' safety_liver_failure,safety_anemia,claims_insurancePlan,dischargeDate'+
//                   ' from HCV_patients group by hcv_genotype,treatment,medication,treatment_Period,claims_insurancePlan,category_id,hcv_svr12,year(dischargeDate) order by category_id';

//       return liveDb.select(query, [{
//           table: "HCV_patients"
//       }]);
//   });*/
