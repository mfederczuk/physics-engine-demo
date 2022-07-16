enum ForceType {
	GRAVITY = "gravity",
	LEFT    = "left",
	RIGHT   = "right",
	JUMP    = "jump",

	DEBUG = "[debug]",
}

class Entity {
	readonly boundingBox: Box2D;
	         mass:        number; // TODO: mass is currently unused, but will be used for better friction,
	                              //       terminal velocity and maybe impact force and others?

	controller: Controller;

	readonly velocity: Vector2D                 = new Vector2D();
	readonly forces:   Map<ForceType, Vector2D> = new Map();
	         noclip:   boolean                  = false; // dunno why i added this, seemed like fun lol

	constructor(boundingBox: Box2D, mass: number, controller: Controller = new DummyController()) {
		this.boundingBox = boundingBox;
		this.mass        = mass;
		this.controller  = controller;
	}
}
