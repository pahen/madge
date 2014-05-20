'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	detective = require('detective'),
	colors = require('colors'),
	Base = require('./base');

/**
 * This class will parse the CommonJS module format.
 * @see http://nodejs.org/api/modules.html
 * @constructor
 */
var CJS = module.exports = function () {
	Base.apply(this, arguments);
};

/**
 * Inherit from `Base`.
 */
util.inherits(CJS, Base);

/**
 * Normalize a module file path and return a proper identificator.
 * @param  {String} filename
 * @return {String}
 */
CJS.prototype.normalize = function (filename) {
	if (filename.charAt(0) !== '/') {
		// a core module (not mapped to a file)
		return this.replaceBackslashInPath(filename);
	}
	return Base.prototype.normalize.apply(this, arguments);
};

/**
 * Parse the given file and return all found dependencies.
 * @param  {String} filename
 * @return {Object}
 */
CJS.prototype.parseFile = function (filename) {
	try {
		if (fs.existsSync(filename)) {
			var dependencies = [],
				src = this.getFileSource(filename);

			this.emit('parseFile', {filename: filename, src: src});

			if (src.indexOf('require(') >= 0) {
				detective(src).map(function (id) {
					var depFilename = this.resolve(path.dirname(filename), id);
					if (depFilename) {
						return this.normalize(depFilename);
					}
				}, this).filter(function (id) {
					if (!this.isExcluded(id) && dependencies.indexOf(id) < 0) {
						dependencies.push(id);
					}
				}, this);

				return dependencies;
			}
		}
	} catch (e) {
		if (this.opts.breakOnError) {
			console.log(String('\nError while parsing file: ' + filename).red);
			throw e;
		}
	}

	return [];
};