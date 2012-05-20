'use strict';

/**
 * Return the given object as JSON
 *
 * @param  {Object} obj
 * @return {String}
 */
module.exports = function (obj) {
	return JSON.stringify(obj, null, '  ') + '\n';
};