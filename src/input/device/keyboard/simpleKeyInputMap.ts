/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

type KeyMap = Partial<Record<Key, InputActionType>>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SimpleKeyInputMap extends InputMap<KeySignal> {

	static readonly DEFAULT_KEY_MAP: KeyMap = {
		"W": InputActionType.UP,
		"A": InputActionType.LEFT,
		"S": InputActionType.DOWN,
		"D": InputActionType.RIGHT,
		" ": InputActionType.JUMP,
	};

	constructor(
		readonly keyMap: KeyMap = SimpleKeyInputMap.DEFAULT_KEY_MAP,
	) {
		super();
	}

	override translateInputSignal(signal: KeySignal): Sequence<InputAction> {
		const inputActionType: Optional<InputActionType> = Optional.ofNullable(this.keyMap[signal.key]);

		if(inputActionType.isEmpty()) {
			return Sequence.empty();
		}

		const inputAction = new InputAction(inputActionType.value, signal.pressed);

		return Sequence.from(inputAction);
	}
}
