const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.strictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

router
  .route('/:id')
  .delete(
    authController.strictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.strictTo('user', 'admin'),
    reviewController.updateReview
  )
  .get(reviewController.getReviewById);

module.exports = router;
