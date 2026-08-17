import { animate } from "../animation.js";
import config from "../config.js";

let timerInterval = null;
let soundEnabled = true;
let currentMode = "standard"; // "standard", "hours", "seconds"

// Web Audio API tick generator
let audioCtx = null;
function playTickSound(freq = 600, duration = 0.08) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore audio error if unsupported
  }
}

// Spawn floating heart animation at click position
function spawnClickEffect(x, y, char = "❤️") {
  const heart = document.createElement("div");
  heart.className = "click-heart";
  heart.textContent = char;
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  const container = document.getElementById("countdownOverlay") || document.body;
  container.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 1400);
}


export function initCountdown() {
  const recipientName = process.env.NAME || config.name || "Dear Friend";
  const rawDate = process.env.OPEN_DATE || config.birthDate || "2026-08-23";
  const targetTime = new Date(rawDate + "T00:00:00").getTime();

  document.title = `Counting down for ${recipientName}! ⏳`;

  // Create an overlay container over body so original HTML structure remains intact
  let overlay = document.getElementById("countdownOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "countdownOverlay";
    overlay.className = "countdown-container";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.zIndex = "999999";
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="countdown-bg-glow"></div>

    <div class="countdown-badge">
      <span>✨ Birthday Countdown</span>
    </div>

    <h1 class="countdown-title">Counting Down for ${recipientName} 🎂</h1>
    <p class="countdown-subtitle">
      Something special is waiting for you! We're counting down the moments until your big day arrives.
    </p>

    <div class="counter-grid" id="counterGrid"></div>

    <div class="counter-controls">
      <button class="mode-btn active" data-mode="standard">⏱️ Standard</button>
      <button class="mode-btn" data-mode="hours">⏳ Total Hours</button>
      <button class="mode-btn" data-mode="seconds">⚡ Total Seconds</button>
      <button class="mode-btn" id="soundToggleBtn">🔊 Sound ON</button>
    </div>

    <div class="counter-controls" style="margin-top: 1rem;">
      <button class="action-btn action-btn--primary" id="hugBtn">🤗 Send Warm Hug</button>
    </div>


    <!-- Modal Popup for Virtual Hug -->
    <div class="countdown-modal-overlay" id="hugModal">
      <div class="countdown-modal">
        <button class="modal-close-btn" id="closeModalBtn">&times;</button>
        <h2 class="modal-title">A Hug for ${recipientName}! 🤗</h2>
        <div class="modal-body">
          <p>Sending you lots of warmth, happiness, and excitement as we count down to your special day! 💖✨</p>
        </div>
        <button class="action-btn action-btn--primary" id="sendMoreLoveBtn">💖 Send More Love</button>
      </div>
    </div>
  `;

  const counterGrid = document.getElementById("counterGrid");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const hugBtn = document.getElementById("hugBtn");
  const hugModal = document.getElementById("hugModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const sendMoreLoveBtn = document.getElementById("sendMoreLoveBtn");


  const unlockCelebration = () => {
    clearInterval(timerInterval);
    if (overlay && overlay.parentNode) {
      overlay.style.transition = "opacity 0.5s ease";
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        document.title = "Happy Birthday to You!!!";
        animate();
      }, 500);
    } else {
      document.title = "Happy Birthday to You!!!";
      animate();
    }
  };

  // Mode switcher listeners
  document.querySelectorAll(".mode-btn[data-mode]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".mode-btn[data-mode]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.getAttribute("data-mode");
      playTickSound(800, 0.1);
      updateCountdown();
    });
  });

  // Sound toggle listener
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
    if (soundEnabled) playTickSound(900, 0.1);
  });

  // Hug Modal listeners
  hugBtn.addEventListener("click", (e) => {
    hugModal.classList.add("active");
    playTickSound(700, 0.12);
    spawnClickEffect(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, "🤗");
  });

  closeModalBtn.addEventListener("click", () => {
    hugModal.classList.remove("active");
  });

  hugModal.addEventListener("click", (e) => {
    if (e.target === hugModal) hugModal.classList.remove("active");
  });

  sendMoreLoveBtn.addEventListener("click", (e) => {
    const emojis = ["❤️", "💖", "🎉", "✨", "🎁", "🎂", "🎈", "💌", "🥰"];
    const btnRect = sendMoreLoveBtn.getBoundingClientRect();
    const startX = btnRect.left + btnRect.width / 2;
    const startY = btnRect.top + btnRect.height / 2;

    for (let i = 0; i < 16; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * 280;
        const offsetY = (Math.random() - 0.5) * 120;
        const x = startX + offsetX;
        const y = startY + offsetY;
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        spawnClickEffect(x, y, emoji);
        playTickSound(450 + i * 40, 0.06);
      }, i * 70);
    }
  });


  let prevValues = {};


  function updateCountdown() {
    const now = Date.now();
    const diff = targetTime - now;

    if (diff <= 0) {
      // Date reached!
      clearInterval(timerInterval);
      counterGrid.innerHTML = `
        <div style="font-size: 3rem; color: #ff9ebb; text-align: center; margin: 2rem 0;">
          🎉 IT'S TIME! HAPPY BIRTHDAY! 🎂
        </div>
        <button class="action-btn action-btn--primary" id="enterCelebrationBtn" style="font-size: 2rem; padding: 1.2rem 3rem;">
          Enter Celebration ✨
        </button>
      `;
      const enterBtn = document.getElementById("enterCelebrationBtn");
      if (enterBtn) {
        enterBtn.addEventListener("click", () => {
          unlockCelebration();
        });
      }
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / (3600 * 24));
    const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const totalHours = Math.floor(totalSecs / 3600);

    let cardsData = [];

    if (currentMode === "standard") {
      cardsData = [
        { id: "days", label: "Days", value: String(days).padStart(2, "0") },
        { id: "hours", label: "Hours", value: String(hours).padStart(2, "0") },
        { id: "mins", label: "Minutes", value: String(minutes).padStart(2, "0") },
        { id: "secs", label: "Seconds", value: String(seconds).padStart(2, "0") },
      ];
    } else if (currentMode === "hours") {
      cardsData = [
        { id: "thours", label: "Total Hours", value: String(totalHours).padStart(2, "0") },
        { id: "mins", label: "Minutes", value: String(minutes).padStart(2, "0") },
        { id: "secs", label: "Seconds", value: String(seconds).padStart(2, "0") },
      ];
    } else {
      cardsData = [
        { id: "tsecs", label: "Total Seconds", value: String(totalSecs).toLocaleString() },
      ];
    }

    counterGrid.innerHTML = cardsData
      .map(
        (card) => `
        <div class="counter-card ${prevValues[card.id] !== card.value ? "pop-effect" : ""}" data-unit="${card.id}">
          <div class="counter-number">${card.value}</div>
          <div class="counter-label">${card.label}</div>
        </div>
      `
      )
      .join("");

    // Attach click listeners to cards for interactive hearts & tick sound
    document.querySelectorAll(".counter-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        playTickSound(750, 0.1);
        const emojis = ["❤️", "✨", "🎉", "💖", "⭐"];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        spawnClickEffect(e.clientX, e.clientY, randomEmoji);
      });
    });

    cardsData.forEach((c) => {
      prevValues[c.id] = c.value;
    });
  }

  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
}
