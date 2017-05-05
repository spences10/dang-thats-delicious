const express = require('express')
const router = express.Router()

// so requset id the information and
// response is the methods for sending the data back
router.get('/', (req, res) => {
  res.send('Hey! It works!')
})

module.exports = router
