"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Sequence_instances, _Sequence_neverDoneGuard, _GeneratedSequence_currentIndex, _IntRangeSequence_current, _SequenceFromArray_index, _MergedSequence_currentSequence, _FlatMappedSequence_currentSequence, _FlattenedSequence_currentSequence, _NTakenSequence_taken, _NSkippedSequence_skipped, _SortedSequence_sortedArray, _SortedSequence_index, _IsEmptySequence_done;
class Sequence {
    constructor() {
        _Sequence_instances.add(this);
    }
    //#region factory functions
    static empty() {
        return new EmptySequence();
    }
    static generate(n, generator) {
        return new GeneratedSequence(generator, n);
    }
    static generateForever(generator) {
        return this.generate(Infinity, generator);
    }
    static repeatElement(element, n) {
        return this.generate(n, () => (element));
    }
    static repeatElementForever(element) {
        return this.generateForever(() => (element));
    }
    static intRange(begin, exclusiveEnd) {
        return new IntRangeSequence(Math.floor(begin), Math.floor(exclusiveEnd));
    }
    //#region from*
    static fromArray(array) {
        return new SequenceFromArray(array);
    }
    static from(...elements) {
        return new SequenceFromArray(elements);
    }
    static fromIterator(iterator) {
        return new SequenceFromIterator(iterator);
    }
    static fromIterable(iterable) {
        return new SequenceFromIterable(iterable);
    }
    //#endregion
    //#region merge*
    static mergeFromSequence(sequencesSequence) {
        return new MergedSequence(sequencesSequence);
    }
    static mergeFromArray(sequences) {
        return this.mergeFromSequence(Sequence.fromArray(sequences));
    }
    static merge(...sequences) {
        return this.mergeFromSequence(Sequence.fromArray(sequences));
    }
    static mergeFromIterator(iterator) {
        return Sequence.mergeFromSequence(Sequence.fromIterator(iterator));
    }
    static mergeIterators(...iterators) {
        return Sequence
            .fromArray(iterators)
            .flatMap(Sequence.fromIterator)
            .flatten();
    }
    static mergeFromIterable(iterable) {
        return Sequence.mergeFromSequence(Sequence.fromIterable(iterable));
    }
    static mergeIterables(...iterables) {
        return Sequence
            .fromArray(iterables)
            .flatMap(Sequence.fromIterable)
            .flatten();
    }
    //#endregion
    //#endregion
    filter(predicate) {
        return new FilteredSequence(this, predicate);
    }
    map(mapper) {
        return new MappedSequence(this, mapper);
    }
    flatMap(mapper) {
        return new FlatMappedSequence(this, mapper);
    }
    flatten() {
        return new FlattenedSequence(this);
    }
    take(n) {
        return new NTakenSequence(this, n);
    }
    skip(n) {
        return new NSkippedSequence(this, n);
    }
    sort(comparator) {
        return new SortedSequence(this, comparator);
    }
    isEmpty() {
        return new IsEmptySequence(this);
    }
    isNotEmpty() {
        return this
            .isEmpty()
            .map((empty) => (!empty));
    }
    onEach(action) {
        return new ActionOnEachElementSequence(this, action);
    }
    hide(hideAttributes = false) {
        if (hideAttributes) {
            return new class extends SequenceWithSource {
                constructor(source) {
                    super(source);
                }
                next() {
                    return this.source.next();
                }
                getAttributes() {
                    return {
                        neverDone: false,
                    };
                }
            }(this);
        }
        else {
            return new class extends SequenceWithSource {
                constructor(source) {
                    super(source);
                }
                next() {
                    return this.source.next();
                }
                getAttributes() {
                    return super.getAttributes();
                }
            }(this);
        }
    }
    //#region wait*
    wait() {
        __classPrivateFieldGet(this, _Sequence_instances, "m", _Sequence_neverDoneGuard).call(this);
        while (!(this.next().done))
            ;
    }
    waitForEach(action) {
        __classPrivateFieldGet(this, _Sequence_instances, "m", _Sequence_neverDoneGuard).call(this);
        let result;
        do {
            // eslint-disable-next-line prefer-const
            result = this.next();
            if (!(result.done)) {
                action(result.element);
            }
        } while (!(result.done));
    }
    //#region first*
    waitForFirstOrElse(defaultValueSupplier) {
        const result = this.next();
        if (result.done) {
            return defaultValueSupplier();
        }
        return result.element;
    }
    waitForFirstOrDefault(defaultValue) {
        return this.waitForFirstOrElse(() => (defaultValue));
    }
    waitForFirst() {
        return this.waitForFirstOrElse(() => { throw new Error("Empty sequence"); });
    }
    waitForFirstOrNull() {
        return this.waitForFirstOrDefault(null);
    }
    waitForFirstOrUndefined() {
        return this.waitForFirstOrDefault(undefined);
    }
    //#endregion
    //#region single*
    waitForSingleOrElse(defaultValueSupplier) {
        let result = this.next();
        if (result.done) {
            return defaultValueSupplier();
        }
        const element = result.element;
        result = this.next();
        if (result.done) {
            return element;
        }
        throw new Error("Multiple elements in sequence");
    }
    waitForSingleOrDefault(defaultValue) {
        return this.waitForSingleOrElse(() => (defaultValue));
    }
    waitForSingle() {
        return this.waitForSingleOrElse(() => { throw new Error("Empty sequence"); });
    }
    waitForSingleOrNull() {
        return this.waitForSingleOrDefault(null);
    }
    waitForSingleOrUndefined() {
        return this.waitForSingleOrDefault(undefined);
    }
    //#endregion
    //#endregion
    asIterator() {
        return new SequenceAsIterator(this);
    }
    asIterable() {
        return new SequenceAsIterable(this);
    }
    toArray(destination = []) {
        this.waitForEach(destination.push.bind(destination));
        return destination;
    }
    toSet(destination = new Set()) {
        this.waitForEach(destination.add.bind(destination));
        return destination;
    }
}
_Sequence_instances = new WeakSet(), _Sequence_neverDoneGuard = function _Sequence_neverDoneGuard() {
    const { neverDone } = this.getAttributes();
    if (neverDone) {
        throw new Error("Refusing to wait for done on a sequence that never will be done");
    }
};
class EmptySequence extends Sequence {
    next() {
        return { done: true };
    }
    getAttributes() {
        return {
            neverDone: false,
        };
    }
}
class GeneratedSequence extends Sequence {
    constructor(generator, n) {
        super();
        this.generator = generator;
        this.n = n;
        _GeneratedSequence_currentIndex.set(this, 0);
    }
    next() {
        var _a;
        if (__classPrivateFieldGet(this, _GeneratedSequence_currentIndex, "f") >= this.n) {
            return { done: true };
        }
        const element = this.generator(__classPrivateFieldGet(this, _GeneratedSequence_currentIndex, "f"));
        __classPrivateFieldSet(this, _GeneratedSequence_currentIndex, (_a = __classPrivateFieldGet(this, _GeneratedSequence_currentIndex, "f"), ++_a), "f");
        return { done: false, element };
    }
    getAttributes() {
        return {
            neverDone: !(Number.isFinite(this.n)),
        };
    }
}
_GeneratedSequence_currentIndex = new WeakMap();
class IntRangeSequence extends Sequence {
    constructor(begin, exclusiveEnd) {
        super();
        this.exclusiveEnd = exclusiveEnd;
        _IntRangeSequence_current.set(this, void 0);
        __classPrivateFieldSet(this, _IntRangeSequence_current, begin, "f");
    }
    next() {
        var _a;
        if (__classPrivateFieldGet(this, _IntRangeSequence_current, "f") >= this.exclusiveEnd) {
            return { done: true };
        }
        const next = __classPrivateFieldGet(this, _IntRangeSequence_current, "f");
        __classPrivateFieldSet(this, _IntRangeSequence_current, (_a = __classPrivateFieldGet(this, _IntRangeSequence_current, "f"), ++_a), "f");
        return { done: false, element: next };
    }
    getAttributes() {
        return {
            neverDone: (!(Number.isFinite(this.exclusiveEnd)) && Number.isFinite(__classPrivateFieldGet(this, _IntRangeSequence_current, "f"))),
        };
    }
}
_IntRangeSequence_current = new WeakMap();
class SequenceFromArray extends Sequence {
    constructor(array) {
        super();
        this.array = array;
        _SequenceFromArray_index.set(this, 0);
    }
    next() {
        var _a;
        if (__classPrivateFieldGet(this, _SequenceFromArray_index, "f") >= this.array.length) {
            return { done: true };
        }
        const element = this.array[__classPrivateFieldGet(this, _SequenceFromArray_index, "f")];
        __classPrivateFieldSet(this, _SequenceFromArray_index, (_a = __classPrivateFieldGet(this, _SequenceFromArray_index, "f"), ++_a), "f");
        return { done: false, element };
    }
    getAttributes() {
        return {
            neverDone: !(Number.isFinite(this.array.length)),
        };
    }
}
_SequenceFromArray_index = new WeakMap();
class SequenceFromIterator extends Sequence {
    constructor(iterator) {
        super();
        this.iterator = iterator;
    }
    next() {
        const result = this.iterator.next();
        if (result.done) {
            return { done: true };
        }
        return { done: false, element: result.value };
    }
    getAttributes() {
        return {
            neverDone: false,
        };
    }
}
class SequenceFromIterable extends SequenceFromIterator {
    constructor(iterable) {
        super(iterable[Symbol.iterator]());
    }
}
class MergedSequence extends Sequence {
    constructor(sequencesSequence) {
        super();
        this.sequencesSequence = sequencesSequence;
        _MergedSequence_currentSequence.set(this, null);
    }
    next() {
        if (__classPrivateFieldGet(this, _MergedSequence_currentSequence, "f") instanceof Sequence) {
            const result = __classPrivateFieldGet(this, _MergedSequence_currentSequence, "f").next();
            if (!(result.done)) {
                return result;
            }
        }
        const result = this.sequencesSequence.next();
        if (result.done) {
            return result;
        }
        __classPrivateFieldSet(this, _MergedSequence_currentSequence, result.element, "f");
        return this.next();
    }
    getAttributes() {
        return this.sequencesSequence.getAttributes();
    }
}
_MergedSequence_currentSequence = new WeakMap();
class SequenceWithSource extends Sequence {
    constructor(source) {
        super();
        this.source = source;
    }
    getAttributes() {
        return this.source.getAttributes();
    }
}
class FilteredSequence extends SequenceWithSource {
    constructor(source, predicate) {
        super(source);
        this.predicate = predicate;
    }
    next() {
        const result = this.source.next();
        if (result.done || this.predicate(result.element)) {
            return result;
        }
        return this.next();
    }
}
class MappedSequence extends SequenceWithSource {
    constructor(source, mapper) {
        super(source);
        this.mapper = mapper;
    }
    next() {
        const sourceResult = this.source.next();
        if (sourceResult.done) {
            return sourceResult;
        }
        const mappedElement = this.mapper(sourceResult.element);
        return { done: false, element: mappedElement };
    }
}
class FlatMappedSequence extends SequenceWithSource {
    constructor(source, mapper) {
        super(source);
        this.mapper = mapper;
        _FlatMappedSequence_currentSequence.set(this, null);
    }
    next() {
        if (__classPrivateFieldGet(this, _FlatMappedSequence_currentSequence, "f") instanceof Sequence) {
            const result = __classPrivateFieldGet(this, _FlatMappedSequence_currentSequence, "f").next();
            if (!(result.done)) {
                return result;
            }
        }
        const sourceResult = this.source.next();
        if (sourceResult.done) {
            return sourceResult;
        }
        __classPrivateFieldSet(this, _FlatMappedSequence_currentSequence, this.mapper(sourceResult.element), "f");
        return this.next();
    }
}
_FlatMappedSequence_currentSequence = new WeakMap();
class FlattenedSequence extends SequenceWithSource {
    constructor(source) {
        super(source);
        _FlattenedSequence_currentSequence.set(this, null);
    }
    next() {
        if (__classPrivateFieldGet(this, _FlattenedSequence_currentSequence, "f") instanceof Sequence) {
            const result = __classPrivateFieldGet(this, _FlattenedSequence_currentSequence, "f").next();
            if (!(result.done)) {
                return result;
            }
        }
        const sourceResult = this.source.next();
        if (sourceResult.done) {
            return sourceResult;
        }
        __classPrivateFieldSet(this, _FlattenedSequence_currentSequence, sourceResult.element, "f");
        return this.next();
    }
}
_FlattenedSequence_currentSequence = new WeakMap();
class NTakenSequence extends SequenceWithSource {
    constructor(source, n) {
        super(source);
        this.n = n;
        _NTakenSequence_taken.set(this, 0);
    }
    next() {
        var _a;
        if (__classPrivateFieldGet(this, _NTakenSequence_taken, "f") >= this.n) {
            return { done: true };
        }
        const sourceResult = this.source.next();
        if (!(sourceResult.done)) {
            __classPrivateFieldSet(this, _NTakenSequence_taken, (_a = __classPrivateFieldGet(this, _NTakenSequence_taken, "f"), ++_a), "f");
        }
        return sourceResult;
    }
    getAttributes() {
        var _a;
        const sourceAttributes = super.getAttributes();
        return {
            ...(sourceAttributes),
            neverDone: (((_a = sourceAttributes.neverDone) !== null && _a !== void 0 ? _a : false) && !(Number.isFinite(this.n))),
        };
    }
}
_NTakenSequence_taken = new WeakMap();
class NSkippedSequence extends SequenceWithSource {
    constructor(source, n) {
        super(source);
        this.n = n;
        _NSkippedSequence_skipped.set(this, 0);
    }
    next() {
        var _a;
        const sourceResult = this.source.next();
        if (sourceResult.done) {
            return sourceResult;
        }
        if (__classPrivateFieldGet(this, _NSkippedSequence_skipped, "f") < this.n) {
            __classPrivateFieldSet(this, _NSkippedSequence_skipped, (_a = __classPrivateFieldGet(this, _NSkippedSequence_skipped, "f"), ++_a), "f");
            return this.next();
        }
        return sourceResult;
    }
}
_NSkippedSequence_skipped = new WeakMap();
class SortedSequence extends SequenceWithSource {
    constructor(source, comparator) {
        super(source);
        this.comparator = comparator;
        _SortedSequence_sortedArray.set(this, []);
        _SortedSequence_index.set(this, -1);
    }
    next() {
        var _a;
        if (__classPrivateFieldGet(this, _SortedSequence_index, "f") < 0) {
            __classPrivateFieldSet(this, _SortedSequence_sortedArray, this.source
                .toArray()
                .sort(this.comparator), "f");
            __classPrivateFieldSet(this, _SortedSequence_index, 0, "f");
        }
        if (__classPrivateFieldGet(this, _SortedSequence_index, "f") >= __classPrivateFieldGet(this, _SortedSequence_sortedArray, "f").length) {
            return { done: true };
        }
        const element = __classPrivateFieldGet(this, _SortedSequence_sortedArray, "f")[__classPrivateFieldGet(this, _SortedSequence_index, "f")];
        __classPrivateFieldSet(this, _SortedSequence_index, (_a = __classPrivateFieldGet(this, _SortedSequence_index, "f"), ++_a), "f");
        return { done: false, element };
    }
}
_SortedSequence_sortedArray = new WeakMap(), _SortedSequence_index = new WeakMap();
class IsEmptySequence extends SequenceWithSource {
    constructor() {
        super(...arguments);
        _IsEmptySequence_done.set(this, false);
    }
    next() {
        if (__classPrivateFieldGet(this, _IsEmptySequence_done, "f")) {
            return { done: true };
        }
        const sourceResult = this.source.next();
        if (sourceResult.done) {
            return { done: false, element: true };
        }
        return { done: false, element: false };
    }
    getAttributes() {
        return {
            ...(super.getAttributes()),
            neverDone: false,
        };
    }
}
_IsEmptySequence_done = new WeakMap();
class ActionOnEachElementSequence extends SequenceWithSource {
    constructor(source, action) {
        super(source);
        this.action = action;
    }
    next() {
        const result = this.source.next();
        if (!(result.done)) {
            this.action(result.element);
        }
        return result;
    }
}
class SequenceAsIterator {
    constructor(sequence) {
        this.sequence = sequence;
        // eslint-disable-next-line no-empty-function
    }
    next() {
        const result = this.sequence.next();
        if (result.done) {
            return { done: true, value: undefined };
        }
        return { done: false, value: result.element };
    }
}
class SequenceAsIterable {
    constructor(sequence) {
        this.sequence = sequence;
        // eslint-disable-next-line no-empty-function
    }
    [Symbol.iterator]() {
        return new SequenceAsIterator(this.sequence);
    }
}
