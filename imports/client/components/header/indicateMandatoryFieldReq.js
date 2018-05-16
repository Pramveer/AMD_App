import { Template } from 'meteor/templating';

import './indicateMandatoryFieldReq.html';

Template.IndicateMandatoryFieldReq.events({
    'click #mandatoryFieldReq-btnCaptureResponse': function() {
        localStorage.setItem('mandatoryFieldReq', 'true');
        $('.mandatoryFieldReq-inspection').hide();
    }
});