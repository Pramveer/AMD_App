import * as serverUtils from '../common/serverUtils.js';

Meteor.methods({

    'HcvAnalyticsTreatedBySingleCetagory_Old': function(id) {
        try {
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }

            if (!(id instanceof Array)) {
                return;
            } else {
                var tempData = [];
                var temp = id[1];
                for (var key in temp) {
                    tempData.push(temp[key]);
                }
                var data = [];
                var countd = [];
                for (var i = 0; i < tempData.length; i++) {
                    if (parseInt(tempData[i]['category_id']) == parseInt(id[0])) {
                        data.push(tempData[i]);
                        countd.push(tempData[i]);
                    }
                }
                var total = 0;
                var countd = [];
                var uti = roundToExact100(data, 100, 'utilization');
                if (data.length > 0) {
                    total = data[0].total;
                    //countd =  roundToExact100(data,total,'count');
                }

                for (var i = 0; i < data.length; i++) {
                    data[i].utilization = uti[i];
                    // data[i].count = countd[i];
                }
                return data;

            }
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    'HcvAnalyticsTreatedBySingleCetagory': function(obj) {
        try {
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }

            if (!(obj instanceof Object)) {
                return;
            } else {
                let id = obj.id;
                let data = obj.data;
                var tempData = [];
                let phsData = data.phsData;
                let imsData = data.imsData
                    // for (var key in temp) {
                    //     tempData.push(temp[key]);
                    // }

                //Pram (21st Mar 17): if no drugs are in real world then make the client dataset for that subpopulation as the rwe dataset
                phsData = _.groupBy(phsData, 'category_id');
                imsData = _.groupBy(imsData, 'category_id');

                phsData = phsData[parseInt(id)];
                imsData = imsData[parseInt(id)] ? imsData[parseInt(id)] : phsData[parseInt(id)];

                // var data = [];
                // var countd = [];
                // for (var i = 0; i < tempData.length; i++) {
                //     if (parseInt(tempData[i]['category_id']) == parseInt(id[0])) {
                //         data.push(tempData[i]);
                //         countd.push(tempData[i]);
                //     }
                // }

                // var phsTotal = 0;
                // var phsuti = roundToExact100(phsData, 100, 'utilization');
                // if (phsData.length > 0) {
                //     phsTotal = phsData[0].total;
                // }

                //commented the code for the utilization 
                // for (let i = 0; i < phsData.length; i++) {
                //     phsData[i].utilization = phsuti[i];
                // }


                // var imsTotal = 0;
                // var imsuti = roundToExact100(imsData, 100, 'utilization');
                // if (imsData.length > 0) {
                //     imsTotal = imsData[0].total;
                // }

                //commented the code for the utilization 
                // for (let i = 0; i < imsData.length; i++) {
                //     imsData[i].utilization = imsuti[i];
                // }

                return { imsData: imsData, phsData: phsData };

            }
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },



    /**
     * configure & save new drug in the DB
     */
    'SaveNewMedication': function(data) {
        try {
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }

            if (!(data instanceof Array)) {
                console.log('Invalid Paramaters');
                return;
            }


            data = data[0];
            /*var cat = data.categoryData;
            var query = 'insert into new_prescription_list (category_id,treatmentPeriod,medication,cost,safety,adherence,efficacy) values ';
            for (var i = 0; i < cat.length; i++) {
                if (i == cat.length - 1)
                    query += '( ' + liveDb.db.escape(cat[i].category_id) + ',' + liveDb.db.escape(cat[i].treatmentPeriod) + ',' + liveDb.db.escape(data.drugname) + ',' + liveDb.db.escape(data.drugcost) + ',' + liveDb.db.escape(0) + ',' + liveDb.db.escape(data.drugadherence) + ',' + liveDb.db.escape(data.drugefficacy) + ' )';
                else
                    query += '( ' + liveDb.db.escape(cat[i].category_id) + ',' + liveDb.db.escape(cat[i].treatmentPeriod) + ',' + liveDb.db.escape(data.drugname) + ',' + liveDb.db.escape(data.drugcost) + ',' + liveDb.db.escape(0) + ',' + liveDb.db.escape(data.drugadherence) + ',' + liveDb.db.escape(data.drugefficacy) + ' ),';

            }
            var result = liveDb.db.query(query);
            return result; */

            let categoryData = data.categoryData[0],

                // query = `INSERT INTO new_prescription_list
                //         (genotype, treatment, cirrhosis, category_id, treatmentPeriod, medication, cost, safety, adherence, efficacy)
                //         VALUES 
                //         ("${categoryData.genotype}","${categoryData.treatment}","${categoryData.cirrhosis}",0,${categoryData.treatmentPeriod},
                //         "${data.drugname}",${data.drugcost},0,${data.drugadherence},${data.drugefficacy})`;

                query = `INSERT INTO NEW_PRESCRIPTION_LIST
                        (GENOTYPE, TREATMENT, CIRRHOSIS, CATEGORY_ID, TREATMENT_PERIOD, MEDICATION, COST, SAFETY, ADHERENCE, EFFICACY)
                        VALUES 
                        ("${categoryData.genotype}","${categoryData.treatment}","${categoryData.cirrhosis}",0,${categoryData.treatmentPeriod},
                        "${data.drugname}",${data.drugcost},0,${data.drugadherence},${data.drugefficacy})`;

            // console.log('**************INSERT NEW MEDS CALL ***********');
            // console.log(query);

            let result = liveDb.db.query(query);
            return result;
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }

});

//Meteor methods for replacing stored procedure that are being used
//Currently we're using Stored Procedures as this block is not completely integrated and tested
Meteor.syncMethods({
    // Check weather model exist
    // 'IsModelExist': function(data, callback) {
    //     // var r = {};
    //     // if (!(data instanceof Array))
    //     //     return;
    //     // data = data[0];
    //     // let query = 'select count(*) as num from payer_models where userId = ' + liveDb.db.escape(data.userId) + ' and modelName = ' + liveDb.db.escape(data.modelName);
    //     // // console.log(query);
    //     // liveDb.db.query(query, function(error, result) {
    //     //     if (error) {
    //     //         //If in First place any error occurs
    //     //         // console.log(error);
    //     //         r = {
    //     //             message: "Ready for insertion",
    //     //             statuscode: 0,
    //     //             response: error
    //     //         };
    //     //         callback(undefined, r);

    //     //     } else {
    //     //         // query = 'select count(*) as num from payer_models where userId = ' + liveDb.db.escape(data.userId) + ' and modelId = ' + liveDb.db.escape(data.modelId) +' and modelName = ' + liveDb.db.escape(data.modelName); 
    //     //         // var result = liveDb.db.query(query, function(error1, result1) {
    //     //         //     if (error1) {
    //     //         //         r = {
    //     //         //                 message: "Ready for insertion",
    //     //         //                 statuscode: 0,
    //     //         //                 response: error
    //     //         //             };
    //     //         //     } else {

    //     //         //         if(result1[0].num == 0){
    //     //                     r = {
    //     //                         message: "Ready for insertion",
    //     //                         statuscode: 1,
    //     //                         response: result
    //     //                     };
    //     //                 // }
    //     //                 // else{
    //     //                 //     r = {
    //     //                 //         message: "Ready for updation",
    //     //                 //         statuscode: 2,
    //     //                 //         response: result
    //     //                 //     };
    //     //                 // }

    //     //                 callback(undefined, r);
    //     //           //  }
    //     //        // });

    //     //         // callback(true, true);
    //     //     }
    //     // });
    // },


    //save model name and details
    'saveModelDetails': function(data, callback) {
        try {
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!_.isFunction(callback)) {
                return;
            }

            if (!(data instanceof Array))
                return;
            data = data[0];
            let query = 'select count(*) as num from payer_models where userId = ' + liveDb.db.escape(data.userId) + ' and modelId = ' + liveDb.db.escape(data.modelId);

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callback(result, null);
                } else {
                    let action = '';
                    let val = 0;
                    if (result.length > 0) {
                        val = result[0].num
                    }
                    if (val == 1) {
                        action = 'update';
                        query = 'select modelId from payer_models where userId = ' + liveDb.db.escape(data.userId) + ' and modelName = ' + liveDb.db.escape(data.modelName);
                        liveDb.db.query(query, function(error2, result2) {
                            if (error2) {
                                callback(result2, null);
                            } else {
                                //console.log(result2);
                                let modelid = 0;
                                if (result2.length > 0) {
                                    modelid = result2[0].modelId;
                                    if (modelid != data.modelId) {
                                        callback('exists', undefined);
                                    } else {
                                        query = 'update payer_models set note = ' + liveDb.db.escape(data.note) + ' ,modelName = ' + liveDb.db.escape(data.modelName) + ' ,lastUpdated = ' + liveDb.db.escape(data.lastUpdated) +
                                            ' ,AnalyticsRowData = ' + liveDb.db.escape(data.AnalyticsRowData) + ' ,OptimizedData = ' + liveDb.db.escape(data.OptimizedData) +
                                            ' ,isComplicationRateFilter = ' + liveDb.db.escape(data.isComplicationRateFilter) + ' ,ComplicationRateDrugsData = ' + liveDb.db.escape(data.ComplicationRateDrugsData) +
                                            ' ,SelectedFilters = ' + liveDb.db.escape(data.SelectedFilters) + ' ,RelativeWeightsSliders = ' + liveDb.db.escape(data.RelativeWeightsSliders) +
                                            ' ,UntreatedTabPatietsSlider = ' + liveDb.db.escape(data.UntreatedTabPatietsSlider) + ', localStorageSPData = ' + liveDb.db.escape(data.localStorageSPData) + ', UniverseSavingData = ' + liveDb.db.escape(data.UniverseSavingData) + ' where userId = ' + liveDb.db.escape(data.userId) + ' and modelId = ' + liveDb.db.escape(data.modelId);

                                        liveDb.db.query(query, function(error1, result1) {
                                            if (error1) {
                                                callback(result1, null);
                                            } else {
                                                callback(action, undefined);
                                            }

                                        });
                                    }
                                } else {
                                    query = 'update payer_models set note = ' + liveDb.db.escape(data.note) + ' ,modelName = ' + liveDb.db.escape(data.modelName) + ' ,lastUpdated = ' + liveDb.db.escape(data.lastUpdated) +
                                        ' ,AnalyticsRowData = ' + liveDb.db.escape(data.AnalyticsRowData) + ' ,OptimizedData = ' + liveDb.db.escape(data.OptimizedData) +
                                        ' ,isComplicationRateFilter = ' + liveDb.db.escape(data.isComplicationRateFilter) + ' ,ComplicationRateDrugsData = ' + liveDb.db.escape(data.ComplicationRateDrugsData) +
                                        ' ,SelectedFilters = ' + liveDb.db.escape(data.SelectedFilters) + ' ,RelativeWeightsSliders = ' + liveDb.db.escape(data.RelativeWeightsSliders) +
                                        ' ,UntreatedTabPatietsSlider = ' + liveDb.db.escape(data.UntreatedTabPatietsSlider) + ', localStorageSPData = ' + liveDb.db.escape(data.localStorageSPData) + ', UniverseSavingData = ' + liveDb.db.escape(data.UniverseSavingData) + ' where userId = ' + liveDb.db.escape(data.userId) + ' and modelId = ' + liveDb.db.escape(data.modelId);

                                    liveDb.db.query(query, function(error1, result1) {
                                        if (error1) {
                                            callback(result1, null);
                                        } else {
                                            callback(action, undefined);
                                        }

                                    });
                                }


                            }
                        });


                    }

                    if (val == 0) {
                        action = 'insert';
                        query = 'select count(*) as num from payer_models where userId = ' + liveDb.db.escape(data.userId) + ' and modelName = ' + liveDb.db.escape(data.modelName);
                        liveDb.db.query(query, function(error2, result2) {
                            if (error2) {
                                callback(result2, null);
                            } else {
                                if (result2[0].num >= 1) {
                                    callback('exists', undefined);
                                } else {
                                    query = 'insert into payer_models (userId,tabName,note,modelName,' +
                                        ' lastUpdated,AnalyticsRowData,OptimizedData,isComplicationRateFilter,' +
                                        ' ComplicationRateDrugsData,SelectedFilters,RelativeWeightsSliders,UntreatedTabPatietsSlider,' +
                                        ' localStorageSPData,UniverseSavingData) values (' + liveDb.db.escape(data.userId) + ',' + liveDb.db.escape(data.tabName) + ', ' +
                                        liveDb.db.escape(data.note) + ',' + liveDb.db.escape(data.modelName) + ',' + liveDb.db.escape(data.lastUpdated) + ',' + liveDb.db.escape(data.AnalyticsRowData) + ',' + liveDb.db.escape(data.OptimizedData) + ',' + liveDb.db.escape(data.isComplicationRateFilter) + ',' +
                                        liveDb.db.escape(data.ComplicationRateDrugsData) + ',' + liveDb.db.escape(data.SelectedFilters) + ',' +
                                        liveDb.db.escape(data.RelativeWeightsSliders) + ',' + liveDb.db.escape(data.UntreatedTabPatietsSlider) + ',' + liveDb.db.escape(data.localStorageSPData) + ',' + liveDb.db.escape(data.UniverseSavingData) + ')';

                                    liveDb.db.query(query, function(error1, result1) {
                                        if (error1) {
                                            callback(result1, null);
                                        } else {
                                            callback(action, undefined);
                                        }
                                    });
                                }
                            }
                        });

                    }
                    //console.log(result);

                }
            })
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }

        //return result;
    },


    'removeModelDetails': function(data, callback) {
        try {
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!_.isFunction(callback)) {
                return;
            }

            if (!(data instanceof Array))
                return;
            data = data[0];
            let query = 'delete from payer_models where modelId = ' + liveDb.db.escape(data.modelId) + ' and userId = ' + liveDb.db.escape(data.userId) + ' ';
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callback(result, null);
                } else {
                    query = 'select count(*) as num from payer_models where userId = ' + liveDb.db.escape(data.userId);
                    liveDb.db.query(query, function(error1, result1) {
                        if (error1) {
                            callback(result1, null);
                        } else {
                            let num = 'no'; //result1[0].num;
                            if (result1.length > 0) {
                                num = result1[0].num
                            }

                            if (num == 0) {
                                num = 'no';
                            }

                            callback(num, null);
                        }
                    });
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
        //return result;
    },


    'getUnTreatedPatientsSliderData': function(params, callback) {
        try {
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!isValidParams({
                    params: params,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            // OLD code for validation  
            // if (!params)
            //     return;

            var query = 'select mrn_crswlk as PatientId,age,ethnicity,gender_cd as gender,hcv_genotype as genotype, ' +
                'hcv_cirrhosis as cirrhosis,treatment,claims_insurancePlan as planType,category_id ' +
                'from HCV_patients where medication = "" and dischargeDate is null ' +
                'AND category_id in (' + params.ids + ') ' +
                'AND claims_insurancePlan in("' + params.plans + '")';

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    return;
                } else {
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },


    'getDrugsRiskData': function(data, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!isValidParams({
                    params: data,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var query = 'select * from drugs_risk_data';
            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callback(true, undefined);
                } else {
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }

    },


    'getSavedModelData': function(data, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!(data instanceof Array))
                return;
            data = data[0];
            let query = '';
            if (data.id != undefined) {
                query = 'select * from payer_models where userId = ' + liveDb.db.escape(data.userId) + ' and modelId = ' + liveDb.db.escape(data.id) + ' order by lastUpdated desc';

            } else {
                query = 'select * from payer_models where userId = ' + liveDb.db.escape(data.userId) + ' order by lastUpdated desc';

            }

            liveDb.db.query(query, function(error, result) {
                if (error) {
                    callback(undefined, null);
                } else {
                    callback(undefined, result);
                }
            });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }
});

//function to get range of values to exact target value
function roundToExact100(l, target, key) {
    var off = target - _.reduce(l, function(acc, x) {
        return acc + Math.round(x[key])
    }, 0);
    return _.chain(l).
        //sortBy(function(x) { return Math.round(x.a) - x.a }).
    map(function(x, i) {
        return Math.round(x[key]) + (off > i) - (i >= (l.length + off))
    }).
    value();
}

let getFdaCompliantQuery = (fdaCheck) => {
    if (fdaCheck.toLowerCase() === 'yes') {
        return `AND medication.TREATMENT_PERIOD IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else if (fdaCheck.toLowerCase() === 'no') {
        return `AND medication.TREATMENT_PERIOD NOT IN (${serverUtils.getFDACompliantTreatmentPeriod()}) `;
    } else {
        return ``;
    }
}