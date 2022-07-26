/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

interface ReadonlyBox2D {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
}

/**
 * A 2-dimensional box/rectangle.
 *
 * It is represented as a position plus width and height, which means that all four corners have 90° and it cannot be
 * rotated.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Box2D implements ReadonlyBox2D {

	position: Position2D;
	width: number;
	height: number;

	constructor(position: Position2D, width: number, height: number);
	constructor(position: Position2D, size: number);
	constructor(x: number,            y: number,     width: number, height: number);
	constructor(x: number,            y: number,     size: number);
	constructor(
		positionOrX: (Position2D | number),
		widthOrSizeOrY: number,
		heightOrWidthOrSize?: number,
		height?: number,
	) {
		if(positionOrX instanceof Position2D) {
			this.position = positionOrX;

			if(typeof(heightOrWidthOrSize) === "number") {
				this.width = widthOrSizeOrY;
				this.height = heightOrWidthOrSize;
				return;
			}

			this.height = (this.width = widthOrSizeOrY);
			return;
		}

		this.position = new Position2D(positionOrX, widthOrSizeOrY);

		if(typeof(height) === "number") {
			this.width = (heightOrWidthOrSize as number);
			this.height = height;
			return;
		}

		this.height = (this.width = (heightOrWidthOrSize as number));
	}

	assign(other: Readonly<Box2D>) {
		this.position.assign(other.position);
		this.width = other.width;
		this.height = other.height;
	}

	get x(): number { return this.position.x; }
	set x(x: number) { this.position.x = x; }

	get y(): number { return this.position.y; }
	set y(y: number) { this.position.y = y; }

	computeXEnd(): number { return (this.x + this.width);  }
	computeYEnd(): number { return (this.y + this.height); }

	copy(this: Readonly<Box2D>): Box2D {
		const copy = new Box2D(0, 0, 0, 0);
		copy.assign(this);
		return copy;
	}
}
