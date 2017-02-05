'use strict';

const tree = require('./tree');
const cyclic = require('./cyclic');
const graph = require('./graph');
const log = require('./log');

const defaultConfig = {
	baseDir: null,
	excludeRegExp: false,
	extensions: ['js'],
	showFileExtension: false,
	includeNpm: false,
	requireConfig: null,
	webpackConfig: null,
	layout: 'dot',
	fontName: 'Arial',
	fontSize: '14px',
	backgroundColor: '#000000',
	nodeColor: '#c6c5fe',
	noDependencyColor: '#cfffac',
	cyclicNodeColor: '#ff6c60',
	edgeColor: '#757575',
	graphVizOptions: false,
	graphVizPath: false,
	dependencyFilter: false
};

class Madge {
	/**
	 * Class constructor.
	 * @constructor
	 * @api public
	 * @param {String|Array|Object} path
	 * @param {Object} config
	 * @return {Promise}
	 */
	constructor(path, config) {
		this.skipped = [];

		if (!path) {
			throw new Error('path argument not provided');
		}

		this.config = Object.assign({}, defaultConfig, config);

		if (typeof path === 'object' && !Array.isArray(path)) {
			this.tree = path;
			log('using predefined tree %o', path);
			return Promise.resolve(this);
		}

		if (typeof path === 'string') {
			path = [path];
		}

		return tree(path, this.config).then((res) => {
			this.tree = res.tree;
			this.skipped = res.skipped;
			return this;
		});
	}

	/**
	 * Return the module dependency graph as an object.
	 * @api public
	 * @return {Object}
	 */
	obj() {
		return Object
			.keys(this.tree)
			.reduce((acc, id) => {
				acc[this.stripExt(id)] = this.tree[id].map((dep) => this.stripExt(dep));
				return acc;
			}, {});
	}

	/**
	 * Return produced warnings.
	 * @api public
	 * @return {Array}
	 */
	warnings() {
		return {
			skipped: this.skipped
		};
	}

	/**
	 * Return the modules that has circular dependencies.
	 * @api public
	 * @return {Object}
	 */
	circular() {
		const circular = cyclic(this.tree);

		circular.forEach((paths, idx) => {
			circular[idx] = paths.map((dep) => this.stripExt(dep));
		});

		return circular;
	}

	/**
	 * Return a list of modules that depends on the given module.
	 * @api public
	 * @param  {String} id
	 * @return {Array}
	 */
	depends(id) {
		const tree = this.obj();

		return Object
			.keys(tree)
			.filter((dep) => tree[dep].indexOf(id) >= 0);
	}

	/**
	 * Return the module dependency graph as DOT output.
	 * @api public
	 * @return {Promise}
	 */
	dot() {
		return graph.dot(this.obj(), this.config);
	}

	/**
	 * Write dependency graph to image.
	 * @api public
	 * @param  {String} imagePath
	 * @return {Promise}
	 */
	image(imagePath) {
		if (!imagePath) {
			return Promise.reject(new Error('imagePath not provided'));
		}

		return graph.image(this.obj(), this.circular(), imagePath, this.config);
	}

	/**
	 * Remove file extension from the given module id
	 * @param  {String} id
	 * @return {String}
	 */
	stripExt(id) {
		if (this.config.showFileExtension) {
			return id;
		}

		return id.substr(0, id.lastIndexOf('.')) || id;
	}
}

/**
 * Expose API.
 * @param {String|Array} path
 * @param {Object} config
 * @return {Promise}
 */
module.exports = (path, config) => new Madge(path, config);
