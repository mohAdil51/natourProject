const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/singup').post(authController.singUp);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

// protect all routes after this middleware
router.use(authController.protect);

router.route('/me').get(userController.getMe, userController.getUserById);
router.route('/updatemypassword').patch(authController.updatePassword);
router.route('/updateMe').patch(userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);

// only admins are allowed to perform actions after this middleware
router.use(authController.strictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
