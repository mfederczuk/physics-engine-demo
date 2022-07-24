/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RandomInputSource extends InputSource {

	static readonly #MIN_TIMEOUT_DELAY_MS = 50;
	static readonly #CEIL_TIMEOUT_DELAY_MS = 500;

	static readonly #VERTICAL_CHANCE   = 0.9;
	static readonly #HORIZONTAL_CHANCE = 0.9;
	static readonly #JUMP_CHANCE       = 0.3;

	readonly #inputActionsRelay: PublishRelay<Sequence<InputAction>> = new PublishRelay();

	override readonly inputActions: Observable<Sequence<InputAction>> = this.#inputActionsRelay.hide();

	constructor() {
		super();

		const callback = () => {
			const verticalMovement: number = Math.random();
			const horizontalMovement: number = Math.random();

			const up: boolean   = (verticalMovement < (RandomInputSource.#VERTICAL_CHANCE / 2));
			const down: boolean = ((verticalMovement >= (RandomInputSource.#VERTICAL_CHANCE / 2)) &&
			                       (verticalMovement < RandomInputSource.#VERTICAL_CHANCE));

			const left: boolean  = (horizontalMovement < (RandomInputSource.#HORIZONTAL_CHANCE / 2));
			const right: boolean = ((horizontalMovement >= (RandomInputSource.#HORIZONTAL_CHANCE / 2)) &&
			                        (horizontalMovement < RandomInputSource.#HORIZONTAL_CHANCE));

			const jump: boolean = (Math.random() < RandomInputSource.#JUMP_CHANCE);

			const inputActions: Sequence<InputAction> = Sequence.from(
				new InputAction(InputActionType.UP,    up),
				new InputAction(InputActionType.DOWN,  down),
				new InputAction(InputActionType.LEFT,  left),
				new InputAction(InputActionType.RIGHT, right),
				new InputAction(InputActionType.JUMP,  jump),
			);

			this.#inputActionsRelay.onNext(inputActions);

			setTimeout(
				callback,
				this.#generateRandomTimeoutDelay(),
			);
		};

		callback();
	}

	#generateRandomTimeoutDelay(): number {
		const range = (RandomInputSource.#CEIL_TIMEOUT_DELAY_MS - RandomInputSource.#MIN_TIMEOUT_DELAY_MS);
		return (Math.random() * range) + RandomInputSource.#MIN_TIMEOUT_DELAY_MS;
	}
}
