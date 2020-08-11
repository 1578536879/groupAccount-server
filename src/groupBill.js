const mongo = require('../public/mongoDB')
const commonData = require('../public/DATA')
const token = require('../public/token')
const common = require('../public/common')
const fs = require('fs')

let getBill =  function(req, res){
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
                    GID: r.date.data.GID
                }).toArray()
                token.getToken({
                    UID: UID,
                    GID: r.date.data.GID
                }).then(r=>{
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
            let user = await DB.collection(commonData.COLLECTION.USER).findOne({
                UID: UID
            })
            let bid = await common.getID(commonData.COLLECTION.BILL)
            DB.collection(commonData.COLLECTION.BILL).insertOne({
                GID: r.date.data.GID,
                BID: bid,
                type:  req.body.type === "false" ? false : true,
                content: req.body.content,
                date: req.body.date,
                price: req.body.price,
                imagePath: req.body.path,
                recorder: user.username,
                UID: UID
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
                GID: r.date.data.GID,
                BID: req.body.BID
            })
            fs.unlink(req.body.path, (err, rr)=>{
                token.getToken({
                    UID: UID,
                    GID: r.date.data.GID,
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

module.exports = {
    getBill: getBill,
    insertBill: insertBill,
    deleteBill: deleteBill
}