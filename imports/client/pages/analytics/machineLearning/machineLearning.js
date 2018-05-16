import { Template } from 'meteor/templating';
import './machineLearning.html';
import * as mlSubTabsUtil from './models/modelUtils.js';


Template.MachineLearning.onCreated(function () {
    let self = this;
    this.loading = new ReactiveVar(true);
    let category_id = Session.get('category_id');

    this.autorun(function () {

        let params = Pinscriptive['Filters'];
        params['fdaCompliant'] = "all";


        Meteor.call('getPatientMedicineData', {}, function (error, result) {
            if (error) {
                self.loading.set(false);
                self.noData.set(true);
            } else {
                pharmaData = result.pharmaData;
                Pinscriptive['pharma']['drugfulldata'] = pharmaData;
            }
        });

        Meteor.call('getComorbidity', {}, function (error, result) {
            if (error) {
                self.loading.set(false);
                self.noData.set(true);
            } else {
                Pinscriptive['pharma']['pharmaComorbidity'] = result.pharmaComorbidity;

            }
        });

        Meteor.call('getSVRTrend', {}, function (error, result) {
            if (error) {
                self.loading.set(false);
                self.noData.set(true);
            } else {
                //console.log(result.PatientsJourney);
                Pinscriptive['pharma']['PatientsJourney'] = result.PatientsJourney;

            }
        });

        Meteor.call('getMacLearningTabsData', params, (error, result) => {
            //console.log(result);
            mlSubTabsUtil.setMLTabsData(result);
            self.loading.set(false);
        });

    });

});

Template.MachineLearning.rendered = function () {
    //render DiseaseProgression sub tab
    //renderSubTab(1);

}

Template.MachineLearning.events({
    // 'click .macLearningsubTabs-links li': function (e) {
    //     let tabSequence = $(e.currentTarget).children('a').attr('sequence');
    //     tabSequence = parseInt(tabSequence);

    //     $(e.currentTarget).addClass('active').siblings().removeClass('active');

    //     e.preventDefault();

    //     //show load mask
    //     $("#anim_loading_theme").css("visibility", "visible");
    //     $("#anim_loading_theme").css("top", "90%");
    //     $("#overlay").show();

    //     if ($("#mlSubtabsRenderSection").children().length > 0) {
    //         //remove last inserted dynamic template
    //         removeSubtab();
    //     }

    //     renderSubTab(tabSequence);

    //     //hide load mask
    //     $("#anim_loading_theme").css("visibility", "hidden");
    //     $("#anim_loading_theme").css("top", "40%");
    //     $("#overlay").hide();
    // },
    'click .close.mlTabs_closebtn': function (e) {
        $('.analyticsPatientsPopup').hide();
    }
});

Template.MachineLearning.helpers({
    'isLoading': function () {
        return Template.instance().loading.get();
    },
    'isCirrhoticPopulation': function () {
        let data = Template.Provider.__helpers.get('getPopulationData').call();
        if (data.PopulationData_Cirrhosis == 'Yes')
            return true;
        else
            return false;
    }
});

//function to render sub tab
function renderSubTab(tabSequence) {
    // make the container empty
    $('#mlSubtabsRenderSection').empty();

    if (tabSequence == 1) {
        UI.render(Template.DiseaseProgression, $('#mlSubtabsRenderSection')[0]);
    }
    else if (tabSequence == 2) {
        UI.render(Template.SurvivalRate, $('#mlSubtabsRenderSection')[0]);
    }
    else if (tabSequence == 3) {
        UI.render(Template.TreatmentPriority, $('#mlSubtabsRenderSection')[0]);
    }
    else if (tabSequence == 4) {
        UI.render(Template.CostBurden, $('#mlSubtabsRenderSection')[0]);
    }
    else if (tabSequence == 5) {
        UI.render(Template.RiskDistribution, $('#mlSubtabsRenderSection')[0]);
    }
    else if(tabSequence == 6) {
        UI.render(Template.ProgressionModel, $('#mlSubtabsRenderSection')[0]);
    }
    else if (tabSequence == 7) {
        UI.render(Template.svrtrendml, $('#mlSubtabsRenderSection')[0]);
    }
    else if (tabSequence == 8) {
        UI.render(Template.comorbidityanalyticsml, $('#mlSubtabsRenderSection')[0]);
    }
    else if (tabSequence == 9) {
        UI.render(Template.CoinfectionsTab, $('#mlSubtabsRenderSection')[0]);
    }

}

//function to remove sub tab
function removeSubtab() {
    $('#mlSubtabsRenderSection').empty();
}
