/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

/**
 * A 2-dimensional position/point.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Position2D {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	assign(other: Readonly<Position2D>) {
		this.x = other.x;
		this.y = other.y;
	}
}
