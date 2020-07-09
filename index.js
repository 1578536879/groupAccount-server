const environment = require('./public/environment')
const mongodb = require('./public/mongoDB')
const express = require('express');
const bodyParser = require('body-parser');
const APP = express();
const user = require('./src/user')
const code = require('./src/code')
APP.use(bodyParser.urlencoded({ extended: false }));
APP.use(bodyParser.json())

mongodb.init()

APP.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // res.header("X-Powered-By", ' 3.2.1')
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

APP.post('/login', user.login)
APP.post('/register', user.register)
APP.post('/getRegisterCode', code.registerCode)
APP.listen(environment.port, () => {
  console.log(`Server running at http://${environment.hostname}:${environment.port}/`);
});

