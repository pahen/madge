'use strict';

const fs = require('fs');
const path = require('path');
const detective = require('detective');
const Base = require('./base');

/**
 * This class will parse the CommonJS module format.
 * @see http://nodejs.org/api/modules.html
 */
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
		try {
			if (fs.existsSync(filename)) { // eslint-disable-line no-sync
				const dependencies = [];
				const src = this.getFileSource(filename);
				const fileData = {filename: filename, src: src};

				this.emit('parseFile', fileData);

				if (/require\s*\(/m.test(fileData.src)) {
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
	}
}

module.exports = CJS;
