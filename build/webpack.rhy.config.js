var path = require('path');
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {
        VueDigitRoll: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, '../lib'),
        publicPath: '/lib/',
        filename: 'index.js',
        library: 'VueDigitRoll',
        libraryTarget: 'commonjs',
    },
    externals: {
        vue: {
            root: 'Vue',
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue'
        }
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
    },
    module: {
        loaders: [{
            test: /\.vue$/,
            loader: 'vue-loader'
        }, {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [resolve('src')]
        }, {
            test: /\.css$/,
            loader: 'style!css!autoprefixer'
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            parallel: true
        })
    ]
}