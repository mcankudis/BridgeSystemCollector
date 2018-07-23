app.controller('BidCtrl', function($scope, $http, $state, ArraySvc, MainSvc){

  var testTheme = function() {
    var theme = localStorage.getItem('theme');
    if(theme=='1') $scope.theme = true;
    else $scope.theme = false;
  }
  testTheme();
  $scope.$on('themeEvent', function() {
    testTheme();
  })
  $scope.$on('chooseGroupEvent', function(event, data) {
    $scope.chosenGroup = data._id;
    findBids([])
  })
  $scope.sequence = {}
  $scope.twoSide = false;
  $scope.varKeepAuction = false;
  $scope.description = [];
  $scope.toBeUpdated = [];

  $scope.auction = {
    bids: [
      {"index": 1, "value": "pass"},
      {"index": 2, "value": "x"},
      {"index": 3, "value": "xx"},
      {"index": 4, "value": "1club"},
      {"index": 5, "value": "1diamond"},
      {"index": 6, "value": "1heart"},
      {"index": 7, "value": "1spade"},
      {"index": 8, "value": "1NT"},
      {"index": 9, "value": "2club"},
      {"index": 10, "value": "2diamond"},
      {"index": 11, "value": "2heart"},
      {"index": 12, "value": "2spade"},
      {"index": 13, "value": "2NT"},
      {"index": 14, "value": "3club"},
      {"index": 15, "value": "3diamond"},
      {"index": 16, "value": "3heart"},
      {"index": 17, "value": "3spade"},
      {"index": 18, "value": "3NT"},
      {"index": 19, "value": "4club"},
      {"index": 20, "value": "4diamond"},
      {"index": 21, "value": "4heart"},
      {"index": 22, "value": "4spade"},
      {"index": 23, "value": "4NT"},
      {"index": 24, "value": "5club"},
      {"index": 25, "value": "5diamond"},
      {"index": 26, "value": "5heart"},
      {"index": 27, "value": "5spade"},
      {"index": 28, "value": "5NT"},
      {"index": 29, "value": "6club"},
      {"index": 30, "value": "6diamond"},
      {"index": 31, "value": "6heart"},
      {"index": 32, "value": "6spade"},
      {"index": 33, "value": "6NT"},
      {"index": 34, "value": "7club"},
      {"index": 35, "value": "7diamond"},
      {"index": 36, "value": "7heart"},
      {"index": 37, "value": "7spade"},
      {"index": 38, "value": "7NT"}
    ],
    addBid: function(bid) {
      $scope.sequence[$scope.currentBidIndex] = bid;
      if($scope.twoSide==true) {
        $scope.biddingBox($scope.currentBidIndex+1, true)
      } else {
        $scope.sequence[$scope.currentBidIndex+1] = $scope.auction.bids[0]
        $scope.biddingBox($scope.currentBidIndex+2, true)
      }
      getLastBid();
      findBids($scope.sequence)
    },
    lastBid: 3,
    canDouble: false,
    canRedouble: false
  }
  $scope.addBid = function() {
    var Bid = function(bid, description, sequence, twoSide, convention) {
      this.bid = bid.index;
      this.description = description;
      this.sequence = sequence;
      this.twoSide = twoSide;
    }
    var tmp = [];
    for (var i = 0; i < ArraySvc.getSize($scope.sequence); i++) {
      tmp.push($scope.sequence[i].index.toString());
    }
    var entries = [];
    var updates = [];
    for (var i = 0; i < $scope.description.length; i++) {
      if($scope.description[i] && $scope.description[i].description && $scope.description[i].description!=='') {
        if(i>=$scope.auction.lastBid || i<4) {
          var bid = $scope.auction.bids[i-1];
          var newBid = new Bid(bid, $scope.description[i].description, tmp, $scope.twoSide);
          if($scope.description[i].toBeUpdated) {
            newBid._id = $scope.description[i].toBeUpdated;
            updates.push(newBid);
          } else entries.push(newBid);
        }
      }
    }
    if(entries[0]) {
      $http.post('/api/bids', {
        chosenGroup: $scope.chosenGroup,
        entries: entries,
        convention: $scope.convention
      }).success(function(res) {
        Materialize.toast('Dodano odzywki', 4000);
        if(updates[0]) updateBidsRequest(updates);
        else cleanup();
      }).error(function(err) {
        if(err==="Unauthorized") MainSvc.logOut();
        Materialize.toast('Wystąpił błąd', 4000)
      })
    } else if(updates[0]) updateBidsRequest(updates);
  }


  $scope.bidAlreadyExists = function(index) {
    if(!$scope.description[index]) $scope.description[index] = {};
    $scope.description[index].toBeUpdated = false;
    if (!$scope.bids || !$scope.bids[0]) return false;
    for (var i = 0; i < $scope.bids.length; i++) {
      if($scope.bids[i].bid==index) {
        $scope.description[index].toBeUpdated = $scope.bids[i]._id;
        return $scope.bids[i].description;
      }
    }
    return false;
  }

  $scope.biddingBox = function(index, auto) {
    $scope.currentBidIndex = index
    if(!auto) {
      if($scope.showBiddingBox) $scope.showBiddingBox = false;
      else $scope.showBiddingBox = true;
    }
    var i = index-1;
    var maxi = 3;
    while ($scope.sequence[i]) {
        if($scope.sequence[i].index>maxi) maxi = $scope.sequence[i].index;
        i--;
    }
    $scope.auction.currentMinBid = maxi;
  }

  var getLastBid = function() {
    if(ArraySvc.getSize($scope.sequence)==-1) {
      $scope.auction.lastBid = 3;
      $scope.canDouble=false;
      $scope.canRedouble=false;
      return;
    };                                                    // preventing empty sequence
    var i = ArraySvc.getSize($scope.sequence), j = i;     // getting size of sequence
    $scope.auction.lastBid = $scope.sequence[i].index;
    while($scope.sequence[i].index <= 3) {                // searching for the last non-pass/x/xx bid
      $scope.auction.lastBid = $scope.sequence[i].index;
      i--;
    }                                                     // now i contains its index
    if(!$scope.sequence[i]) {                             // in case there are only passses
      $scope.auction.lastBid = 3;
      $scope.canDouble=false;
      $scope.canRedouble=false;
      return;
    }
    $scope.auction.lastBid = $scope.sequence[i].index;
    i=j;                                                  // i equals size of sequence once again
    while($scope.sequence[j].index===1) {j--;}            // now searching for the last non-pass bid
    if($scope.sequence[j].index===3) {                    // if it's a redouble
      $scope.auction.canDouble=false;
      $scope.auction.canRedouble=false;
    }else if($scope.sequence[j].index===2) {              // if it's a double
      $scope.auction.canDouble=false
      if(j%2==i%2) $scope.auction.canRedouble=true;       // and if it's been played by the opposite side
      else $scope.auction.canRedouble=false;
    }else {                                               // if it's any other bid
      $scope.auction.canRedouble=false;
      if(j%2==i%2) $scope.auction.canDouble=true;         // that has been played by the opposite side
      else $scope.auction.canDouble=false;
    }
  }
  var findBids = function(sequence) {
    var tmp = [];
    for (var i = 0; i < ArraySvc.getSize(sequence); i++) {
      tmp.push(sequence[i].index);
    }
    $http.get('/api/bid', {
      headers: {'x-group': $scope.chosenGroup, 'x-sequence': tmp}
    }).success(function(bids) {
      $scope.bids = bids
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut;
      $scope.bids = {};
    })
  }
  var updateBidsRequest = function(updates) {
    $http.post('/api/upBids', {
      chosenGroup: $scope.chosenGroup,
      updates: updates
    }).success(function(){
      cleanup();
      Materialize.toast('Zaktualizowano odzywki', 4000);
    }).error(function(err) {
      if(err==="Unauthorized") MainSvc.logOut();
      Materialize.toast('Wystąpił błąd', 4000);
    })
  }
  var cleanup = function() {
    $scope.description = [];
    $scope.convention = '';
    if($scope.varKeepAuction==false) $scope.removeAll();
    findBids($scope.sequence);
  }

  // NOT INTERESTING FUNCTIONS:
  $scope.insertColor = function(sign, where) {
    if(!$scope.description[where]) $scope.description[where] = {};
    if(!$scope.description[where].description) $scope.description[where].description = '';
    switch (sign) {
      case 1:
        $scope.description[where].description+= '♣';
        break;
      case 2:
        $scope.description[where].description+= '♦';
        break;
      case 3:
        $scope.description[where].description+= '♥';
        break;
      case 4:
        $scope.description[where].description+= '♠';
        break;
      default: Materialize.toast('Wystąpił błąd', 4000)
    }
    document.getElementById(where).focus();
  }
  $scope.removeAll = function() {
    $scope.sequence = {}
    $scope.auction.lastBid = 3;
    $scope.auction.canDouble = false;
    $scope.auction.canRedouble = false;
    $scope.auction.currentMinBid = 3;
    $scope.biddingBox(0, true);
    findBids($scope.sequence);;
  }
  $scope.removeLast = function() {
    if(ArraySvc.getSize($scope.sequence)<0) return Materialize.toast('Licytacja jest już pusta', 4000);
    ArraySvc.destroyLast($scope.sequence)
    if(ArraySvc.getSize($scope.sequence)<0) return;
    if($scope.twoSide==false) {
      ArraySvc.destroyLast($scope.sequence)
    }
    getLastBid();
    var i = ArraySvc.getSize($scope.sequence);
    if(i===-1) i = 0;
    $scope.biddingBox(i, true);
    findBids($scope.sequence);
  }
  $scope.toggleKeepAuction = function() {
    if($scope.varKeepAuction == false) {
      $scope.varKeepAuction = true
    } else {
      $scope.varKeepAuction = false
    }
  }
  $scope.toggleTwoSide = function() {
    if($scope.twoSide==false) {
      $scope.twoSide = true
    } else {
      $scope.twoSide = false
    }
  }

  // FILTERS
  $scope.biddingBoxFilter = function(item) {
    if($scope.auction.currentMinBid<item.index) return item;
    return;
  }
  $scope.bidsFilter = function(item) {
    if($scope.auction.lastBid<item.index) return item;
    return;
  }

  // JQUERY AND MATERIALIZE
  $(document).ready(function(){
    $('.tooltipped').tooltip({delay: 50});
    $('.modal').modal({
      complete: function() {
      }
    });

  });
  if($scope.chosenGroup) findBids([]);
});
