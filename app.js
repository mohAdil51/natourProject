const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const viewRouter = require('./routes/viewRouter');
const reviewRouter = require('./routes/reviewRoute');
const globalError = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
dotenv.config({ path: 'config.env' });

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global middlewares
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
// app.use(helmet());

// // Further HELMET configuration for Security Policy (CSP)
// const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
// const styleSrcUrls = [
//   'https://unpkg.com/',
//   'https://tile.openstreetmap.org',
//   'https://fonts.googleapis.com/',
// ];
// const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
// const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// // set security http headers
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:'],
//       objectSrc: [],
//       imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
//       fontSrc: ["'self'", ...fontSrcUrls],
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'unpkg.com'],
//       styleSrc: ["'self'", 'cdnjs.cloudflare.com'],
//       // fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
//       defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", ...fontSrcUrls],
//       scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
//       frameSrc: ["'self'", 'https://js.stripe.com'],
//       objectSrc: ["'none'"],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:', 'https://m.stripe.network'],
//       childSrc: ["'self'", 'blob:'],
//       imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
//       formAction: ["'self'"],
//       connectSrc: [
//         "'self'",
//         "'unsafe-inline'",
//         'data:',
//         'blob:',
//         ...connectSrcUrls,
//       ],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

// set security HTTP headers
// Further HELMET configuration for Security Policy (CSP) to unblock axios HTTP and leaflet map
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://*.stripe.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'ws://localhost:1234/',
  'https://*.stripe.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:', 'https://*.stripe.com'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:', 'https://*.stripe.com'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", 'https://*.stripe.com'],
    },
  })
);

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'unpkg.com'],
//       styleSrc: ["'self'", 'cdnjs.cloudflare.com'],
//       // fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
//     },
//   })
// );

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

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

app.use((req, res, next) => {
  console.log('hello from the middleware 🙌');
  // console.log(req.cookies);

  next();
});

// routes
app.use('/', viewRouter);
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
