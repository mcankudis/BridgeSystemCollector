'use strict';
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/BridgeSystemOnline', function() {
  console.log('Nawiązano połączenie z bazą danych')
})
module.exports = mongoose
