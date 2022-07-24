"use strict";
/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */
var Optional;
(function (Optional) {
    class EmptyOptionalImpl {
        isPresent() {
            return false;
        }
        isEmpty() {
            return true;
        }
        //#region get*
        get() {
            throw new Error("Empty optional");
        }
        getOrDefault(defaultValue) {
            return defaultValue;
        }
        getOrThrow(errorSupplier) {
            throw errorSupplier();
        }
        getOrElse(defaultValueSupplier) {
            return defaultValueSupplier();
        }
        //#endregion
        //#region if*
        ifPresent() {
            // eslint-disable-next-line no-empty-function
        }
        ifPresentOrElse(_presentAction, emptyAction) {
            emptyAction();
        }
        ifEmpty(action) {
            action();
        }
        //#endregion
        orDefault(defaultOptional) {
            return defaultOptional;
        }
        orElse(defaultOptionalSupplier) {
            return defaultOptionalSupplier();
        }
        //#region mapping
        map() {
            return this;
        }
        mapNullable() {
            return this;
        }
        flatMap() {
            return this;
        }
        //#endregion
        filter() {
            return this;
        }
        filterOut() {
            return this;
        }
    }
    class PresentOptionalImpl {
        constructor(value) {
            this.value = value;
            // eslint-disable-next-line no-empty-function
        }
        isPresent() {
            return true;
        }
        isEmpty() {
            return false;
        }
        //#region get*
        get() {
            return this.value;
        }
        getOrDefault() {
            return this.value;
        }
        getOrThrow() {
            return this.value;
        }
        getOrElse() {
            return this.value;
        }
        //#endregion
        //#region if*
        ifPresent(action) {
            action(this.value);
        }
        ifPresentOrElse(presentAction) {
            presentAction(this.value);
        }
        ifEmpty() {
            // eslint-disable-next-line no-empty-function
        }
        //#endregion
        orDefault() {
            return this;
        }
        orElse() {
            return this;
        }
        //#region mapping
        map(mapper) {
            return new PresentOptionalImpl(mapper(this.value));
        }
        mapNullable(mapper) {
            return Optional.ofNullable(mapper(this.value));
        }
        flatMap(mapper) {
            return mapper(this.value);
        }
        //#endregion
        filter(predicate) {
            if (predicate(this.value)) {
                return this;
            }
            return new EmptyOptionalImpl();
        }
        filterOut(predicate) {
            return this.filter((value) => !(predicate(value)));
        }
    }
    function empty() {
        return new EmptyOptionalImpl();
    }
    Optional.empty = empty;
    function of(value) {
        return new PresentOptionalImpl(value);
    }
    Optional.of = of;
    function ofNullable(value) {
        if ((value !== null) && (typeof (value) !== "undefined")) {
            return of(value);
        }
        else {
            return empty();
        }
    }
    Optional.ofNullable = ofNullable;
})(Optional || (Optional = {}));
