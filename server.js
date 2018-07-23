'use strict';
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const expressValidator = require('express-validator');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const keys = require('./config/keys');
const helmet = require('helmet');

// Security headers
app.use(helmet());

// Body parse
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// initialize passport
app.use(passport.initialize());

//Set static folder
app.use(express.static(__dirname + '/client'));

// Set the view engine
app.set('views', __dirname + '/client');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// These are the routes
const index = require('./routes/index');
const api = require('./routes/api');
app.use('/', index);
app.use('/api', api);

const port = 3000
app.listen(port, function() {
  console.log('hi, listening on port ' + port);
})
