enum ForceType {
	GRAVITY = "gravity",
	LEFT    = "left",
	RIGHT   = "right",
	JUMP    = "jump",

	DEBUG = "[debug]",
}

class ForceCollection {
	// TODO: add blocking of forces?
	//       e.g.: instead of the gravity checks in `updateEntity` explicitly check for noclip, before that, we could
	//       check for noclip and then add a block for gravity:
	//
	//           if(entity.noclip) {
	//               entity.forces.block(ForceType.GRAVITY, /* reason/key = */ "noclip")
	//           } else {
	//               // `computeNetForce` won't consider blocked forces
	//               entity.forces.unblock(ForceType.GRAVITY, /* reason/key = */ "noclip")
	//           }
	//
	//           entity.forces.put(ForceType.GRAVITY, state.gravity)
	//
	//       multiple blocks can be active at once, and all blocks have a key so that the don't accidentally unblock
	//       one another
	//
	//       i dunno if there would be a lot of use cases for this, the only one i can think of right now is noclip,
	//       though this keeps the door open for customization/expandability

	#map: Map<ForceType, [enabled: boolean, force: Vector2D]> = new Map();

	//#region putting & enabling

	put(type: ForceType, force: Vector2D) {
		this.#map.set(type, [true, force]);
	}

	enable(type: ForceType, ...otherTypes: ForceType[]) {
		this.#enableOne(type);
		otherTypes.forEach(this.#enableOne.bind(this));
	}
	enableAll() {
		this.#map.forEach(([enabled, force]: [boolean, Vector2D], type: ForceType) => {
			if(!enabled) {
				this.put(type, force);
			}
		});
	}

	#enableOne(type: ForceType) {
		const tuple: ([enabled: boolean, force: Vector2D] | undefined) = this.#map.get(type);

		if(!(tuple instanceof Array)) {
			return;
		}

		const [enabled, force]: [boolean, Vector2D] = tuple;

		if(enabled) {
			return;
		}

		this.put(type, force);
	}

	//#endregion

	//#region removing & disabling

	remove(type: ForceType, ...otherTypes: ForceType[]) {
		this.#map.delete(type);
		otherTypes.forEach(this.#map.delete.bind(this.#map));
	}
	removeAll() {
		this.#map.clear();
	}

	disable(type: ForceType, ...otherTypes: ForceType[]) {
		this.#disableOne(type);
		otherTypes.forEach(this.#disableOne.bind(this));
	}
	disableAll() {
		this.#map.forEach(([enabled, force]: [boolean, Vector2D], type: ForceType) => {
			if(enabled) {
				this.#map.set(type, [false, force]);
			}
		});
	}

	#disableOne(type: ForceType) {
		const tuple: ([enabled: boolean, force: Vector2D] | undefined) = this.#map.get(type);

		if(!(tuple instanceof Array)) {
			return;
		}

		const [enabled, force]: [boolean, Vector2D] = tuple;

		if(!enabled) {
			return;
		}

		this.#map.set(type, [false, force]);
	}

	//#endregion

	//#region getting

	contains(type: ForceType): boolean {
		return this.#map.has(type);
	}

	getOrElse<T>(type: ForceType, defaultSupplier: () => T): (Vector2D | T) {
		const tuple: ([enabled: boolean, force: Vector2D] | undefined) = this.#map.get(type);

		if(!(tuple instanceof Array)) {
			return defaultSupplier();
		}

		const [, force]: [boolean, Vector2D] = tuple;

		return force;
	}

	getOrDefault<T>(type: ForceType, defaultValue: T): (Vector2D | T) {
		return this.getOrElse(type, () => (defaultValue));
	}

	get(type: ForceType): Vector2D {
		return this
			.getOrElse(
				type,
				() => { throw Error(`No such force with type: ${type}`); }
			);
	}

	getOrNull(type: ForceType): (Vector2D | null) {
		return this.getOrDefault(type, null);
	}

	getOrUndefined(type: ForceType): (Vector2D | undefined) {
		return this.getOrDefault(type, undefined);
	}

	isEnabled(type: ForceType): boolean {
		const tuple: ([enabled: boolean, force: Vector2D] | undefined) = this.#map.get(type);

		if(!(tuple instanceof Array)) {
			return false;
		}

		const [enabled]: [boolean, Vector2D] = tuple;

		return enabled;
	}

	isDisabled(type: ForceType): boolean {
		const tuple: ([enabled: boolean, force: Vector2D] | undefined) = this.#map.get(type);

		if(!(tuple instanceof Array)) {
			return false;
		}

		const [enabled]: [boolean, Vector2D] = tuple;

		return !enabled;
	}

	//#endregion

	//#region other

	toggle(type: ForceType) {
		const tuple: ([enabled: boolean, force: Vector2D] | undefined) = this.#map.get(type);

		if(!(tuple instanceof Array)) {
			return;
		}

		const [enabled, force]: [boolean, Vector2D] = tuple;

		this.#map.set(type, [!enabled, force]);
	}

	computeNetForce(): Vector2D {
		const forces: Iterable<Readonly<Vector2D>> = [...this.#map.values()]
			.filter(([enabled]: [boolean, Vector2D]): boolean => enabled)
			.map(([, force]: [boolean, Vector2D]) => force);

		return Vector2D.sum(forces);
	}

	//#endregion

	//#region iterating

	forEach(callbackfn: (force: Vector2D, enabled: boolean, type: ForceType) => void) {
		[...this.#map.entries()]
			.sort((a, b) => {
				const aEnabled: boolean = a[1][0];
				const bEnabled: boolean = b[1][0];

				if( aEnabled && !bEnabled) return -1;
				if(!aEnabled &&  bEnabled) return  1;

				return 0;
			})
			.forEach(([type, [enabled, force]]: [ForceType, [boolean, Vector2D]]) => {
				callbackfn(force, enabled, type);
			});
	}

	//#endregion
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Entity {
	readonly boundingBox:         Box2D;
	         mass:                number; // TODO: mass is currently unused, but will be used for better friction,
	                                      //       terminal velocity and maybe impact force and others?
	         manualMovementSpeed: number;
	         jumpSpeed:           number;

	controller: Controller;

	readonly velocity: Vector2D        = new Vector2D();
	readonly forces:   ForceCollection = new ForceCollection();
	         noclip:   boolean         = false; // dunno why i added this, seemed like fun lol

	constructor(
		boundingBox: Box2D,
		mass: number,
		manualMovementSpeed: number,
		jumpSpeed: number,

		controller: Controller = new DummyController(),
	) {
		this.boundingBox         = boundingBox;
		this.mass                = mass;
		this.manualMovementSpeed = manualMovementSpeed;
		this.jumpSpeed           = jumpSpeed;

		this.controller = controller;
	}
}
