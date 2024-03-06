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
  console.log("connect client by Socket.io");
  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    console.log(socket.rooms);
    socket.emit("create_room", roomName);
    done();
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

httpServer.listen(3000, handleListen);
