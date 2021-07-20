const express = require('express')
const router = express.Router()
const db = require('../../models')
const Todo = db.Todo

// CREATE
router.get('/new', (req, res) => {
  res.render('new')
})

router.post('/', (req, res) => {
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
router.get('/:id', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    // 轉換成 plain object  => toJSON()
    .then(todo => res.render('detail', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

// Update : edit view
router.get('/:id/edit', (req, res) => {
  const id = req.params.id
  const UserId = req.user.id
  // find id from todo and belong to this user
  return Todo.findOne({ where: { id, UserId } })
    .then(todo => res.render('edit', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

router.put('/:id', (req, res) => {
  const { name, isDone } = req.body
  const UserId = req.user.id
  const id = req.params.id
  return Todo.findOne({ where: { id, UserId } })
    .then(todo => {
      todo.name = name
      // if (isDone === 'on') { todo.isDone = true } 
      // else { todo.isDone = false }
      todo.isDone = isDone === 'on'
      return todo.save()
    })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

//　Delete
router.delete('/:id', (req, res) => {
  const UserId = req.user.id
  const id = req.params.id
  return Todo.findOne({ where: { id, UserId } })
    .then(todo => todo.destroy())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

module.exports = router