const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env) => {
    let entry_file = 'app-browser';
    let template_file = 'index-browser.ejs';

    if (env.platform && env.platform == 'mobile') {
        entry_file = 'app-mobile';
        template_file = 'index-mobile.ejs';
    }

    const config = {
        mode: 'development',

        entry: path.join(__dirname, 'src', entry_file),

        output: {
            path: path.resolve(__dirname, 'www'),
            filename: 'bundle.js',
            assetModuleFilename: 'assets/[hash][ext][query]',
            pathinfo: false
        },

        resolve: {
            extensions: ['.ts', '.js'],
            symlinks: false
        },

        module: {
            rules: [
                {
                    test: /\.(png|xml|fnt)$/,
                    type: 'asset/resource',
                    include: [
                        path.resolve(__dirname, 'assets/images'),
                        path.resolve(__dirname, 'assets/tilesheets'),
                        path.resolve(__dirname, 'assets/bitmaps')
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
                    include: path.resolve(__dirname, 'src/'),
                    options: {
                        transpileOnly: false
                    }
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
                "typeof PLUGIN_FBINSTANT": JSON.stringify(false),
                BUILD_PRODUCTION: JSON.stringify(false)
            })
        ],

        devtool: 'eval-source-map',
        devServer: {
            port: 3002,
            static: {
                directory: path.resolve(__dirname, "www")
            }
        }
    };

    return config;
};