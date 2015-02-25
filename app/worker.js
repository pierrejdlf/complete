var Word = require('app/models').Word;
var _ = require('underscore');
var fs = require('graceful-fs');
var yamlFront = require('yaml-front-matter');
var dir = './data/';

module.exports.start =  function() {

  /////////////// GET PROJECTS
  fs.readdir(dir, function(err,projects){
    if (err) throw err;
    projects.forEach(function(p) {

      var proj = dir+p;
      if(fs.lstatSync(proj).isDirectory()) {
        
        console.log("project:",proj);
        var parseformat = null;
        if(/_/.test(proj)) {
          parseformat = proj.split(/_/).slice(-1)[0];
        }

        /////////////// GET FILES
        fs.readdir(proj, function(err,files){
          if (err) throw err;
          var c = 0;
          var data = {};
          files.forEach(function(f) {

            c++;
            //console.log("- file:",f);
            fs.readFile(proj+"/"+f,'utf-8',function(err,content) {
              if (err) throw err;

              if(parseformat=='yaml') {
                try {
                  var y = yamlFront.loadFront(content);
                  //console.log(y.api_data.post.body);
                  data[f] = y.api_data.post.body;  
                } catch(e) {
                  console.log("Yaml Front Error:",e,f);
                }
                
              } else {
                data[f] = content;
              }

              if (0===--c) {
                
                processProject(p,data);

              };
            });
          });
        });
      }
    });
  });
};

var processProject = function(project,data) {

  var GLOBALSAVED = 0;
  console.log("Processing project:",project);

  _.each(data, function(v,k) {
    //console.log("Processing file:",k);

    var sentences = v.toLowerCase().split(/[\.\n\r\()]+/).filter(Boolean);
    
    _.each(sentences, function(s,sindex) {
      
      var words = s.split(/[^\w'\-àâäéèêëiòôöùû]+/).filter(Boolean);

      for(var windex=0; windex<words.length-1; windex++) {

        var gram = words.slice(windex,windex+2);
        //console.log("gram:",gram);
        var newW = {
          from:   words[windex],
          to:     words[windex+1],
          project: project,
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
            process.stdout.write("Saving ... " + GLOBALSAVED + " \r");
            if(0===--GLOBALSAVED)
              console.log("ALL DONE for:", project);
          }
        });
      }

    });
  });
};




