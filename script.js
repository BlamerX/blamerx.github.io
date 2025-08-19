/* -------------------
	Home Section Autotyper
------------------- */

const typed = new Typed('.autotype', {
    strings: ['ML Engineer', 'AI Enthusiast', 'Data Scientist'],
    typeSpeed: 100,
    backSpeed: 50,
    loop: true
});

/* -------------------
	Skills
------------------- */

const skills = {
    'Programming Languages': {
        'Python': 'fab fa-python',
        'C': 'fab fa-cuttlefish',
        'C++': 'fab fa-cuttlefish',
        'SQL': 'fas fa-database',
        'HTML/CSS': 'fab fa-html5'
    },
    'Machine Learning & AI': {
        'TensorFlow': 'fas fa-robot',
        'Keras': 'fas fa-layer-group',
        'Scikit-learn': 'fas fa-cogs',
        'OpenCV': 'fas fa-camera'
    },
    'Data Engineering & Development': {
        'MySQL': 'fas fa-database',
        'Google Colab': 'fab fa-google',
        'Kaggle': 'fab fa-kaggle',
        'Git': 'fab fa-git-alt',
        'VS Code': 'fas fa-code'
    },
    'Web Development': {
        'Flask': 'fas fa-flask',
        'Streamlit': 'fas fa-stream'
    },
    'Data Visualization': {
        'Plotly': 'fas fa-chart-line',
        'Seaborn': 'fas fa-chart-bar',
        'Matplotlib': 'fas fa-chart-pie'
    }
};

const skillsGrid = document.querySelector('.skills-grid');

for (const category in skills) {
    for (const skill in skills[category]) {
        const skillCard = document.createElement('div');
        skillCard.classList.add('skill-card');

        const icon = document.createElement('i');
        icon.className = skills[category][skill];
        skillCard.appendChild(icon);

        const title = document.createElement('h3');
        title.textContent = skill;
        skillCard.appendChild(title);

        skillsGrid.appendChild(skillCard);
    }
}

/* -------------------
	Projects
------------------- */

const projects = [
    {
        title: 'Portrait Generation Using GANs',
        description: 'Developed Generative Adversarial Networks to create realistic portrait images from noise. Implemented DCGAN architecture with impressive results.',
        image: 'https://images.pexels.com/photos/1804075/pexels-photo-1804075.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        skills: ['Python', 'TensorFlow', 'Deep Learning', 'Computer Vision'],
        github: 'https://github.com/BlamerX/Portrait-Generation-Using-GANs',
        kaggle: 'https://www.kaggle.com/code/blamerx/beyond-the-canvas',
        demo: '#'
    },
    {
        title: 'AQI Prediction System',
        description: 'Built a real-time Air Quality Index prediction system deployed as a web application. Used historical weather and pollution data with machine learning models.',
        image: 'https://images.pexels.com/photos/158161/smog-city-air-pollution-158161.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        skills: ['Python', 'Flask', 'Streamlit', 'Environment'],
        github: 'https://github.com/BlamerX/Air-Quality-Index-Prediction-Website',
        kaggle: 'https://www.kaggle.com/code/blamerx/india-air-quality-index-eda-prediction',
        demo: '#'
    },
    {
        title: 'Stock Price Forecasting',
        description: 'Created an LSTM-based model to predict stock prices using historical data. Integrated with real-time data feeds and deployed as a web application for live predictions.',
        image: 'https://images.pexels.com/photos/7567529/pexels-photo-7567529.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        skills: ['Python', 'TensorFlow', 'Time Series', 'Finance'],
        github: 'https://github.com/BlamerX/Stock-Price-Prediction-WebSite',
        kaggle: '#',
        demo: 'https://stock-price-prediction-yr17.onrender.com/'
    },
    {
        title: 'Deep Learning Projects',
        description: 'Collection of various deep learning projects including CNNs, RNNs, and other neural network architectures.',
        image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        skills: ['Python', 'TensorFlow', 'Keras', 'Deep Learning'],
        github: 'https://github.com/BlamerX/Deep-Learning-Projects',
        kaggle: 'https://www.kaggle.com/code/blamerx/sign-language-eda-100-acc',
        demo: '#'
    },
    {
        title: 'Skin Cancer Detection',
        description: 'Developed a deep learning model using DenseNet121 for skin cancer classification with data augmentation techniques to improve model accuracy.',
        image: 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        skills: ['Python', 'TensorFlow', 'DenseNet121', 'Healthcare'],
        github: 'https://github.com/BlamerX/Deep-Learning-Projects',
        kaggle: 'https://www.kaggle.com/code/blamerx/skin-cancer-classification-densenet121-and-aug',
        demo: '#'
    },
    {
        title: 'Celebal Summer Internship',
        description: 'Projects completed during my Data Science internship at Celebal Technologies, including data analysis and machine learning models.',
        image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        skills: ['Python', 'Pandas', 'Numpy', 'Data Science'],
        github: 'https://github.com/BlamerX/Celebal-Summer-Internship-2023',
        kaggle: '#',
        demo: '#'
    }
];

const projectsSwiperWrapper = document.querySelector('.projects-swiper .swiper-wrapper');

projects.forEach(project => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');

    let skillsHTML = '';
    project.skills.forEach(skill => {
        skillsHTML += `<span>${skill}</span>`;
    });

    slide.innerHTML = `
        <img src="${project.image}" alt="${project.title}">
        <div class="project-content">
            <h3>${project.title}</h3>
            <div class="project-skills">${skillsHTML}</div>
            <p>${project.description}</p>
            <div class="project-links">
                <a href="${project.github}" target="_blank" class="github">GitHub</a>
                <a href="${project.kaggle}" target="_blank" class="kaggle">Kaggle</a>
                <a href="${project.demo}" target="_blank" class="demo">Demo</a>
            </div>
        </div>
    `;

    projectsSwiperWrapper.appendChild(slide);
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

// Header animation
gsap.to('nav', { y: 0, duration: 1, ease: 'power3.out', delay: 0.5 });

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
gsap.to('#home h1', { opacity: 1, duration: 1, ease: 'power3.out', delay: 1 });

// About section animation
gsap.to('.about-image', {
    opacity: 1,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about-image',
        start: 'top 80%',
    }
});

gsap.to('.about-text', {
    opacity: 1,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about-text',
        start: 'top 80%',
    }
});

gsap.to('.about-card', {
    opacity: 1,
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
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.projects-swiper',
        start: 'top 80%',
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
