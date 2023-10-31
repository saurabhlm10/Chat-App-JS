const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const onlineUsernames = {};

io.on("connection", (socket) => {
  console.log("A User Connected", socket.client.id);

  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", msg);
  });

  socket.on("user connection", (username) => {
    onlineUsernames[username] = socket.client.id;
    console.log(onlineUsernames);
    io.emit("user connection", {
      username,
      onlineUsernames,
    });
  });

  socket.on("disconnect", () => {
    const disconnectedClientId = socket.client.id;
    console.log("User disconnected", socket.client.id);

    const disconnectedUsername = Object.keys(onlineUsernames).find(
      (username) => onlineUsernames[username] === disconnectedClientId
    );

    console.log(disconnectedUsername);

    delete onlineUsernames[disconnectedUsername];

    socket.broadcast.emit("disconnection", disconnectedUsername);
  });

  socket.on("typing notification on", (username) => {
    socket.broadcast.emit("typing notification on", username);
  });

  socket.on("typing notification off", (username) => {
    socket.broadcast.emit("typing notification off", username);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
