"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SimpleKeyInputMap extends InputMap {
    constructor(keyMap = SimpleKeyInputMap.DEFAULT_KEY_MAP) {
        super();
        this.keyMap = keyMap;
    }
    translateInputSignal(signal) {
        const inputActionType = Optional.ofNullable(this.keyMap[signal.key]);
        if (inputActionType.isEmpty()) {
            return Sequence.empty();
        }
        const inputAction = new InputAction(inputActionType.value, signal.pressed);
        return Sequence.from(inputAction);
    }
}
SimpleKeyInputMap.DEFAULT_KEY_MAP = {
    "W": InputActionType.UP,
    "A": InputActionType.LEFT,
    "S": InputActionType.DOWN,
    "D": InputActionType.RIGHT,
    " ": InputActionType.JUMP,
};
