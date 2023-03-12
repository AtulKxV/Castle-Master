const mongoose = require('mongoose')

const helpSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
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


const getHelp = mongoose.model('getHelp', helpSchema)
module.exports = getHelp