'use strict';

const chalk = require('chalk');

const bold = chalk.bold;
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
 * Get singular or plural form of given word.
 * @param  {Number} num
 * @param  {String} [singular]
 * @param  {String} [plural]
 * @return {String}
 */
function s(num, singular, plural) {
	return num <= 1 ? (singular || '') : (plural || 's');
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
			console.log(`${id}: ${cyan.bold(modules[id].length)}`);
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
	const statusMsg = `(${fileCount} file${s(fileCount)}, ${warningCount} warning${s(warningCount)})`;

	if (!circular.length) {
		console.log(green.bold(`✔ No circular dependency ${statusMsg}`));
	} else {
		console.log(red.bold(`✖ ${cyclicCount} circular dependenc${s(cyclicCount, 'y', 'ies')} ${statusMsg}\n`));
		circular.forEach((path, idx) => {
			path.forEach((module, idx) => {
				if (idx) {
					process.stdout.write(red.bold(' > '));
				}
				process.stdout.write(red(module));
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
		console.log(id);
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
		console.log(red.bold(`✖ Skipped ${skipped.length} file${s(skipped.length)}\n`));

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
	console.log(red(err.stack ? err.stack : err));
};
