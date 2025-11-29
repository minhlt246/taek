// JavaScript Document

/*

TemplateMo 600 Prism Flux

https://templatemo.com/tm-600-prism-flux

*/


// Portfolio data for carousel

const portfolioData = [
    {
        id: 1,
        title: 'Trần Văn Tiến ',
        description: 'Huấn Luyện Viên , trọng tài quốc gia , đạt nhiều giải thưởng quốc tế và quốc gia.',
        image: 'client/images/tt-1.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ', 'Biểu Diễn']
    },
    {
        id: 2,
        title: 'Đoàn Tiến Tân ',
        description: 'Huấn Luyện Viên , trọng tài quốc gia , đạt nhiều giải thưởng quốc tế và quốc gia.',
        image: 'client/images/tt-2.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 3,
        title: 'Nguyễn Nhất Viết Lân ',
        description: 'Huấn Luyện Viên , trọng tài quốc gia , đạt nhiều giải thưởng quốc tế và quốc gia.',
        image: 'client/images/tt-3.jpg',
        tech: ['Đối Kháng ']
    },
    {
        id: 4,
        title: 'Hoàng Lyna Nguyễn ',
        description: 'Huấn Luyện Viên ',
        image: 'client/images/tt-4.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 5,
        title: 'Đào Nguyễn Minh Sang ',
        description: 'Huấn Luyện Viên , Vận Đồng Viên Quyền ',
        image: 'client/images/tt-5.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 6,
        title: 'Nguyễn Phú Vinh  ',
        description: 'Huấn Luyện Viên , Vận Đồng Viên Quyền ',
        image: 'client/images/tt-6.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 7,
        title: 'Bùi Minh Anh ',
        description: 'Huấn Luyện Viên , Vận Đồng Viên Quyền ',
        image: 'client/images/tt-7.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 8,
        title: 'Lê Minh Gia Long ',
        description: 'Huấn Luyện Viên , Vận Đồng Viên Quyền ',
        image: 'client/images/tt-8.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    }
];

// Skills data
const skillsData = [
    { name: 'Đối Kháng ', icon: '🥊', level: 95, category: 'Đối Kháng' },
    { name: 'Quyền Pháp ', icon: '☯️', level: 90, category: 'Quyền Pháp' },
    { name: 'Biểu Diễn ', icon: '🤸‍♂️', level: 88, category: 'Biểu Diễn' },

];

// Scroll to section function
function scrollToSection (sectionId) {
    const section = document.getElementById(sectionId);
    const header = document.getElementById('header');
    if (section) {
        const headerHeight = header.offsetHeight;
        const targetPosition = section.offsetTop - headerHeight;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize particles for philosophy section
function initParticles () {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';

        // Start particles at random vertical positions throughout the section
        particle.style.top = Math.random() * 100 + '%';

        // Random animation delay for natural movement
        particle.style.animationDelay = Math.random() * 20 + 's';

        // Random animation duration for variety
        particle.style.animationDuration = (18 + Math.random() * 8) + 's';

        particlesContainer.appendChild(particle);
    }
}

// Initialize carousel
let currentIndex = 0;

function createCarouselItem (data, index) {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.dataset.index = index;

    const techBadges = data.tech.map(tech =>
        `<span class="tech-badge">${tech}</span>`
    ).join('');

    item.innerHTML = `
                <div class="card">
                    <div class="card-number">0${data.id}</div>
                    <div class="card-image">
                        <img src="${data.image}" alt="${data.title}">
                    </div>
                    <h3 class="card-title">${data.title}</h3>
                    <p class="card-description">${data.description}</p>
                    <div class="card-tech">${techBadges}</div>
                    <button class="card-cta" onclick="scrollToSection('about')">Explore</button>
                </div>
            `;

    return item;
}

function initCarousel () {
    // Re-query elements to ensure they exist
    const carouselEl = document.getElementById('carousel');
    const indicatorsEl = document.getElementById('indicators');

    if (!carouselEl || !indicatorsEl) {
        console.error('Carousel elements not found', {
            carousel: !!carouselEl,
            indicators: !!indicatorsEl
        });
        return;
    }

    console.log('Initializing carousel with', portfolioData.length, 'items');

    // Create carousel items
    portfolioData.forEach((data, index) => {
        const item = createCarouselItem(data, index);
        carouselEl.appendChild(item);

        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsEl.appendChild(indicator);
    });

    console.log('Carousel items created:', carouselEl.children.length);
    updateCarousel();
}

function updateCarousel () {
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const totalItems = items.length;
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;

    items.forEach((item, index) => {
        // Calculate relative position
        let offset = index - currentIndex;

        // Wrap around for continuous rotation - fix logic
        // Normalize offset to range [-totalItems/2, totalItems/2)
        if (offset > totalItems / 2) {
            offset -= totalItems;
        } else if (offset <= -totalItems / 2) {
            offset += totalItems;
        }

        const absOffset = Math.abs(offset);
        const sign = offset < 0 ? -1 : 1;

        // Reset transform
        item.style.transform = '';
        item.style.opacity = '';
        item.style.zIndex = '';
        item.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

        // Adjust spacing based on screen size
        let spacing1 = 400;
        let spacing2 = 600;
        let spacing3 = 750;

        if (isMobile) {
            spacing1 = 280;
            spacing2 = 420;
            spacing3 = 550;
        } else if (isTablet) {
            spacing1 = 340;
            spacing2 = 520;
            spacing3 = 650;
        }

        if (absOffset === 0) {
            // Center item
            item.style.transform = 'translate(-50%, -50%) translateZ(0) scale(1)';
            item.style.opacity = '1';
            item.style.zIndex = '10';
        } else if (absOffset === 1) {
            // Side items (immediate neighbors)
            const translateX = sign * spacing1;
            const rotation = isMobile ? 25 : 30;
            const scale = isMobile ? 0.88 : 0.85;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.8';
            item.style.zIndex = '5';
        } else if (absOffset === 2) {
            // Further side items
            const translateX = sign * spacing2;
            const rotation = isMobile ? 35 : 40;
            const scale = isMobile ? 0.75 : 0.7;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-350px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.5';
            item.style.zIndex = '3';
        } else if (absOffset === 3) {
            // Even further items
            const translateX = sign * spacing3;
            const rotation = isMobile ? 40 : 45;
            const scale = isMobile ? 0.65 : 0.6;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-450px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.3';
            item.style.zIndex = '2';
        } else if (absOffset === 4) {
            // Very far items - still show but more hidden
            const translateX = sign * (spacing3 + 150);
            const rotation = isMobile ? 45 : 50;
            const scale = isMobile ? 0.55 : 0.5;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-500px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.2';
            item.style.zIndex = '1';
        } else {
            // Hidden items (behind)
            item.style.transform = 'translate(-50%, -50%) translateZ(-600px) scale(0.4)';
            item.style.opacity = '0';
            item.style.zIndex = '0';
        }
    });

    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

function nextSlide () {
    currentIndex = (currentIndex + 1) % portfolioData.length;
    updateCarousel();
}

function prevSlide () {
    currentIndex = (currentIndex - 1 + portfolioData.length) % portfolioData.length;
    updateCarousel();
}

function goToSlide (index) {
    currentIndex = index;
    updateCarousel();
}

// Initialize hexagonal skills grid
function initSkillsGrid () {
    const skillsGrid = document.getElementById('skillsGrid');
    const categoryTabs = document.querySelectorAll('.category-tab');

    function displaySkills (category = 'all') {
        skillsGrid.innerHTML = '';

        const filteredSkills = category === 'all'
            ? skillsData
            : skillsData.filter(skill => skill.category === category);

        filteredSkills.forEach((skill, index) => {
            const hexagon = document.createElement('div');
            hexagon.className = 'skill-hexagon';
            hexagon.style.animationDelay = `${index * 0.1}s`;

            hexagon.innerHTML = `
                        <div class="hexagon-inner">
                            <div class="hexagon-content">
                                <div class="skill-icon-hex">${skill.icon}</div>
                                <div class="skill-name-hex">${skill.name}</div>
                                <div class="skill-level">
                                    <div class="skill-level-fill" style="width: ${skill.level}%"></div>
                                </div>
                                <div class="skill-percentage-hex">${skill.level}%</div>
                            </div>
                        </div>
                    `;

            skillsGrid.appendChild(hexagon);
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displaySkills(tab.dataset.category);
        });
    });

    displaySkills();
}

// Initialize everything when DOM is ready
function initializeApp () {
    // Initialize carousel first
    initCarousel();

    // Then set up event listeners after carousel is initialized
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Auto-rotate carousel
    setInterval(nextSlide, 5000);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Update carousel on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel();
        }, 250);
    });

    // Initialize other components
    initSkillsGrid();
    initParticles();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scrolling and active navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
});

// Update active navigation on scroll
function updateActiveNav () {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href').substring(1);
                if (href === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Animated counter for stats
function animateCounter (element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const counter = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for stats animation
const statsSection = document.querySelector('.stats-section');

if (statsSection) {
    // Adjust threshold for mobile devices
    const isMobile = window.innerWidth <= 768;
    const observerOptions = {
        threshold: isMobile ? 0.2 : 0.5, // Lower threshold for mobile
        rootMargin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(number => {
                    if (!number.classList.contains('animated')) {
                        number.classList.add('animated');
                        animateCounter(number);
                    }
                });
                // Unobserve after animation to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(statsSection);

    // Fallback: Trigger animation on scroll for mobile if Intersection Observer fails
    let hasAnimated = false;
    function checkStatsVisibility () {
        if (hasAnimated) return;

        const rect = statsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        // Check if section is visible (at least 20% visible on mobile, 50% on desktop)
        const visibilityThreshold = isMobile ? 0.2 : 0.5;
        const isVisible = rect.top < windowHeight * (1 - visibilityThreshold) &&
            rect.bottom > windowHeight * visibilityThreshold;

        if (isVisible) {
            const statNumbers = statsSection.querySelectorAll('.stat-number');
            statNumbers.forEach(number => {
                if (!number.classList.contains('animated')) {
                    number.classList.add('animated');
                    animateCounter(number);
                }
            });
            hasAnimated = true;
        }
    }

    // Check on scroll and initial load
    window.addEventListener('scroll', checkStatsVisibility, { passive: true });
    checkStatsVisibility(); // Check immediately on load
}

// ============================================
// FORM SUBMISSION - GỬI EMAIL VỚI NODE.JS
// ============================================
// Form sẽ gửi dữ liệu đến endpoint /api/contact trên server Node.js
// Server sẽ xử lý và gửi email đến địa chỉ đã cấu hình

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message')
        };

        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;

        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';

        try {
            console.log('Sending form data to /api/contact');
            console.log('Form data:', data);

            // Send form data to Node.js backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);

            // Parse response
            const result = await response.json();

            console.log('Response result:', result);

            // Check if successful
            if (response.ok && result.success) {
                // Show success message
                alert(`Cảm ơn ${data.name}! Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi trong vòng 24 giờ.`);

                // Reset form
                contactForm.reset();
            } else {
                // Handle errors
                throw new Error(result.message || 'Không thể gửi email. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });

            // Show error message
            let errorMsg = 'Có lỗi xảy ra khi gửi tin nhắn.\n\n';

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMsg += 'Vấn đề: Không thể kết nối đến server.\n';
                errorMsg += 'Giải pháp: Vui lòng kiểm tra kết nối internet và đảm bảo server đang chạy.';
            } else {
                errorMsg += error.message || 'Vui lòng thử lại sau hoặc liên hệ trực tiếp qua email/điện thoại.';
            }

            alert(errorMsg);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Loading screen - Multiple strategies to ensure loader is hidden
function hideLoader () {
    const loader = document.getElementById('loader');
    if (loader && !loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
    }
}

// Strategy 1: Wait for window load event
window.addEventListener('load', () => {
    setTimeout(hideLoader, 1500);
});

// Strategy 2: Check if DOM is already ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(hideLoader, 1500);
} else {
    // Strategy 3: Wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(hideLoader, 1500);
    });
}

// Strategy 4: Fallback timeout to ensure loader is always hidden
setTimeout(hideLoader, 3000);

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});