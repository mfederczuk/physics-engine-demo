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
