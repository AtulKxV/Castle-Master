const mongoose = require('mongoose')
const profilePicBasePath = 'uploads/profilePics'
const path = require('path')

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
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



const Admin = mongoose.model('Admin', UserSchema)
module.exports = Admin
module.exports.profilePicBasePath = profilePicBasePath 