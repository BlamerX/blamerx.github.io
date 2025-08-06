// About section specific JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize animations for about section elements
  initAboutAnimations();
});

function initAboutAnimations() {
  // Wait for the about section to be loaded
  const checkAboutSection = setInterval(() => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      clearInterval(checkAboutSection);

      // Animate stat items when they come into view
      const statItems = aboutSection.querySelectorAll(".stat-item");
      const aboutCards = aboutSection.querySelectorAll(".about-card");

      const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains("stat-item")) {
              entry.target.classList.add("animated");
            } else if (entry.target.classList.contains("about-card")) {
              entry.target.classList.add("animated");
            }
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      statItems.forEach((item) => observer.observe(item));
      aboutCards.forEach((card) => observer.observe(card));
    }
  }, 100);
}
