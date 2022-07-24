/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class InputDevice<InputSignal extends NotNullable> {
	abstract readonly inputSignals: Observable<InputSignal>;
}
