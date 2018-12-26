'use strict';

const path = require('path');
const pify = require('pify');
const graphviz = require('graphviz');

const exec = pify(require('child_process').exec);
const writeFile = pify(require('fs').writeFile);

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
	const graphVizOptions = config.graphVizOptions || {};

	return {
		G: Object.assign({
			overlap: false,
			pad: 0.3,
			rankdir: config.rankdir,
			layout: config.layout,
			bgcolor: config.backgroundColor
		}, graphVizOptions.G),
		E: Object.assign({
			color: config.edgeColor
		}, graphVizOptions.E),
		N: Object.assign({
			fontname: config.fontName,
			fontsize: config.fontSize,
			color: config.nodeColor,
			shape: config.nodeShape,
			style: config.nodeStyle,
			height: 0,
			fontcolor: config.nodeColor
		}, graphVizOptions.N)
	};
}

/**
 * Creates the graphviz graph.
 * @param  {Object} modules
 * @param  {Array} circular
 * @param  {Object} config
 * @param  {String} type
 * @return {Promise}
 */
function createGraph(modules, circular, config, type = 'png') {
	return checkGraphvizInstalled(config).then(() => {
		const g = graphviz.digraph('G');
		const nodes = {};
		const cyclicModules = circular.reduce((a, b) => a.concat(b), []);
		const options = createGraphvizOptions(config);
		options.type = type;

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
	});
}

/**
 * Creates an image from the module dependency graph.
 * @param  {Object} modules
 * @param  {Array} circular
 * @param  {String} imagePath
 * @param  {Object} config
 * @return {Promise}
 */
module.exports.image = function (modules, circular, imagePath, config) {
	const type = path.extname(imagePath).replace('.', '');

	return (
		createGraph(modules, circular, config, type)
			.then((image) => writeFile(imagePath, image))
			.then(() => path.resolve(imagePath))
	);
};

/**
 * Return the module dependency graph as DOT output.
 * @param  {Object} modules
 * @param  {Object} circular
 * @param  {Object} config
 * @return {Promise}
 */
module.exports.dot = function (modules, circular, config) {
	return createGraph(modules, circular, config, 'dot');
};
