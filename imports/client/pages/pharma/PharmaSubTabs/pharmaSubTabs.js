import {
    Template
} from 'meteor/templating';
import './pharmaSubTabs.html';

Template.PharmaSubTabs.helpers({
    'isActive': function(tabname){
        if(this.data.toLowerCase() == tabname.toLowerCase()){
            return 'active';
        }else{
            return '';
        }
    }
});
