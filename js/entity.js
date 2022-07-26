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
class Entity {
    constructor(args) {
        var _a;
        this.velocity = new Vector2D();
        this.forces = new ForceCollection();
        _Entity_noclip.set(this, new ObservableValue(false));
        this.name = args.name;
        this.boundingBox = args.boundingBox;
        this.mass = args.mass;
        this.manualMovementSpeed = args.manualMovementSpeed;
        this.jumpSpeed = args.jumpSpeed;
        this.noclipFlySpeed = args.noclipFlySpeed;
        this.inputManager = new InputManager((_a = args.inputSource) !== null && _a !== void 0 ? _a : new DummyInputSource());
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
    noclipObservable() {
        return __classPrivateFieldGet(this, _Entity_noclip, "f").hide();
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
        return this.lookupIdOptional(entity).isPresent();
    }
    //#region remove*
    removeById(id) {
        __classPrivateFieldGet(this, _EntityCollection_entityMap, "f").delete(id);
    }
    remove(entity) {
        const id = this.lookupIdOptional(entity);
        id.ifPresent(this.removeById.bind(this));
    }
    //#endregion
    //#region lookupId*
    lookupIdOptional(entity) {
        return this.sequence()
            .filter((entityWithId) => (entityWithId.entity === entity))
            .map(({ id }) => (id))
            .waitForSingleOptional();
    }
    lookupId(entity) {
        return this.lookupIdOptional(entity)
            .getOrThrow(() => new Error(`No such entity ${entity}`));
    }
    lookupIdOrDefault(entity, defaultValue) {
        return this.lookupIdOptional(entity)
            .getOrDefault(defaultValue);
    }
    lookupIdOrElse(entity, defaultValueSupplier) {
        return this.lookupIdOptional(entity)
            .getOrElse(defaultValueSupplier);
    }
    //#endregion
    //#region getById*
    getByIdOptional(id) {
        return Optional.ofNullable(__classPrivateFieldGet(this, _EntityCollection_entityMap, "f").get(id));
    }
    getById(id) {
        return this.getByIdOptional(id)
            .getOrThrow(() => new Error(`No such entity with ID ${id}`));
    }
    getByIdOrDefault(id, defaultValue) {
        return this.getByIdOptional(id)
            .getOrDefault(defaultValue);
    }
    getByIdOrElse(id, defaultValueSupplier) {
        return this.getByIdOptional(id)
            .getOrElse(defaultValueSupplier);
    }
    //#endregion
    //#region findFirstByName*
    findFirstByNameOptional(name) {
        return this.sequence()
            .filter(({ entity }) => (entity.name === name))
            .waitForFirstOptional();
    }
    findFirstByName(name) {
        return this.findFirstByNameOptional(name)
            .getOrThrow(() => new Error(`No such entity with name ${name.quote()}`));
    }
    findFirstByNameOrDefault(name, defaultValue) {
        return this.findFirstByNameOptional(name)
            .getOrDefault(defaultValue);
    }
    findFirstByNameOrElse(name, defaultValueSupplier) {
        return this.findFirstByNameOptional(name)
            .getOrElse(defaultValueSupplier);
    }
    //#endregion
    sequence() {
        return Sequence.fromIterable(__classPrivateFieldGet(this, _EntityCollection_entityMap, "f").entries())
            .map(([id, entity]) => ({ id, entity }));
    }
}
_EntityCollection_entityMap = new WeakMap(), _EntityCollection_nextId = new WeakMap();
