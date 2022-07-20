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
var _ObservableValue_instances, _ObservableValue_value, _ObservableValue_listeners, _ObservableValue_notifyListeners;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ObservableValue {
    constructor(initialValue) {
        _ObservableValue_instances.add(this);
        _ObservableValue_value.set(this, void 0);
        _ObservableValue_listeners.set(this, new Set());
        __classPrivateFieldSet(this, _ObservableValue_value, initialValue, "f");
    }
    get() {
        return __classPrivateFieldGet(this, _ObservableValue_value, "f");
    }
    set(value) {
        __classPrivateFieldSet(this, _ObservableValue_value, value, "f");
        __classPrivateFieldGet(this, _ObservableValue_instances, "m", _ObservableValue_notifyListeners).call(this);
    }
    addListener(...args) {
        const listener = ((args.length === 1) ? args[0] : args[1]);
        const options = ((args.length === 1) ? {} : args[0]);
        __classPrivateFieldGet(this, _ObservableValue_listeners, "f").add(listener);
        if (options.invokeImmediately === true) {
            listener(__classPrivateFieldGet(this, _ObservableValue_value, "f"));
        }
    }
    removeListener(listener) {
        __classPrivateFieldGet(this, _ObservableValue_listeners, "f").delete(listener);
    }
}
_ObservableValue_value = new WeakMap(), _ObservableValue_listeners = new WeakMap(), _ObservableValue_instances = new WeakSet(), _ObservableValue_notifyListeners = function _ObservableValue_notifyListeners() {
    for (const listener of __classPrivateFieldGet(this, _ObservableValue_listeners, "f")) {
        listener(__classPrivateFieldGet(this, _ObservableValue_value, "f"));
    }
};
