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


    // load the films based on mapbox geojson
    ////////////////////////////////////////////
    var loadFilms = function() {
      $.ajax({
  			url: "https://a.tiles.mapbox.com/v3/minut.hflfi81j/markers.geojson",
  			dataType: 'jsonp',
  			success: function(data) {
  				console.log("Geojson list received.",data);
  				var count = 0;
  				_.each(data.features, function(f) {
  					var p = f.properties;
  					var mtitle = p.title.replace(/\d\./,"");
  					var isMovie = p["marker-symbol"] == "cinema";

  					if(isMovie) {
  						var e = $("<div>").addClass("film");
  						var u = p.description;
  						var ytb = /youtu/.test(u); // else assumed: vimeo
  						var url = ytb ? 
  							u.replace(/^.*[\/=]([^\/^=]*)].*/,"//www.youtube.com/embed/\$1") :
  							u.replace(/^.*\/(\d*)].*/,"//player.vimeo.com/video/\$1?badge=0&amp;color=ffffff");
  						
  						console.log("Got video: ",count++,url);

  						var iframe = $("<iframe>").attr({
  							width: "100%",
  							height: "100%",
  							src: url,
  							frameborder: "0",
  							allowfullscreen: "allowfullscreen",
  							mozallowfullscreen: "mozallowfullscreen",
  							webkitallowfullscreen: "webkitallowfullscreen",
  						});
  						var meta = $("<div class='meta'>")
  							.append("<div class='word'>"+mtitle+"</div>");
  						
  						e.append(iframe);
  						e.append(meta);
  						$(".films").append(e);
  					}
  				});
  			}
  		});
    };
    loadFilms();


    // at the end of everything, load the map
    ////////////////////////////////////////////
    var cloudmadeAttribution = 'MD &copy;2011 OSM contribs, Img &copy;2011 CloudMade';
    var pmapconfig = {
      clusterize: false,
      useServer: false,
      leaflet: {
        zoom: 5,
        minZoom: 4,
        maxZoom: 9,
        locateButton: false,
        scrollWheelZoom: false,
        fullscreenControl: false,
      },
      baseLayer: L.tileLayer('http://a.tiles.mapbox.com/v3/minut.hflfi81j/{z}/{x}/{y}.jpg70', {styleId: 22677, attribution: cloudmadeAttribution}), // whole europe
      markers: {
        'https://a.tiles.mapbox.com/v3/minut.hflfi81j/markers.geojson':'emi'
      },
      icons: {
        emi: function(p,clustCount) {
          var video = /:\/\//.test(p.description);
          var vimeo = /vimeo/.test(p.description);
          p.movie = video;
          p.icon = video ? "film" : "asterisk";
          p.jumpto = p.title.split(".")[0];
          p.title = p.title.replace(/\d*\./,"");
          var d = p.description ;

          if(!video) {      // un mot un jour
            var img = d.match(/\[\[(.*)\]\]/)[1];
            p.imgurl = "https://googledrive.com/host/0B2b_ECAYHVctWGJkUkdWTXFrdDA/"+img;
          } else if(vimeo)  // vimeo
            p.imgurl = d.match(/\((.*)\)/) ? d.match(/\((.*)\)/)[1] : "no";
          else            // youtube
            p.imgurl = d.replace(/^.*[\/=]([^\/^=]*)].*/,"http://i2.ytimg.com/vi/\$1/hqdefault.jpg");

          p.imgurl = p.imgurl.replace(/ /g,"%20");

          console.log("Got: ",p);

          return L.divIcon({
            iconSize:     [0, 0],
            html: Handlebars.compile(
              '<div class="skull hint--bottom" data-hint="click to watch the film !">'+
                  '<i class="mark fa fa-{{icon}}"></i>'+
                  '<div class="arrow"></div>'+
                  '<div class="popup">'+
                      '<a href="#jumpto_{{jumpto}}">'+
                      '<div class="content" style="background-image: url({{imgurl}});">'+
                          '<div class="word">{{title}}</div>'+
                          '{{#if movie}}'+
                          '<div class="click">click to watch the film</div>'+
                          '{{/if}}'+
                      '</div>'+
                      '</a>'+
                  '</div>'+
              '</div>'
            )(p),
            className: video ? "parismap-icon emi video" : "parismap-icon emi image",
          });
        },
      }
    };

	  var p = Ploufmap(pmapconfig);

    // init links from markers (#jumpto_12) to video block id #(12)

  });

}(jQuery));
