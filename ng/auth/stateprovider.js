app.config(function($stateProvider) {
  var homeState = {
    name: 'start',
    url: '/start',
    templateUrl: '../templates/start.html',
    controller: 'StartCtrl'
  }
  var systemState = {
    name: 'system',
    url: '/system',
    templateUrl: '../templates/system.html',
    controller: 'SystemCtrl'
  }
  var biddingState = {
    name: 'bidding',
    url: '/bidding',
    templateUrl: '../templates/bidding.html',
    controller: 'BidCtrl'
  }
  var groupsState = {
    name: 'groupManager',
    url: '/groups',
    templateUrl: '../templates/groups.html',
    controller: 'GroupCtrl'
  }
  $stateProvider.state(homeState);
  $stateProvider.state(systemState);
  $stateProvider.state(biddingState);
  $stateProvider.state(groupsState);
});
