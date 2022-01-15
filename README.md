# sse-node

Node.js server-sent events demo.

Run with:

`node server.mjs`.

Data can be sent with:

`curl -X GET "https://localhost:8080/send-message?message=Hello" -k`.

To generate the certificate and key for this demo, run:

`openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-privkey.pem -out localhost-cert.pem`
