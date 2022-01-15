import { EventEmitter } from "events";
import { createReadStream, readFileSync } from "fs";
import { constants, createSecureServer } from "http2";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { HTTP2_HEADER_SCHEME, HTTP2_HEADER_PATH, HTTP2_HEADER_AUTHORITY, HTTP_STATUS_OK } = constants;

let streamCount = 0;

class SSE extends EventEmitter {
	constructor() {
		super();
	}

	init(stream, headers) {
		let id = 0;

		this.setMaxListeners(this.getMaxListeners() + 1);

		const dataListener = (data) => {
			stream.respond({
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache"
			});

			if (data.event) {
				stream.write(`event: ${data.event}\n`);
			}
			stream.write(`data: ${data.data}\n`);
			stream.write(`id: ${++id}\n`);
			stream.write("\n");
		}

		this.on("data", dataListener);

		stream.on("close", () => {
			this.removeListener("data", dataListener);
			--streamCount;
			this.setMaxListeners(this.getMaxListeners() - 1);
			console.log("Stream closed");
		});

		console.log(`Stream ${++streamCount} created`);
	}

	send(data) {
		this.emit("data", data);
	}
}

const sse = new SSE();

const server = createSecureServer({
  	key: readFileSync('localhost-privkey.pem'),
 	cert: readFileSync('localhost-cert.pem')
});

server.on("stream", (stream, headers) => {
	const scheme = headers[HTTP2_HEADER_SCHEME];
	const authority = headers[HTTP2_HEADER_AUTHORITY];
	const urlPath = headers[HTTP2_HEADER_PATH];

	const url = new URL(`${scheme}://${authority}${urlPath}`);

	if (url.pathname === "/stream") {
		sse.init(stream, headers);
		return;
	}

	if (url.pathname === "/send-message") {
		const data = url.searchParams.get("message");
		sse.send({ data });
		stream.respond({
			":status": HTTP_STATUS_OK
		});
		stream.end("ok");
		return;
	}

	const fileStream = createReadStream(join(__dirname, "index.html"));
	fileStream.pipe(stream);
}).listen(8080, () => {
	console.log("Server started on port 8080");
})