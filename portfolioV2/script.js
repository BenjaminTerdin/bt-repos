document.addEventListener("DOMContentLoaded", function () {
    const menu = document.querySelector(".mobile-menu");
    const hamburger = document.querySelector(".hamburger-menu");
    const header = document.querySelector(".header");

    // Toggle mobile menu
    hamburger.addEventListener("click", function () {
        menu.classList.toggle("active");
        hamburger.classList.toggle("active");
    });

    // Close menu when clicking a link
    document.querySelectorAll(".mobile-menu a").forEach(link => {
        link.addEventListener("click", function () {
            menu.classList.remove("active");
            hamburger.classList.remove("active");
        });
    });

    // Add background to header on scroll
    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
});
