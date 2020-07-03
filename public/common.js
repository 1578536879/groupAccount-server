let getCode = function(size){
    let code = ""
    for(let i=0;i<size;i++){
        code += Math.floor(Math.random() * 10);
    }
    console.log(code)
    return code
}

module.exports = {
    getCode: getCode
}