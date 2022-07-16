class State {
	static readonly SUBJECT_SIZE = 75;

	// TODO: move these into a separate `StateConfig` object?
	readonly gravity: Vector2D = new Vector2D(0, 0.5);
	defaultEntityManualMovementSpeed: number = 1;
	frictionRate: number = 0.5; // TODO: this should be useless once correctly calculating friction with mass and gravity?
	defaultEntityJumpSpeed: number = 15;

	readonly bounds: Box2D = new Box2D(0, 0, 0, 0);
	readonly subject: Entity;

	constructor() {
		this.subject = this
			.newEntity(
				new Box2D(0, 0, State.SUBJECT_SIZE),
				50
			);
	}

	newEntity(
		boundingBox: Box2D,
		mass: number,
		manualMovementSpeed: number = this.defaultEntityManualMovementSpeed,
		jumpSpeed: number = this.defaultEntityJumpSpeed,

		controller: Controller = new DummyController(),
	): Entity {
		return new Entity(
			boundingBox,
			mass,
			manualMovementSpeed,
			jumpSpeed,

			controller,
		);
	}
}

function updateEntity(state: State, entity: Entity) {
	// noclip & gravity
	if(!(entity.noclip)) {
		entity.forces.put(ForceType.GRAVITY, state.gravity);
	} else {
		entity.forces.disable(ForceType.GRAVITY);
	}

	entity.forces.disable(ForceType.LEFT, ForceType.RIGHT, ForceType.JUMP);

	// manual movement (left, right & jump) is only possible when grounded
	// TODO: air (double, triple, ...) jumps?
	// FIXME: this grounded check is wrong (needs to take gravity into consideration - though don't take the global
	//        gravity, use the gravity of the entity)
	if((entity.boundingBox.y + entity.boundingBox.height) >= state.bounds.height) {
		if(entity.controller.leftActive()) {
			const leftForce: Vector2D =
				Vector2D.ofMagnitudeAndDirection(
					entity.manualMovementSpeed,
					state.gravity.computeDirection() - 90
				);

			entity.forces.put(ForceType.LEFT, leftForce);
		}

		if(entity.controller.rightActive()) {
			const rightForce: Vector2D =
				Vector2D.ofMagnitudeAndDirection(
					entity.manualMovementSpeed,
					state.gravity.computeDirection() + 90
				);

			entity.forces.put(ForceType.RIGHT, rightForce);
		}

		if(entity.controller.jumpActive()) {
			const jumpForce: Vector2D =
				Vector2D.ofMagnitudeAndDirection(
					entity.jumpSpeed,
					state.gravity.computeDirection() + 180
				);

			entity.forces.put(ForceType.JUMP, jumpForce);
		}
	}


	// updating velocity
	const netForce: Readonly<Vector2D> = entity.forces.computeNetForce();
	entity.velocity.add(netForce);

	// updating position
	entity.boundingBox.x += entity.velocity.xd;
	entity.boundingBox.y += entity.velocity.yd;


	// keeping position in bounds & stopping velocity when hitting bounds
	if(!(entity.noclip)) {
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

	// FIXME: should the friction and drag calculation happen BEFORE adding the velocity to the position?

	// TODO: add air resistance (proper name is "drag")
	//       good idea to add a `fluids: Fluid[]` (or something like this) attribute to the state? every fluid would
	//       have it's own resistance this way would be easy to add water and such

	// TODO: add terminal velocity

	// if net force is pulling down & entity is grounded: add ground friction
	// TODO: friction on walls and ceilings?
	// TODO: gravity (or, to be more accurate, the net force that is pulling down) needs to impact the amount of
	//       friction
	// FIXME: this grounded check is wrong (needs to take the net force into consideration)
	if((netForce.yd > 0) && ((entity.boundingBox.y + entity.boundingBox.height) >= state.bounds.height)) {
		if(entity.velocity.xd > 0) {
			entity.velocity.xd -= state.frictionRate;

			if(entity.velocity.xd < 0) {
				entity.velocity.xd = 0;
			}
		} else if(entity.velocity.xd < 0) {
			entity.velocity.xd += state.frictionRate;

			if(entity.velocity.xd > 0) {
				entity.velocity.xd = 0;
			}
		}
	}
}

function updateState(state: State) {
	updateEntity(state, state.subject);
}

function drawState(state: Readonly<State>, context: CanvasRenderingContext2D, fps: number) {
	const canvas: HTMLCanvasElement = context.canvas;

	// clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);


	context.save();


	// draw bounds
	context.fillStyle = "powderblue";
	context.fillRect(
		state.bounds.x,
		state.bounds.y,
		state.bounds.width,
		state.bounds.height,
	);


	// draw subject
	context.fillStyle = "blue";
	context.fillRect(
		state.subject.boundingBox.x,
		state.subject.boundingBox.y,
		state.subject.boundingBox.width,
		state.subject.boundingBox.height,
	);


	// draw subject info text

	const fontSize = 16;
	context.font = `${fontSize}px monospace`;
	context.fillStyle = "black";

	const infoTextPosY = 30;
	context.fillText("subject:",                               25, infoTextPosY + (fontSize *  0));

	context.fillText(`mass: ${state.subject.mass}`,            45, infoTextPosY + (fontSize *  1));
	context.fillText(`noclip: ${state.subject.noclip}`,        45, infoTextPosY + (fontSize *  2));

	context.fillText("bounding box:",                          45, infoTextPosY + (fontSize *  4));
	context.fillText(`x: ${state.subject.boundingBox.x}`,      65, infoTextPosY + (fontSize *  5));
	context.fillText(`y: ${state.subject.boundingBox.y}`,      65, infoTextPosY + (fontSize *  6));
	context.fillText(`w: ${state.subject.boundingBox.width}`,  65, infoTextPosY + (fontSize *  7));
	context.fillText(`h: ${state.subject.boundingBox.height}`, 65, infoTextPosY + (fontSize *  8));

	context.fillText("velocity:",                              45, infoTextPosY + (fontSize * 10));
	context.fillText(`xd: ${state.subject.velocity.xd}`,       65, infoTextPosY + (fontSize * 11));
	context.fillText(`yd: ${state.subject.velocity.yd}`,       65, infoTextPosY + (fontSize * 12));

	// TODO: draw forces as actual vectors (i.e.: arrows)?
	context.fillText("forces:",                                45, infoTextPosY + (fontSize * 14));
	let forceI = 0;
	context.save();
	state.subject.forces.forEach((force: Vector2D, enabled: boolean, type: ForceType) => {
		// 0.38 taken from Material guidelines: <https://material.io/design/interaction/states.html#disabled>
		context.fillStyle = (enabled ? "black" : "rgba(0, 0, 0, 0.38)");

		context.fillText((type || "unnamed") + ":",            65, infoTextPosY + (fontSize * (15 + (forceI * 3 + 0))));
		context.fillText(`xd: ${force.xd}`,                    85, infoTextPosY + (fontSize * (15 + (forceI * 3 + 1))));
		context.fillText(`yd: ${force.yd}`,                    85, infoTextPosY + (fontSize * (15 + (forceI * 3 + 2))));

		++forceI;
	});
	context.restore();


	const fpsText = ((fps >= 0) ? `fps: ${fps}` : "fps: N/A");
	context.fillText(fpsText, canvas.width - 73, 20);


	context.restore();
}

// global state so that it can be manipulated using the browser console
const state = new State();
state.subject.controller = new WebKeyboardController(window);

window.onload = () => {
	const canvas: (HTMLCanvasElement | null) = document.getElementById("main-canvas") as (HTMLCanvasElement | null);
	if(canvas === null) {
		error("Canvas (#main-canvas) not found");
	}

	const context: (CanvasRenderingContext2D | null) = canvas.getContext("2d");
	if(context === null) {
		error("Canvas unsupported");
	}

	const adjustBounds = () => {
		state.bounds.width  = (canvas.width  = canvas.offsetWidth);
		state.bounds.height = (canvas.height = canvas.offsetHeight);
	};

	adjustBounds();

	// TODO: currently the main loop runs every visual frame, which could be inconsistent and is susceptible to
	//       frame drops; this should be done using consistent ticks or whatever and then the ready state should be
	//       queued for the next visual frame (use setInterval for this)

	let frameCount = 0;
	let lastFps = -1;

	const frameCallback = () => {
		adjustBounds();

		updateState(state);
		drawState(state, context, lastFps);
		++frameCount;

		window.requestAnimationFrame(frameCallback);
	};

	const fpsWatcherCallback = () => {
		lastFps = frameCount;
		frameCount = 0;
	};

	window.requestAnimationFrame(() => {
		setInterval(fpsWatcherCallback, 1000);
		frameCallback();
	});
};
