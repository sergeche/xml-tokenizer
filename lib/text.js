import token from './token';
import { EXPRESSION_START } from './expression';
import { TAG_START, TAG_CLOSE, nameStartChar } from './tag';

/**
 * Consumes text token from given 
 * @param {StreamReader} stream 
 * @param {XmlParserOptions} options
 */
export default function text(stream, options) {
	const start = stream.pos;
	while (!stream.eof()) {
		if (!options.allowExpressions && stream.peek() === EXPRESSION_START) {
			break;
		}

		if (stream.eat(TAG_START)) {
			if (!options.allowUnsafe || isControl(stream)) {
				stream.backUp();
				break;
			}

			continue;
		}

		stream.next();
	}

	if (start !== stream.pos) {
		const t = token(stream, start);
		return {
			type: 'text',
			value: t,
			range: t
		};
	}
}

/**
 * Check if current tag open character is safe to consume as text
 * @param {StreamReader} stream 
 */
function isControl(stream) {
	const ch = stream.peek();
	return nameStartChar(ch) 
		|| ch === TAG_CLOSE 
		|| ch === 33 /* ! */
		|| ch === 63; /* ? */
}
