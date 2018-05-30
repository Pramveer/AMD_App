import '../userInfoModal';
import './header.html';

// jQuery.noConflict();


Template.Header.onCreated(function() {

});

Template.Header.rendered = () => {

};

Template.Header.helpers({
    renderDatepicker : () => {
        let start = new Date('01/01/2013');
        let end = new Date();

        $('#timeFilterDistSelect').daterangepicker({
            startDate: start,
            endDate: end,
            parentEl: '#dv-dash-time-filter',
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        });
    },
    username : () => {
      let user = JSON.parse(localStorage.getItem('user'));
      console.log(user)
      return user.username || 'notal';
    }

});

Template.Header.events({
    'click #sidebarCollapse': () => {
        $('#sidebar, #content').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        setTimeout(function(){
		    // renderhepetitiesChart(containerchart,data1);
			Template.Dashboard.ReRenderCharts();
		    },50);
    },

    'click .dropdown-menu': (e) => {
        // console.log(e.target)
        // console.log(e.target.className)
        if (e.target.className === 'search-criteria' || e.target.className === 'caret') {
            $('.subSearchDropdown a').not($(e.target).parent()).next('ul').hide();
            $(e.target).parent().next('ul').toggle();
        } else {
            $('.subSearchDropdown a').not(e.target).next('ul').hide();
            $(e.target).next('ul').toggle();
        }
        e.stopPropagation();
        e.preventDefault();
    },
    'click .subSearchTab a[data-toggle="tab"]': (e) => {
        $('.subSearchDropdown a').next('ul').hide();
        console.log(e.target)
        console.log(this)
        e.stopPropagation();
        e.preventDefault();
        $(e.target).tab('show');
    },

    'click .js-dashboard-applyDateFilters': (event, template) => {

        let start = new Date('01/01/2013');
        let end = new Date();
        $('#timeFilterDistSelect').daterangepicker({
            startDate: start,
            endDate: end,
            parentEl: '#dv-dash-time-filter',
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
        });
        event.stopPropagation();
        // event.preventDefault();
    },

    'click .logout-btn': (e) => {
      alert('log out')
      localStorage.removeItem('user');
      let user = JSON.parse(localStorage.getItem('user'));
      console.log(user)
      Router.go('/login')
    }
});
