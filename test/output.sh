#!/bin/sh

function desc() {
	echo "\033[01;38;5;022m############### $1 ###############\033[0m";
}

desc "LIST"
./bin/cli.js lib/api.js

desc "SUMMARY"
./bin/cli.js lib/api.js -s

desc "DEPENDS"
./bin/cli.js lib/api.js -d log.js

desc "CIRCULAR (OK)"
./bin/cli.js test/cjs/a.js -c

desc "CIRCULAR (FOUND)"
./bin/cli.js test/cjs/circular/a.js -c

desc "NPM"
./bin/cli.js test/cjs/npm.js --include-npm

desc "STDIN"
./bin/cli.js --json lib/api.js | tr '[a-z]' '[A-Z]' | ./bin/cli.js --stdin

desc "IMAGE"
./bin/cli.js lib/api.js --image /tmp/test.svg

desc "DOT"
./bin/cli.js lib/api.js --dot

desc "JSON"
./bin/cli.js lib/api.js --json

desc "NO COLOR"
./bin/cli.js lib/api.js --no-color

desc "SHOW EXTENSION"
./bin/cli.js lib/api.js --show-extension

desc "WARNINGS (NOTE)"
./bin/cli.js test/cjs/missing.js -c

desc "WARNINGS (LIST)"
./bin/cli.js test/cjs/missing.js -c --warning

desc "ERROR"
./bin/cli.js file/not/found.js

desc "DEBUG"
./bin/cli.js lib/log.js --debug

exit 0