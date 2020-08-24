const mongo = require('./public/mongoDB')
const { v4: uuidv4 } = require('uuid');

let insertTag = function(req, res){
    let DB = mongo.getDB()
    let TID = uuidv4()
    DB.collection('tag').insertOne({
        TID: TID,
        name: req.body.name,
        color: req.body.color,
        state: req.body.state
    })
    res.send({
        code: 100,
        data: {
            TID: TID
        },
        msg: '创建成功√'
    })
}

let deleteTag = function(req, res){
    let DB = mongo.getDB()
    DB.collection('tag').deleteOne({
        TID: req.body.TID
    })
    res.send({
        code: 100,
        msg: '删除成功√'
    })
}

let modifyTag = function(req, res){
    let DB = mongo.getDB()
    DB.collection('tag').updateOne({
        TID: req.body.TID
    },{
        $set: {
            name: req.body.name,
            color: req.body.color,
            state: req.body.state
        }
    })
    res.send({
        code: 100,
        msg: '删除成功√'
    })
}

let findTag = async function(req, res){
    let DB = mongo.getDB()
    try {
        let tag = await DB.collection('tag').find({
            name: {
                $regex: new RegExp(req.body.name)
            }
        }).toArray()
        res.send({
            code: 100,
            data: tag
        })
    } catch (error) {
        res.send({
            code: 200,
            msg: '数据库查询错误'
        })
    }
}

let getTag = async function(req, res){
    let DB = mongo.getDB()
    try {
        let index = req.query[0].lastIndexOf('=')
        let data= req.query[0].substr(index+1, req.query[0].length)
        let tag = await DB.collection('tag').find().limit(parseInt(data)).toArray()
        res.send({
            code: 100,
            data: tag
        })
    } catch (error) {
        res.send({
            code: 200,
            msg: '数据库查询错误'
        })
    }
}

module.exports = {
    insertTag: insertTag,
    deleteTag: deleteTag,
    modifyTag: modifyTag,
    getTag: getTag,
    findTag: findTag
}