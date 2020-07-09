const mongo = require('../public/mongoDB')
const commonData = require('../public/DATA')
const email = require('../public/email')
const common = require('../public/common')

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
        code: commonData.CODE.SEND_FAIL,
        msg: '邮件发送失败，请重新发送'
      })
    }else{
      time = time.getTime()
      time = new Date(time + 1000 * 60 * 60 * 8) // mongodb有8个小时的时差
      DB.collection('code').insertOne({
        "email": req.body.email,
        "code": c,
        "time": time,
        "invalid": false
      })
      
      res.send({
        code: commonData.CODE.SUCCESS,
        msg: 'success'
      })
    }
}

let getforgetPasswordCode = function(req, res){
  let email = req.body.email
  let DB = mongo.getDB()
  let user
  try{
    user = await DB.collection('user').findOne({
      "email": email
    })
  }catch(err){
    console.error(err)
  }
  if(user.length === 0){
    res.send({
      code: commonData.CODE.DATA_ERROE,
      msg: '该邮箱不存在，请检查是否输入错误或确认是否未注册'
    })
  }else{
    let c = common.getCode(commonData.REGISTER_CODE_SIZE)
    let time = new Date()
    let r = email.sendEmail({
        userEmail: '1578536879@qq.com',
        subject: '找回密码',
        code: c,
        use: '重置密码',
        title: '这是找回密码的邮件, 如果没有相关操作，请不用理会',
        time: time
    })
    if(r === 0){
      res.send({
        code: commonData.CODE.SEND_FAIL,
        msg: '邮件发送失败，请重新发送'
      })
    }else{
      time = time.getTime()
      time = new Date(time + 1000 * 60 * 60 * 8) // mongodb有8个小时的时差
      DB.collection('code').insertOne({
        "email": req.body.email,
        "code": c,
        "time": time,
        "invalid": false
      })
      
      res.send({
        code: commonData.CODE.SUCCESS,
        msg: 'success'
      })
    }
  }
}

let codeEffective = function(data){
  let user
  try{
    user = await DB.collection('user').find({
      email: data.email
    }).toArray()
  }catch(err){
    console.error(err)
  }
  if(user.length === 0){
    return {
      code: commonData.CODE.DATA_ERROE,
      msg: '该邮箱不存在，请检查是否输入错误或确认是否未注册'
    }
  }else{
    try{
      user = await DB.collection('code').find({
        email: data.email,
        code: data.code
      }).toArray()
    }catch(err){
      console.error(err)
    }
    if(user.length === 0){
      return {
        code: commonData.CODE.DATA_ERROE,
        msg: '验证码输入错误或已失效！'
      }
    }else {
      let time = new Date().getTime()
      if(time - data.time.getTime() > 1000 * 60 * 10 || data.invalid){
        DB.collection('token').deleteOne({
          email: data.email,
          code: data.code
        })
        return {
          code: commonData.CODE.INVALID,
          msg: '验证码已失效！'
        }
      }else{
        DB.collection('code').deleteOne({
          email: data.email,
          code: data.code
        })
        return {
          code: commonData.CODE.SUCCESS,
        }
      }
    }
  }
}

module.exports = {
    registerCode: registerCode,
    getforgetPasswordCode: getforgetPasswordCode,
    codeEffective: codeEffective
}