app.controller('GroupCtrl', function($http, $scope, $state, $window, MainSvc) {

  var testTheme = function() {
    var theme = localStorage.getItem('theme');
    if(theme=='1') $scope.theme = true;
    else $scope.theme = false;
  }
  testTheme();
  $scope.$on('themeEvent', function() {
    testTheme();
  })
  $scope.user = localStorage.getItem('username');
  $scope.id = localStorage.getItem('id');

  $scope.addGroup = function() {
    if(!$scope.newTeamName || $scope.newTeamName === '') return Materialize.toast('Brak nazwy!', 4000);
    $http.post('/api/group', {
      name: $scope.newTeamName,
      description: $scope.newTeamDescription
    }).success(function(group) {
      Materialize.toast('Dodano grupę', 4000);
      group.users[0] = {_id: group.users[0]}
      group.admins[0] = {_id: group.admins[0]}
      $scope.groups.push(group);
      $scope.newTeamName = '';
      $scope.newTeamDescription = '';
      $scope.$emit('newGroupEvent', group);
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut();
      Materialize.toast('Błąd w dodawaniu grupy', 4000)
    })
  }

  $scope.addUserToGroup = function(user) {
    var url = '/user/' + user;
    $http.get(url).success(function(obj) {
      for (var i = 0; i < $scope.openedGroup.users.length; i++) {
        if($scope.openedGroup.users[i].username===obj.username) return Materialize.toast('Użytkownik jest już członkiem grupy', 4000);
      }
      $http.post('/api/addUserToGroup', {
        group: $scope.openedGroup._id,
        user: obj._id
      }).success(function() {
        Materialize.toast("Dodano użytkownika", 4000)
        $scope.openedGroup.users.push(obj)
      }).error(function(err) {
        if(err==="Unauthorized") MainSvc.logOut();
        Materialize.toast('Problem w dodaniu użytkownika', 4000)
      })
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut();
      Materialize.toast('Nie odnaleziono użytkownika', 4000)
    })
  }

  $scope.removeUserFromGroup = function(user) {
    $http.post('/api/removeUserFromGroup', {
      group: $scope.openedGroup._id,
      user: user._id
    }).success(function() {
      Materialize.toast("Usunięto użytkownika", 4000);
      getGroups();
      $scope.openGroup($scope.openedGroup);
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut();
      Materialize.toast('Problem w usunięciu użytkownika', 4000);
    })
  }

  $scope.addUserToAdmins = function(user) {
    $http.post('/api/addUserToAdmins', {
      group: $scope.openedGroup._id,
      user: user._id
    }).success(function() {
      Materialize.toast("Dodano użytkownika do administratorów", 4000)
      $scope.openedGroup.admins.push(user)
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut();
      Materialize.toast('Problem w dodaniu użytkownika do administratorów', 4000)
    })
  }
  $scope.checkIfAdmin = function(id) {
    for (var i = 0, len = $scope.openedGroup.admins.length; i < len; i++) {
      if($scope.openedGroup.admins[i]._id==id) return true;
    }
    return false;
  }

  $scope.removeUserFromAdmins = function(user) {
    $http.post('/api/removeUserFromAdmins', {
      group: $scope.openedGroup._id,
      user: user._id
    }).success(function() {
      Materialize.toast("Usunięto administratora", 4000);
      getGroups();
      $scope.openGroup($scope.openedGroup);
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut();
      Materialize.toast('Problem w usunięciu administratora', 4000);
    })
  }

  $scope.checkIfAdmin = function(id) {
    for (var i = 0, len = $scope.openedGroup.admins.length; i < len; i++) {
      if($scope.openedGroup.admins[i]._id==id) return true;
    }
    return false;
  }

  $scope.openCezar = function (link) {
    if(link) $window.open(link)
  }

  $scope.openGroup = function(group) {
    if(!$scope.openedGroup) {
      var tmp = {};
      tmp.users = group.users;
      tmp.admins = group.admins;
      group.users = [];
      group.admins = [];
      $scope.openedGroup = group;
      resolveUsers(tmp);
    }else if($scope.openedGroup._id===group._id) {
      $scope.openedGroup = null;
    }else {
      var tmp = {};
      tmp.users = group.users;
      tmp.admins = group.admins;
      group.users = [];
      group.admins = [];
      $scope.openedGroup = group;
      resolveUsers(tmp);
    }
  }
  var getGroups = function() {                                    // It's a crazy function because every
    $http.get('/api/groups').success(function(groups) {           // user and admin has to be converted
      $scope.groups = groups;                                     // from just an id in an array to
      for (var i = 0; i < $scope.groups.length; i++) {            // an object in form of: {_id: "someID"}
        var tmp = [];                                             // exactly here, before any operations
        for (var j = 0; j < $scope.groups[i].users.length; j++) { // on users and admins occure
          tmp.push({_id: $scope.groups[i].users[j]});
        }
        $scope.groups[i].users = tmp;
        tmp = [];
        for (var j = 0; j < $scope.groups[i].admins.length; j++) {
          tmp.push({_id: $scope.groups[i].admins[j]});
        }
        $scope.groups[i].admins = tmp;
      }
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut();
      $scope.groups = {};
    })
  }

  var resolveUsers = function(group) {
    for (var i = 0; i < group.users.length; i++) {
      var url = '/users/' + group.users[i]._id;
      $http.get(url).success(function(obj) {
        $scope.openedGroup.users.push(obj);
      }).error(function() {
        $scope.openedGroup.users.push(group.users[i] = {username: 'unknown', _id: group.users[i]._id});
      })
    }
    for (var i = 0; i < group.admins.length; i++) {
      var url = '/users/' + group.admins[i]._id;
      $http.get(url).success(function(obj) {
        $scope.openedGroup.admins.push(obj);
      }).error(function() {
        $scope.openedGroup.admins.push(group.users[i] = {username: 'unknown', _id: group.users[i]._id});
      })
    }
  }
  getGroups();
  $(document).ready(function(){
    $('.tooltipped').tooltip();
    $('.modal').modal();
  });
})
