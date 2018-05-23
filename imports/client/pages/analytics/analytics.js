import { Template } from 'meteor/templating';
import './analytics.html';
import * as analyticsLib from './analyticsLib.js';

// variable to store the instance of the template inserted
var insertedInstance;
var timeValue = 0;


Template.Analytics.onCreated(function() {
    var self = this;
    this.loading = new ReactiveVar(true);
    this.noData = new ReactiveVar(false);
    var category_id = Session.get('category_id');
    this.autorun(function() {

        let params = AmdApp['Filters'];
        params['fdaCompliant'] = "yes";
        // Meteor.call('getProviderPageData', params, function(error, result) {
        //     if (error) {
        //         self.loading.set(false);
        //         self.noData.set(true);
        //     } else {
        //         //get patients data from backend
        //         analyticsLib.getPatientsDataForAnalytics(params);
        //         var drugsData = result.drugsData;
        //         if (drugsData.length > 0) {
        //             localStorage.setItem('AllDrugsData', JSON.stringify(drugsData));
        //             setTimeout(function () {
        //                 self.loading.set(false);
        //                 renderFirstTab();
        //             }, 500);
        //         } else {
        //             localStorage.setItem('AllDrugsData', JSON.stringify([]));
        //         }
        //     }
        // });

        // analyticsLib.getPatientsDataForAnalytics(params, function(res){
        //         if(!res){
        //             self.loading.set(false);
        //             self.noData.set(true);
        //         }else{
        //            self.loading.set(false);
        //            renderFirstTab();
        //        }

        // });
        // updated logic for null objects
        /* if (typeof AmdApp['DrugByGenotype'] !== 'undefined' && AmdApp['DrugByGenotype'].length > 0) {
            //solved analytics tab keep loading issue
            self.loading.set(false);
            renderFirstTab();
        }    
        else{
             analyticsLib.getDrugByGenotype(function(res){
                if(!res){
                    self.loading.set(false);
                    self.noData.set(true);
                }else{
                    self.loading.set(false);
                    renderFirstTab();
                }
                    
            });
        }*/

        self.loading.set(false);
        renderFirstTab();
    });
});


Template.Analytics.rendered = function() {
    highLightTab("Analytics");
    $('.analyticssubmenu_Btn').show();
    $('.pop').each(function() {
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
    $('.head-emr-details .switch').hide();
};

Template.Analytics.events({
    // 'click .analyticsSubTabs .analyticsSubTabs-links li': function (e) {
    //     var tabName = $(e.currentTarget).children('a').html().toLowerCase();
    //     $(e.currentTarget).addClass('active').siblings().removeClass('active');

    //     e.preventDefault();

    //     //show load mask
    //     $("#anim_loading_theme").css("visibility", "visible");
    //     $("#anim_loading_theme").css("top", "90%");
    //     $("#overlay").show();

    //     if ($("#templateRenderSection").children().length > 0) {
    //         //remove last inserted dynamic template
    //         removeTemplate();
    //     }
    //     timeValue = 0;
    //     insertTemplate(tabName);

    //     //hide load mask
    //     $("#anim_loading_theme").css("visibility", "hidden");
    //     $("#anim_loading_theme").css("top", "60%");
    //     $("#overlay").hide();
    // },

    'click .patientsPopup-closeBtn': function(e, template, data) {
        if (data && data['data'] == 'refresh') {
            //event for global search filter
            template.loading.set(true);
            let params = AmdApp['Filters'];
            params['fdaCompliant'] = "all";
            Meteor.call('getProviderPageData', params, function(error, result) {
                if (error) {
                    template.loading.set(false);
                    template.noData.set(true);
                } else {

                    let drugsData = result.drugsData;
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
        } else {
            $('.analyticsPatientsPopup-container').empty();
            $('.analyticsPatientsPopup').hide();
        }

    },
    'click .close.analytics_closebtn': function(e) {
        $('.analyticsPatientsPopup-container').empty();
        $('.analyticsPatientsPopup').hide();
    },
    'click #globalSearchFilterAnalytics': function(e, template) {



    }
});


Template.Analytics.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    }
});


Template.Analytics.destroyed = function() {
    //console.log("Analytics Template Destroyed");
    removeTemplate();
}


function renderFirstTab() {
    setTimeout(function() {
        var tabName = localStorage.getItem('AnalyticsParam');
        localStorage.setItem('AnalyticsParam', '');
        //if(tabName == "" || tabName == null){
        //Change condition for non empty using falsy/truthy check
        if (!tabName) {
            timeValue = 1;
            insertTemplate("efficacy");
            highlightTab("efficacy");
        } else {
            insertTemplate(tabName);
            highlightTab(tabName);

            //hide load mask
            $("#anim_loading_theme").css("visibility", "hidden");
            $("#anim_loading_theme").css("top", "40%");
            $("#overlay").hide();

        }
    }, 500)
}


//Dynamically insert/render template in another template
function insertTemplate(tabName) {
    //Clear parent element before render dynamic template to it
    //$('#templateRenderSection').empty();

    //show load mask
    $("#anim_loading_theme").css("visibility", "visible");
    $("#anim_loading_theme").css("top", "75%");
    $("#overlay").show();

    if (tabName === "efficacy") {
        var category_id = Session.get('category_id');

        if (timeValue == 1) {
            UI.render(Template.Efficacy, $('#templateRenderSection')[0]);
        } else {
            UI.render(Template.Efficacy, $('#templateRenderSection')[0]);
        }

    } else if (tabName === "adherence") {
        //insertedInstance = UI.renderWithData(Template.Adherence, {});
        UI.render(Template.Adherence, $('#templateRenderSection')[0])
    } else if (tabName === "utilization") {
        //insertedInstance = UI.renderWithData(Template.Utilization, {});
        UI.render(Template.Utilization, $('#templateRenderSection')[0])
    } else if (tabName === "machine learning") {
        //insertedInstance = UI.renderWithData(Template.MachineLearning, {});
        UI.render(Template.MachineLearning, $('#templateRenderSection')[0])
    }




    //UI.insert(insertedInstance, $("#templateRenderSection")[0]);
}

function removeTemplate() {
    //UI.remove(insertedInstance);
    //Clear parent element before render dynamic template to it
    $('#templateRenderSection').empty();
}

function highlightTab(tabName) {
    $(".analyticsSubTabs-links li").each(function(i) {
        if ($(this).children('a').html().toLowerCase() === tabName) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}


function renderErrorpage() {
    console.log('No data Found');
}