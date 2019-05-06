const express = require('express')
const cors = require('cors')
const userRouter = require('./routers/userRouter')
const addressRouter = require('./routers/addressRouter')

const app = express()
const port = 2010 // akses dari environment

app.get('/', (req, res) => {
    res.send(`<h1> API RUNNING ON HEROKU PORT ${port} </h1>`)
})

app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(addressRouter)



app.listen(port, ()=>{
    console.log("Running on port:", port);
    
})