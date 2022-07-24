/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

const CONTROLS_GUIDE_ACTIVE_CLASS_NAME = "controls-guide-active";


// global state so that it can be manipulated using the browser console
const state = new State();

state.subject.inputManager.setInputSource(
	new DeviceInputSource(
		new WebKeyboard(window),
		new SimpleKeyInputMap(),
	)
);

state.addNewEntity("Burt", new Box2D(0, 0, 100, 65), 5, undefined, undefined, undefined, new RandomInputSource());
state.addNewEntity("Mark", new Box2D(0, 0, 50     ), 5, undefined, undefined, undefined, new RandomInputSource());
state.addNewEntity("Wug",  new Box2D(0, 0, 30, 125), 5, undefined, undefined, undefined, new RandomInputSource());


window.onload = () => {
	const normalControlsGuide: HTMLElement = Optional.ofNullable(document.getElementById("normal-controls-guide"))
		.getOrThrow(() => new Error("Normal controls guide table (#normal-controls-guide) not found"));

	const noclipControlsGuide: HTMLElement = Optional.ofNullable(document.getElementById("noclip-controls-guide"))
		.getOrThrow(() => new Error("Noclip controls guide table (#noclip-controls-guide) not found"));


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


	normalControlsGuide.onanimationend = () => normalControlsGuide.classList.remove(CONTROLS_GUIDE_ACTIVE_CLASS_NAME);
	noclipControlsGuide.onanimationend = () => noclipControlsGuide.classList.remove(CONTROLS_GUIDE_ACTIVE_CLASS_NAME);

	state.subject.noclipObservable().subscribe({
		onNext: (noclip: boolean) => {
			normalControlsGuide.classList.remove(CONTROLS_GUIDE_ACTIVE_CLASS_NAME);
			noclipControlsGuide.classList.remove(CONTROLS_GUIDE_ACTIVE_CLASS_NAME);

			const inputSource: InputSource = state.subject.inputManager.getInputSource();

			if(!(inputSource instanceof DeviceInputSource) ||
			   !(inputSource.getDevice() instanceof Keyboard)) {

				return;
			}

			const inputMap: InputMap<NotNullable> = inputSource.getMap();

			if(!(inputMap instanceof SimpleKeyInputMap)) {
				return;
			}

			// FIXME: inputMap.keyMap needs to influence which key images are displayed
			((!noclip) ? normalControlsGuide : normalControlsGuide).classList.add(CONTROLS_GUIDE_ACTIVE_CLASS_NAME);
		}
	});


	window.requestAnimationFrame(() => {
		setInterval(fpsWatcherCallback, 1000);
		frameCallback();
	});
};
