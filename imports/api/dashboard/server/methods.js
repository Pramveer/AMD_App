/**
 * Author: Pram
 * Date: 25th May 2018
 * Desc: Backend API for dashboard Page
 */

Meteor.syncMethods({
    'getDashboardData': (params, callbackFn) => {
        let query = 'SELECT * FROM PATIENT';

        try{
            liveDb.db.query(query, (error, result) => {
                if (error) {
                    callbackFn(error, null);
                }
                else {
                    callbackFn(undefined, result);
                }
            });
        }
        catch(e) {
            console.log('Error in Processing method');
        }
    }
});