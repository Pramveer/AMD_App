$(document).ready(function() {
         $('.subSearchDropdown a').on("click", function(e){
           $('.subSearchDropdown a').next('ul').hide();
            $(this).next('ul').toggle();
            e.stopPropagation();
            e.preventDefault();
          });
          $('.subSearchTab a[data-toggle="tab"]').on("click", function(e){
            $('.subSearchDropdown a').next('ul').hide();
             e.stopPropagation();
             e.preventDefault();
             $(this).tab('show');
           });
           var start = new Date('01/01/2013');
           var end = new Date();
           $('input[name="timeFilterDistSelect"]').daterangepicker({
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
});
