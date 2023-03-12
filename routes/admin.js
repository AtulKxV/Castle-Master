const express = require('express')
const router = express.Router()
const Admin = require('../models/administrator')
const User = require('../models/Users')
const userDeletion = require('../models/deleteUserModel')
const helpMessages = require('../models/getHelpModel')
const taskList = require('../models/taskList')
const getHelp = require('../models/getHelpModel')
const uploadFile = require('../models/fileUpload')
const { check, validationResult } = require('express-validator');
const emailHelpers = require('../config/emailHelper')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')
const passport = require('passport')
const nodemailer = require('nodemailer')
const { ensureAdminAuthenticated } = require('../config/authAdmin')
const uploadPath = path.join('public', User.profilePicBasePath)
const multer = require('multer')
const imageMimeTypes = ['image/jpeg', 'image/png']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

router.get('/admin', (req, res) => {
    res.render('adminLoginPage')
})

router.post('/adminLoginForm', (req, res, next) => {
    passport.authenticate('adminLogin', {
        successRedirect: '/admins/adminDashboard',
        failureRedirect: '/admins/admin',
        failureFlash: true
    }) (req, res, next)
})

//ADMIN DASHBOARD ROUTE
router.get('/adminDashboard', ensureAdminAuthenticated, async (req, res) => {
    let query = User.find().limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    
        try {
        const users = await query.exec()
        const tasks = await tasksList.exec()
            res.render('adminDashboard', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                userid: req.user._id,
                //files: file,
                tasks: tasks,
                users: users,
                searchOptions: req.query
            })
        } catch (error) {
            console.log(error)
        }
})

//CHANGE DISPLAY SETTINGS ROUTE
router.get('/adminSettings', ensureAdminAuthenticated, async (req, res) => {
    let query = User.find().limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    try {
        const users = await query.exec()
        const tasks = await tasksList.exec()
            res.render('adminDisplaySettings', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                tasks: tasks,
                users: users,
                searchOptions: req.query
            })
        } catch (error) {
            console.log(error)
        }
})


//REGISTER HANDLE
router.post('/adminRegister', upload.single('profilePic'), [/* check('email').isEmail().withMessage("Please emter valid Email Address."), */ check('password').isLength({ min: 8 }).withMessage("length should be atleast 8 chars").isAlphanumeric()], async (req, res) =>{ 
    let errors = []
    const password = req.body.password
    const email = req.body.email
    const hashedPassword = await bcrypt.hash(password, 10)
    const profilePicName = req.file != null ? req.file.filename : null
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone,
        company: req.body.company,
        email: email,
        city: req.body.city,
        state: req.body.state,
        postcode: req.body.postcode,
        country: req.body.country,
        password: hashedPassword,
        profilePicName: profilePicName
    })
    
    // CHECK REQUIRED FIELDS
    if(!user.firstname || !user.lastname || !email || !password ){
        errors.push({ msg: 'Please fill all fields.' })
    }

    //CHECK IS EMAIL IS VALID
    const error = validationResult(req)
    if (!error.isEmpty()) {
        errors.push ({ msg: "Please refer to the note while creating password and try again." })
    }
    //CHECK IF BOTH PASSWORDS MATCH
    if(password !== req.body.password_2) {
        errors.push({ msg: 'Passwords do not match.' })
    }

    /* //CHECK IF PASSWORD IS 6 CHAR LONG
    const errorp = validationResultPassword(req)
    if (!errorp.isEmpty()) {
        errors.push({ msg: 'Please enter a valid Email Address.' })
    } */
    
    /* const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(422).json({ errors: error.array() })
    } */

    //CHECK FOR PROFILE PIC
    if (profilePicName == null) {
        removeProfilePic(profilePicName)
    }

    //check if email is already registered
    let emailCheckQuery = User.findOne().where('email').equals(req.body.email).countDocuments().exec()
    const emailCount = await emailCheckQuery
    if(emailCount !== 0 ) {
        errors.push({ msg: 'Email already exists' })
    }
    
    if (errors.length > 0) {
        res.render('register', ({ user: user, errors }))
    } else {
        try {
            const newUser = await user.save()
            res.redirect('/admins/adminDashboard')
        } catch {
            res.redirect('/admins/adminDashboard#createNewUserModal', {
                errors
            }) 
            errors.push({ msg: 'Error Creating User.' }) 
        }
    }
})

function removeProfilePic(profilePicName) {
    fs.unlink(path.join(uploadPath, profilePicName), err => {
        if (err) console.error(err)
    })
}


//DEMO REGISTER HANDLE
router.post('/adminDemoRegister', async (req, res) =>{ 
    let errors = []
    const password = 'm'
    const email = 'demoUSER@demo.com'
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
        firstname: 'demo',
        lastname: 'user',
        phone: '9855555555',
        company: 'cloudcastle',
        email: email,
        city: 'Berlin',
        state: 'Tokyo',
        postcode: '401107',
        country: 'Foreign',
        password: hashedPassword
    })

    try {
        const newUser = await user.save()
        res.redirect('/admins/adminDashboard')
    } catch {
        res.redirect('/admins/adminDashboard#createNewUserModal', {
            errors
        })
        errors.push({ msg: 'Error Creating User.' }) 
    }
})


//ADMIN DASHBOARD TODO LIST ROUTE
router.post('/taskToDo', async (req, res) =>{
    const task = new taskList({
        creatorEmail: req.user.email,
        taskName: req.body.taskName
    })
    try {
        const newTask = task.save()
        res.redirect('adminDashboard')
    } catch (error) {
        console.log(error)
    }
})

//ADMIN DASHBOARD TODO LIST DELETE ROUTE
router.delete('/:id/deleteTask', async (req, res) => {
    let task
    try {
        task = await taskList.findById(req.params.id)
        await task.remove()
        res.redirect('/admins/adminDashboard')
    } catch {
        if (task == null) {
            console.log('The task you are trying to delete is null.')
        }
        else {
            res.send('error in deleting task')
        }
    }
})


//DELETE USERS PERMANENTLY FROM DB
router.delete('/deleteUser', async (req, res) => {
    let users
    try {
        users = await User.findById(req.body.deleteUserId)
        await users.remove()
        res.redirect('/admins/adminDashboard')
    } catch {
        if (users == null) {
            console.log('User does not exist.')
        }
        else {
            res.send('Error deleting file')
        }
    }
})

//DELETE USERS FILES PERMANENTLY
router.delete('/permanentDeleteData', async (req, res) => {
    let fileErrors = []
    let file
    try {
        file = await uploadFile.find().where('email').equals(req.body.deleteDataEmail)
        file.forEach(deletefileName => {
            fs.unlink(__dirname + '../../public/uploads/uploadedFiles/' + deletefileName.fileName, (err) => {
                if (err) console.log(err)
            })
            deletefileName.remove()
        });
        res.redirect('/admins/adminDashboard')
    } catch {
        if (file == null) {
            res.send('File is null')
            //fileErrors.push({ message: 'File not found.' }) 
        }
        else {
            res.send('Error deleting file')
            //fileErrors.push({ message: 'Error deleting file.' }) 
        }
    }
})

//DELETE FLAGGED USERS PERMANANTLY FROM DB ROUTE
router.delete('/deleteFlaggedUser', async (req, res) => {
    let users
    let usersEntry
    try {
        users = await User.deleteOne().where('email').equals(req.body.deleteUserEmail)
        usersEntry = await userDeletion.findById(req.body.deleteUserId)
        await usersEntry.remove()
        res.redirect('/admins/adminShowUserDeletionPage')
    } catch (error) {
        console.log(error)
    }
})



// BLOCK/PERMIT USERS ROUTE
router.put('/userAccess', async(req, res) =>{
    let user
    try {
        user = await User.findById(req.body.userAccessId)
        user.access = req.body.userAccess
        await user.save()
        res.redirect(`/admins/adminDashboard`)
    } catch {
        if (user == null) {
            //res.redirect('../dashboard')
            res.send('User is null')
        }
        else {
            res.send('Error adding to access list.')
        }
    }
})

//UPDATE USER PROFILE ROUTE
router.post('/editUserProfile',upload.single('profilePic'), async(req, res) =>{
    let query = User.find().limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    let errors = []
    let editUser
    try {
        editUser = await User.findById(req.body.userid)
        editUser.firstname = req.body.firstname,
        editUser.lastname = req.body.lastname,
        editUser.post = req.body.post,
        editUser.phone = req.body.phone,
        editUser.company = req.body.company,
        editUser.city = req.body.city,
        editUser.postcode = req.body.postcode,
        editUser.country = req.body.country

        //check if email is already registered
        let editEmailCheckQuery = User.findOne().where('email').equals(req.body.email).countDocuments().exec()
        const editEmailCount = await editEmailCheckQuery
        if(editEmailCount !== 0 && editEmail !== req.user.email ) {
            errors.push({ msg: 'Oops! There is an existing account with this email. Please try again.' })
        }
    } catch {
        if (editUser == null) {
            errors.push({ msg: 'User not found. Plese contact help.' })
        } else {
            errors.push({ msg: 'Problem encountered while updating information. Please try again.' })
        }
    }

    if (errors.length > 0) {
        const users = await query.exec()
        const tasks = await tasksList.exec()
        res.render('adminDashboard', ({ 
            errors,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            userid: req.user._id,
            //files: file,
            tasks: tasks,
            users: users,
            searchOptions: req.query
         }))
    } else {
        await editUser.save()
        res.redirect(`/admins/adminDashboard`)
    } 
})

router.get('/adminShowUserDetails', ensureAdminAuthenticated, async (req, res) => {
    let query = User.find().limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    let currentUsersCount = User.find().where('post').equals('User').countDocuments()
    let currentOnlineUsersCount = User.find().where('status').equals('1').countDocuments()
    let currentBannedUsersCount = User.find().where('access').equals('1').countDocuments()
    let currentDeletionUsersCount = User.find().where('access').equals('2').countDocuments()
    let fileCount = uploadFile.find().countDocuments()

    //total size
    uploadFile.aggregate([
        {$group: {_id: null,total: {$sum: "$size" }}}
    ], (err, resultTotal) => {
        if (err) {
            console.log(err)
            return
        }
        totSize = resultTotal
    })

    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    
        try {
            const UsersCount = await currentUsersCount.exec()
            const OnlineUsersCount = await currentOnlineUsersCount.exec()
            const BannedUsersCount = await currentBannedUsersCount.exec()
            const FlaggedUsersCount = await currentDeletionUsersCount.exec()
            const totalSize = await totSize
            const totalfileCount = await fileCount.exec()
            const tasks = await tasksList.exec()
            res.render('UserDetails', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                //files: file,
                tasks: tasks,
                UsersCount: UsersCount,
                BannedUsersCount: BannedUsersCount,
                FlaggedUsersCount: FlaggedUsersCount,
                OnlineUsersCount: OnlineUsersCount,
                totalSize: totalSize,
                fileCount: totalfileCount,
                searchOptions: req.query
            })
        } catch (error) {
            console.log(error)
        }
})

//USER DELETION ROUTE
router.get('/adminShowUserDeletionPage', ensureAdminAuthenticated, async (req, res) => {
    let query = userDeletion.find().limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }       

    try {
        const users = await query.exec()
        const tasks = await tasksList.exec()
            res.render('userDeletionPage', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                tasks: tasks,
                users: users,
                searchOptions: req.query
            })
        } catch (error) {
            console.log(error)
        }
})

//APPLICATION DETAILS ROUTE
router.get('/applicationDetails', ensureAdminAuthenticated, async (req, res) => {
    let query = User.find().limit(20)
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }
    
    var uptime = process.uptime();
    
          

    try {
        const serverUptime = await uptime;
        const tasks = await tasksList.exec()
            res.render('applicationDetails', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                tasks: tasks,
                serverUptime: serverUptime,
                searchOptions: req.query
            })
        } catch (error) {
            console.log(error)
        }
})




//HELP MESSAGE ROUTE
router.get('/helpMessages', ensureAdminAuthenticated, async (req, res) => {
    let query = helpMessages.find().limit(50).sort({creationDate: 'desc'})
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }    
    try { 
        const messages = await query.exec()
        const tasks = await tasksList.exec()
            res.render('helpMessages', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                tasks: tasks,
                messages: messages,
                searchOptions: req.query
            })
    } catch (error) {
        console.log(error)
    }
})


//BOOKMARK MESSAGES ROUTE
router.put('/bookmarkMessageForm', async(req, res) => {
    let messageBookmark
    try {
        messageBookmark = await helpMessages.findById(req.body.bookmarkMessageId)
        messageBookmark.bookmark = req.body.bookmarkMessage
        await messageBookmark.save()
        res.redirect(`/admins/helpMessages`)
    } catch {
        if (messageBookmark == null) {
            //res.redirect('../dashboard')
            res.send('Data is null')
        }
        else {
            res.send('Error updating bookmark status.')
        }
    }
})


//READ STATUS MESSAGE ROUTE
router.put('/statusMessageForm', async(req, res) => {
    let messageStatus
    try {
        messageStatus = await helpMessages.findById(req.body.statusMessageId)
        messageStatus.readStatus = req.body.statusMessage
        await messageStatus.save()
        res.redirect(`/admins/helpMessages`)
    } catch {
        if (messageStatus == null) {
            //res.redirect('../dashboard')
            res.send('Data is null')
        }
        else {
            res.send('Error changing Status.')
        }
    }
})


//READ STATUS MESSAGE ROUTE
router.put('/statusMessageModalForm', async(req, res) => {
    let messageStatus
    try {
        messageStatus = await helpMessages.findById(req.body.statusMessageIdModal)
        messageStatus.readStatus = '1'
        await messageStatus.save()
        res.redirect(`/admins/helpMessages`)
    } catch {
        if (messageStatus == null) {
            //res.redirect('../dashboard')
            console.log('Read Status Message is null')
        }
        else {
            console.log('Error changing Status.')
        }
    }
})

//DELETE MESSAGE FROM TRASH PAGE
router.delete('/deleteMessageForm', async (req, res) => {
    let messageDelete
    try {
        messageDelete = await helpMessages.findById(req.body.deleteMessageId)
        await messageDelete.remove()
        res.redirect(`/admins/helpMessages`)
    } catch {
        if (messageDelete == null) {
            res.send('Data is null')
            //fileErrors.push({ message: 'File not found.' }) 
        }
        else {
            res.send('Error deleting message')
            //fileErrors.push({ message: 'Error deleting file.' }) 
        }
    }
})

//READ HELP MESSAGE ROUTE
router.get('/readHelpMessages', ensureAdminAuthenticated, async (req, res) => {
    let query = helpMessages.find().where('readStatus').equals('1').sort({creationDate: 'desc'})
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }    
    try { 
        const messages = await query.exec()
        const tasks = await tasksList.exec()
            res.render('readHelpMessages', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                tasks: tasks,
                messages: messages,
                searchOptions: req.query
            })
    } catch (error) {
        console.log(error)
    }
})

//READ BOOKMARK MESSAGES ROUTE
router.put('/readbookmarkMessageForm', async(req, res) => {
    let messageBookmark
    try {
        messageBookmark = await helpMessages.findById(req.body.bookmarkMessageId)
        messageBookmark.bookmark = req.body.bookmarkMessage
        await messageBookmark.save()
        res.redirect(`/admins/readHelpMessages`)
    } catch {
        if (messageBookmark == null) {
            //res.redirect('../dashboard')
            res.send('Data is null')
        }
        else {
            res.send('Error updating bookmark status.')
        }
    }
})


//READ READ STATUS MESSAGE ROUTE
router.put('/readstatusMessageForm', async(req, res) => {
    let messageStatus
    try {
        messageStatus = await helpMessages.findById(req.body.statusMessageId)
        messageStatus.readStatus = req.body.statusMessage
        await messageStatus.save()
        res.redirect(`/admins/readHelpMessages`)
    } catch {
        if (messageStatus == null) {
            //res.redirect('../dashboard')
            res.send('Data is null')
        }
        else {
            res.send('Error changing Status.')
        }
    }
})


//READ READ STATUS MODAL MESSAGE ROUTE
router.put('/readstatusMessageModalForm', async(req, res) => {
    let messageStatus
    try {
        messageStatus = await helpMessages.findById(req.body.statusMessageIdModal)
        messageStatus.readStatus = '1'
        await messageStatus.save()
        res.redirect(`/admins/readHelpMessages`)
    } catch {
        if (messageStatus == null) {
            //res.redirect('../dashboard')
            console.log('Read Status Message is null')
        }
        else {
            console.log('Error changing Status.')
        }
    }
})

//READ DELETE MESSAGE FROM TRASH PAGE
router.delete('/readdeleteMessageForm', async (req, res) => {
    let messageDelete
    try {
        messageDelete = await helpMessages.findById(req.body.deleteMessageId)
        await messageDelete.remove()
        res.redirect(`/admins/readHelpMessages`)
    } catch {
        if (messageDelete == null) {
            res.send('Data is null')
            //fileErrors.push({ message: 'File not found.' }) 
        }
        else {
            res.send('Error deleting message')
            //fileErrors.push({ message: 'Error deleting file.' }) 
        }
    }
})





//UNREAD HELP MESSAGE ROUTE
router.get('/unreadHelpMessages', ensureAdminAuthenticated, async (req, res) => {
    let query = helpMessages.find().where('readStatus').equals('0').sort({creationDate: 'desc'})
    let tasksList = taskList.find().where('creatorEmail').equals(req.user.email).sort({createDate: 'desc'})
    if (req.query.email != null && req.query.email !== '' ) {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
        //searchOptions.searchbar = new RegExp(req.query.searchbar, 'i')
    }    
    try { 
        const messages = await query.exec()
        const tasks = await tasksList.exec()
            res.render('unreadHelpMessages', {
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                tasks: tasks,
                messages: messages,
                searchOptions: req.query
            })
    } catch (error) {
        console.log(error)
    }
})

//UNREAD BOOKMARK MESSAGES ROUTE
router.put('/unreadbookmarkMessageForm', async(req, res) => {
    let messageBookmark
    try {
        messageBookmark = await helpMessages.findById(req.body.bookmarkMessageId)
        messageBookmark.bookmark = req.body.bookmarkMessage
        await messageBookmark.save()
        res.redirect(`/admins/unreadHelpMessages`)
    } catch {
        if (messageBookmark == null) {
            //res.redirect('../dashboard')
            res.send('Data is null')
        }
        else {
            res.send('Error updating bookmark status.')
        }
    }
})


//UNREAD READ STATUS MESSAGE ROUTE
router.put('/unreadstatusMessageForm', async(req, res) => {
    let messageStatus
    try {
        messageStatus = await helpMessages.findById(req.body.statusMessageId)
        messageStatus.readStatus = req.body.statusMessage
        await messageStatus.save()
        res.redirect(`/admins/unreadHelpMessages`)
    } catch {
        if (messageStatus == null) {
            //res.redirect('../dashboard')
            res.send('Data is null')
        }
        else {
            res.send('Error changing Status.')
        }
    }
})


//UNREAD READ STATUS MODAL MESSAGE ROUTE
router.put('/unreadstatusMessageModalForm', async(req, res) => {
    let messageStatus
    try {
        messageStatus = await helpMessages.findById(req.body.statusMessageIdModal)
        messageStatus.readStatus = '1'
        await messageStatus.save()
        res.redirect(`/admins/unreadHelpMessages`)
    } catch {
        if (messageStatus == null) {
            //res.redirect('../dashboard')
            console.log('Read Status Message is null')
        }
        else {
            console.log('Error changing Status.')
        }
    }
})

//UNREAD DELETE MESSAGE FROM TRASH PAGE
router.delete('/unreaddeleteMessageForm', async (req, res) => {
    let messageDelete
    try {
        messageDelete = await helpMessages.findById(req.body.deleteMessageId)
        await messageDelete.remove()
        res.redirect(`/admins/unreadHelpMessages`)
    } catch {
        if (messageDelete == null) {
            res.send('Data is null')
            //fileErrors.push({ message: 'File not found.' }) 
        }
        else {
            res.send('Error deleting message')
            //fileErrors.push({ message: 'Error deleting file.' }) 
        }
    }
})


//HELP MESSAGE RESPONSE ROUTE
router.post('/helpMessageResponseRoute', async(req, res) => {

    const options = {
        to: req.body.responseEmail,
        subject: 'Response to your help request.',
        html: '<!DOCTYPE html><html><head></head><body style="background-color: #f1f1f1;"><div style="margin: 15px; width: 100%;"><img style="height: 30px; width: auto; margin-left: 12%; margin-right: 5px; margin-top: 20px;" src="cid:un777ique@nodemailer.com"><span style="font-weight: bolder; display: inline-block;"><h2 style="margin: 0; font-family: arial;">Cloud Castle</h2></span><div style="width: 75%; height: auto; background-color: #ffffff; margin: 15px auto 25px; padding: 8px 25px;"><div style="font-weight: bold; font-family: arial;"><h3>' + req.body.responseSubject + '</div><div style="margin: auto;"><div style="color: #5e5e5e; font-family: arial;">' + req.body.responseContent + '<br><br><hr style="border: none; background-color: #f1f1f1; height: 3px;"><br><a href="http://localhost:3000/users/login" style="text-decoration: none;"><button style="border: none; background:#80bfff; color: #fff; font-family: arial; font-size: 12px; padding: 9px; border-radius: 5px;">Login</button></a><br><br><hr style="border: none; background-color: #f1f1f1; height: 3px;"><br><span style="font-family: arial; font-weight: bold;"><h3>Questions?</h3></span><p style="font-family: arial; color: #5e5e5e;">Please let us know if there is anything we can do to help you with by replying to this email or by emailing <span style="font-weight: bold; color: #007bff;">mail.cloudcastle@gmail.com</span></p><br></div></div></div><br><br></body></html>',
        attachments: [{
            filename: 'icons8-castle-64.png',
            path: path.join(__dirname,'..','public','assets','icons8-castle-64.png'),
            cid: 'un777ique@nodemailer.com' //same cid value as in the html img src
        }],
        dsn: {
            id: 'problems encountered while sending the email. Please contact support for more information.',
            return: 'headers',
            notify: ['failure', 'delay'],
            recipient: 'healthyrythm.mail@gmail.com'
        }
      };
     
    // emailHelpers.sendEmail(options)
    
    res.redirect('/admins/helpMessages')
})



module.exports = router;