app.controller('RegisterCtrl', function($scope, $http, $state){

  $scope.register = function() {
    if(!$scope.login || $scope.login==='') {
      toast('Brak nazwy użytkownika!')
      return;
    }
    if(!$scope.password || $scope.password==='') {
      toast('Brak hasła!')
      return;
    }
    if(!$scope.password2 || $scope.password2==='') {
      toast('Powtórz hasło')
      return;
    }
    if($scope.password !== $scope.password2) {
      toast('Hasła nie są identyczne!')
      return;
    }
    if(!$scope.name || $scope.name==='') {
      toast('Brak imienia/nazwiska!')
      return;
    }
    if(!$scope.email || $scope.email==='') {
      toast('Brak maila!')
      return;
    }
    $http.post('/register', {
      name:      $scope.name,
      username:  $scope.login,
      password:  $scope.password,
      password2: $scope.password2,
      email:     $scope.email,
      cezar:     $scope.cezar
    }).success(function() {
      toast('Zarejestrowano')
      $state.go('login')
    }).error(function(err) {
      if(err==="I'm a teapot") toast('Login zajęty');
      else toast('Wystąpił błąd, spróbuj ponownie');
    });
  }

  var toast = function(msg) {
    Materialize.toast(msg, 4000);
  }

})
