const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
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
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User_3',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// indexies
tourSchema.index({ slug: 1 });
// for geo special data this index need to be 2D sphere index if the data descripe a real point on earth like sphere, we instead we can use a 2D index if we are using just fictional points on a simple two dimensional plane
tourSchema.index({ startLocation: '2dsphere' });

// Document middleware: runs before save() and create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: 'name photo role',
  });

  next();
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review_3',
  foreignField: 'tour',
  localField: '_id',
});

const Tour = mongoose.model('Tour_3', tourSchema);

module.exports = Tour;
