const express = require('express')
const router = express.Router()
const User = require('../models/Users')
const getHelp = require('../models/getHelpModel')
const uploadFile = require('../models/fileUpload')
const deleteReason = require('../models/deleteUserModel')
const { check, validationResult } = require('express-validator');
const emailHelpers = require('../config/emailHelper')
//const changePass = require('../models/changePassModel')
//const taskList = require('../models/taskList')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const path = require('path')
const fs = require('fs')
const nodemailer = require('nodemailer')
const { ensureAuthenticated } = require('../config/auth')
const { ensureAuthenticatedPassword } = require('../config/authChangePassword')
const uploadPath = path.join('public', User.profilePicBasePath)
const multer = require('multer')
const imageMimeTypes = ['image/jpeg', 'image/png']
/* const mediaMimeTypes = ['audio/basic','audio/mid', 'audio/mpeg', 'audio/x-wav', 'image/bmp', 'image/ief', 'image/jpeg', 'image/svg+xml', 'video/mp4', 'video/mpeg', 'video/x-msvideo']
const documentMimeTypes = ['application/msword','application/octet-stream', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] */
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//LOGIN PAGE
router.get('/login', (req, res) => {
    res.render('login')
})

//REGISTER PAGE
router.get('/register', (req, res) => {
    res.render('register', { user: new User() })
})

//REGISTER HANDLE
router.post('/register', upload.single('profilePic'), [/* check('email').isEmail().withMessage("Please emter valid Email Address."), */ check('password').isLength({ min: 8 }).withMessage("length should be atleast 8 chars").isAlphanumeric()], async (req, res) =>{ 
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
            req.flash('success_msg', 'You are registered and can now log in.')

            //REGISTERATION SUCCESSFUL CONFIRMATION EMAIL
            const options = {
                to: user.email,
                subject: 'Welcome to Cloud Castle!',
                html: '<!DOCTYPE html><html><head></head><body style="background-color: #f1f1f1;"><div style="margin: 15px; width: 100%;"><img style="height: 30px; width: auto; margin-left: 12%; margin-right: 5px; margin-top: 20px;" src="cid:un777ique@nodemailer.com"><span style="font-weight: bolder; display: inline-block;"><h2 style="margin: 0; font-family: arial;">Cloud Castle</h2></span><div style="width: 75%; height: auto; background-color: #ffffff; margin: 15px auto 25px; padding: 8px 25px;"><div style="font-weight: bold; font-family: arial;"><h3>Hi! Welcome to Cloud Castle.</h3></div><div style="margin: auto;"><div style="color: #5e5e5e; font-family: arial;">We'+ "'" +'re glad to see you here! We have everything you need to start your journey today.<a href="#" style="color: #007bff;"> Learn More</a> about Cloud Castle.<br><hr style="border: none; background-color: #f1f1f1; height: 3px;"><br><a href="https://cloudcastle-project.herokuapp.com/users/login" style="text-decoration: none;"><button style="border: none; background:#80bfff; color: #fff; font-family: arial; font-size: 14px; padding: 10px;">Login</button></a><br><br><br><hr style="border: none; background-color: #f1f1f1; height: 3px;"><br><span style="font-family: arial; font-weight: bold;"><h3>Questions?</h3></span><p style="font-family: arial; color: #5e5e5e;">Please let us know if there is anything we can do to help you with by replying to this email or by emailing <span style="font-weight: bold; color: #007bff;">mail.cloudcastle@gmail.com</span></p></div></div></div><br><br></body></html>',
                attachments: [{
                    filename: 'icons8-castle-64.png',
                    path: path.join(__dirname,'..','public','assets','icons8-castle-64.png'),
                    cid: 'un777ique@nodemailer.com' //same cid value as in the html img src
                }],
                dsn: {
                    id: 'problems encountered while sending the email. Please contact support for more information.',
                    return: 'headers',
                    notify: ['failure', 'delay'],
                    recipient: 'mail.cloudcastle@gmail.com'
                }
            };
             
            // emailHelpers.sendEmail(options)

            res.redirect('/users/login')
        } catch {
            res.render('register', {
                user:user,
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

/* function saveprofilePic(user, profilePicEncoded){
    if (profilePicEncoded == null) return
    const profilePic = JSON.parse(profilePicEncoded)
    if (profilePic != null && imageMimeTypes.includes(profilePic.type)) {
        user.profilePic = new Buffer.from(profilePic.data, 'base64')
        user.profilePicType = profilePic.type
    }
} */




//LOGIN HANDLE
router.post('/login', (req, res, next) => {
    passport.authenticate('userlogin', {
        successRedirect: '/uploadFile/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    }) (req, res, next)
})

//LOGOUT HANDLE
router.get('/logout', async (req, res) => {
    let userStatus
    try {
        userStatus = await User.findById(req.user._id)
        userStatus.status = '0'
        await userStatus.save()
    } catch (err) {
        console.log(err)
    }
    req.logout();
    req.flash('success_msg', 'You are Logged out.')
    res.redirect('/users/login')
})

//CREATE NEW ACCOUNT HANDLE
router.get('/createNewAccount', (req, res) => {
    req.logout();
    res.redirect('/users/register')
})

//CHANGE PASSWORD HANDLE BEFORE LOGIN
router.get('/resetPassword', (req, res) => {
    res.render('resetPasswordLink')  
})


router.post('/changePasswordFormBeforeLogin', async(req, res) =>{
    let otpuser
    let errors = []
    let checkUserExistsQuery = User.find().where('email').equals(req.body.email).countDocuments()
    const otp = req.body.otpNumber
    const hashedOtp = await bcrypt.hash(otp, 10)

    if ( checkUserExistsQuery == 0 ) {
        errors.push({ msg: 'Email Address does not exist. Please try again.' })
    }
    if (errors.length > 0) {
        const files = await query.exec() 
        res.render('resetPasswordLink', {
            errors
        })
    } else { 
        try {
            otpuser = await User.findOne().where('email').equals(req.body.email)
            otpuser.changepasswordOtp = hashedOtp
            await otpuser.save()

            //send password change link via email
            const options = {
                to: req.body.email,
                subject: 'Password reset',
                html: '<!DOCTYPE html><html><head></head><body style="background-color: #f1f1f1;"><div style="margin: 15px; width: 100%;"><img style="height: 30px; width: auto; margin-left: 12%; margin-right: 5px; margin-top: 20px;" src="cid:un777ique@nodemailer.com"><span style="font-weight: bolder; display: inline-block;" class=""><h2 style="margin: 0; font-family: arial;">Cloud Castle</h2></span><div style="width: 75%; height: auto; background-color: #ffffff; margin: 15px auto 25px; padding: 8px 25px;"><div style="font-weight: bold; font-family: arial;"><h3>Hi, here is how to reset your password.</h3></div><div style="margin: auto;"><div style="color: #5e5e5e; font-family: arial;">We have recieved a request to have your password reset for <span style="font-weight: bold;">Cloud Castle</span>. If you did not make this request, please ignore this email.</div><br><div style="font-family: arial; color: #5e5e5e;">Your OTP is: <span style="font-weight: bold; color: black;">' + otp + '</span></div><br><p style="color: #5e5e5e; font-family: arial;">To reset your password, please click <a href="https://cloudcastle-project.herokuapp.com/users/checkOtpPage" style="color: #007bff;">here</a>.</p><br><hr style="border: none; background-color: #f1f1f1; height: 3px;"><br><span style="font-family: arial; font-weight: bold;"><h3 style="margin-bottom: 0;">Having trouble?</h3></span><br><p style="font-family: arial; color: #5e5e5e; margin-top: 0;">If the above link does not work try copying and pasting this link into your browser:</p><div style="padding: 25px; background-color: #f1f1f1; width: 75%;"><span style="font-family: arial; color: #007bff;">https://cloudcastle-project.herokuapp.com/users/checkOtpPage</span></div><br><br><span style="font-family: arial; font-weight: bold;"><h3>Questions?</h3></span><p style="font-family: arial; color: #5e5e5e;">Please let us know if there is anything we can do to help you with by replying to this email or by emailing <span style="font-weight: bold; color: #007bff;">mail.cloudcastle@gmail.com</span></p></div></div></div><br><br></body></html>',
                attachments: [{
                    filename: 'icons8-castle-64.png',
                    path: path.join(__dirname,'..','public','assets','icons8-castle-64.png'),
                    cid: 'un777ique@nodemailer.com' //same cid value as in the html img src
                }],
                dsn: {
                    id: 'problems encountered while sending the email. Please contact support for more information.',
                    return: 'headers',
                    notify: ['failure', 'delay'],
                    recipient: 'mail.cloudcastle@gmail.com'
                }
              };
             
            // emailHelpers.sendEmail(options)
            
            req.flash('success_msg', 'Details have been sent to your email address. Please change your password and then log in.')
            res.redirect('login')
        } catch (err) {
            res.send(err)
        }
    }

})

//CHANGE PASSWORD HANDLE AFTER LOGIN
router.get('/changePassword', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
        const files = await query.exec() 
        res.render('changePassword', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            files: files,
            searchOptions: req.query
        })
    } catch (err) {
        res.send(500, (err))
    }
})

router.post('/changePasswordOTPForm', async(req, res) =>{
    let otpuser
    let errors = []
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }

    const otp = req.body.otpNumber
    const hashedOtp = await bcrypt.hash(otp, 10)

    if ( req.body.passEmail !== req.user.email ) {
        errors.push({ msg: 'Email Address does not match. Please try again.' })
    }
    if (errors.length > 0) {
        const files = await query.exec() 
        res.render('changePassword', {
            errors,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            files: files,
            searchOptions: req.query
        })
    } else { 
        try {
            otpuser = await User.findById(req.user._id)
            otpuser.changepasswordOtp = hashedOtp
            await otpuser.save()

            //send password change link via email
            const options = {
                to: req.user.email,
                subject: 'Password reset',
                html: '<!DOCTYPE html><html><head></head><body style="background-color: #f1f1f1;"><div style="margin: 15px; width: 100%;"><img style="height: 30px; width: auto; margin-left: 12%; margin-right: 5px; margin-top:10px;" src="cid:un777ique@nodemailer.com"><span style="font-weight: bolder; display: inline-block;" class=""><h2 style="margin: 0; font-family: arial;">Cloud Castle</h2></span><div style="width: 75%; height: auto; background-color: #ffffff; margin: 15px auto 25px; padding: 8px 25px;"><div style="font-weight: bold; font-family: arial;"><h3>Hi '+ req.user.firstname +', here is how to reset your password.</h3></div><div style="margin: auto;"><div style="color: #5e5e5e; font-family: arial;">We have recieved a request to have your password reset for <span style="font-weight: bold;">Cloud Castle</span>. If you did not make this request, please ignore this email.</div><br><div style="font-family: arial; color: #5e5e5e;">Your OTP is: <span style="font-weight: bold; color: black;">' + otp + '</span></div><br><p style="color: #5e5e5e; font-family: arial;">To reset your password, please click <a href="https://cloudcastle-project.herokuapp.com/users/checkOtpPage" style="color: #007bff;">here</a>.</p><br><hr style="border: none; background-color: #f1f1f1; height: 3px;"><br><span style="font-family: arial; font-weight: bold;"><h3 style="margin-bottom: 0;">Having trouble?</h3></span><br><p style="font-family: arial; color: #5e5e5e; margin-top: 0;">If the above link does not work try copying and pasting this link into your browser:</p><div style="padding: 25px; background-color: #f1f1f1; width: 75%;"><span style="font-family: arial; color: #007bff;">https://cloudcastle-project.herokuapp.com/users/checkOtpPage</span></div><br><br><span style="font-family: arial; font-weight: bold;"><h3>Questions?</h3></span><p style="font-family: arial; color: #5e5e5e;">Please let us know if there is anything we can do to help you with by replying to this email or by emailing <span style="font-weight: bold; color: #007bff;">mail.cloudcastle@gmail.com</span></p></div></div></div><br><br></body></html>',
                attachments: [{
                    filename: 'icons8-castle-64.png',
                    path: path.join(__dirname,'..','public','assets','icons8-castle-64.png'),
                    cid: 'un777ique@nodemailer.com' //same cid value as in the html img src
                }],
                dsn: {
                    id: 'problems encountered while sending the email. Please contact support for more information.',
                    return: 'headers',
                    notify: ['failure', 'delay'],
                    recipient: 'mail.cloudcastle@gmail.com'
                }
              };
             
            // emailHelpers.sendEmail(options)

            req.flash('success_msg', 'Details have been sent to your email address. Please change your password and then log in.')
            res.redirect('/users/changePassword')
        } catch (err) {
            res.send(err)
        }
    }

})

router.get('/checkOtpPage', (req, res) => {
    res.render('checkOtpPage')
})

router.post('/checkOtpForm', (req, res, next) =>{
    passport.authenticate('otpverify', {
        successRedirect: '/users/changePasswordPage',
        failureRedirect: '/users/checkOtpPage',
        failureFlash: true
    }) (req, res, next)
})

router.get('/changePasswordPage', ensureAuthenticatedPassword, (req, res) => {
    res.render('changePasswordPage')
})

//CHANGE PASSWORD FORM ROUTE
router.post('/changePasswordForm', ensureAuthenticatedPassword, async(req, res) => {
    let errors = []
    const newPassword = req.body.password
    const confirmNewPassword = req.body.confirmNewPassword
    const hashedNewPassword = await bcrypt.hash(newPassword, 10) 
    
    if (!newPassword  || !confirmNewPassword) {
        errors.push({ msg: 'Please fill both fields.' })
    }
    if ( newPassword !== confirmNewPassword ) {
        errors.push({ msg: 'The passwords do not match. Please try again.' })
    }
    if ( newPassword.length < 6 ) {
        errors.push({ msg: 'The password shoud contain atleast 8 characters' })
    }
    if (errors.length > 0) {
        res.send('changePasswordPage error')
    } 
    else {
        try { 
            const changePasswordUser = await User.findById(req.user._id)
            changePasswordUser.password = hashedNewPassword
            await changePasswordUser.save() 
            //send mail change link 
            const options = {
                to: req.user.email,
                subject: 'Password reset successful',
                html: '<!DOCTYPE html><html><head></head><body style="background-color: #f1f1f1; padding: 10px 0px;"><div style="margin: 15px; width: 100%;"><img style="height: 30px; width: auto; margin-left: 12%; margin-right: 5px;" src="cid:un777ique@nodemailer.com"><span style="font-weight: bolder; display: inline-block;" class=""><h2 style="margin: 0; font-family: arial;">Cloud Castle</h2></span><div style="width: 75%; height: auto; background-color: #ffffff; margin: 15px auto 25px; padding: 8px 25px;"><div style="font-weight: bold; font-family: arial;"><h3>Hi '+ req.user.firstname +', your password was reset successfully.</div><span style="font-family: arial; font-weight: bold;"><h3 style="margin-bottom: 0;">Did not request Password Reset?</h3></span><br><p style="font-family: arial; color: #5e5e5e; margin-top: 0;">Reply to this mail if you did not authorize the reset of your password.</p><br><span style="font-family: arial; font-weight: bold;"><h3>Questions?</h3></span><p style="font-family: arial; color: #5e5e5e;">Please let us know if there is anything we can do to help you with by replying to this email or by emailing <span style="font-weight: bold; color: #007bff;">mail.cloudcastle@gmail.com</span></p></div></div></div><br><br><br></body></html>',
                attachments: [{
                    filename: 'icons8-castle-64.png',
                    path: path.join(__dirname,'..','public','assets','icons8-castle-64.png'),
                    cid: 'un777ique@nodemailer.com' //same cid value as in the html img src
                }],
                dsn: {
                    id: 'problems encountered while sending the email. Please contact support for more information.',
                    return: 'headers',
                    notify: ['failure', 'delay'],
                    recipient: 'mail.cloudcastle@gmail.com'
                }
              };
             
            // emailHelpers.sendEmail(options)
            
            req.flash('success_msg', 'Password changed successfully. Please log in.')
            req.logout();
            res.redirect('/users/login')
        }
        catch (err) {
            console.log('there is some error')
            console.log(err)
        }
    }
}) 

//DELETE ACCOUNT ROUTE
router.get('/deleteAccount', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
        const files = await query.exec() 
        res.render('deleteAccount', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            userID: req.user._id,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

//DELETE ACCOUNT HANDLE
router.post('/deleteAccountForm', async (req, res) => {
    let errors = []
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    reason = req.body.deleteReason
    password = req.body.password

    
    if(!reason  || !password) {
        errors.push({ msg: 'Please fill all the fields.' })
    }

    //MATCH PASSWORD
    bcrypt.compare(password, req.user.password, (err, isMatch) => {
        if (err) throw err

        if(isMatch) {
            //update reason for deleting account
            const deleteReasonMessage = new deleteReason({
                email: req.user.email,
                deleteReason: reason
            })
            deleteReasonMessage.save()
        } else {
            errors.push({ msg: 'Password is incorrect. Please try again.' })
        }
    })

    //begin deletion process
    if (errors.length > 0) {
            res.render('deleteAccount', ({ 
                errors,
                firstname: req.user.firstname,
                lastname: req.user.lastname,
                profilePicPath: req.user.profilePicPath,
                files: files,
                searchOptions: req.query
            }))
        } else {
            //delete users files
            let userFileList
            try {
                userFileList = await uploadFile.find().where('email').equals(req.user.email)
                userFileList.forEach( fileList => {
                    fs.unlink(__dirname + './../public/uploads/uploadedFiles/' + fileList.fileName, (err) => {
                        if (err) console.log(err)
                    })
                });
                userFileListRemove = await uploadFile.deleteMany().where('email').equals(req.user.email) 
            } catch (error) {
                console.log(error)
                //errors.push({ msg: error })
            }

            let user
            try {
                user = await User.findById(req.user._id)
                user.access = 2
                await user.save()
            } catch {
                if (user == null) {
                    //res.redirect('../dashboard')
                    res.send('User is null')
                }
                else {
                    res.send('Error adding to access list.')
                }
            }
            res.redirect('/')

            //delete user permanantly from db
            /* try {
            } catch (errors) {
            } */        
            
        }
    

    

    


    
})

//NAVBAR MENU OPTIONS

//GO TO DETAILED PROFILE
router.get('/profile', (req, res) => {
    res.redirect('/users/profilePage')
})

//EDIT USERS PROFILE ROUTE
router.get('/profile/edit', (req, res) => {
    res.redirect('/users/editprofilePage')
})

//SHOW ALL UPLOADS ROUTE
router.get('/uploads', (req, res) => {
    res.send('All the uploads')
})

//SHOW ALL INVOLVED PROJECTS ROUTE
/* router.get('/projects', (req, res) => {
    res.send('All the projects')
}) */

//CHANGE SETTINGS ROUTE
router.get('/settings', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
        const files = await query.exec() 
        res.render('accountSettingsPage', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})


//GET HELP ROUTE
router.get('/help', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
        const files = await query.exec() 
        res.render('helpPage', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})


//USER PROFILE PAGE ROUTE
router.get('/profilePage', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    let currentFileCount = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('0').countDocuments()
    let currentStarredFileCount = uploadFile.find().where('email').equals(req.user.email).where('favourite').equals('1').where('delete').equals('0').countDocuments()
    let currentArchivedFileCount = uploadFile.find().where('email').equals(req.user.email).where('archive').equals('1').where('delete').equals('0').countDocuments()
    let currentTrashedCount = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('1').countDocuments()
    // FILE SIZE QUERY
    //documents size
    uploadFile.aggregate([
        {$match: {$and : [ {email: req.user.email}, {mimeCategory: 'document'} ]}},
        {$group: {_id: null,total: {$sum: "$size" }}}
    ], (err, resultDoc) => {
        if (err) {
            console.log(err)
            return
        }
        docSize = resultDoc
    })

    //media size
    uploadFile.aggregate([
        {$match: {$and : [ {email: req.user.email}, {mimeCategory: 'media'} ]}},
        {$group: {_id: null,total: {$sum: "$size" }}}
    ], (err, resultMed) => {
        if (err) {
            console.log(err)
            return
        }
        medSize = resultMed
    })

    //others size
    uploadFile.aggregate([     
        {$match: {$and : [ {email: req.user.email}, {mimeCategory: 'other'} ]}},
        {$group: {_id: null,total: {$sum: "$size" }}}
    ], (err, resultOthr) => {
        if (err) {
            console.log(err)
            return
        }
        othrSize = resultOthr
    })

    //total size
    uploadFile.aggregate([
        {$match: {$and : [ {email: req.user.email} ]}},
        {$group: {_id: null,total: {$sum: "$size" }}}
    ], (err, resultTotal) => {
        if (err) {
            console.log(err)
            return
        }
        totSize = resultTotal
    })

    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
        const files = await query.exec() 
        const count = await currentFileCount.exec()
        const starredCount = await currentStarredFileCount.exec()
        const archivedCount = await currentArchivedFileCount.exec()
        const trashCount = await currentTrashedCount.exec()
        const documentSize = await docSize
        const mediaSize = await medSize
        const totalSize = await totSize
        const otherSize = await othrSize
        res.render('profilePage', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            phone: req.user.phone,
            email: req.user.email,
            company: req.user.company,
            city: req.user.city,
            state: req.user.state,
            postcode: req.user.postcode,
            country: req.user.country,
            createdDate: req.user.date,
            profilePicPath: req.user.profilePicPath,
            fileCount: count,
            starredCount: starredCount, 
            archivedCount: archivedCount,
            trashCount: trashCount,
            documentSize: documentSize,
            mediaSize: mediaSize,
            totalSize: totalSize,
            otherSize: otherSize,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

//EDIT USER PROFILE PAGE
router.get('/editprofilePage', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    try {
        const files = await query.exec() 
        res.render('editprofilePage', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            phone: req.user.phone,
            email: req.user.email,
            company: req.user.company,
            city: req.user.city,
            state: req.user.state,
            postcode: req.user.postcode,
            country: req.user.country,
            createdDate: req.user.date,
            profilePicPath: req.user.profilePicPath,
            files: files,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
    }
})

//UPDATE USER PROFILE ROUTE
router.post('/updateProfile',upload.single('profilePic'), async(req, res) =>{
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    let errors = []
    let editUser
    const editEmail = req.body.email
    try {
        editUser = await User.findById(req.user.id)
        editUser.firstname = req.body.firstname,
        editUser.lastname = req.body.lastname,
        editUser.phone = req.body.phone,
        editUser.company = req.body.company,
        editUser.email = editEmail,
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
        const files = await query.exec() 
        res.render('editprofilePage', ({ 
            editUser: editUser, 
            errors,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            phone: req.user.phone,
            email: req.user.email,
            company: req.user.company,
            city: req.user.city,
            state: req.user.state,
            postcode: req.user.postcode,
            country: req.user.country,
            files: files,
            searchOptions: req.query
         }))
    } else {
        await editUser.save()
        res.redirect(`/users/editprofilePage`)
    } 
}) 

//UPDATING PROFILE PIC ROUTE
router.post('/updateProfilePic', upload.single('profilePicEdit'), async(req, res) =>{
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    let errors = []
    const updateProfilePicName = req.file != null ? req.file.filename : null
    let editProfilePic
    try {
        editProfilePic = await User.findById(req.user.id)
        editProfilePic.profilePicName = updateProfilePicName        
    } catch {
        if (updateProfilePicName == null) {
            errors.push({ msg: 'No profile picture file found' })
        }
    }

    if (errors.length > 0) {
        const files = await query.exec() 
        res.render('editprofilePage', ({ 
            editUser: editUser, 
            errors,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            phone: req.user.phone,
            email: req.user.email,
            company: req.user.company,
            city: req.user.city,
            state: req.user.state,
            postcode: req.user.postcode,
            country: req.user.country,
            files: files,
            searchOptions: req.query
         }))
    } else {
        await editProfilePic.save()
        res.redirect(`/users/editprofilePage`)
    }
})


//RESET ACCOUNT ROUTE
router.post('/resetAccount', async (req, res) => {
    let userErrors = []
    let userFileList
    try {
        userFileList = await uploadFile.find().where('email').equals(req.user.email)
        userFileList.forEach( fileList => {
            fs.unlink(__dirname + './../public/uploads/uploadedFiles/' + fileList.fileName, (err) => {
                if (err) console.log(err)
            })
        });
        userFileListRemove = await uploadFile.deleteMany().where('email').equals(req.user.email)
        
        res.redirect('/uploadFile/dashboard')
    } catch (error) {
        console.log(error)
    }
})


//GET HELP CONTACT FORM
router.post('/getHelpForm', async (req, res) => {
    let errors = []
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }
    const helpMessage = new getHelp({
        email: req.user.email,
        subject: req.body.subject,
        message: req.body.message
    })
    if(!helpMessage.subject  || !helpMessage.message) {
        errors.push({ msg: 'Please fill all the fields.' })
    }
    if (errors.length > 0) {
        res.render('helpPage', ({ 
            errors,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            files: files,
            searchOptions: req.query
        }))
    } else {
        await helpMessage.save()
        req.flash('success_msg', 'Message sent.')
        res.redirect('/users/help')
    }
})


module.exports = router;