'use strict';

const fs = require('fs');
const path = require('path');
const resolve = require('resolve');
const EventEmitter = require('events').EventEmitter;
const commondir = require('commondir');
const finder = require('walkdir');
const coffee = require('coffee-script');

class Base extends EventEmitter {
	/**
	 * Traversing `src` and fetches all dependencies.
	 * @constructor
	 * @param {Array} src
	 * @param {Object} opts
	 * @param {Object} parent
	 */
	constructor(src, opts, parent) {
		super();

		if (opts.onParseFile) {
			this.on('parseFile', opts.onParseFile.bind(parent));
		}

		if (opts.onAddModule) {
			this.on('addModule', opts.onAddModule.bind(parent));
		}

		this.opts = opts;

		if (typeof this.opts.extensions === 'undefined') {
			this.opts.extensions = ['.js'];
		}

		this.tree = {};
		this.extRegEx = new RegExp('\\.(coffee|jsx|' + this.opts.extensions.map((str) => {
			return str.substring(1);
		}).join('|') + ')$', 'g');
		this.coffeeExtRegEx = /\.coffee$/;
		src = this.resolveTargets(src);
		this.excludeRegex = opts.exclude ? new RegExp(opts.exclude) : false;
		this.baseDir = this.getBaseDir(src);
		this.readFiles(src);
		this.sortDependencies();
	}

	/**
	 * Resolve the given `id` to a filename.
	 * @param  {String} dir
	 * @param  {String} id
	 * @return {String}
	 */
	resolve(dir, id) {
		try {
			return resolve.sync(id, {
				basedir: dir,
				paths: this.opts.paths,
				extensions: this.opts.extensions
			});
		} catch (e) {
			if (this.opts.breakOnError) {
				console.log(String('\nError while resolving module from: ' + id).red);
				throw e;
			}
			return id;
		}
	}

	/**
	 * Get the most common dir from the `src`.
	 * @param  {Array} src
	 * @return {String}
	 */
	getBaseDir(src) {
		const dir = commondir(src);

		if (!fs.statSync(dir).isDirectory()) { // eslint-disable-line no-sync
			return path.dirname(dir);
		}

		return dir;
	}

	/**
	 * Resolves all paths in `sources` and ensure we have a absolute path.
	 * @param  {Array} sources
	 * @return {Array}
	 */
	resolveTargets(sources) {
		return sources.map((src) => path.resolve(src));
	}

	/**
	 * Normalize a module file path and return a proper identificator.
	 * @param  {String} filename
	 * @return {String}
	 */
	normalize(filename) {
		return this.replaceBackslashInPath(path.relative(this.baseDir, filename).replace(this.extRegEx, ''));
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
	 * Parse the given `filename` and add it to the module tree.
	 * @param {String} filename
	 */
	addModule(filename) {
		const id = this.normalize(filename);

		if (!this.isExcluded(id) && fs.existsSync(filename)) { // eslint-disable-line no-sync
			try {
				this.tree[id] = this.parseFile(filename);
				this.emit('addModule', {id: id, dependencies: this.tree[id]});
			} catch (e) {
				if (this.opts.breakOnError) {
					console.log(String('\nError while parsing file: ' + filename).red);
					throw e;
				}
			}
		}
	}

	/**
	 * Traverse `sources` and parse files found.
	 * @param  {Array} sources
	 */
	readFiles(sources) {
		sources.forEach((src) => {
			if (fs.statSync(src).isDirectory()) { // eslint-disable-line no-sync
				finder.sync(src).filter((filename) => {
					return filename.match(this.extRegEx);
				}, this).forEach((filename) => {
					this.addModule(filename);
				}, this);
			} else {
				this.addModule(src);
			}
		}, this);
	}

	/**
	 * Read the given filename and compile it if necessary and return the content.
	 * @param  {String} filename
	 * @return {String}
	 */
	getFileSource(filename) {
		const src = fs.readFileSync(filename, 'utf8'); // eslint-disable-line no-sync

		if (filename.match(this.coffeeExtRegEx)) {
			return coffee.compile(src, {
				header: false,
				bare: true
			});
		}

		return src;
	}

	/**
	 * Sort dependencies by name.
	 */
	sortDependencies() {
		this.tree = Object.keys(this.tree).sort().reduce((acc, id) => {
			(acc[id] = this.tree[id]).sort();
			return acc;
		}, {});
	}

	/**
	 * Replace back slashes in path (Windows) with forward slashes (*nix).
	 * @param  {String} path
	 * @return {String}
	 */
	replaceBackslashInPath(path) {
		return path.replace(/\\/g, '/');
	}
}

module.exports = Base;
