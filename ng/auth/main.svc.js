app.service('MainSvc', function($window) {
  var svc = this
  svc.logOut = function() {
    localStorage.clear();
    $window.location.href = '/#/login';
  }
})
