const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/singup').post(authController.singUp);
router.route('/login').post(authController.login);

router
  .route('/')
  .get(
    authController.protect,
    authController.strictTo('admin'),
    userController.getAllUsers
  )
  .post(
    userController.createUser,
    authController.protect,
    authController.strictTo('admin')
  );

router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
