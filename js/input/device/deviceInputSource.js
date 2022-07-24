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
var _DeviceInputSource_device, _DeviceInputSource_map;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DeviceInputSource extends InputSource {
    constructor(device, map) {
        super();
        _DeviceInputSource_device.set(this, void 0);
        _DeviceInputSource_map.set(this, void 0);
        __classPrivateFieldSet(this, _DeviceInputSource_device, new ObservableValue(device), "f");
        __classPrivateFieldSet(this, _DeviceInputSource_map, map, "f");
        this.inputActions = __classPrivateFieldGet(this, _DeviceInputSource_device, "f")
            .switchMap((device) => (device.inputSignals))
            .map((inputSignal) => {
            return __classPrivateFieldGet(this, _DeviceInputSource_map, "f").translateInputSignal(inputSignal);
        })
            .hide();
    }
    setDevice(device) {
        __classPrivateFieldGet(this, _DeviceInputSource_device, "f").set(device);
    }
    getDevice() {
        return __classPrivateFieldGet(this, _DeviceInputSource_device, "f").get();
    }
    getMap() {
        return __classPrivateFieldGet(this, _DeviceInputSource_map, "f");
    }
    setMap(map) {
        __classPrivateFieldSet(this, _DeviceInputSource_map, map, "f");
    }
}
_DeviceInputSource_device = new WeakMap(), _DeviceInputSource_map = new WeakMap();
