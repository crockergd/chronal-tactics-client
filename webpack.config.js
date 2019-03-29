const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
    let entry_file = 'app-browser';
    let template_file = 'index-browser.ejs';
    if (process.env.platform && process.env.platform == 'mobile') {
        entry_file = 'app-mobile';
        template_file = 'index-mobile.ejs';
    }

    const config = {
        mode: 'development',
        devtool: 'eval-source-map',

        entry: path.join(__dirname, 'src', entry_file),

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
                template: path.resolve(__dirname, 'templates', template_file)
            }),

            new webpack.DefinePlugin({
                "typeof PLUGIN_FBINSTANT": JSON.stringify(false)
            })
        ],

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