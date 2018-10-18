import { consume } from './utils';
import token from './token';
import expression from './expression';
import { isWhiteSpace, isQuote, eatQuoted, isAlpha, isNumber } from '@emmetio/stream-reader-utils';

export const TAG_START = 60; // <
export const TAG_END = 62; // >
export const TAG_CLOSE = 47; // /
export const ATTR_DELIMITER = 61; // =
export const NAMESPACE_DELIMITER = 58; /* : */
export const DASH = 45; /* - */
export const DOT = 46; /* - */
export const UNDERSCORE = 95; /* - */

const quotedOpt = { throws: true };

/**
 * Consumes tag from current stream location, if possible
 * @param {StreamReader} stream 
 */
export default function tag(stream, options) {
	return openTag(stream, options) || closeTag(stream, options);
}

/**
 * Check if given character can be used as a name start of tag name or attribute
 * @param {number} ch 
 */
export function nameStartChar(ch) {
	return isAlpha(ch) || ch === UNDERSCORE || ch === NAMESPACE_DELIMITER;
}

/**
 * Check if given character can be used as a tag name
 * @param {number} ch 
 */
export function nameChar(ch) {
	return nameStartChar(ch) || isNumber(ch) || ch === DASH || ch === DOT;
}

/**
 * Consumes open tag from given stream
 * @param {StreamReader} stream 
 * @param {boolean} allowExpressions 
 */
function openTag(stream, options) {
	const pos = stream.pos;
	if (stream.eat(TAG_START) && ident(stream)) {
		const name = token(stream);
		const attributes = consumeAttributes(stream, options);
		const selfClose = stream.eat(TAG_CLOSE);

		if (!stream.eat(TAG_END)) {
			throw stream.error('Expected tag closing brace');
		}

		return {
			name,
			attributes,
			selfClose,
			range: token(stream, pos),
			type: 'open'
		};
	}

	stream.pos = pos;
	return false;
}

/**
 * Consumes close tag from given stream
 * @param {StreamReader} stream 
 */
function closeTag(stream) {
	const pos = stream.pos;
	if (stream.eat(TAG_START) && stream.eat(TAG_CLOSE)) {
		if (ident(stream)) {
			const name = token(stream);
			if (!stream.eat(TAG_END)) {
				throw stream.error('Expected tag closing brace');
			}
			return {
				name,
				range: token(stream, pos),
				type: 'close'
			};
		}

		throw stream.error('Unexpected character');
	}

	stream.pos = pos;
	return false;
}

/**
 * Returns `true` if valid XML identifier was consumed. If succeeded, sets stream 
 * range to consumed data
 * @param {StreamReader} stream 
 * @return {boolean}
 */
function ident(stream) {
	if (consume(stream, nameStartChar)) {
		stream.eatWhile(nameChar);
		return true;
	}

	return false;
}

/**
 * Consumes attributes from current stream start
 * @param {StreamReader} stream 
 * @param {XmlParserOptions} options 
 * @return {Array}
 */
function consumeAttributes(stream, options) {
	const attributes = [];
	let attr;
	while (!stream.eof()) {
		stream.eatWhile(isWhiteSpace);

		if (attr = attribute(stream, options)) {
			attributes.push(attr);
		} else if (!stream.eof() && !isTerminator(stream.peek())) {
			throw stream.error('Unexpected attribute name');
		} else {
			break;
		}
	}

	return attributes;
}

/**
 * Consumes attribute from current stream location
 * @param {StreamReader} stream 
 * @param {XmlParserOptions} [options]
 * @returns {object} Attribute data, if consumed
 */
function attribute(stream, options) {
	const expr = options.allowExpressions && expression(stream);
	if (expr) {
		return expr;
	}

	if (ident(stream)) {
		const name = token(stream);
		let value;

		if (stream.eat(ATTR_DELIMITER)) {
			if (!(value = attributeValue(stream, options))) {
				throw stream.error('Expecting attribute value');
			}
		}

		return {
			name,
			value,
			type: 'attribute',
			range: token(stream, name.start)
		};
	}
}

/**
 * Consumes attribute value from current stream location
 * @param {StreamReader} stream 
 * @param {XmlParserOptions} options
 * @return {Token}
 */
function attributeValue(stream, options) {
	const expr = options.allowExpressions && expression(stream);
	if (expr) {
		return expr;
	}

	const start = stream.pos;

	if (eatQuoted(stream, quotedOpt)) {
		return {
			type: 'quoted',
			value: token(stream, start + 1, stream.pos - 1),
			range: token(stream, start)
		};
	}

	if (stream.eatWhile(isUnquoted)) {
		const t = token(stream, start);
		return {
			type: 'unquoted',
			value: t,
			range: t
		};
	}
}

/**
 * Check if given code is tag terminator
 * @param  {Number}  code
 * @return {Boolean}
 */
function isTerminator(code) {
	return code === TAG_END || code === TAG_CLOSE;
}

/**
 * Check if given character code is valid unquoted value
 * @param  {Number}  code
 * @return {Boolean}
 */
function isUnquoted(code) {
	return !isNaN(code) && !isQuote(code) && !isWhiteSpace(code) 
		&& !isTerminator(code) && code !== ATTR_DELIMITER;
}
