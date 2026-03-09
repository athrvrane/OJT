const MAGIC_NUMBERS = {
  "89504e47": "PNG Image",
  ffd8ff: "JPEG/JPG Image",
  25504446: "PDF Document",
  "504b0304": "ZIP Archive (or Office Doc)",
  "4d5a": "Windows Executable (EXE)",
  "7b5c727466": "Rich Text Format (RTF)",
  66747970: "MP4 Video",
};

document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById("results").classList.remove("hidden");
  document.getElementById("fileName").textContent = file.name;
  document.getElementById("fileExt").textContent = file.name
    .split(".")
    .pop()
    .toUpperCase();

  const reader = new FileReader();
  // Read the first 8 bytes for signature checking
  const blob = file.slice(0, 8);
  reader.readAsArrayBuffer(blob);

  reader.onload = function (event) {
    const uint = new Uint8Array(event.target.result);
    let bytes = [];
    uint.forEach((byte) => bytes.push(byte.toString(16).padStart(2, "0")));

    const hex = bytes.join("");
    const hexDisplay = bytes.join(" ").toUpperCase();
    document.getElementById("hexDump").textContent = hexDisplay;

    // Identification Logic
    let identified = "Unknown / Non-standard";
    for (let sig in MAGIC_NUMBERS) {
      if (hex.startsWith(sig)) {
        identified = MAGIC_NUMBERS[sig];
        break;
      }
    }

    document.getElementById("trueType").textContent = identified;

    // Security logic: Check if extension matches the magic number
    const warning = document.getElementById("securityWarning");
    const ext = file.name.split(".").pop().toLowerCase();

    if (identified === "Windows Executable (EXE)" && ext !== "exe") {
      warning.textContent =
        "⚠️ ALERT: This file is an EXE disguised as something else!";
    } else {
      warning.textContent = "";
    }
  };
});
