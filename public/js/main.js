angular.module('underscore', [])

  .factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
  });
  

angular.module('wordComplete', ['wordsController', 'wordsService', 'wordsFilters', 'wordsDirectives']);

angular.module('wordsController', ['underscore'])

	// inject the Todo service factory into our controller
	.controller('mainController',[
		'$scope','$http','Words','$document','_',
		function($scope, $http, Words, $document, _) {

		$scope.loading = true;
		$scope.paragraphs = [{
			words: [{content:""}]
		}];
		$scope.kp = 0;
		$scope.kw = 0;

		$scope.terms = [];
		$scope.current = 0;

		console.log("Hello space.");

		// every click focus invisible input
		$document.on("click", function(event){
			$scope.$broadcast('focusInput');
		});

		// keyboard events
		$document.bind("keydown", function(event) {
			// console.log("ev: ",event);
			var c = String.fromCharCode(event.keyCode);
			//console.log("key: ",c); 
			var kc = event.keyCode;

			////////////////////////////// MANAGE EVENTS
			if(kc==8) { // DEL
				var w = $scope.paragraphs[$scope.kp].words[$scope.kw].content;
				if(w) {
					$scope.paragraphs[$scope.kp].words[$scope.kw].content = w.slice(0,-1);
				}
				else {
					var a = $scope.paragraphs[$scope.kp].words;
					if(a.length>1) {
						$scope.paragraphs[$scope.kp].words.pop();
						$scope.kw--;
					}
				}
			}
			if(event.keyIdentifier=="Down") {
				$scope.current++;
				if($scope.current>$scope.terms.length-1)
					$scope.current = 0;
			}
			if(event.keyIdentifier=="Up") {
				$scope.current--;
				if($scope.current<0)
					$scope.current = $scope.terms.length-1;
			}
			if(event.keyIdentifier=="Enter") {
				$scope.paragraphs.push({ words:[{content:""}] });
				$scope.kp ++;
				$scope.kw = 0;
				$scope.current = 0;
				$scope.terms = []; // to avoid flickering
			}
			if(kc==32) { // SPACE
				var cw = $scope.terms[$scope.current];
				if(cw) {
					$scope.paragraphs[$scope.kp].words.pop();
					$scope.paragraphs[$scope.kp].words.push(cw);
					$scope.current = 0;
				} else {
					$scope.current = 0;
					// do nothing, space char will go to next word !
				}
			}

			////////// a-z | 0-9 | space
			if((kc>=65 && kc<=90) || (kc>=48 && kc<=57)) { // NORMAL CHAR
				$scope.paragraphs[$scope.kp].words[$scope.kw].content += c.toLowerCase();
			}
			if(kc==32) { // SPACE
				if($scope.paragraphs[$scope.kp].words.slice(-1)[0].content.length) { // non empty last word
					$scope.paragraphs[$scope.kp].words.push({content:""});
					$scope.kw ++;
					$scope.terms = []; // to avoid flickering
				} else {
					// do nothing
				}
			}
			
			//var last = _.last($scope.words);
			console.log("ON:", $scope.words);
			Words.next( {
					list: _.map($scope.paragraphs[$scope.kp].words.slice(-4), function(w) {
						return w.content;
					})
				})
				.success(function(data) {
					$scope.terms = data;
					console.log(data);
				});
		});

		// GET
		// Words.get()
		// 	.success(function(data) {
		// 		$scope.allwords = data;
		// 		$scope.loading = false;
		// 	});

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createTodo = function() {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.text != undefined) {
				$scope.loading = true;

				// call the create function from our service (returns a promise object)
				Todos.create($scope.formData)

					// if successful creation, call our get function to get all the new todos
					.success(function(data) {
						$scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						$scope.todos = data; // assign our new list of todos
					});
			}
		};

		// DELETE ==================================================================
		// delete a todo after checking it
		$scope.deleteTodo = function(id) {
			$scope.loading = true;

			Todos.delete(id)
				// if successful creation, call our get function to get all the new todos
				.success(function(data) {
					$scope.loading = false;
					$scope.todos = data; // assign our new list of todos
				});
		};

	}]);
