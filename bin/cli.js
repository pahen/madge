#!/usr/bin/env node
'use strict';

const process = require('process');
const program = require('commander');
const rc = require('rc')('madge');
const version = require('../package.json').version;

program
	.version(version)
	.usage('[options] <src...>')
	.option('-b, --basedir <path>', 'base directory for resolving paths')
	.option('-s, --summary', 'show dependency count summary')
	.option('-c, --circular', 'show circular dependencies')
	.option('-d, --depends <name>', 'show module dependents')
	.option('-x, --exclude <regexp>', 'exclude modules using RegExp')
	.option('-j, --json', 'output as JSON')
	.option('-i, --image <file>', 'write graph to file as an image')
	.option('-l, --layout <name>', 'layout engine to use for graph (dot/neato/fdp/sfdp/twopi/circo)')
	.option('--dot', 'show graph using the DOT language')
	.option('--extensions <list>', 'comma separated string of valid file extensions')
	.option('--show-extension', 'include file extension in module name', false)
	.option('--show-skipped', 'show warning about skipped files', false)
	.option('--require-config <file>', 'path to RequireJS config')
	.option('--webpack-config <file>', 'path to webpack config')
	.option('--no-color', 'disable color in output and image', false)
	.option('--stdin', 'read predefined tree from STDIN', false)
	.option('--debug', 'turn on debug output', false)
	.parse(process.argv);

if (!program.args.length && !program.stdin) {
	console.log(program.helpInformation());
	process.exit(1);
}

if (program.debug) {
	process.env.DEBUG = '*';
}

if (!program.color) {
	process.env.DEBUG_COLORS = false;
}

const log = require('../lib/log');
const output = require('../lib/output');
const madge = require('../lib/api');
const config = Object.assign({}, rc);

delete config._;
delete config.config;
delete config.configs;

if (rc.config) {
	log('using runtime config %s', rc.config);
}

if (program.basedir) {
	config.baseDir = program.basedir;
}

if (program.exclude) {
	config.excludeRegExp = [program.exclude];
}

if (program.extensions) {
	config.fileExtensions = program.extensions.split(',').map((s) => s.trim());
}

if (program.showExtension) {
	config.showFileExtension = true;
}

if (!program.color) {
	config.backgroundColor = '#ffffff';
	config.nodeColor = '#00000';
	config.noDependencyColor = '#00000';
	config.cyclicNodeColor = '#000000';
	config.edgeColor = '#757575';
}

new Promise((resolve, reject) => {
	if (program.stdin) {
		let buffer = '';

		process.stdin
			.resume()
			.setEncoding('utf8')
			.on('data', (chunk) => {
				buffer += chunk;
			})
			.on('end', () => {
				try {
					resolve(JSON.parse(buffer));
				} catch (e) {
					reject(e);
				}
			});
	} else {
		resolve(program.args);
	}
})
.then((src) => {
	return madge(src, config);
})
.then((res) => {
	if (program.summary) {
		output.summary(res.obj(), {
			json: program.json
		});

		return res;
	}

	if (program.depends) {
		output.depends(res.depends(program.depends), {
			json: program.json
		});

		return res;
	}

	if (program.circular) {
		const circular = res.circular();

		output.circular(circular, {
			json: program.json
		});

		if (circular.length) {
			process.exit(1);
		}

		return res;
	}

	if (program.image) {
		return res.image(program.image).then((imagePath) => {
			console.log('Image created at %s', imagePath);
			return res;
		});
	}

	if (program.dot) {
		return res.dot().then((output) => {
			process.stdout.write(output);
			return res;
		});
	}

	output.list(res.obj(), {
		json: program.json
	});

	return res;
})
.then((res) => {
	if (program.showSkipped && !program.json) {
		output.warnings(res);
	}
})
.catch((err) => {
	output.error(err);

	process.exit(1);
});
