'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const detective = require('detective-es6');
const Base = require('./base');

/**
 * This class will parse the ES6 module format.
 * @see http://nodejs.org/api/modules.html
 * @constructor
 */
const ES6 = module.exports = function () {
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
			const dependencies = [];
			const src = this.getFileSource(filename);
			const fileData = {filename: filename, src: src};

			this.emit('parseFile', fileData);

			if (/import.*from/m.test(fileData.src) || /export.*from/m.test(fileData.src)) {
				detective(fileData.src).map((id) => {
					const depFilename = this.resolve(path.dirname(fileData.filename), id);
					if (depFilename) {
						return this.normalize(depFilename);
					}
				}, this).filter((id) => {
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
