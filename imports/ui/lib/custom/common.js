jQuery(function($){
  $('.navbar-toggle').click(function(){
    $('.navbar-collapse').toggleClass('right');
    $('.navbar-toggle').toggleClass('indexcity');
  });
});

$('li.search-dropdown > a').on('click', function (event) {
    $(this).parent().addClass('open');
});

/*
$('body').on('click', function (e) {
    if (e.target.id == "search-dropdow" || $(e.target).parents("#search-dropdow").length) {
        alert('inside')
        $(".search-dropdow").addClass('open');

      } else {
          alert('outside');
          $('li.search-dropdown').removeClass('open');
      }
}); */
