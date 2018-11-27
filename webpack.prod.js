const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = function () {
    const config = {
        mode: 'production',

        entry: './src/index.ts',

        output: {
            path: path.resolve(__dirname, 'www'),
            filename: 'bundle.js'
        },

        resolve: {
            extensions: ['.ts', '.js']
        },

        module: {
            rules: [
                {
                    test: /\.(woff|woff2|eot|ttf)$/,
                    use: ['url-loader?limit=100000'],
                    include: [
                        path.resolve(__dirname, 'assets/fonts')
                    ]
                },
                {
                    test: /\.css$/,
                    loader: 'style-loader!css-loader',
                    include: [
                        path.resolve(__dirname, 'assets/styles')
                    ]
                },
                {
                    type: "javascript/auto",
                    test: /\.(png|json)$/,
                    loader: 'file-loader?name=assets/[hash].[ext]',
                    include: [
                        path.resolve(__dirname, 'assets/')
                    ]
                },
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    include: [
                        path.resolve(__dirname, 'src/')
                    ]
                }
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
                    uglifyOptions: {
                        keep_fnames: true
                    }
                })
            ]
        }
    };

    return config;
}