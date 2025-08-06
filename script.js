// Initialize AOS
AOS.init({
  duration: 800,
  once: true,
  offset: 100,
});
// Hide loader when page is loaded
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hidden");
  }, 500);
  // Initialize animations for elements when they enter viewport
  initScrollAnimations();
});
// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});
// Navbar scroll effect
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: "smooth",
      });
    }
  });
});
// Scroll progress bar
const scrollProgress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const scrollPosition = window.scrollY;
  const scrollPercentage = (scrollPosition / scrollHeight) * 100;
  scrollProgress.style.width = `${scrollPercentage}%`;
});
// Back to top button
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});
backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
// Typing effect for hero title (removed cursor)
const typed = new Typed(".typed-text", {
  strings: ["Machine Learning^1000", "Deep Learning^1000", "AI Systems^1000"],
  typeSpeed: 80,
  backSpeed: 40,
  loop: true,
  showCursor: false,
});
// ML Model Animation - Enhanced Logic
const mlModel = document.getElementById("mlModel");
const modelContainer = mlModel.querySelector(".model-container");
// Define node positions
const nodes = [
  // Input layer
  { id: "i1", x: 50, y: 75, type: "input", label: "I1" },
  { id: "i2", x: 50, y: 150, type: "input", label: "I2" },
  { id: "i3", x: 50, y: 225, type: "input", label: "I3" },
  // Hidden layer
  { id: "h1", x: 200, y: 50, type: "hidden", label: "H1" },
  { id: "h2", x: 200, y: 125, type: "hidden", label: "H2" },
  { id: "h3", x: 200, y: 200, type: "hidden", label: "H3" },
  { id: "h4", x: 200, y: 275, type: "hidden", label: "H4" },
  // Output layer
  { id: "o1", x: 350, y: 100, type: "output", label: "O1" },
  { id: "o2", x: 350, y: 200, type: "output", label: "O2" },
];
// Define connections
const connections = [
  // Input to Hidden
  { from: "i1", to: "h1" },
  { from: "i1", to: "h2" },
  { from: "i1", to: "h3" },
  { from: "i2", to: "h2" },
  { from: "i2", to: "h3" },
  { from: "i2", to: "h4" },
  { from: "i3", to: "h2" },
  { from: "i3", to: "h3" },
  { from: "i3", to: "h4" },
  // Hidden to Output
  { from: "h1", to: "o1" },
  { from: "h2", to: "o1" },
  { from: "h2", to: "o2" },
  { from: "h3", to: "o1" },
  { from: "h3", to: "o2" },
  { from: "h4", to: "o2" },
];
// Create nodes
nodes.forEach((node) => {
  const nodeElement = document.createElement("div");
  nodeElement.className = `model-node ${node.type}`;
  nodeElement.id = node.id;
  nodeElement.style.left = `${node.x}px`;
  nodeElement.style.top = `${node.y}px`;
  nodeElement.textContent = node.label;
  modelContainer.appendChild(nodeElement);
});
// Create connections
connections.forEach((conn) => {
  const fromNode = nodes.find((n) => n.id === conn.from);
  const toNode = nodes.find((n) => n.id === conn.to);
  const connection = document.createElement("div");
  connection.className = "connection";
  // Calculate angle and length for connection
  const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
  const distance = Math.sqrt(
    Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)
  );
  connection.style.width = `${distance}px`;
  connection.style.left = `${fromNode.x + 15}px`;
  connection.style.top = `${fromNode.y + 15}px`;
  connection.style.transform = `rotate(${angle}rad)`;
  modelContainer.appendChild(connection);
});
// Create data packets
const packets = [];
const packetPaths = [
  // Path 1: i1 -> h2 -> o1
  [
    { nodeId: "i1", duration: 1000 },
    { nodeId: "h2", duration: 1000 },
    { nodeId: "o1", duration: 1000 },
  ],
  // Path 2: i2 -> h3 -> o2
  [
    { nodeId: "i2", duration: 1200 },
    { nodeId: "h3", duration: 1200 },
    { nodeId: "o2", duration: 1200 },
  ],
  // Path 3: i3 -> h4 -> o2
  [
    { nodeId: "i3", duration: 1400 },
    { nodeId: "h4", duration: 1400 },
    { nodeId: "o2", duration: 1400 },
  ],
  // Path 4: i1 -> h1 -> o1
  [
    { nodeId: "i1", duration: 1600 },
    { nodeId: "h1", duration: 1600 },
    { nodeId: "o1", duration: 1600 },
  ],
];
// Create packets for each path
packetPaths.forEach((path, pathIndex) => {
  const packet = document.createElement("div");
  packet.className = "data-packet";
  modelContainer.appendChild(packet);
  packets.push({
    element: packet,
    path: path,
    currentStep: 0,
    progress: 0,
    startTime: Date.now() + pathIndex * 400, // Stagger start times
  });
});
// Animate packets
function animatePackets() {
  const currentTime = Date.now();
  packets.forEach((packet) => {
    if (currentTime < packet.startTime) return;
    const currentStep = packet.path[packet.currentStep];
    const nextStep = packet.path[packet.currentStep + 1];
    if (!nextStep) {
      // Reset to beginning of path
      packet.currentStep = 0;
      packet.progress = 0;
      return;
    }
    // Calculate progress based on time
    const elapsed = currentTime - packet.startTime;
    const stepDuration = currentStep.duration;
    const totalElapsedForStep =
      elapsed % packet.path.reduce((sum, step) => sum + step.duration, 0);
    // Find current step based on elapsed time
    let accumulatedTime = 0;
    for (let i = 0; i < packet.path.length - 1; i++) {
      accumulatedTime += packet.path[i].duration;
      if (totalElapsedForStep < accumulatedTime) {
        packet.currentStep = i;
        packet.progress =
          (totalElapsedForStep - (accumulatedTime - packet.path[i].duration)) /
          packet.path[i].duration;
        break;
      }
    }
    // Get current and next nodes
    const fromNode = nodes.find(
      (n) => n.id === packet.path[packet.currentStep].nodeId
    );
    const toNode = nodes.find(
      (n) => n.id === packet.path[packet.currentStep + 1].nodeId
    );
    // Calculate position
    const x = fromNode.x + 15 + (toNode.x - fromNode.x) * packet.progress - 5;
    const y = fromNode.y + 15 + (toNode.y - fromNode.y) * packet.progress - 5;
    packet.element.style.left = `${x}px`;
    packet.element.style.top = `${y}px`;
  });
  requestAnimationFrame(animatePackets);
}
animatePackets();
// Add layer labels
const labels = [
  { text: "Input", x: 50, y: 20 },
  { text: "Hidden", x: 200, y: 20 },
  { text: "Output", x: 350, y: 20 },
];
labels.forEach((label) => {
  const labelElement = document.createElement("div");
  labelElement.className = "model-label";
  labelElement.textContent = label.text;
  labelElement.style.left = `${label.x}px`;
  labelElement.style.top = `${label.y}px`;
  labelElement.style.transform = "translateX(-50%)";
  modelContainer.appendChild(labelElement);
});
// Contact form submission
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // Get form values
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  // Here you would typically send the form data to a server
  // For now, we'll just show a success message
  showConfetti();
  alert(`Thank you for your message, ${name}! I'll get back to you soon.`);
  // Reset form
  contactForm.reset();
});
// Initialize particles.js
particlesJS("particles-js", {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: "#6366f1" },
    shape: { type: "circle" },
    opacity: { value: 0.5, random: true },
    size: { value: 3, random: true },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#6366f1",
      opacity: 0.1,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: true, mode: "repulse" },
      onclick: { enable: true, mode: "push" },
      resize: true,
    },
  },
});
// Initialize animations for elements when they enter viewport
function initScrollAnimations() {
  const aboutCards = document.querySelectorAll(".about-card");
  const skillCategories = document.querySelectorAll(".skill-category");
  const projectCards = document.querySelectorAll(".project-card");
  const contactItems = document.querySelectorAll(".contact-item");
  const contactForm = document.querySelector(".contact-form");
  // Intersection Observer for animations
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
  };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("about-card")) {
          entry.target.classList.add("animated");
        } else if (entry.target.classList.contains("skill-category")) {
          entry.target.classList.add("animated");
        } else if (entry.target.classList.contains("project-card")) {
          entry.target.classList.add("animated");
        } else if (entry.target.classList.contains("contact-item")) {
          entry.target.classList.add("animated");
        } else if (entry.target.classList.contains("contact-form")) {
          entry.target.classList.add("animated");
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  aboutCards.forEach((card) => observer.observe(card));
  skillCategories.forEach((category) => observer.observe(category));
  projectCards.forEach((card) => observer.observe(card));
  contactItems.forEach((item) => observer.observe(item));
  observer.observe(contactForm);
}
// Confetti effect
function showConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const confetti = [];
  const confettiCount = 150;
  const gravity = 0.5;
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f8fafc"];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: -20,
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
      speed: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < confetti.length; i++) {
      const c = confetti[i];
      ctx.save();
      ctx.translate(c.x + c.width / 2, c.y + c.height / 2);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
      ctx.restore();
      c.y += c.speed;
      c.speed += gravity;
      c.rotation += c.rotationSpeed;
      if (c.y > canvas.height) {
        confetti.splice(i, 1);
        i--;
      }
    }
    if (confetti.length > 0) {
      requestAnimationFrame(drawConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  drawConfetti();
}
