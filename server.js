const http = require("http");
const fs = require("fs");
const path = require("path");

http.createServer((req, res) => {
	const fileStream = fs.createReadStream(path.join(__dirname, "index.html"));
	fileStream.pipe(res);
}).listen(8080, () => {
	console.log("Server started on port 8080");
})