const express = require('express')
const router = express.Router();
const {upload_disk} = require('../upload');
const controller = require('../controllers/menuController')
const roleMiddleware = require("../middleware/roleMiddleware");
const {menuDataValidator} = require("../validators/index");

router.get('/', roleMiddleware(['head_admin']), controller.getAll);
router.get('/add', roleMiddleware(['head_admin']), controller.getCreationForm);
router.get('/:productId', roleMiddleware(['head_admin']), controller.getChangeForm);
router.get('/details/:productId', controller.getProductDetails);

router.post('/add', roleMiddleware(['head_admin']), upload_disk.single('item_image'),
    menuDataValidator,
    controller.createNewProduct);

router.post('/change/:productId', roleMiddleware(['head_admin']), upload_disk.single('item_image'),
    menuDataValidator,
    controller.changeProduct);

router.post('/delete/:productId', roleMiddleware(['head_admin']), controller.deleteProduct);

module.exports = router;