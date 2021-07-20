const express = require('express')
const router = express.Router()
const passport = require('passport')
const db = require('../../models')
const User = db.User

// local login
router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login',
  failureFlash: true
}))

// register
router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errorMessages = []
  if (!name || !email || !password || !confirmPassword) {
    errorMessages.push({ message: 'All fields are required!' })
  }
  if (password !== confirmPassword) {
    errorMessages.push({ message: 'Password and Confirm Password do not match!' })
  }
  if (errorMessages.length) {
    return res.render('register', { name, email, password, confirmPassword, errorMessages })
  }
  User.findOne({ where: { email } })
    .then(user => {
      if (user) {
        errorMessages.push({ message: 'User already exists.' })
        return res.render('register', { name, email, password, confirmPassword, errorMessages })
      }
      return bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(password, salt))
        .then(hash => User.create({
          name,
          email,
          password: hash
        }))
        .then(() => res.redirect('/'))
        .catch(error => console.log(error))
    })
})

// logout
router.get('/logout', (req, res) => {
  req.logOut()
  req.flash('success_msg', 'Logout successful!')
  res.redirect('/users/login')
})

module.exports = router