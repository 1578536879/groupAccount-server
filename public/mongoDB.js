const mongoClient = require('mongodb').MongoClient
let DB

function init(){
    mongoClient.connect('mongodb://127.0.0.1:27017', { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db){
        if(err) throw err
        DB = db.db('bookkeeping')
      })
} 

 function getDB(){
    return DB
}

module.exports = {
    init,
    getDB
}
