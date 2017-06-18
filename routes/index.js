const express = require('express')
const router = express.Router()
const storeController = require('../controllers/storeController')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const { catchErrors } = require('../handlers/errorHandlers')

// so requset is the information and
// response is the methods for sending the data back
router.get('/', catchErrors(storeController.getStores))
router.get('/stores', catchErrors(storeController.getStores))
router.get('/add', authController.isLoggedIn, storeController.addStore)

router.post('/add', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
)

router.post('/add/:id', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
)

router.get('/stores/:id/edit', catchErrors(storeController.editStore))
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug))

router.get('/tags', catchErrors(storeController.getStoreByTag))
router.get('/tags/:tag', catchErrors(storeController.getStoreByTag))

router.get('/login', userController.loginForm)
router.post('/login', authController.login)
router.get('/register', userController.registerForm)

// 1. validate data
// 2. register user
// 3. log user in 
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
)

router.get('/logout', authController.logout)

router.get('/account', authController.isLoggedIn, userController.account)
router.post('/account' , catchErrors(userController.updateAccount))
router.post('/account/forgot', catchErrors(authController.forgot))
router.get('/account/reset/:token', catchErrors(authController.reset))
router.post('/account/reset/:token', 
  authController.confirmedPasswords, 
  catchErrors(authController.update)
)

/**
 * API 
 * 
 * Add in /api/v1/search 
 * 
 */ 

router.get('/api/search', catchErrors(storeController.searchStores))

module.exports = router
