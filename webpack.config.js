const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = function () {
    const config = {
        mode: 'development',
        devtool: 'source-map',

        entry: './src/index.ts',

        output: {
            path: path.resolve(__dirname, 'www'),
            filename: 'bundle.js'
        },

        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                assets: path.resolve(__dirname, 'assets/')
            }
        },

        module: {
            rules: [
                { type: "javascript/auto", test: /assets(\/|\\)/, loader: 'file-loader?name=assets/[hash].[ext]' },
                { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' }
            ]
        },

        plugins: [
            new HtmlWebpackPlugin({
                title: 'Isochronal Tactics',
                template: path.resolve(__dirname, 'templates', 'index.ejs')
            }),

            new webpack.DefinePlugin({
                "typeof PLUGIN_FBINSTANT": JSON.stringify(false)
            })
        ],

        optimization: {
            minimizer: [
                new UglifyJsPlugin({

                })
            ]
        },

        devServer: {
            contentBase: path.join(__dirname, 'www'),
            port: 3001,   
            inline: true,
            compress: true,
            watchOptions: {
                aggregateTimeout: 300,
                poll: true,
                ignored: /node_modules/
            }
        }
    };

    return config;
}