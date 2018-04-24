const webpack = require('webpack'),
    path = require('path'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

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
          use: ExtractTextPlugin.extract({
                use: 'css-loader'
          })
	},
    {
    		test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
        	options: {
			     	 presets: ['env']
        	}
		 }
	 ]
	},
	plugins: [
        new ExtractTextPlugin('css/[name]-' + getVersion() + '.css'),
    ],
	stats: {
		colors: true
	},
	devtool: 'source-map'
};

if(inProduction) {
	// Do production specific things here.
}
