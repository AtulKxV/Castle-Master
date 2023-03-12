module.exports = {
    ensureAuthenticatedPassword: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        } 
        req.flash('error_msg', 'Invalid Credentials. Please try again.')
        res.redirect('/users/checkOtpPage')
    }
}