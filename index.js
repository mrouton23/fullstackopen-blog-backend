const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config .PORT, () => {
  logger.info(`Server running on port ${config .PORT}`)
})

// const app = express()
// app.use(express.json())

// const unknownEndpoint = (request, response) => {
//   response.status(404).send({ error: 'unknown endpoint' })
// }

// app.use(unknownEndpoint)

// const errorHandler = (error, request, response, next) => {
//   console.error(error.message)

//   if (error.name === 'CastError') {
//     return response.status(400).send({ error: 'malformatted id' })
//   } else if (error.name === 'ValidationError') {
//     return response.status(400).json({ error: error.message })
//   }
//   next(error)
// }
// // this has to be the last loaded middleware, also all the routes should be registered before this!
// app.use(errorHandler)

// const PORT = config.PORT
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })