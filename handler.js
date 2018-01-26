require('./util/node-8-backcompat')
/*
 * Handler definition for https://serverless.com/
 */
const BINARY_TYPES = [
  'image/png', 'image/x-icon', 'application/octet-stream',
  'application/font-woff', 'application/x-font-ttf',
]
const awsServerlessExpress = require('aws-serverless-express')

let serverPromise

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

  if (!serverPromise) {
    serverPromise =
      Promise.resolve(awsServerlessExpress.createServer(app, undefined, BINARY_TYPES))
  }

  // workaround for double gzip encoding issue
  // HTTP gzip encoding should be done higher-up via something like CloudFront/CloudFlare
  event.headers['Accept-Encoding'] = 'identity'

  console.log('proxying event=', event)

  serverPromise.then((server) => awsServerlessExpress.proxy(server, event, context))
}
