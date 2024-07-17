const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const globalError = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
dotenv.config({ path: 'config.env' });

// Global middlewares
// Set security HTTP headers
app.use(helmet());

// Development loggin
if (process.env.ENVIROMENT === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this api, try again in an hour!',
});
app.use('/api', limiter);

// body parser, reading data from body to req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitaization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitaization against XSS
app.use(xss());

// Preventing parameter pollution
app.use(
  hpp({
    whitelist: ['duration'],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('hello from the middleware 🙌');

  next();
});

// routes
app.use('/api/v3/tours', tourRouter);
app.use('/api/v3/users', userRouter);
app.use('/api/v3/reviews', reviewRouter);

// error handler
app.all('*', (req, res, next) => {
  next(new AppError('The requested route was not found', 500));
});

app.use(globalError);

// export app
module.exports = app;
