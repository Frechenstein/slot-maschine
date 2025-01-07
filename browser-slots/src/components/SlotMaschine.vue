<template>
  <div id="slot-machine">
    <div id="reels" ref="reelsContainer">
      <svg class="lines-overlay" xmlns="http://www.w3.org/2000/svg">
        <polyline
          v-for="(line, index) in visibleLines"
          :key="'line-' + index"
          :points="line"
          :stroke="lineColors[index]"
          stroke-width="4"
          fill="none"
        />
      </svg>
      <div 
        v-for="(row, rowIndex) in reels" 
        :key="'row-' + rowIndex" 
        class="row"
      >
        <div 
          class="reel" 
          v-for="(symbol, colIndex) in row" 
          :key="'col-' + colIndex"
        >
          {{ symbol }}
        </div>
      </div>
    </div>
    <button @click="spin" :disabled="isSpinning || balance <= 0">Spin</button>
    <button @click="toggleShowLines">{{ showLines ? "Linien ausblenden" : "Linien anzeigen" }}</button>
    <p id="balance">Balance: ${{ balance }}</p>
    <p id="message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: "SlotMachine",
  data() {
    return {
      balance: 1000,
      rows: 3,
      cols: 5,
      reels: [],
      symbols: ["🍒", "🍋", "🍉", "⭐", "🔔"],
      symbolWeights: [0.25, 0.25, 0.25, 0.15, 0.10], // Früchte: 20%, Stern: 20%, Glocke: 15%
      message: "",
      isSpinning: false,
      showLines: false,
      winningPositions: [],
      lines: [
        // Reihen
        [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
        [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
        [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]],
        // Diagonalen
        [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]],
        [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]],
        [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]],
        [[2, 0], [2, 1], [1, 2], [0, 3], [0, 4]],
      ],
      lineColors: [],
      winChanceMultiplier: 1,
      visibleLines: [],
    };
  },
  created() {
    this.initializeReels();
    this.initializeLineColors();
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    initializeReels() {
      this.reels = Array.from({ length: this.rows }, () =>
        Array.from({ length: this.cols }, () => this.getRandomSymbol())
      );
    },
    getRandomSymbol() {
      const random = Math.random();
      let cumulativeWeight = 0;
      for (let i = 0; i < this.symbols.length; i++) {
        cumulativeWeight += this.symbolWeights[i];
        if (random <= cumulativeWeight) {
          return this.symbols[i];
        }
      }
      return this.symbols[this.symbols.length - 1]; // Fallback
    },
    initializeLineColors() {
      this.lineColors = this.lines.map(() => this.getRandomColor());
    },
    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    spin() {
      if (this.showLines) {
        this.showLines = false;
      }

      if (this.isSpinning || this.balance <= 0) return;

      this.isSpinning = true;
      this.message = "";
      this.balance -= 10;
      this.winningPositions = [];
      this.visibleLines = [];

      const spinDuration = 500;
      const interval = setInterval(() => {
        this.reels = Array.from({ length: this.rows }, () =>
          Array.from({ length: this.cols }, () => this.getRandomSymbol())
        );
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        this.reels = Array.from({ length: this.rows }, () =>
          Array.from({ length: this.cols }, () => this.getRandomSymbol())
        );

        const win = this.checkWin();
        if (win > 0) {
          this.balance += win;
          this.message = `Gewonnen: $${win}`;
        } else {
          this.message = "Kein Gewinn!";
        }

        this.isSpinning = false;
      }, spinDuration);
    },
    checkWin() {
      let totalWin = 0;
      this.winningPositions = [];
      this.visibleLines = [];

      for (let lineIndex in this.lines) {
        const line = this.lines[lineIndex];
        const symbolsInLine = line.map(([row, col]) => this.reels[row][col]);

        const baseSymbol = symbolsInLine.find((symbol) => symbol !== "⭐");
        if (!baseSymbol) continue;

        const isWin = symbolsInLine.every(
          (symbol) => symbol === baseSymbol || symbol === "⭐"
        );

        if (isWin) {
          const containsOnlyBaseSymbol = symbolsInLine.every(
            (symbol) => symbol === baseSymbol
          );

          let lineWin = 0;
          if (["🍒", "🍋", "🍉"].includes(baseSymbol)) {
            lineWin = 100;
          } else if (baseSymbol === "🔔") {
            lineWin = 500;
          } else if (baseSymbol === "⭐") {
            lineWin = 250;
          }

          if (containsOnlyBaseSymbol) {
            lineWin *= 2; // Doppelt so viel Gewinn für reine Symbole
          }

          totalWin += lineWin;
          this.winningPositions.push(...line);
          this.visibleLines.push(this.getLineCoordinates(line));
        }
      }

      return totalWin;
    },
    getLineCoordinates(line) {
      const reelsContainer = this.$refs.reelsContainer;
      const { width, height } = reelsContainer.getBoundingClientRect();
      const cellWidth = width / this.cols;
      const cellHeight = height / this.rows;

      const points = line.map(([row, col]) => {
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;
        return `${x},${y}`;
      });

      return points.join(" ");
    },
    toggleShowLines() {
      this.showLines = !this.showLines;
      this.visibleLines = this.showLines
        ? this.lines.map((line) => this.getLineCoordinates(line))
        : [];
    },
    handleKeyDown(event) {
      if (event.code === "Space" && !this.isSpinning && this.balance > 0) {
        event.preventDefault();
        this.spin();
      }
    },
  },
};
</script>


<style scoped>
#slot-machine {
  margin: 50px auto;
  width: 400px;
}

#reels {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
}

.lines-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.row {
  display: flex;
  justify-content: space-between;
}

.reel {
  width: 60px;
  height: 60px;
  border: 2px solid #fff;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #444;
  position: relative;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 10px;
}

#balance {
  margin-top: 20px;
}
</style>
