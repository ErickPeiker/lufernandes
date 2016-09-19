angular.module('app', [])
.controller('controlador', function($scope, $http) {

	var acceptFileType = /.*/i;
	var maxFileSize = 1000000;
	var credentialsUrl = '/info-s3';

	$scope.init = function () {
		$scope.config = {
			url : 'https://s3-sa-east-1.amazonaws.com/lufernandes/',
			bucket : 'lufernandes',
			acceptFileType : /.*/i,
			maxFileSize : 1000000,
			credentialsUrl : '/info-s3'
		}

		$scope.initS3FileUpload();
		$scope.getGrupos();
		$scope.reset();
	}

	$scope.reset = function () {
		$scope.imagens = [];
		$scope.getImagens();
		$scope.imagem = {
			id: 0,
			file: '',
			nome: '',
			preco: '',
			grupo: 0,
			principal: false
		}
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

	$scope.getImagens = function() {
		$http.get('/get-imagens')
		.then(
	       function(response){
	       		$scope.imagens = response.data;
	       }, 
	       function(response){
	         	console.log(response);
	       }
	    );
	}

	$scope.nomeGrupo = function (idGrupo) {
		for (grp in $scope.grupos) {
			if (idGrupo == $scope.grupos[grp].id) {
				return $scope.grupos[grp].nome;
			}
		}
	}

	$scope.initS3FileUpload = function () {
		$('#fileInput').fileupload({
		    acceptFileTypes: $scope.config.acceptFileType,
		    maxFileSize: $scope.config.maxFileSize,
		    url: 'https://' + $scope.config.bucket + '.s3.amazonaws.com',
		    paramName: 'file',
		    add: $scope.s3add,
		    dataType: 'xml',
		    done: $scope.onS3Done
		});
	}

	$scope.s3add = function (e, data) {
		var filename = data.files[0].name;
		var params = [];
		$.ajax({
		  url: $scope.config.credentialsUrl,
		  type: 'GET',
		  dataType: 'json',
		  data: {
		    filename: filename
		  },
		  success: function(s3Data) {
		    data.formData = s3Data.params;
		    data.submit();
		  }
		});
		return params;
	}

	$scope.onS3Done = function (e, data) {
		$scope.imagem.file = $(data.jqXHR.responseXML).find('Key').text();
		$http.post('/grava-imagem', $scope.imagem)
		.then(
	        function(response){
	        	if (response.data.rowCount === 1){
	        		$scope.imagem.id = response.data.rows[0].id;
	        		$http.post('/atualiza-imagem', $scope.imagem)
					.then(
				        function(response){
				        	if (response.data.rowCount === 1){
				        		$scope.reset();
	        					alert('Imagem salva com sucesso!');
	        				}
				        }, 
				        function(response){
				        	console.log(response);
				        }
				    );

	        	}
	        }, 
	        function(response){
	        	console.log(response);
	        }
	    );
	}

	$scope.alterar = function (imagem) {
		$scope.imagem = imagem;
		$scope.imagens = [];
	}

	$scope.excluir = function (idImagem) {
		console.log(idImagem);
	}

});