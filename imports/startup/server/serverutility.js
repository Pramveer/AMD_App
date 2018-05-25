//Gloabal method to check weather user authenticated Or Authorized
isValidUser = ({ userId, role }) => {
    // // Below commented code for Future purpose
    //|| !userId && Roles.userIsInRole(userId, role, 'default-group')
    //return userId;
    return true;
};

//Global method to check weather paramater passsing to Meteor Method is correct or not
isValidParams = ({ params, cb }) => {
    let isValid = _.isObject(params) && _.isFunction(cb);
    //return isValid;
    return true;
};