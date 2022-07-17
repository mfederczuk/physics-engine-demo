"use strict";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Entity {
    constructor(name, boundingBox, mass, manualMovementSpeed, jumpSpeed, controller = new DummyController()) {
        this.velocity = new Vector2D();
        this.forces = new ForceCollection();
        this.noclip = false; // dunno why i added this, seemed like fun lol
        this.name = name;
        this.boundingBox = boundingBox;
        this.mass = mass;
        this.manualMovementSpeed = manualMovementSpeed;
        this.jumpSpeed = jumpSpeed;
        this.controller = controller;
    }
}
