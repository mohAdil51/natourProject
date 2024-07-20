const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLogedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLogedIn, viewController.getTour);
router.get('/login', authController.isLogedIn, viewController.login);
router.get('/me', authController.protect, viewController.myAccount);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateMyAccount
);

module.exports = router;
