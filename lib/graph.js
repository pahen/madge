'use strict';

const exec = require('child_process').exec;
const cyclic = require('./cyclic');
const graphviz = require('graphviz');

/**
 * Set color on a node.
 * @param  {Object} node
 * @param  {String} color
 */
function setNodeColor(node, color) {
	node.set('color', color);
	node.set('fontcolor', color);
}

/**
 * Check if Graphviz is installed on the system.
 * @throws Error
 */
function checkGraphvizInstalled() {
	exec('gvpr -V', (error, stdout, stderr) => {
		if (error !== null) {
			throw new Error('Graphviz could not be found. Ensure that "gvpr" is in your $PATH.\n' + error);
		}
	});
}

/**
 * Return options to use with graphviz digraph.
 * @param  {Object} config
 * @param  {String} fileType
 * @return {Object}
 */
function createGraphvizOptions(config, fileType) {
	return {
		'type': fileType || 'png',
		'G': {
			overlap: false,
			layout: config.layout,
			bgcolor: config.backgroundColor
		},
		'E': {
			color: config.edgeColor
		},
		'N': {
			fontname: config.fontName,
			fontsize: config.fontSize,
			color: config.nodeColor,
			fontcolor: config.nodeColor
		}
	};
}

/**
 * Extract the file extension from a path
 * @param  {String} path
 * @return {String}
 */
function extractFileExtension(path) {
	const extensionMatch = path.match(/\.[\w\d\-_]+$/);
	return extensionMatch ? extensionMatch[0] : null;
}

/**
 * Creates a PNG image from the module dependency graph.
 * @param  {Object}   modules
 * @param  {Object}   config
 * @param  {String}   imagePath
 * @return {Promise}
 */
module.exports.image = function (modules, config, imagePath) {
	const g = graphviz.digraph('G');
	const nodes = {};
	const fileType = config.graphvizFileFormat || extractFileExtension(imagePath);

	checkGraphvizInstalled();

	const cyclicModules = cyclic(modules).reduce((a, b) => a.concat(b), []);

	Object.keys(modules).forEach((id) => {
		nodes[id] = nodes[id] || g.addNode(id);

		if (!modules[id].length) {
			setNodeColor(nodes[id], config.noDependenciesColor);
		} else if (cyclicModules.indexOf(id) >= 0) {
			setNodeColor(nodes[id], config.circularDependencyColor);
		}

		modules[id].forEach((depId) => {
			nodes[depId] = nodes[depId] || g.addNode(depId);

			if (!modules[depId]) {
				setNodeColor(nodes[depId], config.noDependenciesColor);
			}

			g.addEdge(nodes[id], nodes[depId]);
		});
	});

	return new Promise((resolve) => {
		g.output(createGraphvizOptions(config, fileType), resolve);
	});
};

/**
 * Return the module dependency graph as DOT output.
 * @param  {Object} modules
 * @return {String}
 */
module.exports.dot = function (modules) {
	const nodes = {};
	const g = graphviz.digraph('G');

	checkGraphvizInstalled();

	Object.keys(modules).forEach((id) => {
		nodes[id] = nodes[id] || g.addNode(id);

		modules[id].forEach((depId) => {
			nodes[depId] = nodes[depId] || g.addNode(depId);
			g.addEdge(nodes[id], nodes[depId]);
		});
	});

	return g.to_dot();
};
