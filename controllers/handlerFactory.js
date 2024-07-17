const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatuers');

exports.readAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // to allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  });
};

exports.readOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) return next(new AppError('No documnet found with that Id!', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
};

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No documnet found with that Id!', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No documnet found with that Id!', 404));

    res.status(404).json({
      status: 'success',
      data: null,
    });
  });
