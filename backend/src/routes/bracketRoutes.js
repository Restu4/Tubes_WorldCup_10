const express = require('express');
const router = express.Router();
const bracketController = require('../controllers/bracketController');

router.get('/', bracketController.getBracket);

module.exports = router;
