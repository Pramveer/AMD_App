import { Template } from 'meteor/templating';
import './topHeader.html'

Template.topHeader.onCreated(function () {
    //console.log("topHeader Created");

});
Template.topHeader.onRendered(function () {
    //console.log("topHeader Rendered");

});

Template.topHeader.onDestroyed(function () {
    //console.log("topHeader Destroyed");
  // deregister from some central store
//  GalleryTemplates = _.without(GalleryTemplates, this);
});


Template.topHeader.events({

});
