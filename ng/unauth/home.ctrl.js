app.controller('HomeCtrl', function($scope, $http, $state){
  var options = [
    {selector: '#img1', offset: 400, callback: function(el) {
      Materialize.fadeInImage($(el));
    } },
    {selector: '#img2', offset: 400, callback: function(el) {
      Materialize.fadeInImage($(el));
    } },
    {selector: '#img3', offset: 400, callback: function(el) {
      Materialize.fadeInImage($(el));
    } },
    {selector: '#img4', offset: 400, callback: function(el) {
      Materialize.fadeInImage($(el));
    } },
    {selector: '#img5', offset: 400, callback: function(el) {
      Materialize.fadeInImage($(el));
    } },
    {selector: '#img6', offset: 400, callback: function(el) {
      Materialize.fadeInImage($(el));
    } },
    {selector: '#img7', offset: 400, callback: function(el) {
      Materialize.fadeInImage($(el));
    } },
    {selector: '#img8', offset: 400, callback: function(el) {
      Materialize.fadeInImage($(el));
    } }
  ];
  Materialize.scrollFire(options);
})
