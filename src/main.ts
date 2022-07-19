class State {
	static readonly SUBJECT_SIZE = 75;

	// TODO: move these into a separate `StateConfig` object?
	readonly gravity: Vector2D = new Vector2D(0, 0.5);
	defaultEntityManualMovementSpeed: number = 1;
	frictionRate: number = 0.1; // TODO: this should be useless once correctly calculating friction with mass and gravity?
	defaultEntityJumpSpeed: number = 15;
	defaultEntityNoclipFlySpeed: number = 12;

	readonly bounds: Box2D = new Box2D(0, 0, 0, 0);
	readonly subject: Entity;

	readonly otherEntities: Entity[] = [];

	constructor() {
		this.subject = this
			.newEntity(
				"Subject",
				new Box2D(0, 0, State.SUBJECT_SIZE),
				50
			);
	}

	newEntity(
		name: string,
		boundingBox: Box2D,
		mass: number,
		manualMovementSpeed: number = this.defaultEntityManualMovementSpeed,
		jumpSpeed: number = this.defaultEntityJumpSpeed,
		noclipFlySpeed: number = this.defaultEntityNoclipFlySpeed,

		controller: Controller = new DummyController(),
	): Entity {
		return new Entity(
			name,
			boundingBox,
			mass,
			manualMovementSpeed,
			jumpSpeed,
			noclipFlySpeed,

			controller,
		);
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

		if(entity.controller.upActive()) {
			noclipYd -= entity.noclipFlySpeed;
		}

		if(entity.controller.downActive()) {
			noclipYd += entity.noclipFlySpeed;
		}

		if(entity.controller.leftActive()) {
			noclipXd -= entity.noclipFlySpeed;
		}

		if(entity.controller.rightActive()) {
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

		if(entity.controller.leftActive()) {
			const leftForce: Vector2D =
				Vector2D.ofMagnitudeAndDirection(
					entity.manualMovementSpeed,
					entityNetForceDirection - 90
				);

			entity.forces.put(ForceType.LEFT, leftForce);
		}

		if(entity.controller.rightActive()) {
			const rightForce: Vector2D =
				Vector2D.ofMagnitudeAndDirection(
					entity.manualMovementSpeed,
					entityNetForceDirection + 90
				);

			entity.forces.put(ForceType.RIGHT, rightForce);
		}

		if(entity.controller.jumpActive()) {
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

function updateState(state: State) {
	updateEntity(state, state.subject);
	state.otherEntities.forEach(updateEntity.bind(undefined, state));
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


	// draw other entities
	state.otherEntities.forEach((entity: Entity) => {
		context.save();
		// border
		context.fillStyle = "black";
		context.fillRect(
			entity.boundingBox.x,
			entity.boundingBox.y,
			entity.boundingBox.width,
			entity.boundingBox.height,
		);

		// body
		context.fillStyle = "green";
		context.fillRect(
			entity.boundingBox.x + 2,
			entity.boundingBox.y + 2,
			entity.boundingBox.width - 4,
			entity.boundingBox.height - 4,
		);

		// name
		context.font = "12px monospace";
		context.fillStyle = "black";
		context.fillText(
			entity.name,
			entity.boundingBox.x + 4,
			entity.boundingBox.y + 12,
		);

		context.restore();
	});


	// draw subject

	// border
	context.fillStyle = "black";
	context.fillRect(
		state.subject.boundingBox.x,
		state.subject.boundingBox.y,
		state.subject.boundingBox.width,
		state.subject.boundingBox.height,
	);

	// body
	context.fillStyle = "blue";
	context.fillRect(
		state.subject.boundingBox.x + 1,
		state.subject.boundingBox.y + 1,
		state.subject.boundingBox.width - 2,
		state.subject.boundingBox.height - 2,
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

	const subjectNetForce = state.subject.forces.computeNetForce();

	// TODO: draw forces as actual vectors (i.e.: arrows)?
	context.fillText("forces:",                                45, infoTextPosY + (fontSize * 14));

	context.fillText(`xd: ${subjectNetForce.xd}`,              65, infoTextPosY + (fontSize * 15));
	context.fillText(`yd: ${subjectNetForce.yd}`,              65, infoTextPosY + (fontSize * 16));

	let forceI = 0;
	context.save();
	state.subject.forces
		.forcesSequence()
		.sort((elementA, elementB) => {
			const aInactive = (elementA.markedAsRemoved || elementA.blocked);
			const bInactive = (elementB.markedAsRemoved || elementB.blocked);

			if(!aInactive && bInactive) {
				return -1;
			}

			if(aInactive && !bInactive) {
				return 1;
			}

			return elementA.type.localeCompare(elementB.type);
		})
		.waitForEach(({ type, force, markedAsRemoved, blocked }) => {
			// 0.38 taken from Material guidelines: <https://material.io/design/interaction/states.html#disabled>
			const alpha = ((!markedAsRemoved && !blocked) ? 1 : 0.38);

			context.fillStyle = `rgba(0, 0, 0, ${alpha})`;

			const typeText = (type || "unnamed") + ":";

			context.fillText(typeText,          65,                                      infoTextPosY + (fontSize * (18 + (forceI * 3 + 0))));

			if(blocked) {
				context.save();

				context.fillStyle = `rgba(127, 0, 0, ${alpha})`;
				context.fillText("[blocked]",   70 + ((fontSize / 2) * typeText.length), infoTextPosY + (fontSize * (18 + (forceI * 3 + 0))));

				context.restore();
			}

			context.fillText(`xd: ${force.xd}`, 85,                                      infoTextPosY + (fontSize * (18 + (forceI * 3 + 1))));
			context.fillText(`yd: ${force.yd}`, 85,                                      infoTextPosY + (fontSize * (18 + (forceI * 3 + 2))));

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
state.otherEntities.push(
	state.newEntity("Burt", new Box2D(0, 0, 100, 65), 5, undefined, undefined, undefined, new RandomController()),
	state.newEntity("Mark", new Box2D(0, 0, 50     ), 5, undefined, undefined, undefined, new RandomController()),
	state.newEntity("Wug",  new Box2D(0, 0, 30, 125), 5, undefined, undefined, undefined, new RandomController()),
);

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
