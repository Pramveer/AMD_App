import { Template } from 'meteor/templating';

import './loggedInUser.html';

Template.LoggedInUser.rendered = function() {
        $('#js-show-myaccount,.hed-user-icon,.hed-user-name').click(function() {
            $('.user-control-div').show();
        });

        // hide MyAccount popup
        $('#js-close-myaccount').click(function() {
            $("#txtOldPass").val('');
            $("#txtNewPass").val('');
            $('.user-control-div').hide();
        });

        // close "MyAccount" popup when clicked outside it
        $(document).on('mouseup', function(e) {
            var container = $('.user-control-div');
            if (!container.is(e.target) // if the target of the click isn't the container...
                &&
                container.has(e.target).length === 0) // ... nor a descendant of the container
            {
                container.hide();
            }
        });
    }
    //Events for Logged In User template
Template.LoggedInUser.events({
    'click .needhelp': function(e) {
        $("#txtproblem").val('');
        $(".emailmessage").html("");
        $("#divScreenHelp").dialog({
            dialogClass: 'containerDialog',
            minHeight: '100px',
            width: 'auto',
            close: function(event, ui) {
                $(this).dialog('close');
            },
            create: function(event, ui) {
                // Set maxWidth
                $(this).css("maxWidth", "660px");
            }
        });

        $('.submitproblem').on('click', function(e) {
            setTimeout(function() {
                $(".emailmessage").html("<div style='text-align:left;'><span style='color:Red'>Email sent successfully!</span></div>");
            }, 500);
            var email = ['nisha@binaryrepublik.com', 'arvind.mepani@binaryrepublik.com'];
            var mailFields = {
                to: email,
                subject: 'AmdApp : PCP Model',
                type: 5, // For  sending out PCP problems
                problem: $("#txtproblem").val()
            };

            Meteor.call('sendEmail', mailFields, function(err, res) {
                // console.log("Email send successfully");
                setTimeout(function() {
                    $("#divScreenHelp").dialog('close');
                }, 500);
            });
        })
    },
    'click .usermanual': function(e) {
        //     $("#divUserManual").load("/UserManual/pcpmodel/pcpusermanual.html");
        //     $("#divUserManual").dialog({
        //         dialogClass: 'containerDialog', 
        //         width:'1000px',
        //         close: function(event, ui) {
        //             $(this).dialog('close');
        //         },
        //         create: function(event, ui) { 
        //             $(this).css("minHeight", "1000px");
        //         }
        //  });

        var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
        $("body").append(appendthis);
        $(".modal-overlay").fadeTo(500);
        var modalBox = $(this).attr('data-modal-id');
        $('#' + modalBox).fadeIn($(this).data());
        $('#usermanualframe').css('height', '570px');
        $('#usermanualframe').css('width', '100%');
        $('#usermanualframe').attr('src', '/UserManual/pcpmodel/pcpusermanual.html');
        var modalBox = $('#popupForUserManual');
        modalBox.show();
    }

});


// Helper methods for  Logged In User template
Template.LoggedInUser.helpers({
    'username': function() {
        // var email = localStorage.getItem('user') ? localStorage.getItem('user') : '';
        var email = Meteor.user().profile.userDetail.email ? Meteor.user().profile.userDetail.email : '';
        //return email.indexOf('@') > -1 ? email.substring(0, email.indexOf('@')) : email;
        return Meteor.user().profile.userDetail.username;
    },
    // 'IsAdmin': function() {
    //     var user = Meteor.user().profile.userDetail && Meteor.user().profile.userDetail ? Meteor.user().profile.userDetail : {
    //         "UserCount": 1,
    //         "username": "",
    //         "email": "",
    //         "organization": "",
    //         "org_id": 1,
    //         "role": 0
    //     };
    //     return user.role === 1 ? true : false;
    // },

    'IsAdminOrSuperuser': function() {
        var user = Meteor.user().profile.userDetail && Meteor.user().profile.userDetail ? Meteor.user().profile.userDetail : {
            "UserCount": 1,
            "username": "",
            "email": "",
            "organization": "",
            "org_id": 1,
            "role": 0
        };
        return user.role === 1 || user.is_super_user === 1 ? true : false;
    },

    'AccountInfo': function() {
        return Meteor.user().profile.userDetail && Meteor.user().profile.userDetail ? Meteor.user().profile.userDetail : {
            "UserCount": 1,
            "username": "",
            "email": "",
            "organization": "",
            "org_id": 1,
            "role": 0
        };
    },
    userIcon: function() {
        //       var email = Meteor.user().profile.userDetail.email ? Meteor.user().profile.userDetail.email : '';
        //return email.indexOf('@') > -1 ? email.substring(0, email.indexOf('@')) : email;
        //console.log(Meteor.user().profile.userDetail);
        let gender = Meteor.user().profile.userDetail && Meteor.user().profile.userDetail.gender ? Meteor.user().profile.userDetail.gender : "male";
        return gender && gender.toLowerCase() === "male" ? "/male-icon.png" : "/female-icon.png";
    },
    /**
 * @author: Arvind
 * @reviewer: 
 * @date: 03-May-2017
 * @desc: Added isAuthorized helper method to show or hide on navigation menu as global helper `isCustomRole` 
 * not working as expected.
*/

	'isAuthorized': (tab) => {
		//console.log(tab);
        // function path : `../../lib/custom/common`
		return isUserAuthorized(tab);
	}
});