/* =========================================
   1. ESTADO GLOBAL & SELETORES
   ========================================= */
let globalProjectsData = [];
let slideIndex = 0;
let carouselInterval = null;

// Elementos do Modal (Cache para performance)
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');


/* =========================================
   2. INICIALIZAÇÃO (MAIN)
   ========================================= */
document.addEventListener("DOMContentLoaded", async function () {
    try {
        // 1. Carrega Dados
        const response = await fetch('./data/content.json');
        const data = await response.json();
        
        globalProjectsData = data.projects;

        // 2. Renderiza Conteúdo
        renderProfileData(data.profile);
        renderProjects(data.projects);
        renderAbout(data.about, data.profile.avatar);
        renderExperience(data.experience);
        renderPublications(data.publications);

        // 3. Inicializa Componentes UI
        initScrollAnimation();
        initFormHandler();
        initMobileMenu();
        initGlobalClickListeners(); // Interceptador de links (PDF, Imagens, Projetos)

    } catch (error) {
        console.error("Erro crítico ao inicializar site:", error);
    }
});


/* =========================================
   3. RENDERIZADORES (VIEW)
   ========================================= */

function renderProfileData(profile) {
    const heroContainer = document.querySelector('.hero-content');
    if (heroContainer) {
        heroContainer.innerHTML = `
            <p class="greeting">Hi, I am</p>
            <h1 class="glitch-text" data-text="${profile.name}">${profile.name}</h1>
            <h2 class="subtitle">${profile.role}</h2>
            <p class="description">${profile.description}</p>
            <div class="cta-group">
                <a href="#contact" class="btn btn-primary">Let's Talk</a>
                <a href="#projects" class="btn btn-outline">Check Work</a>
            </div>
        `;
    }

    // Atualizações pontuais
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

    container.innerHTML = projects.map((project, index) => {
        const projId = project.id || index;
        
        // Lógica para ícones específicos nos links externos
        const externalLinksHTML = project.links.map(link => {
            let icon = '🔗'; // Padrão
            if (link.label.toLowerCase().includes('github')) icon = '<i class="fab fa-github"></i> 💻'; // Se usar FontAwesome, ou use emoji
            if (link.label.toLowerCase().includes('live')) icon = '🚀';
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
                    <span class="view-details-btn">View Project <span class="arrow">→</span></span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('projects').classList.remove('hidden');
}

window.openProjectDetails = function(event, id) {
    // Se clicou em um link externo (Github/Live), não abre o modal
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

    container.innerHTML = publications.map(pub => {
        let buttonsHTML = '';

        if (pub.link) {
            const isPdf = pub.link.type === 'pdf';
            buttonsHTML += `
                <a href="${pub.link.url}" 
                   class="highlight-link" 
                   target="${isPdf ? '_self' : '_blank'}" 
                   data-type="${pub.link.type || 'external'}"> 
                   ${pub.link.text} 
                </a>`;
        }

        if (pub.preview) {
            buttonsHTML += `
                <a href="${pub.preview.url}" 
                   class="highlight-link secondary" 
                   target="_self" 
                   data-type="${pub.preview.type}"> 
                   ${pub.preview.text} 
                </a>`;
        }

        return `
            <div class="pub-card">
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
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('publications').classList.remove('hidden');
}

/* =========================================
   4. SISTEMA DE MODAL & CARROSSEL
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

// Listeners diretos do Modal
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});


// --- Lógica do Carrossel de Projetos ---
// --- Lógica do Carrossel de Projetos ---
function openProjectModal(project) {
    // 1. Gera Slides
    let slidesHTML = '';
    if (project.images && project.images.length > 0) {
        slidesHTML = project.images.map(img => 
            `<img src="${img}" class="carousel-slide fade">`
        ).join('');
    } else {
        slidesHTML = `<div class="carousel-slide fade" style="display:block; text-align:center; padding-top:150px; color:white;">No Images Available</div>`;
    }

    // 2. Gera Links
    const linksHTML = project.links.map(link => 
        `<a href="${link.url}" target="_blank" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem; margin-right: 10px;">${link.label}</a>`
    ).join('');

    // 3. Monta HTML Final (SEM A BARRA DUPLICADA)
    const contentHTML = `
        <div class="carousel-container">
            ${slidesHTML}
            <button class="prev-btn" onclick="moveSlide(-1)">&#10094;</button>
            <button class="next-btn" onclick="moveSlide(1)">&#10095;</button>
        </div>
        <div class="modal-project-info">
            <h2>${project.title}</h2>
            <div class="modal-tech-list">
                ${project.techs.map(t => `<span class="modal-tech-tag">${t}</span>`).join('')}
            </div>
            <p>${project.desc}</p>
            <div class="modal-actions">
                ${linksHTML}
            </div>
        </div>
    `;

    openModal(contentHTML);
    
    // Inicia Carrossel
    slideIndex = 0;
    showSlides(slideIndex);
    startCarousel(); 
}

// Controle do Slide (Global para acesso via onclick no HTML)
window.moveSlide = function(n) {
    showSlides(slideIndex += n);
    resetCarouselTimer();
}

function showSlides(n) {
    let slides = document.getElementsByClassName("carousel-slide");
    if (!slides.length) return;

    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slides[slideIndex].style.display = "block";  
}

function startCarousel() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        showSlides(slideIndex += 1);
    }, 4000);
}

function resetCarouselTimer() {
    clearInterval(carouselInterval);
    startCarousel();
}


/* =========================================
   5. INTERCEPTADOR DE CLIQUES (GLOBAL)
   ========================================= */

function initGlobalClickListeners() {
    document.addEventListener('click', function(e) {
        const targetLink = e.target.closest('a');
        if (!targetLink) return;

        const type = targetLink.getAttribute('data-type');
        const url = targetLink.getAttribute('href');

        // Lógica de Roteamento Interno do Modal
        if (type === 'pdf') {
            e.preventDefault();
            // PDF: Barra removida, pois já existe no HTML fixo
            const pdfHTML = `
                <div class="content-wrapper-full">
                    <iframe src="${url}" class="pdf-viewer" title="Document Viewer"></iframe>
                </div>
            `;
            openModal(pdfHTML);
        }
        else if (type === 'image') {
            e.preventDefault();
            // IMAGEM: Barra removida aqui também
            const imgHTML = `
                <div class="content-wrapper-full">
                    <div class="image-scroll-container">
                        <img src="${url}" class="image-content" alt="Preview">
                    </div>
                </div>`;
            openModal(imgHTML);
        }
        else if (type === 'project-details') {
            e.preventDefault();
            const id = targetLink.getAttribute('data-id');
            const project = globalProjectsData.find(p => p.id === id) || globalProjectsData[id];

            if (project) openProjectModal(project);
        }
    });
}


/* =========================================
   6. UTILITÁRIOS E COMPONENTES UI
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
            const response = await fetch(event.target.action, {
                method: "POST",
                body: data,
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                form.reset();
                statusMsg.innerText = "Message sent successfully!";
                statusMsg.style.color = "#64ffda";
            } else {
                throw new Error("Form error");
            }
        } catch (error) {
            statusMsg.innerText = "Network error. Please try again.";
            statusMsg.style.color = "red";
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
            setTimeout(() => statusMsg.innerText = "", 5000);
        }
    });
}

function initMobileMenu() {
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links li");

    if (hamburger) {
        const lines = hamburger.querySelectorAll("span");
        if (lines.length >= 3) {
            lines[0].classList.add("line1");
            lines[1].classList.add("line2");
            lines[2].classList.add("line3");
        }
    }

    if (!hamburger || !nav) return;

    // Toggle Menu
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        nav.classList.toggle("nav-active");
        hamburger.classList.toggle("toggle");
    });

    // Fechar ao clicar no link
    if (navLinks) {
        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                nav.classList.remove("nav-active");
                hamburger.classList.remove("toggle");
            });
        });
    }

    // Fechar ao clicar fora
    document.addEventListener("click", (event) => {
        const isMenuOpen = nav.classList.contains("nav-active");
        const isClickInsideMenu = nav.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);

        if (isMenuOpen && !isClickInsideMenu && !isClickOnHamburger) {
            nav.classList.remove("nav-active");
            hamburger.classList.remove("toggle");
        }
    });
}