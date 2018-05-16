import './hp.html';
Template.HP.rendered=function(){

      $('.psAccordion .hasSubMenu').click(function (e) {

          if ($(e.target).parent().hasClass("hasSubMenu")) {
              e.preventDefault();
              var elem = this;
              $(elem).find('.sub-sidemenu').slideToggle("slow");

              if ($(elem).data("rotate") == "close") {
                  $(elem).find('.submenu-arrow i').rotate(180);
                  $(elem).data("rotate", "open");
              } else if ($(elem).data("rotate") == "open") {
                  $(elem).find('.submenu-arrow i').rotate(0);
                  $(elem).data("rotate", "close");
              }
              //return false;
          } else {
          //    return false;
          }
      });
};
