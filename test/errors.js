import assert from 'assert';
import parse from '../index';

describe('Parser errors', () => {
	const err = (message, pos) => ({ message, pos });

	it('should throw error on invalid tags', () => {
		assert.throws(() => parse('<foo'), err(/Expected tag closing brace/, 4));
		assert.throws(() => parse('<foo '), err(/Expected tag closing brace/, 5));
		assert.throws(() => parse('<foo foo="bar"'), err(/Expected tag closing brace/, 14));

		assert.throws(() => parse('</foo'), err(/Expected tag closing brace/, 5));
		assert.throws(() => parse('</ foo>'), err(/Unexpected character/, 2));
		assert.throws(() => parse('</foo a="b">'), err(/Expected tag closing brace/, 5));
	});

	it('should throw error on invalid attributes', () => {
		assert.throws(() => parse('<foo a=>'), err(/Expecting attribute value/, 7));
		assert.throws(() => parse('<foo a=">'), err(/Unable to consume quoted string/, 7));
		assert.throws(() => parse('<foo a=="foo">'), err(/Expecting attribute value/, 7));
		assert.throws(() => parse('<foo a ="foo">'), err(/Unexpected attribute name/, 7));
	});

	it('should throw error on invalid comments', () => {
		assert.throws(() => parse('<!-- comment'), err(/Expected -->/, 12));
		assert.throws(() => parse('<!-- comment ->'), err(/Expected -->/, 15));
	});
});
