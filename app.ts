const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let paths: {
	color: string;
	points: { x: number; y: number }[];
	width: number;
}[] = [];
let redoStack: typeof paths = [];
let drawing = false;
let currentTool = "pencil";
let currentColor = "#000000";
let brushSize = 5;

function setupCanvas(): void {
	const rect = canvas.getBoundingClientRect();
	const dpi = window.devicePixelRatio;

	canvas.width = rect.width * dpi;
	canvas.height = rect.height * dpi;

	ctx.scale(dpi, dpi); // Proper scaling for high-DPI displays

	console.log(dpi);
	console.log(rect.width, rect.height);
	console.log(rect);
}

setupCanvas();

document.addEventListener("DOMContentLoaded", () => {
	document
		.getElementById("pencil")
		?.addEventListener("click", () => setActiveTool("pencil"));
	document
		.getElementById("eraser")
		?.addEventListener("click", () => setActiveTool("eraser"));
	document
		.getElementById("undo")
		?.addEventListener("click", () => undoLastAction());
	document
		.getElementById("redo")
		?.addEventListener("click", () => redoLastAction());
	document
		.getElementById("clear")
		?.addEventListener("click", () => clearCanvas());

	document.getElementById("color")?.addEventListener("change", (e: Event) => {
		const target = e.target as HTMLInputElement;
		currentColor = target.value;
		setActiveTool("pencil");
	});

	document
		.getElementById("brushSize")
		?.addEventListener("input", (e: Event) => {
			const target = e.target as HTMLInputElement;
			brushSize = parseInt(target.value);
		});

	canvas.addEventListener("mousedown", startDrawing);
	canvas.addEventListener("mouseup", stopDrawing);
	canvas.addEventListener("mousemove", draw);

	setActiveTool("pencil");
});

function getMousePosition(e: MouseEvent): { x: number; y: number } {
	const rect = canvas.getBoundingClientRect();
	const x = (e.clientX - rect.left) * (canvas.width / rect.width);
	const y = (e.clientY - rect.top) * (canvas.height / rect.height);
	return { x, y };
}

function redrawCanvas(): void {
	ctx.clearRect(
		0,
		0,
		canvas.width / window.devicePixelRatio,
		canvas.height / window.devicePixelRatio
	);
	paths.forEach(drawPath);
}

function drawPath(path: {
	color: string;
	points: { x: number; y: number }[];
	width: number;
}): void {
	ctx.beginPath();
	ctx.moveTo(path.points[0].x, path.points[0].y);
	for (let i = 1; i < path.points.length; i++) {
		ctx.lineTo(path.points[i].x, path.points[i].y);
	}
	ctx.strokeStyle = path.color;
	ctx.lineWidth = path.width;
	ctx.stroke();
}

function draw(e: MouseEvent): void {
	if (!drawing) return;
	const mousePosition = getMousePosition(e);
	paths[paths.length - 1].points.push(mousePosition);
	redrawCanvas();
}

function startDrawing(e: MouseEvent): void {
	drawing = true;
	const mousePosition = getMousePosition(e);

	paths.push({
		color: currentTool === "eraser" ? "#FFFFFF" : currentColor, // Use white for eraser
		points: [mousePosition],
		width: brushSize,
	});

	redoStack = [];
}

function stopDrawing(): void {
	drawing = false;
}

function setActiveTool(tool: string): void {
	currentTool = tool;
	document
		.querySelectorAll(".toolItem")
		.forEach((btn) => btn.classList.remove("active"));
	document.getElementById(tool)?.classList.add("active");
}

function undoLastAction(): void {
	if (paths.length > 0) {
		redoStack.push(paths.pop()!);
		redrawCanvas();
	}
}

function redoLastAction(): void {
	if (redoStack.length > 0) {
		paths.push(redoStack.pop()!);
		redrawCanvas();
	}
}

function clearCanvas(): void {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	paths = [];
	redoStack = [];
}
