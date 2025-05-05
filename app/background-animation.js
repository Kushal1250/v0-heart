// Function to create heart particles for the home page
function createHeartParticles() {
  const container = document.querySelector(".home-bg-animation")
  if (!container) return

  const particleCount = 20

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div")
    particle.classList.add("heart-particle")

    // Random positioning and sizing
    const size = Math.random() * 60 + 20 // 20-80px
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.left = `${Math.random() * 100}%`

    // Random animation delay
    particle.style.animationDelay = `${Math.random() * 15}s`

    container.appendChild(particle)
  }
}

// Function to create bubbles for the signup page
function createBubbles() {
  const container = document.querySelector(".signup-bg-animation")
  if (!container) return

  const bubbleCount = 25

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement("div")
    bubble.classList.add("bubble")

    // Random sizing and positioning
    const size = Math.random() * 100 + 50 // 50-150px
    bubble.style.width = `${size}px`
    bubble.style.height = `${size}px`
    bubble.style.left = `${Math.random() * 100}%`
    bubble.style.bottom = `-${size}px`

    // Random animation duration and delay
    const duration = Math.random() * 10 + 15 // 15-25s
    const delay = Math.random() * 15
    bubble.style.animationDuration = `${duration}s`
    bubble.style.animationDelay = `${delay}s`

    container.appendChild(bubble)
  }
}

// Function to create timeline dots for history page
function createTimelineDots() {
  const container = document.querySelector(".history-bg-animation")
  if (!container) return

  const dotCount = 80

  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement("div")
    dot.classList.add("timeline-dot")

    // Random positioning
    dot.style.left = `${Math.random() * 100}%`
    dot.style.top = `${Math.random() * 100}%`

    // Random animation delay
    dot.style.animationDelay = `${Math.random() * 8}s`

    container.appendChild(dot)
  }
}

// Function to create step indicators for "How It Works" page
function createStepIndicators() {
  const container = document.querySelector(".how-it-works-bg-animation")
  if (!container) return

  const indicatorCount = 15

  for (let i = 0; i < indicatorCount; i++) {
    const indicator = document.createElement("div")
    indicator.classList.add("step-indicator")

    // Positioning with equal spacing
    indicator.style.top = `${(i * 100) / indicatorCount}%`
    indicator.style.left = `${Math.random() * 20 + 5}%`

    // Random animation delay
    indicator.style.animationDelay = `${Math.random() * 5}s`

    // Random rotation
    const rotation = Math.random() * 20 - 10 // -10 to 10 degrees
    indicator.style.transform = `rotate(${rotation}deg)`

    container.appendChild(indicator)
  }
}

// Function to create pulse dots for dashboard
function createPulseDots() {
  const container = document.querySelector(".dashboard-bg-animation")
  if (!container) return

  const rows = 20
  const cols = 20

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const dot = document.createElement("div")
      dot.classList.add("pulse-dot")

      // Grid positioning
      dot.style.top = `${(i * 100) / rows}%`
      dot.style.left = `${(j * 100) / cols}%`

      // Random animation delay
      dot.style.animationDelay = `${Math.random() * 4}s`

      container.appendChild(dot)
    }
  }
}

// Function to create pulse rings for footer
function createFooterPulseRings() {
  const footers = document.querySelectorAll("footer")

  footers.forEach((footer) => {
    const pulseContainer = document.createElement("div")
    pulseContainer.classList.add("footer-pulse-container")

    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("div")
      ring.classList.add("footer-pulse-ring")
      pulseContainer.appendChild(ring)
    }

    footer.style.position = "relative"
    footer.appendChild(pulseContainer)
  })
}

// Initialize all animations when DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create global background effect for all pages
  const body = document.body
  const globalBg = document.createElement("div")
  globalBg.classList.add("global-bg-animation")
  body.appendChild(globalBg)

  // Initialize page-specific animations
  createHeartParticles()
  createBubbles()
  createTimelineDots()
  createStepIndicators()
  createPulseDots()
  createFooterPulseRings()
})
