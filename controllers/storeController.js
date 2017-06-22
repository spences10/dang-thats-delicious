const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if(isPhoto) {
      next(null, true)
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index')
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' })
}

// read photo to memory
exports.upload = multer(multerOptions).single('photo')

// size the photo
exports.resize = async (req, res, next) => {
  if(!req.file) {
    next() // skio to next middlware
    return
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  // resize photo
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)
  // once written to file `next`
  next()
} 

exports.createStore = async (req, res) => {
  req.body.author = req.user._id // add author
  const store = await (new Store(req.body)).save()
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`)
  res.redirect(`/store/${store.slug}`)
}

exports.getStores = async (req, res) => {
  // get store(s) from the DB
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores })
}

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!')
  }
}

exports.editStore = async (req, res) => {
  // 1 find the sotre given id
  const store = await Store.findOne({ _id: req.params.id })
  // 2 confirm user is owner of
  confirmOwner(store, req.user)
  // 3 render out edit form
  res.render('editStore', { title: `Edit ${store.name}`, store})
}

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  req.body.location.type = 'Point'
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return new store instead of new one
    runValidators: true
  }).exec()
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store 👉</a>`)
  res.redirect(`/stores/${store._id}/edit`)
  // redirect to store with success msg
}

exports.getStoreBySlug = async (req, res, next) => {
  // query database for store
  const store = await Store.findOne({ slug: req.params.slug }).populate('author')
  if(!store) return next()
  res.render('store', { store, title: store.name })
}

exports.getStoreByTag = async (req, res) => {
  const tag = req.params.tag
  const tagQuery = tag || { $exists: true }
  const tagsPromise = Store.getTagsList()
  const storesPromise = Store.find({ tags: tagQuery })
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise])
  res.render('tag', { tags, title: 'Tags', tag, stores })
}

exports.searchStores = async (req, res) => {
  const stores = await Store
  // find stores that match query
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })
  // sort based on textScore
  .sort({
    score: { $meta: 'textScore' }
  })
  // limit to 5 results
  .limit(5)
  res.json(stores)
}

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat)
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // = 10km
      }
    }
  }
  
  const stores = await Store.find(q)
    // chain on the '.select' to specify which feilds you want
    // use '-' to exclude 
    .select('slug name description location photo')
    .limit(10)
  res.json(stores)
}

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' })
}
