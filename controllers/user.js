const bcrypt  = require('bcrypt')
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')
const dotenv  = require('dotenv')
const fs      = require('fs')

dotenv.config()

exports.signup = (req, res, next) => {
  const regexPass     = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[-+!*$@%_])([-+!*$@%_\w]{8,15})$/
  const regexEmail    = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
  const regexUsername = /^[a-zA-Z0-9]+$/
  const email         = req.body.email
  const username      = req.body.username
  const password      = req.body.password
  const birth         = req.body.birth
  const isAdmin       = req.body.isAdmin

  if(email === null || username === null || password === null) return res.status(401).json({ error: 'Empty fields' })

  if(!regexEmail.test(email)) return res.status(401).json({ error: 'The email adresse is incorrect'})

  if(!regexUsername.test(username)) return res.status(401).json({ error: 'Username must be have characters and numbers only'})

  if(regexPass.test(password)) {
    bcrypt.hash(password, 10)
    .then(hash => {
        delete req.body._id
        const user = new User ({
          username: username,
          email: email,
          password: hash,
          birth: birth,
          isAdmin: isAdmin
        })
        user.save()
          .then(() => res.status(201).json({ message: 'User Created !'}))
          .catch(error => res.status(400).json({ error: 'Canot create User !'}))
      })
      .catch(error => res.status(500).json( { error: "Server error"} ))
  } else {
    return res.status(401).json({ error: 'The password must be have minimum 8 characters, 1 numeric, 1 uppercase, 1 lowercase and 1 special character'})
  }
}

exports.login = (req, res, next) => {
  const email     = req.body.email
  const username  = req.body.username
  const password  = req.body.password

  User.findOne({$or: [
    { email: email },
    { username: username }
  ]})
    .then(user => {
      if(!user) return res.status(404).json({ error : 'User not found !'})

      bcrypt.compare(password, user.password)
        .then(valid => {
          if(!valid) return res.status(401).json({ error: 'Password is incorrect' })

          res.status(200).json({
            id: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.JWTOKEN,
              { expiresIn: '24h'}
            )
          })
        })
        .catch(error => res.status(500).json({ error: 'Error server !'}))
    })
    .catch(error => res.status(500).json({ error: 'Error server !'}))
}

exports.getUser = (req, res, next) => {
  const userId = req.params.id

  User.findById(userId)
    .then(user => {
      if(user) {
        res.status(200).json({
          id: user._id,
          email: user.email,
          username: user.username,
          birth: user.birth,
          imageProfile: user.imageProfile,
          isAdmin: user.isAdmin,
        })
      } else {
        res.status(404).json({ error: 'User not found !' })
      }
    })
    .catch(error => res.status(500).json({ error: new Error('Error canot get User !')}))
}

exports.modifyUser = (req, res, next) => {
  const userId = req.params.id

  const userObject = req.file ? {
    ...req.body,
    imageProfile: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  } : { ...req.body }
  User.updateOne ( { _id: userId }, { ...userObject, _id: userId })
  .then(() => res.status(200).json( {message: 'User modify with sucess !' }))
  .catch(error => res.status(400).json({ error: new Error('User not found !')}))
}

exports.deleteUser = (req, res, next) => {
  const userId = req.params.id

  User.findOne({ _id: userId })
    .then(user => {
      if(!user) return res.status(404).json({ error: new Error('User not found !')})

      const filename = user.imageProfile.split('/images/')[1]
      fs.unlink(`images/${filename}`, () => {
        User.deleteOne({ _id: userId })
          .then(() => res.status(200).json({ message: 'User deleted !'}))
          .catch(error => res.status(400).json( {error: new Error('Canot delete User !')}))
      })
    })
    .catch(error => res.satus(500).json({ error }))
  }