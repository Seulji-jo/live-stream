import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();

const httpServer = http.createServer(app);
const handleListen = () => console.log(`Listening on http://localhost:3000`);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(socket);
  console.log("connect client by Socket.io");
  socket.on("create-something", (value, done) => {
    socket.emit("foo", value);
    done();
  });
});

httpServer.listen(3000, handleListen);
