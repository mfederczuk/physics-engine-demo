"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ForceCollection_instances, _ForceCollection_map, _ForceCollection_enableOne, _ForceCollection_disableOne;
var ForceType;
(function (ForceType) {
    ForceType["GRAVITY"] = "gravity";
    ForceType["LEFT"] = "left";
    ForceType["RIGHT"] = "right";
    ForceType["JUMP"] = "jump";
    ForceType["DEBUG"] = "[debug]";
})(ForceType || (ForceType = {}));
class ForceCollection {
    constructor() {
        // TODO: add blocking of forces?
        //       e.g.: instead of the gravity checks in `updateEntity` explicitly check for noclip, before that, we could
        //       check for noclip and then add a block for gravity:
        //
        //           if(entity.noclip) {
        //               entity.forces.block(ForceType.GRAVITY, /* reason/key = */ "noclip")
        //           } else {
        //               // `computeNetForce` won't consider blocked forces
        //               entity.forces.unblock(ForceType.GRAVITY, /* reason/key = */ "noclip")
        //           }
        //
        //           entity.forces.put(ForceType.GRAVITY, state.gravity)
        //
        //       multiple blocks can be active at once, and all blocks have a key so that the don't accidentally unblock
        //       one another
        //
        //       i dunno if there would be a lot of use cases for this, the only one i can think of right now is noclip,
        //       though this keeps the door open for customization/expandability
        _ForceCollection_instances.add(this);
        _ForceCollection_map.set(this, new Map());
        //#endregion
    }
    //#region putting & enabling
    put(type, force) {
        __classPrivateFieldGet(this, _ForceCollection_map, "f").set(type, [true, force]);
    }
    enable(type, ...otherTypes) {
        __classPrivateFieldGet(this, _ForceCollection_instances, "m", _ForceCollection_enableOne).call(this, type);
        otherTypes.forEach(__classPrivateFieldGet(this, _ForceCollection_instances, "m", _ForceCollection_enableOne).bind(this));
    }
    enableAll() {
        __classPrivateFieldGet(this, _ForceCollection_map, "f").forEach(([enabled, force], type) => {
            if (!enabled) {
                this.put(type, force);
            }
        });
    }
    //#endregion
    //#region removing & disabling
    remove(type, ...otherTypes) {
        __classPrivateFieldGet(this, _ForceCollection_map, "f").delete(type);
        otherTypes.forEach(__classPrivateFieldGet(this, _ForceCollection_map, "f").delete.bind(__classPrivateFieldGet(this, _ForceCollection_map, "f")));
    }
    removeAll() {
        __classPrivateFieldGet(this, _ForceCollection_map, "f").clear();
    }
    disable(type, ...otherTypes) {
        __classPrivateFieldGet(this, _ForceCollection_instances, "m", _ForceCollection_disableOne).call(this, type);
        otherTypes.forEach(__classPrivateFieldGet(this, _ForceCollection_instances, "m", _ForceCollection_disableOne).bind(this));
    }
    disableAll() {
        __classPrivateFieldGet(this, _ForceCollection_map, "f").forEach(([enabled, force], type) => {
            if (enabled) {
                __classPrivateFieldGet(this, _ForceCollection_map, "f").set(type, [false, force]);
            }
        });
    }
    //#endregion
    //#region getting
    contains(type) {
        return __classPrivateFieldGet(this, _ForceCollection_map, "f").has(type);
    }
    getOrElse(type, defaultSupplier) {
        const tuple = __classPrivateFieldGet(this, _ForceCollection_map, "f").get(type);
        if (!(tuple instanceof Array)) {
            return defaultSupplier();
        }
        const [, force] = tuple;
        return force;
    }
    getOrDefault(type, defaultValue) {
        return this.getOrElse(type, () => (defaultValue));
    }
    get(type) {
        return this
            .getOrElse(type, () => { throw Error(`No such force with type: ${type}`); });
    }
    getOrNull(type) {
        return this.getOrDefault(type, null);
    }
    getOrUndefined(type) {
        return this.getOrDefault(type, undefined);
    }
    isEnabled(type) {
        const tuple = __classPrivateFieldGet(this, _ForceCollection_map, "f").get(type);
        if (!(tuple instanceof Array)) {
            return false;
        }
        const [enabled] = tuple;
        return enabled;
    }
    isDisabled(type) {
        const tuple = __classPrivateFieldGet(this, _ForceCollection_map, "f").get(type);
        if (!(tuple instanceof Array)) {
            return false;
        }
        const [enabled] = tuple;
        return !enabled;
    }
    //#endregion
    //#region other
    toggle(type) {
        const tuple = __classPrivateFieldGet(this, _ForceCollection_map, "f").get(type);
        if (!(tuple instanceof Array)) {
            return;
        }
        const [enabled, force] = tuple;
        __classPrivateFieldGet(this, _ForceCollection_map, "f").set(type, [!enabled, force]);
    }
    computeNetForce() {
        const forces = [...__classPrivateFieldGet(this, _ForceCollection_map, "f").values()]
            .filter(([enabled]) => enabled)
            .map(([, force]) => force);
        return Vector2D.sum(forces);
    }
    //#endregion
    //#region iterating
    forEach(callbackfn) {
        [...__classPrivateFieldGet(this, _ForceCollection_map, "f").entries()]
            .sort((a, b) => {
            const aEnabled = a[1][0];
            const bEnabled = b[1][0];
            if (aEnabled && !bEnabled)
                return -1;
            if (!aEnabled && bEnabled)
                return 1;
            return 0;
        })
            .forEach(([type, [enabled, force]]) => {
            callbackfn(force, enabled, type);
        });
    }
}
_ForceCollection_map = new WeakMap(), _ForceCollection_instances = new WeakSet(), _ForceCollection_enableOne = function _ForceCollection_enableOne(type) {
    const tuple = __classPrivateFieldGet(this, _ForceCollection_map, "f").get(type);
    if (!(tuple instanceof Array)) {
        return;
    }
    const [enabled, force] = tuple;
    if (enabled) {
        return;
    }
    this.put(type, force);
}, _ForceCollection_disableOne = function _ForceCollection_disableOne(type) {
    const tuple = __classPrivateFieldGet(this, _ForceCollection_map, "f").get(type);
    if (!(tuple instanceof Array)) {
        return;
    }
    const [enabled, force] = tuple;
    if (!enabled) {
        return;
    }
    __classPrivateFieldGet(this, _ForceCollection_map, "f").set(type, [false, force]);
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Entity {
    constructor(boundingBox, mass, manualMovementSpeed, jumpSpeed, controller = new DummyController()) {
        this.velocity = new Vector2D();
        this.forces = new ForceCollection();
        this.noclip = false; // dunno why i added this, seemed like fun lol
        this.boundingBox = boundingBox;
        this.mass = mass;
        this.manualMovementSpeed = manualMovementSpeed;
        this.jumpSpeed = jumpSpeed;
        this.controller = controller;
    }
}
