app.service('ArraySvc', function() {
  var svc = this
  svc.getSize = function(array) {
    var i = 0;
    while(array[i]) i++;
    i--;
    return i;
  }
  svc.destroyLast = function(array) {
    var i = svc.getSize(array);
    array[i] = undefined;
    return array;
  }
})
