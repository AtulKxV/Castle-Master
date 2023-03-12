const mongoose = require('mongoose')

const changePassSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdTime: {
        type: Date,
        default: Date.now(),
        required: true
    }
})

const changePass = mongoose.model('changePassword', changePassSchema)
module.exports = changePass