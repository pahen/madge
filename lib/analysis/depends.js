'use strict';

/**
 * Finds all modules that depends on the given modules.
 * @param  {Object} modules
 * @param  {String} id
 * @return {Array}
 */
module.exports = function (modules, id) {
	return Object.keys(modules).filter(function (module) {
		if (modules[module]) {
			return modules[module].reduce(function (acc, dependency) {
				if (dependency === id) {
					acc = module;
				}
				return acc;
			}, false);
		}
	}, this);
};