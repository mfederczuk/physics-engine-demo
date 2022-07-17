"use strict";
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
var _SequenceFromArray_index, _MergedSequence_currentSequence, _FlatMappedSequence_currentSequence, _FlattenedSequence_currentSequence, _SortedSequence_sortedArray, _SortedSequence_index;
class Sequence {
    //#region factory functions
    static empty() {
        return new EmptySequence();
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
    sort(comparator) {
        return new SortedSequence(this, comparator);
    }
    onEach(action) {
        return new ActionOnEachElementSequence(this, action);
    }
    forEach(action) {
        let result;
        do {
            // eslint-disable-next-line prefer-const
            result = this.next();
            if (!(result.done)) {
                action(result.element);
            }
        } while (!(result.done));
    }
    wait() {
        let result;
        do {
            // eslint-disable-next-line prefer-const
            result = this.next();
        } while (!(result.done));
    }
    asIterator() {
        return new SequenceAsIterator(this);
    }
    asIterable() {
        return new SequenceAsIterable(this);
    }
    toArray(destination = []) {
        this.forEach(destination.push.bind(destination));
        return destination;
    }
    toSet(destination = new Set()) {
        this.forEach(destination.add.bind(destination));
        return destination;
    }
}
class EmptySequence extends Sequence {
    next() {
        return { done: true };
    }
}
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
}
_MergedSequence_currentSequence = new WeakMap();
class FilteredSequence extends Sequence {
    constructor(source, predicate) {
        super();
        this.source = source;
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
class MappedSequence extends Sequence {
    constructor(source, mapper) {
        super();
        this.source = source;
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
class FlatMappedSequence extends Sequence {
    constructor(source, mapper) {
        super();
        this.source = source;
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
class FlattenedSequence extends Sequence {
    constructor(source) {
        super();
        this.source = source;
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
class SortedSequence extends Sequence {
    constructor(source, comparator) {
        super();
        this.source = source;
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
class ActionOnEachElementSequence extends Sequence {
    constructor(source, action) {
        super();
        this.source = source;
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
