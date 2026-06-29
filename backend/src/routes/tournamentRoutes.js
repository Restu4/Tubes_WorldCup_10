const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { authenticate } = require('../middleware/auth');

router.get('/status', tournamentController.getStatus);
router.post('/setup', authenticate, tournamentController.setup);
router.post('/advance', authenticate, tournamentController.advance);
router.post('/reset', authenticate, tournamentController.reset);

module.exports = router;
