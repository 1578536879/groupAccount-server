const mongo = require('../public/mongoDB')
const { v4: uuidv4 } = require('uuid');
// const md5 = require('js-md5')
const jwt = require('jsonwebtoken')
const commonDate = require('./DATA')

let saveSecretKey = function(){
    let uuid = uuidv4()
    uuid = uuid + uuidv4()
    let DB = mongo.getDB()
    let date = new Date().toDateString()
    DB.collection('secretKey').insertOne({
        key: uuid,
        date: date
    })
    return uuid
}

let getToken = async function(data){
    let userDate = {
        UID: data.UID,
        GID: data.GID
    }
    let DB = mongo.getDB()
    let date = new Date().toDateString()
    let key = await DB.collection('secretKey').findOne({
        date: date
    })
    if(!key){
        key = saveSecretKey()
    }else{
        key = key.key
    }
    console.log(typeof key)
    let res = jwt.sign({
        data: userDate,
        exp: Math.floor(Date.now() / 1000) + commonDate.CODE_EXPIRE_TIME
    }, key)
    return res
}

let verifyToken = async function(data){
    let date = new Date().toDateString()
    let DB = mongo.getDB()
    let res
    try{
        res = await DB.collection('secretKey').findOne({
            date: date
        })
    }catch(err){
        console.error(err)
    }
    if(!res){
        return {
            code: commonDate.CODE.INVALID,
            msg: '身份认证过期，请重新登陆'
        }
    }
    try{
        res = jwt.verify(data.token, res.key)
        return {
            code: commonDate.CODE.SUCCESS,
            date: res
        }
    }catch(err){
        console.log(err)
        return {
            code: commonDate.CODE.DATA_ERROE,
            msg: '身份认证过期，请重新登陆'
        }
    }
}

// let saveToken = function(data){
//     let DB = mongo.getDB()
//     let uuid = uuidv4()
//     let time = new Date()
//     time = time.getTime()
//     time = new Date(time + 1000 * 60 * 60 * 8) // mongodb有8个小时的时差
//     let timeNum = time.getTime()
//     let token
//     if(data.GID){
//         token = uuid + "&&" + data.UID + "@@" + data.GID
//     }else{
//         token = uuid + "&&" + data.UID
//     }
//     DB.collection('token').insertOne({
//         "token": token,
//         "time": time,
//         "timeNum": timeNum,
//         ip: data.ip
//     })
//     return md5(token)
// }

// let updateToken = function(data){
//     let DB = mongo.getDB()
//     let time = new Date()
//     time = new Date(time + 1000 * 60 * 60 * 8) // mongodb有8个小时的时差
//     timeNum = time.getTime()
//     DB.collection('token').updateOne({
//         token: data.token
//     },{
//         $set: {
//             time: time,
//             timeNum: timeNum
//         }
//     })
// }

// let tokenLegitimate = async function(data){
//     let nowTime = new Date()
//     let nowTimeNum = nowTime.getTime()
//     let res
//     try{
//         res = await DB.collection('token').findOne({
//             "nowTimeNum": {"$lte": nowTimeNum, "$gte": nowTimeNum - commonDate.CODE_EXPIRE_TIME * 1000}
//         })
//     }catch(err){
//         console.error(err)
//     }
//     if(res.length === 0){
//         return {
//             code: commonDate.CODE.DATA_ERROE,
//             msg: '该token已失效'
//         }
//     }else {
//         let token = ''
//         for(let i=0; i<res.length; i++){
//             if(md5(res[i]) === data.token){
//                 token = data.token
//                 return 
//             }
//         }
//         updateToken({token: token})
//         let index = token.indexOf('&&')
//         let UID = token.substr(index+2, token.length)
//         return {
//             code: commonDate.CODE.SUCCESS,
//             UID: UID
//         }
//     }
// }

// let dropToken = async function(data){
//     let res
//     try{
//         res = await DB.collection('token').findOne({
//             "nowTimeNum": {"$lte": nowTimeNum, "$gte": nowTimeNum - commonDate.CODE_EXPIRE_TIME * 1000}
//         })
//     }catch(err){
//         console.error(err)
//     }
//     if(res.length === 0){
//         return {
//             code: commonDate.CODE.DATA_ERROE,
//             msg: '该token已被删除'
//         }
//     }else {
//         let token = ''
//         for(let i=0; i<res.length; i++){
//             if(md5(res[i]) === data.token){
//                 token = data.token
//                 return 
//             }
//         }
//         DB.collection('token').deleteOne({
//             token: token
//         })
//     }
// }

module.exports = {
    // saveToken: saveToken,
    // updateToken: updateToken,
    // tokenLegitimate: tokenLegitimate,
    getToken: getToken,
    verifyToken: verifyToken
}