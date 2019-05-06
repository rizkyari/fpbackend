const router = require('express').Router()
const bcrypt = require('bcryptjs')
const isEmail = require('validator/lib/isEmail')
const conn = require('../connection/connection')
const {sendVerify} = require('../emails/nodemailer.js')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname + '/../uploads' )
console.log(__dirname);

const storagE = multer.diskStorage({
    // Destination
    destination : function(req, file, cb) {
        cb(null, uploadDir)
    },
    // Filename
    filename : function(req, file, cb) {
        cb(null, Date.now() + file.fieldname + path.extname(file.originalname))
    }
})

const upstore = multer ({
    storage: storagE,
    limits: {
        fileSize: 10000000 // Byte
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ // will be error if the extension name is not one of these
            return cb(new Error('Please upload image file (jpg, jpeg, or png)')) 
        }

        cb(undefined, true)
    }
})

//Upload Ava
router.post('/upstore', upstore.single('avatar'), (req, res) => {
    console.log(req.file);
    // console.log(req.body);
    
    const sql = `SELECT * FROM users WHERE username = ?`
    const sql2 = `UPDATE users SET avatar = '${req.file.filename}' WHERE username = ?`
    const data = req.body.uname

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)

        conn.query(sql2, data, (err , result) => {
            if (err) return res.send(err)


            res.send({filename: req.file.filename})
        })
    })
})

//GET USER by USERNAME
router.get('/users/:username', async(req,res)=>{
    const{username}=req.params
    var sql = `SELECT * FROM users where username ='${username}';`

    conn.query(sql, (err,result)=>{
        if(err) return res.send(err)

        return res.send(result)
            // if(!result[0].avatar) return res.send({user:result[0]})
            // return res.send({user:result[0], photo:`http://localhost:2010/upstore/${result[0].avatar}`})
        
    })
})

//DELETE AVATAR
router.post('/users/avatar', (req, res)=>{
    const {username} = req.body
    console.log(req.body);
    var sql = `SELECT * FROM users WHERE username ='${username}'`
    var sql2= `UPDATE users SET avatar = NULL WHERE username ='${username}'`

    conn.query(sql, (err,result)=>{
        if(err) return res.send(err)
        // const img = await res.send(result[0].avatar)
            var ava = result[0].avatar
                fs.unlink(`${uploadDir}/${ava}`, (err) => {
                    if (err) return res.send(err);

                        conn.query(sql2, (err,result)=>{
                            if(err)return res.send(err)
                        })
                    res.send({result:result[0],
                        message:'berhasil hapus avatar'})
                  });
                })
            })

//GET LINK AVATAR
router.get('/upstore/:photo', (req, res)=>{
    const options = {
        root: uploadDir
    }
    var fileName = req.params.photo
    res.sendFile(fileName, options, (err, result) => {
        if (err) return res.send(err)

        console.log('Sent: ', fileName);
        
    })
    //cara 2
    res.sendFile(`${uploadDir}/${req.params.photo}`)
})


//CREATE USERS
router.post('/users', async (req, res)=>{
    // const{username, name, email, password}=req.body
    // var sql = `INSERT INTO users (nama, age) VALUES ('${nama}', ${age});`
    var sql= `INSERT INTO users SET ?;`
    var sql2 = `SELECT * FROM users;`
    
    var arrBody = Object.keys(req.body) 
    //mengubah nilai string kosong menjadi null
    arrBody.forEach(key => {  // menghapus field yang tidak memiliki data
        if(!req.body[key]) {
            req.body[key] = null
        }       
    })
    var data = req.body

    if(!req.body.email || !isEmail(req.body.email)) return res.send("Email is not valid")

    req.body.password = await bcrypt.hash(req.body.password, 8)

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)// supaya mengirim error ke postman, bukan ke node js dan memberhentikan API
        //error pada post data

        sendVerify(req.body.username, req.body.name, req.body.email)
        return res.send(result)
    })
})

//VERIFY LOGIN
router.get('/verify/:username', (req, res) => {
    const username = req.params.username
    const sql = `UPDATE users SET verified = true WHERE username = '${username}'`
    const sql2 = `SELECT * FROM users WHERE username = '${username}'`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err.sqlMessage)

        conn.query(sql2, (err, result) => {
            if(err) return res.send(err.sqlMessage)

            res.send('<h1>Verifikasi berhasil</h1>')
        })
    })
})

//LOGIN
router.post('/users/login', (req,res)=>{
    const {username, password} = req.body
    var sql = `SELECT * FROM users WHERE username = '${username}';`
    
    
        conn.query(sql, async (err, result) => {
            if (err) return res.send(err)
            // res.send(result)

            if(!result[0]) return res.send("User Not Found")
            // supaya mengirim error ke postman, bukan ke node js dan memberhentikan API
            //error pada post data
            const user = result[0]
            const isMatch = await bcrypt.compare(password, user.password)//kiri yg diinput user, kanan yg di db

            if (!isMatch) return res.send('Username and password not match')

            if (user.verified) return res.send(result)
            return res.send("verified dulu")
            
        })
})

//DELETE
router.delete('/users/:userid', (req, res)=>{
    const {userid} = req.params
    var sql = `DELETE FROM users WHERE id IN (${userid});`
    var sql2 = `SELECT * FROM users;`

    conn.query(sql, (err, result) => {
        if(err) throw err
        conn.query(sql2, (err, result) => {
            if(err) throw err
            res.send(result)
        })
    })
})

//EDIT Profile(25/4)
router.post('/editprofile/:user_id', upstore.single('avatar'),async (req, res) => { // Update Profile
    const{user_id} = req.params
    var arrBody = Object.keys(req.body) // ['nama', 'email', 'age']

    arrBody.forEach(key => {  // menghapus field yang tidak memiliki data
        if(!req.body[key]) {
            delete req.body[key]
        }       
    })
    if(req.body.password){
         req.body.password = await bcrypt.hash(req.body.password, 8)
    }
    //GAPAKE
    // const updates = Object.keys(req.body)  // array baru setelah filtering (delete)  
    // const allowedUpdates = ['first_name', 'last_name', 'email', 'password', 'avatar'] // field yang boleh di update
    // const isValidOperation = updates.every(update => allowedUpdates.includes(update)) // Check field yg di input user

    // if(!isValidOperation) { // jika invalid
    //     throw new Error("Invalid Request")
    // }

    //? akan update sesuai data yg ada
    const data = req.body
        var sql = `UPDATE users SET ? WHERE id=${user_id};`
        var sql2 = `SELECT * FROM users WHERE id=${user_id};`
        // var sql2 = `UPDATE users SET avatar = '${req.file.filename}' WHERE id=${user_id};`
        conn.query(sql, data, (err, result) => {
            if(err) return res.send('Error1')

                conn.query(sql2, data, (err, result) => {
                    if(err) return res.send(err)

                    return res.send(result)
                })
        
                
            // return res.send(result)
       })


})

module.exports = router