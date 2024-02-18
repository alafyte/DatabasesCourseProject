const express = require('express')
const router = express.Router();
const {upload} = require('../upload');
const controller = require('../controllers/restaurantsController')
const roleMiddleware = require("../middleware/roleMiddleware");
const {restaurantDataValidator} = require("../validators");

router.get('/', roleMiddleware(['head_admin']), controller.getAll);
router.get('/add', roleMiddleware(['head_admin']), controller.getCreationForm);
router.get('/restaurant/:restaurantId', roleMiddleware(['restaurant_admin']), controller.getRestaurantByAdmin);
router.get('/:restaurantId', roleMiddleware(['head_admin']), controller.getChangeForm);

router.post('/add', roleMiddleware(['head_admin']),
    upload.single('coverage_area'), restaurantDataValidator, controller.createNewRestaurant);

router.post('/change/:restaurantId', roleMiddleware(['head_admin']),
    upload.single('coverage_area'), restaurantDataValidator,
    controller.changeRest);

router.post('/delete/:restaurantId', roleMiddleware(['head_admin']), controller.deleteRestaurant);
router.post('/find', controller.findRestaurant);

module.exports = router;