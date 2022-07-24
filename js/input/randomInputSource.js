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
var _RandomInputSource_instances, _a, _RandomInputSource_MIN_TIMEOUT_DELAY_MS, _RandomInputSource_CEIL_TIMEOUT_DELAY_MS, _RandomInputSource_VERTICAL_CHANCE, _RandomInputSource_HORIZONTAL_CHANCE, _RandomInputSource_JUMP_CHANCE, _RandomInputSource_inputActionsRelay, _RandomInputSource_generateRandomTimeoutDelay;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RandomInputSource extends InputSource {
    constructor() {
        super();
        _RandomInputSource_instances.add(this);
        _RandomInputSource_inputActionsRelay.set(this, new PublishRelay());
        this.inputActions = __classPrivateFieldGet(this, _RandomInputSource_inputActionsRelay, "f").hide();
        const callback = () => {
            const verticalMovement = Math.random();
            const horizontalMovement = Math.random();
            const up = (verticalMovement < (__classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_VERTICAL_CHANCE) / 2));
            const down = ((verticalMovement >= (__classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_VERTICAL_CHANCE) / 2)) &&
                (verticalMovement < __classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_VERTICAL_CHANCE)));
            const left = (horizontalMovement < (__classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_HORIZONTAL_CHANCE) / 2));
            const right = ((horizontalMovement >= (__classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_HORIZONTAL_CHANCE) / 2)) &&
                (horizontalMovement < __classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_HORIZONTAL_CHANCE)));
            const jump = (Math.random() < __classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_JUMP_CHANCE));
            const inputActions = Sequence.from(new InputAction(InputActionType.UP, up), new InputAction(InputActionType.DOWN, down), new InputAction(InputActionType.LEFT, left), new InputAction(InputActionType.RIGHT, right), new InputAction(InputActionType.JUMP, jump));
            __classPrivateFieldGet(this, _RandomInputSource_inputActionsRelay, "f").onNext(inputActions);
            setTimeout(callback, __classPrivateFieldGet(this, _RandomInputSource_instances, "m", _RandomInputSource_generateRandomTimeoutDelay).call(this));
        };
        callback();
    }
}
_a = RandomInputSource, _RandomInputSource_inputActionsRelay = new WeakMap(), _RandomInputSource_instances = new WeakSet(), _RandomInputSource_generateRandomTimeoutDelay = function _RandomInputSource_generateRandomTimeoutDelay() {
    const range = (__classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_CEIL_TIMEOUT_DELAY_MS) - __classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_MIN_TIMEOUT_DELAY_MS));
    return (Math.random() * range) + __classPrivateFieldGet(RandomInputSource, _a, "f", _RandomInputSource_MIN_TIMEOUT_DELAY_MS);
};
_RandomInputSource_MIN_TIMEOUT_DELAY_MS = { value: 50 };
_RandomInputSource_CEIL_TIMEOUT_DELAY_MS = { value: 500 };
_RandomInputSource_VERTICAL_CHANCE = { value: 0.9 };
_RandomInputSource_HORIZONTAL_CHANCE = { value: 0.9 };
_RandomInputSource_JUMP_CHANCE = { value: 0.3 };
