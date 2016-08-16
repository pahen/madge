'use strict';

const tree = require('./tree');
const cyclic = require('./cyclic');
const graph = require('./graph');

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
	graphVizPath: false
};

class Madge {
	/**
	 * Class constructor.
	 * @constructor
	 * @api public
	 * @param {String|Array} path
	 * @param {Object} config
	 * @return {Promise}
	 */
	constructor(path, config) {
		if (!path) {
			throw new Error('path argument not provided');
		}

		if (typeof path === 'string') {
			path = [path];
		}

		this.config = Object.assign({}, defaultConfig, config);

		return tree(path, this.config).then((tree) => {
			this.tree = tree;
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
		return Object
			.keys(this.tree)
			.filter((module) => this.tree[module].indexOf(id) >= 0);
	}

	/**
	 * Return the module dependency graph as DOT output.
	 * @api public
	 * @return {Promise}
	 */
	dot() {
		return graph.dot(this.tree, this.config);
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

		return graph.image(this.tree, imagePath, this.config);
	}
}

/**
 * Expose API.
 * @param {String|Array} path
 * @param {Object} config
 * @return {Promise}
 */
module.exports = (path, config) => new Madge(path, config);
