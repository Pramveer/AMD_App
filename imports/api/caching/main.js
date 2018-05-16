/**
 * @author Yuvraj : 10th Feb 17
 * @desc This is a separate module that handle all the caching related functionality.
 */


// Create an immediately invoked functional expression to wrap our code
(function () {

    // Define our constructor
    this.CachingObj = function () {

        // Define option defaults
        var defaults = {
            key: 'test'
        }

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

    }

    // Utility method to extend defaults with user options
    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    // this object will contain all the data that we will fetch from the database.
    let mainCachingObj = {};


    //Public Methods
    CachingObj.prototype.testMethod = function () {
        // console.log(this.options);
    }

    // this method is return true or false if data is available in the main object.
    CachingObj.prototype.isDataAvailable = function () {
        let flag = false;
        let key = this.options.key;
        mainCachingObj[key];
        if(mainCachingObj[key]){
            flag = true;
        }
        // console.log("isDataAvailable function is returning "+ flag);
        return flag;
    }

    // this method will return available data.
    CachingObj.prototype.getAvailableData = function () {
        let key = this.options.key;
        // console.log("getAvailableData function is called ");
        return mainCachingObj[key];
    }

    // this method will update or insert data for a perticular key in the main caching object.
    CachingObj.prototype.updateData = function () {
        // console.log("updateData function is called "); 
        let key = this.options.key;
        let data = this.options.data;
        mainCachingObj[key] = data;
    }

    CachingObj.prototype.clearCachingObj = function () {
        mainCachingObj = {};
        // console.log(mainCachingObj);
        // console.log("Clearing Caching Object.");
    }

} ());