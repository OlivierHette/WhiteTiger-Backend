const { error } = require('console')
const Post = require('../models/Post')
const fs = require('fs')
// const {Post, User} = require('../models')

exports.createPost = (req, res, next) => {
  const userId = req.body.userId
  const username = req.body.username
  const title = req.body.title
  const content = req.body.content
  const imageUrl = req.body.imageUrl
  const likes = req.body.likes

  const post = new Post({
    userId: userId,
    username: username,
    title: title,
    content: content,
    imageUrl: imageUrl,
    likes: likes
  })

  post.save()
    .then(() => res.status(201).json( { message: 'Post created !'} ))
    .catch(error => res.status(400).json( { error } ))
}

exports.getAllPost = (req, res, next) => {
  Post.find()
    .then(posts => res.status(200).json(posts))
    .catch(error => res.status(400).json({ error }))
}

exports.getPost = (req, res, next) => {
  const id = req.params.id

  Post.findById({ _id: id})
    .then(post => res.status(200).json(post))
    .catch(error => res.status(400).json({ error }))
}

exports.modifyPost = (req, res, next) => {
  const id = req.params.id

  const postObject = req.file ? { 
    ...req.body,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
   } : { ...req.body }

   Post.updateOne({ _id: id }, { ...postObject, _id: id })
    .then(() => res.status(200).json({ message: 'Post modified !'}))
    .catch(error => res.status(400).json({ error }))
}

exports.deletePost = (req, res, next) => {
  const id = req.params.id

  Post.findOne({ _id: id })
    .then(post => {
      if(!post) return res.status(404).json({ error: new Error('Post not found !')})
      
      const filename = post.imageUrl.split('/images/')[1]
      fs.unlink(`images/${filename}`, () => {
        Post.deleteOne({ _id: id })
          .then(() => res.status(200).json({ message: 'Post deleted with sucess !'}))
          .catch(error => res.status(400).json({ error }))
      })
    })
    .catch(error => res.status(500).json({ error }))
}

exports.likePost = (req, res, next) => {
  
}