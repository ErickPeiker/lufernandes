var modulo = angular.module('app', []);

modulo.controller('index', function($scope, $http) {

	$scope.init = function () {
		$scope.config = {};
		$scope.grupos = [];
		$scope.imagens = [];
		$scope.email = {};
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
				if ($scope.imagens[img].principal) {
					return $scope.config.url+$scope.imagens[img].file;
				}
			}
		}
	}

	$scope.enviaEmail = function () {
		if (!$scope.email.nome) {
			alert('Favor informar seu nome para enviar o contato');
			return;
		} else if (! $scope.email.phone && ! $scope.email.email) {
			alert('Favor informar seu telefone ou seu e-mail para entrarmos em contato');
			return;
		} else if (! $scope.email.message) {
			alert('Favor digite algo sobre o assunto que deseja o contato');
			return;
		} else {
			$('#enviaContato').val('Aguarde o envio...');
			if (! $scope.email.phone) {
				$scope.email.phone = '';
			}
			if (! $scope.email.email) {
				$scope.email.email = '';
			}
			$http.post('/envia-contato', $scope.email)
			.then(
		       function(response){
		       		alert(response.data.message);
		       		$('#enviaContato').val('Enviar');
		       		$scope.email = {};
		       }, 
		       function(response){
		         	alert(response.data.error);
		         	$('#enviaContato').val('Enviar');
		         	$scope.email = {};
		       }
		    );
		}		
	}

});