"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
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
            return;
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
    computeXEnd() { return (this.x + this.width); }
    computeYEnd() { return (this.y + this.height); }
    copy() {
        const copy = new Box2D(0, 0, 0, 0);
        copy.assign(this);
        return copy;
    }
}
