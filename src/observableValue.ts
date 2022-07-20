type Listener<T> = ((value: T) => void);

interface AddListenerOptions {
	readonly invokeImmediately?: true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ObservableValue<T> {

	#value: T;

	readonly #listeners: Set<Listener<T>> = new Set();

	constructor(initialValue: T) {
		this.#value = initialValue;
	}

	get(): T {
		return this.#value;
	}

	set(value: T) {
		this.#value = value;
		this.#notifyListeners();
	}

	addListener(listener: Listener<T>): void;
	addListener(options: AddListenerOptions, listener: Listener<T>): void;
	addListener(...args: [Listener<T>] | [AddListenerOptions, Listener<T>]) {
		const listener: Listener<T>       = ((args.length === 1) ? args[0] : args[1]);
		const options: AddListenerOptions = ((args.length === 1) ? {}      : args[0]);

		this.#listeners.add(listener);

		if(options.invokeImmediately === true) {
			listener(this.#value);
		}
	}

	removeListener(listener: Listener<T>) {
		this.#listeners.delete(listener);
	}

	#notifyListeners() {
		for(const listener of this.#listeners) {
			listener(this.#value);
		}
	}
}
