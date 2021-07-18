const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const usePassport = require('./config/passport')
const passport = require('passport')
const { authenticator } = require('./middleware/auth')

const app = express()
const PORT = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use(session({
  secret: 'ThisIsMyTodoSecret',
  resave: false,
  saveUninitialized: true
}))

usePassport(app)

// 先載入資料夾
const db = require('./models')
const Todo = db.Todo
const User = db.User

// 給 handlebars 使用
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  next()
})

// index
app.get('/', authenticator, (req, res) => {
  const userId = req.user.id
  return Todo.findAll({
    where: { UserId: userId },
    raw: true,
    nest: true
  })
    .then((todos) => { return res.render('index', { todos: todos }) })
    .catch(error => { return res.status(422).json(error) })
})

// CREATE
app.get('/todos/new', authenticator, (req, res) => {
  res.render('new')
})

app.post('/todos', authenticator, (req, res) => {
  const { name } = req.body
  const userId = req.user.id
  return Todo.create({
    name,
    UserId: userId
  })
  .then(() => res.redirect('/'))
  .catch((error) => console.log(error))
})

// READ : detail view
app.get('/todos/:id', authenticator, (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    // 轉換成 plain object  => toJSON()
    .then(todo => res.render('detail', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

// login
app.get('/users/login', (req, res) => {
  res.render('login')
})

app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

// register
app.get('/users/register', (req, res) => {
  res.render('register')
})

app.post('/users/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  User.findOne({ where: { email } })
    .then(user => {
      if (user) {
        console.log('User already exists.')
        return res.render('register', { name, email, password, confirmPassword })
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
app.get('/users/logout', (req, res) => {
  req.logOut()
  res.redirect('/users/login')
})

app.listen(PORT, () => {
  console.log(`App is running on http:localhost/${PORT}`)
})