
/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

//Pram (13 Apr 17) : Commented code as we are not using this table anymore

//publication for cirrhosis modle costs
// Meteor.publish('getCirrhoticModelCostData',function() {
//     let query = `select * from CIRRHOSIS_MODEL_COST`;
//     let result = liveDb.select(
//         query, [{
//             table: 'CIRRHOSIS_MODEL_COST'
//         }]
//     );
//     return result;
// });