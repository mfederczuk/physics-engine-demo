"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ObserverWrapper_baseObserver, _PublishRelay_observers;
class Subscription {
}
(function (Subscription) {
    var _EmptySubscription_cancelled, _ActionSubscription_action;
    class EmptySubscription extends Subscription {
        constructor() {
            super(...arguments);
            _EmptySubscription_cancelled.set(this, false);
        }
        cancel() {
            __classPrivateFieldSet(this, _EmptySubscription_cancelled, true, "f");
        }
        isCancelled() {
            return __classPrivateFieldGet(this, _EmptySubscription_cancelled, "f");
        }
    }
    _EmptySubscription_cancelled = new WeakMap();
    class CancelledSubscription extends Subscription {
        cancel() {
            // eslint-disable-next-line no-empty-function
        }
        isCancelled() {
            return true;
        }
    }
    class ActionSubscription extends Subscription {
        constructor(action) {
            super();
            _ActionSubscription_action.set(this, void 0);
            __classPrivateFieldSet(this, _ActionSubscription_action, Optional.of(action), "f");
        }
        cancel() {
            if (__classPrivateFieldGet(this, _ActionSubscription_action, "f").isEmpty()) {
                return;
            }
            try {
                __classPrivateFieldGet(this, _ActionSubscription_action, "f").get()();
            }
            finally {
                __classPrivateFieldSet(this, _ActionSubscription_action, Optional.empty(), "f");
            }
        }
        isCancelled() {
            return __classPrivateFieldGet(this, _ActionSubscription_action, "f").isEmpty();
        }
    }
    _ActionSubscription_action = new WeakMap();
    function empty() {
        return new EmptySubscription();
    }
    Subscription.empty = empty;
    function cancelled() {
        return new CancelledSubscription();
    }
    Subscription.cancelled = cancelled;
    function ofAction(action) {
        return new ActionSubscription(action);
    }
    Subscription.ofAction = ofAction;
})(Subscription || (Subscription = {}));
class Observer {
}
class ObserverWrapper extends Observer {
    constructor(baseObserver) {
        super();
        _ObserverWrapper_baseObserver.set(this, void 0);
        __classPrivateFieldSet(this, _ObserverWrapper_baseObserver, baseObserver, "f");
    }
    onSubscribe(subscription) {
        __classPrivateFieldGet(this, _ObserverWrapper_baseObserver, "f").onSubscribe(subscription);
    }
    onNext(item) {
        __classPrivateFieldGet(this, _ObserverWrapper_baseObserver, "f").onNext(item);
    }
    onError(error) {
        __classPrivateFieldGet(this, _ObserverWrapper_baseObserver, "f").onError(error);
    }
    onComplete() {
        __classPrivateFieldGet(this, _ObserverWrapper_baseObserver, "f").onComplete();
    }
}
_ObserverWrapper_baseObserver = new WeakMap();
// *heavily* inspired by RxJava
class Observable {
    subscribe(...args) {
        var _a, _b, _c;
        if (args[0] instanceof Observer) {
            this.subscribeActual(args[0]);
            return;
        }
        const onNextArg = Optional.ofNullable((_a = args[0]) === null || _a === void 0 ? void 0 : _a.onNext);
        const onErrorArg = Optional.ofNullable((_b = args[0]) === null || _b === void 0 ? void 0 : _b.onError);
        const onCompleteArg = Optional.ofNullable((_c = args[0]) === null || _c === void 0 ? void 0 : _c.onComplete);
        let thisSubscription = Optional.empty();
        const returnSubscription = Subscription.ofAction(() => {
            thisSubscription.ifPresent((subscription) => subscription.cancel());
        });
        const observer = new class extends Observer {
            onSubscribe(subscription) {
                if (returnSubscription.isCancelled()) {
                    subscription.cancel();
                    return;
                }
                thisSubscription = Optional.of(subscription);
            }
            onNext(item) {
                if (returnSubscription.isCancelled()) {
                    throw new Error("Subscription is cancelled, but onNext event happened");
                }
                onNextArg.ifPresent((onNext) => onNext(item));
            }
            onError(error) {
                if (returnSubscription.isCancelled()) {
                    throw new Error("Subscription is cancelled, but onError event happened");
                }
                onErrorArg.ifPresent((onError) => onError(error));
            }
            onComplete() {
                if (returnSubscription.isCancelled()) {
                    throw new Error("Subscription is cancelled, but onComplete event happened");
                }
                onCompleteArg.ifPresent((onComplete) => onComplete());
            }
        };
        this.subscribeActual(observer);
        return returnSubscription;
    }
    //#region factory functions
    static empty() {
        return new EmptyObservable();
    }
    static never() {
        return new NeverObservable();
    }
    static error(error) {
        return new ErrorObservable(error);
    }
    //#region from*
    static fromSequence(sequence) {
        return new ObservableFromSequence(sequence);
    }
    static fromArray(array) {
        return new ObservableFromSequence(Sequence.fromArray(array));
    }
    static from(...items) {
        return new ObservableFromSequence(Sequence.from(...items));
    }
    //#endregion
    //#endregion
    filter(predicate) {
        return new FilteredObservable(this, predicate);
    }
    map(mapper) {
        return new MappedObservable(this, mapper);
    }
    switchMap(mapper) {
        return new SwitchMappedObservable(this, mapper);
    }
    delay(milliseconds) {
        return new DelayedObservable(this, milliseconds);
    }
    take(n) {
        return new NTakenObservable(this, n);
    }
    skip(n) {
        return new NSkippedObservable(this, n);
    }
    sort(comparator) {
        return new SortedObservable(this, comparator);
    }
    isEmpty() {
        return new IsEmptyObservable(this);
    }
    isNotEmpty() {
        return this
            .isEmpty()
            .map((empty) => (!empty));
    }
    doOnEach(action) {
        return new ActionOnEachItemObservable(this, action);
    }
    doOnCancel(action) {
        return new ActionOnCancelObservable(this, action);
    }
    hide() {
        return new class extends ObservableWithUpstream {
            subscribeActual(downstreamObserver) {
                const upstreamObserver = new class extends ObserverWrapper {
                    onSubscribe(upstreamSubscription) {
                        const downstreamSubscription = new class extends Subscription {
                            cancel() {
                                upstreamSubscription.cancel();
                            }
                            isCancelled() {
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
    toArray() {
        return new ToArrayObservable(this);
    }
    toSet() {
        return new ToSetObservable(this);
    }
}
Sequence.prototype.toObservable = function () {
    return Observable.fromSequence(this);
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PublishRelay extends Observable {
    constructor() {
        super(...arguments);
        _PublishRelay_observers.set(this, new Set());
    }
    subscribeActual(downstreamObserver) {
        downstreamObserver.onSubscribe(Subscription.ofAction(() => {
            __classPrivateFieldGet(this, _PublishRelay_observers, "f").delete(downstreamObserver);
        }));
        __classPrivateFieldGet(this, _PublishRelay_observers, "f").add(downstreamObserver);
    }
    onNext(item) {
        __classPrivateFieldGet(this, _PublishRelay_observers, "f").forEach((observer) => {
            observer.onNext(item);
        });
    }
}
_PublishRelay_observers = new WeakMap();
class EmptyObservable extends Observable {
    subscribeActual(downstreamObserver) {
        downstreamObserver.onSubscribe(Subscription.empty());
        downstreamObserver.onComplete();
    }
}
class NeverObservable extends Observable {
    subscribeActual(downstreamObserver) {
        downstreamObserver.onSubscribe(Subscription.empty());
    }
}
class ErrorObservable extends Observable {
    constructor(error) {
        super();
        this.error = error;
    }
    subscribeActual(downstreamObserver) {
        downstreamObserver.onSubscribe(Subscription.empty());
        downstreamObserver.onError(this.error);
    }
}
class ObservableFromSequence extends Observable {
    constructor(sequence) {
        super();
        this.sequence = sequence;
    }
    subscribeActual(downstreamObserver) {
        downstreamObserver.onSubscribe(Subscription.empty());
        this.sequence.waitForEach(downstreamObserver.onNext.bind(downstreamObserver));
        downstreamObserver.onComplete();
    }
}
class ObservableWithUpstream extends Observable {
    constructor(upstream) {
        super();
        this.upstream = upstream;
    }
}
class FilteredObservable extends ObservableWithUpstream {
    constructor(upstream, predicate) {
        super(upstream);
        this.predicate = predicate;
    }
    subscribeActual(downstreamObserver) {
        new class extends Observer {
            constructor(predicate) {
                super();
                this.predicate = predicate;
                this.onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);
                this.onError = downstreamObserver.onError.bind(downstreamObserver);
                this.onComplete = downstreamObserver.onComplete.bind(downstreamObserver);
            }
            onNext(item) {
                let matched;
                try {
                    // eslint-disable-next-line prefer-const
                    matched = this.predicate(item);
                }
                catch (error) {
                    downstreamObserver.onError(error);
                    return;
                }
                if (matched) {
                    downstreamObserver.onNext(item);
                }
            }
        }(this.predicate);
    }
}
class MappedObservable extends ObservableWithUpstream {
    constructor(upstream, mapper) {
        super(upstream);
        this.mapper = mapper;
    }
    subscribeActual(downstreamObserver) {
        const upstreamObserver = new class extends Observer {
            constructor(mapper) {
                super();
                this.mapper = mapper;
                this.onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);
                this.onError = downstreamObserver.onError.bind(downstreamObserver);
                this.onComplete = downstreamObserver.onComplete.bind(downstreamObserver);
            }
            onNext(item) {
                let mappedItem;
                try {
                    // eslint-disable-next-line prefer-const
                    mappedItem = this.mapper(item);
                }
                catch (error) {
                    downstreamObserver.onError(error);
                    return;
                }
                downstreamObserver.onNext(mappedItem);
            }
        }(this.mapper);
        this.upstream.subscribe(upstreamObserver);
    }
}
class SwitchMappedObservable extends ObservableWithUpstream {
    constructor(upstream, mapper) {
        super(upstream);
        this.mapper = mapper;
    }
    subscribeActual(downstreamObserver) {
        var _UpstreamObserver_currentSubscription;
        class NestedObserver extends Observer {
            constructor(subscriptionConsumer) {
                super();
                this.subscriptionConsumer = subscriptionConsumer;
                this.onSubscribe = this.subscriptionConsumer.bind(undefined);
                this.onNext = downstreamObserver.onNext.bind(downstreamObserver);
                this.onError = downstreamObserver.onError.bind(downstreamObserver);
            }
            onComplete() {
                // eslint-disable-next-line no-empty-function
            }
        }
        class UpstreamObserver extends Observer {
            constructor(mapper) {
                super();
                this.mapper = mapper;
                _UpstreamObserver_currentSubscription.set(this, Subscription.cancelled());
            }
            onSubscribe(subscription) {
                downstreamObserver.onSubscribe(Subscription.ofAction(() => {
                    subscription.cancel();
                    __classPrivateFieldGet(this, _UpstreamObserver_currentSubscription, "f").cancel();
                }));
            }
            onNext(item) {
                __classPrivateFieldGet(this, _UpstreamObserver_currentSubscription, "f").cancel();
                const mappedObservable = this.mapper(item);
                mappedObservable.subscribe(new NestedObserver((subscription) => {
                    __classPrivateFieldSet(this, _UpstreamObserver_currentSubscription, subscription, "f");
                }));
            }
            onError(error) {
                __classPrivateFieldGet(this, _UpstreamObserver_currentSubscription, "f").cancel();
                downstreamObserver.onError(error);
            }
            onComplete() {
                __classPrivateFieldGet(this, _UpstreamObserver_currentSubscription, "f").cancel();
                downstreamObserver.onComplete();
            }
        }
        _UpstreamObserver_currentSubscription = new WeakMap();
        this.upstream.subscribe(new UpstreamObserver(this.mapper));
    }
}
class DelayedObservable extends ObservableWithUpstream {
    constructor(upstream, milliseconds) {
        super(upstream);
        this.milliseconds = milliseconds;
    }
    subscribeActual(downstreamObserver) {
        var _instances, _doDelayed, _a;
        const upstreamObserver = new (_a = class extends Observer {
                constructor(milliseconds) {
                    super();
                    this.milliseconds = milliseconds;
                    _instances.add(this);
                    this.onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);
                }
                onNext(item) {
                    __classPrivateFieldGet(this, _instances, "m", _doDelayed).call(this, downstreamObserver.onNext.bind(downstreamObserver, item));
                }
                onError(error) {
                    __classPrivateFieldGet(this, _instances, "m", _doDelayed).call(this, downstreamObserver.onError.bind(downstreamObserver, error));
                }
                onComplete() {
                    __classPrivateFieldGet(this, _instances, "m", _doDelayed).call(this, downstreamObserver.onComplete.bind(downstreamObserver));
                }
            },
            _instances = new WeakSet(),
            _doDelayed = function _doDelayed(action) {
                setTimeout(() => action(), this.milliseconds);
            },
            _a)(this.milliseconds);
        this.upstream.subscribe(upstreamObserver);
    }
}
class NTakenObservable extends ObservableWithUpstream {
    constructor(upstream, n) {
        super(upstream);
        this.n = n;
    }
    subscribeActual(downstreamObserver) {
        var _taken, _a;
        const upstreamObserver = new (_a = class extends ObserverWrapper {
                constructor(baseObserver, n) {
                    super(baseObserver);
                    this.n = n;
                    _taken.set(this, 0);
                }
                onNext(item) {
                    var _a;
                    if (__classPrivateFieldGet(this, _taken, "f") >= this.n) {
                        return;
                    }
                    __classPrivateFieldSet(this, _taken, (_a = __classPrivateFieldGet(this, _taken, "f"), ++_a), "f");
                    super.onNext(item);
                }
            },
            _taken = new WeakMap(),
            _a)(downstreamObserver, this.n);
        this.upstream.subscribe(upstreamObserver);
    }
}
class NSkippedObservable extends ObservableWithUpstream {
    constructor(upstream, n) {
        super(upstream);
        this.n = n;
    }
    subscribeActual(downstreamObserver) {
        var _skipped, _a;
        const upstreamObserver = new (_a = class extends ObserverWrapper {
                constructor(baseObserver, n) {
                    super(baseObserver);
                    this.n = n;
                    _skipped.set(this, 0);
                }
                onNext(item) {
                    var _a;
                    if (__classPrivateFieldGet(this, _skipped, "f") < this.n) {
                        __classPrivateFieldSet(this, _skipped, (_a = __classPrivateFieldGet(this, _skipped, "f"), ++_a), "f");
                        return;
                    }
                    super.onNext(item);
                }
            },
            _skipped = new WeakMap(),
            _a)(downstreamObserver, this.n);
        this.upstream.subscribe(upstreamObserver);
    }
}
class SortedObservable extends ObservableWithUpstream {
    constructor(upstream, comparator) {
        super(upstream);
        this.comparator = comparator;
    }
    subscribeActual(downstreamObserver) {
        var _array, _a;
        const upstreamObserver = new (_a = class extends Observer {
                constructor(comparator) {
                    super();
                    this.comparator = comparator;
                    _array.set(this, []);
                    this.onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);
                    this.onNext = __classPrivateFieldGet(this, _array, "f").push.bind(__classPrivateFieldGet(this, _array, "f"));
                    this.onError = downstreamObserver.onError.bind(downstreamObserver);
                }
                onComplete() {
                    for (const item of __classPrivateFieldGet(this, _array, "f").sort(this.comparator)) {
                        downstreamObserver.onNext(item);
                    }
                }
            },
            _array = new WeakMap(),
            _a)(this.comparator);
        this.upstream.subscribe(upstreamObserver);
    }
}
class IsEmptyObservable extends ObservableWithUpstream {
    subscribeActual(downstreamObserver) {
        var _empty, _a;
        const upstreamObserver = new (_a = class extends Observer {
                constructor() {
                    super(...arguments);
                    _empty.set(this, true);
                    this.onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);
                    this.onError = downstreamObserver.onError.bind(downstreamObserver);
                }
                onNext() {
                    __classPrivateFieldSet(this, _empty, false, "f");
                }
                onComplete() {
                    downstreamObserver.onNext(__classPrivateFieldGet(this, _empty, "f"));
                }
            },
            _empty = new WeakMap(),
            _a);
        this.upstream.subscribe(upstreamObserver);
    }
}
class ActionOnEachItemObservable extends ObservableWithUpstream {
    constructor(upstream, action) {
        super(upstream);
        this.action = action;
    }
    subscribeActual(downstreamObserver) {
        const upstreamObserver = new class extends ObserverWrapper {
            constructor(action) {
                super(downstreamObserver);
                this.action = action;
            }
            onNext(item) {
                try {
                    this.action(item);
                }
                catch (error) {
                    super.onError(error);
                    return;
                }
                super.onNext(item);
            }
        }(this.action);
        this.upstream.subscribe(upstreamObserver);
    }
}
class ActionOnCancelObservable extends ObservableWithUpstream {
    constructor(upstream, action) {
        super(upstream);
        this.action = action;
    }
    subscribeActual(downstreamObserver) {
        const upstreamObserver = new class extends ObserverWrapper {
            constructor(baseObserver, action) {
                super(baseObserver);
                this.action = action;
            }
            onSubscribe(subscription) {
                super.onSubscribe(Subscription.ofAction(() => {
                    subscription.cancel();
                    this.action();
                }));
            }
        }(downstreamObserver, this.action);
        this.upstream.subscribe(upstreamObserver);
    }
}
class ToArrayObservable extends ObservableWithUpstream {
    subscribeActual(downstreamObserver) {
        var _array_1, _a;
        const upstreamObserver = new (_a = class extends Observer {
                constructor() {
                    super(...arguments);
                    _array_1.set(this, []);
                    this.onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);
                    this.onError = downstreamObserver.onError.bind(downstreamObserver);
                }
                onNext(item) {
                    __classPrivateFieldGet(this, _array_1, "f").push(item);
                }
                onComplete() {
                    downstreamObserver.onNext([...__classPrivateFieldGet(this, _array_1, "f")]);
                    downstreamObserver.onComplete();
                }
            },
            _array_1 = new WeakMap(),
            _a);
        this.upstream.subscribe(upstreamObserver);
    }
}
class ToSetObservable extends ObservableWithUpstream {
    subscribeActual(downstreamObserver) {
        var _set, _a;
        const upstreamObserver = new (_a = class extends Observer {
                constructor() {
                    super(...arguments);
                    _set.set(this, new Set());
                    this.onSubscribe = downstreamObserver.onSubscribe.bind(downstreamObserver);
                    this.onError = downstreamObserver.onError.bind(downstreamObserver);
                }
                onNext(item) {
                    __classPrivateFieldGet(this, _set, "f").add(item);
                }
                onComplete() {
                    downstreamObserver.onNext(new Set(__classPrivateFieldGet(this, _set, "f")));
                    downstreamObserver.onComplete();
                }
            },
            _set = new WeakMap(),
            _a);
        this.upstream.subscribe(upstreamObserver);
    }
}
