/**
 * @author: Yuvraj Pal (10th Feb 17)
 * @desc this function will clear the main caching object. 
 */

Meteor.methods({
    'clearCachingObj': () => {
        let caching = new CachingObj();
        caching.clearCachingObj();
        return true;
    }
});