// Initialize AOS
AOS.init({
  duration: 1000,
  once: true,
});

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Home Section Autotyper
const typed = new Typed(".autotype", {
  strings: ["ML Engineer", "Data Science", "AI Researcher"],
  typeSpeed: 100,
  backSpeed: 50,
  loop: true,
});

// Projects Swiper
const projectsSwiper = new Swiper(".projects-swiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  loop: true,
});

// Project Filtering
const filterBtns = document.querySelectorAll(".filter-btn");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    filterBtns.forEach((b) => b.classList.remove("active"));
    // Add active class to clicked button
    btn.classList.add("active");

    // Filter projects (this would be implemented with actual filtering logic)
    const filter = btn.getAttribute("data-filter");
    console.log(`Filtering projects by: ${filter}`);
  });
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Refresh ScrollTrigger to ensure it works correctly
ScrollTrigger.config({ limitCallbacks: true });

// Header animation
gsap.from("nav .logo", {
  opacity: 0,
  y: -50,
  duration: 1,
  ease: "power3.out",
  delay: 0.5,
});
gsap.from("nav ul li", {
  opacity: 0,
  y: -50,
  duration: 1,
  ease: "power3.out",
  stagger: 0.1,
  delay: 0.8,
});

// Make sure nav is visible on load
gsap.set("nav", { y: 0 });

// Header scroll effect
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// Home section animation
gsap.to("#home h1", {
  opacity: 1,
  y: 0,
  duration: 1,
  ease: "power3.out",
  delay: 1,
});

// About section animation
gsap.to(".about-image", {
  opacity: 1,
  x: 0,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".about-image",
    start: "top 80%",
  },
});

gsap.to(".about-text", {
  opacity: 1,
  x: 0,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".about-text",
    start: "top 80%",
  },
});

gsap.from(".about-card", {
  opacity: 0,
  y: 100,
  duration: 0.8,
  stagger: 0.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".about-cards",
    start: "top 80%",
  },
});

// Skills section animation
gsap.to(".skill-card", {
  opacity: 1,
  scale: 1,
  duration: 0.8,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".skills-grid",
    start: "top 80%",
  },
});

// Projects section animation
gsap.to(".projects-swiper", {
  opacity: 1,
  y: 0,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".projects-swiper",
    start: "top 80%",
  },
});

// Achievements section animation
gsap.from(".achievement-card", {
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: "#achievements",
    start: "top 80%",
  },
});

// Footer animation
gsap.from("footer .social-links a", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power3.out",
  stagger: 0.1,
});

// Three.js Scene Setup
let scenes = {};

// Home Section 3D Background
function initHomeScene() {
  const canvas = document.querySelector("#bg");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.setZ(30);

  // Create particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;

  const posArray = new Float32Array(particlesCount * 3);
  const colorArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
    colorArray[i] = Math.random();
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(posArray, 3)
  );
  particlesGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colorArray, 3)
  );

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Add some floating geometries
  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8),
    new THREE.OctahedronGeometry(1),
  ];

  const floatingObjects = [];

  for (let i = 0; i < 20; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random() * 0xffffff),
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50
    );

    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    mesh.scale.setScalar(Math.random() * 2 + 0.5);

    scene.add(mesh);
    floatingObjects.push(mesh);
  }

  // Lighting
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(pointLight, ambientLight);

  // Animation
  function animate() {
    requestAnimationFrame(animate);

    // Rotate particles
    particlesMesh.rotation.x += 0.0005;
    particlesMesh.rotation.y += 0.0005;

    // Rotate floating objects
    floatingObjects.forEach((object) => {
      object.rotation.x += 0.005;
      object.rotation.y += 0.005;
      object.rotation.z += 0.005;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  scenes.home = { scene, camera, renderer };
}

// Milestones Section 3D Background
// Contact Section 3D Background
// Initialize scenes when sections come into view
ScrollTrigger.create({
  trigger: "#home",
  onEnter: initHomeScene,
  once: true,
});

// Create Milestones Timeline
function createMilestonesTimeline() {
  const timeline = document.getElementById("timeline");

  // Milestone data (this would typically come from an API or data source)
  const milestones = [
    {
      date: "2024",
      title: "Top 10% Kaggle Notebook Expert",
      organization: "Kaggle",
      description:
        'Recognized as a "Kaggle Notebook Expert" and achieved "Top 10% Performer in Notebooks" on the Kaggle platform, demonstrating expertise in data science and machine learning through high-quality notebook contributions.',
      techStack: "Python, Data Science, Machine Learning, Data Analysis",
    },
    {
      date: "2024",
      title: "Portrait Generation using GANs",
      organization: "Personal Project",
      description:
        "Created and trained a GAN architecture to generate ultra-realistic portrait images. Built preprocessing pipelines for thousands of images and achieved generator and discriminator loss values of 0.8 and 0.6 with 80% accuracy in matching dataset characteristics.",
      techStack: "Python, TensorFlow, Keras, GAN Architecture",
    },
    {
      date: "2023",
      title: "Data Science Internship",
      organization: "Celebal Technologies",
      description:
        "Successfully completed a 3-month Data Science internship, developing and deploying a real-time AQI prediction system. Created a web scraping pipeline for 470+ Indian cities, enhanced data visualization clarity by 40%, and built a robust ML model achieving MSE of 2.3.",
      techStack:
        "Python, Machine Learning, Flask, Web Scraping, Plotly, Seaborn",
    },
    {
      date: "2023",
      title: "Skin Cancer Classification Model",
      organization: "Personal Project",
      description:
        "Designed an end-to-end deep learning pipeline using DenseNet121 for skin cancer classification. Implemented advanced data augmentation techniques resulting in 25% increase in model accuracy and achieved over 90% classification accuracy.",
      techStack: "Python, TensorFlow, DenseNet121, OpenCV, Data Augmentation",
    },
    {
      date: "2023",
      title: "KPMG Data Analytics Virtual Internship",
      organization: "KPMG",
      description:
        "Completed virtual internship program focused on data analytics consulting, gaining practical experience in real-world business data analysis and consulting methodologies.",
      techStack: "Data Analytics, Business Intelligence, Consulting",
    },
    {
      date: "2022",
      title: "Machine Learning and Data Science Certification",
      organization: "Scaler",
      description:
        "Completed comprehensive certification program in Machine Learning and Data Science, gaining advanced knowledge and practical skills in data analysis, predictive modeling, and machine learning algorithms.",
      techStack: "Machine Learning, Data Science, Python, Statistical Analysis",
    },
    {
      date: "2021",
      title: "AI Classroom Series Certification",
      organization: "Microsoft",
      description:
        "Completed the AI Classroom Series June Session from Microsoft, gaining foundational knowledge in artificial intelligence concepts, applications, and implementation strategies.",
      techStack:
        "Artificial Intelligence, Machine Learning Fundamentals, Azure AI",
    },
    {
      date: "2020",
      title: "B.Tech Computer Science Admission",
      organization: "Kalinga Institute of Industrial Technology (KIIT)",
      description:
        "Enrolled in Bachelor of Technology program in Computer Science and Communication Engineering, maintaining a CGPA of 8.54/10 throughout the program while developing multiple AI/ML projects.",
      techStack: "Computer Science, Engineering, AI/ML Fundamentals",
    },
  ];

  // Create timeline markers
  milestones.forEach((milestone, index) => {
    const marker = document.createElement("div");
    marker.className = "timeline-marker";
    marker.innerHTML = `
            <div class="marker-3d" id="marker-3d-${index}">
                <i class="fas fa-${
                  index % 3 === 0
                    ? "briefcase"
                    : index % 3 === 1
                    ? "graduation-cap"
                    : "project-diagram"
                }"></i>
            </div>
            <div class="timeline-content" data-aos="fade-up">
                <span class="date">${milestone.date}</span>
                <h3>${milestone.title}</h3>
                <h4>${milestone.organization}</h4>
                <p>${milestone.description}</p>
                <p class="tech-stack-label"></p>
                    <div class="tech-stack-tags" id="tech-stack-${index}"></div>
                </div>
            </div>
        `;
    timeline.appendChild(marker);
  });

  // Add 3D effects to milestone markers
  milestones.forEach((_, index) => {
    createMilestone3D(index);
  });

  // Add tech stack tags with animations
  setTimeout(() => {
    milestones.forEach((milestone, index) => {
      if (milestone.techStack) {
        const techStackContainer = document.getElementById(
          `tech-stack-${index}`
        );
        if (techStackContainer) {
          const techStackItems = milestone.techStack
            .split(",")
            .map((item) => item.trim());

          techStackItems.forEach((tech, techIndex) => {
            const tag = document.createElement("span");
            tag.className = "tech-stack-tag";
            tag.textContent = tech;
            tag.setAttribute("data-tech", tech.toLowerCase());
            tag.style.setProperty("--tech-index", techIndex);
            techStackContainer.appendChild(tag);

            // Add staggered animation
            setTimeout(() => {
              tag.classList.add("visible");
            }, techIndex * 100);

            // Add hover effects
            tag.addEventListener("mouseenter", function () {
              // Highlight all tags with the same technology across all milestones
              const allTags = document.querySelectorAll(".tech-stack-tag");
              allTags.forEach((otherTag) => {
                if (otherTag.getAttribute("data-tech") === tech.toLowerCase()) {
                  otherTag.style.background = "rgba(52, 152, 219, 0.3)";
                  otherTag.style.transform = "translateY(-2px)";
                  otherTag.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
                }
              });
            });

            tag.addEventListener("mouseleave", function () {
              // Remove highlight from all tags
              const allTags = document.querySelectorAll(".tech-stack-tag");
              allTags.forEach((otherTag) => {
                otherTag.style.background = "";
                otherTag.style.transform = "";
                otherTag.style.boxShadow = "";
              });
            });

            // Add click effect to highlight and zoom the tag
            tag.addEventListener("click", function () {
              // Reset all tags first
              const allTags = document.querySelectorAll(".tech-stack-tag");
              allTags.forEach((otherTag) => {
                otherTag.style.background = "";
                otherTag.style.transform = "";
                otherTag.style.boxShadow = "";
                otherTag.style.zIndex = "";
              });

              // Highlight clicked tag
              this.style.background = "rgba(52, 152, 219, 0.5)";
              this.style.transform = "scale(1.2) translateY(-5px)";
              this.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.3)";
              this.style.zIndex = "100";
              this.style.position = "relative";

              // Also highlight all other tags with the same technology
              allTags.forEach((otherTag) => {
                if (
                  otherTag.getAttribute("data-tech") === tech.toLowerCase() &&
                  otherTag !== this
                ) {
                  otherTag.style.background = "rgba(52, 152, 219, 0.3)";
                  otherTag.style.transform = "translateY(-2px)";
                  otherTag.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
                }
              });
            });
          });
        }
      }
    });
  }, 500);
}

// Create 3D effect for milestone markers
function createMilestone3D(index) {
  const container = document.getElementById(`marker-3d-${index}`);
  if (!container) return;

  // Create a simple 3D effect using CSS transforms
  container.addEventListener("mouseenter", () => {
    gsap.to(container, {
      rotationY: 360,
      duration: 1,
      ease: "power2.out",
    });
  });
}

// Initialize milestones timeline
document.addEventListener("DOMContentLoaded", () => {
  createMilestonesTimeline();
});

// Refresh ScrollTrigger after everything is loaded
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});

// Fallback to ensure elements are visible if animations fail
setTimeout(() => {
  // Ensure nav is visible
  gsap.set("nav", { y: 0 });

  // Ensure home content is visible
  gsap.set("#home h1", { opacity: 1, y: 0 });

  // Ensure about section is visible
  gsap.set(".about-image", { opacity: 1, x: 0 });
  gsap.set(".about-text", { opacity: 1, x: 0 });
  gsap.set(".about-card", { opacity: 1, y: 0 });

  // Ensure skills are visible
  gsap.set(".skill-card", { opacity: 1, scale: 1 });

  // Ensure projects are visible
  gsap.set(".projects-swiper", { opacity: 1, y: 0 });
}, 3000); // 3 second fallback

// Stats functionality - Fetch GitHub data and count skills
const Stats = {
  CONFIG: {
    GITHUB_USERNAME: "BlamerX",
    CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
  },

  /**
   * Fetch GitHub repository count
   * @param {string} username - GitHub username
   * @returns {Promise<number>} - Number of public repositories
   */
  fetchGitHubRepos: async function (username) {
    try {
      // Check if we have cached data and it's not too old
      const cachedData = localStorage.getItem(`github_repos_${username}`);
      const cacheTime = localStorage.getItem(`github_repos_${username}_time`);

      if (
        cachedData &&
        cacheTime &&
        Date.now() - parseInt(cacheTime) < this.CONFIG.CACHE_DURATION
      ) {
        console.log("Using cached GitHub data");
        return parseInt(cachedData);
      }

      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const userData = await response.json();
      const repoCount = userData.public_repos;

      // Cache the data
      localStorage.setItem(`github_repos_${username}`, repoCount.toString());
      localStorage.setItem(
        `github_repos_${username}_time`,
        Date.now().toString()
      );

      return repoCount;
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
      // Try to return cached data if available
      const cachedData = localStorage.getItem(`github_repos_${username}`);
      if (cachedData) {
        return parseInt(cachedData);
      }
      // Return a default value
      return 0;
    }
  },

  /**
   * Count skills from the skills section
   * @returns {number} - Number of skills
   */
  countSkills: function () {
    try {
      // Count skill cards in the skills section
      const skillCards = document.querySelectorAll(".skill-card");
      return skillCards.length;
    } catch (error) {
      console.error("Error counting skills:", error);
      // Return a default value
      return 0;
    }
  },

  /**
   * Update the stats on the page
   */
  updateStats: async function () {
    // Show loading states
    const githubReposElement = document.getElementById("github-repos");
    const kaggleNotebooksElement = document.getElementById("kaggle-notebooks");
    const totalSkillsElement = document.getElementById("total-skills");

    // Add loading indicators
    if (githubReposElement) githubReposElement.textContent = "...";
    if (kaggleNotebooksElement) kaggleNotebooksElement.textContent = "...";
    if (totalSkillsElement) totalSkillsElement.textContent = "...";

    // Fetch data
    const repoCount = await this.fetchGitHubRepos(this.CONFIG.GITHUB_USERNAME);
    const skillCount = this.countSkills();

    // Update the DOM
    if (githubReposElement) {
      githubReposElement.textContent = repoCount;
    }

    // For Kaggle notebooks, we'll use a default value since there's no public API
    if (kaggleNotebooksElement) {
      // This would need to be updated manually or with a different approach
      kaggleNotebooksElement.textContent = "25"; // Placeholder value
    }

    if (totalSkillsElement) {
      totalSkillsElement.textContent = skillCount;
    }
  },
};

// Initialize stats when the DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    Stats.updateStats();
  });
} else {
  Stats.updateStats();
}
