const sgMail = require('@sendgrid/mail')
const sgAPIKey = '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'

sgMail.setApiKey(sgAPIKey)

sgMail.setApiKey(sgAPIKey)

const sendVerify = (username, name, email) => {
    sgMail.send({
        to: email,
        from : 'osefiskel4@gmail.com',
        subject: "Verikasi Email",
        html: `<h1><a href='http://localhost:2010/verify?username=${username}'>Klik untuk verifikasi</a></h1>`
    })
}

module.exports = {
    sendVerify
}