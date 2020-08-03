const mongo = require('../public/mongoDB')
const token = require('../public/token')
const commonData = require('../public/DATA')
const { v4: uuidv4 } = require('uuid')

let createGroup = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token:req.headers.token
     }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            let gid = uuidv4()
            // let user = await DB.collection('user').findOne({
            //     UID: r.date.data.UID.UID
            // })
            DB.collection('group').insertOne({
                GID: gid,
                createTime: new Date(),
                creator: r.date.data.UID.UID || r.date.data.UID,
                name: req.body.name,
                user: [{
                    UID: r.date.data.UID.UID || r.date.data.UID,
                    role: 'creator',
                    name: r.date.data.UID.username
                }],
                using: true
            })
            try {
                let r = await DB.collection('UG').findOne({
                    UID: r.date.data.UID.UID || r.date.data.UID
                })
                if(!r){
                    DB.collection('UG').insertOne({
                        GID: [gid],
                        UID: r.date.data.UID.UID
                    })
                }else{
                    DB.collection('UG').update({
                        UID: data.UID
                    },{
                        $push: {
                            "GID": data.GID
                        }
                    })
                }
                token.getToken({
                    UID: r.date.data.UID.UID
                  }).then(r=>{
                    console.log(r)
                    res.send({
                      code: commonData.CODE.SUCCESS,
                      data:{
                        token: r
                      },
                      msg: '新建成功！'
                  })
                })
            } catch (error) {
                
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
                let g = await DB.collection('group').findOne({
                    GID: req.body.data
                })
                if(g.creator !== UID){
                    res.send({
                        code: commonData.CODE.INVALID,
                        msg: '此人不是创建者！'
                    })
                    return
                } 
                DB.collection('group').updateOne({
                    GID: req.body.data
                },{
                    $set: {
                        using: false
                    }
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
                let g = await DB.collection('group').findOne({
                    GID: req.body.data
                })
                if(g.creator !== UID){
                    res.send({
                        code: commonData.CODE.INVALID,
                        msg: '此人不是创建者！'
                    })
                    return
                } 
                DB.collection('group').updateOne({
                    GID: req.body.data
                },{
                    $set: {
                        using: true
                    }
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
                let g = await DB.collection('group').findOne({
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
                DB.collection('group').updateOne({
                    GID: req.body.GID
                }, {
                    $set: {
                        name: req.body.name
                    }
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