'use strict';

/**
 * Normalize a cycle so it always starts with the smallest node.
 * @param {Array} cycle
 * @return {Array}
 */
function normalizeCycle(cycle) {
	const minIndex = cycle.reduce(
		(minIdx, val, idx, arr) => val < arr[minIdx] ? idx : minIdx,
		0
	);
	return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
}

/**
 * Recursively resolves dependencies and finds cycles.
 * @param {String} id
 * @param {Object} modules
 * @param {Object} context - Contains path, pathSet, cycleSet, and cycles
 */
function resolver(id, modules, context) {
	const {path, pathSet, cycleSet, cycles} = context;

	if (pathSet.has(id)) {
		const cycleStart = path.indexOf(id);
		const cycle = path.slice(cycleStart);
		const normalized = normalizeCycle(cycle);
		const cycleKey = normalized.join('->');
		// Avoid duplicate cycles (regardless of entry point)
		if (!cycleSet.has(cycleKey)) {
			cycleSet.add(cycleKey);
			cycles.push(normalized);
		}
		return;
	}
	path.push(id);
	pathSet.add(id);
	(modules[id] || []).forEach((dep) => {
		resolver(dep, modules, context);
	});
	path.pop();
	pathSet.delete(id);
}

/**
 * Finds all unique circular dependencies for the given modules.
 * @param  {Object} modules
 * @return {Array}
 */
module.exports = function (modules) {
	const cycles = [];
	const cycleSet = new Set();

	Object.keys(modules).forEach((id) => {
		const context = {
			path: [],
			pathSet: new Set(),
			cycleSet,
			cycles
		};
		resolver(id, modules, context);
	});

	return cycles;
};
