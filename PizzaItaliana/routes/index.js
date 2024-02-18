const express = require('express');
const indexController = require("../controllers/indexController");
const router = express.Router();

/* GET home page. */
router.get('/', indexController.getIndex);

router.get('/contact', indexController.contact);
router.get('/about', indexController.about);
router.get('/rules', indexController.forClient);

router.get('/map', indexController.map);

module.exports = router;
