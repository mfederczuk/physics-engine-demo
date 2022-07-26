/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

/**
 * A 2-dimensional euclidean vector.
 *
 * Ordinarily, vectors are represented by a magnitude and a direction, this implementation, though, uses two magnitudes;
 * one for the X-axis and one for the Y-axis -- it is basically two 1-dimensional vectors at a right angle to one
 * another.
 *
 * @see https://en.wikipedia.org/wiki/Euclidean_vector
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Vector2D {
	// TODO: change to `representation: ({ xd: number, yd: number } | { magnitude: number, direction: number })`?

	xd: number;
	yd: number;

	constructor();
	constructor(xd: number, yd: number);
	constructor(xd?: number, yd?: number) {
		if((typeof(xd) === "undefined") && (typeof(yd) === "undefined")) {
			this.xd = 0;
			this.yd = 0;
		} else if((typeof(xd) === "number") && (typeof(yd) === "number")) {
			this.xd = xd;
			this.yd = yd;
		} else {
			throw undefined;
		}
	}

	/**
	 * Instantiates and returns a new zero vector.
	 *
	 * @see https://en.wikipedia.org/wiki/Euclidean_vector#Zero_vector
	 */
	static newZero(): Vector2D {
		return new Vector2D(0, 0);
	}

	/**
	 * @param direction Direction in degrees.
	 *                  May be less than 0 or greater than- or equal to 360 -- will be put back into
	 *                  the range of `[0, 360)`.
	 */
	static ofMagnitudeAndDirection(magnitude: number, direction: number): Vector2D {
		// i'm not particular good at math, so there's *definitely* a *way* better way to do this

		direction = degreesToRadians(keepDegreeInRange(direction));

		if(direction < (Math.PI / 2)) {
			const xd = magnitude * Math.sin(direction);
			const yd = magnitude * Math.sin((Math.PI / 2) - direction);
			return new Vector2D(xd, yd);
		}

		if(direction < Math.PI) {
			const xd = magnitude * Math.sin(Math.PI - direction);
			const yd = magnitude * Math.sin(direction - (Math.PI / 2));
			return new Vector2D(xd, -yd);
		}

		if(direction < (Math.PI * 1.5)) {
			const xd = magnitude * Math.sin(direction - Math.PI);
			const yd = magnitude * Math.sin((Math.PI * 1.5) - direction);
			return new Vector2D(-xd, -yd);
		}

		// direction < Math.PI * 2
		const xd = magnitude * Math.sin((Math.PI * 2) - direction);
		const yd = magnitude * Math.sin(direction - (Math.PI * 1.5));
		return new Vector2D(-xd, yd);
	}

	setXdYd(xd: number, yd: number) {
		this.xd = xd;
		this.yd = yd;
	}

	setZero() {
		this.setXdYd(0, 0);
	}

	assign(other: Readonly<Vector2D>) {
		this.setXdYd(other.xd, other.yd);
	}

	static sum(vectors: Sequence<Readonly<Vector2D>>): Vector2D {
		const sum = new Vector2D(0, 0);

		vectors.waitForEach((vector: Readonly<Vector2D>) => {
			sum.add(vector);
		});

		return sum;
	}

	/**
	 * Returns the magnitude of the vector.
	 */
	computeMagnitude(): number {
		return Math.sqrt(Math.abs(this.xd) ** 2 + Math.abs(this.yd) ** 2);
	}

	/**
	 * Returns the direction of the vector in degrees. `[0, 360)`
	 */
	computeDirection(): number {
		return radiansToDegrees(this.#computeDirectionRad());
	}

	#computeDirectionRad(): number {
		// i'm not particular good at math, so there's *definitely* a *way* better way to do this

		if((this.xd >= 0) && (this.yd > 0)) {
			return Math.atan(this.xd / this.yd);
		}

		if((this.xd > 0) && (this.yd <= 0)) {
			return Math.atan(Math.abs(this.yd) / this.xd) + (Math.PI / 2);
		}

		if((this.xd <= 0) && (this.yd < 0)) {
			return Math.atan(Math.abs(this.xd) / Math.abs(this.yd)) + Math.PI;
		}

		if((this.xd < 0) && (this.yd >= 0)) {
			return Math.atan(this.yd / Math.abs(this.xd)) + (Math.PI * 1.5);
		}

		return 0; // zero vector
	}

	changeMagnitude(newMagnitude: number) {
		// TODO: lazy way to do this, change it
		this.assign(Vector2D.ofMagnitudeAndDirection(newMagnitude, this.computeDirection()));
	}

	changeDirection(newDirection: number) {
		// TODO: lazy way to do this, change it
		this.assign(Vector2D.ofMagnitudeAndDirection(this.computeMagnitude(), newDirection));
	}

	add(other: Readonly<Vector2D>) {
		this.xd += other.xd;
		this.yd += other.yd;
	}

	multiply(n: number) {
		// TODO: lazy way to do this, change it
		this.changeMagnitude(this.computeMagnitude() * n);
	}

	/**
	 * Checks whether or not `this` is a zero vector.
	 *
	 * @see https://en.wikipedia.org/wiki/Euclidean_vector#Zero_vector
	 */
	isZero(this: Readonly<Vector2D>): boolean {
		return ((this.xd === 0) && (this.yd === 0));
	}

	isNotZero(this: Readonly<Vector2D>): boolean {
		return !(this.isZero());
	}

	reverse() {
		this.xd = -(this.xd);
		this.yd = -(this.yd);
	}

	reversed(this: Readonly<Vector2D>): Vector2D {
		const copy = this.copy();
		copy.reverse();
		return copy;
	}

	copy(this: Readonly<Vector2D>): Vector2D {
		const copy = new Vector2D();
		copy.assign(this);
		return copy;
	}
}
