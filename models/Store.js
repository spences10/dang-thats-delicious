const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slugs')

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: 'Please enter a store name!' // pass an error if no name
    },
    slug: String,
    description: {
      type: String,
      trim: true
    },
    tags: [ String ],
    created: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [
        {
          type: Number,
          required: 'You must supply coordinates!'
        }
      ],
      address: {
        type: String,
        required: 'You must supply an address!'
      }
    },
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: 'You must supply an author'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Define indexes
storeSchema.index({
  name: 'text',
  description: 'text'
})

// geospatial data
storeSchema.index({ location: '2dsphere' })

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next() // skip
    return // stop the function, can also do `return next()`
  }
  this.slug = slug(this.name)
  // find other stores that have the same name
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i')
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx })
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`
  }
  next()
  // TODO make mor resiliant for unique slugs
})

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])
}

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // lookup stores and populate reviews
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews' // <generated field name
      }
    },
    // filter for items that 2+ reviews
    {
      $match: {
        'reviews.1': { $exists: true }
      }
    },
    // add average reviews field
    {
      // if you're on greater than mongo db >3 then no need to project fields
      $project: {
        photo: '$$ROOT.photo',
        name: '$$ROOT.name',
        reviews: '$$ROOT.reviews',
        slug: '$$ROOT.slug',
        averageRating: { $avg: '$reviews.rating' }
      }
    },
    // sort by generated filed
    {
      $sort: { averageRating: -1 }
    },
    // limit to top 10
    { $limit: 10 }
  ])
}

// find reviews where stores _id === reviews store
storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store'
})

function autopopulate(next) {
  this.populate('reviews')
  next()
}

storeSchema.pre('find', autopopulate)
storeSchema.pre('findOne', autopopulate)

module.exports = mongoose.model('Store', storeSchema)
