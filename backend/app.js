require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose'); // ⬅️ MongoDB import

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var targetRouter = require('./routes/target.routes');

var app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ⬇️ MongoDB verbinden
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Verbonden met MongoDB'))
.catch((err) => {
  console.error('❌ Fout bij verbinden met MongoDB:', err.message);
  process.exit(1);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes koppelen
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/targets', targetRouter);

// 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
