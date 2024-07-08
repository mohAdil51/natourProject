const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');

const sendToken = function (id) {
  return jwt.sign({ id }, process.env.SECRETKEY, {
    expiresIn: process.env.EXPIRESIN,
  });
};

exports.singUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = sendToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // get the email and password
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide the email and the password', 400));

  // see if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(
      new AppError(
        'The email or the password is not correct, please try again!',
        400
      )
    );

  // if every thing is fine send the token to the client
  const token = sendToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.strictTo = (...role) => {
  return (req, res, next) => {};
};
