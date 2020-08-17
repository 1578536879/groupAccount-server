const mongo = require('../public/mongoDB')
const token = require('../public/token')
const commonData = require('../public/DATA')
const environment = require('../public/environment')
const email = require('../public/email')
const common = require('../public/common')

let getUserGroups = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async function(r){
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            let groups
            try{
                let UID = r.date.data.UID.UID || r.date.data.UID
                groups = await DB.collection(commonData.COLLECTION.UG).findOne({
                    UID: UID
                })
                let groupsName = []
                let data 
                if(groups){
                    groups = groups.GID
                    data = await DB.collection(commonData.COLLECTION.GROUP).find({
                        GID: {$in: groups}
                    }).toArray()
                    data.forEach(element => {
                        if(element.creator === UID){
                            groupsName.push({
                                role: 'creator',
                                name: element.name,
                                action: {
                                    GID: element.GID,
                                    using: element.using
                                } 
                            })
                        }else{
                            groupsName.push({
                                action: {
                                    GID: element.GID,
                                    using: element.using
                                },
                                role: 'common',
                                name: element.name
                            })
                        }
                    });
                }
                let gid
                if(r.date.data.GID){
                    gid = r.date.data.GID
                }
                token.getToken({
                    UID: UID,
                    GID: r.date.data.GID
                  }).then(r=>{
                    console.log(r)
                    res.send({
                      code: commonData.CODE.SUCCESS,
                      data:{
                        token: r,
                        groupsName: groupsName,
                        GID: gid
                      },
                      msg: '新建成功！'
                  })
                })
                
            }catch(err){
                console.error(err)
                res.send({
                    code: commonData.CODE.DB_ERROR,
                    msg: '查询数据库失败！'
                })
            }
        }
    })
}


let inviteUser = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            try {
                let UID = r.date.data.UID.UID || r.date.data.UID
                let group = await DB.collection(commonData.COLLECTION.GROUP).findOne({
                    GID: r.date.data.GID
                })
                if(!group){
                    res.send({
                        code: commonData.CODE.INVALID,
                        msg: '群组不存在'
                    })
                    return
                }
                group = group.user.filter(ele=>{
                    return ele.email === req.body.email 
                })
                if(group.length !== 0){
                    res.send({
                        code: commonData.CODE.INVALID,
                        msg: '该邮箱用户已在组里！'
                    })
                    return
                }
                let user = await DB.collection(commonData.COLLECTION.USER).findOne({
                    UID: UID
                })
                let time = new Date().getTime()
                time = new Date(time + 1000 * 60 * 60 * 8) // mongodb有8个小时的时差
                let invite = await DB.collection(commonData.COLLECTION.INVITATION).find({
                    GID: r.date.data.GID,
                    email: req.body.email,
                }).toArray()
                let flag = true
                invite.forEach(ele=>{
                    let t = time - ele.date.getTime()   
                    if(t > 1000 * 60 * 30){
                        DB.collection(commonData.COLLECTION.INVITATION).deleteOne({
                            IID: req.body.id,
                            email:  req.body.email
                        })
                    }else{
                        flag = false
                    }
                })
                
                if(flag){
                    common.getID(commonData.COLLECTION.INVITATION).then(id =>{
                        DB.collection(commonData.COLLECTION.INVITATION).insertOne({
                            GID: r.date.data.GID,
                            IID: id,
                            invitor: user.username,
                            email: req.body.email,
                            date: time
                        })
                        let url = `http://${environment.hostname}:${environment.webPort}/invite/${id}`
                        let mail = email.sendEmail({
                            userEmail: req.body.email,
                            invitator: user.username,
                            time: time,
                            url: url,
                            type: 'invite'
                        })
                        if(mail === 0){
                            res.send({
                                code: commonData.CODE.SEND_FAIL,
                                msg: '邮件发送失败，请重新发送'
                              })
                        }else {
                            token.getToken({
                                UID: UID,
                                GID: r.date.data.GID
                            }).then(r=>{
                                console.log(r)
                                res.send({
                                    code: commonData.CODE.SUCCESS,
                                    data:{
                                        token: r,
                                    },
                                    msg: '邀请邮件发送成功√'
                                })
                            })
                        }
                    })
                }else{
                    token.getToken({
                        UID: UID,
                        GID: r.date.data.GID
                    }).then(r=>{
                        console.log(r)
                        res.send({
                            code: commonData.CODE.DATA_ERROE,
                            data:{
                                token: r,
                            },
                            msg: '此成员已被邀请'
                        })
                    })
                }
               
            } catch (error) {
                console.error(err)
                res.send({
                    code: commonData.CODE.DB_ERROR,
                    msg: '查询数据库失败！'
                })
            }    
        }
    })
}

let insertUserToGroup = async function(data){
    let DB = mongo.getDB()
    DB.collection(commonData.COLLECTION.GROUP).updateOne({
        GID: data.GID,
    },{
        $push: {
            "user": {
                UID: data.user.UID,
                role: 'ordinary',
                name: data.user.username,
                email: data.user.email
            }
        }
    })
    try {  
        let user = await DB.collection(commonData.COLLECTION.UG).findOne({
            UID: data.user.UID
        })
        if(!user){
            DB.collection(commonData.COLLECTION.UG).insertOne({
                UID: data.user.UID,
                GID: [data.GID]
            })
        }else{
            DB.collection(commonData.COLLECTION.UG).updateOne({
                UID: data.user.UID
            },{
                $push: {
                    "GID": data.GID
                }
            })
        }
    } catch (error) {
        
    }
}

let inviteEffective = async function(req, res){
    let DB = mongo.getDB()
    try {
        let r = await DB.collection(commonData.COLLECTION.INVITATION).findOne({
            IID: req.body.id,
            email: req.body.email
        })
        if(!r){
            res.send({
                code: commonData.CODE.DATA_ERROE,
                msg: '邮箱错误或链接地址被篡改'
            })
            return
        }
        let time = new Date().getTime()
        if(time - r.date.getTime() > 1000 * 60 * 30){
            DB.collection(commonData.COLLECTION.INVITATION).deleteOne({
                IID: req.body.id,
                email:  req.body.email
            })
            return {
            code: commonData.CODE.INVALID,
            msg: '链接已失效！'
            }
        }
        let user = await DB.collection(commonData.COLLECTION.USER).findOne({
            email: req.body.email
        })
        if(!user){
            res.send({
                code: commonData.CODE.INVALID,
                msg: '此用户未注册，请先进行注册，然后再通过访问此链接加入该组'
            })
            return
        }
        DB.collection(commonData.COLLECTION.INVITATION).deleteOne({
            IID: req.body.id,
            email:  req.body.email
        })
        insertUserToGroup({
            user: user,
            GID: r.GID
        })
        res.send({
            code: commonData.CODE.SUCCESS,
            msg: '加入组成功√'
        })
    } catch (error) {
        console.error(error)
        res.send({
            code: commonData.CODE.DB_ERROR,
            msg: '查询数据库失败！'
        })
    }
}

let getGroupMember = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            try {
                if(!r.date.data.GID){
                    res.send({
                        code: commonData.CODE.VIRES,
                        msg: '数据解析错误，请刷新重试！'
                    })
                    return
                }
                let members = await DB.collection(commonData.COLLECTION.GROUP).findOne({
                    GID: r.date.data.GID
                })
                
                let UID = r.date.data.UID.UID || r.date.data.UID
                token.getToken({
                    UID: UID,
                    GID: r.date.data.GID
                  }).then(r=>{
                    console.log(r)
                    res.send({
                      code: commonData.CODE.SUCCESS,
                      data:{
                        token: r,
                        members: members.user,
                      }
                  })
                })
            } catch (error) {
                res.send({
                    code: commonData.CODE.DB_ERROR,
                    msg: '查询数据库失败！'
                })
            }
        }
    })
}

let deleteUserFromGroup =  function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            try {
                let UID = r.date.data.UID.UID || r.date.data.UID
                let group = await DB.collection(commonData.COLLECTION.GROUP).findOne({
                    GID: r.date.data.GID
                })
                let handler = group.user.find(ele=>ele.UID=UID)
                if(handler.role !== commonData.ROLE.CREATOR && handler.role !==  commonData.ROLE.ADMINISTRATION){
                    res.send({
                        code: commonData.CODE.VIRES,
                        msg: '此用户没有权限'
                    })
                    return
                }
                let user = req.body.UID
                DB.collection(commonData.COLLECTION.GROUP).updateOne({
                    GID: r.date.data.GID
                },{
                    $pull: {
                        "user": {
                            UID: user
                        }
                    }
                })
                DB.collection(commonData.COLLECTION.UG).updateOne({
                    UID: user
                },{
                    $pull: {
                        "GID": r.date.data.GID
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
                        token: r,
                        members: members.user,
                      },
                      msg: '删除成功√'
                  })
                })
            } catch (error) {
                console.error(err)
                res.send({
                    code: commonData.CODE.DB_ERROR,
                    msg: '查询数据库失败！'
                })
            }
        }
    })
}

let upgradeMember = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        let UID = r.date.data.UID.UID || r.date.data.UID
        let group = await DB.collection(commonData.COLLECTION.GROUP).findOne({
            GID: r.date.data.GID
        })
        let handler = group.user.find(ele=>ele.UID=UID)
        if(handler.role !== commonData.ROLE.CREATOR && handler.role !==  commonData.ROLE.ADMINISTRATION){
            res.send({
                code: commonData.CODE.VIRES,
                msg: '此用户没有权限'
            })
            return
        }
        DB.collection(commonData.COLLECTION.GROUP).updateOne({
            GID: r.date.data.GID,
            'user.UID': req.body.UID
        },{
            $set: {'user.$.role': commonData.ROLE.ADMINISTRATION}
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
              msg: '设置管理员职位成功√'
          })
        })
    })
}

let downgradeMember = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token: req.headers.token
    }).then(async r=>{
        let UID = r.date.data.UID.UID || r.date.data.UID
        let group = await DB.collection(commonData.COLLECTION.GROUP).findOne({
            GID: r.date.data.GID
        })
        let handler = group.user.find(ele=>ele.UID=UID)
        if(handler.role !== commonData.ROLE.CREATOR){
            res.send({
                code: commonData.CODE.VIRES,
                msg: '此用户没有权限'
            })  
            return
        }
        DB.collection(commonData.COLLECTION.GROUP).updateOne({
            GID: r.date.data.GID,
            'user.UID': req.body.UID
        },{
            $set: {'user.$.role': commonData.ROLE.ORDINARY}
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
              },
              msg: '取消管理员职位成功√'
          })
        })
    })
}

module.exports = {
    getUserGroups: getUserGroups,
    inviteUser: inviteUser,
    inviteEffective: inviteEffective,
    getGroupMember: getGroupMember,
    deleteUserFromGroup: deleteUserFromGroup,
    upgradeMember: upgradeMember,
    downgradeMember: downgradeMember
}