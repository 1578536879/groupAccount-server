const mongo = require('../public/mongoDB')
const { v4: uuidv4 } = require('uuid');
const md5 = require('js-md5')
const email = require('../public/email')
const common = require('../public/common')
const commonData = require('../public/DATA')

let login = async function(req, res, next){
    let DB = mongo.getDB()
    let uuid = uuidv4();
    let time = new Date()
    let UID
    try{
       UID = await DB.collection('user').findOne({
        email: req.body.email,
        password: req.body.password
      })
    }catch(err){
        console.log(err)
      }
    if(!UID){
      res.send({
        code: 201,
        data:{},
        msg: '未找到此人或者密码错误！'
      })
    }else{
      let ip = req.ip
      DB.collection('token').insertOne({
        "token": uuid + "&&" + UID.UID,
        "time": time,
        ip: req.ip
      })
      DB.collection('token').createIndex({
        time
      },{
        expireAfterSeconds: 60 * 10
      },{
        backgroup: true
      })
      res.send({
        code: 200,
        data:{
          token: md5(uuid + "&&" + UID.UID)
        }
      })
    }
}

let registerCode = async function(req, res){
    let DB = mongo.getDB()
    let c = common.getCode(commonData.REGISTER_CODE_SIZE)
    let time = new Date()
    let r = email.sendEmail({
        userEmail: '1578536879@qq.com',
        subject: '注册账号',
        code: c,
        use: '激活账号',
        time: time
    })
    if(r === 0){
      res.send({
        code: 202,
        msg: '邮件发送失败，请重新发送'
      })
    }else{
      let time = new Date()
      DB.collection('code').insertOne({
        "email": req.body.email,
        "code": c,
        "time": time
      })
      DB.collection('code').createIndex({
        "time": 1 
      },{
        expireAfterSeconds: 60 * 10
      },{
        backgroup: true
      })
      res.send({
        code: 200,
        msg: 'success'
      })
    }
}


module.exports = {
    login: login,
    registerCode: registerCode
}