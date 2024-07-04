const express = require('express');
const dotenv = require('dotenv');

const tourRouter = require('./routes/tourRoute');
const globalError = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();
dotenv.config({ path: 'config.env' });

// body parser
app.use(express.json());

// middleware
app.use((req, res, next) => {
  console.log('hellow from the middleware 🙌');

  next();
});

// routes
app.use('/api/v3/tours', tourRouter);

// error handler
app.all('*', (req, res, next) => {
  next(new AppError('The requested route was not found', 500));
});

app.use(globalError);

// export app
module.exports = app;
