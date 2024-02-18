const express = require('express')
const router = express.Router();
const roleMiddleware = require('../middleware/roleMiddleware');
const controller = require('../controllers/adminController');
const {personalDataValidator} = require("../validators/index");

router.get('/', roleMiddleware(['restaurant_admin']), controller.getRestaurantAdminPanel)
router.get('/head', roleMiddleware(['head_admin']), controller.getAdminPanel);
router.get('/administrators', roleMiddleware(['head_admin']), controller.getRestaurantAdministrators);
router.get('/new', roleMiddleware(['head_admin']), controller.getAdminAddForm);

router.post('/new', roleMiddleware(['head_admin']), personalDataValidator, controller.createNewRestAdmin);

module.exports = router;