const logger = require('../../services/logger.service')
const countryService = require('./country.service')

async function getCountries(req, res) {
   try {
      const filterBy = req.query
      const countries = await countryService.queryTemp(filterBy)
      res.send(countries)
   } catch (err) {
      logger.error('Cannot get countries', err)
      res.status(500).send({ err: 'Failed to get countries' })
   }
}

async function getCountry(req, res) {
   try {
      const country = await countryService.getById(req.params.countryId)
      res.send(country)
   } catch (err) {
      logger.error('Cannot get country', err)
      res.status(500).send({ err: 'Failed to get country' })
   }
}

async function deleteCountry(req, res) {
   try {
      await countryService.remove(req.params.countryId)
      res.send({ msg: 'Deleted successfully' })
   } catch (err) {
      logger.error('Failed to delete country', err)
      res.status(500).send({ err: 'Failed to delete country' })
   }
}

async function updateCountry(req, res) {
   try {
      const country = req.body
      const savedCountry = await countryService.save(country)
      res.send(savedCountry)
   } catch (err) {
      logger.error('Failed to update country', err)
      res.status(500).send({ err: 'Failed to update country' })
   }
}

async function addCountry(req, res) {
   try {
      var country = req.body
      country = await countryService.save(country)
      res.send(country)
   } catch (err) {
      logger.error('Failed to add country', err)
      res.status(500).send({ err: 'Failed to add country' })
   }
}

module.exports = {
   getCountries,
   getCountry,
   deleteCountry,
   addCountry,
   updateCountry
}
