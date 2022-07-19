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

	readonly velocity: Vector2D        = new Vector2D();
	readonly forces:   ForceCollection = new ForceCollection();
	         noclip:   boolean         = false; // dunno why i added this, seemed like fun lol

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
		return (this.lookupIdOrNull(entity) !== null);
	}

	//#region remove*

	removeById(id: EntityId) {
		this.#entityMap.delete(id);
	}

	remove(entity: Entity) {
		const id: (EntityId | null) = this.lookupIdOrNull(entity);

		if(typeof(id) !== "number") {
			return;
		}

		this.removeById(id);
	}

	//#endregion

	//#region lookupId*

	lookupIdOrElse<T>(entity: Entity, defaultValueSupplier: () => T): (EntityId | T) {
		return this.sequence()
			.filter((entityWithId: EntityWithId) => (entityWithId.entity === entity))
			.map(({ id }: EntityWithId) => (id))
			.waitForSingleOrElse(defaultValueSupplier);
	}

	lookupIdOrDefault<T>(entity: Entity, defaultValue: T): (EntityId | T) {
		return this.lookupIdOrElse(entity,  () => (defaultValue));
	}

	lookupId(entity: Entity): (EntityId | never) {
		return this.lookupIdOrElse(
			entity,
			() => { throw new Error(`No such entity ${entity}`); },
		);
	}

	lookupIdOrNull(entity: Entity): (EntityId | null) {
		return this.lookupIdOrDefault(entity, null);
	}

	lookupIdOrUndefined(entity: Entity): (EntityId | undefined) {
		return this.lookupIdOrDefault(entity, undefined);
	}

	//#endregion

	//#region getById*

	getByIdOrElse<T>(id: EntityId, defaultValueSupplier: () => T): (Entity | T) {
		const entity: (Entity | undefined) = this.#entityMap.get(id);

		if(entity instanceof Entity) {
			return entity;
		}

		return defaultValueSupplier();
	}

	getByIdOrDefault<T>(id: EntityId, defaultValue: T): (Entity | T) {
		return this.getByIdOrElse(id, () => (defaultValue));
	}

	getById(id: EntityId): (Entity | never) {
		return this.getByIdOrElse(
			id,
			() => { throw new Error(`No such entity with ID ${id}`); },
		);
	}

	getByIdOrNull(id: EntityId): (Entity | null) {
		return this.getByIdOrDefault(id, null);
	}

	getByIdOrUndefined(id: EntityId): (Entity | undefined) {
		return this.getByIdOrDefault(id, undefined);
	}

	//#endregion

	//#region findFirstByName*

	findFirstByNameOrElse<T>(name: string, defaultValueSupplier: () => T): (EntityWithId | T) {
		return this.sequence()
			.filter(({ entity }: EntityWithId) => (entity.name === name))
			.waitForFirstOrElse(defaultValueSupplier);
	}

	findFirstByNameOrDefault<T>(name: string, defaultValue: T): (EntityWithId | T) {
		return this.findFirstByNameOrElse(name, () => (defaultValue));
	}

	findFirstByName(name: string): (EntityWithId | never) {
		return this.findFirstByNameOrElse(
			name,
			() => { throw new Error(`No such entity with name "${name}"`); }
		);
	}

	findFirstByNameOrNull(name: string): (EntityWithId | null) {
		return this.findFirstByNameOrDefault(name, null);
	}

	findFirstByNameOrUndefined(name: string): (EntityWithId | undefined) {
		return this.findFirstByNameOrDefault(name, undefined);
	}

	//#endregion

	sequence(): Sequence<EntityWithId> {
		return Sequence.fromIterable(this.#entityMap.entries())
			.map(([id, entity]: [EntityId, Entity]) => ({ id, entity }));
	}
}
