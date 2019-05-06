const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'devuser',
    password: 'Mysql123',
    host: 'localhost',
    database: 'dbproject',
    port: '3306'
})

module.exports = conn