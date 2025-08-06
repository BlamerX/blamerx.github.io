// Projects section specific JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize animations for projects section
  initProjectsAnimations();
});

function initProjectsAnimations() {
  // Wait for the projects section to be loaded
  const checkProjectsSection = setInterval(() => {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      clearInterval(checkProjectsSection);

      const projectCards = projectsSection.querySelectorAll(".project-card");

      const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("animated");
            }, index * 100); // Stagger the animations
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      projectCards.forEach((card) => observer.observe(card));
    }
  }, 100);
}
