const mongoClient = require('mongodb').MongoClient
const commonData = require('../public/DATA')
let DB

function init(){
    mongoClient.connect('mongodb://127.0.0.1:27017', { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db){
        if(err) throw err
        DB = db.db('bookkeeping')
        console.log( parseInt(commonData.CODE_EXPIRE_TIME))
        DB.collection('code').dropIndex({
            "time": 1 
        })
        
        DB.collection('code').createIndex({
            "time": 1
          },{
            expireAfterSeconds: parseInt(commonData.CODE_EXPIRE_TIME)
          },{
            backgroup: true
          })

          DB.collection('token').createIndex({
            "time": 1
          },{
            expireAfterSeconds: parseInt(commonData.CODE_EXPIRE_TIME)
          },{
            backgroup: true
          })
      })
      
} 

 function getDB(){
    return DB
}

module.exports = {
    init,
    getDB
}
