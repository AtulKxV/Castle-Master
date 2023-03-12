const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//LOAD USER MODEL
const User = require('../models/Users')

module.exports = function (passport) {
    passport.use('adminLogin',
        new LocalStrategy({ usernameField: 'email'}, (email, password, admindone) =>{
            //SEE IF THERES USER
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return admindone(null, false, {message: "Sorry, we can't find an account with this email address. Please try again or create a new account." })
                    }
 
                    //MATCH PASSWORD
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err

                        if(isMatch) {
                            return admindone (null, user);
                        } else {
                            return admindone(null, false, { message: "Incorrect password. Please try again or you can reset your password." })
                        }
                    })

                })
                .catch(err => console.log(err))
        })
    ) 

    passport.use('userlogin',
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) =>{
            //SEE IF THERES USER
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return done(null, false, {message: "Sorry, we can't find an account with this email address. Please try again or create a new account." })
                    }

                    if (user.access == '1') {
                        return done(null, false, { message: "This user has been banned from the server. If this is a mistake please contact support at support@cloudcastle.com" })
                    }

                    if (user.access == '2') {
                        return done(null, false, { message: "This account has bee flagged for deletion. If this is a mistake please contact support at support@cloudcastle.com" })
                    }

                    //MATCH PASSWORD
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err

                        if(isMatch) {
                            return done (null, user);
                        } else {
                            return done(null, false, { message: "Incorrect password. Please try again or you can reset your password." })
                        }
                    })

                })
                .catch(err => console.log(err))
        })
    )


    passport.use('otpverify',
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) =>{
            //SEE IF THERES USER
            User.findOne({ email: email }).where('access').equals('0' || '2')
                .then(user => {
                    if (!user) {
                        return done(null, false, {message: "Sorry, we can't find an account with this email address. Please try again or create a new account." })
                    }

                    //MATCH PASSWORD
                    bcrypt.compare(password, user.changepasswordOtp, (err, isMatch) => {
                        if (err) throw err

                        if(isMatch) {
                            return done (null, user);
                        } else {
                            return done(null, false, { message: "Wrong or expired OTP please re-enter." })
                        }
                    })

                })
                .catch(err => console.log(err))
        })
    )


     

    passport.serializeUser( async (user, done) => {
        let userStatus
        try {
            userStatus = await User.findById(user._id)
            userStatus.status = '1'
            await userStatus.save()
            done(null, user.id)
        } catch (err) {
            console.log(err)
        }
    })
      
    passport.deserializeUser((id, done) => {
        User.findById(id, async (err, user) => {
            let userStatus
            try {
                if (user) {
                    userStatus = await User.findById(user._id)
                    userStatus.status = '0'
                    await userStatus.save()
                    done(err, user)                    
                } else {
                    console.log('error')
                }
            } catch (err) {
                console.log(err)
            }
        })
    })          
}