const express = require('express')
const router = express.Router()
const uploadFile = require('../models/fileUpload')
const fs = require('fs')

router.put('/:id/favourite', async(req, res) =>{
    let file
    try {
        file = await uploadFile.findById(req.params.id)
        file.favourite = req.body.favourite
        await file.save()
        res.redirect(`/uploadFile/dashboard`)
    } catch {
        if (file == null) {
            //res.redirect('../dashboard')
            res.send('File is null')
        }
        else {
            res.send('Error adding to favourites.')
        }
    }
})

//DELETE UPLOADED FILE ROUTE
//new trash route
router.delete('/:id', async(req, res) =>{
    let file
    try {
        file = await uploadFile.findById(req.params.id)
        file.delete = req.body.delete
        await file.save()
        res.redirect('/uploadFile/dashboard')
    } catch {
        if (file == null) {
            //res.redirect('../dashboard')
            res.send('File is null')
        }
        else {
            res.send('Error deleting file')
        }
    }
})

//DELETE FILES PERMANENTLY FROM TRASH PAGE
router.delete('/:id/permanentDelete', async (req, res) => {
    let fileErrors = []
    let file
    try {
        file = await uploadFile.findById(req.params.id)
        fs.unlink(__dirname + '../../public/uploads/uploadedFiles/' + file.fileName, (err) => {
            if (err) console.log(err)
          })
        await file.remove()
        res.redirect('/uploadFile/dashboard/trash')
    } catch {
        if (file == null) {
            res.send('File is null')
            //fileErrors.push({ message: 'File not found.' }) 
        }
        else {
            res.send('Error deleting file')
            //fileErrors.push({ message: 'Error deleting file.' }) 
        }
    }
})

//FILES RESTORE ROUTE
router.put('/:id/fileRestore', async (req, res) => {
    let file
    try {
        file = await uploadFile.findById(req.params.id)
        file.delete = req.body.delete
        await file.save()
        res.redirect('/uploadFile/dashboard/trash')
    } catch {
        if (file == null) {
            //res.redirect('../dashboard')
            res.send('File is null')
        }
        else {
            res.send('Error restoring file.')
        }
    }
})

//DOWNLOAD FILES ROUTE
router.put('/:id', async (req, res) => {
    let file = await uploadFile.findById(req.params.id)
    try {
        res.download(__dirname + '../../public/uploads/uploadedFiles/' + file.fileName, file.orignalFileName)
    } catch (err) {
        console.log(err)
    }
})

//FILE RENAME ROUTE
router.post('/fileRename', async (req, res) => {
    let file
    try {
        file = await uploadFile.findById(req.body.fileId)
        file.orignalFileName = req.body.newName
        await file.save()
        res.redirect(`/uploadFile/dashboard`)   
    } catch (err) {
        console.log(err)
    }
})

module.exports = router