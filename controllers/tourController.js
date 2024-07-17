const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');

exports.getAllTours = factory.readAll(Tour);
exports.getTourById = factory.readOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// tours-within/:distance/center/:latlag/unit/:unit
// tours-within/233/center/40.7603841,29.9375394/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!distance || !latlng || !unit) {
    return next(
      new AppError('Please provide distance, latlng, and unit parameters', 400)
    );
  }

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide the latitude and longitude in the form lat,lng',
        400
      )
    );

  // in order to be able to do basic queries we need to first attribute an index to the field where the geo special data that we are serching for is stored. So in this case we need to add an index to startLocation.
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!latlng || !unit) {
    return next(
      new AppError('Please provide latlng, and unit parameters', 400)
    );
  }

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide the latitude and longitude in the form lat,lng',
        400
      )
    );

  // for geospatial aggregation there is only one single stage and that is called geoNear, and its alwayes need to be the first one in the pipeline. And it also require that atleast one of of our fields contains a geospatial index.
  // if there is only one field with geospatial index, then this geoNear stage will automaticlly use that index in order to perform the calclation. But if you have multiple fields with geospatial indexes then you need to use the keys parameter in order to define the field that you want to use for calculations.
  const distances = await Tour.aggregate([
    {
      // near is the point from which to calculate the distances. And we need to specify this point here as geojson.
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        // distanceField is the name of the field that will be crated and all the calculated distances will be stored in
        distanceField: 'distance',
        // to conver to km
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});
