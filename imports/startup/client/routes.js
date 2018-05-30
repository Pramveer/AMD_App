import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';


// Import needed templates
import '../../ui/components/header';
import '../../ui/components/footer';

// import '../../ui/pages/dashboard/dashboard.js';
import '../../ui/pages';
// import '../../ui/pages/not-found/not-found.js';


Router.configure({
    layoutTemplate: 'DashboardLayout'
});

Router.route('/#', {
  layoutTemplate: 'dashboardLayout',
  template: 'Dashboard',
  onBeforeAction: function() {
      if (JSON.parse(localStorage.getItem('user'))) {
          // isModelChanged();
      } else {
          this.layout('dashboardLayout');
          this.next();
      }

  },
});


// render dashboard template
Router.route('/', function () {
  localStorage.setItem('currentuser',1)
  this.render('Dashboard');
});

// render login template
Router.route('/login', function () {
  if (JSON.parse(localStorage.getItem('user'))) {
    Router.go('/');
  } else {
    this.render('Login');
  }
});
