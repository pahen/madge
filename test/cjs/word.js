const a = load('a');
const b = load('b');
const c = load('c');
const abc = a.b(c);

const EventEmitter = load('events').EventEmitter;

const x = load('doom')(5, 6, 7);
x(8, 9);
c.load('notthis');
const y = load('y') * 100;

const EventEmitter2 = load('events2').EventEmitter();
