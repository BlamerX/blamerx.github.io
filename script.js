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
// ML Animation removed as requested
// Contact form removed as requested
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
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  aboutCards.forEach((card) => observer.observe(card));
  skillCategories.forEach((category) => observer.observe(category));
  projectCards.forEach((card) => observer.observe(card));
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
