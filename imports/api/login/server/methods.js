// commented code due to package installation error
Future = Npm.require('fibers/future');

//Custom Login method using Account package with MySql
Accounts.registerLoginHandler(function(options) {
    if (!options.clientUser || !options.clientPassword)
        return undefined; // don't handle

    let future_mysql = new Future();

    let r = {};
    // liveDb.db.query('Call validateUser(?,?)', [options.clientUser, options.clientPassword],
    liveDb.db.query('Call validateUser(?,?)', [options.clientUser, options.clientPassword],
        function(error, result) {
            if (error) {
                // To do log sql error
                console.log(error);
                r = {
                    message: "Some Internal Problem while login",
                    statuscode: -1,
                    response: error,
                    isValid: false
                };

                future_mysql.return(r);

            } else if (result && result.length > 0 && result[0][0].UserCount > 0) {
                // success full login
                let nested_query_future = new Future();
                liveDb.db.query(
                    'Call StoreUserLog(?,?)', [options.clientUser, 'login'],
                    function(error, result) {
                        console.log(error);
                        if (error) {
                            //If in First place any error occurs
                            r = {
                                message: "Some internal problem while adding user log",
                                statuscode: 0,
                                response: error,
                                isValid: true
                            };


                        } else if (result && result.affectedRows > 0) {
                            r = {
                                message: "User loggedin successfully",
                                statuscode: 0,
                                response: result,
                                isValid: true
                            };


                        } else {
                            // invalid username or password
                            r = {
                                message: "User loggedin but log not created",
                                statuscode: 0,
                                response: result,
                                isValid: true
                            };

                        }

                    });
                //Set validateUser response
                nested_query_future.return(result);
                r.response = nested_query_future.wait();
                r.isValid = true;
                future_mysql.return(r);
            } else {
                // invalid username or password
                r = {
                    message: "Invalid username/password",
                    statuscode: 1,
                    response: result,
                    isValid: false
                };
                future_mysql.return(r);
            }
        });

    //End ValidateUser Query

    let userId;
    //wait for mysql query response

    let queryResult = future_mysql.wait();


    let isValid = queryResult.isValid;
    // change selector based on username return from database after validate
    // If user validated successfully from MySQL DB then proceed for MongoDb Operation
    if (isValid) {
        //// Commented OLD code which is breaking login functionality for case sensitive username
        // var selector = {
        //     "username": options.clientUser
        // };
        //
        //// OLD Code End
        /**
         * @author: Arvind
         * @reviewer: 
         * @date: 02-Mar-2017
         * @desc: Added condition to check user exist in mongodb without case insensitivity
         * @Reference link :http://stackoverflow.com/questions/23028008/meteor-how-to-do-a-case-insensitive-collection-findone
         * http://stackoverflow.com/questions/7101703/how-do-i-make-case-insensitive-queries-on-mongodb
         */
        let selector = {
            "username": {
                //  $regex: `^${options.clientUser}$`,
                $regex: options.clientUser,
                $options: 'i'
            }
        };
        let userDetail = queryResult.response[0][0];
        let user = Meteor.users.findOne(selector);
        //console.log(user);
        if (!user) {
            // insert more details so we can utilize this information in future like roles
            userId = Meteor.users.insert({
                "username": userDetail.username.toLowerCase(),
                "emails": [{
                    "address": userDetail.email.toLowerCase()
                }],
                "organization": userDetail.organization,
                "org_id": userDetail.org_id,
                "role": userDetail.role,
                "tabs_name": userDetail.tabs_name,
                "profile": {
                    userDetail: userDetail
                }
            });
            // Need _id of existing user record so this call must come
            // after `Accounts.createUser` or `Accounts.onCreate`
            Roles.addUsersToRoles(userId, [userDetail.role_name], 'default-group');
        } else {
            // update more details so we can utilize this information in future like roles
            userId = user._id;
            Meteor.users.update(userId, {
                $set: {
                    'profile.userDetail': userDetail
                }
            });
        }

        console.log("*** USER ID ***");
        console.log(userId);

        //Once user is validated with MySql and record are inserted in mongo db
        //the just generate token for authentication and store in db
        // user specific token

        //creating the token and adding to the user
        //This token used for authentication using Mongo DB with help of Account Package
        let stampedToken = Accounts._generateStampedLoginToken();
        Meteor.users.update(userId, {
            $push: {
                'services.resume.loginTokens': Accounts._hashStampedToken(stampedToken),
            }
        });
        return {
            userId: userId
        };
    } else {
        return {
            error: new Meteor.Error(403, "Invalid username or password.")
        };
    }
});

// Update logged in user information in MySQL database as well as in Mongo DB

Meteor.methods({
    //Update user info password
    'UpdatePassword': function(user, oldPass, newPass, email, callback) {
        try {
            if (!this.userId) return undefined;
            if (!user || !oldPass || !newPass || !email) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var r = {};
            var future_update_password = new Future();
            liveDb.db.query(
                'Call UpdatePassword(?,?,?,?)', [user, oldPass, newPass, email],
                function(error, result) {
                    console.log(error);
                    if (error) {
                        //If in First place any error occurs
                        r = {
                            message: "Some internal problem while updating password",
                            statuscode: -1,
                            response: error,
                            isValid: false
                        };

                    } else if (result && result.affectedRows > 0) {
                        r = {
                            message: "User password updated successfully",
                            statuscode: 0,
                            response: result,
                            isValid: true
                        };


                    } else {
                        // invalid username or password
                        r = {
                            message: "Updating password fail",
                            statuscode: 0,
                            response: result,
                            isValid: false
                        };

                    }
                    //wait for query response using Future
                    future_update_password.return(r);
                });
            var queryResult = future_update_password.wait();

            //Query executed success fully then update mongodb also
            if (queryResult.isValid) {
                var rowAffected = Meteor.users.update(this.userId, {
                    $set: {
                        'emails': [{
                            "address": email
                        }],
                        'profile.userDetail.email': email
                    }
                });
            } else {
                console.log("User is not logged in");
            }
            //callback(undefined, queryResult);
            return queryResult;
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },
});


//Server side sync method to manipulate data
Meteor.syncMethods({

    //validate user from database with Stored Procedure
    'ValidateUser': function(user, pass, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!user || !pass || !_.isFunction(callback)) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var r = {};
            liveDb.db.query('Call validateUser(?,?)', [user, pass],
                function(error, result) {
                    if (error) {
                        // To do log sql error
                        console.log(error);
                        r = {
                            message: "Some Internal Problem while login",
                            statuscode: -1,
                            response: error,
                            isValid: false
                        };
                        callback(undefined, r);

                    } else if (result && result.length > 0 && result[0][0].UserCount > 0) {
                        // success full login

                        liveDb.db.query(
                            'Call StoreUserLog(?,?)', [user, 'login'],
                            function(error, result) {
                                console.log(error);
                                if (error) {
                                    //If in First place any error occurs
                                    r = {
                                        message: "Some internal problem while adding user log",
                                        statuscode: 0,
                                        response: error,
                                        isValid: true
                                    };

                                } else if (result && result.affectedRows > 0) {
                                    r = {
                                        message: "User loggedin successfully",
                                        statuscode: 0,
                                        response: result,
                                        isValid: true
                                    };


                                } else {
                                    // invalid username or password
                                    r = {
                                        message: "User loggedin but log not created",
                                        statuscode: 0,
                                        response: result,
                                        isValid: true
                                    };

                                }

                            });
                        //Set validateUser response
                        r.response = result;
                        r.isValid = true;
                        callback(undefined, r);
                    } else {
                        // invalid username or password
                        r = {
                            message: "Invalid username/password",
                            statuscode: 1,
                            response: result,
                            isValid: false
                        };
                        callback(undefined, r);
                    }
                });
            return r;
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    //Logout user from system
    'UserLogout': function(user, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!user || !_.isFunction(callback)) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var r = {};
            liveDb.db.query(
                'Call StoreUserLog(?,?)', [user, 'logout'],
                function(error, result) {
                    console.log(error);
                    if (error) {
                        //If in First place any error occurs
                        r = {
                            message: "Some internal problem while adding user log",
                            statuscode: 0,
                            response: error,
                            isValid: true
                        };
                        callback(undefined, r);
                    } else if (result && result.affectedRows > 0) {
                        r = {
                            message: "User loggedout successfully",
                            statuscode: 0,
                            response: result,
                            isValid: true
                        };

                        callback(undefined, r);
                    } else {
                        // invalid username or password
                        r = {
                            message: "User not loggedout",
                            statuscode: 0,
                            response: result,
                            isValid: false
                        };
                        callback(undefined, r);
                    }

                });
            return r;
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    //Forgot username or Password
    'ForgotPassword': function(email, callback) {
        try {
            // Early exit condition
            //console.log(this.userId);
            if (!isValidUser({
                    userId: this.userId
                })) {
                console.log('User not logged in');
                return undefined;
            }
            if (!email || !_.isFunction(callback)) {
                console.log('Invalid Parameters');
                return undefined;
            }
            console.log(email);
            var r = {};
            liveDb.db.query(
                'Call ForgotPassword(?)', [email],
                function(error, result) {
                    console.log(error);
                    if (error) {
                        //If in First place any error occurs
                        r = {
                            message: "Some internal problem while updating password",
                            statuscode: -1,
                            response: error,
                            isValid: false
                        };
                        callback(undefined, r);
                    } else if (result && result[0].length > 0) {

                        r = {
                            message: "Password  send successfully",
                            statuscode: 0,
                            response: result,
                            isValid: true
                        };

                        callback(undefined, r);
                    } else {
                        // invalid username or password
                        r = {
                            message: "No such user exist",
                            statuscode: 0,
                            response: result,
                            isValid: false
                        };
                        callback(undefined, r);
                    }

                });
            return r;
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    // Add or Update Clinical Selection Data to database
    'AddClinicalSelection': function(clinicalData, callback) {
        try {
            //Add Clinical Selection Data if it is not already exist for patientId and PRoviderId

            if (!this.userId) return new Meteor.Error(403, "User is not logged in");
            // Early exit condition
            //console.log(this.userId);
            // if (!isValidUser({
            //         userId: this.userId
            //     })) {
            //     console.log('User not logged in');
            //     return undefined;
            // }
            if (!isValidParams({
                    params: clinicalData,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var r = {};
            //Test Sync method for select query
            liveDb.db.query('select count(*) as Count from clinicalselectiondetail where ProviderId=? and PatientId=? ', [clinicalData.ProviderId, clinicalData.PatientId],

                function(error, result) {

                    // console.log(result);

                    if (error) {
                        //If in First place any error occurs
                        r = {
                            message: "Some internal problem while Clinical Selection insertion",
                            statuscode: -1,
                            response: error
                        };
                        callback(undefined, r);

                    } else if (result && result.length > 0 && result[0].Count > 0) {

                        // console.log('result Count:' + result[0].Count);
                        // If Provider and patient Id matches then update record with new value
                        var query = '';
                        var queryData;
                        if (clinicalData.IsDrugLastCaptured) {
                            //Need to update only last drug capture count and date
                            query = "UPDATE clinicalselectiondetail SET LastSelectedDrug=?,LastDrugCaptureCount=LastDrugCaptureCount+?,LastDrugCaptureDate=?,EfficacyCount=EfficacyCount+?, AdherenceCount=AdherenceCount+?, SafetyCount=SafetyCount+?, UtilizationCount=UtilizationCount+?, CostCount=CostCount+?, TotalValueCount=TotalValueCount+? WHERE ProviderId=? and PatientId=?";
                            queryData = [clinicalData.LastSelectedDrug, clinicalData.LastDrugCaptureCount, clinicalData.LastDrugCaptureDate, clinicalData.EfficacyCount, clinicalData.AdherenceCount, clinicalData.SafetyCount, clinicalData.UtilizationCount, clinicalData.CostCount, clinicalData.TotalValueCount, clinicalData.ProviderId, clinicalData.PatientId]

                        } else {
                            //Need to update only last selection capture count and date
                            query = "UPDATE clinicalselectiondetail SET LastSelectedDrug=?,DrugSelectionCaptureCount = DrugSelectionCaptureCount + ?,DrugSelectionCaptureDate=? ,EfficacyCount=EfficacyCount+?, AdherenceCount=AdherenceCount+?, SafetyCount=SafetyCount+?, UtilizationCount=UtilizationCount+?, CostCount=CostCount+?, TotalValueCount=TotalValueCount+?  WHERE ProviderId=? and PatientId=?";
                            queryData = [clinicalData.LastSelectedDrug, clinicalData.DrugSelectionCaptureCount, clinicalData.DrugSelectionCaptureDate, clinicalData.EfficacyCount, clinicalData.AdherenceCount, clinicalData.SafetyCount, clinicalData.UtilizationCount, clinicalData.CostCount, clinicalData.TotalValueCount, clinicalData.ProviderId, clinicalData.PatientId];
                        }



                        liveDb.db.query(
                            query, queryData,
                            function(error, result) {
                                if (error) {
                                    //Handle error whle updating records
                                    console.log(error);
                                    r = {
                                        message: "Some internal problem while updating clinical selection",
                                        statuscode: -1,
                                        response: error
                                    };
                                    callback(undefined, r);

                                } else if (result && result.affectedRows > 0) {
                                    r = {
                                        message: "response updated with new value",
                                        statuscode: 0,
                                        response: result

                                    };

                                    callback(undefined, r);
                                } else {
                                    r = {
                                        message: "response not updated",
                                        statuscode: 2,
                                        response: result
                                    };
                                    callback(undefined, r);
                                }
                            });


                    } else {
                        // No Error, No Existing records then insert new entry in table
                        //no record exist add new entry

                        //Comment insert code functionality
                        liveDb.db.query(
                            'INSERT INTO clinicalselectiondetail(ProviderId, PatientId, LastSelectedDrug, LastDrugCaptureCount, DrugSelectionCaptureCount, LastDrugCaptureDate, DrugSelectionCaptureDate,EfficacyCount, AdherenceCount, SafetyCount, UtilizationCount, CostCount, TotalValueCount)  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [clinicalData.ProviderId, clinicalData.PatientId, clinicalData.LastSelectedDrug, clinicalData.LastDrugCaptureCount, clinicalData.DrugSelectionCaptureCount, clinicalData.LastDrugCaptureDate, clinicalData.DrugSelectionCaptureDate, clinicalData.EfficacyCount, clinicalData.AdherenceCount, clinicalData.SafetyCount, clinicalData.UtilizationCount, clinicalData.CostCount, clinicalData.TotalValueCount],
                            function(error, result) {
                                console.log(error);
                                if (error) {
                                    //If in First place any error occurs
                                    r = {
                                        message: "Some internal problem while Clinical Selection insertion",
                                        statuscode: -1,
                                        response: error
                                    };
                                    callback(undefined, r);
                                } else if (result && result.affectedRows > 0) {
                                    r = {
                                        message: "Clinical selection added successfully",
                                        statuscode: 0,
                                        response: result

                                    };
                                    callback(undefined, r);
                                } else {
                                    r = {
                                        message: "Clinical selection record not added",
                                        statuscode: 2,
                                        response: result
                                    };
                                    callback(undefined, r);
                                }

                            });
                    }

                    //To do if error occurs at first place

                });
            return r;
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    // Add or Update Drug Prescription Data to database
    'AddDrugPrescription': function(pData, callback) {
        try {
            //Add Drug Prescription Data if it is not already exist for patientId and PRoviderId
            if (!this.userId) return new Meteor.Error(403, "User is not logged in");
            // Early exit condition
            //console.log(this.userId);
            // if (!isValidUser({
            //         userId: this.userId
            //     })) {
            //     console.log('User not logged in');
            //     return undefined;
            // }
            if (!isValidParams({
                    params: pData,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var r = {};
            liveDb.db.query('select count(*) as Count,isPrescribed from drugprescribingdetail where ProviderId=? and PatientId=? and DrugName=? ', [pData.ProviderId, pData.PatientId, pData.DrugName],

                function(error, result) {
                    if (error) {
                        console.log(error);
                        //If in First place any error occurs
                        r = {
                            message: "Some internal problem while Clinical Selection insertion",
                            statuscode: -1,
                            response: error
                        };
                        callback(undefined, r);

                    } else if (result && result.length > 0 && result[0].Count > 0) {
                        //Record already prescribed so no need to update or insert


                        //console.log('result Count:' + result[0].Count);
                        // If Provider , patient Id and drug name  matches then update record with new value
                        var query = '';
                        var queryData;
                        //Need to update only last drug capture count and date
                        query = "UPDATE drugprescribingdetail SET PrescribeDate=?,EfficacyCount=EfficacyCount+?, AdherenceCount=AdherenceCount+?, SafetyCount=SafetyCount+?, UtilizationCount=UtilizationCount+?, CostCount=CostCount+?, TotalValueCount=TotalValueCount+?,CheckBoxCount=CheckBoxCount+? WHERE ProviderId=? and PatientId=? and DrugName=?";
                        queryData = [moment().format("YYYY-MM-DD HH:mm:ss"), pData.EfficacyCount, pData.AdherenceCount, pData.SafetyCount, pData.UtilizationCount, pData.TotalValueCount, pData.CostCount, pData.CheckBoxCount, pData.ProviderId, pData.PatientId, pData.DrugName];

                        liveDb.db.query(
                            query, queryData,
                            function(error, result) {
                                if (error) {
                                    //Handle error whle updating records
                                    console.log(error);
                                    console.log('prescription insert error');
                                    r = {

                                        message: "Some internal problem while updating clinical selection",
                                        statuscode: -1,
                                        response: error
                                    };
                                    callback(undefined, r);

                                } else if (result && result.affectedRows > 0) {
                                    r = {
                                        message: "response updated with new value",
                                        statuscode: 0,
                                        response: result

                                    };

                                    callback(undefined, r);
                                } else {
                                    r = {
                                        message: "response not updated",
                                        statuscode: 2,
                                        response: result
                                    };
                                    callback(undefined, r);
                                }
                            });

                    } else {
                        // If record not exist and it is not prescribed then insert that record entry to database

                        liveDb.db.query(
                            'INSERT INTO drugprescribingdetail(ProviderId, PatientId, DrugName, DrugId, isPrescribed, PrescribeDate,EfficacyCount, AdherenceCount, SafetyCount, UtilizationCount, CostCount, TotalValueCount,CheckBoxCount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [pData.ProviderId, pData.PatientId, pData.DrugName, pData.DrugId, pData.isPrescribed, moment().format("YYYY-MM-DD HH:mm:ss"), pData.EfficacyCount, pData.AdherenceCount, pData.SafetyCount, pData.UtilizationCount, pData.CostCount, pData.TotalValueCount, pData.CheckBoxCount],
                            function(error, result) {

                                if (error) {
                                    console.log('prescription insert error');
                                    console.log(error);
                                    //If in First place any error occurs
                                    r = {
                                        message: "Some internal problem while drug prescribing insertion",
                                        statuscode: -1,
                                        response: error
                                    };
                                    callback(undefined, r);
                                } else if (result && result.affectedRows > 0) {
                                    r = {
                                        message: "Drug prescribing added successfully",
                                        statuscode: 0,
                                        response: result
                                    };

                                    callback(undefined, r);
                                } else {
                                    r = {
                                        message: "Drug prescribing record not added",
                                        statuscode: 1,
                                        response: result
                                    };
                                    callback(undefined, r);
                                }

                            });

                    }
                });

        } catch (ex) {
            console.log(JSON.stringify(ex));
        }

    },

    // Check weather drug is already prescribed or not
    'IsDrugPrescribed': function(pData, callback) {
        try {
            //Check weather drug is prescribed or not for selected patient

            if (!this.userId) return new Meteor.Error(403, "User is not logged in");
            // Early exit condition
            //console.log(this.userId);
            // if (!isValidUser({
            //         userId: this.userId
            //     })) {
            //     console.log('User not logged in');
            //     return undefined;
            // }
            if (!isValidParams({
                    params: pData,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var r = {};
            liveDb.db.query('select count(*) as Count,isPrescribed from drugprescribingdetail where ProviderId=? and PatientId=? and DrugName=? and isPrescribed=1', [pData.ProviderId, pData.PatientId, pData.DrugName],

                function(error, result) {
                    if (error) {
                        //If in First place any error occurs
                        console.log(error);
                        r = {
                            message: "Some internal problem while Clinical Selection insertion",
                            statuscode: -1,
                            response: error
                        };
                        callback(undefined, r);

                    } else if (result && result.length > 0 && result[0].Count > 0) {
                        //Record already prescribed so no need to update or insert
                        r = {
                            message: "Drug already prescribed",
                            statuscode: 0,
                            response: result

                        };
                        callback(undefined, r);

                    } else {
                        //Drug not prescribed
                        r = {
                            message: "Drug not prescribed",
                            statuscode: 1,
                            response: result
                        };
                        callback(undefined, r);
                    }
                });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    // Add Network
    'AddNetwork': function(pData, callback) {
        try {

            if (!this.userId) return new Meteor.Error(403, "Access Denied");
            // Early exit condition
            //console.log(this.userId);
            // if (!isValidUser({
            //         userId: this.userId
            //     })) {
            //     console.log('User not logged in');
            //     return undefined;
            // }
            if (!isValidParams({
                    params: pData,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }

            var r = {};

            liveDb.db.query('INSERT INTO network_master(network) values(?)', [pData.NetworkName],

                function(error, result) {
                    if (error) {
                        //If in First place any error occurs
                        console.log(error);
                        r = {
                            message: "Some internal problem while network insertion",
                            statuscode: -1,
                            response: error
                        };
                        callback(undefined, r);

                    } else if (result && result.affectedRows > 0) {
                        //Network added
                        r = {
                            message: "Network added successfully",
                            statuscode: 0,
                            response: result

                        };
                        callback(undefined, r);

                    } else {
                        //Network not added
                        r = {
                            message: "Network not added",
                            statuscode: 1,
                            response: result
                        };
                        callback(undefined, r);
                    }
                });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },

    // Add Provider
    'AddProvider': function(pData, callback) {
        try {
            if (!this.userId) return new Meteor.Error(403, "Access Denied");
            // Early exit condition
            //console.log(this.userId);
            // if (!isValidUser({
            //         userId: this.userId
            //     })) {
            //     console.log('User not logged in');
            //     return undefined;
            // }
            if (!isValidParams({
                    params: pData,
                    cb: callback
                })) {
                console.log('Invalid Parameters');
                return undefined;
            }
            var r = {};

            liveDb.db.query('INSERT INTO `organization_master`(name, network_id) VALUES (?,?)', [pData.ProviderName, pData.NetworkId],

                function(error, result) {
                    if (error) {
                        //If in First place any error occurs
                        console.log(error);
                        r = {
                            message: "Some internal problem while provider insertion",
                            statuscode: -1,
                            response: error
                        };
                        callback(undefined, r);

                    } else if (result && result.affectedRows > 0) {
                        //Provider added
                        r = {
                            message: "Provider added successfully",
                            statuscode: 0,
                            response: result

                        };
                        callback(undefined, r);

                    } else {
                        //Provider not added
                        r = {
                            message: "Provider not added",
                            statuscode: 1,
                            response: result
                        };
                        callback(undefined, r);
                    }
                });
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },


    // // Check weather user exist
    // 'IsUserExist': function(pData, callback) {
    //     try {
    //         if (!this.userId || this.userId && !Roles.userIsInRole(this.userId, 'Admin', 'default-group')) return new Meteor.Error(403, "Access Denied");
    //         // Early exit condition
    //         //console.log(this.userId);
    //         // if (!isValidUser({
    //         //         userId: this.userId
    //         //     })) {
    //         //     console.log('User not logged in');
    //         //     return undefined;
    //         // }
    //         if (!isValidParams({
    //                 params: pData,
    //                 cb: callback
    //             })) {
    //             console.log('Invalid Parameters');
    //             return undefined;
    //         }
    //         //Check weather drug is prescribed or not for selected patient
    //         var r = {};

    //         liveDb.db.query('Call IsUserExist(?,?,?,?)', [pData.UserEmail, pData.UserName, pData.OpMode, pData.UserId],

    //             function(error, result) {
    //                 if (error) {
    //                     //If in First place any error occurs
    //                     console.log(error);
    //                     r = {
    //                         message: "Some internal problem while check user availability check",
    //                         statuscode: -1,
    //                         response: error
    //                     };
    //                     callback(undefined, r);

    //                 } else if (result && result.length > 0 && result[0][0].UserCount > 0) {
    //                     //User already exist
    //                     r = {
    //                         message: "Username/Email already exist",
    //                         statuscode: 0,
    //                         response: result

    //                     };
    //                     callback(undefined, r);

    //                 } else {
    //                     //User not exist
    //                     r = {
    //                         message: "Ready for insertion",
    //                         statuscode: 1,
    //                         response: result
    //                     };
    //                     callback(undefined, r);
    //                 }
    //             });
    //     } catch (ex) {
    //         console.log(JSON.stringify(ex));
    //     }
    // },


    // Check weather user exist
    'IsUserExist': function(pData, callback) {
        try {

            let user = null;
            if (this.userId) {
                user = Meteor.users.findOne(this.userId);
            }

            let flag = false;
            if (!this.userId || this.userId && Roles.userIsInRole(this.userId, 'Admin', 'default-group')) {
                flag = true;
            } else if (user && user.profile.userDetail.is_super_user === 1) {
                flag = true;
            } else {
                return new Meteor.Error(403, "Access Denied");
            }

            if (flag) {

                // Early exit condition
                //console.log(this.userId);
                // if (!isValidUser({
                //         userId: this.userId
                //     })) {
                //     console.log('User not logged in');
                //     return undefined;
                // }
                if (!isValidParams({
                        params: pData,
                        cb: callback
                    })) {
                    console.log('Invalid Parameters');
                    return undefined;
                }
                //Check weather drug is prescribed or not for selected patient
                var r = {};

                liveDb.db.query('Call IsUserExist(?,?,?,?)', [pData.UserEmail, pData.UserName, pData.OpMode, pData.UserId],

                    function(error, result) {
                        if (error) {
                            //If in First place any error occurs
                            console.log(error);
                            r = {
                                message: "Some internal problem while check user availability check",
                                statuscode: -1,
                                response: error
                            };
                            callback(undefined, r);

                        } else if (result && result.length > 0 && result[0][0].UserCount > 0) {
                            //User already exist
                            r = {
                                message: "Username/Email already exist",
                                statuscode: 0,
                                response: result

                            };
                            callback(undefined, r);

                        } else {
                            //User not exist
                            r = {
                                message: "Ready for insertion",
                                statuscode: 1,
                                response: result
                            };
                            callback(undefined, r);
                        }
                    });
            }
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },


    // // Add new User
    // 'AddUser': function(pData, callback) {
    //     try {

    //         // pending  -- take role and Org   from super user if current user is super user.

    //         if (!this.userId || this.userId && !Roles.userIsInRole(this.userId, 'Admin', 'default-group')) return new Meteor.Error(403, "Access Denied");
    //         // Early exit condition
    //         //console.log(this.userId);
    //         // if (!isValidUser({
    //         //         userId: this.userId
    //         //     })) {
    //         //     console.log('User not logged in');
    //         //     return undefined;
    //         // }
    //         if (!isValidParams({
    //                 params: pData,
    //                 cb: callback
    //             })) {
    //             console.log('Invalid Parameters');
    //             return undefined;
    //         }
    //         var r = {};

    //         // liveDb.db.query('Call AddUser(?,?,?,?,?,?,?,?,?,?)', [pData.User.toLowerCase(), pData.Pass, pData.Email.toLowerCase(), pData.OrgId, pData.RoleId, pData.FName, pData.LName, pData.OpMode, pData.Tabs, pData.Gender],


    //         liveDb.db.query('Call AddUser_Updated(?,?,?,?,?,?,?,?,?,?,?)', [pData.User.toLowerCase(), pData.Pass, pData.Email.toLowerCase(), pData.OrgId, pData.RoleId, pData.FName, pData.LName, pData.OpMode, pData.Tabs, pData.Gender, pData.SuperUser],

    //             function(error, result) {
    //                 if (error) {
    //                     //If in First place any error occurs
    //                     console.log(error);
    //                     r = {
    //                         message: "Some internal problem while user insertion",
    //                         statuscode: -1,
    //                         response: error
    //                     };
    //                     callback(undefined, r);

    //                 } else if (result && result.affectedRows > 0) {
    //                     //User added
    //                     //To Do Send email once user created
    //                     r = {
    //                         message: "User added successfully",
    //                         statuscode: 0,
    //                         response: result,
    //                         userData: pData

    //                     };
    //                     callback(undefined, r);

    //                 } else {
    //                     //User not added
    //                     r = {
    //                         message: "User not added",
    //                         statuscode: 1,
    //                         response: result
    //                     };
    //                     callback(undefined, r);
    //                 }
    //             });
    //     } catch (ex) {
    //         console.log(JSON.stringify(ex));
    //     }
    // },



    // Add new User
    'AddUser': function(pData, callback) {
        try {

            let user = null;
            if (this.userId) {
                user = Meteor.users.findOne(this.userId);
            }

            let flag = false;
            if (!this.userId || this.userId && Roles.userIsInRole(this.userId, 'Admin', 'default-group')) {
                flag = true;
            } else if (user && user.profile.userDetail.is_super_user === 1) {
                flag = true;
            } else {
                return new Meteor.Error(403, "Access Denied");
            }

            if (flag) {
                // Early exit condition
                //console.log(this.userId);
                // if (!isValidUser({
                //         userId: this.userId
                //     })) {
                //     console.log('User not logged in');
                //     return undefined;
                // }
                if (!isValidParams({
                        params: pData,
                        cb: callback
                    })) {
                    console.log('Invalid Parameters');
                    return undefined;
                }
                var r = {};

                liveDb.db.query('Call AddUser(?,?,?,?,?,?,?,?,?,?,?)', [pData.User.toLowerCase(), pData.Pass, pData.Email.toLowerCase(), pData.OrgId, pData.RoleId, pData.FName, pData.LName, pData.OpMode, pData.Tabs, pData.Gender, pData.SuperUser],

                    function(error, result) {
                        if (error) {
                            //If in First place any error occurs
                            console.log(error);
                            r = {
                                message: "Some internal problem while user insertion",
                                statuscode: -1,
                                response: error
                            };
                            callback(undefined, r);

                        } else if (result && result.affectedRows > 0) {
                            //User added
                            //To Do Send email once user created
                            r = {
                                message: "User added successfully",
                                statuscode: 0,
                                response: result,
                                userData: pData

                            };
                            callback(undefined, r);

                        } else {
                            //User not added
                            r = {
                                message: "User not added",
                                statuscode: 1,
                                response: result
                            };
                            callback(undefined, r);
                        }
                    });
            }
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    },


    // //Reset password
    // 'ResetPassword': function(pData, callback) {
    //     try {
    //         if (!this.userId || this.userId && !Roles.userIsInRole(this.userId, 'Admin', 'default-group')) return new Meteor.Error(403, "Access Denied");
    //         var r = {};
    //         // Early exit condition
    //         //console.log(this.userId);
    //         // if (!isValidUser({
    //         //         userId: this.userId
    //         //     })) {
    //         //     console.log('User not logged in');
    //         //     return undefined;
    //         // }
    //         if (!isValidParams({
    //                 params: pData,
    //                 cb: callback
    //             })) {
    //             console.log('Invalid Parameters');
    //             return undefined;
    //         }
    //         liveDb.db.query(
    //             'Call ResetPassword(?,?)', [pData.email, pData.password],
    //             function(error, result) {
    //                 console.log(error);
    //                 if (error) {
    //                     //If in First place any error occurs
    //                     r = {
    //                         message: "Some internal problem while updating password",
    //                         statuscode: -1,
    //                         response: error,
    //                         isValid: false
    //                     };
    //                     callback(undefined, r);
    //                 } else if (result && result.affectedRows > 0) {

    //                     r = {
    //                         message: "Password reset successfully",
    //                         statuscode: 0,
    //                         response: result,
    //                         isValid: true
    //                     };

    //                     callback(undefined, r);
    //                 } else {
    //                     // invalid username or password
    //                     r = {
    //                         message: "No such user exist",
    //                         statuscode: 0,
    //                         response: result,
    //                         isValid: false
    //                     };
    //                     callback(undefined, r);
    //                 }

    //             });

    //         return r;
    //     } catch (ex) {
    //         console.log(JSON.stringify(ex));
    //     }

    // },

    //Reset password
    'ResetPassword': function(pData, callback) {
        try {

            let user = null;
            if (this.userId) {
                user = Meteor.users.findOne(this.userId);
            }

            let flag = false;
            if (!this.userId || this.userId && Roles.userIsInRole(this.userId, 'Admin', 'default-group')) {
                flag = true;
            } else if (user && user.profile.userDetail.is_super_user === 1) {
                flag = true;
            } else {
                return new Meteor.Error(403, "Access Denied");
            }

            if (flag) {

                var r = {};
                // Early exit condition
                //console.log(this.userId);
                // if (!isValidUser({
                //         userId: this.userId
                //     })) {
                //     console.log('User not logged in');
                //     return undefined;
                // }
                if (!isValidParams({
                        params: pData,
                        cb: callback
                    })) {
                    console.log('Invalid Parameters');
                    return undefined;
                }
                liveDb.db.query(
                    'Call ResetPassword(?,?)', [pData.email, pData.password],
                    function(error, result) {
                        console.log(error);
                        if (error) {
                            //If in First place any error occurs
                            r = {
                                message: "Some internal problem while updating password",
                                statuscode: -1,
                                response: error,
                                isValid: false
                            };
                            callback(undefined, r);
                        } else if (result && result.affectedRows > 0) {

                            r = {
                                message: "Password reset successfully",
                                statuscode: 0,
                                response: result,
                                isValid: true
                            };

                            callback(undefined, r);
                        } else {
                            // invalid username or password
                            r = {
                                message: "No such user exist",
                                statuscode: 0,
                                response: result,
                                isValid: false
                            };
                            callback(undefined, r);
                        }

                    });

                return r;
            }
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }

    },



    // // Deactivate user or disable user
    // 'DeactivateUser': function(pData, callback) {
    //     try {
    //         var r = {};
    //         if (!this.userId || this.userId && !Roles.userIsInRole(this.userId, 'Admin', 'default-group')) return new Meteor.Error(403, "Access Denied");
    //         // Early exit condition
    //         //console.log(this.userId);
    //         // if (!isValidUser({
    //         //         userId: this.userId
    //         //     })) {
    //         //     console.log('User not logged in');
    //         //     return undefined;
    //         // }
    //         if (!isValidParams({
    //                 params: pData,
    //                 cb: callback
    //             })) {
    //             console.log('Invalid Parameters');
    //             return undefined;
    //         }
    //         liveDb.db.query(
    //             'Call DeactivateUser(?,?)', [pData.username, pData.userstatus],
    //             function(error, result) {
    //                 console.log(error);
    //                 if (error) {
    //                     //If in First place any error occurs
    //                     r = {
    //                         message: "Some internal problem while updating password",
    //                         statuscode: -1,
    //                         response: error,
    //                         isValid: false
    //                     };
    //                     callback(undefined, r);
    //                 } else if (result && result.affectedRows > 0) {
    //                     console.log(result)
    //                     r = {
    //                         message: "User deactivated successfully",
    //                         statuscode: 0,
    //                         response: result,
    //                         isValid: true
    //                     };

    //                     callback(undefined, r);
    //                 } else {
    //                     // invalid username or password
    //                     r = {
    //                         message: "No such user deactivated",
    //                         statuscode: 0,
    //                         response: result,
    //                         isValid: false
    //                     };
    //                     callback(undefined, r);
    //                 }

    //             });
    //         return r;
    //     } catch (ex) {
    //         console.log(JSON.stringify(ex));
    //     }
    // }

    // Deactivate user or disable user
    'DeactivateUser': function(pData, callback) {
        try {

            let user = null;
            if (this.userId) {
                user = Meteor.users.findOne(this.userId);
            }

            let flag = false;
            if (!this.userId || this.userId && Roles.userIsInRole(this.userId, 'Admin', 'default-group')) {
                flag = true;
            } else if (user && user.profile.userDetail.is_super_user === 1) {
                flag = true;
            } else {
                return new Meteor.Error(403, "Access Denied");
            }

            if (flag) {


                var r = {};
                // Early exit condition
                //console.log(this.userId);
                // if (!isValidUser({
                //         userId: this.userId
                //     })) {
                //     console.log('User not logged in');
                //     return undefined;
                // }
                if (!isValidParams({
                        params: pData,
                        cb: callback
                    })) {
                    console.log('Invalid Parameters');
                    return undefined;
                }
                liveDb.db.query(
                    'Call DeactivateUser(?,?)', [pData.username, pData.userstatus],
                    function(error, result) {
                        console.log(error);
                        if (error) {
                            //If in First place any error occurs
                            r = {
                                message: "Some internal problem while updating password",
                                statuscode: -1,
                                response: error,
                                isValid: false
                            };
                            callback(undefined, r);
                        } else if (result && result.affectedRows > 0) {
                            console.log(result)
                            r = {
                                message: "User deactivated successfully",
                                statuscode: 0,
                                response: result,
                                isValid: true
                            };

                            callback(undefined, r);
                        } else {
                            // invalid username or password
                            r = {
                                message: "No such user deactivated",
                                statuscode: 0,
                                response: result,
                                isValid: false
                            };
                            callback(undefined, r);
                        }

                    });
                return r;
            }
        } catch (ex) {
            console.log(JSON.stringify(ex));
        }
    }

});