app.config(function($stateProvider) {
  var homeState = {
    name: 'home',
    url: '/',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  }
  var loginState = {
    name: 'login',
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  }
  var registerState = {
    name: 'register',
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  }
  $stateProvider.state(homeState);
  $stateProvider.state(loginState);
  $stateProvider.state(registerState);
});
