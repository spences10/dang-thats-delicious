const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')
const { catchErrors } = require('../handlers/errorHandlers')

// so requset is the information and
// response is the methods for sending the data back
router.get('/', storeController.homePage)
router.get('/add', storeController.addStore)
router.post('/add', catchErrors(storeController.createStore))

module.exports = router
