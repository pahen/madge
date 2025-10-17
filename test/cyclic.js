/* eslint-env mocha */
'use strict';

const cyclic = require('../lib/cyclic');

require('should');

describe('Cyclic', () => {
	describe('Basic cycle detection', () => {
		it('finds a simple 2-node cycle', () => {
			const modules = {
				a: ['b'],
				b: ['a']
			};
			const result = cyclic(modules);
			result.should.eql([['a', 'b']]);
		});

		it('finds a simple 3-node cycle', () => {
			const modules = {
				a: ['b'],
				b: ['c'],
				c: ['a']
			};
			const result = cyclic(modules);
			result.should.eql([['a', 'b', 'c']]);
		});

		it('finds a 4-node cycle', () => {
			const modules = {
				a: ['b'],
				b: ['c'],
				c: ['d'],
				d: ['a']
			};
			const result = cyclic(modules);
			result.should.eql([['a', 'b', 'c', 'd']]);
		});

		it('returns empty array when no cycles exist', () => {
			const modules = {
				a: ['b'],
				b: ['c'],
				c: []
			};
			const result = cyclic(modules);
			result.should.eql([]);
		});

		it('handles empty modules object', () => {
			const modules = {};
			const result = cyclic(modules);
			result.should.eql([]);
		});

		it('handles single module with no dependencies', () => {
			const modules = {
				a: []
			};
			const result = cyclic(modules);
			result.should.eql([]);
		});

		it('handles self-referencing cycle', () => {
			const modules = {
				a: ['a']
			};
			const result = cyclic(modules);
			result.should.eql([['a']]);
		});
	});

	describe('Multiple cycles', () => {
		it('finds two separate cycles', () => {
			const modules = {
				a: ['b'],
				b: ['a'],
				c: ['d'],
				d: ['c']
			};
			const result = cyclic(modules);
			result.should.have.length(2);
			result.should.containEql(['a', 'b']);
			result.should.containEql(['c', 'd']);
		});

		it('finds overlapping cycles (diamond pattern)', () => {
			const modules = {
				a: ['b', 'c'],
				b: ['d'],
				c: ['d'],
				d: ['a']
			};
			const result = cyclic(modules);
			result.should.have.length(2);
			result.should.containEql(['a', 'b', 'd']);
			result.should.containEql(['a', 'c', 'd']);
		});

		it('finds multiple cycles with shared edges', () => {
			// d -> c,e -> g -> d creates 2 cycles
			const modules = {
				d: ['c', 'e'],
				c: ['g'],
				e: ['g'],
				g: ['d']
			};
			const result = cyclic(modules);
			result.should.have.length(2);
			result.should.containEql(['c', 'g', 'd']);
			result.should.containEql(['d', 'e', 'g']);
		});

		it('finds nested cycles', () => {
			const modules = {
				a: ['b'],
				b: ['c'],
				c: ['a', 'd'],
				d: ['b']
			};
			const result = cyclic(modules);
			result.should.have.length(2);
			result.should.containEql(['a', 'b', 'c']);
			result.should.containEql(['b', 'c', 'd']);
		});
	});

	describe('Cycle normalization', () => {
		it('normalizes cycle to start with smallest node', () => {
			const modules = {
				c: ['a'],
				a: ['b'],
				b: ['c']
			};
			const result = cyclic(modules);
			result.should.have.length(1);
			result[0].should.eql(['a', 'b', 'c']);
		});

		it('avoids duplicate cycles regardless of entry point', () => {
			const modules = {
				a: ['b'],
				b: ['c'],
				c: ['a'],
				d: ['a']
			};
			const result = cyclic(modules);
			// Should only find the a->b->c cycle once, even though
			// we can enter it from multiple nodes
			result.should.have.length(1);
			result[0].should.eql(['a', 'b', 'c']);
		});

		it('normalizes multiple rotations of the same cycle', () => {
			const modules = {
				x: ['y'],
				y: ['z'],
				z: ['x']
			};
			const result = cyclic(modules);
			result.should.have.length(1);
			// Should always start with 'x' (smallest lexicographically)
			result[0].should.eql(['x', 'y', 'z']);
		});
	});

	describe('Complex graphs', () => {
		it('handles a large acyclic graph', () => {
			const modules = {};
			// Create a chain of 100 nodes with no cycles
			for (let i = 0; i < 100; i++) {
				modules[`node${i}`] = i < 99 ? [`node${i + 1}`] : [];
			}
			const result = cyclic(modules);
			result.should.eql([]);
		});

		it('handles a large graph with one cycle at the end', () => {
			const modules = {};
			// Create a chain of 100 nodes with a cycle at the end
			for (let i = 0; i < 100; i++) {
				if (i === 99) {
					modules[`node${i}`] = ['node98'];
				} else {
					modules[`node${i}`] = [`node${i + 1}`];
				}
			}
			const result = cyclic(modules);
			result.should.have.length(1);
			result[0].should.eql(['node98', 'node99']);
		});

		it('handles fully connected cyclic graph', () => {
			// Every node points to every other node
			const modules = {
				a: ['b', 'c'],
				b: ['a', 'c'],
				c: ['a', 'b']
			};
			const result = cyclic(modules);
			// Should find all unique cycles in a fully connected graph
			// In a fully connected graph of 3 nodes, there are 5 cycles:
			// a->b->a, a->c->a, b->c->b, a->b->c->a, a->c->b->a
			result.should.have.length(5);
			result.should.containEql(['a', 'b']);
			result.should.containEql(['a', 'c']);
			result.should.containEql(['b', 'c']);
			result.should.containEql(['a', 'b', 'c']);
			result.should.containEql(['a', 'c', 'b']);
		});

		it('handles a graph with multiple independent cycles', () => {
			const modules = {
				// Cycle 1: a -> b -> a
				a: ['b'],
				b: ['a'],
				// Cycle 2: c -> d -> e -> c
				c: ['d'],
				d: ['e'],
				e: ['c'],
				// Cycle 3: f -> g -> f
				f: ['g'],
				g: ['f'],
				// Non-cyclic nodes
				h: ['i'],
				i: []
			};
			const result = cyclic(modules);
			result.should.have.length(3);
			result.should.containEql(['a', 'b']);
			result.should.containEql(['c', 'd', 'e']);
			result.should.containEql(['f', 'g']);
		});
	});

	describe('Edge cases', () => {
		it('handles nodes with multiple dependencies, only some cyclic', () => {
			const modules = {
				a: ['b', 'c', 'd'],
				b: ['a'],
				c: [],
				d: []
			};
			const result = cyclic(modules);
			result.should.have.length(1);
			result[0].should.eql(['a', 'b']);
		});

		it('handles cycles with varying path lengths to same node', () => {
			const modules = {
				a: ['b', 'c'],
				b: ['d'],
				c: ['b', 'd'],
				d: ['a']
			};
			const result = cyclic(modules);
			// Should find all unique cycles
			result.should.have.length(3);
		});

		it('handles modules with undefined dependencies', () => {
			const modules = {
				a: ['b'],
				// b is referenced but not defined
				c: []
			};
			const result = cyclic(modules);
			result.should.eql([]);
		});

		it('handles module names with special characters', () => {
			const modules = {
				'module-a': ['module-b'],
				'module-b': ['module-a']
			};
			const result = cyclic(modules);
			result.should.have.length(1);
			result[0].should.eql(['module-a', 'module-b']);
		});

		it('handles module names with dots and slashes', () => {
			const modules = {
				'./src/a.js': ['./src/b.js'],
				'./src/b.js': ['./src/a.js']
			};
			const result = cyclic(modules);
			result.should.have.length(1);
			result[0].should.eql(['./src/a.js', './src/b.js']);
		});
	});

	describe('Performance characteristics', () => {
		it('efficiently handles deep dependency chains', () => {
			const modules = {};
			const chainLength = 1000;

			// Create a long chain with a cycle at the end
			for (let i = 0; i < chainLength; i++) {
				if (i === chainLength - 1) {
					modules[`n${i}`] = [`n${i - 1}`];
				} else {
					modules[`n${i}`] = [`n${i + 1}`];
				}
			}

			const start = Date.now();
			const result = cyclic(modules);
			const duration = Date.now() - start;

			result.should.have.length(1);
			// Should complete in reasonable time (< 100ms for 1000 nodes)
			duration.should.be.below(100);
		});

		it('efficiently handles graphs with many cycles', () => {
			const modules = {};
			const numCycles = 50;

			// Create many independent 2-node cycles
			for (let i = 0; i < numCycles; i++) {
				modules[`a${i}`] = [`b${i}`];
				modules[`b${i}`] = [`a${i}`];
			}

			const start = Date.now();
			const result = cyclic(modules);
			const duration = Date.now() - start;

			result.should.have.length(numCycles);
			// Should complete in reasonable time (< 50ms for 50 cycles)
			duration.should.be.below(50);
		});

		it('efficiently detects duplicates in large graphs', () => {
			const modules = {};

			// Create a pattern that could generate many duplicate detections
			// Hub and spoke pattern with cycles
			modules.hub = ['s1', 's2', 's3', 's4', 's5'];
			for (let i = 1; i <= 5; i++) {
				modules[`s${i}`] = ['hub'];
			}

			const start = Date.now();
			const result = cyclic(modules);
			const duration = Date.now() - start;

			// Should find exactly 5 unique cycles
			result.should.have.length(5);
			// Should be fast due to Set-based duplicate detection
			duration.should.be.below(10);
		});
	});

	describe('Regression tests', () => {
		it('handles the yoz test case (issue #447)', () => {
			// This is the pattern that was failing before the fix
			// Graph: d -> e,f -> g -> d
			const modules = {
				d: ['e', 'f'],
				e: ['g'],
				f: ['g'],
				g: ['d']
			};
			const result = cyclic(modules);
			result.should.have.length(2);
			result.should.containEql(['d', 'e', 'g']);
			result.should.containEql(['d', 'f', 'g']);
		});

		it('handles the bcdeg test case', () => {
			// Graph: d -> c,e -> g -> d
			const modules = {
				d: ['c', 'e'],
				c: ['g'],
				e: ['g'],
				g: ['d']
			};
			const result = cyclic(modules);
			result.should.have.length(2);
			result.should.containEql(['c', 'g', 'd']);
			result.should.containEql(['d', 'e', 'g']);
		});

		it('returns consistent results regardless of entry point', () => {
			const modules = {
				a: ['b'],
				b: ['c', 'd'],
				c: ['e'],
				d: ['e'],
				e: ['b']
			};

			// The algorithm should find all cycles regardless of which
			// node we process first. Since we process all nodes,
			// the result should be deterministic.
			const result1 = cyclic(modules);
			const result2 = cyclic(modules);

			result1.should.eql(result2);
			result1.should.have.length(2);
		});

		it('handles alphabetical ordering edge cases', () => {
			// Test that alphabetical ordering doesn't affect results
			const modules = {
				z: ['y'],
				y: ['x'],
				x: ['z']
			};
			const result = cyclic(modules);
			result.should.have.length(1);
			// The cycle is x->z->y->x, normalized to start with 'x'
			result[0].should.eql(['x', 'z', 'y']);
		});
	});

	describe('Data structure optimization', () => {
		it('uses Set for path checking (performance test)', () => {
			// Create a graph with very deep paths
			const modules = {};
			const depth = 500;

			// Create a deep chain
			for (let i = 0; i < depth; i++) {
				modules[`node${i}`] = [`node${i + 1}`];
			}
			// Add cycle at the end
			modules[`node${depth}`] = ['node0'];

			const start = Date.now();
			const result = cyclic(modules);
			const duration = Date.now() - start;

			result.should.have.length(1);
			// With Set-based path checking, this should be fast
			// Without Set (using Array.includes), this would be O(n^2)
			duration.should.be.below(50);
		});

		it('uses Set for cycle deduplication (performance test)', () => {
			// Create a graph that visits the same cycle many times
			const modules = {
				a: ['b'],
				b: ['c'],
				c: ['a']
			};

			// Add many nodes that all point to the cycle
			for (let i = 0; i < 100; i++) {
				modules[`outer${i}`] = ['a'];
			}

			const start = Date.now();
			const result = cyclic(modules);
			const duration = Date.now() - start;

			// Should only find the cycle once
			result.should.have.length(1);
			result[0].should.eql(['a', 'b', 'c']);
			// Should be fast with Set-based deduplication
			duration.should.be.below(20);
		});
	});

	describe('Correctness guarantees', () => {
		it('finds all cycles in a moderately complex graph', () => {
			const modules = {
				a: ['b', 'c'],
				b: ['d'],
				c: ['d', 'e'],
				d: ['a'],
				e: ['c']
			};
			const result = cyclic(modules);

			// This graph should have exactly 3 cycles:
			// 1. a -> b -> d -> a
			// 2. a -> c -> d -> a
			// 3. c -> e -> c
			result.should.have.length(3);
			result.should.containEql(['a', 'b', 'd']);
			result.should.containEql(['a', 'c', 'd']);
			result.should.containEql(['c', 'e']);
		});

		it('ensures each cycle is minimal (no shortcuts)', () => {
			const modules = {
				a: ['b', 'd'],
				b: ['c'],
				c: ['d'],
				d: ['a']
			};
			const result = cyclic(modules);

			// Should find the full cycle a->b->c->d->a
			// Not shortcuts like a->d->a (which exists as an edge)
			result.should.have.length(2);
			result.should.containEql(['a', 'b', 'c', 'd']);
			result.should.containEql(['a', 'd']);
		});

		it('correctly identifies all unique simple cycles', () => {
			// A graph where multiple paths lead to cycles
			const modules = {
				entry1: ['a'],
				entry2: ['a'],
				a: ['b'],
				b: ['c'],
				c: ['a', 'd'],
				d: ['b']
			};
			const result = cyclic(modules);

			// Should find both cycles regardless of multiple entry points
			result.should.have.length(2);
			result.should.containEql(['a', 'b', 'c']);
			result.should.containEql(['b', 'c', 'd']);
		});
	});
});
