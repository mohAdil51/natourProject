const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const util = require('util');

const sendToken = function (id) {
  return jwt.sign({ id }, process.env.SECRETKEY, {
    expiresIn: process.env.EXPIRESIN,
  });
};

exports.singUp = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   confirmPassword: req.body.confirmPassword,
  // });

  const newUser = await User.create(req.body);

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

exports.protect = catchAsync(async (req, res, next) => {
  // 1- get the token and see if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in, log in to get access', 401)
    );

  // 2- token verivation
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.SECRETKEY
  );
  console.log(decoded);

  // 3- cheack id user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to this token is no longer exists.', 401)
    );

  // 4- cheak if user changed password after the jwt was issued
  if (freshUser.cheachTimeStamp(decoded.iat))
    return next(
      new AppError(
        'This user recently changed the password. Please log in again',
        401
      )
    );

  // access granted
  req.user = freshUser;
  next();
});

exports.strictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );

    next();
  };
};
