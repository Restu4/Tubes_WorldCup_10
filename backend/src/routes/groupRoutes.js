const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.get('/', groupController.getAll);
router.get('/:id/standings', groupController.getStandings);

module.exports = router;
