const axios = require('axios')

const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

const savedJsonData = require('../../data.json')

const apiUrl = 'https://free.currconv.com/api/v7/convert?q=USD_PHP&compact=ultra&apiKey='
const API_KEY1 = 'edcfa3216ba52990434c'
const API_KEY2 = '7bac8c339872fb348d80'
const API_KEY3 = 'cb938152f35b77903da4'
const API_KEY4 = '3f8e5073b3cbf15cf9fc'

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

//Temp because here I'm using temp JSON file and not the API
async function queryTemp(filterBy = {}) {
   try {
      const criteria = _buildCriteria(filterBy)
      const collection = await dbService.getCollection('country')
      const countries = await collection.find(criteria).toArray()
      return countries
   } catch (err) {
      console.log(err)
   }
}

//--------------*******Important notes*******----------------------
//because my keys have been blocked, I cant make API calls,
//so I'm using JSON file which was copied from the collection
//in mongoDB atlas.
//The API converter i used, knew to convert all the currencies,
//but if I had to implement it on my own, I would've made an array of countries,
//sorted by the countries which have the biggest number of destination countries with currency trade,
//(for example USA, EUR...) and then, if I had a currency trade from a country to a
//remote destination without a direct trade, I would have checked with the countries
//on my new array, and if there was a match in trade(both in the source and destination)
//I would do the conversion
async function query(filterBy = {}) {
   try {
      const criteria = _buildCriteria(filterBy)
      const collection = await dbService.getCollection('country')
      const countries = await collection.find(criteria).toArray()
      let updatedCountries = countries.map(async country => {
         if (country.currencies.length) return country
         try {
            await Promise.all(
               destinationCountries.map(async destination => {
                  try {
                     let myFilter = { from: '', to: '', value: null }

                     myFilter.from = country.code
                     myFilter.to = destination.code
                     let url = `https://free.currconv.com/api/v7/convert?q=${myFilter.from}_${myFilter.to}&compact=ultra&&apiKey=${API_KEY4}`
                     let ans = await axios.get(url)
                     if (ans.data && ans.data[`${myFilter.from}_${myFilter.to}`]) {
                        myFilter.value = ans.data[`${myFilter.from}_${myFilter.to}`]
                        country.currencies.push(myFilter)
                     }
                     myFilter = null
                  } catch (err) {
                     console.log(err)
                  }
               })
            )
            let updatedCountry = await save(country)
            return updatedCountry
         } catch (err) {
            console.log(err)
         }
      })
      return updatedCountries
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

function _makeId(length = 10) {
   var txt = ''
   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   for (var i = 0; i < length; i++) {
      txt += possible.charAt(Math.floor(Math.random() * possible.length))
   }
   return txt
}

module.exports = {
   query,
   queryTemp,
   remove,
   getById,
   save
}
