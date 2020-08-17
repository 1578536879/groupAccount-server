const mongo = require('../public/mongoDB')
const commonData = require('../public/DATA')
const email = require('../public/email')
const common = require('../public/common')

let registerCode = async function(req, res){
    let DB = mongo.getDB()
    let emailData = req.query[0]
    emailData = emailData.replace('email=', '')
    emailData = emailData.replace('%40', '@')
    try {
      let user = await DB.collection('user').findOne({
        email: emailData
      })
      if(user){
        res.send({
          code: commonData.CODE.INVALID,
          msg: '该邮箱已注册！'
        })
      }else{
        let c = common.getCode(commonData.REGISTER_CODE_SIZE)
        let time = new Date()
        let r = email.sendEmail({
            userEmail: emailData,
            subject: '注册账号',
            code: c,
            use: '激活验证账号',
            time: time,
            title: '这是激活验证的邮件, 如果没有相关操作，请不用理会'
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
            "email": emailData,
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
    } catch (error) {
      res.send({
        code: commonData.CODE.DB_ERROR,
        msg: '查询数据库失败！'
      })
    }
   
}

let getforgetPasswordCode = async function(req, res){
  let emailData = req.query[0]
  emailData = emailData.replace('email=', '')
  emailData = emailData.replace('%40', '@')
  let DB = mongo.getDB()
  try{
    let user = await DB.collection('user').findOne({
      "email": emailData
    })
    if(!user){
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
          "email": emailData,
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
  }catch(err){
    console.error(err)
    res.send({
      code: commonData.CODE.DB_ERROR,
      msg: '查询数据库失败！'
    })
  }
}

let codeEffective = async function(data){
  let user
  let DB = mongo.getDB()
  if(!data.register){
    try{
      user = await DB.collection('user').findOne({
        email: data.email
      })
    }catch(err){
      console.error(err)
    }
    if(!user){
      return {
        code: commonData.CODE.DATA_ERROE,
        msg: '该邮箱不存在，请检查是否输入错误或确认是否未注册'
      }
    }
  }
    try{
      user = await DB.collection('code').findOne({
        email: data.email,
        code: data.code
      })
    }catch(err){
      console.error(err)
    }
    if(!user){
      return {
        code: commonData.CODE.DATA_ERROE,
        msg: '验证码输入错误或已失效！'
      }
    }else {
      let time = new Date().getTime()
      if(time - user.time.getTime() > 1000 * 60 * 10 || user.invalid){
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

module.exports = {
    registerCode: registerCode,
    getforgetPasswordCode: getforgetPasswordCode,
    codeEffective: codeEffective
}