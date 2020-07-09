const { v4: uuidv4 } = require('uuid');
const mongo = require('./mongoDB')

let getCode = function(size){
    let code = ""
    for(let i=0;i<size;i++){
        code += Math.floor(Math.random() * 10);
    }
    console.log(code)
    return code
}

let getID = async function(data){
    let DB = mongo.getDB()
    let uuid
    while(true){
        uuid = uuidv4()
        let attribute = data.attribute
        let res
        try{
            res = await DB.collection(data.collection).find({
                attribute: uuid
            }).toArray()
        } catch (err){
            console.error(err)
        }
        if(res.length === 0){
            break
        }
    }
    console.log(uuid)
    return uuid
}

module.exports = {
    getCode: getCode,
    getID: getID
}