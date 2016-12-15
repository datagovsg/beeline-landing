var path = require('path')
var utils = require('./build/utils')

var env = process.env.NODE_ENV
// check env & config/index.js to decide weither to enable CSS Sourcemaps for the
// various preprocessor loaders added to vue-loader at the end of this file
var cssSourceMapDev = (env === 'development' && config.dev.cssSourceMap)
var cssSourceMapProd = (env === 'production' && config.build.productionSourceMap)
var useCssSourceMap = cssSourceMapDev || cssSourceMapProd

module.exports = {
  entry: {
    app: './static/src/main.js'
  },
  output: {
    path: './static/dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.vue'],
    fallback: [path.join(__dirname, './node_modules')],
    alias: {
      'vue$': 'vue/dist/vue',
      // 'src': path.resolve(__dirname, './static/src'),
      'assets': path.resolve(__dirname, './static/src/assets'),
      'components': path.resolve(__dirname, './static/src/components')
    }
  },
  resolveLoader: {
    fallback: [path.join(__dirname, 'node_modules')]
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: /src/,
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.css/,
        loaders: ['style', 'css'],
      },
      {
        test: /\.scss/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue'
    }
  },
  // eslint: {
  //   formatter: require('eslint-friendly-formatter')
  // },
  vue: {
    loaders: {
      sass: 'style!css!sass',
      scss: 'style!css!sass',
      js: 'babel'
    },
    postcss: [
      require('autoprefixer')({
        browsers: ['last 2 versions']
      })
    ]
  },
  babel: {
    presets: ['es2015', 'stage-2']
  }
}
