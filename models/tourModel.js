const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    default: 30,
  },
  maxGroupSize: Number,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'difficult'],
  },
  ratingsAverage: Number,
  ratingsQuantity: Number,
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  summary: {
    type: String,
  },
  description: {
    type: String,
  },
  imageCover: String,
  images: [String],
  startDates: [Date],
});

const Tour = mongoose.model('Tour_3', tourSchema);

module.exports = Tour;
