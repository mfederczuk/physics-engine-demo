"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
/**
 * Shows an alert and throws an exception, both with `msg`. Use this for fatal errors.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function error(msg) {
    window.alert(msg);
    throw Error(msg);
}
/**
 * Returns the given number in the range of `[0, exclusiveCeil)`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function keepInRange(n, exclusiveCeil) {
    // looks stupid, but it works
    return ((n % exclusiveCeil) + exclusiveCeil) % exclusiveCeil;
}
