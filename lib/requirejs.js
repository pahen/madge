'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	parse = require('./parse/parse');

/**
 * Read shim dependencies from RequireJS config.
 * @param  {String} filename
 */
module.exports.getShimDepsFromConfig = function (filename) {
	var deps = {},
		config = parse.findConfig(filename, fs.readFileSync(filename, 'utf8'));

	if (config.shim) {
		Object.keys(config.shim).forEach(function (key) {
			if (config.shim[key].deps) {
				deps[key] = config.shim[key].deps;
			} else {
				deps[key] = [];
			}
		});
	}

	return deps;
};