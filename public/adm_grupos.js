angular.module('app', [])
.controller('controlador', function($scope, $http) {

	$scope.init = function () {
		initS3FileUpload($('#fileInput'));
		$scope.reset();		
	}

	$scope.getGrupos = function() {
		$http.get('/get-grupos')
		.then(
	       function(response){
	       		$scope.grupos = response.data;
	       }, 
	       function(response){
	         	console.log(response);
	       }
	    );
	}

	$scope.reset = function () {
		$scope.grupos = [];
		$scope.getGrupos();
		$scope.grupo = {
			id: 0,
			nome: ''
		}
	}

	$scope.alterar = function (grupo) {
		$scope.grupo = grupo;
		$scope.grupos = [];
	}

	$scope.excluir = function (idGrupo) {
		$http.post('/exclui-grupo', {id: idGrupo})
		.then(
	        function(response){
	        	if (response.data.rowCount === 1){
	        		$scope.reset();
	        		alert('Grupo excluído com sucesso!');
	        	}
	        }, 
	        function(response){
	        	console.log(response);
	        }
	    );
	}

	$scope.salvar = function () {
		$http.post('/grava-grupo', $scope.grupo)
		.then(
	        function(response){
	        	if (response.data.rowCount === 1){
	        		$scope.reset();
	        		alert('Grupo gravado com sucesso!');
	        	}
	        }, 
	        function(response){
	        	console.log(response);
	        }
	    );
	}

});