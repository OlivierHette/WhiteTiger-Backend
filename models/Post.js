const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  title: { type: String, required: true, maxLength: 255 },
  content: { type: String, maxLength: 1000 },
  imageUrl: { type: String, required: false },
  likes: { type: Number, default: 0 },
},
{
  timestamps: true
})

module.exports = mongoose.model('Post', postSchema)