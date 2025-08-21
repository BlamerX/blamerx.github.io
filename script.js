document.addEventListener("DOMContentLoaded", function() {
    /* -------------------
	Home Section Autotyper
------------------- */

const typed = new Typed('.autotype', {
    strings: ['ML Engineer', 'AI Enthusiast', 'Data Scientist'],
    typeSpeed: 100,
    backSpeed: 50,
    loop: true
});

const projectsSwiper = new Swiper('.projects-swiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
    },
});

/* -------------------
	Animations
------------------- */

gsap.registerPlugin(ScrollTrigger);

// Refresh ScrollTrigger to ensure it works correctly
ScrollTrigger.config({ limitCallbacks: true });

// Header animation
gsap.from('nav .logo', { opacity: 0, y: -50, duration: 1, ease: 'power3.out', delay: 0.5 });
gsap.from('nav ul li', { opacity: 0, y: -50, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.8 });

// Make sure nav is visible on load
gsap.set('nav', { y: 0 });

// Header scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Home section animation
gsap.to('#home h1', { 
    opacity: 1, 
    y: 0,
    duration: 1, 
    ease: 'power3.out', 
    delay: 1 
});

// About section animation
gsap.to('.about-image', {
    opacity: 1,
    x: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about-image',
        start: 'top 80%',
    }
});

gsap.to('.about-text', {
    opacity: 1,
    x: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about-text',
        start: 'top 80%',
    }
});

gsap.from('.about-card', {
    opacity: 0,
    y: 100,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about-cards',
        start: 'top 80%',
    }
});

// Skills section animation
gsap.to('.skill-card', {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.skills-grid',
        start: 'top 80%',
    }
});

// Projects section animation
gsap.to('.projects-swiper', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.projects-swiper',
        start: 'top 80%',
    }
});

// Footer animation
gsap.from('footer .social-links a', {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.1,
    scrollTrigger: {
        trigger: 'footer',
        start: 'top 90%',
    }
});

/* -------------------
	Smooth Scrolling
------------------- */

const lenis = new Lenis();

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

/* -------------------
	3D Background
------------------- */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshStandardMaterial({ color: 0x3498db });

for (let i = 0; i < 50; i++) {
    const mesh = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

    mesh.position.set(x, y, z);
    scene.add(mesh);
}

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

function animate() {
    requestAnimationFrame(animate);

    scene.rotation.x += 0.001;
    scene.rotation.y += 0.001;

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* -------------------
	About Section Animation
------------------- */

let aboutRenderer, aboutScene, aboutCamera, aboutParticles;

function initAboutAnimation() {
    const canvas = document.querySelector('#about-bg');
    aboutRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    aboutRenderer.setPixelRatio(window.devicePixelRatio);
    aboutRenderer.setSize(window.innerWidth, window.innerHeight);

    aboutScene = new THREE.Scene();
    aboutCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    aboutCamera.position.z = 50;

    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 100;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x5dade2,
        size: 0.2,
    });
    aboutParticles = new THREE.Points(particleGeometry, particleMaterial);
    aboutScene.add(aboutParticles);

    animateAbout();
}

function animateAbout() {
    requestAnimationFrame(animateAbout);
    aboutParticles.rotation.x += 0.0001;
    aboutParticles.rotation.y += 0.0002;
    aboutRenderer.render(aboutScene, aboutCamera);
}

ScrollTrigger.create({
    trigger: "#about",
    onEnter: initAboutAnimation,
    onLeaveBack: () => {
        aboutRenderer.dispose();
    }
});

/* -------------------
	Skills Section Animation
------------------- */

let skillsRenderer, skillsScene, skillsCamera, skillsObjects = [];

function initSkillsAnimation() {
    const canvas = document.querySelector('#skills-bg');
    skillsRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    skillsRenderer.setPixelRatio(window.devicePixelRatio);
    skillsRenderer.setSize(window.innerWidth, window.innerHeight);

    skillsScene = new THREE.Scene();
    skillsCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    skillsCamera.position.z = 50;

    const geometries = [
        new THREE.BoxGeometry(5, 5, 5),
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.ConeGeometry(3, 5, 32),
        new THREE.TorusGeometry(3, 1, 16, 100),
        new THREE.DodecahedronGeometry(4),
    ];

    for (let i = 0; i < 20; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            wireframe: true,
        });
        const object = new THREE.Mesh(geometry, material);

        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
        object.position.set(x, y, z);

        const [rx, ry, rz] = Array(3).fill().map(() => Math.random() * 0.01);
        object.rotation.set(rx, ry, rz);

        skillsObjects.push(object);
        skillsScene.add(object);
    }

    const pointLight = new THREE.PointLight(0xffffff, 1, 500);
    pointLight.position.set(10, 10, 10);
    skillsScene.add(pointLight);

    animateSkills();
}

function animateSkills() {
    requestAnimationFrame(animateSkills);

    skillsObjects.forEach(object => {
        object.rotation.x += 0.001;
        object.rotation.y += 0.001;
    });

    skillsRenderer.render(skillsScene, skillsCamera);
}

ScrollTrigger.create({
    trigger: "#skills",
    onEnter: initSkillsAnimation,
    onLeaveBack: () => {
        skillsRenderer.dispose();
    }
});

/* -------------------
	Projects Section Animation
------------------- */

let projectsRenderer, projectsScene, projectsCamera, projectsCubes = [];

function initProjectsAnimation() {
    const canvas = document.querySelector('#projects-bg');
    projectsRenderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    projectsRenderer.setPixelRatio(window.devicePixelRatio);
    projectsRenderer.setSize(window.innerWidth, window.innerHeight);

    projectsScene = new THREE.Scene();
    projectsCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    projectsCamera.position.z = 100;

    const cubeSize = 10;
    const gridSize = 10;
    const spacing = 15;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            const material = new THREE.MeshStandardMaterial({
                color: 0x5dade2,
                wireframe: true,
            });
            const cube = new THREE.Mesh(geometry, material);

            const x = (i - gridSize / 2) * spacing;
            const y = (j - gridSize / 2) * spacing;

            cube.position.set(x, y, 0);
            projectsCubes.push(cube);
            projectsScene.add(cube);
        }
    }

    const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight.position.set(0, 0, 50);
    projectsScene.add(pointLight);

    animateProjects();
}

function animateProjects() {
    requestAnimationFrame(animateProjects);

    projectsCubes.forEach(cube => {
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
    });

    projectsScene.rotation.z += 0.001;

    projectsRenderer.render(projectsScene, projectsCamera);
}

ScrollTrigger.create({
    trigger: "#projects",
    onEnter: initProjectsAnimation,
    onLeaveBack: () => {
        projectsRenderer.dispose();
    }
});

/* -------------------
	Vanilla Tilt
------------------- */

VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
    max: 25,
    speed: 400
});

// Refresh ScrollTrigger after everything is loaded
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// Fallback to ensure elements are visible if animations fail
setTimeout(() => {
    // Ensure nav is visible
    gsap.set('nav', { y: 0 });
    
    // Ensure home content is visible
    gsap.set('#home h1', { opacity: 1, y: 0 });
    
    // Ensure about section is visible
    gsap.set('.about-image', { opacity: 1, x: 0 });
    gsap.set('.about-text', { opacity: 1, x: 0 });
    gsap.set('.about-card', { opacity: 1, y: 0 });
    
    // Ensure skills are visible
    gsap.set('.skill-card', { opacity: 1, scale: 1 });
    
    // Ensure projects are visible
    gsap.set('.projects-swiper', { opacity: 1, y: 0 });
}, 3000); // 3 second fallback
});