const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = () => {
    const entry_file = 'app-mobile';
    const template_file = 'index-mobile.ejs';

    const config = {
        mode: 'production',

        entry: path.join(__dirname, 'src', entry_file),

        output: {
            path: path.resolve(__dirname, 'www'),
            filename: 'bundle.js',
            assetModuleFilename: 'assets/[hash][ext][query]'
        },

        resolve: {
            extensions: ['.ts', '.js']
        },

        module: {
            rules: [
                {
                    test: /\.(png)$/,
                    type: 'asset/resource',
                    include: [
                        path.resolve(__dirname, 'assets/images'),
                        path.resolve(__dirname, 'assets/tilesheets')
                    ]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                    include: path.resolve(__dirname, 'assets/fonts')
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader'
                    ],
                    include: path.resolve(__dirname, 'assets/styles')
                },
                {
                    test: /\.(wav|mp3|ogg)$/,
                    type: 'asset/resource',
                    include: path.resolve(__dirname, 'assets/audio')
                },
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    include: path.resolve(__dirname, 'src/')
                }
            ]
        },

        plugins: [
            new CleanWebpackPlugin(),

            new HtmlWebpackPlugin({
                title: 'Chronal Tactics',
                template: path.join(__dirname, 'templates', template_file)
            }),

            new webpack.DefinePlugin({
                "typeof PLUGIN_FBINSTANT": JSON.stringify(false)
            })
        ],

        // devtool: 'source-map',
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