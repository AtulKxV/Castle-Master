const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
    creator: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    goals: {
        type: String
    },
    participants: {
        type: { participants: Array },
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const createTeam = mongoose.model('createTeam', teamSchema)
module.exports = createTeam