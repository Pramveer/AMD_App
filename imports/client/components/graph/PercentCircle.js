import { Template } from 'meteor/templating';
import './PercentCircle.html';

Template.PercentCircle.helpers({
    'pureCSSRingCircle': function(pScore) {
        return `p${parseInt(pScore)}`;
    },
    'roundOfPercent': function(pScore) {
        if(pScore == 'NA'){
            return 'NA';
        }
        return roundPercent(pScore)+'%';
    }

});