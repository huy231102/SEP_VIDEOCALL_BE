require("dotenv").config();
const app = require("./src/app");
const http = require("http");
const socketio = require("socket.io");
const socketHandler = require("./src/services/socket.js");

const server = http.createServer(app);

const io = socketio(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
