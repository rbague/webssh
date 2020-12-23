const { merge } = require('webpack-merge')
const common = require('./webpack.config.js')

const CompressionPlugin = require('compression-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  devServer: undefined,
  plugins: [
    new CompressionPlugin({ minRatio: 1 })
  ],
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin()
    ]
  }
})
