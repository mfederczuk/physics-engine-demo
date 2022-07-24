"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
// FIXME: enums in TypeScript aren't actually type safe, replace with something else. maybe `type Foo = "A" | "B" | "C"`?
var InputActionType;
(function (InputActionType) {
    InputActionType[InputActionType["UP"] = 0] = "UP";
    InputActionType[InputActionType["DOWN"] = 1] = "DOWN";
    InputActionType[InputActionType["LEFT"] = 2] = "LEFT";
    InputActionType[InputActionType["RIGHT"] = 3] = "RIGHT";
    InputActionType[InputActionType["JUMP"] = 4] = "JUMP";
})(InputActionType || (InputActionType = {}));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class InputAction {
    constructor(type, active) {
        this.type = type;
        this.active = active;
        // eslint-disable-next-line no-empty-function
    }
}
