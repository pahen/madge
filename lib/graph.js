'use strict';

/**
 * Module dependencies.
 */
var exec = require('child_process').exec,
	graphviz = require('graphviz'),
	g = graphviz.digraph('G');

/**
 * Set color on a node.
 * @param  {Object} node
 * @param  {String} color
 */
function nodeColor(node, color) {
	node.set('color', color);
	node.set('fontcolor', color);
}

/**
 * Set color for nodes without dependencies.
 * @param  {Object} node
 * @param  {String} [color]
 */
function noDependencyNode(node, color) {
	nodeColor(node, color || '#cfffac');
}

/**
 * Check if Graphviz is installed on the system.
 * @throws Error
 */
function checkGraphvizInstalled() {
	exec('gvpr -V', function (error, stdout, stderr) {
		if (error !== null) {
			throw new Error('Graphviz could not be found. Ensure that "gvpr" is in your $PATH.\n' + error);
		}
	});
}

/**
 * Creates a PNG image from the module dependency graph.
 * @param  {Object}   modules
 * @param  {Object}   opts
 * @param  {Function} callback
 */
module.exports.image = function (modules, opts, callback) {
	checkGraphvizInstalled();

	var nodes = {},
		circular = require('./analysis/circular')(modules),
        colors = opts.imageColors || {};

	Object.keys(modules).forEach(function (id) {

		nodes[id] = nodes[id] || g.addNode(id);
		if (opts.colors && modules[id]) {
			if (!modules[id].length) {
				noDependencyNode(nodes[id], colors.noDependencies);
			} else if (circular.isCyclic(id)) {
				nodeColor(nodes[id], (colors.circular || '#ff6c60'));
			}
		}

		modules[id].forEach(function (depId) {
			nodes[depId] = nodes[depId] || g.addNode(depId);
			if (opts.colors && !modules[depId]) {
				noDependencyNode(nodes[depId], colors.noDependencies);
			}
			g.addEdge(nodes[id], nodes[depId]);
		});

	});

	// Valid attributes: http://www.graphviz.org/doc/info/attrs.html
	g.output({
		'type': 'png',
		'G' : {
			'layout': opts.layout || 'dot',
			'overlap': false,
			'bgcolor': opts.colors ? (colors.bgcolor || '#000000') : '#ffffff'
		},
		'E' : opts.colors ? {'color': (colors.edge || '#757575') } : {},
		'N' : opts.colors ? {
			'color': (colors.dependencies || '#c6c5fe'),
			'fontcolor': (colors.fontColor || colors.dependencies || '#c6c5fe'),
			'fontname' : opts.fontFace || 'Times-Roman',
			'fontsize': opts.fontSize || 14
		} : {}
	}, callback);

};

/**
 * Return the module dependency graph as DOT output.
 * @param  {Object} modules
 * @return {String}
 */
module.exports.dot = function (modules) {
	var nodes = {};

	checkGraphvizInstalled();

	Object.keys(modules).forEach(function (id) {
		var node = nodes[id] = nodes[id] || g.addNode(id);

		modules[id].forEach(function (depId) {
			nodes[depId] = nodes[depId] || g.addNode(depId);
			g.addEdge(nodes[id], nodes[depId]);
		});
	});

	return g.to_dot();
};