const User = require('../models/Users')
module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }
        req.flash('error_msg', 'Access Denied. If this is a mistake please contact support.')
        res.redirect('/users/login')
    }
}
