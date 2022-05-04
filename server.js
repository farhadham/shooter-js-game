// const app = require("express")();
// const httpServer = require("http").createServer(app);
// const options = {
//   cors: {
//     origin: "http://127.0.0.1:5500",
//     methods: ["GET", "POST"],
//   },
// };
// const io = require("socket.io")(httpServer, options);

// io.on("connection", (socket) => {
//   console.log("user connected");
// });

// httpServer.listen(3000, console.log("server is running"));

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

    if (readyPlayerCount === 2) {
      io.emit("startGame", socket.id);
    }
  });

  socket.on("machineMove", (machineData) => {
    socket.broadcast.emit("machineMove", machineData);
  });

  socket.on("projectile0", (projectileData0) => {
    // console.log(projectileData0);
    socket.broadcast.emit("projectile0", projectileData0);
  });
});
