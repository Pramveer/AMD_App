import { Promise } from 'meteor/promise';
/** Reference from Meteor todos example
* Url: https://github.com/meteor/todos/blob/master/imports/utils/denodeify.js
* Author: meteor (MDG)
*/
// Convert an NPM-style function returning a callback to one that returns a Promise.
export const denodeify = f => (...args) => new Promise((resolve, reject) => {
  f(...args, (err, val) => {
    if (err) {
      reject(err);
    } else {
      resolve(val);
    }
  });
});
