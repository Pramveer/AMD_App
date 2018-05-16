import './dashboardLayout.html';

// import '../../ui/components/loading';

import { Meteor } from 'meteor/meteor';

Template.dashboardLayout.destroyed = function() {
    //  console.log("dashboardLayout Layout destroyed ");
};
//Place Global event  handler whicvh will be call from any page
Template.dashboardLayout.events({
    "submit form": function(e) {
        e.preventDefault();
    },
    // Log out handler
    'click .js-logout': function(e) {
        console.log("Logged out ");
        e.preventDefault();

        //Call Serverside method to logout user
        var isLoggedOut = false;
        //Call server side ValidateUser method to validate user
        Meteor.call('UserLogout', Meteor.user().profile.userDetail.username, function(error, result) {
            isLoggedOut = result ? result.isValid : false;
            // console.log(result);
            if (isLoggedOut) {
                // Clear local storage once user logged out from system
                Meteor.logout();
                //localStorage.clear();
                Router['PatientId'] = '';
                location.href = '/login';

            } else {
                console.log('Some problem while logout');
                //alert('please enter correct username/password');
            }
        });


    },
    // View/Save My Account info for logged in user
    'click .mypo_save_btn': function(e) {
        e.preventDefault();
        //Call Serverside method to logout user
        var isPasswordUpdated = false;
        var user = Meteor.user().profile.userDetail.username;
        var oldPass = $("#txtOldPass").val().trim();
        var newPass = $("#txtNewPass").val().trim();
        var email = $("#txtEmail").val().trim();
        //added by jayesh 5th may 2017 for password validation
         if(newPass.length <  6)
        {
                $('.mypo_warn_notificaton span').text("Password must be contain at least 6 characters");
                $('.mypo_warn_notificaton').slideDown();
                setTimeout(function() {
                    $('.mypo_warn_notificaton').slideUp();
                }, 3000);
                return;
        }
        //Call server side ValidateUser method to validate user
        Meteor.call('UpdatePassword', user, oldPass, newPass, email, function(error, result) {
            isPasswordUpdated = result ? result.isValid : false;
            console.log(error);
            console.log(result)

            if (isPasswordUpdated) {
                // Clear local storage once user
                var userDetail = Meteor.user().profile.userDetail && Meteor.user().profile.userDetail ? Meteor.user().profile.userDetail : null;
                if (userDetail && userDetail.UserCount) {
                    userDetail.email = email;
                    //localStorage.userDetail = JSON.stringify(userDetail);
                    //Set Custom message
                    $('.mypo_notificaton span').text('User info updated successfully');
                    $("#txtOldPass").val('');
                    $("#txtNewPass").val('');
                    $('.mypo_notificaton').slideDown();
                    setTimeout(function() {
                        $('.mypo_notificaton').slideUp();
                    }, 3000);
                }
                console.log('Password updated successfully');
            } else {

                $('.mypo_warn_notificaton span').text("Please enter correct old password");
                $('.mypo_warn_notificaton').slideDown();
                setTimeout(function() {
                    $('.mypo_warn_notificaton').slideUp();
                }, 3000);

                //console.log('Some problem while change password');
                //alert('please enter correct username/password');
            }
        });

    },
    //Display My Account info pop up
    'click .myacc_btn': function() {
        //hide notification message
        $('.mypo_notificaton').hide();
        $(".myact_popup").show();
        $("#txtOldPass").val('');
        $("#txtNewPass").val('');
        $(".mypo_close_btn").click(function(e) {
            $(".myact_popup, .overlay").hide();
        });
        $(".MyAccountCloseIcon").click(function(e) {
            $(".myact_popup, .overlay").hide();
        });
    },
    // Display AdminDashboard
    'click .js-open-admin': function() {
        //console.log('Admin dashboard opened');
        $('#adminframe').attr('src', '/AdminDashboard');
        $('.ha_blk_bg').css('height', ($('html').height()));
        $(".hadmin_popup").show();
        $('.popup-modal').css('left', $('.fullwidth').offset().left);
        // $(".hadmin_closebtn").click(function(e) {
        //     console.log('Admin dashboard closed');
        //     $('#adminframe').attr('src', '');
        //     $(".hadmin_popup, .overlay").hide();
        // });
    },
    'click .hadmin_closebtn': function() {
        //console.log('Admin dashboard closed');
        $('#adminframe').attr('src', '');
        $(".hadmin_popup, .overlay").hide();
    },

    'click .left-side-menu li a': function(e) {
        // $('html, body').animate({
        //
        //     scrollTop: $(".right-side-content").offset().top
        //
        // }, 2000);
        let isHaveSubMenu = $(e.currentTarget).parent().hasClass('hasSubMenu');
        if (!isHaveSubMenu) {
            var element = $('#popupForCalculator');
            if (!isScrolledIntoView(element) && element.css("display") == "block") {
                $('html,body').animate({
                    scrollTop: element.offset().top - ($(window).height() / 2) + 150
                }, 'slow');
            } else {
                $('html,body').animate({
                    scrollTop: $(".right-side-content").offset().top - ($(window).height() / 2) + 150
                }, 'slow');
            }
        }

        //  $('.top-navigation > li:nth-child(2) > a').addClass('active');
    },
    'click .pro-que-btn': function() {
        console.log("Hide Toast");
    },

    "keyup .searchinput": function(e) {
        e.preventDefault();
        Session.set("searchValue", $(".searchinput").val());
        var searchkey = $(".searchinput").val();
        if (searchkey != "") {
            PatientDataList.change([$(".searchinput").val()]);
            PatientDataListCount.change([$(".searchinput").val()]);
        }
        if ($(".searchinput").val() == "" || $(".searchinput").val() === null) {
            history.back();
        } else {
            Router.go('/searchpatient');
        }

    },
    "click .searchbutton": function(e) {
        e.preventDefault();
        Session.set("searchValue", $(".searchinput").val());
        var searchkey = $(".searchinput").val();
        if (searchkey != "") {
            PatientDataList.change([$(".searchinput").val()]);
            PatientDataListCount.change([$(".searchinput").val()]);
        }
        if ($(".searchinput").val() == "" || $(".searchinput").val() === null) {
            history.back();
        } else {
            Router.go('/searchpatient');
        }

    }


});

/** Reference from :http://jsfiddle.net/tovic/vVaat/light/
 * Reference from  http://stackoverflow.com/questions/487073/check-if-element-is-visible-after-scrolling
 */
function isScrolledIntoView(elem) {
    //console.log("isScrolledIntoView");
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();
    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));

}

// highLightTab = function(name) {
//     var nav = document.getElementsByClassName('NavigateUrlByTabDesk');
//     for (var i = 0; i < nav.length; i++) {
//         if (nav[i].innerHTML.trim().toLowerCase() == name.toLowerCase()) {
//             nav[i].parentNode.className = 'active';
//         } else {
//             nav[i].parentNode.className = '';
//         }
//     }
// }