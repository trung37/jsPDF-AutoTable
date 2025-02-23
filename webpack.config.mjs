import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import TerserPlugin from 'terser-webpack-plugin'
import * as url from 'url'

export default (env) => {
  const minified = !!env.minified
  const packageJsonStr = fs.readFileSync('package.json')
  const packageJson = JSON.parse(packageJsonStr)
  const newVersion = packageJson.version
  const currentYear = new Date().getFullYear()
  const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url))
  const outputPath = path.join(__dirname, './')

  return {
    entry: {
      [`dist/jspdf.plugin.autotable${minified ? '.min' : ''}`]: './src/main.ts',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      library: {
        name: 'jspdf-autotable',
        type: 'umd',
      },
      path: outputPath,
      filename: '[name].js',
      globalObject: "typeof self !== 'undefined' ? self : this",
    },
    module: {
      rules: [{ test: /\.ts$/, use: [{ loader: 'ts-loader' }] }],
    },
    performance: { hints: false },
    devServer: {
      static: {
        directory: '.',
      },
      port: 9000,
      proxy: {
        '/libs/jspdf.plugin.autotable.js': {
          target: 'http://localhost:9000/dist/',
          pathRewrite: { '^/libs': '' },
        },
      },
    },
    plugins: [
      new webpack.BannerPlugin(`
              jsPDF AutoTable plugin v${newVersion}

              Copyright (c) ${currentYear} Simon Bengtsson, https://github.com/simonbengtsson/jsPDF-AutoTable
              Licensed under the MIT License.
              http://opensource.org/licenses/mit-license
          `),
    ],
    optimization: {
      minimizer: [new TerserPlugin({ extractComments: false })],
      minimize: !!minified,
    },
  }
}
