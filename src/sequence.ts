type SequenceNextResult<T> = ({ done: false; element: T; } | { done: true; });

abstract class Sequence<T> {

	abstract next(): SequenceNextResult<T>;

	//#region factory functions

	static empty<T = never>(): Sequence<T> {
		return new EmptySequence();
	}

	//#region from*

	static fromArray<T>(array: readonly T[]): Sequence<T> {
		return new SequenceFromArray(array);
	}

	static from<T>(...elements: readonly [T, ...T[]]): Sequence<T> {
		return new SequenceFromArray(elements);
	}

	static fromIterator<T>(iterator: Iterator<T>): Sequence<T> {
		return new SequenceFromIterator(iterator);
	}

	static fromIterable<T>(iterable: Iterable<T>): Sequence<T> {
		return new SequenceFromIterable(iterable);
	}

	//#endregion

	//#region merge*

	static mergeFromSequence<T>(sequencesSequence: Sequence<Sequence<T>>): Sequence<T> {
		return new MergedSequence(sequencesSequence);
	}

	static mergeFromArray<T>(sequences: readonly Sequence<T>[]): Sequence<T> {
		return this.mergeFromSequence(Sequence.fromArray(sequences));
	}

	static merge<T>(...sequences: readonly [Sequence<T>, ...Sequence<T>[]]) {
		return this.mergeFromSequence(Sequence.fromArray(sequences));
	}

	static mergeFromIterator<T>(iterator: Iterator<Sequence<T>>): Sequence<T> {
		return Sequence.mergeFromSequence(Sequence.fromIterator(iterator));
	}

	static mergeIterators<T>(...iterators: readonly [Iterator<Sequence<T>>, Iterator<Sequence<T>>, ...Iterator<Sequence<T>>[]]): Sequence<T> {
		return Sequence
			.fromArray(iterators)
			.flatMap(Sequence.fromIterator)
			.flatten();
	}

	static mergeFromIterable<T>(iterable: Iterable<Sequence<T>>): Sequence<T> {
		return Sequence.mergeFromSequence(Sequence.fromIterable(iterable));
	}

	static mergeIterables<T>(...iterables: readonly [Iterable<Sequence<T>>, Iterable<Sequence<T>>, ...Iterable<Sequence<T>>[]]) {
		return Sequence
			.fromArray(iterables)
			.flatMap(Sequence.fromIterable)
			.flatten();
	}

	//#endregion

	//#endregion

	filter(predicate: (element: T) => boolean): Sequence<T> {
		return new FilteredSequence(this, predicate);
	}

	map<R>(mapper: (element: T) => R): Sequence<R> {
		return new MappedSequence(this, mapper);
	}

	flatMap<R>(mapper: (element: T) => Sequence<R>): Sequence<R> {
		return new FlatMappedSequence(this, mapper);
	}

	flatten<T>(this: Sequence<Sequence<T>>): Sequence<T> {
		return new FlattenedSequence(this);
	}

	sort(comparator: (elementA: T, elementB: T) => number): Sequence<T> {
		return new SortedSequence(this, comparator);
	}

	onEach(action: (element: T) => void): Sequence<T> {
		return new ActionOnEachElementSequence(this, action);
	}

	forEach(action: (element: T) => void): void {
		let result: SequenceNextResult<T>;
		do {
			// eslint-disable-next-line prefer-const
			result = this.next();

			if(!(result.done)) {
				action(result.element);
			}

		} while(!(result.done));
	}

	wait() {
		let result: SequenceNextResult<T>;

		do {
			// eslint-disable-next-line prefer-const
			result = this.next();
		} while(!(result.done));
	}

	asIterator(): Iterator<T> {
		return new SequenceAsIterator(this);
	}

	asIterable(): Iterable<T> {
		return new SequenceAsIterable(this);
	}

	toArray(destination: T[] = []): T[] {
		this.forEach(destination.push.bind(destination));
		return destination;
	}

	toSet(destination: Set<T> = new Set()): Set<T> {
		this.forEach(destination.add.bind(destination));
		return destination;
	}
}

class EmptySequence extends Sequence<never> {

	next(): SequenceNextResult<never> {
		return { done: true };
	}
}

class SequenceFromArray<T> extends Sequence<T> {

	#index: number = 0;

	constructor(
		readonly array: readonly T[],
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		if(this.#index >= this.array.length) {
			return { done: true };
		}

		const element: T = this.array[this.#index];

		++this.#index;

		return { done: false, element };
	}
}

class SequenceFromIterator<T> extends Sequence<T> {

	constructor(
		readonly iterator: Iterator<T>,
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		const result: IteratorResult<T> = this.iterator.next();

		if(result.done) {
			return { done: true };
		}

		return { done: false, element: result.value };
	}
}

class SequenceFromIterable<T> extends SequenceFromIterator<T> {

	constructor(
		iterable: Iterable<T>,
	) {
		super(iterable[Symbol.iterator]());
	}
}

class MergedSequence<T> extends Sequence<T> {

	#currentSequence: (Sequence<T> | null) = null;

	constructor(
		readonly sequencesSequence: Sequence<Sequence<T>>,
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		if(this.#currentSequence instanceof Sequence) {
			const result: SequenceNextResult<T> = this.#currentSequence.next();

			if(!(result.done)) {
				return result;
			}
		}

		const result: SequenceNextResult<Sequence<T>> = this.sequencesSequence.next();

		if(result.done) {
			return result;
		}

		this.#currentSequence = result.element;
		return this.next();
	}
}

class FilteredSequence<T> extends Sequence<T> {

	constructor(
		readonly source: Sequence<T>,
		readonly predicate: (element: T) => boolean,
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		const result: SequenceNextResult<T> = this.source.next();

		if(result.done || this.predicate(result.element)) {
			return result;
		}

		return this.next();
	}
}

class MappedSequence<T, R> extends Sequence<R> {

	constructor(
		readonly source: Sequence<T>,
		readonly mapper: (element: T) => R,
	) {
		super();
	}

	next(): SequenceNextResult<R> {
		const sourceResult: SequenceNextResult<T> = this.source.next();

		if(sourceResult.done) {
			return sourceResult;
		}

		const mappedElement: R = this.mapper(sourceResult.element);
		return { done: false, element: mappedElement };
	}
}

class FlatMappedSequence<T, R> extends Sequence<R> {

	#currentSequence: (Sequence<R> | null) = null;

	constructor(
		readonly source: Sequence<T>,
		readonly mapper: (element: T) => Sequence<R>,
	) {
		super();
	}

	next(): SequenceNextResult<R> {
		if(this.#currentSequence instanceof Sequence) {
			const result: SequenceNextResult<R> = this.#currentSequence.next();

			if(!(result.done)) {
				return result;
			}
		}

		const sourceResult: SequenceNextResult<T> = this.source.next();

		if(sourceResult.done) {
			return sourceResult;
		}

		this.#currentSequence = this.mapper(sourceResult.element);
		return this.next();
	}
}

class FlattenedSequence<T> extends Sequence<T> {

	#currentSequence: (Sequence<T> | null) = null;

	constructor(
		readonly source: Sequence<Sequence<T>>,
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		if(this.#currentSequence instanceof Sequence) {
			const result: SequenceNextResult<T> = this.#currentSequence.next();

			if(!(result.done)) {
				return result;
			}
		}

		const sourceResult: SequenceNextResult<Sequence<T>> = this.source.next();

		if(sourceResult.done) {
			return sourceResult;
		}

		this.#currentSequence = sourceResult.element;
		return this.next();
	}
}

class SortedSequence<T> extends Sequence<T> {

	#sortedArray: readonly T[] = [];
	#index: number = -1;

	constructor(
		readonly source: Sequence<T>,
		readonly comparator: (elementA: T, elementB: T) => number,
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		if(this.#index < 0) {
			this.#sortedArray = this.source
				.toArray()
				.sort(this.comparator);

			this.#index = 0;
		}

		if(this.#index >= this.#sortedArray.length) {
			return { done: true };
		}

		const element: T = this.#sortedArray[this.#index];

		++this.#index;

		return { done: false, element };
	}
}

class ActionOnEachElementSequence<T> extends Sequence<T> {

	constructor(
		readonly source: Sequence<T>,
		readonly action: (element: T) => void,
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		const result: SequenceNextResult<T> = this.source.next();

		if(!(result.done)) {
			this.action(result.element);
		}

		return result;
	}
}

class SequenceAsIterator<T> implements Iterator<T, undefined, unknown> {

	constructor(
		readonly sequence: Sequence<T>,
	) {
		// eslint-disable-next-line no-empty-function
	}

	next(): IteratorResult<T, undefined> {
		const result: SequenceNextResult<T> = this.sequence.next();

		if(result.done) {
			return { done: true, value: undefined };
		}

		return { done: false, value: result.element };
	}
}

class SequenceAsIterable<T> implements Iterable<T> {

	constructor(
		readonly sequence: Sequence<T>,
	) {
		// eslint-disable-next-line no-empty-function
	}

	[Symbol.iterator](): Iterator<T, undefined, unknown> {
		return new SequenceAsIterator(this.sequence);
	}
}
