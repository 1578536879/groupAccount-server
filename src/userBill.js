const mongo = require('../public/mongoDB')
const commonData = require('../public/DATA')
const token = require('../public/token')
const common = require('../public/common')
const statistics = require('../public/billStatistics')
const fs = require('fs')

let getBill = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            try {
                let UID = r.date.data.UID.UID || r.date.data.UID
                let bill = await DB.collection(commonData.COLLECTION.BILL).find({
                    UID: UID,
                    GID: ''
                }).toArray()
                token.getToken({
                    UID: UID,
                    GID: r.date.data.GID
                }).then(r=>{
                    console.log(r)
                    res.send({
                    code: commonData.CODE.SUCCESS,
                    data:{
                        token: r,
                        data: bill
                    }
                })
                }) 
            } catch (error) {
                res.send({
                    code: commonData.CODE.DATA_ERROE,
                    msg: '查询数据库失败！'
                }) 
            }
        
        }
    })
}

let insertBill = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            let UID = r.date.data.UID.UID || r.date.data.UID
            if(!UID){
                res.send({
                    code: commonData.CODE.INVALID,
                    msg: '登陆失效！请重新登录 '
                })
            }
            let bid = await common.getID(commonData.COLLECTION.BILL)
            let user = await DB.collection(commonData.COLLECTION.USER).findOne({
                UID: UID
            })
            DB.collection(commonData.COLLECTION.BILL).insertOne({
                UID: UID,
                BID: bid,
                GID: '',
                type: req.body.type === "false" ? false : true,
                content: req.body.content,
                date: parseInt(req.body.date),
                price: parseFloat(req.body.price),
                imagePath: req.body.path,
                recorder: user.username,
            })
            token.getToken({
                UID: UID,
                GID: r.date.data.GID
              }).then(r=>{
                console.log(r)
                res.send({
                  code: commonData.CODE.SUCCESS,
                  data:{
                    token: r,
                    data: {
                        name: user.username,
                        BID: bid
                    }
                  },
                  msg: '账单添加成功√'
              })
            })
        }
    })
}

let deleteBill = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            let UID = r.date.data.UID.UID || r.date.data.UID
            DB.collection(commonData.COLLECTION.BILL).deleteOne({
                UID: UID,
                BID: req.body.BID
            })
            fs.unlink(req.body.path, (err, res)=>{
                token.getToken({
                    UID: UID,
                    GID: r.date.data.GID
                  }).then(r=>{
                    console.log(r)
                    res.send({
                      code: commonData.CODE.SUCCESS,
                      data:{
                        token: r
                      },
                      msg: '账单删除成功√'
                  })
                })
            })
            
        }
    })
}

let billStatistics = function(req, res){
    token.verifyToken({
        token: req.headers.token
    }).then(r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            statistics.billStatistics({
                time: req.body.time,
                UID: r.date.data.UID.UID || r.date.data.UID,
                datePicker: req.body.datePicker,
                type: 'person'
            }).then(result => {
                console.log(result)
                token.getToken({
                    UID: r.date.data.UID.UID || r.date.data.UID,
                  }).then(r=>{
                    console.log(r)
                    res.send({
                      code: commonData.CODE.SUCCESS,
                      data:{
                        token: r,
                        in: result.in,
                        out: result.out
                      }
                  })
                })
            })
        }
    })
}

let findBill = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            let UID = r.date.data.UID.UID || r.date.data.UID
            let data = await DB.collection('bill').find({
                UID: UID,
                GID: '',
                content: {
                    $regex: new RegExp(req.body.name)
                }
            }).toArray()
            token.getToken({
                UID: UID,
              }).then(r=>{
                console.log(r)
                res.send({
                  code: commonData.CODE.SUCCESS,
                  data:{
                    token: r,
                    data: data
                  }
              })
            })
        }
    })
}

let queryBill = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            let UID = r.date.data.UID.UID || r.date.data.UID
            let data = await DB.collection('bill').find({
                UID: UID,
                GID: '',
                date: {
                    $gte: parseInt(req.body.startTime),
                    $lt:  parseInt(req.body.endTime)
                },
            }).toArray()
            token.getToken({
                UID: UID,
              }).then(r=>{
                console.log(r)
                res.send({
                  code: commonData.CODE.SUCCESS,
                  data:{
                    token: r,
                    data: data
                  }
              })
            })
        }
    })
}

module.exports = {
    insertBill: insertBill,
    getBill: getBill,
    deleteBill: deleteBill,
    billStatistics: billStatistics,
    findBill: findBill,
    queryBill: queryBill
}