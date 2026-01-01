/* =========================================
   1. ESTADO GLOBAL & SELETORES
   ========================================= */
let globalProjectsData = [];
let globalPublicationsData = [];
let slideIndex = 0;
let carouselInterval = null;

const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');

/* =========================================
   2. INICIALIZAÇÃO (MAIN)
   ========================================= */
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch('./data/content.json');
        const data = await response.json();
        
        globalProjectsData = data.projects;
        globalPublicationsData = data.publications;
        window.globalPublicationsData = data.publications;

        renderProfileData(data.profile);
        renderProjects(data.projects);
        renderAbout(data.about, data.profile.avatar);
        renderExperience(data.experience);
        renderPublications(data.publications);

        initScrollAnimation();
        initFormHandler();
        initMobileMenu();
        initGlobalClickListeners();

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
        
        const externalLinksHTML = project.links.map(link => {
            let icon = '🔗';
            if (link.label.toLowerCase().includes('github')) icon = '<i class="fab fa-github"></i> 💻';
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

// Função auxiliar para capturar o clique
window.openPublicationDetails = function(event, id) {
    // Se clicou em um link direto (PDF/Externo) dentro do card, não abre o modal de detalhes
    if (event.target.closest('a') || event.target.closest('.stop-propagation')) return;

    // Procura por ID ou por índice (fallback)
    let pub = null;
    if (globalProjectsData.publications) { // Verifica se existe no global (precisamos ajustar o carregamento)
         pub = globalProjectsData.publications.find(p => p.id === id);
    } 
    // Fallback: Busca no array 'publications' se ele estiver acessível globalmente. 
    // CORREÇÃO: Vamos garantir que 'data' seja global no próximo passo.
    
    // Por enquanto, vamos passar o objeto pub se conseguirmos ou buscar de novo.
    // O ideal é salvar publications globalmente igual projects.
    if (window.globalPublicationsData) {
        pub = window.globalPublicationsData.find(p => p.id === id) || window.globalPublicationsData[id];
    }

    if (pub) openPublicationModal(pub);
}

// Função que desenha o Modal de Publicação (Similar ao de Projeto)
// Função que desenha o Modal de Publicação
function openPublicationModal(pub) {
    // 1. Gera Slides (Carrossel opcional no topo - só aparece se tiver itens no array images)
    let slidesHTML = '';
    if (pub.images && pub.images.length > 0) {
        let slidesImgs = pub.images.map(img => 
            `<img src="${img}" class="carousel-slide fade">`
        ).join('');
        
        slidesHTML = `
            <div class="carousel-container">
                ${slidesImgs}
                ${pub.images.length > 1 ? `
                <button class="prev-btn" onclick="moveSlide(-1)">&#10094;</button>
                <button class="next-btn" onclick="moveSlide(1)">&#10095;</button>
                ` : ''} 
            </div>`;
    }

    // 2. Gera o Botão de Ação Principal (PDF, Imagem ou Link Externo)
    let linkHTML = '';
    if (pub.link) {
        // Detecta o tipo para aplicar o comportamento correto
        const linkType = pub.link.type || 'external';
        
        // Define o alvo (nova aba para externo, mesma aba para PDF/Image pois o JS intercepta)
        const target = (linkType === 'pdf' || linkType === 'image') ? '_self' : '_blank';
        
        // Ícone opcional no botão
        let btnIcon = '';
        if (linkType === 'pdf') btnIcon = '📄 ';
        if (linkType === 'image') btnIcon = '🖼️ ';
        if (linkType === 'external') btnIcon = '🔗 ';

        linkHTML = `
            <a href="${pub.link.url}" 
               target="${target}" 
               class="btn btn-primary" 
               data-type="${linkType}">
               ${btnIcon}${pub.link.text}
            </a>`;
    }

    // 3. Monta HTML Final
    const contentHTML = `
        <div class="modal-header-bar"></div>
        
        ${slidesHTML} <div class="modal-project-info">
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

            <div class="modal-actions">
                ${linkHTML}
            </div>
        </div>
    `;

    openModal(contentHTML);
    
    // Inicia Carrossel apenas se houver imagens
    if (pub.images && pub.images.length > 0) {
        slideIndex = 0;
        showSlides(slideIndex);
        startCarousel();
    }
}

function renderPublications(publications) {
    const container = document.querySelector('.publications-grid');
    if (!container) return;

    container.innerHTML = publications.map((pub, index) => {
        // Gera ID se não tiver
        const pubId = pub.id || `pub-${index}`;
        
        // Mantém os botões visíveis no card também
        let buttonsHTML = '';
        if (pub.link) {
            // Nota: Adicionamos a classe 'stop-propagation' para impedir que clicar no botão abra o modal também
            const isPdf = pub.link.type === 'pdf';
            buttonsHTML += `
                <a href="${pub.link.url}" 
                   class="highlight-link stop-propagation" 
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
                        Read More <span class="arrow">→</span>
                    </div>
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

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

function openProjectModal(project) {
    let slidesHTML = '';
    if (project.images && project.images.length > 0) {
        slidesHTML = project.images.map(img => 
            `<img src="${img}" class="carousel-slide fade">`
        ).join('');
    } else {
        slidesHTML = `<div class="carousel-slide fade" style="display:block; text-align:center; padding-top:150px; color:white;">No Images Available</div>`;
    }

    const linksHTML = project.links.map(link => 
        `<a href="${link.url}" target="_blank" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem; margin-right: 10px;">${link.label}</a>`
    ).join('');

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
    
    slideIndex = 0;
    showSlides(slideIndex);
    startCarousel(); 
}

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
        let url = targetLink.getAttribute('href');

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        const isLocalhost = window.location.hostname === '127.0.0.1' || 
                            window.location.hostname === 'localhost' || 
                            window.location.hostname.startsWith('192.168.');

        if (type === 'pdf') {
            const absoluteUrl = new URL(url, window.location.href).href;

            if (isMobile) {
                e.preventDefault();

                if (isLocalhost) {
                    alert("Aviso de Dev: O PDF Embed Mobile só funciona quando o site está online (Google não acessa localhost). Abrindo em nova aba para teste.");
                    window.open(url, '_blank');
                    return;
                }

                const googleViewerUrl = `https://docs.google.com/gview?url=${absoluteUrl}&embedded=true`;
                
                const pdfHTML = `
                    <div class="content-wrapper-full">
                        <iframe src="${googleViewerUrl}" class="pdf-viewer" title="Document Viewer" frameborder="0"></iframe>
                    </div>
                `;
                openModal(pdfHTML);
                return;
            }

            e.preventDefault();
            const pdfHTML = `
                <div class="content-wrapper-full">
                    <iframe src="${url}" class="pdf-viewer" title="Document Viewer"></iframe>
                </div>
            `;
            openModal(pdfHTML);
        }
        else if (type === 'image') {
            e.preventDefault();
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

    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        nav.classList.toggle("nav-active");
        hamburger.classList.toggle("toggle");
    });

    if (navLinks) {
        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                nav.classList.remove("nav-active");
                hamburger.classList.remove("toggle");
            });
        });
    }

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