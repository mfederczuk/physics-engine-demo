/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DeviceInputSource<InputSignal extends NotNullable> extends InputSource {

	readonly #device: ObservableValue<InputDevice<InputSignal>>;
	#map: InputMap<InputSignal>;

	override readonly inputActions: Observable<Sequence<InputAction>>;

	constructor(
		device: InputDevice<InputSignal>,
		map: InputMap<InputSignal>,
	) {
		super();

		this.#device = new ObservableValue(device);
		this.#map = map;

		this.inputActions = this.#device
			.switchMap((device: InputDevice<InputSignal>) => (device.inputSignals))
			.map((inputSignal: InputSignal): Sequence<InputAction> => {
				return this.#map.translateInputSignal(inputSignal);
			})
			.hide();
	}

	setDevice(device: InputDevice<InputSignal>) {
		this.#device.set(device);
	}

	getDevice(): InputDevice<InputSignal> {
		return this.#device.get();
	}

	getMap(): InputMap<InputSignal> {
		return this.#map;
	}

	setMap(map: InputMap<InputSignal>) {
		this.#map = map;
	}
}
