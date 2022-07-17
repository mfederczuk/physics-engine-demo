"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ForceCollection_instances, _ForceCollection_forceMap, _ForceCollection_blocks, _ForceCollection_markOneAsRemoved;
var ForceType;
(function (ForceType) {
    ForceType["GRAVITY"] = "gravity";
    ForceType["FRICTION"] = "friction";
    ForceType["LEFT"] = "left";
    ForceType["RIGHT"] = "right";
    ForceType["JUMP"] = "jump";
    ForceType["DEBUG"] = "[debug]";
})(ForceType || (ForceType = {}));
var ForceBlockReason;
(function (ForceBlockReason) {
    ForceBlockReason["NOCLIP"] = "noclip";
    ForceBlockReason["DEBUG"] = "[debug]";
})(ForceBlockReason || (ForceBlockReason = {}));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ForceCollection {
    constructor() {
        _ForceCollection_instances.add(this);
        _ForceCollection_forceMap.set(this, new Map());
        _ForceCollection_blocks.set(this, new Map());
        //#endregion
    }
    //#region putting
    put(type, force) {
        __classPrivateFieldGet(this, _ForceCollection_forceMap, "f").set(type, { force, markedAsRemoved: false });
    }
    //#endregion
    //#region marking as removed
    markAsRemoved(type, ...otherTypes) {
        __classPrivateFieldGet(this, _ForceCollection_instances, "m", _ForceCollection_markOneAsRemoved).call(this, type);
        otherTypes.forEach(__classPrivateFieldGet(this, _ForceCollection_instances, "m", _ForceCollection_markOneAsRemoved).bind(this));
    }
    markAllAsRemoved() {
        __classPrivateFieldGet(this, _ForceCollection_forceMap, "f").forEach((obj) => {
            obj.markedAsRemoved = true;
        });
    }
    //#endregion
    //#region blocking
    block(type, reason) {
        const types = __classPrivateFieldGet(this, _ForceCollection_blocks, "f").get(reason);
        if (types instanceof Set) {
            types.add(type);
            return;
        }
        __classPrivateFieldGet(this, _ForceCollection_blocks, "f").set(reason, new Set([type]));
    }
    unblock(type, reason) {
        var _a;
        (_a = __classPrivateFieldGet(this, _ForceCollection_blocks, "f").get(reason)) === null || _a === void 0 ? void 0 : _a.delete(type);
    }
    unblockAll(reason) {
        var _a;
        (_a = __classPrivateFieldGet(this, _ForceCollection_blocks, "f").get(reason)) === null || _a === void 0 ? void 0 : _a.clear();
    }
    setBlocked(blocked, type, reason) {
        if (blocked) {
            this.block(type, reason);
        }
        else {
            this.unblock(type, reason);
        }
    }
    //#endregion
    //#region queries
    getOrElse(type, defaultValueSupplier) {
        const obj = __classPrivateFieldGet(this, _ForceCollection_forceMap, "f").get(type);
        if ((typeof (obj) !== "object") || obj.markedAsRemoved) {
            return defaultValueSupplier(type);
        }
        for (const blockedTypes of __classPrivateFieldGet(this, _ForceCollection_blocks, "f").values()) {
            if (blockedTypes.has(type)) {
                return defaultValueSupplier(type);
            }
        }
        return obj.force;
    }
    get(type) {
        return this
            .getOrElse(type, () => { throw Error(`No such force with type: ${type}`); });
    }
    getOrDefault(type, defaultValue) {
        return this.getOrElse(type, () => (defaultValue));
    }
    getOrNull(type) {
        return this.getOrDefault(type, null);
    }
    getOrUndefined(type) {
        return this.getOrDefault(type, undefined);
    }
    contains(type) {
        return (this.getOrNull(type) !== null);
    }
    //#endregion
    //#region iteration
    forcesSequence() {
        const allBlockedTypes = new Set();
        for (const blockedTypes of __classPrivateFieldGet(this, _ForceCollection_blocks, "f").values()) {
            for (const blockedType of blockedTypes) {
                allBlockedTypes.add(blockedType);
            }
        }
        return Sequence
            .fromIterable(__classPrivateFieldGet(this, _ForceCollection_forceMap, "f").entries())
            .map(([type, { force, markedAsRemoved }]) => {
            return {
                type,
                force: force.copy(),
                markedAsRemoved,
                blocked: allBlockedTypes.has(type),
            };
        });
    }
    //#endregion
    //#region other
    computeNetForce() {
        const allBlockedTypes = new Set();
        for (const blockedTypes of __classPrivateFieldGet(this, _ForceCollection_blocks, "f").values()) {
            for (const blockedType of blockedTypes) {
                allBlockedTypes.add(blockedType);
            }
        }
        const forces = Sequence.fromIterable(__classPrivateFieldGet(this, _ForceCollection_forceMap, "f").entries())
            .filter(([type, { markedAsRemoved }]) => (!markedAsRemoved && !(allBlockedTypes.has(type))))
            .map(([, { force }]) => (force));
        return Vector2D.sum(forces);
    }
}
_ForceCollection_forceMap = new WeakMap(), _ForceCollection_blocks = new WeakMap(), _ForceCollection_instances = new WeakSet(), _ForceCollection_markOneAsRemoved = function _ForceCollection_markOneAsRemoved(type) {
    const obj = __classPrivateFieldGet(this, _ForceCollection_forceMap, "f").get(type);
    if (typeof (obj) !== "object") {
        return;
    }
    obj.markedAsRemoved = true;
};
