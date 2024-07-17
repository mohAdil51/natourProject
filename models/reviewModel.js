const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'The review can not be empty!'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User_3',
      required: [true, 'The review must belong to a user!'],
    },
  ],
  tour: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour_3',
      required: [true, 'The review must belong to a tour!'],
    },
  ],
});

// each compination of tour and user always have to be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// methods points to the shcema and statics points to the model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        aveRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].aveRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// post does not have access to  next()
reviewSchema.post('save', async function () {
  // (this) points to the current document, and (constroctor) is basically the model who created the document
  // (this.constroctor) points to the model
  // now the problem here is that we want to call (calcAverageRatings), but we can only call it on a model but the model (Review) is not yet to be defined, the for we used (this.constroctor)

  await this.constructor.calcAverageRatings(this.tour);
});

// for (findByIdAndUpdate findByIdAndDelete) we dont have document midleware, we onlt have query middleware, and in a query we dont have access to the document.
// (findByIdAndUpdate findByIdAndDelete) is only a short for findOneAnd
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review_3', reviewSchema);

module.exports = Review;
