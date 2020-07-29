const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    app: resolve('./dev/index.ts')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: resolve('./dev/index.html')
    })
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  output: {
    filename: '[name].bundle.[hash:10].js',
    path: resolve('dist'),
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: true,
    contentBase: resolve('dist'),
    port: 9000,
    disableHostCheck: true
  }
};

function resolve(uri) {
  return path.resolve(__dirname, uri);
}