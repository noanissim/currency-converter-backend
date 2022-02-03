var config

// keys.js - figure out what set of credentials to return
if (false && process.env.NODE_ENV === 'production') {
   // we are in production - return the prod set of keys
   config = require('./prod')
} else {
   // we are in development - return the dev keys!!!

   //TEMP!!!
   // config = require('./dev')
   config = require('./prod')
}

module.exports = config