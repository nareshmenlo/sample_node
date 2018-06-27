var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator'); 
var logger = require('morgan');

var routes_v1 = require('./routes/v1/routes_v1.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(expressValidator({
  customValidators: {
		passwordAndConfirmPasword: function (password, confirmPassword) {
			return (password === confirmPassword);
    }
  }
}));
app.use('/api/v1', routes_v1);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  //To log the errors
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
