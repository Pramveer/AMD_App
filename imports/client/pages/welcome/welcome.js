import { Template } from 'meteor/templating';
import './welcome.html';

Template.welcome.rendered = function() {

}

Template.welcome.events({
    'click .redirect-health': function() {
        event.preventDefault();
        location.href = '/HealthRecord';
    }
});
