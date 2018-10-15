'use strict';

import { eatSection, toCharCodes } from './utils';

const open = toCharCodes('<?');
const close = toCharCodes('?>');

/**
 * Consumes processing instruction from given stream
 * @param  {StreamReader} stream
 * @return {Token}
 */
export default function comment(stream) {
	return eatSection(stream, open, close, 'processing-instruction');
}
