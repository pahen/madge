'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');
var util = require('util');
var detective = require('detective-es6');
var Base = require('./base');

/**
 * This class will parse the ES6 module format.
 * @see http://nodejs.org/api/modules.html
 * @constructor
 */
var ES6 = module.exports = function () {
	Base.apply(this, arguments);
};

/**
 * Inherit from `Base`.
 */
util.inherits(ES6, Base);

/**
 * Parse the given file and return all found dependencies.
 * @param  {String} filename
 * @return {Array}
 */
ES6.prototype.parseFile = function (filename) {
	try {
		if (fs.existsSync(filename)) { // eslint-disable-line no-sync
			var dependencies = [];
			var src = this.getFileSource(filename);
			var fileData = {filename: filename, src: src};

			this.emit('parseFile', fileData);

			if (/import.*from/m.test(fileData.src) || /export.*from/m.test(fileData.src)) {
				detective(fileData.src).map(function (id) {
					var depFilename = this.resolve(path.dirname(fileData.filename), id);
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
