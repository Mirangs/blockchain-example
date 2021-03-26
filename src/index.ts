import express from 'express'
import morgan from 'morgan'
import log4js from 'log4js'
import config from 'config'
import { Context } from 'utils/Context'
import apiRouter from 'routes'

log4js.configure(config.get('log4js'))
const log = log4js.getLogger('app')

const app = express()

app.use(morgan('combined'))
app.use((req, _, next) => {
  Context.bind(req)
  next()
})
app.use('/api', apiRouter)

const port = config.get('port')
app.listen(port, () => {
  log.info(`Server is listening port ${port}`)
})
