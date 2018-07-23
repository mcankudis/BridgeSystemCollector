var db = require('../db')
var bcrypt = require('bcryptjs');
const Schema = db.Schema;

const userSchema = new Schema({
    username:   {type: String, index: true, unique: true},
    password:   {type: String, required: true},
    email:      {type: String, required: true},
    name:       {type: String, required: true},
    cezar:      {type: String},
    googleId:   String,
    thumbnail:  String
});

const User = db.model('user', userSchema);
module.exports = User;

module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}
module.exports.changePasswd = function(id, newPassword, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newPassword, salt, function(err, hash) {
      if(err) {throw err;}
      User.updateOne({_id: id}, {$set: {password: hash}}, callback);
    });
  });
}
module.exports.getUserByUsername = function(username, callback) {
  var query = {username: username};
  User.findOne(query, callback);
}
module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}
module.exports.comparePassword = function(newPassword, hash, callback) {
  bcrypt.compare(newPassword, hash, function(err, isMatch) {
    if(err) {throw err;}
    callback(null, isMatch);
  })
}
