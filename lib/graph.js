'use strict';

const path = require('path');
const {promisify} = require('util');
const graphviz = require('graphviz');

const exec = promisify(require('child_process').execFile);
const writeFile = promisify(require('fs').writeFile);

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
async function checkGraphvizInstalled(config) {
	const cmd = config.graphVizPath ? path.join(config.graphVizPath, 'gvpr') : 'gvpr';

	try {
		await exec(cmd, ['-V']);
	} catch (err) {
		if (err.code === 'ENOENT') {
			throw new Error(`Graphviz could not be found. Ensure that "gvpr" is in your $PATH. ${err}`);
		} else {
			throw new Error(`Unexpected error when calling Graphviz "${cmd}". ${err}`);
		}
	}
}

/**
 * Return options to use with graphviz digraph.
 * @param  {Object} config
 * @return {Object}
 */
function createGraphvizOptions(config) {
	const graphVizOptions = config.graphVizOptions || {};

	return {
		// Graph
		G: Object.assign({
			overlap: false,
			pad: 0.3,
			rankdir: config.rankdir,
			layout: config.layout,
			bgcolor: config.backgroundColor
		}, graphVizOptions.G),
		// Edge
		E: Object.assign({
			color: config.edgeColor
		}, graphVizOptions.E),
		// Node
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
 * @param  {Object} options
 * @return {Promise}
 */
function createGraph(modules, circular, config, options) {
	const g = graphviz.digraph('madge');
	const nodes = {};
	const cyclicModules = circular.reduce((a, b) => a.concat(b), []);

	if (config.graphVizPath) {
		g.setGraphVizPath(config.graphVizPath);
	}

	const nodeIndices = {};
	const edgeIndices = {};
	// Graphviz starts counting at one
	let nodeIndex = 1;
	let edgeIndex = 1;

	Object.keys(modules).forEach((id) => {
		if (!nodes[id]) {
			nodeIndices[id] = nodeIndex++;
		}
		nodes[id] = nodes[id] || g.addNode(id);

		if (!modules[id].length) {
			setNodeColor(nodes[id], config.noDependencyColor);
		} else if (cyclicModules.indexOf(id) >= 0) {
			setNodeColor(nodes[id], config.cyclicNodeColor);
		}

		modules[id].forEach((depId) => {
			if (!nodes[depId]) {
				nodeIndices[depId] = nodeIndex++;
			}

			nodes[depId] = nodes[depId] || g.addNode(depId);

			if (!modules[depId]) {
				setNodeColor(nodes[depId], config.noDependencyColor);
			}

			g.addEdge(nodes[id], nodes[depId]);
			edgeIndices[id] = edgeIndices[id] || {};
			edgeIndices[id][depId] = edgeIndex++;
		});
	});

	let hoverStyles = Object.entries(edgeIndices).map(([id, deps]) => {
		return Object.entries(deps)
			.map(
				([depId, edgeId]) => `#node${nodeIndices[depId]}:hover~#edge${edgeId}>path {
stroke: ${config.hoverEdgeColor};
}
#node${nodeIndices[depId]}:hover~#edge${edgeId}>polygon {
stroke: ${config.hoverEdgeColor};
fill: ${config.hoverEdgeColor};
}
#node${nodeIndices[id]}:hover~#edge${edgeId}>path {
stroke: ${config.hoverEdgeColor};
}
#node${nodeIndices[id]}:hover~#edge${edgeId}>polygon {
stroke: ${config.hoverEdgeColor};
fill: ${config.hoverEdgeColor};
}`)
			.join('');
	}).join('');

	hoverStyles = `<style>
${hoverStyles}
</style>
`;

	return new Promise((resolve, reject) => {
		g.output(options, (rendered) => {
			if (options.type === 'svg') {
				const svgFooter = '</svg>\n\n';
				const __b = Buffer.alloc(rendered.length + hoverStyles.length);
				rendered.copy(__b, 0, 0, rendered.length - svgFooter.length);
				__b.write(hoverStyles + svgFooter, rendered.length - svgFooter.length);
				resolve(__b);
			} else {
				resolve(rendered);
			}
		}, (code, out, err) => {
			reject(new Error(err));
		});
	});
}

/**
 * Return the module dependency graph XML SVG representation as a Buffer.
 * @param  {Object} modules
 * @param  {Array} circular
 * @param  {Object} config
 * @return {Promise}
 */
module.exports.svg = function (modules, circular, config) {
	const options = createGraphvizOptions(config);

	options.type = 'svg';

	return checkGraphvizInstalled(config)
		.then(() => createGraph(modules, circular, config, options));
};

/**
 * Creates an image from the module dependency graph.
 * @param  {Object} modules
 * @param  {Array} circular
 * @param  {String} imagePath
 * @param  {Object} config
 * @return {Promise}
 */
module.exports.image = function (modules, circular, imagePath, config) {
	const options = createGraphvizOptions(config);

	options.type = path.extname(imagePath).replace('.', '') || 'png';

	return checkGraphvizInstalled(config)
		.then(() => {
			return createGraph(modules, circular, config, options)
				.then((image) => writeFile(imagePath, image))
				.then(() => path.resolve(imagePath));
		});
};

/**
 * Return the module dependency graph as DOT output.
 * @param  {Object} modules
 * @param  {Array} circular
 * @param  {Object} config
 * @return {Promise}
 */
module.exports.dot = function (modules, circular, config) {
	const options = createGraphvizOptions(config);

	options.type = 'dot';

	return checkGraphvizInstalled(config)
		.then(() => createGraph(modules, circular, config, options))
		.then((output) => output.toString('utf8'));
};
