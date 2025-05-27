// Main initialization function - Single source of truth
document.addEventListener("DOMContentLoaded", function () {
    // console.log("DOM loaded, initializing components...");

    // Check if portfolio data exists
    if (typeof portfolioData === 'undefined') {
        //console.error('Portfolio data is missing! Make sure portfolio-data.js is loaded.');
        return;
    }

    // Initialize in the correct order
    // 1. Core functionality
    loadAllData();
    const particles = initParticles();

    // Initialize analytics tracking
    setupAnalyticsTracking();

    // 2. Setup UI components
    setupSectionAnimations();
    setupSmoothScrolling();
    initNavbarHighlight();
    initNavbarAnimation();
    enhanceHamburgerMenu();
    enhanceMobileNavbar();
    toggleNavbarName();

    // 3. Initialize section-specific features - ONLY CALL loadProjects ONCE
    loadProjects(false); // This loads initial projects and initializes modals
    setupTimelineAnimations();
    setupEducationAnimations();
    enhanceTimeline();
    loadSkills();
    loadCertifications();

    // 4. Create placeholders for missing images
    createPlaceholders();

    // 5. Start animations
    setTimeout(animateHeroText, 100);

    // 6. Final optimizations
    setTimeout(() => {
        if (particles && typeof particles.setParticleCount === 'function') {
            particles.setParticleCount(60);
        }
    }, 2000);

    // 7. Initialize favicon animation
    setTimeout(initFaviconAnimation, 1000);

    // Track performance
    trackPagePerformance();
});

// Consolidated timeline enhancement function
function enhanceTimeline() {
    // console.log("Enhancing timeline for all devices...");

    const timelineContainer = document.querySelector('.timeline-container');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const isMobile = window.innerWidth <= 767;
    const isVerySmallScreen = window.innerWidth < 400;

    if (!timelineContainer || !timelineItems.length) {
        console.warn("Timeline elements not found");
        return;
    }

    // 1. Handle very small screens - add simplified mode
    if (isVerySmallScreen && timelineContainer) {
        timelineContainer.classList.add('simple-mobile');
    } else if (timelineContainer) {
        timelineContainer.classList.remove('simple-mobile');
    }

    // 2. Optimize mobile timeline display and transitions
    if (isMobile) {
        // console.log("Applying mobile timeline optimizations");

        // Force proper positioning
        document.querySelectorAll('.timeline-content').forEach(content => {
            content.style.width = "calc(100% - 50px)";
            content.style.left = "40px";
            content.style.transform = "none";
        });

        // Remove animation delays on mobile for faster rendering
        timelineItems.forEach(item => {
            // Remove transition delay and make items immediately visible
            item.style.transitionDelay = '0s';
            setTimeout(() => {
                item.classList.add('active');
            }, 100);
        });

        // 3. Setup "show more" functionality for list items
        document.querySelectorAll('.timeline-card-body').forEach(body => {
            const listItems = body.querySelectorAll('li');

            // Only add "show more" for items with more than 2 bullet points
            if (listItems.length > 2) {
                // Skip if already processed
                if (body.hasAttribute('data-enhanced')) return;
                body.setAttribute('data-enhanced', 'true');

                // Add has-more class for styling
                body.classList.add('has-more');

                // Hide items beyond the second one
                listItems.forEach((item, index) => {
                    if (index >= 2) {
                        item.style.display = 'none';
                    }
                });

                // Add click event to show all items
                body.addEventListener('click', function () {
                    listItems.forEach(item => {
                        item.style.display = 'block';
                    });

                    // Remove the has-more class to hide the "+ more" text
                    this.classList.remove('has-more');
                });
            }
        });
    } else {
        // For desktop: ensure timeline animations work properly
        setupTimelineAnimations();
    }

    // Set up window resize handler (with debouncing)
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(enhanceTimeline, 250);
    });
}

// Update education section to use consistent graduation cap icons
function loadEducation() {
    const educationContainer = document.getElementById('education-container');
    if (!educationContainer) return;

    // Clear any existing content
    educationContainer.innerHTML = '';

    // Add each education item
    portfolioData.education.forEach((edu, index) => {
        const educationCard = document.createElement('div');
        educationCard.className = 'education-card';

        // Always use graduation-cap icon for consistency
        const icon = 'fa-graduation-cap';

        // Build HTML for each education card with graduation cap icon
        educationCard.innerHTML = `
            <div class="education-card-header">
                <div class="education-logo-container">
                    <div class="education-logo">
                        <i class="fas ${icon}"></i>
                    </div>
                </div>
                <div class="education-info">
                    <h3 class="education-degree">${edu.degree}</h3>
                    <div class="education-institution">${edu.institution}</div>
                    <div class="education-period">${edu.period}</div>
                </div>
            </div>
            <div class="education-card-body">
                <div class="education-highlights">
                    <h4 class="education-highlights-title">Highlights</h4>
                    <ul class="education-highlights-list">
                        ${edu.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
                ${edu.courses && edu.courses.length > 0 ? `
                <div class="education-courses">
                    <h4 class="education-courses-title">Key Courses</h4>
                    <div class="course-tags">
                        ${edu.courses.map(course => `<span class="course-tag">${course}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        educationContainer.appendChild(educationCard);
    });
}

let heroAnimationStarted = false;


// Initialize particle background
function initParticles() {
    // console.log("Initializing particle animation for entire page...");
    try {
        const particles = new ParticleAnimation({
            selector: 'body',
            quantity: 30,      // More particles for better visibility
            staticity: 20,     // Less static for more movement
            ease: 30,          // Faster response to mouse movement
            color: '#0175C2'   // Your brand blue color
        });

        // Increase particles after the page loads
        setTimeout(() => {
            particles.setParticleCount(80);
        }, 2000);

        // console.log("Particle animation initialized successfully");
        return particles;
    } catch (e) {
        console.error("Particles initialization failed:", e);
        return null;
    }
}


// Highlight active section in navbar based on scroll position
function initNavbarHighlight() {
    // Get all sections that should be tracked for highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    if (!sections.length || !navLinks.length) {
        console.warn("Navbar highlight initialization failed: Missing sections or nav links");
        return;
    }

    // console.log(`Initializing navbar highlight tracking for ${sections.length} sections`);

    // Function to determine which section is currently most visible
    function highlightNavigation() {
        // Get current scroll position with buffer for better UX
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        // Find the current active section
        let currentSection = null;

        // First check if we're at the top of the page
        if (scrollPosition < 200) {
            // We're at the top, highlight the home section
            currentSection = 'home';
        } else {
            // Loop through sections to find which one is currently most visible
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });
        }

        // Update active links in the navbar
        if (currentSection) {
            navLinks.forEach(link => {
                // Remove active class from all links
                link.classList.remove('active');

                // Add active class to matching link
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });

            // console.log(`Active section: ${currentSection}`);
        }
    }

    // Add smooth transition to nav links
    navLinks.forEach(link => {
        link.style.transition = 'color 0.3s ease, border-bottom 0.3s ease';
    });

    // Check active section on scroll (with throttling for performance)
    let isScrolling = false;
    window.addEventListener('scroll', function () {
        if (!isScrolling) {
            window.requestAnimationFrame(function () {
                highlightNavigation();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // Initialize on page load
    highlightNavigation();

    // Also update when page is fully loaded (for accuracy with late-loaded resources)
    window.addEventListener('load', highlightNavigation);

    // Handle manual navigation with smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();

                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Temporarily add active class for immediate feedback
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    this.classList.add('active');

                    // Scroll to the section
                    targetSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Add navbar animation on scroll - this function is missing in your code
function initNavbarAnimation() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    function updateNavbarStyle() {
        // Get scroll position
        const scrollPosition = window.scrollY;

        // Add/remove 'scrolled' class based on scroll position
        if (scrollPosition > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Initial check
    updateNavbarStyle();

    // Add scroll event listener with throttling
    let isScrolling = false;
    window.addEventListener('scroll', function () {
        if (!isScrolling) {
            window.requestAnimationFrame(function () {
                updateNavbarStyle();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

// Create placeholder images for missing project images
function createPlaceholders() {
    // console.log("Creating placeholders for missing images...");

    // Find all project image containers
    const projectImageContainers = document.querySelectorAll('.project-image-container');

    projectImageContainers.forEach((container, index) => {
        // Skip if container already has content
        if (container.children.length > 0) return;

        // Get the project data
        const project = projectData[index];
        if (!project) return;

        // Create a placeholder with gradient background and project title
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-project-image';
        placeholder.innerHTML = `<span class="placeholder-title">${project.title}</span>`;

        // Add placeholder to container
        container.appendChild(placeholder);

        // Try to load the actual image if a path exists
        if (project.image) {
            const img = new Image();
            img.onload = function () {
                // Replace placeholder with actual image on successful load
                container.innerHTML = '';
                const imgElement = document.createElement('img');
                imgElement.src = project.image;
                imgElement.alt = project.title;
                imgElement.className = 'project-image';
                container.appendChild(imgElement);
            };
            img.src = project.image;
        }
    });

    // Also create placeholders for modal images
    const modalImageContainers = document.querySelectorAll('[id^="modalImage"]');

    modalImageContainers.forEach(container => {
        // Skip if container already has content other than text
        if (container.querySelector('img')) return;

        // Get project index from container ID
        const idMatch = container.id.match(/modalImage(\d+)/);
        if (!idMatch) return;

        const projectIndex = parseInt(idMatch[1]);
        const project = projectData[projectIndex];
        if (!project) return;

        // Try to load the image if a path exists
        if (project.image) {
            const img = new Image();
            img.onload = function () {
                // Replace placeholder with actual image
                container.innerHTML = '';
                container.style.background = 'none';

                const imgElement = document.createElement('img');
                imgElement.src = project.image;
                imgElement.alt = project.title;
                imgElement.style.width = '100%';
                imgElement.style.height = '100%';
                imgElement.style.objectFit = 'cover';
                imgElement.style.borderRadius = '10px';

                container.appendChild(imgElement);
            };
            img.src = project.image;
        }
    });

    // console.log("Placeholders created successfully");
}
// Main animation function with checks to prevent multiple calls
function animateHeroText() {
    // Prevent multiple calls
    if (heroAnimationStarted) {
        // console.log("Hero animation already started, skipping duplicate call");
        return;
    }

    // console.log("Starting hero text animation...");
    heroAnimationStarted = true;

    const heroName = document.querySelector('.hero h1');
    if (!heroName) {
        console.error("Hero name element not found!");
        return;
    }

    // Get name from data file
    const originalText = (portfolioData && portfolioData.basics && portfolioData.basics.name)
        ? portfolioData.basics.name
        : "Praveen Ganapathy Ravi";

    // Clear any existing content
    heroName.innerHTML = '';
    heroName.classList.add('sorting-text');

    // Create container for the animation
    const container = document.createElement('div');
    container.className = 'sorting-container';
    heroName.appendChild(container);

    // Process the original text character by character
    const chars = originalText.split('');

    // Create spans for each character
    chars.forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.className = 'sorting-char';
        charSpan.dataset.char = char;

        // Start with a random character from tech-related symbols
        if (char !== ' ') {
            // Use a random character from a simpler set to ensure display
            const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            charSpan.textContent = randomChar;
            charSpan.classList.add('scrambled');
        } else {
            charSpan.innerHTML = '&nbsp;';
            charSpan.classList.add('space');
        }

        container.appendChild(charSpan);
    });

    // Start the sorting animation after a brief delay
    setTimeout(() => {
        const charElements = container.querySelectorAll('.sorting-char');

        // Sort each character in sequence
        charElements.forEach((charEl, index) => {
            if (charEl.classList.contains('space')) return;

            setTimeout(() => {
                // Start the sorting effect
                charEl.classList.add('sorting');

                // Create the sorting effect by cycling through chars
                const targetChar = charEl.dataset.char;
                let currentChar = charEl.textContent;
                const duration = 400; // Slightly faster animation
                const steps = 8;    // Fewer steps for better performance

                let step = 0;
                const interval = setInterval(() => {
                    step++;

                    // On final step, show the correct character
                    if (step >= steps) {
                        charEl.textContent = targetChar;
                        charEl.classList.add('sorted');
                        clearInterval(interval);
                    } else {
                        // For alphabetic characters, gradually converge to the target
                        if (/[a-zA-Z]/.test(targetChar)) {
                            const targetCode = targetChar.charCodeAt(0);
                            const currentCode = currentChar.charCodeAt(0);
                            const diff = targetCode - currentCode;
                            const stepValue = diff / (steps - step + 1);
                            const newCharCode = Math.round(currentCode + stepValue);
                            currentChar = String.fromCharCode(newCharCode);
                            charEl.textContent = currentChar;
                        } else {
                            // For non-alphabetic, use random chars
                            const randomChar = String.fromCharCode(33 + Math.floor(Math.random() * 94));
                            charEl.textContent = randomChar;
                        }
                    }
                }, duration / steps);

            }, index * 60); // Faster staggered start for better overall timing
        });
    }, 300);

    // Single fallback to ensure name is visible if animation fails
    setTimeout(fixHeroText, 4000);
}

// Single fallback function - called only once after animation should complete
function fixHeroText() {
    // Skip if animation hasn't started (would be weird but possible)
    if (!heroAnimationStarted) return;

    const heroName = document.querySelector('.hero h1');
    if (!heroName) return;

    // Get name from data
    const nameToShow = (portfolioData && portfolioData.basics && portfolioData.basics.name)
        ? portfolioData.basics.name
        : "Praveen Ganapathy Ravi";

    // Only fix if needed (animation incomplete or text missing)
    const sortingContainer = heroName.querySelector('.sorting-container');
    const needsFix = !sortingContainer ||
        !heroName.textContent.trim() ||
        heroName.textContent !== nameToShow;

    if (needsFix) {
        // console.log("Animation may have failed, ensuring name is visible");

        // Clear existing content and set directly
        heroName.innerHTML = nameToShow;
        heroName.style.opacity = '1';
    }
}



// Load all data from the external data file
function loadAllData() {
    // Set page title
    document.title = `${portfolioData.basics.name} - Portfolio`;

    // Load basic info
    document.getElementById('navbar-brand').textContent = portfolioData.basics.name;
    document.getElementById('hero-name').textContent = portfolioData.basics.name;
    document.getElementById('hero-title').textContent = portfolioData.basics.title;

    // About section
    document.getElementById('about-text').textContent = portfolioData.basics.about;

    // Load experience timeline
    loadExperienceTimeline();

    // Load education cards
    loadEducation();

    // Load skills and certifications
    loadSkills();
    loadCertifications();

    // Set global variable for compatibility, but DON'T load projects here
    projectData = portfolioData.projects;

    // Load social icons
    loadSocialIcons();

    // Set footer copyright
    document.getElementById('footer-copyright').innerHTML =
        `&copy; ${new Date().getFullYear()} ${portfolioData.basics.name}. Licensed under the Apache License 2.0. All rights reserved.`;
}

// Load experience timeline from data
// Update experience timeline to use building icons
function loadExperienceTimeline() {
    const timelineContainer = document.getElementById('experience-timeline');
    if (!timelineContainer) return;

    // Clear any existing content
    timelineContainer.innerHTML = '';

    // Add each experience item
    portfolioData.experience.forEach((exp, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';

        // Always use building icon for consistency
        const icon = 'fa-building';

        // Build HTML for each timeline item with building icon
        timelineItem.innerHTML = `
            <div class="timeline-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-card">
                    <div class="timeline-card-header">
                        <div class="timeline-period">${exp.period}</div>
                        <h3 class="timeline-title">${exp.title}</h3>
                        <div class="timeline-company">${exp.company}</div>
                        <div class="timeline-location">${exp.location}</div>
                    </div>
                    <div class="timeline-card-body">
                        <ul class="experience-details">
                            ${exp.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        timelineContainer.appendChild(timelineItem);
    });

    // Initialize animations
    setupTimelineAnimations();
}

// Load skills from data
function loadSkills() {
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) return;

    // Clear any existing content
    skillsContainer.innerHTML = '';

    // Add each skill category
    portfolioData.skills.categories.forEach((category, index) => {
        const skillCategory = document.createElement('div');
        skillCategory.className = 'skill-category mb-4';

        // Build HTML for each skill category
        skillCategory.innerHTML = `
            <h4 class="skill-category-title">
                <i class="${category.icon} me-2"></i>${category.title}
            </h4>
            <div class="skill-tags">
                ${category.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        `;

        skillsContainer.appendChild(skillCategory);
    });
}

// Load certifications from data
function loadCertifications() {
    const certificationsContainer = document.getElementById('certifications-container');
    if (!certificationsContainer) return;

    // Clear any existing content
    certificationsContainer.innerHTML = '';

    // Add each certification
    portfolioData.certifications.forEach((cert, index) => {
        const certItem = document.createElement('div');
        certItem.className = 'certification-item';

        // Build HTML for each certification
        certItem.innerHTML = `
            <div class="certification-header">
                <h4 class="certification-title">${cert.title}</h4>
                <span class="certification-date">${cert.date}</span>
            </div>
            <p class="certification-issuer">
                <i class="fas fa-building me-2"></i>${cert.issuer}
            </p>
            <p class="certification-description">
                ${cert.description}
            </p>
            <div class="certification-link">
                <a href="${cert.credentialLink}" target="_blank">
                    <i class="fas fa-external-link-alt me-1"></i>Credential
                </a>
            </div>
        `;

        certificationsContainer.appendChild(certItem);
    });
}

//Load social icons
// Enhanced function to load social icons
function loadSocialIcons() {
    const socialContainer = document.getElementById('social-icons-container');
    if (!socialContainer || !portfolioData.social) return;

    // Clear any existing content
    socialContainer.innerHTML = '';

    // First make sure email is added as a social option
    const hasEmail = portfolioData.social.some(item =>
        item.platform === 'Email' || item.icon.includes('envelope')
    );

    if (!hasEmail && portfolioData.contact && portfolioData.contact.email) {
        // Add email directly to the social grid if not already included
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${portfolioData.contact.email}`;
        emailLink.className = 'social-icon';
        emailLink.title = 'Email';
        emailLink.setAttribute('aria-label', 'Email');
        emailLink.innerHTML = '<i class="fas fa-envelope"></i>';
        socialContainer.appendChild(emailLink);
    }

    // Add each social icon
    portfolioData.social.forEach(social => {
        const socialLink = document.createElement('a');
        socialLink.href = social.url;
        socialLink.className = 'social-icon';
        socialLink.setAttribute('aria-label', social.platform || social.name || 'Social link');

        if (!social.url.startsWith('mailto:') && !social.url.startsWith('tel:')) {
            socialLink.target = '_blank';
            socialLink.rel = 'noopener';
            socialLink.title = social.platform || social.name || social.url;
        }

        socialLink.innerHTML = `<i class="${social.icon}"></i>`;
        socialContainer.appendChild(socialLink);
    });

    // console.log("Social icons loaded in grid layout");
}

// Animate sections when they come into view
function setupSectionAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    // Add the fade-in class to all sections and observe them
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
}

// Setup smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.hash !== "") {
                e.preventDefault();
                const target = document.querySelector(this.hash);
                if (target) {
                    const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });
}


// Function to animate timeline items when they come into view
function setupTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (!timelineItems.length) {
        console.warn('No timeline items found for animation');
        return;
    }

    function checkTimelineVisibility() {
        timelineItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;

            // If the item is in the viewport
            if (rect.top <= windowHeight * 0.8) {
                item.classList.add('active');
            }
        });
    }

    // Check visibility on page load
    checkTimelineVisibility();

    // Check visibility on scroll with throttling for better performance
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                checkTimelineVisibility();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Also check visibility after a slight delay (after page renders completely)
    setTimeout(checkTimelineVisibility, 500);
}

// Add this to your main.js file to animate education cards
function setupEducationAnimations() {
    const educationCards = document.querySelectorAll('.education-card');

    function checkEducationVisibility() {
        educationCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;

            // If the card is in the viewport
            if (rect.top <= windowHeight * 0.8) {
                card.classList.add('active');
            }
        });
    }

    // Check visibility on page load
    checkEducationVisibility();

    // Check visibility on scroll
    window.addEventListener('scroll', checkEducationVisibility);
}





// Function to toggle navbar name visibility based on scroll position
function toggleNavbarName() {
    const navbar = document.querySelector('.navbar');
    const navbarBrand = document.querySelector('.navbar-brand');
    const heroSection = document.getElementById('home');

    if (!navbar || !navbarBrand || !heroSection) {
        return;
    }

    function updateNavbarName() {
        // Get hero section's bottom position
        const heroBottom = heroSection.getBoundingClientRect().bottom;

        // If we're in the hero section (hero bottom is still visible)
        if (heroBottom > 0) {
            // Hide the name in navbar
            navbarBrand.style.opacity = '0';
            navbarBrand.style.transform = 'translateX(-20px)';
        } else {
            // Show the name in navbar
            navbarBrand.style.opacity = '1';
            navbarBrand.style.transform = 'translateX(0)';
        }
    }

    // Add smooth transition to navbar brand
    navbarBrand.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    // Call on scroll
    window.addEventListener('scroll', updateNavbarName);

    // Call initially
    updateNavbarName();
}


// Enhanced hamburger menu functionality
function enhanceHamburgerMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (!navbarToggler || !navbarCollapse) return;

    // Hide hamburger on desktop
    function updateHamburgerVisibility() {
        if (window.innerWidth > 991) {
            navbarToggler.style.display = 'none';
        } else {
            navbarToggler.style.display = 'flex';
        }
    }

    // Run initially and on resize
    updateHamburgerVisibility();
    window.addEventListener('resize', updateHamburgerVisibility);

    // Add event listener for the expand/collapse state
    navbarToggler.addEventListener('click', function () {
        // Toggle a custom class for additional effects
        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            navbarCollapse.classList.add('show');
        } else {
            // Set a timeout to allow for animation
            setTimeout(() => {
                navbarCollapse.classList.remove('show');
            }, 10);
        }
    });

    // Auto-close menu when an item is clicked
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', function () {
            // Close the menu
            if (window.innerWidth <= 991) {
                navbarToggler.click();
                // Alternative approach if click() doesn't work:
                // bootstrap.Collapse.getInstance(navbarCollapse).hide();
            }
        });

        // Add click ripple effect to menu items
        link.addEventListener('click', function (e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('nav-link-ripple');
            this.appendChild(ripple);

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            ripple.classList.add('active');

            setTimeout(() => {
                ripple.remove();
            }, 500);
        });
    });
}

// Function to enhance mobile navbar with scrolling
function enhanceMobileNavbar() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbar = document.querySelector('.navbar');

    if (!navbarCollapse || !navbar) return;

    // Function to check menu size and adjust
    function adjustNavbarHeight() {
        if (window.innerWidth <= 991) {
            // Get available height (viewport height minus navbar height minus some padding)
            const navbarHeight = navbar.offsetHeight;
            const availableHeight = window.innerHeight - navbarHeight - 40; // 40px for padding
            const maxHeight = Math.min(availableHeight, window.innerHeight * 0.5); // Max 50% of viewport

            // Set the max-height in inline style to override CSS
            navbarCollapse.style.setProperty('--max-menu-height', `${maxHeight}px`);

            // Apply the calculated height when expanded
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.style.maxHeight = `${maxHeight}px`;
            }
        } else {
            // Reset on desktop
            navbarCollapse.style.maxHeight = '';
        }
    }

    // Update max height on window resize
    window.addEventListener('resize', adjustNavbarHeight);

    // Update when menu opens/closes
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function () {
            // Set timeout to allow Bootstrap to add/remove 'show' class first
            setTimeout(adjustNavbarHeight, 10);
        });
    }

    // Check if content is scrollable and show indicator
    function checkScrollable() {
        if (navbarCollapse.classList.contains('show')) {
            if (navbarCollapse.scrollHeight > navbarCollapse.clientHeight) {
                navbarCollapse.classList.add('is-scrollable');
            } else {
                navbarCollapse.classList.remove('is-scrollable');
            }
        }
    }

    // Run this check after menu opens
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function () {
            setTimeout(checkScrollable, 400); // After animation completes
        });
    }

    // Initial adjustment
    adjustNavbarHeight();
}

// Function to check if container is scrollable and add appropriate class
function checkScrollable(container) {
    if (!container) return;

    // Check if content height is greater than container height
    if (container.scrollHeight > container.clientHeight) {
        container.classList.add('is-scrollable');

        // Initial check for scroll position
        updateScrollFade(container);

        // Add scroll event to update fade effect
        container.addEventListener('scroll', function () {
            updateScrollFade(this);
        });
    } else {
        container.classList.remove('is-scrollable');
    }

    // Helper function to update fade based on scroll position
    function updateScrollFade(element) {
        // Check if scrolled to bottom (or very close to it)
        // Using a small buffer (1px) to account for rounding issues
        const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;

        if (isAtBottom) {
            element.classList.remove('is-scrollable');
            element.classList.add('at-bottom');
        } else {
            element.classList.add('is-scrollable');
            element.classList.remove('at-bottom');
        }
    }
}

// Add indicator to the containers
function addScrollIndicator(container) {
    if (!container) return;

    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = '<i class="fas fa-chevron-down"></i>';
    container.appendChild(indicator);
}

// Call this after loading content
addScrollIndicator(document.getElementById('skills-container'));
addScrollIndicator(document.getElementById('certifications-container'));

// Call this when window resizes to update scrollability status
window.addEventListener('resize', function () {
    checkScrollable(document.getElementById('skills-container'));
    checkScrollable(document.getElementById('certifications-container'));
});

// Fix project loading function to correctly handle all projects
function loadProjects(showAll = false) {
    // console.log(`Loading projects (showAll: ${showAll})`);

    // Try multiple selectors to find the container
    const projectsContainer = document.querySelector('#projects-container') ||
        document.querySelector('.projects-container');

    if (!projectsContainer) {
        console.error("Projects container not found - check your HTML structure");
        return;
    }

    // console.log(`Found projects container: ${projectsContainer.className || projectsContainer.id}`);

    // Remove any existing load more buttons first
    const existingButtons = projectsContainer.querySelectorAll('.text-center');
    existingButtons.forEach(btn => btn.remove());

    // Clear existing content completely
    projectsContainer.innerHTML = '';

    // Get all projects
    const allProjects = portfolioData.projects || [];
    // console.log(`Found ${allProjects.length} total projects`);

    // Determine how many projects to show
    const projectsToShow = showAll ? allProjects.length : Math.min(3, allProjects.length);
    // console.log(`Showing ${projectsToShow} projects`);

    // Display the projects
    for (let i = 0; i < projectsToShow; i++) {
        const project = allProjects[i];
        const projectCard = createProjectCard(project, i);
        projectsContainer.appendChild(projectCard);
    }

    // Add Load More button if needed
    if (!showAll && allProjects.length > 3) {
        const loadMoreDiv = document.createElement('div');
        loadMoreDiv.className = 'text-center mt-4';
        loadMoreDiv.innerHTML = `
            <button id="load-more-projects" class="btn btn-outline-primary">
                <i class="fas fa-plus-circle me-2"></i>Load More Projects
            </button>
        `;
        projectsContainer.appendChild(loadMoreDiv);

        // Add event listener to Load More button
        const loadMoreBtn = document.getElementById('load-more-projects');
        if (loadMoreBtn) {
            // Remove existing event listeners
            const newBtn = loadMoreBtn.cloneNode(true);
            loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);

            // Add new event listener
            newBtn.addEventListener('click', function () {
                // console.log("Load More button clicked");
                loadProjects(true);
            });
        }
    }

    // Initialize project images
    initProjectImages();

    // IMPORTANT: Reinitialize modals AFTER the DOM is updated
    setTimeout(() => {
        // console.log("Initializing project modals after loading projects");
        initProjectModals();
    }, 100);
}

// Simpler function to create project cards with consistent data attributes
function createProjectCard(project, index) {
    const projectCard = document.createElement('div');
    projectCard.className = 'col-lg-4 col-md-6 mb-4';

    projectCard.innerHTML = `
        <div class="project-card">
            <div class="project-image-container">
                <div class="project-image" id="projectImage${index}">
                    <!-- Image will be added dynamically -->
                    <div class="placeholder-project-image">
                        <span class="placeholder-title">${project.title}</span>
                    </div>
                </div>
                ${project.association ?
            `<div class="project-badge">${project.association}</div>` : ''}
            </div>
            <div class="project-details">
                <h3 class="project-title">${project.title}</h3>
                <div class="project-period">${project.period}</div>
                <p class="project-description">${project.brief}</p>
                <div class="project-skills">
                    ${project.skills.slice(0, 3).map(skill =>
                `<span class="project-skill-tag">${skill}</span>`).join('')}
                    ${project.skills.length > 3 ?
            `<span class="project-skill-more">+${project.skills.length - 3}</span>` : ''}
                </div>
                <div class="project-buttons">
                    <button class="btn btn-sm btn-primary project-details-btn" data-project="${index}">
                        <i class="fas fa-info-circle me-1"></i>Details
                    </button>
                    <a href="${project.repo}" class="btn btn-sm btn-outline-primary" target="_blank">
                        <i class="fab fa-github me-1"></i>GitHub
                    </a>
                    <a href="${project.demo}" class="btn btn-sm btn-outline-primary" target="_blank">
                        <i class="fas fa-external-link-alt me-1"></i>Demo
                    </a>
                </div>
            </div>
        </div>
    `;

    return projectCard;
}

// Simplified function to initialize project modals with better error handling
function initProjectModals() {
    // console.log("Initializing project modals...");

    try {
        // Get all detail buttons
        const detailButtons = document.querySelectorAll('.project-details-btn');
        // console.log(`Found ${detailButtons.length} project detail buttons`);

        // Add click event to each button
        detailButtons.forEach(btn => {
            // Remove any existing event listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            // Get the project index from data attribute
            const projectIndex = newBtn.getAttribute('data-project');
            // console.log(`Button for project index: ${projectIndex}`);

            // Add click event listener
            newBtn.addEventListener('click', function (e) {
                e.preventDefault();

                try {
                    // Get the project index
                    const index = parseInt(this.getAttribute('data-project'));
                    // console.log(`Clicked button for project index: ${index}`);

                    if (isNaN(index)) {
                        console.error("Invalid project index:", index);
                        return;
                    }

                    // Get the project
                    const project = portfolioData.projects[index];
                    if (!project) {
                        console.error(`Project with index ${index} not found`);
                        return;
                    }

                    // console.log(`Opening modal for project: ${project.title}`);

                    // Create or get modal
                    let modal = document.getElementById('projectModal');
                    if (!modal) {
                        modal = document.createElement('div');
                        modal.id = 'projectModal';
                        modal.className = 'project-modal';
                        document.body.appendChild(modal);
                    }

                    // Set modal content
                    modal.innerHTML = `
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2 class="modal-title">${project.title}</h2>
                                <button type="button" class="modal-close">&times;</button>
                            </div>
                            
                            <div class="modal-body">
                                <div class="modal-row">
                                    <div class="modal-image-container">
                                        <div class="project-image-wrapper" id="modalImage${index}">
                                            <div class="placeholder-project-image">
                                                <span class="placeholder-title">${project.title}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="project-badges">
                                            ${project.period ? `<span class="badge bg-secondary">${project.period}</span>` : ''}
                                            ${project.association ? `<span class="badge bg-secondary">${project.association}</span>` : ''}
                                        </div>
                                    </div>
                                    
                                    <div class="modal-details">
                                        <div class="detail-section">
                                            <h3 class="detail-heading">Project Purpose</h3>
                                            <p>${project.brief}</p>
                                        </div>
                                        
                                        <div class="detail-section">
                                            <h3 class="detail-heading">Description</h3>
                                            <p>${project.description}</p>
                                        </div>
                                        
                                        <div class="detail-section">
                                            <h3 class="detail-heading">What I Learned</h3>
                                            <ul class="learning-points">
                                                ${project.learnings ?
                            project.learnings.map(point => `<li class="learning-point">${point}</li>`).join('') :
                            ''}
                                            </ul>
                                        </div>
                                        
                                        <div class="detail-section">
                                            <h3 class="detail-heading">Technologies Used</h3>
                                            <div class="project-skills-container">
                                                ${project.skills.map(skill => `<span class="project-skill-tag">${skill}</span>`).join('')}
                                            </div>
                                        </div>
                                        
                                        <div class="detail-section">
                                            <div class="modal-actions">
                                                <a href="${project.repo}" class="btn btn-primary" target="_blank">
                                                    <i class="fab fa-github me-2"></i>GitHub Repository
                                                </a>
                                                <a href="${project.demo}" class="btn btn-outline-primary" target="_blank">
                                                    <i class="fas fa-external-link-alt me-2"></i>Live Demo
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    // Display the modal
                    modal.style.display = 'block';

                    // Add close button functionality
                    const closeBtn = modal.querySelector('.modal-close');
                    if (closeBtn) {
                        closeBtn.addEventListener('click', () => {
                            modal.style.display = 'none';
                            document.body.style.overflow = '';
                        });
                    }

                    // Close when clicking outside
                    window.addEventListener('click', function closeOutside(e) {
                        if (e.target === modal) {
                            modal.style.display = 'none';
                            document.body.style.overflow = '';
                            window.removeEventListener('click', closeOutside);
                        }
                    });

                    // Prevent background scrolling
                    document.body.style.overflow = 'hidden';
                } catch (error) {
                    console.error("Error opening project modal:", error);
                }
            });
        });
    } catch (error) {
        console.error("Error initializing project modals:", error);
    }
}

// Simple function to initialize project images
function initProjectImages() {
    // console.log("Initializing project images for all projects...");

    try {
        // Find all project image containers (both in cards and modals)
        document.querySelectorAll('[id^="projectImage"]').forEach((container) => {
            // Get index from ID
            const match = container.id.match(/projectImage(\d+)/);
            if (!match) return;

            const index = parseInt(match[1]);
            const project = portfolioData.projects[index];

            if (!project || !project.image) return;

            // console.log(`Loading image for project ${index}: ${project.title}`);

            // Create and append image directly
            const img = document.createElement('img');
            img.src = project.image;
            img.alt = project.title;
            img.className = 'project-image';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';

            // Debug the image loading
            img.onload = function () {
                // console.log(` Successfully loaded image for: ${project.title}`);
                // Replace container content with the loaded image
                container.innerHTML = '';
                container.appendChild(img);

                // Also fix modal image if present
                const modalId = container.id.replace('projectImage', 'modalImage');
                const modalContainer = document.getElementById(modalId);
                if (modalContainer) {
                    const modalImg = img.cloneNode(true);
                    modalContainer.innerHTML = '';
                    modalContainer.appendChild(modalImg);
                }
            };

            img.onerror = function () {
                // console.log(` Failed to load image for: ${project.title}`);
                // Keep the placeholder visible on error with blue gradient
                container.innerHTML = `
                    <div class="placeholder-project-image" style="background: linear-gradient(45deg, #0066cc, #00ccff);">
                        <span class="placeholder-title">${project.title}</span>
                        <span class="placeholder-description">${project.imagePlaceholder || ''}</span>
                    </div>
                `;
            };

            // Set initial placeholder with blue gradient that matches your UI
            container.innerHTML = `
                <div class="placeholder-project-image" style="background: linear-gradient(45deg, #0066cc, #00ccff);">
                    <span class="placeholder-title">${project.title}</span>
                    <span class="placeholder-description">${project.imagePlaceholder || ''}</span>
                </div>
            `;

            // Start loading the image
            img.src = project.image;
        });

        // Also look for modal-specific images
        document.querySelectorAll('[id^="modalImage"]').forEach((container) => {
            // Skip if already processed
            if (container.querySelector('img')) return;

            // Get index from ID
            const match = container.id.match(/modalImage(\d+)/);
            if (!match) return;

            const index = parseInt(match[1]);
            const project = portfolioData.projects[index];

            if (!project || !project.image) return;

            // Create a blue gradient placeholder first
            container.innerHTML = `
                <div class="placeholder-project-image" style="background: linear-gradient(45deg, #0066cc, #00ccff); width: 100%; height: 100%; border-radius: 8px;">
                    <span class="placeholder-title">${project.title}</span>
                    <span class="placeholder-description">${project.imagePlaceholder || ''}</span>
                </div>
            `;

            // Create and append image
            const img = document.createElement('img');
            img.src = project.image;
            img.alt = project.title;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';

            img.onload = function () {
                container.innerHTML = '';
                container.appendChild(img);
            };
        });

        // console.log("Project images initialized successfully");
    } catch (error) {
        console.error("Error initializing project images:", error);
    }
}

// Call this at strategic points to ensure project images are loaded
function ensureProjectImagesLoaded() {
    // Initial call
    initProjectImages();

    // Secondary call with slight delay
    setTimeout(initProjectImages, 500);

    // Final call after page is fully loaded
    window.addEventListener('load', function () {
        setTimeout(initProjectImages, 300);
    });
}

// Make sure this function is called after projects are loaded
document.addEventListener('DOMContentLoaded', function () {
    // Hook into the loadProjects function
    const originalLoadProjects = window.loadProjects;
    if (typeof originalLoadProjects === 'function') {
        window.loadProjects = function (showAll) {
            // Call original function
            originalLoadProjects(showAll);
            // Then ensure images are loaded
            setTimeout(ensureProjectImagesLoaded, 100);
        };
    }

    // Also hook into the "Load More" button click
    document.addEventListener('click', function (e) {
        if (e.target.id === 'load-more-projects' ||
            e.target.closest('#load-more-projects')) {
            setTimeout(ensureProjectImagesLoaded, 300);
        }
    });

    // And when modal is opened
    document.addEventListener('click', function (e) {
        if (e.target.closest('.project-details-btn')) {
            setTimeout(initProjectImages, 100);
        }
    });
});

// Animated Favicon
function initFaviconAnimation() {
    // console.log("Initializing favicon animation...");

    // Create animated favicon when tab is not visible
    let faviconElement = document.querySelector('link[rel="icon"]');
    const originalFavicon = faviconElement.href;

    // Create canvas for dynamic favicon generation
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Load the original favicon
    const img = new Image();
    img.onload = function () {
        // Start animation loop only when document is hidden
        let rotation = 0;
        let animationFrame;
        let blinkState = false;
        let animationActive = false;

        // Function to draw the animated favicon
        function drawAnimatedFavicon() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Save context
            ctx.save();

            // Move to center, rotate, and draw image
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation);
            ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

            // Update rotation for next frame
            rotation += 0.05;

            // Restore context
            ctx.restore();

            // Add pulsing effect every 15 frames
            if (Math.floor(rotation * 10) % 15 === 0) {
                blinkState = !blinkState;
                if (blinkState) {
                    // Add blue glow
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = 'rgba(0, 102, 204, 0.3)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = 'source-over';
                }
            }

            // Update favicon
            faviconElement.href = canvas.toDataURL('image/png');

            // Continue animation if active
            if (animationActive) {
                animationFrame = requestAnimationFrame(drawAnimatedFavicon);
            }
        }

        // Start/stop animation based on visibility
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                // Page is hidden, start animation
                // console.log("Tab inactive - starting favicon animation");
                animationActive = true;
                if (!animationFrame) {
                    animationFrame = requestAnimationFrame(drawAnimatedFavicon);
                }
            } else {
                // Page is visible, stop animation and reset favicon
                // console.log("Tab active - stopping favicon animation");
                animationActive = false;
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
                faviconElement.href = originalFavicon;
            }
        });
    };

    // Start loading the image
    img.src = originalFavicon;

    // console.log("Favicon animation initialized");
}

//  EmailJS parameters and initialization
document.addEventListener('DOMContentLoaded', function () {
    // Initialize EmailJS 
    emailjs.init("oi1LRLkeOCZezCLSp");
    
    const resumeForm = document.getElementById('resumeRequestForm');
    if (resumeForm) {
        resumeForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const emailInput = document.getElementById('resumeEmail');
            const successMsg = document.getElementById('resumeFormSuccess');
            const errorMsg = document.getElementById('resumeFormError');

            // Hide any existing messages
            successMsg.classList.add('d-none');
            errorMsg.classList.add('d-none');

            // Validate email
            const email = emailInput.value.trim();
            if (!isValidEmail(email)) {
                errorMsg.textContent = "Please enter a valid email address.";
                errorMsg.classList.remove('d-none');
                return;
            }

            // Show loading state
            const submitButton = resumeForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitButton.disabled = true;

            // EmailJS parameters
            const templateParams = {
                to_email: email,
                from_name: "Praveen Ganapathy Ravi",
                resume_link: "https://praveenganapathy.github.io/online-resume/PraveenGanapathyRavi_Resume.pdf",
                message: "Thank you for your interest in my portfolio!"
            };

            // Send email using EmailJS
            emailjs.send(
                "service_o5jyuif",        // Service ID
                "template_rer0jo8",       // Template ID
                templateParams            // Template parameters
            )
                .then(function (response) {
                    // Success
                    emailInput.value = '';
                    successMsg.innerHTML = `Thank you! <a href="https://praveenganapathy.github.io/online-resume/PraveenGanapathyRavi_Resume.pdf" target="_blank" class="alert-link">Click here to download my resume</a>`;
                    successMsg.classList.remove('d-none');

                    // Store in localStorage
                    try {
                        localStorage.setItem('resumeRequested', email);
                        localStorage.setItem('resumeRequestedDate', new Date().toISOString());
                    } catch (e) {
                        // console.log('Could not save to localStorage');
                    }

                    // Hide success message after a reasonable time
                    setTimeout(() => {
                        successMsg.classList.add('d-none');
                    }, 15000);
                })
                .catch(function (error) {
                    console.error('Email failed to send:', error);
                    errorMsg.textContent = "Something went wrong. Please try again or contact me directly.";
                    errorMsg.classList.remove('d-none');
                })
                .finally(() => {
                    // Reset button state
                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;
                });
        });
    }
});

// Email validation function
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}

// Lazy load images to improve page speed
document.addEventListener('DOMContentLoaded', function () {
    // Find all images that should be lazy loaded
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Create an intersection observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    // Observe each image
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
});

// Analytics event tracking
function setupAnalyticsTracking() {
    // Skip if gtag isn't available
    if (typeof gtag !== 'function') return;
    
    // Track resume form submissions
    const resumeForm = document.getElementById('resumeRequestForm');
    if (resumeForm) {
        resumeForm.addEventListener('submit', function() {
            gtag('event', 'resume_request', {
                'event_category': 'engagement',
                'event_label': 'Resume Download'
            });
        });
    }
    
    // Track project clicks
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function() {
            const projectTitle = this.querySelector('.project-title').textContent;
            gtag('event', 'view_project', {
                'event_category': 'engagement',
                'event_label': projectTitle
            });
        });
    });
    
    // Track social media clicks
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            gtag('event', 'social_click', {
                'event_category': 'outbound',
                'event_label': platform
            });
        });
    });
    
    // Track section visibility
    setupSectionVisibilityTracking();
}

// Track when sections become visible
function setupSectionVisibilityTracking() {
    // Skip if IntersectionObserver or gtag isn't available
    if (!('IntersectionObserver' in window) || typeof gtag !== 'function') return;
    
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                gtag('event', 'section_view', {
                    'event_category': 'engagement',
                    'event_label': sectionId
                });
                // Only track each section once
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 }); // Trigger when 30% of section is visible
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Track page load performance
function trackPagePerformance() {
    // Skip if gtag or performance timing isn't available
    if (typeof gtag !== 'function' || !window.performance) return;
    
    // Wait for everything to load
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domComplete - perfData.domLoading;
            
            // Send performance data to GA
            gtag('event', 'performance', {
                'event_category': 'timing',
                'event_label': 'page_load',
                'value': Math.round(pageLoadTime),
                'dom_ready': Math.round(domReadyTime)
            });
        }, 0);
    });
}
