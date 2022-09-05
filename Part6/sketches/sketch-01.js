const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const Tweakpane = require("tweakpane");

const settings = {
	dimensions: [1080, 1080],
	false: true,
};

const params = {
	cells: 15,
	freq: 0.001,
	amp: 0.2,
	frame: 0,
	animate: false,
	glyphs: "/",
};

let pane, manager, image;

// let text = 'A';
// let fontSize = 1200;
let fontFamily = "serif";

const typeCanvas = document.createElement("canvas");
const typeContext = typeCanvas.getContext("2d");

const sketch = () => {
	return ({ context, width, height, frame }) => {
		const cell = params.cells;
		const cols = Math.floor(width / cell);
		const rows = Math.floor(height / cell);
		const numCells = cols * rows;

		typeCanvas.width = cols;
		typeCanvas.height = rows;

		typeContext.fillStyle = "black";
		typeContext.fillRect(0, 0, cols, rows);

		typeContext.save();
		typeContext.drawImage(image, 0, 0, cols, rows); // draw image
		typeContext.restore();

		const typeData = typeContext.getImageData(0, 0, cols, rows).data;

		context.fillStyle = "black";
		context.fillRect(0, 0, width, height);

		context.textBaseline = "middle";
		context.textAlign = "center";

		for (let i = 0; i < numCells; i++) {
			const col = i % cols;
			const row = Math.floor(i / cols);

			const x = col * cell;
			const y = row * cell;

			const r = typeData[i * 4 + 0];
			const g = typeData[i * 4 + 1];
			const b = typeData[i * 4 + 2];
			const a = typeData[i * 4 + 3];

			const glyph = getGlyph(r);

			context.font = `${cell * 3}px ${fontFamily}`;
			if (Math.random() < 0.1)
				context.font = `${cell * 2}px ${fontFamily}`;
			if (Math.random() < 0.2 && Math.random() > 0.1)
				context.font = `${cell * 10}px ${fontFamily}`;
			if (Math.random() < 0.3 && Math.random() > 0.2)
				context.font = `${cell * 6}px ${fontFamily}`;

			context.fillStyle = `rgb(${r}, ${g}, ${b})`;
			// context.fillStyle = `white`;

			const f = params.animate ? frame : params.frame;
			// const n = random.noise3D(x, y, f * 10, params.freq);
			// const angle  = n * Math.PI * params.amp;

			context.save();
			context.translate(x, y);
			context.translate(cell * 0.5, cell * 0.5);
			// context.rotate(angle);

			context.fillText(glyph, 0, 0);

			context.restore();
		}
	};
};

const getGlyph = (v) => {
	if (v < 250) return "/";

	return random.pick(params.glyphs.split(""));
};

const createPane = () => {
	const pane = new Tweakpane.Pane();
	let folder;

	folder = pane.addFolder({ title: "Grid " });
	folder.addInput(params, "cells", { min: 1, max: 50, step: 1 });

	folder = pane.addFolder({ title: "Glyphs " });
	folder.addInput(params, "glyphs");

	folder.addInput(params, "animate");
	folder.addInput(params, "frame", { min: 0, max: 999 });
};

const loadMeSomeImage = (url) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject();
		img.src = url;
	});
};

const start = async () => {
	const url = "./images.png";
	image = await loadMeSomeImage(url);
	pane = await createPane();
	manager = await canvasSketch(sketch, settings);
};

start();
