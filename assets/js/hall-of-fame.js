const gallery = document.querySelector(".hall-of-fame-gallery");
const slides = [...gallery.querySelectorAll("figure")];
const slideButtons = [...document.querySelectorAll("[data-slide-to]")];
const mobileLayout = window.matchMedia("(max-width: 600px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeSlide = 0;
let autoplay;

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeSlide;
    slide.hidden = mobileLayout.matches && !isActive;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(mobileLayout.matches && !isActive));
  });

  slideButtons.forEach((button, buttonIndex) => {
    button.setAttribute("aria-pressed", String(buttonIndex === activeSlide));
  });
}

function updateLayout() {
  showSlide(activeSlide);
  clearInterval(autoplay);

  if (mobileLayout.matches && !reducedMotion.matches && slides.length > 1) {
    autoplay = setInterval(() => showSlide(activeSlide + 1), 5000);
  }
}

slideButtons.forEach(button => {
  button.addEventListener("click", () => showSlide(Number(button.dataset.slideTo)));
});

mobileLayout.addEventListener("change", updateLayout);
reducedMotion.addEventListener("change", updateLayout);
updateLayout();
