const launchBtn = document.getElementById("launchBtn");
const blastContainer = document.getElementById("blast-container");

function startBlast() {
  // Prevent multiple triggers
  if (window.blastStarted) return;
  window.blastStarted = true;

  // Start spawning particles continuously
  const spawn = setInterval(() => {
    for (let i = 0; i < 8; i++) {  // spawn multiple per tick
      const particle = document.createElement("div");
      particle.classList.add("particle");

      // Random horizontal position
      particle.style.left = `${Math.random() * 100}vw`;

      // Random size
      particle.style.width = particle.style.height = `${Math.random() * 12 + 6}px`;

      // Random color
      const colors = ["#007bff", "#28a745", "#ff5733", "#ffc107", "#6f42c1", "#17a2b8"];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];

      // Random duration for natural fall
      particle.style.animationDuration = `${2 + Math.random() * 2}s`;

      blastContainer.appendChild(particle);

      // Clean up after animation
      setTimeout(() => {
        particle.remove();
      }, 4000);
    }
  }, 200); // spawn every 200ms

  // Redirect after 2 seconds (adjust if needed)
  setTimeout(() => {
    clearInterval(spawn);
    window.location.href = "/landing/index.html"; // change link here
  }, 2000);
}

// Handle click
launchBtn.addEventListener("click", startBlast);

// Handle Spacebar key press
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // prevent page scroll
    startBlast();
  }
});
