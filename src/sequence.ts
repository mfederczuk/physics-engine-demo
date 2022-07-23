/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

type SequenceNextResult<T extends NotNullable> = ({ done: false; element: T; } | { done: true; });

interface SequenceAttributes {
	neverDone: boolean;
}

abstract class Sequence<T extends NotNullable> {

	abstract next(): SequenceNextResult<T>;

	abstract getAttributes(): SequenceAttributes;

	//#region factory functions

	static empty<T extends NotNullable = never>(): Sequence<T> {
		return new EmptySequence();
	}

	static generate<T extends NotNullable>(n: number, generator: (index: number) => T): Sequence<T> {
		return new GeneratedSequence(generator, n);
	}

	static generateForever<T extends NotNullable>(generator: (index: number) => T): Sequence<T> {
		return this.generate(Infinity, generator);
	}

	static repeatElement<T extends NotNullable>(element: T, n: number): Sequence<T> {
		return this.generate(n, () => (element));
	}

	static repeatElementForever<T extends NotNullable>(element: T): Sequence<T> {
		return this.generateForever(() => (element));
	}

	static intRange(begin: number, exclusiveEnd: number): Sequence<number> {
		return new IntRangeSequence(Math.floor(begin), Math.floor(exclusiveEnd));
	}

	//#region from*

	static fromArray<T extends NotNullable>(array: readonly T[]): Sequence<T> {
		return new SequenceFromArray(array);
	}

	static from<T extends NotNullable>(...elements: readonly [T, ...T[]]): Sequence<T> {
		return new SequenceFromArray(elements);
	}

	static fromIterator<T extends NotNullable>(iterator: Iterator<T>): Sequence<T> {
		return new SequenceFromIterator(iterator);
	}

	static fromIterable<T extends NotNullable>(iterable: Iterable<T>): Sequence<T> {
		return new SequenceFromIterable(iterable);
	}

	//#endregion

	//#region merge*

	static mergeFromSequence<T extends NotNullable>(sequencesSequence: Sequence<Sequence<T>>): Sequence<T> {
		return new MergedSequence(sequencesSequence);
	}

	static mergeFromArray<T extends NotNullable>(sequences: readonly Sequence<T>[]): Sequence<T> {
		return this.mergeFromSequence(Sequence.fromArray(sequences));
	}

	static merge<T extends NotNullable>(...sequences: readonly [Sequence<T>, ...Sequence<T>[]]) {
		return this.mergeFromSequence(Sequence.fromArray(sequences));
	}

	static mergeFromIterator<T extends NotNullable>(iterator: Iterator<Sequence<T>>): Sequence<T> {
		return Sequence.mergeFromSequence(Sequence.fromIterator(iterator));
	}

	static mergeIterators<T extends NotNullable>(...iterators: readonly [Iterator<Sequence<T>>, Iterator<Sequence<T>>, ...Iterator<Sequence<T>>[]]): Sequence<T> {
		return Sequence
			.fromArray(iterators)
			.flatMap(Sequence.fromIterator)
			.flatten();
	}

	static mergeFromIterable<T extends NotNullable>(iterable: Iterable<Sequence<T>>): Sequence<T> {
		return Sequence.mergeFromSequence(Sequence.fromIterable(iterable));
	}

	static mergeIterables<T extends NotNullable>(...iterables: readonly [Iterable<Sequence<T>>, Iterable<Sequence<T>>, ...Iterable<Sequence<T>>[]]) {
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

	map<R extends NotNullable>(mapper: (element: T) => R): Sequence<R> {
		return new MappedSequence(this, mapper);
	}

	flatMap<R extends NotNullable>(mapper: (element: T) => Sequence<R>): Sequence<R> {
		return new FlatMappedSequence(this, mapper);
	}

	flatten<T extends NotNullable>(this: Sequence<Sequence<T>>): Sequence<T> {
		return new FlattenedSequence(this);
	}

	take(n: number): Sequence<T> {
		return new NTakenSequence(this, n);
	}

	skip(n: number): Sequence<T> {
		return new NSkippedSequence(this, n);
	}

	sort(comparator: (elementA: T, elementB: T) => number): Sequence<T> {
		return new SortedSequence(this, comparator);
	}

	isEmpty(): Sequence<boolean> {
		return new IsEmptySequence(this);
	}

	isNotEmpty(): Sequence<boolean> {
		return this
			.isEmpty()
			.map((empty) => (!empty));
	}

	onEach(action: (element: T) => void): Sequence<T> {
		return new ActionOnEachElementSequence(this, action);
	}

	hide(hideAttributes: boolean = false): Sequence<T> {
		if(hideAttributes) {
			return new class extends SequenceWithSource<T> {

				constructor(
					source: Sequence<T>,
				) {
					super(source);
				}

				next(): SequenceNextResult<T> {
					return this.source.next();
				}

				getAttributes(): SequenceAttributes {
					return {
						neverDone: false,
					};
				}
			}(this);
		} else {
			return new class extends SequenceWithSource<T> {

				constructor(
					source: Sequence<T>,
				) {
					super(source);
				}

				next(): SequenceNextResult<T> {
					return this.source.next();
				}

				getAttributes(): SequenceAttributes {
					return super.getAttributes();
				}
			}(this);
		}
	}

	//#region wait*

	wait(): (void | never) {
		this.#neverDoneGuard();

		while(!(this.next().done));
	}

	waitForEach(action: (element: T) => void): (void | never) {
		this.#neverDoneGuard();

		let result: SequenceNextResult<T>;
		do {
			// eslint-disable-next-line prefer-const
			result = this.next();

			if(!(result.done)) {
				action(result.element);
			}

		} while(!(result.done));
	}

	#neverDoneGuard(): (void | never) {
		const { neverDone }: SequenceAttributes = this.getAttributes();

		if(neverDone) {
			throw new Error("Refusing to wait for done on a sequence that never will be done");
		}
	}

	//#region waitForFirst*

	waitForFirstOptional(): Optional<T> {
		const result: SequenceNextResult<T> = this.next();

		if(result.done) {
			return Optional.empty();
		}

		return Optional.of(result.element);
	}

	waitForFirst(): (T | never) {
		return this.waitForFirstOptional()
			.getOrThrow(() => new Error("Empty sequence"));
	}

	waitForFirstOrDefault<U extends NotNullable>(defaultValue: U): (T | U | never) {
		return this.waitForFirstOptional()
			.getOrDefault(defaultValue);
	}

	waitForFirstOrElse<U extends NotNullable>(defaultValueSupplier: () => U): (T | U | never) {
		return this.waitForFirstOptional()
			.getOrElse(defaultValueSupplier);
	}

	//#endregion

	//#region waitForFirst*

	waitForSingleOptional(): (Optional<T> | never) {
		let result: SequenceNextResult<T> = this.next();

		if(result.done) {
			return Optional.empty();
		}

		const element: T = result.element;

		result = this.next();

		if(result.done) {
			return Optional.of(element);
		}

		throw new Error("Multiple elements in sequence");
	}

	waitForSingle(): (T | never) {
		return this.waitForSingleOptional()
			.getOrThrow(() => new Error("Empty sequence"));
	}

	waitForSingleOrDefault<U extends NotNullable>(defaultValue: U): (T | U | never) {
		return this.waitForSingleOptional()
			.getOrDefault(defaultValue);
	}

	waitForSingleOrElse<U>(defaultValueSupplier: () => U): (T | U | never) {
		return this.waitForSingleOptional()
			.getOrElse(defaultValueSupplier);
	}

	//#endregion

	//#endregion

	asIterator(): Iterator<T> {
		return new SequenceAsIterator(this);
	}

	asIterable(): Iterable<T> {
		return new SequenceAsIterable(this);
	}

	toArray(destination: T[] = []): T[] {
		this.waitForEach(destination.push.bind(destination));
		return destination;
	}

	toSet(destination: Set<T> = new Set()): Set<T> {
		this.waitForEach(destination.add.bind(destination));
		return destination;
	}
}

class EmptySequence extends Sequence<never> {

	next(): SequenceNextResult<never> {
		return { done: true };
	}

	getAttributes(): SequenceAttributes {
		return {
			neverDone: false,
		};
	}
}

class GeneratedSequence<T extends NotNullable> extends Sequence<T> {

	#currentIndex: number = 0;

	constructor(
		readonly generator: (index: number) => T,
		readonly n: number,
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		if(this.#currentIndex >= this.n) {
			return { done: true };
		}

		const element: T = this.generator(this.#currentIndex);

		++this.#currentIndex;

		return { done: false, element };
	}

	getAttributes(): SequenceAttributes {
		return {
			neverDone: !(Number.isFinite(this.n)),
		};
	}
}

class IntRangeSequence extends Sequence<number> {

	#current: number;

	constructor(
		begin: number,
		readonly exclusiveEnd: number,
	) {
		super();

		this.#current = begin;
	}

	next(): SequenceNextResult<number> {
		if(this.#current >= this.exclusiveEnd) {
			return { done: true };
		}

		const next: number = this.#current;

		++this.#current;

		return { done: false, element: next };
	}

	getAttributes(): SequenceAttributes {
		return {
			neverDone: (!(Number.isFinite(this.exclusiveEnd)) && Number.isFinite(this.#current)),
		};
	}
}

class SequenceFromArray<T extends NotNullable> extends Sequence<T> {

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

	getAttributes(): SequenceAttributes {
		return {
			neverDone: !(Number.isFinite(this.array.length)),
		};
	}
}

class SequenceFromIterator<T extends NotNullable> extends Sequence<T> {

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

	getAttributes(): SequenceAttributes {
		return {
			neverDone: false,
		};
	}
}

class SequenceFromIterable<T extends NotNullable> extends SequenceFromIterator<T> {

	constructor(
		iterable: Iterable<T>,
	) {
		super(iterable[Symbol.iterator]());
	}
}

class MergedSequence<T extends NotNullable> extends Sequence<T> {

	#currentSequence: Optional<Sequence<T>> = Optional.empty();

	constructor(
		readonly sequencesSequence: Sequence<Sequence<T>>,
	) {
		super();
	}

	next(): SequenceNextResult<T> {
		if(this.#currentSequence.isPresent()) {
			const result: SequenceNextResult<T> = this.#currentSequence.value.next();

			if(!(result.done)) {
				return result;
			}
		}

		const result: SequenceNextResult<Sequence<T>> = this.sequencesSequence.next();

		if(result.done) {
			return result;
		}

		this.#currentSequence = Optional.of(result.element);
		return this.next();
	}

	getAttributes(): SequenceAttributes {
		return this.sequencesSequence.getAttributes();
	}
}

abstract class SequenceWithSource<T extends NotNullable, R extends NotNullable = T> extends Sequence<R> {

	constructor(
		readonly source: Sequence<T>,
	) {
		super();
	}

	getAttributes(): SequenceAttributes {
		return this.source.getAttributes();
	}
}

class FilteredSequence<T extends NotNullable> extends SequenceWithSource<T> {

	constructor(
		source: Sequence<T>,
		readonly predicate: (element: T) => boolean,
	) {
		super(source);
	}

	next(): SequenceNextResult<T> {
		const result: SequenceNextResult<T> = this.source.next();

		if(result.done || this.predicate(result.element)) {
			return result;
		}

		return this.next();
	}
}

class MappedSequence<T extends NotNullable, R extends NotNullable> extends SequenceWithSource<T, R> {

	constructor(
		source: Sequence<T>,
		readonly mapper: (element: T) => R,
	) {
		super(source);
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

class FlatMappedSequence<T extends NotNullable, R extends NotNullable> extends SequenceWithSource<T, R> {

	#currentSequence: Optional<Sequence<R>> = Optional.empty();

	constructor(
		source: Sequence<T>,
		readonly mapper: (element: T) => Sequence<R>,
	) {
		super(source);
	}

	next(): SequenceNextResult<R> {
		if(this.#currentSequence.isPresent()) {
			const result: SequenceNextResult<R> = this.#currentSequence.value.next();

			if(!(result.done)) {
				return result;
			}
		}

		const sourceResult: SequenceNextResult<T> = this.source.next();

		if(sourceResult.done) {
			return sourceResult;
		}

		this.#currentSequence = Optional.of(this.mapper(sourceResult.element));
		return this.next();
	}
}

class FlattenedSequence<T extends NotNullable> extends SequenceWithSource<Sequence<T>, T> {

	#currentSequence: Optional<Sequence<T>> = Optional.empty();

	constructor(
		source: Sequence<Sequence<T>>,
	) {
		super(source);
	}

	next(): SequenceNextResult<T> {
		if(this.#currentSequence.isPresent()) {
			const result: SequenceNextResult<T> = this.#currentSequence.value.next();

			if(!(result.done)) {
				return result;
			}
		}

		const sourceResult: SequenceNextResult<Sequence<T>> = this.source.next();

		if(sourceResult.done) {
			return sourceResult;
		}

		this.#currentSequence = Optional.of(sourceResult.element);
		return this.next();
	}
}

class NTakenSequence<T extends NotNullable> extends SequenceWithSource<T> {

	#taken: number = 0;

	constructor(
		source: Sequence<T>,
		readonly n: number,
	) {
		super(source);
	}

	next(): SequenceNextResult<T> {
		if(this.#taken >= this.n) {
			return { done: true };
		}

		const sourceResult: SequenceNextResult<T> = this.source.next();

		if(!(sourceResult.done)) {
			++this.#taken;
		}

		return sourceResult;
	}

	getAttributes(): SequenceAttributes {
		const sourceAttributes: SequenceAttributes = super.getAttributes();
		return {
			...(sourceAttributes),
			neverDone: ((sourceAttributes.neverDone ?? false) && !(Number.isFinite(this.n))),
		};
	}
}

class NSkippedSequence<T extends NotNullable> extends SequenceWithSource<T> {

	#skipped: number = 0;

	constructor(
		source: Sequence<T>,
		readonly n: number,
	) {
		super(source);
	}

	next(): SequenceNextResult<T> {
		const sourceResult: SequenceNextResult<T> = this.source.next();

		if(sourceResult.done) {
			return sourceResult;
		}

		if(this.#skipped < this.n) {
			++this.#skipped;
			return this.next();
		}

		return sourceResult;
	}
}

class SortedSequence<T extends NotNullable> extends SequenceWithSource<T> {

	#sortedArray: readonly T[] = [];
	#index: number = -1;

	constructor(
		source: Sequence<T>,
		readonly comparator: (elementA: T, elementB: T) => number,
	) {
		super(source);
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

class IsEmptySequence<T extends NotNullable> extends SequenceWithSource<T, boolean> {

	#done: boolean = false;

	next(): SequenceNextResult<boolean> {
		if(this.#done) {
			return { done: true };
		}

		const sourceResult: SequenceNextResult<T> = this.source.next();

		if(sourceResult.done) {
			return { done: false, element: true };
		}

		return { done: false, element: false };
	}

	getAttributes(): SequenceAttributes {
		return {
			...(super.getAttributes()),
			neverDone: false,
		};
	}
}

class ActionOnEachElementSequence<T extends NotNullable> extends SequenceWithSource<T> {

	constructor(
		source: Sequence<T>,
		readonly action: (element: T) => void,
	) {
		super(source);
	}

	next(): SequenceNextResult<T> {
		const result: SequenceNextResult<T> = this.source.next();

		if(!(result.done)) {
			this.action(result.element);
		}

		return result;
	}
}

class SequenceAsIterator<T extends NotNullable> implements Iterator<T, undefined, unknown> {

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

class SequenceAsIterable<T extends NotNullable> implements Iterable<T> {

	constructor(
		readonly sequence: Sequence<T>,
	) {
		// eslint-disable-next-line no-empty-function
	}

	[Symbol.iterator](): Iterator<T, undefined, unknown> {
		return new SequenceAsIterator(this.sequence);
	}
}
