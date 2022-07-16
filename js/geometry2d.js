"use strict";
/**
 * A 2-dimensional position/point.
 */
class Position2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    assign(other) {
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
    constructor(positionOrX, widthOrSizeOrY, heightOrWidthOrSize, height) {
        if (positionOrX instanceof Position2D) {
            this.position = positionOrX;
            if (typeof (heightOrWidthOrSize) === "number") {
                this.width = widthOrSizeOrY;
                this.height = heightOrWidthOrSize;
                return;
            }
            this.height = (this.width = widthOrSizeOrY);
            return;
        }
        this.position = new Position2D(positionOrX, widthOrSizeOrY);
        if (typeof (height) === "number") {
            this.width = heightOrWidthOrSize;
            this.height = height;
        }
        this.height = (this.width = heightOrWidthOrSize);
    }
    assign(other) {
        this.position.assign(other.position);
        this.width = other.width;
        this.height = other.height;
    }
    get x() { return this.position.x; }
    set x(x) { this.position.x = x; }
    get y() { return this.position.y; }
    set y(y) { this.position.y = y; }
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
    constructor(xd, yd) {
        if ((typeof (xd) === "undefined") && (typeof (yd) === "undefined")) {
            this.xd = 0;
            this.yd = 0;
        }
        else if ((typeof (xd) === "number") && (typeof (yd) === "number")) {
            this.xd = xd;
            this.yd = yd;
        }
        else {
            throw undefined;
        }
    }
    /**
     * Instantiates and returns a new zero vector.
     *
     * @see https://en.wikipedia.org/wiki/Euclidean_vector#Zero_vector
     */
    static newZero() {
        return new Vector2D(0, 0);
    }
    assign(other) {
        this.xd = other.xd;
        this.yd = other.yd;
    }
    static sum(vectors) {
        const sum = new Vector2D(0, 0);
        for (const vector of vectors) {
            sum.add(vector);
        }
        return sum;
    }
    add(other) {
        this.xd += other.xd;
        this.yd += other.yd;
    }
    /**
     * Checks whether or not `this` is a zero vector.
     *
     * @see https://en.wikipedia.org/wiki/Euclidean_vector#Zero_vector
     */
    isZero() {
        return ((this.xd === 0) && (this.yd === 0));
    }
    reversed() {
        return new Vector2D(-(this.xd), -(this.yd));
    }
}
