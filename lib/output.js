'use strict';

const chalk = require('chalk');
const pluralize = require('pluralize');

const red = chalk.red;
const cyan = chalk.cyan;
const grey = chalk.grey;
const green = chalk.green;
const yellow = chalk.yellow;

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
		console.log(cyan.bold(id));
		modules[id].forEach((depId) => {
			console.log(grey(`  ${depId}`));
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
			console.log(cyan.bold(`${id}: `) + yellow.bold(modules[id].length));
		}
	});

	if (opts.json) {
		return printJSON(o);
	}
};

/**
 * Print the result from Madge.circular().
 * @param  {Object} res
 * @param  {Array} circular
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.circular = function (res, circular, opts) {
	if (opts.json) {
		return printJSON(circular);
	}

	const warningCount = res.warnings().skipped.length;
	const fileCount = Object.keys(res.obj()).length;
	const cyclicCount = Object.keys(circular).length;
	const statusMsg = `(${pluralize('file', fileCount, true)}, ${pluralize('warning', warningCount, true)})`;

	if (!circular.length) {
		console.log(green.bold(`✔ No circular dependency ${statusMsg}`));
	} else {
		console.log(red.bold(`✖ ${pluralize('circular dependency', cyclicCount, true)} ${statusMsg}\n`));
		circular.forEach((path, idx) => {
			path.forEach((module, idx) => {
				if (idx) {
					process.stdout.write(grey(' > '));
				}
				process.stdout.write(cyan.bold(module));
			});
			process.stdout.write('\n');
		});
		process.stdout.write('\n');
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
		console.log(cyan.bold(id));
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
		console.log(red.bold(`✖ Skipped ${pluralize('file', skipped.length, true)}\n`));

		skipped.forEach((file) => {
			console.log(red(file));
		});

		process.stdout.write('\n');
	}
};

/**
 * Print error to the console.
 * @param  {Object} err
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.error = function (err) {
	console.log(red.bold(err.stack ? err.stack : err));
};
