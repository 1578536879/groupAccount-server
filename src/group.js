const mongo = require('../public/mongoDB')
const token = require('../public/token')
const commonData = require('../public/DATA')
const common = require('../public/common')

let createGroup = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token:req.headers.token
     }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            let uid = r.date.data.UID.UID || r.date.data.UID
            let gid = await common.getID(commonData.COLLECTION.GROUP)
            let user = await DB.collection(commonData.COLLECTION.USER).findOne({
                UID: uid
            })
            DB.collection(commonData.COLLECTION.GROUP).insertOne({
                GID: gid,
                createTime: new Date(),
                creator: uid,
                name: req.body.name,
                user: [{
                    UID: uid,
                    role: 'creator',
                    name: user.username,
                    email: user.email
                }],
                using: true
            })
            try {
                let rr = await DB.collection(commonData.COLLECTION.UG).findOne({
                    UID: uid
                })
                if(!rr){
                    DB.collection(commonData.COLLECTION.UG).insertOne({
                        GID: [gid],
                        UID: uid
                    })
                }else{
                    DB.collection(commonData.COLLECTION.UG).updateOne({
                        UID: uid
                    },{
                        $push: {
                            "GID": gid
                        }
                    })
                }
                token.getToken({
                    UID: uid,
                    GID: gid
                  }).then(r=>{
                    console.log(r)
                    res.send({
                      code: commonData.CODE.SUCCESS,
                      data:{
                        token: r,
                        GID: gid
                      },
                      msg: '新建成功！'
                  })
                })
            } catch (error) {
                res.send({
                    code: commonData.CODE.DB_ERROR,
                    msg: '查询数据失败！'
                })
            }
            
        }
    })
    
    
}

let stopUsingGroup = async function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token:req.headers.token
     }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            try {
                let UID = r.date.data.UID.UID || r.date.data.UID
                let g = await DB.collection(commonData.COLLECTION.GROUP).findOne({
                    GID: req.body.data
                })
                if(g.creator !== UID){
                    res.send({
                        code: commonData.CODE.INVALID,
                        msg: '此人不是创建者！'
                    })
                    return
                } 
                DB.collection(commonData.COLLECTION.GROUP).updateOne({
                    GID: req.body.data
                },{
                    $set: {
                        using: false
                    }
                })
                
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
                      msg: '停用成功！'
                  })
                })
            } catch (error) {
                res.send({
                    code: commonData.CODE.DB_ERROR,
                    msg: '查询群组失败！'
                })
            }
        }
    })
}

let startUsingGroup = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token:req.headers.token
     }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            try {
                let UID = r.date.data.UID.UID || r.date.data.UID
                let g = await DB.collection(commonData.COLLECTION.GROUP).findOne({
                    GID: req.body.data
                })
                if(g.creator !== UID){
                    res.send({
                        code: commonData.CODE.INVALID,
                        msg: '此人不是创建者！'
                    })
                    return
                } 
                DB.collection(commonData.COLLECTION.GROUP).updateOne({
                    GID: req.body.data
                },{
                    $set: {
                        using: true
                    }
                })
                
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
                      msg: '启用成功√'
                  })
                })
            } catch (error) {
                res.send({
                    code: commonData.CODE.DB_ERROR,
                    msg: '查询群组失败！'
                })
            }
        }
    })
}

let groupRename = async function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token:req.headers.token
     }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            try {
                let UID = r.date.data.UID.UID || r.date.data.UID
                let g = await DB.collection(commonData.COLLECTION.GROUP).findOne({
                    GID: req.body.GID
                })
                if(g.creator !== UID){
                    token.getToken({
                        UID: UID
                      }).then(r=>{
                        console.log(r)
                        res.send({
                          code: commonData.CODE.INVALID,
                          data:{
                            token: r
                          },
                          msg: '此人不是创建者！'
                      })
                    })
                } 
                DB.collection(commonData.COLLECTION.GROUP).updateOne({
                    GID: req.body.GID
                }, {
                    $set: {
                        name: req.body.name
                    }
                })
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
                      msg: '重命名成功√'
                  })
                })
            } catch (error) {
                
            }
        }
     })
}

module.exports = {
    createGroup: createGroup,
    stopUsingGroup: stopUsingGroup,
    startUsingGroup: startUsingGroup,
    groupRename: groupRename
}