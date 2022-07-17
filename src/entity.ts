// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Entity {
	         name:                string;
	readonly boundingBox:         Box2D;
	         mass:                number; // TODO: mass is currently unused, but will be used for better friction,
	                                      //       terminal velocity and maybe impact force and others?
	         manualMovementSpeed: number;
	         jumpSpeed:           number;

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

		controller: Controller = new DummyController(),
	) {
		this.name                = name;
		this.boundingBox         = boundingBox;
		this.mass                = mass;
		this.manualMovementSpeed = manualMovementSpeed;
		this.jumpSpeed           = jumpSpeed;

		this.controller = controller;
	}
}
