// set up ======================================================================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var port  	 = process.env.PORT || 8080; 				// set the port
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('underscore');

var Word = require('./app/models/word');

// configuration ===============================================================
mongoose.connect('mongodb://localhost/completeF');

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request


// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

// init stuff
var fs = require('fs');
var dir = './data/';
var data = {};

fs.readdir(dir, function(err,files){
  if (err) throw err;
  var c = 0;
  files.forEach(function(file) {
    c++;
    console.log("f:",file);
    //if(!/^\./.test(file)) {
      fs.readFile(dir+file,'utf-8',function(err,html){
        if (err) throw err;
        data[file] = html;
        if (0===--c) {
          
          //processData(data);

        };
      });
    //}
  });
});

var processData = function(data) {

  var GLOBALSAVED = 0;

  _.each(data, function(v,k) {
    console.log("Processing file:",k);

    var sentences = v.toLowerCase().split(/[\.\n\r\()]+/).filter(Boolean);
    
    _.each(sentences, function(s,sindex) {
      
      var words = s.split(/[^\w'\-àâäéèêëiòôöùû]+/).filter(Boolean);

      for(var windex=0; windex<words.length-1; windex++) {

        var gram = words.slice(windex,windex+2);
        //console.log("gram:",gram);
        var newW = {
          from:   words[windex],
          to:     words[windex+1],
          file:   k,
          s:      sindex, // sentence id 
          w:      windex  // word id
        };
        if(words[windex]=='' || words[windex+1]=='')
          console.log("? ",s);

        GLOBALSAVED += 1;
        Word.findOneAndUpdate( _.omit(newW,"name"), newW, {upsert:true}, function(err,doc) {
          if (err) { console.log("error: "+err); }
          else {
            //console.log("saved: ",newW.file, newW.s, newW.w);
            console.log("saving:",GLOBALSAVED);
            if(0===--GLOBALSAVED)
              console.log("ALL DONE.");
          }
        });
      }

    });
  });
};




