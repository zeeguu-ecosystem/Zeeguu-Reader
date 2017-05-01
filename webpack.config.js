const webpack = require('webpack'),
    path = require('path'),
    ExtractTestPlugin = require("extract-text-webpack-plugin");

var inProduction = process.env.NODE_ENV === 'production';

module.exports = {
    entry: {
		subscription: './static/scripts/app/subscription/main.js',
		translation: './static/scripts/app/translation/main.js'
    },
    output: {
        path: path.join(__dirname, './static/scripts/dist'),
        filename: '[name].entry.js'
    },
	module: {
	 loaders: [
		 {
			 test: /\.js$/,
			 loader: 'babel-loader',
			 query: {
				 presets: ['es2015']
			 }
		 }
	 ]
	},
	stats: {
		colors: true
	},
	devtool: 'source-map'
};

if(inProduction) {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
}
