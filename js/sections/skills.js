// Skills section specific JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize animations for skills section
  initSkillsAnimations();
});

function initSkillsAnimations() {
  // Wait for the skills section to be loaded
  const checkSkillsSection = setInterval(() => {
    const skillsSection = document.getElementById("skills");
    if (skillsSection) {
      clearInterval(checkSkillsSection);

      const skillCategories = skillsSection.querySelectorAll(".skill-category");

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

      skillCategories.forEach((category) => observer.observe(category));
    }
  }, 100);
}
