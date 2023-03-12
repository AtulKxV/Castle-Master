const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    creatorEmail: {
        type: String,
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    createDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('taskList', taskSchema)