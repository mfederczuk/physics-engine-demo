/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Entity {
	         name:                string;
	readonly boundingBox:         Box2D;
	         mass:                number; // TODO: mass is currently unused, but will be used for better friction,
	                                      //       terminal velocity and maybe impact force and others?
	         manualMovementSpeed: number;
	         jumpSpeed:           number;
	         noclipFlySpeed:      number;

	controller: Controller;

	readonly velocity: Vector2D                 = new Vector2D();
	readonly forces:   ForceCollection          = new ForceCollection();
	readonly #noclip:  ObservableValue<boolean> = new ObservableValue(false);

	constructor(
		name: string,
		boundingBox: Box2D,
		mass: number,
		manualMovementSpeed: number,
		jumpSpeed: number,
		noclipFlySpeed: number,

		controller: Controller = new DummyController(),
	) {
		this.name                = name;
		this.boundingBox         = boundingBox;
		this.mass                = mass;
		this.manualMovementSpeed = manualMovementSpeed;
		this.jumpSpeed           = jumpSpeed;
		this.noclipFlySpeed      = noclipFlySpeed;

		this.controller = controller;
	}

	get noclip(): boolean {
		return this.#noclip.get();
	}

	set noclip(value: boolean){
		this.#noclip.set(value);
	}

	toggleNoclip() {
		this.noclip = !(this.noclip);
	}

	addNoclipChangeListener(...args: [options: AddListenerOptions, listener: Listener<boolean>]) {
		this.#noclip.addListener(...args);
	}

	removeNoclipChangeListener(listener: Listener<boolean>) {
		this.#noclip.removeListener(listener);
	}
}


type EntityId = number;

interface EntityWithId {
	id: EntityId;
	entity: Entity;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EntityCollection {

	#entityMap: Map<EntityId, Entity> = new Map();
	#nextId: EntityId = 0;

	add(entity: Entity): (number | never) {
		if(this.contains(entity)) {
			throw new Error("Refusing to add the same entity twice");
		}

		const id: number = this.#nextId;

		this.#entityMap.set(id, entity);

		++this.#nextId;

		return id;
	}

	contains(entity: Entity): boolean {
		return this.lookupIdOptional(entity).isPresent();
	}

	//#region remove*

	removeById(id: EntityId) {
		this.#entityMap.delete(id);
	}

	remove(entity: Entity) {
		const id: Optional<EntityId> = this.lookupIdOptional(entity);

		id.ifPresent(this.removeById.bind(this));
	}

	//#endregion

	//#region lookupId*

	lookupIdOptional(entity: Entity): Optional<EntityId> {
		return this.sequence()
			.filter((entityWithId: EntityWithId) => (entityWithId.entity === entity))
			.map(({ id }: EntityWithId) => (id))
			.waitForSingleOptional();
	}

	lookupId(entity: Entity): (EntityId | never) {
		return this.lookupIdOptional(entity)
			.getOrThrow(() => new Error(`No such entity ${entity}`));
	}

	lookupIdOrDefault<T extends NotNullable>(entity: Entity, defaultValue: T): (EntityId | T) {
		return this.lookupIdOptional(entity)
			.getOrDefault(defaultValue);
	}

	lookupIdOrElse<T extends NotNullable>(entity: Entity, defaultValueSupplier: () => T): (EntityId | T) {
		return this.lookupIdOptional(entity)
			.getOrElse(defaultValueSupplier);
	}

	//#endregion

	//#region getById*

	getByIdOptional(id: EntityId): Optional<Entity> {
		return Optional.ofNullable(this.#entityMap.get(id));
	}

	getById(id: EntityId): (Entity | never) {
		return this.getByIdOptional(id)
			.getOrThrow(() => new Error(`No such entity with ID ${id}`));
	}

	getByIdOrDefault<T extends NotNullable>(id: EntityId, defaultValue: T): (Entity | T) {
		return this.getByIdOptional(id)
			.getOrDefault(defaultValue);
	}

	getByIdOrElse<T extends NotNullable>(id: EntityId, defaultValueSupplier: () => T): (Entity | T) {
		return this.getByIdOptional(id)
			.getOrElse(defaultValueSupplier);
	}

	//#endregion

	//#region findFirstByName*

	findFirstByNameOptional(name: string): Optional<EntityWithId> {
		return this.sequence()
			.filter(({ entity }: EntityWithId) => (entity.name === name))
			.waitForFirstOptional();
	}

	findFirstByName(name: string): (EntityWithId | never) {
		return this.findFirstByNameOptional(name)
			.getOrThrow(() => new Error(`No such entity with name ${name.quote()}`));
	}

	findFirstByNameOrDefault<T extends NotNullable>(name: string, defaultValue: T): (EntityWithId | T) {
		return this.findFirstByNameOptional(name)
			.getOrDefault(defaultValue);
	}

	findFirstByNameOrElse<T extends NotNullable>(name: string, defaultValueSupplier: () => T): (EntityWithId | T) {
		return this.findFirstByNameOptional(name)
			.getOrElse(defaultValueSupplier);
	}

	//#endregion

	sequence(): Sequence<EntityWithId> {
		return Sequence.fromIterable(this.#entityMap.entries())
			.map(([id, entity]: [EntityId, Entity]) => ({ id, entity }));
	}
}
