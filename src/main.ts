// global state so that it can be manipulated using the browser console
const state = new State();

state.subject.controller = new WebKeyboardController(window);

state.addNewEntity("Burt", new Box2D(0, 0, 100, 65), 5, undefined, undefined, undefined, new RandomController());
state.addNewEntity("Mark", new Box2D(0, 0, 50     ), 5, undefined, undefined, undefined, new RandomController());
state.addNewEntity("Wug",  new Box2D(0, 0, 30, 125), 5, undefined, undefined, undefined, new RandomController());


window.onload = () => {
	const [canvas, context]: [HTMLCanvasElement, CanvasRenderingContext2D] = initCanvas();

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
		drawFrame(context, state, lastFps);
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
