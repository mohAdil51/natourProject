const mongoose = require('mongoose');
const slugify = require('slugify');

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
  slug: String,
});

// Document middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

const Tour = mongoose.model('Tour_3', tourSchema);

module.exports = Tour;
