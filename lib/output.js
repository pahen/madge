'use strict';

const process = require('process');
const chalk = require('chalk');
const pluralize = require('pluralize');
const prettyMs = require('pretty-ms');

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
module.exports.list = function(modules, opts = {}) {
	if (opts.json) {
		return printJSON(modules);
	}

	for (const id of Object.keys(modules)) {
		console.log(chalk.cyan.bold(id));
		for (const depId of modules[id]) {
			console.log(chalk.grey(`  ${depId}`));
		}
	}
};

/**
 * Print a summary of module dependencies.
 * @param  {Object} modules
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.summary = function(modules, opts = {}) {
	const o = {};

	for (const id of Object.keys(modules).sort((a, b) => {
		return modules[b].length - modules[a].length;
	})) {
		if (opts.json) {
			o[id] = modules[id].length;
		} else {
			console.log('%s %s', chalk.cyan.bold(modules[id].length), chalk.grey(id));
		}
	}

	if (opts.json) {
		return printJSON(o);
	}
};

/**
 * Print the result from Madge.circular().
 * @param  {Object} spinner
 * @param  {Object} res
 * @param  {Array} circular
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.circular = function(spinner, res, circular, opts = {}) {
	if (opts.json) {
		return printJSON(circular);
	}

	const cyclicCount = Object.keys(circular).length;

	if (circular.length === 0) {
		spinner.succeed(chalk.bold('No circular dependency found!'));
	} else {
		spinner.fail(chalk.red.bold(`Found ${pluralize('circular dependency', cyclicCount, true)}!\n`));

		for (const [idx, path] of circular.entries()) {
			if (opts.printCount) {
				process.stdout.write(chalk.dim(idx + 1 + ') '));
			}

			for (const [idx, module] of path.entries()) {
				if (idx) {
					process.stdout.write(chalk.dim(' > '));
				}

				process.stdout.write(chalk.cyan.bold(module));
			}

			process.stdout.write('\n');
		}
	}
};

/**
 * Print the given modules.
 * @param  {Array} modules
 * @param  {Object} opts
 * @return {undefined}
 */
module.exports.modules = function(modules, opts = {}) {
	if (opts.json) {
		return printJSON(modules);
	}

	for (const id of modules) {
		console.log(chalk.cyan.bold(id));
	}
};

/**
 * Print warnings to the console.
 * @param  {Object} res
 * @return {undefined}
 */
module.exports.warnings = function(res) {
	const {skipped} = res.warnings();

	if (skipped.length > 0) {
		console.log(chalk.yellow.bold(`\n✖ Skipped ${pluralize('file', skipped.length, true)}\n`));

		for (const file of skipped) {
			console.log(chalk.yellow(file));
		}
	}
};

/**
 * Get a summary from the result.
 * @param  {Object} res
 * @param  {Number} startTime
 * @return {undefined}
 */
module.exports.getResultSummary = function(res, startTime) {
	const warningCount = res.warnings().skipped.length;
	const fileCount = Object.keys(res.obj()).length;

	console.log('Processed %s %s %s %s\n',
		chalk.bold(fileCount),
		pluralize('file', fileCount),
		chalk.dim(`(${prettyMs(Date.now() - startTime)})`),
		warningCount ? '(' + chalk.yellow.bold(pluralize('warning', warningCount, true)) + ')' : ''
	);
};
