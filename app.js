var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
var db =require('./config/connection')
// view engine setup
var hbs=require('hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options',{layout:'layout/layout'});
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname+'/views/partials');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: 'cephackathon_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 week
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/',require('./routes/admin'))
app.use('/',require('./routes/approvereject'))
app.use('/',require('./routes/userdash'))
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
db.connect((err)=>{
  if(err){
    console.log("Database connection failed");
    return;
    
  }
  console.log("Database Connected");
  
})

module.exports = app;
