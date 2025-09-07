require("dotenv").config();
const app = require("./src/app");
const http = require("http");
const https = require("https");
const fs = require("fs");
const socketio = require("socket.io");
const socketHandler = require("./src/services/socket.js");

// Khởi tạo server HTTPS nếu có certs, ngược lại dùng HTTP
const sslKeyPath = process.env.SSL_KEY_FILE || process.env.SSL_KEY_PATH || './certs/privkey.pem';
const sslCertPath = process.env.SSL_CRT_FILE || process.env.SSL_CERT_PATH || './certs/fullchain.pem';
let server;
if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  const privateKey = fs.readFileSync(sslKeyPath, 'utf8');
  const certificate = fs.readFileSync(sslCertPath, 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  server = https.createServer(credentials, app);
  console.log(`Running HTTPS server with certs at ${sslCertPath} and ${sslKeyPath}`);
} else {
  server = http.createServer(app);
  console.log('SSL certs not found, running HTTP server');
}

const io = socketio(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
