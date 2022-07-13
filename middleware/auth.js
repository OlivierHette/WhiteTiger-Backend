const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, JWTOKEN)
    const userId = decodedToken.userId

    req.auth = {
      userId: userId
    }
  } catch (err) {
    res.status(401).json({ error: 'Authentification error !'})
  }
}