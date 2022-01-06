import { EventEmitter } from "events";
import { createReadStream } from "fs";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SSE extends EventEmitter {
	constructor() {
		super();
	}

	init(req, res) {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		this.res = res;

		let id = 0;

		const dataListener = (data) => {
			if (data.event) {
				res.write(`event: ${data.event}\n`);
			}
			res.write(`data: ${data.data}\n`);
			res.write(`id: ${++id}\n`);
			res.write("\n");
		}

		this.on("data", dataListener);
		req.on("close", () => {
			this.removeListener("data", dataListener);
		});
	}

	send(data) {
		this.emit("data", data);
	}
}

const sse = new SSE();

let data;

createServer((req, res) => {
	const url = new URL(`http://${req.headers.host}${req.url}`);

	if (url.pathname === "/stream") {
		sse.init(req, res);
		return;
	}

	if (url.pathname === "/send-message") {
		data = url.searchParams.get("message");
		sse.send({ data });
		res.end("ok");
		return;
	}

	const fileStream = createReadStream(join(__dirname, "index.html"));
	fileStream.pipe(res);
}).listen(8080, () => {
	console.log("Server started on port 8080");
})