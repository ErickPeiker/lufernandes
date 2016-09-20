var modulo = angular.module('app', []);

modulo.controller('index', function($scope, $http) {

	$scope.init = function () {
		$scope.config = {};
		$scope.grupos = [];
		$scope.imagens = [];
		$scope.getSite();
	}

	$scope.getSite = function () {
		$http.get('/get-site')
		.then(
	       function(response){
	       		$scope.config = response.data.config;
	       		$scope.grupos = response.data.grupos;
	       		$scope.imagens = response.data.imagens;
	       		$scope.config.url = 'https://s3-sa-east-1.amazonaws.com/lufernandes/'

	       }, 
	       function(response){
	         	console.log(response);
	       }
	    );
	}

	$scope.getImagemPrincipal = function (idGrupo) {
		for (img in $scope.imagens) {
			if ($scope.imagens[img].id_grupo == idGrupo) {
				console.log(idGrupo);
				return $scope.config.url+$scope.imagens[img].file;
			}
		}
	}

});