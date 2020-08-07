const mongo = require('../public/mongoDB')
const commonData = require('../public/DATA')
const token = require('../public/token')
const common = require('../public/common')

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
                let bill = await DB.collection('bill').find({
                    UID: UID
                }).toArray()
                let user = await DB.collection('user').findOne({
                    UID: UID
                })
                bill.forEach(element => {
                    element['name'] = user.username
                });
                token.getToken({
                    UID: UID
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
    }).then(r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            let UID = r.date.data.UID.UID || r.date.data.UID
            DB.collection('bill').insertOne({
                UID: UID,
                BID: common.getID('bill'),
                type: req.body.type,
                content: req.body.content,
                date: req.body.date,
                price: req.body.price,
                imagePath: req.body.path
            })
            token.getToken({
                UID: UID
              }).then(r=>{
                console.log(r)
                res.send({
                  code: commonData.CODE.SUCCESS,
                  data:{
                    token: r
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
            DB.collection('bill').deleteOne({
                UID: UID,
                BID: req.body.BID
            })
            token.getToken({
                UID: UID
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
        }
    })
}

module.exports = {
    insertBill: insertBill,
    getBill: getBill,
    deleteBill: deleteBill
}