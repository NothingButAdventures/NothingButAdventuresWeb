const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: [true, 'Review must be associated with a booking']
  },
  rating: {
    overall: {
      type: Number,
      required: [true, 'Review must have an overall rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    accommodation: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    transport: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    food: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    activities: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    guide: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    valueForMoney: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    }
  },
  title: {
    type: String,
    required: [true, 'Review must have a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review must have a comment'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  highlights: [{
    type: String,
    trim: true
  }],
  improvements: [{
    type: String,
    trim: true
  }],
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  traveledWith: {
    type: String,
    enum: ['solo', 'couple', 'family', 'friends', 'business'],
    required: true
  },
  ageGroup: {
    type: String,
    enum: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true
    },
    location: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNotes: String,
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  },
  responses: [{
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    authorType: {
      type: String,
      enum: ['admin', 'guide', 'support'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ tour: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ isVisible: 1 });
reviewSchema.index({ moderationStatus: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound indexes
reviewSchema.index({ tour: 1, isVisible: 1 });
reviewSchema.index({ tour: 1, 'rating.overall': -1 });
reviewSchema.index({ user: 1, tour: 1 }, { unique: true }); // Prevent duplicate reviews

// Virtual for average rating calculation
reviewSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating.overall,
    this.rating.accommodation,
    this.rating.transport,
    this.rating.food,
    this.rating.activities,
    this.rating.guide,
    this.rating.valueForMoney
  ].filter(rating => rating != null);

  if (ratings.length === 0) return this.rating.overall;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Pre-save middleware to auto-verify review if user has completed the tour
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Booking = mongoose.model('Booking');
    const booking = await Booking.findById(this.booking);
    
    if (booking && booking.status === 'completed') {
      this.isVerified = true;
      this.moderationStatus = 'approved';
    }
  }
  next();
});

// Static method to calculate tour rating statistics
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { 
        tour: tourId,
        isVisible: true,
        moderationStatus: 'approved'
      }
    },
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating.overall' },
        numRating: { $sum: 1 },
        avgAccommodation: { $avg: '$rating.accommodation' },
        avgTransport: { $avg: '$rating.transport' },
        avgFood: { $avg: '$rating.food' },
        avgActivities: { $avg: '$rating.activities' },
        avgGuide: { $avg: '$rating.guide' },
        avgValueForMoney: { $avg: '$rating.valueForMoney' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsAverage: Math.round(stats[0].avgRating * 10) / 10,
      ratingsQuantity: stats[0].numRating
    });
  } else {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 0
    });
  }
};

// Static method to get review statistics
reviewSchema.statics.getReviewStats = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { 
        tour: tourId,
        isVisible: true,
        moderationStatus: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating.overall' },
        recommendationRate: {
          $avg: { $cond: ['$wouldRecommend', 1, 0] }
        },
        ratingDistribution: {
          $push: '$rating.overall'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratingDistribution.forEach(rating => {
      distribution[Math.floor(rating)]++;
    });

    return {
      totalReviews: stats[0].totalReviews,
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      recommendationRate: Math.round(stats[0].recommendationRate * 100),
      ratingDistribution: distribution
    };
  }

  return null;
};

// Instance method to check if review can be edited
reviewSchema.methods.canBeEditedBy = function(userId) {
  const now = new Date();
  const createdAt = new Date(this.createdAt);
  const daysDifference = Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24));

  // Users can edit their reviews within 30 days of creation
  return this.user.toString() === userId.toString() && daysDifference <= 30;
};

// Update tour ratings after review save/update/delete
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post('findOneAndUpdate', function() {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post('findOneAndDelete', function() {
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;