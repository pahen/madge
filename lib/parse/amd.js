'use strict';

/**
 * Module dependencies
 */
var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	parse = require('./parse'),
	colors = require('colors'),
	Base = require('./base');


/**
 * This class will parse the AMD module format
 *
 * @see https://github.com/amdjs/amdjs-api/wiki/AMD
 * @constructor
 */
var AMD = module.exports = function () {
	Base.apply(this, arguments);
};

/**
 * Inherit from `Base`
 */
util.inherits(AMD, Base);

/**
 * Normalize a module file path and return a proper identificator
 *
 * @param  {String} filename
 * @return {String}
 */
AMD.prototype.normalize = function (filename) {

	var id = path.relative(this.baseDir, filename).replace(this.extRegEx, '');

	try {

		if (path.existsSync(filename)) {
			var content = fs.readFileSync(filename, 'utf8'),
				def = parse(id, filename, content);
			if (def) {
				var match = def.match(/define\("([^\"]+)"/);
				if (match) {
					return match[1];
				}
			}
		}

	} catch (e) {
		if (this.opts.breakOnError) {
			console.log(String('\nError while parsing file: ' + filename).red);
			throw e;
		}
	}

	return id;
};

/**
 * Parse the given file and return all found dependencies
 *
 * @param  {String} filename
 * @return {Object}
 */
AMD.prototype.parseFile = function (filename) {

	try {

		var dependencies = [],
			src = fs.readFileSync(filename, 'utf8');

		if (src.indexOf('define(') >= 0 || src.indexOf('require(') >= 0) {
			parse.findDependencies(filename, src).filter(function (id) {
				return id !== 'require';
			}).filter(function (id) {
				if (!this.isExcluded(id) && dependencies.indexOf(id) < 0) {
					dependencies.push(id);
				}
			}, this);

			return dependencies;
		}

	} catch (e) {
		if (this.opts.breakOnError) {
			console.log(String('\nError while parsing file: ' + filename).red);
			throw e;
		}
	}

	return [];
};