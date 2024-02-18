const express = require('express')
const router = express.Router()
const controller = require('../controllers/usersController')
const userLoginMiddleware = require('../middleware/userLoginMiddleware')
const {check} = require("express-validator")

router.get('/registration', userLoginMiddleware(false), controller.registration)
router.get('/login', userLoginMiddleware(false), controller.login)

module.exports = router;