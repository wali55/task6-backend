require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const prisma = require("./config/database");
const usersRouter = require("./routes/users");
const presentationsRouter = require("./routes/presentations");
const setupSocket = require("./socket/socket");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/users", usersRouter);
app.use('/api/presentations', presentationsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
