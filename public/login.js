angular.module('app', [])
.controller('controlador', function($scope, $http) {

	$scope.logar = function () {
		$http.post('/login', $scope.usuario)
		.success(function (resultado){
			console.log(resultado.data);
		})
		.error(function(data, status, headers, config){
			console.log(data.error);
		});
	}	
});