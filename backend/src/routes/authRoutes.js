const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

router.post('/login', [
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], authController.login);

module.exports = router;
