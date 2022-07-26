/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

interface ReadonlyPosition2D {
	readonly x: number;
	readonly y: number;
}

/**
 * A 2-dimensional position/point.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Position2D implements ReadonlyPosition2D {

	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	assign(other: ReadonlyPosition2D) {
		this.x = other.x;
		this.y = other.y;
	}
}
