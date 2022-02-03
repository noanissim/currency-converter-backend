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

// if (process.env.NODE_ENV === 'production') {
//    app.use(express.static(path.resolve(__dirname, 'public')))
//    app.use((req, res, next) => {
//       if (req.header('x-forwarded-proto') !== 'https') {
//          res.redirect(`https://${req.header('host')}${req.url}`)
//       } else next()
//    })
// } else {
//    const corsOptions = {
//       origin: ['http://127.0.0.1:8081', 'http://localhost:8081', 'http://127.0.0.1:8083', 'http://localhost:8083', 'http://127.0.0.1:3000', 'http://localhost:3000'],
//       credentials: true
//    }
//    app.use(cors(corsOptions))
// }

const countryRoutes = require('./api/country/country.routes')
// const { connectSockets } = require('./services/socket.service')

// routes
const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)

app.use('/api/country', countryRoutes)
// connectSockets(http, session)

// app.get('/**', (req, res) => {
//    res.sendFile(path.join(__dirname, 'public', 'index.html'))
// })

const logger = require('./services/logger.service')
const port = 5000
http.listen(port, () => {
   logger.info('Server is running on port: ' + port)
})
