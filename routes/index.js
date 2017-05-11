const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')

// so requset is the information and
// response is the methods for sending the data back
router.get('/', storeController.homePage)

module.exports = router
