/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

/**
 * Returns the given number in the range of `[0, exclusiveCeil)`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function keepInRange(n: number, exclusiveCeil: number): number {
	// looks stupid, but it works
	return ((n % exclusiveCeil) + exclusiveCeil) % exclusiveCeil;
}

interface String {
	quote(quotationChar?: string, escapeChar?: string): string;
}
String.prototype.quote = function(this: string, quotationChar: string = "\"", escapeChar: string = "\\"): string {
	if(quotationChar.length !== 1) {
		throw new Error(`Quotation character (${quotationChar.quote()}) must be a single character`);
	}

	if(escapeChar.length !== 1) {
		throw new Error(`Escape character (${escapeChar.quote()}) must be a single character`);
	}

	if(this.length === 0) {
		return quotationChar.repeat(2);
	}

	let quotedStr = "";

	for(const ch of this) {
		if((ch === quotationChar) || (ch === escapeChar)) {
			quotedStr += escapeChar;
		}

		quotedStr += ch;
	}

	return (quotationChar + quotedStr + quotationChar);
};
