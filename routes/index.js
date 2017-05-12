const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')

// so requset is the information and
// response is the methods for sending the data back
router.get('/', storeController.homePage)
router.get('/add', storeController.addStore)
router.post('/add', storeController.createStore)

module.exports = router
