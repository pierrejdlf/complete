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

			// more about project modal
			$("#modalTrigger").on("click", function(e) {
				console.log("modal trigger");
				$('#projectModal').modal();
			});
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
            if(!lang) lang = $(e.target).parent().data("lang");
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
                        scrollTop: target.offset().top - 50
                    }, 1000);
                    return false;
                }
            }
        });
        setTimeout(function() {
        	$(".intro-message h3").addClass('loaded');
        },1000);
        setTimeout(function() {
        	$(".intro-message h1").addClass('loaded');
        },1500);


        // at the end of everything, load the map
        ////////////////////////////////////////////
        var initMap = function() {
	        var cloudmadeAttribution = 'MD &copy;2011 OSM contribs, Img &copy;2011 CloudMade';
	        var dev = window.location.hostname == "localhost";

	        // init map on div, with all required options
	        var p = Ploufmap({
	          map: "map", // map div id (carefull with css !)
	          useServer: false,
			  locateButton: false,

	          leaflet: {
	            center:  L.latLng(47.975,12.129),
	            zoom: 4,
		        scrollWheelZoom: false,
		      },

	          clusterize: true,

	          baseLayer: L.tileLayer('http://a.tiles.mapbox.com/v3/minut.hflfi81j/{z}/{x}/{y}.jpg70', {styleId: 22677, attribution: cloudmadeAttribution}), // whole europe
	          markers: { 'https://a.tiles.mapbox.com/v3/minut.hflfi81j/markers.geojson':'word' },
	          
	          // handlebar template for a slide showing a plouf
	          templates: {
	            word: Handlebars.compile($("#plouf-template-emi").html()),
	          },

	          // define icons
	          icons: {
	            // icon_example: function(data) {
	            //  return L.icon({
	            //     iconUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon.png',
	            //     shadowUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
	            //     iconSize: [25, 41],
	            //     iconAnchor: [12, 40],
	            //     popupAnchor: [0, -40],
	            //     shadowSize: [41, 41],
	            //     shadowAnchor: [12, 40]
	            // })
	            // },
	            // following could allow you to use font-awesome standard markers
	            // http://fortawesome.github.io/Font-Awesome/icons/
	            // 'red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpuple', 'cadetblue'
	            // icon_awesome: L.AwesomeMarkers.icon({
	            //         prefix:         'fa',
	            //         icon:           value.split("_")[0],
	            //         markerColor:    value.split("_")[1]
	            //         //iconColor:#BBBBBB,
	            //         //spin:true,
	            //     });
	            ///////////////////////////////////////////////////
	            word: function(p,clustCount) {              
	              var cla = 'word';
	              if(clustCount>1) {
	                cla += " cluster";
	              }
	              return L.divIcon({
	                iconSize: [110, 50],
	                html: "<div class='"+cla+"'>"+p.title+"</div>",
	                popupAnchor: [0, 0]
	              });
	            },
	          }
	        });
		};

		//initMap();
    });

}(jQuery));