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

/**
 * @author: Arvind
 * @reviewer: 
 * @date: 06-Apr-2017
 * @desc: Find new function for convert decimal place with position without rounding off
 * WE ARE FACING ISSUE WITH CALCULATION UTILIZATION WHICH GO BEYOND 100% 
 * Reference link : http://stackoverflow.com/questions/4187146/display-two-decimal-places-no-rounding
 * For Two decimal placement
 * Convert the number into a string, match the number up to the second decimal place:
 * var with2Decimals = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
 * original author : http://stackoverflow.com/users/53114/gumbo
 */
// toFixedWithoutRound=(num, fixed)=> {
//     var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
//     return num.toString().match(re)[0];
// };

toFixedWithoutRound = (num, fixed) => {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    let matchValue = num.toString().match(re)
    if (matchValue && matchValue.length > 0) {
        return num.toString().match(re)[0];
    } else {
        return 0;
    }
};