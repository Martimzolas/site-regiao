const topBtn = document.getElementById("topBtn");
const scrollProgress = document.getElementById("scrollProgress");
const navLinks = document.querySelectorAll(".sticky-nav a");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");

function setRevealDirections() {
    revealItems.forEach((item) => {
        const direction = item.dataset.reveal;
        if (direction === "left") item.classList.add("reveal-left");
        if (direction === "right") item.classList.add("reveal-right");
    });
}

function setupRevealOnScroll() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    revealItems.forEach((item) => observer.observe(item));
}

function smoothNavLinks() {
    const nav = document.getElementById("mainNav");
    const navHeight = nav ? nav.offsetHeight : 0;

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 2;
            window.scrollTo({ top, behavior: "smooth" });
        });
    });
}

function updateScrollElements() {
    const scrollTop = window.scrollY;
    const pageHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = pageHeight > 0 ? (scrollTop / pageHeight) * 100 : 0;

    if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    if (topBtn) topBtn.classList.toggle("show", scrollTop > 450);
}

function markActiveSection() {
    let activeId = "";
    sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 120) activeId = section.id;
    });

    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
}

if (topBtn) {
    topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

window.addEventListener("scroll", () => {
    updateScrollElements();
    markActiveSection();
});

setRevealDirections();
setupRevealOnScroll();
smoothNavLinks();
updateScrollElements();
markActiveSection();