import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

//Publish all users
// Meteor.publish('GetAllUsers', function() {
//     if (!this.userId || this.userId && !Roles.userIsInRole(this.userId, 'Admin', 'default-group')) return undefined;
//     return liveDb.select('SELECT lm.user_id,lm.first_name,lm.last_name,lm.username,lm.email,lm.gender,om.name as provider,nm.network,rm.role_name,lm.role,lm.org_id,lm.tabs_name FROM login_master lm  join organization_master om on om.org_id = lm.org_id join Network_master nm on nm.network_id = om.network_id join role_master rm on rm.role_id = lm.role Where lm.status = 1', [{
//         table: 'login_master',
//     }, {
//         table: 'organization_master',
//     }, {
//         table: 'Network_master',
//     }, {
//         table: 'role_master',
//     }]);
// });


Meteor.publish('GetAllUsers', function() {

    let user = null;
    if (this.userId) {
        user = Meteor.users.findOne(this.userId);
    }

    // console.log(Meteor.user());
    if (!this.userId || this.userId && Roles.userIsInRole(this.userId, 'Admin', 'default-group')) {

        // return undefined;
        return liveDb.select('SELECT lm.user_id,lm.first_name,lm.last_name,lm.username,lm.email,lm.gender,om.name as provider,nm.network,rm.role_name,lm.role,lm.org_id,lm.tabs_name, lm.is_super_user FROM login_master lm  join organization_master om on om.org_id = lm.org_id join Network_master nm on nm.network_id = om.network_id join role_master rm on rm.role_id = lm.role Where lm.status = 1', [{
            table: 'login_master',
        }, {
            table: 'organization_master',
        }, {
            table: 'Network_master',
        }, {
            table: 'role_master',
        }]);


    } else if (user && user.profile.userDetail.is_super_user === 1) {
        let userDetails = user.profile.userDetail;
        return liveDb.select(`SELECT lm.user_id,lm.first_name,lm.last_name,lm.username,lm.email,lm.gender,om.name as provider,nm.network,rm.role_name,lm.role,lm.org_id,lm.tabs_name, lm.is_super_user FROM login_master lm  join organization_master om on om.org_id = lm.org_id join Network_master nm on nm.network_id = om.network_id join role_master rm on rm.role_id = lm.role Where lm.status = 1 AND lm.org_id = ${userDetails.org_id} AND lm.role = ${userDetails.role}`, [{
            table: 'login_master',
        }, {
            table: 'organization_master',
        }, {
            table: 'Network_master',
        }, {
            table: 'role_master',
        }]);
    } else {
        return undefined;
    }

});

// publish all Network
Meteor.publish('GetAllNetwork', function() {
    if (!this.userId || this.userId && !Roles.userIsInRole(this.userId, 'Admin', 'default-group')) return undefined;
    return liveDb.select('Select network_id,network from Network_master', [{
        table: 'Network_master',
    }]);

});

//publish All Provider
Meteor.publish('GetAllProvider', function() {
    if (!this.userId || this.userId && !Roles.userIsInRole(this.userId, 'Admin', 'default-group')) return undefined;
    return liveDb.select('Select org_id,name,network_id from organization_master', [{
        table: 'organization_master',
    }]);

});
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 01-Mar-2017
 * @desc: Added new publish method to fetch all created role for our system
 */
//publish all roles
Meteor.publish('GetAllRoles', function() {
    if (!this.userId || this.userId && !Roles.userIsInRole(this.userId, 'Admin', 'default-group')) return undefined;
    return liveDb.select('Select role_id,role_name from role_master', [{
        table: 'role_master',
    }]);
});
