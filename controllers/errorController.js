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
const prodError = (err, res) => {
  // 1- if operational error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // 2- if not operational error
  else {
    // log the error
    console.log(err);

    // send generic message
    res.status(404).json({
      status: 'fail',
      message: 'Something went very wrong',
    });
  }
};

// development errors
const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    err,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.ENVIROMENT === 'development') {
    devError(err, res);
  } else if (process.env.ENVIROMENT === 'production') {
    // let error = { ...err };
    // let error = Object.assign({}, err);

    if (err.name === 'CastError') err = castErrorHandler(err);
    if (err.code === 11000) err = duplicateErrorHandler(err);
    if (err.name === 'ValidationError') err = validationErrorHandler(err);
    if (err.name === 'JsonWebTokenError') err = invalidTokenHandler(err);
    if (err.name === 'TokenExpiredError') err = TokenExpiredErrorHandler(err);

    prodError(err, res);
  }
};
