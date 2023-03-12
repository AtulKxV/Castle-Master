const express = require('express')
const router = express.Router()
const uploadFile = require('../models/fileUpload')
const Users = require('../models/Users')
const createTeamsModel = require('../models/createTeam')
const { ensureAuthenticated } = require('../config/auth')

//CREATE NEW PROJECT ROUTE
router.get('/dashboard/teamCreate', ensureAuthenticated, async (req, res) => {
    let query = uploadFile.find().where('email').equals(req.user.email).where('delete').equals('0').sort({uploadDate: 'desc'}).limit(20)
    if (req.query.orignalFileName != null && req.query.orignalFileName !== '' ) {
        query = query.regex('orignalFileName', new RegExp(req.query.orignalFileName, 'i'))
    }    
    const users = await Users.find({})
    const participants = await createTeamsModel.find({})     
    try {
        /* res.send('data obtained ::'+ req.user.firstname +) */
        res.render('teamCreate', {
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            profilePicPath: req.user.profilePicPath,
            searchOptions: req.query,
            users: users,
            participants: participants
        })
    } catch {
        res.redirect('/uploadFile/dashboard/projects')
    }  
})

//TEAMS INFO PAGE ROUTE
//router.get('')

router.post('/create', async (req, res) => {
    participantsArray = req.body.participants
    const team = new createTeamsModel({
        title: req.body.teamName,
        goals: req.body.goals,
        participants: participantsArray,
        creator: req.user.email
    })
    try {
        const newTeam = await team.save()
        res.redirect('/uploadFile/dashboard/projects')
    } catch (error) {
        console.log(error)
    }
})

//teamFullPage ROUTE
/* router.post('/dashboard/teamFullPage', (req, res) => {
    const teamTitle = req.body.teamTitle
    res.send("This is full page display of team with title : " + teamTitle)
}) */

router.put('/:id', async(req, res) => { 
    try {
        const team = await req.body.teamID /* createTeamsModel.findById(req.body.teamID) */
        res.send("This value : " + team)
    } catch (err) {
        console.log(err)
        res.send('problem encountered')
    }
})

module.exports = router;