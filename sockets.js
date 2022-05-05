let readyPlayerCount = 0;

function listen(io) {
  const shooterNamespace = io.of("/shooter");
  shooterNamespace.on("connection", (socket) => {
    let room = "room" + Math.floor(readyPlayerCount / 2);

    console.log("user connected", socket.id);

    socket.on("ready", () => {
      socket.join(room);

      console.log(`Player ready`, socket.id, room);

      readyPlayerCount++;

      if (readyPlayerCount % 2 === 0) {
        shooterNamespace.in(room).emit("startGame", socket.id);
      }
    });

    socket.on("machineMove", (machineData) => {
      socket.to(room).emit("machineMove", machineData);
    });

    socket.on("projectileBottom", (projectileDataBottom) => {
      // console.log(projectileDataBottom;
      socket.to(room).emit("projectileBottom", projectileDataBottom);
    });

    socket.on("projectileTop", (projectileDataTop) => {
      // console.log(projectileDataBottom;
      socket.to(room).emit("projectileTop", projectileDataTop);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client ${socket.id} disconnected: ${reason}`);
      socket.leave(room);
    });
  });
}

console.log(readyPlayerCount);

module.exports = listen;
