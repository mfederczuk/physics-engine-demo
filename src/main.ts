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
	state.entities.sequence()
		.filter(({ entity }: EntityWithId) => (entity !== state.subject))
		.waitForEach(({ entity }: EntityWithId) => {
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
state.addNewEntity("Burt", new Box2D(0, 0, 100, 65), 5, undefined, undefined, undefined, new RandomController());
state.addNewEntity("Mark", new Box2D(0, 0, 50     ), 5, undefined, undefined, undefined, new RandomController());
state.addNewEntity("Wug",  new Box2D(0, 0, 30, 125), 5, undefined, undefined, undefined, new RandomController());

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
