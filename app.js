const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const globalError = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
dotenv.config({ path: 'config.env' });

// body parser
app.use(express.json());

// middleware
app.use(morgan('dev'));

app.use((req, res, next) => {
  console.log('hello from the middleware 🙌');

  next();
});

// routes
app.use('/api/v3/tours', tourRouter);
app.use('/api/v3/users', userRouter);

// error handler
app.all('*', (req, res, next) => {
  next(new AppError('The requested route was not found', 500));
});

app.use(globalError);

// export app
module.exports = app;
