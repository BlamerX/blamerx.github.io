// Contact section specific JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Initialize animations for contact section
  initContactAnimations();
});

function initContactAnimations() {
  // Wait for the contact section to be loaded
  const checkContactSection = setInterval(() => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      clearInterval(checkContactSection);

      const contactItems = contactSection.querySelectorAll(".contact-item");
      const contactForm = contactSection.querySelector(".contact-form");

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

      contactItems.forEach((item) => observer.observe(item));
      if (contactForm) {
        observer.observe(contactForm);
      }
    }
  }, 100);
}
