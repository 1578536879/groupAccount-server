const mongo = require('../public/mongoDB')
let billAggregate = async function(startTime, endTime, id, type){
    let DB = mongo.getDB()
    if(type === 'group'){
        try {
            let d = await DB.collection('bill').aggregate([{
                $match: {
                    "date": {
                        $gte: parseInt(startTime),
                        $lt:  parseInt(endTime)
                    },
                    "GID": id
                }
            },{
                $group: {
                    _id: "$type",
                    count: {
                      $sum: "$price"
                    }
                }
            }]).toArray()
            console.log(startTime, endTime, d)
            return d
        } catch (error) {
            console.log(error)
        }
    }else{
        try {
            let d = await DB.collection('bill').aggregate([{
                $match: {
                    "date": {
                        $gte: parseInt(startTime),
                        $lt:  parseInt(endTime)
                    },
                    "UID": id
                }
            },{
                $group: {
                    _id: "$type",
                    count: {
                      $sum: "$price"
                    }
                }
            }]).toArray()
            console.log(startTime, endTime, d)
            return d
        } catch (error) {
            console.log(error)
        }
    }
    
}

let addData = function(data){
    let d = {
        in: 0,
        out: 0
    }
    if(data.length !== 0){
        data.forEach(element => {
            if(element._id){
                d.in = element.count
            }else{
                d.out = element.count
            }
        });
    }
    return d
}

let billStatistics = async function(data){
    let date = data.time
    let priceIn = [], priceOut = []
    let index = 0
    let type = data.type
    let id = data.UID || data.GID
    let dd = '', d = ''
    if(data.datePicker === 'week'){
        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

    }else if(data.datePicker === 'month'){
        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        if(index < date.length){
            d = await billAggregate(date[index], date[++index], id, type);
            dd = addData(d)
            priceIn.push(dd.in)
            priceOut.push(dd.out)
        }
        
        if(index < date.length){
            d = await billAggregate(date[index], date[++index], id, type);
            dd = addData(d)
            priceIn.push(dd.in)
            priceOut.push(dd.out)
        }
    }else if(data.datePicker === 'year'){
        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        let d = await billAggregate(date[index], date[++index], id, type)
        let dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type)
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)

        d = await billAggregate(date[index], date[++index], id, type);
        dd = addData(d)
        priceIn.push(dd.in)
        priceOut.push(dd.out)
    }
    return {
        in: priceIn,
        out: priceOut
    }
}

module.exports = {
    billStatistics: billStatistics
}