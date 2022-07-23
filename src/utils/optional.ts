/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

type ignored = unknown;

// eslint-disable-next-line @typescript-eslint/ban-types
type NotNullable = {};

interface OptionalBase<T extends NotNullable> {
	isPresent(): this is PresentOptional<T>;
	isEmpty(): this is EmptyOptional;

	get(): (T | never);
	getOrDefault<U extends NotNullable>(defaultValue: U): (T | U);
	getOrThrow(errorSupplier: () => unknown): (T | never);
	getOrElse<U extends NotNullable>(defaultValueSupplier: () => U): (T | U);

	ifPresent(action: (value: T) => void): void;
	ifPresentOrElse(presentAction: (value: T) => void, emptyAction: () => void): void;
	ifEmpty(action: () => void): void;

	orDefault<U extends NotNullable>(defaultOptional: Optional<U>): (Optional<T> | Optional<U>);
	orElse<U extends NotNullable>(defaultOptionalSupplier: () => Optional<U>): (Optional<T> | Optional<U>);

	map<R extends NotNullable>(mapper: (value: T) => R): Optional<R>;
	mapNullable<R extends NotNullable>(mapper: (value: T) => (R | null | undefined)): Optional<R>;
	flatMap<R extends NotNullable>(mapper: (value: T) => Optional<R>): Optional<R>;

	filter(predicate: (value: T) => boolean): Optional<T>;
	filterOut(predicate: (value: T) => boolean): Optional<T>;
}

interface PresentOptional<T extends NotNullable> extends OptionalBase<T> {
	readonly value: T;

	isPresent(): this is PresentOptional<T>;
	isEmpty(): this is never;

	get(): T;
	getOrDefault(defaultValue?: ignored): T;
	getOrThrow(errorSupplier?: ignored): T;
	getOrElse(defaultValueSupplier?: ignored): T;

	ifPresent(action: (value: T) => void): void;
	ifPresentOrElse(presentAction: (value: T) => void, emptyAction?: ignored): void;
	ifEmpty(action?: ignored): void;

	orDefault(defaultOptional?: ignored): Optional<T>;
	orElse(defaultOptionalSupplier?: ignored): Optional<T>;

	map<R extends NotNullable>(mapper: (value: T) => R): PresentOptional<R>;
	mapNullable<R extends NotNullable>(mapper: (value: T) => (R | null | undefined)): Optional<R>;
	flatMap<R extends NotNullable>(mapper: (value: T) => Optional<R>): Optional<R>;

	filter(predicate: (value: T) => boolean): Optional<T>;
	filterOut(predicate: (value: T) => boolean): Optional<T>;
}

interface EmptyOptional extends OptionalBase<never> {
	isPresent(): this is never;
	isEmpty(): this is EmptyOptional;

	get(): never;
	getOrDefault<U extends NotNullable>(defaultValue: U): U;
	getOrThrow(errorSupplier: () => unknown): never;
	getOrElse<U extends NotNullable>(defaultValueSupplier: () => U): U;

	ifPresent(action?: (value: never) => void): void;
	ifPresentOrElse(presentAction: (((value: never) => void) | ignored), emptyAction: () => void): void;
	ifEmpty(action: () => void): void;

	orDefault<U extends NotNullable>(defaultOptional: Optional<U>): Optional<U>;
	orElse<U extends NotNullable>(defaultOptionalSupplier: () => Optional<U>): Optional<U>;

	map(mapper?: (value: never) => ignored): EmptyOptional;
	mapNullable(mapper?: (value: never) => ignored): EmptyOptional;
	flatMap(mapper?: (value: never) => ignored): EmptyOptional;

	filter(predicate?: (value: never) => boolean): EmptyOptional;
	filterOut(predicate?: (value: never) => boolean): EmptyOptional;
}

type Optional<T extends NotNullable> = (PresentOptional<T> | EmptyOptional);

namespace Optional {
	class EmptyOptionalImpl implements EmptyOptional {

		isPresent(): false {
			return false;
		}

		isEmpty(): true {
			return true;
		}

		//#region get*

		get(): never {
			throw new Error("Empty optional");
		}

		getOrDefault<U extends NotNullable>(defaultValue: U): U {
			return defaultValue;
		}

		getOrThrow(errorSupplier: () => unknown): never {
			throw errorSupplier();
		}

		getOrElse<U extends NotNullable>(defaultValueSupplier: () => U): U {
			return defaultValueSupplier();
		}

		//#endregion

		//#region if*

		ifPresent() {
			// eslint-disable-next-line no-empty-function
		}

		ifPresentOrElse(_presentAction: ignored, emptyAction: () => void) {
			emptyAction();
		}

		ifEmpty(action: () => void) {
			action();
		}

		//#endregion

		orDefault<U extends NotNullable>(defaultOptional: Optional<U>): Optional<U> {
			return defaultOptional;
		}

		orElse<U extends NotNullable>(defaultOptionalSupplier: () => Optional<U>): Optional<U> {
			return defaultOptionalSupplier();
		}

		//#region mapping

		map(): EmptyOptional {
			return this;
		}

		mapNullable(): EmptyOptional {
			return this;
		}

		flatMap(): EmptyOptional {
			return this;
		}

		//#endregion

		filter(): EmptyOptional {
			return this;
		}

		filterOut(): EmptyOptional {
			return this;
		}
	}

	class PresentOptionalImpl<T> implements PresentOptional<T> {

		constructor(
			readonly value: T,
		) {
			// eslint-disable-next-line no-empty-function
		}

		isPresent(): true {
			return true;
		}

		isEmpty(): false {
			return false;
		}

		//#region get*

		get(): T {
			return this.value;
		}

		getOrDefault(): T {
			return this.value;
		}

		getOrThrow(): T {
			return this.value;
		}

		getOrElse(): T {
			return this.value;
		}

		//#endregion

		//#region if*

		ifPresent(action: (value: T) => void) {
			action(this.value);
		}

		ifPresentOrElse(presentAction: (value: T) => void) {
			presentAction(this.value);
		}

		ifEmpty() {
			// eslint-disable-next-line no-empty-function
		}

		//#endregion

		orDefault(): Optional<T> {
			return this;
		}

		orElse(): Optional<T> {
			return this;
		}

		//#region mapping

		map<R extends NotNullable>(mapper: (value: T) => R): PresentOptional<R> {
			return new PresentOptionalImpl(mapper(this.value));
		}

		mapNullable<R extends NotNullable>(mapper: (value: T) => (R | null | undefined)): Optional<R> {
			return Optional.ofNullable(mapper(this.value));
		}

		flatMap<R extends NotNullable>(mapper: (value: T) => Optional<R>): Optional<R> {
			return mapper(this.value);
		}

		//#endregion

		filter(predicate: (value: T) => boolean): Optional<T> {
			if(predicate(this.value)) {
				return this;
			}

			return new EmptyOptionalImpl();
		}

		filterOut(predicate: (value: T) => boolean): Optional<T> {
			return this.filter((value: T) => !(predicate(value)));
		}
	}

	export function empty<T extends NotNullable = never>(): Optional<T> {
		return new EmptyOptionalImpl();
	}

	export function of<T extends NotNullable>(value: T): Optional<T> {
		return new PresentOptionalImpl(value);
	}

	export function ofNullable<T extends NotNullable>(value: (T | null | undefined)): Optional<T> {
		if((value !== null) && (typeof(value) !== "undefined")) {
			return of(value);
		} else {
			return empty();
		}
	}
}
