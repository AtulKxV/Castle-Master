module.exports = {
    ensureAdminAuthenticated: function (req, res, next) {
        if (req.isAuthenticated() && req.user.post == 'Admin') {
            return next()
        }
        req.flash('error_msg', 'Please log in to Admin contiue.')
        res.redirect('/admins/admin')
    }
}
