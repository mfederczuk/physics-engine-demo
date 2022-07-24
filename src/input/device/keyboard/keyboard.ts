/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

type Key = ("W" | "A" | "S" | "D" | " ");

interface KeySignal {
	readonly key: Key;
	readonly pressed: boolean;
}

class KeyboardKey {

	readonly #pressCallback: () => void;
	readonly #releaseCallback: () => void;

	constructor(
		pressCallback: () => void,
		releaseCallback: () => void,
	) {
		this.#pressCallback = pressCallback;
		this.#releaseCallback = releaseCallback;
	}

	press() {
		this.#pressCallback();
	}

	release() {
		this.#releaseCallback();
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Keyboard extends InputDevice<KeySignal> {

	readonly #inputSignalsRelay: PublishRelay<KeySignal> = new PublishRelay();

	override readonly inputSignals: Observable<KeySignal> = this.#inputSignalsRelay.hide();

	#newKeyboardKey(key: Key): KeyboardKey {
		return new KeyboardKey(
			this.#inputSignalsRelay.onNext.bind(this.#inputSignalsRelay, { key, pressed: true  }),
			this.#inputSignalsRelay.onNext.bind(this.#inputSignalsRelay, { key, pressed: false }),
		);
	}

	readonly wKey:     KeyboardKey = this.#newKeyboardKey("W");
	readonly aKey:     KeyboardKey = this.#newKeyboardKey("A");
	readonly sKey:     KeyboardKey = this.#newKeyboardKey("S");
	readonly dKey:     KeyboardKey = this.#newKeyboardKey("D");
	readonly spaceKey: KeyboardKey = this.#newKeyboardKey(" ");
}
