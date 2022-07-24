/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ObservableValue<T extends NotNullable> extends Observable<T> {

	#value: T;

	readonly #observers: Set<Observer<T>> = new Set();

	constructor(initialValue: T) {
		super();
		this.#value = initialValue;
	}

	get(): T {
		return this.#value;
	}

	set(value: T) {
		this.#value = value;
		this.#notifyObservers();
	}

	protected override subscribeActual(downstreamObserver: Observer<T>) {
		const subscription = Subscription.ofAction(() => {
			this.#observers.delete(downstreamObserver);
		});

		downstreamObserver.onSubscribe(subscription);

		downstreamObserver.onNext(this.#value);

		this.#observers.add(downstreamObserver);
	}

	#notifyObservers() {
		for(const observer of this.#observers) {
			observer.onNext(this.#value);
		}
	}
}
