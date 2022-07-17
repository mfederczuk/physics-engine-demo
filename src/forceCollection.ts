enum ForceType {
	GRAVITY = "gravity",
	LEFT    = "left",
	RIGHT   = "right",
	JUMP    = "jump",

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
		const obj: ({ readonly force: Vector2D; markedAsRemoved: boolean; } | undefined) = this.#forceMap.get(type);

		if(typeof(obj) !== "object") {
			return;
		}

		obj.markedAsRemoved = true;
	}

	//#endregion

	//#region blocking

	block(type: ForceType, reason: ForceBlockReason) {
		const types: (Set<ForceType> | undefined) = this.#blocks.get(reason);

		if(types instanceof Set) {
			types.add(type);
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

	getOrElse<T>(type: ForceType, defaultValueSupplier: (type: ForceType) => T): (Vector2D | T) {
		const obj: (Readonly<{ force: Vector2D; markedAsRemoved: boolean; }> | undefined) = this.#forceMap.get(type);

		if((typeof(obj) !== "object") || obj.markedAsRemoved) {
			return defaultValueSupplier(type);
		}

		for(const blockedTypes of this.#blocks.values()) {
			if(blockedTypes.has(type)) {
				return defaultValueSupplier(type);
			}
		}

		return obj.force;
	}

	get(type: ForceType): (Vector2D | never) {
		return this
			.getOrElse(
				type,
				() => { throw Error(`No such force with type: ${type}`); }
			);
	}

	getOrDefault<T>(type: ForceType, defaultValue: T): (Vector2D | T) {
		return this.getOrElse(type, () => (defaultValue));
	}

	getOrNull(type: ForceType): (Vector2D | null) {
		return this.getOrDefault(type, null);
	}

	getOrUndefined(type: ForceType): (Vector2D | undefined) {
		return this.getOrDefault(type, undefined);
	}

	contains(type: ForceType): boolean {
		return (this.getOrNull(type) !== null);
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
