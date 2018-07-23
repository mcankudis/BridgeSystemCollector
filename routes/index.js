'use strict';
const ensureAuthenticated = require('../config/ensureAuthenticated')
const express = require('express')
const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const router = express.Router()
const passport = require('passport');
const User = require('../models/user');
const sanitize = require('../config/sanitize');

router.get('/', function(req, res, next) {
  res.render('views/index.html')
})

router.get('/a', function(req, res, next) {
  res.render('views/authorized.html')
})

// Register User
router.post('/register', function(req,res,next) {
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;
  let cezar = req.body.cezar;
  //Validation:
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is invalid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(password);
  let errors = req.validationErrors();
  if(errors) return res.json(errors);
  if(!sanitize.verifyString(name)) return res.sendStatus(401);
  if(!sanitize.verifyString(email)) return res.sendStatus(401);
  if(!sanitize.verifyString(username)) return res.sendStatus(401);
  if(!sanitize.verifyString(password)) return res.sendStatus(401);
  if(!sanitize.verifyCezar(cezar)) return res.sendStatus(401);

  let newUser = new User({
    name: name,
    email: email,
    username: username,
    password: password
  });
  User.createUser(newUser, function(err, user) {
    if(err) {
      if(err.code == "11000") return res.sendStatus(418)
      else throw err;
    } else res.sendStatus(201);
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {

    if (err) return next(err);
    if (!user) return res.sendStatus(401);
    //user has authenticated correctly
    let random = getRandomString(10, 100);
    let token = jwt.sign({ username: user.username, id: user._id, sub: random}, keys.tokenAuth.secret, {expiresIn: '2h'});
    res.json({ token : token, user: {username: user.username, cezar: user.cezar, _id: user._id}});

  })(req, res, next);
});

let getRandomString = function(mini, maxi) {
  let tmp = Math.ceil(Math.random()*(maxi-mini))+mini;
  let helper = "1234567890abcdefghijklmnopqrstuvwxyz";
  let string = '';
  for (let i = 0; i < tmp; i++) {
    let rand = Math.floor(Math.random()*30);
    string+=helper[rand];
  }
  return string;
}

router.post('/changePasswd', ensureAuthenticated, function(req, res, next) {
  req.body.username = req.auth.username;
  if(!sanitize.verifyString(req.body.newPassword)) return res.sendStatus(401);
  if(!sanitize.verifyString(req.body.password)) return res.sendStatus(401);
  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) return res.sendStatus(401);
    User.changePasswd(user._id, req.body.newPassword, function(err, suc) {
      if(err) return res.sendStatus(401);
      return res.sendStatus(201);
    })
  })(req, res, next);
})

router.get('/users/:id', ensureAuthenticated, function(req, res) {
  let id = req.params.id;
  if(!sanitize.verifyWord(id)) return res.sendStatus(401);
  User.findOne({_id: id}).select('username').select('_id').select('cezar').exec(function(err, user) {
    if(err) return res.sendStatus(401);
    if(!user) return res.sendStatus(404);
    res.json(user);
  })
})

router.get('/user/:name', ensureAuthenticated, function(req, res) {
  let username = req.params.name;
  if(!sanitize.verifyString(username)) return res.sendStatus(401);
  User.findOne({username: username}).select('username').select('_id').select('cezar').exec(function(err, user) {
    if(err) return res.sendStatus(401);
    if(!user) return res.sendStatus(404);
    res.json(user);
  })
})

module.exports = router
