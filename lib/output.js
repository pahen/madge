'use strict';

require('colors');

/**
 * Return colored string.
 * @param  {String} str
 * @param  {String} name
 * @param  {Boolean} use
 * @return {String}
 */
function c(str, name, use) {
	return use ? String(str)[name] : str;
}

/**
 * Print given object as JSON.
 * @param  {Object} obj
 * @return {String}
 */
function printJSON(obj) {
	return console.log(JSON.stringify(obj, null, '  '));
}

/**
 * Print module dependency graph as indented text (or JSON).
 * @param  {Object} modules
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.list = function (modules, opts) {
	opts = opts || {};

	if (opts.json) {
		return printJSON(modules);
	}

	Object.keys(modules).forEach((id) => {
		console.log(c(id, 'cyan', opts.colors));
		modules[id].forEach((depId) => {
			console.log(c('  ' + depId, 'grey', opts.colors));
		});
	});
};

/**
 * Print a summary of module dependencies.
 * @param  {Object} modules
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.summary = function (modules, opts) {
	const o = {};

	opts = opts || {};

	Object.keys(modules).sort((a, b) => {
		return modules[b].length - modules[a].length;
	}).forEach((id) => {
		if (opts.json) {
			o[id] = modules[id].length;
		} else {
			console.log(c(id + ': ', 'grey', opts.colors) + c(modules[id].length, 'cyan', opts.colors));
		}
	});

	if (opts.json) {
		return printJSON(o);
	}
};

/**
 * Print the result from Madge.circular().
 * @param  {Array} circular
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.circular = function (circular, opts) {
	if (opts.json) {
		return printJSON(circular);
	}

	if (!circular.length) {
		console.log(c('No circular dependencies found!', 'green', opts.colors));
	} else {
		circular.forEach((path, idx) => {
			path.forEach((module, idx) => {
				if (idx) {
					process.stdout.write(c(' -> ', 'cyan', opts.colors));
				}
				process.stdout.write(c(module, 'red', opts.colors));
			});
			process.stdout.write('\n');
		});
	}
};

/**
 * Print the result from Madge.depends().
 * @param  {Object} modules
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.depends = function (modules, opts) {
	if (opts.json) {
		return printJSON(modules);
	}

	modules.forEach((id) => {
		console.log(c(id, 'grey', opts.colors));
	});
};

/**
 * Print error to the console.
 * @param  {Object} err
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.error = function (err, opts) {
	console.log(c(err, 'red', opts.colors));
};
