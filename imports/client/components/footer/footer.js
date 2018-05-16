import './footer.html';

Template.MainFooter.helpers({
    getCurrentYear:function(){
        return new Date().getFullYear().toString();
    }

}); 