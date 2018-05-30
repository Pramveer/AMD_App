// log in method


Meteor.syncMethods({
  'ValidateUser': function(user, pass, callback) {
  //  console.log(user, pass);
    if (user && pass) {
        try{
          var r = {};
            liveDb.db.query('Call SP_VALIDATE_USER(?,?)', [user, pass], (error, result) => {
              console.log(result[0].length);
                if (error) {
                //  console.log(error)
                  r = {
                      message: "Some Internal Problem while login",
                      statuscode: -1,
                      response: error,
                      isValid: false
                  };
                    callback(error, r);
                }
                else if (result && result.length > 0 && result[0].length > 0) {
                  // console.log(result)
                    r = {
                        message: "User loggedin successfully",
                        statuscode: 0,
                        response: result[0][0],
                        isValid: true
                    };
                    callback(undefined, r);
                } else {
                    r = {
                        message: "Some Internal Problem while login",
                        statuscode: -1,
                        response: error,
                        isValid: false
                    };
                      callback(error, r);
                }
            });
        }
        catch(e) {
            console.log('Error in Processing method');
        }
      // liveDb.db.query('Call SP_VALIDATE_USER(?,?)', [user, pass],
      //       function(error, result) {
      //         console.log(result)
      //         if (error) {
      //             // To do log sql error
      //             console.log(error);
      //             r = {
      //                 message: "Some Internal Problem while login",
      //                 statuscode: -1,
      //                 response: error,
      //                 isValid: false
      //             };
      //             callback(undefined, r);
      //
      //         } else if ((result && result.length > 0)) {
      //           console.log('this goes here')
      //             r = {
      //                 message: "User loggedin successfully",
      //                 statuscode: 0,
      //                 response: result,
      //                 isValid: true
      //             };
      //           }
      //
      //       });
    }
    // console.log(obj.user);
    // console.log(obj.password);
      // let query = 'SELECT * FROM PATIENT';
  }
});
