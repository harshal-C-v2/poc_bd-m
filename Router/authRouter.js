const express = require('express');
const authController = require('../Controller/AuthController');
const authMiddleware = require('../Midelwares/AuthMiddleware');

const router = express.Router();

router
  .route('/signup')
  .post(authMiddleware.hashPassword, authController.signUp);

router.route('/login').post(authController.login);
router
  .route('/resetPassword')
  .post(authController.forgetPasswordMail)
  .patch(authController.forgetPasswordSetPassword);

module.exports = router;
