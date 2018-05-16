import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';

import './PCPDashboard.html';
//  Nisha 03/07/2017 Developed the PCP Dashboard for viewing 

Template.PCPDashboard.onCreated(function() {

});

Template.PCPDashboard.rendered = function() {

    $('.accordionlistps').on('click', (e) => {

        $('.accordionlistps').each((d, element) => {
            if ($(element).hasClass('active') == true && $(element).text() != $(e.currentTarget).text()) {
                $(element).removeClass('active');
                $(element).next().removeClass('show');
            }
        });

        //current accordion list check
        if ($(e.currentTarget).hasClass('active')) {
            $(e.currentTarget).removeClass('active');
            $(e.currentTarget).next().removeClass('show');
        } else {
            $(e.currentTarget).addClass('active');
            $(e.currentTarget).next().addClass('show');
        }

    });
};

Template.PCPDashboard.helpers({

});

// Added click events by yuvraj 24 feb 2017
Template.PCPDashboard.events({
    'click .rweb-list li': function(e, template) {
        let tabData = $(e.currentTarget).children('a').attr('data');
        $(e.currentTarget).addClass('active').siblings().removeClass('active');
        e.preventDefault();
    }
});