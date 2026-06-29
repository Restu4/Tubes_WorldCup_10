const express = require('express');
const router = express.Router();
const standingController = require('../controllers/standingController');

router.get('/', standingController.getAll);
router.get('/group/:groupId', standingController.getByGroup);

module.exports = router;
