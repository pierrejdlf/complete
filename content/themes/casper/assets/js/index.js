/**
 * Main JS file for Casper behaviours
 */

/*globals jQuery, document */

(function ($) {
    "use strict";

    $(document).ready(function(){
        
        //console.log(langs);

		// parallax ?
		//see http://winwardo.co.uk/parallax/ 

		var switchToLang = function(lang) {
			$("[data-lang]").removeClass("active");
			$("[data-lang="+lang+"]").addClass("active");
			if(langs.hasOwnProperty(lang))
	            $("[data-localize]").each(function(e,v) {
	            	var key = $(v).data('localize');
	            	var ks = key.split(".");
	            	try {
		            	if(key.indexOf(".")==-1)
		            		var content = langs[lang][ks[0]];
		            	else 
		            		var content = langs[lang][ks[0]][ks[1]];	
		            } catch(er) {
		            	console.log("no ("+lang+") for key: "+key);
		            }
	            	$(v).html( content );
	            });
	       	else
	       		console.log("lang not found");

	       	// update link to reglement
	       	$(".regl").attr('target',"_new");
			$(".regl").attr('href',"/assets/data/europe_moving_image_"+lang+".pdf");
		};

		var avLangs = ['en','fr','es'];
		var blang = window.navigator.userLanguage || window.navigator.language;
		console.log("browser lang: "+blang);
		blang = blang.split('-')[0];
		if(avLangs.indexOf(blang)!=-1) {
			switchToLang(blang);
		} else {
			switchToLang('en');
		}
		

        // i18n
        $(".langselect button").on("click", function(e) {
            var lang = $(e.target).data("lang");
            console.log("switching to: "+lang);

            //$("[data-localize]").localize("emi", { language:lang });

            switchToLang(lang);

		    // $("[lang]").each(function () {
		    //     if ($(this).attr("lang") == lang)
		    //         $(this).show();
		    //     else
		    //         $(this).hide();
		    // });
			
        });

        // form
        $("#form").submit(function() {
        	console.log("submitting form");
			$.ajax({
				type: "GET",
				url: "http://localhost:2368/form/submit/",
				data: $("#form").serialize(),
				success: function(data) {
					console.log(data);
				},
			});
			return false; 
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