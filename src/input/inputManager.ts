/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class InputManager {

	#inputSource: InputSource;

	#currentSubscription: Subscription = Subscription.cancelled();

	readonly #currentInputActions: Map<InputActionType, InputAction> = new Map();

	constructor(initialInputSource: InputSource) {
		this.#inputSource = initialInputSource;
		this.#subscribeToInputSource();
	}

	//#region input source

	getInputSource(): InputSource {
		return this.#inputSource;
	}

	setInputSource(inputSource: InputSource) {
		this.#currentSubscription.cancel();
		this.#inputSource = inputSource;
		this.#subscribeToInputSource();
	}

	//#endregion

	//#region input actions

	queryIfActive(actionType: InputActionType): boolean {
		return (this.#currentInputActions.get(actionType)?.active ?? false);
	}

	reset(actionType: InputActionType) {
		this.#currentInputActions.delete(actionType);
	}

	//#endregion

	#subscribeToInputSource() {
		this.#currentSubscription = this.#inputSource.inputActions.subscribe({
			onNext: (inputActions: Sequence<InputAction>) => {
				inputActions.waitForEach((element: InputAction) => {
					this.#currentInputActions.set(element.type, element);
				});
			}
		});
	}
}
