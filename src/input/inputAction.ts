/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

// FIXME: enums in TypeScript aren't actually type safe, replace with something else. maybe `type Foo = "A" | "B" | "C"`?
enum InputActionType {
	UP,
	DOWN,
	LEFT,
	RIGHT,
	JUMP,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class InputAction {

	constructor(
		readonly type: InputActionType,
		readonly active: boolean,
	) {
		// eslint-disable-next-line no-empty-function
	}
}
