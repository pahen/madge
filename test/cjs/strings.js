const a = require('a');
const b = require('b');
const c = require('c');
const abc = a.b(c);

const EventEmitter = require('events').EventEmitter;

const x = require('doom')(5, 6, 7);
x(8, 9);
c.require('notthis');
const y = require('y') * 100;

const EventEmitter2 = require('events2').EventEmitter();
