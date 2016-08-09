'use strict';

const fs = require('mz/fs');
const exec = require('mz/child_process').exec;
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
 * @return {Promise}
 */
function checkGraphvizInstalled() {
	return exec('gvpr -V').catch((error) => {
		throw new Error('Graphviz could not be found. Ensure that "gvpr" is in your $PATH.\n' + error);
	});
}

/**
 * Return options to use with graphviz digraph.
 * @param  {Object} config
 * @return {Object}
 */
function createGraphvizOptions(config) {
	return {
		type: 'png',
		G: {
			overlap: false,
			layout: config.layout,
			bgcolor: config.backgroundColor
		},
		E: {
			color: config.edgeColor
		},
		N: {
			fontname: config.fontName,
			fontsize: config.fontSize,
			color: config.nodeColor,
			fontcolor: config.nodeColor
		}
	};
}

/**
 * Creates the graphviz graph.
 * @param  {Object} modules
 * @param  {Object} config
 * @param  {Object} options
 * @return {Promise}
 */
function createGraph(modules, config, options) {
	const g = graphviz.digraph('G');
	const nodes = {};
	const cyclicModules = cyclic(modules).reduce((a, b) => a.concat(b), []);

	Object.keys(modules).forEach((id) => {
		nodes[id] = nodes[id] || g.addNode(id);

		if (!modules[id].length) {
			setNodeColor(nodes[id], config.noDependencyColor);
		} else if (cyclicModules.indexOf(id) >= 0) {
			setNodeColor(nodes[id], config.cyclicNodeColor);
		}

		modules[id].forEach((depId) => {
			nodes[depId] = nodes[depId] || g.addNode(depId);

			if (!modules[depId]) {
				setNodeColor(nodes[depId], config.noDependencyColor);
			}

			g.addEdge(nodes[id], nodes[depId]);
		});
	});

	return new Promise((resolve, reject) => {
		g.output(options, resolve, (code, out, err) => {
			reject(err);
		});
	});
}

/**
 * Creates an image from the module dependency graph.
 * @param  {Object} modules
 * @param  {String} imagePath
 * @param  {Object} config
 * @return {Promise}
 */
module.exports.image = function (modules, imagePath, config) {
	const options = createGraphvizOptions(config);

	return checkGraphvizInstalled()
		.then(() => {
			return createGraph(modules, config, options)
				.then((image) => fs.writeFile(imagePath, image));
		});
};

/**
 * Return the module dependency graph as DOT output.
 * @param  {Object} modules
 * @return {Promise}
 */
module.exports.dot = function (modules) {
	const nodes = {};
	const g = graphviz.digraph('G');

	return checkGraphvizInstalled()
		.then(() => {
			Object.keys(modules).forEach((id) => {
				nodes[id] = nodes[id] || g.addNode(id);

				modules[id].forEach((depId) => {
					nodes[depId] = nodes[depId] || g.addNode(depId);
					g.addEdge(nodes[id], nodes[depId]);
				});
			});

			return g.to_dot();
		});
};
