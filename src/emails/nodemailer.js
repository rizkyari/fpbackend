const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'hanif.hkim@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
})

const sendVerify = (username, name, email) => {
    const mail = {
        from: 'Haniful Hakim <hanif.hkim@gmail.com>',
        to: email,
        subject: 'JOBS',
        html: `<h1> <a href ='http://localhost:2010/verify/${username}'> Klik verif</a> </h1>`
    }
    transporter.sendMail(mail, (err, res)=>{
        if(err) return console.log(err.message);
    
        console.log('EMail terkirim');
    })
    
}

module.exports={
    sendVerify
}
