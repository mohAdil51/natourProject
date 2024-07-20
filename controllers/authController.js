const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const email = require('./../utils/email');

const sendToken = function (id) {
  return jwt.sign({ id }, process.env.SECRETKEY, {
    expiresIn: process.env.EXPIRESIN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = sendToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.ENVIROMENT === 'production') options.secure = true;
  res.cookie('jwt', token, options);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
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

  createSendToken(newUser, 201, res);
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
        401
      )
    );

  // if every thing is fine send the token to the client
  createSendToken(user, 200, res);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1- get the token and see if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = freshUser;
  next();
});

// only for rendered pages, there is no error
exports.isLogedIn = async (req, res, next) => {
  // 1- get the token and see if its there
  if (req.cookies.jwt) {
    try {
      // 2- token verivation
      const decoded = await util.promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.SECRETKEY
      );

      // 3- cheack id user still exist
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) return next();

      // 4- cheak if user changed password after the jwt was issued
      if (freshUser.cheachTimeStamp(decoded.iat)) return next();

      // access granted
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.strictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );

    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1- get the user from the collection
  const user = await User.findById(req.user.id).select('+password');

  // 2- cheak if the password is correct
  if (!(await user.correctPassword(req.body.password, user.password)))
    return next(new AppError('The password is not correct', 401));

  // 3- update the password
  user.password = req.body.newpassword;
  user.confirmPassword = req.body.newconfirmPassword;
  await user.save();
  // findByIdAndUpdate() will not work here

  // 4- send the token to login
  const token = sendToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1- get user based on given email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('This user was not found!', 404));

  // 2- generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3- send the email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v3/users/forgotPassword/${resetToken}`;

  const message = `Forgot your password? Please submit a PATCH request with your new password and passwordConfirm to this link: ${resetURL}. \nIf you did not forget your password, just ignore this message.`;

  try {
    await email({
      email: user.email,
      subject: 'Your password reset. (Valid for 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to the email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sendin the email!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1- get user based on token
  const passToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: passToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2- if token is not expired and the user exists, then update the password
  if (!user) return next(new AppError('Token is invalid on expired!', 500));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3- updated the passwordChangedAt property
  // 4- send jwt and log the user in
  createSendToken(user, 200, res);
});
