import {Template} from 'meteor/templating';
import './analyticsWaste.html';


Template.AnalyticsWasteOpportunity.onCreated(function() {
     var self = this;
    this.loading = new ReactiveVar(false);
    this.noData = new ReactiveVar(false);
    self.loading.set(false);
});

Template.AnalyticsWasteOpportunity.rendered = function() {
  
}

Template.AnalyticsWasteOpportunity.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    }
});


Template.AnalyticsWasteOpportunity.events({
    // 'click .analyticsWaste':function(e, template, data){
    //     template.loading.set(true);
    //     Router.go('Analytics/Efficacy');
    //     Router.go('Analytics/WasteOpportunity');
    //     template.loading.set(false);
    //     // setTimeout(()=>{
    //     //      template.loading.set(false);
    //     //      Router.go('Analytics/Efficacy');
    //     //      Router.go('Analytics/WasteOpportunity');
    //     // },100);
    // }
});