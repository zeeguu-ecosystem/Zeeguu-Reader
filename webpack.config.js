const webpack = require('webpack'),
    path = require('path'),
    ExtractTestPlugin = require("extract-text-webpack-plugin");

var inProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: {
		subscription: './static/scripts/app/subscription/main.js',
		translation: '/static/scripts/app/translation/main.js'
    },
    output: {
        path: path.join(__dirname, './dist'),
        filename: '[name].entry.js'
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/,
                use: ExtractTestPlugin.extract({
                    use: ['css-loader', 'sass-loader'],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.png$/,
                loader: 'file-loader',
                options: {
                    name: 'images/[name].[ext]'
                }
            }
        ]
    },
    plugins: [
        new ExtractTestPlugin('[name].css'),
        new webpack.LoaderOptionsPlugin({
            minimize: inProduction
        })
    ]
};

if(inProduction) {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
}
