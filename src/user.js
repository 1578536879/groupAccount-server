const mongodb = require('./public/mongoDB')
const { v4: uuidv4 } = require('uuid');
const md5 = require('js-md5')
let login = async function(req, res, next){
    let DB = mongodb.getDB()
    let uuid = uuidv4();
    let time= new Date().getTime()
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
      mongodb.getDB().collection('token').createIndex({
        time
      },{
        expireAfterSeconds: 1000 * 60 * 10
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

module.exports = {
    login: login
}