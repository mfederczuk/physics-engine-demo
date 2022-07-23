/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

enum ForceType {
	GRAVITY  = "gravity",
	FRICTION = "friction",

	LEFT  = "left",
	RIGHT = "right",
	JUMP  = "jump",

	DEBUG = "[debug]",
}

enum ForceBlockReason {
	NOCLIP = "noclip",

	DEBUG = "[debug]",
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ForceCollection {
	readonly #forceMap: Map<ForceType, { force: Vector2D; markedAsRemoved: boolean; }> = new Map();
	readonly #blocks: Map<ForceBlockReason, Set<ForceType>> = new Map();

	//#region putting

	put(type: ForceType, force: Vector2D) {
		this.#forceMap.set(type, { force, markedAsRemoved: false });
	}

	//#endregion

	//#region marking as removed

	markAsRemoved(type: ForceType, ...otherTypes: ForceType[]) {
		this.#markOneAsRemoved(type);
		otherTypes.forEach(this.#markOneAsRemoved.bind(this));
	}

	markAllAsRemoved() {
		this.#forceMap.forEach((obj: { readonly force: Vector2D; markedAsRemoved: boolean; }) => {
			obj.markedAsRemoved = true;
		});
	}

	#markOneAsRemoved(type: ForceType) {
		Optional.ofNullable(this.#forceMap.get(type))
			.ifPresent((obj: { readonly force: Vector2D; markedAsRemoved: boolean; }) => {
				obj.markedAsRemoved = true;
			});
	}

	//#endregion

	//#region blocking

	block(type: ForceType, reason: ForceBlockReason) {
		const typeSetOptional: Optional<Set<ForceType>> = Optional.ofNullable(this.#blocks.get(reason));

		if(typeSetOptional.isPresent()) {
			typeSetOptional.value.add(type);
			return;
		}

		this.#blocks.set(reason, new Set([type]));
	}

	unblock(type: ForceType, reason: ForceBlockReason) {
		this.#blocks.get(reason)?.delete(type);
	}

	unblockAll(reason: ForceBlockReason) {
		this.#blocks.get(reason)?.clear();
	}

	setBlocked(blocked: boolean, type: ForceType, reason: ForceBlockReason) {
		if(blocked) {
			this.block(type, reason);
		} else {
			this.unblock(type, reason);
		}
	}

	//#endregion

	//#region queries

	getOptional(type: ForceType): Optional<Vector2D> {
		return Optional.ofNullable(this.#forceMap.get(type))
			.filterOut(({ markedAsRemoved }) => (markedAsRemoved))
			.filter(() => {
				for(const blockedTypes of this.#blocks.values()) {
					if(blockedTypes.has(type)) {
						return false;
					}
				}

				return true;
			})
			.map(({ force }) => (force));
	}

	get(type: ForceType): (Vector2D | never) {
		return this.getOptional(type)
			.getOrThrow(() => new Error(`No such force with type: ${type}`));
	}

	getOrDefault<T extends NotNullable>(type: ForceType, defaultValue: T): (Vector2D | T) {
		return this.getOptional(type)
			.getOrDefault(defaultValue);
	}

	getOrElse<T extends NotNullable>(type: ForceType, defaultValueSupplier: () => T): (Vector2D | T) {
		return this.getOptional(type)
			.getOrElse(defaultValueSupplier);
	}

	contains(type: ForceType): boolean {
		return this.getOptional(type).isPresent();
	}

	//#endregion

	//#region iteration

	forcesSequence(): Sequence<{ type: ForceType; force: Readonly<Vector2D>; markedAsRemoved: boolean; blocked: boolean; }> {
		const allBlockedTypes: Set<ForceType> = new Set();

		for(const blockedTypes of this.#blocks.values()) {
			for(const blockedType of blockedTypes) {
				allBlockedTypes.add(blockedType);
			}
		}

		return Sequence
			.fromIterable(this.#forceMap.entries())
			.map(([type, { force, markedAsRemoved }]) => {
				return {
					type,
					force: force.copy(),
					markedAsRemoved,
					blocked: allBlockedTypes.has(type),
				};
			});
	}

	//#endregion

	//#region other

	computeNetForce(): Vector2D {
		const allBlockedTypes: Set<ForceType> = new Set();

		for(const blockedTypes of this.#blocks.values()) {
			for(const blockedType of blockedTypes) {
				allBlockedTypes.add(blockedType);
			}
		}

		const forces: Sequence<Vector2D> = Sequence.fromIterable(this.#forceMap.entries())
			.filter(([type, { markedAsRemoved }]): boolean => (!markedAsRemoved && !(allBlockedTypes.has(type))))
			.map(([, { force }]) => (force));

		return Vector2D.sum(forces);
	}

	//#endregion
}
