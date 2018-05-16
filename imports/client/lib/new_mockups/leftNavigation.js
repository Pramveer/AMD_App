var Page = (function() {

    var initDropDowns = function() {

    };

    var initAccordion = function() {

        // $('.psAccordion .hasSubMenu').click(function (e) {

        // 	if ($(e.target).parent().hasClass("hasSubMenu")) {
        // 		e.preventDefault();
        // 		var elem = this;
        // 		$(elem).find('.sub-sidemenu').slideToggle("slow");

        // 		if ($(elem).data("rotate") == "close") {
        // 			$(elem).find('.submenu-arrow i').rotate(180);
        // 			$(elem).data("rotate", "open");
        // 		} else if ($(elem).data("rotate") == "open") {
        // 			$(elem).find('.submenu-arrow i').rotate(0);
        // 			$(elem).data("rotate", "close");
        // 		}
        // 		return false;
        // 	} else {
        // 		return false;
        // 	}
        // });
    };

    var showToastMessage = function() {
        $.toast({
            heading: 'Information',
            text: 'Loaders are enabled by default. Use `loader`, `loaderBg` to change the default behavior',
            icon: 'info',
            loader: false,
            position: {
                right: 120,
                top: 120
            },
            loaderBg: '#9EC600'
        });
    };

    function loadIframe(url) {
        var $iframe = $('#forPostyouradd');
        if ($iframe.length) {
            $iframe.attr('src', url);
            return false;
        }
        return true;
    }

    var bindHandlers = function() {



        // show toast message (temporary)
        $('#addNewPatient').click(function() {
            showToastMessage();
        });


        // show modal popup
        $('.tooltip-pin').click(function(e) {

            var modalId = $(this).data('modal-id');

            $('#' + modalId).modal({
                closeClass: 'modal-close',
                escClose: true
            });
        });

        $('#js-open-calculator').click(function(e) {
            showToastMessage();
        });

        $('.calc-link').click(function(e) {
            e.preventDefault();
            var url = $(this).data("calc-url");

            loadIframe(url);

            $('#tooltip-box-clinical-calculator').modal({
                closeClass: 'modal-close',
                escClose: true
            });
        });

    }



    var init = function() {
        bindHandlers();
        initDropDowns();
        initAccordion();
    };

    return { init: init };

})();