import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';


// Import needed templates
import '../../ui/components/header';
import '../../ui/components/footer';

import '../../ui/pages/dashboard/dashboard.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/not-found/not-found.js';


Router.configure({
    layoutTemplate: 'DashboardLayout'
});


// render dashboard template
Router.route('/', function () {
  this.render('Dashboard');
});