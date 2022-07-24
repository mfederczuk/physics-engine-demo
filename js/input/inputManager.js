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
var _InputManager_instances, _InputManager_inputSource, _InputManager_currentSubscription, _InputManager_currentInputActions, _InputManager_subscribeToInputSource;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class InputManager {
    constructor(initialInputSource) {
        _InputManager_instances.add(this);
        _InputManager_inputSource.set(this, void 0);
        _InputManager_currentSubscription.set(this, Subscription.cancelled());
        _InputManager_currentInputActions.set(this, new Map());
        __classPrivateFieldSet(this, _InputManager_inputSource, initialInputSource, "f");
        __classPrivateFieldGet(this, _InputManager_instances, "m", _InputManager_subscribeToInputSource).call(this);
    }
    //#region input source
    getInputSource() {
        return __classPrivateFieldGet(this, _InputManager_inputSource, "f");
    }
    setInputSource(inputSource) {
        __classPrivateFieldGet(this, _InputManager_currentSubscription, "f").cancel();
        __classPrivateFieldSet(this, _InputManager_inputSource, inputSource, "f");
        __classPrivateFieldGet(this, _InputManager_instances, "m", _InputManager_subscribeToInputSource).call(this);
    }
    //#endregion
    //#region input actions
    queryIfActive(actionType) {
        var _a, _b;
        return ((_b = (_a = __classPrivateFieldGet(this, _InputManager_currentInputActions, "f").get(actionType)) === null || _a === void 0 ? void 0 : _a.active) !== null && _b !== void 0 ? _b : false);
    }
    reset(actionType) {
        __classPrivateFieldGet(this, _InputManager_currentInputActions, "f").delete(actionType);
    }
}
_InputManager_inputSource = new WeakMap(), _InputManager_currentSubscription = new WeakMap(), _InputManager_currentInputActions = new WeakMap(), _InputManager_instances = new WeakSet(), _InputManager_subscribeToInputSource = function _InputManager_subscribeToInputSource() {
    __classPrivateFieldSet(this, _InputManager_currentSubscription, __classPrivateFieldGet(this, _InputManager_inputSource, "f").inputActions.subscribe({
        onNext: (inputActions) => {
            inputActions.waitForEach((element) => {
                __classPrivateFieldGet(this, _InputManager_currentInputActions, "f").set(element.type, element);
            });
        }
    }), "f");
};
