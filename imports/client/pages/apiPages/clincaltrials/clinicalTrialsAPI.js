import { Template } from 'meteor/templating';
import './clinicalTrialsAPI.html';

let ClinicalTrials = {};
let $selectizeCombo = '';
Template.ClinicalTrialsAPI.rendered = function() {
    //hide header sections
    $('.top-navigation-div').hide();
    $('.head-emr-details').hide();

    $('.main-header').css('display', 'none');
    $('.loginAdmin').css('right', '0%');
    $('.contentRenderFrameParentEvidence').css('height', $(window).height() - 110);
    $('.backToStudies').css('display', 'none');
    // select = document.getElementById("clinicaldrugSelectCombo");
    // for (var i = 0; i < AllDrugs.length; i++) {
    //     var option = document.createElement("option");
    //     option.value = AllDrugs[i].name;
    //     option.textContent = AllDrugs[i].name;
    //     select.appendChild(option);
    // };
    hidePagination();
    hidePrev();
    hideNext();
    // // Initializing RDropdowns.
    // $('.cpinDDL').selectize({
    //     create: false,
       
    //     dropdownParent: null
    // });
     
    $selectizeCombo = $('.clinicaldrugSelectCombo').selectize();
    $selectizeCombo[0].selectize.setValue("select");
    document.getElementById("clinincalPageCountWrapper").style.display = "none";

    ClinicalTrials.ClinicalDrugName = "";

    // set number of content to display on a page
    ClinicalTrials.ClinicalPageSize = 20;

    // set current page default to 1
    ClinicalTrials.CurrentPage = 1;

    // set current page default to 1
    ClinicalTrials.PageFrameSize = 7;
}

Template.ClinicalTrialsAPI.drugChanged = function(value) {
     console.log(value);

    //Restrict reload page for 'select' option value
    if(value!='select'){
    $('.backToStudies').css('display', 'none');
    document.getElementById("Mycontent").innerHTML = '';
    hidePagination();
    hidePrev();
    hideNext();
    hideLastPaginationPage();
    document.getElementById("anim_loading_theme").style.top = "20%";
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
    document.getElementById("clinincalPageCountWrapper").style.display = "block";

    value = value.replace(/\s+/g, '_');
    value = value.replace("+", "AND");
    displayData(value);
    ClinicalTrials.ClinicalDrugName = value;
    ClinicalTrials.CurrentPage = 1;
}

}
Template.ClinicalTrialsAPI.helpers({
        'druglist':function(){
            return AllDrugs.reactive();
        }
    });
Template.ClinicalTrialsAPI.events({
    'click .backButton': function(event, element) {
        //    window.location = "/Drugs";
        document.body.style.overflow = 'none';
      //  $('.main-header').css('display', 'block');
        $('.loginAdmin').css('right', '0%');
        $('.clinicalPaginationWrapper').css('display', 'block');
      //  window.location = 'javascript:Router.go("Drugs");';

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
    },
    'click .backToStudies': function(event, element) {
        $('.backToStudies').css('display', 'none');
        document.getElementById("Mycontent").innerHTML = '';
        showPagination();
        $('.clinicalPaginationWrapper').css('display', 'block');
        displayData(ClinicalTrials.ClinicalDrugName);
    },
    'click .clinicalPagination li': function(event, element) {
        ClinicalTrials.CurrentPage = event.currentTarget.innerHTML;
        handlePagination();
    },

    'click #lastPaginationPage li': function(event, element) {
        ClinicalTrials.CurrentPage = event.currentTarget.innerHTML;
        // var newFirstChild = ClinicalTrials.CurrentPage - ClinicalTrials.PageFrameSize +1;
        // hideLastPaginationPage();
        // createPages(newFirstChild);
        handlePagination();
        $('#lastPaginationPage li').addClass('clinicalCurrentPage');
    },

    'click .clinical-tabs .clinical-tab-links a': function(event, element) {
        var currentAttrValue = $(event.currentTarget).attr('href');

        // Show/Hide Tabs
        $('.clinical-tabs' + currentAttrValue).show().siblings().hide();

        // Change/remove current tab to active
        $(event.currentTarget).parent('li').addClass('active').siblings().removeClass('active');

        event.preventDefault();
    },

    'click .clinical-tabs .clinical-tab-links a': function(event, element) {
        var currentAttrValue = $(event.currentTarget).attr('href');

        // Show/Hide Tabs
        $('.clinical-tabs ' + currentAttrValue).show().siblings().hide();

        // Change/remove current tab to active
        $(event.currentTarget).parent('li').addClass('active').siblings().removeClass('active');

        event.preventDefault();
    },




    'click .prev': function(event, element) {
        showNext();
        var firstChild = $("#clinicalPagination li").first();
        var firstChildValue = firstChild[0].innerHTML;
        var pageFrameSize = ClinicalTrials.PageFrameSize;
        if (firstChildValue === "1") {} else {
            var newFirstChild = parseInt(firstChildValue) - pageFrameSize;
            if (newFirstChild === "1") {
                hidePrev();
            }
            var lastChild = $("#clinicalPagination li").last();
            var lastChildValue = parseInt(lastChild[0].innerHTML);
            var lastPage = Math.ceil(ClinicalTrials.ClinicalRecords / ClinicalTrials.ClinicalPageSize);
            if (lastChildValue === lastPage) {
                showLastPaginationPage();
            }
            createPages(newFirstChild);
        }

    },

    'click .next': function(event, element) {
        showPrev();
        var lastChild = $("#clinicalPagination li").last();

        var lastChildValue = lastChild[0].innerHTML;
        var lastPage = Math.ceil(ClinicalTrials.ClinicalRecords / ClinicalTrials.ClinicalPageSize);
        var pageFrameSize = ClinicalTrials.PageFrameSize;
        if (Number(lastChildValue) !== lastPage) {
            var newFirstChild = parseInt(lastChildValue) + 1;
            if (newFirstChild + pageFrameSize > lastPage) {
                hideNext();
                hideLastPaginationPage();
            }
            createPages(newFirstChild);
        } else {

        }
    }
});

function displayData(drugName) {
    document.getElementById("anim_loading_theme").style.top = "30%";
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
    document.getElementById("clinicalPaginationPageNumbers").style.display = "none";
    var xml, xsl;
    $.ajax({
        url: 'ClinicalTrialsAPI/' + drugName + '_Studies.xml',
        dataType: 'xml',
        success: function(result) {
            xml = result;
            ClinicalTrials.ClinicalRecords = $(xml).find('search_results').attr('count');
            $.ajax({
                url: 'ClinicalTrialsAPI/ClinicalTrialStudies.xsl',
                success: function(result1) {
                    xsl = result1;

                    var xsltProcessor = new XSLTProcessor();
                    xsltProcessor.importStylesheet(xsl);
                    resultDocument = xsltProcessor.transformToFragment(xml, document);
                    document.getElementById("Mycontent").innerHTML = '';
                    document.getElementById("Mycontent").appendChild(resultDocument);
                    document.getElementById("anim_loading_theme").style.visibility = "hidden";
                    document.getElementById("overlay").style.display = "none";
                    document.getElementById("anim_loading_theme").style.top = "40%";
                    document.getElementById("clinicalPaginationPageNumbers").style.display = "block";
                },
                error: function(xhr, textStatus, errorThrown) {


                    document.getElementById("anim_loading_theme").style.visibility = "hidden";
                    document.getElementById("overlay").style.display = "none";
                    document.getElementById("anim_loading_theme").style.top = "40%";
                    document.getElementById("clinicalPaginationPageNumbers").style.display = "block";
                }
            }).done(function() {
                handlePagination();
                setPagination(ClinicalTrials.ClinicalRecords);

            });

        },
        error: function(xhr, textStatus, errorThrown) {
            document.getElementById("anim_loading_theme").style.visibility = "hidden";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("anim_loading_theme").style.top = "40%";
            document.getElementById("clinicalPaginationPageNumbers").style.display = "block";
        }
    });
}

Template.ClinicalTrialsAPI.showStudyDetails = function(url) {
    var nct_ID = url.substr(url.lastIndexOf('/') + 1);
    $('.backToStudies').css('display', 'block');
    hidePagination();
    $('.clinicalPaginationWrapper').css('display', 'none');
    document.getElementById("Mycontent").innerHTML = '';
    showNctXml(nct_ID);
};

function showNctXml(nctfile_ID) {
    var nct_xml, nct_xsl;
    document.getElementById("clinincalPageCountWrapper").style.display = "none";
    document.getElementById("anim_loading_theme").style.top = "20%";
    document.getElementById("anim_loading_theme").style.visibility = "visible";
    document.getElementById("overlay").style.display = "block";
    $.ajax({
        url: 'ClinicalTrialsAPI/Nct_Files/' + nctfile_ID + '.xml',
        dataType: 'xml',
        success: function(result) {
            nct_xml = result;
            $.ajax({
                url: 'ClinicalTrialsAPI/Nct_Details.xsl',
                success: function(result1) {
                    nct_xsl = result1;
                    var xsltProcessor = new XSLTProcessor();
                    xsltProcessor.importStylesheet(nct_xsl);
                    resultDocument = xsltProcessor.transformToFragment(nct_xml, document);
                    document.getElementById("Mycontent").appendChild(resultDocument);
                    document.getElementById("anim_loading_theme").style.visibility = "hidden";
                    document.getElementById("overlay").style.display = "none";
                    document.getElementById("anim_loading_theme").style.top = "40%";
                },
                error: function(xhr, textStatus, errorThrown) {
                    document.getElementById("anim_loading_theme").style.visibility = "hidden";
                    document.getElementById("overlay").style.display = "none";
                    document.getElementById("anim_loading_theme").style.top = "40%";
                }
            });
        },
        error: function(xhr, textStatus, errorThrown) {
            document.getElementById("clinincalPageCountWrapper").style.display = "none";
            document.getElementById("Mycontent").innerHTML = 'No data Found !';
            document.getElementById("anim_loading_theme").style.visibility = "hidden";
            document.getElementById("overlay").style.display = "none";
            document.getElementById("anim_loading_theme").style.top = "40%";
        }
    });
};

function setPagination() {
    var currentPage = ClinicalTrials.CurrentPage;
    var numPages = Math.ceil(ClinicalTrials.ClinicalRecords / ClinicalTrials.ClinicalPageSize);
    document.getElementById("clinincalPageCountWrapper").style.display = "block";
    /* Show and Hide of Navogation buttons for Paginations*/
    hidePrev();
    if (numPages <= ClinicalTrials.PageFrameSize) {
        hideNext();
    } else {
        showNext();
    }

    if (currentPage < 1) {
        currentPage = 1;
    }
    if (currentPage > numPages) {
        currentPage = numPages;
    }
    var html = "<ul>";
    var pageFrameSize = ClinicalTrials.PageFrameSize;
    for (var i = 0; i < pageFrameSize && i < numPages; i++) {
        var eleID = "pagenumber_" + (i + 1);
        html += "<li id=" + eleID + ">" + (i + 1) + "</li>";
    }
    html += "</ul>";
    if (numPages > pageFrameSize) {
        var lastPage = "<span>...of</span><ul>";
        var eleID = "lastpage_" + numPages;
        lastPage += "<li id=" + eleID + ">" + numPages + "</li>";
        lastPage += "</ul>";
        document.getElementById("lastPaginationPage").innerHTML = lastPage;
        showLastPaginationPage();
    }
    document.getElementById("clinicalPagination").innerHTML = html;
    if (numPages <= 1) {
        hidePagination();
    } else {
        showPagination();
    }

    $('#pagenumber_1').addClass('clinicalCurrentPage');
    showCounts();

};

function createPages(value) {
    var numPages = Math.ceil(ClinicalTrials.ClinicalRecords / ClinicalTrials.ClinicalPageSize);
    var pageFrameSize = ClinicalTrials.PageFrameSize;
    if (value >= 1 && value <= numPages) {
        var html = "<ul>";
        for (var i = value; i < value + pageFrameSize && i <= numPages; i++) {
            var eleID = "pagenumber_" + (i);
            html += "<li id=" + eleID + ">" + (i) + "</li>";
        }
        html += "</ul>";
        document.getElementById("clinicalPagination").innerHTML = html;
    }
}

function handlePagination() {
    var currentPage = ClinicalTrials.CurrentPage;
    var startPoint = (currentPage - 1) * ClinicalTrials.ClinicalPageSize;
    var endPoint = currentPage * ClinicalTrials.ClinicalPageSize;
    $('.clinicalPagination li').removeClass('clinicalCurrentPage');
    $('#lastPaginationPage li').removeClass('clinicalCurrentPage');
    $('#pagenumber_' + currentPage).addClass('clinicalCurrentPage');
    for (i = 1; i <= ClinicalTrials.ClinicalRecords; i++) {
        if ((i > startPoint) && (i <= endPoint)) {
            $("#studyid_" + i).css('display', '');
        } else {
            $("#studyid_" + i).css('display', 'none');
        }
    }
    showCounts();
};

function disablePrev() {
    var btn_prev = document.getElementById("btn_prev");
    btn_prev.setAttribute("disabled", true);

    document.getElementById("btn_prev").style.opacity = ".6";
    document.getElementById("btn_prev").style.cursor = "default";
};

function disableNext() {
    var btn_prev = document.getElementById("btn_next");
    btn_prev.setAttribute("disabled", true);
    document.getElementById("btn_next").style.opacity = ".6";
    document.getElementById("btn_next").style.cursor = "default";
};

function enablePrev() {
    var btn_prev = document.getElementById("btn_prev");
    btn_prev.setAttribute("disabled", false);
    document.getElementById("btn_prev").style.opacity = "1";
    document.getElementById("btn_prev").style.cursor = "pointer";
};

function enableNext() {
    var btn_prev = document.getElementById("btn_next");
    btn_prev.setAttribute("disabled", false);
    document.getElementById("btn_next").style.opacity = "1";
    document.getElementById("btn_next").style.cursor = "pointer";
};

function hidePagination() {
    document.getElementById("clinicalPagination").style.display = "none";
};

function showPagination() {
    document.getElementById("clinicalPagination").style.display = "block";
};

function hidePrev() {
    document.getElementById("btn_prev").style.display = "none";
};

function hideNext() {
    document.getElementById("btn_next").style.display = "none";
};

function showPrev() {
    document.getElementById("btn_prev").style.display = "block";
};

function showNext() {
    document.getElementById("btn_next").style.display = "block";
};

function hideLastPaginationPage() {
    document.getElementById("lastPaginationPage").style.display = "none";
};

function showLastPaginationPage() {
    document.getElementById("lastPaginationPage").style.display = "block";
};

function showCounts() {
    var resutStartsFrom = ((ClinicalTrials.ClinicalPageSize * ClinicalTrials.CurrentPage) + 1 - ClinicalTrials.ClinicalPageSize);
    var maximumResultOnPage = (ClinicalTrials.ClinicalPageSize * ClinicalTrials.CurrentPage);
    var totalResult = ClinicalTrials.ClinicalRecords;
    if (totalResult <= maximumResultOnPage) {
        var pages = resutStartsFrom + '-' + totalResult + ' of ' + totalResult;

    } else {
        var pages = resutStartsFrom + '-' + maximumResultOnPage + ' of ' + totalResult;

    }
    document.getElementById("clinicalPaginationPageNumbers").innerHTML = pages;
};

Template.ClinicalTrialsAPI.destroyed = function(){
    //show header sections
    $('.top-navigation-div').show();
    $('.head-emr-details').show();
};