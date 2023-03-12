const express = require('express')
const router = express.Router()

//LANDING PAGE
router.get('/', (req, res) => {
    res.render('index')
})

module.exports = router;