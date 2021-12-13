import { createServer } from "http";
import { createReadStream } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let data;

function sse(_req, res) {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");

	let id = 0;

	const timer = setInterval(() => {
		if (data !== undefined && data !== "") {
			res.write(`data: ${data}\n`);
			res.write(`id: ${++id}\n`);
			res.write("\n");
		}
	}, 1000);

	setTimeout(() => {
		clearInterval(timer);
		res.write("event: end-of-stream\n");
		res.write("data: this is the end\n");
		res.write("\n");
		res.end("Ok");
	}, 10000);
}

createServer((req, res) => {
	const url = new URL(`http://${req.headers.host}${req.url}`);

	if (url.pathname === "/stream") {
		sse(req, res);
		return;
	}

	if (url.pathname === "/send-message") {
		data = url.searchParams.get("message");
		res.end(data);
		return;
	}

	const fileStream = createReadStream(join(__dirname, "index.html"));
	fileStream.pipe(res);
}).listen(8080, () => {
	console.log("Server started on port 8080");
})