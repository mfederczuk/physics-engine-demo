abstract class Subscription {
	abstract cancel(): void;
	abstract isCancelled(): boolean;
}
namespace Subscription {
	class EmptySubscription extends Subscription {

		#cancelled: boolean = false;

		cancel() {
			this.#cancelled = true;
		}

		isCancelled(): boolean {
			return this.#cancelled;
		}
	}

	class CancelledSubscription extends Subscription {

		cancel() {
			// eslint-disable-next-line no-empty-function
		}

		isCancelled(): true {
			return true;
		}
	}

	class ActionSubscription extends Subscription {

		#action: Optional<() => void>;

		constructor(action: () => void) {
			super();
			this.#action = Optional.of(action);
		}

		cancel() {
			if(this.#action.isEmpty()) {
				return;
			}

			try {
				this.#action.get()();
			} finally {
				this.#action = Optional.empty();
			}
		}

		isCancelled(): boolean {
			return this.#action.isEmpty();
		}
	}

	export function empty(): Subscription {
		return new EmptySubscription();
	}

	export function cancelled(): Subscription {
		return new CancelledSubscription();
	}

	export function ofAction(action: () => void): Subscription {
		return new ActionSubscription(action);
	}
}

abstract class Observer<T extends NotNullable> {
	abstract onSubscribe(subscription: Subscription): void;
	abstract onNext(item: T): void;
	abstract onError(error: unknown): void;
	abstract onComplete(): void;
}
abstract class ObserverWrapper<T extends NotNullable> extends Observer<T> {

	readonly #baseObserver: Observer<T>;

	constructor(baseObserver: Observer<T>) {
		super();
		this.#baseObserver = baseObserver;
	}

	override onSubscribe(subscription: Subscription) {
		this.#baseObserver.onSubscribe(subscription);
	}

	override onNext(item: T) {
		this.#baseObserver.onNext(item);
	}

	override onError(error: unknown) {
		this.#baseObserver.onError(error);
	}

	override onComplete() {
		this.#baseObserver.onComplete();
	}
}

// *heavily* inspired by RxJava
abstract class Observable<T extends NotNullable> {

	protected abstract subscribeActual(downstreamObserver: Observer<T>): void;

	subscribe(observer: Observer<T>): void;
	subscribe(
		obj?: {
			onNext?: (item: T) => void,
			onError?: (error: unknown) => void,
			onComplete?: () => void,
		}
	): Subscription;
	subscribe(
		...args: ([Observer<T>] | [obj?: {
			onNext?: (item: T) => void,
			onError?: (error: unknown) => void,
			onComplete?: () => void,
		}])
	): (void | Subscription) {
		if(args[0] instanceof Observer) {
			this.subscribeActual(args[0]);
			return;
		}

		const onNextArg = Optional.ofNullable(args[0]?.onNext);
		const onErrorArg = Optional.ofNullable(args[0]?.onError);
		const onCompleteArg = Optional.ofNullable(args[0]?.onComplete);

		let thisSubscription: Optional<Subscription> = Optional.empty();

		const returnSubscription: Subscription =
			Subscription.ofAction(() => {
				thisSubscription.ifPresent((subscription) => subscription.cancel());
			});

		const observer = new class extends Observer<T> {

			override onSubscribe(subscription: Subscription) {
				if(returnSubscription.isCancelled()) {
					subscription.cancel();
					return;
				}

				thisSubscription = Optional.of(subscription);
			}

			override onNext(item: T) {
				if(returnSubscription.isCancelled()) {
					throw new Error("Subscription is cancelled, but onNext event happened");
				}

				onNextArg.ifPresent((onNext) => onNext(item));
			}

			override onError(error: unknown) {
				if(returnSubscription.isCancelled()) {
					throw new Error("Subscription is cancelled, but onError event happened");
				}

				onErrorArg.ifPresent((onError) => onError(error));
			}

			override onComplete() {
				if(returnSubscription.isCancelled()) {
					throw new Error("Subscription is cancelled, but onComplete event happened");
				}

				onCompleteArg.ifPresent((onComplete) => onComplete());
			}
		};

		this.subscribeActual(observer);

		return returnSubscription;
	}

	//#region factory functions

	static empty<T extends NotNullable = never>(): Observable<T> {
		return new EmptyObservable();
	}

	static never<T extends NotNullable = never>(): Observable<T> {
		return new NeverObservable();
	}

	static error<T extends NotNullable = never>(error: unknown): Observable<T> {
		return new ErrorObservable(error);
	}

	//#region from*

	static fromSequence<T extends NotNullable>(sequence: Sequence<T>): Observable<T> {
		return new ObservableFromSequence(sequence);
	}

	static fromArray<T extends NotNullable>(array: readonly T[]): Observable<T> {
		return new ObservableFromSequence(Sequence.fromArray(array));
	}

	static from<T extends NotNullable>(...items: readonly [T, ...T[]]): Observable<T> {
		return new ObservableFromSequence(Sequence.from(...items));
	}

	//#endregion

	//#endregion

	filter(predicate: (item: T) => boolean): Observable<T> {
		return new FilteredObservable(this, predicate);
	}

	map<R extends NotNullable>(mapper: (item: T) => R): Observable<R> {
		return new MappedObservable(this, mapper);
	}

	switchMap<R extends NotNullable>(mapper: (item: T) => Observable<R>): Observable<R> {
		return new SwitchMappedObservable(this, mapper);
	}

	delay(milliseconds: number): Observable<T> {
		return new DelayedObservable(this, milliseconds);
	}

	take(n: number): Observable<T> {
		return new NTakenObservable(this, n);
	}

	skip(n: number): Observable<T> {
		return new NSkippedObservable(this, n);
	}

	sort(comparator: (itemA: T, itemB: T) => number): Observable<T> {
		return new SortedObservable(this, comparator);
	}

	isEmpty(): Observable<boolean> {
		return new IsEmptyObservable(this);
	}

	isNotEmpty(): Observable<boolean> {
		return this
			.isEmpty()
			.map((empty) => (!empty));
	}

	doOnEach(action: (item: T) => void): Observable<T> {
		return new ActionOnEachItemObservable(this, action);
	}

	doOnCancel(action: () => void): Observable<T> {
		return new ActionOnCancelObservable(this, action);
	}

	hide(): Observable<T> {
		return new class extends ObservableWithUpstream<T> {

			protected subscribeActual(downstreamObserver: Observer<T>) {
				const upstreamObserver = new class extends ObserverWrapper<T> {

					override onSubscribe(upstreamSubscription: Subscription) {
						const downstreamSubscription = new class extends Subscription {

							cancel() {
								upstreamSubscription.cancel();
							}

							isCancelled(): boolean {
								return upstreamSubscription.isCancelled();
							}
						};

						super.onSubscribe(downstreamSubscription);
					}
				}(downstreamObserver);

				this.upstream.subscribe(upstreamObserver);
			}
		}(this);
	}

	toArray(): Observable<T[]> {
		return new ToArrayObservable(this);
	}

	toSet(): Observable<Set<T>> {
		return new ToSetObservable(this);
	}
}

interface Sequence<T extends NotNullable> {
	toObservable(): Observable<T>;
}
Sequence.prototype.toObservable = function<T extends NotNullable>(this: Sequence<T>): Observable<T> {
	return Observable.fromSequence(this);
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PublishRelay<T extends NotNullable> extends Observable<T> {

	readonly #observers: Set<Observer<T>> = new Set();

	protected override subscribeActual(downstreamObserver: Observer<T>) {
		downstreamObserver.onSubscribe(Subscription.ofAction(() => {
			this.#observers.delete(downstreamObserver);
		}));

		this.#observers.add(downstreamObserver);
	}

	onNext(item: T) {
		this.#observers.forEach((observer: Observer<T>) => {
			observer.onNext(item);
		});
	}
}


class EmptyObservable extends Observable<never> {

	protected override subscribeActual(downstreamObserver: Observer<never>) {
		downstreamObserver.onSubscribe(Subscription.empty());
		downstreamObserver.onComplete();
	}
}

class NeverObservable extends Observable<never> {

	protected override subscribeActual(downstreamObserver: Observer<never>) {
		downstreamObserver.onSubscribe(Subscription.empty());
	}
}

class ErrorObservable extends Observable<never> {

	constructor(readonly error: unknown) {
		super();
	}

	protected override subscribeActual(downstreamObserver: Observer<never>) {
		downstreamObserver.onSubscribe(Subscription.empty());
		downstreamObserver.onError(this.error);
	}
}

class ObservableFromSequence<T extends NotNullable> extends Observable<T> {

	constructor(readonly sequence: Sequence<T>) {
		super();
	}

	protected override subscribeActual(downstreamObserver: Observer<T>) {
		downstreamObserver.onSubscribe(Subscription.empty());
		this.sequence.waitForEach(downstreamObserver.onNext.bind(downstreamObserver));
		downstreamObserver.onComplete();
	}
}

abstract class ObservableWithUpstream<T extends NotNullable, R extends NotNullable = T> extends Observable<R> {

	constructor(readonly upstream: Observable<T>) {
		super();
	}
}

class FilteredObservable<T extends NotNullable> extends ObservableWithUpstream<T> {

	constructor(
		upstream: Observable<T>,
		readonly predicate: (item: T) => boolean
	) {
		super(upstream);
	}

	protected override subscribeActual(downstreamObserver: Observer<T>) {
		new class extends Observer<T> {

			constructor(readonly predicate: (item: T) => boolean) {
				super();
			}

			override readonly onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);

			override onNext(item: T) {
				let matched: boolean;
				try {
					// eslint-disable-next-line prefer-const
					matched = this.predicate(item);
				} catch(error: unknown) {
					downstreamObserver.onError(error);
					return;
				}

				if(matched) {
					downstreamObserver.onNext(item);
				}
			}

			override readonly onError = downstreamObserver.onError.bind(downstreamObserver);

			override readonly onComplete = downstreamObserver.onComplete.bind(downstreamObserver);
		}(this.predicate);
	}
}

class MappedObservable<T extends NotNullable, R extends NotNullable> extends ObservableWithUpstream<T, R> {

	constructor(
		upstream: Observable<T>,
		readonly mapper: (item: T) => R,
	) {
		super(upstream);
	}

	protected override subscribeActual(downstreamObserver: Observer<R>) {
		const upstreamObserver = new class extends Observer<T> {

			constructor(readonly mapper: (item: T) => R) {
				super();
			}

			override readonly onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);

			override onNext(item: T) {
				let mappedItem: R;
				try {
					// eslint-disable-next-line prefer-const
					mappedItem = this.mapper(item);
				} catch(error: unknown) {
					downstreamObserver.onError(error);
					return;
				}

				downstreamObserver.onNext(mappedItem);
			}

			override readonly onError = downstreamObserver.onError.bind(downstreamObserver);

			override readonly onComplete = downstreamObserver.onComplete.bind(downstreamObserver);
		}(this.mapper);

		this.upstream.subscribe(upstreamObserver);
	}
}

class SwitchMappedObservable<T extends NotNullable, R extends NotNullable> extends ObservableWithUpstream<T, R> {

	constructor(
		upstream: Observable<T>,
		readonly mapper: (item: T) => Observable<R>,
	) {
		super(upstream);
	}

	protected override subscribeActual(downstreamObserver: Observer<R>) {
		class NestedObserver extends Observer<R> {

			constructor(readonly subscriptionConsumer: (subscription: Subscription) => void) {
				super();
			}

			override readonly onSubscribe = this.subscriptionConsumer.bind(undefined);

			override readonly onNext = downstreamObserver.onNext.bind(downstreamObserver);

			override readonly onError = downstreamObserver.onError.bind(downstreamObserver);

			override onComplete() {
				// eslint-disable-next-line no-empty-function
			}
		}

		class UpstreamObserver extends Observer<T> {

			#currentSubscription: Subscription = Subscription.cancelled();

			constructor(readonly mapper: (item: T) => Observable<R>) {
				super();
			}

			override onSubscribe(subscription: Subscription) {
				downstreamObserver.onSubscribe(Subscription.ofAction(() => {
					subscription.cancel();
					this.#currentSubscription.cancel();
				}));
			}

			override onNext(item: T) {
				this.#currentSubscription.cancel();

				const mappedObservable: Observable<R> = this.mapper(item);
				mappedObservable.subscribe(new NestedObserver((subscription: Subscription) => {
					this.#currentSubscription = subscription;
				}));
			}

			override onError(error: unknown) {
				this.#currentSubscription.cancel();

				downstreamObserver.onError(error);
			}

			override onComplete() {
				this.#currentSubscription.cancel();

				downstreamObserver.onComplete();
			}
		}

		this.upstream.subscribe(new UpstreamObserver(this.mapper));
	}
}

class DelayedObservable<T extends NotNullable> extends ObservableWithUpstream<T> {

	constructor(
		upstream: Observable<T>,
		readonly milliseconds: number,
	) {
		super(upstream);
	}

	protected override subscribeActual(downstreamObserver: Observer<T>) {
		const upstreamObserver = new class extends Observer<T> {

			constructor(readonly milliseconds: number) {
				super();
			}

			override readonly onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);

			override onNext(item: T) {
				this.#doDelayed(downstreamObserver.onNext.bind(downstreamObserver, item));
			}

			override onError(error: unknown) {
				this.#doDelayed(downstreamObserver.onError.bind(downstreamObserver, error));
			}

			override onComplete() {
				this.#doDelayed(downstreamObserver.onComplete.bind(downstreamObserver));
			}

			#doDelayed(action: () => void) {
				setTimeout(() => action(), this.milliseconds);
			}
		}(this.milliseconds);

		this.upstream.subscribe(upstreamObserver);
	}
}

class NTakenObservable<T extends NotNullable> extends ObservableWithUpstream<T> {

	constructor(
		upstream: Observable<T>,
		readonly n: number,
	) {
		super(upstream);
	}

	protected subscribeActual(downstreamObserver: Observer<T>) {
		const upstreamObserver = new class extends ObserverWrapper<T> {

			#taken: number = 0;

			constructor(
				baseObserver: Observer<T>,
				readonly n: number,
			) {
				super(baseObserver);
			}

			override onNext(item: T) {
				if(this.#taken >= this.n) {
					return;
				}

				++this.#taken;
				super.onNext(item);
			}
		}(downstreamObserver, this.n);

		this.upstream.subscribe(upstreamObserver);
	}
}

class NSkippedObservable<T extends NotNullable> extends ObservableWithUpstream<T> {

	constructor(
		upstream: Observable<T>,
		readonly n: number,
	) {
		super(upstream);
	}

	protected subscribeActual(downstreamObserver: Observer<T>) {
		const upstreamObserver = new class extends ObserverWrapper<T> {

			#skipped: number = 0;

			constructor(
				baseObserver: Observer<T>,
				readonly n: number,
			) {
				super(baseObserver);
			}

			override onNext(item: T) {
				if(this.#skipped < this.n) {
					++this.#skipped;
					return;
				}

				super.onNext(item);
			}
		}(downstreamObserver, this.n);

		this.upstream.subscribe(upstreamObserver);
	}
}

class SortedObservable<T extends NotNullable> extends ObservableWithUpstream<T> {

	constructor(
		upstream: Observable<T>,
		readonly comparator: (itemA: T, itemB: T) => number,
	) {
		super(upstream);
	}

	protected override subscribeActual(downstreamObserver: Observer<T>) {
		const upstreamObserver = new class extends Observer<T> {

			readonly #array: T[] = [];

			constructor(readonly comparator: (itemA: T, itemB: T) => number) {
				super();
			}

			override readonly onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);

			override readonly onNext = this.#array.push.bind(this.#array);

			override readonly onError = downstreamObserver.onError.bind(downstreamObserver);

			override onComplete() {
				for(const item of this.#array.sort(this.comparator)) {
					downstreamObserver.onNext(item);
				}
			}
		}(this.comparator);

		this.upstream.subscribe(upstreamObserver);
	}
}

class IsEmptyObservable<T extends NotNullable> extends ObservableWithUpstream<T, boolean> {

	protected override subscribeActual(downstreamObserver: Observer<boolean>) {
		const upstreamObserver = new class extends Observer<T> {

			#empty: boolean = true;

			override readonly onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);

			override onNext() {
				this.#empty = false;
			}

			override readonly onError = downstreamObserver.onError.bind(downstreamObserver);

			override onComplete() {
				downstreamObserver.onNext(this.#empty);
			}
		};

		this.upstream.subscribe(upstreamObserver);
	}
}

class ActionOnEachItemObservable<T extends NotNullable> extends ObservableWithUpstream<T> {

	constructor(
		upstream: Observable<T>,
		readonly action: (item: T) => void,
	) {
		super(upstream);
	}

	protected override subscribeActual(downstreamObserver: Observer<T>) {
		const upstreamObserver = new class extends ObserverWrapper<T> {

			constructor(readonly action: (item: T) => void) {
				super(downstreamObserver);
			}

			override onNext(item: T) {
				try {
					this.action(item);
				} catch(error: unknown) {
					super.onError(error);
					return;
				}

				super.onNext(item);
			}
		}(this.action);

		this.upstream.subscribe(upstreamObserver);
	}
}

class ActionOnCancelObservable<T extends NotNullable> extends ObservableWithUpstream<T> {

	constructor(
		upstream: Observable<T>,
		readonly action: () => void,
	) {
		super(upstream);
	}

	protected override subscribeActual(downstreamObserver: Observer<T>) {
		const upstreamObserver = new class extends ObserverWrapper<T> {

			constructor(
				baseObserver: Observer<T>,
				readonly action: () => void,
			) {
				super(baseObserver);
			}

			override onSubscribe(subscription: Subscription) {
				super.onSubscribe(Subscription.ofAction(() => {
					subscription.cancel();
					this.action();
				}));
			}
		}(downstreamObserver, this.action);

		this.upstream.subscribe(upstreamObserver);
	}
}

class ToArrayObservable<T extends NotNullable> extends ObservableWithUpstream<T, T[]> {

	protected override subscribeActual(downstreamObserver: Observer<T[]>) {
		const upstreamObserver = new class extends Observer<T> {

			readonly #array: T[] = [];

			override readonly onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);

			override onNext(item: T) {
				this.#array.push(item);
			}

			override readonly onError = downstreamObserver.onError.bind(downstreamObserver);

			override onComplete() {
				downstreamObserver.onNext([...this.#array]);
				downstreamObserver.onComplete();
			}
		};

		this.upstream.subscribe(upstreamObserver);
	}
}

class ToSetObservable<T extends NotNullable> extends ObservableWithUpstream<T, Set<T>> {

	protected override subscribeActual(downstreamObserver: Observer<Set<T>>) {
		const upstreamObserver = new class extends Observer<T> {

			readonly #set: Set<T> = new Set();

			override readonly onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);

			override onNext(item: T) {
				this.#set.add(item);
			}

			override readonly onError = downstreamObserver.onError.bind(downstreamObserver);

			override onComplete() {
				downstreamObserver.onNext(new Set(this.#set));
				downstreamObserver.onComplete();
			}
		};

		this.upstream.subscribe(upstreamObserver);
	}
}
