const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const teamRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('code')
    .notEmpty().withMessage('Code is required')
    .isLength({ min: 3, max: 3 }).withMessage('Code must be 3 characters')
    .isUppercase().withMessage('Code must be uppercase'),
  body('group').notEmpty().withMessage('Group is required'),
];

router.get('/', teamController.getAll);
router.get('/:id', teamController.getById);
router.post('/', authenticate, teamRules, validate, teamController.create);
router.put('/:id', authenticate, teamController.update);
router.delete('/:id', authenticate, teamController.remove);

module.exports = router;
