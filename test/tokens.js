import assert from 'assert';
import XmlParser from '../index';

describe('Tokens', () => {
	function parse(text, options, callback) {
		return new XmlParser(text, options, callback).parse();
	}

	const getTokens = code => {
		const tokens = [];
		parse(code, token => tokens.push(token));
		return tokens;
	};

	it('should parse open and close tags', () => {
		const tokens = getTokens('<foo></foo>');

		assert.strictEqual(tokens.length, 2);

		const [open, close] = tokens;

		assert.strictEqual(open.type, 'open');
		assert.strictEqual(open.name.content, 'foo');
		assert.strictEqual(open.range.content, '<foo>');
		assert.strictEqual(open.selfClose, false);
		assert.deepEqual(open.range.range, [0, 5]);
		assert.deepEqual(open.attributes, []);

		assert.strictEqual(close.type, 'close');
		assert.strictEqual(close.name.content, 'foo');
		assert.strictEqual(close.range.content, '</foo>');
		assert.deepEqual(close.range.range, [5, 11]);
	});

	it('should parse self-closing tags', () => {
		const tokens = getTokens('<foo a="1" b=123    c=\'foo bar\' bool />');

		assert.strictEqual(tokens.length, 1);

		const [tag] = tokens;

		assert.strictEqual(tag.type, 'open');
		assert.strictEqual(tag.name.content, 'foo');
		assert.strictEqual(tag.selfClose, true);
		assert.strictEqual(tag.attributes.length, 4);
		assert.deepEqual(tag.range.range, [0, 39]);

		const [a, b, c, bool] = tag.attributes;

		assert.strictEqual(a.type, 'attribute');
		assert.strictEqual(a.name.content, 'a');
		assert.strictEqual(a.value.type, 'quoted');
		assert.strictEqual(a.value.value.content, '1');
		assert.strictEqual(a.value.range.content, '"1"');

		assert.strictEqual(b.type, 'attribute');
		assert.strictEqual(b.name.content, 'b');
		assert.strictEqual(b.value.type, 'unquoted');
		assert.strictEqual(b.value.value.content, '123');
		assert.strictEqual(b.value.range, b.value.value);

		assert.strictEqual(c.type, 'attribute');
		assert.strictEqual(c.name.content, 'c');
		assert.strictEqual(c.value.type, 'quoted');
		assert.strictEqual(c.value.value.content, 'foo bar');
		assert.strictEqual(c.value.range.content, '\'foo bar\'');

		assert.strictEqual(bool.type, 'attribute');
		assert.strictEqual(bool.name.content, 'bool');
		assert.strictEqual(bool.value, undefined);
		assert.strictEqual(bool.range.content, 'bool');
	});

	it('should parse comment', () => {
		const tokens = getTokens('<!-- foo bar -->');

		assert.strictEqual(tokens.length, 1);

		const [comment] = tokens;
		assert.strictEqual(comment.type, 'comment');
		assert.strictEqual(comment.value.content, ' foo bar ');
		assert.strictEqual(comment.range.content, '<!-- foo bar -->');

	});

	it('should parse processing instruction', () => {
		const tokens = getTokens('<?xml version="1.0"?>');

		assert.strictEqual(tokens.length, 1);

		const [pi] = tokens;
		assert.strictEqual(pi.type, 'processing-instruction');
		assert.strictEqual(pi.value.content, 'xml version="1.0"');
		assert.strictEqual(pi.range.content, '<?xml version="1.0"?>');

	});

	it('should parse CDATA', () => {
		const tokens = getTokens('<![CDATA[ <foo> ]]>');

		assert.strictEqual(tokens.length, 1);

		const [cdata] = tokens;
		assert.strictEqual(cdata.type, 'cdata');
		assert.strictEqual(cdata.value.content, ' <foo> ');
		assert.strictEqual(cdata.range.content, '<![CDATA[ <foo> ]]>');
	});

	it('should parse text', () => {
		const tokens = getTokens(' hello\nworld');

		assert.strictEqual(tokens.length, 1);

		const [text] = tokens;
		assert.strictEqual(text.type, 'text');
		assert.strictEqual(text.value.content, ' hello\nworld');
		assert.strictEqual(text.value, text.range);
	});
});
