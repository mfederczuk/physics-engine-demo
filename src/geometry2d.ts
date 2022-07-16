/**
 * A 2-dimensional position/point.
 */
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

/**
 * A 2-dimensional box/rectangle.
 *
 * It is represented as a position plus width and height, which means that all four corners have 90° and it cannot be
 * rotated.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Box2D {
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
}

/**
 * A 2-dimensional euclidean vector.
 *
 * Ordinarily, vectors are represented by a magnitude and a direction, this implementation, though, uses two magnitudes;
 * one for the X-axis and one for the Y-axis -- it is basically two 1-dimensional vectors.
 *
 * @see https://en.wikipedia.org/wiki/Euclidean_vector
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Vector2D {
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

	assign(other: Readonly<Vector2D>) {
		this.xd = other.xd;
		this.yd = other.yd;
	}

	static sum(vectors: Iterable<Readonly<Vector2D>>): Vector2D {
		const sum = new Vector2D(0, 0);

		for(const vector of vectors) {
			sum.add(vector);
		}

		return sum;
	}

	add(other: Readonly<Vector2D>) {
		this.xd += other.xd;
		this.yd += other.yd;
	}

	/**
	 * Checks whether or not `this` is a zero vector.
	 *
	 * @see https://en.wikipedia.org/wiki/Euclidean_vector#Zero_vector
	 */
	isZero(this: Readonly<Vector2D>): boolean {
		return ((this.xd === 0) && (this.yd === 0));
	}

	reverse() {
		this.xd = -(this.xd);
		this.yd = -(this.yd);
	}

	reversed(this: Readonly<Vector2D>): Vector2D {
		const copy = new Vector2D(this.xd, this.yd);
		copy.reverse();
		return copy;
	}
}
