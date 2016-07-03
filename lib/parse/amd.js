'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');
var util = require('util');
var amdetective = require('amdetective');
var parse = require('./parse');
var Base = require('./base');

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
 * Helper for re-mapping path-refs to id-refs that are specified in RequireJS' path config.
 * @param {Object} deps (dependency-list)
 * @param {Object} pathDefs (path-definitions from requirejs-config)
 * @param {String} baseDir (base directory of source files)
 */
function convertPathsToIds(deps, pathDefs, baseDir) {
	var path, pathDeps, i1, len1, i2, len2;

	if (baseDir) {
		baseDir += '/';
	} else {
		baseDir = '';
	}

	Object.keys(pathDefs).forEach(function (id) {
		path = pathDefs[id];

		// if path does not start with / or a protocol: prepend with baseDir
		if (!/^[^\/]+:\/\/|^\//m.test(path)) {
			path = baseDir + path;
		}

		if (path !== id && deps[path]) {
			if (deps[id] && deps[id].length > 0) {
				pathDeps = deps[path].slice(0, deps[path].length - 1);

				// remove entries from <path-ref>, if already contained in <id-ref>
				for (i1 = 0, len1 = pathDeps.length; i1 < len1; ++i1) {
					for (i2 = 0, len2 = deps[id].length; i2 < len2; ++i2) {
						if (pathDeps[i1] === deps[id][i2]) {
							pathDeps.splice(i1--, 1);
							break;
						}
					}
				}
				deps[id] = deps[id].concat(pathDeps);
			} else {
				deps[id] = deps[path];
			}

			delete deps[path];
		} else if (!deps[id]) {
			deps[id] = [];
		}

		// normalize entries within deps-arrays (i.e. replace path-refs with id-refs)
		Object.keys(pathDefs).forEach(function (id) {
			path = baseDir + pathDefs[id];
			if (deps[id]) {
				for (i1 = 0, len1 = deps[id].length; i1 < len1; ++i1) {
					// replace path-ref with id-ref (if necessary)
					if (deps[id][i1] === path) {
						deps[id][i1] = id;
					}
				}
			}
		});
	});
}

/**
 * Read shim dependencies from RequireJS config.
 * @param  {String} filename
 * @param  {String} [exclude]
 * @return {Object}
 */
function getShimDepsFromConfig(filename, exclude) {
	var deps = {};
	var config = parse.findConfig(filename, fs.readFileSync(filename, 'utf8')); // eslint-disable-line no-sync
	var excludeRegex = exclude ? new RegExp(exclude) : false;
	var isIncluded = function (key) {
		return !(excludeRegex && key.match(excludeRegex));
	};

	if (config.shim) {
		Object.keys(config.shim).filter(isIncluded).forEach(function (key) {
			if (config.shim[key].deps) {
				deps[key] = config.shim[key].deps.filter(isIncluded);
			} else {
				deps[key] = [];
			}
		});
	}

	return deps;
}

/**
* Read path definitions from RequireJS config.
* @param  {String} filename
* @param  {String} [exclude]
* @return {Object}
*/
function getPathsFromConfig(filename, exclude) {
	var paths = {};
	var config = parse.findConfig(filename, fs.readFileSync(filename, 'utf8')); // eslint-disable-line no-sync
	var excludeRegex = exclude ? new RegExp(exclude) : false;
	var isIncluded = function (key) {
		return !(excludeRegex && key.match(excludeRegex));
	};

	if (config.paths) {
		Object.keys(config.paths).filter(isIncluded).forEach(function (key) {
			paths[key] = config.paths[key];
		});
	}

	return paths;
}

/**
 * Read baseUrl from RequireJS config.
 * @param  {String} filename
 * @param  {String} srcBaseDir
 * @return {String}
 */
function getBaseUrlFromConfig(filename, srcBaseDir) {
	var config = parse.findConfig(filename, fs.readFileSync(filename, 'utf8')); // eslint-disable-line no-sync
	return config.baseUrl ? path.relative(srcBaseDir, config.baseUrl) : '';
}

/**
 * This class will parse the AMD module format.
 * @see https://github.com/amdjs/amdjs-api/wiki/AMD
 * @constructor
 * @param {Array} src
 * @param {Object} opts
 * @param {Object} parent
 */
var AMD = module.exports = function (src, opts, parent) {
	Base.apply(this, arguments);

	if (opts.requireConfig) {
		var baseDir = src.length ? src[0].replace(/\\/g, '/') : '';
		baseDir = getBaseUrlFromConfig(opts.requireConfig, baseDir);
		convertPathsToIds(this.tree, getPathsFromConfig(opts.requireConfig, opts.exclude), baseDir);
		mergeTrees(this.tree, getShimDepsFromConfig(opts.requireConfig, opts.exclude));
	}
};

/**
 * Inherit from `Base`
 */
util.inherits(AMD, Base);

/**
 * Normalize a module file path and return a proper identificator.
 * @param  {String} filename
 * @return {String}
 */
AMD.prototype.normalize = function (filename) {
	return this.replaceBackslashInPath(path.relative(this.baseDir, filename).replace(this.extRegEx, ''));
};

/**
 * Parse the given file and return all found dependencies.
 * @param  {String} filename
 * @return {Array}
 */
AMD.prototype.parseFile = function (filename) {
	try {
		var dependencies = [];
		var src = this.getFileSource(filename);
		var fileData = {filename: filename, src: src};

		this.emit('parseFile', fileData);

		if (/define|require\s*\(/m.test(fileData.src)) {
			amdetective(fileData.src, {findNestedDependencies: this.opts.findNestedDependencies}).map(function (obj) {
				return typeof obj === 'string' ? [obj] : obj.deps;
			}).filter(function (deps) {
				deps.filter(function (id) {
					// Ignore RequireJS IDs and plugins
					return id !== 'require' && id !== 'exports' && id !== 'module' && !id.match(/\.?\w\!/);
				}).map(function (id) {
					// Only resolve relative module identifiers (if the first term is "." or "..")
					if (id.charAt(0) !== '.') {
						return id;
					}

					var depFilename = path.resolve(path.dirname(fileData.filename), id);

					if (depFilename) {
						return this.normalize(depFilename);
					}
				}, this).forEach(function (id) {
					if (!this.isExcluded(id) && dependencies.indexOf(id) < 0) {
						dependencies.push(id);
					}
				}, this);
			}, this);

			return dependencies;
		}
	} catch (e) {
		if (this.opts.breakOnError) {
			console.log(String('\nError while parsing file: ' + filename).red);
			throw e;
		}
	}

	return [];
};

/**
 * Get module dependencies from optimize file (r.js).
 * @param {String} filename
 */
AMD.prototype.addOptimizedModules = function (filename) {
	var self = this;
	var anonymousRequire = [];

	amdetective(this.getFileSource(filename))
		.filter(function (obj) {
			var id = obj.name || obj;
			return id !== 'require' && id !== 'exports' && id !== 'module' && !id.match(/\.?\w\!/) && !self.isExcluded(id);
		})
		.forEach(function (obj) {
			if (typeof obj === 'string') {
				anonymousRequire.push(obj);
				return;
			}

			if (!self.isExcluded(obj.name)) {
				self.tree[obj.name] = obj.deps.filter(function (id) {
					return id !== 'require' && id !== 'exports' && id !== 'module' && !id.match(/\.?\w\!/) && !self.isExcluded(id);
				});
			}
		});

	if (anonymousRequire.length > 0) {
		this.tree[this.opts.mainRequireModule || ''] = anonymousRequire;
	}
};

/**
 * Parse the given `filename` and add it to the module tree.
 * @param {String} filename
 */
AMD.prototype.addModule = function (filename) {
	if (this.opts.optimized) {
		this.addOptimizedModules(filename);
	} else {
		Base.prototype.addModule.call(this, filename);
	}
};
