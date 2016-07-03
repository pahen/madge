'use strict';

const cyclic = require('./cyclic');
const CJS = require('./parse/cjs');
const AMD = require('./parse/amd');
const ES6 = require('./parse/es6');
const graph = require('./graph');

class Madge {
	/**
	 * Class constructor.
	 * @constructor
	 * @api public
	 * @param {String|Array|Object} src
	 * @param {Object} opts
	 */
	constructor(src, opts) {
		let tree = [];

		this.opts = opts || {};
		this.opts.format = String(this.opts.format || 'cjs').toLowerCase();

		if (typeof src === 'object' && !Array.isArray(src)) {
			this.tree = src;
			return;
		}

		if (typeof src === 'string') {
			src = [src];
		}

		if (src && src.length) {
			tree = this.parse(src);
		}

		this.tree = tree;
	}

	/**
	 * Parse the given source folder(s).
	 * @param  {Array|Object} src
	 * @return {Object}
	 */
	parse(src) {
		if (this.opts.format === 'cjs') {
			return new CJS(src, this.opts, this).tree;
		} else if (this.opts.format === 'amd') {
			return new AMD(src, this.opts, this).tree;
		} else if (this.opts.format === 'es6') {
			return new ES6(src, this.opts, this).tree;
		} else {
			throw new Error('invalid module format "' + this.opts.format + '"');
		}
	}

	/**
	 * Return the module dependency graph as an object.
	 * @api public
	 * @return {Object}
	 */
	obj() {
		return this.tree;
	}

	/**
	 * Return the modules that has circular dependencies.
	 * @api public
	 * @return {Object}
	 */
	circular() {
		return cyclic(this.tree);
	}

	/**
	 * Return a list of modules that depends on the given module.
	 * @api public
	 * @param  {String} id
	 * @return {Array|Object}
	 */
	depends(id) {
		return Object.keys(this.tree).filter((module) => {
			if (this.tree[module]) {
				return this.tree[module].reduce((acc, dependency) => {
					if (dependency === id) {
						acc = module;
					}
					return acc;
				}, false);
			}
		}, this);
	}

	/**
	 * Return the module dependency graph as DOT output.
	 * @api public
	 * @return {String}
	 */
	dot() {
		return graph.dot(this.tree);
	}

	/**
	 * Return the module dependency graph as a PNG image.
	 * @api public
	 * @param  {Object}   opts
	 * @param  {Function} callback
	 */
	image(opts, callback) {
		graph.image(this.tree, opts, callback);
	}
}

module.exports = (src, opts) => new Madge(src, opts);
