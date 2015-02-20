// set up ======================================================================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var port  	 = process.env.PORT || 8080; 				// set the port
var database = require('./config/database'); 			// load the database config
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('underscore');

var Word = require('./app/models/word');

// configuration ===============================================================
mongoose.connect('mongodb://localhost/completeB');

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
    fs.readFile(dir+file,'utf-8',function(err,html){
      if (err) throw err;
      data[file] = html;
      if (0===--c) {
        console.log("All files read!");
        //console.log(data);
        //socket.emit('init', {data: data}); }
        processData(data);
      };
    });
  });
});

var processData = function(data) {

  _.each(data, function(v,k) {
    console.log("Processing file:",k);
    var words = v.toLowerCase().split(" ");
    var cc = 0;
    _.each(words, function(w) {
      //console.log("word: ",w);
      var newW = {
        name: w,
        file: k,
        index: cc++
      };
      Word.findOneAndUpdate( _.omit(newW,"name"), newW, {upsert:true}, function(err,doc) {
        if (err) { console.log("error: "+err); }
        else {
          console.log("saved: ",newW.file, newW.index);
        }
      });

    });
  });
};




