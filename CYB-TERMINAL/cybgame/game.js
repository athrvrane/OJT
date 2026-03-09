const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameState = "menu";
let enemies = [];
let inputText = "";
let score = 0;
let breachPercent = 0;
let level = 1;

// --- ADJUSTED SPEEDS (MUCH SLOWER) ---
let baseSpeed = 0.4; // Reduced from 0.8
let spawnDelay = 3500; // More time between words
let lastSpawn = 0;
let selectedCharset = "";

const charsets = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}",
};

function updateCharset() {
  selectedCharset = "";
  let count = 0;
  ["lower", "upper", "numbers", "symbols"].forEach((id) => {
    if (document.getElementById(id).checked) {
      selectedCharset += charsets[id];
      count++;
    }
  });

  let info = document.getElementById("strengthInfo");
  if (count >= 4) info.innerText = "ENCRYPTION: EXTREME";
  else if (count >= 3) info.innerText = "ENCRYPTION: HARD";
  else if (count >= 2) info.innerText = "ENCRYPTION: MODERATE";
  else info.innerText = "ENCRYPTION: WEAK";
}

document.querySelectorAll('input[type="checkbox"]').forEach((el) => {
  el.addEventListener("change", updateCharset);
});

class Enemy {
  constructor() {
    this.password = this.generatePass();
    this.x = Math.random() * (canvas.width - 200) + 50;
    this.y = -50;
    // Slowed down the speed calculation
    this.speed = (baseSpeed + Math.random() * 0.2) * (1 + level * 0.05);
  }

  generatePass() {
    let len = 5 + Math.floor(level / 2);
    let str = "";
    for (let i = 0; i < len; i++) {
      str += selectedCharset.charAt(
        Math.floor(Math.random() * selectedCharset.length),
      );
    }
    return str;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    ctx.font = "20px 'Courier New'";
    if (this.password.startsWith(inputText)) {
      let matched = inputText;
      let remaining = this.password.slice(inputText.length);

      ctx.fillStyle = "#fff";
      ctx.fillText(matched, this.x, this.y);
      ctx.fillStyle = "#00ff41";
      ctx.fillText(remaining, this.x + ctx.measureText(matched).width, this.y);
    } else {
      ctx.fillStyle = "#00ff41";
      ctx.fillText(this.password, this.x, this.y);
    }
  }
}

function gameLoop(time) {
  if (gameState === "playing") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (time - lastSpawn > spawnDelay) {
      enemies.push(new Enemy());
      lastSpawn = time;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].update();
      enemies[i].draw();

      // Word touches the "Firewall" (Bottom Line)
      if (enemies[i].y > canvas.height) {
        enemies.splice(i, 1);
        handleBreach(20);
      }
    }
  }
  requestAnimationFrame(gameLoop);
}

function handleBreach(amt) {
  breachPercent += amt;
  document.getElementById("breachFill").style.width = breachPercent + "%";
  if (breachPercent >= 100) endGame();
}

// --- FIXED TYPING LOGIC (NO RESTART ON WRONG KEY) ---
document.addEventListener("keydown", (e) => {
  if (gameState !== "playing") return;
  if (e.key.length > 1) return; // Ignore Shift, Alt, etc.

  let nextInput = inputText + e.key;
  let anyMatch = enemies.some((en) => en.password.startsWith(nextInput));

  if (anyMatch) {
    inputText = nextInput;
    checkKills();
  } else {
    // Instead of Game Over, we just clear the current typing progress
    inputText = "";
  }
});

function checkKills() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].password === inputText) {
      enemies.splice(i, 1);
      inputText = "";
      score++;
      document.getElementById("scoreDisplay").innerText = score;

      if (score % 10 === 0) {
        level++;
        document.getElementById("levelDisplay").innerText = level;
      }
    }
  }
}

function endGame() {
  gameState = "gameover";
  document.getElementById("gameOver").style.display = "flex";
  document.getElementById("gameUI").style.display = "none";
  document.getElementById("finalScore").innerText = "NODES DEFENDED: " + score;
}

function start() {
  updateCharset();
  if (!selectedCharset) return alert("SELECT ENCRYPTION TYPE");

  score = 0;
  level = 1;
  breachPercent = 0;
  enemies = [];
  inputText = "";
  gameState = "playing";

  document.getElementById("menu").style.display = "none";
  document.getElementById("gameOver").style.display = "none";
  document.getElementById("gameUI").style.display = "block";
  document.getElementById("breachFill").style.width = "0%";
  document.getElementById("scoreDisplay").innerText = "0";
  document.getElementById("levelDisplay").innerText = "1";

  canvas.style.display = "block";
}

document.getElementById("startBtn").onclick = start;
document.getElementById("restartBtn").onclick = start;
requestAnimationFrame(gameLoop);
