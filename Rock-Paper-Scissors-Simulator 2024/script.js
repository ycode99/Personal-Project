
const canvas = document.getElementById("RPScanvas");
const ctx = canvas.getContext("2d");
const rockImage = new Image();
const paperImage = new Image();
const scissorsImage = new Image();
const elements = [];
const imageSize = 30; // The equal size for hitbox
let gameOver = false;

// Set image sources
rockImage.onload = () => initElements(rockImage, "rock", 40);
paperImage.onload = () => initElements(paperImage, "paper", 40);
scissorsImage.onload = () => initElements(scissorsImage, "scissors", 40);

rockImage.src = "assets/rock.png";
paperImage.src = "assets/paper.png";
scissorsImage.src = "assets/scissors.png";

function initElements(image, type, count) {
  for (let i = 0; i < count; i++) {
    const xOffset = Math.random() * 50; // random offset in x position
    const yOffset = Math.random() * 50; // random offset in y position
    elements.push({
      x: Math.random() * (canvas.width - imageSize) + xOffset,
      y: Math.random() * (canvas.height - imageSize) + yOffset,
      vx: 0,
      vy: 0,
      image,
      type,
    });
  }
  shuffleArray(elements);
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  elements.forEach((element) => {
    ctx.drawImage(element.image, element.x, element.y, imageSize, imageSize);

    // Move towards a target based on element type with randomness, slower speed
    moveTowards(element, "rock");
    moveTowards(element, "paper");
    moveTowards(element, "scissors");

    // Update position
    element.x += element.vx;
    element.y += element.vy;

    // Check collision with canvas boundaries
    if (element.x < 0 || element.x > canvas.width - imageSize) {
      element.vx *= -1;
    }
    if (element.y < 0 || element.y > canvas.height - imageSize) {
      element.vy *= -1;
    }

    
    // Check collision with other elements
    elements.forEach((otherElement) => {
      if (element !== otherElement && isColliding(element, otherElement)) {
        handleCollision(element, otherElement);
      }
    });

    // Keep the element within the canvas boundaries
    element.x = Math.max(0, Math.min(element.x, canvas.width - imageSize));
    element.y = Math.max(0, Math.min(element.y, canvas.height - imageSize));
  });

  // Check if the game is over
  if (!gameOver) {
    requestAnimationFrame(draw);
  } else {
    const teamName = getWinner();
    if (teamName) {
      const playAgain = confirm(`${teamName} won! Start a new round?`);
      if (playAgain) {
        location.reload();
      }
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


function seekTarget(element, target) {
  const maxSpeed = 0.5; // Define the maximum speed

  const desiredVelocity = {
    x: target.x - element.x,
    y: target.y - element.y
  };
  const distance = Math.sqrt(desiredVelocity.x * desiredVelocity.x + desiredVelocity.y * desiredVelocity.y);

  if (distance > 0) {
    desiredVelocity.x = (desiredVelocity.x / distance) * maxSpeed; // Maintain constant speed
    desiredVelocity.y = (desiredVelocity.y / distance) * maxSpeed; // Maintain constant speed

    const steeringForce = {
      x: desiredVelocity.x - element.vx,
      y: desiredVelocity.y - element.vy
    };

    element.vx += steeringForce.x;
    element.vy += steeringForce.y;
  }
}

function moveTowards(element, targetType) {
  const target = elements.find((e) => e.type === targetType);
  if (target) {
    seekTarget(element, target);
  }
}

function isColliding(obj1, obj2) {
  const obj1CenterX = obj1.x + imageSize / 2;
  const obj1CenterY = obj1.y + imageSize / 2;
  const obj2CenterX = obj2.x + imageSize / 2;
  const obj2CenterY = obj2.y + imageSize / 2;
  const distanceX = obj1CenterX - obj2CenterX;
  const distanceY = obj1CenterY - obj2CenterY;
  const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
  return distance < imageSize;
}

function handleCollision(obj1, obj2) {
  // Simple logic: paper beats rock, rock beats scissors, scissors beat paper
  if (
    (obj1.type === "rock" && obj2.type === "scissors") ||
    (obj1.type === "scissors" && obj2.type === "paper") ||
    (obj1.type === "paper" && obj2.type === "rock")
  ) {
    elements[elements.indexOf(obj2)] = { ...obj1, vx: 0, vy: 0, x: obj2.x + (imageSize / 2), y: obj2.y + (imageSize / 2) };
    if (elements.filter((element) => element.type === obj1.type).length === elements.length) {
      const restart = confirm(`${obj1.type} won! Start a new round?`);
      if (restart) {
        location.reload();
      }
    }
  } else if (
    (obj2.type === "rock" && obj1.type === "scissors") ||
    (obj2.type === "scissors" && obj1.type === "paper") ||
    (obj2.type === "paper" && obj1.type === "rock")
  ) {
    elements[elements.indexOf(obj1)] = { ...obj2, vx: 0, vy: 0, x: obj1.x + (imageSize / 2), y: obj1.y + (imageSize / 2) };
    if (elements.filter((element) => element.type === obj2.type).length === elements.length) {
      const restart = confirm(`${obj2.type} won! Start a new round?`);
      if (restart) {
        location.reload();
      }
    }
  }

  if (isColliding(obj1, obj2)) {
    const overlap = imageSize;
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        obj2.x += overlap;
        obj1.x -= overlap;
      } else {
        obj2.x -= overlap;
        obj1.x += overlap;
      }
    } else {
      if (dy > 0) {
        obj2.y += overlap;
        obj1.y -= overlap;
      } else {
        obj2.y -= overlap;
        obj1.y += overlap;
      }
    }
  }
}

function getWinner() {
  const rockCount = elements.filter((e) => e.type === "rock").length;
  const paperCount = elements.filter((e) => e.type === "paper").length;
  const scissorsCount = elements.filter((e) => e.type === "scissors").length;

  if (rockCount > 0 && paperCount === 0 && scissorsCount === 0) {
    return "Rock Team";
  } else if (paperCount > 0 && rockCount === 0 && scissorsCount === 0) {
    return "Paper Team";
  } else if (scissorsCount > 0 && rockCount === 0 && paperCount === 0) {
    return "Scissors Team";
  }
  return null;
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

shuffleArray(elements);
draw();
