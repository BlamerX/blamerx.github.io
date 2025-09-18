// Preloader
window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 300);
    }, 500);
  }
});

// Mobile Navigation Toggle
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
  })
);

// Header scroll effect
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Smooth scrolling for anchor links
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

// Auto-typing effect
const typed = new Typed(".auto-type", {
  strings: [
    "Data Science Engineer",
    "Machine Learning Engineer",
    "Data Scientist",
    "AI Researcher",
  ],
  typeSpeed: 100,
  backSpeed: 50,
  loop: true,
});

// Simple animation on scroll
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animated");
    }
  });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll("section").forEach((section) => {
  observer.observe(section);
});

// Project card hover effect enhancement
const projectCards = document.querySelectorAll(".project-card");
projectCards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-10px)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0)";
  });
});

// Skill category hover effect
const skillCategories = document.querySelectorAll(".skill-category");
skillCategories.forEach((category) => {
  category.addEventListener("mouseenter", () => {
    category.style.transform = "translateY(-5px)";
  });

  category.addEventListener("mouseleave", () => {
    category.style.transform = "translateY(0)";
  });
});

// Button hover effects
const buttons = document.querySelectorAll(".btn");
buttons.forEach((button) => {
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-3px)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
  });
});

// Back to top button
const backToTopButton = document.createElement("button");
backToTopButton.innerHTML = "&uarr;";
backToTopButton.classList.add("back-to-top");
document.body.appendChild(backToTopButton);

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
});

backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
