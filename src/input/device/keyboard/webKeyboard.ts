/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WebKeyboard extends Keyboard {

	readonly #keyMap: Partial<Record<string, KeyboardKey>> = {
		"w": this.wKey,
		"a": this.aKey,
		"s": this.sKey,
		"d": this.dKey,
		" ": this.spaceKey,
	};

	constructor(readonly window: Window) {
		super();
		this.#init();
	}

	#init() {
		if(typeof(this.window.onkeydown) === "function") {
			throw new Error("Window.onkeydown already has a function. Refusing to override existing function.");
		}

		if(typeof(this.window.onkeyup) === "function") {
			throw new Error("Window.onkeyup already has a function. Refusing to override existing function.");
		}

		this.window.onkeydown = (event: KeyboardEvent) => {
			if(event.repeat) {
				return;
			}

			this.#keyMap[event.key]?.press();
		};

		this.window.onkeyup = (event: KeyboardEvent) => {
			this.#keyMap[event.key]?.release();
		};
	}
}
