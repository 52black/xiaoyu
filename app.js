var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var works = require('./routes/works');
var scratch = require('./routes/scratch');
var lessons = require('./routes/lessons');
// admin
var admin = require('./routes/admin_index');
// db
const dbUrl = 'mongodb://localhost:27017/xiaouopen'
var mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(dbUrl)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',require('ejs').__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '500mb',extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  resave: false,
	secret: 'xiaous1oei02',
  saveUninitialized: true,
	store: new mongoStore({
		url:dbUrl,
		collection:'sessions_xiaous1'
	}),
  cookie: { maxAge: 604800000 },
}))



app.use('/', index);
app.use('/users', users);
app.use('/works', works);
app.use('/scratch', scratch);
app.use('/lessons', lessons);
app.use('/admin', admin);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
