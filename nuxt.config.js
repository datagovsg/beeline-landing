module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Beeline Singapore',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Beeline.sg - Singapore\'s marketplace for crowdsourced bus services' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.dev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  plugins: [
    '~/plugins/loadComponents.js',
    '~/plugins/googleMaps.js',
    '~/plugins/suggest.js',
  ]
}
