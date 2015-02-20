var Word = require('./models/word');


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
		
		var term = req.body.name;
		console.log("Getting nexts of:",term);
		var searchR = new RegExp('^'+term,'i');

		Word.find({name:searchR}).limit(15).exec(function(err, docs) {
			if (err) res.send(err)
				console.log("next found:",docs.length);
			res.json(docs);
		});
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