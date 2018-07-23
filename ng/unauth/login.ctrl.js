app.controller('LoginCtrl', function($scope, $http, $state, $window){
  $scope.$emit('gotLoginEvent');

  $scope.signIn = function() {
    if(!$scope.login || $scope.login==='') {
      toast('Brak loginu')
      return;
    }
    if(!$scope.password || $scope.password==='') {
      toast('Brak hasła')
      return;
    }
    $http.post('/login', {
      username: $scope.login,
      password: $scope.password,
    }).success(function(obj) {
      localStorage.setItem('token', obj.token);
      localStorage.setItem('username', obj.user.username);
      localStorage.setItem('id', obj.user._id);
      localStorage.setItem('cezar', obj.user.cezar);
      toast("Pomyślnie zalogowano. Przekierowywanie...");
      $window.location.href = '/a';
    }).error(function(err) {
      toast(err)
    });
  }

  var toast = function(msg) {
    Materialize.toast(msg, 4000);
  }
})
