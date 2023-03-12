const mongoose = require('mongoose')
const fileBasePath = 'uploads/uploadedFiles'

const fileSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    orignalFileName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    notification: {
        type: String
    },
    privacy: {
        type: String
    },
    description: {
        type: String
    },
    archive: {
        type: String
    },
    conseal: {
        type: String
    },
    hidden: {
        type: String
    },
    favourite: {
        type: String,
        required: true,
        default: 0
    },
    delete: {
        type: String,
        default: 0
    },
    mimetype: {
        type: String,
        required: true
    },
    mimeCategory: {
        type: String,
        required: true,
        default: 'other'
    },
    size: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Files', fileSchema)
module.exports.fileBasePath = fileBasePath