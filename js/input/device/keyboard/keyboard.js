"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _KeyboardKey_pressCallback, _KeyboardKey_releaseCallback, _Keyboard_instances, _Keyboard_inputSignalsRelay, _Keyboard_newKeyboardKey;
class KeyboardKey {
    constructor(pressCallback, releaseCallback) {
        _KeyboardKey_pressCallback.set(this, void 0);
        _KeyboardKey_releaseCallback.set(this, void 0);
        __classPrivateFieldSet(this, _KeyboardKey_pressCallback, pressCallback, "f");
        __classPrivateFieldSet(this, _KeyboardKey_releaseCallback, releaseCallback, "f");
    }
    press() {
        __classPrivateFieldGet(this, _KeyboardKey_pressCallback, "f").call(this);
    }
    release() {
        __classPrivateFieldGet(this, _KeyboardKey_releaseCallback, "f").call(this);
    }
}
_KeyboardKey_pressCallback = new WeakMap(), _KeyboardKey_releaseCallback = new WeakMap();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Keyboard extends InputDevice {
    constructor() {
        super(...arguments);
        _Keyboard_instances.add(this);
        _Keyboard_inputSignalsRelay.set(this, new PublishRelay());
        this.inputSignals = __classPrivateFieldGet(this, _Keyboard_inputSignalsRelay, "f").hide();
        this.wKey = __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_newKeyboardKey).call(this, "W");
        this.aKey = __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_newKeyboardKey).call(this, "A");
        this.sKey = __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_newKeyboardKey).call(this, "S");
        this.dKey = __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_newKeyboardKey).call(this, "D");
        this.spaceKey = __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_newKeyboardKey).call(this, " ");
    }
}
_Keyboard_inputSignalsRelay = new WeakMap(), _Keyboard_instances = new WeakSet(), _Keyboard_newKeyboardKey = function _Keyboard_newKeyboardKey(key) {
    return new KeyboardKey(__classPrivateFieldGet(this, _Keyboard_inputSignalsRelay, "f").onNext.bind(__classPrivateFieldGet(this, _Keyboard_inputSignalsRelay, "f"), { key, pressed: true }), __classPrivateFieldGet(this, _Keyboard_inputSignalsRelay, "f").onNext.bind(__classPrivateFieldGet(this, _Keyboard_inputSignalsRelay, "f"), { key, pressed: false }));
};
