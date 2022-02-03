const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getCountries, getCountry, deleteCountry, addCountry, updateCountry } = require('./country.controller')
const router = express.Router()

router.get('/', getCountries)

router.get('/:countryId', getCountry)
router.post('/', addCountry)
router.put('/:countryId', updateCountry)
router.delete('/:countryId', deleteCountry)

module.exports = router
