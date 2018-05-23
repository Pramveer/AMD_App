import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './adminDashboard.html';
//create validator variable to store state of jquery Validate
let validator;
//Create array of all tabs/page
const sampleTags = ['Payer', 'Provider', 'Analytics', 'Patient', 'Efficacy', 'Adherence', 'Utilization', 'Safety', 'Pharma'];
Template.AdminDashboard.rendered = function() {
    $('.main-header').css('display', 'none');
    $('.loginAdmin').css('right', '0%');

    // Initialize jquery Validate on user form
    validator = $("#frmUser").validate({
        rules: {
            txtFname: {
                required: true
            },
            txtLname: {
                required: true
            },
            txtUEmail: {
                required: true,
                email: true
            },
            txtUserName: {
                required: true,
                minlength: 3
            },
            ddlRole: {
                DropDown: true
            },
            ddlProvider: {
                DropDown: true
            },
            ddlGender: {
                DropDown: true
            }
        },
        messages: {
            txtUEmail: {
                required: "Please enter email address.",
                email: "Please enter a valid email address."
            },
            txtFname: {
                required: "Please enter first name."
            },
            txtLname: {
                required: "Please enter last name."
            },
            ddlRole: {
                DropDown: "Please select role."
            },
            ddlProvider: {
                DropDown: "Please select organization."
            },
            ddlGender: {
                DropDown: "Please select gender."
            },
            txtUserName: {
                required: "Please enter user name."
            },
        }

    });
    //Custom validator for dropdown
    jQuery.validator.addMethod("DropDown", function(value, element) {
        return this.optional(element) || value !== "0";
    }, "Please select");

    //-------------------------------
    // Tag initialization
    //-------------------------------
    $('#txtTabs').tagit({
        availableTags: sampleTags,
        removeConfirmation: true,
        beforeTagAdded: function(evt, ui) {
            if (!ui.duringInitialization) {
                console.log(ui.tagLabel);
                if (sampleTags.indexOf(ui.tagLabel) === -1) {
                    return false;
                }
            }
        }
    });
};



// Helper methods for  Logged In User template
Template.AdminDashboard.helpers({

    'IsAdmin': function() {
        var user = Meteor.user().profile.userDetail && Meteor.user().profile.userDetail ? Meteor.user().profile.userDetail : {
            "UserCount": 1,
            "username": "",
            "email": "",
            "organization": "",
            "org_id": 1,
            "role": 0
        };
        return user.role === 1 ? true : false;
    },
    'getRoles': function() {
        var user = Meteor.user().profile.userDetail && Meteor.user().profile.userDetail ? Meteor.user().profile.userDetail : {
            "UserCount": 1,
            "username": "",
            "email": "",
            "organization": "",
            "org_id": 1,
            "role": 0
        };
        if (user.role === 1) {
            return `<select name="ddlRole" id="ddlRole" class="tg-txtfld">
                        <option value="0">Select Role</option>
                        <option value="1">Admin</option>
                        <option value="2">Payer</option>
                        <option value="3">Provider</option>
                        <option value="4">Custom</option>
                        <option value="5">PrimaryCarePhysician</option>                       
                    </select>`;
        } else if(user.role === 2){
            return `<select name="ddlRole" id="ddlRole" class="tg-txtfld">
                        <option value="0">Select Role</option>
                        <option value="${user.role}">${user.role_name}</option>
                        <option value="5">PrimaryCarePhysician</option>
                    </select>`
                    ;
        }else{
              return `<select name="ddlRole" id="ddlRole" class="tg-txtfld">
                        <option value="0">Select Role</option>
                        <option value="${user.role}">${user.role_name}</option>
                    </select>`
                    ;
        }

    },
    'getOrganizations': function() {
        var user = Meteor.user().profile.userDetail && Meteor.user().profile.userDetail ? Meteor.user().profile.userDetail : {
            "UserCount": 1,
            "username": "",
            "email": "",
            "organization": "",
            "org_id": 1,
            "role": 0
        };
        if (user.role === 1) {
            return `<select name="ddlProvider" id="ddlProvider" class="tg-txtfld">
                        <option value="0">Select Organization</option>
                        <option value="1">AmdApp Inc</option>
                        <option value="2">PHS</option>
                    </select>`;
        } else {
            return `<select name="ddlProvider" id="ddlProvider" class="tg-txtfld">
                        <option value="0">Select Organization</option>
                        <option value="${user.org_id}">${user.organization}</option>
                    </select>`;
        }
    }
});

Template.AdminDashboard.events({
    //handle event when user submit form
    'submit #frmUser ': function(e) {
        console.log("User form submitted");
        e.preventDefault();
    },
    //Handle role change event and display textbox when custom role is selected
    'change #ddlRole': function(e) {
        let role = $("#ddlRole").val().trim();
        if (role === "4") {
            $('.custom-role-tab').slideDown();
        } else {
            $('.custom-role-tab').slideUp();
        }
        // added by jayesh 5th may 2017 for role dropdown, when payer & provider selected, then only show super user option.
        let user = Meteor.user().profile.userDetail && Meteor.user().profile.userDetail ? Meteor.user().profile.userDetail : {
            "UserCount": 1,
            "username": "",
            "email": "",
            "organization": "",
            "org_id": 1,
            "role": 0
        };
        if (user.role === 1)
        {
              if (role === "2" || role === "3") {
                    $('#superUserDiv').show();
              }
              else{
                    $('#superUserDiv').hide();
                    $('#chkSuperuser').prop('checked', false);
              }
        } 
    },
    //Toggle user insertion form window when user click new nutton and hide update button
    'click #btnNewUser': function() {
        $('#btnSaveUser').show();
        $('#btnUpdateUser').hide();
        //Reset/clear previous validation
        validator.resetForm();
        $('.user-info-container').slideToggle();
        let userInfo = {
            email: "",
            first_name: "",
            last_name: "",
            network: "",
            org_id: 0,
            provider: "",
            role: 0,
            role_name: "",
            user_id: 0,
            username: "",
            tabs_name: "",
            gender: 0
        }
        fillUserInfo(userInfo);
        $("#ddlProvider").prop('disabled', false);
        $("#ddlGender").prop('disabled', false);
        $("#txtUserName").prop('disabled', false);
        $("#txtUserName").focus();
    },
    //Pre fill user info when user click edit icon
    'click .edit-user': function() {
        $('#btnSaveUser').hide();
        $('#btnUpdateUser').show();
        //Reset/clear previous validation
        validator.resetForm();
        //fill current user data to form
        fillUserInfo(this);
        console.log(this);
        $("#ddlProvider").prop('disabled', true);
        $("#ddlGender").prop('disabled', true);
        $("#txtUserName").prop('disabled', true);
        $('.user-info-container').slideDown();
        //display tab  selection is selected user have custom role
        let role = $("#ddlRole").val().trim();
        if (role === "4") {
            $('.custom-role-tab').slideDown();
        } else {
            $('.custom-role-tab').slideUp();
        }
        $("#txtFname").focus();
    },
    // Provide confimation when user click disable/delete icon
    'click .delete-user': function() {
        if (confirm('Are you sure want to disable user ?')) {
            console.log("Delete user");

            let pData = {
                userid: this.user_id,
                username: this.username,
                userstatus: 0

            };

            Meteor.call('DeactivateUser', pData, function(err, res) {
                console.log("User deactivatation in progress...");
                console.log(res);
                if (res && res.response.affectedRows) {
                    console.log("User Deactivated successfully..");
                    $('.tb_notification').text("User disabled succesfully");
                    $('.tb_notification').slideDown();
                    setTimeout(function() {
                        $('.tb_notification').slideUp();
                    }, 3000);
                } else {
                    //To do if user not activated
                    $('.tb_warning_notification').text("Problem while disabling user");
                    $('.tb_warning_notification').slideDown();
                    setTimeout(function() {
                        $('.tb_warning_notification').slideUp();
                    }, 3000);
                }

            });


        }
    },
    //Reset password for selected user and send email to registered email
    'click .reset-user': function() {
        if (confirm('Are you sure want to reset password?')) {
            let email = this.email;
            let pData = {
                email: this.email,
                username: this.username,
                password: randomPasswordGenerator(16)
            };


            Meteor.call('ResetPassword', pData, function(err, res) {

                if (res && res.response.affectedRows) {

                    $('.tb_notification').text("User password reset succesfully");
                    $('.tb_notification').slideDown();
                    setTimeout(function() {
                        $('.tb_notification').slideUp();
                    }, 3000);
                    // console.log(userbody);
                    let mailFields = {
                        to: pData.email,
                        subject: 'AmdApp : Reset Password',
                        type: 3, // For Reset pwd/New user template
                        username: pData.username,
                        password: pData.password
                    };
                    Meteor.call('sendEmail', mailFields, function(err, res) {
                        console.log("Email send successfully for user creation");
                    });

                } else {
                    //To do if password not rest
                    $('.tb_warning_notification').text("Problem while reseting password");
                    $('.tb_warning_notification').slideDown();
                    setTimeout(function() {
                        $('.tb_warning_notification').slideUp();
                    }, 3000);
                }

            });
        }
    },
    //Save user record when click save button and send email to user
    'click #btnSaveUser': function() {

        //To Do Logic for Save operation
        console.log("Record Saved successfully");
        let role = $("#ddlRole").val().trim();
        let provider = $("#ddlProvider").val().trim();
        let gender = $("#ddlGender").val().trim();
        let isValid = $("#frmUser").valid();
        let selectedTabs = $("#txtTabs").val().trim();
        if (!isValid) {
            //To do if password not rest
            // $('.tb_warning_notification').text("Please fill all fields");
            // $('.tb_warning_notification').slideDown();
            // setTimeout(function() {
            //     $('.tb_warning_notification').slideUp();
            // }, 3000);
        } else if (role === "4" && selectedTabs.length === 0) {
            //Display Tab selection textbox only if selected role is 'Custom'
            $('.tb_warning_notification').text("Please select tabs for custom role");
            $('.tb_warning_notification').slideDown();
            setTimeout(function() {
                $('.tb_warning_notification').slideUp();
            }, 3000);

        } else {

            AddOrUpdateUser("I");
        }
    },
    //Update user record when user click update button but no need to send email
    'click #btnUpdateUser': function() {
        //To Do Logic for update operation
        console.log("Record update successfully");
        let role = $("#ddlRole").val().trim();
        //Check form validation with the help of jquery Validate plug in
        let isValid = $("#frmUser").valid();
        let selectedTabs = $("#txtTabs").val().trim();

        if (!isValid) {
            //To do if password not rest
            $('.tb_warning_notification').text("Please fill all fields");
            $('.tb_warning_notification').slideDown();
            setTimeout(function() {
                $('.tb_warning_notification').slideUp();
            }, 3000);
        } else if (role === "4" && selectedTabs.length === 0) {
            //Display Tab selection textbox only if selected role is 'Custom'
            $('.tb_warning_notification').text("Please select tabs for custom role");
            $('.tb_warning_notification').slideDown();
            setTimeout(function() {
                $('.tb_warning_notification').slideUp();
            }, 3000);

        } else {

            AddOrUpdateUser("U");
        }
    },
    //toggle form when user click close button
    'click .user_close_btn': function() {
        //To Do Logic slide up form and clear textbox field
        $('.user-info-container').slideToggle();
    }
});

/**
 * Description :Common function for insert or update record based on parameter
 * params      : @opMode have two value "i" for insertinon and "u" for updation
 */
function AddOrUpdateUser(opMode) {


    // For New user first check weather username or email already exist
    Meteor.call('IsUserExist', {
        UserEmail: $("#txtUEmail").val().trim(),
        UserName: $("#txtUserName").val().trim(),
        OpMode: opMode,
        UserId: Number($("#hdnId").val())
    }, function(error, result) {

        if (error) {

            console.log("error while method call");

        } else if (result) {
            console.log(result.message);
            console.log(result);

            if (result.response.length > 0 && result.response[0].length > 0 && result.response[0][0].UserCount === 0) {

                // UserCount=0  means username or email not exist so we can proceed fo insertion or updation
                if (result.response[0][0].UserCount === 0) {

                    let pData = {
                        User: $("#txtUserName").val().trim(),
                        Pass: randomPasswordGenerator(16),
                        Email: $("#txtUEmail").val().trim(),
                        OrgId: Number($("#ddlProvider").val().trim()),
                        RoleId: Number($("#ddlRole").val().trim()),
                        FName: $("#txtFname").val().trim(),
                        LName: $("#txtLname").val().trim(),
                        OpMode: opMode,
                        Tabs: $("#txtTabs").val().trim(),
                        Gender: $("#ddlGender").val().trim(),
                        SuperUser: $('#chkSuperuser:checked').val() == undefined ? 0 : 1
                    };


                    Meteor.call('AddUser', pData, function(err, res) {
                        console.log("Add user Creation");
                        console.log(res);
                        if (res && res.response.affectedRows) {
                            //opMode ="i" for insertion
                            if (opMode.toLowerCase() === "i") {
                                console.log("User Added successfully..");
                                $('.tb_notification').text("User Added succesfully");
                                $('.tb_notification').slideDown();
                                $('.user-info-container').slideToggle();
                                setTimeout(function() {

                                    $('.tb_notification').slideUp();
                                }, 3000);

                                let mailFields = {
                                    to: pData.Email,
                                    subject: 'AmdApp : User Account',
                                    type: 4, // For New user template
                                    firstname: pData.FName,
                                    lastname: pData.LName,
                                    username: pData.User,
                                    password: pData.Pass
                                };
                                Meteor.call('sendEmail', mailFields, function(err, res) {
                                    console.log("Email send successfully for user creation");
                                });
                            } else {
                                //else update records
                                //opMode ="u" for updation
                                console.log("User updated successfully..");
                                $('.tb_notification').text("User record updated succesfully");
                                $('.tb_notification').slideDown();
                                $('.user-info-container').slideToggle();
                                setTimeout(function() {
                                    $('.tb_notification').slideUp();
                                }, 3000);


                            }
                        }

                    });

                } else {
                    //If username or email already exist then display proper warning message
                    $('.tb_warning_notification').text("Username or email already exist");
                    $('.tb_warning_notification').slideDown();
                    setTimeout(function() {
                        $('.tb_warning_notification').slideUp();
                    }, 3000);
                }

            } else {
                //If username or email already exist then display proper warning message
                $('.tb_warning_notification').text("Username or email already exist");
                $('.tb_warning_notification').slideDown();
                setTimeout(function() {
                    $('.tb_warning_notification').slideUp();
                }, 3000);

            }
        }
    });


}

/**
 * Description : Clear previous value in tag-it control and re initialize with new value
 * params      : Pass userInfor object  to set value in form for add/edit funcionality
 */
function fillUserInfo(pUserInfo) {
    $("#txtFname").val(pUserInfo.first_name);
    $("#txtLname").val(pUserInfo.last_name);
    $("#ddlProvider").val(pUserInfo.org_id);
    $("#ddlRole").val(pUserInfo.role);
    $("#ddlGender").val(pUserInfo.gender);
    $("#txtUEmail").val(pUserInfo.email);
    $("#txtUserName").val(pUserInfo.username);
    $("#hdnId").val(pUserInfo.user_id);
    $("#txtTabs").val(pUserInfo.tabs_name);
    if (pUserInfo.is_super_user) {
        $("#chkSuperuser").prop("checked", true);
    }

    //-------------------------------
    // Tag initialization with auto selected value
    //-------------------------------
    initializeTagControlForTabs();
}

/**
 * RANDOM STRING GENERATOR
 *
 * Info:      http://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
 * Info:      http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
 * Use:       randomPasswordGenerator(length);
 * Default:   return a random alpha-numeric string
 * Arguments: pass length for string

 */
function randomPasswordGenerator(length) {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}


/**
 * Description : Clear previous value in tag-it control and re initialize with new value
 */
function initializeTagControlForTabs() {
    $('#txtTabs').tagit('destroy');
    $('#txtTabs').tagit({
        availableTags: sampleTags,
        removeConfirmation: true,
        beforeTagAdded: function(evt, ui) {
            if (!ui.duringInitialization) {
                console.log(ui.tagLabel);
                if (sampleTags.indexOf(ui.tagLabel) === -1) {
                    return false;
                }
            }
        }
    });
}