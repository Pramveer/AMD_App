import {
    Template
} from 'meteor/templating';
import './machineLearningSubtabs.html';


Template.MachineLearningSubtabs.helpers({
    isActive(tabname) {
        if(this.data.toLowerCase() == tabname.toLowerCase()){
            return 'active';
        }else{
            return '';
        }
    },
    isCirrhoticPopulation()  {
        let cirrhosis = getCurrentPopulationFilters().cirrhosis;
        if(cirrhosis.length > 1) {
            return true;
        }
        else if(!cirrhosis.length){
            return true;
        }
        else {
            return cirrhosis[0].toLowerCase() == 'yes' ? true : false;
        }
        return false;
    }
});