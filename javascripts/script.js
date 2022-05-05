// Canvas Related
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const socket = io("http://localhost:3000");
let isReferee = false;
let machineIndex;

let width = 500;
let height = 700;

//machine
let machineWidth = 50;
let machineX = [225, 225];

let projectilesBottom = [];
let projectilesTop = [];

let shootController0 = true;
let shootController1 = true;

let touched0 = false;
let touched1 = false;

const shootTimer0 = setInterval(() => {
  shootController0 = true;
}, 500);
const shootTimer1 = setInterval(() => {
  shootController1 = true;
}, 500);

// Create Canvas Element
function createCanvas() {
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

// Wait for Opponents
function renderIntro() {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = "white";
  context.font = "32px Courier New";
  context.fillText("Waiting for opponent...", 20, canvas.height / 2 - 30);
}

function renderCanvas() {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  //bottom Machine
  context.fillStyle = "white";
  context.beginPath();
  context.moveTo(machineX[0], height - 10);
  context.lineTo(machineX[0] + machineWidth, height - 10);
  context.lineTo(machineX[0] + machineWidth / 2, height - machineWidth);
  context.fill();

  //top Machine
  context.fillStyle = "white";
  context.beginPath();
  context.moveTo(machineX[1], 10);
  context.lineTo(machineX[1] + machineWidth, 10);
  context.lineTo(machineX[1] + machineWidth / 2, machineWidth);
  context.fill();

  //projectiles

  projectilesBottom.map((p) => {
    context.fillStyle = "brown";
    context.fillRect(p.projectileX - 2.5, p.projectileY, 5, 30);
  });
  projectilesTop.map((p) => {
    context.fillStyle = "green";
    context.fillRect(p.projectileX - 2.5, p.projectileY, 5, 30);
  });

  canvas.addEventListener("click", () => {
    if (isReferee) {
      if (shootController0 && !touched0) {
        projectilesBottom.push({
          projectileY: height - (machineWidth + 10 + 30),
          projectileX: machineX[machineIndex] + machineWidth / 2,
        });
        shootController0 = false;
      }
    }
  });

  canvas.addEventListener("click", () => {
    if (!isReferee) {
      if (shootController1 && !touched1) {
        projectilesTop.push({
          projectileY: machineWidth + 10 + 30,
          projectileX: machineX[machineIndex] + machineWidth / 2,
        });
        shootController1 = false;
      }
    }
  });

  //You Won
  if (touched0) {
    if (isReferee) {
      context.font = "50px Courier New";
      context.fillText("YOU WON", canvas.width / 2 - 100, canvas.height / 2);
    } else {
      context.font = "50px Courier New";
      context.fillText("YOU LOST", canvas.width / 2 - 100, canvas.height / 2);
    }
  }
  if (touched1) {
    if (isReferee) {
      context.font = "50px Courier New";
      context.fillText("YOU LOST", canvas.width / 2 - 100, canvas.height / 2);
    } else {
      context.font = "50px Courier New";
      context.fillText("YOU WON", canvas.width / 2 - 100, canvas.height / 2);
    }
  }
}

if (shootController0 === false) {
  shootTimer0();
}
if (shootController1 === false) {
  shootTimer1();
}

const projectileShoot0 = () => {
  projectilesBottom.map((p) => {
    if (!touched0 && isReferee) {
      p.projectileY += -7;
    }

    if (isReferee) {
      socket.emit("projectileBottom", {
        projectilesBottom: projectilesBottom,
      });
    }
  });
};

const projectileShoot1 = () => {
  projectilesTop.map((p) => {
    if (!touched1 && !isReferee) {
      p.projectileY += 7;
    }

    if (!isReferee) {
      socket.emit("projectileTop", {
        projectilesTop: projectilesTop,
      });
    }
  });
};

const touchCheck1 = () => {
  projectilesBottom.map((p) => {
    if (
      p.projectileX > machineX[1] &&
      p.projectileX < machineX[1] + machineWidth / 2
    ) {
      if (
        p.projectileY <= 10 + 2 * (p.projectileX - machineX[1]) &&
        p.projectileY > 1
      ) {
        touched0 = true;
      }
    }
    if (
      p.projectileX > machineX[1] + machineWidth / 2 &&
      p.projectileX < machineX[1] + machineWidth
    ) {
      if (
        p.projectileY <=
          10 + 2 * (machineWidth + machineX[1] - p.projectileX) &&
        p.projectileY > 1
      ) {
        touched0 = true;
      }
    }
  });
};

const touchCheck2 = () => {
  projectilesTop.map((p) => {
    if (
      p.projectileX > machineX[0] &&
      p.projectileX < machineX[0] + machineWidth / 2 + 5
    ) {
      if (
        p.projectileY >=
          height - (10 + 2 * (p.projectileX - machineX[0])) - 30 &&
        p.projectileY < height - 1 - 30
      ) {
        touched1 = true;
      }
    }
    if (
      p.projectileX > machineX[0] + machineWidth / 2 &&
      p.projectileX < machineX[0] + machineWidth
    ) {
      if (
        p.projectileY >=
          height -
            (10 + 2 * (machineWidth + machineX[0] - p.projectileX)) -
            30 &&
        p.projectileY < height - 1 - 30
      ) {
        touched1 = true;
      }
    }
  });
};

// const finishGame = () => {};

function animate() {
  touchCheck1();
  touchCheck2();
  projectileShoot0();
  projectileShoot1();
  renderCanvas();
  window.requestAnimationFrame(animate);
}

function loadGame() {
  createCanvas();
  renderIntro();
  socket.emit("ready");
}

function startGame() {
  window.requestAnimationFrame(animate);

  //our movement
  canvas.addEventListener("mousemove", (e) => {
    machineIndex = isReferee ? 0 : 1;
    machineX[machineIndex] = e.offsetX;
    if (machineX[machineIndex] < 0) {
      machineX[machineIndex] = 0;
    }
    if (machineX[machineIndex] > width - machineWidth) {
      machineX[machineIndex] = width - machineWidth;
    }

    socket.emit("machineMove", {
      xPosition: machineX[machineIndex],
    });

    // Hide Cursor
    canvas.style.cursor = "none";
  });
}

loadGame();

socket.on("connect", () => {
  console.log("Connected as...", socket.id);
});

socket.on("startGame", (refereeId) => {
  console.log("Referee is", refereeId);

  isReferee = socket.id === refereeId;
  startGame();
});

socket.on("machineMove", (machineData) => {
  //toggle 1 into 0 and 0 into 1

  const opponentMachineIndex = 1 - machineIndex;
  machineX[opponentMachineIndex] = machineData.xPosition;
});

socket.on("projectileBottom", (projectileDataBottom) => {
  if (!isReferee) {
    projectilesBottom = [...projectileDataBottom.projectilesBottom];
  }
});

socket.on("projectileTop", (projectileDataTop) => {
  if (isReferee) {
    projectilesTop = [...projectileDataTop.projectilesTop];
  }
});

setInterval(() => {
  projectilesBottom.filter((item, index) => {
    index > 10;
  });
  projectilesTop.filter((item, index) => {
    index > 10;
  });
}, 5000);

// document.body.appendChild(document.createElement("button"));
