const express = require('express')
const router = express.Router()
const uploadFile = require('../models/fileUpload')
const taskList = require('../models/taskList')
//const teams = require('../models/createTeam')
const { ensureAuthenticated } = require('../config/auth')
const nodemailer = require('nodemailer')
const multer = require('multer')
const path = require('path')
const emailHelpers = require('../config/emailHelper')
const uploadPath = path.join('public', uploadFile.fileBasePath)
const upload = multer({
    dest: uploadPath
})


//DASHBOARD ROUTE
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('0').where('archive').equals(null).sort({uploadDate: 'desc'}).limit(20)
    let docQuery = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('0').where('archive').equals(null).where('mimeCategory').equals('document').sort({uploadDate: 'desc'}).limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    else if (req.query.mimeCategory != null && req.query.mimeCategory !== '' ) {
        query = query.regex('mimeCategory', new RegExp(req.query.mimeCategory, 'i'))
    }
        try {
        const files = await query.exec()
        const tasks = await tasksList.exec()
            res.render('dashboard', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                userid: req.user._id,
                //files: file,
                tasks: tasks,
                files: files,
                searchOptions: req.query
            })
        } catch (error) {
            console.log(error)
        }
})


//DASHBOARD RECENT ROUTE
router.get('/dashboard/recent', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('0').sort({uploadDate: 'desc'}).limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
        try {
        const files = await query.exec()
        const tasks = await tasksList.exec()
            res.render('dashboard_recents', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                //files: file,
                tasks: tasks,
                files: files,
                searchOptions: req.query
            })
        } catch (error) {
            console.log(error)
        }
})

//DASHBOARD TODO LIST ROUTE
router.post('/taskToDo', async (req, res) =>{
    //res.send(req.body.taskName)
    const task = new taskList({
        creatorEmail: req.user.email,
        taskName: req.body.taskName
    })
    try {
        const newTask = task.save()
        res.redirect('dashboard')
    } catch (error) {
        console.log(error)
    }
})

//DASHBOARD TODO LIST DELETE ROUTE
router.delete('/:id/deleteTask', async (req, res) => {
    let task
    try {
        task = await taskList.findById(req.params.id)
        await task.remove()
        res.redirect('/uploadFile/dashboard')
    } catch {
        if (task == null) {
            res.send('Task is null')
        }
        else {
            res.send('error in deleting task')
        }
    }
})

//DASHBOARD FAVROUITES ROUTE
router.get('/dashboard/favourite', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('favourite').equals('1').where('delete').equals('0').sort({uploadDate: 'desc'}).limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    try {
    const files = await query.exec() //uploadFile.find({  })
    const tasks = await tasksList.exec()
        res.render('dashboard_favourite', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            tasks: tasks,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

//DASHBOARD PROJECTS ROUTE (ADD LATER)
/* router.get('/dashboard/projects', ensureAuthenticated, async (req, res) => {
    let query = teams.find().where('participants').equals(req.user.email).limit(10)
    if (req.query.projectName != null && req.query.projectName !== '' ) {
        query = query.regex('projectName', new RegExp(req.query.projectName, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    try {
    const teams = await query.exec() //uploadFile.find({  })
    res.render('dashboard_project', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            teams: teams,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
}) */

/* router.get('/dashboard/projects', ensureAuthenticated, async (req, res) => {
    let query = projects.find().where('email').equals(req.user.email).where('delete').equals('0').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.projectName != null && req.query.projectName !== '' ) {
        query = query.regex('projectName', new RegExp(req.query.projectName, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    try {
    const files = await query.exec() //uploadFile.find({  })
        res.render('dashboard', {
            firstname: req.user.firstname,
            profilePicPath: req.user.profilePicPath,
            //files: file,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
}) */

//DASHBOARD ARCHIVE ROUTE
router.get('/dashboard/archives', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('archive').equals('1').where('delete').equals('0').sort({uploadDate: 'desc'}).limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
    const files = await query.exec()
    const tasks = await tasksList.exec()
        res.render('dashboard_archive', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            tasks: tasks,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

//DASHBOARD WORK ROUTE
router.get('/dashboard/work', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('category').equals('work').where('delete').equals('0').sort({uploadDate: 'desc'}).limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
    const files = await query.exec() //uploadFile.find({  })
    const tasks = await tasksList.exec()
        res.render('dashboard_work', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            tasks: tasks,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

//DASHBOARD PERSONAL ROUTE
router.get('/dashboard/personal', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('category').equals('personal').where('delete').equals('0').sort({uploadDate: 'desc'}).limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
    const files = await query.exec() //uploadFile.find({  })
    const tasks = await tasksList.exec()
        res.render('dashboard_personal', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            tasks: tasks,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

//DASHBOARD OTHER ROUTE
router.get('/dashboard/other', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('category').equals('other').where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
    const files = await query.exec() //uploadFile.find({  })
    const tasks = await tasksList.exec()
        res.render('dashboard_other', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            tasks: tasks,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

//DASHBOARD TRASH ROUTE
router.get('/dashboard/trash', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('1').sort({uploadDate: 'desc'}).limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
    const files = await query.exec() //uploadFile.find({  })
    const tasks = await tasksList.exec()
        res.render('dashboard_trash', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            tasks: tasks,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})




//UPLOAD NEW FILE ROUTE
router.post('/uploadf', upload.single('filename'), async (req, res) =>{
    const fileName = req.file != null ? req.file.filename : null
    const mimeCatergory = req.file.mimetype
    if (mimeCatergory == 'application/msword' || mimeCatergory == 'application/octet-stream' || mimeCatergory == 'application/vnd.ms-excel' || mimeCatergory == 'application/vnd.ms-powerpoint' || mimeCatergory == 'application/pdf' || mimeCatergory == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        mimeType = 'document'
    } else if ( mimeCatergory == 'audio/basic' || mimeCatergory == 'audio/mid' || mimeCatergory == 'audio/mpeg' || mimeCatergory == 'audio/x-wav' || mimeCatergory == 'image/png' || mimeCatergory == 'image/bmp' || mimeCatergory == 'image/ief' || mimeCatergory == 'image/jpeg' || mimeCatergory == 'image/svg+xml' || mimeCatergory == 'video/mp4' || mimeCatergory == 'video/mpeg' || mimeCatergory == 'video/x-msvideo' ) {
        mimeType = 'media'
    } else {
        mimeType = 'other'
    }
    const file = new uploadFile({
        email: req.user.email,
        orignalFileName: req.file.originalname,
        fileName: fileName,
        category: req.body.category,
        notifications: req.body.notify,
        privacy: req.body.privacy,
        description: req.body.desc,
        archive: req.body.archive,
        conseal: req.body.conseal,
        hidden: req.body.hidden,
        favourite: req.body.favourite,
        mimetype: req.file.mimetype,
        mimeCategory: mimeType,
        size: req.file.size
    })
    try {
        const newFile = await file.save()
        //SEND MAIL ON FILE UPLOAD
        if (req.body.notify == "opt2") {

            const options = {
                to: file.email,
                subject: 'File Upload on Cloud Castle.',
                html: '<body style="background: skyblue;"><h1>Thank you for using our service, ' + req.user.firstname + '.</h1> <br> <h3>This mail is to confirm that your file ' + file.orignalFileName + ' has been successfully uploaded.</h3><footer><h4>This is an automatically generated mail. Please do not reply to it.</h4></footer>',
                dsn: {
                    id: 'problems encountered while sending the email. Please contact support for more information.',
                    return: 'headers',
                    notify: ['failure', 'delay'],
                    recipient: 'healthyrythm.mail@gmail.com'
                }
            };
            
            // emailHelpers.sendEmail(options)
        }

        
        res.redirect('dashboard')
    } catch (error) {
        console.log(error)
    }
})



module.exports = router