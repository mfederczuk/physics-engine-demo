/*
 * Copyright (c) 2022 Michael Federczuk
 * SPDX-License-Identifier: MPL-2.0 AND Apache-2.0
 */

const BOUNDS_FILL_STYLE = "lightskyblue";

const ENTITY_BORDER_FILL_STYLE = "black";
const ENTITY_NAME_TEXT_SIZE_PX = 12;
const ENTITY_NAME_TEXT_FONT_FAMILY = "monospace";
const ENTITY_NAME_TEXT_FILL_STYLE = "black";

const OTHER_ENTITY_BODY_FILL_STYLE = "forestgreen";

const SUBJECT_BODY_FILL_STYLE = "royalblue";


function drawEntity(
	context: CanvasRenderingContext2D,
	entity: Readonly<Entity>,
	borderWidth: number,
	bodyFillStyle: string,
	showName: boolean,
) {
	context.save();

	// border
	context.fillStyle = ENTITY_BORDER_FILL_STYLE;
	context.fillRect(
		entity.boundingBox.x,
		entity.boundingBox.y,
		entity.boundingBox.width,
		entity.boundingBox.height,
	);

	// body
	context.fillStyle = bodyFillStyle;
	context.fillRect(
		entity.boundingBox.x      +  borderWidth,
		entity.boundingBox.y      +  borderWidth,
		entity.boundingBox.width  - (borderWidth * 2),
		entity.boundingBox.height - (borderWidth * 2),
	);

	if(showName) {
		// name text
		context.font = `${ENTITY_NAME_TEXT_SIZE_PX}px ${ENTITY_NAME_TEXT_FONT_FAMILY}`;
		context.fillStyle = ENTITY_NAME_TEXT_FILL_STYLE;
		context.fillText(
			entity.name,
			entity.boundingBox.x + borderWidth + (ENTITY_NAME_TEXT_SIZE_PX / 4),
			entity.boundingBox.y + borderWidth + ENTITY_NAME_TEXT_SIZE_PX,
		);
	}

	context.restore();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function drawFrame(context: CanvasRenderingContext2D, state: Readonly<State>, fps: number) {
	const canvas: HTMLCanvasElement = context.canvas;

	// clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

	context.save();

	// draw bounds
	context.fillStyle = BOUNDS_FILL_STYLE;
	context.fillRect(
		state.bounds.x,
		state.bounds.y,
		state.bounds.width,
		state.bounds.height,
	);

	// draw other entities
	state.entities.sequence()
		.filter(({ entity }: EntityWithId) => (entity !== state.subject))
		.waitForEach(({ entity }: EntityWithId) => {
			drawEntity(context, entity, 2, OTHER_ENTITY_BODY_FILL_STYLE, true);
		});

	// draw subject
	drawEntity(context, state.subject, 1, SUBJECT_BODY_FILL_STYLE, false);


	// draw subject info text

	const fontSize = 16;
	context.font = `${fontSize}px monospace`;
	context.fillStyle = "black";

	const infoTextPosY = 30;
	context.fillText("subject:",                               25, infoTextPosY + (fontSize *  0));

	context.fillText(`mass: ${state.subject.mass}`,            45, infoTextPosY + (fontSize *  1));
	context.fillText(`noclip: ${state.subject.noclip}`,        45, infoTextPosY + (fontSize *  2));

	context.fillText("bounding box:",                          45, infoTextPosY + (fontSize *  4));
	context.fillText(`x: ${state.subject.boundingBox.x}`,      65, infoTextPosY + (fontSize *  5));
	context.fillText(`y: ${state.subject.boundingBox.y}`,      65, infoTextPosY + (fontSize *  6));
	context.fillText(`w: ${state.subject.boundingBox.width}`,  65, infoTextPosY + (fontSize *  7));
	context.fillText(`h: ${state.subject.boundingBox.height}`, 65, infoTextPosY + (fontSize *  8));

	context.fillText("velocity:",                              45, infoTextPosY + (fontSize * 10));
	context.fillText(`xd: ${state.subject.velocity.xd}`,       65, infoTextPosY + (fontSize * 11));
	context.fillText(`yd: ${state.subject.velocity.yd}`,       65, infoTextPosY + (fontSize * 12));

	const subjectNetForce = state.subject.forces.computeNetForce();

	// TODO: draw forces as actual vectors (i.e.: arrows)?
	context.fillText("forces:",                                45, infoTextPosY + (fontSize * 14));

	context.fillText(`xd: ${subjectNetForce.xd}`,              65, infoTextPosY + (fontSize * 15));
	context.fillText(`yd: ${subjectNetForce.yd}`,              65, infoTextPosY + (fontSize * 16));

	let forceI = 0;
	context.save();
	state.subject.forces
		.sequence()
		.sort((elementA, elementB) => {
			const aInactive = (elementA.markedAsRemoved || elementA.blocked);
			const bInactive = (elementB.markedAsRemoved || elementB.blocked);

			if(!aInactive && bInactive) {
				return -1;
			}

			if(aInactive && !bInactive) {
				return 1;
			}

			return elementA.type.localeCompare(elementB.type);
		})
		.waitForEach(({ type, force, markedAsRemoved, blocked }) => {
			// 0.38 taken from Material guidelines: <https://material.io/design/interaction/states.html#disabled>
			const alpha = ((!markedAsRemoved && !blocked) ? 1 : 0.38);

			context.fillStyle = `rgba(0, 0, 0, ${alpha})`;

			const typeText = (type || "unnamed") + ":";

			context.fillText(typeText,          65,                                      infoTextPosY + (fontSize * (18 + (forceI * 3 + 0))));

			if(blocked) {
				context.save();

				context.fillStyle = `rgba(127, 0, 0, ${alpha})`;
				context.fillText("[blocked]",   70 + ((fontSize / 2) * typeText.length), infoTextPosY + (fontSize * (18 + (forceI * 3 + 0))));

				context.restore();
			}

			context.fillText(`xd: ${force.xd}`, 85,                                      infoTextPosY + (fontSize * (18 + (forceI * 3 + 1))));
			context.fillText(`yd: ${force.yd}`, 85,                                      infoTextPosY + (fontSize * (18 + (forceI * 3 + 2))));

			++forceI;
		});
	context.restore();


	const fpsText = ((fps >= 0) ? `fps: ${fps}` : "fps: N/A");
	context.fillText(fpsText, canvas.width - 73, 20);


	context.restore();
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
	const canvasOptional: Optional<HTMLCanvasElement> =
		Optional.ofNullable(document.getElementById("main-canvas") as (HTMLCanvasElement | null));

	const canvas: HTMLCanvasElement = canvasOptional.getOrThrow(() => new Error("Canvas (#main-canvas) not found"));

	const context: CanvasRenderingContext2D = Optional.ofNullable(canvas.getContext("2d"))
		.getOrThrow(() => new Error("Canvas unsupported"));

	return [canvas, context];
}
