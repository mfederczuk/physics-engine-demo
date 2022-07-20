"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
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
var _Entity_noclip, _EntityCollection_entityMap, _EntityCollection_nextId;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Entity {
    constructor(name, boundingBox, mass, manualMovementSpeed, jumpSpeed, noclipFlySpeed, controller = new DummyController()) {
        this.velocity = new Vector2D();
        this.forces = new ForceCollection();
        _Entity_noclip.set(this, new ObservableValue(false));
        this.name = name;
        this.boundingBox = boundingBox;
        this.mass = mass;
        this.manualMovementSpeed = manualMovementSpeed;
        this.jumpSpeed = jumpSpeed;
        this.noclipFlySpeed = noclipFlySpeed;
        this.controller = controller;
    }
    get noclip() {
        return __classPrivateFieldGet(this, _Entity_noclip, "f").get();
    }
    set noclip(value) {
        __classPrivateFieldGet(this, _Entity_noclip, "f").set(value);
    }
    toggleNoclip() {
        this.noclip = !(this.noclip);
    }
    addNoclipChangeListener(...args) {
        __classPrivateFieldGet(this, _Entity_noclip, "f").addListener(...args);
    }
    removeNoclipChangeListener(listener) {
        __classPrivateFieldGet(this, _Entity_noclip, "f").removeListener(listener);
    }
}
_Entity_noclip = new WeakMap();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EntityCollection {
    constructor() {
        _EntityCollection_entityMap.set(this, new Map());
        _EntityCollection_nextId.set(this, 0);
    }
    add(entity) {
        var _a;
        if (this.contains(entity)) {
            throw new Error("Refusing to add the same entity twice");
        }
        const id = __classPrivateFieldGet(this, _EntityCollection_nextId, "f");
        __classPrivateFieldGet(this, _EntityCollection_entityMap, "f").set(id, entity);
        __classPrivateFieldSet(this, _EntityCollection_nextId, (_a = __classPrivateFieldGet(this, _EntityCollection_nextId, "f"), ++_a), "f");
        return id;
    }
    contains(entity) {
        return (this.lookupIdOrNull(entity) !== null);
    }
    //#region remove*
    removeById(id) {
        __classPrivateFieldGet(this, _EntityCollection_entityMap, "f").delete(id);
    }
    remove(entity) {
        const id = this.lookupIdOrNull(entity);
        if (typeof (id) !== "number") {
            return;
        }
        this.removeById(id);
    }
    //#endregion
    //#region lookupId*
    lookupIdOrElse(entity, defaultValueSupplier) {
        return this.sequence()
            .filter((entityWithId) => (entityWithId.entity === entity))
            .map(({ id }) => (id))
            .waitForSingleOrElse(defaultValueSupplier);
    }
    lookupIdOrDefault(entity, defaultValue) {
        return this.lookupIdOrElse(entity, () => (defaultValue));
    }
    lookupId(entity) {
        return this.lookupIdOrElse(entity, () => { throw new Error(`No such entity ${entity}`); });
    }
    lookupIdOrNull(entity) {
        return this.lookupIdOrDefault(entity, null);
    }
    lookupIdOrUndefined(entity) {
        return this.lookupIdOrDefault(entity, undefined);
    }
    //#endregion
    //#region getById*
    getByIdOrElse(id, defaultValueSupplier) {
        const entity = __classPrivateFieldGet(this, _EntityCollection_entityMap, "f").get(id);
        if (entity instanceof Entity) {
            return entity;
        }
        return defaultValueSupplier();
    }
    getByIdOrDefault(id, defaultValue) {
        return this.getByIdOrElse(id, () => (defaultValue));
    }
    getById(id) {
        return this.getByIdOrElse(id, () => { throw new Error(`No such entity with ID ${id}`); });
    }
    getByIdOrNull(id) {
        return this.getByIdOrDefault(id, null);
    }
    getByIdOrUndefined(id) {
        return this.getByIdOrDefault(id, undefined);
    }
    //#endregion
    //#region findFirstByName*
    findFirstByNameOrElse(name, defaultValueSupplier) {
        return this.sequence()
            .filter(({ entity }) => (entity.name === name))
            .waitForFirstOrElse(defaultValueSupplier);
    }
    findFirstByNameOrDefault(name, defaultValue) {
        return this.findFirstByNameOrElse(name, () => (defaultValue));
    }
    findFirstByName(name) {
        return this.findFirstByNameOrElse(name, () => { throw new Error(`No such entity with name "${name}"`); });
    }
    findFirstByNameOrNull(name) {
        return this.findFirstByNameOrDefault(name, null);
    }
    findFirstByNameOrUndefined(name) {
        return this.findFirstByNameOrDefault(name, undefined);
    }
    //#endregion
    sequence() {
        return Sequence.fromIterable(__classPrivateFieldGet(this, _EntityCollection_entityMap, "f").entries())
            .map(([id, entity]) => ({ id, entity }));
    }
}
_EntityCollection_entityMap = new WeakMap(), _EntityCollection_nextId = new WeakMap();
