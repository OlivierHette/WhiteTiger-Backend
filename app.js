const { urlencoded }    = require('express')
const express           = require('express')
const mongoose          = require('mongoose')
const path              = require('path')
const dotenv            = require('dotenv')

const userRoutes        = require('./routes/user')
const postRoutes        = require('./routes/post')

const app               = express()

dotenv.config()

const uri = process.env.MONGOOSE_URI

mongoose.connect(uri,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('\u001b[' +33+ 'm'+'[MongoDB] Connexion successfull !'+'\u001b[0m'))
  .catch(() => console.log('\u001b[' +31+ 'm'+'[MongoDB] Connexion failed !'+ '\u001b[0m'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    next()
})

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/api/auth', userRoutes)
app.use('/api/posts', postRoutes)

module.exports = app