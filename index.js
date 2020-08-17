const environment = require('./public/environment')
const mongodb = require('./public/mongoDB')
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const APP = express();
const user = require('./src/user')
const code = require('./src/code')
const userGroup = require('./src/userGroup')
const group = require('./src/group')
const userBill = require('./src/userBill')
const groupBill = require('./src/groupBill')
const image = require('./src/image')
const pathname = __dirname;
//静态文件访问
APP.use(express.static(pathname));

const storage = multer.diskStorage({
  destination(req,res,cb){
    cb(null,'image/bill/');
  },
  filename(req,file,cb){
    let name = uuidv4() + '&&' + file.originalname
    cb(null,name);
  }
})

APP.use(bodyParser.urlencoded({ extended: false }));
APP.use(bodyParser.json())

mongodb.init()

APP.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Access-Token,token");    
  res.setHeader("Content-Security-Policy-Report-Only", "*");
  res.header("Content-Security-Policy", "*");

  // res.header("X-Powered-By", ' 3.2.1')
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

APP.post('/login', user.login)
APP.post('/register', user.register)
APP.post('/user/resetPassword', user.resetPassword)
APP.post('/user/forgetPassword', user.forgetPassword)
APP.post('/user/switchGroup', user.switchGroup)

APP.get('/code/registerCode', code.registerCode)
APP.get('/code/forgetPassword', code.getforgetPasswordCode)

APP.post('/group/create', group.createGroup)
APP.delete('/group/stopUsing', group.stopUsingGroup)
APP.post('/group/startUsing', group.startUsingGroup)
APP.post('/group/rename', group.groupRename)

APP.get('/group/user/getGroups', userGroup.getUserGroups)
APP.post('/group/user/invite', userGroup.inviteUser)
APP.post('/group/user/inviteEffective', userGroup.inviteEffective)
APP.get('/group/user/getMember', userGroup.getGroupMember)
APP.delete('/group/user/deleteMember', userGroup.deleteUserFromGroup)
APP.post('/group/user/upgrade', userGroup.upgradeMember)
APP.post('/group/user/downgrade', userGroup.downgradeMember)

APP.post('/user/bill/insert', userBill.insertBill)
APP.get('/user/bill/get', userBill.getBill)
APP.delete('/user/bill/delete', userBill.deleteBill)

APP.post('/group/bill/insert', groupBill.insertBill)
APP.get('/group/bill/get', groupBill.getBill)
APP.delete('/group/bill/delete', groupBill.deleteBill)

APP.post('/image/bill/update', multer({
  storage
}).single('file'), image.billUpdate)
APP.delete('/image/bill/delete', image.billDelete)

APP.listen(environment.port, () => {
  console.log(`Server running at http://${environment.hostname}:${environment.port}/`);
});

