const nodemail = require('nodemailer')

/**
 * 
 * @param {*} data 
 * @param {
 *          userEmail: 接收方的email，
 *          subject：发送邮件主题，
 *          code: 验证码，
 *          use: 用处，
 *          time: 发送时间}
 */
let sendEmail =  function(data){
    let transporter = nodemail.createTransport({
        host: 'smtp.qq.com',
        port: 'qq',
        secure: true,
        auth:{
            user: '1578536879@qq.com',
            pass: 'qgsranlceabrbada'
        },
    })
    transporter.sendMail({
        from: 'BookKeeping<1578536879@qq.com>',
        to: data.userEmail,
        subject: data.subject,
        html: `<div style="text-align: center">
                <p>${data.userEmail} 欢迎加入我们</p>
                <span>为了${data.use}您的账号，我们需要验证您的邮箱，请复制验证码到验证框内，验证码在10分钟内有效</span>
                <div>验证码：<span style="font-weight: 700">${data.code}</span></div>
                <span>发送时间：${data.time}</span>
              </div>`
    },(err, res)=>{
        if(err){
            console.error(err)
            return 0
        }else {
            if(res.response === "250 OK: queued as."){
                return 1
            }
        }
    })
}

module.exports = {
    sendEmail: sendEmail
}