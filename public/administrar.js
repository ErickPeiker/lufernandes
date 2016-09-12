angular.module('app', [])
.controller('controlador', function($scope, $http) {

	$scope.init = function () {
		$scope.valores = [];
		$scope.valores.push({id: false, name : 'Não mostrar'});
		$scope.valores.push({id: true,  name : 'Mostrar'});

		$http.get('/get-config')
		.then(
	       function(response){
	       		$scope.config = response.data;
	       }, 
	       function(response){
	         	console.log(response);
	       }
	    );
	}

	$scope.salvar = function () {
		console.log($scope.config);
		$http.post('/altera-config', $scope.config)
		.then(
	        function(response){
	        	if (response.data.rowCount === 1){
	        		alert('Configurações atualizadas com sucesso!');
	        	}
	        }, 
	        function(response){
	        	console.log(response);
	        }
	    );
	}

});