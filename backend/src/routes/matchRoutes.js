const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');

const resultRules = [
  param('id').isInt().withMessage('Match ID must be an integer'),
  body('scoreA').isInt({ min: 0 }).withMessage('Score A must be a non-negative integer'),
  body('scoreB').isInt({ min: 0 }).withMessage('Score B must be a non-negative integer'),
];

router.get('/', matchController.getAll);
router.get('/group/:groupId', matchController.getByGroup);
router.get('/:id', matchController.getById);
router.put('/:id/result', authenticate, resultRules, validate, matchController.updateResult);

module.exports = router;
