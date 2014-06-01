'use strict';

/**
 * Module dependencies.
 */
var	util = require('util'),
	requirejs = require('./requirejs'),
	cyclic = require('./cyclic'),
	CJS = require('./parse/cjs'),
	AMD = require('./parse/amd'),
	graph = require('./graph');

/**
 * Merge the two given trees.
 * @param  {Object} a
 * @param  {Object} b
 */
function mergeTrees(a, b) {
	Object.keys(b).forEach(function (id) {
		if (!a[id]) {
			a[id] = [];
		}

		b[id].forEach(function (dep) {
			if (a[id].indexOf(dep) < 0) {
				a[id].push(dep);
			}
		});
	});
}

/**
 * Expose factory function.
 * @api public
 * @param {String|Array|Object} src
 * @param {Object} opts
 * @return {Madge}
 */
module.exports = function (src, opts) {
	return new Madge(src, opts);
};

/**
 * Class constructor.
 * @constructor
 * @api public
 * @param {String|Array|Object} src
 * @param {Object} opts
 */
function Madge(src, opts) {
	var tree = [];

	this.opts = opts || {};
	this.opts.format = String(this.opts.format || 'cjs').toLowerCase();

	if (typeof(src) === 'object' && !Array.isArray(src)) {
		this.tree = src;
		return;
	}

	if (typeof(src) === 'string') {
		src = [src];
	}

	if (src && src.length) {
		if (this.opts.format === 'cjs') {
			tree = new CJS(src, this.opts, this).tree;
		} else if (this.opts.format === 'amd') {
			tree = new AMD(src, this.opts, this).tree;
		} else {
			throw new Error('invalid module format "' + this.opts.format + '"');
		}
	}

	if (this.opts.requireConfig) {
		mergeTrees(tree, requirejs.getShimDepsFromConfig(this.opts.requireConfig, this.opts.exclude));
	}

	this.tree = tree;
}

/**
 * Return the module dependency graph as an object.
 * @api public
 * @return {Object}
 */
Madge.prototype.obj = function () {
	return this.tree;
};

/**
 * Return the modules that has circular dependencies.
 * @api public
 * @return {Object}
 */
Madge.prototype.circular = function () {
	return cyclic(this.tree);
};

/**
 * Return a list of modules that depends on the given module.
 * @api public
 * @param  {String} id
 * @return {Array|Object}
 */
Madge.prototype.depends = function (id) {
	return Object.keys(this.tree).filter(function (module) {
		if (this.tree[module]) {
			return this.tree[module].reduce(function (acc, dependency) {
				if (dependency === id) {
					acc = module;
				}
				return acc;
			}, false);
		}
	}, this);
};

/**
 * Return the module dependency graph as DOT output.
 * @api public
 * @return {String}
 */
Madge.prototype.dot = function () {
	return graph.dot(this.tree);
};

/**
 * Return the module dependency graph as a PNG image.
 * @api public
 * @param  {Object}   opts
 * @param  {Function} callback
 */
Madge.prototype.image = function (opts, callback) {
	graph.image(this.tree, opts, callback);
};