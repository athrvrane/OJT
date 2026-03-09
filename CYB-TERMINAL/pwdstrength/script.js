const passInput = document.getElementById("passInput");
const strengthFill = document.getElementById("strengthFill");
const entropyVal = document.getElementById("entropyVal");
const crackTime = document.getElementById("crackTime");
const threatLevel = document.getElementById("threatLevel");
const feedbackList = document.getElementById("feedbackList");
const suggestionBox = document.getElementById("suggestionBox");

passInput.addEventListener("input", () => {
  const val = passInput.value;
  if (!val) return resetUI();

  analyzePassword(val);
});

function analyzePassword(pwd) {
  let feedback = [];

  // 1. Calculate Entropy: E = log2(R^L)
  // R = Pool Size, L = Length
  let poolSize = 0;
  if (/[a-z]/.test(pwd)) poolSize += 26;
  if (/[A-Z]/.test(pwd)) poolSize += 26;
  if (/[0-9]/.test(pwd)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;

  const entropy = Math.floor(pwd.length * Math.log2(poolSize || 1));
  entropyVal.innerText = entropy + " bits";

  // 2. Strength & Threat Assessment
  let strength = 0;
  if (entropy > 40) strength = 40;
  if (entropy > 60) strength = 70;
  if (entropy > 80) strength = 100;

  // 3. Pattern Checks (Heuristics)
  if (pwd.length < 8)
    feedback.push("Critical: Length too short (minimum 12 recommended).");
  if (!/[^a-zA-Z0-9]/.test(pwd))
    feedback.push("Warning: No special characters detected.");
  if (/(123|abc|qwerty|password)/i.test(pwd))
    feedback.push("Vulnerability: Common pattern detected!");

  // 4. Update UI
  updateUI(strength, entropy, feedback);
  generateSuggestion(pwd);
}

function updateUI(strength, entropy, feedback) {
  strengthFill.style.width = strength + "%";

  if (strength < 40) {
    strengthFill.style.background = "#ff4444";
    threatLevel.innerText = "CRITICAL";
    threatLevel.style.color = "#ff4444";
    crackTime.innerText = "Instant";
  } else if (strength < 70) {
    strengthFill.style.background = "#ffbc00";
    threatLevel.innerText = "MODERATE";
    threatLevel.style.color = "#ffbc00";
    crackTime.innerText = "Minutes/Hours";
  } else {
    strengthFill.style.background = "#00ff41";
    threatLevel.innerText = "SECURE";
    threatLevel.style.color = "#00ff41";
    crackTime.innerText = "Centuries";
  }

  feedbackList.innerHTML = feedback.length
    ? feedback.map((f) => `<li>⚠️ ${f}</li>`).join("")
    : "<li>✅ No immediate vulnerabilities found.</li>";
}

function generateSuggestion(pwd) {
  // Advanced: This takes the user's password and "Hardens" it
  let hardened = pwd
    .replace(/a/gi, "@")
    .replace(/s/gi, "$")
    .replace(/i/gi, "1")
    .replace(/o/gi, "0");

  // Add random suffix
  const suffix = "!#" + Math.floor(Math.random() * 99);
  suggestionBox.innerText = hardened + suffix;
}

function resetUI() {
  strengthFill.style.width = "0%";
  entropyVal.innerText = "0 bits";
  crackTime.innerText = "0s";
  threatLevel.innerText = "UNKNOWN";
  feedbackList.innerHTML = "<li>Waiting for input...</li>";
  suggestionBox.innerText = "Type a password to generate hardened variants.";
}
