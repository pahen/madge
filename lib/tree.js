'use strict';

const fs = require('mz/fs');
const path = require('path');
const commondir = require('commondir');
const walk = require('walkdir');
const dependencyTree = require('dependency-tree');
const log = require('./log');

class Tree {
	/**
	 * Class constructor.
	 * @constructor
	 * @api public
	 * @param {Array} srcPaths
	 * @param {Object} config
	 * @return {Promise}
	 */
	constructor(srcPaths, config) {
		this.srcPaths = srcPaths.map((s) => path.resolve(s));
		log('using src paths %o', this.srcPaths);

		this.config = config;
		log('using config %o', this.config);

		return this.getDirs()
			.then(this.setBaseDir.bind(this))
			.then(this.getFiles.bind(this))
			.then(this.generateTree.bind(this));
	}

	/**
	 * Generate the tree from the given files
	 * @param  {Array} files
	 * @return {Object}
	 */
	generateTree(files) {
		const depTree = {};
		const visited = {};

		files.forEach((file) => {
			if (visited[file]) {
				return;
			}

			Object.assign(depTree, dependencyTree({
				filename: file,
				directory: this.baseDir,
				requireConfig: this.config.requireConfig,
				webpackConfig: this.config.webpackConfig,
				visited: visited,
				filter: this.filterPath.bind(this)
			}));
		});

		let tree = this.flatten(depTree);

		if (this.config.excludeRegExp) {
			tree = this.exclude(tree, this.config.excludeRegExp);
		}

		tree = this.sort(tree);

		return tree;
	}

	/**
	 * Filter out some paths from found files
	 * @param  {String} path
	 * @return {Boolean}
	 */
	filterPath(path) {
		return this.config.includeNpm || path.indexOf('node_modules') < 0;
	}

	/**
	 * Get directories from the source paths
	 * @return {Promise} resolved with an array of directories
	 */
	getDirs() {
		return Promise
			.all(this.srcPaths.map((srcPath) => {
				return fs
					.stat(srcPath)
					.then((stats) => stats.isDirectory() ? srcPath : path.dirname(path.resolve(srcPath)));
			}));
	}

	/**
	 * Get all files found from the source paths
	 * @return {Promise} resolved with an array of files
	 */
	getFiles() {
		const files = [];

		return Promise
			.all(this.srcPaths.map((srcPath) => {
				return fs
					.stat(srcPath)
					.then((stats) => {
						if (stats.isFile()) {
							files.push(path.resolve(srcPath));
							return;
						}

						walk.sync(srcPath, (filePath, stat) => {
							if (!this.filterPath(filePath) || !stat.isFile()) {
								return;
							}

							const ext = path.extname(filePath).replace('.', '');

							if (files.indexOf(filePath) < 0 && this.config.extensions.indexOf(ext) >= 0) {
								files.push(filePath);
							}
						});
					});
			}))
			.then(() => files);
	}

	/**
	 * Set the base directory (compute the common one if multiple).
	 * @param {Array} dirs
	 */
	setBaseDir(dirs) {
		if (this.config.baseDir) {
			this.baseDir = path.resolve(this.config.baseDir);
		} else {
			this.baseDir = commondir(dirs);
		}

		log('using base directory %s', this.baseDir);
	}


	/**
	 * Flatten deep tree produced by `dependency-tree`.
	 * @param  {Object} deepTree
	 * @param  {Object} [tree]
	 * @return {Object}
	 */
	flatten(deepTree, tree) {
		tree = tree || {};

		Object
			.keys(deepTree)
			.forEach((key) => {
				const id = this.processPath(key);

				if (!tree[id]) {
					tree[id] = Object
						.keys(deepTree[key])
						.map((dep) => this.processPath(dep));
				}

				this.flatten(deepTree[key], tree);
			});

		return tree;
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

		absPath = absPath.replace(/\\/g, '/');

		return absPath;
	}

	/**
	 * Exclude modules from tree using RegExp.
	 * @param  {Object} tree
	 * @param  {Array} excludeRegExp
	 * @return {Object}
	 */
	exclude(tree, excludeRegExp) {
		const regExpList = excludeRegExp.map((re) => new RegExp(re));

		function regExpFilter(id) {
			return regExpList.findIndex((regexp) => regexp.test(id)) < 0;
		}

		return Object
			.keys(tree)
			.filter(regExpFilter)
			.reduce((acc, id) => {
				acc[id] = tree[id].filter(regExpFilter);
				return acc;
			}, {});
	}

	/**
	 * Sort tree.
	 * @param  {Object} tree
	 * @return {Object}
	 */
	sort(tree) {
		return Object
			.keys(tree)
			.sort()
			.reduce((acc, id) => {
				acc[id] = tree[id].sort();
				return acc;
			}, {});
	}
}

 /**
  * Expose API.
  * @param {Array} srcPaths
  * @param {Object} config
  * @return {Promise}
  */
module.exports = (srcPaths, config) => new Tree(srcPaths, config);
