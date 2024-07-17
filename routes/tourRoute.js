const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

router.use('/:tourId/review', reviewRouter);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within/?distance=233&center=-40,25&unit=mi
// /tours-within/233/center/-40,25/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.strictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.strictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.strictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
