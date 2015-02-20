angular.module('wordsService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Words', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/words');
			},
			next : function(current) {
				return $http.post('/api/next', current);
			},
			create : function(todoData) {
				return $http.post('/api/words', todoData);
			},
			delete : function(id) {
				return $http.delete('/api/words/' + id);
			}
		}
	}]);