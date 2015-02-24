var Word = require('./models/word');
var _ = require('underscore');



var searchPast = function(terms, ends) {
	
	var NEXT = {};

	if(terms.length==1 && terms[0].length>0) {

		Word.find({
			from: new RegExp('^'+terms[0],'i'),
		}).exec(function(err, cs) {
			if (err) console.log("err",err);

			var COUNT = cs.length;
			if(COUNT) {
				_.each(cs, function(c) {
					if(!NEXT.hasOwnProperty(c.from)) {
						NEXT[c.from] = {
							content: c.from,
							score: 1
						};
					} else {
						NEXT[c.from].score += 1 ;
					}

					if(0===--COUNT)
						ends(NEXT);
				});
			} else {
				ends(NEXT);
			}

		});


	} else {
		Word.find({
			from: terms.slice(-2)[0],
			to: 	new RegExp('^'+terms.slice(-1)[0],'i')
		}).limit(50).exec(function(err, cs) {
			if (err) res.send(err);
			else {

				//console.log("found link:",cs.length);
				
				var scc = cs.length;
				var GLOBALDEC = scc;

				if(scc) {

					//////////////////////////////// LOOP POSSIBLE LINKS A B C-d
					_.each(cs, function(c) {
						//console.log("found link:",c);

						if(!NEXT.hasOwnProperty(c.to)) {
							NEXT[c.to] = {
								content: c.to,
								score: 1
							};
						} else {
							NEXT[c.to].score += 1 ;
						}

						Word.find({
							to: c.from
						}).limit(40).exec(function(err, ps) {
							if (err) res.send(err);
							else {
								//console.log("- found past:",ps.length);	

								var psc = ps.length;
								GLOBALDEC -= 1;
								GLOBALDEC += psc;
								
								if(psc) {
									//////////////////////////////// LOOP ALL PAST A B-C d
									_.each(ps, function(p) {
										//console.log("- found past:",p);

										var chained = p.file==c.file && p.s==c.s && p.w==c.w-1;
										NEXT[c.to].score += chained ? 10 : 0;
										
										if(chained) {

											console.log("CHAIN =",p.from,c.from,c.to);

											Word.find({
												to: p.from
											}).limit(30).exec(function(err, pps) {
												//console.log("-- found re past:",pps.length);
												//console.log("COUNT:",GLOBALDEC);

												var ppsc = pps.length;
												GLOBALDEC -= 1;
												GLOBALDEC += ppsc;

												if(ppsc) {
													_.each(pps, function(pp) {

														var pchained = pp.file==p.file && pp.s==p.s && pp.w==p.w-1 && pp.from==terms.slice(-4)[0];
														NEXT[c.to].score += pchained ? 30 : 0;
														if(pchained) console.log("SUPERCHAIN =",pp.from,p.from,c.from,c.to);

														if(0===--GLOBALDEC)
															ends(NEXT);

													});
												} else {
													if(GLOBALDEC==0)
														ends(NEXT);
												}

											});
										} else {
											GLOBALDEC -= 1;
											if(GLOBALDEC==0)
												ends(NEXT);
										}
									});
								} else {
									//console.log("no past");
									if(GLOBALDEC==0)
										ends(NEXT);
								}
							}
						});
					});
				} else {
					//console.log("no link");
					ends(NEXT);
				}
			}
		});
	}
}



module.exports = function(app) {

	// GET
	app.get('/api/words', function(req, res) {
		Word.find(function(err, docs) {
			if (err) res.send(err)
				console.log("Got all: ",docs.length);
			res.json(docs);
		});
	});

	// NEXT
	app.post('/api/next', function(req, res) {
		
		var terms = req.body.list; // A B C d ... NEXT
		console.log("Getting nexts of:",terms);

		searchPast(terms, function(list) {
			var out = _.sortBy(list, function(d) {
				return -d.score;
			});
			var max = out.length ? parseFloat(out[0].score) : 0;
			var out = _.map(out.slice(0,30), function(d) {
				d.score = parseFloat(d.score) / max;
				return d;
			})
			console.log("result:",out);
			res.json(out);
		})

	});


	// create todo and send back all todos after creation
	app.post('/api/words', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		Word.create({
			text : req.body.text,
			done : false
		}, function(err, Word) {
			if (err)
				res.send(err);

			// get and return all the Words after you create another
			getWords(res);
		});

	});

	// delete a Word
	app.delete('/api/words/:word_id', function(req, res) {
		Word.remove({
			_id : req.params.Word_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			getTodos(res);
		});
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};