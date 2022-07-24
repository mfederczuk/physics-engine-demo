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
var _ObservableValue_instances, _ObservableValue_value, _ObservableValue_observers, _ObservableValue_notifyObservers;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ObservableValue extends Observable {
    constructor(initialValue) {
        super();
        _ObservableValue_instances.add(this);
        _ObservableValue_value.set(this, void 0);
        _ObservableValue_observers.set(this, new Set());
        __classPrivateFieldSet(this, _ObservableValue_value, initialValue, "f");
    }
    get() {
        return __classPrivateFieldGet(this, _ObservableValue_value, "f");
    }
    set(value) {
        __classPrivateFieldSet(this, _ObservableValue_value, value, "f");
        __classPrivateFieldGet(this, _ObservableValue_instances, "m", _ObservableValue_notifyObservers).call(this);
    }
    subscribeActual(downstreamObserver) {
        const subscription = Subscription.ofAction(() => {
            __classPrivateFieldGet(this, _ObservableValue_observers, "f").delete(downstreamObserver);
        });
        downstreamObserver.onSubscribe(subscription);
        downstreamObserver.onNext(__classPrivateFieldGet(this, _ObservableValue_value, "f"));
        __classPrivateFieldGet(this, _ObservableValue_observers, "f").add(downstreamObserver);
    }
}
_ObservableValue_value = new WeakMap(), _ObservableValue_observers = new WeakMap(), _ObservableValue_instances = new WeakSet(), _ObservableValue_notifyObservers = function _ObservableValue_notifyObservers() {
    for (const observer of __classPrivateFieldGet(this, _ObservableValue_observers, "f")) {
        observer.onNext(__classPrivateFieldGet(this, _ObservableValue_value, "f"));
    }
};
