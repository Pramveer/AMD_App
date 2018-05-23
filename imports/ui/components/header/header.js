import './header.html';



Template.Header.onCreated(function() {

});

Template.Header.rendered = () => {

};

Template.Header.helpers({

});

Template.Header.events({
    'click #sidebarCollapse': () => {
        $('#sidebar, #content').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    }
});