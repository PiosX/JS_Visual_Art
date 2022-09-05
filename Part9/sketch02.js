const canvasSketch = require("canvas-sketch");
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const eases = require("eases");
const risoColors = require("riso-colors");

const settings = {
	dimensions: [1080, 1080],
	animate: true,
};

let audio;
let audioContext, audioData, sourceNode, analyserNode;
let manager;
let minDb, maxDb;

const sketch = () => {
	const numCircles = 5;
	const numSlices = 9;
	const slice = (Math.PI * 2) / numSlices;
	const radius = 200;

	const bins = [];
	const lineWidths = [];
	const rotationOffsets = [];

	const rects = [];
	const rectColors = [random.pick(risoColors), random.pick(risoColors)];
	const bgColor = random.pick(risoColors).hex;

	let lineWidth, bin, mapped, phi;

	for (let i = 0; i < numCircles * numSlices; i++) {
		bin = random.rangeFloor(4, 104);
		bins.push(bin);
	}

	for (let i = 0; i < numCircles; i++) {
		const t = i / (numCircles - 1);
		lineWidth = eases.quadIn(t) * 100 + 20;
		lineWidths.push(lineWidth);

		fill = random.pick(rectColors).hex;
		stroke = random.pick(rectColors).hex;

		rects.push({ fill, stroke });
	}

	for (let i = 0; i < numCircles; i++) {
		rotationOffsets.push(random.range(Math.PI * -0.25, Math.PI * 25));
	}

	return ({ context, width, height }) => {
		context.fillStyle = bgColor;
		context.fillRect(0, 0, width, height);

		if (!audioContext) return;
		analyserNode.getFloatFrequencyData(audioData);

		context.save();
		context.translate(width * 0.5, height * 0.5);

		let cradius = radius;

		for (let i = 0; i < numCircles; i++) {
			const { fill, stroke } = rects[i];
			context.save();

			context.rotate(rotationOffsets[i]);

			cradius += lineWidths[i] * 0.5 + 2;

			for (let j = 0; j < numSlices; j++) {
				context.rotate(slice);
				context.strokeStyle = stroke;
				context.fillStyle = fill;
				context.lineWidth = lineWidths[i];

				bin = bins[i * numSlices + j];

				mapped = math.mapRange(
					audioData[bin],
					minDb,
					maxDb,
					0,
					1.5,
					true
				);

				phi = slice * mapped;

				context.beginPath();
				context.arc(0, 0, cradius, 0, phi);
				context.stroke();
			}
			cradius += lineWidths[i] * 0.5;

			context.restore();
		}
		context.restore();
	};
};

const addListeners = () => {
	window.addEventListener("mouseup", () => {
		if (!audioContext) createAudio();

		if (audio.paused) {
			audio.play();
			manager.play();
		} else {
			audio.pause();
			manager.pause();
		}
	});
};

const createAudio = () => {
	audio = document.createElement("audio");
	audio.src = "vi.mp3";

	audioContext = new AudioContext();

	sourceNode = audioContext.createMediaElementSource(audio);
	sourceNode.connect(audioContext.destination);

	analyserNode = audioContext.createAnalyser();
	analyserNode.fftSize = 512;
	analyserNode.smoothingTimeConstant = 0.9;
	sourceNode.connect(analyserNode);

	minDb = analyserNode.minDecibels;
	maxDb = analyserNode.maxDecibels;

	audioData = new Float32Array(analyserNode.frequencyBinCount);
};

const getAverage = (data) => {
	let sum = 0;

	for (let i = 0; i < data.length; i++) {
		sum += data[i];
	}

	return sum / data.length;
};

const start = async () => {
	addListeners();
	manager = await canvasSketch(sketch, settings);
	manager.pause();
};

start();
