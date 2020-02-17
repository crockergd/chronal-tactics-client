const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function () {
    let entry_file = 'app-browser';
    let template_file = 'index-browser.ejs';
    // if (process.env.platform && process.env.platform == 'mobile') {
    entry_file = 'app-mobile';
    template_file = 'index-mobile.ejs';
    // }

    const config = {
        mode: 'production',

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
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
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
                    test: /\.(wav|mp3|ogg)$/,
                    loader: 'file-loader',
                    include: [
                        path.resolve(__dirname, 'assets/audio')
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
                title: 'Chronal Tactics',
                template: path.join(__dirname, 'templates', template_file)
            }),

            new webpack.DefinePlugin({
                "typeof PLUGIN_FBINSTANT": JSON.stringify(false)
            })
        ],

        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        keep_classnames: true,
                        keep_fnames: true,
                        output: {
                            comments: false
                        }
                    },
                }),
            ],
        }
    };

    return config;
}