import token from './token';

/**
 * Tries to consume content from given stream that matches `fn` test. If consumed,
 * moves `.start` property of stream to the beginning of consumed token
 * @param {StreamReader} stream 
 * @param {function} fn 
 * @return {boolean}
 */
export function consume(stream, fn) {
	const pos = stream.pos;
	if (stream.eatWhile(fn)) {
		stream.start = pos;
		return true;
	}

	stream.pos = pos;
	return false;
}

/**
 * Eats array of character codes from given stream
 * @param  {StreamReader} stream
 * @param  {Number[]} codes  Array of character codes
 * @return {Boolean}
 */
export function eatArray(stream, codes) {
	const start = stream.pos;

	for (let i = 0; i < codes.length; i++) {
		if (!stream.eat(codes[i])) {
			stream.pos = start;
			return false;
		}
	}

	stream.start = start;
	return true;
}

/**
 * Consumes section from given string which starts with `open` character codes
 * and ends with `close` character codes
 * @param  {StreamReader} stream
 * @param  {Number[]} open
 * @param  {Number[]} close
 * @return {Boolean}  Returns `true` if section was consumed
 */
export function eatSection(stream, open, close, type, allowUnclosed) {
	const start = stream.pos;
	let contentStart, contentEnd, value;

	if (eatArray(stream, open)) {
		// read next until we find ending part or reach the end of input
		contentStart = stream.pos;
		while (!stream.eof()) {
			contentEnd = stream.pos;
			if (eatArray(stream, close)) {
				value = token(stream, contentStart, contentEnd);
				break;
			}

			stream.next();
		}

		// unclosed section is allowed
		if (!value && allowUnclosed) {
			value = token(stream, contentStart, contentEnd);
		}

		if (value) {
			return {
				type,
				value,
				range: token(stream, start, stream.pos)
			};
		}

		throw stream.error(`Expected ${close.map(String.fromCharCode).join('')}`);
	}
}

/**
 * Converts given string into array of character codes
 * @param  {String} str
 * @return {Number[]}
 */
export function toCharCodes(str) {
	return str.split('').map(ch => ch.charCodeAt(0));
}
