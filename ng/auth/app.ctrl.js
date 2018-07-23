app.controller('AppCtrl', function($scope, $http, $state, $window, MainSvc) {
  var token = localStorage.getItem('token');
  if(!token) $window.location.href = '/#/login';
  $http.defaults.headers.common['x-auth'] = token;
  $scope.user = {
    username: localStorage.getItem('username'),
    cezar: localStorage.getItem('cezar')
  }
  $scope.$on('newGroupEvent', function(event, item) {
    $scope.groups.push(item);
  })
  var testTheme = function() {
    var theme = localStorage.getItem('theme');
    if(theme=='1') $scope.theme = true;
    else $scope.theme = false;
  }
  testTheme();
  $scope.$on('themeEvent', function() {
    testTheme();
  })
  $scope.chooseGroup = function(group) {
    $scope.chosenGroup = group._id;
    $scope.chosenGroupName = group.name;
    $scope.$broadcast('chooseGroupEvent', group);
  }
  $scope.logOut = function() {
    MainSvc.logOut();
  }
  var getGroups = function() {
    $http.get('/api/groups').success(function(groups) {
      $scope.groups = groups;
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut();
      $scope.groups = {};
    })
  }
  getGroups();
  $state.go('start');
  $( document ).ready(function() {
    $(".button-collapse").sideNav();
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrainWidth: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'left', // Displays dropdown with edge aligned to the left of button
        stopPropagation: true // Stops event propagation
      }
    );})



})
