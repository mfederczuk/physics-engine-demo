/**
 * As the name suggests, a `Controller` object is used to control an entity's movement and action.
 *
 * The way that this works is that the game loop queries if "buttons" are active by using the `*Active` methods.
 */
abstract class Controller {
	abstract leftActive():  boolean;
	abstract rightActive(): boolean;
	abstract jumpActive():  boolean;
}

/**
 * A `Controller` implementation that doesn't do anything; all `*Active` methods will always return `false`.
 *
 * It is used as default value, when no other controller is given to avoid having the controller field in `Entity`s be
 * nullable.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DummyController extends Controller {
	leftActive():  boolean { return false; }
	rightActive(): boolean { return false; }
	jumpActive():  boolean { return false; }
}

/**
 * A `Controller` implementation that uses `Window.onkeyup` and `Window.onkeydown` events to let browser users control
 * an entity.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WebKeyboardController extends Controller {
	static readonly #LEFT_KEY  = "a";
	static readonly #RIGHT_KEY = "d";
	static readonly #JUMP_KEY  = " ";

	#left: boolean = false;
	#right: boolean = false;
	#jump: boolean = false;

	constructor(window: Window) {
		super();

		// TODO: these switch-cases are pretty much the exact same -- replace with a `keyMap` or something?

		window.onkeydown = (event: KeyboardEvent) => {
			switch(event.key) {
				case(WebKeyboardController.#LEFT_KEY): {
					this.#left = true;
					break;
				}
				case(WebKeyboardController.#RIGHT_KEY): {
					this.#right = true;
					break;
				}
				case(WebKeyboardController.#JUMP_KEY): {
					this.#jump = true;
					break;
				}
			}
		};

		window.onkeyup = (event: KeyboardEvent) => {
			switch(event.key) {
				case(WebKeyboardController.#LEFT_KEY): {
					this.#left = false;
					break;
				}
				case(WebKeyboardController.#RIGHT_KEY): {
					this.#right = false;
					break;
				}
				case(WebKeyboardController.#JUMP_KEY): {
					this.#jump = false;
					break;
				}
			}
		};
	}

	leftActive():  boolean { return this.#left;  }
	rightActive(): boolean { return this.#right; }
	jumpActive():  boolean { return this.#jump;  }
}

/**
 * A `Controller` implementation that "presses" "buttons" at random. It simulates a cat walking across a keyboard.
 *
 * Can be used as a sort of demonstration.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RandomController extends Controller {
	static readonly #LEFT_CHANCE  = 0.4;
	static readonly #RIGHT_CHANCE = 0.4;
	static readonly #JUMP_CHANCE  = 0.1;

	leftActive():  boolean { return (Math.random() < RandomController.#LEFT_CHANCE); }
	rightActive(): boolean { return (Math.random() < RandomController.#RIGHT_CHANCE); }
	jumpActive():  boolean { return (Math.random() < RandomController.#JUMP_CHANCE); }
}

/**
 * A `Controller` implementation that merges multiple other `Controller`s together.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MergedController extends Controller {
	readonly controllers: readonly Controller[];

	constructor(controllers: readonly Controller[]);
	constructor(controller: Controller, ...otherControllers: readonly Controller[]);
	constructor(
		controllersOrController: (readonly Controller[] | Controller),
		...otherControllers: readonly Controller[]
	) {
		super();

		if(controllersOrController instanceof Array) {
			// cloning array
			this.controllers = [...controllersOrController];
			return;
		}

		this.controllers = [controllersOrController, ...otherControllers];
	}

	leftActive(): boolean {
		return this.controllers.some((controller: Controller) => controller.leftActive());
	}

	rightActive(): boolean {
		return this.controllers.some((controller: Controller) => controller.rightActive());
	}

	jumpActive(): boolean {
		return this.controllers.some((controller: Controller) => controller.jumpActive());
	}
}