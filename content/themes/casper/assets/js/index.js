/**
 * Main JS file for Casper behaviours
 */

/*globals jQuery, document */
(function ($) {
    "use strict";

    $(document).ready(function(){

        // On the home page, move the blog icon inside the header 
        // for better relative/absolute positioning.

        //$("#blog-logo").prependTo("#site-head-content");

        console.log("loaded.");
        
        // i18n
        $(".langselect button").on("click", function(e) {
            var lang = $(e.target).data("lang");
            console.log("switching to: "+lang);
            $("[data-localize]").localize("emi", { language:lang });
        });

        // smooth links to sections
        $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                    return false;
                }
            }
        });

    });

}(jQuery));