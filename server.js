const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

httpServer.listen(3000, console.log("server is running"));

let readyPlayerCount = 0;

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("ready", () => {
    console.log(`Player ready`, socket.id);

    readyPlayerCount++;

    if (readyPlayerCount % 2 === 0) {
      io.emit("startGame", socket.id);
    }
  });

  socket.on("machineMove", (machineData) => {
    socket.broadcast.emit("machineMove", machineData);
  });

  socket.on("projectileBottom", (projectileDataBottom) => {
    // console.log(projectileDataBottom;
    socket.broadcast.emit("projectileBottom", projectileDataBottom);
  });

  socket.on("projectileTop", (projectileDataTop) => {
    // console.log(projectileDataBottom;
    socket.broadcast.emit("projectileTop", projectileDataTop);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
  });
});
