"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
class State {
    constructor(initialSubjectInputSource) {
        // TODO: move these into a separate `StateConfig` object?
        this.gravity = new Vector2D(0, 0.5);
        this.defaultEntityManualMovementSpeed = 1;
        this.frictionRate = 0.1; // TODO: this should be useless once correctly calculating friction with mass and gravity?
        this.defaultEntityJumpSpeed = 15;
        this.defaultEntityNoclipFlySpeed = 12;
        this.bounds = new Box2D(0, 0, 0, 0);
        this.entities = new EntityCollection();
        this.subject = this
            .addNewEntity({
            name: State.INITIAL_SUBJECT_NAME,
            boundingBox: new Box2D(0, 0, State.INITIAL_SUBJECT_SIZE),
            mass: State.INITIAL_SUBJECT_MASS,
            inputSource: initialSubjectInputSource,
        })
            .entity;
    }
    /**
     * Instantiates and returns a new entity.
     *
     * Note: This method does *not* add the new entity to the entity collection! If you want that to happen, use
     * `addNewEntity`.
     */
    newEntity(args) {
        var _a, _b, _c;
        return new Entity({
            name: args.name,
            boundingBox: args.boundingBox,
            mass: args.mass,
            manualMovementSpeed: ((_a = args.manualMovementSpeed) !== null && _a !== void 0 ? _a : this.defaultEntityManualMovementSpeed),
            jumpSpeed: ((_b = args.jumpSpeed) !== null && _b !== void 0 ? _b : this.defaultEntityJumpSpeed),
            noclipFlySpeed: ((_c = args.noclipFlySpeed) !== null && _c !== void 0 ? _c : this.defaultEntityNoclipFlySpeed),
            inputSource: args.inputSource,
        });
    }
    addNewEntity(args) {
        const entity = this.newEntity(args);
        const id = this.entities.add(entity);
        return { id, entity };
    }
    isEntityGrounded(entity) {
        const entityNetForce = entity.forces.computeNetForce();
        const testBox = entity.boundingBox.copy();
        testBox.x += entityNetForce.xd;
        testBox.y += entityNetForce.yd;
        return ((testBox.x < this.bounds.x) ||
            (testBox.y < this.bounds.y) ||
            (testBox.computeXEnd() > this.bounds.computeXEnd()) ||
            (testBox.computeYEnd() > this.bounds.computeYEnd()));
    }
}
State.INITIAL_SUBJECT_NAME = "Subject";
State.INITIAL_SUBJECT_SIZE = 75;
State.INITIAL_SUBJECT_MASS = 50;
function updateEntity(state, entity) {
    if (entity.noclip) {
        entity.forces.markAllAsRemoved();
        entity.velocity.setZero();
        if (entity.inputManager.queryIfActive(InputActionType.UP)) {
            entity.velocity.yd -= entity.noclipFlySpeed;
        }
        if (entity.inputManager.queryIfActive(InputActionType.DOWN)) {
            entity.velocity.yd += entity.noclipFlySpeed;
        }
        if (entity.inputManager.queryIfActive(InputActionType.LEFT)) {
            entity.velocity.xd -= entity.noclipFlySpeed;
        }
        if (entity.inputManager.queryIfActive(InputActionType.RIGHT)) {
            entity.velocity.xd += entity.noclipFlySpeed;
        }
        entity.boundingBox.position.x += entity.velocity.xd;
        entity.boundingBox.position.y += entity.velocity.yd;
        return;
    }
    entity.forces.put(ForceType.GRAVITY, state.gravity);
    entity.forces.markAsRemoved(ForceType.FRICTION, ForceType.LEFT, ForceType.RIGHT, ForceType.JUMP);
    // manual movement (left, right & jump) is only possible when grounded
    // TODO: air (double, triple, ...) jumps?
    if (state.isEntityGrounded(entity)) {
        const entityNetForceDirection = entity.forces
            .computeNetForce()
            .computeDirection();
        if (entity.inputManager.queryIfActive(InputActionType.LEFT)) {
            const leftForce = Vector2D.ofMagnitudeAndDirection(entity.manualMovementSpeed, entityNetForceDirection - 90);
            entity.forces.put(ForceType.LEFT, leftForce);
        }
        if (entity.inputManager.queryIfActive(InputActionType.RIGHT)) {
            const rightForce = Vector2D.ofMagnitudeAndDirection(entity.manualMovementSpeed, entityNetForceDirection + 90);
            entity.forces.put(ForceType.RIGHT, rightForce);
        }
        if (entity.inputManager.queryIfActive(InputActionType.JUMP)) {
            entity.inputManager.reset(InputActionType.JUMP);
            const jumpForce = Vector2D.ofMagnitudeAndDirection(entity.jumpSpeed, entityNetForceDirection + 180);
            entity.forces.put(ForceType.JUMP, jumpForce);
        }
    }
    // TODO: add air resistance (proper name is "drag")
    //       good idea to add a `fluids: Fluid[]` (or something like this) attribute to the state? every fluid would
    //       have it's own resistance this way would be easy to add water and such
    // TODO: add terminal velocity
    // ground friction
    // TODO: friction on walls and ceilings?
    if (state.isEntityGrounded(entity)) {
        const frictionForce = entity.velocity.reversed();
        frictionForce.multiply(state.frictionRate);
        entity.forces.put(ForceType.FRICTION, frictionForce);
    }
    // updating velocity
    const netForce = entity.forces.computeNetForce();
    entity.velocity.add(netForce);
    // updating position
    entity.boundingBox.x += entity.velocity.xd;
    entity.boundingBox.y += entity.velocity.yd;
    // keeping position in bounds & stopping velocity when hitting bounds
    if (entity.boundingBox.x < state.bounds.x) {
        entity.boundingBox.x = state.bounds.x;
        entity.velocity.xd = 0;
    }
    else if ((entity.boundingBox.x + entity.boundingBox.width) > state.bounds.width) {
        entity.boundingBox.x = (state.bounds.width - entity.boundingBox.width);
        entity.velocity.xd = 0;
    }
    if (entity.boundingBox.y < state.bounds.y) {
        entity.boundingBox.y = state.bounds.y;
        entity.velocity.yd = 0;
    }
    else if ((entity.boundingBox.y + entity.boundingBox.height) > state.bounds.height) {
        entity.boundingBox.y = (state.bounds.height - entity.boundingBox.height);
        entity.velocity.yd = 0;
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateState(state) {
    state.entities.sequence()
        .waitForEach(({ entity }) => {
        updateEntity(state, entity);
    });
}
