const express = require('express')
const router = express.Router();
const controller = require('../controllers/cartController')
const userLoginMiddleware = require("../middleware/userLoginMiddleware");

router.get('/', userLoginMiddleware(true), controller.getUserCartInfo);

router.post('/add', userLoginMiddleware(true), controller.addToCart);
router.post('/change/:itemId', userLoginMiddleware(true), controller.changeQuantity);
router.post('/delete-item/:itemId', userLoginMiddleware(true), controller.deleteItemFromCart);
router.post('/purge', userLoginMiddleware(true), controller.purgeCart);

module.exports = router;