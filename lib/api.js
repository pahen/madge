'use strict';

const tree = require('./tree');
const cyclic = require('./cyclic');
const graph = require('./graph');
const log = require('./log');

const defaultConfig = {
	baseDir: null,
	excludeRegExp: false,
	fileExtensions: ['js'],
	includeNpm: false,
	requireConfig: null,
	webpackConfig: null,
	tsConfig: null,
	rankdir: 'LR',
	layout: 'dot',
	fontName: 'Arial',
	fontSize: '14px',
	backgroundColor: '#111111',
	nodeColor: '#c6c5fe',
	nodeShape: 'box',
	nodeStyle: 'rounded',
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
		return this.tree;
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
		return cyclic(this.tree);
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
	* Return a list of modules that no one is depending on.
	* @api public
	* @return {Array}
	*/
	orphans() {
		const tree = this.obj();
		const map = {};

		Object
			.keys(tree)
			.forEach((dep) => {
				tree[dep].forEach((id) => {
					map[id] = true;
				});
			});

		return Object
			.keys(tree)
			.filter((dep) => !map[dep]);
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
}

/**
 * Expose API.
 * @param {String|Array} path
 * @param {Object} config
 * @return {Promise}
 */
module.exports = (path, config) => new Madge(path, config);
