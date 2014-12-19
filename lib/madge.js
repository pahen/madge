'use strict';

/**
 * Module dependencies.
 */
var	util = require('util'),
	requirejs = require('./requirejs'),
	_ = require('underscore'),
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
* Replace alias found inside tree with alias
* @param  {Object} tree
* @param  {Object} alias list
*/
function convertAliases(tree, aliases) {

    // create a copy of the tree to work in
    var ids = Object.keys(tree);

    // create a lookup table where file paths map to module id's
    var path_to_id = _.invert(aliases);
    // get all the file paths
    var paths = _.keys(path_to_id);

	/**
	 * Does str1 start with str2?
	 */
	function starts_with(str1, str2) {
	    return str1.indexOf(str2) === 0;
	}

	ids.forEach(function (id) {
	    var parent_module, new_id;
	    var starts_with_id = _.partial(starts_with, id);
	    var found_id = _.find(paths, starts_with_id);
	    if (found_id) {
	        parent_module = path_to_id[found_id];
	        new_id = id.replace(found_id, parent_module);
	        // the new id may already exist, so merge the new id's deps with
	        // the old id's deps
	        tree[new_id] = _.union(tree[id], tree[new_id]);
	        // remove the old id
	        delete tree[id];
	    }
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
		/* mwc I WANT the alias, not the file path */
		convertAliases(tree, requirejs.getPathsFromConfig(this.opts.requireConfig, this.opts.exclude));
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
