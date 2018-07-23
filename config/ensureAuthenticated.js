'use strict';
const jwt = require('jsonwebtoken')
const keys = require('../config/keys')

module.exports = function(req, res, next) {
  if(req.headers['x-auth']) {
    jwt.verify(req.headers['x-auth'], keys.tokenAuth.secret, function(err, token) {
      if(err) {
        res.sendStatus(401);
        return false;
      }
      else {
        req.auth = token;
        return next();
      }
    });
  } else {
    res.redirect('/#/login');
    return false;
  }
}
