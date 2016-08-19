'use strict';

const path = require('path');
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
 * @param  {Object} config
 * @return {Promise}
 */
function checkGraphvizInstalled(config) {
	if (config.graphVizPath) {
		const cmd = path.join(config.graphVizPath, 'gvpr -V');
		return exec(cmd)
			.catch(() => {
				throw new Error('Could not execute ' + cmd);
			});
	}

	return exec('gvpr -V')
		.catch((error) => {
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
		G: {
			overlap: false,
			pad: 0.111,
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

	if (config.graphVizPath) {
		g.setGraphVizPath(config.graphVizPath);
	}

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
			reject(new Error(err));
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

	options.type = path.extname(imagePath).replace('.', '') || 'png';

	return checkGraphvizInstalled(config)
		.then(() => {
			return createGraph(modules, config, options)
				.then((image) => fs.writeFile(imagePath, image))
				.then(() => path.resolve(imagePath));
		});
};

/**
 * Return the module dependency graph as DOT output.
 * @param  {Object} modules
 * @param  {Object} config
 * @return {Promise}
 */
module.exports.dot = function (modules, config) {
	const nodes = {};
	const g = graphviz.digraph('G');

	return checkGraphvizInstalled(config)
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
