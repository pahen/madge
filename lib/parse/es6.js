'use strict';

const path = require('path');
const detective = require('detective-es6');
const Base = require('./base');

class ES6 extends Base {
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

		if (/import.*from/m.test(src) || /export.*from/m.test(src)) {
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

module.exports = ES6;
