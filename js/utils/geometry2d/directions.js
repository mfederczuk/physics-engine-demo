"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
/**
 * Returns the given number in the range of `[0, 360)`.
 */
function keepDegreeInRange(n) {
    return keepInRange(n, 360);
}
function degreesToRadians(degrees) {
    return (degrees * Math.PI / 180);
}
function radiansToDegrees(radians) {
    return (radians * 180 / Math.PI);
}
