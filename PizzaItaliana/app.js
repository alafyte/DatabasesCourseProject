const createError = require('http-errors');
const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/authRouter');
const usersRouter = require('./routes/usersRouter');
const apiRouter = require('./routes/apiRouter');
const adminRouter = require('./routes/adminRouter');
const restaurantsRouter = require('./routes/restaurantsRouter');
const menuRouter = require('./routes/menuRouter');
const couriersRouter = require('./routes/couriersRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter');
const {setCurrentCredentials} = require("./config");

const app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('layout', path.join('layouts', 'layout'));
app.use(expressLayouts);

app.use(require('cookie-session')({
  name: '_es_usr_session',
  secret: 'kkd983-dw622-345kkcvm',
  resave: false,
  saveUninitialized: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(req, res, next) {
  res.locals.user = req.session.user ? req.session.user : {};
  setCurrentCredentials(req.session.user?.ROLE_NAME);
  res.locals.restaurant_id = req.session.restaurant_id ? req.session.restaurant_id : {};
  next();
});


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/menu', menuRouter);
app.use('/couriers', couriersRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);

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
  res.render('404_error', {title: "404", layout: false});
});


module.exports = app;
