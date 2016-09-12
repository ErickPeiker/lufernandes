var modulo = angular.module('app', []);
modulo.filter('to_trusted', ['$sce', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);
modulo.controller('banner', function($scope, $http) {

});