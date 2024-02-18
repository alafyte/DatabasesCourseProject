const express = require('express')
const router = express.Router()
const controller = require('../controllers/authController')
const userLoginMiddleware = require('../middleware/userLoginMiddleware')
const {personalDataValidator} = require("../validators/index");

router.post('/registration', userLoginMiddleware(false), personalDataValidator, controller.registration);
router.post('/login', userLoginMiddleware(false), controller.login);
router.get('/logout', userLoginMiddleware(true), controller.logout);

module.exports = router;