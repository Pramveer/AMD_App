import {
    Template
} from 'meteor/templating';
import './login.html';

//Perform operation when template rendered
Template.login.rendered = function () {
    $('.loginbox').parents('.wrapper').css('max-width', '100%');
    // subtract extra spacing of 26px on the loginpage
    setTimeout(function () {
        $('.content-wrapper').css('height', $(document).height() - ($('.main-header').height()) - $('.main-footer').height() - 26);
        //$('.login-modal-content').css('margin-top', (($('html').height() - $('.login-modal-content').height()) / 2) - 120);
    }, 100);

};

//Custom login method for Account package
Meteor.clientCustomLogin = function (user, password, callback) {

    //meteor selects login method based on the argument names. If you use 'user' and 'password' it will use default login method
    Accounts.callLoginMethod({
        methodArguments: [{
            clientUser: user,
            clientPassword: password
        }],
        userCallback: callback
    });
};
Template.login.submitLogin = function () {
    //console.log("USER LOGGING IN....");
    var user = $('#txtUser').val().trim().toLowerCase(),
        pass = $('#txtPassword').val();

    if (user.length > 0 && pass.length > 0) {
        // Meteor.loginWithPassword(user, pass);
        //Call Serverside method to validate user
        document.getElementById("anim_loading_theme").style.visibility = "visible";
        document.getElementById("overlay").style.display = "block";

        // Working custom login method

        Meteor.clientCustomLogin(user, pass, function (err) {
            //if user is successfully validated then store information in local and redirect to landing page
            if (!err) {
                //Once user is logged in its data accessed from Mongo collection Meteor.user()
                var userInfo = Meteor.user();
                /**
                 * @author: Arvind
                 * @reviewer: 
                 * @date: 01-Mar-2017
                 * @desc: New role `PrimaryCarePhysician`is added to system and based on role
                 *  landing page is displayed previously landing page is 'Dashboard' for all role
                 */
                console.log(userInfo);
              //  location.href = '/';

                // role value 5 is for PrimaryCarePhysician
                if (userInfo.profile.userDetail.role === 5) {
                    location.href = '/AssessmentTool';
                } else {
                    location.href = '/';
                }


                // localStorage.userDetail = JSON.stringify(userInfo.profile.userDetail);
                //localStorage.setItem('user', user);
                localStorage.setItem('loginTime', new Date());
                //Router.go('/newPatient');
                //Set ProviderID as logged in user name
                localStorage.ProviderID = Meteor.user().profile.userDetail.username;
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
            } else {
                document.getElementById("anim_loading_theme").style.visibility = "hidden";
                document.getElementById("overlay").style.display = "none";
                alertify.alert('Pinscriptive Login', 'Please enter correct username/password');
                console.log(err);
            }

            //else Router.go('/');

        });
    } else {
        alertify.alert('Pinscriptive Login', 'Please fill both fields');
        //alert('please fill both fields');
    }
};

//Handle events for login page
Template.login.events({
    //Handle click event for validate user
    'click .loginbox-btn1 ': function (e) {
        //prevent default behaviour of button or submit button
        e.preventDefault();
        // ...
        console.log("BUTTON CLICKED");
        var user = $('#txtUser').val().trim().toLowerCase(),
            pass = $('#txtPassword').val();

        if (user.length > 0 && pass.length > 0) {
            // Meteor.loginWithPassword(user, pass);
            //Call Serverside method to validate user
            document.getElementById("anim_loading_theme").style.visibility = "visible";
            document.getElementById("overlay").style.display = "block";

            // Working custom login method
            Meteor.clientCustomLogin(user, pass, function (err) {
                //if user is successfully validated then store information in local and redirect to landing page
                if (!err) {
                    //Once user is logged in its data accessed from Mongo collection Meteor.user()
                    var userInfo = Meteor.user()
                    //localStorage.userDetail = JSON.stringify(userInfo.profile.userDetail);
                    //localStorage.setItem('user', user);
                    localStorage.setItem('loginTime', new Date());

                    //Set ProviderID as logged in user name
                    localStorage.ProviderID = Meteor.user().profile.userDetail.username;
                    location.href = '/newPatient';
                    document.getElementById("anim_loading_theme").style.visibility = "hidden";
                    document.getElementById("overlay").style.display = "none";
                } else {
                    document.getElementById("anim_loading_theme").style.visibility = "hidden";
                    document.getElementById("overlay").style.display = "none";
                    alertify.alert('Pinscriptive Login', 'Please enter correct username/password');
                    console.log(err);
                }

                //else Router.go('/');

            });
        } else {
            alertify.alert('Pinscriptive Login', 'Please fill both fields');
            //alert('please fill both fields');
        }

    },
    // Reset form value and selection when user click forgot password button
    'click .a-forgot-user': function (e) {
        $("#txtForgotUser").val('');
        $("#txtForgotPass").val('');
        $("#txtForgotBoth").val('');
        $('.fpd_password').hide();
        $('.forgot-footer').hide();
        $("input[name=rdoForgot]").removeAttr("checked");

    },
    // Display textbox with sliding animation when user select option for forgot detail and reset existing value
    'change input[name=rdoForgot]:radio': function (e) {
        var selection = e.target.value;
        $('.fpd_password').slideUp();
        if (selection === 'username') {
            $("#txtForgotUser").val('');
            $('#fpd_user').slideDown();
        } else if (selection === 'password') {
            $("#txtForgotPass").val('');
            $('#fpd_pass').slideDown();
        } else if (selection === 'both') {
            $("#txtForgotBoth").val('');
            $('#fpd_both').slideDown();
        }
        $('.forgot-footer').slideDown();

    },
    //handle click event for forgot detail
    'click #btnForgotUser': function (e) {
        e.preventDefault();
        var email = "";
        var modeType;
        //Fetch selected radio button value and do operation based on value
        var selectionMode = $('input[name=rdoForgot]:checked').val();

        if (selectionMode === 'username') {
            modeType = 2;
            email = $("#txtForgotUser").val().trim();
        } else if (selectionMode === 'password') {
            modeType = 1;
            email = $("#txtForgotPass").val().trim();
        } else if (selectionMode === 'both') {
            modeType = 3;
            email = $("#txtForgotBoth").val().trim();
        }

        //Send email to user with forgot detail if email is not empty and is existing user
        if (email.length > 0 && isValidEmail(email)) {
            Meteor.call('ForgotPassword', email, function (error, result) {

                if (error) {
                    console.log("error while method call");

                } else if (result) {

                    if (result.response.length > 0 && result.response[0].length > 0) {

                        var mailFields = {
                            to: email,
                            subject: 'Pinscriptive : Account Recovery',
                            type: modeType, // For Forgotpass template
                            username: result.response[0][0].username,
                            password: result.response[0][0].userpass
                        };

                        $('.mypo_notificaton span').text("Information will be sent to your mailbox momentarily");
                        $('.mypo_notificaton').slideDown();
                        setTimeout(function () {
                            $('.mypo_notificaton').slideUp();
                            $('#ForgotUserName').modal('toggle');
                        }, 2000);

                        Meteor.call('sendEmail', mailFields, function (err, res) {
                            console.log("Email send successfully");

                        });


                    } else {
                        //To do if no such user exist
                        console.log(result);
                        $('.mypo_warn_notificaton span').text('No such user exist, please enter correct email');
                        $('.mypo_warn_notificaton').slideDown();
                        setTimeout(function () {
                            $('.mypo_warn_notificaton').slideUp();
                        }, 5000);

                    }
                }
            });
        } else {
            //Display validation if email is empty or not valid email
            if (!isValidEmail(email)) {
                $('.mypo_warn_notificaton span').text('Please enter valid email');
            } else {
                $('.mypo_warn_notificaton span').text('Please enter email');
            }
            $('.mypo_warn_notificaton').slideDown();
            setTimeout(function () {
                $('.mypo_warn_notificaton').slideUp();
            }, 5000);
            //To do if email field is empty
        }

    }
});

//Check email validation
function isValidEmail(value) {
    // From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
    // Retrieved 2014-01-14
    // If you have a problem with this implementation, report a bug against the above spec
    // Or use custom methods to implement your own email validation
    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);

}

Template.login.helpers({
    getCurrentYear: function () {
        return new Date().getFullYear().toString();
    }

});