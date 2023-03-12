const mongoose = require('mongoose')

const deleteUserSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    deleteReason: {
        type: String,
    },
    bookmark: {
        type: String,
        default: '0'
    },
    readStatus: {
        type: String,
        default: '0'
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
})


const deleteUser = mongoose.model('deleteUser', deleteUserSchema)
module.exports = deleteUser