const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...items) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (items.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1- send ERROR if password is posted
  if (req.body.password)
    return next(
      new AppError(
        'You can not updated your password from here, follow this link instead /updateMyPassword.',
        400
      )
    );

  // 2- filter out unwanted items in the body
  const filterdObj = filterObj(req.body, 'name', 'email');

  // 3- update the user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.readAll(User);
exports.getUserById = factory.readOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
