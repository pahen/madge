'use strict';

const path = require('path');
const detective = require('detective');
const Base = require('./base');

class CJS extends Base {
	/**
	 * Normalize a module file path and return a proper identificator.
	 * @param  {String} filename
	 * @return {String}
	 */
	normalize(filename) {
		filename = this.replaceBackslashInPath(filename);
		if (filename.charAt(0) !== '/' && !filename.match(/^[A-Za-z:]+\//i)) {
			// a core module (not mapped to a file)
			return filename;
		}
		return super.normalize(filename);
	}

	/**
	 * Parse the given file and return all found dependencies.
	 * @param  {String} filename
	 * @return {Array}
	 */
	parseFile(filename) {
		const dependencies = [];
		const src = this.getFileSource(filename);

		this.emit('parseFile', {
			filename: filename,
			src: src
		});

		if (/require\s*\(/m.test(src)) {
			detective(src).map((id) => {
				const depFilename = this.resolve(path.dirname(filename), id);
				if (depFilename) {
					return this.normalize(depFilename);
				}
			}).filter((id) => {
				if (!this.isExcluded(id) && dependencies.indexOf(id) < 0) {
					dependencies.push(id);
				}
			});
		}

		return dependencies;
	}
}

module.exports = CJS;
