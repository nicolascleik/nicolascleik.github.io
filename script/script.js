/* =========================================
   1. ESTADO GLOBAL & SELETORES
   ========================================= */
let allData = {};
let currentLang = localStorage.getItem('site-lang');

if (!currentLang) {
    const userLang = navigator.language || navigator.userLanguage; 
    
    if (userLang && userLang.toLowerCase().startsWith('pt')) {
        currentLang = 'pt';
    } else {
        currentLang = 'en';
    }
    
    localStorage.setItem('site-lang', currentLang);
}

let globalProjectsData = [];
let slideIndex = 0;
let carouselInterval = null;

const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');
const langSwitchBtn = document.getElementById('lang-switch');

/* =========================================
   2. INICIALIZAÇÃO (MAIN)
   ========================================= */
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch('./data/content.json');
        allData = await response.json();
        
        updateLanguage(currentLang);

        initScrollAnimation();
        initFormHandler();
        initMobileMenu();
        initGlobalClickListeners();

        if (langSwitchBtn) {
            langSwitchBtn.addEventListener('click', () => {
                currentLang = currentLang === 'en' ? 'pt' : 'en';
                localStorage.setItem('site-lang', currentLang);
                updateLanguage(currentLang);
            });
        }

    } catch (error) {
        alert("ERRO CRÍTICO: " + error.message);
        console.error(error);
    }
});

/* =========================================
   3. SISTEMA DE IDIOMAS (I18N)
   ========================================= */
function updateLanguage(lang) {
    const data = allData[lang];
    if (!data) return;

    globalProjectsData = data.projects;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        let value = data;
        keys.forEach(k => { if (value) value = value[k]; });
        if (value) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const keys = key.split('.');
        let value = data;
        keys.forEach(k => { if (value) value = value[k]; });
        if (value) el.placeholder = value;
    });

    if (langSwitchBtn) langSwitchBtn.innerText = lang === 'en' ? 'EN / PT' : 'PT / EN';

    renderProfileData(data.profile);
    renderProjects(data.projects);
    renderAbout(data.about, data.profile.avatar);
    renderExperience(data.experience);
    renderPublications(data.publications);
}

/* =========================================
   4. RENDERIZADORES (VIEW)
   ========================================= */
function renderProfileData(profile) {
    const heroContainer = document.querySelector('.hero-content');
    if (heroContainer) {
        const greeting = currentLang === 'en' ? "Hi, I am" : "Olá, eu sou";
        const cta1 = currentLang === 'en' ? "Let's Talk" : "Vamos Conversar";
        const cta2 = currentLang === 'en' ? "Check Work" : "Ver Projetos";

        heroContainer.innerHTML = `
            <p class="greeting">${greeting}</p>
            <h1 class="glitch-text" data-text="${profile.name}">${profile.name}</h1>
            <h2 class="subtitle">${profile.role}</h2>
            <p class="description">${profile.description}</p>
            <div class="cta-group">
                <a href="#contact" class="btn btn-primary">${cta1}</a>
                <a href="#projects" class="btn btn-outline">${cta2}</a>
            </div>
        `;
    }

    const resumeBtn = document.querySelector('.btn-resume');
    if (resumeBtn && profile.resumeLink) resumeBtn.href = profile.resumeLink;

    const form = document.querySelector('.contact-form');
    if (form && profile.contactAction) form.action = profile.contactAction;

    const socialsContainer = document.querySelector('.socials');
    if (socialsContainer && profile.social) {
        socialsContainer.innerHTML = `
            <a href="${profile.social.github}" target="_blank" class="social-link">GitHub</a>
            <a href="${profile.social.linkedin}" target="_blank" class="social-link">LinkedIn</a>
            <a href="${profile.social.instagram}" target="_blank" class="social-link">Instagram</a>
        `;
    }
}

function renderAbout(about, avatarUrl) {
    const container = document.querySelector('.about-content');
    if (!container) return;

    const bioHtml = about.bio.map(paragraph => `<p>${paragraph}</p>`).join('');
    const skillsHtml = about.skills.map(skill => `<li>${skill}</li>`).join('');

    container.innerHTML = `
        <div class="about-text">
            ${bioHtml}
            <p>${about.skillsTitle}</p>
            <ul class="skills-list">${skillsHtml}</ul>
        </div>
        <div class="about-image">
            <div class="img-wrapper">
                <img src="${avatarUrl}" alt="Profile Picture" />
            </div>
        </div>
    `;
}

function renderProjects(projects) {
    const container = document.querySelector('.projects-grid');
    if (!container) return;

    const viewText = currentLang === 'en' ? "View Project" : "Ver Projeto";

    container.innerHTML = projects.map((project, index) => {
        const projId = project.id || index;
        
        const externalLinksHTML = project.links.map(link => {
            let icon = '🔗';
            if (link.label.toLowerCase().includes('github')) icon = '<i class="fab fa-github"></i> 💻';
            if (link.label.toLowerCase().includes('live') || link.label.toLowerCase().includes('demo')) icon = '🚀';
            if (link.label.toLowerCase().includes('docs')) icon = '📄';
            
            return `<a href="${link.url}" target="_blank" class="icon-link" title="${link.label}">${icon}</a>`;
        }).join('');

        return `
            <div class="project-card" onclick="openProjectDetails(event, '${projId}')">
                <div class="project-header">
                    <div class="folder-icon">📁</div>
                    <div class="project-external-links">
                        ${externalLinksHTML}
                    </div>
                </div>
                <h3 class="project-title">${project.title}</h3>
                <div class="project-desc-preview">
                    ${project.desc.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                </div>
                <ul class="project-tech-list-card">
                    ${project.techs.slice(0, 4).map(tech => `<li>${tech}</li>`).join('')}
                </ul>
                <div class="project-footer">
                    <span class="view-details-btn">${viewText} <span class="arrow">→</span></span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('projects').classList.remove('hidden');
}

window.openProjectDetails = function(event, id) {
    if (event.target.closest('a')) return;
    const project = globalProjectsData.find(p => p.id === id) || globalProjectsData[id];
    if (project) openProjectModal(project);
}

function renderExperience(experiences) {
    const container = document.querySelector('.timeline');
    if (!container) return;

    container.innerHTML = experiences.map(exp => `
        <div class="timeline-item">
            <div class="timeline-date">${exp.period}</div>
            <div class="timeline-content">
                <h4>${exp.role} <span class="highlight">${exp.company}</span></h4>
                <p class="timeline-desc">${exp.desc}</p>
                <ul>
                    ${exp.achievements.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function renderPublications(publications) {
    const container = document.querySelector('.publications-grid');
    if (!container) return;

    const readMoreText = currentLang === 'en' ? "Read More" : "Ler Mais";

    container.innerHTML = publications.map((pub, index) => {
        const pubId = pub.id || `pub-${index}`;
        
        let buttonsHTML = '';
        if (pub.link) {
            const isPdf = pub.link.type === 'pdf';
            const stopProp = 'stop-propagation';
            buttonsHTML += `
                <a href="${pub.link.url}" 
                   class="highlight-link ${stopProp}" 
                   target="${isPdf ? '_self' : '_blank'}" 
                   data-type="${pub.link.type || 'external'}"> 
                   ${pub.link.text} 
                </a>`;
        }

        return `
            <div class="pub-card" onclick="openPublicationDetails(event, '${pubId}')" style="cursor: pointer;">
                <div class="pub-header">
                    <div class="pub-icon">${pub.icon}</div>
                    <span class="pub-tag">${pub.tag}</span>
                </div>
                <h3 class="pub-title">${pub.title}</h3>
                <p class="pub-desc">${pub.desc}</p>
                <div class="pub-footer">
                    <div class="pub-links-wrapper">
                        ${buttonsHTML}
                    </div>
                    <span class="advisor">${pub.footer}</span>
                    <div style="margin-top: 10px; font-size: 0.8rem; color: #64ffda; text-align: right;">
                        ${readMoreText} <span class="arrow">→</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('publications').classList.remove('hidden');
}

window.openPublicationDetails = function(event, id) {
    if (event.target.closest('a') || event.target.closest('.stop-propagation')) return;

    const currentPubs = allData[currentLang].publications;
    const pub = currentPubs.find(p => p.id === id);

    if (pub) openPublicationModal(pub);
}

/* =========================================
   5. SISTEMA DE MODAL & CARROSSEL
   ========================================= */
function openModal(contentHTML) {
    modalBody.innerHTML = contentHTML;
    modalOverlay.classList.remove('modal-hidden');
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
    setTimeout(() => { modalOverlay.style.opacity = '1'; }, 10);
}

function closeModal() {
    if (carouselInterval) clearInterval(carouselInterval);
    modalOverlay.style.opacity = '0';
    document.body.style.overflow = '';
    setTimeout(() => {
        modalOverlay.classList.add('modal-hidden');
        modalOverlay.style.display = 'none';
        modalBody.innerHTML = ''; 
    }, 300);
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

function openProjectModal(project) {
    let slidesHTML = '';
    if (project.images && project.images.length > 0) {
        let slidesImgs = project.images.map(img => 
            `<img src="${img}" class="carousel-slide fade">`
        ).join('');
        slidesHTML = `<div class="carousel-container">${slidesImgs}${project.images.length > 1 ? '<button class="prev-btn" onclick="moveSlide(-1)">&#10094;</button><button class="next-btn" onclick="moveSlide(1)">&#10095;</button>' : ''}</div>`;
    } else {
        const noImgText = currentLang === 'en' ? "No Images Available" : "Sem Imagens Disponíveis";
        slidesHTML = `<div class="carousel-slide fade" style="display:block; text-align:center; padding-top:150px; color:white;">${noImgText}</div>`;
    }

    const linksHTML = project.links.map(link => 
        `<a href="${link.url}" target="_blank" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem; margin-right: 10px;">${link.label}</a>`
    ).join('');

    const contentHTML = `
        ${slidesHTML}
        <div class="modal-project-info">
            <h2>${project.title}</h2>
            <div class="modal-tech-list">
                ${project.techs.map(t => `<span class="modal-tech-tag">${t}</span>`).join('')}
            </div>
            <p>${project.desc}</p>
            <div class="modal-actions">${linksHTML}</div>
        </div>
    `;
    openModal(contentHTML);
    if(project.images.length > 0) { slideIndex = 0; showSlides(slideIndex); startCarousel(); }
}

function openPublicationModal(pub) {
    let slidesHTML = '';
    if (pub.images && pub.images.length > 0) {
        let slidesImgs = pub.images.map(img => 
            `<img src="${img}" class="carousel-slide fade">`
        ).join('');
        slidesHTML = `<div class="carousel-container">${slidesImgs}${pub.images.length > 1 ? '<button class="prev-btn" onclick="moveSlide(-1)">&#10094;</button><button class="next-btn" onclick="moveSlide(1)">&#10095;</button>' : ''}</div>`;
    }

    let linkHTML = '';
    if (pub.link) {
        const linkType = pub.link.type || 'external';
        const target = (linkType === 'pdf' || linkType === 'image') ? '_self' : '_blank';
        let btnIcon = '';
        if (linkType === 'pdf') btnIcon = '📄 ';
        if (linkType === 'image') btnIcon = '🖼️ ';
        if (linkType === 'external') btnIcon = '🔗 ';

        linkHTML = `<a href="${pub.link.url}" target="${target}" class="btn btn-primary" data-type="${linkType}">${btnIcon}${pub.link.text}</a>`;
    }

    const contentHTML = `
        ${slidesHTML}
        <div class="modal-project-info">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size: 2rem;">${pub.icon}</span>
                <span class="modal-tech-tag">${pub.tag}</span>
            </div>
            <h2>${pub.title}</h2>
            <div style="color: #ccd6f6; margin-bottom: 20px; line-height: 1.8;">
                ${pub.longDesc || pub.desc}
            </div>
            <p style="font-size: 0.9rem; color: #8892b0; border-left: 2px solid #64ffda; padding-left: 10px; margin-bottom: 20px;">
                ${pub.footer}
            </p>
            <div class="modal-actions">${linkHTML}</div>
        </div>
    `;
    openModal(contentHTML);
    if(pub.images && pub.images.length > 0) { slideIndex = 0; showSlides(slideIndex); startCarousel(); }
}

window.moveSlide = function(n) { showSlides(slideIndex += n); resetCarouselTimer(); }

function showSlides(n) {
    let slides = document.getElementsByClassName("carousel-slide");
    if (!slides.length) return;
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";  
    slides[slideIndex].style.display = "block";  
}

function startCarousel() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => { showSlides(slideIndex += 1); }, 4000);
}

function resetCarouselTimer() { clearInterval(carouselInterval); startCarousel(); }

/* =========================================
   6. INTERCEPTADOR DE CLIQUES (GLOBAL)
   ========================================= */
function initGlobalClickListeners() {
    document.addEventListener('click', function(e) {
        const targetLink = e.target.closest('a');
        if (!targetLink) return;

        const type = targetLink.getAttribute('data-type');
        let url = targetLink.getAttribute('href');
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.');

        if (type === 'pdf') {
            const absoluteUrl = new URL(url, window.location.href).href;
            if (isMobile) {
                e.preventDefault();
                if (isLocalhost) { alert("PDF Mobile: Localhost detected. Opening new tab."); window.open(url, '_blank'); return; }
                const googleViewerUrl = `https://docs.google.com/gview?url=${absoluteUrl}&embedded=true`;
                openModal(`<div class="content-wrapper-full"><iframe src="${googleViewerUrl}" class="pdf-viewer" title="Document Viewer" frameborder="0"></iframe></div>`);
                return;
            }
            e.preventDefault();
            openModal(`<div class="content-wrapper-full"><iframe src="${url}" class="pdf-viewer" title="Document Viewer"></iframe></div>`);
        }
        else if (type === 'image') {
            e.preventDefault();
            openModal(`<div class="content-wrapper-full"><div class="image-scroll-container"><img src="${url}" class="image-content" alt="Preview"></div></div>`);
        }
    });
}

/* =========================================
   7. UTILITÁRIOS E COMPONENTES UI
   ========================================= */
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.remove("hidden");
                entry.target.classList.add("show");
            }
        });
    });
    document.querySelectorAll(".hidden").forEach((el) => observer.observe(el));
}

function initFormHandler() {
    const form = document.querySelector(".contact-form");
    const statusMsg = document.getElementById("form-status");
    if (!form) return;
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        const btn = form.querySelector("button");
        const originalText = btn.innerText;
        btn.innerText = "Sending...";
        btn.disabled = true;
        try {
            const response = await fetch(event.target.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
            if (response.ok) { form.reset(); statusMsg.innerText = "Success!"; statusMsg.style.color = "#64ffda"; } 
            else { throw new Error("Form error"); }
        } catch (error) { statusMsg.innerText = "Error. Try again."; statusMsg.style.color = "red"; } 
        finally { btn.innerText = originalText; btn.disabled = false; setTimeout(() => statusMsg.innerText = "", 5000); }
    });
}

function initMobileMenu() {
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links li");
    if (!hamburger || !nav) return;
    hamburger.addEventListener("click", (e) => { e.stopPropagation(); nav.classList.toggle("nav-active"); hamburger.classList.toggle("toggle"); });
    navLinks.forEach((link) => { link.addEventListener("click", () => { nav.classList.remove("nav-active"); hamburger.classList.remove("toggle"); }); });
    document.addEventListener("click", (event) => {
        if (nav.classList.contains("nav-active") && !nav.contains(event.target) && !hamburger.contains(event.target)) {
            nav.classList.remove("nav-active"); hamburger.classList.remove("toggle");
        }
    });
}