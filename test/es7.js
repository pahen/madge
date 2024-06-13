/* eslint-env mocha */
import madge from '../lib/api.js';
import {fileURLToPath} from 'url';
import 'should';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('ES7', () => {
	const dir = __dirname + '/es7';

	it('extracts dependencies', (done) => {
		madge(dir + '/async.js').then((res) => {
			res.obj().should.eql({
				'other.js': [],
				'async.js': ['other.js']
			});
			done();
		}).catch(done);
	});
});
