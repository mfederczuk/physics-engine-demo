"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _WebKeyboardController_LEFT_KEY, _WebKeyboardController_RIGHT_KEY, _WebKeyboardController_JUMP_KEY, _WebKeyboardController_left, _WebKeyboardController_right, _WebKeyboardController_jump, _b, _RandomController_LEFT_CHANCE, _RandomController_RIGHT_CHANCE, _RandomController_JUMP_CHANCE;
/**
 * As the name suggests, a `Controller` object is used to control an entity's movement and action.
 *
 * The way that this works is that the game loop queries if "buttons" are active by using the `*Active` methods.
 */
class Controller {
}
/**
 * A `Controller` implementation that doesn't do anything; all `*Active` methods will always return `false`.
 *
 * It is used as default value, when no other controller is given to avoid having the controller field in `Entity`s be
 * nullable.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DummyController extends Controller {
    leftActive() { return false; }
    rightActive() { return false; }
    jumpActive() { return false; }
}
/**
 * A `Controller` implementation that uses `Window.onkeyup` and `Window.onkeydown` events to let browser users control
 * an entity.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WebKeyboardController extends Controller {
    constructor(window) {
        super();
        _WebKeyboardController_left.set(this, false);
        _WebKeyboardController_right.set(this, false);
        _WebKeyboardController_jump.set(this, false);
        // TODO: these switch-cases are pretty much the exact same -- replace with a `keyMap` or something?
        window.onkeydown = (event) => {
            if (event.repeat) {
                return;
            }
            switch (event.key) {
                case (__classPrivateFieldGet(WebKeyboardController, _a, "f", _WebKeyboardController_LEFT_KEY)): {
                    __classPrivateFieldSet(this, _WebKeyboardController_left, true, "f");
                    break;
                }
                case (__classPrivateFieldGet(WebKeyboardController, _a, "f", _WebKeyboardController_RIGHT_KEY)): {
                    __classPrivateFieldSet(this, _WebKeyboardController_right, true, "f");
                    break;
                }
                case (__classPrivateFieldGet(WebKeyboardController, _a, "f", _WebKeyboardController_JUMP_KEY)): {
                    __classPrivateFieldSet(this, _WebKeyboardController_jump, true, "f");
                    break;
                }
            }
        };
        window.onkeyup = (event) => {
            switch (event.key) {
                case (__classPrivateFieldGet(WebKeyboardController, _a, "f", _WebKeyboardController_LEFT_KEY)): {
                    __classPrivateFieldSet(this, _WebKeyboardController_left, false, "f");
                    break;
                }
                case (__classPrivateFieldGet(WebKeyboardController, _a, "f", _WebKeyboardController_RIGHT_KEY)): {
                    __classPrivateFieldSet(this, _WebKeyboardController_right, false, "f");
                    break;
                }
                case (__classPrivateFieldGet(WebKeyboardController, _a, "f", _WebKeyboardController_JUMP_KEY)): {
                    __classPrivateFieldSet(this, _WebKeyboardController_jump, false, "f");
                    break;
                }
            }
        };
    }
    leftActive() {
        return __classPrivateFieldGet(this, _WebKeyboardController_left, "f");
    }
    rightActive() {
        return __classPrivateFieldGet(this, _WebKeyboardController_right, "f");
    }
    jumpActive() {
        const jump = __classPrivateFieldGet(this, _WebKeyboardController_jump, "f");
        __classPrivateFieldSet(this, _WebKeyboardController_jump, false, "f");
        return jump;
    }
}
_a = WebKeyboardController, _WebKeyboardController_left = new WeakMap(), _WebKeyboardController_right = new WeakMap(), _WebKeyboardController_jump = new WeakMap();
_WebKeyboardController_LEFT_KEY = { value: "a" };
_WebKeyboardController_RIGHT_KEY = { value: "d" };
_WebKeyboardController_JUMP_KEY = { value: " " };
/**
 * A `Controller` implementation that "presses" "buttons" at random. It simulates a cat walking across a keyboard.
 *
 * Can be used as a sort of demonstration.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RandomController extends Controller {
    leftActive() { return (Math.random() < __classPrivateFieldGet(RandomController, _b, "f", _RandomController_LEFT_CHANCE)); }
    rightActive() { return (Math.random() < __classPrivateFieldGet(RandomController, _b, "f", _RandomController_RIGHT_CHANCE)); }
    jumpActive() { return (Math.random() < __classPrivateFieldGet(RandomController, _b, "f", _RandomController_JUMP_CHANCE)); }
}
_b = RandomController;
_RandomController_LEFT_CHANCE = { value: 0.4 };
_RandomController_RIGHT_CHANCE = { value: 0.4 };
_RandomController_JUMP_CHANCE = { value: 0.025 };
/**
 * A `Controller` implementation that merges multiple other `Controller`s together.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MergedController extends Controller {
    constructor(controllersOrController, ...otherControllers) {
        super();
        if (controllersOrController instanceof Array) {
            // cloning array
            this.controllers = [...controllersOrController];
            return;
        }
        this.controllers = [controllersOrController, ...otherControllers];
    }
    leftActive() {
        return this.controllers.some((controller) => controller.leftActive());
    }
    rightActive() {
        return this.controllers.some((controller) => controller.rightActive());
    }
    jumpActive() {
        return this.controllers.some((controller) => controller.jumpActive());
    }
}
