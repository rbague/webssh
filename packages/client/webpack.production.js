const { mergeWithCustomize } = require('webpack-merge')
const common = require('./webpack.config.js')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = mergeWithCustomize({
  customizeArray: function (common, _production, key) {
    if (key === 'plugins') {
      return [
        new CleanWebpackPlugin(),
        ...common,
        new CompressionPlugin({ minRatio: 1 })
      ]
    }

    return undefined
  }
})(common, {
  mode: 'production',
  devtool: 'source-map',
  devServer: undefined,
  plugins: [], // empty value so that customizeArray is called
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin()
    ]
  }
})
