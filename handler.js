require('./util/node-8-backcompat')
/*
 * Handler definition for https://serverless.com/
 */
const BINARY_TYPES = [
  'image/png', 'image/x-icon', 'application/octet-stream',
  'application/font-woff', 'application/x-font-ttf',
]
const awsServerlessExpress = require('aws-serverless-express')

function makeApp() {
  const { Nuxt } = require('./nuxt-es5')

  let nuxtConfig = require('./nuxt.config.js')
  nuxtConfig.dev = false
  const nuxt = new Nuxt(nuxtConfig)

  return nuxt.render
}

module.exports.main = (event, context) => {
  const app = context.app || makeApp()
  if (!context.app) {
    context.app = app
  }

  const server = context.server || awsServerlessExpress.createServer(app, undefined, BINARY_TYPES)
  if (!context.server) {
    context.server = server
  }

  // workaround for double gzip encoding issue
  // HTTP gzip encoding should be done higher-up via something like CloudFront/CloudFlare
  event.headers['Accept-Encoding'] = 'identity'

  console.log('proxying event=', event)

  const c = Object.assign({}, context)
  delete c.server
  awsServerlessExpress.proxy(server, event, c)
}
