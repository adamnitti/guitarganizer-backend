const createError = require('http-errors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./config');

const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/users');
const guitarRouter = require('./routes/guitarRouter');

const mongoose = require('mongoose');

const url = config.mongoUrl;
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

const hostname = 'localhost';
const port = 3000;

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(__dirname + '/public'));

app.use('/guitars', guitarRouter);



app.use((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<html><body><h1>This is an Express Server</h1></body></html>');
});

app.listen(port, hostname, () => {
    console.log(`Server running at ${hostname}:${port}/`);
});

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
//res.render('error');
res.render('error');
});
