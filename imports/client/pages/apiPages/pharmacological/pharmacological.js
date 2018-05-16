import { Template } from 'meteor/templating';
import './pharmacological.html';

let $selectizeCombo = '';
Template.Pharmacological.rendered = function() {
    //hide header sections
    $('.top-navigation-div').hide();
    $('.head-emr-details').hide();

    $('.main-header').css('display','none');
    $('.loginAdmin').css('right','0%');
    $('#PharmacologicalFrame').on("load",function() {
        var iframeHeight = document.getElementById('PharmacologicalFrame').contentWindow.document.body.offsetHeight + 'px';
        console.log(iframeHeight);
        $('#PharmacologicalFrame').css('height', iframeHeight);

    });
    document.getElementById("anim_loading_theme").style.visibility="visible";
    document.getElementById("overlay").style.display="block";

    select = document.getElementById("drugSelectCombo");
    for (var i = 0 ; i < AllDrugs.length; i++) {
        var option = document.createElement("option");
        option.value =  AllDrugs[i].name.replace(/\s/g, '-')+"/"+AllDrugs[i].name.toLowerCase().replace(/\s/g, '-')+"-result.html";
        option.textContent =  AllDrugs[i].name;
        select.appendChild(option);
    };
    // Initializing RDropdowns.
    // $('.drugSelectCombo').selectize({
    //     create: true,
    //     dropdownParent: null
    // });
    $selectizeCombo = $('.drugSelectCombo').selectize();
    $selectizeCombo[0].selectize.setValue("select");
}
Template.Pharmacological.helpers({
        'druglist':function(){
            return AllDrugs.reactive();
        }
    });
Template.Pharmacological.events({
    'click .backButton': function(event,element) {
    //    window.location = "/Drugs";
        document.body.style.overflow = 'none';
      //$('.main-header').css('display','block');
        $('.loginAdmin').css('right','0%');
        //window.location = 'javascript:Router.go("Drugs");';
        // Hide Evidence API Header and menubar  then display main header with loadingdprocess
        $('.ClinicalTrialHeader').hide();
        $('.ClinicalTriaMenubar').hide();
            $('.main-header').css('display', 'block');
            // document.getElementById("anim_loading_theme").style.visibility = "visible";
            // document.getElementById("overlay").style.display = "block";
            if(localStorage.isFromCompareDrugs){
            localStorage.removeItem("isFromCompareDrugs");
            Router.go("CompareDrug");
                  }else{
            Router.go("/Provider");
            }
    }
});

Template.Pharmacological.drugChanged = function(value) {  
    console.log(value);

    //Restrict reload page for 'select' option value
    if(value!='select'){
  
    document.getElementById("anim_loading_theme").style.top="20%";
    document.getElementById("anim_loading_theme").style.visibility="visible";
    document.getElementById("overlay").style.display="block";
    document.getElementById('PharmacologicalFrame').src = "/PharmacologicalAPI/"+value;
    }

}

Template.Pharmacological.resizeIframe = function(obj) {

     document.getElementById("anim_loading_theme").style.visibility="hidden";
    document.getElementById("overlay").style.display="none";

};

Template.Pharmacological.destroyed = function(){
    //show header sections
    $('.top-navigation-div').show();
    $('.head-emr-details').show();
};