const webpack = require('webpack'),
    path = require('path'),
    ExtractTestPlugin = require("extract-text-webpack-plugin");

var inProduction = process.env.NODE_ENV === 'production';

function getVersion()
{
	return require("./package.json").version;
}

module.exports = {
    entry: {
		subscription: './src/umr/static/scripts/app/subscription/main.js',
		translation:  './src/umr/static/scripts/app/translation/main.js'
    },
    output: {
        path: path.join(__dirname, './src/umr/static/scripts/dist'),
        filename: '[name]-' + getVersion() + '.js'
    },
	module: {
	  rules: [{
		  test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
	  }],
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
	// Do production specific things here.
}
