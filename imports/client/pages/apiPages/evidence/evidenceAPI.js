import { Template } from 'meteor/templating';
import './evidenceAPI.html';

Template.EvidenceAPI.rendered = function() {
    //show header sections
    $('.top-navigation-div').hide();
    $('.head-emr-details').hide();

    //hide the main app header from this page
    $('.main-header').css('display', 'none');
    $('.loginAdmin').css('right', '0%');

    //adjust height/width of the iframe when the iframe is loaded & set the dom
    $('#EvidenceFrame').on("load", function() {
        var iframeHeight = document.getElementById('EvidenceFrame').contentWindow.document.body.offsetHeight + 20 + 'px';
        $('#EvidenceFrame').css('height', iframeHeight);
        $('iframe').contents().find("head").append($("<style type='text/css'> " +
            "body{padding:10px; background: #fff; overflow: hidden;}" +
            "form{ margin-top: 0px; }" +
            ".resultsBox{ padding-top: 0px;}" +
            "</style>"));

    });

    //hide loading wheel
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
}

Template.EvidenceAPI.events({
    //back button to move back to the app
    'click .backButton': function(event, element) {
        document.body.style.overflow = 'none';

        $('.loginAdmin').css('right', '0%');
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
            // setTimeout(function(){
            //   document.getElementById("anim_loading_theme").style.visibility = "hidden";
            //   document.getElementById("overlay").style.display = "none";
            // },1000)
        //window.location = 'javascript:Router.go("Drugs");';

    },
    //pagination events for the studies on this page
    'click #page1': function(event) {
        $('.Evidencepagination li').removeClass('current');
        $('#page1').addClass('current');
        document.getElementById('EvidenceFrame').src = "/EvidenceAPI/result-page1-modified.html";
    },
    'click #page2': function(event, element) {
        $('.Evidencepagination li').removeClass('current');
        $('#page2').addClass('current');
        document.getElementById('EvidenceFrame').src = "/EvidenceAPI/result-page2-modified.html";
    },
    'click #page3': function(event, element) {
        $('.Evidencepagination li').removeClass('current');
        $('#page3').addClass('current');
        document.getElementById('EvidenceFrame').src = "/EvidenceAPI/result-page3-modified.html";
    },
    'click #page4': function(event, element) {
        $('.Evidencepagination li').removeClass('current');
        $('#page4').addClass('current');
        document.getElementById('EvidenceFrame').src = "/EvidenceAPI/result-page4-modified.html";
    },
    'click #page5': function(event, element) {
        $('.Evidencepagination li').removeClass('current');
        $('#page5').addClass('current');
        document.getElementById('EvidenceFrame').src = "/EvidenceAPI/result-page5-modified.html";
    },
    'click #page6': function(event, element) {
        $('.Evidencepagination li').removeClass('current');
        $('#page6').addClass('current');
        document.getElementById('EvidenceFrame').src = "/EvidenceAPI/result-page6-modified.html";
    },
    'click #page7': function(event, element) {
        $('.Evidencepagination li').removeClass('current');
        $('#page7').addClass('current');
        document.getElementById('EvidenceFrame').src = "/EvidenceAPI/result-page7-modified.html";
    }
});

//adjust the height width of the iframe onload complete
Template.EvidenceAPI.resizeIframe = function(obj) {
    document.getElementById("anim_loading_theme").style.visibility = "hidden";
    document.getElementById("overlay").style.display = "none";
};

Template.EvidenceAPI.destroyed = function(){
    //show header sections
    $('.top-navigation-div').show();
    $('.head-emr-details').show();
};