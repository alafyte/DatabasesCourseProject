const express = require('express')
const router = express.Router();
const controller = require('../controllers/couriersController')
const roleMiddleware = require("../middleware/roleMiddleware");
const {courierDataValidator} = require("../validators/index");

router.get('/', roleMiddleware(['restaurant_admin']), controller.getAll);
router.get('/add', roleMiddleware(['restaurant_admin']), controller.getCreationForm);
router.get('/:courierId', roleMiddleware(['restaurant_admin']), controller.getChangeForm);

router.post('/add', roleMiddleware(['restaurant_admin']), courierDataValidator, controller.createNewCourier);

router.post('/change/:courierId', roleMiddleware(['restaurant_admin']), courierDataValidator, controller.changeCourier);

router.post('/delete/:courierId', roleMiddleware(['restaurant_admin']), controller.deleteCourier)

module.exports = router;