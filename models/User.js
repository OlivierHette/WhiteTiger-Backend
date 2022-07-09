const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true},
  birth: { type: Date, required: true },
  imageProfile: { type: String, required: false, default: 'https://images.unsplash.com/photo-1550973595-c9f4d21f38cc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80'},
  isAdmin: { type: Number, default: 0, min: 0, max: 2}
})

module.exports = mongoose.model('User', userSchema)