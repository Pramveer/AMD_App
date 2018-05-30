// log in method


Meteor.syncMethods({
  'ValidateUser': function(user, pass, callback) {
    console.log(user, pass);
    if (user && pass) {
      liveDb.db.query('Call SP_VALIDATE_USER(?,?)', [user, pass],
            function(error, result) {
              console.log(result)
              // if (error) {
              //     // To do log sql error
              //     console.log(error);
              //     r = {
              //         message: "Some Internal Problem while login",
              //         statuscode: -1,
              //         response: error,
              //         isValid: false
              //     };
              //     callback(undefined, r);
              //
              // } else if ((result && result.length > 0)) {
              //
              // }

            });
    }
    // console.log(obj.user);
    // console.log(obj.password);
      // let query = 'SELECT * FROM PATIENT';
  }
});
