const express = require('express')
const router = express.Router();
const controller = require('../controllers/orderController')
const userLoginMiddleware = require("../middleware/userLoginMiddleware");

router.get('/', userLoginMiddleware(true), controller.getUserOrders);
router.get('/make-order', userLoginMiddleware(true), controller.getOrderCreationPage);

router.post('/create', userLoginMiddleware(true), controller.makeOrder);

module.exports = router;