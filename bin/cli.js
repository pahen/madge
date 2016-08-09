#!/usr/bin/env node
'use strict';

const process = require('process');
const program = require('commander');
const rc = require('rc')('madge');
const debug = require('debug')('madge');
const version = require('../package.json').version;
const output = require('../lib/output');
const madge = require('../lib/api');

program
	.version(version)
	.usage('[options] <file>')
	.option('--directory <path>', '')
	.option('--list', 'show list of all dependencies (default)')
	.option('--summary', 'show summary of all dependencies')
	.option('--circular', 'show circular dependencies')
	.option('--depends <name>', 'show modules that depends on the given id')
	.option('--json', 'show output as JSON')
	.option('--image <file>', 'write graph to file as an image')
	.option('--layout <name>', 'layout engine to use for graph (dot/neato/fdp/sfdp/twopi/circo)')
	.option('--dot', 'show graph using the DOT language')
	.option('--no-color', 'disable color in output and image', false)
	.option('--require-config <file>', 'path to RequireJS config')
	.option('--webpack-config <file>', 'path to webpack config')
	.parse(process.argv);

if (!program.args.length) {
	console.log(program.helpInformation());
	process.exit(1);
}

if (!program.color) {
	process.env.DEBUG_COLORS = false;
}

if (rc.config) {
	debug('using runtime configuration from %s', rc.config);
}

const config = Object.assign({}, rc);

delete config._;
delete config.config;
delete config.configs;

['directory', 'layout', 'requireConfig', 'webpackConfig'].forEach((option) => {
	if (program[option]) {
		config[option] = program[option];
	}
});

if (!program.color) {
	config.backgroundColor = '#ffffff';
	config.nodeColor = '#00000';
	config.noDependencyColor = '#00000';
	config.cyclicNodeColor = '#000000';
	config.edgeColor = '#757575';
}

madge(program.args[0], config)
	.then((res) => {
		if (program.list || (!program.summary && !program.circular && !program.depends && !program.image && !program.dot)) {
			output.list(res.obj(), {
				colors: program.color,
				json: program.json
			});
		}

		if (program.summary) {
			output.summary(res.obj(), {
				colors: program.color,
				json: program.json
			});
		}

		if (program.circular) {
			const circular = res.circular();

			output.circular(circular, {
				colors: program.color,
				json: program.json
			});

			if (circular.length) {
				process.exit(1);
			}
		}

		if (program.depends) {
			output.depends(res.depends(program.depends), {
				colors: program.color,
				json: program.json
			});
		}

		if (program.image) {
			return res.image(program.image);
		}

		if (program.dot) {
			return res.dot().then((output) => {
				process.stdout.write(output);
			});
		}
	})
	.catch((err) => {
		output.error(err, {
			colors: program.color
		});

		process.exit(1);
	});
