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

const serverPromise = Promise.resolve()
  .then(makeApp)
  .then(app => awsServerlessExpress.createServer(app, undefined, BINARY_TYPES))

module.exports.main = (event, context) => {
  // workaround for double gzip encoding issue
  // HTTP gzip encoding should be done higher-up via something like CloudFront/CloudFlare
  event.headers['Accept-Encoding'] = 'identity'

  console.log('proxying event=', event)

  serverPromise.then(server => awsServerlessExpress.proxy(server, event, context))
}
