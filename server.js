require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL },
});

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

io.on("connection", (socket) => {
  socket.on("set-nickname", (nickname) => {
    socket.nickname = nickname;
    socket.emit("nickname-set", { nickname });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.nickname);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
