const Express = require("express");
const BodyParser = require("body-parser");
const UUID = require("uuid");
const session = require("express-session");
const morgan = require('morgan')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/mst')
var app = Express()

// app.use(Express.cookieParser());
app.use(session({secret: process.env.SESSION_SECRET || 'arathersimplesecret',saveUninitialized: true,resave: true,cookie:{maxAge:2592000000}}));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // res.setHeader("Content-Type", "application/json;charset=utf-8") 
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "*");

  next();
});

app.use(morgan('combined'))
// app.use('/', require('./routes/sessionRouter'))
app.use('/', require('./routes/campaignRouter'))

app.get('/', (req, res)=> {
  res.send('some data')
})

app.listen('2000', ()=> {
  console.log('app running on 2000');
  
})