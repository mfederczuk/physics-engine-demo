// TODO: maybe instead of deleting forces completely, just mark them as deleted/removed/disabled? like this we would be
//       able to display old forces in the debug text.
//       the jump force, for example, is literally only displayed for a single frame, don't think i need to explicitly
//       say that it's pretty hard to catch that -- would be better to display the old/inactive force so that it can
//       still be seen retroactively

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

class State {
	static readonly SUBJECT_SIZE = 75;

	readonly gravity: Vector2D = new Vector2D(0, 0.5);
	manualMovementSpeed: number = 1;
	frictionRate: number = 0.5;
	jumpSpeed: number = 15;

	readonly bounds: Box2D = new Box2D(0, 0, 0, 0);
	readonly subject: Entity = new Entity(new Box2D(0, 0, State.SUBJECT_SIZE), 50);
}

function updateEntity(state: State, entity: Entity) {
	// noclip & gravity
	if(!(entity.noclip)) {
		entity.forces.set(ForceType.GRAVITY, state.gravity);
	} else {
		entity.forces.delete(ForceType.GRAVITY);
	}

	// manual movement (left, right & jump) is only possible when grounded
	// TODO: air (double, triple, ...) jumps?
	if((entity.boundingBox.y + entity.boundingBox.height) >= state.bounds.height) {
		// TODO: gravity should influence in which direction the manual movement vectors are pointed to

		if(entity.controller.leftActive()) {
			entity.forces.set(ForceType.LEFT, new Vector2D(-(state.manualMovementSpeed), 0));
		} else {
			entity.forces.delete(ForceType.LEFT);
		}

		if(entity.controller.rightActive()) {
			entity.forces.set(ForceType.RIGHT, new Vector2D(state.manualMovementSpeed, 0));
		} else {
			entity.forces.delete(ForceType.RIGHT);
		}

		if(entity.controller.jumpActive()) {
			entity.forces.set(ForceType.JUMP, new Vector2D(0, -(state.jumpSpeed)));
		}
	} else {
		entity.forces.delete(ForceType.LEFT);
		entity.forces.delete(ForceType.RIGHT);
		entity.forces.delete(ForceType.JUMP);
	}


	// updating velocity
	const netForce: Readonly<Vector2D> = Vector2D.sum(entity.forces.values());
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

	// TODO: add air resistance
	//       good idea to add a `fluids: Fluid[]` (or something like this) attribute to the state? every fluid would
	//       have it's own resistance this way would be easy to add water and such

	// TODO: add terminal velocity

	// if net force is pulling down & entity is grounded: add ground friction
	// TODO: friction on walls and ceilings?
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

	context.fillText("forces:",                                45, infoTextPosY + (fontSize * 14));
	let forceI = 0;
	state.subject.forces.forEach((force: Vector2D, key: string) => {
		context.fillText((key || "unnamed") + ":",             65, infoTextPosY + (fontSize * (15 + (forceI * 3 + 0))));
		context.fillText(`xd: ${force.xd}`,                    85, infoTextPosY + (fontSize * (15 + (forceI * 3 + 1))));
		context.fillText(`yd: ${force.yd}`,                    85, infoTextPosY + (fontSize * (15 + (forceI * 3 + 2))));

		++forceI;
	});


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
