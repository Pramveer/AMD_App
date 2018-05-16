import {
    Template
} from 'meteor/templating';
import './analyticsPatientDetails.html';


Template.AnalyticsPatientDetails.rendered = function () {

    $('.pop').each(function () {
        var $elem = $(this);
        $elem.popover({
            placement: 'auto',
            trigger: 'hover',
            html: true,
            container: $elem,
            animation: true,
            // content: 'This is the popover content. You should be able to mouse over HERE.'
        });
    });
};

Template.AnalyticsPatientDetails.events({

    'click .patientsPopup-closeBtn': function(e,template,data) {
        if(data && data['data'] == 'refresh'){
             //event for global search filter
            template.loading.set(true);
            let params = Pinscriptive['Filters'];
            params['fdaCompliant'] = "all";
            Meteor.call('getProviderPageData', params, function(error, result) {
                if (error) {
                    template.loading.set(false);
                    template.noData.set(true);
                } else {
                    
                    let  drugsData = result.drugsData;
                    if (drugsData.length > 0) {
                        localStorage.setItem('AllDrugsData', JSON.stringify(drugsData));
                        setTimeout(function() {
                            template.loading.set(false);
                            renderFirstTab();
                        }, 1000);
                    } else {
                        localStorage.setItem('AllDrugsData', JSON.stringify([]));
                    }
                }
            });
        }
        else{
            $('.analyticsPatientsPopup-container').empty();
            $('.analyticsPatientsPopup').hide();
        }

    },
    'click .close.analytics_closebtn': function (e) {
        $('.analyticsPatientsPopup-container').empty();
        $('.analyticsPatientsPopup').hide();
    }
});


Template.AnalyticsPatientDetails.helpers({
    
});