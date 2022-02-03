const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

const API_KEY = 'edcfa3216ba52990434c'
let gDefaultCurrencies = [
   {
      _id: _makeId(),
      name: 'Israel',
      code: 'ISR',
      coin: '₪',
      currencies: []
   },
   {
      _id: _makeId(),
      name: 'Europe',
      code: 'EUR',
      coin: '€',
      currencies: []
   },
   {
      _id: _makeId(),
      name: 'United Kingdom',
      code: 'GBP',
      coin: '£',
      currencies: []
   }
]

const emptyToCountry = {
   _id: _makeId(),
   name: '',
   code: '',
   coin: '',
   value: null
}

let destinationCountries = [
   {
      _id: _makeId(),
      name: 'Philippines',
      code: 'PHP',
      coin: '₱',
      flag: '🇵🇭'
   },
   {
      _id: _makeId(),
      name: 'Nepal',
      code: 'NPR',
      coin: '₨',
      flag: '🇳🇵'
   },
   {
      _id: _makeId(),
      name: 'Sri Lankas',
      code: 'LKR',
      coin: '₨',
      flag: '🇱🇰'
   },
   {
      _id: _makeId(),
      name: 'India',
      code: 'INR',
      coin: '₹',
      flag: '🇮🇳'
   },
   {
      _id: _makeId(),
      name: 'China',
      code: 'CNY',
      coin: '¥',
      flag: '🇨🇳'
   },
   {
      _id: _makeId(),
      name: 'Thiland',
      code: 'THB',
      coin: '฿',
      flag: '🇹🇭'
   },
   {
      _id: _makeId(),
      name: 'Ghana',
      code: 'GHS',
      coin: 'GH₵',
      flag: '🇬🇭'
   },
   {
      _id: _makeId(),
      name: 'Kenya',
      code: 'KES',
      coin: 'K',
      flag: '🇰🇪'
   },
   {
      _id: _makeId(),
      name: 'Nigeria',
      code: 'USD',
      coin: '$',
      flag: '🇳🇬'
   },
   {
      _id: _makeId(),
      name: 'South Africa',
      code: 'ZAR',
      coin: 'R',
      flag: '🇿🇦'
   }
]

function _makeId(length = 10) {
   var txt = ''
   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   for (var i = 0; i < length; i++) {
      txt += possible.charAt(Math.floor(Math.random() * possible.length))
   }
   return txt
}

async function getCurrency(filterBy = null) {
   let url = `https://free.currconv.com/api/v7/convert?q=${filterBy.from}_${filterBy.to}&apiKey=${API_KEY}`
   try {
      const res = await axios.get(url)
      console.log('res.data', res.data)
      return res.data
   } catch (err) {
      console.log(err)
   }
}

async function query(filterBy = {}) {
   try {
      const criteria = _buildCriteria(filterBy)
      const collection = await dbService.getCollection('country')
      const countries = await collection.find(criteria).toArray()
      // gDefaultCurrencies.forEach(country => {
      //    let from = country.code
      //    destinationCountries.forEach(async destination => {
      //       let myFilter = {
      //          from,
      //          to: destination.code
      //       }
      //       let res = await getCurrency(myFilter)
      //       console.log('res :>>', res)
      //    })
      // })
      // console.log('countries :>>', countries)
      return countries
   } catch (err) {
      logger.error('cannot find countries', err)
      throw err
   }
}

async function save(country) {
   const { name, code, coin, currencies } = country
   let savedCountry
   if (country._id) {
      try {
         savedCountry = {
            _id: ObjectId(country._id),
            name,
            code,
            coin,
            currencies
         }
         const collection = await dbService.getCollection('country')
         await collection.updateOne({ _id: savedCountry._id }, { $set: savedCountry })
         return savedCountry
      } catch (err) {
         logger.error('cannot update country', err)
         throw err
      }
   } else {
      try {
         savedCountry = {
            createdAt: ObjectId().getTimestamp(),
            name,
            code,
            coin,
            currencies
         }
         const collection = await dbService.getCollection('country')
         await collection.insertOne(savedCountry)
         return savedCountry
      } catch (err) {
         logger.error('cannot add country', err)
         throw err
      }
   }
}

async function getById(countryId) {
   try {
      const collection = await dbService.getCollection('country')
      const country = await collection.findOne({ _id: ObjectId(countryId) })
      return country
   } catch (err) {
      logger.error(`while finding country ${countryId}`, err)
      throw err
   }
}

async function remove(countryId) {
   try {
      const collection = await dbService.getCollection('country')

      // remove only if user is owner/admin
      // const criteria = { _id: ObjectId(reviewId) }
      // if (!isAdmin) criteria.byUserId = ObjectId(userId)
      await collection.deleteOne({ _id: ObjectId(countryId) })
   } catch (err) {
      logger.error(`cannot remove country ${countryId}`, err)
      throw err
   }
}

function _buildCriteria(filterBy) {
   const criteria = {}
   const { ctg } = filterBy
   return ctg
}

module.exports = {
   query,
   remove,
   getById,
   save
}
