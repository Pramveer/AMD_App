import {
	Template
} from 'meteor/templating';
import './dashboardNavigation.html'

Template.dashboardNavigation.onCreated(function () {


});
Template.dashboardNavigation.onRendered(function () {

});

Template.dashboardNavigation.onDestroyed(function () {

	// deregister from some central store
	//  GalleryTemplates = _.without(GalleryTemplates, this);
});

Template.dashboardNavigation.events({

	'click .searchPatientMenu': (e) => {
		if ($('#mySidenav').width() == 0)
			openNav();
		else {
			closeNav();
		}
	}
});
/**
 * @author: Arvind
 * @reviewer: 
 * @date: 03-May-2017
 * @desc: Added isAuthorized helper method to show or hide on navigation menu as global helper `isCustomRole` 
 * not working as expected.
 */
Template.dashboardNavigation.helpers({

	'isAuthorized': (tab) => {
		// function path : `../../lib/custom/common`
		return isUserAuthorized(tab);
	}
});


//navigation search and close
let openNav = () => {
	document.getElementById("mySidenav").style.width = "350px";
}

let closeNav = () => {
	document.getElementById("mySidenav").style.width = "0";
}