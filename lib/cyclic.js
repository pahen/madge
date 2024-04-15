'use strict';

/**
 * Get path to the circular dependency.
 * @param  {String} parent
 * @param  {Object} unresolved
 * @return {Array}
 */
function getPath(parent, unresolved) {
	let parentVisited = false;

	return Object.keys(unresolved).filter((module) => {
		if (module === parent) {
			parentVisited = true;
		}

		return parentVisited && unresolved[module];
	});
}

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
		for (const dependency of modules[id]) {
			if (!resolved[dependency]) {
				if (unresolved[dependency]) {
					circular.push(getPath(dependency, unresolved));
					continue;
				}

				resolver(dependency, modules, circular, resolved, unresolved);
			}
		}
	}

	resolved[id] = true;
	unresolved[id] = false;
}

/**
 * Finds all circular dependencies for the given modules.
 * @param  {Object} modules
 * @return {Array}
 */
module.exports = function(modules) {
	const circular = [];
	const resolved = {};
	const unresolved = {};

	for (const id of Object.keys(modules)) {
		resolver(id, modules, circular, resolved, unresolved);
	}

	return circular;
};
