import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './compareModel.html';


Template.ComparePayerModel.onCreated( () => {

});

Template.ComparePayerModel.rendered = function(){
    let data = this.data;
    // console.log('************MODELS DATA****************');
    // console.log(data);
    renderTheModelsData(data);
}


Template.ComparePayerModel.helpers({
   
});

Template.ComparePayerModel.events({
    'click .js-compareModel-back': () =>{
        $('#comparePayerModelsUI').hide();
        $('#loadExistingModels').show();
    },
    'click .payerModelRecc-Link':(event)=>{
        $('#comparePayerModelsUI').hide();
        let id = $(event.currentTarget).attr('data');
        let tabName = $(event.currentTarget).attr('tabName').toLowerCase();
        //$('#loadExistingModels').hide();
        $('#loadExistingModels').hide();
        //Session.set('editModelTrigger',true);
        Session.set(tabName + '_editGoTrigger', false);

        if (isTabHasUnSavedChanges(tabName)) {
            showWarningMsgForLoadingModel(id, tabName, tabName.charAt(0).toUpperCase() + tabName.substring(1));
        } else {
            let tab = tabName;
            $('.templateSection').hide();
            if (tabName == 'treated') {
                tab = 'Treated';
                $('#TreatedPatientsSection').show();
                Template.TreatedPatients.loadSavedModel(id);

            } else if (tabName == 'treating') {
                tab = 'Treating';
                $('#TreatingPatientsSection').show();
                Template.TreatingPatients.loadSavedModel(id);

            } else if (tabName == 'untreated') {
                tab = 'UnTreated';
                $('#UnTreatedPatientsSection').show();
                Template.UnTreatedPatients.loadSavedModel(id);
            }

            $('.advancePayerSubTabs-links li.' + tab + 'Tab').addClass('active').siblings().removeClass('active');
        }

        $('#'+tabName+'RecommendationsPopup').show();
        $('.'+tabName+'ApplyUniFiltersProfile').trigger('click');
    }
});

let showWarningMsgForLoadingModel = (id, tabname, titleTabName) =>{

    let html = `<div class="col-md-12 ">

                    You have unsaved Changes on ${titleTabName} tab. Do you want to save them?
                    </div>

                    <button type="button" modelId="${id}" tabname="${tabname}" class="btn btn-default loadWarningMessageButtonSave warningMsgBtn">Yes</button>
                    <button type="button" modelId="${id}" tabname="${tabname}" class="btn btn-default continueUnsavedchanges warningMsgBtn">No</button>`;

    $('#loadWarningMessageContent').html(html);
    $('#loadWarningMessage').show();
}

let renderTheModelsData = (modelDataObj) => {
    let html = ``,
        modelsData = modelDataObj.modelsData,
        checkedIds = modelDataObj.checkedIds;

    //filter model data basedon slected models
    modelsData = modelsData.filter((d) => checkedIds.indexOf(d.modelId) > -1);

    if(modelsData.length){
        let data = JSON.parse(modelsData[0].OptimizedData)|| [];
        let category_names = [];
        for(let i  = 0;i<data.length;i++){
            category_names.push(data[i].category_name);
        }
        mainFilters = JSON.parse(modelsData[0].SelectedFilters);
        let genotypes = mainFilters.genotypes;
        let treatment = mainFilters.treatment;
        let cirrhosis = mainFilters.cirrhosis;
        $('.rec-Genotype-compare').html(genotypes.join(","));
        $('.rec-Treatment-compare').html(treatment.join(","));
        $('.rec-Cirrhosis-compare').html(cirrhosis.join(","));
    }

    
    for(let i=0;i<modelsData.length;i++) {
        let currentModel = modelsData[i];
        let UniverseSavingData = JSON.parse(currentModel.UniverseSavingData) || {};
        let UtilizationData = JSON.parse(currentModel.OptimizedData) || [];
        let tabName = currentModel.tabName;
        let utilizationValue = getUtilizationOptimizedData(UtilizationData);
        
        if(checkedIds.indexOf(currentModel.modelId) > -1 ) {
            //<div class="col-md-2 model-compare-value">${getSelectedFiltersForModel(currentModel.SelectedFilters)}</div>
            let randValue = Math.min(2 + (Math.random() * (10 - 2)),10).toFixed(2);
            
        html += `<div class="modelComparsion-row">
                    <div class="col-md-1 model-compare-value">${currentModel.modelName}</div>
                    <div class="col-md-1 model-compare-value">$${commaSeperatedNumber(UniverseSavingData.Saving)}</div>
                    <div class="col-md-1 model-compare-value">$${commaSeperatedNumber(UniverseSavingData.TotalCost)}</div>
                    <div class="col-md-1 model-compare-value">${utilizationValue}%</div>
                    <div class="col-md-6 model-compare-value compareModel-uniQualitySection">
                        <div class="col-md-12" style="padding-bottom: 5px;border-bottom: 1px solid #e2dfdf;">
                            <div class="col-md-2" >
                                <span class="safety_impact_title">Efficacy:</span>
                            </div>
                            <div class="col-md-2" style="border-right: 1px solid #e2d2d2;">
                                    <div><i class="fa ${indicateValueIcon(UniverseSavingData.QualityIndicators.efficacy_class)}" aria-hidden="true" style="color:${getColorForIndicator(UniverseSavingData.QualityIndicators.efficacy_class)}"></i></div>
                                    <span class="valueposition">${UniverseSavingData.QualityIndicators.efficacy}%</span>
                            </div>

                            <div class="col-md-2">
                                <span class="safety_impact_title">Adherence:</span>
                            </div>
                            <div class="col-md-2"  style="border-right: 1px solid #e2d2d2;">
                                    <div><i class="fa ${indicateValueIcon(UniverseSavingData.QualityIndicators.adherence_class)}" aria-hidden="true" style="color:${getColorForIndicator(UniverseSavingData.QualityIndicators.adherence_class)}"></i></div>
                                    <span class="valueposition">${UniverseSavingData.QualityIndicators.adherence}%</span>
                            </div>
                            <div class="col-md-1">
                                <span class="safety_impact_title">Cost:</span>
                            </div>
                            <div class="col-md-2">
                                    <div><i class="fa ${indicateValueIcon(UniverseSavingData.QualityIndicators.cost_class)}" aria-hidden="true" style="color:${getColorForIndicator(UniverseSavingData.QualityIndicators.cost_class)}"></i></div>
                                    <span class="valueposition">${UniverseSavingData.QualityIndicators.cost}%</span>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="col-md-2">
                                <span class="safety_impact_title">Safety:</span>
                            </div>
                            <div class="col-md-8" style="padding:3px;">
                                <div class="col-md-5"  style="border-right: 1px solid #e2d2d2;">
                                        <span class="safety_impact_title">RX%:</span>  <span style = "margin-left:10px;"><i class="fa ${indicateValueIcon(UniverseSavingData.UniverseSafety.rx[0].affected)}" aria-hidden="true" 
                                        style="color:${getColorForIndicator(UniverseSavingData.UniverseSafety.rx[0].affected)}"></i> ${UniverseSavingData.UniverseSafety.rx[0].value}%
                                                </span>
                                </div>
                                <div class="col-md-7" style = "margin-left:-25px;">
                                        <span class="safety_impact_title">Hospitalization%:</span>
                                        <span><i class="fa ${indicateValueIcon(UniverseSavingData.UniverseSafety.hospitalised[0].affected)}" aria-hidden="true" 
                                        style="color:${getColorForIndicator(UniverseSavingData.UniverseSafety.hospitalised[0].affected)}"></i>${UniverseSavingData.UniverseSafety.hospitalised[0].value}%</span>
                                </div>
                            
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2 model-compare-value"><div class="payerModelRecc-Link" data = "${currentModel.modelId}" tabName = "${tabName}" style="text-align: center;">Open</div></div>
                </div>`;
        }
        
    }

    $('.payer-modelCompare-body').html();
    $('.payer-modelCompare-body').html(html);
}

let indicateValue = (str) =>{
    return str.toLowerCase() == 'decrease'?'indicateNegativeValue':"indicatePositiveValue";
}
let indicateValueIcon = (str) =>{
    return (str.toLowerCase() == 'decrease' || str.toLowerCase() == 'indicatenegativevalue')?'fa-arrow-down':"fa-arrow-up";
}

let getColorForIndicator = (str) => {
    return (str.toLowerCase() == 'decrease' || str.toLowerCase() == 'indicatenegativevalue') ? '#bc4b4a' : '#1baad7';
}
let getSelectedFiltersForModel = (filterData) =>{
    let filterHtml = ``;
    filterData = JSON.parse(filterData);

    if(filterData.flag != '') {
        return `<div>All</div>`;
    }
    else {
        filterHtml = `<div class="payermodel-compareModel-filterRow">
                        <div class="modelCompare-filterKey">Genotypes: </div>
                        <div class="modelCompare-filterValue">${filterData.genotypes.join(",")}</div>
                    </div>
                    <div class="payermodel-compareModel-filterRow">
                        <div class="modelCompare-filterKey">Treatment: </div>
                        <div class="modelCompare-filterValue">${filterData.treatment.join(",")}</div>
                    </div>
                    <div class="payermodel-compareModel-filterRow">
                        <div class="modelCompare-filterKey">Cirrhosis: </div>
                        <div class="modelCompare-filterValue">${filterData.cirrhosis.join(",")}</div>
                    </div>`;
    }   

    return filterHtml;
}


let isTabHasUnSavedChanges = (tab) =>{
    return Session.get(tab + '_isCurrentModelModified');
}


let getUtilizationOptimizedData = (utilizationData) =>{
    if(utilizationData.length < 0){
        return 100;
    }
    else{
        let count = 0;
        let sum = 0;

        for(let i = 0;i<utilizationData.length;i++){
            let data = utilizationData[i].data;
            //sort based on value
            data.sort((a,b) => b.value-a.value);

            if(data.length){

                sum += data[0].utilization;
                console.log(data[0].utilization,sum)
            }
        }
        return (sum/utilizationData.length).toFixed(2);
    }
}