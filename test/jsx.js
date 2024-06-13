/* eslint-env mocha */
import madge from '../lib/api.js';
import {fileURLToPath} from 'url';
import 'should';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('JSX', () => {
	const dir = __dirname + '/jsx';

	it('finds import in JSX files', (done) => {
		madge(dir + '/basic.jsx').then((res) => {
			res.obj().should.eql({
				'basic.jsx': ['other.jsx'],
				'other.jsx': []
			});
			done();
		}).catch(done);
	});
});
