require('dotenv').config()
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const methodOverride = require('method-override')
const getstarted = require('./routes/getStarted');
const app = express()


//PASSPORT CONFIG
require('./config/passport')(passport)

//DB CONFIG
const db = process.env.Mongo_URI

//CONNECT TO MONGO
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected Successfully to Users MongoDB.'))
    .catch(err => console.log(err))

//mongoose.connect(dbLocal, { useNewUrlParser: true, useUnifiedTopology: true })
//    .then(() => console.log( 'Connected Successfully to Local MongoDB.' ))
//    .catch(err => console.log(err))

//EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

//METHOD OVERRIDING
app.use(methodOverride('_method'))

//BODY-PARSER 
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false, parameterLimit:50000}));
//app.use(express.urlencoded({ extended: false }))

//EXPRESS SESSIONS
app.use(session({
    secret: process.env.expressSession_SECRET,
    resave: true,
    saveUninitialized: true
}))

//PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

//CONNECT FLASH
app.use(flash())

//GLOBAL VARIABLES FOR CUSTOM SUCCESS AND ERROR MESSAGES
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
}) 

//ROUTES
app.use('/', require('./routes/index'))
app.use('/admins', require('./routes/admin'))
app.use('/users', require('./routes/users'))
app.use('/uploadFile', require('./routes/uploadFile'))
app.use('/fileControls', require('./routes/fileControls'))
app.use('/createTeam', require('./routes/createTeam'))
app.use('/getstarted',require('./routes/getStarted'))
app.use(express.static('public'))


const PORT = process.env.PORT || 4000

app.listen(PORT, console.log(`Server listening on Port ${PORT}`))