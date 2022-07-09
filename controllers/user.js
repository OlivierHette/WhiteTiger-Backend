const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const dotenv = require('dotenv')

dotenv.config()

exports.signup = (req, res, next) => {
  let regexPass = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[-+!*$@%_])([-+!*$@%_\w]{8,15})$/
  let regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
  // let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  let regexUsername = /^[a-zA-Z0-9]+$/
  let email = req.body.email
  let username = req.body.username
  let password = req.body.password
  let birth = req.body.birth
  let isAdmin = req.body.isAdmin

  console.log('email -->', email);
  console.log('username -->', username);
  console.log('password -->', password);
  console.log('birth -->', birth);
  console.log('isAdmin -->',isAdmin);
  console.log('test regex -->', regexEmail.test(email));

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
  let email = req.body.email
  let username = req.body.username
  let password = req.body.password

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