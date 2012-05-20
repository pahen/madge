'use strict';

/**
 * Module dependencies
 */
var c = require('./color');

/**
 * Print module dependency graph as indented text (or JSON)
 *
 * @param  {Object} modules
 * @param  {Object} opts
 */
module.exports.list = function (modules, opts) {

	opts = opts || {};

	if (opts.output === 'json') {
		return process.stdout.write(require('./json')(modules));
	}

	Object.keys(modules).forEach(function (id) {
		console.log(c(id, 'cyan', opts.colors));
		modules[id].forEach(function (depId) {
			console.log(c('  ' + depId, 'grey', opts.colors));
		}, this);
	}, this);
};

/**
 * Print a summary of module dependencies
 *
 * @param  {Object} modules
 * @param  {Object} opts
 */
module.exports.summary = function (modules, opts) {

	var o = {};

	opts = opts || {};

	Object.keys(modules).sort(function (a, b) {
		return modules[b].length - modules[a].length;
	}).forEach(function (id) {
		if (opts.output === 'json') {
			o[id] = modules[id].length;
		} else {
			console.log(c(id + ': ', 'grey', opts.colors) + c(modules[id].length, 'cyan', opts.colors));
		}
	});

	if (opts.output === 'json') {
		return process.stdout.write(require('./json')(o));
	}
};

/**
 * Print the result from Madge.circular()
 *
 * @param  {Object} circular
 * @param  {Object} opts
 */
module.exports.circular = function (modules, opts) {

	if (opts.output === 'json') {
		return process.stdout.write(require('./json')(modules));
	}

	if (!Object.keys(modules).length) {
		console.log(c('No circular references found', 'green', opts.colors));
	} else {
		Object.keys(modules).forEach(function (id) {
			console.log(c(id, 'grey', opts.colors) + c(' -> ', 'cyan', opts.colors) + c(modules[id], 'grey', opts.colors));
		});
	}
};

/**
 * Print the result from Madge.depends()
 *
 * @param  {Object} modules
 * @param  {Object} opts
 */
module.exports.depends = function (modules, opts) {

	if (opts.output === 'json') {
		return process.stdout.write(require('./json')(modules));
	}

	modules.forEach(function (id) {
		console.log(c(id, 'grey', opts.colors));
	});
};