'use strict';

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
	this.opts = opts || {};
	this.opts.format = String(this.opts.format || 'cjs').toLowerCase();

	if (typeof(src) === 'object' && !Array.isArray(src)) {
		this.tree = src;
		return;
	}

	if (typeof(src) === 'string') {
		src = [src];
	}

	var Parser = require('./parse/' + this.opts.format);
	if (!Parser) {
		throw new Error('invalid module format "' + this.opts.format + '"');
	}

	this.tree = new Parser(src, this.opts).tree;
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
	return require('./analysis/circular')(this.tree);
};

/**
 * Return a list of modules that depends on the given module.
 * @api public
 * @param  {String} id
 * @return {Array}
 */
Madge.prototype.depends = function (id) {
	return require('./analysis/depends')(this.tree, id);
};

/**
 * Return the module dependency graph as DOT output.
 * @api public
 * @return {String}
 */
Madge.prototype.dot = function () {
	return require('./graph').dot(this.tree);
};

/**
 * Return the module dependency graph as a PNG image.
 * @api public
 * @param  {Object}   opts
 * @param  {Function} callback
 */
Madge.prototype.image = function (opts, callback) {
	require('./graph').image(this.tree, opts, callback);
};