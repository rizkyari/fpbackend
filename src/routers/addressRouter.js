const router = require('express').Router()
const conn = require('../connection/connection')
const multer = require('multer')
const path = require('path')

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


//Add address To User
router.post('/address/:user_id', (req, res)=>{
    req.body.user_id = req.params.user_id
    var sql = `INSERT INTO address SET ?;`
    var sql2 = `SELECT * FROM address WHERE user_id IN (${req.body.user_id});`
    var data = req.body

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        conn.query(sql2, (err, result) => {
            if(err) return res.send(err)

            return res.send(result)
        })
    })
})

//Get address with userid
router.get('/address/:user_id', (req, res) => {
    const {user_id} = req.params
    console.log(user_id);
    
    var sql = `SELECT * FROM address WHERE user_id IN (${user_id});`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})

//Delete Task 
router.delete('/tasks/', (req, res) => {
    const {taskid} = req.body
    const {user_id} = req.params
    var sql = `DELETE FROM tasks WHERE user_id IN (${user_id}) && id IN (${taskid});`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})

//Edit task completed
router.patch('/tasks/:taskid', (req, res) => {
    const {completed} = req.body
    const{taskid} = req.params
    // var sql = `SELECT * FROM tasks WHERE id IN (${taskid});`
    var sql2 = `UPDATE tasks SET completed = ${completed} WHERE id IN (${taskid}); `
        
        conn.query(sql2, (err, result) => {
            if(err) return res.send(err)

            res.send(result)
        })
    
})


module.exports = router