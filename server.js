const expressSession = require('express-session')
const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const http = require('http').createServer(app)

// Express App Config
const session = expressSession({
   secret: 'thisisasecret',
   resave: false,
   saveUninitialized: true,
   cookie: { secure: false }
})

app.use(session)
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(express.json({ limit: '50mb', extended: true }))

// routes
const countryRoutes = require('./api/country/country.routes')
app.use('/api/country', countryRoutes)

const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)

const logger = require('./services/logger.service')
const port = 5000
http.listen(port, () => {
   logger.info('Server is running on port: ' + port)
})
