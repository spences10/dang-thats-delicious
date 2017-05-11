const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slugs')

const storeSchema = new mongoose.Schema({
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
  tags: [String]
})

storeSchema.pre('save', function (next) {
  if (!this.isModified('name')) {
    next() // skip
    return // stop the function, can also do `return next()` 
  }
  this.slug = slug(this.slug)
  next()
  // TODO make mor resiliant for unique slugs
})

module.exports = mongoose.model('Store', storeSchema)
