const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  // 1- get the data from collection
  const tours = await Tour.find();

  // 2- build tamplate
  // 3- render the page with the data form 1
  res.status(200).render('overview', {
    title: 'Natours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // -1 get the data from the database
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // 2- build tamplate
  // 3- render the page with data form 1
  res.status(200).render('tour', {
    title: tour.slug,
    tour,
  });
});

// exports.login = catchAsync(async (req, res, next) => {
//   // -1 get the data from the database
//   const user = await User.findOne({ email: req.params.email });

//   // 2- build tamplate
//   // 3- render the page with data form 1
//   res.status(200).render('login', {
//     title: 'Log into your account',
//   });
// });

exports.login = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'Log into your account',
    });
};
