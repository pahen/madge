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
 * @param {Array} path
 * @param {Array} cycles
 */
function resolver(id, modules, path, cycles) {
	if (path.includes(id)) {
		const cycleStart = path.indexOf(id);
		const cycle = path.slice(cycleStart);
		const normalized = normalizeCycle(cycle);
		// Avoid duplicate cycles (regardless of entry point)
		if (!cycles.some((c) => c.length === normalized.length && c.every((v, i) => v === normalized[i]))) {
			cycles.push(normalized);
		}
		return;
	}
	path.push(id);
	(modules[id] || []).forEach((dep) => {
		resolver(dep, modules, path, cycles);
	});
	path.pop();
}

/**
 * Finds all unique circular dependencies for the given modules.
 * @param  {Object} modules
 * @return {Array}
 */
module.exports = function (modules) {
	const cycles = [];

	Object.keys(modules).forEach((id) => {
		resolver(id, modules, [], cycles);
	});

	return cycles;
};
