const mongo = require('../public/mongoDB')
const { v4: uuidv4 } = require('uuid');
const md5 = require('js-md5')
const common = require('../public/common')
const commonData = require('../public/DATA')
const token = require('../public/token')
const codeFile = require('./code')
const base64 = require('js-base64').Base64

let login = async function(req, res, next){
    let DB = mongo.getDB()
    let password = base64.decode(req.body.password)
    let pos = parseInt(req.body.pos)
    password = password.substr(0, pos) + password.substr(pos + md5('BookKeeping').length, password.length - pos)
    password = md5(password)
    let UID
    try{
       UID = await DB.collection('user').findOne({
        email: req.body.email,
        password: password
      })
    }catch(err){
        console.log(err)
        res.send({
            code: commonDate.CODE.DB_ERROR,
            msg: '查询数据库失败！'
        })
      }
    if(!UID){
      res.send({
        code: commonData.CODE.DATA_ERROE,
        data:{},
        msg: '未找到此人或者密码错误！'
      })
    }else{
      token.getToken({
        UID: UID
      }).then(r=>{
        console.log(r)
        res.send({
          code: commonData.CODE.SUCCESS,
          data:{
            token: r
          }
      })
      })

    }
}



let register = async function(req, res){
  let DB = mongo.getDB()
  let email = req.body.email
  let users
  try{
    users = await DB.collection('user').find({
      email: email
    }).toArray()
  }catch(err){
    console.error(err)
    res.send({
        code: commonDate.CODE.DB_ERROR,
        msg: '查询数据库失败！'
    })
  }
  
  if(users.length !== 0){
    res.send({
      code: commonData.CODE.INVALID,
      msg: '该用户已存在！'
    })
    return
  }
  let code = req.body.code
  let codes
  try{
    codes = await DB.collection('code').find({
      email: email,
      code: code
    }).toArray()
  }catch(err){
    console.error(err)
    res.send({
        code: commonDate.CODE.DB_ERROR,
        msg: '查询数据库失败！'
    })
  }
  
  if(codes.length === 0){
    res.send({
      code: commonData.CODE.DATA_ERROE,
      msg: '验证码输入错误或已失效！'
    })
  }else if(codes[0].invalid){
    res.send({
      code: commonData.CODE.INVALID,
      msg: '验证码已失效！'
    })
  }
  let password = base64.decode(req.body.password)
  let pos = parseInt(req.body.pos)
  password = password.substr(0, pos) + password.substr(pos + md5('BookKeeping').length, password.length - pos)
  password = md5(password)
  let UID
  try{
    UID = await common.getID({
      attribute: 'UID',
      collection: 'user'
    })
  }catch(err){
    console.error(err)
    res.send({
        code: commonDate.CODE.DB_ERROR,
        msg: '查询数据库失败！'
    })
  }
  
  DB.collection('user').insertOne({
    email: email,
    password: password,
    username: req.body.username,
    UID: UID
  })
  DB.collection('token').deleteOne({
    email: email,
    code: code
  })
  res.send({
    code: commonData.CODE.SUCCESS,
    msg: '注册成功'
  })
}

let forgetPassword = async function(req, res){
  let DB = mongo.getDB()
  let user
    try{
      user = await DB.collection('code').findOne({
        email: req.body.email
      })
    }catch(err){
      console.error(err)
      res.send({
          code: commonDate.CODE.DB_ERROR,
          msg: '查询数据库失败！'
      })
    }
    if(user.length === 0){
      res.send({
        code: commonData.CODE.DATA_ERROE,
        msg: '该邮箱不存在，请检查是否输入错误或确认是否未注册'
      })
    }else{
      let r = codeFile.codeEffective({
        email: req.body.email,
        code: req.body.code
      })
      if(r.code === commonData.CODE.SUCCESS){
        let password = base64.decode(req.body.password)
        let pos = parseInt(req.body.pos)
        password = password.substr(0, pos) + password.substr(pos + md5('BookKeeping').length, password.length - pos)
        password = md5(password)
        DB.collection('user').updateOne({
          email: req.body.email
        },{
          $set:{
            password: password
          }
        })
        res.send({
          data: r.code,
          msg: '修改密码成功√'
        })
      }else {
        res.send(r)
      }
    }
}

let resetPassword = async function(req, res){
  let DB = mongo.getDB()
  token.verifyToken({
    token:req.headers.token
  }).then(async r=>{
    if(r.code !== commonData.CODE.SUCCESS){
      res.send(r)
    }else{
      let password = base64.decode(req.body.password)
      let pos = parseInt(req.body.opos)
      password = password.substr(0, pos) + password.substr(pos + md5('BookKeeping').length, password.length - pos)
      password = md5(password)
      try{
        user = await DB.collection('user').findOne({
          email: r.date.data.UID.email,
          password: password
        })
      }catch(err){
        console.error(err)
        res.send({
            code: commonDate.CODE.DB_ERROR,
            msg: '查询数据库失败！'
        })
      }
      if(!user){
        res.send({
          code: commonData.CODE.DATA_ERROE,
          msg: '用户名或者旧密码错误'
        })
      }else{
        let newPassword = base64.decode(req.body.newPassword)
        let pos = parseInt(req.body.nops)
        newPassword = newPassword.substr(0, pos) + newPassword.substr(pos + md5('BookKeeping').length, newPassword.length - pos)
        newPassword = md5(newPassword)
        DB.collection('user').updateOne({
          email: r.date.data.UID.UID,
          password: password
        },{
          $set:{
            password: newPassword
          }
        })
        token.getToken({
          UID: r.date.data.UID.UID
        }).then(r=>{
          console.log(r)
          res.send({
            code: commonData.CODE.SUCCESS,
            data:{
              token: r
            }
        })
        })
      }
    }
  })
}

module.exports = {
    login: login,
    register: register,
    resetPassword: resetPassword
}