/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

class State {
	static readonly INITIAL_SUBJECT_NAME = "Subject";
	static readonly INITIAL_SUBJECT_SIZE = 75;
	static readonly INITIAL_SUBJECT_MASS = 50;

	// TODO: move these into a separate `StateConfig` object?
	readonly gravity: Vector2D = new Vector2D(0, 0.5);
	defaultEntityManualMovementSpeed: number = 1;
	frictionRate: number = 0.1; // TODO: this should be useless once correctly calculating friction with mass and gravity?
	defaultEntityJumpSpeed: number = 15;
	defaultEntityNoclipFlySpeed: number = 12;

	readonly bounds: Box2D = new Box2D(0, 0, 0, 0);
	readonly entities: EntityCollection = new EntityCollection();
	readonly subject: Entity;

	constructor(initialSubjectInputSource?: InputSource) {
		this.subject = this
			.addNewEntity(
				State.INITIAL_SUBJECT_NAME,
				new Box2D(0, 0, State.INITIAL_SUBJECT_SIZE),
				State.INITIAL_SUBJECT_MASS,
				undefined,
				undefined,
				undefined,

				initialSubjectInputSource,
			)
			.entity;
	}

	/**
	 * Instantiates and returns a new entity.
	 *
	 * Note: This method does *not* add the new entity to the entity collection! If you want that to happen, use
	 * `addNewEntity`.
	 */
	newEntity(
		name: string,
		boundingBox: Box2D,
		mass: number,
		manualMovementSpeed: number = this.defaultEntityManualMovementSpeed,
		jumpSpeed: number = this.defaultEntityJumpSpeed,
		noclipFlySpeed: number = this.defaultEntityNoclipFlySpeed,

		inputSource?: InputSource,
	): Entity {
		return new Entity(
			name,
			boundingBox,
			mass,
			manualMovementSpeed,
			jumpSpeed,
			noclipFlySpeed,

			inputSource,
		);
	}

	addNewEntity(
		name: string,
		boundingBox: Box2D,
		mass: number,
		manualMovementSpeed?: number,
		jumpSpeed?: number,
		noclipFlySpeed?: number,

		inputSource?: InputSource,
	): EntityWithId {
		const entity: Entity = this
			.newEntity(
				name,
				boundingBox,
				mass,
				manualMovementSpeed,
				jumpSpeed,
				noclipFlySpeed,

				inputSource,
			);

		const id: number = this.entities.add(entity);

		return { id, entity };
	}

	isEntityGrounded(entity: Entity): boolean {
		const entityNetForce: Vector2D = entity.forces.computeNetForce();

		const testBox: Box2D = entity.boundingBox.copy();
		testBox.x += entityNetForce.xd;
		testBox.y += entityNetForce.yd;

		return ((testBox.x             < this.bounds.x) ||
		        (testBox.y             < this.bounds.y) ||
		        (testBox.computeXEnd() > this.bounds.computeXEnd()) ||
		        (testBox.computeYEnd() > this.bounds.computeYEnd()));
	}
}

function updateEntity(state: State, entity: Entity) {
	if(entity.noclip) {
		let noclipXd = 0;
		let noclipYd = 0;

		if(entity.inputManager.queryIfActive(InputActionType.UP)) {
			noclipYd -= entity.noclipFlySpeed;
		}

		if(entity.inputManager.queryIfActive(InputActionType.DOWN)) {
			noclipYd += entity.noclipFlySpeed;
		}

		if(entity.inputManager.queryIfActive(InputActionType.LEFT)) {
			noclipXd -= entity.noclipFlySpeed;
		}

		if(entity.inputManager.queryIfActive(InputActionType.RIGHT)) {
			noclipXd += entity.noclipFlySpeed;
		}

		entity.forces.markAllAsRemoved();
		entity.velocity.setZero();

		entity.boundingBox.position.x += noclipXd;
		entity.boundingBox.position.y += noclipYd;

		return;
	}


	entity.forces.put(ForceType.GRAVITY, state.gravity);

	entity.forces.markAsRemoved(ForceType.FRICTION, ForceType.LEFT, ForceType.RIGHT, ForceType.JUMP);

	// manual movement (left, right & jump) is only possible when grounded
	// TODO: air (double, triple, ...) jumps?
	if(state.isEntityGrounded(entity)) {
		const entityNetForceDirection: number = entity.forces
			.computeNetForce()
			.computeDirection();

		if(entity.inputManager.queryIfActive(InputActionType.LEFT)) {
			const leftForce: Vector2D =
				Vector2D.ofMagnitudeAndDirection(
					entity.manualMovementSpeed,
					entityNetForceDirection - 90
				);

			entity.forces.put(ForceType.LEFT, leftForce);
		}

		if(entity.inputManager.queryIfActive(InputActionType.RIGHT)) {
			const rightForce: Vector2D =
				Vector2D.ofMagnitudeAndDirection(
					entity.manualMovementSpeed,
					entityNetForceDirection + 90
				);

			entity.forces.put(ForceType.RIGHT, rightForce);
		}

		if(entity.inputManager.queryIfActive(InputActionType.JUMP)) {
			entity.inputManager.reset(InputActionType.JUMP);

			const jumpForce: Vector2D =
				Vector2D.ofMagnitudeAndDirection(
					entity.jumpSpeed,
					entityNetForceDirection + 180
				);

			entity.forces.put(ForceType.JUMP, jumpForce);
		}
	}


	// TODO: add air resistance (proper name is "drag")
	//       good idea to add a `fluids: Fluid[]` (or something like this) attribute to the state? every fluid would
	//       have it's own resistance this way would be easy to add water and such

	// TODO: add terminal velocity

	// ground friction
	// TODO: friction on walls and ceilings?
	if(state.isEntityGrounded(entity)) {
		const frictionForce = entity.velocity.reversed();
		frictionForce.multiply(state.frictionRate);
		entity.forces.put(ForceType.FRICTION, frictionForce);
	}


	// updating velocity
	const netForce: Readonly<Vector2D> = entity.forces.computeNetForce();
	entity.velocity.add(netForce);

	// updating position
	entity.boundingBox.x += entity.velocity.xd;
	entity.boundingBox.y += entity.velocity.yd;


	// keeping position in bounds & stopping velocity when hitting bounds
	if(entity.boundingBox.x < state.bounds.x) {
		entity.boundingBox.x = state.bounds.x;
		entity.velocity.xd = 0;
	} else if((entity.boundingBox.x + entity.boundingBox.width) > state.bounds.width) {
		entity.boundingBox.x = (state.bounds.width - entity.boundingBox.width);
		entity.velocity.xd = 0;
	}

	if(entity.boundingBox.y < state.bounds.y) {
		entity.boundingBox.y = state.bounds.y;
		entity.velocity.yd = 0;
	} else if((entity.boundingBox.y + entity.boundingBox.height) > state.bounds.height) {
		entity.boundingBox.y = (state.bounds.height - entity.boundingBox.height);
		entity.velocity.yd = 0;
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateState(state: State) {
	state.entities.sequence()
		.waitForEach(({ entity }: EntityWithId) => {
			updateEntity(state, entity);
		});
}
