app.controller('StartCtrl', function($scope, $http, $state, MainSvc){
  $scope.user = localStorage.getItem('username');

  var testTheme = function() {
    var theme = localStorage.getItem('theme');
    if(theme=='1') $scope.theme = 1;
    else $scope.theme = 0;
  }
  testTheme();

  $scope.toggleTheme = function() {
    if ($scope.theme) $scope.theme = 0;
    else $scope.theme = 1;
    localStorage.setItem('theme', $scope.theme);
    $scope.$emit('themeEvent');
    $scope.$broadcast('themeEvent');
  }

  $scope.changePasswd = function() {
    $http.post('/changePasswd', {
      password: $scope.passwordOld,
      newPassword: $scope.passwordNew
    }).success(function() {
      Materialize.toast('Hasło zostało zmienione', 4000);
    }).error(function() {
      Materialize.toast('Wystąpił błąd', 4000);
      if(err==="Unauthorized") MainSvc.logOut();
    })
  }

})
