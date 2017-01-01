'use strict';

const chalk = require('chalk');

const red = chalk.red;
const cyan = chalk.cyan;
const grey = chalk.grey;
const green = chalk.green;

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
		console.log(cyan(id));
		modules[id].forEach((depId) => {
			console.log(grey('  ' + depId));
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
			console.log(grey(id + ': ') + cyan(modules[id].length));
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
		console.log(green('No circular dependencies found!'));
	} else {
		circular.forEach((path, idx) => {
			path.forEach((module, idx) => {
				if (idx) {
					process.stdout.write(cyan(' -> '));
				}
				process.stdout.write(red(module));
			});
			process.stdout.write('\n');
		});
	}
};

/**
 * Print the result from Madge.depends().
 * @param  {Array} depends
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.depends = function (depends, opts) {
	if (opts.json) {
		return printJSON(depends);
	}

	depends.forEach((id) => {
		console.log(grey(id));
	});
};

/**
 * Print warnings to the console.
 * @param  {Object} res
 * @return {undefined}
 */
module.exports.warnings = function (res) {
	const skipped = res.warnings().skipped;

	if (skipped.length) {
		console.log(red.bold('\nSkipped ' + skipped.length + ' files:\n'));

		skipped.forEach((file) => {
			console.log(red(file));
		});
	}
};

/**
 * Print error to the console.
 * @param  {Object} err
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.error = function (err) {
	console.log(red(err.stack ? err.stack : err));
};
