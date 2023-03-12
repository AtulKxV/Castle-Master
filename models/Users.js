const mongoose = require('mongoose')
const profilePicBasePath = 'uploads/profilePics'
const path = require('path')

const UserSchema = new mongoose.Schema({
    post: {
        type: String,
        default: "User"
    },
    access: {
        type: String,
        default: "0"
    },
    status: {
        type: String,
        default: "0"
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    phone: {
        type: String
    },
    company: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    postcode: {
        type: String
    },
    country: {
        type: String
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    profilePicName: {
        type: String,
        default: '64dc89b6399b7a78258d84646a858817'
    },
    changepasswordOtp: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }

})

UserSchema.virtual('profilePicPath').get( function() {
    if (this.profilePicName != null ) {
        return path.join('/', profilePicBasePath, this.profilePicName ) //`data:${this.profilePicType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
}) 



const User = mongoose.model('User', UserSchema)
module.exports = User
module.exports.profilePicBasePath = profilePicBasePath 