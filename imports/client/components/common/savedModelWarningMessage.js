import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import './savedModelWarningMessage.html';
let tabs = ['treated','treating','untreated'];
Template.SavedModelWarningMessage.rendered = function() {


};


// Events
Template.SavedModelWarningMessage.events({
    'click .continueUnsavedchangesTab' : function(){
        Session.set('isModel',false);
        //set model variables for all tabs
        for(let tab in tabs){
            Session.set(tabs[tab]+'_currentModelId',0);
            Session.set(tabs[tab]+'_isCurrentModelSaved',false);
            Session.set(tabs[tab]+'_isCurrentModelModified',false);
        }
        $('#loadWarningMessageTab').hide();
    },
    'click .loadWarningMessageButtonStayTab' : function(){
        highLightTab('Payer');
        $('#loadWarningMessageTab').hide();
        let tabChange =  notifyTabModelChange();
        if(tabChange.flag){
            let tabName = tabChange.tabName;
            callChangedTab(tabName);
            showModelDetails(tabName);
            $('.js-showModelDetails').hide();
        }
    }
});

//  Helper Functions
Template.SavedModelWarningMessage.helpers({
    'tabNames':function(){
               let html = '';
               if(Session.get('treated_isCurrentModelModified')){
                    html += ' Treated';
               }
                    
               if(Session.get('treating_isCurrentModelModified')){  
                    html += ' Treating';  
                }
               if(Session.get('untreated_isCurrentModelModified')){
                    html += ' UnTreated';
                }
                html = html.trim().split(' ').join(',');
                $('.tabnames').html(html);
    }
});

let notifyTabModelChange = function(){
    if(Session.get('treated_isCurrentModelModified')){
        return {'flag':true,'tabName':'treated'};
    }
    else if(Session.get('treating_isCurrentModelModified')){
        return {'flag':true,'tabName':'treating'};
    }
    else if(Session.get('untreated_isCurrentModelModified')){
        return {'flag':true,'tabName':'untreated'};
    }
    else{
        return {'flag':false,'tabName':'Treated'};
    }
    
}

let highLightTabPayer = function(tabName){
    $('.advancePayerSubTabs-links li.'+tabName+'Tab').addClass('active').siblings().removeClass('active');

}

let callChangedTab = function(tabName){
    $('.templateSection').hide();
    if(tabName == 'treated'){
            highLightTabPayer('Treated');
            $('#TreatedPatientsSection').show();
        }
    else if(tabName == 'treating'){
         highLightTabPayer('Treating');
         $('#TreatingPatientsSection').show();

    }
    else if(tabName == 'untreated'){
         highLightTabPayer('UnTreated');
         $('#UnTreatedPatientsSection').show();
    }
    else{
         highLightTabPayer('Treated');
         $('#TreatedPatientsSection').show();
    }
}

let setSessionVariablesTab = function(tabName){
    Session.set(tabName+'_currentModelId',0);
    Session.set(tabName+'_isCurrentModelSaved',false);
    Session.set(tabName+'_isCurrentModelModified',false);
}

function showSaveButton(tabName){
    var hidden = $('.'+tabName+'_saveModelContainer');
    hidden.show('slide', {direction: 'right'}, 400);
    hidden.animateCss('fadeInLeft');
    hidden.animateCss('bounce');

}

function showModelDetails(tabName){
    var hidden = $('.'+tabName+'_modelInfoContainer');
    hidden.show('slide', {direction: 'right'}, 400);
}
