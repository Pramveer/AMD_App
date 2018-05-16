import {
    Template
} from 'meteor/templating';
import './analyticsSubtabs.html';

Template.AnalyticsSubtabs.helpers({
    'isActive': function(tabname){
        if(this.data.toLowerCase() == tabname.toLowerCase()){
            return 'active';
        }else{
            return '';
        }
    }
});