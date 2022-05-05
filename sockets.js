let readyPlayerCount = 0;
let room = [];
let roomData;

function listen(io) {
  const shooterNamespace = io.of("/shooter");
  shooterNamespace.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on("roomCreated", (rm) => {
      room.push({ roomName: rm.roomName });
      console.log(`room ${rm.roomName} created`);
    });
    socket.on("roomJoined", (rm) => {
      roomData = room.find((element) => {
        return element.roomName === rm.roomName;
      });
      if (roomData) {
        socket.join(roomData);
        console.log(`Player ready`, socket.id, roomData);
      }
    });

    socket.on("ready", () => {
      if (roomData) {
        shooterNamespace.in(roomData).emit("startGame", socket.id);
      }
    });

    socket.on("machineMove", (machineData) => {
      socket.to(roomData).emit("machineMove", machineData);
    });

    socket.on("projectileBottom", (projectileDataBottom) => {
      // console.log(projectileDataBottom;
      socket.to(roomData).emit("projectileBottom", projectileDataBottom);
    });

    socket.on("projectileTop", (projectileDataTop) => {
      // console.log(projectileDataBottom;
      socket.to(roomData).emit("projectileTop", projectileDataTop);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client ${socket.id} disconnected: ${reason}`);
      socket.leave(roomData);
    });
  });
}

module.exports = listen;
