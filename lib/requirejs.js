'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	parse = require('./parse/parse');

/**
 * Read shim dependencies from RequireJS config.
 * @param  {String} filename
 * @param  {String} [exclude]
 */
module.exports.getShimDepsFromConfig = function (filename, exclude) {
	var deps = {},
		config = parse.findConfig(filename, fs.readFileSync(filename, 'utf8')),
        excludeRegex = exclude ? new RegExp(exclude) : false,
        isIncluded = function (key) {
            return !(excludeRegex && key.match(excludeRegex));
        };

	if (config.shim) {
		Object.keys(config.shim).filter(isIncluded).forEach(function (key) {
			if (config.shim[key].deps) {
				deps[key] = config.shim[key].deps.filter(isIncluded);
			} else {
				deps[key] = [];
			}
		});
	}

	return deps;
};