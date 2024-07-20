const AppError = require('./../utils/appError');

// Production (client-oriented) error handlers
const TokenExpiredErrorHandler = (err) =>
  new AppError('Token has expired, please log in again', 401);

const invalidTokenHandler = (err) =>
  new AppError('Invalid token, Please log in again', 401);

const validationErrorHandler = (err) => {
  const values = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${values.join('. ')}`;
  return new AppError(message, 400);
};

const castErrorHandler = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const duplicateErrorHandler = (err) => {
  const value = err.errorResponse.errmsg.match(/\{([^}]+)\}/g);

  return new AppError(`Duplicate filed value (${value}): try anothr one`, 400);
};

// production errors
const prodError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // A) API
    // 1- if operational error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // 2- if not operational error
    // log the error
    console.log(err);

    // send generic message
    return res.status(404).json({
      status: 'fail',
      message: 'Something went very wrong',
    });
  }
  // B) RENDERED WEBSITE
  // 1- if operational error
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // 2- if not operational error
  // log the error
  console.log(err);

  // send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later!',
  });
};

// development errors
const devError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      err,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.ENVIROMENT === 'development') {
    devError(err, req, res);
  } else if (process.env.ENVIROMENT === 'production') {
    // let error = { ...err };
    // let error = Object.assign({}, err);

    if (err.name === 'CastError') err = castErrorHandler(err);
    if (err.code === 11000) err = duplicateErrorHandler(err);
    if (err.name === 'ValidationError') err = validationErrorHandler(err);
    if (err.name === 'JsonWebTokenError') err = invalidTokenHandler(err);
    if (err.name === 'TokenExpiredError') err = TokenExpiredErrorHandler(err);

    prodError(err, req, res);
  }
};
