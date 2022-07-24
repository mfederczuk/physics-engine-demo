"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WebKeyboard_instances, _WebKeyboard_keyMap, _WebKeyboard_init;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WebKeyboard extends Keyboard {
    constructor(window) {
        super();
        this.window = window;
        _WebKeyboard_instances.add(this);
        _WebKeyboard_keyMap.set(this, {
            "w": this.wKey,
            "a": this.aKey,
            "s": this.sKey,
            "d": this.dKey,
            " ": this.spaceKey,
        });
        __classPrivateFieldGet(this, _WebKeyboard_instances, "m", _WebKeyboard_init).call(this);
    }
}
_WebKeyboard_keyMap = new WeakMap(), _WebKeyboard_instances = new WeakSet(), _WebKeyboard_init = function _WebKeyboard_init() {
    if (typeof (this.window.onkeydown) === "function") {
        throw new Error("Window.onkeydown already has a function. Refusing to override existing function.");
    }
    if (typeof (this.window.onkeyup) === "function") {
        throw new Error("Window.onkeyup already has a function. Refusing to override existing function.");
    }
    this.window.onkeydown = (event) => {
        var _a;
        if (event.repeat) {
            return;
        }
        (_a = __classPrivateFieldGet(this, _WebKeyboard_keyMap, "f")[event.key]) === null || _a === void 0 ? void 0 : _a.press();
    };
    this.window.onkeyup = (event) => {
        var _a;
        (_a = __classPrivateFieldGet(this, _WebKeyboard_keyMap, "f")[event.key]) === null || _a === void 0 ? void 0 : _a.release();
    };
};
