'use strict';

const path = require('path');
const fs = require('mz/fs');
const debug = require('debug')('madge');
const dependencyTree = require('dependency-tree');
const cyclic = require('./cyclic');
const graph = require('./graph');

const defaultConfig = {
	baseDir: null,
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
	 * @param {String} filePath
	 * @param {Object} config
	 */
	constructor(filePath, config) {
		if (!filePath) {
			throw new Error('Filename argument is missing');
		}

		this.config = Object.assign({}, defaultConfig, config);
		debug('using config %o', this.config);

		this.filePath = path.resolve(filePath);
		debug('using file path: %s', this.filePath);

		this.excludeRegex = this.config.exclude ? new RegExp(this.config.exclude) : false;

		this.baseDir = path.resolve(this.config.baseDir || path.dirname(filePath));
		debug('using base directory: %s', this.baseDir);
	}

	/**
	 * Will start parsing filename and compute dependencies.
	 * @return {Promise}
	 */
	parse() {
		return fs
			.exists(this.filePath)
			.then((exists) => {
				if (!exists) {
					throw new Error('Filename ' + this.filePath + ' does not exists');
				}

				return fs.stat(this.filePath);
			})
			.then((stats) => {
				if (!stats.isFile()) {
					throw new Error('Filename ' + this.filePath + ' is not a file');
				}
			})
			.then(() => {
				this.tree = this.convertDependencyTree(dependencyTree({
					filename: this.filePath,
					directory: this.baseDir,
					requireConfig: this.config.requireConfig,
					webpackConfig: this.config.webpackConfig,
					filter: this.pathFilter.bind(this)
				}));

				this.sortDependencies();

				return this;
			});
	}

	/**
	 * Function used to determine if a module (and its subtree) should be included in the dependency tree.
	 * @param  {String} path
	 * @return {Boolean}
	 */
	pathFilter(path) {
		return (this.config.includeNpm || path.indexOf('node_modules') < 0) && !this.isExcluded(path);
	}

	/**
	 * Convert deep tree produced by `dependency-tree` to internal format used by Madge.
	 * @param  {Object} tree
	 * @param  {Object} [graph]
	 * @return {Object}
	 */
	convertDependencyTree(tree, graph) {
		graph = graph || {};

		Object
			.keys(tree)
			.forEach((key) => {
				const id = this.processPath(key);

				if (!graph[id]) {
					graph[id] = Object
						.keys(tree[key])
						.map((dep) => this.processPath(dep));
				}

				this.convertDependencyTree(tree[key], graph);
			});

		return graph;
	}

	/**
	 * Process path.
	 * @param  {String} absPath
	 * @return {String}
	 */
	processPath(absPath) {
		absPath = path.relative(this.baseDir, absPath);

		if (!this.config.showFileExtension) {
			absPath = absPath.replace(/\.\w+$/, '');
		}

		return absPath;
	}

	/**
	 * Sort dependencies by name.
	 */
	sortDependencies() {
		this.tree = Object
			.keys(this.tree)
			.sort()
			.reduce((acc, id) => {
				acc[id] = this.tree[id].sort();
				return acc;
			}, {});
	}

	/**
	 * Check if module should be excluded.
	 * @param  {String} id
	 * @return {Boolean}
	 */
	isExcluded(id) {
		return this.excludeRegex && id.match(this.excludeRegex);
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
 * @param {String} filePath
 * @param {Object} config
 * @return {Promise}
 */
module.exports = (filePath, config) => {
	return new Madge(filePath, config).parse();
};
