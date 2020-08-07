const commonData = require('../public/DATA')
const fs = require('fs')
const token = require('../public/token')
const mongo = require('../public/mongoDB')

let billUpdate = function(req, res, nexr){
    let DB = mongo.getDB()
    token.verifyToken({
        token:req.headers.token
     }).then(async r => {
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            if(req.file === undefined){
                res.send({
                    code: commonData.CODE.NO_FILE,
                    msg: '文件接收失败！'
                })
                return 
            }
            let imageType = req.file.mimetype
            imageType = imageType.split('/')[1]
            if(commonData.IMAGETYPE.indexOf(imageType) < 0){
                res.send({
                    code: commonData.CODE.ERROR_IMAGE_TYPE,
                    msg: '图片格式不正确，请重新上传正确格式的图片！'
                })
                return
            }
            if(req.file.size > commonData.MAX_IMAGE_SIZE){
                res.send({
                    code: commonData.CODE.MAX_IMAGE_LIMIT,
                    msg: '图片超出内存，请压缩后重新上传！'
                })
                return 
            }
            token.getToken({
                UID: r.date.data.UID.UID
              }).then(r=>{
                res.send({
                  code: commonData.CODE.SUCCESS,
                  data:{
                    token: r,
                    path: req.file.path
                  },
                  msg: '新建成功！'
              })
            })
        }
     })
}

let billDelete = function(req, res){
    let DB = mongo.getDB()
    token.verifyToken({
        token:req.headers.token
     }).then(async r => {
        if(r.code !== commonData.CODE.SUCCESS){
            res.send(r)
        }else{
            fs.unlink(req.body.path, function(err){
                if(err){
                 throw err;
                }
                token.getToken({
                    UID: r.date.data.UID.UID
                  }).then(r=>{
                    res.send({
                      code: commonData.CODE.SUCCESS,
                      data:{
                        token: r,
                      },
                      msg: '文件删除成功！'
                  })
                })
            })
        }
    })
}

module.exports = {
    billUpdate: billUpdate,
    billDelete: billDelete
}