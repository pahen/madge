'use strict';

const os = require('os');
const fs = require('mz/fs');
const path = require('path');
const commondir = require('commondir');
const walk = require('walkdir');
const dependencyTree = require('dependency-tree');
const log = require('./log');

/**
 * Check if running on Windows.
 * @type {Boolean}
 */
const isWin = (os.platform() === 'win32');

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
	 * Generate the tree from the given files
	 * @param  {Array} files
	 * @return {Object}
	 */
	generateTree(files) {
		const depTree = {};
		const visited = {};
		const nonExistent = [];

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
				filter: this.filterPath.bind(this),
				detective: this.config.detectiveOptions,
				nonExistent: nonExistent
			}));
		});
		if (nonExistent.length > 0) {
			console.warn(
				'WARNING: The following paths could not be resolved. Run with --debug to find out why:\n',
				nonExistent.join('\n  ')
			);
		}
		let tree = this.convertTree(depTree, {}, {});

		if (this.config.excludeRegExp) {
			tree = this.exclude(tree, this.config.excludeRegExp);
		}

		return {
			tree: this.sort(tree),
			skipped: nonExistent
		};
	}

	/**
	 * Convert deep tree produced by dependency-tree to a
	 * shallow (one level deep) tree used by madge.
	 * @param  {Object} depTree
	 * @param  {Object} tree
	 * @param  {Object} pathCache
	 * @return {Object}
	 */
	convertTree(depTree, tree, pathCache) {
		for (const key in depTree) {
			const id = this.processPath(key, pathCache);

			if (!tree[id]) {
				tree[id] = [];

				for (const dep in depTree[key]) {
					tree[id].push(this.processPath(dep, pathCache));
				}
			}

			this.convertTree(depTree[key], tree, pathCache);
		}

		return tree;
	}

	/**
	 * Process absolute path and return a shorter one.
	 * @param  {String} absPath
	 * @param  {Object} cache
	 * @return {String}
	 */
	processPath(absPath, cache) {
		if (cache[absPath]) {
			return cache[absPath];
		}

		let relPath = path.relative(this.baseDir, absPath);

		if (isWin) {
			relPath = relPath.replace(/\\/g, '/');
		}

		cache[absPath] = relPath;

		return relPath;
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
	 * Exclude modules from tree using RegExp.
	 * @param  {Object} tree
	 * @param  {Array} excludeRegExp
	 * @return {Object}
	 */
	exclude(tree, excludeRegExp) {
		const regExpList = excludeRegExp.map((re) => new RegExp(re));
		const config = this.config;

		function regExpFilter(id) {
			if (!config.showFileExtension) {
				id = id.substr(0, id.lastIndexOf('.')) || id;
			}

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
