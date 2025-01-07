// Grundwerte
let balance = 1000;
const symbols = ["🍒", "🍋", "🍉", "⭐", "🔔"];

// Zufällige Symbole generieren
function spinReels() {
  return [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
}

// Gewinn überprüfen
function checkWin(reels) {
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    return 50; // Gewinn bei drei gleichen Symbolen
  }
  return 0;
}

// Hauptfunktion für den Spin
document.getElementById("spin-button").addEventListener("click", () => {
  if (balance <= 0) {
    document.getElementById("message").textContent = "Kein Guthaben mehr!";
    return;
  }

  balance -= 10; // Einsatz abziehen
  const reels = spinReels();

  // Rollen aktualisieren
  document.getElementById("reel1").textContent = reels[0];
  document.getElementById("reel2").textContent = reels[1];
  document.getElementById("reel3").textContent = reels[2];

  // Gewinn prüfen
  const win = checkWin(reels);
  if (win > 0) {
    balance += win;
    document.getElementById("message").textContent = `Gewonnen: $${win}`;
  } else {
    document.getElementById("message").textContent = "Kein Gewinn!";
  }

  // Guthaben anzeigen
  document.getElementById("balance").textContent = `Balance: $${balance}`;
});
