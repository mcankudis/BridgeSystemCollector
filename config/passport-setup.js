'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const keys = require('./keys');
const User = require('../models/user');
const sanitize = require('./sanitize');

passport.use(new LocalStrategy( function(username, password, done) {
  if(!sanitize.verifyString(username)) return done(null, false);
  if(!sanitize.verifyString(password)) return done(null, false);
  User.getUserByUsername(username, function(err,user) {
    if(err) {throw err;}
    if(!user) {return done(null, false, {message: "Unknown user"});}
    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) {throw err;}
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {message: "Invalid password"});
      }
    })
  })
}));
