'use strict';

/**
 * A circular dependency is occurring when we see a software package
 * more than once, unless that software package has all its dependencies resolved.
 * @param  {String} id
 * @param  {Object} modules
 * @param  {Object} circular
 * @param  {Object} resolved
 * @param  {Object} unresolved
 */
function resolver(id, modules, circular, resolved, unresolved) {
	unresolved[id] = true;

	if (modules[id]) {
		modules[id].forEach(function (dependency) {
			if (!resolved[dependency]) {
				if (unresolved[dependency]) {
					circular[id] = dependency;
					return;
				}
				resolver(dependency, modules, circular, resolved, unresolved);
			}
		});
	}

	resolved[id] = true;
	unresolved[id] = false;
}

/**
 * Finds all circular dependencies for the given modules.
 * @param  {Object} modules
 * @return {Object}
 */
module.exports = function (modules) {
	var circular = {},
		resolved = {},
		unresolved = {};

	Object.keys(modules).forEach(function (id) {
		resolver(id, modules, circular, resolved, unresolved);
	});

	return circular;
};