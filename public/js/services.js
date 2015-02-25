angular.module('wordsService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Words', ['$http',function($http) {

		var host = window.location.host == 'localhost' ? 'http://localhost:8080/' : 'http://d84bd554fa.url-de-test.ws/';

		console.log("Host:",host);
		
		return {
			get : function() {
				return $http.get(host+'api/words');
			},
			next : function(current) {
				return $http.post(host+'api/next', current);
			}
			// create : function(todoData) {
			// 	return $http.post('/api/words', todoData);
			// },
			// delete : function(id) {
			// 	return $http.delete('/api/words/' + id);
			// }
		}
	}]);